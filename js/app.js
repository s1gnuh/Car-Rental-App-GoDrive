const API = {
    async getCars() {
        const res = await fetch("/api/products.php");
        if (!res.ok) throw new Error("Không tải được danh sách xe");
        return res.json();
    },
    async createBooking(data) {
        const res = await fetch("/api/orders.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || "Đặt xe không thành công");
        return body;
    },
    async lookupBookings({ email, phone }) {
        const qs = new URLSearchParams({ action: "lookup" });
        if (email) qs.set("email", email);
        if (phone) qs.set("phone", phone);
        const res = await fetch(`/api/orders.php?${qs.toString()}`);
        if (!res.ok) throw new Error((await res.json()).error || "Lỗi tra cứu");
        return res.json();
    }
};

let cars = [];
let activeFilter = "all";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function money(value) {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

function dateDiff(start, end) {
    const a = new Date(start);
    const b = new Date(end);
    return Math.max(1, Math.ceil((b - a) / 86400000));
}

function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

function openModal(id) { $("#" + id).classList.remove("hidden"); }
function closeModal(id) { $("#" + id).classList.add("hidden"); }

function statusLabel(status) {
    return {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        cancelled: "Đã hủy"
    }[status] || status;
}

function statusClass(status) {
    if (status === "confirmed") return "confirmed";
    if (status === "cancelled") return "cancelled";
    return "pending";
}

async function loadCars() {
    try {
        cars = await API.getCars();
        renderCars();
    } catch (err) {
        showToast(err.message);
    }
}

function carImageBlock(car, extraClass = "") {
    const type = (car.type || "").toLowerCase();
    const img = (car.image || "").trim();
    const tag = car.featured ? '<span class="car-tag">Được yêu thích</span>' : "";
    if (img) {
        return `<div class="car-image has-photo ${extraClass}">${tag}<img src="${img}" alt="${car.name || "Xe"}" /></div>`;
    }
    return `<div class="car-image ${type} ${extraClass}">${tag}</div>`;
}

function renderCars() {
    const location = $("#locationFilter").value;
    const sort = $("#sortCars").value;

    let result = cars.filter(car => car.status !== "maintenance");
    if (activeFilter !== "all") result = result.filter(car => car.type === activeFilter);
    if (location) result = result.filter(car => car.location === location);

    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "featured") result.sort((a, b) => Number(b.featured) - Number(a.featured));

    $("#carGrid").innerHTML = result.map(car => `
    <article class="car-card">
      ${carImageBlock(car)}
      <div class="car-info">
        <div class="car-name-row">
          <span class="car-name">${car.name}</span>
          <span class="car-rating">★ ${car.rating || 4.8}</span>
        </div>
        <div class="car-meta">
          <span>♙ ${car.seats} chỗ</span>
          <span>⚙ Tự động</span>
          <span>📍 ${car.location}</span>
        </div>
        <div class="car-bottom">
          <div class="price"><strong>${money(car.price)}</strong><small>/ngày</small></div>
          ${car.status === "available"
            ? `<button class="btn btn-primary" onclick="openBooking(${car.id})">Đặt xe</button>`
            : `<button class="btn btn-outline" disabled>Không khả dụng</button>`
          }
        </div>
      </div>
    </article>
  `).join("");

    $("#emptyCars").classList.toggle("hidden", result.length > 0);
}

function openBooking(carId) {
    const car = cars.find(item => item.id === carId);
    if (!car || car.status !== "available") {
        showToast("Xe hiện không khả dụng để đặt.");
        return;
    }
    const start = $("#startDate").value || new Date().toISOString().slice(0, 10);
    const end = $("#endDate").value || new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    $("#bookingContent").innerHTML = `
    <div class="booking-head">
      ${carImageBlock(car)}
      <div><h2>${car.name}</h2><p>${car.brand} · ${car.type} · ${car.seats} chỗ</p></div>
    </div>
    <form id="bookingForm">
      <input type="hidden" id="bookingCarId" value="${car.id}">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <label>Họ và tên *<input type="text" id="b_name" required placeholder="Nguyễn Văn A"></label>
        <label>Số điện thoại *<input type="tel" id="b_phone" required placeholder="0912 345 678"></label>
      </div>
      <label>Email *<input type="email" id="b_email" required placeholder="email@example.com"></label>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
        <label>Địa điểm nhận xe<select id="bookingLocation"><option>${car.location}</option><option>Hà Nội</option><option>TP. Hồ Chí Minh</option><option>Đà Nẵng</option></select></label>
        <label>Ngày nhận xe<input type="date" id="bookingStart" value="${start}" required></label>
        <label>Ngày trả xe<input type="date" id="bookingEnd" value="${end}" required></label>
      </div>
      <div class="booking-summary"><span>Giá thuê dự kiến</span><strong id="bookingTotal">${money(car.price)}</strong></div>
      <button class="btn btn-primary full" type="submit" id="b_submitBtn">Xác nhận đặt xe</button>
    </form>
  `;

    openModal("bookingModal");
    updateBookingTotal();

    $("#bookingStart").addEventListener("change", updateBookingTotal);
    $("#bookingEnd").addEventListener("change", updateBookingTotal);
    $("#bookingForm").addEventListener("submit", submitBooking);
}

function updateBookingTotal() {
    const carId = Number($("#bookingCarId").value);
    const car = cars.find(item => item.id === carId);
    const days = dateDiff($("#bookingStart").value, $("#bookingEnd").value);
    $("#bookingTotal").textContent = `${money(car.price * days)} (${days} ngày)`;
}

async function submitBooking(event) {
    event.preventDefault();
    const btn = $("#b_submitBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Đang xử lý..."; }
    try {
        const data = {
            customerName: $("#b_name").value.trim(),
            customerEmail: $("#b_email").value.trim(),
            customerPhone: $("#b_phone").value.trim(),
            carId: Number($("#bookingCarId").value),
            startDate: $("#bookingStart").value,
            endDate: $("#bookingEnd").value,
            location: $("#bookingLocation").value
        };
        if (new Date(data.endDate) <= new Date(data.startDate)) throw new Error("Ngày trả xe phải sau ngày nhận xe");
        const booking = await API.createBooking(data);
        closeModal("bookingModal");
        showToast(`✅ Đặt xe thành công! Mã đơn: #${String(booking.id).slice(-5)}. Admin sẽ liên hệ để xác nhận.`);
        loadCars();
    } catch (err) {
        showToast(err.message);
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = "Xác nhận đặt xe"; }
    }
}

async function submitLookup(event) {
    event.preventDefault();
    const email = $("#lookupEmail").value.trim();
    const phone = $("#lookupPhone").value.trim();
    const box = $("#lookupResults");
    if (!email && !phone) {
        box.innerHTML = `<p class="empty-state" style="text-align:center">Vui lòng nhập Email hoặc Số điện thoại</p>`;
        return;
    }
    try {
        box.innerHTML = `<p style="text-align:center;color:var(--muted)">Đang tra cứu...</p>`;
        const list = await API.lookupBookings({ email, phone });
        if (!list.length) {
            box.innerHTML = `<p class="empty-state" style="text-align:center">Không tìm thấy đơn đặt xe nào.</p>`;
            return;
        }
        box.innerHTML = list.map(b => `
          <div class="booking-row">
            <div>
              <strong>#${String(b.id).slice(-5)} · ${b.carName}</strong>
              <small>${b.startDate} → ${b.endDate} · ${b.location}</small>
              <small>Liên hệ: ${b.customerPhone} · ${b.customerEmail}</small>
            </div>
            <div class="booking-actions">
              <div>
                <strong>${money(b.total)}</strong>
                <small><span class="status ${statusClass(b.status)}">${statusLabel(b.status)}</span></small>
              </div>
            </div>
          </div>
        `).join("");
    } catch (err) {
        box.innerHTML = `<p class="empty-state" style="text-align:center">Lỗi: ${err.message}</p>`;
    }
}

$("#searchBtn").onclick = () => {
    renderCars();
    document.querySelector("#cars").scrollIntoView({ behavior: "smooth" });
};

$("#locationFilter").onchange = renderCars;
$("#sortCars").onchange = renderCars;

$$(".filter-chip").forEach(button => {
    button.onclick = () => {
        $$(".filter-chip").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        activeFilter = button.dataset.filter;
        renderCars();
    };
});

$$("[data-close]").forEach(button => {
    button.onclick = () => closeModal(button.dataset.close);
});

window.onclick = event => {
    if (event.target.classList.contains("modal")) event.target.classList.add("hidden");
};

document.addEventListener("keydown", event => {
    if (event.key === "Escape") $$(".modal").forEach(modal => modal.classList.add("hidden"));
});

$("#lookupBtn").onclick = () => {
    $("#lookupForm").reset();
    $("#lookupResults").innerHTML = "";
    openModal("lookupModal");
};
$("#footerLookupBtn").onclick = e => { e.preventDefault(); $("#lookupBtn").click(); };
$("#lookupForm").addEventListener("submit", submitLookup);

const today = new Date().toISOString().slice(0, 10);
if ($("#startDate")) { $("#startDate").min = today; $("#startDate").value = today; }
if ($("#endDate")) { $("#endDate").min = today; $("#endDate").value = new Date(Date.now() + 86400000).toISOString().slice(0, 10); }

loadCars();
