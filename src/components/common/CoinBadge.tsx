/** コイン・連続日数のバッジ（金のメダル風） */
export function CoinBadge({ coins, streak }: { coins: number; streak?: number }) {
  return (
    <div className="flex flex-col items-end gap-1.5 whitespace-nowrap text-sm font-black sm:flex-row sm:items-center">
      {streak != null && (
        <span className="rounded-full border-2 border-[#8f2350] bg-gradient-to-b from-[#ffb08a] to-[#ff6a3d] px-3 py-1 text-white shadow-[0_3px_0_#7a2a12]">🔥 {streak}日</span>
      )}
      <span className="rounded-full border-2 border-[var(--gold-deep)] bg-gradient-to-b from-[#fff1a6] to-[var(--gold)] px-3 py-1 text-[#3b2a00] shadow-[0_3px_0_var(--gold-deep)]">🪙 {coins.toLocaleString()}</span>
    </div>
  );
}
