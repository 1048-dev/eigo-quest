/**
 * ワールド13〜40 の フォニックス問題の 登録（run8: ワールドごとに あとから 読む）。
 *
 * 問題の コードと 表（./phonicsQ/wNN.ts と ./wNNPhonics.ts）は 1 ワールド 約 3〜5 kB。28 ワールドぶんを
 * ブラウザの 最初の 読みこみに 入れると /map・/lesson が 約 100 kB 重く なるので、
 *   - サーバー（Node・API・テスト）: ./bundledPhonics.ts が ぜんぶ 同期で 登録する（今までどおり すぐ つかえる）
 *   - ブラウザ: next.config.ts が bundledPhonics を 空の bundledPhonics.browser.ts に 差しかえる。
 *     おためし・オフラインで 問題を 作る まえに ensurePhonicsLoaded(lessonNo) で 必要な ワールドだけ 読む。
 *
 * wNN の 問題は「その ワールドの はじめ（W${N}_START）より あとの 回」だけで はたらく（ふりかえり回で まえの ワールドの
 * つづりも 問う）。なので lessonNo の 回の 問題を 作るには ワールド13〜(その回の ワールド) を ぜんぶ 読む。
 */
import type { LearningItemDef } from "@/lib/domain/types";
import { CURRICULUM_RULES } from "@/lib/domain/config";
import type { Question } from "./questions";
import { BUNDLED_PHONICS } from "./bundledPhonics";

export type WorldPhonicsQuestion = Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> & { display?: string; audioText?: string };

export interface WorldPhonics {
  world: number;
  /** この ワールドの 問題が はたらく さいしょの レッスン */
  start: number;
  question: (item: LearningItemDef, rng: () => number) => WorldPhonicsQuestion | null;
  /** フォーカスの 読み上げ（vowelTeams.focusSay） */
  say?: (focus: string, words: readonly string[]) => string | null;
  /** フォーカスの ボタンの おてほん（phonicsButtons.focusExampleWord） */
  example?: (focus: string, words: readonly string[]) => string | null;
}

export const FIRST_LAZY_PHONICS_WORLD = 13;
export const LAST_PHONICS_WORLD = 40;

const LOADERS: Record<number, () => Promise<{ phonics: WorldPhonics }>> = {
  13: () => import("./phonicsQ/w13"),
  14: () => import("./phonicsQ/w14"),
  15: () => import("./phonicsQ/w15"),
  16: () => import("./phonicsQ/w16"),
  17: () => import("./phonicsQ/w17"),
  18: () => import("./phonicsQ/w18"),
  19: () => import("./phonicsQ/w19"),
  20: () => import("./phonicsQ/w20"),
  21: () => import("./phonicsQ/w21"),
  22: () => import("./phonicsQ/w22"),
  23: () => import("./phonicsQ/w23"),
  24: () => import("./phonicsQ/w24"),
  25: () => import("./phonicsQ/w25"),
  26: () => import("./phonicsQ/w26"),
  27: () => import("./phonicsQ/w27"),
  28: () => import("./phonicsQ/w28"),
  29: () => import("./phonicsQ/w29"),
  30: () => import("./phonicsQ/w30"),
  31: () => import("./phonicsQ/w31"),
  32: () => import("./phonicsQ/w32"),
  33: () => import("./phonicsQ/w33"),
  34: () => import("./phonicsQ/w34"),
  35: () => import("./phonicsQ/w35"),
  36: () => import("./phonicsQ/w36"),
  37: () => import("./phonicsQ/w37"),
  38: () => import("./phonicsQ/w38"),
  39: () => import("./phonicsQ/w39"),
  40: () => import("./phonicsQ/w40"),
};

const loaded = new Map<number, WorldPhonics>();
for (const p of BUNDLED_PHONICS) loaded.set(p.world, p);
const pending = new Map<number, Promise<void>>();

const worldOfLesson = (lessonNo: number) => Math.ceil(lessonNo / CURRICULUM_RULES.lessonsPerWorld);

/** lessonNo の 回の 問題に いる ワールド（13〜その回の ワールド。ワールド12 までの 回は なし） */
export function phonicsWorldsFor(lessonNo: number): number[] {
  const last = Math.min(LAST_PHONICS_WORLD, worldOfLesson(lessonNo));
  const out: number[] = [];
  for (let n = FIRST_LAZY_PHONICS_WORLD; n <= last; n++) out.push(n);
  return out;
}

/** 読みこみずみの ワールドの 問題（なければ undefined） */
export const worldPhonics = (world: number): WorldPhonics | undefined => loaded.get(world);

/** ブラウザ用: lessonNo の 回（と それより まえ）の 問題に いる ワールドを 読みこむ。サーバーでは なにも しない */
export async function ensurePhonicsLoaded(lessonNo: number): Promise<void> {
  await Promise.all(phonicsWorldsFor(lessonNo).map((n) => {
    if (loaded.has(n)) return undefined;
    let p = pending.get(n);
    if (!p) {
      p = LOADERS[n]().then((m) => { loaded.set(n, m.phonics); }).finally(() => pending.delete(n));
      pending.set(n, p);
    }
    return p;
  }));
}

/** 問題を 作る まえの たしかめ: 読みこんで いない ワールドが あると ちがう 問題に なるので、だまって すすまない */
export function assertPhonicsLoaded(lessonNo: number): void {
  const missing = phonicsWorldsFor(lessonNo).filter((n) => !loaded.has(n));
  if (missing.length) throw new Error(`phonics worlds not loaded for L${lessonNo}: ${missing.join(",")} (call ensurePhonicsLoaded first)`);
}
