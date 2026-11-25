"use client";
/** 保護者向けフォームの部品（ラベル・説明・エラーを input に aria で結びつける） */
import Link from "next/link";
import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Portrait } from "@/components/characters/CharacterArt";

export const inputClass =
  "w-full rounded-xl border-2 border-[var(--gold)]/60 bg-black/40 px-3 py-2.5 text-base font-bold text-[var(--ink)] placeholder:text-[var(--ink-2)]/60 focus:border-[var(--volt)] focus:outline-none focus:ring-2 focus:ring-[var(--volt)]/40";

export function Field({ label, hint, error, children }: { label: string; hint?: ReactNode; error?: string | null; children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode }) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-black">{label}</label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && <div id={hintId} className="mt-1 text-xs text-[var(--ink-2)]">{hint}</div>}
      {error && <p id={errId} className="mt-1 text-xs font-bold text-[#ff9aa2]">{error}</p>}
    </div>
  );
}

export function TextField({ label, hint, error, ...rest }: { label: string; hint?: ReactNode; error?: string | null } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => <input id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={inputClass} {...rest} />}
    </Field>
  );
}

/** 表示／非表示を切りかえられるパスワード欄 */
export function PasswordField({ label, hint, error, ...rest }: { label: string; hint?: ReactNode; error?: string | null } & InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input id={id} type={show ? "text" : "password"} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={`${inputClass} pr-16`} {...rest} />
          <button type="button" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? "パスワードを隠す" : "パスワードを表示する"}
            className="absolute inset-y-0 right-1 my-1 rounded-lg px-2 text-xs font-bold text-[var(--on-dark-2)] hover:text-[var(--volt)]">
            {show ? "隠す" : "表示"}
          </button>
        </div>
      )}
    </Field>
  );
}

/** 数字4けたの暗証番号欄 */
export function PinField(props: { label: string; hint?: ReactNode; error?: string | null; value: string; onChange: (v: string) => void; autoComplete?: string }) {
  const { label, hint, error, value, onChange, autoComplete = "off" } = props;
  return (
    <Field label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <input id={id} type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete={autoComplete}
          aria-describedby={describedBy} aria-invalid={invalid || undefined}
          className={`${inputClass.replace("w-full ", "")} w-28 text-center tracking-[0.5em]`} value={value}
          onChange={(e) => onChange(e.target.value.normalize("NFKC").replace(/\D/g, "").slice(0, 4))} />
      )}
    </Field>
  );
}

export function FormMessage({ error, ok }: { error?: string | null; ok?: string | null }) {
  if (error) return <p role="alert" className="speech px-3 py-2 text-sm font-bold"><span className="mr-1 font-black text-[#b3202a]">！</span>{error}</p>;
  if (ok) return <p role="status" className="rounded-xl border-2 border-[var(--ok)]/70 bg-[var(--ok)]/15 px-3 py-2 text-sm font-bold">{ok}</p>;
  return null;
}

/** アカウント画面の上の小さな見出し（ロゴとキャラクター） */
export function AccountHeader({ title, sub, back }: { title: string; sub?: string; back?: { href: string; label: string } }) {
  return (
    <header className="title-plate relative mb-5 overflow-hidden px-4 pb-3 pt-3">
      {back && (
        <Link href={back.href} className="text-xs font-bold text-[var(--on-dark-2)] underline underline-offset-4 hover:text-[var(--volt)]">← {back.label}</Link>
      )}
      <div className="mt-1 flex items-center gap-3">
        <div className="flex -space-x-3" aria-hidden>
          <Portrait id="haru" size={40} ring="#4cc9f0" />
          <Portrait id="riko" size={40} ring="#ff6fa5" />
          <Portrait id="kiko" size={40} ring="#ffd83a" />
        </div>
        <div className="min-w-0">
          <p className="title-metal text-[11px] leading-none">英語クエスト</p>
          <h1 className="rpg-title text-lg leading-tight [word-break:keep-all] sm:text-xl">{title}</h1>
        </div>
      </div>
      {sub && <p className="mt-2 break-all text-sm text-[var(--ink-2)]">{sub}</p>}
    </header>
  );
}
