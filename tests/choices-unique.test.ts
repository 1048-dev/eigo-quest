import { describe, expect, it } from "vitest";
import { ASSESSMENTS, LESSONS } from "@/lib/curriculum";
import { buildLessonFlow, buildTestQuestions, type Question } from "@/lib/curriculum/questions";

/** 選択肢の 文字が かさなると どちらを えらんでも おなじに 見える（まとめテスト 1〜5 で「ジャンプして。」が 2つ 出ていた） */
function dupes(qs: readonly Question[]): string[] {
  const bad: string[] = [];
  for (const q of qs) {
    if (!q.choices) continue;
    const labels = q.choices.map((c) => c.label.trim());
    if (new Set(labels).size !== labels.length) bad.push(`${q.type} ${q.itemId}: ${labels.join(" / ")}`);
  }
  return bad;
}

describe("選択肢が かさならない", () => {
  it("すべての テスト（いくつかの seed）", () => {
    const bad: string[] = [];
    for (const a of ASSESSMENTS) for (const seed of [1, 2, 3, 42]) bad.push(...dupes(buildTestQuestions(a, { seed })).map((d) => `${a.id}: ${d}`));
    expect(bad).toEqual([]);
  });

  it("すべての レッスン（クイズ・スピードリスニング）", () => {
    const bad: string[] = [];
    for (const l of LESSONS) {
      for (const step of buildLessonFlow(l)) {
        const qs = (step as { questions?: Question[] }).questions ?? (step as { rounds?: { questions: Question[] }[] }).rounds?.flatMap((r) => r.questions) ?? [];
        bad.push(...dupes(qs).map((d) => `L${l.lessonNo}: ${d}`));
      }
    }
    expect(bad).toEqual([]);
  });
});
