import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGE_NAMES } from '../i18n';
import { Employee, Language, Theme, StaffImportResult } from '../types';
import { storageService } from '../services/storageService';
import { StaffUploadModal } from './StaffUploadModal';
import { 
  Settings, 
  Globe, 
  Moon, 
  Sun, 
  Monitor, 
  Database, 
  BookOpen, 
  LogOut, 
  Check, 
  Plus, 
  Search, 
  Edit3, 
  Eye, 
  EyeOff, 
  X, 
  FileSpreadsheet, 
  Store, 
  Users 
} from 'lucide-react';

interface ManagerSettingsModalProps {
  onClose: () => void;
}

export const ManagerSettingsModal: React.FC<ManagerSettingsModalProps> = ({ onClose }) => {
  const { user, language, setLanguage, logout, t } = useAuth();
  const { theme, setTheme } = useTheme();

  // Tabs: LANGUAGE | THEME | DATA | GUIDE
  const [tab, setTab] = useState<'DATA' | 'LANGUAGE' | 'THEME' | 'GUIDE'>('DATA');

  // Mục C: Dữ liệu cửa hàng & Quản lý
  const [storeName, setStoreName] = useState<string>(user?.storeName || 'TEAYOO');
  const [branchName, setBranchName] = useState<string>(user?.branchName || 'Chi nhánh 1');
  const [managerName, setManagerName] = useState<string>(user?.name || 'Trần Hoàng');
  const [storeSaveMsg, setStoreSaveMsg] = useState<string | null>(null);

  // Danh sách nhân sự
  const [staffList, setStaffList] = useState<Employee[]>(() =>
    user ? storageService.getStaffList(user.storeId) : []
  );
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [showAddStaffForm, setShowAddStaffForm] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [unmaskedCccdId, setUnmaskedCccdId] = useState<string | null>(null);

  // Form thêm nhân viên lẻ
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffPosition, setNewStaffPosition] = useState<string>('Pha chế');
  const [newStaffCccd, setNewStaffCccd] = useState<string>('');
  const [newStaffCode, setNewStaffCode] = useState<string>('');
  const [staffAddError, setStaffAddError] = useState<string | null>(null);

  // Form sửa nhân viên
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editPosition, setEditPosition] = useState<string>('');
  const [editCode, setEditCode] = useState<string>('');

  // Lưu thông tin Cửa hàng / Quản lý
  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    storageService.updateStoreInfo({
      managerId: user.id,
      storeName,
      branchName,
      managerName,
    });
    setStoreSaveMsg('Đã lưu thông tin cửa hàng thành công!');
    setTimeout(() => setStoreSaveMsg(null), 3000);
  };

  // Thêm nhân viên mới
  const handleAddSingleStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newStaffName.trim() || !newStaffPosition.trim() || !newStaffCccd.trim()) {
      setStaffAddError('Vui lòng điền đủ Họ tên, Chức vụ và CCCD.');
      return;
    }

    const res = storageService.addSingleStaff(user.storeId, branchName, {
      name: newStaffName,
      position: newStaffPosition,
      cccd: newStaffCccd,
      employeeCode: newStaffCode,
    });

    if (res.success) {
      setStaffList(storageService.getStaffList(user.storeId));
      setNewStaffName('');
      setNewStaffCccd('');
      setNewStaffCode('');
      setShowAddStaffForm(false);
      setStaffAddError(null);
    } else {
      setStaffAddError(res.error || 'Lỗi thêm nhân viên');
    }
  };

  // Sửa nhân viên
  const handleSaveEditStaff = (staffId: string) => {
    storageService.updateSingleStaff(staffId, {
      name: editName,
      position: editPosition,
      employeeCode: editCode,
    });
    if (user) {
      setStaffList(storageService.getStaffList(user.storeId));
    }
    setEditingStaffId(null);
  };

  // Đăng xuất an toàn
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi quyền Chủ quản?')) {
      onClose();
      logout();
      window.location.replace('/');
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchKeyword.trim().toLowerCase();
    return s.name.toLowerCase().includes(q) || s.employeeCode.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col h-[650px] max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Cài Đặt Dành Cho Chủ Quản
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Quản lý dữ liệu đơn vị, ngôn ngữ, giao diện & hướng dẫn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/20 px-5 pt-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setTab('DATA')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'DATA'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Dữ liệu Cửa hàng & Nhân sự</span>
          </button>

          <button
            onClick={() => setTab('LANGUAGE')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'LANGUAGE'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Ngôn ngữ (5 thứ tiếng)</span>
          </button>

          <button
            onClick={() => setTab('THEME')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'THEME'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Giao diện</span>
          </button>

          <button
            onClick={() => setTab('GUIDE')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 border-b-2 transition-colors whitespace-nowrap ${
              tab === 'GUIDE'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Hướng dẫn quản lý</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
          {/* TAB C: DỮ LIỆU CỬA HÀNG & NHÂN SỰ */}
          {tab === 'DATA' && (
            <div className="space-y-6">
              {/* Form Sửa thông tin cửa hàng */}
              <form onSubmit={handleSaveStoreInfo} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                  <Store className="w-4 h-4 text-purple-600" />
                  <span>Thông tin Cửa hàng & Quản lý:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Tên cửa hàng:</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Tên / Số chi nhánh:</label>
                    <input
                      type="text"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">Họ tên quản lý:</label>
                    <input
                      type="text"
                      value={managerName}
                      onChange={(e) => setManagerName(e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                    />
                  </div>
                </div>

                {storeSaveMsg && (
                  <p className="text-emerald-600 font-bold text-[11px]">{storeSaveMsg}</p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    Lưu thông tin cửa hàng
                  </button>
                </div>
              </form>

              {/* Danh sách nhân sự */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <strong className="text-slate-900 dark:text-white font-bold">
                      Danh sách nhân sự ({staffList.length} nhân viên)
                    </strong>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddStaffForm((prev) => !prev)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-slate-700 dark:text-slate-300 text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm nhân viên lẻ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowUploadModal(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-sm"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Nhập file Excel/CSV</span>
                    </button>
                  </div>
                </div>

                {/* Form thêm lẻ nếu bật */}
                {showAddStaffForm && (
                  <form onSubmit={handleAddSingleStaff} className="p-3.5 rounded-2xl border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 space-y-2.5">
                    <div className="font-bold text-purple-900 dark:text-purple-300 text-[11px]">
                      Thêm mới một nhân viên vào chi nhánh:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        placeholder="Họ tên nhân viên *"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                        required
                        className="p-2 rounded-lg border bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Chức vụ (Pha chế, Thu ngân...)"
                        value={newStaffPosition}
                        onChange={(e) => setNewStaffPosition(e.target.value)}
                        required
                        className="p-2 rounded-lg border bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Số CCCD (giữ số 0) *"
                        value={newStaffCccd}
                        onChange={(e) => setNewStaffCccd(e.target.value)}
                        required
                        className="p-2 rounded-lg border bg-white dark:bg-slate-800 font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Mã NV (tùy chọn)"
                        value={newStaffCode}
                        onChange={(e) => setNewStaffCode(e.target.value)}
                        className="p-2 rounded-lg border bg-white dark:bg-slate-800"
                      />
                    </div>

                    {staffAddError && (
                      <p className="text-rose-500 font-bold text-[11px]">{staffAddError}</p>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddStaffForm(false)}
                        className="px-3 py-1.5 rounded-lg border text-slate-600"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold"
                      >
                        Lưu nhân viên
                      </button>
                    </div>
                  </form>
                )}

                {/* Ô tìm kiếm nhân viên */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Tìm kiếm nhân sự theo họ tên hoặc mã nhân viên..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800"
                  />
                </div>

                {/* Danh sách nhân viên */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-56 overflow-y-auto">
                  {filteredStaff.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">Không tìm thấy nhân sự phù hợp.</div>
                  ) : (
                    filteredStaff.map((staff) => (
                      <div key={staff.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between">
                        {editingStaffId === staff.id ? (
                          <div className="flex-1 flex gap-2 items-center mr-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="p-1 rounded border text-xs"
                            />
                            <input
                              type="text"
                              value={editPosition}
                              onChange={(e) => setEditPosition(e.target.value)}
                              className="p-1 rounded border text-xs w-28"
                            />
                            <input
                              type="text"
                              value={editCode}
                              onChange={(e) => setEditCode(e.target.value)}
                              className="p-1 rounded border text-xs w-24"
                            />
                            <button
                              onClick={() => handleSaveEditStaff(staff.id)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded font-bold"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingStaffId(null)}
                              className="px-2 py-1 border rounded"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <strong className="text-slate-900 dark:text-white font-bold">{staff.name}</strong>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold">
                                {staff.employeeCode}
                              </span>
                              <span className="text-slate-500">• {staff.position || 'Nhân viên'}</span>
                            </div>

                            {/* Che bớt CCCD, bấm mắt để mở */}
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <span>CCCD:</span>
                              <span className="font-mono text-slate-600 dark:text-slate-300">
                                {unmaskedCccdId === staff.id ? staff.cccd : staff.displayCccd}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setUnmaskedCccdId(unmaskedCccdId === staff.id ? null : staff.id)
                                }
                                className="text-slate-400 hover:text-purple-600"
                                title={unmaskedCccdId === staff.id ? 'Che CCCD' : 'Xem đầy đủ CCCD'}
                              >
                                {unmaskedCccdId === staff.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {editingStaffId !== staff.id && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStaffId(staff.id);
                              setEditName(staff.name);
                              setEditPosition(staff.position || '');
                              setEditCode(staff.employeeCode);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-100"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB A: NGÔN NGỮ */}
          {tab === 'LANGUAGE' && (
            <div className="space-y-3">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                Chọn ngôn ngữ hiển thị (Đồng bộ toàn bộ giao diện):
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(LANGUAGE_NAMES) as Language[]).map((langKey) => (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => setLanguage(langKey)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      language === langKey
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>
                      {LANGUAGE_NAMES[langKey].flag} {LANGUAGE_NAMES[langKey].label}
                    </span>
                    {language === langKey && <Check className="w-4 h-4 text-purple-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB B: GIAO DIỆN SÁNG / TỐI / THEO HỆ THỐNG */}
          {tab === 'THEME' && (
            <div className="space-y-3">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                Chế độ giao diện (Lưu giữ sau khi đóng/mở lại app):
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'light', label: 'Sáng', icon: Sun },
                  { id: 'dark', label: 'Tối', icon: Moon },
                  { id: 'system', label: 'Theo hệ thống', icon: Monitor },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTheme(item.id as Theme)}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB D: HƯỚNG DẪN SỬ DỤNG DÀNH CHO QUẢN LÝ */}
          {tab === 'GUIDE' && (
            <div className="space-y-3 leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-purple-700 dark:text-purple-300">
                  1. Đăng nhập và Bảo mật Tài khoản
                </h4>
                <p>
                  Chủ quản đăng nhập bằng Mã định danh chủ quản và mật khẩu riêng do bạn thiết lập. Luôn bảo mật mật khẩu của bạn và sử dụng nút Hộp quà để kiểm tra ký tự khi gõ.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-purple-700 dark:text-purple-300">
                  2. Quản lý Nhân sự & Nhập File
                </h4>
                <p>
                  Vào mục Dữ liệu để thêm nhân viên hoặc nhập file danh sách Excel (.xlsx) / CSV. Định dạng cần các cột: Họ tên nhân viên, Chức vụ, CCCD và Mã nhân viên. Số CCCD luôn được lưu giữ nguyên chuỗi (kể cả số 0 ở đầu).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-purple-700 dark:text-purple-300">
                  3. Theo dõi Chấm công & Duyệt Tăng ca
                </h4>
                <p>
                  Tab "Theo dõi Chấm công" cập nhật dữ liệu tự động ngay khi nhân viên bấm Vào ca hoặc Tan ca bằng camera và GPS. Mọi đơn tăng ca cần được Chủ quản bấm phê duyệt thì hệ thống mới ghi nhận vào lương tháng.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-sm text-purple-700 dark:text-purple-300">
                  4. Hỗ trợ & Khung Chat Quên Mật Khẩu
                </h4>
                <p>
                  Khi nhân viên quên mật khẩu hoặc mã tra cứu, họ sẽ gửi yêu cầu qua khung chat. Tại tab "Chat & Quên mật khẩu", bạn chỉ cần bấm nút "Phê duyệt & Đặt lại mật khẩu" để cấp lại mã TEAYOO cho nhân viên.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Nút Đăng Xuất An Toàn */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold hover:bg-rose-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất phiên Chủ quản</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold hover:bg-slate-300 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Modal Upload Nhân sự nếu bấm từ Cài đặt */}
      {showUploadModal && user && (
        <StaffUploadModal
          storeId={user.storeId}
          branchName={branchName}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(res: StaffImportResult) => {
            setStaffList(storageService.getStaffList(user.storeId));
          }}
        />
      )}
    </div>
  );
};
