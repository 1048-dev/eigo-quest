/**
 * 学習レポートの PDF に埋め込む日本語フォント（TrueType）を、pdf-lib のサブセット機能で こわれない形に整える（run5 Phase 3）。
 *
 *   npx tsx scripts/prepare-report-font.ts <元の .ttf> [出力先（既定 assets/fonts/NotoSansJP-Regular.ttf）]
 *
 * なぜ必要か:
 *   @pdf-lib/fontkit のサブセットは、グリフの位置表（loca）を「短い形式（offset / 2）」で書くことがある。
 *   元のフォントに 長さが奇数バイトのグリフがあると 1バイト切れて、それ以降のグリフが すべてずれる（文字化け・表示されない）。
 *   Google Fonts の Noto Sans JP には 奇数バイトのグリフがあるため、あらかじめ すべてのグリフを 4バイト単位に
 *   ゼロで うめておく（TrueType ではふつうの形。見た目は変わらない）。あわせて loca を長い形式にし、チェックサムを計算しなおす。
 * フォントのライセンス: SIL Open Font License 1.1（assets/fonts/OFL.txt）。改変版の再配布は OFL で認められている
 * （フォント名の予約名 "Source" は使っていない）。
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

interface Table { tag: string; data: Buffer }

function checksum(b: Buffer): number {
  const padded = b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - (b.length % 4))]) : b;
  let sum = 0;
  for (let i = 0; i < padded.length; i += 4) sum = (sum + padded.readUInt32BE(i)) >>> 0;
  return sum;
}

export function padGlyphs(font: Buffer): { out: Buffer; glyphs: number; padded: number } {
  const version = font.readUInt32BE(0);
  if (version !== 0x00010000 && version !== 0x74727565) throw new Error("TrueType（glyf）のフォントではありません");
  const numTables = font.readUInt16BE(4);
  const tables: Table[] = [];
  const byTag: Record<string, Buffer> = {};
  for (let i = 0; i < numTables; i++) {
    const p = 12 + i * 16;
    const tag = font.toString("latin1", p, p + 4);
    const off = font.readUInt32BE(p + 8);
    const len = font.readUInt32BE(p + 12);
    const data = Buffer.from(font.subarray(off, off + len));
    tables.push({ tag, data });
    byTag[tag] = data;
  }
  const head = byTag.head, maxp = byTag.maxp, loca = byTag.loca, glyf = byTag.glyf;
  if (!head || !maxp || !loca || !glyf) throw new Error("head / maxp / loca / glyf が見つかりません");
  const longLoca = head.readInt16BE(50) === 1;
  const numGlyphs = maxp.readUInt16BE(4);
  const at = (i: number) => (longLoca ? loca.readUInt32BE(i * 4) : loca.readUInt16BE(i * 2) * 2);

  const parts: Buffer[] = [];
  const newLoca = Buffer.alloc((numGlyphs + 1) * 4);
  let offset = 0;
  let padded = 0;
  for (let g = 0; g < numGlyphs; g++) {
    newLoca.writeUInt32BE(offset, g * 4);
    const data = glyf.subarray(at(g), at(g + 1));
    const pad = (4 - (data.length % 4)) % 4;
    if (pad) padded++;
    parts.push(data, Buffer.alloc(pad));
    offset += data.length + pad;
  }
  newLoca.writeUInt32BE(offset, numGlyphs * 4);
  const newGlyf = Buffer.concat(parts);
  const newHead = Buffer.from(head);
  newHead.writeInt16BE(1, 50); // indexToLocFormat = 長い形式
  newHead.writeUInt32BE(0, 8); // checkSumAdjustment（あとで入れる）

  for (const t of tables) {
    if (t.tag === "glyf") t.data = newGlyf;
    else if (t.tag === "loca") t.data = newLoca;
    else if (t.tag === "head") t.data = newHead;
  }
  tables.sort((a, b) => (a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : 0));

  const headerLen = 12 + 16 * tables.length;
  const header = Buffer.alloc(headerLen);
  header.writeUInt32BE(version, 0);
  header.writeUInt16BE(tables.length, 4);
  let pow = 1, log = 0;
  while (pow * 2 <= tables.length) { pow *= 2; log++; }
  header.writeUInt16BE(pow * 16, 6);
  header.writeUInt16BE(log, 8);
  header.writeUInt16BE(tables.length * 16 - pow * 16, 10);
  const body: Buffer[] = [];
  let pos = headerLen;
  let headPos = -1;
  tables.forEach((t, i) => {
    const p = 12 + i * 16;
    header.write(t.tag, p, 4, "latin1");
    header.writeUInt32BE(checksum(t.data), p + 4);
    header.writeUInt32BE(pos, p + 8);
    header.writeUInt32BE(t.data.length, p + 12);
    if (t.tag === "head") headPos = pos;
    const pad = (4 - (t.data.length % 4)) % 4;
    body.push(t.data, Buffer.alloc(pad));
    pos += t.data.length + pad;
  });
  const out = Buffer.concat([header, ...body]);
  out.writeUInt32BE((0xb1b0afba - checksum(out)) >>> 0, headPos + 8);
  return { out, glyphs: numGlyphs, padded };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]).endsWith(`prepare-report-font.ts`);
if (isMain) {
  const [input, output = path.join(process.cwd(), "assets", "fonts", "NotoSansJP-Regular.ttf")] = process.argv.slice(2);
  if (!input) {
    console.error("使い方: npx tsx scripts/prepare-report-font.ts <元の .ttf> [出力先]");
    process.exit(2);
  }
  console.log(`▶ 読みこみ: ${input}`);
  const src = readFileSync(input);
  const { out, glyphs, padded } = padGlyphs(src);
  writeFileSync(output, out);
  console.log(`✔ ${glyphs} グリフのうち ${padded} グリフを 4バイト単位に うめました → ${output}（${src.length} → ${out.length} バイト）`);
}
