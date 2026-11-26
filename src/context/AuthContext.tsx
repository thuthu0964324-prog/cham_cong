import React, { createContext, useContext, useState } from 'react';
import { Employee, Language } from '../types';
import { getInitialLanguage, saveLanguage, translate } from '../i18n';
import { storageService } from '../services/storageService';

interface AuthContextType {
  user: Employee | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  login: (identifier: string, code: string, remember: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changeQueryCode: (curr: string, next: string) => Promise<{ success: boolean; errorKey?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [user, setUser] = useState<Employee | null>(() => {
    return storageService.getCurrentUser();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const t = (key: string, params?: Record<string, string | number>) => {
    return translate(language, key, params);
  };

  const login = async (identifier: string, code: string, remember: boolean) => {
    await new Promise((r) => setTimeout(r, 400));

    const cleanId = identifier.trim();
    const cleanCode = code.trim();

    // Tìm tài khoản theo Mã (NV-1001, CQ-8888) hoặc số CCCD
    const account = storageService.findAccountByIdentifier(cleanId);

    if (account && account.password === cleanCode) {
      setUser(account);
      storageService.setCurrentUser(account, remember);
      return { success: true };
    }

    return { success: false, error: t('auth.login_error_invalid') };
  };

  const logout = () => {
    setUser(null);
    storageService.clearSession();
  };

  const changeQueryCode = async (curr: string, next: string) => {
    if (!user) return { success: false, errorKey: 'common.error' };

    if (user.password !== curr) {
      return { success: false, errorKey: 'settings.code_error_wrong_current' };
    }

    // 6-64 ký tự, không dấu cách
    if (next.length < 6 || next.length > 64 || /\s/.test(next)) {
      return { success: false, errorKey: 'settings.code_error_length' };
    }

    storageService.updatePassword(user.employeeCode, next);
    setUser({ ...user, password: next });
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        language,
        setLanguage,
        t,
        login,
        logout,
        changeQueryCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
