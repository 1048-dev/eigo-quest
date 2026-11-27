/**
 * カリキュラム読み込み層。
 * content/curriculum/worlds/world-NN.json（ワールドごとの レッスン。唯一の正）→ 学習項目（LearningItem）とテスト定義（Assessment）を
 * ルールで展開する。DB seed・API・Python PDF生成スクリプトの三者が同じルールを使う。
 *
 * run7 Phase 2（1,200 レッスンでも速く）:
 *  - 小さな 索引 content/curriculum/index.json（先生・レッスン数・ワールドの範囲）だけを いつも 読む。
 *    TOTAL_LESSONS・テスト定義（ASSESSMENTS）は 索引だけで 決まる。
 *  - サーバー（Node）では bundledWorlds.ts が 全ワールドを 読みこむので、getLesson などは そのまま 同期で使える。
 *  - ブラウザでは bundledWorlds が 空に 差しかわる（next.config.ts）。おためし・オフラインで レッスンや テストを 作る前に
 *    ensureLessonsLoaded(start, end) で 必要な ワールドの JSON だけを あとから 読みこむ（ワールドごとの チャンク）。
 */
import indexRaw from "@content/curriculum/index.json";
import type { AssessmentDef, ItemKind, LearningItemDef, LessonDef, Skill } from "@/lib/domain/types";
import { CURRICULUM_RULES } from "@/lib/domain/config";
import { BUNDLED_WORLDS } from "./bundledWorlds";
import { levelOfWorld, stageOfWorld } from "./stages";
import type { CurriculumIndex, WorldFile, WorldIndexEntry } from "./types";

const INDEX = indexRaw as CurriculumIndex;

export const TEACHER = INDEX.meta.teacher;
/** あそべる レッスンの数（索引から。ワールドの JSON を 足して npm run curriculum:index すると ふえる） */
export const TOTAL_LESSONS = INDEX.totalLessons;
/** ワールドの 一覧（ステージ・レベル・レッスンの範囲・ファイル名） */
export const CURRICULUM_WORLDS: readonly WorldIndexEntry[] = INDEX.worlds;

const lessonMap = new Map<number, LessonDef>();
const loadedWorlds = new Set<number>();
const itemCache = new Map<number, LearningItemDef[]>();

/**
 * run10: かいわの 目標「It's in ～.」の お手本（タップの 候補・「Say, …」）に つかう 文として、その回の 学校の 表現を つける。
 * 台本に その 形の 文が ない ときに「It's in ....」と 出さない ため（conversation/engine.ts の concreteTarget）
 */
function withExamples(l: LessonDef): LessonDef["conversation"] {
  const c = l.conversation;
  if (!c) return c;
  // JSON の aiTask.examples（台本にも 学校の 表現にも ない 形の お手本）を 先に、そのあと 学校の 表現
  const examples = [...new Set([...(c.aiTask.examples ?? []), ...l.school.expressions.map((e) => e.en)].filter((s) => s.trim()))];
  return { ...c, aiTask: { ...c.aiTask, examples } };
}

/** ワールドの ファイルを 登録する（stage / level が 無い レッスンには ワールドの 値を 入れる） */
export function registerWorld(file: WorldFile): void {
  if (loadedWorlds.has(file.world)) return;
  const stage = file.stage ?? stageOfWorld(file.world);
  const level = file.level ?? levelOfWorld(file.world);
  for (const l of file.lessons) lessonMap.set(l.lessonNo, { ...l, stage: l.stage ?? stage, level: l.level ?? level, conversation: withExamples(l) });
  loadedWorlds.add(file.world);
}
for (const w of BUNDLED_WORLDS) registerWorld(w);

/**
 * 読みこまれている 全レッスン（番号順）。サーバー（Node）では 全部。ブラウザでは モジュールを 読んだ ときには 空なので使わない
 * （ブラウザで 使うのは getLesson / itemsInRange / getItem と ensureLessonsLoaded）。
 */
export const LESSONS: readonly LessonDef[] = [...lessonMap.values()].sort((a, b) => a.lessonNo - b.lessonNo);

export function getLesson(lessonNo: number): LessonDef | undefined {
  return lessonMap.get(lessonNo);
}

/** start〜end の レッスンを ふくむ ワールド（索引から） */
export function worldsInRange(start: number, end: number): WorldIndexEntry[] {
  return CURRICULUM_WORLDS.filter((w) => w.lastLesson >= start && w.firstLesson <= end);
}

export const isWorldLoaded = (world: number) => loadedWorlds.has(world);

const pending = new Map<number, Promise<void>>();
/**
 * start〜end の レッスンが 使えるように する（まだ 読んでいない ワールドの JSON だけ 読みこむ）。
 * サーバーでは すでに 全部 あるので すぐ おわる。ブラウザでは ワールドごとの チャンクを 取りに行く。
 */
export async function ensureLessonsLoaded(start: number, end = start): Promise<void> {
  const need = worldsInRange(start, end).filter((w) => !loadedWorlds.has(w.world));
  await Promise.all(need.map((w) => {
    let p = pending.get(w.world);
    if (!p) {
      const no = String(w.world).padStart(2, "0");
      p = import(`../../../content/curriculum/worlds/world-${no}.json`)
        .then((m: { default?: WorldFile } & Partial<WorldFile>) => registerWorld((m.default ?? m) as WorldFile))
        .finally(() => pending.delete(w.world));
      pending.set(w.world, p);
    }
    return p;
  }));
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

/** レッスン n の 学習項目（キャッシュ。読みこまれていなければ 空。中身は 書きかえないこと） */
function cachedItems(lessonNo: number): readonly LearningItemDef[] {
  let items = itemCache.get(lessonNo);
  if (!items) {
    const lesson = lessonMap.get(lessonNo);
    if (!lesson) return [];
    items = itemsOfLesson(lesson);
    itemCache.set(lessonNo, items);
  }
  return items;
}

/** 全学習項目（サーバー用。LESSONS と同じく ブラウザでは 空） */
export const ALL_ITEMS: readonly LearningItemDef[] = LESSONS.flatMap((l) => cachedItems(l.lessonNo));

export function itemsInRange(start: number, end: number): LearningItemDef[] {
  const out: LearningItemDef[] = [];
  const last = Math.min(end, TOTAL_LESSONS);
  for (let n = Math.max(1, start); n <= last; n++) out.push(...cachedItems(n));
  return out;
}

/** 覚えた ことばの数（完了した レッスンの 単語＝vocab を、大文字小文字を そろえて 重ならないように 数える） */
export function countWordsLearned(lessonNos: Iterable<number>): number {
  const words = new Set<string>();
  for (const n of lessonNos) for (const v of lessonMap.get(n)?.vocab ?? []) words.add(v.en.trim().toLowerCase());
  return words.size;
}

/** 項目 ID（L001-W-hello）の 先頭の レッスン番号から さがす */
export function getItem(id: string): LearningItemDef | undefined {
  const m = /^L(\d+)-/.exec(id);
  if (!m) return undefined;
  return cachedItems(Number(m[1])).find((i) => i.id === id);
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

// 1,200 レッスンでは テストが 約1,500 こ。マップ（全ノード）を作るたびに find しないよう 引ける表にしておく
const assessmentById = new Map(ASSESSMENTS.map((a) => [a.id, a]));
const gateByEnd = new Map(ASSESSMENTS.filter((a) => a.kind === "MINI" || a.kind === "BOSS").map((a) => [a.rangeEnd, a]));
const checkByEnd = new Map(ASSESSMENTS.filter((a) => a.kind === "DAILY_CHECK").map((a) => [a.rangeEnd, a]));

export function getAssessment(id: string): AssessmentDef | undefined {
  return assessmentById.get(id);
}

/** レッスン n の後にある「ゲート」（まとめ / ボス）。合格すると次のレッスンが開く。無ければ undefined */
export function gateTestAfterLesson(n: number): AssessmentDef | undefined {
  return gateByEnd.get(n);
}

/** レッスン n の復習クエスト（完了の翌日から。進行はブロックしない） */
export function reviewQuestFor(n: number): AssessmentDef | undefined {
  return checkByEnd.get(n);
}
