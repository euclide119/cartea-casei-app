/* Raport _ Cartea Casei - „pdf, trimitere și alte servicii” și „mapa proprietății” pe linkul cu cod (Manu, 02.11.2026: „exact în forma inițială”).
   Aceeași pagină ca în aplicație (app.js → ecranFinal, mapa.js neschimbat, aceleași stiluri), într-un cadru peste raport.
   Diferența față de aplicație: nu există cont, deci bifele și mapa stau pe telefon, iar la cereri se cere un telefon sau un e-mail. */
(function () {
  "use strict";
  const C = window.parent.CC_SERV, app = document.getElementById("app"), r = C.raport, rid = r.id;
  const $ = (s, x) => (x || document).querySelector(s), $$ = (s, x) => [...(x || document).querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const mic = s => String(s ?? "").toLocaleLowerCase("ro");
  const cit = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } }, scr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const KB = "cc-bife:" + rid, KM = "cc-mapa:" + rid, KC = "cc-contact";
  /* în loc de contul din aplicație: mapa pe telefon, cererile prin server */
  const sb = { from: t => t === "mapa_client" ? {
      select: () => { const q = { eq: () => q, maybeSingle: async () => ({ data: { stare: cit(KM, {}) } }) }; return q; },
      upsert: o => { scr(KM, o.stare); return Promise.resolve({}); }
    } : { insert: o => ({ select: () => ({ single: async () => {
        let c = cit(KC, ""); if (!c) { c = (prompt("telefonul sau e-mailul la care te putem găsi") || "").trim(); if (c) scr(KC, c); }
        if (!c) return { error: { message: "fără telefon sau e-mail nu te putem găsi." } };
        const j = await C.cerere(o.date.servicii, o.date.nota, c); return j.nr ? { data: { nr: j.nr } } : { error: { message: j.error || "eroare" } }; } }) }) } };
  window.CC = { sb, esc, S: { user: { id: "telefon" } } };
  const instalata = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const SERVICII = [["date_fine", "date fine: anunțurile din zonă, cu contacte"], ["istoric_acte", "istoricul actelor de urbanism"], ["evaluare", "evaluare de la un evaluator autorizat anevar"], ["energetic", "certificat energetic"], ["opinie", "fișa juridică emisă de un avocat cu drept de practică"],
    ["cf", "extras de carte funciară sau alte date de cadastru"], ["mapa", "mapa proprietății pregătită de noi: toate actele, în ordine"]];
  async function deschideMapa() { await window.CC_MAPA.ecran(app, r); if (window.CC_MAPA_F) window.CC_MAPA_F.monteaza(app, rid).catch(() => {}); }
  function final() {
    const lista = C.capitole(), sel = new Set(cit(KB, []));
    app.innerHTML = `<div class="ecran"><div class="bara" style="margin:-14px -16px 0;padding-left:12px"><button class="ic" data-inchide aria-label="înapoi">‹</button><div class="t">pdf și cereri<small>${esc(mic(r.titlu))}</small></div></div>
      <div class="cutie"><h2>pdf-ul raportului</h2><p class="mut" style="margin:0;font-size:14px">bifează ce vrei în pdf sau ce vrei să trimiți.</p>
        <div class="tip"><button class="btn alb mic" id="b-tot">bifează tot</button><button class="btn alb mic" id="b-nimic">nimic</button></div>
        <div class="lista" id="bife">${lista.map((c, i) => `<label class="r" style="cursor:pointer"><input type="checkbox" data-k="${esc(c.k)}" ${sel.has(c.k) ? "checked" : ""} style="width:22px;height:22px"><div>${esc(mic(c.t))}<small>capitolul ${String(i + 1).padStart(2, "0")}</small></div></label>`).join("")}</div>
        <button class="btn lat" id="pdf-tot">pdf complet (${lista.length} capitole)</button>
        <button class="btn alb lat" id="pdf-sel">pdf cu ce ai bifat</button>
        <button class="btn alb lat" id="trimite" hidden>trimite ce ai bifat</button>
        <p class="mut" style="margin:0;font-size:13px">pdf-ul se descarcă direct pe dispozitiv, fără imprimantă. de pe telefon îl poți trimite și pe e-mail ori whatsapp.</p></div>
      <div class="cutie"><h2>planșa de promovare</h2><p class="mut" style="margin:0;font-size:14px">afișul proprietății, pdf de 3 pagini.</p><button class="btn lat" id="afis">emite planșa de promovare</button><p id="afis-m" class="mut" style="margin:0"></p></div>
      <div class="cutie"><h2>mapa proprietății</h2><p class="mut" style="margin:0;font-size:14px">actele pe care le cer notarul și banca la vânzare, pe grupe: bifezi ce ai, vezi ce lipsește, ceri prin noi ce putem obține.</p><button class="btn lat" data-go="#/mapa">deschide mapa</button></div>
      <div class="cutie"><h2>am nevoie și de</h2><p class="mut" style="margin:0;font-size:14px">bifează ce mai vrei pentru proprietatea asta. Te contactăm în următoarele 120 de minute, în timpul orelor de program. În afara lor, comanda ta va fi procesată cu prioritate la începerea programului din ziua lucrătoare următoare.</p>
        <div class="lista">${SERVICII.map(([v, t]) => `<label class="r" style="cursor:pointer"><input type="checkbox" name="srv" value="${v}" style="width:22px;height:22px"><div>${esc(t)}</div></label>`).join("")}</div>
        <label class="camp">date despre imobil sau ce ar trebui să știm (opțional)<input type="text" id="srv-nota" maxlength="300" placeholder="ex.: CF, adresa, dacă e în vânzare"></label>
        <label class="camp">telefonul sau e-mailul la care te putem găsi<input type="text" id="srv-c" maxlength="120" autocomplete="tel" placeholder="07xx xxx xxx sau nume@exemplu.ro" value="${esc(cit(KC, ""))}"></label>
        <label class="r" style="cursor:pointer"><input type="checkbox" id="srv-acc" style="width:22px;height:22px"><div>accept <a href="conditii.html" target="_blank" rel="noopener">condițiile de utilizare</a> și prelucrarea datelor (GDPR)</div></label>
        <button class="btn lat" id="srv-go" disabled>trimite cererea</button><p id="srv-msg"></p></div>
      <div class="cutie" data-app><h2>aplicația pe telefon</h2>${instalata() ? '<p class="okm">aplicația e deja pe ecranul telefonului.</p>' : C.prompt() ? '<button class="btn lat" id="inst2">instalează aplicația</button>' : `<p class="mut" style="margin:0;font-size:14px">${/iPhone|iPad/.test(navigator.userAgent) ? "în safari apasă butonul de partajare (pătratul cu săgeată), apoi „adaugă pe ecranul principal”." : "în meniul browserului (⋮) alege „instalează aplicația” sau „adaugă pe ecranul de pornire”."} pe ecran intri cu același cod al raportului.</p>`}</div>
      <p class="nota">serviciu privat de analiză, independent de instituțiile publice.</p></div>`;
    window.CC_ACORD(app);
    const nr = () => { const n = [...sel].filter(k => lista.some(c => c.k === k)).length; $("#pdf-sel").textContent = `pdf cu ce ai bifat (${n})`; $("#pdf-sel").disabled = !n; $("#trimite").disabled = !n; };
    const pune = (k, on) => { if (on) sel.add(k); else sel.delete(k); scr(KB, [...sel]); }; nr();
    $("#bife").addEventListener("change", e => { const c = e.target.closest("input[data-k]"); if (c) { pune(c.dataset.k, c.checked); nr(); } });
    $("#b-tot").onclick = () => { $$("#bife input").forEach(c => { c.checked = true; pune(c.dataset.k, true); }); nr(); };
    $("#b-nimic").onclick = () => { $$("#bife input").forEach(c => { c.checked = false; pune(c.dataset.k, false); }); nr(); };
    $("#pdf-tot").onclick = () => C.tipareste(lista.map(c => c.k));
    $("#pdf-sel").onclick = () => C.tipareste(lista.map(c => c.k).filter(k => sel.has(k)));
    $("#trimite").onclick = () => C.tipareste(lista.map(c => c.k).filter(k => sel.has(k)));
    $("#afis").onclick = () => { const m = C.afis(); if (m) $("#afis-m").textContent = m; };
    const i2 = $("#inst2"); if (i2) i2.onclick = () => C.instaleaza().then(final);
    const srvOk = () => { $("#srv-go").disabled = !$$("input[name=srv]:checked").length || !$("#srv-c").value.trim() || !$("#srv-acc").checked; };
    $("#srv-acc").addEventListener("change", srvOk);
    app.querySelectorAll("input[name=srv]").forEach(c => c.addEventListener("change", srvOk)); $("#srv-c").addEventListener("input", srvOk);
    $("#srv-go").onclick = async () => {
      const servicii = $$("input[name=srv]:checked").map(c => c.value), m = $("#srv-msg"), ct = $("#srv-c").value.trim(); scr(KC, ct);
      $("#srv-go").disabled = true; m.className = "mut"; m.textContent = "trimit…";
      const j = await C.cerere(servicii, $("#srv-nota").value.trim().slice(0, 300), ct);
      if (!j.nr) { m.className = "err"; m.textContent = mic(j.error || "cererea nu s-a putut trimite acum."); $("#srv-go").disabled = false; return; }
      m.className = "okm"; m.textContent = `cererea ${String(j.nr).toLowerCase()} e înregistrată. îți scriem cu prețul și termenul.`;
      $$("input[name=srv]").forEach(c => c.checked = false);
    };
  }
  document.addEventListener("click", e => {
    if (e.target.closest("[data-inchide]")) return C.inchide();
    const g = e.target.closest("[data-go]"); if (!g) return; e.preventDefault();
    if (/mapa$/.test(g.dataset.go)) deschideMapa(); else final(); window.scrollTo(0, 0);
  });
  const inl = location.hash === "#inline";
  if (inl) { const st = document.createElement("style"); st.textContent = "html,body{height:auto;background:transparent}[data-inchide]{display:none!important}[data-app],.nota{display:none!important}.bara{display:none!important}.cutie{padding:12px 14px!important;gap:8px!important}#bife{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:0 12px}#bife .r{padding:5px 0!important;border:0!important}#bife small{display:none}#bife input{width:18px!important;height:18px!important}.lista .r{padding:5px 0!important;border:0!important}.ecran{max-width:none;min-height:0;padding:6px 0 10px}"; document.head.appendChild(st);
    const trimite = () => C.inaltime(document.documentElement.scrollHeight); new ResizeObserver(trimite).observe(document.body); }
  /* „Pașii următori” în stilul acordeonului din raport: vedere pe capitole, fiecare se deschide; detaliile actelor la a doua deschidere (Manu, 06.11.2026) */
  window.CC_ACORD = root => {
    if (!document.getElementById("cc-acord-css")) { const st = document.createElement("style"); st.id = "cc-acord-css";
      st.textContent = ".cutie.acd>h2{cursor:pointer;position:relative;padding-right:30px;margin:0!important}.cutie.acd>h2::after{content:'+';position:absolute;right:4px;top:50%;transform:translateY(-50%);font-size:24px;font-weight:600}.cutie.acd.des>h2::after{content:'\\2212'}.ecran>.cutie.acd:not(.des)>:not(h2),.ecran>.cutie.acd:not(.des)>.lista,.ecran>.cutie.acd:not(.des)>.tip{display:none!important}.mp-r small{display:none}.mp-r.des small{display:block}.mp-r .mp-ce{all:unset;cursor:pointer;font-size:13px;font-weight:600;text-decoration:underline;color:#2c5c9c;margin-left:6px}.ecran>.cutie.acd:not(.des):not(.fn-v){background:#eff3fa}";   /* v82.10.1: fereastra închisă și neatinsă are o nuanță diferită până la primul click */
      document.head.appendChild(st); }
    (root || document).querySelectorAll(".ecran > .cutie").forEach(c => { const h = c.querySelector(":scope > h2"); if (!h || c.classList.contains("acd") || c.querySelector("#mp-bar,#mp-cos")) return; c.classList.add("acd"); h.addEventListener("click", () => { c.classList.add("fn-v"); c.classList.toggle("des"); }); });
    (root || document).querySelectorAll(".mp-r").forEach(r => { const b = r.querySelector(":scope > div > b"); if (!b || r.querySelector(".mp-ce")) return; const x = document.createElement("button"); x.type = "button"; x.className = "mp-ce"; x.textContent = "ce e"; x.onclick = () => r.classList.toggle("des"); b.after(x); });
  };
  window.CC_PORNESTE = () => { if (location.hash === "#mapa") deschideMapa(); else final(); };
})();
