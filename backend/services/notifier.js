import axios from "axios";

/**
 * Trigger webhook notifications for a story
 * Supports: Slack incoming webhooks, Discord webhooks, generic POST endpoints
 */
export async function triggerWebhooks(webhooks, story) {
  const results = [];

  for (const hook of webhooks) {
    try {
      const payload = formatPayload(hook.url, story);
      await axios.post(hook.url, payload, {
        timeout: 10000,
        headers: { "Content-Type": "application/json" },
      });
      results.push({ id: hook.id, success: true });
      console.log(`✅ Webhook delivered → ${hook.label}`);
    } catch (err) {
      results.push({ id: hook.id, success: false, error: err.message });
      console.warn(`❌ Webhook failed [${hook.label}]: ${err.message}`);
    }
  }

  return results;
}

/**
 * Format payload based on webhook type (auto-detected from URL)
 */
function formatPayload(url, story) {
  const score = story.classification?.urgency_score || 0;
  const angle = story.classification?.angle?.replace("_", " ") || "general";
  const reason = story.classification?.urgency_reason || "";
  const urgencyEmoji = score >= 9 ? "🔴" : score >= 8 ? "🟠" : score >= 6 ? "🟡" : "⚪";

  // Slack webhook format
  if (url.includes("hooks.slack.com")) {
    return {
      text: `${urgencyEmoji} *OpenPAWS Alert — Urgency ${score}/10*`,
      blocks: [
        {
          type: "header",
          text: { type: "plain_text", text: `${urgencyEmoji} OpenPAWS Alert`, emoji: true },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${story.title}*\n\n_${story.summary?.slice(0, 200) || ""}..._`,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Urgency:* ${score}/10` },
            { type: "mrkdwn", text: `*Angle:* ${angle}` },
            { type: "mrkdwn", text: `*Source:* ${story.source || "Unknown"}` },
            { type: "mrkdwn", text: `*Published:* ${story.publishedAt?.slice(0, 10) || "Today"}` },
          ],
        },
        {
          type: "context",
          elements: [
            { type: "mrkdwn", text: `📋 ${reason}` },
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "📰 Read Full Story", emoji: true },
              url: story.url || "#",
              action_id: "read_story",
            },
          ],
        },
      ],
    };
  }

  // Discord webhook format
  if (url.includes("discord.com/api/webhooks")) {
    return {
      content: `${urgencyEmoji} **OpenPAWS Alert — Urgency ${score}/10**`,
      embeds: [
        {
          title: story.title,
          url: story.url || undefined,
          description: story.summary?.slice(0, 300) || "",
          color: score >= 9 ? 0xff0000 : score >= 8 ? 0xff8800 : 0xffcc00,
          fields: [
            { name: "Urgency", value: `${score}/10`, inline: true },
            { name: "Angle", value: angle, inline: true },
            { name: "Source", value: story.source || "Unknown", inline: true },
          ],
          footer: { text: `OpenPAWS News Engine • ${reason}` },
          timestamp: story.publishedAt || new Date().toISOString(),
        },
      ],
    };
  }

  // Generic webhook (JSON POST)
  return {
    event: "openpaws.alert",
    timestamp: new Date().toISOString(),
    story: {
      title: story.title,
      summary: story.summary,
      url: story.url,
      source: story.source,
      publishedAt: story.publishedAt,
    },
    classification: {
      angle,
      urgency_score: score,
      urgency_reason: reason,
      key_facts: story.classification?.key_facts || [],
      advocacy_hook: story.classification?.advocacy_hook || "",
    },
  };
}
