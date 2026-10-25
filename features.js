/* Таза Аба — три слоя «Ещё»: A) Чистый воздух внутри, B) Транспорт и смог, C) Где посадить деревья.
 * Честность: A — проверенный список пуст, пока владелец не заполнит data/clean-places.json; предложения пользователей
 * хранятся локально и помечены «не проверено». B — вклад транспорта/отопления только ОЦЕНКА по прозрачной эвристике.
 * C — «кандидаты», а не разрешённые места: нужна согласование с мэрией. Данные OSM — Overpass API (без ключа), кэш 7 дней. */
"use strict";
const FT_T = {
  ru: {
    ca: "Чистый воздух внутри", caSub: "Кафе, коворкинги и ТЦ с очистителями воздуха, где можно переждать смог",
    tf: "Транспорт и смог", tfSub: "Главные дороги, NO₂ по районам и оценка вклада транспорта",
    trSub: "Кандидаты для посадки: много смога, мало зелени, рядом дороги и школы",
    lCa: "Чистый воздух внутри", lTf: "Транспорт · NO₂", lTr: "Посадка деревьев", lTt: "🚦 Пробки (TomTom)",
    verified: "проверено", unverified: "не проверено", caEmptyH: "Проверенных мест пока нет",
    caEmpty: "Мы не выдумываем места. Знаете кафе, коворкинг или ТЦ, где работает очиститель воздуха (лучше HEPA H13/H14)? Предложите его — оно появится у вас на карте с пометкой «не проверено», а отправленное в проект после проверки попадёт в общий список.",
    suggest: "➕ Предложить место", myPlaces: "Мои предложения (на этом устройстве)", vList: "Проверенные места",
    fName: "Название", fType: "Тип", fAddr: "Адрес или ориентир", fPoint: "Точка на карте — нажмите на карту", fPur: "Какой очиститель", fMeas: "Своё измерение PM2.5 внутри, µg/m³ (необязательно)", fDev: "Прибор (необязательно)", fNote: "Комментарий",
    tCafe: "Кафе", tCowork: "Коворкинг", tMall: "Торговый центр", tLib: "Библиотека", tOther: "Другое",
    pH13: "HEPA H13/H14", pHepa: "HEPA (класс неизвестен)", pOther: "Другой фильтр", pUnk: "Не знаю, какой",
    save: "Сохранить", cancel: "Отмена", del: "Удалить", needName: "Укажите название и точку на карте", saved: "Сохранено на этом устройстве",
    send: "Отправить в проект:", copy: "Копировать", copied: "Скопировано",
    advCa: "AQI выше 150. Ближайшее проверенное место с очисткой воздуха: {n} ({k} км).",
    plTxt: "Предлагаю место для «Таза Аба — чистый воздух внутри»",
    roadsLoad: "Загружаем главные дороги из OpenStreetMap…", roadsErr: "Не удалось загрузить дороги OSM — попробуйте позже.",
    roadsSrc: "Дороги: © OpenStreetMap (магистрали, первичные и вторичные улицы). Цвет — NO₂ модели CAMS в ближайшем районе.",
    no2: "NO₂ (модель)", estH: "Вклад транспорта и отопления — оценка", estNote: "Это оценка по эвристике, а не измерение.", how: "Как считаем?",
    trans: "Транспорт", heat: "Отопление и прочее", inputs: "Входные данные (CAMS, последние 3 суток, район «{d}»):",
    rush: "NO₂ в часы пик / ночью", ratioNP: "NO₂ / PM2.5", ratioPP: "PM2.5 / PM10", cold: "Средняя температура",
    loadingH: "Загружаем почасовые данные…", noData: "Нет данных",
    howH: "Как считаем вклад транспорта",
    howTxt: "<p>NO₂ — главный «след» выхлопа. Мы берём почасовые значения модели CAMS (Open-Meteo) для района за 3 суток и считаем три признака:</p><ol><li><b>Часы пик</b>: средний NO₂ в 7–10 и 17–20 ч, делённый на ночной (1–5 ч). Чем выше — тем больше вклад машин. T₁ = (R−1)/1,5, в пределах 0…1.</li><li><b>NO₂/PM2.5</b>: у выхлопа отношение выше, у угольного дыма — ниже. T₂ = (x−0,3)/0,9.</li><li><b>PM2.5/PM10</b>: дым от сжигания — мелкие частицы (доля > 0,7), дорожная пыль — крупнее. T₃ = (0,8−y)/0,4.</li></ol><p>Транспорт = 0,45·T₁ + 0,35·T₂ + 0,20·T₃; отопление = 0,5·(1−T₂) + 0,3·(1−T₃) + 0,2·холод (температура ниже +10 °C). Доли — отношение этих баллов. Это грубая оценка для сравнения районов, не замена исследованию.</p>",
    studies: "Опубликованные исследования по Бишкеку",
    st1: "Модель WRF–CAMx (журнал Air, 2024): за год PM2.5 — бытовое отопление и приготовление пищи 29 %, транспорт 27 %, ТЭЦ 11 %, пыль 9 %, трансграничный перенос 21 %; зимой бытовое отопление до ~40 %, летом транспорт до ~30 %.",
    st2: "Всемирный банк (2024): «Air Quality Analysis for Bishkek — PM2.5 Source Apportionment and Emission Reduction Measures».",
    st3: "ПРООН (Key Messages, 2023): автотранспорт — крупнейший источник NOx; вклад ТЭЦ в приземный PM — менее 1 %.",
    cand: "кандидат — нужно согласование с мэрией", candN: "{n} кандидатов", whyH: "Почему здесь:", wAqi: "AQI района {a}", wGreen: "до ближайшей зелени ~{m} м", wRoad: "рядом дорога: {r}", wSchool: "рядом: {s}",
    trLoad: "Загружаем парки, школы и дороги из OpenStreetMap…", trNone: "Подходящих кандидатов не нашлось — или зелени достаточно, или нет данных OSM.",
    trSrc: "Данные: © OpenStreetMap (парки, скверы, леса, газоны, школы, детсады, больницы, главные дороги) + AQI модели CAMS. Кандидат = зелени нет ближе ~400 м, рядом главная дорога или школа/детсад/больница, AQI района выше медианы города.",
    spH: "Какие деревья сажать", spBk: "Для Бишкека МП «Бишкекзеленстрой» и Ботанический сад им. Э. Гареева НАН КР рекомендуют лиственные: вяз, гледичия, дуб, клён, липа, тополь; для замены старых тополей Ботсад предлагал сосну крымскую и клён остролистный. Подробный ассортимент — в рекомендациях Ботсада (2017).",
    spGen: "Для вашего города у нас нет проверенного списка пород. Общие советы: выбирайте местные засухо- и морозоустойчивые лиственные деревья с широкой кроной, саженцы из местного питомника, и обязательно спросите местный лесхоз или мэрию.",
    seasH: "Когда сажать", seas: "Весна — основной сезон посадки (в Бишкеке «Зеленстрой» открывает его с началом весны). Осенняя посадка (после листопада, до заморозков) — общая практика, уточните у специалистов.",
    permH: "Как получить разрешение", permBk: "Сажать на городской земле можно только по согласованию. «Бишкекзеленстрой» советует горожанам обращаться к ним за информацией; уточните в мэрии Бишкека.", permGen: "Уточните в мэрии или айыл окмоту.", permTr: "Belediyeye danışın (уточните в муниципалитете).",
    noSnap: "Для этого города ещё нет готового снимка OpenStreetMap.", loadLive: "Загрузить из OpenStreetMap сейчас", roadsN: "Дорог на карте: {n}",
    planted: "🌱 Я посадил дерево", plantedN: "Вы посадили: {n}", plantShare: "Я посадил(а) уже {n} дерев. Присоединяйтесь — «Таза Аба»", srcLbl: "Источник",
  },
  ky: {
    ca: "Ичинде таза аба", caSub: "Аба тазалагычы бар кафе, коворкинг жана соода борборлору — смогду күтүп турууга",
    tf: "Транспорт жана смог", tfSub: "Негизги жолдор, райондогу NO₂ жана транспорттун үлүшүн баалоо",
    trSub: "Отургузууга талапкерлер: смог көп, жашыл аз, жанында жол жана мектеп",
    lCa: "Ичинде таза аба", lTf: "Транспорт · NO₂", lTr: "Дарак отургузуу", lTt: "🚦 Тыгын (TomTom)",
    verified: "текшерилген", unverified: "текшерилген эмес", caEmptyH: "Азырынча текшерилген жер жок",
    caEmpty: "Биз жерлерди ойлоп чыгарбайбыз. Аба тазалагычы (жакшысы HEPA H13/H14) иштеген кафе, коворкинг же соода борборун билесизби? Сунуштаңыз — ал картаңызда «текшерилген эмес» белгиси менен чыгат, ал эми долбоорго жөнөтүлгөнү текшерүүдөн кийин жалпы тизмеге кошулат.",
    suggest: "➕ Жер сунуштоо", myPlaces: "Менин сунуштарым (ушул түзмөктө)", vList: "Текшерилген жерлер",
    fName: "Аталышы", fType: "Түрү", fAddr: "Дареги же белгиси", fPoint: "Картадагы чекит — картаны басыңыз", fPur: "Кандай тазалагыч", fMeas: "Ичиндеги PM2.5 өз өлчөөңүз, µg/m³ (милдеттүү эмес)", fDev: "Прибор (милдеттүү эмес)", fNote: "Комментарий",
    tCafe: "Кафе", tCowork: "Коворкинг", tMall: "Соода борбору", tLib: "Китепкана", tOther: "Башка",
    pH13: "HEPA H13/H14", pHepa: "HEPA (классы белгисиз)", pOther: "Башка чыпка", pUnk: "Билбейм",
    save: "Сактоо", cancel: "Жокко чыгаруу", del: "Өчүрүү", needName: "Аталышын жана картадагы чекитти көрсөтүңүз", saved: "Ушул түзмөктө сакталды",
    send: "Долбоорго жөнөтүү:", copy: "Көчүрүү", copied: "Көчүрүлдү",
    advCa: "AQI 150дөн жогору. Аба тазалагычы бар эң жакын текшерилген жер: {n} ({k} км).",
    plTxt: "«Таза Аба — ичинде таза аба» үчүн жер сунуштайм",
    roadsLoad: "OpenStreetMap'тан негизги жолдорду жүктөп жатабыз…", roadsErr: "OSM жолдорун жүктөй алган жокпуз — кийинчерээк аракет кылыңыз.",
    roadsSrc: "Жолдор: © OpenStreetMap (магистралдар, биринчи жана экинчи даражадагы көчөлөр). Түсү — эң жакын райондогу CAMS моделинин NO₂.",
    no2: "NO₂ (модель)", estH: "Транспорт жана жылытуунун үлүшү — баалоо", estNote: "Бул эвристика боюнча баалоо, өлчөө эмес.", how: "Кантип эсептейбиз?",
    trans: "Транспорт", heat: "Жылытуу жана башкалар", inputs: "Киргизилген маалымат (CAMS, акыркы 3 сутка, «{d}» району):",
    rush: "Чокулук саатта / түнкү NO₂", ratioNP: "NO₂ / PM2.5", ratioPP: "PM2.5 / PM10", cold: "Орточо температура",
    loadingH: "Сааттык маалымат жүктөлүүдө…", noData: "Маалымат жок",
    howH: "Транспорттун үлүшүн кантип эсептейбиз",
    howTxt: "<p>NO₂ — түтүндүн негизги «изи». Биз райондун 3 суткадагы CAMS (Open-Meteo) сааттык маанилерин алып, үч белгини эсептейбиз:</p><ol><li><b>Чокулук саат</b>: 7–10 жана 17–20 сааттагы орточо NO₂ түнкүгө (1–5) бөлүнөт. T₁ = (R−1)/1,5, 0…1 чегинде.</li><li><b>NO₂/PM2.5</b>: түтүндө бул катыш жогору, көмүр түтүнүндө төмөн. T₂ = (x−0,3)/0,9.</li><li><b>PM2.5/PM10</b>: күйүүдөн чыккан түтүн — майда бөлүкчөлөр (үлүшү > 0,7), жол чаңы — ирирээк. T₃ = (0,8−y)/0,4.</li></ol><p>Транспорт = 0,45·T₁ + 0,35·T₂ + 0,20·T₃; жылытуу = 0,5·(1−T₂) + 0,3·(1−T₃) + 0,2·суук (+10 °C төмөн). Үлүштөр — ушул упайлардын катышы. Бул райондорду салыштыруу үчүн одоно баалоо, изилдөөнүн ордун баспайт.</p>",
    studies: "Бишкек боюнча жарыяланган изилдөөлөр",
    st1: "WRF–CAMx модели (Air журналы, 2024): жылына PM2.5 — үй жылытуу жана тамак бышыруу 29 %, транспорт 27 %, ЖЭБ 11 %, чаң 9 %, чек арадан тышкаркы 21 %; кышында үй жылытуу ~40 %га чейин, жайында транспорт ~30 %га чейин.",
    st2: "Дүйнөлүк банк (2024): «Air Quality Analysis for Bishkek — PM2.5 Source Apportionment and Emission Reduction Measures».",
    st3: "БУУӨП (Key Messages, 2023): автотранспорт — NOxтун эң ири булагы; ЖЭБдин жер бетиндеги PMге үлүшү — 1 %дан аз.",
    cand: "талапкер — мэрия менен макулдашуу керек", candN: "{n} талапкер", whyH: "Эмне үчүн бул жерде:", wAqi: "райондун AQI {a}", wGreen: "эң жакын жашылга чейин ~{m} м", wRoad: "жанында жол: {r}", wSchool: "жанында: {s}",
    trLoad: "OpenStreetMap'тан парктарды, мектептерди жана жолдорду жүктөп жатабыз…", trNone: "Ылайыктуу талапкер табылган жок — же жашыл жетиштүү, же OSM маалыматы жок.",
    trSrc: "Маалымат: © OpenStreetMap (парктар, скверлер, токойлор, газондор, мектептер, бала бакчалар, ооруканалар, негизги жолдор) + CAMS моделинин AQI. Талапкер = ~400 м жакын жашыл жок, жанында негизги жол же мектеп/бала бакча/оорукана, райондун AQI шаардын медианасынан жогору.",
    spH: "Кандай дарак отургузуу керек", spBk: "Бишкек үчүн «Бишкекзеленстрой» МИ жана КР УИАнын Э. Гареев атындагы Ботаникалык багы жалбырактуу дарактарды сунуштайт: кара жыгач, гледичия, эмен, клён, жөкө, терек; эски теректерди алмаштырууга Ботбак кырым карагайын жана учтуу жалбырактуу клёнду сунуштаган. Толук тизме — Ботбактын сунуштарында (2017).",
    spGen: "Шаарыңыз үчүн текшерилген тизмебиз жок. Жалпы кеңеш: жергиликтүү, кургакчылыкка жана суукка чыдамдуу, кең таажылуу жалбырактуу дарактарды, жергиликтүү питомниктин көчөттөрүн тандаңыз жана сөзсүз жергиликтүү токой чарбасынан же мэриядан сураңыз.",
    seasH: "Качан отургузуу керек", seas: "Жаз — отургузуунун негизги мезгили (Бишкекте «Зеленстрой» аны жаздын башталышы менен ачат). Күзүндө отургузуу (жалбырак түшкөндөн кийин, үшүккө чейин) — жалпы практика, адистерден тактаңыз.",
    permH: "Уруксатты кантип алуу керек", permBk: "Шаардын жерине макулдашуу менен гана отургузууга болот. «Бишкекзеленстрой» шаардыктарга маалымат үчүн аларга кайрылууну сунуштайт; Бишкек мэриясынан тактаңыз.", permGen: "Мэриядан же айыл өкмөтүнөн тактаңыз.", permTr: "Belediyeye danışın (муниципалитеттен тактаңыз).",
    noSnap: "Бул шаар үчүн OpenStreetMap даяр көчүрмөсү азырынча жок.", loadLive: "OpenStreetMap'тан азыр жүктөө", roadsN: "Картадагы жолдор: {n}",
    planted: "🌱 Мен дарак отургуздум", plantedN: "Сиз отургуздуңуз: {n}", plantShare: "Мен {n} дарак отургуздум. Кошулуңуз — «Таза Аба»", srcLbl: "Булак",
  },
  en: {
    ca: "Clean air indoors", caSub: "Cafés, coworkings and malls with air purifiers where you can wait out smog",
    tf: "Traffic and smog", tfSub: "Major roads, NO₂ by district and an estimate of traffic's share",
    trSub: "Planting candidates: lots of smog, little greenery, near roads and schools",
    lCa: "Clean air indoors", lTf: "Traffic · NO₂", lTr: "Tree planting", lTt: "🚦 Traffic jams (TomTom)",
    verified: "verified", unverified: "not verified", caEmptyH: "No verified places yet",
    caEmpty: "We don't make places up. Know a café, coworking or mall with a working air purifier (ideally HEPA H13/H14)? Suggest it — it appears on your map marked “not verified”, and once sent to the project and checked it can join the shared list.",
    suggest: "➕ Suggest a place", myPlaces: "My suggestions (on this device)", vList: "Verified places",
    fName: "Name", fType: "Type", fAddr: "Address or landmark", fPoint: "Point on the map — tap the map", fPur: "Purifier type", fMeas: "Your own indoor PM2.5 reading, µg/m³ (optional)", fDev: "Device (optional)", fNote: "Comment",
    tCafe: "Café", tCowork: "Coworking", tMall: "Shopping mall", tLib: "Library", tOther: "Other",
    pH13: "HEPA H13/H14", pHepa: "HEPA (class unknown)", pOther: "Other filter", pUnk: "Don't know",
    save: "Save", cancel: "Cancel", del: "Delete", needName: "Enter a name and pick a point on the map", saved: "Saved on this device",
    send: "Send to the project:", copy: "Copy", copied: "Copied",
    advCa: "AQI is above 150. Nearest verified place with air purification: {n} ({k} km).",
    plTxt: "Suggesting a place for “Taza Aba — clean air indoors”",
    roadsLoad: "Loading major roads from OpenStreetMap…", roadsErr: "Couldn't load OSM roads — please try later.",
    roadsSrc: "Roads: © OpenStreetMap (motorways, trunk, primary and secondary). Colour — CAMS model NO₂ in the nearest district.",
    no2: "NO₂ (model)", estH: "Traffic vs heating share — estimate", estNote: "This is a heuristic estimate, not a measurement.", how: "How is it calculated?",
    trans: "Traffic", heat: "Heating and other", inputs: "Inputs (CAMS, last 3 days, district “{d}”):",
    rush: "NO₂ rush hours / night", ratioNP: "NO₂ / PM2.5", ratioPP: "PM2.5 / PM10", cold: "Mean temperature",
    loadingH: "Loading hourly data…", noData: "No data",
    howH: "How we estimate traffic's share",
    howTxt: "<p>NO₂ is the main marker of exhaust. We take 3 days of hourly CAMS model values (Open-Meteo) for the district and compute three signals:</p><ol><li><b>Rush hours</b>: mean NO₂ at 7–10 and 17–20 h divided by night (1–5 h). Higher means more traffic. T₁ = (R−1)/1.5, clamped to 0…1.</li><li><b>NO₂/PM2.5</b>: higher for exhaust, lower for coal smoke. T₂ = (x−0.3)/0.9.</li><li><b>PM2.5/PM10</b>: combustion smoke is fine (share > 0.7), road dust is coarser. T₃ = (0.8−y)/0.4.</li></ol><p>Traffic = 0.45·T₁ + 0.35·T₂ + 0.20·T₃; heating = 0.5·(1−T₂) + 0.3·(1−T₃) + 0.2·cold (below +10 °C). Shares are the ratio of these scores. A rough estimate for comparing districts, not a substitute for a study.</p>",
    studies: "Published studies for Bishkek",
    st1: "WRF–CAMx model (Air journal, 2024): annual PM2.5 — residential heating and cooking 29%, transport 27%, CHP 11%, dust 9%, transboundary 21%; in winter residential heating up to ~40%, in summer transport up to ~30%.",
    st2: "World Bank (2024): “Air Quality Analysis for Bishkek — PM2.5 Source Apportionment and Emission Reduction Measures”.",
    st3: "UNDP (Key Messages, 2023): road transport is the largest NOx source; the CHP plant contributes under 1% of ground-level PM.",
    cand: "candidate — needs approval from the city hall", candN: "{n} candidates", whyH: "Why here:", wAqi: "district AQI {a}", wGreen: "~{m} m to the nearest greenery", wRoad: "road nearby: {r}", wSchool: "nearby: {s}",
    trLoad: "Loading parks, schools and roads from OpenStreetMap…", trNone: "No suitable candidates found — either there's enough greenery or no OSM data.",
    trSrc: "Data: © OpenStreetMap (parks, squares, forests, lawns, schools, kindergartens, hospitals, major roads) + CAMS model AQI. Candidate = no greenery within ~400 m, a major road or school/kindergarten/hospital nearby, district AQI above the city median.",
    spH: "Which trees to plant", spBk: "For Bishkek, MP Bishkekzelenstroy and the E. Gareev Botanical Garden (National Academy of Sciences) recommend deciduous trees: elm, honey locust, oak, maple, linden, poplar; to replace old poplars the Botanical Garden proposed Crimean pine and Norway maple. Full list — in the Botanical Garden's recommendations (2017).",
    spGen: "We have no verified species list for your city. General advice: choose local drought- and frost-hardy deciduous trees with wide crowns, saplings from a local nursery, and ask the local forestry office or city hall.",
    seasH: "When to plant", seas: "Spring is the main planting season (in Bishkek Zelenstroy opens it at the start of spring). Autumn planting (after leaf fall, before frost) is general practice — check with specialists.",
    permH: "How to get permission", permBk: "Planting on city land requires approval. Bishkekzelenstroy advises residents to contact them for information; check with Bishkek city hall.", permGen: "Check with the city hall or aiyl okmotu.", permTr: "Belediyeye danışın (check with the municipality).",
    noSnap: "There is no prepared OpenStreetMap snapshot for this city yet.", loadLive: "Load from OpenStreetMap now", roadsN: "Roads on the map: {n}",
    planted: "🌱 I planted a tree", plantedN: "You've planted: {n}", plantShare: "I've planted {n} tree(s). Join in — Taza Aba", srcLbl: "Source",
  },
  
};
const FT = (k, v = {}) => String((FT_T[LANG] || FT_T.ru)[k] ?? FT_T.ru[k] ?? k).replace(/\{(\w+)\}/g, (m, x) => v[x] ?? m);
const FCFG = () => window.TAZA_CONFIG || {};
const SRC_LINKS = {
  air2024: "https://doi.org/10.3390/air2040021", wb2024: "https://doi.org/10.1596/41995", undp2023: "https://www.undp.org/sites/g/files/zskgke326/files/2023-01/KEY%20MESSAGES_ENG_2.pdf",
  zelen: "https://topnews.kg/jekologija/3623-bishkekzelenstroj-rekomenduet-gorozhanam-opredelennye-vidy-derevev-dlja-posadki.html",
  botsad: "https://botanica.kg/lib/ru/view/37/", vesti: "https://vesti.kg/obshchestvo/item/132293-u-topolej-srok-godnosti-40-45-let-meriya-o-vyrubke-derevev-na-ajtmatova.html",
};
const ftLink = (u, txt) => `<a href="${u}" target="_blank" rel="noopener">${esc(txt || FT("srcLbl"))}</a>`;
function ftCityBox(pad = 0.012) { const ds = (cityObj().districts || DISTRICTS); let s = 90, n = -90, w = 180, e = -180;
  ds.forEach(d => { s = Math.min(s, d.lat); n = Math.max(n, d.lat); w = Math.min(w, d.lon); e = Math.max(e, d.lon); });
  const c = cityObj().center; if (n - s < 0.03) { s = Math.min(s, c[0] - 0.02); n = Math.max(n, c[0] + 0.02); } if (e - w < 0.04) { w = Math.min(w, c[1] - 0.03); e = Math.max(e, c[1] + 0.03); }
  return [s - pad, w - pad, n + pad, e + pad].map(v => +v.toFixed(4)); }

/* ---------- OSM: Overpass с кэшем (localStorage, 7 дней) ---------- */
const OVP = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter"];
const ftMem = {};
async function ftOverpass(key, q) {
  const K = "tazaAba.osm." + key;
  if (ftMem[K]) return ftMem[K];
  try { const c = JSON.parse(localStorage.getItem(K) || "null"); if (c && Date.now() - c.at < 7 * 864e5) return (ftMem[K] = c.d); } catch (e) { }
  let lastErr;
  for (const u of OVP) {
    try { const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 45000);
      const r = await fetch(u, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "Content-Type": "application/x-www-form-urlencoded" }, signal: ctl.signal }); clearTimeout(tm);
      if (!r.ok) throw new Error("HTTP " + r.status); const j = await r.json(); ftMem[K] = j;
      try { localStorage.setItem(K, JSON.stringify({ at: Date.now(), d: j })); } catch (e) { /* квота — храним только в памяти */ }
      return j; } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("overpass");
}
/* снимок data/osm/{city}.json (готовится заранее, v2: дороги + зелень + школы), иначе живой Overpass */
const ftSnapP = {};
let ftIdx = null;   // data/osm/index.json — список городов, для которых есть снимок (без 404 на остальные)
const ftIndex = () => ftIdx || (ftIdx = fetch("data/osm/index.json").then(r => r.ok ? r.json() : { ids: [] }).catch(() => ({ ids: [] })));
const ftSnap = () => ftSnapP[CITY] || (ftSnapP[CITY] = ftIndex().then(ix => (ix.ids || []).includes(CITY) ? fetch(`data/osm/${CITY}.json`).then(r => r.ok ? r.json() : null) : null).catch(() => null));
/* живой Overpass — только по явному нажатию пользователя (серверы бывают перегружены) */
const ftLive = {};
const ftNoSnap = () => Object.assign(new Error("nosnap"), { nosnap: true });
const unflat = f => f.reduce((a, v, i) => (i % 2 ? a[a.length - 1].push(v) : a.push([v]), a), []);
async function ftRoads() {
  const j = await ftSnap();
  if (j && j.roads && j.roads.length) return j.roads.filter(x => /^(motorway|trunk|primary|secondary)/.test(x[0])).map(([k, n, f]) => ({ k, n, p: unflat(f) }));
  if (!ftLive[CITY]) throw ftNoSnap();
  const [s, w, n, e] = ftCityBox();
  const o = await ftOverpass(`roads.${CITY}`, `[out:json][timeout:60];way[highway~"^(motorway|trunk|primary|secondary)$"](${s},${w},${n},${e});out geom qt;`);
  return (o.elements || []).filter(x => x.geometry).map(x => ({ k: x.tags.highway, n: x.tags.name || x.tags["name:ru"] || "", p: ftSimplify(x.geometry.map(g => [+g.lat.toFixed(5), +g.lon.toFixed(5)])) }));
}
function ftSimplify(p) { if (p.length < 4) return p; const o = [p[0]]; for (let i = 1; i < p.length - 1; i++) { const a = o[o.length - 1]; if (Math.abs(p[i][0] - a[0]) + Math.abs(p[i][1] - a[1]) > 0.0004) o.push(p[i]); } o.push(p[p.length - 1]); return o; }
async function ftGreenPoi() {
  const sn = await ftSnap();
  if (sn && sn.v >= 2) return { G: sn.green || [], P: (sn.poi || []).map(([k, n, lat, lon]) => ({ k, n, lat, lon })) };
  if (!ftLive[CITY]) throw ftNoSnap();
  const [s, w, n, e] = ftCityBox();
  const j = await ftOverpass(`green.${CITY}`, `[out:json][timeout:60];(nwr[leisure~"^(park|garden|playground)$"](${s},${w},${n},${e});nwr[landuse~"^(forest|grass|recreation_ground|village_green|meadow|orchard)$"](${s},${w},${n},${e});nwr[natural=wood](${s},${w},${n},${e}););out center qt;(nwr[amenity~"^(school|kindergarten|hospital)$"](${s},${w},${n},${e}););out center tags qt;`);
  const G = [], P = [];
  (j.elements || []).forEach(x => { const c = x.center || (x.lat != null ? { lat: x.lat, lon: x.lon } : null); if (!c) return; const t = x.tags || {};
    if (t.amenity) P.push({ k: t.amenity, n: t["name:" + LANG] || t.name || "", lat: c.lat, lon: c.lon }); else G.push([c.lat, c.lon]); });
  return { G, P };
}
const no2Col = v => v == null ? "#9aa" : v < 10 ? "#2e9e5b" : v < 25 ? "#b5c900" : v < 40 ? "#f2b705" : v < 60 ? "#ff8a3d" : "#e5484d";

/* ---------- A) Чистый воздух внутри ---------- */
const CA_KEY = "tazaAba.cleanPlaces";
let caVerified = null;
async function caLoadVerified() { if (caVerified) return caVerified; try { const r = await fetch("data/clean-places.json", { cache: "no-cache" }); caVerified = r.ok ? ((await r.json()).places || []) : []; } catch (e) { caVerified = []; } return caVerified; }
const caMine = () => { try { return JSON.parse(localStorage.getItem(CA_KEY) || "[]"); } catch (e) { return []; } };
const caSaveMine = a => localStorage.setItem(CA_KEY, JSON.stringify(a));
const CA_TYPES = { cafe: ["tCafe", "☕"], coworking: ["tCowork", "💻"], mall: ["tMall", "🛍️"], library: ["tLib", "📚"], other: ["tOther", "🏠"] };
const CA_PUR = { h13: "pH13", hepa: "pHepa", other: "pOther", unk: "pUnk" };
const caIcon = (p, ver) => L.divIcon({ className: "", html: `<div class="ca-pin ${ver ? "ver" : "unv"}">${(CA_TYPES[p.type] || CA_TYPES.other)[1]}${ver ? '<b class="ca-badge" aria-hidden="true">✓</b>' : ""}</div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
function caPop(p, ver) {
  return `<b>${esc(p.name)}</b><br><span class="chip ${ver ? "ok" : "demo"}">${ver ? "✓ " + FT("verified") : FT("unverified")}</span><br>${esc(FT((CA_TYPES[p.type] || CA_TYPES.other)[0]))}${p.address ? " · " + esc(p.address) : ""}<br>${esc(p.purifier && CA_PUR[p.purifier] ? FT(CA_PUR[p.purifier]) : p.purifier || "—")}${p.measured || p.meas != null ? `<br>📏 ${esc(p.measured || ("PM2.5 " + p.meas + " µg/m³" + (p.dev ? " · " + p.dev : "")))}` : ""}${ver && p.source ? `<br><small>${esc(p.source)}${p.verified ? " · " + esc(p.verified) : ""}</small>` : ""}`;
}
function caText(p) {
  return [FT("plTxt"), `${FT("fName")}: ${p.name}`, `${FT("fType")}: ${FT((CA_TYPES[p.type] || CA_TYPES.other)[0])}`, `${FT("fAddr")}: ${p.address || "—"}`,
    `${FT("fPur")}: ${FT(CA_PUR[p.purifier] || "pUnk")}`, p.meas != null && p.meas !== "" ? `PM2.5: ${p.meas} µg/m³${p.dev ? " (" + p.dev + ")" : ""}` : "", p.note ? `${FT("fNote")}: ${p.note}` : "",
    `${tr(cityObj().name)} · ${p.lat.toFixed(5)}, ${p.lon.toFixed(5)} — https://www.openstreetmap.org/?mlat=${p.lat.toFixed(5)}&mlon=${p.lon.toFixed(5)}#map=18/${p.lat.toFixed(5)}/${p.lon.toFixed(5)}`].filter(Boolean).join("\n");
}
function caSendRow(p) {
  const e = encodeURIComponent, txt = caText(p), C = FCFG();
  const tg = C.PROJECT_TG ? `https://t.me/${e(C.PROJECT_TG.replace(/^@/, ""))}` : `https://t.me/share/url?url=${e(SITE_URL)}&text=${e(txt)}`;
  return `<div class="send-row"><span class="small muted">${FT("send")}</span>
    <a class="sh-a" href="${tg}" target="_blank" rel="noopener">✈️ Telegram</a>
    <a class="sh-a" href="mailto:${esc(C.PROJECT_EMAIL || "")}?subject=${e(FT("plTxt") + ": " + p.name)}&body=${e(txt)}">✉️ Email</a>
    <button type="button" class="sh-a" data-cacopy="${p.id}">📋 ${FT("copy")}</button>
    <button type="button" class="sh-a ghost" data-cadel="${p.id}">🗑️ ${FT("del")}</button></div>`;
}
function caOpenForm(onDone, pre = {}) {
  const m = $("#modal"); let pt = pre.lat != null ? [pre.lat, pre.lon] : null, fm = null, mk = null;
  m.innerHTML = `<div class="sheet ca-form" role="dialog" aria-modal="true" aria-labelledby="caFH"><h3 id="caFH">${FT("suggest")}</h3>
    <label for="caN">${FT("fName")}</label><input id="caN" maxlength="80" autocomplete="off">
    <label for="caT">${FT("fType")}</label><select id="caT">${Object.entries(CA_TYPES).map(([k, v]) => `<option value="${k}">${v[1]} ${FT(v[0])}</option>`).join("")}</select>
    <label for="caA">${FT("fAddr")}</label><input id="caA" maxlength="120">
    <label>${FT("fPoint")}</label><div id="caMap" class="mini-map" style="height:200px"></div>
    <label for="caP">${FT("fPur")}</label><select id="caP">${Object.entries(CA_PUR).map(([k, v]) => `<option value="${k}">${FT(v)}</option>`).join("")}</select>
    <div class="ca-2"><div><label for="caM">${FT("fMeas")}</label><input id="caM" type="number" min="0" max="999" step="0.1" inputmode="decimal"></div><div><label for="caD">${FT("fDev")}</label><input id="caD" maxlength="60"></div></div>
    <label for="caNo">${FT("fNote")}</label><input id="caNo" maxlength="200">
    <div class="row" style="margin-top:14px"><button class="btn ghost" id="caCancel" style="flex:1" type="button">${FT("cancel")}</button><button class="btn" id="caSave" style="flex:2" type="button">${FT("save")}</button></div></div>`;
  m.classList.remove("hidden");
  const close = () => { m.classList.add("hidden"); if (fm) fm.remove(); };
  m.onclick = e => { if (e.target === m) close(); };
  $("#caCancel").onclick = close;
  setTimeout(() => { fm = mkMap("caMap", { zoomControl: true }).setView(pt || cityObj().center, pt ? 16 : (cityObj().zoom || 13)); baseTiles(fm);
    const put = ll => { pt = [+ll.lat.toFixed(6), +ll.lng.toFixed(6)]; if (mk) mk.setLatLng(ll); else mk = L.marker(ll, { icon: caIcon({ type: $("#caT").value }, false) }).addTo(fm); };
    if (pt) put({ lat: pt[0], lng: pt[1] }); fm.on("click", e => put(e.latlng)); }, 30);
  $("#caSave").onclick = () => {
    const name = $("#caN").value.trim(); if (!name || !pt) { toast(FT("needName")); return; }
    const mv = $("#caM").value.trim();
    const p = { id: "u" + Date.now().toString(36), city: CITY, name, type: $("#caT").value, address: $("#caA").value.trim(), purifier: $("#caP").value, meas: mv === "" ? null : +mv, dev: $("#caD").value.trim(), note: $("#caNo").value.trim(), lat: pt[0], lon: pt[1], at: Date.now() };
    const a = caMine(); a.unshift(p); caSaveMine(a); close(); toast(FT("saved")); onDone && onDone(p);
  };
  setTimeout(() => $("#caN") && $("#caN").focus(), 60);
}
function caLayer() {
  const lg = L.layerGroup(); let built = false;
  lg.on("add", async () => { if (built) return; built = true; const V = (await caLoadVerified()).filter(p => p.city === CITY);
    V.forEach(p => L.marker([p.lat, p.lon], { icon: caIcon(p, true), zIndexOffset: 600 }).bindPopup(() => caPop(p, true)).addTo(lg));
    caMine().filter(p => p.city === CITY).forEach(p => L.marker([p.lat, p.lon], { icon: caIcon(p, false), zIndexOffset: 550 }).bindPopup(() => caPop(p, false)).addTo(lg)); });
  return lg;
}
async function viewCleanAir(el) {
  const V = (await caLoadVerified()).filter(p => p.city === CITY), mine = caMine().filter(p => p.city === CITY);
  el.innerHTML = `<h1>${FT("ca")}</h1><p class="sub">${FT("caSub")}</p>
    <div class="map-grid"><div class="map-col"><div id="caBig" class="mini-map" style="height:360px"></div>
      <div class="toggles"><button class="btn" id="caAdd" type="button">${FT("suggest")}</button></div></div>
    <div class="list-col">
      <h2>✓ ${FT("vList")} <span class="chip">${V.length}</span></h2>
      ${V.length ? V.map(p => `<div class="card ca-item ver">${caPop(p, true)}</div>`).join("") : `<div class="card ca-empty"><b>${FT("caEmptyH")}</b><p>${FT("caEmpty")}</p></div>`}
      <h2>${FT("myPlaces")} <span class="chip">${mine.length}</span></h2>
      ${mine.map(p => `<div class="card ca-item" id="ca-${p.id}">${caPop(p, false)}${caSendRow(p)}</div>`).join("")}
    </div></div><div class="foot">${t("footProto")}</div>`;
  const m = mkMap("caBig", { zoomControl: true }).setView(cityObj().center, cityObj().zoom || 13); map = m; baseTiles(m);
  caLayer().addTo(m);
  m.on("click", e => caOpenForm(() => route(true), { lat: e.latlng.lat, lon: e.latlng.lng }));
  $("#caAdd").onclick = () => caOpenForm(() => route(true));
  el.querySelectorAll("[data-cacopy]").forEach(b => b.onclick = async () => { const p = caMine().find(x => x.id === b.dataset.cacopy); if (p) { await copyText(caText(p)); toast(FT("copied")); } });
  el.querySelectorAll("[data-cadel]").forEach(b => b.onclick = () => { caSaveMine(caMine().filter(x => x.id !== b.dataset.cadel)); route(true); });
  setTimeout(() => { if (m === map && m._mapPane) m.invalidateSize(); }, 60);
}
/* подсказка советника при AQI > 150 — только если есть ПРОВЕРЕННОЕ место */
async function caAdvisorHint(el) {
  const a = air.byDistrict && air.byDistrict[state.district]; if (!a || a.aqi <= 150) return;
  const d = DISTRICTS.find(x => x.id === state.district); if (!d) return;
  const V = (await caLoadVerified()).filter(p => p.city === CITY); if (!V.length) return;
  const n = V.map(p => ({ p, k: kmDist(d, p) })).sort((x, y) => x.k - y.k)[0];
  if (!el.isConnected || el.querySelector(".ca-hint")) return;
  el.insertAdjacentHTML("afterbegin", `<div class="card ca-hint">${esc(FT("advCa", { n: n.p.name, k: fmt(n.k, 1) }))} <a href="#cleanair">→</a></div>`);
}

/* ---------- B) Транспорт и смог ---------- */
const ftAlive = lg => lg._map && lg._map._mapPane && lg._map === map;   // карта ещё на экране?
function tfLayer(onState) {
  const lg = L.layerGroup(); let built = false;
  lg.on("add", async () => { if (built) return; built = true;
    try { const R = await ftRoads(); if (!ftAlive(lg)) { built = false; return; }
      R.forEach(r => { const mid = r.p[Math.floor(r.p.length / 2)], d = nearestDistrict(mid[0], mid[1]), v = air.byDistrict[d.id] && air.byDistrict[d.id].no2;
        L.polyline(r.p, { color: no2Col(v), weight: /motorway|trunk|primary/.test(r.k) ? 5 : 3.5, opacity: 0.9, interactive: true })
          .bindPopup(() => `<b>${esc(r.n || r.k)}</b><br>${FT("no2")}: <b>${v == null ? "—" : fmt(v, 0) + " µg/m³"}</b><br><small>${esc(dName(d))} · CAMS</small>`).addTo(lg); });
      onState && onState(R.length);
    } catch (e) { built = false; if (e.nosnap) { onState ? onState("nosnap") : toast(FT("noSnap")); } else { console.warn("roads:", e.message); onState ? onState("err") : toast(FT("roadsErr")); } } });
  return lg;
}
const ftStatHTML = st => st === "nosnap" ? `${FT("noSnap")} <button class="btn ghost ft-live" type="button">⬇️ ${FT("loadLive")}</button>` : st === "err" ? `${FT("roadsErr")} <button class="btn ghost ft-live" type="button">↻ ${FT("loadLive")}</button>` : "";
function ftStat(sel, st, okTxt) { const s = $(sel); if (!s) return; if (typeof st === "number") { s.textContent = okTxt(st); return; }
  s.innerHTML = ftStatHTML(st); const b = s.querySelector(".ft-live"); if (b) b.onclick = () => { ftLive[CITY] = true; route(true); }; }
function ttLayer() { const k = FCFG().TOMTOM_KEY; if (!k) return null;
  return L.tileLayer(`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${encodeURIComponent(k)}`, { maxZoom: 18, opacity: 0.85, attribution: "Traffic &copy; TomTom", zIndex: 5 }); }
const tfCache = {};
async function tfHourly(d) {
  const k = d.id; if (tfCache[k] && Date.now() - tfCache[k].at < 30 * 60e3) return tfCache[k].d;
  const u = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${d.lat}&longitude=${d.lon}&hourly=nitrogen_dioxide,pm2_5,pm10&past_days=3&forecast_days=1&timezone=auto`;
  const w = `https://api.open-meteo.com/v1/forecast?latitude=${d.lat}&longitude=${d.lon}&hourly=temperature_2m&past_days=3&forecast_days=1&timezone=auto`;
  const [a, b] = await Promise.all([fetch(u).then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))), fetch(w).then(r => r.ok ? r.json() : null).catch(() => null)]);
  tfCache[k] = { at: Date.now(), d: { a, b } }; return tfCache[k].d;
}
function tfEstimate(H) {
  const a = H.a.hourly, now = Date.now(), cl = x => Math.max(0, Math.min(1, x));
  const rows = a.time.map((tm, i) => ({ h: +tm.slice(11, 13), past: new Date(tm).getTime() <= now, no2: a.nitrogen_dioxide[i], p25: a.pm2_5[i], p10: a.pm10[i] })).filter(r => r.past && r.no2 != null);
  if (rows.length < 24) return null;
  const avg = f => { const v = rows.filter(f); return v.length ? v.reduce((s, r) => s + r.no2, 0) / v.length : null; };
  const rush = avg(r => (r.h >= 7 && r.h <= 10) || (r.h >= 17 && r.h <= 20)), night = avg(r => r.h >= 1 && r.h <= 5);
  const sum = k => rows.reduce((s, r) => s + (r[k] || 0), 0);
  const R = night > 0.5 ? rush / night : null, np = sum("p25") > 0 ? sum("no2") / sum("p25") : null, pp = sum("p10") > 0 ? sum("p25") / sum("p10") : null;
  let temp = null; if (H.b && H.b.hourly) { const tt = H.b.hourly.temperature_2m.filter((v, i) => v != null && new Date(H.b.hourly.time[i]).getTime() <= now); if (tt.length) temp = tt.reduce((s, v) => s + v, 0) / tt.length; }
  const T1 = R == null ? 0.3 : cl((R - 1) / 1.5), T2 = np == null ? 0.3 : cl((np - 0.3) / 0.9), T3 = pp == null ? 0.3 : cl((0.8 - pp) / 0.4), cold = temp == null ? 0.5 : cl((10 - temp) / 15);
  const st = 0.45 * T1 + 0.35 * T2 + 0.2 * T3, sh = 0.5 * (1 - T2) + 0.3 * (1 - T3) + 0.2 * cold, tp = Math.round(100 * st / Math.max(0.01, st + sh));
  return { tp, hp: 100 - tp, R, np, pp, temp };
}
function tfHowOpen() {
  const m = $("#modal");
  m.innerHTML = `<div class="sheet tf-how" role="dialog" aria-modal="true" aria-labelledby="tfHH"><h3 id="tfHH">${FT("howH")}</h3>${FT("howTxt")}
    <h4>📚 ${FT("studies")}</h4><ul class="small"><li>${esc(FT("st1"))} ${ftLink(SRC_LINKS.air2024, "doi:10.3390/air2040021")}</li><li>${esc(FT("st2"))} ${ftLink(SRC_LINKS.wb2024, "doi:10.1596/41995")}</li><li>${esc(FT("st3"))} ${ftLink(SRC_LINKS.undp2023, "UNDP")}</li></ul>
    <button class="btn" id="tfHClose" type="button" style="width:100%;margin-top:10px">OK</button></div>`;
  m.classList.remove("hidden"); const close = () => m.classList.add("hidden"); m.onclick = e => { if (e.target === m) close(); }; $("#tfHClose").onclick = close; $("#tfHClose").focus();
}
async function tfCardFill(box, d) {
  box.innerHTML = `<p class="small muted">${FT("loadingH")}</p>`;
  try { const E = tfEstimate(await tfHourly(d)); if (!box.isConnected) return; if (!E) { box.innerHTML = `<p class="small muted">${FT("noData")}</p>`; return; }
    box.innerHTML = `<div class="tf-bar" role="img" aria-label="${FT("trans")} ${E.tp}% / ${FT("heat")} ${E.hp}%"><span class="tf-t" style="width:${E.tp}%">${E.tp}%</span><span class="tf-h" style="width:${E.hp}%">🔥 ${E.hp}%</span></div>
      <div class="row between small" style="margin-top:4px"><span>${FT("trans")}</span><span>${FT("heat")}</span></div>
      <p class="small muted" style="margin-top:8px"><b>${FT("estNote")}</b></p>
      <div class="small">${esc(FT("inputs", { d: dName(d) }))}<ul class="tf-in"><li>${FT("rush")}: <b>${E.R == null ? "—" : fmt(E.R, 2)}</b></li><li>${FT("ratioNP")}: <b>${E.np == null ? "—" : fmt(E.np, 2)}</b></li><li>${FT("ratioPP")}: <b>${E.pp == null ? "—" : fmt(E.pp, 2)}</b></li><li>${FT("cold")}: <b>${E.temp == null ? "—" : fmt(E.temp, 1) + " °C"}</b></li></ul></div>`;
  } catch (e) { box.innerHTML = `<p class="small muted">${FT("noData")} (${esc(e.message)})</p>`; }
}
function viewTraffic(el) {
  const d = DISTRICTS.find(x => x.id === state.district) || DISTRICTS[0];
  el.innerHTML = `<h1>${FT("tf")}</h1><p class="sub">${FT("tfSub")}</p>
    <div class="map-grid"><div class="map-col"><div id="tfMap" class="mini-map" style="height:400px"></div>
      <div class="legend tf-leg">${[[5, "<10"], [15, "10–25"], [30, "25–40"], [50, "40–60"], [70, "60+"]].map(([v, l]) => `<span style="background:${no2Col(v)}">NO₂ ${l}</span>`).join("")}</div>
      <p class="small muted" id="tfStat">${FT("roadsLoad")}</p><p class="small muted">${FT("roadsSrc")}</p></div>
    <div class="list-col"><div class="card tf-card"><div class="row between"><h3 style="margin:0">${FT("estH")}</h3><button class="btn ghost" id="tfHow" type="button">❓ ${FT("how")}</button></div>
      <label for="tfD" class="small">${t("district")}</label><select id="tfD">${districtOptions(d.id)}</select><div id="tfBox"></div></div>
      <div class="card small">📚 ${FT("studies")}: ${ftLink(SRC_LINKS.air2024, "Air 2024")} · ${ftLink(SRC_LINKS.wb2024, "World Bank 2024")} · ${ftLink(SRC_LINKS.undp2023, "UNDP 2023")}</div>
    </div></div><div class="foot">${t("footProto")}</div>`;
  const m = mkMap("tfMap", { zoomControl: true }).setView(cityObj().center, cityObj().zoom || 12); map = m; baseTiles(m);
  const L1 = tfLayer(st => ftStat("#tfStat", st, n => "🛣️ " + FT("roadsN", { n }))).addTo(m); const tt = ttLayer(); if (tt) tt.addTo(m);
  const box = $("#tfBox"); tfCardFill(box, d);
  $("#tfD").onchange = e => { const x = DISTRICTS.find(y => y.id === e.target.value); if (x) { tfCardFill(box, x); m.setView([x.lat, x.lon], Math.max(m.getZoom(), 13)); } };
  $("#tfHow").onclick = tfHowOpen;
  setTimeout(() => { if (m === map && m._mapPane) m.invalidateSize(); }, 60); void L1;
}

/* ---------- C) Где посадить деревья ---------- */
const TREE_KEY = "tazaAba.treesPlanted";
const treesN = () => +(localStorage.getItem(TREE_KEY) || 0);
function segDist(p, a, b) { const kx = 111.32 * Math.cos(p[0] * Math.PI / 180), ky = 110.57; const ax = (a[1] - p[1]) * kx, ay = (a[0] - p[0]) * ky, bx = (b[1] - p[1]) * kx, by = (b[0] - p[0]) * ky;
  const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy, t0 = l ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / l)) : 0; return Math.hypot(ax + t0 * dx, ay + t0 * dy); }
async function trCandidates() {
  const [{ G, P }, R] = await Promise.all([ftGreenPoi(), ftRoads().catch(() => [])]);
  const aq = DISTRICTS.map(d => air.byDistrict[d.id] && air.byDistrict[d.id].aqi).filter(v => v != null).sort((a, b) => a - b), med = aq.length ? aq[Math.floor(aq.length / 2)] : 0;
  const [s, w, n, e] = ftCityBox(0), step = 0.0036, out = [];   // ~400 м
  for (let la = s; la <= n; la += step) for (let lo = w; lo <= e; lo += step * 1.35) {
    const p = [la, lo], d = nearestDistrict(la, lo); if (!d || kmDist(d, { lat: la, lon: lo }) > 1.6) continue;
    const a = air.byDistrict[d.id] && air.byDistrict[d.id].aqi; if (a == null || a < med) continue;
    let gm = 9; for (const g of G) { const k = kmDist({ lat: la, lon: lo }, { lat: g[0], lon: g[1] }); if (k < gm) gm = k; if (gm < 0.4) break; }
    if (gm < 0.4) continue;
    let rd = 9, rn = ""; for (const r of R) for (let i = 1; i < r.p.length; i++) { const k = segDist(p, r.p[i - 1], r.p[i]); if (k < rd) { rd = k; rn = r.n || r.k; } }
    let sd = 9, sn = ""; for (const x of P) { const k = kmDist({ lat: la, lon: lo }, x); if (k < sd) { sd = k; sn = x.n || x.k; } }
    const nearRoad = rd < 0.15, nearSch = sd < 0.3; if (!nearRoad && !nearSch) continue;
    out.push({ lat: la, lon: lo, a, gm, rn: nearRoad ? rn : "", sn: nearSch ? sn : "", sc: (a - med) / 50 + Math.min(gm, 1.5) + (nearRoad ? 0.6 : 0) + (nearSch ? 0.8 : 0) });
  }
  return out.sort((x, y) => y.sc - x.sc).slice(0, 30);
}
function trLayer(onState) {
  const lg = L.layerGroup(); let built = false;
  lg.on("add", async () => { if (built) return; built = true;
    try { const C = await trCandidates(); if (!ftAlive(lg)) { built = false; return; } onState && onState(C.length);
      C.forEach(c => L.circle([c.lat, c.lon], { radius: 160, color: "#1f7a3a", weight: 2, dashArray: "4 4", fillColor: "#3ccf6b", fillOpacity: 0.25 })
        .bindPopup(() => `<b>${FT("cand")}</b><br><small>${FT("whyH")}</small><ul class="small" style="margin:4px 0 0 16px;padding:0"><li>${FT("wAqi", { a: c.a })}</li><li>${FT("wGreen", { m: c.gm >= 9 ? ">1000" : Math.round(c.gm * 1000) })}</li>${c.rn ? `<li>${esc(FT("wRoad", { r: c.rn }))}</li>` : ""}${c.sn ? `<li>${esc(FT("wSchool", { s: c.sn }))}</li>` : ""}</ul>`).addTo(lg));
    } catch (e) { built = false; if (e.nosnap) { onState ? onState("nosnap") : toast(FT("noSnap")); } else { console.warn("trees:", e.message); onState ? onState("err") : toast(FT("roadsErr")); } } });
  return lg;
}
function viewTrees(el) {
  const bk = CITY === "bishkek";
  el.innerHTML = `<h1>${FT("tr")}</h1><p class="sub">${FT("trSub")}</p>
    <div class="map-grid"><div class="map-col"><div id="trMap" class="mini-map" style="height:400px"></div>
      <p class="small muted" id="trStat">${FT("trLoad")}</p><p class="small muted">${FT("trSrc")}</p></div>
    <div class="list-col">
      <div class="card tr-plant"><button class="btn" id="trPlant" type="button">${FT("planted")}</button> <b id="trN">${FT("plantedN", { n: treesN() })}</b>
        <div class="share-row" style="margin-top:8px"><a class="sh-a" id="trShTg" target="_blank" rel="noopener">✈️ Telegram</a><a class="sh-a" id="trShWa" target="_blank" rel="noopener">💬 WhatsApp</a><button class="sh-a" id="trShCp" type="button">📋 ${FT("copy")}</button></div></div>
      <div class="card"><h3>🌿 ${FT("spH")}</h3><p>${FT(bk ? "spBk" : "spGen")}</p>${bk ? `<p class="small">${FT("srcLbl")}: ${ftLink(SRC_LINKS.zelen, "TopNews.kg — «Бишкекзеленстрой»")} · ${ftLink(SRC_LINKS.vesti, "Вести.kg — мэрия Бишкека")} · ${ftLink(SRC_LINKS.botsad, "Ботсад им. Э. Гареева (2017)")}</p>` : ""}</div>
      <div class="card"><h3>📅 ${FT("seasH")}</h3><p>${FT("seas")}</p>${bk ? `<p class="small">${FT("srcLbl")}: ${ftLink(SRC_LINKS.zelen, "TopNews.kg")}</p>` : ""}</div>
      <div class="card"><h3>📝 ${FT("permH")}</h3><p>${FT(bk ? "permBk" : "permGen")}</p>${bk ? `<p class="small">${FT("srcLbl")}: ${ftLink(SRC_LINKS.zelen, "TopNews.kg")}</p>` : ""}</div>
    </div></div><div class="foot">${t("footProto")}</div>`;
  const m = mkMap("trMap", { zoomControl: true }).setView(cityObj().center, cityObj().zoom || 12); map = m; baseTiles(m);
  trLayer(st => ftStat("#trStat", st, n => n ? "" + FT("candN", { n }) + " · " + FT("cand") : FT("trNone"))).addTo(m);
  const upd = () => { const n = treesN(), txt = FT("plantShare", { n }), e = encodeURIComponent; $("#trN").textContent = FT("plantedN", { n });
    $("#trShTg").href = `https://t.me/share/url?url=${e(SITE_URL)}&text=${e(txt)}`; $("#trShWa").href = `https://wa.me/?text=${e(txt + " " + SITE_URL)}`; $("#trShCp").onclick = async () => { await copyText(txt + " " + SITE_URL); toast(FT("copied")); }; };
  upd(); $("#trPlant").onclick = () => { localStorage.setItem(TREE_KEY, String(treesN() + 1)); upd(); };
  setTimeout(() => { if (m === map && m._mapPane) m.invalidateSize(); }, 60);
}

/* ---------- подключение: разделы «Ещё», слои на главной карте, подсказка советника ---------- */
const FT_ON = { ca: true, tf: true, tr: true };   // какие слои включены в сборке
(function () {
  if (FT_ON.ca) { views.cleanair = el => viewCleanAir(el); TAB_OF.cleanair = "more"; }
  if (FT_ON.tf) { views.traffic = viewTraffic; TAB_OF.traffic = "more"; }
  if (FT_ON.tr) { views.trees = viewTrees; TAB_OF.trees = "more"; }
  const _more = views.more;
  views.more = el => { _more(el); const g = el.querySelector(".more-grid");
    const ico = k => (typeof navIco === "function" ? navIco(k) : "");
    const items = [FT_ON.ca && ["#cleanair", "cleanair", FT("ca"), FT("caSub")], FT_ON.tf && ["#traffic", "traffic", FT("tf"), FT("tfSub")], FT_ON.tr && ["#trees", "trees", FT("tr"), FT("trSub")]].filter(Boolean);
    const html = items.map(([h, k, a, b]) => `<a href="${h}" class="card more-tile"><span class="mt-e">${ico(k)}</span><b>${esc(a)}</b><small>${esc(b)}</small></a>`).join("");
    if (g) g.insertAdjacentHTML("beforeend", html); else el.insertAdjacentHTML("beforeend", `<div class="more-grid">${html}</div>`); };
  const LKEY = "tazaAba.ftLayers", st = (() => { try { return JSON.parse(localStorage.getItem(LKEY) || "{}"); } catch (e) { return {}; } })();
  const _map = views.map;
  views.map = el => { _map(el);
    if (mapMode !== "city" || !map || !el.querySelector("#mapEl")) return;
    const tg = el.querySelector(".toggles"); if (!tg) return;
    const M = map, defs = [FT_ON.ca && ["ca", FT("lCa"), caLayer], FT_ON.tf && ["tf", FT("lTf"), tfLayer], FT_ON.tr && ["tr", FT("lTr"), () => trLayer()]].filter(Boolean);
    const tt = FT_ON.tf && ttLayer(); if (tt) defs.push(["tt", FT("lTt"), () => tt]);
    defs.forEach(([k, label, mk]) => { let lg = null;
      tg.insertAdjacentHTML("beforeend", `<div class="toggle ft-toggle ${st[k] ? "on" : ""}" data-ft="${k}" role="button" tabindex="0">${label}</div>`);
      const b = tg.querySelector(`[data-ft="${k}"]`);
      const on = v => { st[k] = v; localStorage.setItem(LKEY, JSON.stringify(st)); b.classList.toggle("on", v); if (v) { lg = lg || mk(); lg.addTo(M); } else if (lg) M.removeLayer(lg); };
      b.onclick = e => { e.stopPropagation(); on(!st[k]); }; b.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); on(!st[k]); } };
      if (st[k]) idle(() => { if (M === map) on(true); }); });
  };
  const _adv = views.advisor;
  if (FT_ON.ca) views.advisor = el => { _adv(el); caAdvisorHint(el).catch(() => { }); };
})();
