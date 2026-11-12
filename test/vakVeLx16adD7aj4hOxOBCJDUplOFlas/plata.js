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
     la Date fine apare „Acces gratuit în perioada de test”, bifa de acord și câmpul pentru codul de date fine (1357, verificat pe server prin acțiunea `privat`).
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
  function montajGratuit(el, dupa) {
    const g = gSes(), ok = (() => { try { return localStorage.getItem(ACORD_K) === CFG.versiune_acord; } catch (e) { return false; } })();
    el.innerHTML = `<div class="pl"><h3>🔒 Depth of Market – Level 2</h3>
      <p><b>Acces gratuit în perioada de test.</b> Firmele, actele de urbanism și proiectele din jurul proprietății.</p>
      <label class="pl-acc"><input type="checkbox" id="pl-acc"${ok ? " checked" : ""}><span>${esc(TEXT_ACORD)} <a href="${CFG.gdpr}" target="_blank" rel="noopener">GDPR și folosire date</a></span></label>
      <div class="pl-cod" style="display:${ok ? "flex" : "none"};flex-direction:column;gap:10px">
        <label for="pl-pin" style="font:700 15px var(--font)">🔒 Cod DOM (de pe card)</label>
        <input id="pl-pin" type="text" inputmode="numeric" autocomplete="off" maxlength="12" style="font:700 20px ui-monospace,Menlo,monospace;letter-spacing:.2em;padding:12px 14px;border:2px solid #1d5fb0;border-radius:12px;background:#fff;color:#1a1e2a;width:100%;box-sizing:border-box">
        <button type="button" class="pl-go" id="pl-pin-go">Deschide DOM</button></div>
      ${local ? '<span class="pl-rev">textul acordului: de revizuit de avocat</span>' : ""}<p class="pl-msg" role="status"></p></div>`;
    const acc = el.querySelector("#pl-acc"), cod = el.querySelector(".pl-cod"), msg = el.querySelector(".pl-msg");
    acc.onchange = () => { cod.style.display = acc.checked ? "flex" : "none"; if (acc.checked) { try { localStorage.setItem(ACORD_K, CFG.versiune_acord); } catch (e) {} } };
    el.querySelector("#pl-pin-go").onclick = async () => {
      const pin = el.querySelector("#pl-pin").value.trim(); if (!acc.checked) { msg.textContent = "Bifează acordul."; return; } if (!pin) { msg.textContent = "Scrie codul DOM."; return; }
      if (!g) { msg.textContent = "Sesiune lipsă; redeschide raportul cu codul de intrare."; return; }
      msg.textContent = "Se verifică…";
      const r = await fetch(CFG.baza.replace("/functions/v1/", "/functions/v1/") + "raport_cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "privat", token: g.token, pin }) }).then(async x => ({ ok: x.ok, j: await x.json().catch(() => ({})) })).catch(() => ({ ok: false, j: {} }));
      if (!r.ok || !r.j.token) { msg.textContent = r.j.error || "Cod greșit."; return; }
      g.n = 2; g.token = r.j.token; if (window.CC_ADM_SALVEAZA) await window.CC_ADM_SALVEAZA(g); location.reload();
    };
  }
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
