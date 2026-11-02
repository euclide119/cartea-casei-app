/* Raport _ Cartea Casei - "Ce se misca in zona" (Manu, 23.10.2026): PUZ-urile active din jur, zona de impozitare, autorizatiile si certificatele de urbanism
   de pe strada, din datele primariei Timisoara (urbis.py -> p/<id>/urbis.json). Harta: PUZ-urile pe fundalul satelit, colorate dupa an; ritmul pe ani; lista.
   Intra in #urbanism dupa desenul retragerilor; clasa keep (ramane in Simplu, unde arata doar cifrele si harta). */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO");
  let last = null, U = null, cerut = null;
  const AN_COL = an => { const y = new Date().getFullYear(), d = Math.max(0, Math.min(10, y - (an || y - 10))); return `hsl(${28 + d * 2} ${90 - d * 5}% ${48 + d * 3.5}%)`; };
  const CL = { casa: "case", colectiv: "locuin\u021be colective", comercial: "comercial / birouri / hale", retele: "re\u021bele \u0219i bran\u0219amente", anexe: "anexe, garduri, acoperi\u0219uri", demolare: "demol\u0103ri", alte: "altele" };

  function css() {
    if (document.getElementById("ub-css")) return;
    const s = document.createElement("style"); s.id = "ub-css";
    s.textContent = `
#urbis{margin:0 0 6px;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:12px;break-inside:avoid}
#urbis h3{font:700 18px var(--font);margin:0 0 2px;letter-spacing:-.01em}
#urbis .ub-sub{font:12.5px var(--font);color:var(--muted);margin:0 0 10px}
#urbis .ub-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin-bottom:12px}
#urbis .ub-k div{border-radius:10px;padding:10px 12px;background:color-mix(in srgb,var(--c) 10%,var(--panel));border:1px solid color-mix(in srgb,var(--c) 30%,transparent)}
#urbis .ub-k b{display:block;font:700 24px/1 var(--mono);color:var(--c)}#urbis .ub-k span{font-size:12px;color:var(--muted)}
#urbis .ub-g{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:14px;align-items:start}
#urbis svg.ub-m{width:100%;height:auto;display:block;border-radius:10px}
#urbis .ub-l{margin:0;padding:0;list-style:none;display:grid;gap:5px;font-size:12.5px;max-height:420px;overflow:auto}
#urbis .ub-l li{display:grid;grid-template-columns:22px minmax(0,1fr);gap:8px;align-items:start;border-top:1px solid var(--line);padding-top:5px}
#urbis .ub-l li:first-child{border-top:0;padding-top:0}
#urbis .ub-l i{font:700 11px var(--mono);color:#fff;background:var(--c);border-radius:50%;width:20px;height:20px;display:grid;place-items:center;font-style:normal}
#urbis .ub-l small{display:block;color:var(--muted);font-size:11.5px}
#urbis .ub-l a{color:var(--fg)}
#urbis .ub-r{margin-top:12px}
#urbis .ub-r .ub-t{font:600 13px var(--font);margin:0 0 4px}
#urbis .ub-acte{margin:10px 0 0;padding:0;list-style:none;display:grid;gap:4px;font-size:12.5px}
#urbis .ub-acte li{display:grid;grid-template-columns:38px 76px minmax(0,1fr);gap:8px;border-top:1px solid var(--line);padding-top:4px}
#urbis .ub-acte b{font:700 10.5px var(--mono);padding:1px 6px;border-radius:5px;color:#fff;background:var(--c);align-self:start;text-align:center}
#urbis .ub-acte em{font-style:normal;font:11.5px var(--mono);color:var(--muted)}
#urbis .ub-n{font-size:12px;color:var(--muted);margin:10px 0 0}
body.simplu #urbis .ub-l,body.simplu #urbis .ub-acte,body.simplu #urbis .ub-n,body.simplu #urbis .ub-sub{display:none}
@media (max-width:760px){#urbis .ub-g{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  }

  function harta(D, HR) {
    const sat = HR && HR.sat && HR.sat.detaliu, rz = (sat && sat.raza) || 1500, S = 640, R = U.raza_m, sc = S / 2 / (R * 1.08);
    const P = (x, y) => [S / 2 + x * sc, S / 2 - y * sc];
    let s = `<svg class="ub-m" viewBox="0 0 ${S} ${S}" role="img" aria-label="PUZ-urile active \u00een jurul propriet\u0103\u021bii">`;
    if (sat) { const k = rz / (R * 1.08), o = (1 - k) * S / 2; s += `<image href="p/${esc(D.id)}/${esc(sat.fisier)}" x="${o.toFixed(1)}" y="${o.toFixed(1)}" width="${(S * k).toFixed(1)}" height="${(S * k).toFixed(1)}" preserveAspectRatio="none"/>`; }
    else s += `<rect width="${S}" height="${S}" fill="#eef1ee"/>`;
    s += `<rect width="${S}" height="${S}" fill="#fff" opacity=".18"/>`;
    U.puz.lista.forEach((p, i) => { const c = AN_COL(p.an);
      p.contur.forEach(rg => { const d = rg.map(([x, y], k) => (k ? "L" : "M") + P(x, y).map(v => v.toFixed(1)).join(" ")).join("") + "Z";
        s += `<path d="${d}" fill="${c}" fill-opacity=".38" stroke="#fff" stroke-width="3.2" stroke-opacity=".9"/><path d="${d}" fill="none" stroke="${c}" stroke-width="1.6"/>`; }); });
    U.puz.lista.forEach((p, i) => { const rg = p.contur[0]; if (!rg) return; let cx = 0, cy = 0; rg.forEach(([x, y]) => { cx += x; cy += y; }); const [x, y] = P(cx / rg.length, cy / rg.length);
      if (x < 8 || y < 8 || x > S - 8 || y > S - 8) return;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="${AN_COL(p.an)}" stroke="#fff" stroke-width="2"/><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="middle" font-size="11" font-weight="800" fill="#fff" font-family="IBM Plex Mono,monospace">${i + 1}</text>`; });
    [500, 1000].forEach(m => { const [x, y] = P(0, 0); s += `<circle cx="${x}" cy="${y}" r="${(m * sc).toFixed(1)}" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="5 4" opacity=".9"/><text x="${x + 4}" y="${(y - m * sc - 4).toFixed(1)}" font-size="11" font-weight="700" fill="#fff" stroke="#000" stroke-width="2.5" paint-order="stroke" font-family="Instrument Sans,sans-serif">${m} m</text>`; });
    const [cx, cy] = P(0, 0); s += `<circle cx="${cx}" cy="${cy}" r="8" fill="#ff3b5c" stroke="#fff" stroke-width="3"/>`;
    s += `<text x="${S - 12}" y="22" text-anchor="end" font-size="13" font-weight="800" fill="#1a1a1a" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="Instrument Sans,sans-serif">N \u2191</text>`;
    const yr = new Date().getFullYear(); s += `<g transform="translate(14 ${S - 30})">` + [0, 3, 6, 10].map((d, i) => `<rect x="${i * 46}" y="0" width="44" height="10" rx="2" fill="${AN_COL(yr - d)}"/><text x="${i * 46}" y="22" font-size="10" fill="#111" stroke="#fff" stroke-width="2.5" paint-order="stroke" font-family="IBM Plex Mono,monospace">${d === 0 ? "anul acesta" : d === 10 ? "\u2265 10 ani" : "acum " + d + " ani"}</text>`).join("") + `</g>`;
    return s + `</svg>`;
  }
  function ritm() {
    const yr = new Date().getFullYear(), ani = Array.from({ length: 8 }, (_, i) => String(yr - 7 + i));
    const pa = U.puz.pe_an || {}, aa = U.acte.pe_an || {}; const mx = Math.max(1, ...ani.map(a => Math.max(pa[a] || 0, (aa[a] && aa[a].AC + aa[a].CU) || 0)));
    const W = 560, H = 120, L0 = 26, bw = (W - L0 - 6) / ani.length;
    let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="PUZ-uri \u0219i acte pe ani" style="width:100%;height:auto;display:block">`;
    ani.forEach((a, i) => { const x = L0 + i * bw, p = pa[a] || 0, n = aa[a] ? aa[a].AC + aa[a].CU : 0, hp = p / mx * 80, hn = n / mx * 80;
      g += `<rect x="${x + 4}" y="${96 - hp}" width="${bw / 2 - 6}" height="${hp}" rx="2" fill="#c86a0a"/><rect x="${x + bw / 2 + 2}" y="${96 - hn}" width="${bw / 2 - 6}" height="${hn}" rx="2" fill="#2c5c9c"/>`;
      if (p) g += `<text x="${x + bw / 4 + 1}" y="${92 - hp}" text-anchor="middle" font-size="10" font-weight="700" fill="#c86a0a" font-family="IBM Plex Mono,monospace">${p}</text>`;
      if (n) g += `<text x="${x + 3 * bw / 4 - 1}" y="${92 - hn}" text-anchor="middle" font-size="10" font-weight="700" fill="#2c5c9c" font-family="IBM Plex Mono,monospace">${n}</text>`;
      g += `<text x="${x + bw / 2}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${a}</text>`; });
    g += `<line x1="${L0}" x2="${W - 6}" y1="96" y2="96" stroke="var(--line)"/></svg>`;
    return `<div class="ub-r"><p class="ub-t"><span style="color:#c86a0a">\u25a0</span> PUZ-uri aprobate \u00een 1 km \u00b7 <span style="color:#2c5c9c">\u25a0</span> autoriza\u021bii + certificate pe ${esc(U.acte.strada || "strad\u0103")}, pe ani</p>${g}</div>`;
  }

  function randeaza(D, HR) {
    const sec = document.getElementById("urbanism"); if (!sec) return;
    document.getElementById("urbis")?.remove();
    const box = document.createElement("div"); box.id = "urbis"; box.className = "keep";
    const imp = U.impozitare, Z = imp && (imp.zona.match(/zona\s+([A-D])/i) || [])[1];
    const k = [["#2c5c9c", Z ? "Zona " + Z : "\u2014", imp ? `zona de impozitare ${esc(imp.an || "")}, HCL ${esc(imp.hcl)}` : "zona de impozitare: necunoscut\u0103"],
      ["#c86a0a", nf(U.puz.n_500), `PUZ-uri active la sub 500 m (${nf(U.puz.n)} \u00een 1 km)`],
      ["#1f8a4c", nf(U.acte.n_ac), `autoriza\u021bii de construire pe ${esc(U.acte.strada || "strad\u0103")} din ${esc(U.acte.de_la.slice(0, 4))}`],
      ["#7a4ea3", nf(U.acte.n_cu), `certificate de urbanism pe aceea\u0219i strad\u0103 (ce se preg\u0103te\u0219te)`]];
    const lista = U.puz.lista.slice(0, 14).map((p, i) => `<li style="--c:${AN_COL(p.an)}"><i>${i + 1}</i><div>${esc(p.titlu || "(f\u0103r\u0103 titlu)")}${p.in ? " \u2014 <b>proprietatea e \u00een acest PUZ</b>" : ""}<small>${esc(p.tip || "PUZ")}${p.hcl ? " \u00b7 HCL " + esc(p.hcl) : ""}${p.an ? " \u00b7 " + p.an : ""} \u00b7 la ${p.m ? nf(p.m) + " m" : "0 m"}${p.pot ? " \u00b7 POT " + esc(p.pot) : ""}${p.cut ? " \u00b7 CUT " + esc(p.cut) : ""}${p.proiectant ? " \u00b7 " + esc(p.proiectant) : ""}${p.piese ? ` \u00b7 <a href="${esc(p.piese)}" target="_blank" rel="noopener">plan\u0219e</a>` : ""}</small></div></li>`).join("");
    const acte = U.acte.lista.slice(0, 12).map(a => `<li style="--c:${a.tip === "AC" ? "#1f8a4c" : "#7a4ea3"}"><b>${a.tip}</b><em>${esc(a.data.split("-").reverse().join("."))}</em><span>${esc(a.obiectiv || "")}${a.url ? ` <a href="${esc(a.url)}" target="_blank" rel="noopener">\u2197</a>` : ""}</span></li>`).join("");
    const cls = Object.entries(U.acte.clase || {}).filter(([, n]) => n).sort((a, b) => b[1] - a[1]).map(([c, n]) => `${n} ${CL[c] || c}`).join(", ");
    box.innerHTML = `<h3>Ce se mi\u0219c\u0103 \u00een zon\u0103: PUZ-uri, autoriza\u021bii, zona de impozitare</h3>
      <p class="ub-sub">Planurile urbanistice zonale active din jur (cele aprobate recent sunt mai \u00eenchise la culoare), zona de impozitare a prim\u0103riei \u0219i ce s-a autorizat pe strad\u0103 \u00een ultimii 3 ani. Date ale Prim\u0103riei Timi\u0219oara (Urbis), copie local\u0103.</p>
      <div class="ub-k">${k.map(([c, b, t]) => `<div style="--c:${c}"><b>${b}</b><span>${t}</span></div>`).join("")}</div>
      <div class="ub-g"><div>${harta(D, HR)}</div><div>${U.puz.lista.length ? `<ul class="ub-l">${lista}</ul>` : `<p class="ub-n">Niciun PUZ activ la mai pu\u021bin de 1 km.</p>`}${ritm()}</div></div>
      ${acte ? `<ul class="ub-acte">${acte}</ul>` : ""}${cls ? `<p class="ub-n">Pe strad\u0103, autoriza\u021biile sunt pentru: ${esc(cls)}.</p>` : ""}
      <p class="ub-n">Sursa: ${esc(U.sursa)}. PUZ-urile se v\u0103d pe harta prim\u0103riei; actele de pe strad\u0103 sunt legate dup\u0103 numele str\u0103zii, nu dup\u0103 parcel\u0103.</p>`;
    const anc = document.getElementById("retrageri") || document.getElementById("ind-box") || sec.querySelector(":scope > .cards") || sec.firstElementChild;
    anc.insertAdjacentElement("afterend", box);
  }

  async function monteaza() {
    const Dd = typeof D !== "undefined" ? D : null; if (!Dd) return;
    if (cerut !== Dd.id) { cerut = Dd.id; U = null; document.getElementById("urbis")?.remove();
      try { const r = await fetch(`p/${Dd.id}/urbis.json`, { cache: "no-cache" }); if (r.ok) U = await r.json(); } catch (e) { U = null; } last = null; }
    if (!U) return;
    if (last === Dd.id && document.getElementById("urbis")) return;
    css(); last = Dd.id; randeaza(Dd, typeof HR !== "undefined" ? HR : null);
  }
  setInterval(monteaza, 1300);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", monteaza); else monteaza();
})();
