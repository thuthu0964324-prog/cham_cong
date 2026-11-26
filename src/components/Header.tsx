import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LANGUAGE_NAMES } from '../i18n';
import { Language } from '../types';
import { Settings, ShieldAlert, MessageSquare } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenChat?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenChat }) => {
  const { user, t } = useAuth();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-sm transition-colors">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        {/* Left: App Identity & Store */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              TY
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {t('app_name')}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {user?.storeName || 'TEAYOO Store'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Language switch & Settings */}
        <div className="flex items-center gap-2">
          {/* Shared Language Selector */}
          <LanguageSelector />

          {/* Support Chat Button */}
          {onOpenChat && (
            <button
              onClick={onOpenChat}
              className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Chat với Chủ quản"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('settings.title')}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Greeting & MVP Notice Banner */}
      <div className="max-w-2xl mx-auto mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
        <div className="text-slate-700 dark:text-slate-300">
          <span className="text-slate-500 dark:text-slate-400">{t('home.greeting')}, </span>
          <strong className="font-semibold">{user?.name}</strong>
          <span className="text-slate-400 dark:text-slate-500 ml-1.5">({user?.employeeCode})</span>
        </div>

        {/* Mock data badge */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
          <ShieldAlert className="w-3 h-3" />
          {t('mock_data_notice')}
        </span>
      </div>
    </header>
  );
};
