/* Raport _ Cartea Casei - „Date fine din jurul proprietății” (v82.11.0, 09.11.2026, cerut de Manu).
   Din p/<id>/date_fine_aproape_mostra.json (nivelul ASCUNS, mascat la sursă: valorile sensibile au doar primele 4 caractere) și, la nivelul ARĂTAT,
   din p/<id>/date_fine_aproape.json (Admin, după butonul „Arată” și codul DOM) sau din funcția server `date_fine_livrare` (Client după plată, filtrată pe server:
   persoanele cu sursa_publica ONRC/AC/CU/PUZ; persoanele fără sursă publică, telefoanele din anunțuri și contactele alocate nu ajung la client).
   Valoarea reală NU se află în pagină la nivelul ascuns. Fără CNP. 20 firme, 20 CU, 20 AC, 20 PUZ, investiții declarate pe comună, alte date (densitate).
   Rând gol = motivul scris; „investitii_lipsa” doar la Admin; investiție fără termen: „termen neprecizat”; fiecare rând: sursă, data sursei, încredere. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO");
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const ADMIN = () => window.parent === window && ((local && !window.CC_CLIENT) || !!(window.CC_ADM && window.CC_ADM.adm && (!window.CC_ADM.ca_client || window.CC_ADM.n >= 2)));
  const SEC = "date_fine_aproape";
  let arataAdmin = false, arataSurse = false, facut = null;   // v82.14.2: sursele doar la „i”, nici în Admin implicit

  function css() {
    if ($("#dfa-css")) return;
    const s = document.createElement("style"); s.id = "dfa-css";
    s.textContent = `#${SEC} .dfa-x{filter:blur(4px);user-select:none;pointer-events:none}
.dfa-cnt{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 12px}.dfa-cnt span{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;font-size:13px}
#${SEC} h3{margin:16px 0 6px;font-size:16px}#${SEC} .scroll{overflow-x:auto}#${SEC} table{border-collapse:collapse;width:100%;min-width:560px}
#${SEC} td,#${SEC} th{border-bottom:1px solid #eee;padding:5px 6px;text-align:left;vertical-align:top;font-size:13px}#${SEC} th{font-weight:700;color:#3d4354}
.dfa-gol{font:13px/1.5 var(--font);color:#4a5063;background:#f4f6f9;border-radius:8px;padding:8px 10px}
.dfa-adm{display:inline-block;font:600 12px var(--font);background:#e8f5ec;border:1px solid #a9d8b8;border-radius:8px;padding:3px 8px;margin:6px 0}
.dfa-btn{font:700 14px var(--font);padding:10px 14px;border-radius:10px;border:0;background:#1d5fb0;color:#fff;cursor:pointer;margin:6px 6px 6px 0}
.dfa-i{font:700 12px var(--font);width:22px;height:22px;border-radius:50%;border:1px solid #8a6d00;background:#fff3b0;color:#3a2e00;cursor:pointer;margin-left:6px}
.dfa-src{color:#4a5063;font-size:12px}.dfa-inv{font:12px/1.4 var(--font);color:#6b7280;margin-top:8px}`;
    document.head.appendChild(s);
  }
  async function json(u) { try { const r = await fetch(u, { cache: "no-cache" }); return r.ok ? await r.json() : null; } catch (e) { return null; } }

  /* câmp mascat (prefix + umplutură blurată) sau valoare întreagă */
  const m = (o, k) => {
    if (!o) return "";
    const v = o[k]; if (v && typeof v === "object") return v.gol ? `<span class="dfa-src">${esc(v.motiv_gol || "gol")}</span>` : esc(v.valoare ?? "");
    if (v == null || v === "") return o[k + "_m"] ? `<span class="dfa-x">${esc(o[k + "_m"])}</span>` : "";
    return `${esc(v)}${o[k + "_m"] ? `<span class="dfa-x">${esc(o[k + "_m"])}</span>` : ""}`;
  };
  const val = v => v == null ? "" : (typeof v === "object" ? (v.gol || v.valoare === "" ? (ADMIN() && !(window.CC_ADM && window.CC_ADM.g) && v.motiv_gol ? `<span class="dfa-src">${esc(v.motiv_gol)}</span>` : "—") : esc(v.valoare)) : esc(v));
  const dist = r => r.distanta_m != null ? nf(r.distanta_m) + " m" : "—";
  const sursa = r => `<span class="dfa-src">${esc(r.sursa_tip || (r.sursa && /^https?:/.test(r.sursa) ? "primărie" : r.sursa) || "")} · ${esc(String(r.data_sursei || "").slice(0, 10) || "dată necunoscută")} · încredere ${esc(r.incredere || "—")}</span>`;
  const tabel = (titlu, cap, rows) => !rows.length ? "" : `<h3>${titlu} <small>(${rows.length})</small></h3><div class="scroll"><table><tr>${cap.map(c => `<th>${c}</th>`).join("")}</tr>${rows.join("")}</table></div>`;   // v82.14.2: secțiune fără date = nu apare
  const MOTIV = "Nu avem rânduri pentru această categorie în Banca de Date; pozițiile pe parcelă există doar pentru județul Timiș.";
  const admnm = (r, full) => { const A = r.administratori, L = Array.isArray(A) ? A : []; const t = L.map(a => full ? `${esc(a.nume)}${a.calitate ? " (" + esc(a.calitate) + ")" : ""}` : m(a, "nume")).join("; ");
    return t || (ADMIN() && !(window.CC_ADM && window.CC_ADM.g) && A && !Array.isArray(A) && A.motiv_gol ? `<span class="dfa-src">${esc(A.motiv_gol)}</span>` : "—"); };

  /* v82.14.0 (Manu, 12.11.2026): „Depth of Market – Level 2” (DOM). Text simplu: fără surse, fără note tehnice, fără explicații despre câmpuri goale
     (beneficiarul lipsă = „nedeclarat”). Clientul vede act, număr, dată, beneficiar, obiect, distanță; sursa, încrederea și data sursei doar în Admin.
     Secțiuni: firme apropiate, cele mai apropiate CU / AC / PUZ, ultimele CU și AC din localitate, proiecte de infrastructură în lucru, CU și AC pe 200 m. */
  const GOL = "Nu sunt înregistrări în zonă.";
  const data = r => esc(String(r.data_act || r.data || "").slice(0, 10).split("-").reverse().join(".")) || "—";
  const benef = (r, full, adm) => { const v = r.beneficiar; if (!full) return r.beneficiar_m || (v && v.valoare) ? m(r, "beneficiar") : "nedeclarat";
    const t = v && typeof v === "object" ? v.valoare : v; return t ? esc(t) : "nedeclarat"; };
  const obiect = (r, full) => full ? esc(String(r.tip_lucrare || r.obiect || "").replace(/\s+/g, " ").slice(0, 140)) : m(r, "tip_lucrare");
  const act = r => `${esc(r.tip || "")} ${esc(r.numar || r.numar_hcl || "")}${r.an ? "/" + esc(r.an) : ""}`.trim();
  const srcAdm = r => `<span class="dfa-src">${esc(String(r.sursa || r.sursa_tip || "").slice(0, 60))} · ${esc(String(r.data_sursei || "").slice(0, 10))} · ${esc(r.incredere || "")}</span>`;
  /* v82.18.0: harta DOM. Fiecare rând poartă data-s (secțiunea) și data-i (indexul în fișierul întreg); dom_harta.js îl mapează la parcelă prin dom_parcele.json (randuri[sec][i]). Cardul primește _i / _s de la server (secțiunile vin tăiate la cele mai apropiate 40). */
  /* v82.20.0 (Manu, 13.11: „standard aratam 119m in jur - daca se cere putem merge pana la 0 sau pana la 350 m”): raza DOM, implicit 119 m, reglabilă 0–350 m; filtrul se aplică la toate tabelele cu distanță (firme, CU, AC, PUZ, infrastructură) */
  window.__dfaRaza = window.__dfaRaza == null ? 119 : window.__dfaRaza;
  const RAZA = () => window.__dfaRaza;
  const ctrlRaza = () => `<div class="dfa-rz" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:8px 0 10px;font:600 14px var(--font)"><label for="dfa-raza">Rază în jurul terenului: <b id="dfa-rv">${RAZA()}</b> m</label><input id="dfa-raza" type="range" min="0" max="350" step="1" value="${RAZA()}" style="flex:1 1 180px;min-width:150px"><span class="dfa-src">standard 119 m; la cerere de la 0 la 350 m</span></div>`;
  let tR = null;
  document.addEventListener("input", e => { if (e.target && e.target.id === "dfa-raza") { const rv = document.getElementById("dfa-rv"); if (rv) rv.textContent = e.target.value; } }, true);
  document.addEventListener("change", e => {   // la eliberarea cursorului: se reface lista (doar secțiunile deschise la card; tot la ceilalți)
    if (!e.target || e.target.id !== "dfa-raza") return; const v = Math.max(0, Math.min(350, Number(e.target.value) || 0)); clearTimeout(tR);
    tR = setTimeout(() => { window.__dfaRaza = v; document.querySelectorAll("details.dfa-sec").forEach(d => { d.dataset.g = ""; if (d.open && window.__dfaSecFn) window.__dfaSecFn(d); }); if (!document.querySelector("details.dfa-sec")) { facut = null; try { porneste(); } catch (er) {} } }, 500);
  }, true);
  const SK = ["firme", "cu", "ac", "puz", "investitii"];
  const taga = J => { SK.forEach(k => { if (Array.isArray(J[k])) J[k].forEach((r, i) => { if (r && typeof r === "object") { if (r._i == null) r._i = i; if (!r._s) r._s = k; } }); }); return J; };
  const ta = r => r && r._i != null && r._s ? ` data-s="${r._s}" data-i="${r._i}"` : "";
  function randare(J, nivel) {
    taga(J);
    const full = nivel !== "ascuns", adm = ADMIN() && !(window.CC_ADM && window.CC_ADM.g);
    const fx = full ? (r, k) => val(r[k]) : m;
    const cap = c => adm && full && arataSurse ? [...c, "Sursă"] : c, cel = (r, h) => adm && full && arataSurse ? h.replace(/<\/tr>$/, `<td>${srcAdm(r)}</td></tr>`) : h;
    const pd = (L, n) => (L || []).filter(r => r.distanta_m != null && r.distanta_m <= RAZA()).slice().sort((x, y) => x.distanta_m - y.distanta_m).slice(0, n);
    const cfc = r => { const l = String(r.nc || r.cf || r.adresa_cf || "").split(/[;,\s]+/).filter(Boolean); return l.slice(0, 3).join(", ") + (l.length > 3 ? ` +${l.length - 3}` : "") || "—"; };   // v82.16.0: alocarea precisă pe parcelă (NC / CF) doar în DOM
    const rAct = (r, cuDist) => cel(r, `<tr${ta(r)}><td>${act(r)}</td><td>${data(r)}</td><td>${benef(r, full, adm)}</td><td>${obiect(r, full)}</td>${cuDist ? `<td>${dist(r)}</td>` : ""}${full ? `<td>${esc(cfc(r))}</td>` : ""}</tr>`);
    let h = "";
    h += tabel("Cele mai apropiate firme", cap(["Firma", "Administratori", "Telefon", "Distanță"]),
      pd(J.firme, 60).map(r => cel(r, `<tr${ta(r)}><td>${fx(r, "denumire")}</td><td>${admnm(r, full)}</td><td>${fx(r, "telefon") || "—"}</td><td>${dist(r)}</td></tr>`)), GOL);
    [["cu", "Cele mai apropiate certificate de urbanism"], ["ac", "Cele mai apropiate autorizații de construire"], ["puz", "Cele mai apropiate PUZ-uri"]].forEach(([k, t]) =>
      h += tabel(t, cap(full ? ["Act", "Data", "Beneficiar", "Obiect", "Distanță", "Parcela (NC / CF)"] : ["Act", "Data", "Beneficiar", "Obiect", "Distanță"]), pd(J[k], 60).map(r => rAct(r, true)), GOL));
    const L = J.localitate || {};
    if (L.cu_ultime || L.ac_ultime) {
      h += tabel(`Ultimele certificate de urbanism din ${esc(L.uat || "localitate")}`, cap(full ? ["Act", "Data", "Beneficiar", "Obiect", "Parcela (NC / CF)"] : ["Act", "Data", "Beneficiar", "Obiect"]), (L.cu_ultime || []).map(r => rAct(r, false)), GOL);
      h += tabel(`Ultimele autorizații de construire din ${esc(L.uat || "localitate")}`, cap(full ? ["Act", "Data", "Beneficiar", "Obiect", "Parcela (NC / CF)"] : ["Act", "Data", "Beneficiar", "Obiect"]), (L.ac_ultime || []).map(r => rAct(r, false)), GOL);
    }
    const lucru = (J.investitii || []).filter(r => /lucr|execu|derul|început|inceput|contract|implement|în curs|in curs/i.test(`${typeof r.stadiu === "string" ? r.stadiu : ""} ${typeof r.termen === "string" ? r.termen : ""}`));
    h += tabel("Proiecte de infrastructură în lucru", cap(["Ce", "Stadiu", "Termen", "Distanță"]),
      lucru.map(r => cel(r, `<tr${ta(r)}><td>${full ? esc(r.titlu) : m(r, "titlu")}</td><td>${esc(typeof r.stadiu === "string" ? r.stadiu : "") || "în lucru"}</td><td>${esc(typeof r.termen === "string" && r.termen ? r.termen : "neprecizat")}</td><td>${r.distanta_m != null ? dist(r) : "în comună"}</td></tr>`)), "Nu sunt proiecte în lucru anunțate în comună.");
    const raza = [...(J.cu || []), ...(J.ac || [])].filter(r => r.distanta_m != null && r.distanta_m <= RAZA()).sort((x, y) => x.distanta_m - y.distanta_m);
    h += tabel(`Certificate de urbanism și autorizații pe o rază de ${RAZA()} m`, cap(full ? ["Act", "Data", "Beneficiar", "Obiect", "Distanță", "Parcela (NC / CF)"] : ["Act", "Data", "Beneficiar", "Obiect", "Distanță"]), raza.map(r => rAct(r, true)), "Nu sunt certificate sau autorizații pe 200 m.");
    if (adm && J.investitii_lipsa && J.investitii_lipsa.length) h += `<details class="dfa-inv"><summary>lipsuri de colectare (doar Admin)</summary>${J.investitii_lipsa.map(x => `<p>${esc(typeof x === "string" ? x : JSON.stringify(x))}</p>`).join("")}</details>`;
    return (J.__fara_ctrl ? "" : ctrlRaza()) + h;
  }

  /* v82.17.0 (cardul): DOM pe secțiuni. Serverul nu mai dă fișierul întreg unui card; fiecare secțiune se cere când o deschizi și intră în jurnalul cardului. */
  const SECT = [["firme", "Cele mai apropiate firme"], ["cu", "Cele mai apropiate certificate de urbanism"], ["ac", "Cele mai apropiate autorizații de construire"], ["puz", "Cele mai apropiate PUZ-uri"], ["localitate", "Ultimele certificate de urbanism și autorizații din localitate"], ["investitii", "Proiecte de infrastructură în lucru"], ["raza200", "Certificate de urbanism și autorizații pe o rază de 200 m"]];
  function sectiuniCard(corp, P) {
    if (!$("#dfa-css-sec")) { const s = document.createElement("style"); s.id = "dfa-css-sec"; s.textContent = ".dfa-sec{border:1px solid #d8dde8;border-radius:10px;margin:8px 0;background:#fff}.dfa-sec>summary{font:700 15px var(--font);padding:12px 14px;cursor:pointer}.dfa-sb{padding:0 12px 12px}"; document.head.appendChild(s); }
    corp.innerHTML = ctrlRaza() + SECT.map(([k, t]) => `<details class="dfa-sec" data-k="${k}"><summary>${esc(t)}</summary><div class="dfa-sb"></div></details>`).join("") + '<p class="dfa-src">Nu retransmite aceste date.</p>';
    const onToggle = async d => {
      if (!d.open || d.dataset.g) return; d.dataset.g = "1"; const box = d.querySelector(".dfa-sb"), k = d.dataset.k; box.innerHTML = '<p class="dfa-src">Se încarcă…</p>';
      try {
        let r = await fetch(`${(window.CC_STARE && window.CC_STARE.FN) || "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod"}?t=${encodeURIComponent(window.CC_ADM.token)}&f=${encodeURIComponent(D.id + "/date_fine_aproape.json")}&sec=${encodeURIComponent(k)}&raza=${RAZA()}`, { cache: "no-store" });
        for (let i = 0; i < 3 && r.status === 429; i++) { let ra = 0; try { ra = Number((await r.clone().json()).retry_after) || 0; } catch (e) {} if (!ra) break; box.innerHTML = '<p class="dfa-src">Se încarcă… (mai mulți pași deodată; reîncerc automat)</p>'; await new Promise(ok => setTimeout(ok, Math.min(ra, 30) * 1000)); r = await fetch(`${(window.CC_STARE && window.CC_STARE.FN) || "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod"}?t=${encodeURIComponent(window.CC_ADM.token)}&f=${encodeURIComponent(D.id + "/date_fine_aproape.json")}&sec=${encodeURIComponent(k)}&raza=${RAZA()}`, { cache: "no-store" }); }   // v82.20.0: limita umană a masterului: încetinire cu retry_after
        if (r.status === 429 || r.status === 401) { box.innerHTML = '<p class="dfa-gol">Cardul nu mai e valabil.</p>'; setTimeout(() => location.reload(), 600); return; }
        if (!r.ok) { d.dataset.g = ""; box.innerHTML = '<p class="dfa-gol">Nu s-a putut încărca; închide și redeschide secțiunea.</p>'; return; }
        let J = await r.json(); if (k === "raza200") J = { cu: J.raza200 || [] }; J.__fara_ctrl = true;
        const f = window.CC_PLATA && window.CC_PLATA.filtruClient ? window.CC_PLATA.filtruClient(J) : J;
        let h = randare(f, "aratat_client");
        { const t = document.createElement("div"); t.innerHTML = h; const h3 = [...t.querySelectorAll("h3")].find(x => /rază de \d+ m/.test(x.textContent));
          if (k === "raza200") h = h3 ? h3.outerHTML + (h3.nextElementSibling ? h3.nextElementSibling.outerHTML : "") : "";
          else if (h3) { if (h3.nextElementSibling) h3.nextElementSibling.remove(); h3.remove(); h = t.innerHTML; } }   // randare() desenează toate tabelele din J; aici doar cel de 200 m
        box.innerHTML = h || `<p class="dfa-gol">${GOL}</p>`;
      } catch (e) { d.dataset.g = ""; box.innerHTML = '<p class="dfa-gol">Nu s-a putut încărca; închide și redeschide secțiunea.</p>'; }
    };
    if (!window.__dfaSec) { window.__dfaSec = 1; document.addEventListener("toggle", e => { const d = e.target; if (d && d.classList && d.classList.contains("dfa-sec") && window.__dfaSecFn) window.__dfaSecFn(d); }, true); }   // delegat: acordeon.js mută / clonează secțiunile și listenerii proprii s-ar pierde
    window.__dfaSecFn = onToggle;
  }

  async function porneste() {
    css();
    const Dd = typeof D !== "undefined" ? D : null; if (!Dd || !Dd.id) return;
    const sec = $("#" + SEC); if (!sec) return;
    if (facut === Dd.id + "|" + (arataAdmin ? 1 : 0) + "|" + (window.CC_PLATA ? 1 : 0) && sec.querySelector(".dfa-corp")) return;
    const id = encodeURIComponent(Dd.id), P = `p/${id}/`;
    /* sesiunea cu cod (modul gratuit), înainte de PIN: doar lacătul, acordul și câmpul pentru cod; nu se încarcă nimic din DOM */
    const g0 = window.CC_ADM && window.CC_ADM.g, lacat = g0 ? window.CC_ADM.n < 2 : !ADMIN();
    if (g0 && window.CC_ADM.n < 2 && window.CC_PLATA && window.CC_PLATA.gratuit) {
      if (sec.dataset.dfaLacat === Dd.id && sec.querySelector(".pl")) return;
      sec.dataset.dfaLacat = Dd.id; facut = null; sec.hidden = false;
      sec.innerHTML = `<div><h2>🔒 Depth of Market – Level 2</h2><p class="lead">Firmele, actele de urbanism și proiectele din jurul proprietății. Se deschid cu codul de pe card.</p></div><div class="dfa-pl"></div><p class="dfa-src dfa-foot"><a href="gdpr_date_fine.html" target="_blank" rel="noopener">GDPR și folosire date</a></p>`;
      window.CC_PLATA.montaj($(".dfa-pl", sec), () => {}, true); return;
    }
    const mostra = await json(P + "date_fine_aproape_mostra.json");
    if (!mostra) { sec.hidden = true; return; }
    facut = Dd.id + "|" + (arataAdmin ? 1 : 0) + "|" + (window.CC_PLATA ? 1 : 0);
    sec.hidden = false;
    sec.innerHTML = `<div><h2>${lacat ? "🔒 " : ""}Depth of Market – Level 2</h2><p class="lead">Firmele, actele de urbanism și proiectele din jurul proprietății.</p></div><div class="dfa-corp"></div><p class="dfa-src dfa-foot"><a href="gdpr_date_fine.html" target="_blank" rel="noopener">GDPR și folosire date</a></p>`;
    const corp = $(".dfa-corp", sec), adm = ADMIN() && !(window.CC_ADM && window.CC_ADM.g);   // v82.13.0: Admin din aplicația de test e și el „client” pe adresa publicată; doar sesiunea cu cod (g) e client
    if (adm) {
      if (arataAdmin) {
        const J = await json(P + "date_fine_aproape.json");
        corp.innerHTML = `<span class="dfa-adm">🔓 Admin: date complete (cod DOM), nu se publică</span> <button type="button" class="dfa-btn" data-a="ascunde">Ascunde</button> <button type="button" class="dfa-btn" data-a="surse" title="surse">i</button>` + (J ? randare(J, "arati_admin") : '<p class="dfa-gol">date_fine_aproape.json lipsește pentru această proprietate.</p>');
        corp.querySelector('[data-a="ascunde"]').onclick = () => { arataAdmin = false; facut = null; porneste(); };
        corp.querySelector('[data-a="surse"]').onclick = () => { arataSurse = !arataSurse; facut = null; porneste(); };
      } else {
        corp.innerHTML = `<span class="dfa-adm">Nivel ascuns (valorile sensibile sunt mascate)</span> <button type="button" class="dfa-btn" data-a="arata">Arată</button>` + randare(mostra, "ascuns");
        corp.querySelector('[data-a="arata"]').onclick = async () => { const c = window.prompt("Cod Admin:"); if (!c) return; try { const r = await fetch((window.CC_STARE && window.CC_STARE.FN) || "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/raport_cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "privat", token: window.CC_ADM.token, pin: c }) }); if (r.ok) { arataAdmin = true; facut = null; porneste(); } else window.alert("Cod greșit"); } catch (e) { window.alert("Nu pot verifica codul acum"); } };   // v82.21.1: codul se verifică pe server, nu în aplicație
      }
      return;
    }
    if (window.CC_ADM && (window.CC_ADM.k || window.CC_ADM.pv) && window.CC_ADM.n >= 2) { sectiuniCard(corp, P); return; }   // v82.17.0: card: DOM pe secțiuni, fiecare cerută la deschidere
    /* Client (și Admin „ca client”): ascuns până după plată */
    const P2 = window.CC_PLATA, st = P2 ? await P2.stare() : { platit: false, configurat: false };
    if (st.platit) {
      const J = await P2.dateLivrate();
      corp.innerHTML = (st.simulat ? '<span class="dfa-adm">simulare (test)</span>' : "") + (J ? randare(J, "aratat_client") : '<p class="dfa-gol">Plata e confirmată, dar datele nu au putut fi încărcate acum. Reîncearcă peste un minut.</p>')
        + `<p class="dfa-src">Nu retransmite aceste date.</p>`;
      return;
    }
    corp.innerHTML = randare(mostra, "ascuns") + '<div class="dfa-pl"></div>' + "";
    if (P2) P2.montaj($(".dfa-pl", corp), () => { facut = null; porneste(); }, st.configurat);
  }
  setInterval(() => { try { porneste(); } catch (e) { console.warn("date_fine_aproape", e); } }, 1500);
})();
