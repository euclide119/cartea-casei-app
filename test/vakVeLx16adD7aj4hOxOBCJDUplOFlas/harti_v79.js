/* Raport _ Cartea Casei - hărți (v80.0): butoanele plutesc (sticky) până se termină harta, fără blocarea rotiței; (v79.2): inundații pe scenarii, butoane fixate la derulare, PDF doar cu datele publice. */
(function () {
  "use strict";
  const st = document.createElement("style"); st.id = "h79-css";
  st.textContent = `
.g7-ch,.pzchips,.h79-ctl{position:static;margin:0;padding:6px 0}
.hm-ch{position:sticky;bottom:6px;z-index:6;background:color-mix(in srgb,var(--panel,#fff) 94%,transparent);backdrop-filter:blur(8px);border-radius:12px;padding:6px}
.hx-reg{display:none!important}
/* butoanele hărților: apăsat = chihlimbar deschis cu chenar și ✓; neapăsat = alb, text gri închis. Fără negru pe negru și fără text palid (Manu, 03.11.2026) */
button.hm-chip,button.pzc,.g7-ch button,.h79-ctl button,.tbase button{font:600 13px var(--font)!important;padding:7px 12px!important;border-radius:999px!important;min-height:36px;cursor:pointer}
button.hm-chip[aria-pressed="true"],button.pzc[aria-pressed="true"],.g7-ch button[aria-pressed="true"],.h79-ctl button[aria-pressed="true"],.hm-base .hm-chip[aria-pressed="true"],.tbase button[aria-pressed="true"]{background:#ffe3a6!important;color:#1a1e2a!important;border:2px solid #b86e00!important;opacity:1!important;text-decoration:none!important}
button.hm-chip[aria-pressed="true"]::before,button.pzc[aria-pressed="true"]::before,.g7-ch button[aria-pressed="true"]::before,.h79-ctl button[aria-pressed="true"]::before{content:"✓ ";font-weight:800}
button.hm-chip[aria-pressed="false"],button.pzc[aria-pressed="false"],.g7-ch button[aria-pressed="false"],.h79-ctl button[aria-pressed="false"],.hm-base .hm-chip[aria-pressed="false"],.tbase button[aria-pressed="false"]{background:#fff!important;color:#3d4354!important;border:1px solid #8a90a0!important;opacity:1!important;text-decoration:none!important}
.h79-ctl button[disabled]{background:#f1f2f5!important;color:#5b6275!important;border:1px dashed #a9afbd!important;font-weight:500!important;cursor:default}.h79-ctl button[disabled]::before{content:""}
span.pzc{border:0!important;background:none!important;padding:2px 4px!important;cursor:default!important}
.h79-f img{background:#dfe3ea!important}
.h79{display:flex;flex-direction:column;gap:10px}
.h79-ctl{display:flex;flex-wrap:wrap;gap:6px;align-items:center;position:sticky;bottom:0;padding:8px;background:var(--panel,#fff)}
.h79-gr{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.h79-ctl button{display:inline-flex;gap:6px;align-items:center}
.h79-ctl i{width:10px;height:10px;border-radius:3px;display:inline-block}
.h79-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:12px}
.h79-f{position:relative;margin:0;border-radius:14px;overflow:hidden;border:1px solid #c9ced8;background:#dfe3ea}
.h79-f>div{position:relative;aspect-ratio:1}.h79-f img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.h79-f img.l{transition:opacity .25s ease;background:transparent!important}
.h79-f figcaption{padding:8px 12px;font:12.5px/1.4 var(--font);color:var(--muted);background:var(--panel)}
.h79-pin{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px;border-radius:50%;background:#ff3b5c;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.4)}
.h79-gol{font:13px/1.5 var(--font);color:var(--muted)}
/* v82.10.0 (Manu, 09.11.2026): la inundații se văd toate straturile (și apa care băltește), nu doar 3 + „alte straturi” */
.h79 .ov-st .ov-extra{display:inline-block!important}.h79 .ov-st .ov-alte{display:none!important}
@media print{#g7_istoric,#g7_juridic,#g7_extras,#g7_comercial,#g7_tehnic,#g7_utilitati,#g7_pug,#g7_proiecte,#g7_preturi,#g7_afis,#g7_privat,#evaluare,#proiecte,nav [data-t^="g7_"],#cc-serv-nav,#surse,#stare{display:none!important}.hm-ch,.g7-ch,.pzchips,.h79-ctl{position:static}}`;
  document.head.appendChild(st);

  /* v82.10.0: toate straturile bifate din prima; „fără date” = stratul nu există pentru proprietate (ape, apă care băltește), „nu sunt zone” = hartă oficială fără zone pe perioada aceea.
     Din 10 proprietăți din p/, X.balta lipsește la 9 (8 fără straturi de inundații, 1 cu straturi dar fără extra); există doar la g7_parcela. */
  /* ---------- inundații: 10 / 100 / 1000 de ani, râuri și ploi intense, pe satelit și pe planșa regiunii ---------- */
  const COL = { 10: "#dc2626", 100: "#f58220", 1000: "#facc15" };
  let gata = null;
  function inundatii(D) {
    const O = D.inundatii && D.inundatii.straturi, sec = document.getElementById("inundatii"); if (!O || !sec || gata === D.id) return;
    const a = sec.querySelector("#imReg"), f = a && a.closest("figure"); if (!f) return;
    gata = D.id; const vechi = f.parentElement; vechi.style.display = "none";
    const w = document.createElement("div"); w.className = "h79";
    const P = `p/${D.id}/`, ALL = [];
    ["F", "P"].forEach(t => O.perioade.forEach(p => ["loc", "reg"].forEach(z => { const fn = O.straturi[`${z}_${t}${p}`]; if (fn) ALL.push({ z, t, p, fn }); })));
    const X = O.extra || {};
    ["A", "B"].forEach(k => { const m = k === "A" ? X.ape : X.balta; if (m) ["loc", "reg"].forEach(z => { if (m[z]) ALL.push({ z, t: k, p: "x", fn: m[z] }); }); });
    const TIP = [["F", "de la râuri"], ["P", "zone joase, ploi intense"], ["A", "râuri, canale și lacuri"], ["B", "apă care băltește (estimare)"]], CUL = { A: "#0064dc", B: "#2a9de0" };
    /* fiecare hartă are butoanele ei, imediat sub imagine: ce bifezi se vede pe harta de deasupra (Manu, 03.11.2026) */
    w.innerHTML = `<div class="h79-g">${[["loc", "Pe satelit, 3 × 3 km în jurul parcelei"], ["reg", "Planșa regiunii, 70 × 70 km, satelit"]].map(([z, c]) => {
      const are = (t, p) => ALL.some(s => s.z === z && s.t === t && (p == null || s.p === p));
      return `<figure class="h79-f${z === "reg" ? " ac-d2" : ""}" data-fz="${z}"><div data-z="${z}"><img src="${P}${O.baza[z]}" alt="${c}"><span class="h79-pin"></span></div>
        <div class="h79-ctl" role="group" aria-label="straturile hărții">${O.perioade.map(p => { const ok = ["F", "P"].some(t => are(t, String(p))); return `<button type="button" data-p="${p}" aria-pressed="${ok}"${ok ? "" : " disabled"}><i style="background:${COL[p]}"></i>o dată la ${p} de ani${ok ? "" : ": nu sunt zone"}</button>`; }).join("")}
          ${TIP.map(([k, t]) => { const ok = are(k), fd = k === "A" || k === "B"; return `<button type="button" data-t="${k}" aria-pressed="${ok}"${ok ? "" : " disabled"}>${CUL[k] ? `<i style="background:${CUL[k]}"></i>` : ""}${t}${ok ? "" : fd ? ": fără date" : ": nu sunt zone"}</button>`; }).join("")}</div>
        <figcaption>${c}</figcaption></figure>`; }).join("")}</div>
      <p class="h79-gol ac-d2">Zonele pentru 10, 100 și 1000 de ani sunt cele oficiale (hărțile de hazard). Apa care băltește e o <b>estimare din relief</b> (rezoluție 30 m): arată adânciturile în care apa de ploaie nu are scurgere; nu e hartă oficială.</p>`;
    vechi.after(w);
    ALL.forEach(s => { const c = w.querySelector(`[data-z="${s.z}"]`), i = document.createElement("img"); i.className = "l"; i.alt = ""; if (window.CC_LENES && document.body.classList.contains("ac")===false||!window.CC_ACORDEON||!window.CC_ACORDEON.oprit()) i.dataset.lz = P + s.fn; else i.src = P + s.fn; i.dataset.t = s.t; i.dataset.p = s.p; c.insertBefore(i, c.querySelector(".h79-pin")); });
    w.querySelectorAll("figure").forEach(f => {
      const stare = { t: { F: true, P: true, A: true, B: true }, p: { 10: true, 100: true, 1000: true } };   /* v82.10.0 (Manu, 09.11.2026): toate straturile pornesc bifate și se pot debifa, inclusiv apa care băltește */
      const apl = () => f.querySelectorAll("img.l").forEach(i => { const on = i.dataset.p === "x" ? stare.t[i.dataset.t] : stare.t[i.dataset.t] && stare.p[i.dataset.p]; i.style.opacity = on ? 1 : 0; });
      f.querySelectorAll("button:not([disabled])").forEach(b => b.onclick = () => { const on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on); if (b.dataset.p) stare.p[b.dataset.p] = on; else stare.t[b.dataset.t] = on; if (on && window.CC_LENES) window.CC_LENES.arata(f); apl(); });
      apl();
    });
  }
  setInterval(() => { try { if (typeof D !== "undefined" && D && D.id) inundatii(D); } catch (e) { console.warn("inundatii", e); } }, 900);


  /* o imagine de hartă care nu s-a încărcat (rețea, Drive lent) se reîncearcă de 4 ori, ca harta să nu rămână goală */
  addEventListener("error", e => { const t = e.target; if (!t || !t.tagName || !/^image$/i.test(t.tagName)) return; const n = +(t.dataset.ret || 0); if (n >= 4) return; t.dataset.ret = n + 1;
    const h = (t.getAttribute("href") || "").split("?r=")[0]; setTimeout(() => t.setAttribute("href", h + "?r=" + (n + 1)), 1500 * (n + 1)); }, true);

  /* ---------- contrast minim 4,5:1 pe orice text: culoarea textului se corectează (alb sau negru) față de fundalul real ---------- */
  const pc = v => { let m = v.match(/^rgba?\(([^)]+)\)/); if (m) { const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { c: p.slice(0, 3), a: p.length > 3 ? p[3] : 1 }; }
    m = v.match(/^color\(srgb ([^)]+)\)/); if (m) { const p = m[1].split(/[ \/]+/).filter(Boolean).map(Number); return { c: p.slice(0, 3).map(x => x * 255), a: p.length > 3 ? p[3] : 1 }; } return null; };
  const lu = c => { const [r, g, b] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b; };
  const cr = (a, b) => { const x = lu(a), y = lu(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  function fundal(el) { const st = []; for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.backgroundImage !== "none") return null; const p = pc(cs.backgroundColor); if (p && p.a > 0) { st.push(p); if (p.a >= .99) break; } } let c = [255, 255, 255]; for (let i = st.length - 1; i >= 0; i--) c = c.map((v, k) => v * (1 - st[i].a) + st[i].c[k] * st[i].a); return c; }
  function contrast() {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n, k = 0;
    while ((n = w.nextNode()) && k < 6000) {
      const e = n.parentElement; if (!e || !/[\p{L}\p{N}]/u.test(n.nodeValue) || e.closest(".pzc b,script,style,svg,canvas,#cc-splash,.hero,.hg-ph,figure,figcaption,.gn-cov,.gn-i,.cn-hd,.p2-cov,.hx-k,.ax")) continue; k++;
      if (e.dataset.cfix === "1") continue;
      const cs = getComputedStyle(e); if (cs.display === "none" || cs.visibility === "hidden") continue;
      const f = pc(cs.color); if (!f) continue; const b = fundal(e); if (!b || cs.textShadow !== "none") continue;
      if (cr(f.c, b) < 4.5) { e.dataset.cfix = "1"; e.style.color = cr([20, 24, 40], b) >= cr([255, 255, 255], b) ? "#141828" : "#ffffff"; }
    }
  }
  window.CC_CONTRAST = contrast;   // după oprirea cronometrelor, acordeonul îl cheamă la fiecare capitol deschis
  setInterval(() => { try { contrast(); } catch (e) {} }, 1800);
})();
