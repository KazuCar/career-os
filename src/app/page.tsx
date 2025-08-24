"use client";

import { useEffect, useState, useRef } from "react";

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
  const previewRef = useRef<HTMLDivElement | null>(null);


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
          onChange={(e) => setText(e.target.value)}
          rows={8}
          style={{ width: "100%", fontFamily: "inherit" }}
          placeholder="例）SaaS CSで解約率1.2pt改善、オンボ工数30%削減 など"
        />
      </label>

      <button
        onClick={handleGenerate}
        disabled={loading || !text.trim()}
        aria-busy={loading}
        style={{ marginTop: 12, padding: "8px 16px", opacity: loading || !text.trim() ? 0.6 : 1 }}
      >
        {loading ? "作成中..." : "ドラフトを作成"}
      </button>

      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}

      {data && (
        <section ref={previewRef} style={{ marginTop: 24 }}>
          <h2>ドラフト（プレビュー）</h2>
          <p><strong>総括:</strong> {data.draft.summary}</p>
          <p><strong>職務サマリ:</strong> {data.draft.jobSummary}</p>
          <p><strong>実績:</strong></p>
          <ul>{data.draft.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
          <p><strong>スキル:</strong> {data.draft.skills.join(", ")}</p>

          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button
              onClick={async () => {
                await copyToClipboard(toMarkdown(data.draft));
                showToast("コピーしました", "ok");
              }}
              title="Markdownをコピー"
            >
              コピー（Markdown）
            </button>
            <button
              onClick={() => {
                downloadMarkdown("career-os-draft.md", toMarkdown(data.draft));
                showToast("ダウンロード開始", "ok");
              }}
              title="Markdownで保存"
            >
              ダウンロード(.md)
            </button>
            <button
              onClick={() => {
                saveItem(text, data.draft);
                setSaved(getSaved());
                showToast("保存しました（ブラウザ）", "ok");
              }}
              title="このドラフトをブラウザに保存"
            >
              保存（ブラウザ）
            </button>
          </div>
        </section>
      )}

      {saved.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h3>最近の保存（ブラウザ）</h3>
          <ol>
            {saved.slice(0, 5).map((s) => (
              <li key={s.id} style={{ marginBottom: 8 }}>
                <time dateTime={s.createdAt}>{new Date(s.createdAt).toLocaleString()}</time>
                {" ｜ "}
                <button
                  onClick={() => {
                    setData({ ok: true, inputPreview: s.text, draft: s.draft });
                    showToast("保存データを読み込みました","ok");
                    // 状態反映後にプレビューへスクロール
                    setTimeout(() => previewRef.current?.scrollIntoView({ behavior: "smooth"}), 0);
                  }}
                >
                  ひらく
                </button>
                {" ｜ "}
                <button
                  onClick={() => {
                    const rest = getSaved().filter((x) => x.id !== s.id);
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
                    setSaved(rest);
                    showToast("削除しました", "ok");
                  }}
                >
                  削除
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            background: toast.kind === "ok" ? "#222" : "#8b0000",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,.25)",
          }}
        >
          {toast.msg}
        </div>
      )}
    </main>
  );
}
