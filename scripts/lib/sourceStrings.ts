/**
 * アプリの コード（UI の 文字・テンプレート）から 英語の 文字列を ぬきだす（run10 Phase 5）。
 * english:lint は ここには フレーズブックの ルールだけ あてる（コードの 名前で つづりの まちがいが たくさん 出るため）。
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

export interface SourceString {
  file: string;
  line: number;
  text: string;
}

/** コメントを おなじ 長さの 空白に する（行番号が かわらない ように） */
export function stripComments(src: string, python = false): string {
  const blank = (m: string) => m.replace(/[^\n]/g, " ");
  if (python) return src.replace(/(^|[^"'\\])#[^\n]*/g, (m, p: string) => p + blank(m.slice(p.length)));
  // 文字列の 中の // （URL）は のこす: 文字列か コメントを 1つずつ 読む
  return src.replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`|\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, (m) => (m.startsWith("/") ? blank(m) : m));
}

const LATIN_WORDS = /[A-Za-z]+[^A-Za-z]+[A-Za-z]+/;

/** 文字列リテラルを ぬきだす（2語 以上の 英語が ある もの）。テンプレートの ${…} は「～」に する */
export function extractStrings(src: string, python = false): { line: number; text: string }[] {
  const code = stripComments(src, python);
  const out: { line: number; text: string }[] = [];
  const re = python ? /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g : /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
  for (const m of code.matchAll(re)) {
    const q = m[0].startsWith('"""') || m[0].startsWith("'''") ? 3 : 1;
    const body = m[0].slice(q, -q).replace(/\$\{[^}]*\}/g, "～");
    if (!LATIN_WORDS.test(body)) continue;
    out.push({ line: code.slice(0, m.index).split("\n").length, text: body });
  }
  return out;
}

const SKIP_DIR = /(^|[\\/])(node_modules|\.next|\.next-e2e|out|__pycache__)([\\/]|$)/;

export function collectSourceStrings(root: string, dirs: readonly string[] = ["src", "worksheets"]): SourceString[] {
  const out: SourceString[] = [];
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = path.join(d, name);
      if (SKIP_DIR.test(path.relative(root, p))) continue;
      if (statSync(p).isDirectory()) { walk(p); continue; }
      const py = p.endsWith(".py");
      if (!/\.(ts|tsx)$/.test(p) && !py) continue;
      const rel = path.relative(root, p).replace(/\\/g, "/");
      for (const s of extractStrings(readFileSync(p, "utf8"), py)) out.push({ file: rel, ...s });
    }
  };
  for (const d of dirs) {
    const abs = path.join(root, d);
    try { statSync(abs); } catch { continue; }
    walk(abs);
  }
  return out;
}
