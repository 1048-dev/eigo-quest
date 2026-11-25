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
import { chBlank, heSpelling, sSound } from "@/lib/curriculum/w13Phonics";
import { numberSpelling, pluralSpelling } from "@/lib/curriculum/w14Phonics";
import { compoundSplit, contractionOf, ingSpelling, y3Sound } from "@/lib/curriculum/w15Phonics";
import { edSpelling, irregularPast } from "@/lib/curriculum/w16Phonics";
import { endingSpelling, homophoneOf, orSpelling, willContraction } from "@/lib/curriculum/w17Phonics";
import { compareSpelling, fulLessOf, lySpelling, stressChoices, unOf } from "@/lib/curriculum/w18Phonics";
import { ouSound, quBlank, reOf, silentBlank19, toolEnding } from "@/lib/curriculum/w19Phonics";
import { earOf, schwaBlank, ureSound } from "@/lib/curriculum/w20Phonics";
import { disOf, linkOf, misPreBlank, partOf, suffixOf } from "@/lib/curriculum/w21Phonics";
import { adjOf, familyOf, markOf, personOf, schwaStressBlank } from "@/lib/curriculum/w22Phonics";
import { mentOf, sciPartOf, shiftOf, tionOf, yAdjOf } from "@/lib/curriculum/w23Phonics";
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

  it("ワールド12 は 331〜360 の 30 レッスン、学年は小6。ステージ1 は 360 レッスンで おわる", () => {
    if (w12.length === 0) return; // 未作成ならスキップ
    expect(w12.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 331 + i));
    for (const l of w12) expect(l.school.grade).toBe("小6");
    expect(LESSONS.filter((l) => l.stage === 1)).toHaveLength(360);
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

  it("L360 は さいごの まとめで スピード TPR。ボス 360 は つぎの ワールドが あれば L361 を ひらく（さいごの ボスは ひらく レッスンが ない）", () => {
    if (w12.length === 0) return;
    expect(at(360)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
    expect(ASSESSMENTS.find((a) => a.id === "boss-1-360")?.unlocksLesson).toBe(TOTAL_LESSONS > 360 ? 361 : null);
    expect(ASSESSMENTS.find((a) => a.id === `boss-1-${TOTAL_LESSONS}`)?.unlocksLesson).toBeNull();
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

describe("カリキュラム: ワールド13 の決まりごと（ステージ2 の はじまり）", () => {
  const w13 = LESSONS.filter((l) => l.world === 13);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド13 は 361〜390 の 30 レッスン、ステージ2・A1+、学年の めやすは 中1", () => {
    if (w13.length === 0) return; // 未作成ならスキップ
    expect(w13.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 361 + i));
    for (const l of w13) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中1");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A1+");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w13.length === 0) return;
    expect(at(361)!.title).toBe("A New Map");
    expect(at(370)!.title).toBe("My Family Poster");
    expect(at(376)!.title).toBe("What Does He Do?");
    expect(at(384)!.title).toBe("Sorry? One More Time, Please.");
    expect(at(390)!.title).toBe("World 13 Grand Review");
  });

  it("フォニックス: -s → -es → -ies・とくべつな 形 → tch → dge（各ブロックの 5回目と L386〜390 は ふりかえり）", () => {
    if (w13.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(361, 364, "ending-s");
    rule(366, 369, "ending-es");
    rule(371, 374, "ending-ies");
    rule(376, 379, "tch");
    rule(381, 384, "dge");
    for (const n of [365, 370, 375, 380, 385, 386, 387, 388, 389, 390]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    for (const l of range(366, 369)) for (const w of l.phonics.words) expect(sSound(w), `L${l.lessonNo} ${w}`).toBe("iz");
    for (const l of range(371, 372)) for (const w of l.phonics.words) expect(heSpelling(w)?.kind, `L${l.lessonNo} ${w}`).toBe("ies");
    expect(at(373)!.phonics.words).toEqual(expect.arrayContaining(["goes", "does", "has"]));
  });

  it("-s の 回の ことばは 計画した おと（L361 は ス、L362 は ズ、L363〜364 は まざる）", () => {
    if (w13.length === 0) return;
    expect(at(361)!.phonics.words.map(sSound)).toEqual(["s", "s", "s", "s"]);
    expect(at(362)!.phonics.words.map(sSound)).toEqual(["z", "z", "z", "z"]);
    for (const n of [363, 364]) expect(new Set(at(n)!.phonics.words.map(sSound)), `L${n}`).toEqual(new Set(["s", "z"]));
  });

  it("tch / dge の 回の ことばは みじかい 母音の あとの tch / dge。ふりかえりの ch / ge は みじかい 母音の あと では ない", () => {
    if (w13.length === 0) return;
    const allCh = ["tch", "ch", "dge", "ge"];
    for (const l of [...range(376, 379), ...range(381, 384)]) {
      for (const w of l.phonics.words) {
        const b = chBlank(w, allCh);
        expect(b?.answer, `L${l.lessonNo} ${w}`).toBe(l.phonics.rule);
        expect("aeiou", `L${l.lessonNo} ${w}`).toContain(b!.before);
      }
    }
    // ふりかえりの くらべ: ながい 母音（ea・マジック e）や 子音の あとは ch / ge
    const ans = (n: number) => at(n)!.phonics.words.map((w) => chBlank(w, at(n)!.phonics.focus)?.answer);
    expect(ans(380)).toEqual(["tch", "tch", "ch", "ch", "tch"]);
    expect(ans(385)).toEqual(["dge", "dge", "ge", "ge", "ge"]);
    expect(ans(388)).toEqual(["tch", "tch", "dge", "dge"]);
    expect(ans(389)).toEqual(["tch", "ch", "dge", "ge"]);
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w13.length === 0) return;
    expect(ex(361, 365)).toContain("Birimo has a new map.");
    expect(ex(361, 365)).toMatch(/\b(likes|loves) [\w ]+\./);
    expect(ex(366, 370)).toContain("doesn't like");
    expect(ex(366, 370)).toMatch(/Does (she|he) [\w ]+\?/);
    expect(ex(366, 370)).toMatch(/Yes, (she|he) does\./);
    for (const f of ["always", "usually", "sometimes", "never"]) expect(ex(371, 375), f).toContain(` ${f} `);
    expect(ex(371, 375)).toContain("What time does she get up?");
    expect(ex(376, 380)).toContain("What does he do?");
    expect(ex(376, 380)).toMatch(/works at the [\w ]+\./);
    expect(ex(381, 385)).toContain("Really? Me too!");
    expect(ex(381, 385)).toContain("How about you?");
    expect(ex(381, 385)).toContain("What kind");
    expect(ex(381, 385)).toContain("Can you say that again?");
    expect(ex(386, 390)).toContain("This town has a big lighthouse.");
  });

  it("doesn't / Does の あとの うごきに s を つけない（表現・セリフ・AI の さいしょの ことば）", () => {
    if (w13.length === 0) return;
    const texts = w13.flatMap((l) => [...l.school.expressions.map((e) => e.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn]);
    for (const t of texts) {
      expect(t, t).not.toMatch(/\bdoesn't (likes|has|goes|does|eats|plays|works|makes)\b/);
      expect(t, t).not.toMatch(/\b[Dd]oes (he|she|it|[A-Z][a-z]+) (likes|has|goes|eats|plays|works|makes|drinks)\b/);
    }
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜6 行、L390 は スピード TPR", () => {
    if (w13.length === 0) return;
    for (const l of w13) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(390)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("AI 会話で ほんとうの なまえ・じゅうしょ・がっこうの なまえを きかない（しょうかい・ビデオ・えはがき・スピーチの 回は goalJa に 明記）", () => {
    if (w13.length === 0) return;
    for (const n of [365, 366, 370, 385, 387, 390]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえ(は|や)[^。]*いわなくて OK/);
    for (const n of [375, 381, 388]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/いわなくて OK/);
  });
});

describe("カリキュラム: ワールド14 の決まりごと（にぎわいの市場）", () => {
  const w14 = LESSONS.filter((l) => l.world === 14);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
  const NUMBER_FOCUS = ["-ty", "-teen", "hundred", "thousand"];

  it("ワールド14 は 391〜420 の 30 レッスン、ステージ2・A1+、学年の めやすは 中1", () => {
    if (w14.length === 0) return; // 未作成ならスキップ
    expect(w14.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 391 + i));
    for (const l of w14) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中1");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A1+");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w14.length === 0) return;
    expect(at(391)!.title).toBe("Welcome to the Market!");
    expect(at(396)!.title).toBe("What Does It Cost?");
    expect(at(400)!.title).toBe("Market Day Shop");
    expect(at(407)!.title).toBe("No, Thank You. I'm Full.");
    expect(at(420)!.title).toBe("World 14 Grand Review");
  });

  it("フォニックス: -es → -ies / -ves → kn・wr → mb・ph → 大きな 数（各ブロックの 5回目と L416〜420 は ふりかえり）", () => {
    if (w14.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(391, 394, "plural-es");
    rule(396, 399, "plural-ies-ves");
    rule(401, 404, "silent-letters");
    rule(406, 407, "silent-letters");
    rule(408, 409, "ph");
    rule(411, 414, "number-spelling");
    for (const n of [395, 400, 405, 410, 415, 416, 417, 418, 419, 420]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    for (const l of range(391, 394)) for (const w of l.phonics.words) expect(pluralSpelling(w)?.kind, `L${l.lessonNo} ${w}`).toMatch(/^o?es$/);
    for (const w of at(396)!.phonics.words) expect(pluralSpelling(w)?.kind, w).toBe("ies");
    for (const n of [397, 398]) for (const w of at(n)!.phonics.words) expect(pluralSpelling(w)?.kind, `L${n} ${w}`).toBe("ves");
    expect([401, 402, 403, 404, 406, 407, 408, 409].map((n) => at(n)!.phonics.focus)).toEqual([["kn"], ["kn"], ["wr"], ["wr"], ["mb"], ["mb"], ["ph"], ["ph"]]);
    for (const l of [...range(411, 415), at(419)!]) {
      expect(l.phonics.focus.every((f) => NUMBER_FOCUS.includes(f)), `L${l.lessonNo}`).toBe(true);
      for (const w of l.phonics.words) expect(numberSpelling(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w14.length === 0) return;
    expect(ex(391, 395)).toContain("There are many shops.");
    expect(ex(391, 395)).toContain("Do you have any peaches?");
    expect(ex(391, 395)).toContain("we have some");
    expect(ex(391, 395)).toContain("don't have any");
    expect(ex(391, 395)).toContain("Can I have some bread?");
    expect(ex(391, 395)).toContain("Here you go.");
    expect(ex(391, 395)).toMatch(/a glass of/i);
    expect(ex(391, 395)).toContain("a cup of");
    expect(ex(391, 395)).toContain("I'd like");
    expect(ex(396, 400)).toContain("How much is this hat?");
    expect(ex(396, 400)).toContain("How many");
    expect(ex(396, 400)).toContain("a hundred");
    expect(ex(396, 400)).toContain("That's too expensive.");
    expect(ex(396, 400)).toContain("Here's your change.");
    expect(ex(401, 405)).toContain("First, cut the carrots.");
    expect(ex(401, 405)).toContain("Mix it well. Then add some salt.");
    expect(ex(401, 405)).toContain("It smells good!");
    expect(ex(406, 410)).toContain("Try this!");
    expect(ex(406, 410)).toContain("No, thank you. I'm full.");
    expect(ex(406, 410)).toContain("Would you like some more?");
    expect(ex(411, 415)).toContain("People in Italy eat a lot of pasta.");
    expect(ex(411, 415)).toContain("come from");
    expect(ex(416, 420)).toContain("Welcome to our shop! Try our fruit salad!");
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜7 行、L400 は 400 回 記念、L420 は スピード TPR", () => {
    if (w14.length === 0) return;
    for (const l of w14) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(400)!.teacherScript).toContain("lesson four hundred");
    expect(at(420)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("ねだんは 円（ドル・セントを 出さない）。AI 会話の しょうかいの 回は「なまえは いわなくて OK」", () => {
    if (w14.length === 0) return;
    const texts = w14.flatMap((l) => [...l.school.expressions.map((e) => e.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn]);
    expect(texts.filter((t) => /\b(dollars?|cents?)\b/i.test(t))).toEqual([]);
    for (const n of [417, 420]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえは いわなくて OK/);
  });
});

describe("カリキュラム: ワールド15 の決まりごと（かぜの草原）", () => {
  const w15 = LESSONS.filter((l) => l.world === 15);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド15 は 421〜450 の 30 レッスン、ステージ2・A1+、学年の めやすは 中1", () => {
    if (w15.length === 0) return; // 未作成ならスキップ
    expect(w15.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 421 + i));
    for (const l of w15) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中1");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A1+");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w15.length === 0) return;
    expect(at(421)!.title).toBe("The Wind Is Blowing!");
    expect(at(422)!.title).toBe("What Are You Doing?");
    expect(at(431)!.title).toBe("Every Day or Now?");
    expect(at(436)!.title).toBe("In the Picture");
    expect(at(447)!.title).toBe("Who Is It?");
    expect(at(450)!.title).toBe("World 15 Grand Review");
  });

  it("フォニックス: -ing（e を とる）→ -ing（重ねる）→ 複合語 → 短縮形 → y の 3つの おと（各ブロックの 5回目と L446〜450 は ふりかえり）", () => {
    if (w15.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(421, 424, "ing-drop-e");
    rule(426, 429, "ing-double");
    rule(431, 434, "compound-words");
    rule(436, 439, "contractions");
    rule(441, 444, "y-sounds");
    for (const n of [425, 430, 435, 440, 445, 446, 447, 448, 449, 450]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    for (const l of range(421, 424)) for (const w of l.phonics.words) expect(ingSpelling(w)?.kind, `L${l.lessonNo} ${w}`).toBe("drop-e");
    for (const l of range(426, 429)) for (const w of l.phonics.words) expect(ingSpelling(w)?.kind, `L${l.lessonNo} ${w}`).toBe("double");
    for (const l of range(431, 435)) for (const w of l.phonics.words) expect(compoundSplit(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    for (const l of range(436, 440)) for (const w of l.phonics.words) expect(contractionOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    for (const l of range(441, 445)) for (const w of l.phonics.words) expect(y3Sound(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(at(441)!.phonics.words.map(y3Sound)).toEqual(["イー", "イー", "イー", "イー"]);
    expect(at(442)!.phonics.words.map(y3Sound)).toEqual(["アイ", "アイ", "アイ", "アイ"]);
    expect(at(443)!.phonics.words.map(y3Sound)).toEqual(["イェ", "イェ", "イェ", "イェ"]);
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w15.length === 0) return;
    expect(ex(421, 425)).toContain("The wind is blowing.");
    expect(ex(421, 425)).toContain("What are you doing?");
    expect(ex(421, 425)).toContain("I'm flying a kite.");
    expect(ex(421, 425)).toContain("Look! She's running fast.");
    expect(ex(421, 425)).toContain("Are you having fun?");
    expect(ex(421, 425)).toContain("I'm sitting on a hill.");
    expect(ex(426, 430)).toContain("The horses are eating grass.");
    expect(ex(426, 430)).toContain("behind the rock");
    expect(ex(426, 430)).toContain("in front of");
    expect(ex(426, 430)).toContain("next to");
    expect(ex(426, 430)).toContain("between the trees");
    expect(ex(426, 430)).toContain("What is the dog doing?");
    expect(ex(431, 435)).toContain("I play soccer every day.");
    expect(ex(431, 435)).toContain("I'm playing soccer now.");
    expect(ex(431, 435)).toContain("Nice try!");
    expect(ex(431, 435)).toContain("Keep going! You can do it!");
    expect(ex(431, 435)).toContain("Who's winning?");
    expect(ex(436, 440)).toContain("In the picture, a boy is reading.");
    expect(ex(436, 440)).toContain("On the left, two girls are dancing.");
    expect(ex(436, 440)).toContain("What's happening in this picture?");
    expect(ex(436, 440)).toContain("In my picture, the cat is sleeping.");
    expect(ex(441, 445)).toContain("It's raining. We're staying inside.");
    expect(ex(441, 445)).toContain("Look! A rainbow is coming out.");
    expect(ex(441, 445)).toContain("The stars are shining.");
    expect(ex(446, 450)).toContain("She's wearing a red hat. She's holding a kite.");
    expect(ex(446, 450)).toContain("We're having a great time on the plains!");
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜7 行、L450 は スピード TPR", () => {
    if (w15.length === 0) return;
    for (const l of w15) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(450)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("AI 会話の ビデオ通話・日記・発表の 回は「なまえ・じゅうしょは いわなくて OK」。ビデオ通話の 台本でも 教える", () => {
    if (w15.length === 0) return;
    for (const n of [425, 445, 450]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえ.*(いわなくて|かかなくて) OK/);
    expect(at(425)!.teacherScript).toMatch(/don't say your address/);
  });
});

describe("カリキュラム: ワールド16 の決まりごと（きおくの遺跡）", () => {
  const w16 = LESSONS.filter((l) => l.world === 16);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド16 は 451〜480 の 30 レッスン、ステージ2・A1+、学年の めやすは 中1", () => {
    if (w16.length === 0) return; // 未作成ならスキップ
    expect(w16.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 451 + i));
    for (const l of w16) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中1");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A1+");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w16.length === 0) return;
    expect(at(451)!.title).toBe("The Old Ruins");
    expect(at(452)!.title).toBe("What Did You Do Yesterday?");
    expect(at(462)!.title).toBe("I Thought It Was a Ghost!");
    expect(at(466)!.title).toBe("Once Upon a Time");
    expect(at(473)!.title).toBe("Sounds Fun! Oh No!");
    expect(at(480)!.title).toBe("World 16 Grand Review");
  });

  it("フォニックス: -ed の つづり → i → a → o…e・ew → ought / aught → -ed の おと（各ブロックの 5回目と L476〜480 は ふりかえり）", () => {
    if (w16.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(451, 454, "ed-spelling");
    rule(456, 459, "past-i-a");
    rule(461, 462, "past-o-e");
    rule(463, 464, "past-ew");
    rule(466, 469, "ought-aught");
    rule(471, 474, "ed-sounds");
    for (const n of [455, 460, 465, 470, 475, 476, 477, 478, 479, 480]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    for (const l of range(451, 455)) for (const w of l.phonics.words) expect(edSpelling(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(at(451)!.phonics.words.map((w) => edSpelling(w)?.kind)).toEqual(["drop-e", "drop-e", "drop-e", "drop-e"]);
    expect(at(452)!.phonics.words.map((w) => edSpelling(w)?.kind)).toEqual(["y-i", "y-i", "y-i", "y-i"]);
    expect(at(453)!.phonics.words.map((w) => edSpelling(w)?.kind)).toEqual(["double", "double", "double", "double"]);
    const kinds = (a: number, b: number) => [...new Set(range(a, b).flatMap((l) => l.phonics.words.map((w) => irregularPast(w)?.kind)))];
    expect(kinds(456, 459)).toEqual(["i-a"]);
    expect(kinds(461, 462)).toEqual(["o-e"]);
    expect(kinds(463, 464)).toEqual(["ew"]);
    expect(kinds(466, 469).sort()).toEqual(["aught", "ought"]);
    for (const l of range(471, 474)) for (const w of l.phonics.words) expect(edSound(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    // -ed の おとの 回は 3つの おとが まざる
    expect(new Set(range(471, 474).flatMap((l) => l.phonics.words.map(edSound)))).toEqual(new Set(["t", "d", "id"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w16.length === 0) return;
    expect(ex(451, 455)).toContain("People lived here long ago.");
    expect(ex(451, 455)).toContain("What did you do yesterday?");
    expect(ex(451, 455)).toContain("We stopped and looked at the wall.");
    expect(ex(451, 455)).toContain("Did you see that?");
    expect(ex(451, 455)).toContain("Yes, I did!");
    expect(ex(451, 455)).toContain("No, I didn't.");
    expect(ex(451, 455)).toContain("We walked to the ruins. We found a door.");
    expect(ex(451, 455)).toContain("weren't");
    expect(ex(456, 460)).toContain("We sang a song by the campfire.");
    expect(ex(456, 460)).toContain("I wrote a letter to my grandma.");
    expect(ex(456, 460)).toContain("Birimo knew the answer!");
    expect(ex(456, 460)).toContain("Where did you go last weekend?");
    expect(ex(456, 460)).toContain("I went to the river. I caught a fish.");
    expect(ex(461, 465)).toContain("I bought a map at the shop.");
    expect(ex(461, 465)).toContain("I thought it was a ghost!");
    expect(ex(461, 465)).toContain("Who taught you?");
    expect(ex(461, 465)).toContain("It wasn't easy, but I did it.");
    expect(ex(461, 465)).toContain("Were you tired?");
    expect(ex(466, 470)).toContain("Once upon a time, a king lived here.");
    expect(ex(466, 470)).toContain("First, he opened the box. Then, he looked inside.");
    expect(ex(466, 470)).toContain("After that,");
    expect(ex(466, 470)).toContain("Finally, the king smiled.");
    expect(ex(466, 470)).toContain("How did he feel?");
    expect(ex(471, 475)).toContain("How was your summer?");
    expect(ex(471, 475)).toContain("Who did you go with?");
    expect(ex(471, 475)).toContain("Sounds fun!");
    expect(ex(471, 475)).toContain("Oh no! What happened?");
    expect(ex(471, 475)).toContain("My best day was my birthday.");
    expect(ex(471, 475)).toContain("When did you");
    expect(ex(476, 480)).toContain("I went, I saw, I ate, I bought.");
    expect(ex(476, 480)).toContain("Last Sunday, I went to the library. It was quiet.");
    expect(ex(476, 480)).toContain("Once upon a time, four friends found a map.");
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜7 行、L480 は スピード TPR", () => {
    if (w16.length === 0) return;
    for (const l of w16) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(480)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("日記・インタビュー・発表の AI 会話は「なまえ（・じゅうしょ）は いわなくて OK」。手紙と 日記の 台本でも じゅうしょを 教えないと 教える", () => {
    if (w16.length === 0) return;
    for (const n of [455, 475, 478, 480]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえ.*(いわなくて|かかなくて) OK/);
    expect(at(457)!.conversation!.aiTask.goalJa).toMatch(/じゅうしょは いわなくて OK/);
    expect(at(457)!.teacherScript).toMatch(/never share your address/);
    for (const n of [455, 478]) expect(at(n)!.teacherScript, `L${n}`).toMatch(/don't need to write your real name or address/);
  });
});

describe("カリキュラム: ワールド17 の決まりごと（ほしふる天文台）", () => {
  const w17 = LESSONS.filter((l) => l.world === 17);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド17 は 481〜510 の 30 レッスン、ステージ2・A2、学年の めやすは 中2", () => {
    if (w17.length === 0) return; // 未作成ならスキップ
    expect(w17.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 481 + i));
    for (const l of w17) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中2");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A2");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w17.length === 0) return;
    expect(at(481)!.title).toBe("The Observatory on the Hill");
    expect(at(486)!.title).toBe("Will It Rain Tomorrow?");
    expect(at(489)!.title).toBe("I'll Help You");
    expect(at(500)!.title).toBe("Lesson 500 Star Party");
    expect(at(504)!.title).toBe("I'll Call You Tomorrow");
    expect(at(510)!.title).toBe("World 17 Grand Review");
  });

  it("フォニックス: -tion → -sion・-ture → 'll・won't → 同音異義語 → or ore oar our（各ブロックの 5回目と L506〜510 は ふりかえり）", () => {
    if (w17.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(481, 484, "tion");
    rule(486, 487, "sion");
    rule(488, 489, "ture");
    rule(491, 494, "contractions-will");
    rule(496, 499, "homophones");
    rule(501, 504, "or-spellings");
    for (const n of [485, 490, 495, 500, 505, 506, 507, 508, 509, 510]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    const kinds = (a: number, b: number) => [...new Set(range(a, b).flatMap((l) => l.phonics.words.map((w) => endingSpelling(w)?.kind)))];
    expect(kinds(481, 485)).toEqual(["tion"]);
    expect(kinds(486, 487)).toEqual(["sion"]);
    expect(kinds(488, 489)).toEqual(["ture"]);
    for (const l of range(491, 494)) for (const w of l.phonics.words) expect(willContraction(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(491, 494).flatMap((l) => l.phonics.words)).toContain("won't");
    for (const l of range(496, 499)) for (const w of l.phonics.words) expect(homophoneOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    for (const w of ["see", "sea", "son", "sun", "two", "to", "too", "there", "their"]) expect(range(496, 499).flatMap((l) => l.phonics.words)).toContain(w);
    expect(at(501)!.phonics.words.map((w) => orSpelling(w)?.kind)).toEqual(["or", "or", "or", "or"]);
    expect(at(502)!.phonics.words.map((w) => orSpelling(w)?.kind)).toEqual(["ore", "ore", "ore", "ore"]);
    expect(at(503)!.phonics.words.map((w) => orSpelling(w)?.kind)).toEqual(["oar", "oar", "oar", "oar"]);
    expect(at(504)!.phonics.words.map((w) => orSpelling(w)?.kind)).toEqual(["our", "our", "our", "our"]);
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w17.length === 0) return;
    expect(ex(481, 485)).toContain("We're going to see the stars tonight.");
    expect(ex(481, 485)).toContain("What are you going to do this weekend?");
    expect(ex(481, 485)).toContain("I'm going to visit my grandma.");
    expect(ex(481, 485)).toContain("Are you going to join us?");
    expect(ex(481, 485)).toContain("First, we're going to eat. Then, we're going to watch the stars.");
    expect(ex(486, 490)).toContain("Will it rain tomorrow?");
    expect(ex(486, 490)).toContain("I think it will.");
    expect(ex(486, 490)).toContain("It will be sunny tomorrow.");
    expect(ex(486, 490)).toContain("It won't be cold. Don't worry.");
    expect(ex(486, 490)).toContain("I'll help you.");
    expect(ex(486, 490)).toContain("Tomorrow, it will be cloudy in the morning.");
    expect(ex(491, 495)).toContain("The moon goes around the Earth.");
    expect(ex(491, 495)).toContain("Mars is red. Jupiter is very big.");
    expect(ex(491, 495)).toContain("Astronauts sleep in sleeping bags.");
    expect(ex(491, 495)).toContain("Look! A shooting star! Make a wish!");
    expect(ex(491, 495)).toContain("Which planet is the biggest?");
    expect(ex(496, 500)).toContain("Someday I will go to space.");
    expect(ex(496, 500)).toContain("What will you be in twenty years?");
    expect(ex(496, 500)).toContain("I think robots will help us at home.");
    expect(ex(496, 500)).toContain("I want to go to Mars because it's exciting.");
    expect(ex(496, 500)).toContain("Let's celebrate! We will keep going!");
    expect(ex(501, 505)).toContain("Long ago, people saw pictures in the stars.");
    expect(ex(501, 505)).toContain("These stars look like a bear.");
    expect(ex(501, 505)).toContain("Hello! We live on Earth. We like music.");
    expect(ex(501, 505)).toContain("I'll call you tomorrow. I promise.");
    expect(ex(501, 505)).toContain("In the future, I'm going to");
    expect(ex(506, 510)).toContain("What are you going to eat tonight?");
    expect(ex(506, 510)).toContain("How about you?");
    expect(ex(506, 510)).toContain("Dear future me, I will");
    expect(ex(506, 510)).toContain("Someday we will travel to the stars!");
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜7 行、L510 は スピード TPR", () => {
    if (w17.length === 0) return;
    for (const l of w17) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(510)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("メッセージ・やくそく・メモ・発表の AI 会話は「なまえ（・じゅうしょ）は いわなくて OK」。台本でも じゅうしょを 教えないと 教える", () => {
    if (w17.length === 0) return;
    for (const n of [503, 505, 508, 510]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえ.*(いわなくて|かかなくて) OK/);
    expect(at(504)!.conversation!.aiTask.goalJa).toMatch(/じゅうしょや でんわばんごうは いわなくて OK/);
    expect(at(504)!.teacherScript).toMatch(/don't share your address or password online/);
    for (const n of [503, 508]) expect(at(n)!.teacherScript, `L${n}`).toMatch(/don't need to write your real name or address/);
  });
});

describe("カリキュラム: ワールド18 の決まりごと（こだまの谷）", () => {
  const w18 = LESSONS.filter((l) => l.world === 18);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド18 は 511〜540 の 30 レッスン、ステージ2・A2、学年の めやすは 中2", () => {
    if (w18.length === 0) return; // 未作成ならスキップ
    expect(w18.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 511 + i));
    for (const l of w18) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中2");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A2");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w18.length === 0) return;
    expect(at(511)!.title).toBe("Hello! Hello! Hello!");
    expect(at(516)!.title).toBe("More Beautiful");
    expect(at(521)!.title).toBe("As Big as a Bus");
    expect(at(526)!.title).toBe("The Unhappy Echo");
    expect(at(530)!.title).toBe("Dogs or Cats?");
    expect(at(536)!.title).toBe("The Biggest Echo");
    expect(at(540)!.title).toBe("World 18 Grand Review");
  });

  it("フォニックス: -er / -est → 強勢 → -ly → -ful・-less → un-（各ブロックの 5回目と L536〜540 は ふりかえり）", () => {
    if (w18.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(511, 514, "er-est");
    rule(516, 519, "stress");
    rule(521, 524, "ly");
    rule(526, 529, "ful-less");
    rule(531, 534, "un");
    for (const n of [515, 520, 525, 530, 535, 536, 537, 538, 539, 540]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    const kinds = (n: number) => at(n)!.phonics.words.map((w) => compareSpelling(w)?.kind);
    expect(kinds(511)).toEqual(["add", "add", "add", "add"]);
    expect(kinds(512)).toEqual(["e", "e", "e", "e"]);
    expect(kinds(513)).toEqual(["double", "double", "double", "double"]);
    expect(kinds(514)).toEqual(["y", "y", "y", "y"]);
    for (const l of range(516, 520)) for (const w of l.phonics.words) expect(stressChoices(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    for (const l of range(521, 525)) for (const w of l.phonics.words) expect(lySpelling(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(at(523)!.phonics.words.map((w) => lySpelling(w)?.kind)).toEqual(["y", "y", "y", "y"]);
    expect(at(524)!.phonics.words.map((w) => lySpelling(w)?.kind)).toEqual(["ful", "ful", "ful", "ful"]);
    for (const l of range(526, 530)) for (const w of l.phonics.words) expect(fulLessOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(at(527)!.phonics.words).toEqual(expect.arrayContaining(["careful", "careless"]));
    for (const l of range(531, 535)) for (const w of l.phonics.words) expect(unOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w18.length === 0) return;
    expect(ex(511, 515)).toContain("Echo Valley is bigger than the plains.");
    expect(ex(511, 515)).toContain("This tree is taller than that tree.");
    expect(ex(511, 515)).toContain("This is the longest river in the valley.");
    expect(ex(511, 515)).toContain("A blue whale is heavier than an elephant.");
    expect(ex(511, 515)).toContain("The cheetah is the fastest land animal.");
    expect(ex(516, 520)).toContain("This flower is more beautiful.");
    expect(ex(516, 520)).toContain("Pandas are the most popular.");
    expect(ex(516, 520)).toContain("I like apples better than oranges.");
    expect(ex(516, 520)).toContain("Which do you like better, summer or winter?");
    expect(ex(516, 520)).toContain("Soccer is the most popular sport in our group.");
    expect(ex(521, 525)).toContain("This dinosaur was as big as a bus.");
    expect(ex(521, 525)).toContain("I'm not as fast as a horse.");
    expect(ex(521, 525)).toContain("Walk quietly. The birds are sleeping.");
    expect(ex(521, 525)).toContain("That bird is more colorful than this one.");
    expect(ex(521, 525)).toContain("The owl flies quietly. It's one of the best hunters.");
    expect(ex(526, 530)).toContain("The echo sounds unhappy today.");
    expect(ex(526, 530)).toContain("Be careful! Don't be careless.");
    expect(ex(526, 530)).toContain("I think this one is better.");
    expect(ex(526, 530)).toContain("I think so, too.");
    expect(ex(526, 530)).toContain("I like this one better because it's cuter.");
    expect(ex(526, 530)).toContain("I like dogs better because they're friendly.");
    expect(ex(531, 535)).toContain("A frog can jump farther than you think!");
    expect(ex(531, 535)).toContain("Which is older, the bridge or the tower?");
    expect(ex(531, 535)).toContain("In picture A, the dog is bigger.");
    expect(ex(531, 535)).toContain("My bag is heavier than Riko's bag.");
    expect(ex(531, 535)).toContain("What is the tallest animal?");
    expect(ex(536, 540)).toContain("Let's make the biggest echo ever!");
    expect(ex(536, 540)).toContain("You're the best friend in the valley.");
    expect(ex(536, 540)).toContain("This is the most beautiful place in the valley.");
    expect(ex(536, 540)).toContain("as blue as");
    expect(ex(536, 540)).toContain("Echo Valley is the most wonderful place!");
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜7 行、L540 は スピード TPR", () => {
    if (w18.length === 0) return;
    for (const l of w18) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(540)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("ガイドブック・発表の AI 会話は「なまえは いわなくて OK」、くらべる ぶんは ひとの からだを くらべない、ペットが いなくても 話し合いに 入れる", () => {
    if (w18.length === 0) return;
    for (const n of [538, 540]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえは いわなくて OK/);
    expect(at(534)!.conversation!.aiTask.goalJa).toMatch(/からだは くらべない/);
    expect(at(534)!.teacherScript).toMatch(/Compare things, not people/);
    expect(at(530)!.conversation!.aiTask.goalJa).toMatch(/ペットが いなくても OK/);
    expect(at(530)!.teacherScript).toMatch(/You don't need a pet/);
    expect(at(538)!.teacherScript).toMatch(/You don't need to write the real name/);
  });
});

describe("カリキュラム: ワールド19 の決まりごと（からくり工房）", () => {
  const w19 = LESSONS.filter((l) => l.world === 19);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド19 は 541〜570 の 30 レッスン、ステージ2・A2、学年の めやすは 中2", () => {
    if (w19.length === 0) return; // 未作成ならスキップ
    expect(w19.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 541 + i));
    for (const l of w19) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中2");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A2");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w19.length === 0) return;
    expect(at(541)!.title).toBe("Tick, Tock, Click!");
    expect(at(546)!.title).toBe("Let's Make a Paper Plane");
    expect(at(551)!.title).toBe("You Have to Wear Goggles");
    expect(at(556)!.title).toBe("You Should Rest");
    expect(at(559)!.title).toBe("That's Not Fair!");
    expect(at(566)!.title).toBe("Squeeze, Turn, Pull");
    expect(at(570)!.title).toBe("World 19 Grand Review");
  });

  it("フォニックス: re- → 道具の -er / -or → だまっている もじ → qu・squ → ou・ough（各ブロックの 5回目と L566〜570 は ふりかえり）", () => {
    if (w19.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(541, 544, "re");
    rule(546, 549, "er-or");
    rule(551, 554, "silent");
    rule(556, 559, "qu");
    rule(561, 562, "ou");
    rule(563, 564, "ough");
    for (const n of [545, 550, 555, 560, 565, 566, 567, 568, 569, 570]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    for (const l of range(541, 545)) for (const w of l.phonics.words) expect(reOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    const kinds = (n: number) => at(n)!.phonics.words.map((w) => toolEnding(w)?.kind);
    expect(kinds(546)).toEqual(["add", "add", "add", "add"]);
    expect(kinds(548)).toEqual(["or", "or", "or", "or"]);
    for (const l of range(546, 550)) for (const w of l.phonics.words) expect(toolEnding(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    for (const l of range(551, 555)) for (const w of l.phonics.words) expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(silentBlank19(w)?.family);
    expect([...new Set(range(551, 555).flatMap((l) => l.phonics.focus))].sort()).toEqual(["-stle", "gu", "kn", "mb", "wr"]);
    for (const l of range(556, 560)) for (const w of l.phonics.words) expect(quBlank(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    for (const l of range(561, 565)) for (const w of l.phonics.words) expect(ouSound(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    // ou は 3つ（アウ・ア・ウー）、ough は 4つ（ウー・アフ・オウ・オー）の おとを ぜんぶ あつかう
    expect([...new Set(range(561, 562).flatMap((l) => l.phonics.words.map((w) => ouSound(w)!.answer)))].sort()).toEqual(["ア", "アウ", "ウー"].sort());
    expect([...new Set(range(563, 564).flatMap((l) => l.phonics.words.map((w) => ouSound(w)!.answer)))].sort()).toEqual(["アフ", "ウー", "オウ", "オー"].sort());
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w19.length === 0) return;
    expect(ex(541, 545)).toContain("This machine makes toys.");
    expect(ex(541, 545)).toContain("It's used for cutting paper.");
    expect(ex(541, 545)).toContain("How do you use it?");
    expect(ex(541, 545)).toContain("Push this button. Then, turn it.");
    expect(ex(541, 545)).toContain("Like this?");
    expect(ex(541, 545)).toContain("Yes, that's right!");
    expect(ex(541, 545)).toContain("It's used for opening cans.");
    expect(ex(546, 550)).toContain("First, fold the paper in half.");
    expect(ex(546, 550)).toContain("Next, cut along the line.");
    expect(ex(546, 550)).toContain("Finally, it works!");
    expect(ex(546, 550)).toContain("It didn't work. Let's remake it.");
    expect(ex(546, 550)).toContain("First, cut. Next, fold. Then, glue. Finally, play!");
    expect(ex(551, 555)).toContain("You have to wear goggles.");
    expect(ex(551, 555)).toContain("You must not touch it. It's hot.");
    expect(ex(551, 555)).toContain("You don't have to hurry.");
    expect(ex(551, 555)).toContain("May I use this hammer?");
    expect(ex(551, 555)).toContain("We must clean up. We have to share tools.");
    expect(ex(556, 560)).toContain("You look tired. You should rest.");
    expect(ex(556, 560)).toContain("You shouldn't");
    expect(ex(556, 560)).toContain("First, you have to roll the dice.");
    expect(ex(556, 560)).toContain("It's your turn. You can move three spaces.");
    expect(ex(556, 560)).toContain("That's not fair! Let's check the rules.");
    expect(ex(556, 560)).toContain("In our game, you have to collect stars.");
    expect(ex(561, 565)).toContain("The telephone helps people talk.");
    expect(ex(561, 565)).toContain("My machine can clean my room.");
    expect(ex(561, 565)).toContain("You can start it by pushing this button.");
    expect(ex(561, 565)).toContain("We can reuse these boxes.");
    expect(ex(561, 565)).toContain("This is my invention. It's used for");
    expect(ex(566, 570)).toContain("Squeeze it. Turn it. Pull it.");
    expect(ex(566, 570)).toContain("It's broken. What should we do?");
    expect(ex(566, 570)).toContain("How to make a paper cup: First,");
    expect(ex(566, 570)).toContain("We made a dream machine together!");
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜7 行、L570 は スピード TPR", () => {
    if (w19.length === 0) return;
    for (const l of w19) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(570)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("どうぐの 回は あんぜんを 教える（いえでは おとなに きく・あついものに さわらない）、発表の AI 会話は「なまえは いわなくて OK」", () => {
    if (w19.length === 0) return;
    for (const n of [542, 551]) expect(at(n)!.teacherScript, `L${n}`).toMatch(/ask an adult/);
    expect(at(552)!.teacherScript).toMatch(/You must not touch it\. It's hot\./);
    for (const n of [550, 560, 562, 565, 570]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえは いわなくて OK/);
    // しっぱいしても だいじょうぶ（L549）・かんぺきで なくて いい（L553）・ずるいと おもっても おだやかに（L559）
    expect(at(549)!.teacherScript).toMatch(/Every inventor makes mistakes/);
    expect(at(553)!.school.expressions.map((e) => e.en)).toContain("You don't have to be perfect.");
    expect(at(559)!.teacherScript).toMatch(/calmly/);
  });
});

describe("カリキュラム: ワールド20 の決まりごと（まつりの島・ステージ2 の 総まとめ）", () => {
  const w20 = LESSONS.filter((l) => l.world === 20);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド20 は 571〜600 の 30 レッスン、ステージ2・A2、学年の めやすは 中2", () => {
    if (w20.length === 0) return; // 未作成ならスキップ
    expect(w20.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 571 + i));
    for (const l of w20) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中2");
      expect(l.stage, `L${l.lessonNo}`).toBe(2);
      expect(l.level, `L${l.lessonNo}`).toBe("A2");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w20.length === 0) return;
    expect(at(571)!.title).toBe("Drums on the Island");
    expect(at(573)!.title).toBe("I'd Love To, But…");
    expect(at(576)!.title).toBe("Lantern Festival");
    expect(at(581)!.title).toBe("Welcome to My House");
    expect(at(586)!.title).toBe("If It Rains");
    expect(at(591)!.title).toBe("Stage 2 Review: People");
    expect(at(597)!.title).toBe("My Five-Sentence Speech");
    expect(at(600)!.title).toBe("World 20 Grand Festival");
  });

  it("フォニックス: -ure → ear / eer → あいまい母音 → ステージ2 の つづりの まとめ（各ブロックの 5回目と L596〜600 は ふりかえり）", () => {
    if (w20.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(571, 574, "ure");
    rule(576, 579, "ear-eer");
    rule(581, 584, "schwa");
    rule(586, 589, "stage2-spelling");
    rule(591, 594, "stage2-spelling");
    for (const n of [575, 580, 585, 590, 595, 596, 597, 598, 599, 600]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    for (const l of range(571, 575)) for (const w of l.phonics.words) expect(ureSound(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    // -ure は 3つ（チャー・ジャー・ユア）の おとを ぜんぶ あつかう
    expect([...new Set(range(571, 575).flatMap((l) => l.phonics.words.map((w) => ureSound(w)!.answer)))].sort()).toEqual(["ジャー", "チャー", "ユア"].sort());
    for (const l of range(576, 580)) for (const w of l.phonics.words.filter((x) => /ear|eer/.test(x))) expect(earOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    // ear は 3つ（イア・エア・アー）の おと（eer は イア だけ）
    const earSounds = range(576, 580).flatMap((l) => l.phonics.words.map((w) => earOf(w)).filter((e) => e !== null).map((e) => (e!.kind === "blank" ? "イア" : e!.answer)));
    expect([...new Set(earSounds)].sort()).toEqual(["アー", "イア", "エア"].sort());
    // あいまい母音: focus は はくの まとまりで、ことばと 1つずつ 対応する
    for (const l of range(581, 585)) {
      expect(l.phonics.focus.map((f) => f.replace(/-/g, "")), `L${l.lessonNo}`).toEqual(l.phonics.words);
      for (const w of l.phonics.words) expect(schwaBlank(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
    // ステージ2 の つづりの まとめ: tch・dge・-tion（ワールド13・17）、だまっている もじ・-ed・-ing（ワールド14・19・16・15）
    expect([...new Set(range(586, 590).flatMap((l) => l.phonics.focus))].sort()).toEqual(["-tion", "dge", "tch"]);
    expect([...new Set(range(591, 595).flatMap((l) => l.phonics.focus))].sort()).toEqual(["-ed", "-ing", "kn", "mb", "wr"]);
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w20.length === 0) return;
    expect(ex(571, 575)).toContain("There's a festival on the island!");
    expect(ex(571, 575)).toContain("Would you like to come to the festival?");
    expect(ex(571, 575)).toContain("I'd love to, but I have to help my mom.");
    expect(ex(571, 575)).toContain("Shall we dance?");
    expect(ex(571, 575)).toContain("Please come to our festival on Saturday.");
    expect(ex(576, 580)).toContain("People float lanterns on the river.");
    expect(ex(576, 580)).toContain("People throw colored powder and laugh.");
    expect(ex(576, 580)).toContain("We say thank you for the food.");
    expect(ex(576, 580)).toContain("There will be lights all over the town.");
    expect(ex(576, 580)).toContain("In some countries, people");
    expect(ex(581, 585)).toContain("Make yourself at home.");
    expect(ex(581, 585)).toContain("Would you like some tea?");
    expect(ex(581, 585)).toContain("Yes, please.");
    expect(ex(581, 585)).toContain("Thank you for having me.");
    expect(ex(581, 585)).toContain("When I was little, I was scared of drums.");
    expect(ex(581, 585)).toContain("We're going to cook together. It will be fun.");
    expect(ex(586, 590)).toContain("If it rains, we will dance inside.");
    expect(ex(586, 590)).toContain("We have to make the costumes.");
    expect(ex(586, 590)).toContain("We're practicing every day.");
    expect(ex(586, 590)).toContain("Why don't we sing together?");
    expect(ex(586, 590)).toContain("There will be food stands and a dance show.");
    expect(ex(591, 595)).toContain("My friend lives by the sea. She plays the drums.");
    expect(ex(591, 595)).toContain("I'm dancing now. Yesterday, I swam.");
    expect(ex(591, 595)).toContain("Next year, I'm going to");
    expect(ex(591, 595)).toContain("The island is more exciting than the market.");
    expect(ex(591, 595)).toContain("At the festival, you have to");
    expect(ex(596, 600)).toContain("My best memory of this trip is");
    expect(ex(596, 600)).toContain("Last year,");
    expect(ex(596, 600)).toContain("Speak slowly. Look at the audience.");
    expect(ex(596, 600)).toContain("Tomorrow is the big day!");
    expect(ex(596, 600)).toContain("Thank you for coming to our festival!");
  });

  it("There will be は L579 から、Why don't we は L589 から（それまでの 表現・セリフには 出さない）", () => {
    if (w20.length === 0) return;
    const texts = (a: number, b: number) => range(a, b).flatMap((l) => [...l.school.expressions.map((e) => e.en), ...l.conversation!.lines.map((x) => x.en)]).join(" ");
    expect(texts(571, 578)).not.toMatch(/There will be/);
    expect(texts(571, 588)).not.toMatch(/Why don't we/);
  });

  it("ステージ2: 先生の 台本は ほぼ 英語（日本語の たすけは みじかく）、会話シーンは 4〜7 行、L600 は スピード TPR", () => {
    if (w20.length === 0) return;
    for (const l of w20) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.25);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(120);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(4);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    expect(at(600)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("こころの くばり: ことわっても OK・ひは おとな・きんちょうしても OK・まいごは その ばで まつ・ネットに じゅうしょを かかない、発表の AI 会話は「なまえは いわなくて OK」", () => {
    if (w20.length === 0) return;
    expect(at(573)!.teacherScript).toMatch(/It's okay to say no/);
    expect(at(573)!.school.expressions.map((e) => e.en)).toContain("That's okay. Maybe next time!");
    for (const n of [576, 585]) expect(at(n)!.teacherScript, `L${n}`).toMatch(/ask an adult/);
    expect(at(595)!.teacherScript).toMatch(/Stay in one place/);
    expect(at(598)!.school.expressions.map((e) => e.en)).toContain("It's okay to be nervous.");
    expect(at(575)!.teacherScript).toMatch(/Never write your home address on the internet/);
    for (const n of [575, 580, 590, 591, 596, 597, 600]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/なまえは いわなくて OK/);
  });

  it("物語: L599 で つぎの ちず（ことづての塔）を みつけ、L600 は ステージ2 の 600 かい きねん", () => {
    if (w20.length === 0) return;
    const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
    expect(said(599)).toMatch(/new map/);
    expect(said(600)).toMatch(/600th lesson/);
    expect(said(600)).toMatch(/Tower of Messages/);
  });
});

describe("カリキュラム: ワールド21 の決まりごと（ことづての塔・ステージ3 の はじまり）", () => {
  const w21 = LESSONS.filter((l) => l.world === 21);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
  const texts = (a: number, b: number) => range(a, b).flatMap((l) => [...l.school.expressions.map((e) => e.en), ...l.conversation!.lines.map((x) => x.en)]).join(" ");

  it("ワールド21 は 601〜630 の 30 レッスン、ステージ3・A2、学年の めやすは 中2", () => {
    if (w21.length === 0) return; // 未作成ならスキップ
    expect(w21.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 601 + i));
    for (const l of w21) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中2");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w21.length === 0) return;
    expect(at(601)!.title).toBe("The Tower of Messages");
    expect(at(602)!.title).toBe("Hello, This Is Haru");
    expect(at(607)!.title).toBe("You're on Mute!");
    expect(at(611)!.title).toBe("Can I Take a Message?");
    expect(at(613)!.title).toBe("He Said He Was Busy");
    expect(at(616)!.title).toBe("What Were You Doing?");
    expect(at(618)!.title).toBe("While We Were Sleeping");
    expect(at(621)!.title).toBe("Dear Ms. Emma");
    expect(at(624)!.title).toBe("Stay Safe Online");
    expect(at(627)!.title).toBe("Phone, Video or Email?");
    expect(at(630)!.title).toBe("World 21 Grand Review");
  });

  it("フォニックス: dis- → mis- / pre- → ことばの パーツ → -ment / -ness → 音の つながり（各ブロックの 5回目と L626〜630 は ふりかえり）", () => {
    if (w21.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(601, 604, "dis");
    rule(606, 609, "mis-pre");
    rule(611, 614, "word-parts");
    rule(616, 619, "ment-ness");
    rule(621, 624, "linking");
    for (const n of [605, 610, 615, 620, 625, 626, 627, 628, 629, 630]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // dis- の 回の dis の ことばは 表に ある（L604 は un- と くらべる）
    for (const l of range(601, 605)) for (const w of l.phonics.words.filter((x) => x.startsWith("dis"))) expect(disOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(at(604)!.phonics.focus).toEqual(["dis-", "un-"]);
    // mis- は 606〜607、pre- は 608 から、609 で まぜる
    expect(range(606, 607).flatMap((l) => l.phonics.focus)).toEqual(["mis-", "mis-"]);
    expect(at(608)!.phonics.focus).toEqual(["pre-"]);
    for (const l of range(606, 610)) for (const w of l.phonics.words.filter((x) => /^(mis|pre)/.test(x))) expect(misPreBlank(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    // パーツ: tele → phone → graph → photo（どの ことばも その回の パーツで 問える）
    expect(range(611, 613).map((l) => l.phonics.focus[0])).toEqual(["tele-", "phone", "graph"]);
    for (const l of range(611, 615)) for (const w of l.phonics.words) expect(partOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    // -ment → -ness（y を i に かえる ことばも あつかう）
    for (const l of range(616, 620)) for (const w of l.phonics.words) expect(suffixOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(616, 620).flatMap((l) => l.phonics.words.map((w) => suffixOf(w)!.trap))).toContain("y-to-i");
    // 音の つながり: focus は フレーズ そのもの、ことばと 1つずつ 対応
    for (const l of range(621, 625)) {
      expect(l.phonics.focus, `L${l.lessonNo}`).toEqual(l.phonics.words);
      for (const w of l.phonics.words) expect(linkOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
    for (const p of ["hold on", "can I", "check it out"]) expect(range(621, 625).flatMap((l) => l.phonics.words)).toContain(p);
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w21.length === 0) return;
    expect(ex(601, 605)).toContain("Messages fly from this tower every day.");
    expect(ex(601, 605)).toContain("Hello, this is Haru. May I speak to Riko?");
    expect(ex(601, 605)).toContain("Hold on, please. I'll get her.");
    expect(ex(601, 605)).toContain("I think you have the wrong number.");
    expect(ex(601, 605)).toContain("Hi, it's Kiko. Are you free on Saturday?");
    expect(ex(606, 610)).toContain("Can you hear me?");
    expect(ex(606, 610)).toContain("Yes, loud and clear.");
    expect(ex(606, 610)).toContain("You're on mute. Click the microphone.");
    expect(ex(606, 610)).toContain("The screen froze. Can you say that again?");
    expect(ex(606, 610)).toContain("Let me show you my room.");
    expect(ex(606, 610)).toContain("What time is it there?");
    expect(ex(611, 615)).toContain("She's out right now. Can I take a message?");
    expect(ex(611, 615)).toContain("Could you tell her to call me back?");
    expect(ex(611, 615)).toContain("He said he was busy.");
    expect(ex(611, 615)).toContain("Riko says the bus leaves at nine.");
    expect(ex(611, 615)).toContain("Here's a message for you.");
    expect(ex(616, 620)).toContain("What were you doing at seven?");
    expect(ex(616, 620)).toContain("I was taking a bath when you called.");
    expect(ex(616, 620)).toContain("While we were sleeping, it snowed.");
    expect(ex(616, 620)).toContain("When the phone rang, I was cooking.");
    expect(ex(616, 620)).toContain("Birimo was reading. Kiko was painting.");
    expect(ex(621, 625)).toContain("Dear Ms. Emma, How are you?");
    expect(ex(621, 625)).toContain("Thanks for your email. I was happy to hear from you.");
    expect(ex(621, 625)).toContain("Best wishes, Riko");
    expect(ex(621, 625)).toContain("Don't share your address online.");
    expect(ex(621, 625)).toContain("I'm writing to tell you about my trip.");
    expect(ex(626, 630)).toContain("This emoji means \"I'm excited.\"");
    expect(ex(626, 630)).toContain("I think email is better for long messages.");
    expect(ex(626, 630)).toContain("I'm writing this letter from the top of the tower.");
    expect(ex(626, 630)).toContain("May I speak to");
    expect(ex(626, 630)).toContain("Thank you for calling. Talk to you soon!");
  });

  it("過去進行形（was / were ＋ ～ing）は L616 から、while の 文は L618 から（それまでの 表現・セリフ・先生の 台本には 出さない）", () => {
    if (w21.length === 0) return;
    const pastProg = /\b(was|were) [a-z]+ing\b/i;
    const before = (a: number, b: number) => texts(a, b) + " " + range(a, b).map((l) => l.teacherScript).join(" ");
    expect(before(601, 615)).not.toMatch(pastProg);
    expect(before(601, 617)).not.toMatch(/\bwhile\b/i);
    expect(texts(616, 616)).toMatch(pastProg);
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行、L630 は スピード TPR", () => {
    if (w21.length === 0) return;
    for (const l of w21) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
    }
    // 日本語の ヒントが ある 回は 3回だけ（はじめての 英語だけの 回・hold on・mute）
    expect(w21.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([601, 603, 607]);
    expect(at(630)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: でんわで じゅうしょを いわない・ネットの きまり・へやを みせる ときの ちゅうい・メールに じゅうしょを かかない、AI 会話は「なまえ（・じゅうしょ）は いわなくて OK」", () => {
    if (w21.length === 0) return;
    expect(at(604)!.teacherScript).toMatch(/If a stranger asks your name or address on the phone, don't tell them/);
    expect(at(609)!.teacherScript).toMatch(/Don't show letters with your address/);
    expect(at(624)!.teacherScript).toMatch(/Never meet an online friend alone/);
    expect(at(624)!.school.expressions.map((e) => e.en)).toEqual(["Don't share your address online.", "Keep your password secret.", "If something feels strange, tell an adult."]);
    expect(at(625)!.teacherScript).toMatch(/He didn't write his address or his school/);
    expect(at(619)!.teacherScript).toMatch(/always cook with an adult/);
    for (const n of [601, 602, 604, 605, 609, 615, 620, 621, 625, 628, 630]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/いわなくて OK|かかなくて OK/);
    expect(at(624)!.conversation!.aiTask.goalJa).toMatch(/ぜったいに いわない/);
  });

  it("物語: L601 で 塔に つき、L606〜610 は しまの エマ先生と ビデオ通話、L616〜620 は パイの なぞとき、L630 で こはくの図書館へ", () => {
    if (w21.length === 0) return;
    const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
    expect(said(601)).toMatch(/Tower of Messages/);
    expect(at(606)!.teacherScript).toMatch(/Festival Island/);
    expect(at(611)!.teacherScript).toMatch(/I'm back/);
    expect(said(616)).toMatch(/pie is missing/);
    expect(said(620)).toMatch(/hungry little bird/);
    expect(said(630)).toMatch(/Amber Library/);
  });
});

describe("カリキュラム: ワールド22 の決まりごと（こはくの図書館）", () => {
  const w22 = LESSONS.filter((l) => l.world === 22);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");

  it("ワールド22 は 631〜660 の 30 レッスン、ステージ3・A2、学年の めやすは 中3", () => {
    if (w22.length === 0) return; // 未作成ならスキップ
    expect(w22.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 631 + i));
    for (const l of w22) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中3");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w22.length === 0) return;
    expect(at(631)!.title).toBe("A Library Made of Amber");
    expect(at(632)!.title).toBe("What's It About?");
    expect(at(636)!.title).toBe("The Main Character");
    expect(at(638)!.title).toBe("The Hero and the Villain");
    expect(at(641)!.title).toBe("At the Beginning");
    expect(at(645)!.title).toBe("Retell the Story");
    expect(at(647)!.title).toBe("So He Ran Away");
    expect(at(649)!.title).toBe("If I Find the Key");
    expect(at(651)!.title).toBe("\"Help!\" Shouted the Boy");
    expect(at(656)!.title).toBe("The Book That Won't Open");
    expect(at(660)!.title).toBe("World 22 Grand Review");
  });

  it("フォニックス: 人の -er / -or / -ist → 語の家族 → あいまい母音と 強勢 → -ous / -al → おわりの しるし（各ブロックの 5回目と L656〜660 は ふりかえり）", () => {
    if (w22.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(631, 634, "person-suffix");
    rule(636, 639, "word-family");
    rule(641, 644, "schwa-stress");
    rule(646, 649, "ous-al");
    rule(651, 654, "end-marks");
    for (const n of [635, 640, 645, 650, 655, 656, 657, 658, 659, 660]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // -er → -or → -ist → まぜる
    expect(range(631, 633).map((l) => l.phonics.focus)).toEqual([["-er"], ["-or"], ["-ist"]]);
    for (const l of range(631, 635)) for (const w of l.phonics.words) expect(personOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    // 語の家族: act → invent → protect → direct（どの ことばも その回の もとの ことばで 問える）
    expect(range(636, 638).map((l) => l.phonics.focus[0])).toEqual(["act", "invent", "protect"]);
    for (const l of range(636, 640)) for (const w of l.phonics.words) expect(familyOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    // あいまい母音: focus は はくで わけた 形、ことばと 1つずつ 対応
    for (const l of range(641, 645)) {
      expect(l.phonics.focus.map((f) => f.replace(/-/g, "")), `L${l.lessonNo}`).toEqual(l.phonics.words);
      for (const w of l.phonics.words) expect(schwaStressBlank(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
    expect(range(641, 645).flatMap((l) => l.phonics.focus)).toEqual(expect.arrayContaining(["a-sleep", "pen-cil", "sec-ond"]));
    // -ous → -al（y を i に かえる・e を とる ことばも あつかう）
    for (const l of range(646, 650)) for (const w of l.phonics.words) expect(adjOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    const traps = range(646, 650).flatMap((l) => l.phonics.words.map((w) => adjOf(w)!.trap));
    expect(traps).toEqual(expect.arrayContaining(["y-to-i", "drop-e", "ous-not-us", "al-not-le"]));
    // おわりの しるし: focus は フレーズ そのもの、? と ! の りょうほう
    for (const l of range(651, 655)) {
      expect(l.phonics.focus, `L${l.lessonNo}`).toEqual(l.phonics.words);
      for (const w of l.phonics.words) expect(markOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
    expect(new Set(range(651, 655).flatMap((l) => l.phonics.words.map((w) => markOf(w)!.answer)))).toEqual(new Set(["?", "!"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w22.length === 0) return;
    expect(ex(631, 635)).toContain("This library has a million books.");
    expect(ex(631, 635)).toContain("What's it about? It's about a brave cat.");
    expect(ex(631, 635)).toContain("Who wrote this book? A famous writer did.");
    expect(ex(631, 635)).toContain("You should read it. It's really funny.");
    expect(ex(631, 635)).toContain("I like it because");
    expect(ex(636, 640)).toContain("The main character is a shy dragon.");
    expect(ex(636, 640)).toContain("She's brave and kind.");
    expect(ex(636, 640)).toContain("The villain wanted the magic stone.");
    expect(ex(636, 640)).toContain("I like the fox because he's clever.");
    expect(ex(636, 640)).toContain("This is Mira. She's a famous inventor.");
    expect(ex(641, 645)).toContain("At the beginning, the dragon was alone.");
    expect(ex(641, 645)).toContain("In the middle, he met a little girl.");
    expect(ex(641, 645)).toContain("At the end, they became friends.");
    expect(ex(641, 645)).toContain("What happened next? He found a door.");
    expect(ex(641, 645)).toContain("Can you tell me more?");
    expect(ex(641, 645)).toContain("First, the dragon was alone. Then, he met a girl.");
    expect(ex(646, 650)).toContain("She was sad because she lost her friend.");
    expect(ex(646, 650)).toContain("I think she felt lonely because");
    expect(ex(646, 650)).toContain("He was scared, so he ran away.");
    expect(ex(646, 650)).toContain("When the bell rang, the door opened.");
    expect(ex(646, 650)).toContain("If we find the key, we can open the book.");
    expect(ex(646, 650)).toContain("At first, she felt lonely. Later, she felt happy.");
    expect(ex(651, 655)).toContain("\"Help!\" shouted the boy.");
    expect(ex(651, 655)).toContain("She said, \"Thank you for saving me.\"");
    expect(ex(651, 655)).toContain("\"Oh no!\" she cried sadly.");
    expect(ex(651, 655)).toContain("\"Oh no!\" he shouted in surprise.");
    expect(ex(651, 655)).toContain("Once upon a time, there was a little fox.");
    expect(ex(651, 655)).toContain("\"Hello,\" said the fox.");
    expect(ex(651, 655)).toContain("\"Who are you?\" asked the dragon.");
    expect(ex(656, 660)).toContain("We need three words to open this book.");
    expect(ex(656, 660)).toContain("In my ending, the dragon flies home.");
    expect(ex(656, 660)).toContain("You should read it because");
    expect(ex(656, 660)).toContain("What's it about?");
    expect(ex(656, 660)).toContain("This story is about friendship. I loved it!");
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行、L660 は スピード TPR", () => {
    if (w22.length === 0) return;
    for (const l of w22) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
    }
    // 日本語の ヒントが ある 回は 2回だけ（main character・villain）
    expect(w22.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([636, 638]);
    expect(at(660)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("セリフの かぎかっこの 文（\"～,\" said ～.）は L651 から（それまでの 表現には 出さない）", () => {
    if (w22.length === 0) return;
    expect(ex(631, 650)).not.toMatch(/" (said|asked|shouted|whispered|cried) /);
    expect(ex(651, 651)).toMatch(/" shouted the boy/);
  });

  it("物語: L631 で こはくの図書館に つき、L649 で ひらかない ほん、L650 で かぎ、L656 で 3つの ことば、L660 で みどりの研究所へ", () => {
    if (w22.length === 0) return;
    const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
    expect(said(631)).toMatch(/Amber Library/);
    expect(at(631)!.teacherScript).toMatch(/Professor Quill/);
    expect(said(649)).toMatch(/won't open/);
    expect(said(650)).toMatch(/A key!/);
    expect(said(656)).toMatch(/Friendship! Courage! Imagination!/);
    expect(said(660)).toMatch(/Green Laboratory/);
  });
});

describe("カリキュラム: ワールド23 の決まりごと（みどりの研究所）", () => {
  const w23 = LESSONS.filter((l) => l.world === 23);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");

  it("ワールド23 は 661〜690 の 30 レッスン、ステージ3・A2、学年の めやすは 中3", () => {
    if (w23.length === 0) return; // 未作成ならスキップ
    expect(w23.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 661 + i));
    for (const l of w23) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中3");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w23.length === 0) return;
    expect(at(661)!.title).toBe("The Green Laboratory");
    expect(at(662)!.title).toBe("Lab Safety First");
    expect(at(666)!.title).toBe("I Predict It Will Float");
    expect(at(668)!.title).toBe("The Result Was Surprising");
    expect(at(671)!.title).toBe("If You Heat Ice");
    expect(at(673)!.title).toBe("What Happens If...?");
    expect(at(676)!.title).toBe("It's Made of Wood");
    expect(at(678)!.title).toBe("Rice Is Grown in Japan");
    expect(at(681)!.title).toBe("Seeds Need Water");
    expect(at(686)!.title).toBe("Science Fair Plan");
    expect(at(690)!.title).toBe("World 23 Grand Review");
  });

  it("フォニックス: 理科の パーツ → -ment → 強勢の 移動 → -y → -tion（各ブロックの 5回目と L686〜690 は ふりかえり）", () => {
    if (w23.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(661, 664, "science-parts");
    rule(666, 669, "ment-spelling");
    rule(671, 674, "stress-shift");
    rule(676, 679, "y-adjective");
    rule(681, 684, "tion-noun");
    for (const n of [665, 670, 675, 680, 685, 686, 687, 688, 689, 690]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // micro- → -scope → -meter → まぜる（thermo- も）
    expect(range(661, 663).map((l) => l.phonics.focus)).toEqual([["micro-"], ["-scope"], ["-meter"]]);
    expect(at(664)!.phonics.focus).toContain("thermo-");
    for (const l of range(661, 665)) for (const w of l.phonics.words) expect(sciPartOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    // -ment: もとの ことばの ない ことば・e を のこす・かさねない・n を わすれない
    for (const l of range(666, 670)) for (const w of l.phonics.words) expect(mentOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(new Set(range(666, 670).flatMap((l) => l.phonics.words.map((w) => mentOf(w)!.trap)))).toEqual(new Set(["weak-ment", "keep-e", "no-double", "keep-n"]));
    // 強勢の 移動: focus は はくで わけた 形、ことばと 1つずつ 対応。かぞくの 2つが そろう
    for (const l of range(671, 675)) {
      expect(l.phonics.focus.map((f) => f.replace(/-/g, "")), `L${l.lessonNo}`).toEqual(l.phonics.words);
      for (const w of l.phonics.words) expect(shiftOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
    expect(range(671, 674).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["photograph", "photography", "scientist", "scientific"]));
    // -y: 3つの きまり
    for (const l of range(676, 680)) for (const w of l.phonics.words) expect(yAdjOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(new Set(range(676, 680).flatMap((l) => l.phonics.words.map((w) => yAdjOf(w)!.trap)))).toEqual(new Set(["add-y", "drop-e", "double"]));
    // -tion: 3つの きまり、計画の observation・prediction・reaction を ふくむ
    for (const l of range(681, 685)) for (const w of l.phonics.words) expect(tionOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(new Set(range(681, 685).flatMap((l) => l.phonics.words.map((w) => tionOf(w)!.trap)))).toEqual(new Set(["add-ion", "drop-e", "ate-tion"]));
    expect(range(681, 685).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["observation", "prediction", "reaction"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w23.length === 0) return;
    expect(ex(661, 665)).toContain("Scientists study plants here.");
    expect(ex(661, 665)).toContain("Wear your goggles. Don't touch the hot plate.");
    expect(ex(661, 665)).toContain("We need to");
    expect(ex(661, 665)).toContain("I can see tiny circles!");
    expect(ex(661, 665)).toContain("The water is 20 degrees.");
    expect(ex(661, 665)).toContain("Today, I observed a leaf.");
    expect(ex(666, 670)).toContain("I predict the apple will float.");
    expect(ex(666, 670)).toContain("I observed small bubbles.");
    expect(ex(666, 670)).toContain("The result was surprising. The egg floated!");
    expect(ex(666, 670)).toContain("It happened because salt water is heavier.");
    expect(ex(666, 670)).toContain("We predicted the egg would sink. The result was different.");
    expect(ex(671, 675)).toContain("If you heat ice, it melts.");
    expect(ex(671, 675)).toContain("When water freezes, it gets bigger.");
    expect(ex(671, 675)).toContain("What happens if we mix blue and yellow?");
    expect(ex(671, 675)).toContain("Magnets stick to iron, but not to paper.");
    expect(ex(671, 675)).toContain("If you drop a ball, it falls.");
    expect(ex(676, 680)).toContain("This chair is made of wood.");
    expect(ex(676, 680)).toContain("Paper is made from trees.");
    expect(ex(676, 680)).toContain("Rice is grown in many parts of Japan.");
    expect(ex(676, 680)).toContain("Where is chocolate made?");
    expect(ex(676, 680)).toContain("It's made of glass and metal.");
    expect(ex(681, 685)).toContain("Seeds need water and warm air.");
    expect(ex(681, 685)).toContain("First, a root grows. Then, a stem grows.");
    expect(ex(681, 685)).toContain("A caterpillar becomes a butterfly.");
    expect(ex(681, 685)).toContain("Plants need sunlight to grow.");
    expect(ex(681, 685)).toContain("On day five, the stem was three centimeters tall.");
    expect(ex(686, 690)).toContain("Our question is \"Do plants like music?\"");
    expect(ex(686, 690)).toContain("We played music for one plant every day.");
    expect(ex(686, 690)).toContain("purpose, prediction, result and conclusion");
    expect(ex(686, 690)).toContain("We can't be sure yet.");
    expect(ex(686, 690)).toContain("We found out something amazing!");
  });

  it("受け身（is made of / is grown in など）は L676 から（それまでの 表現・会話・台本には 出さない）", () => {
    if (w23.length === 0) return;
    for (const l of range(661, 675)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(is|are|was|were) (made|grown|called|used|built)\b/);
    expect(ex(676, 676)).toMatch(/is made of/);
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行、L690 は スピード TPR", () => {
    if (w23.length === 0) return;
    for (const l of w23) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
    }
    // 日本語の ヒントが ある 回は 2回だけ（caterpillar・conclusion）
    expect(w23.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([683, 688]);
    expect(at(690)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: L662 で きまり（ゴーグル・ホットプレート・おとなに きく・あじみしない）、ひを つかう 回は おとなが つける", () => {
    if (w23.length === 0) return;
    const s = at(662)!.teacherScript;
    for (const r of ["Always ask an adult first.", "Wear your goggles.", "Don't touch the hot plate.", "Never taste anything in the lab."]) expect(s).toContain(r);
    expect(at(671)!.teacherScript).toContain("An adult turns on the hot plate.");
    expect(ex(671, 675)).toContain("Don't put a glass bottle in the freezer.");
  });

  it("物語: L661 で みどりの研究所に つき、ねむる たね → L689 で さむい ふゆ → L690 で めが でて くもの上の鉄道へ", () => {
    if (w23.length === 0) return;
    const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
    expect(said(661)).toMatch(/Sleeping Seed/);
    expect(at(661)!.teacherScript).toMatch(/Dr\. Moss/);
    expect(said(689)).toMatch(/cold winter/);
    expect(said(690)).toMatch(/sprout/);
    expect(said(690)).toMatch(/Cloudtop Railway/);
  });
});
