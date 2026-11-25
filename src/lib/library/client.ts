"use client";
/**
 * としょかんの 画面用: サーバーと この ブラウザの きろくを まとめる。
 *  - つながっている → サーバーの 到達レッスンで 解放、コインは サーバーが 付ける
 *  - つながらない（おためしモード）→ この ブラウザで クリアした レッスン（lib/offline/localProgress）で 解放、スタンプだけ
 * どちらでも スタンプ（1日1回）は この ブラウザに のこす。
 */
import { apiGet, apiPost } from "@/lib/api/client";
import { LibraryRewardResponseSchema, LibraryStatusResponseSchema } from "@/lib/api/contracts";
import { COIN_RULES } from "@/lib/domain/config";
import { readLocalProgress } from "@/lib/offline/localProgress";
import { hasStampToday, readLocalLibrary, recordLocalActivity, type LocalLibrary } from "./localLibrary";
import { reachedLessonFrom, type LibraryActivity } from "./rules";
import type { Story } from "./types";

export interface LibraryState {
  reachedLesson: number;
  offline: boolean;
  /** サーバーの コイン（おためしモードでは 0） */
  coins: number;
  /** きょうの ごほうびを もう もらったか（サーバー または スタンプ） */
  rewardedToday: boolean;
  dailyCoins: number;
  local: LocalLibrary;
}

/** この ブラウザで クリアした レッスンから 到達レッスンを だす（おためしモード用） */
export const localReachedLesson = () => reachedLessonFrom(Object.keys(readLocalProgress().lessons).map(Number));

export async function loadLibraryState(): Promise<LibraryState> {
  const r = await apiGet("/api/library", LibraryStatusResponseSchema);
  const local = readLocalLibrary();
  if (r.ok && !r.data.offline) {
    return { reachedLesson: r.data.reachedLesson, offline: false, coins: r.data.coins, rewardedToday: r.data.rewardedToday, dailyCoins: r.data.dailyCoins, local };
  }
  return { reachedLesson: localReachedLesson(), offline: true, coins: 0, rewardedToday: hasStampToday(local), dailyCoins: COIN_RULES.libraryDaily, local };
}

export interface FinishResult {
  completed: boolean;
  /** きょう はじめて → スタンプ */
  stampedNow: boolean;
  coinsAwarded: number;
  messageJa: string;
}

/** おはなし（クイズ）・チャンツ・フリートークを おえた ときに 呼ぶ */
export async function finishActivity(activity: LibraryActivity, story: Pick<Story, "questions"> | null, offline: boolean): Promise<FinishResult> {
  const local = recordLocalActivity(activity, story);
  if (!local.completed) {
    return { completed: false, stampedNow: false, coinsAwarded: 0, messageJa: activity.kind === "story" ? "2もん いじょう あたると スタンプが もらえるよ。もういちど よんでみよう！" : "さいごまで やると スタンプが もらえるよ。" };
  }
  const stampMsg = local.stampedNow ? "きょうの スタンプ ゲット！" : "きょうの スタンプは もう もらったよ。";
  if (offline) return { completed: true, stampedNow: local.stampedNow, coinsAwarded: 0, messageJa: `${stampMsg}（おためしモードでは コインは きろくされないよ）` };
  const body = activity.kind === "story" ? { kind: "story", id: activity.id, answers: activity.answers }
    : activity.kind === "chant" ? { kind: "chant", id: activity.id, finished: activity.finished }
      : { kind: "talk", id: activity.id, turns: activity.turns };
  const r = await apiPost("/api/library/reward", LibraryRewardResponseSchema, body);
  if (!r.ok) return { completed: true, stampedNow: local.stampedNow, coinsAwarded: 0, messageJa: stampMsg };
  const coins = r.data.coinsAwarded;
  return { completed: true, stampedNow: local.stampedNow, coinsAwarded: coins, messageJa: coins > 0 ? `${stampMsg} 🪙+${coins}` : stampMsg };
}
