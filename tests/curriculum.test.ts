/**
 * カリキュラム全体の検証（content/curriculum/lessons.json）。
 * 新しいワールドを追加したら、このテストが通ることを確認する。
 */
import { describe, expect, it } from "vitest";
import { z } from "zod";
import raw from "@content/curriculum/lessons.json";
import { ALL_ITEMS, ASSESSMENTS, LESSONS, TEACHER, itemsOfLesson } from "@/lib/curriculum";
import { buildLessonFlow } from "@/lib/curriculum/questions";
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
  school: z.object({
    grade: z.string().regex(/^小[1-6]/),
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

/** ワールド → 学年（docs/curriculum-plan.md） */
const gradeOfWorld = (w: number) => (w <= 2 ? `小${w}` : w <= 4 ? "小3" : w <= 6 ? "小4" : w <= 8 ? "小5" : "小6");

/** フォーカス（"a_e" のような magic e も）を正規表現に */
const focusRe = (f: string) => new RegExp(f.toLowerCase().replace(/_/g, "[a-z]"));

const data = raw as { meta: { lessonsPerWorld: number; miniTestEvery: number; teacher: { name: string } }; lessons: unknown[] };

describe("カリキュラム: スキーマ", () => {
  it("meta がある", () => {
    expect(data.meta.lessonsPerWorld).toBe(30);
    expect(data.meta.miniTestEvery).toBe(5);
    expect(TEACHER.name).toBe("Ms. Emma");
  });

  it.each(data.lessons.map((l, i) => [(l as { lessonNo?: number }).lessonNo ?? `index ${i}`, l]))("レッスン %s がスキーマどおり", (_n, l) => {
    const r = LessonSchema.safeParse(l);
    expect(r.success ? "ok" : JSON.stringify(r.error.issues.slice(0, 5), null, 1)).toBe("ok");
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
    for (const l of LESSONS) expect(l.school.grade.startsWith(gradeOfWorld(l.world)), `L${l.lessonNo}: ${l.school.grade}`).toBe(true);
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
