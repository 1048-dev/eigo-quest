/**
 * run10 Phase 4: check:e2e の 部品（ブラウザを つかわない もの。tests/e2e-check.test.ts で ためす）。
 *  - lessonForWorld(): ワールドごとに あそぶ レッスン（ワールドの なかの 位置を 1〜30 で ずらす）
 *  - scanForHook(): ビルドの JS に テストの しかけ（data-e2e）が あるか
 *  - renderE2eReport(): docs/run10/report/e2e.md
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

/** ワールド w で あそぶ レッスン: ワールドの (w-1) % 30 + 1 ばんめ（W1 → L1、W2 → L32、W30 → L900、W31 → L901、W40 → L1180） */
export function lessonForWorld(w: number, lessonsPerWorld = 30): number {
  return (w - 1) * lessonsPerWorld + ((w - 1) % lessonsPerWorld) + 1;
}

/** "1-5,8,40" → [1,2,3,4,5,8,40]（1〜max の 中だけ・かさならない） */
export function parseRange(spec: string, max: number): number[] {
  const out = new Set<number>();
  for (const part of spec.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = /^(\d+)(?:-(\d+))?$/.exec(part);
    if (!m) throw new Error(`範囲の かきかたが ちがう: ${part}`);
    const a = Number(m[1]);
    const b = Number(m[2] ?? m[1]);
    for (let i = Math.min(a, b); i <= Math.max(a, b); i++) if (i >= 1 && i <= max) out.add(i);
  }
  return [...out].sort((x, y) => x - y);
}

export const HOOK_MARKER = "data-e2e";

/** dir の 下の .js に HOOK_MARKER が ある ファイル */
export function scanForHook(dir: string, marker = HOOK_MARKER): { files: number; hits: string[] } {
  const hits: string[] = [];
  let files = 0;
  if (!existsSync(dir)) return { files, hits };
  const walk = (d: string) => {
    for (const name of readdirSync(d)) {
      const p = path.join(d, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (name.endsWith(".js")) {
        files++;
        if (readFileSync(p, "utf8").includes(marker)) hits.push(path.relative(dir, p));
      }
    }
  };
  walk(dir);
  return { files, hits };
}

/** 画面に 出ていたら おかしい 文言（scripts/smoke.ts と おなじ） */
export const ERROR_TEXT = [
  /Application error/i, /Unhandled Runtime Error/i, /Internal Server Error/i, /This page could not be found/i, /\b404\b/, /\b500\b/,
  /client-side exception/i, /Something went wrong/i, /JSON\.parse/i, /Unexpected token/i, /undefined is not/i, /Cannot read properties/i,
  /通信がうまくいかなかった/, /サーバーで問題が起きた/, /エラー/, /見つからないよ/, /まだ ひらいていない/, /うまく採点できなかった/,
];
export const LOADING_TEXT = /よみこみちゅう|じゅんびちゅう|きろくしています|読み込み中/;

export interface E2eFailure { label: string; detail: string; shot: string | null }
export interface E2eSection { name: string; ok: number; ng: number; ms: number; failures: E2eFailure[]; notes: string[] }
export interface WorldRow { world: number; lessonNo: number; viewport: string; ok: boolean; steps: string; coins: string; ms: number; note: string }

const TITLES: Record<string, string> = {
  build: "じゅんび（ビルド・しかけ・時計）",
  worlds: "40 ワールド（1 レッスンずつ クリック）",
  progress: "タイムトラベル・まとめテスト・ボス・アリーナ",
  extras: "まとめ動画・としょかん・力だめし",
  parent: "保護者の 流れ",
  offline: "オフライン（DB 停止・電波なし・スマホ / タブレット）",
};
const sec = (ms: number) => `${Math.round(ms / 1000)}s`;
const cell = (s: string) => s.replace(/\|/g, "／").replace(/\n/g, " ");

export function renderE2eReport(o: { started: Date; totalMs: number; sections: E2eSection[]; worlds: WorldRow[]; only: string[]; command: string }): string {
  const ok = o.sections.reduce((a, s) => a + s.ok, 0);
  const ng = o.sections.reduce((a, s) => a + s.ng, 0);
  const lines = [
    "# check:e2e レポート（クリックの ロボット・本物の DB）",
    "",
    `- 日時: ${o.started.toISOString()}`,
    `- コマンド: \`${o.command}\``,
    `- けっか: **${ng === 0 ? "PASS" : "FAIL"}**（確認 ${ok} OK / ${ng} NG）・ぜんぶで ${sec(o.totalMs)}`,
    `- しらべた もの: ${o.only.join(", ")}`,
    "",
    "| しらべた もの | OK | NG | 時間 |",
    "|---|---|---|---|",
    ...o.sections.map((s) => `| ${TITLES[s.name] ?? s.name} | ${s.ok} | ${s.ng} | ${sec(s.ms)} |`),
    "",
  ];
  if (o.worlds.length) {
    lines.push("## 40 ワールド", "", "| ワールド | レッスン | 画面 | けっか | ステップ | コイン | 時間 |", "|---|---|---|---|---|---|---|");
    for (const w of o.worlds) lines.push(`| ${w.world} | L${w.lessonNo} | ${w.viewport} | ${w.ok ? "✅" : "❌"} | ${cell(w.steps)} | ${cell(w.coins)} | ${sec(w.ms)} |`);
    lines.push("");
  }
  const fails = o.sections.flatMap((s) => s.failures.map((f) => ({ ...f, s: s.name })));
  lines.push("## 失敗", "");
  if (fails.length === 0) lines.push("なし（スクリーンショットは 失敗した ときだけ docs/run10/report/e2e-failures/ に 保存する）", "");
  else for (const f of fails) lines.push(`- [${f.s}] ${cell(f.label)}${f.detail ? ` — ${cell(f.detail).slice(0, 300)}` : ""}${f.shot ? ` → [スクリーンショット](e2e-failures/${f.shot})` : ""}`);
  const notes = o.sections.flatMap((s) => s.notes.map((n) => `- [${s.name}] ${n}`));
  if (notes.length) lines.push("", "## メモ", "", ...notes);
  return lines.join("\n") + "\n";
}
