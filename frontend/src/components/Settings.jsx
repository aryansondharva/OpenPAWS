import React, { useState } from "react";
import { useSettings } from "../context/SettingsContext";

const TABS = [
  { id: "general", label: "General", icon: "⚙️" },
  { id: "intelligence", label: "Intelligence", icon: "🧠" },
  { id: "notifications", label: "Notifications", icon: "🔔" },
  { id: "appearance", label: "Appearance", icon: "🎨" },
];

export default function Settings({ isOpen, onClose }) {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState("general");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl h-[620px] bg-white rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex animate-in zoom-in-95 duration-500 border border-slate-200/50">
        
        {/* Modal Sidebar */}
        <aside className="w-72 bg-slate-50/50 border-r border-slate-100 flex flex-col p-8">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Settings</h2>
            <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">OpenPAWS Workspace</p>
          </div>

          <nav className="flex flex-col gap-2 flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200 border-none"
                    : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <button 
            onClick={onClose}
            className="mt-8 px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
          >
            Save & Exit
          </button>
        </aside>

        {/* Modal Content */}
        <main className="flex-1 overflow-y-auto p-12 bg-white flex flex-col">
          {activeTab === "general" && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 flex-1">
              <section>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Profile Architecture</h3>
                  <div className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase">Operational</div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Operator Name</label>
                    <input 
                      type="text" 
                      value={settings.operatorName}
                      onChange={(e) => updateSettings({ operatorName: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Display ID</label>
                    <input 
                      type="text" 
                      value={settings.operatorId}
                      onChange={(e) => updateSettings({ operatorId: e.target.value })}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300 transition-all outline-none"
                    />
                  </div>
                </div>
              </section>

              <section className="mt-4">
                <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-between group cursor-help transition-all hover:border-blue-200">
                  <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900 tracking-tight">OpenPAWS Engine Core</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Version 2.4.1 (Stable Build)</div>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                    <span className="text-xl">🛠️</span>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "intelligence" && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 flex-1">
              <section>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Intelligence Matrix</h3>
                  <div className="text-[10px] font-bold text-amber-500 bg-amber-50 px-3 py-1 rounded-full uppercase">Neural Sync</div>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Primary Reasoning Model</label>
                    <div className="relative">
                      <select 
                        value={settings.model}
                        onChange={(e) => updateSettings({ model: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-800 ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-100 transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option>Gemini 1.5 Pro</option>
                        <option>GPT-4o Intelligence</option>
                        <option>Claude 3.5 Sonnet</option>
                        <option>Mistral Large 2</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 uppercase text-[8px] font-black">Select</div>
                    </div>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Abstraction Level</label>
                      <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full tracking-widest">{settings.depth}%</span>
                    </div>
                    <div className="relative h-2 bg-slate-100 rounded-full">
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={settings.depth}
                        onChange={(e) => updateSettings({ depth: parseInt(e.target.value) })}
                        className="absolute inset-0 w-full bg-transparent appearance-none cursor-pointer z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-runnable-track]:h-2" 
                      />
                      <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${settings.depth}%` }} />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-10 animate-in slide-in-from-right-8 duration-700 flex-1">
              <section>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Environment Theme</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  {["Light", "Shadow"].map((theme) => (
                    <button 
                      key={theme}
                      onClick={() => updateSettings({ theme })}
                      className={`group relative h-36 rounded-[28px] border-2 transition-all overflow-hidden ${
                        settings.theme === theme 
                          ? "border-blue-600 bg-blue-50/20" 
                          : "border-slate-100 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className={`absolute top-0 left-0 right-0 h-16 ${theme === 'Shadow' ? 'bg-slate-900 border-b border-white/10' : 'bg-white border-b border-slate-200'}`}>
                        <div className={`mt-4 mx-4 h-2 w-20 rounded-full ${theme === 'Shadow' ? 'bg-white/20' : 'bg-slate-100'}`} />
                      </div>
                      <div className="mt-20 flex flex-col items-center gap-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{theme} Mode</span>
                        {settings.theme === theme && <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />}
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border border-slate-100 transition-all hover:bg-slate-100/50">
                  <div className="space-y-1">
                    <div className="text-sm font-black text-slate-900 tracking-tight">Interactive Glassmorphism</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enable backdrop blur effects</div>
                  </div>
                  <button 
                    onClick={() => updateSettings({ glassmorphism: !settings.glassmorphism })}
                    className={`w-12 h-6 rounded-full transition-all relative ${settings.glassmorphism ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.glassmorphism ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95 duration-700">
              <div className="w-24 h-24 bg-blue-50/50 rounded-[32px] flex items-center justify-center text-4xl shadow-xl shadow-blue-900/5 border border-blue-100/50">
                🚀
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Status Communication</h3>
                <p className="text-xs text-slate-400 font-bold max-w-[320px] uppercase tracking-wide leading-relaxed">
                  Real-time intelligence alerts are currently being routed through the main terminal.
                </p>
              </div>
              <button 
                onClick={() => updateSettings({ notifications: !settings.notifications })}
                className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  settings.notifications 
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                    : "bg-slate-900 text-white shadow-xl shadow-slate-200"
                }`}
              >
                {settings.notifications ? "Communications Active" : "Initialize Signal"}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
