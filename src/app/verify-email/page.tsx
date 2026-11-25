import type { Metadata } from "next";
import { VerifyEmailPanel } from "@/components/account/VerifyEmailPanel";

/** メールアドレスの確認（メールのリンク /verify-email?token=...）。リンクのトークンを Referer で出さない */
export const metadata: Metadata = { title: "メールアドレスの確認", referrer: "no-referrer", robots: { index: false, follow: false } };

export default function VerifyEmailPage() {
  return <VerifyEmailPanel />;
}
