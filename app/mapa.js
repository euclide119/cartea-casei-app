/* cartea casei · mapa proprietății (25.10.2026): actele cerute de notar și de bancă la o vânzare, pe grupe, cu starea fiecăruia (am / nu am / nu e cazul)
   și „cere-l prin noi” pentru ce putem obține. Starea se salvează pe cont (mapa_client).
   Temei verificat pe text (intern, nu se afișează sursa): extras CF pentru autentificare, 10 zile lucrătoare — L 7/1996 art. 35 alin. (1);
   certificat de atestare fiscală, obligatoriu la înstrăinare, 30 de zile, poate fi înlocuit de verificarea electronică — L 207/2015 art. 159 alin. (3), (5);
   certificat de performanță energetică, copie înainte de contract, original la semnare, altfel nulitate relativă — L 372/2005 art. 22.
   Restul: „se cere de obicei” [E], lista exactă o dă notarul / banca. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const ACTE = [
    { g: "cine vinde și cine cumpără", a: [
      { id: "ci", t: "actele de identitate ale vânzătorilor și cumpărătorilor", ce: "buletin sau pașaport valabil, pentru fiecare persoană care semnează.", cine: "notar și bancă", unde: "le ai deja" },
      { id: "casatorie", t: "certificatul de căsătorie și regimul matrimonial", ce: "dacă proprietarul e căsătorit: soțul sau soția semnează sau își dă acordul.", cine: "notar", unde: "starea civilă / notarul care a făcut convenția" },
      { id: "procura", t: "procura, dacă cineva e reprezentat", ce: "procură notarială, pentru cine nu vine la semnare.", cine: "notar", unde: "orice notar", opt: true } ] },
    { g: "proprietatea", a: [
      { id: "titlu", t: "actul de proprietate", ce: "contractul de cumpărare, certificatul de moștenitor, donația, partajul sau hotărârea prin care ai devenit proprietar.", cine: "notar și bancă", unde: "arhiva ta / notarul care l-a făcut / mapa din cartea funciară" },
      { id: "cf_aut", t: "extras de carte funciară pentru autentificare", ce: "îl cere notarul înainte de semnare; e valabil 10 zile lucrătoare și blochează alte înscrieri cât e valabil.", cine: "notar", unde: "notarul îl cere direct", verificat: true },
      { id: "cf_info", t: "extras de carte funciară pentru informare", ce: "arată cine e proprietar, ipotecile și sarcinile; bun de verificat înainte de antecontract.", cine: "bancă și cumpărător", unde: "îl putem cere noi", srv: "cf" },
      { id: "cadastru", t: "documentația cadastrală (plan de amplasament și delimitare)", ce: "planul parcelei cu suprafața măsurată, din dosarul de intabulare.", cine: "notar și bancă", unde: "dosarul de intabulare / îl putem cere noi", srv: "plan" } ] },
    { g: "construcția", tip: ["casa"], a: [
      { id: "ac", t: "autorizația de construire", ce: "pentru casă și pentru extinderi; arată ce s-a aprobat.", cine: "bancă, adesea și notar", unde: "primăria / arhiva ta" },
      { id: "pvr", t: "procesul-verbal de recepție la terminarea lucrărilor", ce: "arată că lucrarea s-a terminat conform autorizației.", cine: "bancă, adesea și notar", unde: "arhiva ta / constructorul" },
      { id: "intab_c", t: "construcția intabulată în cartea funciară", ce: "casa trebuie să apară în extrasul de carte funciară, nu doar terenul.", cine: "notar și bancă", unde: "se vede în extras; dacă lipsește, se face prin topograf" } ] },
    { g: "taxe și datorii", a: [
      { id: "fiscal", t: "certificat de atestare fiscală de la primărie", ce: "arată că impozitele pe proprietate sunt plătite, inclusiv pe anul vânzării; obligatoriu la vânzare, valabil 30 de zile. notarul îl poate verifica și electronic.", cine: "notar", unde: "direcția de taxe a primăriei", verificat: true },
      { id: "asociatie", t: "adeverința de la asociația de proprietari", ce: "arată că nu sunt datorii la întreținere.", cine: "notar", unde: "administratorul blocului", tip: ["apartament"] },
      { id: "utilitati", t: "ultimele facturi la utilități", ce: "curent, gaz, apă: pentru predare și schimbarea contractelor.", cine: "cumpărător", unde: "furnizorii", opt: true } ] },
    { g: "energie", tip: ["casa", "apartament"], a: [
      { id: "cpe", t: "certificat de performanță energetică", ce: "cumpărătorul primește o copie înainte de contract și originalul la semnare; fără el, contractul poate fi anulat.", cine: "notar și cumpărător", unde: "un auditor energetic atestat / îl putem cere noi", srv: "energetic", verificat: true } ] },
    { g: "pentru credit (dacă plătești prin bancă)", a: [
      { id: "evaluare", t: "raport de evaluare de la un evaluator autorizat anevar", ce: "banca îl cere de la un evaluator acceptat de ea.", cine: "bancă", unde: "evaluatorul băncii / îl putem cere noi", srv: "evaluare" },
      { id: "pad", t: "asigurarea obligatorie a locuinței și asigurarea facultativă", ce: "polița obligatorie și asigurarea pe care banca o cere în favoarea ei.", cine: "bancă", unde: "orice asigurător", tip: ["casa", "apartament"] },
      { id: "antecontract", t: "antecontractul (promisiunea de vânzare)", ce: "prețul, avansul, termenul și ce se întâmplă dacă cineva se retrage.", cine: "bancă", unde: "notarul sau avocatul", srv: "opinie" } ] },
    { g: "urbanism (mai ales la teren)", tip: ["teren"], a: [
      { id: "cu", t: "certificat de urbanism de informare", ce: "spune ce se poate construi pe teren; util înainte de cumpărare.", cine: "cumpărător, uneori banca", unde: "primăria / îl putem cere noi", srv: "cu" } ] }
  ];
  const STARI = [["am", "am"], ["nu", "nu am"], ["na", "nu e cazul"]];

  async function ecran(app, r) {
    const { sb, esc, S } = window.CC;
    const tip = r.tip_proprietate || "casa";
    const { data } = await sb.from("mapa_client").select("stare").eq("raport_id", r.id).eq("user_id", S.user.id).maybeSingle();
    const st = (data && data.stare) || {};
    const vizibil = x => !x.tip || x.tip.includes(tip);
    const grupe = ACTE.filter(vizibil).map(g => ({ ...g, a: g.a.filter(vizibil) })).filter(g => g.a.length);
    const toate = grupe.flatMap(g => g.a), cerut = new Set();
    app.innerHTML = `<div class="ecran"><div class="bara" style="margin:-14px -16px 0;padding-left:12px"><button class="ic" data-go="#/r/${esc(r.id)}/final" aria-label="înapoi">‹</button><div class="t">mapa proprietății<small>${esc(String(r.titlu || "").toLocaleLowerCase("ro-RO"))}</small></div></div>
      <div class="cutie"><h2>actele pentru notar și bancă</h2><p class="mut" style="margin:0;font-size:14px">bifează ce ai. ce lipsește apare în listă; unele le putem obține noi. lista exactă o confirmă notarul sau banca.</p>
        <div class="mp-prog"><i id="mp-bar"></i></div><b id="mp-n"></b></div>
      ${grupe.map(g => `<div class="cutie"><h2 style="font-size:19px">${esc(g.g)}</h2><div class="lista">${g.a.map(x => `<div class="r mp-r" data-id="${x.id}" style="flex-direction:column;align-items:stretch;gap:8px">
        <div><b style="font-size:15.5px">${esc(x.t)}</b>${x.opt ? ' <span class="bulina">dacă e cazul</span>' : ""}${x.verificat ? ' <span class="bulina" style="background:#e3f1e8;color:#1f6b3d">obligatoriu</span>' : ""}<small>${esc(x.ce)}</small><small>cine îl cere: ${esc(x.cine)} · de unde: ${esc(x.unde)}</small></div>
        <div class="tip mp-st">${STARI.map(([v, t]) => `<label><input type="radio" name="mp-${x.id}" value="${v}" ${st[x.id] === v ? "checked" : ""}>${t}</label>`).join("")}</div>
        ${x.srv ? `<button class="btn alb mic mp-cere" data-srv="${x.srv}" ${st[x.id] === "am" ? "hidden" : ""}>cere-l prin noi</button>` : ""}</div>`).join("")}</div></div>`).join("")}
      <div class="cutie" id="mp-cos" hidden><b id="mp-cos-t"></b><button class="btn lat" id="mp-go">trimite cererea</button><p id="mp-msg"></p></div>
      <p class="nota">serviciu privat de analiză, independent de instituțiile publice.</p></div>`;
    const root = app.firstElementChild;  // ascultătorii pe ecranul ăsta, nu pe #app (altfel se adună la fiecare deschidere)
    const progres = () => { const n = toate.filter(x => st[x.id] === "am" || st[x.id] === "na").length; $("#mp-n").textContent = `${n} din ${toate.length} acte în ordine`; $("#mp-bar").style.width = Math.round(100 * n / toate.length) + "%"; };
    progres();
    let salvT = null;
    const salveaza = () => { clearTimeout(salvT); salvT = setTimeout(() => sb.from("mapa_client").upsert({ raport_id: r.id, user_id: S.user.id, stare: st, actualizat_la: new Date().toISOString() }).then(() => {}), 400); };
    root.addEventListener("change", e => { const i = e.target.closest("input[type=radio]"); if (!i) return; const rr = i.closest(".mp-r"); st[rr.dataset.id] = i.value; salveaza(); progres();
      const b = rr.querySelector(".mp-cere"); if (b) b.hidden = i.value === "am"; });
    const cos = () => { $("#mp-cos").hidden = !cerut.size; $("#mp-cos-t").textContent = `de cerut prin noi: ${cerut.size}`; };
    root.addEventListener("click", e => { const b = e.target.closest(".mp-cere"); if (!b) return; const s = b.dataset.srv;
      if (cerut.has(s)) { cerut.delete(s); b.textContent = "cere-l prin noi"; b.classList.add("alb"); } else { cerut.add(s); b.textContent = "✓ adăugat la cerere"; b.classList.remove("alb"); } cos(); });
    $("#mp-go").onclick = async () => {
      const m = $("#mp-msg"); $("#mp-go").disabled = true; m.className = "mut"; m.textContent = "trimit…";
      const { data: d, error } = await sb.from("cereri").insert({ tip: "servicii", date: { raport_id: r.id, servicii: [...cerut], nota: "din mapa proprietății" } }).select("nr").single();
      if (error) { m.className = "err"; m.textContent = /5 cereri/.test(error.message) ? error.message : "cererea nu s-a putut trimite acum."; $("#mp-go").disabled = false; return; }
      m.className = "okm"; m.textContent = `cererea ${d.nr.toLowerCase()} e înregistrată. îți scriem cu prețul și termenul.`;
    };
  }
  window.CC_MAPA = { ecran };
})();
