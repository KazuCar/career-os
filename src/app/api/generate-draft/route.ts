type Draft = { summary: string; jobSummary: string; bullets: string[]; skills: string[] };
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const text: string = body?.text ?? "";
  const draft: Draft = {
    summary: "SaaS CSとして解約率1.2pt改善、オンボ工数30%削減。",
    jobSummary: "指標設計とプレイブック整備が強み。B2B SaaSで100社超を担当。",
    bullets: ["解約 3.8%→2.6%（6カ月）", "オンボ 22h→15h（-30%）", "拡張 +18%（対前Q）"],
    skills: ["Salesforce", "HubSpot", "SQL(簡易)"]
  };
  return Response.json({ ok: true, inputPreview: text.slice(0, 80), draft });
}
