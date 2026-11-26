/** seed 付き乱数で ならべかえる（Fisher–Yates）。questions.ts と ワールドごとの 問題（phonicsQ/wNN.ts）で つかう */
export function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
