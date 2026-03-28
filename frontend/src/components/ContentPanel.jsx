import { useState } from "react";

const TABS = [
  { id: "twitter", label: "Twitter / X thread", icon: "𝕏" },
  { id: "press",   label: "Press statement",    icon: "📄" },
  { id: "oped",    label: "Op-ed angles",        icon: "✍️" },
];

export default function ContentPanel({ content, generating }) {
  const [tab, setTab] = useState("twitter");
  const [copied, setCopied] = useState(null);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-9 h-9 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-zinc-400">Claude is writing your advocacy content...</div>
        <div className="text-xs text-zinc-600">Tweet thread · Press statement · Op-ed angles</div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="flex flex-col flex-1">
      {/* Tab bar */}
      <div className="flex border-b border-zinc-800/60 px-5 bg-zinc-900/20">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-3 px-4 text-xs font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5 flex-1">
        {tab === "twitter" && <TwitterTab thread={content.twitter_thread} copy={copy} copied={copied} />}
        {tab === "press"   && <PressTab statement={content.press_statement} copy={copy} copied={copied} />}
        {tab === "oped"    && <OpEdTab oped={content.op_ed} copy={copy} copied={copied} />}
      </div>
    </div>
  );
}

// ── Twitter thread tab ──────────────────────────────────────────────
function TwitterTab({ thread, copy, copied }) {
  const full = (thread || []).join("\n\n");

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-zinc-500">{thread?.length || 0}-tweet thread · copy each or all at once</p>
        <CopyBtn onClick={() => copy(full, "thread-all")} copied={copied === "thread-all"} label="Copy all" />
      </div>

      {(thread || []).map((tweet, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 group">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-200 shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">{tweet}</p>
              <div className="flex items-center justify-between mt-2.5">
                <span className={`text-xs font-mono ${tweet.length > 270 ? "text-red-400" : "text-zinc-600"}`}>
                  {tweet.length} / 280
                </span>
                <CopyBtn onClick={() => copy(tweet, `tweet-${i}`)} copied={copied === `tweet-${i}`} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Press statement tab ─────────────────────────────────────────────
function PressTab({ statement, copy, copied }) {
  if (!statement) return null;

  const full = [
    "FOR IMMEDIATE RELEASE",
    "",
    statement.headline,
    "",
    statement.dateline,
    "",
    statement.lead_paragraph,
    "",
    statement.context_paragraph,
    "",
    statement.quote_paragraph,
    "",
    statement.call_to_action,
    "",
    "###",
    "",
    statement.boilerplate,
    "",
    statement.contact,
  ].join("\n");

  const sections = [
    { label: "Headline",          key: "headline",          bold: true },
    { label: "Lead paragraph",    key: "lead_paragraph" },
    { label: "Context",           key: "context_paragraph" },
    { label: "Quote",             key: "quote_paragraph",   italic: true },
    { label: "Call to action",    key: "call_to_action" },
    { label: "Boilerplate",       key: "boilerplate",       muted: true },
  ];

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-500">Ready to send · replace placeholder names before publishing</p>
        <CopyBtn onClick={() => copy(full, "press-all")} copied={copied === "press-all"} label="Copy full statement" />
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Release label */}
        <div className="px-5 py-3 bg-zinc-800/60 border-b border-zinc-700/40">
          <span className="text-[10px] font-semibold tracking-widest text-zinc-400 uppercase">For immediate release</span>
          <span className="text-xs text-zinc-500 ml-4">{statement.dateline}</span>
        </div>

        <div className="p-5 space-y-5">
          {sections.map(({ label, key, bold, italic, muted }) => (
            <div key={key}>
              <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium mb-1.5">{label}</div>
              <p className={`text-sm leading-relaxed ${
                bold ? "font-semibold text-white text-base" :
                italic ? "italic text-zinc-300" :
                muted ? "text-zinc-500" :
                "text-zinc-300"
              }`}>
                {statement[key]}
              </p>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-zinc-800/60 bg-zinc-900/60">
          <p className="text-xs text-zinc-500">{statement.contact}</p>
        </div>
      </div>
    </div>
  );
}

// ── Op-ed tab ───────────────────────────────────────────────────────
function OpEdTab({ oped, copy, copied }) {
  if (!oped) return null;

  const pointsText = (oped.talking_points || []).map((p, i) => `${i + 1}. ${p}`).join("\n\n");

  return (
    <div className="max-w-2xl space-y-4">
      {/* Headline + angle */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <div>
          <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium mb-1">Suggested headline</div>
          <p className="text-base font-semibold text-white leading-snug">{oped.suggested_headline}</p>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Unique angle</div>
          <p className="text-sm text-zinc-400">{oped.angle_summary}</p>
        </div>
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Opening line</div>
          <p className="text-sm text-zinc-300 italic leading-relaxed">"{oped.opening_line}"</p>
        </div>
      </div>

      {/* Talking points */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium">5 talking points</div>
          <CopyBtn onClick={() => copy(pointsText, "points")} copied={copied === "points"} />
        </div>
        <ol className="space-y-3">
          {(oped.talking_points || []).map((pt, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-emerald-500 font-bold shrink-0 mt-0.5">{i + 1}.</span>
              <span className="text-zinc-300 leading-relaxed">{pt}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Outlets + pitch note */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-2">Suggested outlets</div>
        <div className="flex gap-2 flex-wrap mb-3">
          {(oped.suggested_outlets || []).map((o, i) => (
            <span key={i} className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-3 py-1 rounded-full">{o}</span>
          ))}
        </div>
        {oped.pitch_note && (
          <p className="text-xs text-zinc-500 italic">{oped.pitch_note}</p>
        )}
      </div>
    </div>
  );
}

// ── Shared copy button ──────────────────────────────────────────────
function CopyBtn({ onClick, copied, label = "Copy" }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        copied
          ? "bg-emerald-700 text-white"
          : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
      }`}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}
