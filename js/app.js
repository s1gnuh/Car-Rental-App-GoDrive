/* ================== GoDrive - trang khách ================== */

const LANG_KEY = "godrive_lang";
const THEME_KEY = "godrive_theme";
const CONTACT_KEY = "godrive_contact";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function store(key, value) {
    try {
        if (value === undefined) return localStorage.getItem(key);
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch (_) { return null; }
}

// Escape dữ liệu trước khi chèn vào innerHTML để chống XSS
function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch]));
}

// Chỉ cho phép ảnh http(s)
function safeUrl(value) {
    const url = String(value ?? "").trim();
    return /^https?:\/\//i.test(url) ? url : "";
}

const icon = (name, cls = "") => `<svg class="i ${cls}"><use href="#i-${name}"/></svg>`;

/* ================== Đa ngôn ngữ ================== */

// Bản dịch tiếng Anh cho nội dung tĩnh trong index.html (tiếng Việt lấy từ chính HTML)
const EN_STATIC = {
    "skip": "Skip to car list",
    "nav.aria": "Main navigation",
    "nav.home": "Home",
    "nav.cars": "Find a car",
    "nav.how": "How it works",
    "nav.about": "Why GoDrive",
    "nav.faq": "FAQ",
    "nav.lookup": "Track booking",
    "nav.book": "Book now",
    "nav.menu": "Open menu",
    "lang.switch": "Chuyển sang tiếng Việt",
    "theme.toggle": "Toggle light/dark mode",
    "hero.pill": "Book in 30 seconds · No account needed",
    "hero.title": "Explore every journey<br><span class=\"gradient-text\">your way</span>",
    "hero.desc": "Pick the right car, preview the total cost and book instantly. Fast confirmation, transparent pricing, no hidden fees.",
    "hero.cta": "Find a car",
    "hero.how": "How it works",
    "hero.statCars": "cars available",
    "hero.statCities": "cities",
    "hero.statSupport": "support",
    "hero.float1": "Booking confirmed",
    "hero.float1s": "We'll contact you shortly",
    "hero.float2s": "Average rating",
    "search.location": "Pick-up location",
    "search.allLocations": "All locations",
    "city.hn": "Hanoi",
    "city.hcm": "Ho Chi Minh City",
    "city.dn": "Da Nang",
    "search.start": "Pick-up date",
    "search.end": "Return date",
    "search.btn": "Search",
    "cars.eyebrow": "Our fleet",
    "cars.title": "Choose the right car",
    "cars.filterAria": "Filter by car type",
    "cars.all": "All",
    "cars.sort": "Sort",
    "cars.sortFeatured": "Most popular",
    "cars.sortLow": "Price: low to high",
    "cars.sortHigh": "Price: high to low",
    "cars.emptyTitle": "No matching cars",
    "cars.emptyDesc": "Try another location or remove some filters.",
    "cars.reset": "Clear filters",
    "how.eyebrow": "3 simple steps",
    "how.title": "Renting a car has never been <span class=\"gradient-text\">this easy</span>",
    "how.s1": "Choose a car & dates",
    "how.s1d": "Filter by type and location, and see the daily price right away.",
    "how.s2": "Enter your contact info",
    "how.s2d": "Just your name, phone number and email. The total is calculated for you.",
    "how.s3": "Get confirmed & hit the road",
    "how.s3d": "GoDrive contacts you to confirm. Track your booking status anytime.",
    "why.eyebrow": "Why GoDrive?",
    "why.title": "A <span class=\"gradient-text\">different</span> car rental experience",
    "why.f1": "No account needed",
    "why.f1d": "Only your contact details. Simple and done in 30 seconds.",
    "why.f2": "Transparent pricing",
    "why.f2d": "No hidden fees. Know exactly what you pay before confirming.",
    "why.f3": "No double bookings",
    "why.f3d": "Our system checks every car's schedule so your car is always ready.",
    "why.f4": "Caring support",
    "why.f4d": "The GoDrive team is here for you 24/7 throughout your trip.",
    "faq.eyebrow": "FAQ",
    "faq.title": "Frequently asked questions",
    "faq.desc": "Can't find an answer? Call <a href=\"tel:0365551920\">0365 551 920</a> for help.",
    "faq.q1": "Do I need an account to book a car?",
    "faq.a1": "No. You only need to enter your name, phone number and email when booking.",
    "faq.q2": "When will my booking be confirmed?",
    "faq.a2": "New bookings are \"Pending\". A GoDrive staff member will call the phone number you entered to confirm.",
    "faq.q3": "How can I view my booking?",
    "faq.a3": "Click \"Track booking\" and enter the email and phone number you used. Both are required to protect your booking.",
    "faq.q4": "How is the price calculated?",
    "faq.a4": "Total = daily rate × number of rental days. The amount is shown clearly before you confirm.",
    "cta.eyebrow": "Ready to go?",
    "cta.title": "Start your journey today",
    "cta.desc": "Brand-new cars are waiting for you in Hanoi, Ho Chi Minh City and Da Nang.",
    "footer.about": "A fast, transparent self-drive car rental platform. With you on every journey.",
    "footer.explore": "Explore",
    "footer.aboutUs": "About us",
    "footer.support": "Support",
    "footer.admin": "Admin portal",
    "footer.contact": "Contact",
    "footer.support247": "24/7 support",
    "footer.copy": "© 2026 GoDrive. All rights reserved.",
    "backTop": "Back to top",
    "close": "Close",
    "booking.aria": "Book a car",
    "lookup.title": "Track your booking",
    "lookup.desc": "Enter both the email and phone number you used",
    "form.phone": "Phone number",
    "lookup.btn": "View my bookings"
};

// Chuỗi dùng trong JS: [tiếng Việt, tiếng Anh]
const STR = {
    pageTitle: ["GoDrive - Thuê xe tự lái dễ dàng", "GoDrive - Easy self-drive car rental"],
    metaDesc: ["GoDrive - thuê xe tự lái nhanh chóng, giá minh bạch, không cần tài khoản. Có xe tại Hà Nội, TP. Hồ Chí Minh và Đà Nẵng.", "GoDrive - fast self-drive car rental with transparent pricing and no account required. Available in Hanoi, Ho Chi Minh City and Da Nang."],
    loadingCars: ["Đang tải danh sách xe...", "Loading cars..."],
    loadFail: ["Không tải được danh sách xe. Vui lòng thử lại.", "Couldn't load cars. Please try again."],
    carCount: ["Hiển thị {n} xe · {a} xe sẵn sàng", "Showing {n} cars · {a} available"],
    days: ["{n} ngày", "{n} day(s)"],
    hint: ["Thuê <strong>{n} ngày</strong> · Bạn có thể đổi ngày khi đặt xe", "Renting for <strong>{n} day(s)</strong> · You can change dates when booking"],
    featured: ["Được yêu thích", "Popular"],
    seats: ["{n} chỗ", "{n} seats"],
    auto: ["Tự động", "Automatic"],
    perDay: ["/ngày", "/day"],
    book: ["Đặt xe", "Book"],
    unavailable: ["Không khả dụng", "Unavailable"],
    rented: ["Đang cho thuê", "Rented"],
    notAvailableToast: ["Xe hiện không khả dụng để đặt.", "This car is currently unavailable."],
    contactInfo: ["Thông tin liên hệ", "Contact information"],
    tripInfo: ["Chuyến đi", "Trip details"],
    fullName: ["Họ và tên", "Full name"],
    phone: ["Số điện thoại", "Phone number"],
    namePh: ["Nguyễn Văn A", "John Smith"],
    pickupLocation: ["Địa điểm nhận xe", "Pick-up location"],
    pickupDate: ["Ngày nhận xe", "Pick-up date"],
    returnDate: ["Ngày trả xe", "Return date"],
    dailyRate: ["Giá thuê / ngày", "Daily rate"],
    rentalDays: ["Số ngày thuê", "Rental days"],
    total: ["Tổng cộng", "Total"],
    confirmBooking: ["Xác nhận đặt xe", "Confirm booking"],
    bookingNote: ["Bạn chưa phải thanh toán ngay. GoDrive sẽ gọi điện xác nhận đơn.", "No payment now. GoDrive will call you to confirm the booking."],
    errName: ["Vui lòng nhập họ tên", "Please enter your name"],
    errNameChars: ["Họ tên chỉ được chứa chữ cái", "Name can only contain letters"],
    errPhone: ["Số điện thoại phải gồm 9–10 chữ số", "Phone number must have 9–10 digits"],
    errPhoneChars: ["Số điện thoại chỉ được nhập số, tối đa 10 số", "Phone number: digits only, max 10"],
    errEmail: ["Email không hợp lệ", "Invalid email address"],
    errDates: ["Ngày trả xe phải sau ngày nhận xe", "Return date must be after pick-up date"],
    errPast: ["Ngày nhận xe không được ở quá khứ", "Pick-up date cannot be in the past"],
    successTitle: ["Đặt xe thành công!", "Booking successful!"],
    successDesc: ["Mã đơn của bạn là <strong>#{id}</strong>. GoDrive sẽ liên hệ qua số {phone} để xác nhận.", "Your booking code is <strong>#{id}</strong>. GoDrive will call {phone} to confirm."],
    car: ["Xe", "Car"],
    dates: ["Thời gian", "Dates"],
    trackBooking: ["Tra cứu đơn", "Track booking"],
    done: ["Xong", "Done"],
    bookedToast: ["Đặt xe thành công! Mã đơn #{id}", "Booking successful! Code #{id}"],
    lookupNeedBoth: ["Vui lòng nhập cả Email và Số điện thoại", "Please enter both email and phone number"],
    lookupNone: ["Không tìm thấy đơn đặt xe nào khớp với thông tin này.", "No bookings match this information."],
    lookupFound: ["Tìm thấy {n} đơn", "Found {n} booking(s)"],
    errorPrefix: ["Lỗi: ", "Error: "],
    pending: ["Chờ xác nhận", "Pending"],
    confirmed: ["Đã xác nhận", "Confirmed"],
    cancelled: ["Đã hủy", "Cancelled"],
    datesInvalidToast: ["Ngày trả xe phải sau ngày nhận xe", "Return date must be after pick-up date"],
    themeDark: ["Đã bật chế độ tối", "Dark mode on"],
    themeLight: ["Đã bật chế độ sáng", "Light mode on"],
    openMenu: ["Mở menu", "Open menu"],
    closeMenu: ["Đóng menu", "Close menu"],
    network: ["Không kết nối được máy chủ. Vui lòng thử lại.", "Couldn't reach the server. Please try again."]
};

// Dịch thông báo lỗi trả về từ API (server luôn trả tiếng Việt)
const SERVER_ERRORS_EN = {
    "Thiếu thông tin đặt xe": "Missing booking information",
    "Email không hợp lệ": "Invalid email address",
    "Số điện thoại không hợp lệ": "Invalid phone number",
    "Số điện thoại chỉ được gồm 9-10 chữ số": "Phone number must have 9-10 digits only",
    "Họ tên chỉ được chứa chữ cái": "Name can only contain letters",
    "Ngày không hợp lệ": "Invalid date",
    "Ngày nhận xe không được ở quá khứ": "Pick-up date cannot be in the past",
    "Ngày trả xe phải sau ngày nhận xe": "Return date must be after pick-up date",
    "Thời gian thuê tối đa 90 ngày": "The maximum rental period is 90 days",
    "Không tìm thấy xe": "Car not found",
    "Xe không khả dụng": "This car is not available",
    "Xe đã có đơn trong khoảng thời gian này": "This car is already booked for these dates",
    "Cần nhập cả email và số điện thoại đã dùng khi đặt": "Please enter both the email and phone number used for booking",
    "Không ghi được dữ liệu": "Couldn't save data. Please try again."
};

const CITY_EN = { "Hà Nội": "Hanoi", "TP. Hồ Chí Minh": "Ho Chi Minh City", "Đà Nẵng": "Da Nang" };

let lang = store(LANG_KEY) === "en" ? "en" : "vi";
const viOriginal = new Map();

function t(key, vars = {}) {
    const pair = STR[key];
    let text = pair ? pair[lang === "en" ? 1 : 0] : key;
    for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, v);
    return text;
}

const serverMsg = (msg) => (lang === "en" && SERVER_ERRORS_EN[msg]) || msg;
const city = (name) => (lang === "en" && CITY_EN[name]) || name;
const locale = () => (lang === "en" ? "en-US" : "vi-VN");

function money(value) {
    return new Intl.NumberFormat(locale()).format(Number(value) || 0) + " ₫";
}

function fmtDate(value) {
    if (!value) return "";
    const d = new Date(String(value).length === 10 ? value + "T00:00:00" : value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString(locale(), { day: "2-digit", month: "short", year: "numeric" });
}

function applyStaticTranslations() {
    $$("[data-i18n], [data-i18n-html], [data-i18n-aria]").forEach(el => {
        if (!viOriginal.has(el)) {
            viOriginal.set(el, {
                text: el.dataset.i18n ? el.textContent : null,
                html: el.dataset.i18nHtml ? el.innerHTML : null,
                aria: el.dataset.i18nAria ? el.getAttribute("aria-label") : null
            });
        }
        const orig = viOriginal.get(el);
        if (el.dataset.i18n) el.textContent = lang === "en" ? (EN_STATIC[el.dataset.i18n] ?? orig.text) : orig.text;
        if (el.dataset.i18nHtml) el.innerHTML = lang === "en" ? (EN_STATIC[el.dataset.i18nHtml] ?? orig.html) : orig.html;
        if (el.dataset.i18nAria) el.setAttribute("aria-label", lang === "en" ? (EN_STATIC[el.dataset.i18nAria] ?? orig.aria) : orig.aria);
    });
    document.documentElement.lang = lang;
    document.title = t("pageTitle");
    $('meta[name="description"]')?.setAttribute("content", t("metaDesc"));
    $("#langLabel").textContent = lang === "en" ? "VI" : "EN";
}

function setLang(next) {
    lang = next;
    store(LANG_KEY, lang);
    applyStaticTranslations();
    updateSearchHint();
    if (cars.length || loadFailed) renderCars();
    if (!$("#bookingModal").classList.contains("hidden") && bookingCarId != null) {
        if ($("#bookingForm")) openBooking(bookingCarId, true);
    }
    if ($("#lookupResults").innerHTML && lastLookup) renderLookup(lastLookup);
}

/* ================== Chế độ sáng / tối ================== */

function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

function setTheme(theme, persist = true) {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.setAttribute("data-theme", theme);
    $('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0e0d18" : "#5b3fd9");
    if (persist) store(THEME_KEY, theme);
    setTimeout(() => root.classList.remove("theme-anim"), 400);
}

/* ================== API ================== */

const API = {
    async request(url, options) {
        let res;
        try {
            res = await fetch(url, options);
        } catch (_) {
            throw new Error(t("network"));
        }
        let body = {};
        try { body = await res.json(); } catch (_) { }
        if (!res.ok) throw new Error(serverMsg(body.error) || t("network"));
        return body;
    },
    getCars() {
        return this.request("/api/products.php");
    },
    createBooking(data) {
        return this.request("/api/orders.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
    },
    lookupBookings({ email, phone }) {
        const qs = new URLSearchParams({ action: "lookup", email, phone });
        return this.request(`/api/orders.php?${qs.toString()}`);
    }
};

/* ================== Tiện ích ================== */

let cars = [];
let loadFailed = false;
let activeFilter = "all";
let bookingCarId = null;
let lastLookup = null;
let lastFocused = null;

const todayStr = () => toDateStr(new Date());

function toDateStr(d) {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
}

function addDays(dateStr, n) {
    const d = new Date(dateStr + "T00:00:00");
    d.setDate(d.getDate() + n);
    return toDateStr(d);
}

function dateDiff(start, end) {
    const a = new Date(start + "T00:00:00");
    const b = new Date(end + "T00:00:00");
    return Math.max(1, Math.round((b - a) / 86400000));
}

let toastTimer;
function showToast(message, type = "info") {
    const toast = $("#toast");
    const ico = type === "success" ? "check" : type === "error" ? "alert" : "alert";
    toast.className = type;
    toast.innerHTML = `${icon(ico)}<span>${esc(message)}</span>`;
    requestAnimationFrame(() => toast.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3800);
}

function getContact() {
    try { return JSON.parse(store(CONTACT_KEY) || "null") || {}; } catch (_) { return {}; }
}

/* ================== Modal ================== */

function openModal(id) {
    const modal = $("#" + id);
    lastFocused = document.activeElement;
    modal.classList.remove("hidden", "closing");
    document.body.classList.add("no-scroll");
    setTimeout(() => {
        const first = $("input:not([type=hidden]), select, button:not(.modal-close)", modal);
        first?.focus({ preventScroll: true });
    }, 60);
}

function closeModal(id) {
    const modal = $("#" + id);
    if (modal.classList.contains("hidden") || modal.classList.contains("closing")) return;
    modal.classList.add("closing");
    setTimeout(() => {
        modal.classList.add("hidden");
        modal.classList.remove("closing");
        if (!$$(".modal:not(.hidden)").length) document.body.classList.remove("no-scroll");
        lastFocused?.focus?.({ preventScroll: true });
    }, 190);
}

function closeAllModals() {
    $$(".modal:not(.hidden)").forEach(m => closeModal(m.id));
}

/* ================== Danh sách xe ================== */

function renderSkeleton() {
    $("#carGrid").innerHTML = Array.from({ length: 4 }, () => `
        <div class="skeleton-card" aria-hidden="true">
            <div class="sk sk-img"></div>
            <div class="sk-body">
                <div class="sk sk-line" style="width:60%"></div>
                <div class="sk sk-line" style="width:85%"></div>
                <div class="sk sk-line" style="width:40%;height:22px"></div>
            </div>
        </div>`).join("");
    $("#carCount").textContent = t("loadingCars");
}

async function loadCars() {
    renderSkeleton();
    try {
        cars = await API.getCars();
        loadFailed = false;
    } catch (err) {
        cars = [];
        loadFailed = true;
        showToast(err.message, "error");
    }
    renderCars();
}

function carImageBlock(car, extraClass = "") {
    const type = (car.type || "").toLowerCase();
    const img = safeUrl(car.image);
    const tag = car.featured ? `<span class="car-tag">${icon("star")} ${esc(t("featured"))}</span>` : "";
    const status = car.status === "rented" ? `<span class="car-status">${esc(t("rented"))}</span>` : "";
    if (img) {
        return `<div class="car-image has-photo ${extraClass}">${tag}${status}<img src="${esc(img)}" alt="${esc(car.name || "")}" loading="lazy" /></div>`;
    }
    return `<div class="car-image ${esc(type)} ${extraClass}">${tag}${status}</div>`;
}

function renderCars() {
    const location = $("#locationFilter").value;
    const sort = $("#sortCars").value;

    const visible = cars.filter(car => car.status !== "maintenance");
    let result = visible;
    if (activeFilter !== "all") result = result.filter(car => car.type === activeFilter);
    if (location) result = result.filter(car => car.location === location);

    result = [...result];
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    if (sort === "featured") result.sort((a, b) => Number(b.featured) - Number(a.featured) || (b.rating || 0) - (a.rating || 0));
    // Xe sẵn sàng luôn hiển thị trước
    result.sort((a, b) => Number(b.status === "available") - Number(a.status === "available"));

    const available = visible.filter(c => c.status === "available").length;
    $("#statCars").textContent = loadFailed ? "–" : available;
    $("#carCount").textContent = loadFailed
        ? t("loadFail")
        : t("carCount", { n: result.length, a: result.filter(c => c.status === "available").length });

    $("#carGrid").innerHTML = result.map((car, i) => {
        const ok = car.status === "available";
        return `
        <article class="car-card ${ok ? "" : "unavailable"}" style="--i:${i}">
            ${carImageBlock(car)}
            <div class="car-info">
                <div class="car-name-row">
                    <div>
                        <span class="car-name">${esc(car.name)}</span>
                        <span class="car-brand">${esc(car.brand)} · ${esc(car.type)}</span>
                    </div>
                    <span class="car-rating">${icon("star")} ${esc(car.rating || 4.8)}</span>
                </div>
                <div class="car-meta">
                    <span>${icon("users")} ${esc(t("seats", { n: car.seats }))}</span>
                    <span>${icon("gear")} ${esc(t("auto"))}</span>
                    <span>${icon("pin")} ${esc(city(car.location))}</span>
                </div>
                <div class="car-bottom">
                    <div class="price"><strong>${esc(money(car.price))}</strong><small>${esc(t("perDay"))}</small></div>
                    ${ok
                ? `<button class="btn btn-primary" data-book="${Number(car.id)}">${esc(t("book"))}</button>`
                : `<button class="btn btn-outline" disabled>${esc(t("unavailable"))}</button>`}
                </div>
            </div>
        </article>`;
    }).join("");

    $("#emptyCars").classList.toggle("hidden", result.length > 0 || loadFailed);
}

/* ================== Tìm kiếm ================== */

function syncDateInputs() {
    const start = $("#startDate");
    const end = $("#endDate");
    start.min = todayStr();
    if (!start.value || start.value < start.min) start.value = start.min;
    end.min = addDays(start.value, 1);
    if (!end.value || end.value <= start.value) end.value = addDays(start.value, 1);
    updateSearchHint();
}

function updateSearchHint() {
    const s = $("#startDate").value, e = $("#endDate").value;
    if (s && e) $("#searchHint").innerHTML = t("hint", { n: dateDiff(s, e) });
}

/* ================== Đặt xe ================== */

function field(id, label, input, extra = "") {
    return `<label class="field ${extra}"><span class="field-label">${esc(label)}</span>${input}</label>`;
}

function openBooking(carId, keepValues = false) {
    const car = cars.find(item => item.id === carId);
    if (!car || car.status !== "available") {
        showToast(t("notAvailableToast"), "error");
        return;
    }

    // Giữ lại dữ liệu đang nhập khi đổi ngôn ngữ, nếu không thì lấy thông tin đã lưu lần trước
    const prev = keepValues && $("#bookingForm") ? {
        name: $("#b_name").value, phone: $("#b_phone").value, email: $("#b_email").value,
        location: $("#bookingLocation").value, start: $("#bookingStart").value, end: $("#bookingEnd").value
    } : null;
    const saved = getContact();
    const start = prev?.start || $("#startDate").value || todayStr();
    const end = prev?.end || $("#endDate").value || addDays(start, 1);
    const locations = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"];
    if (car.location && !locations.includes(car.location)) locations.unshift(car.location);
    const selectedLoc = prev?.location || car.location;

    bookingCarId = carId;
    $("#bookingContent").innerHTML = `
    <div class="booking-head">
        ${carImageBlock(car)}
        <div>
            <h2>${esc(car.name)}</h2>
            <p>${esc(car.brand)} · ${esc(car.type)} · ${esc(t("seats", { n: car.seats }))}</p>
            <span class="price-chip">${esc(money(car.price))}${esc(t("perDay"))}</span>
        </div>
    </div>
    <form id="bookingForm" novalidate>
        <input type="hidden" id="bookingCarId" value="${Number(car.id)}">
        <p class="form-section-title">${esc(t("contactInfo"))}</p>
        <div class="form-grid">
            ${field("b_name", t("fullName") + " *", `<input type="text" id="b_name" required autocomplete="name" maxlength="100" placeholder="${esc(t("namePh"))}" value="${esc(cleanName(prev?.name ?? saved.name ?? ""))}">`)}
            ${field("b_phone", t("phone") + " *", `<input type="tel" id="b_phone" required autocomplete="tel" inputmode="numeric" maxlength="${PHONE_MAX}" placeholder="0912345678" value="${esc(cleanPhone(prev?.phone ?? saved.phone ?? ""))}">`)}
        </div>
        ${field("b_email", "Email *", `<input type="email" id="b_email" required autocomplete="email" placeholder="email@example.com" value="${esc(prev?.email ?? saved.email ?? "")}">`)}
        <p class="form-section-title">${esc(t("tripInfo"))}</p>
        <div class="form-grid three">
            ${field("bookingLocation", t("pickupLocation"), `<select id="bookingLocation">${locations.map(l => `<option value="${esc(l)}" ${l === selectedLoc ? "selected" : ""}>${esc(city(l))}</option>`).join("")}</select>`)}
            ${field("bookingStart", t("pickupDate"), `<input type="date" id="bookingStart" value="${esc(start)}" min="${todayStr()}" required>`)}
            ${field("bookingEnd", t("returnDate"), `<input type="date" id="bookingEnd" value="${esc(end)}" min="${esc(addDays(start, 1))}" required>`)}
        </div>
        <div class="booking-summary">
            <div class="summary-row"><span>${esc(t("dailyRate"))}</span><span>${esc(money(car.price))}</span></div>
            <div class="summary-row"><span>${esc(t("rentalDays"))}</span><span id="bookingDays"></span></div>
            <div class="summary-row total"><span>${esc(t("total"))}</span><strong id="bookingTotal"></strong></div>
        </div>
        <button class="btn btn-primary full btn-large" type="submit" id="b_submitBtn">${esc(t("confirmBooking"))} ${icon("arrow")}</button>
        <p class="form-note">${icon("shield")}<span>${esc(t("bookingNote"))}</span></p>
    </form>`;

    if (!keepValues || $("#bookingModal").classList.contains("hidden")) openModal("bookingModal");
    updateBookingTotal(false);

    $("#bookingStart").addEventListener("change", () => {
        const s = $("#bookingStart"), e = $("#bookingEnd");
        e.min = addDays(s.value, 1);
        if (e.value <= s.value) e.value = addDays(s.value, 1);
        updateBookingTotal();
    });
    $("#bookingEnd").addEventListener("change", updateBookingTotal);
    $$("#bookingForm input:not(#b_name):not(#b_phone)").forEach(inp => inp.addEventListener("input", () => clearError(inp)));
    restrictInput($("#b_name"), cleanName, "errNameChars");
    restrictInput($("#b_phone"), cleanPhone, "errPhoneChars");
    $("#bookingForm").addEventListener("submit", submitBooking);
}

function updateBookingTotal(animate = true) {
    const car = cars.find(item => item.id === Number($("#bookingCarId").value));
    if (!car) return;
    const s = $("#bookingStart").value, e = $("#bookingEnd").value;
    const days = s && e && e > s ? dateDiff(s, e) : 1;
    $("#bookingDays").textContent = t("days", { n: days });
    const total = $("#bookingTotal");
    total.textContent = money(car.price * days);
    if (animate) {
        total.classList.remove("bump");
        void total.offsetWidth;
        total.classList.add("bump");
    }
}

function setError(input, message) {
    input.classList.add("invalid");
    input.setAttribute("aria-invalid", "true");
    let err = input.parentElement.querySelector(".field-error");
    if (!err) {
        err = document.createElement("span");
        err.className = "field-error";
        input.after(err);
    }
    err.textContent = message;
}

function clearError(input) {
    input.classList.remove("invalid");
    input.removeAttribute("aria-invalid");
    input.parentElement.querySelector(".field-error")?.remove();
}

/* Quy tắc nhập: họ tên chỉ gồm chữ cái (có dấu) và khoảng trắng; số điện thoại chỉ gồm số, tối đa 10 số */
const PHONE_MAX = 10;
const NAME_RE = /^\p{L}+(?: \p{L}+)*$/u;
const PHONE_RE = /^\d{9,10}$/;

const cleanName = (v) => String(v ?? "").replace(/[^\p{L}\p{M}\s]/gu, "").replace(/\s{2,}/g, " ").replace(/^\s+/, "");
const cleanPhone = (v) => String(v ?? "").replace(/\D/g, "").slice(0, PHONE_MAX);

// Lọc ký tự không hợp lệ ngay khi gõ/dán và báo cho khách biết vì sao ký tự bị bỏ
function restrictInput(input, clean, errKey) {
    if (!input) return;
    const apply = (e) => {
        if (e?.isComposing) return; // đang gõ bằng bộ gõ tiếng Việt, chờ gõ xong
        const before = input.value;
        const after = clean(before);
        if (after !== before) {
            input.value = after;
            setError(input, t(errKey));
        } else {
            clearError(input);
        }
    };
    input.addEventListener("input", apply);
    input.addEventListener("compositionend", apply);
}

function validateBooking() {
    const name = $("#b_name"), phone = $("#b_phone"), email = $("#b_email");
    const start = $("#bookingStart"), end = $("#bookingEnd");
    [name, phone, email, start, end].forEach(clearError);
    let firstBad = null;
    const bad = (el, msg) => { setError(el, msg); firstBad = firstBad || el; };

    name.value = name.value.trim().normalize("NFC");
    if (!name.value) bad(name, t("errName"));
    else if (!NAME_RE.test(name.value)) bad(name, t("errNameChars"));
    if (!PHONE_RE.test(phone.value)) bad(phone, /\D/.test(phone.value) ? t("errPhoneChars") : t("errPhone"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) bad(email, t("errEmail"));
    if (!start.value || start.value < todayStr()) bad(start, t("errPast"));
    if (!end.value || end.value <= start.value) bad(end, t("errDates"));

    firstBad?.focus();
    return !firstBad;
}

async function submitBooking(event) {
    event.preventDefault();
    if (!validateBooking()) return;
    const btn = $("#b_submitBtn");
    btn.classList.add("loading");
    btn.disabled = true;
    const data = {
        customerName: $("#b_name").value.trim(),
        customerEmail: $("#b_email").value.trim(),
        customerPhone: $("#b_phone").value.trim(),
        carId: Number($("#bookingCarId").value),
        startDate: $("#bookingStart").value,
        endDate: $("#bookingEnd").value,
        location: $("#bookingLocation").value
    };
    try {
        const booking = await API.createBooking(data);
        store(CONTACT_KEY, JSON.stringify({ name: data.customerName, phone: data.customerPhone, email: data.customerEmail }));
        showBookingSuccess(booking);
        showToast(t("bookedToast", { id: String(booking.id).slice(-5) }), "success");
        loadCars();
    } catch (err) {
        showToast(err.message, "error");
        btn.classList.remove("loading");
        btn.disabled = false;
    }
}

function showBookingSuccess(b) {
    bookingCarId = null;
    $("#bookingContent").innerHTML = `
    <div class="success-view">
        <div class="success-check">${icon("check")}</div>
        <h2>${esc(t("successTitle"))}</h2>
        <p>${t("successDesc", { id: esc(String(b.id).slice(-5)), phone: esc(b.customerPhone) })}</p>
        <div class="booking-summary success-details">
            <div class="summary-row"><span>${esc(t("car"))}</span><strong>${esc(b.carName)}</strong></div>
            <div class="summary-row"><span>${esc(t("dates"))}</span><span>${esc(fmtDate(b.startDate))} → ${esc(fmtDate(b.endDate))}</span></div>
            <div class="summary-row"><span>${esc(t("pickupLocation"))}</span><span>${esc(city(b.location))}</span></div>
            <div class="summary-row total"><span>${esc(t("total"))}</span><strong>${esc(money(b.total))}</strong></div>
        </div>
        <div class="success-actions">
            <button class="btn btn-light btn-large" id="successLookup">${icon("file")} ${esc(t("trackBooking"))}</button>
            <button class="btn btn-primary btn-large" id="successDone">${esc(t("done"))}</button>
        </div>
    </div>`;
    $("#successDone").onclick = () => closeModal("bookingModal");
    $("#successLookup").onclick = () => {
        closeModal("bookingModal");
        setTimeout(() => openLookup(true), 220);
    };
}

/* ================== Tra cứu đơn ================== */

function statusLabel(status) {
    return ["pending", "confirmed", "cancelled"].includes(status) ? t(status) : status;
}

function statusClass(status) {
    return ["confirmed", "cancelled"].includes(status) ? status : "pending";
}

function openLookup(autoSubmit = false) {
    $("#lookupForm").reset();
    $$("#lookupForm input").forEach(clearError);
    $("#lookupResults").innerHTML = "";
    lastLookup = null;
    const saved = getContact();
    if (saved.email) $("#lookupEmail").value = saved.email;
    if (saved.phone) $("#lookupPhone").value = cleanPhone(saved.phone);
    openModal("lookupModal");
    if (autoSubmit && saved.email && saved.phone) $("#lookupForm").requestSubmit();
}

function renderLookup(list) {
    const box = $("#lookupResults");
    if (!list.length) {
        box.innerHTML = `<div class="inline-message">${icon("alert")} ${esc(t("lookupNone"))}</div>`;
        return;
    }
    box.innerHTML = `<p class="form-section-title">${esc(t("lookupFound", { n: list.length }))}</p>` + list.map((b, i) => `
        <div class="booking-row" style="animation-delay:${i * 60}ms">
            <div class="booking-row-top">
                <strong>#${esc(String(b.id).slice(-5))} · ${esc(b.carName)}</strong>
                <span class="status ${statusClass(b.status)}">${esc(statusLabel(b.status))}</span>
            </div>
            <small>${icon("calendar")} ${esc(fmtDate(b.startDate))} → ${esc(fmtDate(b.endDate))}</small>
            <small>${icon("pin")} ${esc(city(b.location))}</small>
            <div class="booking-row-total"><span>${esc(t("total"))}</span><strong>${esc(money(b.total))}</strong></div>
        </div>`).join("");
}

async function submitLookup(event) {
    event.preventDefault();
    const emailEl = $("#lookupEmail"), phoneEl = $("#lookupPhone");
    const email = emailEl.value.trim();
    const phone = phoneEl.value.trim();
    [emailEl, phoneEl].forEach(clearError);
    if (!email || !phone) {
        if (!email) setError(emailEl, t("lookupNeedBoth"));
        if (!phone) setError(phoneEl, t("lookupNeedBoth"));
        (email ? phoneEl : emailEl).focus();
        return;
    }
    if (!PHONE_RE.test(phone)) {
        setError(phoneEl, t("errPhone"));
        phoneEl.focus();
        return;
    }
    const btn = $("#lookupSubmit");
    btn.classList.add("loading");
    try {
        lastLookup = await API.lookupBookings({ email, phone });
        renderLookup(lastLookup);
    } catch (err) {
        $("#lookupResults").innerHTML = `<div class="inline-message error">${icon("alert")} ${esc(err.message)}</div>`;
    } finally {
        btn.classList.remove("loading");
    }
}

/* ================== Điều hướng & hiệu ứng ================== */

function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    const btn = $("#menuToggle");
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? t("closeMenu") : t("openMenu"));
}

function initNavigation() {
    const navbar = $("#navbar");
    const backTop = $("#backToTop");
    const onScroll = () => {
        const y = window.scrollY;
        navbar.classList.toggle("scrolled", y > 8);
        backTop.classList.toggle("show", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    backTop.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
    $("#menuToggle").onclick = () => setMenu(!document.body.classList.contains("menu-open"));
    $$("#navLinks a").forEach(a => a.addEventListener("click", () => setMenu(false)));
    document.addEventListener("click", e => {
        if (document.body.classList.contains("menu-open") && !e.target.closest(".navbar")) setMenu(false);
    });

    // Đánh dấu mục menu tương ứng với phần đang xem
    const links = $$("#navLinks > a");
    const sections = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
    if ("IntersectionObserver" in window) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        sections.forEach(s => spy.observe(s));
    }
}

function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) {
        items.forEach(el => el.classList.add("in"));
        return;
    }
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in");
                io.unobserve(entry.target);
            }
        });
    }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(el => io.observe(el));
}

/* ================== Khởi tạo ================== */

function bindEvents() {
    $("#searchForm").addEventListener("submit", () => {
        if ($("#endDate").value <= $("#startDate").value) {
            showToast(t("datesInvalidToast"), "error");
            return;
        }
        renderCars();
        $("#cars").scrollIntoView({ behavior: "smooth" });
    });
    $("#startDate").addEventListener("change", syncDateInputs);
    $("#endDate").addEventListener("change", syncDateInputs);
    $("#locationFilter").onchange = renderCars;
    $("#sortCars").onchange = renderCars;

    $$(".filter-chip").forEach(button => {
        button.onclick = () => {
            $$(".filter-chip").forEach(item => {
                item.classList.toggle("active", item === button);
                item.setAttribute("aria-selected", String(item === button));
            });
            activeFilter = button.dataset.filter;
            renderCars();
        };
    });

    $("#resetFilters").onclick = () => {
        activeFilter = "all";
        $("#locationFilter").value = "";
        $$(".filter-chip").forEach(c => {
            c.classList.toggle("active", c.dataset.filter === "all");
            c.setAttribute("aria-selected", String(c.dataset.filter === "all"));
        });
        renderCars();
    };

    $("#carGrid").addEventListener("click", e => {
        const btn = e.target.closest("[data-book]");
        if (btn) openBooking(Number(btn.dataset.book));
    });

    $$("[data-close]").forEach(button => {
        button.onclick = () => closeModal(button.dataset.close);
    });
    $$(".modal").forEach(modal => {
        modal.addEventListener("mousedown", e => {
            if (e.target === modal) closeModal(modal.id);
        });
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            closeAllModals();
            setMenu(false);
        }
    });

    $("#lookupBtn").onclick = () => openLookup();
    $$("[data-open-lookup]").forEach(b => b.onclick = () => { setMenu(false); openLookup(); });
    $("#footerLookupBtn").onclick = e => { e.preventDefault(); openLookup(); };
    $("#lookupForm").addEventListener("submit", submitLookup);
    $("#lookupEmail").addEventListener("input", e => clearError(e.target));
    restrictInput($("#lookupPhone"), cleanPhone, "errPhoneChars");

    $("#langToggle").onclick = () => setLang(lang === "en" ? "vi" : "en");
    $("#themeToggle").onclick = () => {
        const next = currentTheme() === "dark" ? "light" : "dark";
        setTheme(next);
        showToast(next === "dark" ? t("themeDark") : t("themeLight"));
    };
    // Theo chế độ của hệ điều hành nếu người dùng chưa tự chọn
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", e => {
        if (!store(THEME_KEY)) setTheme(e.matches ? "dark" : "light", false);
    });
}

applyStaticTranslations();
syncDateInputs();
bindEvents();
initNavigation();
initReveal();
loadCars();
