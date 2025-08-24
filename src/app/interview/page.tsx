// src/app/interview/page.tsx
"use client";

import { useState, useTransition } from "react";
import { interviewToMarkdown, InterviewAnswers } from "@/lib/interviewMarkdown";
import { useRouter } from "next/navigation";

const INIT: InterviewAnswers = {
  title: "",
  q1:"", q2:"", q3:"", q4:"", q5:"", q6:"",
  q7:"", q8:"", q9:"", q10:"", q11:"", q12:""
};

export default function InterviewPage() {
  const [ans, setAns] = useState<InterviewAnswers>(INIT);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function set<K extends keyof InterviewAnswers>(k: K, v: string) {
    setAns(prev => ({ ...prev, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const markdown = interviewToMarkdown(ans);
    const title = ans.title?.trim() || "12問インタビュー 下書き";
    const payload = { title, markdown }; // ← API仕様に合わせて最小で送る

    startTransition(async () => {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert("保存に失敗しました: " + (j?.error ?? res.statusText));
        return;
      }
      router.push("/entries");
    });
  }

  return (
    <main style={{ maxWidth: 860, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>12問インタビュー</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        入力して「保存」すると、Markdown化して /api/entries に保存されます。
      </p>

      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginBottom: 8 }}>
          タイトル
          <input
            value={ans.title ?? ""}
            onChange={e => set("title", e.target.value)}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
            placeholder="例）○○さん 12問インタビュー"
          />
        </label>

        {Array.from({ length: 12 }).map((_, i) => {
          const k = `q${i + 1}` as keyof InterviewAnswers;
          return (
            <label key={k as string} style={{ display: "block", margin: "16px 0" }}>
              Q{i + 1}
              <textarea
                value={(ans[k] as string) ?? ""}
                onChange={e => set(k, e.target.value)}
                rows={3}
                style={{ width: "100%", padding: 8, marginTop: 4 }}
                placeholder={`Q${i + 1} の回答`}
              />
            </label>
          );
        })}

        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#111",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          {isPending ? "保存中…" : "保存"}
        </button>
      </form>
    </main>
  );
}
