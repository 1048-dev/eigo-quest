/**
 * 力だめしの 問題の 読みこみ。ステージごとの JSON を あとから 読む（別チャンク）。
 * サーバー（採点）でも ブラウザ（画面・おためしモードの 採点）でも 同じ 関数を 使う。
 */
import type { YearlyTest } from "./types";

export async function loadYearlyTest(stage: number): Promise<YearlyTest | null> {
  switch (stage) {
    case 1: return (await import("@content/yearly/stage-1.json")).default as YearlyTest;
    case 2: return (await import("@content/yearly/stage-2.json")).default as YearlyTest;
    case 3: return (await import("@content/yearly/stage-3.json")).default as YearlyTest;
    case 4: return (await import("@content/yearly/stage-4.json")).default as YearlyTest;
    case 5: return (await import("@content/yearly/stage-5.json")).default as YearlyTest;
    default: return null;
  }
}
