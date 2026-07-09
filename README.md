# MyLove — Private Couples Android-like Web App

**MyLove** là ứng dụng web cá nhân riêng tư được tối ưu hóa cho di động (Mobile-first) mô phỏng trải nghiệm ứng dụng Android thật dành riêng cho 2 người yêu nhau. Ứng dụng hỗ trợ đếm ngày yêu, tạo kỷ niệm, gửi ting ting ngắn, chia sẻ tình cảm, theo dõi các ngày quan trọng, lưu trữ hình ảnh và cấu hình cá nhân bảo mật.

## Công nghệ & Stack
- **Frontend**: Next.js App Router (React)
- **Styling**: Tailwind CSS + custom Android/Material 3 style tokens (màu pastel nhẹ, dark mode mềm, bo góc lớn, safe area layout)
- **Database**: Prisma ORM + PostgreSQL (tương thích Vercel Postgres / Supabase)
- **Auth**: Quản lý session bằng cookies (signed JWT cookie `mylove_session`), mã hóa mật khẩu bằng `bcryptjs`.
- **Upload**: Tích hợp với Vercel Blob để tải lên avatar cặp đôi, ảnh kỷ niệm, gallery.
- **Trạng thái thực tế**: Không sử dụng WebSockets chạy nền để tránh tốn tài nguyên, thay vào đó sử dụng tính năng polling nhẹ thông qua client state.

---

## Cấu trúc thư mục dự án

```txt
app/
  (auth)/login/page.tsx      # Trang đăng nhập (chọn slot 1/2 + mật khẩu/mã cặp đôi)
  (setup)/setup/page.tsx     # Trang thiết lập lần đầu (tạo Couple & 2 User)
  (app)/                     # Nhóm các trang trong app được bảo vệ bởi middleware
    layout.tsx               # Chứa AppShell, TopAppBar, BottomNav
    page.tsx                 # Điều hướng tự động
    home/page.tsx            # Đếm ngày yêu, avatar, quote tình yêu, tim bay khi click
    profile/page.tsx         # Chỉnh sửa hồ sơ cá nhân và thông tin cặp đôi
    memories/page.tsx        # Dòng thời gian kỷ niệm (CRUD + tag + cover image)
    notes/page.tsx           # Lời nhắn tình yêu dạng chat bubble (CRUD + ghim + đã đọc)
    ting-ting/page.tsx       # Gửi "ting ting" thông báo kèm lời nhắn ngắn + xem lịch sử
    calendar/page.tsx        # Đếm ngược các ngày đặc biệt quan trọng (Anniversary, Birthday...)
    gallery/page.tsx         # Thư viện ảnh dạng grid, xem fullscreen, tải lên và xóa
    settings/page.tsx        # Cài đặt (Theme, Đổi mật khẩu/mã cặp đôi, Xuất/Xóa dữ liệu, Đăng xuất)
  api/                       # Hệ thống Backend API Endpoint bảo mật
    auth/login/route.ts      # Xác thực người dùng
    auth/logout/route.ts     # Xóa session cookie
    auth/session/route.ts    # Lấy thông tin phiên hiện tại & số tin chưa đọc
    auth/password/route.ts   # Cập nhật mật khẩu / mã cặp đôi
    setup/route.ts           # Khởi tạo dữ liệu ban đầu
    couple/route.ts          # Lấy/Cập nhật thông tin couple
    couple/users/[id]/route.ts # Cập nhật profile từng cá nhân
    memories/**/route.ts     # Quản lý kỷ niệm
    notes/**/route.ts        # Quản lý note
    ting-ting/route.ts       # Gửi nhận ting ting
    special-days/**/route.ts # Quản lý ngày quan trọng
    gallery/**/route.ts      # Thư viện ảnh
    settings/route.ts        # Cấu hình app & xóa vĩnh viễn dữ liệu
    upload/route.ts          # API trung gian đẩy file lên Vercel Blob
    export/route.ts          # Xuất toàn bộ dữ liệu app dạng JSON
  globals.css                # Style chính, cấu hình màu light/dark, animation bay tim
components/
  providers/                 # Quản lý theme, session state & notification toast
  shell/                     # Khung sườn Android App Layout (Header, Bottom Navigation)
  ui/                        # Các UI primitive cơ bản (Button, Card, BottomSheet, Dialog, Input, Avatar, Chip, Toast)
lib/
  auth/                      # Tiện ích mã hóa mật khẩu, tạo token JWT, hàm guard requireAuth()
  validations/               # Kiểm tra tính hợp lệ của input bằng Zod
  dates.ts                   # Các hàm xử lý ngày yêu, đếm ngược sự kiện
  db.ts                      # Prisma client singleton
  constants.ts               # Danh sách quote tình yêu, icon, tag kỷ niệm, hằng số cấu hình
  safe-data.ts               # Loại bỏ passwordHash/codeHash trước khi trả về Client
prisma/
  schema.prisma              # Database schema cho PostgreSQL
  seed.ts                    # File seed trống
middleware.ts                # Chặn các trang (app) nếu chưa đăng nhập
```

---

## Hướng dẫn cài đặt và chạy dưới local

### 1. Chuẩn bị môi trường
Tạo file `.env` ở thư mục gốc (tham khảo `.env.example`):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mylove?sslmode=require"
JWT_SECRET="tối_thiểu_24_ký_tự_ngẫu_nhiên"
BLOB_READ_WRITE_TOKEN="token_lấy_từ_vercel_blob_storage"
NEXT_PUBLIC_APP_NAME="MyLove"
```
*Lưu ý: Nếu phát triển local không cần Vercel Blob thực tế, bạn vẫn cần điền một token giả lập để tránh lỗi khởi động ứng dụng.*

### 2. Cài đặt dependency & Migrate Database
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### 3. Chạy môi trường dev
```bash
npm run dev
```
Truy cập vào http://localhost:3000. Nếu đây là lần chạy đầu tiên, hệ thống sẽ tự chuyển hướng bạn sang `/setup` để khởi tạo cặp đôi và mật khẩu. Sau khi thiết lập xong, ứng dụng sẽ chuyển hướng về màn hình đăng nhập `/login`.

---

## Hướng dẫn deploy lên Vercel

1. **Đẩy code lên GitHub cá nhân** (để ở chế độ Private để bảo mật thông tin).
2. **Khởi tạo dự án trên Vercel**:
   - Chọn Import repository của bạn.
   - Thêm các biến môi trường cấu hình tại mục **Environment Variables** (DATABASE_URL, JWT_SECRET, BLOB_READ_WRITE_TOKEN).
3. **Kết nối Database**:
   - Bạn có thể tạo **Vercel Postgres** trực tiếp trên trang cấu hình Project của Vercel (mục Storage).
   - Hoặc kết nối cơ sở dữ liệu PostgreSQL từ **Supabase** bằng cách lấy chuỗi kết nối dán vào biến `DATABASE_URL`.
4. **Kết nối Vercel Blob**:
   - Truy cập tab **Storage** trên Vercel, chọn **Create Blob**.
   - Vercel sẽ tự động cấu hình biến `BLOB_READ_WRITE_TOKEN` vào Project của bạn.
5. **Build & Deploy**:
   - Lệnh build trong `package.json` đã được cài đặt sẵn: `prisma generate && next build`. Quá trình deploy sẽ tự động chạy di chuyển schema lên DB và build code.

---

## Các tính năng đã hoàn thành hoàn chỉnh
1. **Setup & Login**: Ngăn chặn người ngoài đăng ký mới. Cho phép đăng nhập bằng tài khoản riêng hoặc mật khẩu cặp đôi chung.
2. **Home (Đếm ngày yêu)**: Đếm ngày yêu chính xác kèm chi tiết năm/tháng/ngày. Quote tình yêu tự động cập nhật mỗi ngày. Hiệu ứng thả tim động (floating hearts animation) khi chạm vào số ngày.
3. **Couple Profile**: Hồ sơ chi tiết của cả hai (Sinh nhật, biệt danh, màu sắc yêu thích, lời tự sự về đối phương). Cho phép cập nhật thông tin và thay ảnh đại diện trực tiếp thông qua Material Bottom Sheet.
4. **Kỷ niệm (Memories)**: Xem timeline kỷ niệm, lọc theo nhãn dán (đi chơi, du lịch, cãi nhau...). Soạn thảo và chỉnh sửa kỷ niệm kèm tải ảnh lên.
5. **Lời nhắn (Love Notes)**: Gửi tin nhắn tình yêu nhanh theo dạng bong bóng chat. Xem trạng thái đã đọc từ đối phương. Ghim tin quan trọng lên đầu.
6. **Ting Ting**: Gửi thông báo rung tức thì tới đối phương theo các danh mục đáng yêu (Nhớ em/anh, muốn ôm, dỗi rồi, làm lành nha...) hoặc custom nhắn gửi. Có badge báo hiệu số thông báo chưa đọc.
7. **Lịch sự kiện (Calendar)**: Quản lý ngày sinh nhật, ngày cưới, ngày hẹn hò đầu tiên... Đếm ngược thời gian còn lại chính xác.
8. **Thư viện ảnh (Gallery)**: Grid ảnh hiển thị mượt mà. Xem ảnh phóng to toàn màn hình dạng Lightbox. Hỗ trợ tải lên ảnh chất lượng cao lưu trên cloud.
9. **Cài đặt & Bảo mật**: Đổi giao diện Light/Dark theo hệ thống, đổi mật khẩu cá nhân/cặp đôi, xuất file backup dữ liệu dạng JSON hoặc xóa sạch toàn bộ cơ sở dữ liệu có thông báo hộp thoại xác nhận an toàn.

---

## Nâng cấp trong tương lai
- **Realtime nâng cao**: Sử dụng Supabase Realtime hoặc WebSockets (Pusher) để đồng bộ Ting Ting/Love Notes ngay tức thì không cần thời gian trễ.
- **PWA (Progressive Web App)**: Tạo file manifest đầy đủ để người dùng cài đặt ứng dụng trực tiếp lên màn hình chính Android/iOS giống như app native.
- **Push Notification**: Đăng ký Service Worker và Web Push API để nhận được thông báo đẩy (push notifications) kể cả khi tắt trình duyệt.
- **Image Compression**: Bổ sung thư viện compress ảnh client-side (như `browser-image-compression`) trước khi đẩy lên Vercel Blob để tiết kiệm dung lượng lưu trữ.
