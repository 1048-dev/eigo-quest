import { z } from "zod";
import { currentUserId } from "@/lib/auth";
import { toPublic } from "@/lib/curriculum/questions";
import { startTest } from "@/lib/services/progressService";
import { jsonError, jsonOk, readJsonBody, withOffline } from "@/lib/api/server";
import { offlineTestStart } from "@/lib/offline/tests";
import type { TestStartResponse } from "@/lib/api/contracts";
import { e2eAnswersOf } from "@/lib/offline/tests";

const Body = z.object({
  arenaMode: z.enum(["MIXED", "LISTENING", "SPEAKING", "WRITING"]).optional().catch(undefined),
  reviewAlertId: z.string().optional().catch(undefined),
}).catch({});

/** POST /api/tests/:id/start — 出題（正解は伏せて返す）。body: { arenaMode?, reviewAlertId? } */
export const POST = withOffline<{ params: Promise<{ assessmentId: string }> }>("test-start", async (req, { params }) => {
  const body = Body.parse(await readJsonBody(req));
  const r = await startTest(await currentUserId(), (await params).assessmentId, body);
  if (!r.ok) return jsonError(r.reasonJa ?? "テストを始められなかったよ。", 403);
  return jsonOk({ assessment: r.assessment, seed: r.seed, questions: r.questions.map(toPublic), ...e2eAnswersOf(r.questions) } satisfies TestStartResponse);
}, async (req, { params }) => offlineTestStart((await params).assessmentId, Body.parse(await readJsonBody(req))));
