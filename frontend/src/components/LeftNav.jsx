import React from "react";
import { useSettings } from "../context/SettingsContext";

const NAV_ITEMS = [
  { id: "feed", label: "Feed", icon: "📨" },
  { id: "saved", label: "Saved", icon: "🔖" },
  { id: "discover", label: "Discover", icon: "🌍" },
  { id: "tags", label: "Tags", icon: "🏷️" },
];

export default function LeftNav({ onOpenSettings }) {
  const { settings } = useSettings();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col gap-6 py-2">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-4 group cursor-pointer">
        <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-lg text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
          <span className="text-lg">⚡</span>
        </div>
        <div className="text-xl font-black text-slate-900 leading-none tracking-tighter">
          Open<span className="text-blue-600">PAWS</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex flex-col gap-1.5 pt-4">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`flex items-center gap-4 px-3.5 py-2.5 rounded-2xl transition-all group ${
              item.id === "feed"
                ? "bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100/50"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform grayscale group-hover:grayscale-0">{item.icon}</span>
            <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Topics / Tags Section */}
      <div className="mt-8 px-3 space-y-6">
        <div className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] px-1 flex items-center justify-between">
          <span>Intelligence Topics</span>
        </div>
        <div className="flex flex-col gap-3">
          {["Climate Policy", "Tech Regulation", "Election Cycle", "Global Trade"].map((topic) => (
            <button key={topic} className="flex items-center gap-3 group text-slate-400 hover:text-blue-600 transition-all hover:translate-x-1 decoration-blue-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-blue-400 transition-colors" />
              <span className="text-xs font-bold">{topic}</span>
            </button>
          ))}
        </div>
      </div>

      {/* User Status Card */}
      <div className="mt-auto p-4 border border-slate-100 rounded-[28px] bg-white shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 space-y-5">
        <div className="flex items-center gap-3 px-1">
          <div className="w-12 h-12 rounded-[18px] bg-slate-50 overflow-hidden border border-slate-100 shadow-inner group cursor-pointer hover:border-blue-300 transition-all duration-500">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${settings.operatorName}`} 
              alt="avatar" 
              className="group-hover:scale-110 transition-transform duration-500" 
            />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-black text-slate-900 tracking-tight">{settings.operatorName}</div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">{settings.operatorId}</div>
            </div>
          </div>
        </div>
        <button 
          onClick={onOpenSettings}
          className="w-full py-3 bg-slate-900 text-white rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:bg-slate-800 active:scale-[0.98] shadow-lg shadow-slate-200"
        >
          Settings
        </button>
      </div>
    </aside>
  );
}
