/**
 * この端末の「おためしの きろく」（run4 Phase 1: 保護者が登録したあと、子どもに ひきつぐため）。
 *
 *  - おためしモード（ログインしていない = デモユーザー、または サーバーに つながらない）で
 *    クリアしたレッスン・合格したテスト・もらったコイン・あそんだ日・答えた項目を この ブラウザの localStorage に だけ のこす。
 *    デモユーザーは ほかの おためしの人と共有なので、DB からではなく「この端末で あそんだ分」を ここで おぼえておく。
 *  - 以前からある オフラインの きろく（localProgress）も いっしょに ひきつぐ。
 *  - 「ひきつぐ？」は 端末ごとに1回だけ（はい・いいえ どちらでも しるしを のこす）。
 *  - localStorage が 使えない・こわれた値 → 「なにも ない」。例外は 投げない。
 */
import { localDate } from "@/lib/domain/dates";
import { isTrialDataEmpty, type TrialCarryData } from "@/lib/domain/trialMerge";
import { LOCAL_PROGRESS_KEY, readLocalProgress } from "./localProgress";

export const TRIAL_LOG_KEY = "eigo-quest:trial-log:v1";
/** "carried" = ひきついだ / "declined" = 「いいえ」をえらんだ（もう きかない） */
export const TRIAL_CARRY_FLAG_KEY = "eigo-quest:trial-carry:v1";

const MAX_ITEMS = 8000;
const MAX_DATES = 800;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

function newTrialId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  } catch {
    // つかえない環境は 下へ
  }
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
}

const emptyLog = (): TrialCarryData => ({ trialId: newTrialId(), lessons: {}, tests: {}, coins: 0, studyDates: [], items: {} });

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
const dateMap = (v: unknown): Record<string, string> =>
  isObj(v) ? Object.fromEntries(Object.entries(v).filter((e): e is [string, string] => typeof e[1] === "string" && DATE_RE.test(e[1]))) : {};

/** こわれた値でも 例外に しない（trialId が無ければ 新しく つくる） */
export function parseTrialLog(raw: string | null | undefined): TrialCarryData {
  if (!raw) return emptyLog();
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    if (!isObj(v)) return emptyLog();
    const items: TrialCarryData["items"] = {};
    if (isObj(v.items)) {
      for (const [k, r] of Object.entries(v.items)) {
        if (isObj(r) && typeof r.ok === "boolean" && typeof r.t === "number" && Number.isFinite(r.t)) items[k] = { t: r.t, ok: r.ok };
      }
    }
    return {
      trialId: typeof v.trialId === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(v.trialId) ? v.trialId : newTrialId(),
      lessons: dateMap(v.lessons),
      tests: dateMap(v.tests),
      coins: typeof v.coins === "number" && Number.isFinite(v.coins) && v.coins > 0 ? Math.floor(v.coins) : 0,
      studyDates: Array.isArray(v.studyDates) ? v.studyDates.filter((d): d is string => typeof d === "string" && DATE_RE.test(d)) : [],
      items,
    };
  } catch {
    return emptyLog();
  }
}

function readLog(): TrialCarryData {
  const s = storage();
  if (!s) return emptyLog();
  try {
    return parseTrialLog(s.getItem(TRIAL_LOG_KEY));
  } catch {
    return emptyLog();
  }
}

function writeLog(log: TrialCarryData) {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(TRIAL_LOG_KEY, JSON.stringify(log));
  } catch {
    // いっぱい・きんし → おためしの おまけなので むし
  }
}

function addStudyDate(log: TrialCarryData, day: string) {
  if (!log.studyDates.includes(day)) log.studyDates = [...log.studyDates, day].sort().slice(-MAX_DATES);
}

/** おためしで レッスンを クリアした（コイン・答えた項目も のこす） */
export function recordTrialLesson(lessonNo: number, input: { coins?: number; logs?: readonly { itemId: string; correct: boolean }[] } = {}, now = new Date()) {
  if (!Number.isInteger(lessonNo) || lessonNo < 1) return;
  const log = readLog();
  const day = localDate(now);
  log.lessons[String(lessonNo)] ??= day;
  if (input.coins && input.coins > 0) log.coins += Math.floor(input.coins);
  for (const l of input.logs ?? []) {
    if (!l?.itemId) continue;
    const prev = log.items[l.itemId];
    if (!prev && Object.keys(log.items).length >= MAX_ITEMS) continue;
    // 同じレッスンで 何回も出た項目は「ぜんぶ正解なら正解」
    log.items[l.itemId] = prev && prev.t === now.getTime() ? { t: prev.t, ok: prev.ok && l.correct } : { t: now.getTime(), ok: l.correct };
  }
  addStudyDate(log, day);
  writeLog(log);
}

/** おためしで テストを うけた（合格なら きろく。アリーナ・お宝は コインだけ） */
export function recordTrialTest(assessmentId: string, input: { passed: boolean; coins?: number }, now = new Date()) {
  if (!assessmentId) return;
  const log = readLog();
  const day = localDate(now);
  if (input.passed && !/^(arena|treasure)-/.test(assessmentId)) log.tests[assessmentId] ??= day;
  if (input.coins && input.coins > 0) log.coins += Math.floor(input.coins);
  addStudyDate(log, day);
  writeLog(log);
}

/** ひきつぐ きろく（おためしの きろく + 以前からの オフラインの きろく）。trialId は端末に保存して いつも同じ */
export function readTrialCarryData(): TrialCarryData {
  const log = readLog();
  const legacy = readLocalProgress();
  const lessons = { ...legacy.lessons, ...log.lessons };
  const tests = { ...legacy.tests, ...log.tests };
  // 以前からの オフラインの きろくだけ のときも、ID が かわらないように 保存しておく
  if (storage()?.getItem(TRIAL_LOG_KEY) == null) writeLog(log);
  return { ...log, lessons, tests, studyDates: [...new Set([...log.studyDates, ...Object.values(lessons), ...Object.values(tests)])].sort().slice(-MAX_DATES) };
}

export function readCarryFlag(): "carried" | "declined" | null {
  try {
    const v = storage()?.getItem(TRIAL_CARRY_FLAG_KEY);
    return v === "carried" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

/** 「おためしで あそんだ きろくを ひきつぐ？」を出すか（まだ きいていない + ひきつぐものが ある） */
export function shouldOfferCarryOver(): boolean {
  if (!storage() || readCarryFlag()) return false;
  return !isTrialDataEmpty(readTrialCarryData());
}

export function markCarryOver(state: "carried" | "declined") {
  try {
    storage()?.setItem(TRIAL_CARRY_FLAG_KEY, state);
  } catch {
    // むし
  }
}

/** ひきついだあと: この端末の おためしの きろくを けす（オフラインの マップの ✓ も） */
export function clearTrialRecords() {
  const s = storage();
  if (!s) return;
  try {
    s.removeItem(TRIAL_LOG_KEY);
    s.removeItem(LOCAL_PROGRESS_KEY);
  } catch {
    // むし
  }
}
