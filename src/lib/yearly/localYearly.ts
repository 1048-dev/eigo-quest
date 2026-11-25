/**
 * 力だめしの きろく（この ブラウザの localStorage）。サーバーに つながらない おためしモード用。
 *  - おためしでは 1 回だけ（この 端末に 1 つでも あれば もう 受けられない）
 *  - こわれた値・localStorage が 使えない ときは「なにも ない」。例外は 投げない
 */
import type { YearlyGrowth, YearlyResult } from "./types";

export const LOCAL_YEARLY_KEY = "eigo-quest:yearly:v1";

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const isScores = (v: unknown) => isObj(v) && ["listening", "reading", "speaking", "writing"].every((k) => typeof v[k] === "number");

function isResult(v: unknown): v is YearlyResult {
  return isObj(v) && typeof v.stage === "number" && typeof v.takenOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v.takenOn)
    && isScores(v.scores) && isScores(v.scaled) && typeof v.total === "number" && typeof v.band === "string" && isObj(v.detail);
}

export function parseLocalYearly(raw: string | null | undefined): YearlyResult[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    const list = isObj(v) && Array.isArray(v.results) ? v.results : [];
    return list.filter(isResult).sort((a, b) => (a.takenOn < b.takenOn ? 1 : -1));
  } catch {
    return [];
  }
}

export function readLocalYearly(): YearlyResult[] {
  const s = storage();
  if (!s) return [];
  try {
    return parseLocalYearly(s.getItem(LOCAL_YEARLY_KEY));
  } catch {
    return [];
  }
}

/** 新しい 順で 保存する（同じ日の ものは 上書き） */
export function saveLocalYearly(result: YearlyResult): YearlyResult[] {
  const list = [result, ...readLocalYearly().filter((r) => r.takenOn !== result.takenOn)].slice(0, 10);
  const s = storage();
  if (s) {
    try {
      s.setItem(LOCAL_YEARLY_KEY, JSON.stringify({ results: list }));
    } catch {
      /* いっぱい・きんし */
    }
  }
  return list;
}

export type { YearlyGrowth };
