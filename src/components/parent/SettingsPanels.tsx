"use client";
/**
 * 「おうちの方」ページ: お子さまの追加・暗証番号の変更・パスワードの変更・LINE の連携・退会
 * usePin = true: LINE だけで登録した保護者（パスワードなし）。本人確認に今の暗証番号を使う。
 */
import { useState, type FormEvent } from "react";
import { AvatarPicker } from "@/components/account/AvatarPicker";
import { FormMessage, PasswordField, PinField, TextField } from "@/components/account/Form";
import { LineLoginButton } from "@/components/account/LineLoginButton";
import { defaultAvatarForNewChild, type AvatarCharacter } from "@/lib/domain/avatars";
import { AUTH_LIMITS, AuthResultResponseSchema, ChildResponseSchema, PASSWORD_RULES_JA, ParentSettingsResponseSchema } from "@/lib/api/contracts";
import { passwordChecks, sendJson } from "@/lib/auth/client";
import { GradeSelect, type Guard } from "./ChildCard";

export function AddChildForm({ guard, onAdded, onCancel, siblings = [] }: { guard: Guard; onAdded: (msg: string) => void; onCancel?: () => void; siblings?: string[] }) {
  const [nickname, setNickname] = useState("");
  // はじめは きょうだいが まだ使っていない顔（お子さまと いっしょに えらんでください）
  const [avatar, setAvatar] = useState<AvatarCharacter>(() => defaultAvatarForNewChild(siblings));
  const [grade, setGrade] = useState(1);
  const [birthYear, setBirthYear] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    const name = nickname.trim();
    if (!name || name.length > AUTH_LIMITS.nicknameMax) { setError(`ニックネームは1〜${AUTH_LIMITS.nicknameMax}文字で入力してください。`); return; }
    if (/[<>]/.test(name)) { setError("ニックネームに < > は使えません。"); return; }
    if (birthYear && !/^20\d{2}$/.test(birthYear)) { setError("生まれ年は西暦4けたで入力してください（空欄でもかまいません）。"); return; }
    setBusy(true);
    const r = await sendJson("POST", "/api/children", ChildResponseSchema, { nickname: name, schoolGrade: grade, avatarCharacter: avatar, ...(birthYear ? { birthYear: Number(birthYear) } : {}) });
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) { setNickname(""); setBirthYear(""); onAdded(r.data.messageJa || "お子さまを追加しました。"); }
    else setError(r.error ?? "追加できませんでした。");
  };

  return (
    <form onSubmit={submit} className="space-y-3" aria-label="お子さまを追加">
      <FormMessage error={error} />
      <TextField label="ニックネーム" value={nickname} maxLength={AUTH_LIMITS.nicknameMax} onChange={(e) => setNickname(e.target.value)}
        hint={`画面に表示される名前です（${AUTH_LIMITS.nicknameMax}文字まで）。本名でなくてかまいません。`} placeholder="例：はるくん" />
      <GradeSelect value={grade} onChange={setGrade} id="add-grade" />
      <AvatarPicker name="add-avatar" legend="キャラクター（あとからお子さまの画面でも変えられます）" value={avatar} onChange={setAvatar} size={44} />
      <TextField label="生まれ年（西暦・任意）" inputMode="numeric" maxLength={4} placeholder="例：2018" value={birthYear}
        onChange={(e) => setBirthYear(e.target.value.normalize("NFKC").replace(/\D/g, ""))} />
      <div className="flex gap-2">
        <button type="submit" className="btn btn-coin flex-1" disabled={busy}>{busy ? "追加しています…" : "追加する"}</button>
        {onCancel && <button type="button" className="btn btn-ghost flex-1" onClick={onCancel}>やめる</button>}
      </div>
    </form>
  );
}

export function ChangePinForm({ guard, usePin = false }: { guard: Guard; usePin?: boolean }) {
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null); setOk(null);
    if (!password) { setError(usePin ? "今の暗証番号を入力してください。" : "今のパスワードを入力してください。"); return; }
    if (!/^\d{4}$/.test(pin)) { setError("新しい暗証番号は数字4けたで入力してください。"); return; }
    if (pin !== pin2) { setError("確認用の暗証番号が一致しません。"); return; }
    setBusy(true);
    const r = await sendJson("PATCH", "/api/parent/settings", ParentSettingsResponseSchema, { changePin: { password, newPin: pin } });
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) { setOk("暗証番号を変更しました。"); setPassword(""); setPin(""); setPin2(""); }
    else setError(r.error ?? "変更できませんでした。");
  };

  return (
    <form onSubmit={submit} className="space-y-3" aria-label="暗証番号の変更">
      <FormMessage error={error} ok={ok} />
      {usePin
        ? <PinField label="今の暗証番号" value={password} onChange={setPassword} />
        : <PasswordField label="今のパスワード" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
      <div className="flex flex-wrap gap-4">
        <PinField label="新しい暗証番号" value={pin} onChange={setPin} />
        <PinField label="確認" value={pin2} onChange={setPin2} />
      </div>
      <button type="submit" className="btn btn-coin w-full" disabled={busy}>暗証番号を変更</button>
    </form>
  );
}

export function ChangePasswordForm({ guard }: { guard: Guard }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [next2, setNext2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const checks = passwordChecks(next);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null); setOk(null);
    if (!current) { setError("今のパスワードを入力してください。"); return; }
    if (!checks.every((c) => c.ok)) { setError(`新しいパスワードは${PASSWORD_RULES_JA}`); return; }
    if (next !== next2) { setError("確認用のパスワードが一致しません。"); return; }
    setBusy(true);
    const r = await sendJson("PATCH", "/api/parent/settings", ParentSettingsResponseSchema, { changePassword: { currentPassword: current, newPassword: next } });
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) { setOk("パスワードを変更しました。ほかの端末ではログアウトされます。"); setCurrent(""); setNext(""); setNext2(""); }
    else setError(r.error ?? "変更できませんでした。");
  };

  return (
    <form onSubmit={submit} className="space-y-3" aria-label="パスワードの変更">
      <FormMessage error={error} ok={ok} />
      <PasswordField label="今のパスワード" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      <PasswordField label="新しいパスワード" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)}
        hint={<span>{PASSWORD_RULES_JA} {checks.every((c) => c.ok) && <span className="font-bold text-[var(--ok)]">✔ OK</span>}</span>} />
      <PasswordField label="新しいパスワード（確認）" autoComplete="new-password" value={next2} onChange={(e) => setNext2(e.target.value)} />
      <button type="submit" className="btn btn-coin w-full" disabled={busy}>パスワードを変更</button>
    </form>
  );
}

/** 退会（2段階の確認: 注意を読んでチェック → パスワードを入れて最終確認） */
export function DeleteAccountPanel({ guard, onDeleted, usePin = false }: { guard: Guard; onDeleted: () => void; usePin?: boolean }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [agree, setAgree] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => { setStep(0); setAgree(false); setPassword(""); setError(null); };

  const submit = async () => {
    setError(null);
    if (!password) { setError(usePin ? "確認のため、暗証番号を入力してください。" : "確認のため、パスワードを入力してください。"); return; }
    setBusy(true);
    const r = await sendJson("DELETE", "/api/parent/account", AuthResultResponseSchema, { password });
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) onDeleted();
    else setError(r.error ?? "削除できませんでした。");
  };

  if (step === 0) {
    return (
      <div>
        <p className="text-sm text-[var(--ink-2)]">アカウントと、すべてのお子さまの情報・学習記録を完全に削除します。</p>
        <button type="button" className="btn btn-berry mt-3 w-full" onClick={() => setStep(1)}>退会する</button>
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-xl border-2 border-[var(--ng)]/70 bg-[var(--ng)]/10 p-3" role="group" aria-label="退会の確認">
      <FormMessage error={error} />
      {step === 1 ? (
        <>
          <p className="text-sm font-bold">退会すると、次のものがすべて削除され、元に戻すことはできません。</p>
          <ul className="list-disc space-y-0.5 pl-5 text-sm">
            <li>保護者アカウント（{usePin ? "LINE の連携・暗証番号" : "メールアドレス・パスワード・暗証番号・LINE の連携"}）</li>
            <li>すべてのお子さまの情報</li>
            <li>レッスンの記録・コイン・モンスター・テストの結果</li>
          </ul>
          <label className="flex items-start gap-2 text-sm font-bold">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--ng)]" />
            すべての記録が削除されることを理解しました
          </label>
          <div className="flex gap-2">
            <button type="button" className="btn btn-berry flex-1 !py-2 text-sm" disabled={!agree} onClick={() => setStep(2)}>次へ</button>
            <button type="button" className="btn btn-ghost flex-1 !py-2 text-sm" onClick={reset}>やめる</button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm font-black">最終確認です。{usePin ? "暗証番号" : "パスワード"}を入力して「完全に削除する」を押してください。</p>
          {usePin
            ? <PinField label="暗証番号" value={password} onChange={setPassword} />
            : <PasswordField label="パスワード" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
          <div className="flex gap-2">
            <button type="button" className="btn btn-berry flex-1 !py-2 text-sm" disabled={busy || !password} onClick={() => void submit()}>{busy ? "削除しています…" : "完全に削除する"}</button>
            <button type="button" className="btn btn-ghost flex-1 !py-2 text-sm" onClick={reset}>やめる</button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * LINE の連携（ログインに使う・Phase 3 で月ごとのレポートを受け取る）。
 *  - LINE が未設定（環境変数なし）: 小さな注意書きだけ
 *  - 連携ずみ: 表示名と「連携を解除」（LINE だけで登録したアカウントは解除できない）
 *  - 未連携: 「LINE と連携する」（LINE の画面へ移動）
 */
export function LinePanel({ guard, available, linked, displayName, canUnlink, onChanged }: {
  guard: Guard; available: boolean; linked: boolean; displayName: string | null; canUnlink: boolean; onChanged: (msg: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlink = async () => {
    setError(null);
    setBusy(true);
    const r = await sendJson("DELETE", "/api/parent/line", AuthResultResponseSchema);
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) { setConfirm(false); onChanged(r.data.messageJa || "LINE の連携を解除しました。"); }
    else setError(r.error ?? "解除できませんでした。");
  };

  if (linked) {
    return (
      <div className="space-y-3">
        <FormMessage error={error} />
        <p className="text-sm"><span className="mr-2 rounded-full bg-[#06C755] px-2 py-0.5 text-xs font-black text-white">連携ずみ</span>{displayName ? `${displayName} さんの LINE` : "LINE アカウント"}</p>
        {!available && <p className="text-xs text-[var(--ink-2)]">LINE ログインは現在設定されていません（設定されるまで LINE ではログインできません）。</p>}
        {!canUnlink ? (
          <p className="text-xs text-[var(--ink-2)]">LINE で登録したアカウントのため、連携は解除できません。</p>
        ) : confirm ? (
          <div className="flex gap-2">
            <button type="button" className="btn btn-berry flex-1 !py-2 text-sm" disabled={busy} onClick={() => void unlink()}>{busy ? "解除しています…" : "解除する"}</button>
            <button type="button" className="btn btn-ghost flex-1 !py-2 text-sm" onClick={() => setConfirm(false)}>やめる</button>
          </div>
        ) : (
          <button type="button" className="btn btn-ghost w-full !py-2 text-sm" onClick={() => setConfirm(true)}>LINE の連携を解除</button>
        )}
      </div>
    );
  }
  if (!available) {
    return <p className="text-xs text-[var(--ink-2)]">LINE ログインはまだ設定されていません（準備ができると、ここから LINE と連携できるようになります）。</p>;
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--ink-2)]">連携すると「LINEでログイン」でログインでき、月ごとの学習レポートを LINE で受け取れるようになります。</p>
      <LineLoginButton mode="link" label="LINE と連携する" />
    </div>
  );
}
