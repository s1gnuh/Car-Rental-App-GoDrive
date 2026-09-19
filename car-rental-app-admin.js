const API_URL = "http://localhost:3000";
const SOCKET_URL = "http://localhost:3000";

const initialCars = [
    { id: 1, name: "Toyota Camry", brand: "Toyota", type: "Sedan", seats: 5, price: 850000, location: "Hà Nội", status: "available", rating: 4.9 },
    { id: 2, name: "Mazda CX-5", brand: "Mazda", type: "SUV", seats: 5, price: 950000, location: "TP. Hồ Chí Minh", status: "rented", rating: 4.8 },
    { id: 3, name: "Honda City", brand: "Honda", type: "Sedan", seats: 5, price: 650000, location: "Đà Nẵng", status: "available", rating: 4.7 },
    { id: 4, name: "VinFast VF 8", brand: "VinFast", type: "SUV", seats: 5, price: 1100000, location: "Hà Nội", status: "maintenance", rating: 4.9 },
    { id: 5, name: "Hyundai Grand i10", brand: "Hyundai", type: "Hatchback", seats: 5, price: 500000, location: "TP. Hồ Chí Minh", status: "available", rating: 4.6 },
    { id: 6, name: "Kia Seltos", brand: "Kia", type: "SUV", seats: 5, price: 780000, location: "Đà Nẵng", status: "available", rating: 4.8 },
    { id: 7, name: "Toyota Vios", brand: "Toyota", type: "Sedan", seats: 5, price: 600000, location: "Hà Nội", status: "available", rating: 4.7 },
    { id: 8, name: "Honda Brio", brand: "Honda", type: "Hatchback", seats: 5, price: 480000, location: "TP. Hồ Chí Minh", status: "available", rating: 4.6 }
];

const initialBookings = [
    {
        id: 10001,
        userId: 2,
        customerName: "Nguyễn Minh Anh",
        customerEmail: "minhanh@example.com",
        customerPhone: "0912 345 678",
        carId: 1,
        carName: "Toyota Camry",
        startDate: "2026-09-20",
        endDate: "2026-09-22",
        location: "Hà Nội",
        total: 1700000,
        status: "pending",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
        id: 10002,
        userId: 3,
        customerName: "Trần Hoàng Nam",
        customerEmail: "hoangnam@example.com",
        customerPhone: "0987 654 321",
        carId: 2,
        carName: "Mazda CX-5",
        startDate: "2026-09-19",
        endDate: "2026-09-21",
        location: "TP. Hồ Chí Minh",
        total: 1900000,
        status: "confirmed",
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString()
    },
    {
        id: 10003,
        userId: 4,
        customerName: "Lê Thu Hà",
        customerEmail: "thuha@example.com",
        customerPhone: "0909 111 222",
        carId: 3,
        carName: "Honda City",
        startDate: "2026-09-24",
        endDate: "2026-09-25",
        location: "Đà Nẵng",
        total: 650000,
        status: "cancelled",
        createdAt: new Date(Date.now() - 86400000 * 6).toISOString()
    }
];

const initialCustomers = [
    { id: 1, name: "Nguyễn Văn Khánh", email: "khanh@example.com", phone: "0901 111 001", joinedAt: "2026-06-12", totalBookings: 15, totalSpent: 12500000, tier: "gold" },
    { id: 2, name: "Nguyễn Minh Anh", email: "minhanh@example.com", phone: "0912 345 678", joinedAt: "2026-07-03", totalBookings: 8, totalSpent: 6800000, tier: "silver" },
    { id: 3, name: "Trần Hoàng Nam", email: "hoangnam@example.com", phone: "0987 654 321", joinedAt: "2026-05-19", totalBookings: 22, totalSpent: 18900000, tier: "gold" },
    { id: 4, name: "Lê Thu Hà", email: "thuha@example.com", phone: "0909 111 222", joinedAt: "2026-08-01", totalBookings: 3, totalSpent: 1950000, tier: "bronze" },
    { id: 5, name: "Phạm Quốc Bảo", email: "quocbao@example.com", phone: "0977 000 888", joinedAt: "2026-04-22", totalBookings: 31, totalSpent: 27500000, tier: "platinum" },
    { id: 6, name: "Đặng Thị Lan", email: "lan@example.com", phone: "0933 222 444", joinedAt: "2026-08-15", totalBookings: 2, totalSpent: 1200000, tier: "bronze" }
];

const initialPayments = [
    { id: 9001, bookingId: 10002, customerName: "Trần Hoàng Nam", amount: 1900000, method: "Chuyển khoản", status: "paid", paidAt: "2026-09-18 14:22", txnCode: "TXN-20260918-1A2B" },
    { id: 9002, bookingId: 10003, customerName: "Lê Thu Hà", amount: 650000, method: "Thẻ tín dụng", status: "refunded", paidAt: "2026-09-15 09:11", txnCode: "TXN-20260915-3C4D" },
    { id: 9003, bookingId: 10001, customerName: "Nguyễn Minh Anh", amount: 1700000, method: "COD", status: "pending", paidAt: "", txnCode: "TXN-20260917-5E6F" },
    { id: 9004, bookingId: 0, customerName: "Phạm Quốc Bảo", amount: 5400000, method: "Ví MoMo", status: "paid", paidAt: "2026-09-10 16:45", txnCode: "TXN-20260910-7G8H" },
    { id: 9005, bookingId: 0, customerName: "Nguyễn Văn Khánh", amount: 2550000, method: "Chuyển khoản", status: "paid", paidAt: "2026-09-05 10:02", txnCode: "TXN-20260905-9I0J" }
];

const initialMaintenance = [
    { id: 701, carId: 4, carName: "VinFast VF 8", type: "Bảo dưỡng định kỳ 10.000km", cost: 1200000, startDate: "2026-09-18", endDate: "2026-09-20", status: "in_progress", note: "Thay dầu, kiểm tra phanh và lọc gió" },
    { id: 702, carId: 7, carName: "Toyota Vios", type: "Sửa chữa lốp xe", cost: 1800000, startDate: "2026-09-10", endDate: "2026-09-11", status: "completed", note: "Thay 2 lốp trước mới Bridgestone" },
    { id: 703, carId: 2, carName: "Mazda CX-5", type: "Kiểm tra tổng quát", cost: 500000, startDate: "2026-09-25", endDate: "2026-09-25", status: "scheduled", note: "Kiểm tra trước chuyến đi dài" },
    { id: 704, carId: 5, carName: "Hyundai Grand i10", type: "Bảo dưỡng 20.000km", cost: 1650000, startDate: "2026-10-02", endDate: "2026-10-03", status: "scheduled", note: "Thay dầu máy, lọc dầu, lọc gió" }
];

let cars = JSON.parse(localStorage.getItem("goride_cars")) || initialCars;
let bookings = JSON.parse(localStorage.getItem("goride_bookings")) || initialBookings;
let customers = JSON.parse(localStorage.getItem("goride_customers")) || initialCustomers;
let payments = JSON.parse(localStorage.getItem("goride_payments")) || initialPayments;
let maintenance = JSON.parse(localStorage.getItem("goride_maintenance")) || initialMaintenance;

let revenueChart;
let bookingStatusChart;

const money = value =>
    new Intl.NumberFormat("vi-VN").format(value) + " ₫";

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function saveLocalData() {
    localStorage.setItem("goride_cars", JSON.stringify(cars));
    localStorage.setItem("goride_bookings", JSON.stringify(bookings));
    localStorage.setItem("goride_customers", JSON.stringify(customers));
    localStorage.setItem("goride_payments", JSON.stringify(payments));
    localStorage.setItem("goride_maintenance", JSON.stringify(maintenance));
}

function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function statusText(status) {
    const labels = {
        pending: "Chờ duyệt",
        confirmed: "Đã xác nhận",
        cancelled: "Đã hủy",
        available: "Rảnh",
        rented: "Đã thuê",
        maintenance: "Bảo trì",
        paid: "Đã thanh toán",
        refunded: "Đã hoàn tiền",
        in_progress: "Đang thực hiện",
        completed: "Hoàn thành",
        scheduled: "Đã lên lịch",
        gold: "Gold",
        silver: "Silver",
        platinum: "Platinum",
        bronze: "Bronze"
    };

    return labels[status] || status;
}

function statusClass(status) {
    if (["pending", "scheduled"].includes(status)) return "pending";
    if (["confirmed", "available", "paid", "completed", "gold", "platinum"].includes(status)) return "confirmed";
    if (["cancelled", "refunded"].includes(status)) return "cancelled";
    if (["rented", "silver"].includes(status)) return "rented";
    if (["maintenance", "in_progress"].includes(status)) return "maintenance";
    if (status === "bronze") return "pending";
    return "pending";
}

function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
}

function updateTime() {
    $("#lastUpdated").textContent =
        new Date().toLocaleTimeString("vi-VN");
}

function calculateStats() {
    const confirmedRevenue = bookings
        .filter(item => item.status === "confirmed")
        .reduce((sum, item) => sum + Number(item.total || 0), 0);

    const rented = cars.filter(item => item.status === "rented").length;
    const available = cars.filter(item => item.status === "available").length;
    const maint = cars.filter(item => item.status === "maintenance").length;

    $("#revenueStat").textContent = money(confirmedRevenue);
    $("#bookingStat").textContent = bookings.length;
    $("#rentedStat").textContent = rented;
    $("#fleetDetail").textContent = `Trên tổng số ${cars.length} xe`;

    $("#availableCount").textContent = available;
    $("#rentedCount").textContent = rented;
    $("#maintenanceCount").textContent = maint;

    const availablePercent = cars.length
        ? Math.round((available / cars.length) * 100)
        : 0;

    $("#availablePercent").textContent = `${availablePercent}%`;
    $("#totalBookingCenter").textContent = bookings.length;
    $("#customerStat").textContent = customers.length;
}

function renderRevenueChart() {
    const canvas = $("#revenueChart");

    if (revenueChart) {
        revenueChart.destroy();
    }

    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const values = [3.2, 4.7, 3.9, 6.1, 5.3, 7.4, 8.2];

    revenueChart = new Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Doanh thu",
                    data: values,
                    borderColor: "#6046d8",
                    backgroundColor: "rgba(96, 70, 216, .12)",
                    borderWidth: 3,
                    fill: true,
                    tension: .4,
                    pointRadius: 3,
                    pointBackgroundColor: "#6046d8"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: context => `${context.raw} triệu ₫`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: value => `${value}tr`
                    },
                    grid: {
                        color: "#f0f0f4"
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderBookingStatusChart() {
    const counts = {
        pending: bookings.filter(item => item.status === "pending").length,
        confirmed: bookings.filter(item => item.status === "confirmed").length,
        cancelled: bookings.filter(item => item.status === "cancelled").length
    };

    const canvas = $("#bookingStatusChart");

    if (bookingStatusChart) {
        bookingStatusChart.destroy();
    }

    bookingStatusChart = new Chart(canvas, {
        type: "doughnut",
        data: {
            labels: ["Đã xác nhận", "Chờ duyệt", "Đã hủy"],
            datasets: [
                {
                    data: [
                        counts.confirmed,
                        counts.pending,
                        counts.cancelled
                    ],
                    backgroundColor: ["#36b673", "#f3a441", "#e56868"],
                    borderWidth: 0
                }
            ]
        },
        options: {
            cutout: "74%",
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    $("#bookingLegend").innerHTML = `
    <div class="legend-row">
      <i style="background:#36b673"></i>
      <span>Đã xác nhận</span>
      <strong>${counts.confirmed}</strong>
    </div>
    <div class="legend-row">
      <i style="background:#f3a441"></i>
      <span>Chờ duyệt</span>
      <strong>${counts.pending}</strong>
    </div>
    <div class="legend-row">
      <i style="background:#e56868"></i>
      <span>Đã hủy</span>
      <strong>${counts.cancelled}</strong>
    </div>
  `;
}

function renderRecentBookings() {
    const recent = [...bookings]
        .sort((a, b) => Number(b.id) - Number(a.id))
        .slice(0, 5);

    $("#recentBookings").innerHTML = recent.length
        ? recent.map(booking => `
      <tr>
        <td><strong>#${String(booking.id).slice(-5)}</strong></td>
        <td>${booking.customerName}</td>
        <td>${booking.carName}</td>
        <td>${formatDate(booking.startDate)}</td>
        <td><strong>${money(booking.total)}</strong></td>
        <td>
          <span class="status ${statusClass(booking.status)}">
            ${statusText(booking.status)}
          </span>
        </td>
      </tr>
    `).join("")
        : `<tr><td colspan="6">Chưa có đơn đặt xe.</td></tr>`;
}

function renderAllBookings() {
    const search = ($("#bookingSearch")?.value || "").toLowerCase();
    const status = $("#bookingStatusFilter")?.value || "all";

    const result = bookings.filter(booking => {
        const matchSearch =
            String(booking.id).includes(search) ||
            booking.customerName.toLowerCase().includes(search) ||
            booking.carName.toLowerCase().includes(search);

        const matchStatus =
            status === "all" || booking.status === status;

        return matchSearch && matchStatus;
    }).sort((a, b) => Number(b.id) - Number(a.id));

    $("#bookingResultCount").textContent = `${result.length} đơn`;

    $("#allBookings").innerHTML = result.length
        ? result.map(booking => `
      <tr>
        <td><strong>#${String(booking.id).slice(-5)}</strong></td>
        <td>
          <strong>${booking.customerName}</strong>
          <div style="font-size:10px;color:var(--muted)">${booking.customerEmail || ""}</div>
        </td>
        <td>${booking.carName}</td>
        <td>
          ${formatDate(booking.startDate)}
          →
          ${formatDate(booking.endDate)}
        </td>
        <td><strong>${money(booking.total)}</strong></td>
        <td>
          <span class="status ${statusClass(booking.status)}">
            ${statusText(booking.status)}
          </span>
        </td>
        <td style="display:flex;gap:6px">
          ${booking.status === "pending"
                ? `<button class="small-btn" onclick="confirmBooking(${booking.id})">Duyệt</button>`
                : ""
            }
          ${booking.status === "confirmed"
                ? `<button class="small-btn" onclick="markRented(${booking.id})">Nhận xe</button>`
                : ""
            }
          ${booking.status !== "cancelled"
                ? `<button class="small-btn" onclick="cancelBooking(${booking.id})">Hủy</button>`
                : ""
            }
        </td>
      </tr>
    `).join("")
        : `<tr><td colspan="7">Không tìm thấy đơn phù hợp.</td></tr>`;
}

function markRented(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    const car = cars.find(c => c.id === booking.carId);
    if (car) {
        car.status = "rented";
    }
    saveLocalData();
    renderEverything();
    showToast("Xe đã được bàn giao, trạng thái chuyển sang Đã thuê.");
}

function renderFleet() {
    const search = ($("#fleetSearch")?.value || "").toLowerCase();
    const filter = $("#fleetStatusFilter")?.value || "all";

    const result = cars.filter(car => {
        const matchSearch =
            car.name.toLowerCase().includes(search) ||
            car.brand.toLowerCase().includes(search);

        const matchStatus =
            filter === "all" || car.status === filter;

        return matchSearch && matchStatus;
    });

    $("#fleetCards").innerHTML = result.map(car => `
    <article class="fleet-car-card">
      <div class="fleet-car-image ${car.type.toLowerCase() === "suv" ? "suv" : car.type.toLowerCase() === "hatchback" ? "hatchback" : ""}"></div>

      <h3>${car.name}</h3>
      <p>${car.brand} · ${car.type} · ${car.seats} chỗ · ${car.location}</p>

      <div class="car-card-row">
        <span class="car-price">${money(car.price)}/ngày</span>
        <span class="status ${statusClass(car.status)}">
          ${statusText(car.status)}
        </span>
      </div>

      <div class="car-actions">
        <button class="small-btn" onclick="changeCarStatus(${car.id})">
          Đổi trạng thái
        </button>
        <button class="small-btn" onclick="editCar(${car.id})">
          Chỉnh sửa
        </button>
        <button class="small-btn" onclick="deleteCar(${car.id})" style="background:#ffeded;color:#c04b4b">
          Xóa
        </button>
      </div>
    </article>
  `).join("") || `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Không tìm thấy xe phù hợp.</div>`;
}

function renderCustomers() {
    const search = ($("#customerSearch")?.value || "").toLowerCase();
    const result = customers.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.phone || "").includes(search)
    );

    $("#customersPage").innerHTML = `
      <div class="page-toolbar">
        <div class="filter-group">
          <input type="search" id="customerSearch" placeholder="Tìm khách hàng..." value="${$("#customerSearch")?.value || ""}" />
        </div>
        <button class="btn btn-primary" id="addCustomerBtn">+ Thêm khách</button>
      </div>
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>Danh sách khách hàng</h2>
            <p id="customerCount">${result.length} khách hàng</p>
          </div>
          <span class="realtime-label"><span class="live-dot"></span> ${customers.length} thành viên</span>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Thông tin</th>
                <th>Tham gia</th>
                <th>Tổng đơn</th>
                <th>Tổng chi tiêu</th>
                <th>Hạng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${result.map(c => `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="profile-avatar" style="width:32px;height:32px;font-size:9px">${c.name.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase()}</div>
                      <strong>${c.name}</strong>
                    </div>
                  </td>
                  <td>
                    ${c.email}
                    <div style="font-size:10px;color:var(--muted)">${c.phone || ""}</div>
                  </td>
                  <td>${formatDate(c.joinedAt)}</td>
                  <td><strong>${c.totalBookings}</strong> đơn</td>
                  <td><strong>${money(c.totalSpent)}</strong></td>
                  <td><span class="status ${statusClass(c.tier)}">${statusText(c.tier)}</span></td>
                  <td><button class="small-btn">Xem chi tiết</button></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $("#customerSearch")?.addEventListener("input", renderCustomers);
}

function renderPayments() {
    const search = ($("#paymentSearch")?.value || "").toLowerCase();
    const status = $("#paymentStatusFilter")?.value || "all";
    const result = payments.filter(p => {
        const matchSearch =
            String(p.id).includes(search) ||
            p.customerName.toLowerCase().includes(search) ||
            (p.txnCode || "").toLowerCase().includes(search);
        const matchStatus = status === "all" || p.status === status;
        return matchSearch && matchStatus;
    });
    const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);

    $("#paymentsPage").innerHTML = `
      <div class="page-toolbar">
        <div class="filter-group">
          <input type="search" id="paymentSearch" placeholder="Tìm mã giao dịch, khách..." value="${$("#paymentSearch")?.value || ""}" />
          <select id="paymentStatusFilter">
            <option value="all">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
        <button class="btn btn-primary" id="exportPayments">↓ Xuất CSV</button>
      </div>
      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
        <div class="stat-card green-card">
          <div class="stat-icon">₫</div>
          <span>Đã thu (tháng)</span>
          <strong>${money(totalPaid)}</strong>
          <small class="positive">↑ 9.3% so với tháng trước</small>
        </div>
        <div class="stat-card orange-card">
          <div class="stat-icon">⧗</div>
          <span>Chờ thanh toán</span>
          <strong>${payments.filter(p => p.status === "pending").length}</strong>
          <small>${money(payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0))}</small>
        </div>
        <div class="stat-card purple-card">
          <div class="stat-icon">↺</div>
          <span>Đã hoàn tiền</span>
          <strong>${payments.filter(p => p.status === "refunded").length}</strong>
          <small>${money(payments.filter(p => p.status === "refunded").reduce((s, p) => s + p.amount, 0))}</small>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>Lịch sử thanh toán</h2>
            <p>${result.length} giao dịch</p>
          </div>
        </div>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Mã giao dịch</th>
                <th>Khách hàng</th>
                <th>Phương thức</th>
                <th>Số tiền</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${result.map(p => `
                <tr>
                  <td><strong>${p.txnCode}</strong><div style="font-size:10px;color:var(--muted)">#${p.id}</div></td>
                  <td><strong>${p.customerName}</strong><div style="font-size:10px;color:var(--muted)">Đơn #${p.bookingId || "-"}</div></td>
                  <td>${p.method}</td>
                  <td><strong>${money(p.amount)}</strong></td>
                  <td>${p.paidAt || "—"}</td>
                  <td><span class="status ${statusClass(p.status)}">${statusText(p.status)}</span></td>
                  <td>
                    ${p.status === "pending" ? `<button class="small-btn">Xác nhận</button>` : `<button class="small-btn">Chi tiết</button>`}
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;

    $("#paymentSearch")?.addEventListener("input", renderPayments);
    $("#paymentStatusFilter")?.addEventListener("change", renderPayments);
    $("#paymentStatusFilter").value = status;
    $("#exportPayments")?.addEventListener("click", exportPaymentsCsv);
}

function exportPaymentsCsv() {
    const header = ["Mã GD", "Khách hàng", "Phương thức", "Số tiền", "Trạng thái", "Thời gian"];
    const rows = payments.map(p => [p.txnCode, p.customerName, p.method, p.amount, statusText(p.status), p.paidAt]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "goride-payments.csv";
    link.click();
    showToast("Đã xuất báo cáo thanh toán CSV.");
}

function renderMaintenancePage() {
    const status = $("#maintStatusFilter")?.value || "all";
    const result = maintenance.filter(m => status === "all" || m.status === status);
    const totalCost = maintenance.reduce((s, m) => s + m.cost, 0);

    $("#maintenancePage").innerHTML = `
      <div class="page-toolbar">
        <div class="filter-group">
          <select id="maintStatusFilter">
            <option value="all">Tất cả trạng thái</option>
            <option value="scheduled">Đã lên lịch</option>
            <option value="in_progress">Đang thực hiện</option>
            <option value="completed">Hoàn thành</option>
          </select>
        </div>
        <button class="btn btn-primary" id="addMaintBtn">+ Lên lịch bảo trì</button>
      </div>
      <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
        <div class="stat-card blue-card">
          <div class="stat-icon">⚙</div>
          <span>Tổng chi phí bảo trì</span>
          <strong>${money(totalCost)}</strong>
          <small>${maintenance.length} lượt bảo trì</small>
        </div>
        <div class="stat-card orange-card">
          <div class="stat-icon">⧗</div>
          <span>Đang thực hiện</span>
          <strong>${maintenance.filter(m => m.status === "in_progress").length}</strong>
          <small>${money(maintenance.filter(m => m.status === "in_progress").reduce((s, m) => s + m.cost, 0))}</small>
        </div>
        <div class="stat-card green-card">
          <div class="stat-icon">📅</div>
          <span>Sắp tới (đã lịch)</span>
          <strong>${maintenance.filter(m => m.status === "scheduled").length}</strong>
          <small>${money(maintenance.filter(m => m.status === "scheduled").reduce((s, m) => s + m.cost, 0))}</small>
        </div>
      </div>
      <div class="fleet-card-grid">
        ${result.map(m => `
          <article class="fleet-car-card">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <div class="stat-icon" style="background:#fff4e1;color:#f3a441;width:36px;height:36px;margin:0;border-radius:9px">⚙</div>
              <div>
                <h3 style="font-size:13px;margin:0">${m.carName}</h3>
                <p style="font-size:10px;color:var(--muted);margin:2px 0 0">${m.type}</p>
              </div>
            </div>
            <p style="font-size:11px;line-height:1.6;margin-bottom:14px;color:#555">${m.note}</p>
            <div class="car-card-row" style="margin-bottom:10px">
              <span class="car-price">${money(m.cost)}</span>
              <span class="status ${statusClass(m.status)}">${statusText(m.status)}</span>
            </div>
            <div class="car-card-row" style="font-size:10px;color:var(--muted);margin-bottom:14px">
              <span>📅 ${formatDate(m.startDate)}</span>
              <span>→ ${formatDate(m.endDate)}</span>
            </div>
            <div class="car-actions">
              ${m.status === "scheduled" ? `<button class="small-btn" onclick="updateMaintStatus(${m.id},'in_progress')">Bắt đầu</button>` : ""}
              ${m.status === "in_progress" ? `<button class="small-btn" onclick="updateMaintStatus(${m.id},'completed')">Hoàn thành</button>` : ""}
              <button class="small-btn" onclick="deleteMaint(${m.id})" style="background:#ffeded;color:#c04b4b">Xóa</button>
            </div>
          </article>
        `).join("") || `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Không có lịch bảo trì nào.</div>`}
      </div>
    `;

    $("#maintStatusFilter")?.addEventListener("change", renderMaintenancePage);
    $("#maintStatusFilter").value = status;
    $("#addMaintBtn")?.addEventListener("click", () => showToast("Tính năng đang phát triển."));
}

function updateMaintStatus(id, newStatus) {
    const m = maintenance.find(x => x.id === id);
    if (!m) return;
    m.status = newStatus;
    if (newStatus === "in_progress") {
        const car = cars.find(c => c.id === m.carId);
        if (car) car.status = "maintenance";
    }
    if (newStatus === "completed") {
        const car = cars.find(c => c.id === m.carId);
        if (car && car.status === "maintenance") car.status = "available";
    }
    saveLocalData();
    renderEverything();
    showToast(`Cập nhật trạng thái bảo trì: ${statusText(newStatus)}`);
}

function deleteMaint(id) {
    if (!confirm("Bạn có chắc muốn xóa lịch bảo trì này?")) return;
    maintenance = maintenance.filter(m => m.id !== id);
    saveLocalData();
    renderEverything();
    showToast("Đã xóa lịch bảo trì.");
}

function renderEverything() {
    calculateStats();
    renderRevenueChart();
    renderBookingStatusChart();
    renderRecentBookings();
    renderAllBookings();
    renderFleet();
    renderCustomers();
    renderPayments();
    renderMaintenancePage();
    updateTime();
}

function confirmBooking(id) {
    const booking = bookings.find(item => item.id === id);

    if (!booking) return;

    booking.status = "confirmed";
    saveLocalData();
    renderEverything();
    showToast("Đã xác nhận đơn đặt xe.");

    emitRealtimeEvent("booking:updated", booking);
}

function cancelBooking(id) {
    const booking = bookings.find(item => item.id === id);

    if (!booking) return;

    booking.status = "cancelled";
    const car = cars.find(c => c.id === booking.carId);
    if (car && car.status === "rented") {
        car.status = "available";
    }
    saveLocalData();
    renderEverything();
    showToast("Đã hủy đơn đặt xe.");

    emitRealtimeEvent("booking:updated", booking);
}

function changeCarStatus(id) {
    const car = cars.find(item => item.id === id);

    if (!car) return;

    const statuses = ["available", "rented", "maintenance"];
    const currentIndex = statuses.indexOf(car.status);
    car.status = statuses[(currentIndex + 1) % statuses.length];

    saveLocalData();
    renderEverything();
    showToast(`Xe đã chuyển sang trạng thái: ${statusText(car.status)}`);

    emitRealtimeEvent("car:updated", car);
}

function deleteCar(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    if (!confirm(`Bạn có chắc muốn xóa xe "${car.name}" khỏi đội xe?`)) return;
    cars = cars.filter(c => c.id !== id);
    saveLocalData();
    renderEverything();
    showToast("Đã xóa xe khỏi danh sách.");
}

function openCarModal() {
    $("#carModalTitle").textContent = "Thêm xe mới";
    $("#carForm").reset();
    $("#carId").value = "";
    $("#carSeats").value = 5;
    $("#carLocation").value = "Hà Nội";
    $("#carModal").classList.remove("hidden");
}

function editCar(id) {
    const car = cars.find(item => item.id === id);

    if (!car) return;

    $("#carModalTitle").textContent = "Chỉnh sửa xe";
    $("#carId").value = car.id;
    $("#carName").value = car.name;
    $("#carBrand").value = car.brand;
    $("#carType").value = car.type;
    $("#carSeats").value = car.seats;
    $("#carPrice").value = car.price;
    $("#carLocation").value = car.location;

    $("#carModal").classList.remove("hidden");
}

$("#carForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const id = Number($("#carId").value);

    const data = {
        name: $("#carName").value,
        brand: $("#carBrand").value,
        type: $("#carType").value,
        seats: Number($("#carSeats").value),
        price: Number($("#carPrice").value),
        location: $("#carLocation").value
    };

    if (id) {
        const car = cars.find(item => item.id === id);
        Object.assign(car, data);
    } else {
        cars.push({
            id: Date.now(),
            ...data,
            status: "available",
            rating: 4.8
        });
    }

    saveLocalData();
    $("#carModal").classList.add("hidden");
    renderEverything();
    showToast("Đã lưu thông tin xe.");

    emitRealtimeEvent("car:updated", data);
});

function openPage(pageName) {
    $$(".page").forEach(page => page.classList.remove("page-active"));
    $$(".side-link").forEach(link => link.classList.remove("active"));

    $(`#${pageName}Page`).classList.add("page-active");
    $(`.side-link[data-page="${pageName}"]`)?.classList.add("active");

    const titles = {
        dashboard: ["Tổng quan", "Theo dõi hoạt động kinh doanh của bạn"],
        bookings: ["Quản lý đơn", "Theo dõi và xử lý các đơn đặt xe"],
        fleet: ["Đội xe", "Quản lý trạng thái và thông tin xe"],
        customers: ["Khách hàng", "Quản lý tài khoản khách hàng"],
        payments: ["Thanh toán", "Theo dõi các giao dịch thanh toán"],
        maintenance: ["Bảo trì", "Quản lý lịch bảo trì xe"]
    };

    $("#pageTitle").textContent = titles[pageName][0];
    $("#pageSubtitle").textContent = titles[pageName][1];
}

$$(".side-link").forEach(link => {
    link.addEventListener("click", () => {
        openPage(link.dataset.page);
    });
});

$$("[data-go]").forEach(button => {
    button.addEventListener("click", () => {
        openPage(button.dataset.go);
    });
});

$("#refreshBtn")?.addEventListener("click", () => {
    renderEverything();
    showToast("Đã cập nhật dữ liệu.");
});

$("#addCarBtn")?.addEventListener("click", openCarModal);

$("#bookingSearch")?.addEventListener("input", renderAllBookings);
$("#bookingStatusFilter")?.addEventListener("change", renderAllBookings);
$("#fleetSearch")?.addEventListener("input", renderFleet);
$("#fleetStatusFilter")?.addEventListener("change", renderFleet);

$("#mobileMenu")?.addEventListener("click", () => {
    $(".sidebar").classList.toggle("open");
});

$$("[data-close]").forEach(button => {
    button.addEventListener("click", () => {
        $(`#${button.dataset.close}`).classList.add("hidden");
    });
});

window.addEventListener("click", event => {
    if (event.target.classList.contains("modal")) {
        event.target.classList.add("hidden");
    }
});

$("#logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("goride_user");
    window.location.href = "index.html";
});

$("#exportBookings")?.addEventListener("click", () => {
    const header = ["Mã đơn", "Khách hàng", "Email", "Xe", "Ngày nhận", "Ngày trả", "Tổng tiền", "Trạng thái"];

    const rows = bookings.map(item => [
        item.id,
        item.customerName,
        item.customerEmail || "",
        item.carName,
        item.startDate,
        item.endDate,
        item.total,
        statusText(item.status)
    ]);

    const csv = [header, ...rows]
        .map(row => row.join(","))
        .join("\n");

    const blob = new Blob(["\ufeff" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "goride-bookings.csv";
    link.click();

    showToast("Đã xuất báo cáo CSV.");
});

function connectRealtime() {
    $("#connectionText").textContent = "Demo local";
}

function emitRealtimeEvent(eventName, data) {
    console.log("Realtime demo event:", eventName, data);
}

async function loadDashboardFromApi() {
}

if (!localStorage.getItem("goride_cars")) saveLocalData();
connectRealtime();
renderEverything();
