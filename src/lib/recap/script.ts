/**
 * 「きょうのまとめ」動画の台本ビルダー（純粋関数・DB なし・ブラウザ API なし）。
 *
 * レッスンデータ（LessonDef）→ 時間つきのセグメント列。
 * 動画ファイルは使わず、/recap/[lessonNo] のプレイヤーがこの台本を順番に再生する。
 *
 * セクション: オープニング → ことば → ひょうげん → フォニックス → うごこう（TPR）→ かいわ → きょうのポイント → おわり
 * call-and-response: 英語を読み上げ（en-US・rate 約0.9）→「いってみよう！」で約2.5秒まつ → つぎへ
 * 全体は 2〜3 分（RECAP_TIMING.minTotalMs〜maxTotalMs）におさまるように、項目数を調整する。
 */
import type { LessonDef } from "@/lib/domain/types";

export type RecapSection = "intro" | "words" | "expressions" | "phonics" | "tpr" | "conversation" | "highlights" | "outro";
export type RecapHost = "haru" | "birimo";

export const RECAP_SECTION_LABEL: Record<RecapSection, string> = {
  intro: "はじまり",
  words: "ことば",
  expressions: "ひょうげん",
  phonics: "フォニックス",
  tpr: "うごこう",
  conversation: "かいわ",
  highlights: "ポイント",
  outro: "おわり",
};

export const RECAP_TIMING = {
  /** 読み上げ速度（en-US）。tts.ts の speak() は rate×0.9 するので、プレイヤーは speak(en, 1) を呼ぶ */
  speechRate: 0.9,
  /** 「いってみよう！」のまち時間 */
  repeatPauseMs: 2500,
  /** セグメントのあいだの短い間 */
  gapMs: 400,
  minTotalMs: 120_000,
  maxTotalMs: 180_000,
} as const;

export interface RecapSegment {
  /** 台本内で一意 */
  id: string;
  section: RecapSection;
  /** 画面で話しているホスト */
  host: RecapHost;
  /** ホストの日本語のひとこと（表示のみ・読み上げない） */
  sayJa: string;
  /** 読み上げる英語（無ければ読み上げなし＝トークだけ） */
  en?: string;
  /** 英語の日本語訳・動きの説明 */
  ja?: string;
  emoji?: string;
  /** 会話シーンの話し手（"Riko" など） */
  speaker?: string;
  /** フォニックスで大きく表示する文字 */
  letters?: string[];
  /** true なら読み上げのあと「いってみよう！」で repeatPauseMs まつ */
  repeat: boolean;
  /** 読み上げ（またはトーク表示）の見積もり時間 */
  speakMs: number;
  /** 読み上げのあとのまち時間（repeat なら repeatPauseMs、ちがえば gapMs） */
  pauseMs: number;
  startMs: number;
  durationMs: number;
}

export interface RecapChapter {
  section: RecapSection;
  labelJa: string;
  startMs: number;
  /** 最初のセグメントの番号 */
  index: number;
}

export interface RecapScript {
  lessonNo: number;
  title: string;
  titleJa: string;
  segments: RecapSegment[];
  chapters: RecapChapter[];
  totalMs: number;
}

/** 英語の読み上げ時間の見積もり（rate 0.9 で 1語 約0.42秒 + 立ち上がり） */
export function estimateSpeechMs(en: string, rate: number = RECAP_TIMING.speechRate): number {
  const words = en.trim().split(/\s+/).filter(Boolean).length;
  return Math.round((350 + Math.max(1, words) * 380) / rate);
}

/** 日本語のトークを読む時間の見積もり（子どもが読める速さ・1.8〜5秒） */
export function estimateReadMs(ja: string): number {
  const chars = [...ja.replace(/\s+/g, "")].length;
  return Math.min(5000, Math.max(1800, 1200 + chars * 90));
}

/** 項目数の上限（長すぎるときに使う）。下限に足りないときは「もういちど」セクションで足す */
const LIMITS = { words: 6, expressions: 4, phonics: 5, tpr: 5, conversationLines: 6, conversationRepeats: 2, highlights: 3 };
const TIGHT_LIMITS = { words: 5, expressions: 3, phonics: 4, tpr: 4, conversationLines: 5, conversationRepeats: 1, highlights: 2 };

type Draft = Omit<RecapSegment, "id" | "startMs" | "durationMs" | "speakMs" | "pauseMs">;

const talk = (section: RecapSection, host: RecapHost, sayJa: string, extra: Partial<Draft> = {}): Draft => ({ section, host, sayJa, repeat: false, ...extra });
const phrase = (section: RecapSection, host: RecapHost, sayJa: string, en: string, extra: Partial<Draft> = {}): Draft => ({ section, host, sayJa, en, repeat: true, ...extra });

const HOST_OF_SPEAKER = (speaker: string): RecapHost => (/birimo/i.test(speaker) ? "birimo" : "haru");

/** 会話の中で「きょうの表現」をふくむ行（くりかえし練習する行）を選ぶ */
function keyConversationLines(lesson: LessonDef, max: number) {
  const lines = lesson.conversation?.lines ?? [];
  const stems = (lesson.conversation?.aiTask.targetExpressions ?? [])
    .map((t) => t.replace(/～.*$/, "").replace(/[.!?。！？]+$/, "").trim().toLowerCase())
    .filter((s) => s.length > 0);
  const scored = lines.filter((l) => l.en.trim() && stems.some((s) => l.en.toLowerCase().includes(s)));
  const picked = scored.length > 0 ? scored : lines.filter((l) => l.en.trim()).slice(-1);
  // 同じ文はくりかえさない
  const seen = new Set<string>();
  return picked.filter((l) => !seen.has(l.en) && seen.add(l.en)).slice(0, max);
}

function draftSegments(lesson: LessonDef, lim: typeof LIMITS, extraRounds: number): Draft[] {
  const d: Draft[] = [];
  const nonEmpty = <T extends { en: string }>(xs: readonly T[]) => xs.filter((x) => x.en.trim().length > 0);

  // オープニング
  d.push(talk("intro", "haru", `きょうの まとめだよ！ Lesson ${lesson.lessonNo}「${lesson.titleJa}」`, { emoji: "🎬" }));
  d.push(talk("intro", "birimo", "ハルの あとに つづけて、こえに だして いってみよう！", { emoji: "🗣️" }));

  // ことば
  const vocab = nonEmpty(lesson.vocab).slice(0, lim.words);
  if (vocab.length > 0) {
    d.push(talk("words", "birimo", "まずは きょうの ことば！", { emoji: "📚" }));
    for (const v of vocab) d.push(phrase("words", "haru", v.ja, v.en, { ja: v.ja, emoji: v.emoji }));
  }

  // ひょうげん（学校テストに出るもの＝core を先に）
  const exprs = [...nonEmpty(lesson.school.expressions)].sort((a, b) => Number(!!b.core) - Number(!!a.core)).slice(0, lim.expressions);
  if (exprs.length > 0) {
    d.push(talk("expressions", "birimo", "つぎは きょうの ひょうげん！", { emoji: "💬" }));
    for (const e of exprs) d.push(phrase("expressions", "haru", e.ja, e.en, { ja: e.ja }));
  }

  // フォニックス
  const words = lesson.phonics.words.filter((w) => w.trim()).slice(0, lim.phonics);
  if (words.length > 0) {
    const focus = lesson.phonics.focus.filter((f) => f.trim());
    d.push(talk("phonics", "birimo", lesson.phonics.tipJa || "おとに ちゅうもく！", { emoji: "🔤", letters: focus }));
    for (const w of words) {
      const letters = focus.filter((f) => w.toLowerCase().includes(f.toLowerCase()));
      d.push(phrase("phonics", "haru", "おとを よく きいてね", w, { letters: letters.length > 0 ? letters : focus }));
    }
  }

  // TPR（うごこう）
  const tpr = nonEmpty(lesson.tpr).slice(0, lim.tpr);
  if (tpr.length > 0) {
    d.push(talk("tpr", "birimo", "からだを うごかすよ！ きいたら すぐ うごいてね", { emoji: "🏃" }));
    for (const t of tpr) d.push(phrase("tpr", "haru", t.action || t.ja, t.en, { ja: t.ja, emoji: t.emoji }));
  }

  // かいわ（シーンを聞く → だいじな文をくりかえす）
  const conv = lesson.conversation;
  const lines = conv ? nonEmpty(conv.lines).slice(0, lim.conversationLines) : [];
  if (conv && lines.length > 0) {
    d.push(talk("conversation", "birimo", `かいわを きいてみよう：${conv.sceneJa}`, { emoji: "🎭" }));
    for (const l of lines) {
      d.push({ section: "conversation", host: HOST_OF_SPEAKER(l.speaker), sayJa: l.ja, en: l.en, ja: l.ja, speaker: l.speaker, repeat: false });
    }
    const keys = keyConversationLines({ ...lesson, conversation: { ...conv, lines } }, lim.conversationRepeats);
    if (keys.length > 0) {
      d.push(talk("conversation", "haru", "だいじな ところを もういちど！", { emoji: "⭐" }));
      for (const l of keys) d.push(phrase("conversation", "haru", l.ja, l.en, { ja: l.ja, speaker: l.speaker }));
    }
  }

  // もういちど（短いレッスンで 2 分に足りないとき：ことばと core 表現をすばやくおさらい）
  for (let r = 0; r < extraRounds; r++) {
    const pool = [
      ...vocab.map((v) => ({ en: v.en, ja: v.ja, emoji: v.emoji as string | undefined })),
      ...exprs.filter((e) => e.core).map((e) => ({ en: e.en, ja: e.ja, emoji: undefined })),
    ];
    if (pool.length === 0) break;
    d.push(talk("highlights", "birimo", r === 0 ? "もういちど チャレンジ！ はやく いえるかな？" : "さいごに もういっかい！", { emoji: "⚡" }));
    for (const p of pool) d.push(phrase("highlights", "haru", p.ja, p.en, { ja: p.ja, emoji: p.emoji }));
  }

  // きょうのポイント
  const hl = (lesson.recap?.highlightsJa ?? []).filter((h) => h.trim()).slice(0, lim.highlights);
  if (hl.length > 0) {
    d.push(talk("highlights", "birimo", "きょうの ポイント！", { emoji: "🏅" }));
    for (const h of hl) d.push(talk("highlights", "haru", h, { emoji: "✅" }));
  }

  // おわり
  d.push(talk("outro", "haru", "きょうも よく がんばったね！ また あした！", { en: "Great job! See you tomorrow!", emoji: "🎉" }));
  return d;
}

function timeline(drafts: Draft[]): { segments: RecapSegment[]; totalMs: number } {
  let t = 0;
  const segments = drafts.map((x, i) => {
    const speakMs = x.en ? Math.max(estimateSpeechMs(x.en), x.repeat ? 0 : estimateReadMs(x.sayJa) * 0.6) : estimateReadMs(x.sayJa);
    const pauseMs = x.repeat ? RECAP_TIMING.repeatPauseMs : RECAP_TIMING.gapMs;
    const seg: RecapSegment = { ...x, id: `s${i}-${x.section}`, speakMs: Math.round(speakMs), pauseMs, startMs: t, durationMs: Math.round(speakMs) + pauseMs };
    t += seg.durationMs;
    return seg;
  });
  return { segments, totalMs: t };
}

function chaptersOf(segments: RecapSegment[]): RecapChapter[] {
  const out: RecapChapter[] = [];
  segments.forEach((s, i) => {
    if (out.at(-1)?.section !== s.section) out.push({ section: s.section, labelJa: RECAP_SECTION_LABEL[s.section], startMs: s.startMs, index: i });
  });
  return out;
}

/** レッスン → まとめ動画の台本。2〜3分におさまるよう項目数・くりかえし回数を調整する */
export function buildRecapScript(lesson: LessonDef): RecapScript {
  let built = timeline(draftSegments(lesson, LIMITS, 0));
  if (built.totalMs > RECAP_TIMING.maxTotalMs) built = timeline(draftSegments(lesson, TIGHT_LIMITS, 0));
  for (let rounds = 1; rounds <= 2 && built.totalMs < RECAP_TIMING.minTotalMs; rounds++) {
    const next = timeline(draftSegments(lesson, LIMITS, rounds));
    if (next.totalMs > RECAP_TIMING.maxTotalMs) break;
    built = next;
  }
  return {
    lessonNo: lesson.lessonNo,
    title: lesson.title,
    titleJa: lesson.titleJa,
    segments: built.segments,
    chapters: chaptersOf(built.segments),
    totalMs: built.totalMs,
  };
}

/** 再生位置（セグメント番号＋その中の経過ms）→ 全体の進み具合 0..1 */
export function recapProgress(script: RecapScript, index: number, elapsedInSegmentMs = 0): number {
  if (script.totalMs <= 0 || script.segments.length === 0) return 0;
  if (index >= script.segments.length) return 1;
  const s = script.segments[Math.max(0, index)];
  return Math.min(1, (s.startMs + Math.min(Math.max(0, elapsedInSegmentMs), s.durationMs)) / script.totalMs);
}
