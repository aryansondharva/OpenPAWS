const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetcher = require('../backend/fetcher.js');
const classifier = require('../backend/classifier.js');
const generator = require('../backend/generator.js');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Cache configuration
const cache = new Map();
const CACHE_MINUTES = parseInt(process.env.CACHE_MINUTES || '15');

// Routes
app.get('/api/stories', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const refresh = req.query.refresh === 'true';
    
    const cacheKey = `stories-${days}`;
    const now = Date.now();
    
    // Check cache
    if (!refresh && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_MINUTES * 60 * 1000) {
        return res.json(cached.data);
      }
    }
    
    // Fetch and classify stories
    const stories = await fetcher.fetchStories(days);
    const classified = await classifier.classifyBatch(stories);
    
    // Cache results
    cache.set(cacheKey, {
      data: classified,
      timestamp: now
    });
    
    res.json(classified);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { story } = req.body;
    if (!story) {
      return res.status(400).json({ error: 'Story is required' });
    }
    
    const content = await generator.generateContent(story);
    res.json(content);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    gemini_configured: !!process.env.GEMINI_API_KEY,
    newsapi_configured: !!process.env.NEWS_API_KEY
  });
});

// Vercel serverless function handler
module.exports = (req, res) => {
  app(req, res);
};
