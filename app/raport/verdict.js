/* Raport în creștere — verdictul sugerat din date pentru fiecare capitol și cele 6 stări de verdict.
   Folosit de pagina interactivă (builder.js) și de PDF (raport_pdf.html), ca să dea același rezultat.
   RIC_VERDICT.sugerat(k, D, HR) → [stare, motiv]; stările: bine, verificat, rau, neconcl, info (+ auto = „ia sugestia”). */
(function () {
  const VER = { auto: ["Automat", "#7b847f"], bine: ["Arată bine", "#1f8a4c"], verificat: ["De verificat", "#c86a0a"], rau: ["Nu arată bine", "#c0322b"], neconcl: ["Neconcludent", "#6b7280"], info: ["Informativ", "#2c5c9c"] };
  const DIN = { g: "bine", o: "verificat", r: "rau", i: "info" };
  const CAP = [["inundatii", "Inundații"], ["seismic", "Risc seismic"], ["urbanism", "Urbanism și PUZ"], ["zonare", "Zonarea cartierului"], ["autorizatii", "Autorizații de construire"],
    ["insorire", "Însorire"], ["pv", "Fotovoltaic"], ["facilitati", "Facilități"], ["transport", "Transport"], ["scoli", "Școli"],
    ["populatie", "Populație"], ["monumente", "Monumente și arheologie"], ["costuri", "Costuri și impozit"],
    ["alunecari", "Teren și alunecări"], ["arii_protejate", "Arii protejate"], ["aer", "Calitatea aerului"], ["zgomot", "Zgomot"]];
  function sugerat(k, D, HR) {
    if (!D) return ["neconcl", "fără date"];
    try {
      if (k === "inundatii") { const z = D.inundatii.hazard.hz10.dist_m, z1 = D.inundatii.hazard.hz100.dist_m;
        return z === 0 ? ["rau", "în zona inundabilă de 10 ani"] : (typeof z === "number" && z <= 100) ? ["verificat", `zona de 10 ani la ≈ ${z} m`] : (z1 === 0 ? ["verificat", "în zona de 100 de ani"] : ["bine", "fără zone de inundație aproape"]); }
      if (k === "insorire") return ["info", "calcul astronomic; umbrele clădirilor reale nu sunt incluse"];
      if (k === "pv") return D.pv ? [D.pv.annual.PVOUT_csi >= 1200 ? "bine" : "verificat", `${Math.round(D.pv.annual.PVOUT_csi)} kWh/kWp pe an`] : ["neconcl", "fără date"];
      if (k === "urbanism") { const U = D.urbanism; if (!U) return ["neconcl", "fără date"];
        const lt = String(U.pug?.litigii || "");   // „Niciun litigiu găsit…” nu e un litigiu
        return !/^\s*(niciun|nimic|nu)\b/i.test(lt) && /litigi|recurs|anulare/i.test(lt) ? ["verificat", "PUG în litigiu"] : U.pug?.gasit ? ["bine", "PUG găsit"] : ["neconcl", "PUG necunoscut"]; }
      const V = (window.VEC || []).find(v => v.k === k), X = k === "zonare" ? (HR ? {} : null) : D[k];
      if (!V || !X) return ["neconcl", "fără date"];
      const c = V.def(X, HR), t = c.verd[1];
      return [DIN[c.verd[0]] || "neconcl", t.length > 110 ? t.slice(0, 108) + "…" : t];
    } catch (e) { return ["neconcl", "eroare la calcul"]; }
  }
  const efectiv = (k, sel, D, HR) => { const v = sel?.cap?.[k]?.verdict || "auto"; return v === "auto" ? sugerat(k, D, HR)[0] : v; };
  window.RIC_VERDICT = { VER, CAP, sugerat, efectiv };
})();
