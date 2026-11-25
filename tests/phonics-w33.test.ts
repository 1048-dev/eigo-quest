/**
 * ワールド33の フォニックス（語根 rupt・名詞の おわり -ance / -ence / -ency / -ty・-proof の 複合語・リストの 読みかた・語根 ject）の 問題と 表（src/lib/curriculum/w33Phonics.ts）。
 * - rupt は「rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？」（文と いみ → erupt / eruption / interrupt）
 * - 名詞の おわりは「ものの なまえ（名詞）に すると？ ただしい つづりは どれ？」（distant → distance / distence / distanse）
 * - -proof は「-proof（〜を ふせぐ・〜に つよい）の ことば。文に あう ことばは どれ？」（waterproof / fireproof / soundproof）
 * - リストは「リストを いう ときの こえの 上がり下がりは どれ？」（water ↗, food ↗, and a flashlight ↘）。音は おわりに . か ? を つけた 文
 * - ject は「ject（なげる）の まえに つく パーツは どれ？」（＿＿ject → pro / in / ob）
 * - ワールド32 までの 回では ワールド33 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w33Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { jectOf, listOf, nounEndOf, proofOf, ruptOf, w33Example, w33FocusOf, w33Say } from "@/lib/curriculum/w33Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW33 = !!getLesson(990);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w33Words = () => LESSONS.filter((x) => x.world === 33).flatMap((l) => l.phonics.words);

describe("ワールド33の つづりの表", () => {
  it("rupt: ことばに rupt が ある。文の ＿＿ は 1つ。まちがいも 表に ある rupt の ことばで 3つ ちがう", () => {
    expect(ruptOf("erupt")).toMatchObject({ answer: "erupt", meaning: "ふんかする", wrong: ["eruption", "interrupt"] });
    expect(ruptOf("rupt")).toBeNull();
    expect(ruptOf("toString")).toBeNull();
    for (const w of w33Words()) {
      const r = ruptOf(w);
      if (!r) continue;
      expect(w, w).toContain("rupt");
      expect(r.sentence.split("＿＿").length, w).toBe(2);
      expect(new Set([r.answer, ...r.wrong]).size, w).toBe(3);
      for (const x of r.wrong) expect(ruptOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("名詞の おわり: 答えは その つづりで おわる。まちがいは ない ことばで、どの 表にも ない", () => {
    expect(nounEndOf("distance")).toMatchObject({ focus: "-ance", base: "distant", wrong: ["distence", "distanse"] });
    expect(nounEndOf("safety")).toMatchObject({ focus: "-ty", base: "safe" });
    expect(nounEndOf("distant")).toBeNull();
    for (const w of w33Words()) {
      const e = nounEndOf(w);
      if (!e) continue;
      expect(w.endsWith(e.focus === "-ty" ? "y" : e.focus.slice(1)), w).toBe(true);
      expect(new Set([e.answer, ...e.wrong]).size, w).toBe(3);
      for (const x of e.wrong) expect(w33FocusOf(x), `${w} ${x}`).toBeNull();
    }
  });

  it("-proof: proof で おわる。文の ＿＿ は 1つ。まちがいも 表に ある -proof の ことば", () => {
    expect(proofOf("waterproof")).toMatchObject({ meaning: "水を とおさない", wrong: ["fireproof", "soundproof"] });
    expect(proofOf("earthquake-proof")).not.toBeNull();
    expect(proofOf("proof")).toBeNull();
    for (const w of w33Words()) {
      const p = proofOf(w);
      if (!p) continue;
      expect(w.endsWith("proof"), w).toBe(true);
      expect(p.sentence.split("＿＿").length, w).toBe(2);
      expect(new Set([p.answer, ...p.wrong]).size, w).toBe(3);
      for (const x of p.wrong) expect(proofOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("リスト: ならべる 文は とちゅう ↗・さいご ↘、どっち？の 文は ↗ ↘。まとまりを つなぐと もとの 文に なる", () => {
    const a = listOf("We need water, food, and a flashlight")!;
    expect(a).toMatchObject({ focus: "and", answer: "water ↗, food ↗, and a flashlight ↘", say: "We need water, food, and a flashlight." });
    expect(a.wrong).toEqual(["water ↘, food ↘, and a flashlight ↗", "water ↗, food ↗, and a flashlight ↗"]);
    const b = listOf("is it an earthquake or a typhoon")!;
    expect(b).toMatchObject({ focus: "or", answer: "an earthquake ↗ or a typhoon ↘", say: "Is it an earthquake or a typhoon?" });
    expect(listOf("We need water")).toBeNull();
    for (const w of w33Words()) {
      const l = listOf(w);
      if (!l) continue;
      expect(w.endsWith(l.items.join(l.focus === "or" ? " " : ", ")), w).toBe(true);
      expect(l.answer.endsWith("↘"), w).toBe(true);
      expect(new Set([l.answer, ...l.wrong]).size, w).toBe(3);
      if (l.focus === "and") expect(l.items[l.items.length - 1].startsWith("and "), w).toBe(true);
      else expect(l.items[1].startsWith("or "), w).toBe(true);
    }
  });

  it("ject: 答えは まえの パーツ。まちがいも 表に ある パーツで 3つ ちがう。パーツ ＋ のこり ＝ ことば", () => {
    expect(jectOf("project")).toMatchObject({ answer: "pro", rest: "ject", wrong: ["in", "ob"] });
    expect(jectOf("injection")).toMatchObject({ answer: "in", rest: "jection" });
    expect(jectOf("ject")).toBeNull();
    const prefixes = new Set(LESSONS.filter((x) => x.world === 33).flatMap((l) => l.phonics.words).map((w) => jectOf(w)?.prefix).filter(Boolean));
    for (const w of w33Words()) {
      const j = jectOf(w);
      if (!j) continue;
      expect(j.prefix + j.rest, w).toBe(w);
      expect(new Set([j.answer, ...j.wrong]).size, w).toBe(3);
      for (const x of j.wrong) expect(["pro", "in", "ob", "re", "e", "sub", "de", "inter"], `${w} ${x}`).toContain(x);
    }
    if (hasW33) expect(prefixes.size).toBeGreaterThanOrEqual(6);
  });

  it("フォーカスの ボタン: その focus で 問う ことば・文を よむ（英字と スペース だけ。, や - は よまない）", () => {
    expect(focusSay("rupt", ["erupt", "eruption", "erupted"])).toBe("erupt");
    expect(focusSay("-ty", ["safety", "loyalty", "honesty", "certainty"])).toBe("safety");
    expect(focusSay("or", ["Is it an earthquake or a typhoon", "Should we go up or stay here"])).toBe("Is it an earthquake or a typhoon");
    expect(focusExampleWord("and", ["Drop, cover, and hold on", "We need water, food, and a flashlight"])).toBe("Drop cover and hold on");
    expect(focusExampleWord("ject", ["eruption", "safety", "waterproof", "We need water, food, and a flashlight", "project"])).toBe("project");
    expect(focusExampleWord("-proof", ["fireproof", "earthquake-proof", "foolproof"])).toBe("fireproof");
    expect(focusExampleWord("-proof", ["project", "reject", "Pack socks, gloves, and a warm hat", "earthquake-proof"])).toBe("earthquake proof");
    expect(focusLabel("-proof").main).toBe("…proof");
    expect(focusLabel("-ency").main).toBe("…ency");
    expect(focusLabel("and").main).toBe("and");
    expect(focusSay("or", ["corn", "fork", "horse"])).toBe("or"); // ワールド9 の or は これまでどおり（ワールド33 の 表に ない ことば）
    expect(w33FocusOf("eruption")).toBe("rupt"); // -tion が あっても rupt の 表
    expect(w33FocusOf("emergency")).toBe("-ency");
    for (const l of LESSONS.filter((x) => x.world === 33)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z]+( [A-Za-z]+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w33Say・w33Example は L960 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 961)) {
      for (const f of l.phonics.focus) {
        expect(w33Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w33Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド33の フォニックス問題", () => {
  it.skipIf(!hasW33)("rupt: 文と いみから ことばを えらぶ（eruption を ワールド23 の -tion で 問わない）", () => {
    const a = q(961, "erupt");
    expect(a.promptJa).toBe("rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？");
    expect(a.display).toBe("The volcano may ＿＿ again someday.（ふんかする）");
    expect(ids(a).sort()).toEqual(["erupt", "eruption", "interrupt"]);
    expect(a.answer).toBe("erupt");
    expect(q(961, "eruption").answer).toBe("eruption");
    expect(q(964, "abruptly").answer).toBe("abruptly");
  });

  it.skipIf(!hasW33)("名詞の おわりと -proof", () => {
    const a = q(966, "entrance");
    expect(a.promptJa).toBe("ものの なまえ（名詞）に すると？ ただしい つづりは どれ？");
    expect(a.display).toBe("enter（入る）→ ＿＿（いりぐち）");
    expect(ids(a).sort()).toEqual(["enterance", "entrance", "entrence"]);
    expect(q(969, "safety").answer).toBe("safety");
    const b = q(971, "waterproof");
    expect(b.promptJa).toBe("-proof（〜を ふせぐ・〜に つよい）の ことば。文に あう ことばは どれ？");
    expect(b.display).toBe("Keep your papers in a ＿＿ bag.（水を とおさない）");
    expect(ids(b).sort()).toEqual(["fireproof", "soundproof", "waterproof"]);
    expect(q(974, "earthquake-proof").answer).toBe("earthquake-proof");
  });

  it.skipIf(!hasW33)("リスト: 上がり下がりを えらぶ。音は おわりに . か ? を つけた 文", () => {
    const a = q(976, "We need water, food, and a flashlight");
    expect(a.promptJa).toBe("リストを いう ときの こえの 上がり下がりは どれ？");
    expect(a.answer).toBe("water ↗, food ↗, and a flashlight ↘");
    expect(a.audioText).toBe("We need water, food, and a flashlight.");
    expect(a.display).toBe("We need water, food, and a flashlight.（水と たべものと かいちゅうでんとうが ひつようだ）");
    const b = q(977, "Is it an earthquake or a typhoon");
    expect(b.promptJa).toBe("「どっち？」と きく ときの こえの 上がり下がりは どれ？");
    expect(b.answer).toBe("an earthquake ↗ or a typhoon ↘");
    expect(b.audioText).toBe("Is it an earthquake or a typhoon?");
    expect(q(978, "We have rice, bread, crackers, and water").answer).toBe("rice ↗, bread ↗, crackers ↗, and water ↘");
  });

  it.skipIf(!hasW33)("ject: いみから まえの パーツを えらぶ（injection を ワールド23 の -tion で 問わない）", () => {
    const a = q(981, "project");
    expect(a.promptJa).toBe("ject（なげる）の まえに つく パーツは どれ？");
    expect(a.display).toBe("＿＿ject「スクリーンに うつす・けいかく（プロジェクト）」");
    expect(ids(a).sort()).toEqual(["in", "ob", "pro"]);
    expect(a.answer).toBe("pro");
    expect(q(983, "injection").answer).toBe("in");
    expect(q(990, "subject").answer).toBe("sub"); // ふりかえりでも おなじ 問い
  });

  it.skipIf(!hasW33)("ワールド33 の フォニックスの ことばは ぜんぶ ワールド33 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 961; n <= 990; n++) {
      for (const it of phonicsItems(n)) {
        expect(w33Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
        for (const seed of [1, 3, 7]) {
          const a = makeQuestion(it, "phonics_sound", [], seededRng(seed), 0);
          expect(a.choices?.length ?? 0, `L${n} ${it.text}`).toBeGreaterThanOrEqual(3);
          expect(ids(a), `L${n} ${it.text}`).toContain(a.answer);
          expect(new Set(ids(a)).size, `L${n} ${it.text}`).toBe(ids(a).length);
          expect(a.explanationJa, `L${n} ${it.text}`).toBeTruthy();
        }
      }
    }
  });

  it("ワールド32 までの 回では ワールド33 の 問題に ならない", () => {
    for (const n of [161, 517, 621, 681, 711, 781, 811, 841, 871, 901, 931, 936, 951, 960]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w33Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
