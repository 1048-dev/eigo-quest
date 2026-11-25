/**
 * 力だめしを 受けられるか・どの ステージを 受けるか（純粋関数）。
 *  - ステージ: そのステージに 入って YEARLY_RULES.stageEntryMargin レッスン（2 ワールド）すすんだら その ステージの 問題
 *    （例: L400 は まだ ステージ1 の 仕上げ、L420 を クリアしたら ステージ2。docs/curriculum-6year.md §5 の 表と あう）
 *  - 1 年に 1 回: 前回 受けた 日の 1 年後の 同じ日から（2/29 の つぎは 3/1）
 *  - おためし（保護者なしの 学習者・オフライン）: 1 回だけ
 */
import { YEARLY_RULES } from "@/lib/domain/config";
import { STAGES } from "@/lib/curriculum/stages";
import { CURRICULUM_RULES } from "@/lib/domain/config";
import { YEARLY_STAGES } from "./spec";

/** ステージの さいしょの レッスン番号（1, 361, 601, 841, 1051） */
export const stageFirstLesson = (stage: number) => {
  const def = STAGES.find((s) => s.stage === stage) ?? STAGES[0];
  return (def.worlds[0] - 1) * CURRICULUM_RULES.lessonsPerWorld + 1;
};

/** 到達レッスン（クリアした いちばん先の レッスン）→ 受ける ステージ */
export function testStageFor(reachedLesson: number): number {
  const reached = Math.max(0, Math.floor(Number.isFinite(reachedLesson) ? reachedLesson : 0));
  let stage = 1;
  for (const s of YEARLY_STAGES) {
    if (s === 1) continue;
    if (reached >= stageFirstLesson(s) - 1 + YEARLY_RULES.stageEntryMargin) stage = s;
  }
  return stage;
}

/** "2026-11-25" → "2027-11-25"（"2028-02-29" → "2029-03-01"） */
export function oneYearAfter(day: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return day;
  const d = new Date(Date.UTC(Number(m[1]) + 1, Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10);
}

export type YearlyAvailability =
  | { available: true }
  | { available: false; reason: "WAIT"; nextOn: string }
  | { available: false; reason: "TRIAL_USED" };

/** history: これまでの 受けた日（順番は とわない） */
export function yearlyAvailability(input: { isTrial: boolean; takenDays: readonly string[]; today: string }): YearlyAvailability {
  const days = input.takenDays.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  const last = days[days.length - 1];
  if (!last) return { available: true };
  if (input.isTrial) return { available: false, reason: "TRIAL_USED" };
  const nextOn = oneYearAfter(last);
  return input.today >= nextOn ? { available: true } : { available: false, reason: "WAIT", nextOn };
}

export { formatDayJa } from "./labels";
