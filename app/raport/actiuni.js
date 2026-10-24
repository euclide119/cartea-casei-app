/* Raport _ Cartea Casei - bara de ac\u021biuni (Manu, 23.10.2026): rezumat \u00b7 raport \u00b7 introdu adresa nou\u0103 \u00b7 genereaz\u0103 raport nou \u00b7 export\u0103 pdf.
   \u201egenereaz\u0103 raport nou\u201d cere dou\u0103 bife: localizarea (adres\u0103 sau coordonate, confirmat\u0103) \u0219i tipul propriet\u0103\u021bii (cas\u0103 / apartament / teren).
   Cererea se scrie \u00een baza artefactului (colec\u021bia cereri_raport), de unde o preia Claude / Fabrica; f\u0103r\u0103 baz\u0103, r\u0103m\u00e2ne \u00een browser \u0219i se poate copia.
   Adresa se caut\u0103 \u00een OpenStreetMap (Nominatim), doar la cererea utilizatorului. */
(function () {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  let db = null;
  (async () => { try { db = window.claude ? await window.claude.use("db") : null; } catch (e) { db = null; } })();

  const s = document.createElement("style"); s.id = "ac-css";
  s.textContent = `
#ac-bar{position:sticky;top:0;z-index:60;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:8px 10px;margin:0 0 6px;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);grid-column:2;order:-10}
#ac-bar button{font:600 13px var(--font);padding:8px 14px;border-radius:99px;border:1px solid #c9ced8;background:var(--panel);color:var(--fg);cursor:pointer;text-transform:lowercase}
#ac-bar button:hover{border-color:#1a1e2a}
#ac-bar button.p{background:#1a1e2a;color:#fff;border-color:#1a1e2a}
#ac-bar .sp{flex:1}
#ac-m{position:fixed;inset:0;z-index:100001;background:rgba(10,14,24,.55);display:none;align-items:center;justify-content:center;padding:16px}
#ac-m.on{display:flex}
#ac-m .bx{background:var(--panel);color:var(--fg);border-radius:18px;max-width:560px;width:100%;padding:22px 24px;display:flex;flex-direction:column;gap:14px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);max-height:calc(100vh - 32px);overflow:auto}
#ac-m h3{margin:0;font:700 24px "Fraunces",Georgia,serif}
#ac-m label{display:flex;flex-direction:column;gap:6px;font:600 13px var(--font)}
#ac-m input[type=text]{font:15px var(--font);padding:10px 12px;border-radius:10px;border:1px solid #c9ced8;background:var(--bg);color:var(--fg)}
#ac-m .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
#ac-m .ck{flex-direction:row;align-items:flex-start;gap:10px;font-weight:500;line-height:1.4}
#ac-m .ck input{margin-top:3px;width:18px;height:18px}
#ac-m .tip{display:flex;gap:8px;flex-wrap:wrap}
#ac-m .tip label{flex-direction:row;align-items:center;gap:6px;padding:8px 14px;border:1px solid #c9ced8;border-radius:99px;cursor:pointer;font-weight:600}
#ac-m .tip input{margin:0}
#ac-m .tip label:has(input:checked){background:#1a1e2a;color:#fff;border-color:#1a1e2a}
#ac-m .res{font:13px/1.45 var(--font);color:var(--muted);display:flex;flex-direction:column;gap:4px}
#ac-m .res button{all:unset;cursor:pointer;padding:6px 8px;border-radius:8px;border:1px solid var(--line)}#ac-m .res button:hover{border-color:#1a1e2a}
#ac-m .ok{font:600 13px var(--font);color:#1f8a4c}#ac-m .er{font:600 13px var(--font);color:#c0392b}
#ac-m .act{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}
#ac-m .act button{font:700 14px var(--font);padding:10px 18px;border-radius:10px;border:1px solid #c9ced8;background:var(--panel);color:var(--fg);cursor:pointer}
#ac-m .act button.p{background:#1a1e2a;color:#fff;border-color:#1a1e2a}
#ac-m .act button:disabled{opacity:.4;cursor:not-allowed}
@media print{#ac-bar,#ac-m{display:none!important}}
@media (max-width:900px){#ac-bar{grid-column:1}}`;
  document.head.appendChild(s);

  const genericActiv = () => document.body.classList.contains("generic");
  const idCurent = () => (typeof D !== "undefined" && D && D.id) || (document.querySelector("#pick")?.value) || "";

  function laLocatie(id, dupa) {
    if (genericActiv() && window.RIC_GENERIC) { const sel = $("#gn-sel"); RIC_GENERIC.alege(id || (sel && sel.value)); setTimeout(dupa, 900); } else dupa();
  }
  function rezumat() { laLocatie(idCurent(), () => { try { window.showTab && showTab("rezumat"); } catch (e) {} const f = $("#cl-final"); (f && !f.hidden ? f : $("#rezumat"))?.scrollIntoView({ behavior: "smooth", block: "start" }); }); }
  function raport() { laLocatie(idCurent(), () => { try { window.showTab && showTab("rezumat"); } catch (e) {} window.scrollTo({ top: 0, behavior: "smooth" }); }); }
  function pdf() { try { window.print(); } catch (e) {} }

  /* ---------- fereastra: adresa noua + cerere de raport ---------- */
  let loc = null;
  function fereastra(cuCerere) {
    let m = $("#ac-m"); if (!m) { m = document.createElement("div"); m.id = "ac-m"; document.body.appendChild(m); m.addEventListener("click", e => { if (e.target === m) inchide(); }); document.addEventListener("keydown", e => { if (e.key === "Escape") inchide(); }); }
    loc = null;
    m.innerHTML = `<div class="bx" role="dialog" aria-modal="true" aria-label="raport nou"><h3>${cuCerere ? "genereaz\u0103 un raport nou" : "introdu o adres\u0103 nou\u0103"}</h3>
      <label>adresa sau coordonatele<input type="text" id="ac-adr" placeholder="ex.: Calea Urseni 45, Timi\u0219oara  sau  45.7231, 21.2607" autocomplete="street-address"></label>
      <div class="row"><button type="button" id="ac-caut" style="font:600 13px var(--font);padding:8px 14px;border-radius:99px;border:1px solid #c9ced8;background:var(--panel);cursor:pointer">caut\u0103 pe hart\u0103</button><span class="res" id="ac-res"></span></div>
      <label class="ck"><input type="checkbox" id="ac-ck-loc"><span>confirm localizarea: punctul g\u0103sit este proprietatea (sau terenul) pentru care vreau raportul</span></label>
      <div><div style="font:600 13px var(--font);margin-bottom:6px">tipul propriet\u0103\u021bii</div><div class="tip">${[["casa", "cas\u0103"], ["apartament", "apartament"], ["teren", "teren"]].map(([v, t]) => `<label><input type="radio" name="ac-tip" value="${v}">${t}</label>`).join("")}</div></div>
      <div id="ac-msg"></div>
      <div class="act"><button type="button" id="ac-x">\u00eenchide</button><button type="button" class="p" id="ac-go" disabled>trimite cererea de raport</button></div></div>`;
    m.classList.add("on"); $("#ac-adr").focus();
    const valid = () => { const ok = loc && $("#ac-ck-loc").checked && !!m.querySelector("input[name=ac-tip]:checked"); $("#ac-go").disabled = !ok; return ok; };
    m.addEventListener("change", valid); $("#ac-x").onclick = inchide;
    $("#ac-adr").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); cauta(); } });
    $("#ac-caut").onclick = cauta;
    async function cauta() {
      const q = $("#ac-adr").value.trim(), r = $("#ac-res"); if (!q) return; loc = null; $("#ac-ck-loc").checked = false; valid();
      const mm = q.match(/^\s*(-?\d{1,2}(?:[.,]\d+)?)\s*[,; ]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/);
      if (mm) { loc = { lat: +mm[1].replace(",", "."), lon: +mm[2].replace(",", "."), eticheta: q }; r.innerHTML = `<span class="ok">coordonate: ${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)}</span>`; valid(); return; }
      r.textContent = "caut\u2026";
      try {
        const u = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=ro&q=" + encodeURIComponent(q);
        const L = await (await fetch(u, { headers: { "Accept-Language": "ro" } })).json();
        if (!L.length) { r.innerHTML = `<span class="er">nu am g\u0103sit adresa; scrie coordonatele (lat, lon)</span>`; return; }
        r.innerHTML = L.map((x, i) => `<button type="button" data-i="${i}">${esc(x.display_name)}</button>`).join("");
        r.querySelectorAll("button").forEach(b => b.onclick = () => { const x = L[+b.dataset.i]; loc = { lat: +x.lat, lon: +x.lon, eticheta: x.display_name };
          r.innerHTML = `<span class="ok">ales: ${esc(x.display_name)} (${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)})</span>`; valid(); });
      } catch (e) { r.innerHTML = `<span class="er">c\u0103utarea nu merge acum; scrie coordonatele (lat, lon)</span>`; }
    }
    $("#ac-go").onclick = async () => {
      if (!valid()) return;
      const tip = m.querySelector("input[name=ac-tip]:checked").value;
      const cerere = { adresa: $("#ac-adr").value.trim(), eticheta: loc.eticheta, lat: loc.lat, lon: loc.lon, tip, confirmat_localizare: true, cerut: new Date().toISOString(), stare: "nou" };
      let ok = false;
      if (db) { try { await db.collection("cereri_raport").add(cerere); ok = true; } catch (e) { ok = false; } }
      try { const L = JSON.parse(localStorage.getItem("ric-cereri-raport") || "[]"); L.push(cerere); localStorage.setItem("ric-cereri-raport", JSON.stringify(L)); } catch (e) {}
      $("#ac-msg").innerHTML = ok ? `<span class="ok">cererea e \u00eenregistrat\u0103 (${tip}, ${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)}). raportul apare \u00een lista de loca\u021bii c\u00e2nd e gata.</span>`
        : `<span class="ok">cererea e salvat\u0103 \u00een acest browser. trimite-i-o lui Claude: \u201egenereaz\u0103 raport ${tip} la ${loc.lat.toFixed(6)}, ${loc.lon.toFixed(6)}\u201d.</span>`;
      $("#ac-go").disabled = true;
    };
  }
  function inchide() { $("#ac-m")?.classList.remove("on"); }

  function bara() {
    const w = $(".wrap"); if (!w || $("#ac-bar")) return;
    const b = document.createElement("div"); b.id = "ac-bar";
    b.innerHTML = `<button type="button" data-a="rez">rezumat</button><button type="button" data-a="rap">raport</button><span class="sp"></span><button type="button" data-a="adr">introdu adresa nou\u0103</button><button type="button" class="p" data-a="nou">genereaz\u0103 raport nou</button><button type="button" data-a="pdf">export\u0103 pdf</button>`;
    b.onclick = e => { const a = e.target.closest("button")?.dataset.a; if (a === "rez") rezumat(); else if (a === "rap") raport(); else if (a === "adr") fereastra(false); else if (a === "nou") fereastra(true); else if (a === "pdf") pdf(); };
    w.prepend(b);
  }
  setInterval(bara, 1000); bara();
  window.RIC_ACTIUNI = { rezumat, raport, pdf, fereastra };
})();
