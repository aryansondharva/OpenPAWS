import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../utils/api.js";

export function useStories(daysBack) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const fetch = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = apiUrl(`/api/stories?days=${daysBack}${refresh ? "&refresh=true" : ""}`);
      const res = await window.fetch(url);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setStories(data.stories || []);
      setMeta({ fromCache: data.fromCache, total: data.total, sources: data.sources });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [daysBack]);

  useEffect(() => { fetch(); }, [fetch]);

  return { stories, loading, error, meta, refetch: fetch };
}

export async function generateContent(story) {
  const res = await window.fetch(apiUrl("/api/generate"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ story }),
  });
  if (!res.ok) throw new Error(`Generation failed: ${res.status}`);
  const data = await res.json();
  return data.content;
}

