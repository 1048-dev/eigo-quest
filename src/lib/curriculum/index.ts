/**
 * カリキュラム読み込み層。
 * content/curriculum/lessons.json（唯一の正）→ 学習項目（LearningItem）とテスト定義（Assessment）を
 * ルールで展開する。DB seed・API・Python PDF生成スクリプトの三者が同じルールを使う。
 */
import raw from "@content/curriculum/lessons.json";
import type { AssessmentDef, ItemKind, LearningItemDef, LessonDef, Skill } from "@/lib/domain/types";
import { CURRICULUM_RULES } from "@/lib/domain/config";

const data = raw as { meta: { teacher: { name: string; nameJa: string } }; lessons: LessonDef[] };

export const TEACHER = data.meta.teacher;
export const LESSONS: readonly LessonDef[] = data.lessons;
export const TOTAL_LESSONS = LESSONS.length;

export function getLesson(lessonNo: number): LessonDef | undefined {
  return LESSONS.find((l) => l.lessonNo === lessonNo);
}

const pad = (n: number) => String(n).padStart(3, "0");
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9_]+/g, "-").replace(/^-|-$/g, "") || "x";

function skillsFor(kind: ItemKind, core: boolean): Skill[] {
  switch (kind) {
    case "WORD":
      return core
        ? ["VOCABULARY", "LISTENING", "SPEAKING", "WRITING", "SCHOOL_TEST"]
        : ["VOCABULARY", "LISTENING", "SPEAKING"];
    case "EXPRESSION":
      return core ? ["SCHOOL_TEST", "LISTENING", "SPEAKING", "WRITING"] : ["SCHOOL_TEST", "LISTENING", "SPEAKING"];
    case "COMMAND":
      return ["LISTENING", "SPEAKING"]; // TPR: 聞いて即反応＝リスニング反射力
    case "PHONICS":
      return ["PHONICS", "LISTENING"];
  }
}

/** 1レッスン → 学習項目リスト（ID は安定：L001-W-hello） */
export function itemsOfLesson(lesson: LessonDef): LearningItemDef[] {
  const p = `L${pad(lesson.lessonNo)}`;
  const items: LearningItemDef[] = [];
  const push = (kind: ItemKind, code: string, text: string, ja: string, emoji: string | undefined, core: boolean) =>
    items.push({
      id: `${p}-${code}-${slug(text)}`,
      lessonNo: lesson.lessonNo,
      kind,
      text,
      ja,
      emoji,
      schoolCore: core,
      skills: skillsFor(kind, core),
    });

  for (const v of lesson.vocab) push("WORD", "W", v.en, v.ja, v.emoji, !!v.core);
  lesson.school.expressions.forEach((e, i) => push("EXPRESSION", `E${i + 1}`, e.en, e.ja, undefined, !!e.core));
  for (const c of lesson.tpr) push("COMMAND", "C", c.en, c.ja, c.emoji, false);
  for (const w of lesson.phonics.words) push("PHONICS", "P", w, lesson.phonics.tipJa, undefined, false);
  return items;
}

export const ALL_ITEMS: readonly LearningItemDef[] = LESSONS.flatMap(itemsOfLesson);

export function itemsInRange(start: number, end: number): LearningItemDef[] {
  return ALL_ITEMS.filter((i) => i.lessonNo >= start && i.lessonNo <= end);
}

export function getItem(id: string): LearningItemDef | undefined {
  return ALL_ITEMS.find((i) => i.id === id);
}

/**
 * テスト定義をルールで生成。
 *  - DAILY_CHECK: すべてのレッスンの「復習クエスト」（完了の翌日から受けられる。進行はブロックしない＝unlocksLesson null）
 *  - MINI: 5レッスンごと（1-5, 6-10, ...。30の倍数は BOSS が兼ねる）→ 次のレッスンを開くゲート
 *  - BOSS: 30レッスンごと（ボスは範囲 1〜n の累積）→ 次のレッスンを開くゲート
 *  - ARENA: ボス合格ごとに「直近30」と「1〜n累積」の2種
 */
export function buildAssessments(totalLessons = TOTAL_LESSONS): AssessmentDef[] {
  const r = CURRICULUM_RULES;
  const list: AssessmentDef[] = [];
  for (let n = 1; n <= totalLessons; n++) {
    list.push({ id: `check-${n}`, kind: "DAILY_CHECK", rangeStart: n, rangeEnd: n, questionCount: r.checkQuestions, passRate: r.checkPassRate, unlocksLesson: null });
    if (n % r.bossEvery === 0) {
      // さいごの ボス（全レッスンの あと）は ひらく レッスンが ないので null（「Lesson 361 が ひらいた」と 出さない）
      list.push({ id: `boss-1-${n}`, kind: "BOSS", rangeStart: 1, rangeEnd: n, questionCount: r.bossQuestions, passRate: r.bossPassRate, unlocksLesson: n < totalLessons ? n + 1 : null });
      list.push({ id: `arena-${n - r.bossEvery + 1}-${n}`, kind: "ARENA", rangeStart: n - r.bossEvery + 1, rangeEnd: n, questionCount: r.arenaQuestions, passRate: r.arenaCoinMinScore, unlocksLesson: null });
      if (n > r.bossEvery) {
        list.push({ id: `arena-1-${n}`, kind: "ARENA", rangeStart: 1, rangeEnd: n, questionCount: r.arenaQuestions, passRate: r.arenaCoinMinScore, unlocksLesson: null });
      }
    } else if (n % r.miniTestEvery === 0) {
      list.push({ id: `mini-${n - r.miniTestEvery + 1}-${n}`, kind: "MINI", rangeStart: n - r.miniTestEvery + 1, rangeEnd: n, questionCount: r.miniQuestions, passRate: r.miniPassRate, unlocksLesson: n + 1 });
    }
  }
  return list;
}

export const ASSESSMENTS: readonly AssessmentDef[] = buildAssessments();

export function getAssessment(id: string): AssessmentDef | undefined {
  return ASSESSMENTS.find((a) => a.id === id);
}

/** レッスン n の後にある「ゲート」（まとめ / ボス）。合格すると次のレッスンが開く。無ければ undefined */
export function gateTestAfterLesson(n: number): AssessmentDef | undefined {
  return ASSESSMENTS.find((a) => (a.kind === "MINI" || a.kind === "BOSS") && a.rangeEnd === n);
}

/** レッスン n の復習クエスト（完了の翌日から。進行はブロックしない） */
export function reviewQuestFor(n: number): AssessmentDef | undefined {
  return ASSESSMENTS.find((a) => a.kind === "DAILY_CHECK" && a.rangeEnd === n);
}
