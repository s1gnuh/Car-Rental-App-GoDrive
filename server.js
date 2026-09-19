const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || "goride-secret-key-2024";
const DATA_DIR = path.join(__dirname, "data");

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use(express.static(__dirname));

const DATA_FILES = {
  cars: "cars.json",
  bookings: "bookings.json",
  customers: "customers.json",
  payments: "payments.json",
  maintenance: "maintenance.json",
  admins: "admins.json"
};

function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const defaults = {
    cars: [
      { id: 1, name: "Toyota Camry", brand: "Toyota", type: "Sedan", seats: 5, price: 850000, location: "Hà Nội", status: "available", rating: 4.9, featured: true },
      { id: 2, name: "Mazda CX-5", brand: "Mazda", type: "SUV", seats: 5, price: 950000, location: "TP. Hồ Chí Minh", status: "rented", rating: 4.8, featured: true },
      { id: 3, name: "Honda City", brand: "Honda", type: "Sedan", seats: 5, price: 650000, location: "Đà Nẵng", status: "available", rating: 4.7, featured: false },
      { id: 4, name: "VinFast VF 8", brand: "VinFast", type: "SUV", seats: 5, price: 1100000, location: "Hà Nội", status: "maintenance", rating: 4.9, featured: true },
      { id: 5, name: "Hyundai Grand i10", brand: "Hyundai", type: "Hatchback", seats: 5, price: 500000, location: "TP. Hồ Chí Minh", status: "available", rating: 4.6, featured: false },
      { id: 6, name: "Kia Seltos", brand: "Kia", type: "SUV", seats: 5, price: 780000, location: "Đà Nẵng", status: "available", rating: 4.8, featured: true },
      { id: 7, name: "Toyota Vios", brand: "Toyota", type: "Sedan", seats: 5, price: 600000, location: "Hà Nội", status: "available", rating: 4.7, featured: false },
      { id: 8, name: "Honda Brio", brand: "Honda", type: "Hatchback", seats: 5, price: 480000, location: "TP. Hồ Chí Minh", status: "available", rating: 4.6, featured: false }
    ],
    bookings: [
      { id: 10001, userId: null, customerName: "Nguyễn Minh Anh", customerEmail: "minhanh@example.com", customerPhone: "0912 345 678", carId: 1, carName: "Toyota Camry", startDate: "2026-09-20", endDate: "2026-09-22", location: "Hà Nội", total: 1700000, status: "pending", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 10002, userId: null, customerName: "Trần Hoàng Nam", customerEmail: "hoangnam@example.com", customerPhone: "0987 654 321", carId: 2, carName: "Mazda CX-5", startDate: "2026-09-19", endDate: "2026-09-21", location: "TP. Hồ Chí Minh", total: 1900000, status: "confirmed", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 10003, userId: null, customerName: "Lê Thu Hà", customerEmail: "thuha@example.com", customerPhone: "0909 111 222", carId: 3, carName: "Honda City", startDate: "2026-09-24", endDate: "2026-09-25", location: "Đà Nẵng", total: 650000, status: "cancelled", createdAt: new Date(Date.now() - 86400000 * 6).toISOString() }
    ],
    customers: [
      { id: 1, name: "Nguyễn Văn Khánh", email: "khanh@example.com", phone: "0901 111 001", joinedAt: "2026-06-12", totalBookings: 15, totalSpent: 12500000, tier: "gold" },
      { id: 2, name: "Nguyễn Minh Anh", email: "minhanh@example.com", phone: "0912 345 678", joinedAt: "2026-07-03", totalBookings: 8, totalSpent: 6800000, tier: "silver" },
      { id: 3, name: "Trần Hoàng Nam", email: "hoangnam@example.com", phone: "0987 654 321", joinedAt: "2026-05-19", totalBookings: 22, totalSpent: 18900000, tier: "gold" },
      { id: 4, name: "Lê Thu Hà", email: "thuha@example.com", phone: "0909 111 222", joinedAt: "2026-08-01", totalBookings: 3, totalSpent: 1950000, tier: "bronze" },
      { id: 5, name: "Phạm Quốc Bảo", email: "quocbao@example.com", phone: "0977 000 888", joinedAt: "2026-04-22", totalBookings: 31, totalSpent: 27500000, tier: "platinum" },
      { id: 6, name: "Đặng Thị Lan", email: "lan@example.com", phone: "0933 222 444", joinedAt: "2026-08-15", totalBookings: 2, totalSpent: 1200000, tier: "bronze" }
    ],
    payments: [
      { id: 9001, bookingId: 10002, customerName: "Trần Hoàng Nam", amount: 1900000, method: "Chuyển khoản", status: "paid", paidAt: "2026-09-18 14:22", txnCode: "TXN-20260918-1A2B" },
      { id: 9002, bookingId: 10003, customerName: "Lê Thu Hà", amount: 650000, method: "Thẻ tín dụng", status: "refunded", paidAt: "2026-09-15 09:11", txnCode: "TXN-20260915-3C4D" },
      { id: 9003, bookingId: 10001, customerName: "Nguyễn Minh Anh", amount: 1700000, method: "COD", status: "pending", paidAt: "", txnCode: "TXN-20260917-5E6F" },
      { id: 9004, bookingId: 0, customerName: "Phạm Quốc Bảo", amount: 5400000, method: "Ví MoMo", status: "paid", paidAt: "2026-09-10 16:45", txnCode: "TXN-20260910-7G8H" },
      { id: 9005, bookingId: 0, customerName: "Nguyễn Văn Khánh", amount: 2550000, method: "Chuyển khoản", status: "paid", paidAt: "2026-09-05 10:02", txnCode: "TXN-20260905-9I0J" }
    ],
    maintenance: [
      { id: 701, carId: 4, carName: "VinFast VF 8", type: "Bảo dưỡng định kỳ 10.000km", cost: 1200000, startDate: "2026-09-18", endDate: "2026-09-20", status: "in_progress", note: "Thay dầu, kiểm tra phanh và lọc gió" },
      { id: 702, carId: 7, carName: "Toyota Vios", type: "Sửa chữa lốp xe", cost: 1800000, startDate: "2026-09-10", endDate: "2026-09-11", status: "completed", note: "Thay 2 lốp trước mới Bridgestone" },
      { id: 703, carId: 2, carName: "Mazda CX-5", type: "Kiểm tra tổng quát", cost: 500000, startDate: "2026-09-25", endDate: "2026-09-25", status: "scheduled", note: "Kiểm tra trước chuyến đi dài" },
      { id: 704, carId: 5, carName: "Hyundai Grand i10", type: "Bảo dưỡng 20.000km", cost: 1650000, startDate: "2026-10-02", endDate: "2026-10-03", status: "scheduled", note: "Thay dầu máy, lọc dầu, lọc gió" }
    ],
    admins: [
      { id: 1, username: "admin", name: "Administrator", email: "admin@goride.vn", passwordHash: bcrypt.hashSync("admin123", 10), createdAt: new Date().toISOString() }
    ]
  };

  Object.entries(DATA_FILES).forEach(([key, file]) => {
    const fullPath = path.join(DATA_DIR, file);
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, JSON.stringify(defaults[key] || [], null, 2));
    }
  });
}

ensureDataFiles();

function readJSON(file) {
  const fullPath = path.join(DATA_DIR, file);
  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  } catch (e) {
    return [];
  }
}

function writeJSON(file, data) {
  const fullPath = path.join(DATA_DIR, file);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => Number(x.id) || 0)) + 1 : 1;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Chưa đăng nhập" });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token không hợp lệ" });
  }
}

/* ======== PUBLIC DATA (for User page) ======== */
app.get("/api/cars", (req, res) => {
  const { status, location, type } = req.query;
  let cars = readJSON(DATA_FILES.cars);
  if (status) cars = cars.filter(c => c.status === status);
  if (location) cars = cars.filter(c => c.location === location);
  if (type) cars = cars.filter(c => c.type === type);
  res.json(cars);
});

app.get("/api/bookings/lookup", (req, res) => {
  const { email, phone } = req.query;
  if (!email && !phone) return res.status(400).json({ error: "Cần email hoặc số điện thoại" });
  const bookings = readJSON(DATA_FILES.bookings).filter(b =>
    (email && b.customerEmail && b.customerEmail.toLowerCase() === String(email).toLowerCase()) ||
    (phone && b.customerPhone && String(b.customerPhone).replace(/\s+/g, "") === String(phone).replace(/\s+/g, ""))
  ).sort((a, b) => Number(b.id) - Number(a.id));
  res.json(bookings);
});

app.post("/api/bookings", (req, res) => {
  const { customerName, customerEmail, customerPhone, carId, startDate, endDate, location } = req.body || {};
  if (!customerName || !customerEmail || !customerPhone || !carId || !startDate || !endDate) {
    return res.status(400).json({ error: "Thiếu thông tin đặt xe" });
  }
  const cars = readJSON(DATA_FILES.cars);
  const car = cars.find(c => Number(c.id) === Number(carId));
  if (!car) return res.status(404).json({ error: "Không tìm thấy xe" });
  if (car.status !== "available") return res.status(400).json({ error: "Xe không khả dụng" });

  const bookings = readJSON(DATA_FILES.bookings);
  const hasOverlap = bookings.some(b =>
    Number(b.carId) === Number(carId) &&
    ["pending", "confirmed"].includes(b.status) &&
    new Date(startDate) < new Date(b.endDate) &&
    new Date(endDate) > new Date(b.startDate)
  );
  if (hasOverlap) return res.status(400).json({ error: "Xe đã có đơn trong khoảng thời gian này" });

  const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000));
  const total = days * Number(car.price);

  const newBooking = {
    id: Date.now(),
    userId: null,
    customerName,
    customerEmail,
    customerPhone,
    carId: Number(carId),
    carName: car.name,
    startDate,
    endDate,
    location: location || car.location,
    total,
    status: "pending",
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  writeJSON(DATA_FILES.bookings, bookings);

  const customers = readJSON(DATA_FILES.customers);
  let customer = customers.find(c => c.email.toLowerCase() === customerEmail.toLowerCase() || c.phone === customerPhone);
  if (!customer) {
    customer = {
      id: nextId(customers),
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      joinedAt: new Date().toISOString().slice(0, 10),
      totalBookings: 1,
      totalSpent: total,
      tier: "bronze"
    };
    customers.push(customer);
  } else {
    customer.totalBookings = (customer.totalBookings || 0) + 1;
    customer.totalSpent = (customer.totalSpent || 0) + total;
  }
  writeJSON(DATA_FILES.customers, customers);

  res.json(newBooking);
});

/* ======== AUTH ======== */
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Thiếu thông tin" });
  const admins = readJSON(DATA_FILES.admins);
  const admin = admins.find(a => a.username === username || (a.email && a.email.toLowerCase() === String(username).toLowerCase()));
  if (!admin) return res.status(401).json({ error: "Tài khoản không tồn tại" });
  if (!bcrypt.compareSync(password, admin.passwordHash)) return res.status(401).json({ error: "Sai mật khẩu" });
  const token = jwt.sign({ id: admin.id, username: admin.username }, SECRET, { expiresIn: "7d" });
  res.json({ token, admin: { id: admin.id, username: admin.username, name: admin.name, email: admin.email } });
});

app.get("/api/admin/me", authMiddleware, (req, res) => {
  const admins = readJSON(DATA_FILES.admins);
  const admin = admins.find(a => Number(a.id) === Number(req.admin.id));
  if (!admin) return res.status(404).json({ error: "Không tìm thấy" });
  res.json({ id: admin.id, username: admin.username, name: admin.name, email: admin.email, createdAt: admin.createdAt });
});

app.post("/api/admin/change-password", authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "Mật khẩu mới ít nhất 6 ký tự" });
  }
  const admins = readJSON(DATA_FILES.admins);
  const idx = admins.findIndex(a => Number(a.id) === Number(req.admin.id));
  if (idx < 0) return res.status(404).json({ error: "Tài khoản không tồn tại" });
  if (!bcrypt.compareSync(oldPassword, admins[idx].passwordHash)) {
    return res.status(400).json({ error: "Mật khẩu cũ sai" });
  }
  admins[idx].passwordHash = bcrypt.hashSync(newPassword, 10);
  writeJSON(DATA_FILES.admins, admins);
  res.json({ success: true });
});

app.get("/api/admin/admins", authMiddleware, (req, res) => {
  const admins = readJSON(DATA_FILES.admins).map(a => ({ id: a.id, username: a.username, name: a.name, email: a.email, createdAt: a.createdAt }));
  res.json(admins);
});

app.post("/api/admin/admins", authMiddleware, (req, res) => {
  const { username, password, name, email } = req.body || {};
  if (!username || !password || !name) return res.status(400).json({ error: "Thiếu thông tin" });
  if (String(password).length < 6) return res.status(400).json({ error: "Mật khẩu ít nhất 6 ký tự" });
  const admins = readJSON(DATA_FILES.admins);
  if (admins.some(a => a.username === username)) return res.status(400).json({ error: "Username đã tồn tại" });
  if (email && admins.some(a => a.email && a.email.toLowerCase() === String(email).toLowerCase())) {
    return res.status(400).json({ error: "Email đã tồn tại" });
  }
  const newAdmin = {
    id: nextId(admins),
    username,
    name,
    email: email || "",
    passwordHash: bcrypt.hashSync(password, 10),
    createdAt: new Date().toISOString()
  };
  admins.push(newAdmin);
  writeJSON(DATA_FILES.admins, admins);
  res.json({ id: newAdmin.id, username: newAdmin.username, name: newAdmin.name, email: newAdmin.email });
});

app.delete("/api/admin/admins/:id", authMiddleware, (req, res) => {
  const admins = readJSON(DATA_FILES.admins);
  if (admins.length <= 1) return res.status(400).json({ error: "Phải giữ lại ít nhất 1 admin" });
  const idx = admins.findIndex(a => Number(a.id) === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Không tìm thấy" });
  if (Number(admins[idx].id) === Number(req.admin.id)) return res.status(400).json({ error: "Không thể xóa chính mình" });
  admins.splice(idx, 1);
  writeJSON(DATA_FILES.admins, admins);
  res.json({ success: true });
});

/* ======== ADMIN CRUD ======== */
app.get("/api/admin/bookings", authMiddleware, (req, res) => {
  res.json(readJSON(DATA_FILES.bookings).sort((a, b) => Number(b.id) - Number(a.id)));
});

app.patch("/api/admin/bookings/:id", authMiddleware, (req, res) => {
  const bookings = readJSON(DATA_FILES.bookings);
  const idx = bookings.findIndex(b => Number(b.id) === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Không tìm thấy đơn" });
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "Thiếu trạng thái" });
  bookings[idx].status = status;
  writeJSON(DATA_FILES.bookings, bookings);
  if (status === "confirmed" || status === "cancelled") {
    const cars = readJSON(DATA_FILES.cars);
    const carIdx = cars.findIndex(c => Number(c.id) === Number(bookings[idx].carId));
    if (carIdx >= 0 && status === "cancelled" && cars[carIdx].status === "rented") {
      cars[carIdx].status = "available";
      writeJSON(DATA_FILES.cars, cars);
    }
  }
  res.json(bookings[idx]);
});

app.post("/api/admin/bookings/:id/mark-rented", authMiddleware, (req, res) => {
  const bookings = readJSON(DATA_FILES.bookings);
  const idx = bookings.findIndex(b => Number(b.id) === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Không tìm thấy đơn" });
  const cars = readJSON(DATA_FILES.cars);
  const carIdx = cars.findIndex(c => Number(c.id) === Number(bookings[idx].carId));
  if (carIdx >= 0) {
    cars[carIdx].status = "rented";
    writeJSON(DATA_FILES.cars, cars);
  }
  res.json({ success: true });
});

app.get("/api/admin/cars", authMiddleware, (req, res) => res.json(readJSON(DATA_FILES.cars)));

app.post("/api/admin/cars", authMiddleware, (req, res) => {
  const cars = readJSON(DATA_FILES.cars);
  const data = req.body || {};
  const newCar = {
    id: nextId(cars),
    name: data.name,
    brand: data.brand,
    type: data.type || "Sedan",
    seats: Number(data.seats) || 5,
    price: Number(data.price) || 0,
    location: data.location || "Hà Nội",
    status: "available",
    rating: Number(data.rating) || 4.8,
    featured: !!data.featured
  };
  cars.push(newCar);
  writeJSON(DATA_FILES.cars, cars);
  res.json(newCar);
});

app.put("/api/admin/cars/:id", authMiddleware, (req, res) => {
  const cars = readJSON(DATA_FILES.cars);
  const idx = cars.findIndex(c => Number(c.id) === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Không tìm thấy xe" });
  cars[idx] = { ...cars[idx], ...(req.body || {}), id: cars[idx].id, price: Number(req.body.price) || cars[idx].price, seats: Number(req.body.seats) || cars[idx].seats };
  writeJSON(DATA_FILES.cars, cars);
  res.json(cars[idx]);
});

app.delete("/api/admin/cars/:id", authMiddleware, (req, res) => {
  const cars = readJSON(DATA_FILES.cars).filter(c => Number(c.id) !== Number(req.params.id));
  writeJSON(DATA_FILES.cars, cars);
  res.json({ success: true });
});

app.patch("/api/admin/cars/:id/change-status", authMiddleware, (req, res) => {
  const cars = readJSON(DATA_FILES.cars);
  const idx = cars.findIndex(c => Number(c.id) === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Không tìm thấy xe" });
  const { status } = req.body || {};
  if (status) cars[idx].status = status;
  writeJSON(DATA_FILES.cars, cars);
  res.json(cars[idx]);
});

app.get("/api/admin/customers", authMiddleware, (req, res) => res.json(readJSON(DATA_FILES.customers)));

app.get("/api/admin/payments", authMiddleware, (req, res) => res.json(readJSON(DATA_FILES.payments)));

app.get("/api/admin/maintenance", authMiddleware, (req, res) => res.json(readJSON(DATA_FILES.maintenance)));

app.post("/api/admin/maintenance", authMiddleware, (req, res) => {
  const list = readJSON(DATA_FILES.maintenance);
  const data = req.body || {};
  const newItem = {
    id: nextId(list),
    carId: Number(data.carId) || 0,
    carName: data.carName || "",
    type: data.type || "",
    cost: Number(data.cost) || 0,
    startDate: data.startDate || new Date().toISOString().slice(0, 10),
    endDate: data.endDate || new Date().toISOString().slice(0, 10),
    status: data.status || "scheduled",
    note: data.note || ""
  };
  list.push(newItem);
  writeJSON(DATA_FILES.maintenance, list);
  res.json(newItem);
});

app.patch("/api/admin/maintenance/:id", authMiddleware, (req, res) => {
  const list = readJSON(DATA_FILES.maintenance);
  const idx = list.findIndex(m => Number(m.id) === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ error: "Không tìm thấy" });
  list[idx] = { ...list[idx], ...(req.body || {}), id: list[idx].id, cost: Number(req.body.cost) || list[idx].cost };
  const { status } = req.body || {};
  if (status === "in_progress") {
    const cars = readJSON(DATA_FILES.cars);
    const ci = cars.findIndex(c => Number(c.id) === Number(list[idx].carId));
    if (ci >= 0) { cars[ci].status = "maintenance"; writeJSON(DATA_FILES.cars, cars); }
  }
  if (status === "completed") {
    const cars = readJSON(DATA_FILES.cars);
    const ci = cars.findIndex(c => Number(c.id) === Number(list[idx].carId));
    if (ci >= 0 && cars[ci].status === "maintenance") { cars[ci].status = "available"; writeJSON(DATA_FILES.cars, cars); }
  }
  writeJSON(DATA_FILES.maintenance, list);
  res.json(list[idx]);
});

app.delete("/api/admin/maintenance/:id", authMiddleware, (req, res) => {
  const list = readJSON(DATA_FILES.maintenance).filter(m => Number(m.id) !== Number(req.params.id));
  writeJSON(DATA_FILES.maintenance, list);
  res.json({ success: true });
});

/* ======== ADMIN PAGE ROUTE ======== */
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "car-rental-app-admin.html"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function getLocalIPs() {
  const nets = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) ips.push(net.address);
    }
  }
  return ips;
}

app.listen(PORT, "0.0.0.0", () => {
  const ips = getLocalIPs();
  console.log("\n" + "=".repeat(55));
  console.log("  🚗 GoRide Car Rental App - Server đã khởi chạy");
  console.log("=".repeat(55));
  console.log(`  🖥️  Local:       http://localhost:${PORT}`);
  console.log(`  🏠  Homepage:    http://localhost:${PORT}/`);
  console.log(`  🔧  Admin:       http://localhost:${PORT}/admin`);
  ips.forEach(ip => {
    console.log(`  🌐 LAN:         http://${ip}:${PORT}`);
    console.log(`     (User)      http://${ip}:${PORT}/`);
    console.log(`     (Admin)     http://${ip}:${PORT}/admin`);
  });
  console.log("=".repeat(55));
  console.log("  👤 TK Admin mặc định:");
  console.log("     Username: admin   |   Mật khẩu: admin123");
  console.log("=".repeat(55) + "\n");
});
