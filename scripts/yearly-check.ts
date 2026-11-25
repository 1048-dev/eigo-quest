/**
 * 力だめしの 問題データの チェック: npx tsx scripts/yearly-check.ts [ステージ...]
 * content/yearly/stage-N.json を 読んで validateYearlyTest に かける。まちがいが あれば exit 1。
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { validateYearlyTest } from "../src/lib/yearly/validate";
import { YEARLY_STAGES } from "../src/lib/yearly/spec";
import type { YearlyTest } from "../src/lib/yearly/types";
import { installDeadline } from "./lib/checkKit";

installDeadline(60);
const stages = process.argv.slice(2).map(Number).filter(Boolean);
let bad = 0;
for (const stage of stages.length ? stages : YEARLY_STAGES) {
  const file = path.join(process.cwd(), "content", "yearly", `stage-${stage}.json`);
  if (!existsSync(file)) { console.log(`stage ${stage}: ファイルが ない（${file}）`); bad++; continue; }
  let test: YearlyTest;
  try {
    test = JSON.parse(readFileSync(file, "utf8")) as YearlyTest;
  } catch (e) {
    console.log(`stage ${stage}: JSON が こわれている`, e);
    bad++;
    continue;
  }
  const errors = validateYearlyTest(test);
  const words = [...test.listening.flatMap((i) => i.audio?.map((a) => a.en) ?? []), ...test.passages.flatMap((p) => p.lines)].join(" ").split(/\s+/).length;
  console.log(`stage ${stage}: listening ${test.listening.length}・reading ${test.reading.length}・speaking ${test.speaking.prompts.length}・writing ${test.writing.kind}・英文 約${words}語 → ${errors.length ? `まちがい ${errors.length}` : "OK"}`);
  for (const m of errors) console.log(`  - ${m}`);
  bad += errors.length;
}
process.exit(bad ? 1 : 0);
