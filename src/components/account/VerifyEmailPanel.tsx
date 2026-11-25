"use client";
/**
 * メールアドレスの確認（LINE で登録した保護者が メールアドレス + パスワードを追加する）。
 * リンクを開いただけでは確定しない（メールの安全チェックが 自動でリンクを開くことがあるため）。「確定する」を押して確定。
 */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AccountHeader, FormMessage } from "@/components/account/Form";
import { AuthResultResponseSchema, MailTokenStatusResponseSchema } from "@/lib/api/contracts";
import { codeOf, isAccountOffline, notifyAccountChanged, sendJson } from "@/lib/auth/client";
import { INVALID_EMAIL_LINK_JA } from "@/lib/auth/recoveryMessages";
import { takeTokenFromUrl } from "./ResetPasswordForm";

type Phase = "checking" | "invalid" | "confirm" | "done" | "offline";

export function VerifyEmailPanel() {
  const [token, setToken] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  // 開発中の StrictMode では effect が2回動く。2回目は URL に もう token が無いので、1回だけにする
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t = takeTokenFromUrl();
    if (!t) { setPhase("invalid"); return; }
    setToken(t);
    void sendJson("POST", "/api/auth/email/check", MailTokenStatusResponseSchema, { token: t }).then((r) => {
      if (isAccountOffline(r)) { setPhase("offline"); return; }
      if (r.ok && r.data.valid) { setMaskedEmail(r.data.maskedEmail); setPhase("confirm"); return; }
      if (codeOf(r) === "RATE_LIMITED") setError(r.error ?? null);
      setPhase("invalid");
    });
  }, []);

  const confirm = async () => {
    setError(null);
    setBusy(true);
    const r = await sendJson("POST", "/api/auth/email/confirm", AuthResultResponseSchema, { token });
    setBusy(false);
    if (r.ok && r.data.ok) { setDone(r.data.messageJa); setPhase("done"); notifyAccountChanged(); return; }
    if (codeOf(r) === "INVALID_TOKEN") { setPhase("invalid"); return; }
    setError(r.error ?? "確認できませんでした。時間をおいてもう一度お試しください。");
  };

  return (
    <div className="pb-6">
      <AccountHeader title="メールアドレスの確認" />
      {phase === "checking" && <p className="rpg-title p-8 text-center text-xl">確認しています…</p>}
      {phase === "offline" && (
        <section className="card p-5">
          <p className="font-bold">ただいまアカウント機能を利用できません。しばらくしてから、もう一度メールのリンクを開いてください。</p>
        </section>
      )}
      {phase === "invalid" && (
        <section className="card rpg-rivets space-y-4 p-5">
          <FormMessage error={error ?? INVALID_EMAIL_LINK_JA} />
          <Link href="/parent" className="btn btn-primary block text-center">おうちの方のページへ</Link>
        </section>
      )}
      {phase === "confirm" && (
        <section className="card rpg-rivets space-y-4 p-5">
          <FormMessage error={error} />
          <p className="text-sm">
            {maskedEmail ? <><span className="font-black">{maskedEmail}</span> と、</> : ""}お申し込みのときに決めたパスワードで、ログインできるようにします。よろしければ「確定する」を押してください。
          </p>
          <button type="button" className="btn btn-coin block w-full text-lg" disabled={busy} onClick={() => void confirm()}>{busy ? "確認しています…" : "確定する"}</button>
        </section>
      )}
      {phase === "done" && (
        <section className="card rpg-rivets space-y-4 p-5">
          <FormMessage ok={done} />
          <Link href="/parent" className="btn btn-coin block text-center">おうちの方のページへ</Link>
        </section>
      )}
    </div>
  );
}
