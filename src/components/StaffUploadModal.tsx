import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { StaffImportResult } from '../types';
import { storageService } from '../services/storageService';
import { UploadCloud, FileSpreadsheet, Info, CheckCircle2, AlertTriangle, AlertCircle, X, Download, RefreshCw, FileText } from 'lucide-react';

interface StaffUploadModalProps {
  storeId: string;
  branchName: string;
  onClose: () => void;
  onSuccess: (result: StaffImportResult) => void;
}

interface ParsedRow {
  rowNumber: number;
  name: string;
  position: string;
  cccd: string;
  employeeCode?: string;
  status: 'VALID' | 'DUPLICATE' | 'ERROR';
  errorReason?: string;
}

export const StaffUploadModal: React.FC<StaffUploadModalProps> = ({
  storeId,
  branchName,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States
  const [showInfo, setShowInfo] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [duplicateMode, setDuplicateMode] = useState<'SKIP_EXISTING' | 'UPDATE_EXISTING'>('SKIP_EXISTING');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<StaffImportResult | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // 1. Tải file mẫu CSV
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      '\uFEFF' + // UTF-8 BOM để Excel hiển thị đúng dấu tiếng Việt
      'Họ tên nhân viên,Chức vụ,CCCD,Mã nhân viên\n' +
      'Nguyễn Văn A,Pha chế,001099012345,NV-1001\n' +
      'Trần Thị B,Thu ngân,001099012346,NV-1002\n' +
      'Lê Hoàng C,Phục vụ,001099012347,NV-1003\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'mau_danh_sach_nhan_su.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. Tải file mẫu XLSX
  const handleDownloadXlsxTemplate = () => {
    const data = [
      {
        'Họ tên nhân viên': 'Nguyễn Văn A',
        'Chức vụ': 'Pha chế',
        'CCCD': '001099012345',
        'Mã nhân viên': 'NV-1001',
      },
      {
        'Họ tên nhân viên': 'Trần Thị B',
        'Chức vụ': 'Thu ngân',
        'CCCD': '001099012346',
        'Mã nhân viên': 'NV-1002',
      },
      {
        'Họ tên nhân viên': 'Lê Hoàng C',
        'Chức vụ': 'Phục vụ',
        'CCCD': '001099012347',
        'Mã nhân viên': 'NV-1003',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'NhanSu');
    XLSX.writeFile(workbook, 'mau_danh_sach_nhan_su.xlsx');
  };

  // 3. Đọc và Kiểm tra file (Không tự ý ghi dữ liệu)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const ext = selectedFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'xls') {
      setParseError('Định dạng tệp không được hỗ trợ. Vui lòng chọn tệp .xlsx hoặc .csv.');
      return;
    }

    setFile(selectedFile);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary', raw: false }); // raw: false để giữ chuỗi có số 0 đầu
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Đọc dữ liệu dạng mảng object
        const jsonData = XLSX.utils.sheet_to_json<any>(ws, { raw: false });

        if (jsonData.length === 0) {
          setParseError('Tệp không có dữ liệu nhân sự.');
          setRows([]);
          return;
        }

        const existingStaff = storageService.getStaffList(storeId);
        const parsed: ParsedRow[] = [];
        const seenCccdInFile = new Set<string>();

        jsonData.forEach((row, idx) => {
          const rowNum = idx + 2; // Dòng 1 là tiêu đề

          // Lấy các trường hỗ trợ cả tiếng Việt và không dấu/tiếng Anh
          const name = String(row['Họ tên nhân viên'] || row['Ho va ten'] || row['Name'] || '').trim();
          const position = String(row['Chức vụ'] || row['Chuc vu'] || row['Position'] || row['Role'] || '').trim();
          
          // Giữ nguyên chuỗi để không mất số 0 đầu
          let cccd = String(row['CCCD'] || row['So CCCD'] || row['ID'] || '').trim();
          const employeeCode = String(row['Mã nhân viên'] || row['Ma NV'] || row['Code'] || '').trim() || undefined;

          // Kiểm tra lỗi hợp lệ
          let status: 'VALID' | 'DUPLICATE' | 'ERROR' = 'VALID';
          let errorReason = '';

          if (!name) {
            status = 'ERROR';
            errorReason = 'Thiếu Họ tên nhân viên';
          } else if (!position) {
            status = 'ERROR';
            errorReason = 'Thiếu Chức vụ';
          } else if (!cccd) {
            status = 'ERROR';
            errorReason = 'Thiếu số CCCD';
          } else if (seenCccdInFile.has(cccd)) {
            status = 'ERROR';
            errorReason = 'Số CCCD bị trùng lặp trong tệp';
          } else {
            seenCccdInFile.add(cccd);

            // Kiểm tra trùng với nhân sự đã có trong hệ thống cửa hàng
            const isExist = existingStaff.some(
              (s) => s.cccd === cccd || (employeeCode && s.employeeCode.toUpperCase() === employeeCode.toUpperCase())
            );
            if (isExist) {
              status = 'DUPLICATE';
              errorReason = 'Nhân sự đã có trong hệ thống';
            }
          }

          parsed.push({
            rowNumber: rowNum,
            name,
            position,
            cccd,
            employeeCode,
            status,
            errorReason,
          });
        });

        setRows(parsed);
      } catch (err: any) {
        setParseError(`Lỗi đọc tệp: ${err.message}`);
      }
    };

    reader.readAsBinaryString(selectedFile);
  };

  // 4. Xác nhận nhập danh sách vào hệ thống
  const handleConfirmImport = () => {
    if (rows.length === 0) return;

    setIsProcessing(true);

    const validRows = rows.filter((r) => r.status === 'VALID' || r.status === 'DUPLICATE');
    const importPayload = validRows.map((r) => ({
      name: r.name,
      position: r.position,
      cccd: r.cccd,
      employeeCode: r.employeeCode,
    }));

    const result = storageService.importStaffBatch(storeId, branchName, importPayload, duplicateMode);

    const fullResult: StaffImportResult = {
      total: rows.length,
      valid: validRows.length,
      added: result.added,
      updated: result.updated,
      skipped: result.skipped,
      errors: rows.filter((r) => r.status === 'ERROR').length,
    };

    setIsProcessing(false);
    setImportResult(fullResult);
    onSuccess(fullResult);
  };

  const validCount = rows.filter((r) => r.status === 'VALID').length;
  const duplicateCount = rows.filter((r) => r.status === 'DUPLICATE').length;
  const errorCount = rows.filter((r) => r.status === 'ERROR').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              Danh sách nhân sự trong công ty bạn
            </h3>
            {/* Nút ⓘ hướng dẫn */}
            <button
              type="button"
              onClick={() => setShowInfo((prev) => !prev)}
              className="p-1 rounded-full text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              title="Xem hướng dẫn định dạng file"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bảng Hướng Dẫn khi bấm ⓘ */}
        {showInfo && (
          <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/60 text-xs space-y-2.5 animate-fade-in">
            <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Quy định định dạng tệp tải lên:</span>
            </div>

            <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1 pl-1">
              <li>
                <strong>Định dạng hỗ trợ:</strong> tệp Excel (<code>.xlsx</code>) hoặc tệp <code>.csv</code> (mã hóa UTF-8).
              </li>
              <li>
                <strong>Các cột bắt buộc:</strong>
                <ul className="list-none pl-4 pt-0.5 space-y-0.5 text-[11px]">
                  <li>• <strong>Họ tên nhân viên</strong> (Bắt buộc)</li>
                  <li>• <strong>Chức vụ</strong> (Bắt buộc, ví dụ: Pha chế, Thu ngân, Phục vụ...)</li>
                  <li>• <strong>CCCD</strong> (Bắt buộc, hệ thống giữ nguyên chuỗi để không mất số 0 ở đầu)</li>
                </ul>
              </li>
              <li>
                <strong>Cột tùy chọn:</strong> <strong>Mã nhân viên</strong> (nếu để trống, hệ thống sẽ tự sinh mã NV).
              </li>
            </ul>

            {/* Nút tải tệp mẫu */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tải tệp mẫu (.CSV)</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadXlsxTemplate}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-50 text-[11px]"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tải tệp mẫu (.XLSX)</span>
              </button>
            </div>
          </div>
        )}

        {/* Body Container */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* File Picker Zone */}
          {!importResult && (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors bg-slate-50/50 dark:bg-slate-800/20">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />

              <UploadCloud className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400 mb-2" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                {file ? file.name : 'Chọn tệp danh sách nhân sự từ máy tính'}
              </h4>
              <p className="text-slate-500 text-[11px] mb-3">
                Hỗ trợ tệp <strong>.xlsx</strong> hoặc <strong>.csv</strong>. Tệp không được gửi ra ngoài máy chủ.
              </p>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                {file ? 'Chọn tệp khác' : 'Tải danh sách nhân sự lên'}
              </button>
            </div>
          )}

          {/* Error Reading File */}
          {parseError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Summary Counts Bar */}
          {rows.length > 0 && !importResult && (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="text-slate-500 block text-[10px]">Tổng số dòng</span>
                <strong className="text-sm text-slate-900 dark:text-white">{rows.length}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                <span className="block text-[10px]">Hợp lệ</span>
                <strong className="text-sm">{validCount}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">
                <span className="block text-[10px]">Đã tồn tại</span>
                <strong className="text-sm">{duplicateCount}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                <span className="block text-[10px]">Dòng lỗi</span>
                <strong className="text-sm">{errorCount}</strong>
              </div>
            </div>
          )}

          {/* Options for duplicate staff */}
          {duplicateCount > 0 && !importResult && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/60 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Phát hiện {duplicateCount} nhân sự đã tồn tại trong hệ thống:</span>
              </div>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="dupMode"
                    value="SKIP_EXISTING"
                    checked={duplicateMode === 'SKIP_EXISTING'}
                    onChange={() => setDuplicateMode('SKIP_EXISTING')}
                  />
                  <span>Bỏ qua nhân sự đã có</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                  <input
                    type="radio"
                    name="dupMode"
                    value="UPDATE_EXISTING"
                    checked={duplicateMode === 'UPDATE_EXISTING'}
                    onChange={() => setDuplicateMode('UPDATE_EXISTING')}
                  />
                  <span>Cập nhật thông tin nhân sự đã có</span>
                </label>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {rows.length > 0 && !importResult && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 w-12 text-center">Dòng</th>
                    <th className="p-2">Họ và tên</th>
                    <th className="p-2">Chức vụ</th>
                    <th className="p-2">Số CCCD</th>
                    <th className="p-2">Mã NV</th>
                    <th className="p-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((r) => (
                    <tr
                      key={r.rowNumber}
                      className={
                        r.status === 'ERROR'
                          ? 'bg-rose-50/40 dark:bg-rose-950/20'
                          : r.status === 'DUPLICATE'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20'
                          : ''
                      }
                    >
                      <td className="p-2 text-center text-slate-400">{r.rowNumber}</td>
                      <td className="p-2 font-semibold text-slate-900 dark:text-white">
                        {r.name || <span className="text-rose-500 italic">(Trống)</span>}
                      </td>
                      <td className="p-2">{r.position || <span className="text-rose-500 italic">(Trống)</span>}</td>
                      <td className="p-2 font-mono">{r.cccd || <span className="text-rose-500 italic">(Trống)</span>}</td>
                      <td className="p-2">{r.employeeCode || <span className="text-slate-400 italic">Tự sinh</span>}</td>
                      <td className="p-2">
                        {r.status === 'VALID' ? (
                          <span className="text-emerald-600 font-bold">Hợp lệ</span>
                        ) : r.status === 'DUPLICATE' ? (
                          <span className="text-amber-600 font-bold">Đã có</span>
                        ) : (
                          <span className="text-rose-600 font-bold" title={r.errorReason}>
                            Lỗi ({r.errorReason})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Import Result Screen */}
          {importResult && (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-extrabold text-base text-emerald-950 dark:text-emerald-200">
                Nhập danh sách nhân sự thành công!
              </h4>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border">
                  <span className="text-slate-500 block text-[10px]">Thêm mới</span>
                  <strong className="text-emerald-600 text-sm">+{importResult.added}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border">
                  <span className="text-slate-500 block text-[10px]">Cập nhật</span>
                  <strong className="text-blue-600 text-sm">{importResult.updated}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border">
                  <span className="text-slate-500 block text-[10px]">Bỏ qua</span>
                  <strong className="text-slate-600 text-sm">{importResult.skipped}</strong>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border">
                  <span className="text-slate-500 block text-[10px]">Dòng lỗi</span>
                  <strong className="text-rose-600 text-sm">{importResult.errors}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Nhân sự hiện có không xuất hiện trong file vẫn được giữ nguyên an toàn.
              </p>
            </div>
          )}
        </div>

        {/* Footer Confirmation */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {importResult ? 'Đóng' : 'Hủy bỏ'}
          </button>

          {!importResult && rows.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isProcessing || (validCount === 0 && duplicateCount === 0)}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 disabled:bg-slate-400"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang nhập...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Xác nhận nhập ({validCount + (duplicateMode === 'UPDATE_EXISTING' ? duplicateCount : 0)} nhân sự)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
