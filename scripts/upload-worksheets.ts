/**
 * ワールドごとの 1か月ワークブック（どの家も同じ内容）を ファイルの置き場所へ アップロードする（run5 Phase 3）。
 * サーバー（Vercel など）では Python を動かさないので、このパソコンで1回だけ作って 置いておく。
 *
 *   npm run worksheets:month -- --all     # 1) 12ワールド分を worksheets/out/monthly に作る（Python + reportlab）
 *   npm run worksheets:upload             # 2) 置き場所（STORAGE_DRIVER / S3_* / REPORT_STORAGE_DIR）へ アップロード
 *
 *   npm run worksheets:upload -- --world 3          # 1つだけ
 *   npm run worksheets:upload -- --force            # すでにあっても 上書き（中身を作りなおしたとき）
 *   npm run worksheets:upload -- --dry-run          # 何をするかだけ表示
 *   npm run worksheets:upload -- --dir path/to/pdfs # 読むフォルダ（既定 worksheets/out/monthly）
 *   npm run worksheets:upload -- --timeout 600      # 何秒で やめるか（既定 600秒）
 *
 * 本番の置き場所に上げるときは、本番と同じ STORAGE_DRIVER / S3_* を .env か 環境変数に入れて実行する。
 */
import { existsSync } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const argv = process.argv.slice(2);
const has = (name: string) => argv.includes(`--${name}`);
const arg = (name: string) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

if (has("help") || has("h")) {
  console.log("使い方: npm run worksheets:upload [-- --world N] [-- --force] [-- --dry-run] [-- --dir <フォルダ>] [-- --timeout 600]");
  process.exit(0);
}

const envFile = path.join(process.cwd(), ".env");
if (existsSync(envFile)) {
  try {
    process.loadEnvFile(envFile);
  } catch {
    /* 古い Node では読まない（環境変数を直接わたす） */
  }
}

const mb = (n: number) => `${(n / 1_000_000).toFixed(1)} MB`;

async function main(): Promise<number> {
  const timeoutArg = arg("timeout");
  const timeoutSec = timeoutArg === undefined ? 600 : Number(timeoutArg);
  if (!Number.isFinite(timeoutSec) || timeoutSec <= 0) {
    console.error(`--timeout は 秒数（正の数）で指定してください: ${timeoutArg}`);
    return 2;
  }
  const deadline = Date.now() + timeoutSec * 1000;
  const killer = setTimeout(() => {
    console.error(`⏱ ${timeoutSec + 30}秒を こえたので 中止しました。`);
    process.exit(3);
  }, (timeoutSec + 30) * 1000);
  killer.unref();

  const { WORLD_COUNT } = await import("@/lib/game/worlds");
  const { getStorage, storageConfig } = await import("@/lib/storage");
  const { prebuiltWorksheetDir, worksheetKey } = await import("@/lib/report/storage");

  const worldArg = arg("world");
  let worlds = Array.from({ length: WORLD_COUNT }, (_, i) => i + 1);
  if (worldArg !== undefined) {
    const w = Number(worldArg);
    if (!Number.isInteger(w) || w < 1 || w > WORLD_COUNT) {
      console.error(`--world は 1〜${WORLD_COUNT} の整数で指定してください: ${worldArg}`);
      return 2;
    }
    worlds = [w];
  }
  const dir = path.resolve(arg("dir") ?? prebuiltWorksheetDir());
  const cfg = storageConfig();
  if (cfg.missing.length) {
    console.error(`置き場所の設定が足りません（STORAGE_DRIVER=${cfg.driver}）: ${cfg.missing.join(", ")}`);
    return 2;
  }
  const storage = getStorage();
  console.log(`▶ ワークブックの アップロード（${worlds.length} 件${has("dry-run") ? "・dry-run" : ""}${has("force") ? "・上書き" : ""}）`);
  console.log(`   読むフォルダ: ${dir}`);
  console.log(`   置き場所:     ${storage.description}`);

  const missing: number[] = [];
  let uploaded = 0;
  let skipped = 0;
  for (const [i, w] of worlds.entries()) {
    if (Date.now() > deadline) {
      console.error(`⏱ 時間ぎれ: ${i}/${worlds.length} 件で やめました（もう一度 実行すると つづきから）`);
      return 4;
    }
    const key = worksheetKey(w);
    const file = path.join(dir, path.basename(key));
    const tag = `[${i + 1}/${worlds.length}] ${path.basename(key)}`;
    if (!existsSync(file)) {
      console.log(`${tag}  ✖ ファイルがありません`);
      missing.push(w);
      continue;
    }
    const size = (await stat(file)).size;
    const already = has("force") ? null : await storage.head(key);
    if (already && already.size === size) {
      console.log(`${tag}  - すでにあります（${mb(size)}・とばします。上書きは --force）`);
      skipped++;
      continue;
    }
    if (has("dry-run")) {
      console.log(`${tag}  → ${key}（${mb(size)}・dry-run なので上げません）`);
      continue;
    }
    const started = Date.now();
    await storage.put(key, new Uint8Array(await readFile(file)), "application/pdf");
    const check = await storage.head(key);
    if (!check || check.size !== size) {
      console.error(`${tag}  ✖ アップロードしたあとの確認で サイズが合いません`);
      return 1;
    }
    console.log(`${tag}  ✔ ${key}（${mb(size)}・${((Date.now() - started) / 1000).toFixed(1)}秒）`);
    uploaded++;
  }
  console.log(`== おわり: アップロード ${uploaded} / とばした ${skipped} / ファイルなし ${missing.length}`);
  if (missing.length) {
    console.log(`   ファイルが無いワールド: ${missing.join(", ")} → さきに npm run worksheets:month -- --all を実行してください`);
    return 1;
  }
  return 0;
}

main().then(
  (code) => process.exit(code),
  (e) => {
    console.error(`アップロードに失敗しました: ${(e as Error)?.name ?? "Error"}: ${(e as Error)?.message ?? ""}`);
    process.exit(1);
  },
);
