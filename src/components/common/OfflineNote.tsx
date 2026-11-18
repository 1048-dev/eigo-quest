/**
 * 「内蔵データで表示中」の小さな目印。エラー表示ではなく、そのまま遊べることを伝えるだけ。
 * note を渡すと「記録はされません」などの補足を添える。
 */
export function OfflineNote({ show, note }: { show: boolean | null | undefined; note?: string }) {
  if (!show) return null;
  return (
    <p className="flex justify-center" aria-live="polite">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--gold)]/60 bg-black/35 px-3 py-1 text-[11px] font-bold text-[var(--on-dark-2)] backdrop-blur">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--volt)]" aria-hidden />
        おためしモードで表示中{note ? `・${note}` : ""}
      </span>
    </p>
  );
}
