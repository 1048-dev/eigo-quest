/**
 * run8 P9: 先生の 台本を「AI アバター動画サービスに わたす 形」に する（ブラウザに 依存しない 純粋な 関数）。
 * scripts/teacher-export.ts が これを つかって exports/teacher/<lessonNo>/ に 書きだす。
 *
 *  - script.txt   … 人が 読める 台本。# で はじまる 行は メモ（読まない）、[PAUSE 2.5s] は まち時間
 *  - script.json  … セグメントの データ（言語ごとの かたまり・ジェスチャー・黒板・時刻の 見つもり）
 *  - subtitles.vtt… 日本語＋英語の 字幕（WebVTT。時刻は 見つもり。動画が できたら 動画に あわせて なおす）
 *  - slides.json  … 黒板（スライド）の 一覧と 出す 時刻
 *
 * 長さ・時刻は バーチャル先生プレイヤーと 同じ 見つもり（timeline.ts / timing.ts）。
 */
import { buildTeacherTimeline, KIND_LABEL_JA, pausePrompt, type TeacherTimeline, type TimelineLesson, type TimelineSegment } from "@/lib/teacher/timeline";
import { countEnWords, countJaChars, englishShare } from "@/lib/teacher/timing";

export const EXPORT_FORMAT = "eigo-quest-teacher-export";
export const EXPORT_VERSION = 1;
/** 1 つの 字幕が ながく なりすぎない ように（ミリ秒）。これより 長い 話は 文ごとに わける */
export const MAX_CUE_MS = 7000;
/** 字幕の いちばん みじかい 長さ */
export const MIN_CUE_MS = 800;

export interface ExportLessonInfo extends TimelineLesson {
  stage?: number;
}

export interface ExportSegment {
  index: number;
  kind: TimelineSegment["kind"];
  kindJa: string;
  lang: TimelineSegment["lang"];
  say: string;
  /** 言語ごとの かたまり（声を きりかえる ところ） */
  parts: { lang: "en" | "ja"; text: string }[];
  subtitleJa: string;
  subtitleEn: string;
  gesture: TimelineSegment["gesture"];
  slide: TimelineSegment["slide"];
  /** 見つもりの 時刻（ミリ秒） */
  startMs: number;
  speakMs: number;
  pauseMs: number;
  endMs: number;
}

export interface TeacherExport {
  format: typeof EXPORT_FORMAT;
  version: typeof EXPORT_VERSION;
  lessonNo: number;
  world: number;
  stage: number | null;
  title: string;
  titleJa: string;
  teacher: string;
  /** script = レッスンの 台本 / auto = 台本が まだ ないので レッスンの データから 自動で つくった */
  source: TeacherTimeline["source"];
  voices: { en: string; ja: string };
  totalMs: number;
  speakMs: number;
  pauseMs: number;
  englishShare: number;
  enWords: number;
  jaChars: number;
  segments: ExportSegment[];
}

export interface TeacherExportFiles {
  data: TeacherExport;
  scriptTxt: string;
  scriptJson: string;
  subtitlesVtt: string;
  slidesJson: string;
}

export function lessonDirName(lessonNo: number): string {
  return String(lessonNo).padStart(4, "0");
}

export function buildTeacherExport(lesson: ExportLessonInfo, opts: { partner?: string; teacherName?: string } = {}): TeacherExport {
  const tl = buildTeacherTimeline(lesson, { partner: opts.partner });
  const segments: ExportSegment[] = tl.segments.map((s) => ({
    index: s.index,
    kind: s.kind,
    kindJa: KIND_LABEL_JA[s.kind],
    lang: s.lang,
    say: s.say,
    parts: s.units.map((u) => ({ lang: u.lang, text: u.text })),
    subtitleJa: s.subtitleJa,
    subtitleEn: s.subtitleEn,
    gesture: s.gesture,
    slide: s.slide,
    startMs: s.startMs,
    speakMs: Math.round(s.speakMs),
    pauseMs: s.pauseMs,
    endMs: s.endMs,
  }));
  const allSay = segments.map((s) => s.say).join("\n");
  return {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    lessonNo: lesson.lessonNo,
    world: lesson.world,
    stage: lesson.stage ?? null,
    title: lesson.title,
    titleJa: lesson.titleJa,
    teacher: opts.teacherName ?? "Ms. Emma",
    source: tl.source,
    voices: { en: "en-US", ja: "ja-JP" },
    totalMs: tl.totalMs,
    speakMs: segments.reduce((a, s) => a + s.speakMs, 0),
    pauseMs: segments.reduce((a, s) => a + s.pauseMs, 0),
    englishShare: Math.round(englishShare({ minutes: 0, segments: tl.segments }) * 1000) / 1000,
    enWords: countEnWords(allSay),
    jaChars: countJaChars(allSay),
    segments,
  };
}

// ---------------------------------------------------------------------------
// 時刻の 書きかた
// ---------------------------------------------------------------------------

/** 00:01:02.345（WebVTT） */
export function vttTime(ms: number): string {
  const t = Math.max(0, Math.round(ms));
  const h = Math.floor(t / 3_600_000);
  const m = Math.floor((t % 3_600_000) / 60_000);
  const s = Math.floor((t % 60_000) / 1000);
  const r = t % 1000;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(r).padStart(3, "0")}`;
}

/** 1:02.3（台本の メモ用） */
export function clockTime(ms: number): string {
  const t = Math.max(0, Math.round(ms / 100));
  const m = Math.floor(t / 600);
  const s = Math.floor((t % 600) / 10);
  return `${m}:${String(s).padStart(2, "0")}.${t % 10}`;
}

const secs = (ms: number) => `${(Math.round(ms / 100) / 10).toFixed(1)}s`;

// ---------------------------------------------------------------------------
// script.txt
// ---------------------------------------------------------------------------

export function pauseMarker(ms: number): string {
  return `[PAUSE ${secs(ms)}]`;
}

const PAUSE_NOTE: Record<string, string> = {
  tpr: "children move their bodies / こどもが からだを うごかす",
  check: "children think and answer / こどもが かんがえて こたえる",
};

export function renderScriptTxt(x: TeacherExport): string {
  const out: string[] = [];
  out.push(`# L${lessonDirName(x.lessonNo)} ${x.title} / ${x.titleJa} — ${x.teacher}`);
  out.push(`# world ${x.world}${x.stage ? ` · stage ${x.stage}` : ""} · source: ${x.source}${x.source === "auto" ? " (auto-generated from lesson data; a full script is not written yet)" : ""}`);
  out.push(`# estimated length ${clockTime(x.totalMs)} (${Math.round(x.totalMs / 1000)}s) · speech ${Math.round(x.speakMs / 1000)}s · pauses ${Math.round(x.pauseMs / 1000)}s · English ${Math.round(x.englishShare * 100)}%`);
  out.push(`# voices: English = ${x.voices.en}, Japanese = ${x.voices.ja} (same teacher, switch language inside a line)`);
  out.push("# Lines starting with # are notes (do not read them aloud).");
  out.push("# [PAUSE n.ns] = stay silent, smile and wait while the child speaks or moves (keep the camera rolling).");
  out.push("");
  for (const s of x.segments) {
    out.push(`# --- ${String(s.index + 1).padStart(2, "0")} ${s.kind} (${s.kindJa}) · lang ${s.lang} · gesture ${s.gesture} · at ${clockTime(s.startMs)}`);
    const items = s.slide.items.length ? ` | ${s.slide.items.join(" · ")}` : "";
    out.push(`# slide: ${s.slide.emoji ? s.slide.emoji + " " : ""}${s.slide.title}${items}`);
    out.push(s.say.trim());
    if (s.pauseMs > 0) {
      const note = PAUSE_NOTE[s.kind] ?? "children repeat / こどもが まねして いう";
      out.push(`${pauseMarker(s.pauseMs)}  # ${note}`);
    }
    out.push("");
  }
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// subtitles.vtt（日本語＋英語）
// ---------------------------------------------------------------------------

function vttEscape(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/-->/g, "→").replace(/\s*\n\s*/g, " ").trim();
}

/** 文に わける（。！？ . ! ? の あと）。 */
export function splitSentences(text: string): string[] {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return [];
  const parts = t.match(/[^。！？!?.]+(?:[。！？!?.]+[」』）)"]*|$)/g) ?? [t];
  return parts.map((p) => p.trim()).filter(Boolean);
}

/** 長さの 列を k この かたまりに わける ときの「かたまりごとの 文の 数」（長さが なるべく そろう ように） */
export function groupSizes(lengths: number[], k: number): number[] {
  if (lengths.length === 0) return [];
  if (k <= 1 || lengths.length === 1) return [lengths.length];
  if (lengths.length <= k) return lengths.map(() => 1);
  const total = lengths.reduce((a, b) => a + b, 0);
  const target = total / k;
  const sizes: number[] = [0];
  let acc = 0;
  lengths.forEach((len, i) => {
    const left = lengths.length - i;
    const groupsLeft = k - sizes.length;
    if (sizes[sizes.length - 1] > 0 && groupsLeft > 0 && (acc + len / 2 > target * sizes.length || left <= groupsLeft)) sizes.push(0);
    sizes[sizes.length - 1]++;
    acc += len;
  });
  return sizes;
}

function applySizes(sentences: string[], sizes: number[]): string[] {
  const out: string[] = [];
  let i = 0;
  for (const n of sizes) {
    out.push(sentences.slice(i, i + n).join(" "));
    i += n;
  }
  return out;
}

/** 文を k この かたまりに まとめる（文字数が なるべく そろう ように）。k より 文が すくなければ そのまま */
export function groupSentences(sentences: string[], k: number): string[] {
  return applySizes(sentences, groupSizes(sentences.map((s) => s.length), k));
}

export interface VttCue {
  startMs: number;
  endMs: number;
  ja: string;
  en: string;
}

const PAUSE_EN: Record<string, string> = { tpr: "(Do it with your body!)", check: "(Think about it!)" };

export function subtitleCues(x: TeacherExport): VttCue[] {
  const cues: VttCue[] = [];
  for (const s of x.segments) {
    const speakMs = Math.max(MIN_CUE_MS, s.speakMs);
    const ja = splitSentences(s.subtitleJa);
    const en = splitSentences(s.subtitleEn);
    const k = Math.max(1, Math.min(Math.ceil(speakMs / MAX_CUE_MS), Math.max(ja.length, en.length, 1)));
    let jaG: string[];
    let enG: string[];
    if (ja.length > 0 && ja.length === en.length) {
      // 日本語と 英語の 文の 数が 同じ → 同じ 文どうしを 同じ 字幕に（たいてい 1 文ずつ 訳が ならぶ）
      const sizes = groupSizes(ja.map((s, i) => Math.max(s.length, en[i].length)), k);
      jaG = applySizes(ja, sizes);
      enG = applySizes(en, sizes);
    } else {
      jaG = groupSentences(ja, k);
      enG = groupSentences(en, k);
    }
    const n = Math.max(jaG.length, enG.length, 1);
    // 時間は 文字の 長さで わける（日本語と 英語の 長いほう）
    const weights = Array.from({ length: n }, (_, i) => Math.max(1, (jaG[i] ?? "").length, (enG[i] ?? "").length));
    const wsum = weights.reduce((a, b) => a + b, 0);
    let t = s.startMs;
    for (let i = 0; i < n; i++) {
      const d = i === n - 1 ? s.startMs + speakMs - t : Math.round((speakMs * weights[i]) / wsum);
      if (jaG[i] || enG[i]) cues.push({ startMs: t, endMs: t + d, ja: jaG[i] ?? "", en: enG[i] ?? "" });
      t += d;
    }
    if (s.pauseMs > 0) {
      cues.push({ startMs: s.startMs + speakMs, endMs: s.startMs + speakMs + s.pauseMs, ja: `（${pausePrompt(s.kind)}）`, en: PAUSE_EN[s.kind] ?? "(Your turn!)" });
    }
  }
  return cues;
}

export function renderVtt(x: TeacherExport, langs: { ja?: boolean; en?: boolean } = { ja: true, en: true }): string {
  const out: string[] = ["WEBVTT", "", `NOTE L${lessonDirName(x.lessonNo)} ${vttEscape(x.title)} / ${vttEscape(x.titleJa)} (estimated timing; re-time to the finished video)`, ""];
  let n = 1;
  for (const c of subtitleCues(x)) {
    const lines = [langs.ja !== false ? c.ja : "", langs.en !== false ? c.en : ""].map(vttEscape).filter(Boolean);
    if (lines.length === 0) continue;
    out.push(String(n++), `${vttTime(c.startMs)} --> ${vttTime(c.endMs)}`, ...lines, "");
  }
  return out.join("\n");
}

// ---------------------------------------------------------------------------
// slides.json / script.json
// ---------------------------------------------------------------------------

export function renderSlides(x: TeacherExport) {
  return {
    format: `${EXPORT_FORMAT}-slides`,
    version: EXPORT_VERSION,
    lessonNo: x.lessonNo,
    title: x.title,
    titleJa: x.titleJa,
    slides: x.segments.map((s) => ({
      index: s.index,
      kind: s.kind,
      startMs: s.startMs,
      endMs: s.endMs,
      start: vttTime(s.startMs),
      title: s.slide.title,
      items: s.slide.items,
      emoji: s.slide.emoji ?? null,
      gesture: s.gesture,
    })),
  };
}

export function renderTeacherExportFiles(x: TeacherExport): TeacherExportFiles {
  return {
    data: x,
    scriptTxt: renderScriptTxt(x),
    scriptJson: JSON.stringify(x, null, 2) + "\n",
    subtitlesVtt: renderVtt(x),
    slidesJson: JSON.stringify(renderSlides(x), null, 2) + "\n",
  };
}

// ---------------------------------------------------------------------------
// summary.csv（業者の 見つもり用）
// ---------------------------------------------------------------------------

export const SUMMARY_HEADER = [
  "lessonNo", "world", "stage", "title", "titleJa", "source", "segments",
  "speechSeconds", "pauseSeconds", "totalSeconds", "totalMinutes", "minutesRoundedUp", "englishPercent", "enWords", "jaChars",
] as const;

export function csvCell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const min2 = (ms: number) => (ms / 60_000).toFixed(2);

export function summaryRow(x: TeacherExport): string {
  return [
    x.lessonNo, x.world, x.stage ?? "", x.title, x.titleJa, x.source, x.segments.length,
    Math.round(x.speakMs / 1000), Math.round(x.pauseMs / 1000), Math.round(x.totalMs / 1000), min2(x.totalMs), Math.ceil(x.totalMs / 60_000),
    Math.round(x.englishShare * 100), x.enWords, x.jaChars,
  ].map(csvCell).join(",");
}

export interface SummaryTotals {
  lessons: number;
  scriptLessons: number;
  autoLessons: number;
  totalMs: number;
  speakMs: number;
  pauseMs: number;
  minutesRoundedUp: number;
}

export function summaryTotals(xs: readonly TeacherExport[]): SummaryTotals {
  return {
    lessons: xs.length,
    scriptLessons: xs.filter((x) => x.source === "script").length,
    autoLessons: xs.filter((x) => x.source === "auto").length,
    totalMs: xs.reduce((a, x) => a + x.totalMs, 0),
    speakMs: xs.reduce((a, x) => a + x.speakMs, 0),
    pauseMs: xs.reduce((a, x) => a + x.pauseMs, 0),
    minutesRoundedUp: xs.reduce((a, x) => a + Math.ceil(x.totalMs / 60_000), 0),
  };
}

/** UTF-8 の BOM つき（Excel で 日本語が 化けない ように） */
export function renderSummaryCsv(xs: readonly TeacherExport[]): string {
  const t = summaryTotals(xs);
  const lines = [SUMMARY_HEADER.join(","), ...xs.map(summaryRow)];
  lines.push(
    [
      "TOTAL", "", "", `${t.lessons} lessons`, `script ${t.scriptLessons} / auto ${t.autoLessons}`, "", xs.reduce((a, x) => a + x.segments.length, 0),
      Math.round(t.speakMs / 1000), Math.round(t.pauseMs / 1000), Math.round(t.totalMs / 1000), min2(t.totalMs), t.minutesRoundedUp, "", "", "",
    ].map(csvCell).join(","),
  );
  return "﻿" + lines.join("\r\n") + "\r\n";
}
