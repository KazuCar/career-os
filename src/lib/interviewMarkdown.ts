// src/lib/interviewMarkdown.ts
export type InterviewAnswers = {
  q1: string; q2: string; q3: string; q4: string; q5: string; q6: string;
  q7: string; q8: string; q9: string; q10: string; q11: string; q12: string;
  title?: string; // タイトル任意
};

const QUESTIONS = [
  "今の肩書き（ひとことで）",
  "最近の挑戦",
  "得意なこと",
  "苦手なこと",
  "いま大事にしている価値観",
  "転機だと感じた出来事",
  "その時にした選択",
  "そこで得た学び",
  "今の仕事で一番効いた経験",
  "周囲にどう見られたい？",
  "次の一歩",
  "読んだ人へのひとこと",
];

export function interviewToMarkdown(a: InterviewAnswers): string {
  const lines: string[] = [];
  const safe = (s: unknown) => (typeof s === "string" ? s.trim() : "");
  const t = safe(a.title) || "12問インタビュー 下書き";

  lines.push(`# ${t}`, "");
  QUESTIONS.forEach((label, i) => {
    const key = `q${i + 1}` as keyof InterviewAnswers;
    const v = safe(a[key]);
    lines.push(`## Q${i + 1}. ${label}`, "", v || "_（未入力）_", "");
  });
  return lines.join("\n");
}
