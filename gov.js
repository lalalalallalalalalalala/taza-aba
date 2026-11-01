/* «Для мэрии и государства» — панель решений, прогноз смога, жалобы, экспорт открытых данных и страница мер.
 * Данные: Open-Meteo Air Quality (модель CAMS) по координатам районов, past_days=30, forecast_days=2. Без выдуманных чисел:
 * всё, что показано, посчитано из ответа API; вклад отопления/транспорта — помеченная оценка (tfEstimate из features.js). */
"use strict";
const GV_S = {
ru: { gridNote: "Важно: разрешение модели CAMS — около 11 км в европейской зоне и около 40 км в остальных регионах (включая Кыргызстан), поэтому соседние районы часто попадают в одну ячейку и получают одинаковые значения. Здесь модель различает {zw} на {n} районов. Колонка «Сейчас» может учитывать ближайшие датчики. Для решений по отдельным районам нужны наземные датчики.", title: "Для мэрии и государства", sub: "Панель решений по {city}: данные модели CAMS (Open-Meteo) по каждому району — не измерения датчиков.",
  print: "Отчёт / PDF", csv: "CSV (30 дней)", json: "JSON", polLink: "Меры с доказанной пользой →", loading: "Считаю данные по районам…", err: "Не удалось загрузить данные Open-Meteo.", retry: "Повторить",
  tmrH: "Прогноз смога на завтра ({date})", tmrWorst: "Хуже всего: {d} — до AQI {a}", tmrCity: "Среднесуточный максимум по городу: AQI {a}", tmrSrc: "Прогноз CAMS (Copernicus) через Open-Meteo. Прогноз модели может ошибаться.",
  measH: "Рекомендуемые меры для этого уровня", measNote: "Рекомендации по шкале AQI (AirNow, US EPA) и ВОЗ по информированию о рисках. Это не нормативные акты; решения принимают уполномоченные органы.", copyWarn: "📋 Скопировать текст предупреждения", warnTxt: "Предупреждение о смоге на {date} ({city}): ожидается AQI до {a} — «{lvl}». Хуже всего: {d}.",
  kNow: "AQI сейчас (среднее по районам)", k7: "Средний AQI за 7 дней", k30: "Средний AQI за 30 дней", kH: "Часов с PM2.5 > 15 мкг/м³ (30 дн.)", kD: "Дней выше суточной нормы ВОЗ (30 дн.)",
  rankH: "Рейтинг районов (худшие сверху, по 30 дням)", cD: "Район", cNow: "Сейчас", c7: "7 дн.", c30: "30 дн.", cH: "Часы > ВОЗ", cT: "Завтра макс.",
  whoNote: "Норма ВОЗ (2021) для PM2.5: 15 мкг/м³ в среднем за сутки, 5 мкг/м³ за год. «Часы > ВОЗ» — часы, когда PM2.5 выше 15 мкг/м³ (ориентир, т.к. норма суточная).",
  contH: "Вклад отопления и транспорта (оценка)", contNote: "ОЦЕНКА, а не измерение: по суточному ходу NO₂, отношениям NO₂/PM2.5 и PM2.5/PM10 и температуре за 72 часа. Методика — раздел «Транспорт и смог».", heat: "Отопление", trans: "Транспорт", how: "Как считаем →",
  priH: "Приоритет районов для мер", priSub: "Где вмешательство даст больше пользы прямо сейчас — по прозрачной формуле.",
  fH: "Формула", fTxt: "Приоритет P = 100 × (0,5·a + 0,3·b + 0,2·c), где a — средний PM2.5 района за 30 дней, делённый на максимум по городу; b — доля часов с PM2.5 > 15 мкг/м³ за 30 дней; c — прогнозный максимум AQI на завтра, делённый на максимум по городу. Мера: «замена угля», если оценка вклада отопления ≥ 70 %; «автобусы / транспорт», если вклад транспорта ≥ 25 %; «деревья и пылеподавление», если PM2.5/PM10 < 0,55 (много крупной пыли).",
  mHeat: "Замена угля: тепловые насосы, газ, утепление", mBus: "Автобусы и чистый транспорт", mTree: "Деревья и пылеподавление", mNone: "Нет данных для оценки источника", pts: "балл",
  cmpH: "Жалобы жителей по районам", cmpNote: "Честно: у приложения нет сервера, поэтому здесь только жалобы, отправленные с этого устройства (примерные жалобы-образцы не учитываются). Для городской картины нужен общий приёмник жалоб.", cmpNone: "На этом устройстве пока нет жалоб по этому городу.", cmpAll: "Всего",
  expH: "Открытые данные", expTxt: "CSV/JSON: по каждому району и дню за 30 дней — средний и максимальный AQI, средний PM2.5, часы с PM2.5 > 15 мкг/м³ и зона модели (районы в одной ячейке модели получают одинаковые значения); в строке последнего дня — текущая медиана датчиков жителей Sensor.Community и их число (недорогие датчики без поверки), откуда взято значение района сейчас (датчики рядом / станция / модель CAMS) и расстояние до ближайшего датчика или станции, км. Данные: Open-Meteo (CC BY 4.0), модель CAMS (Copernicus).",
  repH: "Отчёт по качеству воздуха", repGen: "Сформировано {t} · Таза Аба", srcH: "Источники",
  meas: [["Ограничений не требуется.", "Хорошее время для занятий на улице."],
    ["Предупредить особо чувствительных людей (астма, болезни сердца).", "Ограничений для школ не требуется."],
    ["Школы и детсады: сократить долгие и интенсивные занятия на улице для детей с астмой и чувствительных детей.", "Опубликовать предупреждение для жителей и поликлиник.", "Призвать пользоваться общественным транспортом, не жечь мусор и листья."],
    ["Школы: перенести физкультуру и перемены в помещения.", "Перенести массовые мероприятия на улице.", "Усилить выпуск общественного транспорта, рейды против открытого сжигания мусора.", "Поликлиникам — готовность к росту обращений."],
    ["Отменить занятия детей на улице; всем — ограничить время на улице.", "Держать окна закрытыми, если снаружи хуже; использовать очистители воздуха в школах и больницах при наличии.", "Широкое оповещение: СМИ, SMS, Telegram."],
    ["Чрезвычайный уровень: максимально ограничить пребывание на улице, все занятия — в помещениях.", "Широкое оповещение и защита уязвимых групп в первую очередь."]],
  pTitle: "Меры с доказанной пользой", pSub: "Что рекомендуют международные исследования для городов Кыргызстана. Только опубликованные источники, со ссылками.",
  pTr: "Источники ниже — по Бишкеку и Кыргызстану.",
  p1H: "1. Замена угольного отопления", p1: "Главный зимний источник PM2.5 — бытовое отопление углём. ЮНИСЕФ (2023): дети в домах с угольными печами вдыхают в среднем на 17 мкг/м³ больше PM2.5 зимой; рекомендует зоны без угля, утепление окон, стен и крыш, стимулы для перехода. Всемирный банк (2023): 32,3 млн $ на кредиты домохозяйствам Бишкека для перехода на тепловые насосы, электрокотлы и солнечный нагрев (около 13 000 домов). АБР (2023): газ снижает загрязнение, но дороже в долгосрочной перспективе и сохраняет выбросы парниковых газов; приоритет — утепление, тепловые насосы и расширение центрального отопления.",
  p2H: "2. Система управления качеством воздуха", p2: "Всемирный банк (проект Air Quality Improvement, 2023): улучшение сбора и анализа данных о воздухе, усиление инспекций и межведомственной координации. ЮНИСЕФ: больше использовать научные данные о вреде загрязнения при принятии решений.",
  p3H: "3. Транспорт", p3: "ПРООН (2023): автотранспорт — крупнейший источник NOx в Бишкеке. Модельное исследование (журнал Air, 2024): транспорт — около 27 % PM2.5 за год, летом до ~30 %. Меры по сокращению выбросов транспорта (общественный транспорт, контроль выхлопа) направлены именно на этот источник.",
  p4H: "4. Озеленение", p4: "Всемирный банк (2023): пилотный «зелёный пояс», спроектированный для снижения загрязнения воздуха, и инвестиции в городской полив.",
  p5H: "5. Защита здоровья и раннее предупреждение", p5: "ВОЗ (2021): нормы PM2.5 — 15 мкг/м³ за сутки и 5 мкг/м³ за год. ВОЗ (2020): информирование о рисках и личные меры защиты в дни сильного загрязнения. ЮНИСЕФ (2023): 112 смертей и 3 568 лет здоровой жизни (DALY) потеряно в Бишкеке за июль 2021 – июнь 2022 из-за PM2.5; экономический ущерб — около 2 млрд сомов (24,9 млн $).",
  pitchH: "Как «Таза Аба» помогает государству", pitch: ["Прозрачность данных: AQI, PM2.5 и NO₂ по каждому району, открытая выгрузка CSV/JSON и печатный отчёт в один клик.", "Раннее предупреждение: прогноз смога на завтра (CAMS) с готовым текстом оповещения и мерами по уровням — его можно сразу переслать в Telegram, СМИ и чаты.", "Вовлечение граждан: жалобы с фото и геометкой, посадка деревьев, карта мест с чистым воздухом внутри.", "Бесплатно и без сервера: открытые источники, работает на телефоне, 3 языка (кыргызский, русский, английский)."],
  back: "← Панель решений" },
ky: { gridNote: "Маанилүү: CAMS моделинин тактыгы европалык зонада болжол менен 11 км, башка аймактарда (Кыргызстанды кошо) болжол менен 40 км, ошондуктан коңшу райондор көп учурда бир уячага түшүп, бирдей маани алышат. Бул жерде модель {n} районго {z} зонаны айырмалайт. «Азыр» мамычасы жакынкы датчиктерди эске алышы мүмкүн. Өзүнчө райондор боюнча чечим үчүн жердеги датчиктер керек.", title: "Мэрия жана мамлекет үчүн", sub: "{city} боюнча чечим панели: ар бир район боюнча CAMS моделинин маалыматы (Open-Meteo) — датчиктердин өлчөөсү эмес.",
  print: "Отчёт / PDF", csv: "CSV (30 күн)", json: "JSON", polLink: "Пайдасы далилденген чаралар →", loading: "Райондор боюнча маалымат эсептелүүдө…", err: "Open-Meteo маалыматын жүктөө мүмкүн болгон жок.", retry: "Кайталоо",
  tmrH: "Эртеңки түтүн божомолу ({date})", tmrWorst: "Эң начары: {d} — AQI {a} чейин", tmrCity: "Шаар боюнча орточо максимум: AQI {a}", tmrSrc: "CAMS (Copernicus) божомолу, Open-Meteo аркылуу. Модель жаңылышы мүмкүн.",
  measH: "Бул деңгээл үчүн сунушталган чаралар", measNote: "AQI шкаласы (AirNow, АКШ EPA) жана ДССУнун тобокелдик тууралуу маалымдоо боюнча сунуштары. Бул ченемдик актылар эмес; чечимди ыйгарым укуктуу органдар кабыл алат.", copyWarn: "📋 Эскертүү текстин көчүрүү", warnTxt: "{date} күнгө түтүн эскертүүсү ({city}): AQI {a} чейин күтүлөт — «{lvl}». Эң начары: {d}.",
  kNow: "Азыркы AQI (райондордун орточосу)", k7: "7 күндүк орточо AQI", k30: "30 күндүк орточо AQI", kH: "PM2.5 > 15 мкг/м³ болгон сааттар (30 күн)", kD: "ДССУнун суткалык ченеминен жогору күндөр (30 күн)",
  rankH: "Райондордун рейтинги (начарлары жогоруда, 30 күн)", cD: "Район", cNow: "Азыр", c7: "7 күн", c30: "30 күн", cH: "Саат > ДССУ", cT: "Эртең макс.",
  whoNote: "ДССУнун (2021) PM2.5 ченеми: суткасына орточо 15 мкг/м³, жылына 5 мкг/м³. «Саат > ДССУ» — PM2.5 15 мкг/м³тен жогору болгон сааттар (болжолдуу көрсөткүч, анткени ченем суткалык).",
  contH: "Жылытуу менен транспорттун үлүшү (баалоо)", contNote: "Бул БААЛОО, өлчөө эмес: 72 сааттагы NO₂ суткалык жүрүшү, NO₂/PM2.5 жана PM2.5/PM10 катыштары жана температура боюнча. Методика — «Транспорт жана түтүн» бөлүмүндө.", heat: "Жылытуу", trans: "Транспорт", how: "Кантип эсептейбиз →",
  priH: "Чаралар үчүн райондордун артыкчылыгы", priSub: "Азыр кайсы жерде чара көбүрөөк пайда берет — ачык формула боюнча.",
  fH: "Формула", fTxt: "Артыкчылык P = 100 × (0,5·a + 0,3·b + 0,2·c), мында a — райондун 30 күндүк орточо PM2.5, шаардагы максимумга бөлүнгөн; b — 30 күндө PM2.5 > 15 мкг/м³ болгон сааттардын үлүшү; c — эртеңки AQI божомолунун максимуму, шаардагы максимумга бөлүнгөн. Чара: жылытуунун баалоо үлүшү ≥ 70 % болсо — «көмүрдү алмаштыруу»; транспорттуку ≥ 25 % болсо — «автобустар / транспорт»; PM2.5/PM10 < 0,55 болсо (ири чаң көп) — «дарактар жана чаңды басуу».",
  mHeat: "Көмүрдү алмаштыруу: жылуулук насостору, газ, жылуулоо", mBus: "Автобустар жана таза транспорт", mTree: "Дарактар жана чаңды басуу", mNone: "Булакты баалоо үчүн маалымат жок", pts: "упай",
  cmpH: "Тургундардын даттануулары райондор боюнча", cmpNote: "Чынын айтканда: тиркеменин сервери жок, ошондуктан бул жерде ушул түзмөктөн жөнөтүлгөн даттануулар гана (үлгү даттануулар эсептелбейт). Шаардык сүрөт үчүн жалпы кабыл алгыч керек.", cmpNone: "Бул түзмөктө бул шаар боюнча азырынча даттануу жок.", cmpAll: "Бардыгы",
  expH: "Ачык маалымат", expTxt: "CSV/JSON: ар бир район жана 30 күндүн ар бир күнү боюнча — орточо жана максималдуу AQI, орточо PM2.5, PM2.5 > 15 мкг/м³ болгон сааттар жана модель зонасы (моделдин бир уячасындагы райондордо маанилер бирдей); акыркы күндүн сабында — Sensor.Community тургундарынын датчиктеринин азыркы медианасы жана саны (текшерүүсүз арзан датчиктер), райондун азыркы мааниси кайдан алынганы (жанындагы датчиктер / станция / CAMS модели) жана жакынкы датчикке же станцияга чейинки аралык, км. Маалымат: Open-Meteo (CC BY 4.0), CAMS модели (Copernicus).",
  repH: "Абанын сапаты боюнча отчёт", repGen: "Түзүлгөн убакыт {t} · Таза Аба", srcH: "Булактар",
  meas: [["Чектөө талап кылынбайт.", "Сыртта машыгууга жакшы убакыт."],
    ["Өтө сезгич адамдарга (астма, жүрөк оорулары) эскертүү.", "Мектептер үчүн чектөө талап кылынбайт."],
    ["Мектептер жана бала бакчалар: астмасы бар жана сезгич балдар үчүн сырттагы узак жана катуу машыгууларды кыскартуу.", "Тургундарга жана емканаларга эскертүү жарыялоо.", "Коомдук транспортту колдонууга, таштанды жана жалбырак өрттөбөөгө чакыруу."],
    ["Мектептер: дене тарбия жана тыныгууларды имаратка которуу.", "Сырттагы массалык иш-чараларды кийинкиге калтыруу.", "Коомдук транспортту көбөйтүү, таштандыны ачык өрттөөгө каршы рейддер.", "Емканалар кайрылуулардын көбөйүшүнө даяр болсун."],
    ["Балдардын сырттагы сабактарын жокко чыгаруу; бардыгына сыртта болууну чектөө.", "Сырт начар болсо терезелерди жабык кармоо; мүмкүн болсо мектеп жана ооруканаларда аба тазалагычтарды колдонуу.", "Кеңири кабарлоо: ЖМК, SMS, Telegram."],
    ["Өзгөчө деңгээл: сыртта болууну максималдуу чектөө, бардык сабактар — имаратта.", "Кеңири кабарлоо жана биринчи кезекте аялуу топторду коргоо."]],
  pTitle: "Пайдасы далилденген чаралар", pSub: "Эл аралык изилдөөлөр Кыргызстандын шаарларына эмнени сунуштайт. Шилтемелери менен жарыяланган булактар гана.",
  pTr: "Төмөнкү булактар Бишкек жана Кыргызстан боюнча.",
  p1H: "1. Көмүр менен жылытууну алмаштыруу", p1: "Кышкы PM2.5тин башкы булагы — үйлөрдү көмүр менен жылытуу. ЮНИСЕФ (2023): көмүр меши бар үйлөрдөгү балдар кышында орточо 17 мкг/м³ көбүрөөк PM2.5 жутушат; көмүрсүз зоналарды, терезе, дубал жана чатырды жылуулоону, өтүүгө түрткү берүүнү сунуштайт. Дүйнөлүк банк (2023): Бишкектин үй чарбаларына жылуулук насосторуна, электр казандарына жана күн жылыткычтарына өтүү үчүн 32,3 млн $ насыя (13 000ге жакын үй). АӨБ (2023): газ булганууну азайтат, бирок узак мөөнөттө кымбатыраак жана парник газдарын чыгара берет; артыкчылык — жылуулоо, жылуулук насостору жана борбордук жылытууну кеңейтүү.",
  p2H: "2. Абанын сапатын башкаруу системасы", p2: "Дүйнөлүк банк (Air Quality Improvement долбоору, 2023): аба тууралуу маалыматты чогултууну жана талдоону жакшыртуу, текшерүүлөрдү жана ведомстволор аралык координацияны күчөтүү. ЮНИСЕФ: чечим кабыл алууда булгануунун зыяны тууралуу илимий маалыматты көбүрөөк колдонуу.",
  p3H: "3. Транспорт", p3: "БУУӨП (2023): автотранспорт — Бишкекте NOxтун эң ири булагы. Моделдик изилдөө (Air журналы, 2024): транспорт — жылына PM2.5тин 27 %га жакыны, жайында ~30 %га чейин. Транспорттун чыгындыларын азайтуу чаралары (коомдук транспорт, түтүндү текшерүү) дал ушул булакка багытталган.",
  p4H: "4. Жашылдандыруу", p4: "Дүйнөлүк банк (2023): абанын булганышын азайтуу үчүн долбоорлонгон пилоттук «жашыл алкак» жана шаардык сугатка инвестициялар.",
  p5H: "5. Ден соолукту коргоо жана алдын ала эскертүү", p5: "ДССУ (2021): PM2.5 ченемдери — суткасына 15 мкг/м³, жылына 5 мкг/м³. ДССУ (2020): катуу булганган күндөрү тобокелдик тууралуу маалымдоо жана жеке коргонуу чаралары. ЮНИСЕФ (2023): 2021-жылдын июлу – 2022-жылдын июну аралыгында Бишкекте PM2.5тен улам 112 өлүм жана 3 568 дени сак жашоо жылы (DALY) жоголгон; экономикалык зыян — 2 млрд сомго жакын (24,9 млн $).",
  pitchH: "«Таза Аба» мамлекетке кантип жардам берет", pitch: ["Маалыматтын ачыктыгы: ар бир район боюнча AQI, PM2.5 жана NO₂, ачык CSV/JSON жүктөө жана бир басуу менен басма отчёт.", "Алдын ала эскертүү: эртеңки түтүн божомолу (CAMS), даяр эскертүү тексти жана деңгээлдер боюнча чаралар — аны дароо Telegram'га, ЖМКга жана чаттарга жөнөтсө болот.", "Жарандарды тартуу: сүрөт жана геобелги менен даттануулар, дарак отургузуу, ичинде абасы таза жерлердин картасы.", "Акысыз жана серверсиз: ачык булактар, телефондо иштейт, 3 тил (кыргыз, орус, англис)."],
  back: "← Чечим панели" },
en: { gridNote: "Important: the CAMS model resolution is about 11 km in the European domain and about 40 km elsewhere (including Kyrgyzstan), so neighbouring districts often fall into the same grid cell and get identical values. Here the model distinguishes {zw} across {n} districts. The \"Now\" column may include nearby sensors. District-level decisions need ground sensors.", title: "For city hall & government", sub: "Decision dashboard for {city}: CAMS model data (Open-Meteo) for every district — not sensor measurements.",
  print: "Report / PDF", csv: "CSV (30 days)", json: "JSON", polLink: "Evidence-based measures →", loading: "Crunching district data…", err: "Couldn't load Open-Meteo data.", retry: "Retry",
  tmrH: "Smog forecast for tomorrow ({date})", tmrWorst: "Worst: {d} — up to AQI {a}", tmrCity: "City average of daily maxima: AQI {a}", tmrSrc: "CAMS (Copernicus) forecast via Open-Meteo. Model forecasts can be wrong.",
  measH: "Suggested measures for this level", measNote: "Based on AQI activity guidance (AirNow, US EPA) and WHO risk-communication guidance. These are not regulations; decisions rest with the competent authorities.", copyWarn: "📋 Copy warning text", warnTxt: "Smog warning for {date} ({city}): AQI up to {a} expected — \"{lvl}\". Worst: {d}.",
  kNow: "AQI now (district average)", k7: "7-day average AQI", k30: "30-day average AQI", kH: "Hours with PM2.5 > 15 µg/m³ (30 d)", kD: "Days above WHO 24-h guideline (30 d)",
  rankH: "District ranking (worst first, 30 days)", cD: "District", cNow: "Now", c7: "7 d", c30: "30 d", cH: "Hours > WHO", cT: "Tomorrow max",
  whoNote: "WHO 2021 guideline for PM2.5: 15 µg/m³ as a 24-hour mean, 5 µg/m³ annual. \"Hours > WHO\" counts hours with PM2.5 above 15 µg/m³ (indicative, since the guideline is a daily mean).",
  contH: "Heating vs transport contribution (estimate)", contNote: "An ESTIMATE, not a measurement: from the daily NO₂ cycle, NO₂/PM2.5 and PM2.5/PM10 ratios and temperature over 72 hours. Method: see «Traffic & smog».", heat: "Heating", trans: "Transport", how: "How we estimate →",
  priH: "District priorities for interventions", priSub: "Where action helps most right now — by a transparent formula.",
  fH: "Formula", fTxt: "Priority P = 100 × (0.5·a + 0.3·b + 0.2·c), where a is the district's 30-day mean PM2.5 divided by the city maximum; b is the share of hours with PM2.5 > 15 µg/m³ over 30 days; c is tomorrow's forecast maximum AQI divided by the city maximum. Measure: \"replace coal\" if the estimated heating share is ≥ 70%; \"buses / transport\" if the transport share is ≥ 25%; \"trees & dust control\" if PM2.5/PM10 < 0.55 (lots of coarse dust).",
  mHeat: "Replace coal: heat pumps, gas, insulation", mBus: "Buses & clean transport", mTree: "Trees & dust control", mNone: "Not enough data to estimate the source", pts: "pts",
  cmpH: "Residents' complaints by district", cmpNote: "Honestly: the app has no server, so this shows only complaints sent from this device (sample complaints are excluded). A city-wide picture needs a shared complaint inbox.", cmpNone: "No complaints for this city on this device yet.", cmpAll: "Total",
  expH: "Open data", expTxt: "CSV/JSON: for each district and day over 30 days — mean and max AQI, mean PM2.5, hours with PM2.5 > 15 µg/m³ and the model zone (districts in one model cell get identical values); the latest-day row also has the current median and count of Sensor.Community citizen sensors (low-cost, uncalibrated), where the district's current value comes from (nearby sensors / station / CAMS model) and the distance to the nearest sensor or station, km. Data: Open-Meteo (CC BY 4.0), CAMS model (Copernicus).",
  repH: "Air quality report", repGen: "Generated {t} · Taza Aba", srcH: "Sources",
  meas: [["No restrictions needed.", "A good time for outdoor activities."],
    ["Inform unusually sensitive people (asthma, heart disease).", "No restrictions for schools needed."],
    ["Schools and kindergartens: shorten long or intense outdoor activities for children with asthma and sensitive children.", "Publish a warning for residents and clinics.", "Encourage public transport; no burning of trash or leaves."],
    ["Schools: move PE and breaks indoors.", "Postpone outdoor mass events.", "Add public transport runs; patrols against open burning.", "Clinics: prepare for more visits."],
    ["Cancel children's outdoor activities; everyone should limit time outdoors.", "Keep windows closed when outdoor air is worse; use air purifiers in schools and hospitals where available.", "Broad alerts: media, SMS, Telegram."],
    ["Hazardous: minimise time outdoors, all activities indoors.", "Broad alerts and protection of vulnerable groups first."]],
  pTitle: "Evidence-based measures", pSub: "What international studies recommend for Kyrgyz cities. Published sources only, with links.",
  pTr: "The sources below cover Bishkek and Kyrgyzstan. WHO guidelines apply everywhere.",
  p1H: "1. Replacing coal heating", p1: "The main winter source of PM2.5 is household coal heating. UNICEF (2023): children in homes with coal stoves breathe on average 17 µg/m³ more PM2.5 in winter; it recommends coal-free zones, window/wall/roof insulation and incentives to switch. World Bank (2023): US$32.3 million in loans for Bishkek households to switch to heat pumps, electric boilers and solar water heating (about 13,000 homes). ADB (2023): gas reduces pollution but costs more long-term and keeps greenhouse-gas emissions; priorities are insulation, heat pumps and expanding district heating.",
  p2H: "2. Air quality management system", p2: "World Bank (Air Quality Improvement Project, 2023): better air-quality data collection and analysis, stronger inspection and cross-sector coordination. UNICEF: use scientific evidence on health impacts more in policy-making.",
  p3H: "3. Transport", p3: "UNDP (2023): road transport is the largest NOx source in Bishkek. Modelling study (Air journal, 2024): transport is about 27% of annual PM2.5, up to ~30% in summer. Measures that cut traffic emissions (public transport, exhaust checks) target exactly this source.",
  p4H: "4. Greening", p4: "World Bank (2023): a pilot green belt designed to reduce air pollution, plus investment in urban irrigation.",
  p5H: "5. Health protection & early warning", p5: "WHO (2021): PM2.5 guidelines are 15 µg/m³ (24-h) and 5 µg/m³ (annual). WHO (2020): risk communication and personal protection on high-pollution days. UNICEF (2023): 112 deaths and 3,568 DALYs lost in Bishkek from PM2.5 in July 2021 – June 2022; economic loss about 2 billion KGS (US$24.9 million).",
  pitchH: "How Taza Aba helps the state", pitch: ["Data transparency: AQI, PM2.5 and NO₂ for every district, open CSV/JSON export and a one-click printable report.", "Early warning: tomorrow's smog forecast (CAMS) with ready-made alert text and measures by level, ready to forward to Telegram, the media and chats.", "Citizen engagement: complaints with photo and location, tree planting, a map of places with clean indoor air.", "Free and serverless: open sources, works on a phone, 3 languages (Kyrgyz, Russian, English)."],
  back: "← Decision dashboard" },

};
/* v28: тренд 30 дней, зимы по годам, сравнение с прошлым годом, QR в отчёте */
Object.assign(GV_S.ru, { trendMax: "Максимум: AQI {a} ({d}).", trendH: "30 дней по городу: средний AQI за сутки", trendNote: "Среднее по всем районам, модель CAMS (Open-Meteo). Цвет столбика — уровень AQI; пунктир — AQI 100.",
  winH: "Зимы по годам (декабрь–февраль)", winSub: "Сравнение зим помогает видеть, меняется ли ситуация после мер. Центр города, модель CAMS.",
  cW: "Зима", cPm: "Средний PM2.5", cDw: "Дней > ВОЗ", cMx: "Худшие сутки", cCh: "К прошлой зиме", unit: "мкг/м³",
  yoyH: "Последние 30 дней и тот же период год назад", yoy: "Средний PM2.5 сейчас — {a} мкг/м³, год назад — {b} мкг/м³ ({c}). Дней выше нормы ВОЗ: {da} против {db}.",
  winNote: "Модельные значения (CAMS, разрешение ~11–40 км), а не измерения датчиков: модель может заметно отличаться от наземных измерений, особенно при зимних инверсиях, поэтому сравнивайте годы между собой, а не с нормами. Архив модели — с зимы 2022/23. На разницу влияют погода и обновления модели, поэтому она сама по себе не доказывает эффект конкретной меры.",
  winLoad: "Загружаю архив зим…", winErr: "Не удалось загрузить архив Open-Meteo.", winPart: "идёт сейчас", qrCap: "Открыть приложение" });
Object.assign(GV_S.ky, { trendMax: "Эң жогорку: AQI {a} ({d}).", trendH: "Шаар боюнча 30 күн: суткалык орточо AQI", trendNote: "Бардык райондордун орточосу, CAMS модели (Open-Meteo). Мамычанын түсү — AQI деңгээли; пунктир — AQI 100.",
  winH: "Жылдар боюнча кыштар (декабрь–февраль)", winSub: "Кыштарды салыштыруу чаралардан кийин абал өзгөрдүбү, көрүүгө жардам берет. Шаардын борбору, CAMS модели.",
  cW: "Кыш", cPm: "Орточо PM2.5", cDw: "ДССУдан ашкан күн", cMx: "Эң начар сутка", cCh: "Өткөн кышка карата", unit: "мкг/м³",
  yoyH: "Акыркы 30 күн жана былтыркы ушул мезгил", yoy: "Азыркы орточо PM2.5 — {a} мкг/м³, былтыр — {b} мкг/м³ ({c}). ДССУ ченеминен ашкан күндөр: {da} / {db}.",
  winNote: "Булар моделдик маанилер (CAMS, ~11–40 км), датчиктердин өлчөөлөрү эмес: модель жердеги өлчөөлөрдөн, айрыкча кышкы инверсияда, бир топ айырмаланышы мүмкүн, ошондуктан жылдарды ченемдер менен эмес, бири-бири менен салыштырыңыз. Моделдин архиви 2022/23-кыштан бери. Айырмага аба ырайы жана моделдин жаңыланышы да таасир этет, ошондуктан ал өзүнчө бир чаранын натыйжасын далилдебейт.",
  winLoad: "Кыштардын архиви жүктөлүүдө…", winErr: "Open-Meteo архивин жүктөө мүмкүн болгон жок.", winPart: "азыр жүрүп жатат", qrCap: "Тиркемени ачуу" });
Object.assign(GV_S.en, { trendMax: "Peak: AQI {a} ({d}).", trendH: "30 days citywide: daily mean AQI", trendNote: "Average over all districts, CAMS model (Open-Meteo). Bar colour is the AQI level; dashed line is AQI 100.",
  winH: "Winters year by year (December–February)", winSub: "Comparing winters shows whether things change after measures are taken. City centre, CAMS model.",
  cW: "Winter", cPm: "Mean PM2.5", cDw: "Days > WHO", cMx: "Worst day", cCh: "vs previous winter", unit: "µg/m³",
  yoyH: "Last 30 days vs the same period a year ago", yoy: "Mean PM2.5 now is {a} µg/m³, a year ago {b} µg/m³ ({c}). Days above the WHO guideline: {da} vs {db}.",
  winNote: "Modelled values (CAMS, ~11–40 km resolution), not sensor measurements: the model can differ substantially from ground measurements, especially during winter inversions, so compare years with each other rather than with guidelines. The model archive starts in winter 2022/23. Weather and model updates also affect the difference, so on its own it does not prove the effect of a specific measure.",
  winLoad: "Loading the winter archive…", winErr: "Couldn't load the Open-Meteo archive.", winPart: "in progress", qrCap: "Open the app" });
const GV = (k, v) => { let s = (GV_S[LANG] || GV_S.ru)[k]; if (s == null) s = GV_S.ru[k]; if (v && typeof s === "string") for (const x in v) s = s.split("{" + x + "}").join(v[x]); return s; };
const GV_SRC = {
  who21: ["https://www.who.int/publications/i/item/9789240034228", "WHO Global Air Quality Guidelines (2021)"],
  who20: ["https://www.who.int/publications/i/item/9789240000278", "WHO: Personal interventions and risk communication on air pollution (2020)"],
  airnow: ["https://www.airnow.gov/aqi/aqi-basics/", "AirNow (US EPA): AQI Basics"],
  flag: ["https://www.airnow.gov/air-quality-flag-program/", "AirNow (US EPA): Air Quality Flag Program"],
  unicef: ["https://www.unicef.org/kyrgyzstan/reports/health-and-social-impacts-air-pollution-women-and-children-bishkek-kyrgyzstan", "UNICEF Kyrgyzstan (2023): Health and Social Impacts of Air Pollution on Women and Children in Bishkek"],
  wbp: ["https://www.worldbank.org/en/news/press-release/2023/11/29/world-bank-supports-air-quality-improvement-in-the-kyrgyz-republic", "World Bank (2023): Kyrgyz Republic Air Quality Improvement Project"],
  wbh: ["https://documents.worldbank.org/en/publication/documents-reports/documentdetail/164771590727056929", "World Bank (2020): Fueling Kyrgyzstan's Transition to Clean Household Heating Solutions"],
  wb24: ["https://doi.org/10.1596/41995", "World Bank (2024): Air Quality Analysis for Bishkek — PM2.5 Source Apportionment"],
  adb: ["https://www.adb.org/sites/default/files/publication/923306/adb-brief-272-tackling-air-pollution-bishkek.pdf", "ADB Brief 272 (2023): Tackling Air Pollution in Bishkek"],
  undp: ["https://www.undp.org/sites/g/files/zskgke326/files/2023-01/KEY%20MESSAGES_ENG_2.pdf", "UNDP (2023): Key Messages — air pollution in Bishkek"],
  air24: ["https://doi.org/10.3390/air2040021", "Air (MDPI), 2024: WRF–CAMx source apportionment, Bishkek"],
  om: ["https://open-meteo.com/en/docs/air-quality-api", "Open-Meteo Air Quality API (CAMS), CC BY 4.0"],
};
const gvA = k => `<a href="${GV_SRC[k][0]}" target="_blank" rel="noopener">${esc(GV_SRC[k][1])}</a>`;
const gvCache = {};
const gvMean = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const gvMax = a => { const v = a.filter(x => x != null); return v.length ? Math.max(...v) : null; };
const gvF = (n, d = 0) => n == null || !isFinite(n) ? "—" : fmt(n, d);
async function gvLoad() {
  const c = CITY, hit = gvCache[c]; if (hit && Date.now() - hit.at < 30 * 60e3) return hit;
  const D = DISTRICTS.slice(), parts = []; for (let i = 0; i < D.length; i += 50) parts.push(D.slice(i, i + 50));
  const Q = "&hourly=us_aqi,pm2_5,pm10,nitrogen_dioxide&past_days=30&forecast_days=2&timezone=auto";
  const cc = cityObj().center;
  const [res, W] = await Promise.all([
    Promise.all(parts.map(pp => fetchJSON(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${pp.map(d => d.lat).join(",")}&longitude=${pp.map(d => d.lon).join(",")}` + Q, 30000))).then(r => r.flatMap(x => Array.isArray(x) ? x : [x])),
    fetchJSON(`https://api.open-meteo.com/v1/forecast?latitude=${cc[0]}&longitude=${cc[1]}&hourly=temperature_2m&past_days=3&forecast_days=1&timezone=auto`, 15000).catch(() => null)]);
  const now = Date.now(), rows = D.map((d, i) => gvDistrict(d, res[i], W, now)).filter(Boolean);
  if (!rows.length) throw new Error("empty");
  const out = { at: now, city: c, rows, tmrDate: rows[0].tmrDate };
  const mx = k => Math.max(1e-9, ...rows.map(r => r[k] || 0));
  const mA = mx("pm30"), mC = mx("tmrMax");
  rows.forEach(r => { r.P = Math.round(100 * (0.5 * (r.pm30 || 0) / mA + 0.3 * (r.hShare || 0) + 0.2 * (r.tmrMax || 0) / mC));
    r.meas = []; const E = r.E;
    if (E) { if (E.hp >= 70) r.meas.push("mHeat"); if (E.tp >= 25) r.meas.push("mBus"); if (E.pp != null && E.pp < 0.55) r.meas.push("mTree"); }
    if (!E) r.meas.push("mNone"); });
  return (gvCache[c] = out);
}
function gvDistrict(d, r, W, now) {
  if (!r || !r.hourly) return null;
  const off = (r.utc_offset_seconds || 0) * 1000, H = r.hourly;
  const T = H.time.map(tm => Date.parse(tm + ":00Z") - off);
  const idx = H.time.map((_, i) => i), past = idx.filter(i => T[i] <= now);
  const last = (h) => past.filter(i => T[i] > now - h * 3600e3);
  const aq = i => H.us_aqi[i], p25 = i => H.pm2_5[i];
  const today = new Date(now + off).toISOString().slice(0, 10), tmrDate = new Date(now + off + 86400e3).toISOString().slice(0, 10);
  const tm = idx.filter(i => H.time[i].slice(0, 10) === tmrDate);
  const p30 = last(30 * 24), withPm = p30.filter(i => p25(i) != null);
  const daily = {}; p30.forEach(i => { const k = H.time[i].slice(0, 10); (daily[k] = daily[k] || []).push(i); });
  const days = Object.keys(daily).sort().map(k => { const ii = daily[k]; return { date: k, aqiMean: gvMean(ii.map(aq)), aqiMax: gvMax(ii.map(aq)), pmMean: gvMean(ii.map(p25)), hOver: ii.filter(i => p25(i) > 15).length, n: ii.length }; });
  const curRec = air && air.byDistrict && air.byDistrict[d.id];
  const lastI = past[past.length - 1];
  let E = null;
  if (typeof tfEstimate === "function") { const l72 = last(72);
    try { E = tfEstimate({ a: { hourly: { time: l72.map(i => H.time[i]), nitrogen_dioxide: l72.map(i => H.nitrogen_dioxide[i]), pm2_5: l72.map(p25), pm10: l72.map(i => H.pm10[i]) } }, b: W }); } catch (e) { E = null; } }
  return { d, id: d.id, name: dName(d), now: curRec && curRec.aqi != null ? curRec.aqi : (lastI != null ? Math.round(aq(lastI)) : null),
    a7: gvMean(last(168).map(aq)), a30: gvMean(p30.map(aq)), pm30: gvMean(p30.map(p25)), no2_7: gvMean(last(168).map(i => H.nitrogen_dioxide[i])),
    hOver: withPm.filter(i => p25(i) > 15).length, hN: withPm.length, hShare: withPm.length ? withPm.filter(i => p25(i) > 15).length / withPm.length : null,
    dOver: days.filter(x => x.date !== today && x.n >= 20 && x.pmMean > 15).length, dN: days.filter(x => x.date !== today && x.n >= 20).length,
    tmrMax: gvMax(tm.map(aq)), tmrPm: gvMean(tm.map(p25)), tmrH: tm.map(i => [+H.time[i].slice(11, 13), aq(i)]), tmrDate, days, E };
}
const gvLvlIdx = a => Math.max(0, AQI_LEVELS.findIndex(l => a <= l.max) === -1 ? AQI_LEVELS.length - 1 : AQI_LEVELS.findIndex(l => a <= l.max));
const gvDate = s => { const [y, m, d] = s.split("-"); return `${d}.${m}.${y}`; };
/* v72: зоны модели — CAMS (~11–40 км) даёт по городу 1–3 разных значения; не ранжируем 128 одинаковых районов */
Object.assign(GV_S.ru, { zH: "Зоны модели (худшие сверху, по 30 дням)", zNote: "Модель CAMS (ячейка ~11–40 км) делит город {city} всего на {zw} — у всех районов внутри зоны одинаковые значения за 7 и 30 дней и одинаковый прогноз. Рейтинг отдельных районов по модели был бы случайным порядком; разницу между соседними районами покажут только наземные датчики.",
  zN: "Зона {i}", zEx: "Например: {ex}", zAll: "Показать все районы ({n})", zMore: "и ещё {n}", zWorst: "зона модели из {nd} ({ex} и др.)", zYou: "ваш район" });
Object.assign(GV_S.ky, { zH: "Модель зоналары (начарлары жогоруда, 30 күн)", zNote: "CAMS модели (тор ~11–40 км) {city} шаарын болгону {zw} бөлөт — зонанын ичиндеги бардык райондордо 7 жана 30 күндүк маанилер жана божомол бирдей. Модель боюнча айрым райондордун рейтинги кокустук тартип болуп калмак; коңшу райондордун айырмасын жер үстүндөгү датчиктер гана көрсөтөт.",
  zN: "{i}-зона", zEx: "Мисалы: {ex}", zAll: "Бардык райондорду көрсөтүү ({n})", zMore: "жана дагы {n}", zWorst: "{nd} турган модель зонасы ({ex} ж.б.)", zYou: "сиздин район" });
Object.assign(GV_S.en, { zH: "Model zones (worst first, 30 days)", zNote: "The CAMS model (~11–40 km grid) splits {city} into only {zw} — every district inside a zone has the same 7- and 30-day values and the same forecast. Ranking individual districts by the model would be an arbitrary order; only ground sensors can show differences between neighbouring districts.",
  zN: "Zone {i}", zEx: "For example: {ex}", zAll: "Show all districts ({n})", zMore: "and {n} more", zWorst: "a model zone of {nd} ({ex} etc.)", zYou: "your district" });
const gvPl = (n, f) => { const a = n % 10, b = n % 100; return f[a === 1 && b !== 11 ? 0 : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 1 : 2]; };
/* «N районов» в нужной форме: kind "nom" — 5 районов, "gen" — из 5 районов; zw — «2 зоны» (вин. падеж) */
const gvNd = (n, kind) => LANG === "ky" ? (kind === "gen" ? `${n} райондон` : `${n} район`) : LANG === "en" ? `${n} district${n === 1 ? "" : "s"}`
  : `${n} ${gvPl(n, kind === "gen" ? ["района", "районов", "районов"] : ["район", "района", "районов"])}`;
const gvZw = z => LANG === "ky" ? `${z} зонага` : LANG === "en" ? `${z} zone${z === 1 ? "" : "s"}` : `${z} ${gvPl(z, ["зону", "зоны", "зон"])}`;
const gvZoneKey = r => (r.a30 || 0).toFixed(2) + "|" + (r.pm30 || 0).toFixed(2);
function gvZones(R) {
  const m = new Map(); R.forEach(r => { const k = gvZoneKey(r); (m.get(k) || m.set(k, []).get(k)).push(r); });
  return [...m.values()].map(rs => { rs = rs.slice().sort((a, b) => (b.now || 0) - (a.now || 0) || a.name.localeCompare(b.name)); const f = rs[0];
    return { rows: rs, n: rs.length, a7: gvMean(rs.map(r => r.a7)), a30: f.a30, hOver: f.hOver, hN: f.hN, tmrMax: gvMax(rs.map(r => r.tmrMax)), P: Math.max(...rs.map(r => r.P || 0)), meas: f.meas, E: f.E }; })
    .sort((a, b) => (b.a30 || 0) - (a.a30 || 0) || b.n - a.n);
}
const gvZoneMode = R => R.length > 3 && new Set(R.map(gvZoneKey)).size <= 3;
const gvEx = (rs, k = 3) => rs.slice(0, k).map(r => r.name).join(", ") + (rs.length > k ? " " + GV("zMore", { n: rs.length - k }) : "");
/* «Хуже всего завтра»: если максимум у многих районов одной ячейки — честно называем зону, а не первый попавшийся район */
function gvWorst(R) {
  const Rt = R.filter(r => r.tmrMax != null); if (!Rt.length) return null;
  const a = Math.round(Math.max(...Rt.map(r => r.tmrMax))), ties = Rt.filter(r => Math.round(r.tmrMax) === a).sort((x, y) => (y.now || 0) - (x.now || 0));
  return { a, label: ties.length > 1 ? GV("zWorst", { nd: gvNd(ties.length, "gen"), ex: ties.slice(0, 3).map(r => r.name).join(", ") }) : ties[0].name };
}
function gvBanner(G) {
  const R = G.rows.filter(r => r.tmrMax != null); if (!R.length) return "";
  const W = gvWorst(R), cityA = Math.round(gvMean(R.map(r => r.tmrMax)));
  const a = W.a, L = level(a), li = gvLvlIdx(a), ms = GV("meas")[Math.min(li, 5)];
  return `<div class="card gv-banner" style="border-left:6px solid ${L.color}">
    <div class="gv-bh"><span class="aqi-pin gv-pin" style="background:${L.color}">${a}</span><div><h3>⚠️ ${GV("tmrH", { date: gvDate(G.tmrDate) })}</h3>
    <b>${esc(tr(L.name))}</b> · ${esc(GV("tmrWorst", { d: W.label, a }))}<br><span class="small">${esc(GV("tmrCity", { a: cityA }))}</span></div></div>
    ${gvHoursHTML(G)}
    <h4>${GV("measH")}</h4><ul class="gv-meas">${ms.map(x => `<li>${esc(x)}</li>`).join("")}</ul>
    <p class="small muted">${GV("measNote")} ${gvA("airnow")} · ${gvA("flag")} · ${gvA("who20")}</p><p class="small muted">${GV("tmrSrc")}</p>
    <button class="btn ghost gv-noprint" id="gvCopy" type="button">${GV("copyWarn")}</button></div>`;
}
/* v96: почасовой прогноз на завтра — по каждому часу максимум среди районов (худшая зона модели CAMS).
 * Помогает выбрать время: уроки на улице и мероприятия — на часы ниже AQI 100, проверки и ограничения — на часы пика. */
Object.assign(GV_S.ru, { hrH: "По часам завтра (худшая зона модели)", hrOver: "Выше AQI 100 (вредно для чувствительных групп): {r}", hrNone: "Ни в один час завтра модель не ждёт AQI выше 100.",
  hrPeak: "Пик: {h}:00, AQI {a}", hr150: "выше 150 — {n}", hrTip: "Занятия на улице и массовые мероприятия лучше переносить на часы ниже AQI 100 (совет AirNow — планировать активность на время, когда воздух чище).",
  hrNote: "Почасовой прогноз модели CAMS; время и высота пика могут отличаться от фактических, особенно вечером при инверсии.", hrUnit: "ч", hrLine: "По часам (модель): {o}; {p}." });
Object.assign(GV_S.ky, { hrH: "Эртең саат боюнча (модельдин эң начар зонасы)", hrOver: "AQI 100дөн жогору (сезгич топторго зыяндуу): {r}", hrNone: "Эртең модель эч бир саатта AQI 100дөн жогору күтпөйт.",
  hrPeak: "Чокусу: {h}:00, AQI {a}", hr150: "150дөн жогору — {n}", hrTip: "Сырттагы сабактарды жана көпчүлүк иш-чараларды AQI 100дөн төмөн сааттарга жылдырган жакшы (AirNow кеңеши — абасы тазараак убакытка пландоо).",
  hrNote: "CAMS моделинин саат сайын божомолу; чокунун убактысы жана бийиктиги, айрыкча кечинде инверсияда, чындыктан айырмаланышы мүмкүн.", hrUnit: "саат", hrLine: "Саат боюнча (модель): {o}; {p}." });
Object.assign(GV_S.en, { hrH: "Tomorrow by hour (worst model zone)", hrOver: "Above AQI 100 (unhealthy for sensitive groups): {r}", hrNone: "The model expects no hour above AQI 100 tomorrow.",
  hrPeak: "Peak: {h}:00, AQI {a}", hr150: "above 150 — {n}", hrTip: "Outdoor lessons and mass events are better moved to hours below AQI 100 (AirNow advice: plan activities for times when the air is cleaner).",
  hrNote: "Hourly CAMS model forecast; the timing and height of the peak may differ from reality, especially in the evening during inversions.", hrUnit: "h", hrLine: "By hour (model): {o}; {p}." });
function gvHours(G) {
  const by = {}; G.rows.forEach(r => (r.tmrH || []).forEach(([h, a]) => { if (a != null) by[h] = Math.max(by[h] == null ? -1 : by[h], a); }));
  const hs = Object.keys(by).map(Number).sort((x, y) => x - y); if (hs.length < 12) return null;
  const H = hs.map(h => ({ h, a: Math.round(by[h]) })), pk = H.reduce((b, x) => x.a > b.a ? x : b);
  const rg = []; H.forEach(x => { if (x.a > 100) { const l = rg[rg.length - 1]; if (l && l[1] === x.h - 1) l[1] = x.h; else rg.push([x.h, x.h]); } });
  return { H, pk, rg, n150: H.filter(x => x.a > 150).length };
}
const gvHH = h => String(h).padStart(2, "0");
const gvRg = HS => HS.rg.map(([a, b]) => `${gvHH(a)}:00–${gvHH(b + 1)}:00`).join(", ");
function gvHoursLine(HS) {
  const o = HS.rg.length ? GV("hrOver", { r: gvRg(HS) }) + (HS.n150 ? ` (${GV("hr150", { n: HS.n150 + " " + GV("hrUnit") })})` : "") : GV("hrNone").replace(/\.$/, "");
  const lc = x => x.charAt(0).toLowerCase() + x.slice(1);
  return GV("hrLine", { o: lc(o), p: lc(GV("hrPeak", { h: gvHH(HS.pk.h), a: HS.pk.a })) });
}
function gvHoursHTML(G) {
  const HS = gvHours(G); if (!HS) return "";
  const Wd = 360, Hd = 110, mx = Math.max(120, HS.pk.a) * 1.08, bw = (Wd - 8) / 24, y = v => Hd - 16 - (v / mx) * (Hd - 26);
  const bars = HS.H.map(x => `<rect x="${(4 + x.h * bw + 0.8).toFixed(1)}" y="${y(x.a).toFixed(1)}" width="${(bw - 1.6).toFixed(1)}" height="${Math.max(1, Hd - 16 - y(x.a)).toFixed(1)}" rx="1.5" fill="${level(x.a).color}"><title>${gvHH(x.h)}:00 — AQI ${x.a}</title></rect>`).join("");
  const lab = [0, 6, 12, 18, 23].map(h => `<text x="${(4 + h * bw + bw / 2).toFixed(1)}" y="${Hd - 3}" text-anchor="middle" class="gv-svt">${gvHH(h)}</text>`).join("");
  const over = HS.rg.length ? GV("hrOver", { r: gvRg(HS) }) + (HS.n150 ? ` (${GV("hr150", { n: HS.n150 + " " + GV("hrUnit") })})` : "") : GV("hrNone");
  const pk = GV("hrPeak", { h: gvHH(HS.pk.h), a: HS.pk.a });
  return `<div class="gv-hr"><h4>🕒 ${GV("hrH")}</h4><svg class="gv-svg gv-hrsvg" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${esc(GV("hrH") + ". " + over.replace(/\.$/, "") + ". " + pk)}">
    <line x1="2" x2="${Wd - 2}" y1="${y(100).toFixed(1)}" y2="${y(100).toFixed(1)}" stroke="#7a8796" stroke-dasharray="4 3"/><text x="${Wd - 4}" y="${(y(100) - 3).toFixed(1)}" text-anchor="end" class="gv-svt">100</text>${bars}${lab}</svg>
    <p class="gv-hrs"><b>${esc(over)}</b> · ${esc(pk)}</p>${HS.rg.length ? `<p class="small">${esc(GV("hrTip"))}</p>` : ""}<p class="small muted">${esc(GV("hrNote"))}</p></div>`;
}
function gvWarnText(G) {
  const R = G.rows.filter(r => r.tmrMax != null); if (!R.length) return "";
  const W = gvWorst(R), a = W.a, li = gvLvlIdx(a);
  const HS = gvHours(G), hl = HS ? "\n" + gvHoursLine(HS) : "";
  return GV("warnTxt", { date: gvDate(G.tmrDate), city: tr(cityObj().name), a, lvl: tr(level(a).name), d: W.label }) + hl + "\n" + GV("meas")[Math.min(li, 5)].map(x => "• " + x).join("\n") + "\n" + SITE_URL;
}
function gvCmpHTML() {
  const C = (state.complaints || []).filter(inCity);
  if (!C.length) return `<p class="small muted">${GV("cmpNone")}</p>`;
  const cats = ["chimney", "trash", "dump", "car", "factory"], by = {};
  C.forEach(c => { const d = nearestDistrict(c.lat, c.lon); const b = by[d.id] = by[d.id] || { d, n: 0 }; b.n++; b[c.cat] = (b[c.cat] || 0) + 1; });
  const rows = Object.values(by).sort((a, b) => b.n - a.n);
  return `<div class="gv-tw"><table class="gv-t"><thead><tr><th>${GV("cD")}</th>${cats.map(c => `<th title="${esc(t("cat_c_" + c))}">${C_EMOJI[c]}</th>`).join("")}<th>${GV("cmpAll")}</th></tr></thead>
    <tbody>${rows.map(r => `<tr><td>${esc(dName(r.d))}</td>${cats.map(c => `<td>${r[c] || ""}</td>`).join("")}<td><b>${r.n}</b></td></tr>`).join("")}</tbody></table></div><div id="gvCmpMap" class="gv-map gv-noprint"></div>`;
}
function gvExport(G, kind) {
  const c = cityObj(), meta = { title: "Taza Aba — district air quality, last 30 days", city: CITY, cityName: tr(c.name), generated: new Date(G.at).toISOString(),
    source: "Open-Meteo Air Quality API (CAMS model, Copernicus), CC BY 4.0 — modelled values, not sensor measurements", units: { aqi: "US AQI", pm2_5: "µg/m³" }, whoGuidelinePm25_24h: 15 };
  /* v73: зона модели — районы с одинаковыми 30-дневными значениями (одна ячейка CAMS); номер как в карточках «Зоны модели» */
  const ZS = gvZones(G.rows), zOf = new Map(); ZS.forEach((z, i) => z.rows.forEach(r => zOf.set(r, i + 1)));
  meta.modelZones = { count: ZS.length, note: "model_zone groups districts whose 30-day values are identical (same CAMS grid cell, ~11-40 km); differences between neighbouring districts can only be shown by ground sensors" };
  /* v75: текущие датчики Sensor.Community по ближайшему району (медиана, число) — только в строке последнего дня; недорогие датчики без поверки */
  const SD = gvSensData(), sBy = {}; SD.rows.forEach(r => (sBy[r.d.id] = sBy[r.d.id] || []).push(r.s));
  const sNow = r => sBy[r.id] ? { pm2_5_median: +median(sBy[r.id]).toFixed(1), n: sBy[r.id].length } : null;
  meta.sensorsNow = { at: new Date().toISOString(), source: "Sensor.Community (open citizen sensors, after outlier QC, readings no older than 60 min, assigned to the nearest district)", count: SD.rows.length,
    note: "low-cost citizen sensors without official calibration; can overstate PM2.5 in fog and high humidity; not official measurements. In CSV, sensor_pm25_now and sensor_n_now are filled only in the latest-date row of each district" };
  /* v86: откуда значение района сейчас и расстояние до ближайшего датчика/станции (как в карточке «Где не хватает датчиков») — тоже только в строке последнего дня */
  const CV = gvCovData(), cBy = new Map(CV.all.map(x => [x.d.id, x])), cNow = r => cBy.get(r.id) || null;
  const cSrc = r => { const x = cNow(r); return x ? x.src : null; }, cKm = r => { const x = cNow(r); return x && x.km != null ? +x.km.toFixed(2) : null; };
  meta.coverageNow = { at: new Date().toISOString(), measurementPoints: CV.np, districtsWithMeasurement: CV.c, districts: CV.n,
    note: "value_source_now: where the district value shown now comes from — 'sensors' (median of Sensor.Community sensors within 2.5 km), 'station' (nearest station) or 'model' (CAMS model at the district point, no correction). km_to_nearest_measurement_now: straight-line distance to the nearest sensor or station that responded in the latest update (empty if none). In CSV both are filled only in the latest-date row of each district" };
  let blob, name = `taza-aba-${CITY}-aqi-30d`;
  if (kind === "csv") {
    const q = s => `"${String(s).replace(/"/g, '""')}"`, L = ["date,district_id,district_name,model_zone,aqi_mean,aqi_max,pm2_5_mean,hours_pm2_5_over_15,hours,sensor_pm25_now,sensor_n_now,value_source_now,km_to_nearest_measurement_now"];
    G.rows.forEach(r => { const sn = sNow(r), last = r.days.length - 1; r.days.forEach((x, i) => L.push([x.date, r.id, q(r.name), zOf.get(r), x.aqiMean == null ? "" : x.aqiMean.toFixed(1), x.aqiMax == null ? "" : Math.round(x.aqiMax), x.pmMean == null ? "" : x.pmMean.toFixed(1), x.hOver, x.n, i === last && sn ? sn.pm2_5_median : "", i === last && sn ? sn.n : "", i === last && cSrc(r) ? cSrc(r) : "", i === last && cKm(r) != null ? cKm(r) : ""].join(","))); });
    blob = new Blob(["\ufeff" + L.join("\n")], { type: "text/csv;charset=utf-8" }); name += ".csv";
  } else {
    blob = new Blob([JSON.stringify({ ...meta, districts: G.rows.map(r => ({ id: r.id, name: r.name, lat: r.d.lat, lon: r.d.lon, model_zone: zOf.get(r), priority: r.P, sensors_now: sNow(r), value_source_now: cSrc(r), km_to_nearest_measurement_now: cKm(r), days: r.days.map(x => ({ date: x.date, aqi_mean: x.aqiMean == null ? null : +x.aqiMean.toFixed(1), aqi_max: x.aqiMax == null ? null : Math.round(x.aqiMax), pm2_5_mean: x.pmMean == null ? null : +x.pmMean.toFixed(1), hours_pm2_5_over_15: x.hOver, hours: x.n })) })) }, null, 1)], { type: "application/json" }); name += ".json";
  }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
const gvYmd = d => d.toISOString().slice(0, 10);
function gvDaily(r) { const H = r && r.hourly; if (!H) return []; const by = {};
  H.time.forEach((t, i) => { const p = H.pm2_5[i]; if (p == null) return; (by[t.slice(0, 10)] = by[t.slice(0, 10)] || []).push(p); });
  return Object.keys(by).sort().filter(k => by[k].length >= 18).map(k => gvMean(by[k])); }
async function gvWinLoad() {
  const c = CITY, key = "tazaAba.gvWin2." + c;
  try { const h = JSON.parse(localStorage.getItem(key) || "null"); if (h && Date.now() - h.at < 20 * 3600e3) return h; } catch (e) {}
  const [lat, lon] = cityObj().center, now = new Date(), base = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&timezone=auto`;
  const lastY = now.getUTCMonth() >= 11 ? now.getUTCFullYear() : now.getUTCFullYear() - 1, W = [];
  for (let y = 2022; y <= lastY; y++) { const end = new Date(Date.UTC(y + 1, 2, 0)), part = end > now; W.push({ y, part, s: `${y}-12-01`, e: gvYmd(part ? new Date(now - 86400e3) : end) }); }
  const yE = new Date(now - 86400e3), yS = new Date(now - 30 * 86400e3), ago = d => { const x = new Date(d); x.setUTCFullYear(x.getUTCFullYear() - 1); return x; };
  const q = (s, e) => fetchJSON(`${base}&start_date=${s}&end_date=${e}`, 30000).then(gvDaily);
  const [ws, nowD, agoD] = await Promise.all([Promise.all(W.map(w => w.s <= w.e ? q(w.s, w.e) : Promise.resolve([]))), q(gvYmd(yS), gvYmd(yE)), q(gvYmd(ago(yS)), gvYmd(ago(yE)))]);
  const st = d => d.length ? { pm: gvMean(d), dw: d.filter(x => x > 15).length, mx: gvMax(d), n: d.length } : null;
  const out = { at: Date.now(), winters: W.map((w, i) => ({ y: w.y, part: w.part, ...st(ws[i]) })).filter(w => w.n), now: st(nowD), ago: st(agoD) };
  if (!out.winters.length && !out.now) throw new Error("empty");
  try { localStorage.setItem(key, JSON.stringify(out)); } catch (e) {}
  return out;
}
function gvWinHTML(R) {
  const ws = R.winters, mx = Math.max(16, ...ws.map(w => w.pm)) * 1.12, Wd = 320, Hd = 150, bw = Math.min(56, (Wd - 40) / Math.max(1, ws.length) - 14);
  const y = v => Hd - 18 - (v / mx) * (Hd - 34), step = (Wd - 40) / Math.max(1, ws.length);
  const bars = ws.map((w, i) => { const x = 34 + i * step + (step - bw) / 2, col = w.pm > 15 ? "#e05a2b" : "#2f9e6e";
    return `<rect x="${x.toFixed(1)}" y="${y(w.pm).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Hd - 18 - y(w.pm)).toFixed(1)}" rx="4" fill="${col}"${w.part ? ' fill-opacity=".55"' : ""}/>
      <text x="${(x + bw / 2).toFixed(1)}" y="${(y(w.pm) - 4).toFixed(1)}" text-anchor="middle" class="gv-svt">${fmt(w.pm, 1)}</text>
      <text x="${(x + bw / 2).toFixed(1)}" y="${Hd - 4}" text-anchor="middle" class="gv-svt">${w.y}/${String(w.y + 1).slice(2)}${w.part ? "*" : ""}</text>`; }).join("");
  const svg = `<svg class="gv-svg" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${esc(GV("winH"))}"><line x1="30" x2="${Wd - 4}" y1="${y(15).toFixed(1)}" y2="${y(15).toFixed(1)}" stroke="#7a8796" stroke-dasharray="4 3"/>
    <text x="28" y="${(y(15) + 4).toFixed(1)}" text-anchor="end" class="gv-svt">15</text>${bars}</svg>`;
  const rows = ws.map((w, i) => { const p = ws[i - 1], ch = p && !w.part ? Math.round((w.pm / p.pm - 1) * 100) : null;
    return `<tr><td>${w.y}/${w.y + 1}${w.part ? ` <span class="small muted">(${GV("winPart")})</span>` : ""}</td><td>${fmt(w.pm, 1)}</td><td>${w.dw}<span class="muted">/${w.n}</span></td><td>${fmt(w.mx, 0)}</td><td>${ch == null ? "—" : `<b class="${ch > 0 ? "gv-up" : "gv-dn"}">${ch > 0 ? "+" : ""}${ch}%</b>`}</td></tr>`; }).join("");
  let yoy = "";
  if (R.now && R.ago) { const ch = Math.round((R.now.pm / R.ago.pm - 1) * 100);
    yoy = `<h4>${GV("yoyH")}</h4><p class="small">${esc(GV("yoy", { a: fmt(R.now.pm, 1), b: fmt(R.ago.pm, 1), c: (ch > 0 ? "+" : "") + ch + "%", da: R.now.dw, db: R.ago.dw }))}</p>`; }
  return `${ws.length ? `${svg}<div class="gv-tw"><table class="gv-t gv-wt"><thead><tr><th>${GV("cW")}</th><th>${GV("cPm")}, ${GV("unit")}</th><th>${GV("cDw")}</th><th>${GV("cMx")}, ${GV("unit")}</th><th>${GV("cCh")}</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}
    ${yoy}<p class="small muted">${GV("winNote")} ${gvA("om")}</p>`;
}
function gvTrendHTML(G) {
  const by = {}; G.rows.forEach(r => r.days.forEach(x => { if (x.aqiMean != null && x.n >= 18) (by[x.date] = by[x.date] || []).push(x.aqiMean); }));
  const ds = Object.keys(by).sort().slice(-30).map(k => ({ k, a: gvMean(by[k]) })); if (ds.length < 3) return "";
  const Wd = 360, Hd = 120, mx = Math.max(110, ...ds.map(d => d.a)) * 1.08, bw = (Wd - 8) / ds.length, y = v => Hd - 16 - (v / mx) * (Hd - 24);
  const bars = ds.map((d, i) => `<rect x="${(4 + i * bw + 0.6).toFixed(1)}" y="${y(d.a).toFixed(1)}" width="${Math.max(1, bw - 1.2).toFixed(1)}" height="${(Hd - 16 - y(d.a)).toFixed(1)}" rx="1.5" fill="${level(d.a).color}"><title>${gvDate(d.k)}: AQI ${Math.round(d.a)}</title></rect>`).join("");
  const worst = ds.reduce((b, d) => d.a > b.a ? d : b);
  return `<div class="card gv-trend"><h3>📈 ${GV("trendH")}</h3><svg class="gv-svg" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${esc(GV("trendH"))}: max ${Math.round(worst.a)} (${gvDate(worst.k)})">
    <line x1="2" x2="${Wd - 2}" y1="${y(100).toFixed(1)}" y2="${y(100).toFixed(1)}" stroke="#7a8796" stroke-dasharray="4 3"/>${bars}
    <text x="4" y="${Hd - 3}" class="gv-svt">${gvDate(ds[0].k).slice(0, 5)}</text><text x="${Wd - 4}" y="${Hd - 3}" text-anchor="end" class="gv-svt">${gvDate(ds[ds.length - 1].k).slice(0, 5)}</text></svg>
    <p class="small muted">${GV("trendNote")} ${esc(GV("trendMax", { a: Math.round(worst.a), d: gvDate(worst.k) }))}</p></div>`;
}
/* v74: «Модель и датчики сейчас» — честная сверка CAMS с датчиками Sensor.Community (только реальные замеры ≤ 60 мин) */
GV_SRC.sc = ["https://sensor.community/", "Sensor.Community"];
Object.assign(GV_S.ru, { sH: "Модель и датчики сейчас", sSub: "Модель CAMS рядом с открытыми датчиками жителей Sensor.Community (до 25 км от центра, последний замер не старше 60 минут): {n}.",
  sMed: "Медиана по датчикам — {s} мкг/м³ PM2.5, модель в тех же местах — {m} мкг/м³.", sHi: "Сейчас датчики показывают в {k} раза больше модели.", sLo: "Сейчас датчики показывают в {k} раза меньше модели.", sEq: "Сейчас модель и датчики близки (разница меньше 20 %).",
  sSpread: "Разброс между датчиками — от {a} до {b} мкг/м³, а модель делит город всего на {zw}.", cS: "Район рядом", cSv: "Датчик", cMv: "Модель", cDf: "Разница",
  sAcc: "Прогноз на сутки с поправкой по датчикам за последние {d} дн.: средняя ошибка ±{e} мкг/м³ вместо ±{r} мкг/м³ у модели без поправки (пересчёт {t}).",
  sNote: "Sensor.Community — недорогие датчики жителей без официальной поверки; в туман и при высокой влажности они могут завышать PM2.5. Это не официальные измерения, но они видят то, чего не видит модель с ячейкой ~40 км: разницу между районами и вечерний дым печей.", sQC: "Исключены как сбой (во много раз выше соседей): {x}.",
  sNone: "Рядом с городом сейчас нет открытых датчиков, поэтому все цифры этой панели — модель CAMS. Даже несколько датчиков (например, на школах или поликлиниках) позволят сверять модель с реальным воздухом.", sWait: "Датчики ещё не ответили — сверка появится после обновления данных." });
Object.assign(GV_S.ky, { sH: "Модель жана датчиктер азыр", sSub: "Sensor.Community тургундарынын ачык датчиктеринин жанындагы CAMS модели (борбордон 25 км чейин, акыркы өлчөө 60 мүнөттөн эски эмес): {n}.",
  sMed: "Датчиктердин медианасы — {s} мкг/м³ PM2.5, ошол эле жерлерде модель — {m} мкг/м³.", sHi: "Азыр датчиктер моделден {k} эсе көп көрсөтүүдө.", sLo: "Азыр датчиктер моделден {k} эсе аз көрсөтүүдө.", sEq: "Азыр модель менен датчиктер жакын (айырма 20 %дан аз).",
  sSpread: "Датчиктердин көрсөткүчтөрү — {a}–{b} мкг/м³, ал эми модель шаарды болгону {zw} бөлөт.", cS: "Жакынкы район", cSv: "Датчик", cMv: "Модель", cDf: "Айырма",
  sAcc: "Датчиктер боюнча оңдолгон бир суткалык божомол, акыркы {d} күн: орточо ката ±{e} мкг/м³, оңдоосуз модельде ±{r} мкг/м³ (кайра эсептелди {t}).",
  sNote: "Sensor.Community — тургундардын расмий текшерүүсүз арзан датчиктери; туманда жана нымдуулук жогору болгондо PM2.5ти ашыра көрсөтүшү мүмкүн. Бул расмий өлчөө эмес, бирок алар ~40 км торчолуу модель көрбөгөндү көрөт: райондордун айырмасын жана кечки меш түтүнүн.", sQC: "Бузулган катары чыгарылды (кошуналарынан бир нече эсе жогору): {x}.",
  sNone: "Азыр шаардын жанында ачык датчиктер жок, ошондуктан бул панелдеги бардык сандар — CAMS модели. Бир нече датчик (мисалы, мектептерде же ооруканаларда) моделди чыныгы аба менен салыштырууга мүмкүндүк берет.", sWait: "Датчиктер азырынча жооп бере элек — салыштыруу маалымат жаңыргандан кийин чыгат." });
Object.assign(GV_S.en, { sH: "Model and sensors now", sSub: "The CAMS model next to open citizen sensors from Sensor.Community (within 25 km of the centre, last reading no older than 60 minutes): {n}.",
  sMed: "Sensor median is {s} µg/m³ PM2.5; the model at the same places gives {m} µg/m³.", sHi: "Right now sensors read {k} times higher than the model.", sLo: "Right now sensors read {k} times lower than the model.", sEq: "Right now the model and sensors are close (less than 20% apart).",
  sSpread: "Sensors range from {a} to {b} µg/m³, while the model splits the city into only {zw}.", cS: "Nearest district", cSv: "Sensor", cMv: "Model", cDf: "Difference",
  sAcc: "24-hour forecast corrected by sensors over the last {d} days: mean error ±{e} µg/m³ instead of ±{r} µg/m³ for the uncorrected model (recalculated {t}).",
  sNote: "Sensor.Community devices are low-cost citizen sensors without official calibration; in fog and high humidity they can overstate PM2.5. They are not official measurements, but they see what a ~40 km model grid cannot: differences between districts and evening stove smoke.", sQC: "Excluded as faulty (many times above neighbours): {x}.",
  sNone: "There are no open sensors near this city right now, so every figure on this dashboard is the CAMS model. Even a few sensors (for example at schools or clinics) would let the city check the model against real air.", sWait: "Sensors have not responded yet; the comparison will appear after the next data update." });
const gvSensN = n => LANG === "ky" ? `${n} датчик` : LANG === "en" ? `${n} sensor${n === 1 ? "" : "s"}` : `${n} ${gvPl(n, ["датчик", "датчика", "датчиков"])}`;
function gvSensData() {
  const S = (air && air.sensors) || [], byD = (air && air.byDistrict) || {};
  const rows = S.map(s => { const d = nearestDistrict(s.lat, s.lon), r = d && byD[d.id], m = r && r.model ? r.model.pm25 : null;
    return d && m != null && s.p2 != null ? { d, s: s.p2, m, age: s.age } : null; }).filter(Boolean).sort((a, b) => b.s - a.s);
  if (!rows.length) return { rows, bad: ((air && air.sensorsBad) || []).length };
  const ms = median(rows.map(r => r.s)), mm = median(rows.map(r => r.m));
  return { rows, ms, mm, k: mm > 0 ? ms / mm : null, lo: rows[rows.length - 1].s, hi: rows[0].s, bad: ((air && air.sensorsBad) || []).length };
}
let gvCoefP = null;
const gvCoef = () => gvCoefP || (gvCoefP = fetch(/github\.io$/.test(location.hostname) ? "forecast/coeffs.json" : "https://lalalalallalalalalalala.github.io/taza-aba/forecast/coeffs.json", { cache: "no-cache", signal: AbortSignal.timeout(12000) })
  .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))).catch(e => { gvCoefP = null; throw e; }));
function gvSensHTML(nZ) {
  const D = gvSensData(), f1 = v => gvF(v, 1);
  if (!D.rows.length) return `<div class="card gv-sens"><h3>📡 ${GV("sH")}</h3><p class="small">${esc(GV(air && air.live && air.status === "ok" ? "sNone" : "sWait"))}</p><div id="gvSensDiv"></div></div>`;
  const k = D.k, ratio = k == null ? "" : k >= 1.2 ? GV("sHi", { k: fmt(k, 1) }) : k <= 1 / 1.2 ? GV("sLo", { k: fmt(1 / k, 1) }) : GV("sEq");
  const pin = v => `<span class="gv-chip" style="background:${level(pm25ToAqi(v)).color}">${f1(v)}</span>`;
  const sg = v => (v > 0 ? "+" : v < 0 ? "−" : "") + f1(Math.abs(v));
  return `<div class="card gv-sens"><h3>📡 ${GV("sH")}</h3><p class="small">${esc(GV("sSub", { n: gvSensN(D.rows.length) }))}</p>
    <p><b>${esc(GV("sMed", { s: f1(D.ms), m: f1(D.mm) }))}</b> ${esc(ratio)}</p>
    ${D.rows.length > 1 && nZ ? `<p class="small">${esc(GV("sSpread", { a: f1(D.lo), b: f1(D.hi), zw: gvZw(nZ) }))}</p>` : ""}
    <div class="gv-tw"><table class="gv-t"><thead><tr><th>${GV("cS")}</th><th>${GV("cSv")}</th><th>${GV("cMv")}</th><th>${GV("cDf")}</th></tr></thead>
      <tbody>${D.rows.map(r => `<tr><td>${esc(dName(r.d))}</td><td>${pin(r.s)}</td><td>${pin(r.m)}</td><td>${sg(r.s - r.m)}</td></tr>`).join("")}</tbody></table></div>
    <p class="small muted">PM2.5, ${LANG === "en" ? "µg/m³" : "мкг/м³"} · ${gvA("sc")} · ${gvA("om")}</p>
    <p class="small" id="gvSensAcc"></p><div id="gvSensDiv"></div>
    <p class="small muted">${esc(GV("sNote"))}${D.bad ? " " + esc(GV("sQC", { x: D.bad })) : ""}</p></div>`;
}
/* v85: «Где не хватает датчиков» — у каких районов есть измерения рядом (датчик жителей ≤ 2,5 км или станция), а где только модель CAMS */
Object.assign(GV_S.ru, { cvH: "Где не хватает датчиков", cvSub: "Измерения рядом с районом (датчик жителей не дальше 2,5 км или станция) есть у {c} из {n} районов. У остальных {k} — только модель CAMS, которая не видит разницу между соседними кварталами.",
  cvNone: "Рядом с городом сейчас нет ни одного открытого датчика или станции — все {n} районов показывают только модель CAMS.", cvAll: "Измерения рядом есть у всех {n} районов.",
  cvFar: "Районы без измерений, дальше всего от ближайшего датчика (сначала городская застройка, затем сёла):", cvD: "Район", cvT: "Застройка", cvKm: "До датчика, км", cvMore: "Все районы без измерений ({k})",
  cvMapH: "Карта покрытия", cvMapA: "Карта: районы с измерениями рядом — {c}, только модель — {k}, датчиков и станций — {p}. Те же данные — в таблице выше.",
  cvLm: "есть измерения рядом", cvLu: "только модель CAMS", cvLp: "датчик или станция; круг — где их значение используется (датчик 2,5 км, станция 3–6 км)",
  cvNote: "Расстояние — по прямой до ближайшего датчика Sensor.Community или станции, которые ответили при последнем обновлении. Новый датчик в таком районе сразу даст ему собственное измеренное значение на карте и в этой панели." });
Object.assign(GV_S.ky, { cvH: "Датчиктер кайда жетишпейт", cvSub: "Райондун жанында өлчөө (2,5 км ичинде тургундардын датчиги же станция) {n} райондун {c} районунда бар. Калган {k} райондо — CAMS модели гана, ал коңшу кварталдардын айырмасын көрбөйт.",
  cvNone: "Азыр шаардын жанында бир да ачык датчик же станция жок — бардык {n} район CAMS моделин гана көрсөтөт.", cvAll: "Бардык {n} райондун жанында өлчөө бар.",
  cvFar: "Өлчөөсү жок, жакынкы датчиктен эң алыс райондор (адегенде шаардык курулуш, анан айылдар):", cvD: "Район", cvT: "Курулуш", cvKm: "Датчикке чейин, км", cvMore: "Өлчөөсү жок бардык райондор ({k})",
  cvMapH: "Камтуу картасы", cvMapA: "Карта: жанында өлчөө бар райондор — {c}, модель гана — {k}, датчиктер жана станциялар — {p}. Ушул эле маалымат жогорудагы таблицада.",
  cvLm: "жанында өлчөө бар", cvLu: "CAMS модели гана", cvLp: "датчик же станция; тегерек — алардын мааниси колдонулган аймак (датчик 2,5 км, станция 3–6 км)",
  cvNote: "Аралык — акыркы жаңыртууда жооп берген Sensor.Community датчигине же станцияга чейин түз сызык менен. Мындай райондогу жаңы датчик ага картада жана бул панелде өз өлчөнгөн маанисин дароо берет." });
Object.assign(GV_S.en, { cvH: "Where sensors are missing", cvSub: "{c} of {n} districts have a measurement nearby (a residents' sensor within 2.5 km or a station). The other {k} have only the CAMS model, which cannot see differences between neighbouring blocks.",
  cvNone: "There is no open sensor or station near this city right now — all {n} districts show only the CAMS model.", cvAll: "All {n} districts have a measurement nearby.",
  cvFar: "Districts without measurements, farthest from the nearest sensor (urban areas first, then villages):", cvD: "District", cvT: "Housing", cvKm: "To sensor, km", cvMore: "All districts without measurements ({k})",
  cvMapH: "Coverage map", cvMapA: "Map: districts with a measurement nearby — {c}, model only — {k}, sensors and stations — {p}. The same data is in the table above.",
  cvLm: "measurement nearby", cvLu: "CAMS model only", cvLp: "sensor or station; circle — where its value is used (sensor 2.5 km, station 3–6 km)",
  cvNote: "Distance is a straight line to the nearest Sensor.Community sensor or station that responded in the last update. A new sensor in such a district immediately gives it its own measured value on the map and in this dashboard." });
function gvCovData() { return covData(); }   /* v87: общий расчёт с картой #map (app.js covData) */
function gvCovHTML() {
  if (!air || !air.live || air.status !== "ok") return "";
  const D = gvCovData(); if (D.n < 2) return "";
  const h = `<div class="card gv-cov"><h3>📍 ${GV("cvH")}</h3>`;
  if (!D.np) return h + `<p class="small">${esc(GV("cvNone", { n: D.n }))}</p></div>`;
  if (!D.un.length) return h + `<p class="small">${esc(GV("cvAll", { n: D.n }))}</p></div>`;
  const tb = rs => `<div class="gv-tw"><table class="gv-t"><thead><tr><th>${GV("cvD")}</th><th>${GV("cvT")}</th><th>${GV("cvKm")}</th></tr></thead><tbody>${rs.map(r =>
    `<tr><td>${esc(dName(r.d))}</td><td>${r.d.type && DTYPE[r.d.type] ? esc(tr(DTYPE[r.d.type])) : "—"}</td><td>${r.km == null ? "—" : fmt(r.km, 1)}</td></tr>`).join("")}</tbody></table></div>`;
  return h + `<p class="small">${esc(GV("cvSub", { c: D.c, n: D.n, k: D.un.length }))}</p>
    <p class="small"><b>${esc(GV("cvFar"))}</b></p>${tb(D.un.slice(0, 8))}
    ${D.un.length > 8 ? `<details class="gv-zall"><summary>${esc(GV("cvMore", { k: D.un.length }))}</summary>${tb(D.un)}</details>` : ""}
    <h4 class="gv-noprint">${esc(GV("cvMapH"))}</h4><div id="gvCovMap" class="gv-map gv-covmap gv-noprint" role="region" aria-label="${esc(GV("cvMapA", { c: D.c, k: D.un.length, p: D.np }))}"></div>
    <p class="small gv-covlg gv-noprint"><span><i class="gv-lm"></i>${esc(GV("cvLm"))}</span><span><i class="gv-lu"></i>${esc(GV("cvLu"))}</span><span><i class="gv-lp"></i>${esc(GV("cvLp"))}</span></p>
    <p class="small muted">${esc(GV("cvNote"))} ${gvA("sc")}</p></div>`;
}
/* v86: карта покрытия — районы с измерениями рядом и без них; круг — радиус, в котором точка даёт значение району (датчик 2,5 км — extra.js sensorsNear; станция 3 км, опорная 6 км — sources.js applyStations) */
let gvCovM = null;
function gvCovKill() { if (gvCovM) { try { gvCovM.off(); gvCovM.remove(); } catch (e) { /* уже удалена */ } gvCovM = null; } }
window.addEventListener("hashchange", () => { if ((location.hash || "").slice(1).split("/")[0] !== "gov") gvCovKill(); });
function gvCovMount() {
  gvCovKill(); const el = $("#gvCovMap"); if (!el || typeof L === "undefined") return;
  const D = gvCovData(); if (!D.all.length) return;
  const m = gvCovM = mkMap("gvCovMap", { zoomControl: true, scrollWheelZoom: false }); baseTiles(m);
  const km = v => v == null ? "" : ` · ${GV("cvKm")}: ${fmt(v, 1)}`;
  D.P.forEach(p => L.circle([p.lat, p.lon], { radius: p.r * 1000, color: "#1f7a52", weight: 1, opacity: 0.5, fillColor: "#2f9e6e", fillOpacity: 0.08, interactive: false }).addTo(m));
  D.all.forEach(x => { const on = x.src !== "model";
    L.circleMarker([x.d.lat, x.d.lon], on ? { radius: 6, color: "#14532d", weight: 1.5, fillColor: "#2f9e6e", fillOpacity: 0.9 } : { radius: 6, color: "#b45309", weight: 2, dashArray: "3 2", fillColor: "#ffffff", fillOpacity: 0.85 })
      .bindTooltip(`${esc(dName(x.d))} · ${esc(GV(on ? "cvLm" : "cvLu"))}${on ? "" : km(x.km)}`).addTo(m); });
  D.P.forEach(p => L.circleMarker([p.lat, p.lon], { radius: 3, color: "#ffffff", weight: 1.2, fillColor: "#111827", fillOpacity: 1, interactive: false }).addTo(m));
  try { m.fitBounds(L.latLngBounds(D.all.map(x => [x.d.lat, x.d.lon])).pad(0.08)); } catch (e) { m.setView(cityObj().center, cityObj().zoom || 11); }
  setTimeout(() => { if (m === gvCovM && m._mapPane) m.invalidateSize(); }, 80);
}
function gvSensAccMount() {
  const c = CITY; gvCoef().then(j => { const e = $("#gvSensAcc"), x = j && j.cities && j.cities[c], ck = x && x.check; if (!e || CITY !== c || !ck || ck.maeNew == null) return;
    const t = j.updated ? new Date(j.updated).toLocaleString(numLocale(), { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
    e.textContent = GV("sAcc", { d: ck.days, e: gvF(ck.maeNew, 1), r: gvF(ck.maeRaw, 1), t }); }).catch(e => console.warn("gov coeffs:", e.message));
  gvCoef().then(j => { const e = $("#gvSensDiv"), x = j && j.cities && j.cities[c]; if (!e || CITY !== c || !x || !x.div) return; e.innerHTML = gvDivHTML(x.div); }).catch(() => {});
}
/* v75: расхождение датчики/модель по часам суток за 7 дней (forecast/coeffs.json → cities[c].div, считает GitHub Actions каждые 6 ч) */
Object.assign(GV_S.ru, { dH: "По часам суток, последние 7 дней", dSub: "Медиана датчиков и модели CAMS в тех же местах для каждого часа (местное время), {a}–{b}. Пересчитывается автоматически каждые 6 часов.",
  dP: ["Ночь (0–5 ч)", "Утро (6–10 ч)", "День (11–17 ч)", "Вечер (18–23 ч)"], dRow: "{p}: датчики {s}, модель {m} мкг/м³ — {r}.", rHi: "датчики в {k} раза выше", rLo: "датчики в {k} раза ниже", rEq: "близко (разница меньше 20 %)",
  dPeak: "Сильнее всего модель занижает в {h}: датчики {s}, модель {m} мкг/м³ (медиана за {n} дн.).", dUse: "В эти часы для оповещений и мер полезнее опираться на датчики, а не только на модель.",
  dLs: "Датчики", dLm: "Модель", dTbl: "Таблица по часам", cH: "Час", cN: "Дней" });
Object.assign(GV_S.ky, { dH: "Сутканын сааттары боюнча, акыркы 7 күн", dSub: "Ар бир саат үчүн (жергиликтүү убакыт) датчиктердин медианасы жана ошол эле жерлердеги CAMS модели, {a}–{b}. Ар 6 саатта автоматтык түрдө кайра эсептелет.",
  dP: ["Түн (0–5)", "Эртең менен (6–10)", "Күндүз (11–17)", "Кечинде (18–23)"], dRow: "{p}: датчиктер {s}, модель {m} мкг/м³ — {r}.", rHi: "датчиктер {k} эсе жогору", rLo: "датчиктер {k} эсе төмөн", rEq: "жакын (айырма 20 %дан аз)",
  dPeak: "Модель эң көп {h} саатта төмөндөтөт: датчиктер {s}, модель {m} мкг/м³ ({n} күндүн медианасы).", dUse: "Бул сааттарда эскертүүлөр жана чаралар үчүн моделге гана эмес, датчиктерге таянуу пайдалуураак.",
  dLs: "Датчиктер", dLm: "Модель", dTbl: "Сааттар боюнча таблица", cH: "Саат", cN: "Күн" });
Object.assign(GV_S.en, { dH: "By hour of day, last 7 days", dSub: "Median of sensors and of the CAMS model at the same places for each hour (local time), {a}–{b}. Recalculated automatically every 6 hours.",
  dP: ["Night (0–5 h)", "Morning (6–10 h)", "Day (11–17 h)", "Evening (18–23 h)"], dRow: "{p}: sensors {s}, model {m} µg/m³ — {r}.", rHi: "sensors {k}× higher", rLo: "sensors {k}× lower", rEq: "close (less than 20% apart)",
  dPeak: "The model underestimates most at {h}: sensors {s}, model {m} µg/m³ (median of {n} days).", dUse: "At these hours, alerts and measures should rely on sensors, not only on the model.",
  dLs: "Sensors", dLm: "Model", dTbl: "Table by hour", cH: "Hour", cN: "Days" });
function gvDivHTML(dv) {
  const H = (dv.h || []).map((x, i) => ({ i, n: x[0], s: x[1], m: x[2] })), ok = H.filter(x => x.n >= 3 && x.s != null && x.m != null);
  if (ok.length < 18) return "";
  const f1 = v => gvF(v, 1), hh = i => String(i).padStart(2, "0") + ":00", rat = (s, m) => { const k = m > 0 ? s / m : null; return k == null ? "" : k >= 1.2 ? GV("rHi", { k: fmt(k, 1) }) : k <= 1 / 1.2 ? GV("rLo", { k: fmt(1 / k, 1) }) : GV("rEq"); };
  const ld = z => z ? new Date(new Date(z).getTime() + 6 * 36e5).toISOString().slice(0, 10).split("-").reverse().slice(0, 2).join(".") : "—";
  const P = [[0, 5], [6, 10], [11, 17], [18, 23]].map(([a, b], k) => { const r = ok.filter(x => x.i >= a && x.i <= b); return r.length ? { p: GV("dP")[k], s: gvMean(r.map(x => x.s)), m: gvMean(r.map(x => x.m)) } : null; }).filter(Boolean);
  const pk = ok.reduce((b, x) => (x.m > 0 && (!b || x.s / x.m > b.s / b.m)) ? x : b, null), under = pk && pk.s / pk.m >= 1.2;
  const Wd = 360, Hd = 150, x0 = 26, step = (Wd - x0 - 4) / 24, bw = Math.max(2, step / 2 - 1), mx = Math.max(10, ...ok.map(x => Math.max(x.s, x.m))) * 1.1, y = v => Hd - 18 - (v / mx) * (Hd - 30);
  const tk = [0, 6, 12, 18, 23], st = mx > 120 ? 50 : mx > 60 ? 20 : 10, gl = [...Array(Math.floor(mx / st) + 1)].map((_, i) => i * st);
  const bars = H.map(x => { if (x.s == null || x.m == null) return ""; const X = x0 + x.i * step + 1;
    return `<rect x="${X.toFixed(1)}" y="${y(x.s).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Hd - 18 - y(x.s)).toFixed(1)}" rx="1.5" class="gv-dvs"/><rect x="${(X + bw + 1).toFixed(1)}" y="${y(x.m).toFixed(1)}" width="${bw.toFixed(1)}" height="${(Hd - 18 - y(x.m)).toFixed(1)}" rx="1.5" class="gv-dvm"/>`; }).join("");
  const axis = gl.map(v => `<line x1="${x0}" x2="${Wd - 4}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="gv-dvg"/><text x="${x0 - 3}" y="${(y(v) + 3).toFixed(1)}" text-anchor="end" class="gv-svt">${v}</text>`).join("")
    + tk.map(i => `<text x="${(x0 + i * step + step / 2).toFixed(1)}" y="${Hd - 4}" text-anchor="middle" class="gv-svt">${i}</text>`).join("");
  const lines = P.map(o => GV("dRow", { p: o.p, s: f1(o.s), m: f1(o.m), r: rat(o.s, o.m) }));
  const aria = GV("dH") + ". " + lines.join(" ");
  return `<div class="gv-dv"><h4>${esc(GV("dH"))}</h4><p class="small">${esc(GV("dSub", { a: ld(dv.from), b: ld(dv.to) }))}</p>
    <svg class="gv-svg" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${esc(aria)}">${axis}${bars}</svg>
    <p class="small gv-dvl"><span><i class="gv-dvs"></i>${esc(GV("dLs"))}</span><span><i class="gv-dvm"></i>${esc(GV("dLm"))}</span><span class="muted">PM2.5, ${LANG === "en" ? "µg/m³" : "мкг/м³"}</span></p>
    <ul class="small gv-dvp">${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    ${under ? `<p class="small"><b>${esc(GV("dPeak", { h: hh(pk.i), s: f1(pk.s), m: f1(pk.m), n: pk.n }))}</b> ${esc(GV("dUse"))}</p>` : ""}
    <details class="gv-noprint"><summary class="small">${esc(GV("dTbl"))}</summary><div class="gv-tw"><table class="gv-t"><thead><tr><th>${GV("cH")}</th><th>${GV("dLs")}</th><th>${GV("dLm")}</th><th>${GV("cN")}</th></tr></thead>
      <tbody>${H.map(x => `<tr><td>${hh(x.i)}</td><td>${f1(x.s)}</td><td>${f1(x.m)}</td><td>${x.n}</td></tr>`).join("")}</tbody></table></div></details>
    <p class="small muted">${gvA("sc")} · ${gvA("om")}</p></div>`;
}
function gvRender(el, G) {
  const R = G.rows, by30 = R.slice().sort((a, b) => (b.a30 || 0) - (a.a30 || 0) || (b.now || 0) - (a.now || 0)), byP = R.slice().sort((a, b) => b.P - a.P || (b.now || 0) - (a.now || 0)).slice(0, 10);
  const pin = a => a == null ? "—" : `<span class="gv-chip" style="background:${level(a).color}">${Math.round(a)}</span>`;
  const hS = gvMean(R.map(r => r.hOver)), hN = gvMean(R.map(r => r.hN)), dO = gvMean(R.map(r => r.dOver)), dN = gvMean(R.map(r => r.dN));
  const Es = R.map(r => r.E).filter(Boolean), tp = Es.length ? Math.round(gvMean(Es.map(e => e.tp))) : null;
  const zm = gvZoneMode(R), Z = zm ? gvZones(R) : [], myD = R.find(r => r.id === state.district) || null, myZ = myD ? Z.find(z => z.rows.includes(myD)) : null;
  const TBL = `<div class="gv-tw"><table class="gv-t"><thead><tr><th>#</th><th>${GV("cD")}</th><th>${GV("cNow")}</th><th>${GV("c7")}</th><th>${GV("c30")}</th><th>${GV("cH")}</th><th>${GV("cT")}</th></tr></thead>
      <tbody>${by30.map((r, i) => `<tr><td>${i + 1}</td><td>${esc(r.name)}</td><td>${pin(r.now)}</td><td>${pin(r.a7)}</td><td>${pin(r.a30)}</td><td>${r.hOver}<span class="muted">/${r.hN}</span></td><td>${pin(r.tmrMax)}</td></tr>`).join("")}</tbody></table></div>`;
  el.innerHTML = `<div class="gv-print-h"><div><b>Таза Аба · ${esc(GV("repH"))} · ${esc(tr(cityObj().name))}</b><br><span class="small">${esc(GV("repGen", { t: new Date(G.at).toLocaleString(numLocale()) }))} · ${esc(SITE_URL)}</span></div><figure class="gv-qr"><img src="icons/qr-site.svg" alt="QR: https://taza-aba.surge.sh/" width="76" height="76"><figcaption>${GV("qrCap")}<br>taza-aba.surge.sh</figcaption></figure></div>
    <h1>${GV("title")}</h1><p class="sub">${esc(GV("sub", { city: tr(cityObj().name) }))}</p>
    <div class="gv-acts gv-noprint"><button class="btn" id="gvPrint" type="button">🖨️ ${GV("print")}</button><button class="btn ghost" id="gvCsv" type="button">⬇️ ${GV("csv")}</button><button class="btn ghost" id="gvJson" type="button">⬇️ ${GV("json")}</button><a class="btn ghost" href="#govbrief">${GV("bLink")}</a><a class="btn ghost" href="#govpolicy">${GV("polLink")}</a></div>
    ${gvBanner(G)}
    <div class="gv-kpis">
      <div class="card gv-k"><small>${GV("kNow")}</small>${pin(gvMean(R.map(r => r.now)))}</div>
      <div class="card gv-k"><small>${GV("k7")}</small>${pin(gvMean(R.map(r => r.a7)))}</div>
      <div class="card gv-k"><small>${GV("k30")}</small>${pin(gvMean(R.map(r => r.a30)))}</div>
      <div class="card gv-k"><small>${GV("kH")}</small><b>${gvF(hS)}</b><span class="small muted"> / ${gvF(hN)}</span></div>
      <div class="card gv-k"><small>${GV("kD")}</small><b>${gvF(dO)}</b><span class="small muted"> / ${gvF(dN)}</span></div></div>
    ${gvTrendHTML(G)}
    <div class="card"><h3>📊 ${GV(zm ? "zH" : "rankH")}</h3>${zm ? `<p class="small gv-grid">${esc(GV("zNote", { city: tr(cityObj().name), zw: gvZw(Z.length) }))}</p>
      <div class="gv-zones">${Z.map((z, i) => `<div class="gv-zone" style="border-left-color:${level(z.a30).color}"><div class="gv-zh"><b>${esc(GV("zN", { i: i + 1 }))}</b><span class="muted">${esc(gvNd(z.n, "nom"))}</span></div>
        <div class="gv-zs"><span><small>${GV("c30")}</small>${pin(z.a30)}</span><span><small>${GV("c7")}</small>${pin(z.a7)}</span><span><small>${GV("cH")}</small><span><b>${z.hOver}</b><span class="muted small">/${z.hN}</span></span></span><span><small>${GV("cT")}</small>${pin(z.tmrMax)}</span></div>
        <p class="small">${esc(GV("zEx", { ex: gvEx(z.rows, 4) }))}${myZ === z ? ` · <b>${esc(GV("zYou"))}: ${esc(myD.name)}</b>` : ""}</p></div>`).join("")}</div>
      <details class="gv-zall"><summary>${esc(GV("zAll", { n: R.length }))}</summary>${TBL}</details>` : TBL}
      <p class="small muted">${GV("whoNote")} ${gvA("who21")}</p><p class="small gv-grid">${esc(GV("gridNote", { z: new Set(R.map(gvZoneKey)).size, zw: gvZw(new Set(R.map(gvZoneKey)).size), n: R.length }))}</p></div>
    ${gvSensHTML(new Set(R.map(gvZoneKey)).size)}
    ${gvCovHTML()}
    <div class="card gv-win"><h3>❄️ ${GV("winH")}</h3><p class="small">${GV("winSub")}</p><div id="gvWin"><p class="small muted">${GV("winLoad")}</p></div></div>
    <div class="card"><h3>🔥🚗 ${GV("contH")}</h3>${tp == null ? `<p class="small muted">${GV("mNone")}</p>` : `<div class="tf-bar" role="img" aria-label="${GV("trans")} ${tp}% / ${GV("heat")} ${100 - tp}%"><span class="tf-t" style="width:${tp}%">${tp}%</span><span class="tf-h" style="width:${100 - tp}%">${100 - tp}%</span></div>
      <div class="row between small" style="margin-top:4px"><span>${GV("trans")}</span><span>${GV("heat")}</span></div>`}
      <p class="small muted"><b>${GV("contNote")}</b> <a href="#traffic" class="gv-noprint">${GV("how")}</a></p><p class="small muted">${gvA("air24")} · ${gvA("wb24")} · ${gvA("undp")}</p></div>
    <div class="card"><h3>🎯 ${GV("priH")}</h3><p class="small">${GV("priSub")}</p>
      <ol class="gv-pri">${(zm ? Z.slice().sort((a, b) => b.P - a.P).map(z => ({ name: GV("zN", { i: Z.indexOf(z) + 1 }) + " · " + gvNd(z.n, "nom"), ex: gvEx(z.rows, 4), P: z.P, meas: z.meas, E: z.E })) : byP).map(r => `<li><div class="gv-pr"><b>${esc(r.name)}</b><span class="gv-pp">${r.P} ${GV("pts")}</span></div><div class="gv-bar"><i style="width:${Math.max(2, Math.min(100, r.P))}%"></i></div>
        <div class="gv-ms">${r.meas.map(m => `<span class="gv-m gv-${m}">${esc(GV(m))}</span>`).join("")}${r.E ? `<span class="small muted">${GV("heat")} ${r.E.hp}% · ${GV("trans")} ${r.E.tp}%</span>` : ""}</div>${r.ex ? `<p class="small muted gv-zex">${esc(GV("zEx", { ex: r.ex }))}</p>` : ""}</li>`).join("")}</ol>
      <details class="gv-f" open><summary>${GV("fH")}</summary><p class="small">${GV("fTxt")}</p></details></div>
    <div class="card"><h3>📸 ${GV("cmpH")}</h3><p class="small muted">${GV("cmpNote")}</p>${gvCmpHTML()}</div>
    <div class="card"><h3>🗂️ ${GV("expH")}</h3><p class="small">${GV("expTxt")}</p><p class="small">${gvA("om")}</p></div>
    <div class="foot">${t("footProto")}</div>`;
  $("#gvPrint").onclick = () => window.print();
  $("#gvCsv").onclick = () => gvExport(G, "csv"); $("#gvJson").onclick = () => gvExport(G, "json");
  const cb = $("#gvCopy"); if (cb) cb.onclick = () => copyText(gvWarnText(G));
  gvSensAccMount(); gvCovMount();
  const wc = CITY; gvWinLoad().then(R => { const w = $("#gvWin"); if (w && CITY === wc) w.innerHTML = gvWinHTML(R); })
    .catch(e => { console.warn("gov winters:", e.message); const w = $("#gvWin"); if (w) w.innerHTML = `<p class="small muted">${GV("winErr")}</p>`; });
  const me = $("#gvCmpMap");
  if (me) { const C = (state.complaints || []).filter(inCity), by = {};
    C.forEach(c => { const d = nearestDistrict(c.lat, c.lon); (by[d.id] = by[d.id] || { d, n: 0 }).n++; });
    const m = mkMap("gvCmpMap", { zoomControl: true }).setView(cityObj().center, cityObj().zoom || 12); map = m; baseTiles(m);
    Object.values(by).forEach(b => L.circleMarker([b.d.lat, b.d.lon], { radius: 8 + 4 * Math.sqrt(b.n), color: "#c0392b", fillColor: "#e74c3c", fillOpacity: 0.45, weight: 1 }).bindTooltip(`${esc(dName(b.d))}: ${b.n}`).addTo(m));
    C.forEach(c => L.circleMarker([c.lat, c.lon], { radius: 3, color: "#7b1d12", weight: 1, fillOpacity: 0.9 }).addTo(m));
    setTimeout(() => { if (m === map && m._mapPane) m.invalidateSize(); }, 60); }
}
window.viewGov = function (el) {
  const c = CITY, hit = gvCache[c];
  if (hit && Date.now() - hit.at < 30 * 60e3) return gvRender(el, hit);
  el.innerHTML = `<h1>${GV("title")}</h1><p class="sub">${GV("loading")}</p><div class="skeleton"></div>`;
  gvLoad().then(G => { if (CITY === c && (location.hash || "").slice(1).split("/")[0] === "gov" && el.isConnected) gvRender(el, G); })
    .catch(e => { console.warn("gov:", e.message); if ((location.hash || "").slice(1).split("/")[0] !== "gov") return;
      el.innerHTML = `<h1>${GV("title")}</h1><div class="card nodata"><p>${GV("err")}</p><button class="btn" id="gvRetry" type="button">${GV("retry")}</button></div>`; $("#gvRetry").onclick = () => route(true); });
};
window.viewGovPolicy = function (el) {
  const sec = (h, p, srcs) => `<div class="card gv-pol"><h3>${GV(h)}</h3><p>${esc(GV(p))}</p><p class="small">${srcs.map(gvA).join(" · ")}</p></div>`;
  el.innerHTML = `<p class="gv-noprint"><a href="#gov">${GV("back")}</a> · <a href="#govbrief">${GV("bLink")}</a></p><h1>${GV("pTitle")}</h1><p class="sub">${GV("pSub")}</p>
    ${sec("p1H", "p1", ["unicef", "wbp", "wbh", "adb"])}${sec("p2H", "p2", ["wbp", "unicef"])}${sec("p3H", "p3", ["undp", "air24", "wb24"])}${sec("p4H", "p4", ["wbp"])}${sec("p5H", "p5", ["who21", "who20", "unicef"])}
    <div class="card gv-pitch"><h3>🤝 ${GV("pitchH")}</h3><ul>${GV("pitch").map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
    <div class="foot">${t("footProto")}</div>`;
};
/* v29: «Памятка на 1 страницу» (#govbrief) — короткий лист для акимата / мэрии: ситуация, мера на завтра, где в первую очередь, меры на сезон.
 * Только данные, уже посчитанные в панели (gvLoad / gvWinLoad), и источники со страницы «Меры с доказанной пользой». */
Object.assign(GV_S.ru, { bPri: "приоритет {p}/100", bZones: "Модель CAMS различает здесь {zw} на {n} районов: районы одной зоны получают одинаковые значения. Приоритет — по формуле из полной панели.", bLink: "📄 Памятка на 1 страницу", bTitle: "Памятка по смогу для акимата / мэрии", bSub: "{city} · {date}. Коротко: ситуация, что сделать завтра, где в первую очередь и меры на сезон. Помещается на один лист A4.",
  bPrint: "🖨️ Печать / PDF", bCopy: "📋 Скопировать текст", bS1: "1. Ситуация сейчас", bNow: "AQI сейчас", b30: "Средний AQI за 30 дней", bDw: "Дней выше нормы ВОЗ за 30 дней", bTmr: "Прогноз на завтра (макс.)",
  bWin: "Прошлая зима ({w}, модель CAMS, центр города): средний PM2.5 {pm} мкг/м³, суток выше нормы ВОЗ — {dw} из {n}{ch}.", bWinCh: "; к зиме до этого {c}", bWinNone: "Архив зим сейчас недоступен — см. полную панель позже.",
  bS2: "2. Завтра: AQI до {a} — «{lvl}»", bS3: "3. Где в первую очередь", bOne: "Модель CAMS (~40 км) не различает районы города {city} — данные одинаковы для всех районов, поэтому меры здесь — для всего города. Для адресных мер нужны наземные датчики.",
  bS4: "4. Меры на отопительный сезон", bM: [["Отопление — главный зимний источник: утепление домов, переход с угля на тепловые насосы и электроотопление, зоны без угля.", ["unicef", "adb", "wbp"]],
    ["Раннее предупреждение: публиковать прогноз смога, в дни смога — меры для школ и поликлиник (раздел 2).", ["who20", "airnow"]],
    ["Транспорт: общественный транспорт и контроль выхлопа.", ["undp", "air24"]],
    ["Озеленение и полив против пыли.", ["wbp"]],
    ["Данные: собирать и анализировать данные о воздухе, проверки, координация ведомств.", ["wbp"]]],
  bSrcNote: "Источники мер — по Бишкеку и Кыргызстану; для малых городов это ориентир, а не норматив.", bTr: "Источники мер — по Бишкеку и Кыргызстану.",
  bData: "Данные: модель CAMS (Copernicus) через Open-Meteo, CC BY 4.0 — модельные значения, а не измерения датчиков. Вклад отопления и транспорта — оценка. Подробно: раздел «Для мэрии и государства».", bFull: "← Полная панель", bCopied: "Текст памятки скопирован" });
Object.assign(GV_S.ky, { bPri: "артыкчылык {p}/100", bZones: "CAMS модели бул жерде {n} районго {z} зонаны айырмалайт: бир зонадагы райондор бирдей маани алат. Артыкчылык — толук панелдеги формула боюнча.", bLink: "📄 1 барактык эскертме", bTitle: "Акимчилик / мэрия үчүн түтүн боюнча эскертме", bSub: "{city} · {date}. Кыскача: абал, эртең эмне кылуу керек, биринчи кезекте кайда жана сезондук чаралар. Бир A4 баракка батат.",
  bPrint: "🖨️ Басып чыгаруу / PDF", bCopy: "📋 Текстти көчүрүү", bS1: "1. Азыркы абал", bNow: "Азыркы AQI", b30: "30 күндүк орточо AQI", bDw: "30 күндө ДССУ ченеминен ашкан күндөр", bTmr: "Эртеңки божомол (макс.)",
  bWin: "Өткөн кыш ({w}, CAMS модели, шаардын борбору): орточо PM2.5 {pm} мкг/м³, ДССУ ченеминен ашкан сутка — {n} ичинен {dw}{ch}.", bWinCh: "; андан мурунку кышка карата {c}", bWinNone: "Кыштардын архиви азыр жеткиликсиз — толук панелди кийинчерээк караңыз.",
  bS2: "2. Эртең: AQI {a} чейин — «{lvl}»", bS3: "3. Биринчи кезекте кайда", bOne: "CAMS модели (~40 км) {city} шаарынын райондорун айырмалабайт — маалымат бардык райондо бирдей, ошондуктан бул жердеги чаралар бүт шаар үчүн. Даректүү чаралар үчүн жердеги датчиктер керек.",
  bS4: "4. Жылытуу мезгилиндеги чаралар", bM: [["Жылытуу — кышкы башкы булак: үйлөрдү жылуулоо, көмүрдөн жылуулук насосторуна жана электр жылытууга өтүү, көмүрсүз зоналар.", ["unicef", "adb", "wbp"]],
    ["Алдын ала эскертүү: түтүн божомолун жарыялоо, түтүн күндөрү мектептер жана емканалар үчүн чаралар (2-бөлүм).", ["who20", "airnow"]],
    ["Транспорт: коомдук транспорт жана түтүндү текшерүү.", ["undp", "air24"]],
    ["Чаңга каршы жашылдандыруу жана сугат.", ["wbp"]],
    ["Маалымат: аба тууралуу маалыматты чогултуу жана талдоо, текшерүүлөр, ведомстволордун координациясы.", ["wbp"]]],
  bSrcNote: "Чаралардын булактары Бишкек жана Кыргызстан боюнча; чакан шаарлар үчүн бул ченем эмес, багыт.", bTr: "Чаралардын булактары Бишкек жана Кыргызстан боюнча.",
  bData: "Маалымат: Open-Meteo аркылуу CAMS (Copernicus) модели, CC BY 4.0 — моделдик маанилер, датчиктердин өлчөөлөрү эмес. Жылытуу менен транспорттун үлүшү — баалоо. Толугу: «Мэрия жана мамлекет үчүн» бөлүмү.", bFull: "← Толук панель", bCopied: "Эскертменин тексти көчүрүлдү" });
Object.assign(GV_S.en, { bPri: "priority {p}/100", bZones: "Here the CAMS model distinguishes {zw} across {n} districts: districts in the same zone get identical values. Priority uses the formula from the full dashboard.", bLink: "📄 One-page brief", bTitle: "Smog brief for the akimat / city hall", bSub: "{city} · {date}. In short: the situation, what to do tomorrow, where to act first and measures for the season. Fits on one A4 page.",
  bPrint: "🖨️ Print / PDF", bCopy: "📋 Copy text", bS1: "1. Situation now", bNow: "AQI now", b30: "30-day average AQI", bDw: "Days above WHO guideline (30 d)", bTmr: "Tomorrow's forecast (max)",
  bWin: "Last winter ({w}, CAMS model, city centre): mean PM2.5 {pm} µg/m³, days above the WHO guideline — {dw} of {n}{ch}.", bWinCh: "; vs the winter before {c}", bWinNone: "The winter archive is unavailable right now — check the full dashboard later.",
  bS2: "2. Tomorrow: AQI up to {a} — \"{lvl}\"", bS3: "3. Where to act first", bOne: "The CAMS model (~40 km) does not distinguish districts of {city} — values are the same for all districts, so the measures here apply citywide. Targeted measures need ground sensors.",
  bS4: "4. Measures for the heating season", bM: [["Heating is the main winter source: insulate homes, switch from coal to heat pumps and electric heating, coal-free zones.", ["unicef", "adb", "wbp"]],
    ["Early warning: publish the smog forecast; on smog days apply the school and clinic measures (section 2).", ["who20", "airnow"]],
    ["Transport: public transport and exhaust checks.", ["undp", "air24"]],
    ["Greening and irrigation against dust.", ["wbp"]],
    ["Data: collect and analyse air-quality data, inspections, cross-agency coordination.", ["wbp"]]],
  bSrcNote: "Sources for the measures cover Bishkek and Kyrgyzstan; for small towns they are a guide, not a regulation.", bTr: "Sources for the measures cover Bishkek and Kyrgyzstan.",
  bData: "Data: CAMS model (Copernicus) via Open-Meteo, CC BY 4.0 — modelled values, not sensor measurements. Heating/transport shares are estimates. Details: «For city hall & government».", bFull: "← Full dashboard", bCopied: "Brief text copied" });
const GV_SHORT = { unicef: "UNICEF 2023", adb: "ADB 2023", wbp: "World Bank 2023", who20: "WHO 2020", who21: "WHO 2021", airnow: "AirNow (US EPA)", undp: "UNDP 2023", air24: "Air 2024", om: "Open-Meteo" };
const gvAs = k => `<a href="${GV_SRC[k][0]}" target="_blank" rel="noopener" title="${esc(GV_SRC[k][1])}">${esc(GV_SHORT[k] || GV_SRC[k][1])}</a>`;
function gvBriefData(G) {
  const R = G.rows, zones = new Set(R.map(r => (r.a30 || 0).toFixed(2) + "|" + (r.pm30 || 0).toFixed(2))).size;
  const Rt = R.filter(r => r.tmrMax != null), w = Rt.length ? Rt.reduce((b, r) => r.tmrMax > b.tmrMax ? r : b) : null;
  const top = R.slice().sort((a, b) => b.P - a.P || (b.now || 0) - (a.now || 0)).slice(0, 3);
  return { now: gvMean(R.map(r => r.now)), a30: gvMean(R.map(r => r.a30)), dO: gvMean(R.map(r => r.dOver)), dN: gvMean(R.map(r => r.dN)),
    tmr: w ? Math.round(w.tmrMax) : null, worst: w, zones,
    top: zones > 1 && R.length > 1 ? (gvZoneMode(R) ? gvZones(R).map((z, i) => ({ name: GV("zN", { i: i + 1 }) + " — " + gvNd(z.n, "nom") + " (" + gvEx(z.rows, 3) + ")", P: z.P, meas: z.meas })).sort((a, b) => b.P - a.P) : top) : [] };
}
function gvBriefWin(W) {
  const ws = (W && W.winters || []).filter(x => !x.part); if (!ws.length) return null;
  const l = ws[ws.length - 1], p = ws[ws.length - 2], ch = p ? Math.round((l.pm / p.pm - 1) * 100) : null;
  return GV("bWin", { w: `${l.y}/${String(l.y + 1).slice(2)}`, pm: fmt(l.pm, 1), dw: l.dw, n: l.n, ch: ch == null ? "" : GV("bWinCh", { c: (ch > 0 ? "+" : ch < 0 ? "−" : "") + Math.abs(ch) + "%" }) });
}
Object.assign(GV_S.ru, { bSens: "Датчики Sensor.Community сейчас ({n}): медиана PM2.5 {s} мкг/м³, модель CAMS в тех же местах {m} мкг/м³ (недорогие датчики жителей, не официальные измерения)." });
Object.assign(GV_S.ky, { bSens: "Sensor.Community датчиктери азыр ({n}): PM2.5 медианасы {s} мкг/м³, ошол эле жерлерде CAMS модели {m} мкг/м³ (тургундардын арзан датчиктери, расмий өлчөө эмес)." });
Object.assign(GV_S.en, { bSens: "Sensor.Community sensors now ({n}): median PM2.5 {s} µg/m³, CAMS model at the same places {m} µg/m³ (low-cost citizen sensors, not official measurements)." });
/* v76: строка в памятке A4 — как модель расходится с датчиками вечером (18–23 ч) за 7 дней (forecast/coeffs.json → div, GitHub Actions) */
Object.assign(GV_S.ru, { bDivHi: "Вечером (18–23 ч) за последние {d} дн. модель CAMS занижает в {k} раза: датчики в среднем {s}, модель {m} мкг/м³ ({a}–{b}).",
  bDivLo: "Вечером (18–23 ч) за последние {d} дн. модель CAMS завышает в {k} раза: датчики в среднем {s}, модель {m} мкг/м³ ({a}–{b}).",
  bDivEq: "Вечером (18–23 ч) за последние {d} дн. модель CAMS и датчики близки: датчики в среднем {s}, модель {m} мкг/м³ ({a}–{b})." });
Object.assign(GV_S.ky, { bDivHi: "Кечинде (18–23) акыркы {d} күндө CAMS модели {k} эсе төмөндөтөт: датчиктер орточо {s}, модель {m} мкг/м³ ({a}–{b}).",
  bDivLo: "Кечинде (18–23) акыркы {d} күндө CAMS модели {k} эсе жогорулатат: датчиктер орточо {s}, модель {m} мкг/м³ ({a}–{b}).",
  bDivEq: "Кечинде (18–23) акыркы {d} күндө CAMS модели менен датчиктер жакын: датчиктер орточо {s}, модель {m} мкг/м³ ({a}–{b})." });
Object.assign(GV_S.en, { bDivHi: "In the evening (18–23 h) over the last {d} days the CAMS model underestimates {k}-fold: sensors average {s}, model {m} µg/m³ ({a}–{b}).",
  bDivLo: "In the evening (18–23 h) over the last {d} days the CAMS model overestimates {k}-fold: sensors average {s}, model {m} µg/m³ ({a}–{b}).",
  bDivEq: "In the evening (18–23 h) over the last {d} days the CAMS model and sensors are close: sensors average {s}, model {m} µg/m³ ({a}–{b})." });
function gvDivLine(dv) {
  const ev = (dv && dv.h || []).map((x, i) => ({ i, n: x[0], s: x[1], m: x[2] })).filter(x => x.i >= 18 && x.n >= 3 && x.s != null && x.m != null);
  if (ev.length < 4) return null;
  const s = gvMean(ev.map(x => x.s)), m = gvMean(ev.map(x => x.m)); if (!(m > 0) || !(s > 0)) return null;
  const k = s / m, ld = z => z ? new Date(new Date(z).getTime() + 6 * 36e5).toISOString().slice(0, 10).split("-").reverse().slice(0, 2).join(".") : "—";
  const o = { d: dv.days || 7, s: gvF(s, 1), m: gvF(m, 1), a: ld(dv.from), b: ld(dv.to) };
  return k >= 1.2 ? GV("bDivHi", { ...o, k: fmt(k, 1) }) : k <= 1 / 1.2 ? GV("bDivLo", { ...o, k: fmt(1 / k, 1) }) : GV("bDivEq", o);
}
function gvSensLine() { const D = gvSensData(); return D.rows.length ? GV("bSens", { n: gvSensN(D.rows.length), s: gvF(D.ms, 1), m: gvF(D.mm, 1) }) : null; }
function gvBriefText(G, B, winLine, divLine) {
  const c = tr(cityObj().name), L = [GV("bTitle") + " — " + c + ", " + new Date(G.at).toLocaleDateString(numLocale()), "",
    GV("bS1") + ": " + GV("bNow") + " " + gvF(B.now) + "; " + GV("b30") + " " + gvF(B.a30) + "; " + GV("bDw") + " " + gvF(B.dO) + "/" + gvF(B.dN) + "."];
  if (winLine) L.push(winLine);
  { const sl = gvSensLine(); if (sl) L.push(sl); }
  if (divLine) L.push(divLine);
  if (B.tmr != null) { const li = gvLvlIdx(B.tmr); L.push("", GV("bS2", { a: B.tmr, lvl: tr(level(B.tmr).name) }), ...GV("meas")[Math.min(li, 5)].map(x => "• " + x)); }
  L.push("", GV("bS3") + ":"); if (B.top.length) B.top.forEach((r, i) => L.push(`${i + 1}) ${r.name} (${GV("bPri", { p: r.P })}) — ${r.meas.map(m => GV(m)).join("; ")}`)); else L.push(GV("bOne", { city: c }));
  L.push("", GV("bS4") + ":", ...GV("bM").map(m => "• " + m[0] + " (" + m[1].map(k => GV_SHORT[k]).join(", ") + ")"), "", GV("bData"), SITE_URL);
  return L.join("\n");
}
function gvBriefRender(el, G) {
  const c = tr(cityObj().name), B = gvBriefData(G), pin = a => a == null ? "—" : `<span class="gv-chip" style="background:${level(a).color}">${Math.round(a)}</span>`;
  const cached = (() => { try { return JSON.parse(localStorage.getItem("tazaAba.gvWin2." + CITY) || "null"); } catch (e) { return null; } })();
  let winLine = gvBriefWin(cached);
  const li = B.tmr != null ? gvLvlIdx(B.tmr) : 0, L = B.tmr != null ? level(B.tmr) : null;
  el.innerHTML = `<div class="gb-sheet">
    <div class="gb-head"><div><p class="gv-noprint small"><a href="#gov">${GV("bFull")}</a></p><h1>${GV("bTitle")}</h1><p class="sub">${esc(GV("bSub", { city: c, date: new Date(G.at).toLocaleDateString(numLocale()) }))}</p></div>
      <figure class="gb-qr"><img src="icons/qr-site.svg" alt="QR: https://taza-aba.surge.sh/" width="72" height="72"><figcaption>taza-aba.surge.sh</figcaption></figure></div>
    <div class="gv-acts gv-noprint"><button class="btn" id="gbPrint" type="button">${GV("bPrint")}</button><button class="btn ghost" id="gbCopy" type="button">${GV("bCopy")}</button></div>
    <section class="card gb-s"><h3>${GV("bS1")}</h3><div class="gb-k">
      <div><small>${GV("bNow")}</small>${pin(B.now)}</div><div><small>${GV("b30")}</small>${pin(B.a30)}</div>
      <div><small>${GV("bDw")}</small><span><b>${gvF(B.dO)}</b><span class="small muted"> / ${gvF(B.dN)}</span></span></div><div><small>${GV("bTmr")}</small>${pin(B.tmr)}</div></div>
      <p class="small" id="gbWin">❄️ ${esc(winLine || GV("winLoad"))}</p>${(() => { const sl = gvSensLine(); return sl ? `<p class="small gb-sens">📡 ${esc(sl)}</p>` : ""; })()}<p class="small gb-div" id="gbDiv" hidden></p></section>
    ${L ? `<section class="card gb-s" style="border-left:6px solid ${L.color}"><h3>${esc(GV("bS2", { a: B.tmr, lvl: tr(L.name) }))}</h3><ul class="gv-meas">${GV("meas")[Math.min(li, 5)].map(x => `<li>${esc(x)}</li>`).join("")}</ul>
      <p class="small muted">${GV("tmrSrc")} ${gvAs("airnow")} · ${gvAs("who20")}</p></section>` : ""}
    <section class="card gb-s"><h3>${GV("bS3")}</h3>${B.top.length ? `<ol class="gb-top">${B.top.map(r => `<li><b>${esc(r.name)}</b> <span class="small muted">(${esc(GV("bPri", { p: r.P }))})</span> — ${r.meas.map(m => `<span class="gv-m gv-${m}">${esc(GV(m))}</span>`).join(" ")}</li>`).join("")}</ol>
      <p class="small muted">${esc(GV("bZones", { z: B.zones, zw: gvZw(B.zones), n: G.rows.length }))}</p>` : `<p class="small gv-grid">${esc(GV("bOne", { city: c }))}</p>`}</section>
    <section class="card gb-s"><h3>${GV("bS4")}</h3><ol class="gb-m">${GV("bM").map(m => `<li>${esc(m[0])} <span class="small muted">${m[1].map(gvAs).join(", ")}</span></li>`).join("")}</ol>
      <p class="small muted">${GV("bSrcNote")}</p></section>
    <p class="small muted gb-data">${GV("bData")} ${gvAs("om")}</p></div>`;
  $("#gbPrint").onclick = () => window.print();
  let divLine = null;
  $("#gbCopy").onclick = () => copyText(gvBriefText(G, B, winLine, divLine));
  { const dc = CITY; gvCoef().then(j => { const x = j && j.cities && j.cities[dc], p = $("#gbDiv"); if (!p || CITY !== dc || !x || !x.div) return;
    divLine = gvDivLine(x.div); if (divLine) { p.textContent = "🌙 " + divLine; p.hidden = false; } }).catch(e => console.warn("brief div:", e.message)); }
  if (!winLine) { const wc = CITY; gvWinLoad().then(W => { winLine = gvBriefWin(W); const p = $("#gbWin"); if (p && CITY === wc) p.textContent = "❄️ " + (winLine || GV("bWinNone")); }).catch(e => { console.warn("brief winters:", e.message); const p = $("#gbWin"); if (p) p.textContent = "❄️ " + GV("bWinNone"); }); }
}
window.viewGovBrief = function (el) {
  const c = CITY, hit = gvCache[c];
  if (hit && Date.now() - hit.at < 30 * 60e3) return gvBriefRender(el, hit);
  el.innerHTML = `<h1>${GV("bTitle")}</h1><p class="sub">${GV("loading")}</p><div class="skeleton"></div>`;
  gvLoad().then(G => { if (CITY === c && (location.hash || "").slice(1).split("/")[0] === "govbrief" && el.isConnected) gvBriefRender(el, G); })
    .catch(e => { console.warn("brief:", e.message); if ((location.hash || "").slice(1).split("/")[0] !== "govbrief") return;
      el.innerHTML = `<h1>${GV("bTitle")}</h1><div class="card nodata"><p>${GV("err")}</p><button class="btn" id="gvRetry" type="button">${GV("retry")}</button></div>`; $("#gvRetry").onclick = () => route(true); });
};
/* v30: открытый архив по дням (GitHub Actions → archive/<city>.csv в публичном репозитории) и газетный вариант памятки на кыргызском (A5). */
Object.assign(GV_S.ru, { arH: "Открытый архив по дням", arSub: "Каждую ночь (около 04:40 по Бишкеку) GitHub Actions сохраняет суточные значения по {n} городам (центр города, модель CAMS) в открытый репозиторий. Уже записанные дни не меняются — архив можно цитировать и проверять.",
  arLoad: "Загружаю архив…", arErr: "Архив сейчас недоступен (GitHub). Попробуйте позже.", arNone: "Для этого города в архиве пока нет данных.",
  arStat: "{city}: {d} суток, с {a} по {b}. Суток со средним PM2.5 выше нормы ВОЗ (15 мкг/м³): {w} ({p} %).", arUpd: "Обновлено: {t}.", arChart: "Суточный средний PM2.5 за весь архив, мкг/м³; тонкая линия — сутки, толстая — среднее за 15 дней; пунктир — норма ВОЗ 15",
  arCsv: "CSV: {city}", arAll: "Все города (index.json)", arGh: "Папка на GitHub ↗", arColsH: "Столбцы CSV",
  arCols: "date — дата (местное время); aqi_mean / aqi_max — средний и максимальный US AQI за сутки; pm2_5_mean / pm2_5_max, pm10_mean, no2_mean — мкг/м³; hours_pm2_5_over_15 — часов с PM2.5 > 15; hours — часов с данными (сутки с < 20 часами не пишутся).",
  arNote: "Модельные значения CAMS (Copernicus) через Open-Meteo, CC BY 4.0 — не измерения датчиков. Модель может заметно отличаться от наземных измерений, особенно при зимних инверсиях: сравнивайте дни и годы между собой, а не с нормами и не города между собой. История до {s} догружена один раз из архива Open-Meteo (с {f}).",
  gzLink: "🗞️ A5 для районной газеты (кыргызча / русский)", gzBack: "← Памятка A4", gzPrint: "🖨️ Печать A5 / PDF", gzCopy: "📋 Скопировать текст листа", gzLang: "Язык листа", gzHint: "Лист A5 для районной газеты или доски объявлений: цифры за 30 дней, шкала AQI с советами жителям и QR на живой прогноз. Язык листа — кыргызский или русский (для двуязычных газет), независимо от языка приложения." });
Object.assign(GV_S.ky, { arH: "Күн сайынкы ачык архив", arSub: "Күн сайын түнкүсүн (Бишкек убактысы менен болжол менен 04:40) GitHub Actions {n} шаар боюнча суткалык маанилерди (шаардын борбору, CAMS модели) ачык репозиторийге сактайт. Жазылган күндөр өзгөрбөйт — архивге шилтеме берип, текшерсе болот.",
  arLoad: "Архив жүктөлүүдө…", arErr: "Архив азыр жеткиликсиз (GitHub). Кийинчерээк аракет кылыңыз.", arNone: "Бул шаар боюнча архивде азырынча маалымат жок.",
  arStat: "{city}: {d} сутка, {a} – {b}. Орточо PM2.5 ДССУ ченеминен (15 мкг/м³) ашкан сутка: {w} ({p} %).", arUpd: "Жаңыланды: {t}.", arChart: "Бүт архив боюнча суткалык орточо PM2.5, мкг/м³; ичке сызык — сутка, жоон сызык — 15 күндүк орточо; пунктир — ДССУ ченеми 15",
  arCsv: "CSV: {city}", arAll: "Бардык шаарлар (index.json)", arGh: "GitHub'дагы папка ↗", arColsH: "CSV мамычалары",
  arCols: "date — күнү (жергиликтүү убакыт); aqi_mean / aqi_max — сутканын орточо жана эң жогорку US AQI; pm2_5_mean / pm2_5_max, pm10_mean, no2_mean — мкг/м³; hours_pm2_5_over_15 — PM2.5 > 15 болгон сааттар; hours — маалыматы бар сааттар (20 сааттан аз сутка жазылбайт).",
  arNote: "Open-Meteo аркылуу CAMS (Copernicus) моделинин маанилери, CC BY 4.0 — датчиктердин өлчөөсү эмес. Модель жердеги өлчөөлөрдөн, айрыкча кышкы инверсияда, бир топ айырмаланышы мүмкүн: күндөрдү жана жылдарды ченемдер же башка шаарлар менен эмес, өз ара салыштырыңыз. {s} чейинки тарых Open-Meteo архивинен бир жолу жүктөлгөн ({f} баштап).",
  gzLink: "🗞️ A5 райондук гезит үчүн (кыргызча / орусча)", gzBack: "← A4 эскертме", gzPrint: "🖨️ A5 басып чыгаруу / PDF", gzCopy: "📋 Барактын текстин көчүрүү", gzLang: "Барактын тили", gzHint: "Райондук гезит же кулактандыруу тактасы үчүн A5 барак: 30 күндүк сандар, тургундар үчүн кеңештери менен AQI шкаласы жана жандуу божомолго QR. Барактын тили — кыргызча же орусча (эки тилдүү гезиттер үчүн)." });
Object.assign(GV_S.en, { arH: "Open daily archive", arSub: "Every night (around 04:40 Bishkek time) GitHub Actions saves daily values for {n} cities (city centre, CAMS model) to a public repository. Days already written never change, so the archive can be cited and checked.",
  arLoad: "Loading the archive…", arErr: "The archive is unavailable right now (GitHub). Try again later.", arNone: "No archive data for this city yet.",
  arStat: "{city}: {d} days, {a} to {b}. Days with mean PM2.5 above the WHO guideline (15 µg/m³): {w} ({p}%).", arUpd: "Updated: {t}.", arChart: "Daily mean PM2.5 over the whole archive, µg/m³; thin line — daily, thick line — 15-day mean; dashed line — WHO guideline 15",
  arCsv: "CSV: {city}", arAll: "All cities (index.json)", arGh: "Folder on GitHub ↗", arColsH: "CSV columns",
  arCols: "date — local date; aqi_mean / aqi_max — daily mean and max US AQI; pm2_5_mean / pm2_5_max, pm10_mean, no2_mean — µg/m³; hours_pm2_5_over_15 — hours with PM2.5 > 15; hours — hours with data (days with < 20 hours are not written).",
  arNote: "Modelled CAMS (Copernicus) values via Open-Meteo, CC BY 4.0 — not sensor measurements. The model can differ substantially from ground measurements, especially during winter inversions: compare days and years with each other, not with guidelines or other cities. History before {s} was loaded once from the Open-Meteo archive (from {f}).",
  gzLink: "🗞️ A5 for district newspapers (Kyrgyz / Russian)", gzBack: "← A4 brief", gzPrint: "🖨️ Print A5 / PDF", gzCopy: "📋 Copy sheet text", gzLang: "Sheet language", gzHint: "An A5 sheet for a district newspaper or notice board: 30-day figures, the AQI scale with advice for residents and a QR to the live forecast. The sheet is in Kyrgyz or Russian (for bilingual papers), whatever the app language." });
const GV_AR_REPO = (window.TAZA_CONFIG || {}).ARCHIVE_REPO || "lalalalallalalalalalala/taza-aba";
const GV_AR_RAW = `https://raw.githubusercontent.com/${GV_AR_REPO}/main/archive/`, GV_AR_GH = `https://github.com/${GV_AR_REPO}/tree/main/archive`;
const gvArCache = {};
async function gvTxt(url, ms = 20000) { const r = await fetch(url, { cache: "no-cache", signal: AbortSignal.timeout(ms) }); if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }
async function gvArLoad(city) {
  const hit = gvArCache[city]; if (hit && Date.now() - hit.at < 3600e3) return hit;
  const [idxT, csv] = await Promise.all([gvTxt(GV_AR_RAW + "index.json"), gvTxt(GV_AR_RAW + encodeURIComponent(city) + ".csv").catch(e => /404/.test(e.message) ? "" : Promise.reject(e))]);
  const idx = JSON.parse(idxT), L = csv.split("\n").filter(Boolean), H = (L.shift() || "").split(","), ci = k => H.indexOf(k);
  const rows = L.map(l => l.split(",")).map(c => ({ d: c[ci("date")], pm: c[ci("pm2_5_mean")] === "" ? null : +c[ci("pm2_5_mean")] })).filter(r => r.d);
  return (gvArCache[city] = { at: Date.now(), idx, csv, rows });
}
function gvArHTML(A) {
  const c = tr(cityObj().name), R = A.rows.filter(r => r.pm != null), n = Object.keys(A.idx.cities || {}).length;
  const bf = A.idx.backfill, note = bf ? GV("arNote", { s: gvDate(A.idx.started || ""), f: gvDate(bf.from) }) : GV("arNote").replace(/\s*(История|History|\{s\}).*$/, "");
  const links = `<div class="gv-acts gv-noprint"><button class="btn ghost" id="gvArCsv" type="button"${A.csv ? "" : " disabled"}>⬇️ ${esc(GV("arCsv", { city: c }))}</button><a class="btn ghost" href="${GV_AR_RAW}index.json" target="_blank" rel="noopener">${GV("arAll")}</a><a class="btn ghost" href="${GV_AR_GH}" target="_blank" rel="noopener">${GV("arGh")}</a></div>`;
  if (!R.length) return `<p class="small">${esc(GV("arSub", { n }))}</p><p class="small muted">${GV("arNone")}</p>${links}`;
  const w = R.filter(r => r.pm > 15).length, Wd = 360, Hd = 140, mx = Math.max(20, ...R.map(r => r.pm)) * 1.06;
  const t0 = Date.parse(R[0].d), t1 = Math.max(t0 + 86400e3, Date.parse(R[R.length - 1].d)), x = d => 4 + (Date.parse(d) - t0) / (t1 - t0) * (Wd - 8), y = v => Hd - 16 - (v / mx) * (Hd - 24);
  const pts = R.map(r => `${x(r.d).toFixed(1)},${y(r.pm).toFixed(1)}`).join(" ");
  const sm = R.map((r, i) => { const a = R.slice(Math.max(0, i - 7), i + 8); return `${x(r.d).toFixed(1)},${y(a.reduce((s, q) => s + q.pm, 0) / a.length).toFixed(1)}`; }).join(" ");
  const yrs = []; for (let yy = new Date(t0).getUTCFullYear() + 1; Date.UTC(yy, 0, 1) <= t1; yy++) yrs.push(yy);
  const ticks = yrs.map(yy => { const xx = x(`${yy}-01-01`).toFixed(1); return `<line x1="${xx}" x2="${xx}" y1="4" y2="${Hd - 16}" stroke="#7a8796" stroke-opacity=".3"/><text x="${xx}" y="${Hd - 3}" text-anchor="middle" class="gv-svt">${yy}</text>`; }).join("");
  const svg = `<svg class="gv-svg" viewBox="0 0 ${Wd} ${Hd}" role="img" aria-label="${esc(GV("arChart"))}">${ticks}<line x1="2" x2="${Wd - 2}" y1="${y(15).toFixed(1)}" y2="${y(15).toFixed(1)}" stroke="#e05a2b" stroke-dasharray="4 3"/>
    <polyline points="${pts}" fill="none" stroke="#38BDF8" stroke-opacity=".55" stroke-width=".8" stroke-linejoin="round" class="gv-arl"/><polyline points="${sm}" fill="none" stroke="#0369a1" stroke-width="1.8" stroke-linejoin="round" class="gv-ars"/>
    <text x="4" y="12" class="gv-svt">${fmt(mx / 1.06, 0)} ${GV("unit")}</text><text x="${Wd - 4}" y="${(y(15) - 3).toFixed(1)}" text-anchor="end" class="gv-svt">15</text></svg>`;
  return `<p class="small">${esc(GV("arSub", { n }))}</p>
    <p><b>${esc(GV("arStat", { city: c, d: R.length, a: gvDate(R[0].d), b: gvDate(R[R.length - 1].d), w, p: Math.round(100 * w / R.length) }))}</b></p>
    ${svg}<p class="small muted">${GV("arChart")}. ${esc(GV("arUpd", { t: new Date(A.idx.updated).toLocaleString(numLocale()) }))}</p>${links}
    <details class="gv-f"><summary>${GV("arColsH")}</summary><p class="small">${esc(GV("arCols"))}</p></details><p class="small muted">${esc(note)} ${gvA("om")}</p>`;
}
function gvArMount() {
  const box = $("#gvAr"); if (!box) return; const c = CITY;
  gvArLoad(c).then(A => { const b = $("#gvAr"); if (!b || CITY !== c) return; b.innerHTML = gvArHTML(A);
    const btn = $("#gvArCsv"); if (btn && A.csv) btn.onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + A.csv], { type: "text/csv;charset=utf-8" })); a.download = `taza-aba-archive-${c}.csv`; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }; })
    .catch(e => { console.warn("archive:", e.message); const b = $("#gvAr"); if (b && CITY === c) b.innerHTML = `<p class="small muted">${GV("arErr")}</p><p class="small"><a href="${GV_AR_GH}" target="_blank" rel="noopener">${GV("arGh")}</a></p>`; });
}
(function () { const _r = gvRender;
  gvRender = function (el, G) { _r(el, G); const w = el.querySelector(".gv-win"); if (!w) return;
    w.insertAdjacentHTML("afterend", `<div class="card gv-ar" id="gvArCard"><h3>🗄️ ${GV("arH")}</h3><div id="gvAr"><p class="small muted">${GV("arLoad")}</p></div></div>`); gvArMount(); };
})();
/* Газетный вариант памятки: всегда на кыргызском, лист A5. Только тексты, уже существующие в приложении (шкала AQI и советы из data.js,
 * формулировки памятки), и числа из панели. */
const GZ_KY = { title: "Шаарыбыздын абасы: түтүн боюнча кыскача", sub: "{city} · {date} · «Таза Аба» тиркемесинин маалыматы", s1: "Акыркы 30 күн", s2: "AQI шкаласы: эмне кылуу керек", s3: "Түтүндүү күндөрү", s4: "Абаны таза сактоого ар ким салым кошо алат",
  r: ["Таштанды, жалбырак жана пластикти өрттөбөңүз.", "Мүмкүн болсо коомдук транспортту колдонуңуз.", "Үйүңүздү жылуулаңыз: терезе, дубал жана чатыр — жылуулук сакталып, отун азыраак кетет."],
  live: "Эртеңки божомол жана жандуу маалымат:", data: "Маалымат: CAMS (Copernicus) модели, Open-Meteo аркылуу, CC BY 4.0 — моделдик маанилер, датчиктердин өлчөөсү эмес. Кеңештер — AQI шкаласы (AirNow, АКШ EPA) жана ДССУ боюнча." };
/* v78: тот же лист на русском — для двуязычных районных газет (#govbrief/gazeta/ru). Перевод тех же формулировок, числа те же. */
const GZ_RU = { title: "Воздух нашего города: коротко о смоге", sub: "{city} · {date} · данные приложения «Таза Аба»", s1: "Последние 30 дней", s2: "Шкала AQI: что делать", s3: "В дымные дни", s4: "Каждый может помочь сохранить воздух чистым",
  r: ["Не сжигайте мусор, листья и пластик.", "По возможности пользуйтесь общественным транспортом.", "Утеплите дом: окна, стены и крыша — тепло сохраняется, топлива уходит меньше."],
  live: "Прогноз на завтра и живые данные:", data: "Данные: модель CAMS (Copernicus) через Open-Meteo, CC BY 4.0 — значения модели, а не измерения датчиков. Советы — по шкале AQI (AirNow, EPA США) и ВОЗ." };
const GZ_T = { ky: GZ_KY, ru: GZ_RU };
let GZL = "ky";   // язык листа A5: ky (по умолчанию) или ru
const gvWithLang = (lg, f) => { const o = LANG; LANG = lg; try { return f(); } finally { LANG = o; } };
function gvGzParts(G, winLine) {
  const c = tr(cityObj().name), B = gvBriefData(G), lo = [0, 51, 101, 151, 201, 301];
  const lv = AQI_LEVELS.map((L, i) => ({ c: L.color, r: i < 5 ? `${lo[i]}–${L.max}` : "301+", n: tr(L.name), t: tr(L.text) }));
  const tips = [...tr(AQI_LEVELS[2].tips), ...tr(AQI_LEVELS[3].tips).slice(1)];
  return { c, B, lv, tips, date: new Date(G.at).toLocaleDateString("ru-RU"), winLine };
}
function gvGzText(P) { const B = P.B, GZ_KY = GZ_T[GZL];
  return [GZ_KY.title + " — " + P.c + ", " + P.date, "", GZ_KY.s1 + ": " + GV("b30") + " " + gvF(B.a30) + "; " + GV("bDw") + " " + gvF(B.dO) + "/" + gvF(B.dN) + ".", ...(P.winLine ? [P.winLine] : []), ...(P.divLine ? [P.divLine] : []),
    "", GZ_KY.s2 + ":", ...P.lv.map(l => `• ${l.r} — ${l.n}: ${l.t}`), "", GZ_KY.s3 + ":", ...P.tips.map(x => "• " + x), "", GZ_KY.s4 + ":", ...GZ_KY.r.map(x => "• " + x), "", GZ_KY.live + " " + SITE_URL, GZ_KY.data].join("\n"); }
function gvGzRender(el, G) {
  GZL = (location.hash || "").slice(1).split("?")[0].split("/")[2] === "ru" ? "ru" : "ky"; const GZ_KY = GZ_T[GZL];
  const cached = (() => { try { return JSON.parse(localStorage.getItem("tazaAba.gvWin2." + CITY) || "null"); } catch (e) { return null; } })();
  let P = gvWithLang(GZL, () => gvGzParts(G, gvBriefWin(cached)));
  const pin = a => a == null ? "—" : `<span class="gv-chip" style="background:${level(a).color}">${Math.round(a)}</span>`;
  const sheet = () => gvWithLang(GZL, () => `<article class="gz-sheet" lang="${GZL}">
    <header class="gz-head"><div><h1>${esc(GZ_KY.title)}</h1><p class="sub">${esc(GZ_KY.sub.replace("{city}", P.c).replace("{date}", P.date))}</p></div>
      <figure class="gb-qr gz-qr"><img src="icons/qr-site.svg" alt="QR: https://taza-aba.surge.sh/" width="64" height="64"><figcaption>taza-aba.surge.sh</figcaption></figure></header>
    <section class="gz-s"><h3>${GZ_KY.s1}</h3><div class="gz-k"><div><small>${GV("b30")}</small>${pin(P.B.a30)}</div><div><small>${GV("bDw")}</small><b>${gvF(P.B.dO)}<span class="small muted"> / ${gvF(P.B.dN)}</span></b></div></div>
      <p class="small" id="gzWin">${P.winLine ? "❄️ " + esc(P.winLine) : ""}</p><p class="small gz-div" id="gzDiv" hidden></p></section>
    <section class="gz-s"><h3>${GZ_KY.s2}</h3><table class="gz-t"><tbody>${P.lv.map(l => `<tr><td><span class="gz-sw" style="background:${l.c}"></span>${l.r}</td><td><b>${esc(l.n)}</b> — ${esc(l.t)}</td></tr>`).join("")}</tbody></table></section>
    <section class="gz-s gz-two"><div><h3>${GZ_KY.s3}</h3><ul>${P.tips.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div><h3>${GZ_KY.s4}</h3><ul>${GZ_KY.r.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></section>
    <footer class="gz-f"><p><b>${GZ_KY.live}</b> taza-aba.surge.sh</p><p class="small muted">${esc(GZ_KY.data)} ${gvAs("airnow")}, ${gvAs("who20")}, ${gvAs("unicef")}, ${gvAs("om")}</p></footer></article>`);
  el.innerHTML = `<p class="gv-noprint small"><a href="#govbrief">${GV("gzBack")}</a> · <a href="#gov">${GV("bFull")}</a></p>
    <p class="gv-noprint small muted gz-hint">${esc(GV("gzHint"))}</p>
    <div class="gv-acts gv-noprint gz-lang" role="group" aria-label="${esc(GV("gzLang"))}">${[["ky", "Кыргызча"], ["ru", "Русский"]].map(([k, n]) => `<a class="btn${k === GZL ? "" : " ghost"}" href="#govbrief/gazeta${k === "ru" ? "/ru" : ""}" lang="${k}"${k === GZL ? ' aria-current="page"' : ""}>${n}</a>`).join("")}</div>
    <div class="gv-acts gv-noprint"><button class="btn" id="gzPrint" type="button">${GV("gzPrint")}</button><button class="btn ghost" id="gzCopy" type="button">${GV("gzCopy")}</button></div>
    <div id="gzBox">${sheet()}</div>`;
  $("#gzPrint").onclick = () => window.print();
  $("#gzCopy").onclick = () => copyText(gvGzText(P));
  { const dc = CITY; gvCoef().then(j => { const x = j && j.cities && j.cities[dc], p = $("#gzDiv"); if (!p || CITY !== dc || !x || !x.div) return;   // v77: вечернее расхождение модели и датчиков (7 дн.), на кыргызском
    P.divLine = gvWithLang(GZL, () => gvDivLine(x.div)); if (P.divLine) { p.textContent = "🌙 " + P.divLine; p.hidden = false; } }).catch(e => console.warn("gazeta div:", e.message)); }
  if (!P.winLine) { const wc = CITY; gvWinLoad().then(W => { if (CITY !== wc) return; P.winLine = gvWithLang(GZL, () => gvBriefWin(W)); const p = $("#gzWin"); if (p && P.winLine) p.textContent = "❄️ " + P.winLine; }).catch(e => console.warn("gazeta winters:", e.message)); }
}
(function () { const _b = gvBriefRender;
  gvBriefRender = function (el, G) {
    if ((location.hash || "").slice(1).split("/")[1] === "gazeta") { el.classList.add("v-gazeta"); return gvGzRender(el, G); }
    el.classList.remove("v-gazeta"); _b(el, G);
    const acts = el.querySelector(".gb-sheet .gv-acts"); if (acts) acts.insertAdjacentHTML("beforeend", `<a class="btn ghost" href="#govbrief/gazeta">${GV("gzLink")}</a>`); };
})();
/* v47: «Тот же период в прошлые годы» — из открытого архива (те же календарные дни каждого года, модель CAMS). */
Object.assign(GV_S.ru, { myH: "Тот же период в прошлые годы", mySub: "{per}: средний PM2.5 и число суток выше нормы ВОЗ (15 мкг/м³) за одни и те же календарные дни каждого года.",
  myY: "Год", myPm: "Средний PM2.5", myW: "Суток > 15", myN: "Суток с данными", mySum: "{y}: {per} — средний PM2.5 {a} мкг/м³, это на {p} % {dir}, чем в среднем за {yy} ({b} мкг/м³).", myUp: "выше", myDn: "ниже", mySame: "{y}: {per} — средний PM2.5 {a} мкг/м³, примерно как в среднем за {yy} ({b} мкг/м³).",
  myNote: "Модель CAMS, центр города, а не измерения датчиков. Разница между годами зависит и от погоды (ветер, инверсии, температура), поэтому сама по себе не доказывает эффект конкретных мер. Годы, где данных меньше чем за 80 % дней, не показываются.", myCopy: "📋 Скопировать для справки", myOk: "Скопировано",
  myMon: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"], myPer: "{a}–{b} {m}", myPer1: "{a} {m}" });
Object.assign(GV_S.ky, { myH: "Мурунку жылдардагы ушул эле мезгил", mySub: "{per}: ар бир жылдын ошол эле календардык күндөрүндөгү орточо PM2.5 жана ДССУ ченеминен (15 мкг/м³) ашкан суткалар.",
  myY: "Жыл", myPm: "Орточо PM2.5", myW: "Сутка > 15", myN: "Маалыматы бар сутка", mySum: "{y}: {per} — орточо PM2.5 {a} мкг/м³, бул {yy} жылдардагы орточодон ({b} мкг/м³) {p} % {dir}.", myUp: "жогору", myDn: "төмөн", mySame: "{y}: {per} — орточо PM2.5 {a} мкг/м³, болжол менен {yy} жылдардагы орточодой ({b} мкг/м³).",
  myNote: "CAMS модели, шаардын борбору — датчиктердин өлчөөсү эмес. Жылдардын айырмасы аба ырайына да (шамал, инверсия, температура) көз каранды, ошондуктан өзүнчө белгилүү бир чаранын натыйжасын далилдебейт. Күндөрдүн 80 %дан азы боюнча маалымат бар жылдар көрсөтүлбөйт.", myCopy: "📋 Маалымкат үчүн көчүрүү", myOk: "Көчүрүлдү",
  myMon: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"], myPer: "{m} {a}–{b}", myPer1: "{m} {a}" });
Object.assign(GV_S.en, { myH: "Same period in earlier years", mySub: "{per}: mean PM2.5 and days above the WHO guideline (15 µg/m³) over the same calendar days of each year.",
  myY: "Year", myPm: "Mean PM2.5", myW: "Days > 15", myN: "Days with data", mySum: "{y}: {per} — mean PM2.5 {a} µg/m³, {p}% {dir} than the {yy} average ({b} µg/m³).", myUp: "higher", myDn: "lower", mySame: "{y}: {per} — mean PM2.5 {a} µg/m³, about the same as the {yy} average ({b} µg/m³).",
  myNote: "CAMS model, city centre — not sensor measurements. Year-to-year differences also depend on the weather (wind, inversions, temperature), so on their own they do not prove the effect of specific measures. Years with data for fewer than 80% of the days are not shown.", myCopy: "📋 Copy for a report", myOk: "Copied",
  myMon: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], myPer: "{m} {a}–{b}", myPer1: "{m} {a}" });
function gvMyData(A) {
  const R = A.rows.filter(r => r.pm != null); if (R.length < 30) return null;
  const last = R[R.length - 1].d; let [Y, M, D] = last.split("-").map(Number);
  if (D < 7) { M -= 1; if (M < 1) { M = 12; Y -= 1; } D = new Date(Date.UTC(Y, M, 0)).getUTCDate(); }   // в начале месяца — предыдущий полный месяц
  const mm = String(M).padStart(2, "0"), by = {};
  for (const r of R) { const [y, m, d] = r.d.split("-").map(Number); if (m === M && d <= D) (by[y] = by[y] || []).push(r.pm); }
  const yrs = Object.keys(by).map(Number).sort((a, b) => b - a).filter(y => by[y].length >= Math.ceil(D * 0.8))
    .map(y => { const v = by[y]; return { y, n: v.length, pm: v.reduce((s, x) => s + x, 0) / v.length, w: v.filter(x => x > 15).length }; });
  if (yrs.length < 2 || yrs[0].y !== Y) return null;
  const mon = GV("myMon")[M - 1], per = D === 1 ? GV("myPer1", { a: 1, m: mon }) : GV("myPer", { a: 1, b: D, m: mon });
  const cur = yrs[0], prev = yrs.slice(1), avg = prev.reduce((s, r) => s + r.pm, 0) / prev.length, pc = Math.round(100 * (cur.pm - avg) / avg);
  const yy = prev.length === 1 ? String(prev[0].y) : `${prev[prev.length - 1].y}–${prev[0].y}`;
  const sum = Math.abs(pc) < 5 ? GV("mySame", { y: cur.y, per, a: fmt(cur.pm, 1), yy, b: fmt(avg, 1) })
    : GV("mySum", { y: cur.y, per, a: fmt(cur.pm, 1), yy, b: fmt(avg, 1), p: Math.abs(pc), dir: GV(pc > 0 ? "myUp" : "myDn") });
  return { yrs, per, sum, mm };
}
function gvMyHTML(A) {
  const Q = gvMyData(A); if (!Q) return "";
  const rows = Q.yrs.map((r, i) => `<tr${i ? "" : ' class="gv-my-cur"'}><td>${r.y}</td><td><b>${fmt(r.pm, 1)}</b></td><td>${r.w}</td><td>${r.n}</td></tr>`).join("");
  return `<div class="gv-my"><h4>📅 ${GV("myH")}</h4><p class="small">${esc(GV("mySub", { per: Q.per }))}</p>
    <div class="gv-tw"><table class="gv-t"><thead><tr><th>${GV("myY")}</th><th>${GV("myPm")}, ${GV("unit")}</th><th>${GV("myW")}</th><th>${GV("myN")}</th></tr></thead><tbody>${rows}</tbody></table></div>
    <p><b>${esc(Q.sum)}</b></p><div class="gv-acts gv-noprint"><button class="btn ghost" id="gvMyCopy" type="button">${GV("myCopy")}</button></div><p class="small muted">${esc(GV("myNote"))}</p></div>`;
}
(function () { const _h = gvArHTML, _m = gvArMount;
  gvArHTML = function (A) { const s = _h(A); let my = ""; try { my = gvMyHTML(A); } catch (e) { console.warn("same-period:", e.message); }
    return my ? s.replace(/(<\/svg><p class="small muted">[\s\S]*?<\/p>)/, `$1${my}`) : s; };
  gvArMount = function () { _m(); const c = CITY; gvArLoad(c).then(A => { const b = $("#gvMyCopy"); if (!b || CITY !== c) return; const Q = gvMyData(A); if (!Q) return;
    b.onclick = () => { const txt = `${tr(cityObj().name)} — ${GV("myH")} (${Q.per})\n` + Q.yrs.map(r => `${r.y}: PM2.5 ${fmt(r.pm, 1)} ${GV("unit")}, ${GV("myW")}: ${r.w}/${r.n}`).join("\n") + `\n${Q.sum}\n${GV("myNote")}\n${SITE_URL}`;
      (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { b.textContent = "✓ " + GV("myOk"); setTimeout(() => { b.textContent = GV("myCopy"); }, 2000); }).catch(() => {}); }; }).catch(() => {}); };
})();
/* v49: строка «те же дни прошлых лет» (из открытого архива, модель CAMS) в памятке A4 (#govbrief) и в кыргызском листе A5 (#govbrief/gazeta). */
Object.assign(GV_S.ru, { bMy: "Те же дни прошлых лет ({per}): в {y} г. средний PM2.5 {a} мкг/м³ — на {p} % {dir}, чем в среднем за {yy} ({b}). Модель CAMS, центр города; разница зависит и от погоды.",
  bMySame: "Те же дни прошлых лет ({per}): в {y} г. средний PM2.5 {a} мкг/м³ — примерно как в среднем за {yy} ({b}). Модель CAMS, центр города; разница зависит и от погоды." });
Object.assign(GV_S.ky, { bMy: "Мурунку жылдардын ушул эле күндөрү ({per}): {y}-жылы орточо PM2.5 {a} мкг/м³ — {yy} ж. орточодон ({b}) {p} % {dir}. CAMS модели, шаардын борбору; айырма аба ырайына да көз каранды.",
  bMySame: "Мурунку жылдардын ушул эле күндөрү ({per}): {y}-жылы орточо PM2.5 {a} мкг/м³ — болжол менен {yy} ж. орточодой ({b}). CAMS модели, шаардын борбору; айырма аба ырайына да көз каранды." });
Object.assign(GV_S.en, { bMy: "Same days in earlier years ({per}): mean PM2.5 in {y} was {a} µg/m³, {p}% {dir} than the {yy} average ({b}). CAMS model, city centre; the difference also depends on the weather.",
  bMySame: "Same days in earlier years ({per}): mean PM2.5 in {y} was {a} µg/m³, about the same as the {yy} average ({b}). CAMS model, city centre; the difference also depends on the weather." });
function gvMyLine(A) {
  const Q = gvMyData(A); if (!Q) return null;
  const cur = Q.yrs[0], prev = Q.yrs.slice(1), avg = prev.reduce((s, r) => s + r.pm, 0) / prev.length, pc = Math.round(100 * (cur.pm - avg) / avg);
  const yy = prev.length === 1 ? String(prev[0].y) : `${prev[prev.length - 1].y}–${prev[0].y}`, o = { per: Q.per, y: cur.y, a: fmt(cur.pm, 1), yy, b: fmt(avg, 1) };
  return Math.abs(pc) < 5 ? GV("bMySame", o) : GV("bMy", Object.assign(o, { p: Math.abs(pc), dir: GV(pc > 0 ? "myUp" : "myDn") }));
}
const gvMyLn = {};   // CITY|lang → строка (для текста «Скопировать»)
(function () { const _r = gvBriefRender, _bt = gvBriefText, _gt = gvGzText;
  const ins = (s, line, after) => { if (!line) return s; const L = s.split("\n"), i = after ? L.indexOf(after) : -1; L.splice(i >= 0 ? i + 1 : 3, 0, line); return L.join("\n"); };
  gvBriefText = function (G, B, winLine, divLine) { return ins(_bt(G, B, winLine, divLine), gvMyLn[CITY + "|" + LANG], winLine); };
  gvGzText = function (P) { return gvWithLang(GZL, () => ins(_gt(P), gvMyLn[CITY + "|" + GZL], P.winLine)); };   // и подписи «30 күн» всегда на кыргызском (раньше — на языке интерфейса)
  gvBriefRender = function (el, G) { _r(el, G);
    const gz = el.classList.contains("v-gazeta"), anchor = el.querySelector(gz ? "#gzWin" : "#gbWin"); if (!anchor) return;
    const lg = gz ? GZL : LANG, c = CITY, put = t => { const old = el.querySelector("#gbMy"); if (old) old.remove(); if (!t) return;
      anchor.insertAdjacentHTML("afterend", `<p class="small gb-my" id="gbMy"${gz ? ` lang="${GZL}"` : ""}>📅 ${esc(t)}</p>`); };
    const k = c + "|" + lg; if (gvMyLn[k]) return put(gvMyLn[k]);
    gvArLoad(c).then(A => { if (CITY !== c || !el.isConnected || !el.contains(anchor)) return; let t = null;
      try { t = gvWithLang(lg, () => gvMyLine(A)); } catch (e) { console.warn("brief same-period:", e.message); }
      if (t) { gvMyLn[k] = t; put(t); } }).catch(e => console.warn("brief same-period:", e.message)); };
})();
