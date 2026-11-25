/**
 * 力だめしの 採点（純粋関数。サーバーでも ブラウザ（おためしモード）でも 同じものを 使う）。
 *
 *  - listening / reading: 正解数 ÷ 問題数 → 0〜100
 *  - speaking: 1問 0〜4 点の ルーブリック（長さ・内容（キーワード）・文の かたち（意見の 問題は 理由の つなぎことば））。音読は お手本との 一致率
 *  - writing: words（ステージ1）は つづり 1つ 1点。文・メール・意見文は 内容・長さ・まとまり・書きかたの 4 観点 × 0〜2 点（8 点満点）
 *    （AI が 使えるときは サーバーで AI の ルーブリック採点に おきかえる → aiScoring.ts。ここは その フォールバック）
 *  - 合計: YEARLY_RULES.weights の 重みつき平均（スピーキングが いちばん 重い）
 *  - 推定 CEFR バンド: ステージごとの 表（BAND_TABLE）＋ スピーキングの 条件
 *  - ちから スコア: ステージを こえて のびを くらべる 目もり
 */
import { YEARLY_RULES } from "@/lib/domain/config";
import type {
  ChoiceItem, RubricScore, SkillScores, SpeakingPrompt, WritingTask, YearlyAnswers, YearlyGrowth, YearlyResult, YearlyTest,
} from "./types";

// ---------------------------------------------------------------------------
// CEFR バンド
// ---------------------------------------------------------------------------
export { BAND_LADDER, BAND_EIKEN_JA, BAND_CAN_DO_JA, bandIndex, type Band } from "./labels";
import { bandIndex, type Band } from "./labels";

/**
 * ステージごとの バンドの 表（上から。合計点が min 以上なら その バンド）。
 * いちばん上の バンドは そのステージの ねらいを こえた「先どり」。2 番目が ねらいどおり。
 */
export const BAND_TABLE: Readonly<Record<number, readonly { band: Band; min: number }[]>> = {
  1: [{ band: "A1+", min: 90 }, { band: "A1", min: 65 }, { band: "Pre-A1", min: 0 }],
  2: [{ band: "A2", min: 85 }, { band: "A1+", min: 60 }, { band: "A1", min: 35 }, { band: "Pre-A1", min: 0 }],
  3: [{ band: "A2+", min: 85 }, { band: "A2", min: 60 }, { band: "A1+", min: 35 }, { band: "A1", min: 0 }],
  4: [{ band: "B1", min: 85 }, { band: "A2+", min: 60 }, { band: "A2", min: 35 }, { band: "A1+", min: 0 }],
  5: [{ band: "B2", min: 92 }, { band: "B1+", min: 75 }, { band: "B1", min: 55 }, { band: "A2+", min: 30 }, { band: "A2", min: 0 }],
};

export function estimateBand(stage: number, scores: SkillScores): Band {
  const table = BAND_TABLE[stage] ?? BAND_TABLE[1];
  const total = weightedTotal(scores);
  let i = table.findIndex((row) => total >= row.min);
  if (i < 0) i = table.length - 1;
  // スピーキングの 条件: いちばん上の バンドは スピーキングも そこそこ できること
  if (i === 0 && scores.speaking < YEARLY_RULES.speakingTopBandMin) i = 1;
  // 話す 力が とても ひくい ときは 1 段 さげる（会話の 力を いちばん だいじに する）
  if (scores.speaking < YEARLY_RULES.speakingLowDrop) i = Math.min(table.length - 1, i + 1);
  return table[i].band;
}

// ---------------------------------------------------------------------------
// 合計・ちから スコア・のび
// ---------------------------------------------------------------------------
const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)));

export function weightedTotal(s: SkillScores): number {
  const w = YEARLY_RULES.weights;
  return clampPct(s.listening * w.listening + s.reading * w.reading + s.speaking * w.speaking + s.writing * w.writing);
}

/** (ステージ − 1) × 150 ＋ 点数 × 2（ステージ1 の 満点 200 ＝ ステージ2 の 25 点） */
export const scaledScore = (stage: number, pct: number) => (Math.max(1, stage) - 1) * YEARLY_RULES.scaledStageOffset + clampPct(pct) * YEARLY_RULES.scaledPerPercent;

export function scaledScores(stage: number, s: SkillScores): SkillScores & { total: number } {
  return {
    listening: scaledScore(stage, s.listening),
    reading: scaledScore(stage, s.reading),
    speaking: scaledScore(stage, s.speaking),
    writing: scaledScore(stage, s.writing),
    total: scaledScore(stage, weightedTotal(s)),
  };
}

export function growthBetween(prev: Pick<YearlyResult, "takenOn" | "stage" | "band" | "scaled">, cur: Pick<YearlyResult, "band" | "scaled">): YearlyGrowth {
  const d = (k: keyof YearlyResult["scaled"]) => cur.scaled[k] - prev.scaled[k];
  return {
    previousTakenOn: prev.takenOn,
    previousStage: prev.stage,
    previousBand: prev.band,
    delta: { listening: d("listening"), reading: d("reading"), speaking: d("speaking"), writing: d("writing"), total: d("total") },
    bandSteps: bandIndex(cur.band) - bandIndex(prev.band),
  };
}

// ---------------------------------------------------------------------------
// listening / reading
// ---------------------------------------------------------------------------
export function gradeChoices(items: readonly ChoiceItem[], answers: Readonly<Record<string, number>>): { percent: number; correct: number; results: Record<string, boolean> } {
  const results: Record<string, boolean> = {};
  let correct = 0;
  for (const it of items) {
    const ok = answers[it.id] === it.answer;
    results[it.id] = ok;
    if (ok) correct++;
  }
  return { percent: items.length ? clampPct((correct / items.length) * 100) : 0, correct, results };
}

// ---------------------------------------------------------------------------
// ことばの 処理
// ---------------------------------------------------------------------------
/** 英語の ことば（小文字・記号なし）。日本語などは すてる */
export function englishWords(text: string): string[] {
  return (text.normalize("NFKC").toLowerCase().replace(/[’‘`]/g, "'").match(/[a-z]+(?:'[a-z]+)?/g) ?? []);
}

/** キーワードが いくつ 出てきたか（like → likes / liked も みとめる。2 語の キーワードは そのまま さがす） */
export function keywordHits(text: string, keywords: readonly string[]): number {
  const words = englishWords(text);
  const joined = ` ${words.join(" ")} `;
  let n = 0;
  for (const raw of keywords) {
    const k = raw.toLowerCase().trim();
    if (!k) continue;
    if (k.includes(" ")) { if (joined.includes(` ${k} `)) n++; continue; }
    if (words.some((w) => w === k || (k.length >= 3 && (w === `${k}s` || w === `${k}es` || w === `${k}ed` || w === `${k}d` || w === `${k}ing` || w === `${k.replace(/e$/, "")}ing`)))) n++;
  }
  return n;
}

const SUBJECT = /\b(i|i'm|you|we|they|he|she|it|it's|there|my|this|that|the|people|children|kids|someone)\b/;
const VERB = /\b(am|is|are|was|were|be|been|have|has|had|do|does|did|can|could|will|would|should|must|like|likes|liked|want|wants|play|plays|played|go|goes|went|think|thinks|eat|eats|ate|see|saw|make|made|get|got|love|loves|enjoy|enjoyed|help|helps|need|needs|feel|felt|[a-z]+ed|[a-z]{3,}s|i'm|it's|they're|we're|he's|she's|there's|i'll|i've)\b/;
/** 主語と 動詞が ある「文」に なっているか（ざっくり） */
export function hasClause(text: string): boolean {
  const t = ` ${englishWords(text).join(" ")} `;
  return SUBJECT.test(t) && VERB.test(t);
}

const REASON = /\b(because|so|since|for example|for instance|such as|first|second|also|but|however|that's why|if)\b/;
export const hasReason = (text: string) => REASON.test(englishWords(text).join(" "));

/** 音読: お手本の ことばが どれだけ 読めたか（0〜1。順番は とわない・同じ ことばは 回数ぶん） */
export function readAloudMatch(target: string, transcript: string): number {
  const want = englishWords(target);
  if (!want.length) return 0;
  const have = new Map<string, number>();
  for (const w of englishWords(transcript)) have.set(w, (have.get(w) ?? 0) + 1);
  let hit = 0;
  for (const w of want) {
    const c = have.get(w) ?? 0;
    if (c > 0) { hit++; have.set(w, c - 1); }
  }
  return hit / want.length;
}

// ---------------------------------------------------------------------------
// speaking（ルール採点）
// ---------------------------------------------------------------------------
export const SPEAKING_MAX = 4;

export function scoreSpeakingRule(p: SpeakingPrompt, text: string): RubricScore {
  const r = (score: number, commentJa: string): RubricScore => ({ score, max: SPEAKING_MAX, commentJa });
  const words = englishWords(text);
  if (p.kind === "readAloud") {
    const m = readAloudMatch(p.readText ?? p.sample, text);
    if (m >= 0.9) return r(4, "はっきり 読めたね！ すばらしい！");
    if (m >= 0.75) return r(3, "よく 読めたよ。あと すこしで かんぺき！");
    if (m >= 0.5) return r(2, "半分 いじょう 読めたよ。ゆっくり 1語ずつ 読んでみよう。");
    if (m >= 0.25) return r(1, "すこし 読めたね。いっしょに 音読の れんしゅうを しよう。");
    return r(0, words.length ? "お手本を 見ながら もういちど 読んでみよう。" : "こえが きこえなかったよ。");
  }
  if (words.length === 0) return r(0, "こえが きこえなかったよ。つぎは ひとことでも 言ってみよう！");
  const length = words.length >= p.minWords ? 2 : words.length >= Math.ceil(p.minWords / 2) ? 1 : 0;
  const content = keywordHits(text, p.keywords) >= 1 ? 1 : 0;
  const opinion = p.kind === "opinion" || p.kind === "followUp";
  const structure = opinion ? (hasClause(text) && hasReason(text) ? 1 : 0) : hasClause(text) ? 1 : 0;
  const score = length + content + structure;
  const tips: string[] = [];
  if (length < 2) tips.push("もうすこし ながく 話してみよう");
  if (!content) tips.push("しつもんに あう ことばを 入れよう");
  if (!structure) tips.push(opinion ? "because（なぜなら）で 理由を 言おう" : "I like ～. のような 文で 言ってみよう");
  return r(score, score >= 4 ? "しっかり 伝わったよ！ すばらしい！" : tips.length ? `${score >= 2 ? "いいね！" : "がんばったね！"} ${tips[0]}。` : "いいね！");
}

// ---------------------------------------------------------------------------
// writing（ルール採点）
// ---------------------------------------------------------------------------
export const WRITING_TEXT_MAX = 8;

export function writingMax(task: WritingTask): number {
  return task.kind === "words" ? (task.items?.length ?? 0) : WRITING_TEXT_MAX;
}

/** 文に わける（. ! ? で 区切る。さいごの 記号なしの 文も 1 文） */
export function sentencesOf(text: string): string[] {
  return (text.normalize("NFKC").match(/[^.!?]+[.!?]*/g) ?? []).map((s) => s.trim()).filter((s) => englishWords(s).length > 0);
}

/** 書きかた: 文の はじめが 大文字・おわりに 記号・I が 大文字 の 割合 */
export function mechanicsRatio(text: string): number {
  const ss = sentencesOf(text);
  if (!ss.length) return 0;
  let ok = 0;
  for (const s of ss) {
    const cap = /^[^A-Za-z]*[A-Z]/.test(s);
    const end = /[.!?]$/.test(s);
    const i = !/(^|[^A-Za-z'])i([^A-Za-z']|'m|$)/.test(s);
    ok += (Number(cap) + Number(end) + Number(i)) / 3;
  }
  return ok / ss.length;
}

export function scoreWritingRule(task: WritingTask, answers: Pick<YearlyAnswers, "writingText" | "writingWords">): RubricScore & { text: string } {
  if (task.kind === "words") {
    const items = task.items ?? [];
    const given = items.map((_, i) => (answers.writingWords?.[i] ?? "").normalize("NFKC").trim().toLowerCase().replace(/[^a-z]/g, ""));
    const score = items.filter((it, i) => given[i] === it.answer).length;
    const commentJa = score === items.length ? "ぜんぶ 正しく 書けたね！" : score > 0 ? "よく がんばったね！ つづりを もういちど 見てみよう。" : "音を ゆっくり 言いながら 書いてみよう。";
    return { score, max: items.length, commentJa, text: given.join(" / ") };
  }
  const text = (answers.writingText ?? "").slice(0, YEARLY_RULES.answerMaxChars);
  const words = englishWords(text);
  const min = task.minWords ?? 10;
  const max = task.maxWords ?? min * 2;
  if (words.length === 0) return { score: 0, max: WRITING_TEXT_MAX, commentJa: "まだ 書いていないよ。1文でも 書いてみよう！", text };
  const hits = keywordHits(text, task.keywords ?? []);
  const content = hits >= 2 ? 2 : hits === 1 ? 1 : 0;
  let length = words.length >= min ? 2 : words.length >= Math.ceil(min / 2) ? 1 : 0;
  if (words.length > max * 1.3) length = Math.min(length, 1);
  const target = task.kind === "sentences" ? task.targetSentences ?? 3 : task.kind === "email" ? 4 : 3;
  const ss = sentencesOf(text);
  let organization = ss.length >= target ? 2 : ss.length >= Math.ceil(target / 2) ? 1 : 0;
  if (task.kind === "opinion" && !hasReason(text)) organization = Math.min(organization, 1);
  const m = mechanicsRatio(text);
  const mechanics = m >= 0.8 ? 2 : m >= 0.5 ? 1 : 0;
  const score = content + length + organization + mechanics;
  const tips: string[] = [];
  if (content < 2) tips.push(task.kind === "email" ? "メールの しつもんに こたえよう" : "テーマに あう ことばを 入れよう");
  if (length < 2) tips.push(words.length > max * 1.3 ? `${max} 語くらいに まとめよう` : `${min} 語くらい 書いてみよう`);
  if (organization < 2) tips.push(task.kind === "opinion" ? "意見 → 理由（because）→ まとめ の じゅんに 書こう" : `${target} 文くらいに してみよう`);
  if (mechanics < 2) tips.push("文の はじめは 大文字、おわりは ピリオド");
  return { score, max: WRITING_TEXT_MAX, commentJa: score >= 7 ? "とても よく 書けたね！" : `${score >= 4 ? "いいね！" : "がんばったね！"} ${tips[0] ?? ""}。`, text };
}

// ---------------------------------------------------------------------------
// ぜんぶ まとめる
// ---------------------------------------------------------------------------
export interface OpenScores {
  speaking: Record<string, RubricScore>;
  writing: RubricScore;
  gradedBy: "rule" | "ai";
}

/** スピーキング・ライティングを ルールで 採点（AI が 使えない ときの 結果） */
export function ruleOpenScores(test: YearlyTest, answers: YearlyAnswers): OpenScores {
  const speaking: Record<string, RubricScore> = {};
  for (const p of test.speaking.prompts) speaking[p.id] = scoreSpeakingRule(p, answers.speaking[p.id] ?? "");
  const { text: _t, ...writing } = scoreWritingRule(test.writing, answers);
  return { speaking, writing, gradedBy: "rule" };
}

const pctOf = (score: number, max: number) => (max > 0 ? clampPct((score / max) * 100) : 0);

/** こたえを きれいに する（長すぎる・へんな 値を おとす）。サーバーでも ブラウザでも 同じ */
export function sanitizeAnswers(test: YearlyTest, raw: Partial<YearlyAnswers> | null | undefined): YearlyAnswers {
  const choices: Record<string, number> = {};
  for (const it of [...test.listening, ...test.reading]) {
    const v = raw?.choices?.[it.id];
    if (Number.isInteger(v) && (v as number) >= 0 && (v as number) < it.choices.length) choices[it.id] = v as number;
  }
  const speaking: Record<string, string> = {};
  for (const p of test.speaking.prompts) {
    const v = raw?.speaking?.[p.id];
    if (typeof v === "string" && v.trim()) speaking[p.id] = v.trim().slice(0, 400);
  }
  const words = Array.isArray(raw?.writingWords) ? raw.writingWords.slice(0, 5).map((w) => (typeof w === "string" ? w.slice(0, 30) : "")) : undefined;
  const text = typeof raw?.writingText === "string" ? raw.writingText.slice(0, YEARLY_RULES.answerMaxChars) : undefined;
  return { choices, speaking, writingText: text, writingWords: words };
}

export function buildResult(test: YearlyTest, answers: YearlyAnswers, takenOn: string, open: OpenScores = ruleOpenScores(test, answers)): YearlyResult {
  const L = gradeChoices(test.listening, answers.choices);
  const R = gradeChoices(test.reading, answers.choices);
  let spScore = 0;
  let spMax = 0;
  const speakingDetail: YearlyResult["detail"]["speaking"] = {};
  for (const p of test.speaking.prompts) {
    const s = open.speaking[p.id] ?? scoreSpeakingRule(p, answers.speaking[p.id] ?? "");
    spScore += s.score;
    spMax += s.max;
    speakingDetail[p.id] = { ...s, text: answers.speaking[p.id] ?? "" };
  }
  const wText = test.writing.kind === "words" ? (answers.writingWords ?? []).join(" / ") : answers.writingText ?? "";
  const scores: SkillScores = {
    listening: L.percent,
    reading: R.percent,
    speaking: pctOf(spScore, spMax),
    writing: pctOf(open.writing.score, open.writing.max),
  };
  return {
    stage: test.stage,
    takenOn,
    scores,
    total: weightedTotal(scores),
    band: estimateBand(test.stage, scores),
    scaled: scaledScores(test.stage, scores),
    gradedBy: open.gradedBy,
    detail: { choices: { ...L.results, ...R.results }, speaking: speakingDetail, writing: { ...open.writing, text: wText } },
  };
}
