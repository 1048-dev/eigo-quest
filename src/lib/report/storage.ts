/**
 * 配信する PDF の置き場所（REPORT_STORAGE_DIR。未設定なら <プロジェクト>/.data/reports）。
 *  reports/<保護者ID>/<YYYY-MM>/<ランダム>.pdf   … お子さまごとの学習レポート（その家だけのもの）
 *  worksheets/monthly/world-NN.pdf                … ワールドごとの 1か月ワークブック（どの家も同じ内容なので使い回す）
 * DB（ReportDelivery.files）には この置き場所からの相対パスだけを入れる。読むときは必ず resolveStored で
 * 置き場所の外に出ないことを確かめる。
 */
import { copyFile, mkdir, rm, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { runGenerator } from "./pdf";

export function reportStorageDir(env: Record<string, string | undefined> = process.env): string {
  return path.resolve(env.REPORT_STORAGE_DIR?.trim() || path.join(process.cwd(), ".data", "reports"));
}

/** 相対パス → 絶対パス。置き場所の外を指していたら null */
export function resolveStored(rel: string, root = reportStorageDir()): string | null {
  if (!rel || path.isAbsolute(rel) || rel.includes("\0")) return null;
  const abs = path.resolve(root, rel);
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  return abs.startsWith(rootWithSep) ? abs : null;
}

export function toStoredRel(abs: string, root = reportStorageDir()): string {
  return path.relative(root, abs).split(path.sep).join("/");
}

export async function fileSize(abs: string): Promise<number> {
  try {
    return (await stat(abs)).size;
  } catch {
    return 0;
  }
}

export async function removeStored(rel: string, root = reportStorageDir()): Promise<void> {
  const abs = resolveStored(rel, root);
  if (abs) await rm(abs, { force: true });
}

export const worksheetRel = (world: number) => `worksheets/monthly/world-${String(world).padStart(2, "0")}.pdf`;

export type WorksheetProvider = (world: number) => Promise<string | null>;

/**
 * そのワールドの 1か月ワークブックを用意して相対パスを返す（作れなければ null = レポートだけ送る）。
 * 1) 置き場所にあれば それ 2) npm run worksheets:month で作ったもの（worksheets/out/monthly）があれば コピー
 * 3) なければ生成スクリプトで作る（ワールドごとに1回だけ。数秒〜数十秒かかる）
 */
export const ensureWorksheetBundle: WorksheetProvider = async (world) => {
  const root = reportStorageDir();
  const rel = worksheetRel(world);
  const abs = resolveStored(rel, root)!;
  if (existsSync(abs)) return rel;
  await mkdir(path.dirname(abs), { recursive: true });
  const prebuilt = path.join(process.cwd(), "worksheets", "out", "monthly", path.basename(abs));
  if (existsSync(prebuilt)) {
    await copyFile(prebuilt, abs);
    return rel;
  }
  const r = await runGenerator(["--month", "--world", String(world), "--out", path.join(root, "worksheets")]);
  if (r.ok && existsSync(abs)) return rel;
  console.warn(`[report] ワールド${world} のワークシートを作れませんでした（レポートだけ送ります）`);
  return null;
};
