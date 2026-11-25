/**
 * えいごの としょかん の 索引を つくる（run7 P-library）。
 *
 *   npx tsx scripts/library-index.ts          … content/library/ の 本文から index.json を 作りなおす（npm run library:index）
 *   npx tsx scripts/library-index.ts --check  … 索引が 最新か・データに まちがいが ないか だけ 確かめる（ちがえば 終了コード 1）
 *
 * おはなしを 足したら stories-N.json に 書いて この スクリプトを 実行する（tests/library.test.ts も ずれを 見つける）。
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildLibraryIndex } from "../src/lib/library/buildIndex";
import { validateChant, validateStory, validateTalkTheme } from "../src/lib/library/rules";
import type { Chant, Story, TalkTheme } from "../src/lib/library/types";

const DIR = path.resolve(__dirname, "..", "content", "library");
const INDEX = path.join(DIR, "index.json");
const check = process.argv.includes("--check");
const timer = setTimeout(() => { console.error("✗ 時間切れ（30秒）"); process.exit(1); }, 30_000);

const read = <T>(file: string): T => JSON.parse(readFileSync(path.join(DIR, file), "utf8")) as T;

const stories: Story[] = [];
for (let stage = 1; existsSync(path.join(DIR, `stories-${stage}.json`)); stage++) {
  const list = read<{ stories: Story[] }>(`stories-${stage}.json`).stories;
  console.log(`・stories-${stage}.json: ${list.length} 話`);
  stories.push(...list);
}
const chants = read<{ chants: Chant[] }>("chants.json").chants;
const talks = read<{ themes: TalkTheme[] }>("talk.json").themes;
console.log(`・chants.json: ${chants.length} 曲 / talk.json: ${talks.length} テーマ`);

const errors = [...stories.flatMap(validateStory), ...chants.flatMap(validateChant), ...talks.flatMap(validateTalkTheme)];
const ids = [...stories, ...chants, ...talks].map((x) => x.id);
for (const id of ids.filter((id, i) => ids.indexOf(id) !== i)) errors.push(`${id}: id が かさなっている`);
if (errors.length > 0) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}

const next = JSON.stringify(buildLibraryIndex(stories, chants, talks), null, 2) + "\n";
const current = existsSync(INDEX) ? readFileSync(INDEX, "utf8").replace(/\r\n/g, "\n") : "";
if (check) {
  if (current !== next) { console.error("✗ content/library/index.json が 古いです。npm run library:index を 実行してください"); process.exit(1); }
  console.log("✓ としょかんの 索引は 最新です");
} else {
  writeFileSync(INDEX, next);
  console.log(`✓ index.json を 書きました（${Buffer.byteLength(next)} バイト）`);
}
clearTimeout(timer);
