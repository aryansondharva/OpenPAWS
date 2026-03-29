import { ANGLES, timeAgo } from "../utils/constants.js";

export default function Sidebar({ stories, loading, selectedId, onSelect }) {
  if (loading) return <SkeletonList />;
  
  if (!stories.length) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 animate-in fade-in duration-700">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner ring-1 ring-slate-100">
        📢
      </div>
      <h3 className="text-xl font-black text-slate-900 tracking-tight">Intelligence Void</h3>
      <p className="text-sm text-slate-400 mt-2 max-w-[280px] font-bold uppercase tracking-wider leading-relaxed">No strategic updates found. Adjust parameters or re-synchronize.</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-8">
      {stories.map((story, index) => (
        <StoryCard
          key={story.id}
          story={story}
          index={index}
          selected={story.id === selectedId}
          onSelect={() => onSelect(story)}
        />
      ))}
    </div>
  );
}

function StoryCard({ story, selected, onSelect, index }) {
  const cls = story.classification;
  const angleKey = cls?.angle || "welfare"; // Default to welfare for now
  const angle = ANGLES[angleKey] || ANGLES.welfare;
  const score = cls?.urgency_score || 0;
  
  return (
    <div 
      className={`group relative flex flex-col transition-all duration-300 transform active:scale-[0.98] ${
        selected 
          ? "animate-in zoom-in-95" 
          : "hover:-translate-y-0.5"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={onSelect}
    >
      {/* Selection Border Glow */}
      {selected && (
        <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-600/50 to-indigo-600/50 rounded-[22px] blur-sm opacity-50 z-0 animate-pulse" />
      )}

      <div className={`relative z-10 p-4 rounded-2xl border transition-all duration-300 ${
        selected 
          ? "bg-white border-blue-500 shadow-[0_12px_32px_-8px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/10" 
          : "bg-white border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md"
      }`}>
        
        {/* Left Indicator Strip */}
        <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-all duration-500 ${
          selected ? angle.bg : "bg-slate-100 group-hover:bg-slate-300"
        } ${angle.dot}`} />

        <div className="flex flex-col gap-2.5 pl-2.5">
          {/* Header: Source + Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center overflow-hidden">
                <img src={`https://www.google.com/s2/favicons?domain=${new URL(story.url || "https://google.com").hostname}&sz=32`} alt="" className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">{story.source}</span>
              <span className="text-[10px] font-black text-slate-300">/</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{timeAgo(story.publishedAt)}</span>
            </div>
            {score >= 7 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-full border border-red-100/50">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-600 uppercase tracking-tighter">Priority</span>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className={`text-[13px] font-bold leading-[1.45] transition-colors tracking-tight ${
            selected ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
          }`}>
            {story.title}
          </h2>

          {/* Tags / Indicators */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
              selected 
                ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-200" 
                : "bg-slate-50 text-slate-400 border-slate-100"
            }`}>
              {angle.short}
            </div>
            
            {score > 0 && (
              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                selected ? "bg-white text-blue-600 border-blue-100" : "bg-slate-50 text-slate-300 border-slate-100"
              }`}>
                Urgency <span className={selected ? "text-blue-600" : "text-slate-500"}>{score}/10</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-4 pr-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-50 space-y-5 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 bg-slate-100 rounded-md" />
              <div className="h-2.5 w-24 bg-slate-100 rounded-full" />
            </div>
            <div className="h-2 w-12 bg-slate-50 rounded-full" />
          </div>
          <div className="space-y-3">
            <div className="h-3.5 bg-slate-100 rounded-lg w-full" />
            <div className="h-3.5 bg-slate-100 rounded-lg w-4/5" />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-50 rounded-lg" />
            <div className="h-6 w-16 bg-slate-50 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
