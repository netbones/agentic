"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [labels, setLabels] = useState<{ id?: string; name?: string }[] | null>(null);
  const [llmInput, setLlmInput] = useState("Summarize: Hello world");
  const [llmOut, setLlmOut] = useState<string | null>(null);

  const loadLabels = async () => {
    setLabels(null);
    const res = await fetch("/api/gmail/labels");
    if (res.ok) setLabels(await res.json());
    else setLabels([]);
  };

  const runLlm = async () => {
    setLlmOut(null);
    const res = await fetch("/api/llm/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "openrouter", input: llmInput }),
    });
    const data = await res.json();
    setLlmOut(data?.text || data?.error || "");
  };

  useEffect(() => {
    // noop
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>Agentic Next</h1>

      <section style={{ marginTop: 24 }}>
        <h2>Auth</h2>
        <ul>
          <li>
            <a href="/api/auth/signin">Sign in with Google</a>
          </li>
          <li>
            <a href="/settings">Settings</a>
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>LLM Generate</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input style={{ flex: 1 }} value={llmInput} onChange={(e) => setLlmInput(e.target.value)} />
          <button onClick={runLlm}>Run</button>
        </div>
        {llmOut && (
          <pre style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>{llmOut}</pre>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Gmail</h2>
        <button onClick={loadLabels}>Load Labels</button>
        <div style={{ marginTop: 8 }}>
          {labels === null ? (
            <p>Loading…</p>
          ) : (
            <ul>
              {labels?.map((l) => (
                <li key={l.id || l.name}>{l.name}</li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
