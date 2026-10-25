/* Таза Аба — дополнительные ИЗМЕРЕННЫЕ источники (станции) поверх модели CAMS.
 * Работают только при заданном ключе в config.js (пустой ключ = источник выключен, запросов нет):
 *   AirNow (мониторы посольств США; GET, CORS: *), WAQI (агрегатор; GET, CORS: *), OpenAQ v3 (ключ в заголовке; нужен свой прокси из-за CORS).
 * MoveGreen: открытого документированного API нет — не подключаем.
 * Свежесть: станции старше 3 ч не используются (передача данных посольств США приостановлена с марта 2025). */
"use strict";
const ST_MAX_AGE_MIN = 180;
const CFG = () => window.TAZA_CONFIG || {};
const SRC_T = {
  ru: { hMeas: "Измерения посольства США (AirNow) за 7 дней: PM2.5 по дням", hMeasSub: "линия — измерение, точки — модель CAMS для вашего района", hMeasNone: "AirNow: за последние 7 дней измерений в городе нет (передача данных посольств США приостановлена с марта 2025).", hNoKey: "Историю измерений посольства США можно добавить бесплатным ключом AirNow (config.js → AIRNOW_KEY). WAQI истории не отдаёт, OpenAQ — только через свой прокси.", hLoad: "Загружаю измерения AirNow…", hMeasErr: "AirNow не ответил", card: "Источники данных сейчас", model: "Модель CAMS (Open-Meteo)", modelSub: "расчёт для района, не измерение", sc: "Sensor.Community", scSub: "{n} датчиков в городе · медиана", scNone: "нет свежих датчиков в городе",
    emb: "посольство США", measured: "Измерено: {s}, {t}", agree: "Модель и измерения", agOk: "согласуются", agMid: "заметно расходятся", agBad: "сильно расходятся", agHi: "модель завышает", agLo: "модель занижает",
    agNone: "сравнить не с чем: рядом с районами нет свежих измерений", agPts: "точек сравнения: {n}, медиана разницы {d} AQI", keys: "Ещё источники включаются бесплатным ключом в config.js: {l}", stNone: "{s}: нет свежих данных (старше 3 ч или станция молчит)",
    mg: "MoveGreen: открытого API нет — не подключён", layer: "📡 Измерения", stLbl: "станция", ago: "{m} мин назад", near: "ближайший к району: {k} км", far: "рядом с районом датчиков нет", waqiAqi: "AQI по расчёту WAQI" },
  ky: { hMeas: "АКШ элчилигинин өлчөөлөрү (AirNow), 7 күн: күндөр боюнча PM2.5", hMeasSub: "сызык — өлчөө, чекиттер — районуңуз үчүн CAMS модели", hMeasNone: "AirNow: акыркы 7 күндө шаарда өлчөө жок (АКШ элчиликтеринин маалыматын берүү 2025-жылдын мартынан бери токтотулган).", hNoKey: "АКШ элчилигинин өлчөө тарыхын акысыз AirNow ачкычы менен кошсо болот (config.js → AIRNOW_KEY). WAQI тарых бербейт, OpenAQ — өз прокси аркылуу гана.", hLoad: "AirNow өлчөөлөрү жүктөлүүдө…", hMeasErr: "AirNow жооп берген жок", card: "Учурдагы маалымат булактары", model: "CAMS модели (Open-Meteo)", modelSub: "район үчүн эсеп, өлчөө эмес", sc: "Sensor.Community", scSub: "шаарда {n} датчик · медиана", scNone: "шаарда жаңы датчик жок",
    emb: "АКШ элчилиги", measured: "Өлчөнгөн: {s}, {t}", agree: "Модель жана өлчөөлөр", agOk: "дал келет", agMid: "байкаларлык айырмаланат", agBad: "катуу айырмаланат", agHi: "модель жогорулатат", agLo: "модель төмөндөтөт",
    agNone: "салыштырууга эч нерсе жок: райондордун жанында жаңы өлчөө жок", agPts: "{n} чекит, айырманын медианасы {d} AQI", keys: "Башка булактар config.js'теги акысыз ачкыч менен күйөт: {l}", stNone: "{s}: жаңы маалымат жок (3 сааттан эски же станция үнсүз)",
    mg: "MoveGreen: ачык API жок — туташтырылган жок", layer: "📡 Өлчөөлөр", stLbl: "станция", ago: "{m} мүн. мурун", near: "районго эң жакыны: {k} км", far: "райондун жанында датчик жок", waqiAqi: "WAQI эсеби боюнча AQI" },
  en: { hMeas: "US Embassy measurements (AirNow), 7 days: daily PM2.5", hMeasSub: "line — measured, dots — CAMS model for your district", hMeasNone: "AirNow: no measurements in the city in the last 7 days (US embassy data sharing has been suspended since March 2025).", hNoKey: "US Embassy measurement history can be added with a free AirNow key (config.js → AIRNOW_KEY). WAQI has no history; OpenAQ only via your own proxy.", hLoad: "Loading AirNow measurements…", hMeasErr: "AirNow didn't respond", card: "Data sources right now", model: "CAMS model (Open-Meteo)", modelSub: "computed for the district, not measured", sc: "Sensor.Community", scSub: "{n} sensors in the city · median", scNone: "no fresh sensors in the city",
    emb: "US Embassy", measured: "Measured: {s}, {t}", agree: "Model vs measurements", agOk: "agree", agMid: "differ noticeably", agBad: "differ strongly", agHi: "model overestimates", agLo: "model underestimates",
    agNone: "nothing to compare: no fresh measurements near the districts", agPts: "{n} points, median difference {d} AQI", keys: "More sources turn on with a free key in config.js: {l}", stNone: "{s}: no fresh data (older than 3 h or station silent)",
    mg: "MoveGreen: no open API — not connected", layer: "📡 Measurements", stLbl: "station", ago: "{m} min ago", near: "nearest to the district: {k} km", far: "no sensors near the district", waqiAqi: "AQI as computed by WAQI" },
  
};
const ST = (k, v = {}) => String((SRC_T[LANG] || SRC_T.ru)[k] ?? SRC_T.ru[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
const SRC_NAME = { airnow: "AirNow", waqi: "WAQI", openaq: "OpenAQ" };
const hhmmL = ms => { const d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const isEmb = s => /embassy|consulate|state ?air|department of state|посольств/i.test(s);
function cityBox(c, r = 0.25) { return { s: c[0] - r, n: c[0] + r, w: c[1] - r / Math.cos(c[0] * Math.PI / 180), e: c[1] + r / Math.cos(c[0] * Math.PI / 180) }; }
async function stJSON(url, opt = {}, ms = 9000) {
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { ...opt, signal: ctl.signal }); if (!r.ok) throw new Error("HTTP " + r.status); return await r.json(); } finally { clearTimeout(tm); }
}
const isoH = ms => new Date(ms).toISOString().slice(0, 13);

/* AirNow: /aq/data за последние 3 ч в рамке города, по последнему часу на станцию */
async function stAirNow(c, key, hours = 3) {
  const b = cityBox(c), now = Date.now();
  const u = `https://www.airnowapi.org/aq/data/?startDate=${isoH(now - hours * 3600e3)}&endDate=${isoH(now)}&parameters=PM25&BBOX=${b.w.toFixed(3)},${b.s.toFixed(3)},${b.e.toFixed(3)},${b.n.toFixed(3)}&dataType=B&format=application/json&verbose=1&monitorType=0&includerawconcentrations=1&API_KEY=${encodeURIComponent(key)}`;
  const j = await stJSON(u); const by = {};
  (Array.isArray(j) ? j : []).forEach(x => { const id = x.IntlAQSCode || x.FullAQSCode || x.SiteName, at = Date.parse(x.UTC + ":00Z");
    const pm = x.RawConcentration > -900 ? x.RawConcentration : x.Value; if (!(pm >= 0) || !isFinite(at)) return;
    if (!by[id] || by[id].at < at) by[id] = { kind: "airnow", id, name: x.SiteName || "AirNow", lat: +x.Latitude, lon: +x.Longitude, pm25: pm, aqi: x.AQI > 0 ? x.AQI : pm25ToAqi(pm), at,
      embassy: isEmb((x.SiteName || "") + " " + (x.AgencyName || "")), ref: true, provider: x.AgencyName || "AirNow" }; });
  return Object.values(by);
}
/* WAQI: станции в рамке города (AQI по расчёту WAQI; концентрации нет — в значение района не подставляем) */
async function stWaqi(c, token) {
  const b = cityBox(c);
  const j = await stJSON(`https://api.waqi.info/v2/map/bounds?latlng=${b.s.toFixed(3)},${b.w.toFixed(3)},${b.n.toFixed(3)},${b.e.toFixed(3)}&networks=all&token=${encodeURIComponent(token)}`);
  if (!j || j.status !== "ok") throw new Error("WAQI: " + (j && j.data));
  return (j.data || []).map(x => ({ kind: "waqi", id: "w" + x.uid, name: (x.station && x.station.name) || "WAQI", lat: +x.lat, lon: +x.lon, pm25: null, aqi: +x.aqi,
    at: Date.parse(x.station && x.station.time), embassy: isEmb((x.station && x.station.name) || ""), ref: false, provider: "WAQI" })).filter(s => isFinite(s.aqi) && isFinite(s.at));
}
/* OpenAQ v3: локации с PM2.5 в радиусе 25 км + /latest (до 8 локаций) */
async function stOpenAQ(c, key, base) {
  const H = { headers: { "X-API-Key": key } }, B = (base || "https://api.openaq.org").replace(/\/$/, "");
  const j = await stJSON(`${B}/v3/locations?coordinates=${c[0]},${c[1]}&radius=25000&parameters_id=2&limit=50`, H);
  const locs = (j.results || []).filter(l => l.datetimeLast && Date.now() - Date.parse(l.datetimeLast.utc) < ST_MAX_AGE_MIN * 60e3).slice(0, 8);
  const out = await Promise.all(locs.map(async l => {
    const pmS = (l.sensors || []).find(s => s.parameter && s.parameter.name === "pm25"); if (!pmS) return null;
    const lt = await stJSON(`${B}/v3/locations/${l.id}/latest`, H).catch(() => null); const v = lt && (lt.results || []).find(r => r.sensorsId === pmS.id);
    if (!v || !(v.value >= 0)) return null;
    const prov = (l.provider && l.provider.name) || "OpenAQ";
    return { kind: "openaq", id: "o" + l.id, name: l.name || "OpenAQ", lat: l.coordinates.latitude, lon: l.coordinates.longitude, pm25: v.value, aqi: pm25ToAqi(v.value), at: Date.parse(v.datetime.utc),
      embassy: isEmb((l.name || "") + " " + prov), ref: /airnow|stateair|embassy/i.test(prov + " " + (l.name || "")), provider: prov };
  }));
  return out.filter(Boolean);
}
const stStatus = {};   // kind → "off" | "ok" | "empty" | "err"
async function loadStations(center) {
  const k = CFG(), jobs = [];
  const run = (kind, f) => { stStatus[kind] = "loading"; jobs.push(f().then(a => { stStatus[kind] = a.length ? "ok" : "empty"; return a; }).catch(e => { console.warn(kind + ":", e.message); stStatus[kind] = "err"; return []; })); };
  stStatus.airnow = stStatus.waqi = stStatus.openaq = "off";
  if (k.AIRNOW_KEY) run("airnow", () => stAirNow(center, k.AIRNOW_KEY));
  if (k.WAQI_TOKEN && k.WAQI_TOKEN !== "demo") run("waqi", () => stWaqi(center, k.WAQI_TOKEN));
  if (k.OPENAQ_KEY) run("openaq", () => stOpenAQ(center, k.OPENAQ_KEY, k.OPENAQ_BASE));
  if (!jobs.length) return [];
  const all = (await Promise.all(jobs)).flat(), now = Date.now();
  // убираем дубли (одна и та же станция у нескольких агрегаторов в пределах 300 м): приоритет AirNow → OpenAQ → WAQI
  const pri = { airnow: 0, openaq: 1, waqi: 2 }, keep = [];
  all.filter(s => (now - s.at) / 60e3 <= ST_MAX_AGE_MIN && isFinite(s.lat) && isFinite(s.lon)).sort((a, b) => pri[a.kind] - pri[b.kind])
    .forEach(s => { if (!keep.some(x => kmDist(x, s) < 0.3)) keep.push(s); });
  keep.forEach(s => s.age = Math.round((now - s.at) / 60e3));
  return keep;
}
/* Приоритет для значения района: эталонная станция (посольство/AirNow) ≤ 6 км > Sensor.Community ≤ 2.5 км > другая станция с PM2.5 ≤ 3 км > модель */
function applyStations(rec, d, stations) {
  if (!stations || !stations.length) return;
  const c = stations.filter(s => s.pm25 != null).map(s => ({ s, km: kmDist(d, s) })).sort((a, b) => a.km - b.km);
  const ref = c.find(x => x.s.ref && x.km <= 6), oth = c.find(x => x.km <= 3), pick = ref || (rec.src === "sensors" ? null : oth);
  if (!pick) return;
  const s = pick.s;
  Object.assign(rec, { aqi: Math.round(s.aqi), pm25: s.pm25, src: "station", stName: s.name, stKind: s.kind, stEmb: s.embassy, stAt: s.at, stKm: Math.round(pick.km * 10) / 10, stProv: s.provider });
  rec.pol.pm25 = [s.pm25, Math.round(s.aqi), "sensors"];
}
const stLabelName = a => a.stEmb ? ST("emb") + " (" + SRC_NAME[a.stKind] + ")" : `${a.stName} (${SRC_NAME[a.stKind]})`;
function stationSrcLabel(a) { return "📡 " + ST("measured", { s: esc(stLabelName(a)), t: hhmmL(a.stAt) }) + (a.stKm ? ` · ${fmt(a.stKm, 1)} km` : ""); }

/* Согласие модели и измерений: каждая свежая точка (датчик SC или станция) против модели ближайшего района (≤ 3 км) */
function agreementInfo() {
  const pts = [...(air.sensors || []).map(s => ({ lat: s.lat, lon: s.lon, aqi: pm25ToAqi(s.p2) })), ...(air.stations || []).map(s => ({ lat: s.lat, lon: s.lon, aqi: s.aqi }))];
  const diffs = [];
  pts.forEach(p => { let best = null; DISTRICTS.forEach(d => { const km = kmDist(d, p), r = air.byDistrict[d.id]; if (km <= 3 && r && r.model && (!best || km < best.km)) best = { km, m: typeof modelNowAqi === "function" ? modelNowAqi(r) : r.model.aqi }; }); if (best) diffs.push(best.m - p.aqi); });   // v52: модель тоже по PM2.5 текущего часа (как датчики), а не по среднему за 24 ч
  if (!diffs.length) return null;
  const md = median(diffs), mad = median(diffs.map(Math.abs));
  return { n: diffs.length, d: Math.round(md), abs: Math.round(mad), lvl: mad <= 20 ? "ok" : mad <= 50 ? "mid" : "bad" };
}
function agreementHTML() {
  const g = agreementInfo();
  if (!g) return `<div class="src-ag none"><b>${ST("agree")}:</b> ${ST("agNone")}</div>`;
  const dir = Math.abs(g.d) <= 10 ? "" : " · " + ST(g.d > 0 ? "agHi" : "agLo");
  return `<div class="src-ag ${g.lvl}"><i aria-hidden="true"></i><b>${ST("agree")}:</b> ${ST(g.lvl === "ok" ? "agOk" : g.lvl === "mid" ? "agMid" : "agBad")}${dir}<div class="small">${ST("agPts", { n: g.n, d: (g.d > 0 ? "+" : "") + g.d })}</div></div>`;
}
function sourcesCardHTML(d) {
  const a = air.byDistrict[d.id]; if (!a) return "";
  const live = air.status === "ok", sc = live ? (air.sensors || []) : [], st = live ? (air.stations || []) : [];
  const m = a.model || (a.src === "model" ? { aqi: a.aqi, pm25: a.pm25 } : null);
  const rows = [];
  if (m) rows.push(`<li><span class="src-ic">🛰️</span><div><b>${ST("model")}</b><small>${ST("modelSub")}${a.currentTime ? " · " + esc(a.currentTime.slice(11, 16)) : ""}</small></div><em style="--c:${level(m.aqi).color}">${aqiTxt(m.aqi)}</em></li>`);
  if (sc.length) { const near = Math.min(...sc.map(s => kmDist(d, s))), mdv = pm25ToAqi(median(sc.map(s => s.p2)));
    rows.push(`<li><span class="src-ic">📡</span><div><b>${ST("sc")}</b><small>${ST("scSub", { n: sc.length })} · ${near <= 2.5 ? ST("near", { k: fmt(near, 1) }) : ST("far")}</small></div><em style="--c:${level(mdv).color}">${mdv}</em></li>`); }
  else rows.push(`<li class="dim"><span class="src-ic">📡</span><div><b>${ST("sc")}</b><small>${live ? ST("scNone") : "—"}</small></div><em>—</em></li>`);
  st.slice().sort((x, y) => kmDist(d, x) - kmDist(d, y)).slice(0, 4).forEach(s => rows.push(`<li><span class="src-ic">${s.embassy ? "🏛️" : "📍"}</span><div><b>${esc(s.embassy ? ST("emb") : s.name)}</b><small>${ST("measured", { s: SRC_NAME[s.kind], t: hhmmL(s.at) })}${s.pm25 == null ? " · " + ST("waqiAqi") : " · PM2.5 " + fmt(s.pm25, 1)} · ${fmt(kmDist(d, s), 1)} km</small></div><em style="--c:${level(Math.round(s.aqi)).color}">${Math.round(s.aqi)}</em></li>`));
  ["airnow", "waqi", "openaq"].filter(k => ["empty", "err"].includes(stStatus[k])).forEach(k => rows.push(`<li class="dim"><span class="src-ic">⏸️</span><div><small>${ST("stNone", { s: SRC_NAME[k] })}</small></div></li>`));
  const k = CFG(), miss = [!k.AIRNOW_KEY && "AirNow", !k.WAQI_TOKEN && "WAQI", !k.OPENAQ_KEY && "OpenAQ"].filter(Boolean);
  const kg = CITIES[CITY] && CITIES[CITY].country === "kg";
  return `<div class="card src-card"><h3>${ST("card")}</h3><ul class="src-list">${rows.join("")}</ul>${live ? agreementHTML() : ""}
    <div class="small muted src-foot">${kg ? ST("mg") : ""}</div></div>`;
}
/* Слой карты «Измерения»: датчики SC (квадрат) и станции (ромб) */
let stOn = localStorage.getItem("tazaAba.stLayer") === "1";   /* по умолчанию выключен (производительность) */
function stAttach(el) {
  if (typeof map === "undefined" || !map || !el.querySelector("#mapEl") || air.status !== "ok") return;
  const lg = L.layerGroup();
  (air.sensors || []).forEach(s => { const v = pm25ToAqi(s.p2), c = level(v).color;
    L.marker([s.lat, s.lon], { icon: L.divIcon({ className: "", html: `<div class="ms-pin sq" style="background:${c}">${v}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] }) })
      .bindPopup(() => `<b>📡 Sensor.Community</b><br>PM2.5: ${fmt(s.p2, 1)} µg/m³ → AQI <b style="color:${c}">${v}</b><br>${ST("ago", { m: Math.max(1, Math.round(s.age)) })}<br><small>${ST("stLbl")} · low-cost</small>`).addTo(lg); });
  (air.stations || []).forEach(s => { const v = Math.round(s.aqi), c = level(v).color;
    L.marker([s.lat, s.lon], { icon: L.divIcon({ className: "", html: `<div class="ms-pin dm" style="background:${c}"><span>${v}</span></div>`, iconSize: [34, 34], iconAnchor: [17, 17] }) })
      .bindPopup(() => `<b>${s.embassy ? "🏛️ " + ST("emb") : "📍 " + esc(s.name)}</b><br>${ST("measured", { s: SRC_NAME[s.kind], t: hhmmL(s.at) })}<br>${s.pm25 != null ? "PM2.5: " + fmt(s.pm25, 1) + " µg/m³ · " : ""}AQI <b style="color:${c}">${v}</b>${s.pm25 == null ? "<br><small>" + ST("waqiAqi") + "</small>" : ""}`).addTo(lg); });
  if (stOn) lg.addTo(map);
  const tg = el.querySelector(".toggles"); if (!tg) return;
  tg.insertAdjacentHTML("beforeend", `<div class="toggle ${stOn ? "on" : ""}" id="stToggle" role="button" tabindex="0">${ST("layer")} <span class="chip" style="padding:1px 6px">${(air.sensors || []).length + (air.stations || []).length}</span></div>`);
  const b = el.querySelector("#stToggle"); b.onclick = () => { stOn = !stOn; localStorage.setItem("tazaAba.stLayer", stOn ? "1" : "0"); b.classList.toggle("on", stOn); stOn ? lg.addTo(map) : map.removeLayer(lg); };
}

/* История: суточный PM2.5 по AirNow (если есть ключ) против модели CAMS района */
const stHist = {};
function histMeasuredHTML(D) {
  const k = CFG();
  if (!k.AIRNOW_KEY) return `<div class="card small muted">🏛️ ${ST("hNoKey")}</div>`;
  const id = CITY, h = stHist[id];
  if (!h) { stHist[id] = { st: "loading" };
    stAirNowHist(cityObj().center, k.AIRNOW_KEY).then(r => stHist[id] = { st: "ok", r }).catch(e => stHist[id] = { st: "err", m: e.message })
      .finally(() => { if ((location.hash || "").startsWith("#history")) route(true); }); }
  if (!h || h.st === "loading") return `<div class="card small">${ST("hLoad")}</div>`;
  if (h.st === "err") return `<div class="card small muted">🏛️ ${ST("hMeasErr")} (${esc(h.m)})</div>`;
  if (!h.r.length) return `<div class="card small muted">🏛️ ${ST("hMeasNone")}</div>`;
  const mod = {}; D.t.forEach((tm, i) => { const day = tm.slice(0, 10); (mod[day] = mod[day] || []).push(D.pm25[i]); });
  const days = h.r.map(x => x.day), meas = h.r.map(x => x.pm25), mdl = days.map(dy => mod[dy] ? hMean(mod[dy]) : null);
  const W = innerWidth < 600 ? 380 : 640, Hh = 150, P = 26, mx = Math.max(20, ...meas, ...mdl.filter(v => v != null)) * 1.1, n = days.length;
  const x = i => P + (n > 1 ? i / (n - 1) : 0.5) * (W - P - 10), y = v => Hh - 18 - v / mx * (Hh - 30);
  const line = `<polyline class="hline" points="${meas.map((v, i) => x(i).toFixed(1) + "," + y(v).toFixed(1)).join(" ")}"/>`;
  const dots = mdl.map((v, i) => v == null ? "" : `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="3.5" class="h-mdot"><title>CAMS ${fmt(v, 1)}</title></circle>`).join("");
  const lab = days.map((dy, i) => `<text x="${x(i).toFixed(1)}" y="${Hh - 4}" class="hl" text-anchor="middle">${dy.slice(8, 10)}.${dy.slice(5, 7)}</text>`).join("");
  const who = `<line x1="${P}" x2="${W}" y1="${y(15)}" y2="${y(15)}" class="hg"/><text x="${P - 4}" y="${y(15) + 3}" class="hl" text-anchor="end">15</text>`;
  return `<div class="card"><h3>🏛️ ${ST("hMeas")}</h3><div class="small muted">${ST("hMeasSub")}</div><svg class="h-svg" viewBox="0 0 ${W} ${Hh}" role="img">${who}${line}${dots}${lab}</svg></div>`;
}
async function stAirNowHist(c, key) {
  const b = cityBox(c), now = Date.now();
  const u = `https://www.airnowapi.org/aq/data/?startDate=${isoH(now - 7 * 864e5)}&endDate=${isoH(now)}&parameters=PM25&BBOX=${b.w.toFixed(3)},${b.s.toFixed(3)},${b.e.toFixed(3)},${b.n.toFixed(3)}&dataType=C&format=application/json&verbose=0&monitorType=0&includerawconcentrations=1&API_KEY=${encodeURIComponent(key)}`;
  const j = await stJSON(u, {}, 15000), by = {};
  (Array.isArray(j) ? j : []).forEach(x => { const v = x.RawConcentration > -900 ? x.RawConcentration : x.Value; if (!(v >= 0)) return;
    const loc = new Date(Date.parse(x.UTC + ":00Z")), day = loc.getFullYear() + "-" + String(loc.getMonth() + 1).padStart(2, "0") + "-" + String(loc.getDate()).padStart(2, "0"); (by[day] = by[day] || []).push(v); });
  return Object.entries(by).filter(([, v]) => v.length >= 12).sort().map(([day, v]) => ({ day, pm25: v.reduce((s, z) => s + z, 0) / v.length }));
}
