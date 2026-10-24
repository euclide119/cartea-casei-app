/* Raport _ Cartea Casei - capitolul \u201ecronologie\u201d (Manu, 23.10.2026: \u201eimediat dup\u0103 evolu\u021bia pre\u021bului \u00een timp\u201d, ca \u00een raportul carVertical).
   Toate faptele cu dat\u0103 pe care le avem pentru loca\u021bie, pe o singur\u0103 ax\u0103: PUG \u0219i PUZ-uri \u00een jur (urbis.json), autoriza\u021bii \u0219i certificate pe strad\u0103,
   zonarea fiscal\u0103, imaginile satelit din arhiv\u0103 (istoric.json), cutremurele sim\u021bite \u00een zon\u0103 (teritoriu.json), pre\u021burile publice (piata_istoric.json),
   popula\u021bia. Fiecare \u00eenregistrare are categorie, loc, surs\u0103 \u0219i, unde exist\u0103, link. Fil\u0103 nou\u0103 dup\u0103 \u201eestimare valoare\u201d. */
(function () {
  "use strict";
  try { EL.cronologie = "cronologie"; EL_INV.cronologie = "cronologie"; } catch (e) {}
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO");
  const mic = s => (window.mic ? window.mic(s) : String(s ?? "").toLowerCase());
  const dt = s => { const p = String(s).split("-"); return p.length === 3 ? `${p[2]}.${p[1]}.${p[0]}` : p.length === 2 ? `${p[1]}.${p[0]}` : p[0]; };
  const CAT = { urb: ["urbanism", "#c86a0a", "\u25a6"], aut: ["autoriza\u021bii", "#1f8a4c", "\u2692"], sat: ["satelit", "#2c5c9c", "\u25c9"], seism: ["cutremure", "#b3261e", "\u223f"], pret: ["pre\u021buri", "#7a4fc4", "\u20ac"], pop: ["popula\u021bie", "#5b6b73", "\u263a"], fisc: ["impozite", "#8a6d00", "\u00a7"] };
  let cur = null, EV = [], filtru = new Set(Object.keys(CAT)), tot = false;

  function css() {
    if (document.getElementById("cr-css")) return;
    const s = document.createElement("style"); s.id = "cr-css";
    s.textContent = `
#cronologie .cr-w{display:grid;grid-template-columns:minmax(0,230px) minmax(0,1fr);gap:22px;align-items:start}
#cronologie .cr-side h3{font:800 24px var(--font);margin:0 0 8px}
#cronologie .cr-n{display:inline-block;background:#e6effc;color:#1d4f9a;font:700 13px var(--font);border-radius:6px;padding:5px 10px;margin:0 0 10px}
#cronologie .cr-side p{font:13px/1.5 var(--font);color:var(--muted);margin:0 0 10px}
#cronologie .cr-f{display:flex;flex-wrap:wrap;gap:6px}
#cronologie .cr-f button{font:12px var(--font);border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:4px 10px;cursor:pointer;color:var(--fg)}
#cronologie .cr-f button.off{opacity:.4;text-decoration:line-through}
#cronologie .cr-f button i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px}
#cronologie .cr-l{position:relative;display:flex;flex-direction:column;gap:12px;margin:0;padding:0}
#cronologie .cr-l:before{content:"";position:absolute;left:86px;top:6px;bottom:6px;width:1.5px;background:var(--line)}
#cronologie .cr-e{display:grid;grid-template-columns:72px 28px minmax(0,1fr);align-items:start}
#cronologie .cr-d{font:600 11.5px "IBM Plex Mono",monospace;background:var(--bg,#efefec);border-radius:6px;padding:4px 6px;text-align:center;margin-top:12px}
#cronologie .cr-dot{width:9px;height:9px;border-radius:50%;margin:17px auto 0;position:relative;z-index:1;box-shadow:0 0 0 3px var(--panel)}
#cronologie .cr-c{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 14px}
#cronologie .cr-h{display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 10px;align-items:baseline}
#cronologie .cr-h b{font:700 14.5px var(--font)}
#cronologie .cr-h span{font:11.5px var(--font);color:var(--muted)}
#cronologie .cr-c p{font:13px/1.5 var(--font);margin:4px 0 0;color:var(--fg)}
#cronologie .cr-c .cr-t{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}
#cronologie .cr-c .cr-t span,#cronologie .cr-c .cr-t a{font:11.5px var(--font);background:var(--bg,#efefec);border-radius:5px;padding:2px 7px;color:var(--muted);text-decoration:none}
#cronologie .cr-c .cr-t a{color:#2c5c9c}
#cronologie .cr-more{align-self:flex-start;margin-left:100px;font:13px var(--font);border:1px solid var(--line);background:var(--panel);border-radius:8px;padding:6px 12px;cursor:pointer}
#cronologie .cr-ok{display:inline-block;width:16px;height:16px;border-radius:50%;background:#fce8b2;color:#8a5a00;font:700 11px/16px var(--font);text-align:center;margin-left:6px}
#cronologie .cr-e.imp .cr-c{border:1.5px solid var(--cc);box-shadow:0 6px 18px -10px var(--cc);border-left-width:5px}
#cronologie .cr-e.imp .cr-h b{font-size:16px}#cronologie .cr-e.imp .cr-dot{width:13px;height:13px;margin-top:15px}
#cronologie .cr-e.mic .cr-c{padding:7px 12px;opacity:.82}#cronologie .cr-e.mic .cr-c p{font-size:12px;color:var(--muted)}#cronologie .cr-e.mic .cr-h b{font-weight:600;font-size:13px}
@media (max-width:760px){#cronologie .cr-w{grid-template-columns:1fr}#cronologie .cr-l:before{left:78px}#cronologie .cr-e{grid-template-columns:64px 28px minmax(0,1fr)}#cronologie .cr-more{margin-left:92px}}
@media print{#cronologie .cr-f,#cronologie .cr-more{display:none}}`;
    document.head.appendChild(s);
  }

  const km = (a, b, c, d) => { const r = Math.PI / 180, x = (d - b) * r * Math.cos((a + c) / 2 * r), y = (c - a) * r; return 6371 * Math.sqrt(x * x + y * y); };

  function aduna(Dd, U, H, T, PI) {
    const E = [], add = (data, cat, titlu, text, loc, extra) => E.push(Object.assign({ data: String(data), cat, titlu, text, loc }, extra || {}));
    const pug = Dd.urbanism?.pug; if (pug?.gasit && pug.an) add(pug.an, "urb", "PUG aprobat", `planul urbanistic general al localit\u0103\u021bii ${esc(Dd.urbanism.uat || "")} a fost aprobat; e regula de baz\u0103 pentru ce se poate construi pe parcel\u0103.`, Dd.urbanism.uat, {});
    const L = (U?.puz?.lista || []).filter(p => p.an);
    L.filter(p => p.in || p.m <= 300).sort((a, b) => a.m - b.m).slice(0, 12).forEach(p => add(p.an, "urb", p.in ? "PUZ care include proprietatea" : "PUZ aprobat aproape",
      `${p.titlu ? esc(mic(p.titlu)) + "; " : ""}${p.in ? "proprietatea e \u00een conturul planului" : `la ${nf(p.m)} m de proprietate`}; stare: ${esc(mic(p.stare || "necunoscut\u0103"))}.`, "", { atentie: !!p.in }));
    const rest = {}; L.filter(p => !(p.in || p.m <= 300)).forEach(p => rest[p.an] = (rest[p.an] || 0) + 1);
    Object.entries(rest).forEach(([an, n]) => add(an, "urb", `${n} ${n === 1 ? "PUZ aprobat" : "PUZ-uri aprobate"} \u00een 1 km`, `planuri urbanistice zonale aprobate \u00een acel an, \u00eentre 300 m \u0219i 1 km de proprietate; le vezi pe hart\u0103 \u00een capitolul urbanism.`, ""));
    const A = U?.acte; (A?.lista || []).filter(x => x.tip === "AC").forEach(x => add(x.data, "aut", "autoriza\u021bie de construire pe strad\u0103", esc(mic(String(x.obiectiv || "").slice(0, 170))) + (String(x.obiectiv || "").length > 170 ? "\u2026" : ""), mic(x.adresa || A.strada), { tag: [x.nr, x.url ? { u: x.url, t: "actul" } : ""] }));
    Object.entries(A?.pe_an || {}).forEach(([an, v]) => { if (v.CU) add(an, "aut", `${v.CU} certificate de urbanism pe strad\u0103`, `certificate de urbanism emise \u00een ${an} pe ${esc(mic(A.strada || "strad\u0103"))}: semn c\u0103 se preg\u0103tesc lucr\u0103ri sau v\u00e2nz\u0103ri.`, mic(A.strada || "")); });
    const I = U?.impozitare; if (I?.zona) add(I.an || (I.hcl || "").slice(-4), "fisc", `zonare fiscal\u0103: ${esc(mic(I.zona))}`, "zona din care se calculeaz\u0103 impozitul pe cl\u0103dire \u0219i teren.", Dd.urbanism?.uat, {});
    (H?.imagini || []).forEach(im => add(im.data, "sat", "imagine satelit \u00een arhiv\u0103", `cum ar\u0103ta locul atunci (rezolu\u021bie ${String(im.rez_m).replace(".", ",")} m, ${esc(im.furnizor || "")}); o vezi \u00een capitolul autoriza\u021bii, la evolu\u021bia zonei.`, "", { foto: `p/${Dd.id}/${im.fisier}` }));
    (T?.cutremure || []).map(c => ({ lon: c[0], lat: c[1], mag: c[2], an: c[3], d: km(Dd.lat, Dd.lon, c[1], c[0]) })).filter(c => c.mag >= 3.5 && c.d <= 60).forEach(c =>
      add(c.an, "seism", `cutremur de magnitudine ${String(c.mag).replace(".", ",")}`, `epicentrul la circa ${nf(Math.round(c.d))} km de proprietate.`, "", { atentie: c.mag >= 4.5 }));
    (PI?.serie_tm?.puncte || []).forEach(p => add(p.an, "pret", `pre\u021b mediu cerut: ${nf(p.v)} \u20ac/mp`, `apartamente \u00een Timi\u0219oara; reper pentru evolu\u021bia pre\u021bului.`, "Timi\u0219oara"));
    const P = Dd.populatie; if (P?.p2016) add(2016, "pop", `popula\u021bie: ${nf(P.p2016)} locuitori`, `ora\u0219ul ${esc(mic(P.uat))}.`, P.uat);
    if (P?.p2026) add(2026, "pop", `popula\u021bie: ${nf(P.p2026)} locuitori`, `${P.var > 0 ? "+" : ""}${String(P.var).replace(".", ",")}% fa\u021b\u0103 de 2016; jude\u021bul: ${P.judet_var > 0 ? "+" : ""}${String(P.judet_var).replace(".", ",")}%.`, P.uat);
    // importante (Manu, 23.10): ce tine strict de proprietate sau ce e mare ca proportii
    E.forEach(e => { e.imp = !!(e.atentie || (e.cat === "urb" && (/PUG|include/.test(e.titlu) || parseInt(e.titlu) >= 5)) || e.cat === "fisc" || e.cat === "pop" ||
      (e.cat === "aut" && /colectiv|bloc|locuin\u021be colective|ansamblu|hal\u0103|comercial/i.test(e.text)) || (e.cat === "seism" && /magnitudine [4-9]/.test(e.titlu)) || (e.cat === "pret" && e === E.filter(x => x.cat === "pret").slice(-1)[0])); });
    return E.sort((a, b) => a.data.localeCompare(b.data));
  }

  function lista(sec) {
    const L = EV.filter(e => filtru.has(e.cat)), max = 25, arata = tot ? L : L.slice(-max);
    const box = sec.querySelector(".cr-l"); if (!box) return;
    box.innerHTML = (L.length > max && !tot ? `<button class="cr-more" data-m="1">arat\u0103 \u0219i cele ${L.length - max} mai vechi</button>` : "") + arata.map(e => {
      const c = CAT[e.cat], tag = (e.tag || []).filter(Boolean).map(t => typeof t === "string" ? `<span>${esc(t)}</span>` : `<a href="${esc(t.u)}" target="_blank" rel="noopener">${esc(t.t)} \u2197</a>`).join("");
      return `<div class="cr-e${e.imp ? " imp" : " mic"}" style="--cc:${c[1]}"><div class="cr-d">${esc(dt(e.data))}</div><i class="cr-dot" style="background:${c[1]}"></i><div class="cr-c"><div class="cr-h"><b>${esc(mic(e.titlu))}${e.atentie ? `<span class="cr-ok" title="aten\u021bie">!</span>` : ""}</b><span><span style="color:${c[1]}">${c[2]}</span> ${c[0]}${e.loc ? " \u00b7 " + esc(mic(e.loc)) : ""}</span></div><p>${e.text}</p>${tag ? `<div class="cr-t">${tag}</div>` : ""}</div></div>`; }).join("");
    sec.querySelector(".cr-n").textContent = `${L.length} \u00eenregistr\u0103ri`;
    const m = box.querySelector("[data-m]"); if (m) m.onclick = () => { tot = true; lista(sec); };
  }

  function montajFila() {
    const ev = document.querySelector('nav#tabs [data-t="evaluare"]');
    if (ev && !document.querySelector('nav [data-t="cronologie"]')) { const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = "cronologie"; b.textContent = "Cronologie"; b.onclick = () => window.showTab("cronologie"); ev.after(b); }
    if (!document.getElementById("cronologie")) { const s = document.createElement("section"); s.id = "cronologie"; s.hidden = true; document.querySelector(".wrap")?.appendChild(s); }
    try { EL.cronologie = "cronologie"; EL_INV.cronologie = "cronologie"; } catch (e) {}
  }

  async function monteaza() {
    montajFila();
    const Dd = typeof D !== "undefined" ? D : null, sec = document.getElementById("cronologie"); if (!Dd || !sec) return;
    if (cur === Dd.id && sec.querySelector(".cr-w")) return;
    cur = Dd.id; tot = false;
    const j = async u => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch (e) { return null; } };
    const [U, H, T, PI] = await Promise.all([j(`p/${Dd.id}/urbis.json`), j(`p/${Dd.id}/istoric.json`), j(`p/${Dd.id}/teritoriu.json`), j("piata_istoric.json")]);
    EV = aduna(Dd, U, H, T, PI); css();
    const hero = sec.querySelector(":scope > .hero"); [...sec.children].forEach(c => { if (c !== hero && !c.classList.contains("rc-cap")) c.remove(); });
    const w = document.createElement("div"); w.className = "cr-w keep";
    w.innerHTML = `<div class="cr-side"><h3>cronologie</h3><span class="cr-n"></span><p>tot ce are dat\u0103 \u00een raport, pe o singur\u0103 ax\u0103: planuri urbanistice, autoriza\u021bii pe strad\u0103, imagini satelit, cutremure, pre\u021buri \u0219i popula\u021bie. cele mai noi sunt jos; cele care \u021bin de proprietate sau sunt mari sunt eviden\u021biate.</p>
      <div class="cr-f">${Object.entries(CAT).filter(([k]) => EV.some(e => e.cat === k)).map(([k, c]) => `<button data-c="${k}"><i style="background:${c[1]}"></i>${c[0]} ${EV.filter(e => e.cat === k).length}</button>`).join("")}</div></div><div class="cr-l"></div>`;
    sec.appendChild(w);
    w.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { const c = b.dataset.c; filtru.has(c) ? filtru.delete(c) : filtru.add(c); b.classList.toggle("off", !filtru.has(c)); lista(sec); });
    lista(sec);
  }
  setInterval(() => { try { monteaza(); } catch (e) { console.warn("cronologie", e); } }, 1000);
})();
