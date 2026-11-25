/**
 * ワールド名（12ワールド）の ただ1つの もと。
 * マップ・レッスン画面・きょうのまとめ・docs/curriculum-plan.md・README は この名前に そろえる。
 * 会話シーン（content/curriculum/lessons.json）の 地名も この名前を つかっている。
 */
export const WORLD_NAMES: Readonly<Record<number, string>> = {
  1: "はじまりの森",
  2: "ことばの町",
  3: "せかいの港",
  4: "なぞなぞ山",
  5: "じかんの塔",
  6: "まなびの城",
  7: "ひかりの島",
  8: "たびだちの道",
  9: "そらの大陸",
  10: "いのちの海",
  11: "ゆめの都",
  12: "えいごの王国",
};

export const WORLD_COUNT = 12;

/** ワールド番号 → 名前（知らない番号は「ワールド n」） */
export function worldName(world: number): string {
  return WORLD_NAMES[world] ?? `ワールド${world}`;
}
