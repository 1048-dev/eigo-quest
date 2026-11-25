/**
 * カリキュラム全体の検証（content/curriculum/worlds/world-NN.json と 索引 index.json・titles.json）。
 * 新しいワールドを追加したら（npm run curriculum:index のあと）、このテストが通ることを確認する。
 * ワールドの数に よらず 動く（run7: 40 ワールド・1,200 レッスンまで）。
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import indexRaw from "@content/curriculum/index.json";
import titlesRaw from "@content/curriculum/titles.json";
import { ALL_ITEMS, ASSESSMENTS, CURRICULUM_WORLDS, LESSONS, TEACHER, TOTAL_LESSONS, itemsOfLesson } from "@/lib/curriculum";
import { BUNDLED_WORLDS } from "@/lib/curriculum/bundledWorlds";
import { CEFR_LEVELS, levelOfWorld, stageOfWorld } from "@/lib/curriculum/stages";
import { WORLD_COUNT, WORLD_NAMES } from "@/lib/game/worlds";
import { buildLessonFlow } from "@/lib/curriculum/questions";
import { teamSound } from "@/lib/curriculum/vowelTeams";
import { findRSpellings } from "@/lib/curriculum/rControlled";
import { G_HARD_WORDS, cgSounds, ySound } from "@/lib/curriculum/w10Phonics";
import { ER_MORE_WORDS, edSound } from "@/lib/curriculum/w11Phonics";
import { LessonResponseSchema } from "@/lib/api/contracts";

const CAST = ["Haru", "Riko", "Kiko", "Birimo", "Ms. Emma"];
const JA = /[぀-ヿ一-鿿]/; // ひらがな・カタカナ・漢字
const ne = z.string().trim().min(1);
const en = ne.refine((s) => !JA.test(s), "英語の欄に日本語が入っている");
const ja = ne.refine((s) => JA.test(s), "日本語の欄に日本語が無い");

const LessonSchema = z.object({
  lessonNo: z.number().int().positive(),
  world: z.number().int().positive(),
  title: en,
  titleJa: ja,
  stage: z.number().int().min(1).max(5).optional(),
  level: z.enum(CEFR_LEVELS).optional(),
  school: z.object({
    // ステージ1 は 小1〜小6、ステージ2 以降は「中1」「中2」「中3」「高校初級」「高校」（docs/curriculum-6year.md §9）
    grade: z.string().regex(/^(小[1-6]|中[1-3]|高校)/),
    topic: ja,
    grammar: ne,
    expressions: z.array(z.object({ en, ja, core: z.boolean().optional() })).min(1),
    testPoints: z.array(ne).min(1),
  }),
  tpr: z.array(z.object({ en, ja, action: ja, emoji: ne })).min(1),
  phonics: z.object({ rule: ne, focus: z.array(ne).min(1), sounds: z.array(ne), words: z.array(en).min(1), tipJa: ja }),
  vocab: z.array(z.object({ en, ja, emoji: ne, core: z.boolean().optional() })).min(1),
  teacherScript: ne,
  conversation: z.object({
    scene: en,
    sceneJa: ja,
    lines: z.array(z.object({ speaker: z.enum(CAST as [string, ...string[]]), en, ja })).min(3),
    aiTask: z.object({ goalJa: ja, starterEn: en, targetExpressions: z.array(ne).min(1) }),
  }).optional(),
  recap: z.object({ highlightsJa: z.array(ne).min(1) }).optional(),
});

/** ワールド → 学年（docs/curriculum-plan.md。ステージ2 以降は 中学・高校の めやす） */
const gradeOfWorld = (w: number) => (w <= 2 ? `小${w}` : w <= 4 ? "小3" : w <= 6 ? "小4" : w <= 8 ? "小5" : w <= 12 ? "小6" : /^(中[1-3]|高校)/);

/** フォーカス（"a_e" のような magic e、"sun-set" のような 2つに わける語も）を正規表現に */
const focusRe = (f: string) => new RegExp(f.toLowerCase().replace(/-/g, "").replace(/_/g, "[a-z]"));

const WORLDS_DIR = path.join(__dirname, "..", "content", "curriculum", "worlds");
const worldFiles = readdirSync(WORLDS_DIR).filter((f) => f.endsWith(".json")).sort();
const rawWorlds = worldFiles.map((f) => ({ f, data: JSON.parse(readFileSync(path.join(WORLDS_DIR, f), "utf8")) as { world: number; stage: number; level: string; lessons: unknown[] } }));
const rawLessons = rawWorlds.flatMap((w) => w.data.lessons);
const index = indexRaw as { meta: { lessonsPerWorld: number; miniTestEvery: number; teacher: { name: string } }; totalLessons: number; worlds: { world: number; file: string; stage: number; level: string; firstLesson: number; lastLesson: number; lessonCount: number }[] };

describe("カリキュラム: スキーマ", () => {
  it("meta がある", () => {
    expect(index.meta.lessonsPerWorld).toBe(30);
    expect(index.meta.miniTestEvery).toBe(5);
    expect(TEACHER.name).toBe("Ms. Emma");
  });

  it.each(rawLessons.map((l, i) => [(l as { lessonNo?: number }).lessonNo ?? `index ${i}`, l]))("レッスン %s がスキーマどおり", (_n, l) => {
    const r = LessonSchema.safeParse(l);
    expect(r.success ? "ok" : JSON.stringify(r.error.issues.slice(0, 5), null, 1)).toBe("ok");
  });
});

describe("カリキュラム: ワールドの ファイルと 索引（run7）", () => {
  it("ファイル名は world-NN.json、中身の world と そろう。ステージ・レベルは 計画どおり", () => {
    expect(worldFiles.length).toBeGreaterThan(0);
    expect(worldFiles.length).toBeLessThanOrEqual(WORLD_COUNT);
    for (const { f, data } of rawWorlds) {
      expect(f).toBe(`world-${String(data.world).padStart(2, "0")}.json`);
      expect(data.stage, f).toBe(stageOfWorld(data.world));
      expect(data.level, f).toBe(levelOfWorld(data.world));
      expect(data.lessons.length, f).toBe(30);
      expect(WORLD_NAMES[data.world], f).toBeTruthy();
    }
  });

  it("ワールドは 1 から 抜けなく つづく（とちゅうの ワールドが 無いと レッスン番号が つながらない）", () => {
    expect(rawWorlds.map((w) => w.data.world)).toEqual(rawWorlds.map((_, i) => i + 1));
  });

  it("index.json は ワールドの ファイルと 一致（ずれていたら npm run curriculum:index）", () => {
    expect(index.totalLessons).toBe(rawLessons.length);
    expect(TOTAL_LESSONS).toBe(LESSONS.length);
    expect(index.worlds).toEqual(rawWorlds.map(({ f, data }) => {
      const ls = data.lessons as { lessonNo: number }[];
      return { world: data.world, file: f, stage: data.stage, level: data.level, firstLesson: ls[0].lessonNo, lastLesson: ls[ls.length - 1].lessonNo, lessonCount: ls.length };
    }));
    expect(CURRICULUM_WORLDS).toEqual(index.worlds);
  });

  it("titles.json は 全レッスンの タイトルと 一致", () => {
    const t = (titlesRaw as { lessons: { lessonNo: number; world: number; stage: number; title: string; titleJa: string }[] }).lessons;
    expect(t).toEqual(LESSONS.map((l) => ({ lessonNo: l.lessonNo, world: l.world, stage: l.stage, title: l.title, titleJa: l.titleJa })));
  });

  it("サーバー用の bundledWorlds.ts は 全ワールドを 読みこむ", () => {
    expect(BUNDLED_WORLDS.map((w) => w.world)).toEqual(index.worlds.map((w) => w.world));
  });

  it("どのレッスンにも stage と level が入る（ファイルに 無ければ ワールドの 値）", () => {
    for (const l of LESSONS) {
      expect(l.stage, `L${l.lessonNo}`).toBe(stageOfWorld(l.world));
      expect(CEFR_LEVELS as readonly string[], `L${l.lessonNo}`).toContain(l.level);
    }
  });
});

describe("カリキュラム: 全体の整合性", () => {
  it("lessonNo は 1 から連番で重複なし、ワールドは 30 ごと", () => {
    LESSONS.forEach((l, i) => {
      expect(l.lessonNo).toBe(i + 1);
      expect(l.world).toBe(Math.ceil(l.lessonNo / 30));
    });
    expect(new Set(LESSONS.map((l) => l.lessonNo)).size).toBe(LESSONS.length);
  });

  it("学年はワールドの計画どおり", () => {
    for (const l of LESSONS) {
      const g = gradeOfWorld(l.world);
      expect(typeof g === "string" ? l.school.grade.startsWith(g) : g.test(l.school.grade), `L${l.lessonNo}: ${l.school.grade}`).toBe(true);
    }
  });

  it("学習項目 ID とテスト ID がすべてユニーク", () => {
    const ids = ALL_ITEMS.map((i) => i.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    expect(dup).toEqual([]);
    const aids = ASSESSMENTS.map((a) => a.id);
    expect(new Set(aids).size).toBe(aids.length);
  });

  it("各レッスンに単語・表現・TPR・フォニックスの項目がそろっている", () => {
    for (const l of LESSONS) {
      const kinds = new Set(itemsOfLesson(l).map((i) => i.kind));
      expect([...kinds].sort(), `L${l.lessonNo}`).toEqual(["COMMAND", "EXPRESSION", "PHONICS", "WORD"]);
      expect(itemsOfLesson(l).some((i) => i.schoolCore), `L${l.lessonNo} に core が無い`).toBe(true);
    }
  });

  it("フォニックスの単語は、その回のフォーカス（つづり）を含む", () => {
    for (const l of LESSONS) {
      if (l.phonics.rule === "sight-words") continue;
      const res = l.phonics.focus.map(focusRe);
      for (const w of l.phonics.words) {
        expect(res.some((re) => re.test(w.toLowerCase())), `L${l.lessonNo}: "${w}" に ${l.phonics.focus.join(",")} が無い`).toBe(true);
      }
    }
  });

  it("core の表現（スペル問題になる）には ― や ～ を入れない", () => {
    for (const l of LESSONS) for (const e of l.school.expressions.filter((x) => x.core)) expect(e.en, `L${l.lessonNo}`).not.toMatch(/[―～]/);
  });

  it("フォニックスの単語はレッスン内で重複しない", () => {
    for (const l of LESSONS) expect(new Set(l.phonics.words).size, `L${l.lessonNo}`).toBe(l.phonics.words.length);
  });

  it("すべてのレッスンに会話シーンと まとめハイライトがある", () => {
    for (const l of LESSONS) {
      expect(l.conversation, `L${l.lessonNo} に conversation が無い`).toBeDefined();
      expect(l.recap?.highlightsJa.length ?? 0, `L${l.lessonNo} に recap が無い`).toBeGreaterThan(0);
    }
  });

  it("どのレッスンもレッスンフローを作れて、API 契約を通しても会話が残る", () => {
    for (const l of LESSONS) {
      const steps = buildLessonFlow(l);
      expect(steps.length).toBe(9);
      expect(steps[steps.length - 1].kind).toBe("conversation");
      const v = LessonResponseSchema.parse(JSON.parse(JSON.stringify({ lesson: l, teacher: TEACHER, items: itemsOfLesson(l), steps })));
      expect(v.lesson?.conversation?.lines.length).toBe(l.conversation?.lines.length);
      expect(v.lesson?.conversation?.aiTask.starterEn).toBe(l.conversation?.aiTask.starterEn);
    }
  });
});

describe("カリキュラム: ワールド1 の決まりごと", () => {
  const l1 = LESSONS[0];
  it("Session 1: Look! / Stop! / Come here! / Go!、Hello. I'm ～.、s と a", () => {
    expect(l1.tpr.map((t) => t.en)).toEqual(expect.arrayContaining(["Look!", "Stop!", "Come here!", "Go!"]));
    expect(l1.school.expressions.some((e) => /^Hello\. I'm \w+\.$/.test(e.en))).toBe(true);
    expect(l1.phonics.focus).toEqual(["s", "a"]);
  });

  it("ワールド1 で 26 の文字の音（qu をふくむ）を順に扱う", () => {
    const seq = "s a t p i n m d g o c k e u r h b f l j v w x y z qu".split(" ");
    const taught = LESSONS.filter((l) => l.world === 1 && l.phonics.rule === "letter-sound").flatMap((l) => l.phonics.focus);
    expect(taught).toEqual(seq);
  });

  it("Session 30 はワールドのまとめで、スピード TPR がある", () => {
    const l30 = LESSONS.find((l) => l.lessonNo === 30);
    if (!l30) return; // ワールド1 が未完成のときはスキップ
    expect(l30.phonics.rule).toBe("review");
    expect(l30.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });
});

describe("カリキュラム: ワールド2 の決まりごと", () => {
  const w2 = LESSONS.filter((l) => l.world === 2);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);

  it("ワールド2 は 31〜60 の 30 レッスン", () => {
    if (w2.length === 0) return; // 未作成ならスキップ
    expect(w2.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 31 + i));
  });

  it("短母音の CVC を a → i → o → e → u の順に、5レッスンずつ（5の倍数はふりかえり）", () => {
    if (w2.length === 0) return;
    "aioeu".split("").forEach((v, b) => {
      for (let k = 0; k < 5; k++) {
        const l = at(31 + b * 5 + k)!;
        expect(l.phonics.focus, `L${l.lessonNo}`).toEqual([v]);
        expect(l.phonics.rule, `L${l.lessonNo}`).toBe(k === 4 ? "review" : "cvc");
        // CVC: 子音-短母音-子音 の3文字（box の x もふくむ）
        for (const w of l.phonics.words) expect(w, `L${l.lessonNo}`).toMatch(new RegExp(`^[b-df-hj-np-tv-z]${v}[b-df-hj-np-tv-z]$`));
      }
    });
  });

  it("L56〜59 は ff ll ss zz（floss）、L60 はワールドのまとめでスピード TPR", () => {
    if (w2.length === 0) return;
    expect([56, 57, 58, 59].map((n) => at(n)!.phonics.focus)).toEqual([["ff"], ["ll"], ["ss"], ["zz"]]);
    const l60 = at(60)!;
    expect(l60.phonics.rule).toBe("review");
    expect(l60.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("学年は小2、表現の型が計画どおり入っている", () => {
    if (w2.length === 0) return;
    const grammar = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(grammar(31, 35)).toContain("What do you like?");
    expect(grammar(36, 40)).toContain("I want");
    expect(grammar(41, 45)).toContain("Can it");
    expect(grammar(46, 50)).toMatch(/Where is .*It's (on|in|under)/s);
    expect(grammar(51, 55)).toContain("Let's go to the");
    expect(grammar(51, 55)).toContain("By bus!");
    expect(grammar(56, 60)).toContain("I like summer.");
    expect(grammar(56, 60)).toContain("Happy New Year!");
  });
});

describe("カリキュラム: ワールド3 の決まりごと", () => {
  const w3 = LESSONS.filter((l) => l.world === 3);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);

  it("ワールド3 は 61〜90 の 30 レッスン、学年は小3", () => {
    if (w3.length === 0) return; // 未作成ならスキップ
    expect(w3.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 61 + i));
    for (const l of w3) expect(l.school.grade).toBe("小3");
  });

  it("ダイグラフを sh → ch → th → wh → ck・ng・nk の順に（ブロックの最後はふりかえり）", () => {
    if (w3.length === 0) return;
    const plan: [number, string][] = [[61, "sh"], [66, "ch"], [71, "th"], [76, "wh"]];
    for (const [start, focus] of plan) {
      for (let k = 0; k < 5; k++) {
        const l = at(start + k)!;
        expect(l.phonics.focus, `L${l.lessonNo}`).toEqual([focus]);
        expect(l.phonics.rule, `L${l.lessonNo}`).toBe(k === 4 ? "review" : "digraph");
      }
    }
    expect([81, 82, 83, 84].map((n) => at(n)!.phonics.focus)).toEqual([["ck"], ["ck"], ["ng"], ["nk"]]);
    expect(at(85)!.phonics.focus).toEqual(["ck", "ng", "nk"]);
    for (const l of range(85, 90)) expect(l.phonics.rule, `L${l.lessonNo}`).toBe("review");
    expect([...at(90)!.phonics.focus].sort()).toEqual(["ch", "ck", "ng", "nk", "sh", "th", "wh"]);
  });

  it("フォニックスの単語は短母音1つ＋子音・ダイグラフ（まだ magic e や母音チームを使わない）", () => {
    if (w3.length === 0) return;
    for (const l of w3) for (const w of l.phonics.words) expect(w.match(/[aeiou]/g)?.length, `L${l.lessonNo}: ${w}`).toBe(1);
  });

  it("L90 はワールドのまとめでスピード TPR", () => {
    if (w3.length === 0) return;
    expect(at(90)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（Let's Try! 1 前半のテーマ）どおり入っている", () => {
    if (w3.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(61, 65)).toContain("Nice to meet you.");
    expect(ex(61, 65)).toContain("What's your name?");
    expect(ex(66, 70)).toContain("How are you");
    expect(ex(66, 70)).toContain("Are you happy?");
    expect(ex(71, 75)).toMatch(/How many \w+\?/);
    expect(range(71, 72).flatMap((l) => l.vocab.map((v) => v.en))).toEqual(
      expect.arrayContaining(["eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"]),
    );
    expect(ex(76, 80)).toContain("What color do you like?");
    expect(ex(76, 80)).toContain("Do you like red?");
    expect(ex(81, 85)).toContain("What sport do you like?");
    expect(ex(81, 85)).toContain("What food do you like?");
    expect(ex(81, 85)).toContain("I don't like");
  });
});

describe("カリキュラム: ワールド4 の決まりごと", () => {
  const w4 = LESSONS.filter((l) => l.world === 4);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const S = ["st", "sp", "sn", "sm", "sk", "sw"];
  const L = ["bl", "cl", "fl", "gl", "pl", "sl"];
  const R = ["br", "cr", "dr", "fr", "gr", "tr"];

  it("ワールド4 は 91〜120 の 30 レッスン、学年は小3", () => {
    if (w4.length === 0) return; // 未作成ならスキップ
    expect(w4.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 91 + i));
    for (const l of w4) expect(l.school.grade).toBe("小3");
  });

  it("語頭ブレンドを s- → l- → r- → tw・3つの ブレンドの順に（5の倍数はふりかえり）", () => {
    if (w4.length === 0) return;
    const block = (a: number, set: string[]) => {
      const ls = range(a, a + 4);
      for (const l of ls.slice(0, 4)) {
        expect(l.phonics.rule, `L${l.lessonNo}`).toBe("blend");
        for (const f of l.phonics.focus) expect(set, `L${l.lessonNo}: ${f}`).toContain(f);
      }
      expect(ls.slice(0, 4).flatMap((l) => l.phonics.focus).sort()).toEqual([...set].sort());
      expect(ls[4].phonics.rule, `L${a + 4}`).toBe("review");
      expect([...ls[4].phonics.focus].sort(), `L${a + 4}`).toEqual([...set].sort());
    };
    block(91, S);
    block(96, L);
    block(101, R);
    expect(at(106)!.phonics.focus).toEqual(["tw"]);
    expect(at(109)!.phonics.focus).toEqual(["str", "spr", "scr"]);
    for (const l of range(106, 109)) expect(l.phonics.rule, `L${l.lessonNo}`).toBe("blend");
    for (const l of range(110, 115)) expect(l.phonics.rule, `L${l.lessonNo}`).toBe("review");
  });

  it("ブレンドの回（L91〜115）の単語は ブレンドで始まり、短母音1つだけ", () => {
    if (w4.length === 0) return;
    for (const l of range(91, 115)) {
      for (const w of l.phonics.words) {
        expect(l.phonics.focus.some((f) => w.startsWith(f)), `L${l.lessonNo}: ${w}`).toBe(true);
        expect(w.match(/[aeiou]/g)?.length, `L${l.lessonNo}: ${w}`).toBe(1);
      }
    }
  });

  it("L116〜119 は 2つに わけて よむ ことば（focus は sun-set の形、単語は 母音2つ）", () => {
    if (w4.length === 0) return;
    for (const l of range(116, 119)) {
      expect(l.phonics.rule, `L${l.lessonNo}`).toBe("syllable");
      expect(l.phonics.focus.map((f) => f.replace(/-/g, "")), `L${l.lessonNo}`).toEqual(l.phonics.words);
      for (const f of l.phonics.focus) expect(f, `L${l.lessonNo}`).toMatch(/^[a-z]+-[a-z]+$/);
      for (const w of l.phonics.words) expect(w.match(/[aeiou]/g)?.length, `L${l.lessonNo}: ${w}`).toBe(2);
    }
  });

  it("L120 はワールドのまとめでスピード TPR", () => {
    if (w4.length === 0) return;
    const l120 = at(120)!;
    expect(l120.phonics.rule).toBe("review");
    expect(l120.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（Let's Try! 1 後半のテーマ）どおり入っている", () => {
    if (w4.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(91, 95)).toContain("What do you want?");
    expect(ex(91, 95)).toMatch(/\b[A-Z], please\./);
    expect(ex(96, 100)).toContain("This is for you.");
    expect(ex(96, 100)).toContain("A star, please.");
    expect(ex(101, 105)).toContain("What's this?");
    expect(ex(101, 105)).toContain("Hint, please.");
    expect(ex(101, 105)).toMatch(/It's an? \w+/);
    expect(ex(106, 110)).toContain("Who are you?");
    expect(ex(106, 110)).toMatch(/I'm an? \w+\./);
    expect(ex(106, 110)).toMatch(/Are you an? \w+\?/);
    for (const w of ["It's long.", "It's small.", "It's big", "It's fast."]) expect(ex(111, 115)).toContain(w);
    expect(ex(116, 120)).toMatch(/I like/);
  });
});

describe("カリキュラム: ワールド5 の決まりごと", () => {
  const w5 = LESSONS.filter((l) => l.world === 5);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const FINAL = ["-st", "-nd", "-mp", "-nt", "-lk", "-ft", "-sk", "-lp"];

  it("ワールド5 は 121〜150 の 30 レッスン、学年は小4", () => {
    if (w5.length === 0) return; // 未作成ならスキップ
    expect(w5.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 121 + i));
    for (const l of w5) expect(l.school.grade).toBe("小4");
  });

  it("語末ブレンド → 複数形 -s → -ing → 2音節 → ブレンド総まとめ の順（5の倍数はふりかえり）", () => {
    if (w5.length === 0) return;
    const plan: [number, string[], string][] = [
      [121, ["-st"], "final-blend"], [122, ["-nd"], "final-blend"], [123, ["-mp"], "final-blend"], [124, ["-st", "-nd", "-mp"], "final-blend"],
      [126, ["-nt"], "final-blend"], [127, ["-lk"], "final-blend"], [128, ["-ft"], "final-blend"], [129, ["-nt", "-lk", "-ft"], "final-blend"],
      [131, ["-sk"], "final-blend"], [132, ["-lp"], "final-blend"], [133, ["-s"], "plural"], [134, ["-s"], "plural"],
      [136, ["-ing"], "ing"], [137, ["-ing"], "ing"], [138, ["-ing"], "ing"], [139, ["-ing"], "ing"],
    ];
    for (const [n, focus, rule] of plan) {
      expect(at(n)!.phonics.focus, `L${n}`).toEqual(focus);
      expect(at(n)!.phonics.rule, `L${n}`).toBe(rule);
    }
    for (const l of range(141, 144)) expect(l.phonics.rule, `L${l.lessonNo}`).toBe("syllable");
    for (const n of [125, 130, 135, 140, 145, 146, 147, 148, 149, 150]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // 語末ブレンド 8つを すべて あつかう
    const taught = new Set(range(121, 135).flatMap((l) => l.phonics.focus));
    for (const f of FINAL) expect(taught.has(f), f).toBe(true);
  });

  it("語末の回の単語は、その回の語末（-st / -s / -ing）で おわる", () => {
    if (w5.length === 0) return;
    for (const l of range(121, 140)) {
      const ends = l.phonics.focus.filter((f) => f.startsWith("-")).map((f) => f.slice(1));
      for (const w of l.phonics.words) expect(ends.some((e) => w.endsWith(e)), `L${l.lessonNo}: ${w}`).toBe(true);
    }
    // 語末ブレンドの回の単語は 短母音1つ（まだ magic e や母音チームを使わない）
    for (const l of range(121, 132)) for (const w of l.phonics.words) expect(w.match(/[aeiou]/g)?.length, `L${l.lessonNo}: ${w}`).toBe(1);
  });

  it("L141〜144 は 2音節の ことば（focus は pic-nic の形、単語は 母音2つ）", () => {
    if (w5.length === 0) return;
    for (const l of range(141, 144)) {
      expect(l.phonics.focus.map((f) => f.replace(/-/g, "")), `L${l.lessonNo}`).toEqual(l.phonics.words);
      for (const f of l.phonics.focus) expect(f, `L${l.lessonNo}`).toMatch(/^[a-z]+-[a-z]+$/);
      for (const w of l.phonics.words) expect(w.match(/[aeiou]/g)?.length, `L${l.lessonNo}: ${w}`).toBe(2);
    }
  });

  it("L150 はワールドのまとめでスピード TPR", () => {
    if (w5.length === 0) return;
    expect(at(150)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（Let's Try! 2 前半のテーマ）どおり入っている", () => {
    if (w5.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(121, 125)).toContain("Good morning.");
    expect(ex(121, 125)).toContain("Hello, world!");
    expect(ex(126, 130)).toContain("How's the weather?");
    expect(ex(126, 130)).toMatch(/Let's play \w+\./);
    expect(ex(131, 135)).toContain("What day is it?");
    expect(ex(131, 135)).toContain("I like Mondays.");
    expect(range(131, 132).flatMap((l) => l.vocab.map((v) => v.en))).toEqual(
      expect.arrayContaining(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    );
    expect(ex(136, 140)).toContain("What time is it?");
    expect(ex(136, 140)).toMatch(/It's \w+ o'clock\./);
    expect(ex(136, 140)).toMatch(/It's \w+ time\./);
    expect(ex(141, 145)).toContain("Do you have a pen?");
    expect(ex(141, 145)).toContain("Yes, I do.");
    expect(ex(141, 145)).toContain("No, I don't.");
  });
});

describe("カリキュラム: ワールド6 の決まりごと", () => {
  const w6 = LESSONS.filter((l) => l.world === 6);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** マジック e の形: 母音＋子音1つ＋e（cakes のような -s、cupcake のような 2音節語も） */
  const MAGIC = /[aeiou][b-df-hj-np-tv-z]es?$/;

  it("ワールド6 は 151〜180 の 30 レッスン、学年は小4", () => {
    if (w6.length === 0) return; // 未作成ならスキップ
    expect(w6.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 151 + i));
    for (const l of w6) expect(l.school.grade).toBe("小4");
  });

  it("マジック e を a_e → i_e → o_e → u_e・e_e の順に（5の倍数はふりかえり）、L171〜180 は ふりかえり", () => {
    if (w6.length === 0) return;
    const plan: [number, string[]][] = [[151, ["a_e"]], [156, ["i_e"]], [161, ["o_e"]]];
    for (const [start, focus] of plan) {
      for (let k = 0; k < 5; k++) {
        const l = at(start + k)!;
        expect(l.phonics.focus, `L${l.lessonNo}`).toEqual(focus);
        expect(l.phonics.rule, `L${l.lessonNo}`).toBe(k === 4 ? "review" : "magic-e");
      }
    }
    expect([166, 167, 168, 169].map((n) => at(n)!.phonics.focus)).toEqual([["u_e"], ["u_e"], ["e_e"], ["u_e", "e_e"]]);
    for (const n of [166, 167, 168, 169]) expect(at(n)!.phonics.rule, `L${n}`).toBe("magic-e");
    for (const l of range(170, 180)) expect(l.phonics.rule, `L${l.lessonNo}`).toBe("review");
    expect([...at(180)!.phonics.focus].sort()).toEqual(["a_e", "e_e", "i_e", "o_e", "u_e"]);
  });

  it("マジック e の回（L151〜170, L175〜180）の単語は すべて マジック e の形", () => {
    if (w6.length === 0) return;
    for (const l of [...range(151, 170), ...range(175, 180)]) {
      for (const w of l.phonics.words) expect(w.toLowerCase(), `L${l.lessonNo}: ${w}`).toMatch(MAGIC);
    }
  });

  it("L171〜174 は みじかい母音と マジック e の くらべ（cap / cape のペア）", () => {
    if (w6.length === 0) return;
    for (const [n, v] of [[171, "a"], [172, "i"], [173, "o"], [174, "u"]] as const) {
      const l = at(n)!;
      expect(l.phonics.focus, `L${n}`).toEqual([v, `${v}_e`]);
      const short = l.phonics.words.filter((w) => !MAGIC.test(w));
      expect(short.length, `L${n}`).toBe(2);
      for (const s of short) expect(l.phonics.words, `L${n}: ${s}`).toContain(`${s}e`);
    }
  });

  it("L180 はワールドのまとめでスピード TPR", () => {
    if (w6.length === 0) return;
    expect(at(180)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（Let's Try! 2 後半のテーマ）どおり入っている", () => {
    if (w6.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(151, 155)).toContain("What's this letter?");
    expect(ex(151, 155)).toContain("Look at the sign.");
    expect(ex(151, 155)).toMatch(/It's a small [a-z]\./);
    expect(ex(156, 160)).toContain("What do you want?");
    expect(ex(156, 160)).toMatch(/I want an? \w+/);
    expect(ex(156, 160)).toContain("How many");
    expect(ex(161, 165)).toContain("This is my favorite place.");
    expect(ex(161, 165)).toContain("Go straight.");
    expect(ex(161, 165)).toMatch(/Turn (right|left)\./);
    for (const w of ["I wake up", "I eat breakfast", "I go to school"]) expect(ex(166, 170)).toContain(w);
    expect(ex(171, 175)).toMatch(/First, .*Then, /s);
    expect(ex(176, 180)).toMatch(/favorite place/);
  });

  it("3人称の動詞（has / says / likes など）は まだ つかわない（表現・セリフ・AI の さいしょの ことば）", () => {
    if (w6.length === 0) return;
    const third = /\b(has|says|likes|wants|goes|eats|does)\b/;
    for (const l of w6) {
      const texts = [...l.school.expressions.map((e) => e.en), ...(l.conversation?.lines.map((x) => x.en) ?? []), l.conversation?.aiTask.starterEn ?? ""];
      for (const t of texts) expect(t, `L${l.lessonNo}`).not.toMatch(third);
    }
  });
});

describe("カリキュラム: ワールド7 の決まりごと", () => {
  const w7 = LESSONS.filter((l) => l.world === 7);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const TEAMS = ["ai", "ay", "ee", "ea", "oa", "ow"];

  it("ワールド7 は 181〜210 の 30 レッスン、学年は小5", () => {
    if (w7.length === 0) return; // 未作成ならスキップ
    expect(w7.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 181 + i));
    for (const l of w7) expect(l.school.grade).toBe("小5");
  });

  it("母音チームを ai → ay → ee → ea → oa → ow の順に（5の倍数はふりかえり）、L206〜210 は ふりかえり", () => {
    if (w7.length === 0) return;
    const plan: [number, string][] = [[181, "ai"], [182, "ai"], [183, "ay"], [184, "ay"],
      [186, "ee"], [187, "ee"], [188, "ee"], [189, "ee"], [191, "ea"], [192, "ea"], [193, "ea"], [194, "ea"],
      [196, "oa"], [197, "oa"], [198, "oa"], [199, "oa"], [201, "ow"], [202, "ow"], [203, "ow"], [204, "ow"]];
    for (const [n, f] of plan) {
      expect(at(n)!.phonics.focus, `L${n}`).toEqual([f]);
      expect(at(n)!.phonics.rule, `L${n}`).toBe("vowel-team");
    }
    for (const n of [185, 190, 195, 200, 205, 206, 207, 208, 209, 210]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    expect([...at(210)!.phonics.focus].sort()).toEqual([...TEAMS].sort());
    for (const l of w7) for (const f of l.phonics.focus) expect(TEAMS, `L${l.lessonNo}`).toContain(f);
  });

  it("ow は snow の「オウ」だけ（cow の ow は ワールド8）", () => {
    if (w7.length === 0) return;
    const cowOw = /\b(cow|how|now|down|town|brown|owl|crown|flower|tower|wow)\b/;
    for (const l of w7) for (const w of l.phonics.words) expect(w.toLowerCase(), `L${l.lessonNo}`).not.toMatch(cowOw);
  });

  it("L210 はワールドのまとめでスピード TPR", () => {
    if (w7.length === 0) return;
    expect(at(210)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（NEW HORIZON Elementary 5 前半のテーマ）どおり入っている", () => {
    if (w7.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(181, 185)).toMatch(/My name is \w+\./);
    expect(ex(181, 185)).toContain("How do you spell it?");
    expect(ex(181, 185)).toMatch(/I like \w+/);
    expect(ex(186, 190)).toContain("When is your birthday?");
    expect(ex(186, 190)).toMatch(/My birthday is \w+ \d+(st|nd|rd|th)\./);
    expect(ex(191, 195)).toMatch(/What do you have on \w+day\?/);
    expect(ex(191, 195)).toMatch(/I have \w+/);
    expect(ex(196, 200)).toContain("Can you swim?");
    expect(ex(196, 200)).toMatch(/He can \w+/);
    expect(ex(196, 200)).toMatch(/She is good at \w+/);
    expect(ex(201, 205)).toMatch(/He is an? \w+/);
    expect(ex(201, 205)).toMatch(/She works at an? \w+/);
    expect(ex(206, 210)).toMatch(/My name is .*My birthday is /s);
  });

  it("he / she（3人称）は L196 から（それまでの 表現・セリフには 出さない）", () => {
    if (w7.length === 0) return;
    const third = /\b(he|she)\b/i;
    for (const l of range(181, 195)) {
      const texts = [...l.school.expressions.map((e) => e.en), ...(l.conversation?.lines.map((x) => x.en) ?? []), l.conversation?.aiTask.starterEn ?? ""];
      for (const t of texts) expect(t, `L${l.lessonNo}`).not.toMatch(third);
    }
  });
});

describe("カリキュラム: ワールド8 の決まりごと", () => {
  const w8 = LESSONS.filter((l) => l.world === 8);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const TEAMS = ["oo", "ou", "ow", "oi", "oy", "igh", "ie"];

  it("ワールド8 は 211〜240 の 30 レッスン、学年は小5", () => {
    if (w8.length === 0) return; // 未作成ならスキップ
    expect(w8.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 211 + i));
    for (const l of w8) expect(l.school.grade).toBe("小5");
  });

  it("母音チームを oo → ou → ow → oi → oy → igh → ie の順に（5の倍数はふりかえり）、L236〜240 は ふりかえり", () => {
    if (w8.length === 0) return;
    const plan: [number, string][] = [[211, "oo"], [212, "oo"], [213, "oo"], [214, "oo"], [216, "ou"], [217, "ou"], [218, "ou"], [219, "ou"],
      [221, "ow"], [222, "ow"], [223, "ow"], [224, "ow"], [226, "oi"], [227, "oi"], [228, "oy"], [229, "oy"],
      [231, "igh"], [232, "igh"], [233, "ie"], [234, "ie"]];
    for (const [n, f] of plan) {
      expect(at(n)!.phonics.focus, `L${n}`).toEqual([f]);
      expect(at(n)!.phonics.rule, `L${n}`).toBe("vowel-team");
    }
    for (const n of [215, 220, 225, 230, 235, 236, 237, 238, 239, 240]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    expect([...at(240)!.phonics.focus].sort()).toEqual([...TEAMS].sort());
    for (const l of w8) for (const f of l.phonics.focus) expect(TEAMS, `L${l.lessonNo}`).toContain(f);
  });

  it("oo: L211〜212 は moon の「ウー」、L213〜214 は book の「ウ」。ow は ワールド8では cow の「アウ」だけ", () => {
    if (w8.length === 0) return;
    for (const n of [211, 212]) for (const w of at(n)!.phonics.words) expect(teamSound("oo", w), `L${n} ${w}`).toBe("ウー");
    for (const n of [213, 214]) for (const w of at(n)!.phonics.words) expect(teamSound("oo", w), `L${n} ${w}`).toBe("ウ");
    expect(at(215)!.phonics.words.map((w) => teamSound("oo", w))).toEqual(expect.arrayContaining(["ウー", "ウ"]));
    for (const l of w8) for (const w of l.phonics.words.filter((x) => x.includes("ow"))) expect(teamSound("ow", w), `L${l.lessonNo} ${w}`).toBe("アウ");
  });

  it("ie は pie の「アイ」だけ（piece / field のような「イー」の ie は 出さない）", () => {
    if (w8.length === 0) return;
    for (const l of w8) for (const w of l.phonics.words) expect(w, `L${l.lessonNo}`).not.toMatch(/(piece|field|chief|thief|niece|shield|movie|cookie)/);
  });

  it("L240 はワールドのまとめでスピード TPR", () => {
    if (w8.length === 0) return;
    expect(at(240)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（NEW HORIZON Elementary 5 後半のテーマ）どおり入っている", () => {
    if (w8.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(211, 215)).toMatch(/Where is the \w+\?/);
    expect(ex(211, 215)).toContain("Go straight");
    expect(ex(211, 215)).toMatch(/Turn (right|left)/);
    expect(ex(211, 215)).toMatch(/It's on your (right|left)\./);
    expect(ex(211, 215)).toMatch(/It's next to the \w+\./);
    expect(ex(216, 220)).toContain("What would you like?");
    expect(ex(216, 220)).toMatch(/I'd like [\w ]+, please\./);
    expect(ex(216, 220)).toContain("How much is it?");
    expect(ex(216, 220)).toMatch(/It's \d+ yen\./);
    expect(ex(221, 225)).toMatch(/In Japan, we have \w+/);
    expect(ex(221, 225)).toMatch(/You can \w+/);
    expect(ex(226, 230)).toContain("Who is your hero?");
    expect(ex(226, 230)).toMatch(/My hero is [\w ]+\./);
    expect(ex(226, 230)).toMatch(/(He|She) is good at \w+/);
    expect(ex(231, 235)).toMatch(/We have an? \w+ in our town\./);
    expect(ex(231, 235)).toMatch(/We don't have an? \w+/);
    expect(ex(236, 240)).toMatch(/My hero is /);
  });

  it("AI 会話で ほんとうの まちの なまえ・ひとの なまえを きかない（まち・ヒーローの回は goalJa に 明記）", () => {
    if (w8.length === 0) return;
    for (const n of [231, 232, 234, 235, 240]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toContain("まちの なまえは いわなくて OK");
    for (const n of [226, 230, 236, 240]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえ(は|や)/);
  });
});

describe("カリキュラム: ワールド9 の決まりごと", () => {
  const w9 = LESSONS.filter((l) => l.world === 9);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const R = ["ar", "or", "er", "ir", "ur", "air", "ear"];

  it("ワールド9 は 241〜270 の 30 レッスン、学年は小6", () => {
    if (w9.length === 0) return; // 未作成ならスキップ
    expect(w9.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 241 + i));
    for (const l of w9) expect(l.school.grade).toBe("小6");
  });

  it("r の つく母音を ar → or → er → ir → ur → air → ear の順に（5の倍数はふりかえり）、L261〜270 は ふりかえり", () => {
    if (w9.length === 0) return;
    const plan: [number, string[]][] = [[241, ["ar"]], [242, ["ar"]], [243, ["ar"]], [244, ["ar"]], [246, ["or"]], [247, ["or"]], [248, ["or"]], [249, ["or"]],
      [251, ["er"]], [252, ["ir"]], [253, ["ur"]], [254, ["er", "ir", "ur"]], [256, ["air"]], [257, ["air"]], [258, ["ear"]], [259, ["ear"]]];
    for (const [n, f] of plan) {
      expect(at(n)!.phonics.focus, `L${n}`).toEqual(f);
      expect(at(n)!.phonics.rule, `L${n}`).toBe("r-controlled");
    }
    for (const n of [245, 250, 255, 260, ...Array.from({ length: 10 }, (_, i) => 261 + i)]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    expect([...at(270)!.phonics.focus].sort()).toEqual([...R].sort());
    for (const l of w9) for (const f of l.phonics.focus) expect(R, `L${l.lessonNo}`).toContain(f);
  });

  it("r の つく母音として よめない ことば（bear / earth の ear、work の or、r の あとに 母音）は 出さない", () => {
    if (w9.length === 0) return;
    for (const l of w9) for (const w of l.phonics.words) {
      expect(findRSpellings(w).some((s) => l.phonics.focus.includes(s)), `L${l.lessonNo} ${w}`).toBe(true);
      expect(w, `L${l.lessonNo}`).not.toMatch(/^(bear|pear|wear|earth|learn|early|heart|work|word|world|worm|war|warm|warn)s?$/);
    }
  });

  it("L270 はワールドのまとめでスピード TPR", () => {
    if (w9.length === 0) return;
    expect(at(270)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（NEW HORIZON Elementary 6 前半のテーマ）どおり入っている", () => {
    if (w9.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(241, 245)).toMatch(/I'm good at \w+/);
    expect(ex(241, 245)).toMatch(/My favorite \w+ is [\w ]+\./);
    expect(ex(241, 245)).toMatch(/What's your favorite \w+\?/);
    expect(ex(246, 250)).toContain("What time do you get up?");
    expect(ex(246, 250)).toMatch(/I usually \w+/);
    expect(ex(251, 255)).toContain("Where do you want to go?");
    expect(ex(251, 255)).toMatch(/I want to go to \w+/);
    expect(ex(251, 255)).toMatch(/You can \w+ [\w ]+ in \w+\./);
    expect(ex(256, 260)).toContain("How was your summer?");
    expect(ex(256, 260)).toMatch(/I went to [\w ']+\./);
    expect(ex(256, 260)).toContain("It was fun.");
    expect(ex(261, 265)).toMatch(/I saw /);
    expect(ex(261, 265)).toMatch(/I ate /);
    expect(ex(261, 265)).toMatch(/I enjoyed /);
  });

  it("すぎた ことの いいかた（went / was / saw / ate / enjoyed …）は L256 から。L241〜255 の 表現・セリフには 出さない", () => {
    if (w9.length === 0) return;
    const past = /\b(went|was|were|saw|ate|enjoyed|played|watched|did)\b/;
    for (const l of range(241, 255)) {
      const texts = [...l.school.expressions.map((e) => e.en), ...(l.conversation?.lines.map((x) => x.en) ?? []), l.conversation?.aiTask.starterEn ?? ""];
      for (const t of texts) expect(t, `L${l.lessonNo}`).not.toMatch(past);
    }
  });

  it("AI 会話で ほんとうの なまえ・ばしょを きかない（じこしょうかい・おもいでの回は goalJa に 明記）", () => {
    if (w9.length === 0) return;
    for (const n of [241, 243, 245]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toContain("ニックネームで OK");
    for (const n of [256, 260, 270]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/ばしょの なまえは いわなくて OK/);
  });
});

describe("カリキュラム: ワールド10 の決まりごと", () => {
  const w10 = LESSONS.filter((l) => l.world === 10);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const F = ["c", "g", "-y", "-le", "aw", "au", "ew"];

  it("ワールド10 は 271〜300 の 30 レッスン、学年は小6", () => {
    if (w10.length === 0) return; // 未作成ならスキップ
    expect(w10.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 271 + i));
    for (const l of w10) expect(l.school.grade).toBe("小6");
  });

  it("soft c → soft g → -y → -le → aw au ew の順に（5の倍数はふりかえり）、L296〜300 は ふりかえり", () => {
    if (w10.length === 0) return;
    const block = (ns: number[], f: string[], rule: string) => ns.map((n): [number, string[], string] => [n, f, rule]);
    const plan: [number, string[], string][] = [
      ...block([271, 272, 273, 274], ["c"], "soft-c"),
      ...block([276, 277, 278, 279], ["g"], "soft-g"),
      ...block([281, 282, 283, 284], ["-y"], "ending-y"),
      ...block([286, 287, 288, 289], ["-le"], "ending-le"),
      [291, ["aw"], "vowel-team"], [292, ["au"], "vowel-team"], [293, ["ew"], "vowel-team"], [294, ["aw", "au", "ew"], "vowel-team"],
    ];
    for (const [n, f, rule] of plan) {
      expect(at(n)!.phonics.focus, `L${n}`).toEqual(f);
      expect(at(n)!.phonics.rule, `L${n}`).toBe(rule);
    }
    for (const n of [275, 280, 285, 290, 295, 296, 297, 298, 299, 300]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    expect([...at(300)!.phonics.focus].sort()).toEqual([...F].sort());
    for (const l of w10) for (const f of l.phonics.focus) expect(F, `L${l.lessonNo}`).toContain(f);
  });

  it("c / g の ことばは 1つの ことばの 中で おとが まざらない。soft の 回は soft だけ。get / girl のような れいがいは 出さない", () => {
    if (w10.length === 0) return;
    for (const l of w10) for (const w of l.phonics.words) for (const f of ["c", "g"] as const) {
      if (!l.phonics.focus.includes(f)) continue;
      const s = cgSounds(f, w);
      expect(new Set(s).size, `L${l.lessonNo} ${w}`).toBeLessThanOrEqual(1);
      if (l.phonics.rule === `soft-${f}`) expect(s, `L${l.lessonNo} ${w}`).toEqual(s.map(() => "soft"));
      expect(G_HARD_WORDS.has(w), `L${l.lessonNo} ${w}`).toBe(false);
    }
    // くらべの 回（L275・L280）には soft と hard の 両方
    expect(new Set(at(275)!.phonics.words.flatMap((w) => cgSounds("c", w)))).toEqual(new Set(["soft", "hard"]));
    expect(new Set(at(280)!.phonics.words.flatMap((w) => cgSounds("g", w)))).toEqual(new Set(["soft", "hard"]));
  });

  it("おわりの y: L281〜282 は イー、L283 は アイ、L284・L285 は くらべ。July や apply のような ことばは 出さない", () => {
    if (w10.length === 0) return;
    const ys = (n: number) => at(n)!.phonics.words.map(ySound);
    for (const n of [281, 282]) expect(ys(n), `L${n}`).toEqual(ys(n).map(() => "イー"));
    expect(ys(283)).toEqual(ys(283).map(() => "アイ"));
    for (const n of [284, 285]) expect(new Set(ys(n)), `L${n}`).toEqual(new Set(["イー", "アイ"]));
    for (const l of w10) if (l.phonics.focus.includes("-y")) for (const w of l.phonics.words) {
      expect(w, `L${l.lessonNo}`).not.toMatch(/^(july|apply|reply|deny|rely|supply)$/);
    }
  });

  it("ew の ことばは「ウー」の ものだけ（few のような「ユー」は 出さない）", () => {
    if (w10.length === 0) return;
    for (const l of w10) for (const w of l.phonics.words) expect(w, `L${l.lessonNo}`).not.toMatch(/^(few|pew|mew|nephew)$/);
  });

  it("L300 はワールドのまとめでスピード TPR", () => {
    if (w10.length === 0) return;
    expect(at(300)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（NEW HORIZON Elementary 6 中盤のテーマ）どおり入っている", () => {
    if (w10.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(271, 275)).toContain("Where do sea turtles live?");
    expect(ex(271, 275)).toMatch(/They live in [\w ]+\./);
    expect(ex(276, 280)).toMatch(/Where is [\w ]+ from\?/);
    expect(ex(276, 280)).toMatch(/It's from [\w ]+\./);
    expect(ex(281, 285)).toMatch(/In \w+, people \w+/);
    expect(ex(286, 290)).toMatch(/I recommend [\w ]+\./);
    expect(ex(286, 290)).toMatch(/It's \w+\./);
    expect(ex(291, 295)).toMatch(/We can [\w ]+\./);
    expect(ex(291, 295)).toMatch(/Let's [\w ]+\./);
    expect(ex(296, 300)).toContain("Thank you for listening.");
  });

  it("AI 会話で ほんとうの なまえ・ばしょを きかない（まちや おでかけの 回、まとめは goalJa に 明記）", () => {
    if (w10.length === 0) return;
    for (const n of [280, 288, 289, 300]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえは いわなくて OK/);
  });
});

describe("カリキュラム: ワールド11 の決まりごと", () => {
  const w11 = LESSONS.filter((l) => l.world === 11);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const SIGHT = ["was", "were", "said", "there", "could", "would", "because"];
  const F = ["-ed", "-er", "-est", ...SIGHT];

  it("ワールド11 は 301〜330 の 30 レッスン、学年は小6", () => {
    if (w11.length === 0) return; // 未作成ならスキップ
    expect(w11.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 301 + i));
    for (const l of w11) expect(l.school.grade).toBe("小6");
  });

  it("-ed → was were said there → -er → -est → could would because の順に（5の倍数はふりかえり）、L326〜330 は ふりかえり", () => {
    if (w11.length === 0) return;
    const block = (ns: number[], f: string[], rule: string) => ns.map((n): [number, string[], string] => [n, f, rule]);
    const plan: [number, string[], string][] = [
      ...block([301, 302, 303, 304], ["-ed"], "ending-ed"),
      [306, ["was"], "sight-words"], [307, ["were"], "sight-words"], [308, ["said"], "sight-words"], [309, ["there"], "sight-words"],
      ...block([311, 312, 313, 314], ["-er"], "ending-er"),
      ...block([316, 317, 318, 319], ["-est"], "ending-est"),
      [321, ["could"], "sight-words"], [322, ["would"], "sight-words"], [323, ["because"], "sight-words"], [324, ["could", "would", "because"], "sight-words"],
    ];
    for (const [n, f, rule] of plan) {
      expect(at(n)!.phonics.focus, `L${n}`).toEqual(f);
      expect(at(n)!.phonics.rule, `L${n}`).toBe(rule);
    }
    for (const n of [305, 310, 315, 320, 325, 326, 327, 328, 329, 330]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    expect([...at(330)!.phonics.focus].sort()).toEqual([...F].sort());
    for (const l of w11) for (const f of l.phonics.focus) expect(F, `L${l.lessonNo}`).toContain(f);
  });

  it("サイトワードの 回は その サイトワードを ことばに ふくむ", () => {
    if (w11.length === 0) return;
    for (const l of w11.filter((x) => x.phonics.rule === "sight-words")) {
      for (const f of l.phonics.focus) expect(l.phonics.words, `L${l.lessonNo}`).toContain(f);
    }
  });

  it("-ed: L301 は ト、L302 は ド、L303 は イド、L304・L305 は 3つ まざる。used のような 1つの s の -sed は 出さない", () => {
    if (w11.length === 0) return;
    const eds = (n: number) => at(n)!.phonics.words.map(edSound);
    expect(new Set(eds(301))).toEqual(new Set(["t"]));
    expect(new Set(eds(302))).toEqual(new Set(["d"]));
    expect(new Set(eds(303))).toEqual(new Set(["id"]));
    for (const n of [304, 305]) expect(new Set(eds(n)), `L${n}`).toEqual(new Set(["t", "d", "id"]));
    for (const l of w11) if (l.phonics.focus.includes("-ed")) for (const w of l.phonics.words) {
      if (!w.endsWith("ed")) continue;
      expect(edSound(w), `L${l.lessonNo} ${w}`).not.toBeNull();
      expect(w, `L${l.lessonNo}`).not.toMatch(/[^s]sed$/);
    }
  });

  it("-er / -est の 回の ことばは その おわりで おわる（L314 は「もっと」の -er）", () => {
    if (w11.length === 0) return;
    for (const l of w11.filter((x) => x.phonics.rule === "ending-er")) for (const w of l.phonics.words) expect(w, `L${l.lessonNo}`).toMatch(/er$/);
    for (const l of w11.filter((x) => x.phonics.rule === "ending-est")) for (const w of l.phonics.words) expect(w, `L${l.lessonNo}`).toMatch(/est$/);
    for (const w of at(314)!.phonics.words) expect(ER_MORE_WORDS.has(w), w).toBe(true);
  });

  it("L330 はワールドのまとめでスピード TPR", () => {
    if (w11.length === 0) return;
    expect(at(330)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("表現の型が計画（NEW HORIZON Elementary 6 後半のテーマ）どおり入っている", () => {
    if (w11.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(301, 305)).toContain("What's your best memory?");
    expect(ex(301, 305)).toMatch(/My best memory is [\w ]+\./);
    expect(ex(306, 310)).toMatch(/We had [\w ]+\./);
    expect(ex(306, 310)).toContain("It was exciting.");
    expect(ex(311, 315)).toContain("What do you want to be?");
    expect(ex(311, 315)).toMatch(/I want to be an? [\w ]+\./);
    expect(ex(311, 315)).toMatch(/Because [\w ]+\./);
    expect(ex(316, 320)).toContain("What club do you want to join?");
    expect(ex(316, 320)).toMatch(/I want to join the [\w ]+\./);
    expect(ex(321, 325)).toMatch(/Thank you for [\w ]+\./);
    expect(ex(326, 330)).toContain("Thank you for listening.");
  });

  it("AI 会話で ほんとうの なまえ・がっこうの なまえを きかない（ぶかつ・ありがとう・まとめの 回は goalJa に 明記）", () => {
    if (w11.length === 0) return;
    for (const n of [310, 315, 316, 320, 321, 324, 325, 327, 329, 330]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえは いわなくて OK/);
  });
});

describe("カリキュラム: ワールド12 の決まりごと", () => {
  const w12 = LESSONS.filter((l) => l.world === 12);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);

  it("ワールド12 は 331〜360 の 30 レッスン、学年は小6。カリキュラムは ぜんぶで 360 レッスン", () => {
    if (w12.length === 0) return; // 未作成ならスキップ
    expect(w12.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 331 + i));
    for (const l of w12) expect(l.school.grade).toBe("小6");
    expect(LESSONS).toHaveLength(360);
  });

  it("フォニックス: サイトワード総復習 → 多音節語 → 音読（まえの ワールドの つづり）→ 5W1H の サイトワード（5の倍数と L356〜360 は ふりかえり）", () => {
    if (w12.length === 0) return;
    const plan: [number, string[], string][] = [
      [331, ["are", "was", "were"], "sight-words"], [332, ["they", "said", "there"], "sight-words"],
      [333, ["should", "could", "would"], "sight-words"], [334, ["friend", "people", "because"], "sight-words"],
      [341, ["a_e", "i_e", "o_e"], "reading"], [342, ["ai", "ee", "ea", "oa"], "reading"], [343, ["oo", "ou"], "reading"], [344, ["ar", "or", "ir", "ur"], "reading"],
      [346, ["-ed"], "reading"], [347, ["c", "g"], "reading"], [348, ["-y", "-le"], "reading"], [349, ["aw", "au", "ew"], "reading"],
      [351, ["who", "what"], "sight-words"], [352, ["when", "where"], "sight-words"], [353, ["why", "how"], "sight-words"],
      [354, ["who", "what", "when", "where", "why", "how"], "sight-words"],
    ];
    for (const [n, f, rule] of plan) {
      expect(at(n)!.phonics.focus, `L${n}`).toEqual(f);
      expect(at(n)!.phonics.rule, `L${n}`).toBe(rule);
    }
    for (const n of [336, 337, 338, 339]) expect(at(n)!.phonics.rule, `L${n}`).toBe("syllable");
    for (const n of [335, 340, 345, 350, 355, 356, 357, 358, 359, 360]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
  });

  it("サイトワードの 回は その サイトワードを ことばに ふくむ", () => {
    if (w12.length === 0) return;
    for (const l of w12.filter((x) => x.phonics.rule === "sight-words")) {
      for (const f of l.phonics.focus) expect(l.phonics.words, `L${l.lessonNo}`).toContain(f);
    }
  });

  it("多音節語: focus は まとまりを ハイフンで わけ、words は つなげた ことば。L336・L337 は 3つ、L338 は 4つ、L339 は 2〜4つ", () => {
    if (w12.length === 0) return;
    for (const n of [336, 337, 338, 339, 340]) {
      const l = at(n)!;
      for (const f of l.phonics.focus) expect(f, `L${n}`).toMatch(/^[a-z]+(-[a-z]+)+$/);
      expect(l.phonics.focus.map((f) => f.replace(/-/g, "")), `L${n}`).toEqual(l.phonics.words);
    }
    const counts = (n: number) => at(n)!.phonics.focus.map((f) => f.split("-").length);
    expect(new Set(counts(336))).toEqual(new Set([3]));
    expect(new Set(counts(337))).toEqual(new Set([3]));
    expect(new Set(counts(338))).toEqual(new Set([4]));
    expect(new Set(counts(339))).toEqual(new Set([2, 3, 4]));
  });

  it("音読の 回の ことばは ならった つづりの きまりどおり（-ed の おと・c / g の おと・おわりの y）", () => {
    if (w12.length === 0) return;
    expect(at(346)!.phonics.words.map(edSound)).toEqual(["d", "t", "id", "d"]);
    expect(at(347)!.phonics.words.map((w) => [...cgSounds("c", w), ...cgSounds("g", w)])).toEqual([["soft"], ["soft"], ["soft"], ["soft"]]);
    expect(at(348)!.phonics.words.map(ySound)).toEqual(["イー", "アイ", null, null]);
    for (const w of at(359)!.phonics.words.filter((x) => x.endsWith("er"))) expect(ER_MORE_WORDS.has(w), w).toBe(false);
  });

  it("L360 は さいごの まとめで スピード TPR、さいごの ボスは ひらく レッスンが ない", () => {
    if (w12.length === 0) return;
    expect(at(360)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
    expect(ASSESSMENTS.find((a) => a.id === "boss-1-360")?.unlocksLesson).toBeNull();
    expect(ASSESSMENTS.find((a) => a.id === "boss-1-330")?.unlocksLesson).toBe(331);
  });

  it("表現の型が計画（総復習・5W1H・1年のふりかえり）どおり入っている", () => {
    if (w12.length === 0) return;
    const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
    expect(ex(331, 335)).toMatch(/I am [\w ]+\./);
    expect(ex(331, 335)).toMatch(/You are [\w ]+\./);
    expect(ex(331, 335)).toMatch(/He is [\w ]+\./);
    expect(ex(336, 340)).toContain("Do you like");
    expect(ex(336, 340)).toMatch(/I can [\w ]+\./);
    expect(ex(336, 340)).toMatch(/I want [\w ]+\./);
    expect(ex(341, 345)).toContain("What time do you");
    expect(ex(341, 345)).toContain("Where is the");
    expect(ex(346, 350)).toMatch(/I went to [\w ]+\./);
    expect(ex(346, 350)).toMatch(/I saw [\w ]+\./);
    expect(ex(346, 350)).toMatch(/I ate [\w ]+\./);
    expect(ex(346, 350)).toMatch(/It was [\w ]+\./);
    for (const q of ["Who", "What", "When", "Where", "Why", "How"]) expect(ex(351, 355), q).toMatch(new RegExp(`${q} [\\w ]+\\?`));
    expect(ex(356, 360)).toContain("Thank you for a wonderful year.");
  });

  it("AI 会話で ほんとうの なまえ・がっこうの なまえ・ばしょの なまえを きかない（じこしょうかい・インタビュー・パーティーの 回は goalJa に 明記）", () => {
    if (w12.length === 0) return;
    for (const n of [331, 332, 334, 335, 340, 344, 345, 346, 350, 351, 352, 354, 355, 356, 358, 359, 360]) {
      expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえは いわなくて OK/);
    }
  });
});
