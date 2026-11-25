/**
 * えいごの としょかん の きろく（この ブラウザの localStorage）。
 *  - よんだ おはなし（いちばん よかった 正解数と 日）・きいた チャンツ・話した フリートーク → 一覧の ✓ と「おすすめ」に つかう
 *  - きょうの スタンプ（1日1回の 小さな ごほうび）。サーバーに つながらない おためしモードでも もらえる
 *    （コインは サーバーの きろくが 正しいので、つながっている ときだけ サーバーが 付ける）
 *  - localStorage が 使えない・こわれた値 のときは「なにも ない」として あつかう。例外は 投げない
 */
import { localDate } from "@/lib/domain/dates";
import { isActivityComplete, type LibraryActivity } from "./rules";
import type { Story } from "./types";

export interface LocalLibrary {
  /** storyId → いちばん よかった 正解数 と さいごに よんだ日 */
  stories: Record<string, { best: number; date: string }>;
  /** chantId → さいごに さいごまで きいた日 */
  chants: Record<string, string>;
  /** themeId → さいごに 話した日 */
  talks: Record<string, string>;
  /** スタンプを もらった日（"YYYY-MM-DD"、古い順・重複なし） */
  stamps: string[];
}

export const LOCAL_LIBRARY_KEY = "eigo-quest:library:v1";
const MAX_STAMPS = 400;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const emptyLibrary = (): LocalLibrary => ({ stories: {}, chants: {}, talks: {}, stamps: [] });

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const dateMap = (v: unknown): Record<string, string> =>
  isObj(v) ? Object.fromEntries(Object.entries(v).filter(([, d]) => typeof d === "string" && DATE.test(d))) as Record<string, string> : {};

/** こわれた値でも 例外に しない */
export function parseLocalLibrary(raw: string | null | undefined): LocalLibrary {
  if (!raw) return emptyLibrary();
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    const stories: LocalLibrary["stories"] = {};
    if (isObj(v.stories)) {
      for (const [id, r] of Object.entries(v.stories)) {
        if (isObj(r) && typeof r.best === "number" && Number.isFinite(r.best) && typeof r.date === "string" && DATE.test(r.date)) stories[id] = { best: r.best, date: r.date };
      }
    }
    const stamps = Array.isArray(v.stamps) ? [...new Set(v.stamps.filter((d): d is string => typeof d === "string" && DATE.test(d)))].sort() : [];
    return { stories, chants: dateMap(v.chants), talks: dateMap(v.talks), stamps };
  } catch {
    return emptyLibrary();
  }
}

export function readLocalLibrary(): LocalLibrary {
  const s = storage();
  if (!s) return emptyLibrary();
  try {
    return parseLocalLibrary(s.getItem(LOCAL_LIBRARY_KEY));
  } catch {
    return emptyLibrary();
  }
}

function write(lib: LocalLibrary) {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(LOCAL_LIBRARY_KEY, JSON.stringify({ ...lib, stamps: lib.stamps.slice(-MAX_STAMPS) }));
  } catch {
    // いっぱい・きんし など。おまけの きろくなので むし
  }
}

export const hasStampToday = (lib: LocalLibrary, now = new Date()) => lib.stamps.includes(localDate(now));

/** よんだ おはなしの id（クイズを さいごまで やった もの） */
export const readStoryIds = (lib: LocalLibrary) => new Set(Object.keys(lib.stories));

/** 今月の スタンプの数（保護者むけ・一覧の 表示用） */
export function stampsThisMonth(lib: LocalLibrary, now = new Date()): number {
  const ym = localDate(now).slice(0, 7);
  return lib.stamps.filter((d) => d.startsWith(ym)).length;
}

/** れんぞくで スタンプが ある日数（きょう または きのう まで つづいていれば 数える） */
export function stampStreak(lib: LocalLibrary, now = new Date()): number {
  const set = new Set(lib.stamps);
  const DAY = 86_400_000;
  let t = now.getTime();
  if (!set.has(localDate(new Date(t)))) t -= DAY;
  let n = 0;
  while (set.has(localDate(new Date(t)))) { n++; t -= DAY; }
  return n;
}

export type LocalActivityResult = {
  /** やりきった（ごほうびの 対象） */
  completed: boolean;
  /** きょう はじめて → スタンプを おした */
  stampedNow: boolean;
  lib: LocalLibrary;
};

/**
 * としょかんで なにかを やった ときに 呼ぶ（つながっていても いなくても）。
 * きろくを のこし、やりきって いて きょう まだ なら スタンプを おす（1日1回）。
 */
export function recordLocalActivity(activity: LibraryActivity, story: Pick<Story, "questions"> | null = null, now = new Date(), base?: LocalLibrary): LocalActivityResult {
  const lib = base ?? readLocalLibrary();
  const today = localDate(now);
  const completed = isActivityComplete(activity, story);
  if (activity.kind === "story" && story) {
    const correct = story.questions.filter((q, i) => activity.answers[i] === q.answer).length;
    const prev = lib.stories[activity.id];
    lib.stories[activity.id] = { best: Math.max(prev?.best ?? 0, correct), date: today };
  } else if (activity.kind === "chant" && completed) {
    lib.chants[activity.id] = today;
  } else if (activity.kind === "talk" && activity.turns > 0) {
    lib.talks[activity.id] = today;
  }
  const stampedNow = completed && !lib.stamps.includes(today);
  if (stampedNow) lib.stamps = [...lib.stamps, today].sort();
  write(lib);
  return { completed, stampedNow, lib };
}
