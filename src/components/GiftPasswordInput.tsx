import React, { useState } from 'react';

interface GiftPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
}

export const GiftPasswordInput: React.FC<GiftPasswordInputProps> = ({
  label,
  error,
  containerClassName = '',
  className = '',
  id,
  value,
  onChange,
  placeholder = 'Nhập mật khẩu',
  showPasswordLabel = 'Hiện mật khẩu',
  hidePasswordLabel = 'Ẩn mật khẩu',
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `gift-pwd-${Math.random().toString(36).substring(2, 9)}`;

  const toggleVisibility = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  const currentTooltip = showPassword ? hidePasswordLabel : showPasswordLabel;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          {...rest}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full pl-3.5 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
            error ? 'border-rose-500 focus:ring-rose-500' : ''
          } ${className}`}
        />

        {/* Nút Hộp Quà Hiện/Ẩn Mật Khẩu */}
        <button
          type="button"
          onClick={toggleVisibility}
          tabIndex={0}
          aria-label={currentTooltip}
          title={currentTooltip}
          className="absolute right-2.5 p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          {showPassword ? (
            // Hộp quà MỞ: nắp nhấc lên, ruy băng bung tỏa, biểu thị đang hiện mật khẩu
            <svg
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Thân hộp quà */}
              <path d="M4 11v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9" />
              {/* Ruy băng thân */}
              <line x1="12" y1="11" x2="12" y2="21" />
              {/* Nắp hộp mở nghiêng bay lên */}
              <path d="M2.5 7.5L12 4.5l8 2.5-1 3.5-16-1z" />
              {/* Nơ ruy băng bung mở */}
              <path d="M12 4.5c-1.5-2-3-2.5-4-1.5S7.5 5 9 6" />
              <path d="M12 4.5c1.5-2 3-2.5 4-1.5s.5 2-1 3" />
              {/* Ngôi sao nhỏ biểu thị mở quà */}
              <circle cx="12" cy="14" r="1.5" fill="currentColor" />
            </svg>
          ) : (
            // Hộp quà ĐÓNG: nắp đậy kín, ruy băng buộc gọn gàng, biểu thị đang che mật khẩu
            <svg
              className="w-5 h-5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Thân hộp quà */}
              <rect x="4" y="9" width="16" height="12" rx="1" />
              {/* Nắp hộp quà đóng chặt */}
              <rect x="2.5" y="6" width="19" height="3.5" rx="1" />
              {/* Ruy băng dọc */}
              <line x1="12" y1="6" x2="12" y2="21" />
              {/* Ruy băng ngang */}
              <line x1="4" y1="15" x2="20" y2="15" />
              {/* Chiếc nơ trên nắp */}
              <path d="M12 6C10.5 4 8.5 3.5 7.5 4.5S8 7.5 10 6" />
              <path d="M12 6C13.5 4 15.5 3.5 16.5 4.5S16 7.5 14 6" />
            </svg>
          )}
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-rose-500 font-semibold px-1">{error}</p>
      )}
    </div>
  );
};
