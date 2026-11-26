import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LANGUAGE_NAMES } from '../i18n';
import { Language } from '../types';
import { Globe, Check, ChevronDown, X } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { language, setLanguage, t } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click (for desktop dropdown)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSelectLanguage = (langKey: Language, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLanguage(langKey);
    setIsOpen(false);
  };

  const currentMeta = LANGUAGE_NAMES[language] || LANGUAGE_NAMES['vi'];

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Nút Kích Hoạt Bộ Chọn Ngôn Ngữ: "🌐 Tiếng Việt", "🌐 简体中文", ... */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${t('auth.select_language')}: ${currentMeta.label}`}
        title={`${t('auth.select_language')}: ${currentMeta.label}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs font-bold text-slate-800 dark:text-slate-100 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        <span className="text-sm leading-none" role="img" aria-hidden="true">
          🌐
        </span>
        <span className="truncate max-w-[100px] sm:max-w-none">{currentMeta.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* 1. DESKTOP DROPDOWN (Ẩn trên màn hình rất nhỏ nếu dùng bottom sheet, hoặc hiển thị responsive) */}
      {isOpen && (
        <>
          {/* Backdrop mờ cho điện thoại (Bottom Sheet backdrop) */}
          <div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs sm:hidden animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Danh sách ngôn ngữ:
              - Trên mobile: trượt từ đáy màn hình (Bottom Sheet)
              - Trên tablet/laptop: thả xuống góc phải nút bấm (Dropdown)
          */}
          <div
            role="listbox"
            aria-label={t('auth.select_language')}
            className={`
              z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl transition-all
              /* Mobile styling: Bottom Sheet */
              fixed bottom-0 left-0 right-0 rounded-t-3xl p-4 space-y-2 sm:space-y-1
              /* Desktop styling: Dropdown */
              sm:absolute sm:bottom-auto sm:top-full sm:right-0 sm:left-auto sm:w-56 sm:rounded-2xl sm:p-2 sm:mt-1.5 sm:shadow-xl
            `}
          >
            {/* Header trên Mobile Bottom Sheet */}
            <div className="flex sm:hidden items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-2">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>{t('auth.select_language')}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Danh sách 5 ngôn ngữ hiển thị bằng chính ngôn ngữ đó */}
            {(Object.keys(LANGUAGE_NAMES) as Language[]).map((langKey) => {
              const meta = LANGUAGE_NAMES[langKey];
              const isSelected = language === langKey;

              return (
                <button
                  key={langKey}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={(e) => handleSelectLanguage(langKey, e)}
                  className={`
                    w-full flex items-center justify-between px-3.5 py-3 sm:py-2.5 rounded-xl text-xs font-semibold transition-all text-left
                    ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base" role="img" aria-hidden="true">
                      {meta.flag}
                    </span>
                    <span className="text-sm sm:text-xs">{meta.label}</span>
                  </div>

                  {isSelected && (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
