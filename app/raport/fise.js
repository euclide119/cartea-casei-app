/* Raport în creștere — fișa sursei pentru fiecare capitol (cheia = id-ul secțiunii din index.html).
   nationale: sursa profesională la nivel de țară · local: cum s-a particularizat pe proprietate ·
   baza: mod (local | mixt | sursa), dificultate 1–5 (cât de greu e să ținem datele local), notă, reîmprospătare.
   Doar informații publice: fără căi interne din Drive. Se completează din 03_ANALIZA/raport_crestere/cercetare/. */
window.FISE = {
  alunecari: {
    nationale: [
      { institutie: "Institutul Geologic al României (IGR)", set: "Harta geologică a României 1:200.000 (serviciu WMS INSPIRE)", url: "https://geoportal.igr.ro/viewservices.php", detaliu: "unitatea geologică și tipul de rocă în orice punct" },
      { institutie: "Parlamentul · MDLPA", set: "PATN Secțiunea V — zone de risc natural, inclusiv alunecări (Legea 575/2001)", url: "https://legislatie.just.ro/Public/DetaliiDocument/32219", detaliu: "harta oficială de risc e doar tipărită, la nivel de UAT; nu se poate interoga pe punct" },
      { institutie: "Copernicus", set: "Modelul digital al terenului (DEM, aprox. 90 m) și EGMS (mișcarea terenului din satelit)", url: "https://egms.land.copernicus.eu/", detaliu: "panta o calculăm din DEM; EGMS nu are interogare publică pe punct" }
    ],
    local: "Am citit unitatea geologică de sub proprietate și am calculat panta pe 150 m în 8 direcții și diferența de nivel pe 1 km.",
    baza: { mod: "sursa", dificultate: 4, nota: "Geologia și relieful se cer pe loc (servicii publice, rapide). Harta oficială de risc nu există în format digital; harta europeană de susceptibilitate (ELSUS) se dă doar la cerere.", reimprospatare: "rar (hărțile geologice sunt ediții istorice)" }
  },
  arii_protejate: {
    nationale: [
      { institutie: "Ministerul Mediului (MMAP)", set: "Arii naturale protejate ale României (GeoPackage)", url: "https://data.gov.ro/dataset/arii-naturale-protejate-romania", detaliu: "1.578 de situri: Natura 2000, rezervații, monumente ale naturii, Ramsar" },
      { institutie: "Agenția Europeană de Mediu (EEA)", set: "Rețeaua Natura 2000 (serviciu interogabil pe punct)", url: "https://www.eea.europa.eu/data-and-maps/data/natura-14", detaliu: "aceleași situri Natura 2000, la nivel european" },
      { institutie: "ANANP", set: "Inventarul ariilor naturale protejate și custozii lor", url: "https://ananp.gov.ro/ariile-naturale-protejate-ale-romaniei/" }
    ],
    local: "Am verificat dacă proprietatea e într-o arie protejată și am măsurat distanța până la marginea fiecărei arii din 25 km.",
    baza: { mod: "local", dificultate: 1, nota: "Tot registrul național e un singur fișier (72 MB), ținut local; calculul durează sub o secundă.", reimprospatare: "anual (MMAP și EEA actualizează o dată pe an)" }
  },
  aer: {
    nationale: [
      { institutie: "ANPM · Rețeaua națională de monitorizare a calității aerului", set: "Măsurători la stații (calitateaer.ro)", url: "https://www.calitateaer.ro/", detaliu: "datele de la stații nu au API public; se văd doar pe hartă" },
      { institutie: "Copernicus (CAMS) · Open-Meteo", set: "Modelul european de calitate a aerului, oră cu oră", url: "https://open-meteo.com/en/docs/air-quality-api", detaliu: "PM2,5, PM10, NO₂, ozon pe orice punct, pe celule de aprox. 10 km" },
      { institutie: "Agenția Europeană de Mediu (EEA)", set: "Statisticile anuale ale stațiilor și instalațiile industriale (E-PRTR)", url: "https://www.eea.europa.eu/en/topics/in-depth/air-pollution" }
    ],
    local: "Am luat ultimele 92 de zile de valori modelate pentru punctul proprietății și le-am comparat cu recomandările OMS și cu limitele UE.",
    baza: { mod: "sursa", dificultate: 2, nota: "Se cere pe loc (un apel). Pentru serii lungi, un colector zilnic ar putea salva valorile pentru proprietățile din raport.", reimprospatare: "la fiecare raport (datele sunt orare)" }
  },
  zgomot: {
    nationale: [
      { institutie: "Primăriile · CJ · Ministerul Mediului", set: "Hărțile strategice de zgomot (Directiva 2002/49/CE)", detaliu: "Timișoara nu le publică online; CJ Timiș are doar hărțile pentru DJ 691 (PDF, 2022)" },
      { institutie: "Agenția Europeană de Mediu (EEA)", set: "Expunerea populației la zgomot (raportările țărilor)", url: "https://www.eea.europa.eu/en/topics/in-depth/noise", detaliu: "agregat pe orașe, fără valori pe punct" },
      { institutie: "OpenStreetMap", set: "Drumuri mari, cale ferată, tramvai, piste de aeroport", url: "https://www.openstreetmap.org/" }
    ],
    local: "Am măsurat distanța de la proprietate până la cel mai apropiat drum principal, centură, cale ferată, tramvai și pistă de aeroport.",
    baza: { mod: "mixt", dificultate: 4, nota: "Distanțele se calculează din OSM; nivelul în decibeli cere hărțile strategice, care nu sunt publicate ca date — doar la cerere de la primărie.", reimprospatare: "hărțile strategice se refac la 5 ani" }
  },
  populatie: {
    nationale: [
      { institutie: "Institutul Național de Statistică (INS)", set: "Populația după domiciliu 2016–2026 și Recensământul populației și locuințelor 2021", url: "https://insse.ro/", detaliu: "pe UAT; seria anuală din Tempo-Online nu răspunde azi la descărcare automată" },
      { institutie: "Eurostat · INS", set: "Grila GEOSTAT 2021: populația pe pătrate de 1 km²", url: "https://ec.europa.eu/eurostat/web/gisco/geodata/population-distribution/geostat", detaliu: "câți oameni locuiesc chiar în pătratul proprietății; grilă provizorie" }
    ],
    local: "Am luat evoluția populației UAT-ului față de restul județului și numărul de locuitori din pătratul de 1 km al proprietății și din cele 8 vecine.",
    baza: { mod: "local", dificultate: 2, nota: "Tabelul INS și grila Eurostat (186 MB pentru toată Europa) sunt descărcate; Timișul e extras separat.", reimprospatare: "anual (populația după domiciliu); grila la fiecare recensământ" }
  },
  scoli: {
    nationale: [
      { institutie: "Ministerul Educației (SIIIR)", set: "Rețeaua școlară 2025–2026", url: "https://data.gov.ro/organization/ministerul-educatiei", detaliu: "toate unitățile de învățământ, cu adresa; licență CC BY 4.0" },
      { institutie: "Ministerul Educației", set: "Rezultatele la Evaluarea Națională și la Bacalaureat 2026, pe școală", url: "https://data.gov.ro/", detaliu: "media EN în Timiș 6,78, față de 6,69 în țară" },
      { institutie: "OpenStreetMap · OSRM", set: "Poziția școlilor și distanța pe jos", detaliu: "coordonatele oficiale din 2017 au erori la școlile rurale; circumscripțiile școlare din Timișoara nu sunt publice" }
    ],
    local: "Am găsit școlile și grădinițele din 2 km cu distanța reală pe jos și, unde se pot lega, rezultatele lor la Evaluarea Națională și la Bacalaureat.",
    baza: { mod: "local", dificultate: 3, nota: "Rețeaua și rezultatele sunt fișiere publice; legătura dintre ele și coordonatele corecte cer potrivire și geocodare, de verificat școală cu școală.", reimprospatare: "anual (iulie, după examene)" }
  },
  facilitati: {
    nationale: [
      { institutie: "CNAS · CAS Timiș", set: "Furnizorii de servicii medicale în contract (medici de familie, farmacii)", url: "https://cnas.ro/", detaliu: "liste fără adrese: în Timiș, 499 de medici de familie și 98 de farmacii" },
      { institutie: "Ministerul Sănătății · ANMCS", set: "Spitalele, paturile și acreditarea lor", detaliu: "7,49 paturi la 1.000 de locuitori în Timiș" },
      { institutie: "OpenStreetMap · OSRM", set: "Magazine, farmacii, clinici, parcuri, bănci, sport", url: "https://www.openstreetmap.org/", detaliu: "distanța reală pe jos, pe străzi" }
    ],
    local: "Am căutat cel mai apropiat loc din fiecare categorie și am calculat câte minute faci pe jos până la el, pe străzi.",
    baza: { mod: "mixt", dificultate: 2, nota: "Listele oficiale nu au adrese, deci poziția vine din OpenStreetMap, ținut în cache 7 zile; serverele publice Overpass refuză uneori cererile.", reimprospatare: "lunar" }
  },
  transport: {
    nationale: [
      { institutie: "Primăria Timișoara · STPT", set: "Stațiile de transport public", detaliu: "orarele complete (GTFS cu frecvențe) nu sunt publicate" },
      { institutie: "Ministerul Transporturilor", set: "Mersul trenurilor 2025–2026, toți operatorii", url: "https://data.gov.ro/", detaliu: "CFR Călători, Interregional și ceilalți operatori" },
      { institutie: "OpenStreetMap · OSRM", set: "Timpi cu mașina și pe jos", detaliu: "rutare pe rețeaua reală de drumuri, fără trafic" }
    ],
    local: "Am calculat timpii cu mașina și pe jos până la centru, gară, aeroport și spitalul județean, plus stațiile din apropiere.",
    baza: { mod: "mixt", dificultate: 3, nota: "Stațiile și trenurile sunt fișiere publice; frecvența autobuzelor și proiectele de infrastructură (centura, trenul metropolitan) încă lipsesc.", reimprospatare: "anual (mersul trenurilor, din decembrie)" }
  },
  urbanism: {
    nationale: [
      { institutie: "MDLPA", set: "Registrul documentațiilor de urbanism (PUG/PUZ) și datele GIS publicate", url: "https://datelocale.mdlpa.ro/", detaliu: "3.247 de documentații; în Timiș doar 3 din 100 au date GIS; Timișoara și Giroc fără date spațiale" },
      { institutie: "ANCPI", set: "Limitele unităților administrativ-teritoriale (serviciu ArcGIS, CC BY 4.0)", detaliu: "dă UAT-ul oficial pentru orice punct" },
      { institutie: "Primăriile", set: "PUG și PUZ aprobate prin HCL (PDF)", detaliu: "Timișoara nu are geoportal public cu UTR, POT și CUT; regulile exacte vin din certificatul de urbanism" }
    ],
    local: "Am găsit UAT-ul și stadiul PUG, PUZ-urile, AC-urile și CU-urile de pe strada proprietății și parcelele din planșele PUZ vectorizate de noi, aflate în apropiere.",
    baza: { mod: "mixt", dificultate: 2, nota: "PUZ-urile, AC-urile și CU-urile sunt colectate local, pe 12 comune; conturul parcelelor din cadastru nu se poate obține azi fără cont (geoportalul ANCPI e oprit).", reimprospatare: "săptămânal (colectarea AC/CU/PUZ)" }
  },
  costuri: {
    nationale: [
      { institutie: "Uniunea Națională a Notarilor Publici", set: "Grila notarială 2026, pe zone și străzi", detaliu: "Timișoara: teren intravilan 600–50 €/mp pe zonele 0–5; Giroc 140–30 €/mp pe zonele A–D; sursa PDF de reconfirmat" },
      { institutie: "Consiliile locale", set: "Hotărârile privind impozitele și taxele locale 2026", detaliu: "Timișoara HCL 719/2025 și 259/2025; Giroc HCL 334/2025" },
      { institutie: "ANCPI · INS", set: "Statistici de tranzacții (pe județ, până în ian. 2024) și indicele prețurilor locuințelor (național)", detaliu: "nu există prețuri tranzacționate publice pe UAT sau pe stradă" }
    ],
    local: "Am calculat onorariul notarial, intabularea, impozitul pe transfer și impozitul local anual pentru un preț de exemplu, cu temeiul legal al fiecărei sume.",
    baza: { mod: "local", dificultate: 3, nota: "Grila și HCL-urile sunt PDF-uri descărcate local, unele scanate (fără OCR pe Mac); se citesc o dată pe an.", reimprospatare: "anual (grila și HCL-urile se schimbă în decembrie–ianuarie)" }
  },
  inundatii: {
    nationale: [
      { institutie: "Administrația Națională Apele Române (ANAR)", set: "Hărți de hazard la inundații, ciclul I și ciclul II (Directiva 2007/60/CE)", url: "https://gis.rowater.ro/portal/apps/experiencebuilder/experience/?id=1a50f514f25b441086b01664e1044452", detaliu: "scenarii o dată la 10, 100 și 500–1000 de ani; serviciu ArcGIS interogabil pe punct" },
      { institutie: "ANAR", set: "Hidrografie: râuri și lacuri din cadastrul apelor", url: "https://gis.rowater.ro/server/rest/services/Hidrografie/Hidrografie/MapServer" },
      { institutie: "INHGA · MMAP", set: "Planurile de management al riscului la inundații (PMRI), ciclul II", url: "http://www.inhga.ro/planurile-de-management-al-riscului-la-inundatii/", detaliu: "hărțile de risc (nu doar de hazard) sunt publice doar ca vizualizator" }
    ],
    local: "Am căutat cel mai apropiat curs de apă din cadastrul apelor și distanța până la fiecare scenariu de inundație, în praguri de la 25 m la 5 km, apoi am desenat zona și regiunea peste satelit.",
    baza: { mod: "mixt", dificultate: 3, nota: "Hărțile de hazard pentru Banat sunt descărcate local ca rezervă; interogarea curentă merge pe serviciul ANAR, care e lent la nivel regional (aprox. 2 minute).", reimprospatare: "la revizuirea hărților (ciclul II, o dată la aprox. 6 ani)" }
  },
  seismic: {
    nationale: [
      { institutie: "MDLPA", set: "Codul de proiectare seismică P100-1/2013, Tabelul A1 (ag, Tc), modificat prin Ordinul 2956/2019", detaliu: "valori pentru 337 de localități urbane; comunele iau valoarea celei mai apropiate localități din tabel" },
      { institutie: "Institutul Național pentru Fizica Pământului (INFP)", set: "Catalogul cutremurelor ROMPLUS", url: "https://www.infp.ro/data/romplus.txt", detaliu: "38.259 de cutremure, 1962–2026, descărcabil integral" },
      { institutie: "EFEHR · ETH Zürich", set: "Modelul european de hazard seismic ESHM20", url: "https://hazard.efehr.org/", detaliu: "API pe punct; valorile nu se compară direct cu ag din P100" }
    ],
    local: "Am luat ag și Tc pentru localitate din P100, cutremurele reale din jur din ROMPLUS și blocurile din cartier care pot intra sub Legea 212/2022.",
    baza: { mod: "local", dificultate: 1, nota: "Tabelul P100 și catalogul ROMPLUS sunt fișiere publice, ținute local; ESHM20 se cere pe loc.", reimprospatare: "ROMPLUS lunar; P100 la revizuirea codului" }
  },
  zonare: {
    nationale: [
      { institutie: "ANCOM", set: "Harta rețelelor de foarte mare capacitate (VHCN)", url: "https://vhcn.ancom.ro/", detaliu: "fibră, cablu și viteze ≥1 Gbps pe 13.195 de localități; date din mai 2023" },
      { institutie: "ANRE", set: "Licențele de distribuție a gazelor naturale, pe localitate", url: "https://portal.anre.ro/PublicLists/LicenteAutorizatiiGN", detaliu: "cine distribuie gazul și până când e valabilă licența" },
      { institutie: "OpenStreetMap", set: "Clădiri, zone și drumuri în 500 m", url: "https://www.openstreetmap.org/", detaliu: "zonarea reglementată vine din PUG/PUZ (capitolul Urbanism)" }
    ],
    local: "Am măsurat compoziția cartierului din clădirile și zonele OpenStreetMap din 500 m și am atașat operatorii de utilități ai localității.",
    baza: { mod: "mixt", dificultate: 2, nota: "Acoperirea ANCOM e un singur fișier de 11 MB; apa-canal (Aquatim) și curentul nu publică hărți de rețea, deci rămân necunoscute la nivel de stradă.", reimprospatare: "ANCOM anual; ANRE lunar" }
  },
  insorire: {
    nationale: [
      { institutie: "Calcul astronomic", set: "Poziția soarelui (algoritmul SunCalc, bazat pe formulele astronomice standard)", detaliu: "exact pentru orice punct și oră; nu depinde de vreo bază de date" },
      { institutie: "Esri · Vantor (Maxar)", set: "Imagine satelit World Imagery", url: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9", detaliu: "data imaginii se citește din metadatele Esri pentru fiecare punct" }
    ],
    local: "Am calculat traseul soarelui pe cer pentru ziua de 21 a fiecărei luni și umbra unei case de referință de 8 m, peste imaginea satelit a proprietății.",
    baza: { mod: "local", dificultate: 1, nota: "Calculul se face în pagină; doar imaginea satelit se descarcă o dată pentru fiecare proprietate.", reimprospatare: "nu e nevoie" }
  },
  pv: {
    nationale: [
      { institutie: "Banca Mondială · Solargis", set: "Global Solar Atlas", url: "https://globalsolaratlas.info/", detaliu: "producția fotovoltaică pe an și pe lună, la înclinarea optimă; licență CC BY 4.0" },
      { institutie: "Comisia Europeană · JRC", set: "PVGIS (sistemul fotovoltaic geografic al UE)", url: "https://re.jrc.ec.europa.eu/pvg_tools/en/", detaliu: "API oficial, cu orizontul real; pentru pin dă 1.254 kWh/kWp/an la 37°, cu 3,7% sub Global Solar Atlas" }
    ],
    local: "Am cerut pentru coordonatele proprietății producția medie pe termen lung a unui sistem orientat spre sud și am calculat-o pentru 3, 5 și 10 kWp.",
    baza: { mod: "sursa", dificultate: 1, nota: "Se cere pe loc pentru fiecare proprietate (un singur apel); răspunsul se păstrează în Drive.", reimprospatare: "la noile versiuni ale atlasului (anual)" }
  },
  monumente: {
    nationale: [
      { institutie: "Ministerul Culturii · INP · cIMeC", set: "Repertoriul Arheologic Național (RAN)", url: "https://ran.cimec.ro/", detaliu: "29.154 de situri ca puncte și 16.695 de contururi de sit, din serviciul GIS al hărții map.cimec.ro" },
      { institutie: "cIMeC", set: "Cronica cercetărilor arheologice din România", url: "https://cronica.cimec.ro/", detaliu: "5.716 campanii de săpătură, cu anul și punctul" },
      { institutie: "Ministerul Culturii · INP", set: "Lista Monumentelor Istorice 2015 (LMI)", url: "https://www.cultura.ro/lista-monumentelor-istorice/", detaliu: "PDF oficial pe județ, fără coordonate; harta oficială INP e nefuncțională azi. Coordonatele vin din baza Wiki Loves Monuments: 30.201 monumente, 7.551 localizate" }
    ],
    local: "Am verificat dacă punctul cade în conturul unui sit RAN, apoi am măsurat distanța și direcția până la fiecare sit, monument, săpătură și lăcaș de cult din 5 km și am comparat densitatea siturilor cu media țării.",
    baza: { mod: "local", dificultate: 2, nota: "Toate straturile naționale sunt descărcate integral (aprox. 55 MB): calculul nu mai depinde de serverul cIMeC. LMI are coordonate doar pentru un sfert din monumente.", reimprospatare: "lunar (RAN și Cronica se completează des)" }
  }
};
