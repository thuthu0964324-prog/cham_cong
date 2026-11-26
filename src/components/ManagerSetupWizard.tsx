import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { GiftPasswordInput } from './GiftPasswordInput';
import { StaffUploadModal } from './StaffUploadModal';
import { StaffImportResult } from '../types';
import { Store, ShieldCheck, KeyRound, Users, CheckCircle2, ArrowRight, ArrowLeft, Info, FileSpreadsheet } from 'lucide-react';

interface ManagerSetupWizardProps {
  onComplete: () => void;
}

export const ManagerSetupWizard: React.FC<ManagerSetupWizardProps> = ({ onComplete }) => {
  const { user } = useAuth();

  const [step, setStep] = useState<number>(1);

  // Bước 1: Thông tin cửa hàng & quản lý
  const [storeName, setStoreName] = useState<string>(user?.storeName || 'TEAYOO');
  const [branchName, setBranchName] = useState<string>(user?.branchName || 'Chi nhánh 1');
  const [managerName, setManagerName] = useState<string>(user?.name || 'Trần Hoàng');
  const [step1Errors, setStep1Errors] = useState<{ storeName?: string; branchName?: string; managerName?: string }>({});

  // Bước 2: Đổi mật khẩu lần đầu
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Bước 3: Nhân sự
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showStaffInfo, setShowStaffInfo] = useState<boolean>(false);
  const [importedStaffCount, setImportedStaffCount] = useState<number>(0);

  // Bước 4: Hoàn tất
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate Bước 1
  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { storeName?: string; branchName?: string; managerName?: string } = {};
    if (!storeName.trim()) errors.storeName = 'Vui lòng nhập Tên cửa hàng.';
    if (!branchName.trim()) errors.branchName = 'Vui lòng nhập Tên hoặc số chi nhánh.';
    if (!managerName.trim()) errors.managerName = 'Vui lòng nhập Họ tên quản lý.';

    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors);
      return;
    }

    setStep1Errors({});
    setStep(2);
  };

  // Validate Bước 2
  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6 || newPassword.length > 64 || /\s/.test(newPassword)) {
      setPasswordError('Mật khẩu mới phải từ 6 đến 64 ký tự và không chứa khoảng trắng.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu không khớp.');
      return;
    }

    setPasswordError(null);
    setStep(3);
  };

  // Hoàn tất toàn bộ
  const handleFinishSetup = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await new Promise((r) => setTimeout(r, 600));

      const ok = storageService.completeManagerSetup({
        managerId: user.id,
        storeName,
        branchName,
        managerName,
        newPassword,
      });

      if (ok) {
        onComplete();
      } else {
        setSubmitError('Lỗi cập nhật thiết lập trên hệ thống. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Lỗi hệ thống');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 dark:bg-slate-950 px-4 py-8 flex flex-col justify-center items-center">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Header Progress Wizard */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-6 text-white text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Thiết lập thông tin quản lý (Lần đầu đăng nhập)</span>
          </div>
          <h2 className="text-xl font-extrabold">Chào mừng Chủ quản đến với hệ thống</h2>
          <p className="text-xs text-purple-200 mt-1">
            Vui lòng hoàn tất 4 bước thiết lập ban đầu để kích hoạt hệ thống cho cửa hàng của bạn.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s
                      ? 'bg-white text-purple-700 shadow-md scale-110'
                      : step > s
                      ? 'bg-purple-400/80 text-white'
                      : 'bg-white/20 text-purple-200'
                  }`}
                >
                  {step > s ? '✓' : s}
                </div>
                {s < 4 && <div className={`w-6 h-0.5 ${step > s ? 'bg-purple-300' : 'bg-white/20'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 text-xs">
          {/* BƯỚC 1: THÔNG TIN CỬA HÀNG VÀ QUẢN LÝ */}
          {step === 1 && (
            <form onSubmit={handleNextStep1} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Store className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Bước 1: Thông tin Cửa hàng & Quản lý
                </h3>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên cửa hàng / thương hiệu: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Ví dụ: TEAYOO, Cà phê Sài Gòn..."
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                />
                {step1Errors.storeName && (
                  <p className="text-rose-500 text-[11px] mt-1">{step1Errors.storeName}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên hoặc số chi nhánh: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="Ví dụ: Chi nhánh 1, Chi nhánh Trung tâm..."
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                />
                {step1Errors.branchName && (
                  <p className="text-rose-500 text-[11px] mt-1">{step1Errors.branchName}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ tên quản lý / chủ quản: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="Nhập họ và tên đầy đủ của bạn"
                  required
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                />
                {step1Errors.managerName && (
                  <p className="text-rose-500 text-[11px] mt-1">{step1Errors.managerName}</p>
                )}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Tiếp tục: Đổi mật khẩu</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* BƯỚC 2: ĐỔI MẬT KHẨU LẦN ĐẦU BẰNG HỘP QUÀ */}
          {step === 2 && (
            <form onSubmit={handleNextStep2} className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <KeyRound className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Bước 2: Đổi Mật Khẩu Khởi Tạo (Bắt buộc)
                </h3>
              </div>

              <p className="text-slate-500 dark:text-slate-400">
                Để bảo vệ an toàn cho hệ thống cửa hàng, bạn cần thay đổi mật khẩu mặc định ban đầu sang mật khẩu riêng của bạn (từ 6–64 ký tự, không dấu cách).
              </p>

              <GiftPasswordInput
                label="Mật khẩu mới:"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                required
              />

              <GiftPasswordInput
                label="Xác nhận mật khẩu mới:"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới vừa đặt"
                required
              />

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-medium">
                  {passwordError}
                </div>
              )}

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span>Tiếp tục: Danh sách nhân sự</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* BƯỚC 3: TẢI DANH SÁCH NHÂN SỰ */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Bước 3: Tải Lên Danh Sách Nhân Sự
                </h3>
              </div>

              {/* Dòng tiêu đề theo đúng yêu cầu: "Danh sách nhân sự trong công ty bạn" kèm ⓘ */}
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-purple-950 dark:text-purple-200">
                      Danh sách nhân sự trong công ty bạn
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStaffInfo((prev) => !prev)}
                      className="p-1 rounded-full text-purple-600 hover:text-purple-800 dark:text-purple-400"
                      title="Xem hướng dẫn cột file"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </div>

                  {importedStaffCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      Đã nạp {importedStaffCount} nhân sự
                    </span>
                  )}
                </div>

                <p className="text-slate-600 dark:text-slate-300">
                  Bạn có thể tải ngay tệp danh sách nhân sự (Excel / CSV) để cấp mã chấm công cho nhân viên, hoặc bấm <strong>"Bổ sung sau"</strong> để cập nhật trong Cài đặt.
                </p>

                {showStaffInfo && (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] space-y-1">
                    <div className="font-bold text-purple-800 dark:text-purple-300">Cột bắt buộc trong file:</div>
                    <div>• <strong>Họ tên nhân viên</strong> (Bắt buộc)</div>
                    <div>• <strong>Chức vụ</strong> (Bắt buộc)</div>
                    <div>• <strong>CCCD</strong> (Bắt buộc, giữ nguyên số 0 đầu)</div>
                    <div>• <strong>Mã nhân viên</strong> (Tùy chọn)</div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(true)}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Tải danh sách nhân sự lên</span>
                  </button>
                </div>
              </div>

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-4 py-3 rounded-xl border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-50 dark:hover:bg-purple-950/40"
                  >
                    Bổ sung sau
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>Tiếp tục: Kiểm tra</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BƯỚC 4: KIỂM TRA VÀ HOÀN TẤT */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  Bước 4: Kiểm Tra & Hoàn Tất Thiết Lập
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500">Tên cửa hàng:</span>
                  <strong className="text-slate-900 dark:text-white">{storeName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500">Chi nhánh:</span>
                  <strong className="text-slate-900 dark:text-white">{branchName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500">Chủ quản / Quản lý:</span>
                  <strong className="text-slate-900 dark:text-white">{managerName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 dark:border-slate-700 pb-1.5">
                  <span className="text-slate-500">Mật khẩu mới:</span>
                  <strong className="text-emerald-600">Đã cập nhật an toàn (được che)</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nhân sự đã nạp:</span>
                  <strong className="text-purple-600">{importedStaffCount > 0 ? `${importedStaffCount} nhân viên` : 'Chưa nạp (Có thể thêm trong Cài đặt)'}</strong>
                </div>
              </div>

              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                  {submitError}
                </div>
              )}

              <div className="pt-3 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Quay lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinishSetup}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 disabled:bg-slate-400"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang lưu thiết lập...' : 'Hoàn tất thiết lập & Vào trang chính'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Upload Nhân sự */}
      {showUploadModal && (
        <StaffUploadModal
          storeId={user?.storeId || 'store_01'}
          branchName={branchName}
          onClose={() => setShowUploadModal(false)}
          onSuccess={(res: StaffImportResult) => {
            setImportedStaffCount((prev) => prev + res.added);
          }}
        />
      )}
    </div>
  );
};
