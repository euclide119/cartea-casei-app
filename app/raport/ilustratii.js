/* Raport _ Cartea Casei - ilustratii pe capitole (Manu, 23.10.2026): fiecare capitol are un desen care duce imaginatia unde trebuie:
   seismograf, difuzor, autobuz, soare 3D cu nori, panou + baterie + masina electrica, teanc de bani, doi oameni in fata casei...
   Desene SVG vectoriale, in acelasi stil (plat, cu umbre moi si o culoare de accent pe capitol); se scaleaza fara pierdere si intra in PDF.
   window.ILU = { desen(k, w) -> svg, COL[k] }. Fara text in desene: textul vine din raport. */
(function () {
  "use strict";
  const COL = {
    inundatii: "#1f6fd1", seismic: "#b23b3b", alunecari: "#8a5a2b", zgomot: "#6d3fc4", aer: "#2a9d8f", urbanism: "#c86a0a", autorizatii: "#d98e04",
    zonare: "#4a6fa5", monumente: "#8e5b3a", arii_protejate: "#2e7d32", facilitati: "#e0567b", transport: "#1565c0", scoli: "#f28c28", populatie: "#5b6ea6",
    insorire: "#f4a300", pv: "#0f8f6a", costuri: "#2e7d4f", negociere: "#4a5a78", evaluare: "#7a4ea3", surse: "#5b6275", stare: "#5b6275", rezumat: "#b86e00"
  };
  const G = (id, a, b, x2 = "0", y2 = "1") => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const R = (id, a, b) => `<radialGradient id="${id}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
  const SH = (x, y, w, h, op = .12) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="${h}" fill="#000" opacity="${op}"/>`;
  const casa = (x, y, s = 1, c = "#f5f1e8", r = "#b23b3b") =>
    `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-26 0h52v30h-52z" fill="${c}" stroke="#2a2a2a" stroke-width="1.4"/><path d="M-32 2L0-24 32 2z" fill="${r}" stroke="#2a2a2a" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<rect x="-18" y="8" width="11" height="10" fill="#9fd0ff" stroke="#2a2a2a" stroke-width="1"/><rect x="7" y="8" width="11" height="10" fill="#9fd0ff" stroke="#2a2a2a" stroke-width="1"/><rect x="-5" y="14" width="10" height="16" fill="#6b4a2b" stroke="#2a2a2a" stroke-width="1"/><rect x="12" y="-20" width="6" height="12" fill="#6b4a2b"/></g>`;
  const om = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="0" cy="-22" r="7" fill="#f1c9a5"/><path d="M-9-12h18l4 24h-6l-2-6h-10l-2 6h-6z" fill="${c}"/><path d="M-5 12l-2 16h5l2-16zM3 12l2 16h5l-2-16z" fill="#2f3b52"/></g>`;
  const nor = (x, y, s = 1, c = "#fff") => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="22" ry="11" fill="${c}"/><circle cx="-8" cy="-6" r="10" fill="${c}"/><circle cx="6" cy="-8" r="12" fill="${c}"/><circle cx="16" cy="-2" r="8" fill="${c}"/></g>`;

  const D = {
    inundatii: () => `<defs>${G("iw", "#5fb3ff", "#1f6fd1")}${G("isk", "#e8f3ff", "#cfe6ff")}</defs><rect width="200" height="140" rx="14" fill="url(#isk)"/>
      <path d="M0 78h200v62H0z" fill="url(#iw)"/><path d="M0 84q25-10 50 0t50 0 50 0 50 0v8q-25 10-50 0t-50 0-50 0-50 0z" fill="#fff" opacity=".35"/>
      <path d="M0 102q25-10 50 0t50 0 50 0 50 0v8q-25 10-50 0t-50 0-50 0-50 0z" fill="#fff" opacity=".22"/>
      <path d="M30 80q20-30 70-30t70 30z" fill="#7ea36b"/>${casa(100, 52, 1.1)}<path d="M60 70l8-14 6 14z" fill="#3f7a3a"/><path d="M135 72l8-16 7 16z" fill="#3f7a3a"/>
      <path d="M20 116c6-4 12-4 18 0M44 124c6-4 12-4 18 0M150 118c6-4 12-4 18 0" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`,
    seismic: () => `<defs>${G("sp", "#fffdf6", "#f3eedd")}</defs><rect width="200" height="140" rx="14" fill="#f7eded"/>
      <rect x="20" y="22" width="160" height="96" rx="6" fill="url(#sp)" stroke="#2a2a2a" stroke-width="1.6"/>
      ${[40, 56, 72, 88, 104].map(y => `<line x1="24" x2="176" y1="${y}" y2="${y}" stroke="#e3d9c6" stroke-width="1"/>`).join("")}
      <path d="M24 70h30l4-6 4 10 4-40 5 72 5-50 4 28 4-14 5 8 4-4h20l3-8 3 16 3-28 4 40 4-26 3 10 3-6h30" fill="none" stroke="#b23b3b" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
      <rect x="150" y="14" width="10" height="20" rx="2" fill="#2a2a2a"/><path d="M155 34v38" stroke="#2a2a2a" stroke-width="2"/><circle cx="155" cy="72" r="3.5" fill="#b23b3b" stroke="#2a2a2a" stroke-width="1.2"/>
      <rect x="20" y="118" width="160" height="8" rx="3" fill="#2a2a2a"/>${SH(100, 132, 60, 4)}`,
    alunecari: () => `<defs>${G("ag", "#e9f2e3", "#d7e8cf")}</defs><rect width="200" height="140" rx="14" fill="url(#ag)"/>
      <path d="M0 120L0 70Q60 40 110 60T200 50V120z" fill="#c9a06a"/><path d="M0 120L0 86Q60 60 110 78T200 70V120z" fill="#a9784a"/><path d="M0 120L0 100Q60 80 110 94T200 90V120z" fill="#7c5634"/>
      <path d="M0 70Q60 40 110 60T200 50" fill="none" stroke="#5f8f3f" stroke-width="7" stroke-linecap="round"/>
      <path d="M118 56c6 10 4 20-6 30M126 54c8 12 8 24-2 34" stroke="#fff" stroke-width="1.6" fill="none" stroke-dasharray="3 3" opacity=".9"/>
      ${casa(60, 50, .8)}<path d="M140 40l6-12 6 12z" fill="#2e7d32"/><path d="M155 36l7-14 7 14z" fill="#2e7d32"/><rect x="0" y="120" width="200" height="20" fill="#5a3f28"/>`,
    zgomot: () => `<defs>${G("zg", "#f1ecfb", "#e2d8f5")}</defs><rect width="200" height="140" rx="14" fill="url(#zg)"/>
      <rect x="30" y="40" width="40" height="60" rx="6" fill="#2a2a2a"/><circle cx="50" cy="60" r="9" fill="#6d3fc4"/><circle cx="50" cy="84" r="6" fill="#6d3fc4"/>
      <path d="M92 70a22 22 0 0 1 0 0M92 52a26 26 0 0 1 0 36M108 40a44 44 0 0 1 0 60M124 28a62 62 0 0 1 0 84" fill="none" stroke="#6d3fc4" stroke-width="5" stroke-linecap="round" opacity=".9"/>
      <path d="M140 16a80 80 0 0 1 0 108" fill="none" stroke="#6d3fc4" stroke-width="5" stroke-linecap="round" opacity=".45"/>${SH(50, 108, 28, 5)}`,
    aer: () => `<defs>${G("ae", "#e6f7f4", "#cdeee8")}</defs><rect width="200" height="140" rx="14" fill="url(#ae)"/>
      <path d="M30 60c20-8 40-8 60 0M24 80c30-10 60-10 90 0M40 100c20-8 40-8 60 0" fill="none" stroke="#2a9d8f" stroke-width="4" stroke-linecap="round" opacity=".55"/>
      <path d="M150 30c-30 0-48 24-48 50 0 10 4 20 12 28 2-26 10-46 36-62-14 18-22 40-24 64 30-4 44-30 44-56 0-8-2-16-6-24z" fill="#2e8b57"/><path d="M150 30c-18 18-28 40-32 70" stroke="#1f6b42" stroke-width="2" fill="none"/>
      ${nor(60, 36, .8, "#fff")}`,
    urbanism: () => `<defs>${G("ub", "#fff6e9", "#ffe9cc")}</defs><rect width="200" height="140" rx="14" fill="url(#ub)"/>
      <rect x="30" y="20" width="140" height="100" fill="#fff" stroke="#c86a0a" stroke-width="2"/><rect x="30" y="106" width="140" height="14" fill="#cfcfcf"/>
      <rect x="58" y="44" width="84" height="48" fill="#ffd9a8" stroke="#c86a0a" stroke-width="2"/>
      <path d="M44 44v48M58 30h84M156 44v48M100 92v14" stroke="#2a2a2a" stroke-width="1" stroke-dasharray="3 2"/>
      <path d="M44 48l0-0M40 44h8M40 92h8M58 26v8M142 26v8M152 44h8M152 92h8M96 106h8" stroke="#2a2a2a" stroke-width="1.2"/>
      <path d="M44 48v40M62 30h76M156 48v40M100 96v8" stroke="#2a2a2a" stroke-width="1.2" marker-start="url(#ar)" marker-end="url(#ar)"/>
      <circle cx="100" cy="68" r="3" fill="#c86a0a"/>`,
    autorizatii: () => `<defs>${G("au", "#fff9e6", "#fdefc2")}</defs><rect width="200" height="140" rx="14" fill="url(#au)"/>
      <rect x="110" y="60" width="60" height="60" fill="#e9e4d8" stroke="#2a2a2a" stroke-width="1.4"/>${[70, 86, 102].map(y => `<rect x="118" y="${y}" width="10" height="9" fill="#9fd0ff"/><rect x="136" y="${y}" width="10" height="9" fill="#9fd0ff"/><rect x="154" y="${y}" width="10" height="9" fill="#9fd0ff"/>`).join("")}
      <path d="M40 120V30M34 120h12" stroke="#d98e04" stroke-width="5"/><path d="M26 30h110M40 30l-8 10M48 30l8 10M60 30l-8 10M68 30l8 10M80 30l-8 10M88 30l8 10M100 30l-8 10M108 30l8 10" stroke="#d98e04" stroke-width="3"/>
      <path d="M118 30v26" stroke="#2a2a2a" stroke-width="1.5"/><rect x="110" y="52" width="16" height="10" fill="#b23b3b"/><rect x="24" y="24" width="28" height="12" fill="#2a2a2a"/>${SH(140, 128, 50, 4)}`,
    zonare: () => `<defs>${G("zo", "#eef2fa", "#dfe7f5")}</defs><rect width="200" height="140" rx="14" fill="url(#zo)"/>
      <g transform="translate(100 78)">${[[-50, -20, "#e0567b"], [-10, -40, "#4a6fa5"], [30, -20, "#2e7d32"], [-10, 0, "#f4a300"]].map(([x, y, c]) =>
        `<g transform="translate(${x} ${y})"><path d="M0 0l30-15 30 15-30 15z" fill="${c}" opacity=".95"/><path d="M0 0v16l30 15V15z" fill="${c}" opacity=".7"/><path d="M60 0v16L30 31V15z" fill="${c}" opacity=".5"/></g>`).join("")}</g>
      <path d="M20 118h160" stroke="#fff" stroke-width="6" stroke-linecap="round"/><path d="M20 118h160" stroke="#9aa3b5" stroke-width="2" stroke-dasharray="8 6"/>`,
    monumente: () => `<defs>${G("mo", "#f8f1e8", "#efe2d0")}</defs><rect width="200" height="140" rx="14" fill="url(#mo)"/>
      <path d="M40 60h120l-60-30z" fill="#d9c4a8" stroke="#8e5b3a" stroke-width="1.5"/><rect x="40" y="60" width="120" height="8" fill="#c9ad88"/>
      ${[50, 74, 98, 122, 146].map(x => `<rect x="${x - 4}" y="68" width="8" height="42" fill="#e7d6bf" stroke="#8e5b3a" stroke-width="1"/><rect x="${x - 6}" y="66" width="12" height="4" fill="#c9ad88"/>`).join("")}
      <rect x="34" y="110" width="132" height="8" fill="#c9ad88"/><rect x="28" y="118" width="144" height="8" fill="#b8956f"/>${SH(100, 132, 70, 4)}`,
    arii_protejate: () => `<defs>${G("ar2", "#eaf6ea", "#d6ecd6")}</defs><rect width="200" height="140" rx="14" fill="url(#ar2)"/>
      <path d="M0 110q50-16 100-10t100 4v36H0z" fill="#8fc48a"/>
      ${[[40, 100, 1.1, "#2e7d32"], [80, 104, 1.4, "#1f6b42"], [125, 100, 1.2, "#2e8b57"], [165, 106, .9, "#2e7d32"]].map(([x, y, s, c]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-50l-20 26h10l-14 20h12l-12 16h48l-12-16h12l-14-20h10z" fill="${c}"/><rect x="-3" y="12" width="6" height="12" fill="#5a3f28"/></g>`).join("")}
      <path d="M110 30c4-3 8-3 12 0M118 26c4-3 8-3 12 0" stroke="#2a2a2a" stroke-width="1.6" fill="none"/><circle cx="60" cy="34" r="12" fill="#ffe27a"/>`,
    facilitati: () => `<defs>${G("fa", "#fdeef3", "#f9dbe4")}</defs><rect width="200" height="140" rx="14" fill="url(#fa)"/>
      <rect x="40" y="56" width="120" height="60" fill="#fff" stroke="#2a2a2a" stroke-width="1.4"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${40 + i * 20} 56l0-14h20v14q-10 12-20 0z" fill="${i % 2 ? "#fff" : "#e0567b"}" stroke="#2a2a2a" stroke-width="1"/>`).join("")}
      <rect x="50" y="68" width="40" height="30" fill="#9fd0ff" stroke="#2a2a2a" stroke-width="1"/><rect x="110" y="68" width="24" height="48" fill="#6b4a2b" stroke="#2a2a2a" stroke-width="1"/>
      <circle cx="60" cy="80" r="5" fill="#e0567b"/><circle cx="74" cy="80" r="5" fill="#f4a300"/><circle cx="67" cy="90" r="5" fill="#2e8b57"/>
      <path d="M150 112l6-20h20l6 20z" fill="#e0567b"/><path d="M160 92c0-8 12-8 12 0" fill="none" stroke="#2a2a2a" stroke-width="1.6"/>${SH(100, 124, 60, 4)}`,
    transport: () => `<defs>${G("tr", "#e8f0fb", "#d5e4f7")}</defs><rect width="200" height="140" rx="14" fill="url(#tr)"/>
      <path d="M0 112h200" stroke="#9aa3b5" stroke-width="10"/><path d="M0 112h200" stroke="#fff" stroke-width="2" stroke-dasharray="12 10"/>
      <rect x="34" y="40" width="132" height="62" rx="10" fill="#1565c0"/><rect x="34" y="40" width="132" height="34" rx="10" fill="#1976d2"/>
      ${[44, 72, 100, 128].map(x => `<rect x="${x}" y="48" width="22" height="20" rx="3" fill="#bfe0ff"/>`).join("")}<rect x="150" y="48" width="12" height="20" rx="3" fill="#bfe0ff"/>
      <rect x="34" y="78" width="132" height="4" fill="#ffd54f"/><circle cx="60" cy="104" r="10" fill="#2a2a2a"/><circle cx="60" cy="104" r="4" fill="#bbb"/><circle cx="140" cy="104" r="10" fill="#2a2a2a"/><circle cx="140" cy="104" r="4" fill="#bbb"/>
      <rect x="160" y="88" width="6" height="6" fill="#ff5252"/><rect x="34" y="88" width="6" height="6" fill="#fff59d"/>`,
    scoli: () => `<defs>${G("sc", "#fff3e6", "#ffe3c4")}</defs><rect width="200" height="140" rx="14" fill="url(#sc)"/>
      <rect x="30" y="60" width="140" height="56" fill="#f6d4a8" stroke="#2a2a2a" stroke-width="1.4"/><path d="M24 60l76-30 76 30z" fill="#b23b3b" stroke="#2a2a2a" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="100" cy="50" r="9" fill="#fff" stroke="#2a2a2a" stroke-width="1.2"/><path d="M100 50v-6M100 50h4" stroke="#2a2a2a" stroke-width="1.4"/>
      ${[44, 68, 116, 140].map(x => `<rect x="${x}" y="72" width="16" height="14" fill="#9fd0ff" stroke="#2a2a2a" stroke-width="1"/>`).join("")}<rect x="90" y="84" width="20" height="32" fill="#6b4a2b" stroke="#2a2a2a" stroke-width="1"/>
      <path d="M150 34l18-8 18 8-18 8z" fill="#2a2a2a"/><path d="M160 38v8q8 5 16 0v-8" fill="#2a2a2a"/><path d="M186 34v12" stroke="#f4a300" stroke-width="2"/>${SH(100, 124, 70, 4)}`,
    populatie: () => `<defs>${G("po", "#eef0f8", "#dfe3f3")}</defs><rect width="200" height="140" rx="14" fill="url(#po)"/>
      ${om(50, 96, 1.2, "#5b6ea6")}${om(84, 100, 1.35, "#e0567b")}${om(118, 96, 1.2, "#2a9d8f")}${om(150, 102, 1.05, "#f4a300")}${om(30, 104, .95, "#8e5b3a")}${om(172, 98, 1.0, "#4a6fa5")}
      <path d="M0 128h200" stroke="#c7cde0" stroke-width="3"/>`,
    insorire: () => `<defs>${R("sun3", "#fff6c2", "#f4a300")}${R("sun4", "#ffe27a", "#e38a00")}${G("sky", "#dff1ff", "#aed7ff")}</defs><rect width="200" height="140" rx="14" fill="url(#sky)"/>
      <g transform="translate(110 62)">${Array.from({ length: 12 }, (_, i) => `<path d="M0-44l5 10h-10z" fill="#ffd24d" transform="rotate(${i * 30})" opacity=".9"/>`).join("")}
      <circle r="32" fill="url(#sun4)"/><circle r="32" fill="url(#sun3)" opacity=".85"/><ellipse cx="-10" cy="-12" rx="11" ry="7" fill="#fff" opacity=".55"/></g>
      ${nor(52, 96, 1.1)}${nor(150, 104, .85)}${SH(100, 128, 60, 3, .08)}`,
    pv: () => `<defs>${G("pvs", "#e7f6f1", "#cfeee3")}${G("pan", "#1e3a8a", "#0f2a66")}</defs><rect width="200" height="140" rx="14" fill="url(#pvs)"/>
      <g transform="translate(24 30) skewX(-12)"><rect width="88" height="52" rx="3" fill="url(#pan)" stroke="#2a2a2a" stroke-width="1.2"/>${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${3 + c * 21.5}" y="${3 + r * 16.5}" width="19" height="14.5" fill="#2b55c9" stroke="#8fb3ff" stroke-width=".8"/>`).join("")).join("")}</g>
      <path d="M40 82v30M60 112h-40" stroke="#2a2a2a" stroke-width="3"/>
      <rect x="124" y="30" width="40" height="22" rx="4" fill="#fff" stroke="#2a2a2a" stroke-width="1.4"/><rect x="128" y="34" width="26" height="14" rx="2" fill="#0f8f6a"/><rect x="164" y="36" width="4" height="10" fill="#2a2a2a"/><path d="M142 36l-5 7h6l-3 6" stroke="#fff" stroke-width="1.6" fill="none"/>
      <path d="M100 112l8-22h50l16 14 10 2v12z" fill="#0f8f6a"/><path d="M112 92h30l12 10h-48z" fill="#bfe8ff"/><circle cx="118" cy="112" r="8" fill="#2a2a2a"/><circle cx="118" cy="112" r="3" fill="#bbb"/><circle cx="168" cy="112" r="8" fill="#2a2a2a"/><circle cx="168" cy="112" r="3" fill="#bbb"/>
      <path d="M96 104h4" stroke="#2a2a2a" stroke-width="1.6"/><path d="M86 70h8M80 78h8" stroke="#0f8f6a" stroke-width="2" stroke-linecap="round"/>${SH(140, 124, 50, 3)}`,
    costuri: () => `<defs>${G("co", "#eaf5ee", "#d6ecdd")}</defs><rect width="200" height="140" rx="14" fill="url(#co)"/>
      ${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${40 + i * 2} ${100 - i * 9}) rotate(${i % 2 ? -1.5 : 1.5})"><rect width="110" height="24" rx="3" fill="#2e7d4f" stroke="#1b5e3a" stroke-width="1.2"/><rect x="6" y="4" width="98" height="16" rx="2" fill="none" stroke="#9ad3b1" stroke-width="1"/><circle cx="55" cy="12" r="7" fill="#9ad3b1"/></g>`).join("")}
      <g transform="translate(158 92)"><ellipse cx="0" cy="16" rx="16" ry="6" fill="#c99a2e"/><ellipse cx="0" cy="10" rx="16" ry="6" fill="#f4c542" stroke="#b7861c" stroke-width="1"/><ellipse cx="0" cy="4" rx="16" ry="6" fill="#f4c542" stroke="#b7861c" stroke-width="1"/><ellipse cx="0" cy="-2" rx="16" ry="6" fill="#ffd966" stroke="#b7861c" stroke-width="1"/></g>${SH(100, 130, 70, 4)}`,
    negociere: () => `<defs>${G("ne", "#eef0f6", "#dfe3ee")}</defs><rect width="200" height="140" rx="14" fill="url(#ne)"/>
      ${casa(100, 58, 1.35, "#f5f1e8", "#b23b3b")}<path d="M0 118h200" stroke="#c7cde0" stroke-width="3"/>
      ${om(52, 104, 1.35, "#4a5a78")}${om(148, 104, 1.35, "#e0567b")}<path d="M66 92q34-14 68 0" stroke="#2a2a2a" stroke-width="2" fill="none"/><path d="M92 84l8 6-8 6" fill="none" stroke="#2a2a2a" stroke-width="2"/>`,
    evaluare: () => `<defs>${G("ev", "#f2eef9", "#e5dcf3")}</defs><rect width="200" height="140" rx="14" fill="url(#ev)"/>
      <path d="M100 30v80" stroke="#2a2a2a" stroke-width="3"/><path d="M40 44h120" stroke="#2a2a2a" stroke-width="3"/><path d="M80 110h40" stroke="#2a2a2a" stroke-width="4"/>
      <path d="M40 44l-18 36h36z" fill="#7a4ea3" opacity=".9"/><path d="M160 44l-18 36h36z" fill="#7a4ea3" opacity=".9"/>
      ${casa(40, 66, .5)}<text x="160" y="72" text-anchor="middle" font-size="14" font-weight="800" fill="#fff" font-family="IBM Plex Mono, monospace">\u20ac</text>`,
    surse: () => `<defs>${G("su", "#eef0f3", "#e0e4ea")}</defs><rect width="200" height="140" rx="14" fill="url(#su)"/>
      ${[0, 1, 2].map(i => `<g transform="translate(${60 + i * 10} ${40 + i * 10})"><rect width="80" height="60" rx="4" fill="#fff" stroke="#2a2a2a" stroke-width="1.2"/><path d="M10 16h60M10 28h60M10 40h40" stroke="#9aa3b5" stroke-width="2"/></g>`).join("")}
      <ellipse cx="38" cy="54" rx="16" ry="6" fill="#5b6275"/><path d="M22 54v24a16 6 0 0 0 32 0V54" fill="#8a93a6"/><ellipse cx="38" cy="66" rx="16" ry="6" fill="none" stroke="#5b6275" stroke-width="1"/>`,
    rezumat: () => `<defs>${G("re", "#fff4e6", "#ffe6c7")}</defs><rect width="200" height="140" rx="14" fill="url(#re)"/>
      <path d="M40 30h56v80H40zM104 30h56v80h-56z" fill="#fff" stroke="#2a2a2a" stroke-width="1.4"/><path d="M96 30v80" stroke="#2a2a2a" stroke-width="2"/>
      <path d="M50 48h36M50 60h36M50 72h24M114 48h36M114 60h36M114 72h30" stroke="#c7cde0" stroke-width="2"/>${casa(130, 92, .45)}<rect x="48" y="84" width="40" height="16" rx="3" fill="#b86e00"/>`
  };
  D.stare = D.surse;
  const AR = `<defs><marker id="ar" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L6 3 0 6z" fill="#2a2a2a"/></marker></defs>`;
  function desen(k, w, cls) {
    const f = D[k]; if (!f) return "";
    return `<svg class="ilu ${cls || ""}" viewBox="0 0 200 140" ${w ? `width="${w}"` : ""} role="img" aria-hidden="true" style="display:block;max-width:100%;height:auto">${AR}${f()}</svg>`;
  }
  window.ILU = { desen, COL, are: k => !!D[k] };
})();
