/* Raportul casei · interfață strictă pentru cardul QR (v82.17.0, 13.11.2026, cerut de Manu: „tot ce e qr code - are interfața ajustată strict la nevoile acelor rapoarte;
   nimic din celelalte butoane nu ar trebui să meargă”).
   Doar când sesiunea e de card (window.CC_ADM.k), de cod master (m), de previzualizare Admin (pv) sau Admin în vederea „Utilizator” (ca_client). RĂMÂN: comutarea între rapoartele cardului (selectorul din bară), capitolele rapoartelor (Cuprins / Raport / Rezumat,
   capitole, ferestre, „mai mult”), hărțile și straturile lor, lacătul DOM („Am cod” / „Comandă DOM”) și secțiunile DOM, linkul cu condițiile, creditele hărților,
   instalarea pe ecranul principal (necesară la iPhone). DISPAR (ascunse și inerte): ← pagina principală, exportă PDF (toate variantele), generare / introdu adresa nouă / Generează raportul,
   Mod client / Revizie / Aspect / Alege pozele, mapa proprietății, „pdf, trimitere și alte servicii”, Pașii următori (servicii), Stare date / Surse / arată sursele,
   versiunea de test, Evidență QR și orice alt buton Admin. Serverul refuză oricum orice acțiune în afara admin_verifica și privat (raport_cod v16). */
(function () {
  "use strict";
  if (window.parent !== window || !window.CC_ADM_P) return;
  const IDS = ["cl-home", "cc-sf", "cc-s-f", "cc-s-m", "mn-rev", "mn-asp", "mn-poz", "mn-gen", "mn-cli", "mn-jur", "mn-print", "mn-src", "rc-print", "bld-open", "bld-client", "pick", "cc-tt-v", "cc-tt-nou", "cc-q-btn", "cq-open", "cc-adm-evid"];
  const SEL = [".cc-pasi", ".bld-btn", "#bld", "#builder", "[id^=bld-]", "[id^=cq-]", ".cq-btn", "#ac-bar button:not(#ac-mod button)", "#ac-bar #ac-print", "[data-cc-admin]", ".dfa-btn[data-a]", ".dfa-adm"];
  const TXT = /^(←\s*pagina principală|↓?\s*exportă pdf.*|generează.*|introdu adresa.*|✓?\s*pdf, trimitere.*|arată sursele.*|▤?\s*mapa proprietății|pașii următori|evidență qr|[✎▣▦⚙◐⚖]?\s*(mod client|revizie|aspect|alege pozele|generează raportul|raport juridic|stare date|surse))$/i;
  const PASTREAZA = "#cc-tt-bar, #cc-tt-sel, #cc-tt-inst, #pl-am, #pl-cmd, .pl, .dfa-pl, #date_fine_aproape, .ac-pr";   // lacătul DOM, bara cu rapoartele cardului, instalarea
  const ascunde = e => { if (e.dataset.ccCard) return; e.dataset.ccCard = "1"; e.hidden = true; e.setAttribute("inert", ""); e.setAttribute("aria-hidden", "true"); e.style.setProperty("display", "none", "important"); };   // ascuns, nu șters: restul aplicației își scrie în aceste elemente
  function curata() {
    IDS.forEach(i => { const e = document.getElementById(i); if (e && !e.matches(PASTREAZA)) ascunde(e); });
    document.querySelectorAll(SEL.join(",")).forEach(e => { if (!e.closest(PASTREAZA) || e.matches(".dfa-btn[data-a],.dfa-adm")) ascunde(e); });
    document.querySelectorAll("button,a").forEach(b => {
      if (b.closest(PASTREAZA)) return;
      const t = (b.textContent || "").trim().replace(/\s+/g, " ");
      if (TXT.test(t) && !/^comandă dom$/i.test(t)) ascunde(b);
    });
  }
  window.CC_ADM_P.then(s => {
    if (!s || !(s.k || s.m || s.pv || s.ca_client)) return;   // v82.19.0: și codul master, previzualizarea și vederea „Utilizator” a Adminului
    document.documentElement.classList.add("cc-card");
    const st = document.createElement("style"); st.id = "cc-card-css";
    st.textContent = "html.cc-card #cl-home,html.cc-card #cc-sf,html.cc-card #cc-tt-v,html.cc-card .cc-pasi,html.cc-card [id^=bld-],html.cc-card [id^=mn-],html.cc-card [id^=cq-],html.cc-card #pick{display:none!important}";
    document.head.appendChild(st);
    curata();
    try { new MutationObserver(() => { clearTimeout(curata._t); curata._t = setTimeout(curata, 120); }).observe(document.body, { childList: true, subtree: true }); } catch (e) { setInterval(curata, 800); }
    setInterval(curata, 2000);
  });
})();
