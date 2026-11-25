/**
 * メール送信を 応答のあとに行う（Next.js の after()）。
 * 「パスワードを忘れた」は 登録の有無で 応答の時間が かわらないように、DB を しらべる ところから あとで行う。
 * after() が使えない場所（テスト・スクリプト）では そのまま 動かす。テストは flushBackgroundTasks() で まつ。
 */
import { after } from "next/server";

const pending = new Set<Promise<void>>();

export function runAfterResponse(label: string, task: () => Promise<unknown>): void {
  const p: Promise<void> = Promise.resolve()
    .then(task)
    .then(() => undefined, (e) => {
      const err = e as { name?: string; reason?: string; code?: string } | null;
      console.error(`[mail:${label}] ${err?.name ?? "Error"}${err?.reason ? ` (${err.reason})` : err?.code ? ` (${err.code})` : ""}`);
    })
    .finally(() => { pending.delete(p); });
  pending.add(p);
  try {
    after(() => p);
  } catch {
    /* リクエストの外（テスト・スクリプト） */
  }
}

/** テスト用: 動いている あとの処理が ぜんぶ おわるまで まつ */
export async function flushBackgroundTasks(): Promise<void> {
  while (pending.size > 0) await Promise.all([...pending]);
}
