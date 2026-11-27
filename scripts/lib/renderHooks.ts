/**
 * run10 Phase 3: 描画の 確認（npm run check:render）の しかけ。
 *
 *  - React の 警告（console.error / console.warn。key が ない など）を 1 回の 描画ごとに あつめる
 *  - おなじ key が 2 つ ある リスト（サーバーの 描画では React が 気づかない。ブラウザで 画面が くずれる もと）を
 *    JSX の 関数（jsx / jsxs / jsxDEV）を つつんで 見つける
 *
 * tsx（CommonJS）では installJsxKeyCheck() が require した jsx-runtime を その場で つつむ。
 * vitest では vi.mock("react/jsx-dev-runtime", …) の 中で wrapJsxRuntime() を つかう（tests/render-check.test.tsx）。
 * どちらも 確認の スクリプトと テストの 中だけ。アプリの コードは かわらない。
 */
import { isValidElement } from "react";

type JsxFn = (type: unknown, props: { children?: unknown } | null, key?: unknown, ...rest: unknown[]) => unknown;

const issues: string[] = [];

const typeName = (t: unknown): string =>
  typeof t === "string" ? t : typeof t === "function" ? ((t as { displayName?: string; name?: string }).displayName || (t as { name?: string }).name || "anonymous") : typeof t === "symbol" ? String(t.description ?? "fragment") : "?";

function checkList(parent: unknown, list: readonly unknown[]) {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const c of list) {
    if (Array.isArray(c)) { checkList(parent, c); continue; }
    if (!isValidElement(c) || c.key == null) continue; // key が ない ものは React が 警告する
    const k = String(c.key);
    if (seen.has(k)) dup.add(k);
    seen.add(k);
  }
  for (const k of dup) issues.push(`おなじ key「${k}」が 2つ 以上（<${typeName(parent)}> の 中の リスト）`);
}

function checkChildren(type: unknown, props: { children?: unknown } | null, isStatic: boolean) {
  const ch = props?.children;
  if (!Array.isArray(ch)) return;
  if (isStatic) { for (const c of ch) if (Array.isArray(c)) checkList(type, c); }
  else checkList(type, ch);
}

/** jsx-runtime / jsx-dev-runtime の 関数を つつんだ ものを かえす（もとの モジュールは かえない） */
export function wrapJsxRuntime<T extends Record<string, unknown>>(mod: T): T {
  const out: Record<string, unknown> = { ...mod };
  const jsx = mod.jsx as JsxFn | undefined;
  const jsxs = mod.jsxs as JsxFn | undefined;
  const jsxDEV = mod.jsxDEV as JsxFn | undefined;
  if (jsx) out.jsx = (type: unknown, props: { children?: unknown } | null, ...rest: unknown[]) => { checkChildren(type, props, false); return jsx(type, props, ...rest); };
  if (jsxs) out.jsxs = (type: unknown, props: { children?: unknown } | null, ...rest: unknown[]) => { checkChildren(type, props, true); return jsxs(type, props, ...rest); };
  if (jsxDEV) out.jsxDEV = (type: unknown, props: { children?: unknown } | null, key: unknown, isStatic: unknown, ...rest: unknown[]) => { checkChildren(type, props, !!isStatic); return jsxDEV(type, props, key, isStatic, ...rest); };
  return out as T;
}

let installed = false;
/** CommonJS（tsx）用: require の キャッシュに ある jsx-runtime を その場で つつむ。コンポーネントを import する まえに よぶ */
export function installJsxKeyCheck() {
  if (installed) return;
  installed = true;
  for (const id of ["react/jsx-runtime", "react/jsx-dev-runtime"]) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(id) as Record<string, unknown>;
    const wrapped = wrapJsxRuntime(mod);
    for (const k of ["jsx", "jsxs", "jsxDEV"]) if (k in wrapped && typeof mod[k] === "function") mod[k] = wrapped[k];
  }
}

/** React の 警告を あつめる（console.error / console.warn を 1 回の 描画の あいだだけ おきかえる） */
export function collectWarnings<T>(fn: () => T): { value?: T; error?: unknown; warnings: string[] } {
  const warnings: string[] = [];
  const err = console.error;
  const warn = console.warn;
  const fmt = (a: unknown[]) => {
    // React は "%s" つきで よぶ: さいしょの 文字列に のこりを うめこむ
    const [first, ...rest] = a.map((x) => (x instanceof Error ? x.message : String(x)));
    let i = 0;
    return String(first ?? "").replace(/%[sdo]/g, () => rest[i++] ?? "").concat(rest.slice(i).length ? ` ${rest.slice(i).join(" ")}` : "").replace(/\s+/g, " ").trim();
  };
  console.error = (...a: unknown[]) => { warnings.push(fmt(a)); };
  console.warn = (...a: unknown[]) => { warnings.push(fmt(a)); };
  issues.length = 0;
  try {
    const value = fn();
    return { value, warnings: [...warnings, ...issues] };
  } catch (error) {
    return { error, warnings: [...warnings, ...issues] };
  } finally {
    console.error = err;
    console.warn = warn;
    issues.length = 0;
  }
}
