"use client";
/**
 * パスワードを忘れた方: メールアドレスを入れると 再設定のリンクを送る。
 * 登録の有無に かかわらず 同じ答え（「登録されている場合は お送りしました」）。
 */
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AccountHeader, FormMessage, TextField } from "@/components/account/Form";
import { AuthResultResponseSchema } from "@/lib/api/contracts";
import { isAccountOffline, sendJson } from "@/lib/auth/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("メールアドレスを正しく入力してください。"); return; }
    setBusy(true);
    const r = await sendJson("POST", "/api/auth/password-reset/request", AuthResultResponseSchema, { email: email.trim() });
    setBusy(false);
    if (r.ok && r.data.ok) { setSent(r.data.messageJa); return; }
    setError(isAccountOffline(r)
      ? "ただいまアカウント機能を利用できません。しばらくしてからもう一度お試しください。"
      : r.error ?? "送信できませんでした。時間をおいてもう一度お試しください。");
  };

  return (
    <div className="pb-6">
      <AccountHeader title="パスワードを忘れた方" back={{ href: "/login", label: "ログイン画面へ" }} />
      {sent ? (
        <section className="card rpg-rivets space-y-4 p-5" aria-live="polite">
          <FormMessage ok={sent} />
          <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--ink-2)]">
            <li>メールのリンクの有効期限は30分です。1回だけ使えます。</li>
            <li>何度か送った場合は、いちばん新しいメールのリンクをお使いください。</li>
            <li>LINE で登録した方は、メールアドレスを追加していない場合、メールは届きません。「LINEでログイン」をお使いください。</li>
          </ul>
          <Link href="/login" className="btn btn-primary block text-center">ログイン画面へ</Link>
        </section>
      ) : (
        <form onSubmit={submit} noValidate className="card rpg-rivets space-y-4 p-5" aria-label="パスワードの再設定">
          <FormMessage error={error} />
          <p className="text-sm">ご登録のメールアドレスを入力してください。パスワードを再設定するためのリンクをお送りします。</p>
          <TextField label="メールアドレス" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit" className="btn btn-coin block w-full text-lg" disabled={busy}>{busy ? "送信しています…" : "再設定のメールを送る"}</button>
        </form>
      )}
    </div>
  );
}
