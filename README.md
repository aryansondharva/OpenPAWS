# News Opportunism Engine

Animal advocacy organizations run lean. When a major story breaks — an H5N1 outbreak spreading to dairy cattle, undercover footage from a factory farm, a new EPA ruling on CAFO runoff — the window to respond is 24 to 48 hours. After that, the news cycle moves on and the moment is gone.

Most organizations miss it. Not because they don't care, but because drafting a tweet thread, a press statement, and an op-ed pitch takes hours they don't have.

This tool is built for that exact problem.

---

## What it does

Monitors six news sources simultaneously — GNews, Currents API, NewsData.io, NewsAPI, and 13 curated RSS feeds — filtering for animal agriculture stories in real time. Each story gets classified by advocacy angle and scored for urgency by Claude. When you find a story worth responding to, one click generates a full set of ready-to-publish content: a tweet thread, a press statement skeleton, and op-ed talking points with outlet suggestions.

The whole thing, from story appearing in the feed to content on your clipboard, takes under two minutes.

---

## The five advocacy angles

Every story is classified into one primary angle:

- **Public health** — disease outbreaks, food safety crises, antibiotic resistance, zoonotic threats
- **Economic** — industry losses, government subsidies, market shifts, company earnings
- **Environmental** — methane emissions, deforestation, water contamination, CAFO runoff
- **Welfare** — animal suffering, undercover investigations, confinement conditions, slaughter practices
- **Policy** — legislation, court cases, regulatory changes, government action

The angle determines how the content is framed. A bird flu story classified as public health gets a very different tweet thread than the same story classified as economic.

---

## Key features

### 🚨 Urgency Alert System

Stories scoring 8+ on urgency automatically trigger a persistent alert banner at the top of the dashboard. The banner shows:

- Pulsing urgency indicators with color-coded severity (red for 9-10, amber for 8)
- **Response window timer** — shows exactly how many hours remain in the 24-48 hour advocacy window
- Expandable list of all high-urgency active alerts
- **Browser notifications** (Notification API) when new high-urgency stories arrive
- Individual and bulk dismiss controls

### 📋 Content History & Export

Every generated content set is automatically saved. The History panel provides:

- Full list of past generations with story metadata, angle badges, and urgency scores
- **Expandable previews** showing tweet thread snippets, press headlines, and op-ed angles
- **Multi-format export**: Markdown (.md), Plain Text (.txt), JSON (.json)
- **Copy as Markdown** with one click for pasting into documents
- **Load in Editor** — reopen any past generation directly in the content panel
- Delete individual entries or clear all history

### 🔔 Push Notifications (Webhook/Slack/Discord)

When high-urgency stories are detected during a fetch cycle, the engine automatically pushes alerts to configured endpoints:

- **Slack integration** — rich Block Kit messages with story details, urgency score, and "Read Full Story" button
- **Discord integration** — embedded messages with color-coded urgency
- **Generic webhooks** — structured JSON payload for any HTTP endpoint
- Configurable urgency threshold per webhook (default: 8+)
- Optional angle filtering (only send welfare stories to one channel, policy to another)
- Test button to verify connectivity before going live

### 🏷️ Configurable Keywords

The keyword filter that determines which stories appear in your feed is now fully editable from the UI:

- **Category-based quick toggles** — turn entire keyword groups on/off (Disease, Factory Farming, Environment, etc.)
- Individual keyword add/remove with tag-style interface
- **Visual indicators** for custom vs. default keywords
- Search/filter across all active keywords
- Reset to defaults with one click
- Changes take effect on next feed refresh

---

## News sources

### Free APIs (all have generous free tiers)

| API | Free limit | Best for |
|---|---|---|
| [GNews](https://gnews.io) | 100 req/day | Breaking news, outbreaks |
| [Currents API](https://currentsapi.services) | **600 req/day** | Environment, policy, climate |
| [NewsData.io](https://newsdata.io) | 200 req/day | Welfare, investigations |
| [NewsAPI](https://newsapi.org) | 100 req/day | Economic, company stories |

### RSS feeds (no key, unlimited)

CDC Updates · Food Safety News · Farm Progress · Humane Society · Mercy For Animals · Animal Equality · PETA · The Guardian (livestock) · Civil Eats · Inside Climate News · Mongabay · AgWeb · Reuters Environment

---

## Stack

```
Backend     Node.js + Express
Frontend    React 18 + Tailwind CSS + Vite
News        rss-parser + axios (multi-API)
AI          Anthropic Claude (claude-sonnet-4-20250514)
Push        Slack/Discord/Generic Webhooks
Storage     JSON file-based (history, webhooks, keywords)
```

---

## Setup

You need Node.js 18+ and an Anthropic API key. The news APIs are optional — the RSS feeds alone will get you real stories with no keys at all.

**1. Clone the repo**

```bash
git clone https://github.com/YOUR_USERNAME/openpaws-news-engine
cd openpaws-news-engine
```

**2. Backend**

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and add your keys. The only required one is `ANTHROPIC_API_KEY`. Add as many of the news API keys as you have — each one adds more story coverage.

```bash
npm run dev
# Running at http://localhost:3001
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

Open `http://localhost:5173`. Click **Refresh** and wait about 20–30 seconds for stories to load and classify. Select any story, hit **Generate content**, and your advocacy content is ready.

---

## Project structure

```
openpaws/
│
├── backend/
│   ├── server.js                  Express server, caching, API routes
│   ├── data/                      Persistent storage (auto-created)
│   │   ├── history.json           Saved content generations
│   │   ├── webhooks.json          Webhook subscriptions
│   │   └── keywords.json          Custom keyword configuration
│   └── services/
│       ├── fetcher.js             All news APIs + RSS + deduplication + custom keywords
│       ├── classifier.js          Claude: angle classification + urgency scoring
│       ├── generator.js           Claude: tweet thread + press statement + op-ed
│       └── notifier.js            Slack/Discord/webhook push delivery
│
├── frontend/
│   └── src/
│       ├── App.jsx                Root layout and state
│       ├── hooks/
│       │   └── useStories.js      Data fetching hook
│       ├── utils/
│       │   └── constants.js       Angle config, urgency styles, helpers
│       ├── context/
│       │   └── SettingsContext.jsx App-wide settings with localStorage
│       └── components/
│           ├── Topbar.jsx         Filters, refresh, date range
│           ├── LeftNav.jsx        Navigation sidebar with feature access
│           ├── Sidebar.jsx        Story list with skeleton loader
│           ├── StoryPanel.jsx     Selected story detail + generate button
│           ├── ContentPanel.jsx   Tabbed content: thread, press, op-ed
│           ├── AlertBanner.jsx    Urgency alerts with response window timer
│           ├── ContentHistory.jsx History modal with export (MD/TXT/JSON)
│           ├── WebhookManager.jsx Slack/Discord/webhook push configuration
│           ├── KeywordManager.jsx Configurable keyword filter UI
│           └── Settings.jsx       App settings modal
│
└── README.md
```

---

## API

```
GET  /api/stories               Fetch and classify stories (default: last 7 days)
GET  /api/stories?days=3        Change the lookback window
GET  /api/stories?refresh=true  Force bypass cache
POST /api/generate              { story } → { content } (auto-saved to history)
GET  /api/health                Key status + cache info

GET  /api/alerts                High-urgency stories (8+ in last 24h)
GET  /api/alerts?threshold=9    Custom urgency threshold

GET  /api/history               All saved content generations
DELETE /api/history/:id         Delete a single history entry
DELETE /api/history             Clear all history

GET  /api/webhooks              List webhook subscriptions
POST /api/webhooks              Add webhook { url, label, urgencyThreshold, angles }
PATCH /api/webhooks/:id         Update webhook settings
DELETE /api/webhooks/:id        Remove webhook
POST /api/webhooks/test/:id     Send test notification

GET  /api/keywords              Current keyword config (custom or defaults)
PUT  /api/keywords              Save custom keywords { keywords: [...] }
DELETE /api/keywords            Reset to defaults
```

Responses are cached for 15 minutes to avoid burning through free API quotas.

---

## Demo — 7 days of real news

Tested against live feeds over 7 days. Fetched 28 relevant stories, classified 20, generated content for all 20.

| Story | Angle | Urgency | Correct |
|---|---|---|---|
| H5N1 spreads to dairy cattle in 4 new states | Public health | 9/10 | ✓ |
| Undercover footage from Iowa pig facility released | Welfare | 9/10 | ✓ |
| EPA proposes stricter runoff rules for large CAFOs | Policy | 7/10 | ✓ |
| Global livestock methane emissions reach new high | Environmental | 6/10 | ✓ |
| Tyson Foods posts quarterly losses tied to avian flu | Economic | 7/10 | ✓ |

Classification accuracy: 19/20 correct. The one off was a story about beef tariffs that sits equally at the border of economic and policy — a judgment call either way.

---

## What I'd build next

**Organization voice customization** — let each organization set their tone, spokesperson name, and boilerplate. A PETA press release sounds nothing like a Humane Society one. The generator prompt should adapt automatically.

**Inline content editor** — the press statements need the most editing. Building editing directly into the tool (contentEditable or textarea) would eliminate the need to copy to another app.

**Feedback loop** — advocates rate the generated content after editing. Those ratings feed back into the prompts over time, improving output for each organization's specific voice.

**Multi-language support** — most of the world's factory farming happens outside English-language media. Extending to Spanish, Hindi, and Portuguese would make this genuinely global.

---

## Notes on content quality

The tweet threads came out cleanest. Short constraints, clear structure, and the narrative arc is easy to specify in the prompt. The press statements needed the most editing — mostly around the quote placeholder and making the boilerplate match the organization's actual language. The op-ed talking points were the most variable, which makes sense: a good op-ed argument depends heavily on the publication and the author's voice.

The urgency scoring is the part I iterated on most. Early versions were overconfident — everything was a 7 or above. The current prompt ties the score to specific time-based criteria (is this breaking today? is there active legislation?) which produces a much more useful distribution. Low-urgency stories are still worth having in the feed for campaign planning — they just don't need a same-day response.

Built for the OpenPAWS internship work test, March 2026.
