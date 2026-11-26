import { Language } from '../types';

/**
 * Che số CCCD để đảm bảo quyền riêng tư: 001099012345 -> 0010******45
 */
export function maskCccd(cccd: string): string {
  if (!cccd) return '';
  const clean = String(cccd).trim();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-2);
  const stars = '*'.repeat(Math.max(4, clean.length - 6));
  return `${start}${stars}${end}`;
}

/**
 * Định dạng tiền tệ VND gắn với doanh nghiệp: 1.250.000 đ
 * Đổi ngôn ngữ KHÔNG đổi tiền tệ hay tỷ giá.
 */
export function formatCurrencyVND(amount: number): string {
  if (isNaN(amount)) return '0 đ';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
}

/**
 * Định dạng ngày theo ngôn ngữ hiển thị
 */
export function formatDate(dateStr: string, lang: Language): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;

  switch (lang) {
    case 'zh-CN':
    case 'ja':
      return `${year}年${Number(month)}月${Number(day)}日`;
    case 'ko':
      return `${year}년 ${Number(month)}월 ${Number(day)}일`;
    case 'en':
      return `${day}/${month}/${year}`;
    case 'vi':
    default:
      return `${day}/${month}/${year}`;
  }
}

/**
 * Trả về thứ trong tuần theo ngôn ngữ
 */
export function getDayOfWeekName(dateStr: string, lang: Language): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...

  const days: Record<Language, string[]> = {
    'vi': ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'],
    'zh-CN': ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    'ko': ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    'en': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'ja': ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
  };

  return days[lang]?.[day] || days['vi'][day];
}
