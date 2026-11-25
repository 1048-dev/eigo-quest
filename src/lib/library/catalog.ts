/**
 * えいごの としょかん の データの 読みこみ。
 *  - 索引（content/library/index.json・数 KB）だけ 静的に 読む → 一覧の 画面は これだけで 描ける
 *  - おはなしの 本文は ステージごとの JSON（stories-1.json / stories-2.json）を ひらいたときに あとから 読む（別チャンク）
 *  - チャンツ・フリートークの テーマも 別チャンク
 * サーバー（採点・ごほうび）でも 同じ 関数を 使う。おためしモード（サーバーに つながらない）でも ブラウザの チャンクで 動く。
 */
import indexRaw from "@content/library/index.json";
import type { Chant, LibraryIndex, LibraryKind, Story, TalkTheme } from "./types";

export const LIBRARY_INDEX = indexRaw as LibraryIndex;

/** おはなしが ある ステージ（ふやしたら ここと loadStoryStage と scripts/library-index.ts に 足す） */
export const STORY_STAGES = [1, 2] as const;

export async function loadStoryStage(stage: number): Promise<Story[]> {
  switch (stage) {
    case 1: return (await import("@content/library/stories-1.json")).default.stories as Story[];
    case 2: return (await import("@content/library/stories-2.json")).default.stories as Story[];
    default: return [];
  }
}

export async function loadStory(id: string): Promise<Story | null> {
  const meta = LIBRARY_INDEX.stories.find((s) => s.id === id);
  if (!meta) return null;
  const list = await loadStoryStage(meta.stage);
  return list.find((s) => s.id === id) ?? null;
}

export async function loadChants(): Promise<Chant[]> {
  return (await import("@content/library/chants.json")).default.chants as Chant[];
}

export async function loadChant(id: string): Promise<Chant | null> {
  return (await loadChants()).find((c) => c.id === id) ?? null;
}

export async function loadTalkThemes(): Promise<TalkTheme[]> {
  return (await import("@content/library/talk.json")).default.themes as TalkTheme[];
}

export async function loadTalkTheme(id: string): Promise<TalkTheme | null> {
  return (await loadTalkThemes()).find((t) => t.id === id) ?? null;
}

/** 索引から その アイテムの「ひらく レッスン」を さがす（ない id は null） */
export function metaOf(kind: LibraryKind, id: string): { id: string; unlockLesson: number; stage: number } | null {
  const list = kind === "story" ? LIBRARY_INDEX.stories : kind === "chant" ? LIBRARY_INDEX.chants : LIBRARY_INDEX.talks;
  return list.find((x) => x.id === id) ?? null;
}
