/**
 * ワールド名（40ワールド）の ただ1つの もと。
 * マップ・レッスン画面・きょうのまとめ・docs/curriculum-plan.md・docs/curriculum-6year.md・README は この名前に そろえる。
 * 会話シーン（content/curriculum/worlds/world-NN.json）の 地名も この名前を つかっている。
 * worksheets/generate_worksheets.py は 下の WORLD_NAMES の ブロックを 読む（`N: "名前",` の形を 変えないこと）。
 *
 * run7: 6年カリキュラム（docs/curriculum-6year.md §4）。ワールド1〜12 = ステージ1、13〜40 = ステージ2〜5。
 * レッスンの データ（ワールドの JSON）が まだ無い ワールドも、名前・ステージ・レベルは ここで決まっている。
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
  13: "あさひの港町",
  14: "にぎわいの市場",
  15: "かぜの草原",
  16: "きおくの遺跡",
  17: "ほしふる天文台",
  18: "こだまの谷",
  19: "からくり工房",
  20: "まつりの島",
  21: "ことづての塔",
  22: "こはくの図書館",
  23: "みどりの研究所",
  24: "くもの上の鉄道",
  25: "なぞときの洞くつ",
  26: "ひびきの劇場",
  27: "いずみの里",
  28: "にじの架け橋",
  29: "かんがえる灯台",
  30: "みらい都市",
  31: "ときの回廊",
  32: "たいようの砂漠",
  33: "ほのおの火山島",
  34: "つばさの空港",
  35: "ちえの議事堂",
  36: "しんかいの都",
  37: "おとぎの迷宮",
  38: "こころの高原",
  39: "せかいの円卓",
  40: "はじまりの星",
};

/** ワールドの英語名（docs/curriculum-6year.md §4。1〜12 は マップの プレート用に つけた名前） */
export const WORLD_NAMES_EN: Readonly<Record<number, string>> = {
  1: "Forest of Beginnings", 2: "Town of Words", 3: "Harbor of the World", 4: "Riddle Mountain",
  5: "Tower of Time", 6: "Castle of Learning", 7: "Island of Light", 8: "Road of Departure",
  9: "Sky Continent", 10: "Sea of Life", 11: "City of Dreams", 12: "Kingdom of English",
  13: "Sunrise Harbor", 14: "Bustling Market", 15: "Windy Plains", 16: "Ruins of Memory",
  17: "Starfall Observatory", 18: "Echo Valley", 19: "Gadget Workshop", 20: "Festival Island",
  21: "Tower of Messages", 22: "Amber Library", 23: "Green Laboratory", 24: "Cloudtop Railway",
  25: "Cave of Riddles", 26: "Theater of Echoes", 27: "Village of Springs", 28: "Rainbow Bridge",
  29: "Lighthouse of Ideas", 30: "City of Tomorrow", 31: "Corridor of Time", 32: "Desert of the Sun",
  33: "Island of Fire", 34: "Airport of Wings", 35: "Hall of Wisdom", 36: "Deep Sea City",
  37: "Labyrinth of Tales", 38: "Highlands of the Heart", 39: "World Round Table", 40: "Star of Beginnings",
};

/** 計画上の ワールド数（6年 = 40ワールド × 30レッスン = 1,200）。実際に あそべる数は カリキュラムの 索引（TOTAL_LESSONS）で決まる */
export const WORLD_COUNT = 40;

/** ワールド番号 → 名前（知らない番号は「ワールド n」） */
export function worldName(world: number): string {
  return WORLD_NAMES[world] ?? `ワールド${world}`;
}

export function worldNameEn(world: number): string {
  return WORLD_NAMES_EN[world] ?? `World ${world}`;
}
