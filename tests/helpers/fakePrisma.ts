/**
 * テスト用のメモリ内 Prisma（認証・保護者 API が使う範囲だけ）。
 * where: 等号 / { in } / { not } / { lt, lte, gt, gte } / OR、複合ユニークキー（userId_lessonNo など）に対応。
 */
import { randomUUID } from "node:crypto";

type Row = Record<string, unknown>;
type Where = Record<string, unknown>;

const UNIQUE: Record<string, string[]> = {
  parent: ["email"],
  session: ["tokenHash"],
  user: ["friendCode"],
  coinLedger: ["idempotencyKey"],
};

const DEFAULTS: Record<string, () => Row> = {
  parent: () => ({ settings: {}, subscriptionStatus: "TRIALING", planId: null, currentPeriodEnd: null }),
  session: () => ({ selectedChildId: null, pinVerifiedAt: null }),
  user: () => ({ parentId: null, birthYear: null, schoolGrade: null, avatar: {}, avatarCharacter: "haru", coins: 0, totalCoinsEarned: 0, streakDays: 0, longestStreak: 0, lastStudyDate: null }),
  lessonProgress: () => ({ status: "IN_PROGRESS", completedAt: null, completedOn: null, quizScore: null }),
};

/** 関連（select で取りにいくもの） */
const RELATIONS: Record<string, Record<string, { model: string; local: string; foreign: string; many?: boolean }>> = {
  user: { parent: { model: "parent", local: "parentId", foreign: "id" } },
};

function isPlain(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);
}

function eq(a: unknown, b: unknown) {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

function cmp(a: unknown, b: unknown): number {
  const x = a instanceof Date ? a.getTime() : (a as number);
  const y = b instanceof Date ? b.getTime() : (b as number);
  return x < y ? -1 : x > y ? 1 : 0;
}

function matchField(value: unknown, cond: unknown): boolean {
  if (!isPlain(cond)) return eq(value, cond);
  for (const [op, arg] of Object.entries(cond)) {
    switch (op) {
      case "in": if (!(arg as unknown[]).some((x) => eq(value, x))) return false; break;
      case "not": if (isPlain(arg) ? matchField(value, arg) : eq(value, arg)) return false; break;
      case "lt": if (value == null || cmp(value, arg) >= 0) return false; break;
      case "lte": if (value == null || cmp(value, arg) > 0) return false; break;
      case "gt": if (value == null || cmp(value, arg) <= 0) return false; break;
      case "gte": if (value == null || cmp(value, arg) < 0) return false; break;
      case "equals": if (!eq(value, arg)) return false; break;
      default: throw new Error(`fakePrisma: unsupported operator ${op}`);
    }
  }
  return true;
}

export function matches(row: Row, where: Where | undefined): boolean {
  if (!where) return true;
  for (const [k, cond] of Object.entries(where)) {
    if (cond === undefined) continue;
    if (k === "OR") { if (!(cond as Where[]).some((w) => matches(row, w))) return false; continue; }
    if (k === "AND") { if (!(cond as Where[]).every((w) => matches(row, w))) return false; continue; }
    // 複合ユニークキー: { userId_lessonNo: { userId, lessonNo } }
    if (!(k in row) && isPlain(cond) && k.includes("_")) { if (!matches(row, cond)) return false; continue; }
    if (!matchField(row[k], cond)) return false;
  }
  return true;
}

export class FakeDb {
  tables: Record<string, Row[]> = {};
  calls: { model: string; op: string; args: unknown }[] = [];

  table(name: string): Row[] {
    return (this.tables[name] ??= []);
  }

  reset() {
    this.tables = {};
    this.calls = [];
  }

  private project(model: string, row: Row, select?: Record<string, unknown>): Row {
    if (!select) return { ...row };
    const out: Row = {};
    for (const [k, v] of Object.entries(select)) {
      if (!v) continue;
      const rel = RELATIONS[model]?.[k];
      if (rel) {
        const target = this.table(rel.model).find((r) => eq(r[rel.foreign], row[rel.local]));
        out[k] = target ? this.project(rel.model, target, isPlain(v) ? (v.select as Record<string, unknown>) : undefined) : null;
      } else out[k] = row[k];
    }
    return out;
  }

  private checkUnique(model: string, row: Row, self?: Row) {
    for (const f of UNIQUE[model] ?? []) {
      if (this.table(model).some((r) => r !== self && row[f] != null && eq(r[f], row[f]))) {
        throw Object.assign(new Error(`Unique constraint failed on ${f}`), { code: "P2002", name: "PrismaClientKnownRequestError" });
      }
    }
  }

  delegate(model: string) {
    const rows = () => this.table(model);
    const log = (op: string, args: unknown) => this.calls.push({ model, op, args });
    const sort = (list: Row[], orderBy?: Record<string, "asc" | "desc">) => {
      if (!orderBy) return list;
      const [[k, dir]] = Object.entries(orderBy);
      return [...list].sort((a, b) => cmp(a[k], b[k]) * (dir === "desc" ? -1 : 1));
    };
    const applyData = (row: Row, data: Row) => {
      for (const [k, v] of Object.entries(data)) {
        if (isPlain(v) && "increment" in v) row[k] = ((row[k] as number) ?? 0) + (v.increment as number);
        else row[k] = v;
      }
    };
    return {
      create: async ({ data, select }: { data: Row; select?: Record<string, unknown> }) => {
        log("create", { data });
        const row: Row = { id: randomUUID(), createdAt: new Date(), ...(DEFAULTS[model]?.() ?? {}), ...data };
        this.checkUnique(model, row);
        rows().push(row);
        return this.project(model, row, select);
      },
      findUnique: async ({ where, select }: { where: Where; select?: Record<string, unknown> }) => {
        const r = rows().find((x) => matches(x, where));
        return r ? this.project(model, r, select) : null;
      },
      findUniqueOrThrow: async ({ where }: { where: Where }) => {
        const r = rows().find((x) => matches(x, where));
        if (!r) throw new Error("not found");
        return { ...r };
      },
      findFirst: async ({ where, select }: { where?: Where; select?: Record<string, unknown> }) => {
        const r = rows().find((x) => matches(x, where));
        return r ? this.project(model, r, select) : null;
      },
      findMany: async ({ where, select, orderBy, take }: { where?: Where; select?: Record<string, unknown>; orderBy?: Record<string, "asc" | "desc">; take?: number } = {}) => {
        const list = sort(rows().filter((x) => matches(x, where)), orderBy);
        return (take ? list.slice(0, take) : list).map((r) => this.project(model, r, select));
      },
      count: async ({ where }: { where?: Where } = {}) => rows().filter((x) => matches(x, where)).length,
      update: async ({ where, data, select }: { where: Where; data: Row; select?: Record<string, unknown> }) => {
        log("update", { where, data });
        const r = rows().find((x) => matches(x, where));
        if (!r) throw Object.assign(new Error("Record to update not found"), { code: "P2025" });
        const next = { ...r };
        applyData(next, data);
        this.checkUnique(model, next, r);
        Object.assign(r, next);
        return this.project(model, r, select);
      },
      updateMany: async ({ where, data }: { where?: Where; data: Row }) => {
        log("updateMany", { where, data });
        const list = rows().filter((x) => matches(x, where));
        for (const r of list) applyData(r, data);
        return { count: list.length };
      },
      upsert: async ({ where, create, update }: { where: Where; create: Row; update: Row }) => {
        const r = rows().find((x) => matches(x, where));
        if (r) { applyData(r, update); return { ...r }; }
        const row: Row = { id: randomUUID(), createdAt: new Date(), ...(DEFAULTS[model]?.() ?? {}), ...create };
        this.checkUnique(model, row);
        rows().push(row);
        return { ...row };
      },
      delete: async ({ where }: { where: Where }) => {
        log("delete", { where });
        const i = rows().findIndex((x) => matches(x, where));
        if (i < 0) throw Object.assign(new Error("Record to delete does not exist"), { code: "P2025" });
        const [r] = rows().splice(i, 1);
        return r;
      },
      deleteMany: async ({ where }: { where?: Where } = {}) => {
        log("deleteMany", { where });
        const keep = rows().filter((x) => !matches(x, where));
        const count = rows().length - keep.length;
        this.tables[model] = keep;
        return { count };
      },
    };
  }

  /** Prisma クライアントのふりをするオブジェクト */
  client(): Record<string, unknown> {
    const self = this;
    return new Proxy({}, {
      get(_t, prop: string) {
        if (prop === "$transaction") {
          return async (arg: unknown) => {
            if (typeof arg === "function") return (arg as (tx: unknown) => unknown)(self.client());
            return Promise.all(arg as Promise<unknown>[]);
          };
        }
        if (prop === "then") return undefined;
        return self.delegate(prop);
      },
    });
  }
}

/** next/headers の cookies() のかわり */
export class CookieJar {
  store = new Map<string, { value: string; options: Record<string, unknown> }>();
  get(name: string) {
    const c = this.store.get(name);
    return c ? { name, value: c.value } : undefined;
  }
  set(name: string, value: string, options: Record<string, unknown> = {}) {
    if (!value || options.maxAge === 0) this.store.delete(name);
    else this.store.set(name, { value, options });
  }
  clear() {
    this.store.clear();
  }
}
