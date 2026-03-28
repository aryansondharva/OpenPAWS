import { ANGLES } from "../utils/constants.js";

const ALL_ANGLES = [
  { value: "all", label: "All" },
  ...Object.entries(ANGLES).map(([value, cfg]) => ({ value, label: cfg.short })),
];

export default function Topbar({
  loading, meta, storyCount, daysBack, setDaysBack,
  filterAngle, setFilterAngle, filterUrgency, setFilterUrgency, onRefresh,
}) {
  return (
    <header className="border-b border-zinc-800/60 bg-zinc-900/80 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3 px-4 py-2.5">
        {/* Brand */}
        <div className="flex items-center gap-2.5 mr-2">
          <span className="text-xl">🐾</span>
          <div>
            <div className="text-sm font-semibold leading-tight text-zinc-100">OpenPAWS</div>
            <div className="text-[10px] text-zinc-500 leading-tight tracking-wide uppercase">News Engine</div>
          </div>
        </div>

        {/* Angle filter pills */}
        <div className="flex items-center gap-1 flex-wrap">
          {ALL_ANGLES.map((a) => {
            const cfg = ANGLES[a.value];
            const active = filterAngle === a.value;
            return (
              <button
                key={a.value}
                onClick={() => setFilterAngle(a.value)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all border ${
                  active
                    ? a.value === "all"
                      ? "bg-zinc-700 text-zinc-100 border-zinc-600"
                      : `${cfg.bg} ${cfg.text} ${cfg.border}`
                    : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Urgency slider */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-500 whitespace-nowrap">Min urgency</span>
            <input
              type="range" min={0} max={9} step={1} value={filterUrgency}
              onChange={(e) => setFilterUrgency(Number(e.target.value))}
              className="w-20 accent-emerald-500"
            />
            <span className="text-xs font-mono text-emerald-400 w-5">{filterUrgency}+</span>
          </div>

          {/* Days selector */}
          <select
            value={daysBack}
            onChange={(e) => setDaysBack(Number(e.target.value))}
            className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            <option value={1}>Last 24h</option>
            <option value={3}>Last 3 days</option>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
          </select>

          {/* Story count */}
          <span className="text-xs text-zinc-500">{storyCount} stories</span>
          {meta?.fromCache && <span className="text-[10px] text-zinc-600 italic">cached</span>}

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-primary py-1.5 text-xs"
          >
            <span className={`text-base leading-none ${loading ? "animate-spin" : ""}`}>↻</span>
            {loading ? "Fetching..." : "Refresh"}
          </button>
        </div>
      </div>
    </header>
  );
}
