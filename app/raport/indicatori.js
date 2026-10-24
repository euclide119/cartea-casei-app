/* Raport în creștere — „Ce poți construi aici”: indicatorii urbanistici ai proprietății, cu TREAPTA de încredere și sursa.
   Citește D.indicatori_urbanistici (scris de indicatori.py în p/<id>/date.json). Se montează singur în capitolul Urbanism (#urbanism),
   sub titlu; sondează ca și concluzii.js, ca să se refacă la schimbarea proprietății. Blocul are clasa .keep: rămâne vizibil și în „Simplu”.
   Treptele: 1 exact din PUG digital (verde) · 2 din regulamentul PUG (albastru) · 3 din lege (galben) · 4 estimat (gri) · 0 temei lipsă (contur). */
(function () {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const TR = {
    1: ["Exact din PUG digital", "exact", "#1f8a4c", "#fff"], 2: ["Din regulamentul PUG", "regulament", "#2c5c9c", "#fff"],
    3: ["Din lege", "lege", "#e0b400", "#1a1e2a"], 4: ["Estimat din vecini", "estimat", "#7b847f", "#fff"], 0: ["Temei lipsă", "temei lipsă", "transparent", "var(--muted)"]
  };
  let last = null;

  function css() {
    if (document.getElementById("ind-css")) return;
    const s = document.createElement("style"); s.id = "ind-css";
    s.textContent = `
#ind-box{margin:14px 0 18px;padding:14px 16px;background:var(--panel);border:1px solid var(--line);border-radius:12px}
#ind-box h3{font:700 18px var(--font);margin:0 0 2px;letter-spacing:-.01em}
#ind-box .ind-sub{font:12.5px var(--font);color:var(--muted);margin:0 0 10px}
#ind-box .ind-sum{margin:0 0 10px;padding:0 0 0 18px;font:14px/1.45 var(--font)} #ind-box .ind-sum li{margin:2px 0}
#ind-box .ind-leg{display:flex;flex-wrap:wrap;gap:6px 12px;margin:8px 0 10px;font:12.5px var(--font);color:var(--muted)}
.ind-p{display:inline-flex;align-items:center;gap:5px;font:600 11.5px var(--font);padding:2px 8px 2px 6px;border-radius:99px;white-space:nowrap;border:1.5px solid transparent}
.ind-p.t0{border:1.5px dashed var(--muted)}
.ind-p i{font-style:normal;font-weight:700}
.ind-zona{margin:0 0 10px;padding:8px 10px;border-left:3px solid #c86a0a;background:color-mix(in srgb,#c86a0a 9%,transparent);font:13px/1.45 var(--font);border-radius:0 8px 8px 0}
.ind-g{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 4px;padding-bottom:3px;border-bottom:1.5px solid var(--fg)}
.ind-r{display:grid;grid-template-columns:minmax(120px,.8fr) minmax(0,2.3fr) minmax(110px,.75fr) minmax(0,1.3fr);gap:6px 14px;padding:9px 0;border-bottom:1px solid var(--line);align-items:start;font:13.5px/1.4 var(--font)}
.ind-r.h{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:var(--muted);border-bottom:1.5px solid var(--fg);padding:6px 0}
.ind-r b{font-weight:650}
.ind-v{overflow-wrap:anywhere}
.ind-v .al{margin-top:5px;padding:5px 8px;border-radius:7px;background:color-mix(in srgb,var(--muted) 9%,transparent);font-size:12.5px}
.ind-v .al .ind-p{margin-right:6px;font-size:10.5px;padding:1px 6px 1px 5px}
.ind-v .tag{display:inline-block;font:600 10.5px var(--font);padding:1px 6px;border-radius:5px;margin:4px 4px 0 0;background:color-mix(in srgb,#c86a0a 14%,transparent);color:#c86a0a}
.ind-v .tag.r{background:color-mix(in srgb,#c0322b 14%,transparent);color:#c0322b}
.ind-v details{margin-top:4px;font-size:12.5px;color:var(--muted)} .ind-v summary{cursor:pointer;color:var(--fg);font-weight:600;font-size:12px}
.ind-s{font-size:12px;color:var(--muted);overflow-wrap:anywhere}
.ind-foot{margin:12px 0 0;font:12px/1.45 var(--font);color:var(--muted)}
@media (max-width:760px){.ind-r{grid-template-columns:1fr}.ind-r.h{display:none}.ind-r>.ind-t{order:2}.ind-r>.ind-n{font-size:14px}}`;
    document.head.appendChild(s);
  }

  const pill = (t, mic) => { const [nume, , bg, fg] = TR[t] || TR[0]; const e = t === 4 ? "E" : t === 0 ? "—" : "V";
    return `<span class="ind-p t${t}" style="background:${bg};color:${fg}" title="${esc(nume)}"><i>${t === 0 ? "○" : "✓"}</i>${mic ? "" : esc(TR[t][1])} <i>[${e}]</i></span>`; };

  function randare(d) {
    const I = d.indicatori_urbanistici;
    const sec = document.getElementById("urbanism"); if (!sec) return;
    let box = document.getElementById("ind-box");
    if (!I) { if (box) box.remove(); last = d.id; return; }
    if (!box) {
      box = document.createElement("div"); box.id = "ind-box"; box.className = "keep";
      const cap = sec.firstElementChild; cap ? cap.after(box) : sec.prepend(box);
    }
    const cnt = {}; I.indicatori.forEach(r => cnt[r.treapta] = (cnt[r.treapta] || 0) + 1);
    const grupuri = []; I.indicatori.forEach(r => { let g = grupuri.find(x => x[0] === r.grup); if (!g) grupuri.push(g = [r.grup, []]); g[1].push(r); });
    const rand = r => `<div class="ind-r" role="row"><div class="ind-n" role="cell"><b>${esc(r.nume)}</b></div>
      <div class="ind-v" role="cell">${esc(r.valoare)}
        ${r.conditionat ? `<span class="tag" title="Valoarea depinde de zona (UTR) a parcelei, care nu e determinată">depinde de zonă</span>` : ""}${r.risc ? `<span class="tag r">de verificat</span>` : ""}
        ${(r.alte || []).map(a => `<div class="al">${pill(a.treapta, true)}${esc(a.valoare)}${a.nota ? `<div style="color:var(--muted);margin-top:2px">${esc(a.nota)}</div>` : ""}</div>`).join("")}
        ${r.nota ? `<details><summary>Notă</summary>${esc(r.nota)}</details>` : ""}</div>
      <div class="ind-t" role="cell">${pill(r.treapta)}</div>
      <div class="ind-s" role="cell">${esc(r.sursa)}</div></div>`;
    box.innerHTML = `<h3>Ce poți construi aici</h3>
      <p class="ind-sub">Indicatorii urbanistici ai proprietății, cu treapta de încredere și sursa; generat ${esc(I.generat)}. Doar tehnic.</p>
      <ul class="ind-sum">${I.sumar.map(s => `<li>${esc(s)}</li>`).join("")}</ul>
      <div class="ind-leg">${[1, 2, 3, 4, 0].map(t => `<span>${pill(t)} ${esc(TR[t][0])}: <b>${cnt[t] || 0}</b></span>`).join("")}</div>
      ${I.zona && I.zona.stare !== "determinată" ? `<div class="ind-zona"><b>Zona (UTR) nedeterminată.</b> ${esc(I.zona.nota)}</div>` : ""}
      <div role="table" aria-label="Indicatori urbanistici">
        <div class="ind-r h" role="row"><div role="columnheader">Indicator</div><div role="columnheader">Valoare sau interval</div><div role="columnheader">Treaptă</div><div role="columnheader">Sursă</div></div>
        ${grupuri.map(([g, L]) => `<div class="ind-g">${esc(g)}</div>${L.map(rand).join("")}`).join("")}
      </div>
      <p class="ind-foot"><b>Cum se citește.</b> [V] = verificat pe text oficial; [E] = estimare, de validat în certificatul de urbanism. Treapta 4 arată ce s-a construit în jur, nu ce e permis. „Temei lipsă” = nu avem textul oficial și nu concluzionăm. Temei folosit: ${esc(I.temei)}. ${esc(I.nota)}</p>`;
    last = d.id;
  }

  function porneste() {
    css();
    setInterval(() => {
      try { const d = typeof D !== "undefined" ? D : null;
        if (d && (d.id !== last || (d.indicatori_urbanistici && !document.getElementById("ind-box")))) randare(d); }
      catch (e) { console.warn("indicatori", e); }
    }, 900);
  }
  window.RIC_INDICATORI = { randare };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
