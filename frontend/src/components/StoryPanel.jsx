import { ANGLES, urgencyStyle } from "../utils/constants.js";

export default function StoryPanel({ story, onGenerate, generating, hasContent }) {
  const cls = story.classification;
  const angle = ANGLES[cls?.angle] || ANGLES.welfare;
  const urgency = urgencyStyle(cls?.urgency_score || 0);
  const score = cls?.urgency_score || 0;

  return (
    <div className="border-b border-zinc-800/60 bg-zinc-900/40 p-5">
      {/* Title + meta */}
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-zinc-100 leading-snug mb-2">
            {story.title}
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`tag ${angle.bg} ${angle.text}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${angle.dot} mr-1.5 align-middle`} />
              {angle.label}
            </span>
            <span className={`tag font-mono font-semibold ${urgency.bg} ${urgency.color}`}>
              {score}/10 urgency
            </span>
            <span className="text-xs text-zinc-500">{story.source}</span>
            {story.url && (
              <a
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-500 hover:text-emerald-400 underline underline-offset-2 ml-auto"
              >
                Read original ↗
              </a>
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={onGenerate}
          disabled={generating}
          className="btn-primary shrink-0"
        >
          {generating ? (
            <><span className="animate-spin text-base leading-none">⟳</span> Generating...</>
          ) : hasContent ? (
            <><span>↺</span> Regenerate</>
          ) : (
            <><span>✦</span> Generate content</>
          )}
        </button>
      </div>

      {/* Classification cards */}
      {cls && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Urgency reason */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Why this urgency</div>
            <p className="text-xs text-zinc-300 leading-relaxed">{cls.urgency_reason}</p>
          </div>

          {/* Key facts */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Key facts</div>
            <ul className="space-y-1">
              {(cls.key_facts || []).map((f, i) => (
                <li key={i} className="flex gap-1.5 text-xs text-zinc-300">
                  <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                  <span className="leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advocacy hook */}
          <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium mb-1">Strongest hook</div>
            <p className="text-xs text-zinc-300 italic leading-relaxed">"{cls.advocacy_hook}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
