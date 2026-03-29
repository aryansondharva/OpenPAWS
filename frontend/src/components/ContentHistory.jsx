import { useState, useEffect, useCallback } from "react";
import { timeAgo, ANGLES } from "../utils/constants.js";
import { apiUrl } from "../utils/api.js";

const API = apiUrl("/api/history");

export default function ContentHistory({ isOpen, onClose, onLoadContent }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [exportingId, setExportingId] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen, fetchHistory]);

  const deleteEntry = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const clearAll = async () => {
    if (!confirm("Clear entire generation history?")) return;
    try {
      await fetch(API, { method: "DELETE" });
      setHistory([]);
    } catch (err) {
      console.error("Clear all failed:", err);
    }
  };

  // ── Export Functions ──

  const exportAsMarkdown = (entry) => {
    const md = generateMarkdown(entry);
    downloadFile(`openpaws-${slugify(entry.story.title)}.md`, md, "text/markdown");
  };

  const exportAsJSON = (entry) => {
    const json = JSON.stringify(entry, null, 2);
    downloadFile(`openpaws-${slugify(entry.story.title)}.json`, json, "application/json");
  };

  const exportAsText = (entry) => {
    const txt = generatePlainText(entry);
    downloadFile(`openpaws-${slugify(entry.story.title)}.txt`, txt, "text/plain");
  };

  const copyAsMarkdown = (entry) => {
    const md = generateMarkdown(entry);
    navigator.clipboard.writeText(md);
    setExportingId(entry.id);
    setTimeout(() => setExportingId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[80vh] bg-white rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Generation History</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {history.length} saved {history.length === 1 ? "generation" : "generations"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
              >
                Clear All
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading History...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-4xl">📋</div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">No History Yet</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider max-w-[280px]">
                  Generated content will be automatically saved here for future reference and export.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, i) => {
                const isExpanded = expandedId === entry.id;
                const angle = ANGLES[entry.story.classification?.angle] || ANGLES.welfare;
                const score = entry.story.classification?.urgency_score || 0;

                return (
                  <div
                    key={entry.id}
                    className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-slate-200 transition-all"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {/* Entry header */}
                    <div
                      className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/50 transition-all"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      {/* Score badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                        score >= 8 ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                      }`}>
                        {score}
                      </div>

                      {/* Story info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{entry.story.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                            {entry.story.source}
                          </span>
                          <span className="text-slate-200">•</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            angle === ANGLES.welfare ? "text-purple-500 bg-purple-50" : "text-blue-500 bg-blue-50"
                          }`}>
                            {angle.short}
                          </span>
                          <span className="text-slate-200">•</span>
                          <span className="text-[9px] font-bold text-slate-400">
                            Generated {timeAgo(entry.generatedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); copyAsMarkdown(entry); }}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                            exportingId === entry.id
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                              : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 border border-slate-100"
                          }`}
                        >
                          {exportingId === entry.id ? "✓ Copied" : "Copy MD"}
                        </button>
                        <button
                          onClick={(e) => deleteEntry(entry.id, e)}
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <svg className={`w-4 h-4 text-slate-300 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded content preview + export options */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/30 animate-in slide-in-from-top-4 duration-300">
                        {/* Export toolbar */}
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-white/50">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Export:</span>
                          <button
                            onClick={() => exportAsMarkdown(entry)}
                            className="text-[10px] font-bold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all"
                          >
                            📄 Markdown
                          </button>
                          <button
                            onClick={() => exportAsText(entry)}
                            className="text-[10px] font-bold px-3 py-1.5 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                          >
                            📝 Plain Text
                          </button>
                          <button
                            onClick={() => exportAsJSON(entry)}
                            className="text-[10px] font-bold px-3 py-1.5 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                          >
                            {"{ }"} JSON
                          </button>
                          {onLoadContent && (
                            <button
                              onClick={() => { onLoadContent(entry); onClose(); }}
                              className="ml-auto text-[10px] font-bold px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                            >
                              ↩ Load in Editor
                            </button>
                          )}
                        </div>

                        {/* Content preview */}
                        <div className="px-5 py-4 space-y-4">
                          {/* Twitter preview */}
                          {entry.content?.twitter_thread && (
                            <div className="space-y-2">
                              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Twitter Thread Preview</h4>
                              <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2">
                                {entry.content.twitter_thread.slice(0, 2).map((tweet, i) => (
                                  <p key={i} className="text-xs text-slate-600 leading-relaxed">
                                    <span className="text-[10px] font-bold text-blue-500 mr-1">{i + 1}.</span>
                                    {tweet.slice(0, 120)}{tweet.length > 120 ? "..." : ""}
                                  </p>
                                ))}
                                {entry.content.twitter_thread.length > 2 && (
                                  <p className="text-[10px] font-bold text-slate-400">
                                    + {entry.content.twitter_thread.length - 2} more tweets
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Press headline */}
                          {entry.content?.press_statement?.headline && (
                            <div className="space-y-2">
                              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Press Statement</h4>
                              <p className="text-xs font-bold text-slate-700">{entry.content.press_statement.headline}</p>
                            </div>
                          )}

                          {/* Op-Ed headline */}
                          {entry.content?.op_ed?.headline && (
                            <div className="space-y-2">
                              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Op-Ed</h4>
                              <p className="text-xs font-bold text-slate-700">{entry.content.op_ed.headline}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper functions ──

function slugify(str) {
  return (str || "untitled")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateMarkdown(entry) {
  const { story, content, generatedAt } = entry;
  const lines = [];

  lines.push(`# ${story.title}`);
  lines.push("");
  lines.push(`**Source:** ${story.source} | **Generated:** ${new Date(generatedAt).toLocaleString()}`);
  lines.push(`**Angle:** ${story.classification?.angle || "N/A"} | **Urgency:** ${story.classification?.urgency_score || "N/A"}/10`);
  if (story.url) lines.push(`**Original:** ${story.url}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Twitter Thread
  if (content?.twitter_thread) {
    lines.push("## 🐦 Twitter Thread");
    lines.push("");
    content.twitter_thread.forEach((tweet, i) => {
      lines.push(`**${i + 1}/${content.twitter_thread.length}**`);
      lines.push(tweet);
      lines.push("");
    });
    lines.push("---");
    lines.push("");
  }

  // Press Statement
  if (content?.press_statement) {
    const ps = content.press_statement;
    lines.push("## 📰 Press Statement");
    lines.push("");
    if (ps.headline) lines.push(`### ${ps.headline}`);
    if (ps.dateline) lines.push(`*${ps.dateline}*`);
    lines.push("");
    if (ps.lead_paragraph) lines.push(ps.lead_paragraph);
    lines.push("");
    if (ps.context_paragraph) lines.push(ps.context_paragraph);
    lines.push("");
    if (ps.quote_paragraph) lines.push(`> ${ps.quote_paragraph}`);
    lines.push("");
    if (ps.call_to_action) lines.push(`**Call to Action:** ${ps.call_to_action}`);
    lines.push("");
    if (ps.boilerplate) lines.push(`*${ps.boilerplate}*`);
    lines.push("");
    if (ps.contact) lines.push(`**${ps.contact}**`);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Op-Ed
  if (content?.op_ed) {
    const op = content.op_ed;
    lines.push("## ✍️ Op-Ed Angles");
    lines.push("");
    if (op.headline) lines.push(`### ${op.headline}`);
    if (op.angle_summary) lines.push(`*${op.angle_summary}*`);
    lines.push("");
    if (op.opening_line) lines.push(`> ${op.opening_line}`);
    lines.push("");
    if (op.talking_points) {
      lines.push("#### Talking Points");
      op.talking_points.forEach((pt, i) => {
        lines.push(`${i + 1}. ${pt}`);
      });
      lines.push("");
    }
    if (op.suggested_outlets) {
      lines.push(`**Target Outlets:** ${op.suggested_outlets.join(", ")}`);
      lines.push("");
    }
    if (op.pitch_note) lines.push(`**Pitch Note:** ${op.pitch_note}`);
  }

  lines.push("");
  lines.push("---");
  lines.push("*Generated by OpenPAWS News Opportunism Engine*");

  return lines.join("\n");
}

function generatePlainText(entry) {
  const { story, content, generatedAt } = entry;
  const lines = [];

  lines.push(story.title.toUpperCase());
  lines.push("=".repeat(story.title.length));
  lines.push("");
  lines.push(`Source: ${story.source}`);
  lines.push(`Generated: ${new Date(generatedAt).toLocaleString()}`);
  lines.push(`Angle: ${story.classification?.angle || "N/A"}`);
  lines.push(`Urgency: ${story.classification?.urgency_score || "N/A"}/10`);
  if (story.url) lines.push(`URL: ${story.url}`);
  lines.push("");

  if (content?.twitter_thread) {
    lines.push("TWITTER THREAD");
    lines.push("-".repeat(40));
    content.twitter_thread.forEach((tweet, i) => {
      lines.push(`[${i + 1}/${content.twitter_thread.length}] ${tweet}`);
      lines.push("");
    });
  }

  if (content?.press_statement) {
    const ps = content.press_statement;
    lines.push("PRESS STATEMENT");
    lines.push("-".repeat(40));
    if (ps.headline) lines.push(ps.headline);
    if (ps.dateline) lines.push(ps.dateline);
    lines.push("");
    if (ps.lead_paragraph) lines.push(ps.lead_paragraph);
    lines.push("");
    if (ps.context_paragraph) lines.push(ps.context_paragraph);
    lines.push("");
    if (ps.quote_paragraph) lines.push(`"${ps.quote_paragraph}"`);
    lines.push("");
    if (ps.call_to_action) lines.push(ps.call_to_action);
    lines.push("");
    if (ps.boilerplate) lines.push(ps.boilerplate);
    if (ps.contact) lines.push(ps.contact);
    lines.push("");
  }

  if (content?.op_ed) {
    const op = content.op_ed;
    lines.push("OP-ED ANGLES");
    lines.push("-".repeat(40));
    if (op.headline) lines.push(op.headline);
    if (op.angle_summary) lines.push(op.angle_summary);
    lines.push("");
    if (op.talking_points) {
      op.talking_points.forEach((pt, i) => lines.push(`${i + 1}. ${pt}`));
      lines.push("");
    }
    if (op.suggested_outlets) lines.push(`Target Outlets: ${op.suggested_outlets.join(", ")}`);
    if (op.pitch_note) lines.push(`Pitch: ${op.pitch_note}`);
  }

  lines.push("");
  lines.push("Generated by OpenPAWS News Opportunism Engine");

  return lines.join("\n");
}
