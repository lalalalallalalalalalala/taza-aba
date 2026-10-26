/* Таза Аба — переводы интерфейса: ru (по умолчанию), ky (кыргызча), en. */
const LANGS = { ru: "RU", ky: "KG", en: "EN" };
let LANG = localStorage.getItem("tazaAba.lang") || "ru";
// ?lang=ru|ky|en|tr — для ссылок hreflang и поисковиков (выбор запоминается)
try { const ql = new URLSearchParams(location.search).get("lang"); if (["ru", "ky", "en"].includes(ql)) { LANG = ql; localStorage.setItem("tazaAba.lang", ql); } } catch (e) {}
if (!LANGS[LANG]) { LANG = "ru"; try { localStorage.setItem("tazaAba.lang", "ru"); } catch (e) {} }   // v56: турецкий удалён → ru

const DICT = {
ru: {
  brandSub: "чистый воздух {cityGen}", live: "Live", demo: "Демо",
  tab_home: "Главная", tab_map: "Карта", tab_house: "Мой дом", tab_advisor: "Советник", tab_profile: "Профиль",
  loading: "Загружаем данные о воздухе…", loadingSub: "Open-Meteo · {city}", district: "Район",
  dayAdvice: "Совет дня", forecast3: "Прогноз на 3 дня", tomorrow: "Завтра", dayAfter: "После­завтра",
  peakNote: "Пик — самый грязный час дня (PM2.5 за час), «сред.» — AQI по среднесуточному PM2.5; модель CAMS.", hourNote: "Столбики — PM2.5 в каждый час (модель CAMS), поэтому видны лучший час и вечерний пик. Большое число AQI вверху по модели считается по среднему за 24 ч (как суточный AQI EPA) и меняется плавнее.", avg: "сред.", todayHourly: "Сегодня по часам",
  bestTime: "🌿 Лучшее время гулять", peakSmog: "🔥 Пик смога",
  coalTip: "{In} {p}% домов ещё топят углём", coalTipSub: "Узнайте, сколько вы сэкономите, если перейти на чистое тепло.", calcBtn: "Посчитать для моего дома →",
  footLive: "Данные: модель CAMS через {link}, обновлено {t}. Значения по районам — модель × районный коэффициент (оценка).",
  footDemo: "⚠️ Нет данных: нет связи с Open-Meteo. Проверьте интернет и нажмите «Повторить».", footProto: "Прототип хакатона SolarPunk · Бишкек 2026",
  mapTitle: "Карта смога", mapSub: "Уровень воздуха по районам {cityGen} ",
  layerSmog: "💨 Смог по районам", demoChip: "демо", districtsList: "🏙️ Районы: от грязного к чистому",
  coalShareNote: "🔥 — доля домов на угле (демо-оценка)", popupCoal: "Домов на угле", demoData: "демо-данные",
  houseTitle: "Мой дом", houseSub: "Сколько вы сэкономите, если откажетесь от угля",
  areaLbl: "🏠 Площадь дома, м²", coalLbl: "⚫ Уголь за зиму, т", priceLbl: "💰 Цена тонны, сом", 
  advisorCta: "🤖 Не знаете, что выбрать? Спросите ИИ-советника", nowCoal: "🔥 Сейчас, на угле", perWinter: "за зиму",
  spend: "Расходы", pmDust: "Пыль PM2.5", likeCar: "Как машина", yearsN: "{n} года",
  likeCarNote: "«Как машина» — сколько лет ездить на легковом авто (~2 т CO₂/год), чтобы выбросить столько же.",
  threePaths: "🌱 Три пути к чистому теплу", fastest: "⭐ Быстрее окупится",
  o_solar: "Солнечные панели", o_pump: "Тепловой насос", o_insul: "Утепление",
  d_solar: "{kw} кВт панелей + 2 кондиционера на обогрев", d_pump: "Воздух-вода, полностью без угля", d_insul: "Стены, чердак, окна — минус 40% угля",
  cost: "Стоимость", savingsYr: "Экономия в год", payback: "Окупаемость", lessCoal: "Минус угля", tPerYr: "{n} т/год",
  lessCO2pm: "Минус CO₂ / PM2.5", likePlant: "Как посадить", treesN: "🌳 {n} дер.", myPlan: "✓ Мой план", choosePlan: "Выбрать этот план",
  planSaved: "План сохранён в профиль 🌱", t: "т", kg: "кг", som: "сом",
  howTitle: "ℹ️ Как считаем",
  how: ["1 т угля ≈ 2,9 МВт·ч тепла в доме (теплота сгорания ~18,8 ГДж/т, КПД печи ~55%).",
    "1 т угля = ~1,8 т CO₂ и ~6 кг мелкой пыли PM2.5 (главная причина смога).",
    "Электричество: ~2 сом/кВт·ч, сеть КР почти чистая (~90% ГЭС).",
    "Утепление: ~1 100 сом/м² дома, минус 40% тепла.",
    "Тепловой насос: 180 000 сом + 1 800 сом/м², КПД (COP) ~2,7 зимой.",
    "Солнце: ~48 000 сом за 1 кВт, ~{pvY} кВт·ч/кВт в год в {cityPrep} (оценка), плюс 2 кондиционера на обогрев закрывают половину тепла.",
    "1 дерево поглощает ~22 кг CO₂ в год.", "Это оценка для сравнения вариантов, а не коммерческое предложение."],
  
  create: "＋ Создать", allDistricts: "Все районы",
  until: "до {d}", 
  per: "за {u}", 
  
  
  
  titleLbl: "Название", cancel: "Отмена", 
  
  planLbl: "план: {p}", badgeName: "«Чистый дом»", badgeOn: "Ваш дом отапливается без угля. Спасибо, что бережёте воздух {cityGen}!",
  badgeOff: "Перейдите на чистое отопление, чтобы получить бейдж", unmark: "Отменить отметку", mark: "✓ Я перешёл на чистое тепло",
  badgeToast: "Бейдж «Чистый дом» получен! 🏡", myImpact: "🌍 Мой вклад за год", coalNotBurned: "⚫ Не сожжено угля", lessCO2: "💨 Меньше CO₂",
  lessPM: "💨 Меньше PM2.5", likeTrees: "🌳 Как деревьев", familySave: "💰 Экономия семьи в год", badgesT: "🏅 Бейджи",
  b1: "Чистый дом", b3: "Посчитал", b4: "100 деревьев", 
  you: "вы", nameLbl: "Имя", myDistrict: "Мой район", reset: "Сбросить демо-данные", resetToast: "Демо-данные сброшены",
  profileFoot: "Профиль и бейджи — на этом устройстве. Данные хранятся только на этом устройстве.", defaultName: "Житель Бишкека",
  alertsTitle: "🔔 Уведомления о смоге", alertsSub: "Предупредим заранее, если завтра воздух будет плохим", alertsOn: "Включить уведомления",
  alertDistrict: "Район для уведомлений", threshold: "Порог AQI", th50: "50 — очень чутко (зимой почти каждый день)", testBtn: "🔔 Тестовое уведомление",
  permGranted: "Браузер разрешил уведомления ✓", permDenied: "Браузер запретил уведомления — покажем их внутри приложения",
  permUnsupported: "Браузер не поддерживает уведомления — покажем их внутри приложения",
  tomorrowFc: "Прогноз на завтра {in}: до {aqi} AQI", checkNote: "Проверяем прогноз Open-Meteo каждые 30 минут, пока приложение открыто.",
  alertTitle: "Таза Аба · смог", alertBody: "Завтра смог {in}: AQI до {aqi}. Закройте окна и наденьте маску.", testPrefix: "Тест: ",
  advTitle: "ИИ-советник", advSub: "Подберёт лучший способ отказаться от угля за 4 вопроса",
  ruleNote: "⚙️ Работает по правилам, без ключей и платных API, на основе калькулятора «Мой дом». Ниже можно подключить свою LLM.",
  advHello: "Салам! Я советник «Таза Аба». Ответьте на 4 вопроса, и я подскажу, как вашему дому отказаться от угля с наибольшей выгодой.",
  qArea: "Какая площадь вашего дома?", qWall: "Из чего стены?", qCoal: "Сколько угля вы сжигаете за зиму?", qBudget: "Какой бюджет готовы вложить?",
  w_brick: "Кирпич", w_adobe: "Саман", w_block: "Шлакоблок", w_wood: "Дерево",
  bud1: "до 100 тыс.", bud2: "100–300 тыс.", bud3: "300–600 тыс.", bud4: "больше 600 тыс.",
  recIntro: "Мой совет для вашего дома: <b>{plan}</b>.",
  p_partial: "утепление чердака и окон (первый шаг)", p_insul: "полное утепление дома", p_insul_pump: "утепление + тепловой насос", p_insul_solar: "утепление + солнечные панели",
  whyLow: "С бюджетом {b} лучше начать с самого дешёвого и быстрого шага: через чердак и щели в окнах уходит до трети тепла.",
  whyInsul: "Утепление окупается быстрее всего, а каждая следующая технология после него будет дешевле и эффективнее.",
  whyPump: "Бюджет позволяет полностью уйти от угля: сначала утепляем, потом ставим насос меньшей мощности. Так дешевле, чем один большой насос на «дырявый» дом.",
  whySolar: "В {cityPrep} много солнечных дней: панели питают дом летом и помогают обогреву зимой.",
  wn_brick: "Кирпичные стены без утепления быстро остывают, утепление фасада даст заметный эффект.",
  wn_adobe: "Саманные стены и так неплохо держат тепло, поэтому главное — крыша, окна и пол.",
  wn_block: "Шлакоблок плохо держит тепло, утепление стен даст максимальный эффект.",
  wn_wood: "Деревянный дом хорошо утепляется снаружи и изнутри, главное — не забыть про пароизоляцию.",
  numbers: "Цифры:", n_cost: "💰 Стоимость: {v}", n_save: "📉 Экономия: {v} в год", n_pay: "⏳ Окупаемость: {v}", n_coal: "⚫ Минус {v} т угля в год ({p}%)", n_trees: "🌳 Как {v} посаженных деревьев",
  stepsHdr: "План по шагам:",
  s_partial: ["Утеплить чердак или потолок минватой 150–200 мм", "Заделать щели в окнах и дверях, поставить уплотнители", "Повесить тёплые шторы и экран за батареей", "Вступить во «Вместе дешевле» и копить на утепление стен"],
  s_insul: ["Энергоаудит: найти, где уходит тепло (например, тепловизором)", "Утеплить чердак и пол", "Утеплить стены снаружи минватой 100 мм", "Заменить старые окна на двухкамерные стеклопакеты"],
  s_insul_pump: ["Утеплить чердак, стены и окна", "Подобрать тепловой насос воздух-вода под новую, меньшую нагрузку", "Установить насос с тёплым полом или низкотемпературными радиаторами", "Убрать угольный котёл и получить бейдж «Чистый дом» 🏡"],
  s_insul_solar: ["Утеплить чердак, стены и окна", "Поставить солнечные панели {kw} кВт на южный скат крыши", "Установить 2 инверторных кондиционера для обогрева", "Топить печь только в сильные морозы"],
  
  apply: "Применить в «Мой дом»", restart: "Начать заново", applied: "Данные перенесены в «Мой дом» ✓", askPh: "Спросите что-нибудь…",
  a_credit: "Многие банки Кыргызстана дают «зелёные» кредиты на утепление и панели. Ежемесячный платёж часто сравним с тем, что вы сейчас тратите на уголь.",
  a_start: "Начните с утепления чердака и окон: это самый дешёвый шаг, и он даёт до 20% экономии уже этой зимой.",
  a_pay: "По вашим данным {plan} окупится примерно за {y}.", a_first: "Сначала ответьте на 4 вопроса выше 🙂",
  a_fallback: "Я работаю по правилам и понимаю вопросы про кредит, окупаемость и «с чего начать». Для свободного диалога подключите LLM-ключ в настройках ниже.",
  llmTitle: "🔑 Подключить LLM (необязательно)", llmNote: "OpenAI-совместимый API. Ключ хранится только в этом браузере (localStorage) и отправляется только на указанный адрес.",
  baseUrl: "Адрес API", model: "Модель", apiKey: "Ключ API", saveBtn: "Сохранить", clearBtn: "Удалить ключ", llmSaved: "Настройки LLM сохранены",
  llmOn: "LLM подключена: свободные вопросы уходят в модель", llmErr: "LLM не ответила ({e}). Отвечаю по правилам:",
  cat_insul: "Утеплитель + монтаж, за м²", cat_solar: "Комплект солнечных панелей 5 кВт", cat_pump: "Тепловой насос с монтажом", cat_trees: "Саженец + посадка",
  cs_insul: "утеплитель", cs_solar: "солнечные панели", cs_pump: "тепловые насосы", cs_trees: "деревья",
  u_insul: "м²", u_solar: "комплект", u_pump: "шт.", u_trees: "дерево",
  days: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
},
ky: {
  brandSub: "{cityGen} таза абасы", live: "Live", demo: "Демо",
  tab_home: "Башкы", tab_map: "Карта", tab_house: "Үйүм", tab_advisor: "Кеңешчи", tab_profile: "Профиль",
  loading: "Аба тууралуу маалымат жүктөлүүдө…", loadingSub: "Open-Meteo · {city}", district: "Район",
  dayAdvice: "Күндүн кеңеши", forecast3: "3 күндүк божомол", tomorrow: "Эртең", dayAfter: "Бүр­сүгүнү",
  peakNote: "Чоку — күндүн эң кир сааты (сааттык PM2.5), «орт.» — орточо суткалык PM2.5 боюнча AQI; CAMS модели.", hourNote: "Мамычалар — ар бир сааттагы PM2.5 (CAMS модели), ошондуктан эң жакшы саат жана кечки чоку көрүнөт. Жогорудагы чоң AQI саны модель боюнча акыркы 24 сааттын орточосу менен эсептелет (EPA суткалык AQI сыяктуу) жана жайыраак өзгөрөт.", avg: "орт.", todayHourly: "Бүгүн саат боюнча",
  bestTime: "🌿 Сейилдөөгө эң жакшы убакыт", peakSmog: "🔥 Смогдун чокусу",
  coalTip: "{In} үйлөрдүн {p}% дагы эле көмүр жагат", coalTipSub: "Таза жылуулукка өтсөңүз, канча үнөмдөй турганыңызды билиңиз.", calcBtn: "Үйүм үчүн эсептөө →",
  footLive: "Маалымат: CAMS модели, {link} аркылуу, жаңыланган убакыт {t}. Райондордогу маанилер — модель × райондук коэффициент (болжолдуу баа).",
  footDemo: "⚠️ Маалымат жок: Open-Meteo менен байланыш жок. Интернетти текшерип, «Кайталоо» басыңыз.", footProto: "SolarPunk хакатонунун прототиби · Бишкек 2026",
  mapTitle: "Смог картасы", mapSub: "{cityGen} райондорундагы абанын абалы ",
  layerSmog: "💨 Райондордогу смог", demoChip: "демо", districtsList: "🏙️ Райондор: эң кирдүүдөн эң тазага",
  coalShareNote: "🔥 — көмүр жаккан үйлөрдүн үлүшү (демо-баа)", popupCoal: "Көмүр жаккан үйлөр", demoData: "демо-маалымат",
  houseTitle: "Менин үйүм", houseSub: "Көмүрдөн баш тартсаңыз, канча үнөмдөйсүз",
  areaLbl: "🏠 Үйдүн аянты, м²", coalLbl: "⚫ Кышкы көмүр, т", priceLbl: "💰 Бир тоннанын баасы, сом", 
  advisorCta: "🤖 Эмнени тандаарыңызды билбей жатасызбы? ИИ-кеңешчиден сураңыз", nowCoal: "🔥 Азыр, көмүр менен", perWinter: "бир кышта",
  spend: "Чыгым", pmDust: "PM2.5 чаңы", likeCar: "Машинага барабар", yearsN: "{n} жыл",
  likeCarNote: "«Машинага барабар» — жеңил унаа ушунча CO₂ чыгаруу үчүн (~2 т/жыл) канча жыл жүрүшү керек.",
  threePaths: "🌱 Таза жылуулукка үч жол", fastest: "⭐ Тезирээк актанат",
  o_solar: "Күн панелдери", o_pump: "Жылуулук насосу", o_insul: "Жылуулоо",
  d_solar: "{kw} кВт панель + жылытуу үчүн 2 кондиционер", d_pump: "Аба-суу, толугу менен көмүрсүз", d_insul: "Дубал, чатыр, терезе — көмүр 40% азаят",
  cost: "Баасы", savingsYr: "Жылдык үнөм", payback: "Актануу мөөнөтү", lessCoal: "Көмүр азаят", tPerYr: "{n} т/жыл",
  lessCO2pm: "CO₂ / PM2.5 азаят", likePlant: "Отургузгандай", treesN: "🌳 {n} дарак", myPlan: "✓ Менин планым", choosePlan: "Ушул планды тандоо",
  planSaved: "План профилге сакталды 🌱", t: "т", kg: "кг", som: "сом",
  howTitle: "ℹ️ Кантип эсептейбиз",
  how: ["1 т көмүр ≈ үйдө 2,9 МВт·с жылуулук (күйүү жылуулугу ~18,8 ГДж/т, мештин ПАКы ~55%).",
    "1 т көмүр = ~1,8 т CO₂ жана ~6 кг майда PM2.5 чаңы (смогдун негизги себеби).",
    "Электр энергиясы: ~2 сом/кВт·с, Кыргызстандын тармагы дээрлик таза (~90% ГЭС).",
    "Жылуулоо: үйдүн ар бир м² үчүн ~1 100 сом, жылуулук 40% аз керектелет.",
    "Жылуулук насосу: 180 000 сом + 1 800 сом/м², кышында ПАК (COP) ~2,7.",
    "Күн: 1 кВт үчүн ~48 000 сом, {cityPrep} жылына ~{pvY} кВт·с/кВт (болжол), жылытуучу 2 кондиционер жылуулуктун жарымын камсыз кылат.",
    "1 дарак жылына ~22 кг CO₂ сиңирет.", "Бул варианттарды салыштыруу үчүн болжолдуу эсеп, коммерциялык сунуш эмес."],
  
  create: "＋ Түзүү", allDistricts: "Бардык райондор",
  until: "{d} чейин", 
  per: "{u} үчүн", 
  
  
  
  titleLbl: "Аталышы", cancel: "Жокко чыгаруу", 
  
  planLbl: "план: {p}", badgeName: "«Таза үй»", badgeOn: "Үйүңүз көмүрсүз жылытылат. {cityGen} абасын сактаганыңыз үчүн рахмат!",
  badgeOff: "Бейджди алуу үчүн таза жылытууга өтүңүз", unmark: "Белгини алып салуу", mark: "✓ Мен таза жылуулукка өттүм",
  badgeToast: "«Таза үй» бейджи алынды! 🏡", myImpact: "🌍 Менин жылдык салымым", coalNotBurned: "⚫ Жагылбаган көмүр", lessCO2: "💨 CO₂ азайды",
  lessPM: "💨 PM2.5 азайды", likeTrees: "🌳 Даракка барабар", familySave: "💰 Үй-бүлөнүн жылдык үнөмү", badgesT: "🏅 Бейджилер",
  b1: "Таза үй", b3: "Эсептеди", b4: "100 дарак", 
  you: "сиз", nameLbl: "Аты", myDistrict: "Менин районум", reset: "Демо-маалыматты баштапкы абалга келтирүү", resetToast: "Демо-маалымат баштапкы абалга келди",
  profileFoot: "Профиль жана бейджилер — ушул түзмөктө. Маалымат ушул түзмөктө гана сакталат.", defaultName: "Бишкектик",
  alertsTitle: "🔔 Смог тууралуу эскертүүлөр", alertsSub: "Эртең аба начар болсо, алдын ала эскертебиз", alertsOn: "Эскертүүлөрдү күйгүзүү",
  alertDistrict: "Кайсы район боюнча эскертүү", threshold: "AQI чеги", th50: "50 — өтө сезгич (кышында дээрлик күн сайын)", testBtn: "🔔 Сыноо эскертүүсү",
  permGranted: "Браузер эскертүүлөргө уруксат берди ✓", permDenied: "Браузер эскертүүлөргө тыюу салды — аларды колдонмонун ичинде көрсөтөбүз",
  permUnsupported: "Браузер эскертүүлөрдү колдобойт — аларды колдонмонун ичинде көрсөтөбүз",
  tomorrowFc: "Эртеңки божомол, {in}: {aqi} AQI чейин", checkNote: "Колдонмо ачык турганда Open-Meteo божомолун ар 30 мүнөт сайын текшеребиз.",
  alertTitle: "Таза Аба · смог", alertBody: "Эртең {in} смог болот: AQI {aqi} чейин жетет. Терезелерди жаап, маска тагыңыз.", testPrefix: "Сыноо: ",
  advTitle: "ИИ-кеңешчи", advSub: "4 суроо аркылуу көмүрдөн баш тартуунун эң жакшы жолун тандап берет",
  ruleNote: "⚙️ Эрежелер боюнча иштейт — ачкыч жана акылуу API керек эмес, «Менин үйүм» калькуляторуна негизделген. Төмөндө өзүңүздүн LLMди туташтырсаңыз болот.",
  advHello: "Салам! Мен «Таза Аба» кеңешчисимин. 4 суроого жооп бериңиз, мен үйүңүз көмүрдөн кантип эң пайдалуу жол менен баш тарта аларын айтып берем.",
  qArea: "Үйүңүздүн аянты канча?", qWall: "Дубалдар эмнеден салынган?", qCoal: "Кышында канча көмүр жагасыз?", qBudget: "Канча каражат жумшоого даярсыз?",
  w_brick: "Кыш", w_adobe: "Саман", w_block: "Шлакоблок", w_wood: "Жыгач",
  bud1: "100 миңге чейин", bud2: "100–300 миң", bud3: "300–600 миң", bud4: "600 миңден ашык",
  recIntro: "Үйүңүз үчүн менин кеңешим: <b>{plan}</b>.",
  p_partial: "чатырды жана терезелерди жылуулоо (биринчи кадам)", p_insul: "үйдү толук жылуулоо", p_insul_pump: "жылуулоо + жылуулук насосу", p_insul_solar: "жылуулоо + күн панелдери",
  whyLow: "{b} бюджет менен эң арзан жана тез кадамдан баштаган оң: жылуулуктун үчтөн бирине чейини чатыр жана терезенин жылчыктары аркылуу чыгып кетет.",
  whyInsul: "Жылуулоо баарынан тез актанат, ал эми андан кийинки ар бир технология арзаныраак жана натыйжалуураак болот.",
  whyPump: "Бюджетиңиз көмүрдөн толук баш тартууга жетет: адегенде үйдү жылуулайбыз, андан соң кубаттуулугу азыраак насос коёбуз. Бул жылуулук чыгып кеткен үйгө чоң насос коюудан арзан.",
  whySolar: "{cityPrep} күн ачык күндөр көп: панелдер жайында үйдү электр менен камсыз кылып, кышында жылытууга жардам берет.",
  wn_brick: "Жылуулоосуз кыш дубалдар тез муздайт, фасадды жылуулоо байкаларлык натыйжа берет.",
  wn_adobe: "Саман дубалдар жылуулукту жакшы кармайт, ошондуктан негизгиси — чатыр, терезе жана пол.",
  wn_block: "Шлакоблок жылуулукту начар кармайт, дубалды жылуулоо эң чоң натыйжа берет.",
  wn_wood: "Жыгач үйдү сыртынан да, ичинен да жылуулоого болот, буу изоляциясын унутпаңыз.",
  numbers: "Сандар:", n_cost: "💰 Баасы: {v}", n_save: "📉 Үнөм: жылына {v}", n_pay: "⏳ Актануу: {v}", n_coal: "⚫ Жылына {v} т көмүр аз ({p}%)", n_trees: "🌳 {v} дарак отургузгандай",
  stepsHdr: "Кадам-кадам план:",
  s_partial: ["Чатырды же шыпты 150–200 мм минвата менен жылуулоо", "Терезе жана эшиктердин жылчыктарын бекитип, тыгыздагыч коюу", "Жылуу пардаларды илип, радиатордун артына экран коюу", "«Бирге арзан» тобуна кошулуп, дубалды жылуулоого каражат топтоо"],
  s_insul: ["Энергоаудит: жылуулук кайдан чыгып жатканын аныктоо (мисалы, тепловизор менен)", "Чатыр менен полду жылуулоо", "Дубалдарды сыртынан 100 мм минвата менен жылуулоо", "Эски терезелерди эки камералуу стеклопакеттерге алмаштыруу"],
  s_insul_pump: ["Чатырды, дубалдарды жана терезелерди жылуулоо", "Жаңы, азайган жүктөмгө ылайык аба-суу жылуулук насосун тандоо", "Насосту жылуу пол же төмөн температуралуу радиаторлор менен орнотуу", "Көмүр казанын алып салып, «Таза үй» бейджин алуу 🏡"],
  s_insul_solar: ["Чатырды, дубалдарды жана терезелерди жылуулоо", "Чатырдын түштүк тарабына {kw} кВт күн панелдерин орнотуу", "Жылытуу үчүн 2 инвертордук кондиционер коюу", "Мешти катуу суукта гана жагуу"],
  
  apply: "«Менин үйүмө» колдонуу", restart: "Кайра баштоо", applied: "Маалымат «Менин үйүмө» өткөрүлдү ✓", askPh: "Бир нерсе сураңыз…",
  a_credit: "Кыргызстандагы көп банктар жылуулоо жана күн панелдери үчүн «жашыл» насыя беришет. Айлык төлөм көбүнчө азыр көмүргө короткон акчаңыз менен барабар болот.",
  a_start: "Чатыр менен терезелерди жылуулоодон баштаңыз: бул эң арзан кадам жана ушул эле кышта 20% чейин үнөм берет.",
  a_pay: "Сиздин маалыматыңыз боюнча {plan} болжол менен {y} ичинде актанат.", a_first: "Адегенде жогорудагы 4 суроого жооп бериңиз 🙂",
  a_fallback: "Мен эрежелер боюнча иштейм жана насыя, актануу жана «эмнеден баштоо керек» деген суроолорду түшүнөм. Эркин маек үчүн төмөндөгү жөндөөлөрдөн LLM ачкычын туташтырыңыз.",
  llmTitle: "🔑 LLM туташтыруу (милдеттүү эмес)", llmNote: "OpenAI менен шайкеш API. Ачкыч ушул браузерде гана (localStorage) сакталат жана көрсөтүлгөн дарекке гана жөнөтүлөт.",
  baseUrl: "API дареги", model: "Модель", apiKey: "API ачкычы", saveBtn: "Сактоо", clearBtn: "Ачкычты өчүрүү", llmSaved: "LLM жөндөөлөрү сакталды",
  llmOn: "LLM туташты: эркин суроолор моделге жөнөтүлөт", llmErr: "LLM жооп берген жок ({e}). Эрежелер боюнча жооп берем:",
  cat_insul: "Жылуулагыч + орнотуу, м² үчүн", cat_solar: "5 кВт күн панелдеринин комплекти", cat_pump: "Орнотуусу менен жылуулук насосу", cat_trees: "Көчөт + отургузуу",
  cs_insul: "жылуулагыч", cs_solar: "күн панелдери", cs_pump: "жылуулук насостору", cs_trees: "дарактар",
  u_insul: "м²", u_solar: "комплект", u_pump: "даана", u_trees: "дарак",
  days: ["Жш", "Дш", "Шш", "Шр", "Бш", "Жм", "Иш"],
},
en: {
  brandSub: "clean air for {city}", live: "Live", demo: "Demo",
  tab_home: "Home", tab_map: "Map", tab_house: "My home", tab_advisor: "Advisor", tab_profile: "Profile",
  loading: "Loading air quality data…", loadingSub: "Open-Meteo · {city}", district: "District",
  dayAdvice: "Tip of the day", forecast3: "3-day forecast", tomorrow: "Tomorrow", dayAfter: "Day after",
  peakNote: "Peak = the dirtiest hour (hourly PM2.5); “avg” = AQI from the 24-hour mean PM2.5; CAMS model.", hourNote: "Bars show PM2.5 for each hour (CAMS model), so the best hour and the evening peak are visible. The big model AQI number at the top uses the past 24-hour average (like the EPA daily AQI) and changes more smoothly.", avg: "avg", todayHourly: "Today by hour",
  bestTime: "🌿 Best time for a walk", peakSmog: "🔥 Smog peak",
  coalTip: "{p}% of homes {in} still burn coal", coalTipSub: "See how much you'd save by switching to clean heat.", calcBtn: "Calculate for my home →",
  footLive: "Data: CAMS model via {link}, updated {t}. District values = model × district factor (estimate).",
  footDemo: "⚠️ No data: no connection to Open-Meteo. Check your internet and tap “Retry”.", footProto: "SolarPunk hackathon prototype · Bishkek 2026",
  mapTitle: "Smog map", mapSub: "Air quality across {city} districts",
  layerSmog: "💨 Smog by district", demoChip: "demo", districtsList: "🏙️ Districts: dirtiest to cleanest",
  coalShareNote: "🔥 — share of homes on coal (demo estimate)", popupCoal: "Homes on coal", demoData: "demo data",
  houseTitle: "My home", houseSub: "How much you'll save by quitting coal",
  areaLbl: "🏠 House area, m²", coalLbl: "⚫ Coal per winter, t", priceLbl: "💰 Price per tonne, som", 
  advisorCta: "🤖 Not sure what to choose? Ask the AI advisor", nowCoal: "🔥 Now, on coal", perWinter: "per winter",
  spend: "Spending", pmDust: "PM2.5 dust", likeCar: "Like a car", yearsN: "{n} yrs",
  likeCarNote: "“Like a car” — years of driving a car (~2 t CO₂/yr) to emit the same amount.",
  threePaths: "🌱 Three paths to clean heat", fastest: "⭐ Fastest payback",
  o_solar: "Solar panels", o_pump: "Heat pump", o_insul: "Insulation",
  d_solar: "{kw} kW panels + 2 heating air-conditioners", d_pump: "Air-to-water, fully coal-free", d_insul: "Walls, attic, windows — 40% less coal",
  cost: "Cost", savingsYr: "Savings / year", payback: "Payback", lessCoal: "Less coal", tPerYr: "{n} t/yr",
  lessCO2pm: "Less CO₂ / PM2.5", likePlant: "Like planting", treesN: "🌳 {n} trees", myPlan: "✓ My plan", choosePlan: "Choose this plan",
  planSaved: "Plan saved to your profile 🌱", t: "t", kg: "kg", som: "som",
  howTitle: "ℹ️ How we calculate",
  how: ["1 t of coal ≈ 2.9 MWh of heat in the home (calorific value ~18.8 GJ/t, stove efficiency ~55%).",
    "1 t of coal = ~1.8 t CO₂ and ~6 kg of fine PM2.5 dust (the main cause of smog).",
    "Electricity: ~2 som/kWh; Kyrgyzstan's grid is almost clean (~90% hydro).",
    "Insulation: ~1,100 som per m² of house, 40% less heat needed.",
    "Heat pump: 180,000 som + 1,800 som/m², COP ~2.7 in winter.",
    "Solar: ~48,000 som per kW, ~{pvY} kWh/kW per year in {city} (estimate), plus 2 heating air-conditioners cover half the heat.",
    "1 tree absorbs ~22 kg CO₂ per year.", "This is an estimate for comparing options, not a commercial offer."],
  
  create: "＋ Create", allDistricts: "All districts",
  until: "until {d}", 
  per: "per {u}", 
  
  
  
  titleLbl: "Title", cancel: "Cancel", 
  
  planLbl: "plan: {p}", badgeName: "“Clean Home”", badgeOn: "Your home is heated without coal. Thank you for protecting {city}'s air!",
  badgeOff: "Switch to clean heating to earn this badge", unmark: "Undo", mark: "✓ I've switched to clean heat",
  badgeToast: "“Clean Home” badge earned! 🏡", myImpact: "🌍 My yearly impact", coalNotBurned: "⚫ Coal not burned", lessCO2: "💨 Less CO₂",
  lessPM: "💨 Less PM2.5", likeTrees: "🌳 Equal to trees", familySave: "💰 Family savings per year", badgesT: "🏅 Badges",
  b1: "Clean Home", b3: "Did the Math", b4: "100 Trees", 
  you: "you", nameLbl: "Name", myDistrict: "My district", reset: "Reset demo data", resetToast: "Demo data reset",
  profileFoot: "Profile and badges are local. Data stays on this device only.", defaultName: "Bishkek resident",
  alertsTitle: "🔔 Smog alerts", alertsSub: "We'll warn you in advance if tomorrow's air will be bad", alertsOn: "Enable alerts",
  alertDistrict: "District to watch", threshold: "AQI threshold", th50: "50 — very sensitive (almost daily in winter)", testBtn: "🔔 Test notification",
  permGranted: "Browser notifications allowed ✓", permDenied: "Browser blocked notifications — we'll show them inside the app",
  permUnsupported: "This browser doesn't support notifications — we'll show them inside the app",
  tomorrowFc: "Tomorrow's forecast {in}: up to {aqi} AQI", checkNote: "We check the Open-Meteo forecast every 30 minutes while the app is open.",
  alertTitle: "Taza Aba · smog", alertBody: "Smog tomorrow {in}: AQI up to {aqi}. Close the windows and wear a mask.", testPrefix: "Test: ",
  advTitle: "AI advisor", advSub: "Finds the best way to quit coal in 4 questions",
  ruleNote: "⚙️ Rule-based: no keys or paid APIs, built on the “My home” calculator. You can connect your own LLM below.",
  advHello: "Salam! I'm the Taza Aba advisor. Answer 4 questions and I'll show you the most cost-effective way for your home to quit coal.",
  qArea: "How big is your home?", qWall: "What are the walls made of?", qCoal: "How much coal do you burn per winter?", qBudget: "What budget can you invest?",
  w_brick: "Brick", w_adobe: "Adobe", w_block: "Cinder block", w_wood: "Wood",
  bud1: "under 100k", bud2: "100–300k", bud3: "300–600k", bud4: "over 600k",
  recIntro: "My recommendation for your home: <b>{plan}</b>.",
  p_partial: "attic & window insulation (first step)", p_insul: "full home insulation", p_insul_pump: "insulation + heat pump", p_insul_solar: "insulation + solar panels",
  whyLow: "With a budget of {b}, start with the cheapest, fastest step: up to a third of the heat escapes through the attic and window gaps.",
  whyInsul: "Insulation pays back fastest, and every technology you add after it becomes cheaper and more effective.",
  whyPump: "Your budget lets you quit coal completely: insulate first, then install a smaller heat pump. That's cheaper than one big pump for a leaky house.",
  whySolar: "{city} gets plenty of sunny days: panels power the home in summer and help with heating in winter.",
  wn_brick: "Uninsulated brick walls cool down quickly, so facade insulation makes a clear difference.",
  wn_adobe: "Adobe walls already hold heat fairly well, so focus on the roof, windows and floor.",
  wn_block: "Cinder block holds heat poorly, so wall insulation gives the biggest effect.",
  wn_wood: "Wooden houses insulate well inside and out; just don't forget a vapour barrier.",
  numbers: "The numbers:", n_cost: "💰 Cost: {v}", n_save: "📉 Savings: {v} per year", n_pay: "⏳ Payback: {v}", n_coal: "⚫ {v} t less coal per year ({p}%)", n_trees: "🌳 Like planting {v} trees",
  stepsHdr: "Step-by-step plan:",
  s_partial: ["Insulate the attic or ceiling with 150–200 mm mineral wool", "Seal gaps in windows and doors, fit weatherstrips", "Hang thermal curtains and a reflector behind radiators", "Join “Cheaper Together” and save up for wall insulation"],
  s_insul: ["Energy audit: find where heat escapes (e.g. with a thermal camera)", "Insulate the attic and floor", "Insulate the outside walls with 100 mm mineral wool", "Replace old windows with double-chamber glazing"],
  s_insul_pump: ["Insulate the attic, walls and windows", "Choose an air-to-water heat pump sized for the new, lower load", "Install the pump with underfloor heating or low-temperature radiators", "Remove the coal boiler and earn the “Clean Home” badge 🏡"],
  s_insul_solar: ["Insulate the attic, walls and windows", "Install {kw} kW of solar panels on the south side of the roof", "Install 2 inverter air-conditioners for heating", "Use the stove only during hard frosts"],
  
  apply: "Apply to “My home”", restart: "Start over", applied: "Copied to “My home” ✓", askPh: "Ask something…",
  a_credit: "Many banks in Kyrgyzstan offer “green” loans for insulation and solar panels. The monthly payment is often similar to what you now spend on coal.",
  a_start: "Start with the attic and windows: it's the cheapest step and saves up to 20% this very winter.",
  a_pay: "With your numbers, {plan} pays back in about {y}.", a_first: "Please answer the 4 questions above first 🙂",
  a_fallback: "I'm rule-based and understand questions about loans, payback and where to start. For free-form chat, connect an LLM key in the settings below.",
  llmTitle: "🔑 Connect an LLM (optional)", llmNote: "OpenAI-compatible API. The key is stored only in this browser (localStorage) and sent only to the URL you set.",
  baseUrl: "API base URL", model: "Model", apiKey: "API key", saveBtn: "Save", clearBtn: "Remove key", llmSaved: "LLM settings saved",
  llmOn: "LLM connected: free-form questions go to the model", llmErr: "The LLM didn't respond ({e}). Rule-based answer:",
  cat_insul: "Insulation + installation, per m²", cat_solar: "5 kW solar panel kit", cat_pump: "Heat pump with installation", cat_trees: "Sapling + planting",
  cs_insul: "insulation", cs_solar: "solar panels", cs_pump: "heat pumps", cs_trees: "trees",
  u_insul: "m²", u_solar: "kit", u_pump: "pcs", u_trees: "tree",
  days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
},
};

/* t("key", {vars}) — {In} подставляет значение {in} с заглавной буквы. */
function t(key, vars = {}) {
  if (typeof CITY_VARS === "function") vars = Object.assign(CITY_VARS(), vars);
  let s = (DICT[LANG] && DICT[LANG][key]) ?? DICT.ru[key] ?? key;
  const sub = x => x.replace(/\{(\w+)\}/g, (_, k) => {
    if (k === "In" && vars.in != null) return String(vars.in).charAt(0).toUpperCase() + String(vars.in).slice(1);
    return vars[k] ?? "";
  });
  if (Array.isArray(s)) return s.map(x => typeof x === "string" ? sub(x) : x);   // списки (например «Как считаем») тоже с подстановкой
  if (typeof s !== "string") return s;
  return sub(s);
}
/* tr({ru, ky, en}) — выбрать перевод для поля данных. */
const tr = o => (o && typeof o === "object" && !Array.isArray(o)) ? (o[LANG] ?? o.ru) : o;
// SEO: заголовок, описание и canonical на языке интерфейса
const SEO = {
  ru: { t: "Таза Аба — качество воздуха и смог в Бишкеке, AQI Кыргызстана", d: "Качество воздуха в Бишкеке и 39 городах Кыргызстана: AQI по районам, прогноз смога, PM2.5, эко-маршруты, ИИ-советник по здоровью. Бесплатно, 4 языка." },
  ky: { t: "Таза Аба — Бишкектеги абанын сапаты жана түтүн, AQI Кыргызстан", d: "Бишкекте жана Кыргызстандын 39 шаарында абанын сапаты: райондор боюнча AQI, түтүн (смог) божомолу, PM2.5, эко-маршруттар, ЖИ-кеңешчи. Акысыз." },
  en: { t: "Taza Aba — Bishkek air quality & smog, live AQI for Kyrgyzstan", d: "Air quality in Bishkek and 39 cities of Kyrgyzstan: AQI by district, smog forecast, PM2.5, eco-routes and a free AI health advisor. 4 languages." },
};
function applySeo() {
  try {
    const s = SEO[LANG] || SEO.ru, H = document.head;
    document.title = s.t;
    const set = (sel, attr, v) => { const e = H.querySelector(sel); if (e) e.setAttribute(attr, v); };
    set('meta[name="description"]', "content", s.d);
    set('meta[property="og:title"]', "content", s.t); set('meta[property="og:description"]', "content", s.d);
    set('meta[name="twitter:title"]', "content", s.t); set('meta[name="twitter:description"]', "content", s.d);
    set('meta[property="og:locale"]', "content", { ru: "ru_RU", ky: "ky_KG", en: "en_US" }[LANG] || "ru_RU");
    // canonical: язык из ссылки ?lang= — на свою версию; без параметра — корень
    const ql = new URLSearchParams(location.search).get("lang");
    set('link[rel="canonical"]', "href", "https://zusenbaev7-cmd.github.io/taza-aba/" + (SEO[ql] ? "?lang=" + ql : ""));
  } catch (e) {}
}
function setLang(l) { try { const u = new URL(location.href); if (u.searchParams.has("lang")) { u.searchParams.set("lang", l); history.replaceState(history.state, "", u); } } catch (e) {} LANG = l; localStorage.setItem("tazaAba.lang", l); document.documentElement.lang = l === "ky" ? "ky" : l; }

/* Ещё / Жалобы / Эко-маршруты / быстрые действия */
Object.assign(DICT.ru, {
  tab_more: "Ещё", moreTitle: "Ещё", moreSub: "Все разделы «Таза Аба»",
  m_profile: "Профиль и бейджи", m_profileSub: "Мой вклад и бейджи", m_complaints: "Жалобы", m_complaintsSub: "Сообщить о дыме или сжигании мусора",
  m_routes: "Эко-маршруты", m_routesSub: "Чистые пути через парки", m_alerts: "Уведомления о смоге", m_alertsSub: "Предупреждение заранее",
  tgAlert: "Telegram-алерты", tgAlertSub: "Сообщение в Telegram, когда AQI в районе выше порога — даже если вкладка закрыта.", tgAlertGo: "Подписаться в Telegram", tgAlertHint: "Откроется Telegram. Нажмите Start — подписка на выбранный выше район.",
  quick: "⚡ Быстрые действия", q_complain: "Жалоба", q_routes: "Маршруты", q_advisor: "Советник", q_alerts: "Уведом­ления",
  cTitle: "Жалобы", cSub: "Увидели чёрный дым из трубы или горящий мусор? Сообщите — соседи и службы узнают.",
  cPhoto: "📷 Сделать или загрузить фото", cPhotoChange: "📷 Заменить фото", cCategory: "Что происходит?",
  cat_c_chimney: "Чёрный дым из трубы", cat_c_trash: "Сжигание мусора", cat_c_dump: "Свалка", cat_c_car: "Дымящий транспорт", cat_c_factory: "Выброс предприятия",
  cDesc: "Комментарий", cDescPh: "Например: каждый вечер жгут резину во дворе", cPlace: "Где это? Нажмите на карту",
  cGeo: "📍 Моё местоположение", cGeoErr: "Не удалось определить местоположение — отметьте точку на карте", cNoPoint: "Отметьте место на карте",
  cSubmit: "Отправить жалобу", cSent: "Жалоба отправлена! Передаём в службы (демо) 📨",
  cList: "📋 Последние жалобы", cStatusSent: "Отправлено", cStatusFwd: "Передано в мэрию и экоинспекцию (демо)", cStatusDone: "Проверено, нарушение устранено (демо)",
  cMock: "Передача в службы — имитация для прототипа. Демо-жалобы и статусы выдуманы. Ваши жалобы сохраняются на этом устройстве.",
  cMine: "моя", layerComplaints: "⚠️ Жалобы", cDelete: "Удалить",
  rTitle: "Эко-маршруты", rSub: "Чистые пешие и велосипедные пути через парки и зелёные зоны, в обход загруженных магистралей",
  rWalk: "🚶 Пешком", rBike: "🚲 Велосипед", rKm: "{n} км", rMin: "{n} мин", rCO2: "−{n} кг CO₂ vs авто", rAir: "Воздух на маршруте: AQI {aqi}",
  rShow: "Показать на карте", rDemo: "Маршруты проложены вручную по паркам и бульварам. CO₂ считаем как ~170 г на км для легкового авто.",
  rBest: "🌿 Чище всего сейчас", rAvoid: "Обходит: {s}", layerRoutes: "🌳 Эко-маршруты", rTotal: "Пройдите все маршруты — сэкономите {n} кг CO₂",
});
Object.assign(DICT.ky, {
  tab_more: "Дагы", moreTitle: "Дагы", moreSub: "«Таза Аба» бөлүмдөрүнүн баары",
  m_profile: "Профиль жана бейджилер", m_profileSub: "Менин салымым жана бейджилер", m_complaints: "Арыздар", m_complaintsSub: "Түтүн же таштанды өрттөө тууралуу кабарлоо",
  m_routes: "Эко-маршруттар", m_routesSub: "Парктар аркылуу таза жолдор", m_alerts: "Смог эскертүүлөрү", m_alertsSub: "Алдын ала эскертүү",
  tgAlert: "Telegram эскертүүлөрү", tgAlertSub: "Райондун AQI босогодон жогору болгондо Telegram билдирүүсү — вкладка жабык болсо да.", tgAlertGo: "Telegram'га жазылуу", tgAlertHint: "Telegram ачылат. Start басыңыз — жогоруда тандалган районго жазыласыз.",
  quick: "⚡ Тез аракеттер", q_complain: "Арыз", q_routes: "Маршрут­тар", q_advisor: "Кеңешчи", q_alerts: "Эскер­түүлөр",
  cTitle: "Арыздар", cSub: "Мордон кара түтүн чыгып же таштанды күйүп жатканын көрдүңүзбү? Кабарлаңыз — коңшулар жана тиешелүү кызматтар билишет.",
  cPhoto: "📷 Сүрөткө тартуу же жүктөө", cPhotoChange: "📷 Сүрөттү алмаштыруу", cCategory: "Эмне болуп жатат?",
  cat_c_chimney: "Мордон кара түтүн", cat_c_trash: "Таштанды өрттөө", cat_c_dump: "Таштанды үйүндүсү", cat_c_car: "Түтүн чыгарган унаа", cat_c_factory: "Ишкананын булгоосу",
  cDesc: "Комментарий", cDescPh: "Мисалы: ар кечте короодо резина өрттөшөт", cPlace: "Бул кайда? Картаны басыңыз",
  cGeo: "📍 Менин жайгашкан жерим", cGeoErr: "Жайгашкан жериңизди аныктай алган жокпуз — картадан белгилеңиз", cNoPoint: "Картадан жерди белгилеңиз",
  cSubmit: "Арызды жөнөтүү", cSent: "Арыз жөнөтүлдү! Тиешелүү кызматтарга өткөрөбүз (демо) 📨",
  cList: "📋 Акыркы арыздар", cStatusSent: "Жөнөтүлдү", cStatusFwd: "Мэрияга жана экоинспекцияга өткөрүлдү (демо)", cStatusDone: "Текшерилди, бузуу четтетилди (демо)",
  cMock: "Кызматтарга өткөрүү — прототип үчүн имитация. Демо-арыздар жана алардын статустары ойдон чыгарылган. Сиздин арыздарыңыз ушул түзмөктө сакталат.",
  cMine: "меники", layerComplaints: "⚠️ Арыздар", cDelete: "Өчүрүү",
  rTitle: "Эко-маршруттар", rSub: "Парктар жана жашыл аймактар аркылуу, жүгү көп көчөлөрдү айланып өткөн таза жөө жана велосипед жолдору",
  rWalk: "🚶 Жөө", rBike: "🚲 Велосипед", rKm: "{n} км", rMin: "{n} мүн", rCO2: "унаага салыштырмалуу −{n} кг CO₂", rAir: "Маршруттагы аба: AQI {aqi}",
  rShow: "Картадан көрсөтүү", rDemo: "Маршруттар парктар жана бульварлар боюнча кол менен түзүлгөн. CO₂ жеңил унаа үчүн ~170 г/км деп эсептелет.",
  rBest: "🌿 Азыр эң таза", rAvoid: "Айланып өтөт: {s}", layerRoutes: "🌳 Эко-маршруттар", rTotal: "Бардык маршруттарды басып өтсөңүз, {n} кг CO₂ үнөмдөйсүз",
});
Object.assign(DICT.en, {
  tab_more: "More", moreTitle: "More", moreSub: "All Taza Aba sections",
  m_profile: "Profile & badges", m_profileSub: "My impact and badges", m_complaints: "Complaints", m_complaintsSub: "Report smoke or burning trash",
  m_routes: "Eco-routes", m_routesSub: "Clean paths through parks", m_alerts: "Smog alerts", m_alertsSub: "Get warned in advance",
  tgAlert: "Telegram alerts", tgAlertSub: "A Telegram message when district AQI is above the threshold — even with the tab closed.", tgAlertGo: "Subscribe in Telegram", tgAlertHint: "Telegram will open. Tap Start to subscribe to the district selected above.",
  quick: "⚡ Quick actions", q_complain: "Report", q_routes: "Routes", q_advisor: "Advisor", q_alerts: "Alerts",
  cTitle: "Complaints", cSub: "Seen black smoke from a chimney or burning trash? Report it so neighbours and city services know.",
  cPhoto: "📷 Take or upload a photo", cPhotoChange: "📷 Replace photo", cCategory: "What's happening?",
  cat_c_chimney: "Black chimney smoke", cat_c_trash: "Trash burning", cat_c_dump: "Illegal dump", cat_c_car: "Smoky vehicle", cat_c_factory: "Industrial emission",
  cDesc: "Comment", cDescPh: "E.g. they burn tyres in the yard every evening", cPlace: "Where is it? Tap the map",
  cGeo: "📍 My location", cGeoErr: "Couldn't get your location — tap the map instead", cNoPoint: "Mark the place on the map",
  cSubmit: "Send complaint", cSent: "Complaint sent! Forwarding to city services (demo) 📨",
  cList: "📋 Latest complaints", cStatusSent: "Sent", cStatusFwd: "Forwarded to City Hall & eco-inspection (demo)", cStatusDone: "Checked, violation fixed (demo)",
  cMock: "Forwarding to services is a mock for the prototype. Demo complaints and statuses are made up. Your complaints are saved on this device.",
  cMine: "mine", layerComplaints: "⚠️ Complaints", cDelete: "Delete",
  rTitle: "Eco-routes", rSub: "Clean walking and cycling paths through parks and green areas, avoiding busy roads",
  rWalk: "🚶 Walk", rBike: "🚲 Bike", rKm: "{n} km", rMin: "{n} min", rCO2: "−{n} kg CO₂ vs car", rAir: "Air on route: AQI {aqi}",
  rShow: "Show on map", rDemo: "Routes are drawn by hand along parks and boulevards. CO₂ assumes ~170 g per km for a car.",
  rBest: "🌿 Cleanest right now", rAvoid: "Avoids: {s}", layerRoutes: "🌳 Eco-routes", rTotal: "Do all routes and save {n} kg CO₂",
});

Object.assign(DICT.ru, { cityChanged: "Город: {city} 🏔️" });
Object.assign(DICT.ky, { cityChanged: "Шаар: {city} 🏔️" });
Object.assign(DICT.en, { cityChanged: "City: {city} 🏔️" });
Object.assign(DICT.ru, { countryBtn: "🇰🇬 Вся страна", countryTitle: "Воздух в Кыргызстане", countrySub: "Нажмите на город — приложение переключится на него",
  citiesList: "🏙️ Города: от грязного к чистому", countryNote: "AQI — модель CAMS для центра каждого города (Open-Meteo). Районы и маршруты новых городов — демо, названия массивов условные.",
  countryDemo: "⚠️ Нет данных: нет связи с Open-Meteo.", openCity: "Открыть", cityLbl: "Город", backToCity: "🏙️ {city}" });
Object.assign(DICT.ky, { countryBtn: "🇰🇬 Бүт өлкө", countryTitle: "Кыргызстандагы аба", countrySub: "Шаарды басыңыз — колдонмо ошол шаарга өтөт",
  citiesList: "🏙️ Шаарлар: эң кирдүүдөн эң тазага", countryNote: "AQI — ар бир шаардын борбору үчүн CAMS модели (Open-Meteo). Жаңы шаарлардын райондору жана маршруттары — демо, массивдердин аттары шарттуу.",
  countryDemo: "⚠️ Маалымат жок: Open-Meteo менен байланыш жок.", openCity: "Ачуу", cityLbl: "Шаар", backToCity: "🏙️ {city}" });
Object.assign(DICT.en, { countryBtn: "🇰🇬 Whole country", countryTitle: "Air across Kyrgyzstan", countrySub: "Tap a city and the app switches to it",
  citiesList: "🏙️ Cities: dirtiest to cleanest", countryNote: "AQI = CAMS model for each city centre (Open-Meteo). Districts and routes for the new cities are demo; area names are approximate.",
  countryDemo: "⚠️ No data: no connection to Open-Meteo.", openCity: "Open", cityLbl: "City", backToCity: "🏙️ {city}" });
