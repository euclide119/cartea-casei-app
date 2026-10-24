/* Raport _ Cartea Casei - "Cum poate sta casa pe teren": desenul retragerilor (Manu, 23.10.2026).
   Din D.indicatori_urbanistici (indicatori.py): aliniament, retragere laterala, retragere posterioara, POT, regim de inaltime, front minim.
   Deseneaza, la scara, un teren-tip (front 12 m x adancime 30 m) cu strada jos, corpul casei asezat dupa retrageri, cotele si treapta fiecarei valori
   (lege / PUG / estimat) si, alaturi, o elevatie cu nivelurile. Intra in #urbanism, dupa #ind-box; clasa keep: ramane si in Simplu. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO", { maximumFractionDigits: 1 });
  const TC = { 1: "#1f8a4c", 2: "#2c5c9c", 3: "#b58900", 4: "#7b847f", 0: "#999" }, TN = { 1: "PUG digital", 2: "regulament PUG", 3: "lege", 4: "estimat din vecini", 0: "temei lips\u0103" };
  let last = null;

  function css() {
    if (document.getElementById("rt-css")) return;
    const s = document.createElement("style"); s.id = "rt-css";
    s.textContent = `
#retrageri{margin:0 0 6px;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:12px;break-inside:avoid}
#retrageri h3{font:700 18px var(--font);margin:0 0 2px;letter-spacing:-.01em}
#retrageri .rt-sub{font:12.5px var(--font);color:var(--muted);margin:0 0 10px}
#retrageri .rt-g{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:14px;align-items:start}
#retrageri svg{width:100%;height:auto;display:block}
#retrageri .rt-l{display:flex;flex-wrap:wrap;gap:6px 14px;margin:8px 0 0;font:12px var(--font);color:var(--muted)}
#retrageri .rt-l i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
@media (max-width:700px){#retrageri .rt-g{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }
  const num = (iv, k) => iv && typeof iv[k] === "number" ? iv[k] : null;
  function date(I) {
    const by = id => (I.indicatori || []).find(x => x.id === id) || {};
    const al = by("aliniament"), la = by("lateral"), po = by("posterior"), pot = by("pot"), rg = by("regim"), pa = by("parcela");
    // aliniamentul din vecini e fata de axul strazii: scadem jumatate din latimea strazii (~ 6 m)
    let front = num(al.interval, "min") != null ? Math.max(0, (num(al.interval, "min") + num(al.interval, "max")) / 2 - 6) : 4;
    if (al.treapta <= 2 && num(al.interval, "min") != null) front = num(al.interval, "min");
    const lat = num(la.interval, "min") ?? 3, lat2 = /2 m/.test(la.valoare || "") ? 2 : lat, post = num(po.interval, "min") ?? 5;
    const potv = num(pot.interval, "max") ?? num(pot.interval, "min") ?? 35;
    const estim = (pot.alte || []).find(x => x.treapta === 4), potE = estim && (estim.valoare.match(/median\u0103 (\d+)/) || [])[1];
    const reg = ((rg.alte || []).map(x => x.valoare).join(" ") + " " + (rg.valoare || "") + " " + (I.sumar || []).join(" ")).match(/\b(S\+)?(D\+)?P(\+\d+E?)?(\+M)?(\+Er)?\b/);
    const regim = reg ? reg[0] : "P+1E";
    const niv = 1 + (+(regim.match(/\+(\d+)/) || [0, 0])[1]) + (/\+M|\+Er/.test(regim) ? 1 : 0);
    return { front, lat, lat2, post, potv, potE: potE ? +potE : null, regim, niv, tr: { front: al.treapta ?? 0, lat: la.treapta ?? 0, post: po.treapta ?? 0, pot: pot.treapta ?? 0, reg: rg.treapta ?? 0 }, frontMin: num(pa.interval, "max") || 12 };
  }

  function plan(d) {
    const LW = 14, LD = 30, S = 9, ox = 60, oy = 24, W = ox + LW * S + 70, H = oy + LD * S + 70;      // teren 14 x 30 m, 9 px/m
    const X = m => ox + m * S, Y = m => oy + (LD - m) * S;
    const cx1 = X(d.lat), cx2 = X(LW - d.lat2), cy1 = Y(LD - d.post), cy2 = Y(d.front);   // corpul: intre retrageri
    const pot = Math.min(d.potv, 100) / 100, ariaMax = LW * LD * pot, bw = (cx2 - cx1) / S, bd = (cy2 - cy1) / S;
    let w = bw, h = bd; if (w * h > ariaMax) { const r = Math.sqrt(ariaMax / (w * h)); w *= r; h *= r; }
    const bxw = w * S, byh = h * S, bx = cx1, by = cy2 - byh;   // casa sta lipita de retragerea din fata (spre strada)
    const cota = (x1, y1, x2, y2, t, c, side) => { const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, v = x1 === x2; if (!v && Math.abs(x2 - x1) < 14) return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.4"/><text x="${mx}" y="${my - 5}" font-size="10" font-weight="700" fill="${c}" text-anchor="middle" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="IBM Plex Mono,monospace">${t}</text>`;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.4" marker-start="url(#rta)" marker-end="url(#rta)"/>` +
        `<text x="${v ? mx + (side || 7) : mx}" y="${v ? my + 4 : my - 5}" font-size="11" font-weight="700" fill="${c}" text-anchor="${v ? (side < 0 ? "end" : "start") : "middle"}" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="IBM Plex Mono,monospace">${t}</text>`; };
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Planul terenului cu retragerile"><defs><marker id="rta" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L6 3 0 6z" fill="context-stroke"/></marker>
      <pattern id="rth" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#c86a0a" stroke-width="1.2" opacity=".5"/></pattern></defs>`;
    s += `<rect x="${X(0)}" y="${Y(LD)}" width="${LW * S}" height="${LD * S}" fill="#f3efe4" stroke="#8a7a5a" stroke-width="1.6"/>`;          // terenul
    s += `<rect x="${X(-4)}" y="${Y(0)}" width="${(LW + 8) * S}" height="${12 * S / 2}" fill="#d9d9d9"/><line x1="${X(-4)}" x2="${X(LW + 4)}" y1="${Y(0) + 27}" y2="${Y(0) + 27}" stroke="#fff" stroke-width="2" stroke-dasharray="8 6"/>`;   // strada
    s += `<text x="${X(LW / 2)}" y="${Y(0) + 20}" font-size="11" font-weight="700" text-anchor="middle" fill="#444" font-family="Instrument Sans,sans-serif">strada</text>`;
    s += `<rect x="${X(0)}" y="${Y(LD)}" width="${LW * S}" height="${LD * S}" fill="none" stroke="#2e7d32" stroke-width="1" stroke-dasharray="3 3"/>`;      // vecini
    [[X(0) - 22, Y(LD / 2)], [X(LW) + 22, Y(LD / 2)]].forEach(([x, y]) => s += `<text x="${x}" y="${y}" font-size="10" text-anchor="middle" fill="#2e7d32" transform="rotate(-90 ${x} ${y})" font-family="Instrument Sans,sans-serif">vecin</text>`);
    s += `<text x="${X(LW / 2)}" y="${Y(LD) - 14}" font-size="10" text-anchor="middle" fill="#2e7d32" font-family="Instrument Sans,sans-serif">vecinul din spate</text>`;
    s += `<rect x="${cx1}" y="${cy1}" width="${cx2 - cx1}" height="${cy2 - cy1}" fill="url(#rth)" stroke="#c86a0a" stroke-width="1" stroke-dasharray="4 3"/>`;   // zona construibila
    s += `<rect x="${bx}" y="${by}" width="${bxw}" height="${byh}" rx="2" fill="#ffd9a8" stroke="#2a2a2a" stroke-width="1.8"/>`;                       // corpul casei
    s += `<text x="${bx + bxw / 2}" y="${by + byh / 2 - 4}" font-size="12" font-weight="800" text-anchor="middle" fill="#2a2a2a" font-family="Instrument Sans,sans-serif">casa</text><text x="${bx + bxw / 2}" y="${by + byh / 2 + 11}" font-size="10.5" text-anchor="middle" fill="#555" font-family="IBM Plex Mono,monospace">${d.regim} \u00b7 POT ${nf(d.potv)} %</text>`;
    s += cota(X(LW) + 12, Y(0), X(LW) + 12, cy2, `${nf(d.front)} m`, TC[d.tr.front], 6);                  // fata
    s += cota(X(0), Y(LD) + 10, cx1, Y(LD) + 10, `${nf(d.lat)} m`, TC[d.tr.lat]);                          // lateral stanga
    s += cota(cx2, Y(LD) + 10, X(LW), Y(LD) + 10, `${nf(d.lat2)} m`, TC[d.tr.lat]);                       // lateral dreapta
    s += cota(X(LW) + 12, Y(LD), X(LW) + 12, cy1, `${nf(d.post)} m`, TC[d.tr.post], 6);                   // spate
    s += cota(X(0), Y(0) + 44, X(LW), Y(0) + 44, `front ${LW} m (minim ${nf(d.frontMin)} m)`, "#555");
    return s + `</svg>`;
  }
  function elevatie(d) {
    const W = 220, H = 230, g = 190, fh = 30, bw = 110, bx = 55, nv = d.niv, mans = /\+M|\+Er/.test(d.regim);
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Eleva\u021bie cu nivelurile"><line x1="10" x2="${W - 10}" y1="${g}" y2="${g}" stroke="#8a7a5a" stroke-width="2"/>`;
    for (let i = 0; i < nv - (mans ? 1 : 0); i++) { const y = g - (i + 1) * fh; s += `<rect x="${bx}" y="${y}" width="${bw}" height="${fh}" fill="#f5f1e8" stroke="#2a2a2a" stroke-width="1.4"/>`;
      [0, 1, 2].forEach(k => s += `<rect x="${bx + 14 + k * 32}" y="${y + 8}" width="14" height="14" fill="#9fd0ff" stroke="#2a2a2a" stroke-width="1"/>`);
      s += `<text x="${bx - 6}" y="${y + fh / 2 + 4}" font-size="10.5" text-anchor="end" fill="#555" font-family="IBM Plex Mono,monospace">${i === 0 ? "P" : i + "E"}</text>`; }
    const top = g - (nv - (mans ? 1 : 0)) * fh;
    if (mans) s += `<path d="M${bx - 8} ${top}L${bx + bw / 2} ${top - 34}L${bx + bw + 8} ${top}z" fill="#b23b3b" stroke="#2a2a2a" stroke-width="1.4" stroke-linejoin="round"/><rect x="${bx + bw / 2 - 9}" y="${top - 20}" width="18" height="12" fill="#9fd0ff" stroke="#2a2a2a" stroke-width="1"/><text x="${bx - 6}" y="${top - 10}" font-size="10.5" text-anchor="end" fill="#555" font-family="IBM Plex Mono,monospace">M</text>`;
    else s += `<path d="M${bx - 8} ${top}L${bx + bw / 2} ${top - 22}L${bx + bw + 8} ${top}z" fill="#b23b3b" stroke="#2a2a2a" stroke-width="1.4" stroke-linejoin="round"/>`;
    const hmax = (nv - (mans ? 1 : 0)) * 3 + (mans ? 2.5 : 0) + 1;
    s += `<line x1="${bx + bw + 22}" x2="${bx + bw + 22}" y1="${g}" y2="${top - (mans ? 34 : 22)}" stroke="${TC[d.tr.reg]}" stroke-width="1.4" marker-start="url(#rta)" marker-end="url(#rta)"/><text x="${bx + bw + 28}" y="${(g + top) / 2}" font-size="11" font-weight="700" fill="${TC[d.tr.reg]}" font-family="IBM Plex Mono,monospace">\u2248 ${nf(hmax)} m</text>`;
    s += `<text x="${W / 2}" y="${H - 8}" font-size="11" text-anchor="middle" fill="#555" font-family="Instrument Sans,sans-serif">regim ${esc(d.regim)} \u00b7 \u00een\u0103l\u021bimea \u2264 distan\u021ba p\u00e2n\u0103 la casa de peste drum</text>`;
    return s + `</svg>`;
  }

  function monteaza() {
    const Dd = typeof D !== "undefined" ? D : null, I = Dd && Dd.indicatori_urbanistici, sec = document.getElementById("urbanism");
    if (!I || !sec) { document.getElementById("retrageri")?.remove(); last = null; return; }
    if (last === Dd.id && document.getElementById("retrageri")) return;
    css(); last = Dd.id;
    document.getElementById("retrageri")?.remove();
    const d = date(I);
    const box = document.createElement("div"); box.id = "retrageri"; box.className = "keep";
    box.innerHTML = `<h3>Cum poate sta casa pe teren: retragerile</h3><p class="rt-sub">Teren-tip de ${14} \u00d7 ${30} m, la scar\u0103; corpul casei st\u0103 \u00eentre retrageri, cu cel mult POT ${nf(d.potv)} % din teren. Valorile vin din indicatorii de mai sus; culoarea cotei spune treapta.</p>
      <div class="rt-g"><div>${plan(d)}</div><div>${elevatie(d)}</div></div>
      <p class="rt-l">${[1, 2, 3, 4].map(t => `<span><i style="background:${TC[t]}"></i>${TN[t]}</span>`).join("")}<span><i style="background:#ffd9a8;border:1px solid #2a2a2a"></i>corpul casei</span><span><i style="background:repeating-linear-gradient(45deg,#c86a0a 0 1px,transparent 1px 4px)"></i>zona construibil\u0103</span>${d.potE ? `<span>\u00een jur s-a construit POT \u2248 ${d.potE} % [E]</span>` : ""}</p>`;
    const anc = document.getElementById("ind-box") || sec.querySelector(":scope > .cards") || sec.firstElementChild;
    anc.insertAdjacentElement("afterend", box);
  }
  setInterval(monteaza, 1200);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", monteaza); else monteaza();
})();
