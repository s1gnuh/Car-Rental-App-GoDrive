/* ================== GoDrive - minh họa xe (SVG) ==================
   Vẽ xe nhìn ngang theo dáng xe (Sedan / SUV / Hatchback) và màu sơn.
   Dùng cho thẻ xe chưa có ảnh ở trang khách, popup chi tiết và trang admin.
   CarArt.svg(car, { spin, road, className }) trả về chuỗi <svg>. */
(function (global) {
    const COLORS = {
        purple: "#6a4ff0",
        blue: "#2563eb",
        red: "#dc2a3f",
        white: "#eef1f6",
        black: "#2a2c38",
        silver: "#a9b2c3",
        teal: "#0f9f8f",
        orange: "#f2762e"
    };
    const AUTO_ORDER = ["blue", "red", "white", "black", "silver", "teal", "purple", "orange"];

    // Màu sơn: lấy theo trường "color" của xe, nếu không có thì chọn cố định theo tên xe
    function colorKey(car) {
        const key = String(car?.color || "").toLowerCase();
        if (COLORS[key]) return key;
        const name = String(car?.name || car?.brand || "");
        let h = 0;
        for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
        return AUTO_ORDER[h % AUTO_ORDER.length];
    }

    // Toạ độ trong khung 400 x 170, mặt đất ở y ≈ 152
    const SHAPES = {
        sedan: {
            wheels: [100, 300], wy: 126, r: 24,
            body: "M30 130C20 130 15 124 15 116L16 104C17 96 22 91 32 89L108 82C126 68 144 57 166 53C196 48 226 48 250 52C268 56 284 68 302 81L358 89C376 92 386 100 387 110L388 122C388 127 384 130 378 130Z",
            glass: "M122 82C138 70 152 62 170 59C196 55 224 55 246 58C258 60 272 70 288 81Z",
            pillars: ["M207 56L204 82"],
            seams: ["M134 85C132 100 133 114 134 126", "M206 84L206 129", "M286 85L281 106"],
            handles: [[154, 91], [230, 91]],
            head: "M370 96C378 97 384 101 386 106L372 106C368 104 366 99 370 96Z",
            tail: "M16 100L30 96L32 104L16 107Z",
            mirror: "M290 80L300 78C304 78 306 82 302 84L292 85Z",
            rocker: "M129 121H271V130H129Z",
            line: "M24 99C120 93 280 93 384 101"
        },
        suv: {
            wheels: [98, 304], wy: 124, r: 27,
            body: "M28 128C18 128 13 122 13 114L14 70C14 60 19 52 30 50L64 40C70 37 78 36 88 36L236 36C252 36 264 42 276 52L306 76L360 84C376 87 386 96 387 108L388 120C388 125 384 128 378 128Z",
            glass: "M34 76L40 54C42 48 48 44 56 43L232 43C246 43 256 48 266 56L290 76Z",
            pillars: ["M120 43L118 76", "M202 43L200 76"],
            seams: ["M136 78L136 118", "M202 78L202 118", "M292 78L287 100"],
            handles: [[158, 86], [232, 86]],
            head: "M366 88C376 89 384 94 386 100L370 101C366 98 364 92 366 88Z",
            tail: "M14 72L23 72L23 92L14 92Z",
            mirror: "M294 74L306 72C310 72 312 77 307 79L296 80Z",
            rocker: "M126 114H276V128H126Z",
            line: "M16 93C130 87 280 87 386 97",
            rails: "M76 37L82 31.5H220L226 37"
        },
        hatchback: {
            wheels: [112, 292], wy: 126, r: 23,
            body: "M58 130C48 130 44 124 44 116L46 82C46 72 52 64 62 61L92 50C102 46 114 44 128 44L222 44C238 44 252 50 264 60L292 82L338 90C352 93 360 101 360 111L360 122C360 127 356 130 350 130Z",
            glass: "M66 82L74 63C78 56 86 52 98 51L218 51C232 51 244 56 254 64L276 82Z",
            pillars: ["M178 51L177 82"],
            seams: ["M146 85L145 102", "M177 84L177 129", "M279 85L274 102"],
            handles: [[152, 90], [206, 90]],
            head: "M344 96C352 98 358 102 359 107L346 107C342 105 340 100 344 96Z",
            tail: "M46 86L56 86L56 100L46 100Z",
            mirror: "M276 80L286 78C290 78 292 82 288 84L278 85Z",
            rocker: "M139 121H265V130H139Z",
            line: "M48 99C140 93 260 93 358 101"
        }
    };

    function shapeOf(car) {
        const type = String(car?.type || "").toLowerCase();
        return SHAPES[type] ? type : "sedan";
    }

    function wheel(cx, cy, r) {
        const rim = r * 0.6;
        let spokes = "";
        for (let i = 0; i < 5; i++) {
            const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
            const x = (cx + Math.cos(a) * rim * 0.92).toFixed(1);
            const y = (cy + Math.sin(a) * rim * 0.92).toFixed(1);
            spokes += `M${cx} ${cy}L${x} ${y}`;
        }
        return `<g class="ca-wheel">
            <circle cx="${cx}" cy="${cy}" r="${r}" fill="#14141c"/>
            <circle cx="${cx}" cy="${cy}" r="${r - 3.5}" fill="none" stroke="#2c2c38" stroke-width="2"/>
            <circle cx="${cx}" cy="${cy}" r="${rim}" fill="url(#caRim)"/>
            <path d="${spokes}" stroke="#7d8399" stroke-width="${(r * 0.16).toFixed(1)}" stroke-linecap="round"/>
            <circle cx="${cx}" cy="${cy}" r="${(r * 0.17).toFixed(1)}" fill="#3a3d4d"/>
        </g>`;
    }

    // Hốc bánh xe: nửa hình tròn phía trên tâm bánh, khoét vào thân xe
    function well(cx, cy, R) {
        return `<path d="M${cx - R} ${cy + 5}L${cx - R} ${cy}A${R} ${R} 0 0 1 ${cx + R} ${cy}L${cx + R} ${cy + 5}Z" fill="#0c0c13"/>`;
    }

    function svg(car, opts = {}) {
        ensureDefs();
        const s = SHAPES[shapeOf(car)];
        const paint = COLORS[colorKey(car)];
        const light = colorKey(car) === "white" || colorKey(car) === "silver";
        const seam = light ? "rgba(20,24,40,.28)" : "rgba(0,0,0,.32)";
        const R = s.r + 5;
        const label = String(car?.name || "").replace(/[&<>"']/g, "");
        const cls = ["ca", opts.spin ? "ca-spin" : "", opts.className || ""].join(" ").trim();
        return `<svg class="${cls}" viewBox="0 0 400 170" role="img" aria-label="${label}" focusable="false">
            ${opts.road ? `<path class="ca-road" d="M-60 163H460" stroke-width="3" stroke-dasharray="26 18"/>` : ""}
            <ellipse cx="${(s.wheels[0] + s.wheels[1]) / 2}" cy="${s.wy + s.r + 2}" rx="${(s.wheels[1] - s.wheels[0]) / 2 + 92}" ry="9" fill="url(#caShadow)"/>
            <g class="ca-body">
                ${s.rails ? `<path d="${s.rails}" fill="none" stroke="#1c1c26" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>` : ""}
                <path d="${s.body}" fill="${paint}"/>
                <path d="${s.body}" fill="url(#caShine)"/>
                <path d="${s.body}" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="1"/>
                <path d="${s.glass}" fill="url(#caGlass)"/>
                <path d="${s.glass}" fill="url(#caGlare)"/>
                ${s.pillars.map(p => `<path d="${p}" stroke="${paint}" stroke-width="7" stroke-linecap="round"/><path d="${p}" stroke="rgba(0,0,0,.35)" stroke-width="7" stroke-linecap="round"/>`).join("")}
                <path d="${s.line}" fill="none" stroke="rgba(255,255,255,.38)" stroke-width="1.5"/>
                <path d="${s.seams.join("")}" fill="none" stroke="${seam}" stroke-width="1.4"/>
                ${s.handles.map(([x, y]) => `<rect x="${x}" y="${y}" width="18" height="4" rx="2" fill="${seam}"/>`).join("")}
                <path d="${s.rocker}" fill="rgba(0,0,0,.2)"/>
                <path d="${s.mirror}" fill="${paint}"/><path d="${s.mirror}" fill="rgba(0,0,0,.22)"/>
                <path d="${s.head}" fill="#fff6cf"/>
                <path d="${s.tail}" fill="#ff3b55"/>
                ${well(s.wheels[0], s.wy, R)}${well(s.wheels[1], s.wy, R)}
            </g>
            ${wheel(s.wheels[0], s.wy, s.r)}${wheel(s.wheels[1], s.wy, s.r)}
        </svg>`;
    }

    // Gradient dùng chung, đặt một lần trong <body>. Không dùng display:none vì
    // trình duyệt sẽ không vẽ gradient nằm trong phần tử bị ẩn.
    function ensureDefs() {
        if (document.getElementById("caDefs") || !document.body) return;
        const holder = document.createElement("div");
        holder.innerHTML = `<svg id="caDefs" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false">
            <defs>
                <linearGradient id="caShine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#fff" stop-opacity=".42"/>
                    <stop offset=".38" stop-color="#fff" stop-opacity=".06"/>
                    <stop offset=".62" stop-color="#000" stop-opacity="0"/>
                    <stop offset="1" stop-color="#000" stop-opacity=".32"/>
                </linearGradient>
                <linearGradient id="caGlass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" style="stop-color:var(--ca-glass-1,#dbe6f7)"/>
                    <stop offset="1" style="stop-color:var(--ca-glass-2,#7f93b6)"/>
                </linearGradient>
                <linearGradient id="caGlare" x1="0" y1="0" x2="1" y2="0">
                    <stop offset=".3" stop-color="#fff" stop-opacity="0"/>
                    <stop offset=".36" stop-color="#fff" stop-opacity=".45"/>
                    <stop offset=".46" stop-color="#fff" stop-opacity=".12"/>
                    <stop offset=".5" stop-color="#fff" stop-opacity="0"/>
                </linearGradient>
                <radialGradient id="caRim" cx=".4" cy=".35" r=".7">
                    <stop offset="0" stop-color="#f1f3f8"/>
                    <stop offset="1" stop-color="#9aa1b4"/>
                </radialGradient>
                <radialGradient id="caShadow" cx=".5" cy=".5" r=".5">
                    <stop offset="0" stop-color="#000" stop-opacity=".38"/>
                    <stop offset="1" stop-color="#000" stop-opacity="0"/>
                </radialGradient>
            </defs>
        </svg>`;
        document.body.prepend(holder.firstElementChild);
    }

    global.CarArt = { COLORS, colorKey, shapeOf, svg, ensureDefs };
})(window);
