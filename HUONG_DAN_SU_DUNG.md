# HƯỚNG DẪN SỬ DỤNG VÀ VẬN HÀNH "APP CHẤM CÔNG" (PHIÊN BẢN 2.2)

---

## I. MÀN HÌNH ĐĂNG NHẬP & BỘ CHỌN NGÔN NGỮ ĐA NĂNG
1. **Bộ chọn ngôn ngữ trực tiếp tại Màn hình Đăng nhập**:
   - Nút chọn ngôn ngữ đặt tại góc trên bên phải màn hình: `🌐 [Tên bản ngữ]`.
   - Hỗ trợ đầy đủ 5 ngôn ngữ bản địa:
     - **Tiếng Việt** (`vi` - Mặc định)
     - **简体中文** (`zh-CN`)
     - **한국어** (`ko`)
     - **English** (`en`)
     - **日本語** (`ja`)
   - **Giao diện phản hồi thông minh**:
     - Trên Laptop / Desktop: Menu thả xuống (dropdown) tinh gọn, có đánh dấu ngôn ngữ đang chọn.
     - Trên Điện thoại di động: Bảng chọn trượt từ dưới lên (Bottom Sheet) tiện thao tác bằng một tay.
   - **Chuyển đổi tức thì (Instant Switch)**:
     - Đổi ngôn ngữ ngay lập tức mà không tải lại trang (no page reload).
     - Giữ nguyên toàn bộ dữ liệu đang gõ trong ô mã số/CCCD, mật khẩu, vai trò đang chọn và trạng thái nút hộp quà.
     - Dịch 100% các thành phần: tiêu đề, vai trò, nhãn nhập liệu, placeholder, nút đăng nhập, ghi nhớ đăng nhập, thông báo lỗi.
     - Lưu lựa chọn vào bộ nhớ thiết bị (`localStorage['app_user_language']`) để duy trì cho lần mở sau và đồng bộ toàn app sau khi đăng nhập.
2. **Các ô nhập liệu hoàn toàn rỗng ban đầu**:
   - Ô nhập danh tính: Placeholder *"Nhập mã số hoặc CCCD"*.
   - Ô nhập mật khẩu: Placeholder *"Nhập mật khẩu"*.
   - Không điền sẵn bất kỳ tài khoản hoặc mật khẩu mẫu nào.
3. **Nút chọn vai trò tối giản**:
   - Chỉ gồm 2 nút: **“Nhân viên”** và **“Chủ quản”** (đã gỡ bỏ toàn bộ mã mẫu như NV-1001, CQ-8888).
4. **Nút Hiện/Ẩn mật khẩu bằng biểu tượng HỘP QUÀ**:
   - **Hộp quà đóng**: Mật khẩu đang được che an toàn.
   - **Hộp quà mở**: Mật khẩu hiển thị rõ để kiểm tra ký tự khi gõ.
   - Bấm nút không làm submit form, không mất focus hay xóa dữ liệu.
5. **Phân tách hỗ trợ rõ ràng**:
   - Khi chọn vai trò **“Nhân viên”**: Hiển thị nút *"Quên mật khẩu?"* và liên kết *"Cần hỗ trợ, nhắn tin chủ quản"*.
   - Khi chọn vai trò **“Chủ quản”**: Tự động ẩn toàn bộ các câu nhắn hỗ trợ.

---

## II. LUỒNG THIẾT LẬP DÀNH CHO CHỦ QUẢN KHI ĐĂNG NHẬP LẦN ĐẦU
Khi Chủ quản đăng nhập lần đầu tiên vào hệ thống, giao diện **Thiết lập thông tin quản lý** sẽ tự động mở gồm 4 bước:
1. **Thông tin Cửa hàng & Quản lý**:
   - Tên cửa hàng (Bắt buộc).
   - Tên hoặc số chi nhánh, ví dụ: *"Chi nhánh 1"* (Bắt buộc).
   - Họ tên quản lý/chủ quản (Bắt buộc).
2. **Đổi mật khẩu lần đầu**:
   - Mật khẩu mới và xác nhận mật khẩu mới (tối thiểu 6 ký tự, không dấu cách).
   - Tích hợp nút **Hộp quà** để kiểm tra mật khẩu.
3. **Danh sách nhân sự**:
   - Tiêu đề: *“Danh sách nhân sự trong công ty bạn”* kèm biểu tượng **ⓘ**.
   - Bấm **ⓘ** hiển thị quy định cột và nút tải file mẫu `.csv` hoặc `.xlsx`.
   - Có thể tải file nhân sự ngay hoặc bấm **“Bổ sung sau”**.
4. **Kiểm tra và Hoàn tất**:
   - Xem lại tổng quan và bấm **“Hoàn tất thiết lập & Vào trang chính”**.
   - Sau khi hoàn tất, hệ thống sẽ lưu trạng thái vào tài khoản chủ quản và không bao giờ hỏi lại. Chủ quản có thể chỉnh sửa lại trong menu Cài đặt.

---

## III. QUY TRÌNH TẢI DANH SÁCH NHÂN SỰ (CSV & EXCEL)
1. **Định dạng hỗ trợ**: `.xlsx` và `.csv`.
2. **Các cột yêu cầu**:
   - **Họ tên nhân viên** (Bắt buộc).
   - **Chức vụ** (Bắt buộc, ví dụ: Pha chế, Thu ngân, Phục vụ...).
   - **CCCD** (Bắt buộc, hệ thống giữ nguyên chuỗi để không mất số 0 ở đầu).
   - **Mã nhân viên** (Tùy chọn, nếu trống hệ thống tự sinh mã NV).
3. **Quy trình kiểm tra an toàn**:
   - Chọn file $\to$ Kiểm tra số dòng hợp lệ và dòng lỗi.
   - Xem trước bảng dữ liệu (Preview).
   - Nếu có nhân sự trùng lặp: Cho phép chọn **“Bỏ qua nhân sự đã có”** hoặc **“Cập nhật thông tin nhân sự đã có”**.
   - Bấm nút **“Xác nhận nhập”** thì dữ liệu mới được ghi vào hệ thống (không tự ý nhập ngay khi vừa chọn file; không xóa nhân sự hiện có).

---

## IV. MENU CÀI ĐẶT DÀNH CHO CHỦ QUẢN (BIỂU TƯỢNG BÁNH RĂNG ⚙️)
Tại góc trên bên phải màn hình Chủ quản, bấm biểu tượng ⚙️ để mở:
- **A. Ngôn ngữ**: Đủ 5 thứ tiếng (`vi`, `zh-CN`, `ko`, `en`, `ja`), mặc định Tiếng Việt.
- **B. Giao diện**: Sáng, Tối, Theo hệ thống.
- **C. Dữ liệu**:
  - Xem và sửa Tên cửa hàng, Chi nhánh, Tên quản lý.
  - Quản lý danh sách nhân sự: tìm kiếm theo tên hoặc mã, thêm nhân viên lẻ, sửa nhân viên, tải thêm file Excel/CSV.
  - Số CCCD được che dạng `0010******45`, có nút mắt để xem đầy đủ khi cần.
- **D. Hướng dẫn sử dụng dành cho quản lý**: Cung cấp hướng dẫn ngắn gọn, bảo mật về các nghiệp vụ quản lý.
- **E. Đăng xuất**: Kết thúc phiên an toàn, xóa cache tạm, chuyển về màn hình đăng nhập, chống quay lại trang quản trị bằng nút Back.

---

## V. CÁCH CHẠY VÀ THỬ NGHIỆM TRONG VS CODE

```bash
# 1. Chạy bản Web thử nghiệm (http://localhost:3000)
npm run dev

# 2. Chạy bộ kiểm thử tự động 181/181 test cases (100% PASS)
node scripts/verify-all.cjs

# 3. Biên dịch và đồng bộ Mobile (Android & iOS)
npm run build
npm run cap:sync
```

### Tài khoản thử nghiệm:
- **Chủ quản**: Nhập mã `CQ-8888` | Mật khẩu: `ADMIN` (Lần đầu đăng nhập sẽ hiển thị Wizard thiết lập 4 bước).
- **Nhân viên**: Nhập mã `NV-1001` | Mật khẩu: `TEAYOO` (Chấm công Vào ca/Tan ca, hiển thị lịch sử thực tế).
