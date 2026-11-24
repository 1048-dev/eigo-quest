/**
 * おためしモード（サーバー・DBに つながらない）で クリアした レッスン / テストを、
 * この ブラウザの localStorage に だけ おぼえておく。
 *
 *  - マップを 内蔵データで 出すときに 使う（クリアした レッスンに ✓・「きょうのまとめ」リンクが出る）
 *  - コインや 習得率は 保存しない（サーバーの きろくが 正しい。つながったら サーバーの マップを そのまま 使う）
 *  - localStorage が 使えない（SSR・プライベートモード・こわれた値）ときは 「なにも ない」として あつかう。例外は 投げない
 */
import { localDate } from "@/lib/domain/dates";

export interface LocalProgress {
  /** lessonNo → クリアした日 "YYYY-MM-DD" */
  lessons: Record<string, string>;
  /** assessmentId → 合格した日 */
  tests: Record<string, string>;
}

export const LOCAL_PROGRESS_KEY = "eigo-quest:offline-progress:v1";

const empty = (): LocalProgress => ({ lessons: {}, tests: {} });

function storage(): Storage | null {
  try {
    return typeof window !== "undefined" && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

const isDateMap = (v: unknown): v is Record<string, string> =>
  !!v && typeof v === "object" && !Array.isArray(v) && Object.values(v as object).every((x) => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x));

/** こわれた値でも 例外に しない */
export function parseLocalProgress(raw: string | null | undefined): LocalProgress {
  if (!raw) return empty();
  try {
    const v = JSON.parse(raw) as { lessons?: unknown; tests?: unknown };
    return { lessons: isDateMap(v?.lessons) ? v.lessons : {}, tests: isDateMap(v?.tests) ? v.tests : {} };
  } catch {
    return empty();
  }
}

export function readLocalProgress(): LocalProgress {
  const s = storage();
  if (!s) return empty();
  try {
    return parseLocalProgress(s.getItem(LOCAL_PROGRESS_KEY));
  } catch {
    return empty();
  }
}

function write(p: LocalProgress) {
  const s = storage();
  if (!s) return;
  try {
    s.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(p));
  } catch {
    // いっぱい・きんし など。おためしモードの おまけなので むし
  }
}

/** おためしモードで レッスンを クリアした（さいしょに クリアした日を のこす） */
export function recordLocalLesson(lessonNo: number, now = new Date()) {
  if (!Number.isInteger(lessonNo) || lessonNo < 1) return;
  const p = readLocalProgress();
  p.lessons[String(lessonNo)] ??= localDate(now);
  write(p);
}

/** おためしモードで テストに 合格した */
export function recordLocalTestPass(assessmentId: string, now = new Date()) {
  if (!assessmentId) return;
  const p = readLocalProgress();
  p.tests[assessmentId] ??= localDate(now);
  write(p);
}

/** buildStageMap に わたせる形 */
export function toProgressMaps(p: LocalProgress): { completedLessons: Map<number, string>; passedTests: Map<string, string> } {
  const completedLessons = new Map<number, string>();
  for (const [k, d] of Object.entries(p.lessons)) {
    const n = Number(k);
    if (Number.isInteger(n) && n > 0) completedLessons.set(n, d);
  }
  return { completedLessons, passedTests: new Map(Object.entries(p.tests)) };
}
