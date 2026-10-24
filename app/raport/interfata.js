/* Raport \u00een cre\u0219tere \u2014 interfa\u021ba: bar\u0103 lateral\u0103 de capitole, sus maxim 2 r\u00e2nduri, comutator Simplu / Complet, tabelul \u201eStare date\u201d.
   Cerut de Manu, 20.10.2026: harta s\u0103 aib\u0103 loc; interfa\u021b\u0103 simpl\u0103 = capitolele, harta \u0219i explica\u021bia fiec\u0103ruia, plus un tabel cu bife:
   c\u00e2t de gata e fiecare capitol, c\u00e2t din date e desc\u0103rcat local, c\u00e2t e finisat (ready to use), ce capacitate de stocare cere, regulile \u0219i organizarea.
   Date: surse.json (colectare_date/surse.json din DD): capitole_stare, surse[].desc/fin/gb, organizare.
   Nu ating #rezumat. Se leag\u0103 de index.html prin: .wrap, nav, showTab, EL/EL_INV (obiecte globale mutabile), D (proprietatea curent\u0103). */
(function () {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => Number(v).toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const gb = v => v >= 100 ? nf(v, 0) + " GB" : v >= 1 ? nf(v, 1) + " GB" : v >= 0.01 ? nf(v * 1000, 0) + " MB" : v > 0 ? "< 10 MB" : "\u2014";
  let SR = null, simplu = true, nivel = "simplu";
  const VM = new URLSearchParams(location.search).get("vm");   // vedere paralel\u0103: nivelul vine din adres\u0103, nu din localStorage
  nivel = "complet";   // 23.10.2026 (Manu): dispare diferenta dintre raportul simplu si cel complet; ramane un singur raport
  simplu = nivel !== "complet";

  function css() {
    const s = document.createElement("style"); s.id = "ui-css";
    s.textContent = `
/* ---- layout: bar\u0103 lateral\u0103 + zon\u0103 larg\u0103 pentru hart\u0103 ---- */
.wrap{max-width:1480px!important;display:grid!important;grid-template-columns:176px minmax(0,1fr);column-gap:20px;row-gap:10px;align-items:start;padding-block:10px 40px!important}
.wrap>.brand,.wrap>header{grid-column:1/-1}
.wrap>.mbar{grid-row:1}.wrap>.brand{grid-row:2}.wrap>header{grid-row:3}
.wrap>.brand{padding-bottom:0;align-items:center}
.wrap>header{display:flex;align-items:baseline;gap:6px 16px;flex-wrap:wrap;border-bottom:1px solid var(--line);padding-bottom:8px}
.wrap>header h1{font-size:20px!important;margin:0}
.wrap>header .sub{font-size:11.5px;margin:0}
.wrap>nav#tabs{grid-column:1;grid-row:4/span 80;position:sticky;top:8px;flex-direction:column!important;flex-wrap:nowrap!important;border-bottom:0!important;padding:0 8px 0 0!important;max-height:calc(100vh - 16px);overflow-y:auto;gap:1px!important;scrollbar-width:thin}
.wrap>nav#tabs .soon{display:none}
.wrap>nav#tabs>button,.wrap>nav#tabs .ng button{width:100%;text-align:left;padding:5px 8px!important;font-size:13px!important;border-radius:6px}
.wrap>nav#tabs .ng{display:flex!important;flex-direction:column;flex-wrap:nowrap!important;border-right:0!important;margin:6px 0 0!important;padding:0!important;gap:1px!important}
.wrap>nav#tabs .nl{padding:2px 8px!important;font-size:10px!important;width:auto!important}
.wrap>section,.wrap>#builder{grid-column:2;min-width:0}
.bld-btn{padding:3px 9px!important;font-size:12px!important}
.brand .bld-bar{gap:5px!important}
.brand select{padding:3px 8px;font-size:13px}
.hm-c{min-height:0}
.wrap>.mbar{grid-column:1/-1;padding:2px 0 0!important;margin:0!important;border-bottom:0!important;gap:4px 6px!important}
.mbar a{padding:2px 9px!important;font-size:12px!important}
.mbar .ml{font-size:10px!important}
@media (max-width:900px){
 .wrap{grid-template-columns:minmax(0,1fr)!important}
 .wrap>nav#tabs{grid-column:1;grid-row:4;position:static;flex-direction:row!important;overflow-x:auto;overflow-y:visible;max-height:none;border-bottom:1px solid var(--line)!important;padding:0 0 6px!important}
 .wrap>nav#tabs>button,.wrap>nav#tabs .ng button{width:auto;white-space:nowrap}
 .wrap>nav#tabs .ng{flex-direction:row;margin:0!important;align-items:center}
 .wrap>nav#tabs .nl{display:none}
 .wrap>section,.wrap>#builder{grid-column:1}
}
/* ---- interfa\u021ba simpl\u0103: capitolele, harta \u0219i explica\u021bia; restul \u00een \u201eComplet\u201d ---- */
body.simplu section .charts,body.simplu section .fisa,body.simplu section .scroll,body.simplu section .ex,body.simplu section .dn,body.simplu section .sk,
body.simplu section .note,body.simplu #sumcards,body.simplu #fnote,body.simplu #urbanism .ublock+.ublock,body.simplu #pvtab,body.simplu #pvcards,
body.simplu section .sr-link,body.simplu section table:not(.sr-t):not(.st-t){display:none!important}
/* regula de prezentare (Manu, 21.10): chenarele cu cifre r\u0103m\u00e2n vizibile \u0219i \u00een Simplu, deasupra h\u0103r\u021bii */
/* excep\u021bie: orice element cu clasa .keep r\u0103m\u00e2ne vizibil \u0219i \u00een Simplu (tabelul de ad\u00e2ncimi la inunda\u021bii etc.) */
body.simplu section .keep{display:block!important}
body.simplu section .keep table{display:table!important}
body.simplu section .keep .scroll,body.simplu section .keep .cards,body.simplu section .keep .charts{display:block!important}
body.simplu #surse .note,body.simplu #stare .note{display:block!important}
body.simplu #surse .scroll,body.simplu #surse table,body.simplu #stare .scroll,body.simplu #stare table{display:block!important}
body.simplu #surse table{display:table!important}
body.simplu #stare table{display:table!important}
/* ---- trei lungimi ale raportului \u00eentreg (Manu, 22.10): Rezumat ~3 pagini, Simplu ~9, Complet ~29 ---- */
body.n-rezumat #rezumat>#sumhart,body.n-rezumat #rezumat>#sumauto,body.n-rezumat #rezumat>#concluzii,body.n-rezumat #rezumat>#sumcards,body.n-rezumat #rezumat>#istoric,body.n-rezumat #rezumat>#ter,body.n-rezumat #rezumat>p.note{display:none!important}
body.n-simplu #rezumat>#sumcards,body.n-simplu #rezumat>#istoric,body.n-simplu #rezumat>#ter{display:none!important}
body.n-rezumat.raport-complet section.in-complet>*{display:none!important}
body.n-rezumat.raport-complet section.in-complet>.rc-cap,body.n-rezumat.raport-complet section.in-complet>.vh,body.n-rezumat.raport-complet section.in-complet>.verd,body.n-rezumat.raport-complet section.in-complet>.cards{display:block!important}
body.n-rezumat.raport-complet section.in-complet>.cards{display:grid!important}
body.n-rezumat.raport-complet section.in-complet>.cards>.card:nth-child(n+4){display:none!important}
body.n-rezumat.raport-complet section.in-complet>div:nth-child(2):not(.verd):not(.cards):not(.keep):not(#ind-box){display:block!important}
body.n-rezumat.raport-complet section.in-complet .keep{display:none!important}
body.n-simplu.raport-complet section.in-complet .keep{display:none!important}
body.n-simplu.raport-complet section.in-complet>.cards>.card:nth-child(n+5){display:none!important}
/* ---- tabelul \u201eStare date\u201d ---- */
.st-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.st-t{width:100%;border-collapse:collapse;font:13px var(--font)}
.st-t th{font:600 10.5px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:var(--muted);text-align:left;padding:7px 6px;border-bottom:1.5px solid var(--fg);vertical-align:bottom}
.st-t td{text-align:left;padding:7px 6px;border-bottom:1px solid var(--line);vertical-align:middle;font-family:var(--font)}
.st-t td.n{text-align:right;font-family:var(--mono);white-space:nowrap}
.st-t a{color:var(--fg);font-weight:600;cursor:pointer;text-decoration:underline;text-decoration-color:var(--line)}
.st-c{display:grid;grid-template-columns:18px 1fr;gap:6px;align-items:center;min-width:120px}
.st-c input{width:16px;height:16px;margin:0;accent-color:var(--ok)}
.st-b{position:relative;height:16px;border-radius:4px;background:color-mix(in srgb,var(--fg) 8%,transparent);overflow:hidden}
.st-b i{position:absolute;inset:0 auto 0 0;border-radius:4px}
.st-b span{position:absolute;inset:0;display:flex;align-items:center;padding-left:6px;font:600 11px var(--mono);color:var(--fg)}
.st-r{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px}
.st-box{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px}
.st-box ul{margin:6px 0 0;padding-left:18px;display:grid;gap:4px;font-size:13px}
.st-box code{font:12px var(--mono)}
@media (max-width:700px){.st-t thead{display:none}.st-t tr{display:block;padding:8px 0;border-bottom:1px solid var(--line)}.st-t td{display:block;border:0;padding:3px 0}.st-t td.n{text-align:left}}`;
    document.head.appendChild(s);
  }

  function modUi() {
    simplu = nivel !== "complet";
    document.body.classList.toggle("simplu", simplu);
    ["rezumat", "simplu", "complet"].forEach(n => document.body.classList.toggle("n-" + n, n === nivel));
    const b = document.querySelector("#ui-mod"); if (!b) return;
    b.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.m === nivel)));
  }
  function montaj() {
    const brand = document.querySelector(".brand");
    if (brand && !document.querySelector("#ui-mod")) {
      const d = document.createElement("div"); d.id = "ui-mod"; d.className = "bld-bar"; d.setAttribute("role", "group"); d.setAttribute("aria-label", "Interfa\u021ba");
      d.innerHTML = `<button type="button" class="bld-btn" data-m="rezumat">Rezumat</button><button type="button" class="bld-btn" data-m="simplu">Simplu</button><button type="button" class="bld-btn" data-m="complet">Complet</button>`;
      d.onclick = e => { const b = e.target.closest("button"); if (!b) return; nivel = b.dataset.m; try { if (!VM) localStorage.setItem("ric-ui", nivel); } catch (er) {} modUi(); };
      brand.appendChild(d);
    }
    // butonul \u201eStare date\u201d \u00een grupul \u201eDespre raport\u201d, sec\u021biunea lui
    const grup = [...document.querySelectorAll("nav .ng")].find(g => g.querySelector('[data-t="surse"]'));
    if (grup && !grup.querySelector('[data-t="stare"]')) {
      const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = "stare"; b.textContent = "Stare date";
      b.onclick = () => window.showTab("stare"); grup.insertBefore(b, grup.querySelector('[data-t="surse"]'));
    }
    if (!document.getElementById("stare")) {
      const s = document.createElement("section"); s.id = "stare"; s.hidden = true; document.querySelector(".wrap").appendChild(s);
    }
    try { EL.stare = "stare"; EL_INV.stare = "stare"; } catch (e) {}
  }

  const bara = (v, col) => `<div class="st-b" role="img" aria-label="${v}%"><i style="width:${v}%;background:color-mix(in srgb,${col} 38%,transparent)"></i><span>${v}%</span></div>`;
  const celula = (v, prag, col) => `<div class="st-c"><input type="checkbox" disabled ${v >= prag ? "checked" : ""} aria-label="${v >= prag ? "da" : "nu"}">${bara(v, col)}</div>`;

  function stare() {
    const sec = document.getElementById("stare"); if (!sec || !SR) return;
    const C = SR.capitole_stare || {}, T = SR.total || {}, O = SR.organizare || {}, cap = O.capacitate || {};
    const ks = Object.keys(C).filter(k => C[k].gata >= 30 || C[k].surse.length);
    const med = f => Math.round(ks.reduce((a, k) => a + C[k][f], 0) / ks.length);
    sec.innerHTML = `<div><h2>Stare date</h2><p class="lead">C\u00e2t de gata e fiecare capitol, c\u00e2t din datele lui avem desc\u0103rcat pe serverul nostru, c\u00e2t e finisat (curat, indexat, ready to use) \u0219i ce capacitate de stocare cere. Procentele sunt estim\u0103ri [E], \u021binute \u00een registrul de surse; bifa \u00eenseamn\u0103 c\u0103 pragul e atins.</p></div>
      <div class="st-k">${[[med("gata") + "%", "gata de folosit, media capitolelor"], [T.desc + "%", "date desc\u0103rcate local"], [T.fin + "%", "finisate local"], [gb(T.gb_descarcat), `desc\u0103rcat din ${gb(T.gb)} necesari (Timi\u0219)`], [gb(cap.recomandat_timis_gb), "disc recomandat, Timi\u0219, cu rezerv\u0103 \u0219i copie"], [gb(cap.recomandat_tara_gb), "disc recomandat, toat\u0103 \u021bara"]].map(([b, t]) => `<div class="card"><b>${b}</b><span>${t}</span></div>`).join("")}</div>
      <div class="scroll"><table class="st-t"><thead><tr><th>Capitol</th><th>Gata de folosit<br>(bif\u0103 \u2265 80%)</th><th>Date desc\u0103rcate local<br>(bif\u0103 \u2265 90%)</th><th>Finisate local, ready to use<br>(bif\u0103 \u2265 90%)</th><th>Mai trebuie finisat</th><th>Timi\u0219</th><th>Rom\u00e2nia</th></tr></thead><tbody>
      ${ks.map(k => { const c = C[k], are = !!document.getElementById(k); return `<tr><td>${are ? `<a data-go="${k}" tabindex="0" role="link">${esc(c.nume)}</a>` : `<b>${esc(c.nume)}</b>`}<div class="note" style="margin:0">${c.surse.length} surse</div></td>
        <td>${celula(c.gata, 80, "var(--ok)")}</td><td>${celula(c.desc, 90, "#2c5c9c")}</td><td>${celula(c.fin, 90, "var(--accent)")}</td><td>${esc(c.mai_trebuie)}</td><td class="n">${gb(c.gb)}</td><td class="n">${gb(c.gb_tara)}</td></tr>`; }).join("")}
      </tbody></table></div>
      <p class="note">M\u0103rimile pe capitol se adun\u0103 \u0219i se suprapun c\u00e2nd dou\u0103 capitole folosesc aceea\u0219i surs\u0103 (de exemplu harta OSM); totalul de sus num\u0103r\u0103 fiecare surs\u0103 o singur\u0103 dat\u0103. Detaliul pe surs\u0103 e \u00een fila \u201eSurse\u201d.</p>
      <div class="st-r"><div class="st-box"><h3>Capacitate de stocare</h3><ul>
        <li><b>${gb(cap.timis_gb)}</b> pentru Timi\u0219 \u0219i Banat (${gb(T.gb_descarcat)} deja desc\u0103rca\u021bi).</li>
        <li><b>${gb(cap.tara_gb)}</b> pentru toat\u0103 Rom\u00e2nia; peste 60% sunt plan\u0219ele scanate ale PUG-urilor MDLPA \u0219i rasterele de inunda\u021bii ANAR.</li>
        <li>Recomandat: <b>${gb(cap.recomandat_timis_gb)}</b> (Timi\u0219) sau <b>${gb(cap.recomandat_tara_gb)}</b> (Rom\u00e2nia), cu 30% pentru fi\u0219ierele finisate \u0219i copia de siguran\u021b\u0103.</li></ul><p class="note">${esc(cap.nota || "")}</p></div>
        <div class="st-box"><h3>Reguli \u0219i organizare</h3><p class="note" style="margin:0">${esc(O.prag_gata || "")}</p><ul>${(O.reguli || []).map(r => `<li>${esc(r)}</li>`).join("")}</ul></div></div>`;
    sec.querySelectorAll("[data-go]").forEach(a => { const go = () => window.showTab(a.dataset.go); a.onclick = go; a.onkeydown = e => e.key === "Enter" && go(); });
  }

  function marcheaza() {   // sec\u021biunile care au hart\u0103: \u00een \u201eSimplu\u201d \u00ee\u0219i ascund cardurile, ca harta s\u0103 aib\u0103 loc
    document.querySelectorAll("section.vx,#inundatii,#insorire,#urbanism,#pv").forEach(s => s.classList.toggle("cuharta", !!s.querySelector(".hmh canvas,canvas,figure,.pz,.tmap,svg.pzmap")));
  }

  async function porneste() {
    css(); montaj(); modUi();
    try { SR = await (await fetch("surse.json", { cache: "no-cache" })).json(); } catch (e) { SR = null; }
    stare(); marcheaza();
    setInterval(() => { marcheaza(); if (SR && document.getElementById("stare") && !document.getElementById("stare").children.length) stare(); }, 1200);
  }
  window.RIC_UI = { porneste, stare };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
