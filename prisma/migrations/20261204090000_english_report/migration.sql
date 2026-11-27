-- 「この英語、へん？」の 報告（run9 Phase 1）
-- CreateTable
CREATE TABLE "EnglishReport" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "userId" TEXT,
    "page" TEXT NOT NULL,
    "lessonNo" INTEGER,
    "segmentId" TEXT NOT NULL,
    "text" TEXT,
    "comment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnglishReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnglishReport_clientId_key" ON "EnglishReport"("clientId");

-- CreateIndex
CREATE INDEX "EnglishReport_lessonNo_createdAt_idx" ON "EnglishReport"("lessonNo", "createdAt");

-- CreateIndex
CREATE INDEX "EnglishReport_status_createdAt_idx" ON "EnglishReport"("status", "createdAt");
