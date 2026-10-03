<div align="center">

# 🚗 GoDrive — Ứng dụng thuê xe tự lái

**Đặt xe trong 30 giây · Không cần tài khoản · Giá minh bạch**

Website thuê xe gồm **trang khách hàng** và **bảng điều khiển quản trị**, viết bằng HTML, CSS, JavaScript thuần và PHP.
Dữ liệu lưu trong file JSON nên không cần database. Chạy được trên hosting miễn phí như InfinityFree.

![PHP](https://img.shields.io/badge/PHP-8%2B-777BB4?logo=php&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-thuần-F7DF1E?logo=javascript&logoColor=black)
![Song ngữ](https://img.shields.io/badge/Ngôn_ngữ-Việt_%7C_English-5b3fd9)
![Giao diện](https://img.shields.io/badge/Giao_diện-Sáng_%7C_Tối-141a2e)

[English](README.md) · **Tiếng Việt**

</div>

---

## 📸 Hình ảnh ứng dụng

<table>
  <tr>
    <td width="62%"><img src="docs/screenshots/01-trang-chu.png" alt="Trang chủ GoDrive" /></td>
    <td width="38%">
      <h3>🏠 Trang chủ</h3>
      <p>Giới thiệu dịch vụ, số xe đang sẵn sàng và ô tìm xe theo địa điểm, ngày nhận và ngày trả xe.</p>
    </td>
  </tr>
  <tr>
    <td width="38%">
      <h3>🌙 Chế độ tối & tiếng Anh</h3>
      <p>Lọc xe theo loại, sắp xếp theo giá hoặc độ nổi bật. Có nút chuyển Việt ↔ Anh và sáng ↔ tối ngay trên thanh menu.</p>
    </td>
    <td width="62%"><img src="docs/screenshots/02-danh-sach-xe-dark-en.png" alt="Danh sách xe ở chế độ tối, tiếng Anh" /></td>
  </tr>
  <tr>
    <td width="62%"><img src="docs/screenshots/03-dat-xe.png" alt="Form đặt xe" /></td>
    <td width="38%">
      <h3>📝 Đặt xe</h3>
      <p>Chỉ cần họ tên, số điện thoại và email. Tổng tiền được tính sẵn theo số ngày thuê. Nhập sai sẽ được báo ngay dưới từng ô.</p>
    </td>
  </tr>
  <tr>
    <td width="38%">
      <h3>📊 Bảng điều khiển admin</h3>
      <p>Doanh thu thật theo 7 hoặc 30 ngày, so sánh với kỳ trước, trạng thái đơn, tình trạng đội xe và danh sách việc cần xử lý.</p>
    </td>
    <td width="62%"><img src="docs/screenshots/04-admin-dashboard.png" alt="Dashboard quản trị" /></td>
  </tr>
  <tr>
    <td width="62%"><img src="docs/screenshots/05-admin-doi-xe-dark.png" alt="Quản lý đội xe ở chế độ tối" /></td>
    <td width="38%">
      <h3>🚙 Quản lý đội xe</h3>
      <p>Thêm, sửa, xóa xe, đổi trạng thái ngay trên thẻ xe, đánh dấu xe nổi bật và thêm ảnh xe bằng đường link.</p>
    </td>
  </tr>
  <tr>
    <td width="38%">
      <h3>📱 Tối ưu cho điện thoại</h3>
      <p>Cả trang khách và trang admin đều hiển thị tốt trên màn hình nhỏ: menu thu gọn, form dạng trượt từ dưới lên.</p>
    </td>
    <td width="62%"><img src="docs/screenshots/06-mobile.png" alt="Giao diện trên điện thoại" /></td>
  </tr>
</table>

---

## ✨ Tính năng

### Dành cho khách hàng

- Xem danh sách xe, lọc theo loại (Sedan / SUV / Hatchback) và địa điểm, sắp xếp theo giá hoặc độ nổi bật
- Đặt xe **không cần tạo tài khoản**, tổng tiền tự tính theo số ngày thuê
- Tự động **chặn đặt trùng lịch** trên cùng một xe
- Tra cứu trạng thái đơn bằng **email và số điện thoại** đã dùng khi đặt
- Ghi nhớ thông tin liên hệ cho lần đặt sau
- **Song ngữ Việt - Anh** và **chế độ sáng/tối** (lần đầu tự theo cài đặt của máy)

### Dành cho quản trị viên (`/admin`)

- Dashboard với doanh thu thực tế, xu hướng so với kỳ trước và danh sách việc cần làm
- Quản lý đơn: duyệt, bàn giao xe, hủy đơn, xem chi tiết, gọi hoặc gửi email cho khách
- Quản lý đội xe, khách hàng, thanh toán và lịch bảo trì
- Xuất file CSV cho đơn đặt xe, khách hàng và thanh toán
- Tạo/xóa tài khoản admin, đổi mật khẩu
- Tự làm mới dữ liệu mỗi phút, phím tắt `/` để nhảy tới ô tìm kiếm
- Song ngữ và chế độ sáng/tối giống trang khách

---

## 🚀 Cài đặt và chạy trên máy

### 1. Cài PHP 8 trở lên

- **Windows:** mở PowerShell và chạy
  ```powershell
  winget install PHP.PHP.8.4
  ```
  Sau khi cài xong, **mở lại terminal** để dùng được lệnh `php`.
- **macOS:** `brew install php`
- **Ubuntu/Debian:** `sudo apt install php-cli`

Kiểm tra bằng lệnh `php -v`.

### 2. Tải mã nguồn

```bash
git clone https://github.com/s1gnuh/Car-Rental-App-GoDrive.git
cd Car-Rental-App-GoDrive
```

### 3. Chạy ứng dụng

```bash
php -S localhost:8080 router.php
```

Mở trình duyệt:

| Trang | Địa chỉ |
|---|---|
| Trang khách hàng | http://localhost:8080/ |
| Trang quản trị | http://localhost:8080/admin |

**Tài khoản admin mặc định:** `admin` / `admin123`. Hãy **đổi mật khẩu ngay** sau lần đăng nhập đầu tiên.

> ⚠️ Không mở trực tiếp file `index.html` bằng cách nhấp đúp hoặc dùng Live Server, vì khi đó phần PHP (API) sẽ không chạy và trang không tải được danh sách xe.

---

## 📖 Hướng dẫn sử dụng cho khách hàng

### Tìm xe

1. Ở ô tìm kiếm trên trang chủ, chọn **Địa điểm nhận xe**, **Ngày nhận xe** và **Ngày trả xe**, rồi bấm **Tìm xe**.
2. Trong mục **Chọn chiếc xe phù hợp**, bấm **Sedan**, **SUV** hoặc **Hatchback** để lọc theo loại xe.
3. Dùng ô sắp xếp bên phải để xem theo **Nổi bật nhất**, **Giá thấp đến cao** hoặc **Giá cao đến thấp**.
4. Xe có nhãn **Đang cho thuê** hoặc nút **Không khả dụng** thì tạm thời chưa đặt được.

### Đặt xe

1. Bấm nút **Đặt xe** trên thẻ xe bạn muốn thuê.
2. Điền thông tin liên hệ:
   - **Họ và tên:** chỉ gồm chữ cái (có dấu tiếng Việt) và khoảng trắng.
   - **Số điện thoại:** chỉ gồm chữ số, 9 đến 10 số.
   - **Email:** để nhận thông tin và tra cứu đơn.
3. Chọn địa điểm, ngày nhận và ngày trả xe. Thời gian thuê tối đa là 90 ngày.
4. Kiểm tra **Tổng cộng** (giá thuê một ngày × số ngày) rồi bấm **Xác nhận đặt xe**.
5. Màn hình thành công hiển thị **mã đơn**. Đơn có trạng thái **Chờ xác nhận** cho tới khi GoDrive gọi điện xác nhận.

> Bạn chưa phải thanh toán khi đặt xe. Nếu xe đã có người đặt trong khoảng ngày bạn chọn, hệ thống sẽ báo và không cho đặt trùng.

### Tra cứu đơn đã đặt

1. Bấm **Tra cứu đơn** trên thanh menu, hoặc ở chân trang.
2. Nhập **đúng email và số điện thoại** đã dùng khi đặt. Cần cả hai thông tin để bảo vệ đơn của bạn.
3. Bấm **Xem đơn của tôi** để xem danh sách đơn, ngày thuê, tổng tiền và trạng thái: *Chờ xác nhận*, *Đã xác nhận* hoặc *Đã hủy*.

### Đổi ngôn ngữ và giao diện

- Bấm nút **🌐 EN / VI** để chuyển giữa tiếng Việt và tiếng Anh.
- Bấm nút **☀ / 🌙** để chuyển giữa chế độ sáng và tối.
- Lựa chọn được ghi nhớ cho những lần truy cập sau và dùng chung cho cả trang admin.

---

## 🛠️ Hướng dẫn sử dụng cho quản trị viên

### Đăng nhập

Vào `/admin`, nhập tên đăng nhập (hoặc email) và mật khẩu. Bấm biểu tượng 👁 để hiện hoặc ẩn mật khẩu. Phiên đăng nhập có hiệu lực 7 ngày.

### Tổng quan (Dashboard)

- **4 thẻ số liệu:** doanh thu đã xác nhận, số đơn chờ duyệt (bấm vào để mở danh sách đơn chờ duyệt), số xe đang cho thuê, số khách hàng.
- **Biểu đồ doanh thu:** chọn **7 ngày** hoặc **30 ngày**. Doanh thu tính theo ngày đặt của các đơn đã xác nhận.
- **Trạng thái đơn**, **tình trạng đội xe** và **việc cần làm**. Có thể duyệt đơn ngay trong mục việc cần làm.

### Đơn đặt xe

Quy trình xử lý một đơn:

```
Chờ duyệt ──[Duyệt]──▶ Đã xác nhận ──[Bàn giao]──▶ Xe chuyển sang "Đang thuê"
    │                        │
    └────────[Hủy]───────────┴──▶ Đã hủy (xe đang thuê được trả về "Sẵn sàng")
```

- Dùng các tab **Tất cả / Chờ duyệt / Đã xác nhận / Đã hủy** và ô tìm kiếm (theo mã đơn, tên khách, số điện thoại, email, tên xe).
- Bấm vào một dòng để xem **chi tiết đơn**, có nút gọi điện cho khách.
- Hủy đơn luôn có hộp thoại xác nhận để tránh bấm nhầm.
- Bấm **Xuất CSV** để tải danh sách đơn, mở được bằng Excel.

### Đội xe

- **Thêm xe:** bấm **+ Thêm xe**, nhập tên, hãng, loại, số chỗ, giá thuê/ngày, địa điểm. Ảnh xe là đường link bắt đầu bằng `https://`.
- Tích **Đánh dấu là xe nổi bật** để xe có nhãn "Được yêu thích" và được ưu tiên hiển thị trên trang khách.
- **Đổi trạng thái:** chọn trực tiếp *Sẵn sàng / Đang thuê / Bảo trì* trên thẻ xe. Khi khách trả xe, chuyển xe về **Sẵn sàng**.
- Xe ở trạng thái **Bảo trì** sẽ bị ẩn khỏi trang khách.

### Khách hàng

Khách hàng được tự động thêm vào danh sách khi đặt xe lần đầu. Mỗi lần đặt tiếp theo sẽ cộng dồn số đơn và tổng chi tiêu. Danh sách được sắp xếp theo mức chi tiêu và xuất được ra CSV.

### Thanh toán

Hiển thị tổng tiền đã thu, chờ thanh toán, đã hoàn tiền và lịch sử giao dịch. Có lọc theo trạng thái và xuất CSV. Dữ liệu được đọc từ `data/payments.json`. Phiên bản hiện tại chưa tích hợp cổng thanh toán online.

### Bảo trì

1. Bấm **+ Lên lịch bảo trì**, chọn xe, hạng mục, ngày bắt đầu, ngày kết thúc, chi phí và ghi chú.
2. Bấm **Bắt đầu**: xe tự chuyển sang trạng thái **Bảo trì**.
3. Bấm **Hoàn thành**: xe tự trở lại trạng thái **Sẵn sàng**.

### Tài khoản và bảo mật

- **Tài khoản admin** (thanh bên trái): xem danh sách, tạo tài khoản mới, xóa tài khoản khác. Không thể tự xóa chính mình và luôn phải còn ít nhất một admin.
- **Đổi mật khẩu:** nhập mật khẩu hiện tại và mật khẩu mới (ít nhất 6 ký tự). Thanh màu cho biết độ mạnh của mật khẩu.

### Mẹo

- Nhấn phím `/` để nhảy tới ô tìm kiếm của trang đang xem.
- Nhấn `Esc` để đóng hộp thoại.
- Dữ liệu tự làm mới mỗi phút. Bấm biểu tượng ↻ để làm mới ngay.

---

## ☁️ Đưa lên hosting (InfinityFree hoặc hosting PHP bất kỳ)

1. Tải toàn bộ mã nguồn lên thư mục gốc của website (với InfinityFree là `htdocs`).
2. Đảm bảo thư mục `data/` **cho phép ghi**, để lưu đơn đặt xe và file secret.
3. Truy cập `https://ten-mien-cua-ban/data/admins.json`: trang **phải báo lỗi 403 (bị từ chối)**. Nếu xem được nội dung file thì `.htaccess` chưa hoạt động.
4. Đăng nhập `/admin` và **đổi mật khẩu mặc định ngay**.

> File `router.php` chỉ dùng khi chạy trên máy. Trên hosting Apache, các file `.htaccess` sẽ đảm nhận việc định tuyến và chặn truy cập thư mục `data/`.

### Cập nhật website đang chạy

1. Tạo gói deploy (PowerShell trên Windows, trong thư mục dự án):
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\build-deploy.ps1
   ```
   Script sẽ ghi số phiên bản mới vào `version.json` và các đường dẫn `?v=` trong HTML, rồi tạo `..\godrive-deploy.zip` **không chứa thư mục `data/`**.
2. Trong File Manager, upload file zip vào `htdocs`, **Extract** với tùy chọn **Overwrite**, rồi xóa file zip.
3. Mở trang admin → bấm **Tải lại bản mới nhất** (thanh bên trái). Tab **Hướng dẫn → Cập nhật website** cho biết phiên bản bạn đang dùng và phiên bản trên server.

> Không bao giờ upload thư mục `data/` đè lên website đang chạy, vì sẽ mất đơn đặt xe thật. Trình duyệt của khách cũng tự nhận bản mới ở lần truy cập tiếp theo nhờ cơ chế kiểm tra phiên bản và header chống bộ nhớ đệm trong `.htaccess`.

---

## 🗂️ Cấu trúc thư mục

```
├── index.html            # Trang khách hàng
├── admin.html            # Trang quản trị
├── css/
│   ├── style.css         # Giao diện trang khách (sáng/tối)
│   └── admin.css         # Giao diện trang admin (sáng/tối)
├── js/
│   ├── app.js            # Logic trang khách + bản dịch Việt/Anh
│   └── admin.js          # Logic trang admin + bản dịch Việt/Anh
├── api/                  # API viết bằng PHP
│   ├── _helpers.php      # Hàm dùng chung: đọc/ghi JSON, token, kiểm tra dữ liệu
│   ├── login.php         # Đăng nhập, đổi mật khẩu, quản lý admin
│   ├── products.php      # Danh sách và quản lý xe
│   ├── orders.php        # Đặt xe, tra cứu, duyệt/hủy đơn
│   └── users.php         # Khách hàng, thanh toán, bảo trì
├── data/                 # Dữ liệu JSON (bị chặn truy cập từ web)
├── docs/screenshots/     # Ảnh chụp màn hình dùng trong README
├── .htaccess             # Cấu hình Apache: /admin, chặn file ẩn
└── router.php            # Bộ định tuyến khi chạy bằng php -S trên máy
```

### Các file dữ liệu

| File | Nội dung |
|---|---|
| `data/cars.json` | Danh sách xe |
| `data/bookings.json` | Đơn đặt xe |
| `data/customers.json` | Khách hàng (tự tạo khi đặt xe) |
| `data/payments.json` | Lịch sử thanh toán |
| `data/maintenance.json` | Lịch bảo trì |
| `data/admins.json` | Tài khoản admin (mật khẩu đã được mã hóa bcrypt) |
| `data/.jwt_secret` | Khóa ký phiên đăng nhập, **tự sinh** lần chạy đầu, không đưa lên Git |

---

## 🔌 API

| Endpoint | Phương thức | Chức năng | Cần đăng nhập |
|---|---|---|---|
| `api/products.php` | GET | Danh sách xe | Không |
| `api/products.php` | POST / PUT / PATCH / DELETE | Thêm, sửa, đổi trạng thái, xóa xe | Có |
| `api/orders.php` | POST | Khách đặt xe | Không |
| `api/orders.php?action=lookup` | GET | Tra cứu đơn (cần cả email và số điện thoại) | Không |
| `api/orders.php` | GET / PATCH | Xem tất cả đơn, duyệt/hủy/bàn giao | Có |
| `api/login.php` | POST | Đăng nhập, nhận token | Không |
| `api/login.php?action=...` | GET / POST / DELETE | Thông tin admin, đổi mật khẩu, quản lý admin | Có |
| `api/users.php?action=...` | GET / POST / PATCH / DELETE | Khách hàng, thanh toán, bảo trì | Có |

API đọc token qua header `Authorization: Bearer <token>`.

---

## 🔐 Bảo mật

- Khóa ký token được **tự sinh ngẫu nhiên** và lưu trong `data/.jwt_secret` (đã có trong `.gitignore`). Có thể đặt cố định bằng biến môi trường `GODRIVE_JWT_SECRET` (tối thiểu 16 ký tự). Xóa file này sẽ đăng xuất toàn bộ admin.
- Mật khẩu admin được mã hóa bằng **bcrypt**.
- Mọi dữ liệu do khách nhập đều được **escape khi hiển thị** để chống XSS. Link ảnh chỉ chấp nhận `http(s)`, file CSV xuất ra được chặn công thức Excel.
- Mọi API ghi đều **kiểm tra dữ liệu đầu vào** và chạy tuần tự bằng khóa file (`data/.write.lock`), nên không mất dữ liệu khi nhiều người đặt xe cùng lúc.
- Thư mục `data/` và các file ẩn bị chặn truy cập trực tiếp, cả trên hosting (`.htaccess`) lẫn khi chạy trên máy (`router.php`).

---

## ❓ Khắc phục sự cố

<details>
<summary><b>Trang không hiện danh sách xe / báo "Không kết nối được máy chủ"</b></summary>

Bạn đang mở file HTML trực tiếp hoặc chưa chạy PHP. Hãy chạy `php -S localhost:8080 router.php` trong thư mục dự án rồi mở http://localhost:8080.
</details>

<details>
<summary><b>Gõ lệnh <code>php</code> báo "không tìm thấy lệnh"</b></summary>

PHP chưa được cài, hoặc terminal chưa nhận đường dẫn mới. Hãy đóng terminal, mở lại rồi chạy `php -v`.
</details>

<details>
<summary><b>Quên mật khẩu admin</b></summary>

Tạo mã băm mật khẩu mới:

```bash
php -r "echo password_hash('matkhaumoi', PASSWORD_BCRYPT);"
```

Mở `data/admins.json` và thay giá trị `passwordHash` của tài khoản bằng chuỗi vừa tạo.
</details>

<details>
<summary><b>Trên hosting, đăng nhập được nhưng các thao tác báo "Chưa đăng nhập"</b></summary>

Một số hosting làm mất header `Authorization`. File `.htaccess` đã có sẵn dòng chuyển tiếp header này, hãy chắc chắn bạn đã tải cả file `.htaccess` (là file ẩn) lên hosting.
</details>

<details>
<summary><b>Giao diện chưa cập nhật sau khi sửa code</b></summary>

Nhấn **Ctrl + F5** (macOS: **Cmd + Shift + R**) để trình duyệt tải lại CSS và JS mới.
</details>

---

## 🗺️ Định hướng phát triển

- [ ] Thanh toán online (VNPay / MoMo) và đặt cọc
- [ ] Gửi email/SMS xác nhận khi đặt xe và khi đơn được duyệt
- [ ] Khách tự hủy đơn khi đơn còn chờ duyệt
- [ ] Lịch hiển thị những ngày xe đã có người đặt
- [ ] Trang chi tiết xe với nhiều ảnh và đánh giá từ khách đã thuê
- [ ] Ghi nhận giao/nhận xe: số km, mức xăng, ảnh tình trạng xe
- [ ] Xuất hóa đơn PDF, phân quyền admin, nhật ký thao tác
- [ ] Chuyển dữ liệu từ JSON sang MySQL khi số lượng đơn lớn

---

## 📞 Liên hệ

- Hotline: **0365 551 920**
- Email: support@godrive.vn

<div align="center"><sub>© 2026 GoDrive. Bản quyền thuộc về GoDrive.</sub></div>
