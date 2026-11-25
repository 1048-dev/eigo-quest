-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTrial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3),
ADD COLUMN     "trialTokenHash" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_trialTokenHash_key" ON "User"("trialTokenHash");

-- CreateIndex
CREATE INDEX "User_isTrial_lastActiveAt_idx" ON "User"("isTrial", "lastActiveAt");

