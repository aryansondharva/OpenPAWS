import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fetchAllStories } from "./services/fetcher.js";
import { classifyBatch } from "./services/classifier.js";
import { generateContent } from "./services/generator.js";

dotenv.config();

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

    const raw = await fetchAllStories(daysBack, keys);
    console.log(`Classifying ${Math.min(raw.length, 20)} of ${raw.length} stories...`);

    const classified = await classifyBatch(raw, 20);

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
    anthropic: !!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.includes("your-"),
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
