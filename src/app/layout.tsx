// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";            // ← 追加
import "./globals.css";

export const metadata: Metadata = {
  title: "Career OS",
  description: "転機に備えて、誇れる証拠を蓄積する。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* <body> 直下のナビ */}
        <nav style={{ padding: 12, background: "#fafafa" }}>
          <Link href="/" style={{ marginRight: 12 }}>Home</Link>
          <Link href="/history">History</Link>
          <Link href="/interview" style={{ marginRight: 12 }}>Interview</Link>
          <Link href="/entries">Entries</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
