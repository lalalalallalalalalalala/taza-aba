/* Таза Аба — «Схема» в стиле iOS/Apple Maps (v44-ios). Собственный векторный стиль на открытых данных:
 * MapLibre GL (CSP-сборка, vendor/maplibre) рисует тайлы OpenFreeMap (OpenMapTiles, © OSM) под картами Leaflet
 * через maplibre-gl-leaflet (vendor/maplibre-gl-leaflet). Все оверлеи Leaflet («Дымка», трафик, эко-маршруты, маркеры) — поверх.
 * Ленивая загрузка: библиотека грузится только когда карта впервые показывает «Схему».
 * Фолбэк: нет WebGL2 / ошибка / нет загрузки за 10 с → прежние растровые тайлы (msBaseTile / OSM).
 * ?iosmap=0 — выключить (запоминается), ?iosmap=1 — включить снова. */
(function () {
  const KEY = "tazaAba.iosmap";
  try { const q = new URL(location.href).searchParams.get("iosmap"); if (q === "0" || q === "1") localStorage.setItem(KEY, q); } catch (e) {}
  const gl2 = (() => { try { const c = document.createElement("canvas"); return !!(window.WebGL2RenderingContext && c.getContext("webgl2")); } catch (e) { return false; } })();
  const off = (() => { try { return localStorage.getItem(KEY) === "0"; } catch (e) { return false; } })();
  window.IOS_MAP = gl2 && !off && !!window.L;
  if (!window.L) return;

  /* ---------- ленивая загрузка библиотек (общая с eco3d, если он уже загрузил maplibregl) ---------- */
  let libP = null;
  const addScript = src => new Promise((ok, no) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
  const lib = () => libP || (libP = (async () => {
    if (!document.querySelector('link[href="vendor/maplibre/maplibre-gl.css"]')) { const c = document.createElement("link"); c.rel = "stylesheet"; c.href = "vendor/maplibre/maplibre-gl.css"; document.head.appendChild(c); }
    if (!window.maplibregl) { await addScript("vendor/maplibre/maplibre-gl-csp.js"); }
    try { maplibregl.setWorkerUrl("vendor/maplibre/maplibre-gl-csp-worker.js"); } catch (e) {}
    if (!L.maplibreGL) await addScript("vendor/maplibre-gl-leaflet/leaflet-maplibre-gl.js");
    if (!L.maplibreGL) throw new Error("binding");
  })().catch(e => { libP = null; throw e; }));
  window.iosMapLib = lib;

  /* ---------- палитры ---------- */
  const PAL = {
    light: { bg: "#f4f1ea", resid: "#efebe3", indus: "#ece8e4", edu: "#f3ece0", hosp: "#f6e6e4", sand: "#f1ead9",
      park: "#cfe7c2", parkEdge: "#b6d9a6", grass: "#dcecd0", wood: "#c7e1b8", farm: "#eef0e0", ice: "#ffffff",
      water: "#a6d2f2", waterEdge: "#86bde6", waterLine: "#9ccbee",
      bld2: "#e5dfd5", bldLine: "#d5cdbf", bldLo: "#ece6dc", bldMid: "#e2dace", bldHi: "#d3cbc0",
      shadow: "rgba(70,55,30,0.16)", minor: "#ffffff", minorCase: "#ddd6ca", major: "#ffffff", majorCase: "#d3cab9",
      trunk: "#ffd66e", trunkCase: "#e3a63f", trunkHi: "#fff0bf", mway: "#ffc95a", mwayCase: "#dc943a",
      mark: "#e0c88a", markMw: "#fffaf0", path: "#c6baa5", rail: "#b4ada3", tunnel: "#f6f2ea",
      label: "#3e3a33", labelMinor: "#6e665a", halo: "rgba(255,255,255,0.92)", place: "#2b2924", water_t: "#4a86b8",
      poiPark: "#3d8a3a", poiHosp: "#c8473f", poiEdu: "#8c6a3a", poiOther: "#6c6f78", boundary: "#b9a9c7" },
    dark: { bg: "#1b211e", resid: "#1f2622", indus: "#212624", edu: "#232823", hosp: "#2a2324", sand: "#262620",
      park: "#203a2a", parkEdge: "#28503a", grass: "#1f3328", wood: "#1d3626", farm: "#1e2520", ice: "#2a3034",
      water: "#14293a", waterEdge: "#1d3a52", waterLine: "#1b3b55",
      bld2: "#2d3530", bldLine: "#3b4540", bldLo: "#343d38", bldMid: "#3b4540", bldHi: "#46514b",
      shadow: "rgba(0,0,0,0.45)", minor: "#3b4440", minorCase: "#232a26", major: "#525d56", majorCase: "#272e2a",
      trunk: "#8a6c34", trunkCase: "#5e4a25", trunkHi: "#b08d4c", mway: "#9a733a", mwayCase: "#664c22",
      mark: "#5f6a63", markMw: "#c9a868", path: "#4a534d", rail: "#4c544f", tunnel: "#2b322e",
      label: "#d5ddd8", labelMinor: "#9aa69f", halo: "rgba(20,26,23,0.9)", place: "#e8eee9", water_t: "#6fa5d1",
      poiPark: "#7cc08a", poiHosp: "#e48a82", poiEdu: "#c9a774", poiOther: "#9aa3a0", boundary: "#6b5a7d" } };

  const nameExpr = lang => lang === "ru" ? ["coalesce", ["get", "name:ru"], ["get", "name"]]
    : lang === "ky" ? ["coalesce", ["get", "name:ky"], ["get", "name"], ["get", "name:ru"]]
    : ["coalesce", ["get", "name:en"], ["get", "name_en"], ["get", "name_int"], ["get", "name"]];
  const W = (pairs) => ["interpolate", ["exponential", 1.5], ["zoom"], ...pairs.flat()];
  const F = { R: ["Noto Sans Regular"], B: ["Noto Sans Bold"], I: ["Noto Sans Italic"] };

  /* ширины по классам (px при z) */
  const WD = {
    mway: [[5, 0.8], [10, 2.6], [13, 5.5], [16, 15], [18, 38]],
    trunk: [[5, 0.6], [10, 2.2], [13, 4.8], [16, 14], [18, 34]],
    major: [[8, 0.6], [11, 1.7], [13, 3.8], [16, 12], [18, 30]],
    sec: [[9, 0.5], [12, 1.4], [14, 3.4], [16, 9.5], [18, 24]],
    minor: [[12, 0.4], [14, 1.6], [16, 5.5], [18, 16]],
    svc: [[13, 0.3], [15, 1.2], [17, 3.5], [18, 7]] };
  const casingOf = w => w.map(([z, v]) => [z, v * 1.28 + (z >= 14 ? 1.2 : 0.4)]);
  const shadowOf = w => w.map(([z, v]) => [z, v * 1.6 + (z >= 14 ? 3 : 1)]);

  function buildStyle(o) {
    const P = PAL[o.dark ? "dark" : "light"], N = nameExpr(o.lang || "ru"), mut = !!o.muted, lowend = !!o.lowend;
    const trunkC = mut ? (o.dark ? "#4d5650" : "#fbf3df") : P.trunk, trunkCase = mut ? (o.dark ? "#2e3531" : "#e2d6bd") : P.trunkCase;
    const mwayC = mut ? (o.dark ? "#56605a" : "#f8edd2") : P.mway, mwayCase = mut ? (o.dark ? "#323a35" : "#dccdb0") : P.mwayCase;
    const S = "omt", L = [];
    const cls = (...c) => ["match", ["get", "class"], c, true, false];
    const notBr = ["!", ["match", ["get", "brunnel"], ["bridge", "tunnel"], true, false]];
    const br = b => ["==", ["get", "brunnel"], b];
    const add = l => { L.push(l); return l; };

    /* --- земля --- */
    add({ id: "bg", type: "background", paint: { "background-color": P.bg } });
    add({ id: "lc-farm", type: "fill", source: S, "source-layer": "landcover", filter: cls("farmland"), paint: { "fill-color": P.farm, "fill-opacity": 0.6 } });
    add({ id: "lu-resid", type: "fill", source: S, "source-layer": "landuse", filter: cls("residential", "suburb", "neighbourhood"), maxzoom: 16,
      paint: { "fill-color": P.resid, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0.9, 16, 0.3] } });
    add({ id: "lu-indus", type: "fill", source: S, "source-layer": "landuse", filter: cls("industrial", "commercial", "retail", "railway", "garages"), paint: { "fill-color": P.indus } });
    add({ id: "lu-edu", type: "fill", source: S, "source-layer": "landuse", filter: cls("school", "university", "college", "kindergarten"), paint: { "fill-color": P.edu } });
    add({ id: "lu-hosp", type: "fill", source: S, "source-layer": "landuse", filter: cls("hospital"), paint: { "fill-color": P.hosp } });
    add({ id: "lc-sand", type: "fill", source: S, "source-layer": "landcover", filter: cls("sand"), paint: { "fill-color": P.sand } });
    add({ id: "lc-ice", type: "fill", source: S, "source-layer": "landcover", filter: cls("ice"), paint: { "fill-color": P.ice, "fill-opacity": 0.8 } });
    add({ id: "lc-grass", type: "fill", source: S, "source-layer": "landcover", filter: cls("grass"), paint: { "fill-color": P.grass, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.5, 14, 0.9] } });
    add({ id: "lc-wood", type: "fill", source: S, "source-layer": "landcover", filter: cls("wood", "forest"), paint: { "fill-color": P.wood, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0.5, 13, 0.95] } });
    add({ id: "lu-green", type: "fill", source: S, "source-layer": "landuse", filter: cls("cemetery", "pitch", "playground", "stadium", "park", "garden"), paint: { "fill-color": P.grass } });
    /* парки: заливка + мягкая «внутренняя» кромка (размытая линия) — эффект градиента/текстуры как в iOS */
    add({ id: "park", type: "fill", source: S, "source-layer": "park", paint: { "fill-color": P.park, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 8, 0.6, 13, 1] } });
    add({ id: "park-glow", type: "line", source: S, "source-layer": "park", minzoom: 12,
      paint: { "line-color": P.parkEdge, "line-width": ["interpolate", ["linear"], ["zoom"], 12, 2, 17, 10], "line-blur": ["interpolate", ["linear"], ["zoom"], 12, 2, 17, 9], "line-offset": ["interpolate", ["linear"], ["zoom"], 12, 1, 17, 5], "line-opacity": 0.55 } });
    /* вода: заливка + мягкая тёмная кромка внутрь + тонкий контур */
    add({ id: "waterway", type: "line", source: S, "source-layer": "waterway", filter: ["!=", ["get", "brunnel"], "tunnel"],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: { "line-color": P.waterLine, "line-width": ["interpolate", ["exponential", 1.4], ["zoom"], 8, ["match", ["get", "class"], "river", 1.2, 0.3], 14, ["match", ["get", "class"], "river", 4, 1.5], 18, ["match", ["get", "class"], "river", 14, 5]] } });
    add({ id: "water", type: "fill", source: S, "source-layer": "water", filter: ["!=", ["get", "brunnel"], "tunnel"], paint: { "fill-color": P.water, "fill-antialias": true } });
    add({ id: "water-edge", type: "line", source: S, "source-layer": "water", minzoom: 10, filter: ["!=", ["get", "brunnel"], "tunnel"],
      paint: { "line-color": P.waterEdge, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 1.5, 17, 7], "line-blur": ["interpolate", ["linear"], ["zoom"], 10, 1.5, 17, 6], "line-offset": ["interpolate", ["linear"], ["zoom"], 10, 0.8, 17, 3.5], "line-opacity": 0.45 } });
    add({ id: "aeroway", type: "fill", source: S, "source-layer": "aeroway", filter: ["==", ["geometry-type"], "Polygon"], paint: { "fill-color": P.indus } });
    add({ id: "runway", type: "line", source: S, "source-layer": "aeroway", minzoom: 10, filter: cls("runway", "taxiway"), paint: { "line-color": P.major, "line-width": W([[10, 1], [14, 8], [18, 50]]) } });

    /* --- дороги --- */
    const RD = [  // [ключ, фильтр-класс, ширина, заливка, кайма, minzoom]
      ["svc", cls("service", "track"), WD.svc, P.minor, P.minorCase, 14],
      ["minor", cls("minor"), WD.minor, P.minor, P.minorCase, 12],
      ["sec", cls("secondary", "tertiary"), WD.sec, P.major, P.majorCase, 9],
      ["major", cls("primary"), WD.major, P.major, P.majorCase, 7],
      ["trunk", cls("trunk"), WD.trunk, trunkC, trunkCase, 5],
      ["mway", cls("motorway"), WD.mway, mwayC, mwayCase, 4]];
    const lj = { "line-join": "round", "line-cap": "round" };
    const roadSet = (pfx, brF, extra = {}) => {
      /* тень (мягкая, чуть вниз) → кайма → заливка; порядок: от мелких к крупным для правильных пересечений */
      if (pfx !== "tun") RD.forEach(([k, f, w, , , mz]) => add({ id: `${pfx}-${k}-shadow`, type: "line", source: S, "source-layer": "transportation", minzoom: Math.max(mz, pfx === "br" ? 12 : 13), filter: ["all", f, brF],
        layout: lj, paint: { "line-color": P.shadow, "line-width": W(shadowOf(w)), "line-blur": W(w.map(([z, v]) => [z, v * 0.5 + 1.5])), "line-translate": [0, pfx === "br" ? 2.5 : 1.2], "line-opacity": pfx === "br" ? 1 : 0.55 } }));
      RD.forEach(([k, f, w, , cs, mz]) => add({ id: `${pfx}-${k}-case`, type: "line", source: S, "source-layer": "transportation", minzoom: mz, filter: ["all", f, brF],
        layout: lj, paint: Object.assign({ "line-color": cs, "line-width": W(casingOf(w)), "line-opacity": ["interpolate", ["linear"], ["zoom"], mz, 0, mz + 1, 1] }, pfx === "tun" ? { "line-dasharray": [0.6, 0.4] } : {}) }));
      RD.forEach(([k, f, w, fc, , mz]) => add({ id: `${pfx}-${k}`, type: "line", source: S, "source-layer": "transportation", minzoom: mz, filter: ["all", f, brF],
        layout: lj, paint: { "line-color": pfx === "tun" ? (k === "trunk" || k === "mway" ? (o.dark ? "#4d4230" : "#fbe9bf") : P.tunnel) : fc, "line-width": W(w), "line-opacity": ["interpolate", ["linear"], ["zoom"], mz, 0, mz + 1, pfx === "tun" ? 0.8 : 1] } }));
      if (pfx === "tun") return;
      /* центральный блик на магистралях — «дорогая» объёмность */
      [["trunk", cls("trunk"), WD.trunk], ["mway", cls("motorway"), WD.mway]].forEach(([k, f, w]) => add({ id: `${pfx}-${k}-hi`, type: "line", source: S, "source-layer": "transportation", minzoom: 11, filter: ["all", f, brF],
        layout: lj, paint: { "line-color": mut ? (o.dark ? "#5e6862" : "#fffaf0") : P.trunkHi, "line-width": W(w.map(([z, v]) => [z, v * 0.32])), "line-blur": W(w.map(([z, v]) => [z, v * 0.18])), "line-opacity": 0.75 } }));
      /* разметка z ≥ 16: осевая (пунктир) на основных, полосы на магистралях */
      add({ id: `${pfx}-mark`, type: "line", source: S, "source-layer": "transportation", minzoom: 16, filter: ["all", cls("primary", "secondary", "trunk", "motorway"), brF],
        layout: { "line-join": "round", "line-cap": "butt" },
        paint: { "line-color": ["match", ["get", "class"], ["trunk", "motorway"], mut ? P.mark : P.markMw, P.mark], "line-width": ["interpolate", ["linear"], ["zoom"], 16, 1.1, 18, 2],
          "line-dasharray": ["literal", [6, 6]], "line-opacity": ["interpolate", ["linear"], ["zoom"], 16, 0, 16.6, 0.9] } });
      add({ id: `${pfx}-lanes`, type: "line", source: S, "source-layer": "transportation", minzoom: 17, filter: ["all", cls("trunk", "motorway", "primary"), brF],
        layout: { "line-join": "round", "line-cap": "butt" },
        paint: { "line-color": ["match", ["get", "class"], ["trunk", "motorway"], mut ? P.mark : P.markMw, P.mark], "line-width": 0.7, "line-gap-width": W(WD.major.map(([z, v]) => [z, v * 0.42])), "line-dasharray": ["literal", [4, 8]], "line-opacity": 0.6 } });
    };
    /* тоннели (пунктирная кайма, светлая заливка) */
    roadSet("tun", br("tunnel"));
    /* тропинки — точечный пунктир */
    add({ id: "path", type: "line", source: S, "source-layer": "transportation", minzoom: 15, filter: ["all", cls("path"), ["!=", ["get", "brunnel"], "tunnel"]],
      layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": P.path, "line-width": ["interpolate", ["linear"], ["zoom"], 15, 1, 18, 2.2], "line-dasharray": ["literal", [0.1, 2.4]], "line-opacity": ["interpolate", ["linear"], ["zoom"], 15, 0, 16, 0.55] } });
    roadSet("rd", notBr);
    /* ж/д: линия + «шпалы» */
    add({ id: "rail", type: "line", source: S, "source-layer": "transportation", minzoom: 10, filter: cls("rail", "transit"),
      paint: { "line-color": P.rail, "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.6, 16, 1.6, 18, 2.4] } });
    add({ id: "rail-ties", type: "line", source: S, "source-layer": "transportation", minzoom: 13, filter: cls("rail", "transit"),
      paint: { "line-color": P.rail, "line-width": ["interpolate", ["linear"], ["zoom"], 13, 3, 16, 6, 18, 9], "line-dasharray": ["literal", [0.15, 2.4]] } });
    /* мосты — с тенью */
    roadSet("br", br("bridge"));

    /* --- здания: 2D контуры z13–15 → 3D с z15 --- */
    add({ id: "bld-2d", type: "fill", source: S, "source-layer": "building", minzoom: 13,
      paint: { "fill-color": P.bld2, "fill-outline-color": P.bldLine, "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 13.6, 1, lowend ? 20 : 15.4, 1, lowend ? 21 : 16, lowend ? 1 : 0.15] } });
    add({ id: "bld-line", type: "line", source: S, "source-layer": "building", minzoom: 14,
      paint: { "line-color": P.bldLine, "line-width": ["interpolate", ["linear"], ["zoom"], 14, 0.4, 16, 0.8], "line-opacity": ["interpolate", ["linear"], ["zoom"], 14, 0, 14.5, 0.9, lowend ? 20 : 15.6, 0.9, lowend ? 21 : 16.2, 0] } });
    if (!lowend) add({ id: "bld-3d", type: "fill-extrusion", source: S, "source-layer": "building", minzoom: 14.6, filter: ["!=", ["get", "hide_3d"], true],
      paint: { "fill-extrusion-color": ["interpolate", ["linear"], ["coalesce", ["get", "render_height"], 6], 0, P.bldLo, 12, P.bldLo, 30, P.bldMid, 80, P.bldHi],
        "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 14.6, 0, 15.6, ["coalesce", ["get", "render_height"], 6]],
        "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
        "fill-extrusion-opacity": ["interpolate", ["linear"], ["zoom"], 14.6, 0, 15.4, 0.94],
        "fill-extrusion-vertical-gradient": true } });

    /* --- границы --- */
    add({ id: "boundary", type: "line", source: S, "source-layer": "boundary", filter: ["all", ["<=", ["get", "admin_level"], 4], ["!=", ["get", "maritime"], 1]],
      paint: { "line-color": P.boundary, "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.6, 10, 1.6], "line-dasharray": ["literal", [3, 2]], "line-opacity": 0.7 } });

    /* --- подписи --- */
    const halo = { "text-halo-color": P.halo, "text-halo-width": 1.4, "text-halo-blur": 0.4 };
    add({ id: "lbl-water", type: "symbol", source: S, "source-layer": "water_name", filter: ["!=", ["geometry-type"], "LineString"], layout: { "text-field": N, "text-font": F.I, "text-size": 12 }, paint: Object.assign({ "text-color": P.water_t }, halo) });
    add({ id: "lbl-water-ln", type: "symbol", source: S, "source-layer": "water_name", filter: ["==", ["geometry-type"], "LineString"], layout: { "text-field": N, "text-font": F.I, "text-size": 12, "symbol-placement": "line" }, paint: Object.assign({ "text-color": P.water_t }, halo) });
    add({ id: "lbl-waterway", type: "symbol", source: S, "source-layer": "waterway", minzoom: 13, filter: cls("river", "canal"), layout: { "text-field": N, "text-font": F.I, "text-size": 11, "symbol-placement": "line", "symbol-spacing": 400 }, paint: Object.assign({ "text-color": P.water_t }, halo) });
    add({ id: "lbl-road-minor", type: "symbol", source: S, "source-layer": "transportation_name", minzoom: 15, filter: cls("minor", "service"),
      layout: { "text-field": N, "text-font": F.R, "text-size": ["interpolate", ["linear"], ["zoom"], 15, 10, 18, 12.5], "symbol-placement": "line", "text-max-angle": 30, "symbol-spacing": 350 }, paint: Object.assign({ "text-color": P.labelMinor }, halo) });
    add({ id: "lbl-road-major", type: "symbol", source: S, "source-layer": "transportation_name", minzoom: 12, filter: cls("primary", "secondary", "tertiary", "trunk", "motorway"),
      layout: { "text-field": N, "text-font": F.R, "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 16, 12.5, 18, 14], "symbol-placement": "line", "text-max-angle": 30, "symbol-spacing": 300, "text-letter-spacing": 0.02 },
      paint: Object.assign({ "text-color": P.label }, halo) });
    /* POI — минимально: только парки, больницы, вузы/школы, крупные достопримечательности; точка + подпись */
    const poiF = ["all", ["match", ["get", "class"], ["park", "hospital", "college", "school", "stadium", "attraction", "museum", "theatre", "place_of_worship", "town_hall"], true, false], ["<=", ["coalesce", ["get", "rank"], 99], 12]];
    const poiC = ["match", ["get", "class"], ["park"], P.poiPark, ["hospital"], P.poiHosp, ["college", "school"], P.poiEdu, P.poiOther];
    add({ id: "poi-dot", type: "circle", source: S, "source-layer": "poi", minzoom: 15, filter: poiF,
      paint: { "circle-radius": ["interpolate", ["linear"], ["zoom"], 15, 3, 18, 5], "circle-color": poiC, "circle-stroke-color": o.dark ? "#1b211e" : "#ffffff", "circle-stroke-width": 1.5, "circle-opacity": 0.95 } });
    add({ id: "poi-lbl", type: "symbol", source: S, "source-layer": "poi", minzoom: 15, filter: poiF,
      layout: { "text-field": N, "text-font": F.R, "text-size": 11, "text-anchor": "left", "text-offset": [0.7, 0], "text-max-width": 9, "text-optional": false },
      paint: Object.assign({ "text-color": poiC }, halo) });
    add({ id: "lbl-place-minor", type: "symbol", source: S, "source-layer": "place", minzoom: 11, filter: cls("suburb", "neighbourhood", "quarter", "hamlet", "village"),
      layout: { "text-field": N, "text-font": F.R, "text-size": ["interpolate", ["linear"], ["zoom"], 11, 10.5, 15, 13], "text-transform": "uppercase", "text-letter-spacing": 0.08, "text-max-width": 8 },
      paint: Object.assign({ "text-color": P.labelMinor }, halo) });
    add({ id: "lbl-town", type: "symbol", source: S, "source-layer": "place", minzoom: 6, maxzoom: 15, filter: cls("town"),
      layout: { "text-field": N, "text-font": F.B, "text-size": ["interpolate", ["linear"], ["zoom"], 6, 11, 12, 15] }, paint: Object.assign({ "text-color": P.place }, halo) });
    add({ id: "lbl-city", type: "symbol", source: S, "source-layer": "place", minzoom: 3, maxzoom: 14, filter: cls("city"),
      layout: { "text-field": N, "text-font": F.B, "text-size": ["interpolate", ["linear"], ["zoom"], 4, 12, 10, 18] }, paint: Object.assign({ "text-color": P.place }, halo) });
    add({ id: "lbl-country", type: "symbol", source: S, "source-layer": "place", maxzoom: 7, filter: cls("country"),
      layout: { "text-field": N, "text-font": F.B, "text-size": 13, "text-transform": "uppercase", "text-letter-spacing": 0.15 }, paint: Object.assign({ "text-color": P.labelMinor }, halo) });

    let layers = L;
    if (o.only === "hybrid") { /* гибрид: прозрачный оверлей поверх спутника — тонкие дороги + подписи с тёмным ореолом */
      const keep = l => l.type === "symbol" || l.id === "poi-dot" || l.id === "boundary" || l.id === "rail"
        || (/^(rd|br)-(svc|minor|sec|major|trunk|mway)(-hi)?$/.test(l.id));
      layers = L.filter(keep).map(l => { const x = JSON.parse(JSON.stringify(l)), p = x.paint || (x.paint = {});
        if (x.type === "line" && /^(rd|br)-/.test(x.id)) { const hw = /trunk|mway/.test(x.id);
          p["line-color"] = /-hi$/.test(x.id) ? "#fff6d8" : hw ? "#ffcf66" : "#ffffff";
          p["line-opacity"] = /-hi$/.test(x.id) ? 0.35 : hw ? 0.75 : ["interpolate", ["linear"], ["zoom"], 12, 0.25, 16, 0.45];
          p["line-width"] = ["interpolate", ["exponential", 1.5], ["zoom"], ...(p["line-width"].slice(3).map((v, i) => i % 2 ? v * 0.42 : v))]; }
        if (x.type === "symbol") { p["text-color"] = /^lbl-water/.test(x.id) ? "#cfe8ff" : "#ffffff"; p["text-halo-color"] = "rgba(10,14,12,0.78)"; p["text-halo-width"] = 1.5; }
        if (x.id === "poi-dot") p["circle-stroke-color"] = "rgba(10,14,12,0.7)";
        if (x.id === "boundary") p["line-color"] = "#f0e6ff";
        return x; });
      layers = [{ id: "bg0", type: "background", paint: { "background-color": "rgba(0,0,0,0)" } }, ...layers];
    }
    else if (o.only === "labels") layers = L.filter(l => l.type === "symbol" || l.id === "poi-dot");
    else if (o.only === "base") layers = L.filter(l => l.type !== "symbol" && l.id !== "poi-dot");
    if (o.only === "labels") layers = [{ id: "bg0", type: "background", paint: { "background-color": "rgba(0,0,0,0)" } }, ...layers];
    return { version: 8, name: "Taza Aba iOS " + (o.dark ? "night" : "day"),
      sources: { omt: { type: "vector", url: "https://tiles.openfreemap.org/planet", attribution: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>' } },
      glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
      light: { anchor: "map", color: "#ffffff", intensity: o.dark ? 0.22 : 0.3, position: [1.4, 210, 35] },
      layers };
  }
  window.iosMapStyle = buildStyle;

  const ATTR = '&copy; <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
  const isDark = () => document.documentElement.dataset.theme === "dark";
  const lang = () => (typeof LANG !== "undefined" ? LANG : "ru");
  const lowEnd = () => document.documentElement.classList.contains("lowend");

  /* Слой-обёртка для Leaflet: GL-подложка + фолбэк на растровый слой */
  const IosLayer = L.Layer.extend({
    options: { maxZoom: 19, minZoom: 2, only: null, pane: "tilePane", fallback: null },
    initialize(o) { L.setOptions(this, o); },
    getAttribution() { return this._fb || this.options.only === "labels" || this.options.only === "hybrid" ? null : ATTR; },
    onAdd(m) {
      this._m = m; this._dead = false; const c = m.getContainer();
      if (!this.options.only || this.options.only === "base") { c.classList.add("ios-vec"); c.classList.toggle("ios-dark", isDark()); }
      if (!window.IOS_MAP) return this._fallback("nogl");
      this._t = setTimeout(() => { if (!this._ok) this._fallback("timeout"); }, 10000);
      lib().then(() => { if (this._dead) return; this._mk(); }).catch(() => this._fallback("lib"));
    },
    _mk() {
      const m = this._m, o = this.options;
      const muted = !!(m.getContainer().id === "tfMap" || m.getContainer().closest(".tf-wrap, .tfs-e"));
      const split = o.only === "base" || (!o.only && m._iosSplit);
      try {
        this._gl = L.maplibreGL({ style: buildStyle({ dark: isDark(), lang: lang(), muted, lowend: lowEnd(), only: o.only || (split ? "base" : null) }),
          pane: o.pane, padding: 0.15, interactive: false, attributionControl: false, fadeDuration: 180, className: "tl-vec" + (o.only === "labels" ? " tl-vec-lbl" : ""),
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2), maxTileCacheSize: 120, refreshExpiredTiles: false, cancelPendingTileRequestsWhileZooming: true });
        this._gl.addTo(m); this._gl.getContainer().style.zIndex = o.only === "hybrid" ? 5 : 0; /* гибрид — поверх растрового спутника (z-index 1) */
        const g = this._gl.getMaplibreMap();
        g.once("load", () => { this._ok = true; clearTimeout(this._t); m.attributionControl && m.attributionControl.addAttribution(""); m.getContainer().classList.add("ios-ready"); m.fire("iosmapload"); });
        g.on("error", e => { if (!this._ok && e && e.error && !/tile|Tile|pbf/.test(String(e.error.message || ""))) this._fallback("style"); });
        g.on("webglcontextlost", () => this._fallback("ctx"));
      } catch (e) { this._fallback("init"); }
    },
    _fallback(why) {
      if (this._fb || this._dead) return; clearTimeout(this._t);
      try { if (this._gl && this._m) this._m.removeLayer(this._gl); } catch (e) {}
      this._gl = null; const m = this._m; m.getContainer().classList.remove("ios-vec", "ios-ready");
      const mk = this.options.fallback; this._fb = mk ? mk() : null;
      if (this._fb) { if (this.options.pane !== "tilePane" && this._fb.options) this._fb.options.pane = this.options.pane; this._fb.addTo(m); }
      if (m.attributionControl) { m.attributionControl.removeAttribution(ATTR); }
      if (window.console && why !== "nogl") console.info("[iosmap] fallback:", why);
      m.fire("iosmapfallback", { why });
    },
    onRemove(m) {
      this._dead = true; clearTimeout(this._t);
      try { if (this._gl) m.removeLayer(this._gl); } catch (e) {}
      try { if (this._fb) m.removeLayer(this._fb); } catch (e) {}
      this._gl = this._fb = null; m.getContainer().classList.remove("ios-vec", "ios-ready", "ios-dark");
    } });

  /* подложка «Схема»: вызывается из baseTiles() в app.js */
  window.iosBaseLayer = fb => new IosLayer({ fallback: fb });
  /* подписи поверх «Дымки» (панель msRef): вызывается из msSmog() в mapstyle.js; основная подложка тогда рисуется без подписей */
  window.iosRefLayer = (M, fb) => { M._iosSplit = true;
    const hide = g => { try { g.getStyle().layers.forEach(x => { if (x.type === "symbol" || x.id === "poi-dot") g.setLayoutProperty(x.id, "visibility", "none"); }); } catch (e) {} };
    M.eachLayer(l => { if (l instanceof IosLayer && !l.options.only && l._gl) { const g = l._gl.getMaplibreMap(); if (g.isStyleLoaded()) hide(g); else g.once("load", () => hide(g)); } });
    return new IosLayer({ only: "labels", pane: "msRef", fallback: fb, maxZoom: undefined, minZoom: undefined }); };
  /* гибрид: векторные дороги + подписи поверх спутника (вместо растровых подписей Esri) */
  window.iosHybLayer = fb => new IosLayer({ only: "hybrid", fallback: fb, maxZoom: undefined, minZoom: undefined });
  window.IosMapLayer = IosLayer;
})();
