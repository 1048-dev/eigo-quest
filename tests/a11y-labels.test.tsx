/**
 * run10 Phase 1: axe（npm run check:a11y）で 見つかった 問題の 再発ふせぎ。
 *  - label-content-name-mismatch: 見えている 文字と ちがう aria-label を つけない（ガチャの 図鑑・としょかんの 読みあげ・だれが あそぶ？）
 *  - color-contrast: おしらせの 札（白い 文字）の 色は コントラスト 4.5 以上
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { MonsterCard } from "@/components/monsters/MonsterCard";
import { ReadAlongText, type ReadAloud } from "@/components/library/ReadAlong";
import { CATEGORY } from "@/components/common/AnnouncementsPanel";
import { MONSTERS } from "@/lib/game/monsters";

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const contrast = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

describe("aria-label と 見えている 文字", () => {
  it("図鑑の 小さい カード（まだ 出会っていない）は 読みあげ用に「まだ出会っていない」を もつ", () => {
    const html = renderToStaticMarkup(<MonsterCard id={MONSTERS[0].id} owned={false} size="sm" />);
    expect(html).toContain('<span class="sr-only">まだ出会っていない</span>');
    const owned = renderToStaticMarkup(<MonsterCard id={MONSTERS[0].id} owned size="sm" />);
    expect(owned).not.toContain("まだ出会っていない");
  });

  it("ガチャの 図鑑の ボタンに aria-label を つけない", () => {
    const src = readFileSync(path.resolve(__dirname, "../src/app/gacha/page.tsx"), "utf8");
    expect(src).not.toMatch(/まだ出会っていない`\}/);
    expect(src).not.toMatch(/aria-label=\{count > 0/);
  });

  it("としょかんの 読みあげの 行は aria-label なし・名前は 英文＋訳＋（タップで よむ）", () => {
    const reader = { lineIdx: -1, wordIdx: -1, playing: false, yourTurn: false, play: async () => {}, stop: () => {}, sayWord: () => {} } as unknown as ReadAloud;
    const html = renderToStaticMarkup(<ReadAlongText lines={[{ en: "Hello! I'm Haru.", ja: "こんにちは！ ぼくは ハル。" }] as never} reader={reader} showJa />);
    expect(html).not.toContain("aria-label");
    expect(html).toContain('role="button"');
    expect(html).toContain('<span class="sr-only">（タップで よむ）</span>');
    expect(html).toContain("こんにちは！ ぼくは ハル。");
  });

  it("だれが あそぶ？ の こどもの ボタンは aria-label なし（名前は「◯◯さん」から はじまる）", () => {
    const src = readFileSync(path.resolve(__dirname, "../src/app/who/page.tsx"), "utf8");
    const button = src.slice(src.indexOf("onClick={() => choose(c.id)}"), src.indexOf("</button>", src.indexOf("onClick={() => choose(c.id)}")));
    expect(button).not.toContain("aria-label");
    expect(button).toContain('<span className="sr-only">さん</span>');
    expect(button).toMatch(/aria-hidden>いま<\/span>/);
  });
});

describe("コントラスト", () => {
  it("おしらせの 札の 色は 白い 文字に たいして 4.5 以上", () => {
    for (const [k, c] of Object.entries(CATEGORY)) expect(contrast(c.color, "#ffffff"), k).toBeGreaterThanOrEqual(4.5);
  });
});
