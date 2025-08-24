// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Career OS",
  description: "転機に備えて、誇れる証拠を蓄積する。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {/* ← これが <body> 直下。ここにナビを入れる */}
        <nav style={{ padding: 12, background: "#fafafa" }}>
          <a href="/" style={{ marginRight: 12 }}>Home</a>
          <a href="/history">History</a>
        </nav>
        {children}
      </body>
    </html>
  );
}
