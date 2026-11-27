import { describe, expect, it } from "vitest";
import { isAccountPath } from "@/components/account/AccountBar";
import { LEGAL_SLUGS, readLegalDoc, readLegalSource } from "@/lib/legal/docs";
import { parseInline, parseMarkdown } from "@/lib/legal/markdown";

describe("legal markdown parser", () => {
  it("parses headings, quotes, tables, lists with sub-items, paragraphs", () => {
    const md = [
      "# Title", "", "> note 1", "> note 2", "", "## 第1条", "",
      "| a | b |", "| --- | --- |", "| 1 | **2** |", "",
      "1. one", "   - sub", "2. two", "", "- x", "- y", "", "line a", "line b",
    ].join("\n");
    const b = parseMarkdown(md);
    expect(b.map((x) => x.kind)).toEqual(["heading", "quote", "heading", "table", "list", "list", "paragraph"]);
    const ol = b[4];
    expect(ol.kind === "list" && ol.ordered && ol.items.length === 2 && ol.items[0].children.length === 1).toBe(true);
    const tb = b[3];
    expect(tb.kind === "table" && tb.rows[0][1][0].bold).toBe(true);
    const p = b[6];
    expect(p.kind === "paragraph" && p.text[0].text).toBe("line a line b");
  });

  it("marks 【要確認】 spans", () => {
    const xs = parseInline("住所: 【要確認：住所】です");
    expect(xs.map((x) => !!x.check)).toEqual([false, true, false]);
  });
});

describe("legal documents", () => {
  for (const slug of LEGAL_SLUGS) {
    it(`${slug}: renders, has a title and 【要確認】 placeholders`, () => {
      const src = readLegalSource(slug);
      expect(src).toContain("【要確認");
      const { title, blocks } = readLegalDoc(slug);
      expect(title.length).toBeGreaterThan(2);
      expect(blocks.length).toBeGreaterThanOrEqual(4);
    });
    it(`${slug}: no company names or invented contact details`, () => {
      const src = readLegalSource(slug);
      expect(src).not.toMatch(/anthropic|claude|openai|google|vercel|resend|amazon|aws|stripe/i);
      expect(src).not.toMatch(/\d{2,4}-\d{2,4}-\d{3,4}/); // 電話番号
      expect(src).not.toMatch(/[\w.]+@[\w-]+\.\w+/); // メールアドレス
      expect(src).not.toMatch(/〒\d/);
    });
  }

  it("legal pages hide the game bars", () => {
    for (const p of ["/terms", "/privacy", "/tokushoho"]) expect(isAccountPath(p)).toBe(true);
  });
});
