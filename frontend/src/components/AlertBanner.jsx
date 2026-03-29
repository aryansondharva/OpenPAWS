import { useState, useEffect, useRef } from "react";

export default function AlertBanner({ stories }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef(null);
  const prevCountRef = useRef(0);

  // Filter for high-urgency stories (8+) from the last 24 hours
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  const alerts = (stories || []).filter((s) => {
    const score = s.classification?.urgency_score || 0;
    const pubTime = new Date(s.publishedAt).getTime();
    return score >= 8 && pubTime >= cutoff && !dismissed.has(s.id);
  });

  // Request browser notification permission on mount
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Send browser notification when new alerts arrive
  useEffect(() => {
    if (alerts.length > prevCountRef.current && prevCountRef.current > 0) {
      const newest = alerts[0];
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("🚨 OpenPAWS Alert", {
          body: `${newest.title}\nUrgency: ${newest.classification?.urgency_score}/10`,
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐾</text></svg>",
        });
      }
    }
    prevCountRef.current = alerts.length;
  }, [alerts.length]);

  const dismissAll = () => {
    const ids = new Set([...dismissed, ...alerts.map((a) => a.id)]);
    setDismissed(ids);
  };

  const dismissOne = (id, e) => {
    e.stopPropagation();
    setDismissed(new Set([...dismissed, id]));
  };

  if (alerts.length === 0) return null;

  const topAlert = alerts[0];
  const topScore = topAlert.classification?.urgency_score || 0;
  const isUrgentUrgent = topScore >= 9;

  return (
    <div className={`mx-6 mt-4 rounded-2xl overflow-hidden border transition-all duration-500 ${
      isUrgentUrgent 
        ? "bg-gradient-to-r from-red-50 to-orange-50 border-red-200 shadow-lg shadow-red-100/50" 
        : "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 shadow-lg shadow-amber-100/50"
    }`}>
      {/* Main alert bar */}
      <div 
        className="flex items-center gap-4 px-5 py-3.5 cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Pulsing urgency indicator */}
        <div className="relative shrink-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            isUrgentUrgent ? "bg-red-100" : "bg-amber-100"
          }`}>
            <span className="text-lg">🚨</span>
          </div>
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white ${
            isUrgentUrgent ? "bg-red-500 animate-pulse" : "bg-amber-500"
          }`}>
            {alerts.length}
          </div>
        </div>

        {/* Alert text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
              isUrgentUrgent ? "text-red-600" : "text-amber-600"
            }`}>
              {isUrgentUrgent ? "Critical Alert" : "High Priority"}
            </span>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isUrgentUrgent ? "bg-red-500" : "bg-amber-500"
            }`} />
          </div>
          <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
            {topAlert.title}
          </p>
        </div>

        {/* Urgency score badge */}
        <div className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black ${
          isUrgentUrgent 
            ? "bg-red-100 text-red-700 border border-red-200" 
            : "bg-amber-100 text-amber-700 border border-amber-200"
        }`}>
          {topScore}/10
        </div>

        {/* Response window timer */}
        <ResponseTimer publishedAt={topAlert.publishedAt} isUrgent={isUrgentUrgent} />

        {/* Expand/collapse */}
        <button className="text-slate-400 hover:text-slate-600 transition-colors p-1">
          <svg className={`w-4 h-4 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dismiss all */}
        <button 
          onClick={(e) => { e.stopPropagation(); dismissAll(); }}
          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
            isUrgentUrgent 
              ? "text-red-500 hover:bg-red-100" 
              : "text-amber-500 hover:bg-amber-100"
          }`}
        >
          Dismiss All
        </button>
      </div>

      {/* Expanded alert list */}
      {expanded && (
        <div className="border-t border-slate-100 bg-white/60 max-h-[300px] overflow-y-auto custom-scrollbar">
          {alerts.map((alert, i) => {
            const score = alert.classification?.urgency_score || 0;
            const angle = alert.classification?.angle?.replace("_", " ") || "";
            return (
              <div
                key={alert.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-white/80 transition-all group/item"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                {/* Score indicator */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                  score >= 9 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                }`}>
                  {score}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{alert.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{alert.source}</span>
                    <span className="text-[10px] font-bold text-slate-300">•</span>
                    <span className="text-[10px] font-bold text-slate-400 capitalize">{angle}</span>
                    <span className="text-[10px] font-bold text-slate-300">•</span>
                    <ResponseTimer publishedAt={alert.publishedAt} isUrgent={score >= 9} compact />
                  </div>
                </div>

                {/* Source link */}
                {alert.url && (
                  <a
                    href={alert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] font-bold text-blue-600 hover:underline shrink-0"
                  >
                    Read ↗
                  </a>
                )}

                {/* Dismiss single */}
                <button
                  onClick={(e) => dismissOne(alert.id, e)}
                  className="text-slate-300 hover:text-slate-500 transition-colors opacity-0 group-hover/item:opacity-100"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Shows remaining time in the 48-hour response window
 */
function ResponseTimer({ publishedAt, isUrgent, compact = false }) {
  const published = new Date(publishedAt).getTime();
  const elapsed = Date.now() - published;
  const windowMs = 48 * 60 * 60 * 1000; // 48 hours
  const remaining = windowMs - elapsed;
  const hoursLeft = Math.max(0, Math.floor(remaining / (60 * 60 * 1000)));
  const minsLeft = Math.max(0, Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)));

  let color, label;
  if (hoursLeft <= 0) {
    color = "text-slate-400";
    label = "Window closed";
  } else if (hoursLeft <= 12) {
    color = isUrgent ? "text-red-600" : "text-red-500";
    label = compact ? `${hoursLeft}h left` : `${hoursLeft}h ${minsLeft}m left`;
  } else if (hoursLeft <= 24) {
    color = "text-amber-600";
    label = compact ? `${hoursLeft}h left` : `${hoursLeft}h remaining`;
  } else {
    color = "text-emerald-600";
    label = compact ? `${hoursLeft}h left` : `${hoursLeft}h remaining`;
  }

  if (compact) {
    return <span className={`text-[10px] font-bold ${color}`}>{label}</span>;
  }

  return (
    <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
      hoursLeft <= 12 
        ? "bg-red-50 border border-red-100" 
        : hoursLeft <= 24 
          ? "bg-amber-50 border border-amber-100" 
          : "bg-emerald-50 border border-emerald-100"
    } ${color}`}>
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {label}
    </div>
  );
}
