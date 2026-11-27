"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AccountHeader, FormMessage, PasswordField, PinField, TextField } from "@/components/account/Form";
import { LineLoginButton } from "@/components/account/LineLoginButton";
import { LegalConsentNote } from "@/components/legal/LegalLinks";
import { AuthResultResponseSchema, PASSWORD_RULES_JA } from "@/lib/api/contracts";
import { fetchMe, notifyAccountChanged, passwordChecks, sendJson } from "@/lib/auth/client";

type Errors = Partial<Record<"email" | "password" | "password2" | "pin" | "pin2", string>>;

/** 保護者の新規登録（メール・パスワード・暗証番号4けた ／ LINE が設定されていれば「LINEで登録」も） */
export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [lineAvailable, setLineAvailable] = useState(false);

  useEffect(() => {
    void fetchMe().then((r) => setLineAvailable(r.ok && r.data.lineLoginAvailable));
  }, []);

  const checks = passwordChecks(password);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "メールアドレスの形式を確認してください。";
    if (!checks.every((c) => c.ok)) e.password = `パスワードは${PASSWORD_RULES_JA}`;
    if (password2 !== password) e.password2 = "確認用のパスワードが一致しません。";
    if (!/^\d{4}$/.test(pin)) e.pin = "暗証番号は数字4けたで入力してください。";
    if (pin2 !== pin) e.pin2 = "確認用の暗証番号が一致しません。";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setFormError(null);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setBusy(true);
    const r = await sendJson("POST", "/api/auth/register", AuthResultResponseSchema, { email: email.trim(), password, pin });
    setBusy(false);
    if (r.ok && r.data.ok) {
      notifyAccountChanged();
      router.push("/parent?add=1&welcome=1");
      return;
    }
    const field = (r.data as { field?: unknown }).field;
    if (field === "email" || field === "password" || field === "pin") setErrors({ [field]: r.error ?? "" });
    else setFormError(r.error ?? "登録できませんでした。時間をおいてもう一度お試しください。");
  };

  return (
    <div className="pb-6">
      <AccountHeader title="おうちの方の登録" sub="保護者の方が入力してください。お子さまの本名は必要ありません。" back={{ href: "/welcome", label: "スタート画面へ" }} />
      <form onSubmit={submit} noValidate className="card rpg-rivets space-y-4 p-5" aria-label="保護者の登録">
        <FormMessage error={formError} />
        {lineAvailable && (
          <div className="space-y-3">
            <LineLoginButton label="LINEで登録" />
            <p className="text-center text-xs text-[var(--ink-2)]">メールアドレス・パスワードなしで登録できます（このあと暗証番号を決めます）。月ごとの学習レポートも LINE で受け取れます。</p>
            <LegalConsentNote action="LINEで登録" />
            <div className="flex items-center gap-3 text-xs text-[var(--ink-2)]" aria-hidden><span className="h-px flex-1 bg-current opacity-40" />または メールアドレスで<span className="h-px flex-1 bg-current opacity-40" /></div>
          </div>
        )}
        <TextField label="メールアドレス" type="email" autoComplete="email" inputMode="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="example@mail.com" />

        <PasswordField label="パスワード" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password}
          hint={
            <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1" aria-label="パスワードのルール">
              {checks.map((c) => (
                <li key={c.label} className={c.ok ? "font-bold text-[var(--ok)]" : ""}>
                  <span aria-hidden>{c.ok ? "✔" : "・"}</span> {c.label}<span className="sr-only">{c.ok ? "（OK）" : "（まだ）"}</span>
                </li>
              ))}
            </ul>
          } />
        <PasswordField label="パスワード（確認）" autoComplete="new-password" required value={password2} onChange={(e) => setPassword2(e.target.value)} error={errors.password2} />

        <div className="rounded-xl border border-[var(--gold)]/40 bg-black/25 p-3">
          <p className="text-sm font-black">保護者用の暗証番号（4けた）</p>
          <p className="mt-0.5 text-xs text-[var(--ink-2)]">「おうちの方」のページに入るときに使います。お子さまに知られない番号にしてください。</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <PinField label="暗証番号" value={pin} onChange={setPin} error={errors.pin} />
            <PinField label="暗証番号（確認）" value={pin2} onChange={setPin2} error={errors.pin2} />
          </div>
        </div>

        <LegalConsentNote action="登録する" />
        <button type="submit" className="btn btn-coin block w-full text-lg" disabled={busy}>{busy ? "登録しています…" : "登録する"}</button>
        <p className="text-center text-sm text-[var(--ink-2)]">
          すでに登録済みの方は <Link href="/login" className="font-black text-[var(--volt)] underline underline-offset-4">ログイン</Link>
        </p>
      </form>
    </div>
  );
}
