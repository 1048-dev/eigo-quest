/**
 * レッスンさいごの「AIキャラとの かいわ」— 台本ベースのフォールバックエンジン（純粋関数）。
 *
 * - ANTHROPIC_API_KEY が無いとき・AI がエラーのとき、サーバーはこのエンジンで返事を作る。
 * - サーバーに つながらないときは、クライアントも同じエンジンで返事を作る（子どもを止めない）。
 * - 返事は lesson.conversation.lines（オリジナルの台本）から、かんたんなキーワード一致で えらぶ。
 * - 子どもの名前などの個人情報は くりかえさない（オウム返ししない）。
 */
import type { LessonConversation } from "@/lib/domain/types";

export const MAX_CONVERSATION_TURNS = 6;

export type ConversationCharacter = "haru" | "riko" | "kiko" | "birimo";
export const CONVERSATION_CHARACTERS: readonly ConversationCharacter[] = ["haru", "riko", "kiko", "birimo"];
export const CHARACTER_NAME: Record<ConversationCharacter, string> = { haru: "Haru", riko: "Riko", kiko: "Kiko", birimo: "Birimo" };

const byName = (name: string): ConversationCharacter | undefined =>
  CONVERSATION_CHARACTERS.find((c) => CHARACTER_NAME[c].toLowerCase() === name.trim().toLowerCase());

/**
 * そのレッスンの かいわ相手（Haru → Riko → Kiko → Birimo の じゅんばんで レッスンごとに かわる）。
 *  1. さいしょの ひとことが「I'm Haru.」のような 自己紹介なら、その キャラ（セリフと 話し手を そろえる）
 *  2. その回の 台本で 話している キャラの 中から えらぶ（Ms. Emma は 先生なので かいわ相手に しない）
 *     - じゅんばんの キャラが 台本に いれば その キャラ、いなければ 台本の キャラを じゅんばんに
 *     - ひとことの 中で 3人称で 出てくる キャラ（"Birimo's birthday", "Haru says"）は 相手に しない
 *  3. 台本に だれも いなければ じゅんばんの キャラ
 */
export function pickConversationPartner(lessonNo: number, conv: LessonConversation | null | undefined): ConversationCharacter {
  const n = Number.isInteger(lessonNo) && lessonNo > 0 ? lessonNo : 1;
  const turn = CONVERSATION_CHARACTERS[(n - 1) % CONVERSATION_CHARACTERS.length];
  if (!conv) return turn;
  const starter = conv.aiTask?.starterEn ?? "";
  const self = /\bI'?m ([A-Z][a-z]+)\b/.exec(starter);
  const selfChar = self ? byName(self[1]) : undefined;
  if (selfChar) return selfChar;
  const mentioned = new Set(CONVERSATION_CHARACTERS.filter((c) => new RegExp(`\\b${CHARACTER_NAME[c]}\\b`).test(starter)));
  const speakers: ConversationCharacter[] = [];
  for (const line of conv.lines ?? []) {
    const c = byName(line.speaker ?? "");
    if (c && !speakers.includes(c)) speakers.push(c);
  }
  const ok = speakers.filter((c) => !mentioned.has(c));
  const pool = ok.length > 0 ? ok : speakers;
  if (pool.length === 0) return turn;
  if (pool.includes(turn)) return turn;
  // 台本に いる キャラを、じゅんばん（Haru → Riko → Kiko → Birimo）に ならべて レッスン番号で まわす
  const ordered = CONVERSATION_CHARACTERS.filter((c) => pool.includes(c));
  return ordered[(n - 1) % ordered.length];
}

export interface ConversationTurn {
  role: "ai" | "child";
  text: string;
}

export interface ConversationReply {
  replyEn: string;
  replyJa: string;
  /** 子どもが つぎに 言えそうな ことば（タップで えらべる） */
  suggestions: string[];
  /** 子どもの ことばに 目標表現が入っていた */
  usedTarget: boolean;
  /** これで かいわ おしまい */
  done: boolean;
  /** 子どもが 話した回数（今回をふくむ） */
  turn: number;
  maxTurns: number;
  source: "ai" | "script";
}

// ---------------------------------------------------------------------------
// 文字列ユーティリティ
// ---------------------------------------------------------------------------
export function normalizeWords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/[^a-z0-9' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

const STOPWORDS = new Set(["a", "an", "the", "is", "are", "am", "i", "you", "it", "to", "and", "too", "this", "that", "my", "your", "do", "me", "so", "oh", "of", "in", "on"]);
const contentWords = (s: string) => normalizeWords(s).filter((w) => !STOPWORDS.has(w));

/** 目標表現 "I'm ～." → ["i'm"]、"Nice to meet you." → ["nice","to","meet","you"]（～ より前の部分） */
export function targetStem(expr: string): string[] {
  const head = expr.split(/[～~＿_]|\.\.\./)[0] ?? "";
  const stem = normalizeWords(head);
  return stem.length > 0 ? stem : normalizeWords(expr);
}

function containsSequence(words: string[], seq: string[]): boolean {
  if (seq.length === 0) return false;
  outer: for (let i = 0; i + seq.length <= words.length; i++) {
    for (let j = 0; j < seq.length; j++) if (words[i + j] !== seq[j]) continue outer;
    return true;
  }
  return false;
}

/** 子どもの ことばに 目標表現のどれかが入っているか（大文字・記号は気にしない） */
export function usedTargets(childText: string, targets: string[]): string[] {
  const w = normalizeWords(childText);
  // "I am" は "I'm" と同じあつかい
  const expanded = normalizeWords(childText.replace(/\b(i)\s+am\b/gi, "i'm").replace(/\bit\s+is\b/gi, "it's"));
  return targets.filter((t) => {
    const stem = targetStem(t);
    return containsSequence(w, stem) || containsSequence(expanded, stem);
  });
}

/** 個人情報っぽいもの（3けた以上の数字・メール・URL）を伏せる。AI に送る前と記録の前に使う */
export function redactPersonalInfo(s: string): string {
  return s
    .replace(/\S+@\S+/g, "***")
    .replace(/https?:\/\/\S+/gi, "***")
    .replace(/\d[\d\- ]{2,}\d/g, "***")
    .slice(0, 200);
}

/** "I'm ～." のような目標表現を、台本の中の具体的な文に置きかえる（タップ候補・お手本用） */
export function concreteTarget(expr: string, conv: LessonConversation): string {
  if (!/[～~＿_]|\.\.\./.test(expr)) return expr;
  const stem = targetStem(expr);
  for (const l of conv.lines) {
    if (containsSequence(normalizeWords(l.en), stem)) {
      // 文が2つ以上なら、目標表現をふくむ文だけ取り出す
      const sentences = l.en.match(/[^.!?]+[.!?]?/g) ?? [l.en];
      const hit = sentences.find((s) => containsSequence(normalizeWords(s), stem));
      return (hit ?? l.en).trim();
    }
  }
  return expr.replace(/[～~＿_]+/g, "...").trim();
}

// ---------------------------------------------------------------------------
// 候補（タップで えらぶ ことば）
// ---------------------------------------------------------------------------
export function buildSuggestions(conv: LessonConversation, history: ConversationTurn[], max = 3): string[] {
  const said = history.filter((t) => t.role === "child").map((t) => t.text);
  const targets = conv.aiTask.targetExpressions;
  const notYet = targets.filter((t) => usedTargets(said.join(" . "), [t]).length === 0);
  const ordered = [...notYet, ...targets.filter((t) => !notYet.includes(t))];
  const out: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
  };
  for (const t of ordered) push(concreteTarget(t, conv));
  // 目標表現が少ないレッスンは、台本の短い文で おぎなう
  for (const l of conv.lines) if (normalizeWords(l.en).length <= 6) push(l.en);
  return out.slice(0, max);
}

// ---------------------------------------------------------------------------
// 返事をえらぶ
// ---------------------------------------------------------------------------
const PRAISE = ["Great!", "Nice!", "Good job!", "Wonderful!", "Cool!"];
const PRAISE_JA: Record<string, string> = { "Great!": "すごい！", "Nice!": "いいね！", "Good job!": "よくできたね！", "Wonderful!": "すばらしい！", "Cool!": "かっこいい！" };
const CLOSING = { en: "That was fun! Bye-bye! See you!", ja: "たのしかった！ バイバイ！ またね！" };
const ENCOURAGE = { en: "Let's try together!", ja: "いっしょに いってみよう！" };

export interface ScriptedInput {
  conversation: LessonConversation;
  history: ConversationTurn[];
  childText: string;
  maxTurns?: number;
}

/** AI キャラの さいしょの ひとこと */
export function starterLine(conv: LessonConversation | null | undefined, character: ConversationCharacter = "haru"): string {
  const s = conv?.aiTask.starterEn?.trim();
  if (s) return s;
  return `Hello! I'm ${CHARACTER_NAME[character]}. Let's talk!`;
}

export function scriptedReply(input: ScriptedInput): ConversationReply {
  const { conversation: conv, history } = input;
  const maxTurns = Math.max(1, Math.min(MAX_CONVERSATION_TURNS, input.maxTurns ?? MAX_CONVERSATION_TURNS));
  const childText = redactPersonalInfo(input.childText ?? "").trim();
  const turn = history.filter((t) => t.role === "child").length + 1;
  const hits = usedTargets(childText, conv.aiTask.targetExpressions);
  const usedTarget = hits.length > 0;
  const nextHistory: ConversationTurn[] = [...history, { role: "child", text: childText }];
  const suggestions = buildSuggestions(conv, nextHistory);
  const praise = PRAISE[(turn - 1) % PRAISE.length];

  if (turn >= maxTurns) {
    return {
      replyEn: usedTarget ? `${praise} ${CLOSING.en}` : CLOSING.en,
      replyJa: usedTarget ? `${PRAISE_JA[praise]} ${CLOSING.ja}` : CLOSING.ja,
      suggestions: [], usedTarget, done: true, turn, maxTurns, source: "script",
    };
  }

  // 何も言えなかった・聞きとれなかった → お手本を見せる
  if (contentWords(childText).length === 0 && normalizeWords(childText).length === 0) {
    const model = suggestions[0] ?? concreteTarget(conv.aiTask.targetExpressions[0] ?? "Hello!", conv);
    return { replyEn: `${ENCOURAGE.en} Say, "${model}"`, replyJa: `${ENCOURAGE.ja}「${model}」`, suggestions, usedTarget: false, done: false, turn, maxTurns, source: "script" };
  }

  // 台本の中で、子どものことばに いちばん近い行をさがし、その「つぎの行」を返事にする
  const aiSaid = new Set(history.filter((t) => t.role === "ai").map((t) => t.text.toLowerCase()));
  const childWords = new Set(normalizeWords(childText));
  const childContent = new Set(contentWords(childText));
  // 子どもが 2つの 文を 言ったとき（"Hello! I'm Ken."）は、台本の いちばん 先まで すすんだ 行に あわせる
  // （さいしょの "Hello!" に あわせると 返事が "Hi!" だけに なり、かいわが すすまない）
  let bestIdx = -1;
  let bestScore = 0;
  const contentIdx: number[] = [];
  conv.lines.forEach((l, i) => {
    const lw = normalizeWords(l.en);
    if (lw.length === 0) return;
    const content = lw.filter((w) => !STOPWORDS.has(w));
    const contentHits = content.filter((w) => childContent.has(w)).length;
    const score = contentHits * 2 + lw.filter((w) => childWords.has(w)).length / lw.length;
    if (score > bestScore) { bestScore = score; bestIdx = i; }
    if (contentHits > 0) contentIdx.push(i);
  });

  const aiSaidList = [...aiSaid];
  const unused = (i: number) => {
    const en = conv.lines[i]?.en.trim().toLowerCase();
    return !!en && !aiSaidList.some((s) => s === en || s.endsWith(` ${en}`));
  };
  const hasNext = (i: number) => conv.lines.some((_, j) => j > i && unused(j));
  const furthest = [...contentIdx].reverse().find(hasNext);
  if (furthest !== undefined && furthest > bestIdx && hasNext(furthest)) bestIdx = furthest;
  let pick = -1;
  if (bestIdx >= 0) for (let i = bestIdx + 1; i < conv.lines.length; i++) if (unused(i)) { pick = i; break; }
  // 見つからないときは、まだ言っていない行を順番に
  if (pick < 0) pick = conv.lines.findIndex((_, i) => unused(i));

  const line = pick >= 0 ? conv.lines[pick] : null;
  if (!line) {
    // 台本を言いつくした → 目標表現をもう一回 練習
    const model = suggestions[0] ?? "Hello!";
    return {
      replyEn: usedTarget ? `${praise} Can you say, "${model}"?` : `Can you say, "${model}"?`,
      replyJa: usedTarget ? `${PRAISE_JA[praise]}「${model}」って いえるかな？` : `「${model}」って いえるかな？`,
      suggestions, usedTarget, done: false, turn, maxTurns, source: "script",
    };
  }
  return {
    replyEn: usedTarget ? `${praise} ${line.en}` : line.en,
    replyJa: usedTarget ? `${PRAISE_JA[praise]} ${line.ja}` : line.ja,
    suggestions, usedTarget, done: false, turn, maxTurns, source: "script",
  };
}

/** conversation データが無いレッスン用（旧データ）。あいさつだけの短い かいわ */
export const GENERIC_CONVERSATION: LessonConversation = {
  scene: "Saying hello",
  sceneJa: "あいさつ",
  lines: [
    { speaker: "Haru", en: "Hello!", ja: "こんにちは！" },
    { speaker: "Riko", en: "Hi!", ja: "やあ！" },
    { speaker: "Haru", en: "How are you?", ja: "げんき？" },
    { speaker: "Riko", en: "I'm fine, thanks.", ja: "げんきだよ、ありがとう。" },
    { speaker: "Haru", en: "Goodbye!", ja: "さようなら！" },
  ],
  aiTask: { goalJa: "Hello! と あいさつしよう", starterEn: "Hello! How are you?", targetExpressions: ["Hello!", "I'm fine."] },
};
