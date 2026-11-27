/**
 * docs/legal/*.md を 画面に出すための 小さな Markdown パーサー（依存なし・純粋関数）。
 * つかう 書き方だけ: 見出し（# ## ###）・引用（>）・表（| a | b |）・番号つきリスト（1.）・
 * ふつうのリスト（-）・番号つきリストの 下の 字下げした リスト・段落・**太字**。
 */
export type Inline = { text: string; bold?: boolean; check?: boolean };

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: Inline[] }
  | { kind: "quote"; lines: Inline[][] }
  | { kind: "paragraph"; text: Inline[] }
  | { kind: "list"; ordered: boolean; items: { text: Inline[]; children: Inline[][] }[] }
  | { kind: "table"; header: Inline[][]; rows: Inline[][][] };

/** 専門家・運営者の 確認が いる しるし */
export const CHECK_MARK = "【要確認";

/** **太字** と 【要確認…】 を わける */
export function parseInline(s: string): Inline[] {
  const out: Inline[] = [];
  const parts = s.split(/(\*\*[^*]+\*\*)/g);
  for (const p of parts) {
    if (!p) continue;
    const bold = p.startsWith("**") && p.endsWith("**") && p.length > 4;
    const body = bold ? p.slice(2, -2) : p;
    for (const q of body.split(/(【要確認[^】]*】)/g)) {
      if (!q) continue;
      out.push({ text: q, ...(bold ? { bold: true } : {}), ...(q.startsWith(CHECK_MARK) ? { check: true } : {}) });
    }
  }
  return out;
}

const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => parseInline(c.trim()));
const isTableSep = (line: string) => /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(line.trim());

export function parseMarkdown(src: string): Block[] {
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "paragraph", text: parseInline(para.join(" ")) });
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { flush(); continue; }

    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) { flush(); blocks.push({ kind: "heading", level: h[1].length as 1 | 2 | 3, text: parseInline(h[2]) }); continue; }

    if (line.startsWith(">")) {
      flush();
      const q: Inline[][] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) q.push(parseInline(lines[i++].trim().replace(/^>\s?/, "")));
      i--;
      blocks.push({ kind: "quote", lines: q });
      continue;
    }

    if (line.startsWith("|") && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      flush();
      const header = cells(line);
      const rows: Inline[][][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) rows.push(cells(lines[i++]));
      i--;
      blocks.push({ kind: "table", header, rows });
      continue;
    }

    const item = /^(\d+\.|-)\s+(.*)$/.exec(line);
    if (item && raw === raw.trimStart()) {
      flush();
      const ordered = item[1] !== "-";
      const items: { text: Inline[]; children: Inline[][] }[] = [];
      while (i < lines.length) {
        const r = lines[i];
        const top = /^(\d+\.|-)\s+(.*)$/.exec(r);
        const sub = /^\s+[-*]\s+(.*)$/.exec(r);
        if (top && r === r.trimStart() && (top[1] !== "-") === ordered) items.push({ text: parseInline(top[2]), children: [] });
        else if (sub && items.length) items[items.length - 1].children.push(parseInline(sub[1]));
        else break;
        i++;
      }
      i--;
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    para.push(line);
  }
  flush();
  return blocks;
}

/** 文字だけに した ときの 見出し（ページの タイトル用） */
export const plainText = (xs: Inline[]) => xs.map((x) => x.text).join("");
