import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { SupportChatModal } from './SupportChatModal';
import { GiftPasswordInput } from './GiftPasswordInput';
import { LanguageSelector } from './LanguageSelector';
import { Lock, ShieldAlert, MessageSquare, ShieldCheck, User } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, t } = useAuth();

  // Bắt đầu sạch sẽ: các ô nhập liệu hoàn toàn rỗng, không điền sẵn
  const [selectedRole, setSelectedRole] = useState<'STAFF' | 'MANAGER'>('STAFF');
  const [identifier, setIdentifier] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [remember, setRemember] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal chat quên mật khẩu (Chỉ dành cho Nhân viên)
  const [showChatModal, setShowChatModal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !code.trim()) {
      setErrorMsg(t('auth.login_error_missing'));
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await login(identifier, code, remember);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || t('auth.login_error_invalid'));
    }
  };

  const handleRoleChange = (role: 'STAFF' | 'MANAGER') => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 px-4 py-6 transition-colors">
      {/* Top Bar with App Logo & NÚT CHỌN NGÔN NGỮ Ở GÓC TRÊN BÊN PHẢI */}
      <header className="max-w-md w-full mx-auto flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            TY
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
            {t('app_name')}
          </span>
        </div>

        {/* NÚT CHỌN NGÔN NGỮ: "🌐 [Tên ngôn ngữ bản ngữ]" với Dropdown / Bottom Sheet */}
        <LanguageSelector />
      </header>

      {/* Main Login Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors">
          {/* Card Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t('auth.login_title')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('auth.login_subtitle')}
            </p>

            {/* Nút chọn vai trò: Chỉ ghi "Nhân viên" và "Chủ quản" (được dịch theo i18n) */}
            <div className="grid grid-cols-2 gap-2 mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => handleRoleChange('STAFF')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'STAFF'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('auth.role_staff')}</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('MANAGER')}
                className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  selectedRole === 'MANAGER'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t('auth.role_manager')}</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ô Mã số hoặc CCCD đăng nhập */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('auth.identifier_label')}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('auth.identifier_placeholder')}
                autoComplete="username"
                required
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>

            {/* Ô Mật khẩu với nút Hộp quà Hiện/Ẩn (nhãn trợ năng được bản địa hóa) */}
            <div>
              <GiftPasswordInput
                label={t('auth.password_label')}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('auth.password_placeholder')}
                autoComplete="current-password"
                showPasswordLabel={t('auth.show_password')}
                hidePasswordLabel={t('auth.hide_password')}
                required
              />
            </div>

            {/* Remember Me & (Chỉ nhân viên mới có nút Quên mật khẩu) */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
                />
                <span>{t('auth.remember_me')}</span>
              </label>

              {/* Nút Quên mật khẩu: CHỈ hiển thị khi người dùng là NHÂN VIÊN */}
              {selectedRole === 'STAFF' && (
                <button
                  type="button"
                  onClick={() => setShowChatModal(true)}
                  className="font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{t('auth.forgot_password')}</span>
                </button>
              )}
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${
                selectedRole === 'MANAGER'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? t('auth.logging_in') : t('auth.login_btn')}</span>
            </button>
          </form>

          {/* CHỈ hiển thị liên kết nhắn tin hỗ trợ cho vai trò NHÂN VIÊN. Bỏ hoàn toàn ở vai trò CHỦ QUẢN */}
          {selectedRole === 'STAFF' && (
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => setShowChatModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{t('auth.support_staff_link')}</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-400 dark:text-slate-600 py-2">
        {t('app_name')} • {t('mock_data_notice')}
      </footer>

      {/* Modal Chat Quên Mật Khẩu (cho nhân viên) */}
      {showChatModal && (
        <SupportChatModal
          initialIdentifier={identifier}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
};
