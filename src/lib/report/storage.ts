/**
 * 配信する PDF の置き場所でのキー（場所）とワークブック（run5 Phase 3: ファイルの置き場所は src/lib/storage）。
 *  reports/<保護者ID>/<YYYY-MM>/<ランダム>.pdf   … お子さまごとの学習レポート（その家だけのもの）
 *  worksheets/monthly/world-NN.pdf                … ワールドごとの 1か月ワークブック（どの家も同じ内容なので使い回す）
 * DB（ReportDelivery.files）には このキーだけを入れる。
 *
 * サーバーでは Python を動かさない。ワークブックは あらかじめ
 *   npm run worksheets:month -- --all   （12ワールド分を worksheets/out/monthly に作る。Python + reportlab）
 *   npm run worksheets:upload           （置き場所へ アップロード）
 * で置いておく。
 */
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getStorage, isValidKey, storageConfig } from "@/lib/storage";
import { resolveInRoot } from "@/lib/storage/local";

/** 置き場所（ローカルのとき）のフォルダ */
export function reportStorageDir(env: Record<string, string | undefined> = process.env): string {
  return storageConfig(env).localRoot;
}

/** キー → ローカルの絶対パス（置き場所の外・おかしなキーは null） */
export function resolveStored(key: string, root = reportStorageDir()): string | null {
  return resolveInRoot(root, key);
}

export const worksheetKey = (world: number) => `worksheets/monthly/world-${String(world).padStart(2, "0")}.pdf`;
/** 古い名前（run4） */
export const worksheetRel = worksheetKey;

export function newReportKey(parentId: string, month: string): string {
  const key = `reports/${parentId}/${month}/${randomBytes(12).toString("hex")}.pdf`;
  if (!isValidKey(key)) throw new Error("invalid report key");
  return key;
}

/** npm run worksheets:month -- --all が作るフォルダ */
export function prebuiltWorksheetDir(): string {
  return path.join(process.cwd(), "worksheets", "out", "monthly");
}

export type WorksheetProvider = (world: number) => Promise<{ key: string; bytes: number } | null>;

/**
 * そのワールドの 1か月ワークブックのキーを返す（置き場所に無ければ null = レポートだけ送る）。
 * 1) 置き場所にあれば それ
 * 2) 開発用: このパソコンで npm run worksheets:month を実行ずみ（worksheets/out/monthly にある）なら アップロードして使う
 */
export const ensureWorksheetBundle: WorksheetProvider = async (world) => {
  const storage = getStorage();
  const key = worksheetKey(world);
  const found = await storage.head(key);
  if (found) return { key, bytes: found.size };
  const prebuilt = path.join(prebuiltWorksheetDir(), path.basename(key));
  if (existsSync(prebuilt)) {
    const data = new Uint8Array(await readFile(prebuilt));
    await storage.put(key, data, "application/pdf");
    return { key, bytes: data.length };
  }
  console.warn(`[report] ワールド${world} のワークブックが置き場所にありません（レポートだけ送ります）。npm run worksheets:month -- --all のあと npm run worksheets:upload を実行してください`);
  return null;
};
