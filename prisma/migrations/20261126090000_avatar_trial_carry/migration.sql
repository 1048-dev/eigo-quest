-- run4 Phase 1: 子どもの アバター（キャラクター）と、おためしモードの きろくの ひきつぎ
-- 生成: npx prisma migrate diff --from-schema-datamodel <変更前の schema のコピー> --to-schema-datamodel prisma/schema.prisma --script
-- （DB を起動せずに作成。最後の UPDATE だけ手で追加）

-- AlterEnum
ALTER TYPE "CoinReason" ADD VALUE 'TRIAL_CARRY_OVER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarCharacter" TEXT NOT NULL DEFAULT 'haru';

-- 既存の子どもには、きょうだいの登録順で haru → riko → kiko → birimo をくり返して割りあてる
-- （これまで画面で表示していた顔と同じになる。保護者のいない行（デモユーザーなど）は haru のまま）
UPDATE "User" AS u
SET "avatarCharacter" = (ARRAY['haru', 'riko', 'kiko', 'birimo'])[((o.rn - 1) % 4) + 1]
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "parentId" ORDER BY "createdAt", "id") AS rn
  FROM "User"
  WHERE "parentId" IS NOT NULL
) AS o
WHERE u."id" = o."id";
