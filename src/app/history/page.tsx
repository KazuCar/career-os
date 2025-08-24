"use client";

import { useEffect, useState } from "react";

type Draft = { summary: string; jobSummary: string; bullets: string[]; skills: string[] };
type SavedItem = { id: string; text: string; draft: Draft; createdAt: string };

const STORAGE_KEY = "career-os:saved";

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

export default function HistoryPage() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    setItems(getSaved());
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: 16, lineHeight: 1.6 }}>
      <h1>履歴（ブラウザ保存）</h1>
      <p style={{ color: "#666", marginTop: 4 }}>
        この一覧はこのブラウザに保存されたデータを表示します（他端末には同期されません）。
      </p>

      {items.length === 0 ? (
        <p style={{ marginTop: 16 }}>まだ保存はありません。</p>
      ) : (
        <ul style={{ marginTop: 16 }}>
          {items.map((s) => (
            <li key={s.id} style={{ marginBottom: 16, listStyle: "none" }}>
              <div>
                <strong>{new Date(s.createdAt).toLocaleString()}</strong>
              </div>

              <details style={{ marginTop: 6 }}>
                <summary>入力テキストを見る</summary>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    background: "#f6f6f6",
                    padding: 12,
                    borderRadius: 8,
                    marginTop: 6,
                  }}
                >
                  {s.text}
                </pre>
              </details>

              <details style={{ marginTop: 6 }}>
                <summary>ドラフトを見る</summary>
                <div style={{ marginTop: 6 }}>
                  <p><strong>総括:</strong> {s.draft.summary}</p>
                  <p><strong>職務サマリ:</strong> {s.draft.jobSummary}</p>
                  <p><strong>実績:</strong></p>
                  <ul>
                    {s.draft.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                  <p><strong>スキル:</strong> {s.draft.skills.join(", ")}</p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
