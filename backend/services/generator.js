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
        `🚨 ${story.title?.substring(0, 60) || "Breaking story"} This is happening RIGHT NOW! ${story.summary?.substring(0, 50) || ""} #Breaking #AnimalRights #Viral`,
        `💔 THE SHOCKING TRUTH: What they don't want you to know about this story. The numbers don't lie - this is a crisis. #Scandal #Truth`,
        `🔥 This isn't just one incident. It's a SYSTEMIC FAILURE that's been happening for years. Thread below 👇 #Systemic #Corruption`,
        `😡 Meet the victims behind the headlines. These aren't just statistics - they're living beings who deserve better. #Justice #Animals`,
        `📢 TAKE ACTION NOW: Share this story, call your representatives, and demand change. Together we can stop this! #ActNow #Change`
      ],
      press_statement: {
        headline: `🚨 EMERGENCY: ${story.title?.substring(0, 50) || "Breaking News"} - What You Need to Know NOW`,
        dateline: `NEW YORK, ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
        lead_paragraph: `OpenPAWS is sounding the alarm over ${story.title}, calling it "a horrifying crisis that demands immediate government intervention." The organization is calling this the most disturbing development of 2026.`,
        context_paragraph: "This shocking revelation exposes a pattern of systemic failure and regulatory capture that has allowed this crisis to escalate unchecked for years.",
        quote_paragraph: "This is an absolute emergency that requires immediate shutdown and investigation,\" said [SPOKESPERSON NAME], Director of OpenPAWS. \"Every hour we wait means more suffering and potential harm to the public.\"",
        call_to_action: "OpenPAWS demands immediate emergency action, full transparency, and criminal investigation into those responsible.",
        boilerplate: "About OpenPAWS: OpenPAWS is an organization working at the intersection of AI and animal advocacy. We build tools and help organizations across the globe become more efficient, develop better advocates, and organize the movement.",
        contact: "Media Contact: [CONTACT NAME] | press@openpaws.org | +91-XXXXXXXXXX"
      },
      op_ed: {
        headline: `Why ${story.title?.substring(0, 40) || "This Story"} Should Terrify Every Single Person`,
        angle_summary: "This isn't just about animals - it's about a broken system that's failing everyone and putting profits over lives.",
        opening_line: "What if I told you that the story you're reading is just the tip of an iceberg that could affect your family's safety tomorrow?",
        talking_points: [
          "The moral outrage: How we've normalized the unacceptable and what it says about our society",
          "Follow the money: Who's profiting from this crisis and how they're covering it up",
          "The human cost: This isn't just an animal issue - it's a public health emergency",
          "The solution: These 3 specific policy changes would prevent this from ever happening again",
          "The vision: What a world where this never happens again would actually look like"
        ],
        suggested_outlets: ["The New York Times", "The Guardian", "Washington Post", "CNN", "MSNBC"],
        pitch_note: "This piece will generate massive engagement and shares because it connects animal welfare to human safety and exposes systemic corruption."
      }
    };
  }
  const { title, summary, source, publishedAt, classification } = story;
  const angle = classification?.angle?.replace("_", " ") || "welfare";
  const hook = classification?.advocacy_hook || "";
  const facts = (classification?.key_facts || []).map((f, i) => `${i + 1}. ${f}`).join("\n");
  const urgency = classification?.urgency_score || 5;

  const prompt = `You are a VIRAL SOCIAL MEDIA EXPERT at OpenPAWS, an animal advocacy organization. Your job is to create content that WILL GO VIRAL on Twitter/X and get mainstream media attention.

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
    "<TWEET 1: VIRAL HOOK - Start with 🚨🔥💔 or similar emoji. Use shocking statistic or emotional punch. Max 280 chars. 2-3 hashtags>",
    "<TWEET 2: THE "WTF" FACT - Most disturbing detail that creates outrage. Use numbers/specifics. Max 280 chars>",
    "<TWEET 3: SYSTEMIC FAILURE - Connect to bigger pattern. Show this isn't isolated. Max 280 chars>",
    "<TWEET 4: HUMAN/ANIMAL FACE - Personal story or specific victim. Create empathy. Max 280 chars>",
    "<TWEET 5: CALL TO ARMS - EXACT action they can take NOW. Make it urgent. Hashtag. Max 280 chars>"
  ],
  "press_statement": {
    "headline": "<CLICKBAIT-STYLE HEADLINE - Use numbers, controversy, or emotional trigger. What would make someone click immediately?>",
    "dateline": "<City, Date format — e.g. NEW DELHI, March 28, 2026>",
    "lead_paragraph": "<The most shocking fact first. Hook journalists immediately. What makes this story unmissable?>",
    "context_paragraph": "<Connect to bigger scandal or pattern. Show this is part of systemic problem>",
    "quote_paragraph": "<EMOTIONAL QUOTE - Use strong words like 'horrifying,' 'unacceptable,' 'emergency.' Make it quotable>",
    "call_to_action": "<URGENT DEMAND - Specific, immediate action. Use words like 'immediately,' 'emergency,' 'shutdown'>",
    "boilerplate": "About OpenPAWS: OpenPAWS is an organization working at the intersection of AI and animal advocacy. We build tools and help organizations across the globe become more efficient, develop better advocates, and organize the movement.",
    "contact": "Media Contact: [CONTACT NAME] | press@openpaws.org | +91-XXXXXXXXXX"
  },
  "op_ed": {
    "headline": "<CONTROVERSIAL OPINION HEADLINE - Take a strong stance. Use 'Why,' 'How,' or question format>",
    "angle_summary": "<THE UNIQUE TAKE - What perspective no one else is providing? Make it provocative>",
    "opening_line": "<GUT-PUNCH FIRST SENTENCE - Startling statistic, personal story, or shocking revelation>",
    "talking_points": [
      "<POINT 1: THE MORAL OUTRAGE - What should make everyone angry>",
      "<POINT 2: THE MONEY TRAIL - Follow the profits and expose the greed>",
      "<POINT 3: THE HUMAN COST - How this hurts people, not just animals>",
      "<POINT 4: THE SOLUTION - Specific, actionable policy changes>",
      "<POINT 5: THE VISION - What victory looks like>"
    ],
    "suggested_outlets": [
      "<High-impact outlet 1 - NYT, Guardian, WaPo, etc>",
      "<High-impact outlet 2>",
      "<High-impact outlet 3>"
    ],
    "pitch_note": "<Why this piece will get massive engagement and shares>"
  }
}

RULES:
- Twitter thread MUST create emotional rollercoaster: SHOCK → OUTRAGE → CONNECTION → EMPATHY → ACTION
- Use emojis strategically: 🚨🔥💔😡📢
- Include specific numbers, statistics, and concrete details
- Create "WTF" moments that make people stop scrolling
- Press statement headlines must be click-worthy but accurate
- Op-eds must take controversial stances that generate debate
- Every piece should have at least one shareable "quote moment"
- Use strong emotional language: horrifying, unacceptable, emergency, scandal, crisis`;

  const response = await model.generateContent(prompt);
  const raw = response.response.text().trim();
  return JSON.parse(raw);
}
