/* Raport _ Cartea Casei - ajust\u0103ri pe capitole, varianta pentru client (Manu, 23.10.2026).
   seism: bara cutremurelor \u00een timp (pe ani, pe magnitudini); f\u0103r\u0103 compara\u021bia cu modelul european \u0219i f\u0103r\u0103 tabelul cu surse.
   costuri: chenarele colorate discret dup\u0103 cine pl\u0103te\u0219te (v\u00e2nz\u0103tor / cump\u0103r\u0103tor); baza de calcul pe scurt (norm\u0103, tarif OCPI, cot\u0103, estimare).
   negociere: nu \u201ece m\u0103 \u00eengrijoreaz\u0103\u201d, ci ce discut\u0103 ambele p\u0103r\u021bi: riscurile propriet\u0103\u021bii, ale zonei, ale pl\u0103\u021bii \u0219i altele,
     plus argumentele care trag pre\u021bul \u00een jos, \u00een sus sau sunt neutre, pe o balan\u021b\u0103.
   elementele care se calculeaz\u0103 pe loc (\u00eensorire, costuri): la tipar apare trimiterea spre varianta electronic\u0103. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO"); const mic = s => (window.mic ? window.mic(s) : String(s ?? "").toLowerCase());
  const $$ = (r, s) => [...r.querySelectorAll(s)];
  let TER = null, terId = null;

  const s = document.createElement("style"); s.id = "cc2-css";
  s.textContent = `
.cc2-x{display:none!important}body.cl-surse .cc2-x{display:block!important}
#cc2-seism{border:1px solid #c9ced8;border-radius:12px;padding:12px 14px;background:var(--panel);display:flex;flex-direction:column;gap:8px;margin:8px 0}
#cc2-seism b{font:700 14px var(--font)}#cc2-seism svg{width:100%;height:auto;display:block}
.cc2-l{display:flex;flex-wrap:wrap;gap:6px 14px;font:12px var(--font);color:var(--muted)}.cc2-l i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px;vertical-align:-1px}
#costuri>.cards>div.cc2-v{background:#fbf0e6!important;border-color:#ecc9a8!important}
#costuri>.cards>div.cc2-c{background:#e9f1fb!important;border-color:#bcd2ee!important}
#costuri>.cards>div.cc2-a{background:#edf6ef!important;border-color:#bfdcc6!important}
.cc2-who{display:block;font:600 11px var(--font);letter-spacing:.02em;margin-top:4px;color:var(--muted)}
.cc2-app{display:none;font:12.5px/1.5 var(--font);border:1px dashed #9aa3b2;border-radius:10px;padding:8px 12px;margin:8px 0}
@media print{.cc2-app{display:block}}
#cc2-neg{display:flex;flex-direction:column;gap:14px;border:1px solid #c9ced8;border-radius:16px;padding:18px 20px;background:var(--panel)}
#cc2-neg h3{font:800 20px var(--font);margin:0}
#cc2-neg .ng-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
#cc2-neg .ng-c{border:1px solid #c9ced8;border-radius:12px;padding:10px 12px;background:var(--bg);display:flex;flex-direction:column;gap:6px}
#cc2-neg .ng-c>b{font:700 14px var(--font)}#cc2-neg .ng-c li{font:13px/1.45 var(--font);margin:0 0 4px}
#cc2-neg .ng-c ul{margin:0;padding-left:16px}
#cc2-neg .bal{display:grid;grid-template-columns:1fr 120px 1fr;gap:10px;align-items:start}
#cc2-neg .bal>div{display:flex;flex-direction:column;gap:6px}
#cc2-neg .bal .mid{align-items:center;text-align:center;font:12px var(--font);color:var(--muted)}
#cc2-neg .ar{border-radius:10px;padding:8px 10px;font:12.5px/1.4 var(--font);border:1px solid;cursor:default;transition:transform .15s}
#cc2-neg .ar:hover{transform:translateY(-2px)}
#cc2-neg .ar b{display:block;font:700 13px var(--font)}
#cc2-neg .ar.j{background:#fdecea;border-color:#f3b8b0}#cc2-neg .ar.s{background:#e8f5ec;border-color:#a9d8b8}#cc2-neg .ar.n{background:#eef0f4;border-color:#cdd2db}
#cc2-neg .w{letter-spacing:2px;color:#c86a0a;font-size:11px}
#cc2-neg .bh{font:700 13px var(--font);text-align:center}
body:not(.cl-surse) #negociere>.ng-sec.cc2-f{display:none!important}
@media (max-width:760px){#cc2-neg .bal{grid-template-columns:1fr}}`;
  document.head.appendChild(s);

  /* ---------- seism ---------- */
  async function seism(Dd) {
    const sec = document.getElementById("seismic"); if (!sec || !sec.firstElementChild) return;
    $$(sec, ":scope > .ex").forEach(e => { if (/model(ul)? european|ESHM/i.test(e.textContent)) e.classList.add("cc2-x"); });
    $$(sec, ":scope > .scroll").forEach(e => { if (/surs/i.test(e.querySelector("th, thead")?.textContent || e.textContent.slice(0, 80))) e.classList.add("cc2-x"); });
    if (sec.querySelector("#cc2-seism")) return;
    if (terId !== Dd.id) { terId = Dd.id; TER = null; try { const r = await fetch(`p/${Dd.id}/teritoriu.json`); if (r.ok) TER = await r.json(); } catch (e) {} }
    if (!TER || !TER.cutremure || sec.querySelector("#cc2-seism")) return;
    const km = (la, lo) => { const r = Math.PI / 180, x = (lo - Dd.lon) * r * Math.cos((la + Dd.lat) / 2 * r), y = (la - Dd.lat) * r; return 6371 * Math.hypot(x, y); };
    const C = TER.cutremure.filter(c => c[2] >= 2.5 && km(c[1], c[0]) <= 100); if (!C.length) return;
    const K = [["\u2265 5", 5, "#c62828"], ["4\u20134,9", 4, "#ef6c00"], ["3\u20133,9", 3, "#f2b705"], ["2,5\u20132,9", 2.5, "#9aa6bd"]];
    const cls = m => K.findIndex(k => m >= k[1]);
    const y0 = Math.min(...C.map(c => c[3])), y1 = Math.max(...C.map(c => c[3])), N = y1 - y0 + 1, cnt = Array.from({ length: N }, () => [0, 0, 0, 0]);
    C.forEach(c => cnt[c[3] - y0][cls(c[2])]++);
    const W = 760, Hh = 200, L = 30, B = 26, T = 10, mx = Math.max(...cnt.map(a => a.reduce((x, y) => x + y, 0)), 1), bw = (W - L - 8) / N, Y = v => T + (1 - v / mx) * (Hh - T - B);
    let g = `<svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="cutremure pe ani">`;
    [0, .5, 1].forEach(f => { const v = Math.round(mx * f); g += `<line x1="${L}" x2="${W - 4}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)"/><text x="${L - 5}" y="${Y(v) + 4}" font-size="10" text-anchor="end" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${v}</text>`; });
    cnt.forEach((a, i) => { let acc = 0; const x = L + i * bw + 1, y = y0 + i;
      [3, 2, 1, 0].forEach(k => { if (!a[k]) return; const ya = Y(acc + a[k]), yb = Y(acc); g += `<rect x="${x.toFixed(1)}" y="${ya.toFixed(1)}" width="${(bw - 2).toFixed(1)}" height="${(yb - ya).toFixed(1)}" fill="${K[k][2]}"><title>${y}: ${a[k]} cutremure ${K[k][0]}</title></rect>`; acc += a[k]; });
      if (i % 5 === 0 || i === N - 1) g += `<text x="${(x + bw / 2).toFixed(1)}" y="${Hh - 8}" font-size="10.5" text-anchor="middle" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${y}</text>`; });
    g += `</svg>`;
    const mari = C.filter(c => c[2] >= 4).length;
    const d = document.createElement("div"); d.id = "cc2-seism"; d.className = "keep";
    d.innerHTML = `<b>cutremurele din 100 km, pe ani (${y0}\u2013${y1})</b><span style="font:13px var(--font);color:var(--muted)">${nf(C.length)} cutremure de cel pu\u021bin 2,5; ${nf(mari)} de magnitudine 4 sau mai mult. bara arat\u0103 c\u00e2nd au fost \u0219i c\u00e2t de puternice.</span>${g}<div class="cc2-l">${K.map(k => `<span><i style="background:${k[2]}"></i>magnitudine ${k[0]}</span>`).join("")}</div>`;
    const ch = $$(sec, ":scope > .ch").find(e => /cutremurele pe hart/i.test(e.textContent)) || sec.querySelector(":scope > .hmh"); (ch || sec.lastElementChild).insertAdjacentElement("afterend", d);
  }

  /* ---------- costuri ---------- */
  function costuri() {
    const sec = document.getElementById("costuri"); if (!sec || !sec.firstElementChild) return;
    $$(sec, ":scope > .cards > div").forEach(c => { if (c.dataset.cc2) return; c.dataset.cc2 = 1; const t = c.textContent.toLowerCase();
      const k = /v\u00e2nz\u0103tor/.test(t) ? "v" : /impozit local|pe an/.test(t) ? "a" : "c";
      c.classList.add("cc2-" + k); c.insertAdjacentHTML("beforeend", `<span class="cc2-who">${k === "v" ? "pl\u0103te\u0219te v\u00e2nz\u0103torul" : k === "a" ? "proprietarul, \u00een fiecare an" : "pl\u0103te\u0219te cump\u0103r\u0103torul"}</span>`); });
    $$(sec, ":scope > .scroll table").forEach(tb => { if (tb.dataset.cc2) return; tb.dataset.cc2 = 1;
      const hs = $$(tb, "th"), ix = hs.findIndex(h => /temei|baz/i.test(h.textContent)); if (ix < 0) return; hs[ix].textContent = "cum se calculeaz\u0103";
      $$(tb, "tbody tr").forEach(r => { const td = r.children[ix]; if (!td) return; const t = td.textContent;
        td.textContent = /OCPI|ANCPI|intabul/i.test(t) ? "tarif OCPI" : /onorariu|OMJ|Anexa|notar/i.test(t) ? "norm\u0103 notarial\u0103" : /art\.\s*111|3%|1%/i.test(t) ? "cot\u0103 de impozit" : /457|local/i.test(t) ? "impozit local" : /estim/i.test(t) ? "estimare" : /gril/i.test(t) ? "grila notarilor" : "calcul"; }); });
    app(sec, "costurile se recalculeaz\u0103 dup\u0103 pre\u021b \u0219i dup\u0103 ce se aplic\u0103 \u021bie");
  }
  function app(sec, ce) {
    if (!sec || sec.querySelector(":scope > .cc2-app")) return; const id = typeof D !== "undefined" && D ? D.id : "";
    const d = document.createElement("div"); d.className = "cc2-app"; d.innerHTML = `<b>\u00een varianta electronic\u0103:</b> ${ce}. deschide raportul \u00een aplica\u021bie (cod ${esc(id)}, capitolul \u201e${esc(sec.id)}\u201d).`;
    (sec.querySelector(":scope > .hero") || sec.firstElementChild).insertAdjacentElement("afterend", d);
  }

  /* ---------- negociere ---------- */
  const ZONA = /inunda|seism|zgomot|lini\u0219te|popula|construc\u021bii \u00een jur|facilit|\u0219coli|patrimoniu|arii|transport|aer/i, PROP = /pug|teren|solar|pre\u021bul cerut|construi/i;
  function negociere(Dd) {
    const sec = document.getElementById("negociere"); if (!sec || !sec.firstElementChild || !window.RIC_NEG) return;
    $$(sec, ":scope > .ng-sec").forEach(e => { if (/\u00eengrijoreaz\u0103/i.test(e.querySelector("h3,h2")?.textContent || e.textContent.slice(0, 60))) e.classList.add("cc2-f"); });
    if (sec.dataset.cc2 === Dd.id && sec.querySelector("#cc2-neg")) return; sec.dataset.cc2 = Dd.id; sec.querySelector("#cc2-neg")?.remove();
    let L = []; try { L = RIC_NEG.parghii(Dd) || []; } catch (e) {}
    const li = a => `<li><b>${esc(a.tema.toLowerCase())}:</b> ${esc(a.fapt)}</li>`;
    const prop = L.filter(x => PROP.test(x.tema)), zona = L.filter(x => ZONA.test(x.tema) && !PROP.test(x.tema));
    const PLATA = ["arvuna sau avansul: ce sunt banii da\u021bi la semnare \u0219i ce se \u00eent\u00e2mpl\u0103 cu ei dac\u0103 una dintre p\u0103r\u021bi renun\u021b\u0103", "creditul: termenul p\u00e2n\u0103 la aprobare \u0219i ce se \u00eent\u00e2mpl\u0103 dac\u0103 banca refuz\u0103", "plata prin cont, pe tran\u0219e, legat\u0103 de predarea actelor \u0219i a cheilor"];
    const ALTE = ["sarcini \u0219i datorii pe imobil: ipoteci, not\u0103ri, servitu\u021bi din extrasul de carte funciar\u0103", "actele care se predau: carte funciar\u0103, certificat energetic, acte de construc\u021bie, certificat fiscal", "termenul de semnare \u0219i penalit\u0103\u021bile pentru \u00eent\u00e2rziere"];
    const w = n => "\u25cf".repeat(Math.max(1, Math.min(3, Math.round(n || 1))));
    const ar = a => `<div class="ar ${a.dir}" title="${esc(a.fapt)}"><b>${esc(a.tema.toLowerCase())} <span class="w">${w(a.w)}</span></b>${esc(a.fapt)}</div>`;
    const jos = L.filter(x => x.dir === "j"), sus = L.filter(x => x.dir === "s"), neu = L.filter(x => x.dir !== "j" && x.dir !== "s");
    const fj = jos.reduce((a, b) => a + (b.w || 1), 0), fs = sus.reduce((a, b) => a + (b.w || 1), 0), ang = Math.max(-14, Math.min(14, (fs - fj) * 2.5));
    const d = document.createElement("div"); d.id = "cc2-neg"; d.className = "keep";
    d.innerHTML = `<h3>de discutat \u00eentre p\u0103r\u021bi</h3><p style="margin:0;font:13.5px/1.5 var(--font);color:var(--muted)">punctele pe care le pun pe mas\u0103 at\u00e2t cump\u0103r\u0103torul, c\u00e2t \u0219i v\u00e2nz\u0103torul, cu ce arat\u0103 datele aici.</p>
      <div class="ng-g"><div class="ng-c"><b>riscurile propriet\u0103\u021bii</b><ul>${prop.map(li).join("") || "<li>nimic deosebit \u00een datele noastre</li>"}</ul></div>
        <div class="ng-c"><b>riscurile zonei</b><ul>${zona.map(li).join("") || "<li>nimic deosebit \u00een datele noastre</li>"}</ul></div>
        <div class="ng-c"><b>riscurile plat\u0103</b><ul>${PLATA.map(t => `<li>${t}</li>`).join("")}</ul></div>
        <div class="ng-c"><b>alte riscuri la v\u00e2nzare</b><ul>${ALTE.map(t => `<li>${t}</li>`).join("")}</ul></div></div>
      <div><b style="font:700 15px var(--font)">balan\u021ba argumentelor de pre\u021b</b></div>
      <div class="bal"><div><div class="bh" style="color:#c0392b">\u2193 trag pre\u021bul \u00een jos (${jos.length})</div>${jos.map(ar).join("")}</div>
        <div class="mid"><svg viewBox="0 0 120 90" width="120"><g transform="rotate(${ang} 60 30)"><line x1="10" y1="30" x2="110" y2="30" stroke="#1a1e2a" stroke-width="3"/><path d="M10 30l-8 22h16z M110 30l-8 22h16z" fill="none" stroke="#1a1e2a" stroke-width="1.5"/><path d="M-2 52h24M98 52h24" stroke="#1a1e2a" stroke-width="3"/></g><path d="M60 30l-12 52h24z" fill="#c86a0a"/><circle cx="60" cy="30" r="4" fill="#1a1e2a"/></svg>${fj > fs ? "argumentele de sc\u0103dere sunt mai grele" : fs > fj ? "argumentele de cre\u0219tere sunt mai grele" : "balan\u021b\u0103 echilibrat\u0103"}<div style="margin-top:10px">neutre: ${neu.map(a => esc(a.tema.toLowerCase())).join(", ") || "\u2014"}</div></div>
        <div><div class="bh" style="color:#1f8a4c">\u2191 \u021bin pre\u021bul sus (${sus.length})</div>${sus.map(ar).join("")}</div></div>`;
    const h = sec.querySelector(":scope > .hero"); (h || sec.firstElementChild).insertAdjacentElement("afterend", d);
  }

  /* ---------- scoli: nota (Evaluarea Nationala, clasa a VIII-a) si locul in judet ---------- */
  function scoli(Dd) {
    const sec = document.getElementById("scoli"); if (!sec || !sec.firstElementChild || sec.querySelector("#cc2-sc")) return;
    const N = ((Dd.scoli || {}).note || []).filter(x => x.medie != null); if (!N.length) return;
    N.sort((a, b) => b.medie - a.medie);
    const cul = m => m >= 8.5 ? "#1f8a4c" : m >= 7.5 ? "#7cae3a" : m >= 6.5 ? "#e0a31a" : "#c0392b";
    const rand = x => { const ani = Object.keys(x.ani || {}).sort(), mx = 10, W = 120, H = 34;
      const sp = ani.length > 1 ? `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">` + ani.map((y, i) => { const v = x.ani[y].medie, h = (v - 5) / 5 * (H - 12), bx = 6 + i * 40; return `<rect x="${bx}" y="${H - 10 - h}" width="26" height="${h}" rx="3" fill="${cul(v)}" opacity=".85"/><text x="${bx + 13}" y="${H - 1}" font-size="8.5" text-anchor="middle" fill="#7a8190" font-family="IBM Plex Mono,monospace">${y.slice(2)}</text>`; }).join("") + `</svg>` : "";
      return `<div class="sc-r"><div><b>${esc(mic(x.nume_osm))}</b><span>loc ${x.loc} din ${x.din} \u00een jude\u021b \u00b7 ${nf(x.elevi)} elevi \u00b7 ${x.an}</span></div><div class="sc-m" style="background:${cul(x.medie)}">${String(x.medie).replace(".", ",")}</div>${sp}</div>`; };
    const d = document.createElement("div"); d.id = "cc2-sc"; d.className = "keep";
    d.innerHTML = `<b style="font:700 15px var(--font)">nota \u0219colilor: media la evaluarea na\u021bional\u0103 (clasa a VIII-a)</b><span style="font:12.5px var(--font);color:var(--muted)">media pe unitate \u0219i locul \u00een jude\u021b; coloanele mici arat\u0103 ultimii ani. gr\u0103dini\u021bele nu au evaluare. nota spune despre rezultatele elevilor, nu despre \u00eenv\u0103\u021b\u0103tori.</span>${N.map(rand).join("")}`.replace(/\u0219/g, "\u0219");
    const c = sec.querySelector(":scope > .cards"); (c || sec.querySelector(":scope > .hero") || sec.firstElementChild).insertAdjacentElement("afterend", d);
  }
  const st2 = document.createElement("style"); st2.textContent = `#cc2-sc{border:1px solid #c9ced8;border-radius:12px;padding:12px 14px;background:var(--panel);display:flex;flex-direction:column;gap:8px;margin:8px 0}
#cc2-sc .sc-r{display:grid;grid-template-columns:minmax(0,1fr) 54px 120px;gap:12px;align-items:center;border-top:1px solid var(--line);padding-top:8px}
#cc2-sc .sc-r b{display:block;font:700 13.5px var(--font)}#cc2-sc .sc-r span{font:12px var(--font);color:var(--muted)}
#cc2-sc .sc-m{color:#fff;border-radius:10px;text-align:center;font:800 18px var(--mono);padding:8px 0}
@media (max-width:640px){#cc2-sc .sc-r{grid-template-columns:minmax(0,1fr) 54px}#cc2-sc .sc-r svg{display:none}}`; document.head.appendChild(st2);
  setInterval(() => { try {
    const Dd = typeof D !== "undefined" ? D : null; if (!Dd) return;
    seism(Dd); scoli(Dd); costuri(); negociere(Dd); app(document.getElementById("insorire"), "mi\u0219ti luna \u0219i ora \u0219i vezi soarele \u0219i umbra pe parcel\u0103");
  } catch (e) { console.warn("capitole_client", e); } }, 1300);
})();
