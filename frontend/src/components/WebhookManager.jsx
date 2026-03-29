import { useState, useEffect, useCallback } from "react";
import { ANGLES } from "../utils/constants.js";

export default function WebhookManager({ isOpen, onClose }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Form state
  const [formUrl, setFormUrl] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formThreshold, setFormThreshold] = useState(8);
  const [formAngles, setFormAngles] = useState([]);

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks");
      const data = await res.json();
      setWebhooks(data.webhooks || []);
    } catch (err) {
      console.error("Failed to load webhooks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) fetchWebhooks();
  }, [isOpen, fetchWebhooks]);

  const addWebhook = async (e) => {
    e.preventDefault();
    if (!formUrl) return;
    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formUrl,
          label: formLabel,
          urgencyThreshold: formThreshold,
          angles: formAngles,
        }),
      });
      const data = await res.json();
      if (data.webhook) {
        setWebhooks((prev) => [...prev, data.webhook]);
        setFormUrl("");
        setFormLabel("");
        setFormThreshold(8);
        setFormAngles([]);
        setShowForm(false);
      }
    } catch (err) {
      console.error("Failed to add webhook:", err);
    }
  };

  const deleteWebhook = async (id) => {
    try {
      await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
      setWebhooks((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const toggleWebhook = async (id, active) => {
    try {
      const res = await fetch(`/api/webhooks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      const data = await res.json();
      if (data.webhook) {
        setWebhooks((prev) => prev.map((h) => (h.id === id ? data.webhook : h)));
      }
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const testWebhook = async (id) => {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetch(`/api/webhooks/test/${id}`, { method: "POST" });
      const data = await res.json();
      setTestResult({ id, success: data.success });
    } catch (err) {
      setTestResult({ id, success: false, error: err.message });
    } finally {
      setTestingId(null);
      setTimeout(() => setTestResult(null), 3000);
    }
  };

  const toggleAngle = (angle) => {
    setFormAngles((prev) =>
      prev.includes(angle) ? prev.filter((a) => a !== angle) : [...prev, angle]
    );
  };

  const detectType = (url) => {
    if (url.includes("hooks.slack.com")) return { icon: "💬", label: "Slack" };
    if (url.includes("discord.com/api/webhooks")) return { icon: "🎮", label: "Discord" };
    return { icon: "🔗", label: "Webhook" };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-[32px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 border border-slate-200/50">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Push Notifications</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Slack, Discord & Webhook Integrations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-5 py-2.5 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              + Add Webhook
            </button>
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {/* Add form */}
          {showForm && (
            <form onSubmit={addWebhook} className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-5 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">New Integration</h3>
                <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Webhook URL *</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/... or Discord webhook URL"
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                    required
                  />
                  {formUrl && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{detectType(formUrl).icon}</span>
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                        Detected: {detectType(formUrl).label}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Label</label>
                    <input
                      type="text"
                      value={formLabel}
                      onChange={(e) => setFormLabel(e.target.value)}
                      placeholder="e.g., Team Slack"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Min. Urgency</label>
                    <select
                      value={formThreshold}
                      onChange={(e) => setFormThreshold(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all appearance-none"
                    >
                      {[6, 7, 8, 9, 10].map((v) => (
                        <option key={v} value={v}>Urgency ≥ {v}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Filter by Angle <span className="text-slate-300">(optional — empty = all)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ANGLES).map(([key, cfg]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleAngle(key)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border ${
                          formAngles.includes(key)
                            ? "bg-blue-600 text-white border-blue-500"
                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {cfg.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
              >
                Create Integration
              </button>
            </form>
          )}

          {/* Webhook list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : webhooks.length === 0 && !showForm ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center text-4xl">🔔</div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">No Integrations Yet</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider max-w-[320px] leading-relaxed">
                Add a Slack or Discord webhook to receive automatic alerts when high-urgency stories break.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition-all"
              >
                Add Your First Webhook
              </button>
            </div>
          ) : (
            webhooks.map((hook) => {
              const type = detectType(hook.url);
              const isTestResult = testResult?.id === hook.id;

              return (
                <div
                  key={hook.id}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
                    hook.active ? "bg-white border-slate-100 hover:border-slate-200" : "bg-slate-50/50 border-slate-100 opacity-60"
                  }`}
                >
                  {/* Type icon */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shrink-0">
                    {type.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate">{hook.label}</p>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                        hook.active ? "text-emerald-600 bg-emerald-50" : "text-slate-400 bg-slate-100"
                      }`}>
                        {hook.active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-400">{type.label}</span>
                      <span className="text-slate-200">•</span>
                      <span className="text-[10px] font-bold text-slate-400">Urgency ≥ {hook.urgencyThreshold}</span>
                      {hook.angles?.length > 0 && (
                        <>
                          <span className="text-slate-200">•</span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {hook.angles.map((a) => ANGLES[a]?.short || a).join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Test button */}
                    <button
                      onClick={() => testWebhook(hook.id)}
                      disabled={testingId === hook.id}
                      className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border ${
                        isTestResult
                          ? testResult.success
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-red-50 text-red-600 border-red-100"
                          : "bg-white text-slate-500 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                      }`}
                    >
                      {testingId === hook.id ? "Testing..." : isTestResult ? (testResult.success ? "✓ Sent" : "✗ Failed") : "Test"}
                    </button>

                    {/* Toggle active */}
                    <button
                      onClick={() => toggleWebhook(hook.id, hook.active)}
                      className={`w-10 h-5 rounded-full transition-all relative ${hook.active ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${hook.active ? "left-5" : "left-0.5"}`} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => deleteWebhook(hook.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Help text */}
          {webhooks.length > 0 && (
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">How It Works</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-blue-500 mt-0.5">•</span>
                  When stories are fetched, any with urgency above your threshold trigger a notification to your webhook.
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-blue-500 mt-0.5">•</span>
                  Slack and Discord webhooks receive rich formatted messages with story details and action buttons.
                </li>
                <li className="flex items-start gap-2 text-xs text-slate-500 font-medium">
                  <span className="text-blue-500 mt-0.5">•</span>
                  Generic webhooks receive a JSON payload with story data and classification.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
