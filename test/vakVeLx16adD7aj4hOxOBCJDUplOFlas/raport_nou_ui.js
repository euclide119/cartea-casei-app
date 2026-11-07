/* Raportul Casei - „raport nou”, modul de generare (Manu, 06.11.2026). DOAR administrator, local: clientul nu vede nimic de aici (nu se încarcă și nu există pe linkul public).
   Dosarul cu toate datele (adresă, coordonate, CF, plan cadastral, acte, note) → serverul Cockpit (/api/raport_nou/…) → generare → poarta de integritate → notificare în aplicație.
   Mailurile nu se trimit (regula lui Manu): contactul de notificare se păstrează în dosar, iar mailul rămâne pregătit, netrimis. */
(function () {
  "use strict";
  if (window.CC_CLIENT || !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const api = (p, o) => fetch(p, Object.assign({ headers: { "X-CC": "1", "Content-Type": "application/json" } }, o)).then(r => r.json().then(j => Object.assign({ _s: r.status }, j)));
  const DOC = [["cf", "extras de carte funciară (actual)"], ["plan_cadastral", "plan cadastral / plan de încadrare"], ["act", "act de proprietate"], ["cu", "certificat de urbanism anterior"], ["puz", "PUZ / PUD / planșe de reglementări"], ["poze", "poze teren sau construcție"], ["releveu", "releveu / plan construcție (casă, apartament)"]];
  const MANUAL = ["extras CF actualizat din ePay (ANCPI)", "certificat de urbanism din arhiva primăriei", "PUZ / PUD vecin, din primărie", "certificat de atestare fiscală (taxe și datorii)"];
  const SPEC = ["opinie juridică (avocat)", "evaluare ANEVAR", "ridicare topografică", "inspecție tehnică a construcției", "certificat energetic"];
  const st = document.createElement("style"); st.textContent = `
#rn-m{position:fixed;inset:0;z-index:9000;background:rgba(20,22,30,.6);display:none;align-items:flex-start;justify-content:center;overflow:auto;padding:24px 12px}#rn-m.on{display:flex}
#rn-m .bx{background:#fff;color:#1a1e2a;border-radius:14px;max-width:880px;width:100%;padding:18px 22px 22px;font:14px/1.45 var(--font,system-ui)}
#rn-m h3{margin:0 0 4px;font-size:21px}#rn-m h4{margin:18px 0 6px;font-size:15px;border-top:1px solid #d9d6cf;padding-top:12px}
#rn-m .g{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px 12px}#rn-m label.c{display:flex;flex-direction:column;gap:3px;font-weight:600;font-size:13px}
#rn-m input[type=text],#rn-m input[type=number],#rn-m textarea{font:14px var(--font,system-ui);padding:7px 9px;border:1px solid #b9bdc6;border-radius:8px;width:100%;box-sizing:border-box}
#rn-m .doc{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px 10px;align-items:center;padding:6px 0;border-bottom:1px solid #eee}#rn-m .doc small{color:#4a5063}
#rn-m .doc.ok b::before{content:"✓ ";color:#1f8a4c}#rn-m .doc:not(.ok) b::before{content:"○ ";color:#8a8f9c}
#rn-m button{font:600 13px var(--font,system-ui);padding:8px 14px;border-radius:99px;border:1px solid #1a1e2a;background:#fff;cursor:pointer;color:#1a1e2a}#rn-m button.p{background:#1a1e2a;color:#fff}#rn-m button:disabled{opacity:.4;cursor:not-allowed}
#rn-m .res button{display:block;text-align:left;border-radius:8px;margin:3px 0;font-weight:500}#rn-m .ok{color:#1f6b3d;font-weight:600}#rn-m .er{color:#9a2a1f;font-weight:600}
#rn-m .tri{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:10px}#rn-m .tri>div{background:#f6f5f2;border-radius:10px;padding:8px 12px}#rn-m .tri b{display:block;margin-bottom:4px}#rn-m .tri li{margin:2px 0}
#rn-m .et{display:flex;gap:10px;align-items:baseline;padding:4px 0}#rn-m .et i{font-style:normal;width:22px}#rn-m .et small{color:#4a5063}
#rn-m .act{display:flex;gap:8px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}#rn-bell{position:fixed;left:12px;bottom:60px;z-index:80;max-width:340px}
#rn-bell .n{background:#1a1e2a;color:#fff;border-radius:12px;padding:10px 14px;margin-top:6px;box-shadow:0 4px 16px rgba(0,0,0,.35);font:13px/1.4 var(--font,system-ui)}#rn-bell a{color:#ffd24d;font-weight:700;cursor:pointer;text-decoration:underline}#rn-bell button{all:unset;cursor:pointer;float:right;margin-left:8px;opacity:.7}
@media print{#rn-m,#rn-bell{display:none!important}}`;
  document.head.appendChild(st);
  let loc = null, fisiere = {}, rulare = null, tim = null;

  function deschide() {
    let m = $("#rn-m"); if (!m) { m = document.createElement("div"); m.id = "rn-m"; document.body.appendChild(m); m.addEventListener("mousedown", e => { if (e.target === m) m.classList.remove("on"); }); }
    loc = null; fisiere = {}; clearInterval(tim);
    m.innerHTML = `<div class="bx" role="dialog" aria-modal="true" aria-label="raport nou"><h3>Raport nou · dosar de generare</h3><div style="color:#4a5063">Modul de generare, doar pentru administrator: clientul nu vede nimic de aici. Completează ce ai; ce lipsește apare în listă, jos.</div>
      <h4>1 · Locația</h4><div class="g"><label class="c" style="grid-column:1/-1">adresa sau coordonatele (căutare)<input type="text" id="rn-adr" placeholder="ex.: Strada Eroilor 12, Ghiroda  sau  45.73613, 21.30874"></label>
        <label class="c">strada<input type="text" id="rn-str"></label><label class="c">număr<input type="text" id="rn-nr"></label><label class="c">localitate<input type="text" id="rn-loc"></label><label class="c">județ<input type="text" id="rn-jud" value="Timiș"></label>
        <label class="c">latitudine<input type="number" step="0.000001" id="rn-lat"></label><label class="c">longitudine<input type="number" step="0.000001" id="rn-lon"></label></div>
      <div style="margin-top:8px"><button type="button" id="rn-caut">caută pe hartă</button> <span class="res" id="rn-res"></span></div>
      <label style="display:flex;gap:8px;margin-top:8px"><input type="checkbox" id="rn-ck"><span>confirm localizarea: punctul (pinul) este proprietatea pentru care vreau raportul</span></label>
      <h4>2 · Proprietatea</h4><div class="g"><div><div style="font-weight:600;font-size:13px;margin-bottom:4px">tipul</div>${[["casa", "casă"], ["apartament", "apartament"], ["teren", "teren"]].map(([v, t]) => `<label style="margin-right:12px"><input type="radio" name="rn-tip" value="${v}"> ${t}</label>`).join("")}</div>
        <label class="c">carte funciară (CF)<input type="text" id="rn-cf"></label><label class="c">număr cadastral<input type="text" id="rn-nc"></label><label class="c">suprafață (mp)<input type="text" id="rn-mp"></label></div>
      <h4>3 · Documente (opțional; se păstrează în dosar, nu ajung la client)</h4>
      ${DOC.map(([k, t]) => `<div class="doc" data-k="${k}"><div><b>${t}</b><br><small class="nm">nu e încărcat</small></div><label style="cursor:pointer"><span style="border:1px solid #1a1e2a;border-radius:99px;padding:6px 12px;font-weight:600;font-size:13px">alege fișier</span><input type="file" multiple style="display:none" data-k="${k}"></label></div>`).join("")}
      <h4>4 · Notificare și note</h4><div class="g"><label class="c">unde te anunțăm (mail sau telefon)<input type="text" id="rn-ct" placeholder="în aplicație, oricum; mailul rămâne pregătit, netrimis"></label><label class="c" style="grid-column:span 2">note pentru acest raport<textarea id="rn-nt" rows="2"></textarea></label></div>
      <h4>5 · Ce mai trebuie</h4><div class="tri" id="rn-tri"></div>
      <div id="rn-msg" style="margin-top:10px"></div><div id="rn-prog"></div>
      <div class="act"><button type="button" id="rn-x">închide</button><button type="button" id="rn-sv" disabled>salvează dosarul</button><button type="button" class="p" id="rn-go" disabled>execută raportul</button></div></div>`;
    m.classList.add("on"); $("#rn-adr").focus(); lista(); $("#rn-x").onclick = () => m.classList.remove("on");
    m.oninput = m.onchange = e => { if (e.target.matches("input[type=file]")) alege(e.target); if (e.target.id === "rn-lat" || e.target.id === "rn-lon") { const la = +$("#rn-lat").value, lo = +$("#rn-lon").value; if (la && lo) { loc = { lat: la, lon: lo }; } } valid(); };
    $("#rn-adr").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); cauta(); } }); $("#rn-caut").onclick = cauta;
    $("#rn-sv").onclick = () => trimite(false); $("#rn-go").onclick = () => trimite(true);
  }
  function valid() { const ok = loc && $("#rn-ck").checked && $("input[name=rn-tip]:checked"); $("#rn-sv").disabled = $("#rn-go").disabled = !ok; }
  function alege(inp) { fisiere[inp.dataset.k] = [...inp.files]; const d = inp.closest(".doc"); d.classList.toggle("ok", !!inp.files.length); $(".nm", d).textContent = inp.files.length ? [...inp.files].map(f => f.name + " (" + Math.round(f.size / 1024) + " KB)").join(", ") : "nu e încărcat"; lista(); }
  function lista() {
    const lipsa = DOC.filter(([k]) => !(fisiere[k] || []).length);
    $("#rn-tri").innerHTML = `<div><b>De încărcat de tine</b><ul style="margin:0;padding-left:18px">${lipsa.length ? lipsa.map(([, t]) => `<li>${t}</li>`).join("") : "<li>toate sunt încărcate ✓</li>"}</ul></div>
      <div><b>De căutat manual</b><ul style="margin:0;padding-left:18px">${MANUAL.map(t => `<li>${t}</li>`).join("")}</ul></div>
      <div><b>De la specialiști (comandă)</b><ul style="margin:0;padding-left:18px">${SPEC.map(t => `<li>${t}</li>`).join("")}</ul></div>`;
  }
  async function cauta() {
    const q = $("#rn-adr").value.trim(), r = $("#rn-res"); if (!q) return; loc = null; $("#rn-ck").checked = false; valid();
    const mm = q.match(/^\s*(-?\d{1,2}(?:[.,]\d+)?)\s*[,; ]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/), pune = (la, lo, et) => { loc = { lat: la, lon: lo, eticheta: et }; $("#rn-lat").value = la.toFixed(6); $("#rn-lon").value = lo.toFixed(6); r.innerHTML = `<span class="ok">${esc(et)} (${la.toFixed(6)}, ${lo.toFixed(6)})</span>`; valid(); };
    if (mm) return pune(+mm[1].replace(",", "."), +mm[2].replace(",", "."), "coordonate");
    r.textContent = "caut…";
    try { const L = await (await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&countrycodes=ro&q=" + encodeURIComponent(q), { headers: { "Accept-Language": "ro" } })).json();
      if (!L.length) { r.innerHTML = `<span class="er">nu am găsit adresa; scrie coordonatele (lat, lon)</span>`; return; }
      r.innerHTML = L.map((x, i) => `<button type="button" data-i="${i}">${esc(x.display_name)}</button>`).join("");
      $$("button", r).forEach(b => b.onclick = () => { const x = L[+b.dataset.i], a = x.address || {}; pune(+x.lat, +x.lon, x.display_name);
        if (!$("#rn-str").value) $("#rn-str").value = a.road || ""; if (!$("#rn-nr").value) $("#rn-nr").value = a.house_number || ""; if (!$("#rn-loc").value) $("#rn-loc").value = a.village || a.town || a.city || a.suburb || ""; });
    } catch (e) { r.innerHTML = `<span class="er">căutarea nu merge acum; scrie coordonatele</span>`; }
  }
  const b64 = f => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1] || ""); r.readAsDataURL(f); });
  async function trimite(executa) {
    const m = $("#rn-msg"); $("#rn-sv").disabled = $("#rn-go").disabled = true; m.innerHTML = "salvez dosarul…";
    const fis = []; for (const [k, L] of Object.entries(fisiere)) for (const f of L) fis.push({ nume: f.name, tip_doc: k, b64: await b64(f) });
    const lat = +$("#rn-lat").value || loc.lat, lon = +$("#rn-lon").value || loc.lon;
    const body = { adresa: $("#rn-adr").value.trim(), eticheta: (loc && loc.eticheta) || $("#rn-adr").value.trim(), strada: $("#rn-str").value, numar: $("#rn-nr").value, localitate: $("#rn-loc").value, judet: $("#rn-jud").value, lat, lon,
      tip: $("input[name=rn-tip]:checked").value, confirmat_localizare: true, cf: $("#rn-cf").value, nr_cadastral: $("#rn-nc").value, suprafata_mp: $("#rn-mp").value, contact_notificare: $("#rn-ct").value, note: $("#rn-nt").value, fisiere: fis };
    let r; try { r = await api("/api/raport_nou/dosar", { method: "POST", body: JSON.stringify(body) }); } catch (e) { r = { eroare: "serverul de generare nu răspunde aici; deschide raportul din Cockpit Master (localhost:8770)" }; }
    if (!r.ok) { m.innerHTML = `<span class="er">${esc(r.eroare || "dosarul nu s-a salvat")}</span>`; valid(); return; }
    m.innerHTML = `<span class="ok">dosar salvat (${esc(r.id)}, ${r.fisiere} fișiere).</span>`;
    if (!executa) { valid(); return; }
    const x = await api("/api/raport_nou/executa", { method: "POST", body: JSON.stringify({ id: r.id }) });
    if (!x.ok) { m.innerHTML += ` <span class="er">${esc(x.eroare)}</span>`; return; }
    urmareste(r.id);
  }
  function urmareste(id) {
    clearInterval(tim); const p = $("#rn-prog");
    const desen = s => { const ic = { ok: "✓", atentie: "!", lipsa: "○", eroare: "✗", ruleaza: "…", asteapta: "·" };   // „lipsa”: modul fără date, cu motiv (v82.2.0)
      p.innerHTML = `<h4>Se generează raportul</h4>` + s.stare.etape.map(e => `<div class="et"><i>${ic[e.stare] || "·"}</i><div><b>${esc(e.text)}</b>${e.detalii ? `<br><small>${esc(e.detalii)}${e.secunde ? " · " + e.secunde + " s" : ""}</small>` : ""}</div></div>`).join("")
        + (s.stare.gata ? `<div style="margin-top:8px" class="${s.stare.rezultat === "eroare" ? "er" : "ok"}">${esc(s.stare.rezultat)}${s.stare.id_raport ? ` · <button type="button" id="rn-vezi">deschide raportul</button>` : ""}</div>` : `<small>Durează câteva minute. Poți închide fereastra; te anunț în aplicație.</small>`);
      const v = $("#rn-vezi"); if (v) v.onclick = () => { location.hash = s.stare.id_raport; location.reload(); }; };
    const pas = async () => { try { const s = await api("/api/raport_nou/stare?id=" + encodeURIComponent(id)); if (s.stare) { desen(s); if (s.stare.gata) { clearInterval(tim); clopot(); } } } catch (e) {} };
    pas(); tim = setInterval(pas, 4000);
  }
  /* notificări în aplicație: ce s-a terminat de la ultima vizită */
  let vazut = 0; try { vazut = +localStorage.getItem("rn-vazut") || 0; } catch (e) {}
  async function clopot() {
    try { const j = await api("/api/raport_nou/lista"); if (!j.notificari) return; let b = $("#rn-bell"); if (!b) { b = document.createElement("div"); b.id = "rn-bell"; document.body.appendChild(b); }
      const noi = j.notificari.filter(n => Date.parse(n.t) > vazut);
      b.innerHTML = noi.map(n => `<div class="n"><button type="button" title="ascunde">×</button>${esc(n.text)} <a data-r="${esc(n.id_raport)}">deschide</a></div>`).join("");
      $$("#rn-bell .n").forEach(d => { $("button", d).onclick = () => { d.remove(); try { localStorage.setItem("rn-vazut", String(Date.now())); } catch (e) {} }; $("a", d).onclick = () => { try { localStorage.setItem("rn-vazut", String(Date.now())); } catch (e) {} location.hash = $("a", d).dataset.r; location.reload(); }; });
    } catch (e) {}
  }
  setTimeout(clopot, 3000); setInterval(clopot, 60000);
  window.CC_RAPORT_NOU = { deschide, clopot };
})();
