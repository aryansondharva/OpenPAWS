import { useState } from "react";
import { useStories, generateContent } from "./hooks/useStories.js";
import LeftNav from "./components/LeftNav.jsx";
import Topbar from "./components/Topbar.jsx";
import Sidebar from "./components/Sidebar.jsx";
import StoryPanel from "./components/StoryPanel.jsx";
import ContentPanel from "./components/ContentPanel.jsx";
import Settings from "./components/Settings.jsx";
import AlertBanner from "./components/AlertBanner.jsx";
import ContentHistory from "./components/ContentHistory.jsx";
import WebhookManager from "./components/WebhookManager.jsx";
import KeywordManager from "./components/KeywordManager.jsx";


export default function App() {
  const [daysBack, setDaysBack] = useState(7);
  const [filterAngle, setFilterAngle] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState(0);
  const [selectedStory, setSelectedStory] = useState(null);
  const [content, setContent] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showWebhooks, setShowWebhooks] = useState(false);
  const [showKeywords, setShowKeywords] = useState(false);


  const { stories, loading, error, meta, refetch } = useStories(daysBack);

  const filtered = stories.filter((s) => {
    const angleOk = filterAngle === "all" || s.classification?.angle === filterAngle;
    const urgencyOk = (s.classification?.urgency_score || 0) >= filterUrgency;
    return angleOk && urgencyOk;
  });

  const handleSelect = (story) => {
    setSelectedStory(story);
    setContent(null);
    setGenError(null);
  };

  const handleGenerate = async () => {
    if (!selectedStory) return;
    setGenerating(true);
    setContent(null);
    setGenError(null);
    try {
      const result = await generateContent(selectedStory);
      setContent(result);
    } catch (err) {
      setGenError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  // Load content from history
  const handleLoadFromHistory = (entry) => {
    setSelectedStory(entry.story);
    setContent(entry.content);
    setGenError(null);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      <Topbar
        loading={loading}
        meta={meta}
        storyCount={filtered.length}
        daysBack={daysBack}
        setDaysBack={setDaysBack}
        filterAngle={filterAngle}
        setFilterAngle={setFilterAngle}
        filterUrgency={filterUrgency}
        setFilterUrgency={setFilterUrgency}
        onRefresh={() => refetch(true)}
      />

      {/* Urgency Alert Banner */}
      <AlertBanner stories={stories} />

      {(error || genError) && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <span className="text-lg">!</span>
          </div>
          <span className="font-semibold">{error || genError}</span>
          <button onClick={() => { setGenError(null); }} className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-bold transition-colors uppercase tracking-widest">dismiss</button>
        </div>
      )}

      <main className="flex flex-1 overflow-hidden p-5 pl-24 gap-5">
        {/* Left Column: Navigation (Fixed Component) */}
        <LeftNav
          onOpenSettings={() => setShowSettings(true)}
          onOpenHistory={() => setShowHistory(true)}
          onOpenWebhooks={() => setShowWebhooks(true)}
          onOpenKeywords={() => setShowKeywords(true)}
        />


        {/* Center Column: News Feed */}
        <div className="flex-[55] flex flex-col overflow-hidden">

          <div className="flex items-center justify-between mb-4 px-1">
            <div className="space-y-1">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Signal Feed</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">{filtered.length} stories synchronized</p>
              </div>
            </div>
            <div className="flex p-0.5 bg-slate-100/50 rounded-xl border border-slate-100">
              <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Relevant</button>
              <button className="px-3.5 py-1.5 text-[9px] font-black uppercase tracking-widest bg-white text-blue-600 rounded-lg shadow-sm border border-slate-200/50">Latest</button>
              <button className="px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Urgent</button>
            </div>
          </div>
          <Sidebar
            stories={filtered}
            loading={loading}
            selectedId={selectedStory?.id}
            onSelect={handleSelect}
          />
        </div>

        {/* Right Column: Detailed Intelligence Panel */}
        <div className="flex-[45] flex-shrink-0 flex flex-col bg-white rounded-[28px] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-y-auto overflow-x-hidden custom-scrollbar">

          {selectedStory ? (
            <div className="flex flex-col animate-in fade-in zoom-in-95 duration-700 w-full">
              <StoryPanel story={selectedStory} onGenerate={handleGenerate} generating={generating} hasContent={!!content} />
              {(content || generating) && (
                <ContentPanel content={content} generating={generating} />
              )}
            </div>
          ) : (
            <Welcome />
          )}
        </div>
      </main>

      {/* Modals */}
      <Settings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <ContentHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onLoadContent={handleLoadFromHistory}
      />
      <WebhookManager isOpen={showWebhooks} onClose={() => setShowWebhooks(false)} />
      <KeywordManager
        isOpen={showKeywords}
        onClose={() => setShowKeywords(false)}
        onKeywordsChanged={() => refetch(true)}
      />
    </div>

  );
}


function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-10 py-10 bg-white animate-in fade-in duration-1000">
      <div className="w-20 h-20 bg-blue-50/50 rounded-[28px] flex items-center justify-center mb-6 border border-blue-100/50 shadow-lg shadow-blue-900/5">
        <span className="text-3xl">📡</span>
      </div>

      <div className="space-y-3 max-w-xs">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Awaiting Selection
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
          Select a signal from the feed to initialize strategic analysis and narrative extraction.
        </p>
      </div>

      <div className="flex gap-4 mt-8">
        <div className="px-4 py-2 bg-slate-50 rounded-xl flex items-center gap-2.5 border border-slate-100 transition-all hover:bg-slate-100">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Live Stream Active</span>
        </div>
      </div>
    </div>
  );
}
