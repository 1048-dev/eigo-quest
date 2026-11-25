"use client";
/**
 * 力だめしの 画面用: サーバーと この ブラウザの きろくを まとめる。
 *  - つながっている → サーバーが 受けられるかを きめ、採点・保存する（AI 採点も サーバー）
 *  - つながらない（おためしモード）→ この ブラウザで ルール採点して localStorage に のこす。1 回だけ
 */
import { apiGet, apiRequest } from "@/lib/api/client";
import { YearlyStatusResponseSchema, YearlySubmitResponseSchema, type YearlySummaryDto } from "@/lib/api/contracts";
import { localDate } from "@/lib/domain/dates";
import { readLocalProgress } from "@/lib/offline/localProgress";
import { reachedLessonFrom } from "@/lib/library/rules";
import { testStageFor, yearlyAvailability, type YearlyAvailability } from "./availability";
import { buildResult, growthBetween, sanitizeAnswers } from "./scoring";
import { readLocalYearly, saveLocalYearly } from "./localYearly";
import type { YearlyAnswers, YearlyGrowth, YearlyResult, YearlyTest } from "./types";

export interface YearlyState {
  offline: boolean;
  stage: number;
  reachedLesson: number;
  isTrial: boolean;
  availability: YearlyAvailability;
  /** 新しい 順 */
  history: YearlySummaryDto[];
}

const localSummary = (r: YearlyResult, i: number): YearlySummaryDto => ({
  id: `local-${i}`, stage: r.stage, takenOn: r.takenOn, scores: r.scores, total: r.total, band: r.band, scaled: r.scaled, gradedBy: r.gradedBy,
});

export async function loadYearlyState(): Promise<YearlyState> {
  const r = await apiGet("/api/yearly", YearlyStatusResponseSchema);
  if (r.ok && !r.data.offline) {
    return { offline: false, stage: r.data.stage, reachedLesson: r.data.reachedLesson, isTrial: r.data.isTrial, availability: r.data.availability, history: r.data.history };
  }
  const reachedLesson = reachedLessonFrom(Object.keys(readLocalProgress().lessons).map(Number));
  const local = readLocalYearly();
  return {
    offline: true,
    stage: testStageFor(reachedLesson),
    reachedLesson,
    isTrial: true,
    availability: yearlyAvailability({ isTrial: true, takenDays: local.map((x) => x.takenOn), today: localDate(new Date()) }),
    history: local.map(localSummary),
  };
}

export type SubmitOutcome =
  | { ok: true; result: YearlyResult; growth: YearlyGrowth | null; saved: boolean; messageJa: string }
  | { ok: false; messageJa: string };

export async function submitYearlyTest(test: YearlyTest, answers: YearlyAnswers, offline: boolean): Promise<SubmitOutcome> {
  const scoreHere = (messageJa: string): SubmitOutcome => {
    const prev = readLocalYearly()[0];
    const result = buildResult(test, sanitizeAnswers(test, answers), localDate(new Date()));
    saveLocalYearly(result);
    return { ok: true, result, growth: prev ? growthBetween(prev, result) : null, saved: false, messageJa };
  };
  if (offline) return scoreHere("けっかは この たんまつに のこしたよ（おためしモード）。");
  // AI 採点を 待つので ながめに 待つ（二重送信を さけるため リトライは しない）
  const r = await apiRequest("/api/yearly/submit", YearlySubmitResponseSchema, { method: "POST", body: JSON.stringify({ stage: test.stage, answers }) }, { timeoutMs: 45_000, retries: 0 });
  if (r.ok && r.data.ok && r.data.result) {
    const result = r.data.result as YearlyResult;
    if (!r.data.saved) {
      // サーバーは 動いているが DB に 保存できなかった → この 端末に のこす
      const prev = readLocalYearly()[0];
      saveLocalYearly(result);
      return { ok: true, result, growth: prev ? growthBetween(prev, result) : null, saved: false, messageJa: r.data.messageJa };
    }
    return { ok: true, result, growth: r.data.growth, saved: true, messageJa: r.data.messageJa };
  }
  if (r.status === 409 || r.status === 404) return { ok: false, messageJa: r.error ?? "いまは 受けられないよ。" };
  // サーバーに とどかない → この 端末で 採点
  return scoreHere("サーバーに つながらなかったので、けっかは この たんまつに のこしたよ。");
}
