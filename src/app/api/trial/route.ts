import { authOk, withAuthApi } from "@/lib/auth/api";
import { currentTrialLearner } from "@/lib/auth/trialLearner";
import type { TrialStatusResponse } from "@/lib/api/contracts";
import { getTrialStatus } from "@/lib/services/trialCarryService";

const NONE = { hasProgress: false, ref: null, lessons: 0, tests: 0, coins: 0 };

/**
 * GET /api/trial — この端末の おためし学習者（DB）に ひきつげる きろくが あるか（run5 Phase 1）。
 * cookie を読むだけ（おためし学習者を つくらない・書かない）。DB 停止時は「なし」。
 */
export const GET = withAuthApi("trial-status", async () => {
  const trial = await currentTrialLearner();
  const status = await getTrialStatus(trial?.id ?? null);
  return authOk({ ...status } satisfies Omit<TrialStatusResponse, "ok" | "success" | "messageJa">);
}, { offline: () => NONE });
