/* Таза Аба — эко-маршруты v41 (прототип): свой маршрут «Откуда → Куда» как в картах, реальная прокладка
 * (Valhalla / OSRM FOSSGIS, без ключей), 2–3 варианта, оценка вдыхаемой дозы PM2.5 по поверхности «Дымка»,
 * лучшее время по почасовому прогнозу, готовые маршруты, 3D-навигатор (eco3d.js, MapLibre — грузится лениво). */
const ECO_T = {
  ru: { title: "Эко-маршруты", sub: "Проложите путь, где воздух чище: выберите точки на карте или найдите адрес", from: "Откуда", to: "Куда", stop: "Остановка", add: "Добавить точку", swap: "Поменять местами", me: "Моё местоположение",
    walk: "Пешком", bike: "Велосипед", car: "Авто", hint: "Нажмите на карту: первая точка — «Откуда», вторая — «Куда». Маркеры можно перетаскивать.", build: "Проложить", building: "Прокладываю маршрут…",
    here: "Отсюда", there: "Сюда", via: "Через эту точку", min: "мин", h: "ч", km: "км", m: "м", aqi: "AQI в среднем", dose: "Доза PM2.5", cleanest: "Чище всего", fastest: "Быстрее всего", balanced: "Рекомендуем",
    cleaner: "чище на {p}%", dirtier: "грязнее на {p}%", same: "по воздуху почти одинаково", nav3d: "3D-навигатор", pick: "Выбрать", bestC: "прогноз модели CAMS с поправкой по датчикам", bestM: "по прогнозу модели CAMS", best: "Лучшее время сегодня", bestAt: "около {t} — AQI ≈ {a}",
    est: "Оценка: качество воздуха по маршруту — из поверхности «Дымка» (модель CAMS + датчики, сглажено между районами); доза = концентрация × дыхание ({v} м³/ч) × время. Не медицинский прибор.",
    eqAir: "Данные о воздухе — по районам, поэтому близкие маршруты получают похожую оценку. Выбирайте удобный.", fail: "Сервис маршрутов не ответил — показываю прямую линию (оценка).", lineEst: "по прямой, оценка",
    ready: "Готовые эко-маршруты", readySub: "Парки, бульвары и набережные — проложим по реальным дорожкам и оценим воздух", go: "Построить", detour: "через {d}", none: "Ничего не найдено", my: "Моё место", mapPt: "Точка на карте",
    loc: "Определяю местоположение…", locErr: "Не удалось определить местоположение", src: "Маршруты: © OpenStreetMap, Valhalla/OSRM (FOSSGIS). Поиск: Photon (komoot).", fewer: "Удалить точку", near: "рядом с «{d}»" },
  ky: { title: "Эко-маршруттар", sub: "Абасы тазараак жолду түзүңүз: картадан чекит тандаңыз же даректи издеңиз", from: "Кайдан", to: "Кайда", stop: "Аялдама", add: "Чекит кошуу", swap: "Алмаштыруу", me: "Менин жайгашкан жерим",
    walk: "Жөө", bike: "Велосипед", car: "Унаа", hint: "Картаны басыңыз: биринчи чекит — «Кайдан», экинчиси — «Кайда». Белгилерди сүйрөсө болот.", build: "Түзүү", building: "Маршрут түзүлүүдө…",
    here: "Ушул жерден", there: "Ушул жерге", via: "Ушул чекит аркылуу", min: "мүн", h: "саат", km: "км", m: "м", aqi: "Орточо AQI", dose: "PM2.5 дозасы", cleanest: "Эң таза", fastest: "Эң тез", balanced: "Сунуштайбыз",
    cleaner: "{p}% тазараак", dirtier: "{p}% булганычыраак", same: "аба боюнча дээрлик бирдей", nav3d: "3D-навигатор", pick: "Тандоо", bestC: "CAMS моделинин божомолу, датчиктер боюнча оңдолгон", bestM: "CAMS моделинин божомолу боюнча", best: "Бүгүн эң жакшы убакыт", bestAt: "болжол менен {t} — AQI ≈ {a}",
    est: "Баалоо: маршруттагы аба — «Дымка» бетинен (CAMS модели + датчиктер); доза = концентрация × дем алуу ({v} м³/саат) × убакыт. Медициналык прибор эмес.",
    eqAir: "Аба маалыматы райондор боюнча, ошондуктан жакын маршруттар окшош бааланат. Ыңгайлуусун тандаңыз.", fail: "Маршрут кызматы жооп берген жок — түз сызык көрсөтүлдү (баалоо).", lineEst: "түз сызык, баалоо",
    ready: "Даяр эко-маршруттар", readySub: "Парктар, бульварлар, жээктер — чыныгы жолдор менен түзүп, абаны баалайбыз", go: "Түзүү", detour: "{d} аркылуу", none: "Эч нерсе табылган жок", my: "Менин жерим", mapPt: "Картадагы чекит",
    loc: "Жайгашкан жер аныкталууда…", locErr: "Жайгашкан жерди аныктоо мүмкүн болбоду", src: "Маршруттар: © OpenStreetMap, Valhalla/OSRM (FOSSGIS). Издөө: Photon (komoot).", fewer: "Чекитти өчүрүү", near: "«{d}» жанында" },
  en: { title: "Eco routes", sub: "Plan a path with cleaner air: tap points on the map or search an address", from: "From", to: "To", stop: "Stop", add: "Add stop", swap: "Swap", me: "My location",
    walk: "Walk", bike: "Bike", car: "Car", hint: "Tap the map: first point is “From”, second is “To”. Drag markers to adjust.", build: "Route", building: "Finding routes…",
    here: "From here", there: "To here", via: "Via this point", min: "min", h: "h", km: "km", m: "m", aqi: "Average AQI", dose: "PM2.5 dose", cleanest: "Cleanest", fastest: "Fastest", balanced: "Recommended",
    cleaner: "{p}% cleaner", dirtier: "{p}% dirtier", same: "about the same air", nav3d: "3D navigator", pick: "Select", bestC: "CAMS model forecast, corrected by sensors", bestM: "per the CAMS model forecast", best: "Best time today", bestAt: "around {t} — AQI ≈ {a}",
    est: "Estimate: air along the route comes from the “Dymka” surface (CAMS model + sensors, smoothed between districts); dose = concentration × breathing ({v} m³/h) × time. Not a medical device.",
    eqAir: "Air data is per district, so nearby routes get similar estimates. Pick the most convenient.", fail: "Routing service didn't respond — showing a straight line (estimate).", lineEst: "straight line, estimate",
    ready: "Ready-made eco routes", readySub: "Parks, boulevards and riversides — routed along real paths with an air estimate", go: "Build", detour: "via {d}", none: "Nothing found", my: "My location", mapPt: "Point on map",
    loc: "Locating…", locErr: "Couldn't get your location", src: "Routing: © OpenStreetMap, Valhalla/OSRM (FOSSGIS). Search: Photon (komoot).", fewer: "Remove point", near: "near “{d}”" },
  tr: { title: "Eko rotalar", sub: "Havası daha temiz bir yol çizin: haritaya dokunun veya adres arayın", from: "Nereden", to: "Nereye", stop: "Durak", add: "Nokta ekle", swap: "Yer değiştir", me: "Konumum",
    walk: "Yürüyüş", bike: "Bisiklet", car: "Araç", hint: "Haritaya dokunun: ilk nokta “Nereden”, ikinci “Nereye”. İşaretçiler sürüklenebilir.", build: "Rota çiz", building: "Rota hesaplanıyor…",
    here: "Buradan", there: "Buraya", via: "Bu noktadan geç", min: "dk", h: "sa", km: "km", m: "m", aqi: "Ortalama AQI", dose: "PM2.5 dozu", cleanest: "En temiz", fastest: "En hızlı", balanced: "Önerilen",
    cleaner: "%{p} daha temiz", dirtier: "%{p} daha kirli", same: "hava neredeyse aynı", nav3d: "3D navigasyon", pick: "Seç", bestC: "sensörlerle düzeltilmiş CAMS model tahmini", bestM: "CAMS model tahminine göre", best: "Bugün en iyi zaman", bestAt: "yaklaşık {t} — AQI ≈ {a}",
    est: "Tahmin: rotadaki hava “Dymka” yüzeyinden (CAMS modeli + sensörler); doz = konsantrasyon × solunum ({v} m³/sa) × süre. Tıbbi cihaz değildir.",
    eqAir: "Hava verisi mahalle bazında; yakın rotalar benzer tahmin alır. En uygununu seçin.", fail: "Rota servisi yanıt vermedi — düz çizgi gösteriliyor (tahmin).", lineEst: "düz çizgi, tahmin",
    ready: "Hazır eko rotalar", readySub: "Parklar, bulvarlar, nehir kenarları — gerçek yollarla çizilir, hava tahminiyle", go: "Çiz", detour: "{d} üzerinden", none: "Sonuç yok", my: "Konumum", mapPt: "Haritadaki nokta",
    loc: "Konum alınıyor…", locErr: "Konum alınamadı", src: "Rotalar: © OpenStreetMap, Valhalla/OSRM (FOSSGIS). Arama: Photon (komoot).", fewer: "Noktayı sil", near: "“{d}” yakını" } };
const ET = (k, o) => { let s = (ECO_T[LANG] || ECO_T.ru)[k] ?? ECO_T.ru[k]; if (o) for (const [a, b] of Object.entries(o)) s = s.replace("{" + a + "}", b); return s; };
const ECO_V = { walk: 1.4, bike: 2.2, car: 0.6 };            /* вентиляция лёгких, м³/ч (пешком / велосипед / в машине в покое) */
const ECO_SPEED = { walk: 4.6, bike: 14, car: 30 };          /* для запасного варианта «по прямой», км/ч */
const ECO_ICON = { walk: '<svg viewBox="0 0 24 24"><circle cx="13" cy="4" r="2"/><path d="M9 21l2-7 3 3v5M7 12l3-4 4 1 3 3M11 14l-1-4"/></svg>', bike: '<svg viewBox="0 0 24 24"><circle cx="6" cy="17" r="3.5"/><circle cx="18" cy="17" r="3.5"/><path d="M6 17l4-8h5l3 8M10 9l2 8M14 6h3"/></svg>', car: '<svg viewBox="0 0 24 24"><path d="M5 16V11l2-5h10l2 5v5zM3 16h18M7 19v-3M17 19v-3"/><circle cx="8" cy="13" r=".8"/><circle cx="16" cy="13" r=".8"/></svg>' };
/* Готовые маршруты (точки — ориентиры, линия прокладывается по реальным дорожкам OSM) */
const ECO_READY = {
  bishkek: [
    { id: "e_phil", mode: "walk", n: { ru: "Ботсад КНУ → Филармония", ky: "КУУнун ботаникалык багы → Филармония", en: "KNU Botanical Garden → Philharmonic", tr: "KNU Botanik Bahçesi → Filarmoni" }, p: [[42.8857, 74.5887], [42.8783, 74.5876]] },
    { id: "e_center", mode: "walk", n: { ru: "Филармония → Дубовый парк → Площадь Победы", ky: "Филармония → Эмен паркы → Жеңиш аянты", en: "Philharmonic → Oak Park → Victory Square", tr: "Filarmoni → Meşe Parkı → Zafer Meydanı" }, p: [[42.8783, 74.5876], [42.8768, 74.6060], [42.8792, 74.6162]] },
    { id: "e_gar", mode: "walk", n: { ru: "Ботанический сад им. Гареева — круг", ky: "Гареев атындагы ботаникалык бак — айлана", en: "Gareev Botanical Garden loop", tr: "Gareev Botanik Bahçesi turu" }, p: [[42.8360, 74.6370], [42.8262, 74.6420], [42.8185, 74.6380], [42.8360, 74.6370]] },
    { id: "e_oreh", mode: "walk", n: { ru: "Парк «Ореховая роща»", ky: "«Жаңгак токою» паркы", en: "Walnut Grove park", tr: "Ceviz Korusu parkı" }, p: [[42.8250, 74.6270], [42.8232, 74.6292], [42.8250, 74.6270]] },
    { id: "e_south", mode: "bike", n: { ru: "Южные ворота → Ботсад Гареева", ky: "Түштүк дарбаза → Гареев ботаникалык багы", en: "Southern Gates → Gareev Garden", tr: "Güney Kapıları → Gareev Bahçesi" }, p: [[42.8291, 74.6073], [42.8262, 74.6390]] },
    { id: "e_vict", mode: "bike", n: { ru: "Центр → Парк Победы (юг)", ky: "Борбор → Жеңиш паркы (түштүк)", en: "Centre → Victory Park (south)", tr: "Merkez → Zafer Parkı (güney)" }, p: [[42.8767, 74.6037], [42.8287, 74.6035]] } ],
  osh: [
    { id: "e_sul", mode: "walk", n: { ru: "Подъём на Сулайман-Тоо", ky: "Сулайман-Тоого чыгуу", en: "Up Sulaiman-Too", tr: "Süleyman Dağı'na çıkış" }, p: [[40.5262, 72.7905], [40.5274, 72.7856]] },
    { id: "e_tokt", mode: "walk", n: { ru: "Парк Спутник → Парк им. Токтогула", ky: "Спутник паркы → Токтогул паркы", en: "Sputnik Park → Toktogul Park", tr: "Sputnik Parkı → Toktogul Parkı" }, p: [[40.5131, 72.8031], [40.5154, 72.8090]] },
    { id: "e_oshu", mode: "bike", n: { ru: "ОшГУ → Сулайман-Тоо", ky: "ОшМУ → Сулайман-Тоо", en: "Osh State Univ. → Sulaiman-Too", tr: "Oş Devlet Üniv. → Süleyman Dağı" }, p: [[40.5372, 72.8052], [40.5280, 72.7880]] } ],
  karakol: [
    { id: "e_kvp", mode: "walk", n: { ru: "Парк Победы — круг", ky: "Жеңиш паркы — айлана", en: "Victory Park loop", tr: "Zafer Parkı turu" }, p: [[42.4858, 78.4050], [42.4830, 78.4090], [42.4858, 78.4050]] } ],
  kochkor: [
    { id: "e_kkpark", mode: "walk", n: { ru: "Центр (райадминистрация) → парк", ky: "Борбор (райадминистрация) → парк", en: "Centre (district office) → park", tr: "Merkez (ilçe yönetimi) → park" }, p: [[42.21309, 75.75381], [42.21547, 75.76153]] },
    { id: "e_kktoo", mode: "bike", n: { ru: "Центр → айыл Кара-Тоо", ky: "Борбор → Кара-Тоо айылы", en: "Centre → Kara-Too village", tr: "Merkez → Kara-Too köyü" }, p: [[42.21309, 75.75381], [42.23048, 75.74424]] } ] };

const eco = { mode: "walk", pts: [null, null], routes: [], sel: 0, busy: false, note: "" };
let ecoAbort = null;
const ecoAqiToPm = a => { const B = [[0, 50, 0, 9], [51, 100, 9.1, 35.4], [101, 150, 35.5, 55.4], [151, 200, 55.5, 125.4], [201, 300, 125.5, 225.4], [301, 500, 225.5, 325.4]];
  for (const [il, ih, cl, ch] of B) if (a <= ih) return cl + (ch - cl) * (Math.max(a, il) - il) / (ih - il); return 325; };
const ecoRGB = a => { const G = [61, 190, 139], A = [237, 180, 67], O = [245, 146, 69], R = [229, 83, 75], P = [154, 91, 208], M = [122, 35, 64], S = [[0, G], [46, G], [55, A], [96, A], [105, O], [146, O], [155, R], [196, R], [210, P], [290, P], [310, M], [500, M]];
  for (let i = 1; i < S.length; i++) if (a <= S[i][0]) { const [x0, c0] = S[i - 1], [x1, c1] = S[i], k = (a - x0) / (x1 - x0); return c0.map((v, j) => Math.round(v + (c1[j] - v) * k)); } return S[S.length - 1][1]; };
const ecoCol = a => `rgb(${ecoRGB(a)})`;
const ecoKm = (a, b) => kmDist({ lat: a[0], lon: a[1] }, { lat: b[0], lon: b[1] });
function ecoDecode6(s) { let i = 0, lat = 0, lon = 0; const o = []; while (i < s.length) { for (const k of [0, 1]) { let r = 0, sh = 0, b; do { b = s.charCodeAt(i++) - 63; r |= (b & 31) << sh; sh += 5; } while (b >= 32); const d = r & 1 ? ~(r >> 1) : r >> 1; if (k) lon += d; else lat += d; } o.push([lat / 1e6, lon / 1e6]); } return o; }
function ecoFmtT(s) { const m = Math.max(1, Math.round(s / 60)); return m < 60 ? `${m} ${ET("min")}` : `${Math.floor(m / 60)} ${ET("h")} ${m % 60} ${ET("min")}`; }
const ecoFmtD = km => km < 1 ? `${Math.round(km * 1000 / 10) * 10} ${ET("m")}` : `${fmt(km, 1)} ${ET("km")}`;

/* оценка воздуха вдоль линии: выборка каждые ~40 м по поверхности «Дымка» */
function ecoExposure(geom, durS, mode) {
  const pts = typeof msPts === "function" ? msPts() : []; const S = []; let km = 0;
  for (let i = 0; i < geom.length; i++) { if (i) km += ecoKm(geom[i - 1], geom[i]);
    if (!i || i === geom.length - 1 || km - (S.length ? S[S.length - 1].km : 0) >= 0.04) S.push({ ll: geom[i], km }); }
  if (pts.length) S.forEach(s => { s.a = Math.round(msIdw(s.ll[0], s.ll[1], pts).v); }); else S.forEach(s => s.a = null);
  const v = S.filter(s => s.a != null); if (!v.length) return { km, S, aqi: null, pm: null, dose: null };
  let pmSum = 0, w = 0; for (let i = 1; i < S.length; i++) { const d = S[i].km - S[i - 1].km, a = ((S[i].a ?? 0) + (S[i - 1].a ?? 0)) / 2; pmSum += ecoAqiToPm(a) * d; w += d; }
  const pm = w ? pmSum / w : ecoAqiToPm(v[0].a), aqi = Math.round(v.reduce((s, x) => s + x.a, 0) / v.length);
  return { km, S, aqi, pm, dose: pm * ECO_V[mode] * durS / 3600 };
}
/* лучшее время сегодня: почасовой прогноз районов вдоль маршрута */
function ecoBestTime(S) {
  if (typeof nearestDistrict !== "function") return null; const ids = [...new Set(S.filter((_, i) => i % 5 === 0).map(s => nearestDistrict(s.ll[0], s.ll[1]).id))].filter(id => air.byDistrict[id] && air.byDistrict[id].hourly).slice(0, 10);
  if (!ids.length) return null; const r0 = air.byDistrict[ids[0]], T = r0.time || [], now = (r0.currentTime || "").slice(0, 13); let i0 = T.findIndex(x => x.slice(0, 13) >= now); if (i0 < 0) return null;
  /* v42: поправка прогноза CAMS по датчикам — тот же коэффициент, что у текущего AQI района (скорректированный / модельный),
   * к 24 ч упреждения ослабляется вдвое (поправка по датчикам устаревает). Без датчиков — чистый прогноз CAMS (так и подписано). */
  const K = {}; let corr = false; ids.forEach(id => { const r = air.byDistrict[id], m = typeof modelNowAqi === "function" ? modelNowAqi(r) : r.model && r.model.aqi; let k = 1;
    if (r.aqi != null && m != null && m >= 5 && r.src && r.src !== "model") k = Math.max(0.4, Math.min(2.5, r.aqi / m)); if (Math.abs(k - 1) > 0.03) corr = true; K[id] = k; });
  let best = null; for (let i = i0; i < Math.min(T.length, i0 + 24); i++) { const hh = +T[i].slice(11, 13); if (hh < 7 || hh > 21) continue; const lead = i - i0;
    const vs = ids.map(id => { const v = (typeof hAqi === "function" ? hAqi(air.byDistrict[id]) : air.byDistrict[id].hourly)[i]; return v == null ? null : v * (1 + (K[id] - 1) * Math.max(0.5, 1 - lead / 48)); }).filter(x => x != null); if (!vs.length) continue; const m = vs.reduce((a, b) => a + b, 0) / vs.length;
    if (!best || m < best.a - 0.5) best = { a: Math.round(m), t: T[i].slice(11, 16), day: T[i].slice(0, 10), corr }; }
  return best;
}
/* прокладка: Valhalla (FOSSGIS) → OSRM (FOSSGIS) → прямая */
async function ecoValhalla(pts, mode, alts, sig, ex) {
  const costing = { walk: "pedestrian", bike: "bicycle", car: "auto" }[mode];
  const body = { locations: pts.map((p, i) => ({ lat: +p.ll[0].toFixed(6), lon: +p.ll[1].toFixed(6), type: p.through ? "through" : "break" })), costing, alternates: alts, units: "kilometers", directions_type: "none", ...(ex || {}) };
  const r = await fetch("https://valhalla1.openstreetmap.de/route?json=" + encodeURIComponent(JSON.stringify(body)), { signal: sig }); if (!r.ok) throw new Error("valhalla " + r.status);
  const j = await r.json(); const tr2 = x => ({ geom: x.legs.flatMap(l => ecoDecode6(l.shape)), dur: x.summary.time, src: "Valhalla" });
  return [tr2(j.trip), ...(j.alternates || []).map(a => tr2(a.trip))];
}
async function ecoOsrm(pts, mode, sig) {
  const prof = { walk: "routed-foot", bike: "routed-bike", car: "routed-car" }[mode];
  const r = await fetch(`https://routing.openstreetmap.de/${prof}/route/v1/driving/${pts.map(p => p.ll[1].toFixed(6) + "," + p.ll[0].toFixed(6)).join(";")}?alternatives=${pts.length === 2 ? 2 : "false"}&overview=full&geometries=geojson`, { signal: sig });
  if (!r.ok) throw new Error("osrm " + r.status); const j = await r.json(); if (j.code !== "Ok") throw new Error(j.code);
  return j.routes.map(x => ({ geom: x.geometry.coordinates.map(c => [c[1], c[0]]), dur: x.duration, src: "OSRM" }));
}
async function ecoRoute() {
  const P = eco.pts.filter(Boolean); if (P.length < 2) return;
  if (ecoAbort) ecoAbort.abort(); ecoAbort = new AbortController(); const sig = ecoAbort.signal, mode = eco.mode;
  eco.busy = true; eco.note = ""; ecoRender(); let rs = [];
  try { rs = await ecoValhalla(P, mode, P.length === 2 ? 2 : 0, sig); }
  catch (e) { if (sig.aborted) return; try { rs = await ecoOsrm(P, mode, sig); } catch (e2) { if (sig.aborted) return;
    const g = P.map(p => p.ll), km = g.slice(1).reduce((s, p, i) => s + ecoKm(g[i], p), 0); rs = [{ geom: g, dur: km / ECO_SPEED[mode] * 3600, src: "line", est: true }]; eco.note = ET("fail"); } }
  rs = rs.map(r => ({ ...r, ...ecoExposure(r.geom, r.dur, mode) }));
  /* дополнительный вариант «через чистый район», если он рядом и заметно чище */
  if (P.length === 2 && !rs[0].est && typeof msPts === "function") try {
    const f = rs.reduce((a, b) => a.dur <= b.dur ? a : b), A = P[0].ll, B = P[1].ll, mid = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2], dkm = ecoKm(A, B);
    const cand = msPts().filter(p => p.a <= f.aqi - 8 && ecoKm(mid, [p.d.lat, p.d.lon]) <= Math.max(0.6, dkm * 0.35)).sort((x, y) => x.a - y.a || ecoKm(mid, [x.d.lat, x.d.lon]) - ecoKm(mid, [y.d.lat, y.d.lon]))[0];
    if (cand) { const x = (await ecoValhalla([P[0], { ll: [cand.d.lat, cand.d.lon], through: true }, P[1]], mode, 0, sig))[0], ex = { ...x, ...ecoExposure(x.geom, x.dur, mode), via: dName(cand.d) };
      if (ex.dur <= f.dur * 1.5 && ex.dose < Math.min(...rs.map(r => r.dose)) * 0.97 && rs.every(r => Math.abs(r.km - ex.km) / r.km > 0.03)) rs.push(ex); }
  } catch (e) { if (sig.aborted) return; }
  if (sig.aborted) return;
  await ecoFinish(rs, P, mode, sig);   /* v45-traffic: пробки, выхлоп, обходы, ранжирование */
}

/* --- поиск: районы города + Photon (вежливо: от 3 символов, задержка 350 мс, отмена прошлых запросов) --- */
const ecoNorm = s => String(s || "").toLowerCase().replace(/ё/g, "е").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").replace(/[«»"“”()\-–.,]/g, " ").replace(/\s+/g, " ").trim();
let ecoPhT = 0, ecoPhAb = null;
/* v42b: адрес по-местному — «улица Захарова, 20» (OSM KG: «Захарова улица» → «улица Захарова»); язык Photon: en → en, иначе местные названия (ru/ky/tr) */
const ecoStreet = s => { if (!s || LANG === "en") return s; const m = String(s).match(/^(.+?)\s+(улица|проспект|переулок|бульвар|проезд|шоссе|көчөсү|проспектиси)$/i); return m ? (/^(улица|проспект|переулок|бульвар|проезд|шоссе)$/i.test(m[2]) ? m[2].toLowerCase() + " " + m[1] : s) : s; };
async function ecoPhoton(q) { if (ecoPhAb) ecoPhAb.abort(); ecoPhAb = new AbortController(); const c = cityObj().center;
  const u = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&lang=${LANG === "en" ? "en" : "default"}&lat=${c[0]}&lon=${c[1]}&limit=10&bbox=${c[1] - 0.4},${c[0] - 0.3},${c[1] + 0.4},${c[0] + 0.3}`;
  const j = await (await fetch(u, { signal: ecoPhAb.signal })).json();
  return (j.features || []).map(f => { const p = f.properties; p.street = ecoStreet(p.street); const nm = p.name || [p.street, p.housenumber].filter(Boolean).join(", "); return nm ? { ll: [f.geometry.coordinates[1], f.geometry.coordinates[0]], label: nm, sub: [p.street && p.name ? p.street : "", p.district || p.city || ""].filter(Boolean).join(", ") } : null; }).filter(Boolean); }
function ecoLocal(q) { const n = ecoNorm(q); if (!n) return [];
  const ds = DISTRICTS.map(d => ({ d, b: Math.min(...Object.values(d.name || {}).map(x => { x = ecoNorm(x); return x.startsWith(n) ? 0 : x.split(" ").some(w => w.startsWith(n)) ? 1 : x.includes(n) ? 2 : 9; })) })).filter(x => x.b < 9).sort((a, b) => a.b - b.b).slice(0, 8)
    .map(x => ({ ll: [x.d.lat, x.d.lon], label: dName(x.d), sub: x.d.grp && typeof GRP_NAME !== "undefined" && GRP_NAME[x.d.grp] ? tr(GRP_NAME[x.d.grp]) : tr(cityObj().name), a: air.byDistrict[x.d.id] && air.byDistrict[x.d.id].aqi }));
  const rd = (ECO_READY[CITY] || []).flatMap(r => r.p.map((p, i) => ({ ll: p, label: tr(r.n).split(" → ")[Math.min(i, tr(r.n).split(" → ").length - 1)] }))).filter(x => ecoNorm(x.label).includes(n)).slice(0, 3);
  return [...ds, ...rd]; }
function ecoPtLabel(ll) { const d = typeof nearestDistrict === "function" ? nearestDistrict(ll[0], ll[1]) : null; return d ? ET("near", { d: dName(d) }) : ET("mapPt"); }
function ecoSetPt(i, ll, label) { eco.pts[i] = { ll, label: label || ecoPtLabel(ll) }; ecoRoute(); ecoRender(); }

/* --- отрисовка --- */
let ecoMap = null, ecoL = null, ecoSvg = null, ecoMk = [];
function ecoRender(fit) {
  const el = document.getElementById("view"); if (!el || !el.querySelector(".eco")) return;
  ecoForm(el.querySelector(".eco-form")); ecoList(el.querySelector(".eco-res")); ecoDraw(fit);
}
function ecoForm(f) {
  const n = eco.pts.length, lab = i => i === 0 ? ET("from") : i === n - 1 ? ET("to") : ET("stop") + " " + i;
  f.innerHTML = `<div class="eco-modes" role="radiogroup">${["walk", "bike", "car"].map(m => `<button type="button" role="radio" aria-checked="${eco.mode === m}" class="${eco.mode === m ? "on" : ""}" data-m="${m}">${ECO_ICON[m]}<span>${ET(m)}</span></button>`).join("")}</div>
    ${typeof ecoTfForm === "function" && ECO_HAS_TF() ? ecoTfForm() : ""}
    <div class="eco-pts">${eco.pts.map((p, i) => `<div class="eco-pt" data-i="${i}"><i class="eco-dot ${i === 0 ? "a" : i === n - 1 ? "b" : "s"}">${i === 0 ? "A" : i === n - 1 ? "B" : i}</i>
      <div class="eco-in"><input type="search" autocomplete="off" spellcheck="false" aria-label="${esc(lab(i))}" placeholder="${esc(lab(i))}" value="${p ? esc(p.label) : ""}"><ul class="eco-sug" hidden></ul></div>
      ${i === 0 ? `<button type="button" class="eco-ib" data-me title="${esc(ET("me"))}" aria-label="${esc(ET("me"))}"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="7"/></svg></button>` : i === n - 1 ? `<button type="button" class="eco-ib" data-swap title="${esc(ET("swap"))}" aria-label="${esc(ET("swap"))}"><svg viewBox="0 0 24 24"><path d="M7 4v16M7 4l-3 3M7 4l3 3M17 20V4M17 20l-3-3M17 20l3-3"/></svg></button>` : `<button type="button" class="eco-ib" data-del="${i}" aria-label="${esc(ET("fewer"))}">✕</button>`}</div>`).join("")}</div>
    <div class="eco-row"><button type="button" class="eco-add" ${n >= 5 ? "disabled" : ""}>＋ ${esc(ET("add"))}</button><span class="eco-hint">${esc(ET("hint"))}</span></div>`;
  if (typeof ecoTfBind === "function") ecoTfBind(f);
  f.querySelectorAll("[data-m]").forEach(b => b.onclick = () => { eco.mode = b.dataset.m; ecoRoute(); ecoRender(); });
  f.querySelector(".eco-add").onclick = () => { eco.pts.splice(eco.pts.length - 1, 0, null); ecoRender(); f.querySelectorAll(".eco-pt input")[eco.pts.length - 2].focus(); };
  f.querySelectorAll("[data-del]").forEach(b => b.onclick = () => { eco.pts.splice(+b.dataset.del, 1); ecoRoute(); ecoRender(); });
  f.querySelector("[data-swap]").onclick = () => { eco.pts.reverse(); ecoRoute(); ecoRender(); };
  f.querySelector("[data-me]").onclick = () => { if (!navigator.geolocation) return toast(ET("locErr")); toast(ET("loc"));
    navigator.geolocation.getCurrentPosition(p => ecoSetPt(0, [p.coords.latitude, p.coords.longitude], ET("my")), () => toast(ET("locErr")), { enableHighAccuracy: true, timeout: 10000 }); };
  document.querySelectorAll("body > .eco-sug").forEach(x => x.remove());   /* v42b: старые выпадающие списки (портал) */
  f.querySelectorAll(".eco-pt").forEach(row => { const i = +row.dataset.i, inp = row.querySelector("input"), ul = row.querySelector("ul"); let res = [], cur = -1;
    document.body.appendChild(ul); ul.setAttribute("role", "listbox");   /* v42b: список вне карточек — не обрезается и не просвечивает */
    const place = () => { if (ul.hidden) return; if (!inp.isConnected) { ul.remove(); return; } const r = inp.getBoundingClientRect(), nav = document.querySelector(".tabbar, .bottom-nav, nav.tabs"), nb = nav && getComputedStyle(nav).position === "fixed" && nav.getBoundingClientRect().top > innerHeight / 2 ? nav.getBoundingClientRect().top : innerHeight;
      const vv = window.visualViewport, vb = vv ? vv.offsetTop + vv.height : innerHeight, bot = Math.min(nb, vb), below = bot - r.bottom - 10, above = r.top - 10, up = below < 170 && above > below; ul.style.left = r.left + "px"; ul.style.width = r.width + "px";
      ul.style.maxHeight = Math.max(120, Math.min(360, (vv ? vv.height : innerHeight) * 0.5, up ? above : below)) + "px"; if (up) { ul.style.top = ""; ul.style.bottom = (innerHeight - r.top + 4) + "px"; } else { ul.style.bottom = ""; ul.style.top = (r.bottom + 4) + "px"; } };
    addEventListener("scroll", e => { if (e.target !== ul) place(); }, { passive: true, capture: true }); addEventListener("resize", place); if (window.visualViewport) { visualViewport.addEventListener("resize", place); visualViewport.addEventListener("scroll", place); }
    ul.addEventListener("wheel", e => e.stopPropagation(), { passive: true }); ul.addEventListener("touchmove", e => e.stopPropagation(), { passive: true });
    inp.addEventListener("focus", () => { if (matchMedia("(max-width: 1023px)").matches) setTimeout(() => inp.scrollIntoView({ block: "start", behavior: "smooth" }), 250); });
    document.addEventListener("pointerdown", e => { if (!ul.hidden && e.target !== inp && !ul.contains(e.target)) ul.hidden = true; });
    const draw0 = () => { ul.innerHTML = res.length ? res.map((r, k) => `<li role="option" data-k="${k}">${r.a != null ? `<i style="background:${ecoCol(r.a)}"></i>` : '<i class="pl"></i>'}<span>${esc(r.label)}${r.sub ? `<small>${esc(r.sub)}</small>` : ""}</span>${r.a != null ? `<b>${r.a}</b>` : ""}</li>`).join("") : `<li class="none">${esc(ET("none"))}</li>`; ul.hidden = false; };
    const draw = () => { draw0(); place(); };
    const pick = k => { const r = res[k]; if (!r) return; ul.hidden = true; ecoSetPt(i, r.ll, r.label); };
    inp.addEventListener("input", () => { const q = inp.value.trim(); res = ecoLocal(q); cur = -1; if (!q) { ul.hidden = true; return; } draw();
      clearTimeout(ecoPhT); if (q.length >= 3) ecoPhT = setTimeout(() => ecoPhoton(q).then(ph => { if (inp.value.trim() !== q) return; const seen = new Set(res.map(r => ecoNorm(r.label))); res = [...res, ...ph.filter(p => !seen.has(ecoNorm(p.label)))].slice(0, 12); draw(); }).catch(() => {}), 350); });
    inp.addEventListener("keydown", e => { const li = ul.querySelectorAll("li[data-k]"); if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (!li.length) return; cur = (cur + (e.key === "ArrowDown" ? 1 : -1) + li.length) % li.length; li.forEach((x, j) => x.classList.toggle("on", j === cur)); } else if (e.key === "Enter") { e.preventDefault(); pick(cur >= 0 ? cur : 0); } else if (e.key === "Escape") ul.hidden = true; });
    inp.addEventListener("blur", () => setTimeout(() => { if (document.activeElement !== inp) ul.hidden = true; }, 200));
    ul.addEventListener("mousedown", e => { const li = e.target.closest("li[data-k]"); if (li) { e.preventDefault(); pick(+li.dataset.k); } }); });
}
function ecoBar(S) { const n = 40, step = Math.max(1, S.length / n); const cs = []; for (let i = 0; i < S.length; i += step) { const s = S[Math.floor(i)]; cs.push(s.a == null ? "#ccd" : ecoCol(s.a)); } return `<i class="eco-bar" style="background:linear-gradient(90deg,${cs.join(",")})"></i>`; }
function ecoList(box) {
  if (eco.busy) { box.innerHTML = `<div class="eco-card eco-wait"><i class="eco-spin"></i>${esc(ET("building"))}</div>`; return; }
  if (!eco.routes.length) { box.innerHTML = ""; return; }
  const rs = eco.routes, same = rs.length > 1 && Math.max(...rs.map(r => r.pm)) / Math.min(...rs.map(r => r.pm)) < 1.04;
  box.innerHTML = `${eco.note ? `<div class="eco-warn">⚠️ ${esc(eco.note)}</div>` : ""}
    ${rs.map((r, k) => { const Lv = level(r.aqi);
      return `<div class="eco-card eco-r ${k === eco.sel ? "sel" : ""}" data-k="${k}" tabindex="0" role="button" aria-pressed="${k === eco.sel}">
        <div class="eco-r-top"><div class="eco-tags">${r.tags.map(tg => `<span class="eco-tag ${tg}">${esc(ET(tg))}</span>`).join("")}${r.via ? `<span class="eco-tag via">${esc(ET("detour", { d: r.via }))}</span>` : ""}${r.tfTag ? `<span class="eco-tag via">${esc(ETT(r.tfTag))}</span>` : ""}${r.est ? `<span class="eco-tag est">${esc(ET("lineEst"))}</span>` : ""}</div>
          <b class="eco-time">${ecoFmtT(r.T ?? r.dur)}</b></div>
        <div class="eco-meta"><span>${ecoFmtD(r.km)}</span><span><i class="eco-dot2" style="background:${ecoCol(r.aqi)}"></i>${esc(ET("aqi"))} ${r.aqi} · ${esc(tr(Lv.name))}</span><span>${esc(ET("dose"))} ≈ ${fmt(r.dose, r.dose < 10 ? 1 : 0)} µg</span>
          ${rs.length > 1 && r.vsFast ? `<span class="${r.vsFast > 0 ? "g" : "r"}">${esc(ET(r.vsFast > 0 ? "cleaner" : "dirtier", { p: Math.abs(r.vsFast) }))}</span>` : ""}</div>
        ${ecoTfMeta(r)}
        ${ecoBar(r.S)}
        <div class="eco-act"><button type="button" class="eco-3d" data-3d="${k}"><svg viewBox="0 0 24 24"><path d="M12 2l8 18-8-4-8 4z"/></svg>${esc(ET("nav3d"))}</button><button type="button" class="eco-3d eco-3ds" data-3d="${k}" data-sat="1" style="margin-left:6px"><svg viewBox="0 0 24 24"><path d="M2 16l20-8-8 12-2-5z"/></svg>${esc(ECO_SAT3D[LANG] || ECO_SAT3D.ru)}</button></div></div>`; }).join("")}
    ${same ? `<div class="eco-note">${esc(ET("eqAir"))}</div>` : ""}
    ${eco.best ? `<div class="eco-card eco-best"><b>🕒 ${esc(ET("best"))}</b><span>${esc(ET("bestAt", { t: eco.best.t, a: eco.best.a }))}</span><small class="eco-best-src">${esc(ET(eco.best.corr ? "bestC" : "bestM"))}</small></div>` : ""}
    <div class="eco-note">${esc(ET("est", { v: ECO_V[eco.mode] }))}</div>${eco.tfOk && eco.hd ? `<div class="eco-note">🚦 ${esc(ETT("note", { t: eco.hd.t + (eco.hd.tom ? " " + ETT("tomorrow") : "") }))}</div>` : ""}`;
  box.querySelectorAll(".eco-r").forEach(c => { const go = () => { eco.sel = +c.dataset.k; ecoList(box); ecoDraw(); }; c.onclick = e => { if (!e.target.closest("[data-3d]")) go(); }; c.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }; });
  box.querySelectorAll("[data-3d]").forEach(b => b.onclick = () => ecoOpen3d(eco.routes[+b.dataset["3d"]], b.dataset.sat ? { sat: true, fly: true } : null));
}
function ecoMarker(i) { const n = eco.pts.length, c = i === 0 ? "a" : i === n - 1 ? "b" : "s";
  return L.divIcon({ className: "", html: `<div class="eco-mk ${c}"><span></span><b>${i === 0 ? "A" : i === n - 1 ? "B" : i}</b></div>`, iconSize: [30, 38], iconAnchor: [15, 36] }); }
function ecoDraw(fit) {
  const M = ecoMap; if (!M || M !== map) return; ecoL.clearLayers(); ecoMk.forEach(m => M.removeLayer(m)); ecoMk = [];
  const dk = document.documentElement.dataset.theme === "dark"; ecoTfDraw(ecoL);
  eco.routes.forEach((r, k) => { if (k === eco.sel) return;
    L.polyline(r.geom, { color: dk ? "#0b1218" : "#fff", weight: 9, opacity: .9, lineCap: "round", lineJoin: "round" }).addTo(ecoL);
    L.polyline(r.geom, { color: dk ? "#5d6b78" : "#9aa7b3", weight: 5, opacity: .95, lineCap: "round", lineJoin: "round" }).on("click", () => { eco.sel = k; ecoRender(); }).addTo(ecoL); });
  const r = eco.routes[eco.sel];
  if (r) { L.polyline(r.geom, { color: "#4aa3dc", weight: 22, opacity: .16, lineCap: "round", lineJoin: "round", interactive: false }).addTo(ecoL);
    L.polyline(r.geom, { color: dk ? "#081018" : "#ffffff", weight: 12, opacity: 1, lineCap: "round", lineJoin: "round", interactive: false }).addTo(ecoL);
    for (let i = 1; i < r.S.length; i++) { const seg = [r.S[i - 1].ll, r.S[i].ll]; L.polyline(seg, { color: ecoCol(((r.S[i].a ?? 50) + (r.S[i - 1].a ?? 50)) / 2), weight: 7, opacity: 1, lineCap: "round", lineJoin: "round", interactive: false }).addTo(ecoL); }
    if (!(typeof RED_MOTION !== "undefined" && RED_MOTION)) L.polyline(r.geom, { renderer: ecoSvg, className: "eco-flow", color: "#fff", weight: 2.5, opacity: .85, interactive: false, lineCap: "round" }).addTo(ecoL); }
  eco.pts.forEach((p, i) => { if (!p) return; const m = L.marker(p.ll, { icon: ecoMarker(i), draggable: true, keyboard: false, zIndexOffset: 900, title: p.label })
    .on("dragend", e => { const ll = e.target.getLatLng(); ecoSetPt(i, [ll.lat, ll.lng]); }).addTo(M); ecoMk.push(m); });
  if (fit && r) M.fitBounds(L.latLngBounds(eco.routes.flatMap(x => x.geom)).pad(0.12), { maxZoom: 16 });
}
function ecoMapClick(e) { const ll = [e.latlng.lat, e.latlng.lng], n = eco.pts.length;
  if (!eco.pts[0]) return ecoSetPt(0, ll); if (!eco.pts[n - 1]) return ecoSetPt(n - 1, ll);
  const pop = L.popup({ className: "eco-pop", closeButton: false }).setLatLng(e.latlng).setContent(`<div class="eco-popb"><button data-a="0">A · ${esc(ET("here"))}</button><button data-a="via">＋ ${esc(ET("via"))}</button><button data-a="1">B · ${esc(ET("there"))}</button></div>`).openOn(ecoMap);
  pop.getElement().querySelectorAll("[data-a]").forEach(b => b.onclick = () => { ecoMap.closePopup(); const a = b.dataset.a;
    if (a === "0") ecoSetPt(0, ll); else if (a === "1") ecoSetPt(eco.pts.length - 1, ll); else if (eco.pts.length < 5) { eco.pts.splice(eco.pts.length - 1, 0, null); ecoSetPt(eco.pts.length - 2, ll); } }); }
function ecoReady(el) {
  const ready = (ECO_READY[CITY] || []).map(r => ({ id: r.id, mode: r.mode, name: tr(r.n), p: r.p, built: true })), old = (typeof ECO_ROUTES !== "undefined" ? ECO_ROUTES : []).filter(r => !r.far).map(r => ({ id: r.id, mode: r.mode === "bike" ? "bike" : "walk", name: tr(r.name), path: r.path }));
  const all = [...ready, ...old]; if (!all.length) return "";
  return `<h2>🌳 ${esc(ET("ready"))}</h2><p class="sub">${esc(ET("readySub"))}</p><div class="eco-ready">${all.map(r => `<button type="button" class="eco-card eco-rd" data-rd="${r.id}">${ECO_ICON[r.mode]}<span><b>${esc(r.name)}</b><small>${esc(ET(r.mode))}</small></span><em>${esc(ET("go"))} →</em></button>`).join("")}</div>`;
}
function ecoUseReady(id) { const r = (ECO_READY[CITY] || []).find(x => x.id === id), o = (ECO_ROUTES || []).find(x => x.id === id);
  if (r) { eco.mode = r.mode; eco.pts = r.p.map(ll => ({ ll, label: ecoPtLabel(ll) })); const nm = tr(r.n).split(" → "); eco.pts[0].label = nm[0]; eco.pts[eco.pts.length - 1].label = nm[nm.length - 1].replace(/ — .*$/, ""); }
  else if (o) { eco.mode = o.mode === "bike" ? "bike" : "walk"; const p = o.path, k = Math.max(1, Math.floor(p.length / 3)); eco.pts = [p[0], ...(p.length > 3 ? [p[k], p[2 * k]] : []), p[p.length - 1]].map(ll => ({ ll, label: ecoPtLabel(ll) })); eco.pts[0].label = tr(o.name); }
  ecoRoute(); ecoRender(); document.getElementById("ecoMap").scrollIntoView({ block: "center", behavior: "smooth" }); }
function viewEco(el) {
  el.innerHTML = `<div class="eco"><div class="eco-head"><h1>${esc(ET("title"))}</h1><p class="sub">${esc(ET("sub"))}</p></div>
    <div class="eco-grid"><div class="eco-side"><div class="eco-card eco-form"></div><div class="eco-res" aria-live="polite"></div></div>
      <div class="eco-mapw"><div id="ecoMap"></div><div class="eco-legend">${[25, 75, 125, 175, 250].map(a => `<i style="background:${ecoCol(a)}"></i>`).join("")}<span>AQI</span></div>${ecoTfLegend()}</div></div>
    ${ecoReady(el)}<div class="foot">${esc(ET("src"))}</div></div>`;
  map = mkMap("ecoMap", { zoomControl: true }); ecoMap = map; baseTiles(map); ecoSvg = L.svg({ padding: 0.5 });
  map.setView(cityObj().center, (cityObj().zoom || 12) + 0.5);
  if (typeof MsCanvas !== "undefined" && typeof msPts === "function") new MsCanvas((ctx, tl, m, w, h) => { const pts = msPts(); if (!pts.length) return; const S = 10, gw = Math.ceil(w / S), gh = Math.ceil(h / S), off = document.createElement("canvas"); off.width = gw; off.height = gh;
    const oc = off.getContext("2d"), img = oc.createImageData(gw, gh); for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) { const ll = m.layerPointToLatLng(tl.add([i * S, j * S])), r = msIdw(ll.lat, ll.lng, pts), c = msBinRGB(r.v), al = Math.max(0, Math.min(1, 1 - (r.dmin - 1.2) / 2.5)), k = (j * gw + i) * 4;
      img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = Math.round(al * 70); } oc.putImageData(img, 0, 0); ctx.filter = "blur(14px)"; ctx.drawImage(off, 0, 0, gw * S, gh * S); }).addTo(map);
  ecoL = L.layerGroup().addTo(map); map.on("click", ecoMapClick);
  el.querySelectorAll("[data-rd]").forEach(b => b.onclick = () => ecoUseReady(b.dataset.rd));
  ecoRender(true); setTimeout(() => map && map.invalidateSize(), 60);
}
/* v44-traffic (выкачен в v44): маршрут с учётом пробок — модель загруженности traffic2.js (tf2Roads/tf3C, 1–10)
 * на выбранный час отправления: (a) задержка по участкам для авто (для велосипеда — слабая), (b) надбавка к PM2.5 от выхлопа
 * рядом с загруженными улицами (пешком/вело у бордюра, в салоне авто), (c) доп. варианты в обход пробок
 * (Valhalla exclude_polygons + «тихие улицы» costing_options; запасной путь — via-точка в сторону от пробки, OSRM),
 * (d) ранжирование по предпочтению «Чистый воздух / Без пробок / Баланс». Всё — оценка (модель), не живые данные. */
const ECO_TT = {
  ru: { pref: "Что важнее", pClean: "Чистый воздух", pJam: "Без пробок", pBal: "Баланс", dep: "Отправление", dNow: "сейчас", d1: "через 1 ч", dC: "ко времени", tf: "Пробки", delay: "+{m} мин в пробках", nojam: "Меньше пробок", avoid: "в обход пробок", quiet: "тихими улицами",
    nearRd: "у загруженных дорог {p}% пути", exh: "выхлоп +{p}% к дозе", tEst: "оценка (модель)", leg: "Пробки (модель)", free: "свободно", jam: "пробка", tomorrow: "завтра",
    note: "Пробки — оценка (модель): типичный суточный профиль × структура улиц OSM на {t}, не живые данные. Выхлоп у загруженных улиц добавляет до +40 % к PM2.5 пешеходу и велосипедисту (у бордюра), до +30 % — в салоне авто; воздух на {t} — по почасовому прогнозу CAMS для районов." },
  ky: { pref: "Эмнеси маанилүү", pClean: "Таза аба", pJam: "Тыгынсыз", pBal: "Тең салмак", dep: "Жөнөө", dNow: "азыр", d1: "1 сааттан кийин", dC: "убакытка", tf: "Тыгындар", delay: "+{m} мүн тыгында", nojam: "Азыраак тыгын", avoid: "тыгынды айланып", quiet: "тынч көчөлөр менен",
    nearRd: "жолдун {p}% жүктүү көчөлөрдүн жанында", exh: "түтүн дозага +{p}%", tEst: "баалоо (модель)", leg: "Тыгындар (модель)", free: "бош", jam: "тыгын", tomorrow: "эртең",
    note: "Тыгындар — баалоо (модель): {t} саатка типтүү суткалык профиль × OSM көчөлөрүнүн түзүлүшү, жандуу маалымат эмес. Жүктүү көчөлөрдүн жанындагы түтүн жөө жүргөнгө жана велосипедчиге PM2.5ке +40 %га чейин, унаанын ичинде +30 %га чейин кошот; {t} саатка аба — райондор боюнча CAMS сааттык божомолу." },
  en: { pref: "Priority", pClean: "Clean air", pJam: "Avoid traffic", pBal: "Balanced", dep: "Depart", dNow: "now", d1: "in 1 h", dC: "at", tf: "Traffic", delay: "+{m} min in traffic", nojam: "Fewer jams", avoid: "around jams", quiet: "quiet streets",
    nearRd: "{p}% next to busy roads", exh: "exhaust +{p}% dose", tEst: "estimate (model)", leg: "Traffic (model)", free: "free", jam: "jam", tomorrow: "tomorrow",
    note: "Traffic is an estimate (model): typical daily profile × OSM street structure at {t}, not live data. Exhaust next to congested streets adds up to +40% PM2.5 for pedestrians and cyclists (kerbside), up to +30% inside a car; air at {t} follows the CAMS hourly forecast for the districts." },
  tr: { pref: "Öncelik", pClean: "Temiz hava", pJam: "Trafiksiz", pBal: "Denge", dep: "Çıkış", dNow: "şimdi", d1: "1 sa sonra", dC: "saatte", tf: "Trafik", delay: "trafikte +{m} dk", nojam: "Daha az trafik", avoid: "trafiği dolanarak", quiet: "sakin sokaklardan",
    nearRd: "yolun %{p}'i yoğun caddelerin yanında", exh: "egzoz doza +%{p}", tEst: "tahmin (model)", leg: "Trafik (model)", free: "akıcı", jam: "sıkışık", tomorrow: "yarın",
    note: "Trafik bir tahmindir (model): {t} için tipik günlük profil × OSM sokak yapısı, canlı veri değildir. Yoğun caddelerin yanındaki egzoz yaya ve bisikletliye PM2.5'te %40'a kadar (kaldırım kenarı), araç içinde %30'a kadar ek getirir; {t} havası semtlerin CAMS saatlik tahminine göredir." } };
const ETT = (k, o) => { let s = (ECO_TT[LANG] || ECO_TT.ru)[k] ?? ECO_TT.ru[k]; if (o) for (const [a, b] of Object.entries(o)) s = s.split("{" + a + "}").join(b); return s; };
const ECO_HAS_TF = () => typeof tf2Roads === "function" && typeof tf3C === "function";
eco.pref = eco.pref || "bal"; eco.dep = eco.dep || "now"; eco.depH = eco.depH ?? 18;
/* час отправления (местное время города) */
function ecoDep() { const off = typeof tf3Off === "function" ? tf3Off() : 6 * 3600e3, now = Date.now(), h0 = new Date(now + off).getUTCHours();
  const ahead = eco.dep === "1" ? 1 : eco.dep === "c" ? (eco.depH - h0 + 24) % 24 : 0, d = new Date(now + off + ahead * 3600e3), w = d.getUTCDay();
  return { ahead, h: d.getUTCHours(), dt: w === 6 ? 1 : w === 0 ? 2 : 0, tom: d.getUTCDate() !== new Date(now + off).getUTCDate(), t: String(d.getUTCHours()).padStart(2, "0") + ":00" }; }
/* индекс улиц: сетка 0,003° → отрезки дорог */
const ecoTfIx = {};
async function ecoTfRoads() { if (!ECO_HAS_TF()) return null; const c = CITY; if (ecoTfIx[c]) return ecoTfIx[c]; let R; try { R = await tf2Roads(); } catch (e) { return null; } if (!R || !R.length) return null;
  const G = new Map(), C = 0.003; R.forEach((r, ri) => { for (let i = 1; i < r.p.length; i++) { const a = r.p[i - 1], b = r.p[i];
    for (let x = Math.floor(Math.min(a[0], b[0]) / C); x <= Math.floor(Math.max(a[0], b[0]) / C); x++) for (let y = Math.floor(Math.min(a[1], b[1]) / C); y <= Math.floor(Math.max(a[1], b[1]) / C); y++) { const k = x + ":" + y; let L0 = G.get(k); if (!L0) G.set(k, L0 = []); L0.push([ri, a, b]); } } });
  return (ecoTfIx[c] = { R, G, C }); }
/* ближайшие дороги к точке: Map(ri → {d км, al |cos| между направлением маршрута и улицы}) */
function ecoNear(ix, p, rad, dir) { const kx = 111.32 * Math.cos(p[0] * Math.PI / 180), ky = 110.57, C = ix.C, i0 = Math.floor(p[0] / C), j0 = Math.floor(p[1] / C), out = new Map();
  for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) (ix.G.get((i0 + i) + ":" + (j0 + j)) || []).forEach(([ri, a, b]) => {
    const ax = (a[1] - p[1]) * kx, ay = (a[0] - p[0]) * ky, bx = (b[1] - p[1]) * kx, by = (b[0] - p[0]) * ky, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L2)) : 0, d = Math.hypot(ax + t * dx, ay + t * dy); if (d > rad) return;
    const al = dir && L2 ? Math.abs((dx * dir[0] + dy * dir[1]) / Math.sqrt(L2) / (Math.hypot(dir[0], dir[1]) || 1)) : 1, o = out.get(ri); if (!o || o.d > d) out.set(ri, { d, al }); });
  return out; }
/* почасовая поправка воздуха: прогноз района на час отправления / сейчас */
function ecoHourK(ll, ahead) { if (!ahead || typeof nearestDistrict !== "function") return 1; const d = nearestDistrict(ll[0], ll[1]), r = d && air.byDistrict[d.id]; if (!r || !r.hourly || !r.time) return 1;
  const now = (r.currentTime || "").slice(0, 13), i0 = r.time.findIndex(x => x.slice(0, 13) >= now); if (i0 < 0) return 1; const H = typeof hAqi === "function" ? hAqi(r) : r.hourly, a = H[i0], b = H[i0 + ahead];
  return a && b != null ? Math.max(0.3, Math.min(3, b / a)) : 1; }
/* трафик + выхлоп + воздух на час отправления для одного варианта */
function ecoTfApply(r, mode, ix, hd) {
  if (r.S0 == null) r.S0 = r.S.map(s => s.a); const S = r.S, kc = {};
  S.forEach((s, i) => { const id = typeof nearestDistrict === "function" && hd.ahead ? nearestDistrict(s.ll[0], s.ll[1]).id : "_"; if (kc[id] == null) kc[id] = ecoHourK(s.ll, hd.ahead); s.a = r.S0[i] == null ? null : Math.round(r.S0[i] * kc[id]); });
  let dl = 0, onKm = 0, cOn = 0, nearKm = 0, cNear = 0, tot = 0, pmA = 0, pmB = 0; r.jams = [];
  for (let i = 1; i < S.length; i++) { const a = S[i - 1].ll, b = S[i].ll, d = S[i].km - S[i - 1].km; if (d <= 0) continue; const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], aq = ((S[i].a ?? 50) + (S[i - 1].a ?? 50)) / 2, pm = ecoAqiToPm(aq);
    let on = null, onD = 1, nc = 0;
    if (ix) ecoNear(ix, m, 0.06, [(b[1] - a[1]) * Math.cos(m[0] * Math.PI / 180), b[0] - a[0]]).forEach((v, ri) => { const rr = ix.R[ri], c = tf3C(rr, hd.h, hd.dt), w = v.d <= 0.015 ? 1 : Math.max(0, 1 - (v.d - 0.015) / 0.045);
      nc = Math.max(nc, c * w * (TF2_W[rr.k] >= 0.35 ? 1 : 0.6)); if (v.d <= 0.022 && v.al > 0.8 && v.d < onD) { on = rr; onD = v.d; } });
    const c = on ? tf3C(on, hd.h, hd.dt) : 0; S[i].c = mode === "car" ? (on ? c : null) : (nc > 0.05 ? nc : null);
    if (on) { onKm += d; cOn += c * d; const v = on.ms || (TF_MAJOR(on.k) ? 60 : on.k === "secondary" ? 50 : 40); dl += d / v * 3600 * (1 / (1 - 0.75 * c) - 1); if (c >= 0.55) r.jams.push({ ll: m, c, d, n: on.n, ri: ix.R.indexOf(on) }); }
    if (nc >= 0.35) nearKm += d; cNear += nc * d; tot += d;
    const mult = mode === "car" ? 1 + 0.3 * c : 1 + 0.4 * nc; pmA += pm * mult * d; pmB += pm * d; }
  const delay = mode === "car" ? dl : mode === "bike" ? dl * 0.12 : 0, T = r.dur + delay;
  const cm = mode === "car" ? (tot ? (cOn + 0.05 * (tot - onKm)) / tot : 0) : (tot ? cNear / tot : 0);
  const v = S.filter(s => s.a != null); if (v.length) r.aqi = Math.round(v.reduce((s2, x) => s2 + x.a, 0) / v.length);
  r.pm = tot ? pmB / tot : r.pm; r.pmEff = tot ? pmA / tot : r.pm; r.exh = r.pm ? Math.round((r.pmEff / r.pm - 1) * 100) : 0;
  r.delay = delay; r.T = T; r.cm = cm; r.tf = ix ? tfScoreSeg(cm) : null; r.near = tot ? Math.round(100 * nearKm / tot) : 0; r.dose = r.pmEff * ECO_V[mode] * T / 3600; r.hd = hd; return r; }
/* участки пробок → полигоны исключения (Valhalla) / via-точки в сторону (запасной путь) */
function ecoJamZones(r, P) { const A = P[0].ll, B = P[P.length - 1].ll, by = {};
  (r.jams || []).forEach(j => { if (ecoKm(j.ll, A) < 0.3 || ecoKm(j.ll, B) < 0.3) return; const g = by[j.ri] || (by[j.ri] = { w: 0, pts: [] }); g.w += j.c * j.d; g.pts.push(j.ll); });
  return Object.values(by).sort((a, b) => b.w - a.w).slice(0, 4).map(g => { const la = g.pts.map(p => p[0]), lo = g.pts.map(p => p[1]), e = 0.0007;
    const s = Math.min(...la) - e, n = Math.max(...la) + e, w = Math.min(...lo) - e, ea = Math.max(...lo) + e; return { poly: [[w, s], [ea, s], [ea, n], [w, n], [w, s]], mid: g.pts[Math.floor(g.pts.length / 2)] }; }); }
function ecoSideVia(P, mid) { const A = P[0].ll, B = P[P.length - 1].ll, kx = Math.cos(mid[0] * Math.PI / 180), dx = (B[1] - A[1]) * kx, dy = B[0] - A[0], L0 = Math.hypot(dx, dy) || 1, off = 0.0045;
  return [mid[0] + dx / L0 * off, mid[1] - dy / L0 * off / kx]; }
async function ecoTfAlts(rs, P, mode, ix, hd, sig) { if (P.length !== 2 || rs[0].est) return rs;
  const base = rs.reduce((a, b) => a.T <= b.T ? a : b), Z = ecoJamZones(base, P), add = [], fresh = x => [...rs, ...add].every(r => Math.abs(r.km - x.km) / r.km > 0.03 || Math.abs(r.dur - x.dur) / r.dur > 0.05);
  const take = (x, tag) => { const ex = ecoTfApply({ ...x, ...ecoExposure(x.geom, x.dur, mode), tfTag: tag }, mode, ix, hd); if (fresh(ex)) add.push(ex); };
  const jobs = [];
  if (Z.length) jobs.push(ecoValhalla(P, mode, 0, sig, { exclude_polygons: Z.map(z => z.poly) }).then(x => take(x[0], "avoid")).catch(async e => { if (sig.aborted) return;
    const via = { ll: ecoSideVia(P, Z[0].mid), through: true }; try { take((await ecoValhalla([P[0], via, P[1]], mode, 0, sig))[0], "avoid"); } catch (e2) { try { take((await ecoOsrm([P[0], via, P[1]], mode, sig))[0], "avoid"); } catch (e3) {} } }));
  if (mode !== "car") jobs.push(ecoValhalla(P, mode, 0, sig, { costing_options: mode === "bike" ? { bicycle: { use_roads: 0.05, use_living_streets: 0.9, avoid_bad_surfaces: 0.3 } } : { pedestrian: { use_living_streets: 0.9, walkway_factor: 0.6, sidewalk_factor: 1.6 } } }).then(x => take(x[0], "quiet")).catch(() => {}));
  await Promise.all(jobs); return [...rs, ...add]; }
/* ранжирование по предпочтению */
function ecoRank(rs) { if (!rs.length) return rs; const mD = Math.min(...rs.map(r => r.dose ?? 1e9)) || 1, mT = Math.min(...rs.map(r => r.T)) || 1, mC = Math.min(...rs.map(r => r.cm ?? 0));
  const cost = r => eco.pref === "clean" ? (r.dose ?? 1e9) / mD + 0.02 * r.T / mT : eco.pref === "jam" ? r.T / mT + 1.2 * ((r.cm ?? 0) - mC) + 0.02 * (r.dose ?? 0) / mD : 0.45 * (r.dose ?? 1e9) / mD + 0.4 * r.T / mT + 0.6 * ((r.cm ?? 0) - mC);
  const fast = rs.reduce((a, b) => a.T <= b.T ? a : b), clean = rs.reduce((a, b) => (a.dose ?? 1e9) <= (b.dose ?? 1e9) ? a : b), calm = rs.reduce((a, b) => (a.cm ?? 0) <= (b.cm ?? 0) ? a : b);
  rs.forEach(r => { r.cost = cost(r); r.vsFast = fast.pmEff && r.pmEff ? Math.round((1 - r.pmEff / fast.pmEff) * 100) : 0; }); rs.sort((a, b) => a.cost - b.cost);
  rs.forEach((r, k) => { r.tags = []; if (k === 0) r.tags.push("balanced"); if (rs.length > 1) { if (r === clean) r.tags.push("cleanest"); if (r === fast) r.tags.push("fastest"); if (r === calm && r.tf != null && fast.tf != null && r.tf < fast.tf) r.tags.push("nojam"); } });
  return rs; }
async function ecoFinish(rs, P, mode, sig) { const hd = ecoDep(), ix = await ecoTfRoads(); if (sig.aborted) return;
  rs = rs.map(r => ecoTfApply(r, mode, ix, hd)); if (ix) rs = await ecoTfAlts(rs, P, mode, ix, hd, sig); if (sig.aborted) return;
  eco.routes = ecoRank(rs).slice(0, 4); eco.sel = 0; eco.busy = false; eco.hd = hd; eco.tfOk = !!ix; eco.best = ecoBestTime(eco.routes[0].S); ecoRender(true); }
function ecoReRank() { if (!eco.routes.length) return; ecoRank(eco.routes); eco.sel = 0; ecoRender(); }
/* панель: предпочтение + время отправления */
function ecoTfForm() { const h0 = ecoDep(); const hs = Array.from({ length: 24 }, (_, h) => `<option value="${h}" ${eco.depH === h ? "selected" : ""}>${String(h).padStart(2, "0")}:00</option>`).join("");
  return `<div class="eco-tfp"><span class="eco-lab">${esc(ETT("pref"))}</span><div class="eco-seg" role="radiogroup">${[["clean", "pClean", "🌿"], ["jam", "pJam", "🚦"], ["bal", "pBal", "⚖️"]].map(([v, k, ic]) => `<button type="button" role="radio" data-pref="${v}" aria-checked="${eco.pref === v}" class="${eco.pref === v ? "on" : ""}"><i>${ic}</i>${esc(ETT(k))}</button>`).join("")}</div></div>
  <div class="eco-tfp"><span class="eco-lab">${esc(ETT("dep"))}</span><div class="eco-seg eco-seg-s" role="radiogroup">${[["now", "dNow"], ["1", "d1"]].map(([v, k]) => `<button type="button" role="radio" data-dep="${v}" aria-checked="${eco.dep === v}" class="${eco.dep === v ? "on" : ""}">${esc(ETT(k))}</button>`).join("")}<label class="eco-depc ${eco.dep === "c" ? "on" : ""}" title="${esc(ETT("dC"))}"><span aria-hidden="true">🕒</span><select data-deph aria-label="${esc(ETT("dep"))}">${hs}</select></label></div>${eco.dep === "1" || h0.tom ? `<small class="eco-dept">→ ${esc(h0.t)}${h0.tom ? " · " + esc(ETT("tomorrow")) : ""}</small>` : ""}</div>`; }
function ecoTfBind(f) {
  f.querySelectorAll("[data-pref]").forEach(b => b.onclick = () => { eco.pref = b.dataset.pref; ecoReRank(); });
  f.querySelectorAll("[data-dep]").forEach(b => b.onclick = () => { eco.dep = b.dataset.dep; ecoRoute(); ecoRender(); });
  const s = f.querySelector("[data-deph]"); if (s) { s.onchange = () => { eco.depH = +s.value; eco.dep = "c"; ecoRoute(); ecoRender(); }; s.onclick = e => e.stopPropagation(); } }
function ecoTfMeta(r) { if (r.tf == null) return ""; const col = typeof tfCol === "function" ? tfCol(r.cm) : "#888", dm = Math.round((r.delay || 0) / 60);
  return `<div class="eco-tfm"><span class="eco-tfs" style="--tc:${col}" title="${esc(ETT("tEst"))}">🚦 ${esc(ETT("tf"))} <b>${r.tf}/10</b> · ${esc(tfLvl(Math.min(9, r.tf)))}</span>${eco.mode !== "walk" && dm >= 1 ? `<span class="eco-tfd">${esc(ETT("delay", { m: dm }))}</span>` : ""}${eco.mode !== "car" && r.near >= 5 ? `<span>${esc(ETT("nearRd", { p: r.near }))}</span>` : ""}${r.exh >= 3 ? `<span class="r">${esc(ETT("exh", { p: r.exh }))}</span>` : ""}</div>`; }
/* слой пробок на карте (только загруженные улицы рядом с маршрутами) */
function ecoTfDraw(L0) { const ix = ecoTfIx[CITY], hd = eco.hd; if (!ix || !hd || !eco.routes.length || typeof tfCol !== "function") return;
  const g = 0.004, cells = new Set(), dk = document.documentElement.dataset.theme === "dark"; eco.routes.forEach(x => x.S.forEach(s => cells.add(Math.round(s.ll[0] / g) + ":" + Math.round(s.ll[1] / g))));
  ix.R.forEach(r => { const c = tf3C(r, hd.h, hd.dt); if (c < 0.6 || !r.p.some(p => cells.has(Math.round(p[0] / g) + ":" + Math.round(p[1] / g)))) return;
    L.polyline(r.p, { color: tfCol(c), weight: TF2_W[r.k] >= 0.55 ? 3 : 2, opacity: dk ? .6 : .5, interactive: false, lineCap: "round" }).addTo(L0); }); }
function ecoTfLegend() { if (!ECO_HAS_TF() || typeof tfCol !== "function") return ""; return `<div class="eco-legend eco-legend2"><span>${esc(ETT("free"))}</span>${[0.15, 0.35, 0.5, 0.65, 0.8, 0.92].map(c => `<i style="background:${tfCol(c)}"></i>`).join("")}<span>${esc(ETT("jam"))}</span><em>🚦 ${esc(ETT("leg"))}</em></div>`; }
for (const l in ECO_TT) if (ECO_T[l]) ECO_T[l].nojam = ECO_TT[l].nojam;
/* 3D-навигатор — отдельный модуль, грузится только по нажатию */
const ECO_SAT3D = { ru: "3D-спутник", ky: "3D-спутник", en: "3D satellite", tr: "3D uydu" }; /* v44-sat: облёт маршрута над спутниковым снимком с рельефом */
function ecoOpen3d(r, o) { const go = () => window.eco3dOpen && window.eco3dOpen(r, eco.mode, o);
  if (window.eco3dOpen) return go(); const s = document.createElement("script"); s.src = "eco3d.js"; s.onload = go; s.onerror = () => toast("3D: load error"); document.head.appendChild(s); }
if (typeof views !== "undefined") views.routes = el => viewEco(el);
if (location.hash.startsWith("#routes")) setTimeout(() => { try { route(true); } catch (e) {} }, 0);
