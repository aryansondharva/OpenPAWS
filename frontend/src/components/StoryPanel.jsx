import { ANGLES } from "../utils/constants.js";

export default function StoryPanel({ story, onGenerate, generating, hasContent }) {
  const cls = story.classification;
  const angle = ANGLES[cls?.angle] || ANGLES.welfare;
  const score = cls?.urgency_score || 0;

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Title + meta */}
      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Active Selection</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight tracking-tight">
            {story.title}
          </h1>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
              {angle.label}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 border rounded-lg ${score > 6 ? "border-blue-200 text-blue-700 bg-blue-50" : "border-slate-200 text-slate-600 bg-slate-50"}`}>
              Priority {score}/10
            </span>
            <span className="text-xs font-medium text-slate-400">
              {story.source}
            </span>
            {story.url && (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Source Link ↗
              </a>
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={generating}
          className="w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-none"
        >
          {generating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <span className="text-lg">✧</span>
          )}
          {generating ? "PROCESSING..." : hasContent ? "RE-ANALYZE" : "GET ANALYSIS"}
        </button>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Classification cards */}
      {cls && (
        <div className="grid grid-cols-1 gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Urgency reason */}
            <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logic</h3>
              <p className="text-sm text-slate-700 font-medium leading-relaxed">{cls.urgency_reason}</p>
            </div>

            {/* Key facts */}
            <div className="p-6 border border-slate-200 rounded-xl bg-white space-y-3">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Observations</h3>
              <ul className="space-y-2">
                {(cls.key_facts || []).map((f, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600 font-medium leading-relaxed">
                    <span className="text-blue-500">•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Advocacy hook */}
          <div className="p-6 bg-slate-900 text-white rounded-xl space-y-3">
            <h3 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Key Hook</h3>
            <p className="text-lg font-bold italic leading-snug">
              "{cls.advocacy_hook}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
