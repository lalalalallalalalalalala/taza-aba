/* Открытый архив качества воздуха «Таза Аба»: раз в сутки дописывает по каждому городу строку за каждый полностью прошедший
 * местный день в archive/<city>.csv. Источник — Open-Meteo Air Quality API (модель CAMS, Copernicus), точка = центр города
 * (та же, что в «Зимах по годам» панели мэрии). Это МОДЕЛЬНЫЕ значения, а не измерения датчиков.
 * Уже записанные дни не переписываются (архив «как было опубликовано»). Запуск: node bot/archive_daily.js  (PAST_DAYS=1…92, по умолчанию 3).
 * Разовая догрузка истории: START_DATE=2022-12-01 node bot/archive_daily.js — по одному городу, кусками до 120 дней (бережно к лимитам Open-Meteo). */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), DIR = path.join(ROOT, "archive");
const CITIES = JSON.parse(fs.readFileSync(path.join(__dirname, "archive_cities.json"), "utf8"));
const PAST = Math.max(1, Math.min(92, +process.env.PAST_DAYS || 3)), START = process.env.START_DATE || "";
const HV = "&hourly=us_aqi,pm2_5,pm10,nitrogen_dioxide&timezone=auto";
const COLS = ["date", "aqi_mean", "aqi_max", "pm2_5_mean", "pm2_5_max", "pm10_mean", "no2_mean", "hours_pm2_5_over_15", "hours"];
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 4; i++) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(60000) }); if (r.ok) return r.json(); console.warn("HTTP", r.status); } catch (e) { console.warn("fetch:", e.message); }
    await sleep(5000 * (i + 1));
  }
  throw new Error("Open-Meteo unavailable");
}
const mean = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const max = a => { const v = a.filter(x => x != null); return v.length ? Math.max(...v) : null; };
const f1 = x => x == null ? "" : x.toFixed(1), f0 = x => x == null ? "" : String(Math.round(x));
function days(r) {
  const H = r.hourly, off = (r.utc_offset_seconds || 0) * 1000, today = new Date(Date.now() + off).toISOString().slice(0, 10), by = {};
  H.time.forEach((t, i) => { const k = t.slice(0, 10); if (k < today) (by[k] = by[k] || []).push(i); });
  return Object.keys(by).sort().map(k => { const ii = by[k], p = ii.map(i => H.pm2_5[i]), withPm = p.filter(x => x != null);
    return { date: k, n: withPm.length, line: [k, f1(mean(ii.map(i => H.us_aqi[i]))), f0(max(ii.map(i => H.us_aqi[i]))), f1(mean(p)), f1(max(p)),
      f1(mean(ii.map(i => H.pm10[i]))), f1(mean(ii.map(i => H.nitrogen_dioxide[i]))), withPm.filter(x => x > 15).length, withPm.length].join(",") }; })
    .filter(d => d.n >= 20);   // неполные сутки (пропуски модели) не пишем
}
(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const idxPath = path.join(DIR, "index.json");
  const idx = fs.existsSync(idxPath) ? JSON.parse(fs.readFileSync(idxPath, "utf8")) : {};
  const out = { title: "Taza Aba — open daily air-quality archive (city centres)", source: "Open-Meteo Air Quality API — CAMS model (Copernicus Atmosphere Monitoring Service)",
    license: "CC BY 4.0 (Open-Meteo); contains modified Copernicus Atmosphere Monitoring Service information", note: "Modelled values at the city centre point, not ground sensor measurements. Rows already written are never changed. Grid ~40 km (Kyrgyzstan).",
    units: { aqi: "US AQI (Open-Meteo)", pm2_5: "µg/m³", pm10: "µg/m³", no2: "µg/m³" }, whoGuidelinePm25_24h: 15, columns: COLS, started: idx.started || new Date().toISOString().slice(0, 10), updated: null, cities: {} };
  let added = 0, fail = 0;
  const merge = (c, r) => { const file = path.join(DIR, c.id + ".csv"); if (!r || !r.hourly) { fail++; return; }
    const have = new Map(); if (fs.existsSync(file)) fs.readFileSync(file, "utf8").split("\n").slice(1).filter(Boolean).forEach(l => have.set(l.slice(0, 10), l));
    days(r).forEach(d => { if (!have.has(d.date)) { have.set(d.date, d.line); added++; } });
    const keys = [...have.keys()].sort(); fs.writeFileSync(file, COLS.join(",") + "\n" + keys.map(k => have.get(k)).join("\n") + "\n"); };
  if (START) {   // догрузка истории: по одному городу, окна по 120 дней до вчера (UTC)
    const end = new Date(Date.now() - 86400e3).toISOString().slice(0, 10);
    for (const c of CITIES) for (let s = START; s <= end;) {
      const e = new Date(Math.min(Date.parse(s) + 119 * 86400e3, Date.parse(end))).toISOString().slice(0, 10);
      try { merge(c, await get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${c.lat}&longitude=${c.lon}${HV}&start_date=${s}&end_date=${e}`)); } catch (er) { console.error(c.id, s, er.message); fail++; }
      s = new Date(Date.parse(e) + 86400e3).toISOString().slice(0, 10); await sleep(2500);
    }
    out.backfill = { from: START, at: new Date().toISOString().slice(0, 10), note: "History before the archive start was loaded once from the Open-Meteo CAMS archive." };
  } else for (let i = 0; i < CITIES.length; i += 20) {
    const part = CITIES.slice(i, i + 20);
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${part.map(c => c.lat).join(",")}&longitude=${part.map(c => c.lon).join(",")}${HV}&past_days=${PAST}&forecast_days=1`;
    let res; try { res = await get(url); } catch (e) { console.error(e.message); fail += part.length; continue; }
    res = Array.isArray(res) ? res : [res];
    part.forEach((c, j) => merge(c, res[j]));
    await sleep(1500);
  }
  if (!out.backfill && idx.backfill) out.backfill = idx.backfill;
  CITIES.forEach(c => { const file = path.join(DIR, c.id + ".csv"); if (!fs.existsSync(file)) return;
    const L = fs.readFileSync(file, "utf8").split("\n").slice(1).filter(Boolean);
    out.cities[c.id] = { name: c.name, country: c.country, lat: c.lat, lon: c.lon, file: c.id + ".csv", days: L.length, first: L.length ? L[0].slice(0, 10) : null, last: L.length ? L[L.length - 1].slice(0, 10) : null }; });
  out.updated = new Date().toISOString();
  fs.writeFileSync(idxPath, JSON.stringify(out, null, 1) + "\n");
  console.log(`archive: +${added} rows, ${Object.keys(out.cities).length} cities, failed ${fail}`);
  if (!START && fail === CITIES.length) process.exit(1);
})();
