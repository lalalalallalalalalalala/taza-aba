/* Таза Аба — «История и статистика» (ленивый модуль, грузится только при открытии #history).
 * Данные: Open-Meteo Air Quality (модель CAMS), past_days=92, по координатам выбранного района; сравнение районов — past_days=7.
 * Это модельные значения, не измерения датчиков. Кэш в localStorage с меткой времени (1 ч), при ошибке — честно показываем кэш или ошибку. */
"use strict";
const HIST_T = {   // v49: было HT — конфликт с const HT из hero.js (SyntaxError, #history не открывался)
  ru: { distZones: "Модель CAMS (ячейка ~11–40 км) делит город всего на {k} зоны — внутри зоны у всех районов одно и то же значение. Разницу между соседними районами могут показать только наземные датчики.", distGrp: "районов: {c}", distSame: "Модель CAMS (ячейка ~11–40 км) почти не различает районы: средний AQI за 7 дней во всех {n} районах — {r}. Разницу между районами могут показать только наземные датчики.", distAll: "Показать все районы ({n})", title: "История и статистика", sub: "Как менялся воздух в районе {d}", src: "Модель CAMS (Open-Meteo), а не измерения датчиков · часовые значения US AQI и PM2.5", r24: "24 ч", r7: "7 дней", r30: "30 дней", r90: "90 дней",
    avg: "Средний AQI", min: "Минимум", max: "Максимум", chart24: "AQI по часам за последние 24 ч", chartH: "AQI по часам", chartD: "Средний AQI по дням", cats: "Дни по категориям (средний AQI за сутки)",
    byHour: "В какое время суток хуже (средний AQI по часам 0–23)", byWd: "По дням недели (средний AQI)", peak: "Пик в среднем около {h}:00, чище всего около {l}:00.",
    who: "Норма ВОЗ по PM2.5", whoTxt: "Дней выше нормы ВОЗ (PM2.5 > 15 мкг/м³ в среднем за сутки): <b>{n} из {t}</b>", whoAvg: "Средний PM2.5 за период: {v} мкг/м³ — в {x} раза выше нормы ВОЗ", whoOk: "Средний PM2.5 за период: {v} мкг/м³ — в пределах нормы ВОЗ",
    dist: "Сравнение районов: средний AQI за 7 дней", distNote: "{n} районов, модель CAMS", you: "ваш район", days: "дн.", pm25: "PM2.5", pm10: "PM10", no2: "NO₂",
    loading: "Загружаю историю…", err: "Не удалось загрузить историю", errSub: "Сервис Open-Meteo не ответил. Попробуйте ещё раз чуть позже.", offline: "Нет сети — история загрузится, когда появится связь.",
    cached: "Сохранённые данные от {t}", empty: "Для этого периода данных нет.", retry: "Повторить", wd: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], back: "← Главная", noSc: "Датчики Sensor.Community здесь не используются: их суточный архив слишком тяжёлый для телефона." },
  ky: { distZones: "CAMS модели (~11–40 км тор) шаарды болгону {k} зонага бөлөт — зонанын ичинде бардык райондордо бир эле маани. Коңшу райондордун айырмасын жердеги датчиктер гана көрсөтө алат.", distGrp: "{c} район", distSame: "CAMS модели (~11–40 км тор) райондорду дээрлик айырмалабайт: 7 күндүк орточо AQI бардык {n} райондо — {r}. Райондордун айырмасын жердеги датчиктер гана көрсөтө алат.", distAll: "Бардык райондорду көрсөтүү ({n})", title: "Тарых жана статистика", sub: "{d} районундагы аба кандай өзгөргөн", src: "CAMS модели (Open-Meteo), датчиктердин өлчөөсү эмес · US AQI жана PM2.5 сааттык маанилери", r24: "24 саат", r7: "7 күн", r30: "30 күн", r90: "90 күн",
    avg: "Орточо AQI", min: "Минимум", max: "Максимум", chart24: "Акыркы 24 сааттагы AQI", chartH: "Сааттар боюнча AQI", chartD: "Күндөр боюнча орточо AQI", cats: "Категориялар боюнча күндөр (суткалык орточо AQI)",
    byHour: "Сутканын кайсы убагында начар (0–23 сааттар боюнча орточо AQI)", byWd: "Жуманын күндөрү боюнча (орточо AQI)", peak: "Орто эсеп менен эң начары {h}:00 чамасында, эң тазасы {l}:00 чамасында.",
    who: "ДССУнун PM2.5 ченеми", whoTxt: "ДССУ ченеминен жогору күндөр (суткалык орточо PM2.5 > 15 мкг/м³): <b>{t} күндүн {n}</b>", whoAvg: "Мезгилдеги орточо PM2.5: {v} мкг/м³ — ДССУ ченеминен {x} эсе жогору", whoOk: "Мезгилдеги орточо PM2.5: {v} мкг/м³ — ДССУ ченеминин чегинде",
    dist: "Райондорду салыштыруу: 7 күндүк орточо AQI", distNote: "{n} район, CAMS модели", you: "сиздин район", days: "күн", pm25: "PM2.5", pm10: "PM10", no2: "NO₂",
    loading: "Тарых жүктөлүүдө…", err: "Тарыхты жүктөө мүмкүн болгон жок", errSub: "Open-Meteo кызматы жооп берген жок. Бир аздан кийин кайра аракет кылыңыз.", offline: "Тармак жок — байланыш пайда болгондо тарых жүктөлөт.",
    cached: "Сакталган маалымат: {t}", empty: "Бул мезгил үчүн маалымат жок.", retry: "Кайталоо", wd: ["Дш", "Шш", "Шр", "Бш", "Жм", "Иш", "Жк"], back: "← Башкы бет", noSc: "Sensor.Community датчиктери бул жерде колдонулбайт: алардын суткалык архиви телефон үчүн өтө оор." },
  en: { distZones: "The CAMS model (~11–40 km grid) splits the city into only {k} zones — every district inside a zone gets the same value. Only ground sensors can show differences between neighbouring districts.", distGrp: "{c} districts", distSame: "The CAMS model (~11–40 km grid) barely distinguishes districts: the 7-day average AQI is {r} in all {n} districts. Only ground sensors can show differences between districts.", distAll: "Show all districts ({n})", title: "History & statistics", sub: "How the air has changed in {d}", src: "CAMS model (Open-Meteo), not sensor measurements · hourly US AQI and PM2.5", r24: "24 h", r7: "7 days", r30: "30 days", r90: "90 days",
    avg: "Average AQI", min: "Minimum", max: "Maximum", chart24: "Hourly AQI, last 24 h", chartH: "Hourly AQI", chartD: "Daily average AQI", cats: "Days by category (daily average AQI)",
    byHour: "Worst time of day (average AQI by hour 0–23)", byWd: "By day of week (average AQI)", peak: "On average the peak is around {h}:00, cleanest around {l}:00.",
    who: "WHO PM2.5 guideline", whoTxt: "Days above the WHO guideline (daily mean PM2.5 > 15 µg/m³): <b>{n} of {t}</b>", whoAvg: "Average PM2.5 for the period: {v} µg/m³ — {x}× the WHO guideline", whoOk: "Average PM2.5 for the period: {v} µg/m³ — within the WHO guideline",
    dist: "District comparison: 7-day average AQI", distNote: "{n} districts, CAMS model", you: "your district", days: "days", pm25: "PM2.5", pm10: "PM10", no2: "NO₂",
    loading: "Loading history…", err: "Couldn't load history", errSub: "Open-Meteo didn't respond. Please try again a bit later.", offline: "No network — history will load once you're back online.",
    cached: "Saved data from {t}", empty: "No data for this period.", retry: "Retry", wd: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], back: "← Home", noSc: "Sensor.Community sensors aren't used here: their daily archive is too heavy for a phone." },
  
};
const H = (k, v = {}) => { const x = (HIST_T[LANG] || HIST_T.ru)[k] ?? HIST_T.ru[k] ?? k; return typeof x === "string" ? x.replace(/\{(\w+)\}/g, (m, y) => v[y] ?? m) : x; };
const WHO_PM25 = 15, H_TTL = 3600e3;
const hist = { range: "7", st: {}, inflight: {} };
const hKey = (kind, id) => `tazaAba.hist.${CITY}.${kind}.${id}`;
function hGet(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } }
function hPut(k, data) { try { localStorage.setItem(k, JSON.stringify({ at: Date.now(), data })); } catch (e) { console.warn("hist cache:", e.message); } }

async function hLoadDistrict(d) {
  const k = hKey("d", d.id), c = hGet(k);
  if (c && Date.now() - c.at < H_TTL) return { ...c, fresh: true };
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${d.lat}&longitude=${d.lon}&hourly=us_aqi,pm2_5,pm10,nitrogen_dioxide&current=us_aqi&past_days=92&forecast_days=1&timezone=auto`;
  try {
    const r = await fetchJSON(url, 15000), h = r.hourly, now = r.current && r.current.time;
    const keep = h.time.map((tm, i) => (!now || tm <= now) ? i : -1).filter(i => i >= 0);
    const data = { t: keep.map(i => h.time[i]), aqi: keep.map(i => h.us_aqi[i]), pm25: keep.map(i => h.pm2_5[i]), pm10: keep.map(i => h.pm10[i]), no2: keep.map(i => h.nitrogen_dioxide[i]) };
    hPut(k, data); return { at: Date.now(), data, fresh: true };
  } catch (e) { if (c) return { ...c, fresh: false, err: e.message }; throw e; }
}
async function hLoadCity() {
  const k = hKey("c", "7d"), c = hGet(k);
  if (c && Date.now() - c.at < H_TTL) return { ...c, fresh: true };
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${DISTRICTS.map(d => d.lat).join(",")}&longitude=${DISTRICTS.map(d => d.lon).join(",")}&hourly=us_aqi,pm2_5&current=us_aqi&past_days=7&forecast_days=1&timezone=auto`;
  try {
    const res = await fetchJSON(url, 15000), arr = Array.isArray(res) ? res : [res];
    const data = {};
    DISTRICTS.forEach((d, i) => { const r = arr[i]; if (!r || !r.hourly) return; const now = r.current && r.current.time;
      const ix = r.hourly.time.map((tm, j) => (!now || tm <= now) ? j : -1).filter(j => j >= 0).slice(-168);
      data[d.id] = { aqi: hMean(ix.map(j => r.hourly.us_aqi[j])), pm25: hMean(ix.map(j => r.hourly.pm2_5[j])) }; });
    hPut(k, data); return { at: Date.now(), data, fresh: true };
  } catch (e) { if (c) return { ...c, fresh: false, err: e.message }; throw e; }
}
const hMean = a => { const v = a.filter(x => x != null && isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
function hLoad(force) {
  const d = byId(state.district), id = CITY + ":" + d.id;
  if (hist.inflight[id]) return hist.inflight[id];
  if (force) { localStorage.removeItem(hKey("d", d.id)); localStorage.removeItem(hKey("c", "7d")); }
  hist.st[id] = { status: "loading" };
  const p = Promise.allSettled([hLoadDistrict(d), hLoadCity()]).then(([a, b]) => {
    hist.st[id] = a.status === "fulfilled" ? { status: "ok", d: a.value, c: b.status === "fulfilled" ? b.value : null }
      : { status: "err", off: navigator.onLine === false, msg: a.reason && a.reason.message };
  }).finally(() => { delete hist.inflight[id]; if ((location.hash || "").startsWith("#history")) route(true); });
  hist.inflight[id] = p; return p;
}

/* ---- агрегаты ---- */
function hSlice(D, range) {
  const n = D.t.length, hrs = range === "24" ? 24 : +range * 24, from = Math.max(0, n - hrs);
  const o = {}; ["t", "aqi", "pm25", "pm10", "no2"].forEach(k => o[k] = D[k].slice(from)); return o;
}
function hDaily(S) {
  const by = {}; S.t.forEach((tm, i) => { const day = tm.slice(0, 10); (by[day] = by[day] || { aqi: [], pm25: [] }); by[day].aqi.push(S.aqi[i]); by[day].pm25.push(S.pm25[i]); });
  return Object.entries(by).filter(([, v]) => v.aqi.filter(x => x != null).length >= 12)   // неполные сутки (<12 ч) в дневную статистику не берём
    .map(([day, v]) => ({ day, aqi: hMean(v.aqi), pm25: hMean(v.pm25) }));
}
const hCol = v => v == null ? "#9993" : level(Math.round(v)).color;

/* ---- лёгкие SVG-графики ---- */
function svgBars(vals, labels, { h = 150, every = 1, unit = "", hi = -1 } = {}) {
  const W = innerWidth < 600 ? 380 : 640, P = 26, n = vals.length, mx = Math.max(50, ...vals.filter(v => v != null)) * 1.08, bw = (W - P - 4) / Math.max(1, n);
  const y = v => h - 18 - (v / mx) * (h - 30);
  const grid = [50, 100, 150, 200, 300].filter(g => g < mx).map(g => `<line x1="${P}" x2="${W}" y1="${y(g)}" y2="${y(g)}" class="hg"/><text x="${P - 4}" y="${y(g) + 3}" class="hl" text-anchor="end">${g}</text>`).join("");
  const bars = vals.map((v, i) => v == null ? "" : `<rect x="${(P + i * bw + bw * 0.12).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(bw * 0.76).toFixed(1)}" height="${(h - 18 - y(v)).toFixed(1)}" rx="${Math.min(3, bw / 4).toFixed(1)}" fill="${hCol(v)}"${i === hi ? ' class="hi"' : ""}><title>${esc(labels[i])}: ${Math.round(v)}${unit}</title></rect>`).join("");
  const lab = labels.map((l, i) => i % every ? "" : `<text x="${(P + i * bw + bw / 2).toFixed(1)}" y="${h - 4}" class="hl" text-anchor="middle">${esc(l)}</text>`).join("");
  return `<svg class="h-svg" viewBox="0 0 ${W} ${h}" role="img">${grid}${bars}${lab}</svg>`;
}
function svgLine(vals, labels, { h = 160, every = 24 } = {}) {
  const W = innerWidth < 600 ? 380 : 640, P = 26, n = vals.length, mx = Math.max(50, ...vals.filter(v => v != null)) * 1.08;
  const x = i => P + (i / Math.max(1, n - 1)) * (W - P - 4), y = v => h - 18 - (v / mx) * (h - 30);
  const grid = [50, 100, 150, 200, 300].filter(g => g < mx).map(g => `<line x1="${P}" x2="${W}" y1="${y(g)}" y2="${y(g)}" class="hg"/><text x="${P - 4}" y="${y(g) + 3}" class="hl" text-anchor="end">${g}</text>`).join("");
  let seg = "", pts = [];
  vals.forEach((v, i) => { if (v == null) { if (pts.length) seg += `<polyline points="${pts.join(" ")}" class="hline"/>`; pts = []; } else pts.push(x(i).toFixed(1) + "," + y(v).toFixed(1)); });
  if (pts.length) seg += `<polyline points="${pts.join(" ")}" class="hline"/>`;
  const dots = vals.map((v, i) => v != null && i % 6 === 0 ? `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="2.6" fill="${hCol(v)}"><title>${esc(labels[i])}: ${Math.round(v)}</title></circle>` : "").join("");
  const lab = labels.map((l, i) => i % every ? "" : `<text x="${x(i).toFixed(1)}" y="${h - 4}" class="hl" text-anchor="middle">${esc(l)}</text>`).join("");
  return `<svg class="h-svg" viewBox="0 0 ${W} ${h}" role="img">${grid}${seg}${dots}${lab}</svg>`;
}
const dLbl = day => day.slice(8, 10) + "." + day.slice(5, 7);

function viewHistory(el) {
  const d = byId(state.district), id = CITY + ":" + d.id, st = hist.st[id];
  const head = `<a href="#home" class="small h-back">${H("back")}</a><h1>📈 ${H("title")}</h1><p class="sub">${H("sub", { d: esc(dName(d)) })} · ${esc(tr(cityObj().name))}</p>`;
  if (!st || st.status === "loading") {
    el.innerHTML = head + `<div class="card"><b>${H("loading")}</b></div><div class="skeleton"></div>`;
    if (!st) hLoad(); return;
  }
  if (st.status === "err") {
    el.innerHTML = head + `<div class="card nodata"><div style="font-size:42px">${st.off ? "🌙" : "⏳"}</div><h1>${H("err")}</h1><p class="sub">${st.off ? H("offline") : H("errSub")}</p><button class="btn" id="hRetry">${H("retry")}</button></div>`;
    $("#hRetry", el).onclick = () => { hLoad(true); route(true); }; return;
  }
  const D = st.d.data, S = hSlice(D, hist.range), R = hist.range;
  if (!S.t.length) { el.innerHTML = head + `<div class="card muted">${H("empty")}</div>`; return; }
  const aq = S.aqi.filter(v => v != null), avg = hMean(aq), mn = Math.min(...aq), mx = Math.max(...aq);
  const days = hDaily(R === "24" ? hSlice(D, "7") : S);
  const statDays = R === "24" ? days.slice(-1) : days;
  // график
  let chart;
  if (R === "24") chart = `<h3>${H("chart24")}</h3>` + svgBars(S.aqi, S.t.map(tm => tm.slice(11, 13)), { every: 3 });
  else if (R === "7") chart = `<h3>${H("chartH")}</h3>` + svgLine(S.aqi, S.t.map(tm => dLbl(tm.slice(0, 10))), { every: 24 });
  else chart = `<h3>${H("chartD")}</h3>` + svgBars(days.map(x => x.aqi), days.map(x => dLbl(x.day)), { every: R === "30" ? 5 : 14 });
  // категории
  const cats = AQI_LEVELS.map(L => ({ L, n: statDays.filter(x => level(Math.round(x.aqi)) === L).length })).filter(c => c.n);
  const catHTML = statDays.length ? `<div class="h-cats">${cats.map(c => `<div class="h-cat" style="--c:${c.L.color};flex:${c.n}"><b>${c.n}</b><span>${esc(tr(c.L.name))}</span></div>`).join("")}</div>` : `<div class="small muted">${H("empty")}</div>`;
  // по часам суток и дням недели — по выбранному периоду (для 24 ч берём 7 дней, чтобы картина была устойчивой)
  const P = R === "24" ? hSlice(D, "7") : S, byH = Array.from({ length: 24 }, () => []), byW = Array.from({ length: 7 }, () => []);
  P.t.forEach((tm, i) => { const v = P.aqi[i]; if (v == null) return; byH[+tm.slice(11, 13)].push(v); const wd = (new Date(tm.slice(0, 10) + "T12:00:00Z").getUTCDay() + 6) % 7; byW[wd].push(v); });
  const hAvg = byH.map(hMean), wAvg = byW.map(hMean), hv = hAvg.map((v, i) => [v, i]).filter(x => x[0] != null);
  const pk = hv.reduce((m, x) => x[0] > m[0] ? x : m, [-1, 0]), lo = hv.reduce((m, x) => x[0] < m[0] ? x : m, [1e9, 0]);
  // ВОЗ
  const over = statDays.filter(x => x.pm25 != null && x.pm25 > WHO_PM25).length, pmAvg = hMean(S.pm25);
  const whoHTML = `<div class="h-who"><div>${H("whoTxt", { n: over, t: statDays.length })}</div><div class="h-whobar"><i style="width:${statDays.length ? (over / statDays.length * 100).toFixed(1) : 0}%"></i></div>
    <div class="small">${pmAvg == null ? "" : pmAvg > WHO_PM25 ? H("whoAvg", { v: fmt(pmAvg, 1), x: fmt(pmAvg / WHO_PM25, 1) }) : H("whoOk", { v: fmt(pmAvg, 1) })}</div></div>`;
  // районы
  let distHTML = "";
  if (st.c && st.c.data) {
    const rows = DISTRICTS.map(x => ({ d: x, v: st.c.data[x.id] && st.c.data[x.id].aqi })).filter(r => r.v != null).sort((a, b) => b.v - a.v);
    // v50: если модель даёт всем районам почти одно значение (разброс ≤ 2 AQI) — честная сводка вместо 128 одинаковых полос, список — по кнопке
    const lo = Math.round(Math.min(...rows.map(r => r.v))), hi = Math.round(Math.max(...rows.map(r => r.v)));
    const grp = []; rows.forEach(r => { const v = Math.round(r.v), g = grp.find(x => x.v === v); if (g) g.r.push(r); else grp.push({ v, r: [r] }); });
    const same = rows.length > 10 && (hi - lo <= 2 || grp.length <= 3);
    const grpHTML = !same ? "" : hi - lo <= 2 ? `<p class="h-same">${H("distSame", { n: rows.length, r: lo === hi ? lo : lo + "–" + hi })}</p>` :
      `<p class="h-same">${H("distZones", { k: grp.length })}</p><ul class="h-grp">${grp.map(g => { const mine = g.r.some(r => r.d.id === d.id), ex = g.r.slice(0, 4).map(r => esc(dName(r.d)));
        if (mine && !g.r.slice(0, 4).some(r => r.d.id === d.id)) ex.unshift(esc(dName(d)));
        return `<li class="${mine ? "me" : ""}"><b style="--c:${hCol(g.v)}">${g.v}</b><span><em class="h-gt"><strong>${H("distGrp", { c: g.r.length })}</strong>${mine ? ` · ${H("you")}` : ""}</em><small>${ex.join(", ")}${g.r.length > ex.length ? ", …" : ""}</small></span></li>`; }).join("")}</ul>`;
    const top = Math.max(...rows.map(r => r.v), 1), bot = Math.max(0, Math.min(...rows.map(r => r.v)) - 10);   // шкала от (мин − 10), чтобы разница была видна
    distHTML = `<div class="card"><h3>${H("dist")}</h3><div class="small muted">${H("distNote", { n: rows.length })}${st.c.fresh ? "" : " · " + H("cached", { t: fmtAt(st.c.at) })}</div>
      ${same ? `${grpHTML}<details class="h-all"><summary>${H("distAll", { n: rows.length })}</summary>` : ""}<ol class="h-rank">${rows.map((r, i) => `<li class="${r.d.id === d.id ? "me" : ""}"><span class="h-rn">${i + 1}</span><span class="h-rd">${esc(dName(r.d))}${r.d.id === d.id ? ` <small>· ${H("you")}</small>` : ""}</span><span class="h-rb"><i style="width:${(8 + (r.v - bot) / Math.max(1, top - bot) * 92).toFixed(1)}%;background:${hCol(r.v)}"></i></span><b>${Math.round(r.v)}</b></li>`).join("")}</ol>${same ? "</details>" : ""}</div>`;
  }
  const pol = k => { const v = hMean(S[k]); return v == null ? "—" : fmt(v, 1); };
  el.innerHTML = head + `
    <div class="h-tabs" role="tablist">${["24", "7", "30", "90"].map(r => `<button role="tab" aria-selected="${R === r}" class="${R === r ? "on" : ""}" data-hr="${r}">${H("r" + r)}</button>`).join("")}</div>
    ${st.d.fresh ? "" : `<div class="off-note">🗄️ ${H("cached", { t: fmtAt(st.d.at) })}</div>`}
    <div class="h-kpis"><div style="--c:${hCol(avg)}"><span>${H("avg")}</span><b>${Math.round(avg)}</b><small>${esc(tr(level(Math.round(avg)).name))}</small></div>
      <div style="--c:${hCol(mn)}"><span>${H("min")}</span><b>${Math.round(mn)}</b></div><div style="--c:${hCol(mx)}"><span>${H("max")}</span><b>${Math.round(mx)}</b></div>
      <div class="h-pol"><span>${H("pm25")} · ${H("pm10")} · ${H("no2")}</span><b>${pol("pm25")} · ${pol("pm10")} · ${pol("no2")}</b><small>µg/m³</small></div></div>
    <div class="card h-chart">${chart}</div>
    <div class="h-grid">
      <div class="card"><h3>${H("cats")}</h3>${catHTML}</div>
      <div class="card"><h3>${H("who")}</h3>${whoHTML}</div>
      <div class="card"><h3>${H("byHour")}</h3>${svgBars(hAvg, hAvg.map((_, i) => String(i)), { h: 130, every: 3, hi: pk[1] })}<div class="small">${hv.length ? H("peak", { h: pk[1], l: lo[1] }) : ""}</div></div>
      <div class="card"><h3>${H("byWd")}</h3>${svgBars(wAvg, H("wd"), { h: 130 })}</div>
    </div>
    ${distHTML}
    ${typeof histMeasuredHTML === "function" ? histMeasuredHTML(D) : ""}
    <div class="card h-src small">ℹ️ ${H("src")}. <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener">Open-Meteo</a> · CAMS / Copernicus. ${H("noSc")}</div>
    <div class="foot">${t("footProto")}</div>`;
  el.querySelectorAll("[data-hr]").forEach(b => b.onclick = () => { hist.range = b.dataset.hr; route(true); });
}
window.viewHistory = viewHistory;
