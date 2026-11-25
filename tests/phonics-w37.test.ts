/**
 * ワールド37の フォニックス（物語の 動詞・音の ことば・語りの 間・-ly の 副詞・たとえ）の 問題と 表（src/lib/curriculum/w37Phonics.ts）。
 * - 物語の 動詞は「物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？」（say very quietly, using only your breath → ＿＿ → whisper）
 * - 音の ことばは「音の ことば。この 場面の 音は どれ？」（The frog jumped into the pond. ＿＿! → splash）
 * - 語りの 間は「お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？」（She opened the box, and inside was a tiny dragon → was）
 * - -ly は「どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？」（The cat crept ＿＿ toward the bird, … → silently）
 * - たとえは「たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？」（as brave as a ＿＿ → lion）
 * - ワールド36 までの 回では ワールド37 の 問題に ならない・まえの ワールドの 読み上げを かえない
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson, itemsOfLesson } from "@/lib/curriculum";
import { focusExampleWord } from "@/lib/curriculum/phonicsButtons";
import { makeQuestion, seededRng, w37Question } from "@/lib/curriculum/questions";
import { focusSay } from "@/lib/curriculum/vowelTeams";
import { adverbOf, simileOf, soundWordOf, storyVerbOf, suspenseMarked, suspenseOf, w37Example, w37FocusOf, w37Say } from "@/lib/curriculum/w37Phonics";
import type { LearningItemDef } from "@/lib/domain/types";

const phonicsItems = (n: number) => itemsOfLesson(getLesson(n)!).filter((i) => i.kind === "PHONICS");
const item = (n: number, text: string) => phonicsItems(n).find((i) => i.text === text) as LearningItemDef;
const hasW37 = !!getLesson(1110);
const ids = (q: { choices?: { id: string }[] }) => q.choices!.map((c) => c.id);
const q = (n: number, text: string, seed = 1) => makeQuestion(item(n, text), "phonics_sound", [], seededRng(seed), 0);
const w37Words = () => LESSONS.filter((x) => x.world === 37).flatMap((l) => l.phonics.words);
const tokens = (s: string) => s.split(" ").map((w) => w.replace(/[^A-Za-z']/g, ""));

describe("ワールド37の つづりの表", () => {
  it("物語の 動詞: せつめいに その ことばは 出てこない。まちがいは 表の ほかの 動詞で 3つ ちがう", () => {
    expect(storyVerbOf("whisper")).toMatchObject({ plain: "speak very quietly, using only your breath", wrong: ["grin", "stumble"] });
    expect(storyVerbOf("Glimmer")).toMatchObject({ word: "glimmer", answer: "glimmer" });
    expect(storyVerbOf("whispered")).toBeNull();
    expect(storyVerbOf("toString")).toBeNull();
    for (const w of w37Words()) {
      const v = storyVerbOf(w);
      if (!v) continue;
      expect(v.plain.toLowerCase(), w).not.toContain(w);
      expect(new Set([v.answer, ...v.wrong]).size, w).toBe(3);
      for (const x of v.wrong) expect(storyVerbOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("音の ことば: 場面の 文に ＿＿ が 1つ。文に その 音の ことばは 出てこない。まちがいは 表の ほかの 音", () => {
    expect(soundWordOf("splash")).toMatchObject({ scene: "The frog jumped into the pond. ＿＿!", wrong: ["creak", "hiss"] });
    expect(soundWordOf("splashing")).toBeNull();
    for (const w of w37Words()) {
      const s = soundWordOf(w);
      if (!s) continue;
      expect(s.scene.split("＿＿").length, w).toBe(2);
      expect(s.scene.toLowerCase(), w).not.toContain(w);
      expect(new Set([s.answer, ...s.wrong]).size, w).toBe(3);
      for (const x of s.wrong) expect(soundWordOf(x), `${w} ${x}`).not.toBeNull();
    }
  });

  it("語りの 間: 間を とる ことばと まちがいは 文の なかの ことば。間は 文の さいごでは ない", () => {
    expect(suspenseOf("She opened the box, and inside was a tiny dragon")).toMatchObject({ pause: "was", wrong: ["She", "tiny"] });
    expect(suspenseMarked(suspenseOf("She opened the box, and inside was a tiny dragon")!)).toBe("She opened the box, and inside was … a tiny dragon!");
    expect(suspenseOf("she opened the box")).toBeNull();
    for (const w of w37Words()) {
      const p = suspenseOf(w);
      if (!p) continue;
      const ws = tokens(w);
      expect(ws, w).toContain(p.pause);
      expect(ws.filter((x) => x === p.pause), w).toHaveLength(1);
      expect(ws[ws.length - 1], w).not.toBe(p.pause);
      for (const x of p.wrong) expect(ws, `${w} ${x}`).toContain(x);
      expect(new Set([p.answer, ...p.wrong]).size, w).toBe(3);
      expect(suspenseMarked(p).split("…").length, w).toBe(2);
      expect(w, w).not.toMatch(/'/); // ボタンの きまり（アポストロフィを 入れない）
    }
  });

  it("-ly: ことばは -ly で おわる。文に ＿＿ が 1つで、答えは 文に 出てこない。3つ ちがう", () => {
    expect(adverbOf("gently")).toMatchObject({ base: "gentle", wrong: ["fiercely", "suddenly"] });
    expect(adverbOf("gentle")).toBeNull();
    for (const w of w37Words()) {
      const a = adverbOf(w);
      if (!a) continue;
      expect(w.endsWith("ly"), w).toBe(true);
      expect(a.sentence.split("＿＿").length, w).toBe(2);
      expect(a.sentence.toLowerCase(), w).not.toContain(w);
      for (const x of [a.answer, ...a.wrong]) expect(x, `${w} ${x}`).toMatch(/ly$/);
      expect(new Set([a.answer, ...a.wrong]).size, w).toBe(3);
    }
  });

  it("たとえ: ＿＿ を 答えで うめると もとの たとえに なる。as と like の 両方。3つ ちがう", () => {
    expect(simileOf("as brave as a lion")).toMatchObject({ kind: "as", blank: "as brave as a ＿＿", answer: "lion" });
    expect(simileOf("swim like a fish")).toMatchObject({ kind: "like", answer: "fish" });
    expect(simileOf("brave")).toBeNull();
    for (const w of w37Words()) {
      const m = simileOf(w);
      if (!m) continue;
      expect(m.blank.replace("＿＿", m.answer).toLowerCase(), w).toContain(w);
      expect(w.includes(m.kind === "like" ? "like" : "as "), w).toBe(true);
      expect(new Set([m.answer, ...m.wrong]).size, w).toBe(3);
    }
  });

  it("フォーカスの ボタン: その focus で 問う ことば・文・たとえを よむ（英字・スペース・アポストロフィ だけ）", () => {
    expect(focusSay("whisper", ["whisper", "glimmer", "tremble"])).toBe("whisper");
    expect(focusExampleWord("creak", ["crash", "splash", "creak"])).toBe("creak");
    expect(focusSay("then", ["She opened the box, and inside was a tiny dragon", "The footsteps came closer and closer, and then they stopped"])).toBe("The footsteps came closer and closer and then they stopped");
    expect(focusSay("-ly", ["suddenly", "carefully", "bravely"])).toBe("suddenly");
    expect(focusExampleWord("as", ["as brave as a lion", "as quiet as a mouse", "as busy as a bee"])).toBe("as brave as a lion");
    expect(focusSay("like", ["as white as snow", "as hard as a rock", "like a shooting star"])).toBe("like a shooting star");
    expect(w37FocusOf("bravely")).toBe("-ly");
    for (const l of LESSONS.filter((x) => x.world === 37)) {
      for (const f of l.phonics.focus) expect(focusSay(f, l.phonics.words), `L${l.lessonNo} ${f}`).toMatch(/^[A-Za-z']+( [A-Za-z']+)*$/);
    }
  });

  it("まえの ワールドの 回では 読み上げを かえない（w37Say・w37Example は L1080 までの どの 回でも はたらかない）", () => {
    for (const l of LESSONS.filter((x) => x.lessonNo < 1081)) {
      for (const f of l.phonics.focus) {
        expect(w37Say(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
        expect(w37Example(f, l.phonics.words), `L${l.lessonNo} ${f}`).toBeNull();
      }
    }
  });
});

describe("ワールド37の フォニックス問題", () => {
  it.skipIf(!hasW37)("物語の 動詞: ふつうの いいかたに あう ことばを えらぶ", () => {
    const a = q(1081, "whisper");
    expect(a.promptJa).toBe("物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？");
    expect(a.display).toBe("speak very quietly, using only your breath → ＿＿");
    expect(ids(a).sort()).toEqual(["grin", "stumble", "whisper"]);
    expect(a.answer).toBe("whisper");
  });

  it.skipIf(!hasW37)("音の ことば: 場面に あう 音を えらぶ（crash を ワールド4 の cr で 問わない）", () => {
    const a = q(1089, "crash");
    expect(a.promptJa).toBe("音の ことば。この 場面の 音は どれ？");
    expect(a.display).toBe("A big plate fell off the table and broke into pieces. ＿＿!");
    expect(ids(a).sort()).toEqual(["crash", "drip", "rustle"]);
  });

  it.skipIf(!hasW37)("語りの 間: 間を とる ことばを えらぶ。音は 文", () => {
    const a = q(1091, "She opened the box, and inside was a tiny dragon");
    expect(a.promptJa).toBe("お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？");
    expect(a.display).toBe("She opened the box, and inside was a tiny dragon.（はこを あけると、中に いたのは… 小さな ドラゴン）");
    expect(ids(a).sort()).toEqual(["She", "tiny", "was"]);
    expect(a.answer).toBe("was");
    expect(a.audioText).toBe("She opened the box, and inside was a tiny dragon");
    expect(q(1093, "The last door opened, and in the room was the dragon queen").answer).toBe("was");
  });

  it.skipIf(!hasW37)("-ly と たとえ（bravely を ワールド18 の -ly の つづりで 問わない）", () => {
    const a = q(1096, "bravely");
    expect(a.promptJa).toBe("どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？");
    expect(a.display).toBe("The little knight was scared, but he ＿＿ walked into the dark cave.");
    expect(ids(a).sort()).toEqual(["bravely", "gently", "gracefully"]);
    const b = q(1101, "as brave as a lion");
    expect(b.promptJa).toBe("たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？");
    expect(b.display).toBe("as brave as a ＿＿（とても ゆうかん）");
    expect(ids(b).sort()).toEqual(["lion", "mouse", "snail"]);
    expect(b.answer).toBe("lion");
    expect(q(1104, "run like the wind").answer).toBe("wind");
  });

  it.skipIf(!hasW37)("ワールド37 の フォニックスの ことばは ぜんぶ ワールド37 の 問題（3つ 以上の 選択肢・答えが 入る・せつめい あり）に なる", () => {
    for (let n = 1081; n <= 1110; n++) {
      for (const it of phonicsItems(n)) {
        expect(w37Question(it, seededRng(3)), `L${n} ${it.text}`).not.toBeNull();
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

  it("ワールド36 までの 回では ワールド37 の 問題に ならない", () => {
    for (const n of [43, 59, 71, 113, 289, 521, 522, 523, 524, 554, 644, 841, 961, 1021, 1051, 1061, 1066, 1071, 1080]) {
      const lesson = getLesson(n);
      if (!lesson) continue;
      for (const it of phonicsItems(n)) expect(w37Question(it, seededRng(1)), `L${n} ${it.text}`).toBeNull();
    }
  });
});
