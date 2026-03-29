import { ANGLES, timeAgo } from "../utils/constants.js";

// Angle-specific color schemes for badges
const ANGLE_COLORS = {
  public_health: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: "🏥", gradient: "from-red-500 to-rose-500" },
  economic:      { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: "📊", gradient: "from-amber-500 to-orange-500" },
  environmental: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: "🌿", gradient: "from-emerald-500 to-teal-500" },
  welfare:       { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: "💜", gradient: "from-purple-500 to-violet-500" },
  policy:        { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: "⚖️", gradient: "from-blue-500 to-indigo-500" },
};

export default function StoryPanel({ story, onGenerate, generating, hasContent }) {
  const cls = story.classification;
  const angleKey = cls?.angle || "welfare";
  const angle = ANGLES[angleKey] || ANGLES.welfare;
  const colors = ANGLE_COLORS[angleKey] || ANGLE_COLORS.welfare;
  const score = cls?.urgency_score || 0;

  // Response window calculation
  const published = new Date(story.publishedAt).getTime();
  const elapsed = Date.now() - published;
  const windowMs = 48 * 60 * 60 * 1000;
  const remaining = Math.max(0, windowMs - elapsed);
  const hoursLeft = Math.floor(remaining / (60 * 60 * 1000));
  const windowPercent = Math.min(100, Math.max(0, (remaining / windowMs) * 100));

  return (
    <div className="animate-in fade-in duration-500">
      {/* ─── Hero Header with gradient accent ─── */}
      <div className="relative overflow-hidden">
        {/* Subtle gradient accent at top */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />
        
        <div className="px-6 pt-6 pb-5 space-y-4">
          {/* Source + Time row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center overflow-hidden">
                <img src={`https://www.google.com/s2/favicons?domain=${new URL(story.url || "https://google.com").hostname}&sz=32`} alt="" className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{story.source}</span>
              <span className="text-slate-200">·</span>
              <span className="text-[10px] font-bold text-slate-400">{timeAgo(story.publishedAt)}</span>
            </div>
            {story.url && (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors group"
              >
                <span>Read Original</span>
                <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {/* Title */}
          <h1 className="text-xl font-extrabold text-slate-900 leading-[1.3] tracking-tight">
            {story.title}
          </h1>

          {/* Tag row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${colors.bg} ${colors.text} ${colors.border}`}>
              <span>{colors.icon}</span>
              {angle.label}
            </span>
            <UrgencyBadge score={score} />
          </div>
        </div>
      </div>

      {/* ─── Response Window Timer ─── */}
      <div className="mx-6 mb-4">
        <div className={`p-3 rounded-xl border ${
          hoursLeft <= 12 ? "bg-red-50/50 border-red-100" : hoursLeft <= 24 ? "bg-amber-50/50 border-amber-100" : "bg-emerald-50/50 border-emerald-100"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className={`w-3.5 h-3.5 ${hoursLeft <= 12 ? "text-red-500" : hoursLeft <= 24 ? "text-amber-500" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                hoursLeft <= 12 ? "text-red-600" : hoursLeft <= 24 ? "text-amber-600" : "text-emerald-600"
              }`}>
                {hoursLeft > 0 ? `${hoursLeft}h remaining in response window` : "Response window expired"}
              </span>
            </div>
            <span className={`text-[9px] font-bold ${hoursLeft <= 12 ? "text-red-400" : hoursLeft <= 24 ? "text-amber-400" : "text-emerald-400"}`}>
              48h window
            </span>
          </div>
          <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                hoursLeft <= 12 ? "bg-gradient-to-r from-red-500 to-red-400" : hoursLeft <= 24 ? "bg-gradient-to-r from-amber-500 to-amber-400" : "bg-gradient-to-r from-emerald-500 to-emerald-400"
              }`}
              style={{ width: `${windowPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── Generate Button with shimmer ─── */}
      <div className="px-6 mb-5">
        <button
          onClick={onGenerate}
          disabled={generating}
          className="relative w-full overflow-hidden group px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-[0.15em] hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2.5 shadow-lg shadow-blue-200/50 active:scale-[0.98]"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          
          {generating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          )}
          <span className="relative z-10">
            {generating ? "Generating Content..." : hasContent ? "Regenerate Analysis" : "Generate Advocacy Content"}
          </span>
        </button>
      </div>

      {/* ─── Classification Intelligence ─── */}
      {cls && (
        <div className="px-6 pb-6 space-y-4">
          {/* Urgency Score Visual */}
          <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Urgency Assessment</h3>
              </div>
              <span className={`text-lg font-black ${score >= 8 ? "text-red-500" : score >= 6 ? "text-amber-500" : "text-slate-400"}`}>
                {score}<span className="text-xs text-slate-300 font-bold">/10</span>
              </span>
            </div>
            
            {/* Visual urgency bar */}
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    i < score
                      ? score >= 8
                        ? "bg-gradient-to-r from-red-400 to-red-500"
                        : score >= 6
                          ? "bg-gradient-to-r from-amber-400 to-amber-500"
                          : "bg-gradient-to-r from-blue-400 to-blue-500"
                      : "bg-slate-100"
                  }`}
                  style={{ animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed">{cls.urgency_reason}</p>
          </div>

          {/* Key Observations */}
          <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Key Observations</h3>
            </div>
            <ul className="space-y-2.5">
              {(cls.key_facts || []).map((f, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-slate-600 font-medium leading-relaxed">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    i === 0 ? "bg-blue-500" : i === 1 ? "bg-indigo-400" : "bg-slate-300"
                  }`} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advocacy Hook — accent card */}
          {cls.advocacy_hook && (
            <div className={`relative p-4 rounded-xl border overflow-hidden ${colors.bg} ${colors.border}`}>
              {/* Left accent bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${colors.gradient}`} />
              <div className="pl-3 space-y-2">
                <div className="flex items-center gap-2">
                  <svg className={`w-3.5 h-3.5 ${colors.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                  <h3 className={`text-[10px] font-black uppercase tracking-widest ${colors.text}`}>Advocacy Hook</h3>
                </div>
                <p className={`text-[13px] font-semibold italic leading-relaxed ${colors.text}`}>
                  "{cls.advocacy_hook}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function UrgencyBadge({ score }) {
  let bg, text, border, label;
  if (score >= 9) {
    bg = "bg-red-50"; text = "text-red-700"; border = "border-red-200"; label = "Critical";
  } else if (score >= 7) {
    bg = "bg-orange-50"; text = "text-orange-700"; border = "border-orange-200"; label = "High";
  } else if (score >= 5) {
    bg = "bg-amber-50"; text = "text-amber-700"; border = "border-amber-200"; label = "Medium";
  } else {
    bg = "bg-slate-50"; text = "text-slate-500"; border = "border-slate-200"; label = "Low";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${bg} ${text} ${border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        score >= 9 ? "bg-red-500 animate-pulse" : score >= 7 ? "bg-orange-500" : score >= 5 ? "bg-amber-500" : "bg-slate-400"
      }`} />
      {label} · {score}/10
    </span>
  );
}
