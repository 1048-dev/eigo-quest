"use client";
import Link from "next/link";

export interface TreasureAlert { id: string; lessonNo: number; multiplier: number }

/** お宝復習アラート（ログイン時のランダムポップアップ） */
export function TreasureAlertModal({ alert, message, onClose }: { alert: TreasureAlert; message: string; onClose: () => void }) {
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="card w-full max-w-sm p-6 text-center">
        <div className="bob text-6xl" aria-hidden>🎁</div>
        <h2 className="mt-2 text-xl font-black">お宝はっけん！</h2>
        <p className="mt-3 text-[var(--ink-2)]">{message}</p>
        <p className="mt-2 text-2xl font-black text-[var(--coin)]">🪙 ×{alert.multiplier}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Link href={`/test/treasure-${alert.lessonNo}?alert=${alert.id}`} className="btn btn-coin">いますぐ ちょうせん！</Link>
          <button onClick={onClose} className="text-sm font-bold text-[var(--ink-2)]">あとで</button>
        </div>
      </div>
    </div>
  );
}
