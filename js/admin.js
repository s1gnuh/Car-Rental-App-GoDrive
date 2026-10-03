/* ================== GoDrive Admin ================== */

const TOKEN_KEY = "godrive_admin_token";
const CURRENT_ADMIN_KEY = "godrive_admin_info";
const LANG_KEY = "godrive_lang";
const THEME_KEY = "godrive_theme";
const AUTO_REFRESH_MS = 60000;

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function store(key, value) {
    try {
        if (value === undefined) return localStorage.getItem(key);
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
    } catch (_) { return null; }
}

// Escape dữ liệu trước khi chèn vào innerHTML để chống XSS
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
// Chỉ cho phép ảnh http(s)
const safeUrl = (v) => { const u = String(v ?? "").trim(); return /^https?:\/\//i.test(u) ? u : ""; };
// Ô CSV: bọc nháy kép, và chặn công thức Excel (=, +, -, @) bằng dấu nháy đơn đứng đầu
const csvCell = (v) => {
    let t = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(t)) t = "'" + t;
    return '"' + t.replace(/"/g, '""') + '"';
};
const toCsv = (rows) => rows.map(r => r.map(csvCell).join(",")).join("\n");
const icon = (name, cls = "") => `<svg class="i ${cls}"><use href="#i-${name}"/></svg>`;

/* ================== Đa ngôn ngữ ================== */

const EN_STATIC = {
    "login.artTitle": "Run your fleet professionally, anytime, anywhere",
    "login.p1": "Track revenue and bookings in real time",
    "login.p2": "Manage cars, maintenance schedules and customers",
    "login.p3": "Light/dark themes, Vietnamese and English",
    "nav.site": "Back to customer site",
    "lang.switch": "Chuyển sang tiếng Việt",
    "theme.toggle": "Toggle light/dark mode",
    "login.title": "Welcome back",
    "login.subtitle": "Sign in to access the GoDrive dashboard",
    "login.username": "Username or email",
    "login.password": "Password",
    "login.showPwd": "Show password",
    "login.submit": "Sign in",
    "login.foot": "Restricted to administrators",
    "nav.closeMenu": "Close menu",
    "nav.openMenu": "Open menu",
    "nav.main": "Management",
    "nav.dashboard": "Dashboard",
    "nav.bookings": "Bookings",
    "nav.fleet": "Fleet",
    "nav.customers": "Customers",
    "nav.payments": "Payments",
    "nav.maintenance": "Maintenance",
    "nav.system": "System",
    "nav.admins": "Admin accounts",
    "nav.password": "Change password",
    "nav.logout": "Sign out",
    "action.refresh": "Refresh",
    "action.close": "Close",
    "action.cancel": "Cancel",
    "action.save": "Save",
    "car.noImage": "No image",
    "car.imageUrl": "Image URL",
    "car.imageHint": "Paste an image URL starting with https:// (JPG, PNG, WEBP)",
    "car.clearImage": "Remove image",
    "car.color": "Car color (illustration when there is no photo)",
    "approve.method": "Payment method *",
    "approve.status": "Collection status",
    "approve.note": "Note / reference code (optional)",
    "approve.hint": "The transaction is recorded under Payments as soon as you approve. You can mark it as collected later.",
    "approve.submit": "Approve & record payment",
    "pay.status": "Transaction status",
    "pay.amount": "Amount (₫)",
    "pay.paidAt": "Collected at",
    "car.name": "Car name *",
    "car.brand": "Brand",
    "car.type": "Type",
    "car.seats": "Seats",
    "car.price": "Daily rate (₫) *",
    "car.location": "Location",
    "car.featured": "Mark as featured on the customer site",
    "maint.new": "Schedule maintenance",
    "maint.car": "Car *",
    "maint.type": "Service *",
    "maint.start": "Start date",
    "maint.end": "End date",
    "maint.cost": "Estimated cost (₫)",
    "maint.note": "Notes",
    "maint.save": "Schedule",
    "pwd.old": "Current password",
    "pwd.new": "New password (at least 6 characters)",
    "pwd.confirm": "Confirm new password",
    "pwd.save": "Update password",
    "admins.create": "Create new account",
    "admins.name": "Display name *",
    "admins.username": "Username *",
    "admins.password": "Password * (≥ 6 characters)",
    "admins.submit": "Create account",
    "nav.help": "User guide",
    "nav.hardRefresh": "Load latest version",
    "help.title": "User guide"
};

// Chuỗi dùng trong JS: [tiếng Việt, tiếng Anh]
const STR = {
    title: ["GoDrive Admin", "GoDrive Admin"],
    "page.dashboard": ["Tổng quan", "Dashboard"],
    "page.dashboard.sub": ["Theo dõi hoạt động kinh doanh của bạn", "Track your business at a glance"],
    "page.bookings": ["Đơn đặt xe", "Bookings"],
    "page.bookings.sub": ["Duyệt, bàn giao và theo dõi các đơn đặt xe", "Approve, hand over and track bookings"],
    "page.fleet": ["Đội xe", "Fleet"],
    "page.fleet.sub": ["Quản lý thông tin và trạng thái xe", "Manage car details and status"],
    "page.customers": ["Khách hàng", "Customers"],
    "page.customers.sub": ["Danh sách khách hàng và lịch sử chi tiêu", "Customer list and spending history"],
    "page.payments": ["Thanh toán", "Payments"],
    "page.payments.sub": ["Theo dõi các giao dịch thanh toán", "Track payment transactions"],
    "page.maintenance": ["Bảo trì", "Maintenance"],
    "page.maintenance.sub": ["Lên lịch và theo dõi bảo trì xe", "Schedule and track car maintenance"],
    updated: ["Cập nhật {time}", "Updated {time}"],
    justNow: ["vừa xong", "just now"],
    refreshed: ["Đã làm mới dữ liệu", "Data refreshed"],
    loginOk: ["Đăng nhập thành công", "Signed in successfully"],
    loginFail: ["Đăng nhập thất bại", "Sign in failed"],
    loginMissing: ["Vui lòng nhập tên đăng nhập và mật khẩu", "Please enter your username and password"],
    loggingIn: ["Đang kiểm tra...", "Signing in..."],
    sessionExpired: ["Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.", "Session expired. Please sign in again."],
    loggedOut: ["Đã đăng xuất", "Signed out"],
    network: ["Không kết nối được máy chủ", "Couldn't reach the server"],
    httpError: ["Lỗi yêu cầu (HTTP {code})", "Request failed (HTTP {code})"],
    hidePwd: ["Ẩn mật khẩu", "Hide password"],
    showPwd: ["Hiện mật khẩu", "Show password"],
    themeDark: ["Đã bật chế độ tối", "Dark mode on"],
    themeLight: ["Đã bật chế độ sáng", "Light mode on"],

    revenue: ["Doanh thu đã xác nhận", "Confirmed revenue"],
    pendingBookings: ["Đơn chờ duyệt", "Pending bookings"],
    activeRentals: ["Xe đang cho thuê", "Cars on rent"],
    customersStat: ["Khách hàng", "Customers"],
    vsPrev: ["so với 30 ngày trước", "vs previous 30 days"],
    needAction: ["Cần xử lý ngay", "Needs attention"],
    allClear: ["Không có đơn tồn", "All caught up"],
    ofCars: ["trên tổng {n} xe", "of {n} cars"],
    newCustomers: ["+{n} khách mới trong 30 ngày", "+{n} new in 30 days"],
    revenueChart: ["Doanh thu", "Revenue"],
    revenueChartSub: ["Doanh thu đơn đã xác nhận theo ngày đặt", "Confirmed booking revenue by booking date"],
    days7: ["7 ngày", "7 days"],
    days30: ["30 ngày", "30 days"],
    rangeTotal: ["Tổng: {v}", "Total: {v}"],
    bookingStatus: ["Trạng thái đơn", "Booking status"],
    bookingStatusSub: ["Phân bổ toàn bộ đơn", "Distribution of all bookings"],
    totalBookings: ["Tổng đơn", "Bookings"],
    recentBookings: ["Đơn gần đây", "Recent bookings"],
    recentBookingsSub: ["5 đơn mới nhất", "The 5 latest bookings"],
    viewAll: ["Xem tất cả", "View all"],
    fleetStatus: ["Tình trạng đội xe", "Fleet status"],
    fleetStatusSub: ["Cập nhật trực tiếp", "Live overview"],
    manage: ["Quản lý", "Manage"],
    attention: ["Việc cần làm", "To-do"],
    attentionSub: ["Đơn chờ duyệt và xe đang bảo trì", "Pending bookings and cars in maintenance"],
    nothingToDo: ["Tuyệt vời! Không có việc nào tồn đọng.", "Great! Nothing pending."],
    waitingApproval: ["Chờ duyệt · {date}", "Awaiting approval · {date}"],
    inMaintenance: ["Đang bảo trì · đến {date}", "In maintenance · until {date}"],

    code: ["Mã đơn", "Booking"],
    customer: ["Khách hàng", "Customer"],
    car: ["Xe", "Car"],
    dates: ["Thời gian", "Dates"],
    total: ["Tổng tiền", "Total"],
    status: ["Trạng thái", "Status"],
    actions: ["Thao tác", "Actions"],
    nDays: ["{n} ngày", "{n} day(s)"],
    all: ["Tất cả", "All"],
    searchBookings: ["Tìm mã đơn, khách hàng, xe...", "Search code, customer, car..."],
    exportCsv: ["Xuất CSV", "Export CSV"],
    exported: ["Đã xuất file CSV", "CSV exported"],
    approve: ["Duyệt", "Approve"],
    handover: ["Bàn giao", "Hand over"],
    cancel: ["Hủy", "Cancel"],
    view: ["Chi tiết", "Details"],
    noBookings: ["Không có đơn phù hợp", "No matching bookings"],
    noBookingsHint: ["Thử đổi bộ lọc hoặc từ khóa tìm kiếm.", "Try a different filter or search term."],
    approved: ["Đã duyệt đơn #{id}", "Booking #{id} approved"],
    approveTitle: ["Duyệt đơn #{id}", "Approve booking #{id}"],
    approvedPay: ["Đã duyệt đơn #{id} · ghi nhận thanh toán {method}", "Booking #{id} approved · {method} payment recorded"],
    payMethodRequired: ["Vui lòng chọn hình thức thanh toán", "Please choose a payment method"],
    payNotCollected: ["Chưa thu tiền", "Not collected yet"],
    payCollected: ["Đã thu tiền", "Already collected"],
    markPaid: ["Xác nhận đã thu", "Mark as paid"],
    markPaidToast: ["Đã xác nhận thu tiền giao dịch {code}", "Transaction {code} marked as paid"],
    payByMethod: ["Theo hình thức thanh toán", "By payment method"],
    paySince: ["Số liệu tính từ lúc admin duyệt đơn. Hình thức thanh toán do admin chọn khi duyệt.", "Figures start when a booking is approved. The payment method is chosen by the admin at approval."],
    paymentCol: ["Thanh toán", "Payment"],
    editPayment: ["Sửa giao dịch {code}", "Edit transaction {code}"],
    editPaymentBtn: ["Sửa thanh toán", "Edit payment"],
    paymentSaved: ["Đã cập nhật giao dịch {code}", "Transaction {code} updated"],
    methodNone: ["Chưa chọn hình thức", "Method not set"],
    needMethodNote: ["{n} giao dịch của đơn đã duyệt trước đây chưa có hình thức thanh toán. Bấm Sửa để bổ sung.", "{n} transaction(s) from earlier approved bookings have no payment method. Click Edit to set it."],
    bookingTotalHint: ["Tổng tiền đơn: {total}", "Booking total: {total}"],
    amountDiffHint: ["Số tiền đang khác tổng tiền đơn ({total}).", "Amount differs from the booking total ({total})."],
    syncAmount: ["Lấy theo tổng tiền đơn", "Use booking total"],
    syncedNote: ["Tên khách, tên xe và số tiền tự đồng bộ theo đơn đặt xe.", "Customer, car and amount stay in sync with the booking."],
    amountInvalid: ["Số tiền không hợp lệ", "Invalid amount"],
    notRecorded: ["Chưa ghi nhận", "Not recorded"],
    note: ["Ghi chú", "Note"],
    approvedBy: ["Duyệt bởi {name}", "Approved by {name}"],
    colorAuto: ["Tự động", "Auto"],
    color_purple: ["Tím", "Purple"],
    color_blue: ["Xanh dương", "Blue"],
    color_red: ["Đỏ", "Red"],
    color_white: ["Trắng", "White"],
    color_black: ["Đen", "Black"],
    color_silver: ["Bạc", "Silver"],
    color_teal: ["Xanh ngọc", "Teal"],
    color_orange: ["Cam", "Orange"],
    cancelledToast: ["Đã hủy đơn #{id}", "Booking #{id} cancelled"],
    handedOver: ["Đã bàn giao xe cho đơn #{id}", "Car handed over for booking #{id}"],
    confirmCancelTitle: ["Hủy đơn #{id}?", "Cancel booking #{id}?"],
    confirmCancelText: ["Khách hàng {name} sẽ không còn giữ xe {car}. Thao tác này không thể hoàn tác.", "{name} will lose the reservation for {car}. This cannot be undone."],
    confirmCancelOk: ["Hủy đơn", "Cancel booking"],
    keep: ["Giữ lại", "Keep"],
    bookingDetail: ["Đơn #{id}", "Booking #{id}"],
    phone: ["Số điện thoại", "Phone"],
    pickup: ["Nhận xe", "Pick-up"],
    return: ["Trả xe", "Return"],
    location: ["Địa điểm", "Location"],
    createdAt: ["Ngày đặt", "Booked on"],
    call: ["Gọi khách", "Call"],

    searchCars: ["Tìm theo tên, hãng xe...", "Search name, brand..."],
    allStatuses: ["Tất cả trạng thái", "All statuses"],
    addCar: ["Thêm xe", "Add car"],
    editCar: ["Chỉnh sửa xe", "Edit car"],
    newCar: ["Thêm xe mới", "Add a new car"],
    seats: ["{n} chỗ", "{n} seats"],
    perDay: ["/ngày", "/day"],
    edit: ["Sửa", "Edit"],
    delete: ["Xóa", "Delete"],
    noCars: ["Không tìm thấy xe", "No cars found"],
    noCarsHint: ["Thêm xe mới hoặc đổi bộ lọc.", "Add a car or change the filter."],
    carSaved: ["Đã cập nhật xe", "Car updated"],
    carAdded: ["Đã thêm xe mới", "Car added"],
    carDeleted: ["Đã xóa xe", "Car deleted"],
    carStatusChanged: ["{car}: {status}", "{car}: {status}"],
    confirmDeleteCar: ["Xóa xe {car}?", "Delete {car}?"],
    confirmDeleteCarText: ["Xe sẽ bị gỡ khỏi trang khách. Các đơn cũ vẫn được giữ lại.", "The car will be removed from the customer site. Past bookings are kept."],
    carNameRequired: ["Vui lòng nhập tên xe", "Please enter the car name"],
    carPriceRequired: ["Giá thuê phải lớn hơn 0", "Daily rate must be greater than 0"],
    imageInvalid: ["Link ảnh phải bắt đầu bằng http:// hoặc https://", "Image URL must start with http:// or https://"],
    featured: ["Nổi bật", "Featured"],

    searchCustomers: ["Tìm tên, email, số điện thoại...", "Search name, email, phone..."],
    joined: ["Tham gia", "Joined"],
    bookingsCount: ["Số đơn", "Bookings"],
    spent: ["Tổng chi tiêu", "Total spent"],
    tier: ["Hạng", "Tier"],
    noCustomers: ["Không có khách hàng phù hợp", "No matching customers"],
    customersCount: ["{n} khách hàng", "{n} customers"],

    searchPayments: ["Tìm mã giao dịch, khách hàng...", "Search transaction, customer..."],
    paidTotal: ["Đã thu", "Collected"],
    pendingPay: ["Chờ thanh toán", "Awaiting payment"],
    refundedPay: ["Đã hoàn tiền", "Refunded"],
    transactions: ["{n} giao dịch", "{n} transactions"],
    txn: ["Mã giao dịch", "Transaction"],
    method: ["Phương thức", "Method"],
    amount: ["Số tiền", "Amount"],
    time: ["Thời gian", "Time"],
    orderRef: ["Đơn #{id}", "Booking #{id}"],
    noPayments: ["Không có giao dịch phù hợp", "No matching transactions"],

    scheduleMaint: ["Lên lịch bảo trì", "Schedule maintenance"],
    start: ["Bắt đầu", "Start"],
    complete: ["Hoàn thành", "Complete"],
    noMaint: ["Chưa có lịch bảo trì", "No maintenance scheduled"],
    noMaintHint: ["Bấm \"Lên lịch bảo trì\" để thêm mới.", "Click \"Schedule maintenance\" to add one."],
    maintAdded: ["Đã lên lịch bảo trì", "Maintenance scheduled"],
    maintUpdated: ["Đã cập nhật: {status}", "Updated: {status}"],
    maintDeleted: ["Đã xóa lịch bảo trì", "Maintenance deleted"],
    confirmDeleteMaint: ["Xóa lịch bảo trì này?", "Delete this maintenance record?"],
    confirmDeleteMaintText: ["{type} cho xe {car}", "{type} for {car}"],
    maintTypeRequired: ["Vui lòng nhập hạng mục bảo trì", "Please enter the service"],
    maintDatesInvalid: ["Ngày kết thúc phải sau hoặc bằng ngày bắt đầu", "End date must be on or after the start date"],
    totalCost: ["Tổng chi phí", "Total cost"],
    maintTypePh: ["Bảo dưỡng định kỳ 10.000km", "10,000 km scheduled service"],

    you: ["Bạn", "You"],
    adminCreated: ["Đã tạo tài khoản admin", "Admin account created"],
    adminDeleted: ["Đã xóa admin", "Admin deleted"],
    confirmDeleteAdmin: ["Xóa tài khoản {name}?", "Delete {name}?"],
    confirmDeleteAdminText: ["Người này sẽ không thể đăng nhập nữa.", "This person will no longer be able to sign in."],
    adminMissing: ["Vui lòng nhập tên, username và mật khẩu (≥ 6 ký tự)", "Please enter name, username and password (≥ 6 characters)"],
    pwdShort: ["Mật khẩu mới ít nhất 6 ký tự", "New password must be at least 6 characters"],
    pwdMismatch: ["Xác nhận mật khẩu không khớp", "Passwords don't match"],
    pwdChanged: ["Đổi mật khẩu thành công", "Password changed"],

    pending: ["Chờ duyệt", "Pending"],
    confirmed: ["Đã xác nhận", "Confirmed"],
    cancelled: ["Đã hủy", "Cancelled"],
    available: ["Sẵn sàng", "Available"],
    rented: ["Đang thuê", "On rent"],
    maintenance: ["Bảo trì", "Maintenance"],
    paid: ["Đã thanh toán", "Paid"],
    refunded: ["Đã hoàn tiền", "Refunded"],
    scheduled: ["Đã lên lịch", "Scheduled"],
    in_progress: ["Đang thực hiện", "In progress"],
    completed: ["Hoàn thành", "Completed"],
    bronze: ["Đồng", "Bronze"],
    diamond: ["Kim cương", "Diamond"],
    rankCol: ["Thứ hạng", "Rank"],
    tierOver: ["Trên", "Over"],
    tierFrom: ["Từ", "From"],
    tierUnder: ["Dưới {v}", "Under {v}"],
    tierCustomers: ["khách", "customers"],
    clearTier: ["Bỏ lọc hạng", "Clear tier filter"],
    tierRule: ["Hạng tự động theo tổng tiền thuê của các đơn đã xác nhận. Cao nhất là Kim cương (trên 1 tỷ). Bấm vào một hạng để lọc.", "Tiers are assigned automatically from the total of confirmed bookings. The top tier is Diamond (over 1 billion ₫). Click a tier to filter."],
    silver: ["Bạc", "Silver"],
    gold: ["Vàng", "Gold"],
    platinum: ["Bạch kim", "Platinum"],

    refreshing: ["Đang tải bản mới nhất...", "Loading the latest version..."],
    versionUsing: ["Bạn đang dùng", "You are using"],
    versionServer: ["Trên server", "On the server"],
    versionChecking: ["Đang kiểm tra...", "Checking..."],
    versionSame: ["Bạn đang dùng bản mới nhất.", "You're on the latest version."],
    versionNew: ["Server đã có bản mới. Bấm \"Tải lại bản mới nhất\" để cập nhật.", "A newer version is on the server. Click \"Load latest version\" to update."],
    versionMissing: ["Không đọc được version.json trên server. Hãy chắc chắn đã upload đủ gói deploy.", "Couldn't read version.json on the server. Make sure the full deploy package was uploaded."],
    loadLatest: ["Tải lại bản mới nhất", "Load latest version"]
};

const SERVER_ERRORS_EN = {
    "Chưa đăng nhập": "Not signed in",
    "Token không hợp lệ": "Invalid session",
    "Thiếu thông tin": "Missing information",
    "Tài khoản không tồn tại": "Account not found",
    "Sai mật khẩu": "Wrong password",
    "Mật khẩu mới ít nhất 6 ký tự": "New password must be at least 6 characters",
    "Mật khẩu cũ sai": "Current password is incorrect",
    "Mật khẩu ít nhất 6 ký tự": "Password must be at least 6 characters",
    "Username đã tồn tại": "Username already exists",
    "Email đã tồn tại": "Email already exists",
    "Email không hợp lệ": "Invalid email address",
    "Username chỉ gồm chữ, số, . _ - (3-50 ký tự)": "Username may contain letters, digits, . _ - (3-50 characters)",
    "Phải giữ lại ít nhất 1 admin": "At least one admin must remain",
    "Hình thức thanh toán không hợp lệ": "Please choose a valid payment method",
    "Trạng thái thanh toán không hợp lệ": "Invalid payment status",
    "Không tìm thấy giao dịch": "Transaction not found",
    "Màu xe không hợp lệ": "Invalid car color",
    "Số tiền không hợp lệ": "Invalid amount",
    "Thời điểm thanh toán không hợp lệ": "Invalid payment time",
    "Cần chọn hình thức thanh toán trước": "Please choose a payment method first",
    "Không thể xóa chính mình": "You can't delete yourself",
    "Không tìm thấy": "Not found",
    "Không tìm thấy xe": "Car not found",
    "Không tìm thấy đơn": "Booking not found",
    "Thiếu trạng thái": "Missing status",
    "Trạng thái không hợp lệ": "Invalid status",
    "Chỉ đơn đã xác nhận mới bàn giao xe được": "Only confirmed bookings can be handed over",
    "Tên xe không được để trống": "Car name is required",
    "Loại xe không hợp lệ": "Invalid car type",
    "Số chỗ không hợp lệ": "Invalid number of seats",
    "Giá thuê không hợp lệ": "Invalid daily rate",
    "Địa điểm không được để trống": "Location is required",
    "Link ảnh phải bắt đầu bằng http:// hoặc https://": "Image URL must start with http:// or https://",
    "Ngày bảo trì không hợp lệ": "Invalid maintenance dates",
    "Chi phí không hợp lệ": "Invalid cost",
    "Không ghi được dữ liệu": "Couldn't save data",
    "Không hỗ trợ yêu cầu này": "Unsupported request"
};

const CITY_EN = { "Hà Nội": "Hanoi", "TP. Hồ Chí Minh": "Ho Chi Minh City", "Đà Nẵng": "Da Nang" };
const METHOD_EN = { "Chuyển khoản": "Bank transfer", "Thẻ tín dụng": "Credit card", "Ví MoMo": "MoMo e-wallet", "Tiền mặt": "Cash", "COD": "Cash on delivery", "ZaloPay": "ZaloPay", "VNPay": "VNPay QR" };
// Hình thức thanh toán admin chọn khi duyệt đơn (khớp với PAYMENT_METHODS ở api/_helpers.php)
const PAY_METHODS = [
    ["Tiền mặt", "cash"],
    ["Chuyển khoản", "bank"],
    ["Thẻ tín dụng", "card"],
    ["Ví MoMo", "smartphone"],
    ["ZaloPay", "smartphone"],
    ["VNPay", "qr"]
];
const methodIcon = (m) => (PAY_METHODS.find(x => x[0] === m) || [m, "wallet"])[1];

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
const methodLabel = (m) => (lang === "en" && METHOD_EN[m]) || m;
const statusLabel = (s) => (STR[s] ? t(s) : s);
const locale = () => (lang === "en" ? "en-US" : "vi-VN");
const money = (v) => new Intl.NumberFormat(locale()).format(Number(v) || 0) + " ₫";
const shortMoney = (v) => {
    const n = Number(v) || 0;
    if (Math.abs(n) >= 1e9) return (n / 1e9).toLocaleString(locale(), { maximumFractionDigits: 1 }) + (lang === "en" ? "B" : " tỷ");
    if (Math.abs(n) >= 1e6) return (n / 1e6).toLocaleString(locale(), { maximumFractionDigits: 1 }) + (lang === "en" ? "M" : " tr");
    if (Math.abs(n) >= 1e3) return (n / 1e3).toLocaleString(locale(), { maximumFractionDigits: 0 }) + "K";
    return String(n);
};

function parseDate(v) {
    if (!v) return null;
    const s = String(v);
    const d = new Date(s.length === 10 ? s + "T00:00:00" : s.replace(" ", "T"));
    return isNaN(d) ? null : d;
}

function fmtDate(v) {
    const d = parseDate(v);
    return d ? d.toLocaleDateString(locale(), { day: "2-digit", month: "2-digit", year: "numeric" }) : (v || "—");
}

function fmtDateTime(v) {
    const d = parseDate(v);
    return d ? d.toLocaleString(locale(), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : (v || "—");
}

const dayKey = (d) => {
    const tz = d.getTimezoneOffset() * 60000;
    return new Date(d - tz).toISOString().slice(0, 10);
};

function nightCount(start, end) {
    const a = parseDate(start), b = parseDate(end);
    return a && b ? Math.max(1, Math.round((b - a) / 86400000)) : 1;
}

function applyStaticTranslations() {
    $$("[data-i18n], [data-i18n-aria]").forEach(el => {
        if (!viOriginal.has(el)) {
            viOriginal.set(el, {
                text: el.dataset.i18n ? el.textContent : null,
                aria: el.dataset.i18nAria ? el.getAttribute("aria-label") : null
            });
        }
        const orig = viOriginal.get(el);
        if (el.dataset.i18n) el.textContent = lang === "en" ? (EN_STATIC[el.dataset.i18n] ?? orig.text) : orig.text;
        if (el.dataset.i18nAria) el.setAttribute("aria-label", lang === "en" ? (EN_STATIC[el.dataset.i18nAria] ?? orig.aria) : orig.aria);
    });
    $$("#carLocation option").forEach(o => { o.textContent = city(o.value); });
    $("#m_type").placeholder = t("maintTypePh");
    $$(".lang-label").forEach(l => { l.textContent = lang === "en" ? "VI" : "EN"; });
    document.documentElement.lang = lang;
}

function setLang(next) {
    lang = next;
    store(LANG_KEY, lang);
    applyStaticTranslations();
    if (!$("#adminAppWrapper").classList.contains("hidden")) {
        setPageTitle(currentPage);
        renderEverything();
        updateSyncLabel();
    }
    if (!$("#helpModal").classList.contains("hidden")) renderHelp();
}

/* ================== Chế độ sáng / tối ================== */

function setTheme(theme, persist = true) {
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.setAttribute("data-theme", theme);
    $('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0e0d18" : "#5b3fd9");
    if (persist) store(THEME_KEY, theme);
    setTimeout(() => root.classList.remove("theme-anim"), 400);
    // Biểu đồ cần vẽ lại để lấy màu theo giao diện mới
    if (!$("#adminAppWrapper").classList.contains("hidden")) renderDashboard();
}

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/* ================== State ================== */

let cars = [];
let bookings = [];
let customers = [];
let payments = [];
let maintenance = [];
let admins = [];
let currentAdmin = null;
let currentPage = "dashboard";
let revenueChart;
let statusChart;
let lastSync = null;
let dataLoaded = false;

const ui = {
    revenueRange: 30,
    bookingTab: "all",
    bookingSearch: "",
    fleetSearch: "",
    fleetStatus: "all",
    customerSearch: "",
    customerTier: "all",
    paymentTab: "all",
    paymentSearch: "",
    maintTab: "all",
    helpTab: "start"
};

/* ================== Tiện ích UI ================== */

let toastTimer;
function showToast(message, type = "info") {
    const el = $("#toast");
    el.className = type;
    el.innerHTML = `${icon(type === "success" ? "check" : "alert")}<span>${esc(message)}</span>`;
    requestAnimationFrame(() => el.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3500);
}

let lastFocused = null;
function openModal(id) {
    const modal = $("#" + id);
    lastFocused = document.activeElement;
    modal.classList.remove("hidden", "closing");
    document.body.classList.add("no-scroll");
    setTimeout(() => $("input:not([type=hidden]), select, textarea", modal)?.focus({ preventScroll: true }), 60);
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
    }, 170);
}

// Hộp thoại xác nhận thay cho window.confirm
function confirmDialog({ title, text = "", okText, danger = true }) {
    return new Promise(resolve => {
        $("#confirmTitle").textContent = title;
        $("#confirmText").textContent = text;
        $("#confirmOk").textContent = okText || t("delete");
        $("#confirmOk").className = danger ? "btn btn-danger" : "btn btn-primary";
        $("#confirmIcon").className = "confirm-icon" + (danger ? "" : " ok");
        $("#confirmCancel").textContent = t("keep");
        const done = (val) => {
            $("#confirmOk").onclick = $("#confirmCancel").onclick = null;
            closeModal("confirmModal");
            resolve(val);
        };
        $("#confirmOk").onclick = () => done(true);
        $("#confirmCancel").onclick = () => done(false);
        openModal("confirmModal");
        setTimeout(() => $("#confirmCancel").focus(), 80);
    });
}

function setLoading(btn, on) {
    if (!btn) return;
    btn.classList.toggle("loading", on);
    btn.disabled = on;
}

function initials(name) {
    if (!name) return "AD";
    return name.split(" ").filter(Boolean).slice(-2).map(s => s[0]).join("").toUpperCase().slice(0, 2);
}

function emptyState(iconName, title, hint = "") {
    return `<div class="empty"><div class="stat-icon">${icon(iconName)}</div><strong>${esc(title)}</strong>${hint ? `<span>${esc(hint)}</span>` : ""}</div>`;
}

function statusBadge(s) {
    return `<span class="status ${esc(s)}">${esc(statusLabel(s))}</span>`;
}

// Giao dịch của một đơn: ưu tiên giao dịch còn hiệu lực (chờ thu / đã thu) hơn giao dịch đã hoàn tiền
function paymentOf(b) {
    const list = payments.filter(p => String(p.bookingId) === String(b.id));
    return list.find(p => p.status !== "refunded") || list[0] || null;
}

// Nhãn trạng thái giao dịch ("pending" ở đây là chờ thanh toán, không phải chờ duyệt)
function payBadge(s) {
    return `<span class="status ${esc(s)}">${esc(s === "pending" ? t("pendingPay") : statusLabel(s))}</span>`;
}

function tabsHtml(name, current, items) {
    return `<div class="tabs" role="tablist" data-tabs="${name}">${items.map(([value, label, count]) =>
        `<button class="tab ${value === current ? "active" : ""}" role="tab" aria-selected="${value === current}" data-value="${esc(value)}">${esc(label)}${count != null ? `<span class="count">${count}</span>` : ""}</button>`
    ).join("")}</div>`;
}

function downloadCsv(filename, rows) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8" }));
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    showToast(t("exported"), "success");
}

function trendHtml(current, previous) {
    if (!previous && !current) return `<span class="trend flat">0%</span>`;
    if (!previous) return `<span class="trend up">${icon("trend-up")} ${lang === "en" ? "new" : "mới"}</span>`;
    const pct = Math.round(((current - previous) / previous) * 100);
    const cls = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
    return `<span class="trend ${cls}">${pct !== 0 ? icon(pct > 0 ? "trend-up" : "trend-down") : ""} ${pct > 0 ? "+" : ""}${pct}%</span>`;
}

/* ================== API ================== */

function getToken() { return store(TOKEN_KEY) || ""; }

async function api(path, opts = {}) {
    const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    let res;
    try {
        res = await fetch(path, { ...opts, headers });
    } catch (_) {
        throw new Error(t("network"));
    }
    let body = {};
    try { body = await res.json(); } catch (_) { }
    if (!res.ok) {
        if (res.status === 401 && token) {
            logout(true);
            throw new Error(t("sessionExpired"));
        }
        throw new Error(serverMsg(body.error) || t("httpError", { code: res.status }));
    }
    return body;
}

/* ================== Đăng nhập ================== */

function showLogin() {
    $("#adminLoginWrapper").classList.remove("hidden");
    $("#adminAppWrapper").classList.add("hidden");
    setTimeout(() => $("#loginUsername")?.focus(), 50);
}

function showApp() {
    $("#adminLoginWrapper").classList.add("hidden");
    $("#adminAppWrapper").classList.remove("hidden");
}

function logout(silent = false) {
    store(TOKEN_KEY, null);
    store(CURRENT_ADMIN_KEY, null);
    currentAdmin = null;
    dataLoaded = false;
    showLogin();
    if (!silent) showToast(t("loggedOut"));
}

function updateAdminProfile() {
    if (!currentAdmin) return;
    const name = currentAdmin.name || currentAdmin.username || "Admin";
    $("#adminName").textContent = name;
    $("#adminRole").textContent = currentAdmin.email || "@" + currentAdmin.username;
    $("#adminAvatar").textContent = initials(name);
    $("#topAvatar").textContent = initials(name);
    $("#topAvatar").title = name;
}

/* ================== Tải dữ liệu ================== */

async function loadAllData(showSpinner = false) {
    const btn = $("#refreshBtn");
    if (showSpinner) btn.classList.add("spinning");
    try {
        const [c, b, cu, p, m, a] = await Promise.all([
            api("/api/products.php"),
            api("/api/orders.php"),
            api("/api/users.php"),
            api("/api/users.php?action=payments"),
            api("/api/users.php?action=maintenance"),
            api("/api/login.php?action=admins")
        ]);
        cars = c; bookings = b; customers = cu; payments = p; maintenance = m; admins = a;
        lastSync = new Date();
        dataLoaded = true;
        return true;
    } catch (err) {
        showToast(err.message, "error");
        return false;
    } finally {
        btn.classList.remove("spinning");
    }
}

function updateSyncLabel() {
    if (!lastSync) return;
    const secs = Math.round((Date.now() - lastSync) / 1000);
    const time = secs < 30 ? t("justNow") : lastSync.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" });
    $("#lastUpdated").textContent = t("updated", { time });
}

function renderEverything() {
    const pending = bookings.filter(b => b.status === "pending").length;
    const badge = $("#pendingBadge");
    badge.textContent = pending;
    badge.classList.toggle("hidden", pending === 0);
    renderDashboard();
    renderBookings();
    renderFleet();
    renderCustomers();
    renderPayments();
    renderMaintenance();
    if (!$("#adminsModal").classList.contains("hidden")) renderAdminsList();
}

/* ================== Dashboard ================== */

function inRange(dateValue, fromDays, toDays) {
    const d = parseDate(dateValue);
    if (!d) return false;
    const now = Date.now();
    return d.getTime() <= now - toDays * 86400000 && d.getTime() > now - fromDays * 86400000;
}

function renderDashboard() {
    const host = $("#dashboardPage");
    if (!dataLoaded) {
        host.innerHTML = `<div class="stat-grid">${Array.from({ length: 4 }, () => `<div class="stat-card"><span class="sk" style="height:14px;width:50%"></span><span class="sk" style="height:28px;width:70%;margin-top:18px"></span><span class="sk" style="height:12px;width:40%;margin-top:12px"></span></div>`).join("")}</div>`;
        return;
    }

    const confirmed = bookings.filter(b => b.status === "confirmed");
    const revenue = confirmed.reduce((s, b) => s + (Number(b.total) || 0), 0);
    const revCur = confirmed.filter(b => inRange(b.createdAt, 30, 0)).reduce((s, b) => s + (Number(b.total) || 0), 0);
    const revPrev = confirmed.filter(b => inRange(b.createdAt, 60, 30)).reduce((s, b) => s + (Number(b.total) || 0), 0);
    const pending = bookings.filter(b => b.status === "pending");
    const rented = cars.filter(c => c.status === "rented").length;
    const available = cars.filter(c => c.status === "available").length;
    const inMaint = cars.filter(c => c.status === "maintenance").length;
    const newCustomers = customers.filter(c => inRange(c.joinedAt, 30, 0)).length;

    const statCard = (i, tone, ico, label, value, foot, attrs = "") => `
        <div class="stat-card tone-${tone}${attrs ? " clickable" : ""}" style="--i:${i}" ${attrs}>
            <div class="stat-top"><span class="stat-label">${esc(label)}</span><span class="stat-icon">${icon(ico)}</span></div>
            <div class="stat-value">${value}</div>
            <div class="stat-foot">${foot}</div>
        </div>`;

    const statusCounts = ["confirmed", "pending", "cancelled"].map(s => bookings.filter(b => b.status === s).length);
    const statusColors = [cssVar("--green"), cssVar("--orange"), cssVar("--red")];
    const totalB = bookings.length || 1;

    const recent = [...bookings].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 5);
    const maintActive = maintenance.filter(m => m.status === "in_progress");
    const todo = [
        ...pending.slice(0, 4).map(b => `
            <div class="attention-item">
                <span class="stat-icon" style="color:var(--orange);background:var(--orange-50)">${icon("clipboard")}</span>
                <div><strong>#${esc(String(b.id).slice(-5))} · ${esc(b.customerName)}</strong><small>${esc(b.carName)} · ${esc(t("waitingApproval", { date: fmtDate(b.startDate) }))}</small></div>
                <button class="act ok" data-act="approve" data-id="${Number(b.id)}">${icon("check")} ${esc(t("approve"))}</button>
            </div>`),
        ...maintActive.slice(0, 2).map(m => `
            <div class="attention-item">
                <span class="stat-icon" style="color:var(--violet);background:var(--violet-50)">${icon("wrench")}</span>
                <div><strong>${esc(m.carName)}</strong><small>${esc(t("inMaintenance", { date: fmtDate(m.endDate) }))}</small></div>
                <button class="act" data-go="maintenance">${icon("arrow")}</button>
            </div>`)
    ];

    host.innerHTML = `
        <div class="stat-grid">
            ${statCard(0, "violet", "wallet", t("revenue"), esc(shortMoney(revenue)) + " ₫", `${trendHtml(revCur, revPrev)} ${esc(t("vsPrev"))}`)}
            ${statCard(1, "orange", "clipboard", t("pendingBookings"), pending.length, esc(pending.length ? t("needAction") : t("allClear")), `data-go="bookings" data-tab="pending"`)}
            ${statCard(2, "blue", "car", t("activeRentals"), rented, esc(t("ofCars", { n: cars.length })))}
            ${statCard(3, "green", "users", t("customersStat"), customers.length, esc(t("newCustomers", { n: newCustomers })))}
        </div>

        <div class="dash-grid">
            <div class="panel">
                <div class="panel-header">
                    <div><h2>${esc(t("revenueChart"))}</h2><p id="rangeTotal">${esc(t("revenueChartSub"))}</p></div>
                    ${tabsHtml("revenueRange", String(ui.revenueRange), [["7", t("days7")], ["30", t("days30")]])}
                </div>
                <div class="chart-box"><canvas id="revenueChart"></canvas></div>
            </div>
            <div class="panel">
                <div class="panel-header"><div><h2>${esc(t("bookingStatus"))}</h2><p>${esc(t("bookingStatusSub"))}</p></div></div>
                <div class="donut-box">
                    <canvas id="statusChart"></canvas>
                    <div class="donut-center"><strong>${bookings.length}</strong><span>${esc(t("totalBookings"))}</span></div>
                </div>
                <div class="legend">
                    ${["confirmed", "pending", "cancelled"].map((s, i) => `
                        <div class="legend-row"><i style="background:${statusColors[i]}"></i><span>${esc(statusLabel(s))}</span><strong>${statusCounts[i]}</strong><em>${Math.round(statusCounts[i] / totalB * 100)}%</em></div>`).join("")}
                </div>
            </div>
        </div>

        <div class="dash-grid" style="align-items:start">
            <div class="panel">
                <div class="panel-header">
                    <div><h2>${esc(t("recentBookings"))}</h2><p>${esc(t("recentBookingsSub"))}</p></div>
                    <button class="text-btn" data-go="bookings">${esc(t("viewAll"))} ${icon("arrow")}</button>
                </div>
                <div class="table-scroll">
                    ${recent.length ? `<table>
                        <thead><tr><th>${esc(t("code"))}</th><th>${esc(t("customer"))}</th><th>${esc(t("car"))}</th><th>${esc(t("total"))}</th><th>${esc(t("status"))}</th></tr></thead>
                        <tbody>${recent.map(b => `
                            <tr class="clickable" data-detail="${Number(b.id)}">
                                <td><span class="code">#${esc(String(b.id).slice(-5))}</span></td>
                                <td><span class="cell-main">${esc(b.customerName)}</span><span class="cell-sub">${esc(fmtDate(b.startDate))}</span></td>
                                <td>${esc(b.carName)}</td>
                                <td class="money">${esc(money(b.total))}</td>
                                <td>${statusBadge(b.status)}</td>
                            </tr>`).join("")}</tbody>
                    </table>` : emptyState("clipboard", t("noBookings"))}
                </div>
            </div>
            <div style="display:grid;gap:16px;align-content:start">
                <div class="panel">
                    <div class="panel-header">
                        <div><h2>${esc(t("fleetStatus"))}</h2><p>${esc(t("fleetStatusSub"))}</p></div>
                        <button class="text-btn" data-go="fleet">${esc(t("manage"))} ${icon("arrow")}</button>
                    </div>
                    <div class="fleet-bars">
                        ${[["available", available, "--green"], ["rented", rented, "--blue"], ["maintenance", inMaint, "--violet"]].map(([s, n, c]) => `
                            <div class="fleet-bar-row">
                                <div class="row-head"><span>${esc(statusLabel(s))}</span><strong>${n} / ${cars.length}</strong></div>
                                <div class="bar"><span data-w="${cars.length ? (n / cars.length * 100).toFixed(1) : 0}" style="background:var(${c})"></span></div>
                            </div>`).join("")}
                    </div>
                </div>
                <div class="panel">
                    <div class="panel-header"><div><h2>${esc(t("attention"))}</h2><p>${esc(t("attentionSub"))}</p></div></div>
                    <div class="attention">${todo.length ? todo.join("") : `<p class="muted" style="padding:4px 0 6px">${esc(t("nothingToDo"))}</p>`}</div>
                </div>
            </div>
        </div>`;

    requestAnimationFrame(() => $$(".bar > span", host).forEach(s => { s.style.width = s.dataset.w + "%"; }));
    renderCharts(statusCounts, statusColors);
}

function renderCharts(statusCounts, statusColors) {
    if (typeof Chart === "undefined") return;
    const text = cssVar("--muted");
    const grid = cssVar("--line");
    const primary = cssVar("--primary");

    // Doanh thu theo ngày đặt của các đơn đã xác nhận
    const days = ui.revenueRange;
    const labels = [], keys = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        keys.push(dayKey(d));
        labels.push(d.toLocaleDateString(locale(), { day: "2-digit", month: "2-digit" }));
    }
    const sums = Object.fromEntries(keys.map(k => [k, 0]));
    bookings.filter(b => b.status === "confirmed").forEach(b => {
        const d = parseDate(b.createdAt);
        if (!d) return;
        const k = dayKey(d);
        if (k in sums) sums[k] += Number(b.total) || 0;
    });
    const values = keys.map(k => sums[k]);
    const rangeTotal = values.reduce((a, b) => a + b, 0);
    const totalEl = $("#rangeTotal");
    if (totalEl) totalEl.textContent = `${t("revenueChartSub")} · ${t("rangeTotal", { v: money(rangeTotal) })}`;

    revenueChart?.destroy();
    const canvas = $("#revenueChart");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 260);
        gradient.addColorStop(0, primary + "55");
        gradient.addColorStop(1, primary + "00");
        revenueChart = new Chart(canvas, {
            type: days > 7 ? "bar" : "line",
            data: {
                labels,
                datasets: [{
                    label: t("revenueChart"),
                    data: values,
                    borderColor: primary,
                    backgroundColor: days > 7 ? primary : gradient,
                    borderWidth: days > 7 ? 0 : 3,
                    borderRadius: 6,
                    fill: true,
                    tension: .4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: cssVar("--surface"),
                    pointBorderColor: primary,
                    pointBorderWidth: 2,
                    maxBarThickness: 18
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { intersect: false, mode: "index" },
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: c => " " + money(c.raw) } }
                },
                scales: {
                    y: { beginAtZero: true, suggestedMax: Math.max(...values) > 0 ? undefined : 1000000, border: { display: false }, grid: { color: grid }, ticks: { color: text, maxTicksLimit: 6, callback: v => shortMoney(v) } },
                    x: { grid: { display: false }, border: { display: false }, ticks: { color: text, maxRotation: 0, autoSkipPadding: 12 } }
                }
            }
        });
    }

    statusChart?.destroy();
    const donut = $("#statusChart");
    if (donut) {
        statusChart = new Chart(donut, {
            type: "doughnut",
            data: {
                labels: ["confirmed", "pending", "cancelled"].map(statusLabel),
                datasets: [{ data: statusCounts, backgroundColor: statusColors, borderWidth: 0, hoverOffset: 6 }]
            },
            options: { cutout: "76%", responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
    }
}

/* ================== Đơn đặt xe ================== */

function bookingActions(b) {
    const id = Number(b.id);
    return `
        ${b.status === "pending" ? `<button class="act ok" data-act="approve" data-id="${id}">${icon("check")} ${esc(t("approve"))}</button>` : ""}
        ${b.status === "confirmed" ? `<button class="act" data-act="handover" data-id="${id}">${icon("key-round")} ${esc(t("handover"))}</button>` : ""}
        ${b.status !== "cancelled" ? `<button class="act danger icon-only" data-act="cancel" data-id="${id}" title="${esc(t("cancel"))}" aria-label="${esc(t("cancel"))}">${icon("x")}</button>` : ""}`;
}

function renderBookings() {
    const host = $("#bookingsPage");
    const q = ui.bookingSearch.toLowerCase();
    const counts = { all: bookings.length };
    ["pending", "confirmed", "cancelled"].forEach(s => { counts[s] = bookings.filter(b => b.status === s).length; });
    const rows = bookings.filter(b => {
        const match = !q || String(b.id).includes(q) || (b.customerName || "").toLowerCase().includes(q)
            || (b.carName || "").toLowerCase().includes(q) || (b.customerPhone || "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))
            || (b.customerEmail || "").toLowerCase().includes(q);
        return match && (ui.bookingTab === "all" || b.status === ui.bookingTab);
    }).sort((a, b) => Number(b.id) - Number(a.id));

    const focused = document.activeElement?.id === "bookingSearch";
    host.innerHTML = `
        <div class="toolbar">
            <div class="toolbar-left">
                ${tabsHtml("bookingTab", ui.bookingTab, [["all", t("all"), counts.all], ["pending", t("pending"), counts.pending], ["confirmed", t("confirmed"), counts.confirmed], ["cancelled", t("cancelled"), counts.cancelled]])}
                <label class="search-input">${icon("search")}<input type="search" id="bookingSearch" placeholder="${esc(t("searchBookings"))}" value="${esc(ui.bookingSearch)}" /><kbd>/</kbd></label>
            </div>
            <button class="btn btn-outline" id="exportBookings">${icon("download")} ${esc(t("exportCsv"))}</button>
        </div>
        <div class="panel">
            <div class="table-scroll">
                ${rows.length ? `<table>
                    <thead><tr><th>${esc(t("code"))}</th><th>${esc(t("customer"))}</th><th>${esc(t("car"))}</th><th>${esc(t("dates"))}</th><th>${esc(t("total"))}</th><th>${esc(t("status"))}</th><th>${esc(t("paymentCol"))}</th><th>${esc(t("actions"))}</th></tr></thead>
                    <tbody>${rows.map(b => {
                        const pay = paymentOf(b);
                        const payCell = b.status === "pending" ? `<span class="cell-sub">—</span>`
                            : pay ? `${payBadge(pay.status)}<span class="cell-sub">${esc(pay.method ? methodLabel(pay.method) : t("methodNone"))}</span>`
                            : `<span class="cell-sub">${esc(t("notRecorded"))}</span>`;
                        return `
                        <tr class="clickable" data-detail="${Number(b.id)}">
                            <td><span class="code">#${esc(String(b.id).slice(-5))}</span><span class="cell-sub">${esc(fmtDate(b.createdAt))}</span></td>
                            <td><span class="cell-main">${esc(b.customerName)}</span><span class="cell-sub">${esc(b.customerPhone || "")}</span></td>
                            <td><span class="cell-main">${esc(b.carName)}</span><span class="cell-sub">${esc(city(b.location))}</span></td>
                            <td>${esc(fmtDate(b.startDate))} → ${esc(fmtDate(b.endDate))}<span class="cell-sub">${esc(t("nDays", { n: nightCount(b.startDate, b.endDate) }))}</span></td>
                            <td class="money">${esc(money(b.total))}</td>
                            <td>${statusBadge(b.status)}</td>
                            <td>${payCell}</td>
                            <td><div class="actions">${bookingActions(b)}</div></td>
                        </tr>`;
                    }).join("")}</tbody>
                </table>` : emptyState("clipboard", t("noBookings"), t("noBookingsHint"))}
            </div>
        </div>`;
    if (focused) {
        const inp = $("#bookingSearch");
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
    }
}

function openBookingDetail(id) {
    const b = bookings.find(x => Number(x.id) === Number(id));
    if (!b) return;
    if (!$("#paymentModal").classList.contains("hidden")) closeModal("paymentModal");
    $("#bookingModalTitle").textContent = t("bookingDetail", { id: String(b.id).slice(-5) });
    const phoneHref = String(b.customerPhone || "").replace(/[^\d+]/g, "");
    const pay = paymentOf(b);
    $("#bookingDetail").innerHTML = `
        <div style="margin-bottom:10px">${statusBadge(b.status)}</div>
        <div class="detail-list">
            <div class="detail-row"><span>${esc(t("customer"))}</span><strong>${esc(b.customerName)}</strong></div>
            <div class="detail-row"><span>${esc(t("phone"))}</span><a href="tel:${esc(phoneHref)}">${esc(b.customerPhone)}</a></div>
            <div class="detail-row"><span>Email</span><a href="mailto:${esc(b.customerEmail)}">${esc(b.customerEmail)}</a></div>
            <div class="detail-row"><span>${esc(t("car"))}</span><strong>${esc(b.carName)}</strong></div>
            <div class="detail-row"><span>${esc(t("pickup"))}</span><strong>${esc(fmtDate(b.startDate))}</strong></div>
            <div class="detail-row"><span>${esc(t("return"))}</span><strong>${esc(fmtDate(b.endDate))} · ${esc(t("nDays", { n: nightCount(b.startDate, b.endDate) }))}</strong></div>
            <div class="detail-row"><span>${esc(t("location"))}</span><strong>${esc(city(b.location))}</strong></div>
            ${pay ? `<div class="detail-row"><span>${esc(t("paymentCol"))}</span><strong><span class="method-chip">${icon(methodIcon(pay.method))}${esc(pay.method ? methodLabel(pay.method) : t("methodNone"))}</span> ${payBadge(pay.status)} <button class="link-btn" data-pay-edit="${Number(pay.id)}">${icon("edit")} ${esc(t("editPaymentBtn"))}</button></strong></div>` : ""}
            <div class="detail-row"><span>${esc(t("createdAt"))}</span><strong>${esc(fmtDateTime(b.createdAt))}</strong></div>
        </div>
        <div class="detail-total"><span>${esc(t("total"))}</span><strong>${esc(money(b.total))}</strong></div>
        <div class="modal-actions">
            <a class="btn btn-outline" href="tel:${esc(phoneHref)}">${icon("phone")} ${esc(t("call"))}</a>
            ${b.status !== "cancelled" ? `<button class="btn btn-ghost" data-act="cancel" data-id="${Number(b.id)}" style="color:var(--red)">${esc(t("cancel"))}</button>` : ""}
            ${b.status === "pending" ? `<button class="btn btn-primary" data-act="approve" data-id="${Number(b.id)}">${icon("check")} ${esc(t("approve"))}</button>` : ""}
            ${b.status === "confirmed" ? `<button class="btn btn-primary" data-act="handover" data-id="${Number(b.id)}">${icon("key-round")} ${esc(t("handover"))}</button>` : ""}
        </div>`;
    openModal("bookingModal");
}

/* ---------- Duyệt đơn + ghi nhận thanh toán ---------- */

const approveState = { id: null, method: "", status: "pending" };

function openApproveModal(id) {
    const b = bookings.find(x => Number(x.id) === Number(id));
    if (!b) return;
    if (!$("#bookingModal").classList.contains("hidden")) closeModal("bookingModal");
    approveState.id = b.id;
    approveState.method = "";
    approveState.status = "pending";
    $("#approveTitle").textContent = t("approveTitle", { id: String(b.id).slice(-5) });
    $("#approveSummary").innerHTML = `
        <div class="approve-card">
            <div class="approve-who">
                <strong>${esc(b.customerName)}</strong>
                <span>${esc(b.carName)} · ${esc(fmtDate(b.startDate))} → ${esc(fmtDate(b.endDate))} · ${esc(t("nDays", { n: nightCount(b.startDate, b.endDate) }))}</span>
            </div>
            <div class="approve-amount"><small>${esc(t("total"))}</small><strong>${esc(money(b.total))}</strong></div>
        </div>`;
    $("#approveNote").value = "";
    renderApproveControls();
    openModal("approveModal");
}

function renderApproveControls() {
    $("#approveMethods").innerHTML = PAY_METHODS.map(([m, ic]) => {
        const on = m === approveState.method;
        return `<button type="button" class="pay-method ${on ? "active" : ""}" role="radio" aria-checked="${on}" data-pay-method="${esc(m)}">${icon(ic)}<span>${esc(methodLabel(m))}</span></button>`;
    }).join("");
    $("#approveStatus").innerHTML = [["pending", t("payNotCollected"), "clock"], ["paid", t("payCollected"), "check"]].map(([v, label, ic]) => {
        const on = v === approveState.status;
        return `<button type="button" class="seg-btn ${on ? "active" : ""}" role="radio" aria-checked="${on}" data-pay-status="${v}">${icon(ic)} ${esc(label)}</button>`;
    }).join("");
}

async function reloadMoneyData() {
    try {
        const [p, cu] = await Promise.all([api("/api/users.php?action=payments"), api("/api/users.php")]);
        payments = p;
        customers = cu;
    } catch (_) { /* giữ dữ liệu cũ, lần tự làm mới sau sẽ cập nhật */ }
}

async function submitApprove(e) {
    e.preventDefault();
    const b = bookings.find(x => Number(x.id) === Number(approveState.id));
    if (!b) return;
    if (!approveState.method) {
        showToast(t("payMethodRequired"), "error");
        const box = $("#approveMethods");
        box.classList.remove("shake");
        void box.offsetWidth;
        box.classList.add("shake");
        return;
    }
    const btn = $("#approveSubmit");
    setLoading(btn, true);
    try {
        const { payment, ...updated } = await api(`/api/orders.php?id=${Number(b.id)}`, {
            method: "PATCH",
            body: JSON.stringify({
                status: "confirmed",
                paymentMethod: approveState.method,
                paymentStatus: approveState.status,
                paymentNote: $("#approveNote").value.trim()
            })
        });
        Object.assign(b, updated);
        await reloadMoneyData();
        showToast(t("approvedPay", { id: String(b.id).slice(-5), method: methodLabel(approveState.method) }), "success");
        closeModal("approveModal");
        renderEverything();
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        setLoading(btn, false);
    }
}

/* ---------- Sửa giao dịch ---------- */

const payEdit = { id: null, method: "", status: "pending", sync: false };

const bookingTotalOf = (p) => Number(bookings.find(b => String(b.id) === String(p.bookingId))?.total) || 0;

function openPaymentModal(id) {
    const p = payments.find(x => Number(x.id) === Number(id));
    if (!p) return;
    if (!$("#bookingModal").classList.contains("hidden")) closeModal("bookingModal");
    const b = bookings.find(x => String(x.id) === String(p.bookingId));
    payEdit.id = p.id;
    payEdit.method = p.method || "";
    payEdit.status = p.status || "pending";
    payEdit.sync = false;
    $("#paymentTitle").textContent = t("editPayment", { code: p.txnCode });
    $("#paymentSummary").innerHTML = `
        <div class="approve-card">
            <div class="approve-who">
                <strong>${esc(p.customerName)}</strong>
                <span>${esc(p.carName || "")}${b ? ` · ${esc(fmtDate(b.startDate))} → ${esc(fmtDate(b.endDate))}` : ""}</span>
                ${b ? `<button type="button" class="link-btn" data-detail="${esc(b.id)}">${icon("eye")} ${esc(t("orderRef", { id: String(b.id).slice(-5) }))} · ${esc(statusLabel(b.status))}</button>` : ""}
            </div>
            <div class="approve-amount"><small>${esc(t("total"))}</small><strong>${esc(money(bookingTotalOf(p)))}</strong></div>
        </div>`;
    $("#paymentAmount").value = Number(p.amount) || 0;
    $("#paymentPaidAt").value = String(p.paidAt || "").replace(" ", "T").slice(0, 16);
    $("#paymentNote").value = p.note || "";
    renderPaymentControls();
    updateAmountHint();
    openModal("paymentModal");
}

function renderPaymentControls() {
    const p = payments.find(x => Number(x.id) === Number(payEdit.id));
    const methods = [...PAY_METHODS];
    // Giữ hình thức cũ (ví dụ COD) nếu dữ liệu đang dùng
    if (p?.method && !methods.some(m => m[0] === p.method)) methods.push([p.method, "wallet"]);
    $("#paymentMethods").innerHTML = methods.map(([m, ic]) => {
        const on = m === payEdit.method;
        return `<button type="button" class="pay-method ${on ? "active" : ""}" role="radio" aria-checked="${on}" data-pay-method="${esc(m)}">${icon(ic)}<span>${esc(methodLabel(m))}</span></button>`;
    }).join("");
    $("#paymentStatus").innerHTML = [["pending", t("pendingPay"), "clock"], ["paid", t("paid"), "check"], ["refunded", t("refunded"), "refresh"]].map(([v, label, ic]) => {
        const on = v === payEdit.status;
        return `<button type="button" class="seg-btn ${on ? "active" : ""}" role="radio" aria-checked="${on}" data-pay-status="${v}">${icon(ic)} ${esc(label)}</button>`;
    }).join("");
    const paidAt = $("#paymentPaidAt");
    paidAt.disabled = payEdit.status === "pending";
    if (payEdit.status === "pending") paidAt.value = "";
    else if (!paidAt.value) {
        // Chuyển sang đã thu / hoàn tiền mà chưa có thời điểm thì điền sẵn thời gian hiện tại
        const d = new Date();
        paidAt.value = new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
}

function updateAmountHint() {
    const p = payments.find(x => Number(x.id) === Number(payEdit.id));
    if (!p) return;
    const total = bookingTotalOf(p);
    const diff = Number($("#paymentAmount").value) !== total;
    $("#paymentAmountHint").innerHTML = diff
        ? `${icon("alert")} ${esc(t("amountDiffHint", { total: money(total) }))} <button type="button" class="link-btn" id="syncAmountBtn">${esc(t("syncAmount"))}</button>`
        : `${icon("check")} ${esc(t("bookingTotalHint", { total: money(total) }))}`;
    $("#paymentAmountHint").classList.toggle("warn", diff);
}

async function savePayment(e) {
    e.preventDefault();
    const p = payments.find(x => Number(x.id) === Number(payEdit.id));
    if (!p) return;
    if (!payEdit.method) {
        showToast(t("payMethodRequired"), "error");
        const box = $("#paymentMethods");
        box.classList.remove("shake");
        void box.offsetWidth;
        box.classList.add("shake");
        return;
    }
    const amount = Number($("#paymentAmount").value);
    if (!payEdit.sync && (!Number.isFinite(amount) || amount < 0)) {
        $("#paymentAmount").focus();
        return showToast(t("amountInvalid"), "error");
    }
    const body = { method: payEdit.method, status: payEdit.status, note: $("#paymentNote").value.trim() };
    if (payEdit.status !== "pending") body.paidAt = $("#paymentPaidAt").value;
    if (payEdit.sync) body.syncAmount = true;
    else body.amount = Math.round(amount);
    const btn = $("#paymentSave");
    setLoading(btn, true);
    try {
        const updated = await api(`/api/users.php?action=payments&id=${Number(p.id)}`, { method: "PATCH", body: JSON.stringify(body) });
        const idx = payments.findIndex(x => Number(x.id) === Number(p.id));
        if (idx >= 0) payments[idx] = updated;
        showToast(t("paymentSaved", { code: updated.txnCode }), "success");
        closeModal("paymentModal");
        renderEverything();
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        setLoading(btn, false);
    }
}

async function markPaymentPaid(id) {
    const p = payments.find(x => Number(x.id) === Number(id));
    if (!p) return;
    try {
        const updated = await api(`/api/users.php?action=payments&id=${Number(id)}`, { method: "PATCH", body: JSON.stringify({ status: "paid" }) });
        Object.assign(p, updated);
        showToast(t("markPaidToast", { code: p.txnCode }), "success");
        renderEverything();
    } catch (err) {
        showToast(err.message, "error");
    }
}

async function bookingAction(act, id) {
    const b = bookings.find(x => Number(x.id) === Number(id));
    if (!b) return;
    const short = String(b.id).slice(-5);
    if (act === "approve") return openApproveModal(id);
    try {
        if (act === "cancel") {
            const ok = await confirmDialog({
                title: t("confirmCancelTitle", { id: short }),
                text: t("confirmCancelText", { name: b.customerName, car: b.carName }),
                okText: t("confirmCancelOk")
            });
            if (!ok) return;
            const { payment: _p, ...updated } = await api(`/api/orders.php?id=${Number(id)}`, { method: "PATCH", body: JSON.stringify({ status: "cancelled" }) });
            Object.assign(b, updated);
            // Hủy đơn đã duyệt làm thay đổi giao dịch (hoàn tiền / bỏ giao dịch chưa thu) và hạng khách
            await reloadMoneyData();
            const car = cars.find(c => c.id === b.carId);
            if (car && car.status === "rented") car.status = "available";
            showToast(t("cancelledToast", { id: short }), "success");
        } else if (act === "handover") {
            await api(`/api/orders.php?action=mark-rented&id=${Number(id)}`, { method: "PATCH" });
            const car = cars.find(c => c.id === b.carId);
            if (car) car.status = "rented";
            showToast(t("handedOver", { id: short }), "success");
        }
        closeModal("bookingModal");
        renderEverything();
    } catch (e) {
        showToast(e.message, "error");
    }
}

/* ================== Đội xe ================== */

function renderFleet() {
    const host = $("#fleetPage");
    const q = ui.fleetSearch.toLowerCase();
    const list = cars.filter(c => {
        const match = !q || (c.name || "").toLowerCase().includes(q) || (c.brand || "").toLowerCase().includes(q);
        return match && (ui.fleetStatus === "all" || c.status === ui.fleetStatus);
    });
    const counts = { all: cars.length };
    ["available", "rented", "maintenance"].forEach(s => { counts[s] = cars.filter(c => c.status === s).length; });
    const focused = document.activeElement?.id === "fleetSearch";

    host.innerHTML = `
        <div class="toolbar">
            <div class="toolbar-left">
                ${tabsHtml("fleetStatus", ui.fleetStatus, [["all", t("all"), counts.all], ["available", t("available"), counts.available], ["rented", t("rented"), counts.rented], ["maintenance", t("maintenance"), counts.maintenance]])}
                <label class="search-input">${icon("search")}<input type="search" id="fleetSearch" placeholder="${esc(t("searchCars"))}" value="${esc(ui.fleetSearch)}" /><kbd>/</kbd></label>
            </div>
            <button class="btn btn-primary" id="addCarBtn">${icon("plus")} ${esc(t("addCar"))}</button>
        </div>
        ${list.length ? `<div class="fleet-grid">${list.map((c, i) => {
        const img = safeUrl(c.image);
        const type = (c.type || "").toLowerCase();
        return `
            <article class="fleet-card" style="--i:${i}">
                <div class="fleet-thumb ${esc(type)} ${img ? "" : "art"}">
                    ${img ? `<img src="${esc(img)}" alt="${esc(c.name)}" loading="lazy" />` : CarArt.svg(c)}
                    ${statusBadge(c.status)}
                    ${c.featured ? `<span class="featured-mark" title="${esc(t("featured"))}">${icon("star")}</span>` : ""}
                </div>
                <div class="fleet-body">
                    <h3>${esc(c.name)}</h3>
                    <div class="fleet-meta">
                        <span>${esc(c.brand)} · ${esc(c.type)}</span>
                        <span>${icon("users")} ${esc(t("seats", { n: c.seats }))}</span>
                        <span>${icon("pin")} ${esc(city(c.location))}</span>
                    </div>
                    <div class="fleet-price">${esc(money(c.price))}<small>${esc(t("perDay"))}</small></div>
                    <div class="fleet-foot">
                        <select data-car-status="${Number(c.id)}" aria-label="${esc(t("status"))}">
                            ${["available", "rented", "maintenance"].map(s => `<option value="${s}" ${s === c.status ? "selected" : ""}>${esc(statusLabel(s))}</option>`).join("")}
                        </select>
                        <button class="act icon-only" data-car-edit="${Number(c.id)}" title="${esc(t("edit"))}" aria-label="${esc(t("edit"))}">${icon("edit")}</button>
                        <button class="act danger icon-only" data-car-delete="${Number(c.id)}" title="${esc(t("delete"))}" aria-label="${esc(t("delete"))}">${icon("trash")}</button>
                    </div>
                </div>
            </article>`;
    }).join("")}</div>` : `<div class="panel">${emptyState("car", t("noCars"), t("noCarsHint"))}</div>`}`;

    if (focused) {
        const inp = $("#fleetSearch");
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
    }
}

/* ---------- Màu xe & hình minh họa trong form xe ---------- */

let carColor = "";

function renderColorSwatches() {
    const keys = ["", ...Object.keys(CarArt.COLORS)];
    $("#carColors").innerHTML = keys.map(k => {
        const on = k === carColor;
        const label = k ? t("color_" + k) : t("colorAuto");
        const style = k ? `--sw:${CarArt.COLORS[k]}` : "";
        return `<button type="button" class="swatch ${k ? "" : "auto"} ${on ? "active" : ""}" style="${style}" data-color="${k}" role="radio" aria-checked="${on}" title="${esc(label)}" aria-label="${esc(label)}">${on ? icon("check") : ""}</button>`;
    }).join("") + `<span class="swatch-label">${esc(carColor ? t("color_" + carColor) : t("colorAuto"))}</span>`;
}

function refreshCarArt() {
    const car = { name: $("#carName").value || "GoDrive", brand: $("#carBrand").value, type: $("#carType").value, color: carColor };
    $("#carImagePlaceholder").innerHTML = CarArt.svg(car);
}

function setCarImagePreview(src) {
    const img = $("#carImagePreviewImg");
    const url = safeUrl(src);
    refreshCarArt();
    if (url) {
        img.src = url;
        img.hidden = false;
        $("#carImagePlaceholder").hidden = true;
        $("#carImagePreview").classList.add("has-photo");
    } else {
        img.removeAttribute("src");
        img.hidden = true;
        $("#carImagePlaceholder").hidden = false;
        $("#carImagePreview").classList.remove("has-photo");
    }
}

function openCarModal(car = null) {
    $("#carForm").reset();
    $("#carModalTitle").textContent = car ? t("editCar") : t("newCar");
    $("#carId").value = car ? car.id : "";
    $("#carName").value = car?.name || "";
    $("#carBrand").value = car?.brand || "";
    $("#carType").value = car?.type || "Sedan";
    $("#carSeats").value = car?.seats || 5;
    $("#carPrice").value = car?.price || "";
    const loc = car?.location || "Hà Nội";
    if (![...$("#carLocation").options].some(o => o.value === loc)) {
        $("#carLocation").add(new Option(loc, loc));
    }
    $("#carLocation").value = loc;
    $("#carFeatured").checked = !!car?.featured;
    $("#carImageUrl").value = car?.image || "";
    carColor = CarArt.COLORS[car?.color] ? car.color : "";
    renderColorSwatches();
    setCarImagePreview(car?.image || "");
    openModal("carModal");
}

async function saveCar(e) {
    e.preventDefault();
    const name = $("#carName").value.trim();
    const price = Number($("#carPrice").value);
    const image = $("#carImageUrl").value.trim();
    if (!name) { $("#carName").focus(); return showToast(t("carNameRequired"), "error"); }
    if (!(price > 0)) { $("#carPrice").focus(); return showToast(t("carPriceRequired"), "error"); }
    if (image && !safeUrl(image)) { $("#carImageUrl").focus(); return showToast(t("imageInvalid"), "error"); }

    const data = {
        name, price, image,
        brand: $("#carBrand").value.trim(),
        type: $("#carType").value,
        seats: Number($("#carSeats").value) || 5,
        location: $("#carLocation").value,
        featured: $("#carFeatured").checked,
        color: carColor
    };
    const btn = $("#carSaveBtn");
    setLoading(btn, true);
    try {
        const id = $("#carId").value;
        if (id) {
            const c = await api(`/api/products.php?id=${Number(id)}`, { method: "PUT", body: JSON.stringify(data) });
            const idx = cars.findIndex(x => x.id === c.id);
            if (idx >= 0) cars[idx] = c;
            showToast(t("carSaved"), "success");
        } else {
            const c = await api("/api/products.php", { method: "POST", body: JSON.stringify(data) });
            cars.push(c);
            showToast(t("carAdded"), "success");
        }
        closeModal("carModal");
        renderEverything();
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        setLoading(btn, false);
    }
}

async function changeCarStatus(id, status) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    try {
        const c = await api(`/api/products.php?action=status&id=${Number(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
        Object.assign(car, c);
        showToast(t("carStatusChanged", { car: car.name, status: statusLabel(status) }), "success");
        renderEverything();
    } catch (e) {
        showToast(e.message, "error");
        renderFleet();
    }
}

async function deleteCar(id) {
    const car = cars.find(c => c.id === id);
    if (!car) return;
    const ok = await confirmDialog({ title: t("confirmDeleteCar", { car: car.name }), text: t("confirmDeleteCarText"), okText: t("delete") });
    if (!ok) return;
    try {
        await api(`/api/products.php?id=${Number(id)}`, { method: "DELETE" });
        cars = cars.filter(c => c.id !== id);
        showToast(t("carDeleted"), "success");
        renderEverything();
    } catch (e) {
        showToast(e.message, "error");
    }
}

/* ================== Khách hàng ================== */

/* Hạng khách hàng: giống CUSTOMER_TIERS trong api/_helpers.php (cao nhất là trên 1 tỷ) */
const TIERS = [
    { code: "diamond", min: 1000000000, strict: true },
    { code: "platinum", min: 500000000 },
    { code: "gold", min: 200000000 },
    { code: "silver", min: 50000000 },
    { code: "bronze", min: 0 }
];

function tierOf(spent) {
    const s = Number(spent) || 0;
    return (TIERS.find(x => (x.strict ? s > x.min : s >= x.min)) || TIERS[TIERS.length - 1]).code;
}

function tierMinLabel(tier) {
    if (tier.min === 0) return t("tierUnder", { v: shortMoney(TIERS[TIERS.length - 2].min) });
    return (tier.strict ? t("tierOver") : t("tierFrom")) + " " + shortMoney(tier.min);
}

// Tiến độ (%) từ mốc hạng hiện tại tới mốc hạng kế tiếp
function tierProgress(spent) {
    const code = tierOf(spent);
    const i = TIERS.findIndex(x => x.code === code);
    if (i === 0) return 100;
    const next = TIERS[i - 1], cur = TIERS[i];
    const target = next.strict ? next.min + 1 : next.min;
    return Math.max(2, Math.min(100, Math.round(((Number(spent) || 0) - cur.min) / (target - cur.min) * 100)));
}

// Xếp hạng theo tổng tiền thuê (server đã tính sẵn; tự tính lại nếu thiếu)
function rankedCustomers() {
    const list = customers.map(c => ({ ...c, totalSpent: Number(c.totalSpent) || 0, tier: c.tier && TIERS.some(x => x.code === c.tier) && c.rank ? c.tier : tierOf(c.totalSpent) }));
    list.sort((a, b) => b.totalSpent - a.totalSpent || String(a.joinedAt).localeCompare(String(b.joinedAt)));
    list.forEach((c, i) => { c.rank = i + 1; });
    return list;
}

function rankBadge(rank) {
    const medal = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : "";
    return `<span class="rank-badge ${medal}">#${rank}</span>`;
}

function renderCustomers() {
    const host = $("#customersPage");
    const q = ui.customerSearch.toLowerCase();
    const all = rankedCustomers();
    const list = all.filter(c => (ui.customerTier === "all" || c.tier === ui.customerTier) && (!q
        || (c.name || "").toLowerCase().includes(q)
        || (c.email || "").toLowerCase().includes(q)
        || (c.phone || "").replace(/\s/g, "").includes(q.replace(/\s/g, ""))));
    const focused = document.activeElement?.id === "customerSearch";

    const tierCards = TIERS.map((tier, i) => {
        const members = all.filter(c => c.tier === tier.code);
        const spent = members.reduce((s, c) => s + c.totalSpent, 0);
        return `
            <button class="tier-card tier-${tier.code} ${ui.customerTier === tier.code ? "active" : ""}" data-tier="${tier.code}" style="--i:${i}" aria-pressed="${ui.customerTier === tier.code}">
                <span class="tier-card-top"><span class="tier ${tier.code}">${icon("star")} ${esc(statusLabel(tier.code))}</span><small>${esc(tierMinLabel(tier))}</small></span>
                <strong>${members.length}</strong>
                <small>${esc(t("tierCustomers"))} · ${esc(shortMoney(spent))} ₫</small>
            </button>`;
    }).join("");

    host.innerHTML = `
        <div class="tier-overview">${tierCards}</div>
        <p class="tier-rule">${icon("alert")} ${esc(t("tierRule"))}</p>
        <div class="toolbar">
            <div class="toolbar-left">
                <label class="search-input">${icon("search")}<input type="search" id="customerSearch" placeholder="${esc(t("searchCustomers"))}" value="${esc(ui.customerSearch)}" /><kbd>/</kbd></label>
                <span class="muted">${esc(t("customersCount", { n: list.length }))}</span>
                ${ui.customerTier !== "all" ? `<button class="act" data-tier="all">${icon("x")} ${esc(t("clearTier"))}</button>` : ""}
            </div>
            <button class="btn btn-outline" id="exportCustomers">${icon("download")} ${esc(t("exportCsv"))}</button>
        </div>
        <div class="panel">
            <div class="table-scroll">
                ${list.length ? `<table>
                    <thead><tr><th>${esc(t("rankCol"))}</th><th>${esc(t("customer"))}</th><th>${esc(t("phone"))}</th><th>${esc(t("joined"))}</th><th>${esc(t("bookingsCount"))}</th><th>${esc(t("spent"))}</th><th>${esc(t("tier"))}</th></tr></thead>
                    <tbody>${list.map(c => `
                        <tr>
                            <td>${rankBadge(c.rank)}</td>
                            <td><div class="cell-user"><span class="avatar round">${esc(initials(c.name))}</span><div><span class="cell-main">${esc(c.name)}</span><span class="cell-sub">${esc(c.email)}</span></div></div></td>
                            <td>${esc(c.phone || "—")}</td>
                            <td>${esc(fmtDate(c.joinedAt))}</td>
                            <td><strong>${Number(c.totalBookings) || 0}</strong></td>
                            <td><span class="money">${esc(money(c.totalSpent))}</span><span class="spend-bar tier-${esc(c.tier)}"><span style="width:${tierProgress(c.totalSpent)}%"></span></span></td>
                            <td><span class="tier ${esc(c.tier)}">${icon("star")} ${esc(statusLabel(c.tier))}</span></td>
                        </tr>`).join("")}</tbody>
                </table>` : emptyState("users", t("noCustomers"))}
            </div>
        </div>`;
    if (focused) {
        const inp = $("#customerSearch");
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
    }
}

/* ================== Thanh toán ================== */

function renderPayments() {
    const host = $("#paymentsPage");
    const q = ui.paymentSearch.toLowerCase();
    const list = payments.filter(p => {
        const match = !q || String(p.id).includes(q) || (p.customerName || "").toLowerCase().includes(q) || (p.txnCode || "").toLowerCase().includes(q);
        return match && (ui.paymentTab === "all" || p.status === ui.paymentTab);
    });
    const sum = (s) => payments.filter(p => p.status === s).reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const cnt = (s) => payments.filter(p => p.status === s).length;
    const focused = document.activeElement?.id === "paymentSearch";
    const card = (i, tone, ico, label, value, foot) => `
        <div class="stat-card tone-${tone}" style="--i:${i}">
            <div class="stat-top"><span class="stat-label">${esc(label)}</span><span class="stat-icon">${icon(ico)}</span></div>
            <div class="stat-value">${esc(value)}</div><div class="stat-foot">${esc(foot)}</div>
        </div>`;

    const needMethod = payments.filter(p => !p.method).length;
    // Cơ cấu theo hình thức thanh toán (không tính giao dịch đã hoàn tiền)
    const active = payments.filter(p => p.status !== "refunded");
    const activeTotal = active.reduce((a, p) => a + (Number(p.amount) || 0), 0);
    const byMethod = [...active.reduce((m, p) => {
        const k = p.method || "—";
        const cur = m.get(k) || { amount: 0, n: 0 };
        cur.amount += Number(p.amount) || 0;
        cur.n++;
        return m.set(k, cur);
    }, new Map()).entries()].sort((a, b) => b[1].amount - a[1].amount);

    host.innerHTML = `
        <p class="page-note">${icon("shield")}<span>${esc(t("paySince"))} ${esc(t("syncedNote"))}</span></p>
        ${needMethod ? `<p class="page-note warn">${icon("alert")}<span>${esc(t("needMethodNote", { n: needMethod }))}</span></p>` : ""}
        <div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
            ${card(0, "green", "wallet", t("paidTotal"), money(sum("paid")), t("transactions", { n: cnt("paid") }))}
            ${card(1, "orange", "clock", t("pendingPay"), money(sum("pending")), t("transactions", { n: cnt("pending") }))}
            ${card(2, "violet", "refresh", t("refundedPay"), money(sum("refunded")), t("transactions", { n: cnt("refunded") }))}
        </div>
        ${byMethod.length ? `
        <div class="panel method-panel">
            <div class="panel-head"><h3>${esc(t("payByMethod"))}</h3></div>
            <div class="method-list">
                ${byMethod.map(([m, v]) => {
                    const pct = activeTotal ? Math.round((v.amount / activeTotal) * 100) : 0;
                    return `
                    <div class="method-row">
                        <span class="method-ico ${m === "—" ? "warn" : ""}">${icon(m === "—" ? "alert" : methodIcon(m))}</span>
                        <div class="method-main">
                            <div class="method-top"><strong>${esc(m === "—" ? t("methodNone") : methodLabel(m))}</strong><span>${esc(money(v.amount))} · ${pct}%</span></div>
                            <div class="method-bar"><span style="width:${pct}%"></span></div>
                            <small>${esc(t("transactions", { n: v.n }))}</small>
                        </div>
                    </div>`;
                }).join("")}
            </div>
        </div>` : ""}
        <div class="toolbar">
            <div class="toolbar-left">
                ${tabsHtml("paymentTab", ui.paymentTab, [["all", t("all"), payments.length], ["paid", t("paid"), cnt("paid")], ["pending", t("pendingPay"), cnt("pending")], ["refunded", t("refunded"), cnt("refunded")]])}
                <label class="search-input">${icon("search")}<input type="search" id="paymentSearch" placeholder="${esc(t("searchPayments"))}" value="${esc(ui.paymentSearch)}" /><kbd>/</kbd></label>
            </div>
            <button class="btn btn-outline" id="exportPayments">${icon("download")} ${esc(t("exportCsv"))}</button>
        </div>
        <div class="panel">
            <div class="table-scroll">
                ${list.length ? `<table>
                    <thead><tr><th>${esc(t("txn"))}</th><th>${esc(t("customer"))}</th><th>${esc(t("method"))}</th><th>${esc(t("amount"))}</th><th>${esc(t("time"))}</th><th>${esc(t("status"))}</th><th></th></tr></thead>
                    <tbody>${list.map(p => `
                        <tr>
                            <td><span class="code">${esc(p.txnCode)}</span>${p.bookingId ? `<button class="link-btn cell-sub" data-detail="${esc(p.bookingId)}">${esc(t("orderRef", { id: String(p.bookingId).slice(-5) }))}</button>` : `<span class="cell-sub">—</span>`}</td>
                            <td><span class="cell-main">${esc(p.customerName)}</span><span class="cell-sub">${esc(p.carName || "")}${p.approvedBy ? " · " + esc(t("approvedBy", { name: p.approvedBy })) : ""}</span></td>
                            <td>${p.method ? `<span class="method-chip">${icon(methodIcon(p.method))}${esc(methodLabel(p.method))}</span>` : `<span class="method-chip warn">${icon("alert")}${esc(t("methodNone"))}</span>`}${p.note ? `<span class="cell-sub">${esc(p.note)}</span>` : ""}</td>
                            <td class="money">${esc(money(p.amount))}${p.amountEdited ? `<span class="cell-sub edited" title="${esc(t("amountDiffHint", { total: money(bookingTotalOf(p)) }))}">${icon("edit")} ${esc(money(bookingTotalOf(p)))}</span>` : ""}</td>
                            <td>${esc(fmtDateTime(p.paidAt || p.createdAt || ""))}<span class="cell-sub">${esc(p.paidAt ? t("paidTotal") : t("approve"))}</span></td>
                            <td>${payBadge(p.status)}</td>
                            <td class="row-actions"><div class="actions">${p.status === "pending" && p.method ? `<button class="act ok" data-pay-paid="${Number(p.id)}">${icon("check")} ${esc(t("markPaid"))}</button>` : ""}<button class="act icon-only" data-pay-edit="${Number(p.id)}" title="${esc(t("edit"))}" aria-label="${esc(t("edit"))}">${icon("edit")}</button></div></td>
                        </tr>`).join("")}</tbody>
                </table>` : emptyState("wallet", t("noPayments"))}
            </div>
        </div>`;
    if (focused) {
        const inp = $("#paymentSearch");
        inp.focus();
        inp.setSelectionRange(inp.value.length, inp.value.length);
    }
}

/* ================== Bảo trì ================== */

function renderMaintenance() {
    const host = $("#maintenancePage");
    const list = maintenance.filter(m => ui.maintTab === "all" || m.status === ui.maintTab)
        .sort((a, b) => String(b.startDate).localeCompare(String(a.startDate)));
    const cnt = (s) => maintenance.filter(m => m.status === s).length;
    const totalCost = maintenance.reduce((s, m) => s + (Number(m.cost) || 0), 0);

    host.innerHTML = `
        <div class="toolbar">
            <div class="toolbar-left">
                ${tabsHtml("maintTab", ui.maintTab, [["all", t("all"), maintenance.length], ["scheduled", t("scheduled"), cnt("scheduled")], ["in_progress", t("in_progress"), cnt("in_progress")], ["completed", t("completed"), cnt("completed")]])}
                <span class="muted">${esc(t("totalCost"))}: <strong>${esc(money(totalCost))}</strong></span>
            </div>
            <button class="btn btn-primary" id="addMaintBtn">${icon("plus")} ${esc(t("scheduleMaint"))}</button>
        </div>
        ${list.length ? `<div class="maint-grid">${list.map((m, i) => `
            <article class="maint-card" style="--i:${i}">
                <div class="maint-head">
                    <span class="stat-icon">${icon("wrench")}</span>
                    <div><h3>${esc(m.carName)}</h3><p>${esc(m.type)}</p></div>
                    ${statusBadge(m.status)}
                </div>
                ${m.note ? `<p class="maint-note">${esc(m.note)}</p>` : ""}
                <div class="maint-info">
                    <span>${icon("calendar")} ${esc(fmtDate(m.startDate))} → ${esc(fmtDate(m.endDate))}</span>
                    <strong>${esc(money(m.cost))}</strong>
                </div>
                <div class="actions">
                    ${m.status === "scheduled" ? `<button class="act" data-maint="in_progress" data-id="${Number(m.id)}">${icon("play")} ${esc(t("start"))}</button>` : ""}
                    ${m.status === "in_progress" ? `<button class="act ok" data-maint="completed" data-id="${Number(m.id)}">${icon("check")} ${esc(t("complete"))}</button>` : ""}
                    <button class="act danger icon-only" data-maint-delete="${Number(m.id)}" title="${esc(t("delete"))}" aria-label="${esc(t("delete"))}" style="margin-left:auto">${icon("trash")}</button>
                </div>
            </article>`).join("")}</div>` : `<div class="panel">${emptyState("wrench", t("noMaint"), t("noMaintHint"))}</div>`}`;
}

function openMaintModal() {
    $("#maintForm").reset();
    $("#m_car").innerHTML = cars.map(c => `<option value="${Number(c.id)}">${esc(c.name)} · ${esc(statusLabel(c.status))}</option>`).join("");
    const today = dayKey(new Date());
    $("#m_start").value = today;
    $("#m_end").value = today;
    $("#m_cost").value = 0;
    openModal("maintModal");
}

async function saveMaint(e) {
    e.preventDefault();
    const type = $("#m_type").value.trim();
    const start = $("#m_start").value, end = $("#m_end").value;
    if (!type) { $("#m_type").focus(); return showToast(t("maintTypeRequired"), "error"); }
    if (!start || !end || end < start) return showToast(t("maintDatesInvalid"), "error");
    const btn = $("#maintSaveBtn");
    setLoading(btn, true);
    try {
        const m = await api("/api/users.php?action=maintenance", {
            method: "POST",
            body: JSON.stringify({
                carId: Number($("#m_car").value), type, startDate: start, endDate: end,
                cost: Number($("#m_cost").value) || 0, note: $("#m_note").value.trim(), status: "scheduled"
            })
        });
        maintenance.push(m);
        closeModal("maintModal");
        showToast(t("maintAdded"), "success");
        renderEverything();
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        setLoading(btn, false);
    }
}

async function updateMaint(id, status) {
    try {
        const m = await api(`/api/users.php?action=maintenance&id=${Number(id)}`, { method: "PATCH", body: JSON.stringify({ status }) });
        const idx = maintenance.findIndex(x => x.id === id);
        if (idx >= 0) maintenance[idx] = m;
        const car = cars.find(c => c.id === m.carId);
        if (car) {
            if (status === "in_progress") car.status = "maintenance";
            else if (status === "completed" && car.status === "maintenance") car.status = "available";
        }
        showToast(t("maintUpdated", { status: statusLabel(status) }), "success");
        renderEverything();
    } catch (e) {
        showToast(e.message, "error");
    }
}

async function deleteMaint(id) {
    const m = maintenance.find(x => x.id === id);
    if (!m) return;
    const ok = await confirmDialog({ title: t("confirmDeleteMaint"), text: t("confirmDeleteMaintText", { type: m.type, car: m.carName }), okText: t("delete") });
    if (!ok) return;
    try {
        await api(`/api/users.php?action=maintenance&id=${Number(id)}`, { method: "DELETE" });
        maintenance = maintenance.filter(x => x.id !== id);
        showToast(t("maintDeleted"), "success");
        renderEverything();
    } catch (e) {
        showToast(e.message, "error");
    }
}

/* ================== Admin & mật khẩu ================== */

function renderAdminsList() {
    $("#adminsList").innerHTML = admins.map(a => {
        const isMe = currentAdmin && Number(a.id) === Number(currentAdmin.id);
        return `
        <div class="admin-row">
            <span class="avatar round">${esc(initials(a.name))}</span>
            <div><strong>${esc(a.name)}</strong><small>@${esc(a.username)}${a.email ? " · " + esc(a.email) : ""}</small></div>
            ${isMe ? `<span class="you-tag">${esc(t("you"))}</span>`
                : `<button class="act danger icon-only" data-admin-delete="${Number(a.id)}" title="${esc(t("delete"))}" aria-label="${esc(t("delete"))}">${icon("trash")}</button>`}
        </div>`;
    }).join("");
}

async function createAdmin(e) {
    e.preventDefault();
    const data = { name: $("#a_name").value.trim(), username: $("#a_user").value.trim(), email: $("#a_email").value.trim(), password: $("#a_pwd").value };
    if (!data.name || !data.username || data.password.length < 6) return showToast(t("adminMissing"), "error");
    const btn = $("#adminSaveBtn");
    setLoading(btn, true);
    try {
        const a = await api("/api/login.php?action=admins", { method: "POST", body: JSON.stringify(data) });
        admins.push(a);
        $("#newAdminForm").reset();
        renderAdminsList();
        showToast(t("adminCreated"), "success");
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        setLoading(btn, false);
    }
}

async function deleteAdmin(id) {
    const a = admins.find(x => Number(x.id) === Number(id));
    if (!a) return;
    const ok = await confirmDialog({ title: t("confirmDeleteAdmin", { name: a.name }), text: t("confirmDeleteAdminText"), okText: t("delete") });
    if (!ok) return;
    try {
        await api(`/api/login.php?action=admins&id=${Number(id)}`, { method: "DELETE" });
        admins = admins.filter(x => Number(x.id) !== Number(id));
        renderAdminsList();
        showToast(t("adminDeleted"), "success");
    } catch (err) {
        showToast(err.message, "error");
    }
}

function passwordStrength(p) {
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(score, 4);
}

async function changePassword(e) {
    e.preventDefault();
    const oldP = $("#pwdOld").value, newP = $("#pwdNew").value, newP2 = $("#pwdNew2").value;
    if (newP.length < 6) return showToast(t("pwdShort"), "error");
    if (newP !== newP2) return showToast(t("pwdMismatch"), "error");
    const btn = $("#pwdSaveBtn");
    setLoading(btn, true);
    try {
        await api("/api/login.php?action=change-password", { method: "POST", body: JSON.stringify({ oldPassword: oldP, newPassword: newP }) });
        closeModal("changePwdModal");
        showToast(t("pwdChanged"), "success");
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        setLoading(btn, false);
    }
}

/* ================== Điều hướng ================== */

const isMobile = () => window.matchMedia("(max-width: 960px)").matches;

function openSidebar() {
    $("#adminSidebar").classList.add("open");
    const overlay = $("#sidebarOverlay");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("show"));
    document.body.classList.add("no-scroll");
}

function closeSidebar() {
    $("#adminSidebar").classList.remove("open");
    const overlay = $("#sidebarOverlay");
    overlay.classList.remove("show");
    setTimeout(() => { if (!overlay.classList.contains("show")) overlay.hidden = true; }, 300);
    if (!$$(".modal:not(.hidden)").length) document.body.classList.remove("no-scroll");
}

function setPageTitle(name) {
    $("#pageTitle").textContent = t("page." + name);
    $("#pageSubtitle").textContent = t("page." + name + ".sub");
    document.title = `${t("page." + name)} · ${t("title")}`;
}

function openPage(name) {
    if (!$("#" + name + "Page")) return;
    currentPage = name;
    $$(".page").forEach(p => p.classList.toggle("page-active", p.id === name + "Page"));
    $$(".side-link[data-page]").forEach(l => l.classList.toggle("active", l.dataset.page === name));
    setPageTitle(name);
    if (name === "dashboard") renderDashboard();
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
    window.scrollTo({ top: 0 });
    if (isMobile()) closeSidebar();
}

/* ================== Sự kiện ================== */

function bindEvents() {
    // Đăng nhập
    $("#loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = $("#loginUsername").value.trim();
        const password = $("#loginPassword").value;
        const errBox = $("#loginError");
        errBox.classList.add("hidden");
        if (!username || !password) {
            errBox.innerHTML = `${icon("alert")}<span>${esc(t("loginMissing"))}</span>`;
            errBox.classList.remove("hidden");
            return;
        }
        const btn = $("#loginSubmitBtn");
        setLoading(btn, true);
        try {
            const res = await fetch("/api/login.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(serverMsg(body.error) || t("loginFail"));
            store(TOKEN_KEY, body.token);
            store(CURRENT_ADMIN_KEY, JSON.stringify(body.admin));
            currentAdmin = body.admin;
            $("#loginPassword").value = "";
            await startApp();
            showToast(t("loginOk"), "success");
        } catch (err) {
            errBox.innerHTML = `${icon("alert")}<span>${esc(err.message === "Failed to fetch" ? t("network") : err.message)}</span>`;
            errBox.classList.remove("hidden");
        } finally {
            setLoading(btn, false);
        }
    });

    $("#pwdToggle").onclick = () => {
        const inp = $("#loginPassword");
        const show = inp.type === "password";
        inp.type = show ? "text" : "password";
        $("#pwdToggle").innerHTML = icon(show ? "eye-off" : "eye");
        $("#pwdToggle").setAttribute("aria-label", show ? t("hidePwd") : t("showPwd"));
    };

    // Ngôn ngữ & giao diện
    $$("[data-lang-toggle]").forEach(b => b.onclick = () => setLang(lang === "en" ? "vi" : "en"));
    $$("[data-theme-toggle]").forEach(b => b.onclick = () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        setTheme(next);
        showToast(next === "dark" ? t("themeDark") : t("themeLight"));
    });
    window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", e => {
        if (!store(THEME_KEY)) setTheme(e.matches ? "dark" : "light", false);
    });

    // Sidebar
    $$(".side-link[data-page]").forEach(l => l.addEventListener("click", () => openPage(l.dataset.page)));
    $("#mobileMenu").onclick = openSidebar;
    $("#sidebarClose").onclick = closeSidebar;
    $("#sidebarOverlay").onclick = closeSidebar;
    $("#logoutBtn").onclick = () => logout();
    $("#refreshBtn").onclick = async () => {
        if (await loadAllData(true)) {
            renderEverything();
            updateSyncLabel();
            showToast(t("refreshed"), "success");
        }
    };
    document.addEventListener("click", e => {
        const btn = e.target.closest("[data-tier]");
        if (!btn) return;
        ui.customerTier = ui.customerTier === btn.dataset.tier ? "all" : btn.dataset.tier;
        renderCustomers();
    });
    $("#helpBtn").onclick = () => openHelp();
    $("#helpSideBtn").onclick = () => { if (isMobile()) closeSidebar(); openHelp(); };
    document.addEventListener("click", e => {
        const btn = e.target.closest("[data-hard-refresh]");
        if (!btn) return;
        e.preventDefault();
        showToast(t("refreshing"));
        hardRefresh();
    });
    $("#changePwdSideBtn").onclick = () => {
        $("#changePwdForm").reset();
        $("#pwdMeter span").style.width = "0";
        if (isMobile()) closeSidebar();
        openModal("changePwdModal");
    };
    $("#adminsSideBtn").onclick = () => {
        $("#newAdminForm").reset();
        renderAdminsList();
        if (isMobile()) closeSidebar();
        openModal("adminsModal");
    };

    // Form
    $("#carForm").addEventListener("submit", saveCar);
    $("#carImageUrl").addEventListener("input", e => setCarImagePreview(e.target.value));
    $("#carImagePreviewImg").addEventListener("error", () => setCarImagePreview(""));
    $("#carImageClearBtn").onclick = () => { $("#carImageUrl").value = ""; setCarImagePreview(""); };
    ["carName", "carBrand", "carType"].forEach(id => $("#" + id).addEventListener("input", refreshCarArt));
    $("#carColors").addEventListener("click", e => {
        const sw = e.target.closest("[data-color]");
        if (!sw) return;
        carColor = sw.dataset.color;
        renderColorSwatches();
        refreshCarArt();
    });

    // Duyệt đơn: chọn hình thức thanh toán và tình trạng thu tiền
    $("#approveMethods").addEventListener("click", e => {
        const btn = e.target.closest("[data-pay-method]");
        if (!btn) return;
        approveState.method = btn.dataset.payMethod;
        renderApproveControls();
    });
    $("#approveStatus").addEventListener("click", e => {
        const btn = e.target.closest("[data-pay-status]");
        if (!btn) return;
        approveState.status = btn.dataset.payStatus;
        renderApproveControls();
    });
    $("#approveForm").addEventListener("submit", submitApprove);

    // Sửa giao dịch
    $("#paymentMethods").addEventListener("click", e => {
        const btn = e.target.closest("[data-pay-method]");
        if (!btn) return;
        payEdit.method = btn.dataset.payMethod;
        renderPaymentControls();
    });
    $("#paymentStatus").addEventListener("click", e => {
        const btn = e.target.closest("[data-pay-status]");
        if (!btn) return;
        payEdit.status = btn.dataset.payStatus;
        renderPaymentControls();
    });
    $("#paymentAmount").addEventListener("input", () => { payEdit.sync = false; updateAmountHint(); });
    $("#paymentAmountHint").addEventListener("click", e => {
        if (!e.target.closest("#syncAmountBtn")) return;
        const p = payments.find(x => Number(x.id) === Number(payEdit.id));
        $("#paymentAmount").value = p ? bookingTotalOf(p) : 0;
        payEdit.sync = true;
        updateAmountHint();
    });
    $("#paymentForm").addEventListener("submit", savePayment);
    $("#maintForm").addEventListener("submit", saveMaint);
    $("#m_start").addEventListener("change", () => {
        $("#m_end").min = $("#m_start").value;
        if ($("#m_end").value < $("#m_start").value) $("#m_end").value = $("#m_start").value;
    });
    $("#changePwdForm").addEventListener("submit", changePassword);
    $("#pwdNew").addEventListener("input", e => {
        const s = passwordStrength(e.target.value);
        const colors = ["var(--red)", "var(--red)", "var(--orange)", "var(--blue)", "var(--green)"];
        const bar = $("#pwdMeter span");
        bar.style.width = (e.target.value ? Math.max(1, s) * 25 : 0) + "%";
        bar.style.background = colors[s];
    });
    $("#newAdminForm").addEventListener("submit", createAdmin);

    // Modal
    $$("[data-close]").forEach(b => b.addEventListener("click", () => closeModal(b.dataset.close)));
    $$(".modal").forEach(m => m.addEventListener("mousedown", e => { if (e.target === m) closeModal(m.id); }));

    // Ủy quyền sự kiện cho nội dung render động
    document.addEventListener("click", e => {
        const el = e.target.closest("[data-go], [data-act], [data-detail], .tab, [data-car-edit], [data-car-delete], [data-maint], [data-maint-delete], [data-admin-delete], [data-pay-paid], [data-pay-edit], #addCarBtn, #addMaintBtn, #exportBookings, #exportPayments, #exportCustomers");
        if (!el) return;

        if (el.matches(".tab")) {
            const group = el.closest("[data-tabs]")?.dataset.tabs;
            if (!group) return;
            ui[group] = group === "revenueRange" ? Number(el.dataset.value) : el.dataset.value;
            if (group === "revenueRange") renderDashboard();
            else if (group === "bookingTab") renderBookings();
            else if (group === "fleetStatus") renderFleet();
            else if (group === "paymentTab") renderPayments();
            else if (group === "maintTab") renderMaintenance();
            else if (group === "helpTab") renderHelp();
            return;
        }
        if (el.dataset.go) {
            if (el.dataset.tab) { ui.bookingTab = el.dataset.tab; renderBookings(); }
            openPage(el.dataset.go);
            return;
        }
        if (el.dataset.act) { e.stopPropagation(); bookingAction(el.dataset.act, el.dataset.id); return; }
        if (el.dataset.detail) { openBookingDetail(el.dataset.detail); return; }
        if (el.dataset.carEdit) { openCarModal(cars.find(c => c.id === Number(el.dataset.carEdit))); return; }
        if (el.dataset.carDelete) { deleteCar(Number(el.dataset.carDelete)); return; }
        if (el.dataset.maint) { updateMaint(Number(el.dataset.id), el.dataset.maint); return; }
        if (el.dataset.maintDelete) { deleteMaint(Number(el.dataset.maintDelete)); return; }
        if (el.dataset.adminDelete) { deleteAdmin(Number(el.dataset.adminDelete)); return; }
        if (el.dataset.payPaid) { markPaymentPaid(Number(el.dataset.payPaid)); return; }
        if (el.dataset.payEdit) { openPaymentModal(Number(el.dataset.payEdit)); return; }
        if (el.id === "addCarBtn") return openCarModal();
        if (el.id === "addMaintBtn") return openMaintModal();
        if (el.id === "exportBookings") {
            return downloadCsv("godrive-bookings.csv", [
                [t("code"), t("customer"), "Email", t("phone"), t("car"), t("pickup"), t("return"), t("total"), t("status")],
                ...bookings.map(b => [b.id, b.customerName, b.customerEmail || "", b.customerPhone || "", b.carName, b.startDate, b.endDate, b.total, statusLabel(b.status)])
            ]);
        }
        if (el.id === "exportPayments") {
            return downloadCsv("godrive-payments.csv", [
                [t("txn"), t("customer"), t("car"), t("method"), t("amount"), t("status"), t("approve"), t("paidTotal"), t("note")],
                ...payments.map(p => [p.txnCode, p.customerName, p.carName || "", methodLabel(p.method), p.amount, (p.status === "pending" ? t("pendingPay") : statusLabel(p.status)), p.createdAt || "", p.paidAt || "", p.note || ""])
            ]);
        }
        if (el.id === "exportCustomers") {
            return downloadCsv("godrive-customers.csv", [
                [t("rankCol"), t("customer"), "Email", t("phone"), t("joined"), t("bookingsCount"), t("spent"), t("tier")],
                ...rankedCustomers().map(c => [c.rank, c.name, c.email, c.phone || "", c.joinedAt, c.totalBookings || 0, c.totalSpent, statusLabel(c.tier)])
            ]);
        }
    });

    document.addEventListener("input", e => {
        const id = e.target.id;
        if (id === "bookingSearch") { ui.bookingSearch = e.target.value; renderBookings(); }
        if (id === "fleetSearch") { ui.fleetSearch = e.target.value; renderFleet(); }
        if (id === "customerSearch") { ui.customerSearch = e.target.value; renderCustomers(); }
        if (id === "paymentSearch") { ui.paymentSearch = e.target.value; renderPayments(); }
    });

    document.addEventListener("change", e => {
        if (e.target.dataset.carStatus) changeCarStatus(Number(e.target.dataset.carStatus), e.target.value);
    });

    document.addEventListener("keydown", e => {
        if (e.key === "Escape") {
            const open = $$(".modal:not(.hidden)");
            if (open.length) {
                if (open.some(m => m.id === "confirmModal")) $("#confirmCancel").click();
                else closeModal(open[open.length - 1].id);
            } else if (isMobile()) closeSidebar();
        }
        // Phím "/" để nhảy tới ô tìm kiếm của trang hiện tại
        if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement?.tagName || "")) {
            const search = $(`#${currentPage}Page input[type=search]`);
            if (search) { e.preventDefault(); search.focus(); }
        }
    });

    window.addEventListener("resize", () => { if (!isMobile()) closeSidebar(); });
    window.addEventListener("hashchange", () => {
        const name = location.hash.slice(1);
        if (name && name !== currentPage) openPage(name);
    });

    // Tự làm mới dữ liệu định kỳ khi tab đang mở và không có hộp thoại nào
    setInterval(async () => {
        updateSyncLabel();
        if (document.hidden || !dataLoaded || $$(".modal:not(.hidden)").length) return;
        if (lastSync && Date.now() - lastSync < AUTO_REFRESH_MS) return;
        if (document.activeElement?.matches("input, select, textarea")) return;
        if (await loadAllData()) renderEverything();
    }, 15000);
}

/* ================== Phiên bản & làm mới bộ nhớ đệm ================== */

const APP_VERSION = $('meta[name="app-version"]')?.content || "";

async function fetchServerVersion() {
    try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return null;
        const data = await res.json();
        return typeof data.version === "string" ? data.version : null;
    } catch (_) {
        return null;
    }
}

// Xóa bộ nhớ đệm của trang rồi tải lại, dùng khi vừa upload bản mới lên hosting
async function hardRefresh() {
    try {
        if ("caches" in window) for (const key of await caches.keys()) await caches.delete(key);
    } catch (_) { }
    try {
        (await navigator.serviceWorker?.getRegistrations?.())?.forEach(r => r.unregister());
    } catch (_) { }
    const urls = new Set(["/", "/index.html", "/admin", "/admin.html", "/css/style.css", "/css/admin.css", "/js/app.js", "/js/admin.js",
        ...$$('link[rel="stylesheet"][href^="/"], script[src^="/"]').map(el => el.getAttribute("href") || el.getAttribute("src"))]);
    await Promise.allSettled([...urls].map(u => fetch(u, { cache: "reload", credentials: "same-origin" })));
    const url = new URL(location.href);
    url.searchParams.set("_r", Date.now().toString(36));
    location.replace(url.toString());
}

function stripRefreshParam() {
    const url = new URL(location.href);
    if (!url.searchParams.has("_r")) return;
    url.searchParams.delete("_r");
    history.replaceState(null, "", url.pathname + url.search + url.hash);
}

// Nếu server đã có bản mới mà trình duyệt vẫn giữ bản cũ thì tự tải lại một lần
async function checkForUpdate() {
    const server = await fetchServerVersion();
    if (!server || !APP_VERSION || server === APP_VERSION) return;
    const key = "godrive_reloaded_for";
    let done = null;
    try { done = sessionStorage.getItem(key); } catch (_) { }
    if (done === server) return;
    try { sessionStorage.setItem(key, server); } catch (_) { }
    hardRefresh();
}

/* ================== Hướng dẫn ================== */

// Nội dung hướng dẫn (HTML tĩnh do mình viết, không chứa dữ liệu người dùng)
const ADMIN_HELP = {
    vi: [
        ["start", "Bắt đầu", `
            <ol class="help-list">
                <li><b>Đổi mật khẩu ngay</b> nếu vẫn dùng <code>admin123</code>: thanh bên trái → <em>Đổi mật khẩu</em>.</li>
                <li><b>Tổng quan</b> cho biết doanh thu, đơn chờ duyệt và việc cần làm. Bấm thẻ <em>Đơn chờ duyệt</em> để xử lý ngay.</li>
                <li>Dữ liệu tự làm mới mỗi phút. Bấm <b>↻</b> trên thanh trên cùng để làm mới ngay.</li>
                <li>Nút 🌐 đổi ngôn ngữ Việt/Anh, nút ☀/🌙 đổi giao diện sáng/tối.</li>
                <li>Phím tắt: <kbd>/</kbd> nhảy tới ô tìm kiếm, <kbd>Esc</kbd> đóng hộp thoại.</li>
            </ol>`],
        ["bookings", "Đơn đặt xe", `
            <ol class="help-list">
                <li>Đơn mới có trạng thái <b>Chờ duyệt</b>. Bấm vào dòng để xem số điện thoại, gọi cho khách rồi bấm <b>Duyệt</b>.</li>
                <li>Khi duyệt, <b>bắt buộc chọn hình thức thanh toán</b> (tiền mặt, chuyển khoản, thẻ, MoMo, ZaloPay, VNPay) và cho biết đã thu tiền hay chưa. Giao dịch được ghi vào mục <b>Thanh toán</b> từ lúc này.</li>
                <li>Khách trả tiền sau: vào <b>Thanh toán</b> → bấm <b>Xác nhận đã thu</b>, hoặc bấm ✎ để sửa hình thức, trạng thái, số tiền, thời điểm thu. Hủy đơn đã thu tiền thì giao dịch tự chuyển sang <b>Đã hoàn tiền</b>.</li>
                <li>Khi giao xe cho khách, bấm <b>Bàn giao</b>: xe chuyển sang <b>Đang thuê</b>.</li>
                <li>Khi khách trả xe, vào <b>Đội xe</b> và đổi trạng thái xe về <b>Sẵn sàng</b>.</li>
                <li>Bấm <b>✕</b> để hủy đơn. Xe đang thuê sẽ tự trở về Sẵn sàng.</li>
                <li><b>Xuất CSV</b> để mở danh sách đơn bằng Excel.</li>
            </ol>`],
        ["fleet", "Đội xe & bảo trì", `
            <ol class="help-list">
                <li><b>+ Thêm xe</b>: nhập tên, hãng, loại, số chỗ, giá/ngày, địa điểm. Ảnh xe là link bắt đầu bằng <code>https://</code>. Chưa có ảnh thì chọn <b>màu xe</b>, trang khách sẽ hiện hình minh họa theo dáng xe.</li>
                <li>Tên <b>hãng</b> được dùng cho bộ lọc hãng xe trên trang khách, hãy viết thống nhất (ví dụ luôn là "Toyota").</li>
                <li>Tích <b>xe nổi bật</b> để xe có nhãn "Được yêu thích" và hiện trước trên trang khách.</li>
                <li><b>Bảo trì</b>: Lên lịch → <b>Bắt đầu</b> (xe tạm ẩn khỏi trang khách) → <b>Hoàn thành</b> (xe sẵn sàng trở lại).</li>
            </ol>`],
        ["update", "Cập nhật website", `
            <ol class="help-list">
                <li>Tạo gói <code>godrive-deploy.zip</code> mới bằng cách chạy <code>build-deploy.ps1</code> trong thư mục dự án. Gói này <b>không chứa thư mục data/</b>.</li>
                <li>InfinityFree → <b>File Manager</b> → mở <code>htdocs</code> → <b>Upload</b> file zip.</li>
                <li>Chọn file zip → <b>Extract</b> vào <code>htdocs</code> → cho phép <b>Overwrite</b> → xóa file zip.</li>
                <li><b>Không bao giờ upload thư mục data/</b>: sẽ ghi đè và mất toàn bộ đơn đặt xe thật.</li>
                <li>Bấm <b>Tải lại bản mới nhất</b> bên dưới để trình duyệt bỏ bản cũ trong bộ nhớ đệm.</li>
            </ol>`]
    ],
    en: [
        ["start", "Getting started", `
            <ol class="help-list">
                <li><b>Change the password now</b> if you still use <code>admin123</code>: left sidebar → <em>Change password</em>.</li>
                <li>The <b>Dashboard</b> shows revenue, pending bookings and your to-do list. Click the <em>Pending bookings</em> card to handle them.</li>
                <li>Data refreshes every minute. Click <b>↻</b> in the top bar to refresh immediately.</li>
                <li>Use 🌐 to switch Vietnamese/English and ☀/🌙 for light/dark mode.</li>
                <li>Shortcuts: <kbd>/</kbd> jumps to the search box, <kbd>Esc</kbd> closes dialogs.</li>
            </ol>`],
        ["bookings", "Bookings", `
            <ol class="help-list">
                <li>New bookings are <b>Pending</b>. Click a row to see the phone number, call the customer, then click <b>Approve</b>.</li>
                <li>When approving, you <b>must choose the payment method</b> (cash, bank transfer, card, MoMo, ZaloPay, VNPay) and whether it has been collected. The transaction is recorded under <b>Payments</b> from that moment.</li>
                <li>Paid later? Go to <b>Payments</b> → <b>Mark as paid</b>, or click ✎ to edit the method, status, amount and collection time. Cancelling a paid booking automatically marks the transaction as <b>Refunded</b>.</li>
                <li>When handing the car over, click <b>Hand over</b>: the car becomes <b>On rent</b>.</li>
                <li>When the customer returns the car, go to <b>Fleet</b> and set the car back to <b>Available</b>.</li>
                <li>Click <b>✕</b> to cancel a booking. A car on rent goes back to Available automatically.</li>
                <li><b>Export CSV</b> to open the booking list in Excel.</li>
            </ol>`],
        ["fleet", "Fleet & maintenance", `
            <ol class="help-list">
                <li><b>+ Add car</b>: enter the name, brand, type, seats, daily rate and location. The photo is a URL starting with <code>https://</code>. No photo? Pick a <b>car color</b> and the customer site shows an illustration of that body type.</li>
                <li>The <b>brand</b> name powers the brand filter on the customer site, so keep it consistent (e.g. always "Toyota").</li>
                <li>Tick <b>featured</b> to give a car the "Popular" badge and show it first on the customer site.</li>
                <li><b>Maintenance</b>: Schedule → <b>Start</b> (car hidden from the customer site) → <b>Complete</b> (car available again).</li>
            </ol>`],
        ["update", "Updating the website", `
            <ol class="help-list">
                <li>Build a new <code>godrive-deploy.zip</code> by running <code>build-deploy.ps1</code> in the project folder. The package <b>does not include the data/ folder</b>.</li>
                <li>InfinityFree → <b>File Manager</b> → open <code>htdocs</code> → <b>Upload</b> the zip.</li>
                <li>Select the zip → <b>Extract</b> into <code>htdocs</code> → allow <b>Overwrite</b> → delete the zip.</li>
                <li><b>Never upload the data/ folder</b>: it would overwrite and erase all real bookings.</li>
                <li>Click <b>Load latest version</b> below so the browser drops the old cached files.</li>
            </ol>`]
    ]
};

function renderHelp() {
    const sections = ADMIN_HELP[lang === "en" ? "en" : "vi"];
    const current = sections.find(s => s[0] === ui.helpTab) || sections[0];
    $("#helpTabs").innerHTML = tabsHtml("helpTab", current[0], sections.map(([id, title]) => [id, title]));
    let html = current[2];
    if (current[0] === "update") {
        html += `
            <div class="version-box">
                <div class="version-row"><span>${esc(t("versionUsing"))}</span><strong>${esc(APP_VERSION || "—")}</strong></div>
                <div class="version-row"><span>${esc(t("versionServer"))}</span><strong id="serverVersion">${esc(t("versionChecking"))}</strong></div>
                <p class="version-status" id="versionStatus"></p>
                <button type="button" class="btn btn-primary full" data-hard-refresh>${icon("cloud")} ${esc(t("loadLatest"))}</button>
            </div>`;
    }
    $("#helpBody").innerHTML = html;
    if (current[0] === "update") {
        fetchServerVersion().then(server => {
            const sv = $("#serverVersion"), st = $("#versionStatus");
            if (!sv || !st) return;
            sv.textContent = server || "—";
            st.className = "version-status " + (!server ? "warn" : server === APP_VERSION ? "ok" : "warn");
            st.textContent = !server ? t("versionMissing") : server === APP_VERSION ? t("versionSame") : t("versionNew");
        });
    }
}

function openHelp(tab) {
    if (tab) ui.helpTab = tab;
    renderHelp();
    openModal("helpModal");
}

/* ================== Khởi động ================== */

async function startApp() {
    updateAdminProfile();
    showApp();
    const start = location.hash.slice(1);
    openPage($("#" + start + "Page") ? start : "dashboard");
    renderDashboard();
    if (await loadAllData()) {
        renderEverything();
        updateSyncLabel();
    }
    // Lần đầu đăng nhập trên trình duyệt này: tự mở hướng dẫn
    if (!store("godrive_admin_help_seen")) {
        store("godrive_admin_help_seen", "1");
        openHelp("start");
    }
}

(async function boot() {
    stripRefreshParam();
    checkForUpdate();
    applyStaticTranslations();
    bindEvents();
    if (!getToken()) { showLogin(); return; }
    try {
        currentAdmin = JSON.parse(store(CURRENT_ADMIN_KEY) || "null");
        currentAdmin = await api("/api/login.php?action=me");
        store(CURRENT_ADMIN_KEY, JSON.stringify(currentAdmin));
        await startApp();
    } catch (err) {
        if (getToken()) logout(true);
        showToast(err.message, "error");
    }
})();
