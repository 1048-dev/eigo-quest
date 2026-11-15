/**
 * ステージ進行・ロック解除ロジック（純粋関数）。
 *
 * マップのノード列:  L1 → C1 → L2 → C2 → ... → L5 → MINI(1-5) → L6 → ... → L30 → BOSS(1-30) → L31 ...
 *   - L(n)    : その日のレッスン（約25分）
 *   - C(n)    : レッスン n の「翌日テスト」（約3〜5分）。5の倍数は MINI、30の倍数は BOSS が兼ねる
 * ルール:
 *   1. レッスン n+1 は「レッスン n の翌日テスト（またはまとめ/ボス）」合格で解放
 *   2. 翌日テストはレッスン完了日の“翌日以降”にしか受けられない（= 1日1レッスン）
 *   3. 何度でも再挑戦可（不合格でもロックは維持、解説を見てリトライ）
 */
import type { AssessmentDef, AssessmentKind } from "./types";

export type NodeType = "LESSON" | "CHECK" | "MINI" | "BOSS";
export type NodeStatus = "CLEARED" | "AVAILABLE" | "WAIT_TOMORROW" | "LOCKED";

export interface StageNode {
  key: string; // "L-1" | "T-check-1"
  type: NodeType;
  lessonNo: number; // LESSONなら自身、テストなら範囲の終端
  assessmentId?: string;
  world: number;
  status: NodeStatus;
}

export interface ProgressInput {
  totalLessons: number;
  lessonsPerWorld: number;
  /** lessonNo → 完了日 "YYYY-MM-DD" */
  completedLessons: ReadonlyMap<number, string>;
  /** assessmentId → 合格日 */
  passedTests: ReadonlyMap<string, string>;
  /** レッスン n の後に受けるゲートテスト */
  gateTestAfter: (n: number) => AssessmentDef | undefined;
  today: string;
  /** 開発・保護者モード用: 翌日待ちを無効化 */
  skipDailyLock?: boolean;
}

const kindToNode: Record<Exclude<AssessmentKind, "ARENA" | "TREASURE">, NodeType> = {
  DAILY_CHECK: "CHECK",
  MINI: "MINI",
  BOSS: "BOSS",
};

export function buildStageMap(p: ProgressInput): { nodes: StageNode[]; current: StageNode | null } {
  const nodes: StageNode[] = [];
  let blocked = false; // 先頭の未クリアノードより後ろはすべて LOCKED

  const push = (n: Omit<StageNode, "status">, cleared: boolean, readyToday: boolean) => {
    let status: NodeStatus;
    if (cleared) status = "CLEARED";
    else if (blocked) status = "LOCKED";
    else {
      status = readyToday ? "AVAILABLE" : "WAIT_TOMORROW";
      blocked = true;
    }
    nodes.push({ ...n, status });
  };

  for (let n = 1; n <= p.totalLessons; n++) {
    const world = Math.ceil(n / p.lessonsPerWorld);
    push({ key: `L-${n}`, type: "LESSON", lessonNo: n, world }, p.completedLessons.has(n), true);

    const gate = p.gateTestAfter(n);
    if (!gate || gate.kind === "ARENA" || gate.kind === "TREASURE") continue;
    const completedOn = p.completedLessons.get(n);
    const nextDayOk = p.skipDailyLock || (completedOn !== undefined && completedOn < p.today);
    push(
      { key: `T-${gate.id}`, type: kindToNode[gate.kind], lessonNo: n, assessmentId: gate.id, world },
      p.passedTests.has(gate.id),
      nextDayOk,
    );
  }

  const current = nodes.find((x) => x.status === "AVAILABLE" || x.status === "WAIT_TOMORROW") ?? null;
  return { nodes, current };
}

/** API 側のガード: このレッスンを今開始してよいか */
export function canStartLesson(map: StageNode[], lessonNo: number): { ok: boolean; reasonJa?: string } {
  const node = map.find((x) => x.key === `L-${lessonNo}`);
  if (!node) return { ok: false, reasonJa: "レッスンが見つかりません" };
  if (node.status === "CLEARED" || node.status === "AVAILABLE") return { ok: true };
  return { ok: false, reasonJa: "前のテストに合格すると開くよ！" };
}

export function canTakeGateTest(map: StageNode[], assessmentId: string): { ok: boolean; reasonJa?: string } {
  const node = map.find((x) => x.assessmentId === assessmentId);
  if (!node) return { ok: false, reasonJa: "テストが見つかりません" };
  if (node.status === "WAIT_TOMORROW") return { ok: false, reasonJa: "このテストは明日になったら受けられるよ。今日はゆっくり休もう！" };
  if (node.status === "LOCKED") return { ok: false, reasonJa: "まだロックされています" };
  return { ok: true }; // CLEARED（再挑戦）も可
}
