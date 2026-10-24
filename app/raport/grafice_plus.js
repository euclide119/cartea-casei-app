/* Cartea Casei ? graficul ?clasament cu bare? (C?t de departe sunt, sta?ii, ?coli, str?zi, popula?ie?), mai elegant (cerut de Manu, 22.10.2026).
   ?nlocuie?te HM.bars din harta.js, cu aceea?i semn?tur?: HM.bars(rows, {lw, max, color, aria}); rows = [{label, v, txt, color, hi}].
   Ce se schimb?: r?nduri HTML aerisite (nu SVG), bar? sub?ire cu cap?t rotunjit ?i punct, cifra ?ngro?at? ?i unitatea estompat?,
   cel mai apropiat r?nd eviden?iat pe distan?e, duplicatele identice (aceea?i arie ap?rut? de dou? ori) comasate, etichetele lungi trunchiate cu titlu complet. */
(function () {
  if (!window.HM) return;
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const nf = HM.nf || (v => String(v));
  if (!document.getElementById("eb-css")) {
    const s = document.createElement("style"); s.id = "eb-css";
    s.textContent = `
.eb{display:grid;gap:1px}
.eb-r{display:grid;grid-template-columns:minmax(var(--lw1,84px),var(--lw,150px)) minmax(0,1fr) auto;gap:4px 12px;align-items:center;padding:6px 8px;border-radius:8px}
.eb-r + .eb-r{border-top:1px solid color-mix(in srgb,var(--line) 55%,transparent)}
.eb-r.top{background:color-mix(in srgb,var(--c,var(--accent)) 9%,transparent);border-top-color:transparent}
.eb-l{font:500 13px/1.25 var(--font);color:var(--fg);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.eb-r.top .eb-l{font-weight:700}
.eb-t{position:relative;height:8px;border-radius:99px;background:color-mix(in srgb,var(--fg) 7%,transparent)}
.eb-f{position:absolute;inset:0 auto 0 0;border-radius:99px;background:linear-gradient(90deg,color-mix(in srgb,var(--c,var(--accent)) 38%,transparent),var(--c,var(--accent)))}
.eb-f::after{content:"";position:absolute;right:-1px;top:50%;width:12px;height:12px;margin-top:-6px;border-radius:50%;background:var(--c,var(--accent));border:2.5px solid var(--panel);box-shadow:0 0 0 1px color-mix(in srgb,var(--c,var(--accent)) 55%,transparent)}
.eb-v{font:600 13px var(--mono);font-variant-numeric:tabular-nums;color:var(--fg);text-align:right;white-space:nowrap}
.eb-v i{font-style:normal;font-weight:500;color:var(--muted);margin-left:3px;font-size:11.5px}
@media (max-width:520px){.eb-r{grid-template-columns:1fr auto;grid-template-areas:"l v" "t t"}.eb-l{grid-area:l}.eb-v{grid-area:v}.eb-t{grid-area:t}}`;
    document.head.appendChild(s);
  }
  function bars(rows, o) {
    o = o || {};
    const vazut = new Set(), R = (rows || []).filter(r => { const k = r.label + "|" + (r.txt ?? r.v); if (vazut.has(k)) return false; vazut.add(k); return true; });
    if (!R.length) return "";
    const mx = o.max || Math.max(...R.map(r => r.v), 1);
    const dist = R.length > 2 && R.every(r => /(km|m|min)\s*$/.test(String(r.txt ?? ""))) && new Set(R.map(r => r.v)).size > 1;
    const best = dist ? R.reduce((b, r, i) => (r.v < R[b].v ? i : b), 0) : -1;
    const lw = o.lw || 150;
    return `<div class="eb" role="list" aria-label="${esc(o.aria || "clasament")}" style="--lw:${lw}px;--lw1:${Math.round(lw * 0.55)}px">` + R.map((r, i) => {
      const col = r.color || o.color || "var(--accent)", w = Math.max(2.5, 100 * r.v / mx), t = r.txt != null ? String(r.txt) : nf(r.v);
      const m = t.match(/^(~?[\d.,\u2212-]+)\s*(.*)$/), val = m ? `${esc(m[1])}<i>${esc(m[2].length > 24 ? m[2].slice(0, 23) + "\u2026" : m[2])}</i>` : esc(t.length > 34 ? t.slice(0, 33) + "\u2026" : t);
      const top = (r.hi === true || i === best);
      return `<div class="eb-r${top ? " top" : ""}" role="listitem" style="--c:${col};${r.hi === false ? "opacity:.6" : ""}" title="${esc(r.label)} \u00b7 ${esc(t)}"><span class="eb-l">${esc(r.label)}</span><span class="eb-t"><span class="eb-f" style="width:${w}%"></span></span><span class="eb-v">${val}</span></div>`;
    }).join("") + `</div>`;
  }
  HM.bars = bars;
})();
