/**
 * 月間の学習レポート（A4 1ページ）の PDF を Node だけで作る（run5 Phase 3: Python を使わない）。
 *  - ふだん: pdf-lib + 日本語フォント Noto Sans JP（SIL Open Font License。assets/fonts）を
 *            使う文字だけ埋め込む（サブセット）。どのビューアでも同じ見た目になる。
 *  - フォントが読めないとき: 依存なしの かんたんな PDF（日本語は ビューアの CID フォント・埋め込みなし）
 * ワークブック（1か月分のワークシート）は Python で あらかじめ作って置き場所へアップロードしておく（src/lib/report/storage.ts）。
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { MonthlyReport } from "./monthlyReport";

export type ReportEngine = "pdf-lib" | "basic";
export type ReportRenderer = (report: MonthlyReport) => Promise<{ bytes: Uint8Array; engine: ReportEngine }>;

/**
 * フォントのパス。ビルドの依存追跡（nft）が すべての API に 5MB のフォントを入れないよう、組み立てて作る。
 * 必要な API（/api/parent/line-monthly・/api/cron/line-monthly）には next.config.ts の outputFileTracingIncludes で入れている。
 */
const FONT_PATH_PARTS = ["assets", "fonts", "NotoSansJP-Regular.ttf"];
export const REPORT_FONT_FILE = path.join(process.cwd(), ...FONT_PATH_PARTS);

const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 42;

type RGB = [number, number, number];
const BLUE: RGB = [0.165, 0.47, 0.84];
const COIN: RGB = [0.93, 0.63, 0];
const RED: RGB = [0.89, 0.29, 0.28];
const GREY: RGB = [0.35, 0.39, 0.47];
const INK: RGB = [0.1, 0.12, 0.16];
const CARD: RGB = [0.93, 0.96, 0.99];
const TRACK: RGB = [0.89, 0.91, 0.94];

/** PDF に書けない制御文字を空白に */
function clean(s: unknown): string {
  return String(s ?? "").replace(/[\u0000-\u001f\u007f]/g, " ");
}

// ---------------------------------------------------------------------------
// 描画の手順（どちらのエンジンでも同じレイアウト）
// ---------------------------------------------------------------------------
interface Canvas {
  text(x: number, y: number, s: string, size: number, rgb?: RGB): void;
  rect(x: number, y: number, w: number, h: number, rgb: RGB): void;
  width(s: string, size: number): number;
}

export function wrapLines(s: string, size: number, width: number, measure: (t: string, size: number) => number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const ch of clean(s)) {
    if (cur && measure(cur + ch, size) > width) {
      lines.push(cur);
      cur = ch === " " ? "" : ch;
    } else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

function layoutReport(c: Canvas, r: MonthlyReport): void {
  let y = A4_H - MARGIN;
  const para = (s: string, size = 10, indent = 0, rgb: RGB = INK) => {
    for (const line of wrapLines(s, size, A4_W - 2 * MARGIN - indent, (t, z) => c.width(t, z))) {
      if (y < MARGIN + 24) return; // 1ページに おさめる（あふれた分は省く）
      c.text(MARGIN + indent, y, line, size, rgb);
      y -= size * 1.6;
    }
  };
  const heading = (s: string) => {
    y -= 8;
    if (y < MARGIN + 40) return;
    c.rect(MARGIN, y - 3, 4, 15, COIN);
    c.text(MARGIN + 11, y, s, 12.5, INK);
    y -= 21;
  };

  // 見出しの帯
  c.rect(MARGIN, y - 46, A4_W - 2 * MARGIN, 50, BLUE);
  c.text(MARGIN + 14, y - 19, clean(`${r.monthLabelJa}の 学習レポート`), 18, [1, 1, 1]);
  c.text(MARGIN + 14, y - 37, clean(`${r.childName} さん ／ 作成日 ${r.generatedOn} ／ おうちの方へ`), 9, [1, 1, 1]);
  y -= 72;

  // 数字のカード
  const stats: [string, string][] = [
    ["今月のレッスン", `${r.lessonsThisMonth} 回`],
    ["学習した日", `${r.studyDaysThisMonth} 日`],
    ["連続日数", `${r.streakDays} 日`],
    ["最長連続", `${r.longestStreak} 日`],
  ];
  const gap = 10;
  const w = (A4_W - 2 * MARGIN - gap * 3) / 4;
  stats.forEach(([label, value], i) => {
    const x = MARGIN + i * (w + gap);
    c.rect(x, y - 44, w, 54, CARD);
    c.text(x + 10, y - 8, label, 9, GREY);
    c.text(x + 10, y - 33, value, 17, BLUE);
  });
  y -= 70;
  para(`これまでに ${r.lessonsDone} / ${r.totalLessons} レッスン ・ 合格したテスト（今月） ${r.testsPassedThisMonth} ・ いまのワールド ${r.world}「${r.worldNameJa}」`, 9.5);

  heading(`6つの力の 習得率（送信時点・総合 ${Math.round(r.overall)}%）`);
  const barX = MARGIN + 120;
  const barW = A4_W - MARGIN - barX - 40;
  for (const m of r.mastery.slice(0, 6)) {
    const score = Math.max(0, Math.min(100, Number(m.score) || 0));
    c.text(MARGIN + 10, y, clean(m.labelJa), 9.5, INK);
    c.rect(barX, y - 2, barW, 10, TRACK);
    if (score > 0) c.rect(barX, y - 2, Math.max(4, (barW * score) / 100), 10, score >= 60 ? BLUE : score >= 30 ? COIN : RED);
    c.text(barX + barW + 8, y, String(Math.round(score)), 9.5, INK);
    y -= 19;
  }

  heading("にがて（伸びしろ）");
  if (r.weakSkills.length === 0 && r.weakItems.length === 0) para("まだ学習の記録が少ないため、にがての判定はこれからです。", 9.5, 10, GREY);
  if (r.weakSkills.length) para(`力: ${r.weakSkills.map((x) => `${x.labelJa}（${Math.round(x.score)}）`).join("、")}`, 9.5, 10);
  if (r.weakItems.length) para(`忘れかけの ことば: ${r.weakItems.map((x) => `${x.text}（${x.ja}）`).join("　")}`, 9.5, 10);

  heading(r.nextLessonNo ? `来月の 予定（Lesson ${r.nextLessonNo} から）` : "来月の 予定（すべてのレッスンを終えました）");
  for (const t of r.nextTopics.slice(0, 6)) para(`・Lesson ${t.lessonNo}〜　${t.topicJa}（${t.titleJa}）`, 9.5, 10);
  if (r.nextPhonics.length) para(`フォニックス: ${r.nextPhonics.slice(0, 6).join("　")}`, 9.5, 10);

  heading("おうちの方へ");
  para(r.commentJa, 10, 10);
  para("同封の「1か月ワークブック」は、いまのワールドのレッスンと連動しています。1日1枚を目安に、アプリのあとで取り組んでください。", 8.5, 10, GREY);
  const footer = "Eigo Quest 学習レポート";
  c.text(A4_W / 2 - c.width(footer, 8) / 2, 24, footer, 8, GREY);
}

// ---------------------------------------------------------------------------
// pdf-lib + Noto Sans JP
// ---------------------------------------------------------------------------
let fontCache: Promise<Uint8Array> | null = null;

function loadFont(file = REPORT_FONT_FILE): Promise<Uint8Array> {
  if (file !== REPORT_FONT_FILE) return readFile(file).then((b) => new Uint8Array(b));
  fontCache ??= readFile(file).then((b) => new Uint8Array(b));
  fontCache.catch(() => { fontCache = null; });
  return fontCache;
}

export async function renderReportWithPdfLib(r: MonthlyReport, opts: { fontFile?: string; now?: Date } = {}): Promise<Uint8Array> {
  const [{ PDFDocument, rgb }, fontkitMod, fontBytes] = await Promise.all([
    import("pdf-lib"),
    import("@pdf-lib/fontkit"),
    loadFont(opts.fontFile),
  ]);
  const fontkit = (fontkitMod as unknown as { default?: unknown }).default ?? fontkitMod;
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit as never);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const page = doc.addPage([A4_W, A4_H]);
  const color = (c: RGB) => rgb(c[0], c[1], c[2]);
  layoutReport({
    text: (x, y, s, size, c = INK) => { if (s) page.drawText(s, { x, y, size, font, color: color(c) }); },
    rect: (x, y, w, h, c) => page.drawRectangle({ x, y, width: w, height: h, color: color(c) }),
    width: (s, size) => font.widthOfTextAtSize(s, size),
  }, r);
  const when = opts.now ?? new Date();
  doc.setTitle(clean(`Eigo Quest ${r.monthLabelJa}の学習レポート（${r.childName}）`));
  doc.setProducer("Eigo Quest");
  doc.setCreator("Eigo Quest");
  doc.setCreationDate(when);
  doc.setModificationDate(when);
  return doc.save();
}

/** ふだんの作り方: pdf-lib。フォントが読めない・作れないときは かんたんな PDF */
export const renderReportPdf: ReportRenderer = async (report) => {
  try {
    return { bytes: await renderReportWithPdfLib(report), engine: "pdf-lib" };
  } catch (e) {
    console.warn(`[report] 日本語フォントを埋め込んだ PDF を作れなかったため、かんたんな PDF で作ります（${(e as Error)?.name ?? "Error"}）`);
    return { bytes: basicReportPdf(report), engine: "basic" };
  }
};

/** かんたんな PDF だけで作る（テスト用・フォントが無い環境用） */
export const renderBasicReportPdf: ReportRenderer = async (report) => ({ bytes: basicReportPdf(report), engine: "basic" });

// ---------------------------------------------------------------------------
// 依存なしの かんたんな PDF（A4・1ページ）
//  日本語は Adobe-Japan1 の CID フォント（HeiseiKakuGo-W5 / UniJIS-UCS2-H）を参照（埋め込みなし）。
// ---------------------------------------------------------------------------
/** UTF-16BE の16進（BMP の外の文字は「?」） */
function hex(s: string): string {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0)!;
    out += (cp > 0xffff || (cp < 0x20 && cp !== 0x09) ? 0x3f : cp).toString(16).padStart(4, "0");
  }
  return out;
}

/** ざっくりした文字幅（全角 = 1em、ASCII = 0.5em） */
function approxWidth(s: string, size: number): number {
  let w = 0;
  for (const ch of s) w += (ch.codePointAt(0)! < 0x80 ? 0.5 : 1) * size;
  return w;
}

export function wrapForWidth(s: string, size: number, width: number): string[] {
  return wrapLines(s, size, width, approxWidth);
}

export function basicReportPdf(r: MonthlyReport): Buffer {
  const ops: string[] = [];
  layoutReport({
    text: (x, y, s, size, c = INK) => ops.push(`${c.join(" ")} rg BT /F1 ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td <${hex(s)}> Tj ET`),
    rect: (x, y, w, h, c) => ops.push(`${c.join(" ")} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`),
    width: approxWidth,
  }, r);
  return buildPdf(ops.join("\n"), `Eigo Quest ${r.monthLabelJa}の学習レポート`);
}

function buildPdf(content: string, title: string): Buffer {
  const stream = Buffer.from(content, "latin1"); // 本文は ASCII のみ（文字は16進）
  const objs: (string | Buffer)[] = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_W} ${A4_H}] /Resources << /Font << /F1 4 0 R >> >> /Contents 7 0 R >>`,
    "<< /Type /Font /Subtype /Type0 /BaseFont /HeiseiKakuGo-W5 /Encoding /UniJIS-UCS2-H /DescendantFonts [5 0 R] >>",
    "<< /Type /Font /Subtype /CIDFontType0 /BaseFont /HeiseiKakuGo-W5 /CIDSystemInfo << /Registry (Adobe) /Ordering (Japan1) /Supplement 2 >> /FontDescriptor 6 0 R /DW 1000 /W [1 95 500] >>",
    "<< /Type /FontDescriptor /FontName /HeiseiKakuGo-W5 /Flags 4 /FontBBox [-92 -250 1010 922] /ItalicAngle 0 /Ascent 752 /Descent -221 /CapHeight 737 /StemV 114 >>",
    Buffer.concat([Buffer.from(`<< /Length ${stream.length} >>\nstream\n`, "latin1"), stream, Buffer.from("\nendstream", "latin1")]),
    `<< /Title <FEFF${hex(title)}> /Producer (Eigo Quest) >>`,
  ];
  const parts: Buffer[] = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "latin1")];
  const offsets: number[] = [];
  let len = parts[0]!.length;
  objs.forEach((o, i) => {
    offsets.push(len);
    const b = Buffer.concat([Buffer.from(`${i + 1} 0 obj\n`, "latin1"), typeof o === "string" ? Buffer.from(o, "latin1") : o, Buffer.from("\nendobj\n", "latin1")]);
    parts.push(b);
    len += b.length;
  });
  const xref = [`xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`, ...offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`)].join("");
  parts.push(Buffer.from(`${xref}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R /Info ${objs.length} 0 R >>\nstartxref\n${len}\n%%EOF\n`, "latin1"));
  return Buffer.concat(parts);
}
