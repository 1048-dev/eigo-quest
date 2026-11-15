/**
 * seed: content/curriculum/*.json → DB（レッスン・学習項目・テスト定義・モンスター・ショップ）＋デモユーザー
 *   npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import monsters from "../content/curriculum/monsters.json";
import { ASSESSMENTS, LESSONS, itemsOfLesson } from "../src/lib/curriculum";

const prisma = new PrismaClient();

async function main() {
  for (const l of LESSONS) {
    const data = {
      world: l.world, title: l.title, titleJa: l.titleJa, schoolGrade: l.school.grade, schoolTopic: l.school.topic,
      phonicsRule: l.phonics.rule, teacherScript: l.teacherScript, content: l as object,
    };
    await prisma.lesson.upsert({ where: { lessonNo: l.lessonNo }, create: { lessonNo: l.lessonNo, ...data }, update: data });
    for (const it of itemsOfLesson(l)) {
      const d = { lessonNo: it.lessonNo, kind: it.kind, text: it.text, ja: it.ja, emoji: it.emoji, skills: it.skills, schoolCore: it.schoolCore };
      await prisma.learningItem.upsert({ where: { id: it.id }, create: { id: it.id, ...d }, update: d });
    }
  }

  for (const a of ASSESSMENTS) {
    const { id, ...d } = a;
    await prisma.assessment.upsert({ where: { id }, create: { id, ...d }, update: d });
  }
  // お宝アラートのテスト結果をぶら下げる共通行
  await prisma.assessment.upsert({
    where: { id: "treasure" },
    create: { id: "treasure", kind: "TREASURE", rangeStart: 0, rangeEnd: 0, questionCount: 6, passRate: 0.8 },
    update: {},
  });

  for (const m of monsters.monsters) {
    const { id, rarity, ...d } = m;
    await prisma.monster.upsert({ where: { id }, create: { id, rarity: rarity as never, ...d }, update: { rarity: rarity as never, ...d } });
  }
  for (const s of monsters.shop) {
    const { id, ...d } = s;
    await prisma.shopItem.upsert({ where: { id }, create: { id, ...d }, update: d });
  }

  await prisma.user.upsert({
    where: { id: "demo-user" },
    create: { id: "demo-user", nickname: "ゆうき", schoolGrade: 3, friendCode: "DEMO-0001" },
    update: {},
  });

  console.log(`seeded ${LESSONS.length} lessons, ${ASSESSMENTS.length} assessments`);
}

main().finally(() => prisma.$disconnect());
