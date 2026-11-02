/* Raport în creștere — capitolul „Frici și negociere (antecontract)".
   Din datele proprietății (D, global din index.html) scoate: (1) fricile obișnuite ale cumpărătorului și ale vânzătorului, cu ce arată datele aici;
   (2) pârghiile de preț: ce argument are cumpărătorul ca să coboare prețul, ce argument are vânzătorul ca să-l urce, cât de tare e fiecare;
   (3) ce se scrie în antecontract. Textele de lege sunt din Codul civil (legislatie/texte/L287_2009.txt, consolidat la 03.05.2026).
   Raportul constată fapte; „pârghia" e un argument de discuție, nu o evaluare și nu o concluzie juridică. Nu folosește .cards/.note/.scroll/table,
   ca să se vadă întreg și în modul „Simplu" (interfata.js). */
(function () {
  if (!document.querySelector('script[src="concluzii.js"]')) { const sc = document.createElement("script"); sc.src = "concluzii.js"; document.body.appendChild(sc); }   // „Concluzii pe elemente" din Rezumat
  try { EL.negociere = "negociere"; EL_INV.negociere = "negociere"; } catch (e) {}   // înainte ca index.html să citească hash-ul
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = (v, d = 0) => Number(v).toLocaleString("ro-RO", { minimumFractionDigits: d, maximumFractionDigits: d });
  const km = m => m >= 1000 ? nf(m / 1000, 1) + " km" : nf(m) + " m";
  let last = null, vazut = false, lastPr = "";

  function css() {
    const s = document.createElement("style"); s.id = "neg-css";
    s.textContent = `
#negociere .ng-sec{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;display:flex;flex-direction:column;gap:10px;min-width:0}
#negociere .ng-sec h3{margin:0}
#negociere .ng-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px}
#negociere .ng-fear{border:1px solid var(--line);border-left:4px solid var(--c,var(--muted));border-radius:8px;padding:10px 12px;display:flex;flex-direction:column;gap:4px;font-size:13.5px}
#negociere .ng-fear b{font-size:14px}
#negociere .ng-fear .d{color:var(--muted)}
#negociere .ng-fear .a{font-size:12.5px}
#negociere .ng-l{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 12px;border-top:1px solid var(--line);padding:10px 0;font-size:13.5px}
#negociere .ng-l:first-child{border-top:0}
#negociere .ng-l .ng-t{font-weight:600;background:none} #negociere .ng-l .ng-f{color:var(--muted);grid-column:1}
#negociere .ng-l .ng-x{grid-column:1;font-size:13px}
#negociere .ng-w{grid-row:1/span 3;grid-column:2;text-align:right;display:flex;flex-direction:column;gap:4px;align-items:flex-end}
#negociere .ng-dir{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.04em;padding:2px 8px;border-radius:99px;white-space:nowrap}
#negociere .ng-dir.j{background:color-mix(in srgb,var(--ok) 16%,transparent);color:var(--ok)}
#negociere .ng-dir.s{background:color-mix(in srgb,var(--hz100) 18%,transparent);color:var(--hz100)}
#negociere .ng-dir.n{background:color-mix(in srgb,#2c5c9c 14%,transparent);color:#2c5c9c}
#negociere .ng-dots{display:inline-flex;gap:3px} #negociere .ng-dots i{width:9px;height:9px;border-radius:50%;background:var(--line)} #negociere .ng-dots i.on{background:var(--accent)}
#negociere ul.ng-u{margin:0;padding-left:18px;display:grid;gap:5px;font-size:13.5px}
#negociere .ng-lg{font-size:12.5px;color:var(--muted)}
#negociere .ng-pc{font:600 15px var(--mono)} #negociere .ng-tot{border:1px solid var(--line);border-radius:9px;padding:10px 12px;display:flex;flex-direction:column;gap:3px;background:color-mix(in srgb,var(--summer) 14%,var(--panel))} #negociere .ng-tot .ng-pc{font-size:22px}
#negociere .ng-tm{font:12px var(--mono);color:var(--muted)}`;
    document.head.appendChild(s);
  }

  /* ---- pârghiile: din fapte. dir: "j" = coboară prețul (cumpărător), "s" = urcă prețul (vânzător), "n" = în ambele sensuri / neutru; w = forța 1–3 ---- */
  function parghii(D) {
    const L = [], add = (tema, dir, w, fapt, cum, antec) => L.push({ tema, dir, w, fapt, cum, antec });
    const F = D.inundatii || {}, H = F.hazard || {}, z10 = H.hz10?.dist_m, z100 = H.hz100?.dist_m, C2 = F.ciclu2_punct, O = F.date_deschise;
    const f100 = C2?.disponibil ? C2.scenarii?.F?.["100"]?.adancime_m : undefined;
    if (z10 === 0 || z100 === 0 || typeof f100 === "number") {
      add("Inundații", "j", 3, typeof f100 === "number" ? `La o inundație de 100 de ani apa ajunge aici la ${nf(f100, 2)} m (ANAR, ciclul II).` : `Punctul e în zona inundabilă ${z10 === 0 ? "de 10 ani" : "de 100 de ani"} (ANAR).`,
        "Cumpărătorul cere reducere sau garanții: asigurarea locuinței și a eventualelor lucrări de protecție costă și scade cererea.", "Declarație a vânzătorului despre inundații trecute; condiție suspensivă: oferta de asigurare la un preț rezonabil.");
    } else if (typeof z10 === "number" && z10 <= 100) {
      add("Inundații", "j", 2, `Zona inundabilă de 10 ani e la ≈ ${nf(z10)} m; punctul însuși nu e în zonă.`, "Cumpărătorul cere un argument scris că proprietatea nu a fost inundată; vânzătorul îl dă cu hărțile ANAR.", "Declarația vânzătorului despre istoricul inundațiilor, la antecontract.");
    } else if (z10 !== undefined) {
      add("Inundații", "s", 2, `Punctul nu e în nicio zonă de hazard ANAR${C2?.disponibil ? " (și harta ciclului II îl arată uscat)" : ""}; zona de 10 ani e la ${typeof z10 === "number" ? "≈ " + km(z10) : "peste 5 km"}.`,
        "Vânzătorul poate cere preț întreg: riscul cel mai scump (apa) lipsește pe hărțile oficiale.", "Anexează extrasul din hărțile ANAR (data și sursa din raport).");
    }
    if (O?.dig && O.dig.dist_m <= 2000) add("Dig în apropiere", "j", 2, `Digul „${O.dig.nume}” e la ${km(O.dig.dist_m)}.`, "Cumpărătorul poate cere să afle cine întreține digul și ce scenariu de spargere există (scenariile DB din hărțile ANAR).", "Declarație despre lucrări de apărare cunoscute.");
    const S = D.seismic;
    if (S && S.ag >= 0.2) add("Seism", "n", 1, `Zona are ag = ${S.ag_txt} g (P100-1), la fel pentru toate casele din localitate.`, "Nu scade prețul prin zonă, ci prin clădire: cumpărătorul cere anul construcției și, la clădiri vechi, expertiza tehnică. Vânzătorul care are expertiza o pune pe masă.", "Anul construcției și existența unei expertize, declarate în antecontract.");
    const Z = (D.zgomot?.surse || []).filter(x => /autostrad|național|cale ferat|aerop/i.test(x.cat) && x.m <= 800);
    if (Z.length) add("Zgomot", "j", 2, Z.map(x => `${x.cat} „${x.nume}” la ${km(x.m)}`).join("; ") + ".", "Cumpărătorul poate cita sursele de zgomot din rază; verificarea se face la ora de vârf, nu doar duminica.", "Vizionare la ore diferite; clauză de cunoaștere a stării (cumpărătorul a văzut zona).");
    else if (D.zgomot) add("Liniște", "s", 1, "Nicio autostradă, drum național sau cale ferată în 800 m (OSM).", "Vânzătorul poate vinde liniștea, dar harta are doar distanțe, nu niveluri măsurate.", "—");
    const A = D.autorizatii;
    if (A?.colectat) {
      const cl = A.clase || {}, nou = (cl.casa || 0) + (cl.colectiv || 0);
      add("Construcții în jur", "n", 2, `${nf(nou)} autorizații de case și blocuri în ${A.ani} ani în ${A.uat}; ${nf(cl.demolare || 0)} demolări.`,
        "Cumpărătorul: șantiere, trafic și ofertă mare pe aceeași zonă țin prețul jos. Vânzătorul: se construiește mult = zona e cerută.", "Dacă urmează un bloc sau PUZ lângă proprietate, cere în antecontract declarația că vânzătorul nu cunoaște proiecte care o afectează.");
    }
    const P = D.populatie;
    if (P && typeof P.var === "number") add("Populația zonei", P.var > (P.judet_var || 0) + 5 ? "s" : P.var < 0 ? "j" : "n", P.var > 20 || P.var < -5 ? 2 : 1,
      `${P.uat}: ${nf(P.p2016)} → ${nf(P.p2026)} locuitori în 10 ani (${P.var > 0 ? "+" : ""}${nf(P.var, 1)}%; județul ${nf(P.judet_var || 0, 1)}%).`,
      P.var > 0 ? "Vânzătorul: cerere în creștere. Cumpărătorul: creșterea se vede deja în preț." : "Cumpărătorul: zona pierde populație, deci cerere mai mică la revânzare.", "—");
    const FC = D.facilitati;
    if (FC && typeof FC.scor === "number") add("Facilități la pas", FC.scor >= 60 ? "s" : FC.scor < 45 ? "j" : "n", 1, `Scor de facilități ${nf(FC.scor)}/100 (OSM, formula noastră).`, FC.scor >= 60 ? "Vânzătorul: servicii în jur." : "Cumpărătorul: lipsesc servicii la pas (magazine, farmacie, medic).", "—");
    const SC = D.scoli;
    if (SC) add("Școli și grădinițe", (SC.nr_scoli + SC.nr_gradinite) >= 4 ? "s" : "n", 1, `${SC.nr_scoli} școli și ${SC.nr_gradinite} grădinițe în 2 km (OSM).`, "Argument pentru familii; circumscripția școlară se verifică separat, hărțile noastre nu o arată.", "—");
    const U = D.urbanism?.pug;
    if (U?.gasit) {
      const lit = !/^\s*(niciun|nimic|nu\b)/i.test(String(U.litigii || "")) && /dosar|recurs|anulare|sentin|suspend/i.test(String(U.litigii || ""));
      const AN = (String(U.an || "").match(/\d{4}/) || [""])[0], vechi = Number(AN) && Number(AN) <= 2010;
      if (lit || vechi || /ini[tț]iat|achizi/i.test(U.pug_nou || "")) add("PUG: reguli de construire", "j", lit ? 3 : 2,
        `${lit ? "PUG ".concat(AN, " în litigiu; ") : `PUG din ${AN}; `}${U.pug_nou ? "PUG nou: " + String(U.pug_nou).slice(0, 110) : ""}`,
        "Cumpărătorul: dacă vrea să construiască sau să extindă, regulile pot să se schimbe sau să fie contestate; asta scade valoarea pentru el. Vânzătorul poate răspunde cu certificatul de urbanism existent.", "Condiție suspensivă: certificat de urbanism favorabil scopului cumpărătorului, obținut înainte de contract.");
    }
    if (D.pv?.annual?.PVOUT_csi >= 1200) add("Energie solară", "s", 1, `${nf(D.pv.annual.PVOUT_csi)} kWh/kWp pe an; 5 kWp ≈ ${nf(5 * D.pv.annual.PVOUT_csi)} kWh (Global Solar Atlas).`, "Vânzătorul: potențial bun pentru panouri; orientarea și umbrele acoperișului decid dacă se confirmă.", "—");
    const M = D.monumente;
    if (M?.zona_protectie || M?.in_sit_ran) add("Patrimoniu", "j", 2, "Proprietatea e în zonă de protecție sau în sit arheologic.", "Cumpărătorul: lucrări cu avize speciale și costuri de supraveghere arheologică.", "Cere în antecontract avizele existente.");
    else if (M) add("Patrimoniu", "s", 1, `Niciun monument în zonă de protecție; cel mai apropiat la ${M.cel_mai_aproape != null ? km(M.cel_mai_aproape) : "—"}.`, "Vânzătorul: fără restricții de patrimoniu la construire.", "—");
    const AP = D.arii_protejate;
    if (AP?.in_arie?.length) add("Arii protejate", "j", 2, `În ${AP.in_arie.length} arii naturale protejate.`, "Cumpărătorul: restricții și avize pentru construire.", "Cere avizul APM, ca și condiție.");
    const G = D.alunecari;
    if (G && /loess/i.test(G.geologie?.descriere || "")) add("Teren", "j", 1, `Geologie cu loess (${G.geologie.cod}); pantă maximă ${nf(G.panta_max_pct, 1)}%.`, "Cumpărătorul: cere studiu geotehnic înainte de fundație; loessul se tasează când se udă.", "Dreptul de a face un studiu geotehnic înainte de semnarea contractului.");
    else if (G) add("Teren plat", "s", 1, `Pantă maximă ${nf(G.panta_max_pct, 1)}%, diferență de nivel ${nf(G.dif_1km_m)} m în 1 km.`, "Vânzătorul: teren fără risc de alunecare.", "—");
    const ref = window.RIC_EV_PRET || {};
    if (ref.pctl != null && ref.cerut && ref.estimare) {
      const gap = (ref.cerut - ref.estimare) / ref.cerut * 100;
      if (ref.pctl > 75 && gap > 1) add("Prețul cerut față de piață", "j", 3, `Prețul cerut e la percentila ${nf(ref.pctl)} pe €/mp (${nf(ref.cerut_mp)} €/mp față de mediana de ${nf(ref.mediana_mp)} €/mp) și cu ${nf(gap, 1)}% peste estimarea din comparabile.`, "Oportunitate: o discuție pornită de la comparabile, nu de la senzații; fiecare anunț din tabel e verificabil.", "Prețul final se scrie în antecontract, pe total și pe mp.");
      else if (ref.pctl <= 25) add("Prețul cerut față de piață", "s", 2, `Prețul cerut e la percentila ${nf(ref.pctl)} pe €/mp: sub majoritatea comparabilelor.`, "Oportunitate pentru vânzător: există loc de a susține un preț mai ridicat cu aceleași comparabile.", "—");
    }
    const BAZA = { "Inundații": 3, "Dig în apropiere": 1.5, "Seism": 1, "Zgomot": 2, "Liniște": 0.5, "Construcții în jur": 1.5, "Populația zonei": 1, "Facilități la pas": 1, "Școli și grădinițe": 0.5,
      "PUG: reguli de construire": 3, "Energie solară": 0.5, "Patrimoniu": 1.5, "Arii protejate": 2, "Teren": 1, "Teren plat": 0.5 };
    L.forEach(x => { if (x.tema === "Prețul cerut față de piață") { const g = (ref.cerut - ref.estimare) / ref.cerut * 100; x.pct = x.dir === "j" ? [Math.round(Math.min(g, 15) * 0.5 * 10) / 10, Math.round(Math.min(g, 15) * 10) / 10] : [0, 3]; return; }
      const m = (BAZA[x.tema] ?? 1) * x.w / 2; x.pct = [Math.round(m * 0.5 * 10) / 10, Math.round(m * 1.5 * 10) / 10]; });   // marjă orientativă, ipoteză E
    return L.sort((a, b) => b.w - a.w);
  }

  /* ---- fricile: fiecare cu ce arată datele aici ---- */
  function frici(D, L) {
    const has = t => L.find(x => x.tema === t);
    const c = (col, titlu, ce, dat, ant) => ({ col, titlu, ce, dat, ant });
    const ok = "var(--ok)", war = "var(--hz100)", bad = "var(--hz10)", inf = "#2c5c9c";
    const infl = has("Inundații"), pug = has("PUG: reguli de construire"), z = has("Zgomot");
    const B = [
      c(infl && infl.dir === "j" ? bad : ok, "„Mă inundă apa”", infl ? infl.fapt : "Nu avem date de inundații pentru punct.", true, "Declarația vânzătorului despre inundații + extrasul ANAR atașat."),
      c(inf, "„Plătesc și pierd banii (arvuna)”", "Dacă dai arvună și nu mai închei contractul fără justificare, vânzătorul o poate reține; dacă renunță el, poți cere dublul (Cod civil art. 1.544). Dacă antecontractul spune expres că oricare poate renunța, cel care renunță pierde arvuna sau dă dublul (art. 1.545).", false, "Scrie ce e suma: arvună confirmatorie, arvună penalizatoare sau avans. Fără stipulație contrară, sumele plătite sunt avans din preț (art. 1.670)."),
      c(war, "„Sunt sarcini sau datorii pe imobil”", "Extrasul de CF arată ipoteci, notări, servituți. Notarea antecontractului în CF (art. 906) cere ca vânzătorul să fie înscris titular și ca antecontractul să aibă termenul de încheiere.", false, "Extras de CF actualizat la semnare și la notare; termenul contractului în antecontract."),
      c(pug ? war : ok, "„Nu pot construi ce vreau”", pug ? pug.fapt : "Nu am găsit probleme cu planul urbanistic în datele noastre.", true, "Condiție suspensivă: certificat de urbanism pentru scopul tău."),
      c(z ? war : ok, "„Zgomot, aglomerație, vecini”", z ? z.fapt : "Nicio sursă mare de zgomot în 800 m (OSM).", true, "Vizionare la ore diferite; cere informații despre proiectele din jur."),
      c(inf, "„Plătesc prea mult”", "Prețul se discută pe fapte: cele de mai jos, la „Pentru cumpărător”. Raportul nu estimează prețul; el arată ce poți pune pe masă.", false, "Preț pe mp și pe total, scris clar; ce e inclus (mobilă, anexe)."),
    ];
    const S = [
      c(inf, "„Cumpărătorul mă lasă baltă”", "Dacă cumpărătorul dă arvună și renunță fără justificare, o poți reține (art. 1.544). Clauza penală îți dă dreptul la sumă fără să dovedești prejudiciul (art. 1.538).", false, "Arvună sau clauză penală clar scrise; termen de încheiere."),
      c(war, "„Îmi pică prețul cu argumente”", "Cumpărătorul va căuta aceleași puncte: de aceea ai nevoie de argumentele din „Pentru vânzător” și de documente pentru fiecare (hărți, certificate).", true, "Pune documentele ca anexă; prețul fix în antecontract."),
      c(war, "„Actele nu sunt în ordine”", "CF, certificat energetic, acte de construcție și fiscale; lipsa lor îți dă motiv de scădere de preț sau de întârziere.", false, "Listă de acte predate la antecontract, cu termene."),
      c(inf, "„Cumpărătorul nu primește credit”", "Dacă banca nu aprobă, contractul final nu se poate încheia; ce se întâmplă cu banii dați depinde de ce scrie antecontractul.", false, "Condiție suspensivă cu termen scurt, plafon al avansului. Dacă contractul încetează fără vina vreunei părți, arvuna se restituie (art. 1.546)."),
      c(inf, "„Vânzarea durează sau se complică”", "Termenul din antecontract și lista de acte de predat decid cine întârzie.", false, "Termen de încheiere și penalități pentru întârziere."),
    ];
    return { B, S };
  }

  const dots = w => `<span class="ng-dots" title="forța argumentului, 1–3">${[0, 1, 2].map(i => `<i class="${i < w ? "on" : ""}"></i>`).join("")}</span>`;
  const dir = { j: ["spre un preț mai jos", "j"], s: ["spre un preț mai sus", "s"], n: ["în ambele sensuri", "n"] };

  function randare() {
    const sec = document.getElementById("negociere"); if (!sec || typeof D === "undefined" || !D) return;
    const L = parghii(D), Fr = frici(D, L), ref = window.RIC_EV_PRET || {}, pretRef = ref.cerut || ref.estimare || null;
    const eur = v => nf(Math.round(v / 100) * 100) + " €";
    const tot = dd => { const a = L.filter(x => x.dir === dd), lo = a.reduce((t, x) => t + x.pct[0], 0), hi = a.reduce((t, x) => t + x.pct[1], 0), cap = dd === "j" ? 12 : 10;
      return { n: a.length, lo, hi, hiC: Math.min(hi, cap), cap }; };
    const Tj = tot("j"), Ts = tot("s");
    const totBloc = (t, titlu, verb) => `<div class="ng-tot"><b>${titlu}</b><span class="ng-pc">${t.n ? nf(t.lo, 1) + "–" + nf(t.hiC, 1) + "%" : "—"}</span><span class="ng-lg">${t.n ? `${t.n} elemente. ${verb} Suma e plafonată la ${t.cap}%, fiindcă elementele se suprapun. E un interval de discuție, nu o promisiune.${pretRef ? ` Pe ${eur(pretRef)}: ${eur(pretRef * t.lo / 100)}–${eur(pretRef * t.hiC / 100)}.` : ""}` : "Datele noastre nu dau elemente aici."}</span></div>`;
    const fear = f => `<div class="ng-fear" style="--c:${f.col}"><b>${esc(f.titlu)}</b><span class="d">${esc(f.ce)}</span><span class="a"><b>În antecontract:</b> ${esc(f.ant)}</span></div>`;
    const lev = x => `<div class="ng-l"><span class="ng-t">${esc(x.tema)}</span><span class="ng-f"><b>Motiv:</b> ${esc(x.fapt)}</span><span class="ng-x">${esc(x.cum)}${x.antec && x.antec !== "—" ? `<br><b>Antecontract:</b> ${esc(x.antec)}` : ""}</span>` +
      `<span class="ng-w"><span class="ng-dir ${dir[x.dir][1]}">${dir[x.dir][0]}</span><span class="ng-tm">interval</span><b class="ng-pc">${nf(x.pct[0], 1)}–${nf(x.pct[1], 1)}%</b>${pretRef ? `<span class="ng-tm">${eur(pretRef * x.pct[0] / 100)}–${eur(pretRef * x.pct[1] / 100)}</span>` : ""}${dots(x.w)}</span></div>`;
    const jos = L.filter(x => x.dir === "j"), sus = L.filter(x => x.dir === "s"), mix = L.filter(x => x.dir === "n");
    sec.innerHTML = `<div><h2>Negociere și antecontract: puncte de discuție</h2><p class="lead">Ce îi îngrijorează pe oameni la o tranzacție, ce arată datele despre această proprietate și ce puncte de discuție poate aduce fiecare parte, înainte de antecontract. Argumentele sunt fapte din raport cu sursă; nu sunt o evaluare și nu sunt o concluzie juridică.</p></div>
      <div class="ng-sec"><h3>Ce îngrijorează cumpărătorul: puncte de discuție</h3><div class="ng-two">${Fr.B.map(fear).join("")}</div></div>
      <div class="ng-sec"><h3>Ce îngrijorează vânzătorul: puncte de discuție</h3><div class="ng-two">${Fr.S.map(fear).join("")}</div></div>
      <div class="ng-sec keep"><h3>Oportunități de negociere pe proprietatea asta</h3>
        <div class="ng-two">${totBloc(Tj, "Interval total, pentru cumpărător", "Oportunități de a ajunge la un preț mai jos.")}${totBloc(Ts, "Interval total, pentru vânzător", "Oportunități de a susține un preț mai sus.")}</div>
        <p class="ng-lg">Fiecare element are o notă: cât la sută din preț poate muta negocierea, ca marjă orientativă (ipoteză E, calibrată pe forța argumentului; se verifică la prima tranzacție reală). ${dots(3)} forță mare · ${dots(1)} forță mică. Prețul de referință: ${pretRef ? eur(pretRef) + (ref.cerut ? " (cel cerut)" : " (estimarea din capitolul Estimare valoare)") : "completează fișa din capitolul Estimare valoare ca să vezi sumele în euro"}.</p>
        <div class="ng-two"><div><b>Pentru cumpărător: ce poate duce prețul mai jos</b>${jos.length ? jos.map(lev).join("") : '<p class="ng-lg">Datele noastre nu dau un argument tare aici.</p>'}</div>
        <div><b>Pentru vânzător: ce poate susține prețul mai sus</b>${sus.length ? sus.map(lev).join("") : '<p class="ng-lg">Datele noastre nu dau un argument tare aici.</p>'}</div></div>
        ${mix.length ? `<div><b>Argumente în ambele sensuri</b>${mix.map(lev).join("")}</div>` : ""}</div>
      <div class="ng-sec"><h3>Ce intră în antecontract</h3><ul class="ng-u">
        <li><b>Ce e un antecontract.</b> Promisiunea de a contracta trebuie să conțină toate clauzele fără de care contractul n-ar putea fi executat; la neexecutare ai daune-interese sau, la promisiunea de vânzare, o hotărâre care ține loc de contract, cu prescripție de 6 luni de la data la care contractul trebuia încheiat (Cod civil art. 1.279, 1.669).</li>
        <li><b>Banii dați la semnare.</b> Spune clar ce sunt: arvună (art. 1.544–1.546), clauză penală (art. 1.538) sau avans (art. 1.670: fără stipulație contrară, sumele sunt avans din preț).</li>
        <li><b>Notarea în CF.</b> Antecontractul se poate nota dacă promitentul e titular în CF și antecontractul prevede termenul de încheiere (art. 906): protejează cumpărătorul.</li>
        <li><b>Condiții suspensive.</b> Ce trebuie să se întâmple ca să se încheie contractul: credit aprobat, certificat de urbanism, CF curat, expertiză tehnică. Fiecare cu termen.</li>
        <li><b>Termen și penalități.</b> Data contractului final și ce se întâmplă la întârziere.</li>
        <li><b>Predarea și starea.</b> Ce se predă, în ce stare; ce a văzut cumpărătorul. Vânzătorul garantează evicțiunea și viciile (art. 1.672).</li></ul>
        <div class="ng-tm">Temei: Codul civil (Legea 287/2009), text consolidat la 03.05.2026, copiat în legislatie/texte/L287_2009.txt. Fraza de pe pagină e rezumatul nostru al textului, nu textul.</div></div>
      <p class="ng-lg">Serviciu privat de analiză. Raportul constată fapte; concluziile juridice le semnează doar avocatul partener. Înainte de semnare, antecontractul se citește cu avocatul sau cu notarul.</p>`;
    last = D.id;
  }

  function montaj() {
    const grup = [...document.querySelectorAll("nav .ng")].find(g => g.querySelector('[data-t="surse"]'));
    if (grup && !document.querySelector('nav [data-t="negociere"]')) {
      const g = document.createElement("div"); g.className = "ng";
      g.innerHTML = `<span class="nl">Antecontract</span><button role="tab" data-t="negociere">Negociere</button>`;
      g.querySelector("button").onclick = () => window.showTab("negociere");
      grup.parentNode.insertBefore(g, grup);
    }
    if (!document.getElementById("negociere")) {
      const s = document.createElement("section"); s.id = "negociere"; s.hidden = true; document.querySelector(".wrap").appendChild(s);
    }
    try { EL.negociere = "negociere"; EL_INV.negociere = "negociere"; } catch (e) {}
  }

  let h0Tried = false;
  function deepLink(k) {   // linkul #<id>.<k> poate fi citit de index.html înainte să existe fila; îl reluăm când proprietatea e încărcată
    const h = (window.__H0 || "").replace(/^#/, ""); if (h0Tried || !h.endsWith("." + k) || typeof D === "undefined" || !D) return; h0Tried = true;
    const id = h.slice(0, -(k.length + 1)); if (id !== D.id) location.hash = "#" + h; else if (typeof curTab !== "undefined" && curTab !== k) window.showTab(k);
  }
  function porneste() {
    css(); montaj();
    setInterval(() => { try { montaj(); deepLink('negociere'); { const pr = JSON.stringify(window.RIC_EV_PRET || {}); if (pr !== lastPr) { lastPr = pr; if (typeof D !== 'undefined' && D) randare(); } } if (typeof D !== "undefined" && D && D.id !== last) randare(); } catch (e) { console.warn("negociere", e); } }, 800);
  }
  window.RIC_NEG = { parghii, frici, randare };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
