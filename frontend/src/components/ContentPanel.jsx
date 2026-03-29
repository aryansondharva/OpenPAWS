import { useState } from "react";
// import CopyBtn from "./CopyBtn.jsx";

const TABS = [
  { id: "twitter", label: "Twitter Thread", icon: "𝕏" },
  { id: "press",   label: "Press Statement", icon: "📄" },
  { id: "oped",    label: "Op-Ed Angles",    icon: "✍️" },
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
      <div className="flex flex-col items-center justify-center p-20 gap-6 min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-bold text-slate-900 animate-pulse">Generating Response...</p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="flex flex-col flex-1">
      {/* Tab bar */}
      <div className="flex border-b border-slate-200 px-6 sticky top-0 bg-white z-40">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`py-4 px-6 text-xs font-bold transition-all border-b-2 ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6">
        <div className="max-w-3xl mx-auto">
          {tab === "twitter" && <TwitterTab thread={content.twitter_thread} copy={copy} copied={copied} />}
          {tab === "press"   && <PressTab statement={content.press_statement} copy={copy} copied={copied} />}
          {tab === "oped"    && <OpEdTab oped={content.op_ed} copy={copy} copied={copied} />}
        </div>
      </div>
    </div>
  );
}

function TwitterTab({ thread, copy, copied }) {
  const full = (thread || []).join("\n\n");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Twitter Flow</h3>
        <CopyBtn onClick={() => copy(full, "thread-all")} copied={copied === "thread-all"} label="Copy Thread" />
      </div>

      <div className="space-y-4">
        {(thread || []).map((tweet, i) => (
          <div key={i} className="p-6 border border-slate-200 rounded-xl bg-white space-y-4">
            <p className="text-base text-slate-800 font-medium leading-relaxed">{tweet}</p>
            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Part {i + 1}</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => copy(tweet, `tweet-${i}`)}
                  className="text-[10px] font-bold text-blue-600 hover:underline"
                >
                  {copied === `tweet-${i}` ? '✓ Copied' : 'Copy Part'}
                </button>
                <button
                  onClick={() => {
                    // Create Twitter web intent URL with pre-filled content
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
                    window.open(twitterUrl, '_blank', 'width=550,height=420');
                  }}
                  className="flex items-center gap-1 text-[10px] font-bold text-black hover:text-blue-600 transition-colors"
                  title="Post this tweet to X"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PressTab({ statement, copy, copied }) {
  if (!statement) return null;

  const full = [
    statement.headline,
    statement.dateline,
    statement.lead_paragraph,
    statement.context_paragraph,
    statement.quote_paragraph,
    statement.call_to_action,
    statement.boilerplate,
    statement.contact,
  ].join("\n\n");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Official Statement</h3>
        <CopyBtn onClick={() => copy(full, "press-all")} copied={copied === "press-all"} label="Copy Full Statement" />
      </div>

      <div className="p-10 border border-slate-200 rounded-xl bg-white space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{statement.dateline}</span>
          <h1 className="text-2xl font-bold text-slate-950 tracking-tight">{statement.headline}</h1>
        </div>
        
        <div className="space-y-6">
          <p className="text-base text-slate-700 font-medium leading-relaxed">{statement.lead_paragraph}</p>
          <p className="text-base text-slate-700 font-medium leading-relaxed">{statement.context_paragraph}</p>
          <div className="border-l-4 border-slate-100 pl-6 py-2">
            <p className="text-lg italic text-slate-800 font-medium">"{statement.quote_paragraph}"</p>
          </div>
          <p className="text-base text-slate-700 font-medium leading-relaxed">{statement.call_to_action}</p>
        </div>

        <div className="pt-8 border-t border-slate-100 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed italic">{statement.boilerplate}</p>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact: {statement.contact}</p>
        </div>
      </div>
    </div>
  );
}

function OpEdTab({ oped, copy, copied }) {
  if (!oped) return null;

  const pointsText = (oped.talking_points || []).map((p, i) => `${i + 1}. ${p}`).join("\n\n");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Strategic Narrative</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="p-8 border border-slate-200 rounded-xl bg-white space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Recommended Title</h3>
            <p className="text-xl font-bold text-slate-900 tracking-tight">{oped.suggested_headline}</p>
          </div>
          <p className="text-base text-slate-600 font-medium italic">"{oped.opening_line}"</p>
          <div className="flex gap-2 flex-wrap pt-4 border-t border-slate-50">
            {(oped.suggested_outlets || []).map((o, i) => (
              <span key={i} className="text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-500 px-3 py-1 rounded-md">{o}</span>
            ))}
          </div>
        </div>

        <div className="p-8 border border-slate-200 rounded-xl bg-white space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Points</h3>
            <CopyBtn onClick={() => copy(pointsText, "points")} copied={copied === "points"} label="Copy Points" />
          </div>
          <div className="space-y-4">
            {(oped.talking_points || []).map((pt, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-blue-500 font-bold">0{i + 1}</span>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{pt}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyBtn({ onClick, copied, label = "Copy" }) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] px-4 py-2 rounded-lg font-bold uppercase transition-all ${
        copied
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-blue-600 text-white hover:bg-blue-700 shadow-none"
      }`}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
