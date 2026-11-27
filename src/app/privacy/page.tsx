import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal/LegalDocument";

export const dynamic = "force-static";
export const metadata: Metadata = { title: "プライバシーポリシー | 英語クエスト" };

/** docs/legal/privacy.md を そのまま 出す（下書き。【要確認】は 運営者・専門家が うめる） */
export default function PrivacyPage() {
  return <LegalDocument slug="privacy" />;
}
