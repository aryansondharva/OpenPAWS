import { ANGLES, urgencyStyle, timeAgo } from "../utils/constants.js";

export default function Sidebar({ stories, loading, selectedId, onSelect }) {
  if (loading) return <SkeletonList />;
  if (!stories.length) return (
    <div className="flex flex-col items-center justify-center h-64 text-center px-6 gap-2">
      <div className="text-3xl">🔍</div>
      <div className="text-sm text-zinc-400">No stories found</div>
      <div className="text-xs text-zinc-600">Try refreshing or widening the date range</div>
    </div>
  );

  return (
    <div className="p-2.5 space-y-1.5">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          selected={story.id === selectedId}
          onSelect={() => onSelect(story)}
        />
      ))}
    </div>
  );
}

function StoryCard({ story, selected, onSelect }) {
  const cls = story.classification;
  const angle = ANGLES[cls?.angle] || ANGLES.welfare;
  const urgency = urgencyStyle(cls?.urgency_score || 0);
  const score = cls?.urgency_score || 0;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-xl p-3 border transition-all duration-150 ${
        selected
          ? "bg-zinc-800 border-emerald-700/60 ring-1 ring-emerald-700/30"
          : "bg-zinc-900/60 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700"
      }`}
    >
      {/* Row 1: angle + urgency */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`tag ${angle.bg} ${angle.text}`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${angle.dot} mr-1.5 align-middle`} />
          {angle.short}
        </span>
        <span className={`tag ml-auto font-mono font-semibold ${urgency.bg} ${urgency.color}`}>
          {score}/10
        </span>
      </div>

      {/* Title */}
      <p className={`text-sm font-medium leading-snug mb-1.5 line-clamp-2 ${selected ? "text-white" : "text-zinc-200"}`}>
        {story.title}
      </p>

      {/* Hook */}
      {cls?.advocacy_hook && (
        <p className="text-xs text-zinc-500 italic leading-snug line-clamp-1 mb-2">
          {cls.advocacy_hook}
        </p>
      )}

      {/* Bottom: source + time */}
      <div className="flex items-center gap-2 text-[11px] text-zinc-600">
        <span className="truncate">{story.source}</span>
        <span className="ml-auto flex-shrink-0">{timeAgo(story.publishedAt)}</span>
      </div>
    </button>
  );
}

function SkeletonList() {
  return (
    <div className="p-2.5 space-y-1.5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/60 animate-pulse">
          <div className="flex gap-2 mb-2">
            <div className="h-5 w-20 bg-zinc-800 rounded-full" />
            <div className="h-5 w-10 bg-zinc-800 rounded-full ml-auto" />
          </div>
          <div className="h-3.5 bg-zinc-800 rounded w-full mb-1.5" />
          <div className="h-3.5 bg-zinc-800 rounded w-3/4 mb-2" />
          <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}
