/**
 * フレーズブックで 英語を そろえる（run10 Phase 5）。
 *
 *   npm run phrasebook:fix            # content/ の JSON を なおして docs/run10/changes/phrasebook.md に 記録
 *   npm run phrasebook:fix -- --dry   # なおさずに 数だけ
 *
 * - scripts/lib/phrasebook.ts の fix が ある 形だけ 自動で なおす（avoid と、ステージの そとの variant）
 * - MANUAL_EDITS は 文脈で きめた 置きかえ（ユニットごと）
 * - JSON は 書きなおさず、かわった 文字列の ところだけ 置きかえる（改行・インデント・ならびは そのまま）
 * - 日本語の 文字列（ja・～Ja）の 中の 英語も おなじように なおす（説明と 英語が ずれない ように）
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { applyPhrasebook, type PhrasebookChange } from "./lib/phrasebook";

const ROOT = path.resolve(__dirname, "..");
const SKIP_KEYS = new Set(["id", "imageKey", "audioKey", "file", "videoUrl", "speaker", "character"]);

/** 文脈で きめた 置きかえ（unit → [まえ, あと]） */
export const MANUAL_EDITS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  // スピーチの はじめ:「Please listen to my speech.」は 日本の 教科書の きまり文句 → じっさいの スピーチの はじめかた（L328 の 文型）
  L0239: [
    ["Please listen to my speech", "Let me tell you about my hero"],
    // ステージ1 の 8語までに おさめる（Start with "…" だと 9語）
    ['Start with "Let me tell you about my hero."', 'Start your speech! "Let me tell you about my hero."'],
  ],
};

/** アプリの コードで 手で なおした もの（記録だけ） */
export const CODE_EDITS: readonly { file: string; fn: string; before: string; after: string }[] = [
  { file: "src/lib/teacherVideo/export.ts（先生の 動画の 字幕・TPR の まち時間）", fn: "classroom", before: "(Do it with your body!)", after: "(Act it out!)" },
];

export interface FileChange { file: string; unit: string; path: string; fn: string; before: string; after: string }

interface Slot { value: string; stage: number; unit: string; path: string; key: string }

/** JSON を じゅんばんに たどって 文字列の 値を あつめる（ステージ・ユニットつき） */
export function collectSlots(doc: unknown, kind: "world" | "library" | "yearly"): Slot[] {
  const out: Slot[] = [];
  const root = doc as Record<string, unknown>;
  const fileStage = typeof root.stage === "number" ? root.stage : 0;
  const visit = (v: unknown, p: string, key: string, ctx: { stage: number; unit: string }) => {
    if (typeof v === "string") { out.push({ value: v, stage: ctx.stage, unit: ctx.unit, path: p, key }); return; }
    if (Array.isArray(v)) { v.forEach((x, i) => visit(x, `${p}[${i}]`, key, ctx)); return; }
    if (v && typeof v === "object") {
      const o = v as Record<string, unknown>;
      let c = ctx;
      if (kind === "world" && typeof o.lessonNo === "number" && "teacher" in o) c = { stage: fileStage, unit: `L${String(o.lessonNo).padStart(4, "0")}` };
      if (kind === "library" && typeof o.id === "string" && typeof o.stage === "number") c = { stage: o.stage, unit: o.id };
      for (const [k, x] of Object.entries(o)) visit(x, p ? `${p}.${k}` : k, k, c);
    }
  };
  visit(doc, "", "", { stage: fileStage, unit: kind === "yearly" ? `yearly:${fileStage}` : "" });
  return out;
}

/** 生の JSON の 文字列トークン（キーでは ない もの）の ばしょ */
export function valueTokens(raw: string): { start: number; end: number; value: string }[] {
  const out: { start: number; end: number; value: string }[] = [];
  const re = /"(?:[^"\\]|\\.)*"/g;
  for (const m of raw.matchAll(re)) {
    const end = m.index + m[0].length;
    if (/^\s*:/.test(raw.slice(end, end + 8))) continue; // キー
    out.push({ start: m.index, end, value: JSON.parse(m[0]) as string });
  }
  return out;
}

export function fixText(text: string, stage: number, unit: string): { text: string; changes: PhrasebookChange[] } {
  let t = text;
  const changes: PhrasebookChange[] = [];
  for (const [from, to] of MANUAL_EDITS[unit] ?? []) {
    if (t.includes(from)) { const next = t.split(from).join(to); changes.push({ fn: "manual", form: from, before: t, after: next }); t = next; }
  }
  const r = applyPhrasebook(t, stage, unit);
  return { text: r.text, changes: [...changes, ...r.changes] };
}

/** 1つの ファイルを なおした 結果（書かない） */
export function fixJson(raw: string, kind: "world" | "library" | "yearly", file = ""): { raw: string; changes: FileChange[] } {
  const slots = collectSlots(JSON.parse(raw), kind);
  const toks = valueTokens(raw);
  if (slots.length !== toks.length || slots.some((s, i) => s.value !== toks[i].value)) throw new Error(`${file}: JSON の ならびが あわない（${slots.length} / ${toks.length}）`);
  const changes: FileChange[] = [];
  let out = "";
  let last = 0;
  slots.forEach((s, i) => {
    if (SKIP_KEYS.has(s.key)) return;
    const r = fixText(s.value, s.stage, s.unit);
    if (r.text === s.value) return;
    for (const c of r.changes) changes.push({ file, unit: s.unit, path: s.path, fn: c.fn, before: s.value, after: r.text });
    out += raw.slice(last, toks[i].start) + JSON.stringify(r.text);
    last = toks[i].end;
  });
  out += raw.slice(last);
  // おなじ 文字列に 2つの なおしが あった ときは 1行に まとめる
  const uniq = new Map<string, FileChange>();
  for (const c of changes) {
    const k = `${c.unit}|${c.path}`;
    const prev = uniq.get(k);
    uniq.set(k, prev ? { ...prev, fn: prev.fn.split("+").includes(c.fn) ? prev.fn : `${prev.fn}+${c.fn}` } : c);
  }
  return { raw: out, changes: [...uniq.values()] };
}

export function contentFiles(root = ROOT): { file: string; kind: "world" | "library" | "yearly" }[] {
  const list: { file: string; kind: "world" | "library" | "yearly" }[] = [];
  const add = (dir: string, kind: "world" | "library" | "yearly", ok: (f: string) => boolean) => {
    for (const f of readdirSync(path.join(root, dir)).filter(ok).sort()) list.push({ file: `${dir}/${f}`, kind });
  };
  add("content/curriculum/worlds", "world", (f) => /^world-\d+\.json$/.test(f));
  add("content/library", "library", (f) => f.endsWith(".json") && f !== "index.json");
  add("content/yearly", "yearly", (f) => /^stage-\d\.json$/.test(f));
  return list;
}

/** ちがう ところの まわりだけ みせる */
export function diffSnippet(before: string, after: string, pad = 40): [string, string] {
  let i = 0;
  while (i < before.length && i < after.length && before[i] === after[i]) i++;
  let j = 0;
  while (j < before.length - i && j < after.length - i && before[before.length - 1 - j] === after[after.length - 1 - j]) j++;
  const s = Math.max(0, i - pad);
  const cut = (t: string, e: number) => `${s > 0 ? "…" : ""}${t.slice(s, e)}${e < t.length ? "…" : ""}`;
  return [cut(before, Math.min(before.length, before.length - j + pad)), cut(after, Math.min(after.length, after.length - j + pad))];
}

function main() {
  const dry = process.argv.includes("--dry");
  const all: FileChange[] = [];
  for (const { file, kind } of contentFiles()) {
    const abs = path.join(ROOT, file);
    const raw = readFileSync(abs, "utf8");
    const r = fixJson(raw, kind, file);
    if (!r.changes.length) continue;
    all.push(...r.changes);
    if (!dry) writeFileSync(abs, r.raw);
    console.log(`${file}: ${r.changes.length}`);
  }
  const byFn = new Map<string, number>();
  for (const c of all) for (const f of c.fn.split("+")) byFn.set(f, (byFn.get(f) ?? 0) + 1);
  console.log(`phrasebook:fix ${dry ? "(dry) " : ""}${all.length} strings in ${new Set(all.map((c) => c.unit)).size} units`);
  for (const [f, n] of [...byFn].sort()) console.log(`  ${f.padEnd(16)} ${n}`);
  if (dry || !all.length) return;
  const out = path.join(ROOT, "docs/run10/changes/phrasebook.md");
  mkdirSync(path.dirname(out), { recursive: true });
  const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
  const lines = [
    "# フレーズブックで そろえた 英語（run10 Phase 5）", "",
    "`npm run phrasebook:fix` が なおした 文字列の 一覧（ルールは docs/phrasebook.md・scripts/lib/phrasebook.ts）。", "",
    `- ぜんぶで **${all.length} 文字列**（${new Set(all.map((c) => c.unit)).size} ユニット）`,
    ...[...byFn].sort().map(([f, n]) => `- ${f}: ${n}`), "",
    "| unit | path | rule | before | after |", "|---|---|---|---|---|",
  ];
  for (const c of all) {
    const [b, a] = diffSnippet(c.before, c.after);
    lines.push(`| ${c.unit} | \`${c.path}\` | ${c.fn} | ${esc(b)} | ${esc(a)} |`);
  }
  lines.push("", "## アプリの コード（手で なおした もの・`npm run english:lint -- --src` で 見つけた）", "", "| file | rule | before | after |", "|---|---|---|---|");
  for (const c of CODE_EDITS) lines.push(`| ${c.file} | ${c.fn} | ${esc(c.before)} | ${esc(c.after)} |`);
  writeFileSync(out, `${lines.join("\n")}\n`);
  console.log(`  → ${path.relative(ROOT, out)}`);
}

if (process.argv[1] && /phrasebook-fix\.ts$/.test(process.argv[1])) main();
