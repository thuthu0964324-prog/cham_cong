import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LANGUAGE_NAMES } from '../i18n';
import { Language, Theme } from '../types';
import { Settings, Globe, Moon, Sun, Monitor, Key, LogOut, Check, AlertCircle, X } from 'lucide-react';
import { GiftPasswordInput } from './GiftPasswordInput';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { language, setLanguage, logout, changeQueryCode, t } = useAuth();
  const { theme, setTheme } = useTheme();

  // Change code states
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmNewCode, setConfirmNewCode] = useState('');
  const [msg, setMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newCode !== confirmNewCode) {
      setMsg({ text: t('settings.code_error_match'), isError: true });
      return;
    }

    const res = await changeQueryCode(currentCode, newCode);
    if (res.success) {
      setMsg({ text: t('settings.code_changed_success'), isError: false });
      setCurrentCode('');
      setNewCode('');
      setConfirmNewCode('');
    } else {
      setMsg({ text: t(res.errorKey || 'common.error'), isError: true });
    }
  };

  const handleLogout = () => {
    if (window.confirm(t('auth.logout_confirm'))) {
      onClose();
      logout();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <Settings className="w-5 h-5" />
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('settings.title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs">
          {/* 1. Ngôn ngữ (5 Ngôn ngữ) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('settings.language')} (5 thứ tiếng)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(LANGUAGE_NAMES) as Language[]).map((langKey) => (
                <button
                  key={langKey}
                  type="button"
                  onClick={() => setLanguage(langKey)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    language === langKey
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>
                    {LANGUAGE_NAMES[langKey].flag} {LANGUAGE_NAMES[langKey].label}
                  </span>
                  {language === langKey && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Theme (Sáng / Tối / Theo hệ thống) */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('settings.theme')}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'light', label: t('settings.theme_light'), icon: Sun },
                { id: 'dark', label: t('settings.theme_dark'), icon: Moon },
                { id: 'system', label: t('settings.theme_system'), icon: Monitor },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id as Theme)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Đổi mã tra cứu cá nhân */}
          <form onSubmit={handleSaveCode} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('settings.change_code_title')}</span>
            </label>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('settings.code_rules')}
            </p>

            <div>
              <GiftPasswordInput
                placeholder={t('settings.current_code')}
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <GiftPasswordInput
                placeholder={t('settings.new_code')}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                required
              />
              <GiftPasswordInput
                placeholder={t('settings.confirm_new_code')}
                value={confirmNewCode}
                onChange={(e) => setConfirmNewCode(e.target.value)}
                required
              />
            </div>

            {msg && (
              <div
                className={`p-2.5 rounded-xl flex items-center gap-2 ${
                  msg.isError
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{msg.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition-colors"
            >
              {t('common.save')}
            </button>
          </form>

          {/* 4. Đăng xuất an toàn */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t('auth.logout_btn')} (Xóa cache an toàn)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
