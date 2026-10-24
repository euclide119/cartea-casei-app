/* Raport _ Cartea Casei - \u201eevolutia zonei in timp" (Manu, 23.10.2026): imaginile satelit din arhiva (istoric.json) + un grafic pe ani
   cu PUZ-urile aprobate in 1 km (urbis.json), autorizatiile de construire din oras (autorizatii.trimestre) si cand avem imagini satelit.
   Se pune in capitolul \u201eautorizatii de construire in jur", dupa cifre; rezumatul nu mai are blocul separat de istoric. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO");
  let cur = null, H = null, U = null;

  function css() {
    if (document.getElementById("evz-css")) return;
    const s = document.createElement("style"); s.id = "evz-css";
    s.textContent = `
#rezumat>#istoric{display:none!important}
#evolutie{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:12px;break-inside:avoid}
#evolutie h3{font:800 19px var(--font);margin:0;letter-spacing:-.01em}
#evolutie .ev-s{font:13px/1.5 var(--font);color:var(--muted);margin:0}
#evolutie .ev-g svg{width:100%;height:auto;display:block}
#evolutie .ev-2{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);gap:14px}#evolutie .ev-c{border:1px solid #c9ced8;border-radius:12px;padding:12px 14px;display:flex;flex-direction:column;gap:8px}#evolutie .ev-c>b{font:700 14px var(--font)}
@media (max-width:760px){#evolutie .ev-2{grid-template-columns:1fr}}
#evolutie .ev-l{display:flex;flex-wrap:wrap;gap:6px 16px;font:12px var(--font);color:var(--muted)}
#evolutie .ev-l i{display:inline-block;width:12px;height:10px;border-radius:3px;margin-right:6px;vertical-align:-1px}
#evolutie .tpan{border:0;padding:0}
#evolutie svg [data-sat]{cursor:pointer}
#evolutie .tt,#evolutie .nt{text-transform:lowercase}`;
    document.head.appendChild(s);
  }

  /* doua grafice simple (Manu, 23.10): autorizatiile pe an, pe tipuri (coloane stivuite) si populatia 2016 -> 2026 */
  const CLC = { casa: "#1f8a4c", colectiv: "#2c5c9c", comercial: "#c86a0a", anexe: "#9aa36b", retele: "#7a4ea3", demolare: "#c0392b", alte: "#a6adb8" };
  function grafic(D) {
    const T = (D.autorizatii && D.autorizatii.trimestre) || {}, NC = (D.autorizatii && D.autorizatii.nume_clase) || {}, an = {};
    Object.entries(T).forEach(([q, t]) => { const y = q.slice(0, 4); an[y] = an[y] || {}; Object.entries(t).forEach(([c, n]) => an[y][c] = (an[y][c] || 0) + n); });
    const ani = Object.keys(an).sort(), cls = Object.keys(CLC).filter(c => ani.some(y => an[y][c]));
    if (!ani.length) return "";
    const W = 420, Hh = 230, L = 36, B = 30, T0 = 14, tot = y => Object.values(an[y]).reduce((a, b) => a + b, 0), mx = Math.max(...ani.map(tot), 1), bw = (W - L - 10) / ani.length;
    const Y = v => T0 + (1 - v / mx) * (Hh - T0 - B);
    const q = Object.keys(T).sort(), partial = q.length && !/T4$/.test(q[q.length - 1]) ? q[q.length - 1].slice(0, 4) : null;
    let s = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="autoriza\u021bii de construire pe an, pe tipuri">`;
    [0, .5, 1].forEach(f => { const v = Math.round(mx * f), y = Y(v); s += `<line x1="${L}" x2="${W - 6}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${L - 6}" y="${y + 4}" font-size="10" text-anchor="end" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${nf(v)}</text>`; });
    ani.forEach((y, i) => { let acc = 0; const x = L + i * bw + bw * .18, w = bw * .64;
      cls.forEach(c => { const n = an[y][c] || 0; if (!n) return; const y1 = Y(acc + n), y0 = Y(acc); s += `<rect x="${x.toFixed(1)}" y="${y1.toFixed(1)}" width="${w.toFixed(1)}" height="${(y0 - y1).toFixed(1)}" fill="${CLC[c]}"${y === partial ? ' opacity=".55"' : ""}><title>${y}: ${n} \u00b7 ${esc(NC[c] || c)}</title></rect>`; acc += n; });
      s += `<text x="${(x + w / 2).toFixed(1)}" y="${(Y(acc) - 5).toFixed(1)}" font-size="10.5" font-weight="700" text-anchor="middle" fill="var(--fg)" font-family="IBM Plex Mono,monospace">${nf(acc)}</text><text x="${(x + w / 2).toFixed(1)}" y="${Hh - 12}" font-size="11" text-anchor="middle" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${y}${y === partial ? "*" : ""}</text>`; });
    s += `</svg>`;
    const leg = cls.map(c => `<span><i style="background:${CLC[c]}"></i>${esc(NC[c] || c)}</span>`).join("");
    const p = D.populatie || {}; let pop = "";
    if (p.p2016 && p.p2026) { const mxp = Math.max(p.p2016, p.p2026), H2 = 230, B2 = 30, Yp = v => 18 + (1 - v / mxp) * (H2 - 18 - B2), up = p.p2026 >= p.p2016;
      pop = `<svg viewBox="0 0 260 ${H2}" role="img" aria-label="popula\u021bia 2016 \u0219i 2026">` + [["2016", p.p2016, "#a6adb8"], ["2026", p.p2026, up ? "#1f8a4c" : "#c86a0a"]].map(([t, v, c], i) => { const x = 40 + i * 110; return `<rect x="${x}" y="${Yp(v).toFixed(1)}" width="70" height="${(H2 - B2 - Yp(v)).toFixed(1)}" rx="6" fill="${c}"/><text x="${x + 35}" y="${(Yp(v) - 7).toFixed(1)}" font-size="12" font-weight="700" text-anchor="middle" fill="var(--fg)" font-family="IBM Plex Mono,monospace">${nf(v)}</text><text x="${x + 35}" y="${H2 - 10}" font-size="11" text-anchor="middle" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${t}</text>`; }).join("") +
        `<path d="M110 ${Yp(p.p2016) + 12} L150 ${Yp(p.p2026) + 12}" stroke="var(--fg)" stroke-width="1.4" marker-end="url(#evA)"/><defs><marker id="evA" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L8 4 0 8z" fill="var(--fg)"/></marker></defs></svg>`;
      pop = `<div class="ev-c"><b>popula\u021bia ${esc(window.mic ? mic(p.uat || "") : p.uat || "")}: ${p.var > 0 ? "+" : ""}${String(p.var).replace(".", ",")}% \u00een 10 ani</b>${pop}<span class="ev-s">jude\u021bul: ${p.judet_var > 0 ? "+" : ""}${String(p.judet_var).replace(".", ",")}%; cre\u0219terea s-a mutat \u00een comunele din jur.</span></div>`; }
    return `<div class="ev-2"><div class="ev-c"><b>autoriza\u021bii de construire pe an, \u00een tot ora\u0219ul</b>${s}<div class="ev-l">${leg}</div>${partial ? `<span class="ev-s">* ${partial}: anul \u00een curs, incomplet.</span>` : ""}</div>${pop}</div>`;
  }

  async function monteaza() {
    const Dd = typeof D !== "undefined" ? D : null, sec = document.getElementById("autorizatii"); if (!Dd || !sec) return;
    if (cur === Dd.id && document.getElementById("evolutie")) return;
    if (cur !== Dd.id) { cur = Dd.id; H = null; U = null;
      try { const r = await fetch(`p/${Dd.id}/istoric.json`); if (r.ok) H = await r.json(); } catch (e) {}
      try { const r = await fetch(`p/${Dd.id}/urbis.json`); if (r.ok) U = await r.json(); } catch (e) {} }
    if (!sec.firstElementChild) return;
    css(); document.getElementById("evolutie")?.remove();
    const ri = document.getElementById("istoric"); if (ri) ri.innerHTML = "";          // slider-ul satelit se muta aici
    const b = document.createElement("div"); b.id = "evolutie"; b.className = "keep";
    const p = Dd.populatie || {};
    b.innerHTML = `<h3>evolu\u021bia zonei \u00een timp</h3><p class="ev-s">ce tipuri de autoriza\u021bii s-au dat \u00een ultimii ani, cum s-a schimbat popula\u021bia \u0219i, mai jos, cum ar\u0103ta locul \u00een imaginile satelit din arhiv\u0103${p.p2016 && p.p2026 ? `; popula\u021bia ora\u0219ului: ${nf(p.p2016)} \u00een 2016, ${nf(p.p2026)} \u00een 2026` : ""}.</p>
      <div class="ev-g">${grafic(Dd)}</div>

      <div class="ev-sat"></div>`;
    const anc = sec.querySelector(":scope > .cards") || sec.querySelector(":scope > .hero") || sec.firstElementChild; anc.insertAdjacentElement("afterend", b);
    if (H && window.TER && TER.istoric) { try { TER.istoric(b.querySelector(".ev-sat"), H, Dd); } catch (e) {} }
    b.querySelectorAll("[data-sat]").forEach(g => g.addEventListener("click", () => { const r = b.querySelector(".ev-sat #tIst"); if (!r) return; r.value = +g.dataset.sat * 10; r.dispatchEvent(new Event("input")); r.scrollIntoView({ behavior: "smooth", block: "center" }); }));
  }
  setInterval(monteaza, 1300);
})();
