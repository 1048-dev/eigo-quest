-- run4 Phase 2: LINE ログイン（保護者）
-- 生成: npx prisma migrate diff --from-schema-datamodel <変更前の schema のコピー> --to-schema-datamodel prisma/schema.prisma --script
--  - LINE だけで登録した保護者は メール・パスワードを持たない → null を許す
--  - LINE で登録した直後（暗証番号を決める前）は pinHash が null
--  - lineUserId はユニーク（1つの LINE アカウントは 1人の保護者にだけ連携できる）

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "lineDisplayName" TEXT,
ADD COLUMN     "lineLinkedAt" TIMESTAMP(3),
ADD COLUMN     "lineUserId" TEXT,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL,
ALTER COLUMN "pinHash" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Parent_lineUserId_key" ON "Parent"("lineUserId");
