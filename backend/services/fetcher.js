import Parser from "rss-parser";
import axios from "axios";

const rss = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "OpenPAWS-NewsEngine/1.0" },
});

// ─────────────────────────────────────────────
//  RSS FEEDS — no key needed, unlimited
// ─────────────────────────────────────────────
const RSS_FEEDS = [
  // Public health / bird flu
  { name: "CDC Updates",        url: "https://www.cdc.gov/media/rss/update.rss" },
  { name: "Food Safety News",   url: "https://www.foodsafetynews.com/feed/" },
  { name: "Farm Progress",      url: "https://www.farmprogress.com/rss/all" },

  // Welfare & investigations
  { name: "Humane Society",     url: "https://www.humanesociety.org/rss.xml" },
  { name: "Mercy For Animals",  url: "https://mercyforanimals.org/blog/feed" },
  { name: "Animal Equality",    url: "https://animalequality.org/news/feed/" },
  { name: "PETA News",          url: "https://www.peta.org/feed/" },

  // Policy & environment
  { name: "The Guardian",       url: "https://www.theguardian.com/environment/livestock-farming/rss" },
  { name: "Civil Eats",         url: "https://civileats.com/feed/" },
  { name: "Inside Climate News",url: "https://insideclimatenews.org/feed/" },
  { name: "Mongabay",           url: "https://news.mongabay.com/feed/" },

  // Economic / industry
  { name: "AgWeb",              url: "https://www.agweb.com/rss/news" },
  { name: "Reuters Environment",url: "https://feeds.reuters.com/reuters/environment" },
];

// ─────────────────────────────────────────────
//  KEYWORD FILTER — animal agriculture focus
// ─────────────────────────────────────────────
const KEYWORDS = [
  // Bird flu / disease
  "bird flu","avian flu","avian influenza","h5n1","h5n2","hpai",
  "zoonotic","zoonosis","livestock disease","poultry disease",

  // Factory farming / investigations
  "factory farm","factory farming","undercover investigation",
  "undercover footage","animal cruelty","slaughterhouse",
  "concentrated animal","cafo","feedlot",

  // Species / industry
  "livestock","poultry","cattle","pig farm","chicken farm",
  "dairy farm","egg industry","meat industry","veal","gestation crate",
  "farmed animals","animal agriculture","animal farming",

  // Environment
  "livestock methane","cattle deforestation","animal agriculture climate",
  "meat emissions","livestock emissions","manure lagoon","runoff",

  // Welfare / legal
  "animal welfare","animal rights","cage free","free range",
  "humane slaughter","ag-gag","farm sanctuary",

  // Health / food safety
  "salmonella","antibiotic resistance","food recall","meat recall",
  "food safety","antibiotic livestock",

  // Economic / companies
  "tyson foods","jbs","perdue","smithfield","cargill","pilgrim",
  "meat packer","poultry company",

  // Policy
  "farm bill","epa livestock","cafo regulation","animal protection law",
];

// Active keyword list (can be overridden by custom keywords)
let activeKeywords = KEYWORDS;

function isRelevant(text) {
  const t = text.toLowerCase();
  return activeKeywords.some((kw) => t.includes(kw));
}

// Export the default keywords so the frontend can display them
export function getDefaultKeywords() {
  return [...KEYWORDS];
}

function cutoffDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return d;
}

function makeId(str) {
  return Buffer.from(str || "").toString("base64").slice(0, 20);
}

// ─────────────────────────────────────────────
//  RSS FETCHER
// ─────────────────────────────────────────────
async function fetchRSS(daysBack) {
  const cutoff = cutoffDate(daysBack);
  const results = [];

  await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      try {
        const parsed = await rss.parseURL(feed.url);
        for (const item of parsed.items || []) {
          const pub = item.pubDate ? new Date(item.pubDate) : new Date();
          if (pub < cutoff) continue;
          const text = `${item.title} ${item.contentSnippet || ""} ${item.content || ""}`;
          if (!isRelevant(text)) continue;
          results.push({
            id: `rss-${makeId(item.link || item.title)}`,
            source: feed.name,
            title: (item.title || "").trim(),
            summary: (item.contentSnippet || item.content || "").slice(0, 400),
            url: item.link || "",
            publishedAt: pub.toISOString(),
            apiSource: "RSS",
          });
        }
      } catch (e) {
        console.warn(`RSS failed [${feed.name}]: ${e.message}`);
      }
    })
  );

  return results;
}

// ─────────────────────────────────────────────
//  GNEWS API  — 100 req/day free
//  Best for: breaking news, H5N1, outbreaks
//  https://gnews.io
// ─────────────────────────────────────────────
async function fetchGNews(daysBack, apiKey) {
  if (!apiKey) return [];
  const from = cutoffDate(daysBack).toISOString();
  const queries = [
    "bird flu livestock",
    "factory farm animal welfare",
    "CAFO animal agriculture",
  ];
  const results = [];

  for (const q of queries) {
    try {
      const { data } = await axios.get("https://gnews.io/api/v4/search", {
        params: { q, from, lang: "en", max: 10, token: apiKey },
        timeout: 8000,
      });
      for (const a of data.articles || []) {
        if (!isRelevant(`${a.title} ${a.description}`)) continue;
        results.push({
          id: `gnews-${makeId(a.url)}`,
          source: a.source?.name || "GNews",
          title: a.title,
          summary: a.description || "",
          url: a.url,
          publishedAt: a.publishedAt || new Date().toISOString(),
          apiSource: "GNews",
        });
      }
    } catch (e) {
      console.warn(`GNews failed [${q}]: ${e.message}`);
    }
    await sleep(300);
  }
  return results;
}

// ─────────────────────────────────────────────
//  CURRENTS API  — 600 req/day free (best free limit!)
//  Best for: environment, climate, policy
//  https://currentsapi.services
// ─────────────────────────────────────────────
async function fetchCurrents(daysBack, apiKey) {
  if (!apiKey) return [];
  const startDate = cutoffDate(daysBack).toISOString().split("T")[0];
  const queries = [
    "livestock methane climate",
    "animal agriculture environment",
    "farm animal policy regulation",
  ];
  const results = [];

  for (const kw of queries) {
    try {
      const { data } = await axios.get("https://api.currentsapi.services/v1/search", {
        params: { keywords: kw, start_date: startDate, language: "en", apiKey },
        timeout: 8000,
      });
      for (const a of data.news || []) {
        if (!isRelevant(`${a.title} ${a.description}`)) continue;
        results.push({
          id: `currents-${makeId(a.url)}`,
          source: a.author || "Currents",
          title: a.title,
          summary: a.description || "",
          url: a.url,
          publishedAt: a.published || new Date().toISOString(),
          apiSource: "Currents",
        });
      }
    } catch (e) {
      console.warn(`Currents failed [${kw}]: ${e.message}`);
    }
    await sleep(300);
  }
  return results;
}

// ─────────────────────────────────────────────
//  NEWSDATA.IO  — 200 req/day free
//  Best for: welfare, investigations, undercover
//  https://newsdata.io
// ─────────────────────────────────────────────
async function fetchNewsData(daysBack, apiKey) {
  if (!apiKey) return [];
  const queries = [
    "factory farm undercover investigation",
    "animal cruelty slaughterhouse",
    "avian influenza poultry",
  ];
  const results = [];

  for (const q of queries) {
    try {
      const { data } = await axios.get("https://newsdata.io/api/1/news", {
        params: { q, language: "en", apikey: apiKey },
        timeout: 8000,
      });
      for (const a of data.results || []) {
        if (!isRelevant(`${a.title} ${a.description}`)) continue;
        results.push({
          id: `newsdata-${makeId(a.link)}`,
          source: a.source_id || "NewsData",
          title: a.title,
          summary: a.description || "",
          url: a.link,
          publishedAt: a.pubDate || new Date().toISOString(),
          apiSource: "NewsData",
        });
      }
    } catch (e) {
      console.warn(`NewsData failed [${q}]: ${e.message}`);
    }
    await sleep(300);
  }
  return results;
}

// ─────────────────────────────────────────────
//  NEWSAPI  — 100 req/day free
//  Best for: economic/company stories (Tyson, JBS)
//  https://newsapi.org
// ─────────────────────────────────────────────
async function fetchNewsAPI(daysBack, apiKey) {
  if (!apiKey) return [];
  const from = cutoffDate(daysBack).toISOString().split("T")[0];
  const queries = [
    "Tyson Foods JBS Smithfield poultry losses avian flu",
    "livestock antibiotic resistance food safety recall",
  ];
  const results = [];

  for (const q of queries) {
    try {
      const { data } = await axios.get("https://newsapi.org/v2/everything", {
        params: { q, from, language: "en", sortBy: "publishedAt", pageSize: 20, apiKey },
        timeout: 8000,
      });
      for (const a of data.articles || []) {
        if (!a.title || !a.description) continue;
        if (!isRelevant(`${a.title} ${a.description}`)) continue;
        results.push({
          id: `newsapi-${makeId(a.url)}`,
          source: a.source?.name || "NewsAPI",
          title: a.title,
          summary: a.description,
          url: a.url,
          publishedAt: a.publishedAt || new Date().toISOString(),
          apiSource: "NewsAPI",
        });
      }
    } catch (e) {
      console.warn(`NewsAPI failed [${q}]: ${e.message}`);
    }
    await sleep(300);
  }
  return results;
}

// ─────────────────────────────────────────────
//  MAIN EXPORT — combine + deduplicate
// ─────────────────────────────────────────────
export async function fetchAllStories(daysBack = 7, keys = {}, customKeywords = null) {
  // Set active keywords for this fetch cycle
  activeKeywords = customKeywords && customKeywords.length > 0 ? customKeywords : KEYWORDS;
  console.log(`Using ${customKeywords ? 'custom' : 'default'} keywords (${activeKeywords.length} terms)`);
  console.log("Fetching from all sources...");

  const [rssStories, gnews, currents, newsdata, newsapi] = await Promise.all([
    fetchRSS(daysBack),
    fetchGNews(daysBack, keys.gnews),
    fetchCurrents(daysBack, keys.currents),
    fetchNewsData(daysBack, keys.newsdata),
    fetchNewsAPI(daysBack, keys.newsapi),
  ]);

  const all = [...rssStories, ...gnews, ...currents, ...newsdata, ...newsapi];

  // Deduplicate by title similarity
  const seen = new Set();
  const unique = all.filter((s) => {
    const key = s.title.toLowerCase().slice(0, 55).replace(/[^a-z0-9]/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort newest first
  unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  console.log(`Total unique stories: ${unique.length} (RSS: ${rssStories.length}, GNews: ${gnews.length}, Currents: ${currents.length}, NewsData: ${newsdata.length}, NewsAPI: ${newsapi.length})`);
  return unique;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
