/**
 * run9 Phase 1: 英語チェック（scripts/english-lint.ts）
 *  - ルールごとに「見つける もの」「見のがす べき もの（正しい 英語）」を たしかめる
 *  - 辞書は 小さな Set（cspell は つかわない）。ぜんぶの レッスンから 文字列を あつめられるかも みる
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fragmentOk, latinRuns, lintEntries, makeWordChecker, renderMarkdown, variantKey, walkEntries, wordsOf, type TextEntry } from "../scripts/lib/englishLint";
import { collectLessons, collectLibrary, loadWordList, parseArgs, rangeName } from "../scripts/english-lint";

const DICT = new Set(`
a an the i i'm it's is are am you we they he she it this that what's what how who where when do does don't can can't let's
hello hi good morning bye see thank thanks you're nice to meet too fine and or but so very really like love want have has
apple apples banana dog dogs cat cats red blue big small happy sad sun sock ant look stop come here go home there on in at
night monday sunday day today my your our his her name friend friends play game fun great job well done say with me us
favorite color colour center eraser school bread some homework please sit down listen enjoy try challenge study hard work
for bored boring excited exciting ok okay goodbye email t-shirt cannot not am will be number one two three hour uniform
of time went once upon presentation pen pencil rabbit picnic word part means respect again word parts eat cookies cookie
`.split(/\s+/).filter(Boolean));
const isKnownWord = (w: string) => DICT.has(w);
const opts = { isKnownWord, names: ["Haru", "Riko", "Kiko", "Birimo", "Emma"], isTeachingForm: (w: string) => ["goed"].includes(w) };

const entry = (text: string, over: Partial<TextEntry> = {}): TextEntry => ({
  unit: "L0001", stage: 1, path: "conversation.lines[0].en", text, kind: "line", strict: true, spoken: true, seq: "conversation.lines", ...over,
});
const rulesOf = (text: string, over: Partial<TextEntry> = {}) => lintEntries([entry(text, over)], opts).map((i) => `${i.rule}:${i.level}`);
const has = (text: string, rule: string, over: Partial<TextEntry> = {}) => rulesOf(text, over).some((r) => r.startsWith(`${rule}:`));

describe("つづり・名前・イギリス式", () => {
  it("知らない ことばは spelling（error）", () => {
    expect(rulesOf("I like aplles.")).toContain("spelling:error");
    expect(has("I like apples.", "spelling")).toBe(false);
  });
  it("イギリス式の つづりは uk-spelling（colour / centre / mum / favourite）", () => {
    for (const t of ["My favourite colour is blue.", "Go to the centre.", "I love my mum.", "I like grey."]) expect(has(t, "uk-spelling")).toBe(true);
    expect(has("My favorite color is blue.", "uk-spelling")).toBe(false);
    expect(has("Our hour is four.", "uk-spelling")).toBe(false);
  });
  it("名前の 小文字・1文字 ちがいは name", () => {
    expect(has("Hi, haru!", "name")).toBe(true);
    expect(has("Hi, Hallo!", "name")).toBe(false); // 2文字 いじょう ちがいは spelling
    expect(has("Hi, Birino!", "name")).toBe(true);
    expect(has("Hi, Haru! I'm Birimo's friend.", "name")).toBe(false);
  });
  it("発音記号・音節の かけら・わざと まちがえた 形（先生の 台本だけ）", () => {
    expect(wordsOf("/s/ /æ/ sun /ˈhʌndrəd/")).toEqual(["sun"]);
    expect(wordsOf("Hello. / Hola.")).toEqual(["Hello", "Hola"]);
    const teacher = { kind: "mixed" as const, path: "teacher.segments[2].say", strict: false };
    expect(has("Pre-sen-ta-tion. Presentation!", "spelling", teacher)).toBe(false);
    expect(has("Rab, bit. Rabbit! Pic, nic.", "spelling", teacher)).toBe(false);
    expect(has("Today's word part is spect. Respect.", "spelling", teacher)).toBe(false);
    expect(has("A, goed. Or B, went.", "spelling", teacher)).toBe(false);
    expect(has("I goed home.", "spelling")).toBe(true); // 会話では エラー
  });
  it("fragmentOk: となりと つなげて 正しい ことばに なるか", () => {
    const w = makeWordChecker(opts);
    expect(fragmentOk(["Rab", "bit"], 0, w)).toBe(true);
    expect(fragmentOk(["Zzq", "bit"], 0, w)).toBe(false);
  });
});

describe("表現の ルール", () => {
  it("かたい 表現・和製英語・イギリス式の ことば", () => {
    expect(has("I'm fine, thank you. And you?", "stiff-phrase")).toBe(true);
    expect(has("Let's enjoy!", "stiff-phrase")).toBe(true);
    expect(has("Let's enjoy the game!", "stiff-phrase")).toBe(false);
    expect(has("I live in a mansion.", "wasei-eigo")).toBe(true);
    expect(has("Can I have a biscuit?", "uk-word")).toBe(true);
    expect(has("A rubber duck!", "uk-word")).toBe(false);
    expect(has("I have a rice cooker.", "uk-word")).toBe(false);
  });
  it("文法の くせ（error）と、正しい 名詞の つらなりは 見のがす", () => {
    expect(has("I very like dogs.", "grammar-habit")).toBe(true);
    expect(has("I'm boring.", "grammar-habit")).toBe(true);
    expect(has("I go to home.", "grammar-habit")).toBe(true);
    expect(has("I play in Sunday.", "grammar-habit")).toBe(true);
    expect(has("I have a homework.", "grammar-habit")).toBe(true);
    expect(has("I want a apple.", "grammar-habit")).toBe(true);
    expect(has("I want an banana.", "grammar-habit")).toBe(true);
    for (const ok of ["We have a snow festival.", "It's a bread shop.", "See you at the morning assembly.", "An hour. A uniform. An S.", "Collect C, A and T.", "A is a letter."]) {
      expect(has(ok, "grammar-habit"), ok).toBe(false);
    }
  });
  it("きまった 書きかた（Ms. Emma / OK / T-shirt / email / cannot）", () => {
    expect(rulesOf("Hi, Ms Emma!")).toContain("canonical:error");
    expect(rulesOf("Hi, Miss Emma!")).toContain("canonical:error");
    expect(rulesOf("It's ok.")).toContain("canonical:error");
    expect(rulesOf("Okay, let's go.")).toContain("canonical:warn");
    expect(has("Send an e-mail.", "canonical")).toBe(true);
    expect(has("I can not swim.", "canonical")).toBe(true);
    expect(has("Hi, Ms. Emma! It's OK.", "canonical")).toBe(false);
  });
  it("Please ～（教室の めいれい）と 短縮形", () => {
    expect(has("Please sit down.", "please-command", { path: "teacher.segments[1].subtitleEn", strict: false, kind: "line" })).toBe(true);
    expect(has("Please call me Kiki.", "please-command")).toBe(false);
    expect(has("I am happy.", "contraction")).toBe(true);
    expect(has("Yes, I am.", "contraction")).toBe(false);
  });
});

describe("句読点・長さ", () => {
  it("ASCII 以外の 記号・空白・!! ・文末・～", () => {
    expect(has("It’s fun.", "punctuation")).toBe(true);
    expect(has("Hello！", "punctuation")).toBe(true);
    expect(has("Hmm… OK.", "punctuation")).toBe(true);
    expect(has("Hi !", "punctuation")).toBe(true);
    expect(has("Hi!I'm Riko.", "punctuation")).toBe(true);
    expect(has("Wow!!", "punctuation")).toBe(true);
    expect(has("I like dogs", "punctuation")).toBe(true);
    expect(has("I'm ～.", "punctuation")).toBe(true);
    expect(has("I'm ～.", "punctuation", { kind: "pattern", strict: false, path: "school.grammar" })).toBe(false);
    expect(has("Hi! I'm Riko. Nice to meet you, too.", "punctuation")).toBe(false);
  });
  it("文頭の 小文字・代名詞の i", () => {
    expect(has("hello!", "capitalization")).toBe(true);
    expect(has("(whispering) The bus is here.", "capitalization")).toBe(false);
    expect(has("Yes, i like it.", "capitalization")).toBe(true);
    expect(has("p, i, g. pig!", "capitalization", { strict: false, path: "teacher.segments[3].subtitleEn" })).toBe(false);
  });
  it("ステージごとの 1文の 長さ", () => {
    const long = "I like apples and bananas and cats and dogs very much.";
    expect(has(long, "sentence-length", { stage: 1 })).toBe(true);
    expect(has(long, "sentence-length", { stage: 3 })).toBe(false);
  });
});

describe("まとめての チェック", () => {
  it("となりの 重複・Let's の かず・書きかたの ゆれ", () => {
    const issues = lintEntries([
      entry("Hello!", { path: "conversation.lines[0].en" }),
      entry("Hello!", { path: "conversation.lines[1].en" }),
      entry("Let's go! Let's play! Let's eat! Let's sing!", { path: "conversation.lines[2].en" }),
      entry("Me too!", { unit: "L0002", path: "conversation.lines[0].en" }),
      entry("Me, too!", { unit: "L0003", path: "conversation.lines[0].en" }),
      entry("We'll go.", { unit: "L0004", path: "conversation.lines[0].en" }),
      entry("Well, go.", { unit: "L0005", path: "conversation.lines[0].en" }),
    ], opts);
    const rules = issues.map((i) => i.rule);
    expect(rules).toContain("duplicate");
    expect(rules).toContain("lets-overuse");
    const forms = issues.filter((i) => i.rule === "inconsistent-form");
    expect(forms).toHaveLength(1);
    expect(forms[0].message).toContain("me, too");
  });
  it("variantKey: 文の 区切り・… ・― の ちがいは おなじ", () => {
    expect(variantKey("Hi. I'm Riko!").strict).toBe(variantKey("Hi! I'm Riko.").strict);
    expect(variantKey("STEM").strict).toBe("STEM");
  });
  it("latinRuns: 日本語まじりの 文から 英語を ぬきだす", () => {
    expect(latinRuns("まずは ことばだよ。hello. hello は「こんにちは」。")).toEqual(["hello. hello"]);
  });
  it("walkEntries: 日本語の 欄・emoji・id は とばし、種類を きめる", () => {
    const es = walkEntries({ title: "Hi!", titleJa: "やあ", emoji: "👋", vocab: [{ en: "hello", ja: "こんにちは" }], school: { grammar: "I'm ～.", expressions: [{ en: "Hello." }] },
      conversation: { lines: [{ speaker: "Haru", en: "Hi!", ja: "やあ" }] }, teacher: { segments: [{ say: "Hello! こんにちは", subtitleEn: "Hello!", slide: { title: "ことば", items: ["hello"] } }] } },
    { unit: "L0001", stage: 1 });
    const byPath = Object.fromEntries(es.map((e) => [e.path, e.kind]));
    expect(byPath).toEqual({
      title: "label", "vocab[0].en": "item", "school.grammar": "pattern", "school.expressions[0].en": "line", "conversation.lines[0].en": "line",
      "teacher.segments[0].say": "mixed", "teacher.segments[0].subtitleEn": "label", "teacher.segments[0].slide.items[0]": "pattern",
    });
    expect(es.find((e) => e.path === "conversation.lines[0].en")?.strict).toBe(true);
  });
  it("renderMarkdown: 表と ユニットごとの 一覧", () => {
    const es = [entry("I like aplles.")];
    const md = renderMarkdown("L1-1", "レッスン 1", es, lintEntries(es, opts), "2026-11-27");
    expect(md).toContain("| spelling | 1 | 0 | 0 |");
    expect(md).toContain("### L0001");
  });
});

describe("CLI の 部品と 本物の データ", () => {
  it("引数と ファイル名", () => {
    expect(rangeName(parseArgs([]))).toBe("all");
    expect(rangeName(parseArgs(["--from", "1", "--to", "30"]))).toBe("L1-30");
    expect(rangeName(parseArgs(["--from", "31", "--to", "60", "--library"]))).toBe("L31-60+library");
    expect(rangeName(parseArgs(["--library"]))).toBe("library");
  });
  it("1,200 レッスン ぜんぶ・としょかんから 文字列を あつめる", () => {
    const es = collectLessons(1, 1200);
    expect(new Set(es.map((e) => e.lessonNo)).size).toBe(1200);
    expect(es.some((e) => e.path.endsWith("subtitleEn"))).toBe(true);
    expect(collectLibrary().some((e) => e.unit.startsWith("story:"))).toBe(true);
    expect(collectLibrary({ from: 0, to: 0 }).every((e) => e.unit)).toBe(true);
  });
  it("単語リストが 読めて、名前は 大文字で はじまる", () => {
    const wl = loadWordList();
    expect(wl.names).toContain("Birimo");
    expect(wl.names.every((n) => /^[A-Z]/.test(n))).toBe(true);
    expect(wl.allow.get("L1178")?.has("goed")).toBe(true);
  });
  it("スタイルガイドに ルールが ぜんぶ のっている", () => {
    const guide = readFileSync(path.resolve(__dirname, "../docs/english-style-guide.md"), "utf8");
    for (const r of ["spelling", "uk-spelling", "uk-word", "wasei-eigo", "stiff-phrase", "grammar-habit", "please-command", "lets-overuse", "contraction",
      "sentence-length", "punctuation", "capitalization", "name", "canonical", "duplicate", "near-duplicate", "inconsistent-form"]) {
      expect(guide, r).toContain(`| ${r} |`);
    }
  });
});
