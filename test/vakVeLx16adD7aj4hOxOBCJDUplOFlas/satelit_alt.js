/* Raportul Casei v82.12.0 — comutator satelit, ÎNTR-UN SINGUR LOC.
   CC_SATELIT = "max"    → imaginile Esri, exact ca până acum (modulul nu face nimic).
   CC_SATELIT = "permis" → fiecare imagine Esri e înlocuită la afișare cu geamănul *_s2.jpg (Sentinel-2, Copernicus), dacă există,
                           iar atribuirea Copernicus apare lângă imagine. Geamănul lipsă → rămâne originalul (revenire automată).
   Imaginile Esri nu se șterg. Geamănele și atribuirea vin din p/<id>/date.json → satelit_alt (satelit_sentinel.py).
   Pentru probă locală: ?satelit=permis în adresă (doar pe localhost). */
window.CC_SATELIT = "max";   /* ← singurul rând de schimbat: "max" | "permis" */
(function () {
  "use strict";
  var MOD = window.CC_SATELIT;
  try { if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) { var q = new URLSearchParams(location.search).get("satelit"); if (q === "max" || q === "permis") MOD = q; } } catch (e) {}
  window.CC_SATELIT_ACTIV = MOD;
  if (MOD !== "permis") return;

  var RX = /(^|\/)p\/([^\/?#]+)\/(satelit|sat_detaliu|inund_local|inund_regional|teren3d_sat_300|teren3d_sat_1500|teren3d_sat)\.jpg(\?[^#]*)?$/;
  var META = {};                                   /* id → promisiune cu satelit_alt */
  function alt(id) {
    return META[id] || (META[id] = fetch("p/" + id + "/date.json").then(function (r) { return r.ok ? r.json() : null; }).then(function (d) { return d && d.satelit_alt || null; }).catch(function () { return null; }));
  }
  function gemene(u) { var m = RX.exec(u || ""); return m ? { id: m[2], nume: m[3] + ".jpg", orig: u, s2: u.replace(/\.jpg(\?[^#]*)?$/, "_s2.jpg") } : null; }

  function textAtr(a) { return (a.atribuire || "Contains modified Copernicus Sentinel data") + " · Sentinel-2, " + (a.data || "") + (a.nori != null ? ", nori " + a.nori + " %" : ""); }
  function legenda(el, id) {                       /* atribuirea lângă imagine, o singură dată pe containerul ei */
    alt(id).then(function (a) {
      if (!a || !el || !el.parentNode) return;
      var gaz = el.closest("figure") || el.parentNode;
      var afara = getComputedStyle(gaz).overflow !== "visible" && gaz.parentNode;     /* gazdă cu overflow ascuns: legenda sub ea, nu în ea */
      if (afara ? (gaz.nextElementSibling && gaz.nextElementSibling.classList.contains("sa-attr")) : gaz.querySelector(":scope > .sa-attr")) return;
      var s = document.createElement("div"); s.className = "sa-attr keep"; s.textContent = "© " + textAtr(a);
      if (afara) gaz.insertAdjacentElement("afterend", s); else gaz.appendChild(s);
    });
  }
  var st = document.createElement("style");
  st.textContent = ".sa-attr{font:500 11px/1.3 'Instrument Sans',system-ui,sans-serif;color:#475569;background:rgba(255,255,255,.88);padding:2px 6px;border-radius:4px;margin:3px 0 0;display:block;width:fit-content;max-width:100%}html body section.ac-s .sa-attr.keep,html body .sa-attr.keep{display:block!important}";   /* acordeonul pune .ac-n2 (nivelul „mai mult”) pe elemente noi: legenda rămâne vizibilă */
  document.head.appendChild(st);

  /* 1) imagini create din JS: new Image().src = … și img.setAttribute("src", …) */
  function aplica(img, u, setter) {
    var g = gemene(u);
    if (!g) return setter(u);
    var inapoi = false;
    img.addEventListener("error", function f() { if (inapoi) return; inapoi = true; img.removeEventListener("error", f); img.dataset.saFallback = "1"; setter(g.orig); }, { once: false });
    img.dataset.saS2 = g.id; img.dataset.saOrig = g.orig;
    img.addEventListener("load", function () {
      if (img.dataset.saFallback === "1") return;
      if (img.isConnected) return legenda(img, g.id);
      if (g.nume === "satelit.jpg") { var cv = document.querySelector("#insorire canvas#c"); if (cv) legenda(cv, g.id); }   /* însorirea desenează imaginea pe canvas */
    });
    setter(g.s2);
  }
  var d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
  if (d && d.set) {
    Object.defineProperty(HTMLImageElement.prototype, "src", {
      configurable: true, enumerable: d.enumerable, get: d.get,
      set: function (v) { var self = this; if (self.dataset && self.dataset.saS2 && v === self.dataset.saOrig) return d.set.call(self, v); aplica(self, String(v), function (x) { d.set.call(self, x); }); }
    });
  }
  var sa = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
    if (this instanceof HTMLImageElement && String(n).toLowerCase() === "src") { var self = this; return aplica(self, String(v), function (x) { sa.call(self, n, x); }); }
    return sa.call(this, n, v);
  };

  /* 2) imagini din HTML inserat (innerHTML): observator, înainte de a se încărca cele mai multe */
  function scaneaza(n) {
    if (n.nodeType !== 1) return;
    var L = n.tagName === "IMG" ? [n] : n.querySelectorAll ? Array.prototype.slice.call(n.querySelectorAll("img")) : [];
    L.forEach(function (im) { if (im.dataset.saS2) return; var u = im.getAttribute("src"); if (gemene(u)) im.setAttribute("src", u); });
  }
  new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(scaneaza); }); }).observe(document.documentElement, { childList: true, subtree: true });

  /* 3) harta (canvas): HM.setContext primește imaginea și meta (atribuire, dată) — le înlocuim */
  function leagaHarta() {
    if (!window.HM || HM.__sa) return !!(window.HM && HM.__sa);
    var orig = HM.setContext; HM.__sa = 1;
    HM.setContext = function (o) {
      var u = o && o.urls && o.urls.detaliu, g = gemene(u);
      var A0 = null; try { A0 = (typeof D !== "undefined" && D && D.id === (g && g.id) && D.satelit_alt) || null; } catch (e) {}
      if (g && A0 && A0.fisiere && A0.fisiere["sat_detaliu.jpg"] && o.sat && o.sat.detaliu) {    /* date.json e deja încărcat: meta se schimbă înainte de desenarea butoanelor */
        o.sat = Object.assign({}, o.sat, { detaliu: Object.assign({}, o.sat.detaliu, { atribuire: A0.atribuire, data: A0.data, furnizor: "Sentinel-2", rez_m: "10", vechi: false, vechime_ani: 0, sursa: A0.sursa }) });
      }
      if (g) o.urls = Object.assign({}, o.urls, { detaliu: g.s2 });
      orig.call(HM, o);
      if (!g) return;
      alt(g.id).then(function (a) {
        var c = HM.CTX.sat.detaliu;
        if (!c) return;
        if (!a || !a.fisiere || !a.fisiere["sat_detaliu.jpg"]) { c.img.src = g.orig; return; }       /* fără geamăn: Esri */
        c.meta = Object.assign({}, c.meta, { atribuire: a.atribuire, data: a.data, furnizor: "Sentinel-2", rez_m: "10", vechi: false, vechime_ani: 0, sursa: a.sursa });
        HM.CTX.subs.forEach(function (f) { try { f(); } catch (e) {} });
      });
    };
    return true;
  }
  if (!leagaHarta()) { var t = setInterval(function () { if (leagaHarta()) clearInterval(t); }, 25); setTimeout(function () { clearInterval(t); }, 8000); }

  /* 4) relieful 3D (canvas): atribuirea lângă canvas */
  new MutationObserver(function () {
    var b = document.getElementById("teren3d"); if (!b || b.querySelector(".sa-attr")) return;
    var m = /\/p\/([^\/]+)|p\/([^\/?#]+)/.exec((document.querySelector("[data-sa-s2]") || {}).src || "");
    var id = (window.D && D.id) || (m && (m[1] || m[2])) || (location.hash || "").replace("#", "");
    var cv = b.querySelector("canvas"); if (!cv || !id) return;
    legenda(cv, id);
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
