/* Raportul Casei v82.3.0 - numerotare (doar admin local). Insigne „#n" lângă capitole (1–22) și secțiuni (1–200), din numerotare.json
   (Banca de Date: proiecte/epay/raport_cartea_casei/numerotare.json; se regenerează cu numerotare.py). Comutator „numerotare", implicit oprit.
   Nu apare la client (?client=1 / CC_CLIENT / gazdă nelocală), nu se tipărește (@media print, body.ac din PDF), nu modifică nimic existent. */
(function () {
  "use strict";
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!local || window.CC_CLIENT || window.parent !== window || /[?&]client=1/.test(location.search)) return;
  let N = null, on = false;
  try { on = localStorage.getItem("cc_numerotare") === "1"; } catch (e) {}
  const css = document.createElement("style");
  css.textContent = ".nr-b{display:none;font:600 11px/1 system-ui,sans-serif;background:#fff3b0;color:#5a4500;border:1px solid #d9b800;border-radius:9px;padding:2px 6px;margin-left:8px;vertical-align:middle;letter-spacing:0}" +
    "body.nr-on .nr-b{display:inline-block}" +
    "#nr-sw{position:fixed;right:8px;bottom:60px;z-index:99999;font:600 12px system-ui,sans-serif;background:#fff;color:#222;border:1px solid #999;border-radius:14px;padding:5px 10px;cursor:pointer;opacity:.85}" +
    "#nr-sw.on{background:#fff3b0;border-color:#d9b800}" +
    "@media print{.nr-b,#nr-sw{display:none!important}}body.ac-cl .nr-b,body.ac-cl #nr-sw,body.ac-print .nr-b{display:none!important}";
  document.head.appendChild(css);
  function badge(n, tip) { const s = document.createElement("span"); s.className = "nr-b"; s.dataset.nr = n; s.textContent = "#" + n; s.title = tip; s.setAttribute("data-nr-tip", tip); return s; }
  function pune() {
    if (!N) return;
    document.querySelectorAll(".ac-card[data-c]").forEach(c => {
      const nr = +c.dataset.c + 1, h = c.querySelector(".ac-t h2"); if (!h || h.querySelector(".nr-b")) return;
      const e = N.capitole[nr]; h.appendChild(badge(nr, "capitol " + nr + (e && e.titlu ? " · " + e.titlu : "")));
    });
    const pe = {}; Object.values(N.bucati).forEach(b => { if (b.tip === "sectiune") pe[b.cheie.slice(9)] = b; });
    document.querySelectorAll("section[id]").forEach(s => {
      const b = pe[s.id]; if (!b || s.querySelector('.nr-b[data-sec="' + s.id + '"]')) return;
      const h = s.querySelector("h2,h3"), x = badge(b.nr, "bucata " + b.nr + " · " + b.cheie);
      x.dataset.sec = s.id; if (h) h.appendChild(x); else s.insertBefore(x, s.firstChild);
    });
  }
  function comutator() {
    const b = document.createElement("button"); b.id = "nr-sw"; b.type = "button";
    const st = () => { b.textContent = "numerotare: " + (on ? "pornit" : "oprit"); b.classList.toggle("on", on); document.body.classList.toggle("nr-on", on); };
    b.onclick = () => { on = !on; try { localStorage.setItem("cc_numerotare", on ? "1" : "0"); } catch (e) {} st(); if (on) pune(); };
    document.body.appendChild(b); st();
  }
  function start() {
    comutator();
    fetch("numerotare.json").then(r => r.ok ? r.json() : Promise.reject(r.status)).then(j => { N = j; pune(); new MutationObserver(() => { if (on) pune(); }).observe(document.body, { childList: true, subtree: true }); })
      .catch(e => { const b = document.getElementById("nr-sw"); if (b) b.title = "numerotare.json indisponibil (" + e + ")"; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
