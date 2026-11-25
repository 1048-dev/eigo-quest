/**
 * としょかんの 索引（content/library/index.json）を 本文の データから つくる 純粋関数。
 * scripts/library-index.ts が 書き出し、tests/library.test.ts が ずれていないかを 確かめる。
 */
import type { Chant, LibraryIndex, Story, TalkTheme } from "./types";
import { storyMinutes, storyWordCount } from "./rules";

export const LIBRARY_INDEX_NOTE = "自動生成（npm run library:index）。えいごの としょかん の 小さな 索引（本文なし）。本文は stories-N.json / chants.json / talk.json";

export function buildLibraryIndex(stories: Story[], chants: Chant[], talks: TalkTheme[]): LibraryIndex {
  const byUnlock = <T extends { unlockLesson: number; id: string }>(a: T, b: T) => a.unlockLesson - b.unlockLesson || a.id.localeCompare(b.id);
  return {
    note: LIBRARY_INDEX_NOTE,
    stories: [...stories].sort(byUnlock).map((s) => {
      const wordCount = storyWordCount(s);
      return { id: s.id, stage: s.stage, level: s.level, unlockLesson: s.unlockLesson, emoji: s.emoji, title: s.title, titleJa: s.titleJa, wordCount, minutes: storyMinutes(wordCount) };
    }),
    chants: [...chants].sort(byUnlock).map((c) => ({ id: c.id, stage: c.stage, unlockLesson: c.unlockLesson, emoji: c.emoji, title: c.title, titleJa: c.titleJa, focusJa: c.focusJa })),
    talks: [...talks].sort(byUnlock).map((t) => ({ id: t.id, stage: t.stage, unlockLesson: t.unlockLesson, emoji: t.emoji, character: t.character, titleJa: t.titleJa })),
  };
}
