// ─────────────────────────────────────────────
//  OpenPAWS — Vercel Serverless API
//  Single serverless function handling all /api/* routes
// ─────────────────────────────────────────────
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fetchAllStories, getDefaultKeywords } from "../backend/services/fetcher.js";
import { classifyBatch } from "../backend/services/classifier.js";
import { generateContent } from "../backend/services/generator.js";
import { triggerWebhooks } from "../backend/services/notifier.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
//  In-memory storage (Vercel has no persistent filesystem)
// ─────────────────────────────────────────────
const CACHE_MS = (parseInt(process.env.CACHE_MINUTES) || 15) * 60 * 1000;

let cache = {
  stories: [],
  fetchedAt: null,
  daysBack: null,
};

// In-memory stores (ephemeral — reset on cold start)
let historyStore = [];
let webhooksStore = [];
let keywordsStore = null; // null = use defaults

// ─────────────────────────────────────────────
//  GET /api/stories
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

    const keys = {
      gnews: process.env.GNEWS_API_KEY,
      currents: process.env.CURRENTS_API_KEY,
      newsdata: process.env.NEWSDATA_API_KEY,
      newsapi: process.env.NEWSAPI_KEY,
    };

    const raw = await fetchAllStories(daysBack, keys, keywordsStore);
    const classified = await classifyBatch(raw, 20);

    // Trigger webhooks for high-urgency stories
    const activeHooks = webhooksStore.filter((h) => h.active);
    if (activeHooks.length > 0) {
      const highUrgency = classified.filter((s) => (s.classification?.urgency_score || 0) >= 8);
      for (const story of highUrgency) {
        const relevantHooks = activeHooks.filter((h) => {
          const scoreOk = (story.classification?.urgency_score || 0) >= h.urgencyThreshold;
          const angleOk = !h.angles?.length || h.angles.includes(story.classification?.angle);
          return scoreOk && angleOk;
        });
        if (relevantHooks.length > 0) {
          triggerWebhooks(relevantHooks, story).catch(console.warn);
        }
      }
    }

    cache = { stories: classified, fetchedAt: Date.now(), daysBack };

    res.json({
      stories: classified,
      fromCache: false,
      cachedAt: new Date().toISOString(),
      total: classified.length,
    });
  } catch (err) {
    console.error("Error in /api/stories:", err);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
//  GET /api/alerts
// ─────────────────────────────────────────────
app.get("/api/alerts", (req, res) => {
  const threshold = parseInt(req.query.threshold) || 8;
  const hoursBack = parseInt(req.query.hours) || 24;
  const cutoff = Date.now() - hoursBack * 60 * 60 * 1000;

  const alerts = cache.stories.filter((s) => {
    const score = s.classification?.urgency_score || 0;
    const publishedTime = new Date(s.publishedAt).getTime();
    return score >= threshold && publishedTime >= cutoff;
  });

  res.json({ alerts, count: alerts.length, threshold, hoursBack });
});

// ─────────────────────────────────────────────
//  Content History (in-memory on Vercel)
// ─────────────────────────────────────────────
app.get("/api/history", (req, res) => {
  res.json({ history: historyStore });
});

app.delete("/api/history/:id", (req, res) => {
  historyStore = historyStore.filter((h) => h.id !== req.params.id);
  res.json({ success: true, remaining: historyStore.length });
});

app.delete("/api/history", (req, res) => {
  historyStore = [];
  res.json({ success: true });
});

// ─────────────────────────────────────────────
//  Webhook Subscriptions (in-memory on Vercel)
// ─────────────────────────────────────────────
app.get("/api/webhooks", (req, res) => {
  res.json({ webhooks: webhooksStore });
});

app.post("/api/webhooks", (req, res) => {
  const { url, label, urgencyThreshold = 8, angles = [] } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const newHook = {
    id: `wh-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    url,
    label: label || new URL(url).hostname,
    urgencyThreshold,
    angles,
    active: true,
    createdAt: new Date().toISOString(),
  };
  webhooksStore.push(newHook);
  res.json({ webhook: newHook });
});

app.delete("/api/webhooks/:id", (req, res) => {
  webhooksStore = webhooksStore.filter((h) => h.id !== req.params.id);
  res.json({ success: true });
});

app.patch("/api/webhooks/:id", (req, res) => {
  const hook = webhooksStore.find((h) => h.id === req.params.id);
  if (!hook) return res.status(404).json({ error: "Webhook not found" });
  Object.assign(hook, req.body);
  res.json({ webhook: hook });
});

app.post("/api/webhooks/test/:id", async (req, res) => {
  const hook = webhooksStore.find((h) => h.id === req.params.id);
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
//  Configurable Keywords (in-memory on Vercel)
// ─────────────────────────────────────────────
app.get("/api/keywords", (req, res) => {
  const defaults = getDefaultKeywords();
  res.json({ keywords: keywordsStore || defaults, defaults, isCustom: keywordsStore !== null });
});

app.put("/api/keywords", (req, res) => {
  const { keywords } = req.body;
  if (!keywords || !Array.isArray(keywords)) {
    return res.status(400).json({ error: "Keywords must be an array" });
  }
  keywordsStore = keywords;
  res.json({ success: true, count: keywords.length });
});

app.delete("/api/keywords", (req, res) => {
  keywordsStore = null;
  res.json({ success: true, message: "Reset to defaults" });
});

// ─────────────────────────────────────────────
//  POST /api/generate
// ─────────────────────────────────────────────
app.post("/api/generate", async (req, res) => {
  try {
    const { story } = req.body;
    if (!story?.title) {
      return res.status(400).json({ error: "Story with title is required" });
    }
    const content = await generateContent(story);

    // Auto-save to history
    historyStore.unshift({
      id: `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      story: {
        title: story.title,
        source: story.source,
        url: story.url,
        publishedAt: story.publishedAt,
        classification: story.classification,
      },
      content,
      generatedAt: new Date().toISOString(),
    });
    if (historyStore.length > 50) historyStore.length = 50;

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

// ─────────────────────────────────────────────
//  Vercel Serverless Export
// ─────────────────────────────────────────────
export default app;
