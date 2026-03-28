import { useState } from "react";
import { useStories, generateContent } from "./hooks/useStories.js";
import Sidebar from "./components/Sidebar.jsx";
import StoryPanel from "./components/StoryPanel.jsx";
import ContentPanel from "./components/ContentPanel.jsx";
import Topbar from "./components/Topbar.jsx";

export default function App() {
  const [daysBack, setDaysBack] = useState(7);
  const [filterAngle, setFilterAngle] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState(0);
  const [selectedStory, setSelectedStory] = useState(null);
  const [content, setContent] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState(null);

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

  return (
    <div className="h-screen flex flex-col bg-zinc-950 overflow-hidden">
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

      {(error || genError) && (
        <div className="mx-4 mt-2 px-4 py-2.5 bg-red-950/60 border border-red-800/50 rounded-xl text-red-300 text-sm flex items-center gap-2">
          <span className="text-red-400">⚠</span>
          {error || genError}
          <button onClick={() => { }} className="ml-auto text-red-500 hover:text-red-300 text-xs">dismiss</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Story list */}
        <div className="w-[380px] flex-shrink-0 border-r border-zinc-800/60 overflow-y-auto">
          <Sidebar
            stories={filtered}
            loading={loading}
            selectedId={selectedStory?.id}
            onSelect={handleSelect}
          />
        </div>

        {/* Right side: story detail + content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {selectedStory ? (
            <>
              <StoryPanel story={selectedStory} onGenerate={handleGenerate} generating={generating} hasContent={!!content} />
              {(content || generating) && (
                <ContentPanel content={content} generating={generating} />
              )}
            </>
          ) : (
            <Welcome />
          )}
        </div>
      </div>
    </div>
  );
}

function Welcome() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center px-12 gap-4">
      <div className="text-5xl">🐾</div>
      <div className="text-xl font-semibold text-zinc-200">News Opportunism Engine</div>
      <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
        Select a story from the feed on the left. The 24–48 hour advocacy window opens the moment a story breaks.
      </p>
    </div>
  );
}
