import axios from "axios";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "data");
const ALERTS_TRACKING_FILE = path.join(DATA_DIR, "alerts_tracking.json");

function loadTrackedAlerts() {
  try {
    if (fs.existsSync(ALERTS_TRACKING_FILE)) {
      return JSON.parse(fs.readFileSync(ALERTS_TRACKING_FILE, "utf8"));
    }
  } catch (e) {
    console.warn("Failed to load alerts tracking:", e.message);
  }
  return [];
}

function saveTrackedAlerts(tracking) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    // Keep only last 500 alerts to prevent file bloat
    if (tracking.length > 500) tracking = tracking.slice(-500);
    fs.writeFileSync(ALERTS_TRACKING_FILE, JSON.stringify(tracking, null, 2));
  } catch (e) {
    console.warn("Failed to save alerts tracking:", e.message);
  }
}

/**
 * Sends a global Slack and Email alert for stories scoring 8+.
 * Prevents duplicates by tracking URLs/titles.
 */
export async function sendGlobalAlerts(story) {
  const score = story.classification?.urgency_score || 0;
  if (score < 8) return;

  const urlField = story.url || "";
  const title = story.title || "No Title";
  const uniqueId = urlField.trim() || title.trim();
  if (!uniqueId) return;

  const tracked = loadTrackedAlerts();
  if (tracked.includes(uniqueId)) {
    console.log(`🟡 [Alerts] Skipped duplicate alert for: "${title}"`);
    return; // Already alerted for this story
  }

  tracked.push(uniqueId);
  saveTrackedAlerts(tracked);

  const angle = story.classification?.angle?.replace(/_/g, " ") || "General";
  const source = story.source || "Unknown";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  // The generate link can be a direct link to a query or just a generic link to the dashboard
  const generateLink = `${frontendUrl}/?generate=${encodeURIComponent(title)}`;

  const emoji = score >= 9 ? "🚨" : "🟠";
  const messageText = `${emoji} Urgency ${score}/10 — "${title}"\nAngle: ${angle} | Source: ${source}\n<${generateLink}|[Generate content →]>`;

  // 1. Send via Slack Webhook
  if (process.env.SLACK_WEBHOOK_URL) {
    console.log(`📤 [Slack] Queuing alert for: "${title}"`);
    try {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: messageText,
        // Using blocks for better formatting if desired, but sticking to exactly what user requested:
      });
      console.log(`✅ Global Slack Alert sent for: ${title}`);
    } catch (err) {
      console.error(`❌ Global Slack Alert failed:`, err.response?.data || err.message);
    }
  }

  // 2. Send via Email using Nodemailer
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log(`📤 [Email] Queuing alert to ${process.env.EMAIL_TO || process.env.EMAIL_USER} for: "${title}"`);
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        subject: `[OpenPAWS Alert] Urgency ${score}/10 — ${title}`,
        text: `${emoji} Urgency ${score}/10 — "${title}"\nAngle: ${angle} | Source: ${source}\n[Generate content →] ${generateLink}`,
        html: `
          <p><strong>${emoji} Urgency ${score}/10</strong> &mdash; "${title}"</p>
          <p><strong>Angle:</strong> ${angle} | <strong>Source:</strong> ${source}</p>
          <p><a href="${generateLink}">[Generate content &rarr;]</a></p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Global Email Alert sent for: ${title}`);
    } catch (err) {
      console.error(`❌ Global Email Alert failed:`, err.message);
    }
  }
}
