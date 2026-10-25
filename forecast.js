/* v57 — Таза Аба: точнее прогноз смога.
 * Города с датчиками (Бишкек): CAMS + поправка на печной дым по погоде (коэффициенты forecast/coeffs.json, считаются GitHub Actions
 *   по датчикам Sensor.Community за 14 дней) + «наукаст»: текущее отклонение датчиков от модели, затухает за ~6 ч.
 *   Районы без своих датчиков получают городскую поправку с весом по расстоянию до ближайшего датчика.
 * Города без датчиков (Нарын, Кочкор, Каракол…): CAMS почти не видит дым печей малых городов — в отопительный сезон добавляется
 *   оценка печного дыма (холод × застой воздуха × время суток), откалиброванная на Бишкеке, с осторожным множителем 0,8 и диапазоном.
 * Ничего не выдумываем: всё помечено как «оценка (модель)», показан диапазон; если коэффициенты устарели (> 72 ч) — только наукаст. */
(function () {
  "use strict";
  const DEF = { updated: "2026-10-25T12:45Z", tau: 6,
    cities: { bishkek: { bInc: [1.919, 11.072, 3.566, 0.619, 11.541], band: { a: [-0.32, 0.31], b: [-0.67, 0.68], c: [-0.94, 0.75], d: [-0.98, 0.59] }, check: { days: 7, n: 3900, maeRaw: 11.6, maeNew: 9.2 } } },
    transfer: { bBg: [7.537, 10.596, 3.294, 0.016, 11.619], f: 0.8, lo: 0.35, hi: 1.6 }, _def: true };
  let C = DEF;
  /* коэффициенты обновляет GitHub Actions в репозитории Pages; с других хостов (Surge, приложения) берём их оттуда, иначе — локальную копию */
  const PAGES = "https://zusenbaev7-cmd.github.io/taza-aba/forecast/coeffs.json", gj = u => fetch(u, { cache: "no-cache" }).then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)));
  (/github\.io$/.test(location.hostname) ? gj("forecast/coeffs.json") : gj(PAGES).catch(() => gj("forecast/coeffs.json"))).then(j => { if (j && j.cities) C = j; }).catch(() => {});
  const fresh = () => Date.now() - Date.parse(C.updated) < 72 * 36e5;
  const L1 = x => Math.log(Math.max(0, x) + 1), ex1 = y => Math.max(0, Math.exp(y) - 1);
  const TX = {
    ru: { sens: "Модель CAMS с поправкой по датчикам города ({n} шт.) — оценка", stove: "Оценка (модель + поправка на печной дым)", range: "PM2.5 вероятно {a}–{b} мкг/м³",
      noS: "датчиков рядом нет — вечером модель может занижать дым печей", acc: "Точность за {d} дн. (на сутки вперёд): ошибка ±{e} мкг/м³, без поправки было ±{r} · оценка (модель)",
      band: "Полоса — вероятный диапазон", accS: "Без датчиков точность проверить нельзя: печной дым оценён по холоду, ветру и слою перемешивания (калибровка по Бишкеку)" },
    ky: { sens: "CAMS модели шаардын датчиктери боюнча оңдолгон ({n} даана) — баалоо", stove: "Баалоо (модель + меш түтүнүнө оңдоо)", range: "PM2.5 болжол менен {a}–{b} мкг/м³",
      noS: "жакын жерде датчик жок — кечинде модель меш түтүнүн азайтып көрсөтүшү мүмкүн", acc: "{d} күндөгү тактык (бир сутка алдыга): ката ±{e} мкг/м³, оңдоосуз ±{r} болчу · баалоо (модель)",
      band: "Тилке — болжолдуу диапазон", accS: "Датчик жок болгондуктан тактыкты текшерүүгө болбойт: меш түтүнү суукка, шамалга жана аралашуу катмарына жараша бааланды (Бишкек боюнча калибровка)" },
    en: { sens: "CAMS model corrected by the city's sensors ({n}) — estimate", stove: "Estimate (model + stove-smoke correction)", range: "PM2.5 likely {a}–{b} µg/m³",
      noS: "no sensors nearby — in the evening the model may underestimate stove smoke", acc: "Accuracy over {d} days (24 h ahead): error ±{e} µg/m³, ±{r} without correction · estimate (model)",
      band: "Band = likely range", accS: "No sensors, so accuracy can't be checked: stove smoke is estimated from cold, wind and mixing height (calibrated on Bishkek)" } };
  const T = (k, p) => { const L = (typeof LANG !== "undefined" && TX[LANG]) ? LANG : "ru"; let s = TX[L][k] || TX.ru[k]; Object.entries(p || {}).forEach(([a, b]) => { s = s.split("{" + a + "}").join(b); }); return s; };
  const f1 = v => (Math.round(v * 10) / 10).toLocaleString((typeof LANG !== "undefined" && LANG === "en") ? "en" : "ru");
  const f0 = v => String(Math.round(v));
  const bin = h => h < 6 ? 0 : h < 11 ? 1 : h < 18 ? 2 : 3;
  /* признаки погоды на час tm (местное время): H — отопление, D — застой */
  function wxX(W, tm) {
    if (!W || !W.time) return null;
    let j = W.time.indexOf(tm);
    if (j < 0) { const hh = tm.slice(11, 13); for (let k = W.time.length - 1; k >= 0; k--) if (W.time[k].slice(11, 13) === hh) { j = k; break; } }
    if (j < 0) return null;
    const ts = W.temperature_2m.slice(Math.max(0, j - 23), j + 1).filter(v => v != null); if (!ts.length) return null;
    const T24 = ts.reduce((s, v) => s + v, 0) / ts.length, ws = W.wind_speed_10m ? W.wind_speed_10m[j] : null, bl = W.boundary_layer_height ? W.boundary_layer_height[j] : null;
    const H = Math.max(0, (12 - T24) / 10), D = Math.min(4, 1 / (0.5 + (ws || 0)) * Math.sqrt(250 / Math.min(2000, Math.max(30, bl || 30))));
    const x = [1, 0, 0, 0, 0]; x[1 + bin(+tm.slice(11, 13))] = H * D; return { x, H };
  }
  /* без датчиков: сглаживаем ступеньки между периодами суток (среднее по соседним часам ±1) */
  function smooth(W, tm, b) { const t0 = Date.parse(tm + ":00Z"); let s = 0, n = 0;
    [-1, 0, 1].forEach(k => { const t2 = new Date(t0 + k * 36e5).toISOString().slice(0, 16), X = wxX(W, t2); if (X) { s += dot(X.x, b); n++; } }); return n ? s / n : 0; }
  const dot = (x, b) => x.reduce((s, v, i) => s + v * (b[i] || 0), 0);
  const kmD = (a, b) => typeof kmDist === "function" ? kmDist(a, b) : 999;
  function cityId() { try { return typeof CITY !== "undefined" ? CITY : null; } catch (e) { return null; } }
  function apply() {
    if (typeof air === "undefined" || !air.byDistrict) return;
    const W = air.wxH, cid = cityId(), cc = (typeof cityObj === "function" && cityObj().center) || null;
    const sens = (air.sensors || []).filter(s => s.p2 != null && (!cc || kmD({ lat: cc[0], lon: cc[1] }, s) <= 25));
    const cc0 = C.cities && C.cities[cid], useInc = cc0 && fresh() ? cc0.bInc : null;
    const band = (cc0 && cc0.band) || DEF.cities.bishkek.band;
    const ds = Object.entries(air.byDistrict).filter(([, r]) => r && !r.fc && Array.isArray(r.pmH) && r.time);
    if (!ds.length) return;
    let e0c = null;
    if (sens.length) {   // городское отклонение: медиана датчиков против модели (+поправка) в ближайших районах
      const r0 = ds[0][1], tm0 = (r0.currentTime || "").slice(0, 13) + ":00", X0 = useInc ? wxX(W, tm0) : null, s0 = X0 ? dot(X0.x, useInc) : 0;
      const mv = sens.map(s => { let b = null; ds.forEach(([id, r]) => { const d = typeof byId === "function" ? byId(id) : null; if (!d || r.model == null || r.model.pm25 == null) return; const k = kmD(d, s); if (!b || k < b.k) b = { k, v: r.model.pm25 }; }); return b ? b.v : null; }).filter(v => v != null);
      if (mv.length) e0c = Math.max(-1.5, Math.min(1.5, L1(median(sens.map(s => s.p2))) - L1(Math.max(0.5, mv.reduce((a, b) => a + b, 0) / mv.length + s0))));
    }
    const tr = C.transfer || DEF.transfer;
    ds.forEach(([id, r]) => {
      const d = typeof byId === "function" ? byId(id) : null, tm0 = (r.currentTime || "").slice(0, 13) + ":00", i0 = r.time.indexOf(tm0);
      if (i0 < 0) return;
      const P = r.pmH.slice(), lo = [], hi = [];
      if (sens.length) {
        let e0 = null, w = 1;
        const S = i => { if (!useInc || i < i0) return 0; const X = wxX(W, r.time[i]); return X ? Math.min(60, Math.max(0, dot(X.x, useInc))) : 0; };   // прошедшие часы — как было (модель), поправка только вперёд
        const base = i => P[i] == null ? null : Math.max(0.5, P[i] + S(i));
        if (r.src === "sensors" && r.pm25 != null && base(i0) != null) e0 = Math.max(-1.5, Math.min(1.5, L1(r.pm25) - L1(base(i0))));
        else if (e0c != null && d) { const dn = Math.min(...sens.map(s => kmD(d, s))); w = Math.exp(-dn / 8); e0 = e0c * w; }
        const out = r.pmH.map((_, i) => { const b = base(i); if (b == null) return null; const L = i - i0; return ex1(L1(b) + (L >= 0 && e0 != null ? e0 * Math.exp(-L / (C.tau || 6)) : 0)); });
        out.forEach((v, i) => { const L = i - i0, q = L < 0 ? null : band[L <= 2 ? "a" : L <= 6 ? "b" : L <= 24 ? "c" : "d"] || band.d; lo[i] = v == null || !q ? null : ex1(L1(v) + q[0]); hi[i] = v == null || !q ? null : ex1(L1(v) + q[1]); });
        r.pmH = out.map(v => v == null ? null : Math.round(v * 10) / 10);
        r.fc = { kind: "sens", n: sens.length, w: Math.round(w * 100) / 100, inc: !!useInc };
      } else {
        let any = false;
        const out = P.map((v, i) => { if (v == null) return null; const X = wxX(W, r.time[i]); if (!X || X.H <= 0) { lo[i] = hi[i] = v; return v; }
          const b = tr.bBg.slice(); b[0] *= Math.min(1, X.H / 0.3); const s = Math.min(60, Math.max(0, smooth(W, r.time[i], b))); if (s >= 1) any = true;
          lo[i] = v + (tr.lo || 0.35) * s; hi[i] = v + (tr.hi || 1.6) * s; return v + (tr.f || 0.8) * s; });
        if (!any) return;
        r.pmH = out.map(v => v == null ? null : Math.round(v * 10) / 10);
        r.fc = { kind: "stove" };
      }
      r.fcLo = lo.map(v => v == null ? null : Math.round(v * 10) / 10); r.fcHi = hi.map(v => v == null ? null : Math.round(v * 10) / 10);
      if (r.src === "model" && r.pmH[i0] != null) {   // текущее значение района (без своих датчиков) — тоже с поправкой
        const dP = r.pmH[i0] - (r.pm25 != null ? r.pm25 : r.pmH[i0]);
        r.pm25 = r.pmH[i0]; r.aqi = pm25ToAqi(r.pm25); if (r.pol && r.pol.pm25) r.pol.pm25 = [r.pm25, r.aqi, "model"];
        /* v58: дым — мелкие частицы, они входят и в PM10: та же добавка к PM10 модели, и PM10 никогда не меньше PM2.5 */
        if (r.pm10 != null) { r.pm10 = Math.round(Math.max(r.pm25, r.pm10 + dP) * 10) / 10; if (r.pol && r.pol.pm10 && typeof pm10ToAqi === "function") r.pol.pm10 = [r.pm10, pm10ToAqi(r.pm10), "model"]; }
        r.fc.lo = r.fcLo[i0]; r.fc.hi = r.fcHi[i0];
      }
    });
  }
  window.tazaFcApply = apply;
  if (typeof saveAirCache === "function") { const o = saveAirCache; window.saveAirCache = function () { try { apply(); } catch (e) { console.warn("forecast fc:", e.message); } return o.apply(this, arguments); }; }
  if (typeof srcLabel === "function") { const o = srcLabel; window.srcLabel = function (a, d) { const s = o(a, d); if (!a || !a.fc || a.src !== "model") return s;
    if (a.fc.kind === "stove") return "🔥 " + T("stove") + (a.fc.lo != null ? " · " + T("range", { a: f0(a.fc.lo), b: f0(a.fc.hi) }) : "") + " · " + T("noS") + (d && d.approx && typeof t === "function" ? " · " + t("coordApprox") : "");
    return "📡 " + T("sens", { n: a.fc.n }) + (a.fc.lo != null ? " · " + T("range", { a: f0(a.fc.lo), b: f0(a.fc.hi) }) : "") + (d && d.approx && typeof t === "function" ? " · " + t("coordApprox") : ""); }; }
  /* полоса неопределённости на почасовом графике главной + честная строка точности */
  function decorate(el) {
    try {
      const d = typeof byId === "function" && typeof state !== "undefined" ? byId(state.district) : null, a = d && air.byDistrict[d.id];
      const bars = el.querySelector(".bars"); if (!a || !a.fc || !bars || !a.fcLo) return;
      const today = (a.currentTime || "").slice(0, 10), idx = a.time.map((tm, i) => [tm, i]).filter(([tm]) => tm.startsWith(today));
      const mx = Math.max(15, ...idx.map(([, i]) => Math.max(a.pmH[i] || 0, a.fcHi[i] || 0))), kids = bars.children;
      idx.forEach(([, i], k) => { const b = kids[k]; if (b && a.pmH[i] != null) b.style.height = Math.max(6, a.pmH[i] / mx * 100) + "%"; });   // масштаб с учётом верхней границы полосы
      bars.classList.add("fc-on");
      idx.forEach(([, i], k) => { const b = kids[k], v = a.pmH[i], l = a.fcLo[i], h = a.fcHi[i]; if (!b || v == null || l == null || h == null || h - l < 0.2) return;
        const z = document.createElement("i"); z.className = "fc-band"; z.style.bottom = Math.max(6, l / mx * 100) + "%"; z.style.height = Math.max(2, (h - l) / mx * 100) + "%"; bars.appendChild(z);
        z.style.left = (b.offsetLeft) + "px"; z.style.width = b.offsetWidth + "px"; b.title += ` · ${f0(l)}–${f0(h)}`; });
      const ck = C.cities && C.cities[cityId()] && C.cities[cityId()].check, ax = bars.parentElement.querySelector(".bars-x");
      if (ax && !bars.parentElement.querySelector(".fc-acc")) { const p = document.createElement("p"); p.className = "small muted fc-acc";
        p.textContent = (a.fc.kind === "sens" && ck ? T("acc", { d: ck.days, e: f1(ck.maeNew), r: f1(ck.maeRaw) }) : a.fc.kind === "stove" ? T("noS") + ". " + T("accS") : "") + " · " + T("band");
        ax.after(p); }
    } catch (e) { console.warn("fc band:", e.message); }
  }
  if (typeof views !== "undefined" && views.home) { const o = views.home; views.home = function (el) { const r = o.apply(this, arguments); requestAnimationFrame(() => decorate(el || document.getElementById("view"))); return r; }; }
})();
