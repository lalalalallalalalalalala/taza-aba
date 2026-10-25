/* Таза Аба — живая навигация по эко-маршруту (v59-nav). Грузится лениво из eco.js по кнопке «Поехали».
 * GPS (watchPosition, высокая точность) → привязка к линии маршрута → камера «по ходу движения» (курс GPS, компас, «север вверху»),
 * плавный маркер между отсчётами, пройденная часть серая, впереди — цвет воздуха; авто-масштаб по скорости.
 * Подсказки поворотов: Valhalla trace_route (FOSSGIS) → свои тексты ru/ky/en; без сервиса — повороты по геометрии линии.
 * Голос (speechSynthesis или мост TazaApp.speak в APK), вибрация, сход с маршрута → перестроение с тем же приоритетом
 * («Чистый воздух / Без пробок / Баланс»), остаток/ETA, воздух впереди и доза PM2.5 — оценка (модель), прибытие, Wake Lock, экономный режим.
 * ?navsim=1 — симуляция (повтор маршрута с пешей/авто скоростью) для теста и записи; в интерфейсе подписано «Симуляция». */
(function () {
  const NT = {
    ru: { go: "Поехали", end: "Завершить", wait: "Ищу GPS…", acc: "точность ±{m} м", fromMe: "Маршрут начнётся от вашего местоположения", left: "осталось", eta: "прибытие", air: "Воздух впереди", dose: "Доза PM2.5", est: "оценка (модель)", noAir: "нет данных о воздухе",
      reroute: "Перестраиваю маршрут…", rerouted: "Маршрут перестроен · {p}", rrFail: "Не удалось перестроить — держитесь линии маршрута", off: "Вы ушли с маршрута на {m} м", arrived: "Вы на месте", arrSub: "{d} за {t}", doseTot: "Вдохнули PM2.5 ≈ {v} мкг", close: "Закрыть",
      north: "Север вверху", course: "По ходу движения", mute: "Без звука", sound: "Звук", low: "Экономный режим", lowOn: "Экономный режим: меньше анимации и 3D", lowBat: "Заряд низкий — включён экономный режим", recenter: "Вернуть",
      sim: "Симуляция", simOff: "Сойти с маршрута", geoT: "Нужна геолокация", geoP: "Чтобы вести вас по маршруту и подсказывать повороты, приложению нужно ваше местоположение. Координаты обрабатываются на телефоне; при перестроении маршрута текущая точка отправляется сервису маршрутов (Valhalla, FOSSGIS). Мы их не храним.",
      allow: "Разрешить и начать", cancel: "Отмена", denT: "Доступ к геолокации запрещён", denP: "Разрешите местоположение для этого сайта: значок слева от адреса → Разрешения → Местоположение. В приложении для Android: Настройки → Приложения → Таза Аба → Разрешения → Местоположение.",
      unT: "Геолокация недоступна", unP: "Не удаётся получить сигнал GPS. Включите геолокацию в настройках телефона и выйдите на открытое место.", insec: "Геолокация работает только по защищённому адресу (https).", retry: "Повторить",
      lowAcc: "Слабый сигнал GPS (±{m} м)", wl: "Экран не погаснет во время навигации", pref: { clean: "Чистый воздух", jam: "Без пробок", bal: "Баланс" }, then: "затем", km: "км", m: "м", min: "мин", h: "ч",
      t: { start: "Начните движение", right: "Поверните направо", left: "Поверните налево", sright: "Держитесь правее", sleft: "Держитесь левее", shright: "Резко направо", shleft: "Резко налево", uturn: "Развернитесь", straight: "Продолжайте прямо",
        ramp: "Съезд", stay: "Держитесь прямо", merge: "Перестройтесь в поток", round: "На круговом движении — {n}-й съезд", roundx: "Съезжайте с кругового движения", dest: "Вы прибыли", stairs: "Лестница", elev: "Лифт", ferry: "Паром" },
      on: " на {s}", inD: "Через {d} {a}" },
    ky: { go: "Жолго чыгуу", end: "Бүтүрүү", wait: "GPS изделүүдө…", acc: "тактык ±{m} м", fromMe: "Маршрут сиз турган жерден башталат", left: "калды", eta: "жетүү", air: "Алдыдагы аба", dose: "PM2.5 дозасы", est: "баалоо (модель)", noAir: "аба боюнча маалымат жок",
      reroute: "Маршрут кайра түзүлүүдө…", rerouted: "Маршрут кайра түзүлдү · {p}", rrFail: "Кайра түзүү мүмкүн болбоду — маршрут сызыгын карманыңыз", off: "Маршруттан {m} м четтедиңиз", arrived: "Сиз келдиңиз", arrSub: "{d} · {t}", doseTot: "Жутулган PM2.5 ≈ {v} мкг", close: "Жабуу",
      north: "Түндүк жогоруда", course: "Кыймыл боюнча", mute: "Үнсүз", sound: "Үн", low: "Үнөмдүү режим", lowOn: "Үнөмдүү режим: анимация жана 3D азыраак", lowBat: "Заряд аз — үнөмдүү режим күйдү", recenter: "Кайтаруу",
      sim: "Симуляция", simOff: "Маршруттан чыгуу", geoT: "Геолокация керек", geoP: "Маршрут боюнча алып жүрүү жана бурулуштарды айтуу үчүн жайгашкан жериңиз керек. Координаттар телефондо иштетилет; маршрут кайра түзүлгөндө учурдагы чекит маршрут кызматына (Valhalla, FOSSGIS) жөнөтүлөт. Биз аларды сактабайбыз.",
      allow: "Уруксат берип баштоо", cancel: "Жокко чыгаруу", denT: "Геолокацияга тыюу салынган", denP: "Бул сайтка жайгашкан жерди уруксат кылыңыз: дарек тилкесинин сол жагындагы белги → Уруксаттар → Жайгашкан жер. Android тиркемесинде: Жөндөөлөр → Тиркемелер → Таза Аба → Уруксаттар → Жайгашкан жер.",
      unT: "Геолокация жеткиликсиз", unP: "GPS сигналы жок. Телефондун жөндөөлөрүнөн геолокацияны күйгүзүп, ачык жерге чыгыңыз.", insec: "Геолокация коопсуз дарек (https) аркылуу гана иштейт.", retry: "Кайталоо",
      lowAcc: "GPS сигналы начар (±{m} м)", wl: "Навигация учурунда экран өчпөйт", pref: { clean: "Таза аба", jam: "Тыгынсыз", bal: "Тең салмак" }, then: "андан кийин", km: "км", m: "м", min: "мүн", h: "саат",
      t: { start: "Жолго чыгыңыз", right: "Оңго буруңуз", left: "Солго буруңуз", sright: "Оң жакты карманыңыз", sleft: "Сол жакты карманыңыз", shright: "Кескин оңго буруңуз", shleft: "Кескин солго буруңуз", uturn: "Артка бурулуңуз", straight: "Түз жүрө бериңиз",
        ramp: "Бурулуш жол", stay: "Түз карманыңыз", merge: "Агымга кошулуңуз", round: "Айланма жолдо {n}-чыгууга чыгыңыз", roundx: "Айланма жолдон чыгыңыз", dest: "Сиз келдиңиз", stairs: "Тепкич", elev: "Лифт", ferry: "Паром" },
      on: ", {s}", inD: "{d} кийин: {a}" },
    en: { go: "Start", end: "End", wait: "Looking for GPS…", acc: "accuracy ±{m} m", fromMe: "The route will start from your location", left: "left", eta: "arrival", air: "Air ahead", dose: "PM2.5 dose", est: "estimate (model)", noAir: "no air data",
      reroute: "Rerouting…", rerouted: "Route updated · {p}", rrFail: "Couldn't reroute — keep to the route line", off: "You are {m} m off the route", arrived: "You have arrived", arrSub: "{d} in {t}", doseTot: "PM2.5 inhaled ≈ {v} µg", close: "Close",
      north: "North up", course: "Heading up", mute: "Mute", sound: "Sound", low: "Battery saver", lowOn: "Battery saver: less animation and 3D", lowBat: "Battery low — battery saver on", recenter: "Re-centre",
      sim: "Simulation", simOff: "Leave the route", geoT: "Location needed", geoP: "To guide you along the route and announce turns, the app needs your location. Coordinates are processed on your phone; when rerouting, your current point is sent to the routing service (Valhalla, FOSSGIS). We don't store them.",
      allow: "Allow and start", cancel: "Cancel", denT: "Location access is blocked", denP: "Allow location for this site: the icon left of the address → Permissions → Location. In the Android app: Settings → Apps → Taza Aba → Permissions → Location.",
      unT: "Location unavailable", unP: "No GPS signal. Turn on location in your phone settings and move to an open area.", insec: "Location only works on a secure (https) address.", retry: "Retry",
      lowAcc: "Weak GPS signal (±{m} m)", wl: "The screen stays on while navigating", pref: { clean: "Clean air", jam: "Avoid traffic", bal: "Balanced" }, then: "then", km: "km", m: "m", min: "min", h: "h",
      t: { start: "Head off", right: "Turn right", left: "Turn left", sright: "Bear right", sleft: "Bear left", shright: "Sharp right", shleft: "Sharp left", uturn: "Make a U-turn", straight: "Continue straight",
        ramp: "Take the ramp", stay: "Keep straight", merge: "Merge", round: "At the roundabout, take exit {n}", roundx: "Exit the roundabout", dest: "You have arrived", stairs: "Stairs", elev: "Elevator", ferry: "Ferry" },
      on: " onto {s}", inD: "In {d}, {a}" } };
  /* v66-nav2: пробки, светофоры, переходы */
  Object.assign(NT.ru, { sig: "светофоров: {n}", cross: "переходов: {n}", osmNo: "нет данных OSM о светофорах", tfNo: "нет живых данных о пробках", tfModel: "обычно +{m} мин в это время (модель)", tfLive: "пробки: TomTom, {t}", tfOk: "пробок впереди нет", tfDelay: "+{m} мин из-за пробок",
    tfJam: "Впереди пробка · +{m} мин", tfAlt: "Объезд быстрее на {m} мин", tfGo: "Объехать", tfLeg: "пробки", sigThen: "Через {d} светофор, затем {a}", sigAt: "Через {d} на светофоре {a}", sigAt0: "На светофоре {a}",
    crossCar: "Впереди пешеходный переход", crossWalk: "Перейдите по переходу", crossSig: "Переход со светофором — следите за сигналом", crossZebra: "Перейдите по переходу — «зебра»" });
  Object.assign(NT.ky, { sig: "светофорлор: {n}", cross: "өтмөктөр: {n}", osmNo: "светофорлор боюнча OSM маалыматы жок", tfNo: "тыгындар боюнча жандуу маалымат жок", tfModel: "адатта бул убакта +{m} мүн (модель)", tfLive: "тыгындар: TomTom, {t}", tfOk: "алдыда тыгын жок", tfDelay: "тыгындан +{m} мүн",
    tfJam: "Алдыда тыгын · +{m} мүн", tfAlt: "Айланып өтүү {m} мүн тезирээк", tfGo: "Айланып өтүү", tfLeg: "тыгындар", sigThen: "{d} кийин светофор, андан соң {a}", sigAt: "{d} кийин светофордо {a}", sigAt0: "Светофордо {a}",
    crossCar: "Алдыда жөө өтмөк", crossWalk: "Жөө өтмөк аркылуу өтүңүз", crossSig: "Светофорлуу өтмөк — сигналды караңыз", crossZebra: "«Зебра» аркылуу өтүңүз" });
  Object.assign(NT.en, { sig: "traffic lights: {n}", cross: "crossings: {n}", osmNo: "no OSM traffic-light data", tfNo: "no live traffic data", tfModel: "usually +{m} min at this hour (model)", tfLive: "traffic: TomTom, {t}", tfOk: "no jams ahead", tfDelay: "+{m} min due to traffic",
    tfJam: "Traffic jam ahead · +{m} min", tfAlt: "Detour {m} min faster", tfGo: "Detour", tfLeg: "traffic", sigThen: "In {d}, traffic lights, then {a}", sigAt: "In {d}, at the traffic lights, {a}", sigAt0: "At the traffic lights, {a}",
    crossCar: "Pedestrian crossing ahead", crossWalk: "Cross at the pedestrian crossing", crossSig: "Signal-controlled crossing — watch the light", crossZebra: "Cross at the zebra crossing" });
  const L_ = () => NT[LANG] || NT.ru;
  const nt = (k, o) => { let s = L_()[k] ?? NT.ru[k]; if (o && typeof s === "string") for (const [a, b] of Object.entries(o)) s = s.split("{" + a + "}").join(b); return s; };
  const RM = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } })();
  const WEAK = (typeof LOWEND !== "undefined" && LOWEND) || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3;
  const SIM = (() => { try { return new URL(location.href).searchParams.get("navsim"); } catch (e) { return null; } })();
  const LOWKEY = "tazaAba.navLow", MUTEKEY = "tazaAba.navMute", NORTHKEY = "tazaAba.navNorth";
  const ls = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } };
  const R = Math.PI / 180;
  const bearing = (a, b) => { const y = Math.sin((b[1] - a[1]) * R) * Math.cos(b[0] * R), x = Math.cos(a[0] * R) * Math.sin(b[0] * R) - Math.sin(a[0] * R) * Math.cos(b[0] * R) * Math.cos((b[1] - a[1]) * R); return (Math.atan2(y, x) / R + 360) % 360; };
  const angD = (a, b) => ((b - a + 540) % 360) - 180;
  const mDist = (a, b) => ecoKm(a, b) * 1000;
  const fD = km => km < 1 ? `${Math.max(10, Math.round(km * 1000 / 10) * 10)} ${nt("m")}` : `${fmt(km, km < 10 ? 1 : 0)} ${nt("km")}`;
  const fT = s => { const m = Math.max(1, Math.round(s / 60)); return m < 60 ? `${m} ${nt("min")}` : `${Math.floor(m / 60)} ${nt("h")} ${m % 60} ${nt("min")}`; };
  const clock = ms => new Date(ms).toLocaleTimeString(LANG === "en" ? "en-GB" : "ru-RU", { hour: "2-digit", minute: "2-digit" });

  /* ---------- MapLibre (общий загрузчик с iosmap/eco3d) ---------- */
  let libP = null;
  const lib = () => libP || (libP = new Promise((ok, no) => {
    if (!document.querySelector('link[href="vendor/maplibre/maplibre-gl.css"]')) { const c = document.createElement("link"); c.rel = "stylesheet"; c.href = "vendor/maplibre/maplibre-gl.css"; document.head.appendChild(c); }
    if (window.maplibregl) { try { maplibregl.setWorkerUrl("vendor/maplibre/maplibre-gl-csp-worker.js"); } catch (e) {} return ok(); }
    const s = document.createElement("script"); s.src = "vendor/maplibre/maplibre-gl-csp.js"; s.onload = () => { maplibregl.setWorkerUrl("vendor/maplibre/maplibre-gl-csp-worker.js"); ok(); }; s.onerror = no; document.head.appendChild(s); }));
  if (!document.querySelector('link[href="econav.css"]')) { const c = document.createElement("link"); c.rel = "stylesheet"; c.href = "econav.css"; document.head.appendChild(c); }

  /* ---------- геометрия ---------- */
  function prep(G) { const cum = [0]; for (let i = 1; i < G.length; i++) cum.push(cum[i - 1] + ecoKm(G[i - 1], G[i])); return cum; }
  /* проекция точки на ломаную: { km вдоль, d м до линии, i сегмент, ll } (окно поиска около прошлого сегмента, иначе вся линия) */
  function project(G, cum, p, hint) {
    const kx = 111320 * Math.cos(p[0] * R), ky = 110570; let best = null;
    const scan = (a, b) => { for (let i = Math.max(1, a); i < Math.min(G.length, b); i++) { const A = G[i - 1], B = G[i];
      const ax = (A[1] - p[1]) * kx, ay = (A[0] - p[0]) * ky, bx = (B[1] - p[1]) * kx, by = (B[0] - p[0]) * ky, dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
      const t = L2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L2)) : 0, d = Math.hypot(ax + t * dx, ay + t * dy);
      if (!best || d < best.d) best = { d, i, t, km: cum[i - 1] + (cum[i] - cum[i - 1]) * t, ll: [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t] }; } };
    if (hint != null) { scan(hint - 15, hint + 120); if (best && best.d < 60) return best; best = null; }
    scan(1, G.length); return best; }
  function atKm(G, cum, km) { let lo = 1, hi = cum.length - 1; km = Math.max(0, Math.min(cum[cum.length - 1], km));
    while (lo < hi) { const mid = (lo + hi) >> 1; if (cum[mid] < km) lo = mid + 1; else hi = mid; }
    const i = Math.max(1, lo), k = cum[i] - cum[i - 1] ? (km - cum[i - 1]) / (cum[i] - cum[i - 1]) : 0, a = G[i - 1], b = G[i]; return { ll: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], i }; }
  function slice(G, cum, k0, k1) { const a = atKm(G, cum, k0), b = atKm(G, cum, k1), out = [a.ll]; for (let i = a.i; i < b.i; i++) out.push(G[i]); out.push(b.ll); return out; }
  const circle = (c, rM, n = 40) => { const kx = 111320 * Math.cos(c[0] * R), out = []; for (let i = 0; i <= n; i++) { const a = i / n * 2 * Math.PI; out.push([c[1] + Math.sin(a) * rM / kx, c[0] + Math.cos(a) * rM / 110570]); } return out; };

  /* ---------- манёвры ---------- */
  const VT = { 1: "start", 2: "start", 3: "start", 4: "dest", 5: "dest", 6: "dest", 8: "straight", 9: "sright", 10: "right", 11: "shright", 12: "uturn", 13: "uturn", 14: "shleft", 15: "left", 16: "sleft",
    17: "stay", 18: "ramp", 19: "ramp", 20: "ramp", 21: "ramp", 22: "stay", 23: "sright", 24: "sleft", 25: "merge", 26: "round", 27: "roundx", 28: "ferry", 29: "ferry", 37: "merge", 38: "merge", 39: "elev", 40: "stairs", 41: "stairs" };
  const SIDE = { 18: "r", 20: "r", 19: "l", 21: "l", 37: "r", 38: "l", 5: "r", 6: "l", 13: "l" };
  async function traceManeuvers(G, mode, sig) {
    const costing = { walk: "pedestrian", bike: "bicycle", car: "auto" }[mode] || "pedestrian";
    const pts = G.length > 1200 ? G.filter((_, i) => i % Math.ceil(G.length / 1200) === 0 || i === G.length - 1) : G;
    const body = { shape: pts.map(p => ({ lat: +p[0].toFixed(6), lon: +p[1].toFixed(6) })), shape_match: "map_snap", costing, directions_options: { units: "kilometers", directions_type: "maneuvers" } };
    const r = await fetch("https://valhalla1.openstreetmap.de/trace_route", { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(body), signal: sig });
    if (!r.ok) throw new Error("trace " + r.status); const j = await r.json(); const legs = (j.trip && j.trip.legs) || []; if (!legs.length) throw new Error("trace empty");
    const shape = legs.flatMap((l, k) => { const s = ecoDecode6(l.shape); return k ? s.slice(1) : s; }); let off = 0; const man = [];
    legs.forEach((l, k) => { const n = ecoDecode6(l.shape).length; l.maneuvers.forEach(m => { const t = VT[m.type]; if (!t) return;
      man.push({ i: Math.min(shape.length - 1, m.begin_shape_index + off), t, side: SIDE[m.type], n: m.roundabout_exit_count, s: (m.street_names || m.begin_street_names || [])[0] || "", v: m.type }); }); off += n - 1; });
    return { G: shape, man, src: "valhalla" }; }
  /* без сервиса: повороты по геометрии (угол > 40° на окне ±20 м) */
  function geomManeuvers(G, cum) { const man = [{ i: 0, t: "start", s: "" }], total = cum[cum.length - 1];
    for (let km = 0.03; km < total - 0.02; km += 0.01) { const a = atKm(G, cum, km - 0.02).ll, b = atKm(G, cum, km).ll, c = atKm(G, cum, km + 0.02).ll, d = angD(bearing(a, b), bearing(b, c)), ad = Math.abs(d);
      if (ad < 40) continue; const last = man[man.length - 1]; const t = ad > 165 ? "uturn" : ad > 130 ? (d > 0 ? "shright" : "shleft") : ad > 62 ? (d > 0 ? "right" : "left") : (d > 0 ? "sright" : "sleft");
      const i = atKm(G, cum, km).i; if (last && last.km != null && km - last.km < 0.03) { if (ad > last.ad) Object.assign(last, { t, ad, i, km }); continue; } man.push({ i, t, s: "", ad, km }); }
    man.push({ i: G.length - 1, t: "dest", s: "" }); return { G, man, src: "geom" }; }
  function finishMan(nav) { const G = nav.G, cum = nav.cum; nav.man.forEach(m => { m.km = cum[Math.min(cum.length - 1, m.i)]; });
    /* склейка мелких пеших манёвров: «прямо» не озвучиваем; повороты ближе 8 м друг к другу — один */
    const out = []; nav.man.forEach(m => { if (m.t === "straight" && out.length) return; const p = out[out.length - 1]; if (p && p.t !== "start" && m.t !== "dest" && m.km - p.km < 0.008) return; out.push(m); });
    if (!out.length || out[out.length - 1].t !== "dest") out.push({ i: G.length - 1, km: cum[cum.length - 1], t: "dest", s: "" }); nav.man = out; }
  function manText(m, withStreet = true) { if (!m) return ""; const T = L_().t; let a = (T[m.t] || T.straight).split("{n}").join(m.n || 1);
    if (m.t === "ramp") a += m.side === "l" ? (LANG === "en" ? " left" : LANG === "ky" ? " (солго)" : " налево") : (LANG === "en" ? " right" : LANG === "ky" ? " (оңго)" : " направо");
    if (withStreet && m.s && !/dest|start/.test(m.t)) a += nt("on").split("{s}").join(m.s); else if (withStreet && m.s && m.t === "start") a += nt("on").split("{s}").join(m.s); return a; }
  const ICO = { straight: '<path d="M12 21V4M6 10l6-6 6 6"/>', right: '<path d="M6 21v-8a4 4 0 0 1 4-4h9M14 4l5 5-5 5"/>', sright: '<path d="M8 21v-7l8-8M10 6h6v6"/>', shright: '<path d="M7 4v11a3 3 0 0 0 5 2l6-7M12 10h6v6"/>',
    uturn: '<path d="M16 21V9a5 5 0 0 0-10 0v4M2 9l4 4 4-4"/>', round: '<circle cx="12" cy="10" r="4"/><path d="M12 21v-7M16 6l3-3M15 3h4v4"/>', roundx: '<circle cx="12" cy="10" r="4"/><path d="M12 21v-7M16 6l3-3M15 3h4v4"/>', merge: '<path d="M12 21v-7l-6-8M12 14l6-8M15 6h3v3"/>',
    dest: '<path d="M6 21V4M6 4h11l-2 4 2 4H6"/>', start: '<circle cx="12" cy="12" r="3"/><path d="M12 2v5M12 17v5"/>', stairs: '<path d="M4 20h4v-4h4v-4h4V8h4"/>', elev: '<path d="M6 3h12v18H6zM10 9l2-3 2 3M10 15l2 3 2-3"/>', ferry: '<path d="M3 17l2 4h14l2-4zM6 17V9h12v8M12 9V4"/>', ramp: '<path d="M8 21V12l8-8M10 4h6v6"/>', stay: '<path d="M12 21V4M6 10l6-6 6 6"/>' };
  const LEFT = { left: "right", sleft: "sright", shleft: "shright" };
  const manIcon = m => { const t = LEFT[m.t] || m.t, flip = !!LEFT[m.t] || ((m.t === "ramp" || m.t === "merge") && m.side === "l"); return `<svg viewBox="0 0 24 24" class="${flip ? "fl" : ""}" aria-hidden="true">${ICO[t] || ICO.straight}</svg>`; };

  /* ---------- окно разрешения геолокации ---------- */
  function sheet(title, text, btns) { return new Promise(res => { const d = document.createElement("div"); d.className = "nv-sheet-bg"; d.innerHTML = `<div class="nv-sheet" role="alertdialog" aria-modal="true" aria-labelledby="nvsT"><div class="nv-sheet-ic">${'<svg viewBox="0 0 24 24"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>'}</div><h3 id="nvsT">${esc(title)}</h3><p>${esc(text)}</p><div class="nv-sheet-b">${btns.map((b, k) => `<button type="button" data-k="${k}" class="${b[1] ? "pri" : ""}">${esc(b[0])}</button>`).join("")}</div></div>`;
    (document.querySelector(".nv") || document.body).appendChild(d); d.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { d.remove(); res(+b.dataset.k); }); setTimeout(() => d.querySelector(".pri, button").focus(), 30); }); }
  async function geoState() { if (!navigator.geolocation) return "none"; if (!window.isSecureContext) return "insecure"; try { const p = await navigator.permissions.query({ name: "geolocation" }); return p.state; } catch (e) { return "prompt"; } }
  /* возвращает true, если можно запускать watchPosition */
  async function askGeo() { const s = await geoState();
    if (s === "granted") return true;
    if (s === "none" || s === "insecure") { await sheet(nt("unT"), s === "insecure" ? nt("insec") : nt("unP"), [[nt("close"), true]]); return false; }
    if (s === "denied") { await sheet(nt("denT"), nt("denP"), [[nt("close"), true]]); return false; }
    return (await sheet(nt("geoT"), nt("geoP"), [[nt("cancel")], [nt("allow"), true]])) === 1; }
  window.ecoNavAskGeo = askGeo; window.ecoNavSheet = sheet; window.ecoNavT = nt;

  /* ---------- открытие навигатора ---------- */
  window.ecoNavOpen = async function (route, mode, opts) {
    opts = opts || {};
    const sim = !!(opts.sim || SIM); const dk = document.documentElement.dataset.theme === "dark";
    const w = document.createElement("div"); w.className = "nv" + (dk ? " dk" : ""); w.setAttribute("role", "dialog"); w.setAttribute("aria-modal", "true"); w.setAttribute("aria-label", tr({ ru: "Навигация", ky: "Навигация", en: "Navigation" }));
    w.innerHTML = `<div class="nv-map"></div>
      <div class="nv-top"><div class="nv-ban" aria-live="polite"><div class="nv-ban-ic"></div><div class="nv-ban-tx"><b class="nv-ban-d"></b><span class="nv-ban-a"></span></div></div><div class="nv-then" hidden></div><div class="nv-offer" hidden><span></span><button type="button"></button></div>
        <div class="nv-chips"><span class="nv-chip nv-gps"></span>${sim ? `<span class="nv-chip nv-simc">${esc(nt("sim"))}</span>` : ""}<span class="nv-chip nv-msg" hidden></span></div></div>
      <div class="nv-side"><button type="button" class="nv-btn nv-north" aria-pressed="false"><svg viewBox="0 0 24 24"><path d="M12 3l5 16-5-4-5 4z"/></svg></button><button type="button" class="nv-btn nv-mute" aria-pressed="false"></button><button type="button" class="nv-btn nv-low" aria-pressed="false" title="${esc(nt("low"))}" aria-label="${esc(nt("low"))}"><svg viewBox="0 0 24 24"><path d="M3 8h15v8H3zM18 11h2v2h-2zM6 11h5"/></svg></button></div>
      <button type="button" class="nv-rec" hidden><svg viewBox="0 0 24 24"><path d="M12 3l7 18-7-4-7 4z"/></svg>${esc(nt("recenter"))}</button>
      <div class="nv-bot"><div class="nv-sum"><div class="nv-big"><b class="nv-rem"></b><span class="nv-sub"></span></div><button type="button" class="nv-go">${esc(nt("go"))}</button><button type="button" class="nv-end" hidden>${esc(nt("end"))}</button></div>
        <div class="nv-air"><span class="nv-aq"><i></i><em>${esc(nt("air"))}</em><b></b></span><span class="nv-dz"><em>${esc(nt("dose"))}</em><b></b></span></div><div class="nv-meta"><span class="nv-tf" hidden><i></i><b></b></span><span class="nv-sg" hidden></span><span class="nv-cr" hidden></span></div><small class="nv-est">${esc(nt("est"))} · ${esc(nt("pref")[eco.pref] || nt("pref").bal)}</small>
        ${sim ? `<div class="nv-simbar"><span>${esc(nt("sim"))}</span>${[1, 4, 10].map(x => `<button type="button" data-sx="${x}">${x}×</button>`).join("")}<button type="button" class="nv-simoff">${esc(nt("simOff"))}</button></div>` : ""}</div>
      <div class="nv-arr" hidden></div>`;
    document.body.appendChild(w); document.documentElement.classList.add("nv-open");
    const $ = s => w.querySelector(s);
    const bot = w.querySelector(".nv-bot"), setB = () => w.style.setProperty("--nvb", bot.offsetHeight + "px"); setB(); try { new ResizeObserver(setB).observe(bot); } catch (e) {}
    try { await lib(); } catch (e) { w.remove(); document.documentElement.classList.remove("nv-open"); return toast("MapLibre load error"); }
    let low = ls(LOWKEY) === "1", mute = ls(MUTEKEY) === "1", north = ls(NORTHKEY) === "1";
    const pr = Math.min(window.devicePixelRatio || 1, WEAK || low ? 1.5 : 2);
    const style = typeof window.iosMapStyle === "function" ? window.iosMapStyle({ dark: dk, lang: LANG, lowend: WEAK }) : `https://tiles.openfreemap.org/styles/${dk ? "dark" : "liberty"}`;
    const G0 = route.geom;
    const m = new maplibregl.Map({ container: $(".nv-map"), style, center: [G0[0][1], G0[0][0]], zoom: 15, pitch: 0, attributionControl: { compact: true }, maxPitch: 70, pixelRatio: pr, fadeDuration: WEAK ? 0 : 250, canvasContextAttributes: { antialias: !WEAK } });
    /* навигационное состояние */
    const nav = { G: G0, cum: prep(G0), man: [], T: route.T ?? route.dur, Tb: route.dur, dlM: route.delay || 0, tf: null, ev: { sig: [], cross: [] }, mode, S: route.S, started: false, along: 0, seg: 1, mi: 0, said: {}, rr: 0, offT: 0, dose: 0, t0: 0, walked: 0, done: false };
    nav.total = nav.cum[nav.cum.length - 1];
    const stops = (eco.pts || []).filter(Boolean).map(p => ({ ll: p.ll, km: project(nav.G, nav.cum, p.ll).km }));
    let fix = null, prevFix = null, disp = null, br = 0, zoom = 17, follow = true, ready = false, wid = null, wake = null, compass = null, raf = 0, lastFrame = 0, lastLines = 0, rrAb = null, alive = true;
    const msg = (s, ms = 3500) => { const x = $(".nv-msg"); x.textContent = s; x.hidden = !s; clearTimeout(x._t); if (s && ms) x._t = setTimeout(() => x.hidden = true, ms); };
    const setNav = (G, man, src, T, S) => { nav.G = G; nav.cum = prep(G); nav.total = nav.cum[nav.cum.length - 1]; nav.man = man; nav.src = src; nav.T = T; nav.S = S; nav.seg = 1; nav.mi = 0; nav.said = {}; finishMan(nav); };
    /* воздух вдоль линии навигации — поверхность «Дымка» (ecoExposure, как на карточках маршрутов) */
    const airS = G => { try { return ecoExposure(G, 1, mode).S; } catch (e) { return []; } };
    const aqiAt = (k0, k1) => { const S = nav.S || []; const v = S.filter(s => s.a != null && s.km >= k0 && s.km <= k1).map(s => s.a); if (v.length) return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
      let best = null; for (const s of S) if (s.a != null && (!best || Math.abs(s.km - k0) < Math.abs(best.km - k0))) best = s; return best ? best.a : null; };
    /* манёвры для исходного маршрута */
    async function loadMan(G) { try { const r = await traceManeuvers(G, mode); return r; } catch (e) { const cum = prep(G); return geomManeuvers(G, cum); } }
    nav.S = airS(G0); finishMan(Object.assign(nav, geomManeuvers(G0, nav.cum), { src: "geom-tmp" }));
    loadMan(G0).then(first => { if (!alive || nav.rrN) return; const G = first.G.length > 1 ? first.G : G0; setNav(G, first.man, first.src, nav.T, airS(G)); stops.forEach(s => s.km = project(nav.G, nav.cum, s.ll).km); drawLines(true); hud(); if (!nav.started && ready) overview(); nav.manReady = true; osmLoad(); });

    /* ---------- слои ---------- */
    const fc = f => ({ type: "FeatureCollection", features: f });
    const line = (G, p) => ({ type: "Feature", properties: p || {}, geometry: { type: "LineString", coordinates: G.map(q => [q[1], q[0]]) } });
    m.on("load", () => {
      const W = (a, b) => ["interpolate", ["exponential", 1.6], ["zoom"], 12, a, 18, b];
      m.addSource("nv-done", { type: "geojson", data: fc([]) }); m.addSource("nv-ahead", { type: "geojson", data: fc([]) }); m.addSource("nv-aheadc", { type: "geojson", data: fc([]) });
      m.addSource("nv-acc", { type: "geojson", data: fc([]) }); m.addSource("nv-pts", { type: "geojson", data: fc([]) });
      m.addLayer({ id: "nv-acc", type: "fill", source: "nv-acc", paint: { "fill-color": "#5AB4E8", "fill-opacity": 0.14 } });
      m.addLayer({ id: "nv-acc-l", type: "line", source: "nv-acc", paint: { "line-color": "#5AB4E8", "line-opacity": 0.45, "line-width": 1 } });
      m.addLayer({ id: "nv-done", type: "line", source: "nv-done", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": dk ? "#6b7785" : "#aab4be", "line-width": W(4, 10), "line-opacity": 0.85 } });
      m.addLayer({ id: "nv-glow", type: "line", source: "nv-aheadc", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#5AB4E8", "line-width": W(12, 30), "line-opacity": 0.22, "line-blur": W(4, 10) } });
      m.addLayer({ id: "nv-case", type: "line", source: "nv-aheadc", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": dk ? "#0b1218" : "#ffffff", "line-width": W(6.5, 16) } });
      m.addLayer({ id: "nv-ahead", type: "line", source: "nv-ahead", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": ["get", "c"], "line-width": W(4, 11) } });
      m.addLayer({ id: "nv-pts", type: "circle", source: "nv-pts", paint: { "circle-radius": W(4, 9), "circle-color": ["match", ["get", "k"], "b", "#e5534b", "s", "#8b95a1", "#5AB4E8"], "circle-stroke-width": 2.5, "circle-stroke-color": "#fff", "circle-pitch-alignment": "map" } });
      ready = true; drawLines(true); setLow(low, true);
      setTimeout(() => w.querySelectorAll(".maplibregl-compact-show").forEach(x => { x.classList.remove("maplibregl-compact-show"); x.removeAttribute("open"); }), 50);
      overview(); setTimeout(() => { if (!nav.started && alive) overview(); }, 700);
    });
    m.on("resize", () => { if (!nav.started && ready && !overview.busy) { overview.busy = 1; requestAnimationFrame(() => { overview(); overview.busy = 0; }); } });
    const puck = document.createElement("div"); puck.className = "nv-puck"; puck.innerHTML = '<i class="nv-halo"></i><svg viewBox="0 0 40 40" width="44" height="44" aria-hidden="true"><circle cx="20" cy="20" r="15"/><path d="M20 9l7.5 19L20 23.5 12.5 28z"/></svg>';
    const mk = new maplibregl.Marker({ element: puck, rotationAlignment: "map", pitchAlignment: "viewport" }).setLngLat([G0[0][1], G0[0][0]]);
    function drawLines(force) { if (!ready) return; const now = performance.now(); if (!force && now - lastLines < (low ? 1500 : 400)) return; lastLines = now;
      const a = nav.along, G = nav.G, cum = nav.cum, total = nav.total;
      m.getSource("nv-done").setData(fc(a > 0.002 ? [line(slice(G, cum, 0, a))] : []));
      const ahead = a < total - 0.001 ? slice(G, cum, a, total) : []; m.getSource("nv-aheadc").setData(fc(ahead.length > 1 ? [line(ahead)] : []));
      /* впереди — цвет воздуха по участкам ~40 м (поверхность «Дымка»), без данных — акцент */
      const segs = []; const S = (nav.S || []).filter(s => s.km > a); let k0 = a;
      const tfc = km => { const T = nav.tf; if (!T || T.st !== "live") return null; for (const x of T.segs) if (km >= x.k0 && km <= x.k1) return x.col; return null; };
      for (const s of S) { if (s.km - k0 < 0.035 && s !== S[S.length - 1]) continue; const g = slice(G, cum, k0, s.km); if (g.length > 1) segs.push(line(g, { c: tfc((k0 + s.km) / 2) || (s.a != null ? ecoCol(s.a) : "#5AB4E8") })); k0 = s.km; }
      if (k0 < total - 0.001) { const g = slice(G, cum, k0, total); if (g.length > 1) segs.push(line(g, { c: "#5AB4E8" })); }
      m.getSource("nv-ahead").setData(fc(segs));
      const P = [{ ll: G[G.length - 1], k: "b" }, ...stops.filter(s => s.km > a + 0.01 && s.km < total - 0.02).map(s => ({ ll: s.ll, k: "s" }))]; if (!nav.started) P.push({ ll: G[0], k: "a" });
      m.getSource("nv-pts").setData(fc(P.map(p => ({ type: "Feature", properties: { k: p.k }, geometry: { type: "Point", coordinates: [p.ll[1], p.ll[0]] } })))); }
    function overview() { try { m.resize(); } catch (e) {} const b = new maplibregl.LngLatBounds(); nav.G.forEach(p => b.extend([p[1], p[0]])); if (fix) b.extend([fix.ll[1], fix.ll[0]]);
      const tb = $(".nv-top").getBoundingClientRect().bottom, bh = $(".nv-bot").offsetHeight;
      m.fitBounds(b, { padding: { top: Math.round(tb + 24), bottom: bh + 28, left: 36, right: 72 }, duration: 0, maxZoom: 17 }); }

    /* ---------- HUD ---------- */
    const setBtnState = () => { const nb = $(".nv-north"); nb.setAttribute("aria-pressed", String(north)); nb.title = nb.ariaLabel = north ? nt("north") : nt("course"); nb.classList.toggle("on", north);
      const mb = $(".nv-mute"); mb.setAttribute("aria-pressed", String(mute)); mb.title = mb.ariaLabel = mute ? nt("mute") : nt("sound");
      mb.innerHTML = mute ? '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zM17 9l5 6M22 9l-5 6"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8M19.5 5.5a9 9 0 0 1 0 13"/></svg>';
      const lb = $(".nv-low"); lb.setAttribute("aria-pressed", String(low)); lb.classList.toggle("on", low); };
    function hud() {
      const a = nav.along, remKm = Math.max(0, nav.total - a), live = nav.tf && nav.tf.st === "live", remS = nav.total ? (live ? nav.Tb * remKm / nav.total + nav.tf.delay : nav.T * remKm / nav.total) : 0;
      meta(remKm);
      $(".nv-rem").textContent = fT(remS); $(".nv-sub").textContent = `${fD(remKm)} · ${nt("eta")} ${clock(Date.now() + remS * 1000)}`;
      const aq = aqiAt(a, Math.min(nav.total, a + 0.3)), Lv = aq != null ? level(aq) : null;
      $(".nv-aq i").style.background = aq != null ? ecoCol(aq) : "transparent"; $(".nv-aq b").textContent = aq != null ? `AQI ${aq} · ${tr(Lv.name)}` : nt("noAir");
      $(".nv-dz b").textContent = nav.started ? `≈ ${fmt(nav.dose, nav.dose < 10 ? 1 : 0)} ${LANG === "en" ? "µg" : "мкг"}` : (route.dose != null ? `≈ ${fmt(route.dose, route.dose < 10 ? 1 : 0)} ${LANG === "en" ? "µg" : "мкг"}` : "—");
      /* следующий манёвр */
      while (nav.mi < nav.man.length - 1 && nav.man[nav.mi].km < a + 0.004) nav.mi++;
      const mn = nav.man[nav.mi] || nav.man[nav.man.length - 1]; if (!mn) return; const dKm = Math.max(0, mn.km - a);
      $(".nv-ban-ic").innerHTML = manIcon(nav.started ? mn : { t: "start" }); $(".nv-ban-d").textContent = nav.started && !nav.done ? fD(dKm) : ""; $(".nv-ban-a").textContent = nav.started ? manText(mn) : nt("fromMe");
      const nx = nav.man[nav.mi + 1], th = $(".nv-then"); if (nav.started && !nav.done && nx && nx.km - mn.km < 0.12 && mn.t !== "dest") { th.hidden = false; th.innerHTML = `${esc(nt("then"))} ${manIcon(nx)}`; } else th.hidden = true;
      if (nav.started) { announce(mn, dKm * 1000); crossCheck(mn); } }
    /* ---------- голос и вибрация ---------- */
    const VL = { ru: "ru-RU", ky: "ky-KG", en: "en-GB" };
    function speak(s) { if (mute || !s) return; try { if (window.TazaApp && typeof TazaApp.speak === "function") return TazaApp.speak(s, VL[LANG] || "ru-RU"); } catch (e) {}
      if (!("speechSynthesis" in window)) return; try { const u = new SpeechSynthesisUtterance(s), vs = speechSynthesis.getVoices(), want = VL[LANG] || "ru-RU";
        u.voice = vs.find(v => v.lang && v.lang.replace("_", "-").startsWith(want.slice(0, 2))) || (LANG === "ky" ? vs.find(v => /^ru/.test(v.lang)) : null) || null; u.lang = u.voice ? u.voice.lang : (LANG === "ky" ? "ru-RU" : want); u.rate = 1.02; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} }
    const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
    const TH = { walk: [70, 18], bike: [150, 35], car: [450, 90] }[mode] || [70, 18];
    function announce(mn, dM) { const k = nav.mi + ":" + nav.rr, s = nav.said[k] || (nav.said[k] = {});
      if (mn.t === "dest") return; const far = Math.max(TH[0], (fix && fix.spd || 0) * 12), near = Math.max(TH[1], (fix && fix.spd || 0) * 4);
      if (!s.far && dM <= far && dM > near * 1.6) { s.far = 1; const lo = manText(mn).replace(/^./, c => c.toLowerCase()), sg = sigBefore(mn);
        speak(sg && sg.at ? nt("sigAt", { d: fD(dM / 1000), a: lo }) : sg ? nt("sigThen", { d: fD(sg.d / 1000), a: lo }) : nt("inD", { d: fD(dM / 1000), a: lo })); lastSay = Date.now(); }
      if (!s.near && dM <= near) { s.near = s.far = 1; const sg0 = sigBefore(mn); speak(sg0 && sg0.at ? nt("sigAt0", { a: manText(mn).replace(/^./, c => c.toLowerCase()) }) : manText(mn)); lastSay = Date.now(); if (!/straight|stay|start/.test(mn.t)) buzz(/left|sleft|shleft/.test(mn.t) || mn.side === "l" ? [220] : [70, 70, 70]); } }
    /* ---------- позиция: привязка, камера, анимация ---------- */
    function onFix(p) { const c = p.coords, ll = [c.latitude, c.longitude], t = p.timestamp || Date.now();
      let hdg = c.heading != null && !isNaN(c.heading) && (c.speed || 0) > 0.7 ? c.heading : null, spd = c.speed != null && !isNaN(c.speed) ? c.speed : null;
      if (fix) { const d = mDist(fix.ll, ll), dt = Math.max(0.2, (t - fix.t) / 1000); if (spd == null) spd = d / dt; if (hdg == null && d > 3) hdg = bearing(fix.ll, ll); }
      prevFix = fix; fix = { ll, acc: c.accuracy || 30, spd: spd || 0, hdg, t, pt: performance.now() };
      const g = $(".nv-gps"); g.textContent = nt("acc", { m: Math.round(fix.acc) }); g.classList.toggle("bad", fix.acc > 40);
      if (ready) m.getSource("nv-acc").setData(fc(fix.acc > 6 ? [{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [circle(ll, fix.acc)] } }] : []));
      if (!mk._map) { mk.addTo(m); if (!nav.started && ready) overview(); }
      const pj = project(nav.G, nav.cum, ll, nav.seg), thr = Math.min(80, Math.max({ walk: 30, bike: 35, car: 40 }[mode] || 35, fix.acc * 1.2));
      fix.pj = pj; if (pj) nav.seg = pj.i;
      if (!nav.started) { hud(); if (!follow) return; mk.setLngLat([ll[1], ll[0]]); return; }
      const pk = prevFix && prevFix.km != null && prevFix.snap ? prevFix.km : null;
      if (pj && pj.d <= thr) { nav.offT = 0; if (pj.km > nav.along - 0.03) { fix.km = pj.km; } fix.snap = true; if (pk != null && fix.km != null && fix.km > pk && fix.km - pk <= Math.max(0.05, (fix.spd || 2) * Math.max(1, (t - prevFix.t) / 1000) * 3 / 1000)) nav.walked += fix.km - pk; }
      else { fix.snap = false; if (prevFix && mDist(prevFix.ll, ll) < 200) nav.walked += mDist(prevFix.ll, ll) / 1000; if (!nav.offT) nav.offT = t; if (pj) msg(nt("off", { m: Math.round(pj.d) }), 2500);
        if (t - nav.offT > ({ car: 3000 }[mode] || 4500) && Date.now() - nav.rr > 12000 && !nav.rring) reroute(ll); }
      const end = nav.G[nav.G.length - 1]; if (!nav.done && (mDist(ll, end) < Math.max(20, Math.min(40, fix.acc)) || (fix.snap && nav.total - (fix.km ?? nav.along) < 0.012))) arrive();
      if (low) frame(performance.now(), true); }
    function onErr(e) { if (e.code === 1) { stopWatch(); relWake(); nav.started = false; w.classList.remove("going"); $(".nv-go").hidden = false; $(".nv-end").hidden = true; msg(""); hud(); drawLines(true); sheet(nt("denT"), nt("denP"), [[nt("close"), true]]); }
      else if (e.code === 2) msg(nt("unT"), 5000); else if (e.code === 3) msg(nt("wait"), 4000); }
    const startWatch = () => { if (sim) return simStart(); if (wid != null) return;
      wid = navigator.geolocation.watchPosition(onFix, onErr, { enableHighAccuracy: true, maximumAge: low ? 3000 : 1000, timeout: 20000 }); };
    const stopWatch = () => { if (wid != null) navigator.geolocation.clearWatch(wid); wid = null; simStop(); };
    /* кадр: плавно двигаем маркер между отсчётами (вдоль линии, если на маршруте), курс и масштаб — со сглаживанием */
    function frame(ts, once) { if (!alive) return; const dts = lastFrame ? Math.min(0.1, (ts - lastFrame) / 1000) : 0.016; lastFrame = ts;
      if (fix) { const dur = prevFix ? Math.max(300, Math.min(2000, fix.pt - (prevFix.pt || fix.pt) || 1000)) : 1; const k = low || RM ? 1 : Math.min(1, (performance.now() - fix.pt) / dur);
        let ll;
        if (nav.started && fix.snap && fix.km != null) { if (!disp || disp.fixT !== fix.t) disp = { km0: disp && disp.km != null && Math.abs(disp.km - fix.km) < 0.3 ? disp.km : fix.km, km: disp && disp.km, fixT: fix.t };
          const km = disp.km0 + (fix.km - disp.km0) * k; disp.km = km; ll = atKm(nav.G, nav.cum, km).ll;
          const dt = ts - (frame.dz || ts); frame.dz = ts; if (nav.started && dt > 0) { const aq = aqiAt(km, km + 0.04); if (aq != null) nav.dose += ecoAqiToPm(aq) * ECO_V[mode] * dt / 3600e3; }
          if (km > nav.along) nav.along = km; }
        else { const from = prevFix ? prevFix.ll : fix.ll; ll = [from[0] + (fix.ll[0] - from[0]) * k, from[1] + (fix.ll[1] - from[1]) * k]; if (disp) disp.km = null; frame.dz = ts; }
        mk.setLngLat([ll[1], ll[0]]);
        /* курс: на маршруте — направление линии впереди (плавно), вне — курс GPS, стоим — компас */
        let tb = br; const moving = (fix.spd || 0) > 0.6;
        if (nav.started && fix.snap && disp && disp.km != null) tb = bearing(ll, atKm(nav.G, nav.cum, Math.min(nav.total, disp.km + Math.max(0.015, (fix.spd || 1.4) * 0.006))).ll);
        else if (fix.hdg != null && moving) tb = fix.hdg; else if (compass != null) tb = compass;
        br = (br + angD(br, tb) * (RM || low ? 1 : 1 - Math.exp(-dts * 4)) + 360) % 360;
        mk.setRotation(br);
        if (nav.started && follow) { const sp = fix.spd || 0, zt = Math.max(15.2, Math.min(18, 18.1 - sp * 0.13)); zoom += (zt - zoom) * (RM || low ? 1 : 1 - Math.exp(-dts * 1.2));
          m.jumpTo({ center: [ll[1], ll[0]], bearing: north ? 0 : br, pitch: low ? 0 : north ? 35 : 58, zoom, padding: { top: $(".nv-map").clientHeight * 0.5, bottom: $(".nv-bot").offsetHeight, left: 0, right: 0 } }); }
        if (nav.started) { drawLines(); if (!frame.h || ts - frame.h > 500) { frame.h = ts; hud(); } } }
      if (!once && !low) raf = requestAnimationFrame(frame); }
    /* ---------- перестроение ---------- */
    async function reroute(ll) { nav.rring = true; nav.rr = Date.now(); msg(nt("reroute"), 0); $(".nv-ban").classList.add("rr"); if (rrAb) rrAb.abort(); rrAb = new AbortController(); const sig = rrAb.signal;
      try { const end = nav.G[nav.G.length - 1], rest = stops.filter(s => s.km > nav.along + 0.02 && mDist(s.ll, end) > 15).map(s => ({ ll: s.ll, through: true }));
        const P = [{ ll }, ...rest, { ll: end }]; let rs;
        try { rs = await ecoValhalla(P, mode, P.length === 2 ? 1 : 0, sig); } catch (e) { if (sig.aborted) return; rs = await ecoOsrm(P, mode, sig); }
        rs = rs.map(r => ({ ...r, ...ecoExposure(r.geom, r.dur, mode) }));
        /* тот же приоритет, что выбран на карточках: трафик на «сейчас» (модель) + ранжирование ecoRank */
        try { if (typeof ecoTfApply === "function") { const dep0 = eco.dep; eco.dep = "now"; const hd = ecoDep(); eco.dep = dep0; const ix = await ecoTfRoads(); rs = rs.map(r => ecoTfApply(r, mode, ix, hd)); } } catch (e) {}
        rs = typeof ecoRank === "function" ? ecoRank(rs) : rs; const best = rs[0]; if (sig.aborted || !alive) return;
        await useRoute(best, sig); }
      catch (e) { if (!sig.aborted) msg(nt("rrFail"), 5000); nav.rr = Date.now() + 8000; }
      finally { nav.rring = false; $(".nv-ban").classList.remove("rr"); } }
    async function useRoute(best, sig) {
      let mm; try { mm = await traceManeuvers(best.geom, mode, sig); } catch (e) { if (sig && sig.aborted) return; mm = geomManeuvers(best.geom, prep(best.geom)); }
      if (!alive) return; const G = mm.G.length > 1 ? mm.G : best.geom; setNav(G, mm.man, mm.src, best.T ?? best.dur, airS(G)); nav.Tb = best.dur; nav.dlM = best.delay || 0; nav.tf = null; offer(null);
      stops.forEach(s => s.km = project(nav.G, nav.cum, s.ll).km);
      nav.along = 0; nav.seg = 1; nav.offT = 0; disp = null; nav.rr = Date.now(); nav.said = {}; nav.rrN = (nav.rrN || 0) + 1;
      msg(nt("rerouted", { p: nt("pref")[eco.pref] || nt("pref").bal }), 4000); speak(nt("rerouted", { p: "" }).replace(/\s*·\s*$/, "")); simReroute();
      drawLines(true); hud(); osmLoad(); tfRefresh(); }
    /* ---------- v66-nav2: светофоры и переходы (OSM через Overpass), пробки (TomTom Flow, если задан ключ) ---------- */
    const OVP = ["https://overpass-api.de/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];
    const IC2 = { sig: '<svg viewBox="0 0 24 24"><rect x="7.5" y="2.5" width="9" height="19" rx="3.5"/><circle cx="12" cy="7.5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="16.5" r="1.4"/></svg>',
      cr: '<svg viewBox="0 0 24 24"><circle cx="13" cy="4.5" r="1.8"/><path d="M9.5 21l2-6.5 2.5 2.5V21M8 12.5l3-3.5 3.5 1 2.5 3M11.5 14.5L10.5 9"/></svg>', tf: '<svg viewBox="0 0 24 24"><path d="M5 17h14M7 17V9l2-4h6l2 4v8M7 13h10"/><circle cx="9" cy="17" r="1.6"/><circle cx="15" cy="17" r="1.6"/></svg>' };
    let poiMk = [], lastSay = 0, lastCross = 0, tfT = 0, tfAb = null, tfJamAt = 0;
    const osmCache = window.__navOsmCache || (window.__navOsmCache = new Map());
    async function osmLoad() { const G = nav.G, cum = nav.cum, total = nav.total; nav.osm = "load"; const key = G.length + ":" + G[0].join() + ":" + G[G.length - 1].join();
      try { let els = osmCache.get(key);
        if (!els) { const la = G.map(p => p[0]), lo = G.map(p => p[1]), e = 0.0004, bb = [Math.min(...la) - e, Math.min(...lo) - e, Math.max(...la) + e, Math.max(...lo) + e].map(v => v.toFixed(5)).join(",");
          /* один прямоугольник вокруг маршрута (дёшево для Overpass), дальше — фильтр по расстоянию до линии на телефоне */
          const q = `[out:json][timeout:25];node(${bb})[highway~"^(traffic_signals|crossing)$"];out body;`;
          let j = null; outer: for (const u of OVP) for (let t = 0; t < 4; t++) { try { const ab = new AbortController(), to = setTimeout(() => ab.abort(), 30000);
            const r = await fetch(u, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "data=" + encodeURIComponent(q), signal: ab.signal }); clearTimeout(to);
            if (r.ok) { j = await r.json(); break outer; } if (![429, 502, 503, 504].includes(r.status)) break; } catch (e) { if (e && e.name === "AbortError") break; /* 504 от зеркала приходит без CORS → TypeError, пробуем ещё */ } if (!alive) return; await new Promise(z => setTimeout(z, 2500 * (t + 1))); }
          if (!j) throw new Error("overpass"); els = j.elements || []; osmCache.set(key, els); }
        if (G !== nav.G) return; const sig = [], cross = [];
        for (const e of els) { const t = e.tags || {}, pj = project(G, cum, [e.lat, e.lon]); if (!pj) continue;
          if (t.highway === "traffic_signals" && pj.d <= 14) sig.push({ km: pj.km, ll: [e.lat, e.lon] });
          else if (t.highway === "crossing" && pj.d <= 10) { const c = t.crossing, k = c === "traffic_signals" ? "sig" : (c === "zebra" || c === "marked" || t.crossing_ref === "zebra" || t["crossing:markings"] && t["crossing:markings"] !== "no") ? "zebra" : "plain";
            cross.push({ km: pj.km, ll: [e.lat, e.lon], k }); if (k === "sig" && mode === "walk") sig.push({ km: pj.km, ll: [e.lat, e.lon] }); } }
        const clus = (A, gap) => { A.sort((a, b) => a.km - b.km); const o = []; for (const x of A) { const p = o[o.length - 1]; if (p && x.km - p.km < gap) { if (x.k === "sig") p.k = "sig"; continue; } o.push(x); } return o; };
        nav.ev = { sig: clus(sig, 0.035), cross: clus(cross, 0.015) }; nav.osm = "ok"; }
      catch (e) { nav.ev = { sig: [], cross: [] }; nav.osm = "err"; }
      poiMk.forEach(x => x.remove()); poiMk = [];
      const add = (p, cls, html) => { const el = document.createElement("div"); el.className = "nv-poi " + cls; el.innerHTML = html; el.setAttribute("aria-hidden", "true"); poiMk.push(new maplibregl.Marker({ element: el, pitchAlignment: "viewport", rotationAlignment: "viewport" }).setLngLat([p.ll[1], p.ll[0]]).addTo(m)); };
      nav.ev.sig.forEach(p => add(p, "sig", IC2.sig)); nav.ev.cross.forEach(p => { if (!nav.ev.sig.some(s => Math.abs(s.km - p.km) < 0.012) || mode === "walk") add(p, "cr " + p.k, IC2.cr); });
      hud(); }
    /* светофор перед манёвром: { at: светофор на самом перекрёстке } или { d: м до светофора } (не дальше 200 м до поворота) */
    function sigBefore(mn) { const a = nav.along; if (!mn || /dest|start|straight|stay/.test(mn.t)) return null;
      const s = nav.ev.sig.filter(x => x.km > a + 0.01 && x.km <= mn.km + 0.025).pop(); if (!s) return null;
      if (Math.abs(mn.km - s.km) <= 0.025) return { at: true }; if (mn.km - s.km <= 0.2) return { d: (s.km - a) * 1000 }; return null; }
    /* переходы: авто — предупреждаем заранее, пешком — у самого перехода; не чаще раза в 20 с и не поверх подсказки поворота */
    function crossCheck(mn) { if (!nav.ev.cross.length || nav.done) return; const a = nav.along, sp = fix && fix.spd || 0, now = Date.now();
      const c = nav.ev.cross.find(x => !x.said && x.km > a - 0.003); if (!c) return; const d = (c.km - a) * 1000;
      const lim = mode === "car" ? Math.max(60, sp * 6) : mode === "bike" ? 35 : 18; if (d > lim) return;
      nav.ev.cross.forEach(x => { if (Math.abs(x.km - c.km) < 0.03) x.said = 1; });
      if (now - lastCross < 20000 || now - lastSay < 4000) return; if (mn && Math.abs(mn.km - c.km) < 0.02 && mode === "car") return;
      lastCross = lastSay = now; const txt = mode === "car" ? nt("crossCar") : c.k === "sig" ? nt("crossWalk") + ". " + nt("crossSig") : c.k === "zebra" ? nt("crossZebra") : nt("crossWalk");
      msg(mode === "car" ? nt("crossCar") : nt("crossWalk"), 3500); speak(txt); buzz([35]); }
    function meta(remKm) { const sg = $(".nv-sg"), cr = $(".nv-cr"), tf = $(".nv-tf"), a = nav.along;
      const ns = nav.ev.sig.filter(x => x.km > a).length, nc = nav.ev.cross.filter(x => x.km > a).length;
      sg.hidden = nav.osm !== "ok" && nav.osm !== "err"; sg.innerHTML = nav.osm === "err" ? esc(nt("osmNo")) : `${IC2.sig}${esc(nt("sig", { n: ns }))}`;
      cr.hidden = nav.osm !== "ok"; cr.innerHTML = `${IC2.cr}${esc(nt("cross", { n: nc }))}`;
      const T = nav.tf; tf.hidden = mode === "walk" || !T; if (!T) return; let txt, col = "";
      if (T.st === "live") { const mn = Math.round(T.delay / 60); txt = mn >= 1 ? nt("tfDelay", { m: mn }) : nt("tfOk"); col = T.worst; tf.title = nt("tfLive", { t: clock(T.t) }); }
      else { const mn = Math.round(nav.dlM * (nav.total ? remKm / nav.total : 0) / 60); txt = nt("tfNo") + (mn >= 1 ? " · " + nt("tfModel", { m: mn }) : ""); tf.title = ""; }
      tf.querySelector("i").innerHTML = IC2.tf; tf.querySelector("i").style.color = col || ""; tf.querySelector("b").textContent = txt; }
    function offer(o) { const el = $(".nv-offer"); if (!o) { el.hidden = true; return; } el.querySelector("span").textContent = nt("tfAlt", { m: o.m }); const b = el.querySelector("button"); b.textContent = nt("tfGo");
      b.onclick = async () => { el.hidden = true; const ab = new AbortController(); msg(nt("reroute"), 0); try { const r = { ...o.r, ...ecoExposure(o.r.geom, o.r.dur, mode) }; await useRoute(r, ab.signal); } catch (e) { msg(nt("rrFail"), 4000); } }; el.hidden = false; }
    const TTKEY = () => (window.TAZA_CONFIG || {}).TOMTOM_KEY || "";
    /* живые пробки: TomTom Flow Segment Data по точкам впереди (до 4 км, ≤ 8 запросов раз в 2 мин). Нет ключа или ответа — честно «нет живых данных» */
    async function tfRefresh() { if (mode === "walk" || !alive || nav.done) return; const key = TTKEY();
      if (!key) { nav.tf = { st: "none" }; hud(); return; }
      if (tfAb) tfAb.abort(); tfAb = new AbortController(); const sg = tfAb.signal, G = nav.G, a = nav.along, end = Math.min(nav.total, a + 4), n = Math.max(1, Math.min(8, Math.ceil((end - a) / 0.5)));
      const ks = []; for (let i = 0; i <= n; i++) ks.push(a + (end - a) * i / n);
      try { const res = await Promise.all(ks.slice(0, -1).map((k, i) => { const p = atKm(G, nav.cum, (k + ks[i + 1]) / 2).ll;
          return fetch(`https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${p[0].toFixed(5)},${p[1].toFixed(5)}&unit=KMPH&key=${encodeURIComponent(key)}`, { signal: sg }).then(r => r.ok ? r.json() : null).catch(() => null); }));
        if (G !== nav.G || !alive) return; const segs = []; let delay = 0, worst = 1, jam = null;
        res.forEach((j, i) => { const f = j && j.flowSegmentData; if (!f || !f.freeFlowSpeed) return; const L = ks[i + 1] - ks[i], cur = f.roadClosure ? 0 : Math.max(1, f.currentSpeed), ratio = f.roadClosure ? 0 : Math.min(1, cur / f.freeFlowSpeed);
          const dl = f.roadClosure ? 600 : Math.max(0, L / cur - L / f.freeFlowSpeed) * 3600 * (mode === "bike" ? 0.15 : 1); delay += dl; worst = Math.min(worst, ratio);
          const col = ratio >= 0.8 ? "#3dbe8b" : ratio >= 0.5 ? "#edb443" : "#e5534b"; segs.push({ k0: ks[i], k1: ks[i + 1], col, ratio, dl });
          if (ratio < 0.5 && ks[i] - a < 2.5 && (!jam || dl > jam.dl)) jam = { k0: ks[i], k1: ks[i + 1], dl }; });
        if (!segs.length) { nav.tf = { st: "none" }; hud(); return; }
        nav.tf = { st: "live", segs, delay, worst: worst >= 0.8 ? "#3dbe8b" : worst >= 0.5 ? "#edb443" : "#e5534b", t: Date.now() }; drawLines(true); hud();
        if (jam && delay >= 120 && Date.now() - tfJamAt > 600000) { tfJamAt = Date.now(); const mn = Math.round(delay / 60); msg(nt("tfJam", { m: mn }), 6000); speak(nt("tfJam", { m: mn }).replace(" · ", ", ")); lastSay = Date.now();
          /* объезд: Valhalla с исключением участка пробки, тем же видом транспорта; предлагаем, только если быстрее хотя бы на 1,5 мин */
          try { const g = slice(G, nav.cum, jam.k0, jam.k1), la = g.map(q => q[0]), lo = g.map(q => q[1]), e = 0.0006, poly = [[Math.min(...lo) - e, Math.min(...la) - e], [Math.max(...lo) + e, Math.min(...la) - e], [Math.max(...lo) + e, Math.max(...la) + e], [Math.min(...lo) - e, Math.max(...la) + e], [Math.min(...lo) - e, Math.min(...la) - e]];
            const endP = G[G.length - 1], rest = stops.filter(s => s.km > nav.along + 0.02 && mDist(s.ll, endP) > 15).map(s => ({ ll: s.ll, through: true }));
            const alt = (await ecoValhalla([{ ll: fix ? fix.ll : atKm(G, nav.cum, nav.along).ll }, ...rest, { ll: endP }], mode, 0, sg, { exclude_polygons: [poly] }))[0];
            const curT = nav.Tb * (nav.total - nav.along) / nav.total + delay; if (alt && alt.dur < curT - 90 && G === nav.G) offer({ r: alt, m: Math.round((curT - alt.dur) / 60) }); } catch (e) {} } }
      catch (e) { if (!sg.aborted) { nav.tf = { st: "none" }; hud(); } } }
    /* ---------- прибытие ---------- */
    function arrive() { nav.done = true; clearInterval(tfT); offer(null); nav.along = nav.total; drawLines(true); hud(); stopWatch(); relWake(); { const e = nav.G[nav.G.length - 1]; mk.setLngLat([e[1], e[0]]); }
      follow = false; cancelAnimationFrame(raf); m.setPadding({ top: 0, bottom: 0, left: 0, right: 0 }); const bb = new maplibregl.LngLatBounds(); nav.G.forEach(q => bb.extend([q[1], q[0]]));
      setTimeout(() => { try { m.fitBounds(bb, { padding: { top: 140, bottom: ((w.querySelector(".nv-arr-c") || {}).offsetHeight || 300) + 20, left: 40, right: 40 }, pitch: 0, bearing: 0, duration: RM ? 0 : 1200, maxZoom: 17 }); } catch (e) {} }, 60);
      const tS = (Date.now() - nav.t0) / 1000, el = $(".nv-arr"); speak(nt("arrived")); buzz([120, 80, 120, 80, 240]);
      el.innerHTML = `<div class="nv-arr-c"><div class="nv-arr-ic"><svg viewBox="0 0 24 24"><path d="M6 21V4M6 4h11l-2 4 2 4H6"/></svg></div><h3>${esc(nt("arrived"))}</h3><p>${esc(nt("arrSub", { d: fD(Math.max(nav.walked, 0.01)), t: fT(tS) }))}</p>
        <p class="nv-arr-d">${esc(nt("doseTot", { v: fmt(nav.dose, nav.dose < 10 ? 1 : 0) }))} <small>${esc(nt("est"))}</small></p><button type="button" class="nv-go">${esc(nt("close"))}</button></div>`;
      el.hidden = false; el.querySelector("button").onclick = close; $(".nv-bot").classList.add("arrived"); }
    /* ---------- Wake Lock, компас, батарея ---------- */
    async function getWake() { try { if (window.TazaApp && typeof TazaApp.keepScreen === "function") TazaApp.keepScreen(true); } catch (e) {}
      try { if ("wakeLock" in navigator && document.visibilityState === "visible") { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => { wake = null; }); } } catch (e) { wake = null; } }
    function relWake() { try { wake && wake.release(); } catch (e) {} wake = null; try { window.TazaApp && TazaApp.keepScreen && TazaApp.keepScreen(false); } catch (e) {} }
    const onVis = () => { if (document.visibilityState === "visible" && nav.started && !nav.done) getWake(); }; document.addEventListener("visibilitychange", onVis);
    const onOri = e => { let h = null; if (e.webkitCompassHeading != null) h = e.webkitCompassHeading; else if (e.absolute && e.alpha != null) h = 360 - e.alpha; if (h != null) compass = (h + (screen.orientation ? screen.orientation.angle || 0 : 0) + 360) % 360; };
    async function startCompass() { try { if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") { if (await DeviceOrientationEvent.requestPermission() !== "granted") return; }
      addEventListener("deviceorientationabsolute", onOri); addEventListener("deviceorientation", onOri); } catch (e) {} }
    function setLow(v, quiet) { low = v; ls(LOWKEY, v ? "1" : "0"); setBtnState(); w.classList.toggle("low", v);
      if (ready) m.getStyle().layers.forEach(l => { if (l.type === "fill-extrusion") m.setLayoutProperty(l.id, "visibility", v ? "none" : "visible"); });
      if (!quiet) msg(v ? nt("lowOn") : "", 3000); if (wid != null && !sim) { navigator.geolocation.clearWatch(wid); wid = null; startWatch(); }
      cancelAnimationFrame(raf); if (!v) raf = requestAnimationFrame(frame); else frame(performance.now(), true); }
    (async () => { try { if (navigator.getBattery && ls(LOWKEY) == null) { const b = await navigator.getBattery(); if (b.level < 0.2 && !b.charging) { setLow(true, true); msg(nt("lowBat"), 4500); } } } catch (e) {} })();
    /* ---------- симуляция (?navsim=1): фиксы раз в секунду вдоль линии, «Сойти с маршрута» — уводим точку в сторону ---------- */
    const SPD = { walk: 1.4, bike: 4.2, car: 11 }[mode] || 1.4; let simT = 0, simKm = 0, simX = 4, simOffK = 0, simBase = null;
    function simFix(ll, hdg) { onFix({ coords: { latitude: ll[0], longitude: ll[1], accuracy: 6, speed: SPD * Math.min(simX, 3), heading: hdg }, timestamp: Date.now() }); }
    function simTick() { if (!alive || nav.done) return; const dk = SPD * simX / 1000;
      if (simOffK) { simOffK++; const b = simBase; const p = atKm(nav.G, nav.cum, Math.min(nav.total, b.km + simOffK * dk * 0.5)).ll, side = bearing(b.ll, atKm(nav.G, nav.cum, Math.min(nav.total, b.km + 0.03)).ll) + 90, off = Math.min(70, simOffK * 18);
        const q = [p[0] + Math.cos(side * R) * off / 110570, p[1] + Math.sin(side * R) * off / (111320 * Math.cos(p[0] * R))]; simFix(q, side); }
      else { simKm = Math.min(nav.total, simKm + dk); const p = atKm(nav.G, nav.cum, simKm).ll, h = bearing(p, atKm(nav.G, nav.cum, Math.min(nav.total, simKm + 0.01)).ll); simFix(p, h); } }
    function simStart() { if (simT) return; simKm = Math.max(simKm, nav.along); simTick(); simT = setInterval(simTick, 1000); }
    function simStop() { clearInterval(simT); simT = 0; }
    function simReroute() { if (!sim) return; simOffK = 0; const p = fix ? project(nav.G, nav.cum, fix.ll) : null; simKm = p ? p.km : 0; }
    w.querySelectorAll("[data-sx]").forEach(b => { b.classList.toggle("on", +b.dataset.sx === simX); b.onclick = () => { simX = +b.dataset.sx; w.querySelectorAll("[data-sx]").forEach(x => x.classList.toggle("on", x === b)); }; });
    const so = $(".nv-simoff"); if (so) so.onclick = () => { if (!nav.started) return; simBase = { km: nav.along, ll: atKm(nav.G, nav.cum, nav.along).ll }; simOffK = 1; };
    /* ---------- кнопки ---------- */
    async function start() {
      if (!sim && !(await askGeo())) return; if (!alive) return;
      nav.started = true; nav.t0 = Date.now(); w.classList.add("going"); $(".nv-go").hidden = true; $(".nv-end").hidden = false; follow = true; zoom = 17.6;
      startCompass(); getWake(); startWatch(); msg(nt("wl"), 2500);
      if (!sim && !fix) msg(nt("wait"), 0);
      /* старт далеко от линии (> 60 м) — сразу строим путь от текущего места */
      if (fix && fix.pj && fix.pj.d > 60) reroute(fix.ll);
      speak(manText(nav.man[0] && nav.man[0].t === "start" && nav.man[1] ? nav.man[1] : nav.man[0]));
      cancelAnimationFrame(raf); if (!low) raf = requestAnimationFrame(frame); hud(); tfRefresh(); clearInterval(tfT); tfT = setInterval(tfRefresh, 120000); }
    $(".nv-go").onclick = start;
    $(".nv-end").onclick = close;
    $(".nv-north").onclick = () => { north = !north; ls(NORTHKEY, north ? "1" : "0"); setBtnState(); if (low) frame(performance.now(), true); };
    $(".nv-mute").onclick = () => { mute = !mute; ls(MUTEKEY, mute ? "1" : "0"); setBtnState(); if (mute) try { speechSynthesis.cancel(); } catch (e) {} };
    $(".nv-low").onclick = () => setLow(!low);
    const rec = $(".nv-rec"); rec.onclick = () => { follow = true; rec.hidden = true; if (low) frame(performance.now(), true); };
    m.on("dragstart", e => { if (e.originalEvent && nav.started) { follow = false; rec.hidden = false; } });
    function close() { alive = false; clearInterval(tfT); if (tfAb) tfAb.abort(); poiMk.forEach(x => x.remove()); stopWatch(); relWake(); cancelAnimationFrame(raf); if (rrAb) rrAb.abort(); try { speechSynthesis.cancel(); } catch (e) {}
      removeEventListener("deviceorientationabsolute", onOri); removeEventListener("deviceorientation", onOri); document.removeEventListener("visibilitychange", onVis); document.removeEventListener("keydown", esc_);
      try { m.remove(); } catch (e) {} w.remove(); document.documentElement.classList.remove("nv-open"); }
    const esc_ = e => { if (e.key === "Escape" && !w.querySelector(".nv-sheet-bg")) close(); }; document.addEventListener("keydown", esc_);
    setBtnState(); hud();
    /* до старта: показываем своё место и точность (если разрешение уже дано) */
    if (sim) { const p0 = atKm(nav.G, nav.cum, 0).ll; simFix(p0, bearing(p0, atKm(nav.G, nav.cum, 0.02).ll)); }
    else geoState().then(s => { if (s === "granted" && alive) navigator.geolocation.getCurrentPosition(onFix, () => {}, { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }); });
    window.__nav = { map: m, nav, start, close, get fix() { return fix; }, simKm: k => { simKm = k; simOffK = 0; simTick(); }, leave: () => so && so.click(), tick: simTick, stopSim: simStop, tfRefresh, osmLoad, setSpeed: x => { simX = x; } };
  };
})();
