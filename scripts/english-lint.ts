/**
 * 英語チェック（run9 Phase 1）。ネットワークなしで うごく。
 *
 *   npm run english:lint                         # ぜんぶ（レッスン 1〜1200・としょかん・力だめし）
 *   npm run english:lint -- --from 1 --to 30     # レッスン 1〜30 だけ
 *   npm run english:lint -- --from 1 --to 30 --library   # ＋ としょかん（解放レッスンが はんいに ある もの）
 *   npm run english:lint -- --library            # としょかん だけ
 *   npm run english:lint -- --yearly             # 力だめし だけ
 *   オプション: --out <file.md>（出力先）/ --strict（error が あれば 終了コード 1）/ --quiet
 *
 * つづり: cspell（en-US）＋ scripts/english-words.txt（名前・正しいと 確かめた ことば）。
 * 結果は docs/run9/lint/<range>.md に 書く。ルールは scripts/lib/englishRules.ts と docs/english-style-guide.md。
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { lintEntries, renderMarkdown, summarize, walkEntries, type TextEntry } from "./lib/englishLint";

const ROOT = path.resolve(__dirname, "..");
const WORLDS_DIR = path.join(ROOT, "content/curriculum/worlds");
const LIB_DIR = path.join(ROOT, "content/library");
const YEARLY_DIR = path.join(ROOT, "content/yearly");

interface Args { from?: number; to?: number; library: boolean; yearly: boolean; out?: string; strict: boolean; quiet: boolean }

export function parseArgs(argv: string[]): Args {
  const a: Args = { library: false, yearly: false, strict: false, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    const next = () => argv[++i];
    if (k === "--from") a.from = Number(next());
    else if (k === "--to") a.to = Number(next());
    else if (k === "--library") a.library = true;
    else if (k === "--yearly") a.yearly = true;
    else if (k === "--out") a.out = next();
    else if (k === "--strict") a.strict = true;
    else if (k === "--quiet") a.quiet = true;
    else if (k === "--all") { a.from = 1; a.to = 1200; a.library = true; a.yearly = true; }
  }
  const noScope = a.from === undefined && a.to === undefined && !a.library && !a.yearly;
  if (noScope) { a.from = 1; a.to = 1200; a.library = true; a.yearly = true; }
  if (a.from !== undefined && a.to === undefined) a.to = a.from;
  if (a.to !== undefined && a.from === undefined) a.from = 1;
  return a;
}

/**
 * scripts/english-words.txt を よむ。# は コメント。1行に いくつ 書いても よい（空白くぎり）。
 *  [names]       登場人物・場所の 名前（大文字・小文字の まちがいも しらべる）
 *  [words]       どこで つかっても 正しい ことば（日本語由来の ことば・あいさつ・音まね など）
 *  [intentional] 先生の 台本・スライドで だけ ゆるす 形（わざと まちがえた 形・音の つづり・音節の かけら）
 */
export function loadWordList(file = path.join(ROOT, "scripts/english-words.txt")): { names: string[]; words: string[]; intentional: string[]; allow: Map<string, Set<string>> } {
  const lists = { names: [] as string[], words: [] as string[], intentional: [] as string[] };
  const allow = new Map<string, Set<string>>();
  let section = "words" as keyof typeof lists | "allow";
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const sec = /^\[(names|words|intentional|allow)\]$/.exec(line);
    if (sec) { section = sec[1] as typeof section; continue; }
    const parts = line.split(/\s+/);
    if (section === "allow") {
      // [allow] の 1行 = 「ユニット ことば ことば …」（例: L1178 goed eated）
      const [unit, ...ws] = parts;
      const set = allow.get(unit) ?? new Set<string>();
      for (const w of ws) set.add(w.toLowerCase());
      allow.set(unit, set);
    } else lists[section].push(...parts);
  }
  return { ...lists, allow };
}

interface LessonJson { lessonNo: number; title?: string; world: number }

export function collectLessons(from: number, to: number): TextEntry[] {
  const out: TextEntry[] = [];
  for (const f of readdirSync(WORLDS_DIR).filter((x) => /^world-\d+\.json$/.test(x)).sort()) {
    const w = JSON.parse(readFileSync(path.join(WORLDS_DIR, f), "utf8")) as { stage: number; lessons: LessonJson[] };
    for (const l of w.lessons) {
      if (l.lessonNo < from || l.lessonNo > to) continue;
      const unit = `L${String(l.lessonNo).padStart(4, "0")}`;
      out.push(...walkEntries(l, { unit, unitTitle: l.title, lessonNo: l.lessonNo, stage: w.stage }));
    }
  }
  return out;
}

export function collectLibrary(range?: { from: number; to: number }): TextEntry[] {
  const out: TextEntry[] = [];
  for (const f of readdirSync(LIB_DIR).filter((x) => x.endsWith(".json") && x !== "index.json").sort()) {
    const d = JSON.parse(readFileSync(path.join(LIB_DIR, f), "utf8")) as Record<string, unknown>;
    const [listKey, prefix] = f.startsWith("stories") ? ["stories", "story"] : f === "chants.json" ? ["chants", "chant"] : ["themes", "talk"];
    const list = (d[listKey] ?? []) as { id: string; stage: number; title?: string; titleJa?: string; unlockLesson?: number }[];
    for (const it of list) {
      if (range && ((it.unlockLesson ?? 0) < range.from || (it.unlockLesson ?? 0) > range.to)) continue;
      out.push(...walkEntries(it, { unit: `${prefix}:${it.id}`, unitTitle: it.title ?? it.titleJa, stage: it.stage }));
    }
  }
  return out;
}

export function collectYearly(): TextEntry[] {
  const out: TextEntry[] = [];
  for (const f of readdirSync(YEARLY_DIR).filter((x) => /^stage-\d\.json$/.test(x)).sort()) {
    const d = JSON.parse(readFileSync(path.join(YEARLY_DIR, f), "utf8")) as { stage: number; titleJa?: string };
    out.push(...walkEntries(d, { unit: `yearly:${d.stage}`, unitTitle: d.titleJa, stage: d.stage }));
  }
  return out;
}

export function rangeName(a: Args): string {
  const parts: string[] = [];
  const full = a.from === 1 && a.to === 1200 && a.library && a.yearly;
  if (full) return "all";
  if (a.from !== undefined && a.to !== undefined) parts.push(`L${a.from}-${a.to}`);
  if (a.library) parts.push("library");
  if (a.yearly) parts.push("yearly");
  return parts.join("+");
}

async function cspellChecker(extra: readonly string[]): Promise<(w: string) => boolean> {
  const { getDefaultSettings, mergeSettings, finalizeSettings, getDictionary, combineTextAndLanguageSettings } = await import("cspell-lib");
  const base = mergeSettings(await getDefaultSettings(), { language: "en-US" });
  const dict = await getDictionary(finalizeSettings(combineTextAndLanguageSettings(base, "", ["plaintext"])));
  const own = new Set(extra.map((w) => w.toLowerCase()));
  return (w) => own.has(w) || dict.has(w) || dict.has(w.charAt(0).toUpperCase() + w.slice(1));
}

async function main() {
  const a = parseArgs(process.argv.slice(2));
  const entries: TextEntry[] = [];
  const hasLessons = a.from !== undefined && a.to !== undefined;
  const add = (list: TextEntry[]) => { for (const e of list) entries.push(e); };
  if (hasLessons) add(collectLessons(a.from!, a.to!));
  if (a.library) add(collectLibrary(hasLessons && !(a.from === 1 && a.to === 1200) ? { from: a.from === 1 ? 0 : a.from!, to: a.to! } : undefined));
  if (a.yearly) add(collectYearly());

  const wl = loadWordList();
  const isKnownWord = await cspellChecker([...wl.words, ...wl.names]);
  const teaching = new Set(wl.intentional.map((w) => w.toLowerCase()));
  const issues = lintEntries(entries, {
    isKnownWord,
    names: wl.names,
    isTeachingForm: (w) => teaching.has(w),
    isAllowedIn: (unit, w) => wl.allow.get(unit)?.has(w) ?? false,
  });
  const s = summarize(entries, issues);
  const name = rangeName(a);
  const scope = [
    hasLessons ? `レッスン ${a.from}〜${a.to}` : "",
    a.library ? "としょかん" : "",
    a.yearly ? "力だめし" : "",
  ].filter(Boolean).join(" ＋ ");
  const out = a.out ?? path.join(ROOT, "docs/run9/lint", `${name}.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  const cmd = `npm run english:lint -- ${process.argv.slice(2).join(" ")}`.trim();
  writeFileSync(out, renderMarkdown(name, `${scope}（\`${cmd}\`）`, entries, issues, new Date().toISOString().slice(0, 10)));

  console.log(`english:lint ${name}: ${s.entries} strings in ${s.units} units`);
  console.log(`  error ${s.byLevel.error} / warn ${s.byLevel.warn} / info ${s.byLevel.info}`);
  for (const [r, c] of Object.entries(s.byRule).sort()) console.log(`  ${r.padEnd(18)} error ${c.error}  warn ${c.warn}  info ${c.info}`);
  if (!a.quiet) {
    for (const i of issues.filter((x) => x.level === "error").slice(0, 20)) console.log(`  ✗ ${i.unit} ${i.path}: ${i.message}`);
  }
  console.log(`  → ${path.relative(ROOT, out)}`);
  if (a.strict && s.byLevel.error > 0) process.exitCode = 1;
}

if (process.argv[1] && /english-lint\.ts$/.test(process.argv[1])) {
  main().catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
}
