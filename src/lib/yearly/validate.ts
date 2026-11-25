/**
 * 力だめしの 問題データの チェック（tests/yearly.test.ts・scripts/yearly-check.ts）。
 * 数・形式・選択肢・正解の 位置・英語と 日本語・個人情報を きかない こと を みる。
 */
import { yearlySpec } from "./spec";
import type { ChoiceItem, YearlyTest } from "./types";

const JA = /[぀-ヿ㐀-鿿]/;
const LATIN = /[A-Za-z]/;
/** 個人情報を きく ことば（AI の しけんかんは 本名・年齢・住所・学校名などを きかない） */
export const PERSONAL_INFO = /\b(your (full |real )?name|address|what school|which school|name of your school|phone|e-?mail address|how old|your birthday|where do you live)\b/i;

export function validateChoiceItem(item: ChoiceItem, test: Pick<YearlyTest, "stage" | "passages">, skill: "listening" | "reading"): string[] {
  const spec = yearlySpec(test.stage);
  const e: string[] = [];
  const at = (m: string) => e.push(`${item.id}: ${m}`);
  const prefix = skill === "listening" ? "l" : "r";
  if (!new RegExp(`^y${test.stage}-${prefix}\\d{2}$`).test(item.id)) at(`id の 形（y${test.stage}-${prefix}01 のように）`);
  if (item.skill !== skill) at(`skill が ${skill} では ない`);
  const formats: readonly string[] = skill === "listening" ? spec.listeningFormats : spec.readingFormats;
  if (!formats.includes(item.format)) at(`format ${item.format} は ステージ${test.stage} の ${skill} に ない`);
  if (!spec.choiceCounts.includes(item.choices.length)) at(`選択肢の 数 ${item.choices.length}（${spec.choiceCounts.join(" か ")}）`);
  if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer >= item.choices.length) at("answer が 範囲の 外");
  if (new Set(item.choices.map((c) => c.trim().toLowerCase())).size !== item.choices.length) at("選択肢が かさなっている");
  if (item.choices.some((c) => !c.trim() || JA.test(c))) at("選択肢が からっぽ か 日本語");
  if (item.promptJa != null && test.stage >= 3) at("ステージ3 以上は 日本語の ヒントを 出さない");
  if (item.promptJa != null && !JA.test(item.promptJa)) at("promptJa に 日本語が ない");
  if (item.prompt && JA.test(item.prompt)) at("prompt に 日本語");

  if (skill === "listening") {
    if (!item.audio?.length) at("listening に audio が ない");
    for (const l of item.audio ?? []) if (!l.en.trim() || JA.test(l.en) || !["A", "B", "N"].includes(l.speaker)) at("audio の 行");
    if (item.format === "picture") {
      if (item.choices.some((c) => LATIN.test(c))) at("picture の 選択肢は 絵文字だけ");
      if (!item.alt || item.alt.length !== item.choices.length || item.alt.some((a) => !a.trim() || JA.test(a))) at("picture には 選択肢と おなじ 数の alt（英語）");
    } else if (item.choices.some((c) => !LATIN.test(c))) at("選択肢は 英語");
    if ((item.format === "dialog" || item.format === "passage") && !item.prompt?.trim()) at(`${item.format} には しつもん（prompt）が いる`);
    if (item.format === "dialog" && (item.audio?.length ?? 0) < 2) at("dialog の 会話は 2 行 以上");
    if (item.passageId) at("listening に passageId は いらない");
  } else {
    if (item.audio) at("reading に audio は いらない");
    if (!item.prompt?.trim()) at("reading には prompt が いる");
    if (item.format === "text") {
      if (!item.passageId || !test.passages.some((p) => p.id === item.passageId)) at("text の passageId が ない");
    } else if (item.passageId) at("text 以外に passageId は いらない");
    if ((item.format === "vocab" || item.format === "grammar" || item.format === "conversation") && !item.prompt?.includes("( )")) at("あなうめは prompt に ( ) を 入れる");
    if (item.choices.some((c) => !LATIN.test(c))) at("選択肢は 英語");
  }
  return e;
}

export function validateYearlyTest(test: YearlyTest): string[] {
  const spec = yearlySpec(test.stage);
  const e: string[] = [];
  const at = (m: string) => e.push(`stage ${test.stage}: ${m}`);
  if (spec.stage !== test.stage) at("その ステージの 形が ない");
  if (test.minutes !== spec.minutes) at(`minutes は ${spec.minutes}`);
  if (!test.titleJa || !test.levelJa) at("titleJa / levelJa が ない");
  if (!["haru", "riko", "kiko", "birimo"].includes(test.character)) at("character");
  if (test.listening.length !== spec.listening) at(`listening は ${spec.listening} 問（いま ${test.listening.length}）`);
  if (test.reading.length !== spec.reading) at(`reading は ${spec.reading} 問（いま ${test.reading.length}）`);
  for (const it of test.listening) e.push(...validateChoiceItem(it, test, "listening"));
  for (const it of test.reading) e.push(...validateChoiceItem(it, test, "reading"));

  const ids = [...test.listening, ...test.reading].map((i) => i.id);
  if (new Set(ids).size !== ids.length) at("問題の id が かさなっている");
  for (const p of test.passages) {
    if (!p.title || p.lines.length < 3 || p.lines.some((l) => !l.trim() || JA.test(l))) at(`文章 ${p.id}: title と 英語の 行（3 行 以上）`);
    if (!test.reading.some((r) => r.passageId === p.id)) at(`文章 ${p.id} の しつもんが ない`);
  }

  // 正解の 位置が かたよらない（どの 位置も 15% 以上・50% 以下）
  const all = [...test.listening, ...test.reading];
  const maxChoices = Math.max(...all.map((i) => i.choices.length));
  const pos = Array.from({ length: maxChoices }, () => 0);
  for (const i of all) pos[i.answer]++;
  for (const [i, n] of pos.entries()) {
    if (i >= 3 && maxChoices === 3) continue;
    const share = n / all.length;
    if (share < 0.15 || share > 0.5) at(`正解の 位置 ${i + 1} が ${Math.round(share * 100)}%（かたよっている）`);
  }

  // スピーキング
  const sp = test.speaking;
  if (!sp.introEn || JA.test(sp.introEn) || !JA.test(sp.introJa)) at("speaking の introEn / introJa");
  const [minP, maxP] = spec.speakingPrompts;
  if (sp.prompts.length < minP || sp.prompts.length > maxP) at(`speaking は ${minP}〜${maxP} 問`);
  for (const k of spec.speakingMust) if (!sp.prompts.some((p) => p.kind === k)) at(`speaking に ${k} が ない`);
  for (const p of sp.prompts) {
    const pa = (m: string) => at(`${p.id}: ${m}`);
    if (!new RegExp(`^y${test.stage}-s\\d$`).test(p.id)) pa("id の 形（y1-s1 のように）");
    if (!p.askEn.trim() || JA.test(p.askEn) || !JA.test(p.askJa)) pa("askEn / askJa");
    if (PERSONAL_INFO.test(p.askEn)) pa("個人情報を きいている");
    if (p.kind === "picture" && (!p.picture?.emoji || !p.picture.descriptionEn)) pa("picture に 絵が ない");
    if (p.kind === "readAloud" && (!p.readText || p.readText.split(/\s+/).length < 8)) pa("readAloud の 文（8 語 以上）");
    if (p.kind !== "readAloud" && p.keywords.length < 2) pa("keywords は 2 つ以上");
    if (!(p.minWords >= 1) || !p.sample.trim() || JA.test(p.sample)) pa("minWords / sample");
    if (p.keywords.some((k) => JA.test(k) || k !== k.toLowerCase())) pa("keywords は 小文字の 英語");
  }
  const sids = sp.prompts.map((p) => p.id);
  if (new Set(sids).size !== sids.length) at("speaking の id が かさなっている");

  // ライティング
  const w = test.writing;
  if (w.kind !== spec.writing) at(`writing は ${spec.writing}`);
  if (!w.promptEn || JA.test(w.promptEn) || !JA.test(w.promptJa) || !w.sample.trim()) at("writing の promptEn / promptJa / sample");
  if (PERSONAL_INFO.test(w.promptEn)) at("writing が 個人情報を きいている");
  if (w.kind === "words") {
    if (!w.items || w.items.length !== 3) at("words は 3 つ");
    for (const it of w.items ?? []) if (!/^[a-z]+$/.test(it.answer) || !it.emoji || LATIN.test(it.emoji) || !JA.test(it.hintJa)) at(`words の ${it.answer}`);
  } else {
    if (!(w.minWords && w.maxWords && w.minWords < w.maxWords)) at("minWords < maxWords");
    if (!w.keywords || w.keywords.length < 2) at("writing の keywords は 2 つ以上");
    if (w.kind === "email" && (!w.email || w.email.length < 3 || w.email.some((l) => JA.test(l)))) at("email の 本文");
    if (w.kind === "sentences" && !w.targetSentences) at("targetSentences が ない");
  }
  return e;
}
