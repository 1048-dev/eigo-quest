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

/** フォーカス（"a_e" のような magic e、"sun-set" のような 2つに わける語も）を正規表現に */
const focusRe = (f: string) => new RegExp(f.toLowerCase().replace(/-/g, "").replace(/_/g, "[a-z]"));

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
