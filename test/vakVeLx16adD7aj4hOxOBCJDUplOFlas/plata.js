/* Raport _ Cartea Casei - plata „Date fine” (v82.11.0, 09.11.2026, cerută de Manu): Stripe, 499 RON, în aplicație.
   Totul stă în plateste(); prețul se schimbă într-un singur loc (CFG.pret_ron).
   Cod GATA PENTRU CHEI DE TEST, INACTIV FĂRĂ ELE: pagina cere configurația la funcția server `plata_config`; fără cheia publicabilă Stripe răspunsul e
   „neconfigurat” și se afișează „plata nu e configurată”. Nu există nicio cheie în cod. „plătit” se scrie DOAR din webhook-ul Stripe cu semnătură verificată
   (funcția server `plata_webhook`); pagina doar întreabă `plata_stare`. Fără debitare fără confirmare: butonul de plată se activează doar după bifa de acord,
   iar Stripe cere confirmarea plății în Payment Element (card, Apple Pay, Google Pay).
   „Simulează plata (test)” există doar în Admin cu vederea „ca client” (localhost + ?client=1): ține starea în memorie și nu apelează nicio funcție.
   Textul acordului: DE REVIZUIT DE AVOCAT înainte de lansare. Funcțiile server: ~/Drive/2 DD/tools/cartea_casei/supabase_functii/ (nedeployate). */
(function () {
  "use strict";
  /* CONFIGURARE · MOD GRATUIT (perioada de test, cerut de Manu 12.11.2026, TEMPORAR): true = nu se arată butonul de 499 RON și nimic din Stripe;
     la Date fine apare „Acces gratuit în perioada de test”, bifa de acord și câmpul pentru codul de date fine (codul DOM, verificat pe server prin acțiunea `privat`).
     Pentru a reporni plata: false (codul Stripe de mai jos rămâne neschimbat). */
  const CC_GRATUIT = true;
  const CFG = { pret_ron: 499, moneda: "RON", baza: "https://vzrozriarqocscpgfscw.supabase.co/functions/v1/", versiune_acord: "2026-11-09-v1", gdpr: "gdpr_date_fine.html" };
  const TEXT_ACORD = "Sunt de acord cu prelucrarea datelor conform paginii GDPR și folosire date, mandatez adunarea datelor publice relevante pentru mine și cer livrarea imediată a serviciului digital, știind că îmi pierd dreptul de retragere.";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const caAdmin = () => local && !!window.CC_CLIENT;          // Admin cu vederea „ca client”: singurul loc cu simulare
  const adminReal = () => local && !window.CC_CLIENT;
  let simulat = false, platit = false, ultimaStare = null;
  const gSes = () => (window.CC_ADM && window.CC_ADM.g) ? window.CC_ADM : null;   // sesiune de client cu cod de intrare (gratuit)

  async function apel(nume, corp) {
    try {
      const r = await fetch(CFG.baza + nume, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corp || {}) });
      if (!r.ok) return { neconfigurat: true, status: r.status };
      return await r.json();
    } catch (e) { return { neconfigurat: true, eroare: String(e).slice(0, 80) }; }
  }
  const idProp = () => (typeof D !== "undefined" && D && D.id) || "";

  /* starea plății: din server (după webhook); simulare doar în Admin „ca client” */
  async function stare() {
    if (CC_GRATUIT && gSes()) return gSes().n >= 2 ? { platit: true, configurat: true, gratuit: true } : { platit: false, configurat: true, gratuit: true };
    if (simulat && caAdmin()) return { platit: true, configurat: true, simulat: true };
    if (platit) return { platit: true, configurat: true };
    const r = await apel("plata_stare", { id: idProp() });
    ultimaStare = r;
    if (r && r.platit) platit = true;
    return { platit: !!(r && r.platit), configurat: !(r && r.neconfigurat) && !!(r && r.configurat !== false) };
  }

  /* datele complete, filtrate pe server pentru client (doar sursa_publica ONRC/AC/CU/PUZ); Admin „ca client” simulat: aceeași filtrare, în pagină */
  async function dateLivrate() {
    if (CC_GRATUIT && gSes() && (gSes().k || gSes().pv)) return null;   // v82.17.0: cardul nu primește fișierul întreg; DOM se încarcă pe secțiuni (date_fine_aproape.js)
    if (CC_GRATUIT && gSes() && gSes().n >= 2) {   // jetonul n:2 deschide fișierul prin funcție; aceeași filtrare ca la plată (doar sursa_publica ONRC/AC/CU/PUZ)
      try { const r = await fetch(`p/${encodeURIComponent(idProp())}/date_fine_aproape.json`, { cache: "no-cache" }); if (!r.ok) return null; return filtruClient(await r.json()); } catch (e) { return null; }
    }
    if (simulat && caAdmin()) {
      try { const r = await fetch(`p/${encodeURIComponent(idProp())}/date_fine_aproape.json`, { cache: "no-cache" }); if (!r.ok) return null; return filtruClient(await r.json()); } catch (e) { return null; }
    }
    const r = await apel("date_fine_livrare", { id: idProp() });
    return r && !r.neconfigurat && r.firme ? r : null;
  }
  const PUBLIC = new Set(["ONRC", "AC", "CU", "PUZ"]);
  const sters = { valoare: "", motiv_gol: "persoană fizică fără sursă publică: doar în Admin" };
  function filtruClient(J) {
    const j = JSON.parse(JSON.stringify(J));
    const pers = p => (p && p.tip_camp && String(p.tip_camp).startsWith("persoana") && !PUBLIC.has(p.sursa_publica));
    (j.firme || []).forEach(f => {
      f.administratori = Array.isArray(f.administratori) ? f.administratori.filter(a => !pers(a)) : f.administratori;
      f.asociati = Array.isArray(f.asociati) ? f.asociati.filter(a => !pers(a)) : f.asociati;
      if (f.tip_camp_telefon === "persoana_fizica") { f.telefon = ""; }
      if (f.tip_camp_denumire === "persoana_fizica") { f.denumire = "persoană fizică autorizată"; }
    });
    ["cu", "ac", "puz"].forEach(k => (j[k] || []).forEach(r => ["beneficiar", "firma_proiectant", "firma_proiectant_executant"].forEach(c => { if (r[c] && pers(r[c])) r[c] = Object.assign({}, sters); })));
    j.nivel = "aratat_client";
    return j;
  }

  /* un singur loc pentru plată: pregătește plata, o confirmă în Stripe, așteaptă webhook-ul */
  async function plateste(el, dupa) {
    const msg = el.querySelector(".pl-msg"), btn = el.querySelector(".pl-go");
    const spune = t => { msg.textContent = t; };
    if (!el.querySelector("#pl-acc").checked) { spune("Bifează acordul ca să poți plăti."); return; }
    btn.disabled = true; spune("Se pregătește plata…");
    const ac = await apel("acord_gdpr", { id: idProp(), versiune: CFG.versiune_acord, text: TEXT_ACORD });
    if (ac.neconfigurat) { spune("Plata nu e configurată încă."); btn.disabled = false; return; }
    const pr = await apel("plata_creeaza", { id: idProp(), pret_ron: CFG.pret_ron });
    if (pr.neconfigurat || !pr.client_secret || !pr.cheie_publica) { spune("Plata nu e configurată încă."); btn.disabled = false; return; }
    try {
      if (!window.Stripe) await new Promise((ok, no) => { const s = document.createElement("script"); s.src = "https://js.stripe.com/v3/"; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
      const stripe = window.Stripe(pr.cheie_publica), elements = stripe.elements({ clientSecret: pr.client_secret, locale: "ro" });
      const loc = el.querySelector(".pl-stripe"); loc.hidden = false; elements.create("payment").mount(loc);
      btn.textContent = `Confirmă plata de ${CFG.pret_ron} ${CFG.moneda}`; btn.disabled = false;
      btn.onclick = async () => {
        btn.disabled = true; spune("Se confirmă plata…");
        const rez = await stripe.confirmPayment({ elements, redirect: "if_required", confirmParams: { return_url: location.href.split("#")[0] } });
        if (rez.error) { spune(rez.error.message || "Plata nu a trecut."); btn.disabled = false; return; }
        spune("Plata e trimisă; așteptăm confirmarea de la Stripe…");
        for (let i = 0; i < 30; i++) { await new Promise(r => setTimeout(r, 2000)); const s = await stare(); if (s.platit) { dupa && dupa(); return; } }
        spune("Confirmarea întârzie; datele apar singure după ce Stripe confirmă. Poți reîncărca pagina.");
      };
    } catch (e) { spune("Nu am putut încărca Stripe."); btn.disabled = false; }
  }

  function css() {
    if (document.getElementById("pl-css")) return;
    const s = document.createElement("style"); s.id = "pl-css";
    s.textContent = `.pl{border:1.5px solid #1a1e2a;border-radius:14px;padding:16px;background:#fffdf8;color:#1a1e2a;display:flex;flex-direction:column;gap:14px;margin:12px 0}
.pl h3{margin:0;font:800 19px var(--font)}.pl p{margin:0;font:14px/1.5 var(--font)}
.pl-acc{display:flex;gap:14px;align-items:flex-start;cursor:pointer;font:14px/1.5 var(--font);padding:6px 0}.pl-acc input{width:26px;height:26px;flex:none;margin-top:2px}
.pl-go{font:700 16px var(--font);padding:14px 18px;border-radius:12px;border:0;background:#1d5fb0;color:#fff;cursor:pointer}.pl-go:disabled{background:#c9ced8;color:#3d4354;cursor:not-allowed}
.pl-sim{font:700 14px var(--font);padding:10px 14px;border-radius:12px;border:1.5px dashed #8a6d00;background:#fff3b0;color:#3a2e00;cursor:pointer}
.pl-msg{min-height:1.2em;font:13px var(--font)!important;color:#4a5063}.pl-rev{font:12px var(--font);color:#8a4b00;background:#fff3e0;border-radius:8px;padding:4px 8px;align-self:flex-start}
.pl-stripe{min-height:40px}`;
    document.head.appendChild(s);
  }

  /* blocul de deblocare: pret, acord (o singură bifă), buton; Admin „ca client” primește și simularea */
  const ACORD_K = "cc-acord-df";
  /* v82.15.1 (Manu, 13.11.2026: „cand dau comanda DOM - vreau doar 2 optiuni - am cod reducere / comanda dom - la am cod putem baga codul DOM - trebuie sa mearga in ambele directii”).
     Lacătul are două butoane egale: „Am cod” (un câmp; codul DOM sau orice cod de reducere viitor, verificat pe server) și „Comandă DOM” (telefon sau email → tabelul cereri,
     funcția raport_cerere_dom). Se trece dintr-unul în altul fără să se piardă ce s-a scris; după cod lacătul (deci și „Comandă DOM”) dispare. Fără bifă separată:
     o linie mică „Continuând, accepți termenii” sub buton. Marcajul .g7-code ține lacătul la vedere în fereastra DOM (acordeon.js nu pliază rândul cu formularul de cod). */
  const mem = { cod: "", contact: "" };
  function montajGratuit(el, dupa) {
    const g = gSes(), AC = "#1d5fb0";
    const B = `font:700 16px var(--font);padding:14px 10px;border-radius:12px;cursor:pointer;flex:1 1 0;min-width:0`;
    const IN = `font:700 18px ui-monospace,Menlo,monospace;padding:12px 14px;border:2px solid ${AC};border-radius:12px;background:#fff;color:#1a1e2a;width:100%;box-sizing:border-box`;
    const LINK = `background:none;border:0;padding:4px 0;color:${AC};font:600 14px var(--font);text-decoration:underline;cursor:pointer;align-self:center`;
    const termeni = `<p class="pl-ter" style="font:12px/1.4 var(--font);color:#5b6275;text-align:center">Continuând, accepți <a href="${CFG.gdpr}" target="_blank" rel="noopener">termenii</a>.</p>`;
    const cap = `<i class="g7-code" hidden></i><h3>🔒 Depth of Market – Level 2</h3><p>Firmele, actele de urbanism și proiectele din jurul proprietății.</p>`;
    const ecran = mod => {
      if (mod === "cod") el.innerHTML = `<div class="pl">${cap}
        <input id="pl-pin" type="text" inputmode="numeric" autocomplete="off" maxlength="16" aria-label="cod" placeholder="cod" value="${esc(mem.cod)}" style="${IN};letter-spacing:.2em;text-align:center">
        <button type="button" class="pl-go" id="pl-pin-go">Deschide DOM</button>${termeni}
        <p class="pl-msg" role="status"></p><button type="button" id="pl-la-comanda" style="${LINK}">Comandă DOM</button></div>`;
      else if (mod === "comanda") el.innerHTML = `<div class="pl">${cap}
        <input id="pl-ct" type="text" inputmode="email" autocomplete="email" maxlength="120" aria-label="telefon sau email" placeholder="telefon sau email" value="${esc(mem.contact)}" style="${IN};font-family:var(--font)">
        <button type="button" class="pl-go" id="pl-ct-go">Trimite</button>${termeni}
        <p class="pl-msg" role="status"></p><button type="button" id="pl-la-cod" style="${LINK}">Am cod</button></div>`;
      else if (mod === "trimis") el.innerHTML = `<div class="pl">${cap}<p style="font:700 16px/1.45 var(--font);color:#1f6b3d">Te contactăm în 120 de minute în program.</p>
        <button type="button" id="pl-la-cod" style="${LINK}">Am cod</button></div>`;
      else el.innerHTML = `<div class="pl">${cap}<div style="display:flex;gap:10px">
        <button type="button" id="pl-am" style="${B};border:2px solid ${AC};background:#fff;color:${AC}">Am cod</button>
        <button type="button" id="pl-cmd" style="${B};border:2px solid ${AC};background:${AC};color:#fff">Comandă DOM</button></div></div>`;
      const q = s => el.querySelector(s), msg = q(".pl-msg");
      if (q("#pl-am")) q("#pl-am").onclick = () => ecran("cod");
      if (q("#pl-cmd")) q("#pl-cmd").onclick = () => ecran("comanda");
      if (q("#pl-la-comanda")) q("#pl-la-comanda").onclick = () => { mem.cod = q("#pl-pin").value; ecran("comanda"); };
      if (q("#pl-la-cod")) q("#pl-la-cod").onclick = () => { if (q("#pl-ct")) mem.contact = q("#pl-ct").value; ecran("cod"); };
      const pin = q("#pl-pin"), ct = q("#pl-ct");
      if (pin) { pin.oninput = () => { mem.cod = pin.value; }; setTimeout(() => pin.focus(), 50);
        const go = async () => { const v = pin.value.trim(); if (!v) { msg.textContent = "Scrie codul."; return; }
          if (!g) { msg.textContent = "Sesiune lipsă; redeschide raportul."; return; }
          msg.textContent = "…";
          const r = await fetch(CFG.baza + "raport_cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "privat", token: g.token, pin: v }) }).then(async x => ({ ok: x.ok, status: x.status, j: await x.json().catch(() => ({})) })).catch(() => ({ ok: false, j: {} }));
          if (!r.ok || !r.j.token) { msg.textContent = r.status === 429 ? "Prea multe încercări; revino în 15 minute." : "Cod greșit."; return; }
          try { localStorage.setItem(ACORD_K, CFG.versiune_acord); } catch (e) {}
          g.n = 2; g.token = r.j.token; if (window.CC_ADM_SALVEAZA) await window.CC_ADM_SALVEAZA(g); location.reload(); };
        q("#pl-pin-go").onclick = go; pin.onkeydown = e => { if (e.key === "Enter") go(); }; }
      if (ct) { ct.oninput = () => { mem.contact = ct.value; }; setTimeout(() => ct.focus(), 50);
        const go = async () => { const v = ct.value.trim(); if (v.length < 6) { msg.textContent = "Scrie telefonul sau emailul."; return; }
          if (!g) { msg.textContent = "Sesiune lipsă; redeschide raportul."; return; }
          msg.textContent = "…"; q("#pl-ct-go").disabled = true;
          const r = await fetch(CFG.baza + "raport_cerere_dom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: g.token, contact: v, raport: idProp() }) }).then(async x => ({ ok: x.ok, j: await x.json().catch(() => ({})) })).catch(() => ({ ok: false, j: {} }));
          if (!r.ok) { msg.textContent = r.j.error || "Nu s-a putut trimite; încearcă din nou."; q("#pl-ct-go").disabled = false; return; }
          ecran("trimis"); };
        q("#pl-ct-go").onclick = go; ct.onkeydown = e => { if (e.key === "Enter") go(); }; }
    };
    ecran("alege");
    /* un singur loc de cod în fereastra DOM: titlul dublat și linkul de sub lacăt (date_fine_aproape.js) și vechiul câmp G7 „cod de 4 cifre / nu sunt robot” (g7.js) nu se mai văd cât lacătul e închis */
    try { const sec = el.closest("section"); if (sec) { const t = sec.querySelector(":scope > div:first-child"); if (t && !t.contains(el)) t.style.display = "none"; const f = sec.querySelector(":scope > .dfa-foot"); if (f) f.style.display = "none"; } } catch (e) {}
    document.body.classList.add("cc-dom-lacat");
    if (!document.getElementById("pl-css-lacat")) { const st = document.createElement("style"); st.id = "pl-css-lacat"; st.textContent = "body.cc-dom-lacat section:has(#g7cod){display:none!important}"; document.head.appendChild(st); }
    window.CC_DOM_COMANDA = () => { ecran("comanda"); try { el.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {} };
  }
  /* butonul „Comand DOM” din lista de anunțuri (acordeon.js) duce la același ecran „Comandă DOM” din lacăt; după cod dispare (o singură cale de comandă) */
  document.addEventListener("click", e => { const t = e.target && e.target.closest && e.target.closest(".ac-pr-btn"); if (!t || !(CC_GRATUIT && gSes())) return;
    e.preventDefault(); e.stopImmediatePropagation(); if (window.CC_DOM_COMANDA) window.CC_DOM_COMANDA(); }, true);
  { const fix = () => { if (!(CC_GRATUIT && gSes())) return; document.querySelectorAll(".ac-pr-btn").forEach(b => { if (gSes().n >= 2) b.style.display = "none"; else if (b.textContent !== "Comandă DOM") b.textContent = "Comandă DOM"; }); };
    let n = 0; const t = setInterval(() => { fix(); if (++n > 40) clearInterval(t); }, 500); }
  function montaj(el, dupa, conf) {
    css();
    if (CC_GRATUIT && gSes()) return montajGratuit(el, dupa);
    el.innerHTML = `<div class="pl"><h3>Deblochează datele complete</h3>
      <p>Firme, administratori și asociați din registrul public, autorizații și certificate de urbanism cu beneficiari (din actele publice ale primăriilor), PUZ-uri și investiții declarate. Preț: <b>${CFG.pret_ron} ${CFG.moneda}</b>, plată unică.</p>
      <label class="pl-acc"><input type="checkbox" id="pl-acc"><span>${esc(TEXT_ACORD)} <a href="${CFG.gdpr}" target="_blank" rel="noopener">GDPR și folosire date</a></span></label>
      <button type="button" class="pl-go" disabled>Plătește ${CFG.pret_ron} ${CFG.moneda}</button>
      ${caAdmin() ? '<button type="button" class="pl-sim">Simulează plata (test)</button>' : ""}
      ${local ? '<span class="pl-rev">textul acordului: de revizuit de avocat</span>' : ""}
      <div class="pl-stripe" hidden></div><p class="pl-msg" role="status"></p></div>`;
    const acc = el.querySelector("#pl-acc"), go = el.querySelector(".pl-go");
    acc.onchange = () => { go.disabled = !acc.checked; };
    go.onclick = () => plateste(el, dupa);
    if (conf === false && !caAdmin()) { go.disabled = true; acc.disabled = true; acc.onchange = null; go.onclick = null; el.querySelector(".pl-msg").textContent = "Plata nu e configurată încă."; }   // la Client real, fără chei: niciun buton de plată funcțional
    const sim = el.querySelector(".pl-sim"); if (sim) sim.onclick = () => { simulat = true; dupa && dupa(); };
  }
  window.CC_GRATUIT = CC_GRATUIT;
  window.CC_PLATA = { gratuit: CC_GRATUIT, pret: CFG.pret_ron, moneda: CFG.moneda, stare, dateLivrate, montaj, plateste, filtruClient, caAdmin, adminReal, textAcord: TEXT_ACORD };
})();
