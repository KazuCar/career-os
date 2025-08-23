"use client";

import { useState } from "react";

type Draft = {
  summary: string;
  jobSummary: string;
  bullets: string[];
  skills: string[];
};
type ApiResp = { ok: boolean; inputPreview: string; draft: Draft };

export default function Home() {
  const [text, setText] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setErr(null);
    setLoading(true);
    setData(null);
    try {
      const res = await fetch("/api/generate-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as ApiResp;
      setData(json);
    } catch (e: any) {
      setErr(e?.message ?? "unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>Career OS</h1>
      <p>転機に備えて、誇れる証拠を蓄積する。</p>

      <label style={{ display: "block", marginTop: 24 }}>
        <div>自己PRにしたい素材（箇条書きでOK）</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{ width: "100%", fontFamily: "inherit" }}
          placeholder="例）SaaS CSで解約率1.2pt改善、オンボ工数30%削減 など"
        />
      </label>

      <button
        onClick={handleGenerate}
        disabled={loading || !text.trim()}
        style={{ marginTop: 12, padding: "8px 16px" }}
      >
        {loading ? "作成中..." : "ドラフトを作成"}
      </button>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      {data && (
        <section style={{ marginTop: 24 }}>
          <h2>ドラフト（プレビュー）</h2>
          <p><strong>総括:</strong> {data.draft.summary}</p>
          <p><strong>職務サマリ:</strong> {data.draft.jobSummary}</p>
          <p><strong>実績:</strong></p>
          <ul>
            {data.draft.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <p><strong>スキル:</strong> {data.draft.skills.join(", ")}</p>
        </section>
      )}
    </main>
  );
}
