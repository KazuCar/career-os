export async function POST(req: Request) {
  let text = "";
  try {
    const body = (await req.json()) as unknown;

    if (typeof body === "object" && body && "text" in body) {
      const t = (body as { text?: unknown }).text;
      if (typeof t === "string") text = t;
    }
  } catch {
    // 入力がJSONじゃない時は空で続行
  }

  const draft = {
    summary: "SaaS CSとして解約率1.2pt改善、オンボ工数30%削減。",
    jobSummary: "指標設計とプレイブック整備が強み。B2B SaaSで100社超を担当。",
    bullets: ["解約 3.8%→2.6%（6カ月）", "オンボ 22h→15h（-30%）", "拡張 +18%（対前Q）"],
    skills: ["Salesforce", "HubSpot", "SQL(簡易)"],
  };

  return Response.json({ ok: true, inputPreview: text.slice(0, 80), draft });
}
