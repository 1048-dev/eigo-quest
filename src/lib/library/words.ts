/**
 * 読み上げの ハイライト用（ことばの 位置と 時間の 見つもり）。
 * lib/speech/tts.ts から 読むので、ここには 小さな 関数だけを 置く（レッスン画面の バンドルを ふやさない）。
 */

export interface WordRange { word: string; start: number; end: number }

/** 文を ことばに わける（空白で 区切る。記号は ことばに くっつけたまま。位置は 元の 文の 文字の 位置） */
export function wordRanges(text: string): WordRange[] {
  const out: WordRange[] = [];
  const re = /\S+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push({ word: m[0], start: m.index, end: m.index + m[0].length });
  return out;
}

/** 読み上げの boundary（charIndex）→ 何番目の ことばか。範囲の 外は いちばん 近い ことば */
export function wordIndexAt(ranges: readonly WordRange[], charIndex: number): number {
  if (ranges.length === 0) return -1;
  for (let i = ranges.length - 1; i >= 0; i--) if (charIndex >= ranges[i].start) return i;
  return 0;
}

/** タップした ことばを 読み上げる ときの 形（前後の 記号を とる） */
export const bareWord = (w: string) => w.replace(/^[^A-Za-z0-9']+|[^A-Za-z0-9']+$/g, "");

/** boundary イベントが 来ない ブラウザ用: ことばごとの 読み上げ時間の めやす（ms）。長い ことば・文の くぎりは 長め */
export function estimateWordDurations(text: string, rate = 1): number[] {
  const base = 330 / Math.max(0.3, rate);
  return wordRanges(text).map(({ word }) => {
    const letters = bareWord(word).length;
    const pause = /[.!?]["']?$/.test(word) ? 260 : /[,;:]["']?$/.test(word) ? 140 : 0;
    return Math.round(base * (0.6 + Math.min(letters, 12) * 0.08) + pause / Math.max(0.3, rate));
  });
}
