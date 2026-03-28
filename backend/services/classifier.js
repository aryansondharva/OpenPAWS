import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI, model;
if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("paste-your-new-api-key-here")) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  } catch (err) {
    console.warn("Failed to initialize Gemini AI:", err.message);
  }
}

const VALID_ANGLES = ["public_health", "economic", "environmental", "welfare", "policy"];

export async function classifyStory(story) {
  // Fallback if AI is not available
  if (!model) {
    console.log("Using fallback classification (AI not available)");
    return {
      angle: "welfare",
      urgency_score: 5,
      urgency_reason: "Manual classification - AI not available",
      key_facts: [story.title, story.summary?.substring(0, 100) || ""].filter(Boolean),
      advocacy_hook: "This story requires attention from animal advocates.",
      angle_explanation: "Default classification - AI services unavailable",
    };
  }
  const prompt = `You are a VIRAL CONTENT STRATEGIST at OpenPAWS, an animal advocacy organization. Your job is to analyze news stories and identify content with maximum viral potential for Twitter/X and mainstream media.

STORY TO ANALYZE:
Title: ${story.title}
Summary: ${story.summary}
Source: ${story.source}
Published: ${story.publishedAt}

Your task: Return ONLY a valid JSON object. No markdown. No explanation. No extra text.

{
  "angle": "<exactly one of: public_health | economic | environmental | welfare | policy>",
  "urgency_score": <integer 1-10>,
  "urgency_reason": "<one clear sentence explaining the score>",
  "key_facts": [
    "<most shocking/viral-worthy fact from the story>",
    "<second most shareable statistic or detail>",
    "<third fact that creates emotional impact>"
  ],
  "advocacy_hook": "<THE PERFECT TWEET HOOK - maximum 15 words, creates immediate emotional reaction>",
  "viral_angle": "<why this could go viral on social media>",
  "trending_hashtags": ["<hashtag1>", "<hashtag2>", "<hashtag3>"],
  "angle_explanation": "<why you picked this angle for maximum impact>"
}

VIRAL CONTENT PRINCIPLES:
- Focus on SHOCK VALUE, EMOTIONAL TRIGGERS, and SHAREABILITY
- Look for numbers, statistics, and concrete details that create outrage
- Identify human/animal faces and personal stories
- Find connections to trending topics or current events
- Prioritize content that creates immediate "WTF" reactions

ANGLE GUIDE:
- public_health  → disease outbreaks, food safety, antibiotic resistance, zoonotic threats, H5N1
- economic       → industry losses, subsidies, market impact, company earnings, price changes
- environmental  → methane emissions, deforestation, water pollution, climate impact, CAFO runoff
- welfare        → animal suffering, cruelty, investigations, slaughter conditions, confinement
- policy         → legislation, regulations, court cases, government action, EPA rules, farm bill

URGENCY SCORING:
10 → Active outbreak or investigation dropped TODAY, 24h window
8-9 → Breaking story from past 48 hours, massive advocacy value
6-7 → Important story from past week, strong but not emergency
4-5 → Ongoing issue, useful for campaigns
1-3 → Background, low urgency`;

  try {
    const response = await model.generateContent(prompt);
    const raw = response.response.text().trim();
    const parsed = JSON.parse(raw);

    return {
      angle: VALID_ANGLES.includes(parsed.angle) ? parsed.angle : "welfare",
      urgency_score: Math.min(10, Math.max(1, parseInt(parsed.urgency_score) || 5)),
      urgency_reason: parsed.urgency_reason || "",
      key_facts: Array.isArray(parsed.key_facts) ? parsed.key_facts.slice(0, 3) : [],
      advocacy_hook: parsed.advocacy_hook || "",
      angle_explanation: parsed.angle_explanation || "",
    };
  } catch (err) {
    console.error(`Classification error for "${story.title}": ${err.message}`);
    return {
      angle: "welfare",
      urgency_score: 5,
      urgency_reason: "Classification failed — manual review needed",
      key_facts: [],
      advocacy_hook: "",
      angle_explanation: "Default fallback",
    };
  }
}

// Classify a batch with rate limit protection
export async function classifyBatch(stories, limit = 20) {
  const batch = stories.slice(0, limit);
  const results = [];

  for (const story of batch) {
    const classification = await classifyStory(story);
    results.push({ ...story, classification });
    await sleep(350); // avoid rate limits
  }

  return results.sort(
    (a, b) => (b.classification?.urgency_score || 0) - (a.classification?.urgency_score || 0)
  );
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
