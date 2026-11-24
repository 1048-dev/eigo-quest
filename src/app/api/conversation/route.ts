import { getLesson } from "@/lib/curriculum";
import { converse } from "@/lib/conversation/aiConversation";
import { GENERIC_CONVERSATION, MAX_CONVERSATION_TURNS, scriptedReply } from "@/lib/conversation/engine";
import { jsonOk, readJsonBody, withApi } from "@/lib/api/server";
import { ConversationRequestSchema, type ConversationResponse } from "@/lib/api/contracts";

/**
 * POST /api/conversation — レッスンさいごの AIキャラとの かいわ（1ターン分の返事）。
 * サーバーは状態を持たない（履歴はクライアントが送る）。いつでも success:true。
 */
export const POST = withApi("conversation", async (req) => {
  const parsed = ConversationRequestSchema.safeParse(await readJsonBody(req));
  const input = parsed.success ? parsed.data : ConversationRequestSchema.parse({});
  const conversation = getLesson(input.lessonNo)?.conversation ?? GENERIC_CONVERSATION;
  const args = { conversation, character: input.character, history: input.history, childText: input.childText, maxTurns: MAX_CONVERSATION_TURNS };
  const r = await converse(args).catch(() => scriptedReply(args));
  return jsonOk({ success: true, ...r } satisfies ConversationResponse);
});
