# 🚗 GoDrive — Ứng dụng thuê xe

GoRide là website thuê xe gồm **trang khách** (đặt xe không cần tài khoản) và **bảng điều khiển admin** để quản lý toàn bộ hoạt động. Dự án viết bằng HTML, CSS, JavaScript thuần và PHP, lưu dữ liệu vào file JSON nên không cần database hay Node.js. Có thể chạy trên hosting miễn phí như InfinityFree.

## ✨ Tính năng

**Khách hàng**
- Xem danh sách xe, lọc theo loại (Sedan / SUV / Hatchback) và địa điểm, sắp xếp theo giá hoặc độ nổi bật
- Đặt xe chỉ với họ tên, số điện thoại và email; tự tính tổng tiền theo số ngày
- Tự động chặn đặt trùng lịch trên cùng một xe
- Tra cứu trạng thái đơn bằng email hoặc số điện thoại

**Admin** (`/admin`)
- Đăng nhập bằng token, đổi mật khẩu, tạo/xóa tài khoản admin
- Dashboard thống kê với biểu đồ doanh thu và trạng thái đơn
- Quản lý đơn đặt xe (duyệt / hủy), đội xe (thêm / sửa / xóa, ảnh xe bằng URL), khách hàng, thanh toán (xuất CSV) và lịch bảo trì
- Trạng thái xe tự cập nhật theo đơn và lịch bảo trì (`available` → `rented` / `maintenance`)

## 🗂️ Cấu trúc

```
├── index.html / admin.html   # Trang khách / trang admin
├── css/  js/                 # Giao diện và logic phía client
├── api/                      # login, products, orders, users (PHP)
├── data/                     # Dữ liệu JSON (bị chặn truy cập trực tiếp qua .htaccess)
├── .htaccess                 # Rewrite /admin, chặn thư mục data
└── router.php                # Chỉ dùng khi chạy local
```

## 🚀 Chạy local

Yêu cầu [PHP 8+](https://www.php.net/downloads).

```bash
php -S localhost:8080 router.php
```

- Trang khách: http://localhost:8080/
- Admin: http://localhost:8080/admin

Tài khoản mặc định: `admin` / `admin123`. **Hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên.**

> Không mở file HTML trực tiếp hoặc dùng Live Server vì API PHP sẽ không hoạt động.


## 🔐 Lưu ý bảo mật trước khi đưa lên production

- Đổi `JWT_SECRET` trong `api/_helpers.php` và không commit secret thật lên GitHub.
- Đổi mật khẩu admin mặc định và không để hash mật khẩu thật trong repo công khai.
- Kiểm tra `data/.htaccess` đã hoạt động (truy cập `/data/admins.json` phải bị từ chối)

## 🔌 API tóm tắt

| Endpoint | Chức năng |
|---|---|
| `api/login.php` | Đăng nhập, thông tin admin, đổi mật khẩu, quản lý admin |
| `api/products.php` | CRUD xe (GET công khai) |
| `api/orders.php` | Đặt xe, tra cứu, duyệt/hủy đơn |
| `api/users.php` | Khách hàng, thanh toán, bảo trì |

## 🛠️ Công nghệ

HTML · CSS · JavaScript · PHP (lưu trữ JSON)
