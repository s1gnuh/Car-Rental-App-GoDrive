/* ================== GoDrive - logo hãng xe (PNG) ==================
   Trả về thẻ <img> logo chính thức (PNG, nền trong suốt) cho các hãng
   xe hiện có trong đội xe, lấy từ img/brands/. Hãng chưa có file logo
   riêng sẽ dùng chữ cái đầu của tên hãng làm huy hiệu tạm.
   BrandLogos.mark(brandName) trả về chuỗi HTML. */
(function (global) {
    function esc(value) {
        return String(value).replace(/[&<>"']/g, ch => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[ch]));
    }

    // Tên file PNG trong img/brands/: chỉ phần biểu tượng (icon), không kèm tên hãng.
    // Nguồn: Wikimedia Commons (Toyota, VinFast) và Simple Icons - huy hiệu chính hãng hiện hành.
    const LOGOS = {
        toyota: "toyota.png",
        honda: "honda.png",
        mazda: "mazda.png",
        hyundai: "hyundai.png",
        kia: "kia.png",
        vinfast: "vinfast.png"
    };

    function key(name) {
        return String(name || "").trim().toLowerCase();
    }

    // Huy hiệu tạm (chữ cái đầu) cho hãng chưa có file logo trong img/brands/
    function fallback(name) {
        const letter = esc(String(name || "?").trim().charAt(0).toUpperCase() || "?");
        return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <text x="32" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="28" fill="#6a4ff0">${letter}</text>
        </svg>`;
    }

    function mark(name) {
        const file = LOGOS[key(name)];
        if (!file) return fallback(name);
        return `<img src="/img/brands/${file}" alt="" loading="lazy" />`;
    }

    global.BrandLogos = { mark };
})(window);
