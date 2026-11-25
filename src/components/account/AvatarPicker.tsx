"use client";
/**
 * アバター（キャラクター）を えらぶ（ハル・リコ・キコ・ビリモ）。
 * 子どもを追加・編集するとき（おうちの方）と、ヘッダーの「かおを かえる」シートで使う。
 */
import { useEffect, useState } from "react";
import { Portrait } from "@/components/characters/CharacterArt";
import { AVATAR_CHARACTERS, AVATAR_LABELS_JA, type AvatarCharacter } from "@/lib/domain/avatars";
import { avatarFor } from "@/lib/auth/client";

export function AvatarPicker({ value, onChange, name, legend = "キャラクター", size = 52, disabled = false }: {
  value: AvatarCharacter;
  onChange: (a: AvatarCharacter) => void;
  /** ラジオボタンの name（ページ内で一意） */
  name: string;
  legend?: string;
  size?: number;
  disabled?: boolean;
}) {
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-1 text-sm font-black">{legend}</legend>
      <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={legend}>
        {AVATAR_CHARACTERS.map((id) => {
          const a = avatarFor(id, undefined, id);
          const on = value === id;
          return (
            <label key={id}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 p-1.5 transition ${on ? "border-[var(--volt)] bg-[var(--volt)]/15 shadow-[0_0_14px_rgba(255,216,58,.45)]" : "border-[var(--gold)]/40 bg-black/30 hover:bg-black/45"}`}>
              <input type="radio" name={name} value={id} checked={on} onChange={() => onChange(id)} className="sr-only" />
              <span className="grid place-items-center rounded-full" style={{ background: a.bg, width: size + 6, height: size + 6 }} aria-hidden>
                <Portrait id={id} size={size} ring={a.ring} />
              </span>
              <span className={`text-xs font-black ${on ? "text-[var(--volt)]" : ""}`}>{AVATAR_LABELS_JA[id]}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** 画面の下から出る小さなシート: 子どもが じぶんで 顔を えらびなおす */
export function AvatarSheet({ open, current, nickname, busy, error, onPick, onClose }: {
  open: boolean;
  current: AvatarCharacter;
  nickname: string;
  busy: boolean;
  error: string | null;
  onPick: (a: AvatarCharacter) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState<AvatarCharacter>(current);
  useEffect(() => { if (open) setValue(current); }, [open, current]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="avatar-title" className="card rpg-rivets w-full max-w-sm p-4" onClick={(e) => e.stopPropagation()}>
        <h2 id="avatar-title" className="rpg-title text-center text-lg">{nickname}さんの キャラクター</h2>
        <p className="mb-3 mt-1 text-center text-xs text-[var(--ink-2)]">すきな キャラクターを えらんでね</p>
        <AvatarPicker name="avatar-sheet" legend="キャラクターを えらぶ" value={value} onChange={setValue} disabled={busy} />
        {error && <p role="alert" className="mt-2 text-center text-sm font-bold text-[var(--ng)]">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" className="btn btn-coin flex-1 !py-2" disabled={busy} onClick={() => (value === current ? onClose() : onPick(value))}>
            {busy ? "かえているよ…" : "これに する"}
          </button>
          <button type="button" className="btn btn-ghost flex-1 !py-2" onClick={onClose}>やめる</button>
        </div>
      </div>
    </div>
  );
}
