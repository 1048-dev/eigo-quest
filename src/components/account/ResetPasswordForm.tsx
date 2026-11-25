"use client";
/**
 * パスワードの再設定フォーム。
 *  1. ?token= を読んで すぐ URL から消す（履歴・画面共有に のこさない）
 *  2. リンクが まだ使えるか たしかめる（使わない）
 *  3. 新しいパスワード（2回）→ 決定。成功したら すべての端末でログアウト → ログイン画面へ
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AccountHeader, FormMessage, PasswordField } from "@/components/account/Form";
import { AuthResultResponseSchema, MailTokenStatusResponseSchema, PASSWORD_RULES_JA } from "@/lib/api/contracts";
import { codeOf, isAccountOffline, notifyAccountChanged, passwordChecks, sendJson } from "@/lib/auth/client";
import { INVALID_RESET_LINK_JA } from "@/lib/auth/recoveryMessages";

/** URL の ?token= を読んで 消す（ブラウザだけ） */
export function takeTokenFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const token = url.searchParams.get("token");
  if (token) {
    url.searchParams.delete("token");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  return token;
}

type Phase = "checking" | "invalid" | "form" | "offline";

export function ResetPasswordForm() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("checking");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checks = passwordChecks(pw);

  // 開発中の StrictMode では effect が2回動く。2回目は URL に もう token が無いので、1回だけにする
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t = takeTokenFromUrl();
    if (!t) { setPhase("invalid"); return; }
    setToken(t);
    void sendJson("POST", "/api/auth/password-reset/check", MailTokenStatusResponseSchema, { token: t }).then((r) => {
      if (isAccountOffline(r)) { setPhase("offline"); return; }
      if (r.ok && r.data.valid) { setMaskedEmail(r.data.maskedEmail); setPhase("form"); return; }
      if (codeOf(r) === "RATE_LIMITED") setError(r.error ?? null);
      setPhase("invalid");
    });
  }, []);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!checks.every((c) => c.ok)) { setError(`新しいパスワードは${PASSWORD_RULES_JA}`); return; }
    if (pw !== pw2) { setError("確認用のパスワードが一致しません。"); return; }
    setBusy(true);
    const r = await sendJson("POST", "/api/auth/password-reset/complete", AuthResultResponseSchema, { token, newPassword: pw });
    setBusy(false);
    if (r.ok && r.data.ok) {
      notifyAccountChanged();
      router.replace("/login?reset=1");
      return;
    }
    if (codeOf(r) === "INVALID_TOKEN") { setPhase("invalid"); return; }
    setError(r.error ?? "再設定できませんでした。時間をおいてもう一度お試しください。");
  };

  return (
    <div className="pb-6">
      <AccountHeader title="パスワードの再設定" back={{ href: "/login", label: "ログイン画面へ" }} />
      {phase === "checking" && <p className="rpg-title p-8 text-center text-xl">確認しています…</p>}
      {phase === "offline" && (
        <section className="card p-5">
          <p className="font-bold">ただいまアカウント機能を利用できません。しばらくしてから、もう一度メールのリンクを開いてください。</p>
        </section>
      )}
      {phase === "invalid" && (
        <section className="card rpg-rivets space-y-4 p-5">
          <FormMessage error={error ?? INVALID_RESET_LINK_JA} />
          <Link href="/forgot-password" className="btn btn-coin block text-center">もう一度メールを送る</Link>
        </section>
      )}
      {phase === "form" && (
        <form onSubmit={submit} noValidate className="card rpg-rivets space-y-4 p-5" aria-label="新しいパスワードを決める">
          <FormMessage error={error} />
          <p className="text-sm">{maskedEmail ? `${maskedEmail} のアカウントの、` : ""}新しいパスワードを決めてください。</p>
          <PasswordField label="新しいパスワード" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)}
            hint={<span>{PASSWORD_RULES_JA} {checks.every((c) => c.ok) && <span className="font-bold text-[var(--ok)]">✔ OK</span>}</span>} />
          <PasswordField label="新しいパスワード（確認）" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          <p className="text-xs text-[var(--ink-2)]">再設定すると、安全のため すべての端末でログアウトします。</p>
          <button type="submit" className="btn btn-coin block w-full text-lg" disabled={busy}>{busy ? "保存しています…" : "パスワードを再設定する"}</button>
        </form>
      )}
    </div>
  );
}
