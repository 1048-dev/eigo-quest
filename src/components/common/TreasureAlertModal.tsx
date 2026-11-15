"use client";
import Link from "next/link";
import { BirimoArt } from "@/components/characters/CharacterArt";
import { StandingFigure } from "@/components/characters/StandingArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";

export interface TreasureAlert { id: string; lessonNo: number; multiplier: number }

/** お宝復習アラート（ログイン時のランダムポップアップ）。相棒ビリモが知らせに来る */
export function TreasureAlertModal({ alert, message, onClose }: { alert: TreasureAlert; message: string; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal aria-labelledby="treasure-title" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="card rpg-rivets w-full max-w-sm p-6 text-center">
        <div className="relative mx-auto flex h-32 items-end justify-center gap-1" aria-hidden>
          <StandingFigure id="haru" pose="point" height={118} />
          <svg viewBox="0 0 100 100" className="glow h-20 w-20 bob"><BirimoArt mood="excited" /></svg>
          <MonsterFigure id="mon-019" size={60} letter="?" />
        </div>
        <h2 id="treasure-title" className="font-title mt-1 text-2xl text-[var(--gold-dark)]">お宝はっけん！</h2>
        <p className="speech mt-3 px-3 py-2 text-left text-sm font-bold">{message}</p>
        <p className="font-title mt-3 text-3xl text-[var(--gold-dark)]">🪙 ×{alert.multiplier}</p>
        <div className="mt-5 flex flex-col gap-3">
          <Link href={`/test/treasure-${alert.lessonNo}?alert=${alert.id}`} className="btn btn-coin">いますぐ ちょうせん！</Link>
          <button onClick={onClose} className="text-sm font-bold text-[var(--ink-2)] underline">あとで</button>
        </div>
      </div>
    </div>
  );
}
