import vi from './locales/vi.json';
import zhCN from './locales/zh-CN.json';
import ko from './locales/ko.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import { Language } from './types';

const resources: Record<Language, any> = {
  'vi': vi,
  'zh-CN': zhCN,
  'ko': ko,
  'en': en,
  'ja': ja,
};

export const LANGUAGE_NAMES: Record<Language, { label: string; flag: string }> = {
  'vi': { label: 'Tiếng Việt', flag: '🇻🇳' },
  'zh-CN': { label: '简体中文', flag: '🇨🇳' },
  'ko': { label: '한국어', flag: '🇰🇷' },
  'en': { label: 'English', flag: '🇺🇸' },
  'ja': { label: '日本語', flag: '🇯🇵' },
};

const STORAGE_KEY = 'app_user_language';

export function getInitialLanguage(): Language {
  const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
  if (saved && resources[saved]) {
    return saved;
  }
  return 'vi';
}

export function saveLanguage(lang: Language): void {
  localStorage.setItem(STORAGE_KEY, lang);
}

export function translate(lang: Language, key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  
  // Try selected language
  let val = getValueByPath(resources[lang], keys);
  
  // Fallback to Vietnamese if missing
  if (val === undefined && lang !== 'vi') {
    val = getValueByPath(resources['vi'], keys);
  }

  if (val === undefined) {
    return key; // return key if completely not found
  }

  let text = String(val);
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramVal));
    });
  }
  return text;
}

function getValueByPath(obj: any, keys: string[]): any {
  let curr = obj;
  for (const k of keys) {
    if (curr && typeof curr === 'object' && k in curr) {
      curr = curr[k];
    } else {
      return undefined;
    }
  }
  return curr;
}
