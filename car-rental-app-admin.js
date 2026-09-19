const TOKEN_KEY = "goride_admin_token";
const CURRENT_ADMIN_KEY = "goride_admin_info";

let cars = [];
let bookings = [];
let customers = [];
let payments = [];
let maintenance = [];
let admins = [];
let currentAdmin = null;
let revenueChart;
let bookingStatusChart;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

const money = (v) => new Intl.NumberFormat("vi-VN").format(v) + " ₫";
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("vi-VN") : "";

function showToast(message) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = message;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2800);
}

function getToken() { return localStorage.getItem(TOKEN_KEY) || ""; }

async function api(path, opts = {}) {
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(path, { ...opts, headers });
    let body = {};
    try { body = await res.json(); } catch (_) { }
    if (!res.ok) {
        if (res.status === 401) {
            logout();
            throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        }
        throw new Error(body.error || "Lỗi yêu cầu (HTTP " + res.status + ")");
    }
    return body;
}

function statusLabel(s) {
    return {
        pending: "Chờ duyệt", confirmed: "Đã xác nhận", cancelled: "Đã hủy",
        available: "Rảnh", rented: "Đã thuê", maintenance: "Bảo trì",
        paid: "Đã thanh toán", refunded: "Đã hoàn tiền",
        in_progress: "Đang thực hiện", completed: "Hoàn thành", scheduled: "Đã lên lịch",
        gold: "Gold", silver: "Silver", platinum: "Platinum", bronze: "Bronze"
    }[s] || s;
}

function statusClass(s) {
    if (["pending", "scheduled", "bronze"].includes(s)) return "pending";
    if (["confirmed", "available", "paid", "completed", "gold", "platinum"].includes(s)) return "confirmed";
    if (["cancelled", "refunded"].includes(s)) return "cancelled";
    if (["rented", "silver"].includes(s)) return "rented";
    if (["maintenance", "in_progress"].includes(s)) return "maintenance";
    return "pending";
}

function showLogin() {
    $("#adminLoginWrapper").classList.remove("hidden");
    $("#adminAppWrapper").classList.add("hidden");
}
function showApp() {
    $("#adminLoginWrapper").classList.add("hidden");
    $("#adminAppWrapper").classList.remove("hidden");
}

async function login(username, password) {
    const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || "Đăng nhập thất bại");
    localStorage.setItem(TOKEN_KEY, body.token);
    localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(body.admin));
    currentAdmin = body.admin;
    return body.admin;
}

function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_ADMIN_KEY);
    currentAdmin = null;
    showLogin();
}

function avatarInitials(name) {
    if (!name) return "AD";
    return name.split(" ").filter(Boolean).slice(-2).map(s => s[0]).join("").toUpperCase().slice(0, 2);
}

function updateAdminProfile() {
    if (!currentAdmin) currentAdmin = JSON.parse(localStorage.getItem(CURRENT_ADMIN_KEY) || "null");
    if (!currentAdmin) return;
    const name = currentAdmin.name || currentAdmin.username || "Admin";
    $("#adminName") && ($("#adminName").textContent = name);
    $("#adminRole") && ($("#adminRole").textContent = currentAdmin.email || "Quản trị viên");
    const avt = avatarInitials(name);
    if ($("#adminAvatar")) $("#adminAvatar").textContent = avt;
    if ($("#topAvatar")) $("#topAvatar").textContent = avt;
}

/* ===== LOGIN FORM ===== */
$("#loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#loginSubmitBtn");
    btn.disabled = true;
    btn.textContent = "Đang kiểm tra...";
    try {
        await login($("#loginUsername").value.trim(), $("#loginPassword").value);
        showToast("Đăng nhập thành công.");
        await afterLoginInit();
        showApp();
    } catch (err) {
        showToast(err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Đăng nhập";
    }
});

/* ===== APP INIT ===== */
async function afterLoginInit() {
    updateAdminProfile();
    await loadAllData();
    renderEverything();
}

async function loadAllData() {
    try {
        const [c, b, cu, p, m, a] = await Promise.all([
            api("/api/admin/cars"),
            api("/api/admin/bookings"),
            api("/api/admin/customers"),
            api("/api/admin/payments"),
            api("/api/admin/maintenance"),
            api("/api/admin/admins")
        ]);
        cars = c; bookings = b; customers = cu; payments = p; maintenance = m; admins = a;
    } catch (err) {
        showToast(err.message);
    }
}

function calculateStats() {
    const confirmedRevenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + (Number(b.total) || 0), 0);
    const rented = cars.filter(c => c.status === "rented").length;
    const available = cars.filter(c => c.status === "available").length;
    const maint = cars.filter(c => c.status === "maintenance").length;
    $("#revenueStat").textContent = money(confirmedRevenue);
    $("#bookingStat").textContent = bookings.length;
    $("#rentedStat").textContent = rented;
    $("#fleetDetail").textContent = `Trên tổng số ${cars.length} xe`;
    $("#availableCount").textContent = available;
    $("#rentedCount").textContent = rented;
    $("#maintenanceCount").textContent = maint;
    const pct = cars.length ? Math.round((available / cars.length) * 100) : 0;
    $("#availablePercent").textContent = pct + "%";
    $("#totalBookingCenter").textContent = bookings.length;
    $("#customerStat").textContent = customers.length;
    $("#lastUpdated").textContent = new Date().toLocaleTimeString("vi-VN");
}

function renderRevenueChart() {
    const canvas = $("#revenueChart"); if (!canvas) return;
    if (revenueChart) revenueChart.destroy();
    const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const values = [3.2, 4.7, 3.9, 6.1, 5.3, 7.4, 8.2];
    revenueChart = new Chart(canvas, {
        type: "line",
        data: { labels, datasets: [{ label: "Doanh thu", data: values, borderColor: "#6046d8", backgroundColor: "rgba(96,70,216,.12)", borderWidth: 3, fill: true, tension: .4, pointRadius: 3, pointBackgroundColor: "#6046d8" }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.raw} triệu ₫` } } },
            scales: {
                y: { beginAtZero: true, ticks: { callback: v => `${v}tr` }, grid: { color: "#f0f0f4" } },
                x: { grid: { display: false } }
            }
        }
    });
}

function renderBookingStatusChart() {
    const canvas = $("#bookingStatusChart"); if (!canvas) return;
    if (bookingStatusChart) bookingStatusChart.destroy();
    const c = {
        pending: bookings.filter(b => b.status === "pending").length,
        confirmed: bookings.filter(b => b.status === "confirmed").length,
        cancelled: bookings.filter(b => b.status === "cancelled").length
    };
    bookingStatusChart = new Chart(canvas, {
        type: "doughnut",
        data: { labels: ["Đã xác nhận", "Chờ duyệt", "Đã hủy"], datasets: [{ data: [c.confirmed, c.pending, c.cancelled], backgroundColor: ["#36b673", "#f3a441", "#e56868"], borderWidth: 0 }] },
        options: { cutout: "74%", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
    $("#bookingLegend").innerHTML = `
        <div class="legend-row"><i style="background:#36b673"></i><span>Đã xác nhận</span><strong>${c.confirmed}</strong></div>
        <div class="legend-row"><i style="background:#f3a441"></i><span>Chờ duyệt</span><strong>${c.pending}</strong></div>
        <div class="legend-row"><i style="background:#e56868"></i><span>Đã hủy</span><strong>${c.cancelled}</strong></div>`;
}

function renderRecentBookings() {
    const box = $("#recentBookings"); if (!box) return;
    const recent = [...bookings].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5);
    box.innerHTML = recent.length ? recent.map(b => `
        <tr>
            <td><strong>#${String(b.id).slice(-5)}</strong></td>
            <td>${b.customerName}<div style="font-size:10px;color:var(--muted)">${b.customerPhone || ""}</div></td>
            <td>${b.carName}</td>
            <td>${fmtDate(b.startDate)}</td>
            <td><strong>${money(b.total)}</strong></td>
            <td><span class="status ${statusClass(b.status)}">${statusLabel(b.status)}</span></td>
        </tr>`).join("") : `<tr><td colspan="6">Chưa có đơn đặt xe.</td></tr>`;
}

function renderAllBookings() {
    const search = ($("#bookingSearch")?.value || "").toLowerCase();
    const st = $("#bookingStatusFilter")?.value || "all";
    const res = bookings.filter(b => {
        const sMatch = String(b.id).includes(search) || (b.customerName || "").toLowerCase().includes(search) || (b.carName || "").toLowerCase().includes(search);
        return sMatch && (st === "all" || b.status === st);
    }).sort((a, b) => Number(b.id) - Number(a.id));
    $("#bookingResultCount") && ($("#bookingResultCount").textContent = `${res.length} đơn`);
    const box = $("#allBookings"); if (!box) return;
    box.innerHTML = res.length ? res.map(b => `
        <tr>
            <td><strong>#${String(b.id).slice(-5)}</strong></td>
            <td><strong>${b.customerName}</strong><div style="font-size:10px;color:var(--muted)">${b.customerEmail || ""} · ${b.customerPhone || ""}</div></td>
            <td>${b.carName}</td>
            <td>${fmtDate(b.startDate)} → ${fmtDate(b.endDate)}</td>
            <td><strong>${money(b.total)}</strong></td>
            <td><span class="status ${statusClass(b.status)}">${statusLabel(b.status)}</span></td>
            <td style="display:flex;gap:6px;flex-wrap:wrap">
                ${b.status === "pending" ? `<button class="small-btn" onclick="confirmBooking(${b.id})">Duyệt</button>` : ""}
                ${b.status === "confirmed" ? `<button class="small-btn" onclick="markRented(${b.id})">Nhận xe</button>` : ""}
                ${b.status !== "cancelled" ? `<button class="small-btn" style="background:#ffeded;color:#c04b4b" onclick="cancelBooking(${b.id})">Hủy</button>` : ""}
            </td>
        </tr>`).join("") : `<tr><td colspan="7">Không tìm thấy đơn phù hợp.</td></tr>`;
}

function renderFleet() {
    const search = ($("#fleetSearch")?.value || "").toLowerCase();
    const st = $("#fleetStatusFilter")?.value || "all";
    const res = cars.filter(c => {
        const sm = (c.name || "").toLowerCase().includes(search) || (c.brand || "").toLowerCase().includes(search);
        return sm && (st === "all" || c.status === st);
    });
    const box = $("#fleetCards"); if (!box) return;
    box.innerHTML = res.map(c => `
        <article class="fleet-car-card">
            <div class="fleet-car-image ${(c.type || "").toLowerCase()}"></div>
            <h3>${c.name}</h3>
            <p>${c.brand} · ${c.type} · ${c.seats} chỗ · ${c.location}</p>
            <div class="car-card-row">
                <span class="car-price">${money(c.price)}/ngày</span>
                <span class="status ${statusClass(c.status)}">${statusLabel(c.status)}</span>
            </div>
            <div class="car-actions">
                <button class="small-btn" onclick="changeCarStatus(${c.id})">Đổi trạng thái</button>
                <button class="small-btn" onclick="editCar(${c.id})">Chỉnh sửa</button>
                <button class="small-btn" style="background:#ffeded;color:#c04b4b" onclick="deleteCar(${c.id})">Xóa</button>
            </div>
        </article>`).join("") || `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Không tìm thấy xe phù hợp.</div>`;
}

function renderCustomers() {
    const host = $("#customersPage"); if (!host) return;
    const search = ($("#customerSearch")?.value || "").toLowerCase();
    const res = customers.filter(c =>
        (c.name || "").toLowerCase().includes(search) ||
        (c.email || "").toLowerCase().includes(search) ||
        (c.phone || "").includes(search)
    );
    host.innerHTML = `
        <div class="page-toolbar">
            <div class="filter-group"><input type="search" id="customerSearch" placeholder="Tìm khách hàng..." value="${search || ""}"/></div>
        </div>
        <div class="panel">
            <div class="panel-header">
                <div><h2>Danh sách khách hàng</h2><p>${res.length} / ${customers.length} khách hàng</p></div>
                <span class="realtime-label"><span class="live-dot"></span> Live</span>
            </div>
            <div class="table-scroll">
                <table>
                    <thead><tr><th>Khách hàng</th><th>Thông tin</th><th>Tham gia</th><th>Tổng đơn</th><th>Tổng chi tiêu</th><th>Hạng</th></tr></thead>
                    <tbody>${res.map(c => `
                        <tr>
                            <td><div style="display:flex;align-items:center;gap:10px">
                                <div class="profile-avatar" style="width:32px;height:32px;font-size:9px">${avatarInitials(c.name)}</div>
                                <strong>${c.name}</strong>
                            </div></td>
                            <td>${c.email}<div style="font-size:10px;color:var(--muted)">${c.phone || ""}</div></td>
                            <td>${fmtDate(c.joinedAt)}</td>
                            <td><strong>${c.totalBookings || 0}</strong> đơn</td>
                            <td><strong>${money(c.totalSpent || 0)}</strong></td>
                            <td><span class="status ${statusClass(c.tier)}">${statusLabel(c.tier)}</span></td>
                        </tr>`).join("")}</tbody>
                </table>
            </div>
        </div>`;
    $("#customerSearch")?.addEventListener("input", renderCustomers);
}

function renderPayments() {
    const host = $("#paymentsPage"); if (!host) return;
    const search = ($("#paymentSearch")?.value || "").toLowerCase();
    const st = $("#paymentStatusFilter")?.value || "all";
    const res = payments.filter(p => {
        const sm = String(p.id).includes(search) || (p.customerName || "").toLowerCase().includes(search) || (p.txnCode || "").toLowerCase().includes(search);
        return sm && (st === "all" || p.status === st);
    });
    const paid = payments.filter(p => p.status === "paid").reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const pending = payments.filter(p => p.status === "pending");
    const refund = payments.filter(p => p.status === "refunded");
    host.innerHTML = `
        <div class="page-toolbar">
            <div class="filter-group">
                <input type="search" id="paymentSearch" placeholder="Tìm mã GD, khách..." value="${search || ""}"/>
                <select id="paymentStatusFilter">
                    <option value="all">Tất cả trạng thái</option><option value="paid">Đã thanh toán</option>
                    <option value="pending">Chờ thanh toán</option><option value="refunded">Đã hoàn tiền</option>
                </select>
            </div>
            <button class="btn btn-primary" id="exportPayBtn">↓ Xuất CSV</button>
        </div>
        <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
            <div class="stat-card green-card"><div class="stat-icon">₫</div><span>Đã thu (tháng)</span><strong>${money(paid)}</strong><small class="positive">↑ 9.3%</small></div>
            <div class="stat-card orange-card"><div class="stat-icon">⧗</div><span>Chờ thanh toán</span><strong>${pending.length}</strong><small>${money(pending.reduce((s,p)=>s+(Number(p.amount)||0),0))}</small></div>
            <div class="stat-card purple-card"><div class="stat-icon">↺</div><span>Đã hoàn tiền</span><strong>${refund.length}</strong><small>${money(refund.reduce((s,p)=>s+(Number(p.amount)||0),0))}</small></div>
        </div>
        <div class="panel">
            <div class="panel-header"><div><h2>Lịch sử thanh toán</h2><p>${res.length} giao dịch</p></div></div>
            <div class="table-scroll">
                <table>
                    <thead><tr><th>Mã giao dịch</th><th>Khách hàng</th><th>Phương thức</th><th>Số tiền</th><th>Thời gian</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                    <tbody>${res.map(p => `
                        <tr>
                            <td><strong>${p.txnCode}</strong><div style="font-size:10px;color:var(--muted)">#${p.id}</div></td>
                            <td><strong>${p.customerName}</strong><div style="font-size:10px;color:var(--muted)">Đơn #${p.bookingId || "-"}</div></td>
                            <td>${p.method}</td>
                            <td><strong>${money(p.amount)}</strong></td>
                            <td>${p.paidAt || "—"}</td>
                            <td><span class="status ${statusClass(p.status)}">${statusLabel(p.status)}</span></td>
                            <td>${p.status === "pending" ? `<button class="small-btn">Xác nhận</button>` : `<button class="small-btn">Chi tiết</button>`}</td>
                        </tr>`).join("")}</tbody>
                </table>
            </div>
        </div>`;
    $("#paymentSearch")?.addEventListener("input", renderPayments);
    $("#paymentStatusFilter")?.addEventListener("change", renderPayments);
    $("#paymentStatusFilter").value = st;
    $("#exportPayBtn")?.addEventListener("click", exportPayCsv);
}

function exportPayCsv() {
    const header = ["Mã GD", "Khách hàng", "Phương thức", "Số tiền", "Trạng thái", "Thời gian"];
    const rows = payments.map(p => [p.txnCode, p.customerName, p.method, p.amount, statusLabel(p.status), p.paidAt || ""]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
    link.download = "goride-payments.csv"; link.click();
    showToast("Đã xuất thanh toán CSV.");
}

function renderMaintenancePage() {
    const host = $("#maintenancePage"); if (!host) return;
    const st = $("#maintStatusFilter")?.value || "all";
    const res = maintenance.filter(m => st === "all" || m.status === st);
    const totalCost = maintenance.reduce((s, m) => s + (Number(m.cost) || 0), 0);
    const inp = maintenance.filter(m => m.status === "in_progress");
    const sch = maintenance.filter(m => m.status === "scheduled");
    host.innerHTML = `
        <div class="page-toolbar">
            <div class="filter-group">
                <select id="maintStatusFilter">
                    <option value="all">Tất cả trạng thái</option><option value="scheduled">Đã lên lịch</option>
                    <option value="in_progress">Đang thực hiện</option><option value="completed">Hoàn thành</option>
                </select>
            </div>
            <button class="btn btn-primary" id="addMaintBtn">+ Lên lịch bảo trì</button>
        </div>
        <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
            <div class="stat-card blue-card"><div class="stat-icon">⚙</div><span>Tổng chi phí bảo trì</span><strong>${money(totalCost)}</strong><small>${maintenance.length} lượt</small></div>
            <div class="stat-card orange-card"><div class="stat-icon">⧗</div><span>Đang thực hiện</span><strong>${inp.length}</strong><small>${money(inp.reduce((s,m)=>s+(Number(m.cost)||0),0))}</small></div>
            <div class="stat-card green-card"><div class="stat-icon">📅</div><span>Sắp tới (đã lịch)</span><strong>${sch.length}</strong><small>${money(sch.reduce((s,m)=>s+(Number(m.cost)||0),0))}</small></div>
        </div>
        <div class="fleet-card-grid">
            ${res.map(m => `
                <article class="fleet-car-card">
                    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                        <div class="stat-icon" style="background:#fff4e1;color:#f3a441;width:36px;height:36px;margin:0;border-radius:9px">⚙</div>
                        <div><h3 style="font-size:13px;margin:0">${m.carName}</h3><p style="font-size:10px;color:var(--muted);margin:2px 0 0">${m.type}</p></div>
                    </div>
                    <p style="font-size:11px;line-height:1.6;margin-bottom:14px;color:#555">${m.note || "—"}</p>
                    <div class="car-card-row" style="margin-bottom:10px">
                        <span class="car-price">${money(m.cost)}</span>
                        <span class="status ${statusClass(m.status)}">${statusLabel(m.status)}</span>
                    </div>
                    <div class="car-card-row" style="font-size:10px;color:var(--muted);margin-bottom:14px">
                        <span>📅 ${fmtDate(m.startDate)}</span><span>→ ${fmtDate(m.endDate)}</span>
                    </div>
                    <div class="car-actions">
                        ${m.status === "scheduled" ? `<button class="small-btn" onclick="updateMaint(${m.id},'in_progress')">Bắt đầu</button>` : ""}
                        ${m.status === "in_progress" ? `<button class="small-btn" onclick="updateMaint(${m.id},'completed')">Hoàn thành</button>` : ""}
                        <button class="small-btn" style="background:#ffeded;color:#c04b4b" onclick="deleteMaint(${m.id})">Xóa</button>
                    </div>
                </article>`).join("") || `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--muted)">Không có lịch bảo trì nào.</div>`}
        </div>`;
    $("#maintStatusFilter")?.addEventListener("change", renderMaintenancePage);
    $("#maintStatusFilter").value = st;
    $("#addMaintBtn")?.addEventListener("click", async () => {
        if (!cars.length) return showToast("Chưa có xe trong hệ thống.");
        const car = cars[0];
        try {
            const m = await api("/api/admin/maintenance", { method: "POST", body: JSON.stringify({
                carId: car.id, carName: car.name, type: "Bảo dưỡng định kỳ",
                cost: 500000, startDate: new Date().toISOString().slice(0, 10),
                endDate: new Date().toISOString().slice(0, 10), status: "scheduled", note: "Được tạo từ dashboard"
            }) });
            maintenance.push(m);
            showToast("Đã thêm lịch bảo trì mẫu.");
            renderEverything();
        } catch (e) { showToast(e.message); }
    });
}

function renderAdminsList() {
    const box = $("#adminsList"); if (!box) return;
    box.innerHTML = `
        <h3 style="font-size:14px;margin:0 0 10px">Danh sách admin (${admins.length})</h3>
        <div style="display:flex;flex-direction:column;gap:8px">
            ${admins.map(a => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;border:1px solid #eee;border-radius:10px">
                    <div><strong style="font-size:13px">${a.name}</strong>
                        <div style="font-size:10px;color:var(--muted)">@${a.username}${a.email ? " · " + a.email : ""}</div>
                    </div>
                    ${(currentAdmin && Number(a.id) !== Number(currentAdmin.id))
                        ? `<button class="small-btn" style="background:#ffeded;color:#c04b4b" onclick="deleteAdmin(${a.id})">Xóa</button>`
                        : `<span style="font-size:10px;color:#6046d8;font-weight:600">⦿ Bạn đang đăng nhập</span>`}
                </div>`).join("")}
        </div>`;
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
    renderAdminsList();
}

/* ===== ACTIONS ===== */
window.confirmBooking = async (id) => {
    try { const b = await api(`/api/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status: "confirmed" }) });
        const idx = bookings.findIndex(x => x.id === id); if (idx >= 0) bookings[idx] = b;
        renderEverything(); showToast("Đã xác nhận đơn.");
    } catch (e) { showToast(e.message); }
};
window.cancelBooking = async (id) => {
    try { const b = await api(`/api/admin/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
        const idx = bookings.findIndex(x => x.id === id); if (idx >= 0) bookings[idx] = b;
        renderEverything(); showToast("Đã hủy đơn.");
    } catch (e) { showToast(e.message); }
};
window.markRented = async (id) => {
    try { await api(`/api/admin/bookings/${id}/mark-rented`, { method: "POST" });
        const idx = bookings.findIndex(b => b.id === id); if (idx >= 0) {
            const c = cars.find(c => c.id === bookings[idx].carId);
            if (c) c.status = "rented";
        }
        renderEverything(); showToast("Xe đã được bàn giao.");
    } catch (e) { showToast(e.message); }
};
window.changeCarStatus = async (id) => {
    const car = cars.find(c => c.id === id); if (!car) return;
    const list = ["available", "rented", "maintenance"];
    const next = list[(list.indexOf(car.status) + 1) % list.length];
    try { const c = await api(`/api/admin/cars/${id}/change-status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
        const idx = cars.findIndex(x => x.id === id); if (idx >= 0) cars[idx] = c;
        renderEverything(); showToast(`Xe chuyển sang ${statusLabel(next)}`);
    } catch (e) { showToast(e.message); }
};
window.editCar = (id) => {
    const car = cars.find(c => c.id === id); if (!car) return;
    $("#carModalTitle").textContent = "Chỉnh sửa xe";
    $("#carId").value = car.id; $("#carName").value = car.name; $("#carBrand").value = car.brand;
    $("#carType").value = car.type || "Sedan"; $("#carSeats").value = car.seats || 5;
    $("#carPrice").value = car.price || 0; $("#carLocation").value = car.location || "Hà Nội";
    $("#carModal").classList.remove("hidden");
};
window.deleteCar = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa xe này?")) return;
    try { await api(`/api/admin/cars/${id}`, { method: "DELETE" });
        cars = cars.filter(c => c.id !== id); renderEverything(); showToast("Đã xóa xe.");
    } catch (e) { showToast(e.message); }
};
window.updateMaint = async (id, st) => {
    try { const m = await api(`/api/admin/maintenance/${id}`, { method: "PATCH", body: JSON.stringify({ status: st }) });
        const idx = maintenance.findIndex(x => x.id === id); if (idx >= 0) maintenance[idx] = m;
        if (m.carId) {
            const cIdx = cars.findIndex(c => c.id === m.carId);
            if (cIdx >= 0) {
                if (st === "in_progress") cars[cIdx].status = "maintenance";
                else if (st === "completed" && cars[cIdx].status === "maintenance") cars[cIdx].status = "available";
            }
        }
        renderEverything(); showToast(`Cập nhật: ${statusLabel(st)}`);
    } catch (e) { showToast(e.message); }
};
window.deleteMaint = async (id) => {
    if (!confirm("Xóa lịch bảo trì này?")) return;
    try { await api(`/api/admin/maintenance/${id}`, { method: "DELETE" });
        maintenance = maintenance.filter(m => m.id !== id); renderEverything(); showToast("Đã xóa lịch bảo trì.");
    } catch (e) { showToast(e.message); }
};
window.deleteAdmin = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa admin này?")) return;
    try { await api(`/api/admin/admins/${id}`, { method: "DELETE" });
        admins = admins.filter(a => Number(a.id) !== Number(id)); renderAdminsList(); showToast("Đã xóa admin.");
    } catch (e) { showToast(e.message); }
};

/* ===== CAR MODAL ===== */
$("#addCarBtn")?.addEventListener("click", () => {
    $("#carModalTitle").textContent = "Thêm xe mới";
    $("#carForm").reset(); $("#carId").value = ""; $("#carSeats").value = 5; $("#carLocation").value = "Hà Nội";
    $("#carModal").classList.remove("hidden");
});
$("#carForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
        name: $("#carName").value, brand: $("#carBrand").value, type: $("#carType").value,
        seats: Number($("#carSeats").value), price: Number($("#carPrice").value), location: $("#carLocation").value
    };
    const id = $("#carId").value;
    try {
        if (id) {
            const c = await api(`/api/admin/cars/${id}`, { method: "PUT", body: JSON.stringify(data) });
            const idx = cars.findIndex(x => x.id === c.id); if (idx >= 0) cars[idx] = c;
            showToast("Đã cập nhật xe.");
        } else {
            const c = await api("/api/admin/cars", { method: "POST", body: JSON.stringify(data) });
            cars.push(c); showToast("Đã thêm xe mới.");
        }
        $("#carModal").classList.add("hidden"); renderEverything();
    } catch (e) { showToast(e.message); }
});

/* ===== CHANGE PASSWORD ===== */
function openChangePwd() { $("#changePwdForm").reset(); $("#changePwdModal").classList.remove("hidden"); }
$("#changePwdBtn")?.addEventListener("click", openChangePwd);
$("#changePwdSideBtn")?.addEventListener("click", openChangePwd);
$("#changePwdForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldP = $("#pwdOld").value, newP = $("#pwdNew").value, newP2 = $("#pwdNew2").value;
    if (newP.length < 6) return showToast("Mật khẩu mới ít nhất 6 ký tự");
    if (newP !== newP2) return showToast("Xác nhận mật khẩu không khớp");
    try {
        await api("/api/admin/change-password", { method: "POST", body: JSON.stringify({ oldPassword: oldP, newPassword: newP }) });
        $("#changePwdModal").classList.add("hidden");
        showToast("Đổi mật khẩu thành công.");
    } catch (e) { showToast(e.message); }
});

/* ===== NEW ADMIN ===== */
function openNewAdmin() { $("#newAdminForm").reset(); renderAdminsList(); $("#newAdminModal").classList.remove("hidden"); }
$("#newAdminBtn")?.addEventListener("click", openNewAdmin);
$("#newAdminSideBtn")?.addEventListener("click", openNewAdmin);
$("#newAdminForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = { name: $("#a_name").value.trim(), username: $("#a_user").value.trim(), email: ($("#a_email").value || "").trim(), password: $("#a_pwd").value };
    try {
        const a = await api("/api/admin/admins", { method: "POST", body: JSON.stringify(data) });
        admins.push(a);
        $("#newAdminForm").reset();
        renderAdminsList();
        showToast("Tạo admin thành công.");
    } catch (e) { showToast(e.message); }
});

/* ===== NAV ===== */
function openPage(name) {
    $$(".page").forEach(p => p.classList.remove("page-active"));
    $$(".side-link").forEach(l => l.classList.remove("active"));
    const pg = document.getElementById(name + "Page");
    if (pg) pg.classList.add("page-active");
    const lnk = document.querySelector(`.side-link[data-page="${name}"]`);
    if (lnk) lnk.classList.add("active");
    const t = { dashboard: ["Tổng quan", "Theo dõi hoạt động kinh doanh của bạn"], bookings: ["Quản lý đơn", "Theo dõi và xử lý các đơn đặt xe"], fleet: ["Đội xe", "Quản lý trạng thái và thông tin xe"], customers: ["Khách hàng", "Quản lý tài khoản khách hàng"], payments: ["Thanh toán", "Theo dõi các giao dịch thanh toán"], maintenance: ["Bảo trì", "Quản lý lịch bảo trì xe"] };
    $("#pageTitle") && ($("#pageTitle").textContent = (t[name] || ["", ""])[0]);
    $("#pageSubtitle") && ($("#pageSubtitle").textContent = (t[name] || ["", ""])[1]);
    if (name === "customers") renderCustomers();
    if (name === "payments") renderPayments();
    if (name === "maintenance") renderMaintenancePage();
}
$$(".side-link").forEach(l => l.addEventListener("click", () => openPage(l.dataset.page)));
$$("[data-go]").forEach(b => b.addEventListener("click", () => openPage(b.dataset.go)));

/* ===== TOOLBAR ===== */
$("#refreshBtn")?.addEventListener("click", async () => { await loadAllData(); renderEverything(); showToast("Đã làm mới dữ liệu."); });
$("#bookingSearch")?.addEventListener("input", renderAllBookings);
$("#bookingStatusFilter")?.addEventListener("change", renderAllBookings);
$("#fleetSearch")?.addEventListener("input", renderFleet);
$("#fleetStatusFilter")?.addEventListener("change", renderFleet);
$("#mobileMenu")?.addEventListener("click", () => $(".sidebar").classList.toggle("open"));
$$("[data-close]").forEach(b => b.addEventListener("click", () => $(`#${b.dataset.close}`).classList.add("hidden")));
window.addEventListener("click", e => { if (e.target.classList.contains("modal")) e.target.classList.add("hidden"); });
$("#logoutBtn")?.addEventListener("click", () => { logout(); showToast("Đã đăng xuất."); });
$("#exportBookings")?.addEventListener("click", () => {
    const header = ["Mã đơn", "Khách hàng", "Email", "SĐT", "Xe", "Ngày nhận", "Ngày trả", "Tổng tiền", "Trạng thái"];
    const rows = bookings.map(b => [b.id, b.customerName, b.customerEmail || "", b.customerPhone || "", b.carName, b.startDate, b.endDate, b.total, statusLabel(b.status)]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["\ufeff" + [header, ...rows].map(r => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8" }));
    link.download = "goride-bookings.csv"; link.click(); showToast("Đã xuất báo cáo CSV.");
});

/* ===== STARTUP ===== */
(async function boot() {
    if (!getToken()) { showLogin(); return; }
    try {
        currentAdmin = await api("/api/admin/me");
        localStorage.setItem(CURRENT_ADMIN_KEY, JSON.stringify(currentAdmin));
        showApp();
        await afterLoginInit();
    } catch (err) {
        logout();
        showToast(err.message);
    }
})();
