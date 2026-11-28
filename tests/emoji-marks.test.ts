/**
 * run11 決定 2: ❌ などの バツ印は アプリの「まちがい」表示（⭕ / ❌）専用。
 * 教材（TPR の "Make an X"・単語 mistake / wrong・スライド）の 絵には つかわない。
 * TPR の バツ（うでを クロス）は 🙅、mistake は 🤦（もとから 😅 の 1 こは そのまま）。
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const WORLDS_DIR = path.join(__dirname, "..", "content", "curriculum", "worlds");
const CROSS_MARKS = ["❌", "❎", "✖", "✗", "✘", "✕", "╳"];

function emojiFields(o: unknown, at: string, out: { at: string; emoji: string; en?: string }[]) {
  if (Array.isArray(o)) o.forEach((v, i) => emojiFields(v, `${at}[${i}]`, out));
  else if (o && typeof o === "object") {
    const rec = o as Record<string, unknown>;
    for (const [k, v] of Object.entries(rec)) {
      if (k === "emoji" && typeof v === "string") out.push({ at: `${at}.${k}`, emoji: v, en: typeof rec.en === "string" ? rec.en : undefined });
      else emojiFields(v, `${at}.${k}`, out);
    }
  }
  return out;
}

const all = readdirSync(WORLDS_DIR)
  .filter((f) => f.endsWith(".json"))
  .flatMap((f) => emojiFields(JSON.parse(readFileSync(path.join(WORLDS_DIR, f), "utf8")), f, []));

describe("教材の 絵に バツ印を つかわない", () => {
  it("emoji 欄が ある（テストが 空振りして いない）", () => {
    expect(all.length).toBeGreaterThan(1000);
  });

  it("どの emoji 欄にも ❌ などの バツ印が ない", () => {
    const bad = all.filter((e) => CROSS_MARKS.some((m) => e.emoji.includes(m))).map((e) => `${e.at} ${e.en ?? ""} ${e.emoji}`);
    expect(bad).toEqual([]);
  });

  it("TPR の「X を つくる・うでを クロス」は 🙅", () => {
    const xs = all.filter((e) => e.en && /\b(make an x|cross your arms)\b/i.test(e.en));
    expect(xs.length).toBeGreaterThan(5);
    expect(xs.filter((e) => e.emoji !== "🙅").map((e) => `${e.at} ${e.en} ${e.emoji}`)).toEqual([]);
  });

  it("単語 mistake は 🤦（もとから 😅 の 1 こも よい）", () => {
    const ms = all.filter((e) => e.en?.toLowerCase() === "mistake");
    expect(ms.length).toBeGreaterThan(3);
    expect(ms.filter((e) => !["🤦", "😅"].includes(e.emoji)).map((e) => `${e.at} ${e.emoji}`)).toEqual([]);
  });
});
