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
.g7-n b{display:block;margin-bottom:2px}.g7-n small{display:block;margin-top:4px;color:var(--muted);font-size:12.5px}
.g7-p{margin:0;font:13px/1.5 var(--font);color:var(--muted)}
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
.g7-ch{display:flex;flex-wrap:wrap;gap:6px}.g7-ch button{font:600 12.5px var(--font);padding:6px 11px;border-radius:999px;border:1px solid #c9ced8;background:#fff;color:#555;cursor:pointer}.g7-ch button[aria-pressed="true"]{background:#1a1e2a;color:#fff;border-color:#1a1e2a}
.g7-bar{display:grid;grid-template-columns:minmax(90px,150px) 1fr 34px;gap:8px;align-items:center;padding:3px 0;font:13px var(--font)}.g7-bar i{display:block;height:9px;border-radius:5px;background:#c2185b;opacity:.75}.g7-bar b{font:700 12px var(--mono);text-align:right}
.g7-code{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.g7-code input{font:600 18px var(--mono);letter-spacing:.2em;padding:8px 12px;border:1px solid #c9ced8;border-radius:8px;width:170px;text-transform:uppercase}
.g7-pin{cursor:pointer}.g7-pin text{font:700 10px var(--mono);fill:#fff;paint-order:stroke;stroke:#1a1e2a;stroke-width:3px;stroke-linejoin:round}
.g7-fisa{border:1px solid #c9ced8;border-radius:12px;background:var(--panel);padding:12px 14px;font:13.5px/1.5 var(--font);min-height:60px}
/* afiș: 3 pagini */
.g7-af{border:2px solid #1a1e2a;border-radius:6px;background:#fff;color:#1a1e2a;padding:26px 28px;max-width:760px;margin:0 auto;font-family:var(--font);display:flex;flex-direction:column;gap:12px}
.g7-af+.g7-af{margin-top:14px}
.g7-af h3{margin:0;font:800 clamp(30px,5vw,52px)/1 var(--font);text-transform:uppercase;letter-spacing:.02em}
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

  const TABS = [["g7_istoric", "Istoric CU și PUZ", "urbanism"], ["g7_cu", "CU electronic", "g7_istoric"], ["g7_juridic", "Raport juridic", "g7_cu"], ["g7_extras", "Extras urbanistic", "g7_juridic"],
    ["g7_tehnic", "Situația tehnică", "g7_extras"], ["g7_utilitati", "Utilități", "g7_tehnic"], ["g7_zona", "Zona: AC și CU", "g7_utilitati"],
    ["g7_pug", "PUG Ghiroda (preliminar)", "g7_zona"], ["g7_proiecte", "Proiecte și planșa UAT", "g7_pug"], ["g7_preturi", "Prețul în timp", "g7_proiecte"],
    ["g7_comercial", "Prezentare comercială", "g7_preturi"], ["g7_afis", "Afiș", "g7_comercial"], ["g7_privat", "🔒 Privat", "g7_afis"]];

  function fila(k, titlu, dupa) {
    const ref = document.querySelector(`nav#tabs [data-t="${dupa}"]`);
    if (ref && !document.querySelector(`nav [data-t="${k}"]`)) { const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = k; b.textContent = titlu; b.onclick = () => window.showTab(k); ref.after(b); }
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
    return `<div class="g7-map"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.aria || "hartă")}"><image href="${esc(img)}" width="${W}" height="${H}"/>${layers({ X, Y, W, H, mpp })}</svg></div>`;
  }
  const lotPath = (pts, X, Y) => pts && pts.length ? "M" + pts.map(([x, y]) => `${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join("L") + "Z" : "";

  /* ---------- capitole ---------- */
  function istoric(G, S) {
    const L = G.istoric.slice().sort((a, b) => a.data.localeCompare(b.data));
    S.innerHTML = `<h2 class="g7-h">Istoric CU și PUZ</h2><div class="g7-b">
      <div class="g7-k"><div><b>${L.filter(x => x.tip === "CU").length}</b><span>certificate de urbanism pe PUZ</span></div><div><b>${esc(L[L.length - 1].data)}</b><span>ultimul pas: ${esc(L[L.length - 1].text.split(":")[0].split("(")[0])}</span></div></div>
      <div class="g7-t">${L.map(x => `<div><em>${esc(x.data)}</em><em>${esc(x.tip)}${x.nr ? " " + esc(x.nr) : ""}</em><span>${esc(x.text)}<small>${esc(x.sursa)}</small></span></div>`).join("")}</div>
      <p class="g7-p">Sursa pașilor CU, APM și HCL este extrasul de informare urbanistică de pe hartă și registrul HCL (eMOL). Lunile fără zi vin din calea fișierelor de pe site-ul primăriei.</p></div>`;
  }
  function cu(G, S) {
    const c = G.cu_electronic;
    S.innerHTML = `<h2 class="g7-h">Certificat de urbanism electronic</h2><div class="g7-b">
      <div class="g7-c"><span>${esc(c.ce)}</span></div>
      <div class="g7-n v"><b>Verificat în surse</b><ul style="margin:4px 0 0;padding-left:18px">${lista(c.verificat)}</ul></div>
      <div class="g7-n o"><b>De confirmat la Primăria Ghiroda</b><ul style="margin:4px 0 0;padding-left:18px">${lista(c.de_confirmat)}</ul></div>
      <div class="g7-t">${c.pasi.map((p, i) => `<div style="grid-template-columns:30px minmax(0,1fr)"><em>${i + 1}</em><span>${esc(p)}</span></div>`).join("")}</div>
      <p class="g7-p">${esc(c.limita)}${c.sursa ? " Surse: " + esc(c.sursa) + "." : ""}</p></div>`;
  }
  function juridic(G, S, id) {
    const j = G.juridic, STC = { BUN: "v", "?": "o", "RĂU": "r" };
    const html = () => `<div class="g7-leg" style="margin-bottom:10px"><span><i style="background:#a9d8b8"></i>concluzie bună</span><span><i style="background:#ecc98f"></i>semn de întrebare</span><span><i style="background:#e6a9a0"></i>sună rău</span><span><i style="background:#e6d98a"></i>opinia avocatului</span></div>
      <div class="g7-c"><div class="g7-kv">${j.antet.map(([k, v]) => `<b>${esc(k)}</b><span>${esc(v)}</span>`).join("")}</div></div>
      <div class="g7-n o"><b>Pe scurt</b>${esc(j.pe_scurt)}</div>
      <div class="g7-w"><table class="g7-tb"><thead><tr><th>Subiect</th><th>Stare</th><th>Ce înseamnă</th><th>Temei</th></tr></thead><tbody>${j.tabel.map(r => `<tr><td><b>${esc(r[0])}</b></td><td><span class="g7-badge ${STC[r[1]] || "o"}">${esc(r[1])}</span></td><td>${esc(r[2])}</td><td class="g7-tem">${esc(r[3])}</td></tr>`).join("")}</tbody></table></div>
      <div class="g7-n y"><b>Opinia avocatului · concluzie generală</b>${j.avocat_general ? esc(j.avocat_general) : "de completat de cabinetul partener. Partea de mai sus descrie fapte și legea, nu sfătuiește ce să faci."}</div>
      ${j.sectiuni.map(s => `<div class="g7-c"><h3 class="g7-h3">${esc(s.t)}</h3>${s.texte.map(([t, a]) => `<p class="g7-pj">${esc(t)}${a ? ` <span class="g7-tem">${esc(a)}</span>` : ""}</p>`).join("")}</div>`).join("")}
      <div class="g7-two"><div class="g7-n v"><b>Documente analizate</b><ul style="margin:4px 0 0;padding-left:18px">${lista(j.documente)}</ul></div><div class="g7-n o"><b>Nu sunt în dosar (se cer)</b><ul style="margin:4px 0 0;padding-left:18px">${lista(j.neprezentate)}</ul></div></div>
      <p class="g7-p">${esc(j.sursa)}.</p>`;
    S.innerHTML = `<h2 class="g7-h">Raport juridic</h2><div class="g7-b"><button class="g7-btn" id="g7pj">Tipărește raportul juridic</button>${html()}</div>`;
    S.querySelector("#g7pj").onclick = () => tipar("Raport juridic " + id, `<h1 class="g7-h">Raport juridic</h1><div class="g7-b">${html()}</div>`);
  }
  function tipar(titlu, corp) { const w = open("", "_blank"); if (!w) return; w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(titlu)}</title><base href="${location.href.replace(/[^/]*$/, "")}"><style>${st.textContent}body{margin:0;padding:18px;font-family:system-ui;--panel:#fff;--line:#ddd;--muted:#555;--font:system-ui;--mono:ui-monospace,Menlo,monospace}</style>${corp}<script>onload=()=>setTimeout(print,700)<\/script>`); w.document.close(); }

  /* extrasul de informare urbanistică: se generează automat, din datele raportului (nu înlocuiește certificatul emis de primărie, art. 254 CATUC) */
  function extras(G, Z, Dd, S, id) {
    const p = G.parcela, i = G.indicatori, r = i.retrageri || {}, pg = Z && Z.pug, L = G.istoric.slice().sort((a, b) => a.data.localeCompare(b.data));
    const vec = ((Z && Z.acte) || []).slice().sort((a, b) => a.dist - b.dist).slice(0, 8), puz = ((Z && Z.puz_vecine) || []).filter(x => x.hcl && x.dist > 30).slice(0, 6);
    const F = Dd.inundatii || {}, zg = Dd.zgomot || {}, SE = Dd.seismic || {};
    const rand = (k, v) => v == null || v === "" ? "" : `<b>${esc(k)}</b><span>${esc(v)}</span>`;
    const html = () => `<div class="g7-n y"><b>Document informativ, generat automat la ${esc(new Date().toLocaleDateString("ro-RO"))}</b>Reunește datele raportului pentru acest imobil. Nu e certificat de urbanism și nu înlocuiește actul emis de Primăria Ghiroda.</div>
      <div class="g7-c"><h3 class="g7-h3">I. Imobilul</h3><div class="g7-kv">${rand("UAT", p.uat + ", jud. Timiș")}${rand("Localitate", p.localitate)}${rand("Strada de acces", p.strada)}${rand("Parcela-mamă", p.cf)}${rand("Lot", p.lot + ", " + nf(p.suprafata_mp) + " mp, " + p.pozitie)}${rand("Poziție", "punct pe hartă în interiorul lotului; contur din planșa PUZ, " + (p.geometrie ? nf(p.geometrie.arie_geometrie_mp, 1) + " mp" : ""))}</div></div>
      <div class="g7-c"><h3 class="g7-h3">II. Regimul juridic</h3><div class="g7-kv">${rand("Proprietar parcelă-mamă", p.proprietar_mama)}${rand("Teritoriu", "intravilan (memoriu PUZ)")}${rand("Documentație aprobată", "PUZ „Dezvoltare zonă de locuințe cu funcțiuni complementare”, HCL Ghiroda 137/10.09.2026")}${rand("Lot în CF", "neînscris separat, după datele noastre; se verifică pe extrasul CF")}</div></div>
      <div class="g7-c"><h3 class="g7-h3">III. Regimul economic</h3><div class="g7-kv">${rand("Folosință actuală", p.folosinta)}${rand("Destinație", "locuințe cu max. 2 apartamente; servicii la parter; comerț max. 150 mp cu condiții")}${rand("PUG în vigoare", "PUG-ul vechi al comunei")}${rand("PUG preliminar", pg ? "UTR " + pg.parcela.utr + ", zona " + pg.parcela.zona + " (HCL 274/15.11.2023, în avizare)" : "")}</div></div>
      <div class="g7-c"><h3 class="g7-h3">IV. Regimul tehnic</h3><div class="g7-kv">${rand("POT / CUT", i.POT + " / " + i.CUT)}${rand("Regim de înălțime", i.regim + ", H max " + (i.h_max_m || 12) + " m")}${rand("Amprentă / ADC maxim", "≈ " + nf(Math.round(i.amprenta_max_mp)) + " mp / ≈ " + nf(Math.round(i.adc_max_mp)) + " mp")}${rand("Retrageri", r.aliniament_m + " m la stradă; " + r.laterale_m + "; " + r.posterior_m + " m în spate")}${rand("Verde și parcare", i.spatii_verzi_pct + " % din lot; " + i.parcare)}${rand("Acces", p.acces)}</div></div>
      <div class="g7-c"><h3 class="g7-h3">V. Acte pe parcela-mamă</h3><div class="g7-t" style="border:0;padding:0">${L.map(x => `<div><em>${esc(x.data)}</em><em>${esc(x.tip)}${x.nr ? " " + esc(x.nr) : ""}</em><span>${esc(x.text)}</span></div>`).join("")}</div></div>
      <div class="g7-c"><h3 class="g7-h3">VI. În jur</h3><div class="g7-t" style="border:0;padding:0">${vec.map(a => `<div><em>${esc(a.d)}</em><em>${esc(a.t)} ${esc(a.nr)}</em><span>${esc(a.ob)}<small>nc ${esc(a.nc)} · la ${nf(a.dist)} m</small></span></div>`).join("")}${puz.map(x => `<div><em>${esc(String(x.data || "").slice(0, 10))}</em><em>PUZ</em><span>HCL ${esc(x.hcl)} · ${esc(x.functiune || "")}<small>la ${nf(x.dist)} m</small></span></div>`).join("")}</div></div>
      <div class="g7-c"><h3 class="g7-h3">VII. Riscuri, din capitolele raportului</h3><div class="g7-kv">${rand("Inundații", F.hz100 ? "zonă inundabilă 1 %: " + (F.hz100.dist_m === 0 ? "în zonă" : "la " + F.hz100.dist_m + " m") : "vezi capitolul Inundații")}${rand("Seism", SE.ag_txt ? "ag = " + SE.ag_txt + " g, Tc = " + SE.tc + " s" : "")}${rand("Zgomot", "calea ferată la ≈ 215 m; aeroportul aproape; vezi capitolul Zgomot")}${rand("Protecții", "LEA 20 kV, conductă de gaz, canal ANIF: fără construcții în zonele de protecție")}</div></div>
      <p class="g7-p">Certificatul oficial pentru informare se cere de la primărie: se emite în cel mult 5 zile lucrătoare cu sistem informatic funcțional, altfel în cel mult 10 (L169/2026 art. 254).</p>`;
    S.innerHTML = `<h2 class="g7-h">Extras de informare urbanistică</h2><div class="g7-b"><button class="g7-btn" id="g7pe">Tipărește extrasul</button>${html()}</div>`;
    S.querySelector("#g7pe").onclick = () => tipar("Extras urbanistic " + id, `<h1 class="g7-h">Extras de informare urbanistică</h1><div class="g7-b">${html()}</div>`);
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
      <p class="g7-p">Sursa planșelor: PUZ Maule CTC SRL Etapa 2 (primariaghiroda.ro, 02.2026). Conturul lotului: ${G.parcela.geometrie ? nf(G.parcela.geometrie.arie_geometrie_mp, 1) + " mp din vector, față de " + nf(p.suprafata_mp) + " mp scris" : ""}.</p>
      <div class="g7-n o"><b>Limite</b><ul style="margin:4px 0 0;padding-left:18px">${lista(G.limite)}</ul></div>
      <p class="g7-p">Sursă indicatori: ${esc(i.sursa)}. ${esc(t.sursa || "")}</p></div>`;
  }
  function utilitati(G, Z, S) {
    const u = G.utilitati; if (!u) { S.innerHTML = `<h2 class="g7-h">Utilități</h2><p class="g7-p">Nu avem încă date despre utilități pentru această parcelă.</p>`; return; }
    const acte = ((Z && Z.acte) || []).filter(a => a.util).sort((a, b) => b.d.localeCompare(a.d));
    const an0 = new Date().getFullYear() - 3, rec = acte.filter(a => +a.d.slice(0, 4) >= an0);
    S.innerHTML = `<h2 class="g7-h">Utilități</h2><div class="g7-b">
      <div class="g7-k"><div><b>${u.existente.filter(x => x.st === "v").length}/${u.existente.length}</b><span>rețele la stradă sau pe teren (din memoriul PUZ)</span></div><div><b>${nf(rec.length)}</b><span>autorizații și CU pentru rețele, branșamente și drumuri în 1 km, din ${an0}</span></div><div><b>${nf(acte.length)}</b><span>acte de utilități în 1 km din 2018</span></div></div>
      <div class="g7-t">${u.existente.map(x => `<div class="g7-s" style="border-top:1px solid var(--line)"><b><span class="g7-badge ${x.st}">${x.st === "v" ? "există" : "condiții"}</span><br>${esc(x.t)}</b><span>${esc(x.v)}</span></div>`).join("")}</div>
      <div class="g7-n o"><b>Cine plătește</b>${esc(u.costuri)}<small>${esc(u.conditie)}</small></div>
      <figure class="g7-img" style="margin:0"><img src="p/${esc(G._id)}/${esc(u.plansa)}" alt="planșa Edilitare PUZ" loading="lazy" onerror="this.parentNode.remove()"><figcaption>Planșa Edilitare a PUZ-ului (rețele existente și propuse: apă, canal, gaz, LEA 20 kV, fibră). Sursa: ${esc(u.sursa)}.</figcaption></figure>
      ${rec.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Lucrări de rețele și drumuri autorizate în jur (${an0}–azi)</b><div class="g7-t" style="border:0;padding:0">${rec.slice(0, 12).map(a => `<div><em>${esc(a.d)}</em><em>${esc(a.t)} ${esc(a.nr)}</em><span>${esc(a.ob)}<small>${esc(a.adr || "")} · la ${nf(a.dist)} m${a.url ? ` · <a href="${esc(a.url)}" target="_blank" rel="noopener">registru</a>` : ""}</small></span></div>`).join("")}</div></div>` : ""}
      <p class="g7-p">Rețelele subterane nu sunt în hărțile publice; ce arătăm vine din memoriul PUZ (dec. 2025) și din registrele AC/CU ale primăriei. Traseele exacte se cer operatorilor (Aquatim, Delgaz, Rețele Electrice Banat) la faza CU.</p></div>`;
  }
  function zona(G, Z, I, S) {
    if (!Z) { S.innerHTML = `<h2 class="g7-h">Zona: autorizații și certificate</h2><p class="g7-p">Registrele AC/CU nu sunt încă legate de această parcelă.</p>`; return; }
    const A = Z.acte, st = Z.stat, ani = Object.keys(st.pe_an), max = Math.max(...ani.map(a => st.pe_an[a].AC + st.pe_an[a].CU), 1);
    const azi = new Date(), l12 = A.filter(a => (azi - new Date(a.d)) < 366 * 864e5);
    const col = { executat: "#2c5c9c", santier: "#e8a33d", proiectare: "#7fc8a9" }, nume = { executat: "AC 3–8 ani (executat sau expirat)", santier: "AC 0–3 ani (șantier probabil)", proiectare: "CU ≤ 12 luni (în proiectare)" };
    const img = I && (I.zona_satelit || I.acces_satelit), W = 840, H = 840;
    const map = img ? satMap(P(G._id) + img.fisier, img, W, H, ({ X, Y }) => {
      let s = `<path d="${lotPath(img.lot_px.map(([px, py]) => [(px - img.centru_px[0]) * img.m_per_px, -(py - img.centru_px[1]) * img.m_per_px]), X, Y)}" fill="rgba(255,40,40,.18)" stroke="#ff2a2a" stroke-width="3"/>`;
      A.filter(a => Math.abs(a.x) < 420 * img.m_per_px && Math.abs(a.y) < 420 * img.m_per_px).forEach(a => { s += `<circle cx="${X(a.x).toFixed(1)}" cy="${Y(a.y).toFixed(1)}" r="${a.t === "CU" ? 6 : 7}" fill="${col[a.s] || "#999"}" stroke="#fff" stroke-width="1.6" opacity=".92"><title>${esc(a.t + " " + a.nr + " · " + a.d + " · " + a.ob)}</title></circle>`; });
      return s;
    }, { aria: "autorizațiile din jurul parcelei pe imaginea satelitară" }) : "";
    S.innerHTML = `<h2 class="g7-h">Zona: ce s-a autorizat în jur</h2><div class="g7-b">
      <div class="g7-k"><div><b>${nf(st.pe_tip.AC || 0)}</b><span>autorizații de construire în 1 km, 2018–2026</span></div><div><b>${nf(l12.filter(a => a.t === "CU").length)}</b><span>certificate de urbanism în ultimele 12 luni</span></div><div><b>${nf(l12.filter(a => a.t === "AC").length)}</b><span>autorizații în ultimele 12 luni</span></div><div><b>${nf(st.utilitati)}</b><span>acte pentru rețele, branșamente, drumuri</span></div></div>
      <div class="g7-two"><div>${map}<div class="g7-leg" style="margin-top:8px">${Object.keys(col).map(k => `<span><i style="background:${col[k]}"></i>${nume[k]}</span>`).join("")}<span><i style="background:rgba(255,40,40,.5);border:2px solid #ff2a2a"></i>lotul 9</span></div></div>
        <div class="g7-c"><b style="display:block;margin-bottom:4px">Ritmul autorizărilor în 1 km</b><div class="g7-bars">${ani.map(a => { const v = st.pe_an[a]; return `<div><i style="height:${Math.round(100 * v.AC / max)}px" title="AC ${v.AC}"></i>${v.CU ? `<i class="c" style="height:${Math.round(100 * v.CU / max)}px;margin-top:-3px" title="CU ${v.CU}"></i>` : ""}<span>${a.slice(2)}</span></div>`; }).join("")}</div><p class="g7-p" style="margin-top:6px">albastru = autorizații de construire; portocaliu = certificate de urbanism (publicate din 2025). Un ritm constant de ~40 AC pe an înseamnă un cartier care se construiește.</p></div></div>
      <div class="g7-c"><b style="display:block;margin-bottom:6px">Cele mai apropiate acte</b><div class="g7-t" style="border:0;padding:0">${A.slice().sort((a, b) => a.dist - b.dist).slice(0, 14).map(a => `<div><em>${esc(a.d)}</em><em>${esc(a.t)} ${esc(a.nr)}</em><span>${esc(a.ob)}<small>${esc(a.adr || "")} · nc ${esc(a.nc)} · la ${nf(a.dist)} m · ${esc((nume[a.s] || "").split(" (")[0])}${a.url ? ` · <a href="${esc(a.url)}" target="_blank" rel="noopener">registru</a>` : ""}</small></span></div>`).join("")}</div></div>
      <p class="g7-p">${esc(Z.sursa)}. Beneficiarii nu apar (registrul nu-i publică); „executat”/„șantier” sunt deduse din data autorizației, nu din recepții.</p></div>`;
  }
  function pug(G, Z, S) {
    const pg = Z && Z.pug, ex = G._pugex; if (!pg) { S.innerHTML = `<h2 class="g7-h">PUG Ghiroda</h2><p class="g7-p">Datele PUG nu sunt legate încă.</p>`; return; }
    const D = pg.fisa_D12 && pg.fisa_D12.text ? pg.fisa_D12.text : "";
    const row = (lab) => { const m = D.match(new RegExp(lab.replace(/[()/]/g, "\\$&") + "\\s*:?\\s*\\n?([^\\n]+)")); return m ? m[1].replace(/\s+/g, " ").trim() : null; };
    const fisa = [["Suprafață UTR", row("Suprafață UTR")], ["Densitate", row("Densitate \\(apartamente / ha\\)")], ["POT estimat pe UTR", row("POT/UTR estimat")], ["Regim de înălțime", row("Regim de înălțime")], ["Funcțiuni permise", row("Funcțiuni/utilizări permise")], ["Operațiune propusă", row("Operațiune propusă")], ["Disfuncționalități notate", (D.match(/RM06[^\n]*|EC01[^\n]*|SC02[^\n]*|SC03[^\n]*/g) || []).join("; ")]].filter(x => x[1]);
    const ZC = { L1: "#f2e36b", L2: "#e9b84c", CCR: "#9aa0ad", TFPP: "#d9c7a0", S: "#d98ca0", SVV: "#7fc8a9", SVP: "#58b26f", GCC: "#b3b3b3" };
    const R = 450, W = 700, X = x => W / 2 + x * (W / 2) / R, Y = y => W / 2 - y * (W / 2) / R;
    const mini = `<div class="g7-map"><svg viewBox="0 0 ${W} ${W}" role="img" aria-label="zonele PUG pe parcelele din jur"><rect width="${W}" height="${W}" fill="#f6f3ea"/>${pg.parcele_in_450m.map(p => `<path d="${lotPath(p.r, X, Y)}" fill="${ZC[p.z] || "#ddd"}" fill-opacity="${p.sigur ? .85 : .45}" stroke="#fff" stroke-width=".8"><title>nc ${esc(p.nc)} · ${esc(p.z)} · UTR ${esc(p.utr)}</title></path>`).join("")}<circle cx="${W / 2}" cy="${W / 2}" r="7" fill="#ff2a2a" stroke="#fff" stroke-width="2"/></svg></div>`;
    S.innerHTML = `<h2 class="g7-h">PUG Ghiroda <span class="g7-badge o">preliminar</span></h2><div class="g7-b">
      <div class="g7-n o"><b>Atenție: nu e PUG în vigoare</b>${esc(pg.stare)}. Până la aprobare se aplică PUG-ul vechi (HCL 38/2005) și PUZ-urile aprobate; reglementările de mai jos arată direcția în care merge comuna, nu drepturi dobândite.</div>
      <div class="g7-k"><div><b>${esc(pg.parcela.zona)}</b><span>${esc(pg.parcela.legenda_L1 || "zonă de locuințe cu regim mic de înălțime")}</span></div><div><b>UTR ${esc(pg.parcela.utr)}</b><span>unitatea teritorială de referință, MUTR ${esc(pg.parcela.mutr)}</span></div><div><b>${nf(pg.parcele_in_450m.filter(p => p.z === "L1").length)}/${nf(pg.parcele_in_450m.length)}</b><span>parcele L1 în 450 m (restul: drumuri, verde, servicii)</span></div></div>
      <div class="g7-two">${ex ? `<figure class="g7-img" style="margin:0"><img src="p/${esc(G._id)}/${esc(ex.fisier)}" alt="extras din planșa PUG" loading="lazy"><figcaption>Extras din planșa de reglementări PUG Giarmata Vii (SUBCONTROL, versiunea de consultare 04.2023); crucea roșie = parcela (poziție ±30 m, planșa e poziționată după colțuri).</figcaption></figure>` : ""}
        <div>${mini}<div class="g7-leg" style="margin-top:8px">${Object.entries(ZC).filter(([k]) => pg.parcele_in_450m.some(p => p.z === k)).map(([k, c]) => `<span><i style="background:${c}"></i>${k}</span>`).join("")}<span>· culoare pală = zonă citită cu încredere mai mică</span></div></div></div>
      ${fisa.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Fișa UTR D12 (propunere RLU 2022)</b><div class="g7-t" style="border:0;padding:0">${fisa.map(([k, v]) => `<div class="g7-s" style="border-top:1px solid var(--line)"><b>${esc(k)}</b><span>${esc(v)}</span></div>`).join("")}</div></div>` : ""}
      <p class="g7-p">Sursa: ${esc(pg.sursa)}. Fișa UTR e textul din planșa MUTR D (OCR), poate avea mici greșeli de citire.</p></div>`;
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
      <div class="g7-ch" id="g7uch">${CH.map(([k, t, on]) => `<button type="button" data-k="${k}" aria-pressed="${on ? "true" : "false"}">${t}</button>`).join("")}</div>
      <div class="g7-map" style="margin-top:8px"><svg id="g7uat" viewBox="0 0 ${U.W} ${U.H}" role="img" aria-label="planșa comunei Ghiroda"><image href="p/${esc(id)}/${esc(U.fundal)}" width="${U.W}" height="${U.H}"/><polygon points="${U.uat.map(p => p.join(",")).join(" ")}" fill="none" stroke="#1a1e2a" stroke-width="3" stroke-dasharray="10 7"/>
        <g data-l="dr">${dr}</g><g data-l="lu">${lu}</g><g data-l="pr">${pr}</g><g data-l="ac" style="display:none">${ac}</g><g data-l="pz">${puz}</g><circle cx="${U.pin[0]}" cy="${U.pin[1]}" r="13" fill="#ff2a2a" stroke="#fff" stroke-width="4"><title>lotul 9</title></circle></svg></div>
      <div class="g7-leg" style="margin-top:8px"><span><i style="background:#c2185b"></i>autorizații pe stradă (linie mai groasă = mai multe)</span><span><i style="background:#1f9d55"></i>executat sau raportat</span><span><i style="background:#f28c00"></i>în execuție</span><span><i style="background:#7a3fc7"></i>în proiectare</span><span><i style="background:#0b7285"></i>PUZ aprobat</span><span><i style="background:#ffd43b"></i>PUZ în lucru</span><span><i style="background:#ff2a2a"></i>lotul 9</span></div>
      <p class="g7-p" style="margin-top:6px">Linia întreruptă = proiect cu traseu cunoscut (${U.stat.proiecte_pe_harta} din ${U.stat.proiecte}); restul sunt în lista de mai jos. ${esc(U.sursa)}.</p></div>`;
  }
  function legaUAT(S) { S.querySelectorAll("#g7uch button").forEach(b => b.onclick = () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); const g = S.querySelector(`#g7uat g[data-l="${b.dataset.k}"]`); if (g) g.style.display = on ? "" : "none"; }); }
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
      <div class="g7-two">${aproape.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Autorizații pe străzile apropiate, ultimii 3 ani</b>${aproape.map(([n, v]) => `<div class="g7-bar"><span>${esc(n)}</span><i style="width:${Math.round(100 * v.n / aproape[0][1].n)}%"></i><b>${v.n}</b></div>`).join("")}</div>` : ""}
        ${str.length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Cele mai active străzi din comună, 2018–2026</b>${str.map(d => `<div class="g7-bar"><span>${esc(d.n)}</span><i style="width:${Math.round(100 * d.ac / str[0].ac)}%"></i><b>${d.ac}</b></div>`).join("")}</div>` : ""}</div>
      <div class="g7-t">${web.map(p => `<div style="grid-template-columns:110px 92px minmax(0,1fr)"><em>${esc(p.data || "")}</em><em><span class="g7-badge ${cls(p.stadiu)}">${txt(p.stadiu)}</span></em><span><b>${esc(p.nume)}</b>${p.valoare ? ` · ${esc(p.valoare)}` : ""}<small>${esc(p.stadiu)}${p.nota ? " · " + esc(p.nota) : ""}${p.sursa ? ` · <a href="${esc(p.sursa)}" target="_blank" rel="noopener">sursă</a>` : ""} · încredere ${esc(p.incredere)}</small></span></div>`).join("")}</div>
      ${loc.length ? `<details><summary style="font:600 14px var(--font);cursor:pointer">Alte ${nf(loc.length)} proiecte raportate (SEAP, MDLPA, CJ Timiș), din Banca de Date</summary><div class="g7-t" style="margin-top:8px">${loc.map(p => `<div style="grid-template-columns:90px 110px minmax(0,1fr)"><em>${esc(String(p.start || "").slice(0, 10))}</em><em>${esc(p.sursa_tip)}</em><span>${esc(p.nume || "")}<small>${esc(p.stadiu || "")}${p.valoare_lei ? " · " + esc(String(p.valoare_lei)) + " lei" : ""}${p.executant ? " · " + esc(p.executant) : ""}${p.zona ? " · " + esc(p.zona) : ""}</small></span></div>`).join("")}</div></details>` : ""}
      <p class="g7-p">${esc(Pj.nota)} Stadiile din presă sunt la data articolului; ce e „intenție” nu are încă finanțare.</p></div>`;
    legaUAT(S);
  }
  function preturi(G, Hs, S) {
    const ip = G.istoric_preturi || {}, c = G.comercial || {}, P0 = ip.ancora_eur || c.pret_eur || 0, mp = G.parcela.suprafata_mp;
    const idx = ((Hs && Hs.indice && Hs.indice.puncte) || []).slice().sort((a, b) => a.an - b.an), last = idx[idx.length - 1];
    const serie = last ? idx.map(p => ({ an: p.an, v: P0 * p.v / last.v })) : [];
    const tm = (ip.serie_timisoara_apartamente || []).slice().sort((a, b) => a.an - b.an);
    const cagr = n => { if (!last) return null; const o = idx.find(x => x.an === last.an - n); return o ? Math.pow(last.v / o.v, 1 / n) - 1 : null; };
    const tmL = tm.length > 1 ? tm[tm.length - 1] : null, tm16 = tm.find(x => x.an === 2016), gTm = tmL && tm16 ? Math.pow(tmL.v / tm16.v, 1 / (tmL.an - tm16.an)) - 1 : null;
    const g5 = cagr(5), g10 = cagr(10), lo = Math.min(g5 ?? 1, g10 ?? 1), hi = Math.max(g5 ?? 0, g10 ?? 0, gTm ?? 0), med = g5 != null && g10 != null ? (g5 + g10) / 2 : (g5 ?? g10 ?? 0);
    const SC = [["Prudent", lo / 2, "#6b7280", "jumătate din cea mai mică creștere"], ["Bază", med, "#2c5c9c", "media ultimilor 5 și 10 ani"], ["Optimist", hi, "#1f9d55", "ritmul apartamentelor din Timișoara, 2016–2026, cea mai mare creștere văzută"], ["Bază + CATUC", med + .01, "#9a2a1f", "ipoteză: +1 pp/an din raritatea loturilor cu PUZ"]];
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
      <div class="g7-n o"><b>Cum se citește</b>${esc(ip.metoda || "")} Viitorul e extrapolare, nu promisiune.<small>${esc(ip.reper_anunturi || "")}${c.pozitionare ? " " + esc(c.pozitionare) : ""}</small></div>
      <p class="g7-p">Surse: ${esc((Hs && Hs.indice && Hs.indice.sursa) || "Eurostat prc_hpi_a")}; ${esc(ip.sursa_serie || "")}; Legea 169/2026. Prețurile reale de tranzacție nu sunt publice pe UAT; grila notarială 2026 pentru Ghiroda e de integrat.</p></div>`;
  }
  function comercial(G, S) {
    const c = G.comercial;
    S.innerHTML = `<h2 class="g7-h">${esc(c.titlu)}</h2><div class="g7-b"><p style="margin:0;font:600 20px var(--font)">${esc(c.slogan)}</p>
      <div class="g7-pg">${c.puncte.map(x => `<div class="g7-c"><b>${esc(x.t)}</b><span>${esc(x.d)}</span></div>`).join("")}</div>
      <div class="g7-two"><figure class="g7-img" style="margin:0"><img src="p/${esc(G._id)}/afis_satelit.webp" alt="parcela pe satelit" loading="lazy" onerror="this.parentNode.remove()"><figcaption>Lotul 9 (contur roșu) pe imaginea satelitară din 21.04.2025 (Esri World Imagery).</figcaption></figure>
        <figure class="g7-img" style="margin:0"><img src="p/${esc(G._id)}/afis_puz.webp" alt="parcela pe planșa PUZ" loading="lazy" onerror="this.parentNode.remove()"><figcaption>Lotul 9 pe planșa 05 „Posibilități de mobilare” a PUZ-ului aprobat.</figcaption></figure></div>
      <div class="g7-n v"><b>Preț</b>${esc(c.pret)}${c.pozitionare ? `<small>${esc(c.pozitionare)}</small>` : ""}</div>
      <p class="g7-p">${esc(c.nota)}</p></div>`;
  }

  /* ---------- afiș: 3 pagini ---------- */
  function qrSVG(text) { try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ scalable: true, margin: 2 }); } catch (e) { return ""; } }
  function afisHTML(G, D, id) {
    const c = G.comercial, p = G.parcela, i = G.indicatori, r = i.retrageri || {}, T = (D && D.transport) || {}, u = G.utilitati;
    const dest = (T.destinatii || []).slice(0, 4), stat = (T.statii || [])[0];
    const link = G.qr && G.qr.app ? G.qr.app : "https://euclide119.github.io/cartea-casei-app/raport/";
    const pg1 = `<div class="g7-af"><h3>Teren de vânzare</h3><div class="sl">${esc(c.slogan)}</div><img src="p/${esc(id)}/afis_satelit.webp" alt="" onerror="this.remove()">
      <div class="row"><div class="pr">${nf(c.pret_eur_mp)} €/mp + TVA<small>${eur(c.pret_eur)} + TVA pentru ${nf(p.suprafata_mp)} mp · ≈ ${nf(c.pret_lei)} lei + TVA</small></div>
        <div class="chips"><span>${nf(p.suprafata_mp)} mp</span><span>lot de colț</span><span>PUZ aprobat 2026</span><span>${esc(i.regim)}</span><span>POT ${esc(i.POT)}</span><span>${esc(p.localitate)}, ${esc(p.uat)}</span></div></div>
      <div class="ct">Contact: ${c.contact ? esc(c.contact) : "de completat"}</div><div class="pg">1 / 3 · ${esc(p.localitate)} · lot ${esc(p.lot)}</div></div>`;
    const pg2 = `<div class="g7-af"><h3 style="font-size:clamp(22px,3.4vw,34px)">Urbanism: ce poți construi</h3><img src="p/${esc(id)}/afis_puz.webp" alt="" onerror="this.remove()">
      <div class="row"><div class="kv"><b>PUZ</b><span>Maule CTC SRL Etapa 2, aprobat HCL Ghiroda 137/10.09.2026</span><b>Funcțiune</b><span>locuințe cu max. 2 apartamente + servicii la parter</span><b>Regim</b><span>${esc(i.regim)}, H max ${esc(i.h_max_m || 12)} m</span><b>POT / CUT</b><span>${esc(i.POT)} / ${esc(i.CUT)}</span><b>Amprentă / ADC</b><span>≈ ${nf(Math.round(i.amprenta_max_mp))} mp / ≈ ${nf(Math.round(i.adc_max_mp))} mp</span></div>
        <div class="kv"><b>Retrageri</b><span>${esc(r.aliniament_m)} m la stradă · ${esc(r.laterale_m)} · ${esc(r.posterior_m)} m în spate</span><b>Verde</b><span>${esc(i.spatii_verzi_pct)} % din lot</span><b>Parcare</b><span>${esc(i.parcare)}</span><b>Acoperiș</b><span>${esc(i.acoperis)}</span><b>PUG 2023</b><span>UTR D12, zona L1 (preliminar)</span></div></div>
      <ul>${c.puncte.slice(0, 3).map(x => `<li><b>${esc(x.t)}.</b> ${esc(x.d)}</li>`).join("")}</ul><div class="pg">2 / 3 · sursa: planșele PUZ, primariaghiroda.ro</div></div>`;
    const pg3 = `<div class="g7-af"><h3 style="font-size:clamp(22px,3.4vw,34px)">Unde e și ce are în jur</h3><img src="p/${esc(id)}/fundal_monumente_osm.jpg" alt="" style="max-height:300px" onerror="this.remove()">
      <div class="row"><div class="kv">${dest.map(d => `<b>${esc(d.scurt)}</b><span>${d.masina_min} min cu mașina (${nf(d.masina_km, 1)} km)</span>`).join("")}${stat ? `<b>Autobuz</b><span>stația ${esc(stat.nume)} la ${nf(stat.m)} m</span>` : ""}</div>
        <div class="kv">${(u ? u.existente : []).slice(0, 5).map(x => `<b>${esc(x.t)}</b><span>${esc(x.v.split(";")[0].split("(")[0])}</span>`).join("")}</div></div>
      <div class="row"><ul>${c.puncte.slice(3, 6).map(x => `<li><b>${esc(x.t)}.</b> ${esc(x.d)}</li>`).join("")}</ul><div class="qr" style="justify-self:end;text-align:center;font:12px var(--font)">${qrSVG(link)}raportul complet:<br>scanează și introdu codul</div></div>
      <div class="ct">${esc(c.pret)} · Contact: ${c.contact ? esc(c.contact) : "de completat"}</div><div class="pg">3 / 3 · imagini: Esri, © contributorii OpenStreetMap · ${esc(new Date().toLocaleDateString("ro-RO"))}</div></div>`;
    return pg1 + pg2 + pg3;
  }
  function afis(G, D, S, id) {
    S.innerHTML = `<h2 class="g7-h">Afiș</h2><div class="g7-b"><button class="g7-btn" id="g7p">Tipărește afișul (3 pagini)</button>${afisHTML(G, D, id)}<p class="g7-p">Contactul se completează în g7.json (comercial.contact). QR-ul duce la pagina Cărții Casei; raportul se deschide cu codul primit, iar datele private cu al doilea cod.</p></div>`;
    S.querySelector("#g7p").onclick = () => { const w = open("", "_blank"); if (!w) return; w.document.write(`<!doctype html><meta charset="utf-8"><title>Afiș ${esc(id)}</title><base href="${location.href.replace(/[^/]*$/, "")}"><style>${st.textContent}body{margin:0;padding:14px;font-family:system-ui;--panel:#fff;--line:#ddd;--muted:#555;--font:system-ui;--mono:ui-monospace,Menlo,monospace}</style>${afisHTML(G, D, id)}<script>onload=()=>setTimeout(print,700)<\/script>`); w.document.close(); };
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
  function privat(G, D, S, id) {
    const pv = G.privat; if (!pv) { S.innerHTML = `<h2 class="g7-h">Privat</h2><p class="g7-p">Modulul privat nu e configurat pentru această proprietate.</p>`; return; }
    const ok = sessionStorage.getItem("g7priv:" + id) === "1";
    if (!ok) {
      S.innerHTML = `<h2 class="g7-h">🔒 Modul privat</h2><div class="g7-b"><div class="g7-n y"><b>Cere al doilea cod</b>Nume, telefoane, prețuri exacte din anunțuri și jucătorii din piață nu fac parte din raportul oficial. Introdu codul de 4 cifre primit la cerere.</div>
        <div class="g7-code"><input id="g7cod" inputmode="numeric" placeholder="0000" maxlength="4" autocomplete="off" aria-label="codul privat"><button class="g7-btn" id="g7in">Deschide</button><span class="g7-p" id="g7msg"></span></div></div>`;
      S.querySelector("#g7in").onclick = async () => {
        const v = S.querySelector("#g7cod").value.trim(), m = S.querySelector("#g7msg");
        if (window.CC_REMOTE) {
          const s0 = await window.CC_STARE.citeste(); if (!s0) { m.textContent = "introdu din nou codul raportului"; return; }
          const r = await fetch(window.CC_STARE.FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "privat", token: s0.token, pin: v }) }), j = await r.json();
          if (!r.ok) { m.textContent = j.error || "cod greșit"; return; }
          await window.CC_STARE.scrie(Object.assign(s0, { token: j.token, n: 2 }));
        } else if ((await sha(v)) !== pv.hash) { m.textContent = "cod greșit"; return; }
        sessionStorage.setItem("g7priv:" + id, "1"); privat(G, D, S, id);
      };
      S.querySelector("#g7cod").onkeydown = e => { if (e.key === "Enter") S.querySelector("#g7in").click(); };
      return;
    }
    S.innerHTML = `<h2 class="g7-h">🔒 Modul privat</h2><p class="g7-p">se încarcă…</p>`;
    jsonOpt(P(id) + pv.fisier).then(V => {
      if (!V) { sessionStorage.removeItem("g7priv:" + id); S.innerHTML = `<h2 class="g7-h">🔒 Modul privat</h2><p class="g7-p">Datele private nu s-au putut deschide; reintră cu codul.</p>`; return; }
      const A = V.anunturi || [], st = V.stat || {}, te = st.teren_eur_mp || {};
      const W = 1200, Hh = 1208, R = 5000, X = x => W / 2 + x / (2 * R) * W, Y = y => Hh / 2 - y / (2 * R) * W;   // fundal_monumente_topo: 10 × 10 km
      const k = v => v >= 1e6 ? (v / 1e6).toFixed(2).replace(".", ",") + "M" : Math.round(v / 1000) + "k";
      const cat = a => /teren/i.test(a.categ || "") ? "t" : /apart|gars/i.test(a.categ || "") ? "a" : "c";
      const CC = { t: "#2c5c9c", c: "#9a2a1f", a: "#6b7280" }, CN = { t: "terenuri", c: "case și duplexuri", a: "apartamente" };
      const pins = A.filter(a => Math.abs(a.x) < R && Math.abs(a.y) < R).map((a, i) => `<g class="g7-pin" data-i="${i}" transform="translate(${X(a.x).toFixed(1)} ${Y(a.y).toFixed(1)})"><circle r="6" fill="${CC[cat(a)]}" stroke="#fff" stroke-width="1.5"/><text x="8" y="4">${k(a.pret)}</text></g>`).join("");
      const map = `<div class="g7-map"><svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="anunțuri cu preț în jurul parcelei"><image href="p/${esc(id)}/fundal_monumente_osm.jpg" width="${W}" height="${Hh}" opacity=".9"/><circle cx="${W / 2}" cy="${Hh / 2}" r="${(1000 / (2 * R) * W).toFixed(1)}" fill="none" stroke="#1a1e2a" stroke-dasharray="6 5" opacity=".6"/>${pins}<circle cx="${W / 2}" cy="${Hh / 2}" r="9" fill="#ff2a2a" stroke="#fff" stroke-width="3"/></svg></div>`;
      S.innerHTML = `<h2 class="g7-h">🔒 Modul privat</h2><div class="g7-b">
        <div class="g7-k"><div><b>${nf(st.anunturi)}</b><span>anunțuri cu poziție în ≈ 4 km (Storia, OLX, publi24, oct.–nov. 2026)</span></div><div><b>${nf(te.median)} €/mp</b><span>mediana terenurilor (${nf(st.terenuri)} anunțuri); P25–P75 ${nf(te.p25)}–${nf(te.p75)}</span></div><div><b>${nf(G.comercial.pret_eur_mp)} €/mp</b><span>prețul nostru: percentila ≈ ${nf(100 * A.filter(a => cat(a) === "t" && a.eur_mp && a.eur_mp <= G.comercial.pret_eur_mp).length / Math.max(1, A.filter(a => cat(a) === "t" && a.eur_mp).length))} între terenurile din zonă</span></div><div><b>${nf((V.jucatori || []).length)}</b><span>inițiatori de PUZ aprobate în comună (2020–2026)</span></div></div>
        <div class="g7-two"><div>${map}<div class="g7-leg" style="margin-top:8px">${Object.keys(CC).map(c => `<span><i style="background:${CC[c]}"></i>${CN[c]}</span>`).join("")}<span>· eticheta = prețul cerut · cercul = 1 km · apasă pe un pin</span></div></div>
          <div><div class="g7-fisa" id="g7fisa">Apasă pe un pin ca să vezi anunțul: titlu, preț, suprafață, €/mp, agent, telefon, link.</div>
            <div class="g7-c" style="margin-top:10px"><b style="display:block;margin-bottom:4px">Agenții și agenți activi</b><span style="font:13px/1.6 var(--font)">${Object.entries(st.agenti || {}).map(([n, v]) => `${esc(n)} (${v})`).join(" · ")}</span></div></div></div>
        ${(V.jucatori_web || []).length ? `<div class="g7-c"><b style="display:block;margin-bottom:6px">Jucătorii din piață (dezvoltatori, agenții, constructori)</b><div class="g7-t" style="border:0;padding:0">${V.jucatori_web.map(j => `<div style="grid-template-columns:minmax(0,1.3fr) 70px minmax(0,1.6fr)"><span><b>${esc(j.nume)}</b></span><em>${esc(j.perioada)}</em><span style="font-size:12.5px">${esc(j.rol)}</span></div>`).join("")}</div><p class="g7-p" style="margin-top:6px">${esc(V.jucatori_web[0].sursa)}</p></div>` : ""}
        <div class="g7-c"><b style="display:block;margin-bottom:6px">Inițiatori de PUZ aprobate prin HCL (din registrul eMOL; numele lipsesc la majoritatea hotărârilor)</b><div class="g7-t" style="border:0;padding:0">${(V.jucatori || []).slice(0, 20).map(j => `<div style="grid-template-columns:minmax(0,1.2fr) 40px minmax(0,2fr)"><span><b>${esc(j.nume)}</b></span><em>${j.puz_aprobate}</em><span style="font-size:12.5px">${j.exemple.map(e => `HCL ${esc(e.hcl)} · ${esc(e.titlu)}`).join("<br>")}</span></div>`).join("")}</div></div>
        <div class="g7-c"><b style="display:block;margin-bottom:6px">Cele mai apropiate anunțuri</b><div class="g7-t" style="border:0;padding:0">${A.slice(0, 25).map(a => `<div style="grid-template-columns:70px 90px minmax(0,1fr)"><em>${nf(a.dist)} m</em><em>${eur(a.pret)}</em><span>${esc(a.titlu)}<small>${esc(a.categ)} · ${nf(a.mp)} mp · ${nf(a.eur_mp)} €/mp · ${esc(a.agent || (a.contact && a.contact.nume) || a.sursa)}${a.telefon ? " · " + esc(a.telefon) : ""}${a.url ? ` · <a href="${esc(a.url)}" target="_blank" rel="noopener">anunț</a>` : ""}</small></span></div>`).join("")}</div></div>
        <p class="g7-p">${esc(V.nota)} Pozițiile OLX sunt aproximative (rază ~1 km); Storia/publi24 după precizia notată în bază.</p></div>`;
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
      d.innerHTML = [["osm", "Hartă plan"], ["sentinel", "Satelit Sentinel-2"]].map(([v, t], i) => `<button type="button" data-v="${v}" aria-pressed="${i === 0}">${t}</button>`).join("");
      d.querySelectorAll("button").forEach(b => b.onclick = () => { d.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b)); im.setAttribute("href", P(Dd.id) + o[b.dataset.v]); });
      im.closest("svg").before(d);
    });
  }
  function legaturi(id) { const a = document.getElementById("mn-jur"); if (a && !a.dataset.g7) { a.dataset.g7 = "1"; a.href = `#${id}.g7_juridic`; a.onclick = e => { e.preventDefault(); window.showTab("g7_juridic"); }; } }
  let cur = null;
  async function pornește(Dd) {
    if (cur === Dd.id) { try { const G = window.__G7 && window.__G7[Dd.id]; if (G) { acces(G, G._img, Dd.id); fundalChips(Dd); legaturi(Dd.id); } } catch (e) {} return; }
    if (!document.querySelector('nav#tabs [data-t="urbanism"]')) return;
    cur = Dd.id;
    TABS.forEach(([k]) => { document.querySelector(`nav [data-t="${k}"]`)?.remove(); document.getElementById(k)?.remove(); });
    const G = await jsonOpt(P(Dd.id) + "g7.json"); if (!G) return;
    G._id = Dd.id;
    const [U, Z, Pj, I, Hs, ex] = await Promise.all([jsonOpt(P(Dd.id) + "plansa_uat.json"), jsonOpt(P(Dd.id) + "zona.json"), jsonOpt(P(Dd.id) + "proiecte.json"), jsonOpt(P(Dd.id) + "imagini_g7.json"), jsonOpt("piata_istoric.json"), jsonOpt(P(Dd.id) + "pug_extras.json")]);
    G._img = I; G._pugex = ex; window.__G7 = Object.assign(window.__G7 || {}, { [Dd.id]: G });
    const S = Object.fromEntries(TABS.map(([k, t, d]) => [k, fila(k, t, d)]));
    istoric(G, S.g7_istoric); cu(G, S.g7_cu); juridic(G, S.g7_juridic, Dd.id); extras(G, Z, Dd, S.g7_extras, Dd.id); tehnic(G, S.g7_tehnic); utilitati(G, Z, S.g7_utilitati); zona(G, Z, I, S.g7_zona);
    pug(G, Z, S.g7_pug); proiecte(G, Pj, U, Dd, S.g7_proiecte); preturi(G, Hs, S.g7_preturi); comercial(G, S.g7_comercial); afis(G, Dd, S.g7_afis, Dd.id); privat(G, Dd, S.g7_privat, Dd.id);
    acces(G, I, Dd.id);
  }
  setInterval(() => { try { const Dd = typeof D !== "undefined" ? D : null; if (Dd && Dd.id) pornește(Dd); } catch (e) { console.warn("g7", e); } }, 1200);
})();
