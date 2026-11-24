/**
 * ステージ進行・ロック解除ロジック（純粋関数）。
 *
 * マップのノード列:  L1 → C1 → L2 → C2 → ... → L5 → C5 → MINI(1-5) → L6 → ... → L30 → C30 → BOSS(1-30) → L31 ...
 *   - L(n)    : レッスン（約25分）。1日に何レッスンでも進められる
 *   - C(n)    : レッスン n の「復習クエスト」（約3〜5分）。すべてのレッスンにある
 *   - MINI / BOSS : 5の倍数 / 30の倍数レッスンの後の「ゲート」
 * ルール:
 *   1. レッスン n+1 は「レッスン n 完了」＋「n の後のゲート（あれば）合格」ですぐ解放。ゲートもすぐ受けられる
 *   2. 復習クエストは進行をブロックしない。レッスン完了日は WAIT_TOMORROW、翌日以降 AVAILABLE、合格で CLEARED
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
  /** レッスン n の後のゲート（MINI / BOSS）。無ければ undefined */
  gateTestAfter: (n: number) => AssessmentDef | undefined;
  /** レッスン n の復習クエスト（DAILY_CHECK）。省略時は復習クエストをマップに出さない */
  reviewQuestFor?: (n: number) => AssessmentDef | undefined;
  today: string;
  /** 開発・保護者モード用: 復習クエストの「翌日まで待つ」を無効化（ゲートには影響しない） */
  skipDailyLock?: boolean;
}

const kindToNode: Record<Exclude<AssessmentKind, "ARENA" | "TREASURE">, NodeType> = {
  DAILY_CHECK: "CHECK",
  MINI: "MINI",
  BOSS: "BOSS",
};

export function buildStageMap(p: ProgressInput): { nodes: StageNode[]; current: StageNode | null } {
  const nodes: StageNode[] = [];
  let blocked = false; // 先頭の未クリア「ブロッキングノード」より後ろはすべて LOCKED

  /** レッスン・ゲート: 順番どおりに1つずつ開く */
  const pushBlocking = (n: Omit<StageNode, "status">, cleared: boolean) => {
    let status: NodeStatus;
    if (cleared) status = "CLEARED";
    else if (blocked) status = "LOCKED";
    else {
      status = "AVAILABLE";
      blocked = true;
    }
    nodes.push({ ...n, status });
  };

  for (let n = 1; n <= p.totalLessons; n++) {
    const world = Math.ceil(n / p.lessonsPerWorld);
    const completedOn = p.completedLessons.get(n);
    pushBlocking({ key: `L-${n}`, type: "LESSON", lessonNo: n, world }, completedOn !== undefined);

    // 復習クエスト（ブロックしない）
    const review = p.reviewQuestFor?.(n);
    if (review && review.kind === "DAILY_CHECK") {
      let status: NodeStatus;
      if (p.passedTests.has(review.id)) status = "CLEARED";
      else if (completedOn === undefined) status = "LOCKED";
      else if (!p.skipDailyLock && completedOn >= p.today) status = "WAIT_TOMORROW";
      else status = "AVAILABLE";
      nodes.push({ key: `T-${review.id}`, type: "CHECK", lessonNo: n, assessmentId: review.id, world, status });
    }

    // ゲート（まとめ / ボス）: レッスン完了後すぐ受けられる
    const gate = p.gateTestAfter(n);
    if (!gate || (gate.kind !== "MINI" && gate.kind !== "BOSS")) continue;
    pushBlocking(
      { key: `T-${gate.id}`, type: kindToNode[gate.kind], lessonNo: n, assessmentId: gate.id, world },
      p.passedTests.has(gate.id),
    );
  }

  return { nodes, current: pickCurrent(nodes) };
}

/**
 * 「きょうのクエスト」: 受けられる復習クエスト（いちばんお得）→ 次のレッスン/ゲート の順。
 * どちらも無いとき（全レッスン完了など）は、あした開く復習クエストを返す。
 */
export function pickCurrent(nodes: readonly StageNode[]): StageNode | null {
  return (
    nodes.find((x) => x.type === "CHECK" && x.status === "AVAILABLE") ??
    nodes.find((x) => x.type !== "CHECK" && x.status === "AVAILABLE") ??
    nodes.find((x) => x.status === "WAIT_TOMORROW") ??
    null
  );
}

/** API 側のガード: このレッスンを今開始してよいか */
export function canStartLesson(map: StageNode[], lessonNo: number): { ok: boolean; reasonJa?: string } {
  const node = map.find((x) => x.key === `L-${lessonNo}`);
  if (!node) return { ok: false, reasonJa: "レッスンが見つかりません" };
  if (node.status === "CLEARED" || node.status === "AVAILABLE") return { ok: true };
  return { ok: false, reasonJa: "まえのレッスンやテストをクリアすると開くよ！" };
}

export function canTakeGateTest(map: StageNode[], assessmentId: string): { ok: boolean; reasonJa?: string } {
  const node = map.find((x) => x.assessmentId === assessmentId);
  if (!node) return { ok: false, reasonJa: "テストが見つかりません" };
  if (node.status === "WAIT_TOMORROW") {
    return { ok: false, reasonJa: "この復習クエストは あしたになったら ひらくよ。きょうは つぎのレッスンに すすめるよ！" };
  }
  if (node.status === "LOCKED") {
    return { ok: false, reasonJa: node.type === "CHECK" ? "レッスンをクリアすると 復習クエストが ひらくよ！" : "まだロックされています" };
  }
  return { ok: true }; // CLEARED（再挑戦）も可
}
