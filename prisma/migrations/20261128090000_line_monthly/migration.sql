-- run4 Phase 3: 月ごとの学習レポート（PDF）を LINE で届ける
-- 生成: npx prisma migrate diff --from-schema-datamodel <変更前の schema のコピー> --to-schema-datamodel prisma/schema.prisma --script
--  - Parent.lineFriend: 公式アカウントの友だち状態（webhook の follow/unfollow）。lineMonthlyEnabled: 毎月の配信の オン/オフ（既定オン）
--  - ReportDelivery: 配信ごとの ダウンロード用トークン（SHA-256 だけ保存・30日で期限切れ）と ファイルの一覧

-- CreateEnum
CREATE TYPE "DeliveryTrigger" AS ENUM ('MONTHLY', 'MANUAL');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SENT', 'DRY_RUN', 'FAILED');

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "lineFriend" BOOLEAN,
ADD COLUMN     "lineFriendChangedAt" TIMESTAMP(3),
ADD COLUMN     "lineMonthlyEnabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "ReportDelivery" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "trigger" "DeliveryTrigger" NOT NULL,
    "batchId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "files" JSONB NOT NULL,
    "summary" JSONB NOT NULL,
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReportDelivery_tokenHash_key" ON "ReportDelivery"("tokenHash");

-- CreateIndex
CREATE INDEX "ReportDelivery_parentId_createdAt_idx" ON "ReportDelivery"("parentId", "createdAt");

-- CreateIndex
CREATE INDEX "ReportDelivery_childId_month_idx" ON "ReportDelivery"("childId", "month");

-- AddForeignKey
ALTER TABLE "ReportDelivery" ADD CONSTRAINT "ReportDelivery_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
