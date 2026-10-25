/* Таза Аба — справочные и ДЕМО-данные (ru / ky / en).
 * Всё, что помечено DEMO, — выдуманные данные для презентации прототипа.
 *
 * Районы: lat/lon — приблизительный центр массива.
 * factor — поправочный коэффициент к модельному значению Open-Meteo (сетка CAMS ~0.1°, ≈10 км,
 *   поэтому внутри города модель почти не различает районы). Это наша ОЦЕНКА локального вклада:
 *   частный сектор с угольным отоплением ×1.3–1.5, предгорный продуваемый юг ×0.8–0.85.
 * coalShare — DEMO: доля домов, всё ещё отапливаемых углём.
 * loc — форма «в районе» для фраз (в Ак-Орго / Ак-Оргодо / in Ak-Orgo).
 */
const DTYPE = {
  apts:    { ru: "многоэтажки", ky: "көп кабаттуу үйлөр", en: "apartment blocks" },
  private: { ru: "частный сектор", ky: "жеке сектор", en: "private houses" },
  micro:   { ru: "микрорайон", ky: "кичи район", en: "microdistrict" },
  village: { ru: "село / посёлок", ky: "айыл / кыштак", en: "village" },
};
const BK_DISTRICTS = [
  { id: "center",   lat: 42.8765, lon: 74.6040, factor: 1.00, coalShare: 0.05, type: "apts",
    name: { ru: "Центр (Ала-Тоо)", ky: "Борбор (Ала-Тоо)", en: "Centre (Ala-Too)" }, loc: { ru: "в центре", ky: "борбордо", en: "in the city centre" } },
  { id: "akorgo",   lat: 42.9020, lon: 74.5440, factor: 1.40, coalShare: 0.62, type: "private",
    name: { ru: "Ак-Орго", ky: "Ак-Орго", en: "Ak-Orgo" }, loc: { ru: "в Ак-Орго", ky: "Ак-Оргодо", en: "in Ak-Orgo" } },
  { id: "archa",    lat: 42.9150, lon: 74.4990, factor: 1.50, coalShare: 0.71, type: "private",
    name: { ru: "Арча-Бешик", ky: "Арча-Бешик", en: "Archa-Beshik" }, loc: { ru: "в Арча-Бешике", ky: "Арча-Бешикте", en: "in Archa-Beshik" } },
  { id: "akordo",   lat: 42.8930, lon: 74.4800, factor: 1.45, coalShare: 0.68, type: "private",
    name: { ru: "Ак-Ордо", ky: "Ак-Ордо", en: "Ak-Ordo" }, loc: { ru: "в Ак-Ордо", ky: "Ак-Ордодо", en: "in Ak-Ordo" } },
  { id: "kalys",    lat: 42.9180, lon: 74.6550, factor: 1.35, coalShare: 0.58, type: "private",
    name: { ru: "Калыс-Ордо", ky: "Калыс-Ордо", en: "Kalys-Ordo" }, loc: { ru: "в Калыс-Ордо", ky: "Калыс-Ордодо", en: "in Kalys-Ordo" } },
  { id: "alamedin", lat: 42.8880, lon: 74.6380, factor: 1.10, coalShare: 0.18, type: "micro",
    name: { ru: "Аламедин-1", ky: "Аламүдүн-1", en: "Alamedin-1" }, loc: { ru: "в Аламедине-1", ky: "Аламүдүн-1де", en: "in Alamedin-1" } },
  { id: "tunguch",  lat: 42.8460, lon: 74.6520, factor: 1.05, coalShare: 0.12, type: "micro",
    name: { ru: "Тунгуч", ky: "Түңгүч", en: "Tunguch" }, loc: { ru: "в Тунгуче", ky: "Түңгүчтө", en: "in Tunguch" } },
  { id: "dzhal",    lat: 42.8250, lon: 74.5750, factor: 0.85, coalShare: 0.20, type: "micro",
    name: { ru: "Джал", ky: "Жал", en: "Dzhal" }, loc: { ru: "на Джале", ky: "Жалда", en: "in Dzhal" } },
  { id: "asanbay",  lat: 42.8170, lon: 74.6250, factor: 0.80, coalShare: 0.10, type: "micro",
    name: { ru: "Асанбай", ky: "Асанбай", en: "Asanbay" }, loc: { ru: "в Асанбае", ky: "Асанбайда", en: "in Asanbay" } },
  { id: "vostok5",  lat: 42.8600, lon: 74.6900, factor: 1.15, coalShare: 0.22, type: "micro",
    name: { ru: "Восток-5", ky: "Восток-5", en: "Vostok-5" }, loc: { ru: "на Востоке-5", ky: "Восток-5те", en: "in Vostok-5" } },
];

/* Шкала US AQI (EPA) с подписями и советами. */
const AQI_LEVELS = [
  { max: 50, color: "#2fbf71", grad: "linear-gradient(135deg,#34c77b,#1f9d63 60%,#8fd36a)", emoji: "🌿",
    name: { ru: "Хорошо", ky: "Жакшы", en: "Good" }, short: { ru: "Хорошо", ky: "Жакшы", en: "Good" },
    title: { ru: "Гулять можно!", ky: "Сейилдесеңиз болот!", en: "Great day for a walk!" },
    text: { ru: "Воздух чистый — отличный день для прогулки, велосипеда и проветривания.", ky: "Аба таза — сейилдөөгө, велосипед тебүүгө жана үйдү желдетүүгө эң сонун күн.", en: "The air is clean — perfect for walking, cycling and airing out your home." },
    tips: { ru: ["Проветрите квартиру 10–15 минут", "Хорошее время для прогулки с детьми", "Езжайте на велосипеде — сохраните воздух чистым"],
            ky: ["Үйдү 10–15 мүнөт желдетиңиз", "Балдар менен сейилдөөгө ылайыктуу убакыт", "Велосипед тебиңиз — абаны таза сактаңыз"],
            en: ["Air out your home for 10–15 minutes", "A good time for a walk with the kids", "Take the bike — keep the air clean"] } },
  { max: 100, color: "#e6b800", grad: "linear-gradient(135deg,#f6c945,#e0a91c 55%,#9ccf5a)", emoji: "🌤️",
    name: { ru: "Умеренно", ky: "Орточо", en: "Moderate" }, short: { ru: "Умеренно", ky: "Орточо", en: "Moderate" },
    title: { ru: "Гулять можно, но осторожно", ky: "Сейилдесеңиз болот, бирок этият болуңуз", en: "OK to go out, with care" },
    text: { ru: "Большинству людей ничего не грозит. Чувствительным людям лучше сократить нагрузки.", ky: "Көпчүлүк адамдарга коркунуч жок. Сезимтал адамдарга күч жумшоону азайткан оң.", en: "Most people are fine. Sensitive people should take it easy outdoors." },
    tips: { ru: ["Астматикам — держите ингалятор под рукой", "Проветривайте днём, а не вечером", "Длинные пробежки лучше перенести в парк"],
            ky: ["Астмасы барлар ингаляторду жаныңызда кармаңыз", "Кечинде эмес, күндүз желдетиңиз", "Узак чуркоону паркта өткөргөн жакшы"],
            en: ["Asthma? Keep your inhaler handy", "Air out during the day, not the evening", "Move long runs to a park"] } },
  { max: 150, color: "#ff8a3d", grad: "linear-gradient(135deg,#ff9f4a,#f07a2b 60%,#e85d3a)", emoji: "😷",
    name: { ru: "Вредно для чувствительных", ky: "Сезимтал адамдарга зыяндуу", en: "Unhealthy for sensitive groups" }, short: { ru: "Вредно*", ky: "Зыяндуу*", en: "Unhealthy*" },
    title: { ru: "Детям и пожилым — лучше дома", ky: "Балдар менен улгайгандар үйдө болгону жакшы", en: "Kids and elderly: better stay in" },
    text: { ru: "Дети, пожилые и люди с болезнями лёгких и сердца должны ограничить время на улице.", ky: "Балдар, улгайган адамдар жана өпкө, жүрөк оорулуулар көчөдө азыраак жүрүшү керек.", en: "Children, older people and those with lung or heart conditions should limit time outdoors." },
    tips: { ru: ["Наденьте маску FFP2/KN95 на улице", "Закройте окна вечером, когда топят печи", "Включите очиститель воздуха, если есть"],
            ky: ["Көчөдө FFP2/KN95 маска тагыңыз", "Кечинде мештер жагылганда терезелерди жабыңыз", "Аба тазалагычыңыз болсо, күйгүзүңүз"],
            en: ["Wear an FFP2/KN95 mask outside", "Close windows in the evening when stoves are lit", "Turn on an air purifier if you have one"] } },
  { max: 200, color: "#e5484d", grad: "linear-gradient(135deg,#f0565b,#c9303a 60%,#a3203a)", emoji: "🚫",
    name: { ru: "Вредно", ky: "Зыяндуу", en: "Unhealthy" }, short: { ru: "Вредно", ky: "Зыяндуу", en: "Unhealthy" },
    title: { ru: "Закройте окна, наденьте маску", ky: "Терезелерди жаап, маска тагыңыз", en: "Close windows, wear a mask" },
    text: { ru: "Воздух вреден для всех. Сократите время на улице и не проветривайте.", ky: "Аба баары үчүн зыяндуу. Көчөдө азыраак болуп, үйдү желдетпеңиз.", en: "The air is unhealthy for everyone. Limit time outside and don't air out." },
    tips: { ru: ["Маска FFP2/KN95 обязательна", "Не гуляйте с детьми", "Отмените тренировки на улице"],
            ky: ["FFP2/KN95 маска милдеттүү", "Балдар менен сейилдебеңиз", "Сырттагы машыгууларды токтотуңуз"],
            en: ["An FFP2/KN95 mask is a must", "Don't take the kids out", "Cancel outdoor workouts"] } },
  { max: 300, color: "#8e44ad", grad: "linear-gradient(135deg,#9b59b6,#6c2d8c 60%,#4a1f66)", emoji: "☠️",
    name: { ru: "Очень вредно", ky: "Өтө зыяндуу", en: "Very unhealthy" }, short: { ru: "Оч. вредно", ky: "Өтө зыяндуу", en: "V. unhealthy" },
    title: { ru: "Оставайтесь дома", ky: "Үйдөн чыкпаңыз", en: "Stay indoors" },
    text: { ru: "Опасный уровень смога. Без необходимости не выходите на улицу.", ky: "Смогдун деңгээли коркунучтуу. Зарылчылык болбосо, көчөгө чыкпаңыз.", en: "Dangerous smog levels. Don't go out unless you must." },
    tips: { ru: ["Закройте окна и двери", "Используйте очиститель воздуха", "Позвоните пожилым родственникам"],
            ky: ["Терезе жана эшиктерди жабыңыз", "Аба тазалагычты колдонуңуз", "Улгайган туугандарыңызга чалып коюңуз"],
            en: ["Keep windows and doors shut", "Use an air purifier", "Call your elderly relatives"] } },
  { max: 9999, color: "#7a1f2b", grad: "linear-gradient(135deg,#8b2433,#5c1520 60%,#3a0d14)", emoji: "⚠️",
    name: { ru: "Опасно", ky: "Коркунучтуу", en: "Hazardous" }, short: { ru: "Опасно", ky: "Коркунучтуу", en: "Hazardous" },
    title: { ru: "Чрезвычайный уровень смога", ky: "Смогдун өзгөчө деңгээли", en: "Emergency smog level" },
    text: { ru: "Угроза здоровью для всех. Оставайтесь в помещении.", ky: "Баардык адамдардын ден соолугуна коркунуч. Имараттын ичинде калыңыз.", en: "A health threat for everyone. Stay indoors." },
    tips: { ru: ["Не выходите на улицу", "Очиститель воздуха на максимум", "Следите за самочувствием"],
            ky: ["Көчөгө чыкпаңыз", "Аба тазалагычты толук кубатка коюңуз", "Ден соолугуңузга көз салыңыз"],
            en: ["Don't go outside", "Run the air purifier at max", "Watch how you feel"] } },
];

/* DEMO: дома, которые уже перешли на чистое отопление. what — ключ варианта. */
const HOME_WHAT = {
  pump:  { ru: "Тепловой насос", ky: "Жылуулук насосу", en: "Heat pump" },
  solar: { ru: "Солнечные панели", ky: "Күн панелдери", en: "Solar panels" },
  insul: { ru: "Утепление", ky: "Жылуулоо", en: "Insulation" },
  insul_solar: { ru: "Утепление + панели", ky: "Жылуулоо + панелдер", en: "Insulation + solar" },
  insul_pump:  { ru: "Утепление + насос", ky: "Жылуулоо + насос", en: "Insulation + heat pump" },
};
const BK_DEMO_HOMES = [];   // v54: демо-дома удалены (выдуманные данные)

const BK_DEMO_GROUPS = [];   // v54: групповые закупки удалены

const BK_DEMO_LEADERBOARD = {};   // v54: демо-рейтинг удалён

/* Запасные ДЕМО-значения US AQI, если API недоступен (типичная картина ранней зимы). */
const BK_DEMO_AQI = { center: 118, akorgo: 168, archa: 182, akordo: 175, kalys: 160, alamedin: 128, tunguch: 122, dzhal: 98, asanbay: 92, vostok5: 135 };

/* DEMO: жалобы на источники загрязнения. */
const BK_DEMO_COMPLAINTS = [
  { id: "d1", lat: 42.9068, lon: 74.5402, cat: "chimney", status: 1, date: "2026-10-16", emoji: "🏭",
    text: { ru: "Котельная частного дома дымит чёрным с 6 утра", ky: "Жеке үйдүн казаны эртең мененки 6дан бери кара түтүн чыгарып жатат", en: "A private boiler has been puffing black smoke since 6 am" } },
  { id: "d2", lat: 42.9135, lon: 74.5030, cat: "trash", status: 2, date: "2026-10-14", emoji: "🔥",
    text: { ru: "Жгут листья и пластик у арыка", ky: "Арыктын жанында жалбырак менен пластик өрттөп жатышат", en: "Leaves and plastic burned next to the irrigation ditch" } },
  { id: "d3", lat: 42.8925, lon: 74.4835, cat: "dump", status: 1, date: "2026-10-15", emoji: "🗑️",
    text: { ru: "Стихийная свалка, иногда поджигают", ky: "Өз алдынча пайда болгон таштанды үйүндүсү, кээде өрттөп коюшат", en: "Illegal dump, sometimes set on fire" } },
  { id: "d4", lat: 42.8745, lon: 74.6195, cat: "car", status: 0, date: "2026-10-17", emoji: "🚌",
    text: { ru: "Маршрутка №110 сильно дымит", ky: "№110 маршруттук такси катуу түтүн чыгарат", en: "Minibus No. 110 emits heavy smoke" } },
  { id: "d5", lat: 42.9195, lon: 74.6585, cat: "chimney", status: 2, date: "2026-10-12", emoji: "🏠",
    text: { ru: "Топят шинами, дым на всю улицу", ky: "Дөңгөлөк менен жагышат, түтүн бүт көчөгө тарайт", en: "Burning tyres for heat, smoke over the whole street" } },
];

/* DEMO: эко-маршруты (координаты проложены вручную, приблизительно). */
const BK_ECO_ROUTES = [
  { id: "r1", mode: "walk", color: "#2e9e5b", near: "center",
    name: { ru: "Бульвар Эркиндик → Дубовый парк", ky: "Эркиндик бульвары → Эмен паркы", en: "Erkindik Boulevard → Oak Park" },
    avoid: { ru: "проспект Чуй", ky: "Чүй проспекти", en: "Chui Avenue" },
    path: [[42.8693, 74.6120], [42.8722, 74.6114], [42.8752, 74.6106], [42.8778, 74.6100], [42.8800, 74.6082], [42.8812, 74.6052], [42.8806, 74.6025]] },
  { id: "r2", mode: "bike", color: "#ffb347", near: "dzhal",
    name: { ru: "Вдоль реки Ала-Арча", ky: "Ала-Арча суусунун боюнда", en: "Along the Ala-Archa river" },
    avoid: { ru: "улица Ахунбаева", ky: "Ахунбаев көчөсү", en: "Akhunbaev Street" },
    path: [[42.8300, 74.5790], [42.8400, 74.5805], [42.8500, 74.5815], [42.8600, 74.5822], [42.8700, 74.5826], [42.8800, 74.5818], [42.8890, 74.5806]] },
  { id: "r3", mode: "bike", color: "#4aa3df", near: "alamedin",
    name: { ru: "Карагачёвая роща", ky: "Карагач токою", en: "Karagach Grove" },
    avoid: { ru: "улица Жибек Жолу", ky: "Жибек Жолу көчөсү", en: "Zhibek Zholu Street" },
    path: [[42.8835, 74.6275], [42.8900, 74.6315], [42.8975, 74.6345], [42.9050, 74.6380], [42.9115, 74.6395], [42.9170, 74.6360]] },
];

/* ================= НАРЫН (DEMO) =================
 * Нарын (~2 000 м над уровнем моря) — долгая холодная зима, частный сектор почти весь на угле,
 * зимой в долине реки Нарын бывают температурные инверсии. Массивы названы описательно,
 * координаты приблизительные. factor — наша оценка (инверсия в долине + угольные печи).
 */
const NR_DISTRICTS = [
  { id: "n_center", lat: 41.4287, lon: 75.9911, factor: 1.15, coalShare: 0.45, type: "apts",
    name: { ru: "Центр", ky: "Борбор", en: "Centre" }, loc: { ru: "в центре Нарына", ky: "Нарындын борборунда", en: "in central Naryn" } },
  { id: "n_west", lat: 41.4330, lon: 75.9480, factor: 1.35, coalShare: 0.80, type: "private",
    name: { ru: "Западный массив", ky: "Батыш массиви", en: "West side" }, loc: { ru: "в Западном массиве", ky: "Батыш массивинде", en: "on the west side" } },
  { id: "n_east", lat: 41.4250, lon: 76.0350, factor: 1.30, coalShare: 0.78, type: "private",
    name: { ru: "Восточный массив", ky: "Чыгыш массиви", en: "East side" }, loc: { ru: "в Восточном массиве", ky: "Чыгыш массивинде", en: "on the east side" } },
  { id: "n_left", lat: 41.4175, lon: 75.9850, factor: 1.20, coalShare: 0.70, type: "private",
    name: { ru: "Левый берег", ky: "Сол жээк", en: "Left bank" }, loc: { ru: "на левом берегу", ky: "сол жээкте", en: "on the left bank" } },
  { id: "n_north", lat: 41.4400, lon: 76.0050, factor: 1.25, coalShare: 0.66, type: "micro",
    name: { ru: "Северный склон", ky: "Түндүк бет", en: "North slope" }, loc: { ru: "на северном склоне", ky: "түндүк бетте", en: "on the north slope" } },
];
const NR_DEMO_HOMES = [];
const NR_DEMO_GROUPS = [];
const NR_DEMO_LEADERBOARD = {};
const NR_DEMO_AQI = { n_center: 105, n_west: 152, n_east: 146, n_left: 128, n_north: 134 };
const NR_DEMO_COMPLAINTS = [
  { id: "nd1", lat: 41.4340, lon: 75.9460, cat: "chimney", status: 1, date: "2026-10-16",
    text: { ru: "Котельная дымит с утра, весь двор в саже", ky: "Казан эртеден бери түтүндөп, короо толугу менен күйөгө толду", en: "A boiler smoking since morning, the whole yard covered in soot" } },
  { id: "nd2", lat: 41.4170, lon: 75.9880, cat: "trash", status: 0, date: "2026-10-17",
    text: { ru: "Жгут мусор у берега реки Нарын", ky: "Нарын дарыясынын жээгинде таштанды өрттөп жатышат", en: "Trash being burned on the Naryn riverbank" } },
  { id: "nd3", lat: 41.4260, lon: 76.0380, cat: "dump", status: 2, date: "2026-10-11",
    text: { ru: "Стихийная свалка на выезде из города", ky: "Шаардан чыга бериште өз алдынча пайда болгон таштанды үйүндүсү", en: "Illegal dump at the edge of town" } },
];
const NR_ECO_ROUTES = [
  { id: "nr1", mode: "walk", color: "#2e9e5b",
    name: { ru: "Набережная реки Нарын", ky: "Нарын дарыясынын жээги", en: "Naryn river embankment" },
    avoid: { ru: "центральную улицу Ленина", ky: "борбордогу Ленин көчөсүн", en: "central Lenin Street" },
    path: [[41.4255, 75.9700], [41.4262, 75.9780], [41.4268, 75.9860], [41.4272, 75.9940], [41.4270, 76.0020]] },
  { id: "nr2", mode: "bike", color: "#ffb347",
    name: { ru: "Вдоль реки до Восточного массива", ky: "Дарыянын боюнда Чыгыш массивине чейин", en: "Along the river to the east side" },
    avoid: { ru: "трассу Бишкек — Торугарт", ky: "Бишкек — Торугарт трассасын", en: "the Bishkek–Torugart highway" },
    path: [[41.4270, 75.9950], [41.4262, 76.0050], [41.4255, 76.0150], [41.4250, 76.0250], [41.4245, 76.0350]] },
];

/* Города. house — значения калькулятора по умолчанию; k — поправки к допущениям калькулятора. */
const CITIES = {
  bishkek: { id: "bishkek", center: [42.8746, 74.5698], defaultDistrict: "akorgo", alertDistrict: "akordo",
    name: { ru: "Бишкек", ky: "Бишкек", en: "Bishkek" }, gen: { ru: "Бишкека", ky: "Бишкектин", en: "Bishkek" }, prep: { ru: "Бишкеке", ky: "Бишкекте", en: "Bishkek" },
    house: { area: 100, coal: 5, price: 7000 }, k: {},
    districts: BK_DISTRICTS, homes: BK_DEMO_HOMES, groups: BK_DEMO_GROUPS, leaderboard: BK_DEMO_LEADERBOARD, demoAqi: BK_DEMO_AQI, complaints: BK_DEMO_COMPLAINTS, routes: BK_ECO_ROUTES },
  /* Нарын: зима длиннее и холоднее → больше угля (8 т), уголь дешевле (рядом Кара-Кече, ~5 000 сом/т),
   * тепловой насос в морозы −20…−30 °C работает хуже (COP 2.2), солнца на высоте больше (1 450 кВт·ч/кВт). */
  naryn: { id: "naryn", center: [41.4287, 75.9911], defaultDistrict: "n_west", alertDistrict: "n_west",
    name: { ru: "Нарын", ky: "Нарын", en: "Naryn" }, gen: { ru: "Нарына", ky: "Нарындын", en: "Naryn" }, prep: { ru: "Нарыне", ky: "Нарында", en: "Naryn" },
    house: { area: 90, coal: 8, price: 5000 }, k: { hpCOP: 2.2, pvYield: 1450 },
    districts: NR_DISTRICTS, homes: NR_DEMO_HOMES, groups: NR_DEMO_GROUPS, leaderboard: NR_DEMO_LEADERBOARD, demoAqi: NR_DEMO_AQI, complaints: NR_DEMO_COMPLAINTS, routes: NR_ECO_ROUTES },
};

/* ================= ДРУГИЕ ГОРОДА (DEMO-генератор) =================
 * Для Оша, Джалал-Абада, Каракола, Таласа, Баткена и Токмока реальные границы массивов не
 * используются: районы названы по сторонам света («Центр», «Северная часть» …), координаты —
 * смещения от центра города (приблизительно). Жалобы и маршруты — DEMO.
 */
const SIDE = {
  center: { name: { ru: "Центр", ky: "Борбор", en: "Centre", tr: "Merkez" }, type: "apts", dlat: 0, dlon: 0 },
  north: { name: { ru: "Северная часть", ky: "Түндүк бөлүгү", en: "North side", tr: "Kuzey kesimi" }, loc: { ru: "в северной части", ky: "түндүк бөлүгүндө", en: "on the north side", tr: "kuzey kesiminde" }, type: "private", dlat: 0.013, dlon: 0.004 },
  south: { name: { ru: "Южная часть", ky: "Түштүк бөлүгү", en: "South side", tr: "Güney kesimi" }, loc: { ru: "в южной части", ky: "түштүк бөлүгүндө", en: "on the south side", tr: "güney kesiminde" }, type: "private", dlat: -0.013, dlon: -0.003 },
  east: { name: { ru: "Восточная часть", ky: "Чыгыш бөлүгү", en: "East side", tr: "Doğu kesimi" }, loc: { ru: "в восточной части", ky: "чыгыш бөлүгүндө", en: "on the east side", tr: "doğu kesiminde" }, type: "micro", dlat: 0.002, dlon: 0.02 },
  west: { name: { ru: "Западная часть", ky: "Батыш бөлүгү", en: "West side", tr: "Batı kesimi" }, loc: { ru: "в западной части", ky: "батыш бөлүгүндө", en: "on the west side", tr: "batı kesiminde" }, type: "private", dlat: -0.002, dlon: -0.02 },
};
const SURNAMES = [
  { ru: "Семья Абдраимовых", ky: "Абдраимовдордун үй-бүлөсү", en: "The Abdraimov family" },
  { ru: "Семья Сыдыковых", ky: "Сыдыковдордун үй-бүлөсү", en: "The Sydykov family" },
  { ru: "Семья Турдубаевых", ky: "Турдубаевдердин үй-бүлөсү", en: "The Turdubaev family" },
  { ru: "Школа №1 (демо)", ky: "№1 мектеп (демо)", en: "School No. 1 (demo)" },
];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function makeCity(c) {
  const sides = ["center", ...c.sides];
  const districts = sides.map((sd, i) => {
    const S = SIDE[sd];
    return { id: `${c.id}_${sd}`, lat: +(c.center[0] + S.dlat).toFixed(4), lon: +(c.center[1] + S.dlon).toFixed(4),
      factor: c.factors[i], coalShare: c.coal[i], type: S.type, name: S.name,
      loc: sd === "center" ? { ru: `в центре ${c.gen.ru}`, ky: `${c.gen.ky} борборунда`, en: `in central ${c.name.en}`, tr: `${c.name.en} merkezinde` } : S.loc };
  });
  const D = i => districts[i % districts.length];
  const off = (d, a, b) => [+(d.lat + a).toFixed(4), +(d.lon + b).toFixed(4)];
  const homes = [];   // v54: без выдуманных домов
  const d1 = D(1), d2 = D(0);
  const groups = [];   // v54: без выдуманных закупок
  const [c1lat, c1lon] = off(D(1), 0.003, -0.004), [c2lat, c2lon] = off(D(2), -0.002, 0.004);
  const complaints = [
    { id: `${c.id}_c1`, lat: c1lat, lon: c1lon, cat: "chimney", status: 1, date: "2026-10-16",
      text: { ru: "Чёрный дым из трубы частного дома каждый вечер", ky: "Жеке үйдүн морунан ар кечте кара түтүн чыгат", en: "Black smoke from a private chimney every evening" } },
    { id: `${c.id}_c2`, lat: c2lat, lon: c2lon, cat: "trash", status: 0, date: "2026-10-17",
      text: { ru: "Сжигают листья и мусор у дороги", ky: "Жолдун жээгинде жалбырак жана таштанды өрттөшөт", en: "Leaves and trash burned by the road" } },
  ];
  const [la, lo] = c.center;
  const routes = [
    { id: `${c.id}_r1`, mode: "walk", color: "#2e9e5b",
      name: { ru: "Городской парк → центр", ky: "Шаардык парк → борбор", en: "City park → centre" },
      avoid: { ru: "центральную улицу", ky: "борбордук көчөнү", en: "the main street" },
      path: [[la - 0.006, lo - 0.008], [la - 0.004, lo - 0.005], [la - 0.002, lo - 0.003], [la, lo - 0.001], [la + 0.002, lo + 0.001]] },
    { id: `${c.id}_r2`, mode: "bike", color: "#ffb347",
      name: c.river ? { ru: `Вдоль реки ${c.river.ru}`, ky: `${c.river.ky} суусунун боюнда`, en: `Along the ${c.river.en} river` }
        : { ru: "Зелёная аллея вдоль арыка", ky: "Арыктын боюндагы жашыл аллея", en: "Green alley along the canal" },
      avoid: { ru: "объездную трассу", ky: "айланма жолду", en: "the bypass road" },
      path: [[la + 0.010, lo - 0.016], [la + 0.008, lo - 0.008], [la + 0.006, lo], [la + 0.005, lo + 0.008], [la + 0.004, lo + 0.016]] },
  ];
  const leaderboard = {};
  const demoAqi = Object.fromEntries(districts.map((d, i) => [d.id, Math.round(c.demoBase * d.factor)]));
  return { id: c.id, center: c.center, zoom: 13, radius: 700, defaultDistrict: districts[1].id, alertDistrict: districts[1].id,
    name: c.name, gen: c.gen, prep: c.prep, house: c.house, k: c.k || {}, emoji: c.emoji,
    districts, homes, groups, leaderboard, demoAqi, complaints, routes };
}
const EXTRA_CITIES = [
  { id: "osh", emoji: "🏯", center: [40.5300, 72.8000], seed: 1, demoBase: 110, river: { ru: "Ак-Буура", ky: "Ак-Буура", en: "Ak-Buura" },
    name: { ru: "Ош", ky: "Ош", en: "Osh" }, gen: { ru: "Оша", ky: "Оштун", en: "Osh" }, prep: { ru: "Оше", ky: "Ошто", en: "Osh" },
    sides: ["north", "south", "east", "west"], factors: [1.1, 1.3, 1.2, 1.15, 1.3], coal: [0.3, 0.6, 0.55, 0.4, 0.6],
    house: { area: 110, coal: 4, price: 6500 }, k: { pvYield: 1450 } },
  { id: "jalal", emoji: "♨️", center: [40.9330, 73.0000], seed: 2, demoBase: 100,
    name: { ru: "Джалал-Абад", ky: "Жалал-Абад", en: "Jalal-Abad" }, gen: { ru: "Джалал-Абада", ky: "Жалал-Абаддын", en: "Jalal-Abad" }, prep: { ru: "Джалал-Абаде", ky: "Жалал-Абадда", en: "Jalal-Abad" },
    sides: ["north", "south", "west"], factors: [1.1, 1.25, 1.2, 1.3], coal: [0.35, 0.6, 0.55, 0.65],
    house: { area: 100, coal: 4, price: 6000 }, k: { pvYield: 1450 } },
  { id: "karakol", emoji: "🌲", center: [42.4900, 78.3900], seed: 3, demoBase: 120, river: { ru: "Каракол", ky: "Каракол", en: "Karakol" },
    name: { ru: "Каракол", ky: "Каракол", en: "Karakol" }, gen: { ru: "Каракола", ky: "Караколдун", en: "Karakol" }, prep: { ru: "Караколе", ky: "Караколдо", en: "Karakol" },
    sides: ["north", "south", "east"], factors: [1.15, 1.3, 1.25, 1.3], coal: [0.4, 0.7, 0.65, 0.7],
    house: { area: 100, coal: 7, price: 6000 }, k: { hpCOP: 2.3, pvYield: 1450 } },
  { id: "talas", emoji: "🐎", center: [42.5200, 72.2400], seed: 4, demoBase: 95, river: { ru: "Талас", ky: "Талас", en: "Talas" },
    name: { ru: "Талас", ky: "Талас", en: "Talas" }, gen: { ru: "Таласа", ky: "Таластын", en: "Talas" }, prep: { ru: "Таласе", ky: "Таласта", en: "Talas" },
    sides: ["north", "south", "west"], factors: [1.1, 1.25, 1.2, 1.25], coal: [0.4, 0.65, 0.6, 0.65],
    house: { area: 100, coal: 6, price: 6500 }, k: {} },
  { id: "batken", emoji: "🌸", center: [40.0600, 70.8200], seed: 5, demoBase: 85,
    name: { ru: "Баткен", ky: "Баткен", en: "Batken" }, gen: { ru: "Баткена", ky: "Баткендин", en: "Batken" }, prep: { ru: "Баткене", ky: "Баткенде", en: "Batken" },
    sides: ["north", "south", "east"], factors: [1.05, 1.2, 1.15, 1.2], coal: [0.35, 0.55, 0.5, 0.55],
    house: { area: 90, coal: 4, price: 7000 }, k: { pvYield: 1500 } },
  { id: "tokmok", emoji: "🌾", center: [42.8400, 75.2900], seed: 6, demoBase: 115, river: { ru: "Чу", ky: "Чүй", en: "Chuy" },
    name: { ru: "Токмок", ky: "Токмок", en: "Tokmok" }, gen: { ru: "Токмока", ky: "Токмоктун", en: "Tokmok" }, prep: { ru: "Токмоке", ky: "Токмокто", en: "Tokmok" },
    sides: ["north", "south", "east", "west"], factors: [1.1, 1.3, 1.2, 1.25, 1.3], coal: [0.35, 0.65, 0.6, 0.55, 0.65],
    house: { area: 100, coal: 5, price: 7000 }, k: {} },
];
EXTRA_CITIES.forEach(c => { CITIES[c.id] = makeCity(c); });
Object.assign(CITIES.bishkek, { emoji: "🏙️", zoom: 12, radius: 1300 });
Object.assign(CITIES.naryn, { emoji: "🏔️", zoom: 13, radius: 800 });
/* Порядок в переключателе. */
const CITY_ORDER = ["bishkek", "osh", "jalal", "karakol", "naryn", "talas", "batken", "tokmok"];

/* Дополнительные районы/микрорайоны/жилмассивы. Координаты ПРИБЛИЗИТЕЛЬНЫЕ (центр района, ±0,5–1 км).
 * [id, lat, lon, factor(демо), доля угля, тип, ru, ky, en] */
const MORE_DISTRICTS = {
  bishkek: [
    ["kokjar", 42.8300, 74.5950, 0.90, 0.15, "micro", "Кок-Жар", "Көк-Жар", "Kok-Jar"],
    ["karajygach", 42.8130, 74.6500, 1.05, 0.40, "private", "Кара-Жыгач", "Кара-Жыгач", "Kara-Jygach"],
    ["ortosay", 42.8360, 74.6130, 0.95, 0.30, "private", "Ортосай", "Ортосай", "Ortosay"],
    ["kyzylasker", 42.8600, 74.5480, 1.20, 0.50, "private", "Кызыл-Аскер", "Кызыл-Аскер", "Kyzyl-Asker"],
    ["alaarcha", 42.8200, 74.5600, 0.95, 0.35, "private", "Ала-Арча (ж/м)", "Ала-Арча (т/к)", "Ala-Archa (housing area)"],
    ["akbosogo", 42.9280, 74.6280, 1.40, 0.70, "private", "Ак-Босого", "Ак-Босого", "Ak-Bosogo"],
    ["uchkun", 42.9180, 74.5850, 1.35, 0.65, "private", "Учкун", "Учкун", "Uchkun"],
    ["kelechek", 42.9250, 74.6950, 1.40, 0.72, "private", "Келечек", "Келечек", "Kelechek"],
    ["akbata", 42.8980, 74.4600, 1.45, 0.70, "private", "Ак-Бата", "Ак-Бата", "Ak-Bata"],
  ],
  naryn: [
    ["n_moskovskaya", 41.4300, 75.9700, 1.20, 0.60, "private", "ул. Московская", "Московская көч.", "Moskovskaya St."],
    ["n_bazar", 41.4270, 76.0120, 1.25, 0.55, "apts", "Район рынка", "Базар аймагы", "Bazaar area"],
    ["n_unicampus", 41.4220, 75.9300, 1.00, 0.20, "micro", "Кампус UCA", "UCA кампусу", "UCA campus"],
  ],
  osh: [
    ["osh_cheremushki", 40.5220, 72.8150, 1.15, 0.30, "micro", "Черемушки", "Черемушки", "Cheryomushki"],
    ["osh_amir", 40.5480, 72.7950, 1.25, 0.55, "private", "Амир-Темур", "Амир-Темир", "Amir-Temur"],
    ["osh_kyzylkyshtak", 40.5560, 72.7700, 1.30, 0.65, "private", "Кызыл-Кыштак", "Кызыл-Кыштак", "Kyzyl-Kyshtak"],
    ["osh_anar", 40.5080, 72.7950, 1.20, 0.60, "private", "Анар", "Анар", "Anar"],
    ["osh_japalak", 40.5350, 72.8330, 1.20, 0.55, "private", "Жапалак", "Жапалак", "Japalak"],
  ],
  jalal: [
    ["jalal_kurort", 40.9500, 73.0300, 0.90, 0.30, "private", "Курорт", "Курорт", "Resort area"],
    ["jalal_sputnik", 40.9200, 73.0150, 1.15, 0.45, "micro", "Спутник", "Спутник", "Sputnik"],
    ["jalal_bazar", 40.9330, 72.9900, 1.25, 0.50, "apts", "Центральный рынок", "Борбордук базар", "Central bazaar"],
  ],
  karakol: [
    ["karakol_dungan", 42.4950, 78.3950, 1.25, 0.70, "private", "Дунганская слобода", "Дуңган конушу", "Dungan quarter"],
    ["karakol_pristan", 42.5300, 78.3200, 1.10, 0.55, "private", "Пристань-Пржевальск", "Пристань-Пржевальск", "Pristan-Przhevalsk"],
    ["karakol_bazar", 42.4870, 78.3850, 1.30, 0.50, "apts", "Район Ак-Тилек базара", "Ак-Тилек базар аймагы", "Ak-Tilek bazaar area"],
  ],
  talas: [
    ["talas_aral", 42.5300, 72.2100, 1.20, 0.65, "private", "Арал", "Арал", "Aral"],
    ["talas_bazar", 42.5180, 72.2450, 1.20, 0.45, "apts", "Район рынка", "Базар аймагы", "Bazaar area"],
    ["talas_kopuro", 42.5050, 72.2650, 1.15, 0.60, "private", "Копуро-Базар", "Көпүрө-Базар", "Kopuro-Bazar"],
  ],
  batken: [
    ["batken_bazar", 40.0620, 70.8250, 1.10, 0.40, "apts", "Район рынка", "Базар аймагы", "Bazaar area"],
    ["batken_kyshtut", 40.0450, 70.8000, 1.15, 0.55, "private", "Кыштут", "Кыштут", "Kyshtut"],
    ["batken_airport", 40.0750, 70.8450, 1.05, 0.50, "private", "У аэропорта", "Аэропорт жагы", "Airport side"],
  ],
  tokmok: [
    ["tokmok_dungan", 42.8350, 75.3100, 1.25, 0.65, "private", "Дунганский квартал", "Дуңган кварталы", "Dungan quarter"],
    ["tokmok_station", 42.8500, 75.2850, 1.20, 0.45, "micro", "Район вокзала", "Вокзал аймагы", "Station area"],
  ],
};
Object.entries(MORE_DISTRICTS).forEach(([cid, list]) => {
  const C = CITIES[cid]; const base = C.demoAqi[C.districts[0].id] / (C.districts[0].factor || 1);
  list.forEach(([id, lat, lon, factor, coalShare, type, ru, ky, en]) => {
    C.districts.push({ id, lat, lon, factor, coalShare, type, approx: true, name: { ru, ky, en },
      loc: { ru: `в районе «${ru}»`, ky: `«${ky}» аймагында`, en: `in ${en}` } });
    C.demoAqi[id] = Math.round(base * factor);
  });
});
CITIES.bishkek.radius = 950;

/* Доп. эко-маршруты. Координаты точек ПРИБЛИЗИТЕЛЬНЫЕ. far: за городом — AQI берём по модели в точке маршрута.
 * [id, тип, ru, ky, en, far, path] ; тип: walk | bike | run | school | commute | trip */
const RT_COLOR = { walk: "#2e7d4f", bike: "#e0a300", run: "#0f6e7a", school: "#7b4bb0", commute: "#5a3a22", trip: "#c0521d" };
const MORE_ROUTES = {
  bishkek: [
    ["b_panf", "walk", "Парк Панфилова", "Панфилов паркы", "Panfilov Park", 0, [[42.8790, 74.5960], [42.8812, 74.5982], [42.8835, 74.5990], [42.8848, 74.5965], [42.8825, 74.5945]]],
    ["b_bot", "walk", "Ботанический сад", "Ботаникалык бак", "Botanical Garden", 0, [[42.8545, 74.6330], [42.8568, 74.6358], [42.8592, 74.6332], [42.8572, 74.6300], [42.8545, 74.6330]]],
    ["b_ata", "run", "Ататюрк парк — пробежка", "Ататүрк паркы — чуркоо", "Ataturk Park run", 0, [[42.8395, 74.5855], [42.8420, 74.5890], [42.8445, 74.5870], [42.8425, 74.5835], [42.8395, 74.5855]]],
    ["b_kj", "walk", "Роща Кара-Жыгач", "Кара-Жыгач токою", "Kara-Jygach grove", 0, [[42.8150, 74.6480], [42.8175, 74.6515], [42.8200, 74.6540], [42.8185, 74.6575]]],
    ["b_erun", "run", "Бульвар Эркиндик — пробежка", "Эркиндик бульвары — чуркоо", "Erkindik Boulevard run", 0, [[42.8693, 74.6120], [42.8740, 74.6108], [42.8790, 74.6095], [42.8740, 74.6112], [42.8693, 74.6122]]],
    ["b_mg", "bike", "Бульвар Молодой Гвардии", "Жаш Гвардия бульвары", "Molodaya Gvardiya Boulevard", 0, [[42.8870, 74.5855], [42.8780, 74.5852], [42.8690, 74.5850], [42.8600, 74.5848]]],
    ["b_canal", "bike", "Вдоль Большого Чуйского канала", "Чоң Чүй каналынын боюнда", "Along the Great Chuy Canal", 0, [[42.9040, 74.5400], [42.9050, 74.5700], [42.9045, 74.6000], [42.9035, 74.6300], [42.9030, 74.6600]]],
    ["b_sch1", "school", "В школу: Джал (дворами)", "Мектепке: Жал (короо аркылуу)", "To school: Dzhal (via courtyards)", 0, [[42.8235, 74.5715], [42.8250, 74.5745], [42.8268, 74.5772]]],
    ["b_sch2", "school", "В школу: Тунгуч", "Мектепке: Түңгүч", "To school: Tunguch", 0, [[42.8448, 74.6478], [42.8465, 74.6508], [42.8482, 74.6532]]],
    ["b_com1", "commute", "Асанбай → центр (в обход трасс)", "Асанбай → борбор (трассаны айланып)", "Asanbay → centre (avoiding main roads)", 0, [[42.8170, 74.6250], [42.8300, 74.6195], [42.8450, 74.6150], [42.8600, 74.6125], [42.8750, 74.6105]]],
    ["b_aa", "trip", "Нацпарк Ала-Арча: тропа к водопаду", "Ала-Арча улуттук паркы: шаркыратмага жол", "Ala-Archa NP: trail to the waterfall", 1, [[42.5640, 74.4820], [42.5520, 74.4870], [42.5400, 74.4930], [42.5280, 74.4970]]],
    ["b_alam", "trip", "Ущелье Аламедин", "Аламүдүн капчыгайы", "Alamedin gorge", 1, [[42.6300, 74.6300], [42.6150, 74.6330], [42.6000, 74.6380], [42.5850, 74.6420]]],
  ],
  osh: [
    ["o_sul", "walk", "Сулайман-Тоо: подъём на гору", "Сулайман-Тоо: тоого чыгуу", "Sulaiman-Too ascent", 0, [[40.5310, 72.7960], [40.5325, 72.7925], [40.5335, 72.7890], [40.5330, 72.7855]]],
    ["o_ab", "bike", "Набережная Ак-Бууры", "Ак-Буура жээги", "Ak-Buura embankment", 0, [[40.5150, 72.8060], [40.5250, 72.8055], [40.5350, 72.8045], [40.5450, 72.8030]]],
    ["o_nav", "walk", "Парк Навои", "Навои паркы", "Navoi Park", 0, [[40.5270, 72.7985], [40.5285, 72.8005], [40.5300, 72.8015], [40.5290, 72.7990]]],
    ["o_run", "run", "Пробежка вдоль Ак-Бууры", "Ак-Буура боюнча чуркоо", "Ak-Buura riverside run", 0, [[40.5200, 72.8058], [40.5300, 72.8050], [40.5200, 72.8062]]],
    ["o_sch", "school", "В школу: Черемушки", "Мектепке: Черемушки", "To school: Cheryomushki", 0, [[40.5215, 72.8140], [40.5228, 72.8165], [40.5240, 72.8185]]],
    ["o_com", "commute", "Амир-Темур → центр (тихими улицами)", "Амир-Темир → борбор (тынч көчөлөр)", "Amir-Temur → centre (quiet streets)", 0, [[40.5480, 72.7950], [40.5420, 72.7975], [40.5360, 72.8000], [40.5300, 72.8020]]],
    ["o_pap", "trip", "Водохранилище Папан", "Папан суу сактагычы", "Papan reservoir", 1, [[40.3350, 72.9500], [40.3300, 72.9600], [40.3250, 72.9700]]],
    ["o_abs", "trip", "Абшир-Ата: водопад", "Абшир-Ата: шаркыратма", "Abshir-Ata waterfall", 1, [[40.0700, 72.6100], [40.0650, 72.6150], [40.0600, 72.6200]]],
  ],
  naryn: [
    ["nr_emb", "walk", "Набережная Нарына", "Нарын жээги", "Naryn embankment", 0, [[41.4260, 75.9600], [41.4255, 75.9800], [41.4250, 76.0000], [41.4245, 76.0200]]],
    ["nr_run", "run", "Пробежка у кампуса UCA", "UCA кампусунун жанында чуркоо", "Run by the UCA campus", 0, [[41.4220, 75.9250], [41.4230, 75.9330], [41.4220, 75.9400]]],
    ["nr_sch", "school", "В школу: центр", "Мектепке: борбор", "To school: centre", 0, [[41.4295, 75.9880], [41.4290, 75.9910], [41.4285, 75.9940]]],
    ["nr_sal", "trip", "Нацпарк Салкын-Тёр", "Салкын-Төр улуттук паркы", "Salkyn-Tor National Park", 1, [[41.4700, 76.1600], [41.4800, 76.1700], [41.4900, 76.1800]]],
  ],
  jalal: [
    ["j_kur", "walk", "Тропа к курорту Жалал-Абад", "Жалал-Абад курортуна жол", "Trail to the Jalal-Abad spa", 0, [[40.9400, 73.0150], [40.9450, 73.0220], [40.9500, 73.0300], [40.9530, 73.0360]]],
    ["j_park", "run", "Парк в центре — пробежка", "Борбордогу парк — чуркоо", "Central park run", 0, [[40.9320, 72.9980], [40.9335, 73.0010], [40.9320, 73.0030], [40.9305, 73.0000]]],
    ["j_sch", "school", "В школу: Спутник", "Мектепке: Спутник", "To school: Sputnik", 0, [[40.9200, 73.0150], [40.9215, 73.0130], [40.9230, 73.0110]]],
    ["j_ars", "trip", "Арсланбоб: орехово-плодовый лес", "Арстанбап: жаңгак токою", "Arslanbob walnut forest", 1, [[41.3330, 72.9400], [41.3400, 72.9500], [41.3480, 72.9600]]],
  ],
  karakol: [
    ["k_pop", "walk", "Тополиные аллеи центра", "Борбордогу терек аллеялары", "Poplar alleys of the centre", 0, [[42.4920, 78.3880], [42.4900, 78.3920], [42.4880, 78.3960], [42.4860, 78.4000]]],
    ["k_cath", "walk", "Собор → Дунганская мечеть", "Собор → Дуңган мечити", "Cathedral → Dungan Mosque", 0, [[42.4930, 78.3920], [42.4910, 78.3950], [42.4890, 78.3980]]],
    ["k_sch", "school", "В школу: центр", "Мектепке: борбор", "To school: centre", 0, [[42.4905, 78.3870], [42.4895, 78.3895], [42.4885, 78.3920]]],
    ["k_gorge", "trip", "Ущелье Каракол", "Каракол капчыгайы", "Karakol gorge", 1, [[42.4300, 78.4500], [42.4100, 78.4650], [42.3900, 78.4800], [42.3700, 78.4900]]],
    ["k_jo", "trip", "Джеты-Огуз", "Жети-Өгүз", "Jeti-Oguz", 1, [[42.3400, 78.2200], [42.3300, 78.2250], [42.3200, 78.2300]]],
  ],
  talas: [
    ["t_emb", "bike", "Набережная Таласа", "Талас жээги", "Talas riverside", 0, [[42.5150, 72.2100], [42.5160, 72.2300], [42.5170, 72.2500]]],
    ["t_park", "walk", "Центральный парк", "Борбордук парк", "Central park", 0, [[42.5200, 72.2380], [42.5215, 72.2405], [42.5200, 72.2425], [42.5185, 72.2400]]],
    ["t_sch", "school", "В школу: Арал", "Мектепке: Арал", "To school: Aral", 0, [[42.5300, 72.2100], [42.5285, 72.2130], [42.5270, 72.2160]]],
    ["t_manas", "trip", "Манас-Ордо", "Манас-Ордо", "Manas Ordo", 1, [[42.5450, 72.7000], [42.5470, 72.7050], [42.5490, 72.7100]]],
  ],
  batken: [
    ["bt_apr", "walk", "Абрикосовые сады", "Өрүк бактары", "Apricot orchards", 0, [[40.0550, 70.8100], [40.0570, 70.8150], [40.0590, 70.8200]]],
    ["bt_run", "run", "Пробежка у аэропорта", "Аэропорт жанында чуркоо", "Run near the airport", 0, [[40.0720, 70.8400], [40.0740, 70.8450], [40.0720, 70.8500]]],
    ["bt_sch", "school", "В школу: Кыштут", "Мектепке: Кыштут", "To school: Kyshtut", 0, [[40.0450, 70.8000], [40.0470, 70.8030], [40.0490, 70.8060]]],
    ["bt_ai", "trip", "Айгуль-Таш (цветок айгуль)", "Айгүл-Таш (айгүл гүлү)", "Aigul-Tash (aigul flower)", 1, [[39.9000, 71.0300], [39.8950, 71.0350], [39.8900, 71.0400]]],
  ],
  tokmok: [
    ["tk_chu", "bike", "Вдоль реки Чу", "Чүй дарыясынын боюнда", "Along the Chuy river", 0, [[42.8650, 75.2600], [42.8660, 75.2850], [42.8670, 75.3100]]],
    ["tk_park", "walk", "Городской парк Токмока", "Токмок шаардык паркы", "Tokmok city park", 0, [[42.8400, 75.2880], [42.8415, 75.2905], [42.8400, 75.2930], [42.8385, 75.2905]]],
    ["tk_sch", "school", "В школу: район вокзала", "Мектепке: вокзал аймагы", "To school: station area", 0, [[42.8500, 75.2850], [42.8485, 75.2870], [42.8470, 75.2890]]],
    ["tk_bur", "trip", "Башня Бурана", "Бурана мунарасы", "Burana Tower", 1, [[42.7480, 75.2480], [42.7465, 75.2500], [42.7450, 75.2520]]],
  ],
};
Object.values(CITIES).forEach(C => C.routes.forEach(r => { r.type = r.type || r.mode; }));
Object.entries(MORE_ROUTES).forEach(([cid, list]) => list.forEach(([id, type, ru, ky, en, far, path]) => {
  CITIES[cid].routes.push({ id, type, mode: type === "bike" || type === "commute" ? "bike" : "walk", color: RT_COLOR[type], far: !!far, approx: true, name: { ru, ky, en }, path });
}));

/* ===== Турция: 10 крупных городов. Координаты районов ПРИБЛИЗИТЕЛЬНЫЕ. ===== */
const KG_ORDER = CITY_ORDER.slice();
const TR_CITIES = [
  ["istanbul", "🌉", [41.0082, 28.9784], "Стамбул", "Стамбул", "Istanbul", "Стамбула", "Стамбулдун", "Стамбуле", "Стамбулда", /İstanbul|Istanbul/i, [
    ["ist_fatih", 41.0186, 28.9497, "Фатих", "Фатих", "Fatih", "apts"], ["ist_besiktas", 41.0430, 29.0070, "Бешикташ", "Бешикташ", "Beşiktaş", "apts"],
    ["ist_kadikoy", 40.9910, 29.0270, "Кадыкёй", "Кадыкөй", "Kadıköy", "apts"], ["ist_uskudar", 41.0260, 29.0150, "Ускюдар", "Ускүдар", "Üsküdar", "apts"],
    ["ist_esenyurt", 41.0340, 28.6770, "Эсеньюрт", "Эсеньюрт", "Esenyurt", "micro"], ["ist_bagcilar", 41.0390, 28.8560, "Багджылар", "Багжылар", "Bağcılar", "micro"]]],
  ["ankara", "🏛️", [39.9334, 32.8597], "Анкара", "Анкара", "Ankara", "Анкары", "Анкаранын", "Анкаре", "Анкарада", /Ankara/i, [
    ["ank_cankaya", 39.9180, 32.8620, "Чанкая", "Чанкая", "Çankaya", "apts"], ["ank_kecioren", 39.9800, 32.8650, "Кечиорен", "Кечиөрөн", "Keçiören", "micro"],
    ["ank_yenimahalle", 39.9690, 32.8100, "Енимахалле", "Енимахалле", "Yenimahalle", "micro"], ["ank_mamak", 39.9300, 32.9200, "Мамак", "Мамак", "Mamak", "private"],
    ["ank_etimesgut", 39.9500, 32.6700, "Этимесгут", "Этимесгут", "Etimesgut", "micro"], ["ank_altindag", 39.9550, 32.8850, "Алтындаг", "Алтындаг", "Altındağ", "private"]]],
  ["izmir", "⛵", [38.4237, 27.1428], "Измир", "Измир", "Izmir", "Измира", "Измирдин", "Измире", "Измирде", /İzmir|Izmir/i, [
    ["izm_konak", 38.4189, 27.1287, "Конак", "Конак", "Konak", "apts"], ["izm_karsiyaka", 38.4600, 27.1100, "Каршияка", "Каршыяка", "Karşıyaka", "apts"],
    ["izm_bornova", 38.4700, 27.2200, "Борнова", "Борнова", "Bornova", "micro"], ["izm_buca", 38.3880, 27.1750, "Буджа", "Бужа", "Buca", "micro"],
    ["izm_bayrakli", 38.4620, 27.1650, "Байраклы", "Байраклы", "Bayraklı", "apts"]]],
  ["bursa", "🏔️", [40.1885, 29.0610], "Бурса", "Бурса", "Bursa", "Бурсы", "Бурсанын", "Бурсе", "Бурсада", /Bursa/i, [
    ["brs_osmangazi", 40.1950, 29.0600, "Османгази", "Османгази", "Osmangazi", "apts"], ["brs_yildirim", 40.1900, 29.1050, "Йылдырым", "Йылдырым", "Yıldırım", "micro"],
    ["brs_nilufer", 40.2150, 28.9900, "Нилюфер", "Нилүфер", "Nilüfer", "micro"], ["brs_gursu", 40.2200, 29.1900, "Гюрсу", "Гүрсу", "Gürsu", "private"]]],
  ["antalya", "🏖️", [36.8969, 30.7133], "Анталья", "Анталия", "Antalya", "Антальи", "Анталиянын", "Анталье", "Анталияда", /Antalya/i, [
    ["ant_muratpasa", 36.8850, 30.7050, "Муратпаша", "Муратпаша", "Muratpaşa", "apts"], ["ant_kepez", 36.9300, 30.7000, "Кепез", "Кепез", "Kepez", "micro"],
    ["ant_konyaalti", 36.8700, 30.6400, "Коньяалты", "Коняалты", "Konyaaltı", "apts"], ["ant_aksu", 36.9500, 30.8400, "Аксу", "Аксуу", "Aksu", "private"]]],
  ["konya", "🕌", [37.8746, 32.4932], "Конья", "Коня", "Konya", "Коньи", "Конянын", "Конье", "Коняда", /Konya/i, [
    ["kon_selcuklu", 37.9100, 32.5000, "Сельчуклу", "Селжуклу", "Selçuklu", "micro"], ["kon_meram", 37.8500, 32.4400, "Мерам", "Мерам", "Meram", "private"],
    ["kon_karatay", 37.8700, 32.5300, "Каратай", "Каратай", "Karatay", "private"], ["kon_center", 37.8730, 32.4930, "Центр (Алаэддин)", "Борбор (Алаэддин)", "Centre (Alaaddin)", "apts"]]],
  ["gaziantep", "🥮", [37.0662, 37.3833], "Газиантеп", "Газиантеп", "Gaziantep", "Газиантепа", "Газиантептин", "Газиантепе", "Газиантепте", /Gaziantep|Antep/i, [
    ["gaz_sahinbey", 37.0500, 37.3700, "Шахинбей", "Шахинбей", "Şahinbey", "micro"], ["gaz_sehitkamil", 37.0900, 37.3700, "Шехиткамиль", "Шехиткамил", "Şehitkamil", "micro"],
    ["gaz_center", 37.0660, 37.3830, "Центр (Крепость)", "Борбор (Чеп)", "Centre (Castle)", "apts"], ["gaz_east", 37.0650, 37.4200, "Восточные кварталы", "Чыгыш кварталдар", "Eastern quarters", "private"]]],
  ["erzurum", "❄️", [39.9055, 41.2658], "Эрзурум", "Эрзурум", "Erzurum", "Эрзурума", "Эрзурумдун", "Эрзуруме", "Эрзурумда", /Erzurum/i, [
    ["erz_yakutiye", 39.9100, 41.2700, "Якутие", "Якутие", "Yakutiye", "apts"], ["erz_palandoken", 39.8800, 41.2700, "Паландёкен", "Паландөкөн", "Palandöken", "micro"],
    ["erz_aziziye", 39.9500, 41.1100, "Азизие (Ылыджа)", "Азизие (Ылыжа)", "Aziziye (Ilıca)", "private"], ["erz_center", 39.9050, 41.2750, "Центр (Крепость)", "Борбор (Чеп)", "Centre (Castle)", "apts"]]],
  ["trabzon", "🌊", [41.0027, 39.7168], "Трабзон", "Трабзон", "Trabzon", "Трабзона", "Трабзондун", "Трабзоне", "Трабзондо", /Trabzon/i, [
    ["trb_ortahisar", 41.0050, 39.7200, "Ортахисар", "Ортахисар", "Ortahisar", "apts"], ["trb_akcaabat", 41.0210, 39.5700, "Акчаабат", "Акчаабат", "Akçaabat", "private"],
    ["trb_yomra", 40.9550, 39.8600, "Йомра", "Йомра", "Yomra", "private"], ["trb_boztepe", 40.9950, 39.7300, "Бозтепе", "Бозтепе", "Boztepe", "micro"]]],
  ["adana", "🌶️", [37.0000, 35.3213], "Адана", "Адана", "Adana", "Аданы", "Адананын", "Адане", "Аданада", /Adana/i, [
    ["ada_seyhan", 36.9900, 35.3200, "Сейхан", "Сейхан", "Seyhan", "apts"], ["ada_cukurova", 37.0500, 35.2800, "Чукурова", "Чукурова", "Çukurova", "micro"],
    ["ada_yuregir", 36.9900, 35.3700, "Юреир", "Үрегир", "Yüreğir", "private"], ["ada_saricam", 37.0500, 35.4300, "Сарычам", "Сарычам", "Sarıçam", "private"]]],

  ["kayseri", "⛰️", [38.7205, 35.4826], "Кайсери", "Кайсери", "Kayseri", "Кайсери", "Кайсеринин", "Кайсери", "Кайсериде", /Kayseri/i, [
    ["kay_melikgazi", 38.7300, 35.5000, "Меликгази", "Меликгази", "Melikgazi", "apts"], ["kay_kocasinan", 38.7500, 35.4600, "Коджасинан", "Кожасинан", "Kocasinan", "micro"], ["kay_talas", 38.6900, 35.5500, "Талас (Кайсери)", "Талас (Кайсери)", "Talas", "micro"]]],
  ["samsun", "⚓", [41.2867, 36.3300], "Самсун", "Самсун", "Samsun", "Самсуна", "Самсундун", "Самсуне", "Самсунда", /Samsun/i, [
    ["sam_ilkadim", 41.2900, 36.3300, "Илкадым", "Илкадым", "İlkadım", "apts"], ["sam_atakum", 41.3300, 36.2700, "Атакум", "Атакум", "Atakum", "apts"], ["sam_canik", 41.2600, 36.3600, "Джаник", "Жаник", "Canik", "private"]]],
  ["diyarbakir", "🧱", [37.9144, 40.2306], "Диярбакыр", "Диярбакыр", "Diyarbakır", "Диярбакыра", "Диярбакырдын", "Диярбакыре", "Диярбакырда", /Diyarbak[ıi]r/i, [
    ["diy_sur", 37.9100, 40.2350, "Сур", "Сур", "Sur", "private"], ["diy_baglar", 37.9000, 40.1900, "Баглар", "Баглар", "Bağlar", "micro"], ["diy_kayapinar", 37.9400, 40.1600, "Каяпынар", "Каяпынар", "Kayapınar", "apts"], ["diy_yenisehir", 37.9300, 40.2300, "Енишехир", "Енишехир", "Yenişehir", "apts"]]],
  ["eskisehir", "🚋", [39.7767, 30.5206], "Эскишехир", "Эскишехир", "Eskişehir", "Эскишехира", "Эскишехирдин", "Эскишехире", "Эскишехирде", /Eski[şs]ehir/i, [
    ["esk_odunpazari", 39.7600, 30.5200, "Одунпазары", "Одунпазары", "Odunpazarı", "apts"], ["esk_tepebasi", 39.7900, 30.5000, "Тепебаши", "Тепебашы", "Tepebaşı", "apts"], ["esk_sazova", 39.7750, 30.4650, "Сазова", "Сазова", "Sazova", "micro"]]],
  ["mersin", "🍋", [36.8121, 34.6415], "Мерсин", "Мерсин", "Mersin", "Мерсина", "Мерсиндин", "Мерсине", "Мерсинде", /Mersin/i, [
    ["mer_yenisehir", 36.7900, 34.5900, "Енишехир (Мерсин)", "Енишехир (Мерсин)", "Yenişehir", "apts"], ["mer_mezitli", 36.7500, 34.5300, "Мезитли", "Мезитли", "Mezitli", "apts"], ["mer_toroslar", 36.8300, 34.6100, "Торослар", "Торослар", "Toroslar", "micro"], ["mer_akdeniz", 36.8100, 34.6500, "Акдениз", "Акдениз", "Akdeniz", "micro"]]],
  ["denizli", "🐓", [37.7765, 29.0864], "Денизли", "Денизли", "Denizli", "Денизли", "Денизлинин", "Денизли", "Денизлиде", /Denizli/i, [
    ["den_merkezefendi", 37.7700, 29.0600, "Меркезэфенди", "Меркезэфенди", "Merkezefendi", "apts"], ["den_pamukkale", 37.7900, 29.1000, "Памуккале (район)", "Памуккале (район)", "Pamukkale", "micro"], ["den_center", 37.7760, 29.0870, "Центр (Байрамйери)", "Борбор (Байрамйери)", "Centre (Bayramyeri)", "apts"]]],
  ["sanliurfa", "🐟", [37.1591, 38.7969], "Шанлыурфа", "Шанлыурфа", "Şanlıurfa", "Шанлыурфы", "Шанлыурфанын", "Шанлыурфе", "Шанлыурфада", /[ŞS]anl[ıi]urfa|Urfa/i, [
    ["san_haliliye", 37.1700, 38.8100, "Халилие", "Халилие", "Haliliye", "apts"], ["san_eyyubiye", 37.1400, 38.7800, "Эйюбие", "Эйюбие", "Eyyübiye", "private"], ["san_karakopru", 37.1900, 38.8000, "Каракёпрю", "Каракөпрү", "Karaköprü", "micro"]]],
  ["malatya", "🍑", [38.3552, 38.3095], "Малатья", "Малатия", "Malatya", "Малатьи", "Малатиянын", "Малатье", "Малатияда", /Malatya/i, [
    ["mal_battalgazi", 38.4000, 38.3600, "Батталгази", "Батталгази", "Battalgazi", "private"], ["mal_yesilyurt", 38.3000, 38.2500, "Ешильюрт", "Ешилюрт", "Yeşilyurt", "micro"], ["mal_center", 38.3550, 38.3100, "Центр", "Борбор", "Centre", "apts"]]],
  ["van", "🐈", [38.5012, 43.3729], "Ван", "Ван", "Van", "Вана", "Вандын", "Ване", "Ванда", /(^|[^A-Za-zÇĞİÖŞÜçğıöşü])Van([^A-Za-zÇĞİÖŞÜçğıöşü]|$)/, [
    ["van_ipekyolu", 38.4950, 43.3800, "Ипекйолу", "Ипекйолу", "İpekyolu", "apts"], ["van_tusba", 38.5300, 43.3800, "Тушба", "Тушба", "Tuşba", "micro"], ["van_edremit", 38.4200, 43.2600, "Эдремит", "Эдремит", "Edremit", "private"]]],
  ["kocaeli", "🏭", [40.7654, 29.9408], "Коджаэли (Измит)", "Кожаэли (Измит)", "Kocaeli (İzmit)", "Коджаэли", "Кожаэлинин", "Коджаэли", "Кожаэлиде", /Kocaeli|[İI]zmit/i, [
    ["koc_izmit", 40.7650, 29.9400, "Измит", "Измит", "İzmit", "apts"], ["koc_basiskele", 40.7150, 29.9300, "Башискеле", "Башискеле", "Başiskele", "micro"], ["koc_kartepe", 40.7500, 30.0300, "Картепе", "Картепе", "Kartepe", "private"], ["koc_gebze", 40.8000, 29.4300, "Гебзе", "Гебзе", "Gebze", "micro"]]],
];
const TR_ROUTES = {
  bursa: [["brs_r1", "walk", "Культурпарк", "Культурпарк", "Kültürpark", [[40.1960, 29.0430], [40.1975, 29.0480], [40.1960, 29.0520]]], ["brs_r2", "trip", "Улудаг", "Улудаг тоосу", "Uludağ", [[40.1000, 29.1200], [40.0950, 29.1300], [40.0900, 29.1400]], 1]],
  konya: [["kon_r1", "walk", "Холм Алаэддина", "Алаэддин дөбөсү", "Alaaddin Hill", [[37.8740, 32.4920], [37.8755, 32.4940], [37.8740, 32.4960], [37.8725, 32.4940]]], ["kon_r2", "bike", "Сады Мерама", "Мерам бактары", "Meram orchards", [[37.8600, 32.4600], [37.8500, 32.4400], [37.8450, 32.4250]]]],
  gaziantep: [["gaz_r1", "walk", "Крепость Газиантепа", "Газиантеп чеби", "Gaziantep Castle walk", [[37.0660, 37.3830], [37.0640, 37.3800], [37.0620, 37.3760]]], ["gaz_r2", "bike", "Долина Аллебен", "Аллебен өрөөнү", "Alleben valley", [[37.0600, 37.3600], [37.0580, 37.3450], [37.0560, 37.3300]]]],
  erzurum: [["erz_r1", "walk", "Чифте-Минарели → Крепость", "Чифте-Минарели → Чеп", "Çifte Minareli → Castle", [[39.9030, 41.2770], [39.9050, 41.2740], [39.9070, 41.2710]]], ["erz_r2", "trip", "Паландёкен", "Паландөкөн тоосу", "Palandöken", [[39.8400, 41.2800], [39.8300, 41.2900], [39.8200, 41.3000]], 1]],
  trabzon: [["trb_r1", "walk", "Бозтепе", "Бозтепе", "Boztepe", [[41.0000, 39.7300], [40.9950, 39.7330], [40.9920, 39.7360]]], ["trb_r2", "bike", "Набережная Трабзона", "Трабзон жээги", "Trabzon seafront", [[41.0050, 39.7000], [41.0060, 39.7200], [41.0040, 39.7400]]], ["trb_r3", "trip", "Озеро Узунгёль", "Узунгөл көлү", "Lake Uzungöl", [[40.6190, 40.2900], [40.6150, 40.2950], [40.6120, 40.3000]], 1]],
  adana: [["ada_r1", "bike", "Берег Сейхана", "Сейхан жээги", "Seyhan riverside", [[36.9850, 35.3250], [37.0000, 35.3200], [37.0150, 35.3150]]], ["ada_r2", "walk", "Центральный парк Аданы", "Адананын борбордук паркы", "Adana Merkez Park", [[36.9950, 35.3300], [37.0000, 35.3330], [37.0040, 35.3300]]]],
  kayseri: [["kay_r1", "walk", "Крепость Кайсери", "Кайсери чеби", "Kayseri Castle", [[38.7210, 35.4870], [38.7230, 35.4890], [38.7220, 35.4920]]], ["kay_r2", "trip", "Эрджиес", "Эржиес тоосу", "Mount Erciyes", [[38.5400, 35.4800], [38.5300, 35.4900], [38.5200, 35.5000]], 1]],
  samsun: [["sam_r1", "bike", "Набережная Самсуна", "Самсун жээги", "Samsun seafront", [[41.2950, 36.3350], [41.3100, 36.3000], [41.3250, 36.2700]]], ["sam_r2", "walk", "Холм Амисос", "Амисос дөбөсү", "Amisos Hill", [[41.3000, 36.3200], [41.3010, 36.3180], [41.3020, 36.3150]]]],
  diyarbakir: [["diy_r1", "walk", "Крепостные стены", "Чеп дубалдары", "City walls", [[37.9100, 40.2300], [37.9150, 40.2370], [37.9100, 40.2420]]], ["diy_r2", "walk", "Мост Он-Гёзлю", "Он-Гөзлү көпүрөсү", "Ten-Eyed Bridge", [[37.8900, 40.2350], [37.8820, 40.2400], [37.8750, 40.2450]]]],
  eskisehir: [["esk_r1", "walk", "Набережная Порсука", "Порсук жээги", "Porsuk riverside", [[39.7750, 30.5100], [39.7760, 30.5200], [39.7770, 30.5300]]], ["esk_r2", "run", "Парк Сазова", "Сазова паркы", "Sazova Park run", [[39.7750, 30.4600], [39.7770, 30.4650], [39.7750, 30.4700]]]],
  mersin: [["mer_r1", "bike", "Набережная Мерсина", "Мерсин жээги", "Mersin seafront", [[36.7900, 34.6000], [36.7800, 34.5700], [36.7650, 34.5400]]]],
  denizli: [["den_r1", "walk", "Парк Чамлык", "Чамлык паркы", "Çamlık Park", [[37.7500, 29.0950], [37.7520, 29.0980], [37.7540, 29.1000]]], ["den_r2", "trip", "Травертины Памуккале", "Памуккале травертиндери", "Pamukkale travertines", [[37.9200, 29.1200], [37.9230, 29.1230], [37.9250, 29.1260]], 1]],
  sanliurfa: [["san_r1", "walk", "Балыклыгёль", "Балыклыгөл", "Balıklıgöl", [[37.1460, 38.7860], [37.1470, 38.7890], [37.1480, 38.7920]]], ["san_r2", "trip", "Гёбекли-Тепе", "Гөбекли-Тепе", "Göbeklitepe", [[37.2230, 38.9220], [37.2240, 38.9240]], 1]],
  malatya: [["mal_r1", "walk", "Старая Малатья (Батталгази)", "Эски Малатия (Батталгази)", "Old Malatya (Battalgazi)", [[38.4010, 38.3620], [38.4030, 38.3650], [38.4020, 38.3680]]]],
  van: [["van_r1", "bike", "Берег озера Ван", "Ван көлүнүн жээги", "Lake Van shore", [[38.4950, 43.3200], [38.5050, 43.3100], [38.5150, 43.3000]]], ["van_r2", "walk", "Ванская крепость", "Ван чеби", "Van Fortress", [[38.5030, 43.3400], [38.5040, 43.3440], [38.5030, 43.3480]]]],
  kocaeli: [["koc_r1", "bike", "Набережная Измита", "Измит жээги", "İzmit seafront", [[40.7600, 29.9200], [40.7620, 29.9400], [40.7630, 29.9600]]], ["koc_r2", "trip", "Картепе", "Картепе тоосу", "Kartepe", [[40.6900, 30.0900], [40.6850, 30.1000]], 1]],

  istanbul: [["ist_r1", "walk", "Набережная Бешикташ → Бебек", "Бешикташ → Бебек жээги", "Beşiktaş → Bebek waterfront", [[41.0430, 29.0070], [41.0470, 29.0200], [41.0600, 29.0350], [41.0770, 29.0430]]],
    ["ist_r2", "bike", "Мода → Джаддебостан вдоль моря", "Мода → Жаддебостан деңиз боюнда", "Moda → Caddebostan seaside", [[40.9800, 29.0250], [40.9750, 29.0400], [40.9650, 29.0600], [40.9620, 29.0750]]],
    ["ist_r3", "walk", "Парк Йылдыз", "Йылдыз паркы", "Yıldız Park", [[41.0480, 29.0130], [41.0500, 29.0110], [41.0510, 29.0140]]]],
  ankara: [["ank_r1", "walk", "Парк Генчлик", "Генчлик паркы", "Gençlik Park", [[39.9370, 32.8500], [39.9390, 32.8530], [39.9400, 32.8500]]],
    ["ank_r2", "trip", "Озеро Эймир", "Эймир көлү", "Lake Eymir", [[39.8200, 32.8300], [39.8100, 32.8400], [39.8000, 32.8450]], 1]],
  izmir: [["izm_r1", "walk", "Набережная Кордон", "Кордон жээги", "Kordon promenade", [[38.4190, 27.1280], [38.4280, 27.1340], [38.4370, 27.1410], [38.4420, 27.1440]]],
    ["izm_r2", "bike", "Набережная Каршияки", "Каршыяка жээги", "Karşıyaka seafront", [[38.4560, 27.1000], [38.4580, 27.1200], [38.4600, 27.1400]]]],
  antalya: [["ant_r1", "bike", "Набережная Коньяалты", "Коняалты жээги", "Konyaaltı beach promenade", [[36.8770, 30.6600], [36.8700, 30.6400], [36.8620, 30.6200]]],
    ["ant_r2", "walk", "Старый город Калеичи", "Калеичи эски шаары", "Kaleiçi old town", [[36.8840, 30.7050], [36.8860, 30.7080], [36.8830, 30.7100]]]],
};
const TR_ROUTE_TR = {"ist_r1": "Beşiktaş → Bebek sahili", "ist_r2": "Moda → Caddebostan sahil yolu", "ist_r3": "Yıldız Parkı", "ank_r1": "Gençlik Parkı", "ank_r2": "Eymir Gölü", "izm_r1": "Kordon yürüyüşü", "izm_r2": "Karşıyaka sahili", "brs_r1": "Kültürpark", "brs_r2": "Uludağ", "ant_r1": "Konyaaltı sahil yolu", "ant_r2": "Kaleiçi (eski şehir)", "kon_r1": "Alaaddin Tepesi", "kon_r2": "Meram bağları", "gaz_r1": "Gaziantep Kalesi yürüyüşü", "gaz_r2": "Alleben vadisi", "erz_r1": "Çifte Minareli → Kale", "erz_r2": "Palandöken", "trb_r1": "Boztepe", "trb_r2": "Trabzon sahili", "trb_r3": "Uzungöl", "ada_r1": "Seyhan kıyısı", "ada_r2": "Adana Merkez Park", "kay_r1": "Kayseri Kalesi", "kay_r2": "Erciyes Dağı", "sam_r1": "Samsun sahili", "sam_r2": "Amisos Tepesi", "diy_r1": "Diyarbakır surları", "diy_r2": "On Gözlü Köprü", "esk_r1": "Porsuk kıyısı", "esk_r2": "Sazova Parkı koşusu", "mer_r1": "Mersin sahili", "den_r1": "Çamlık Parkı", "den_r2": "Pamukkale travertenleri", "san_r1": "Balıklıgöl", "san_r2": "Göbeklitepe", "mal_r1": "Eski Malatya (Battalgazi)", "van_r1": "Van Gölü kıyısı", "van_r2": "Van Kalesi", "koc_r1": "İzmit sahili", "koc_r2": "Kartepe"};
const TR_ORDER = TR_CITIES.map(c => c[0]);
TR_CITIES.forEach(([id, emoji, center, ru, ky, en, gru, gky, pru, pky, rx, ds], i) => {
  const C = makeCity({ id, emoji, center, seed: i, demoBase: 70, name: { ru, ky, en }, gen: { ru: gru, ky: gky, en }, prep: { ru: pru, ky: pky, en },
    sides: ["north", "south", "east"], factors: [1, 1, 1, 1], coal: [0.1, 0.1, 0.1, 0.1], house: { area: 100, coal: 3, price: 9000 }, k: {} });
  C.country = "tr"; C.newsRx = rx; C.zoom = 11; C.radius = 1300;
  C.districts = ds.map(([did, lat, lon, dru, dky, den, type]) => ({ id: did, lat, lon, factor: 1, coalShare: 0.1, type, approx: true, name: { ru: dru, ky: dky, en: den },
    loc: { ru: `в районе ${dru}`, ky: `${dky} районунда`, en: `in ${den}`, tr: `${den} bölgesinde` } }));
  C.defaultDistrict = C.alertDistrict = C.districts[0].id;
  C.leaderboard = {}; C.demoAqi = Object.fromEntries(C.districts.map(d => [d.id, 70]));
  C.groups.forEach((g, k) => { g.district = C.districts[k % C.districts.length].id; });
  C.routes = (TR_ROUTES[id] || []).map(([rid, type, rru, rky, ren, path, far]) => ({ id: rid, type, mode: type === "bike" ? "bike" : "walk", color: RT_COLOR[type], far: !!far, approx: true, name: { ru: rru, ky: rky, en: ren, tr: TR_ROUTE_TR[rid] || ren }, path }));
  CITIES[id] = C;
});
KG_ORDER.forEach(id => { CITIES[id].country = "kg"; });
