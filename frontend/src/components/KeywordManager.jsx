import { useState, useEffect, useCallback, useRef } from "react";
import { apiUrl } from "../utils/api.js";

// Default keyword categories for visual grouping
const CATEGORIES = {
  "Disease & Outbreaks": ["bird flu", "avian flu", "avian influenza", "h5n1", "h5n2", "hpai", "zoonotic", "zoonosis", "livestock disease", "poultry disease"],
  "Factory Farming": ["factory farm", "factory farming", "undercover investigation", "undercover footage", "animal cruelty", "slaughterhouse", "concentrated animal", "cafo", "feedlot"],
  "Species & Industry": ["livestock", "poultry", "cattle", "pig farm", "chicken farm", "dairy farm", "egg industry", "meat industry", "veal", "gestation crate", "farmed animals", "animal agriculture", "animal farming"],
  "Environment": ["livestock methane", "cattle deforestation", "animal agriculture climate", "meat emissions", "livestock emissions", "manure lagoon", "runoff"],
  "Welfare & Legal": ["animal welfare", "animal rights", "cage free", "free range", "humane slaughter", "ag-gag", "farm sanctuary"],
  "Health & Safety": ["salmonella", "antibiotic resistance", "food recall", "meat recall", "food safety", "antibiotic livestock"],
  "Companies": ["tyson foods", "jbs", "perdue", "smithfield", "cargill", "pilgrim", "meat packer", "poultry company"],
  "Policy": ["farm bill", "epa livestock", "cafo regulation", "animal protection law"],
};

export default function KeywordManager({ isOpen, onClose, onKeywordsChanged }) {
  const [keywords, setKeywords] = useState([]);
  const [defaults, setDefaults] = useState([]);
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const inputRef = useRef(null);

  const fetchKeywords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/keywords"));
      const data = await res.json();
      setKeywords(data.keywords || []);
      setDefaults(data.defaults || []);
      setIsCustom(data.isCustom);
      setHasChanges(false);
    } catch (err) {
      console.error("Failed to load keywords:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchKeywords();
  }, [isOpen, fetchKeywords]);

  const saveKeywords = async () => {
    setSaving(true);
    try {
      await fetch(apiUrl("/api/keywords"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      setIsCustom(true);
      setHasChanges(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onKeywordsChanged?.();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    try {
      await fetch(apiUrl("/api/keywords"), { method: "DELETE" });
      setKeywords([...defaults]);
      setIsCustom(false);
      setHasChanges(false);
      onKeywordsChanged?.();
    } catch (err) {
      console.error("Reset failed:", err);
    }
  };

  const addKeyword = (e) => {
    e.preventDefault();
    const kw = newKeyword.trim().toLowerCase();
    if (kw && !keywords.includes(kw)) {
      setKeywords((prev) => [...prev, kw]);
      setHasChanges(true);
      setNewKeyword("");
    }
  };

  const removeKeyword = (kw) => {
    setKeywords((prev) => prev.filter((k) => k !== kw));
    setHasChanges(true);
  };

  const addCategory = (category) => {
    const categoryKeywords = CATEGORIES[category] || [];
    const newKeywords = categoryKeywords.filter((kw) => !keywords.includes(kw));
    if (newKeywords.length > 0) {
      setKeywords((prev) => [...prev, ...newKeywords]);
      setHasChanges(true);
    }
  };

  const removeCategory = (category) => {
    const categoryKeywords = new Set(CATEGORIES[category] || []);
    setKeywords((prev) => prev.filter((kw) => !categoryKeywords.has(kw)));
    setHasChanges(true);
  };

  const getCategoryStats = (category) => {
    const categoryKeywords = CATEGORIES[category] || [];
    const activeCount = categoryKeywords.filter((kw) => keywords.includes(kw)).length;
    return { active: activeCount, total: categoryKeywords.length };
  };

  // Filter keywords by search
  const filteredKeywords = searchFilter
    ? keywords.filter((kw) => kw.includes(searchFilter.toLowerCase()))
    : keywords;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Keyword Configuration</h2>
              {isCustom && (
                <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                  Custom
                </span>
              )}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {keywords.length} active keywords • Controls which stories appear in your feed
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={saveKeywords}
                disabled={saving}
                className={`text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-2xl transition-all shadow-lg ${
                  saved
                    ? "bg-emerald-500 text-white shadow-emerald-200"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200"
                }`}
              >
                {saving ? "Saving..." : saved ? "✓ Saved" : "Save Changes"}
              </button>
            )}
            {isCustom && (
              <button
                onClick={resetToDefaults}
                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-red-500 px-3 py-2 rounded-xl hover:bg-red-50 transition-all"
              >
                Reset
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
            >
              <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Add keyword input */}
              <form onSubmit={addKeyword} className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder='Add a keyword (e.g., "lab grown meat", "cultured meat")'
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newKeyword.trim()}
                  className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-30"
                >
                  + Add
                </button>
              </form>

              {/* Category toggles */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                  Quick Categories
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(CATEGORIES).map((category) => {
                    const { active, total } = getCategoryStats(category);
                    const isFullyActive = active === total;
                    const isPartiallyActive = active > 0 && active < total;

                    return (
                      <div
                        key={category}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                          isFullyActive
                            ? "bg-blue-50 border-blue-200"
                            : isPartiallyActive
                              ? "bg-slate-50 border-slate-200"
                              : "bg-white border-slate-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            isFullyActive ? "bg-blue-500" : isPartiallyActive ? "bg-amber-400" : "bg-slate-200"
                          }`} />
                          <span className="text-xs font-bold text-slate-700">{category}</span>
                          <span className="text-[9px] font-bold text-slate-400">
                            {active}/{total}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {!isFullyActive && (
                            <button
                              onClick={() => addCategory(category)}
                              className="text-[9px] font-bold text-blue-600 hover:bg-blue-100 px-2 py-1 rounded-lg transition-all"
                            >
                              +All
                            </button>
                          )}
                          {active > 0 && (
                            <button
                              onClick={() => removeCategory(category)}
                              className="text-[9px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                            >
                              −All
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Search + keyword tags */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    Active Keywords ({keywords.length})
                  </h3>
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter..."
                    className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-100 w-40"
                  />
                </div>

                <div className="flex flex-wrap gap-2 max-h-[240px] overflow-y-auto custom-scrollbar p-1">
                  {filteredKeywords.map((kw) => {
                    const isDefault = defaults.includes(kw);
                    return (
                      <div
                        key={kw}
                        className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isDefault
                            ? "bg-slate-50 text-slate-600 border border-slate-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        <span>{kw}</span>
                        {!isDefault && (
                          <span className="text-[8px] font-bold text-blue-400 uppercase">custom</span>
                        )}
                        <button
                          onClick={() => removeKeyword(kw)}
                          className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ml-0.5"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                  {filteredKeywords.length === 0 && (
                    <p className="text-xs text-slate-400 font-medium py-4 text-center w-full">
                      {searchFilter ? "No keywords match your filter" : "No keywords configured"}
                    </p>
                  )}
                </div>
              </div>

              {/* Info box */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">How Keywords Work</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Stories from RSS feeds and news APIs are filtered by these keywords. Only stories containing at least one keyword in their title or summary will appear in your feed. Adding more keywords broadens coverage; removing them focuses your feed on specific topics.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
