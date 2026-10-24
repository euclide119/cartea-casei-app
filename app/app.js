/* cartea casei · aplicația clientului (F0.4, 24.10.2026). Plan: documente/analize/aplicatia_clientului_cartea_casei.md.
   intrare (cod pe e-mail sau QR de o folosință) → acasă (rapoartele lui) → raport (prima pagină + meniul capitolelor) → capitol (glisare stânga / dreapta) → cont.
   Aplicația nu randează date: primește de la server HTML-ul gata randat al unui singur capitol (Edge Function „capitol") și îl afișează într-un cadru fără scripturi.
   Nimic din raport nu se scrie pe telefon: capitolele stau doar în memorie, cel mult 9 minute (URL-urile pozelor expiră în 10), și se șterg la ieșire.
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
    if (c && Date.now() - c.t < 9 * 60e3) return c.v;
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
  const marca = () => `<div class="marca"><img src="icon-192.png" alt="">cartea casei</div>`;
  function qrSvg(text, cell) { try { const q = qrcode(0, "M"); q.addData(text); q.make(); return q.createSvgTag({ cellSize: cell || 5, margin: 2, scalable: true }); } catch (e) { return ""; } }
  function ecranIntrare(msg) {
    const desk = !MOBIL();
    app.innerHTML = `<div class="ecran">${marca()}
      <div><h1>raportul casei tale</h1><p class="lead">doar pentru tine, capitol cu capitol. intri cu codul raportului și pin-ul.</p></div>
      <div class="cutie" id="f-pin">
        <label class="camp">codul raportului<input type="text" id="pc" autocapitalize="characters" autocomplete="username" spellcheck="false" placeholder="CC-XXXXXX"></label>
        <label class="camp">pin<input type="tel" id="pp" inputmode="numeric" autocomplete="current-password" maxlength="6" placeholder="6 cifre"></label>
        <button class="btn lat" id="pin-go">intră</button>
        <p id="msg" class="${msg && msg.ok ? "okm" : "err"}">${esc(msg ? msg.t : "")}</p>
        <p class="mut" style="margin:0;font-size:13px">codul și pin-ul sunt pe prima pagină a raportului pdf și în e-mailul de livrare.</p>
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
      sb.from("rapoarte").select("id,cod,titlu,tip_proprietate,capitole,capitole_cu_date,capitole_total,publicat_la").order("publicat_la", { ascending: false }),
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
        <div class="cap"><span>${esc(mic(r.cod))}${rolul(r.id) === "vizitator" ? " · invitat" : ""}</span></div>
        <div class="in"><b>${esc(mic(r.titlu))}</b><span class="m">${r.capitole_total || 26} de capitole, ${r.capitole_cu_date ?? "—"} cu date pentru locul ăsta</span><span class="m">publicat ${esc(data(r.publicat_la))}</span></div></button>`).join("")}</div>
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
  const capsDe = r => (r.capitole || []);
  function meniu(r, kAcum) {
    const f = document.createElement("div"); f.className = "foaie";
    let g0 = null;
    f.innerHTML = `<div class="f" role="dialog" aria-label="capitolele raportului"><div style="display:flex;justify-content:space-between;align-items:center"><h2>capitole</h2><button class="ic" data-x aria-label="închide">✕</button></div>
      <button class="c ${kAcum === "coperta" ? "acum" : ""}" data-k="coperta"><i>00</i>prima pagină</button>
      ${capsDe(r).map(c => { const g = c.grup !== g0 ? `<div class="g">${esc(mic(c.grup))}</div>` : ""; g0 = c.grup;
        return `${g}<button class="c ${c.are_date ? "" : "gri"} ${c.k === kAcum ? "acum" : ""}" data-k="${esc(c.k)}"><i>${String(c.nr).padStart(2, "0")}</i>${esc(mic(c.titlu))}${c.clasa === "esential" ? '<span class="e" title="esențial"></span>' : ""}</button>`; }).join("")}
      <button class="c ${kAcum === "concluzii" ? "acum" : ""}" data-k="concluzii"><i>27</i>rezumat și concluzii</button></div>`;
    f.addEventListener("click", e => {
      if (e.target === f || e.target.closest("[data-x]")) { f.remove(); return; }
      const b = e.target.closest("[data-k]"); if (b) { f.remove(); location.hash = `#/r/${r.id}/${b.dataset.k}`; }
    });
    document.body.appendChild(f);
  }
  function ordine(r) { return ["coperta", ...capsDe(r).map(c => c.k), "concluzii"]; }
  function eticheta(r, k) {
    if (k === "coperta") return { nr: "00", t: "prima pagină" };
    if (k === "concluzii") return { nr: "27", t: "rezumat și concluzii" };
    const c = capsDe(r).find(x => x.k === k) || {}; return { nr: String(c.nr || "").padStart(2, "0"), t: mic(c.titlu || k), gri: !c.are_date };
  }
  let generatia = 0;
  async function ecranCapitol(rid, k) {
    const gen = ++generatia;
    const r = S.rapoarte.find(x => x.id === rid);
    if (!r) { location.hash = "#/acasa"; return; }
    const ord = ordine(r); if (!ord.includes(k)) k = "coperta";
    const i = ord.indexOf(k), e = eticheta(r, k), prev = ord[i - 1], next = ord[i + 1];
    app.innerHTML = `<div class="cititor">
      <div class="bara"><button class="ic" data-go="${k === "coperta" ? "#/acasa" : "#/r/" + esc(rid)}" aria-label="înapoi">‹</button>
        <div class="t">${esc(e.t)}<small>${k === "coperta" ? esc(mic(r.titlu)) : "capitolul " + e.nr + (e.gri ? " · fără date încă" : "")}</small></div>
        <button class="ic" id="m" aria-label="capitole">☰</button></div>
      <div style="position:relative;flex:1;display:flex"><iframe title="${esc(e.t)}" referrerpolicy="no-referrer"></iframe><div class="incarc" id="inc">se încarcă…</div></div>
      <div class="jos"><button class="btn alb mic" id="p" ${prev ? "" : "disabled"} aria-label="capitolul anterior">‹ înapoi</button><span class="n">${i + 1} / ${ord.length}</span><button class="btn mic" id="u" ${next ? "" : "disabled"} aria-label="capitolul următor">înainte ›</button></div></div>`;
    $("#m").onclick = () => meniu(r, k);
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
      });
    } catch (err) {
      if (gen !== generatia || !$("#inc")) return;
      $("#inc").textContent = err.status === 429 ? mic(err.message) : err.status === 403 ? "nu mai ai acces la acest raport." : "capitolul nu se poate deschide acum. verifică semnalul și încearcă din nou.";
    }
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
    sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT" && S.user) { S.user = null; S.cache.clear(); ecranIntrare(); } });
    porneste();
  })();
})();
