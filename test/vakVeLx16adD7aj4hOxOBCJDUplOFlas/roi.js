/* Raportul Casei · modul opțional „ROI” (roi.js v1.0.0, 12.11.2026). Blueprintul rămâne neatins: modulul nu face nimic dacă p/<id>/roi.json nu există (flag pe raport: doar mosnita_a92_18_19).
   Capitol „ROI cumpărare cu PUZ”: ipoteze editabile, cost, venit, profit, ROI total și anualizat, preț de echilibru, sensibilitate, comparative din anunțuri (intravilan / extravilan), hartă mică.
   Ipotezele sunt ale lui Manu (12.11.2026) și se citează ca ipoteze; fără opinii. Câmpurile „!” sunt costuri neincluse în ipotezele inițiale (implicit 0). */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => Number(v).toLocaleString("ro-RO", { maximumFractionDigits: d, minimumFractionDigits: d });
  const eur = v => nf(v) + " €";
  let cur = null;

  const st = document.createElement("style"); st.id = "roi-css";
  st.textContent = `
#roi .roi-w{display:flex;flex-direction:column;gap:14px}
#roi h2{margin:0 0 4px;font-family:"Fraunces",Georgia,serif}
#roi h3{margin:6px 0 2px;font-size:16px}
.roi-in{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:10px}
.roi-in label{display:flex;flex-direction:column;gap:4px;border:1px solid #c9ced8;border-radius:12px;padding:10px 12px;background:var(--panel);font:13px/1.35 var(--font)}
.roi-in input{font:600 16px var(--mono);padding:6px 8px;border:1px solid #c9ced8;border-radius:8px;background:#fff;color:#1b2230;width:100%;box-sizing:border-box}
.roi-in small{color:var(--muted);font-size:11.5px}
.roi-in label.ex{border-color:#ecc98f;background:#fdf3e2}
.roi-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.roi-k>div{border:1px solid #c9ced8;border-radius:12px;padding:12px 14px;background:var(--panel)}
.roi-k b{display:block;font:800 20px var(--mono);overflow-wrap:anywhere}.roi-k span{font:12.5px/1.4 var(--font);color:var(--muted)}
.roi-t{width:100%;border-collapse:collapse;font:13px/1.4 var(--font);background:var(--panel);border:1px solid #c9ced8;border-radius:12px;overflow:hidden}
.roi-t th,.roi-t td{padding:7px 9px;border-top:1px solid var(--line);text-align:right}.roi-t th:first-child,.roi-t td:first-child{text-align:left}
.roi-t thead th{border-top:0;background:#eef1f6;font-weight:700}
.roi-sc{overflow-x:auto}
.roi-n{font:12.5px/1.5 var(--font);color:var(--muted)}
.roi-n mark{background:#fff3a8}
.roi-c{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:10px}
.roi-c>div{border:1px solid #c9ced8;border-radius:12px;padding:10px 14px;background:var(--panel);font:13px/1.5 var(--font)}
.roi-l{max-height:340px;overflow:auto;border:1px solid #c9ced8;border-radius:12px;background:var(--panel)}
.roi-l div{display:grid;grid-template-columns:70px 78px 62px 62px minmax(0,1fr);gap:8px;padding:6px 10px;border-top:1px solid var(--line);font:12.5px/1.4 var(--font);align-items:center}
.roi-l div:first-child{border-top:0;font-weight:700;background:#eef1f6;position:sticky;top:0}
.roi-l a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.roi-m{width:100%;max-width:560px;border:1px solid #c9ced8;border-radius:12px;background:#f7f8fb}
@media(max-width:560px){.roi-l div{grid-template-columns:58px 62px 50px 54px minmax(0,1fr);gap:5px;font-size:11.5px}}`;
  document.head.appendChild(st);

  function sectiune() {
    const ref = document.querySelector('nav#tabs [data-t="costuri"]') || document.querySelector('nav#tabs [data-t="urbanism"]');
    if (ref && !document.querySelector('nav [data-t="roi"]')) {
      const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = "roi"; b.textContent = "ROI"; b.onclick = () => window.showTab("roi"); ref.after(b);
    }
    if (!document.getElementById("roi")) { const s = document.createElement("section"); s.id = "roi"; s.hidden = true; document.querySelector(".wrap")?.appendChild(s); }
    try { EL.roi = "roi"; EL_INV.roi = "roi"; } catch (e) {}
    return document.getElementById("roi");
  }

  function calc(h, pret, luni, vand) {
    const cost0 = h.mp_teren * h.pret_intrare + h.cost_puz + h.mp_teren * h.drumuri_utilitati_mp + (h.finantare_eur || 0);
    const mpv = h.mp_teren * vand / 100;
    const venit = mpv * pret, taxe = venit * (h.taxe_pct_venit || 0) / 100;
    const cost = cost0 + taxe, brut = venit - cost, imp = Math.max(0, brut) * (h.impozit_pct_profit || 0) / 100, profit = brut - imp;
    const roi = profit / cost, an = roi > -1 ? Math.pow(1 + roi, 12 / luni) - 1 : NaN;
    return { cost, cost0, mpv, venit, profit, roi, an, zero: (cost0) / (mpv * (1 - (h.taxe_pct_venit || 0) / 100)) };
  }

  function harta(R) {
    const P = R.poligon, pts = R.comparative;
    const lat0 = P.reduce((s, p) => s + p[1], 0) / P.length, lon0 = P.reduce((s, p) => s + p[0], 0) / P.length, k = Math.cos(lat0 * Math.PI / 180);
    const xy = (lon, lat) => [(lon - lon0) * 111320 * k, -(lat - lat0) * 110574];
    const all = pts.map(p => xy(p.lon, p.lat)).concat(P.map(p => xy(p[0], p[1])));
    const R0 = Math.max(150, ...all.map(a => Math.max(Math.abs(a[0]), Math.abs(a[1])))) * 1.08, W = 520, sc = W / 2 / R0, c = W / 2;
    const X = a => (c + a[0] * sc).toFixed(1), Y = a => (c + a[1] * sc).toFixed(1);
    const poly = P.map(p => { const a = xy(p[0], p[1]); return X(a) + "," + Y(a); }).join(" ");
    const dots = pts.map(p => { const a = xy(p.lon, p.lat); const col = p.tip === "intravilan" ? "#1f6fd1" : "#b7791f"; return `<circle cx="${X(a)}" cy="${Y(a)}" r="4.5" fill="${col}" stroke="#fff" stroke-width="1"><title>${esc(p.eur_mp)} €/mp · ${esc(p.mp)} mp · ${esc(p.dist_m)} m</title></circle>`; }).join("");
    const rings = [500, 1000, 2000].filter(r => r * sc < c).map(r => `<circle cx="${c}" cy="${c}" r="${r * sc}" fill="none" stroke="#9aa3b2" stroke-dasharray="4 4"/><text x="${c + r * sc - 4}" y="${c - 4}" font-size="11" text-anchor="end" fill="#5b6475">${r} m</text>`).join("");
    return `<svg class="roi-m" viewBox="0 0 ${W} ${W}" role="img" aria-label="Harta comparativelor">${rings}<polygon points="${poly}" fill="#d64545" fill-opacity=".6" stroke="#a01f1f" stroke-width="1.5"/>${dots}
<g font-size="12" fill="#1b2230"><circle cx="14" cy="${W - 40}" r="5" fill="#1f6fd1"/><text x="24" y="${W - 36}">intravilan</text><circle cx="100" cy="${W - 40}" r="5" fill="#b7791f"/><text x="110" y="${W - 36}">extravilan / agricol</text><rect x="14" y="${W - 26}" width="12" height="8" fill="#d64545" fill-opacity=".6" stroke="#a01f1f"/><text x="32" y="${W - 18}">terenul (10.000 mp)</text></g></svg>`;
  }

  function mediiHtml(R) {
    const M = R.medii; if (!M) return "";
    const H = R.ipoteze, f = v => nf(v, 1), card = (t, o) => o && o.n ? `<div><b>${t}</b><br>medie <b>${f(o.medie)}</b> · mediană ${f(o.mediana)} · ${f(o.min)}–${f(o.max)} €/mp<br><span class="roi-n">${o.n} anunț${o.n === 1 ? "" : "uri"}</span></div>` : `<div><b>${t}</b><br>fără anunțuri</div>`;
    const pc = (v, m) => m ? (v >= m ? "+" : "−") + nf(Math.abs(v / m - 1) * 100, 0) + " %" : "—";
    const z = M.zona, p = M.piata, vm = (H.pret_min + H.pret_max) / 2;
    return `<h3>Media zonei și a pieței (€/mp)</h3><div class="roi-c">
${card("Zonă · parcele construibile (" + esc(z.descriere) + ")", z.intravilan)}${card("Zonă · teren de dezvoltat (agricol / extravilan)", z.extravilan)}
${card("Piață · parcele construibile (" + esc(p.descriere) + ")", p.intravilan)}${card("Piață · teren de dezvoltat (agricol / extravilan)", p.extravilan)}</div>
<p class="roi-n"><b>Ipotezele față de medii:</b> vânzare ${H.pret_min}–${H.pret_max} €/mp față de media construibilă a zonei: ${pc(H.pret_min, z.intravilan.medie)} … ${pc(H.pret_max, z.intravilan.medie)}, a pieței: ${pc(H.pret_min, p.intravilan.medie)} … ${pc(H.pret_max, p.intravilan.medie)}. Cumpărare ${H.pret_intrare} €/mp față de media terenului de dezvoltat a zonei: ${pc(H.pret_intrare, z.extravilan.medie)}, a pieței: ${pc(H.pret_intrare, p.extravilan.medie)}. <mark>!</mark> Prețuri cerute în anunțuri; la teren de dezvoltat numărul de anunțuri e mic.</p>`;
  }

  function monta(R) {
    const sec = sectiune(); if (!sec) return;
    const H = R.ipoteze;
    const campuri = [
      ["mp_teren", "Teren (mp)", "ipoteză Manu", ""], ["pret_intrare", "Preț de cumpărare (€/mp)", "ipoteză Manu", ""],
      ["cost_puz", "Cost PUZ (€)", "ipoteză Manu", ""], ["drumuri_utilitati_mp", "Drumuri și utilități (€/mp teren)", "ipoteză Manu", ""],
      ["vandabil_pct", "Suprafață vandabilă (% din teren)", "ipoteză; după cedarea drumurilor și a spațiului verde", ""],
      ["pret_min", "Preț vânzare minim (€/mp)", "ipoteză Manu", ""], ["pret_max", "Preț vânzare maxim (€/mp)", "ipoteză Manu", ""],
      ["luni_min", "Durată minimă (luni)", "ipoteză Manu", ""], ["luni_max", "Durată maximă (luni)", "ipoteză Manu", ""],
      ["taxe_pct_venit", "! Taxe, notar, comision (% din venit)", "neincluse în ipoteze; implicit 0", "ex"],
      ["impozit_pct_profit", "! Impozit (% din profit)", "neinclus în ipoteze; implicit 0", "ex"],
      ["finantare_eur", "! Finanțare, dobândă (€)", "neinclusă în ipoteze; implicit 0", "ex"]];
    const sI = R.stat.intravilan, sE = R.stat.extravilan, C = R.comparative;
    sec.innerHTML = `<div class="roi-w ac-k1">
<h2>ROI · cumpărare cu realizare PUZ</h2>
<p class="roi-n">Terenul unit (CF 419740 + CF 419748, 10.000 mp). Ipotezele sunt ale lui Manu (12.11.2026) și se pot modifica; câmpurile cu „!” sunt costuri neincluse în ipotezele inițiale. ${esc(R.vandabil_sursa)}.</p>
${mediiHtml(R)}
<div class="roi-in">${campuri.map(c => `<label class="${c[3]}"><span>${esc(c[1])}</span><input type="number" step="any" data-k="${c[0]}" value="${H[c[0]]}" inputmode="decimal"><small>${esc(c[2])}</small></label>`).join("")}</div>
<div class="roi-k" id="roi-k"></div>
<h3>Sensibilitate: profit și ROI total</h3><div class="roi-sc" id="roi-s"></div>
<h3>Comparative din vecinătate</h3>
<p class="roi-n">Anunțuri de teren din vecinătate, până la 2 km, câte unul pe proprietate; prețuri cerute, nu tranzacții. <mark>!</mark> Terenurile agricole/extravilane sunt puține (${sE.n}); valorile extreme pot fi prețuri scrise greșit în anunț: se citește mediana.</p>
<div class="roi-c" id="roi-c"></div>
<div id="roi-poz" class="roi-n"></div>
${harta(R)}
<div class="roi-l" id="roi-l"></div>
</div>`;

    const grup = (t, titlu, comp) => { const s = R.stat[t]; if (!s.n) return `<div><b>${titlu}</b><br>fără anunțuri</div>`; return `<div><b>${titlu}</b><br>${s.n} anunțuri · minim ${nf(s.min, 1)} · mediană ${nf(s.mediana, 1)} · maxim ${nf(s.max, 1)} €/mp<br><span class="roi-n">comparabil cu ${comp}</span></div>`; };
    document.getElementById("roi-c").innerHTML = grup("intravilan", "Intravilan / parcelă construibilă", "prețul de ieșire (110–130 €/mp)") + grup("extravilan", "Agricol / extravilan", "prețul de intrare (30 €/mp)");
    const fa = (p, a, b) => C.filter(x => x.tip === "intravilan" && x.eur_mp >= a && x.eur_mp <= b).length;
    const nI = C.filter(x => x.tip === "intravilan").length;
    const sub = C.filter(x => x.tip === "intravilan" && x.eur_mp < H.pret_min).length, intre = C.filter(x => x.tip === "intravilan" && x.eur_mp >= H.pret_min && x.eur_mp <= H.pret_max).length, peste = C.filter(x => x.tip === "intravilan" && x.eur_mp > H.pret_max).length;
    const ex = C.filter(x => x.tip === "extravilan");
    document.getElementById("roi-poz").innerHTML = `Poziționare (prețuri cerute): din ${nI} anunțuri intravilane, ${sub} sunt sub ${H.pret_min} €/mp, ${intre} între ${H.pret_min} și ${H.pret_max}, ${peste} peste ${H.pret_max}; mediana intravilană ${nf(sI.mediana, 1)} €/mp. Intrarea la ${H.pret_intrare} €/mp se compară cu ${ex.length ? `${ex.length} anunț${ex.length === 1 ? "" : "uri"} agricol${ex.length === 1 ? "" : "e"}: ${ex.map(x => nf(x.eur_mp, 1)).join(", ")} €/mp` : "niciun anunț agricol în rază"}.`;
    document.getElementById("roi-l").innerHTML = `<div><span>€/mp</span><span>mp</span><span>dist.</span><span>dată</span><span>anunț</span></div>` + C.map(x => `<div style="border-left:4px solid ${x.tip === "intravilan" ? "#1f6fd1" : "#b7791f"}"><span>${nf(x.eur_mp, 1)}</span><span>${nf(x.mp)}</span><span>${nf(x.dist_m)} m</span><span>${esc(x.data.slice(5).split("-").reverse().join("."))}</span><a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.portal)} · ${esc(x.tip)}${x.strada ? " · " + esc(x.strada) : ""}</a></div>`).join("");

    const refresh = () => {
      sec.querySelectorAll("input[data-k]").forEach(i => { const v = parseFloat(i.value); H[i.dataset.k] = isFinite(v) ? v : 0; });
      const a = calc(H, H.pret_min, H.luni_max, H.vandabil_pct), b = calc(H, H.pret_max, H.luni_min, H.vandabil_pct);
      const pc = v => isFinite(v) ? nf(v * 100, 0) + " %" : "—";
      document.getElementById("roi-k").innerHTML = [
        ["Cost total", eur(a.cost), `teren ${eur(H.mp_teren * H.pret_intrare)} + PUZ ${eur(H.cost_puz)} + drumuri/utilități ${eur(H.mp_teren * H.drumuri_utilitati_mp)}`],
        ["Suprafață vandabilă", nf(a.mpv) + " mp", H.vandabil_pct + " % din " + nf(H.mp_teren) + " mp"],
        ["Venit", eur(a.venit) + " – " + eur(b.venit), `la ${H.pret_min}–${H.pret_max} €/mp`],
        ["Profit", eur(a.profit) + " – " + eur(b.profit), "venit minus cost total"],
        ["ROI total", pc(a.roi) + " – " + pc(b.roi), "profit / cost"],
        ["ROI anualizat", pc(a.an) + " – " + pc(b.an), `${H.luni_max} luni la ${H.pret_min} € până la ${H.luni_min} luni la ${H.pret_max} €`],
        ["Preț de echilibru", nf(a.zero, 1) + " €/mp", "preț de vânzare la care profitul e zero"]
      ].map(c => `<div><span>${esc(c[0])}</span><b>${c[1]}</b><span>${c[2]}</span></div>`).join("");
      const prețuri = [110, 120, 130].map(p => p), vs = [65, 75, 85];
      document.getElementById("roi-s").innerHTML = `<table class="roi-t"><thead><tr><th>Preț €/mp \\ vandabil</th>${vs.map(v => `<th>${v} %</th>`).join("")}</tr></thead><tbody>` +
        prețuri.map(p => `<tr><td>${p} €/mp</td>${vs.map(v => { const r = calc(H, p, H.luni_max, v); return `<td>${eur(r.profit)}<br>${pc(r.roi)}</td>`; }).join("")}</tr>`).join("") + `</tbody></table>`;
    };
    sec.querySelectorAll("input[data-k]").forEach(i => i.addEventListener("input", refresh));
    refresh();
  }

  setInterval(async () => {
    try {
      const Dd = typeof D !== "undefined" ? D : null; if (!Dd || !Dd.id || cur === Dd.id || !document.querySelector('nav#tabs [data-t="urbanism"]')) return;
      cur = Dd.id;
      const r = await fetch(`p/${Dd.id}/roi.json`); if (!r.ok) return;
      const R = await r.json(); if (R && R.activ) monta(R);
    } catch (e) { console.warn("roi", e); }
  }, 700);
})();
