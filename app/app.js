/* cartea casei · aplicația clientului (F0.4, 24.10.2026). Plan: documente/analize/aplicatia_clientului_cartea_casei.md.
   intrare (cod pe e-mail sau QR de o folosință) → acasă (rapoartele lui) → raport (prima pagină + meniul capitolelor) → capitol (glisare stânga / dreapta) → cont.
   Aplicația nu randează date: primește de la server HTML-ul gata randat al unui singur capitol (Edge Function „capitol") și îl afișează într-un cadru fără scripturi.
   Capitolele (textul) stau doar în memorie; pozele rămân în cache-ul telefonului (sw.js), ca să se vadă și după ce expiră linkul de 24 h; totul se șterge la „ieși din cont”.
   Pe desktop: doar coperta + codul QR pentru telefon. */
(function () {
  "use strict";
  const CFG = window.EPAY_CFG || {};
  const app = document.getElementById("app");
  if (!window.supabase || !CFG.supabaseUrl) { app.innerHTML = '<div class="ecran centru"><p class="err">aplicația nu se poate porni acum. încearcă din nou peste câteva minute.</p></div>'; return; }
  const sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, storageKey: "cc-auth", detectSessionInUrl: true, autoRefreshToken: true } });
  const FN = CFG.supabaseUrl + "/functions/v1/";
  const BAZA = location.origin + location.pathname.replace(/index\.html$/, "");
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const mic = s => String(s ?? "").toLocaleLowerCase("ro-RO");
  const data = d => d ? new Date(d).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" }) : "";
  const S = { user: null, disp: null, rapoarte: [], acces: [], css: {}, cache: new Map(), meniuDeschis: false };
  const MOBIL = () => matchMedia("(pointer:coarse)").matches || innerWidth < 760;

  /* ---------- dispozitivul ---------- */
  function amprenta() {
    let a = null; try { a = localStorage.getItem("cc-disp"); } catch (e) {}
    if (!a || a.length < 32) { a = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, "0")).join(""); try { localStorage.setItem("cc-disp", a); } catch (e) {} }
    return a;
  }
  function numeDisp() {
    const u = navigator.userAgent;
    const os = /iPhone/.test(u) ? "iPhone" : /iPad/.test(u) ? "iPad" : /Android/.test(u) ? "Android" : /Mac/.test(u) ? "Mac" : /Windows/.test(u) ? "Windows" : "alt dispozitiv";
    const br = /CriOS|Chrome/.test(u) && !/Edg/.test(u) ? "Chrome" : /Safari/.test(u) ? "Safari" : /Firefox|FxiOS/.test(u) ? "Firefox" : /Edg/.test(u) ? "Edge" : "browser";
    return `${os} · ${br}`;
  }
  async function inregistreaza() {
    const { data: id, error } = await sb.rpc("inregistreaza_dispozitiv", { p_amprenta: amprenta(), p_nume: numeDisp() });
    if (error) throw new Error(mic(error.message));
    S.disp = id; return id;
  }

  /* ---------- server ---------- */
  async function token() { const { data: { session } } = await sb.auth.getSession(); return session && session.access_token; }
  async function capitol(rid, k, retry) {
    const key = rid + "/" + k, c = S.cache.get(key);
    if (c && Date.now() - c.t < 23 * 3600e3) return c.v;  // linkurile pozelor țin 24 h; pozele rămân oricum în cache-ul telefonului
    const r = await fetch(`${FN}capitol?raport=${encodeURIComponent(rid)}&k=${encodeURIComponent(k)}`, {
      headers: { Authorization: "Bearer " + await token(), apikey: CFG.supabaseKey, "x-dispozitiv": amprenta() } });
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && j.cod === "dispozitiv" && !retry) { await inregistreaza(); return capitol(rid, k, true); }
    if (!r.ok) { const e = new Error(j.error || "capitolul nu se poate deschide acum"); e.status = r.status; throw e; }
    const v = k === "css" ? j.css : j.html;
    S.cache.set(key, { v, t: Date.now() });
    return v;
  }

  /* ---------- intrare ---------- */
  /* brandul pe tip de proprietate (casă / teren / apartament): copertă, nume, lemă, logo — din brand.json; se aleg după tipul raportului */
  const BR = { data: null }; fetch("brand.json").then(r => r.json()).then(j => { BR.data = j; }).catch(() => {});
  const brandDe = tip => (BR.data && (BR.data[tip] || BR.data.casa)) || { nume: "raportul casei", lema: "analiză & documentație", coperta: "brand_casa_coperta.jpg", logo: "emblema.png" };
  window.CC_BRAND = brandDe;
  const marca = () => `<div class="marca"><img class="sigla" src="emblema.png" alt="" width="44" height="35"><span>cartea casei</span></div>`;
  function qrSvg(text, cell) { try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ cellSize: cell || 5, margin: 2, scalable: true }); } catch (e) { return ""; } }
  function ecranIntrare(msg) {
    const desk = !MOBIL();
    app.innerHTML = `<div class="ecran">${marca()}
      <img src="deschidere.jpg" alt="cartea casei" style="width:100%;height:auto;border-radius:18px;display:block;aspect-ratio:2000/1116;object-fit:cover;background:#2a2f3f">
      <div><h1>raportul casei tale</h1><p class="lead">doar pentru tine, capitol cu capitol. intri cu codul raportului și pin-ul.</p></div>
      <div class="cutie" id="f-pin">
        <label class="camp">codul raportului<input type="text" id="pc" autocapitalize="characters" autocomplete="username" spellcheck="false" placeholder="CC-XXXXXX"></label>
        <label class="camp">pin<input type="tel" id="pp" inputmode="numeric" autocomplete="current-password" maxlength="6" placeholder="6 cifre"></label>
        <button class="btn lat" id="pin-go">intră</button>
        <p id="msg" class="${msg && msg.ok ? "okm" : "err"}">${esc(msg ? msg.t : "")}</p>
        <p class="mut" style="margin:0;font-size:13px">codul și pin-ul sunt pe prima pagină a raportului pdf și în mesajul în care ai primit raportul.</p>
        <button class="btn alb mic" id="uitat" type="button" style="align-self:flex-start">am uitat pin-ul</button>
        <div id="uitat-f" style="display:none;flex-direction:column;gap:10px">
          <label class="camp">telefonul sau e-mailul la care te putem găsi<input type="text" id="ut-c" autocomplete="tel" placeholder="07xx xxx xxx sau nume@exemplu.ro"></label>
          <button class="btn lat" id="ut-go" type="button">cere un pin nou</button><p id="ut-m" class="mut" style="margin:0"></p></div>
      </div>
      <details class="cutie" id="f-alte"><summary style="cursor:pointer;font-weight:600">alte moduri de intrare</summary>
        <div id="f-intrare" style="display:flex;flex-direction:column;gap:12px;margin-top:12px">
        <label class="camp">e-mailul tău<input type="email" id="em" autocomplete="email" inputmode="email" placeholder="nume@exemplu.ro"></label>
        <button class="btn alb lat" id="trimite">trimite-mi un link pe e-mail</button>
        <div id="pas2" hidden>
          <label class="camp">codul din e-mail<input type="tel" id="cod" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456"></label>
          <button class="btn alb lat" id="intra">intră</button>
        </div>
        <label class="camp">cod sau link de intrare<input type="text" id="cs" autocapitalize="none" spellcheck="false" placeholder="ABCDE-12345 sau linkul din e-mail"></label>
        <button class="btn alb lat" id="cs-go">intră</button>
        </div>
      </details>
      ${desk ? `<div class="cutie" style="align-items:center;text-align:center"><b>se citește pe telefon</b><div class="qr">${qrSvg(BAZA)}</div><p class="mut" style="margin:0;font-size:14px">scanează cu camera telefonului.</p></div>` : ""}
      <p class="nota">serviciu privat de analiză, independent de instituțiile publice. intri cu codul raportului și pin-ul, fără parolă de ținut minte.</p></div>`;
    const m = $("#msg");
    $("#pc").value = (() => { try { return localStorage.getItem("cc-cod") || ""; } catch (e) { return ""; } })();
    const pinGo = async () => {
      const cod = $("#pc").value.trim(), pin = $("#pp").value.replace(/\D/g, "");
      if (cod.replace(/[^A-Za-z0-9]/g, "").length < 6 || pin.length !== 6) { m.className = "err"; m.textContent = "scrie codul raportului și pin-ul de 6 cifre."; return; }
      $("#pin-go").disabled = true; m.className = "mut"; m.textContent = "intru…";
      try {
        const r = await fetch(FN + "intra", { method: "POST", headers: { "Content-Type": "application/json", apikey: CFG.supabaseKey }, body: JSON.stringify({ cod, pin }) });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(j.error || "nu am putut intra");
        await sb.auth.signOut({ scope: "local" }).catch(() => {});
        const { error } = await sb.auth.verifyOtp({ token_hash: j.token_hash, type: "magiclink" });
        if (error) throw new Error("nu am putut intra; încearcă din nou");
        try { localStorage.setItem("cc-cod", cod.toUpperCase()); } catch (e) {}
        if (j.raport) history.replaceState(null, "", location.pathname + "#/r/" + j.raport);
        porneste();
      } catch (e) { m.className = "err"; m.textContent = mic(e.message); $("#pin-go").disabled = false; }
    };
    $("#pin-go").onclick = pinGo;
    $("#uitat").onclick = () => { const f = $("#uitat-f"); const dechis = f.style.display === "flex"; f.style.display = dechis ? "none" : "flex"; if (!dechis) $("#ut-c").focus(); };
    $("#ut-go").onclick = async () => {
      const cod = $("#pc").value.trim(), ct = $("#ut-c").value.trim(), um = $("#ut-m");
      if (cod.replace(/[^A-Za-z0-9]/g, "").length < 6) { um.className = "err"; um.textContent = "scrie mai sus codul raportului (CC-…)."; return; }
      if (ct.length < 5) { um.className = "err"; um.textContent = "scrie un telefon sau un e-mail."; return; }
      $("#ut-go").disabled = true;
      try { await fetch(FN + "intra", { method: "POST", headers: { "Content-Type": "application/json", apikey: CFG.supabaseKey }, body: JSON.stringify({ actiune: "uitat", cod, contact: ct }) }); } catch (e) {}
      um.className = "okm"; um.textContent = "am primit cererea. îți trimitem un pin nou în cel mult o zi lucrătoare.";
    };
    $("#pp").addEventListener("keydown", e => { if (e.key === "Enter") pinGo(); });
    $("#trimite").onclick = async () => {
      const email = $("#em").value.trim().toLowerCase(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { m.className = "err"; m.textContent = "scrie un e-mail valid."; return; }
      $("#trimite").disabled = true; m.textContent = "";
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: BAZA } });
      $("#trimite").disabled = false;
      if (error) { m.className = "err"; m.textContent = /signups not allowed|not found|user/i.test(error.message) ? "nu avem un raport pe acest e-mail. scrie e-mailul de pe comandă." : /rate|seconds/i.test(error.message) ? "ai cerut deja un cod; mai așteaptă un minut." : "codul nu s-a putut trimite acum."; return; }
      $("#pas2").hidden = false; m.className = "okm"; m.textContent = "ți-am trimis un e-mail. dacă are un cod, scrie-l mai jos; dacă are doar un link, copiază linkul (fără să-l deschizi) și lipește-l la „ai un cod sau un link de intrare?”."; $("#cod").focus();
    };
    $("#cs-go").onclick = async () => {
      const v = $("#cs").value.trim();
      // linkul din e-mailul de conectare: .../auth/v1/verify?token=<hash>&type=magiclink → aceeași verificare, fără să mai treacă prin pagina de redirect
      if (/token=/.test(v)) {
        let th = null, tip = "magiclink";
        try { const u = new URL(v.replace(/&amp;/g, "&")); th = u.searchParams.get("token") || u.searchParams.get("token_hash"); tip = u.searchParams.get("type") || tip; } catch (e) {}
        if (!th || th.startsWith("pkce_")) { m.className = "err"; m.textContent = "linkul nu se poate folosi aici; cere un cod nou."; return; }
        $("#cs-go").disabled = true;
        const { error } = await sb.auth.verifyOtp({ token_hash: th, type: ["magiclink", "signup", "invite", "recovery", "email"].includes(tip) ? tip : "magiclink" });
        $("#cs-go").disabled = false;
        if (error) { m.className = "err"; m.textContent = "linkul a fost deja deschis sau a expirat. cere unul nou cu „trimite-mi codul”."; return; }
        return porneste();
      }
      const c = v.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
      if (c.length !== 10) { m.className = "err"; m.textContent = "codul are 10 caractere (ex. ABCDE-12345), sau lipește linkul întreg din e-mail."; return; }
      intrareQr(c).then(ok => ok && porneste());
    };
    $("#intra").onclick = async () => {
      const email = $("#em").value.trim().toLowerCase(), cod = $("#cod").value.replace(/\D/g, "");
      if (cod.length < 6) { m.className = "err"; m.textContent = "codul are 6 cifre."; return; }
      $("#intra").disabled = true;
      const { error } = await sb.auth.verifyOtp({ email, token: cod, type: "email" });
      $("#intra").disabled = false;
      if (error) { m.className = "err"; m.textContent = "codul nu e bun sau a expirat."; return; }
      porneste();
    };
  }
  async function intrareQr(tok) {
    app.innerHTML = `<div class="ecran centru">${marca()}<p class="mut">deschid raportul…</p></div>`;
    try {
      const r = await fetch(FN + "qr", { method: "POST", headers: { "Content-Type": "application/json", apikey: CFG.supabaseKey }, body: JSON.stringify({ token: tok }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "codul nu e valid");
      await sb.auth.signOut({ scope: "local" }).catch(() => {});
      const { error } = await sb.auth.verifyOtp({ token_hash: j.token_hash, type: "magiclink" });
      if (error) throw new Error("codul nu e valid");
      if (j.raport) location.hash = "#/r/" + j.raport;
      return true;
    } catch (e) { ecranIntrare({ t: mic(e.message) }); return false; }
  }

  /* ---------- acasă ---------- */
  async function incarcaRapoarte() {
    const [{ data: r, error }, { data: a }] = await Promise.all([
      sb.from("rapoarte").select("id,cod,titlu,tip_proprietate,capitole,capitole_cu_date,capitole_total,publicat_la,versiune").order("publicat_la", { ascending: false }),
      sb.from("acces_raport").select("raport_id,rol,expira_la").eq("user_id", S.user.id)]);
    if (error) throw error;
    S.rapoarte = r || []; S.acces = a || [];
  }
  const rolul = id => (S.acces.find(x => x.raport_id === id) || {}).rol;
  function ecranAcasa() {
    const L = S.rapoarte;
    app.innerHTML = `<div class="ecran">
      <div style="display:flex;align-items:center;justify-content:space-between">${marca()}<button class="ic" data-go="#/cont" aria-label="contul meu">☰</button></div>
      <div><h1>${L.length > 1 ? "rapoartele tale" : "raportul tău"}</h1><p class="lead">${L.length ? "apasă pe raport și citește-l capitol cu capitol." : "încă nu ai un raport publicat pe acest cont."}</p></div>
      <div class="carduri">${L.map(r => `<button class="card" data-go="#/r/${esc(r.id)}">
        <div class="cap" style="background:#1c2534 url('${esc(brandDe(r.tip_proprietate).coperta)}') center/cover;aspect-ratio:2000/1116;height:auto"><span>${esc(mic(r.cod))}${rolul(r.id) === "vizitator" ? " · invitat" : ""}</span></div>
        <div class="in"><b>${esc(mic(r.titlu))}</b><span class="m">${capsDe(r).length} capitole despre locul ăsta</span><span class="m">publicat ${esc(data(r.publicat_la))}</span></div></button>`).join("")}</div>
      <button class="btn alb lat" data-go="#/cerere">cere un raport nou</button>
      ${instalata() ? "" : `<div class="cutie" id="inst"><b>pune aplicația pe ecranul telefonului</b>${S.prompt ? '<button class="btn lat" id="inst-go">instalează aplicația</button>' : `<span class="mut" style="font-size:14px">${/iPhone|iPad/.test(navigator.userAgent) ? "în safari apasă butonul de partajare (pătratul cu săgeată), apoi „adaugă pe ecranul principal”." : "în meniul browserului (⋮) alege „instalează aplicația” sau „adaugă pe ecranul de pornire”."} apoi deschide aplicația de pe ecran și intră cu același cod al raportului și pin.</span>`}</div>`}
      <div id="cererile-mele"></div>
      <p class="nota">serviciu privat de analiză, independent de instituțiile publice.</p></div>`;
    if (window.CC_CERERI) CC_CERERI.lista($("#cererile-mele"));
    const ig = $("#inst-go"); if (ig) ig.onclick = async () => { S.prompt.prompt(); try { await S.prompt.userChoice; } catch (e) {} S.prompt = null; ecranAcasa(); };
  }
  const instalata = () => matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  addEventListener("beforeinstallprompt", e => { e.preventDefault(); S.prompt = e; });

  /* ---------- raport + capitol ---------- */
  function cadru(iframe, html, css, rid, onload) {
    const body = ((css || "").match(/^\/\*body:([^*]*)\*\//) || [, ""])[1];
    const r = S.rapoarte.find(x => x.id === rid) || {};
    const fil = `<div style="position:fixed;right:8px;bottom:6px;font:600 10px system-ui;color:rgba(26,30,42,.28);pointer-events:none;z-index:99">${esc(mic(r.cod || ""))} · ${esc(S.user.email || "")}</div>`;
    let gata = false;
    const fin = () => {
      const d = iframe.contentDocument; if (gata || !d || !d.body || !d.body.childElementCount) return;
      gata = true;
      ["contextmenu", "selectstart", "copy", "dragstart"].forEach(t => d.addEventListener(t, e => e.preventDefault()));
      onload && onload(d);
    };
    iframe.onload = fin;
    // unele motoare nu trimit „load" pentru srcdoc dacă pozele încă se încarcă: verificăm și la 300 ms
    const iv = setInterval(() => { if (gata || !iframe.isConnected) return clearInterval(iv); const d = iframe.contentDocument; if (d && d.readyState !== "loading" && /cartea-casei-fin/.test(d.body ? d.body.innerHTML : "")) fin(); }, 300);
    iframe.srcdoc = `<!doctype html><html lang="ro" data-theme="light"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'none'">
<style>${css || ""}</style></head><body class="${esc(body)}">${html}${fil}<i id="cartea-casei-fin" hidden></i></body></html>`;
  }
  /* capitolele fără date nu se prezintă deloc (le știm doar noi, în evidența internă); numerotarea e continuă, fără goluri */
  const capsDe = r => (r.capitole || []).filter(c => c.are_date !== false);
  const nrDe = (r, k) => { const i = capsDe(r).findIndex(c => c.k === k); return i < 0 ? "" : String(i + 1).padStart(2, "0"); };
  function meniu(r, kAcum) {
    const f = document.createElement("div"); f.className = "foaie";
    let g0 = null;
    f.innerHTML = `<div class="f" role="dialog" aria-label="capitolele raportului"><div style="display:flex;justify-content:space-between;align-items:center"><h2>capitole</h2><button class="ic" data-x aria-label="închide">✕</button></div>
      <button class="c ${kAcum === "coperta" ? "acum" : ""}" data-k="coperta"><i>00</i>prima pagină</button>
      ${capsDe(r).map(c => { const g = c.grup !== g0 ? `<div class="g">${esc(mic(c.grup))}</div>` : ""; g0 = c.grup;
        return `${g}<button class="c ${c.k === kAcum ? "acum" : ""}" data-k="${esc(c.k)}"><i>${nrDe(r, c.k)}</i>${esc(mic(c.titlu))}${c.clasa === "esential" ? '<span class="e" title="esențial"></span>' : ""}</button>`; }).join("")}
      <button class="c ${kAcum === "concluzii" ? "acum" : ""}" data-k="concluzii"><i>${String(capsDe(r).length + 1).padStart(2, "0")}</i>rezumat și concluzii</button>
      <button class="c ${kAcum === "final" ? "acum" : ""}" data-k="final" style="font-weight:700"><i>✓</i>pdf, trimitere și alte servicii</button>
      <button class="c" data-k="mapa" style="font-weight:700"><i>▤</i>mapa proprietății</button></div>`;
    f.addEventListener("click", e => {
      if (e.target === f || e.target.closest("[data-x]")) { f.remove(); return; }
      const b = e.target.closest("[data-k]"); if (b) { f.remove(); location.hash = `#/r/${r.id}/${b.dataset.k}`; }
    });
    document.body.appendChild(f);
    const sel = SEL[r.id]; if (sel) f.querySelectorAll("button.c[data-k]").forEach(b => { if (sel.has(b.dataset.k)) b.insertAdjacentHTML("beforeend", '<span class="bf-m" title="bifat pentru pdf">✓</span>'); });
  }
  function ordine(r) { return ["coperta", ...capsDe(r).map(c => c.k), "concluzii", "final"]; }
  const deTiparit = r => ["coperta", ...capsDe(r).map(c => c.k), "concluzii"];
  function eticheta(r, k) {
    if (k === "coperta") return { nr: "00", t: "prima pagină" };
    if (k === "concluzii") return { nr: String(capsDe(r).length + 1).padStart(2, "0"), t: "rezumat și concluzii" };
    if (k === "final") return { nr: "✓", t: "pdf și cereri" };
    const c = capsDe(r).find(x => x.k === k) || {}; return { nr: nrDe(r, k), t: mic(c.titlu || k) };
  }
  /* ---------- bifele: ce intră în pdf / ce se trimite (pe cont, în selectii_client) ---------- */
  const SEL = {};
  async function bife(rid) {
    if (SEL[rid]) return SEL[rid];
    const { data } = await sb.from("selectii_client").select("capitole").eq("raport_id", rid).eq("user_id", S.user.id).maybeSingle();
    const o = (data && data.capitole) || {};
    SEL[rid] = new Set(Object.keys(o).filter(k => o[k]));
    return SEL[rid];
  }
  let salvT = null;
  function salveazaBife(rid) {
    clearTimeout(salvT);
    salvT = setTimeout(() => { const o = {}; SEL[rid].forEach(k => o[k] = true);
      sb.from("selectii_client").upsert({ raport_id: rid, user_id: S.user.id, capitole: o, actualizat_la: new Date().toISOString() }).then(() => {}); }, 400);
  }
  function comuta(rid, k, pe) { const s = SEL[rid]; if (!s) return; (pe === undefined ? !s.has(k) : pe) ? s.add(k) : s.delete(k); salveazaBife(rid); }

  /* ---------- raportul interactiv: aceeași pagină a raportului (hărți cu straturi, soare, bare, istoric), cu datele servite doar cu cont ---------- */
  async function swGata() {
    if (!("serviceWorker" in navigator) || !isSecureContext) return false;
    if (navigator.serviceWorker.controller) return true;
    await Promise.race([new Promise(z => navigator.serviceWorker.addEventListener("controllerchange", z, { once: true })), new Promise(z => setTimeout(z, 4000))]);
    return !!navigator.serviceWorker.controller;
  }
  async function trimiteSesiune(rid) {
    const c = navigator.serviceWorker && navigator.serviceWorker.controller; if (!c) return;
    c.postMessage({ tip: "sesiune", jwt: await token(), amp: amprenta(), apikey: CFG.supabaseKey, fn: FN, rid,
      rapoarte: S.rapoarte.map(r => ({ id: r.id, titlu: mic(r.titlu), versiune: r.versiune })) });
  }
  const INTERACTIV_EXCLUS = "input,select,textarea,button,a,canvas,svg,label,.bar,.seg,.box,.hm-box,.hm-c,.tmap,.tpan,.pzmap,.ist-img,.ist-th,[role=slider],[draggable=true]";
  async function capitolInteractiv(r, k, gen) {
    const rid = r.id, ord = ordine(r), i = ord.indexOf(k), e = eticheta(r, k), prev = ord[i - 1], next = ord[i + 1];
    const du = kk => { if (kk) location.hash = `#/r/${rid}/${kk}`; };
    let cit = $(".cititor.int");
    if (!cit || cit.dataset.rid !== rid) {
      await trimiteSesiune(rid);
      app.innerHTML = `<div class="cititor int" data-rid="${esc(rid)}">
        <div class="bara"><button class="ic" id="inap" aria-label="înapoi">‹</button><div class="t" id="tt"></div>
          <button class="ic" id="toc" aria-label="în acest capitol" title="în acest capitol" hidden>≡</button>
          <button class="ic bifa" id="bf" aria-pressed="false" aria-label="bifează capitolul pentru pdf" title="bifează pentru pdf">✓</button>
          <button class="ic" id="m" aria-label="capitole">☰</button></div>
        <div style="position:relative;flex:1;display:flex"><iframe id="rap" title="raportul" src="raport/index.html#${encodeURIComponent(rid)}"></iframe><div class="incarc" id="inc">se încarcă raportul…</div></div>
        <div class="fil">${esc(mic(r.cod || ""))} · ${esc(S.user.email || "")}</div>
        <div class="jos"><button class="btn alb mic" id="p" aria-label="capitolul anterior">‹ înapoi</button><span class="n" id="nn"></span><button class="btn mic" id="u" aria-label="capitolul următor">înainte ›</button></div></div>`;
      cit = $(".cititor.int");
      const fr = $("#rap");
      cit._gata = new Promise((ok, nu) => {
        const t0 = Date.now(), iv = setInterval(() => {
          try { const w = fr.contentWindow; // D e declarat cu let în pagina raportului: nu e window.D, se citește prin eval în cadrul ei
            if (w && w.eval && w.eval("typeof D !== 'undefined' && D && D.id") === rid && w.RIC_STARE && Object.keys(w.RIC_STARE).length > 10) { clearInterval(iv); setTimeout(ok, 900); } } catch (er) {}
          if (Date.now() - t0 > 45000) { clearInterval(iv); nu(new Error("timp")); }
        }, 250);
      });
      cit._gata.then(() => {
        const d = fr.contentDocument;
        // glisare între capitole, dar nu pe hărți, bare, butoane și glisoare (acolo e interactivitatea raportului)
        let x0 = 0, y0 = 0, t0 = 0, ok = false;
        d.addEventListener("touchstart", ev => { const t = ev.changedTouches[0]; ok = !(ev.target.closest && ev.target.closest(INTERACTIV_EXCLUS)); x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); }, { passive: true });
        d.addEventListener("touchend", ev => { if (!ok) return; const t = ev.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
          if (Math.abs(dx) > 80 && Math.abs(dy) < Math.abs(dx) * 0.5 && Date.now() - t0 < 700) { const c2 = $(".cititor.int"); if (c2 && c2._du) c2._du(dx < 0 ? 1 : -1); } }, { passive: true });
      }).catch(() => { const inc = $("#inc"); if (inc) inc.textContent = "raportul nu s-a putut încărca. verifică semnalul și redeschide."; });
    }
    // bara de sus și de jos pentru capitolul curent
    $("#toc").hidden = true;
    $("#tt").innerHTML = `${esc(e.t)}<small>${k === "coperta" ? esc(mic(r.titlu)) : "capitolul " + e.nr}</small>`;
    $("#inap").onclick = () => { location.hash = k === "coperta" ? "#/acasa" : `#/r/${rid}`; };
    $("#m").onclick = () => meniu(r, k);
    $("#nn").textContent = `${i + 1} / ${ord.length}`;
    $("#p").disabled = !prev; $("#u").disabled = !next; $("#p").onclick = () => du(prev); $("#u").onclick = () => du(next);
    cit._du = dir => du(dir > 0 ? next : prev);
    bife(rid).then(sel => { const b = $("#bf"); if (!b || gen !== generatia) return;
      const arata = () => { const on = sel.has(k); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); };
      arata(); b.onclick = () => { comuta(rid, k); arata(); }; });
    try { await cit._gata; } catch (er) { return; }
    if (gen !== generatia) return;
    $("#inc") && $("#inc").remove();
    const fr = $("#rap"), w = fr.contentWindow, d = fr.contentDocument;
    d.documentElement.dataset.k = k;
    d.querySelectorAll(".cc-on").forEach(x => x.classList.remove("cc-on"));
    try { w.showTab(k === "coperta" || k === "concluzii" ? "rezumat" : k); } catch (er) {}
    let el = k === "concluzii" ? d.getElementById("cl-final") : d.getElementById(k === "coperta" ? "rezumat" : k);
    if (!el || !el.matches(".wrap > section, #cl-final")) { $("#inc") || cit.querySelector("div[style*=relative]").insertAdjacentHTML("beforeend", '<div class="incarc" id="inc">capitolul nu se poate afișa acum.</div>'); return; }
    el.classList.add("cc-on");
    // registrul comercial: fără etichete de lucru; numărul capitolului după numerotarea clientului (continuă, fără goluri)
    const curata = () => { try { w.__ccCurata && w.__ccCurata(el); } catch (er) {}
      const rc = el.querySelector(".rc-cap"); if (rc && e.nr && k !== "coperta" && k !== "concluzii") rc.textContent = rc.textContent.replace(/capitolul \d+/, "capitolul " + Number(e.nr)); };
    curata(); setTimeout(curata, 1200);
    // capitolele își scriu textele și după câteva secunde (grafice, tabele): curățarea rulează și la fiecare schimbare, nu doar la început
    if (cit._mo) cit._mo.disconnect();
    try { let tm = null; cit._mo = new w.MutationObserver(() => { clearTimeout(tm); tm = setTimeout(curata, 250); }); cit._mo.observe(el, { childList: true, subtree: true, characterData: true }); } catch (er) {}
    // cuprinsul capitolului, doar la capitolele lungi
    setTimeout(() => { if (gen !== generatia) return; const tb = $("#toc"); if (!tb) return;
      const H = [...el.querySelectorAll("h3,.ch-t,.dn-t,.ng-c>b")].filter(h => h.getBoundingClientRect().height > 0 && h.textContent.trim().length > 2 && h.textContent.trim().length < 90);
      if (el.getBoundingClientRect().height < w.innerHeight * 2.2 || H.length < 3) { tb.hidden = true; return; }
      tb.hidden = false;
      tb.onclick = () => { const f = document.createElement("div"); f.className = "foaie";
        f.innerHTML = `<div class="f" role="dialog" aria-label="în acest capitol"><div style="display:flex;justify-content:space-between;align-items:center"><h2>în acest capitol</h2><button class="ic" data-x aria-label="închide">✕</button></div>
          ${H.map((h, i) => `<button class="c" data-i="${i}">${esc(mic(h.textContent.trim().replace(/\s+/g, " ")))}</button>`).join("")}</div>`;
        f.addEventListener("click", ev => { if (ev.target === f || ev.target.closest("[data-x]")) { f.remove(); return; }
          const b = ev.target.closest("[data-i]"); if (b) { f.remove(); const t = H[+b.dataset.i].getBoundingClientRect().top + w.scrollY - 12; w.scrollTo({ top: t, behavior: "smooth" }); } });
        document.body.appendChild(f); }; }, 1500);
    // semnal de citire (ce capitole interesează clienții); o dată pe capitol și sesiune
    if (!S.citit) S.citit = new Set();
    if (!S.citit.has(rid + "/" + k)) { S.citit.add(rid + "/" + k); sb.rpc("citit_capitol", { rid, k }).then(() => {}, () => {}); }
    let nx = d.getElementById("cc-next");
    if (!nx) { nx = d.createElement("div"); nx.id = "cc-next"; d.querySelector(".wrap").appendChild(nx); nx.style.order = "9999"; }
    if (next) { const n = eticheta(r, next); nx.hidden = false; nx.innerHTML = `<span><small>capitolul următor · ${esc(n.nr)}</small>${esc(n.t)}</span><span style="font-size:22px">›</span>`; nx.onclick = () => du(next); }
    else nx.hidden = true;
    w.scrollTo(0, 0); setTimeout(() => { try { w.dispatchEvent(new Event("resize")); } catch (er) {} }, 80);
  }

  let generatia = 0;
  async function ecranCapitol(rid, k) {
    const gen = ++generatia;
    const r = S.rapoarte.find(x => x.id === rid);
    if (!r) { location.hash = "#/acasa"; return; }
    if (k === "final") return ecranFinal(r);
    if (k === "mapa" && window.CC_MAPA) return CC_MAPA.ecran(app, r);
    if (!ordine(r).includes(k)) k = "coperta";
    if (S.interactiv !== false && await swGata()) return capitolInteractiv(r, k, gen);
    const ord = ordine(r); if (!ord.includes(k)) k = "coperta";
    const i = ord.indexOf(k), e = eticheta(r, k), prev = ord[i - 1], next = ord[i + 1];
    app.innerHTML = `<div class="cititor">
      <div class="bara"><button class="ic" data-go="${k === "coperta" ? "#/acasa" : "#/r/" + esc(rid)}" aria-label="înapoi">‹</button>
        <div class="t">${esc(e.t)}<small>${k === "coperta" ? esc(mic(r.titlu)) : "capitolul " + e.nr}</small></div>
        <button class="ic bifa" id="bf" aria-pressed="false" aria-label="bifează capitolul pentru pdf" title="bifează pentru pdf">✓</button>
        <button class="ic" id="m" aria-label="capitole">☰</button></div>
      <div style="position:relative;flex:1;display:flex"><iframe title="${esc(e.t)}" referrerpolicy="no-referrer"></iframe><div class="incarc" id="inc">se încarcă…</div></div>
      <div class="jos"><button class="btn alb mic" id="p" ${prev ? "" : "disabled"} aria-label="capitolul anterior">‹ înapoi</button><span class="n">${i + 1} / ${ord.length}</span><button class="btn mic" id="u" ${next ? "" : "disabled"} aria-label="capitolul următor">înainte ›</button></div></div>`;
    $("#m").onclick = () => meniu(r, k);
    bife(rid).then(sel => { const b = $("#bf"); if (!b || gen !== generatia) return;
      const arata = () => { const on = sel.has(k); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); };
      arata(); b.onclick = () => { comuta(rid, k); arata(); }; });
    const du = kk => { if (kk) location.hash = `#/r/${rid}/${kk}`; };
    $("#p").onclick = () => du(prev); $("#u").onclick = () => du(next);
    const fr = $("iframe");
    try {
      const [css, html] = await Promise.all([S.css[rid] || capitol(rid, "css"), capitol(rid, k)]);
      S.css[rid] = css;
      if (gen !== generatia) return;
      cadru(fr, html, css, rid, d => {
        $("#inc") && $("#inc").remove();
        // glisare stânga / dreapta între capitole (în cadru și pe bara de jos)
        let x0 = 0, y0 = 0, t0 = 0;
        const st = ev => { const t = ev.changedTouches[0]; x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); };
        const en = ev => { const t = ev.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0;
          if (Math.abs(dx) > 70 && Math.abs(dy) < Math.abs(dx) * 0.6 && Date.now() - t0 < 800) du(dx < 0 ? next : prev); };
        d.addEventListener("touchstart", st, { passive: true }); d.addEventListener("touchend", en, { passive: true });
        // „capitolul următor" la capătul capitolului
        if (next) { const n = eticheta(r, next), b = d.createElement("div");
          b.setAttribute("style", "pointer-events:auto;cursor:pointer;margin:28px 16px calc(28px + env(safe-area-inset-bottom,0px));padding:18px;border-radius:16px;background:#1a1e2a;color:#fff;font:600 15px system-ui;display:flex;justify-content:space-between;align-items:center;gap:12px");
          b.innerHTML = `<span><small style="display:block;opacity:.7;font-weight:500">capitolul următor · ${n.nr}</small>${esc(n.t)}</span><span style="font-size:22px">›</span>`;
          b.addEventListener("click", () => du(next)); d.body.appendChild(b); }
        d.defaultView && d.defaultView.scrollTo(0, 0);
        // o poză care nu s-a încărcat (link expirat): capitolul se cere din nou, o singură dată
        let reluat = false;
        const reia = () => { if (reluat || gen !== generatia || !navigator.onLine) return; reluat = true; S.cache.delete(rid + "/" + k); ecranCapitol(rid, k); };
        if ([...d.images].some(i => i.complete && i.naturalWidth === 0 && i.getAttribute("src"))) reia();
        d.addEventListener("error", ev => { if (ev.target && ev.target.tagName === "IMG") reia(); }, true);
      });
    } catch (err) {
      if (gen !== generatia || !$("#inc")) return;
      $("#inc").textContent = err.status === 429 ? mic(err.message) : err.status === 403 ? "nu mai ai acces la acest raport." : "capitolul nu se poate deschide acum. verifică semnalul și încearcă din nou.";
    }
  }

  /* ---------- pagina finală: pdf (complet / bifate / trimite), „am nevoie și de", aplicația pe telefon ---------- */
  const SERVICII = [["evaluare", "evaluare de la un evaluator autorizat anevar"], ["energetic", "certificat energetic"], ["opinie", "opinie juridică de la avocat"],
    ["cf", "extras de carte funciară sau alte date de cadastru"], ["mapa", "mapa proprietății pregătită de noi: toate actele, în ordine"]];
  async function ecranFinal(r) {
    const rid = r.id, sel = await bife(rid), lista = deTiparit(r);
    const cuDate = lista;
    app.innerHTML = `<div class="ecran"><div class="bara" style="margin:-14px -16px 0;padding-left:12px"><button class="ic" data-go="#/r/${esc(rid)}/concluzii" aria-label="înapoi">‹</button><div class="t">pdf și cereri<small>${esc(mic(r.titlu))}</small></div></div>
      <div class="cutie"><h2>pdf-ul raportului</h2><p class="mut" style="margin:0;font-size:14px">bifează ce vrei în pdf sau ce vrei să trimiți. bifele se văd și în capitole, la butonul ✓ de sus.</p>
        <div class="tip"><button class="btn alb mic" id="b-tot">bifează tot</button><button class="btn alb mic" id="b-nimic">nimic</button></div>
        <div class="lista" id="bife">${lista.map(k => { const e = eticheta(r, k); return `<label class="r" style="cursor:pointer"><input type="checkbox" data-k="${esc(k)}" ${sel.has(k) ? "checked" : ""} style="width:22px;height:22px"><div>${esc(e.t)}<small>${k === "coperta" ? "prima pagină" : k === "concluzii" ? "la final" : "capitolul " + e.nr}</small></div></label>`; }).join("")}</div>
        <button class="btn lat" id="pdf-tot">pdf complet (${cuDate.length} pagini)</button>
        <button class="btn alb lat" id="pdf-sel">pdf cu ce ai bifat</button>
        <button class="btn alb lat" id="trimite">trimite ce ai bifat</button>
        <p class="mut" style="margin:0;font-size:13px">pdf-ul se face pe telefon, cu numele tău și codul raportului pe fiecare pagină. în fereastra care se deschide alege „salvează ca pdf”, sau „partajează” ca să-l trimiți pe e-mail ori whatsapp.</p></div>
      <div class="cutie"><h2>mapa proprietății</h2><p class="mut" style="margin:0;font-size:14px">actele pe care le cer notarul și banca la vânzare, pe grupe: bifezi ce ai, vezi ce lipsește, ceri prin noi ce putem obține.</p><button class="btn lat" data-go="#/r/${esc(rid)}/mapa">deschide mapa</button></div>
      <div class="cutie"><h2>am nevoie și de</h2><p class="mut" style="margin:0;font-size:14px">bifează ce mai vrei pentru proprietatea asta. îți scriem cu prețul și termenul; nu plătești nimic acum.</p>
        <div class="lista">${SERVICII.map(([v, t]) => `<label class="r" style="cursor:pointer"><input type="checkbox" name="srv" value="${v}" style="width:22px;height:22px"><div>${esc(t)}</div></label>`).join("")}</div>
        <label class="camp">ce ar trebui să știm (opțional)<input type="text" id="srv-nota" maxlength="300" placeholder="ex.: am nevoie până vineri"></label>
        <button class="btn lat" id="srv-go" disabled>trimite cererea</button><p id="srv-msg"></p></div>
      <div class="cutie"><h2>aplicația pe telefon</h2>${instalata() ? '<p class="okm">aplicația e deja pe ecranul telefonului.</p>' : S.prompt ? '<button class="btn lat" id="inst2">instalează aplicația</button>' : `<p class="mut" style="margin:0;font-size:14px">${/iPhone|iPad/.test(navigator.userAgent) ? "în safari apasă butonul de partajare (pătratul cu săgeată), apoi „adaugă pe ecranul principal”." : "în meniul browserului (⋮) alege „instalează aplicația” sau „adaugă pe ecranul de pornire”."} pe ecran intri cu același cod al raportului și pin.</p>`}</div>
      <p class="nota">serviciu privat de analiză, independent de instituțiile publice.</p></div>`;
    const nr = () => { const n = [...sel].filter(k => lista.includes(k)).length; $("#pdf-sel").textContent = `pdf cu ce ai bifat (${n})`; $("#pdf-sel").disabled = !n; $("#trimite").disabled = !n; };
    nr();
    $("#bife").addEventListener("change", e => { const c = e.target.closest("input[data-k]"); if (c) { comuta(rid, c.dataset.k, c.checked); nr(); } });
    $("#b-tot").onclick = () => { $$("#bife input").forEach(c => { c.checked = true; comuta(rid, c.dataset.k, true); }); nr(); };
    $("#b-nimic").onclick = () => { $$("#bife input").forEach(c => { c.checked = false; comuta(rid, c.dataset.k, false); }); nr(); };
    $("#pdf-tot").onclick = () => tipareste(r, cuDate, "complet");
    $("#pdf-sel").onclick = () => tipareste(r, lista.filter(k => sel.has(k)), "selecție");
    $("#trimite").onclick = () => tipareste(r, lista.filter(k => sel.has(k)), "trimite");
    const i2 = $("#inst2"); if (i2) i2.onclick = async () => { S.prompt.prompt(); try { await S.prompt.userChoice; } catch (e) {} S.prompt = null; ecranFinal(r); };
    const srvOk = () => { $("#srv-go").disabled = !$$("input[name=srv]:checked").length; };
    app.querySelectorAll("input[name=srv]").forEach(c => c.addEventListener("change", srvOk));
    $("#srv-go").onclick = async () => {
      const servicii = $$("input[name=srv]:checked").map(c => c.value), m = $("#srv-msg");
      $("#srv-go").disabled = true; m.className = "mut"; m.textContent = "trimit…";
      const { data, error } = await sb.from("cereri").insert({ tip: "servicii", date: { raport_id: rid, servicii, nota: $("#srv-nota").value.trim().slice(0, 300) } }).select("nr").single();
      if (error) { m.className = "err"; m.textContent = /5 cereri/.test(error.message) ? mic(error.message) : "cererea nu s-a putut trimite acum."; $("#srv-go").disabled = false; return; }
      m.className = "okm"; m.textContent = `cererea ${data.nr.toLowerCase()} e înregistrată. îți scriem cu prețul și termenul.`;
      $$("input[name=srv]").forEach(c => c.checked = false);
    };
  }

  /* disclaimerul de la finalul pdf-ului: aici (și doar aici) se spune ce capitole nu au încă registre locale */
  function disclaimer(r, keys) {
    const fara = capsDe(r).filter(c => c.fara_registru && keys.includes(c.k)).map(c => mic(c.titlu));
    return `<div class="tp-cap tp-disc"><h3>despre acest raport</h3>
      <p>raportul e un serviciu privat de analiză și arată informații orientative despre locul unde se află proprietatea: ce se poate construi, riscurile, viața din zonă și costurile unei tranzacții. el nu înlocuiește un extras de carte funciară, o evaluare făcută de un evaluator autorizat, un certificat energetic sau o opinie juridică, și nu e o concluzie juridică.</p>
      ${fara.length ? `<p>pentru ${fara.length === 1 ? "capitolul" : "capitolele"} <b>${esc(fara.join(", "))}</b> nu avem încă registre locale (evidențe ținute la nivelul localității): datele de acolo vin din surse generale și sunt orientative; confirmă-le la nivel local înainte de semnarea unui act.</p>` : ""}
      <p>estimările (prețuri, zgomot, costuri) sunt calcule pe baza datelor disponibile la data raportului și pot diferi de realitate. verifică actele la notar și la bancă, mai ales acolo unde un capitol e marcat „de verificat”.</p>
      <p style="color:#8a8f9c;font-size:12px">raport ${esc(mic(r.cod || ""))} · generat pentru ${esc(S.user.email || "")} · ${esc(new Date().toLocaleDateString("ro-RO"))}</p></div>`;
  }

  /* pdf pe telefon: capitolele alese (aceleași, randate pe server) puse unul după altul, cu filigran, apoi fereastra de tipărire a telefonului */
  async function tipareste(r, keys, mod) {
    if (!keys.length) return;
    const rid = r.id, ov = document.createElement("div");
    ov.className = "foaie"; ov.innerHTML = '<div class="f" style="text-align:center"><b>pregătesc pdf-ul…</b><p class="mut" id="tp-n"></p></div>'; document.body.appendChild(ov);
    const parti = [];
    try {
      const css = S.css[rid] || await capitol(rid, "css"); S.css[rid] = css;
      for (let i = 0; i < keys.length; i++) { $("#tp-n").textContent = `${i + 1} din ${keys.length} capitole`; parti.push(await capitol(rid, keys[i])); }
      const body = (css.match(/^\/\*body:([^*]*)\*\//) || [, ""])[1];
      const azi = new Date().toLocaleDateString("ro-RO");
      const root = document.createElement("div"); root.id = "tipar";
      root.innerHTML = `<style>${css}
@page{size:A4;margin:12mm 10mm 14mm}
#tipar .tp-cap{break-before:page;page-break-before:always}#tipar .tp-cap:first-of-type{break-before:auto;page-break-before:auto}
#tipar img{break-inside:avoid}#tipar .tp-disc{padding:18px 16px;font:14px/1.55 system-ui;color:#1a1e2a}#tipar .tp-disc h3{font:700 20px system-ui;margin:0 0 10px}#tipar .tp-cap-fil{font:600 10px system-ui;color:#8a8f9c;letter-spacing:.04em;padding:4px 14px 0;text-align:right}#tipar button{pointer-events:none}
#tipar .tp-fil{position:fixed;left:0;right:0;bottom:0;text-align:center;font:9px system-ui;color:#8a8f9c}
.tp-bara{position:sticky;top:0;z-index:9;display:flex;gap:8px;align-items:center;padding:10px 12px;background:#1a1e2a;color:#fff;font:600 14px system-ui}
.tp-bara button{pointer-events:auto!important;font:700 14px system-ui;padding:8px 14px;border-radius:99px;border:0;background:#fff;color:#1a1e2a}
@media print{.tp-bara{display:none!important}}</style>
<div class="tp-bara"><button id="tp-x">‹ înapoi</button><span style="flex:1">${mod === "trimite" ? "alege „partajează” în fereastra de tipărire" : "pdf: " + keys.length + " capitole"}</span><button id="tp-p">tipărește / pdf</button></div>
${parti.map(h => `<div class="tp-cap"><div class="tp-cap-fil">cartea casei · ${esc(mic(r.cod || ""))} · ${esc(S.user.email || "")} · ${esc(azi)}</div>${h}</div>`).join("")}
${disclaimer(r, keys)}
<div class="tp-fil">cartea casei · ${esc(mic(r.cod || ""))} · ${esc(S.user.email || "")} · ${esc(azi)} · serviciu privat de analiză</div>`;
      const link = document.querySelector('link[href^="styles.css"]'), clsVechi = document.body.className;
      const inchide = () => { root.remove(); if (link) link.disabled = false; document.body.className = clsVechi; app.style.display = ""; window.removeEventListener("afterprint", inchide); };
      if (link) link.disabled = true; app.style.display = "none"; document.body.className = body; document.body.appendChild(root); ov.remove();
      root.addEventListener("contextmenu", e => e.preventDefault());
      $("#tp-x").onclick = inchide;
      const tipar = async () => { await Promise.race([Promise.all([...root.querySelectorAll("img")].map(i => i.complete ? 0 : i.decode().catch(() => 0))), new Promise(z => setTimeout(z, 15000))]); window.print(); };
      $("#tp-p").onclick = tipar;
      window.addEventListener("afterprint", inchide);
      tipar();
    } catch (e) { ov.remove(); alert(e.status === 429 ? mic(e.message) : "pdf-ul nu se poate face acum. verifică semnalul și încearcă din nou."); }
  }

  /* ---------- cont ---------- */
  async function ecranCont() {
    app.innerHTML = `<div class="ecran"><div class="bara" style="margin:-14px -16px 0;padding-left:12px"><button class="ic" data-go="#/acasa" aria-label="înapoi">‹</button><div class="t">contul meu</div></div>
      <div class="cutie"><b>${esc(S.user.email)}</b><span class="mut" style="font-size:14px">intri fără parolă: cu un cod pe e-mail sau cu un cod qr.</span></div>
      <div class="cutie"><h2>dispozitive</h2><p class="mut" style="margin:0;font-size:14px">cel mult 3 telefoane sau tablete. deconectează ce nu mai folosești.</p><div class="lista" id="disp">…</div></div>
      <div class="cutie"><h2>aplicația pe ecranul de start</h2><p class="mut" style="margin:0;font-size:14px">pe ecranul telefonului intri cu același cod al raportului și pin. dacă nu le ai la îndemână, folosește un cod de aici (o singură dată, 15 minute), la „alte moduri de intrare”.</p>
        <button class="btn lat" id="cod-go">arată un cod de intrare</button><div id="cod-rez"></div></div>
      <div id="inv"></div>
      <button class="btn alb lat" id="iesi">ieși din cont</button>
      <button class="btn alb lat" id="sterge" style="color:var(--rau);border-color:#e7b9b3">șterge contul și datele mele</button>
      <p class="nota">serviciu privat de analiză, independent de instituțiile publice.</p></div>`;
    $("#iesi").onclick = iesi;
    $("#cod-go").onclick = async () => {
      const r = await fetch(FN + "cont", { method: "POST", headers: { Authorization: "Bearer " + await token(), apikey: CFG.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "cod" }) });
      const j = await r.json().catch(() => ({}));
      $("#cod-rez").innerHTML = r.ok ? `<p style="font:700 34px ui-monospace,Menlo,monospace;letter-spacing:.08em;text-align:center;margin:8px 0">${esc(j.cod)}</p><p class="mut" style="margin:0;font-size:13px;text-align:center">scrie-l în aplicația de pe ecranul de start, la „ai un cod de intrare?”.</p>` : '<p class="err">codul nu se poate genera acum.</p>';
    };
    $("#sterge").onclick = async () => {
      if (prompt('ștergi contul, accesul la rapoarte și cererile tale. scrie „sterge" ca să confirmi.') !== "sterge") return;
      const r = await fetch(FN + "cont", { method: "POST", headers: { Authorization: "Bearer " + await token(), apikey: CFG.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify({ actiune: "sterge_cont", confirmare: "sterge" }) });
      if (r.ok) { await iesi(); } else alert("contul nu s-a putut șterge acum.");
    };
    const { data: D } = await sb.from("dispozitive").select("id,nume,ultima_intrare,activ,amprenta").eq("user_id", S.user.id).eq("activ", true).order("ultima_intrare", { ascending: false });
    $("#disp").innerHTML = (D || []).map(d => `<div class="r"><div>${esc(d.nume || "dispozitiv")}${d.amprenta === amprenta() ? " · acesta" : ""}<small>ultima intrare ${esc(data(d.ultima_intrare))}</small></div><button class="btn alb mic" data-dec="${d.id}">deconectează</button></div>`).join("") || '<p class="mut">—</p>';
    $("#disp").onclick = async e => { const b = e.target.closest("[data-dec]"); if (!b) return; await sb.rpc("deconecteaza_dispozitiv", { p_id: b.dataset.dec });
      if ((D || []).find(x => x.id === b.dataset.dec)?.amprenta === amprenta()) return iesi(); ecranCont(); };
    // invitații: doar la rapoartele unde e proprietar
    const ale = S.rapoarte.filter(r => rolul(r.id) === "proprietar");
    if (!ale.length) return;
    const { data: V } = await sb.from("acces_raport").select("id,raport_id,email,expira_la").eq("rol", "vizitator").in("raport_id", ale.map(r => r.id));
    $("#inv").innerHTML = `<div class="cutie"><h2>invită pe cineva</h2><p class="mut" style="margin:0;font-size:14px">soțul, soția sau avocatul tău pot citi raportul 30 de zile. cel mult 2 persoane.</p>
      ${ale.length > 1 ? `<select id="iv-r" style="font-size:16px;padding:10px;border-radius:10px">${ale.map(r => `<option value="${esc(r.id)}">${esc(mic(r.titlu))}</option>`).join("")}</select>` : ""}
      <div class="lista">${(V || []).map(v => `<div class="r"><div>${esc(v.email)}<small>${new Date(v.expira_la) > new Date() ? "până la " + esc(data(v.expira_la)) : "expirat"}</small></div><button class="btn alb mic" data-ret="${v.id}">retrage</button></div>`).join("")}</div>
      <label class="camp">e-mailul persoanei<input type="email" id="iv-em" inputmode="email"></label><button class="btn lat" id="iv-go">invită</button><div id="iv-rez"></div></div>`;
    const post = b => fetch(FN + "cont", { method: "POST", headers: { Authorization: "Bearer " + S.tok, apikey: CFG.supabaseKey, "Content-Type": "application/json" }, body: JSON.stringify(b) }).then(async r => [r.ok, await r.json()]);
    S.tok = await token();
    $("#inv").onclick = async e => { const b = e.target.closest("[data-ret]"); if (!b) return; await post({ actiune: "retrage", id: b.dataset.ret }); ecranCont(); };
    $("#iv-go").onclick = async () => {
      const [ok, j] = await post({ actiune: "invita", raport_id: ($("#iv-r") || {}).value || ale[0].id, email: $("#iv-em").value });
      const z = $("#iv-rez");
      if (!ok) { z.innerHTML = `<p class="err">${esc(mic(j.error || "nu s-a putut"))}</p>`; return; }
      const link = `${BAZA}#qr=${j.token}`;
      z.innerHTML = `<p class="okm">trimite-i linkul sau arată-i codul. merge o singură dată, până la ${esc(data(j.expira_la))}.</p><div class="qr" style="align-self:center">${qrSvg(link, 4)}</div>
        <button class="btn alb lat" id="iv-sh">${navigator.share ? "trimite linkul" : "copiază linkul"}</button>`;
      $("#iv-sh").onclick = async () => { try { if (navigator.share) await navigator.share({ title: "cartea casei", text: "raportul casei, în aplicația cartea casei", url: link }); else { await navigator.clipboard.writeText(link); $("#iv-sh").textContent = "copiat"; } } catch (e) {} };
    };
  }
  async function iesi() {
    S.cache.clear(); S.css = {}; S.rapoarte = []; S.user = null;
    try { navigator.serviceWorker && navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage("sterge-poze"); } catch (e) {}
    await sb.auth.signOut({ scope: "local" }).catch(() => {});
    location.hash = ""; ecranIntrare();
  }

  /* ---------- desktop: coperta + QR ---------- */
  async function ecranDesktop() {
    const r = S.rapoarte[0];
    app.innerHTML = `<div class="desk"><div class="cop">${r ? '<iframe title="coperta"></iframe>' : '<div class="ecran centru"><p class="mut">încă nu ai un raport publicat.</p></div>'}</div>
      <div class="lat">${marca()}<h1>raportul se citește pe telefon</h1><p class="lead">pe calculator vezi doar prima pagină. scanează codul cu camera telefonului și intră cu același e-mail.</p>
      <div class="qr">${qrSvg(BAZA, 6)}</div><button class="btn alb" id="iesi">ieși din cont</button><p class="nota" style="text-align:left">serviciu privat de analiză, independent de instituțiile publice.</p></div></div>`;
    $("#iesi").onclick = iesi;
    if (r) { try { const [css, html] = await Promise.all([capitol(r.id, "css"), capitol(r.id, "coperta")]); cadru($(".cop iframe"), html, css, r.id); } catch (e) {} }
  }

  /* ---------- rutare ---------- */
  async function ruta() {
    if (!S.user) return;
    if (!MOBIL()) return ecranDesktop();
    const h = location.hash.replace(/^#\/?/, "").split("/");
    if (h[0] === "r" && h[1]) return ecranCapitol(h[1], h[2] || "coperta");
    if (h[0] === "cont") return ecranCont();
    if (h[0] === "cerere" && window.CC_CERERI) return CC_CERERI.ecran(app);
    return ecranAcasa();
  }
  document.addEventListener("click", e => { const g = e.target.closest("[data-go]"); if (g) { e.preventDefault(); location.hash = g.dataset.go; } });
  addEventListener("hashchange", () => { if (!/access_token|qr=/.test(location.hash)) ruta(); });
  let latime = innerWidth; addEventListener("resize", () => { if ((latime < 760) !== (innerWidth < 760)) { latime = innerWidth; ruta(); } });

  async function porneste() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return ecranIntrare();
    S.user = session.user;
    try { await inregistreaza(); } catch (e) { await sb.auth.signOut({ scope: "local" }).catch(() => {}); S.user = null; return ecranIntrare({ t: e.message }); }
    try { await incarcaRapoarte(); } catch (e) { app.innerHTML = '<div class="ecran centru"><p class="err">nu am putut încărca rapoartele. încearcă din nou.</p></div>'; return; }
    if (/access_token/.test(location.hash)) history.replaceState(null, "", location.pathname + "#/acasa");
    ruta();
  }
  window.CC = { sb, esc, mic, data, S, FN, CFG, ruta };

  (async () => {
    if ("serviceWorker" in navigator && isSecureContext) navigator.serviceWorker.register("sw.js").catch(() => {});
    const q = location.hash.match(/qr=([A-Za-z0-9_-]{30,80})/);
    if (q) { history.replaceState(null, "", location.pathname); if (!(await intrareQr(q[1]))) return; }
    sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT" && S.user) { S.user = null; S.cache.clear(); ecranIntrare(); }
      if (ev === "TOKEN_REFRESHED" && S.user) { const c = $(".cititor.int"); trimiteSesiune(c ? c.dataset.rid : null); } });
    porneste();
  })();
})();
