/* Таза Аба — поправка прогноза смога по датчикам (запускается GitHub Actions каждые 6 ч, без ключей).
 * 1) Датчики Sensor.Community в Кыргызстане (data.24h.json) → суточные архивы archive.sensor.community за ~22 дня → часовые медианы по городу
 *    (фильтр сбойных датчиков как в приложении: PM2.5 ≥ 500 или > max(3×медиана соседей, медиана+60)).
 * 2) Модель CAMS (Open-Meteo, past_days) в точках датчиков и фон CAMS в сельских точках; погода Open-Meteo (T, ветер, слой перемешивания).
 * 3) Поправка: obs − CAMS = c0 + Σ a_период · H·D, H = нагрев (12 − T за 24 ч)/10, D = застой (ветер, слой перемешивания);
 *    гребневая регрессия по последним 14 дням. Плюс «наукаст» в браузере (текущее отклонение датчиков, затухает с τ = 6 ч).
 * 4) Честная проверка: для каждого часа последних 7 дней коэффициенты строятся только по прошлым 14 дням, сравнение с датчиками.
 * Результат: forecast/coeffs.json. Если данных мало — файл не перезаписывается (в браузере остаются встроенные коэффициенты). */
"use strict";
const fs = require("fs"), path = require("path");
const OUT = path.join(__dirname, "..", "forecast", "coeffs.json");
const CITIES = JSON.parse(fs.readFileSync(path.join(__dirname, "archive_cities.json"), "utf8")).filter(c => c.country === "kg");
const RURAL = [[42.75, 75.3], [42.95, 74.0]];   // фон без городских выбросов (Кеминская долина, запад Чуйской долины)
const DAYS = 22, WD = 14, TAU = 6, LAM = 0.05;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(url, kind = "json", tries = 3) {
  for (let i = 0; i < tries; i++) {
    try { const r = await fetch(url, { signal: AbortSignal.timeout(60000) }); if (r.status === 404) return null; if (!r.ok) throw new Error("HTTP " + r.status); return kind === "json" ? await r.json() : await r.text(); }
    catch (e) { if (i === tries - 1) throw e; await sleep(2000 * (i + 1)); }
  }
}
const km = (a, b) => { const R = 6371, dLa = (b[0] - a[0]) * Math.PI / 180, dLo = (b[1] - a[1]) * Math.PI / 180; const x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n ? (n % 2 ? s[n >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const L1 = x => Math.log(x + 1);
const PM = new Set(["SDS011", "PMS5003", "PMS7003", "PMS1003", "PMS3003", "SPS30", "HPM", "SDS021", "NextPM"]);
const bin = h => h < 6 ? 0 : h < 11 ? 1 : h < 18 ? 2 : 3;   // местные часы: ночь, утро, день, вечер
function solve(A, b) { const n = b.length; A = A.map((r, i) => [...r, b[i]]); for (let i = 0; i < n; i++) { let p = i; for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[p][i])) p = k; [A[i], A[p]] = [A[p], A[i]]; for (let k = 0; k < n; k++) if (k !== i) { const f = A[k][i] / A[i][i]; for (let j = i; j <= n; j++) A[k][j] -= f * A[i][j]; } } return A.map((r, i) => r[n] / r[i]); }
function ridge(rows) {   // rows: [x(5), y]
  const n = rows.length, XtX = [...Array(5)].map(() => Array(5).fill(0)), Xty = Array(5).fill(0);
  rows.forEach(([x, y]) => { for (let i = 0; i < 5; i++) { Xty[i] += x[i] * y; for (let j = 0; j < 5; j++) XtX[i][j] += x[i] * x[j]; } });
  for (let i = 0; i < 5; i++) XtX[i][i] += LAM * n * (i === 0 ? 4 : 1);
  return solve(XtX, Xty).map((v, i) => i ? Math.max(0, v) : v);
}
(async () => {
  const d24 = await get("https://data.sensor.community/static/v2/data.24h.json");
  const sens = {};
  d24.forEach(x => { const L = x.location || {}, la = +L.latitude, lo = +L.longitude, t = x.sensor && x.sensor.sensor_type && x.sensor.sensor_type.name;
    if (!PM.has(t) || L.indoor || !(la >= 39 && la <= 43.5 && lo >= 69 && lo <= 80.5)) return;
    const c = CITIES.map(c => [c, km([la, lo], [c.lat, c.lon])]).sort((a, b) => a[1] - b[1])[0]; if (!c || c[1] > 25) return;
    sens[x.sensor.id] = { id: x.sensor.id, type: t.toLowerCase(), lat: la, lon: lo, city: c[0].id }; });
  const byCity = {}; Object.values(sens).forEach(s => (byCity[s.city] = byCity[s.city] || []).push(s));
  const out = { updated: new Date().toISOString().slice(0, 16) + "Z", method: "obs−CAMS = c0 + Σ a·H·D (ridge, 14 d) + nowcast τ=6 h", tau: TAU, cities: {} };
  const today = new Date(); const days = [...Array(DAYS)].map((_, i) => new Date(today.getTime() - (i + 1) * 864e5).toISOString().slice(0, 10)).reverse();
  for (const [cid, list] of Object.entries(byCity)) {
    if (list.length < 2) { console.log(cid, ": only", list.length, "sensor(s) — skipped"); continue; }
    // часовые средние по датчику (UTC)
    const H = {};
    for (const s of list) { H[s.id] = {};
      const urls = days.map(d => `https://archive.sensor.community/${d}/${d}_${s.type}_sensor_${s.id}.csv`);
      for (let i = 0; i < urls.length; i += 8) { const txt = await Promise.all(urls.slice(i, i + 8).map(u => get(u, "text").catch(() => null)));
        txt.forEach(t => { if (!t) return; const lines = t.split("\n"), hd = lines[0].split(";"), iP = hd.indexOf("P2"), iT = hd.indexOf("timestamp");
          for (let k = 1; k < lines.length; k++) { const c = lines[k].split(";"), v = parseFloat(c[iP]); if (!(v >= 0 && v < 500)) continue; const h = (c[iT] || "").slice(0, 13); (H[s.id][h] = H[s.id][h] || []).push(v); } }); } }
    const obs = {}; const hours = new Set(); Object.values(H).forEach(o => Object.keys(o).forEach(h => hours.add(h)));
    [...hours].forEach(h => { const v = list.map(s => H[s.id][h] ? [s, mean(H[s.id][h])] : null).filter(Boolean);
      const ok = v.filter(([s, x]) => { const nb = v.filter(y => y[0] !== s).map(y => y[1]); if (nb.length < 2) return true; const m = med(nb); return !(x > Math.max(3 * m, m + 60)); });
      if (ok.length) obs[h] = med(ok.map(y => y[1])); });
    const c = CITIES.find(x => x.id === cid);
    const aq = await get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${list.map(s => s.lat.toFixed(3)).join(",")}&longitude=${list.map(s => s.lon.toFixed(3)).join(",")}&hourly=pm2_5&past_days=${DAYS + 1}&forecast_days=1&timezone=GMT`);
    const A = Array.isArray(aq) ? aq : [aq], T = A[0].hourly.time, mod = {};
    T.forEach((t, i) => { const v = A.map(a => a.hourly.pm2_5[i]).filter(x => x != null); if (v.length) mod[t.slice(0, 13)] = mean(v); });
    const wx = await get(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&hourly=temperature_2m,wind_speed_10m,boundary_layer_height&past_days=${DAYS + 1}&forecast_days=1&wind_speed_unit=ms&timezone=GMT`);
    const off = (wx.utc_offset_seconds || 0) / 3600;   // GMT; местное время Кыргызстана = UTC+6
    const W = {}, WT = wx.hourly.time; WT.forEach((t, i) => { const T24 = mean(wx.hourly.temperature_2m.slice(Math.max(0, i - 23), i + 1).filter(x => x != null));
      W[t.slice(0, 13)] = { H: Math.max(0, (12 - T24) / 10), D: Math.min(4, 1 / (0.5 + (wx.hourly.wind_speed_10m[i] || 0)) * Math.sqrt(250 / Math.min(2000, Math.max(30, wx.hourly.boundary_layer_height[i] || 30)))), lh: (+t.slice(11, 13) + 6 - off + 24) % 24 }; });
    const X = h => { const w = W[h]; const x = [1, 0, 0, 0, 0]; x[1 + bin(w.lh)] = w.H * w.D; return x; };
    const keys = Object.keys(obs).filter(h => mod[h] != null && W[h]).sort();
    if (keys.length < 24 * 10) { console.log(cid, ": too few hours", keys.length); continue; }
    const fit = (t0, tgt) => ridge(keys.filter(h => h < t0 && h >= shift(t0, -WD * 24)).map(h => [X(h), obs[h] - tgt(h)]));
    // фон CAMS в сельских точках
    const rq = await get(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${RURAL.map(p => p[0]).join(",")}&longitude=${RURAL.map(p => p[1]).join(",")}&hourly=pm2_5&past_days=${DAYS + 1}&forecast_days=1&timezone=GMT`);
    const bg = {}; rq[0].hourly.time.forEach((t, i) => { const v = rq.map(r => r.hourly.pm2_5[i]).filter(x => x != null); if (v.length) bg[t.slice(0, 13)] = Math.min(...v); });
    const last = keys[keys.length - 1];
    const bInc = fit(shift(last, 1), h => mod[h]);
    const bBg = ridge(keys.filter(h => bg[h] != null).map(h => [X(h), obs[h] - bg[h]]));
    // честная проверка на последних 7 днях
    const errRaw = [], errNew = [], logE = { a: [], b: [], c: [], d: [] }, start = shift(last, -7 * 24);
    for (const t0 of keys.filter(h => h > start)) {
      const b = fit(t0, h => mod[h]), f = h => Math.max(0.5, mod[h] + X(h).reduce((s, v, i) => s + v * b[i], 0));
      const e0 = L1(obs[t0]) - L1(f(t0));
      for (let L = 0; L < 48; L++) { const h = shift(t0, L); if (obs[h] == null || mod[h] == null || !W[h]) continue;
        const p = Math.exp(L1(f(h)) + e0 * Math.exp(-L / TAU)) - 1; if (L <= 24) { errRaw.push(Math.abs(mod[h] - obs[h])); errNew.push(Math.abs(p - obs[h])); }
        logE[L <= 2 ? "a" : L <= 6 ? "b" : L <= 24 ? "c" : "d"].push(L1(obs[h]) - L1(p)); }
    }
    const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s.length ? +s[Math.min(s.length - 1, Math.floor(p * s.length))].toFixed(2) : null; };
    out.cities[cid] = { sensors: list.length, hours: keys.length, bInc: bInc.map(v => +v.toFixed(3)), bBg: bBg.map(v => +v.toFixed(3)),
      band: Object.fromEntries(Object.entries(logE).map(([k, a]) => [k, [q(a, 0.1), q(a, 0.9)]])),
      check: { days: 7, lead: "0–24 h", n: errNew.length, maeRaw: +mean(errRaw).toFixed(2), maeNew: +mean(errNew).toFixed(2) } };
    console.log(cid, JSON.stringify(out.cities[cid]));
  }
  if (!Object.keys(out.cities).length) { console.log("no city with enough sensors — coeffs.json not changed"); return; }
  const bc = out.cities.bishkek || Object.values(out.cities)[0];
  out.transfer = { from: out.cities.bishkek ? "bishkek" : Object.keys(out.cities)[0], bBg: bc.bBg, f: 0.8, lo: 0.35, hi: 1.6 };
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
})().catch(e => { console.error(e); process.exit(1); });
function shift(h, n) { return new Date(Date.parse(h + ":00:00Z") + n * 36e5).toISOString().slice(0, 13); }
