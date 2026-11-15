export function CoinBadge({ coins, streak }: { coins: number; streak?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-extrabold">
      {streak != null && <span className="card px-3 py-1">🔥 {streak}日</span>}
      <span className="card px-3 py-1 text-[var(--ink)]"><span aria-hidden>🪙</span> {coins.toLocaleString()}</span>
    </div>
  );
}
