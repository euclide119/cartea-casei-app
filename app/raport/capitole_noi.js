/* Raport _ Cartea Casei - capitole noi pe loca\u021bie (Manu, 23.10.2026), doar unde avem deja date:
   \u201eproiecte care schimb\u0103 zona\u201d (PUZ-uri noi \u00een 1 km, ansambluri de locuin\u021be \u0219i cl\u0103diri comerciale autorizate) \u0219i
   \u201eaccesul la drumul public\u201d (drumul cel mai apropiat de punct, din harta OSM a raportului: distan\u021ba, tipul, numele).
   Internetul, criminalitatea, performan\u021ba energetic\u0103 \u0219i construc\u021biile care lipsesc din acte sunt \u00een planul de colectare a datelor. */
(function () {
  "use strict";
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = v => Number(v).toLocaleString("ro-RO");
  const mic = s => (window.mic ? window.mic(s) : String(s ?? "").toLowerCase());
  const RDN = ["drum principal", "drum secundar", "drum ter\u021biar", "strad\u0103", "alee sau drum de serviciu"];
  const FOT = { proiecte: "urbis", acces_drum: "transport" };
  let cur = {}, IX = null;
  fetch("ilu/index.json").then(r => r.json()).then(j => IX = j).catch(() => {});
  const prima = k => { const o = IX && IX._ord && IX._ord[k] && IX._ord[k].ordine; return o && o.length ? `g/${o[0]}.webp` : null; };

  const st = document.createElement("style"); st.id = "cn-css";
  st.textContent = `
.cn-hd{position:relative;border-radius:16px;overflow:hidden;min-height:clamp(260px,30vw,420px);background:#d9dde5}
.cn-hd img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:brightness(1.08)}
.cn-hd h2{position:absolute;left:0;top:0;margin:0;padding:24px 28px 60px;font-family:"Fraunces",Georgia,serif;font-weight:700;font-size:clamp(32px,4.2vw,56px);line-height:1.03;color:#fff;text-shadow:0 2px 16px rgba(0,0,0,.45);background:radial-gradient(130% 150% at 0 0,rgba(8,12,20,.6),rgba(8,12,20,.2) 50%,transparent 72%);text-transform:none}
.cn-b{display:flex;flex-direction:column;gap:12px;margin-top:12px}
.cn-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px}
.cn-k>div{border:1px solid #c9ced8;border-radius:12px;padding:12px 14px;background:var(--panel)}
.cn-k b{display:block;font:800 26px var(--mono)}.cn-k span{font:12.5px/1.4 var(--font);color:var(--muted)}
.cn-l{border:1px solid #c9ced8;border-radius:12px;background:var(--panel);padding:6px 14px}
.cn-l div{display:grid;grid-template-columns:62px minmax(0,1fr) 80px;gap:10px;padding:8px 0;border-top:1px solid var(--line);font:13px/1.4 var(--font)}
.cn-l div:first-child{border-top:0}.cn-l em{font-style:normal;font:12px var(--mono);color:var(--muted)}
.cn-v{border-radius:12px;padding:12px 14px;font:14px/1.5 var(--font);border:1px solid}
.cn-v.g{background:#e8f5ec;border-color:#a9d8b8}.cn-v.o{background:#fdf3e2;border-color:#ecc98f}`;
  document.head.appendChild(st);

  function fila(k, titlu, dupa) {
    const ref = document.querySelector(`nav#tabs [data-t="${dupa}"]`);
    if (ref && !document.querySelector(`nav [data-t="${k}"]`)) { const b = document.createElement("button"); b.setAttribute("role", "tab"); b.dataset.t = k; b.textContent = titlu; b.onclick = () => window.showTab(k); ref.after(b); }
    if (!document.getElementById(k)) { const s = document.createElement("section"); s.id = k; s.hidden = true; document.querySelector(".wrap")?.appendChild(s); }
    try { EL[k] = k; EL_INV[k] = k; } catch (e) {}
    return document.getElementById(k);
  }
  function antet(k, titlu) {
    const p = (window.RIC_ASPECT && RIC_ASPECT.imagine(k)) || (window.RIC_ASPECT && RIC_ASPECT.imagine(FOT[k])) || prima(FOT[k]) || null;
    return `<div class="cn-hd">${p ? `<img src="ilu/${esc(p)}" alt="">` : ""}<h2>${esc(titlu)}</h2></div>`;
  }

  async function proiecte(Dd) {
    const sec = fila("proiecte", "Proiecte \u00een zon\u0103", "urbanism"); if (!sec || cur.p === Dd.id) return; cur.p = Dd.id;
    let U = null; try { const r = await fetch(`p/${Dd.id}/urbis.json`); if (r.ok) U = await r.json(); } catch (e) {}
    const an0 = new Date().getFullYear() - 6, L = ((U && U.puz && U.puz.lista) || []).filter(p => p.an >= an0).sort((a, b) => a.m - b.m);
    const T = (Dd.autorizatii && Dd.autorizatii.trimestre) || {}, q = Object.keys(T).sort().slice(-5, -1);
    const col = q.reduce((s, k) => s + (T[k].colectiv || 0), 0), com = q.reduce((s, k) => s + (T[k].comercial || 0), 0);
    const mari = ((U && U.acte && U.acte.lista) || []).filter(a => a.tip === "AC" && /colectiv|bloc|ansamblu|hal\u0103|comercial|birouri/i.test((a.clasa || "") + " " + (a.obiectiv || ""))).slice(0, 6);
    const tit = t => esc(mic(String(t || "").replace(/^\s*(P\.?U\.?Z\.?|PUZ)\s*[-:"]*\s*/i, "").replace(/["\u201c\u201d]/g, "").slice(0, 110))) || "plan urbanistic zonal";
    const GM = {}; L.forEach(p => { const t = tit(p.titlu), k = p.an + "|" + t; if (!GM[k]) GM[k] = { an: p.an, t, n: 0, m: p.m }; GM[k].n++; GM[k].m = Math.min(GM[k].m, p.m); });
    const G = Object.values(GM).sort((a, b) => a.m - b.m);
    sec.innerHTML = antet("proiecte", "proiecte care schimb\u0103 zona") + `<div class="cn-b">
      <div class="cn-k"><div><b>${nf(L.length)}</b><span>planuri urbanistice noi \u00een 1 km, din ${an0}</span></div><div><b>${L[0] ? nf(L[0].m) + " m" : "\u2014"}</b><span>cel mai apropiat plan nou${L[0] ? ` (${L[0].an})` : ""}</span></div>
        <div><b>${nf(col)}</b><span>autoriza\u021bii pentru blocuri \u00een ora\u0219, ultimele 12 luni</span></div><div><b>${nf(com)}</b><span>autoriza\u021bii pentru comer\u021b \u0219i birouri \u00een ora\u0219, ultimele 12 luni</span></div></div>
      ${G.length ? `<div class="cn-l">${G.slice(0, 8).map(g => `<div><em>${g.an}</em><span>${g.t}${g.n > 1 ? ` \u00b7 ${g.n} planuri` : ""}</span><em>${nf(g.m)} m</em></div>`).join("")}</div>` : ""}
      ${mari.length ? `<div class="cn-l">${mari.map(a => `<div><em>${esc(String(a.data || "").slice(0, 4))}</em><span>${esc(mic(String(a.obiectiv || "").slice(0, 120)))}</span><em>pe strad\u0103</em></div>`).join("")}</div>` : ""}
      <p style="margin:0;font:13px/1.5 var(--font);color:var(--muted)">planurile noi \u0219i ansamblurile autorizate arat\u0103 \u00eencotro se mi\u0219c\u0103 zona: mai multe locuin\u021be, trafic, servicii. drumurile \u0219i investi\u021biile publice se adaug\u0103 pe m\u0103sur\u0103 ce le colect\u0103m.</p></div>`;
  }

  function distSeg(px, py, x1, y1, x2, y2) { const dx = x2 - x1, dy = y2 - y1, L = dx * dx + dy * dy; let t = L ? ((px - x1) * dx + (py - y1) * dy) / L : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(px - x1 - t * dx, py - y1 - t * dy); }
  async function acces(Dd) {
    const sec = fila("acces_drum", "Acces la drum", "proiecte"); if (!sec || cur.a === Dd.id) return; cur.a = Dd.id;
    let H = null; try { const r = await fetch(`p/${Dd.id}/harta.json`); if (r.ok) H = await r.json(); } catch (e) {}
    const R = ((H && H.dr) || []).filter(a => a[0] < 5).map(a => { let d = 1e9; for (let i = 2; i + 3 < a.length; i += 2) d = Math.min(d, distSeg(0, 0, a[i], a[i + 1], a[i + 2], a[i + 3])); return { c: a[0], n: a[1], d }; }).sort((a, b) => a.d - b.d);
    const v = R[0], numite = R.filter(x => x.n).slice(0, 3);
    const ok = v && v.d <= 30;
    sec.innerHTML = antet("acces_drum", "accesul la drumul public") + `<div class="cn-b">
      <div class="cn-k"><div><b>${v ? nf(Math.round(v.d)) + " m" : "\u2014"}</b><span>de la punct p\u00e2n\u0103 la cel mai apropiat drum (${v ? RDN[v.c] : "\u2014"})</span></div>
        ${numite.map(x => `<div><b style="font-size:16px;font-family:var(--font)">${esc(mic(x.n))}</b><span>${RDN[x.c]} \u00b7 la ${nf(Math.round(x.d))} m</span></div>`).join("")}</div>
      <div class="cn-v ${ok ? "g" : "o"}">${ok ? "punctul e l\u00e2ng\u0103 un drum: accesul e probabil direct. confirm\u0103 \u00een extrasul de carte funciar\u0103 c\u0103 parcela are ie\u0219ire la drum public." : "punctul e departe de un drum cunoscut: accesul poate fi prin servitute sau drum privat. cere extrasul de carte funciar\u0103 \u0219i verific\u0103 servitutea de trecere."}</div>
      <p style="margin:0;font:13px/1.5 var(--font);color:var(--muted)">distan\u021ba e m\u0103surat\u0103 pe harta drumurilor, de la punctul ales; parcela exact\u0103 \u0219i servitu\u021bile se v\u0103d \u00een actele de proprietate.</p></div>`;
  }

  setInterval(() => { try { const Dd = typeof D !== "undefined" ? D : null; if (!Dd || !document.querySelector('nav#tabs [data-t="urbanism"]')) return; proiecte(Dd); acces(Dd); } catch (e) { console.warn("capitole_noi", e); } }, 1200);
})();
