/**
 * 学習レポートの PDF を Node だけで作る（run5 Phase 3: pdf-lib + Noto Sans JP のサブセット埋め込み）。
 *  - 1ページ・A4・本物の PDF
 *  - 日本語フォントが埋め込まれている（FontFile2）・使った文字だけ（サイズが小さい）・「学」などの文字が入っている
 *  - 長い名前・たくさんの にがて でも 1ページに おさまる
 *  - フォントが無いときは かんたんな PDF にフォールバック
 */
import { describe, expect, it } from "vitest";
import { PDFDocument, PDFRawStream, PDFDict, PDFName, PDFRef, decodePDFRawStream } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { basicReportPdf, renderReportWithPdfLib, renderReportPdf, wrapLines, REPORT_FONT_FILE } from "@/lib/report/pdf";
import type { MonthlyReport } from "@/lib/report/monthlyReport";
import { existsSync, readFileSync } from "node:fs";
import { padGlyphs } from "../scripts/prepare-report-font";

function sample(over: Partial<MonthlyReport> = {}): MonthlyReport {
  return {
    childName: "はる", month: "2026-11", monthLabelJa: "2026年11月",
    lessonsThisMonth: 12, studyDaysThisMonth: 10, testsPassedThisMonth: 3,
    streakDays: 4, longestStreak: 12, overall: 55, lessonsDone: 30, totalLessons: 360,
    world: 2, worldNameJa: "ことばの町", generatedOn: "2026-12-01",
    mastery: [
      { skill: "SCHOOL_TEST", labelJa: "学校テスト", score: 70 },
      { skill: "PHONICS", labelJa: "フォニックス", score: 50 },
      { skill: "LISTENING", labelJa: "リスニング", score: 60 },
      { skill: "SPEAKING", labelJa: "発音", score: 20 },
      { skill: "VOCABULARY", labelJa: "語彙", score: 80 },
      { skill: "WRITING", labelJa: "筆記", score: 40 },
    ],
    weakSkills: [{ skill: "SPEAKING", labelJa: "発音", score: 20 }],
    weakItems: [{ text: "apple", ja: "りんご", lessonNo: 3 }],
    nextLessonNo: 31,
    nextTopics: [{ lessonNo: 31, topicJa: "あいさつ・自己紹介", titleJa: "はじめまして" }],
    nextPhonics: ["sh", "ch"],
    commentJa: "よいペースで続けられています。「発音」がまだ伸びしろです。",
    ...over,
  } as MonthlyReport;
}

/** PDF の中の すべてのストリーム（展開したもの）を文字列にして つなげる */
async function allStreamsText(bytes: Uint8Array): Promise<string> {
  const doc = await PDFDocument.load(bytes);
  let out = "";
  for (const [, obj] of doc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream) {
      out += obj.dict.toString() + "\n";
      try {
        out += Buffer.from(decodePDFRawStream(obj).decode()).toString("latin1") + "\n";
      } catch {
        /* フォントの本体など 展開できないものは とばす */
      }
    } else {
      out += obj.toString() + "\n"; // 辞書（オブジェクトストリームから読んだもの）
    }
  }
  return out;
}

describe("Node だけで作る学習レポート（pdf-lib）", () => {
  it("フォントファイルが リポジトリに入っている（ライセンスも）", () => {
    expect(existsSync(REPORT_FONT_FILE)).toBe(true);
    expect(existsSync(REPORT_FONT_FILE.replace("NotoSansJP-Regular.ttf", "OFL.txt"))).toBe(true);
  });

  it("A4・1ページ・日本語フォントを使った文字だけ埋め込む", async () => {
    const t0 = Date.now();
    const bytes = await renderReportWithPdfLib(sample(), { now: new Date("2026-12-01T00:00:00Z") });
    const ms = Date.now() - t0;
    expect(Buffer.from(bytes.subarray(0, 5)).toString()).toBe("%PDF-");
    const doc = await PDFDocument.load(bytes, { updateMetadata: false });
    expect(doc.getPageCount()).toBe(1);
    const { width, height } = doc.getPage(0).getSize();
    expect(Math.round(width)).toBe(595);
    expect(Math.round(height)).toBe(842);
    expect(doc.getProducer()).toBe("Eigo Quest");
    expect(doc.getTitle()).toContain("2026年11月");
    // フォント全体（5MB 以上）ではなく サブセット
    expect(bytes.length).toBeLessThan(400_000);
    // 辞書は 圧縮された オブジェクトストリームに入るので、展開してから さがす
    const decoded = (await allStreamsText(bytes)) + Buffer.from(bytes).toString("latin1");
    expect(decoded).toContain("/FontFile2");
    const baseFont = /\/BaseFont \/(\S+)/.exec(decoded)?.[1] ?? "";
    expect(baseFont).toMatch(/NotoSansJP/);
    // ToUnicode に「学」(U+5B66)「は」(U+306F) が入っている = その文字の グリフを使っている
    const text = decoded.toLowerCase();
    expect(text).toContain("5b66");
    expect(text).toContain("306f");
    expect(ms).toBeLessThan(20_000);
  }, 30_000);

  it("長い名前・たくさんの にがて・制御文字・絵文字でも こわれず 1ページ", async () => {
    const long = sample({
      childName: "とてもながいなまえのこども".repeat(4) + "\u0007",
      weakItems: Array.from({ length: 6 }, (_, i) => ({ text: `extraordinarily-long-word-${i}`, ja: "とても ながい ことばの いみ".repeat(3), lessonNo: i + 1 })),
      nextTopics: Array.from({ length: 6 }, (_, i) => ({ lessonNo: 31 + i, topicJa: "ながい 単元の なまえ".repeat(4), titleJa: "タイトル🎉" })),
      commentJa: "ほめる ことば。".repeat(40),
    });
    const bytes = await renderReportWithPdfLib(long);
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(1);
  }, 30_000);

  it("フォントが読めないときは かんたんな PDF（renderReportPdf はエラーにしない）", async () => {
    await expect(renderReportWithPdfLib(sample(), { fontFile: "Z:/no/such/font.ttf" })).rejects.toThrow();
    const basic = basicReportPdf(sample());
    expect(basic.subarray(0, 5).toString()).toBe("%PDF-");
    expect((await PDFDocument.load(basic)).getPageCount()).toBe(1);
    const r = await renderReportPdf(sample());
    expect(r.engine).toBe("pdf-lib");
  }, 30_000);

  it("フォントは すべてのグリフが 4バイト単位（fontkit のサブセットが短い loca で 1バイト切る不具合を さける）", () => {
    const font = readFileSync(REPORT_FONT_FILE);
    const n = font.readUInt16BE(4);
    const t: Record<string, number> = {};
    for (let i = 0; i < n; i++) t[font.toString("latin1", 12 + i * 16, 16 + i * 16)] = font.readUInt32BE(12 + i * 16 + 8);
    expect(font.readInt16BE(t.head! + 50)).toBe(1); // loca は長い形式
    const numGlyphs = font.readUInt16BE(t.maxp! + 4);
    let odd = 0;
    for (let g = 0; g <= numGlyphs; g++) if (font.readUInt32BE(t.loca! + g * 4) % 4) odd++;
    expect(odd).toBe(0);
    // padGlyphs は 何度かけても 同じ（すでに整っている）
    expect(padGlyphs(font).padded).toBe(0);
  });

  it("PDF に埋め込んだ サブセットのフォントの グリフが すべて読める（文字化けしない）", async () => {
    const bytes = await renderReportWithPdfLib(sample());
    const doc = await PDFDocument.load(bytes);
    let checked = 0;
    for (const [, o] of doc.context.enumerateIndirectObjects()) {
      if (!(o instanceof PDFDict)) continue;
      const ref = o.get(PDFName.of("FontFile2"));
      if (!ref) continue;
      const data = decodePDFRawStream(doc.context.lookup(ref as PDFRef) as PDFRawStream).decode();
      const font = fontkit.create(Buffer.from(data)) as unknown as { numGlyphs: number; getGlyph(id: number): { path: { commands: unknown[] } } };
      let outlined = 0;
      for (let g = 1; g < font.numGlyphs; g++) if (font.getGlyph(g).path.commands.length > 0) outlined++;
      expect(outlined).toBeGreaterThan(font.numGlyphs * 0.8);
      checked++;
    }
    expect(checked).toBe(1);
  }, 30_000);

  it("折り返し: 幅を こえたら 次の行（はじめの空白は 落とす）", () => {
    const measure = (s: string, size: number) => s.length * size;
    expect(wrapLines("abcdef", 1, 3, measure)).toEqual(["abc", "def"]);
    expect(wrapLines("abc def", 1, 3, measure)).toEqual(["abc", "def"]);
    expect(wrapLines("a\u0000b", 1, 10, measure)).toEqual(["a b"]);
  });
});
