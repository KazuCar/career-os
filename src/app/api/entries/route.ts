export const runtime = "nodejs";

// src/app/api/entries/route.ts
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

// GET /api/entries : 最新を上から返す
export async function GET() {
  try {
    // 初回用: テーブルが無ければ作る（拡張いらない素朴な構成）
    await sql`
      CREATE TABLE IF NOT EXISTS entries (
        id BIGSERIAL PRIMARY KEY,
        title TEXT,
        markdown TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    const { rows } =
      await sql`SELECT id, title, markdown, created_at FROM entries ORDER BY created_at DESC LIMIT 50;`;
    return NextResponse.json({ ok: true, items: rows });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}

// POST /api/entries : 保存して返す
export async function POST(req: Request) {
  try {
    const { title = "", markdown = "" } = await req.json();
    if (!markdown) {
      return NextResponse.json(
        { ok: false, error: "markdown is required" },
        { status: 400 }
      );
    }
    const { rows } =
      await sql`INSERT INTO entries (title, markdown) VALUES (${title}, ${markdown}) RETURNING id, title, markdown, created_at;`;
    return NextResponse.json({ ok: true, item: rows[0] }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
