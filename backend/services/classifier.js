import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const VALID_ANGLES = ["public_health", "economic", "environmental", "welfare", "policy"];

export async function classifyStory(story) {
  const prompt = `You are a senior analyst at OpenPAWS, an organization at the intersection of AI and animal advocacy. Your job is to analyze news stories and classify them for maximum advocacy impact.

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
    "<most important fact from the story>",
    "<second important fact>",
    "<third important fact>"
  ],
  "advocacy_hook": "<the single most powerful sentence an advocate could use right now>",
  "angle_explanation": "<why you picked this angle over others>"
}

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
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.content[0].text.trim();
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
