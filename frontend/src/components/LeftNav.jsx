import React from "react";
import { useSettings } from "../context/SettingsContext";

const NAV_ITEMS = [
  { id: "feed", label: "Feed", icon: "📨" },
  { id: "history", label: "History", icon: "📋" },
  { id: "webhooks", label: "Push Alerts", icon: "🔔" },
  { id: "keywords", label: "Keywords", icon: "🏷️" },
  { id: "discover", label: "Discover", icon: "🌍" },
];

export default function LeftNav({ onOpenSettings, onOpenHistory, onOpenWebhooks, onOpenKeywords }) {
  const { settings } = useSettings();

  const handleNavClick = (id) => {
    switch (id) {
      case "history": onOpenHistory?.(); break;
      case "webhooks": onOpenWebhooks?.(); break;
      case "keywords": onOpenKeywords?.(); break;
      default: break;
    }
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-[100] flex group transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:w-64 w-20">
      <div className="flex flex-col h-full w-full bg-white/80 backdrop-blur-2xl border-r border-slate-100 shadow-[20px_0_40px_-10px_rgba(0,0,0,0.03)] overflow-hidden">
        
        {/* Brand Container */}
        <div className="px-5 py-8 flex items-center overflow-hidden h-24">
          <div className="w-10 h-10 bg-blue-600 flex items-center justify-center rounded-2xl text-white shadow-lg shadow-blue-200 shrink-0 group-hover:rotate-[360deg] transition-transform duration-700">
            <span className="text-xl">⚡</span>
          </div>
          <div className="ml-4 text-xl font-black text-slate-900 tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
            Open<span className="text-blue-600">PAWS</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3.5 space-y-2 mt-4 overflow-y-auto no-scrollbar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center w-full rounded-2xl transition-all duration-300 group/btn h-12 relative overflow-hidden ${
                item.id === "feed"
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="w-[52px] h-full flex items-center justify-center shrink-0">
                <span className={`text-xl transition-all duration-500 ${item.id === 'feed' ? 'scale-110' : 'grayscale group-hover/btn:grayscale-0 group-hover/btn:scale-110 opacity-70 group-hover/btn:opacity-100'}`}>
                  {item.icon}
                </span>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap ml-1">
                {item.label}
              </span>
              
              {/* Active Indicator Strip */}
              {item.id === "feed" && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-blue-600 rounded-r-full" />
              )}

              {/* Notification dot for push alerts */}
              {item.id === "webhooks" && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </button>
          ))}

          {/* Separator */}
          <div className="mx-2 my-8 border-t border-slate-50 transition-all opacity-0 group-hover:opacity-100" />

          {/* Intelligence Topics (Expand Only) */}
          <div className="px-2 space-y-6 opacity-0 group-hover:opacity-100 transition-all duration-500">
            <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] whitespace-nowrap pl-2">
              Analytic Topics
            </h4>
            <div className="space-y-4">
              {["Climate Policy", "Tech Regulation", "Election Cycle", "Global Trade"].map((topic) => (
                <button 
                  key={topic} 
                  className="flex items-center gap-4 group/topic text-slate-400 hover:text-blue-600 transition-all whitespace-nowrap pl-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/topic:bg-blue-400 transition-colors shrink-0" />
                  <span className="text-[11px] font-bold tracking-tight">{topic}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* User Card Area */}
        <div className="p-3.5 mt-auto mb-6">
          <div className="relative group/card flex items-center p-2 rounded-[28px] transition-all bg-white border border-transparent group-hover:border-slate-100 group-hover:shadow-2xl group-hover:shadow-slate-200/50">
            <div 
              className="w-10 h-10 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0 cursor-pointer hover:border-blue-400 transition-all duration-500"
              onClick={onOpenSettings}
            >
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${settings.operatorName}`} 
                alt="avatar" 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" 
              />
            </div>
            
            <div className="ml-4 overflow-hidden opacity-0 group-hover:opacity-100 transition-all duration-500 whitespace-nowrap">
              <div className="text-[12px] font-black text-slate-900 tracking-tight leading-none mb-1">{settings.operatorName}</div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <div className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">{settings.operatorId}</div>
              </div>
            </div>

            {/* Quick Settings Icon (Collapsed) */}
            {!window.matchMedia("(min-width: 1024px)").matches && (
               <button 
                onClick={onOpenSettings}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
              >
                <span className="text-[10px]">⚙️</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
