/** コイン・連続日数のバッジ（宝石のメダル風） */
export function CoinBadge({ coins, streak }: { coins: number; streak?: number }) {
  const safeCoins = Number.isFinite(coins) ? coins : 0;
  return (
    <div className="flex flex-col items-end gap-1.5 whitespace-nowrap text-sm font-black sm:flex-row sm:items-center">
      {streak != null && (
        <span className="rounded-full border-2 border-[#5c0a22] bg-[radial-gradient(120%_90%_at_50%_0%,#ffc0a8,#ff6a3d_45%,#a82a10)] px-3 py-1 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.5),0_0_14px_rgba(255,106,61,.55)] [text-shadow:0_1px_0_rgba(0,0,0,.4)]">🔥 {Number.isFinite(streak) ? streak : 0}日</span>
      )}
      <span className="rounded-full border-2 border-[#6b4508] bg-[radial-gradient(120%_90%_at_50%_0%,#fff8cf,#f2c14e_45%,#b07a1c)] px-3 py-1 text-[#2a1a03] shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_0_14px_rgba(242,193,78,.55)]">🪙 {safeCoins.toLocaleString()}</span>
    </div>
  );
}
