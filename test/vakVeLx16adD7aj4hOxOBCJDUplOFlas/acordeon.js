/* Raportul Casei v81 - acordeonul (REGULI_V81, 03.11.2026). Cod comun, fără date ale unui set.
   Capitolele existente rămân cum sunt și rămân în .wrap: se așază cu `order` sub cardul lor, iar cele închise stau în afara ecranului, ca hărțile să aibă lățimea reală.
   Nivel 1 = cel mult 2 figuri și 80 de cuvinte pe capitol; restul e nivelul 2, sub „mai mult”, netipărit. Max. 3 butoane pe hartă, lipite sub ea. */
(function () {
  "use strict";
  const CAPS = [
    { t: "Pe scurt", p: "Tot ce contează despre această proprietate, adunat într-un singur loc, dintr-o privire.", s: ["rezumat"] },
    { t: "Riscuri naturale", p: "Cât de expusă e proprietatea la inundații, cutremure, alunecări de teren și aer poluat.", s: ["inundatii", "seismic", "alunecari", "aer"] },
    { t: "Zgomot", p: "Ce se aude aici de la drumuri, cale ferată, aeroport și săli de evenimente.", s: ["zgomot"] },
    { t: "Ce poți construi", p: "Regulile de construire și retragerile pentru această proprietate, din documentațiile de urbanism.", s: ["cadastru", "proprietate", "urbanism"] },
    { t: "Ce s-a construit în jur", p: "Ce s-a autorizat în zonă în ultimii ani și cum arată cartierul din jur.", s: ["autorizatii", "g7_zona", "zonare"] },
    { t: "Acces și transport", p: "Cum ajungi la proprietate și cât de repede ajungi de acolo unde ai nevoie.", s: ["acces_drum", "transport"] },
    { t: "Viața de zi cu zi", p: "Școlile, magazinele și locurile la pas de casă, plus cine sunt vecinii tăi.", s: ["scoli", "facilitati", "populatie"] },
    { t: "Natură și patrimoniu", p: "Monumentele, siturile și ariile protejate din apropierea acestei proprietăți și ce înseamnă ele.", s: ["monumente", "arii_protejate"] },
    { t: "Soare și energie", p: "Câtă lumină primește proprietatea în fiecare lună și câtă energie solară poate produce.", s: ["insorire", "pv"] },
    { t: "Prețul", p: "Cât costă tranzacția până la capăt; evaluarea față de piață e în datele fine.", s: ["costuri", "roi"] },
    { t: "Cronologia locului", p: "Cum s-a schimbat locul de-a lungul anilor, de la primele hărți până acum.", s: ["cronologie"] },
    { t: "De discutat între părți", p: "Ce merită clarificat cu cealaltă parte înainte de semnare.", s: ["negociere"] },
    { t: "🔒 Depth of Market – Level 2", p: "Firmele, actele de urbanism și proiectele din jurul proprietății. Se deschid cu codul.", s: ["g7_sinteza", "g7_cu", "g7_privat", "date_fine_aproape", "g7_juridic", "g7_extras", "g7_istoric", "g7_tehnic", "g7_utilitati", "g7_pug", "proiecte", "g7_proiecte", "evaluare", "g7_preturi", "g7_comercial", "g7_afis"], privat: 1 }
  ];
  const PRIV = new Set();
  /* ce conțin datele fine, lista lui Manu din 02.11.2026; se arată și când modulele nu sunt deschise */
  const CONTINE = ["raportul juridic", "extrasul de informare urbanistică electronică", "istoricul CU și PUZ", "situația tehnică", "utilități, rețele și drumuri autorizate", "PUG vechi și PUG nou", "proiectele care schimbă zona", "evaluarea", "prețul în timp", "anunțurile din zonă", "afișul", "nume și telefoane"];
  const FARA = new Set(["surse", "stare", "builder"]);
  const FIG = "img,svg[role=img],canvas", RAND = ".pzchips,.hm-ch,.g7-ch,.hm-lg,.legend,figcaption,.nt";
  const MAX_CUV = 40; let MAX_FIG = 2;   // în PDF: 3 figuri pe capitol, ca să intre mai multe date (Manu, 06.11.2026)
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const baza = i => 1000 + i * 100;
  let montat = false, deschis = -1, oprit = false, t0 = 0;

  function css() {
    if ($("#acd-css")) return;
    const s = document.createElement("style"); s.id = "acd-css";
    s.textContent = `
body.ac .wrap{display:grid!important;grid-template-columns:minmax(0,1fr)!important;max-width:960px!important;margin:0 auto!important;padding:56px 12px 40px!important;row-gap:10px!important;column-gap:0!important}
body.ac .wrap>*{grid-column:1/-1!important;grid-row:auto!important;min-width:0}
body.ac .wrap>nav#tabs,body.ac #rc-bar,body.ac section.ac-s>.rc-cap{display:none!important}
.ac-card{background:#fff;border:1px solid var(--line,#e2e2e2);border-radius:14px;overflow:hidden}
.ac-h{all:unset;box-sizing:border-box;display:grid;grid-template-columns:240px minmax(0,1fr);width:100%;cursor:pointer;align-items:stretch}
.ac-h:focus-visible{outline:3px solid #b86a00;outline-offset:-3px}
.ac-f{position:relative;overflow:hidden;min-height:135px;background:linear-gradient(135deg,#31405c,#7b8aa6);display:block}
.ac-f img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.ac-t{padding:14px 44px 16px 18px;position:relative;align-self:center}
.ac-t h2{margin:0 0 4px!important;font-size:21px!important;line-height:1.2;color:#1a1a1a!important}
.ac-t p{margin:0;font-size:14.5px;line-height:1.4;color:#3d3d3d}
.ac-t::after{content:"+";position:absolute;right:16px;top:50%;transform:translateY(-50%);font-size:26px;font-weight:600;color:#1a1a1a}
.ac-card.ac-des .ac-t::after{content:"\\2212"}
.ac-b{display:flex;align-items:center;gap:10px;padding:0 14px 12px;min-height:6px;color:#1a1e2a}.ac-b .vb-t{flex:1;min-width:0}.ac-b em{font:700 14px/1 var(--mono);font-style:normal;white-space:nowrap}.ac-b span.c{font-size:13px;white-space:nowrap}.ac-b:empty{padding:0;min-height:0}
#ac-mod{display:inline-flex;border:2px solid #1a1a1a;border-radius:999px;overflow:hidden;background:#fff}#ac-mod button{all:unset;cursor:pointer;padding:6px 14px;font-weight:600;font-size:14px;color:#1a1a1a}#ac-mod button[aria-pressed="true"]{background:#1a1a1a;color:#fff}
#ac-bar [data-a="rez"],#ac-bar [data-a="rap"]{display:none!important}
.ac-card.ac-ult{box-shadow:inset 6px 0 0 #2457c5;transition:box-shadow 3s linear}.ac-card.ac-ult.ac-stins{box-shadow:inset 0 0 0 #2457c5}
.ac-card.ac-clip{animation:ac-clip 1s ease-in-out 3}@keyframes ac-clip{50%{background:#dfe8ff}}
body.ac:not(.ac-gata):not(.ac-cerere) #cc-sf,body.ac:not(.ac-gata) #ac-bar [data-a="pdf"]{display:none!important}
body.ac:not(.ac-cl) #cl-final{position:fixed!important;left:-99999px!important;top:0;width:936px;visibility:hidden}
.ac-mai.ac-sus{position:sticky;bottom:8px;z-index:4;background:#174f94;color:#fff}
.cc-scor{background:#fff;border:1px solid var(--line,#e2e2e2);border-radius:12px;padding:12px 14px;margin:0 0 12px;color:#1a1e2a}.cc-scor b.t{display:block;margin-bottom:12px;font-size:15px}.cc-scor .canal{position:relative;height:18px;border:2px solid #1a1e2a;border-radius:4px;background:repeating-linear-gradient(90deg,transparent 0 calc(10% - 1px),rgba(26,30,42,.55) calc(10% - 1px) 10%),linear-gradient(90deg,#c62828 0 33%,#e07b00 33% 67%,#1f8a4c 67% 100%)}.cc-scor .m{position:absolute;top:-22px;transform:translateX(-50%);font:700 12px/1 var(--mono);white-space:nowrap}.cc-scor .m::after{content:"";display:block;margin:2px auto 0;width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #1a1e2a}.cc-scor p{margin:8px 0 0;font-size:14px}.cc-scor{padding-top:14px}.cc-scor .canal{margin-top:26px}
.ac-card.ac-des .ac-h{grid-template-columns:96px minmax(0,1fr)}.ac-card.ac-des .ac-f{min-height:72px}
.ac-card.ac-gol .ac-h{cursor:default}.ac-card.ac-gol .ac-t::after{content:""}.ac-card.ac-gol .ac-t p{font-style:italic}
section.ac-s.ac-asc{position:fixed!important;left:-99999px!important;top:0!important;width:min(936px,calc(100vw - 24px))!important;visibility:hidden!important;pointer-events:none}
section.ac-s{display:block!important;padding:4px 0 14px!important}
section.ac-s[hidden]{display:none!important}
section.ac-s.ac-lung.ac-flat{display:contents!important}section.ac-s.ac-flat>*{grid-column:1/-1;min-width:0}.ac-ct{font:700 12px/1.3 var(--font);letter-spacing:.08em;text-transform:uppercase;color:#4a5063;border-top:1px solid #d9d6cf;padding-top:10px;margin-top:8px!important}section.ac-s:not(.ac-flat)>.ac-ct{display:none}
section.ac-s:not(.ac-lung).ac-n2,section.ac-s:not(.ac-lung) .ac-n2{display:none!important}
section.ac-s>*+*{margin-top:12px}
section.ac-s .hero.hx{position:static!important;top:auto!important;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;display:block!important;background:none!important;box-shadow:none!important;border:0!important;overflow:visible!important}
section.ac-s .hero.hx .hg-ph{position:static!important;display:block!important;height:auto!important;min-height:0!important;max-height:none!important;aspect-ratio:auto!important;background:none!important;overflow:visible!important;margin:0!important}
section.ac-s .hero.hx .hg-ph>img{display:none!important}
section.ac-s .hero.hx .hg-ov{position:static!important;background:none!important;padding:0!important;inset:auto!important;transform:none!important}
section.ac-s .hero.hx h2{color:#1a1a1a!important;background:none!important;text-shadow:none!important;font-size:18px!important;margin:0 0 6px!important}
section.ac-s .hero.hx .hx-k{position:static!important;inset:auto!important;width:auto!important;max-width:none!important;background:#f6f5f2!important;box-shadow:none!important;border-radius:10px;padding:10px 12px!important;backdrop-filter:none!important;margin:0!important}
section.ac-s .hx-g{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:8px 14px!important}
.hm-ch,.g7-ch,.pzchips{position:static!important;top:auto!important;bottom:auto!important;box-shadow:none!important}
section.ac-s .h79 figure{display:block!important;height:auto!important;aspect-ratio:auto!important}
.ac-subh{all:unset;box-sizing:border-box;display:none;width:100%;padding:11px 14px;background:#fff;border:1px solid #d9d5c9;border-radius:10px;font-weight:600;font-size:15px;color:#1a1a1a;cursor:pointer}.ac-subh.ac-vad{display:block}.ac-subh[hidden]{display:none!important}.ac-subh::after{content:"+";float:right;font-size:18px;line-height:1}.ac-subh.on::after{content:"\\2212"}.ac-subh:focus-visible{outline:3px solid #b86a00}
section.ac-s.ac-sub:not(.ac-sub-on){position:fixed!important;left:-99999px!important;top:0!important;width:min(936px,calc(100vw - 24px))!important;visibility:hidden!important;pointer-events:none}
.ac-pr ul{margin:6px 0 12px;padding:0;list-style:none;columns:2;font-size:14px}.ac-pr li{break-inside:avoid;padding:2px 0}
.ac-mai{all:unset;box-sizing:border-box;display:none;width:100%;text-align:center;padding:12px;border-radius:10px;background:#1d5fb0;border:1px solid #174f94;font-weight:700;font-size:15px;color:#fff;cursor:pointer;box-shadow:0 2px 8px -2px rgba(29,95,176,.55)}
.ac-mai:hover,.ac-mai:focus-visible{background:#174f94}
.ac-mai.ac-vad{display:block}
#ac-cap{position:fixed;left:12px;top:10px;z-index:9000;background:#1a1a1a;color:#fff;border:0;border-radius:999px;padding:9px 16px;font:600 14px/1.2 inherit;cursor:pointer}
#ac-lista{position:fixed;left:12px;top:50px;z-index:9000;background:#fff;border:1px solid #cfcabd;border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.22);padding:6px;width:min(320px,calc(100vw - 24px));max-height:calc(100vh - 66px);overflow:auto;display:none}
#ac-lista.on{display:block}
#ac-lista button{all:unset;box-sizing:border-box;display:flex;gap:9px;align-items:center;width:100%;padding:9px 10px;border-radius:8px;cursor:pointer;font-size:14.5px;color:#1a1a1a}
#ac-lista button:hover,#ac-lista button:focus-visible{background:#f1efe9}
#ac-lista i{width:10px;height:10px;border-radius:50%;background:#c9c9c9;flex:none}#ac-lista i.g{background:#1f8a4c}#ac-lista i.o{background:#e07b00}#ac-lista i.r{background:#c62828}
.ac-pr{padding:4px 0 14px}.ac-pr table{width:100%;table-layout:fixed;border-collapse:collapse;font-size:14px;overflow-wrap:anywhere}.ac-pr td,.ac-pr th{padding:7px 8px;border-bottom:1px solid #e6e3da;text-align:left;vertical-align:top}.ac-pr th{font-size:12px;color:#555}
.ac-pr .bl{filter:blur(4px);user-select:none}.ac-pr table{min-width:560px}.ac-pr td{word-break:normal;overflow-wrap:normal}.ac-pr-btn{all:unset;display:inline-block;margin-top:12px;padding:11px 18px;border-radius:999px;background:#a85707;color:#fff;font-weight:600;cursor:pointer}
@media (max-width:700px){
 .ac-h,.ac-card.ac-des .ac-h{grid-template-columns:minmax(0,1fr)}
 .ac-f{min-height:0;aspect-ratio:16/9}.ac-card.ac-des .ac-f{display:none}
 section.ac-s .hx-g{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 body.ac .wrap{padding:54px 10px 30px!important}
 .ac-t h2{font-size:19px!important}
}
@media print{
 #ac-cap,#ac-lista,.ac-mai,.ac-t::after,.ac-pr-btn{display:none!important}
 body.ac .wrap{display:flex!important;flex-direction:column!important;padding:0!important;max-width:none!important}
 body.ac .wrap>*{width:100%!important;flex:none!important}
 section.ac-s.ac-asc{position:static!important;visibility:visible!important;width:auto!important;left:auto!important}
 section.ac-s.ac-n2,section.ac-s .ac-n2,.ac-card.ac-gol,.ac-card.ac-pv,.ac-pr,.ac-subh,section.ac-s.ac-sub,#cc-sf{display:none!important}
 body.ac .wrap>.ac-card{display:block!important;break-inside:avoid;break-after:avoid;border:0;border-bottom:2px solid #1a1a1a;border-radius:0;margin-top:0;break-before:page}
 body.ac .wrap>.ac-card[data-c="0"]{break-before:auto}
 body.ac .wrap>.ac-card.ac-gol,body.ac .wrap>.ac-card.ac-pv{display:none!important}
 body.ac .wrap>.ac-card .ac-f{min-height:24mm}
 section.ac-s .hm-box,section.ac-s .pz,section.ac-s figure,section.ac-s .ch>svg,section.ac-s .box{max-width:125mm!important;margin-left:auto!important;margin-right:auto!important;break-inside:avoid}
 section.ac-s *{break-before:auto!important;break-after:auto!important}
 section.ac-s .hero.hx{break-after:avoid!important}
 body.ac .ac-card .ac-h,body.ac .ac-card.ac-des .ac-h{display:grid!important;visibility:visible!important;grid-template-columns:42mm minmax(0,1fr)!important}body.ac .ac-card .ac-f{display:block!important}
 body.ac .wrap>section[id],body.ac .wrap>section[id]:not(:first-of-type){break-before:auto!important;break-after:auto!important;margin:0!important;padding:0 0 4mm!important}
}`;
    document.head.appendChild(s);
  }

  function setare(el, ord) { el.style.setProperty("order", String(ord), "important"); }
  function sectiuni(c) { return c.s.map(id => document.getElementById(id)).filter(s => s && !s.hidden && s.dataset.acAre === "1"); }
  function areContinut(s) { return s.innerText !== undefined && (s.querySelectorAll(FIG).length > 0 || (s.textContent || "").trim().length > 40); }

  function monteaza() {
    css(); montat = true; document.body.classList.add("ac"); t0 = Date.now();
    const W = $(".wrap");
    CAPS.forEach((c, i) => {
      const d = document.createElement("div"); d.className = "ac-card" + (c.privat ? " ac-pv" : ""); d.dataset.c = i;
      d.innerHTML = `<button type="button" class="ac-h" aria-expanded="false"><span class="ac-f"></span><span class="ac-t"><h2>${esc(c.t)}</h2><p>${esc(c.p)}</p></span></button><span class="ac-b"></span>`;
      setare(d, baza(i)); W.appendChild(d); c.el = d;
      d.querySelector(".ac-h").onclick = () => comuta(i);
      const m = document.createElement("button"); m.type = "button"; m.className = "ac-mai"; m.textContent = "mai mult"; setare(m, baza(i) + 98);
      m.onclick = () => lung(i); W.appendChild(m); c.mai = m;
    });
    const f = $("#cl-final"), p = $("#rep-foot-p"); if (f) setare(f, baza(0) + 90); if (p) setare(p, 10000);
    const b = document.createElement("button"); b.id = "ac-cap"; b.type = "button"; b.textContent = "☰ capitole";
    const l = document.createElement("div"); l.id = "ac-lista";
    document.body.append(b, l);
    b.onclick = e => { e.stopPropagation(); lista(); l.classList.toggle("on"); };
    document.addEventListener("click", e => { if (!e.target.closest("#ac-lista")) l.classList.remove("on"); });
    try { history.scrollRestoration = "manual"; } catch (e) {}   // închiderea alege singură unde derulează; browserul nu trebuie să sară înapoi
    addEventListener("popstate", () => { if (deschis >= 0) inchide(false); });
    addEventListener("beforeprint", laPrint); addEventListener("afterprint", dupaPrint);
    mostra();
    /* linkurile vechi spre capitole (semafor, referințe, adrese cu #) deschid cardul, nu schimbă pagina */
    window.showTab = t => { const i = CAPS.findIndex(c => c.s.includes(t)); if (i < 0 || t === "rezumat") return; if (tot) toate(false); if (deschis !== i) deschide(i, true); const s = document.getElementById(t); if (CAPS[i].privat && s && s._acR && !s.classList.contains("ac-sub-on")) s._acR.click(); if (s && s.getClientRects().length) { s.scrollIntoView({ block: "start" }); scrollBy(0, -56); } mod(); };
    aseaza(); comutator(); parcurs();
  }
  /* Cuprins = capitolele închise · Raport = toate deschise, fără acordeon · Rezumat = „Pe scurt” */
  let tot = false;
  function comutator() {
    const bar = $("#ac-bar"); if (!bar || $("#ac-mod")) return;
    const m = document.createElement("span"); m.id = "ac-mod"; m.setAttribute("role", "group"); m.setAttribute("aria-label", "ce vezi");
    m.innerHTML = ["Cuprins", "Raport", "Rezumat"].map(t => `<button type="button" data-m="${t}" aria-pressed="false">${t}</button>`).join("");
    bar.prepend(m);
    m.onclick = e => { const t = e.target.closest("button")?.dataset.m; if (!t) return; if (t === "Raport") toate(true); else { toate(false); if (t === "Cuprins") { if (deschis >= 0) { stare(deschis, false); deschis = -1; } scrollTo(0, 0); } else deschide(0, true); } mod(); };
    mod();
  }
  function toate(on) { tot = on; parcurs(); CAPS.forEach((c, i) => { if (on && !c.el.classList.contains("ac-gol")) { sectiuni(c).forEach(s => s.classList.remove("ac-asc")); nivel(c); c.mai.classList.toggle("ac-vad", !!c.are2); c.el.classList.add("ac-des"); if (c.pr) c.pr.style.display = ""; } else if (!on && i !== deschis) stare(i, false); }); if (on) { deschis = -1; scrollTo(0, 0); } dispatchEvent(new Event("resize")); }
  function mod() { const a = tot ? "Raport" : deschis === 0 ? "Rezumat" : "Cuprins"; $$("#ac-mod button").forEach(b => b.setAttribute("aria-pressed", b.dataset.m === a)); }

  /* leagă capitolele existente de card; ce nu are loc într-un card intră la nivelul 2 din „Pe scurt”, ca să nu se piardă nimic */
  function aseaza() {
    const toate = $$(".wrap>section[id]").filter(s => !FARA.has(s.id));
    const stiut = new Set(CAPS.flatMap(c => c.s));
    toate.forEach(s => { if (!stiut.has(s.id)) { CAPS[0].s.push(s.id); stiut.add(s.id); PRIV.add(s.id); } });
    CAPS.forEach((c, i) => {
      c.s.forEach((id, k) => { const s = document.getElementById(id); if (!s) return;
        s.classList.add("ac-s"); s.dataset.acAre = (!s.hidden && areContinut(s)) ? "1" : "0"; if (!(c.mai && c.mai.dataset.on)) setare(s, baza(i) + 3 + 2 * k);
        if (c.privat && s.dataset.acAre === "1") randPliat(c, s, baza(i) + 2 + 2 * k);
        const eD = i === deschis || tot; s.classList.toggle("ac-asc", !eD);
      });
      const S = sectiuni(c), gol = !S.length && !c.privat;
      c.el.classList.toggle("ac-gol", gol);
      c.el.querySelector(".ac-t p").textContent = gol ? "Nu avem date pentru această proprietate." : propozitie(c, S);
      const pc = S.flatMap(s => $$(".vb[data-pct]", s).map(v => +v.dataset.pct)), pct = pc.length ? Math.min(...pc) : null, col = pct == null ? "" : pct >= 67 ? "g" : pct >= 34 ? "o" : "r"; c.col = col; c.pct = pct;
      const bn = c.el.querySelector(".ac-b"); if (bn.dataset.pct !== String(pct)) { bn.dataset.pct = pct; bn.innerHTML = pct == null ? "" : `<span class="vb-t"><i style="left:${pct}%"></i></span><em>${pct} %</em><span class="c">${col === "g" ? "bine" : col === "o" ? "de verificat" : "atenție"}</span>`; }
      const ph = S.map(s => $(".hero img", s)).find(Boolean), f = c.el.querySelector(".ac-f");
      const src = ph ? ph.src.replace(/(\/g\/\d+)\.webp/, "$1_t.webp") : "deschidere.jpg";
      if (f.dataset.src !== src) { f.dataset.src = src; f.innerHTML = `<img src="${esc(src)}" alt="" loading="lazy" onerror="if(this.src.includes('_t.webp'))this.src=this.src.replace('_t.webp','.webp');else if(!this.dataset.r){this.dataset.r=1;const u=this.src;setTimeout(()=>{this.src=u+'?r=1'},2500)}">`; }
    });
  }
  /* în datele fine fiecare modul e un rând care se deschide și se închide; formularul de PIN rămâne la vedere */
  function randPliat(c, s, ord) {
    if (s.querySelector(".g7-code")) { s.classList.remove("ac-sub", "ac-sub-on"); if (s._acR) s._acR.hidden = true; return; }
    if (s._acR) s._acR.hidden = false;
    s.classList.add("ac-sub");
    if (s._acR) return;
    const r = document.createElement("button"); r.type = "button"; r.className = "ac-subh"; r.textContent = ((s.querySelector("h2") || {}).textContent || s.id).replace(/^🔒\s*/, "").trim(); setare(r, ord);
    r.onclick = () => { window.CC_LENES && window.CC_LENES.arata(s); const on = s.classList.toggle("ac-sub-on"); r.classList.toggle("on", on); dispatchEvent(new Event("resize")); if (on && window.CC_PLASARE) window.CC_PLASARE.tot(s); };
    s._acR = r; $(".wrap").appendChild(r);
  }
  function culoare(S) {
    const v = S.flatMap(s => $$(".verd", s).map(x => x.classList.contains("r") ? "r" : x.classList.contains("o") ? "o" : x.classList.contains("g") ? "g" : ""));
    return v.includes("r") ? "r" : v.includes("o") ? "o" : v.includes("g") ? "g" : "";
  }
  function propozitie(c, S) {
    if (c.privat) return c.p;
    const col = culoare(S), v = col && S.flatMap(s => $$(".verd." + col, s))[0];
    const et = v && v.closest("section") && $(".hx-vd", v.closest("section")), tt = v ? (v.textContent || "").replace(/\s+/g, " ").trim() : "";
    const t = (et && tt.startsWith(et.textContent.trim()) ? tt.slice(et.textContent.trim().length).trim() : tt).split(/(?<=[.!?])\s/)[0];
    const n = t.split(" ").length;
    return n >= 6 && n <= 24 ? t : c.p;
  }

  const lat = e => e.getBoundingClientRect().width;
  /* o figură = o hartă întreagă: straturile suprapuse din aceeași figură se numără o singură dată */
  const nrFig = el => new Set([...(el.matches(FIG) ? [el] : []), ...$$(FIG, el)].filter(e => lat(e) >= 200 && !e.closest(".hero")).map(e => e.closest("figure,.hm-box,.pz,.ch") || e)).size;
  const cuv = el => (el.textContent || "").trim().split(/\s+/).filter(Boolean).length;
  const vizibil = el => el.getClientRects().length > 0;

  /* nivelul 1 / nivelul 2: se recalculează la deschidere și la tipărire; rezultatul depinde doar de structură */
  function nivel(c) {
    if (c._hoist && c._hoist.length) puneLaLoc(c);
    if (c.privat) { c.are2 = false; return; }
    MAX_FIG = document.body.classList.contains("cc-pdf") ? 3 : 2;
    const S = sectiuni(c); S.forEach(s => window.CC_LENES && window.CC_LENES.arata(s)); let fig = 0, rest = MAX_CUV, peSect = 0, maxSect = MAX_FIG;
    /* din prima, figurile secțiunilor cu cel mai mic scor: ce e important pentru client, nu ce e primul în pagină */
    const scorS = s => { const v = s.querySelector(".vb[data-pct]"); return v ? +v.dataset.pct : 50; }, rang = S.map((s, k) => [scorS(s), k, s]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, MAX_FIG).map(x => x[2]);
    S.forEach(s => { s.classList.remove("ac-n2"); $$(".ac-n2", s).forEach(x => x.classList.remove("ac-n2", "ac-n2b")); });
    function umbla(p) {
      [...p.children].forEach(el => {
        if (!vizibil(el) || el.matches(".rc-cap,.ac-pr,.ov")) return;
        if (el.matches(".ac-k1")) return;                                      // v82.10.0: element marcat de modul „rămâne din prima” (balanța argumentelor), nu intră în limita de cuvinte/figuri
        if (el.matches(".ac-d2")) { el.classList.add("ac-n2"); return; }        // v82.10.0: element marcat de modul „la mai mult” (fricile, antecontractul)
        if (el.matches(".hero,.verd,.vh,.cards,.hx-k,.g7-sint,.g7-k,.g7-ord,h1,h2,.rc")) return;   // calculatorul de costuri rămâne întreg, cu bifele și calculele (Manu, 06.11.2026)
        if (el.matches(RAND)) return;
        /* listele lungi de evenimente (cronologia): primele 4 din prima, restul la „mai mult” (Manu, 06.11.2026) */
        if (el.matches(".cr-l")) { $$(":scope > .cr-e", el).forEach((c, k) => { if (k >= (document.body.classList.contains("cc-pdf") ? 12 : 4)) c.classList.add("ac-n2"); }); return; }
        if (el.matches(".cr-w")) { umbla(el); return; }
        const f = nrFig(el), w = cuv(el);
        if (f === 0) {
          if (el.matches("table,.scroll,details") || el.querySelector(":scope > table")) { el.classList.add("ac-n2"); return; }
          if (w <= rest) { rest -= w; return; }
          /* un rând de text nu se taie niciodată în bucăți: ori rămâne întreg, ori trece întreg la „mai mult” */
          const rand = el.children.length > 0 && [...el.children].every(c => /^(SPAN|B|I|EM|SMALL|A|STRONG|LABEL|INPUT|BUTTON)$/.test(c.tagName));
          if (el.children.length > 1 && !rand && !el.matches("table,.scroll,ul,ol")) { umbla(el); return; }
          el.classList.add("ac-n2"); return;
        }
        const compact = w <= rest + 40 || el.children.length < 2 || el.matches("svg,figure,.hm-box,.pz");
        if (fig + f <= MAX_FIG && peSect + f <= maxSect && compact) { fig += f; peSect += f; rest -= Math.min(w, 30); return; }
        if (fig + f <= MAX_FIG && peSect + f <= maxSect) { umbla(el); return; }
        if (fig >= MAX_FIG || peSect >= maxSect || el.children.length < 2 || el.matches("svg,figure,.hm-box,.pz")) { el.classList.add("ac-n2"); return; }
        umbla(el);
      });
    }
    S.forEach(s => { peSect = 0; maxSect = S.length === 1 ? MAX_FIG : rang.includes(s) ? 1 : 0; if (PRIV.has(s.id) || (s.id === "g7_privat" && !s.querySelector(".g7-code"))) { s.classList.add("ac-n2"); return; } umbla(s); });
    S.forEach(s => {
      $$(RAND, s).forEach(r => { if (r.closest(".ac-n2,.ov")) return; const p = r.parentElement; if ($$(FIG, p).some(e => !e.closest(".ac-n2") && lat(e) >= 200)) return; if (r.querySelector("button,input")) r.classList.add("ac-n2"); });
    });
    const are = S.some(s => s.classList.contains("ac-n2") || s.querySelector(".ac-n2"));
    c.are2 = are; c.mai.classList.toggle("ac-vad", are && CAPS.indexOf(c) === deschis);
    S.forEach(s => { $$("h3", s).forEach(h => { const u = h.nextElementSibling; if (!h.closest(".ac-n2") && !h.classList.contains("ac-n2") && u && !vizibil(u)) h.classList.add("ac-n2"); }); });
    S.forEach(s => { $$("div", s).reverse().forEach(b => { if (b.closest(".ov,.hero,.ac-k1")) return;   /* v82.10.0: nici părțile din interiorul unui element ac-k1 (segmentele barei de ore, cu text ascuns) nu se marchează „goale” */ if (!vizibil(b) || b.classList.contains("ac-n2")) return; const are = (b.innerText || "").trim() || [...b.querySelectorAll(FIG + ",input,iframe,button")].some(vizibil); if (!are) b.classList.add("ac-n2"); }); });
    S.forEach(s => window.CC_PLASARE && window.CC_PLASARE.tot(s));
    try { window.CC_CONTRAST && window.CC_CONTRAST(); } catch (e) {}
  }

  function comuta(i) { if (CAPS[i].el.classList.contains("ac-gol")) return; if (tot) toate(false), mod(); if (deschis === i) inchide(true); else deschide(i, true); }
  function deschide(i, ist) {
    const era = deschis;
    if (era >= 0) stare(era, false);
    deschis = i; stare(i, true);
    nivel(CAPS[i]);
    if (ist) { if (era >= 0) history.replaceState({ ac: i }, ""); else history.pushState({ ac: i }, ""); }
    CAPS[i].el.scrollIntoView({ block: "start" }); scrollBy(0, -56);
    dispatchEvent(new Event("resize")); mod();
  }
  function inchide(ist, spreUrm) {
    const i = deschis; if (i < 0) return;
    stare(i, false); deschis = -1;
    if (ist && history.state && history.state.ac !== undefined) history.back();
    const tinta = (spreUrm && CAPS.slice(i + 1).find(c => !c.el.classList.contains("ac-gol"))) || CAPS[i];
    tinta.el.scrollIntoView({ block: "start" }); scrollBy(0, -56);
    urmatorul(i); mod();
  }
  /* ultimul capitol văzut: bandă albastră care se stinge în 3 s; în aceleași 3 s clipește următorul */
  function urmatorul(i) {
    $$(".ac-ult,.ac-clip").forEach(e => e.classList.remove("ac-ult", "ac-stins", "ac-clip"));
    const u = CAPS[i].el; u.classList.add("ac-ult"); void u.offsetWidth; u.classList.add("ac-stins");
    const n = CAPS.slice(i + 1).find(c => !c.el.classList.contains("ac-gol")); if (n) n.el.classList.add("ac-clip");
    setTimeout(() => { u.classList.remove("ac-ult", "ac-stins"); if (n) n.el.classList.remove("ac-clip"); }, 3100);
  }
  /* „pdf și cereri” apar abia după ce s-au deschis toate capitolele; butonul de comandă le arată și mai devreme */
  const CHEIE = () => "cc-parcurs:" + (typeof D !== "undefined" && D ? D.id : "");
  function parcurs(i) { let v = []; try { v = JSON.parse(sessionStorage.getItem(CHEIE())) || []; } catch (e) {} if (i != null && !v.includes(i)) { v.push(i); try { sessionStorage.setItem(CHEIE(), JSON.stringify(v)); } catch (e) {} }
    const gata = tot || CAPS.every((c, k) => c.privat || (c.el && c.el.classList.contains("ac-gol")) || v.includes(k))   /* v82.10.0: pe rețea lentă un capitol poate să nu aibă încă cardul */; document.body.classList.toggle("ac-gata", gata); }
  function stare(i, on) {
    if (on) parcurs(i);
    const c = CAPS[i]; c.el.classList.toggle("ac-des", on); c.el.querySelector(".ac-h").setAttribute("aria-expanded", on);
    if (!on && c.mai.dataset.on) plat(i, false);
    sectiuni(c).forEach(s => { s.classList.toggle("ac-asc", !on); if (!on) s.classList.remove("ac-lung"); });
    if (c.pr) c.pr.style.display = on ? "" : "none";
    if (c.privat) c.s.forEach(id => { const x = document.getElementById(id); if (x && x._acR) x._acR.classList.toggle("ac-vad", on); });
    if (!on) { delete c.mai.dataset.on; c.mai.classList.remove("ac-sus"); if (i === 0) document.body.classList.remove("ac-cl"); }
    c.mai.textContent = "mai mult"; c.mai.classList.toggle("ac-vad", on && !!c.are2);
  }
  /* „mai mult” = continuarea capitolului, dedesubt (Manu, 06.11.2026): ce era deja citit rămâne pe loc, butonul rămâne unde era pe ecran,
     iar părțile de nivel 2 ale tuturor secțiunilor se așază sub el. Secțiunea devine display:contents doar cât e deschisă continuarea.
     „mai puțin” strânge doar continuarea; capitolul rămâne deschis. */
  /* v82.10.1 (Manu, 09.11.2026): „mai mult” extinde doar dedesubt. Ce era vizibil înainte rămâne exact unde era (aceleași margini ca în secțiunea neaplatizată),
     iar piesele ascunse care stau în interiorul unor elemente vizibile se mută, cât ține „mai mult”, direct în secțiune (după buton, prin order), cu un semn în locul lor; „mai puțin” le pune la loc. */
  function ridica(c) {
    c._hoist = [];
    c.s.forEach(id => { const s = document.getElementById(id); if (!s) return;
      $$(".ac-n2", s).forEach(x => { const p = x.parentElement; if (!p || p === s || p.closest(".ac-n2")) return;
        if (!p.getClientRects().length && getComputedStyle(p).display !== "contents") return;          // părinte ascuns din alt motiv (ex. client): nu se scoate la vedere
        const ph = document.createComment("ac-ph"); p.insertBefore(ph, x); s.appendChild(x); c._hoist.push([x, ph]); }); });
  }
  function puneLaLoc(c) {
    if (c._hoist && c._hoist.length) c._hoist.forEach(([x, ph]) => { if (ph.parentNode) { ph.parentNode.insertBefore(x, ph); ph.remove(); } });
    c._hoist = [];
  }
  function margini(c, on) {
    c.s.forEach(id => { const s = document.getElementById(id); if (!s) return;
      [...s.children].forEach(ch => { if (ch._acM) { ch.style.removeProperty("margin-top"); ch.style.removeProperty("margin-bottom"); delete ch._acM; } });
      if (!on) return;
      const k = [...s.children].filter(ch => !ch.classList.contains("ac-ct")), v = k.filter(ch => !ch.classList.contains("ac-n2") && ch.getClientRects().length);
      v.forEach((ch, j) => { const idx = k.indexOf(ch); ch._acM = 1;
        const gap = parseFloat(getComputedStyle(s.parentElement).rowGap) || 0;     // în .wrap elementele aplatizate primesc și gap-ul dintre elemente, pe care înainte îl avea doar între secțiuni
        ch.style.setProperty("margin-top", ((idx > 0 ? 12 : 0) + (j === 0 ? 4 : -gap)) + "px", "important");     // exact ca înainte: section>*+*{12px} + padding-top 4px
        if (j === v.length - 1) ch.style.setProperty("margin-bottom", "14px", "important"); });                // padding-bottom 14px al secțiunii
    });
  }
  /* poziția absolută a fiecărui element de nivel 1 vizibil, ca să se poată verifica și corecta după aplatizare */
  function pozitii(c) {
    const m = new Map();
    c.s.forEach(id => { const s = document.getElementById(id); if (!s) return;
      [...s.children].forEach(ch => { if (!ch.classList.contains("ac-n2") && !ch.classList.contains("ac-ct") && ch.getClientRects().length) m.set(ch, ch.getBoundingClientRect().top + scrollY); }); });
    return m;
  }
  /* după aplatizare, orice abatere de la poziția dinainte se scade din marginea de sus a elementului (și a celor de după), ca partea de deasupra butonului să nu se miște */
  function corecteaza(c) {
    if (!c._top0) return;
    const L = [...c._top0.keys()].filter(e => e.isConnected && e.getClientRects().length).map(e => [e, e.getBoundingClientRect().top + scrollY]).sort((a, b) => a[1] - b[1]);
    let acc = 0;
    L.forEach(([e, t]) => { const d = (t - acc) - c._top0.get(e);
      if (Math.abs(d) > .4) { const mt = parseFloat(getComputedStyle(e).marginTop) || 0; e.style.setProperty("margin-top", (mt - d) + "px", "important"); e._acM = 1; acc += d; } });
    const dm = c.mai.getBoundingClientRect().top + scrollY - c._mai0;      // și butonul rămâne exact unde era
    if (Math.abs(dm) > .4) c.mai.style.setProperty("margin-top", ((parseFloat(getComputedStyle(c.mai).marginTop) || 0) - dm) + "px", "important");
  }
  function plat(i, on) {
    const c = CAPS[i];
    if (on) { c._top0 = pozitii(c); c._mai0 = c.mai.getBoundingClientRect().top + scrollY; margini(c, true); ridica(c); } else { puneLaLoc(c); margini(c, false); delete c._top0; c.mai.style.removeProperty("margin-top"); }
    c.s.forEach((id, k) => { const s = document.getElementById(id); if (!s) return;
      if (on && s.classList.contains("ac-n2")) { setare(s, baza(i) + 60 + 2 * k); return; }
      setare(s, baza(i) + 3 + 2 * k); s.classList.toggle("ac-flat", on);
      /* în continuare, partea fiecărei secțiuni are titlul ei mic, ca să se știe despre ce e */
      let ct = s.querySelector(":scope > .ac-ct");
      if (on && s.querySelector(":scope > .ac-n2") && c.s.length > 1) { if (!ct) { ct = document.createElement("div"); ct.className = "ac-ct"; ct.textContent = ((s.querySelector(".hero h2, h2") || {}).textContent || "").replace(/^🔒\s*/, "").trim(); s.prepend(ct); } }
      else if (ct) ct.remove();
      [...s.children].forEach(ch => { if (on) setare(ch, baza(i) + (ch.classList.contains("ac-n2") || ch.classList.contains("ac-ct") ? 60 : 3) + 2 * k); else ch.style.removeProperty("order"); });
    });
    setare(c.mai, baza(i) + (on ? 50 : 98));
  }
  function lung(i) {
    const c = CAPS[i], on = !c.mai.dataset.on, y0 = c.mai.getBoundingClientRect().top;
    if (!on) {
      delete c.mai.dataset.on; sectiuni(c).forEach(s => s.classList.remove("ac-lung")); plat(i, false); c.mai.classList.remove("ac-sus"); document.body.classList.remove("ac-cl");
      c.mai.textContent = "mai mult"; if (c.mai.getClientRects().length) scrollBy(0, c.mai.getBoundingClientRect().top - y0);
      dispatchEvent(new Event("resize")); return;
    }
    c.mai.dataset.on = "1"; plat(i, true);
    if (i === 0) document.body.classList.add("ac-cl");   /* după măsurarea pozițiilor: blocul final al clientului apare sub buton */
    sectiuni(c).forEach(s => { s.classList.add("ac-lung"); if (window.CC_LENES) window.CC_LENES.arata(s); if (window.CC_PLASARE) window.CC_PLASARE.tot(s); });
    corecteaza(c);
    /* v82.10.0: ce apare la „mai mult” trebuie să se încarce efectiv (imagini cu data-lz / data-lzh, inclusiv straturile hărților create după deschidere) */
    setTimeout(() => { if (window.CC_LENES && c.mai.dataset.on) sectiuni(c).forEach(s => window.CC_LENES.arata(s)); }, 900);
    c.mai.textContent = "mai puțin";
    scrollBy(0, c.mai.getBoundingClientRect().top - y0);
    c.mai.classList.add("ac-sus");
    dispatchEvent(new Event("resize"));
  }
  function lista() {
    const l = $("#ac-lista");
    l.innerHTML = CAPS.map((c, i) => `<button type="button" data-i="${i}"${c.el.classList.contains("ac-gol") ? ' style="opacity:.55"' : ""}><i class="${c.col || ""}"></i>${esc(c.t)}</button>`).join("") + (document.body.classList.contains("ac-gata") ? `<button type="button" data-i="-1"><i></i>pdf și cereri</button>` : "");
    $$("button", l).forEach(b => b.onclick = () => { l.classList.remove("on"); const i = +b.dataset.i; if (i < 0) { $("#cc-sf")?.scrollIntoView({ block: "start" }); return; } if (deschis !== i && !CAPS[i].el.classList.contains("ac-gol")) deschide(i, true); });
  }

  /* modulul privat: 3 elemente complete, restul mascate din fișierul generat la publicare; aici nu ajung datele întregi */
  async function mostra() {
    const c = CAPS[CAPS.length - 1]; let j = null;
    try { const r = await fetch(`p/${encodeURIComponent(D.id)}/privat_mostra.json`); if (r.ok) j = await r.json(); } catch (e) {}
    const d = document.createElement("div"); d.className = "ac-pr"; d.style.display = "none"; setare(d, baza(CAPS.length - 1) + 1); c.pr = d;
    const bl = s => s ? `<span class="bl">${esc(s)}</span>` : "";
    /* nu scriem ce conțin sau pot conține datele fine; „contacte”, nu „nume și telefoane” (Manu, 06.11.2026) */
    d.innerHTML = (j && j.randuri && j.randuri.length ? `<p>${esc(j.total)} de anunțuri în zonă. Trei sunt complete, restul se deschid la comandă.</p><button type="button" class="ac-pr-btn">Comand DOM</button><div class="scroll" style="margin-top:12px"><table><tr><th>anunț</th><th>preț</th><th>€/mp</th><th>contact</th></tr>${j.randuri.map(r => `<tr><td>${esc(r.titlu)}${bl(r.titlu_m)}</td><td>${esc(r.pret)}</td><td>${esc(r.eur_mp || "—")}</td><td>${esc(r.nume)}${bl(r.nume_m)} ${esc(r.tel)}${bl(r.tel_m)}</td></tr>`).join("")}</table></div>` : `<p>Datele fine se pregătesc la comandă pentru această proprietate.</p><button type="button" class="ac-pr-btn">Comand DOM</button>`)
      ;
    d.querySelector(".ac-pr-btn").onclick = () => comanda("date_fine");
    $(".wrap").appendChild(d);
    if (deschis === CAPS.length - 1) d.style.display = "";
  }

  /* bara din „Pe scurt”: scor de risc = media capitolelor de risc; scor de preț = poziția prețului cerut față de comparabile */
  function scor() {
    const rez = document.getElementById("rezumat"); if (!rez) return;
    const pc = ["inundatii", "seismic", "alunecari", "zgomot", "aer"].flatMap(id => { const s = document.getElementById(id); return s ? $$(".vb[data-pct]", s).slice(0, 1).map(v => +v.dataset.pct) : []; });
    if (!pc.length) return;
    const risc = Math.round(pc.reduce((a, b) => a + b, 0) / pc.length), P = window.RIC_EV_PRET || {};
    const pret = P.pctl != null ? Math.round(100 - P.pctl) : P.cerut && P.estimare ? Math.max(0, Math.min(100, Math.round(50 + (P.estimare - P.cerut) / P.estimare * 100))) : null;
    let b = rez.querySelector(":scope > .cc-scor"); const sig = risc + "|" + pret + "|" + (P.cerut || "") + "|" + (P.estimare || "") + "|" + (window.__EV_RAND || ""); if (b && b.dataset.sig === sig) return;
    if (!b) { b = document.createElement("div"); b.className = "cc-scor"; rez.prepend(b); }
    b.dataset.sig = sig; b.dataset.risc = risc; if (pret != null) b.dataset.pret = pret; else delete b.dataset.pret;
    b.innerHTML = `<b class="t">Proprietatea față de alte proprietăți</b><div class="canal"><span class="m" style="left:${risc}%">risc</span>${pret != null ? `<span class="m" style="left:${pret}%">preț</span>` : ""}</div><p>risc: ${risc} % · preț: ${pret != null ? pret + " %" : window.CC_CLIENT && !document.documentElement.classList.contains("cc-priv") ? "în datele fine" : "fără comparabile"}. Mai mult înseamnă mai bine.</p>${P.cerut || P.estimare ? `<ul class="cc-ps">${P.cerut ? `<li>preț cerut <b>${P.cerut.toLocaleString("ro-RO")} €</b>${P.cerut_mp ? ` (${P.cerut_mp} €/mp)` : ""}</li>` : ""}${P.estimare ? `<li>estimat din comparabile <b>${P.estimare.toLocaleString("ro-RO")} €</b>${P.mediana_mp ? ` (mediana ${P.mediana_mp} €/mp)` : ""}${P.trepta ? ` · ${esc(P.trepta)}` : ""}${P.inc ? `, încredere ${esc(String(P.inc).toLowerCase())}` : ""}</li>` : ""}${window.__EV_RAND ? `<li>randament brut din chirie <b>${(window.__EV_RAND * 100).toFixed(1).replace(".", ",")} %</b> pe an</li>` : ""}</ul>` : ""}`;
  }

  /* butonul de comandă duce la „am nevoie și de”, cu datele fine deja bifate */
  function comanda(v) {
    v = v || "date_fine";
    document.body.classList.add("ac-cerere"); const cf = $("#cc-sf"); if (!cf) return; cf.scrollIntoView({ block: "start" });
    let n = 0; const t = setInterval(() => { const dd = cf.querySelector("iframe")?.contentDocument, c = dd && dd.querySelector(`input[name=srv][value="${v}"]`);
      if (c) { clearInterval(t); c.closest(".cutie")?.classList.add("des"); if (!c.checked) { c.checked = true; c.dispatchEvent(new Event("change", { bubbles: true })); } const y = c.getBoundingClientRect().top + cf.getBoundingClientRect().top + scrollY - 90; scrollTo(0, y); } else if (++n > 40) clearInterval(t); }, 250);
  }
  /* pentru PDF: capitolele bifabile sunt cele 12 publice; datele fine nu intră */
  function pentruBife() { return CAPS.map((c, i) => ({ k: String(i), t: c.t })).filter((c, i) => !CAPS[i].privat && !CAPS[i].el.classList.contains("ac-gol")); }
  function pentruPdf(i) { const c = CAPS[i]; if (c.mai.dataset.on) { plat(i, false); delete c.mai.dataset.on; c.mai.textContent = "mai mult"; } sectiuni(c).forEach(s => s.classList.remove("ac-lung")); nivel(c); return sectiuni(c).filter(s => !s.classList.contains("ac-n2")); }
  function dupaPdf() { if (deschis >= 0) nivel(CAPS[deschis]); }

  let inPrint = [];
  function laPrint() {
    inPrint = CAPS.map(c => c.el);
    CAPS.forEach(c => { aseaza1(c); nivel(c);
      const S = c.s.map(id => document.getElementById(id)).filter(Boolean);
      c.el.classList.toggle("cc-np", S.length > 0 && S.every(s => s.classList.contains("cc-np") || s.hidden)); });
  }
  function aseaza1(c) { sectiuni(c).forEach(s => s.classList.remove("ac-lung")); }
  function dupaPrint() { CAPS.forEach(c => c.el.classList.remove("cc-np")); if (deschis >= 0) nivel(CAPS[deschis]); }

  /* un tabel fără rânduri cu date nu se montează (PAS2 R4.4): se scoate cu tot cu cutia lui */
  function faraTabeleGoale() { $$(".wrap table").forEach(t => { if (t.closest("#cc-sf")) return; const tc = $$("td", t); if (!tc.length || tc.every(x => !x.textContent.trim() && !x.querySelector("img,svg,input,button"))) { const b = t.closest(".scroll,.g7-w,.ev-w") || t; b.remove(); } }); }
  /* pagina s-a așezat când nu mai apar elemente noi: abia atunci se opresc cronometrele (minimum 12 s, maximum 60 s) */
  let sem = -1, de = 0;
  function pas() {
    let d; try { d = typeof D !== "undefined" ? D : null; } catch (e) { d = null; }
    const b = document.body;
    if (!d || !d.id || !b.classList.contains("raport-complet") || b.classList.contains("generic") || b.classList.contains("revizie")) return;
    if (!montat) { monteaza(); return; }
    const pf = $("#rep-foot-p"); if (pf) setare(pf, 10000);
    aseaza(); comutator(); scor();
    if (deschis >= 0 && !CAPS[deschis].mai.dataset.on) nivel(CAPS[deschis]);
    if (oprit) return;
    const n = document.querySelectorAll(".wrap *").length, acum = Date.now();
    if (n !== sem) { sem = n; de = acum; }
    if ((acum - t0 > 12000 && acum - de > 6000) || acum - t0 > 60000) { oprit = true; clearInterval(tim); faraTabeleGoale(); window.CC_TIMERE && window.CC_TIMERE.opreste(); if (window.CC_LENES) window.CC_LENES.gata(); }
  }
  /* cronometrul propriu nu intră în CC_TIMERE.opreste decât după așezare; o altă proprietate sau PIN-ul pornesc din nou totul */
  let tim = setInterval(pas, 1500);
  function reia(ms) { if (!oprit) return; oprit = false; t0 = Date.now(); sem = -1; window.CC_TIMERE && window.CC_TIMERE.puls(ms); tim = setInterval(pas, 1500); }
  document.addEventListener("change", e => { if (e.target && e.target.id === "pick") { if (deschis >= 0) inchide(false); reia(30000); } });
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest(".g7-code button")) reia(15000); });
  document.addEventListener("click", e => { if (e.target.closest && e.target.closest("#ac-bar [data-a='pdf']")) { e.stopImmediatePropagation(); document.getElementById("cc-sf")?.scrollIntoView({ behavior: "smooth" }); } }, true);
  window.CC_ACORDEON = { comanda, eLung0: () => !!CAPS[0].mai.dataset.on, pentruBife, pentruPdf, dupaPdf, eDeschis: i => i === deschis || tot, deschide: i => deschide(i, true), inchide: () => inchide(true), caps: () => CAPS, oprit: () => oprit, reia };
})();
