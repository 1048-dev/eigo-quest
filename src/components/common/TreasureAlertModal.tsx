"use client";
import Link from "next/link";
import { BirimoArt } from "@/components/characters/CharacterArt";

export interface TreasureAlert { id: string; lessonNo: number; multiplier: number }

/** お宝復習アラート（ログイン時のランダムポップアップ）。相棒ビリモが知らせに来る */
export function TreasureAlertModal({ alert, message, onClose }: { alert: TreasureAlert; message: string; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal aria-labelledby="treasure-title" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="card rpg-rivets w-full max-w-sm p-6 text-center">
        <div className="relative mx-auto h-28 w-40">
          <span className="absolute left-2 top-6 text-6xl bob" aria-hidden>🧰</span>
          <svg viewBox="0 0 100 100" className="glow absolute right-0 top-0 h-24 w-24" aria-hidden><BirimoArt mood="excited" /></svg>
        </div>
        <h2 id="treasure-title" className="font-pixel mt-1 text-2xl text-[var(--gold-dark)]">お宝はっけん！</h2>
        <p className="speech mt-3 px-3 py-2 text-left text-sm font-bold">{message}</p>
        <p className="font-pixel mt-3 text-3xl text-[var(--gold-dark)]">🪙 ×{alert.multiplier}</p>
        <div className="mt-5 flex flex-col gap-3">
          <Link href={`/test/treasure-${alert.lessonNo}?alert=${alert.id}`} className="btn btn-coin">いますぐ ちょうせん！</Link>
          <button onClick={onClose} className="text-sm font-bold text-[var(--ink-2)] underline">あとで</button>
        </div>
      </div>
    </div>
  );
}
