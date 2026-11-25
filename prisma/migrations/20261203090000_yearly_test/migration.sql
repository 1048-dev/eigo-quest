-- 年に1回の 力だめし（run7 P-yearly）
-- CreateTable
CREATE TABLE "YearlyTestResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stage" INTEGER NOT NULL,
    "takenOn" TEXT NOT NULL,
    "listening" INTEGER NOT NULL,
    "reading" INTEGER NOT NULL,
    "speaking" INTEGER NOT NULL,
    "writing" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "scaled" INTEGER NOT NULL,
    "gradedBy" TEXT NOT NULL,
    "detail" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "YearlyTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "YearlyTestResult_userId_createdAt_idx" ON "YearlyTestResult"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "YearlyTestResult_userId_takenOn_key" ON "YearlyTestResult"("userId", "takenOn");

-- AddForeignKey
ALTER TABLE "YearlyTestResult" ADD CONSTRAINT "YearlyTestResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
