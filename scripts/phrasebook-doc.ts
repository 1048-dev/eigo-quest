/**
 * docs/phrasebook.md を scripts/lib/phrasebook.ts から つくる（run10 Phase 5）。
 *
 *   npm run phrasebook:doc            # 書く
 *   npm run phrasebook:doc -- --check # 最新か しらべる（ちがえば 終了コード 1）
 *
 * 「はじめて 出る レッスン」と ステージごとの 回数は content/ を しらべて 書く（データと ずれない ように）。
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { PHRASEBOOK, REASON_LABEL, type PhraseFunction, type Variant } from "./lib/phrasebook";

const ROOT = path.resolve(__dirname, "..");
export const DOC_PATH = path.join(ROOT, "docs/phrasebook.md");

interface Unit { lesson?: number; id: string; stage: number; texts: string[] }

/** 英語の 文字列（ja・～Ja・id などを のぞく） */
function englishStrings(v: unknown, out: string[], key = ""): void {
  if (typeof v === "string") { if (!/Ja$|^ja$|^(id|imageKey|audioKey|speaker|character)$/.test(key)) out.push(v); return; }
  if (Array.isArray(v)) { for (const x of v) englishStrings(x, out, key); return; }
  if (v && typeof v === "object") for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (!/Ja$|^ja$/.test(k)) englishStrings(x, out, k);
}

export function loadUnits(root = ROOT): Unit[] {
  const units: Unit[] = [];
  const wdir = path.join(root, "content/curriculum/worlds");
  for (const f of readdirSync(wdir).filter((x) => /^world-\d+\.json$/.test(x)).sort()) {
    const w = JSON.parse(readFileSync(path.join(wdir, f), "utf8")) as { stage: number; lessons: { lessonNo: number }[] };
    for (const l of w.lessons) { const texts: string[] = []; englishStrings(l, texts); units.push({ lesson: l.lessonNo, id: `L${l.lessonNo}`, stage: w.stage, texts }); }
  }
  const ldir = path.join(root, "content/library");
  for (const f of readdirSync(ldir).filter((x) => x.endsWith(".json") && x !== "index.json").sort()) {
    const d = JSON.parse(readFileSync(path.join(ldir, f), "utf8")) as Record<string, { id: string; stage: number }[]>;
    for (const it of d.stories ?? d.chants ?? d.themes ?? []) { const texts: string[] = []; englishStrings(it, texts); units.push({ id: it.id, stage: it.stage, texts }); }
  }
  const ydir = path.join(root, "content/yearly");
  for (const f of readdirSync(ydir).filter((x) => /^stage-\d\.json$/.test(x)).sort()) {
    const d = JSON.parse(readFileSync(path.join(ydir, f), "utf8")) as { stage: number };
    const texts: string[] = []; englishStrings(d, texts); units.push({ id: `yearly:${d.stage}`, stage: d.stage, texts });
  }
  return units;
}

const escRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** 形の 文字から さがす 正規表現（～ は なにか 1つ以上、さいごの 記号は なくても よい） */
export function formRegex(form: string): RegExp | null {
  const core = form.replace(/\(.*?\)/g, "").trim().replace(/[.!?]+$/, "").trim();
  if (!core || core.length < 3) return null;
  const parts = core.split("～").map((p) => escRe(p.trim()));
  const body = parts.join("\\s*\\S.*?\\s*").replace(/^\\s\*\\S\.\*\?\\s\*/, "").replace(/\\s\*\\S\.\*\?\\s\*$/, "");
  if (!body) return null;
  return new RegExp(`(?<![A-Za-z])${body}(?![A-Za-z])`);
}

export interface FormStat { first?: string; byStage: number[] }

export function formStat(units: readonly Unit[], re: RegExp): FormStat {
  const byStage = [0, 0, 0, 0, 0];
  let first: Unit | undefined;
  for (const u of units) {
    const n = u.texts.filter((t) => re.test(t)).length;
    if (!n) continue;
    byStage[u.stage - 1] += n;
    if (u.lesson !== undefined && (!first || (first.lesson ?? 1e9) > u.lesson)) first = u;
  }
  return { first: first ? `L${first.lesson}` : undefined, byStage };
}

const stages = (v: { from?: number; to?: number }) => (v.to ? `${v.from ?? 1}–${v.to}` : `${v.from ?? 1}+`);
const md = (s: string) => s.replace(/\|/g, "\\|");

function variantStat(units: readonly Unit[], v: Variant): FormStat | null {
  if (v.re) return formStat(units, v.re);
  const res = v.form.split(" / ").map((f) => formRegex(f)).filter((r): r is RegExp => !!r);
  if (!res.length) return null;
  const all = new RegExp(res.map((r) => `(?:${r.source})`).join("|"));
  return formStat(units, all);
}

export function renderFunction(f: PhraseFunction, units: readonly Unit[]): string[] {
  const L: string[] = [];
  L.push(`## ${f.en}（${f.ja}）`, "", `id: \`${f.id}\``, "");
  L.push("**Canonical**", "", "| Stage | Use | Note |", "|---|---|---|");
  for (const c of f.canonical) L.push(`| ${c.stages[0] === c.stages[1] ? c.stages[0] : `${c.stages[0]}–${c.stages[1]}`} | ${c.forms.map((x) => `\`${md(x)}\``).join(" ")} | ${md(c.note ?? "")} |`);
  if (f.variants.length) {
    L.push("", "**Allowed variants**（stage = わざと 入れる ステージ）", "", "| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |", "|---|---|---|---|---|---|");
    for (const v of f.variants) {
      const st = variantStat(units, v);
      const lint = v.re ? (v.fix ? "✓ auto-fix" : "✓") : "";
      L.push(`| ${md(v.form)} | ${stages(v)} | ${st?.first ?? "-"} | ${st ? st.byStage.join(" / ") : "-"} | ${lint} | ${md(v.note ?? "")} |`);
    }
  }
  if (f.avoid.length) {
    L.push("", "**Avoid**", "", "| Avoid | Why | Use instead | Lint |", "|---|---|---|---|");
    for (const a of f.avoid) {
      const lint = a.re ? (a.fix ? "✓ auto-fix" : "✓") : "（文脈で きまる・ほかの ルール）";
      L.push(`| ${md(a.form)} | **${REASON_LABEL[a.reason]}** — ${md(a.why)} | ${md(a.use)} | ${lint} |`);
    }
  }
  L.push("");
  return L;
}

export function renderPhrasebook(units: readonly Unit[] = loadUnits()): string {
  const L: string[] = [
    "# Eigo Quest Phrasebook（フレーズブック）",
    "",
    "<!-- 自動生成: npm run phrasebook:doc（データは scripts/lib/phrasebook.ts）。この ファイルを 手で かえない -->",
    "",
    "One canonical way to say each everyday function, for each stage. American English, natural spoken style, the way a friendly US elementary teacher and US kids really talk.",
    "This file is generated from `scripts/lib/phrasebook.ts`; the same data drives the `phrasebook` rule of `npm run english:lint` and the auto-fixer `npm run phrasebook:fix`.",
    "",
    "> にほんごメモ: おなじ はたらき（あいさつ・おれい・ほめる …）の 英語は、ステージごとに **1つの 言いかた（Canonical）** に そろえます。",
    "> べつの 言いかたは **わざと 入れる ステージ** を きめて つかいます（Allowed variants）。**Avoid** は つかわない 形と 理由です。",
    "> 英語が わからなくても、`npm run english:lint` の `phrasebook` が 0 なら この きまりが まもられて います。",
    "",
    "## How the lint uses this",
    "",
    "- **Avoid** rows marked ✓ are always an **error** (`phrasebook` rule). Rows without ✓ depend on context and are checked by other rules (stiff-phrase, wasei-eigo, grammar-habit) or by review.",
    "- **Allowed variants** marked ✓ are an **error outside their stage range**: before `from` (not taught yet) or after `to` (no longer fits the age).",
    "- App text (UI strings, templates in `src/`, workbook templates in `worksheets/`) is shown to every stage, so it may not use variants that have an upper stage limit (e.g. `Bye-bye`) and may not use avoid forms. (`npm run english:lint -- --src`)",
    "- `✓ auto-fix` = `npm run phrasebook:fix` rewrites it (log: docs/run10/changes/phrasebook.md).",
    "- **First lesson** and **Uses** are counted from `content/` when this file is generated (lessons, library, 力だめし).",
    "- To use a listed form on purpose somewhere else, add the unit to `allowUnits` in the data, with a comment.",
    "",
    "| Stage | Worlds | Lessons | Age (approx.) |",
    "|---|---|---|---|",
    "| 1 | 1–12 | 1–360 | 6–8 |",
    "| 2 | 13–20 | 361–600 | 7–9 |",
    "| 3 | 21–28 | 601–840 | 8–10 |",
    "| 4 | 29–35 | 841–1050 | 9–11 |",
    "| 5 | 36–40 | 1051–1200 | 10–12 |",
    "",
    "Reasons: " + Object.values(REASON_LABEL).map((r) => `**${r}**`).join(" · "),
    "",
    "## Contents",
    "",
    ...PHRASEBOOK.map((f, i) => `${i + 1}. ${f.en}（${f.ja}）`),
    "",
  ];
  for (const f of PHRASEBOOK) L.push(...renderFunction(f, units));
  L.push("## Related", "", "- docs/english-style-guide.md — spelling, punctuation, register, stage length limits", "- docs/run10/changes/phrasebook.md — every string changed by `phrasebook:fix`", "");
  return L.join("\n");
}

function main() {
  const text = renderPhrasebook();
  if (process.argv.includes("--check")) {
    let cur = "";
    try { cur = readFileSync(DOC_PATH, "utf8"); } catch { /* ない */ }
    if (cur.replace(/\r\n/g, "\n") !== text) { console.error("✗ docs/phrasebook.md が 最新では ありません（npm run phrasebook:doc）"); process.exitCode = 1; return; }
    console.log("✓ docs/phrasebook.md は 最新です");
    return;
  }
  writeFileSync(DOC_PATH, text);
  console.log(`→ ${path.relative(ROOT, DOC_PATH)}（${PHRASEBOOK.length} functions）`);
}

if (process.argv[1] && /phrasebook-doc\.ts$/.test(process.argv[1])) main();
