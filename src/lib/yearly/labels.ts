/**
 * 力だめしの 表示用の 小さな データ（CEFR バンドの はしご・保護者向けの めやす・日付）。
 * 保護者ページは これだけ 読む（採点の しくみ（scoring.ts）を ブラウザに ひきこまない）。
 */
export const BAND_LADDER = ["Pre-A1", "A1", "A1+", "A2", "A2+", "B1", "B1+", "B2"] as const;
export type Band = (typeof BAND_LADDER)[number];

export const bandIndex = (band: string) => BAND_LADDER.indexOf(band as Band);

/** 保護者向けの めやす（英検の 級の 感じ。合格の 保証では ない） */
export const BAND_EIKEN_JA: Readonly<Record<Band, string>> = {
  "Pre-A1": "英検5級の 手前",
  A1: "英検5級レベル",
  "A1+": "英検4級レベル",
  A2: "英検3級レベル",
  "A2+": "英検準2級レベル",
  B1: "英検準2級プラス〜2級レベル",
  "B1+": "英検2級レベル",
  B2: "英検準1級の 入口",
};

export const BAND_CAN_DO_JA: Readonly<Record<Band, string>> = {
  "Pre-A1": "あいさつや 好きな ものを ことば・みじかい 文で 言える",
  A1: "じぶんの ことや 身近な ことを かんたんな 文で 話せる・聞きとれる",
  "A1+": "きのうの ことや 予定を 何文か つなげて 話せる",
  A2: "身近な 話題なら 会話が つづく。みじかい メールや 説明が わかる",
  "A2+": "経験や 物語を くわしく 話し、理由を つけて 気持ちを 伝えられる",
  B1: "意見を 理由と いっしょに 言える。身近な 社会の 話題で 話し合える",
  "B1+": "発表や 話し合いで じぶんの 考えを わかりやすく 説明できる",
  B2: "いろいろな 話題で 自然に やりとりでき、ちがう 意見にも 理由で こたえられる",
};

/** 「2027年11月25日」 */
export function formatDayJa(day: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  return m ? `${Number(m[1])}年${Number(m[2])}月${Number(m[3])}日` : day;
}
