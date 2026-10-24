/* Raport în creștere — selectorul de raport (cerut de Manu, 20.10.2026).
   Pentru fiecare proprietate alegem ce capitole intră în raportul clientului și ce verdict primește fiecare:
     bine        „Arată bine”                      verde
     verificat   „De verificat”                    portocaliu
     rau         „Nu arată bine” (concludent)      roșu
     neconcl     „Neconcludent” (date insuficiente) gri
     info        „Informativ” (fapt fără judecată: costuri, timpi, compoziția cartierului) albastru
     auto        verdictul sugerat din date
   Presetări pe tip de proprietate (apartament / casă / teren). Selecția se salvează în baza artefactului
   (colecția „selectii”, un document pe proprietate); fără bază (pagină deschisă local) se ține în browser.
   raport.py --selectie citește același document (exportat de Claude) și face PDF-ul doar cu capitolele bifate.
   „Mod client”: tab-urile arată doar capitolele bifate, fiecare cu verdictul și nota noastră; Rezumatul devine semafor.
   Se leagă de index.html prin: D și HR (variabile globale „let” ale paginii), showTab, VEC (vecinatate.js). Se încarcă după scriptul paginii. */
(function () {
  const gD = () => { try { return D; } catch (e) { return null; } }, gHR = () => { try { return HR; } catch (e) { return null; } };
  const { VER, CAP } = window.RIC_VERDICT;
  const TIP = {
    apartament: { n: "Apartament", fara: ["pv"], nota: "La apartament contează blocul: risc seismic, însorirea etajului, vecinătatea; fotovoltaicul nu ține de proprietar." },
    casa: { n: "Casă", fara: [], nota: "La casă intră toate capitolele." },
    teren: { n: "Teren", fara: ["scoli", "populatie"], nota: "La teren contează ce poți construi: urbanism, zonare, inundații, utilități, acces; școlile și populația sunt secundare." }
  };
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = s => document.querySelector(s);
  let db = null, S = null, pid = null, client = false, unsub = null, timer = null;

  const sugerat = k => window.RIC_VERDICT.sugerat(k, gD(), gHR());
  const efectiv = (k) => { const v = S.cap[k]?.verdict || "auto"; return v === "auto" ? sugerat(k)[0] : v; };

  /* ---------- starea ---------- */
  function implicit(tip) {
    const cap = {};
    CAP.forEach(([k]) => { cap[k] = { inclus: !TIP[tip].fara.includes(k) && !!document.getElementById(k) && !document.querySelector(`nav [data-t="${k}"]`)?.hidden, verdict: "auto", nota: "" }; });
    return { tip, cap, actualizat: null };
  }
  const cheie = () => "ric-selectie-" + pid;
  async function citeste() {
    if (db) { try { const s = await db.doc("selectii/" + pid).get(); if (s && s.exists) return s.data(); } catch (e) {} }
    try { const t = localStorage.getItem(cheie()); if (t) return JSON.parse(t); } catch (e) {}
    return null;
  }
  function salveaza(imediat) {
    S.actualizat = new Date().toISOString();
    try { localStorage.setItem(cheie(), JSON.stringify(S)); } catch (e) {}
    clearTimeout(timer);
    const f = async () => { if (!db) { stare("salvat în acest browser (pagina nu are baza artefactului)"); return; }
      try { await db.doc("selectii/" + pid).set(Object.assign({ proprietate: pid, eticheta: gD()?.eticheta || pid }, S)); stare("salvat · " + new Date().toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })); }
      catch (e) { stare("nu s-a putut salva în bază (" + (e.code || e.message || "eroare") + "); rămâne în acest browser"); } };
    if (imediat) f(); else timer = setTimeout(f, 700);
  }
  const stare = t => { const el = $("#bld-stare"); if (el) el.textContent = t; };

  /* ---------- interfața ---------- */
  function css() {
    if ($("#bld-css")) return;
    const s = document.createElement("style"); s.id = "bld-css";
    s.textContent = `
.bld-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.bld-btn{font:600 13px var(--font);padding:7px 12px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
.bld-btn.prim{background:var(--fg);color:var(--panel);border-color:var(--fg)}
.bld-btn[aria-pressed="true"]{background:var(--accent);color:#fff;border-color:var(--accent)}
#builder .bld-top{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center}
#builder select{font:500 14px var(--font)}
.bld-tab{width:100%;border-collapse:collapse;font:14px var(--font)}
.bld-tab th{font:600 11px var(--mono);text-transform:uppercase;letter-spacing:.05em;color:var(--muted);text-align:left;padding:8px 6px;border-bottom:1.5px solid var(--fg)}
.bld-tab td{padding:9px 6px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}
.bld-tab tr.off td{opacity:.45}
.bld-tab .cn b{display:block;font-weight:600} .bld-tab .cn a{font-size:12px;color:var(--muted)}
.bld-sug{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--muted)}
.bld-dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex:none}
.bld-seg{display:flex;flex-wrap:wrap;gap:3px;min-width:330px}
.bld-seg button{font:600 11px var(--font);padding:4px 7px;border-radius:6px;border:1px solid var(--line);background:var(--panel);color:var(--fg);cursor:pointer}
.bld-seg button[aria-pressed="true"]{color:#fff}
.bld-tab input[type=text]{width:100%;min-width:140px;font:13px var(--font);padding:6px 8px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg)}
.bld-tab input[type=checkbox]{width:18px;height:18px}
.bld-sum{display:flex;flex-wrap:wrap;gap:8px}
.bld-pill{font:600 12px var(--font);padding:4px 10px;border-radius:99px;color:#fff}
.bld-v{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:8px;font-size:14.5px;border-left:5px solid}
.bld-v i{font:600 11px var(--mono);text-transform:uppercase;font-style:normal;white-space:nowrap;padding-top:2px}
.bld-sem{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:8px}
.bld-sem a{display:grid;grid-template-columns:14px minmax(0,1fr);gap:10px;align-items:start;text-decoration:none;color:var(--fg);background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.bld-sem a b{display:block;font-size:14px} .bld-sem a span{font-size:12.5px;color:var(--muted)}
body.mod-client .soon{display:none}
@media (max-width:700px){.bld-tab thead{display:none}.bld-tab tr{display:grid;grid-template-columns:28px minmax(0,1fr);gap:4px 8px;padding:8px 0;border-bottom:1px solid var(--line)}.bld-tab td{border:0;padding:2px}.bld-tab td:nth-child(n+3){grid-column:2}}`;
    document.head.appendChild(s);
  }
  function montaj() {
    css();
    const brand = $(".brand");
    if (!$("#bld-open")) {
      const bar = document.createElement("div"); bar.className = "bld-bar";
      bar.innerHTML = `<button type="button" class="bld-btn prim" id="bld-open">Generează raportul</button><button type="button" class="bld-btn" id="bld-client" aria-pressed="false">Mod client</button>`;
      brand.appendChild(bar);
      $("#bld-open").onclick = () => { client && comuta(false); deschide(); };
      $("#bld-client").onclick = () => comuta(!client);
    }
    if (!$("#builder")) {
      const sec = document.createElement("section"); sec.id = "builder"; sec.hidden = true;
      document.querySelector(".wrap").appendChild(sec);
    }
  }
  function deschide() {
    document.querySelectorAll("nav [data-t]").forEach(b => b.setAttribute("aria-selected", "false"));
    document.querySelectorAll("section").forEach(s => s.hidden = s.id !== "builder");
    deseneaza();
    $("#builder").scrollIntoView({ block: "start" });
  }
  function deseneaza() {
    const sec = $("#builder"); if (!sec || !S) return;
    const n = { bine: 0, verificat: 0, rau: 0, neconcl: 0, info: 0 };
    CAP.forEach(([k]) => { if (S.cap[k]?.inclus) n[efectiv(k)]++; });
    const inc = CAP.filter(([k]) => S.cap[k]?.inclus).length;
    sec.innerHTML = `<div><h2>Generează raportul</h2><p class="lead">Bifezi ce capitole intră în raportul clientului și alegi verdictul fiecăruia. „Automat” ia verdictul calculat din date; îl schimbi când știi mai mult (actele, o vizită, un expert). Nota apare în raport, sub verdict.</p></div>
      <div class="bld-top"><label>Tipul proprietății <select id="bld-tip">${Object.entries(TIP).map(([k, t]) => `<option value="${k}"${S.tip === k ? " selected" : ""}>${t.n}</option>`).join("")}</select></label>
        <button type="button" class="bld-btn" id="bld-preset">Aplică presetarea tipului</button><button type="button" class="bld-btn" id="bld-toate">Bifează tot</button>
        <span class="note" id="bld-stare">${S.actualizat ? "ultima salvare " + new Date(S.actualizat).toLocaleString("ro-RO") : "nesalvat încă"}</span></div>
      <p class="note">${esc(TIP[S.tip].nota)}</p>
      <div class="bld-sum"><span class="note"><b>${inc}</b> capitole în raport:</span>${Object.entries(n).filter(([, v]) => v).map(([k, v]) => `<span class="bld-pill" style="background:${VER[k][1]}">${v} · ${VER[k][0].toLowerCase()}</span>`).join("")}</div>
      <div class="scroll"><table class="bld-tab"><thead><tr><th>În raport</th><th>Capitol</th><th>Sugerat din date</th><th>Verdictul nostru</th><th>Notă pentru client</th></tr></thead><tbody>
      ${CAP.map(([k, t]) => { const c = S.cap[k] || { inclus: false, verdict: "auto", nota: "" }, sg = sugerat(k), are = !!document.getElementById(k) && !document.querySelector(`nav [data-t="${k}"]`)?.hidden;
        return `<tr class="${c.inclus ? "" : "off"}" data-k="${k}"><td><input type="checkbox" aria-label="${esc(t)} în raport" ${c.inclus ? "checked" : ""} ${are ? "" : "disabled"}></td>
          <td class="cn"><b>${esc(t)}</b>${are ? `<a href="#" data-go="${k}">vezi pagina →</a>` : `<span class="note">fără date pentru proprietate</span>`}</td>
          <td><span class="bld-sug"><span class="bld-dot" style="background:${VER[sg[0]][1]}"></span>${esc(VER[sg[0]][0])} · ${esc(sg[1])}</span></td>
          <td><div class="bld-seg" role="group" aria-label="Verdict ${esc(t)}">${Object.entries(VER).map(([v, [lbl, col]]) => `<button type="button" data-v="${v}" aria-pressed="${c.verdict === v}" style="${c.verdict === v ? `background:${col};border-color:${col}` : ""}">${lbl}</button>`).join("")}</div></td>
          <td><input type="text" value="${esc(c.nota)}" placeholder="opțional"></td></tr>`; }).join("")}
      </tbody></table></div>
      <div class="bld-bar"><button type="button" class="bld-btn prim" id="bld-gata">Vezi raportul pentru client</button>
        <span class="note">PDF-ul de print cu aceeași selecție îl face Claude: „generează PDF-ul cu selecția pentru ${esc(gD()?.eticheta || pid)}”.</span></div>`;
    sec.querySelector("#bld-tip").onchange = e => { S.tip = e.target.value; salveaza(); deseneaza(); };
    sec.querySelector("#bld-preset").onclick = () => { const p = implicit(S.tip); CAP.forEach(([k]) => { S.cap[k] = Object.assign(S.cap[k] || {}, { inclus: p.cap[k].inclus }); }); salveaza(true); deseneaza(); };
    sec.querySelector("#bld-toate").onclick = () => { CAP.forEach(([k]) => { if (document.getElementById(k)) S.cap[k] = Object.assign(S.cap[k] || { verdict: "auto", nota: "" }, { inclus: true }); }); salveaza(true); deseneaza(); };
    sec.querySelector("#bld-gata").onclick = () => { salveaza(true); comuta(true); };
    sec.querySelectorAll("tr[data-k]").forEach(tr => { const k = tr.dataset.k, c = () => (S.cap[k] = S.cap[k] || { inclus: false, verdict: "auto", nota: "" });
      tr.querySelector("input[type=checkbox]").onchange = e => { c().inclus = e.target.checked; salveaza(); deseneaza(); };
      tr.querySelectorAll(".bld-seg button").forEach(b => b.onclick = () => { c().verdict = b.dataset.v; salveaza(); deseneaza(); });
      tr.querySelector("input[type=text]").oninput = e => { c().nota = e.target.value.slice(0, 400); salveaza(); };
      const a = tr.querySelector("[data-go]"); if (a) a.onclick = ev => { ev.preventDefault(); window.showTab(k); }; });
  }

  /* ---------- modul client ---------- */
  function comuta(on) {
    client = on; document.body.classList.toggle("mod-client", on);
    $("#bld-client").setAttribute("aria-pressed", on);
    CAP.forEach(([k]) => { const b = document.querySelector(`nav [data-t="${k}"]`); if (b) b.style.display = on && !S.cap[k]?.inclus ? "none" : ""; });
    aplicaVerdicte();
    window.showTab("rezumat");
  }
  function aplicaVerdicte() {
    document.querySelectorAll(".bld-v, #bld-sem").forEach(e => e.remove());
    document.querySelectorAll("section .verd").forEach(e => e.style.display = "");
    $("#sumcards") && ($("#sumcards").style.display = "");
    if (!client || !S) return;
    CAP.forEach(([k, t]) => { const sec = document.getElementById(k); if (!sec || !S.cap[k]?.inclus) return;
      const v = efectiv(k), [lbl, col] = VER[v], nota = S.cap[k].nota, sg = sugerat(k);
      const el = document.createElement("div"); el.className = "bld-v";
      el.style.cssText = `border-left-color:${col};background:color-mix(in srgb, ${col} 11%, transparent)`;
      el.innerHTML = `<i style="color:${col}">${lbl}</i><span>${esc(nota || sg[1])}</span>`;
      sec.querySelectorAll(".verd").forEach(e => e.style.display = "none");
      const first = sec.firstElementChild; first ? first.after(el) : sec.prepend(el); });
    const rez = $("#rezumat"); if (!rez) return;
    const sem = document.createElement("div"); sem.id = "bld-sem";
    const inc = CAP.filter(([k]) => S.cap[k]?.inclus);
    const n = { bine: 0, verificat: 0, rau: 0, neconcl: 0, info: 0 }; inc.forEach(([k]) => n[efectiv(k)]++);
    sem.innerHTML = `<div><h2>Pe scurt</h2><p class="lead">${esc(TIP[S.tip].n)} · ${inc.length} capitole verificate: ${Object.entries(n).filter(([, v]) => v).map(([k, v]) => `${v} ${VER[k][0].toLowerCase()}`).join(", ")}.</p></div>
      <div class="bld-sem">${["rau", "verificat", "neconcl", "info", "bine"].flatMap(v => inc.filter(([k]) => efectiv(k) === v).map(([k, t]) => `<a href="#" data-go="${k}"><span class="bld-dot" style="background:${VER[v][1]};width:14px;height:14px"></span><span><b>${esc(t)}</b><span>${esc(VER[v][0])} · ${esc(S.cap[k].nota || sugerat(k)[1])}</span></span></a>`)).join("")}</div>`;
    rez.prepend(sem);
    sem.querySelectorAll("[data-go]").forEach(a => a.onclick = ev => { ev.preventDefault(); window.showTab(a.dataset.go); });
    $("#sumcards") && ($("#sumcards").style.display = "none");
  }

  /* ---------- pornire: după fiecare încărcare de proprietate ---------- */
  async function porneste() {
    if (!gD()) return;
    montaj();
    if (pid === gD().id && S) { aplicaVerdicte(); return; }
    pid = gD().id;
    S = (await citeste()) || implicit("casa");
    CAP.forEach(([k]) => { if (!S.cap[k]) S.cap[k] = implicit(S.tip).cap[k]; });
    if (unsub) { try { unsub(); } catch (e) {} unsub = null; }
    if (db) { try { unsub = db.doc("selectii/" + pid).onSnapshot(s => { if (s && s.exists) { const d = s.data(); if (d.actualizat && d.actualizat !== S.actualizat) { S = d; if (!$("#builder").hidden) deseneaza(); aplicaVerdicte(); } } }); } catch (e) {} }
    if (!$("#builder").hidden) deseneaza();
    aplicaVerdicte();
  }
  window.RIC_BUILDER = { porneste, sugerat, CAP };
  (async () => { try { db = window.claude ? await window.claude.use("db") : null; } catch (e) { db = null; } if (gD()) { pid = null; porneste(); } })();
  const t0 = setInterval(() => { if (gD() && gD().id !== pid) porneste(); }, 400);   // proprietatea se schimbă din lista de sus
  setTimeout(() => clearInterval(t0), 3600 * 1000);
})();
