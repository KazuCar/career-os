export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);

// GET /api/entries : 最新を上から返す
export async function GET() {
  try {
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
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: toMessage(e) }, { status: 500 });
  }
}

// POST /api/entries : 保存して返す
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title : "";
    const markdown = typeof body?.markdown === "string" ? body.markdown : "";

    if (!markdown) {
      return NextResponse.json(
        { ok: false, error: "markdown is required" },
        { status: 400 }
      );
    }

    const { rows } =
      await sql`INSERT INTO entries (title, markdown) VALUES (${title}, ${markdown}) RETURNING id, title, markdown, created_at;`;
    return NextResponse.json({ ok: true, item: rows[0] }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: toMessage(e) }, { status: 500 });
  }
}
