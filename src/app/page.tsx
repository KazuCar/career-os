"use client";

import { useEffect, useState } from "react";

type Draft = { summary: string; jobSummary: string; bullets: string[]; skills: string[] };
type ApiResp = { ok: boolean; inputPreview: string; draft: Draft };

type SavedItem = { id: string; text: string; draft: Draft; createdAt: string };
const STORAGE_KEY = "career-os:saved";

/* ---------- util ---------- */
function toMarkdown(d: Draft): string {
  return [
    "# ドラフト（プレビュー）",
    "",
    `**総括**: ${d.summary}`,
    "",
    `**職務サマリ**: ${d.jobSummary}`,
    "",
    "**実績**",
    ...d.bullets.map((b) => `- ${b}`),
    "",
    `**スキル**: ${d.skills.join(", ")}`,
    "",
  ].join("\n");
}
async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}
function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
function getSaved(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as SavedItem[]) : [];
  } catch {
    return [];
  }
}
function saveItem(text: string, draft: Draft): SavedItem {
  const id = globalThis.crypto?.randomUUID?.() ? crypto.randomUUID() : String(Date.now());
  const item: SavedItem = { id, text, draft, createdAt: new Date().toISOString() };
  const next = [item, ...getSaved()].slice(0, 50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return item;
}

/* ---------- toast ---------- */
type Toast = { msg: string; kind: "ok" | "ng" } | null;

export default function Home() {
  const [text, setText] = useState("");
  const [data, setData] = useState<ApiResp | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<SavedItem[]>([]);
  const [toast, setToast] = useState<Toast>(null);

  useEffect(() => {
    setSaved(getSaved());
  }, []);

  function showToast(msg: string, kind: "ok" | "ng" = "ok") {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 1500);
  }

  async function handleGenerate() {
    if (loading) return; // 二重送信防止
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
      showToast("作成完了", "ok");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : typeof e === "string" ? e : JSON.stringify(e);
      setErr(String(msg));
      showToast("作成に失敗しました", "ng");
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
          onChange={(e) => setText(e.target.va
