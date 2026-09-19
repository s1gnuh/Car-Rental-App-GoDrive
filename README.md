# GoRide — Ứng dụng thuê xe

Website thuê xe GoRide: trang khách đặt xe không cần tài khoản, kèm bảng điều khiển admin.

## Tính năng

- **Khách hàng:** xem xe, lọc/sắp xếp, đặt xe, tra cứu đơn theo email/SĐT
- **Admin:** đăng nhập, quản lý đơn/xe/khách hàng/thanh toán/bảo trì, đổi mật khẩu, tạo admin
- **Ảnh xe:** gắn bằng URL ảnh (không upload file)

## Cấu trúc (InfinityFree)

```
├── index.html          # Trang khách
├── admin.html          # Trang admin (/admin)
├── .htaccess
├── router.php          # Chỉ dùng khi chạy local bằng PHP built-in server
├── css/
│   ├── style.css
│   └── admin.css
├── js/
│   ├── app.js
│   └── admin.js
├── api/
│   ├── login.php       # Đăng nhập / admin
│   ├── products.php    # Xe
│   ├── orders.php      # Đơn đặt xe
│   └── users.php       # Khách hàng, thanh toán, bảo trì
└── data/               # JSON lưu dữ liệu
```

## Chạy local

Cần [PHP 8+](https://www.php.net/downloads).

```bash
php -S localhost:8080 router.php
```

- Trang chủ: http://localhost:8080/
- Admin: http://localhost:8080/admin

**Tài khoản admin mặc định:** `admin` / `admin123` — hãy đổi mật khẩu sau khi chạy.

> Không dùng Live Server / mở file HTML trực tiếp: API PHP sẽ không hoạt động.

## Deploy InfinityFree

1. Tạo hosting + subdomain trên [InfinityFree](https://www.infinityfree.com)
2. Upload toàn bộ project vào thư mục **`htdocs`** (có thể bỏ `router.php`)
3. Xóa file mặc định trong `htdocs` nếu có
4. Cấp quyền ghi cho thư mục **`data/`** (755 hoặc 777)
5. Truy cập:
   - `https://ten-mien.infinityfreeapp.com/`
   - `https://ten-mien.infinityfreeapp.com/admin`

### Checklist sau khi upload

- [ ] Có `.htaccess`, `index.html`, `admin.html`, `api/`, `css/`, `js/`, `data/`
- [ ] Trang chủ hiện danh sách xe
- [ ] Đăng nhập `/admin` thành công
- [ ] Đổi mật khẩu admin

## API (tóm tắt)

| File | Vai trò |
|------|---------|
| `api/login.php` | Login, me, đổi mật khẩu, quản lý admin |
| `api/products.php` | CRUD xe (GET công khai) |
| `api/orders.php` | Đặt xe, tra cứu, duyệt đơn |
| `api/users.php` | Khách hàng, payments, bảo trì |

Dữ liệu lưu trong `data/*.json`. Thư mục `data/` bị chặn truy cập trực tiếp qua web (`.htaccess`).

## Công nghệ

HTML · CSS · JavaScript · PHP (JSON file storage) — phù hợp hosting InfinityFree, không cần Node.js hay database.
