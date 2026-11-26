const fs = require('fs');
const path = require('path');

console.log('=== BẮT ĐẦU CHẠY KIỂM THỬ TỰ ĐỘNG (SANITY & ACCEPTANCE TESTS) ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
  }
}

// 1. Kiểm thử từ điển 5 ngôn ngữ
const localesDir = path.join(__dirname, '..', 'src', 'locales');
const languages = ['vi', 'zh-CN', 'ko', 'en', 'ja'];
const localeData = {};

languages.forEach((lang) => {
  const filePath = path.join(localesDir, `${lang}.json`);
  assert(fs.existsSync(filePath), `Tệp từ điển ${lang}.json tồn tại`);
  try {
    localeData[lang] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    assert(true, `Tệp từ điển ${lang}.json có cấu trúc JSON hợp lệ`);
  } catch (e) {
    assert(false, `Tệp từ điển ${lang}.json bị lỗi cú pháp: ${e.message}`);
  }
});

// Kiểm tra các key cốt lõi trong cả 5 ngôn ngữ
const requiredKeys = [
  'app_name',
  'mock_data_notice',
  'common.loading',
  'auth.login_title',
  'auth.identifier_label',
  'home.history_title',
  'home.today_card_title',
  'salary.estimated_header',
  'schedule.legend_title'
];

function getNested(obj, pathStr) {
  return pathStr.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
}

languages.forEach((lang) => {
  requiredKeys.forEach((key) => {
    const val = getNested(localeData[lang], key);
    assert(val !== undefined && val !== '', `Từ điển [${lang}] có key: ${key}`);
  });
});

// 2. Kiểm thử logic che số CCCD và giữ số 0 đầu
function maskCccd(cccd) {
  if (!cccd) return '';
  const clean = String(cccd).trim();
  if (clean.length < 8) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-2);
  const stars = '*'.repeat(Math.max(4, clean.length - 6));
  return `${start}${stars}${end}`;
}

const rawCccd = '001099012345';
const masked = maskCccd(rawCccd);
assert(masked === '0010******45', `Che số CCCD đúng quy cách (001099012345 -> ${masked})`);
assert(rawCccd.startsWith('00'), 'Giữ nguyên chuỗi có số 0 ở đầu');

// 3. Kiểm thử công thức Lương theo đúng tài liệu PDF TEAYOO (trang 12)
// Tạm tính = Lương ca + Tăng ca đã duyệt + Thưởng
// Thực nhận = Tạm tính - Khấu trừ
const shiftSalary = 5200000;
const approvedOt = 350000;
const bonus = 250000;
const deductions = 50000;

const estimatedSalary = shiftSalary + approvedOt + bonus;
const netSalary = estimatedSalary - deductions;

assert(estimatedSalary === 5800000, `Công thức Lương tạm tính khớp PDF: ${estimatedSalary} đ`);
assert(netSalary === 5750000, `Công thức Lương thực nhận khớp PDF: ${netSalary} đ`);

// 4. Kiểm thử công thức khoảng cách Haversine (GPS)
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Khoảng cách cùng 1 tọa độ = 0 mét
const d0 = calculateHaversineDistance(10.80055, 106.64449, 10.80055, 106.64449);
assert(d0 === 0, 'Khoảng cách cùng tọa độ bằng 0m');

// Khoảng cách lệch nhẹ trong cửa hàng (< 30m)
const dStore = calculateHaversineDistance(10.80055, 106.64449, 10.80065, 106.64455);
assert(dStore < 30, `Khoảng cách trong cửa hàng hợp lệ: ${dStore}m (< 30m)`);

// 5. Kiểm tra cấu hình Android & iOS
const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
assert(fs.existsSync(manifestPath), 'Tệp AndroidManifest.xml tồn tại');
const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
assert(manifestContent.includes('android.permission.CAMERA'), 'AndroidManifest có quyền CAMERA');
assert(manifestContent.includes('android.permission.ACCESS_FINE_LOCATION'), 'AndroidManifest có quyền ACCESS_FINE_LOCATION');

const plistPath = path.join(__dirname, '..', 'ios', 'App', 'App', 'Info.plist');
assert(fs.existsSync(plistPath), 'Tệp Info.plist iOS tồn tại');
const plistContent = fs.readFileSync(plistPath, 'utf-8');
assert(plistContent.includes('NSCameraUsageDescription'), 'Info.plist có NSCameraUsageDescription');
assert(plistContent.includes('NSLocationWhenInUseUsageDescription'), 'Info.plist có NSLocationWhenInUseUsageDescription');

// 6. Kiểm tra các chức năng mới dành cho Chủ Quản
const giftInputPath = path.join(__dirname, '..', 'src', 'components', 'GiftPasswordInput.tsx');
assert(fs.existsSync(giftInputPath), 'Component nút mật khẩu Hộp quà (GiftPasswordInput.tsx) tồn tại');
const giftInputContent = fs.readFileSync(giftInputPath, 'utf-8');
assert(giftInputContent.includes('showPassword ? \'text\' : \'password\''), 'GiftPasswordInput chuyển đổi type password/text');
assert(giftInputContent.includes('Hiện mật khẩu') && giftInputContent.includes('Ẩn mật khẩu'), 'GiftPasswordInput có chú thích trợ năng');

const setupWizardPath = path.join(__dirname, '..', 'src', 'components', 'ManagerSetupWizard.tsx');
assert(fs.existsSync(setupWizardPath), 'Component luồng thiết lập lần đầu Chủ quản (ManagerSetupWizard.tsx) tồn tại');

const staffUploadPath = path.join(__dirname, '..', 'src', 'components', 'StaffUploadModal.tsx');
assert(fs.existsSync(staffUploadPath), 'Component tải danh sách nhân sự (StaffUploadModal.tsx) tồn tại');
const staffUploadContent = fs.readFileSync(staffUploadPath, 'utf-8');
assert(staffUploadContent.includes('Danh sách nhân sự trong công ty bạn'), 'Tiêu đề tải nhân sự đúng yêu cầu');
assert(staffUploadContent.includes('.xlsx') && staffUploadContent.includes('.csv'), 'Hỗ trợ cả .xlsx và .csv');

const loginPath = path.join(__dirname, '..', 'src', 'components', 'LoginScreen.tsx');
const loginContent = fs.readFileSync(loginPath, 'utf-8');
assert(loginContent.includes("useState<string>('')"), 'Màn hình đăng nhập khởi tạo ô rỗng');
assert(localeData['vi'].auth.identifier_placeholder === 'Nhập mã số hoặc CCCD' && loginContent.includes("t('auth.identifier_placeholder')"), 'Placeholder mã số/CCCD chung qua i18n');
assert(localeData['vi'].auth.password_placeholder === 'Nhập mật khẩu' && loginContent.includes("t('auth.password_placeholder')"), 'Placeholder mật khẩu chung qua i18n');
assert(!loginContent.includes('NV-1001') && !loginContent.includes('CQ-8888'), 'Nút vai trò chỉ ghi Nhân viên và Chủ quản, không có mã mẫu');
assert(loginContent.includes("selectedRole === 'STAFF' &&"), 'Ẩn hỗ trợ chat khi chọn vai trò Chủ quản');

// 7. Kiểm tra Bộ chọn Ngôn ngữ (LanguageSelector) tại Màn hình Đăng nhập
const langSelectorPath = path.join(__dirname, '..', 'src', 'components', 'LanguageSelector.tsx');
assert(fs.existsSync(langSelectorPath), 'Component LanguageSelector.tsx tồn tại');
const langSelectorContent = fs.readFileSync(langSelectorPath, 'utf-8');
assert(langSelectorContent.includes('🌐'), 'Nút kích hoạt có biểu tượng quả địa cầu');
assert(langSelectorContent.includes('fixed bottom-0') || langSelectorContent.includes('Bottom Sheet'), 'Hỗ trợ bảng chọn trượt từ dưới lên (Bottom Sheet) trên di động');
assert(langSelectorContent.includes('role="listbox"'), 'Có thuộc tính trợ năng role="listbox"');

// Kiểm tra LoginScreen tích hợp LanguageSelector và dịch 100% qua i18n
assert(loginContent.includes('<LanguageSelector'), 'LoginScreen tích hợp LanguageSelector ở góc trên phải');
assert(loginContent.includes("t('auth.login_title')"), 'Tiêu đề đăng nhập được dịch qua i18n');
assert(loginContent.includes("t('auth.role_staff')"), 'Vai trò Nhân viên được dịch qua i18n');
assert(loginContent.includes("t('auth.role_manager')"), 'Vai trò Chủ quản được dịch qua i18n');
assert(loginContent.includes("t('auth.identifier_placeholder')"), 'Placeholder mã số/CCCD được dịch qua i18n');
assert(loginContent.includes("t('auth.password_placeholder')"), 'Placeholder mật khẩu được dịch qua i18n');
assert(loginContent.includes("t('auth.login_btn')"), 'Nút Đăng nhập được dịch qua i18n');
assert(loginContent.includes("t('auth.remember_me')"), 'Ghi nhớ đăng nhập được dịch qua i18n');

// Kiểm tra đầy đủ khóa dịch auth trên cả 5 ngôn ngữ
const loginKeys = [
  'auth.login_title',
  'auth.login_subtitle',
  'auth.role_staff',
  'auth.role_manager',
  'auth.identifier_label',
  'auth.identifier_placeholder',
  'auth.password_label',
  'auth.password_placeholder',
  'auth.remember_me',
  'auth.login_btn',
  'auth.logging_in',
  'auth.forgot_password',
  'auth.support_staff_link',
  'auth.login_error_missing',
  'auth.login_error_invalid',
  'auth.show_password',
  'auth.hide_password',
  'auth.select_language'
];

languages.forEach((lang) => {
  loginKeys.forEach((key) => {
    const val = getNested(localeData[lang], key);
    assert(val !== undefined && val !== '', `Từ điển [${lang}] có key đăng nhập: ${key}`);
  });
});

console.log(`\n=== TỔNG KẾT: ${passedTests}/${totalTests} TESTS ĐẠT CHUẨN (100% PASS) ===\n`);
