import { currentUserId } from "@/lib/auth";
import { isDbUp } from "@/lib/db";
import { converse } from "@/lib/conversation/aiConversation";
import { scriptedReply } from "@/lib/conversation/engine";
import { jsonError, jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import { LibraryTalkRequestSchema, type ConversationResponse } from "@/lib/api/contracts";
import { loadTalkTheme } from "@/lib/library/catalog";
import { isTalkUnlocked } from "@/lib/library/rules";
import { FREE_TALK_TURNS, themeConversation } from "@/lib/library/talk";
import { getReachedLesson } from "@/lib/services/libraryService";
import { LIBRARY_RULES } from "@/lib/domain/config";

/**
 * POST /api/library/talk — としょかんの AI フリートーク（1ターン分の 返事）。サーバーは 状態を 持たない（履歴は ブラウザが 送る）。
 *  - ひらいていない テーマは 403（AI の 費用を むだに しない）
 *  - DB が 止まっていて 解放を 確かめられない ときは AI を 使わず 台本の 返事（おためしモードと 同じ）
 *  - AI が 使えない・エラーの ときも 台本の 返事。いつでも success:true
 */
export const POST = withApi("library-talk", async (req) => {
  const input = LibraryTalkRequestSchema.parse(await readJsonBody(req));
  const theme = await loadTalkTheme(input.themeId);
  if (!theme) return jsonError("その テーマは みつからないよ。", 404);
  const conversation = themeConversation(theme);
  const args = { conversation, character: theme.character, history: input.history, childText: input.childText, maxTurns: FREE_TALK_TURNS, mode: "free" as const, stage: theme.stage };

  let verified = false;
  try {
    if (await isDbUp()) {
      const reached = await getReachedLesson(await currentUserId());
      if (!isTalkUnlocked(theme, reached)) return jsonError(`Lesson ${Math.max(theme.unlockLesson, LIBRARY_RULES.freeTalkUnlockLesson)} を クリアすると ひらくよ。`, 403, { code: "LOCKED" });
      verified = true;
    }
  } catch (e) {
    console.error("[api:library-talk] could not check unlock; using scripted reply", e);
  }
  const r = verified ? await converse(args).catch(() => scriptedReply(args)) : scriptedReply(args);
  return jsonOk({ success: true, ...r } satisfies ConversationResponse);
});
