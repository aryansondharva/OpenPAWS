# News Opportunism Engine

<p align="center">
  <b><a href="#what-it-does">What it does</a></b> •
  <b><a href="#the-five-advocacy-angles">Angles</a></b> •
  <b><a href="#key-features">Key features</a></b> •
  <b><a href="#news-sources">News sources</a></b> •
  <b><a href="#stack">Stack</a></b> •
  <b><a href="#setup">Setup</a></b> •
  <b><a href="#project-structure">Structure</a></b> •
  <b><a href="#what-to-build-next-v20-roadmap">Roadmap</a></b>
</p>


Animal advocacy organizations run lean. When a major story breaks — an H5N1 outbreak spreading to dairy cattle, undercover footage from a factory farm, a new EPA ruling on CAFO runoff — the window to respond is 24 to 48 hours. After that, the news cycle moves on and the moment is gone.

Most organizations miss it. Not because they don't care, but because drafting a tweet thread, a press statement, and an op-ed pitch takes hours they don't have.

---

## What it does

Monitors six news sources simultaneously — GNews, Currents API, NewsData.io, NewsAPI, and 13 curated RSS feeds — filtering for animal agriculture stories in real time. Each story gets classified by advocacy angle and scored for urgency by Gemini. When you find a story worth responding to, one click generates a full set of ready-to-publish content: a tweet thread, a press statement skeleton, and op-ed talking points with outlet suggestions.

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

-  **Urgency Alert System**: Persistent dashboard banners with 24-hour response timers for breaking news.
-  **Content History & Export**: Auto-saves every generated tweet, press release, and op-ed for 1-click export.
-  **Multi-Channel Push Alerts**: Instant Slack, Discord, Email, and webhook drops to auto-notify your team.
-  **Configurable Keywords**: Quickly define, search, and toggle feed filters by category directly from the UI.

---

## News sources

### Free APIs (all have generous free tiers)

| API | Free limit | Best for |
|---|---|---|
| [GNews](https://gnews.io) | 100 req/day | Breaking news, outbreaks |
| [Currents API](https://currentsapi.services) | **600 req/day** | Environment, policy, climate |
| [NewsData.io](https://newsdata.io) | 200 req/day | Welfare, investigations |
| [NewsAPI](https://newsapi.org) | 100 req/day | Economic, company stories |

### Free RSS feeds
13 curated sources (CDC, Reuters, PETA, The Guardian, etc.). No keys needed.

---

## Stack

```
Backend     Node.js + Express
Frontend    React 18 + Tailwind CSS + Vite
News        rss-parser + axios (multi-API)
AI          Google Gemini (gemini-3.1-pro)
Push        Slack/Discord/Generic Webhooks
Storage     JSON file-based (history, webhooks, keywords)
```

---

## Setup

**Prerequisites:** Node.js 18+ and a `GEMINI_API_KEY`. *(News API keys are optional).*

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

Add your `GEMINI_API_KEY` to `.env`. (Other news keys are optional).

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

Open `http://localhost:5173`. Hit **Refresh** to load stories, select one, and click **Generate**.

---

## Project structure

```text
openpaws/
├── backend/
│   ├── server.js           # API entry & caching layer
│   └── services/
│       ├── fetcher.js      # Aggregates 4 APIs & 13 RSS feeds  
│       ├── classifier.js   # Gemini AI: Urgency & angle grading
│       ├── generator.js    # Gemini AI: Generates press/tweets/op-eds
│       ├── alerter.js      # Global Slack & Nodemailer dispatch
│       └── notifier.js     # Webhook endpoints
├── frontend/
│   └── src/
│       ├── components/     # React presentation layer (Tailwind CSS)
│       ├── hooks/          # Data fetching logic
│       └── context/        # Global app settings state
└── data/                   # Persistent JSON storage (created on run)
```

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

## What to build next (v2.0 Roadmap)

-  **Browser Extension**: A native extension that lets advocates instantly generate campaigns from any news article they are actively reading on the web.
-  **Organization-Specific AI Personas**: Upload past press releases so the AI natively learns and mimics your exact brand voice, cutting down manual edits to zero.
-  **Vision AI Integration**: Auto-extract images & undercover video frames from news sources to generate highly specific visual descriptions in press statements.
-  **1-Click Publishing**: Authenticate with Twitter/X and Mailchimp to push generated campaigns live directly from the dashboard.
-  **Impact Tracking & Feedback Loop**: Pull social engagement metrics (views/retweets) on generated content to create a self-improving AI generation cycle.
-  **Global Multi-language Pipeline**: Automatically ingest breaking non-English news (e.g. from Brazil/Asia) and localize campaigns for US advocates.

---

## Notes on content quality

The tweet threads came out cleanest. Short constraints, clear structure, and the narrative arc is easy to specify in the prompt. The press statements needed the most editing — mostly around the quote placeholder and making the boilerplate match the organization's actual language. The op-ed talking points were the most variable, which makes sense: a good op-ed argument depends heavily on the publication and the author's voice.

The urgency scoring is the part I iterated on most. Early versions were overconfident — everything was a 7 or above. The current prompt ties the score to specific time-based criteria (is this breaking today? is there active legislation?) which produces a much more useful distribution. Low-urgency stories are still worth having in the feed for campaign planning — they just don't need a same-day response.

---

Built for the OpenPAWS internship work test, March 2026.