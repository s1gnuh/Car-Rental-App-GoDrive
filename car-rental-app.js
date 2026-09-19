const initialCars = [
    { id: 1, name: "Toyota Camry", brand: "Toyota", type: "Sedan", seats: 5, price: 850000, location: "Hà Nội", status: "available", rating: 4.9, featured: true },
    { id: 2, name: "Mazda CX-5", brand: "Mazda", type: "SUV", seats: 5, price: 950000, location: "TP. Hồ Chí Minh", status: "rented", rating: 4.8, featured: true },
    { id: 3, name: "Honda City", brand: "Honda", type: "Sedan", seats: 5, price: 650000, location: "Đà Nẵng", status: "available", rating: 4.7, featured: false },
    { id: 4, name: "VinFast VF 8", brand: "VinFast", type: "SUV", seats: 5, price: 1100000, location: "Hà Nội", status: "maintenance", rating: 4.9, featured: true },
    { id: 5, name: "Hyundai Grand i10", brand: "Hyundai", type: "Hatchback", seats: 5, price: 500000, location: "TP. Hồ Chí Minh", status: "available", rating: 4.6, featured: false },
    { id: 6, name: "Kia Seltos", brand: "Kia", type: "SUV", seats: 5, price: 780000, location: "Đà Nẵng", status: "available", rating: 4.8, featured: true },
    { id: 7, name: "Toyota Vios", brand: "Toyota", type: "Sedan", seats: 5, price: 600000, location: "Hà Nội", status: "available", rating: 4.7, featured: false },
    { id: 8, name: "Honda Brio", brand: "Honda", type: "Hatchback", seats: 5, price: 480000, location: "TP. Hồ Chí Minh", status: "available", rating: 4.6, featured: false }
];

const initialBookings = [
    {
        id: 10001,
        userId: 2,
        customerName: "Nguyễn Minh Anh",
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

let cars = JSON.parse(localStorage.getItem("goride_cars")) || initialCars;
let bookings = JSON.parse(localStorage.getItem("goride_bookings")) || initialBookings;
let currentUser = JSON.parse(localStorage.getItem("goride_user")) || null;
let activeFilter = "all";
let authMode = "login";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function saveData() {
    localStorage.setItem("goride_cars", JSON.stringify(cars));
    localStorage.setItem("goride_bookings", JSON.stringify(bookings));
}

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
    setTimeout(() => toast.classList.remove("show"), 2600);
}

function openModal(id) {
    $("#" + id).classList.remove("hidden");
}

function closeModal(id) {
    $("#" + id).classList.add("hidden");
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
      <div class="car-image ${car.type.toLowerCase()}">
        ${car.featured ? '<span class="car-tag">Được yêu thích</span>' : ""}
      </div>
      <div class="car-info">
        <div class="car-name-row">
          <span class="car-name">${car.name}</span>
          <span class="car-rating">★ ${car.rating}</span>
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
      <div class="car-image ${car.type.toLowerCase()}"></div>
      <div><h2>${car.name}</h2><p>${car.brand} · ${car.type} · ${car.seats} chỗ</p></div>
    </div>
    <form id="bookingForm">
      <input type="hidden" id="bookingCarId" value="${car.id}">
      <label>Địa điểm nhận xe<select id="bookingLocation"><option>${car.location}</option><option>Hà Nội</option><option>TP. Hồ Chí Minh</option><option>Đà Nẵng</option></select></label>
      <label>Ngày nhận xe<input type="date" id="bookingStart" value="${start}" required></label>
      <label>Ngày trả xe<input type="date" id="bookingEnd" value="${end}" required></label>
      <div class="booking-summary"><span>Giá thuê dự kiến</span><strong id="bookingTotal">${money(car.price)}</strong></div>
      <button class="btn btn-primary full" type="submit">Xác nhận đặt xe</button>
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

function hasOverlap(carId, start, end) {
    return bookings.some(booking =>
        booking.carId === carId &&
        ["pending", "confirmed"].includes(booking.status) &&
        new Date(start) < new Date(booking.endDate) &&
        new Date(end) > new Date(booking.startDate)
    );
}

function submitBooking(event) {
    event.preventDefault();

    if (!currentUser) {
        closeModal("bookingModal");
        showToast("Vui lòng đăng nhập trước khi đặt xe.");
        authMode = "login";
        updateAuthModal();
        openModal("authModal");
        return;
    }

    const carId = Number($("#bookingCarId").value);
    const car = cars.find(item => item.id === carId);
    const startDate = $("#bookingStart").value;
    const endDate = $("#bookingEnd").value;

    if (new Date(endDate) <= new Date(startDate)) {
        showToast("Ngày trả xe phải sau ngày nhận xe.");
        return;
    }

    if (hasOverlap(carId, startDate, endDate)) {
        showToast("Xe đã có đơn trong khoảng thời gian này.");
        return;
    }

    const days = dateDiff(startDate, endDate);
    bookings.push({
        id: Date.now(),
        userId: currentUser.id,
        customerName: currentUser.name,
        carId,
        carName: car.name,
        startDate,
        endDate,
        location: $("#bookingLocation").value,
        total: car.price * days,
        status: "pending",
        createdAt: new Date().toISOString()
    });

    saveData();
    closeModal("bookingModal");
    showToast("Đặt xe thành công. Đơn đang chờ xác nhận.");
}

function updateAuthModal() {
    const register = authMode === "register";
    $("#authTitle").textContent = register ? "Tạo tài khoản mới" : "Chào mừng trở lại";
    $("#authSubtitle").textContent = register ? "Đăng ký để bắt đầu hành trình" : "Đăng nhập để tiếp tục";
    $("#authName").parentElement.classList.toggle("hidden", !register);
    $("#authSubmit").textContent = register ? "Tạo tài khoản" : "Đăng nhập";
    $("#switchAuth").innerHTML = register
        ? 'Đã có tài khoản? <button type="button">Đăng nhập</button>'
        : 'Chưa có tài khoản? <button type="button">Đăng ký ngay</button>';
    $("#switchAuth button").onclick = () => {
        authMode = register ? "login" : "register";
        updateAuthModal();
    };
}

$("#authForm").addEventListener("submit", event => {
    event.preventDefault();

    const email = $("#authEmail").value.trim();
    const password = $("#authPassword").value;
    const name = $("#authName").value.trim() || email.split("@")[0];

    if (authMode === "register") {
        currentUser = { id: Date.now(), name, email, role: email.includes("admin") ? "admin" : "customer" };
        localStorage.setItem("goride_user", JSON.stringify(currentUser));
        closeModal("authModal");
        showToast("Đăng ký thành công.");
    } else {
        currentUser = { id: 1, name, email, role: email.includes("admin") ? "admin" : "customer" };
        localStorage.setItem("goride_user", JSON.stringify(currentUser));
        closeModal("authModal");
        showToast("Đăng nhập thành công.");
    }

    updateUserUI();
});

function updateUserUI() {
    if (currentUser) {
        $("#loginBtn").classList.add("hidden");
        $("#registerBtn").classList.add("hidden");
        $("#userMenu").classList.remove("hidden");
        $("#userName").textContent = `Xin chào, ${currentUser.name}`;
        $("#myBookingsBtn").classList.remove("hidden");
        if (currentUser.role === "admin") {
            $("#adminDashboardBtn").classList.remove("hidden");
        } else {
            $("#adminDashboardBtn").classList.add("hidden");
        }
    } else {
        $("#loginBtn").classList.remove("hidden");
        $("#registerBtn").classList.remove("hidden");
        $("#userMenu").classList.add("hidden");
        $("#myBookingsBtn").classList.add("hidden");
        $("#adminDashboardBtn").classList.add("hidden");
    }
}

function statusLabel(status) {
    return {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        cancelled: "Đã hủy"
    }[status] || status;
}

function renderMyBookings() {
    if (!currentUser) {
        showToast("Vui lòng đăng nhập để xem đơn đặt.");
        authMode = "login";
        updateAuthModal();
        openModal("authModal");
        return;
    }

    const list = bookings.filter(item => item.userId === currentUser.id).sort((a, b) => b.id - a.id);
    $("#myBookingsList").innerHTML = list.length ? list.map(booking => `
    <div class="booking-row">
      <div><strong>${booking.carName}</strong><small>${booking.startDate} → ${booking.endDate} · ${booking.location}</small></div>
      <div class="booking-actions">
        <div><strong>${money(booking.total)}</strong><small><span class="status ${booking.status}">${statusLabel(booking.status)}</span></small></div>
        ${booking.status === "pending" ? `<button class="btn btn-outline" onclick="cancelMyBooking(${booking.id})">Hủy đơn</button>` : ""}
      </div>
    </div>
  `).join("") : `<p class="empty-state">Bạn chưa có đơn đặt xe nào.</p>`;

    openModal("myBookingsModal");
}

function cancelMyBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;
    if (!confirm("Bạn có chắc muốn hủy đơn đặt xe này?")) return;
    booking.status = "cancelled";
    saveData();
    renderMyBookings();
    renderCars();
    showToast("Đã hủy đơn đặt xe.");
}

$("#loginBtn").onclick = () => {
    authMode = "login";
    updateAuthModal();
    openModal("authModal");
};

$("#registerBtn").onclick = () => {
    authMode = "register";
    updateAuthModal();
    openModal("authModal");
};

$("#logoutBtn").onclick = () => {
    currentUser = null;
    localStorage.removeItem("goride_user");
    updateUserUI();
    showToast("Đã đăng xuất.");
};

$("#myBookingsBtn").onclick = renderMyBookings;

$("#adminDashboardBtn").onclick = () => {
    window.location.href = "car-rental-app-admin.html";
};

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

const today = new Date().toISOString().slice(0, 10);
$("#startDate").min = today;
$("#endDate").min = today;

if (!localStorage.getItem("goride_cars")) saveData();
renderCars();
updateUserUI();
