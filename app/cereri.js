/* cartea casei · cererea de raport nou (F0.5, 24.10.2026). Formularul din artefact (actiuni.js), mutat în aplicație.
   Două bife obligatorii: localizarea confirmată (adresă găsită pe hartă sau coordonate) și tipul proprietății.
   Cererea se scrie în tabelul `cereri` (doar cu cont, cel mult 5 pe zi); serverul o pune în platforma specialiștilor ca o comandă cu starea „nou".
   Adresa se caută în harta publică (Nominatim) doar când omul apasă „caută". */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const STARE = { nou: "primită", in_lucru: "în lucru", gata: "gata", anulat: "anulată" };
  const TIP = { casa: "casă", apartament: "apartament", teren: "teren" };

  async function lista(el) {
    if (!el) return;
    const { sb, esc, data } = window.CC;
    const { data: L } = await sb.from("cereri").select("nr,tip,date,stare,creata_la").order("creata_la", { ascending: false }).limit(20);
    if (!L || !L.length) { el.innerHTML = ""; return; }
    el.innerHTML = `<div class="cutie"><h2>cererile tale</h2><div class="lista">${L.map(c => `<div class="r"><div>${esc(TIP[c.date?.tip_proprietate] || "raport")} · ${esc((c.date?.eticheta || c.date?.adresa || "").split(",").slice(0, 2).join(",").toLocaleLowerCase("ro-RO"))}<small>${esc(c.nr.toLowerCase())} · ${esc(data(c.creata_la))}</small></div><span class="bulina">${esc(STARE[c.stare] || c.stare)}</span></div>`).join("")}</div></div>`;
  }

  function ecran(app) {
    const { sb, esc, mic } = window.CC;
    let loc = null;
    app.innerHTML = `<div class="ecran"><div class="bara" style="margin:-14px -16px 0;padding-left:12px"><button class="ic" data-go="#/acasa" aria-label="înapoi">‹</button><div class="t">cere un raport nou</div></div>
      <p class="lead">scrie adresa sau coordonatele, confirmă punctul și alege tipul proprietății. raportul apare aici, în aplicație, când e gata.</p>
      <div class="cutie">
        <label class="camp">adresa sau coordonatele<input type="text" id="adr" autocomplete="street-address" placeholder="ex.: calea urseni 45, timișoara  sau  45.7231, 21.2607"></label>
        <button class="btn alb" id="caut">caută pe hartă</button>
        <div class="rez" id="rez"></div>
        <label class="ck"><input type="checkbox" id="ck"><span>confirm localizarea: punctul găsit este proprietatea (sau terenul) pentru care vreau raportul</span></label>
        <div><div style="font:600 14px var(--font);margin-bottom:8px">tipul proprietății</div><div class="tip">${Object.entries(TIP).map(([v, t]) => `<label><input type="radio" name="tip" value="${v}">${t}</label>`).join("")}</div></div>
        <p id="msg"></p>
        <button class="btn lat" id="go" disabled>trimite cererea</button>
      </div></div>`;
    const m = $("#msg");
    const valid = () => { const ok = !!loc && $("#ck").checked && !!$("input[name=tip]:checked"); $("#go").disabled = !ok; return ok; };
    app.querySelector(".cutie").addEventListener("change", valid);
    $("#adr").addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); cauta(); } });
    $("#caut").onclick = cauta;
    async function cauta() {
      const q = $("#adr").value.trim(), r = $("#rez"); if (!q) return; loc = null; $("#ck").checked = false; valid();
      const mm = q.match(/^\s*(-?\d{1,2}(?:[.,]\d+)?)\s*[,; ]\s*(-?\d{1,3}(?:[.,]\d+)?)\s*$/);
      if (mm) { loc = { lat: +mm[1].replace(",", "."), lon: +mm[2].replace(",", "."), eticheta: q }; r.innerHTML = `<p class="okm">punctul: ${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)}</p>`; valid(); return; }
      r.innerHTML = '<p class="mut">caut…</p>';
      try {
        const u = "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=ro&q=" + encodeURIComponent(q);
        const L = await (await fetch(u, { headers: { "Accept-Language": "ro" } })).json();
        if (!L.length) { r.innerHTML = '<p class="err">nu am găsit adresa; scrie coordonatele (lat, lon).</p>'; return; }
        r.innerHTML = L.map((x, i) => `<button type="button" data-i="${i}">${esc(mic(x.display_name))}</button>`).join("");
        r.querySelectorAll("button").forEach(b => b.onclick = () => { const x = L[+b.dataset.i], a = x.address || {};
          loc = { lat: +x.lat, lon: +x.lon, eticheta: x.display_name, uat: a.city || a.town || a.village || a.municipality || "", judet: (a.county || "").replace(/^Județul\s+/i, "") };
          r.innerHTML = `<p class="okm">ales: ${esc(mic(x.display_name))}</p>`; valid(); });
      } catch (e) { r.innerHTML = '<p class="err">căutarea nu merge acum; scrie coordonatele (lat, lon).</p>'; }
    }
    $("#go").onclick = async () => {
      if (!valid()) return;
      $("#go").disabled = true; m.className = ""; m.textContent = "trimit…";
      const tip = $("input[name=tip]:checked").value;
      const { data, error } = await sb.from("cereri").insert({ tip: "raport_nou", date: { adresa: $("#adr").value.trim().slice(0, 200), eticheta: String(loc.eticheta).slice(0, 200), lat: loc.lat, lon: loc.lon, uat: loc.uat || null, judet: loc.judet || null, tip_proprietate: tip, confirmat_localizare: true } }).select("nr").single();
      if (error) { m.className = "err"; m.textContent = mic(/5 cereri|localiz|românia|tipul/i.test(error.message) ? error.message : "cererea nu s-a putut trimite acum."); $("#go").disabled = false; return; }
      m.className = "okm"; m.textContent = `cererea ${data.nr.toLowerCase()} e înregistrată. raportul apare în aplicație când e gata.`;
      setTimeout(() => { location.hash = "#/acasa"; }, 1800);
    };
  }
  window.CC_CERERI = { ecran, lista };
})();
