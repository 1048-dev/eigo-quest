"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AccountHeader, FormMessage, PasswordField, TextField } from "@/components/account/Form";
import { LineLoginButton } from "@/components/account/LineLoginButton";
import { AuthResultResponseSchema } from "@/lib/api/contracts";
import { fetchMe, notifyAccountChanged, rememberTrial, sendJson, isAccountOffline } from "@/lib/auth/client";
import { readLineNoticeFromUrl } from "@/lib/auth/lineMessages";
import { PASSWORD_RESET_DONE_JA } from "@/lib/auth/recoveryMessages";

/** 保護者のログイン（メール + パスワード ／ LINE が設定されていれば「LINEでログイン」も） */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lineAvailable, setLineAvailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    // LINE から戻ってきたときのメッセージ（?line=...）
    const n = readLineNoticeFromUrl();
    if (n) setError(n.text);
    // パスワードを再設定したあと（/reset-password から）
    if (new URLSearchParams(window.location.search).get("reset") === "1") setNotice(PASSWORD_RESET_DONE_JA);
    void fetchMe().then((r) => setLineAvailable(r.ok && r.data.lineLoginAvailable));
  }, []);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError("メールアドレスとパスワードを入力してください。"); return; }
    setBusy(true);
    const r = await sendJson("POST", "/api/auth/login", AuthResultResponseSchema, { email: email.trim(), password });
    setBusy(false);
    if (r.ok && r.data.ok) {
      notifyAccountChanged();
      router.push("/who");
      return;
    }
    setOffline(isAccountOffline(r));
    setError(r.error ?? "ログインできませんでした。時間をおいてもう一度お試しください。");
  };

  return (
    <div className="pb-6">
      <AccountHeader title="おうちの方のログイン" back={{ href: "/welcome", label: "スタート画面へ" }} />
      <form onSubmit={submit} noValidate className="card rpg-rivets space-y-4 p-5" aria-label="保護者のログイン">
        <FormMessage error={error} ok={notice} />
        {lineAvailable && (
          <div className="space-y-3">
            <LineLoginButton />
            <p className="text-center text-xs text-[var(--ink-2)]">LINE と連携ずみの方・はじめての方（そのまま登録できます）</p>
            <div className="flex items-center gap-3 text-xs text-[var(--ink-2)]" aria-hidden><span className="h-px flex-1 bg-current opacity-40" />または メールアドレスで<span className="h-px flex-1 bg-current opacity-40" /></div>
          </div>
        )}
        <TextField label="メールアドレス" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="パスワード" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn btn-coin block w-full text-lg" disabled={busy}>{busy ? "確認しています…" : "ログイン"}</button>
        <p className="text-center text-sm">
          <Link href="/forgot-password" className="font-bold text-[var(--on-dark-2)] underline underline-offset-4 hover:text-[var(--volt)]">パスワードを忘れた方</Link>
        </p>
        {offline && (
          <button type="button" className="btn btn-primary block w-full" onClick={() => { rememberTrial(); router.push("/map"); }}>おためしで あそぶ</button>
        )}
        <p className="text-center text-sm text-[var(--ink-2)]">
          はじめての方は <Link href="/register" className="font-black text-[var(--volt)] underline underline-offset-4">新規登録</Link>
        </p>
      </form>
    </div>
  );
}
