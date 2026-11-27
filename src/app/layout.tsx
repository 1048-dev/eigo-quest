import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/game/BottomNav";
import { FieldBackdrop } from "@/components/scene/FieldBackdrop";
import { CharacterParade } from "@/components/scene/CharacterParade";
import { ArtDefs } from "@/components/art/ArtDefs";
import { AccountBar } from "@/components/account/AccountBar";
import { LegalFooter } from "@/components/legal/LegalLinks";

export const metadata: Metadata = { title: "英語クエスト", description: "ハルたちと毎日30分のえいご大冒険" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@500;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-dvh pb-24">
        <ArtDefs />
        <FieldBackdrop />
        <main className="mx-auto max-w-3xl px-4 pt-4">
          <AccountBar />
          {children}
          <CharacterParade />
          <LegalFooter />
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
