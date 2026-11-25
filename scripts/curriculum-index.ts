/**
 * カリキュラムの 索引を つくる（run7 Phase 2）。
 *
 *   npx tsx scripts/curriculum-index.ts            … worlds/world-NN.json から 索引を作りなおす
 *   npx tsx scripts/curriculum-index.ts --split    … 古い content/curriculum/lessons.json を ワールドごとの ファイルに分けてから 索引を作る
 *   npx tsx scripts/curriculum-index.ts --check    … 索引が 最新か だけを 確かめる（ちがえば 終了コード 1）
 *   （npm run curriculum:index）
 *
 * 作るもの:
 *   content/curriculum/index.json            … meta（先生）・レッスン数・ワールドの一覧（ステージ・レベル・範囲・ファイル名）。ブラウザにも のる 小さな 索引
 *   content/curriculum/titles.json           … レッスンの タイトルの 一覧（番号・ワールド・ステージ・英語/日本語の タイトル）。サーバー・ツール用
 *   src/lib/curriculum/bundledWorlds.ts      … サーバー（Node）で 全ワールドを 読みこむための import の 一覧（ブラウザでは 空の ファイルに 差しかわる）
 *
 * 新しい ワールドを 書いたら worlds/world-NN.json を 置いて この スクリプトを 実行する（tests/curriculum.test.ts が ずれを 見つける）。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { levelOfWorld, stageOfWorld } from "../src/lib/curriculum/stages";

const ROOT = path.resolve(__dirname, "..");
const DIR = path.join(ROOT, "content", "curriculum");
const WORLDS_DIR = path.join(DIR, "worlds");
const LEGACY = path.join(DIR, "lessons.json");
const BUNDLE_TS = path.join(ROOT, "src", "lib", "curriculum", "bundledWorlds.ts");

const args = new Set(process.argv.slice(2));
const started = Date.now();
const timer = setTimeout(() => { console.error("✗ 時間切れ（60秒）"); process.exit(1); }, 60_000);

type Lesson = { lessonNo: number; world: number; title: string; titleJa: string; stage?: number; level?: string };
type WorldFile = { world: number; stage: number; level: string; lessons: Lesson[] };

const pad2 = (n: number) => String(n).padStart(2, "0");
const fileOf = (w: number) => `world-${pad2(w)}.json`;
const json = (x: unknown) => JSON.stringify(x, null, 2) + "\n";

const DEFAULT_META = {
  version: "0.3.0",
  teacher: { name: "Ms. Emma", nameJa: "エマ先生" },
  lessonsPerWorld: 30,
  miniTestEvery: 5,
  note: "6年カリキュラム（docs/curriculum-6year.md）。ワールド1〜12（L1〜360）= ステージ1、13〜40 = ステージ2〜5。レッスンは worlds/world-NN.json に ワールドごとに 分けて置く。教科書の本文・イラストは転載せず、テーマと表現の型だけを合わせたオリジナル文。",
};

function split() {
  if (!existsSync(LEGACY)) { console.log("・lessons.json は もう ありません（分割ずみ）"); return; }
  const data = JSON.parse(readFileSync(LEGACY, "utf8")) as { meta: Record<string, unknown>; lessons: Lesson[] };
  mkdirSync(WORLDS_DIR, { recursive: true });
  const byWorld = new Map<number, Lesson[]>();
  for (const l of data.lessons) byWorld.set(l.world, [...(byWorld.get(l.world) ?? []), l]);
  for (const [w, lessons] of [...byWorld].sort((a, b) => a[0] - b[0])) {
    const file: WorldFile = { world: w, stage: stageOfWorld(w), level: levelOfWorld(w), lessons: lessons.sort((a, b) => a.lessonNo - b.lessonNo) };
    writeFileSync(path.join(WORLDS_DIR, fileOf(w)), json(file));
    console.log(`・${fileOf(w)}: ${lessons.length} レッスン`);
  }
  // meta は 索引へ（ノートは 6年カリキュラムの 説明に 書きかえる）
  writeFileSync(path.join(DIR, "index.json"), json({ meta: { ...DEFAULT_META, teacher: data.meta.teacher ?? DEFAULT_META.teacher }, totalLessons: 0, worlds: [] }));
  rmSync(LEGACY);
  console.log("・lessons.json を 消しました（ワールドごとの ファイルが 正）");
}

function build(): { index: string; titles: string; bundle: string } {
  const files = readdirSync(WORLDS_DIR).filter((f) => /^world-\d{2}\.json$/.test(f)).sort();
  if (files.length === 0) throw new Error("content/curriculum/worlds に ワールドの ファイルが ありません");
  const prev = existsSync(path.join(DIR, "index.json")) ? JSON.parse(readFileSync(path.join(DIR, "index.json"), "utf8")) as { meta?: typeof DEFAULT_META } : {};
  const meta = prev.meta ?? DEFAULT_META;
  const worlds: { world: number; file: string; stage: number; level: string; firstLesson: number; lastLesson: number; lessonCount: number }[] = [];
  const titles: { lessonNo: number; world: number; stage: number; title: string; titleJa: string }[] = [];
  let expected = 1;
  for (const f of files) {
    const w = JSON.parse(readFileSync(path.join(WORLDS_DIR, f), "utf8")) as WorldFile;
    if (fileOf(w.world) !== f) throw new Error(`${f}: world が ${w.world} です（ファイル名と ちがう）`);
    if (!Array.isArray(w.lessons) || w.lessons.length === 0) throw new Error(`${f}: lessons が 空です`);
    for (const l of w.lessons) {
      if (l.lessonNo !== expected) throw new Error(`${f}: Lesson ${expected} の つぎが Lesson ${l.lessonNo} です（番号は 1 から つづける）`);
      if (l.world !== w.world) throw new Error(`${f}: Lesson ${l.lessonNo} の world が ${l.world} です`);
      titles.push({ lessonNo: l.lessonNo, world: w.world, stage: l.stage ?? w.stage, title: l.title, titleJa: l.titleJa });
      expected++;
    }
    worlds.push({ world: w.world, file: f, stage: w.stage, level: w.level, firstLesson: w.lessons[0].lessonNo, lastLesson: w.lessons[w.lessons.length - 1].lessonNo, lessonCount: w.lessons.length });
    process.stdout.write(`・${f}: L${w.lessons[0].lessonNo}〜${w.lessons[w.lessons.length - 1].lessonNo}\n`);
  }
  const index = json({ meta, totalLessons: expected - 1, worlds });
  const titlesJson = json({ note: "自動生成（npm run curriculum:index）。レッスンの タイトルの 索引", lessons: titles });
  const names = worlds.map((w) => `w${pad2(w.world)}`);
  const bundle = [
    "/**",
    " * 自動生成（npm run curriculum:index）。手で 書きかえない。",
    " * サーバー（Node・API・seed・テスト）で 全ワールドの レッスンを 読みこむ。",
    " * ブラウザの ビルドでは next.config.ts が bundledWorlds.browser.ts（空）に 差しかえる（カリキュラム全体を ブラウザに 送らない）。",
    " */",
    'import type { WorldFile } from "./types";',
    ...worlds.map((w, i) => `import ${names[i]} from "@content/curriculum/worlds/${w.file}";`),
    "",
    `export const BUNDLED_WORLDS = [${names.join(", ")}] as unknown as readonly WorldFile[];`,
    "",
  ].join("\n");
  return { index, titles: titlesJson, bundle };
}

try {
  if (args.has("--split")) split();
  const out = build();
  const targets: [string, string][] = [[path.join(DIR, "index.json"), out.index], [path.join(DIR, "titles.json"), out.titles], [BUNDLE_TS, out.bundle]];
  if (args.has("--check")) {
    const stale = targets.filter(([p, s]) => !existsSync(p) || readFileSync(p, "utf8") !== s).map(([p]) => path.relative(ROOT, p));
    if (stale.length) { console.error(`✗ 索引が 古いです: ${stale.join(", ")}（npm run curriculum:index を 実行してください）`); process.exit(1); }
    console.log("✓ 索引は 最新です");
  } else {
    for (const [p, s] of targets) writeFileSync(p, s);
    console.log(`✓ 索引を 作りました（${((Date.now() - started) / 1000).toFixed(1)}秒）`);
  }
} catch (e) {
  console.error(`✗ ${(e as Error).message}`);
  process.exit(1);
} finally {
  clearTimeout(timer);
}
