/**
 * 月間レポート・ワークシートの PDF を作る。
 *  - レポート: worksheets/generate_worksheets.py --report-json（ReportLab・日本語フォント埋め込み）を優先。
 *    Python が無い・失敗したときは、この中の かんたんな PDF（依存なし・日本語は ビューアの CID フォント）で作る。
 *  - ワークシート: 同じスクリプトの --month --world N（1か月ワークブック）。ワールドごとに1回だけ作って使い回す。
 * Python の実行ファイルは PYTHON（未設定なら python3 → python の順に試す）。
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import type { MonthlyReport } from "./monthlyReport";

const GENERATOR = path.join(process.cwd(), "worksheets", "generate_worksheets.py");

// ---------------------------------------------------------------------------
// Python
// ---------------------------------------------------------------------------
function pythonCandidates(): string[] {
  const env = process.env.PYTHON?.trim();
  return env ? [env] : ["python3", "python"];
}

function runOnce(cmd: string, args: string[], timeoutMs: number): Promise<{ ok: boolean; stderr: string }> {
  return new Promise((resolve) => {
    let stderr = "";
    let done = false;
    const finish = (ok: boolean) => { if (!done) { done = true; clearTimeout(timer); resolve({ ok, stderr: stderr.slice(-2000) }); } };
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(cmd, args, { stdio: ["ignore", "ignore", "pipe"], env: { ...process.env, PYTHONIOENCODING: "utf-8" }, windowsHide: true });
    } catch (e) {
      resolve({ ok: false, stderr: String(e) });
      return;
    }
    const timer = setTimeout(() => { child.kill(); finish(false); }, timeoutMs);
    child.stderr?.on("data", (b: Buffer) => { stderr += b.toString("utf8"); });
    child.on("error", (e) => { stderr += String(e); finish(false); });
    child.on("close", (code) => finish(code === 0));
  });
}

/** 生成スクリプトを実行する。どの python でも失敗したら ok:false */
export async function runGenerator(args: string[], timeoutMs = 180_000): Promise<{ ok: boolean; stderr: string }> {
  if (!existsSync(GENERATOR)) return { ok: false, stderr: "generate_worksheets.py が見つかりません" };
  let last = { ok: false, stderr: "python が見つかりません" };
  for (const py of pythonCandidates()) {
    last = await runOnce(py, [GENERATOR, ...args], timeoutMs);
    if (last.ok) return last;
  }
  return last;
}

// ---------------------------------------------------------------------------
// レポート PDF
// ---------------------------------------------------------------------------
export type ReportRenderer = (report: MonthlyReport, outFile: string) => Promise<{ engine: "reportlab" | "basic" }>;

/** ReportLab で作る。だめなら かんたんな PDF */
export const renderReportPdf: ReportRenderer = async (report, outFile) => {
  await mkdir(path.dirname(outFile), { recursive: true });
  const json = `${outFile}.json`;
  await writeFile(json, JSON.stringify(report), "utf8");
  try {
    const r = await runGenerator(["--report-json", json, "--report-out", outFile], 60_000);
    if (r.ok && existsSync(outFile)) return { engine: "reportlab" };
    console.warn("[report] ReportLab でレポートを作れなかったため、かんたんな PDF で作ります");
  } finally {
    await rm(json, { force: true });
  }
  await writeFile(outFile, basicReportPdf(report));
  return { engine: "basic" };
};

/** かんたんな PDF だけで作る（テスト・Python の無い環境用） */
export const renderBasicReportPdf: ReportRenderer = async (report, outFile) => {
  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, basicReportPdf(report));
  return { engine: "basic" };
};

// ---------------------------------------------------------------------------
// 依存なしの かんたんな PDF（A4・1ページ）
//  日本語は Adobe-Japan1 の CID フォント（HeiseiKakuGo-W5 / UniJIS-UCS2-H）を参照（埋め込みなし）。
// ---------------------------------------------------------------------------
const A4_W = 595.28;
const A4_H = 841.89;
const MARGIN = 42;

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
function textWidth(s: string, size: number): number {
  let w = 0;
  for (const ch of s) w += (ch.codePointAt(0)! < 0x80 ? 0.5 : 1) * size;
  return w;
}

export function wrapForWidth(s: string, size: number, width: number): string[] {
  const lines: string[] = [];
  let cur = "";
  for (const ch of s) {
    if (textWidth(cur + ch, size) > width && cur) {
      lines.push(cur);
      cur = ch === " " ? "" : ch;
    } else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

class Page {
  ops: string[] = [];
  y = A4_H - MARGIN;
  text(x: number, y: number, s: string, size = 10, rgb: [number, number, number] = [0, 0, 0]) {
    this.ops.push(`${rgb.join(" ")} rg BT /F1 ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td <${hex(s)}> Tj ET`);
  }
  rect(x: number, y: number, w: number, h: number, rgb: [number, number, number]) {
    this.ops.push(`${rgb.join(" ")} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }
  para(s: string, size = 10, indent = 0, rgb: [number, number, number] = [0, 0, 0]) {
    for (const line of wrapForWidth(s, size, A4_W - 2 * MARGIN - indent)) {
      if (this.y < MARGIN + 20) return; // 1ページに おさめる（あふれた分は省く）
      this.text(MARGIN + indent, this.y, line, size, rgb);
      this.y -= size * 1.55;
    }
  }
  heading(s: string) {
    this.y -= 8;
    this.rect(MARGIN, this.y - 3, 4, 14, [0.93, 0.63, 0]);
    this.text(MARGIN + 10, this.y, s, 12.5);
    this.y -= 20;
  }
}

const BLUE: [number, number, number] = [0.165, 0.47, 0.84];
const GREY: [number, number, number] = [0.35, 0.39, 0.47];

export function basicReportPdf(r: MonthlyReport): Buffer {
  const p = new Page();
  p.rect(MARGIN, p.y - 44, A4_W - 2 * MARGIN, 48, BLUE);
  p.text(MARGIN + 14, p.y - 18, `${r.monthLabelJa}の 学習レポート`, 18, [1, 1, 1]);
  p.text(MARGIN + 14, p.y - 36, `${r.childName} さん ／ 作成日 ${r.generatedOn} ／ おうちの方へ`, 9, [1, 1, 1]);
  p.y -= 70;

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
    p.rect(x, p.y - 44, w, 52, [0.93, 0.96, 0.99]);
    p.text(x + 10, p.y - 10, label, 9, GREY);
    p.text(x + 10, p.y - 34, value, 17, BLUE);
  });
  p.y -= 68;
  p.para(`これまでに ${r.lessonsDone} / ${r.totalLessons} レッスン ・ 合格したテスト（今月） ${r.testsPassedThisMonth} ・ いまのワールド ${r.world}「${r.worldNameJa}」`, 9.5);

  p.heading(`6つの力の 習得率（送信時点・総合 ${Math.round(r.overall)}%）`);
  const barX = MARGIN + 120;
  const barW = A4_W - MARGIN - barX - 40;
  for (const m of r.mastery) {
    const score = Math.max(0, Math.min(100, m.score));
    p.text(MARGIN + 10, p.y, m.labelJa, 9.5);
    p.rect(barX, p.y - 2, barW, 10, [0.89, 0.91, 0.94]);
    if (score > 0) p.rect(barX, p.y - 2, Math.max(4, (barW * score) / 100), 10, score >= 60 ? BLUE : score >= 30 ? [0.93, 0.63, 0] : [0.89, 0.29, 0.28]);
    p.text(barX + barW + 8, p.y, String(Math.round(score)), 9.5);
    p.y -= 19;
  }

  p.heading("にがて（伸びしろ）");
  if (r.weakSkills.length === 0 && r.weakItems.length === 0) p.para("まだ学習の記録が少ないため、にがての判定はこれからです。", 9.5, 10, GREY);
  if (r.weakSkills.length) p.para(`力: ${r.weakSkills.map((x) => `${x.labelJa}（${Math.round(x.score)}）`).join("、")}`, 9.5, 10);
  if (r.weakItems.length) p.para(`忘れかけの ことば: ${r.weakItems.map((x) => `${x.text}（${x.ja}）`).join("　")}`, 9.5, 10);

  p.heading(r.nextLessonNo ? `来月の 予定（Lesson ${r.nextLessonNo} から）` : "来月の 予定（すべてのレッスンを終えました）");
  for (const t of r.nextTopics) p.para(`・Lesson ${t.lessonNo}〜　${t.topicJa}（${t.titleJa}）`, 9.5, 10);
  if (r.nextPhonics.length) p.para(`フォニックス: ${r.nextPhonics.join("　")}`, 9.5, 10);

  p.heading("おうちの方へ");
  p.para(r.commentJa, 10, 10);
  p.para("同封の「1か月ワークブック」は、いまのワールドのレッスンと連動しています。1日1枚を目安に、アプリのあとで取り組んでください。", 8.5, 10, GREY);
  p.text(A4_W / 2 - 50, 24, "Eigo Quest 学習レポート", 8, GREY);

  return buildPdf(p.ops.join("\n"), `Eigo Quest ${r.monthLabelJa}の学習レポート`);
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
