/* Raport în creștere — fila „Surse”: registrul surselor de date (surse.json, copiat din DD/colectare_date/surse.json).
   Pentru fiecare sursă: ce informație dă, ce pagini de raport alimentează, cum se extrage (API, ArcGIS, descărcare, scraping, manual),
   dacă se interoghează live la fiecare raport sau se ține local, licența, cine o poate aduna și cum se verifică.
   Butoanele de capitol filtrează tabelul; din fiecare pagină a raportului, linkul „toate sursele” deschide fila filtrată pe capitol.
   Se leagă de index.html prin: secțiunea #surse, butonul de filă data-t="surse" și window.showTab. */
(function () {
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ST = { in_raport: ["în raport", "#1f8a4c"], testat: ["testat", "#2c5c9c"], planificat: ["planificat", "#6b7280"], blocat: ["blocat", "#c86a0a"], manual: ["manual", "#6b7280"], interzis: ["interzis automat", "#c0322b"] };
  let SR = null, cap = "", q = "";

  function css() {
    if (document.getElementById("sr-css")) return;
    const s = document.createElement("style"); s.id = "sr-css";
    s.textContent = `
.sr-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px}
.sr-chips{display:flex;flex-wrap:wrap;gap:6px}
.sr-chips button{font:500 12.5px var(--font);padding:4px 10px;border-radius:99px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
.sr-chips button[aria-pressed="true"]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.sr-chips button span{opacity:.6;margin-left:4px}
.sr-t{width:100%;border-collapse:collapse;font:13px var(--font)}
.sr-t th{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.04em;color:var(--muted);text-align:left;padding:7px 6px;border-bottom:1.5px solid var(--fg);vertical-align:bottom}
.sr-t td{text-align:left;padding:8px 6px;border-bottom:1px solid var(--line);vertical-align:top;font-family:var(--font)}
.sr-t td b a{color:var(--fg)} .sr-t .d{color:var(--muted);font-size:12px} .sr-t .ep{font:11px var(--mono);color:var(--muted);overflow-wrap:anywhere}
.sr-p{display:inline-block;font:600 11px var(--font);padding:2px 8px;border-radius:99px;color:#fff;white-space:nowrap;margin:0 3px 3px 0}
.sr-lv{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px}
.sr-q{font:14px var(--font);padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--fg);min-width:220px}
.sr-link{font-size:12.5px;color:var(--muted);cursor:pointer;text-decoration:underline}
@media (max-width:700px){.sr-t thead{display:none}.sr-t tr{display:block;padding:8px 0;border-bottom:1px solid var(--line)}.sr-t td{display:block;border:0;padding:2px 0}}`;
    document.head.appendChild(s);
  }
  const capN = c => (SR && SR.capitole && SR.capitole[c]) || c;

  function render() {
    const sec = document.getElementById("surse"); if (!sec || !SR) return;
    const L = SR.surse || [], n = f => L.filter(f).length;
    const caps = {}; L.forEach(x => (x.cap || []).forEach(c => caps[c] = (caps[c] || 0) + 1));
    const ql = q.toLowerCase();
    const rows = L.filter(x => (!cap || (x.cap || []).includes(cap)) && (!ql || JSON.stringify(x).toLowerCase().includes(ql)));
    sec.innerHTML = `<div><h2>Surse de date</h2><p class="lead">De unde vine fiecare informație din raport, cum se extrage, dacă se verifică live la fiecare raport sau se ține pe serverul nostru, ce licență are și cine o poate aduna. Registrul e același cu cel din Cockpitul DD (actualizat ${esc(SR.actualizat || "—")}).</p></div>
      <div class="sr-k">${[[L.length, "surse în registru"], [n(x => x.stare === "in_raport"), "folosite deja în raport"], [n(x => x.live === "da"), "interogate live, pe proprietate"], [n(x => /^da/.test(x.local || "")), "ținute local"], [n(x => x.stare === "interzis" || x.stare === "blocat"), "interzise sau blocate"]].map(([b, t]) => `<div class="card"><b>${b}</b><span>${t}</span></div>`).join("")}</div>
      <div class="sr-chips" role="group" aria-label="Pagina de raport"><button type="button" data-c="" aria-pressed="${!cap}">Toate<span>${L.length}</span></button>${Object.keys(caps).sort((a, b) => caps[b] - caps[a]).map(c => `<button type="button" data-c="${esc(c)}" aria-pressed="${cap === c}">${esc(capN(c))}<span>${caps[c]}</span></button>`).join("")}</div>
      <input class="sr-q" type="search" placeholder="Caută: ArcGIS, PUZ, licență…" aria-label="Caută în surse" value="${esc(q)}">
      <div class="scroll"><table class="sr-t"><thead><tr><th>Sursă</th><th>Ce informație</th><th>Pagini</th><th>Extragere</th><th>Live / local</th><th>Descărcat · finisat · GB</th><th>Licență</th><th>Stare · cine</th><th>Cum se verifică</th></tr></thead><tbody>
      ${rows.map(x => { const st = ST[x.stare] || [x.stare, "#6b7280"], lv = x.verificare_live;
        return `<tr><td>${lv ? `<span class="sr-lv" style="background:${lv.ok ? "var(--ok)" : "var(--hz10)"}" title="verificat ${esc(lv.data)} · ${esc(lv.cod)}"></span>` : ""}<b>${/^https?:/.test(x.url || "") ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.sursa)}</a>` : esc(x.sursa)}</b><div class="d">${esc(x.institutie || "")}</div>${x.endpoint ? `<div class="ep">${esc(x.endpoint)}</div>` : ""}</td>
          <td>${esc(x.info)}</td><td>${(x.cap || []).map(c => `<span class="d">${esc(capN(c))}</span>`).join("<br>")}</td><td>${esc(x.extr)}</td>
          <td>${x.live === "da" ? `<span class="sr-p" style="background:#1f8a4c">live</span>` : ""}${/^da/.test(x.local || "") ? `<span class="sr-p" style="background:#2c5c9c">local</span>` : ""}<div class="d">${esc([x.marime, x.refresh].filter(v => v && v !== "—").join(" · "))}</div></td>
          <td>${x.desc ?? 0}% · ${x.fin ?? 0}%<div class="d">${esc(x.gb ? (x.gb >= 1 ? x.gb + " GB" : Math.round(x.gb * 1000) + " MB") + " Timiș" : "—")}${x.gb_tara > x.gb ? " · " + (x.gb_tara >= 1 ? x.gb_tara + " GB" : Math.round(x.gb_tara * 1000) + " MB") + " țara" : ""}</div></td>
          <td>${esc(x.licenta || "")}<div class="d">automat: ${esc(x.auto || "—")}</div></td>
          <td><span class="sr-p" style="background:${st[1]}">${esc(st[0])}</span><div class="d">${esc(x.deleg || "")}</div></td>
          <td>${esc(x.verif || "")}${x.nota ? `<div class="d">${esc(x.nota)}</div>` : ""}</td></tr>`; }).join("")}
      </tbody></table></div>
      <p class="note">${rows.length} din ${L.length} surse. Punctul colorat = ultima verificare automată a sursei (verde: răspunde; roșu: nu răspunde).</p>`;
    sec.querySelectorAll(".sr-chips button").forEach(b => b.onclick = () => { cap = b.dataset.c; render(); });
    const inp = sec.querySelector(".sr-q"); inp.oninput = () => { q = inp.value; const p = inp.selectionStart; render(); const i2 = sec.querySelector(".sr-q"); i2.focus(); try { i2.setSelectionRange(p, p); } catch (e) {} };
  }
  /* în fiecare pagină de raport: linkul „toate sursele acestui capitol” */
  function linkuri() {
    if (!SR) return;
    const caps = new Set(); (SR.surse || []).forEach(x => (x.cap || []).forEach(c => caps.add(c)));
    document.querySelectorAll("section[id]").forEach(sec => {
      if (!caps.has(sec.id) || sec.querySelector(".sr-link")) return;
      const nr = SR.surse.filter(x => (x.cap || []).includes(sec.id)).length;
      const a = document.createElement("p"); a.className = "note";
      a.innerHTML = `<span class="sr-link" role="link" tabindex="0">Toate cele ${nr} surse ale acestei pagini, cu modul de extragere →</span>`;
      const go = () => { cap = sec.id; q = ""; render(); window.showTab("surse"); };
      a.firstChild.onclick = go; a.firstChild.onkeydown = e => e.key === "Enter" && go();
      sec.appendChild(a);
    });
  }
  async function porneste() {
    css();
    try { SR = await (await fetch("surse.json", { cache: "no-cache" })).json(); } catch (e) { SR = null; }
    const tab = document.querySelector('nav [data-t="surse"]'); if (tab) tab.hidden = !SR;
    render(); linkuri();
    setInterval(linkuri, 1500);   // paginile se redesenează la schimbarea proprietății: linkurile se pun din nou
  }
  window.RIC_SURSE = { porneste, render };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", porneste); else porneste();
})();
