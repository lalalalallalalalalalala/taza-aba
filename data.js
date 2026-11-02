/* Таза Аба — справочные и ДЕМО-данные (ru / ky / en).
 * Всё, что помечено DEMO, — выдуманные данные для презентации прототипа.
 *
 * Районы: lat/lon — приблизительный центр массива.
 * v87: прежние числа factor (наш «коэффициент района») и coalShare (выдуманная доля домов на угле) удалены из исходника —
 *   в расчётах они не использовались (v85), а официальных данных по районам нет. coalShare = null → в интерфейсе не показывается.
 * loc — форма «в районе» для фраз (в Ак-Орго / Ак-Оргодо / in Ak-Orgo).
 */
const DTYPE = {
  apts:    { ru: "многоэтажки", ky: "көп кабаттуу үйлөр", en: "apartment blocks" },
  private: { ru: "частный сектор", ky: "жеке сектор", en: "private houses" },
  micro:   { ru: "микрорайон", ky: "кичи район", en: "microdistrict" },
  village: { ru: "село / посёлок", ky: "айыл / кыштак", en: "village" },
};
const BK_DISTRICTS = [
  { id: "center",   lat: 42.8765, lon: 74.6040, coalShare: null, type: "apts",
    name: { ru: "Центр (Ала-Тоо)", ky: "Борбор (Ала-Тоо)", en: "Centre (Ala-Too)" }, loc: { ru: "в центре", ky: "борбордо", en: "in the city centre" } },
  { id: "akorgo",   lat: 42.9020, lon: 74.5440, coalShare: null, type: "private",
    name: { ru: "Ак-Орго", ky: "Ак-Орго", en: "Ak-Orgo" }, loc: { ru: "в Ак-Орго", ky: "Ак-Оргодо", en: "in Ak-Orgo" } },
  { id: "archa",    lat: 42.9150, lon: 74.4990, coalShare: null, type: "private",
    name: { ru: "Арча-Бешик", ky: "Арча-Бешик", en: "Archa-Beshik" }, loc: { ru: "в Арча-Бешике", ky: "Арча-Бешикте", en: "in Archa-Beshik" } },
  { id: "akordo",   lat: 42.8930, lon: 74.4800, coalShare: null, type: "private",
    name: { ru: "Ак-Ордо", ky: "Ак-Ордо", en: "Ak-Ordo" }, loc: { ru: "в Ак-Ордо", ky: "Ак-Ордодо", en: "in Ak-Ordo" } },
  { id: "kalys",    lat: 42.9180, lon: 74.6550, coalShare: null, type: "private",
    name: { ru: "Калыс-Ордо", ky: "Калыс-Ордо", en: "Kalys-Ordo" }, loc: { ru: "в Калыс-Ордо", ky: "Калыс-Ордодо", en: "in Kalys-Ordo" } },
  { id: "alamedin", lat: 42.8880, lon: 74.6380, coalShare: null, type: "micro",
    name: { ru: "Аламедин-1", ky: "Аламүдүн-1", en: "Alamedin-1" }, loc: { ru: "в Аламедине-1", ky: "Аламүдүн-1де", en: "in Alamedin-1" } },
  { id: "tunguch",  lat: 42.8460, lon: 74.6520, coalShare: null, type: "micro",
    name: { ru: "Тунгуч", ky: "Түңгүч", en: "Tunguch" }, loc: { ru: "в Тунгуче", ky: "Түңгүчтө", en: "in Tunguch" } },
  { id: "dzhal",    lat: 42.8250, lon: 74.5750, coalShare: null, type: "micro",
    name: { ru: "Джал", ky: "Жал", en: "Dzhal" }, loc: { ru: "на Джале", ky: "Жалда", en: "in Dzhal" } },
  { id: "asanbay",  lat: 42.8170, lon: 74.6250, coalShare: null, type: "micro",
    name: { ru: "Асанбай", ky: "Асанбай", en: "Asanbay" }, loc: { ru: "в Асанбае", ky: "Асанбайда", en: "in Asanbay" } },
  { id: "vostok5",  lat: 42.8600, lon: 74.6900, coalShare: null, type: "micro",
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

const HOME_WHAT = {
  pump:  { ru: "Тепловой насос", ky: "Жылуулук насосу", en: "Heat pump" },
  solar: { ru: "Солнечные панели", ky: "Күн панелдери", en: "Solar panels" },
  insul: { ru: "Утепление", ky: "Жылуулоо", en: "Insulation" },
  insul_solar: { ru: "Утепление + панели", ky: "Жылуулоо + панелдер", en: "Insulation + solar" },
  insul_pump:  { ru: "Утепление + насос", ky: "Жылуулоо + насос", en: "Insulation + heat pump" },
};



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
 * координаты приблизительные.
 */
const NR_DISTRICTS = [
  { id: "n_center", lat: 41.4287, lon: 75.9911, coalShare: null, type: "apts",
    name: { ru: "Центр", ky: "Борбор", en: "Centre" }, loc: { ru: "в центре Нарына", ky: "Нарындын борборунда", en: "in central Naryn" } },
  { id: "n_west", lat: 41.4330, lon: 75.9480, coalShare: null, type: "private",
    name: { ru: "Западный массив", ky: "Батыш массиви", en: "West side" }, loc: { ru: "в Западном массиве", ky: "Батыш массивинде", en: "on the west side" } },
  { id: "n_east", lat: 41.4250, lon: 76.0350, coalShare: null, type: "private",
    name: { ru: "Восточный массив", ky: "Чыгыш массиви", en: "East side" }, loc: { ru: "в Восточном массиве", ky: "Чыгыш массивинде", en: "on the east side" } },
  { id: "n_left", lat: 41.4175, lon: 75.9850, coalShare: null, type: "private",
    name: { ru: "Левый берег", ky: "Сол жээк", en: "Left bank" }, loc: { ru: "на левом берегу", ky: "сол жээкте", en: "on the left bank" } },
  { id: "n_north", lat: 41.4400, lon: 76.0050, coalShare: null, type: "micro",
    name: { ru: "Северный склон", ky: "Түндүк бет", en: "North slope" }, loc: { ru: "на северном склоне", ky: "түндүк бетте", en: "on the north slope" } },
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
    districts: BK_DISTRICTS, routes: BK_ECO_ROUTES },
  /* Нарын: зима длиннее и холоднее → больше угля (8 т), уголь дешевле (рядом Кара-Кече, ~5 000 сом/т),
   * тепловой насос в морозы −20…−30 °C работает хуже (COP 2.2), солнца на высоте больше (1 450 кВт·ч/кВт). */
  naryn: { id: "naryn", center: [41.4287, 75.9911], defaultDistrict: "n_west", alertDistrict: "n_west",
    name: { ru: "Нарын", ky: "Нарын", en: "Naryn" }, gen: { ru: "Нарына", ky: "Нарындын", en: "Naryn" }, prep: { ru: "Нарыне", ky: "Нарында", en: "Naryn" },
    house: { area: 90, coal: 8, price: 5000 }, k: { hpCOP: 2.2, pvYield: 1450 },
    districts: NR_DISTRICTS, routes: NR_ECO_ROUTES },
};

/* ================= ДРУГИЕ ГОРОДА (DEMO-генератор) =================
 * Для Оша, Джалал-Абада, Каракола, Таласа, Баткена и Токмока реальные границы массивов не
 * используются: районы названы по сторонам света («Центр», «Северная часть» …), координаты —
 * смещения от центра города (приблизительно). Маршруты проложены вручную.
 */
const SIDE = {
  center: { name: { ru: "Центр", ky: "Борбор", en: "Centre" }, type: "apts", dlat: 0, dlon: 0 },
  north: { name: { ru: "Северная часть", ky: "Түндүк бөлүгү", en: "North side" }, loc: { ru: "в северной части", ky: "түндүк бөлүгүндө", en: "on the north side" }, type: "private", dlat: 0.013, dlon: 0.004 },
  south: { name: { ru: "Южная часть", ky: "Түштүк бөлүгү", en: "South side" }, loc: { ru: "в южной части", ky: "түштүк бөлүгүндө", en: "on the south side" }, type: "private", dlat: -0.013, dlon: -0.003 },
  east: { name: { ru: "Восточная часть", ky: "Чыгыш бөлүгү", en: "East side" }, loc: { ru: "в восточной части", ky: "чыгыш бөлүгүндө", en: "on the east side" }, type: "micro", dlat: 0.002, dlon: 0.02 },
  west: { name: { ru: "Западная часть", ky: "Батыш бөлүгү", en: "West side" }, loc: { ru: "в западной части", ky: "батыш бөлүгүндө", en: "on the west side" }, type: "private", dlat: -0.002, dlon: -0.02 },
};
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function makeCity(c) {
  const sides = ["center", ...c.sides];
  const districts = sides.map((sd, i) => {
    const S = SIDE[sd];
    return { id: `${c.id}_${sd}`, lat: +(c.center[0] + S.dlat).toFixed(4), lon: +(c.center[1] + S.dlon).toFixed(4),
      coalShare: null, type: S.type, name: S.name,
      loc: sd === "center" ? { ru: `в центре ${c.gen.ru}`, ky: `${c.gen.ky} борборунда`, en: `in central ${c.name.en}` } : S.loc };
  });
  // v98: без выдуманных маршрутов-заглушек («Городской парк → центр», «Вдоль реки …» — линии от центра, не настоящие улицы) и пустых демо-полей
  const routes = [];
  return { id: c.id, center: c.center, zoom: 13, radius: 700, defaultDistrict: districts[1].id, alertDistrict: districts[1].id,
    name: c.name, gen: c.gen, prep: c.prep, house: c.house, k: c.k || {}, emoji: c.emoji,
    districts, routes };
}
const EXTRA_CITIES = [
  { id: "osh", emoji: "🏯", center: [40.5300, 72.8000], seed: 1, river: { ru: "Ак-Буура", ky: "Ак-Буура", en: "Ak-Buura" },
    name: { ru: "Ош", ky: "Ош", en: "Osh" }, gen: { ru: "Оша", ky: "Оштун", en: "Osh" }, prep: { ru: "Оше", ky: "Ошто", en: "Osh" },
    sides: ["north", "south", "east", "west"], house: { area: 110, coal: 4, price: 6500 }, k: { pvYield: 1450 } },
  { id: "jalal", emoji: "♨️", center: [40.9330, 73.0000], seed: 2,
    name: { ru: "Джалал-Абад", ky: "Жалал-Абад", en: "Jalal-Abad" }, gen: { ru: "Джалал-Абада", ky: "Жалал-Абаддын", en: "Jalal-Abad" }, prep: { ru: "Джалал-Абаде", ky: "Жалал-Абадда", en: "Jalal-Abad" },
    sides: ["north", "south", "west"], house: { area: 100, coal: 4, price: 6000 }, k: { pvYield: 1450 } },
  { id: "karakol", emoji: "🌲", center: [42.4900, 78.3900], seed: 3, river: { ru: "Каракол", ky: "Каракол", en: "Karakol" },
    name: { ru: "Каракол", ky: "Каракол", en: "Karakol" }, gen: { ru: "Каракола", ky: "Караколдун", en: "Karakol" }, prep: { ru: "Караколе", ky: "Караколдо", en: "Karakol" },
    sides: ["north", "south", "east"], house: { area: 100, coal: 7, price: 6000 }, k: { hpCOP: 2.3, pvYield: 1450 } },
  { id: "talas", emoji: "🐎", center: [42.5200, 72.2400], seed: 4, river: { ru: "Талас", ky: "Талас", en: "Talas" },
    name: { ru: "Талас", ky: "Талас", en: "Talas" }, gen: { ru: "Таласа", ky: "Таластын", en: "Talas" }, prep: { ru: "Таласе", ky: "Таласта", en: "Talas" },
    sides: ["north", "south", "west"], house: { area: 100, coal: 6, price: 6500 }, k: {} },
  { id: "batken", emoji: "🌸", center: [40.0600, 70.8200], seed: 5,
    name: { ru: "Баткен", ky: "Баткен", en: "Batken" }, gen: { ru: "Баткена", ky: "Баткендин", en: "Batken" }, prep: { ru: "Баткене", ky: "Баткенде", en: "Batken" },
    sides: ["north", "south", "east"], house: { area: 90, coal: 4, price: 7000 }, k: { pvYield: 1500 } },
  { id: "tokmok", emoji: "🌾", center: [42.8400, 75.2900], seed: 6, river: { ru: "Чу", ky: "Чүй", en: "Chuy" },
    name: { ru: "Токмок", ky: "Токмок", en: "Tokmok" }, gen: { ru: "Токмока", ky: "Токмоктун", en: "Tokmok" }, prep: { ru: "Токмоке", ky: "Токмокто", en: "Tokmok" },
    sides: ["north", "south", "east", "west"], house: { area: 100, coal: 5, price: 7000 }, k: {} },
];
EXTRA_CITIES.forEach(c => { CITIES[c.id] = makeCity(c); });
/* v71: без выдуманной доли угля — официальной статистики по районам нет (правило «никаких демо-данных») */
Object.values(CITIES).forEach(c => (c.districts || []).forEach(d => { d.coalShare = null; }));
Object.assign(CITIES.bishkek, { emoji: "🏙️", zoom: 12, radius: 1300 });
Object.assign(CITIES.naryn, { emoji: "🏔️", zoom: 13, radius: 800 });
/* Порядок в переключателе. */
const CITY_ORDER = ["bishkek", "osh", "jalal", "karakol", "naryn", "talas", "batken", "tokmok"];

/* Дополнительные районы/микрорайоны/жилмассивы. Координаты ПРИБЛИЗИТЕЛЬНЫЕ (центр района, ±0,5–1 км).
 * [id, lat, lon, тип, ru, ky, en] (v87: без демо-коэффициента и доли угля) */
const MORE_DISTRICTS = {
  bishkek: [
    ["kokjar", 42.8300, 74.5950, "micro", "Кок-Жар", "Көк-Жар", "Kok-Jar"],
    ["karajygach", 42.8130, 74.6500, "private", "Кара-Жыгач", "Кара-Жыгач", "Kara-Jygach"],
    ["ortosay", 42.8360, 74.6130, "private", "Ортосай", "Ортосай", "Ortosay"],
    ["kyzylasker", 42.8600, 74.5480, "private", "Кызыл-Аскер", "Кызыл-Аскер", "Kyzyl-Asker"],
    ["alaarcha", 42.8200, 74.5600, "private", "Ала-Арча (ж/м)", "Ала-Арча (т/к)", "Ala-Archa (housing area)"],
    ["akbosogo", 42.9280, 74.6280, "private", "Ак-Босого", "Ак-Босого", "Ak-Bosogo"],
    ["uchkun", 42.9180, 74.5850, "private", "Учкун", "Учкун", "Uchkun"],
    ["kelechek", 42.9250, 74.6950, "private", "Келечек", "Келечек", "Kelechek"],
    ["akbata", 42.8980, 74.4600, "private", "Ак-Бата", "Ак-Бата", "Ak-Bata"],
  ],
  naryn: [
    ["n_moskovskaya", 41.4300, 75.9700, "private", "ул. Московская", "Московская көч.", "Moskovskaya St."],
    ["n_bazar", 41.4270, 76.0120, "apts", "Район рынка", "Базар аймагы", "Bazaar area"],
    ["n_unicampus", 41.4220, 75.9300, "micro", "Кампус UCA", "UCA кампусу", "UCA campus"],
  ],
  osh: [
    ["osh_cheremushki", 40.5220, 72.8150, "micro", "Черемушки", "Черемушки", "Cheryomushki"],
    ["osh_amir", 40.5480, 72.7950, "private", "Амир-Темур", "Амир-Темир", "Amir-Temur"],
    ["osh_kyzylkyshtak", 40.5560, 72.7700, "private", "Кызыл-Кыштак", "Кызыл-Кыштак", "Kyzyl-Kyshtak"],
    ["osh_anar", 40.5080, 72.7950, "private", "Анар", "Анар", "Anar"],
    ["osh_japalak", 40.5350, 72.8330, "private", "Жапалак", "Жапалак", "Japalak"],
  ],
  jalal: [
    ["jalal_kurort", 40.9500, 73.0300, "private", "Курорт", "Курорт", "Resort area"],
    ["jalal_sputnik", 40.9200, 73.0150, "micro", "Спутник", "Спутник", "Sputnik"],
    ["jalal_bazar", 40.9330, 72.9900, "apts", "Центральный рынок", "Борбордук базар", "Central bazaar"],
  ],
  karakol: [
    ["karakol_dungan", 42.4950, 78.3950, "private", "Дунганская слобода", "Дуңган конушу", "Dungan quarter"],
    ["karakol_pristan", 42.5300, 78.3200, "private", "Пристань-Пржевальск", "Пристань-Пржевальск", "Pristan-Przhevalsk"],
    ["karakol_bazar", 42.4870, 78.3850, "apts", "Район Ак-Тилек базара", "Ак-Тилек базар аймагы", "Ak-Tilek bazaar area"],
  ],
  talas: [
    ["talas_aral", 42.5300, 72.2100, "private", "Арал", "Арал", "Aral"],
    ["talas_bazar", 42.5180, 72.2450, "apts", "Район рынка", "Базар аймагы", "Bazaar area"],
    ["talas_kopuro", 42.5050, 72.2650, "private", "Копуро-Базар", "Көпүрө-Базар", "Kopuro-Bazar"],
  ],
  batken: [
    ["batken_bazar", 40.0620, 70.8250, "apts", "Район рынка", "Базар аймагы", "Bazaar area"],
    ["batken_kyshtut", 40.0450, 70.8000, "private", "Кыштут", "Кыштут", "Kyshtut"],
    ["batken_airport", 40.0750, 70.8450, "private", "У аэропорта", "Аэропорт жагы", "Airport side"],
  ],
  tokmok: [
    ["tokmok_dungan", 42.8350, 75.3100, "private", "Дунганский квартал", "Дуңган кварталы", "Dungan quarter"],
    ["tokmok_station", 42.8500, 75.2850, "micro", "Район вокзала", "Вокзал аймагы", "Station area"],
  ],
};
Object.entries(MORE_DISTRICTS).forEach(([cid, list]) => {
  const C = CITIES[cid];
  list.forEach(([id, lat, lon, type, ru, ky, en]) => {
    /* v84: доля угля здесь — выдуманная (демо); v71 обнулял её до того, как сюда добавлялись эти районы → не показываем */
    C.districts.push({ id, lat, lon, coalShare: null, type, approx: true, name: { ru, ky, en },
      loc: { ru: `в районе «${ru}»`, ky: `«${ky}» аймагында`, en: `in ${en}` } });
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

/* v56: Турция удалена — только Кыргызстан. */
const KG_ORDER = CITY_ORDER.slice();
KG_ORDER.forEach(id => { CITIES[id].country = "kg"; });
