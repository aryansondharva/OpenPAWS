import dotenv from "dotenv";
import { sendGlobalAlerts } from "./services/alerter.js";

dotenv.config();

console.log("🧪 Simulating a high-urgency story to test Slack & Email alerts...");

const testStory = {
  title: "TEST ALERT: Huge Discovery Made in Renewable Energy " + Date.now(),
  url: "https://example.com/test-story-" + Date.now(),
  source: "Science Daily",
  classification: {
    urgency_score: 10,
    angle: "Technology & Environment",
  }
};

async function runTest() {
  console.log("Environment check:");
  console.log(`- SLACK_WEBHOOK_URL: ${process.env.SLACK_WEBHOOK_URL ? "Configured ✅" : "Missing ❌"}`);
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER ? "Configured ✅" : "Missing ❌"}`);
  console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? "Configured ✅" : "Missing ❌"}`);
  console.log("--------------------------------------------------");
  
  await sendGlobalAlerts(testStory);
  console.log("✅ Test complete.");
}

runTest();
