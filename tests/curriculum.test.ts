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
import { contrOf, imInOf, overUnderOf, placeOf, placeSyllables, ppOf } from "@/lib/curriculum/w24Phonics";
import { compoundFocus, compoundOf, intonationOf, iveOf, nessOf, synOf } from "@/lib/curriculum/w25Phonics";
import { edIngOf, punctOf, stressOf, twisterOf, voiceOf, w26FocusOf } from "@/lib/curriculum/w26Phonics";
import { ableOf, chKOf, forSinceOf, homoOf, silentOf, w27FocusOf } from "@/lib/curriculum/w27Phonics";
import { katakanaOf, linkOf as link28Of, loanOf, partsOf, rhythmOf, w28FocusOf } from "@/lib/curriculum/w28Phonics";
import { dictOf, emphasisOf, ibleOf, spectOf, w29FocusOf, weakOf } from "@/lib/curriculum/w29Phonics";
import { abbrOf, autoOf, casualOf, icOf, transOf, w30FocusOf } from "@/lib/curriculum/w30Phonics";
import { familyOf as familyOf31, personOf as personOf31, portOf, structOf, w31FocusOf, yearOf } from "@/lib/curriculum/w31Phonics";
import { alOf, dataOf, directionOf, geoOf, numberOf, w32FocusOf } from "@/lib/curriculum/w32Phonics";
import { jectOf, listOf, nounEndOf, proofOf, ruptOf, w33FocusOf } from "@/lib/curriculum/w33Phonics";
import { doubleOf, izeOf, travelNumberOf, ukUsOf, visOf, w34FocusOf } from "@/lib/curriculum/w34Phonics";
import { contrastOf, formalOf, interCoOf, ityOf, rootOf, w35FocusOf } from "@/lib/curriculum/w35Phonics";
import { academicOf, bioOf, ologyOf, pauseOf, unitOf, w36FocusOf } from "@/lib/curriculum/w36Phonics";
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
  }, 30_000); // 1,000 レッスン を こえて 全体 実行（ほかの テストと 並列）では 5 秒を こえる ことが ある
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

describe("カリキュラム: ワールド24 の決まりごと（くもの上の鉄道）", () => {
  const w24 = LESSONS.filter((l) => l.world === 24);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");

  it("ワールド24 は 691〜720 の 30 レッスン、ステージ3・A2+、学年の めやすは 中3", () => {
    if (w24.length === 0) return; // 未作成ならスキップ
    expect(w24.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 691 + i));
    for (const l of w24) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中3");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2+");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w24.length === 0) return;
    expect(at(691)!.title).toBe("All Aboard the Cloud Train");
    expect(at(692)!.title).toBe("A Ticket, Please");
    expect(at(693)!.title).toBe("One Way or Round Trip?");
    expect(at(696)!.title).toBe("Have You Ever Seen a Rainbow Train?");
    expect(at(697)!.title).toBe("I've Been to Hokkaido");
    expect(at(700)!.title).toBe("Experience Bingo");
    expect(at(701)!.title).toBe("I'm Lost");
    expect(at(706)!.title).toBe("What a View!");
    expect(at(711)!.title).toBe("How Long Does It Take?");
    expect(at(714)!.title).toBe("It's Impossible!");
    expect(at(716)!.title).toBe("My Travel Blog");
    expect(at(720)!.title).toBe("World 24 Grand Review");
  });

  it("フォニックス: 地名の 強勢 → 過去分詞 → 短縮形 → over- / under- → im- / in-（各ブロックの 5回目と L716〜720 は ふりかえり）", () => {
    if (w24.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(691, 694, "place-stress");
    rule(696, 699, "past-participle");
    rule(701, 704, "perfect-contraction");
    rule(706, 709, "over-under");
    rule(711, 714, "im-in");
    for (const n of [695, 700, 705, 710, 715, 716, 717, 718, 719, 720]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // 地名: focus は はくで わけた 形、ことばと 1つずつ 対応。日本の 地名も 入る
    for (const l of range(691, 695)) {
      expect(l.phonics.focus, `L${l.lessonNo}`).toEqual(l.phonics.words.map((w) => w.toLowerCase().replace(/-/g, "")).map((w) => placeSyllables(w)));
      for (const w of l.phonics.words) expect(placeOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
    expect(range(691, 694).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["Hokkaido", "Okinawa", "Canada", "Australia"]));
    // 過去分詞: 計画の seen・eaten・been・done・gone を ふくみ、4つの わなが そろう
    for (const l of range(696, 700)) for (const w of l.phonics.words) expect(ppOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(696, 699).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["seen", "eaten", "been", "done", "gone"]));
    expect(new Set(range(696, 700).flatMap((l) => l.phonics.words.map((w) => ppOf(w)!.trap)))).toEqual(new Set(["irregular", "en", "double", "wn"]));
    // 短縮形: I've・haven't・she's（has）
    for (const l of range(701, 704)) for (const w of l.phonics.words) expect(contrOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(701, 704).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["I've", "haven't", "she's"]));
    // over- / under-: 両方の パーツ、計画の overnight・underground
    for (const l of range(706, 710)) for (const w of l.phonics.words) expect(overUnderOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(706, 715).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["overnight", "underground"]));
    // im- / in-: 計画の impossible・incorrect・invisible、両方の パーツ
    for (const l of range(711, 714)) for (const w of l.phonics.words) expect(imInOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(711, 714).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["impossible", "incorrect", "invisible"]));
    expect(new Set(range(711, 714).flatMap((l) => l.phonics.words.map((w) => imInOf(w)!.prefix)))).toEqual(new Set(["im", "in"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w24.length === 0) return;
    expect(ex(691, 695)).toContain("This train runs above the clouds!");
    expect(ex(691, 695)).toContain("A ticket to Star Station, please.");
    expect(ex(691, 695)).toContain("One way or round trip?");
    expect(ex(691, 695)).toContain("Round trip, please.");
    expect(ex(691, 695)).toContain("Which platform does the train leave from?");
    expect(ex(691, 695)).toContain("The next train leaves at 10:15 from platform 3.");
    expect(ex(696, 700)).toContain("Have you ever seen a rainbow train?");
    expect(ex(696, 700)).toContain("I've been to Hokkaido.");
    expect(ex(696, 700)).toContain("When did you go?");
    expect(ex(696, 700)).toContain("How was it?");
    expect(ex(696, 700)).toContain("I've never eaten it. Is it good?");
    expect(ex(696, 700)).toContain("I've been there twice.");
    expect(ex(696, 700)).toContain("Have you ever ridden a horse?");
    expect(ex(701, 705)).toContain("Excuse me. I'm lost. Could you help me?");
    expect(ex(701, 705)).toContain("I missed the train! When's the next one?");
    expect(ex(701, 705)).toContain("I left my bag on the train.");
    expect(ex(701, 705)).toContain("It's a small blue bag with a star on it.");
    expect(ex(701, 705)).toContain("Don't worry. I'll help you.");
    expect(ex(706, 710)).toContain("What a view! I can see the mountains.");
    expect(ex(706, 710)).toContain("Look out the window! There's a castle.");
    expect(ex(706, 710)).toContain("Excuse me. Is this seat taken?");
    expect(ex(706, 710)).toContain("I'll have the sandwich set, please.");
    expect(ex(706, 710)).toContain("Where are you going?");
    expect(ex(706, 710)).toContain("I'm going to the sea.");
    expect(ex(711, 715)).toContain("How long does it take?");
    expect(ex(711, 715)).toContain("It takes two hours.");
    expect(ex(711, 715)).toContain("We're taking the overnight train.");
    expect(ex(711, 715)).toContain("Take the underground line to the museum.");
    expect(ex(711, 715)).toContain("It's impossible to see everything in one day.");
    expect(ex(711, 715)).toContain("First, we'll take the train.");
    expect(ex(716, 720)).toContain("Day 1: I've arrived at Star Station!");
    expect(ex(716, 720)).toContain("I'll buy this for my sister.");
    expect(ex(716, 720)).toContain("Have you ever been abroad?");
    expect(ex(716, 720)).toContain("I've had the best trip ever!");
  });

  it("現在完了（I've ～ / Have you ever ～?）は L696 から（それまでの 表現・会話・台本・TPR には 出さない）", () => {
    if (w24.length === 0) return;
    const perfect = /\b(I've|we've|you've|they've|haven't|hasn't|have (been|seen|ever|never)|has (been|seen))\b/i;
    for (const l of range(691, 695)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(perfect);
    expect(ex(696, 696)).toMatch(/Have you ever seen/);
    // 関係代名詞（ステージ4）は 出さない
    for (const l of w24) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(people|person|someone|a friend|the man|the woman) who\b/);
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行、L720 は スピード TPR", () => {
    if (w24.length === 0) return;
    for (const l of w24) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
    }
    // 日本語の ヒントが ある 回は 2回だけ（round trip・lost and found）
    expect(w24.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([693, 703]);
    expect(at(720)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: まいごの ときは えきいんさん・しらない ひとに ついて いかない、ネットに かおや がっこうの なまえを のせない、AI 会話で 個人情報を きかない", () => {
    if (w24.length === 0) return;
    expect(at(701)!.teacherScript).toContain("Don't go anywhere with strangers.");
    expect(at(701)!.teacherScript).toContain("Look for station staff");
    expect(at(705)!.teacherScript).toContain("Never go anywhere alone with a stranger.");
    expect(ex(716, 716)).toContain("Don't put your face or your school's name online.");
    expect(at(716)!.teacherScript).toContain("always ask your family first");
    for (const l of w24) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
  });

  it("物語: L691 で 研究所の おくじょうから くもの れっしゃへ → L703〜704 で キコの かばん → L719 で ふるい ちず → L720 で なぞときの どうくつへ", () => {
    if (w24.length === 0) return;
    expect(said(691)).toMatch(/station on the roof/);
    expect(at(699)!.teacherScript).toMatch(/Conductor Nimbus/);
    expect(said(703)).toMatch(/I left my bag on the train!/);
    expect(said(704)).toMatch(/Yes, it is! Thank you so much!/);
    expect(said(719)).toMatch(/old map/);
    expect(said(720)).toMatch(/Cave of Riddles/);
  });
});

describe("カリキュラム: ワールド25 の決まりごと（なぞときの洞くつ）", () => {
  const w25 = LESSONS.filter((l) => l.world === 25);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en)).join(" ");
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");

  it("ワールド25 は 721〜750 の 30 レッスン、ステージ3・A2+、学年の めやすは 中3", () => {
    if (w25.length === 0) return; // 未作成ならスキップ
    expect(w25.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 721 + i));
    for (const l of w25) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中3");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2+");
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w25.length === 0) return;
    expect(at(721)!.title).toBe("Into the Cave");
    expect(at(722)!.title).toBe("There's a Door at the Back");
    expect(at(723)!.title).toBe("In the Top Left Corner");
    expect(at(726)!.title).toBe("It Might Be a Bat");
    expect(at(728)!.title).toBe("It Can't Be a Ghost");
    expect(at(731)!.title).toBe("Look at These Footprints");
    expect(at(732)!.title).toBe("The Missing Crown");
    expect(at(736)!.title).toBe("It Has Four Legs");
    expect(at(738)!.title).toBe("Huge, Tiny, Giant");
    expect(at(741)!.title).toBe("Is It Bigger Than a Box?");
    expect(at(744)!.title).toBe("The Answer Is…");
    expect(at(746)!.title).toBe("A Mini Mystery Story");
    expect(at(750)!.title).toBe("World 25 Grand Review");
  });

  it("フォニックス: -ness → -ive → 複合語 → にた いみの ことば → しつもんの イントネーション（各ブロックの 5回目と L746〜750 は ふりかえり）", () => {
    if (w25.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(721, 724, "ness");
    rule(726, 729, "ive");
    rule(731, 734, "compound");
    rule(736, 739, "synonym");
    rule(741, 744, "intonation");
    for (const n of [725, 730, 735, 740, 745, 746, 747, 748, 749, 750]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // -ness: 計画の darkness・sadness・kindness、y を i に かえる ことばも
    for (const l of range(721, 724)) for (const w of l.phonics.words) expect(nessOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(721, 724).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["darkness", "sadness", "kindness", "happiness"]));
    // -ive: 計画の detective・creative・active、4つの わな
    for (const l of range(726, 729)) for (const w of l.phonics.words) expect(iveOf(w), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(726, 729).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["detective", "creative", "active"]));
    expect(new Set(range(726, 729).flatMap((l) => l.phonics.words.map((w) => iveOf(w)!.trap)))).toEqual(new Set(["plain", "drop-e", "change", "ative"]));
    // 複合語: focus は 2つに わけた 形で ことばと 1つずつ 対応。計画の footprint・flashlight・somebody
    for (const l of range(731, 734)) {
      expect(l.phonics.focus, `L${l.lessonNo}`).toEqual(l.phonics.words.map((w) => compoundFocus(w)));
      for (const w of l.phonics.words) expect(compoundOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    }
    expect(range(731, 734).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["footprint", "flashlight", "somebody"]));
    // にた いみ: 計画の huge・tiny・giant
    for (const l of range(736, 739)) for (const w of l.phonics.words) expect(synOf(w, l.phonics.focus), `L${l.lessonNo} ${w}`).not.toBeNull();
    expect(range(736, 739).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["huge", "tiny", "giant"]));
    // イントネーション: Wh（↘）と Yes / No（↗）が どの 回にも ある
    for (const l of range(741, 744)) {
      const kinds = l.phonics.words.map((w) => intonationOf(w)?.kind);
      expect(kinds, `L${l.lessonNo}`).not.toContain(undefined);
      expect(new Set(kinds), `L${l.lessonNo}`).toEqual(new Set(["wh", "yesno"]));
      expect(l.phonics.sounds, `L${l.lessonNo}`).toEqual(kinds.map((k) => (k === "wh" ? "↘" : "↗")));
    }
  });

  it("文法・会話スキルの 型が 計画どおり入っている", () => {
    if (w25.length === 0) return;
    expect(ex(721, 725)).toContain("It's dark in here. Turn on your flashlight.");
    expect(ex(721, 725)).toContain("There's a small door at the back of the cave.");
    expect(ex(721, 725)).toContain("In the top left corner, there's a bat.");
    expect(ex(721, 725)).toContain("There's a lamp next to the box.");
    expect(ex(721, 725)).toContain("At the end of the tunnel, there's a lake.");
    expect(ex(726, 730)).toContain("What's that sound?");
    expect(ex(726, 730)).toContain("It might be a bat.");
    expect(ex(726, 730)).toContain("It's small and gold. It must be a key.");
    expect(ex(726, 730)).toContain("It can't be a ghost. Ghosts aren't real!");
    expect(ex(726, 730)).toContain("It's probably a bear's footprint.");
    expect(ex(731, 735)).toContain("Look at these footprints. Someone was here.");
    expect(ex(731, 735)).toContain("The crown was here yesterday. Now it's gone.");
    expect(ex(731, 735)).toContain("Where were you at three o'clock?");
    expect(ex(731, 735)).toContain("Do you know who took it?");
    expect(ex(731, 735)).toContain("Clue 1: wet footprints. Clue 2: a blue feather.");
    expect(ex(736, 740)).toContain("It has four legs, but it can't walk.");
    expect(ex(736, 740)).toContain("The more you take, the more you leave behind.");
    expect(ex(736, 740)).toContain("It's a huge rock with a tiny hole.");
    expect(ex(736, 740)).toContain("It's yellow. Monkeys love it.");
    expect(ex(736, 740)).toContain("I'm round. I have a face, but no eyes.");
    expect(ex(741, 745)).toContain("Is it bigger than a box?");
    expect(ex(741, 745)).toContain("Was the thief tall?");
    expect(ex(741, 745)).toContain("It can't be Haru. He was with me.");
    expect(ex(741, 745)).toContain("The thief was the crow! It loves shiny things.");
    expect(ex(746, 750)).toContain("Who ate the cookies?");
    expect(ex(746, 750)).toContain("In this picture, something is strange.");
    expect(ex(746, 750)).toContain("One night, the museum's painting disappeared.");
    expect(ex(746, 750)).toContain("The case is closed! Great detective work!");
  });

  it("推量（might / must）は L726 から、It can't be ～ は L728 から、Do you know who ～? は L734 から。関係代名詞は 出さない", () => {
    if (w25.length === 0) return;
    for (const l of range(721, 725)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(might|must)\b/i);
    for (const l of range(721, 727)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(it|that|this) can't be\b/i);
    for (const l of range(721, 733)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\bdo you know (who|where|what|when|why|how)\b/i);
    expect(ex(726, 726)).toMatch(/might/);
    expect(ex(734, 734)).toMatch(/Do you know who/);
    for (const l of w25) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(people|person|someone|somebody|a friend|the man|the woman|the animal|an animal) who\b/);
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行、L750 は スピード TPR", () => {
    if (w25.length === 0) return;
    for (const l of w25) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
    }
    // 日本語の ヒントが ある 回は 2回だけ（probably・witness）
    expect(w25.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([729, 734]);
    expect(at(750)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: AI 会話で 個人情報を きかない", () => {
    if (w25.length === 0) return;
    for (const l of w25) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
  });

  it("物語: L721 で どうくつへ → L732 で おうかんが きえる → L735 で てがかり → L744 で カラスが はんにん → L750 で ひびきの劇場へ", () => {
    if (w25.length === 0) return;
    expect(said(721)).toMatch(/flashlight/);
    expect(said(732)).toMatch(/crown/);
    expect(said(735)).toMatch(/feather/);
    expect(said(744)).toMatch(/crow/);
    expect(at(749)!.teacherScript + said(749) + at(750)!.teacherScript + said(750)).toMatch(/Theater of Echoes/);
  });
});

describe("カリキュラム: ワールド26 の決まりごと（ひびきの劇場）", () => {
  const w26 = LESSONS.filter((l) => l.world === 26);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en));
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;

  it("ワールド26 は 751〜780 の 30 レッスン、ステージ3・A2+、学年の めやすは 中3", () => {
    if (w26.length === 0) return; // 未作成ならスキップ
    expect(w26.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 751 + i));
    for (const l of w26) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中3");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2+");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w26.length === 0) return;
    const titles = ["The Theater of Echoes", "I Enjoy Acting", "I Want to Be the Dragon", "Audition Day", "Who Plays Which Role?", "I'm Nervous", "Excited or Exciting?", "Bored or Boring?", "How Do You Feel Now?", "Feelings Charades",
      "I Decided to Write a Play", "Suddenly…", "Luckily…", "They Tried to Escape", "Our Story Outline", "Say It with Feeling", "Speak Louder, Please", "Which Word Is Important?", "Stage Directions", "Scene Practice",
      "Costumes and Props", "Dress Rehearsal", "Break a Leg!", "Showtime!", "You Were Amazing!", "Review the Play", "My Short Script", "Story Circle", "Theater of Echoes Review", "World 26 Grand Review"];
    expect(w26.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: きもちの こえ → -ed / -ing → セリフの くとうてん → いみを かえる 強勢 → はやくちことば（各ブロックの 5回目と L776〜780 は ふりかえり）", () => {
    if (w26.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(751, 754, "voice");
    rule(756, 759, "ed-ing");
    rule(761, 764, "punctuation");
    rule(766, 769, "stress");
    rule(771, 774, "tongue-twister");
    for (const n of [755, 760, 765, 770, 775, 776, 777, 778, 779, 780]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド26 の 表に あり、その focus が レッスンの focus に ある
    for (const l of w26) {
      for (const w of l.phonics.words) {
        const f = w26FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
    }
    // きもちの こえ: どの 回にも ↗ と ↘ が ある（計画の Really?! / Really…）
    for (const l of range(751, 754)) expect(new Set(l.phonics.words.map((w) => voiceOf(w)!.up)), `L${l.lessonNo}`).toEqual(new Set([true, false]));
    expect(at(751)!.phonics.words).toEqual(expect.arrayContaining(["Really?!", "Oh, really…"]));
    // -ed / -ing: どの 回も ペアで、3つの つづりの きまりが そろう
    for (const l of range(756, 759)) {
      for (const e of l.phonics.words.map((w) => edIngOf(w)!)) expect(l.phonics.words, `L${l.lessonNo} ${e.word}`).toContain(e.wrong[0]);
    }
    expect(range(756, 759).flatMap((l) => l.phonics.words)).toEqual(expect.arrayContaining(["excited", "exciting", "bored", "boring"]));
    expect(new Set(range(756, 759).flatMap((l) => l.phonics.words.map((w) => edIngOf(w)!.trap)))).toEqual(new Set(["drop-e", "plain", "y"]));
    // くとうてん: " , ! … が ぜんぶ 出る
    expect(new Set(range(761, 764).flatMap((l) => l.phonics.words.map((w) => punctOf(w)!.point)))).toEqual(new Set(['"', ",", "!", "…"]));
    // 強勢: focus は つよく いう ことば（大文字）で ことばと 1つずつ 対応。計画の I didn't say SHE took it・I didn't eat YOUR cake
    for (const l of range(766, 769)) expect(l.phonics.focus, `L${l.lessonNo}`).toEqual(l.phonics.words.map((w) => stressOf(w)!.stressed));
    expect(at(768)!.phonics.words).toEqual(expect.arrayContaining(["I didn't eat YOUR cake", "I didn't say SHE took it"]));
    // はやくちことば: どの 回も 2つ 以上の おと
    for (const l of range(771, 774)) expect(new Set(l.phonics.words.map((w) => twisterOf(w)!.sound)).size, `L${l.lessonNo}`).toBeGreaterThanOrEqual(2);
    // ふりかえり L776〜780 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(776, 780)) {
      const kinds = new Set(l.phonics.words.map((w) => (voiceOf(w) ? "voice" : edIngOf(w) ? "ed-ing" : punctOf(w) ? "punct" : stressOf(w) ? "stress" : twisterOf(w) ? "twister" : "?")));
      expect(kinds, `L${l.lessonNo}`).toEqual(new Set(["voice", "ed-ing", "punct", "stress", "twister"]));
    }
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w26.length === 0) return;
    const want: Record<number, string> = {
      751: "Welcome to the theater! The show starts soon.", 752: "I enjoy acting. How about you?", 753: "I want to be the dragon in the play.", 754: "I'm good at singing. Can I try?",
      755: "Riko plays the princess. Birimo plays the dragon.", 756: "I'm nervous.", 757: "The play is exciting. I'm excited!", 758: "This scene is boring. Let's make it better.",
      759: "I feel proud of myself.", 760: "Are you surprised?", 761: "We decided to write our own play.", 762: "Suddenly, the lights went out.", 763: "Luckily, a little bird helped them.",
      764: "They tried to escape, but the door was locked.", 766: "Say it with feeling.", 767: "Speak louder, please. The people at the back can't hear.", 768: "I didn't eat YOUR cake.",
      769: "Walk to the center. Then, look up.", 770: "Who's there?", 771: "We need a crown and a cape.", 772: "It's fun to act in costumes!", 773: "Break a leg!", 774: "The princess opened the gate.",
      775: "You were amazing! I loved the ending.", 780: "Thank you for watching our play!",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(ex(756, 756)).toContain("Don't worry. You'll be great.");
    expect(ex(760, 760)).toContain("No, I'm confused!");
    expect(ex(766, 766).join(" ")).toContain("\"I'm free!\"");
    expect(ex(770, 770)).toContain("It's me, your friend!");
    expect(core(776)).toMatch(/^The best part was /);
    expect(ex(776, 776).join(" ")).toMatch(/Next time, we should /);
    expect(core(777)).toMatch(/^Narrator: One day, /);
    expect(core(779)).toMatch(/^I enjoy \w+ing\b/);
    expect(ex(779, 779).join(" ")).toMatch(/I decided to /);
  });

  it("動名詞は L752 から、decided to は L761 から、tried to は L764 から。関係代名詞は 出さない", () => {
    if (w26.length === 0) return;
    expect(allEn(at(751)!)).not.toMatch(/\b(enjoy|good at) \w+ing\b/i);
    expect(ex(752, 752).join(" ")).toMatch(/enjoy acting/);
    for (const l of range(751, 760)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\bdecided to\b/i);
    for (const l of range(751, 763)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\btried to\b/i);
    for (const l of w26) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(people|person|someone|somebody|a friend|the man|the woman|the animal|an animal|the girl|the boy|a bird|the bird|a dragon) (who|that)\b/i);
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行、L780 は スピード TPR", () => {
    if (w26.length === 0) return;
    for (const l of w26) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（excited・Break a leg）
    expect(w26.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([757, 773]);
    expect(at(780)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: AI 会話で 個人情報を きかない", () => {
    if (w26.length === 0) return;
    for (const l of w26) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
  });

  it("物語: L751 で 劇場へ → L755 で 配役 → L761 で じぶんたちの 劇を かく → L771 で ルマの おうかん → L774 で 本番 → L780 で いずみの里へ", () => {
    if (w26.length === 0) return;
    expect(at(751)!.teacherScript + said(751)).toMatch(/[Tt]heater/);
    expect(said(755)).toMatch(/princess/);
    expect(said(755)).toMatch(/dragon/);
    expect(at(761)!.teacherScript + said(761)).toMatch(/own play/);
    expect(at(771)!.teacherScript + said(771)).toMatch(/Luma/);
    expect(said(774) + at(774)!.teacherScript).toMatch(/gate/);
    expect(at(779)!.teacherScript + said(779) + at(780)!.teacherScript + said(780)).toMatch(/Village of Springs/);
  });
});

describe("カリキュラム: ワールド27 の決まりごと（いずみの里）", () => {
  const w27 = LESSONS.filter((l) => l.world === 27);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en));
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;

  it("ワールド27 は 781〜810 の 30 レッスン、ステージ3・A2+、学年の めやすは 中3", () => {
    if (w27.length === 0) return; // 未作成ならスキップ
    expect(w27.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 781 + i));
    for (const l of w27) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中3");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2+");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w27.length === 0) return;
    const titles = ["The Village of Springs", "What's Wrong?", "My Stomach Hurts", "At the Clinic", "I Hope You Feel Better", "How Often Do You Exercise?", "I Go to Bed at Nine", "Healthy Habits", "Screen Time", "Habit Survey",
      "I've Lived Here for Ten Years", "Since I Was Five", "How Long Have You Known Her?", "I've Been Here Since Monday", "My Long-Time Hobby", "You Should Drink Water", "You Shouldn't Skip Breakfast", "Why Don't You Take a Break?", "Advice Column", "Advice Show",
      "When I'm Worried", "Deep Breaths", "It's OK to Feel Sad", "Kind Words", "My Calm-Down Plan", "A Healthy Week Plan", "Health Quiz", "A Letter of Advice", "Village of Springs Review", "World 27 Grand Review"];
    expect(w27.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: ch / -ache → だまって いる もじ → for / since → -able → 同音異義語（各ブロックの 5回目と L806〜810 は ふりかえり）", () => {
    if (w27.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(781, 784, "ch-k");
    rule(786, 789, "silent");
    rule(791, 794, "for-since");
    rule(796, 799, "able");
    rule(801, 804, "homophones");
    for (const n of [785, 790, 795, 800, 805, 806, 807, 808, 809, 810]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド27 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w27) {
      for (const w of l.phonics.words) {
        const f = w27FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w27FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w27.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["stomach", "muscle", "knee", "wrist", "headache", "stomachache", "toothache", "comfortable", "enjoyable", "week", "weak", "here", "hear", "flour", "flower"]));
    // ch / -ache は 2つの focus が そろう、だまって いる もじは 6しゅるい 以上
    expect(new Set(range(781, 784).flatMap((l) => l.phonics.words.map((w) => chKOf(w)!.focus)))).toEqual(new Set(["ch", "-ache"]));
    expect(new Set(range(786, 789).flatMap((l) => l.phonics.words.map((w) => silentOf(w)!.letter))).size).toBeGreaterThanOrEqual(6);
    // for / since: L791 は for、L792 は since、L793・L794 は りょうほう
    expect(at(791)!.phonics.words.every((w) => forSinceOf(w)!.focus === "for")).toBe(true);
    expect(at(792)!.phonics.words.every((w) => forSinceOf(w)!.focus === "since")).toBe(true);
    for (const n of [793, 794]) expect(new Set(at(n)!.phonics.words.map((w) => forSinceOf(w)!.focus)), `L${n}`).toEqual(new Set(["for", "since"]));
    // -able: 5つの つづりの きまりが そろう
    expect(new Set(range(796, 799).flatMap((l) => l.phonics.words.map((w) => ableOf(w)!.trap)))).toEqual(new Set(["plain", "drop-e", "y", "keep-e", "double"]));
    // 同音異義語: どの 回も ペアで そろう
    for (const l of range(801, 804)) for (const w of l.phonics.words) expect(l.phonics.words, `L${l.lessonNo} ${w}`).toContain(homoOf(w)!.same);
    // ふりかえり L806〜810 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(806, 810)) {
      const kinds = new Set(l.phonics.words.map((w) => (chKOf(w) ? "ch" : silentOf(w) ? "silent" : forSinceOf(w) ? "for-since" : ableOf(w) ? "able" : homoOf(w) ? "homo" : "?")));
      expect(kinds, `L${l.lessonNo}`).toEqual(new Set(["ch", "silent", "for-since", "able", "homo"]));
    }
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w27.length === 0) return;
    const want: Record<number, string> = {
      781: "The spring water here is warm.", 782: "What's wrong?", 783: "My stomach hurts. I ate too much.", 784: "How long have you had a fever?", 785: "I hope you feel better soon.",
      786: "How often do you exercise?", 787: "I usually go to bed at nine.", 788: "Eating breakfast is good for your brain.", 789: "I play video games for one hour a day.", 790: "Five people eat breakfast every day.",
      791: "I've lived here for ten years.", 792: "I've played the piano since I was five.", 793: "How long have you known Riko?", 794: "We've been here since Monday.", 795: "I've practiced karate for three years.",
      796: "You should drink more water.", 797: "You shouldn't skip breakfast.", 798: "Why don't you take a break?", 799: "Dear Birimo, I can't sleep well. What should I do?",
      800: "I think you should go to bed early because sleep is important.", 801: "When I'm worried, I talk to my mom.", 802: "Take a deep breath. Count to five.", 803: "It's OK to feel sad sometimes.",
      804: "You did your best. I'm proud of you.", 805: "When I'm angry, I count to ten.", 806: "On Monday, I'm going to walk to school.", 807: "How many hours should children sleep?",
      808: "Dear friend, you should try a morning walk.", 810: "Healthy body, happy mind!",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(ex(782, 782).join(" ")).toMatch(/I have a headache/);
    expect(ex(784, 784).join(" ")).toMatch(/Since yesterday/);
    expect(ex(786, 786).join(" ")).toMatch(/Three times a week/);
    expect(ex(807, 807).join(" ")).toMatch(/Nine to twelve hours/);
    expect(core(809)).toMatch(/\bWe've been here for /);
    // 現在完了（継続）・When I'm ～ の 型
    for (const n of [791, 792, 794, 795]) expect(core(n), `L${n}`).toMatch(/\b(I've|We've) \w+ .*\b(for|since)\b/);
    for (const n of [801, 805]) expect(core(n), `L${n}`).toMatch(/^When I'm \w+, I /);
  });

  it("現在完了の for / since は L791 から（L784 の How long have you had a fever? だけ 先に チャンクで）、How often は L786 から、Why don't you は L798 から。関係代名詞は 出さない", () => {
    if (w27.length === 0) return;
    const perfect = /\b(have|has|'ve|haven't|hasn't) (lived|known|been|played|practiced|done|stayed|had|felt|studied|walked|waited)\b[^.?!]*\b(for|since)\b/i;
    for (const l of range(781, 790)) if (l.lessonNo !== 784) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(perfect);
    expect(allEn(at(784)!)).toMatch(perfect);
    for (const l of range(781, 785)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\bhow often\b/i);
    for (const l of range(781, 797)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\bwhy don't (you|we)\b/i);
    for (const l of w27) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(people|person|someone|somebody|a friend|the man|the woman|the animal|an animal|the girl|the boy|a monkey|the monkey|a doctor|the doctor) (who|that)\b/i);
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行、L810 は スピード TPR", () => {
    if (w27.length === 0) return;
    for (const l of w27) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（fever・breathe）
    expect(w27.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([784, 802]);
    expect(at(810)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: AI 会話で 個人情報を きかない・けんこうの 数字は ただしく・くすりの りょうは 出さない", () => {
    if (w27.length === 0) return;
    for (const l of w27) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
    // 小学生の すいみんは 9〜12 じかん
    expect(allEn(at(807)!)).toMatch(/nine to twelve/i);
    for (const l of w27) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(pills?|\d+ ?mg|dose|dosage)\b/i);
  });

  it("物語: L781 で いずみの里へ → L784 で しんりょうじょ → L790 で アンケート → L800 で 800 かい → L803 で トト → L809・L810 で にじの架け橋へ", () => {
    if (w27.length === 0) return;
    expect(at(781)!.teacherScript + said(781)).toMatch(/Village of Springs/);
    expect(at(784)!.teacherScript + said(784)).toMatch(/Dr\. Fern/);
    expect(at(790)!.teacherScript + said(790)).toMatch(/survey/i);
    expect(at(800)!.teacherScript + said(800)).toMatch(/800|eight hundred/i);
    expect(at(803)!.teacherScript + said(803)).toMatch(/Toto/);
    expect(at(809)!.teacherScript + said(809) + at(810)!.teacherScript + said(810)).toMatch(/Rainbow Bridge/);
  });
});

describe("カリキュラム: ワールド28 の決まりごと（にじの架け橋・ステージ3 の 総まとめ）", () => {
  const w28 = LESSONS.filter((l) => l.world === 28);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en));
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (katakanaOf(w) ? "katakana" : loanOf(w) ? "loan" : rhythmOf(w) ? "rhythm" : link28Of(w) ? "link" : partsOf(w) ? "parts" : "?");

  it("ワールド28 は 811〜840 の 30 レッスン、ステージ3・A2+、学年の めやすは 中3", () => {
    if (w28.length === 0) return; // 未作成ならスキップ
    expect(w28.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 811 + i));
    for (const l of w28) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("中3");
      expect(l.stage, `L${l.lessonNo}`).toBe(3);
      expect(l.level, `L${l.lessonNo}`).toBe("A2+");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w28.length === 0) return;
    const titles = ["A Rainbow Bridge", "Same or Different?", "How About in Your Country?", "That's Interesting!", "Culture Comparison Chart", "It's a Kind of Rice Ball", "It's Used for Wrapping", "You Can See It in Spring", "Let Me Tell You About Japan", "Japan Guide Video",
      "I Think… Because…", "In My Opinion", "Do You Agree?", "Two Reasons", "Opinion Corner", "Video Call with a Pen Pal", "A Gift from Japan", "Stage 3 Review: Story and Mystery", "Stage 3 Review: Experiences", "Stage 3 Review: Explain and Advise",
      "My Journey So Far", "Things I Can Do Now", "A Speech About Friendship", "Rehearsal on the Bridge", "Friendship Festival", "Letters Across the Bridge", "Questions for the World", "My Japan Introduction", "Rainbow Bridge Review", "World 28 Grand Review"];
    expect(w28.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: カタカナ語 → 英語に なった 日本語 → リズム → 音の つながり → ことばの パーツ（各ブロックの 5回目と L835〜840 は ふりかえり）", () => {
    if (w28.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(811, 814, "katakana");
    rule(816, 819, "japanese-loan");
    rule(821, 824, "rhythm");
    rule(826, 829, "linking");
    rule(831, 834, "word-parts");
    for (const n of [815, 820, 825, 830, 835, 836, 837, 838, 839, 840]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド28 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w28) {
      for (const w of l.phonics.words) {
        const f = w28FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w28FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w28.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["energy", "hamburger", "allergy", "tsunami", "origami", "emoji"]));
    // カタカナ語の sounds は つよい はく
    for (const l of range(811, 814)) l.phonics.words.forEach((w, i) => expect(l.phonics.sounds[i], `L${l.lessonNo} ${w}`).toBe(katakanaOf(w)!.strong));
    // 音の つながりは 3しゅるい（ぼいんと つながる・おなじ おと・t / d ＋ you）が そろう
    expect(new Set(range(826, 829).flatMap((l) => l.phonics.words.map((w) => link28Of(w)!.kind)))).toEqual(new Set(["link", "same", "you"]));
    // ことばの パーツは 5つ（dis- un- -ful -ness -ment）が そろう
    expect(new Set(range(831, 834).flatMap((l) => l.phonics.focus))).toEqual(new Set(["dis-", "un-", "-ful", "-ness", "-ment"]));
    // ふりかえり L836〜840 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(836, 840)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["katakana", "loan", "rhythm", "link", "parts"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w28.length === 0) return;
    const want: Record<number, string> = {
      811: "This bridge connects many countries.", 812: "In Japan, we take off our shoes at home.", 813: "How about in your country?", 814: "That's interesting! We do it differently.", 815: "In both countries, people celebrate New Year.",
      816: "Onigiri is a kind of rice ball.", 817: "A furoshiki is used for wrapping things.", 818: "You can see cherry blossoms in spring.", 819: "Let me tell you about my town.", 820: "Welcome to Japan! Let me show you around.",
      821: "I think summer is the best season because we can swim in the sea.", 822: "In my opinion, school lunch is great.", 823: "Do you agree?", 824: "First, it's fun. Second, it's good for our health.",
      826: "It's nice to finally see you!", 827: "I've made this for you. It's a paper crane.", 829: "Have you ever made sushi?", 830: "It's made of paper. You should try it!",
      831: "I've traveled to many places.", 832: "I can make phone calls in English now.", 833: "Friends can be different, but we can learn from each other.", 834: "Speak clearly. Smile at the audience.",
      835: "Welcome to the friendship festival!", 837: "What do children in your country do for fun?", 838: "Japan has four seasons.", 840: "Our languages are different, but our hearts are the same.",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(825)).toMatch(/^I think .*First, .*Second, /);
    expect(core(828)).toMatch(/First, .*Suddenly, .*It must be /);
    expect(core(836)).toMatch(/^Dear friend, thank you for /);
    expect(core(839)).toMatch(/is a kind of .*I think .* because /);
    expect(ex(823, 823).join(" ")).toMatch(/I agree/);
    expect(ex(823, 823).join(" ")).toMatch(/I'm not sure/);
    expect(ex(829, 829).join(" ")).toMatch(/\bI've \w+ .*since /);
    expect(ex(838, 838).join(" ")).toMatch(/In my town, /);
  });

  it("文法の じゅんばん: is a kind of は L816 から、used for は L817 から、In my opinion は L822 から、Do you agree は L823 から。関係代名詞は 出さない", () => {
    if (w28.length === 0) return;
    for (const l of range(811, 815)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(is|it's) a kind of\b/i);
    for (const l of range(811, 816)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(is|are|it's) used for\b/i);
    for (const l of range(811, 821)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\bin my opinion\b/i);
    for (const l of range(811, 822)) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\bdo you agree\b/i);
    for (const l of w28) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(people|person|someone|somebody|a friend|friends|children|the man|the woman|the girl|the boy|a girl|a boy|something|the thing|a place|the place) (who|that) (is|are|was|were|has|have|lives?|likes?|loves?|makes?)\b/i);
  });

  it("ステージ3: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・150 語 以上で 短い 読みものを ふくむ、会話シーンは 5〜7 行（L826 の ビデオ通話は 8 行）、L840 は スピード TPR", () => {
    if (w28.length === 0) return;
    for (const l of w28) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.03);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(150);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{40,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(5);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(l.lessonNo === 826 ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    expect(at(826)!.conversation!.lines.length).toBe(8);
    // 日本語の ヒントが ある 回は 2回だけ（differently・opinion）
    expect(w28.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([814, 822]);
    expect(at(840)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: AI 会話で 個人情報を きかない", () => {
    if (w28.length === 0) return;
    for (const l of w28) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
  });

  it("物語: L811 で にじの架け橋へ → L812 で アイノ・アマラ・マテオ → L826 で レオと ビデオ通話 → L835 で フェスティバル → L839 で 灯台の ひかり → L840 で ステージ3 の フィナーレ", () => {
    if (w28.length === 0) return;
    expect(at(811)!.teacherScript + said(811)).toMatch(/Rainbow Bridge/);
    expect(at(811)!.teacherScript + said(811)).toMatch(/Iris/);
    for (const name of ["Aino", "Amara", "Mateo"]) expect(at(812)!.teacherScript + said(812), name).toMatch(new RegExp(name));
    expect(at(826)!.teacherScript + said(826)).toMatch(/Leo/);
    expect(at(835)!.teacherScript + said(835)).toMatch(/festival/i);
    expect(at(839)!.teacherScript + said(839)).toMatch(/lighthouse/i);
    expect(at(840)!.teacherScript + said(840)).toMatch(/Lighthouse of Ideas/);
    expect(at(840)!.teacherScript + said(840)).toMatch(/Stage 3/);
  });
});

describe("カリキュラム: ワールド29 の決まりごと（かんがえる灯台・ステージ4 の はじまり）", () => {
  const w29 = LESSONS.filter((l) => l.world === 29);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  const ex = (a: number, b: number) => range(a, b).flatMap((l) => l.school.expressions.map((e) => e.en));
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (spectOf(w) ? "spect" : dictOf(w) ? "dict" : emphasisOf(w) ? "emphasis" : weakOf(w) ? "weak" : ibleOf(w) ? "ible" : "?");

  it("ワールド29 は 841〜870 の 30 レッスン、ステージ4・B1、学年の めやすは 高校初級", () => {
    if (w29.length === 0) return; // 未作成ならスキップ
    expect(w29.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 841 + i));
    for (const l of w29) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校初級");
      expect(l.stage, `L${l.lessonNo}`).toBe(4);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w29.length === 0) return;
    const titles = ["The Lighthouse of Ideas", "I Think So Because…", "For Example", "Reasons Make It Strong", "The Light Gets Brighter", "I Agree with You", "I See Your Point, But…", "I'm Not Sure About That", "Partly Agree", "Agree or Disagree Game",
      "What Do You Think?", "Let's Hear from Everyone", "Taking Turns", "Let's Decide", "Class Meeting Role-Play", "What Do You Mean?", "So You Mean…", "Could You Give an Example?", "Good Question!", "Interview with Follow-Ups",
      "Fact or Opinion?", "It's Just My Opinion", "Is That True?", "Ads and Opinions", "Fact Check Team", "Mini Discussion: Homework", "Mini Discussion: Pets at School", "My Opinion Paragraph", "Lighthouse of Ideas Review", "World 29 Grand Review"];
    expect(w29.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: spect → dict → 意見の 強勢 → 弱形 → -ible / -able（各ブロックの 5回目と L866〜870 は ふりかえり）", () => {
    if (w29.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(841, 844, "root-spect");
    rule(846, 849, "root-dict");
    rule(851, 854, "emphasis");
    rule(856, 859, "weak-form");
    rule(861, 864, "ible-able");
    for (const n of [845, 850, 855, 860, 865, 866, 867, 868, 869, 870]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド29 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w29) {
      for (const w of l.phonics.words) {
        const f = w29FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w29FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w29.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["respect", "inspect", "spectator", "predict", "dictionary", "contradict", "I really think so", "possible", "reasonable"]));
    // 強勢の sounds は つよく いう ことばの 大文字
    for (const l of range(851, 854)) l.phonics.words.forEach((w, i) => expect(l.phonics.sounds[i], `L${l.lessonNo} ${w}`).toBe(emphasisOf(w)!.strong.toUpperCase()));
    // 弱形は can・to・for・and の 4つ
    expect(range(856, 859).map((l) => l.phonics.focus)).toEqual([["can"], ["to"], ["for"], ["and"]]);
    // -ible と -able は どの 回も 2つずつ
    for (const l of range(861, 864)) expect(l.phonics.words.map((w) => ibleOf(w)!.kind).sort(), `L${l.lessonNo}`).toEqual(["able", "able", "ible", "ible"]);
    // ふりかえり L866〜870 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(866, 870)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["spect", "dict", "emphasis", "weak", "ible"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w29.length === 0) return;
    const want: Record<number, string> = {
      841: "This light shines when people share ideas.", 842: "I think dogs are great pets because they're loyal.", 843: "For example, my dog waits for me every day.", 846: "I agree with you. Reading is fun.", 847: "I see your point, but I think the beach is more fun.",
      848: "I'm not sure about that.", 849: "I partly agree. Summer is fun, but it's too hot.", 851: "What do you think, Kiko?", 852: "Let's hear from everyone.", 853: "Can I say something?", 854: "Let's vote. Most people chose the park.",
      856: 'What do you mean by "cool"?', 857: "So you mean we should start early?", 858: "Could you give me an example?", 859: "That's a good question. Let me think.", 860: "Why do you think so? Can you tell me more?",
      861: '"Cats sleep a lot" is a fact.', 863: "Is that true? Where did you read that?", 864: '"This is the best toy ever!" Is it a fact?', 865: "That's a fact. We checked it in a book.",
      866: "Should we have homework on weekends?", 867: "Should our school have a class pet?", 870: "Sharing ideas makes the light brighter!",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(844)).toMatch(/^One reason is .*Another reason is /);
    expect(core(845)).toMatch(/^I think .*One reason is .*For example, /);
    expect(core(850)).toMatch(/^I disagree because /);
    expect(core(855)).toMatch(/^Today's topic is .*What do you think\?$/);
    expect(core(862)).toMatch(/^It's just my opinion, but /);
    expect(core(868)).toMatch(/^I think .*First, .*Second, .*So, /);
    expect(core(869)).toMatch(/^I see your point, but /);
    expect(ex(853, 853).join(" ")).toMatch(/Sure, go ahead\./);
    expect(ex(869, 869).join(" ")).toMatch(/So you mean /);
  });

  it("文法の じゅんばん: For example は L843 から、One reason is は L844 から、agree with は L846 から … 関係代名詞は 出さない", () => {
    if (w29.length === 0) return;
    const from: [RegExp, number][] = [
      [/\bfor example\b/i, 843], [/\b(one|another) reason is\b/i, 844], [/\bagree with\b/i, 846], [/\bI see your point\b/i, 847], [/\bnot sure about that\b/i, 848],
      [/\bpartly agree\b/i, 849], [/\bI disagree\b/i, 850], [/\blet's hear from\b/i, 852], [/\bgo ahead\b/i, 853], [/\blet's vote\b/i, 854], [/\bwhat do you mean\b/i, 856],
      [/\bso you mean\b/i, 857], [/\bgive me an example\b/i, 858], [/\blet me think\b/i, 859], [/\b(that's a fact|is a fact|is an opinion|fact or opinion)\b/i, 861],
      [/\bjust my opinion\b/i, 862], [/\bwhere did you read that\b/i, 863],
    ];
    for (const [re, n] of from) for (const l of range(841, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
    for (const l of w29) expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(people|person|someone|somebody|a friend|friends|children|animals|the man|the woman|the girl|the boy|a girl|a boy|something|the thing|a place|the place|the book|a book) (who|that|which) (is|are|was|were|has|have|lives?|likes?|loves?|makes?|helps?)\b/i);
  });

  it("ステージ4: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・200 語 以上で 読みものを ふくむ、会話シーンは 6〜7 行（L860 の インタビューは 8 行まで）、L870 は スピード TPR", () => {
    if (w29.length === 0) return;
    for (const l of w29) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(200);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{200,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(6);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(l.lessonNo === 860 ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（loyal・fact）
    expect(w29.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([842, 861]);
    expect(at(870)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: AI 会話で 個人情報を きかない", () => {
    if (w29.length === 0) return;
    for (const l of w29) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
  });

  it("物語: L841 で 灯台と ペル船長 → L847 で カモメの ガスと ゲイル → L861 で パフィンの ピップの 新聞 → 6つの レンズ → L870 で みらい都市へ", () => {
    if (w29.length === 0) return;
    expect(at(841)!.teacherScript + said(841)).toMatch(/Lighthouse of Ideas/);
    expect(at(841)!.teacherScript + said(841)).toMatch(/Captain Pell/);
    expect(at(843)!.teacherScript + said(843)).toMatch(/Anchor/);
    expect(at(847)!.teacherScript + said(847)).toMatch(/Gus/);
    expect(at(847)!.teacherScript + said(847)).toMatch(/Gale/);
    expect(at(861)!.teacherScript + said(861)).toMatch(/Pip/);
    for (const n of [845, 850, 855, 860, 865, 870]) expect(at(n)!.teacherScript + said(n), `L${n}`).toMatch(/lens/i);
    expect(at(870)!.teacherScript + said(870)).toMatch(/City of Tomorrow/);
  });
});

describe("カリキュラム: ワールド30 の決まりごと（みらい都市）", () => {
  const w30 = LESSONS.filter((l) => l.world === 30);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  /** 台本の フォニックスの ところ（Now, phonics. から あと）を のぞいた 英語 */
  const allEnNoPhonics = (l: (typeof LESSONS)[number]) => allEn(l).replace(l.teacherScript, l.teacherScript.split("Now, phonics.")[0]);
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (autoOf(w) ? "auto" : transOf(w) ? "trans" : icOf(w) ? "ic" : abbrOf(w) ? "abbr" : casualOf(w) ? "casual" : "?");

  it("ワールド30 は 871〜900 の 30 レッスン、ステージ4・B1、学年の めやすは 高校初級", () => {
    if (w30.length === 0) return; // 未作成ならスキップ
    expect(w30.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 871 + i));
    for (const l of w30) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校初級");
      expect(l.stage, `L${l.lessonNo}`).toBe(4);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w30.length === 0) return;
    const titles = ["Welcome to the City of Tomorrow", "A Robot That Cleans", "A Bus That Drives Itself", "The Building Which Makes Energy", "City Tour Guide", "A Person Who Designs Games", "People Who Help Others", "The Girl Who Invented It", "Who Am I?", "Future Jobs",
      "What's the Problem?", "An Idea That Helps", "How Does It Work?", "Test and Improve", "Invention Pitch", "Good Points and Problems", "Screens Everywhere", "Safe and Smart Online", "AI Helpers", "Technology Talk",
      "In 2050…", "Schools in the Future", "Homes in the Future", "If We Use Clean Energy", "Future City Plan", "Gonna, Wanna", "Reading a Tech Article", "My Invention Proposal", "City of Tomorrow Review", "World 30 Grand Review"];
    expect(w30.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: auto- → trans- → -ic の 強勢 → 略語 → 話しことば（各ブロックの 5回目と L896〜900 は ふりかえり）", () => {
    if (w30.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(871, 874, "prefix-auto");
    rule(876, 879, "prefix-trans");
    rule(881, 884, "ic-stress");
    rule(886, 889, "abbreviation");
    rule(891, 894, "casual-speech");
    for (const n of [875, 880, 885, 890, 895, 896, 897, 898, 899, 900]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド30 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w30) {
      for (const w of l.phonics.words) {
        const f = w30FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w30FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w30.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["automatic", "autograph", "transport", "transform", "electric", "robotic", "AI", "km", "USB", "3D", "I'm gonna try it", "I wanna see the robot"]));
    // 略語は 1もじずつ・ことば・たんい・かず の 4しゅるいが そろう
    expect(new Set(all.map((w) => abbrOf(w)?.kind).filter(Boolean))).toEqual(new Set(["letters", "word", "unit", "number"]));
    // 話しことばは 8つの かたち（gonna・wanna・gotta・kinda・lemme・gimme・dunno・outta）
    expect(range(891, 894).flatMap((l) => l.phonics.focus)).toEqual(["gonna", "wanna", "gotta", "kinda", "lemme", "gimme", "dunno", "outta"]);
    // ふりかえり L896〜900 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(896, 900)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["auto", "trans", "ic", "abbr", "casual"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w30.length === 0) return;
    const want: Record<number, string> = {
      871: "Cars fly and robots work here.", 872: "This is a robot that cleans the streets.", 873: "We're riding a bus that drives itself.", 874: "That building makes its own energy.", 875: "This is a park that has solar trees.",
      876: "She's a person who designs games.", 877: "Doctors are people who help sick people.", 878: "This is the girl who invented the robot dog.", 879: "I'm a person who works at night and keeps you safe.",
      881: "The problem is that older people can't carry heavy bags.", 882: "My idea is a bag that follows you.", 883: "It uses sensors to find you.", 884: "It didn't work well, so we changed the design.",
      887: "Screens are useful, but we need breaks.", 888: "Think before you post.", 889: "AI can help us, but we should check the answers.",
      891: "In 2050, people will probably live longer.", 892: "Students might learn at home with robots.", 893: "My future home will have a garden on the roof.", 894: "If we use clean energy, the air will be cleaner.",
      896: '"I\'m gonna try it!" means "I\'m going to try it."', 900: "The future is something that we create together.",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(880)).toMatch(/^In the future, there will be people who /);
    expect(core(885)).toMatch(/^This is an invention that helps /);
    expect(core(886)).toMatch(/^One good point is .*One problem is /);
    expect(core(890)).toMatch(/^I think technology is helpful because .*However, /);
    expect(core(895)).toMatch(/^In our future city, there will be /);
    expect(core(897)).toMatch(/^This article is about a robot that /);
    expect(core(898)).toMatch(/^My invention is an? .* that .*It will help /);
    expect(core(899)).toMatch(/ that .*One good point is /);
    expect(at(874)!.school.expressions.map((e) => e.en).join(" ")).toMatch(/\bwhich\b/);
  });

  it("文法の じゅんばん: 関係代名詞 that は L872、which は L874、who は L876 から … 話しことばは L891 から（L895 までは フォニックスの ところだけ）", () => {
    if (w30.length === 0) return;
    const from: [RegExp, number][] = [
      [/\b(robots?|bus|buses|cars?|building|park|bags?|machines?|city|trees?|things?|something|invention|app|pencil|place|tower|lights?) (that|which) (is|are|was|were|has|have|[a-z]+s)\b/i, 872],
      [/\bwhich\b/i, 874], [/\b(person|people|girl|boy|someone|man|woman|fox|tortoise|kids?|children) who\b/i, 876], [/\bone good point is\b/i, 886], [/\bone problem is\b/i, 886],
      [/\bHowever,/, 890], [/\bwill probably\b/, 891], [/\bif we use\b/i, 894], [/\bthink before you post\b/i, 888], [/\b(gonna|wanna|gotta|kinda|lemme|gimme|dunno|outta)\b/i, 891],
    ];
    for (const [re, n] of from) for (const l of range(871, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
    for (const l of range(891, 895)) expect(allEnNoPhonics(l), `L${l.lessonNo}`).not.toMatch(/\b(gonna|wanna|gotta|kinda|lemme|gimme|dunno|outta)\b/i);
  });

  it("ステージ4: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・200 語 以上で 読みものを ふくむ、会話シーンは 6〜7 行（L885・L900 は 8 行まで）、L900 は スピード TPR", () => {
    if (w30.length === 0) return;
    for (const l of w30) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(200);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{200,}"/);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(6);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual([885, 900].includes(l.lessonNo) ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（関係代名詞の that・post）
    expect(w30.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([872, 888]);
    expect(at(900)!.tpr.some((t) => t.en.includes("Look! Stop! Come here! Go!"))).toBe(true);
  });

  it("あんぜん: AI 会話で 個人情報を きかない。ネットの 回は 住所・学校名を 出さない ことを 教える", () => {
    if (w30.length === 0) return;
    for (const l of w30) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
    expect(at(888)!.teacherScript).toMatch(/address/i);
    expect(at(889)!.teacherScript + said(889)).toMatch(/check/i);
  });

  it("物語: L871 で みらい都市と ノバ → L878 で テスと スプロケット → L881 で シェルさん → 6つの バッジ → L900 で ときの回廊へ", () => {
    if (w30.length === 0) return;
    expect(at(871)!.teacherScript + said(871)).toMatch(/City of Tomorrow/);
    expect(at(871)!.teacherScript + said(871)).toMatch(/Nova/);
    expect(at(878)!.teacherScript + said(878)).toMatch(/Tess/);
    expect(at(878)!.teacherScript + said(878)).toMatch(/Sprocket/);
    expect(at(881)!.teacherScript + said(881)).toMatch(/Mr\. Shell/);
    for (const n of [875, 880, 885, 890, 895, 900]) expect(at(n)!.teacherScript + said(n), `L${n}`).toMatch(/badge/i);
    expect(at(900)!.teacherScript + said(900)).toMatch(/Corridor of Time/);
  });
});

describe("カリキュラム: ワールド31 の決まりごと（ときの回廊）", () => {
  const w31 = LESSONS.filter((l) => l.world === 31);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (familyOf31(w) ? "family" : yearOf(w) ? "year" : structOf(w) ? "struct" : personOf31(w) ? "person" : portOf(w) ? "port" : "?");

  it("ワールド31 は 901〜930 の 30 レッスン、ステージ4・B1、学年の めやすは 高校初級", () => {
    if (w31.length === 0) return; // 未作成ならスキップ
    expect(w31.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 901 + i));
    for (const l of w31) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校初級");
      expect(l.stage, `L${l.lessonNo}`).toBe(4);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w31.length === 0) return;
    const titles = ["The Corridor of Time", "People Used to Walk", "There Were No Phones", "Old Toys, New Toys", "Then and Now", "It Was Built in 1600", "It Was Invented by…", "It Was Found Under the Sea", "Who Was It Made By?", "History Museum Guide",
      "She Was Born in a Small Village", "When She Was Ten", "She Became a Scientist", "She Never Gave Up", "A Life in Five Sentences", "Timeline Talk", "It Had Already Started", "Before and After", "What If?", "Our Town's Timeline",
      "People Who Changed the World", "I Respect Her Because…", "Everyday Heroes", "Interview a Historical Figure", "Hero Presentation", "A Biography to Read", "History Quiz Show", "My Hero Report", "Corridor of Time Review", "World 31 Grand Review"];
    expect(w31.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: 動詞と 名詞の 家族 → 年号 → struct → -ian / -ist → port（各ブロックの 5回目と L926〜930 は ふりかえり）", () => {
    if (w31.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(901, 904, "word-family");
    rule(906, 909, "year-reading");
    rule(911, 914, "root-struct");
    rule(916, 919, "person-ian-ist");
    rule(921, 924, "root-port");
    for (const n of [905, 910, 915, 920, 925, 926, 927, 928, 929, 930]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド31 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w31) {
      for (const w of l.phonics.words) {
        const f = w31FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w31FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w31.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["invention", "exploration", "1868", "the 1990s", "construct", "structure", "historian", "scientist", "export", "import"]));
    // 家族は -tion・-ation・-ment・-al・-y、年号は 4つ・oh・thousand・年代・世紀の 5しゅるいが そろう
    expect(new Set(range(901, 904).flatMap((l) => l.phonics.focus))).toEqual(new Set(["-tion", "-ation", "-ment", "-al", "-y"]));
    expect(new Set(all.map((w) => yearOf(w)?.kind).filter(Boolean))).toEqual(new Set(["year", "oh", "thousand", "decade", "century"]));
    // ふりかえり L926〜930 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(926, 930)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["family", "year", "struct", "person", "port"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w31.length === 0) return;
    const want: Record<number, string> = {
      901: "Each door opens to a different time.", 902: "People used to walk to faraway towns.", 903: "There were no phones, so people wrote letters.", 904: "Children used to play with wooden toys.",
      906: "This castle was built about 400 years ago.", 907: "The light bulb was improved by many inventors.", 908: "This old ship was found under the sea.", 909: "This pot was made by people long ago.", 910: "This was used for cooking about 5,000 years ago.",
      911: "She was born in a small village.", 912: "When she was ten, she loved looking at stars.", 913: "She studied hard and became a scientist.", 914: "Many people said no, but she never gave up.",
      917: "When we arrived, the show had already started.", 918: "Before the train was built, the trip took ten days.", 919: "What if there were no electricity?", 920: "Our town had a big festival in 1950.",
      921: "Some people changed the world with ideas.", 922: "I respect her because she helped many children.", 923: "My grandpa is my hero. He worked hard for our family.",
      925: "I'd like to talk about my hero.", 926: "Read the biography. What was her biggest challenge?", 927: "When was the first airplane flight?", 930: "History is the story of people like us.",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(905)).toMatch(/^People used to .*, but now they /);
    expect(core(915)).toMatch(/^She was born .*She became .*She is famous for /);
    expect(core(916)).toMatch(/^First, .* in \d{4}\. Then, .* in \d{4}\.$/);
    expect(core(924)).toMatch(/^When did you .*\? Why did you .*\?$/);
    expect(core(928)).toMatch(/^My hero is .*was born in \d{4}\..*I respect .* because /);
    expect(core(929)).toMatch(/used to .*was built/);
  });

  it("文法の じゅんばん: used to は L902、過去の 受け身は L906、was born は L911、過去完了は L917、What if は L919、I respect は L922、I'd like to talk about は L925 から", () => {
    if (w31.length === 0) return;
    const from: [RegExp, number][] = [
      [/\bused to\b/i, 902],
      [/\b(was|were) (built|invented|made|found|discovered|improved|used|painted|written|created)\b/i, 906],
      [/\b(was|were) born\b/i, 911],
      [/\bhad (already|started|finished|left|gone|begun|closed)\b/i, 917],
      [/\bwhat if\b/i, 919],
      [/\bI respect\b/i, 922],
      [/\bI'd like to talk about\b/i, 925],
    ];
    for (const [re, n] of from) {
      for (const l of range(901, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
      expect(allEn(at(n)!), `L${n} ${re}`).toMatch(re);
    }
  });

  it("ステージ4: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・200 語 以上で 読みものを ふくむ、会話シーンは 6〜7 行（L925・L930 は 8 行まで）、L930 は スピード TPR", () => {
    if (w31.length === 0) return;
    for (const l of w31) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(200);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{200,}"/);
      expect(s.split("Now, phonics.").length, `L${l.lessonNo}`).toBe(2);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(6);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual([925, 930].includes(l.lessonNo) ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（used to・was built）
    expect(w31.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([902, 906]);
    expect(at(930)!.tpr[0].en).toBe("Look! Stop! Come here! Go!");
  });

  it("あんぜん: AI 会話で 個人情報を きかない。まち・ヒーローの 回は ほんとうの なまえを いわなくて よいと goalJa に 明記", () => {
    if (w31.length === 0) return;
    for (const l of w31) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
    for (const n of [920, 923, 925, 928]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/ほんとうの/);
  });

  it("物語: L901 で ときの回廊と オールド・トック → L911 で ステラ・モス（つくった おはなしと ことわる）→ L916 で ニブ先生 → 6つの ギア → L930 で たいようの砂漠へ", () => {
    if (w31.length === 0) return;
    expect(at(901)!.teacherScript + said(901)).toMatch(/Corridor of Time/);
    expect(at(901)!.teacherScript + said(901)).toMatch(/Old Tock/);
    expect(at(911)!.teacherScript + said(911)).toMatch(/Stella Moss/);
    expect(at(911)!.teacherScript).toMatch(/made up/i);
    expect(at(916)!.teacherScript + said(916)).toMatch(/Professor Nib/);
    for (const n of [905, 910, 915, 920, 925, 930]) expect(at(n)!.teacherScript + said(n), `L${n}`).toMatch(/gear/i);
    expect(at(930)!.teacherScript + said(930)).toMatch(/Desert of the Sun/);
  });
});

describe("カリキュラム: ワールド32 の決まりごと（たいようの砂漠）", () => {
  const w32 = LESSONS.filter((l) => l.world === 32);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (geoOf(w) ? "geo" : alOf(w) ? "al" : directionOf(w) ? "direction" : numberOf(w) ? "number" : dataOf(w) ? "data" : "?");

  it("ワールド32 は 931〜960 の 30 レッスン、ステージ4・B1、学年の めやすは 高校初級", () => {
    if (w32.length === 0) return; // 未作成ならスキップ
    expect(w32.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 931 + i));
    for (const l of w32) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校初級");
      expect(l.stage, `L${l.lessonNo}`).toBe(4);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w32.length === 0) return;
    const titles = ["The Desert of the Sun", "Hot Days, Cold Nights", "Sand, Rocks and Oases", "Climates Around the World", "Climate Report", "Camels Are Amazing", "So That They Can Survive", "Cactus Secrets", "Animals in Cold Places", "Adaptation Fair",
      "North, South, East, West", "It's Located in the North", "Continents and Oceans", "Where in the World?", "Map Guide", "The Graph Shows…", "It Increased", "Twice as Many", "Half, a Quarter, Thirty Percent", "Graph Presentation",
      "Water Is Precious", "Because of the Heat", "As a Result", "How Much Water Do We Use?", "Save Water Campaign", "A Desert Story", "Geography Quiz Rally", "My Graph Report", "Desert of the Sun Review", "World 32 Grand Review"];
    expect(w32.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: geo → -al → 方角 → 数の 読みかた → データの つづり（各ブロックの 5回目と L956〜960 は ふりかえり）", () => {
    if (w32.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(931, 934, "root-geo");
    rule(936, 939, "suffix-al");
    rule(941, 944, "direction-words");
    rule(946, 949, "number-reading");
    rule(951, 954, "data-spelling");
    for (const n of [935, 940, 945, 950, 955, 956, 957, 958, 959, 960]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド32 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w32) {
      for (const w of l.phonics.words) {
        const f = w32FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w32FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w32.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["geography", "geology", "tropical", "natural", "national", "northern", "southeast", "1/2", "1/4", "30%", "increase", "decrease", "average"]));
    // 方角は -ern・-east・-west・-ward、数は 6 しゅるい、つづりは -age・-ure・-ease・-ount が そろう
    expect(new Set(range(941, 944).flatMap((l) => l.phonics.focus))).toEqual(new Set(["-ern", "-east", "-west", "-ward"]));
    expect(new Set(all.map((w) => numberOf(w)?.kind).filter(Boolean))).toEqual(new Set(["hundred", "thousand", "million", "fraction", "percent", "decimal"]));
    expect(new Set(range(951, 954).flatMap((l) => l.phonics.focus))).toEqual(new Set(["-age", "-ure", "-ease", "-ount"]));
    // ふりかえり L956〜960 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(956, 960)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["geo", "al", "direction", "number", "data"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w32.length === 0) return;
    const want: Record<number, string> = {
      931: "It hardly ever rains here.", 932: "It's very hot during the day, but cold at night.", 933: "An oasis is a place where water comes out.", 934: "Some places are rainy all year.",
      936: "Camels can go many days without water.", 937: "Desert foxes have big ears so that they can stay cool.", 938: "A cactus stores water in its thick stem.", 939: "Penguins have thick feathers to keep warm.",
      941: "The oasis is to the east of the camp.", 942: "The mountains are located in the north.", 943: "There are seven continents.", 944: "It's a country in South America.", 945: "Go north for two kilometers. You'll see the well.",
      946: "The graph shows the temperature in July.", 947: "The number of visitors increased.", 948: "There are twice as many camels as horses.", 949: "About thirty percent of the land is desert.",
      951: "Water is precious in the desert.", 952: "Because of the heat, the lake became smaller.", 954: "We use about 200 liters of water a day.",
      956: "Read the story of a girl who found water.", 957: "Which is the largest desert?", 960: "Every place on Earth has its own amazing story.",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(935)).toMatch(/located in .*\. It's hot and dry\.$/);
    expect(core(940)).toMatch(/^This animal has .* so that it can /);
    expect(core(950)).toMatch(/^This graph shows .*\. As you can see, /);
    expect(core(953)).toMatch(/^People planted trees\. As a result, /);
    expect(core(955)).toMatch(/^We can save water by [a-z]+ing /);
    expect(core(958)).toMatch(/^The graph shows .*\. It increased from \d+ to \d+\.$/);
    expect(core(959)).toMatch(/so that .*The graph shows /);
  });

  it("文法の じゅんばん: hardly ever は L931、located は L935、so that は L937、in order to は L939、The graph shows は L946、increased は L947、twice as は L948、percent は L949、because of は L952、As a result は L953 から", () => {
    if (w32.length === 0) return;
    const from: [RegExp, number][] = [
      [/\bhardly ever\b/i, 931],
      [/\blocated\b/i, 935],
      [/\bso that\b/i, 937],
      [/\bin order to\b/i, 939],
      [/\bthe (graph|chart) shows\b/i, 946],
      [/\b(increased|decreased)\b/i, 947],
      [/\btwice as\b/i, 948],
      [/\bpercent\b/i, 949],
      [/\bbecause of\b/i, 952],
      [/\bas a result\b/i, 953],
    ];
    for (const [re, n] of from) {
      for (const l of range(931, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
      expect(allEn(at(n)!), `L${n} ${re}`).toMatch(re);
    }
  });

  it("ステージ4: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・200 語 以上で 読みものを ふくむ、会話シーンは 6〜7 行（L950・L960 は 8 行まで）、L960 は スピード TPR", () => {
    if (w32.length === 0) return;
    for (const l of w32) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(200);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{200,}"/);
      expect(s.split("Now, phonics.").length, `L${l.lessonNo}`).toBe(2);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(6);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual([950, 960].includes(l.lessonNo) ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（hardly ever・so that）
    expect(w32.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([931, 937]);
    expect(at(960)!.tpr[0].en).toBe("Look! Stop! Come here! Go!");
  });

  it("あんぜん: AI 会話で 個人情報を きかない。国あて・水の つかいかた・グラフの 回は ほんとうの なまえや すんで いる ところを いわなくて よいと goalJa に 明記", () => {
    if (w32.length === 0) return;
    for (const l of w32) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
    for (const n of [944, 954, 958]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/ほんとうの/);
  });

  it("物語: L931 で たいようの砂漠・フェンと サン・コンパス → L936 で ハンフリー → L946 で ミラ博士 → 6つの クリスタル → L956 は つくった おはなし → L960 で ほのおの火山島へ", () => {
    if (w32.length === 0) return;
    expect(at(931)!.teacherScript + said(931)).toMatch(/Desert of the Sun/);
    expect(at(931)!.teacherScript + said(931)).toMatch(/Sun Compass/);
    expect(at(931)!.teacherScript + said(931)).toMatch(/\bFen\b/);
    expect(at(936)!.teacherScript + said(936)).toMatch(/Humphrey/);
    expect(at(946)!.teacherScript + said(946)).toMatch(/Dr\. Mira/);
    expect(at(956)!.teacherScript).toMatch(/made[ -]up/i);
    for (const n of [935, 940, 945, 950, 955, 960]) expect(at(n)!.teacherScript + said(n), `L${n}`).toMatch(/crystal/i);
    expect(at(960)!.teacherScript + said(960)).toMatch(/Island of Fire/);
  });
});

describe("カリキュラム: ワールド33 の決まりごと（ほのおの火山島）", () => {
  const w33 = LESSONS.filter((l) => l.world === 33);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (ruptOf(w) ? "rupt" : nounEndOf(w) ? "noun" : proofOf(w) ? "proof" : listOf(w) ? "list" : jectOf(w) ? "ject" : "?");

  it("ワールド33 は 961〜990 の 30 レッスン、ステージ4・B1、学年の めやすは 高校初級", () => {
    if (w33.length === 0) return; // 未作成ならスキップ
    expect(w33.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 961 + i));
    for (const l of w33) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校初級");
      expect(l.stage, `L${l.lessonNo}`).toBe(4);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w33.length === 0) return;
    const titles = ["The Island of Fire", "Inside the Earth", "When a Volcano Erupts", "Hot Springs and Islands", "Earth Science Show", "Why Do Earthquakes Happen?", "Typhoons and Heavy Rain", "Tsunami Warnings", "Listen to the Announcement", "Disaster Science Quiz",
      "Our Emergency Kit", "Make Sure You…", "A Family Meeting Place", "Waterproof and Fireproof", "My Family Safety Plan", "Drop, Cover, Hold On", "Stay Calm", "As Soon As the Shaking Stops", "Unless It's Safe", "Evacuation Drill",
      "Helping Each Other", "Kind Words for Neighbors", "Helping People Who Don't Speak Japanese", "Rebuilding Together", "Helper Role-Play", "A Safety Poster", "Reading Safety Instructions", "My Safety Promise", "Island of Fire Review", "World 33 Grand Review"];
    expect(w33.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: rupt → 名詞の おわり → -proof → リストの 読みかた → ject（各ブロックの 5回目と L986〜990 は ふりかえり）", () => {
    if (w33.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(961, 964, "root-rupt");
    rule(966, 969, "noun-ending");
    rule(971, 974, "compound-proof");
    rule(976, 979, "list-intonation");
    rule(981, 984, "root-ject");
    for (const n of [965, 970, 975, 980, 985, 986, 987, 988, 989, 990]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド33 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w33) {
      for (const w of l.phonics.words) {
        const f = w33FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w33FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w33.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["erupt", "interrupt", "emergency", "distance", "safety", "waterproof", "fireproof", "We need water, food, and a flashlight", "project", "inject", "object"]));
    // 名詞の おわりは -ance・-ence・-ency・-ty、リストは ならべる 文と どっち？の 文が そろう
    expect(new Set(range(966, 969).flatMap((l) => l.phonics.focus))).toEqual(new Set(["-ance", "-ence", "-ency", "-ty"]));
    expect(new Set(range(976, 979).flatMap((l) => l.phonics.focus))).toEqual(new Set(["and", "or"]));
    // ふりかえり L986〜990 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(986, 990)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["rupt", "noun", "proof", "list", "ject"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w33.length === 0) return;
    const want: Record<number, string> = {
      961: "That mountain is a volcano.", 962: "The earth is made of layers.", 963: "When a volcano erupts, hot lava comes out.", 964: "Volcanoes make hot springs and new islands.", 965: "The earth's crust moves slowly.",
      966: "An earthquake happens when the ground moves.", 967: "A typhoon brings strong wind and heavy rain.", 968: "If you hear a warning, go to high ground.", 970: "What should you do during a typhoon?",
      971: "An emergency kit has water, food, and a flashlight.", 972: "Make sure you know where the exits are.", 973: "Our family meeting place is the park.", 974: "Keep your papers in a waterproof bag.",
      976: "Get under a desk and hold on.", 977: "Stay calm. Follow your teacher.", 978: "As soon as the shaking stops, go outside carefully.", 979: "Don't go back inside unless an adult says it's safe.",
      982: "Are you OK? Do you need anything?", 983: "This way, please. The shelter is over there.", 984: "Many houses were rebuilt by volunteers.", 985: "Don't worry. I'll show you the way.",
      986: "Be ready! Know your exits!", 987: "Read the instructions. What should you do first?", 988: "I promise to check my emergency kit every month.", 990: "Know it, prepare for it, and help each other.",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(969)).toMatch(/^The announcement said to /);
    expect(core(975)).toMatch(/^If there's .*, we will .*\. Our meeting place is /);
    expect(core(980)).toMatch(/^First, .*\. As soon as .*, /);
    expect(core(981)).toMatch(/^How can we help\? We can /);
    expect(core(989)).toMatch(/^When .*\. If .*, .*\. Make sure /);
  });

  it("文法の じゅんばん: make sure は L972、hold on は L976、stay calm は L977、as soon as は L978、unless は L979、How can we help は L981、rebuilt は L984 から", () => {
    if (w33.length === 0) return;
    const from: [RegExp, number][] = [
      [/\bmake sure\b/i, 972],
      [/\bhold on\b/i, 976],
      [/\bstay calm\b/i, 977],
      [/\bas soon as\b/i, 978],
      [/\bunless\b/i, 979],
      [/\bhow can we help\b/i, 981],
      [/\brebuilt\b/i, 984],
    ];
    for (const [re, n] of from) {
      for (const l of range(961, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
      expect(allEn(at(n)!), `L${n} ${re}`).toMatch(re);
    }
  });

  it("ステージ4: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・200 語 以上で 読みものを ふくむ、会話シーンは 6〜7 行（L980・L990 は 8 行まで）、L990 は スピード TPR", () => {
    if (w33.length === 0) return;
    for (const l of w33) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(200);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{200,}"/);
      expect(s.split("Now, phonics.").length, `L${l.lessonNo}`).toBe(2);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(6);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual([980, 990].includes(l.lessonNo) ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（make sure・unless）
    expect(w33.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([972, 979]);
    expect(at(990)!.tpr[0].en).toBe("Look! Stop! Come here! Go!");
  });

  it("あんぜん: AI 会話で 個人情報を きかない。家の チェック・集合場所・防災計画・約束の 回は ほんとうの じゅうしょや ばしょを いわなくて よいと goalJa に 明記。こわがらせない・ひなんで エレベーターを つかわない", () => {
    if (w33.length === 0) return;
    for (const l of w33) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (name|address|school|age)|where do you live|how old are you/i);
    for (const n of [972, 973, 975, 988]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/ほんとうの/);
    for (const l of w33) {
      expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\b(died|dead|death|kill|killed|scream|screamed|terrifying|horrible)\b/i);
      expect(allEn(l), `L${l.lessonNo}`).not.toMatch(/\blet's (take|use) the elevator\b/i);
    }
  });

  it("物語: L961 で ほのおの火山島・エンバーと セーフティ・ランタン → L962 で モリ博士 → 6つの まど → L981 で トモおばあちゃん → L984 は つくった おはなし → L990 で つばさの空港へ", () => {
    if (w33.length === 0) return;
    const story = (n: number) => at(n)!.teacherScript + " " + said(n);
    expect(story(961)).toMatch(/Island of Fire/);
    expect(story(961)).toMatch(/\bEmber\b/);
    expect(story(961)).toMatch(/Safety Lantern/);
    expect(story(961)).toMatch(/Mount Cinder/);
    expect(story(962)).toMatch(/Dr\. Mori/);
    expect(story(981)).toMatch(/Grandma Tomo/);
    expect(at(984)!.teacherScript).toMatch(/made[ -]up/i);
    for (const n of [965, 970, 975, 980, 985, 990]) expect(story(n), `L${n}`).toMatch(/lantern/i);
    expect(story(990)).toMatch(/Airport of Wings/);
  });
});

describe("カリキュラム: ワールド34 の決まりごと（つばさの空港）", () => {
  const w34 = LESSONS.filter((l) => l.world === 34);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (travelNumberOf(w) ? "number" : visOf(w) ? "vis" : doubleOf(w) ? "double" : izeOf(w) ? "ize" : ukUsOf(w) ? "ukus" : "?");

  it("ワールド34 は 991〜1020 の 30 レッスン、ステージ4・B1、学年の めやすは 高校初級", () => {
    if (w34.length === 0) return; // 未作成ならスキップ
    expect(w34.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 991 + i));
    for (const l of w34) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校初級");
      expect(l.stage, `L${l.lessonNo}`).toBe(4);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w34.length === 0) return;
    const titles = ["The Airport of Wings", "Checking In", "Window or Aisle?", "Gate 23B", "At the Airport", "On the Plane", "The Purpose of Your Visit", "Transfer to Another Flight", "Changing Money", "Lesson 1000 Welcome!",
      "I Have a Reservation", "Would You Mind…?", "Do You Know Where…?", "Could You Recommend…?", "Hotel Role-Play", "My Suitcase Didn't Arrive", "I'm Afraid It's Broken", "Could You Change It Instead?", "I Lost My Passport", "Problem Solved!",
      "Exploring the City", "At the Restaurant", "Lift or Elevator?", "Museum Tickets", "A Day in the City", "An Email to the Hotel", "Travel Brochure", "My Travel Journal", "Airport of Wings Review", "World 34 Grand Review"];
    expect(w34.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: 空港の 数字 → vis → 2つ ならぶ 文字 → -ize → イギリスと アメリカ（各ブロックの 5回目と L1016〜1020 は ふりかえり）", () => {
    if (w34.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(991, 994, "travel-number");
    rule(996, 999, "root-vis");
    rule(1001, 1004, "double-letters");
    rule(1006, 1009, "suffix-ize");
    rule(1011, 1014, "uk-us");
    for (const n of [995, 1000, 1005, 1010, 1015, 1016, 1017, 1018, 1019, 1020]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド34 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w34) {
      for (const w of l.phonics.words) {
        const f = w34FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w34FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば（便名・ゲート・イギリスと アメリカ）
    const all = w34.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["Flight 205", "Gate 23B", "visit", "visa", "recommend", "apologize", "lift", "elevator", "holiday", "vacation", "colour"]));
    // 数字は 便名・時刻・座席・ゲートが そろう
    expect(new Set(range(991, 994).flatMap((l) => l.phonics.words).map((w) => travelNumberOf(w)!.kind))).toEqual(new Set(["flight", "time", "seat", "gate"]));
    // イギリスと アメリカは 両がわと つづりが そろう
    const uk = range(1011, 1014).flatMap((l) => l.phonics.words).map((w) => ukUsOf(w)!);
    expect(new Set(uk.map((u) => u.side))).toEqual(new Set(["UK", "US"]));
    expect(uk.some((u) => u.kind === "spelling")).toBe(true);
    // ふりかえり L1016〜1020 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(1016, 1020)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["number", "vis", "double", "ize", "ukus"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w34.length === 0) return;
    const want: Record<number, string> = {
      991: "Planes leave for every corner of the world.", 992: "I'd like to check in, please.", 993: "Would you like a window seat or an aisle seat?", 994: "Flight 205 is now boarding at gate 23B.",
      995: "Excuse me. Do you know where gate 23B is?", 996: "Could I have some water, please?", 999: "I'd like to change some yen, please.", 1000: "We've arrived! This is our 1,000th lesson!",
      1002: "Would you mind opening the window?", 1003: "Do you know where the nearest station is?", 1004: "Could you recommend a good restaurant?",
      1006: "My suitcase didn't arrive.", 1007: "I'm afraid the air conditioner is broken.", 1008: "Could you give us a different room instead?", 1009: "I lost my passport. What should I do?",
      1010: "Thank you for your help. That's very kind of you.", 1011: "Excuse me. Could you take our picture?", 1012: "Could we have the menu, please?", 1017: "Read the brochure. Which tour would you choose?",
      1020: "Traveling is the best way to learn!",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(997)).toMatch(/^What's the purpose of your visit\? Sightseeing\.$/);
    expect(core(998)).toMatch(/transfer/);
    expect(core(1001)).toMatch(/^I have a reservation under the name /);
    expect(core(1005)).toMatch(/^I'd like to .*\. Could you /);
    expect(core(1013)).toMatch(/^In the UK, people say lift\.$/);
    expect(core(1014)).toMatch(/discount\?$/);
    expect(core(1015)).toMatch(/^We visited .*\. Then, we /);
    expect(core(1016)).toMatch(/^I'm writing to ask about /);
    expect(core(1018)).toMatch(/^On the first day, .*\. The best part was /);
    expect(core(1019)).toMatch(/^Would you mind .*\? Do you know where .*\?$/);
  });

  it("文法の じゅんばん: Do you know where は L995、Would you mind は L1002、Could you tell me where は L1003、recommend は L1004、I'm afraid は L1007、instead は L1008、That's very kind of you は L1010、I'm writing to は L1016 から", () => {
    if (w34.length === 0) return;
    const from: [RegExp, number][] = [
      [/\bdo you know where\b/i, 995],
      [/\bwould you mind\b/i, 1002],
      [/\bcould you tell me (where|what|how|when|if)\b/i, 1003],
      [/\brecommend/i, 1004],
      [/\bI'm afraid\b/i, 1007],
      [/\binstead\b/i, 1008],
      [/\bthat's very kind of you\b/i, 1010],
      [/\bI'm writing to\b/i, 1016],
    ];
    for (const [re, n] of from) {
      for (const l of range(991, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
      expect(allEn(at(n)!), `L${n} ${re}`).toMatch(re);
    }
  });

  it("ステージ4: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・200 語 以上で 読みものを ふくむ、会話シーンは 6〜7 行（L1000・L1010・L1020 は 8 行まで）、L1020 は スピード TPR", () => {
    if (w34.length === 0) return;
    for (const l of w34) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(200);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{200,}"/);
      expect(s.split("Now, phonics.").length, `L${l.lessonNo}`).toBe(2);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(6);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual([1000, 1010, 1020].includes(l.lessonNo) ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（Would you mind・I'm afraid）
    expect(w34.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([1002, 1007]);
    expect(at(1020)!.tpr[0].en).toBe("Look! Stop! Come here! Go!");
  });

  it("あんぜん: AI 会話で 個人情報を きかない。入国審査・よやく・パスポート・メール・旅行記の 回は ほんとうの なまえや じゅうしょを いわなくて よいと goalJa に 明記", () => {
    if (w34.length === 0) return;
    for (const l of w34) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (real |full )?(name|address|school|age|birthday|phone|email|passport number)|where do you live|how old are you|when were you born/i);
    for (const n of [997, 1001, 1009, 1016, 1018]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/ほんとうの/);
  });

  it("物語: L991 で つばさの空港・スカイと ウィング・スタンプ帳 → L997 スカイポート → L1000 ブライトウォーター → L1001 シーガル・ホテル → 6つの スタンプ → L1020 で ちえの議事堂へ", () => {
    if (w34.length === 0) return;
    const story = (n: number) => at(n)!.teacherScript + " " + said(n);
    expect(story(991)).toMatch(/Airport of Wings/);
    expect(story(991)).toMatch(/\bSkye\b/);
    expect(story(991)).toMatch(/Wing Stamp Book/);
    expect(story(997)).toMatch(/Skyport/);
    expect(story(1000)).toMatch(/Brightwater/);
    expect(story(1001)).toMatch(/Seagull Hotel/);
    expect(story(1000)).toMatch(/1,000|thousand/i);
    for (const n of [995, 1000, 1005, 1010, 1015, 1020]) expect(story(n), `L${n}`).toMatch(/stamp/i);
    expect(story(1020)).toMatch(/Hall of Wisdom/);
  });
});

describe("カリキュラム: ワールド35 の決まりごと（ちえの議事堂）", () => {
  const w35 = LESSONS.filter((l) => l.world === 35);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (ityOf(w) ? "ity" : interCoOf(w) ? "interco" : contrastOf(w) ? "contrast" : formalOf(w) ? "formal" : rootOf(w) ? "root" : "?");

  it("ワールド35 は 1021〜1050 の 30 レッスン、ステージ4・B1、学年の めやすは 高校中級", () => {
    if (w35.length === 0) return; // 未作成ならスキップ
    expect(w35.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 1021 + i));
    for (const l of w35) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校中級");
      expect(l.stage, `L${l.lessonNo}`).toBe(4);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w35.length === 0) return;
    const titles = ["The Hall of Wisdom", "Should Students Wear Uniforms?", "Longer Breaks?", "School Rules Survey", "School Rules Discussion",
      "Fair or Not Fair?", "Everyone Should Have a Chance", "Standing Up for a Friend", "Including Everyone", "Kindness Campaign",
      "Children Have Rights", "We Are Responsible For…", "Helping at Home", "Our Community", "Rights and Responsibilities Talk",
      "I Suggest That We…", "How About Making a Map?", "Let's Find a Compromise", "Vote and Report", "Children's Proposal",
      "Animals and Us", "Less Plastic", "Stage 4 Review: Opinions", "Stage 4 Review: Explaining", "Stage 4 Review: Polite Requests",
      "Two Sides of a Story", "My Proposal Letter", "Final Debate Practice", "Hall of Wisdom Review", "World 35 Grand Review"];
    expect(w35.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: -ity → inter- と co- → 対比の 強勢 → あらたまった ことば → ステージ4 の 語根（各ブロックの 5回目と L1046〜1050 は ふりかえり）", () => {
    if (w35.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(1021, 1024, "suffix-ity");
    rule(1026, 1029, "prefix-inter-co");
    rule(1031, 1034, "contrast-stress");
    rule(1036, 1039, "formal-casual");
    rule(1041, 1044, "root-review");
    for (const n of [1025, 1030, 1035, 1040, 1045, 1046, 1047, 1048, 1049, 1050]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド35 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w35) {
      for (const w of l.phonics.words) {
        const f = w35FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w35FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば（community は もとの 形容詞が ないので 単語と 台本で あつかう）
    const all = w35.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["equality", "responsibility", "international", "cooperate", "I like this one", "children", "receive", "respect", "predict", "structure", "transport", "interrupt", "reject"]));
    // inter- と co- は 両方、語根は ステージ4 の 6つ ぜんぶ
    expect(new Set(range(1026, 1029).flatMap((l) => l.phonics.words).map((w) => interCoOf(w)!.prefix))).toEqual(new Set(["inter", "co"]));
    expect(new Set(range(1041, 1044).flatMap((l) => l.phonics.words).map((w) => rootOf(w)!.root))).toEqual(new Set(["spect", "dict", "struct", "port", "rupt", "ject"]));
    // ふりかえり L1046〜1050 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(1046, 1050)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["ity", "interco", "contrast", "formal", "root"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w35.length === 0) return;
    const want: Record<number, string> = {
      1021: "Children from many places meet here to talk.", 1022: "Should students wear uniforms?", 1026: "It's not fair if only some people can play.",
      1027: "Everyone should have a chance to try.", 1028: "Stop it. That's not kind.", 1029: "Do you want to join us?", 1030: "Let's make our school a kind place.",
      1031: "Children have the right to learn and play.", 1032: "We are responsible for taking care of our pets.", 1033: "I'm responsible for washing the dishes.",
      1034: "What can children do for our community?", 1036: "I suggest that we plant flowers at the station.", 1037: "How about making a map for visitors?",
      1038: "Let's find a compromise.", 1039: "Twelve people voted for the idea.", 1041: "Should people keep wild animals as pets?",
      1042: "I suggest that we bring our own bottles.", 1046: "Read two opinions. Which do you agree with?", 1050: "Children's voices can change the world.",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(1023)).toMatch(/^I think we should have longer breaks because /);
    expect(core(1024)).toMatch(/^Most students want to /);
    expect(core(1025)).toMatch(/^On the one hand, .*\. On the other hand, /);
    expect(core(1035)).toMatch(/^We have the right to .*, and we should /);
    expect(core(1040)).toMatch(/^Our proposal is .*\. It will help /);
    expect(core(1043)).toMatch(/^I see your point, but /);
    expect(core(1044)).toMatch(/^The graph shows /);
    expect(core(1045)).toMatch(/^Would you mind /);
    expect(core(1047)).toMatch(/^Dear Mayor, I suggest that /);
    expect(core(1048)).toMatch(/^First, I'd like to say /);
    expect(core(1049)).toMatch(/On the other hand, /);
  });

  it("文法の じゅんばん: On the one hand / On the other hand は L1025、have a chance to は L1027、have the right to は L1031、responsible for は L1032、suggest that は L1036、compromise は L1038 から", () => {
    if (w35.length === 0) return;
    const from: [RegExp, number][] = [
      [/\bon the one hand\b/i, 1025],
      [/\bon the other hand\b/i, 1025],
      [/\bhave a chance to\b/i, 1027],
      [/\b(have|has) the right to\b/i, 1031],
      [/\bresponsible for\b/i, 1032],
      [/\bsuggest that\b/i, 1036],
      [/\bcompromise\b/i, 1038],
    ];
    for (const [re, n] of from) {
      for (const l of range(1021, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
      expect(allEn(at(n)!), `L${n} ${re}`).toMatch(re);
    }
  });

  it("ステージ4: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・200 語 以上で 読みものを ふくむ、会話シーンは 6〜7 行（L1030・L1040・L1050 は 8 行まで）、L1050 は スピード TPR", () => {
    if (w35.length === 0) return;
    for (const l of w35) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(200);
      expect(s, `L${l.lessonNo} の 読みもの`).toMatch(/"[^"]{200,}"/);
      expect(s.split("Now, phonics.").length, `L${l.lessonNo}`).toBe(2);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(6);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual([1030, 1040, 1050].includes(l.lessonNo) ? 8 : 7);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
    }
    // 日本語の ヒントが ある 回は 2回だけ（On the one hand・compromise）
    expect(w35.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([1025, 1038]);
    expect(at(1050)!.tpr[0].en).toBe("Look! Stop! Come here! Go!");
  });

  it("あんぜん: AI 会話で 個人情報を きかない。であい・アンケート・手紙の 回は ほんとうの なまえや じゅうしょを いわなくて よいと goalJa に 明記", () => {
    if (w35.length === 0) return;
    for (const l of w35) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (real |full )?(name|address|school|age|birthday|phone|email|passport number)|where do you live|how old are you|when were you born/i);
    for (const n of [1021, 1024, 1047]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/ほんとうの/);
  });

  it("物語: L1021 で ちえの議事堂・オリーブ・声の木・ウィローフォード → L1036 ハート市長 → 6まいの 金の 葉っぱ → L1049 海の底への 地図 → L1050 フィナーレ", () => {
    if (w35.length === 0) return;
    const story = (n: number) => at(n)!.teacherScript + " " + said(n);
    expect(story(1021)).toMatch(/Hall of Wisdom/);
    expect(story(1021)).toMatch(/\bOlive\b/);
    expect(story(1021)).toMatch(/Tree of Voices/);
    expect(story(1021)).toMatch(/Willowford/);
    expect(story(1036)).toMatch(/Mayor Hart/);
    for (const n of [1025, 1030, 1035, 1040, 1045, 1050]) expect(story(n), `L${n}`).toMatch(/\bleaf\b/i);
    expect(story(1049)).toMatch(/\bmap\b/i);
    expect(story(1049)).toMatch(/\bsea\b/i);
    expect(story(1050)).toMatch(/\bsea\b/i);
  });
});

describe("カリキュラム: ワールド36 の決まりごと（しんかいの都）", () => {
  const w36 = LESSONS.filter((l) => l.world === 36);
  const at = (n: number) => LESSONS.find((l) => l.lessonNo === n);
  const range = (a: number, b: number) => LESSONS.filter((l) => l.lessonNo >= a && l.lessonNo <= b);
  /** 表現・会話・台本・TPR・AI の さいしょの ことば（英語） */
  const allEn = (l: (typeof LESSONS)[number]) => [l.teacherScript, ...l.school.expressions.map((e) => e.en), ...l.tpr.map((t) => t.en), ...l.conversation!.lines.map((x) => x.en), l.conversation!.aiTask.starterEn].join(" ");
  const said = (n: number) => at(n)!.conversation!.lines.map((x) => x.en).join(" ");
  const core = (n: number) => at(n)!.school.expressions.find((e) => e.core)!.en;
  const kind = (w: string) => (bioOf(w) ? "bio" : academicOf(w) ? "stress" : pauseOf(w) ? "pause" : ologyOf(w) ? "ology" : unitOf(w) ? "unit" : "?");

  it("ワールド36 は 1051〜1080 の 30 レッスン、ステージ5・B1、学年の めやすは 高校中級", () => {
    if (w36.length === 0) return; // 未作成ならスキップ
    expect(w36.map((l) => l.lessonNo)).toEqual(Array.from({ length: 30 }, (_, i) => 1051 + i));
    for (const l of w36) {
      expect(l.school.grade, `L${l.lessonNo}`).toBe("高校中級");
      expect(l.stage, `L${l.lessonNo}`).toBe(5);
      expect(l.level, `L${l.lessonNo}`).toBe("B1");
      expect(l.school.expressions.filter((e) => e.core), `L${l.lessonNo}`).toHaveLength(1);
      expect(l.school.expressions[0].core, `L${l.lessonNo}`).toBe(true);
    }
  });

  it("タイトルは 計画書（docs/curriculum-6year.md §10）どおり", () => {
    if (w36.length === 0) return;
    const titles = ["Down to Deep Sea City", "Creatures That Glow", "The Reason Why It's Dark", "Life Under Pressure", "Deep Sea Wonder Talk",
      "My Research Question", "Where Can We Find Information?", "According to the Book", "Is This Website Reliable?", "Research Plan",
      "In Short", "The Main Point Is…", "Summarize in Three Sentences", "Notes, Not Sentences", "Summary Challenge",
      "Today, I'd Like to Talk About…", "First, Second, Finally", "Look at This Picture", "In Conclusion", "Practice Presentation",
      "That's a Great Question", "I'm Not Sure, But…", "Asking Good Questions", "I'll Look It Up", "Q&A Session",
      "Reading Three Sources", "Protecting the Deep Sea", "My Presentation Script", "Deep Sea City Review", "World 36 Grand Review"];
    expect(w36.map((l) => l.title)).toEqual(titles);
  });

  it("フォニックス: bio → 学習語彙の 強勢 → 発表の 区切り → -ology と -ologist → 数と たんい（各ブロックの 5回目と L1076〜1080 は ふりかえり）", () => {
    if (w36.length === 0) return;
    const rule = (a: number, b: number, r: string) => range(a, b).forEach((l) => expect(l.phonics.rule, `L${l.lessonNo}`).toBe(r));
    rule(1051, 1054, "root-bio");
    rule(1056, 1059, "academic-stress");
    rule(1061, 1064, "presentation-pause");
    rule(1066, 1069, "suffix-ology");
    rule(1071, 1074, "numbers-units");
    for (const n of [1055, 1060, 1065, 1070, 1075, 1076, 1077, 1078, 1079, 1080]) expect(at(n)!.phonics.rule, `L${n}`).toBe("review");
    // どの ことばも ワールド36 の 表に あり、その focus が レッスンの focus に ある（focus には かならず ことばが ある）
    for (const l of w36) {
      for (const w of l.phonics.words) {
        const f = w36FocusOf(w);
        expect(f, `L${l.lessonNo} ${w}`).not.toBeNull();
        expect(l.phonics.focus, `L${l.lessonNo} ${w}`).toContain(f);
      }
      expect(l.phonics.sounds.length, `L${l.lessonNo}`).toBe(l.phonics.focus.length);
      for (const f of l.phonics.focus) expect(l.phonics.words.some((w) => w36FocusOf(w) === f), `L${l.lessonNo} ${f}`).toBe(true);
    }
    // 計画の ことば
    const all = w36.flatMap((l) => l.phonics.words);
    expect(all).toEqual(expect.arrayContaining(["biology", "biography", "research", "compare", "result", "biologist", "3,800 meters", "−2°C"]));
    // -ology と -ologist は 両方
    expect(new Set(range(1066, 1069).flatMap((l) => l.phonics.words).map((w) => ologyOf(w)!.kind))).toEqual(new Set(["-ology", "-ologist"]));
    // ふりかえり L1076〜1080 は 5つの きまりを ぜんぶ ふくむ
    for (const l of range(1076, 1080)) expect(new Set(l.phonics.words.map(kind)), `L${l.lessonNo}`).toEqual(new Set(["bio", "stress", "pause", "ology", "unit"]));
  });

  it("文法・会話スキルの 型が 計画どおり入っている（core の 表現）", () => {
    if (w36.length === 0) return;
    const want: Record<number, string> = {
      1051: "This is the place where light never reaches.", 1052: "Some deep-sea fish make their own light.", 1054: "Deep-sea animals have special bodies.",
      1059: "Who wrote it? When was it written?", 1061: "In short, anglerfish use light to catch food.", 1062: "The main point is that the ocean needs protecting.",
      1065: "Can you summarize it in 30 seconds?", 1066: "Today, I'd like to talk about the deep sea.", 1069: "In conclusion, the deep sea is full of surprises.",
      1070: "Speak slowly. Pause after each point.", 1071: "That's a great question. Let me explain.", 1074: "I'll look it up and tell you later.",
      1075: "Does anyone have any questions?", 1077: "We need to protect the places where these animals live.", 1080: "Thank you for listening. Are there any questions?",
    };
    for (const [n, s] of Object.entries(want)) expect(core(Number(n)), `L${n}`).toBe(s);
    expect(core(1053)).toMatch(/^The reason why .* is that /);
    expect(core(1055)).toMatch(/^One amazing fact is that /);
    expect(core(1056)).toMatch(/^My research question is/);
    expect(core(1057)).toMatch(/books, websites and interviews/);
    expect(core(1058)).toMatch(/^According to this book, /);
    expect(core(1060)).toMatch(/^First, we'll .*\. Then, we'll /);
    expect(core(1063)).toMatch(/^This article is about .*\. It says .*\. It shows /);
    expect(core(1064)).toMatch(/^Take notes: /);
    expect(core(1067)).toMatch(/^First, .*\. Second, .*\. Finally, /);
    expect(core(1068)).toMatch(/^As you can see in this picture, /);
    expect(core(1072)).toMatch(/^I'm not sure, but I think /);
    expect(core(1073)).toMatch(/^I have a question about /);
    expect(core(1076)).toMatch(/^Source A says .*, but source B says /);
    expect(core(1078)).toMatch(/^Today, I'd like to talk about .*\. In conclusion, /);
    expect(core(1079)).toMatch(/^In short, /);
  });

  it("文法の じゅんばん: the reason why は L1053、according to は L1058、in short は L1061、the main point is は L1062、in conclusion は L1069、let me explain と great question は L1071、look it up は L1074 から", () => {
    if (w36.length === 0) return;
    const from: [RegExp, number][] = [
      [/\bthe reason why\b/i, 1053],
      [/\baccording to\b/i, 1058],
      [/\bin short\b/i, 1061],
      [/\bthe main point is\b/i, 1062],
      [/\bin conclusion\b/i, 1069],
      [/\blet me explain\b/i, 1071],
      [/\bgreat question\b/i, 1071],
      [/\blook (it|them|that) up\b/i, 1074],
    ];
    for (const [re, n] of from) {
      for (const l of range(1051, n - 1)) expect(allEn(l), `L${l.lessonNo} ${re}`).not.toMatch(re);
      expect(allEn(at(n)!), `L${n} ${re}`).toMatch(re);
    }
  });

  it("ステージ5: 先生の 台本は 英語だけ（日本語は ごく小さな ヒントだけ）・320 語 以上で 100 語 以上の 読みものを ふくむ、会話シーンは 7〜9 行（ブロックの まとめは 10 行まで）、AI 会話は 6 かい いじょう、L1080 は スピード TPR", () => {
    if (w36.length === 0) return;
    const ends = [1055, 1060, 1065, 1070, 1075, 1080];
    for (const l of w36) {
      const s = l.teacherScript;
      const jaChars = (s.match(/[぀-ヿ一-鿿]/g) ?? []).length;
      expect(jaChars / s.length, `L${l.lessonNo}`).toBeLessThan(0.02);
      expect(s.split(/\s+/).filter((w) => /^[A-Za-z0-9]/.test(w)).length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(320);
      const reading = (s.match(/"([^"]+)"/) ?? ["", ""])[1];
      expect(reading.split(/\s+/).filter(Boolean).length, `L${l.lessonNo} の 読みもの`).toBeGreaterThanOrEqual(95);
      expect(s.split("Now, phonics.").length, `L${l.lessonNo}`).toBe(2);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(7);
      expect(l.conversation!.lines.length, `L${l.lessonNo}`).toBeLessThanOrEqual(ends.includes(l.lessonNo) ? 10 : 9);
      for (const x of l.conversation!.lines) expect(CAST, `L${l.lessonNo}`).toContain(x.speaker);
      expect(l.conversation!.aiTask.targetExpressions, `L${l.lessonNo}`).toEqual(l.school.expressions.map((e) => e.en));
      expect(l.conversation!.aiTask.goalJa, `L${l.lessonNo}`).toMatch(/6 ?かい/);
    }
    // 日本語の ヒントが ある 回は 2回だけ（reliable・In short）
    expect(w36.filter((l) => /[぀-ヿ一-鿿]/.test(l.teacherScript)).map((l) => l.lessonNo)).toEqual([1059, 1061]);
    expect(at(1080)!.tpr[0].en).toBe("Look! Stop! Come here! Go!");
  });

  it("あんぜん: AI 会話で 個人情報を きかない。であい・インタビュー・発表原稿の 回は ほんとうの なまえや じゅうしょを いわなくて よいと goalJa に 明記", () => {
    if (w36.length === 0) return;
    for (const l of w36) expect(l.conversation!.aiTask.starterEn, `L${l.lessonNo}`).not.toMatch(/your (real |full )?(name|address|school|age|birthday|phone|email|passport number)|where do you live|how old are you|when were you born/i);
    for (const n of [1051, 1057, 1078]) expect(at(n)!.conversation!.aiTask.goalJa, `L${n}`).toMatch(/ほんとうの/);
  });

  it("物語: L1051 で ブルーベル号・ヴェイル博士・しんかいの都・ルミ → L1057 オズウィンさん → 6つの しんじゅ → L1079 古い 扉 → L1080 扉が ひらく", () => {
    if (w36.length === 0) return;
    const story = (n: number) => at(n)!.teacherScript + " " + said(n);
    expect(story(1051)).toMatch(/Deep Sea City/);
    expect(story(1051)).toMatch(/\bLumi\b/);
    expect(story(1051)).toMatch(/Dr\. Vale/);
    expect(story(1051)).toMatch(/Bluebell/);
    expect(story(1057)).toMatch(/Oswin/);
    for (const n of [1055, 1060, 1065, 1070, 1075, 1080]) expect(story(n), `L${n}`).toMatch(/\bpearl\b/i);
    expect(story(1079)).toMatch(/\bdoor\b/i);
    expect(story(1080)).toMatch(/\bdoor\b/i);
  });
});
