/**
 * 「この英語、へん？」の 報告（run9 Phase 1）の サービス層。
 *  - saveEnglishReport: 1件 保存（clientId が おなじなら 2回目は なにも しない＝送りなおしても 1件）
 *  - listEnglishReports / setEnglishReportStatus: 運営の スクリプト（scripts/english-reports.ts）用
 * 保護者ページには 出さない。DB の エラーは 呼び出し側で ひろう。
 */
import { prisma } from "@/lib/db";
import type { EnglishReportRequest } from "@/lib/api/contracts";

export const ENGLISH_REPORT_STATUSES = ["open", "fixed", "wontfix"] as const;
export type EnglishReportStatus = (typeof ENGLISH_REPORT_STATUSES)[number];

/** 制御文字を けして 前後の 空白を とる（空なら undefined） */
export function cleanText(s: string | undefined, max: number): string | undefined {
  if (s === undefined) return undefined;
  // eslint-disable-next-line no-control-regex
  const t = s.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
  return t || undefined;
}

export async function saveEnglishReport(input: EnglishReportRequest, userId: string | null, now = new Date()): Promise<{ created: boolean }> {
  const reportedAt = input.reportedAt && input.reportedAt <= now.getTime() + 60_000 ? new Date(input.reportedAt) : now;
  const existing = await prisma.englishReport.findUnique({ where: { clientId: input.clientId }, select: { id: true } });
  if (existing) return { created: false };
  try {
    await prisma.englishReport.create({
      data: {
        clientId: input.clientId,
        userId,
        page: input.page,
        lessonNo: input.lessonNo ?? null,
        segmentId: input.segmentId,
        text: cleanText(input.text, 300) ?? null,
        comment: cleanText(input.comment, 200) ?? null,
        reportedAt,
      },
    });
  } catch (e) {
    // おなじ clientId が 同時に 2つ 来た（片方が 先に 保存した）
    if ((e as { code?: string } | null)?.code === "P2002") return { created: false };
    throw e;
  }
  return { created: true };
}

export interface EnglishReportFilter {
  lessonFrom?: number;
  lessonTo?: number;
  status?: EnglishReportStatus;
  since?: Date;
  limit?: number;
}

export async function listEnglishReports(f: EnglishReportFilter = {}) {
  return prisma.englishReport.findMany({
    where: {
      ...(f.lessonFrom !== undefined || f.lessonTo !== undefined ? { lessonNo: { gte: f.lessonFrom ?? 1, lte: f.lessonTo ?? 1200 } } : {}),
      ...(f.status ? { status: f.status } : {}),
      ...(f.since ? { createdAt: { gte: f.since } } : {}),
    },
    orderBy: [{ lessonNo: "asc" }, { createdAt: "asc" }],
    take: Math.min(Math.max(f.limit ?? 200, 1), 2000),
  });
}

export async function setEnglishReportStatus(id: string, status: EnglishReportStatus): Promise<boolean> {
  const r = await prisma.englishReport.updateMany({ where: { id }, data: { status } });
  return r.count > 0;
}
