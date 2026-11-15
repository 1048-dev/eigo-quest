-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "ItemKind" AS ENUM ('WORD', 'EXPRESSION', 'COMMAND', 'PHONICS');

-- CreateEnum
CREATE TYPE "Skill" AS ENUM ('SCHOOL_TEST', 'PHONICS', 'LISTENING', 'SPEAKING', 'VOCABULARY', 'WRITING');

-- CreateEnum
CREATE TYPE "AssessmentKind" AS ENUM ('DAILY_CHECK', 'MINI', 'BOSS', 'ARENA', 'TREASURE');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AttemptSource" AS ENUM ('NORMAL', 'ARENA', 'TREASURE_ALERT');

-- CreateEnum
CREATE TYPE "CoinReason" AS ENUM ('LESSON_COMPLETE', 'DAILY_CHECK_FIRST_TRY', 'DAILY_CHECK_PASS', 'MINI_TEST_PASS', 'BOSS_TEST_PASS', 'TREASURE_ALERT_CLEAR', 'ARENA_PLAY', 'STREAK_BONUS', 'GACHA_SPEND', 'SHOP_SPEND');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OFFERED', 'ACCEPTED', 'CLEARED', 'DISMISSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateEnum
CREATE TYPE "TicketKind" AS ENUM ('NORMAL', 'RARE');

-- CreateTable
CREATE TABLE "Parent" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'TRIALING',
    "planId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Parent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "parentId" TEXT,
    "nickname" TEXT NOT NULL,
    "birthYear" INTEGER,
    "schoolGrade" INTEGER,
    "friendCode" TEXT NOT NULL,
    "avatar" JSONB NOT NULL DEFAULT '{}',
    "coins" INTEGER NOT NULL DEFAULT 0,
    "totalCoinsEarned" INTEGER NOT NULL DEFAULT 0,
    "streakDays" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastStudyDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("userId","friendId")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "lessonNo" INTEGER NOT NULL,
    "world" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "titleJa" TEXT NOT NULL,
    "schoolGrade" TEXT NOT NULL,
    "schoolTopic" TEXT NOT NULL,
    "phonicsRule" TEXT NOT NULL,
    "teacherScript" TEXT NOT NULL,
    "videoUrl" TEXT,
    "content" JSONB NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("lessonNo")
);

-- CreateTable
CREATE TABLE "LearningItem" (
    "id" TEXT NOT NULL,
    "lessonNo" INTEGER NOT NULL,
    "kind" "ItemKind" NOT NULL,
    "text" TEXT NOT NULL,
    "ja" TEXT NOT NULL,
    "emoji" TEXT,
    "skills" "Skill"[],
    "schoolCore" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LearningItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "kind" "AssessmentKind" NOT NULL,
    "rangeStart" INTEGER NOT NULL,
    "rangeEnd" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "passRate" DOUBLE PRECISION NOT NULL,
    "unlocksLesson" INTEGER,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonProgress" (
    "userId" TEXT NOT NULL,
    "lessonNo" INTEGER NOT NULL,
    "status" "LessonStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "completedOn" TEXT,
    "quizScore" DOUBLE PRECISION,
    "speedListeningBest" DOUBLE PRECISION,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("userId","lessonNo")
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "source" "AttemptSource" NOT NULL DEFAULT 'NORMAL',
    "reviewAlertId" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "isFirstAttempt" BOOLEAN NOT NULL,
    "coinsAwarded" INTEGER NOT NULL DEFAULT 0,
    "takenOn" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemResponse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "skill" "Skill" NOT NULL,
    "questionType" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION,
    "responseMs" INTEGER,
    "playbackRate" DOUBLE PRECISION,
    "answer" TEXT,
    "context" "AttemptSource" NOT NULL DEFAULT 'NORMAL',
    "attemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemMemory" (
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "stability" DOUBLE PRECISION NOT NULL,
    "difficulty" DOUBLE PRECISION NOT NULL,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "lapses" INTEGER NOT NULL DEFAULT 0,
    "accuracyEwma" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItemMemory_pkey" PRIMARY KEY ("userId","itemId")
);

-- CreateTable
CREATE TABLE "MasterySnapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "schoolTest" DOUBLE PRECISION NOT NULL,
    "phonics" DOUBLE PRECISION NOT NULL,
    "listening" DOUBLE PRECISION NOT NULL,
    "speaking" DOUBLE PRECISION NOT NULL,
    "vocabulary" DOUBLE PRECISION NOT NULL,
    "writing" DOUBLE PRECISION NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "coverage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "MasterySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoinLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "CoinReason" NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "refType" TEXT,
    "refId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoinLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonNo" INTEGER NOT NULL,
    "itemIds" TEXT[],
    "retrievability" DOUBLE PRECISION NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "status" "AlertStatus" NOT NULL DEFAULT 'OFFERED',
    "offeredOn" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "clearedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Monster" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "rarity" "Rarity" NOT NULL,
    "theme" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,

    CONSTRAINT "Monster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMonster" (
    "userId" TEXT NOT NULL,
    "monsterId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "firstObtainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserMonster_pkey" PRIMARY KEY ("userId","monsterId")
);

-- CreateTable
CREATE TABLE "GachaTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "TicketKind" NOT NULL,
    "source" TEXT NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GachaTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopItem" (
    "id" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageKey" TEXT NOT NULL,

    CONSTRAINT "ShopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserShopItem" (
    "userId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "boughtAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserShopItem_pkey" PRIMARY KEY ("userId","itemId")
);

-- CreateTable
CREATE TABLE "AiGradingCache" (
    "key" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "feedbackJa" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGradingCache_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Parent_email_key" ON "Parent"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_friendCode_key" ON "User"("friendCode");

-- CreateIndex
CREATE INDEX "LearningItem_lessonNo_idx" ON "LearningItem"("lessonNo");

-- CreateIndex
CREATE INDEX "TestAttempt_userId_assessmentId_idx" ON "TestAttempt"("userId", "assessmentId");

-- CreateIndex
CREATE INDEX "TestAttempt_userId_takenOn_idx" ON "TestAttempt"("userId", "takenOn");

-- CreateIndex
CREATE INDEX "ItemResponse_userId_itemId_createdAt_idx" ON "ItemResponse"("userId", "itemId", "createdAt");

-- CreateIndex
CREATE INDEX "ItemResponse_userId_skill_createdAt_idx" ON "ItemResponse"("userId", "skill", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MasterySnapshot_userId_date_key" ON "MasterySnapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CoinLedger_idempotencyKey_key" ON "CoinLedger"("idempotencyKey");

-- CreateIndex
CREATE INDEX "CoinLedger_userId_createdAt_idx" ON "CoinLedger"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReviewAlert_userId_offeredOn_idx" ON "ReviewAlert"("userId", "offeredOn");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningItem" ADD CONSTRAINT "LearningItem_lessonNo_fkey" FOREIGN KEY ("lessonNo") REFERENCES "Lesson"("lessonNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemResponse" ADD CONSTRAINT "ItemResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemResponse" ADD CONSTRAINT "ItemResponse_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LearningItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMemory" ADD CONSTRAINT "ItemMemory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemMemory" ADD CONSTRAINT "ItemMemory_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "LearningItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterySnapshot" ADD CONSTRAINT "MasterySnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoinLedger" ADD CONSTRAINT "CoinLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewAlert" ADD CONSTRAINT "ReviewAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMonster" ADD CONSTRAINT "UserMonster_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMonster" ADD CONSTRAINT "UserMonster_monsterId_fkey" FOREIGN KEY ("monsterId") REFERENCES "Monster"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GachaTicket" ADD CONSTRAINT "GachaTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShopItem" ADD CONSTRAINT "UserShopItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShopItem" ADD CONSTRAINT "UserShopItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "ShopItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
