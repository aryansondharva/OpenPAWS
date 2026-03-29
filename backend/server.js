import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchAllStories, getDefaultKeywords } from "./services/fetcher.js";
import { classifyBatch } from "./services/classifier.js";
import { generateContent } from "./services/generator.js";
import { triggerWebhooks } from "./services/notifier.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;
const CACHE_MS = (parseInt(process.env.CACHE_MINUTES) || 15) * 60 * 1000;

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
//  In-memory cache
// ─────────────────────────────────────────────
let cache = {
  stories: [],
  fetchedAt: null,
  daysBack: null,
};

// ─────────────────────────────────────────────
//  GET /api/stories
//  Query params: days (default 7), refresh (bypass cache)
// ─────────────────────────────────────────────
app.get("/api/stories", async (req, res) => {
  try {
    const daysBack = parseInt(req.query.days) || 7;
    const refresh = req.query.refresh === "true";
    const now = Date.now();

    const cacheValid =
      cache.fetchedAt &&
      now - cache.fetchedAt < CACHE_MS &&
      cache.daysBack === daysBack &&
      cache.stories.length > 0 &&
      !refresh;

    if (cacheValid) {
      return res.json({
        stories: cache.stories,
        fromCache: true,
        cachedAt: new Date(cache.fetchedAt).toISOString(),
        total: cache.stories.length,
      });
    }

    // Gather API keys from env
    const keys = {
      gnews: process.env.GNEWS_API_KEY,
      currents: process.env.CURRENTS_API_KEY,
      newsdata: process.env.NEWSDATA_API_KEY,
      newsapi: process.env.NEWSAPI_KEY,
    };

    const activeKeys = Object.entries(keys)
      .filter(([, v]) => v && !v.includes("your-"))
      .map(([k]) => k);

    console.log(`Active API keys: ${activeKeys.length > 0 ? activeKeys.join(", ") : "RSS only"}`);

    // Load custom keywords if available
    const customKeywords = loadCustomKeywords();

    const raw = await fetchAllStories(daysBack, keys, customKeywords);
    console.log(`Classifying ${Math.min(raw.length, 20)} of ${raw.length} stories...`);

    const classified = await classifyBatch(raw, 20);

    // Trigger webhooks for high-urgency stories
    const webhooks = loadWebhooks().filter((h) => h.active);
    if (webhooks.length > 0) {
      const highUrgency = classified.filter((s) => (s.classification?.urgency_score || 0) >= 8);
      for (const story of highUrgency) {
        const relevantHooks = webhooks.filter((h) => {
          const scoreOk = (story.classification?.urgency_score || 0) >= h.urgencyThreshold;
          const angleOk = !h.angles?.length || h.angles.includes(story.classification?.angle);
          return scoreOk && angleOk;
        });
        if (relevantHooks.length > 0) {
          triggerWebhooks(relevantHooks, story).catch((e) => console.warn("Webhook error:", e.message));
        }
      }
    }

    cache = { stories: classified, fetchedAt: Date.now(), daysBack };

    res.json({
      stories: classified,
      fromCache: false,
      cachedAt: new Date().toISOString(),
      total: classified.length,
      sources: {
        rss: raw.filter((s) => s.apiSource === "RSS").length,
        gnews: raw.filter((s) => s.apiSource === "GNews").length,
        currents: raw.filter((s) => s.apiSource === "Currents").length,
        newsdata: raw.filter((s) => s.apiSource === "NewsData").length,
        newsapi: raw.filter((s) => s.apiSource === "NewsAPI").length,
      },
    });
  } catch (err) {
    console.error("Error in /api/stories:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GET /api/alerts
//  Returns stories with urgency >= 8 from the last 24 hours
// ─────────────────────────────────────────────
app.get("/api/alerts", (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 8;
    const hoursBack = parseInt(req.query.hours) || 24;
    const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;

    const alerts = cache.stories.filter((s) => {
      const score = s.classification?.urgency_score || 0;
      const publishedTime = new Date(s.publishedAt).getTime();
      return score >= threshold && publishedTime >= cutoff;
    });

    res.json({
      alerts,
      count: alerts.length,
      threshold,
      hoursBack,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error in /api/alerts:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  Content History — saved generations
// ─────────────────────────────────────────────
const HISTORY_FILE = path.join(DATA_DIR, "history.json");

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8"));
  } catch (e) { console.warn("Failed to load history:", e.message); }
  return [];
}

function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

app.get("/api/history", (req, res) => {
  res.json({ history: loadHistory() });
});

app.delete("/api/history/:id", (req, res) => {
  const history = loadHistory().filter((h) => h.id !== req.params.id);
  saveHistory(history);
  res.json({ success: true, remaining: history.length });
});

app.delete("/api/history", (req, res) => {
  saveHistory([]);
  res.json({ success: true });
});

// ─────────────────────────────────────────────
//  Webhook Subscriptions
// ─────────────────────────────────────────────
const WEBHOOKS_FILE = path.join(DATA_DIR, "webhooks.json");

function loadWebhooks() {
  try {
    if (fs.existsSync(WEBHOOKS_FILE)) return JSON.parse(fs.readFileSync(WEBHOOKS_FILE, "utf8"));
  } catch (e) { console.warn("Failed to load webhooks:", e.message); }
  return [];
}

function saveWebhooks(hooks) {
  fs.writeFileSync(WEBHOOKS_FILE, JSON.stringify(hooks, null, 2));
}

app.get("/api/webhooks", (req, res) => {
  res.json({ webhooks: loadWebhooks() });
});

app.post("/api/webhooks", (req, res) => {
  const { url, label, urgencyThreshold = 8, angles = [] } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const hooks = loadWebhooks();
  const newHook = {
    id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url,
    label: label || new URL(url).hostname,
    urgencyThreshold,
    angles,
    active: true,
    createdAt: new Date().toISOString(),
  };
  hooks.push(newHook);
  saveWebhooks(hooks);
  res.json({ webhook: newHook });
});

app.delete("/api/webhooks/:id", (req, res) => {
  const hooks = loadWebhooks().filter((h) => h.id !== req.params.id);
  saveWebhooks(hooks);
  res.json({ success: true });
});

app.patch("/api/webhooks/:id", (req, res) => {
  const hooks = loadWebhooks();
  const hook = hooks.find((h) => h.id === req.params.id);
  if (!hook) return res.status(404).json({ error: "Webhook not found" });
  Object.assign(hook, req.body);
  saveWebhooks(hooks);
  res.json({ webhook: hook });
});

app.post("/api/webhooks/test/:id", async (req, res) => {
  const hooks = loadWebhooks();
  const hook = hooks.find((h) => h.id === req.params.id);
  if (!hook) return res.status(404).json({ error: "Webhook not found" });
  try {
    await triggerWebhooks([hook], {
      title: "🧪 Test Alert from OpenPAWS",
      summary: "This is a test notification to verify your webhook is working.",
      source: "OpenPAWS Test",
      publishedAt: new Date().toISOString(),
      classification: { angle: "welfare", urgency_score: 10, urgency_reason: "Test notification" },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  Configurable Keywords
// ─────────────────────────────────────────────
const KEYWORDS_FILE = path.join(DATA_DIR, "keywords.json");

function loadCustomKeywords() {
  try {
    if (fs.existsSync(KEYWORDS_FILE)) return JSON.parse(fs.readFileSync(KEYWORDS_FILE, "utf8"));
  } catch (e) { console.warn("Failed to load keywords:", e.message); }
  return null; // null = use defaults
}

app.get("/api/keywords", (req, res) => {
  const custom = loadCustomKeywords();
  const defaults = getDefaultKeywords();
  res.json({ keywords: custom || defaults, defaults, isCustom: custom !== null });
});

app.put("/api/keywords", (req, res) => {
  const { keywords } = req.body;
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: "Keywords must be an array" });
  }
  fs.writeFileSync(KEYWORDS_FILE, JSON.stringify(keywords, null, 2));
  res.json({ success: true, count: keywords.length });
});

app.delete("/api/keywords", (req, res) => {
  if (fs.existsSync(KEYWORDS_FILE)) fs.unlinkSync(KEYWORDS_FILE);
  res.json({ success: true, message: "Reset to defaults" });
});

// ─────────────────────────────────────────────
//  POST /api/generate
//  Body: { story }
// ─────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {
  try {
    const { story } = req.body;
    if (!story?.title) {
      return res.status(400).json({ error: "Story with title is required" });
    }
    console.log(`Generating content for: "${story.title}"`);
    const content = await generateContent(story);

    // Auto-save to history
    const history = loadHistory();
    history.unshift({
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      story: { title: story.title, source: story.source, url: story.url, publishedAt: story.publishedAt, classification: story.classification },
      content,
      generatedAt: new Date().toISOString(),
    });
    // Keep last 50 entries
    if (history.length > 50) history.length = 50;
    saveHistory(history);

    res.json({ content });
  } catch (err) {
    console.error("Error in /api/generate:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GET /api/health
// ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const keys = {
    gemini: !!process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your-"),
    gnews: !!process.env.GNEWS_API_KEY && !process.env.GNEWS_API_KEY.includes("your-"),
    currents: !!process.env.CURRENTS_API_KEY && !process.env.CURRENTS_API_KEY.includes("your-"),
    newsdata: !!process.env.NEWSDATA_API_KEY && !process.env.NEWSDATA_API_KEY.includes("your-"),
    newsapi: !!process.env.NEWSAPI_KEY && !process.env.NEWSAPI_KEY.includes("your-"),
  };

  res.json({
    status: "ok",
    keys,
    cache: {
      stories: cache.stories.length,
      fetchedAt: cache.fetchedAt ? new Date(cache.fetchedAt).toISOString() : null,
    },
  });
});

app.listen(PORT, () => {
  console.log(`\n🐾 OpenPAWS backend running → http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
