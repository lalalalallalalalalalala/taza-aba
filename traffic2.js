/* «Транспорт и смог» v2: индекс нагрузки дорог (оценка) = структура сети OSM × NO₂ модели CAMS по часам.
 * Почему: сетка CAMS грубая (~40 км в КР), один NO₂ на весь город → все улицы были одного цвета.
 * Индекс различает дороги по классу, полосам, близости к центру и крупным перекрёсткам (OSM), а NO₂ CAMS задаёт общий уровень и суточный ход.
 * Это ОЦЕНКА, не измерение. Измерения (Sensor.Community — PM2.5; станции при наличии ключей) показываются отдельно. */
"use strict";
const TF2_T = {
  ru: { min: "мин", leg: "Индекс нагрузки × NO₂ (оценка)", hour: "Время суток", now: "сейчас", hNote: "NO₂ CAMS: среднее за последние 3 суток в этот час", lo: "низкая", hi: "высокая",
    st: "Дорог из OSM: {n} · индекс 0–100+", only: "Только нагрузка дорог (без NO₂)", noSnap: "Для этого города нет встроенного снимка дорог OSM.", load: "Загрузить дороги из OSM", loading: "Загружаем дороги…", err: "Не удалось загрузить дороги.",
    pClass: "Класс", pLanes: "Полос", pLoad: "Нагрузка (оценка)", pNo2: "NO₂ CAMS ({h})", pIdx: "Индекс", pD: "Район модели",
    cls: { motorway: "автомагистраль", trunk: "магистраль", primary: "главная улица", secondary: "второстепенная", tertiary: "районная" },
    sens: "📡 Измерения: {n} датчиков PM2.5 Sensor.Community", sensNone: "📡 Свежих открытых измерений рядом нет. Открытых измерений NO₂ на улицах в КР нет — поэтому индекс модельный.", sensNo2: "Датчики Sensor.Community меряют частицы PM2.5/PM10, а не NO₂.",
    howH: "Как считается индекс нагрузки", how: "<p><b>Это оценка, а не измерение трафика.</b> Для каждой дороги из OpenStreetMap:</p><ul><li><b>Класс</b> W: автомагистраль 1,0 · магистраль 0,9 · главная 0,75 · второстепенная 0,55 · районная 0,35;</li><li><b>Полосы</b> Ln = 0,7 + 0,15 × полос (от 0,85 до 1,3; если не указано — 1);</li><li><b>Центр</b> C = 0,5 + 0,5 × e<sup>−d/R</sup>, d — расстояние до центра города, R — масштаб города;</li><li><b>Перекрёстки</b> J = 0,8 + 0,4 × min(1, n/6), n — крупные перекрёстки в радиусе 500 м.</li></ul><p>Нагрузка = 100 × W·Ln·C·J / максимум по городу. <b>Индекс = нагрузка × NO₂ / 25</b>, где NO₂ — значение модели CAMS (Open-Meteo) в ближайшем районе в выбранный час, 25 мкг/м³ — суточная норма ВОЗ. Ползунок времени показывает разницу между часом пик и ночью.</p><p>Ограничения: нет данных о реальном потоке машин и пробках; CAMS не различает отдельные улицы.</p>", cLeg: "Загруженность улиц (оценка)", c1: "свободно", c5: "пробка", mode: "Что показывать", mCong: "Пробки (оценка)", mNo2: "Пробки × NO₂ (смог от транспорта)", mLoad: "Только структура дорог", day: "День", dAuto: "сегодня", dWk: "будний", dSat: "суббота", dSun: "воскресенье", live: "🚦 Живые пробки", liveKey: "Нужен бесплатный ключ TomTom (developer.tomtom.com → TOMTOM_KEY в config.js).", liveKG: "TomTom не покрывает Кыргызстан (нет в списке покрытия Traffic API) — для КР показываем оценку.", liveOn: "Живые данные: TomTom Traffic Flow (относительная скорость к свободному потоку).", srcEst: "Источник цвета: оценка — OSM (класс, полосы, скорость, центр, перекрёстки) × типичный суточный профиль × размер города. Не измерение.", srcLive: "Источник цвета: живые данные TomTom поверх оценки.", pCong: "Загруженность (оценка)", pMs: "Ограничение", pOw: "одностороннее", mean: "Средняя загруженность по городу: {v} %", cls2: {"unclassified": "улица", "residential": "жилая улица"}, howC: "<p><b>Загруженность — оценка, не измерение.</b> c = P(час, день) × S(город) × F(улица), не ниже 3 %.</p><ul><li><b>P</b> — типичный суточный профиль городских пробок (модель проекта, доля от вечернего пика): ночью 1–5 ч 10–20 %, утренний пик 8 ч ≈ 95 %, днём 11–16 ч 64–70 %, вечерний пик 17–19 ч — максимум 100 %; суббота ниже и позже (пик ≈ 80 % около 18 ч), воскресенье ≈ 85 % субботы.</li><li><b>S</b> — размер города по длине главных улиц в OSM: Бишкек = 1, крупные города ≈ 0,8–0,9, малые ≈ 0,45–0,6.</li><li><b>F</b> — улица: класс (главная 1 · магистраль 0,95 · второстепенная 0,85 · автомагистраль 0,8 · районная 0,65 · улица 0,45 · жилая 0,4) × полосы × близость к центру × плотность крупных перекрёстков (узкие места) × скорость (≥ 80 км/ч — 0,85); в Бишкеке центральные артерии (Чуй, Манаса, Жибек Жолу, Советская/Байтик Баатыра, Ахунбаева, Жал) × 1,15. Нормировка по 95-му процентилю.</li></ul><p>Живых данных о пробках по Кыргызстану в открытом доступе нет: TomTom не покрывает КР; 2ГИС и Яндекс показывают пробки только в своих картах по своим условиям.</p>" },
  ky: { min: "мүн", leg: "Жүк индекси × NO₂ (баалоо)", hour: "Сутканын убагы", now: "азыр", hNote: "NO₂ CAMS: акыркы 3 сутканын ушул саатындагы орточосу", lo: "төмөн", hi: "жогору",
    st: "OSMден жолдор: {n} · индекс 0–100+", only: "Жолдордун жүгү гана (NO₂сиз)", noSnap: "Бул шаар үчүн OSM жолдорунун орнотулган сүрөтү жок.", load: "Жолдорду OSMден жүктөө", loading: "Жолдор жүктөлүүдө…", err: "Жолдорду жүктөө мүмкүн болгон жок.",
    pClass: "Классы", pLanes: "Тилкелер", pLoad: "Жүк (баалоо)", pNo2: "NO₂ CAMS ({h})", pIdx: "Индекс", pD: "Моделдин районе",
    cls: { motorway: "автомагистраль", trunk: "магистраль", primary: "башкы көчө", secondary: "экинчи даражалуу", tertiary: "райондук" },
    sens: "📡 Өлчөөлөр: Sensor.Community'нин {n} PM2.5 датчиги", sensNone: "📡 Жакын жерде жаңы ачык өлчөөлөр жок. КРда көчөлөрдөгү NO₂ боюнча ачык өлчөөлөр жок — ошондуктан индекс моделдик.", sensNo2: "Sensor.Community датчиктери NO₂ эмес, PM2.5/PM10 бөлүкчөлөрүн өлчөйт.",
    howH: "Жүк индекси кантип эсептелет", how: "<p><b>Бул баалоо, трафикти өлчөө эмес.</b> OpenStreetMap'тагы ар бир жол үчүн:</p><ul><li><b>Классы</b> W: автомагистраль 1,0 · магистраль 0,9 · башкы 0,75 · экинчи даражалуу 0,55 · райондук 0,35;</li><li><b>Тилкелер</b> Ln = 0,7 + 0,15 × тилке (0,85тен 1,3кө чейин; көрсөтүлбөсө — 1);</li><li><b>Борбор</b> C = 0,5 + 0,5 × e<sup>−d/R</sup>, d — шаардын борборуна чейинки аралык, R — шаардын масштабы;</li><li><b>Кесилиштер</b> J = 0,8 + 0,4 × min(1, n/6), n — 500 м радиустагы ири кесилиштер.</li></ul><p>Жүк = 100 × W·Ln·C·J / шаар боюнча максимум. <b>Индекс = жүк × NO₂ / 25</b>, мында NO₂ — тандалган саатта жакынкы райондогу CAMS моделинин (Open-Meteo) мааниси, 25 мкг/м³ — ДССУнун суткалык ченеми. Убакыт сыдыргычы эң көп каттам саат менен түндүн айырмасын көрсөтөт.</p><p>Чектөөлөр: машинелердин чыныгы агымы жана тыгындар тууралуу маалымат жок; CAMS өзүнчө көчөлөрдү айырмалабайт.</p>", cLeg: "Көчөлөрдүн жүктөлүшү (баалоо)", c1: "бош", c5: "тыгын", mode: "Эмнени көрсөтүү", mCong: "Тыгындар (баалоо)", mNo2: "Тыгындар × NO₂ (транспорттон түтүн)", mLoad: "Жолдордун түзүлүшү гана", day: "Күн", dAuto: "бүгүн", dWk: "иш күнү", dSat: "ишемби", dSun: "жекшемби", live: "🚦 Жандуу тыгындар", liveKey: "TomTom'дун акысыз ачкычы керек (developer.tomtom.com → config.js'теги TOMTOM_KEY).", liveKG: "TomTom Кыргызстанды камтыбайт (Traffic API камтуу тизмесинде жок) — КР үчүн баалоо көрсөтүлөт.", liveOn: "Жандуу маалымат: TomTom Traffic Flow (эркин агымга салыштырмалуу ылдамдык).", srcEst: "Түстүн булагы: баалоо — OSM (класс, тилкелер, ылдамдык, борбор, кесилиштер) × типтүү суткалык профиль × шаардын көлөмү. Өлчөө эмес.", srcLive: "Түстүн булагы: баалоонун үстүндө TomTom'дун жандуу маалыматы.", pCong: "Жүктөлүш (баалоо)", pMs: "Чектөө", pOw: "бир тараптуу", mean: "Шаар боюнча орточо жүктөлүш: {v} %", cls2: {"unclassified": "көчө", "residential": "турак жай көчөсү"}, howC: "<p><b>Жүктөлүш — баалоо, өлчөө эмес.</b> c = P(саат, күн) × S(шаар) × F(көчө), 3 %дан кем эмес.</p><ul><li><b>P</b> — шаардык тыгындардын типтүү суткалык профили (долбоордун модели, кечки чокудан үлүш): түнкүсүн 1–5 саатта 10–20 %, эртең мененки чоку 8де ≈ 95 %, күндүз 11–16 саатта 64–70 %, кечки чоку 17–19да — эң жогору 100 %; ишемби төмөн жана кечирээк (чоку ≈ 80 % саат 18 чамасында), жекшемби ≈ ишембинин 85 %ы.</li><li><b>S</b> — OSMдеги башкы көчөлөрдүн узундугу боюнча шаардын көлөмү: Бишкек = 1, ири шаарлар ≈ 0,8–0,9, кичине шаарлар ≈ 0,45–0,6.</li><li><b>F</b> — көчө: класс (башкы 1 · магистраль 0,95 · экинчи даражалуу 0,85 · автомагистраль 0,8 · райондук 0,65 · көчө 0,45 · турак жай 0,4) × тилкелер × борборго жакындык × ири кесилиштердин тыгыздыгы (тар жерлер) × ылдамдык (≥ 80 км/с — 0,85); Бишкекте борбордук артериялар (Чүй, Манас, Жибек Жолу, Советская/Байтик Баатыр, Ахунбаев, Жал) × 1,15. 95-процентиль боюнча нормалдаштыруу.</li></ul><p>Кыргызстан боюнча тыгындар тууралуу жандуу ачык маалымат жок: TomTom КРды камтыбайт; 2ГИС жана Яндекс тыгындарды өз карталарында гана өз шарттары менен көрсөтөт.</p>" },
  en: { min: "min", leg: "Load index × NO₂ (estimate)", hour: "Time of day", now: "now", hNote: "CAMS NO₂: mean of the last 3 days at this hour", lo: "low", hi: "high",
    st: "Roads from OSM: {n} · index 0–100+", only: "Road load only (without NO₂)", noSnap: "No bundled OSM road snapshot for this city.", load: "Load roads from OSM", loading: "Loading roads…", err: "Couldn't load roads.",
    pClass: "Class", pLanes: "Lanes", pLoad: "Load (estimate)", pNo2: "CAMS NO₂ ({h})", pIdx: "Index", pD: "Model district",
    cls: { motorway: "motorway", trunk: "trunk road", primary: "primary street", secondary: "secondary street", tertiary: "local street" },
    sens: "📡 Measurements: {n} Sensor.Community PM2.5 sensors", sensNone: "📡 No fresh open measurements nearby. There are no open street-level NO₂ measurements in Kyrgyzstan — hence a modelled index.", sensNo2: "Sensor.Community sensors measure PM2.5/PM10 particles, not NO₂.",
    howH: "How the load index is calculated", how: "<p><b>This is an estimate, not a traffic measurement.</b> For every OpenStreetMap road:</p><ul><li><b>Class</b> W: motorway 1.0 · trunk 0.9 · primary 0.75 · secondary 0.55 · tertiary 0.35;</li><li><b>Lanes</b> Ln = 0.7 + 0.15 × lanes (0.85–1.3; 1 if unknown);</li><li><b>Centre</b> C = 0.5 + 0.5 × e<sup>−d/R</sup>, d = distance to the city centre, R = city scale;</li><li><b>Junctions</b> J = 0.8 + 0.4 × min(1, n/6), n = major junctions within 500 m.</li></ul><p>Load = 100 × W·Ln·C·J / city maximum. <b>Index = load × NO₂ / 25</b>, where NO₂ is the CAMS model value (Open-Meteo) in the nearest district at the selected hour and 25 µg/m³ is the WHO 24-hour guideline. The time slider shows rush hour vs night.</p><p>Limits: no real vehicle counts or congestion data; CAMS does not resolve individual streets.</p>", cLeg: "Street congestion (estimate)", c1: "free", c5: "jam", mode: "Show", mCong: "Congestion (estimate)", mNo2: "Congestion × NO₂ (traffic smog)", mLoad: "Road structure only", day: "Day", dAuto: "today", dWk: "weekday", dSat: "Saturday", dSun: "Sunday", live: "🚦 Live traffic", liveKey: "Needs a free TomTom key (developer.tomtom.com → TOMTOM_KEY in config.js).", liveKG: "TomTom does not cover Kyrgyzstan (not in the Traffic API coverage list) — Kyrgyz cities show the estimate.", liveOn: "Live data: TomTom Traffic Flow (speed relative to free flow).", srcEst: "Colour source: estimate — OSM (class, lanes, speed, centre, junctions) × typical daily profile × city size. Not a measurement.", srcLive: "Colour source: live TomTom data on top of the estimate.", pCong: "Congestion (estimate)", pMs: "Speed limit", pOw: "one-way", mean: "City-wide mean congestion: {v}%", cls2: {"unclassified": "street", "residential": "residential street"}, howC: "<p><b>Congestion is an estimate, not a measurement.</b> c = P(hour, day) × S(city) × F(street), never below 3%.</p><ul><li><b>P</b> — a typical daily urban congestion profile (project model, share of the evening peak): 10–20% at night 1–5 h, morning peak at 8 h ≈ 95%, midday 11–16 h 64–70%, evening peak 17–19 h is the maximum (100%); Saturday lower and later (peak ≈ 80% around 18 h), Sunday ≈ 85% of Saturday.</li><li><b>S</b> — city size from the length of main streets in OSM: Bishkek = 1, large cities ≈ 0.8–0.9, small towns ≈ 0.45–0.6.</li><li><b>F</b> — street: class (primary 1 · trunk 0.95 · secondary 0.85 · motorway 0.8 · tertiary 0.65 · unclassified 0.45 · residential 0.4) × lanes × closeness to the centre × density of major junctions (bottlenecks) × speed (≥ 80 km/h → 0.85); in Bishkek the central arteries (Chui, Manas, Jibek Jolu, Sovetskaya/Baitik Baatyr, Akhunbaev, Jal) × 1.15. Normalised by the 95th percentile.</li></ul><p>There is no open live traffic data for Kyrgyzstan: TomTom doesn't cover it; 2GIS and Yandex show traffic only inside their own maps under their own terms.</p>" },
  
};
const T2 = (k, v) => { let s = (TF2_T[LANG] || TF2_T.ru)[k]; if (s == null) s = TF2_T.ru[k]; if (v && typeof s === "string") for (const x in v) s = s.split("{" + x + "}").join(v[x]); return s; };
const TF2_W = { motorway: 1, trunk: 0.9, primary: 0.75, secondary: 0.55, tertiary: 0.35, unclassified: 0.25, residential: 0.2 };
/* ---- загруженность (оценка) ---- */
const TF3_CW = { primary: 1, trunk: 0.95, secondary: 0.85, motorway: 0.8, tertiary: 0.65, unclassified: 0.45, residential: 0.4 };
/* типичный суточный профиль пробок, доля от вечернего пика (модель проекта): 0 — будни, 1 — суббота, 2 — воскресенье */
const TF3_P = [[0.14, 0.11, 0.10, 0.10, 0.12, 0.22, 0.45, 0.82, 0.95, 0.80, 0.66, 0.64, 0.68, 0.70, 0.68, 0.70, 0.80, 0.97, 1.00, 0.86, 0.62, 0.45, 0.32, 0.20],
  [0.18, 0.14, 0.11, 0.10, 0.10, 0.13, 0.22, 0.35, 0.48, 0.58, 0.66, 0.72, 0.75, 0.76, 0.75, 0.74, 0.75, 0.78, 0.80, 0.74, 0.60, 0.46, 0.34, 0.24]];
TF3_P.push(TF3_P[1].map(v => +(v * 0.85).toFixed(3)));
const TF3_ART = /Чуй|Чүй|Chui|Chuy|Манас|Manas|Жибек|Jibek|Советск|Байтик|Baitik|Ахунбаев|Akhunbaev|Ахунбаева|\bЖал\b|Jal\b/i;
const tf3Off = () => 6 * 3600e3;
const tf3NowHD = () => { const d = new Date(Date.now() + tf3Off()); const w = d.getUTCDay(); return { h: d.getUTCHours(), dt: w === 6 ? 1 : w === 0 ? 2 : 0 }; };
const tf3Col = c => c < 0.2 ? "#2e9e5b" : c < 0.35 ? "#8cc63f" : c < 0.5 ? "#f2b705" : c < 0.65 ? "#ff8a3d" : c < 0.8 ? "#e5484d" : "#9b1c31";
const TF3_LEG = [0.1, 0.3, 0.45, 0.6, 0.75, 0.9];
const tf3C = (r, h, dt) => Math.max(0.03, Math.min(0.98, TF3_P[dt][h] * r.S * r.F));
const tf2Col = v => v == null ? "#9aa" : v < 15 ? "#2e9e5b" : v < 30 ? "#b5c900" : v < 50 ? "#f2b705" : v < 80 ? "#ff8a3d" : "#e5484d";
const TF2_LEG = [[7, "<15"], [22, "15–30"], [40, "30–50"], [65, "50–80"], [90, "80+"]];
const tf2Km = (a, b) => { const kx = 111.32 * Math.cos(a[0] * Math.PI / 180); return Math.hypot((a[0] - b[0]) * 110.57, (a[1] - b[1]) * kx); };
const tf2Mem = {};
async function tf2Roads() {
  const city = CITY; if (tf2Mem[city]) return tf2Mem[city];
  const j = await ftSnap(); let R, J;
  if (j && j.roads && j.roads.length) { R = j.roads.filter(x => TF2_W[x[0]]).map(([k, n, f, ln, ms, ow]) => ({ k, n, p: unflat(f), ln: ln || 0, ms: ms || 0, ow: ow || 0 })); J = j.jn || null; }
  else { if (!ftLive[city]) throw ftNoSnap();
    const [s, w, n, e] = ftCityBox();
    const o = await ftOverpass(`roads3.${city}`, `[out:json][timeout:90];way[highway~"^(motorway|trunk|primary|secondary|tertiary)$"](${s},${w},${n},${e});out geom tags qt;`);
    R = (o.elements || []).filter(x => x.geometry).map(x => ({ k: x.tags.highway, n: x.tags["name:" + LANG] || x.tags.name || "", ln: parseInt(x.tags.lanes) || 0, p: ftSimplify(x.geometry.map(g => [+g.lat.toFixed(5), +g.lon.toFixed(5)])) })); J = null; }
  if (!J) { const cnt = {}; R.filter(r => r.k !== "tertiary").forEach((r, i) => new Set(r.p.map(p => p[0].toFixed(4) + "," + p[1].toFixed(4))).forEach(k => { (cnt[k] = cnt[k] || new Set()).add(i); }));
    J = Object.keys(cnt).filter(k => cnt[k].size >= 2).map(k => k.split(",").map(Number)); }
  // сетка перекрёстков 0,005° для быстрого подсчёта в радиусе 500 м
  const G = {}; J.forEach(p => { const k = Math.floor(p[0] / 0.005) + ":" + Math.floor(p[1] / 0.005); (G[k] = G[k] || []).push(p); });
  const nearJ = m => { let n = 0; const a = Math.floor(m[0] / 0.005), b = Math.floor(m[1] / 0.005);
    for (let i = -1; i <= 1; i++) for (let k = -1; k <= 1; k++) (G[(a + i) + ":" + (b + k)] || []).forEach(p => { if (tf2Km(m, p) <= 0.5) n++; }); return n; };
  const cc = cityObj().center;
  R.forEach(r => { r.mid = r.p[Math.floor(r.p.length / 2)]; r.dc = tf2Km(r.mid, cc); });
  const ds = R.map(r => r.dc).sort((a, b) => a - b), r90 = ds[Math.floor(ds.length * 0.9)] || 3, Rs = Math.max(1.5, 0.4 * r90);
  R.forEach(r => { const W = TF2_W[r.k] || 0.3, Ln = r.ln > 0 ? Math.max(0.85, Math.min(1.3, 0.7 + 0.15 * r.ln)) : 1, C = 0.5 + 0.5 * Math.exp(-r.dc / Rs);
    r.nj = nearJ(r.mid); const Jf = 0.8 + 0.4 * Math.min(1, r.nj / 6); r.raw = W * Ln * C * Jf; });
  const mx = Math.max(1e-9, ...R.map(r => r.raw)); R.forEach(r => { r.load = 100 * r.raw / mx; r.d = nearestDistrict(r.mid[0], r.mid[1]); });
  // загруженность: структура улицы F (норм. по 95-му процентилю) и размер города S по длине главных улиц
  let Lkm = 0; R.forEach(r => { r.km = 0; for (let i = 1; i < r.p.length; i++) r.km += tf2Km(r.p[i - 1], r.p[i]); if (TF2_W[r.k] >= 0.35) Lkm += r.km; });
  const S = Math.max(0.45, Math.min(1, 0.45 + 0.55 * Math.log(Math.max(1, Lkm / 40)) / Math.log(780 / 40))), art = CITY === "bishkek";
  R.forEach(r => { const Ln = r.ln > 0 ? Math.max(0.9, Math.min(1.25, 0.8 + 0.1 * r.ln)) : 1, C = 0.55 + 0.45 * Math.exp(-r.dc / Rs), Jf = 0.85 + 0.3 * Math.min(1, r.nj / 6);
    r.f0 = (TF3_CW[r.k] || 0.4) * Ln * C * Jf * (r.ms >= 80 ? 0.85 : 1) * (art && TF3_ART.test(r.n) ? 1.15 : 1); });
  const fs = R.map(r => r.f0).sort((a, b) => a - b), f95 = fs[Math.floor(fs.length * 0.95)] || 1;
  R.forEach(r => { r.F = Math.min(1.05, r.f0 / f95); r.S = S; }); R.S = S; R.Lkm = Lkm; R.Rs = Rs; R.cc = cc;
  return (tf2Mem[city] = R);
}
/* почасовой NO₂ CAMS по районам: «типичные сутки» за 3 дня + текущее значение */
const tf2No2P = {};
function tf2No2() {
  const city = CITY; if (tf2No2P[city] && Date.now() - tf2No2P[city].at < 30 * 60e3) return tf2No2P[city].p;
  const D = DISTRICTS.slice(), parts = []; for (let i = 0; i < D.length; i += 60) parts.push(D.slice(i, i + 60));
  const p = Promise.all(parts.map(pp => fetchJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${pp.map(d => d.lat).join(",")}&longitude=${pp.map(d => d.lon).join(",")}&hourly=nitrogen_dioxide&past_days=3&forecast_days=1&timezone=auto`, 20000)))
    .then(rs => { const arr = rs.flatMap(x => Array.isArray(x) ? x : [x]), out = {}, now = Date.now();
      D.forEach((d, i) => { const r = arr[i]; if (!r || !r.hourly) return; const off = (r.utc_offset_seconds || 0) * 1000, H = r.hourly, prof = Array.from({ length: 24 }, () => []); let cur = null, curT = -1;
        H.time.forEach((tm, k) => { const T = Date.parse(tm + ":00Z") - off, v = H.nitrogen_dioxide[k]; if (v == null || T > now) return; prof[+tm.slice(11, 13)].push(v); if (T > curT) { curT = T; cur = v; } });
        out[d.id] = { prof: prof.map(a => a.length ? a.reduce((s, x) => s + x, 0) / a.length : null), cur, hNow: new Date(now + off).getUTCHours() }; });
      return out; });
  tf2No2P[city] = { at: Date.now(), p }; p.catch(() => { delete tf2No2P[city]; }); return p;
}
const tf2Val = (N, d, h) => { const x = N && N[d.id]; if (!x) { const a = air.byDistrict && air.byDistrict[d.id]; return a && a.no2 != null ? a.no2 : null; } return h == null ? x.cur : x.prof[h]; };
const tf2Cls = k => T2("cls")[k] || T2("cls2")[k] || k;
function tf2Pop(r, N, h, dt) {
  const v = tf2Val(N, r.d, h), idx = v == null ? null : r.load * v / 25, nd = tf3NowHD(), hh = h == null ? nd.h : h, c = tf3C(r, hh, dt == null ? nd.dt : dt);
  return `<b>${esc(r.n || tf2Cls(r.k))}</b><br>${T2("pClass")}: ${esc(tf2Cls(r.k))}${r.ln ? ` · ${T2("pLanes")}: ${r.ln}` : ""}${r.ms ? ` · ${T2("pMs")}: ${r.ms}` : ""}${r.ow ? ` · ${T2("pOw")}` : ""}<br>${T2("pCong")} (${String(hh).padStart(2, "0")}:00): <b style="color:${tfCol(c)}">${Math.round(100 * c)} %</b><br>${T2("pLoad")}: <b>${fmt(r.load, 0)}</b>/100<br>${T2("pNo2", { h: h == null ? T2("now") : String(h).padStart(2, "0") + ":00" })}: <b>${v == null ? "—" : fmt(v, 0) + " µg/m³"}</b><br>${T2("pIdx")}: <b style="color:${tf2Col(idx)}">${idx == null ? "—" : fmt(idx, 0)}</b><br><small>${T2("pD")}: ${esc(dName(r.d))} · ${T2("leg")}</small>`;
}
/* ---- стили слоя пробок (?trafficstyle=a|b|c|d, по умолчанию a) ----
 * a «Навигатор»: тонкие линии с тёмной обводкой, толщина по классу дороги, мелкие улицы только с зума 14, свободные — бледные;
 * b «Приглушённый»: бирюза → янтарь → малиновый с прозрачностью, серая подложка, свечение только у пробок;
 * c «Только пробки»: видны лишь участки ≥ 50 %, мягкое свечение и топ-5 подписей (улица + задержка, оценка);
 * d «Поток»: тонкие линии с бегущим пунктиром (скорость ∝ потоку), без анимации при prefers-reduced-motion. */
const TF_STYLE = (() => { try { const v = (new URLSearchParams(location.search).get("trafficstyle") || localStorage.getItem("tazaAba.trafficstyle") || "e").toLowerCase(); return "abcde".includes(v) && v.length === 1 ? v : "e"; } catch (e) { return "e"; } })();
const TF_MINOR = k => k === "residential" || k === "unclassified";
const TF_MAJOR = k => /motorway|trunk|primary/.test(k);
/* палитры: A — как в навигаторах, B/C/D — приглушённые */
const tfPalA = c => c < 0.35 ? "#3fbf74" : c < 0.5 ? "#a8d65a" : c < 0.65 ? "#ffb547" : c < 0.8 ? "#f0503c" : "#a3202c";
const tfPalB = c => c < 0.35 ? "#4fb3a9" : c < 0.5 ? "#8fbf9a" : c < 0.65 ? "#e0b25c" : c < 0.8 ? "#d9725a" : "#b8394f";
/* E «Премиум»: палитра без пары красный/зелёный (различима при дальтонизме), непрерывный градиент */
const TFE_STOPS = [[0.1, [126, 200, 235]], [0.3, [150, 214, 214]], [0.45, [242, 210, 110]], [0.6, [244, 160, 84]], [0.75, [231, 92, 108]], [0.92, [160, 52, 112]]];
const tfPalE = c => { const S = TFE_STOPS; if (c <= S[0][0]) return `rgb(${S[0][1]})`; for (let i = 1; i < S.length; i++) if (c <= S[i][0]) { const t = (c - S[i - 1][0]) / (S[i][0] - S[i - 1][0]), a = S[i - 1][1], b = S[i][1]; return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * t)).join(",")})`; } return `rgb(${S[S.length - 1][1]})`; };
const tfCol = (c, s) => { s = s || TF_STYLE; return s === "a" ? tfPalA(c) : s === "e" ? tfPalE(c) : tfPalB(c); };
const TFE_T = { ru: {est: "оценка (модель)", more: "Подробнее", close: "Закрыть", delay: "задержка", street: "Улица", t: "Пробки", now: "сейчас", up: "растут", dn: "спадают", eq: "стабильно", s: ["свободно", "почти свободно", "местами затруднено", "плотное движение", "серьёзные пробки", "город стоит"], m: "оценка загруженности (модель)", f: "свободно", j: "пробка" },
  ky: {est: "баалоо (модель)", more: "Кененирээк", close: "Жабуу", delay: "кечигүү", street: "Көчө", t: "Тыгындар", now: "азыр", up: "көбөйүүдө", dn: "азаюуда", eq: "туруктуу", s: ["бош", "дээрлик бош", "жер-жерде кыйын", "жыш кыймыл", "олуттуу тыгындар", "шаар токтоп турат"], m: "жүктөлүштү баалоо (модель)", f: "бош", j: "тыгын" },
  en: {est: "estimate (model)", more: "Details", close: "Close", delay: "delay", street: "Street", t: "Traffic", now: "now", up: "rising", dn: "easing", eq: "steady", s: ["free flow", "mostly free", "some slowdowns", "heavy traffic", "serious jams", "gridlock"], m: "congestion estimate (model)", f: "free", j: "jam" } };
const TFE = k => (TFE_T[LANG] || TFE_T.ru)[k];
const tfLvl = sc => TFE("s")[sc <= 2 ? 0 : sc <= 4 ? 1 : sc <= 5 ? 2 : sc <= 7 ? 3 : sc <= 9 ? 4 : 5];
const tfScoreSeg = c => Math.max(1, Math.min(10, Math.round(1 + 9 * Math.min(1, c / 0.9))));   // балл улицы 1–10 из её загруженности
const tfScore = m => Math.max(1, Math.min(10, Math.round(1 + 9 * Math.min(1, m / 0.72))));
const tfW = (k, z) => { const b = TF_MAJOR(k) ? 4 : k === "secondary" ? 3 : k === "tertiary" ? 2.2 : 1.4; return b * (z >= 15 ? 1.5 : z >= 14 ? 1.2 : z <= 12 ? 0.8 : 1); };
/* задержка (оценка): время по длине при скорости свободного потока × (1/(1−0,75c) − 1) */
const tfDelay = (r, c) => { const v = r.ms || (TF_MAJOR(r.k) ? 60 : r.k === "secondary" ? 50 : 40); return r.km / v * 60 * (1 / (1 - 0.75 * c) - 1); };
/* стеклянная карточка «Пробки сейчас»: балл 1–10 из средней загруженности (модель), тренд на следующий час */
function tfeCard(m, st, h, dt, jams) {
  const host = m._tfeHost || m.getContainer(); let el = host.querySelector(".tfe-card");
  if (!el) { el = m.getContainer().querySelector(".tfe-card"); if (el) host.appendChild(el); }
  if (!el) { el = L.DomUtil.create("div", "tfe-card", host); L.DomEvent.disableClickPropagation(el); }
  el.classList.toggle("tfe-card-in", host !== m.getContainer());
  const R = st.R; if (!R) return; const mean = (hh, d) => { let s = 0, w = 0; R.forEach(r => { if (TF_MINOR(r.k)) return; s += tf3C(r, hh, d) * r.km; w += r.km; }); return w ? s / w : 0; };   // балл — по улично-дорожной сети без жилых проездов
  const v = mean(h, dt), nx = mean((h + 1) % 24, dt), sc = tfScore(v), d = nx - v, tr = d > 0.03 ? ["↑", TFE("up"), "up"] : d < -0.03 ? ["↓", TFE("dn"), "dn"] : ["→", TFE("eq"), "eq"];
  const lvl = tfLvl(sc);
  m.fire("tfescore", { sc, h, lvl, tr: tr[0], now: st.h == null });
  const grad = TFE_STOPS.map(([c, a]) => `rgb(${a}) ${Math.round(c * 100)}%`).join(",");
  el.innerHTML = `<div class="tfe-top"><span class="tfe-ttl">${TFE("t")} · ${st.h == null ? TFE("now") : String(h).padStart(2, "0") + ":00"}</span></div>
    <div class="tfe-row"><span class="tfe-score" style="--c:${tfCol(Math.min(0.95, v / 0.72 * 0.9))}">${sc}</span><div class="tfe-txt"><b>${esc(lvl)}</b><span class="tfe-tr tfe-${tr[2]}">${tr[0]} ${esc(tr[1])}</span></div></div>
    <div class="tfe-bar" style="background:linear-gradient(90deg,${grad})"></div><div class="tfe-bl"><span>${esc(TFE("f"))}</span><span>${esc(TFE("j"))}</span></div>
    <div class="tfe-m">${esc(TFE("m"))}</div>`;
}
/* нажатие на улицу (стиль E): ближайшая улица в радиусе 14 px (на телефоне 22 px), жилые — только с зума 14.
 * Подсветка всей улицы (по названию), стеклянная подсказка: балл 1–10, статус, тренд на час, задержка — всё оценка модели. */
function tfeTap(m, st, R) {
  if (m._tfeTapOff) m._tfeTapOff();
  const hl = L.layerGroup().addTo(m), mob = () => m.getSize().x < 600 || (typeof IS_MOB !== "undefined" && IS_MOB);
  let sheet = null;
  const clear = () => { hl.clearLayers(); if (sheet) { sheet.remove(); sheet = null; } };
  const segD = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy; let t = l ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l : 0; t = Math.max(0, Math.min(1, t)); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
  const onClick = e => {
    const tgt = e.originalEvent && e.originalEvent.target; if (tgt && tgt.closest && tgt.closest(".tfe-sheet,.leaflet-popup,.fm-panel,.fm-chip,.fm-search,.tfe-card")) return;
    const p = e.containerPoint, z = m.getZoom(), tol = mob() ? 22 : 14;
    // датчики/станции поверх — не перехватываем
    let hitMk = false; m.eachLayer(l => { if (!hitMk && l instanceof L.CircleMarker && !(l instanceof L.Circle) && l.options.interactive !== false && l._latlng && m.latLngToContainerPoint(l._latlng).distanceTo(p) <= (l.options.radius || 6) + 3) hitMk = true; }); if (hitMk) return;
    const bb = m.getBounds().pad(0.05); let best = null, bd = tol + 1;
    for (const r of R) { if (TF_MINOR(r.k) && z < 14) continue;
      for (let i = 1; i < r.p.length; i++) { const a = r.p[i - 1], b = r.p[i]; if (!bb.contains(a) && !bb.contains(b)) continue;
        const d = segD(p, m.latLngToContainerPoint(a), m.latLngToContainerPoint(b)) - (TF_MAJOR(r.k) ? 2 : 0); if (d < bd) { bd = d; best = r; } } }
    if (!best) { clear(); m.closePopup(); return; }
    show(best, e.latlng);
  };
  const show = (r, ll) => {
    clear(); const nd = tf3NowHD(), h = st.h == null ? nd.h : st.h, dt = st.dt == null ? nd.dt : st.dt;
    const same = r.n ? R.filter(x => x.n === r.n && (TF_MINOR(x.k) === TF_MINOR(r.k))) : [r];
    const c = tf3C(r, h, dt), c1 = tf3C(r, (h + 1) % 24, dt), sc = tfScoreSeg(c), d = c1 - c, tr = d > 0.03 ? ["↑", TFE("up"), "up"] : d < -0.03 ? ["↓", TFE("dn"), "dn"] : ["→", TFE("eq"), "eq"];
    const dl = Math.max(0, Math.round(same.reduce((s, x) => s + tfDelay(x, tf3C(x, h, dt)), 0))), col = tfCol(c), z = m.getZoom(), w = tfW(r.k, z) + 2;
    same.forEach(x => { L.polyline(x.p, { color: "#fff", weight: w + 6, opacity: 0.85, lineCap: "round", lineJoin: "round", interactive: false }).addTo(hl); });
    same.forEach(x => { L.polyline(x.p, { color: tfCol(tf3C(x, h, dt)), weight: w + 1, opacity: 1, lineCap: "round", lineJoin: "round", interactive: false }).addTo(hl); });
    const name = r.n || tf2Cls(r.k), hh = String(h).padStart(2, "0") + ":00";
    const html = `<div class="tfs-pop"><div class="tfs-top"><span class="tfs-score" style="--c:${col}" aria-label="${sc}/10">${sc}</span><div class="tfs-tx"><b>${esc(name)}</b><span>${esc(tfLvl(sc))}</span></div></div>
      <div class="tfs-row"><span class="tfe-tr tfe-${tr[2]}">${tr[0]} ${esc(tr[1])}</span><span class="tfs-dl${dl >= 1 ? "" : " z"}">${dl >= 1 ? "+" + dl + " " + T2("min") : "≈ 0 " + T2("min")} <small>${esc(TFE("delay"))}</small></span></div>
      <div class="tfs-m">${esc(TFE("est"))} · ${st.h == null ? TFE("now") + " " : ""}${hh} · ${esc(tf2Cls(r.k))}${r.ln ? " · " + r.ln + " " + esc(T2("pLanes").toLowerCase()) : ""}</div>
      <details class="tfs-more"><summary>${esc(TFE("more"))}</summary><div class="small">${tf2Pop(r, st.N, st.h, st.dt)}</div></details></div>`;
    if (mob()) { sheet = L.DomUtil.create("div", "tfe-sheet", m.getContainer()); sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-label", name);
      sheet.innerHTML = `<button type="button" class="tfs-x" aria-label="${esc(TFE("close"))}">×</button>${html}`; L.DomEvent.disableClickPropagation(sheet); L.DomEvent.disableScrollPropagation(sheet);
      sheet.querySelector(".tfs-x").onclick = clear; sheet.addEventListener("keydown", ev => { if (ev.key === "Escape") clear(); });
      requestAnimationFrame(() => sheet && sheet.classList.add("on")); }
    else L.popup({ className: "tfs-popw", maxWidth: 300, minWidth: 240, autoPanPadding: [40, 40], closeButton: true }).setLatLng(ll).setContent(html).openOn(m).on("remove", () => hl.clearLayers());
  };
  m.on("click", onClick); m.getContainer().classList.add("tfe-tap");
  m._tfeShow = show;
  m._tfeTapOff = () => { m.off("click", onClick); clear(); m.removeLayer(hl); m.getContainer().classList.remove("tfe-tap"); m._tfeTapOff = null; };
}
function tf2Layer(onState, ctl) {
  const lg = L.layerGroup(); let built = false; const st = { h: null, dt: null, N: null, lines: [], mode: "cong", R: null };
  const S = TF_STYLE, RED = typeof RED_MOTION !== "undefined" && RED_MOTION;
  let svgR = null, caseR = null, glowR = null, minR = null, lineR = null;
  const glowG = L.layerGroup(), caseG = L.layerGroup(), lineG = L.layerGroup(), labG = L.layerGroup(); [caseG, glowG, lineG, labG].forEach(g => g.addTo(lg));
  const colorOf = (r, h, dt) => { if (st.mode === "load") return tf2Col(r.load); if (st.mode === "no2") { const v = tf2Val(st.N, r.d, st.h); return tf2Col(v == null ? null : r.load * v / 25 * (TF3_P[dt][h] / 0.75)); } return tfCol(tf3C(r, h, dt)); };
  let raf = 0; const paint = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const m = lg._map; if (!m) return; const nd = tf3NowHD(), h = st.h == null ? nd.h : st.h, dt = st.dt == null ? nd.dt : st.dt, z = m.getZoom();
    glowG.clearLayers(); labG.clearLayers();
    const jams = [];
    if (S === "e" && m.getPane("tfMinor")) { const pm = m.getPane("tfMinor"); pm.style.opacity = z >= 15 ? 0.85 : z >= 14 ? 0.5 : 0; pm.style.visibility = z >= 14 ? "visible" : "hidden"; }
    st.lines.forEach(o => { const { pl, cs, r } = o, c0 = tf3C(r, h, dt), c = o.lf ? Math.max(0.03, Math.min(0.98, c0 * o.lf)) : c0, col = st.mode === "cong" ? tfCol(c) : colorOf(r, h, dt), w = tfW(r.k, z);
      let show = true, op = 0.95, wt = w;
      if (S === "a") { if (TF_MINOR(r.k) && z < 14) show = false; if (c < 0.35) op = TF_MINOR(r.k) || r.k === "tertiary" ? 0.35 : 0.75; if (c < 0.35 && !TF_MAJOR(r.k)) wt = w * 0.8; }
      else if (S === "b") { if (TF_MINOR(r.k) && z < 14) show = false; op = c < 0.5 ? 0.55 : c < 0.65 ? 0.75 : 0.9; }
      else if (S === "c") { show = st.mode !== "cong" ? !TF_MINOR(r.k) || z >= 14 : c >= 0.5 && (!TF_MINOR(r.k) || z >= 14); op = 0.9; wt = w + (c >= 0.65 ? 1 : 0); }
      else if (S === "e") { const mj = TF_MAJOR(r.k), sec = r.k === "secondary"; wt = (mj ? 3.4 : sec ? 2.5 : r.k === "tertiary" ? 1.8 : 1.2) * (z >= 16 ? 1.6 : z >= 15 ? 1.35 : z >= 14 ? 1.15 : z <= 12 ? 0.8 : 1);
        op = c >= 0.6 ? 1 : c >= 0.45 ? 0.9 : mj || sec ? 0.75 : 0.55; }
      else if (S === "d") { if (TF_MINOR(r.k) && z < 14) show = false; op = 0.9; wt = Math.max(1.2, w * 0.75); }
      if (!show) { if (lineG.hasLayer(pl)) lineG.removeLayer(pl); if (cs && caseG.hasLayer(cs)) caseG.removeLayer(cs); return; }
      if (!lineG.hasLayer(pl)) lineG.addLayer(pl); if (cs && !caseG.hasLayer(cs)) caseG.addLayer(cs);
      pl.setStyle({ color: col, weight: wt, opacity: op });
      if (cs) cs.setStyle(S === "e" ? { weight: wt + 2.6, opacity: TF_MAJOR(r.k) || r.k === "secondary" ? 0.42 : 0.2 } : { weight: wt + 2.2, opacity: c < 0.35 && !TF_MAJOR(r.k) ? 0.18 : 0.55 });
      if (S === "d" && pl._path) { const sp = c < 0.35 ? "f" : c < 0.65 ? "m" : "s"; pl._path.setAttribute("class", "tf-flow tf-flow-" + sp + (RED ? " tf-still" : "")); }
      if (S === "e" && st.mode === "cong" && c >= 0.66 && !TF_MINOR(r.k) && r.k !== "tertiary") L.polyline(o.pp || r.p, { renderer: glowR, color: col, weight: wt + 7, opacity: 0.5, lineCap: "round", interactive: false }).addTo(glowG);
      if ((S === "b" || S === "c") && st.mode === "cong" && c >= 0.65 && !TF_MINOR(r.k)) L.polyline(r.p, { renderer: glowR, color: col, weight: wt + (S === "c" ? 9 : 7), opacity: S === "c" ? 0.22 : 0.18, lineCap: "round", interactive: false }).addTo(glowG);
      if ((S === "c" || S === "e") && st.mode === "cong" && c >= 0.5 && r.n && !o.part) jams.push({ r, c, dl: tfDelay(r, c0) });
    });
    if (S === "e") tfeCard(m, st, h, dt, jams);
    if ((S === "c" || S === "e") && jams.length) { const by = {}; jams.forEach(j => { const k = j.r.n; if (!by[k]) by[k] = { n: k, dl: 0, c: 0, km: 0, best: j }; by[k].dl += j.dl; by[k].km += j.r.km; by[k].c = Math.max(by[k].c, j.c); if (j.r.km > by[k].best.r.km) by[k].best = j; });
      if (S === "e") Object.values(by).forEach(g => { g.dl = st.R.filter(x => x.n === g.n && !TF_MINOR(x.k)).reduce((a, x) => a + tfDelay(x, tf3C(x, h, dt)), 0); });   // как в подсказке улицы
      Object.values(by).sort((a, b) => b.dl - a.dl).slice(0, 5).forEach((g, i) => { const r = g.best.r;
        L.marker(r.mid, { interactive: false, keyboard: false, icon: L.divIcon({ className: S === "e" ? "tfe-pill" : "tf-jamlab", iconSize: null, html: S === "e" ? `<span class="tfe-dot" style="background:${tfCol(g.c)}"></span><b>${esc(g.n)}</b><i>+${Math.max(1, Math.round(g.dl))} ${T2("min")}</i>` : `<span class="tf-jl-n">${i + 1}</span><b>${esc(g.n)}</b><i>+${Math.max(1, Math.round(g.dl))} ${T2("min")}</i>` }) }).addTo(labG); }); }
    if (lg.onPaint) lg.onPaint(st); }); };
  lg.setHour = h => { st.h = h; paint(); }; lg.setOnly = v => { st.mode = v ? "load" : "cong"; paint(); }; lg.setMode = m => { st.mode = m; paint(); }; lg.setDay = d => { st.dt = d; paint(); };
  lg.meanAt = (h, dt) => { const R = st.R; if (!R) return null; let s = 0, w = 0; R.forEach(r => { s += tf3C(r, h, dt) * r.km; w += r.km; }); return w ? s / w : null; }; lg.st = st;
  lg.style = S;
  lg.on("remove", () => { const m = lg._mapRef; if (!m) return; m.off("zoomend", paint); const c = m.getContainer(); c.classList.remove("tfs-" + S); const k = (m._tfeHost || c).querySelector(".tfe-card") || c.querySelector(".tfe-card"); if (k) k.remove(); if (m._tfeTapOff) m._tfeTapOff(); });
  lg.on("add", async () => { const m = lg._map; lg._mapRef = m; if (m) { m.on("zoomend", paint); m.getContainer().classList.add("tfs-" + S);
      if (!m.getPane("tfCase")) { m.createPane("tfCase").style.zIndex = 396; m.createPane("tfGlow").style.zIndex = 398; m.createPane("tfMinor").style.zIndex = 395; m.getPane("tfGlow").classList.add("tf-glowpane"); m.getPane("tfMinor").classList.add("tf-minorpane"); }
      caseR = caseR || L.canvas({ pane: "tfCase", padding: 0.3 }); glowR = glowR || L.canvas({ pane: "tfGlow", padding: 0.3 }); minR = minR || L.canvas({ pane: "tfMinor", padding: 0.3 }); lineR = lineR || L.canvas({ padding: 0.3 }); if (S === "d") svgR = svgR || L.svg({ padding: 0.3 }); }
    if (built) return; built = true;
    try { const [R, N] = await Promise.all([tf2Roads(), tf2No2().catch(e => { console.warn("no2:", e.message); return null; })]); if (!ftAlive(lg)) { built = false; return; }
      st.N = N; st.R = R; if (ctl) ctl(N);
      if (S === "e") { const cc = R.cc, Rs = R.Rs || 3, cf = p => 0.55 + 0.45 * Math.exp(-tf2Km(p, cc) / Rs);
        R.slice().sort((a, b) => (TF2_W[a.k] || 0) - (TF2_W[b.k] || 0) || a.F - b.F).forEach(r => { const minor = TF_MINOR(r.k), pop = () => tf2Pop(r, st.N, st.h, st.dt);
          if (minor) { const pl = L.polyline(r.p, { renderer: minR, color: "#9aa", weight: 1.2, opacity: 0.5, lineCap: "round", lineJoin: "round", interactive: false }); st.lines.push({ pl, r }); return; }
          const cs = L.polyline(r.p, { renderer: caseR, color: "#06121c", weight: 5, opacity: 0.4, lineCap: "round", lineJoin: "round", interactive: false }); st.lines.push({ pl: L.polyline([], { opacity: 0, interactive: false }), cs, r, part: 1 });
          /* градиент вдоль улицы: кусочки по 3 отрезка, локальный множитель близости к центру (та же модель) */
          const base = cf(r.mid); let first = true;
          for (let i = 0; i < r.p.length - 1; i += 3) { const pp = r.p.slice(i, Math.min(r.p.length, i + 4)), lf = Math.max(0.8, Math.min(1.2, cf(pp[Math.floor(pp.length / 2)]) / base));
            const pl = L.polyline(pp, { renderer: lineR, color: "#9aa", weight: 2, opacity: 0.9, lineCap: "round", lineJoin: "round", interactive: false }); st.lines.push({ pl, r, lf, pp, part: first ? 0 : 1 }); first = false; } });
        tfeTap(m, st, R); paint(); onState && onState(R.length); return; }
      R.slice().sort((a, b) => (TF2_W[a.k] || 0) - (TF2_W[b.k] || 0) || a.F - b.F).forEach(r => { const rr = S === "d" && !TF_MINOR(r.k) ? svgR : undefined;
        const cs = S === "a" ? L.polyline(r.p, { renderer: caseR, color: "#0b1a24", weight: 4, opacity: 0.5, lineCap: "round", lineJoin: "round", interactive: false }) : null;
        const pl = L.polyline(r.p, { renderer: rr, color: "#9aa", weight: 2, opacity: 0.9, lineCap: "round", lineJoin: "round", interactive: true, dashArray: rr ? "7 9" : null })
          .bindPopup(() => tf2Pop(r, st.N, st.h, st.dt), { maxWidth: 260 });
        st.lines.push({ pl, cs, r, rr }); });
      paint(); onState && onState(R.length);
    } catch (e) { built = false; if (e.nosnap) { onState ? onState("nosnap") : toast(T2("noSnap")); } else { console.warn("roads:", e.message); onState ? onState("err") : toast(T2("err")); } } });
  return lg;
}
function tf2Stat(st) { const s = $("#tfStat"); if (!s) return;
  if (typeof st === "number") { s.textContent = "🛣️ " + T2("st", { n: st }); return; }
  s.innerHTML = `${st === "nosnap" ? T2("noSnap") : T2("err")} <button class="btn ghost ft-live" type="button">⬇️ ${T2("load")}</button>`;
  s.querySelector(".ft-live").onclick = () => { ftLive[CITY] = true; s.textContent = T2("loading"); route(true); }; }
const tf3LiveOk = () => false;
const tf3LiveNote = () => "";
function viewTraffic2(el) {
  const d = DISTRICTS.find(x => x.id === state.district) || DISTRICTS[0];
  const sc = air.status === "ok" ? (air.sensors || []).filter(s => s.p2 != null) : [], stn = air.status === "ok" ? (air.stations || []) : [];
  el.innerHTML = `<h1>${FT("tf")}</h1><p class="sub">${FT("tfSub")}</p>
    <div class="map-grid"><div class="map-col"><div id="tfMap" class="mini-map" style="height:400px"></div>
      <div class="tf2-ctl card"><label for="tfH" class="small"><b>${T2("hour")}:</b> <span id="tfHv">${T2("now")}</span></label>
        <input type="range" id="tfH" min="-1" max="23" step="1" value="-1" aria-describedby="tfHn">
        <div class="tf3-row"><label class="small">${T2("day")} <select id="tfDay"><option value="">${T2("dAuto")}</option><option value="0">${T2("dWk")}</option><option value="1">${T2("dSat")}</option><option value="2">${T2("dSun")}</option></select></label>
          <label class="small">${T2("mode")} <select id="tfMode"><option value="cong">${T2("mCong")}</option><option value="no2">${T2("mNo2")}</option><option value="load">${T2("mLoad")}</option></select></label></div>
        <div class="small" id="tfMean" aria-live="polite"></div><div class="small" id="tfShareH" aria-live="polite"></div>
        <input type="checkbox" id="tfLive" hidden disabled><div id="tfLiveN" hidden></div>
        <input type="checkbox" id="tfOnly" hidden></div>
      <div class="legend tf-leg" id="tfLeg"></div><p class="small muted" id="tfSrc">${T2("srcEst")}</p><div class="small muted" id="tfHn">${T2("hNote")}</div>
      <p class="small muted" id="tfStat">${T2("loading")}</p>
      <p class="small muted">${sc.length || stn.length ? esc(T2("sens", { n: sc.length + stn.length })) + " — " + esc(T2("sensNo2")) : esc(T2("sensNone"))}</p>
      <details class="card tf2-how"><summary><b>❓ ${T2("howH")}</b></summary><div class="small">${T2("howC")}${T2("how")}</div></details>
      <p class="small muted">🛣️ © OpenStreetMap contributors (ODbL) · NO₂: CAMS / Open-Meteo${FCFG().TOMTOM_KEY ? " · Traffic © TomTom" : ""}</p></div>
    <div class="list-col"><div class="card tf-card"><div class="row between"><h3 style="margin:0">${FT("estH")}</h3><button class="btn ghost" id="tfHow" type="button">❓ ${FT("how")}</button></div>
      <label for="tfD" class="small">${t("district")}</label><select id="tfD">${districtOptions(d.id)}</select><div id="tfBox"></div></div>
      <div class="card small">📚 ${FT("studies")}: ${ftLink(SRC_LINKS.air2024, "Air 2024")} · ${ftLink(SRC_LINKS.wb2024, "World Bank 2024")} · ${ftLink(SRC_LINKS.undp2023, "UNDP 2023")}</div>
    </div></div><div class="foot">${t("footProto")}</div>`;
  const m = mkMap("tfMap", { zoomControl: true }).setView(cityObj().center, cityObj().zoom || 12); map = m; baseTiles(m);
  const hIn = $("#tfH"), hV = $("#tfHv");
  const L1 = tf2Layer(tf2Stat, N => { const any = N && Object.values(N)[0]; if (any && hIn && hIn.isConnected) hIn.dataset.now = any.hNow; }).addTo(m);
  const legend = mode => { const g = $("#tfLeg"); if (!g) return; g.innerHTML = mode === "cong" ? `<b class="small">${T2("cLeg")}:</b> <span class="small">${T2("c1")}</span> ${TF3_LEG.map(v => `<span style="background:${tfCol(v)}">${Math.round(v * 100)}%</span>`).join("")} <span class="small">${T2("c5")}</span>`
    : `<b class="small">${mode === "load" ? T2("mLoad") : T2("leg")}:</b> ${TF2_LEG.map(([v, l]) => `<span style="background:${tf2Col(v)}">${l}</span>`).join("")}`; };
  legend("cong");
  L1.onPaint = st => { const el = $("#tfMean"); if (!el) return; const nd = tf3NowHD(), h = st.h == null ? nd.h : st.h, dt = st.dt == null ? nd.dt : st.dt, v = L1.meanAt(h, dt);
    el.textContent = v == null || st.mode !== "cong" ? "" : T2("mean", { v: Math.round(100 * v) }); };
  hIn.oninput = () => { const h = +hIn.value; hV.textContent = h < 0 ? T2("now") + " (" + String(tf3NowHD().h).padStart(2, "0") + ":00)" : String(h).padStart(2, "0") + ":00"; L1.setHour(h < 0 ? null : h); tsSlider(h < 0 ? null : h); };
  hV.textContent = T2("now") + " (" + String(tf3NowHD().h).padStart(2, "0") + ":00)";
  $("#tfDay").onchange = e => L1.setDay(e.target.value === "" ? null : +e.target.value);
  $("#tfMode").onchange = e => { L1.setMode(e.target.value); legend(e.target.value); };
  $("#tfOnly").onchange = e => { L1.setOnly(e.target.checked); };
  let ttL = null; $("#tfLive").onchange = e => { if (e.target.checked) { ttL = ttL || ttLayer(); if (ttL) ttL.addTo(m); $("#tfSrc").textContent = T2("srcLive"); } else { if (ttL) m.removeLayer(ttL); $("#tfSrc").textContent = T2("srcEst"); } };
  sc.forEach(s => L.circleMarker([s.lat, s.lon], { radius: 5, color: "#1d4ed8", weight: 1.5, fillColor: "#fff", fillOpacity: 0.9 }).bindPopup(`📡 Sensor.Community<br>PM2.5: <b>${fmt(s.p2, 1)} µg/m³</b>`).addTo(m));
  stn.forEach(s => L.circleMarker([s.lat, s.lon], { radius: 6, color: "#7c3aed", weight: 2, fillColor: "#fff", fillOpacity: 0.9 }).bindPopup(`📡 ${esc(s.name || s.provider || "")}<br>AQI ${Math.round(s.aqi)}`).addTo(m));
  const box = $("#tfBox"); tfCardFill(box, d);
  $("#tfD").onchange = e => { const x = DISTRICTS.find(y => y.id === e.target.value); if (x) { tfCardFill(box, x); m.setView([x.lat, x.lon], Math.max(m.getZoom(), 13)); } };
  $("#tfHow").onclick = tfHowOpen;
  setTimeout(() => { if (m === map && m._mapPane) m.invalidateSize(); }, 60);
}

/* ---------- Единая оценка доли транспорта (карточка, ползунок, панель мэрии) ----------
 * Старая эвристика (features.js) зажимала признаки в [0;1] от фиксированных порогов: зимой при угольном дыме
 * NO₂/PM2.5 < 0,3 и PM2.5/PM10 > 0,8 → все «транспортные» признаки = 0 → 0 % транспорта. Это неверно.
 * Новая модель: базовая доля B по сезону (температуре) + суточный ход NO₂ (трассер выхлопа) относительно PM2.5:
 *   heat = clamp((15 − T) / 20, 0, 1);  B = 30 % − 15 % · heat  (лето ≈ 30 %, сильный мороз ≈ 15 %)
 *   s(h) = B·n / (B·n + 1 − B), n = r(h)·a(h): r — (NO₂/PM2.5)(h) к среднему [0,6; 1,6], a — типовой профиль трафика TS_ACT
 *   s(h) ограничена 10…40 %; показываем диапазон ±5 п.п. Источники: Air 2024 (транспорт 27 % PM2.5 за год, летом до ~30 %),
 *   ПРООН 2023 (транспорт — главный источник NOx), Всемирный банк 2024. Нижняя граница 10 % — консервативный выбор проекта. */
const TS_T = {
  ru: { now: "сейчас", at: "в {h}", day: "в среднем за сутки", range: "≈ {a}–{b} %", lbl: "Транспорт (оценка)", heatL: "Отопление и прочее", est: "Оценка, а не измерение.",
    base: "База по сезону (температура {t})", nf: "NO₂/PM2.5 в этот час / среднее", pf: "Активность трафика (типовой профиль)", floor: "Границы 10–40 %: ниже 10 % не опускаем — транспорт есть всегда, пока улицы заняты.",
    slider: "Вклад транспорта {h} (оценка): {r}", howH: "Как оцениваем долю транспорта",
    how: "<p><b>Это оценка, а не измерение.</b> Мы не знаем точного состава дыма, поэтому опираемся на опубликованные исследования и данные модели CAMS (Open-Meteo) за последние 3 суток:</p><ol><li><b>Сезон.</b> Чем холоднее, тем больше дыма от отопления. База B = 30 % − 15 % × h, где h = (15 °C − средняя температура) / 20, от 0 до 1. Летом B ≈ 30 % (Air 2024: летом транспорт до ~30 % PM2.5), в сильный мороз ≈ 15 %.</li><li><b>Время суток.</b> NO₂ — след выхлопа. Берём отношение NO₂/PM2.5 в этот час к среднему за сутки r (так сокращается разбавление при перемешивании воздуха; вечерняя топка снижает r) и умножаем на типовой суточный профиль городского трафика a (допущение проекта: ночью ≈ 0,2, в часы пик 7–9 и 17–19 ≈ 1,8 — тот же профиль, что у загруженности улиц): n = r·a, s = B·n / (B·n + 1 − B).</li><li><b>Границы.</b> Результат ограничен 10–40 % и показывается диапазоном ±5 п.п. Нижняя граница 10 % — консервативный выбор проекта: по исследованиям транспорт в Бишкеке даёт заметную долю круглый год (27 % PM2.5 за год, Air 2024).</li></ol><p>Та же оценка используется в карточке района, у ползунка времени и в панели для мэрии.</p>",
    src: "Источники" },
  ky: { now: "азыр", at: "саат {h}", day: "сутка боюнча орточо", range: "≈ {a}–{b} %", lbl: "Транспорт (баалоо)", heatL: "Жылытуу жана башкалар", est: "Баалоо, өлчөө эмес.",
    base: "Мезгил боюнча база (температура {t})", nf: "Ушул сааттагы NO₂/PM2.5 / орточо", pf: "Трафиктин активдүүлүгү (типтүү профиль)", floor: "Чектер 10–40 %: 10 %дан төмөн түшүрбөйбүз — көчөлөрдө унаа болгондо транспорт дайыма бар.",
    slider: "Транспорттун үлүшү {h} (баалоо): {r}", howH: "Транспорттун үлүшүн кантип баалайбыз",
    how: "<p><b>Бул баалоо, өлчөө эмес.</b> Түтүндүн так курамын билбейбиз, ошондуктан жарыяланган изилдөөлөргө жана CAMS моделинин (Open-Meteo) акыркы 3 суткалык маалыматына таянабыз:</p><ol><li><b>Мезгил.</b> Канчалык суук болсо, жылытуудан түтүн ошончолук көп. База B = 30 % − 15 % × h, мында h = (15 °C − орточо температура) / 20, 0дөн 1ге чейин. Жайында B ≈ 30 % (Air 2024: жайында транспорт PM2.5тин ~30 %на чейин), катуу суукта ≈ 15 %.</li><li><b>Сутканын убагы.</b> NO₂ — түтүндүн изи. Ушул сааттагы NO₂/PM2.5 катышын сутканын орточосуна бөлөбүз r (абанын аралашуусундагы суюлтуу кыскарат; кечки меш r ди төмөндөтөт) жана шаардык трафиктин типтүү суткалык профилине көбөйтөбүз a (долбоордун божомолу: түнкүсүн ≈ 0,2, 7–9 жана 17–19 сааттарда ≈ 1,8): n = r·a, s = B·n / (B·n + 1 − B).</li><li><b>Чектер.</b> Натыйжа 10–40 % менен чектелет жана ±5 п.п. диапазону менен көрсөтүлөт. 10 % төмөнкү чек — долбоордун этият тандоосу: изилдөөлөр боюнча Бишкекте транспорт жыл бою байкалаарлык үлүш берет (жылына PM2.5тин 27 %, Air 2024).</li></ol><p>Ушул эле баалоо райондун карточкасында, убакыт сыдыргычында жана мэрия панелинде колдонулат.</p>",
    src: "Булактар" },
  en: { now: "now", at: "at {h}", day: "daily average", range: "≈ {a}–{b}%", lbl: "Transport (estimate)", heatL: "Heating & other", est: "An estimate, not a measurement.",
    base: "Seasonal base (temperature {t})", nf: "NO₂/PM2.5 this hour / mean", pf: "Traffic activity (typical profile)", floor: "Bounds 10–40%: never below 10% — traffic is always there while streets are busy.",
    slider: "Transport share {h} (estimate): {r}", howH: "How we estimate the transport share",
    how: "<p><b>This is an estimate, not a measurement.</b> We don't know the exact smoke composition, so we rely on published studies and CAMS model data (Open-Meteo) for the last 3 days:</p><ol><li><b>Season.</b> The colder it is, the more heating smoke. Base B = 30% − 15% × h, where h = (15 °C − mean temperature) / 20, from 0 to 1. In summer B ≈ 30% (Air 2024: transport up to ~30% of PM2.5 in summer), in hard frost ≈ 15%.</li><li><b>Time of day.</b> NO₂ traces exhaust. We take the NO₂/PM2.5 ratio this hour relative to its daily mean r (this cancels dilution by atmospheric mixing; evening stoves lower r) and multiply it by a typical urban traffic profile a (project assumption: ≈ 0.2 at night, ≈ 1.8 at the 7–9 and 17–19 peaks — the same profile as street congestion): n = r·a, s = B·n / (B·n + 1 − B).</li><li><b>Bounds.</b> The result is limited to 10–40% and shown as a ±5 pp range. The 10% floor is a conservative project choice: studies show transport is a notable share in Bishkek all year round (27% of annual PM2.5, Air 2024).</li></ol><p>The same estimate is used in the district card, next to the time slider and in the city-hall dashboard.</p>",
    src: "Sources" },
  
};
const TS = (k, v) => { let s = (TS_T[LANG] || TS_T.ru)[k]; if (s == null) s = TS_T.ru[k]; if (v) for (const x in v) s = s.split("{" + x + "}").join(v[x]); return s; };
/* типовой суточный профиль активности городского трафика (допущение проекта, среднее = 1): ночь низко, пики 7–9 и 17–19 */
const TS_ACT = (() => { const P = TF3_P[0], m = P.reduce((s, x) => s + x, 0) / 24; return P.map(x => +(x / m).toFixed(2)); })();   // тот же профиль, что у загруженности улиц
const tsCl = (x, a, b) => Math.max(a, Math.min(b, x));
const tsMean = a => { const v = a.filter(x => x != null && isFinite(x)); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
function tsModel(H) {
  const a = H.a.hourly, now = Date.now(), off = H.a.utc_offset_seconds;
  const isPast = tm => off == null ? true : Date.parse(tm + ":00Z") - off * 1000 <= now;   // gov.js передаёт уже прошедшие часы без смещения
  const rows = a.time.map((tm, i) => ({ tm, h: +tm.slice(11, 13), past: isPast(tm), no2: a.nitrogen_dioxide[i], p25: a.pm2_5[i], p10: a.pm10 ? a.pm10[i] : null })).filter(r => r.past && r.no2 != null && r.p25 != null);
  if (rows.length < 12) return null;
  const pN = Array.from({ length: 24 }, (_, h) => tsMean(rows.filter(r => r.h === h).map(r => r.no2))), pP = Array.from({ length: 24 }, (_, h) => tsMean(rows.filter(r => r.h === h).map(r => r.p25)));
  const mN = tsMean(pN), mP = tsMean(pP);
  let temp = null; if (H.b && H.b.hourly) temp = tsMean(H.b.hourly.temperature_2m.filter((v, i) => new Date(H.b.hourly.time[i]).getTime() <= now));
  if (temp == null) { const m = new Date().getMonth(); temp = [-3, -1, 6, 12, 17, 22, 25, 24, 18, 11, 4, -1][m]; }   // нет погоды — климатическая норма по месяцу (ориентир)
  const heat = tsCl((15 - temp) / 20, 0, 1), B = 0.30 - 0.15 * heat;
  // r(h): отношение NO₂/PM2.5 в этот час к среднему (перемешивание атмосферы разбавляет оба газа одинаково и сокращается)
  const rat = Array.from({ length: 24 }, (_, h) => pN[h] != null && pP[h] > 0 ? pN[h] / pP[h] : null), mR = tsMean(rat);
  const nf = h => rat[h] == null || !mR ? 1 : tsCl(rat[h] / mR, 0.6, 1.6), pf = h => TS_ACT[h];
  const share = Array.from({ length: 24 }, (_, h) => { const n = nf(h) * pf(h); return tsCl(B * n / (B * n + (1 - B)), 0.10, 0.40); });
  const hNow = rows[rows.length - 1].h, dayS = tsMean(share);
  const sum = k => rows.reduce((s, r) => s + (r[k] || 0), 0);
  return { share, hNow, B, temp, nf, pf, day: dayS, np: sum("p25") > 0 ? sum("no2") / sum("p25") : null, pp: sum("p10") > 0 ? sum("p25") / sum("p10") : null };
}
const tsRange = s => { const c = Math.round(100 * s); return { c, a: Math.max(10, c - 5), b: Math.min(40, c + 5) }; };
/* совместимый интерфейс для gov.js и старых вызовов */
tfEstimate = function (H) { const M = tsModel(H); if (!M) return null; const tp = Math.round(100 * M.share[M.hNow]);
  return { tp, hp: 100 - tp, day: Math.round(100 * M.day), share: M.share, hNow: M.hNow, R: null, np: M.np, pp: M.pp, temp: M.temp, B: M.B }; };
const tsHr = h => String(h).padStart(2, "0") + ":00";
function tsCardHTML(M, h, d) {
  const hh = h == null ? M.hNow : h, s = M.share[hh], r = tsRange(s), tp = r.c, dr = tsRange(M.day);
  return `<div class="tf-bar" role="img" aria-label="${TS("lbl")} ${tp}%"><span class="tf-t" style="width:${tp}%">${tp}%</span><span class="tf-h" style="width:${100 - tp}%">🔥 ${100 - tp}%</span></div>
    <div class="row between small" style="margin-top:4px"><span>${TS("lbl")}</span><span>${TS("heatL")}</span></div>
    <p style="margin:8px 0 2px"><b>${TS("range", r)}</b> · ${h == null ? TS("now") + " (" + tsHr(hh) + ")" : TS("at", { h: tsHr(hh) })}<br><span class="small">${TS("day")}: ${TS("range", dr)}</span></p>
    <p class="small muted"><b>${TS("est")}</b> ${TS("floor")}</p>
    <ul class="tf-in small"><li>${TS("base", { t: fmt(M.temp, 1) + " °C" })}: <b>${Math.round(100 * M.B)} %</b></li><li>${TS("nf")}: <b>${fmt(M.nf(hh), 2)}</b></li><li>${TS("pf")}: <b>${fmt(M.pf(hh), 2)}</b></li></ul>
    <p class="small muted">${esc(dName(d))} · CAMS / Open-Meteo</p>`;
}
let tsCur = null;   // { M, d } выбранного района — для ползунка
tfCardFill = async function (box, d) {
  box.innerHTML = `<p class="small muted">${FT("loadingH")}</p>`;
  try { const M = tsModel(await tfHourly(d)); if (!box.isConnected) return; if (!M) { box.innerHTML = `<p class="small muted">${FT("noData")}</p>`; return; }
    tsCur = { M, d }; const hIn = document.getElementById("tfH"), h = hIn && +hIn.value >= 0 ? +hIn.value : null;
    box.innerHTML = tsCardHTML(M, h, d); tsSlider(h);
  } catch (e) { box.innerHTML = `<p class="small muted">${FT("noData")} (${esc(e.message)})</p>`; }
};
function tsSlider(h) { const el = document.getElementById("tfShareH"); if (!el || !tsCur) return; const hh = h == null ? tsCur.M.hNow : h;
  el.textContent = TS("slider", { h: h == null ? TS("now") : tsHr(hh), r: TS("range", tsRange(tsCur.M.share[hh])) });
  const box = document.getElementById("tfBox"); if (box && box.querySelector(".tf-bar")) box.innerHTML = tsCardHTML(tsCur.M, h, tsCur.d); }
tfHowOpen = function () {
  const m = $("#modal");
  m.innerHTML = `<div class="sheet tf-how" role="dialog" aria-modal="true" aria-labelledby="tfHH"><h3 id="tfHH">${TS("howH")}</h3>${TS("how")}
    <h4>📚 ${TS("src")}</h4><ul class="small"><li>${esc(FT("st1"))} ${ftLink(SRC_LINKS.air2024, "doi:10.3390/air2040021")}</li><li>${esc(FT("st2"))} ${ftLink(SRC_LINKS.wb2024, "doi:10.1596/41995")}</li><li>${esc(FT("st3"))} ${ftLink(SRC_LINKS.undp2023, "UNDP")}</li></ul>
    <button class="btn" id="tfHClose" type="button" style="width:100%;margin-top:10px">OK</button></div>`;
  m.classList.remove("hidden"); const close = () => m.classList.add("hidden"); m.onclick = e => { if (e.target === m) close(); }; $("#tfHClose").onclick = close; $("#tfHClose").focus();
};

if (typeof FT_ON !== "undefined" && FT_ON.tf) { views.traffic = viewTraffic2; tfLayer = (onState) => tf2Layer(onState); }
