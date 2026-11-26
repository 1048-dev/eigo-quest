/**
 * run8 P8: バーチャル先生プレイヤーの「セグメントの タイムライン」。
 *
 *  - lesson.teacher（3〜4 分の 台本）が あれば それを そのまま つかう
 *  - まだ 台本が ない レッスンは、レッスンの ことば・表現・フォニックス・TPR・会話から
 *    同じ 9 つの ながれ（greet → … → wrap）の みじかい 授業を その場で つくる（source: "auto"）
 *  - 1 セグメントを「声の 単位」（英語 / 日本語 の 文）に わける → プレイヤーが 言語ごとに 声を きりかえる
 *  - 長さは timing.ts と 同じ 見つもり（音が 出ない ときも この 時間で すすむ）
 *
 * ブラウザに 依存しない 純粋な 関数だけ（tests/teacher-timeline.test.ts）。
 */
import type { TeacherGesture, TeacherScript, TeacherSegment, TeacherSegmentKind } from "@/lib/domain/types";
import { MS_PER_EN_WORD, MS_PER_JA_CHAR, MS_SEGMENT_GAP, countEnWords, countJaChars, immersionFor } from "./timing";

/** タイムラインに 必要な レッスンの 項目だけ（API の 応答の 型でも LessonDef でも わたせる） */
export interface TimelineLesson {
  lessonNo: number;
  world: number;
  title: string;
  titleJa: string;
  teacherScript: string;
  school: { grammar: string; expressions: { en: string; ja: string; core?: boolean }[] };
  vocab: { en: string; ja: string; emoji: string; core?: boolean }[];
  tpr: { en: string; ja: string; action: string; emoji: string }[];
  phonics: { focus: string[]; words: string[]; tipJa: string };
  conversation?: { lines: { speaker: string; en: string; ja: string }[] } | null;
  teacher?: TeacherScript | null;
}

export type SpeechLang = "en" | "ja";

/** 1 回の 読み上げ（1 つの 言語・1〜2 文） */
export interface SpeechUnit {
  lang: SpeechLang;
  /** 字幕・口の 形に つかう もとの 文字 */
  text: string;
  /** 読み上げ用（～ や ― を 間に かえた もの） */
  speak: string;
  /** 1.0 倍の ときの 見つもり（ミリ秒） */
  ms: number;
}

export interface TimelineSegment {
  index: number;
  kind: TeacherSegmentKind;
  lang: TeacherSegment["lang"];
  say: string;
  subtitleJa: string;
  subtitleEn: string;
  slide: { title: string; items: string[]; emoji?: string };
  gesture: TeacherGesture;
  pauseMs: number;
  units: SpeechUnit[];
  /** 話す 時間（1.0 倍） */
  speakMs: number;
  /** タイムライン上の はじまり / おわり（1.0 倍。おわり = 話す ＋ まち時間 ＋ きりかえ） */
  startMs: number;
  endMs: number;
}

export interface TeacherTimeline {
  /** script = レッスンの 台本 / auto = 台本が まだ ないので その場で つくった */
  source: "script" | "auto";
  segments: TimelineSegment[];
  totalMs: number;
}

export const KIND_LABEL_JA: Record<TeacherSegmentKind, string> = {
  greet: "あいさつ", goal: "きょうの ゴール", words: "ことば", expressions: "ひょうげん", phonics: "フォニックス",
  tpr: "からだで", repeat: "いってみよう", check: "クイズ", wrap: "まとめ",
};

/** gesture が ない セグメントの ジェスチャー（docs/teacher-plan.md §5） */
export const DEFAULT_GESTURE: Record<TeacherSegmentKind, TeacherGesture> = {
  greet: "wave", goal: "point", words: "open_hands", expressions: "open_hands", phonics: "point",
  tpr: "mime", repeat: "nod", check: "think", wrap: "clap",
};

/** まち時間の 合図（カウントダウンの 輪の 上の ことば） */
export function pausePrompt(kind: TeacherSegmentKind): string {
  if (kind === "tpr") return "からだで やってみよう！";
  if (kind === "check") return "かんがえてみよう！";
  return "いってみよう！";
}

// ---------------------------------------------------------------------------
// 言語の 切りわけ
// ---------------------------------------------------------------------------

const JA = /[぀-ヿ㐀-鿿ー々〆「」『』。、！？（）・：　]/;
const LATIN = /[A-Za-z]/;

/** 読み上げ用に ～ ― などを 間（ま）に かえる */
export function speakable(text: string, lang: SpeechLang): string {
  let t = text.replace(/[～〜]/g, lang === "en" ? " ... " : "、").replace(/\s*[―—]\s*/g, lang === "en" ? ", " : "、");
  t = t.replace(/＿＿+|__+/g, lang === "en" ? " blank " : "、");
  return t.replace(/\s+/g, " ").trim();
}

function unitMs(text: string): number {
  return countEnWords(text) * MS_PER_EN_WORD + countJaChars(text) * MS_PER_JA_CHAR;
}

/**
 * 日本語と 英語が まざった 文を 言語ごとの かたまりに わける。
 * 「hello は「こんにちは」。」→ [en "hello", ja "は「こんにちは」。"]。
 * 英字を ふくまない 記号・数字だけの かたまりは まわりの 言語に くっつける。
 */
export function splitByLanguage(text: string): { lang: SpeechLang; text: string }[] {
  const runs: { lang: SpeechLang | null; text: string }[] = [];
  for (const ch of text) {
    const kind: SpeechLang | null = JA.test(ch) ? "ja" : LATIN.test(ch) ? "en" : null;
    const last = runs[runs.length - 1];
    if (!last) runs.push({ lang: kind, text: ch });
    else if (kind === null || last.lang === kind) last.text += ch;
    else if (last.lang === null) { last.lang = kind; last.text += ch; }
    else runs.push({ lang: kind, text: ch });
  }
  // 英語の かたまりの おわりの 記号は 英語に のこし、先頭の 記号（「 など）は つぎの 日本語へ
  const out: { lang: SpeechLang; text: string }[] = [];
  for (const r of runs) {
    const lang: SpeechLang = r.lang ?? "ja";
    const t = r.text.trim();
    if (!t) continue;
    const prev = out[out.length - 1];
    if (prev && prev.lang === lang) prev.text = `${prev.text} ${t}`;
    else out.push({ lang, text: t });
  }
  return out;
}

/** 文の 区切り（ながい 読み上げは とちゅうで 止まる ブラウザが あるので 1〜2 文ずつ） */
function sentences(text: string, lang: SpeechLang): string[] {
  const re = lang === "en" ? /[^.!?]+(?:[.!?]+["'”’)]*|$)/g : /[^。！？!?]+(?:[。！？!?]+」?|$)/g;
  const parts = (text.match(re) ?? [text]).map((s) => s.trim()).filter(Boolean);
  // みじかい 文は となりと まとめる（声の きりかえ回数を へらす）
  const merged: string[] = [];
  for (const p of parts) {
    const last = merged[merged.length - 1];
    if (last !== undefined && (last.length < 14 || p.length < 6) && last.length + p.length < 90) merged[merged.length - 1] = `${last} ${p}`;
    else merged.push(p);
  }
  return merged;
}

/** セグメントの say を 読み上げの 単位に する */
export function speechUnits(say: string, lang: TeacherSegment["lang"]): SpeechUnit[] {
  const chunks = lang === "en" && !JA.test(say) ? [{ lang: "en" as const, text: say }] : splitByLanguage(say);
  const out: SpeechUnit[] = [];
  for (const c of chunks) {
    for (const s of sentences(c.text, c.lang)) {
      const spoken = speakable(s, c.lang);
      if (!spoken.replace(/[\s.,!?…、。！？「」]/g, "")) continue;
      out.push({ lang: c.lang, text: s, speak: spoken, ms: Math.max(350, unitMs(s)) });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// タイムライン
// ---------------------------------------------------------------------------

function toTimeline(source: TeacherTimeline["source"], segs: TeacherSegment[]): TeacherTimeline {
  let t = 0;
  const segments = segs.map((s, index): TimelineSegment => {
    const units = speechUnits(s.say, s.lang);
    const speakMs = units.reduce((a, u) => a + u.ms, 0);
    const pauseMs = Math.max(0, Math.round(s.pauseMs ?? 0));
    const seg: TimelineSegment = {
      index,
      kind: s.kind,
      lang: s.lang,
      say: s.say,
      subtitleJa: s.subtitleJa ?? (s.lang === "en" ? "" : s.say),
      subtitleEn: s.subtitleEn ?? (s.lang === "en" ? s.say : ""),
      slide: s.slide ?? { title: KIND_LABEL_JA[s.kind], items: [] },
      gesture: s.gesture ?? DEFAULT_GESTURE[s.kind],
      pauseMs,
      units,
      speakMs,
      startMs: t,
      endMs: t + speakMs + pauseMs + MS_SEGMENT_GAP,
    };
    t = seg.endMs;
    return seg;
  });
  return { source, segments, totalMs: t };
}

/** いまの 速さ（0.8 / 1.0）での 長さ。話す 時間だけ のびる（まち時間は かわらない） */
export function segmentDurationMs(seg: TimelineSegment, rate = 1): number {
  return seg.speakMs / rate + seg.pauseMs + MS_SEGMENT_GAP;
}
export function timelineDurationMs(tl: TeacherTimeline, rate = 1): number {
  return tl.segments.reduce((a, s) => a + segmentDurationMs(s, rate), 0);
}
/** その セグメントが はじまる 時刻（速さ こみ） */
export function segmentStartMs(tl: TeacherTimeline, index: number, rate = 1): number {
  return tl.segments.slice(0, Math.max(0, index)).reduce((a, s) => a + segmentDurationMs(s, rate), 0);
}

/** ある 時刻に 再生中の セグメント（シークバー用） */
export function segmentAt(tl: TeacherTimeline, ms: number, rate = 1): number {
  let t = 0;
  for (const s of tl.segments) {
    t += segmentDurationMs(s, rate);
    if (ms < t) return s.index;
  }
  return Math.max(0, tl.segments.length - 1);
}

/** 会話の あいての よびかた（L1 の 台本と 同じ） */
export const PARTNER_JA: Record<string, string> = { haru: "ハルくん", riko: "リコちゃん", kiko: "キコちゃん", birimo: "ビリモ" };
export const PARTNER_EN: Record<string, string> = { haru: "Haru", riko: "Riko", kiko: "Kiko", birimo: "Birimo" };

export function buildTeacherTimeline(lesson: TimelineLesson, opts: { partner?: string } = {}): TeacherTimeline {
  const segs = lesson.teacher?.segments?.filter((s) => s && typeof s.say === "string" && s.say.trim()) ?? [];
  if (segs.length >= 3) return toTimeline("script", segs);
  return toTimeline("auto", autoScript(lesson, opts.partner));
}

// ---------------------------------------------------------------------------
// 台本が まだ ない レッスンの 自動の 授業（ワールドの 英語の わりあいに あわせる）
// ---------------------------------------------------------------------------

const words = (s: string) => countEnWords(s);
const repeatPause = (s: string) => Math.min(5000, Math.max(2000, 1500 + words(s) * 380));
/** 黒板に のせる ことば（ながい 文は のせない） */
const short = (s: string) => s.length <= 34;

export function autoScript(lesson: TimelineLesson, partner?: string): TeacherSegment[] {
  const band = immersionFor(lesson.world).label;
  const jaLed = band === "ja-led" || band === "half";
  const enOnly = band === "en-hints" || band === "en-only";
  const pJa = partner ? PARTNER_JA[partner] ?? partner : "";
  const pEn = partner ? PARTNER_EN[partner] ?? partner : "";
  const exprs = lesson.school.expressions.filter((e) => e.en.trim());
  const core = exprs.find((e) => e.core) ?? exprs[0];
  const coreEn = core ? core.en.trim() : lesson.title;
  const vocab = lesson.vocab.filter((v) => v.en.trim()).slice(0, 4);
  const tpr = lesson.tpr.filter((t) => t.en.trim()).slice(0, 4);
  const lines = (lesson.conversation?.lines ?? []).filter((l) => l.en.trim()).slice(0, 2);
  const titleEn = /^lesson\s+\d+/i.test(lesson.title) ? lesson.title.replace(/^lesson\s+\d+\s*/i, "") || lesson.title : lesson.title;
  const out: TeacherSegment[] = [];
  const H = enOnly
    ? { words: "Words", expr: "Listen", phonics: "Sounds", tpr: "Let's move!", say: "Say it!", quiz: "Quiz", wrap: "Today's wrap-up", goal: "Today's goal" }
    : { words: "ことば", expr: "きいてみよう", phonics: "おと", tpr: "からだで やってみよう", say: "いってみよう", quiz: "クイズ", wrap: "きょうの まとめ", goal: "きょうの ゴール" };

  // 1. greet
  out.push(jaLed
    ? { kind: "greet", lang: "mix", say: `Hello, everyone! こんにちは！ エマせんせい だよ。きょうの レッスンは「${lesson.titleJa}」。いっしょに がんばろうね！`, subtitleJa: `みなさん、こんにちは！ きょうの レッスンは「${lesson.titleJa}」。いっしょに がんばろうね！`, subtitleEn: "Hello, everyone!", slide: { title: lesson.title, items: [], emoji: "👋" }, gesture: "wave" }
    : { kind: "greet", lang: "en", say: `Hello, everyone! It's me, Ms. Emma. Welcome to today's lesson: ${titleEn}. Are you ready? Let's go!`, subtitleJa: `みなさん、こんにちは！ エマせんせい です。きょうの レッスンは「${lesson.titleJa}」。じゅんびは いい？ いこう！`, subtitleEn: `Hello, everyone! Welcome to today's lesson: ${titleEn}.`, slide: { title: lesson.title, items: [], emoji: "👋" }, gesture: "wave" });

  // 2. goal
  out.push(jaLed
    ? { kind: "goal", lang: "mix", say: `きょうの ゴールは、${coreEn} を つかえる ように なる こと。さいごまで いっしょに やってみよう。`, subtitleJa: `きょうの ゴール：${coreEn}${core ? `（${core.ja}）` : ""} を つかえる ように なる。`, subtitleEn: `Today's goal: ${coreEn}`, slide: { title: H.goal, items: [coreEn], emoji: "🎯" }, gesture: "point" }
    : { kind: "goal", lang: "en", say: `Here is our goal for today. Let's learn to say: ${coreEn}`, subtitleJa: `きょうの ゴール：${coreEn}${core ? `（${core.ja}）` : ""} を いえる ように なろう。`, subtitleEn: `Today's goal: ${coreEn}`, slide: { title: H.goal, items: [coreEn], emoji: "🎯" }, gesture: "point" });

  // 3. words
  const wordGestures: TeacherGesture[] = ["point", "open_hands", "mime", "nod"];
  vocab.forEach((v, i) => {
    out.push(jaLed
      ? { kind: "words", lang: "mix", say: `${v.en}. ${v.en} は「${v.ja}」。まねして いってね。${v.en}!`, subtitleJa: `${v.en} は「${v.ja}」。まねして いってみよう。`, subtitleEn: v.en, slide: { title: H.words, items: [v.en], emoji: v.emoji }, gesture: wordGestures[i % 4], pauseMs: repeatPause(v.en) }
      : enOnly
        ? { kind: "words", lang: "en", say: `${i === 0 ? "First, some new words. " : "Next word. "}${v.en}. Listen again: ${v.en}. Now you say it!`, subtitleJa: `${v.en} ＝「${v.ja}」。まねして いってみよう。`, subtitleEn: `${v.en}. Now you say it!`, slide: { title: H.words, items: [v.en], emoji: v.emoji }, gesture: wordGestures[i % 4], pauseMs: repeatPause(v.en) }
        : { kind: "words", lang: "mix", say: `${v.en}. ${v.en} は「${v.ja}」. Say it with me. ${v.en}!`, subtitleJa: `${v.en} は「${v.ja}」。いっしょに いってみよう。`, subtitleEn: `${v.en}. Say it with me!`, slide: { title: H.words, items: [v.en], emoji: v.emoji }, gesture: wordGestures[i % 4], pauseMs: repeatPause(v.en) });
  });

  // 4. expressions（会話の 小さな 場面）
  if (lines.length > 0) {
    const scene = lines.map((l) => `${l.speaker}: ${l.en}`).join(" ");
    out.push(jaLed
      ? { kind: "expressions", lang: "mix", say: `きいてね。${lines.map((l) => l.en).join(" ")} こんな ふうに つかうよ。`, subtitleJa: lines.map((l) => `${l.speaker}「${l.ja}」`).join(" "), subtitleEn: scene, slide: { title: H.expr, items: lines.map((l) => l.en).filter(short), emoji: "💬" }, gesture: "open_hands" }
      : { kind: "expressions", lang: "en", say: `Now, listen to our friends. ${scene}`, subtitleJa: lines.map((l) => `${l.speaker}「${l.ja}」`).join(" "), subtitleEn: scene, slide: { title: H.expr, items: lines.map((l) => l.en).filter(short), emoji: "💬" }, gesture: "open_hands" });
  }

  // 5. phonics
  const pw = lesson.phonics.words.filter((w) => words(w) <= 3).slice(0, 3);
  if (pw.length > 0) {
    const focus = lesson.phonics.focus.slice(0, 3);
    out.push(jaLed
      ? { kind: "phonics", lang: "mix", say: `おとの じかん。${lesson.phonics.tipJa} ${pw.join(". ")}. まねして いってね。`, subtitleJa: lesson.phonics.tipJa, subtitleEn: pw.join(", "), slide: { title: H.phonics, items: [...focus, ...pw].filter(short).slice(0, 6), emoji: "🔤" }, gesture: "point", pauseMs: 3000 }
      : { kind: "phonics", lang: "en", say: `Sound time! Listen carefully. ${pw.join(". ")}. Your turn. Say them with me!`, subtitleJa: lesson.phonics.tipJa, subtitleEn: `Sound time! ${pw.join(", ")}`, slide: { title: H.phonics, items: [...focus, ...pw].filter(short).slice(0, 6), emoji: "🔤" }, gesture: "point", pauseMs: 3000 });
  }

  // 6. tpr
  tpr.forEach((t, i) => {
    out.push(jaLed
      ? { kind: "tpr", lang: "mix", say: `${i === 0 ? "からだで やってみよう。" : ""}${t.ja}。${t.en}`, subtitleJa: `${t.ja}（${t.action}）`, subtitleEn: t.en, slide: { title: H.tpr, items: [t.en], emoji: t.emoji }, gesture: "mime", pauseMs: 3500 }
      : { kind: "tpr", lang: "en", say: `${i === 0 ? "Stand up! Let's move. " : "Ready? "}${t.en}`, subtitleJa: `${t.ja}（${t.action}）`, subtitleEn: t.en, slide: { title: H.tpr, items: [t.en], emoji: t.emoji }, gesture: "mime", pauseMs: 3500 });
  });

  // 7. repeat
  exprs.slice(0, 3).forEach((e, i) => {
    const en = e.en.trim();
    out.push(jaLed
      ? { kind: "repeat", lang: "mix", say: `${i === 0 ? "まねして いってね。" : ""}${en}`, subtitleJa: e.ja, subtitleEn: en, slide: { title: H.say, items: [en], emoji: "🎤" }, gesture: "nod", pauseMs: repeatPause(en) }
      : { kind: "repeat", lang: "en", say: `${i === 0 ? "Repeat after me. " : ""}${en}`, subtitleJa: e.ja, subtitleEn: en, slide: { title: H.say, items: [en], emoji: "🎤" }, gesture: "nod", pauseMs: repeatPause(en) });
  });

  // 8. check（2 択クイズ → こたえ）
  const q = vocab[0];
  const other = vocab[1] ?? (tpr[0] ? { en: tpr[0].en, ja: tpr[0].ja } : undefined);
  if (q && other) {
    const [a, b] = lesson.lessonNo % 2 ? [q.en, other.en] : [other.en, q.en];
    out.push(jaLed
      ? { kind: "check", lang: "mix", say: `クイズ だよ。「${q.ja}」は どっち？ ${a}. それとも ${b}. かんがえてね。`, subtitleJa: `クイズ：「${q.ja}」は どっち？`, subtitleEn: `${a} or ${b}?`, slide: { title: H.quiz, items: [a, b], emoji: "❓" }, gesture: "think", pauseMs: 3000 }
      : { kind: "check", lang: "en", say: `Quiz time! Which one means ${enOnly ? "this" : `「${q.ja}」`}? ${a}, or ${b}? Think about it.`, subtitleJa: `クイズ：「${q.ja}」は どっち？`, subtitleEn: `Which one? ${a} or ${b}?`, slide: { title: H.quiz, items: [a, b], emoji: q.emoji || "❓" }, gesture: "think", pauseMs: 3000 });
    out.push(jaLed
      ? { kind: "check", lang: "mix", say: `こたえは ${q.en}! せいかいした ひと、すごい！`, subtitleJa: `こたえは ${q.en}（${q.ja}）！`, subtitleEn: `The answer is ${q.en}!`, slide: { title: H.quiz, items: [q.en], emoji: "⭕" }, gesture: "clap" }
      : { kind: "check", lang: "en", say: `The answer is ${q.en}! Great job!`, subtitleJa: `こたえは ${q.en}（${q.ja}）！ よく できました！`, subtitleEn: `The answer is ${q.en}! Great job!`, slide: { title: H.quiz, items: [q.en], emoji: "⭕" }, gesture: "clap" });
  }

  // 9. wrap
  out.push(jaLed
    ? { kind: "wrap", lang: "mix", say: `きょうは ${coreEn} を れんしゅう したね。よく がんばりました！${pJa ? ` このあと ${pJa}と おはなし してみてね。` : ""} See you!`, subtitleJa: `きょうは ${coreEn} を れんしゅう したね。よく がんばりました！${pJa ? `このあと ${pJa}と おはなし してみてね。` : ""}`, subtitleEn: "Great job today! See you!", slide: { title: H.wrap, items: [coreEn], emoji: "🌟" }, gesture: "clap" }
    : { kind: "wrap", lang: "en", say: `Wonderful! Today we practiced: ${coreEn} You did a great job!${pEn ? ` Next, go and talk with ${pEn}.` : ""} See you!`, subtitleJa: `きょうは ${coreEn} を れんしゅう したね。よく がんばりました！${pJa ? `このあと ${pJa}と おはなし してみてね。` : ""}`, subtitleEn: `Today we practiced: ${coreEn} Great job! See you!`, slide: { title: H.wrap, items: [coreEn], emoji: "🌟" }, gesture: "clap" });

  return out;
}

// ---------------------------------------------------------------------------
// 口の 形（ビセーム）
// ---------------------------------------------------------------------------

export type Viseme = "rest" | "a" | "e" | "o" | "u" | "m" | "f";

const KANA_ROWS: [Viseme, string][] = [
  ["a", "あかさたなはまやらわがざだばぱぁゃゎ"],
  ["e", "いきしちにひみりぎじぢびぴぃえけせてねへめれげぜでべぺぇ"],
  ["u", "うくすつぬふむゆるぐずづぶぷぅゅっ"],
  ["o", "おこそとのほもよろをごぞどぼぽぉょ"],
  ["m", "ん"],
];
const KANA = new Map<string, Viseme>();
for (const [v, row] of KANA_ROWS) for (const ch of row) KANA.set(ch, v);

/** 1 文字の 口の 形 */
export function visemeOf(ch: string, prev: Viseme = "rest"): Viseme {
  const c = ch.toLowerCase();
  if (/[aiy]/.test(c)) return "a";
  if (/[e]/.test(c)) return "e";
  if (/[o]/.test(c)) return "o";
  if (/[uwq]/.test(c)) return "u";
  if (/[mbp]/.test(c)) return "m";
  if (/[fv]/.test(c)) return "f";
  if (/[a-z]/.test(c)) return prev === "e" ? "a" : "e";
  const code = ch.charCodeAt(0);
  const hira = code >= 0x30a1 && code <= 0x30f6 ? String.fromCharCode(code - 0x60) : ch;
  const k = KANA.get(hira);
  if (k) return k;
  if (ch === "ー") return prev;
  if (/[㐀-鿿]/.test(ch)) return prev === "a" ? "o" : "a";
  return "rest";
}

/** 文の charPos 文字目の 口の 形（ぼうしゅつ記号・空白は 口を とじる） */
export function visemeAt(text: string, charPos: number): Viseme {
  if (!text || charPos < 0 || charPos >= text.length) return "rest";
  const i = Math.floor(charPos);
  const prevCh = i > 0 ? text[i - 1] : "";
  return visemeOf(text[i], prevCh ? visemeOf(prevCh) : "rest");
}
