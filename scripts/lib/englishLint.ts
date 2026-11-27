/**
 * 英語チェックの 本体（run9 Phase 1）。ネットワークを つかわない 純粋な 関数だけ。
 *  - collectEntries: レッスン・としょかん・力だめしの JSON から 英語の 文字列を ぬきだす（どこに あるか の path つき）
 *  - lintEntries: ルール（englishRules.ts）で しらべて Issue の 一覧を かえす
 *  - つづりの 辞書は 外から わたす（CLI は cspell、テストは 小さな Set）
 */
import {
  CANONICAL_FORMS, CONTRACTIONS, GRAMMAR_HABITS, MAX_WORDS_BY_STAGE, OUR_EXCEPTIONS, PHONICS_GRAPHEMES,
  STIFF_PHRASES, UK_SPELLINGS, UK_WORDS, WASEI_EIGO, type Level, type PhraseRule,
} from "./englishRules";
import { phrasebookHits } from "./phrasebook";

/**
 * line    = 文（セリフ・おはなし・字幕・れい文）
 * label   = みだし・場面の 説明（文末の 記号は いらない）
 * item    = ことば（単語・えらびし）
 * pattern = 文の 型（～ を つかって よい）
 * mixed   = 日本語と 英語が まざった 文（先生の say など）。英語の ところだけ しらべる
 */
export type TextKind = "line" | "label" | "item" | "pattern" | "mixed";

export interface TextEntry {
  /** "L0001" / "story:s1-01" / "chant:c-01" / "talk:t-food" / "yearly:1" */
  unit: string;
  unitTitle?: string;
  lessonNo?: number;
  stage: number;
  path: string;
  text: string;
  kind: TextKind;
  /** 文末の 記号・大文字で はじまる かを しらべる（会話・おはなしの 行・れい文） */
  strict: boolean;
  /** 人の セリフ・先生の ことば（Please / 短縮形 を しらべる） */
  spoken: boolean;
  /** 会話・おはなしの 行の ならび（となりどうしの 重複を しらべる） */
  seq?: string;
}

export interface Issue {
  rule: string;
  level: Level;
  unit: string;
  path: string;
  text: string;
  message: string;
}

export interface LintOptions {
  /** つづりが 正しいか（小文字で わたす） */
  isKnownWord: (lower: string) => boolean;
  /** 登場人物などの 名前（大文字で はじまる 形） */
  names: readonly string[];
  /** 先生の 台本・スライドで だけ ゆるす 形（わざと まちがえた 形・音の つづり・音節）。小文字で わたす */
  isTeachingForm?: (lower: string) => boolean;
  /** その ユニットで だけ ゆるす ことば（english-words.txt の [allow]。例: L1178 で「goed」を 引用する） */
  isAllowedIn?: (unit: string, lower: string) => boolean;
}

const JA_RE = /[぀-ヿ㐀-鿿！-｠　-〿]/;
const JA_SPLIT_RE = /[぀-ヿ㐀-鿿！-｠　-〿]+/;
const LATIN_RE = /[A-Za-z]/;

const SKIP_KEYS = new Set([
  "action", "emoji", "kind", "lang", "gesture", "rule", "sounds", "focus", "grade", "topic", "testPoints", "speaker", "character",
  "level", "id", "imageKey", "videoUrl", "answer", "core", "minutes", "pauseMs", "file", "unlockLesson", "stage", "world", "lessonNo",
  "reviewed", "format", "skill", "note", "levelJa", "audioKey", "slot", "price", "name", "type", "rubric", "keywords", "accept",
]);
const MIXED_KEYS = new Set(["say", "teacherScript"]);
const PATTERN_KEYS = new Set(["grammar", "targetExpressions"]);
const ITEM_KEYS = new Set(["words", "choices", "alt", "options"]);
const LABEL_KEYS = new Set(["title", "scene", "subtitleEn", "focusJa"]);
const STRICT_KEYS = new Set(["starterEn", "q", "question", "sentence", "example"]);

function isJaKey(k: string): boolean {
  return /Ja$/.test(k) || k === "ja";
}

/** JSON を たどって 英語の 文字列を あつめる */
export function walkEntries(value: unknown, base: Omit<TextEntry, "path" | "text" | "kind" | "strict" | "spoken" | "seq">, prefix = ""): TextEntry[] {
  const out: TextEntry[] = [];
  const visit = (v: unknown, path: string, key: string, parents: string[]) => {
    if (typeof v === "string") {
      if (!LATIN_RE.test(v)) return;
      const inSlide = parents.includes("slide");
      const inLines = parents.includes("lines") || parents.includes("audio");
      const inVocab = parents.includes("vocab") || (parents.includes("words") && key === "en");
      let kind: TextKind;
      // ～（文の 型の あな）は 日本語として かぞえない
      if (MIXED_KEYS.has(key) || JA_RE.test(v.replace(/～/g, ""))) kind = "mixed";
      else if (PATTERN_KEYS.has(key) || inSlide) kind = "pattern";
      else if (ITEM_KEYS.has(key) || inVocab) kind = "item";
      else if (LABEL_KEYS.has(key)) kind = "label";
      else kind = "line";
      const strict = kind === "line" && (inLines || parents.includes("expressions") || STRICT_KEYS.has(key));
      const spoken = kind === "mixed" ? MIXED_KEYS.has(key) : (inLines || key === "subtitleEn" || key === "starterEn" || parents.includes("tpr"));
      const seqParent = inLines ? path.replace(/\[\d+\](\.[A-Za-z]+)?$/, "") : undefined;
      out.push({ ...base, path, text: v, kind, strict, spoken, seq: seqParent });
      return;
    }
    if (Array.isArray(v)) {
      v.forEach((x, i) => visit(x, `${path}[${i}]`, key, parents));
      return;
    }
    if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
        if (SKIP_KEYS.has(k) || isJaKey(k)) continue;
        visit(x, path ? `${path}.${k}` : k, k, [...parents, key]);
      }
    }
  };
  visit(value, prefix, "", []);
  return out;
}

// ---------------------------------------------------------------------------
// 文字列の 小さな 道具
// ---------------------------------------------------------------------------

/** 日本語まじりの 文から 英語の かたまりを ぬきだす */
export function latinRuns(text: string): string[] {
  return text.split(JA_SPLIT_RE).map((s) => s.trim()).filter((s) => LATIN_RE.test(s));
}

/** 文に わける（. ! ? の あと） */
export function sentences(text: string): string[] {
  return text.split(/(?<=[.!?]["')]?)\s+/).map((s) => s.trim()).filter(Boolean);
}

export function wordCount(sentence: string): number {
  return (sentence.match(/[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*/g) ?? []).length;
}

/** つづりを しらべる 単語（/s/ などの 発音記号・URL は のぞく） */
export function wordsOf(text: string): string[] {
  // /s/ や /ˈhʌndrəd/ などの 発音記号（/ の すぐ内側に 空白が ない もの）は のぞく。"Hello. / Hola." の 区切りは のこす
  const cleaned = text.replace(/https?:\/\/\S+/g, " ").replace(/\/(?=\S)[^/\n]{1,30}(?<=\S)\//g, " ");
  const L = "A-Za-z\\u00C0-\\u00FF";
  return cleaned.match(new RegExp(`[${L}]+(?:['’][${L}]+)*(?:-[${L}]+(?:['’][${L}]+)*)*`, "g")) ?? [];
}

export function levenshtein(a: string, b: string, max = 3): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

const clip = (s: string, n = 140) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ---------------------------------------------------------------------------
// 1つの 文字列を しらべる
// ---------------------------------------------------------------------------

const VOWEL_SOUND_EXCEPT_A = /^(uni|use|usu|uti|ure|uro|eu|ewe|one|once|ufo|uk)/i; // a + 母音字 だけど 子音の おと
const SILENT_H = /^(hour|honest|honor|heir|herb)/i; // an + h

/** 冠詞の すぐ あとに こない ことば（"C, A and T" / "A is a letter" の A は 文字の なまえ） */
const NOT_AFTER_ARTICLE = new Set([
  "and", "or", "is", "are", "was", "were", "in", "on", "at", "to", "of", "for", "again", "often", "also", "as", "if", "it", "its", "be",
  "by", "with", "from", "has", "have", "says", "said", "makes", "can", "will", "the", "then", "says", "sounds", "comes", "goes", "into",
]);

function articleIssues(t: string): string[] {
  const out: string[] = [];
  for (const m of t.matchAll(/\b(a|an|A|An)\s+([A-Za-z][A-Za-z'-]*)/g)) {
    const art = m[1].toLowerCase();
    const w = m[2];
    if (w.length === 1 || /^[A-Z]{2,}$/.test(w)) continue; // 文字・略語（an S / a TV）は しらべない
    if (NOT_AFTER_ARTICLE.has(w.toLowerCase())) continue;
    const vowel = /^[aeiou]/i.test(w);
    if (art === "a" && vowel && !VOWEL_SOUND_EXCEPT_A.test(w)) out.push(`"a ${w}" → "an ${w}"`);
    if (art === "an" && !vowel && !SILENT_H.test(w)) out.push(`"an ${w}" → "a ${w}"`);
  }
  return out;
}

function phraseIssues(rules: readonly PhraseRule[], text: string, spoken: boolean): PhraseRule[] {
  return rules.filter((r) => (!r.spokenOnly || spoken) && r.re.test(text));
}

type WordProblem = { rule: string; level: Level; message: string } | null;

export interface WordChecker {
  /** teaching = 先生の 台本・スライド（わざと まちがえた 形・音の つづり・音節の かけらを ゆるす） */
  check(word: string, teaching?: boolean): WordProblem;
}

export function makeWordChecker(opts: LintOptions): WordChecker {
  const names = new Map(opts.names.map((n) => [n.toLowerCase(), n]));
  const cache = new Map<string, WordProblem>();
  const checker: WordChecker = {
    check(raw, teaching = false) {
      const word = raw.replace(/’/g, "'");
      const ck = `${teaching ? "T" : "-"}${word}`;
      if (cache.has(ck)) return cache.get(ck)!;
      const res = ((): WordProblem => {
        if (word.includes("-")) {
          const joined = word.replace(/-/g, "");
          // Pre-sen-ta-tion / e-LEC-tric（音節・強勢の 説明）や tick-tock は つなげて 正しければ OK
          if (joined.length > 1 && checker.check(joined, teaching) === null) return null;
          for (const part of word.split("-")) {
            const p = checker.check(part, teaching);
            if (p) return p;
          }
          return null;
        }
        if (teaching && opts.isTeachingForm?.(word.toLowerCase().replace(/'s$/, ""))) return null;
        const base = word.replace(/'s$|s'$/i, (m) => (m.toLowerCase() === "s'" ? "s" : ""));
        const lower = base.toLowerCase();
        if (lower.length <= 1) return null;
        // 名前
        const nm = names.get(lower);
        if (nm) return base === lower && base !== nm && !opts.isKnownWord(lower) ? { rule: "name", level: "error", message: `name "${base}" → "${nm}"` } : null;
        // イギリス式
        const uk = UK_SPELLINGS[lower];
        if (uk) return { rule: "uk-spelling", level: "error", message: `"${base}" → "${uk}" (US)` };
        if (/our(s|ed|ing|ite|ites|ful|able|er|ers|hood|ly)?$/.test(lower)) {
          const stem = lower.replace(/(s|ed|ing|ite|ites|ful|able|er|ers|hood|ly)$/, (m) => (lower.endsWith(`our${m}`) ? "" : m));
          if (stem.endsWith("our") && !OUR_EXCEPTIONS.has(stem) && !OUR_EXCEPTIONS.has(lower) && !opts.isKnownWord(lower)) {
            return { rule: "uk-spelling", level: "error", message: `"${base}" → "${base.replace(/our/i, "or")}" (US)` };
          }
        }
        if (opts.isKnownWord(lower) || PHONICS_GRAPHEMES.has(lower)) return null;
        // 1文字 ちがいの 名前
        if (lower.length >= 4 && !/(.)\1\1/.test(lower)) {
          for (const [nl, n] of names) if (levenshtein(nl, lower, 1) <= 1) return { rule: "name", level: "error", message: `"${base}" — did you mean "${n}"?` };
        }
        // のばした ことば（Ssssun / Yesss / mmm）は おまけで ゆるす
        if (/(.)\1\1/i.test(lower) && opts.isKnownWord(lower.replace(/(.)\1{2,}/gi, "$1")) ) return null;
        if (/(.)\1\1/i.test(lower) && opts.isKnownWord(lower.replace(/(.)\1{2,}/gi, "$1$1"))) return null;
        return { rule: "spelling", level: "error", message: `unknown word "${base}"` };
      })();
      cache.set(ck, res);
      return res;
    },
  };
  return checker;
}

/**
 * 先生の 台本の「音節に わけて よむ」かけら（Rab, bit. / Thirs, ty. / Today's word part is spect. Respect.）か。
 * となりの かけらと つなげると 正しい ことばに なる・同じ 文の 正しい ことばの 一部 なら OK。
 */
export function fragmentOk(toks: readonly string[], i: number, words: WordChecker): boolean {
  const ok = (s: string) => /^[A-Za-z]+$/.test(s) && words.check(s, true) === null;
  const t = (k: number) => (k >= 0 && k < toks.length ? toks[k].replace(/-/g, "") : "");
  const joins = [t(i - 1) + t(i), t(i) + t(i + 1), t(i) + t(i + 1) + t(i + 2), t(i - 1) + t(i) + t(i + 1), t(i - 2) + t(i - 1) + t(i)];
  if (joins.some((j) => j.length > t(i).length && ok(j.toLowerCase()))) return true;
  const lower = t(i).toLowerCase();
  if (lower.length < 2) return true;
  return toks.some((x) => x.length > lower.length && x.toLowerCase().replace(/-/g, "").includes(lower) && ok(x.toLowerCase().replace(/-/g, "")));
}

/** 1つの エントリーを しらべる */
export function lintEntry(e: TextEntry, words: WordChecker, isAllowedIn?: LintOptions["isAllowedIn"]): Issue[] {
  const out: Issue[] = [];
  const add = (rule: string, level: Level, message: string) => out.push({ rule, level, unit: e.unit, path: e.path, text: clip(e.text), message });
  const chunks = e.kind === "mixed" ? latinRuns(e.text) : [e.text];

  // つづり・名前・イギリス式
  const seen = new Set<string>();
  const teaching = e.kind === "mixed" || e.kind === "pattern" || /subtitleEn$/.test(e.path);
  for (const c of chunks) {
    const toks = wordsOf(c);
    toks.forEach((w, i) => {
      if (seen.has(w)) return;
      const r = words.check(w, teaching);
      if (r && r.rule === "spelling" && teaching && fragmentOk(toks, i, words)) return;
      if (r && isAllowedIn?.(e.unit, w.toLowerCase().replace(/'s$/, ""))) return;
      seen.add(w);
      if (r) add(r.rule, r.level, r.message);
    });
  }

  // 表現の ルール
  for (const c of chunks) {
    for (const rs of [UK_WORDS, WASEI_EIGO, STIFF_PHRASES, GRAMMAR_HABITS, CANONICAL_FORMS]) {
      for (const r of phraseIssues(rs, c, e.spoken)) {
        const m = c.match(r.re);
        // [allow] の「ことば_ことば」（_ = スペース）は その ユニットで だけ ゆるす 表現（例: L0757 i'm_exciting）
        if (m && isAllowedIn?.(e.unit, m[0].toLowerCase().trim().replace(/\s+/g, "_"))) continue;
        // 先生の 台本では「one bread, two breads とは いわない」の ように わざと 書く ことが あるので warn
        const lv: Level = teaching && r.level === "error" && r.rule === "grammar-habit" ? "warn" : r.level;
        add(r.rule, lv, `"${m?.[0] ?? ""}" → ${r.suggestion}${lv !== r.level ? " (teacher script: intentional?)" : ""}`);
      }
    }
    for (const a of articleIssues(c)) add("grammar-habit", teaching ? "warn" : "error", a);
  }

  // フレーズブック（run10 Phase 5・docs/phrasebook.md）: つかわない 形・ステージの そとの 形
  for (const h of phrasebookHits(e.text, e.stage, e.unit)) add("phrasebook", "error", h.message);

  if (e.kind === "mixed") return out;
  const t = e.text;

  // 句読点（ASCII）
  if (/[’‘“”]/.test(t)) add("punctuation", "error", "curly quotes → straight ' \"");
  if (/[！？。、，．：；]/.test(t)) add("punctuation", "error", "full-width punctuation in English");
  if (/…/.test(t)) add("punctuation", "warn", `"…" → "..."`);
  if (/ {2,}/.test(t)) add("punctuation", "warn", "double space");
  if (/^\s|\s$/.test(t)) add("punctuation", "error", "leading/trailing space");
  if (/\s[,!?;:]|\s\.(?!\.\.)/.test(t)) add("punctuation", "error", "space before punctuation");
  if (/[,!?;:](?=[A-Za-z])|[a-z]\.(?=[A-Z][a-z])/.test(t)) add("punctuation", "error", "missing space after punctuation");
  if (/!!|\?!|!\?|\?\?/.test(t)) add("punctuation", "warn", "use one ! or ?");
  if (/[～~]/.test(t) && e.kind !== "pattern" && e.kind !== "label") add("punctuation", "error", "placeholder ～ in a spoken line");

  if (e.strict) {
    if (!/[.!?,:;"')]$|\.\.\.$/.test(t.trim())) add("punctuation", "warn", "missing end mark (. ! ?)");
    const first = t.replace(/^\([^)]*\)\s*/, "").replace(/^["'(\s]+/, "");
    if (/^[a-z]/.test(first) && !/^(iPad|e\.g\.)/.test(first)) add("capitalization", "warn", "sentence starts lowercase");
  }
  // 代名詞の i（フォニックスの「p, i, g」の i は のぞく）
  if ((e.kind === "line" || e.kind === "label") && /\bi('m|'ve|'ll|'d)\b|\bi (am|was|have|had|can|can't|will|like|want|think|don't|didn't|love|see|go|went)\b/.test(t)) add("capitalization", "warn", `lowercase "i" → "I"`);

  // 長さ
  if (e.kind === "line") {
    const max = MAX_WORDS_BY_STAGE[e.stage] ?? 22;
    for (const s of sentences(t)) {
      const n = wordCount(s);
      if (n > max) add("sentence-length", "warn", `${n} words > ${max} (stage ${e.stage}): "${clip(s, 80)}"`);
    }
  }

  // Please ～ / 短縮形
  if (e.spoken && e.kind === "line") {
    // 教室の めいれい（Please sit down. / Please listen.）だけ。Please call me ～ / Please help me! などは ふつう
    const teacherVoice = /subtitleEn$/.test(e.path) || e.path.startsWith("tpr");
    for (const s of sentences(t)) {
      if (/^["']?Please (sit|stand|listen|look|be|open|close|repeat|say|write|read|raise|put|take|stop|line|wait|try|answer|draw|touch|point|clap|jump|turn|show|speak|use)\b/.test(s)) {
        add("please-command", teacherVoice ? "warn" : "info", `"${clip(s, 60)}" → Can you ~? / Let's ~. / plain imperative`);
      }
    }
    for (const c of CONTRACTIONS) {
      const m = t.match(c.re);
      if (m) add("contraction", "info", `"${m[0]}" → "${c.to}"?`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// まとめて しらべる
// ---------------------------------------------------------------------------

/** 文の 内側の ちがい（, ' - 大文字小文字）だけを みる ための 形 */
export function variantKey(t: string): { loose: string; strict: string } {
  const s = t.trim().replace(/’/g, "'").replace(/\s*―\s*/g, ". ").replace(/\.{3}|…/g, ".").replace(/^["']+|["']+$/g, "")
    .replace(/[.!?]+$/, "").replace(/[.!?]+(?=\s)/g, ".");
  // 2文字目も 大文字（STEM・OK）なら 1文字目を 小さく しない
  const strict = /^[A-Z](?![A-Z])/.test(s) ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  // ' は のこす（well / we'll、were / we're は べつの ことば）
  const loose = s.toLowerCase().replace(/[^a-z0-9']/g, "");
  return { loose, strict };
}

export function lintEntries(entries: readonly TextEntry[], opts: LintOptions): Issue[] {
  const words = makeWordChecker(opts);
  const out: Issue[] = [];
  for (const e of entries) for (const i of lintEntry(e, words, opts.isAllowedIn)) out.push(i);

  // ユニットごと: Let's の かず・となりの 重複・にている 行
  const byUnit = new Map<string, TextEntry[]>();
  for (const e of entries) {
    const a = byUnit.get(e.unit) ?? [];
    a.push(e);
    byUnit.set(e.unit, a);
  }
  for (const [unit, list] of byUnit) {
    const lets = list.filter((e) => e.kind === "line").reduce((n, e) => n + (e.text.match(/\bLet's\b/g)?.length ?? 0), 0);
    if (lets > 3 && unit.startsWith("L")) out.push({ rule: "lets-overuse", level: "info", unit, path: "(lesson)", text: `${lets} × Let's`, message: `${lets} "Let's" in one lesson (aim ≤ 3)` });

    const isChant = unit.startsWith("chant:");
    let prev: TextEntry | undefined;
    for (const e of list) {
      if (!e.seq) { prev = undefined; continue; }
      if (prev && prev.seq === e.seq && prev.text.trim() === e.text.trim() && !isChant) {
        out.push({ rule: "duplicate", level: unit.startsWith("L") ? "warn" : "info", unit, path: e.path, text: clip(e.text), message: "same line twice in a row" });
      }
      prev = e;
    }

    const lines = [...new Set(list.filter((e) => e.kind === "line" && e.text.length >= 12).map((e) => e.text.trim()))];
    for (let i = 0; i < lines.length; i++) {
      for (let j = i + 1; j < lines.length; j++) {
        const a = lines[i].toLowerCase();
        const b = lines[j].toLowerCase();
        if (variantKey(a).loose === variantKey(b).loose) continue;
        const d = levenshtein(a, b, 2);
        if (d >= 1 && d <= 2 && wordsOf(a).length === wordsOf(b).length) {
          const wa = wordsOf(a);
          const wb = wordsOf(b);
          // 1語だけ ちがって、その 2語が ちがう ことば（cat / hat など 教材の いれかえ）なら ふつう
          const diff = wa.map((w, k) => [w, wb[k]]).filter(([x, y]) => x !== y);
          if (diff.length === 1 && levenshtein(diff[0][0], diff[0][1], 2) > 1) continue;
          if (diff.length === 1 && words.check(diff[0][0]) === null && words.check(diff[0][1]) === null) continue;
          out.push({ rule: "near-duplicate", level: "info", unit, path: "(lesson)", text: clip(`${lines[i]} / ${lines[j]}`), message: "lines differ by 1–2 letters (typo?)" });
        }
      }
    }
  }

  // はんい ぜんたい: おなじ 表現の 書きかたの ゆれ
  const groups = new Map<string, Map<string, Set<string>>>();
  for (const e of entries) {
    if (e.kind !== "line" && e.kind !== "item") continue;
    const { loose, strict } = variantKey(e.text);
    if (loose.length < 4) continue;
    const g = groups.get(loose) ?? new Map<string, Set<string>>();
    const units = g.get(strict) ?? new Set<string>();
    units.add(e.unit);
    g.set(strict, units);
    groups.set(loose, g);
  }
  for (const g of groups.values()) {
    if (g.size < 2) continue;
    const variants = [...g.entries()].sort((a, b) => b[1].size - a[1].size);
    const desc = variants.map(([v, u]) => `"${v}" ×${u.size} (${[...u].slice(0, 3).join(", ")}${u.size > 3 ? ", …" : ""})`).join(" vs ");
    out.push({ rule: "inconsistent-form", level: "warn", unit: "(range)", path: "(range)", text: clip(variants[0][0]), message: desc });
  }
  return out;
}

// ---------------------------------------------------------------------------
// レポート
// ---------------------------------------------------------------------------

export interface Summary {
  entries: number;
  units: number;
  byLevel: Record<Level, number>;
  byRule: Record<string, Record<Level, number>>;
}

export function summarize(entries: readonly TextEntry[], issues: readonly Issue[]): Summary {
  const byLevel: Record<Level, number> = { error: 0, warn: 0, info: 0 };
  const byRule: Record<string, Record<Level, number>> = {};
  for (const i of issues) {
    byLevel[i.level]++;
    byRule[i.rule] ??= { error: 0, warn: 0, info: 0 };
    byRule[i.rule][i.level]++;
  }
  return { entries: entries.length, units: new Set(entries.map((e) => e.unit)).size, byLevel, byRule };
}

export function renderMarkdown(title: string, scope: string, entries: readonly TextEntry[], issues: readonly Issue[], dateStr: string): string {
  const s = summarize(entries, issues);
  const titles = new Map(entries.map((e) => [e.unit, e.unitTitle]));
  const lines: string[] = [];
  lines.push(`# English lint: ${title}`, "", `- 日付: ${dateStr}`, `- はんい: ${scope}`, `- しらべた 文字列: ${s.entries}（${s.units} ユニット）`,
    `- 結果: **error ${s.byLevel.error} / warn ${s.byLevel.warn} / info ${s.byLevel.info}**`, "", "ルールの いみは docs/english-style-guide.md §11。", "",
    "| rule | error | warn | info |", "|---|---:|---:|---:|");
  for (const [r, c] of Object.entries(s.byRule).sort()) lines.push(`| ${r} | ${c.error} | ${c.warn} | ${c.info} |`);
  if (!issues.length) lines.push("", "問題は ありません。");

  const rank: Record<Level, number> = { error: 0, warn: 1, info: 2 };
  const byUnit = new Map<string, Issue[]>();
  for (const i of issues) {
    if (i.unit === "(range)") continue;
    const a = byUnit.get(i.unit) ?? [];
    a.push(i);
    byUnit.set(i.unit, a);
  }
  if (byUnit.size) lines.push("", "## ユニットごと");
  for (const [unit, list] of byUnit) {
    const t = titles.get(unit);
    lines.push("", `### ${unit}${t ? ` — ${t}` : ""}`);
    for (const i of [...list].sort((a, b) => rank[a.level] - rank[b.level])) {
      lines.push(`- **${i.level}** ${i.rule} \`${i.path}\` — ${i.message.replace(/\|/g, "\\|")}${i.rule === "contraction" || i.rule === "lets-overuse" ? "" : `  \n  > ${i.text.replace(/\n/g, " ")}`}`);
    }
  }
  const range = issues.filter((i) => i.unit === "(range)");
  if (range.length) {
    lines.push("", "## 書きかたの ゆれ（はんい ぜんたい）");
    for (const i of range) lines.push(`- ${i.message}`);
  }
  return `${lines.join("\n")}\n`;
}
