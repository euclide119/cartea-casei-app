/* Raport _ Cartea Casei - capitolele parcelei (Manu, 02.11.2026; v2 = blueprint „Raportul terenului”):
   istoric CU și PUZ, certificat de urbanism electronic, opinie juridică, situația tehnică, utilități, zona (AC/CU reale pe satelit),
   PUG Ghiroda (preliminar), proiecte de infrastructură, prețul în timp, prezentare comercială, afiș în 3 pagini cu QR, modul privat (cod).
   Apar doar la proprietățile cu p/<id>/g7.json; datele stau în Banca de Date (zona.json, proiecte.json, privat.json, imagini_g7.json). */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => v == null || !isFinite(v) ? "—" : Number(v).toLocaleString("ro-RO", { maximumFractionDigits: d });
  const eur = v => nf(Math.round(v / 10) * 10) + " €";
  const st = document.createElement("style"); st.id = "g7-css";
  st.textContent = `
.g7-h{margin:0 0 14px;font-family:"Fraunces",Georgia,serif;font-weight:700;font-size:clamp(28px,3.6vw,46px);line-height:1.05}
.g7-b{display:flex;flex-direction:column;gap:12px}
.g7-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px}
.g7-k>div,.g7-c{border:1px solid #c9ced8;border-radius:12px;padding:12px 14px;background:var(--panel)}
.g7-k b{display:block;font:800 24px var(--mono)}.g7-k span{font:12.5px/1.4 var(--font);color:var(--muted)}
.g7-t{border:1px solid #c9ced8;border-radius:12px;background:var(--panel);padding:6px 14px}
.g7-t>div{display:grid;grid-template-columns:96px 54px minmax(0,1fr);gap:10px;padding:9px 0;border-top:1px solid var(--line);font:13.5px/1.45 var(--font)}
.g7-t>div:first-child{border-top:0}.g7-t em{font-style:normal;font:12px var(--mono);color:var(--muted)}
.g7-t small{display:block;color:var(--muted);font-size:12px}
.g7-s{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;padding:9px 0;border-top:1px solid var(--line);font:13.5px/1.45 var(--font)}
.g7-s:first-child{border-top:0}.g7-s b{font-weight:700}.g7-t>div.g7-s{grid-template-columns:150px minmax(0,1fr)}
.g7-n{border-radius:12px;padding:12px 14px;border:1px solid;font:14px/1.5 var(--font)}
.g7-n.v{background:#e8f5ec;border-color:#a9d8b8}.g7-n.o{background:#fdf3e2;border-color:#ecc98f}.g7-n.r{background:#fbe9e7;border-color:#e6a9a0}.g7-n.y{background:#fffbe0;border-color:#e6d98a}
.g7-cu{background:#fff;color:#1a1e2a;border:2px solid #1a1e2a;border-radius:6px;padding:22px 24px;display:flex;flex-direction:column;gap:14px;font:14px/1.5 var(--font)}
.g7-cu-h{text-align:center;display:flex;flex-direction:column;gap:2px;border-bottom:2px solid #1a1e2a;padding-bottom:10px}.g7-cu-h span{font:12px var(--font);color:#4a5063}.g7-cu-h b{font:800 19px var(--font);letter-spacing:.04em}
.g7-cu-t{margin:0;text-align:center;font:800 17px var(--font);letter-spacing:.06em}.g7-cu-s h3{margin:0 0 6px;font:700 14px var(--font);background:#e9ecf2;padding:5px 9px;border-radius:4px}.g7-cu-s ul,.g7-cu-s ol{margin:4px 0 0;padding-left:20px}.g7-cu-s li{margin:2px 0}.g7-cu-f{margin:0;font:12.5px/1.5 var(--font);color:#4a5063;border-top:1px solid #c9ced8;padding-top:8px}
.g7-sint{display:flex;flex-direction:column;gap:8px}.g7-sl{display:flex;gap:10px;align-items:center;border-radius:10px;padding:10px 12px;border:1px solid}.g7-sl.v{background:#e0f3e6;border-color:#7cc593}.g7-sl.o{background:#fdf0d4;border-color:#e0b255}.g7-sl.r{background:#fbdcd8;border-color:#e08a80}
.g7-sd{flex:0 0 14px;height:14px;border-radius:50%;background:currentColor}.g7-sl.v .g7-sd{color:#1f8a4a}.g7-sl.o .g7-sd{color:#c98a00}.g7-sl.r .g7-sd{color:#c0392b}.g7-sb{filter:blur(7px);-webkit-user-select:none;user-select:none;pointer-events:none;color:#1a1e2a;font:14px/1.4 var(--font)}
.g7-ord{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;border:2px solid #1a1e2a;border-radius:12px;padding:12px 14px;background:#fff7e0;color:#1a1e2a;font:14px/1.4 var(--font)}.g7-ord input{width:20px;height:20px}
#urbanism:has(.g7-puz) #retrageri,#urbanism:has(.g7-puz) #ind-box{display:none}#g7-ordprint{display:none}.g7-pmap{position:relative}.g7-pmap svg path,.g7-pmap svg circle{cursor:pointer}.g7-pop{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);z-index:4;max-width:min(460px,90%);background:#fff;border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.3);padding:8px 12px;font-size:13px;display:flex;flex-direction:column;gap:2px}.g7-pop[hidden]{display:none}@media print{.g7-pop{display:none!important}}@media print{[data-l="cad"]{display:none!important}}@media print{.g7-nopr{display:none!important}html[data-ord-jur="1"] #g7-ordprint{display:block;border:2px solid #000;padding:10px;margin:12px 0;font:13px/1.4 system-ui}}
.g7-n b{display:block;margin-bottom:2px}.g7-n small{display:block;margin-top:4px;color:var(--muted);font-size:12.5px}
.g7-p{margin:0;font:13px/1.5 var(--font);color:var(--muted)}
.g7-az{position:relative}.g7-az svg{display:block;width:100%;height:auto;max-height:82vh;cursor:grab}.g7-zb{position:absolute;left:8px;top:8px;display:flex;flex-direction:column;gap:4px}.g7-zb button{width:34px;height:34px;border-radius:8px;border:1px solid #1a1e2a;background:rgba(255,255,255,.9);font:700 20px/1 var(--font);color:#1a1e2a;cursor:pointer}
.g7-az #g7fisa{position:absolute;right:8px;bottom:8px;width:min(46%,340px);max-height:60%;overflow:auto;background:rgba(255,255,255,.92);color:#1a1e2a;border-radius:10px;padding:10px 12px;margin:0;font:13px/1.4 var(--font)}
@media (max-width:700px){.g7-az #g7fisa{position:static;width:auto;max-height:none;margin-top:8px}}
.g7-sl{flex-wrap:wrap}.g7-sc{flex:1 1 200px;min-width:0;font:14px/1.4 var(--font);color:#1a1e2a}.g7-si{font-weight:600;margin-right:4px}.g7-sc .g7-sb{display:inline;white-space:normal}
.g7-tl{position:relative;padding:4px 0 4px 22px}.g7-tl::before{content:"";position:absolute;left:6px;top:8px;bottom:8px;width:2px;background:#8a90a0}
.g7-tl>div{position:relative;margin:0 0 12px;font:14px/1.45 var(--font)}.g7-tl>div::before{content:"";position:absolute;left:-21px;top:5px;width:11px;height:11px;border-radius:50%;background:#1a1e2a;border:2px solid #fff}
.g7-tl em{display:block;font:600 12px var(--mono);font-style:normal;color:#4a5063}.g7-tl>div.mare{border:2px solid #1a1e2a;border-radius:10px;padding:8px 12px;background:#fff}.g7-tl>div.mare::before{top:14px}
.g7-eti{position:absolute;left:10px;top:10px;padding:5px 10px;border-radius:8px;background:rgba(255,255,255,.84);color:#1a1e2a;font:600 13px var(--font);pointer-events:none}.g7-map{position:relative}
.g7-pg{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
.g7-pg .g7-c b{display:block;font:700 17px var(--font);margin-bottom:4px}.g7-pg .g7-c span{font:14px/1.5 var(--font)}
.g7-btn{align-self:flex-start;border:1px solid #1a1e2a;background:#fff;border-radius:8px;padding:8px 14px;font:600 14px var(--font);cursor:pointer}
.g7-badge{display:inline-block;padding:3px 10px;border-radius:999px;font:700 12px var(--font);letter-spacing:.04em;text-transform:uppercase}
.g7-badge.o{background:#fdf3e2;color:#8a5a00;border:1px solid #ecc98f}.g7-badge.r{background:#fbe9e7;color:#9a2a1f;border:1px solid #e6a9a0}.g7-badge.v{background:#e8f5ec;color:#1f6b3a;border:1px solid #a9d8b8}
.g7-map{position:relative;border-radius:14px;overflow:hidden;border:1px solid #c9ced8;background:#dfe3ea}
.g7-map svg{display:block;width:100%;height:auto}
.g7-leg{display:flex;flex-wrap:wrap;gap:8px 14px;font:12.5px var(--font);color:var(--muted)}.g7-leg i{display:inline-block;width:12px;height:12px;border-radius:50%;vertical-align:-2px;margin-right:5px}
.g7-img{border-radius:14px;border:1px solid #c9ced8;overflow:hidden;background:#fff}.g7-img img{display:block;width:100%;height:auto}
.g7-img figcaption{padding:8px 12px;font:12.5px/1.45 var(--font);color:var(--muted)}
.g7-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}
.g7-bars{display:flex;align-items:flex-end;gap:6px;height:120px;padding:6px 4px 0}
.g7-bars>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;font:11px var(--mono);color:var(--muted)}
.g7-bars i{display:block;width:100%;border-radius:4px 4px 0 0;background:#2c5c9c}.g7-bars i.c{background:#e8a33d}
.g7-chart{width:100%;height:auto;display:block}
.g7-kv{display:grid;grid-template-columns:minmax(120px,190px) minmax(0,1fr);gap:6px 12px;font:14px/1.45 var(--font)}.g7-kv b{font-weight:700}
.g7-h3{margin:0 0 8px;font:700 17px var(--font)}.g7-pj{margin:0 0 8px;font:14px/1.55 var(--font)}.g7-tem{font:11.5px var(--mono);color:var(--muted);white-space:normal}
.g7-w{overflow-x:auto;border:1px solid #c9ced8;border-radius:12px;background:var(--panel)}.g7-tb{width:100%;border-collapse:collapse;font:13.5px/1.45 var(--font)}.g7-tb th{text-align:left;font-weight:700;padding:9px 12px;border-bottom:1px solid var(--line)}.g7-tb td{padding:9px 12px;border-top:1px solid var(--line);vertical-align:top}
.g7-ch{display:flex;flex-wrap:wrap;gap:6px}.g7-ch button{cursor:pointer}
.g7-bar{display:grid;grid-template-columns:minmax(90px,150px) 1fr 34px;gap:8px;align-items:center;padding:3px 0;font:13px var(--font)}.g7-bar i{display:block;height:9px;border-radius:5px;background:#c2185b;opacity:.75}.g7-bar b{font:700 12px var(--mono);text-align:right}
.g7-code{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.g7-code input{font:600 18px var(--mono);letter-spacing:.2em;padding:8px 12px;border:1px solid #c9ced8;border-radius:8px;width:170px;text-transform:uppercase}
.g7-pin{cursor:pointer}.g7-pin text{font:700 10px var(--mono);fill:#fff;paint-order:stroke;stroke:#1a1e2a;stroke-width:3px;stroke-linejoin:round}
.g7-fisa{border:1px solid #c9ced8;border-radius:12px;background:var(--panel);padding:12px 14px;font:13.5px/1.5 var(--font);min-height:60px}
/* afiș: 3 pagini */
.g7-af{border:2px solid #1a1e2a;border-radius:6px;background:#fff;color:#1a1e2a;padding:26px 28px;max-width:760px;margin:0 auto;font-family:var(--font);display:flex;flex-direction:column;gap:12px}
.g7-af+.g7-af{margin-top:14px}
.g7-af h3{margin:0;font:800 clamp(30px,5vw,52px)/1 var(--font);letter-spacing:-.01em}.g7-af h3.h2{font:700 clamp(24px,3.4vw,36px)/1.1 "Fraunces",Georgia,serif}
.g7-af1{padding:0 0 22px;overflow:hidden}.g7-af1>*:not(.g7-hero){margin-left:26px;margin-right:26px}
.g7-hero{position:relative;aspect-ratio:18/11;background-size:cover;background-position:center}.g7-hx{position:absolute;left:0;right:0;top:0;padding:24px 28px 70px;color:#fff;background:linear-gradient(180deg,rgba(12,16,30,.62),transparent)}.g7-hx span{font:700 13px var(--font);letter-spacing:.16em;text-transform:uppercase}.g7-hx h3{font:700 clamp(28px,4.4vw,48px)/1.05 "Fraunces",Georgia,serif;color:#fff;margin-top:6px;text-shadow:0 2px 14px rgba(0,0,0,.5)}
#g7-m{position:fixed;inset:0;z-index:9000;background:rgba(14,18,30,.5);display:flex;align-items:center;justify-content:center;padding:16px}#g7-m[hidden]{display:none}.g7-mb{position:relative;background:var(--panel,#fff);border-radius:16px;padding:20px 22px;max-width:560px;width:100%;max-height:82vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,.35)}.g7-mb [data-x]{position:absolute;right:10px;top:8px;border:0;background:none;font-size:24px;cursor:pointer;color:#555}
.g7-af .sl{font:600 19px/1.3 var(--font)}.g7-af img{width:100%;max-height:360px;object-fit:cover;border-radius:4px;border:1px solid #c9ced8}
.g7-af ul{margin:0;padding-left:20px;font:15.5px/1.55 var(--font)}.g7-af .ct{border-top:2px solid #1a1e2a;padding-top:12px;font:700 17px var(--font)}
.g7-af .pr{font:800 clamp(28px,4vw,40px)/1.05 var(--mono);color:#9a2a1f}.g7-af .pr small{display:block;font:600 14px var(--font);color:#1a1e2a;margin-top:4px}
.g7-af .row{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}
.g7-af .chips{display:flex;flex-wrap:wrap;gap:6px}.g7-af .chips span{border:1px solid #1a1e2a;border-radius:999px;padding:4px 10px;font:600 13px var(--font)}
.g7-af .kv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font:14px/1.45 var(--font)}.g7-af .kv b{font-weight:700}
.g7-af .pg{font:11px var(--mono);color:#777;text-align:right}
.g7-af .qr svg{width:120px;height:120px;display:block}
@media print{.g7-af{page-break-after:always;border:0;max-width:none}}`;
  document.head.appendChild(st);

  /* v80.0: ce e public stă în ordinea raportului (după Urbanism); ce e privat se strânge la sfârșit, într-un grup „Privat”, în ordinea cerută de Manu (02.11.2026) */
  const TABS = [["g7_cu", "Extras de informare urbanistică electronică", "urbanism"], ["g7_sinteza", "Raport juridic · sinteză", "g7_cu"], ["g7_zona", "Zona: AC și CU", "g7_sinteza"],
    ["g7_istoric", "Istoric CU și PUZ", "@priv"], ["g7_juridic", "Raport juridic", "@priv"], ["g7_extras", "Extras de informare urbanistică electronică · automat", "@priv"], ["g7_tehnic", "Situația tehnică", "@priv"],
    ["g7_utilitati", "Utilități, rețele și drumuri autorizate", "@priv"], ["g7_pug", "PUG", "@priv"], ["g7_proiecte", "Proiecte care schimbă zona", "@priv"], ["g7_preturi", "Prețul în timp", "@priv"],
    ["g7_comercial", "Prezentare comercială", "@priv"], ["g7_afis", "Afiș", "@priv"], ["g7_privat", "🔒 Anunțuri din zonă, cu contacte", "@priv"]];

  function grupPriv() {
    const nav = document.querySelector("nav#tabs"); if (!nav) return null;
    let g = document.getElementById("g7-priv"); if (!g) { g = document.createElement("div"); g.className = "ng"; g.id = "g7-priv"; g.innerHTML = `<span class="nl">🔒 Privat</span>`; nav.appendChild(g); }
    return g;
  }
  function fila(k, titlu, dupa) {
    const ref = dupa === "@priv" ? grupPriv() : document.querySelector(`nav#tabs [data-t="${dupa}"]`);
    if (ref && !document.querySelector(`nav [data-t="${k}"]`)) { const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = k; b.textContent = titlu; b.onclick = () => window.showTab(k); if (dupa === "@priv") ref.appendChild(b); else ref.after(b); }
    if (!document.getElementById(k)) { const s = document.createElement("section"); s.id = k; s.hidden = true; document.querySelector(".wrap")?.appendChild(s); }
    try { EL[k] = k; EL_INV[k] = k; } catch (e) {}
    return document.getElementById(k);
  }
  const NIV = { v: "v", o: "o", r: "r" }, ETI = { v: "în regulă", o: "de lămurit", r: "problemă" };
  const lista = a => (a || []).map(x => `<li>${esc(x)}</li>`).join("");
  const jsonOpt = async u => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch (e) { return null; } };
  const P = id => `p/${id}/`;

  /* ---------- hartă pe satelit: imagine + puncte în metri (x est, y nord) → px ---------- */
  function satMap(img, I, W, H, layers, opt = {}) {
    const mpp = I.m_per_px, cx = I.centru_px[0], cy = I.centru_px[1];
    const X = x => cx + x / mpp, Y = y => cy - y / mpp;
    return `<div class="g7-map"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria || "hartă")}"><image href="${esc(img)}" width="${W}" height="${H}"/>${layers({ X, Y, W, H, mpp })}</svg>${opt.eti ? `<span class="g7-eti">${esc(opt.eti)}</span>` : ""}</div>`;
  }
  const lotPath = (pts, X, Y) => pts && pts.length ? "M" + pts.map(([x, y]) => `${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join("L") + "Z" : "";

  /* ---------- capitole ---------- */
  function istoric(G, S) {
    const L = G.istoric.slice().sort((a, b) => a.data.localeCompare(b.data));
    S.innerHTML = `<h2 class="g7-h">Istoric CU și PUZ</h2><div class="g7-b">
      <div class="g7-k"><div><b>${L.filter(x => x.tip === "CU").length}</b><span>certificate de urbanism pe PUZ</span></div><div><b>${esc(L[L.length - 1].data)}</b><span>ultimul pas: ${esc(L[L.length - 1].text.split(":")[0].split("(")[0])}</span></div></div>
      <div class="g7-tl">${L.map(x => `<div class="${/aprobat|HCL/i.test(x.text) || esc(x.text).length > 90 ? "mare" : ""}"><em>${esc(x.data)} · ${esc(x.tip)}${x.nr ? " " + esc(x.nr) : ""}</em><span>${esc(x.text)}</span></div>`).join("")}</div>
      </div>`;
  }
  function cu(G, S) {
    const c = G.cu_electronic || {}, p = G.parcela, i = G.indicatori, priv = document.documentElement.classList.contains("cc-priv"), r = i.retrageri || {}, ph = G.pug_harta || {};
    const rd = (t, L) => `<div class="g7-cu-s"><h3>${t}</h3><div class="g7-kv">${L.filter(x => x && x[1] != null && x[1] !== "").map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join("")}</div></div>`;
    S.innerHTML = `<h2 class="g7-h">Extras de informare urbanistică electronică</h2><div class="g7-b">
      <div class="g7-cu"><div class="g7-cu-h"><span>ROMÂNIA · JUDEȚUL ${esc(String(p.judet || "").toUpperCase())}</span><b>${esc("PRIMĂRIA " + String(p.uat || "").toUpperCase())}</b><span>Model informativ, generat automat · nu înlocuiește certificatul emis de primărie (Legea 169/2026, art. 254)</span></div>
        <h3 class="g7-cu-t">EXTRAS DE INFORMARE URBANISTICĂ ELECTRONICĂ</h3>
        ${rd("1. Identificarea imobilului", [["Localitate / UAT", `${p.localitate}, ${p.uat}, jud. ${p.judet}`], ["Adresă", p.strada], ["Lot", "lot " + p.lot + ", pe planșa PUZ"], ["Suprafață", nf(p.suprafata_mp) + " mp (după planșa PUZ)"], priv && ["Număr cadastral (parcela-mamă)", p.nc_mama], ["Carte funciară", p.cf], ["Poziție", p.pozitie], ["Coordonate (WGS84)", (p.pin || []).join(", ")]])}
        ${rd("2. Regimul juridic", [priv && ["Proprietar", p.proprietar_mama], ["Folosință actuală", p.folosinta], ["Sarcini și servituți", "neverificate fără extras de carte funciară la zi"], ["Acces", p.acces]])}
        ${rd("3. Regimul economic", [["Destinație", "locuințe individuale (zona L1)"], ["Unitate teritorială (PUG)", p.utr_pug ? "UTR " + p.utr_pug : ""], ["Plan urbanistic aplicabil", p.puz], ["PUG", (ph.nou ? "PUG nou: " + ph.nou : "PUG nou: preliminar, în avizare") + " · PUG vechi: în vigoare până la aprobarea celui nou"]])}
        ${rd("4. Regimul tehnic", [["Regim de înălțime", i.regim], ["Înălțime maximă", i.h_max_m ? i.h_max_m + " m" : ""], ["POT maxim", i.POT], ["CUT maxim", i.CUT], ["Amprentă maximă", i.amprenta_max_mp ? nf(i.amprenta_max_mp) + " mp" : ""], ["Suprafață desfășurată maximă", i.adc_max_mp ? nf(i.adc_max_mp) + " mp" : ""], ["Retragere la stradă", r.aliniament_m ? r.aliniament_m + " m" : ""], ["Retrageri laterale", r.laterale_m], ["Retragere posterioară", r.posterior_m ? r.posterior_m + " m" : ""], ["Spații verzi", i.spatii_verzi_pct ? i.spatii_verzi_pct + " %" : ""], ["Parcare", i.parcare], ["Acoperiș", i.acoperis], ["Împrejmuire", i.imprejmuire]])}
        <div class="g7-cu-s"><h3>5. Ce a fost verificat</h3><ul>${(c.verificat || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="g7-cu-s"><h3>6. De confirmat la primărie</h3><ul>${(c.de_confirmat || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
        <div class="g7-cu-s"><h3>7. Pași pentru certificatul oficial</h3><ol>${(c.pasi || []).map(x => `<li>${esc(x)}</li>`).join("")}</ol></div>
        <p class="g7-cu-f">${esc(c.ce)} ${esc(c.limita || "")}</p></div></div>`;
  }
  const DISCLAIMER = "Ce prezentăm în rapoarte sunt fapte: date din surse publice și legea aplicabilă. Pentru a fi considerat opinie juridică cu recomandare de specialist, selectați „Comand și opinie juridică”: aceasta se pregătește și se revizuie de un avocat. Se emite doar după ce se comandă raportul și după verificarea de către avocatul nostru. Se poate face și cu notar sau avocat ales de dumneavoastră.";
  function comanda(G, id, S) {
    const j = G.juridic || {}, pc = G.juridic_sinteza || {};
    /* comanda merge în formularul „am nevoie și de” (telefon sau e-mail, îți scriem cu prețul și termenul); fără fișă tipărită (Manu, 06.11.2026) */
    S.insertAdjacentHTML("beforeend", `<label class="g7-ord"><input type="checkbox" id="g7ord"> <b>Comand și opinie juridică</b> (pregătită și revizuită de un avocat) <span class="g7-p">Bifa te duce la formularul de comandă: lași telefonul sau e-mailul și îți scriem cu prețul și termenul. Nu plătești nimic acum.</span></label>`);
    const c = S.querySelector("#g7ord");
    c.onchange = () => { if (c.checked && window.CC_ACORDEON) window.CC_ACORDEON.comanda("opinie"); };
  }
  function juridic(G, S, id) {
    const j = G.juridic, STC = { BUN: "v", "?": "o", "RĂU": "r" };
    const html = () => `<div class="g7-leg" style="margin-bottom:10px"><span><i style="background:#a9d8b8"></i>concluzie bună</span><span><i style="background:#ecc98f"></i>semn de întrebare</span><span><i style="background:#e6a9a0"></i>sună rău</span><span><i style="background:#e6d98a"></i>opinia avocatului</span></div>
      <div class="g7-n o"><b>Ce este acest raport</b>${esc(DISCLAIMER)}</div>
      <div class="g7-c"><div class="g7-kv">${j.antet.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join("")}</div></div>
      <div class="g7-n o"><b>Pe scurt</b>${esc(j.pe_scurt)}</div>
      <div class="g7-w"><table class="g7-tb"><thead><tr><th>Subiect</th><th>Stare</th><th>Ce înseamnă</th><th>Temei</th></tr></thead><tbody>${j.tabel.map(r => `<tr><td><b>${esc(r[0])}</b></td><td><span class="g7-badge ${STC[r[1]] || "o"}">${esc(r[1])}</span></td><td>${esc(r[2])}</td><td class="g7-tem">${esc(r[3])}</td></tr>`).join("")}</tbody></table></div>
      <div class="g7-n y"><b>Opinia avocatului · concluzie generală</b>${j.avocat_general ? esc(j.avocat_general) : "se completează de avocat, după comandă. Partea de mai sus descrie fapte și legea, nu sfătuiește ce să faci."}</div>
      ${j.sectiuni.map(s => `<div class="g7-c"><h3 class="g7-h3">${esc(s.t)}</h3>${s.texte.map(([t, a]) => `<p class="g7-pj">${esc(t)}${a ? ` <span class="g7-tem">${esc(a)}</span>` : ""}</p>`).join("")}</div>`).join("")}
      <div class="g7-two"><div class="g7-n v"><b>Documente analizate</b><ul style="margin:4px 0 0;padding-left:18px">${lista(j.documente)}</ul></div><div class="g7-n o"><b>Nu sunt în dosar (se cer)</b><ul style="margin:4px 0 0;padding-left:18px">${lista(j.neprezentate)}</ul></div></div>
      `;
    S.innerHTML = `<h2 class="g7-h">Raport juridic</h2><div class="g7-b g7-nopr">${html()}</div>`;
    comanda(G, id, S.querySelector(".g7-b"));
  }
  /* sinteza publică: concluziile apar ca rânduri colorate, dar textul e înlocuit cu umplutură și ascuns prin blur; textul real nu ajunge în pagină */
  function sinteza(G, S, NIV) {
    const P = (G.juridic_sinteza || {}).puncte || [], C = { BUN: "v", "?": "o", "RĂU": "r" }, W = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam".split(" ");
    const linie = (n, i) => { let t = ""; for (let k = 0, x = i * 7 + 3; t.length < Math.min(Math.max(n, 70), 150); k++, x += 5) t += W[x % W.length] + " "; return t.trim(); };
    S.innerHTML = `<h2 class="g7-h">Raport juridic · sinteză</h2><div class="g7-b">
      <p class="g7-p">Concluziile raportului juridic, pe puncte: <b>verde</b> = în regulă, <b>galben</b> = de lămurit, <b>roșu</b> = problemă. Textul lor se vede după comandă.</p>
      <div class="g7-sint">${P.slice(0, 9).map((x, i) => `<div class="g7-sl ${C[x.s] || "o"}" aria-hidden="true"><span class="g7-sd"></span>${(x.c || [[x.i || "", x.n]]).map(([t, n], j) => `<span class="g7-sc"><span class="g7-si">${esc(t)}</span>${n ? `<span class="g7-sb">${esc(linie(n, i + j)).slice(0, Math.min(n, 60))}</span>` : ""}</span>`).join("")}</div>`).join("")}</div>${NIV >= 2 && (G.juridic || {}).tabel ? `<button type="button" class="g7-btn" id="g7fisa">arată fișa</button><div id="g7fisat" hidden>${G.juridic.tabel.map(r => `<div class="g7-sl ${C[r[1]] || "o"}"><span class="g7-sd"></span><span class="g7-sc">${esc(r[0])}</span><span class="g7-sc">${esc(r[2])}</span><span class="g7-sc">${esc(r[3] || "")}</span></div>`).join("")}</div>` : ""}
      <div class="g7-n o"><b>De ce nu se vede textul</b>${esc(DISCLAIMER)}</div>
      <label class="g7-ord"><input type="checkbox" id="g7ord0"> <b>Comand și opinie juridică</b> (pregătită și revizuită de un avocat)<span class="g7-p">${NIV >= 2 ? "Raportul juridic complet e în datele fine." : "Bifa te duce la formularul de comandă; nu plătești nimic acum."}</span></label></div>`;
    document.getElementById("g7-ordprint")?.remove(); const o = document.createElement("div"); o.id = "g7-ordprint"; o.innerHTML = `<b>Comandă înregistrată: opinie juridică</b> pregătită și revizuită de un avocat. ${esc(DISCLAIMER)}`; document.body.appendChild(o);
    const fb = S.querySelector("#g7fisa"); if (fb) fb.onclick = () => { const t = S.querySelector("#g7fisat"), a = t.hidden; t.hidden = !a; S.querySelector(".g7-sint").hidden = a; fb.textContent = a ? "estompează fișa" : "arată fișa"; };
    S.querySelector("#g7ord0").onchange = e => { document.documentElement.dataset.ordJur = e.target.checked ? "1" : ""; if (e.target.checked && window.CC_ACORDEON) window.CC_ACORDEON.comanda("opinie"); };
  }
  function tipar(titlu, corp) { if (window.CC_PDF) return window.CC_PDF.din(titlu, corp); const w = open("", "_blank"); if (!w) return; w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(titlu)}</title><base href="${location.href.replace(/[^/]*$/, "")}"><style>${st.textContent}body{margin:0;padding:18px;font-family:system-ui;--panel:#fff;--line:#ddd;--muted:#555;--font:system-ui;--mono:ui-monospace,Menlo,monospace}</style>${corp}<script>onload=()=>setTimeout(print,700)<\/script>`); w.document.close(); }

  /* extrasul de informare urbanistică: se generează automat, din datele raportului (nu înlocuiește certificatul emis de primărie, art. 254 CATUC) */
  function extras(G, Z, Dd, S, id) {
    const p = G.parcela, i = G.indicatori, r = i.retrageri || {}, ph = G.pug_harta || {}, L = G.istoric.slice().sort((a, b) => a.data.localeCompare(b.data));
    const vec = ((Z && Z.acte) || []).slice().sort((a, b) => a.dist - b.dist).slice(0, 8);
    const F = Dd.inundatii || {}, zg = Dd.zgomot || {}, SE = Dd.seismic || {};
    const rand = (k, v) => v == null || v === "" ? "" : `<b>${esc(k)}</b><span>${esc(v)}</span>`;
    const html = () => `<div class="g7-n y"><b>Document informativ, generat automat la ${esc(new Date().toLocaleDateString("ro-RO"))}</b>Reunește datele raportului pentru acest imobil. Nu e certificat de urbanism și nu înlocuiește actul emis de Primăria ${esc(p.uat)}.</div>
      <div class="g7-c"><h3 class="g7-h3">I. Imobilul</h3><div class="g7-kv">${rand("UAT", p.uat + ", jud. " + p.judet)}${rand("Localitate", p.localitate)}${rand("Strada de acces", p.strada)}${rand("Parcela-mamă", p.cf)}${rand("Lot", p.lot + ", " + nf(p.suprafata_mp) + " mp, " + p.pozitie)}${rand("Poziție", "punct pe hartă în interiorul lotului; contur din planșa PUZ, " + (p.geometrie ? nf(p.geometrie.arie_geometrie_mp, 1) + " mp" : ""))}</div></div>
      <div class="g7-c"><h3 class="g7-h3">II. Regimul juridic</h3><div class="g7-kv">${rand("Proprietar parcelă-mamă", p.proprietar_mama)}${rand("Teritoriu", "intravilan (memoriu PUZ)")}${rand("Documentație aprobată", (G.extras_date || {}).documentatie)}${rand("Lot în CF", "neînscris separat, după datele noastre; se verifică pe extrasul CF")}</div></div>
      <div class="g7-c"><h3 class="g7-h3">III. Regimul economic</h3><div class="g7-kv">${rand("Folosință actuală", p.folosinta)}${rand("Destinație", (G.extras_date || {}).destinatie)}${rand("PUG în vigoare", "PUG-ul vechi al comunei")}${rand("PUG preliminar", "UTR " + (ph.utr || "D12") + ", zona " + (ph.zona || "L1") + " (în avizare)")}</div></div>
      <div class="g7-c"><h3 class="g7-h3">IV. Regimul tehnic</h3><div class="g7-kv">${rand("POT / CUT", i.POT + " / " + i.CUT)}${rand("Regim de înălțime", i.regim + ", H max " + (i.h_max_m || 12) + " m")}${rand("Amprentă / ADC maxim", "≈ " + nf(Math.round(i.amprenta_max_mp)) + " mp / ≈ " + nf(Math.round(i.adc_max_mp)) + " mp")}${rand("Retrageri", r.aliniament_m + " m la stradă; " + r.laterale_m + "; " + r.posterior_m + " m în spate")}${rand("Verde și parcare", i.spatii_verzi_pct + " % din lot; " + i.parcare)}${rand("Acces", p.acces)}</div></div>
      <div class="g7-c"><h3 class="g7-h3">V. Riscuri, din capitolele raportului</h3><div class="g7-kv">${rand("Inundații", F.hz100 ? "zonă inundabilă 1 %: " + (F.hz100.dist_m === 0 ? "în zonă" : "la " + F.hz100.dist_m + " m") : "vezi capitolul Inundații")}${rand("Seism", SE.ag_txt ? "ag = " + SE.ag_txt + " g, Tc = " + SE.tc + " s" : "")}${rand("Zgomot", "vezi capitolul Zgomot")}${rand("Protecții", "LEA 20 kV, conductă de gaz, canal ANIF: fără construcții în zonele de protecție")}</div></div>
      <p class="g7-p">Certificatul oficial pentru informare se cere de la primărie: se emite în cel mult 5 zile lucrătoare cu sistem informatic funcțional, altfel în cel mult 10 (L169/2026 art. 254).</p>`;
    S.innerHTML = `<h2 class="g7-h">Extras de informare urbanistică electronică · automat</h2><div class="g7-b"><button class="g7-btn" id="g7pe">Descarcă extrasul (PDF)</button>${html()}</div>`;
    S.querySelector("#g7pe").onclick = () => tipar("Extras urbanistic " + id, `<h1 class="g7-h">Extras de informare urbanistică electronică</h1><div class="g7-b">${html()}</div>`);
  }
  function tehnic(G, S) {
    const t = G.tehnic, p = G.parcela, i = G.indicatori, r = i.retrageri || {};
    S.innerHTML = `<h2 class="g7-h">Situația tehnică</h2><div class="g7-b">
      <div class="g7-k"><div><b>${nf(p.suprafata_mp)} mp</b><span>lot ${esc(p.lot)}, ${esc(p.pozitie)}</span></div><div><b>${esc(i.POT)}</b><span>POT</span></div><div><b>${esc(i.CUT)}</b><span>CUT</span></div><div><b>${esc(i.regim)}</b><span>regim de înălțime, H max ${esc(i.h_max_m || 12)} m</span></div>
        <div><b>≈ ${nf(Math.round(i.amprenta_max_mp))} mp</b><span>amprentă maximă</span></div><div><b>≈ ${nf(Math.round(i.adc_max_mp))} mp</b><span>construit desfășurat maxim</span></div>
        <div><b>${esc(r.aliniament_m)} / ${esc(String(r.laterale_m).split(" ")[0] === "pe" ? "0–2" : r.laterale_m)} / ${esc(r.posterior_m)} m</b><span>retrageri: stradă / lateral / spate (RLU)</span></div><div><b>${esc(i.spatii_verzi_pct)} %</b><span>spații verzi pe parcelă (RLU art. 29)</span></div></div>
      <p class="g7-p">${esc(t.intro)}</p>
      <div class="g7-t">${t.puncte.map(x => Array.isArray(x) ? `<div class="g7-s" style="border-top:1px solid var(--line)"><b>${esc(x[0])}</b><span>${esc(x[1])}</span></div>` : `<div class="g7-s" style="border-top:1px solid var(--line)"><b>${esc(x.t)}</b><span>${esc(x.v)}</span></div>`).join("")}</div>
      <div class="g7-two">${[["plansa_mobilare_lot.webp", "Posibilități de mobilare (planșa 05): lotul 9 cu roșu, zona de implantare, accesele."], ["plansa_reglementari_lot.webp", "Reglementări urbanistice (planșa 03): zona L1, retrageri, străzile de 12 m."], ["plansa_proprietate_lot.webp", "Proprietatea asupra terenurilor (planșa 04): ce rămâne privat și ce trece la domeniul public."]].map(([f, c]) => `<figure class="g7-img" style="margin:0"><img src="p/${esc(G._id)}/${f}" alt="${esc(c)}" loading="lazy" onerror="this.parentNode.remove()"><figcaption>${esc(c)}</figcaption></figure>`).join("")}</div>
      <p class="g7-p">Conturul lotului: ${G.parcela.geometrie ? nf(G.parcela.geometrie.arie_geometrie_mp, 1) + " mp din vector, față de " + nf(p.suprafata_mp) + " mp scris" : ""}.</p>
      <div class="g7-n o"><b>Limite</b><ul style="margin:4px 0 0;padding-left:18px">${lista(G.limite)}</ul></div>
      </div>`;
  }
  function utilitati(G, Z, S) {
    const u = G.utilitati; if (!u) { S.innerHTML = `<h2 class="g7-h">Utilități</h2><p class="g7-p">Nu avem încă date despre utilități pentru această parcelă.</p>`; return; }
    const acte = ((G._V && G._V.acte) || []).filter(a => a.util).sort((a, b) => b.d.localeCompare(a.d));
    const an0 = new Date().getFullYear() - 3, rec = acte.filter(a => +a.d.slice(0, 4) >= an0);
    S.innerHTML = `<h2 class="g7-h">Utilități, rețele și drumuri autorizate</h2><div class="g7-b">
      <div class="g7-k"><div><b>${u.existente.filter(x => x.st === "v").length}/${u.existente.length}</b><span>rețele la stradă sau pe teren</span></div><div><b>${nf(rec.length)}</b><span>acte pentru rețele, branșamente și drumuri în 1 km, din ${an0}</span></div><div><b>${nf(acte.length)}</b><span>acte de acest fel în 1 km din 2018</span></div></div>
      <div class="g7-t">${u.existente.map(x => `<div class="g7-s" style="border-top:1px solid var(--line)"><b><span class="g7-badge ${x.st}">${x.st === "v" ? "există" : "condiții"}</span><br>${esc(x.t)}</b><span>${esc(x.v)}</span></div>`).join("")}</div>
      <div class="g7-n o"><b>Cine plătește</b>${esc(u.costuri)}<small>${esc(u.conditie)}</small></div>
      <figure class="g7-img" style="margin:0"><img src="p/${esc(G._id)}/${esc(u.plansa)}" alt="planșa rețelelor" loading="lazy" onerror="this.parentNode.remove()"><figcaption>Planșa rețelelor din PUZ, centrată pe lotul 9 (roșu): apă, canal, gaz, LEA 20 kV, fibră.</figcaption></figure>
      ${G._U ? hartaActe(G, G._U, rec) : ""}
      ${rec.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Lucrări de rețele și drumuri autorizate în jur (${an0}–azi)</b><div class="g7-t" style="border:0;padding:0">${rec.slice(0, 14).map(a => `<div data-act="${esc(a.t + a.nr + a.d)}" style="cursor:pointer"><em>${esc(a.d)}</em><em>${esc(a.t)} ${esc(a.nr)}</em><span>${esc(a.ob)}<small>${esc(a.adr || "")} · la ${nf(a.dist)} m</small></span></div>`).join("")}</div></div>` : ""}</div>`;
    legaActe(S, acte);
  }
  /* harta rețelelor și drumurilor autorizate: pe planșa comunei, fără straturile de PUZ */
  function hartaActe(G, U, rec) {
    return `<div class="g7-c"><b style="display:block;margin-bottom:6px">Unde s-au autorizat rețele și drumuri</b><div class="g7-map"><svg viewBox="0 0 ${U.W} ${U.H}" role="img" aria-label="rețele și drumuri autorizate"><image href="p/${esc(G._id)}/${esc(U.fundal)}" width="${U.W}" height="${U.H}"/><circle cx="${U.pin[0]}" cy="${U.pin[1]}" r="13" fill="#ff2a2a" stroke="#fff" stroke-width="4"/>${U.drumuri.filter(d => d.lucrare).map(d => `<path d="${d.s.map(s => "M" + s.map(p => p[0] + " " + p[1]).join("L")).join("")}" fill="none" stroke="${{ executat: "#1f9d55", executie: "#f28c00", proiectare: "#7a3fc7" }[d.lucrare.stare]}" stroke-width="6"><title>${esc(d.n)}: ${esc(d.lucrare.t)}</title></path>`).join("")}</svg></div></div>`;
  }
  /* fereastra cu datele actului: la clic pe hartă sau în listă */
  function fereastra(html) {
    let m = document.getElementById("g7-m");
    if (!m) { m = document.createElement("div"); m.id = "g7-m"; document.body.appendChild(m); m.addEventListener("click", e => { if (e.target === m || e.target.closest("[data-x]")) m.hidden = true; }); addEventListener("keydown", e => { if (e.key === "Escape") m.hidden = true; }); }
    m.innerHTML = `<div class="g7-mb" role="dialog" aria-modal="true"><button type="button" data-x aria-label="închide">×</button>${html}</div>`; m.hidden = false;
  }
  const STARE = { executat: "AC vechi de 3–8 ani (probabil executat)", santier: "AC de 0–3 ani (șantier probabil)", nou: "AC recent", proiectare: "CU de până la un an (în proiectare)" };
  const PREC = { parcela: "pe parcelă, după numărul cadastral", parcela_mama: "pe parcela-mamă: lotul exact nu se poate stabili", strada: "aproximativ, după stradă" };
  function fisaAct(a, full) {
    return `<h3 class="g7-h3">${a.t === "AC" ? "Autorizație de construire" : "Certificat de urbanism"}${full ? " " + esc(a.nr) : ""}</h3><div class="g7-kv">${[["Data", a.d], ["Lucrare", a.ob], ["Stadiu", STARE[a.s] || a.s], ["Poziție", PREC[a.prec]], ["Distanță", nf(a.dist) + " m"], ...(full ? [["Nr. cadastral / CF", a.nc || "necompletat în registru"], ["Adresă", a.adr], ["Suprafață", a.mp ? a.mp + " mp" : ""], ["Beneficiar", "nu apare în registrele publice"]] : [])].filter(x => x[1]).map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join("")}</div>`;
  }
  function legaActe(S, acte) { S.querySelectorAll("[data-act]").forEach(e => e.onclick = () => { const a = acte.find(x => x.t + x.nr + x.d === e.dataset.act); if (a) fereastra(fisaAct(a, true)); }); }
  function zona(G, Z, I, S) {
    if (!Z) { S.innerHTML = `<h2 class="g7-h">Zona: autorizații și certificate</h2><p class="g7-p">Registrele nu sunt încă legate de această parcelă.</p>`; return; }
    const full = !!(G._V && G._V.acte), A = full ? G._V.acte : Z.acte, st = Z.stat, ani = Object.keys(st.pe_an), max = Math.max(...ani.map(a => st.pe_an[a].AC + st.pe_an[a].CU), 1), IN = Z.inele || {};
    const azi = new Date(), l12 = A.filter(a => (azi - new Date(a.d)) < 366 * 864e5), P0 = st.pozitii || {};
    const col = { executat: "#2c5c9c", santier: "#e8a33d", nou: "#c2185b", proiectare: "#1f9d55" }, nume = { executat: "AC 3–8 ani", santier: "AC 0–3 ani", proiectare: "CU până la un an" };
    const img = I && (I.zona_satelit || I.acces_satelit), W = 840;
    const map = img ? satMap(P(G._id) + img.fisier, img, W, W, ({ X, Y }) => {
      const pol = k => (IN[k] || []).map(p => X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1)).join(" ");
      let s = `<g data-l="acte">`;
      const v = new Set(); A.forEach((a, i) => { if (a.prec === "parcela" && (a.nc || a.k) && !v.has(a.nc || a.k)) { v.add(a.nc || a.k); s += `<polygon data-i="${i}" points="${pol(a.nc || a.k)}" fill="${col[a.s] || "#999"}" fill-opacity=".45" stroke="${col[a.s] || "#999"}" stroke-width="1.8" style="cursor:pointer"/>`; } });
      A.forEach((a, i) => { if (a.prec !== "parcela") s += `<circle data-i="${i}" cx="${X(a.x).toFixed(1)}" cy="${Y(a.y).toFixed(1)}" r="6" fill="${col[a.s] || "#999"}" stroke="#fff" stroke-width="1.6" style="cursor:pointer"/>`; });
      return s + `</g><path d="${lotPath(img.lot_px.map(([px, py]) => [(px - img.centru_px[0]) * img.m_per_px, -(py - img.centru_px[1]) * img.m_per_px]), X, Y)}" fill="rgba(255,40,40,.18)" stroke="#ff2a2a" stroke-width="3"/>`;
    }, { aria: "autorizațiile din jurul parcelei pe imaginea satelitară", eti: "Dă clic pe parcelă" }) : "";
    S.innerHTML = `<h2 class="g7-h">Zona: ce s-a autorizat în jur</h2><div class="g7-b">
      <div class="g7-k"><div><b>${nf(st.pe_tip.AC || 0)}</b><span>autorizații de construire în 1 km, 2018–2026</span></div><div><b>${nf(l12.filter(a => a.t === "CU").length)}</b><span>certificate de urbanism în ultimele 12 luni</span></div><div><b>${nf(l12.filter(a => a.t === "AC").length)}</b><span>autorizații în ultimele 12 luni</span></div><div><b>${nf(P0.parcela || 0)}</b><span>acte marcate pe parcelă; ${nf((P0.parcela_mama || 0) + (P0.strada || 0))} cu bulină, poziție aproximativă</span></div></div>
      <div class="g7-two"><div><div>${map}</div><div class="g7-leg" style="margin-top:8px">${Object.keys(nume).map(k => `<span><i style="background:${col[k]}"></i>${nume[k]}</span>`).join("")}<span>parcelă colorată = poziție după numărul cadastral · bulină = poziție aproximativă</span></div></div>
        <div class="g7-c"><b style="display:block;margin-bottom:4px">Ritmul autorizărilor în 1 km</b><div class="g7-bars">${ani.map(a => { const v = st.pe_an[a]; return `<div><i style="height:${Math.round(100 * v.AC / max)}px" title="autorizații: ${v.AC}"></i>${v.CU ? `<i class="c" style="height:${Math.round(100 * v.CU / max)}px;margin-top:-3px" title="certificate: ${v.CU}"></i>` : ""}<span>${a.slice(2)}</span></div>`; }).join("")}</div><p class="g7-p" style="margin-top:6px">albastru = autorizații de construire; portocaliu = certificate de urbanism (avem de la sfârșitul lui 2025). Stadiul e dedus din data actului.</p></div></div>
      ${!full ? "" : `<div class="g7-c"><b style="display:block;margin-bottom:6px">Cele mai apropiate acte</b><div class="g7-t" style="border:0;padding:0" id="g7zl">${A.map((a, i) => [a, i]).sort((x, y) => x[0].dist - y[0].dist).slice(0, 14).map(([a, i]) => `<div data-i="${i}" style="cursor:pointer"><em>${esc(a.d)}</em><em>${esc(a.t)}${full ? " " + esc(a.nr) : ""}</em><span>${esc(a.ob)}<small>la ${nf(a.dist)} m · ${esc(PREC[a.prec] || "")}</small></span></div>`).join("")}</div></div>`}</div>`;
    S.querySelectorAll("[data-i]").forEach(e => e.onclick = () => fereastra(fisaAct(A[+e.dataset.i], full)));
  }
  function pug(G, Z, S) {
    const pg = G._pug, ex = G._pugex; if (!pg) { S.innerHTML = `<h2 class="g7-h">PUG ${esc(G.parcela.uat)}</h2><p class="g7-p">Datele PUG nu sunt legate încă.</p>`; return; }
    const D = pg.fisa_D12 && pg.fisa_D12.text ? pg.fisa_D12.text : "";
    const row = (lab) => { const m = D.match(new RegExp(lab.replace(/[()/]/g, "\\$&") + "\\s*:?\\s*\\n?([^\\n]+)")); return m ? m[1].replace(/\s+/g, " ").trim() : null; };
    const fisa = [["Suprafață UTR", row("Suprafață UTR")], ["Densitate", row("Densitate \\(apartamente / ha\\)")], ["POT estimat pe UTR", row("POT/UTR estimat")], ["Regim de înălțime", row("Regim de înălțime")], ["Funcțiuni permise", row("Funcțiuni/utilizări permise")], ["Operațiune propusă", row("Operațiune propusă")], ["Disfuncționalități notate", (D.match(/RM06[^\n]*|EC01[^\n]*|SC02[^\n]*|SC03[^\n]*/g) || []).join("; ")]].filter(x => x[1]);
    const ZC = { L1: "#f2e36b", L2: "#e9b84c", CCR: "#9aa0ad", TFPP: "#d9c7a0", S: "#d98ca0", SVV: "#7fc8a9", SVP: "#58b26f", GCC: "#b3b3b3" };
    const R = 450, W = 700, X = x => W / 2 + x * (W / 2) / R, Y = y => W / 2 - y * (W / 2) / R;
    const mini = `<div class="g7-map"><svg viewBox="0 0 ${W} ${W}" role="img" aria-label="zonele PUG pe parcelele din jur"><rect width="${W}" height="${W}" fill="#f6f3ea"/>${pg.parcele_in_450m.map(p => `<path d="${lotPath(p.r, X, Y)}" fill="${ZC[p.z] || "#ddd"}" fill-opacity="${p.sigur ? .85 : .45}" stroke="#fff" stroke-width=".8"><title>nc ${esc(p.nc)} · ${esc(p.z)} · UTR ${esc(p.utr)}</title></path>`).join("")}<circle cx="${W / 2}" cy="${W / 2}" r="7" fill="#ff2a2a" stroke="#fff" stroke-width="2"/></svg></div>`;
    S.innerHTML = `<h2 class="g7-h">PUG ${esc(G.parcela.uat)} <span class="g7-badge o">preliminar</span></h2><div class="g7-b">
      <div class="g7-n o"><b>Atenție: nu e PUG în vigoare</b>${esc(pg.stare)}. Până la aprobare se aplică PUG-ul vechi (HCL 38/2005) și PUZ-urile aprobate; reglementările de mai jos arată direcția în care merge comuna, nu drepturi dobândite.</div>
      <div class="g7-k"><div><b>${esc(pg.parcela.zona)}</b><span>${esc(pg.parcela.legenda_L1 || "zonă de locuințe cu regim mic de înălțime")}</span></div><div><b>UTR ${esc(pg.parcela.utr)}</b><span>unitatea teritorială de referință, MUTR ${esc(pg.parcela.mutr)}</span></div><div><b>${nf(pg.parcele_in_450m.filter(p => p.z === "L1").length)}/${nf(pg.parcele_in_450m.length)}</b><span>parcele L1 în 450 m (restul: drumuri, verde, servicii)</span></div></div>
      <div class="g7-two">${ex ? `<figure class="g7-img" style="margin:0"><img src="p/${esc(G._id)}/${esc(ex.fisier)}" alt="extras din planșa PUG" loading="lazy"><figcaption>Extras din planșa de reglementări a PUG-ului nou; crucea roșie = parcela (poziție ±30 m).</figcaption></figure>` : ""}
        <div>${mini}<div class="g7-leg" style="margin-top:8px">${Object.entries(ZC).filter(([k]) => pg.parcele_in_450m.some(p => p.z === k)).map(([k, c]) => `<span><i style="background:${c}"></i>${k}</span>`).join("")}<span>· culoare pală = zonă citită cu încredere mai mică</span></div></div></div>
      ${fisa.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Fișa UTR D12 (propunere RLU 2022)</b><div class="g7-t" style="border:0;padding:0">${fisa.map(([k, v]) => `<div class="g7-s" style="border-top:1px solid var(--line)"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}</div></div>` : ""}
      <p class="g7-p">Fișa UTR e citită automat dintr-o planșă scanată: poate avea mici greșeli.</p></div>`;
  }
  /* planșa UAT: drumuri (lucrări și AC pe stradă), PUZ-uri, proiecte, toate actele; straturile se aprind și se sting */
  function plansaUAT(U, id) {
    if (!U) return "";
    const LC = { executat: "#1f9d55", executie: "#f28c00", proiectare: "#7a3fc7" };
    const pth = s => "M" + s.map(p => p[0] + " " + p[1]).join("L");
    const acMax = Math.max(...U.drumuri.map(d => d.ac), 1);
    const dr = U.drumuri.filter(d => d.ac).map(d => `<path d="${d.s.map(pth).join("")}" fill="none" stroke="#c2185b" stroke-width="${(1.5 + 7 * Math.sqrt(d.ac / acMax)).toFixed(1)}" stroke-opacity=".72" stroke-linecap="round"><title>${esc(d.n)}: ${d.ac} autorizații de construire, 2018–2026</title></path>`).join("");
    const lu = U.drumuri.filter(d => d.lucrare).map(d => `<path d="${d.s.map(pth).join("")}" fill="none" stroke="${LC[d.lucrare.stare]}" stroke-width="6" stroke-linecap="round"><title>${esc(d.n)}: ${esc(d.lucrare.t)}</title></path>`).join("");
    const pr = U.proiecte.filter(p => p.s.length).map(p => `<path d="${p.s.map(pth).join("")}" fill="none" stroke="${LC[p.cod]}" stroke-width="7" stroke-dasharray="14 7"><title>${esc(p.n)} · ${esc(p.stadiu)}</title></path>`).join("");
    const puz = U.puz.map(z => `<circle cx="${z[0]}" cy="${z[1]}" r="9" fill="${z[2] === "aprobat" ? "#0b7285" : "#ffd43b"}" stroke="#fff" stroke-width="2"><title>PUZ ${z[2] === "aprobat" ? "aprobat HCL " + esc(z[3]) : "în lucru"} · ${esc(z[4])} · ${esc(z[5])}</title></circle>`).join("");
    const an0 = new Date().getFullYear() - 3;
    const ac = U.acte.filter(a => +a[3] >= an0).map(a => `<circle cx="${a[0]}" cy="${a[1]}" r="3.4" fill="${a[2] === "CU" ? "#e8a33d" : "#2c5c9c"}"/>`).join("");
    const CH = [["dr", "AC pe străzi", 1], ["lu", "Lucrări la drumuri", 1], ["pr", "Proiecte publice", 1], ["pz", "PUZ-uri", 1], ["ac", "AC și CU recente", 0]];
    return `<div class="g7-c"><b style="display:block;margin-bottom:6px">Planșa comunei: ce se construiește și ce se lucrează</b>
      <div class="g7-map pz g7-pmap" style="margin-top:8px"><div class="g7-ch" id="g7uch">${CH.map(([k, t, on]) => `<button type="button" data-k="${k}" aria-pressed="${on ? "true" : "false"}">${t}</button>`).join("")}</div><svg id="g7uat" viewBox="0 0 ${U.W} ${U.H}" role="img" aria-label="planșa comunei"><image href="p/${esc(id)}/${esc(U.fundal)}" width="${U.W}" height="${U.H}"/><polygon points="${U.uat.map(p => p.join(",")).join(" ")}" fill="none" stroke="#1a1e2a" stroke-width="3" stroke-dasharray="10 7"/>
        <g data-l="dr">${dr}</g><g data-l="lu">${lu}</g><g data-l="pr">${pr}</g><g data-l="ac" style="display:none">${ac}</g><g data-l="pz">${puz}</g><circle cx="${U.pin[0]}" cy="${U.pin[1]}" r="13" fill="#ff2a2a" stroke="#fff" stroke-width="4"><title>lotul 9</title></circle></svg><div class="g7-pop" hidden></div></div>
      <div class="g7-leg" style="margin-top:8px"><span><i style="background:#c2185b"></i>autorizații pe stradă (linie mai groasă = mai multe)</span><span><i style="background:#1f9d55"></i>executat sau raportat</span><span><i style="background:#f28c00"></i>în execuție</span><span><i style="background:#7a3fc7"></i>în proiectare</span><span><i style="background:#0b7285"></i>PUZ aprobat</span><span><i style="background:#ffd43b"></i>PUZ în lucru</span><span><i style="background:#ff2a2a"></i>lotul 9</span></div>
      <p class="g7-p" style="margin-top:6px">Linia întreruptă = proiect cu traseu cunoscut (${U.stat.proiecte_pe_harta} din ${U.stat.proiecte}); atinge o linie sau un punct ca să vezi detaliile.</p></div>`;
  }
  function plansaDrumuri(G) {
    const R = G._Dr; if (!R) return "";
    const LC = { executat: "#1f9d55", executie: "#f28c00", proiectare: "#7a3fc7" }, LN = { executat: "executate", executie: "în execuție", proiectare: "în proiectare" };
    const pth = s => "M" + s.map(p => p[0] + " " + p[1]).join("L");
    return `<div class="g7-c"><b style="display:block;margin-bottom:6px">Drumurile regiunii: executate, în execuție, în proiectare</b>
      <div class="g7-map pz g7-pmap"><div class="g7-ch">${Object.keys(LC).filter(k => R.linii.some(l => l.stare === k)).map(k => `<button type="button" data-st="${k}" aria-pressed="true"><i style="background:${LC[k]}"></i>${LN[k]}</button>`).join("")}</div><svg viewBox="0 0 ${R.W} ${R.H}" role="img" aria-label="drumurile din regiune după stadiu"><image href="p/${esc(G._id)}/${esc(R.fundal)}" width="${R.W}" height="${R.H}"/>${R.linii.map(l => `<path data-st="${l.stare}" d="${l.s.map(pth).join("")}" fill="none" stroke="${LC[l.stare]}" stroke-width="5" stroke-linecap="round"${l.stare === "proiectare" ? ' stroke-dasharray="12 7"' : ""}><title>${esc(l.n)} · ${esc(l.stadiu)}</title></path>`).join("")}<circle cx="${R.pin[0]}" cy="${R.pin[1]}" r="11" fill="#ff2a2a" stroke="#fff" stroke-width="3"/></svg></div>
      <div class="g7-leg" style="margin-top:8px">${Object.keys(LC).map(k => `<span><i style="background:${LC[k]}"></i>${LN[k]}</span>`).join("")}<span>traseul e al întregului drum; sectorul exact al lucrării e în listă</span></div>
      <details style="margin-top:8px"><summary style="font:600 14px var(--font);cursor:pointer">Lista celor ${nf(R.lista.length)} proiecte de drumuri și infrastructură din jur</summary><div class="g7-t" style="margin-top:8px">${R.lista.map(p => `<div style="grid-template-columns:96px minmax(0,1fr)"><em><span class="g7-badge ${p.stare === "executat" ? "v" : "o"}">${LN[p.stare]}</span></em><span><b>${esc(p.n)}</b>${p.km ? " · " + nf(p.km, 1) + " km" : ""}${p.val ? " · " + nf(p.val / 1e6, 1) + " mil. lei" : ""}<small>${esc(p.stadiu)}${p.exec ? " · " + esc(p.exec) : ""}${p.pe_harta ? "" : " · fără traseu pe hartă"}</small></span></div>`).join("")}</div></details></div>`;
  }
  function legaUAT(S) { S.querySelectorAll("#g7uch button").forEach(b => b.onclick = () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); const g = S.querySelector(`#g7uat g[data-l="${b.dataset.k}"]`); if (g) g.style.display = on ? "" : "none"; });
    S.querySelectorAll("button[data-st]").forEach(b => b.onclick = () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); b.closest(".g7-map").querySelectorAll(`path[data-st="${b.dataset.st}"]`).forEach(x => { x.style.display = on ? "" : "none"; }); });
    /* detaliile unui proiect apar la click pe el, fără lista lungă */
    S.querySelectorAll(".g7-pmap svg").forEach(svg => svg.addEventListener("click", e => { const el = e.target.closest("path,circle"), t = el && el.querySelector("title"), m = svg.closest(".g7-map"); let pop = m.querySelector(".g7-pop"); if (!pop) { pop = document.createElement("div"); pop.className = "g7-pop"; m.appendChild(pop); }
      if (!t) { pop.hidden = true; return; } pop.innerHTML = t.textContent.split(" · ").map((x, i) => i ? `<span>${esc(x)}</span>` : `<b>${esc(x)}</b>`).join(""); pop.hidden = false; })); }
  function proiecte(G, Pj, U, Dd, S) {
    if (!Pj) { S.innerHTML = `<h2 class="g7-h">Proiecte de infrastructură</h2><p class="g7-p">Lista proiectelor nu e legată încă.</p>`; return; }
    const web = Pj.web || [], loc = Pj.lista || [];
    const cls = s => /recep|finaliz|executat|predare/i.test(s || "") ? "v" : /execu|contract|început|incep|semnat/i.test(s || "") ? "o" : /inten|studiu|SF|licit|proiect/i.test(s || "") ? "y" : "o";
    const txt = s => /recep|finaliz|predare/i.test(s || "") ? "gata" : /execu|început|incep/i.test(s || "") ? "în execuție" : /contract|semnat|câștig/i.test(s || "") ? "contractat" : /inten/i.test(s || "") ? "intenție" : /studiu|SF|licit|proiect/i.test(s || "") ? "în pregătire" : "în lucru";
    const str = U ? U.drumuri.filter(d => d.ac).sort((a, b) => b.ac - a.ac).slice(0, 12) : [];
    const aproape = Dd.autorizatii && Dd.autorizatii.pe_strada ? Object.entries(Dd.autorizatii.pe_strada).sort((a, b) => b[1].n - a[1].n).slice(0, 10) : [];
    S.innerHTML = `<h2 class="g7-h">Proiecte care schimbă zona</h2><div class="g7-b">
      <div class="g7-k"><div><b>${nf(web.filter(p => cls(p.stadiu) === "v").length)}</b><span>lucrări publice terminate recent în comună</span></div><div><b>${nf(web.filter(p => cls(p.stadiu) === "o").length)}</b><span>în execuție sau contractate</span></div><div><b>${nf(web.filter(p => cls(p.stadiu) === "y").length)}</b><span>în pregătire sau intenții</span></div>${U ? `<div><b>${nf(U.stat.puz)}</b><span>PUZ-uri private pe hartă, din 290 în registrul comunei</span></div>` : ""}${Pj.uat ? `<div><b>${nf(Pj.uat.buget_2024_lei / 1e6, 0)} mil. lei</b><span>bugetul comunei 2024; PNRR atras ${esc(Pj.uat.pnrr_atras)}</span></div>` : ""}</div>
      ${plansaUAT(U, G._id)}
      ${plansaDrumuri(G)}
      <div class="g7-two">${aproape.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Autorizații pe străzile apropiate, ultimii 3 ani</b>${aproape.map(([n, v]) => `<div class="g7-bar"><span>${esc(n)}</span><i style="width:${Math.round(100 * v.n / aproape[0][1].n)}%"></i><b>${v.n}</b></div>`).join("")}</div>` : ""}
        ${str.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Cele mai active străzi din comună, 2018–2026</b>${str.map(d => `<div class="g7-bar"><span>${esc(d.n)}</span><i style="width:${Math.round(100 * d.ac / str[0].ac)}%"></i><b>${d.ac}</b></div>`).join("")}</div>` : ""}</div>
      <details><summary style="font:600 14px var(--font);cursor:pointer">Lista lucrărilor publice din comună (${nf(web.length)})</summary><div class="g7-t" style="margin-top:8px">${web.map(p => `<div style="grid-template-columns:110px 92px minmax(0,1fr)"><em>${esc(p.data || "")}</em><em><span class="g7-badge ${cls(p.stadiu)}">${txt(p.stadiu)}</span></em><span><b>${esc(p.nume)}</b>${p.valoare ? ` · ${esc(p.valoare)}` : ""}<small>${esc(p.stadiu)}${p.nota ? " · " + esc(p.nota) : ""} · încredere ${esc(p.incredere)}</small></span></div>`).join("")}</div></details>
      ${loc.length ? `<details><summary style="font:600 14px var(--font);cursor:pointer">Alte ${nf(loc.length)} proiecte raportate (SEAP, MDLPA, CJ Timiș), din Banca de Date</summary><div class="g7-t" style="margin-top:8px">${loc.map(p => `<div style="grid-template-columns:90px 110px minmax(0,1fr)"><em>${esc(String(p.start || "").slice(0, 10))}</em><em>${esc(p.sursa_tip)}</em><span>${esc(p.nume || "")}<small>${esc(p.stadiu || "")}${p.valoare_lei ? " · " + esc(String(p.valoare_lei)) + " lei" : ""}${p.executant ? " · " + esc(p.executant) : ""}${p.zona ? " · " + esc(p.zona) : ""}</small></span></div>`).join("")}</div></details>` : ""}
      <p class="g7-p">Stadiile sunt la data ultimei informații găsite; ce e „intenție” nu are încă finanțare.</p></div>`;
    legaUAT(S);
  }
  /* calibrare pe comparabile: cele mai apropiate anunțuri de teren, nu media zonei (v80.0) */
  function calib(G, P0, mp) {
    const A = ((G._V && G._V.anunturi) || []).filter(a => /teren/i.test(a.categ || "") && a.eur_mp > 5 && a.dist != null && a.moneda === "EUR" && a.mp >= 250 && a.mp <= 1500 && !/industri|comercial/i.test(a.titlu || "")).sort((a, b) => a.dist - b.dist).filter((a, i, L) => L.findIndex(b => b.dist === a.dist && b.mp === a.mp) === i).slice(0, 10);
    if (A.length < 3) return "";
    const v = A.map(a => a.eur_mp).sort((a, b) => a - b), med = v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2, ask = P0 / mp, dif = (ask / med - 1) * 100, cal = Math.round(med * mp / 100) * 100;
    return `<div class="g7-c"><h3 class="g7-h3">Evaluarea calibrată pe cele mai apropiate ${A.length} terenuri de locuit scoase la vânzare (250–1.500 mp, fără industrial)</h3>
      <div class="g7-k"><div><b>${nf(Math.round(med))} €/mp</b><span>mediana celor mai apropiate ${A.length} anunțuri (la ${nf(A[0].dist)}–${nf(A[A.length - 1].dist)} m de lot)</span></div><div><b>${nf(Math.round(ask))} €/mp</b><span>prețul cerut pentru lot (${dif >= 0 ? "+" : ""}${nf(dif, 0)} % față de comparabile)</span></div><div><b>${eur(cal)}</b><span>valoarea lotului la prețul comparabilelor (${nf(mp)} mp)</span></div></div>
      <div class="g7-w"><table class="g7-tb"><thead><tr><th>Distanță</th><th>Suprafață</th><th>€/mp</th><th>Anunț</th></tr></thead><tbody>${A.map(a => `<tr><td>${nf(a.dist)} m</td><td>${nf(a.mp)} mp</td><td><b>${nf(Math.round(a.eur_mp))}</b></td><td>${esc((a.titlu || "").slice(0, 70))}</td></tr>`).join("")}</tbody></table></div>
      <p class="g7-p">Prețurile sunt cerute, nu de tranzacție; de obicei se negociază în jos. Comparabilele apropiate pot fi parcele cu alte reguli (PUZ, acces, formă): ajustarea finală se face de evaluator.</p></div>`;
  }
  /* viabilitatea localităților: ritm de creștere și scor de recomandare, în comparație (modelul „Piața RO · Orașe Viabilitate”) */
  function viab(G) {
    const V = G.viabilitate; if (!V) return "";
    const R = V.tabel.slice().sort((a, b) => b.t - a.t), g = V.gh;
    /* orizontul se alege: 12, 16 sau 24 de luni; datele sunt pe 16 luni și se trec pe alt orizont cu același ritm lunar (Manu, 06.11.2026) */
    const pe = (v, n) => (Math.pow(1 + v / 100, n / 16) - 1) * 100;
    const corp = n => { const mx = Math.max(...R.map(r => pe(r.t_max, n))) || 1; return R.map(r => { const t = pe(r.t, n), a = pe(r.t_min, n), b = pe(r.t_max, n), c = pe(r.c, n);
      return `<tr${r.n === g ? ' style="background:#fff3cf;font-weight:700"' : ""}><td>${esc(r.n)}${r.n === g ? " (lotul)" : ""}</td><td>${r.scor}${r.jud ? " <small>(județ)</small>" : ""}</td><td>+${nf(t, 1)} % <small>(${nf(a, 1)}–${nf(b, 1)})</small></td><td style="min-width:120px"><span style="display:block;height:10px;border-radius:5px;background:linear-gradient(90deg,#c9ced8 ${a / mx * 100}%,#2c5c9c ${a / mx * 100}% ${t / mx * 100}%,#9fb7de ${t / mx * 100}% ${b / mx * 100}%,transparent ${b / mx * 100}%)"></span></td><td>+${nf(c, 1)} %</td></tr>`; }).join(""); };
    window.__g7viab = (b, n) => { const c = b.closest(".g7-c"); c.querySelectorAll("[data-or]").forEach(x => x.setAttribute("aria-pressed", x === b)); c.querySelector("tbody").innerHTML = corp(n); c.querySelectorAll(".g7-orn").forEach(x => { x.textContent = n; }); };
    return `<div class="g7-c"><h3 class="g7-h3">Ritmul de creștere și recomandarea, în comparație cu alte localități</h3>
      <div class="g7-ch" style="margin:4px 0 8px">${[12, 16, 24].map(n => `<button type="button" data-or="${n}" aria-pressed="${n === 16}" onclick="__g7viab(this, ${n})">${n} luni</button>`).join("")}</div>
      <p class="g7-p">Prognoza prețului terenului pe <span class="g7-orn">16</span> luni, cu intervalul pesimist–optim, și scorul de recomandare 0–100. ${esc(V.nota)}</p>
      <div class="g7-w"><table class="g7-tb"><thead><tr><th>Localitate</th><th>Scor</th><th>Teren, <span class="g7-orn">16</span> luni</th><th></th><th>Construit, <span class="g7-orn">16</span> luni</th></tr></thead><tbody>${corp(16)}</tbody></table></div>
      <p class="g7-p"><b>Din ce e făcută cifra pentru ${esc(g)}</b> (pe 16 luni, în puncte procentuale):</p>
      <div class="g7-t">${V.semnale_ghiroda.map(s => `<div style="grid-template-columns:200px 70px minmax(0,1fr)"><em>${esc(s[0])}</em><b>${esc(s[1])}</b><span>${esc(s[2])}</span></div>`).join("")}</div>
      <p class="g7-p">Sursa: ${esc(V.sursa)}. Pe 12 și 24 de luni, cifrele sunt aceleași ritmuri lunare duse pe alt orizont. Estimare statistică, nu promisiune de preț și nu consultanță de investiții.</p></div>`;
  }
  function preturi(G, Hs, S) {
    const ip = G.istoric_preturi || {}, c = G.comercial || {}, P0 = ip.ancora_eur || c.pret_eur || 0, mp = G.parcela.suprafata_mp;
    const idx = ((Hs && Hs.indice && Hs.indice.puncte) || []).slice().sort((a, b) => a.an - b.an), last = idx[idx.length - 1];
    const serie = last ? idx.map(p => ({ an: p.an, v: P0 * p.v / last.v })) : [];
    const tm = (ip.serie_timisoara_apartamente || []).slice().sort((a, b) => a.an - b.an);
    const cagr = n => { if (!last) return null; const o = idx.find(x => x.an === last.an - n); return o ? Math.pow(last.v / o.v, 1 / n) - 1 : null; };
    const tmL = tm.length > 1 ? tm[tm.length - 1] : null, tm16 = tm.find(x => x.an === 2016), gTm = tmL && tm16 ? Math.pow(tmL.v / tm16.v, 1 / (tmL.an - tm16.an)) - 1 : null;
    const g5 = cagr(5), g10 = cagr(10), lo = Math.min(g5 ?? 1, g10 ?? 1), hi = Math.max(g5 ?? 0, g10 ?? 0, gTm ?? 0, (G.viabilitate ? Math.pow(1 + (G.viabilitate.tabel.find(r => r.n === G.viabilitate.gh) || { t: 0 }).t / 100, 12 / 16) - 1 : 0)), med = g5 != null && g10 != null ? (g5 + g10) / 2 : (g5 ?? g10 ?? 0);
    const VB = G.viabilitate, vg = VB && VB.tabel.find(r => r.n === VB.gh), gMod = vg ? Math.pow(1 + vg.t / 100, 12 / 16) - 1 : null;
    const SC = [["Prudent", lo / 2, "#6b7280", "jumătate din cea mai mică creștere"], ["Bază", med, "#2c5c9c", "media ultimilor 5 și 10 ani"], ["Optimist", hi, "#1f9d55", "ritmul apartamentelor din Timișoara, 2016–2026, cea mai mare creștere văzută"], ["Bază + CATUC", med + .01, "#9a2a1f", "ipoteză: +1 pp/an din raritatea loturilor cu PUZ"], ...(gMod != null ? [["Model localitate", gMod, "#7b3fa0", `prognoza modelului „Piața RO” pe 16 luni pentru teren în ${VB.gh} (${nf(vg.t, 1)} %, interval ${nf(vg.t_min, 1)}–${nf(vg.t_max, 1)} %), adusă la un an`]] : [])];
    const A0 = 2026, W = 760, H = 320, L = 70, R = 96, T = 20, B = 40, a0 = serie.length ? serie[0].an : 2009, a1 = A0 + 10;
    const x = an => L + (an - a0) / (a1 - a0) * (W - L - R), vmax = Math.max(P0 * Math.pow(1 + Math.max(hi, med + .01), 10) * 1.05, ...serie.map(s => s.v)), y = v => T + (1 - v / vmax) * (H - T - B);
    const path = serie.map((s, i) => `${i ? "L" : "M"}${x(s.an).toFixed(1)} ${y(s.v).toFixed(1)}`).join("");
    const cone = SC.map(([n, g, col]) => `<path d="M${x(A0)} ${y(P0)}L${x(A0 + 5)} ${y(P0 * Math.pow(1 + g, 5)).toFixed(1)}L${x(A0 + 10)} ${y(P0 * Math.pow(1 + g, 10)).toFixed(1)}" fill="none" stroke="${col}" stroke-width="2.4" stroke-dasharray="6 4"><title>${n}: ${eur(P0 * Math.pow(1 + g, 10))} în ${A0 + 10}</title></path><text x="${x(A0 + 10) + 5}" y="${(y(P0 * Math.pow(1 + g, 10)) + 4).toFixed(1)}" font-size="10.5" fill="${col}" font-family="var(--mono)">${nf(Math.round(P0 * Math.pow(1 + g, 10) / 1000))} k€</text>`).join("");
    const tmax = Math.max(...tm.map(t => t.v), 1), yT = v => T + (1 - (v / tmax) * (P0 / vmax)) * (H - T - B);
    const chart = serie.length ? `<svg class="g7-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="valoarea lotului pe ani și scenariile pentru următorii 10 ani">
      ${[0, .25, .5, .75, 1].map(f => `<line x1="${L}" x2="${W - R}" y1="${y(vmax * f).toFixed(1)}" y2="${y(vmax * f).toFixed(1)}" stroke="var(--line,#ddd)"/><text x="${L - 6}" y="${(y(vmax * f) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="var(--muted)" font-family="var(--mono)">${nf(Math.round(vmax * f / 1000))} k€</text>`).join("")}
      ${[2010, 2014, 2018, 2022, 2026, 2031, 2036].map(a => `<text x="${x(a).toFixed(1)}" y="${H - 14}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="var(--mono)">${a}</text>`).join("")}
      <path d="${path}L${x(A0)} ${y(P0)}" fill="none" stroke="#2c5c9c" stroke-width="3" stroke-linejoin="round"/>${serie.map(s => `<circle cx="${x(s.an).toFixed(1)}" cy="${y(s.v).toFixed(1)}" r="3.6" fill="#2c5c9c"><title>${s.an}: ${eur(s.v)} (${nf(s.v / mp)} €/mp)</title></circle>`).join("")}
      ${tm.length ? `<path d="${tm.map((t, i) => `${i ? "L" : "M"}${x(Math.max(a0, t.an)).toFixed(1)} ${yT(t.v).toFixed(1)}`).join("")}" fill="none" stroke="#e8a33d" stroke-width="1.8" stroke-dasharray="3 4"/>` : ""}
      ${cone}<line x1="${x(A0)}" x2="${x(A0)}" y1="${T}" y2="${H - B}" stroke="#9a2a1f" stroke-dasharray="3 3"/><text x="${x(A0) - 4}" y="${T + 12}" text-anchor="end" font-size="11" fill="#9a2a1f" font-family="var(--mono)">azi: ${eur(P0)}</text></svg>` : `<p class="g7-p">Seria de indice nu e încărcată (piata_istoric.json).</p>`;
    const r5 = serie.find(s => s.an === (last && last.an - 5)), r10 = serie.find(s => s.an === (last && last.an - 10));
    const cat = G.catuc;
    S.innerHTML = `<h2 class="g7-h">Prețul în timp</h2><div class="g7-b">
      <div class="g7-k"><div><b>${eur(P0)}</b><span>prețul cerut azi, fără TVA: ${nf(c.pret_eur_mp)} €/mp × ${nf(mp)} mp; ≈ ${nf(c.pret_lei)} lei + TVA 21 % = ${nf(Math.round(c.pret_lei * 1.21))} lei (curs ${esc(String(c.curs).replace(".", ","))})</span></div>
        ${r5 ? `<div><b>${eur(r5.v)}</b><span>valoare reconstituită în ${r5.an} (${nf(r5.v / mp)} €/mp)</span></div>` : ""}${r10 ? `<div><b>${eur(r10.v)}</b><span>în ${r10.an} (${nf(r10.v / mp)} €/mp)</span></div>` : ""}
        <div><b>${nf((g5 || 0) * 100, 1)} % / ${nf((g10 || 0) * 100, 1)} %</b><span>creștere anuală în ultimii 5 / 10 ani, după indice</span></div></div>
      <div class="g7-c">${chart}<div class="g7-leg" style="margin-top:8px"><span><i style="background:#2c5c9c"></i>lotul 9, reconstituit din indicele prețurilor locuințelor (România), ancorat la prețul cerut</span><span><i style="background:#e8a33d"></i>tendința apartamentelor din Timișoara</span></div></div>
      <div class="g7-w"><table class="g7-tb"><thead><tr><th>Scenariu</th><th>Pe an</th><th>${A0 + 5}</th><th>${A0 + 10}</th><th>Cum e calculat</th></tr></thead><tbody>${SC.map(([n, g, col, d]) => `<tr><td><b style="color:${col}">${n}</b></td><td>${nf(g * 100, 1)} %</td><td>${eur(P0 * Math.pow(1 + g, 5))} (${nf(P0 * Math.pow(1 + g, 5) / mp)} €/mp)</td><td>${eur(P0 * Math.pow(1 + g, 10))} (${nf(P0 * Math.pow(1 + g, 10) / mp)} €/mp)</td><td>${d}</td></tr>`).join("")}</tbody></table></div>
      ${cat ? `<div class="g7-c"><h3 class="g7-h3">${esc(cat.titlu)}</h3><ul style="margin:0;padding-left:18px;font:14px/1.55 var(--font)">${cat.puncte.map(p => `<li>${esc(p[0])}${p[2] ? `: ${esc(p[1])} <span class="g7-tem">${esc(p[2])}</span>` : ` <span class="g7-tem">${esc(p[1])}</span>`}</li>`).join("")}</ul><p style="margin:8px 0 0;font:14px/1.5 var(--font)">${esc(cat.concluzie)}</p></div>` : ""}
      ${calib(G, P0, mp)}${viab(G)}
      <div class="g7-n o"><b>Cum se citește</b>${esc(ip.metoda || "")} Viitorul e extrapolare, nu promisiune.<small>${esc(ip.reper_anunturi || "")}${c.pozitionare ? " " + esc(c.pozitionare) : ""}</small></div>
      </div>`;
  }
  function comercial(G, S) {
    const c = G.comercial;
    S.innerHTML = `<h2 class="g7-h">${esc(c.titlu)}</h2><div class="g7-b"><p style="margin:0;font:600 20px var(--font)">${esc(c.slogan)}</p>
      <div class="g7-pg">${c.puncte.map(x => `<div class="g7-c"><b>${esc(x.t)}</b><span>${esc(x.d)}</span></div>`).join("")}</div>
      <div class="g7-n v"><b>Preț</b>${esc(c.pret)}${c.pozitionare ? `<small>${esc(c.pozitionare)}</small>` : ""}</div>
      </div>`;
  }

  /* ---------- afiș: 3 pagini ---------- */
  function qrSVG(text) { try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ scalable: true, margin: 2 }); } catch (e) { return ""; } }
  function afisHTML(G, D, id) {
    const c = G.comercial, p = G.parcela, i = G.indicatori, r = i.retrageri || {}, T = (D && D.transport) || {}, u = G.utilitati;
    const dest = (T.destinatii || []).slice(0, 4), stat = (T.statii || [])[0];
    const link = G.qr && G.qr.app ? G.qr.app : "https://euclide119.github.io/cartea-casei-app/raport/";
    const pg1 = `<div class="g7-af g7-af1"><div class="g7-hero" style="background-image:url('p/${esc(id)}/afis_3d.webp')"><div class="g7-hx"><span>teren de vânzare</span><h3>${nf(p.suprafata_mp)} mp pe colț, Giarmata Vii</h3></div></div>
      <div class="row"><div class="pr">${nf(c.pret_eur_mp)} €/mp + TVA<small>${eur(c.pret_eur)} + TVA · ≈ ${nf(c.pret_lei)} lei + TVA</small></div><div class="chips"><span>${nf(p.suprafata_mp)} mp</span><span>lot de colț</span><span>PUZ aprobat 2026</span><span>${esc(i.regim)}</span><span>POT ${esc(i.POT)}</span><span>${esc(p.uat)}</span></div></div>
      <div class="sl">${esc(c.slogan)}</div><div class="ct">Contact: ${c.contact ? esc(c.contact) : "de completat"}</div><div class="pg">1 / 3</div></div>`;
    const pg2 = `<div class="g7-af"><h3 class="h2">Ce poți construi</h3><img src="p/${esc(id)}/afis_puz.webp" alt="" onerror="this.remove()">
      <div class="row"><div class="kv"><b>Funcțiune</b><span>locuințe cu max. 2 apartamente, servicii la parter</span><b>Regim</b><span>${esc(i.regim)}, H max ${esc(i.h_max_m || 12)} m</span><b>POT / CUT</b><span>${esc(i.POT)} / ${esc(i.CUT)}</span><b>Amprentă / ADC</b><span>≈ ${nf(Math.round(i.amprenta_max_mp))} mp / ≈ ${nf(Math.round(i.adc_max_mp))} mp</span></div>
        <div class="kv"><b>Retrageri</b><span>${esc(r.aliniament_m)} m la stradă · ${esc(r.laterale_m)} · ${esc(r.posterior_m)} m în spate</span><b>Verde</b><span>${esc(i.spatii_verzi_pct)} % din lot</span><b>Parcare</b><span>${esc(i.parcare)}</span><b>Acoperiș</b><span>${esc(i.acoperis)}</span></div></div>
      <ul>${c.puncte.slice(0, 3).map(x => `<li><b>${esc(x.t)}.</b> ${esc(x.d)}</li>`).join("")}</ul><div class="pg">2 / 3</div></div>`;
    const pg3 = `<div class="g7-af"><h3 class="h2">Unde e și ce are în jur</h3><img src="p/${esc(id)}/afis_satelit.webp" alt="" onerror="this.remove()">
      <div class="row"><div class="kv">${dest.map(d => `<b>${esc(d.scurt)}</b><span>${d.masina_min} min cu mașina</span>`).join("")}${stat ? `<b>Autobuz</b><span>stație la ${nf(stat.m)} m</span>` : ""}</div>
        <div class="kv">${(u ? u.existente : []).slice(0, 5).map(x => `<b>${esc(x.t)}</b><span>${esc(x.v.split(";")[0].split("(")[0])}</span>`).join("")}</div></div>
      <div class="row"><ul>${c.puncte.slice(3, 6).map(x => `<li><b>${esc(x.t)}.</b> ${esc(x.d)}</li>`).join("")}</ul><div class="qr" style="justify-self:end;text-align:center;font:12px var(--font)">${qrSVG(link)}raportul complet:<br>scanează și introdu codul</div></div>
      <div class="ct">${esc(c.pret)} · Contact: ${c.contact ? esc(c.contact) : "de completat"}</div><div class="pg">3 / 3</div></div>`;
    return pg1 + pg2 + pg3;
  }
  function afis(G, D, S, id) {
    S.innerHTML = `<h2 class="g7-h">Afiș</h2><div class="g7-b"><button class="g7-btn" id="g7p">Emite planșa de promovare (PDF, 3 pagini)</button>${afisHTML(G, D, id)}</div>`;
    S.querySelector("#g7p").onclick = () => { if (window.CC_PDF) return window.CC_PDF.din("Afis " + id, [...S.querySelectorAll(".g7-af")], { pe_pagina: true }); const w = open("", "_blank"); if (!w) return; w.document.write(`<!doctype html><meta charset="utf-8"><title>Afiș ${esc(id)}</title><base href="${location.href.replace(/[^/]*$/, "")}"><style>${st.textContent}body{margin:0;padding:14px;font-family:system-ui;--panel:#fff;--line:#ddd;--muted:#555;--font:system-ui;--mono:ui-monospace,Menlo,monospace}</style>${afisHTML(G, D, id)}<script>onload=()=>setTimeout(print,700)<\/script>`); w.document.close(); };
  }

  /* ---------- acces la drum: suprapunere pe satelit, în capitolul existent ---------- */
  async function acces(G, I, id) {
    const sec = document.getElementById("acces_drum"); if (!sec || sec.querySelector(".g7-acc") || !I || !I.acces_satelit) return;
    if (!sec.innerHTML.trim()) return;
    const H = await jsonOpt(P(id) + "harta.json"); if (!H || !H.dr) return;
    const img = I.acces_satelit, W = img.w || 840, Hh = W, COL = ["#ff8c00", "#ffb000", "#ffd84d", "#fff", "#e6e6e6"], GR = [7, 6, 5, 4, 3];
    const map = satMap(P(id) + img.fisier, img, W, Hh, ({ X, Y }) => {
      let s = "";
      [4, 3, 2, 1, 0].forEach(c => H.dr.forEach(a => { if (a[0] !== c) return; let d = ""; for (let i = 2; i + 1 < a.length; i += 2) d += `${i === 2 ? "M" : "L"}${X(a[i]).toFixed(1)} ${Y(a[i + 1]).toFixed(1)}`; s += `<path d="${d}" fill="none" stroke="#1a1e2a" stroke-width="${GR[c] + 2.5}" stroke-opacity=".55" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${COL[c]}" stroke-width="${GR[c]}" stroke-linecap="round"><title>${esc(a[1] || "drum fără nume")}</title></path>`; }));
      const vaz = new Set(); H.dr.filter(a => a[1] && a[0] <= 4).forEach(a => { if (vaz.has(a[1])) return; const v = []; for (let i = 2; i + 1 < a.length; i += 2) { const q = [X(a[i]), Y(a[i + 1])]; if (q[0] > 40 && q[1] > 30 && q[0] < W - 40 && q[1] < Hh - 30) v.push(q); } if (!v.length) return; vaz.add(a[1]); const [px, py] = v[Math.floor(v.length / 2)]; s += `<text x="${px.toFixed(1)}" y="${py.toFixed(1)}" font-size="20" font-family="var(--font)" fill="#fff" stroke="#1a1e2a" stroke-width="4" paint-order="stroke" text-anchor="middle">${esc(a[1])}</text>`; });
      s += `<path d="${lotPath(img.lot_px.map(([px, py]) => [(px - img.centru_px[0]) * img.m_per_px, -(py - img.centru_px[1]) * img.m_per_px]), X, Y)}" fill="rgba(255,40,40,.2)" stroke="#ff2a2a" stroke-width="5"/>`;
      const ac = (G.parcela && G.parcela.acces_puncte) || []; ac.forEach(([x, y]) => { s += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="14" fill="#1fbf5a" stroke="#fff" stroke-width="4"><title>accesele propuse pe planșa 05 a PUZ-ului</title></circle>`; });
      return s;
    }, { aria: "drumurile din jurul parcelei pe satelit" });
    const div = document.createElement("div"); div.className = "g7-acc g7-b"; div.style.marginTop = "12px";
    div.innerHTML = `${map}<div class="g7-leg"><span><i style="background:#ff8c00"></i>drum principal</span><span><i style="background:#ffd84d"></i>drum terțiar</span><span><i style="background:#fff;border:1px solid #999"></i>stradă / alee</span><span><i style="background:#1fbf5a"></i>accese propuse pe planșa 05</span><span><i style="background:rgba(255,40,40,.5);border:2px solid #ff2a2a"></i>lotul 9</span></div>
      <div class="g7-n o"><b>Accesul lotului 9, după PUZ</b>${esc(G.parcela.acces || "")}<small>Drumurile desenate sunt cele din OpenStreetMap (aceleași ca pe harta de drumuri a raportului); drumurile noi ale PUZ-ului nu există încă în OSM și nu apar până la execuție.</small></div>`;
    sec.appendChild(div);
  }

  /* ---------- privat ---------- */
  async function sha(s) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join(""); }
  /* zoom pe harta anunțurilor: butoane, degete, tragere; rotița doar după un clic pe hartă, ca pagina să nu rămână blocată la derulare */
  function estompeaza(R, n = 3) {
    const U = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua".split(" ");
    R.querySelectorAll(".g7-kv>span,li,p:not(.g7-p):not(:first-child)").forEach((e, i) => { if (i < n) return; const k = Math.min(e.textContent.length, 70); let t = ""; for (let j = i; t.length < k; j++) t += U[j % U.length] + " "; e.textContent = t.trim(); e.classList.add("g7-sb"); e.style.display = "block"; });
  }
  function zoomHarta(B) {
    const svg = B.querySelector("svg"), vb = svg.viewBox.baseVal, W0 = vb.width, H0 = vb.height; let on = false; const pt = new Map(); let ult = null, dist0 = 0;
    const pune = (f, cx, cy) => { const w = Math.max(W0 / 6, Math.min(W0, vb.width / f)), h = w * H0 / W0, r = svg.getBoundingClientRect(), px = cx == null ? .5 : (cx - r.left) / r.width, py = cy == null ? .5 : (cy - r.top) / r.height;
      vb.x = Math.max(0, Math.min(W0 - w, vb.x + (vb.width - w) * px)); vb.y = Math.max(0, Math.min(H0 - h, vb.y + (vb.height - h) * py)); vb.width = w; vb.height = h; B.dataset.scara = (W0 / w).toFixed(2); };
    B.querySelector(".g7-zb").onclick = e => { const b = e.target.closest("[data-z]"); if (b) pune(+b.dataset.z); };
    svg.addEventListener("click", () => { on = true; });
    B.addEventListener("mouseleave", () => { on = false; });
    svg.addEventListener("wheel", e => { if (!on) return; e.preventDefault(); pune(e.deltaY < 0 ? 1.25 : .8, e.clientX, e.clientY); }, { passive: false });
    svg.style.touchAction = "pan-y";
    svg.addEventListener("pointerdown", e => { pt.set(e.pointerId, e); ult = e; if (pt.size === 2) { const [a, b] = [...pt.values()]; dist0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); } });
    svg.addEventListener("pointermove", e => { if (!pt.has(e.pointerId)) return; pt.set(e.pointerId, e);
      if (pt.size === 2) { const [a, b] = [...pt.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); if (dist0) pune(d / dist0, (a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2); dist0 = d; }
      else if (ult && vb.width < W0) { const r = svg.getBoundingClientRect(), k = vb.width / r.width; vb.x = Math.max(0, Math.min(W0 - vb.width, vb.x - (e.clientX - ult.clientX) * k)); vb.y = Math.max(0, Math.min(H0 - vb.height, vb.y - (e.clientY - ult.clientY) * k)); ult = e; } });
    const gata = e => { pt.delete(e.pointerId); ult = null; dist0 = 0; }; svg.addEventListener("pointerup", gata); svg.addEventListener("pointercancel", gata);
  }
  function privat(G, D, S, id, NIV) {
    const pv = G.privat; if (!pv) { S.innerHTML = `<h2 class="g7-h">Privat</h2><p class="g7-p">Modulul privat nu e configurat pentru această proprietate.</p>`; return; }
    if (NIV < 2) {
      S.innerHTML = `<h2 class="g7-h">🔒 Date fine</h2><div class="g7-b"><div class="g7-n y"><b>Ai deja codul?</b>În datele fine sunt: istoricul CU și PUZ, raportul juridic complet, extrasul de informare urbanistică electronică, situația tehnică, utilitățile, rețelele și drumurile autorizate, PUG-ul, proiectele care schimbă zona, evaluarea, prețul în timp, anunțurile din zonă, afișul, numele și telefoanele. Introdu codul de 4 cifre primit la cerere.</div>
        <div class="g7-code"><input id="g7cod" inputmode="numeric" placeholder="0000" maxlength="4" autocomplete="off" aria-label="codul privat"><button class="g7-btn" id="g7in">Deschide</button><span class="g7-p" id="g7msg"></span></div></div>`;
      const AB = window.CC_REMOTE && window.CC_ANTIBOT ? window.CC_ANTIBOT.monteaza(S.querySelector(".g7-code")) : null;
      S.querySelector("#g7in").onclick = async () => {
        const v = S.querySelector("#g7cod").value.trim(), m = S.querySelector("#g7msg");
        if (window.CC_REMOTE) {
          const s0 = await window.CC_STARE.citeste(); if (!s0) { m.textContent = "introdu din nou codul raportului"; return; }
          const dv = AB && await AB.ok(); if (!dv) { m.textContent = "bifează „nu sunt robot”"; return; }
          const r = await fetch(window.CC_STARE.FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "privat", token: s0.token, pin: v, antibot: dv }) }), j = await r.json();
          if (!r.ok) { m.textContent = j.error || "cod greșit"; return; }
          await window.CC_STARE.scrie(Object.assign(s0, { token: j.token, n: 2 }));
        } else if ((await sha(v)) !== pv.hash) { m.textContent = "cod greșit"; return; }
        sessionStorage.setItem("g7priv:" + id, "1"); location.reload();
      };
      S.querySelector("#g7cod").onkeydown = e => { if (e.key === "Enter") S.querySelector("#g7in").click(); };
      return;
    }
    S.innerHTML = `<h2 class="g7-h">🔒 Date fine</h2><p class="g7-p">se încarcă…</p>`;
    jsonOpt(P(id) + pv.fisier).then(V => {
      if (!V) { sessionStorage.removeItem("g7priv:" + id); S.innerHTML = `<h2 class="g7-h">🔒 Date fine</h2><p class="g7-p">Datele private nu s-au putut deschide; reintră cu codul.</p>`; return; }
      const A = V.anunturi || [], st = V.stat || {}, te = st.teren_eur_mp || {};
      const W = 1200, Hh = 1208, R = 5000, X = x => W / 2 + x / (2 * R) * W, Y = y => Hh / 2 - y / (2 * R) * W;   // fundal_monumente_topo: 10 × 10 km
      const k = v => v >= 1e6 ? (v / 1e6).toFixed(2).replace(".", ",") + "M" : Math.round(v / 1000) + "k";
      const cat = a => /teren/i.test(a.categ || "") ? "t" : /apart|gars/i.test(a.categ || "") ? "a" : "c";
      const CC = { t: "#2c5c9c", c: "#9a2a1f", a: "#6b7280" }, CN = { t: "terenuri", c: "case și duplexuri", a: "apartamente" };
      const pins = A.filter(a => Math.abs(a.x) < R && Math.abs(a.y) < R).map((a, i) => `<g class="g7-pin" data-i="${i}" transform="translate(${X(a.x).toFixed(1)} ${Y(a.y).toFixed(1)})"><circle r="6" fill="${CC[cat(a)]}" stroke="#fff" stroke-width="1.5"/><text x="8" y="4">${k(a.pret)}</text></g>`).join("");
      const map = `<div class="g7-map"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="anunțuri cu preț în jurul parcelei"><image href="p/${esc(id)}/fundal_monumente_osm.jpg" width="${W}" height="${Hh}" opacity=".9"/><circle cx="${W / 2}" cy="${Hh / 2}" r="${(1000 / (2 * R) * W).toFixed(1)}" fill="none" stroke="#1a1e2a" stroke-dasharray="6 5" opacity=".6"/>${pins}<circle cx="${W / 2}" cy="${Hh / 2}" r="9" fill="#ff2a2a" stroke="#fff" stroke-width="3"/></svg></div>`;
      S.innerHTML = `<h2 class="g7-h">🔒 Date fine</h2><div class="g7-b">
        <div class="g7-k"><div><b>${nf(st.anunturi)}</b><span>anunțuri cu poziție în ≈ 4 km (Storia, OLX, publi24, oct.–nov. 2026)</span></div><div><b>${nf(te.median)} €/mp</b><span>mediana terenurilor (${nf(st.terenuri)} anunțuri); P25–P75 ${nf(te.p25)}–${nf(te.p75)}</span></div><div><b>${nf(G.comercial.pret_eur_mp)} €/mp</b><span>prețul nostru: percentila ≈ ${nf(100 * A.filter(a => cat(a) === "t" && a.eur_mp && a.eur_mp <= G.comercial.pret_eur_mp).length / Math.max(1, A.filter(a => cat(a) === "t" && a.eur_mp).length))} între terenurile din zonă</span></div><div><b>${nf((V.jucatori || []).length)}</b><span>inițiatori de PUZ aprobate în comună (2020–2026)</span></div></div>
        <div class="g7-az">${map}<div class="g7-zb"><button type="button" data-z="1.6" aria-label="mărește">+</button><button type="button" data-z=".625" aria-label="micșorează">−</button></div><div class="g7-fisa" id="g7fisa">Apasă pe un pin ca să vezi anunțul.</div></div><div class="g7-leg" style="margin-top:8px">${Object.keys(CC).map(c => `<span><i style="background:${CC[c]}"></i>${CN[c]}</span>`).join("")}<span>· eticheta = prețul cerut · cercul = 1 km · clic pe hartă, apoi rotița mărește</span></div>
          <div><div class="g7-c" style="margin-top:10px"><b style="display:block;margin-bottom:4px">Agenții și agenți activi</b><span style="font:13px/1.6 var(--font)">${Object.entries(st.agenti || {}).map(([n, v]) => `${esc(n)} (${v})`).join(" · ")}</span></div></div></div>
        ${(V.jucatori_web || []).length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Jucătorii din piață (dezvoltatori, agenții, constructori)</b><div class="g7-t" style="border:0;padding:0">${V.jucatori_web.map(j => `<div style="grid-template-columns:minmax(0,1.3fr) 70px minmax(0,1.6fr)"><span><b>${esc(j.nume)}</b></span><em>${esc(j.perioada)}</em><span style="font-size:12.5px">${esc(j.rol)}</span></div>`).join("")}</div><p class="g7-p" style="margin-top:6px">${esc(V.jucatori_web[0].sursa)}</p></div>` : ""}
        <div class="g7-c"><b style="display:block;margin-bottom:6px">Inițiatori de PUZ aprobate prin HCL (din registrul eMOL; numele lipsesc la majoritatea hotărârilor)</b><div class="g7-t" style="border:0;padding:0">${(V.jucatori || []).slice(0, 20).map(j => `<div style="grid-template-columns:minmax(0,1.2fr) 40px minmax(0,2fr)"><span><b>${esc(j.nume)}</b></span><em>${j.puz_aprobate}</em><span style="font-size:12.5px">${j.exemple.map(e => `HCL ${esc(e.hcl)} · ${esc(e.titlu)}`).join("<br>")}</span></div>`).join("")}</div></div>
        <div class="g7-c"><b style="display:block;margin-bottom:6px">Cele mai apropiate anunțuri</b><div class="g7-t" style="border:0;padding:0"><div style="grid-template-columns:70px 90px 70px minmax(0,1fr)"><em>distanță</em><em>preț</em><em>€/mp</em><em>anunț</em></div>${A.slice(0, 25).map(a => `<div style="grid-template-columns:70px 90px 70px minmax(0,1fr)"><em>${nf(a.dist)} m</em><em>${eur(a.pret)}</em><em>${a.eur_mp || (a.pret && a.mp) ? nf(Math.round(a.eur_mp || a.pret / a.mp)) : "—"}</em><span>${esc(a.titlu)}<small>${esc(a.categ)} · ${nf(a.mp)} mp · ${nf(a.eur_mp)} €/mp · ${esc(a.agent || (a.contact && a.contact.nume) || "")}${a.telefon ? " · " + esc(a.telefon) : ""}${a.url ? ` · <a href="${esc(a.url)}" target="_blank" rel="noopener">anunț</a>` : ""}</small></span></div>`).join("")}</div></div>
        <p class="g7-p">${esc(V.nota)} Pozițiile OLX sunt aproximative (rază ~1 km); Storia/publi24 după precizia notată în bază.</p></div>`;
      zoomHarta(S.querySelector(".g7-az"));
      S.querySelectorAll(".g7-pin").forEach(g => g.onclick = () => { const a = A.filter(a => Math.abs(a.x) < R && Math.abs(a.y) < R)[+g.dataset.i]; S.querySelector("#g7fisa").innerHTML = `<b>${esc(a.titlu)}</b><br>${eur(a.pret)} · ${nf(a.mp)} mp · <b>${nf(a.eur_mp)} €/mp</b> · ${esc(a.categ)}<br>${esc(a.loc || "")}${a.strada ? ", " + esc(typeof a.strada === "string" ? a.strada : "") : ""} · la ${nf(a.dist)} m<br>${esc(a.agent || (a.contact && (a.contact.company_name || a.contact.nume)) || a.sursa)}${a.telefon ? " · " + esc(a.telefon) : ""}${a.data ? " · " + esc(String(a.data).slice(0, 10)) : ""}<br>${a.url ? `<a href="${esc(a.url)}" target="_blank" rel="noopener">deschide anunțul</a>` : ""}`; });
    });
  }

  /* fundalurile de hartă: plan OSM și satelit Sentinel-2, la monumente și la natura protejată */
  function fundalChips(Dd) {
    const F = Dd.fundaluri; if (!F) return;
    [["monumente", "monumente"], ["arii_protejate", "arii_protejate"]].forEach(([k, sec]) => {
      const o = F[k], s = document.getElementById(sec); if (!o || !s || s.querySelector(".g7-fc") || !o.sentinel) return;
      const im = s.querySelector("svg image"); if (!im) return;
      const d = document.createElement("div"); d.className = "g7-ch g7-fc"; d.style.margin = "0 0 6px";
      const sz = window.CC_SEZON && o.sentinel_meta ? CC_SEZON(o.sentinel_meta.data) : "";
      d.innerHTML = [["osm", "Hartă plan"], ["sentinel", "Satelit" + (sz ? " · " + sz : "")]].map(([v, t], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${t}</button>`).join("");
      /* satelitul se încarcă din timp, când harta ajunge pe ecran: la click apare imediat (Manu, 06.11.2026) */
      try { const io = new IntersectionObserver(en => { if (en.some(x => x.isIntersecting)) { io.disconnect(); const i = new Image(); i.src = P(Dd.id) + o.sentinel; } }); io.observe(im.closest("svg")); } catch (e) {}
      d.querySelectorAll("button").forEach(b => b.onclick = () => { d.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); im.setAttribute("href", P(Dd.id) + o[b.dataset.v]); });
      im.closest("svg").before(d);
    });
  }
  function legaturi(id) { const a = document.getElementById("mn-jur"); if (a && !a.dataset.g7) { a.dataset.g7 = "1"; a.href = `#${id}.g7_juridic`; a.onclick = e => { e.preventDefault(); window.showTab("g7_juridic"); }; } }
  /* PUZ în capitolul Urbanism + planul 2D al retragerilor, pe conturul real al lotului (v80.0) */
  function puzInUrbanism(G) {
    const u = document.getElementById("urbanism"); if (!u || u.querySelector(".g7-puz") || !G.indicatori) return;
    const i = G.indicatori, p = G.parcela, r = i.retrageri || {}, g = p.geometrie && p.geometrie.wgs84; if (!g) return;
    const lon0 = g[0][0], lat0 = g[0][1], kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 111132;
    let P = []; g.slice(0, -1).forEach(([x, y]) => { const q = [(x - lon0) * kx, (y - lat0) * ky]; if (!P.length || Math.hypot(q[0] - P[P.length - 1][0], q[1] - P[P.length - 1][1]) > 0.8) P.push(q); });
    if (P.length > 2 && Math.hypot(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) <= 0.8) P.pop();
    const ar = a => a.reduce((s, q, k) => { const w = a[(k + 1) % a.length]; return s + q[0] * w[1] - w[0] * q[1]; }, 0) / 2;
    const rev = ar(P) < 0; if (rev) P.reverse();
    const T0 = i.laturi_tip || [], n = P.length, T = rev ? P.map((_, j) => T0[(n - 2 - j + 2 * n) % n]) : T0.slice();
    const D = { strada: Number(r.aliniament_m) || 5, fund: Number(r.posterior_m) || 10, lateral: 2, colt: Number(r.aliniament_m) || 5 };
    let B = P.slice();
    P.forEach((a, k) => { if (!B.length) return; const b = P[(k + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, d = D[T[k]] ?? 0;
      const f = q => (q[0] - a[0]) * nx + (q[1] - a[1]) * ny - d, o = [];
      B.forEach((c, m) => { const e = B[(m + 1) % B.length], fc = f(c), fe = f(e); if (fc >= 0) o.push(c); if ((fc >= 0) !== (fe >= 0)) { const t = fc / (fc - fe); o.push([c[0] + t * (e[0] - c[0]), c[1] + t * (e[1] - c[1])]); } }); B = o; });
    const xs = P.map(q => q[0]), ys = P.map(q => q[1]), mnx = Math.min(...xs) - 9, mxx = Math.max(...xs) + 9, mny = Math.min(...ys) - 9, mxy = Math.max(...ys) + 9, S = 18, W = (mxx - mnx) * S, H = (mxy - mny) * S;
    const X = x => ((x - mnx) * S).toFixed(1), Y = y => ((mxy - y) * S).toFixed(1), pts = a => a.map(q => X(q[0]) + "," + Y(q[1])).join(" ");
    const GR = { strada: "strada", colt: "strada", lateral: "vecini", fund: "spate" };
    const lab = P.map((a, k) => { const b = P[(k + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 2) return "";
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L, t = T[k], d = D[t] ?? 0;
      return `<text x="${X(mx - nx * 2.6)}" y="${Y(my - ny * 2.6)}" text-anchor="middle" font-size="25" font-weight="700" fill="#1a1e2a">${L.toFixed(1).replace(".", ",")} m</text>` + (d ? `<g class="rt-g rt-${GR[t] || "vecini"}" style="display:none"><line x1="${X(mx)}" y1="${Y(my)}" x2="${X(mx + nx * d)}" y2="${Y(my + ny * d)}" stroke="#9a2a1f" stroke-width="4"/><circle cx="${X(mx)}" cy="${Y(my)}" r="5" fill="#9a2a1f"/><circle cx="${X(mx + nx * d)}" cy="${Y(my + ny * d)}" r="5" fill="#9a2a1f"/><text x="${X(mx + nx * (d / 2) + ny * 1.2)}" y="${Y(my + ny * (d / 2) - nx * 1.2)}" text-anchor="middle" font-size="24" font-weight="800" fill="#9a2a1f" stroke="#fff" stroke-width="5" paint-order="stroke">${String(d).replace(".", ",")} m</text></g>` : ""); }).join("");
    const ab = Math.abs(ar(B)), pot = parseFloat(String(i.POT).replace(",", ".")) || 35, amp = Math.min(ab, p.suprafata_mp * pot / 100);
    const d = document.createElement("div"); d.className = "g7-puz g7-b"; d.style.margin = "12px 0";
    d.innerHTML = `<div class="g7-c"><h3 class="g7-h3">Ce poți construi pe lotul ${esc(p.lot)} · din PUZ-ul aprobat</h3>
      <div class="g7-kv"><b>Destinație</b><span>locuințe individuale (zona L1), maximum 2 apartamente pe parcelă</span><b>Regim de înălțime</b><span>${esc(i.regim)}, înălțime maximă ${esc(i.h_max_m)} m</span><b>POT · CUT</b><span>${esc(i.POT)} · ${esc(i.CUT)}</span><b>Amprentă maximă</b><span>${nf(i.amprenta_max_mp)} mp la sol; suprafață desfășurată maximă ${nf(i.adc_max_mp)} mp</span><b>Spații verzi · parcare</b><span>min. ${esc(i.spatii_verzi_pct)} % · ${esc(i.parcare)}</span><b>Acoperiș · împrejmuire</b><span>${esc(i.acoperis)} · ${esc(i.imprejmuire)}</span><b>Sursa</b><span>${esc(i.sursa)}</span></div></div>
      <div class="g7-c"><h3 class="g7-h3">Retragerile, desenate pe lot (plan 2D, la scară)</h3>
        <div class="g7-map pz g7-rtm"><div class="g7-ch">${[["strada", "distanța față de stradă"], ["vecini", "distanța față de vecini"], ["spate", "distanța față de spate"]].filter(([k]) => T.some(t => (GR[t] || "vecini") === k && D[t])).map(([k, t]) => `<button type="button" data-rt="${k}" aria-pressed="false">${t}</button>`).join("")}</div><svg viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}" role="img" aria-label="Planul lotului cu retragerile"><rect width="100%" height="100%" fill="#f4f1e8"/>
          <polygon points="${pts(P)}" fill="#e6efdc" stroke="#1a1e2a" stroke-width="3"/><polygon points="${pts(B)}" fill="#ffd9a0" fill-opacity=".85" stroke="#9a2a1f" stroke-width="3" stroke-dasharray="14 8"/>${lab}
          <text x="${X((Math.min(...B.map(q => q[0])) + Math.max(...B.map(q => q[0]))) / 2)}" y="${Y((Math.min(...B.map(q => q[1])) + Math.max(...B.map(q => q[1]))) / 2)}" text-anchor="middle" font-size="26" font-weight="800" fill="#1a1e2a">zonă edificabilă ≈ ${nf(Math.round(ab))} mp</text>
          <g transform="translate(${(W - 60).toFixed(0)} 60)"><path d="M0 22 L0 -22 M-10 -8 L0 -24 L10 -8" stroke="#1a1e2a" stroke-width="4" fill="none"/><text y="46" text-anchor="middle" font-size="22" font-weight="700">N</text></g>
          <g transform="translate(30 ${(H - 30).toFixed(0)})"><path d="M0 0 H${10 * S}" stroke="#1a1e2a" stroke-width="5"/><text x="0" y="-8" font-size="20" font-weight="700">0</text><text x="${10 * S}" y="-8" font-size="20" font-weight="700" text-anchor="end">10 m</text></g></svg></div>
        <div class="g7-leg" style="margin-top:8px"><span><i style="background:#e6efdc;border:1px solid #1a1e2a"></i>lotul</span><span><i style="background:#ffd9a0;border:1px dashed #9a2a1f"></i>unde se poate așeza clădirea</span><span style="color:#9a2a1f">bifează distanțele ca să vezi retragerile</span></div>
        <p class="g7-p">Pe lot încap cel mult ${nf(Math.round(amp))} mp amprentă (POT ${esc(i.POT)}), iar zona edificabilă are ≈ ${nf(Math.round(ab))} mp.</p></div>
      <div class="g7-c"><h3 class="g7-h3">De unde vin cotele (în ordinea în care se aplică)</h3><div class="g7-t">
        <div style="grid-template-columns:150px minmax(0,1fr)"><em>1 · PUZ aprobat</em><span><b>Se aplică lotului.</b> Aliniament ${esc(r.aliniament_m)} m, laterale ${esc(r.laterale_m)}, posterior ${esc(r.posterior_m)} m (RLU PUZ art. 16–19, HCL 137/2026). Planul zonal aprobat are prioritate față de PUG.</span></div>
        <div style="grid-template-columns:150px minmax(0,1fr)"><em>2 · PUG nou</em><span>Preliminar, în avizare: aliniament 0, 3 sau 5 m, constant pe stradă; front max. 20 m (individuale), 15 m (cuplate), 10 m (înșiruite). Nu se aplică încă. În vigoare rămâne PUG-ul vechi, pentru care avem doar scanări.</span></div>
        <div style="grid-template-columns:150px minmax(0,1fr)"><em>3 · Codul civil</em><span>Nu fixează retragerea clădirii, ci distanța ferestrelor și balcoanelor la hotar: 1,90 m pentru vedere directă și 0,60 m pentru vedere piezișă (art. 612). Pe limită, fără ferestre către vecin, se poate construi dacă PUZ-ul permite.</span></div>
        <div style="grid-template-columns:150px minmax(0,1fr)"><em>4 · Codul construcțiilor</em><span>Legea 169/2026 dă cadrul general și procedura de autorizare. Cotele de pe lot rămân cele din PUZ; distanțele la vecini le verificăm mai întâi cu Codul civil, apoi cu Codul construcțiilor și la sfârșit cu regulamentul local.</span></div>
        <div style="grid-template-columns:150px minmax(0,1fr)"><em>5 · Verificare</em><span>${esc(i.laturi_nota || "Încadrarea laturilor (stradă, lateral, fund) se confirmă cu planșa PUZ și la certificatul de urbanism.")}</span></div></div></div>
      <div class="g7-c"><h3 class="g7-h3">Parcela în PUZ</h3><div class="g7-kv">${document.documentElement.classList.contains("cc-priv") && p.nc_mama ? `<b>Parcela originală</b><span>nr. cadastral ${esc(p.nc_mama)}</span>` : ""}<b>Parcela rezultată</b><span>lot ${esc(p.lot)}, ${nf(p.suprafata_mp)} mp${p.front_min_m ? `, front minim ${esc(p.front_min_m)} m` : ""}</span>${i.imprejmuire ? `<b>Împrejmuiri</b><span>${esc(i.imprejmuire)}</span>` : ""}</div></div>`;
    const ref = u.querySelector(".hg-b") || u.firstElementChild; ref.after(d);
    d.querySelectorAll("[data-rt]").forEach(b => b.onclick = () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); d.querySelectorAll(".rt-" + b.dataset.rt).forEach(g => { g.style.display = on ? "" : "none"; }); });
  }
  function pugInUrbanism(G) {
    const c = G.pug_comparatie, u = document.getElementById("urbanism"); if (!c || !u || u.querySelector(".g7-pc")) return;
    const d = document.createElement("div"); d.className = "g7-pc g7-b"; d.style.marginTop = "12px";
    const bl = (t, L, b) => `<div class="g7-c"><h3 class="g7-h3">${t} <span class="g7-badge ${b}">${b === "o" ? "preliminar" : "în vigoare"}</span></h3><div class="g7-kv">${L.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join("")}</div></div>`;
    d.innerHTML = `<div class="g7-two">${bl("PUG nou", c.nou, "o")}${bl("PUG vechi", c.vechi, "v")}</div><div class="g7-n o"><b>De verificat</b>${esc(c.atentie)}</div>`;
    u.appendChild(d);
  }
  let cur = null;
  async function pornește(Dd) {
    if (cur === Dd.id) { try { const G = window.__G7 && window.__G7[Dd.id]; if (G) { acces(G, G._img, Dd.id); fundalChips(Dd); legaturi(Dd.id); pugInUrbanism(G); puzInUrbanism(G); } } catch (e) {} return; }
    if (!document.querySelector('nav#tabs [data-t="urbanism"]')) return;
    cur = Dd.id;
    TABS.forEach(([k]) => { document.querySelector(`nav [data-t="${k}"]`)?.remove(); document.getElementById(k)?.remove(); });
    const G = await jsonOpt(P(Dd.id) + "g7.json"); if (!G) return;
    G._id = Dd.id;
    const NIV = window.CC_NIVEL_P ? await window.CC_NIVEL_P : (window.parent !== window ? 1 : 2);
    if (NIV >= 2) { const [Gp, V, Pg, Dr, Hh] = await Promise.all([jsonOpt(P(Dd.id) + "g7_priv.json"), jsonOpt(P(Dd.id) + "privat.json"), jsonOpt(P(Dd.id) + "pug_date.json"), jsonOpt(P(Dd.id) + "plansa_drumuri.json"), jsonOpt(P(Dd.id) + "harta.json")]); Object.assign(G, Gp || {}); Object.assign(G.parcela, G.parcela_priv || {}); G._V = V; G._pug = Pg; G._Dr = Dr; G._cad = Hh && Hh.cad; }
    else { const Hh = await jsonOpt(P(Dd.id) + "harta.json"); G._cad = Hh && Hh.cad; }
    document.documentElement.classList.toggle("cc-priv", NIV >= 2);
    const [U, Z, Pj, I, Hs, ex] = await Promise.all([NIV >= 2 ? jsonOpt(P(Dd.id) + "plansa_uat.json") : null, jsonOpt(P(Dd.id) + "zona.json"), NIV >= 2 ? jsonOpt(P(Dd.id) + "proiecte.json") : null, jsonOpt(P(Dd.id) + "imagini_g7.json"), jsonOpt("piata_istoric.json"), NIV >= 2 ? jsonOpt(P(Dd.id) + "pug_extras.json") : null]);
    G._img = I; G._pugex = ex; G._U = U; window.__G7 = Object.assign(window.__G7 || {}, { [Dd.id]: G });
    const T2 = NIV >= 2 ? TABS : TABS.filter(([k, , d]) => d !== "@priv" || k === "g7_privat");
    document.getElementById("g7-priv")?.remove();
    const S = Object.fromEntries(T2.map(([k, t, d]) => [k, fila(k, NIV < 2 && k === "g7_privat" ? "🔒 Date fine" : t, d)]));
    if (NIV >= 2) { const g = grupPriv(); const mv = () => { [["evaluare", "g7_preturi"], ["proiecte", "g7_preturi"]].forEach(([t, inainte]) => { const e = document.querySelector(`nav#tabs [data-t="${t}"]`); if (e && e.parentNode !== g) g.insertBefore(e, g.querySelector(`[data-t="${inainte}"]`)); }); }; mv(); setInterval(mv, 900); }
    cu(G, S.g7_cu); if (NIV < 2) estompeaza(S.g7_cu); sinteza(G, S.g7_sinteza, NIV); zona(G, Z, I, S.g7_zona);
    if (NIV < 2) privat(G, Dd, S.g7_privat, Dd.id, NIV);
    if (NIV >= 2) { istoric(G, S.g7_istoric); juridic(G, S.g7_juridic, Dd.id); extras(G, Z, Dd, S.g7_extras, Dd.id); comercial(G, S.g7_comercial); privat(G, Dd, S.g7_privat, Dd.id, NIV); tehnic(G, S.g7_tehnic); utilitati(G, Z, S.g7_utilitati); pug(G, Z, S.g7_pug); proiecte(G, Pj, U, Dd, S.g7_proiecte); preturi(G, Hs, S.g7_preturi); afis(G, Dd, S.g7_afis, Dd.id); }
    acces(G, I, Dd.id); pugInUrbanism(G); puzInUrbanism(G);
    window.CC_ACORDEON && window.CC_ACORDEON.reia(15000);   // pe conexiune lentă modulele vin după ce pagina s-a așezat: acordeonul trebuie să le preia
    if (NIV >= 2) { const pune = () => { const s = document.getElementById("evaluare"); if (!s || s.querySelector(".g7-evc") || !s.firstElementChild) return; const b = document.createElement("div"); b.className = "g7-evc g7-b keep"; b.style.margin = "12px 0"; const ip = G.istoric_preturi || {}; b.innerHTML = calib(G, ip.ancora_eur || (G.comercial || {}).pret_eur || 0, G.parcela.suprafata_mp) + viab(G); const h = s.querySelector(".hg-b") || s.firstElementChild; h.after(b); }; pune(); setInterval(pune, 1500); }
  }
  setInterval(() => { try { const Dd = typeof D !== "undefined" ? D : null; if (Dd && Dd.id) pornește(Dd); } catch (e) { console.warn("g7", e); } }, 1200);
})();
