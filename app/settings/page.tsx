"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ llmProvider: "openrouter", llmModel: "google/gemini-2.5-pro", llmApiKey: "" });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data) setForm({ llmProvider: data.llmProvider, llmModel: data.llmModel, llmApiKey: data.llmApiKey || "" });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setMessage(null);
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, llmApiKey: form.llmApiKey || null }),
    });
    if (res.ok) setMessage("Saved"); else setMessage("Failed to save");
  };

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 720 }}>
      <h1>Settings</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            Provider
            <select
              value={form.llmProvider}
              onChange={(e) => setForm((f) => ({ ...f, llmProvider: e.target.value }))}
            >
              <option value="openrouter">OpenRouter</option>
              <option value="mistral">Mistral</option>
            </select>
          </label>

          <label>
            Model
            <input
              type="text"
              value={form.llmModel}
              onChange={(e) => setForm((f) => ({ ...f, llmModel: e.target.value }))}
            />
          </label>

          <label>
            API Key (optional for BYO)
            <input
              type="password"
              value={form.llmApiKey}
              onChange={(e) => setForm((f) => ({ ...f, llmApiKey: e.target.value }))}
            />
          </label>

          <button onClick={save}>Save</button>
          {message && <p>{message}</p>}
        </div>
      )}
    </main>
  );
}
