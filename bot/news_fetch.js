/* Лента новостей «Таза Аба»: раз в час забирает публичные RSS-ленты СМИ на сервере GitHub Actions и кладёт
 * короткую выжимку (заголовок, ссылка на оригинал, дата, ≤300 симв. анонса для поиска по городу) в news/<набор>.json.
 * Приложение читает эти файлы со своего же адреса (GitHub Pages) или с raw.githubusercontent.com — без сторонних прокси и ключей.
 * Текст статей не копируется: в приложении показываются только заголовок, источник и ссылка на сайт издания.
 * Запуск: node bot/news_fetch.js   (Node ≥ 18, без зависимостей). Если лента не ответила — её прошлые записи сохраняются (ok:false). */
"use strict";
const fs = require("fs"), path = require("path");
const DIR = path.join(__dirname, "..", "news");
// по языку интерфейса: берём ту языковую версию ленты, которую издание реально публикует
const SETS = {
  "kg-ru": [["Kabar", "https://ru.kabar.kg/rss/"], ["24.kg", "https://24.kg/rss/"], ["Kloop", "https://kloop.kg/feed/"]],
  "kg-ky": [["Kabar", "https://kabar.kg/rss/"], ["24.kg", "https://24.kg/kyrgyzcha/rss/"]],
  "kg-en": [["Kabar", "https://en.kabar.kg/rss/"], ["24.kg", "https://24.kg/english/rss/"]],
};
const MAX = 30;
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", laquo: "«", raquo: "»", mdash: "—", ndash: "–", hellip: "…" };
const dec = s => s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => e[0] === "#" ? String.fromCodePoint(e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : +e.slice(1)) : (ENT[e.toLowerCase()] ?? m));
const cdata = s => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
// только текст: теги вырезаются, сущности раскодируются (в приложении текст ещё раз проходит DOMParser → textContent)
const text = s => dec(cdata(s || "").replace(/<[^>]*>/g, " ")).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const tag = (s, n) => { const m = s.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, "i")); return m ? m[1] : ""; };
const safeUrl = u => { try { const x = new URL(text(u)); return /^https?:$/.test(x.protocol) ? x.href : ""; } catch (e) { return ""; } };
async function feed(url) {
  const r = await fetch(url, { headers: { "User-Agent": "TazaAbaNewsBot/1.0 (+https://lalalalallalalalalalala.github.io/taza-aba/)", Accept: "application/rss+xml, application/xml, text/xml" }, signal: AbortSignal.timeout(30000) });
  if (!r.ok) throw new Error("HTTP " + r.status);
  const xml = await r.text();
  return (xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || []).slice(0, MAX).map(it => {
    const d = Date.parse(text(tag(it, "pubDate")) || text(tag(it, "dc:date")));
    return { title: text(tag(it, "title")).slice(0, 300), link: safeUrl(tag(it, "link") || tag(it, "guid")), date: isNaN(d) ? null : new Date(d).toISOString(), text: text(tag(it, "description")).slice(0, 300) };
  }).filter(x => x.title);
}
(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const index = { title: "Taza Aba — news headlines from public RSS feeds", note: "Headline, link to the original article, date and a short teaser only. Copyright belongs to the publishers.", updated: new Date().toISOString(), sets: {} };
  let okAny = 0, changed = 0;
  for (const [set, feeds] of Object.entries(SETS)) {
    const file = path.join(DIR, set + ".json");
    const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { feeds: [] };
    const out = { set, updated: new Date().toISOString(), feeds: [] };
    for (const [name, url] of feeds) {
      try { const items = await feed(url); if (!items.length) throw new Error("empty"); out.feeds.push({ name, url, ok: true, fetched: out.updated, items }); okAny++; }
      catch (e) { console.warn(set, name, e.message); const p = prev.feeds.find(f => f.url === url); out.feeds.push({ name, url, ok: false, fetched: p ? p.fetched : null, items: p ? p.items : [] }); }
    }
    // без новых заголовков файл не переписываем (нет пустых коммитов каждый час)
    const sig = o => JSON.stringify(o.feeds.map(f => [f.url, f.ok, f.items]));
    if (sig(out) !== sig(prev)) { fs.writeFileSync(file, JSON.stringify(out)); changed++; }
    index.sets[set] = out.feeds.map(f => ({ name: f.name, url: f.url, ok: f.ok, items: f.items.length }));
  }
  if (changed || !fs.existsSync(path.join(DIR, "index.json"))) fs.writeFileSync(path.join(DIR, "index.json"), JSON.stringify(index, null, 1));
  console.log("feeds ok:", okAny, "sets changed:", changed);
  if (!okAny) process.exit(1);
})();
