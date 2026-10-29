/* Таза Аба — доп. модуль: реальные датчики Sensor.Community + расширенный ИИ-советник.
 * Загружается до app.js; функции вызываются только во время работы, когда app.js уже загружен. */

/* ---------- 1. Датчики Sensor.Community (без ключа, CORS: *) ---------- */
async function loadSensors(center) {
  try {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 9000);
    const r = await fetch(`https://data.sensor.community/airrohr/v1/filter/area=${center[0]},${center[1]},25`, { signal: ctl.signal });
    clearTimeout(tm);
    if (!r.ok) return [];
    const j = await r.json();
    const now = Date.now();
    const last = {};   // фильтр отдаёт несколько замеров одного датчика за 5 мин — берём последний
    j.forEach(x => { const k = x.sensor ? x.sensor.id : x.id; if (!last[k] || last[k].timestamp < x.timestamp) last[k] = x; });
    return Object.values(last).filter(x => !x.location.indoor).map(x => {
      const v = k => { const e = x.sensordatavalues.find(s => s.value_type === k); return e ? parseFloat(e.value) : null; };
      return { lat: +x.location.latitude, lon: +x.location.longitude, p2: v("P2"), p1: v("P1"),
        age: (now - Date.parse(x.timestamp.replace(" ", "T") + "Z")) / 60000 };
    }).filter(s => s.p2 != null && isFinite(s.p2) && s.p2 >= 0 && s.p2 < 1000 && s.age < 60);
  } catch (e) { return []; }
}
const kmDist = (a, b) => { const R = 6371, dl = (b.lat - a.lat) * Math.PI / 180, dn = (b.lon - a.lon) * Math.PI / 180;
  const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dn / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h)); };
/* v81: число живых датчиков (Sensor.Community, с PM2.5) не дальше 25 км от центра города — как в forecast.js; 0 — значит цифры только модель */
function cityLiveSensN() { try { const c = cityObj().center; if (!c || typeof air === "undefined") return 0;
  const n = (air.sensors || []).filter(s => s.p2 != null && kmDist({ lat: c[0], lon: c[1] }, s) <= 25).length;
  return n || (Object.values(air.byDistrict || {}).some(r => r && r.src === "sensors") ? 1 : 0); } catch (e) { return 0; } }
const median = a => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
/* US EPA (2024) PM2.5 → AQI */
function pm25ToAqi(c) {
  const B = [[0, 9, 0, 50], [9.1, 35.4, 51, 100], [35.5, 55.4, 101, 150], [55.5, 125.4, 151, 200], [125.5, 225.4, 201, 300], [225.5, 325.4, 301, 500]];
  c = Math.floor(c * 10) / 10;
  for (const [cl, ch, il, ih] of B) if (c <= ch) return Math.round((ih - il) / (ch - cl) * (Math.max(c, cl) - cl) + il);
  return 500;
}
function sensorsNear(list, d) {
  if (!list || !list.length) return null;
  const near = list.map(s => ({ ...s, km: kmDist(d, s) })).filter(s => s.km <= 2.5);
  if (!near.length) return null;
  const pm25 = median(near.map(s => s.p2)), p1 = near.map(s => s.p1).filter(v => v != null);
  return { n: near.length, pm25, pm10: p1.length ? median(p1) : null, aqi: pm25ToAqi(pm25), age: Math.round(Math.min(...near.map(s => s.age))) };
}
function srcLabel(a, d) {
  const ap = d && d.approx ? ` · ${t("coordApprox")}` : "";
  if (a.src === "station" && typeof stationSrcLabel === "function") return stationSrcLabel(a) + ap;
  if (a.src === "sensors") return "📡 " + t("srcSensors", { n: a.nSensors, m: Math.max(1, a.sensorAgeMin) }) + ap;
  if (a.src === "model") return "🛰️ " + t("srcModel") + ap;
  return "⚠️ " + t("srcDemo");
}
Object.assign(DICT.ru, {
  srcSensors: "Датчики Sensor.Community: {n} шт. рядом, {m} мин назад", srcModel: "Модель CAMS (Open-Meteo) для координат района — не измерение",
  srcDemo: "нет данных", coordApprox: "координаты района приблизительные",
});
Object.assign(DICT.ky, {
  srcSensors: "Sensor.Community датчиктери: жанында {n} даана, {m} мүн. мурун", srcModel: "CAMS модели (Open-Meteo) аймактын координаттары боюнча — өлчөө эмес",
  srcDemo: "маалымат жок", coordApprox: "аймактын координаттары болжолдуу",
});
Object.assign(DICT.en, {
  srcSensors: "Sensor.Community sensors: {n} nearby, {m} min ago", srcModel: "CAMS model (Open-Meteo) at district coordinates — not a measurement",
  srcDemo: "no data", coordApprox: "district coordinates are approximate",
});

/* ---------- 2. Расширенный советник ---------- */
const PROFILE_KEY = "tazaAba.profile";
const getProfile = () => { try { return { kids: false, asthma: false, elderly: false, sport: false, heat: "coal", ...JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}") }; } catch { return { heat: "coal" }; } };
const AD = {
  ru: {
    modesLbl: "Режим", m_health: "Здоровье", m_kids: "Дети", m_asthma: "Астма/аллергия", m_sport: "Спорт и прогулки", m_heating: "Отопление дома", m_route: "Маршрут",
    pTitle: "Мой профиль — советы под вас", pKids: "Есть дети", pAsthma: "Астма или аллергия", pElderly: "Пожилые в семье", pSport: "Бегаю / катаюсь на велосипеде",
    pHeat: "Отопление", h_coal: "уголь", h_gas: "газ", h_el: "электро", pSaved: "Профиль сохранён",
    q_walk: "Когда лучше гулять сегодня?", q_windows: "Открывать ли окна?", q_mask: "Какую маску купить?", q_coal: "Как перейти с угля?", q_school: "Безопасно ли ребёнку в школу пешком?",
    quickLbl: "Быстрые вопросы", voice: "Голосовой ввод", listening: "Слушаю…", copy: "Копировать", share: "Поделиться", copied: "Скопировано",
    provLbl: "Провайдер", p_rules: "Правила (по умолчанию, без интернета и ключа)", rulesMode: "Режим: правила на основе AQI и прогноза — без ИИ-сервиса",
    now: "Сейчас {d}: <b>AQI {aqi}</b> — {lv}. Лучшее время сегодня: <b>{best}</b> (AQI {bv}), пик: {worst} (AQI {wv}). Завтра максимум: AQI {tm}.",
    sens: "У вас в профиле {who} — используем более строгий порог: AQI 100.", who_kids: "дети", who_asthma: "астма/аллергия", who_elderly: "пожилые",
    walk_g: "Воздух чистый — гуляйте хоть сейчас. Самое свежее окно: {best}.", walk_m: "Гулять можно, лучше около {best}. Избегайте вечера, когда топят печи (после 19:00).", walk_b: "Сегодня воздух плохой. Если нужно выйти — около {best}, коротко и подальше от дорог и частного сектора. Лучше перенесите прогулку.",
    win_g: "Да, проветривайте — воздух чистый.", win_m: "Проветривайте коротко (5–10 мин) около {best}. Вечером окна закрыты.", win_b: "Нет, держите окна закрытыми. Проветрите 3–5 минут около {best} или используйте очиститель с HEPA-фильтром.",
    mask: "Берите респиратор <b>FFP2/KN95</b> (лучше FFP3 при астме) с плотным прилеганием, без клапана для детей. Медицинская и тканевая маски от PM2.5 почти не защищают. Меняйте каждые 1–2 дня носки.{x}", mask_b: " Сегодня AQI {aqi} — респиратор на улице нужен.",
    coal_coal: "План перехода: 1) утеплите стены и чердак — минус 30–40% угля; 2) поставьте тепловой насос или сплит-систему; 3) добавьте солнечные панели. Пройдите опрос ниже в режиме «Отопление дома» — посчитаю стоимость и окупаемость. Объединяйтесь с соседями во «Вместе» — оптом дешевле до 30%.",
    coal_clean: "У вас уже {h} — отлично! Помогите соседям: делитесь опытом и жалуйтесь на дым через «Жалобы».",
    school_g: "Да, воздух чистый — пешком полезно.", school_m: "В целом да. Выбирайте улицы подальше от трасс и частного сектора, утром воздух обычно лучше вечера.", school_b: "Сегодня лучше подвезти или идти в респираторе FFP2 детского размера, коротким путём вдали от дорог. В школе — без уроков физкультуры на улице.",
    sport_g: "Отличный день для бега и велосипеда. Лучшее время: {best}.", sport_m: "Тренируйтесь легче и около {best}; при кашле — прекратите.", sport_b: "Перенесите интенсивную тренировку в зал. На улице только лёгкая прогулка около {best}.",
    asthma_g: "Риск низкий. Держите ингалятор с собой как обычно.", asthma_m: "Будьте осторожны: ингалятор с собой, прогулки около {best}, без нагрузок вечером.", asthma_b: "Высокий риск обострения: оставайтесь дома, окна закрыты, очиститель воздуха. Если хуже — по плану врача.",
    elderly: " Пожилым — то же, плюс без долгих прогулок в морозный смог.",
    route: "Для маршрута откройте «Эко-маршруты» — там пути через парки в обход трасс. Лучшее время выйти сегодня: {best} (AQI {bv}). <a href=\"#routes\">Открыть маршруты →</a>",
    heatIntro: "Отвечу на 4 вопроса о доме и подберу, как уйти от угля.",
  },
  ky: {
    modesLbl: "Режим", m_health: "Ден соолук", m_kids: "Балдар", m_asthma: "Астма/аллергия", m_sport: "Спорт жана сейил", m_heating: "Үйдү жылытуу", m_route: "Маршрут",
    pTitle: "Менин профилим — сизге ылайык кеңештер", pKids: "Балдар бар", pAsthma: "Астма же аллергия", pElderly: "Үй-бүлөдө улгайгандар бар", pSport: "Чуркайм / велосипед тебем",
    pHeat: "Жылытуу", h_coal: "көмүр", h_gas: "газ", h_el: "электр", pSaved: "Профиль сакталды",
    q_walk: "Бүгүн качан сейилдеген жакшы?", q_windows: "Терезени ачсам болобу?", q_mask: "Кандай маска сатып алуу керек?", q_coal: "Көмүрдөн кантип баш тартам?", q_school: "Балага мектепке жөө баруу коопсузбу?",
    quickLbl: "Тез суроолор", voice: "Үн менен киргизүү", listening: "Угуп жатам…", copy: "Көчүрүү", share: "Бөлүшүү", copied: "Көчүрүлдү",
    provLbl: "Провайдер", p_rules: "Эрежелер (демейки, интернетсиз жана ачкычсыз)", rulesMode: "Режим: AQI жана болжолго негизделген эрежелер — ИИ кызматысыз",
    now: "Азыр {d}: <b>AQI {aqi}</b> — {lv}. Бүгүн эң жакшы убакыт: <b>{best}</b> (AQI {bv}), чокусу: {worst} (AQI {wv}). Эртең максимум: AQI {tm}.",
    sens: "Профилиңизде {who} бар — катуураак чекти колдонобуз: AQI 100.", who_kids: "балдар", who_asthma: "астма/аллергия", who_elderly: "улгайгандар",
    walk_g: "Аба таза — азыр эле сейилдей бериңиз. Эң таза убакыт: {best}.", walk_m: "Сейилдесе болот, жакшысы {best} чамасында. Меш жагылган кечтен (19:00дөн кийин) качыңыз.", walk_b: "Бүгүн аба начар. Чыгуу керек болсо — {best} чамасында, кыска жана жолдон, жеке сектордон алыс. Сейилди кийинкиге калтырганыңыз жакшы.",
    win_g: "Ооба, желдетиңиз — аба таза.", win_m: "{best} чамасында кыска (5–10 мүн.) желдетиңиз. Кечинде терезелер жабык.", win_b: "Жок, терезелерди жабык кармаңыз. {best} чамасында 3–5 мүнөт желдетиңиз же HEPA чыпкалуу тазалагычты колдонуңуз.",
    mask: "<b>FFP2/KN95</b> респираторун алыңыз (астмада FFP3 жакшы), бетке тыгыз жатсын, балдарга клапансыз. Медициналык жана кездеме маскалар PM2.5тен дээрлик коргобойт. 1–2 күн кийгенден кийин алмаштырыңыз.{x}", mask_b: " Бүгүн AQI {aqi} — көчөдө респиратор керек.",
    coal_coal: "Өтүү планы: 1) дубалды жана чатырды жылуулаңыз — көмүр 30–40% азаят; 2) жылуулук насосун же сплит-системаны коюңуз; 3) күн панелдерин кошуңуз. Төмөндө «Үйдү жылытуу» режиминде сурамжылоодон өтүңүз — баасын жана актоосун эсептейм. «Бирге» бөлүмүндө кошуналар менен бириктиңиз — дүң 30%га чейин арзан.",
    coal_clean: "Сизде {h} — абдан жакшы! Кошуналарга жардам бериңиз: тажрыйба бөлүшүңүз, түтүн тууралуу «Даттануулар» аркылуу кабарлаңыз.",
    school_g: "Ооба, аба таза — жөө басуу пайдалуу.", school_m: "Негизинен ооба. Трассадан жана жеке сектордон алыс көчөлөрдү тандаңыз, адатта эртең менен аба кечкиге караганда жакшы.", school_b: "Бүгүн машина менен жеткирген же балдар өлчөмүндөгү FFP2 респиратору менен, жолдон алыс кыска жол менен барган жакшы. Мектепте дене тарбия сабагы сыртта өтпөсүн.",
    sport_g: "Чуркоого жана велосипедге сонун күн. Эң жакшы убакыт: {best}.", sport_m: "Жеңилирээк машыгыңыз, {best} чамасында; жөтөл чыкса — токтотуңуз.", sport_b: "Катуу машыгууну залга которуңуз. Сыртта {best} чамасында жеңил сейил гана.",
    asthma_g: "Тобокел аз. Ингаляторду адаттагыдай жаныңызда алып жүрүңүз.", asthma_m: "Этият болуңуз: ингалятор жаныңызда, сейил {best} чамасында, кечинде жүк көтөрбөңүз.", asthma_b: "Курчуп кетүү коркунучу жогору: үйдө калыңыз, терезелер жабык, аба тазалагыч күйүк. Начарласа — дарыгердин планы боюнча.",
    elderly: " Улгайгандарга да ушундай, кошумча — суук түтүндө узак сейилдебеңиз.",
    route: "Маршрут үчүн «Эко-маршруттарды» ачыңыз — трассаларды айланып, парктар аркылуу өткөн жолдор бар. Бүгүн чыгууга эң жакшы убакыт: {best} (AQI {bv}). <a href=\"#routes\">Маршруттарды ачуу →</a>",
    heatIntro: "Үй тууралуу 4 суроого жооп бериңиз — көмүрдөн кантип кутулууну тандап берем.",
  },
  en: {
    modesLbl: "Mode", m_health: "Health", m_kids: "Kids", m_asthma: "Asthma/allergy", m_sport: "Sport & walks", m_heating: "Home heating", m_route: "Route",
    pTitle: "My profile — personalised tips", pKids: "Have children", pAsthma: "Asthma or allergy", pElderly: "Elderly in the family", pSport: "I run / cycle",
    pHeat: "Heating", h_coal: "coal", h_gas: "gas", h_el: "electric", pSaved: "Profile saved",
    q_walk: "When is it best to walk today?", q_windows: "Should I open the windows?", q_mask: "Which mask should I buy?", q_coal: "How do I switch from coal?", q_school: "Is it safe for my child to walk to school?",
    quickLbl: "Quick questions", voice: "Voice input", listening: "Listening…", copy: "Copy", share: "Share", copied: "Copied",
    provLbl: "Provider", p_rules: "Rules (default, offline, no key)", rulesMode: "Mode: rules based on AQI and the forecast — no AI service",
    now: "Now in {d}: <b>AQI {aqi}</b> — {lv}. Best time today: <b>{best}</b> (AQI {bv}), peak: {worst} (AQI {wv}). Tomorrow's max: AQI {tm}.",
    sens: "Your profile includes {who}, so I use a stricter threshold: AQI 100.", who_kids: "children", who_asthma: "asthma/allergy", who_elderly: "elderly people",
    walk_g: "The air is clean — go out any time. Freshest window: {best}.", walk_m: "Walking is fine, best around {best}. Avoid evenings when stoves are lit (after 7 pm).", walk_b: "The air is bad today. If you must go out, do it around {best}, briefly and away from roads and private-house areas. Better postpone the walk.",
    win_g: "Yes, air the room — the air is clean.", win_m: "Air briefly (5–10 min) around {best}. Keep windows shut in the evening.", win_b: "No, keep windows closed. Air for 3–5 minutes around {best} or use a HEPA purifier.",
    mask: "Get an <b>FFP2/KN95</b> respirator (FFP3 is better with asthma) with a tight fit; valve-free for kids. Surgical and cloth masks barely stop PM2.5. Replace after 1–2 days of wear.{x}", mask_b: " Today's AQI is {aqi} — wear a respirator outdoors.",
    coal_coal: "Switch plan: 1) insulate walls and attic — 30–40% less coal; 2) install a heat pump or split AC; 3) add solar panels. Take the quiz below in “Home heating” mode and I'll estimate the cost and payback. Team up with neighbours in “Together” — bulk buying saves up to 30%.",
    coal_clean: "You already heat with {h} — great! Help neighbours: share your experience and report smoke via “Complaints”.",
    school_g: "Yes, the air is clean — walking is healthy.", school_m: "Generally yes. Choose streets away from main roads and private-house areas; mornings are usually cleaner than evenings.", school_b: "Today it's better to drive them or walk in a kid-size FFP2 respirator by a short route away from roads. No outdoor PE at school.",
    sport_g: "Great day for running and cycling. Best time: {best}.", sport_m: "Train lighter and around {best}; stop if you start coughing.", sport_b: "Move intense training indoors. Outside, only a light walk around {best}.",
    asthma_g: "Low risk. Keep your inhaler with you as usual.", asthma_m: "Be careful: inhaler with you, walks around {best}, no exertion in the evening.", asthma_b: "High risk of a flare-up: stay indoors, windows shut, run an air purifier. If it gets worse, follow your doctor's plan.",
    elderly: " Same for elderly people — and no long walks in frosty smog.",
    route: "For a route, open “Eco routes” — paths through parks that avoid main roads. Best time to go out today: {best} (AQI {bv}). <a href=\"#routes\">Open routes →</a>",
    heatIntro: "Answer 4 questions about your home and I'll pick the best way off coal.",
  },
};
const A = (k, v = {}) => String(AD[LANG][k] ?? AD.ru[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
function airCtx() {
  const d = byId(state.district), a = air.byDistrict[d.id];
  if (!a || !a.time) return null;
  const today = (a.currentTime || a.time[0]).slice(0, 10), nowH = +(a.currentTime || "T00").slice(11, 13);
  const HA = typeof hAqi === "function" ? hAqi(a) : a.hourly;   // v52: по PM2.5 каждого часа
  const idx = a.time.map((tm, i) => [tm, i]).filter(([tm, i]) => tm.startsWith(today) && +tm.slice(11, 13) >= Math.min(nowH, 21) && HA[i] != null);
  const day = idx.filter(([tm]) => +tm.slice(11, 13) <= 21);
  const best = (day.length ? day : idx).reduce((m, [tm, i]) => (HA[i] < (m.v ?? 1e9) ? { tm, v: HA[i] } : m), {});
  const worst = idx.reduce((m, [tm, i]) => (HA[i] > (m.v ?? -1) ? { tm, v: HA[i] } : m), {});
  const days = dailyForecast(a); const P = getProfile();
  const sensitive = P.kids || P.asthma || P.elderly;
  const T = sensitive ? 100 : 150;
  const tier = a.aqi <= 50 ? "g" : a.aqi <= T ? "m" : "b";
  return { d, a, P, sensitive, tier, vars: { d: tr(d.name), aqi: a.aqi, lv: tr(level(a.aqi).name), best: (best.tm || "—").slice(11, 16), bv: best.v ?? "—", worst: (worst.tm || "—").slice(11, 16), wv: worst.v ?? "—", tm: days[1] ? days[1].max : "—" } };
}
function nowLine(c) {
  let s = A("now", c.vars);
  if (c.sensitive) s += "<br>" + A("sens", { who: ["kids", "asthma", "elderly"].filter(k => c.P[k]).map(k => A("who_" + k)).join(", ") });
  return s;
}
function quickAnswer(q) {
  const c = airCtx(); if (!c) return noDataAnswer(q);
  const v = c.vars, T = c.tier;
  const el = c.P.elderly ? A("elderly") : "";
  const map = {
    walk: () => A("walk_" + T, v) + el, windows: () => A("win_" + T, v),
    mask: () => A("mask", { x: T === "b" ? A("mask_b", v) : "" }),
    coal: () => c.P.heat === "coal" ? A("coal_coal") : A("coal_clean", { h: A("h_" + c.P.heat) }),
    school: () => A("school_" + T, v),
    health: () => A("walk_" + T, v) + " " + A("win_" + T, v) + el, kids: () => A("school_" + T, v) + " " + A("walk_" + T, v),
    asthma: () => A("asthma_" + T, v) + " " + A("win_" + T, v), sport: () => A("sport_" + T, v) + el, route: () => A("route", v),
  };
  return nowLine(c) + "<br><br>" + (map[q] ? map[q]() : "");
}
function detectQuick(s) {
  s = s.toLowerCase();
  if (/маск|респиратор|mask|respirator/.test(s)) return "mask";
  if (/окн|терезе|window|провет|желдет/.test(s)) return "windows";
  if (/школ|мектеп|school/.test(s)) return "school";
  if (/угл|уголь|көмүр|coal/.test(s)) return "coal";
  if (/гулят|прогул|сейил|walk|когда|качан|when/.test(s)) return "walk";
  if (/бег|спорт|велосип|чурка|run|cycl|sport/.test(s)) return "sport";
  if (/маршрут|route/.test(s)) return "route";
  return null;
}
const PROVIDERS = {
  free: { free: true, name: "Pollinations.AI → LLM7.io" },
  rules: null,
  openai: { url: "https://api.openai.com/v1", model: "gpt-4o-mini", name: "OpenAI" },
  gemini: { url: "https://generativelanguage.googleapis.com/v1beta/openai", model: "gemini-2.0-flash", name: "Google Gemini" },
  xai: { url: "https://api.x.ai/v1", model: "grok-3-mini", name: "xAI Grok" },
};
const provOf = cfg => cfg.provider || (cfg.key ? "openai" : "free");   // по умолчанию — бесплатный ИИ (ai.js)
async function answerFree2(q) {
  const cfg = llmCfg(), prov = provOf(cfg);
  const qk = detectQuick(q);
  if (prov === "rules" || !cfg.key) { await new Promise(r => setTimeout(r, 400)); return qk ? { html: quickAnswer(qk) } : ruleAnswer(q); }
  const c = airCtx(); if (!c) return { html: noDataAnswer(qk) };
  const P = c.P;
  const ctx = `Current district ${c.vars.d}, US AQI ${aqiTxt(c.a.aqi)} (source: ${c.a.src}), best hour today ${c.vars.best} (AQI ${c.vars.bv}), peak ${c.vars.worst} (AQI ${c.vars.wv}), tomorrow max ${c.vars.tm}. User profile: kids=${P.kids}, asthma=${P.asthma}, elderly=${P.elderly}, sport=${P.sport}, heating=${P.heat}. Advisor mode: ${adv.mode}.`;
  const langName = { ru: "Russian", ky: "Kyrgyz (Cyrillic)", en: "English" }[LANG];
  try {
    const ctl = new AbortController(); setTimeout(() => ctl.abort(), 20000);
    const r = await fetch(cfg.url + "/chat/completions", { method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + cfg.key },
      body: JSON.stringify({ model: cfg.model, temperature: 0.4, max_tokens: 450, messages: [
        { role: "system", content: `You are the Taza Aba clean-air advisor for ${tr(cityObj().name)}, Kyrgyzstan: health advice for smog, and help households quit coal (insulation, heat pumps, solar). Be brief and practical, answer in ${langName}, prices in Kyrgyz som. Don't invent measurements; use only these data: ${ctx}` },
        { role: "user", content: q }] }) });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    return { html: esc(j.choices[0].message.content).replace(/\n/g, "<br>") };
  } catch (e) {
    return { html: t("llmErr", { e: esc(e.message) }) + "<br>" + (qk ? quickAnswer(qk) : (r => r.key ? t(r.key) : r.html)(ruleAnswer(q))) };
  }
}

const ADV_MODES = ["chat", "health", "kids", "asthma", "sport", "heating", "route"];
const QUICK = ["walk", "windows", "mask", "coal", "school"];
const MODE_ICON = { chat: "💬", health: "💚", kids: "🧒", asthma: "🫁", sport: "🏃", heating: "🔥", route: "🧭" };
function viewAdvisor2(el) {
  aiRestore();
  const cfg = llmCfg(), prov = provOf(cfg), P = getProfile();
  const aiOn = prov !== "rules" && (prov === "free" || !!cfg.key);
  if (!adv.mode) adv.mode = aiOn ? "chat" : "heating";
  let chat = adv.mode === "chat" ? botMsg(esc(AIT("hello"))) : botMsg(t("advHello"));
  if (adv.mode === "heating") {
    chat += botMsg(A("heatIntro"));
    ADV_STEPS.forEach((s, i) => {
      if (i > adv.step) return;
      chat += botMsg(t(s.q));
      if (adv.answers[s.key] != null) chat += meMsg(s.opts.find(o => o.v === adv.answers[s.key]).l());
    });
    if (adv.result) chat += `<div class="bot-ava"><div class="a">🌻</div><div class="msg bot rec">${recHTML(adv.result)}</div></div>`;
  }
  adv.extra.forEach((m, i) => { chat += m.me ? meMsg(m.text) : m.ai ? `<div class="bot-ava"><div class="a">🌻</div><div class="msg bot ai" data-ai="${i}"></div></div>` : botMsg(m.quick ? quickAnswer(m.quick) : m.key ? t(m.key) : m.html); });
  let chips = "";
  if (adv.mode === "heating") {
    if (!adv.result && adv.step < ADV_STEPS.length) chips = ADV_STEPS[adv.step].opts.map(o => `<button data-ans="${o.v}">${o.l()}</button>`).join("");
    else if (adv.result) chips = `<button class="primary" id="advApply">${t("apply")}</button><button id="advRestart">↺ ${t("restart")}</button>`;
  }
  const hasSR = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const chk = (k, l) => `<label class="pchk"><input type="checkbox" data-pf="${k}" ${P[k] ? "checked" : ""}><span>${A(l)}</span></label>`;
  const pv = PROVIDERS[prov] || {};
  el.innerHTML = `
    <h1>🤖 ${t("advTitle")}</h1>
    <p class="sub">${t("advSub")}</p>
    <div class="rule-note">${prov === "free" ? AIT("on") : prov !== "rules" && cfg.key ? "🟢 " + t("llmOn") + " · " + esc(PROVIDERS[prov]?.name || "") : "⚙️ " + A("rulesMode")}</div>
    <div class="adv-modes" role="tablist" aria-label="${A("modesLbl")}">${ADV_MODES.map(m => `<button role="tab" aria-selected="${adv.mode === m}" class="${adv.mode === m ? "on" : ""}" data-mode="${m}">${MODE_ICON[m]} ${A("m_" + m)}</button>`).join("")}</div>
    <details class="card adv-profile" ${adv.profOpen ? "open" : ""}><summary>👤 ${A("pTitle")}</summary>
      <div class="pgrid">${chk("kids", "pKids")}${chk("asthma", "pAsthma")}${chk("elderly", "pElderly")}${chk("sport", "pSport")}</div>
      <label>${A("pHeat")}</label>
      <div class="seg">${["coal", "gas", "el"].map(h => `<button data-heat="${h}" class="${P.heat === h ? "on" : ""}" aria-pressed="${P.heat === h}">${A("h_" + h)}</button>`).join("")}</div>
    </details>
    <div class="chat" id="chat">${chat}</div>
    <div class="chips">${chips}</div>
    ${aiOn ? `<div class="quick-q ai-sugg"><span class="qlbl">${AIT("suggL")}</span>${(AI_T[LANG] || AI_T.en).s.map((q, i) => `<button data-sq="${i}">${esc(q)}</button>`).join("")}</div>` : ""}
    <div class="quick-q"><span class="qlbl">${A("quickLbl")}</span>${QUICK.map(q => `<button data-q="${q}">${A("q_" + q)}</button>`).join("")}</div>
    <form class="ask" id="askForm"><input id="askIn" aria-label="${esc(t("askPh"))}" placeholder="${t("askPh")}" autocomplete="off">${hasSR ? `<button class="btn ghost mic" type="button" id="micBtn" aria-label="${A("voice")}" title="${A("voice")}">🎤</button>` : ""}<button class="btn ghost" type="button" id="aiStop" hidden>${AIT("stop")}</button><button class="btn" type="submit" aria-label="→">→</button></form>
    <p class="small muted ai-priv">${esc(aiPrivacyLine())}${adv.extra.length ? ` · <a href="#" id="aiClear">${AIT("clear")}</a>` : ""}</p>
    <details class="card how" id="llmBox"><summary>${t("llmTitle")}</summary>
      <p class="small muted" style="font-weight:700">${t("llmNote")}</p>
      <label for="llmProv">${A("provLbl")}</label>
      <select id="llmProv">${Object.keys(PROVIDERS).map(k => `<option value="${k}" ${k === prov ? "selected" : ""}>${k === "rules" ? A("p_rules") : k === "free" ? esc(AIT("freeName") + " · " + PROVIDERS.free.name) : PROVIDERS[k].name}</option>`).join("")}</select>
      <div id="llmFields" class="${prov === "rules" || prov === "free" ? "hidden" : ""}">
        <label for="llmUrl">${t("baseUrl")}</label><input id="llmUrl" value="${esc(cfg.url || pv.url || "")}">
        <label for="llmModel">${t("model")}</label><input id="llmModel" value="${esc(cfg.model || pv.model || "")}">
        <label for="llmKey">${t("apiKey")}</label><input id="llmKey" type="password" value="${esc(cfg.key || "")}" placeholder="API key" autocomplete="off">
      </div>
      <div class="row" style="margin-top:12px"><button class="btn" id="llmSave" style="flex:1">${t("saveBtn")}</button><button class="btn ghost" id="llmClear" style="flex:1">${t("clearBtn")}</button></div>
    </details>`;
  aiHydrate(el);   // ответы ИИ: безопасная разметка узлами DOM
  // копировать / поделиться для каждого ответа
  el.querySelectorAll(".msg.bot").forEach((m, i) => {
    if (i === 0) return;
    m.insertAdjacentHTML("beforeend", `<div class="msg-act"><button data-copy aria-label="${A("copy")}">⧉ ${A("copy")}</button><button data-share aria-label="${A("share")}">↗ ${A("share")}</button></div>`);
  });
  const textOf = b => { const m = b.closest(".msg").cloneNode(true); m.querySelector(".msg-act")?.remove(); return m.innerText.trim() + "\n— Таза Аба"; };
  el.querySelectorAll("[data-copy]").forEach(b => b.onclick = async () => { try { await navigator.clipboard.writeText(textOf(b)); toast(A("copied")); } catch { toast("⚠️"); } });
  el.querySelectorAll("[data-share]").forEach(b => b.onclick = async () => {
    const text = textOf(b);
    if (navigator.share) { try { await navigator.share({ title: "Таза Аба", text }); } catch {} }
    else { try { await navigator.clipboard.writeText(text); toast(A("copied")); } catch {} }
  });
  const rerender = () => { aiSave(); if (location.hash.startsWith("#advisor")) { viewAdvisor2($("#view")); decorate($("#view")); scrollChat(); } };
  el.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => {
    adv.mode = b.dataset.mode;
    if (adv.mode !== "heating" && adv.mode !== "chat") adv.extra.push({ me: true, text: MODE_ICON[adv.mode] + " " + A("m_" + adv.mode) }, { quick: adv.mode });
    rerender();
  });
  el.querySelectorAll("[data-q]").forEach(b => b.onclick = () => { adv.extra.push({ me: true, text: A("q_" + b.dataset.q) }, { quick: b.dataset.q }); rerender(); });
  el.querySelectorAll("[data-pf]").forEach(c => c.onchange = () => {
    const p = getProfile(); p[c.dataset.pf] = c.checked; localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); adv.profOpen = true; toast(A("pSaved")); rerender();
  });
  el.querySelectorAll("[data-heat]").forEach(b => b.onclick = () => {
    const p = getProfile(); p.heat = b.dataset.heat; localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); adv.profOpen = true; toast(A("pSaved")); rerender();
  });
  el.querySelectorAll("[data-ans]").forEach(b => b.onclick = () => {
    const s = ADV_STEPS[adv.step];
    adv.answers[s.key] = typeof s.opts[0].v === "number" ? +b.dataset.ans : b.dataset.ans;
    adv.step++;
    if (adv.step >= ADV_STEPS.length) {
      rerender(); typing(); scrollChat();
      setTimeout(() => { adv.result = advise(adv.answers); rerender(); }, 700);
      return;
    }
    rerender();
  });
  const ap = $("#advApply"), rs = $("#advRestart");
  if (ap) ap.onclick = () => {
    const r = adv.result;
    state.house = { ...state.house, area: r.ans.area, coal: r.ans.coal };
    state.plan = r.rec.id === "insul_pump" ? "pump" : r.rec.id === "insul_solar" ? "solar" : "insul";
    save(); toast(t("applied")); location.hash = "#house";
  };
  if (rs) rs.onclick = () => { adv = { answers: {}, step: 0, extra: [], result: null, mode: "heating" }; rerender(); };
  $("#askForm").onsubmit = async e => {
    e.preventDefault();
    const f = $("#askForm"); if (f.classList.contains("busy")) return;
    const q = $("#askIn").value.trim().slice(0, 2000); if (!q) return;
    await aiSubmit(q, () => { rerender(); scrollChat(); });
  };
  el.querySelectorAll("[data-sq]").forEach(b => b.onclick = () => { const i = $("#askIn"); i.value = (AI_T[LANG] || AI_T.en).s[+b.dataset.sq]; $("#askForm").requestSubmit(); });
  const st = $("#aiStop"); if (st) st.onclick = () => aiStop();
  const cl = $("#aiClear"); if (cl) cl.onclick = e => { e.preventDefault(); aiStop(); adv.extra = []; adv.result = null; adv.step = 0; adv.answers = {}; aiSave(); rerender(); };
  const mic = $("#micBtn");
  if (mic) mic.onclick = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition; const rec = new SR();
    rec.lang = { ru: "ru-RU", ky: "ky-KG", en: "en-US" }[LANG]; rec.interimResults = false;
    mic.classList.add("rec"); $("#askIn").placeholder = A("listening");
    rec.onresult = ev => { $("#askIn").value = ev.results[0][0].transcript; $("#askForm").requestSubmit(); };
    rec.onerror = () => toast("🎤 ✕"); rec.onend = () => { mic.classList.remove("rec"); const i = $("#askIn"); if (i) i.placeholder = t("askPh"); };
    try { rec.start(); } catch { mic.classList.remove("rec"); }
  };
  $("#llmProv").onchange = e => {
    const p = PROVIDERS[e.target.value];
    $("#llmFields").classList.toggle("hidden", !p || !!p.free);
    if (p && !p.free) { $("#llmUrl").value = p.url; $("#llmModel").value = p.model; }
  };
  $("#llmSave").onclick = () => {
    const provider = $("#llmProv").value;
    const c = provider === "rules" || provider === "free" ? { provider } : { provider, url: $("#llmUrl").value.trim().replace(/\/$/, ""), model: $("#llmModel").value.trim(), key: $("#llmKey").value.trim() };
    localStorage.setItem(LLM_STORE, JSON.stringify(c)); toast(t("llmSaved")); rerender();
  };
  $("#llmClear").onclick = () => { localStorage.removeItem(LLM_STORE); toast(t("llmSaved")); rerender(); };
}

/* ---------- 3. Эко-маршруты: фильтры, сортировка, AQI по точкам ---------- */
const RT_ICON = { walk: "🚶", bike: "🚲", run: "🏃", school: "🎒", commute: "💼", trip: "⛰️" };
const RT_SPEED = { walk: 4.5, bike: 14, run: 9, school: 4, commute: 14, trip: 3 };
let rtFilter = "all", rtSort = "clean";
function routeAqi2(r) {
  if (r.far) return air.byRoute && air.byRoute[r.id] != null ? { v: air.byRoute[r.id], src: "model" } : null;
  const ids = [...new Set(r.path.map(p => nearestDistrict(p[0], p[1]).id))].filter(id => air.byDistrict[id] && air.byDistrict[id].aqi != null);
  if (!ids.length) return null;
  const src = ids.some(id => ["sensors", "station"].includes(air.byDistrict[id].src)) ? "sensors" : air.byDistrict[ids[0]].src;
  return { v: Math.round(ids.reduce((s, id) => s + air.byDistrict[id].aqi, 0) / ids.length), src };
}
function viewRoutes2(el) {
  const all = ECO_ROUTES.map(r => ({ r, type: r.type || r.mode, km: routeKm(r), aq: routeAqi2(r) }));
  const types = ["all", ...["walk", "bike", "run", "school", "commute", "trip"].filter(ty => all.some(x => x.type === ty))];
  if (!types.includes(rtFilter)) rtFilter = "all";
  let rs = all.filter(x => rtFilter === "all" || x.type === rtFilter);
  rs.sort((a, b) => rtSort === "short" ? a.km - b.km : (a.aq ? a.aq.v : 999) - (b.aq ? b.aq.v : 999));
  const cleanest = all.filter(x => x.aq).sort((a, b) => a.aq.v - b.aq.v)[0]?.r.id;
  const RT = id => R("rt_" + id);
  el.innerHTML = `
    <h1>🌳 ${t("rTitle")}</h1>
    <p class="sub">${t("rSub")}</p>
    ${!all.length ? `<div class="card soon">🛤️ ${R("soon")}</div>` : ""}
    <div class="adv-modes">${types.map(ty => `<button class="${rtFilter === ty ? "on" : ""}" aria-pressed="${rtFilter === ty}" data-rt="${ty}">${ty === "all" ? R("all") : RT_ICON[ty] + " " + RT(ty)} <small>${ty === "all" ? all.length : all.filter(x => x.type === ty).length}</small></button>`).join("")}</div>
    <div class="seg rsort"><button data-sort="clean" class="${rtSort === "clean" ? "on" : ""}" aria-pressed="${rtSort === "clean"}">🌿 ${R("sClean")}</button><button data-sort="short" class="${rtSort === "short" ? "on" : ""}" aria-pressed="${rtSort === "short"}">📏 ${R("sShort")}</button></div>
    <div class="map-grid r-grid"><div class="map-col"><div id="rMap" class="mini-map" style="height:300px"></div></div>
    <div class="list-col">
    ${rs.map(({ r, type, km, aq }) => {
      const Lv = aq ? level(aq.v) : null;
      return `<div class="card route ${selRoute === r.id ? "sel" : ""}" data-route="${r.id}" tabindex="0">
        <div class="row between"><b style="font-size:15.5px"><span class="rdot" style="background:${r.color}"></span>${tr(r.name)}</b>${r.id === cleanest ? `<span class="chip">${t("rBest")}</span>` : ""}</div>
        <div class="r-meta"><span>${RT_ICON[type]} ${RT(type)}</span><span>📏 ${r.far ? "≈" : ""}${t("rKm", { n: fmt(km, 1) })}</span><span>⏱️ ${t("rMin", { n: Math.max(5, Math.round(km / RT_SPEED[type] * 60)) })}</span>
          ${aq ? `<span style="background:${Lv.color}22;color:${Lv.color}">AQI ${aq.v} · ${aq.src === "sensors" ? "📡" : "🛰️"}</span>` : `<span>AQI —</span>`}
          ${type !== "trip" ? `<span class="g">🌱 ${t("rCO2", { n: fmt(km * CAR_KG_PER_KM, 2) })}</span>` : ""}</div>
        ${r.avoid ? `<div class="small muted" style="font-weight:700;margin-top:6px">🚫 ${t("rAvoid", { s: tr(r.avoid) })}</div>` : ""}
        ${r.via && r.via.length ? `<div class="small muted" style="margin-top:6px">🛣️ ${({ ru: "По улицам (OSM)", ky: "Көчөлөр (OSM)", en: "Via streets (OSM)" })[LANG] || "OSM"}: ${r.via.map(esc).join(", ")}</div>` : ""}
      </div>`;
    }).join("")}
    </div></div>
    <div class="foot">${R("note")} ${t("rDemo")}</div>`;
  map = mkMap("rMap", { zoomControl: false });
  baseTiles(map);
  const lines = {}, show = rs.map(x => x.r), near = show.filter(r => !r.far);
  show.forEach(r => {
    const type = r.type || r.mode;
    lines[r.id] = L.polyline(r.path, { color: r.color, weight: selRoute === r.id ? 9 : 6, opacity: selRoute && selRoute !== r.id ? 0.45 : 0.95, lineCap: "round", dashArray: r.mode === "bike" ? "1 11" : null }).addTo(map)
      .bindPopup(`<b>${tr(r.name)}</b><br>${RT_ICON[type]} ${RT(type)}`);
    L.marker(r.path[0], { icon: L.divIcon({ className: "", html: `<div class="r-start" style="background:${r.color}">${RT_ICON[type]}</div>`, iconSize: [26, 26], iconAnchor: [13, 13] }) }).addTo(map);
  });
  const fitSet = selRoute && lines[selRoute] ? null : (near.length ? near : show);
  if (fitSet && fitSet.length) map.fitBounds(L.latLngBounds(fitSet.flatMap(r => r.path)).pad(0.08));
  else if (selRoute && lines[selRoute]) map.fitBounds(lines[selRoute].getBounds().pad(0.3));
  else map.setView(cityObj().center, 12);
  setTimeout(() => map && map.invalidateSize(), 50);
  el.querySelectorAll("[data-rt]").forEach(b => b.onclick = () => { rtFilter = b.dataset.rt; selRoute = null; viewRoutes2(el); decorate(el); });
  el.querySelectorAll("[data-sort]").forEach(b => b.onclick = () => { rtSort = b.dataset.sort; viewRoutes2(el); decorate(el); });
  el.querySelectorAll("[data-route]").forEach(c => c.onclick = () => { selRoute = selRoute === c.dataset.route ? null : c.dataset.route; viewRoutes2(el); decorate(el); $("#rMap").scrollIntoView({ block: "center" }); });
}
const RD = {
  ru: { soon: "Маршруты для этого города скоро появятся. Пока смотрите карту воздуха и лучшее время для прогулки на главной.", all: "Все", rt_walk: "Прогулка", rt_bike: "Велосипед", rt_run: "Бег", rt_school: "В школу", rt_commute: "На работу", rt_trip: "За город", sClean: "Сначала чистые", sShort: "Сначала короткие",
    note: "Координаты маршрутов приблизительные. AQI маршрута — по живым данным в точках маршрута (📡 датчики / 🛰️ модель CAMS); для загородных — модель в точке маршрута." },
  ky: { soon: "Бул шаар үчүн маршруттар жакында кошулат. Азырынча аба картасын жана башкы беттеги сейилдөөгө эң жакшы убакытты караңыз.", all: "Баары", rt_walk: "Сейил", rt_bike: "Велосипед", rt_run: "Чуркоо", rt_school: "Мектепке", rt_commute: "Жумушка", rt_trip: "Шаардан сыртка", sClean: "Адегенде тазалары", sShort: "Адегенде кыскалары",
    note: "Маршруттардын координаттары болжолдуу. Маршруттун AQI — анын чекиттериндеги жандуу маалымат (📡 датчиктер / 🛰️ CAMS модели); шаардан сырткылар үчүн — маршрут чекитиндеги модель." },
  en: { soon: "Routes for this city are coming soon. Meanwhile, check the air map and the best time to walk on the home screen.", all: "All", rt_walk: "Walk", rt_bike: "Cycling", rt_run: "Running", rt_school: "To school", rt_commute: "Commute", rt_trip: "Day trip", sClean: "Cleanest first", sShort: "Shortest first",
    note: "Route coordinates are approximate. Route AQI uses live data at its waypoints (📡 sensors / 🛰️ CAMS model); out-of-town trips use the model at the route point." },
};
const R = k => RD[LANG][k] ?? RD.ru[k];

/* ---------- 4. Новости и погода ---------- */
const NW = {
  ru: { wxTitle: "Погода", title: "Новости и погода", sub: "Живой прогноз Open-Meteo и свежие новости для города {city}", now: "Сейчас", feels: "Ощущается", hum: "Влажность", wind: "Ветер", pres: "Давление", prec: "Осадки", cloud: "Облачность",
    h24: "Ближайшие 24 часа", d7: "7 дней", sunrise: "Восход", sunset: "Закат", upd: "Обновлено {t} · автообновление каждые 15 мин",
    smogHi: "⚠️ Риск смога: ночью ветер стихнет до {w} м/с{inv} — дым от печей застаивается. Вечером и ночью держите окна закрытыми.", smogLo: "✅ Риск смога невысокий: ветер {w} м/с перемешивает воздух.", inv: " и температурная инверсия (на высоте ~1,5 км теплее, чем у земли)",
    news: "Новости", newsSrc: "Источник: RSS изданий · обновление раз в час", cityNews: "Про {city}", kgNews: "Кыргызстан — последние", noCity: "Свежих новостей именно про {city} в ленте нет — показываем общие новости Кыргызстана.",
    fail: "Не удалось загрузить", retry: "Повторить", loading: "Загружаю…", hpa: "гПа", mm: "мм" },
  ky: { wxTitle: "Аба ырайы", title: "Жаңылыктар жана аба ырайы", sub: "Open-Meteo жандуу болжолу жана {city} үчүн жаңы кабарлар", now: "Азыр", feels: "Сезилет", hum: "Нымдуулук", wind: "Шамал", pres: "Басым", prec: "Жаан-чачын", cloud: "Булуттуулук",
    h24: "Жакынкы 24 саат", d7: "7 күн", sunrise: "Күн чыгышы", sunset: "Күн батышы", upd: "Жаңыланды {t} · ар 15 мүн. сайын автоматтык",
    smogHi: "⚠️ Смог коркунучу: түнкүсүн шамал {w} м/с чейин басаңдайт{inv} — мештердин түтүнү туруп калат. Кечинде жана түнү терезелерди жабык кармаңыз.", smogLo: "✅ Смог коркунучу төмөн: {w} м/с шамал абаны аралаштырат.", inv: " жана температуралык инверсия (~1,5 км бийиктикте жерге караганда жылуу)",
    news: "Жаңылыктар", newsSrc: "Булак: басылмалардын RSS · саатына бир жаңылоо", cityNews: "{city} тууралуу", kgNews: "Кыргызстан — акыркылар", noCity: "Тасмада дал {city} тууралуу жаңы кабар жок — Кыргызстандын жалпы жаңылыктары көрсөтүлдү.",
    fail: "Жүктөлгөн жок", retry: "Кайталоо", loading: "Жүктөлүүдө…", hpa: "гПа", mm: "мм" },
  en: { wxTitle: "Weather", title: "News & weather", sub: "Live Open-Meteo forecast and fresh news for {city}", now: "Now", feels: "Feels like", hum: "Humidity", wind: "Wind", pres: "Pressure", prec: "Precipitation", cloud: "Cloud cover",
    h24: "Next 24 hours", d7: "7 days", sunrise: "Sunrise", sunset: "Sunset", upd: "Updated {t} · auto-refresh every 15 min",
    smogHi: "⚠️ Smog risk: at night the wind drops to {w} m/s{inv} — stove smoke stagnates. Keep windows closed in the evening and at night.", smogLo: "✅ Low smog risk: {w} m/s wind mixes the air.", inv: " and a temperature inversion (warmer at ~1.5 km than at ground level)",
    news: "News", newsSrc: "Source: publishers' RSS · refreshed hourly", cityNews: "About {city}", kgNews: "Kyrgyzstan — latest", noCity: "No fresh items about {city} in the feed right now — showing general Kyrgyzstan news.",
    fail: "Failed to load", retry: "Retry", loading: "Loading…", hpa: "hPa", mm: "mm" },
};
Object.assign(NW.ru, { profLg: "температура воздуха по высоте", profInv1: "{t}: у земли {t0}, а уже на высоте ~{m} м — {t1} (теплее на {d} °C). Это инверсия: тёплый слой сверху работает как крышка — дым печей и выхлопы остаются у земли.", profT: "Профиль температуры над городом", profAria: "График: температура воздуха на разной высоте над городом в {t} (модель)", profInv: "{t}: у земли {t0}; теплее становится уже с высоты ~{m0} м, а на ~{m} м — {t1} (на {d} °C теплее, чем у земли). Это инверсия: тёплый слой сверху работает как крышка — дым печей и выхлопы остаются у земли.", profNo: "{t}: с высотой становится холоднее (у земли {t0}, на ~{m} м — {t1}) — инверсии нет, воздух может подниматься и рассеиваться.", profBlh: "Слой перемешивания, в котором рассеивается дым, — ~{m} м.", blhL: "слой перемешивания ~{m} м", mU: "м", gnd: "земля", profSrc: "Модель Open-Meteo, а не измерения зонда: уровни давления 925–700 гПа выше рельефа (здесь — {n}), высоты — оценка по давлению. Показан час этой ночи с самой сильной инверсией (если её нет — 06:00).", invZ: " и температурная инверсия (уже примерно в {m} м над городом теплее, чем у земли, на {d} °C — оценка)", nightHi: "🌙 Ночью ({h}): {f} — дым от печей может застаиваться до утра. Проветривайте днём.", nightW: "ветер стихнет до {w} м/с (минимум в {t})", nightInv: "инверсия (уже примерно в {m} м над городом теплее, чем у земли, на {d} °C)", wxTab: "Погода", updN: "Новости обновлены {t}", srcN: "источников: {n}", noCity2: "Свежих новостей про {city} в лентах сейчас нет.", ctryNews: "Новости страны — {c}", newsSrc2: "Источники: публичные RSS-ленты изданий (заголовки и ссылки на оригинал), сервер приложения забирает их раз в час: {s}", newsFail: "в последний раз не ответили (показаны прошлые заголовки): {s}", airNews: "Экология: воздух, смог, уголь", newsNone: "Новости сейчас недоступны: файл с заголовками не загрузился (нет сети или лента ещё не обновилась).", newsDirect: "Сайты изданий:", newsStale: "Ленты давно не обновлялись — заголовки могут быть устаревшими." });
Object.assign(NW.ky, { profLg: "абанын бийиктик боюнча температурасы", profInv1: "{t}: жерде {t0}, ал эми ~{m} м бийиктикте эле — {t1} ({d} °C жылуу). Бул инверсия: үстүндөгү жылуу катмар капкактай болуп, мештердин түтүнү жана унаалардын газы жерге жакын калат.", profT: "Шаардын үстүндөгү температура профили", profAria: "График: {t} убагында шаардын үстүндө ар кандай бийиктиктеги абанын температурасы (модель)", profInv: "{t}: жерде {t0}; ~{m0} м бийиктиктен баштап эле жылуураак, ал эми ~{m} м бийиктикте — {t1} (жерге караганда {d} °C жылуу). Бул инверсия: үстүндөгү жылуу катмар капкактай болуп, мештердин түтүнү жана унаалардын газы жерге жакын калат.", profNo: "{t}: бийиктеген сайын суук (жерде {t0}, ~{m} м бийиктикте — {t1}) — инверсия жок, аба көтөрүлүп, таралышы мүмкүн.", profBlh: "Түтүн тарай турган аралашуу катмары — ~{m} м.", blhL: "аралашуу катмары ~{m} м", mU: "м", gnd: "жер", profSrc: "Open-Meteo модели, зонддун өлчөөсү эмес: рельефтен жогору 925–700 гПа басым деңгээлдери (бул жерде — {n}), бийиктиктер басым боюнча баалоо. Бул түндүн эң күчтүү инверсиясы бар сааты көрсөтүлөт (инверсия жок болсо — 06:00).", invZ: " жана температуралык инверсия (шаардан болжол менен {m} м бийиктикте эле жерге караганда {d} °C жылуу — баалоо)", nightHi: "🌙 Түнкүсүн ({h}): {f} — мештердин түтүнү эртең мененге чейин туруп калышы мүмкүн. Күндүзү желдетиңиз.", nightW: "шамал {w} м/с чейин басаңдайт (эң азы саат {t})", nightInv: "инверсия (шаардан болжол менен {m} м бийиктикте эле жерге караганда {d} °C жылуу)", wxTab: "Аба ырайы", updN: "Жаңылыктар жаңыланды {t}", srcN: "булактар: {n}", noCity2: "Тасмаларда азыр {city} тууралуу жаңы кабар жок.", ctryNews: "Өлкөнүн жаңылыктары — {c}", newsSrc2: "Булактар: басылмалардын ачык RSS тасмалары (аталыштар жана түпнускага шилтемелер), колдонмонун сервери саатына бир жолу алат: {s}", newsFail: "акыркы жолу жооп бербеди (мурунку аталыштар көрсөтүлдү): {s}", airNews: "Экология: аба, түтүн, көмүр", newsNone: "Жаңылыктар азыр жеткиликсиз: аталыштар файлы жүктөлгөн жок (тармак жок же тасма али жаңыланган жок).", newsDirect: "Басылмалардын сайттары:", newsStale: "Тасмалар көптөн бери жаңыланган жок — аталыштар эскирген болушу мүмкүн." });
Object.assign(NW.en, { profLg: "air temperature by height", profInv1: "{t}: {t0} at ground level, but already {t1} at ~{m} m ({d} °C warmer). This is an inversion: the warm layer above acts like a lid, so stove smoke and exhaust stay near the ground.", profT: "Temperature profile above the city", profAria: "Chart: air temperature at different heights above the city at {t} (model)", profInv: "{t}: {t0} at ground level; it is already warmer from ~{m0} m up, and {t1} at ~{m} m ({d} °C warmer than at the ground). This is an inversion: the warm layer above acts like a lid, so stove smoke and exhaust stay near the ground.", profNo: "{t}: it gets colder with height ({t0} at ground level, {t1} at ~{m} m) — no inversion, air can rise and disperse.", profBlh: "The mixing layer, where smoke disperses, is ~{m} m deep.", blhL: "mixing layer ~{m} m", mU: "m", gnd: "ground", profSrc: "Open-Meteo model, not radiosonde measurements: 925–700 hPa pressure levels above the terrain (here: {n}), heights estimated from pressure. Shows tonight's hour with the strongest inversion (06:00 if there is none).", invZ: " and a temperature inversion (already about {m} m above the city it is {d} °C warmer than at ground level — estimate)", nightHi: "🌙 At night ({h}): {f} — stove smoke may stagnate until morning. Air out during the day.", nightW: "the wind drops to {w} m/s (lowest at {t})", nightInv: "an inversion (already about {m} m above the city it is {d} °C warmer than at ground level)", wxTab: "Weather", updN: "News updated {t}", srcN: "sources: {n}", noCity2: "No fresh items about {city} in the feeds right now.", ctryNews: "Country news — {c}", newsSrc2: "Sources: publishers' public RSS feeds (headlines and links to the original), fetched hourly by the app's server: {s}", newsFail: "did not respond last time (showing earlier headlines): {s}", airNews: "Environment: air, smog, coal", newsNone: "News is unavailable right now: the headlines file did not load (no connection or the feed has not been updated yet).", newsDirect: "Publisher websites:", newsStale: "The feeds have not been updated for a while — headlines may be outdated." });
const N = (k, v = {}) => String(NW[LANG][k] ?? NW.ru[k]).replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
Object.assign(DICT.ru, { tab_news: "Новости", q_news: "Новости" }); Object.assign(DICT.ky, { tab_news: "Жаңылык", q_news: "Жаңы­лыктар" }); Object.assign(DICT.en, { tab_news: "News", q_news: "News" });
const WMO = c => c === 0 ? "☀️" : c <= 2 ? "🌤️" : c === 3 ? "☁️" : c <= 48 ? "🌁" : c <= 57 ? "🌦️" : c <= 67 ? "🌧️" : c <= 77 ? "🌨️" : c <= 82 ? "🌧️" : c <= 86 ? "❄️" : "⛈️";
const DIRS = { ru: ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"], ky: ["Т", "ТЧ", "Ч", "ТшЧ", "Тш", "ТшБ", "Б", "ТБ"], en: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] };
const DIRW = { ru: ["северный", "северо-восточный", "восточный", "юго-восточный", "южный", "юго-западный", "западный", "северо-западный"],
  ky: ["түндүк", "түндүк-чыгыш", "чыгыш", "түштүк-чыгыш", "түштүк", "түштүк-батыш", "батыш", "түндүк-батыш"],
  en: ["northerly", "north-easterly", "easterly", "south-easterly", "southerly", "south-westerly", "westerly", "north-westerly"] };
/* v56: стрелка (куда дует) + полное слово (откуда): «З» больше не путается с цифрой 3 */
const dirOf = d => `<span class="wdir" title="${(DIRW[LANG] || DIRW.ru)[Math.round(d / 45) % 8]}"><i aria-hidden="true" style="display:inline-block;transform:rotate(${Math.round(d)}deg)">↓</i> ${(DIRW[LANG] || DIRW.ru)[Math.round(d / 45) % 8]}</span>`;
const CITY_RX = { bishkek: /Бишкек/i, osh: /(^|[^А-Яа-яЁё])Ош(а|е|ом|ск|ской|скую)?([^А-Яа-яЁё]|$)/, naryn: /Нарын/i, jalal: /Джалал-Абад|Жалал-Абад/i, karakol: /Каракол|Иссык-Кул/i, talas: /Талас/i, batken: /Баткен/i, tokmok: /Токмок/i };
/* v51: температурная инверсия по профилю из нескольких уровней (925/900/850/800/700 гПа).
 * Берём только уровни, которые выше рельефа (давление минимум на 8 гПа ниже, чем у земли, ≈ 70 м) и не выше ~1,6 км над городом.
 * Раньше (v50) сравнивали только с 850 или 700 гПа (≈0,8 км над Бишкеком) и пропускали приземные инверсии в нижних 100–300 м,
 * которые как раз держат дым печей. Высота уровней — по барометрической формуле (оценка). Это модель Open-Meteo, не зонд. */
const INV_LV = [925, 900, 850, 800, 700];
function invProfile(H, i) {
  const T = H && H.temperature_2m ? H.temperature_2m[i] : null, ps = H && H.surface_pressure ? H.surface_pressure[i] : null;
  if (T == null || ps == null) return null;
  const lv = [];
  for (const p of INV_LV) {
    const Tp = H["temperature_" + p + "hPa"] ? H["temperature_" + p + "hPa"][i] : null;
    if (Tp == null || p > ps - 8) continue;
    const z = 29.27 * (273.15 + (T + Tp) / 2) * Math.log(ps / p);   // м над поверхностью (оценка)
    if (z > 1600 && lv.length) break;
    lv.push({ p, T: Tp, z });
    if (z > 1600) break;
  }
  return lv.length ? { T2: T, lv, blh: H.boundary_layer_height ? H.boundary_layer_height[i] : null } : null;
}
function invAt(H, i) {
  const pr = invProfile(H, i); if (!pr) return null;
  const warm = pr.lv.filter(l => l.T > pr.T2);
  const top = warm.length ? warm.reduce((m, l) => l.T > m.T ? l : m) : null;
  return { inv: !!warm.length, dz: (warm.length ? warm[0].z : pr.lv[0].z) / 1000, dT: top ? top.T - pr.T2 : 0, p: (warm[0] || pr.lv[0]).p, n: pr.lv.length, blh: pr.blh };
}
const mRound = km => Math.max(50, Math.round(km * 1000 / 50) * 50);
const newsState = { wx: {}, news: null, newsErr: false, wxErr: {}, timer: null };
async function loadWeather(force) {
  const id = CITY, c = cityObj().center, cur = newsState.wx[id];
  if (!force && cur && Date.now() - cur.at < 15 * 60e3) return;
  try {
    const u = `https://api.open-meteo.com/v1/forecast?latitude=${c[0]}&longitude=${c[1]}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation,cloud_cover,weather_code` +
      `&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability,temperature_925hPa,temperature_900hPa,temperature_850hPa,temperature_800hPa,temperature_700hPa,surface_pressure,boundary_layer_height&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum&wind_speed_unit=ms&timezone=auto&forecast_days=7`;
    newsState.wx[id] = { at: Date.now(), d: await fetchJSON(u) }; newsState.wxErr[id] = false;
  } catch (e) { newsState.wxErr[id] = true; }
}
// v35: rss2json отвечал 403 → ленты забирает сервер (GitHub Actions, bot/news_fetch.js, раз в час) в news/<набор>.json.
// На GitHub Pages читаем со своего адреса, на других хостах (Surge, exe) — с raw.githubusercontent.com (CORS), запасной путь — другой.
const NEWS_REPO = "zusenbaev7-cmd/taza-aba", NEWS_RAW = `https://raw.githubusercontent.com/${NEWS_REPO}/main/news/`;
// набор лент по языку интерфейса: Kabar и 24.kg выпускают кыргызскую, русскую и английскую версии, Kloop — только русскую (в лентах).
// Для турецкого интерфейса у КР-изданий нет турецких лент → русский набор (самый полный).
const newsSet = ctry => "kg-" + (LANG === "ky" ? "ky" : LANG === "en" ? "en" : "ru");
async function loadNews(force) {
  const ctry = cityObj().country || "kg", set = newsSet(ctry);
  const cur = newsState.news;
  if (!force && cur && cur.set === set && Date.now() - cur.at < 30 * 60e3) return;
  if (cur && cur.set !== set) { newsState.news = null; newsSrcFilter = "all"; }
  // DOMParser не выполняет скрипты и не грузит картинки; вызываем ОДИН раз (повторный разбор превратил бы &lt;img…&gt; в настоящий HTML)
  const strip = s => (new DOMParser().parseFromString(String(s || ""), "text/html").body.textContent || "").replace(/\s+/g, " ").trim();
  const safeUrl = u => { try { const x = new URL(String(u || "").trim()); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };
  const bust = "?t=" + Math.floor(Date.now() / 600e3);
  const own = /\.github\.io$|^localhost$|^127\.0\.0\.1$/.test(location.hostname) ? ["news/"] : [];   // exe собирается без news/ → 404 → raw
  let j = null;
  for (const base of [...own, NEWS_RAW]) { try { j = await fetchJSON(base + set + ".json" + bust); if (j && Array.isArray(j.feeds)) break; j = null; } catch (e) { j = null; } }
  if (!j) { newsState.newsErr = true; if (!cur || cur.set !== set) newsState.news = null; return; }
  const res = j.feeds.map(F => ({ F, ok: !!(F.items && F.items.length), fresh: F.ok, items: (F.items || []).map(x => ({ src: strip(F.name), title: strip(x.title), link: safeUrl(x.link), date: x.date, text: strip(x.text).slice(0, 400) })).filter(x => x.title) }));
  const ok = res.filter(r => r.ok && r.items.length);
  if (!ok.length) { newsState.newsErr = true; if (!cur || cur.set !== set) newsState.news = null; return; }
  const seen = new Set(), items = [];
  ok.flatMap(r => r.items).forEach(x => { const k = x.title.toLowerCase().replace(/[^a-zа-яёçğıöşüөүң0-9]/gi, "").slice(0, 60); if (!seen.has(k) && !(x.link && seen.has(x.link))) { seen.add(k); if (x.link) seen.add(x.link); items.push(x); } });
  items.sort((x, y) => newsTs(y) - newsTs(x));
  newsState.news = { ctry, set, at: Date.now(), updated: Date.parse(j.updated) || 0, items, sources: ok.map(r => strip(r.F.name)), failed: res.filter(r => !r.fresh).map(r => strip(r.F.name)) };
  newsState.newsErr = false;
}
const NEWS_AIR_RX = /смог|качеств\S* воздух|загрязн\S* воздух|выброс|углем|угля|уголь|печн\S* отоплен|түтүн|абанын сапат|аба булга|көмүр|air quality|air pollution|smog|emission|coal|hava kirlili|hava kalitesi|egzoz|kömür|эколог|экология|ecolog|ekoloj/i;
const newsTs = x => Date.parse(x.date || "") || 0;
let newsSrcFilter = "all";
const escRx = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
function cityNewsRx() {
  const c = cityObj(), parts = [c.name.ru, c.name.ky, c.name.en].filter((v, i, arr) => v && arr.indexOf(v) === i).map(escRx);
  const extra = CITY_RX[CITY] || c.newsRx;
  const base = c.id === "osh" || c.newsRx ? null : new RegExp(parts.join("|"), "i");   // у KG-городов с newsRx — только он (с границами слова: «Кант» ≠ «Кантор»)
  return { test: s => (base ? base.test(s) : false) || (extra ? extra.test(s) : false) };
}
function newsHTML() {
  if (!newsState.news) return newsState.newsErr ? `<div class="card fail">⚠️ ${N("newsNone")} <button class="btn ghost" data-retry="news">${N("retry")}</button>
      <p class="small">${N("newsDirect")} ${(NEWS_SITES[cityObj().country || "kg"] || []).map(([n, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(n)}</a>`).join(" · ")}</p></div>` : `<div class="card">${N("loading")}</div>`;
  const S = newsState.news, rx = cityNewsRx(), cn = ctryName(cityObj().country || "kg");
  const items = S.items.filter(x => newsSrcFilter === "all" || x.src === newsSrcFilter);
  // v35: новости про воздух/смог/уголь — отдельным блоком сверху (полезно мэрии и жителям); остальное — как раньше
  const air = items.filter(x => NEWS_AIR_RX.test(x.title + " " + x.text));
  const mine = items.filter(x => !air.includes(x) && rx.test(x.title + " " + x.text)), rest = items.filter(x => !mine.includes(x) && !air.includes(x));
  const dt = x => { const d = new Date(newsTs(x)); return !newsTs(x) ? "" : d.toLocaleString(numLocale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }); };
  const li = x => `<${x.link ? "a" : "div"} class="card news-item"${x.link ? ` href="${esc(x.link)}" target="_blank" rel="noopener noreferrer"` : ""}><b>${NEWS_AIR_RX.test(x.title) ? "💨 " : ""}${esc(x.title)}</b><div class="small muted"><span class="nsrc">${esc(x.src)}</span> · ${esc(dt(x))}</div></${x.link ? "a" : "div"}>`;
  const chips = `<div class="adv-modes nchips">${["all", ...S.sources].map(s => `<button class="${newsSrcFilter === s ? "on" : ""}" aria-pressed="${newsSrcFilter === s}" data-nsrc="${esc(s)}">${s === "all" ? R("all") : esc(s)}</button>`).join("")}</div>`;
  return `${chips}
    <p class="small muted">🕒 ${N("updN", { t: new Date(S.updated || S.at).toLocaleString(numLocale(), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) })} · ${N("srcN", { n: S.sources.length })}</p>
    ${S.updated && Date.now() - S.updated > 6 * 3600e3 ? `<p class="small muted">⚠️ ${N("newsStale")}</p>` : ""}
    ${air.length ? `<h3 class="nh">💨 ${N("airNews")} · ${air.length}</h3>${air.slice(0, 6).map(li).join("")}` : ""}
    <h3 class="nh">${N("cityNews", { city: tr(cityObj().name) })} · ${mine.length}</h3>
    ${mine.length ? mine.slice(0, 15).map(li).join("") : `<p class="small muted">${N("noCity2", { city: tr(cityObj().name) })}</p>`}
    ${mine.length < 3 ? `<h3 class="nh">🗞️ ${N("ctryNews", { c: cn })}</h3>${rest.slice(0, 12).map(li).join("")}` : ""}
    <p class="small muted">${N("newsSrc2", { s: S.sources.join(", ") })}${S.failed.length ? " · " + N("newsFail", { s: S.failed.join(", ") }) : ""}</p>`;
}
/* v50: на «Погоде» — тот же «Риск вечернего смога», что на главной (раньше здесь была своя формула только по ветру,
 * и экраны противоречили друг другу: «можно проветривать» / «держите окна закрытыми»). Отдельной строкой — ночь (0–8 ч). */
function wxSmogNote(h, hrs) {
  try {
    if (typeof eveningRisk !== "function" || typeof air === "undefined" || !air.live || !air.wxH || !state.district) return "";
    const r = eveningRisk(air.byDistrict[state.district]); if (!r) return "";
    const f = typeof evFactors === "function" ? evFactors(r) : [Q("evF", { a: r.aqMax })];
    let out = `<div class="smog-note wx-ev ${r.risk ? "hi" : ""}"><div>${r.risk ? "⚠️" : "✅"} ${Q("evTitle")}${r.tomorrow ? " (" + Q("evTomorrow") + ")" : ""}: ${Q("ev" + r.risk)}. ${r.adv}</div>
      <div class="wx-ev-f">${f.join(" · ")} · ${Q("evSrc")}</div></div>`;
    // ночь: первый непрерывный отрезок 00–08 ч в ближайших 24 ч
    const nh = []; for (const x of hrs) { const hh = +x.tm.slice(11, 13); if (hh <= 8) nh.push(x); else if (nh.length) break; }
    if (nh.length >= 3) {
      const nw = Math.min(...nh.map(x => x.w).filter(v => v != null)), ni = nh.map(x => invAt(h, x.k)).filter(v => v && v.inv);
      const nwAt = (nh.find(x => x.w === nw) || nh[0]).tm.slice(11, 16);
      const parts = []; if (isFinite(nw) && nw < 1) parts.push(N("nightW", { w: fmt(nw, 1), t: nwAt }));
      if (ni.length) parts.push(N("nightInv", { m: mRound(Math.min(...ni.map(v => v.dz))), d: fmt(Math.max(...ni.map(v => v.dT)), 1) }));
      if (parts.length) out += `<div class="smog-note wx-night hi">${N("nightHi", { h: nh[0].tm.slice(11, 16) + "–" + nh[nh.length - 1].tm.slice(11, 13) + ":59", f: parts.join(", ") })}</div>`;
    }
    return out;
  } catch (e) { return ""; }
}
/* v51: «Профиль температуры над городом» — как устроен воздух ночью (модель Open-Meteo, уровни выше рельефа). */
function wxProfileHTML(h, night) {
  try {
    const cand = night.map(x => ({ x, pr: invProfile(h, x.k), iv: invAt(h, x.k) })).filter(o => o.pr && o.iv);
    if (!cand.length) return "";
    const invs = cand.filter(o => o.iv.inv);
    const pick = invs.length ? invs.reduce((a, o) => o.iv.dT > a.iv.dT ? o : a) : (cand.find(o => +o.x.tm.slice(11, 13) === 6) || cand[cand.length - 1]);
    const { pr, iv, x } = pick, pts = [{ z: 0, T: pr.T2 }].concat(pr.lv.map(l => ({ z: l.z, T: l.T })));
    const W = 320, H = 170, L = 44, R = 12, Tp = 12, B = 26;
    const tMin = Math.floor(Math.min(...pts.map(p => p.T)) - 1), tMax = Math.ceil(Math.max(...pts.map(p => p.T)) + 1);
    const zMax = Math.max(400, Math.ceil(Math.max(...pts.map(p => p.z), pr.blh || 0) / 200) * 200);
    const X = T => L + (T - tMin) / (tMax - tMin) * (W - L - R), Y = z => H - B - z / zMax * (H - B - Tp);
    const zt = []; for (let z = 0; z <= zMax; z += zMax > 1000 ? 400 : 200) zt.push(z);
    const tt = []; const st = Math.max(1, Math.ceil((tMax - tMin) / 5)); for (let T = tMin; T <= tMax; T += st) tt.push(T);
    const deg = v => fmt(v, 1) + "°";
    const hh = x.tm.slice(11, 16), top = pts.slice(1).reduce((a, p) => p.T > a.T ? p : a);
    const blhOk = pr.blh != null && pr.blh <= zMax;
    const svg = `<svg class="wx-prof-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(N("profAria", { t: hh }))}">
      ${zt.map(z => `<line class="g" x1="${L}" x2="${W - R}" y1="${Y(z)}" y2="${Y(z)}"/><text class="ax" x="${L - 6}" y="${Y(z) + 4}" text-anchor="end">${z ? z + " " + N("mU") : N("gnd")}</text>`).join("")}
      ${tt.map(T => `<text class="ax" x="${X(T)}" y="${H - 8}" text-anchor="middle">${fmt(T, 0)}°</text>`).join("")}
      ${blhOk ? `<line class="blh" x1="${L}" x2="${W - R}" y1="${Y(pr.blh)}" y2="${Y(pr.blh)}"/>` : ""}
      <polyline class="ln${iv.inv ? " inv" : ""}" points="${pts.map(p => X(p.T).toFixed(1) + "," + Y(p.z).toFixed(1)).join(" ")}"/>
      ${pts.map(p => `<circle class="pt${p.z ? "" : " g0"}" cx="${X(p.T).toFixed(1)}" cy="${Y(p.z).toFixed(1)}" r="4"><title>${p.z ? "~" + Math.round(p.z / 10) * 10 + " " + N("mU") : N("gnd")}: ${deg(p.T)}</title></circle>`).join("")}
    </svg>`;
    const txt = iv.inv ? N(mRound(iv.dz) === mRound(top.z / 1000) ? "profInv1" : "profInv", { t: hh, t0: deg(pr.T2), m0: mRound(iv.dz), m: mRound(top.z / 1000), t1: deg(top.T), d: fmt(iv.dT, 1) })
      : N("profNo", { t: hh, t0: deg(pr.T2), m: mRound(pts[pts.length - 1].z / 1000), t1: deg(pts[pts.length - 1].T) });
    return `<div class="card wx-prof"><h3>🌡️ ${N("profT")}</h3><p class="wx-prof-txt ${iv.inv ? "hi" : ""}">${txt}${pr.blh != null ? " " + N("profBlh", { m: Math.max(10, Math.round(pr.blh / 10) * 10) }) : ""}</p>
      ${svg}<div class="wx-prof-lg small"><span><i class="sw ln${iv.inv ? " inv" : ""}"></i>${N("profLg")}</span>${blhOk ? `<span><i class="sw blh"></i>${esc(N("blhL", { m: Math.max(10, Math.round(pr.blh / 10) * 10) }))}</span>` : ""}</div><p class="small muted">${N("profSrc", { n: pr.lv.length })}</p></div>`;
  } catch (e) { return ""; }
}
function wxHTML() {
  const W = newsState.wx[CITY];
  if (!W) return newsState.wxErr[CITY] ? `<div class="card fail">⚠️ ${N("fail")} <button class="btn ghost" data-retry="wx">${N("retry")}</button></div>` : `<div class="card skeleton" style="height:180px"></div>`;
  const d = W.d, c = d.current, h = d.hourly;
  const i0 = Math.max(0, h.time.findIndex(tm => tm >= c.time.slice(0, 13)));
  const hrs = h.time.slice(i0, i0 + 24).map((tm, k) => ({ tm, T: h.temperature_2m[i0 + k], wc: h.weather_code[i0 + k], p: h.precipitation_probability?.[i0 + k], w: h.wind_speed_10m[i0 + k], k: i0 + k }));
  const night = hrs.filter(x => { const hh = +x.tm.slice(11, 13); return hh >= 18 || hh <= 8; }).slice(0, 12);
  const minW = Math.min(c.wind_speed_10m, ...night.map(x => x.w));
  const invs = night.map(x => invAt(h, x.k)).filter(v => v && v.inv), inv = invs.length > 0;
  const zOf = a => mRound(Math.min(...a.map(v => v.dz))), dOf = a => fmt(Math.max(...a.map(v => v.dT)), 1);
  const risk = minW < 2 || inv && minW < 3.5;
  const smogNote = wxSmogNote(h, hrs) || `<div class="smog-note ${risk ? "hi" : ""}">${risk ? N("smogHi", { w: fmt(minW, 1), inv: inv ? N("invZ", { m: zOf(invs), d: dOf(invs) }) : "" }) : N("smogLo", { w: fmt(minW, 1) })}</div>`;
  const dd = d.daily;
  return `
    <div class="card wx-now">
      <div class="row between"><div><div class="wx-ico">${WMO(c.weather_code)}</div></div>
        <div style="flex:1;margin-left:14px"><div class="wx-t">${fmt(c.temperature_2m, 0)}°C</div><div class="muted" style="font-weight:700">${N("feels")} ${fmt(c.apparent_temperature, 0)}°C</div></div>
        <div class="wx-sun small"><div>🌅 ${N("sunrise")} <b>${dd.sunrise[0].slice(11, 16)}</b></div><div>🌇 ${N("sunset")} <b>${dd.sunset[0].slice(11, 16)}</b></div></div></div>
      <div class="wx-grid">
        <div><span>💧 ${N("hum")}</span><b>${c.relative_humidity_2m}%</b></div>
        <div><span>💨 ${N("wind")}</span><b>${fmt(c.wind_speed_10m, 1)} ${LANG === "en" ? "m/s" : "м/с"} ${dirOf(c.wind_direction_10m)}</b></div>
        <div><span>🧭 ${N("pres")}</span><b>${fmt(c.surface_pressure, 0)} ${N("hpa")}</b></div>
        <div><span>🌧️ ${N("prec")}</span><b>${fmt(c.precipitation, 1)} ${N("mm")}</b></div>
        <div><span>☁️ ${N("cloud")}</span><b>${c.cloud_cover}%</b></div>
      </div>
      ${smogNote}
      <div class="small muted" style="margin-top:8px">🛰️ Open-Meteo · ${N("upd", { t: new Date(W.at).toLocaleTimeString(numLocale(), { hour: "2-digit", minute: "2-digit" }) })}</div>
    </div>
    ${wxProfileHTML(h, night)}
    <h2>🕒 ${N("h24")}</h2>
    <div class="wx-hours">${hrs.map(x => `<div><span>${x.tm.slice(11, 16)}</span><b>${WMO(x.wc)}</b><i>${fmt(x.T, 0)}°</i>${x.p != null ? `<small>${x.p}%</small>` : ""}</div>`).join("")}</div>
    <h2>📅 ${N("d7")}</h2>
    <div class="card wx-days">${dd.time.map((tm, k) => `<div><span>${new Date(tm + "T12:00").toLocaleDateString(LANG === "en" ? "en-GB" : "ru-RU", { weekday: "short", day: "numeric" })}</span><b>${WMO(dd.weather_code[k])}</b><i>${fmt(dd.temperature_2m_min[k], 0)}° … <strong>${fmt(dd.temperature_2m_max[k], 0)}°</strong></i><small>${dd.precipitation_sum[k] ? fmt(dd.precipitation_sum[k], 1) + " " + N("mm") : ""}</small></div>`).join("")}</div>`;
}
function viewNews(el) {
  const paint = () => {
    const h = location.hash;
    if (!h.startsWith("#news") && !h.startsWith("#weather")) return;
    const wOnly = h.startsWith("#weather");
    el.innerHTML = `<h1>${wOnly ? "🌤️" : "📰"} ${N(wOnly ? "wxTitle" : "title")}</h1><p class="sub">${N("sub", { city: tr(cityObj().name) })}</p>
      <div class="adv-modes nw-tabs"><a href="#news" class="${wOnly ? "" : "on"}" aria-current="${!wOnly}">📰 ${N("news")}</a><a href="#weather" class="${wOnly ? "on" : ""}" aria-current="${wOnly}">🌤️ ${N("wxTab")}</a></div>
      ${wOnly ? `<div class="wx-only">${wxHTML()}</div>` : `<div class="news-grid"><div class="col"><h2>📰 ${N("news")}</h2>${newsHTML()}</div><div class="col wx-mini">${wxHTML()}</div></div>`}`;
    el.querySelectorAll("[data-nsrc]").forEach(b => b.onclick = () => { newsSrcFilter = b.dataset.nsrc; paint(); });
    el.querySelectorAll("[data-retry]").forEach(b => b.onclick = async () => { b.disabled = true; b.dataset.retry === "wx" ? await loadWeather(true) : await loadNews(true); paint(); decorate(el); });
    decorate(el);
  };
  paint();
  Promise.all([loadWeather(), loadNews()]).then(paint);
  clearInterval(newsState.timer);
  newsState.timer = setInterval(() => {
    if (!location.hash.startsWith("#news") && !location.hash.startsWith("#weather")) { clearInterval(newsState.timer); return; }
    Promise.all([loadWeather(), loadNews()]).then(paint);
  }, 60e3);
}

/* ---------- 5. Страны: Кыргызстан / Турция ---------- */
const NEWS_FEEDS = {
  kg: [{ url: "https://kabar.kg/rss/", name: "Kabar" }, { url: "https://24.kg/rss/", name: "24.kg" }, { url: "https://kloop.kg/feed/", name: "Kloop" }],
  
};
const NEWS_SITES = { kg: [["Kabar", "https://kabar.kg/"], ["24.kg", "https://24.kg/"], ["Kloop", "https://kloop.kg/"]] };
const NEWS_FEED = { kg: { url: "https://24.kg/rss/", name: "24.kg" } };
const CTRY = { ru: { kg: "Кыргызстан", lbl: "Страна" }, ky: { kg: "Кыргызстан", lbl: "Өлкө" }, en: { kg: "Kyrgyzstan", lbl: "Country" } };
const ctryName = k => CTRY[LANG][k];
const ctryT = k => t(k);   // v58: Турция удалена

/* ---------- 6. Загрязнители и уровни ---------- */
function pm10ToAqi(c) {
  const B = [[0, 54, 0, 50], [55, 154, 51, 100], [155, 254, 101, 150], [255, 354, 151, 200], [355, 424, 201, 300], [425, 604, 301, 500]];
  c = Math.floor(c);
  for (const [cl, ch, il, ih] of B) if (c <= ch) return Math.round((ih - il) / (ch - cl) * (Math.max(c, cl) - cl) + il);
  return 500;
}
const POL = {
  ru: { title: "Загрязнители", sub: "Текущие концентрации и индекс US AQI по каждому веществу", levels: "Что значат уровни AQI", src_s: "датчики", src_m: "модель", unit: "мкг/м³", na: "нет данных",
    pm25: ["PM2.5", "мелкая пыль: печи на угле, транспорт"], pm10: ["PM10", "крупная пыль: дороги, стройки"], no2: ["NO₂", "диоксид азота: выхлопы, ТЭЦ"], so2: ["SO₂", "диоксид серы: сжигание угля"], o3: ["O₃", "приземный озон: летом в солнечные дни"], co: ["CO", "угарный газ: неполное сгорание топлива"],
    main: "Главный загрязнитель сейчас: {p}", note: "PM — по датчикам, если они есть рядом, иначе модель CAMS; газы — модель CAMS (Open-Meteo)." },
  ky: { title: "Булгоочу заттар", sub: "Учурдагы концентрациялар жана ар бир зат боюнча US AQI индекси", levels: "AQI деңгээлдери эмнени билдирет", src_s: "датчиктер", src_m: "модель", unit: "мкг/м³", na: "маалымат жок",
    pm25: ["PM2.5", "майда чаң: көмүр мештер, транспорт"], pm10: ["PM10", "ири чаң: жолдор, курулуштар"], no2: ["NO₂", "азот диоксиди: түтүн, ЖЭБ"], so2: ["SO₂", "күкүрт диоксиди: көмүр жагуу"], o3: ["O₃", "жер үстүндөгү озон: жайында күнөстүү күндөрү"], co: ["CO", "ис газы: отундун толук күйбөшү"],
    main: "Азыркы негизги булгоочу: {p}", note: "PM — жакын жерде датчик болсо датчиктер боюнча, болбосо CAMS модели; газдар — CAMS модели (Open-Meteo)." },
  en: { title: "Pollutants", sub: "Current concentrations and the US AQI sub-index for each pollutant", levels: "What the AQI levels mean", src_s: "sensors", src_m: "model", unit: "µg/m³", na: "no data",
    pm25: ["PM2.5", "fine dust: coal stoves, traffic"], pm10: ["PM10", "coarse dust: roads, construction"], no2: ["NO₂", "nitrogen dioxide: exhaust, power plants"], so2: ["SO₂", "sulphur dioxide: burning coal"], o3: ["O₃", "ground-level ozone: sunny summer days"], co: ["CO", "carbon monoxide: incomplete combustion"],
    main: "Main pollutant right now: {p}", note: "PM uses nearby sensors when available, otherwise the CAMS model; gases use the CAMS model (Open-Meteo)." },
  
};
const P_ = k => (POL[LANG] || POL.en)[k];
const LV_RANGE = ["0–50", "51–100", "101–150", "151–200", "201–300", "301+"];
function pollutantsHTML(a) {
  if (!a || !a.pol) return "";
  const keys = ["pm25", "pm10", "no2", "so2", "o3", "co"];
  const rows = keys.map(k => ({ k, v: a.pol[k][0], q: a.pol[k][1], s: a.pol[k][2] }));
  const main = rows.filter(r => r.q != null).sort((x, y) => y.q - x.q)[0];
  const row = r => {
    if (r.v == null) return `<div class="pol-row"><div class="pol-name"><b>${P_(r.k)[0]}</b></div><span class="muted small">${P_("na")}</span></div>`;
    const Lv = r.q != null ? level(r.q) : null, w = r.q != null ? Math.min(100, r.q / 300 * 100) : 0;
    return `<div class="pol-row"><div class="pol-name"><b>${P_(r.k)[0]}</b><small>${P_(r.k)[1]}</small></div>
      <div class="pol-val"><b>${fmt(r.v, r.v < 10 ? 1 : 0)}</b> <small>${P_("unit")}</small></div>
      <div class="pol-bar" title="US AQI ${r.q ?? "—"}"><i style="width:${w}%;background:${Lv ? Lv.color : "#ccc"}"></i></div>
      <div class="pol-lv">${Lv ? `<span class="chip" style="background:${Lv.color}22;color:${Lv.color}">${r.q} · ${tr(Lv.short || Lv.name)}</span>` : "—"}<small>${r.s === "sensors" ? "📡 " + P_("src_s") : "🛰️ " + P_("src_m")}</small></div></div>`;
  };
  return `<h2>🧪 ${P_("title")}</h2>
    <div class="card pol-card"><p class="small muted" style="margin:0 0 8px">${P_("sub")}</p>
      ${main ? `<div class="pol-main">${P_("main").replace("{p}", `<b>${P_(main.k)[0]}</b>`)}</div>` : ""}
      ${rows.map(row).join("")}
      <p class="small muted" style="margin-top:8px">${P_("note")}</p>
      <details class="lv-details"><summary>📖 ${P_("levels")}</summary>
        ${AQI_LEVELS.map((L, i) => `<div class="lv-row"><span class="lv-sw" style="background:${L.color}">${LV_RANGE[i] || ""}</span><div><b>${tr(L.name)}</b><div class="small muted">${tr(L.text)}</div></div></div>`).join("")}
      </details></div>`;
}

/* ---------- 7. Тема: светлая / тёмная / авто ---------- */
const THEME_KEY = "tazaAba.theme";
const themeMode = () => localStorage.getItem(THEME_KEY) || "auto";
const darkMQ = matchMedia("(prefers-color-scheme: dark)");
const isDark = () => document.documentElement.dataset.theme === "dark";
function applyTheme() {
  const m = themeMode(), d = m === "dark" || (m === "auto" && darkMQ.matches);
  document.documentElement.dataset.theme = d ? "dark" : "light";
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.content = d ? "#0E1A14" : "#EEF1DF";
}
const THEME_L = { ru: { auto: "Тема: авто (как в системе)", light: "Тема: светлая", dark: "Тема: тёмная" }, ky: { auto: "Тема: авто (системадагыдай)", light: "Тема: жарык", dark: "Тема: караңгы" },
  en: { auto: "Theme: auto (system)", light: "Theme: light", dark: "Theme: dark" } };
function renderThemeBtn() {
  const b = document.getElementById("themeBtn"); if (!b) return;
  const m = themeMode(), L = (THEME_L[LANG] || THEME_L.en)[m];
  b.textContent = m === "auto" ? "🌓" : m === "dark" ? "🌙" : "☀️"; b.title = L; b.setAttribute("aria-label", L + " — " + ({ ru: "нажмите, чтобы сменить", ky: "алмаштыруу үчүн басыңыз", en: "tap to change" }[LANG] || "tap to change"));
}
function cycleTheme() { const m = themeMode(); localStorage.setItem(THEME_KEY, m === "auto" ? "light" : m === "light" ? "dark" : "auto"); applyTheme(); renderThemeBtn(); }
applyTheme();
darkMQ.addEventListener?.("change", () => { if (themeMode() === "auto") { applyTheme(); if (typeof route === "function") route(true); } });
