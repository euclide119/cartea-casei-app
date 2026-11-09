/* Raportul casei · bara de scor segmentată și interactivă (v82.5.0, 07.11.2026, cerut de Manu: „bare mai întrepătrunse, cu linii mici verticale, fine, interactive, cu îngroșare în locul săgeții”).
   Modul nou, peste `.vb-t` (bara cu săgeată din vecinatate.js, folosită la capitole și la secțiuni): fără schimbarea datelor sau a săgeții.
   · 30–60 de linii verticale fine, culoare continuă roșu → chihlimbar → verde (după poziția fiecărei linii);
   · v82.10.0: liniile au lățime egală și poziție fixă; îngroșarea e doar vizuală (scaleX), ca săgeata să cadă exact peste linia marcată;
   · liniile până la săgeată sunt pline, cele de după sunt estompate; în jurul săgeții liniile se îngroașă și cresc (clopot);
   · hover / atingere / deget tras: accentul urmărește cursorul și arată valoarea din acel punct („63 %”); la ieșire revine la săgeată;
   · tastatură: bara are focus, săgețile stânga/dreapta mută accentul; fără animații pentru cine cere „reduce motion”;
   · tipar/PDF: liniile se tipăresc cu culorile lor, accentul rămâne la săgeată. */
(function () {
  "use strict";
  if (window.parent !== window && /[?&]embed=1/.test(location.search)) return;
  const css = `
.vb-t.sg{border:0!important;background:none!important;height:26px;display:flex;align-items:flex-end;gap:1.5px;padding:0;cursor:crosshair;touch-action:pan-y;overflow:visible;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.vb-t.sg s{display:block;text-decoration:none;flex:1 1 0;min-width:1px;border-radius:1px;transform-origin:50% 100%;transition:transform .12s ease-out,opacity .12s}
.vb-t.sg.sg-mic{height:12px}.vb-t.sg.sg-mic s{border-radius:0}
.vb-t.sg i{top:-9px!important;border-left-width:6px!important;border-right-width:6px!important;border-top-width:8px!important;pointer-events:none;z-index:2;transition:left .12s ease-out}
.vb-t.sg b.sg-v{position:absolute;top:-24px;transform:translateX(-50%);font:700 12px/1 var(--mono,monospace);color:#1a1e2a;background:#fff;border:1px solid #1a1e2a;border-radius:6px;padding:3px 6px;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .12s;z-index:3}
.vb-t.sg.sg-on b.sg-v{opacity:1}
.vb-t.sg:focus-visible{outline:2px solid #1a1e2a;outline-offset:4px;border-radius:4px}
@media (prefers-reduced-motion:reduce){.vb-t.sg s,.vb-t.sg i,.vb-t.sg b.sg-v{transition:none}}
@media print{.vb-t.sg b.sg-v{display:none}.vb-t.sg{cursor:default}}`;
  const st = document.createElement("style"); st.id = "sg-stil"; st.textContent = css; (document.head || document.documentElement).appendChild(st);

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  /* paletă fină, fără ocru/oliv: coral → portocaliu cald → galben-miere luminos → lămâie proaspătă → verde de iarbă de primăvară.
     Galbenul rămâne luminos (L ≥ 56 %), ca să nu iasă măsliniu; trecerea spre verde se face prin lămâie, nu prin kaki. */
  const PCT = [[0, -2, 70, 60], [0.30, 22, 82, 58], [0.50, 42, 88, 60], [0.70, 86, 58, 56], [1, 118, 50, 50]];
  const hsl = p => { let k = 0; while (k < PCT.length - 2 && p > PCT[k + 1][0]) k++; const a = PCT[k], b = PCT[k + 1], t = clamp((p - a[0]) / (b[0] - a[0]), 0, 1), L = i => a[i] + (b[i] - a[i]) * t; return [((L(1) % 360) + 360) % 360, L(2), L(3)]; };
  /* g = cât de aproape e linia de accent (0–1): lângă accent culoarea e puțin mai vie și mai luminoasă, departe se dezsaturează ușor → degradeul urmează punctul îngroșat */
  const col = (p, g) => { const c = hsl(p), gg = g == null ? 1 : g; return `hsl(${c[0].toFixed(0)} ${(c[1] * (0.82 + 0.18 * gg)).toFixed(0)}% ${Math.min(72, c[2] + 4 * gg + (1 - gg) * 3).toFixed(0)}%)`; };

  function pune(el) {
    if (el.dataset.sg) return;
    const ar = el.querySelector("i"); if (!ar) return;
    const pct = clamp(parseFloat(ar.style.left) || 0, 0, 100);
    el.dataset.sg = "1"; el.classList.add("sg");
    const w = el.getBoundingClientRect().width || 200, mic = el.getBoundingClientRect().height < 9 && el.closest(".pp-t");
    if (mic) el.classList.add("sg-mic");
    const N = clamp(Math.round(w / 4.5), 30, 90), t = [], inalt = mic ? 12 : 26;
    for (let k = 0; k < N; k++) { const s = document.createElement("s"); s.dataset.p = ((k + 0.5) / N).toFixed(4); t.push(s); el.appendChild(s); }
    const v = document.createElement("b"); v.className = "sg-v"; el.appendChild(v);
    el.tabIndex = 0; el.setAttribute("role", "slider"); el.setAttribute("aria-valuemin", 0); el.setAttribute("aria-valuemax", 100); el.setAttribute("aria-valuenow", Math.round(pct)); el.setAttribute("aria-label", "scor, apropiat de " + Math.round(pct) + " din 100");
    const SIG = 0.075;   // lățimea „clopotului”, din lungimea barei
    function deseneaza(c, valoare) {   // c = centrul accentului (0–1); valoare = pct al săgeții (0–100)
      const lim = valoare / 100;
      t.forEach(s => {
        const p = +s.dataset.p, d = (p - c) / SIG, g = Math.exp(-d * d);
        const dg = (p - lim) / (SIG * 0.6), ga = Math.exp(-dg * dg);   // accent permanent la săgeată (mai îngust)
        const gg = Math.max(g, ga * 0.9);
        s.style.height = Math.round(inalt * (0.28 + 0.72 * gg)) + "px";
        s.style.transform = "scaleX(" + (1 + 1.1 * gg).toFixed(2) + ")";   // v82.10.0: îngroșare vizuală, liniile rămân egale și pe loc (fără flex-grow)
        s.style.opacity = p <= lim ? 1 : (0.4 + 0.55 * g);
        s.style.background = col(p, gg);
      });
    }
    let activ = false;
    const dinX = x => { const r = el.getBoundingClientRect(); return clamp((x - r.left) / (r.width || 1), 0, 1); };
    const arata = c => { activ = true; el.classList.add("sg-on"); deseneaza(c, pct); v.style.left = (c * 100) + "%"; v.textContent = Math.round(c * 100) + " %"; };
    const reset = () => { activ = false; el.classList.remove("sg-on"); deseneaza(pct / 100, pct); };
    el.addEventListener("pointermove", e => arata(dinX(e.clientX)), { passive: true });
    el.addEventListener("pointerdown", e => arata(dinX(e.clientX)), { passive: true });
    el.addEventListener("pointerleave", reset); el.addEventListener("pointercancel", reset);
    el.addEventListener("touchmove", e => { if (e.touches[0]) arata(dinX(e.touches[0].clientX)); }, { passive: true }); el.addEventListener("touchend", () => setTimeout(reset, 900));
    el.addEventListener("keydown", e => { if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return; e.preventDefault(); const c = clamp((activ ? parseFloat(v.style.left) / 100 : pct / 100) + (e.key === "ArrowRight" ? 0.05 : -0.05), 0, 1); arata(c); });
    el.addEventListener("blur", reset);
    const ix = clamp(Math.round(pct / 100 * N - 0.5), 0, N - 1), mk = t[ix]; ar.style.left = ((ix + 0.5) / N * 100).toFixed(2) + "%"; if (mk) {   // săgeata se așază pe centrul liniei marcate (≤ 1/2 pas de linia exactă)
    mk.style.outline = "1.5px solid #1a1e2a"; mk.style.outlineOffset = "0"; mk.style.zIndex = 1; }
    deseneaza(pct / 100, pct);
  }
  const scan = () => document.querySelectorAll(".vb-t:not([data-sg])").forEach(pune);
  setInterval(scan, 600); scan();
})();
