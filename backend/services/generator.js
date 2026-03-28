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

export async function generateContent(story) {
  // Fallback if AI is not available
  if (!model) {
    console.log("Using fallback content generation (AI not available)");
    return {
      twitter_thread: [
        `🚨 ${story.title} #AnimalAdvocacy #Breaking`,
        `This story highlights important issues that need our attention.`,
        `The implications extend beyond what we see on the surface.`,
        `We must take action to create meaningful change.`,
        `Join us in advocating for better policies. #ActNow`
      ],
      press_statement: {
        headline: story.title,
        dateline: `NEW YORK, ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        lead_paragraph: `OpenPAWS responds to recent developments regarding ${story.title}, calling for immediate attention to the implications for animal welfare.`,
        context_paragraph: "This incident underscores the ongoing need for stronger protections and oversight in animal-related industries.",
        quote_paragraph: "This situation requires immediate action and comprehensive reform,\" said [SPOKESPERSON NAME], Director of OpenPAWS. \"We cannot ignore the systemic issues that lead to such outcomes.",
        call_to_action: "OpenPAWS calls for immediate policy changes and increased accountability.",
        boilerplate: "About OpenPAWS: OpenPAWS is an organization working at the intersection of AI and animal advocacy. We build tools and help organizations across the globe become more efficient, develop better advocates, and organize the movement.",
        contact: "Media Contact: [CONTACT NAME] | press@openpaws.org | +91-XXXXXXXXXX"
      },
      op_ed: {
        headline: `Why ${story.title} demands our immediate attention`,
        angle_summary: "This story reveals systemic issues that require comprehensive reform.",
        opening_line: "When we read headlines like today's, we must ask ourselves: how did we get here, and more importantly, where do we go from here?",
        talking_points: [
          "The immediate impact on animals cannot be ignored",
          "Systemic failures allow these situations to persist",
          "Public awareness is the first step toward change",
          "Policy solutions exist but require political will",
          "Individual action can drive collective impact"
        ],
        suggested_outlets: ["The New York Times", "The Guardian", "Washington Post"],
        pitch_note: "This piece offers timely analysis of an urgent issue with clear policy implications."
      }
    };
  }
  const { title, summary, source, publishedAt, classification } = story;
  const angle = classification?.angle?.replace("_", " ") || "welfare";
  const hook = classification?.advocacy_hook || "";
  const facts = (classification?.key_facts || []).map((f, i) => `${i + 1}. ${f}`).join("\n");
  const urgency = classification?.urgency_score || 5;

  const prompt = `You are the communications director at OpenPAWS, an animal advocacy organization. A story just came in that needs an immediate response. Generate ready-to-publish advocacy content.

STORY BRIEF:
Title: ${title}
Summary: ${summary}
Source: ${source}
Published: ${publishedAt}
Advocacy angle: ${angle}
Urgency: ${urgency}/10
Strongest hook: ${hook}
Key facts:
${facts}

Generate content in this EXACT JSON structure. No markdown. No backticks. Pure JSON only.

{
  "twitter_thread": [
    "<Tweet 1: Opening hook that stops the scroll. Use the strongest fact. Max 270 chars. Include 2 hashtags.>",
    "<Tweet 2: The shocking detail or stat people don't know. Max 270 chars.>",
    "<Tweet 3: Zoom out — why this matters beyond the story. Max 270 chars.>",
    "<Tweet 4: What needs to change. Concrete and specific. Max 270 chars.>",
    "<Tweet 5: Call to action. Tell them exactly what to do right now. Max 270 chars. Include a hashtag.>"
  ],
  "press_statement": {
    "headline": "<Bold, newsy headline that a journalist would use>",
    "dateline": "<City, Date format — e.g. NEW DELHI, March 28, 2026>",
    "lead_paragraph": "<The who, what, when, where, why — everything a journalist needs in 2-3 sentences>",
    "context_paragraph": "<Broader context: how big is this problem, how long has it been happening — 2-3 sentences>",
    "quote_paragraph": "<A compelling quote attributed to [SPOKESPERSON NAME], followed by 1 sentence of supporting evidence>",
    "call_to_action": "<What OpenPAWS is calling for — specific policy or action — 1-2 sentences>",
    "boilerplate": "About OpenPAWS: OpenPAWS is an organization working at the intersection of AI and animal advocacy. We build tools and help organizations across the globe become more efficient, develop better advocates, and organize the movement.",
    "contact": "Media Contact: [CONTACT NAME] | press@openpaws.org | +91-XXXXXXXXXX"
  },
  "op_ed": {
    "headline": "<A punchy, opinionated headline that takes a clear stance>",
    "angle_summary": "<One sentence — the unique argument this op-ed makes that no one else is making>",
    "opening_line": "<First sentence of the op-ed. Should be a gut-punch — provocative, personal, or startling.>",
    "talking_points": [
      "<Point 1: The strongest moral or factual argument>",
      "<Point 2: The systemic cause — why does this keep happening?>",
      "<Point 3: Human or emotional connection — who does this hurt beyond animals?>",
      "<Point 4: What the data says — cite a real-sounding statistic or pattern>",
      "<Point 5: The solution — specific, actionable, and hopeful>"
    ],
    "suggested_outlets": [
      "<Outlet 1>",
      "<Outlet 2>",
      "<Outlet 3>"
    ],
    "pitch_note": "<One sentence on why this outlet would run this piece>"
  }
}

RULES:
- Twitter thread must flow as a connected story, not 5 separate tweets
- Press statement must be publishable with under 30% editing
- Op-ed talking points must each stand alone as a complete argument
- Write like a person, not a press release machine
- Be specific — vague advocacy content helps no one`;

  const response = await model.generateContent(prompt);
  const raw = response.response.text().trim();
  return JSON.parse(raw);
}
