/* Raport _ Cartea Casei - RAPORTUL GENERIC (Manu, 23.10.2026): lista capitolelor, fiecare cu poza mare si un text scurt care doar enumera,
   fara promisiuni, ce se poate gasi in capitol. Cand alegi o locatie (selectorul de sus sau butonul de aici), raportul trece pe locatia aleasa:
   aceleasi capitole cu aceleasi poze, iar dedesubt hartile, datele, graficele si textele locatiei.
   Generic = pagina de pornire (fara #id in adresa). Nu este un <section> (showTab ascunde toate section-urile). */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = s => document.querySelector(s);
  /* lista capitolelor vine din schema_capitole.json (E1, 24.10.2026), prin schema.js: [id, grup, titlu, enumerare]; fara constante duplicate aici */
  let CAP = [], PREF = {}, ALIAS = {};
  function dinSchema(S) {
    CAP = (S.capitole || []).map(c => [c.id, c.grup, c.titlu, c.enumerare]);
    PREF = Object.fromEntries((S.grupuri || []).map(g => [g.id, g.prefix]));
    ALIAS = Object.fromEntries((S.capitole || []).filter(c => c.poza_alias).map(c => [c.id, c.poza_alias]));
  }

  let IDX = {}, LIST = [], activ = false;
  const princ = () => { try { return JSON.parse(localStorage.getItem("ric-ilu-princ") || "{}") || {}; } catch (e) { return {}; } };
  function foto(k) {
    k = (RIC_ASPECT_OK(k) ? k : (ALIAS[k] || k));
    const L = IDX[k] || []; if (!L.length) return null;
    const p = (window.RIC_ASPECT && RIC_ASPECT.imagine(k)) || null, x = L.find(y => y.f === p) || (p ? { f: p } : null) || L[0]; return x;
  }

  const RIC_ASPECT_OK = k => !!(IDX[k] && IDX[k].length) || !!(window.RIC_ASPECT && RIC_ASPECT.imagine(k));
  function css() {
    if ($("#gn-css")) return;
    const s = document.createElement("style"); s.id = "gn-css";
    s.textContent = `
#generic{display:none;grid-column:2;grid-row:3/span 80;min-width:0;flex-direction:column;gap:22px}
body.generic #generic{display:flex}
body.generic .wrap>section,body.generic .wrap>header,body.generic #builder,body.generic #rv-p,body.generic .rv{display:none!important}
.gn-cov{position:relative;border-radius:18px;overflow:hidden;background:#e9e4da;aspect-ratio:21/9;max-height:460px}
.gn-cov img{width:100%;height:100%;object-fit:cover;display:block}
.gn-cov .gn-ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;gap:10px;padding:28px 30px;background:linear-gradient(90deg,rgba(10,14,24,.72),rgba(10,14,24,.2) 70%,transparent),linear-gradient(transparent 50%,rgba(10,14,24,.5));color:#fff}
.gn-k{font:700 12px var(--mono);letter-spacing:.1em;color:#ffd9a0}
.gn-cov h1{font:800 clamp(30px,4.6vw,52px)/1.02 var(--font);letter-spacing:-.025em;margin:0;max-width:16ch;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.35)}
.gn-cov p{margin:0;font:16px/1.45 var(--font);max-width:46ch;color:#f3f0ea}
.gn-tx{display:flex;flex-direction:column;gap:10px}
.gn-go{display:flex;flex-wrap:wrap;gap:8px 10px;align-items:center;margin-top:6px}
.gn-go select{font:500 14px var(--font);padding:9px 12px;border-radius:10px;border:0;background:#fff;color:#1a1e2a;max-width:300px}
.gn-go button{font:700 14px var(--font);padding:10px 18px;border-radius:10px;border:0;background:#ffb52e;color:#1a1e2a;cursor:pointer}
.gn-go button:hover{filter:brightness(1.06)}
.gn-gr{font:700 13px var(--mono);letter-spacing:.06em;color:var(--accent);margin:8px 0 -8px;padding-top:10px;border-top:1px solid var(--line)}
.gn-c{display:grid;grid-template-columns:57% minmax(0,1fr);gap:0;border-radius:16px;overflow:hidden;background:var(--panel);border:1px solid var(--line);scroll-margin-top:12px}
.gn-i{aspect-ratio:3/2;background:color-mix(in srgb,var(--c) 14%,#fff);position:relative}.gn-i img{width:100%;height:100%;object-fit:cover;display:block}
.gn-t{padding:22px 24px;display:flex;flex-direction:column;justify-content:center;gap:10px}
.gn-t .gn-n{font:700 12px var(--mono);letter-spacing:.08em;color:var(--c)}
.gn-t h2{font:800 clamp(22px,2.4vw,30px)/1.1 var(--font);letter-spacing:-.02em;margin:0}
.gn-t p{margin:0;font:15px/1.55 var(--font);color:var(--muted)}
.gn-t p b{color:var(--fg);font-weight:600}
.gn-f{font:12.5px/1.5 var(--font);color:var(--muted);padding:6px 4px 20px;max-width:75ch}
.gn-colab{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;padding:12px 16px;border-radius:12px;background:var(--panel);border:1px solid var(--line);font:13px var(--font)}
.gn-colab b{font-weight:700}.gn-colab span{display:flex;flex-wrap:wrap;gap:6px}.gn-colab i{font-style:normal;padding:3px 10px;border-radius:99px;background:color-mix(in srgb,var(--accent) 10%,transparent);color:var(--fg)}
.rep-foot{display:flex;gap:18px;align-items:flex-start;padding:18px 4px 30px;margin-top:6px;border-top:1px solid var(--line);grid-column:2}
.rep-foot .rf-t{display:flex;flex-direction:column;gap:10px}.rep-foot p{margin:0;font:12.5px/1.55 var(--font);color:var(--muted);max-width:78ch}.rep-foot .rf-j{padding:10px 12px;border-radius:10px;background:color-mix(in srgb,var(--fg) 4%,transparent)}.rep-foot .rf-j b{color:var(--fg)}
.rep-foot .rf-qr{flex:none;width:84px;height:84px;background:#fff;border-radius:6px;padding:3px;box-sizing:border-box}.rf-qr svg{width:100%;height:100%;display:block}
body.generic .rf-loc{display:none}body:not(.generic) #rep-foot-g{display:none}
#generic .rep-foot{grid-column:auto}
@media (max-width:760px){.gn-c,.gn-c.fl{grid-template-columns:1fr!important}.gn-c.fl .gn-i{order:0}.gn-cov{aspect-ratio:4/5;max-height:none}.gn-cov .gn-ov{padding:18px}.gn-t{padding:16px}}
.gn-c{grid-template-columns:minmax(0,1fr) minmax(220px,31%)!important}
.gn-c[data-df="1"]{grid-template-columns:minmax(220px,31%) minmax(0,1fr)!important}.gn-c[data-df="1"] .gn-i{order:2}
.gn-i{aspect-ratio:auto!important;min-height:clamp(300px,36vw,540px);overflow:hidden}.gn-i>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.gn-h{position:absolute;left:0;top:0;right:30%;padding:22px 26px 50px;background:radial-gradient(130% 150% at 0 0,rgba(8,12,20,.6),rgba(8,12,20,.2) 50%,transparent 72%);display:flex;flex-direction:column;gap:6px}
.gn-h h2{margin:0;font-family:"Fraunces",Georgia,serif;font-weight:700;font-size:clamp(28px,3.4vw,46px);line-height:1.03;letter-spacing:-.015em;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.45)}
.gn-h .gn-n{font:700 13px var(--mono);letter-spacing:.08em;color:#ffd9a0}
.gn-t{padding:20px 22px!important}.gn-t p{font:15.5px/1.55 var(--font)!important;color:var(--fg)!important}.gn-t p b{display:block;font:700 12px var(--mono)!important;letter-spacing:.04em;color:var(--c)!important;margin-bottom:6px}
.gn-gr{text-transform:none!important;font:700 15px var(--font)!important;letter-spacing:0!important}
#generic,#generic *{text-transform:none}
.rep-foot .rf-qr{display:none!important}
@media print{#generic{display:none!important}}`;
    document.head.appendChild(s);
  }

  const FOOT = "Con\u021binutul fiec\u0103rui capitol depinde de datele publice \u0219i private disponibile pentru loca\u021bia aleas\u0103; Pentru unele loca\u021bii nu se g\u0103sesc toate datele. Raportul constat\u0103 fapte; nu este consultan\u021b\u0103 juridic\u0103 \u0219i nu este raport de evaluare ANEVAR. Serviciu privat, independent de ANCPI. \u00cen cazul \u00een care sunt necesare servicii autorizate, acestea v\u0103 pot fi puse la dispozi\u021bie prin colaboratorii no\u0219tri. Le g\u0103si\u021bi pe prima pagin\u0103. Sau scan\u00e2nd QR codul de aici.";
  const NOTA = "informa\u021biile din acest raport sunt adunate cu grij\u0103 din surse publice \u0219i private \u0219i sunt oferite cu bun\u0103-credin\u021b\u0103, cu titlu informativ. nu garant\u0103m c\u0103 sunt complete, exacte sau la zi \u00een orice moment \u0219i nu ne asum\u0103m r\u0103spunderea pentru deciziile luate doar pe baza lor. \u00eenainte de orice pas important (o arvun\u0103, un antecontract, o cump\u0103rare sau o v\u00e2nzare), te rug\u0103m s\u0103 verifici informa\u021biile cu un specialist autorizat: notar, avocat, inginer, topograf sau evaluator. raportul nu creeaz\u0103 obliga\u021bii \u00een sarcina noastr\u0103 \u0219i nu \u00eenlocuie\u0219te actele oficiale.";
  const QRURL = "https://epay-cf.online/#experti";
  const mic = s => (window.mic ? window.mic(s) : String(s).toLowerCase());
  const COLAB = ["opinie juridic\u0103, prin avocat partener", "ridicare topografic\u0103", "inspec\u021bie tehnic\u0103 a construc\u021biei", "evaluare anevar", "certificat energetic"];
  function qr(el) { try { const q = qrcode(0, "M"); q.addData(QRURL); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 3, margin: 1, scalable: true }); } catch (e) { el.textContent = ""; } }
  function subsol() {   // textul de la finalul prezentarii: o data in raportul generic, o data la finalul raportului unei locatii
    document.querySelectorAll(".rep-foot").forEach(f => f.remove());
    ["#generic", ".wrap"].forEach(sel => { const c = $(sel); if (!c) return; const f = document.createElement("footer"); f.className = "rep-foot" + (sel === ".wrap" ? " rf-loc" : ""); f.id = sel === ".wrap" ? "rep-foot-p" : "rep-foot-g";
      f.innerHTML = `<div class="rf-t"><p>${esc(FOOT)}</p><p class="rf-j"><b>not\u0103 juridic\u0103.</b> ${esc(NOTA)}</p></div><div class="rf-qr" role="img" aria-label="cod QR spre colaboratorii autoriza\u021bi"></div>`; c.appendChild(f); qr(f.querySelector(".rf-qr")); });
  }
  function randeaza() {
    let g = $("#generic");
    if (!g) { g = document.createElement("div"); g.id = "generic"; const w = $(".wrap"); if (!w) return; w.appendChild(g); }
    const cv = foto("rezumat"), COLORS = (window.ILU && ILU.COL) || {};
    let grup = "";
    g.innerHTML = `<div class="gn-cov">${cv ? `<img src="ilu/${esc(cv.f)}" alt="">` : ""}<div class="gn-ov"><div class="gn-tx"><span class="gn-k">${esc(mic("raport de proprietate"))}</span><h1>${esc(mic("Cartea Casei"))}</h1><p>${esc(mic("Tot ce se poate afla despre un loc, \u00eenainte de a-l cump\u0103ra sau de a-l vinde."))}</p>
        <div class="gn-go"><select id="gn-sel" aria-label="alege loca\u021bia">${LIST.map(p => `<option value="${esc(p.id)}">${esc(p.eticheta)}</option>`).join("")}</select><button type="button" id="gn-open">${esc(mic("Alege loca\u021bia \u0219i vezi raportul"))}</button></div></div></div></div>` +
      `<div class="gn-colab"><b>${esc(mic("servicii autorizate, prin colaboratorii no\u0219tri"))}</b><span>${COLAB.map(c => `<i>${esc(mic(c))}</i>`).join("")}</span></div>` +
      CAP.map(([k, gr, t, en], i) => { const f = foto(k), h = gr !== grup ? `<div class="gn-gr">${esc(mic(gr))}</div>` : ""; grup = gr;
        return h + `<article class="gn-c" id="gn-${k}" data-df="${i % 2 ? 1 : 0}" style="--c:${COLORS[k] || COLORS[ALIAS[k]] || "#b86e00"}"><div class="gn-i">${f ? `<img src="ilu/${esc(f.f)}" alt="" loading="lazy">` : (window.ILU ? ILU.desen(ALIAS[k] || k) : "")}<div class="gn-h"><span class="gn-n">${String(i + 1).padStart(2, "0")}</span><h2>${esc(t)}</h2></div></div>
          <div class="gn-t"><p><b>${esc(PREF[gr] || "poate ar\u0103ta")}</b> ${esc(en)}.</p></div></article>`; }).join("");
    $("#gn-open").onclick = () => alege($("#gn-sel").value);
    subsol();
  }

  function alege(id) {
    const sel = $("#pick"); if (!sel || !id) return;
    seteaza(false); sel.value = id; sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function seteaza(on) {
    activ = on; document.body.classList.toggle("generic", on);
    const sel = $("#pick"); if (sel && on) sel.value = "";
    if (on) { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {} randeaza(); window.scrollTo({ top: 0 }); }
  }

  // in modul generic, adresa ramane fara #id (index.html o completeaza la fiecare showTab)
  function curataAdresa() { if (typeof window.setHash === "function" && !window.setHash.__gn) { const o = window.setHash; window.setHash = function () { if (activ) return; return o.apply(this, arguments); }; window.setHash.__gn = true; } }
  function leaga() {
    curataAdresa();
    const sel = $("#pick"); if (!sel || sel.dataset.gn) return false;
    sel.dataset.gn = "1"; sel.hidden = false;
    if (!sel.querySelector('option[value=""]')) sel.insertAdjacentHTML("afterbegin", '<option value="">Raport generic (f\u0103r\u0103 loca\u021bie)</option>');
    sel.addEventListener("change", ev => { if (sel.value === "") { ev.stopImmediatePropagation(); seteaza(true); } else if (activ) seteaza(false); }, true);
    addEventListener("hashchange", () => { const h = decodeURIComponent(location.hash.slice(1)).split(".")[0]; if (h && LIST.some(p => p.id === h)) seteaza(false); });
    // clic pe un capitol din bara laterala, cat timp suntem pe generic: deruleaza la cardul lui
    document.addEventListener("click", e => { if (!activ) return; const b = e.target.closest && e.target.closest("nav#tabs [data-t]"); if (!b) return;
      const t = b.dataset.t, c = document.getElementById("gn-" + t);
      e.preventDefault(); e.stopImmediatePropagation(); if (c) c.scrollIntoView({ behavior: "smooth", block: "start" }); else window.scrollTo({ top: 0, behavior: "smooth" }); }, true);
    return true;
  }

  async function porneste() {
    css();
    try { dinSchema(await window.RIC_SCHEMA_P); } catch (e) { console.warn("generic: schema", e); }
    try { const r = await fetch("ilu/index.json", { cache: "no-cache" }); if (r.ok) IDX = await r.json(); } catch (e) {}
    try { LIST = await (await fetch("proprietati.json")).json(); } catch (e) { LIST = []; }
    const h0 = decodeURIComponent((window.__H0 || location.hash || "").replace(/^#/, "")).split(".")[0];
    const generic = !h0 || !LIST.some(p => p.id === h0);
    randeaza();
    let n = 0; const t = setInterval(() => { if (leaga() || ++n > 80) { clearInterval(t); if (generic) seteaza(true); } }, 150);
    window.addEventListener("ric-aspect", e => { if (activ && e.detail && e.detail.img) randeaza(); });
    window.RIC_GENERIC = { seteaza, alege, activ: () => activ };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
