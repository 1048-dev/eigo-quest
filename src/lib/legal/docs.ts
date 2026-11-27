/**
 * 利用規約・プライバシーポリシー・特定商取引法に基づく表記（docs/legal/*.md）を 読む。
 * ページは force-static なので、ビルドの ときに 1 回だけ 読む。
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { LEGAL_DOCS, type LegalSlug } from "./links";
import { parseMarkdown, plainText, type Block } from "./markdown";

export { LEGAL_DOCS, LEGAL_SLUGS, type LegalSlug } from "./links";

export function readLegalSource(slug: LegalSlug): string {
  return readFileSync(path.join(process.cwd(), "docs", "legal", LEGAL_DOCS[slug].file), "utf8");
}

export function readLegalDoc(slug: LegalSlug): { title: string; blocks: Block[] } {
  const blocks = parseMarkdown(readLegalSource(slug));
  const h1 = blocks.find((b) => b.kind === "heading" && b.level === 1);
  return { title: h1 && h1.kind === "heading" ? plainText(h1.text) : LEGAL_DOCS[slug].labelJa, blocks };
}
