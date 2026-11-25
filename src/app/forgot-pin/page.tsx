"use client";
/**
 * 暗証番号を忘れた（ログイン中の保護者）。
 *  - パスワードがある → アカウントのパスワード + 新しい暗証番号（2回）
 *  - LINE と連携ずみ → 「LINEで本人確認する」→ 戻ってきてから10分以内に 新しい暗証番号（2回）
 * 決めたら そのまま「おうちの方」ページへ（暗証番号を入力ずみ）。
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AccountHeader, FormMessage, PasswordField, PinField } from "@/components/account/Form";
import { LineLoginButton } from "@/components/account/LineLoginButton";
import { apiGet } from "@/lib/api/client";
import { AuthResultResponseSchema, ResetPinStatusResponseSchema, type ResetPinStatusResponse } from "@/lib/api/contracts";
import { codeOf, isAccountOffline, notifyAccountChanged, sendJson } from "@/lib/auth/client";
import { readLineNoticeFromUrl } from "@/lib/auth/lineMessages";

type Phase = "loading" | "ready" | "offline";

export default function ForgotPinPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [status, setStatus] = useState<ResetPinStatusResponse | null>(null);
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const n = readLineNoticeFromUrl();
    if (n?.kind === "ok") setNotice(n.text);
    else if (n) setError(n.text);
    void apiGet("/api/parent/reset-pin", ResetPinStatusResponseSchema).then((r) => {
      if (codeOf(r) === "NOT_LOGGED_IN") { router.replace("/login"); return; }
      if (isAccountOffline(r) || !r.ok) { setPhase("offline"); return; }
      setStatus(r.data);
      setPhase("ready");
    });
  }, [router]);

  const usingLine = !!status?.lineVerified;

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!usingLine && !password) { setError("アカウントのパスワードを入力してください。"); return; }
    if (!/^\d{4}$/.test(pin)) { setError("暗証番号は数字4けたで入力してください。"); return; }
    if (pin !== pin2) { setError("確認用の暗証番号が一致しません。"); return; }
    setBusy(true);
    const r = await sendJson("POST", "/api/parent/reset-pin", AuthResultResponseSchema, usingLine ? { newPin: pin } : { password, newPin: pin });
    setBusy(false);
    if (r.ok && r.data.ok) {
      notifyAccountChanged();
      router.replace("/parent");
      return;
    }
    const code = codeOf(r);
    if (code === "NOT_LOGGED_IN") { router.replace("/login"); return; }
    if (code === "REAUTH_REQUIRED") setStatus((s) => (s ? { ...s, lineVerified: false } : s));
    setError(r.error ?? "設定できませんでした。時間をおいてもう一度お試しください。");
  };

  if (phase === "loading") return <p className="rpg-title p-8 text-center text-xl">読み込み中…</p>;

  if (phase === "offline" || !status) {
    return (
      <div className="pb-6">
        <AccountHeader title="暗証番号を忘れた" back={{ href: "/who", label: "もどる" }} />
        <section className="card p-5">
          <p className="font-bold">ただいまアカウント機能を利用できません。しばらくしてからもう一度お試しください。</p>
        </section>
      </div>
    );
  }

  const canLine = status.lineLinked && status.lineLoginAvailable;
  const showForm = usingLine || status.hasPassword;

  return (
    <div className="space-y-5 pb-6">
      <AccountHeader title="暗証番号を忘れた" sub="本人確認のあと、新しい暗証番号（4けた）を決められます。" back={{ href: "/parent", label: "もどる" }} />
      <FormMessage error={error} ok={notice} />

      {showForm && (
        <form onSubmit={submit} noValidate className="card rpg-rivets space-y-4 p-5" aria-label="新しい暗証番号を決める">
          {usingLine ? (
            <p className="text-sm">LINE で本人確認ができました。新しい暗証番号を決めてください。</p>
          ) : (
            <PasswordField label="アカウントのパスワード" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
              hint="ログインに使っているパスワードです。" />
          )}
          <div className="flex flex-wrap gap-4">
            <PinField label="新しい暗証番号" value={pin} onChange={setPin} />
            <PinField label="新しい暗証番号（確認）" value={pin2} onChange={setPin2} />
          </div>
          <p className="text-xs text-[var(--ink-2)]">お子さまに知られない番号にしてください。</p>
          <button type="submit" className="btn btn-coin block w-full text-lg" disabled={busy}>{busy ? "保存しています…" : "新しい暗証番号にする"}</button>
          {!usingLine && status.hasPassword && (
            <p className="text-center text-xs">
              パスワードも忘れた場合は、<Link href="/forgot-password" className="font-bold underline underline-offset-4">パスワードの再設定</Link>をしてから お試しください。
            </p>
          )}
        </form>
      )}

      {!usingLine && canLine && (
        <section className="card p-4" aria-labelledby="line-reauth-title">
          <h2 id="line-reauth-title" className="rpg-title text-lg">{status.hasPassword ? "パスワードのかわりに LINE で確認" : "LINE で本人確認"}</h2>
          <p className="mb-3 mt-1 text-xs text-[var(--ink-2)]">このアカウントと連携している LINE アカウントで確認します。確認のあと10分以内に、新しい暗証番号を決めてください。</p>
          <LineLoginButton mode="reauth" label="LINEで本人確認する" />
        </section>
      )}

      {!showForm && !canLine && (
        <section className="card p-5">
          <p className="text-sm">
            ただいま LINE での本人確認を利用できません。しばらくしてからもう一度お試しください。
          </p>
        </section>
      )}
    </div>
  );
}
