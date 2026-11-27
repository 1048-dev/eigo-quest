/**
 * としょかんの AI フリートーク: テーマ → レッスンの かいわと 同じ形（LessonConversation）。
 * こうすると AI の 返事（aiConversation.ts の free モード）も、AI が 使えない ときの 台本エンジン（engine.ts）も そのまま 使える。
 */
import type { LessonConversation } from "@/lib/domain/types";
import type { TalkTheme } from "./types";

/** フリートークの 子どもの 発話の 回数（台本エンジンの 上限と 同じ） */
export const FREE_TALK_TURNS = 6;

export function themeConversation(t: TalkTheme): LessonConversation {
  return {
    scene: t.scene,
    sceneJa: t.sceneJa,
    lines: t.lines.map((l) => ({ speaker: l.speaker, en: l.en, ja: l.ja })),
    aiTask: { goalJa: t.goalJa, starterEn: t.starterEn, targetExpressions: t.targetExpressions, ...(t.examples?.length ? { examples: t.examples } : {}) },
  };
}
