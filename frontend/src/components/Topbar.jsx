import { ANGLES } from "../utils/constants.js";

const ALL_ANGLES = [
  { value: "all", label: "All" },
  ...Object.entries(ANGLES).map(([value, cfg]) => ({ value, label: cfg.short })),
];

export default function Topbar({
  loading, storyCount, daysBack, setDaysBack,
  filterAngle, setFilterAngle, filterUrgency, setFilterUrgency, onRefresh,
}) {
  return (
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50 pl-16">
      <div className="flex items-center gap-6 px-4 py-3 max-w-[1600px] mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5 group cursor-pointer shrink-0">
          
          <div className="text-xl font-black text-slate-900 tracking-tighter">
            Open<span className="text-blue-600">PAWS</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-slate-100 hidden lg:block"></div>

        {/* Filters */}
        <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 flex-1">
          {ALL_ANGLES.map((a) => {
            const active = filterAngle === a.value;
            return (
              <button
                key={a.value}
                id={`filter-${a.value}`}
                onClick={() => setFilterAngle(a.value)}
                className={`whitespace-nowrap px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  active
                    ? "bg-slate-900 text-white shadow-xl shadow-slate-200"
                    : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                }`}
              >
                {a.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-6">
          {/* Days selector */}
          <div className="relative group">
            <select
              id="days-selector"
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              className="appearance-none text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl px-5 py-2.5 pr-10 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all cursor-pointer hover:bg-slate-100"
            >
              <option value={1}>1 Day</option>
              <option value={3}>3 Days</option>
              <option value={7}>1 Week</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 text-[8px]">▼</div>
          </div>

          {/* Refresh */}
          <button
            id="refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            className={`group relative overflow-hidden px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-200 transition-all duration-300 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50 flex items-center gap-3`}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="text-xl group-hover:rotate-180 transition-transform duration-500">↻</span>
            )}
            <span className="hidden sm:inline">{loading ? "Synchronizing" : "Refresh"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
