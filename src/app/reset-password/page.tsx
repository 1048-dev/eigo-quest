import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/account/ResetPasswordForm";

/** パスワードの再設定（メールのリンク /reset-password?token=...）。リンクのトークンを ほかのサイトへ Referer で出さない */
export const metadata: Metadata = { title: "パスワードの再設定", referrer: "no-referrer", robots: { index: false, follow: false } };

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
