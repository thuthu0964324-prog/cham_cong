# App Chấm Công (Mobile & Web)

Dự án ứng dụng chấm công đa ngôn ngữ (5 thứ tiếng), hỗ trợ giao diện Sáng/Tối/Hệ thống, tích hợp khối lịch sử 7 ngày trực tiếp trên trang chủ và sẵn sàng đóng gói cho Android (.apk) & iOS (.ipa) qua Capacitor.

Xem tài liệu đầy đủ tại: [HUONG_DAN_SU_DUNG.md](file:///d:/Web%20ch%E1%BA%A5m%20c%C3%B4ng/HUONG_DAN_SU_DUNG.md)

### Lệnh chạy nhanh:
```bash
# Cài đặt thư viện
npm install

# Chạy bản Web thử nghiệm (http://localhost:3000)
npm run dev

# Biên dịch mã nguồn Web
npm run build

# Đồng bộ sang Android và iOS
npm run cap:sync

# Mở Android Studio để build APK
npm run cap:android

# Chạy bộ kiểm thử tự động 67/67 test cases
node scripts/verify-all.cjs
```
