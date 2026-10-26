/* Таза Аба — quick wins: офлайн-кэш вместо выдуманных чисел, онбординг, «Поделиться воздухом»,
 * меню из 5 вкладок, честные жалобы, риск вечернего смога. Загружается до app.js (функции вызываются в рантайме). */
/* адрес сайта: из config.js (SITE_URL) или текущая страница без #хэша и имени файла — работает и в подпапке (GitHub Pages /taza-aba/) */
const SITE_URL = (() => { const c = (window.TAZA_CONFIG || {}).SITE_URL; if (c) return c.endsWith("/") ? c : c + "/";
  return /^https?:$/.test(location.protocol) ? location.href.split(/[?#]/)[0].replace(/[^/]*$/, "") : ""; })();
if (SITE_URL) { [["og:image", "icons/og.png"]].forEach(([k, v]) => { const m = document.querySelector(`meta[property="${k}"]`); if (m) m.content = SITE_URL + v; });
  const tw = document.querySelector('meta[name="twitter:image"]'); if (tw) tw.content = SITE_URL + "icons/og.png"; }
const QD = {
  ru: { svcTitle: "Сервис данных не ответил", svcSub: "Сеть есть, но Open-Meteo не ответил вовремя. Повторим автоматически через {s} с.", svcBadge: "сервис не ответил — данные от {t}", svcNote: "⚠️ Сервис данных не ответил — показаны последние реальные данные от {t}. Повторим через {s} с.",
    ndAdvHead: "Сейчас данных о воздухе нет ({why}), поэтому без цифр — общие советы:", whyOff: "нет сети", whySvc: "сервис данных не ответил", whyLoad: "данные ещё загружаются", ndUpd: "Ответ обновится сам, когда появятся данные.",
    nd_walk: "Зимой смог обычно сильнее вечером и ночью (18:00–23:00), днём воздух чаще чище — гуляйте днём, подальше от дорог и дыма.", nd_windows: "Проветривайте коротко (5–10 минут) днём; вечером и ночью, когда топят печи, держите окна закрытыми.",
    nd_mask: "В сильный смог помогает только плотно прилегающий респиратор FFP2/KN95; медицинская маска почти не задерживает PM2.5.", nd_coal: "Самое действенное — меньше угля: утепление, электро- или газовое отопление, тепловой насос. Не сжигайте мусор.",
    nd_school: "Если ребёнку трудно дышать или есть астма — сократите прогулки вечером; занятия спортом лучше в помещении в смоговые дни.", nd_gen: "Дома помогает очиститель воздуха с HEPA-фильтром; людям с астмой держите лекарства под рукой.",
    lzLoad: "Загружаю раздел…", lzErr: "Не удалось загрузить раздел", hist: "История и статистика", histSub: "Графики за 24 ч – 90 дней, нормы ВОЗ", histHome: "📈 История воздуха: 24 ч, 7, 30 и 90 дней →",
    today: "сегодня", stTitle: "Нет свежих данных", stSub: "Последнее обновление было больше суток назад. Старые значения не показываются как текущие — ниже архив только для справки.", archive: "архив от {t}", stBadge: "нет свежих данных", obOffTitle: "Вы офлайн", obOffSub: "Данные загрузятся, когда появится сеть. Мы проверим автоматически.", sentHint: "Отправили? Нажмите «Отметить как отправленное».", lastVia: "открыто: {v}", mailTypo: "E-mail на сайте мэрии указан с опечаткой: «{m}» — адресат письма оставлен пустым, уточните адрес по телефону.",
    offline: "офлайн — данные от {t}", nodata: "нет данных", ndTitle: "Нет данных о воздухе", ndSub: "Не удалось связаться с Open-Meteo, а сохранённых данных для этого города на устройстве нет. Мы не показываем выдуманные цифры.", retry: "Повторить",
    offNote: "⚠️ Нет связи — показаны последние реальные данные от {t}", ctryNd: "Нет связи с Open-Meteo — данные по городам недоступны.",
    obTitle: "Добро пожаловать в «Таза Аба»", obSub: "Выберите свой район — покажем воздух именно у вас. Можно изменить в любой момент.", obLang: "Язык", obGeo: "Определить по геолокации", obOr: "или выберите вручную",
    obCtry: "Страна", obGo: "Готово", obFound: "Ближайший район: {d}", obFar: "Вы далеко от городов приложения — выбран ближайший: {c}", obGeoErr: "Геолокация недоступна — выберите вручную",
    share: "Поделиться воздухом", copied: "Текст скопирован", shareTxt: "{In} сейчас AQI {aqi} — {adv}.", shareOff: " (данные от {t})",
    shAdv0: "можно гулять и проветривать", shAdv1: "чувствительным лучше сократить прогулки", shAdv2: "не гуляйте с детьми", shAdv3: "лучше остаться дома, на улице — маска", shAdv4: "не выходите без необходимости", shAdv5: "опасно: оставайтесь дома",
    evTitle: "Риск вечернего смога", ev0: "низкий", ev1: "средний", ev2: "высокий", evLow: "Вечером воздух ожидается чище — можно проветривать.",
    evBefore: "Проветрите сейчас и гуляйте до {x}; после 18:00 держите окна закрытыми.", evNow: "Держите окна закрытыми до утра, прогулки перенесите.",
    evF: "18–23 ч: AQI до {a}", evFp: "18–23 ч: PM2.5 до {p} мкг/м³ (AQI {a} за час)", evWind: "вечером ветер {w} м/с", evInv: "инверсия", evNoInv: "без инверсии", evInvD: "инверсия (на ~{m} м теплее на {d} °C)", evBlh: "слой перемешивания ~{m} м (модель)", evSrc: "прогноз Open-Meteo (CAMS + погода)", evTomorrow: "на завтра",
    mWeather: "Погода", mWeatherSub: "Прогноз и ветер на 7 дней", mHouse: "Расчёт перехода с угля", 
    cmpMake: "Сформировать обращение", lsFull: "Память браузера для сайта переполнена — последние изменения могут не сохраниться. Удалите старые жалобы с фото или лишние данные.", cmpQuota: "Обращение создано, но память браузера переполнена — после перезагрузки оно пропадёт. Удалите старые жалобы с фото.", cmpMade: "Обращение готово — выберите, как отправить", cmpDraft: "Черновик", cmpSentYou: "Отправлено вами", cmpVia: "через {v}, {t}",
    cmpHead: "Обращение о загрязнении воздуха", cmpType: "Тип", cmpDesc: "Описание", cmpPlace: "Район", cmpCoords: "Координаты", cmpTime: "Время", cmpAqi: "Текущий AQI в районе", cmpPhoto: "Фото: есть, прилагаю отдельно",
    cmpSubj: "Жалоба: {c} — {d}", cmpCopy: "Копировать", cmpMark: "Отметить как отправленное", cmpPhotoNote: "📎 Фото не прикрепляется автоматически: добавьте его в письмо/чат вручную.",
    cmpTo: "Куда обращаться (официальные источники)", cmpNoTo: "Официальные контакты для этого города не проверены — получатель не указан, впишите его сами.", cmpSrc: "источник",
    cmpEmpty: "Пока жалоб нет — отправьте первую выше 👆", cmpFoot: "Приложение ничего не отправляет само: обращение уходит только через выбранный вами мессенджер или почту.",
    mi: "Муниципальная инспекция мэрии Бишкека", mnr: "Минприроды КР — горячая линия 24/7", mnrB: "Бишкекское ТУ Минприроды" },
  ky: { svcTitle: "Маалымат кызматы жооп берген жок", svcSub: "Тармак бар, бирок Open-Meteo өз убагында жооп берген жок. {s} секунддан кийин кайра аракет кылабыз.", svcBadge: "кызмат жооп бербеди — {t} маалыматы", svcNote: "⚠️ Маалымат кызматы жооп берген жок — акыркы чыныгы маалымат ({t}) көрсөтүлдү. {s} сек кийин кайталайбыз.",
    ndAdvHead: "Азыр аба тууралуу маалымат жок ({why}), ошондуктан сандарсыз — жалпы кеңештер:", whyOff: "тармак жок", whySvc: "маалымат кызматы жооп берген жок", whyLoad: "маалымат дагы жүктөлүүдө", ndUpd: "Маалымат келгенде жооп өзү жаңырат.",
    nd_walk: "Кышында түтүн көбүнчө кечинде жана түнү (18:00–23:00) күчөйт, күндүз аба тазараак — күндүз, жолдон жана түтүндөн алыс сейилдеңиз.", nd_windows: "Күндүз кыска (5–10 мүнөт) желдетиңиз; кечинде жана түнү мештер жагылганда терезелерди жабык кармаңыз.",
    nd_mask: "Катуу түтүндө тыкыс жабышкан FFP2/KN95 респиратор гана жардам берет; медициналык маска PM2.5ти дээрлик кармабайт.", nd_coal: "Эң натыйжалуусу — көмүрдү азайтуу: жылуулоо, электр же газ менен жылытуу, жылуулук насосу. Таштанды өрттөбөңүз.",
    nd_school: "Баланын демиккени же астмасы болсо — кечки сейилдөөнү кыскартыңыз; түтүндүү күндөрү спорт жайда болгону жакшы.", nd_gen: "Үйдө HEPA чыпкалуу аба тазалагыч жардам берет; астмасы барлар дарысын жанында кармасын.",
    lzLoad: "Бөлүм жүктөлүүдө…", lzErr: "Бөлүмдү жүктөө мүмкүн болгон жок", hist: "Тарых жана статистика", histSub: "24 саат – 90 күндүк графиктер, ДССУ ченеми", histHome: "📈 Абанын тарыхы: 24 саат, 7, 30 жана 90 күн →",
    today: "бүгүн", stTitle: "Жаңы маалымат жок", stSub: "Акыркы жаңыртуу бир суткадан мурун болгон. Эски маанилер азыркыдай көрсөтүлбөйт — төмөндө маалымат үчүн гана архив.", archive: "архив, {t}", stBadge: "жаңы маалымат жок", obOffTitle: "Сиз офлайнсыз", obOffSub: "Тармак пайда болгондо маалымат жүктөлөт. Автоматтык түрдө текшеребиз.", sentHint: "Жөнөттүңүзбү? «Жөнөтүлдү деп белгилөө» баскычын басыңыз.", lastVia: "ачылды: {v}", mailTypo: "Мэриянын сайтында e-mail ката менен жазылган: «{m}» — алуучу бош калтырылды, даректи телефон аркылуу тактаңыз.",
    offline: "офлайн — {t} маалыматы", nodata: "маалымат жок", ndTitle: "Аба тууралуу маалымат жок", ndSub: "Open-Meteo менен байланыш жок, бул шаар үчүн сакталган маалымат да жок. Ойдон чыгарылган сандарды көрсөтпөйбүз.", retry: "Кайталоо",
    offNote: "⚠️ Байланыш жок — {t} акыркы чыныгы маалымат", ctryNd: "Open-Meteo менен байланыш жок — шаарлар боюнча маалымат жок.",
    obTitle: "«Таза Аба»га кош келиңиз", obSub: "Аймагыңызды тандаңыз — абаны так сиздин жерде көрсөтөбүз.", obLang: "Тил", obGeo: "Геолокация боюнча аныктоо", obOr: "же өзүңүз тандаңыз",
    obCtry: "Өлкө", obGo: "Даяр", obFound: "Жакынкы аймак: {d}", obFar: "Колдонмодогу шаарлардан алыссыз — жакынкысы тандалды: {c}", obGeoErr: "Геолокация жеткиликсиз — өзүңүз тандаңыз",
    share: "Аба менен бөлүшүү", copied: "Текст көчүрүлдү", shareTxt: "{In} азыр AQI {aqi} — {adv}.", shareOff: " ({t} маалыматы)",
    shAdv0: "сейилдеп, желдетсе болот", shAdv1: "сезгич адамдар сейилдөөнү кыскартсын", shAdv2: "балдар менен сейилдебеңиз", shAdv3: "үйдө калган жакшы, сыртта — маска", shAdv4: "зарылчылыксыз чыкпаңыз", shAdv5: "коркунучтуу: үйдө калыңыз",
    evTitle: "Кечки түтүн тобокели", ev0: "төмөн", ev1: "орточо", ev2: "жогору", evLow: "Кечинде аба тазараак болот — желдетсе болот.",
    evBefore: "Азыр желдетиңиз, {x} чейин сейилдеңиз; 18:00дөн кийин терезелерди жабык кармаңыз.", evNow: "Эртеңге чейин терезелерди жабык кармаңыз, сейилдөөнү кийинкиге калтырыңыз.",
    evF: "18–23: AQI {a} чейин", evFp: "18–23: PM2.5 {p} мкг/м³ чейин (саатына AQI {a})", evWind: "кечинде шамал {w} м/с", evInv: "инверсия", evNoInv: "инверсия жок", evInvD: "инверсия (~{m} м бийиктикте {d} °C жылуу)", evBlh: "аралашуу катмары ~{m} м (модель)", evSrc: "Open-Meteo божомолу (CAMS + аба ырайы)", evTomorrow: "эртеңге",
    mWeather: "Аба ырайы", mWeatherSub: "7 күнгө божомол жана шамал", mHouse: "Көмүрдөн өтүү эсеби", 
    cmpMake: "Арызды түзүү", lsFull: "Браузердин сайт үчүн эси толду — акыркы өзгөрүүлөр сакталбашы мүмкүн. Сүрөттүү эски арыздарды өчүрүңүз.", cmpQuota: "Арыз түзүлдү, бирок браузердин эси толду — кайра жүктөгөндө жоголот. Сүрөттүү эски арыздарды өчүрүңүз.", cmpMade: "Арыз даяр — кантип жөнөтүүнү тандаңыз", cmpDraft: "Долбоор", cmpSentYou: "Сиз жөнөттүңүз", cmpVia: "{v} аркылуу, {t}",
    cmpHead: "Абанын булганышы тууралуу арыз", cmpType: "Түрү", cmpDesc: "Сүрөттөмө", cmpPlace: "Аймак", cmpCoords: "Координаттар", cmpTime: "Убакыт", cmpAqi: "Аймактагы учурдагы AQI", cmpPhoto: "Сүрөт: бар, өзүнчө тиркейм",
    cmpSubj: "Арыз: {c} — {d}", cmpCopy: "Көчүрүү", cmpMark: "Жөнөтүлдү деп белгилөө", cmpPhotoNote: "📎 Сүрөт автоматтык түрдө тиркелбейт: аны катка/чатка өзүңүз кошуңуз.",
    cmpTo: "Кайда кайрылуу (расмий булактар)", cmpNoTo: "Бул шаар үчүн расмий байланыштар текшерилген эмес — алуучуну өзүңүз жазыңыз.", cmpSrc: "булак",
    cmpEmpty: "Азырынча арыз жок — биринчисин жогоруда жөнөтүңүз 👆", cmpFoot: "Колдонмо өзү эч нерсе жөнөтпөйт: арыз сиз тандаган мессенджер же почта аркылуу гана кетет.",
    mi: "Бишкек мэриясынын муниципалдык инспекциясы", mnr: "КР Жаратылыш ресурстар министрлиги — 24/7 ышкын линия", mnrB: "Министрликтин Бишкек аймактык башкармалыгы" },
  en: { svcTitle: "The data service didn't respond", svcSub: "You're online, but Open-Meteo didn't respond in time. We'll retry automatically in {s} s.", svcBadge: "service didn't respond — data from {t}", svcNote: "⚠️ The data service didn't respond — showing the last real data from {t}. Retrying in {s} s.",
    ndAdvHead: "There's no air data right now ({why}), so here is general advice without numbers:", whyOff: "no network", whySvc: "the data service didn't respond", whyLoad: "data is still loading", ndUpd: "This answer will update by itself once data arrives.",
    nd_walk: "In winter smog is usually worst in the evening and at night (18:00–23:00); daytime air is often cleaner — walk during the day, away from roads and smoke.", nd_windows: "Air out briefly (5–10 minutes) during the day; keep windows closed in the evening and at night when stoves are burning.",
    nd_mask: "In heavy smog only a tight-fitting FFP2/KN95 respirator helps; a surgical mask barely stops PM2.5.", nd_coal: "The most effective step is less coal: insulation, electric or gas heating, a heat pump. Never burn rubbish.",
    nd_school: "If a child has trouble breathing or asthma, cut evening walks; on smoggy days indoor sport is better.", nd_gen: "At home a HEPA air purifier helps; people with asthma should keep their medication at hand.",
    lzLoad: "Loading section…", lzErr: "Couldn't load this section", hist: "History & statistics", histSub: "Charts for 24 h – 90 days, WHO guideline", histHome: "📈 Air history: 24 h, 7, 30 and 90 days →",
    today: "today", stTitle: "No fresh data", stSub: "The last update was more than 24 hours ago. Old values are not shown as current — the archive below is for reference only.", archive: "archive from {t}", stBadge: "no fresh data", obOffTitle: "You are offline", obOffSub: "Data will load when you are back online. We will retry automatically.", sentHint: "Sent it? Tap “Mark as sent”.", lastVia: "opened: {v}", mailTypo: "The e-mail on the city hall site has a typo: “{m}” — the recipient is left empty, please confirm the address by phone.",
    offline: "offline — data from {t}", nodata: "no data", ndTitle: "No air data", ndSub: "Couldn't reach Open-Meteo and there is no saved data for this city on this device. We never show made-up numbers.", retry: "Retry",
    offNote: "⚠️ Offline — showing the last real data from {t}", ctryNd: "No connection to Open-Meteo — city data unavailable.",
    obTitle: "Welcome to Taza Aba", obSub: "Pick your district and we'll show the air right where you live. You can change it any time.", obLang: "Language", obGeo: "Use my location", obOr: "or choose manually",
    obCtry: "Country", obGo: "Done", obFound: "Nearest district: {d}", obFar: "You're far from the app's cities — nearest selected: {c}", obGeoErr: "Location unavailable — choose manually",
    share: "Share the air", copied: "Text copied", shareTxt: "{In} the AQI is {aqi} right now — {adv}.", shareOff: " (data from {t})",
    shAdv0: "fine to walk and air out", shAdv1: "sensitive people should cut walks short", shAdv2: "don't take kids for a walk", shAdv3: "better stay inside, wear a mask outdoors", shAdv4: "don't go out unless necessary", shAdv5: "hazardous: stay indoors",
    evTitle: "Evening smog risk", ev0: "low", ev1: "medium", ev2: "high", evLow: "The evening air should be cleaner — fine to air out.",
    evBefore: "Air out now and walk before {x}; keep windows closed after 18:00.", evNow: "Keep windows closed until morning and postpone walks.",
    evF: "18–23h: AQI up to {a}", evFp: "18–23h: PM2.5 up to {p} µg/m³ (hourly AQI {a})", evWind: "evening wind {w} m/s", evInv: "inversion", evNoInv: "no inversion", evInvD: "inversion ({d} °C warmer at ~{m} m)", evBlh: "mixing layer ~{m} m (model)", evSrc: "Open-Meteo forecast (CAMS + weather)", evTomorrow: "for tomorrow",
    mWeather: "Weather", mWeatherSub: "7-day forecast and wind", mHouse: "Coal switch calculator", 
    cmpMake: "Prepare complaint", lsFull: "Browser storage for this site is full — recent changes may not be saved. Delete old complaints with photos.", cmpQuota: "Complaint created, but browser storage is full — it will be lost after reload. Delete old complaints with photos.", cmpMade: "Complaint ready — choose how to send it", cmpDraft: "Draft", cmpSentYou: "Sent by you", cmpVia: "via {v}, {t}",
    cmpHead: "Air pollution complaint", cmpType: "Type", cmpDesc: "Description", cmpPlace: "District", cmpCoords: "Coordinates", cmpTime: "Time", cmpAqi: "Current AQI in the district", cmpPhoto: "Photo: available, attached separately",
    cmpSubj: "Complaint: {c} — {d}", cmpCopy: "Copy", cmpMark: "Mark as sent", cmpPhotoNote: "📎 The photo isn't attached automatically: add it to the email/chat yourself.",
    cmpTo: "Where to report (official sources)", cmpNoTo: "Official contacts for this city aren't verified — no recipient filled in, add it yourself.", cmpSrc: "source",
    cmpEmpty: "No complaints yet — send the first one above 👆", cmpFoot: "The app never sends anything itself: the complaint goes only through the messenger or email you choose.",
    mi: "Bishkek Mayor's Office Municipal Inspection", mnr: "Ministry of Natural Resources — 24/7 hotline", mnrB: "Ministry's Bishkek territorial office" },
  
};
const Q = (k, v = {}) => String((QD[LANG] || QD.en)[k] ?? QD.ru[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
const hhmm = ms => { const d = new Date(ms); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
const fmtAt = ms => { const d = new Date(ms), n = new Date(); const day = d.toDateString() === n.toDateString() ? Q("today") : String(d.getDate()).padStart(2, "0") + "." + String(d.getMonth() + 1).padStart(2, "0"); return day + ", " + hhmm(ms); };
const STALE_MS = 24 * 3600e3;
const cap1 = s => s ? s[0].toUpperCase() + s.slice(1) : s;

/* ---------- 1. Без выдуманных чисел: кэш последних реальных данных ---------- */
const AIR_CACHE = c => "tazaAba.air." + c;
function saveAirCache() {
  try { localStorage.setItem(AIR_CACHE(CITY), JSON.stringify({ at: Date.now(), updated: air.updated, byDistrict: air.byDistrict, byRoute: air.byRoute, weather: air.weather, wxH: air.wxH })); }
  catch (e) { console.warn("air cache:", e.message); }
}
function useCachedAir() {
  let c = null; try { c = JSON.parse(localStorage.getItem(AIR_CACHE(CITY)) || "null"); } catch { c = null; }
  if (!c || !c.byDistrict || !DISTRICTS.every(d => c.byDistrict[d.id])) { air.byDistrict = {}; air.byRoute = {}; air.weather = null; air.wxH = null; air.live = false; air.status = "nodata"; return false; }
  if (!c.at || Date.now() - c.at > STALE_MS) {   // старше суток — только архив, не «текущие» данные
    air.archive = { at: c.at || 0, byDistrict: c.byDistrict }; air.byDistrict = {}; air.byRoute = {}; air.weather = null; air.wxH = null; air.live = false; air.status = "stale"; air.offlineAt = c.at || 0; return false; }
  air.archive = null;
  Object.assign(air, { byDistrict: c.byDistrict, byRoute: c.byRoute || {}, weather: c.weather, wxH: c.wxH, updated: c.updated, live: false, status: "offline", offlineAt: c.at });
  return true;
}
let obJust = false;   // только что прошли онбординг — мягкое состояние вместо резкого «Нет данных»
function viewNoData(el) {
  const off = air.errKind === "offline" || navigator.onLine === false, svc = !off && air.errKind === "service", ar = air.status === "stale" && air.archive;
  const left = air.retryAt ? Math.max(1, Math.round((air.retryAt - Date.now()) / 1000)) : 30;
  const arch = ar ? `<div class="nd-arch"><div class="small nd-arch-h">🗄️ ${Q("archive", { t: fmtAt(ar.at) })}</div><ul>${DISTRICTS.filter(d => ar.byDistrict[d.id]).map(d => `<li><span>${esc(dName(d))}</span><b>AQI ${ar.byDistrict[d.id].aqi}</b></li>`).join("")}</ul></div>` : "";
  const [ic, ti, su] = ar ? ["🗄️", Q("stTitle"), Q("stSub") + (svc ? " " + Q("svcSub", { s: left }) : "")] : off ? ["🌙", Q("obOffTitle"), Q("obOffSub")] : svc ? ["⏳", Q("svcTitle"), Q("svcSub", { s: left })] : ["📡", Q("ndTitle"), Q("ndSub")];
  el.innerHTML = `<div class="card nodata${!ar && (off || svc) ? " nd-gentle" : ""}"><div style="font-size:42px">${ic}</div><h1>${ti}</h1><p class="sub">${su}</p>
    <button class="btn" id="ndRetry">${Q("retry")}</button>${arch}</div>`;
  $("#ndRetry").onclick = () => { air.status = "loading"; route(); loadAir(); };
}
/* советы без цифр, когда данных нет: причина + общие рекомендации; ответ перерисуется, когда данные придут */
function noDataAnswer(q) {
  const why = air.status === "loading" ? Q("whyLoad") : (air.errKind === "offline" || navigator.onLine === false) ? Q("whyOff") : Q("whySvc");
  const ks = q && QD.ru["nd_" + q] ? ["nd_" + q, "nd_gen"] : ["nd_walk", "nd_windows", "nd_mask", "nd_gen"];
  return `⚠️ ${Q("ndAdvHead", { why })}<br>${ks.map(k => "• " + Q(k)).join("<br>")}<br><span class="small muted">${Q("ndUpd")}</span>`;
}
/* ленивая загрузка разделов: скрипт/стили подгружаются один раз, только при открытии раздела */
const lazyP = {};
function lazyLoad(files) {
  return Promise.all(files.map(f => lazyP[f] || (lazyP[f] = new Promise((res, rej) => {
    const isCss = f.endsWith(".css"), n = document.createElement(isCss ? "link" : "script");
    if (isCss) { n.rel = "stylesheet"; n.href = f; } else { n.src = f; n.async = false; }
    n.onload = () => res(); n.onerror = () => { delete lazyP[f]; n.remove(); rej(new Error("load " + f)); };
    document.head.appendChild(n);
  }))));
}
function lazyView(name, files, ready, run) {
  views[name] = el => {
    if (ready()) return run(el);
    el.innerHTML = `<h1>${Q("lzLoad")}</h1><div class="skeleton"></div>`;
    withTimeout(lazyLoad(files), 15000).then(() => { if (!ready()) throw new Error("lazy module " + name + " loaded but not ready"); if ((location.hash || "").slice(1).split("/")[0] === name) route(true); })   // v49: без проверки ready() ошибка в модуле давала бесконечный цикл route()
      .catch(e => { console.warn(e.message); if ((location.hash || "").slice(1).split("/")[0] !== name) return;
        el.innerHTML = `<div class="card nodata"><div style="font-size:42px">📦</div><h1>${Q("lzErr")}</h1><button class="btn" id="lzRetry">${Q("retry")}</button></div>`;
        $("#lzRetry").onclick = () => route(true); });
  };
}
addEventListener("online", () => { if (air.status !== "ok" && typeof loadAir === "function") loadAir(); });
/* ссылки WhatsApp/Telegram на главной — тем же shareText(), после каждого обновления данных */
function refreshShareLinks() {
  document.querySelectorAll(".share-row").forEach(r => { const txt = shareText(), e = encodeURIComponent;
    const w = r.querySelector('[data-sh="wa"]'), tg = r.querySelector('[data-sh="tg"]');
    if (w) w.href = `https://wa.me/?text=${e(txt + " " + SITE_URL)}`; if (tg) tg.href = `https://t.me/share/url?url=${e(SITE_URL)}&text=${e(txt)}`; });
}

/* ---------- 2. Онбординг ---------- */
const OB_KEY = "tazaAba.onboarded";
function nearestAnywhere(lat, lon) {
  let best = null;
  Object.entries(CITIES).forEach(([cid, c]) => c.districts.forEach(d => { const k = haversineKm([lat, lon], [d.lat, d.lon]); if (!best || k < best.km) best = { cid, d, km: k }; }));
  return best;
}
function openOnboard() {
  let w = document.getElementById("obWrap");
  if (!w) { w = document.createElement("div"); w.id = "obWrap"; w.className = "ob-wrap"; document.body.appendChild(w); }
  let ctry = cityObj().country, city = CITY, dist = state.district;
  const LN = { ru: "Русский", ky: "Кыргызча", en: "English" };
  const draw = () => {
    const order = KG_ORDER; if (!order.includes(city)) city = order[0];
    const ds = CITIES[city].districts; if (!ds.some(d => d.id === dist)) dist = CITIES[city].defaultDistrict || ds[0].id;
    w.innerHTML = `<div class="ob-sheet" role="dialog" aria-modal="true" aria-labelledby="obT">
      <div class="ob-logo">🌻</div><h3 id="obT">${Q("obTitle")}</h3><p class="sub">${Q("obSub")}</p>
      <label>${Q("obLang")}</label><div class="ob-langs">${Object.entries(LN).map(([l, n]) => `<button type="button" data-l="${l}" class="${l === LANG ? "on" : ""}">${n}</button>`).join("")}</div>
      <button type="button" class="btn sun block" id="obGeo" style="margin-top:14px">📍 ${Q("obGeo")}</button>
      <div class="ob-or">${Q("obOr")}</div>
      <div class="ob-sels">
        <label hidden>${Q("obCtry")}<select id="obCtry">${["kg"].map(k => `<option value="${k}" ${k === ctry ? "selected" : ""}>${k === "kg" ? "🇰🇬" : "🇹🇷"} ${ctryName(k)}</option>`).join("")}</select></label>
        <label>${t("cityLbl")}<select id="obCity">${order.map(id => `<option value="${id}" ${id === city ? "selected" : ""}>${CITIES[id].emoji} ${tr(CITIES[id].name)}</option>`).join("")}</select></label>
        <label>${t("district")}<select id="obDist">${ds.map(d => `<option value="${d.id}" ${d.id === dist ? "selected" : ""}>${esc(dName(d))}</option>`).join("")}</select></label>
      </div>
      <button type="button" class="btn block" id="obGo" style="margin-top:16px">${Q("obGo")} →</button></div>`;
    w.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { setLang(b.dataset.l); renderChrome(); draw(); });
    $("#obCtry").onchange = e => { ctry = e.target.value; draw(); };
    $("#obCity").onchange = e => { city = e.target.value; draw(); };
    $("#obDist").onchange = e => { dist = e.target.value; };
    $("#obGeo").onclick = () => {
      if (!navigator.geolocation) return toast(Q("obGeoErr"));
      navigator.geolocation.getCurrentPosition(p => {
        const n = nearestAnywhere(p.coords.latitude, p.coords.longitude); if (!n) return;
        city = n.cid; ctry = CITIES[n.cid].country; dist = n.d.id; draw();
        toast(n.km > 40 ? Q("obFar", { c: tr(CITIES[n.cid].name) }) : Q("obFound", { d: dName(n.d) }));
      }, () => toast(Q("obGeoErr")), { timeout: 9000, maximumAge: 600000 });
    };
    $("#obGo").onclick = () => {
      localStorage.setItem(OB_KEY, "1"); w.remove(); obJust = true; setTimeout(() => { obJust = false; }, 120000);
      state.district = dist; state.alerts.district = dist; save();
      if (city !== CITY) switchCity(city); else route(true);
    };
  };
  draw();
}
function maybeOnboard() { if (!localStorage.getItem(OB_KEY)) openOnboard(); }

/* ---------- 3. Поделиться воздухом ---------- */
function shareText() {
  const d = byId(state.district), a = air.byDistrict[d.id]; if (!a || a.aqi == null) return "";
  const i = Math.max(0, AQI_LEVELS.indexOf(level(a.aqi)));
  let s = Q("shareTxt", { In: cap1(dLoc(d)), aqi: a.aqi, adv: Q("shAdv" + Math.min(i, 5)) });
  if (air.status === "offline") s = s.replace(/\.$/, Q("shareOff", { t: fmtAt(air.offlineAt) }) + ".");
  return s;
}
async function copyText(s) {
  try { await navigator.clipboard.writeText(s); }
  catch { const ta = document.createElement("textarea"); ta.value = s; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) { /* ignore */ } ta.remove(); }
  toast(Q("copied"));
}
function shareRowHTML() {
  const txt = shareText(), full = txt + " " + SITE_URL, e = encodeURIComponent;
  return `<div class="share-row"><button type="button" class="btn sun" id="shareBtn">📤 ${Q("share")}</button>
    <a class="sh-a" data-sh="wa" href="https://wa.me/?text=${e(full)}" target="_blank" rel="noopener" aria-label="WhatsApp">WhatsApp</a>
    <a class="sh-a" data-sh="tg" href="https://t.me/share/url?url=${e(SITE_URL)}&text=${e(txt)}" target="_blank" rel="noopener" aria-label="Telegram">Telegram</a></div>`;
}
function bindShare(el) {
  const b = $("#shareBtn", el); if (!b) return;
  b.onclick = async () => {
    const txt = shareText();
    if (navigator.share) { try { await navigator.share({ title: "Таза Аба", text: txt, url: SITE_URL }); return; } catch (e) { if (e.name === "AbortError") return; } }
    copyText(txt + " " + SITE_URL);
  };
}

/* ---------- 6. Риск вечернего смога ---------- */
function eveningRisk(a) {
  if (!a || !a.time) return null;
  const ct = a.currentTime || a.time[0], curH = +ct.slice(11, 13);
  let day = ct.slice(0, 10), tomorrow = false;
  if (curH >= 23) { const nx = a.time.find(tm => tm.slice(0, 10) > day); if (!nx) return null; day = nx.slice(0, 10); tomorrow = true; }
  const inEv = tm => tm.startsWith(day) && +tm.slice(11, 13) >= 18 && +tm.slice(11, 13) <= 23;
  const HA = typeof hAqi === "function" ? hAqi(a) : a.hourly;   // v52: PM2.5 каждого часа, а не среднее за 24 ч (оно сглаживало вечерний пик)
  const aq = a.time.map((tm, i) => inEv(tm) ? HA[i] : null).filter(v => v != null);
  if (!aq.length) return null;
  const aqMax = Math.max(...aq);
  const pmE = Array.isArray(a.pmH) ? a.time.map((tm, i) => inEv(tm) ? a.pmH[i] : null).filter(v => v != null) : [], pmMax = pmE.length ? Math.max(...pmE) : null;
  let wind = null, inv = null, blh = null, invD = null; const W = air.wxH;
  if (W && W.time) {
    const ix = W.time.map((tm, i) => inEv(tm) ? i : -1).filter(i => i >= 0);
    const ws = ix.map(i => W.wind_speed_10m?.[i]).filter(v => v != null); if (ws.length) wind = ws.reduce((s, v) => s + v, 0) / ws.length;
    const iv = ix.map(i => typeof invAt === "function" ? invAt(W, i) : null).filter(Boolean); if (iv.length) inv = iv.some(v => v.inv);   // v51: профиль 925–700 гПа выше рельефа
    const ivs = iv.filter(v => v.inv); if (ivs.length) { const m = ivs.reduce((a, v) => v.dT > a.dT ? v : a); invD = { dT: m.dT, z: Math.min(...ivs.map(v => v.dz)) }; }
    const bl = ix.map(i => W.boundary_layer_height?.[i]).filter(v => v != null); if (bl.length) blh = Math.min(...bl);
  }
  let sc = aqMax >= 201 ? 4 : aqMax >= 151 ? 3 : aqMax >= 101 ? 2 : aqMax >= 76 ? 1 : 0;
  if (wind != null && wind < 1.5) sc++; if (wind != null && wind < 0.8) sc++;
  // v51: инверсия и тонкий слой перемешивания — один фактор «застой» (+1), ещё +1 только за сильную инверсию (≥ 3 °C)
  if (inv || (blh != null && blh < 200)) sc++; if (invD && invD.dT >= 3) sc++;
  // v51: одна погода (ветер, инверсия) без высокого AQI по модели — не выше «умеренного»
  const risk = sc >= 4 && aqMax >= 76 ? 2 : sc >= 2 ? 1 : 0;
  let x = "18:00";
  if (!tomorrow) { const bad = a.time.findIndex((tm, i) => tm.startsWith(day) && +tm.slice(11, 13) > curH && HA[i] > 100); if (bad >= 0 && +a.time[bad].slice(11, 13) < 18) x = a.time[bad].slice(11, 16); }
  const adv = risk === 0 ? Q("evLow") : (!tomorrow && curH < 18) ? Q("evBefore", { x }) : Q("evNow");
  return { risk, aqMax, pmMax, wind, inv, invD, blh, adv, tomorrow };
}
/* inline SVG вместо эмодзи (🌫️ на iOS рисуется серым размытым квадратом) */
/* v71: линейные иконки Lucide через polish.js (луна · туман · завод) вместо цветных картинок */
const EV_ICO = ["🌙", "🌫️", "🏭"];
function evFactors(r) {
  const f = [r.pmMax != null ? Q("evFp", { a: r.aqMax, p: fmt(r.pmMax, 0) }) : Q("evF", { a: r.aqMax })]; if (r.wind != null) f.push(Q("evWind", { w: fmt(r.wind, 1) }));
  if (r.inv != null) f.push(r.inv && r.invD ? Q("evInvD", { d: fmt(r.invD.dT, 1), m: typeof mRound === "function" ? mRound(r.invD.z) : Math.round(r.invD.z * 1000) }) : r.inv ? Q("evInv") : Q("evNoInv"));
  if (r.blh != null) f.push(Q("evBlh", { m: Math.max(10, Math.round(r.blh / 10) * 10) }));
  return f;
}
function eveningCardHTML(a) {
  const r = eveningRisk(a); if (!r) return "";
  const f = evFactors(r);
  return `<div class="card ev-card ev-${r.risk}" role="status"><div class="ev-ico" aria-hidden="true">${EV_ICO[r.risk]}</div><div style="flex:1;min-width:0">
    <div class="ev-k">${Q("evTitle")}${r.tomorrow ? " · " + Q("evTomorrow") : ""}</div><div class="ev-v">${cap1(Q("ev" + r.risk))}</div>
    <div class="ev-adv">${r.adv}</div><div class="ev-f">${f.join(" · ")} · ${Q("evSrc")}</div></div></div>`;
}
function viewHome2(el) {
  viewHome(el);
  const sl = $(".hero .src-line", el);
  const left = air.retryAt ? Math.max(1, Math.round((air.retryAt - Date.now()) / 1000)) : 30;
  if (sl) { if (air.status === "offline") sl.insertAdjacentHTML("beforebegin", `<div class="off-note">${air.errKind === "service" ? Q("svcNote", { t: fmtAt(air.offlineAt), s: left }) : Q("offNote", { t: fmtAt(air.offlineAt) })}</div>`); sl.insertAdjacentHTML("afterend", shareRowHTML()); }
  const h = $(".hero", el); if (h) h.insertAdjacentHTML("afterend", eveningCardHTML(air.byDistrict[state.district]) + (typeof sourcesCardHTML === "function" ? sourcesCardHTML(byId(state.district)) : "") + `<a class="card hist-link" href="#history">${Q("histHome")}</a>`);
  bindShare(el);
}

/* ---------- 4. Меню «Ещё» — сетка ---------- */
function viewMore2(el) {
  const mt = k => (typeof MT === "function" ? MT(k) : "Maarif");
  const ico = k => (typeof navIco === "function" ? navIco(k) : "");
  const items = [
    ["#house", "house", t("tab_house"), Q("mHouse")],
    ["#routes", "routes", t("m_routes"), t("m_routesSub")], ["#complaints", "complaints", t("m_complaints"), t("m_complaintsSub")],
    ["#weather", "weather", Q("mWeather"), Q("mWeatherSub")], ["#history", "history", Q("hist"), Q("histSub")], ["#schools", "schools", mt("title"), mt("moreSub")],
    ["#profile", "profile", t("m_profile"), t("m_profileSub")], ["#profile/alertsCard", "alerts", t("m_alerts"), t("m_alertsSub")],
  ];
  el.innerHTML = `<h1>${t("moreTitle")}</h1><p class="sub">${t("moreSub")}</p>
    <div class="more-grid">${items.map(([h, k, a, b]) => `<a href="${h}" class="card more-tile"><span class="mt-e">${ico(k)}</span><b>${esc(a)}</b><small>${esc(b)}</small></a>`).join("")}</div>
    <div class="foot">${t("footProto")}</div>`;
}

/* ---------- 5. Честные жалобы ---------- */
const CONTACTS = {
  kg: [{ n: "mnr", tel: "108", src: "https://mnr.gov.kg/ru/page/kruglosutocnaya-goryacaya-liniya" }],
  bishkek: [{ n: "mnrB", tel: "0554 434 202", src: "https://mnr.gov.kg/ru/page/kruglosutocnaya-goryacaya-liniya" },
    { n: "mi", tel: "0312 67-12-14", wa: "996999671214", waT: "0999 67 12 14", mail: "", mailShown: "kontrol@@bishkek.gov.kg", src: "https://www.bishkek.gov.kg/ru/structures/division/15" }],
};
const cityContacts = () => [...(CONTACTS[CITY] || []), ...(cityObj().country === "kg" ? CONTACTS.kg : [])];
const mailTo = () => (cityContacts().find(c => c.mail) || {}).mail || "";
const waTo = () => (cityContacts().find(c => c.wa) || {}).wa || "";
function complaintText(c) {
  const d = nearestDistrict(c.lat, c.lon), a = air.byDistrict[d.id];
  const when = c.ts ? new Date(c.ts).toLocaleString(LANG === "en" ? "en-GB" : "ru-RU") : c.date;
  const osm = `https://www.openstreetmap.org/?mlat=${c.lat.toFixed(5)}&mlon=${c.lon.toFixed(5)}#map=17/${c.lat.toFixed(5)}/${c.lon.toFixed(5)}`;
  return [Q("cmpHead"), `${Q("cmpType")}: ${t("cat_c_" + c.cat)}`, `${Q("cmpDesc")}: ${c.text || "—"}`, `${Q("cmpPlace")}: ${dName(d)}, ${tr(cityObj().name)}`,
    `${Q("cmpCoords")}: ${c.lat.toFixed(5)}, ${c.lon.toFixed(5)} — ${osm}`, `${Q("cmpTime")}: ${when}`,
    a && a.aqi != null ? `${Q("cmpAqi")}: US AQI ${a.aqi}${air.status === "offline" ? Q("shareOff", { t: fmtAt(air.offlineAt) }) : ""} (${a.src === "station" ? (a.stEmb ? ST("emb") + " / " : "") + SRC_NAME[a.stKind] : "Open-Meteo" + (a.src === "sensors" ? " / Sensor.Community" : "")})` : "",
    hasPhoto(c) ? Q("cmpPhoto") : ""].filter(Boolean).join("\n");
}
function sendLinks(c) {
  const e = encodeURIComponent, txt = complaintText(c), d = nearestDistrict(c.lat, c.lon), subj = Q("cmpSubj", { c: t("cat_c_" + c.cat), d: dName(d) });
  return `<div class="send-row" data-cid="${c.id}">
    <a class="sh-a" data-via="Telegram" href="https://t.me/share/url?url=${e(SITE_URL)}&text=${e(txt)}" target="_blank" rel="noopener">✈️ Telegram</a>
    <a class="sh-a" data-via="Email" href="mailto:${mailTo()}?subject=${e(subj)}&body=${e(txt)}">✉️ Email</a>
    <a class="sh-a" data-via="WhatsApp" href="https://wa.me/${waTo()}?text=${e(txt)}" target="_blank" rel="noopener">💬 WhatsApp</a>
    <button type="button" class="sh-a" data-copy="${c.id}">📋 ${Q("cmpCopy")}</button>
    ${!c.status ? `<button type="button" class="sh-a ghost" data-mark="${c.id}">✓ ${Q("cmpMark")}</button>` : ""}</div>
    ${!c.status ? `<div class="small sent-hint"${c.lastVia ? "" : " hidden"}>💡 ${Q("sentHint")}${c.lastVia ? ` <span class="muted">(${Q("lastVia", { v: c.lastVia })})</span>` : ""}</div>` : ""}
    ${hasPhoto(c) ? `<div class="small muted ph-note">${Q("cmpPhotoNote")}</div>` : ""}`;
}
function contactsHTML() {
  const cs = cityContacts();
  return `<div class="card contacts"><b>☎️ ${Q("cmpTo")}</b>${cs.length ? `<ul>${cs.map(c => `<li><b>${Q(c.n)}</b>: ${c.tel ? `<a href="tel:${c.tel.replace(/[^\d+]/g, "")}">${c.tel}</a>` : ""}${c.waT ? ` · WhatsApp ${c.waT}` : ""}${c.mail ? ` · <a href="mailto:${c.mail}">${c.mail}</a>` : ""}${c.mailShown ? `<div class="small muted">✉️ ${esc(Q("mailTypo", { m: c.mailShown }))}</div>` : ""}
    <span class="small muted"> (${Q("cmpSrc")}: <a href="${c.src}" target="_blank" rel="noopener">${new URL(c.src).host}</a>)</span></li>`).join("")}</ul>` : ""}
    ${!(CONTACTS[CITY]) ? `<div class="small muted" style="font-weight:600;margin-top:4px">${Q("cmpNoTo")}</div>` : ""}</div>`;
}
let lastMade = null;
function viewComplaints2(el) {
  const cats = ["chimney", "trash", "dump", "car", "factory"];
  const stDemo = [t("cStatusSent"), t("cStatusFwd"), t("cStatusDone")];
  el.innerHTML = `
    <h1>📸 ${t("cTitle")}</h1><p class="sub">${t("cSub")}</p>
    <div class="card">
      <label class="photo-drop" for="cFile">${draft.photo ? `<img src="${draft.photo}" alt="">` : ""}<span>${draft.photo ? t("cPhotoChange") : t("cPhoto")}</span></label>
      <input type="file" id="cFile" accept="image/*" capture="environment" hidden>
      <label>${t("cCategory")}</label>
      <div class="cat-chips">${cats.map(c => `<button class="${draft.cat === c ? "on" : ""}" data-cat="${c}">${C_EMOJI[c]} ${t("cat_c_" + c)}</button>`).join("")}</div>
      <label for="cText">${t("cDesc")}</label><input id="cText" value="${esc(draft.text)}" placeholder="${t("cDescPh")}">
      <label>${t("cPlace")}</label><div id="cMap" class="mini-map"></div>
      <button class="btn ghost block" id="cGeo" style="margin-top:8px">${t("cGeo")}</button>
      <button class="btn block" id="cSend" style="margin-top:10px">📝 ${Q("cmpMake")}</button>
    </div>
    ${contactsHTML()}
    <h2>${t("cList")}</h2>
    ${allComplaints().length ? "" : `<div class="card muted c-empty" style="text-align:center;font-weight:700">${Q("cmpEmpty")}</div>`}
    ${allComplaints().map(c => `<div class="card c-item ${c.id === lastMade ? "just" : ""}" id="c-${c.id}">
      <div class="c-thumb">${hasPhoto(c) ? phImg(c, 'alt=""') : (C_EMOJI[c.cat] || "⚠️")}</div>
      <div style="flex:1;min-width:0"><b>${t("cat_c_" + c.cat)}</b> <span class="chip">${t("cMine")}</span>
        <div class="small" style="font-weight:600;margin:2px 0">${esc(tr(c.text)) || "—"}</div>
        ${c.mine ? `<div class="steps"><span class="on">${Q("cmpDraft")}</span><span class="${c.status ? "on" : ""}">${Q("cmpSentYou")}${c.status && c.via ? " " + Q("cmpVia", { v: c.via, t: hhmm(c.sentAt) }) : ""}</span></div>${sendLinks(c)}`
          : `<div class="steps">${stDemo.map((s, i) => `<span class="${i <= (c.status || 0) ? "on" : ""}">${s}</span>`).join("")}</div>`}
        <div class="small muted" style="font-weight:700;margin-top:4px">📍 ${esc(dName(nearestDistrict(c.lat, c.lon)))} · ${esc(fmtDay(c.date))}${c.mine ? ` · <a href="#" data-del="${c.id}" style="color:#c9303a">${t("cDelete")}</a>` : ""}</div>
      </div></div>`).join("")}
    <div class="foot">${Q("cmpFoot")}</div>`;
  map = mkMap("cMap", { zoomControl: false }).setView(cityObj().center, cityObj().zoom || 13);
  baseTiles(map);
  let pinM = null;
  const setPin = (lat, lon, fly) => {
    draft.lat = lat; draft.lon = lon;
    if (pinM) pinM.setLatLng([lat, lon]); else pinM = L.marker([lat, lon], { icon: complaintIcon({ cat: draft.cat }) }).addTo(map);
    if (fly) map.setView([lat, lon], 15);
  };
  if (draft.lat != null) setPin(draft.lat, draft.lon);
  map.on("click", e => setPin(e.latlng.lat, e.latlng.lng));
  setTimeout(() => map && map.invalidateSize(), 50);
  const rerender = () => { const y = scrollY; viewComplaints2(el); scrollTo(0, y); };
  $("#cFile").onchange = async e => { const f = e.target.files[0]; if (!f) return; try { draft.photo = await resizeImage(f); } catch (err) { console.warn(err); } draft.text = $("#cText").value; viewComplaints2(el); };
  el.querySelectorAll("[data-cat]").forEach(b => b.onclick = () => { draft.cat = b.dataset.cat; draft.text = $("#cText").value; rerender(); });
  $("#cGeo").onclick = () => {
    if (!navigator.geolocation) return toast(t("cGeoErr"));
    navigator.geolocation.getCurrentPosition(p => setPin(p.coords.latitude, p.coords.longitude, true), () => toast(t("cGeoErr")), { timeout: 8000 });
  };
  $("#cSend").onclick = async () => {
    if (draft.lat == null) return toast(t("cNoPoint"));
    const now = new Date(), txt = $("#cText").value.trim();
    let photoId = null; if (draft.photo) { try { photoId = await phPut(draft.photo); } catch (e) { console.warn("photo → IndexedDB:", e && e.message); } }
    const c = { id: "u" + now.getTime(), city: CITY, mine: true, lat: draft.lat, lon: draft.lon, cat: draft.cat, text: txt, status: 0, ts: now.getTime(), date: now.toISOString().slice(0, 10) };
    if (photoId) c.photoId = photoId; else if (draft.photo) c.photo = draft.photo;
    state.complaints.unshift(c); const ok = save(); lastMade = c.id;
    draft = { cat: "chimney", photo: null, lat: null, lon: null, text: "" };
    toast(ok ? Q("cmpMade") : Q("cmpQuota")); if (!ok) saveWarnAt = Date.now(); viewComplaints2(el);
    const it = document.getElementById("c-" + c.id); if (it) it.scrollIntoView({ block: "center" });
  };
  const mark = (id, via) => { const s = state.complaints.find(x => x.id === id); if (!s) return; s.status = 1; s.via = via; s.sentAt = Date.now(); save(); setTimeout(() => { if (location.hash === "#complaints") rerender(); }, 300); };
  /* открыть канал ≠ отправить: только запоминаем канал и показываем подсказку */
  el.querySelectorAll("[data-via]").forEach(a => a.addEventListener("click", () => { const row = a.closest(".send-row"), s = state.complaints.find(x => x.id === row.dataset.cid); if (!s || s.status) return;
    s.lastVia = a.dataset.via; save(); const h = row.nextElementSibling && row.nextElementSibling.classList.contains("sent-hint") ? row.nextElementSibling : row.parentElement.querySelector(".sent-hint");
    if (h) { h.hidden = false; h.innerHTML = `💡 ${Q("sentHint")} <span class="muted">(${Q("lastVia", { v: s.lastVia })})</span>`; } }));
  el.querySelectorAll("[data-copy]").forEach(b => b.onclick = () => { const c = state.complaints.find(x => x.id === b.dataset.copy); if (c) copyText(complaintText(c)); });
  el.querySelectorAll("[data-mark]").forEach(b => b.onclick = () => { const s = state.complaints.find(x => x.id === b.dataset.mark); mark(b.dataset.mark, (s && s.lastVia) || ""); });
  el.querySelectorAll("[data-del]").forEach(a => a.onclick = e => { e.preventDefault(); { const g = state.complaints.find(x => x.id === a.dataset.del); if (g) phDel(g.photoId); } state.complaints = state.complaints.filter(x => x.id !== a.dataset.del); save(); viewComplaints2(el); });
}
