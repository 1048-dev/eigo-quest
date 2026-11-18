/**
 * seed: content/*.json → DB（レッスン・学習項目・テスト定義・モンスター・ショップ・おしらせ）＋デモユーザー
 *   npm run db:seed        （= npx prisma db seed）
 *
 * 一発で通すための工夫:
 *  1. 最初にDB接続を確認し、つながらなければ「何をすればいいか」を表示して終了する（スタックトレースを出さない）
 *  2. 投入前にデータを検証する（ID重複・必須項目の空・件数）。問題があれば内容を表示して止める
 *  3. 書きこむ項目は「生成済みの Prisma スキーマに実在する列」だけに絞る。
 *     スキーマに必須列（例: category）が増えていても、データ側に無ければ妥当な既定値で埋める。
 *     → schema.prisma と JSON の項目が少しずれていても seed が失敗しない
 *  4. すべて upsert なので何度実行しても同じ結果（冪等）。セクションごとに結果を表示する
 */
import { Prisma, PrismaClient } from "@prisma/client";
import shopData from "../content/curriculum/monsters.json";
import announcementsData from "../content/announcements.json";
import { MONSTERS } from "../src/lib/game/monsters";
import { ASSESSMENTS, LESSONS, itemsOfLesson } from "../src/lib/curriculum";

const prisma = new PrismaClient();
const ANNOUNCEMENTS = announcementsData.announcements ?? [];
type Row = Record<string, unknown>;
type DmmfModel = (typeof Prisma.dmmf.datamodel.models)[number];
type DmmfField = DmmfModel["fields"][number];

// ---------------------------------------------------------------------------
// スキーマに合わせてデータを整える
// ---------------------------------------------------------------------------

const MODELS = new Map(Prisma.dmmf.datamodel.models.map((m) => [m.name, m]));
const ENUMS = new Map(Prisma.dmmf.datamodel.enums.map((e) => [e.name, e.values.map((v) => v.name)]));

function fallbackFor(f: DmmfField): unknown {
  if (f.isList) return [];
  if (f.kind === "enum") return ENUMS.get(f.type)?.[0];
  switch (f.type) {
    case "String": return f.name === "category" ? "general" : "";
    case "Int": case "Float": case "Decimal": return 0;
    case "BigInt": return BigInt(0);
    case "Boolean": return false;
    case "DateTime": return new Date();
    case "Json": return {};
    default: return undefined;
  }
}

/** モデルに実在する列だけを残し、データに無い必須列は defaults → 型ごとの既定値で埋める */
function shape(model: DmmfModel, data: Row, defaults: Row = {}): Row {
  const out: Row = {};
  for (const f of model.fields) {
    if (f.kind === "object") continue; // リレーションは seed では書かない
    const v = data[f.name];
    if (v !== undefined && v !== null) {
      // enum はスキーマにある値だけ通す（無ければ既定値）
      if (f.kind === "enum") {
        const ok = ENUMS.get(f.type) ?? [];
        out[f.name] = ok.includes(String(v)) ? v : (defaults[f.name] ?? fallbackFor(f));
      } else out[f.name] = v;
    } else if (v === null && !f.isRequired) {
      out[f.name] = null;
    } else if (f.isRequired && !f.hasDefaultValue && !f.isUpdatedAt) {
      const d = defaults[f.name] ?? fallbackFor(f);
      if (d !== undefined) out[f.name] = d;
    }
  }
  return out;
}

const delegateOf = (model: string) => (prisma as unknown as Record<string, { upsert: (a: unknown) => Promise<unknown> }>)[model[0].toLowerCase() + model.slice(1)];

/** 1行 upsert（id 列名は idField）。モデルがスキーマに無ければ null を返してスキップ */
async function upsertRow(modelName: string, idField: string, data: Row, defaults: Row = {}, updateExisting = true): Promise<boolean | null> {
  const model = MODELS.get(modelName);
  const delegate = delegateOf(modelName);
  if (!model || !delegate) return null;
  const row = shape(model, data, defaults);
  const { [idField]: id, ...rest } = row;
  await delegate.upsert({ where: { [idField]: id }, create: row, update: updateExisting ? rest : {} });
  return true;
}

// ---------------------------------------------------------------------------
// 検証
// ---------------------------------------------------------------------------

function validate(): string[] {
  const problems: string[] = [];
  const dup = (label: string, ids: (string | number)[]) => {
    const seen = new Set<string | number>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`${label}: ID が重複しています → ${id}`);
      seen.add(id);
    }
  };
  dup("lessons", LESSONS.map((l) => l.lessonNo));
  dup("learning items", LESSONS.flatMap((l) => itemsOfLesson(l).map((i) => i.id)));
  dup("assessments", ASSESSMENTS.map((a) => a.id));
  dup("monsters", MONSTERS.map((m) => m.id));
  dup("shop", (shopData.shop ?? []).map((s) => s.id));
  dup("announcements", ANNOUNCEMENTS.map((a) => a.id));

  for (const l of LESSONS) {
    if (!l.title || !l.titleJa) problems.push(`lesson ${l.lessonNo}: title / titleJa が空です`);
    if (!l.school?.grade || !l.school?.topic) problems.push(`lesson ${l.lessonNo}: school.grade / school.topic が空です`);
  }
  for (const m of MONSTERS) {
    if (!m.nameEn || !m.nameJa) problems.push(`monster ${m.id}: 名前が空です`);
  }
  for (const s of shopData.shop ?? []) {
    if (!s.name || !Number.isFinite(s.price) || s.price < 0) problems.push(`shop ${s.id}: name / price が不正です`);
  }
  for (const a of ANNOUNCEMENTS) {
    if (!a.title || !a.body || Number.isNaN(Date.parse(a.date))) problems.push(`announcement ${a.id}: title / body / date が不正です`);
  }
  if (LESSONS.length === 0) problems.push("lessons が 0 件です（content/curriculum/lessons.json を確認）");
  if (MONSTERS.length !== 100) problems.push(`monsters が ${MONSTERS.length} 体です（100体のはず）`);
  return problems;
}

// ---------------------------------------------------------------------------
// 本体
// ---------------------------------------------------------------------------

async function checkConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message.split("\n").filter(Boolean).slice(-1)[0] : String(e);
    console.error([
      "✖ データベースにつながりませんでした。",
      `  ${msg}`,
      "",
      "  確認すること:",
      "   1. PostgreSQL が起動しているか（例: localhost:5432）",
      "   2. .env の DATABASE_URL が正しいか（例: postgresql://USER:PASS@localhost:5432/eigo_quest）",
      "   3. テーブルを作成済みか → npx prisma migrate dev（または npx prisma db push）",
      "",
      "  ※ アプリ自体はDBが止まっていても「おためしモード」で動きます。",
    ].join("\n"));
    return false;
  }
}

async function section(label: string, fn: () => Promise<string>): Promise<boolean> {
  try {
    console.log(`✔ ${label}: ${await fn()}`);
    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message.split("\n").filter(Boolean).slice(-3).join(" / ") : String(e);
    console.error(`✖ ${label}: ${msg}`);
    if (e instanceof Prisma.PrismaClientKnownRequestError && (e.code === "P2021" || e.code === "P2022")) {
      console.error("  → テーブル/列がありません。先に npx prisma migrate dev（または npx prisma db push）を実行してください。");
    }
    return false;
  }
}

async function main(): Promise<number> {
  const problems = validate();
  if (problems.length > 0) {
    console.error("✖ seed データに問題があります:\n" + problems.map((p) => `  - ${p}`).join("\n"));
    return 1;
  }
  if (!(await checkConnection())) return 1;

  const results = [
    await section("lessons / learning items", async () => {
      let items = 0;
      for (const l of LESSONS) {
        await upsertRow("Lesson", "lessonNo", {
          lessonNo: l.lessonNo, world: l.world, title: l.title, titleJa: l.titleJa,
          schoolGrade: l.school.grade, schoolTopic: l.school.topic, phonicsRule: l.phonics.rule,
          teacherScript: l.teacherScript, content: l as object,
        }, { category: "lesson" });
        for (const it of itemsOfLesson(l)) {
          await upsertRow("LearningItem", "id", {
            id: it.id, lessonNo: it.lessonNo, kind: it.kind, text: it.text, ja: it.ja,
            emoji: it.emoji ?? null, skills: it.skills, schoolCore: it.schoolCore,
          }, { category: it.kind.toLowerCase() });
          items++;
        }
      }
      return `${LESSONS.length} lessons, ${items} items`;
    }),

    await section("assessments", async () => {
      for (const a of ASSESSMENTS) await upsertRow("Assessment", "id", { ...a }, { category: a.kind.toLowerCase() });
      // お宝アラートのテスト結果をぶら下げる共通行（既存なら触らない）
      await upsertRow("Assessment", "id", { id: "treasure", kind: "TREASURE", rangeStart: 0, rangeEnd: 0, questionCount: 6, passRate: 0.8, unlocksLesson: null }, { category: "treasure" }, false);
      return `${ASSESSMENTS.length + 1} assessments`;
    }),

    await section("monsters", async () => {
      for (const m of MONSTERS) {
        await upsertRow("Monster", "id", { id: m.id, nameEn: m.nameEn, nameJa: m.nameJa, rarity: m.rarity, theme: m.theme, imageKey: m.imageKey }, { category: m.theme });
      }
      return `${MONSTERS.length} monsters`;
    }),

    await section("shop items", async () => {
      const shop = shopData.shop ?? [];
      for (const s of shop) await upsertRow("ShopItem", "id", { ...s }, { category: s.slot });
      return `${shop.length} items`;
    }),

    await section("announcements", async () => {
      if (!MODELS.has("Announcement")) return "スキーマに Announcement モデルが無いのでスキップ（アプリは content/announcements.json を表示します）";
      for (const a of ANNOUNCEMENTS) {
        await upsertRow("Announcement", "id", { ...a, date: new Date(a.date), publishedAt: new Date(a.date) }, { category: a.category });
      }
      return `${ANNOUNCEMENTS.length} announcements`;
    }),

    await section("demo user", async () => {
      await upsertRow("User", "id", { id: "demo-user", nickname: "ハル", schoolGrade: 3, friendCode: "DEMO-0001" }, {}, false);
      return "demo-user（ハル）";
    }),
  ];

  const failed = results.filter((ok) => !ok).length;
  console.log(failed === 0 ? "🎉 seed 完了" : `⚠ seed 完了（${failed} セクションで失敗。上のメッセージを確認してください）`);
  return failed === 0 ? 0 : 1;
}

main()
  .then((code) => { process.exitCode = code; })
  .catch((e) => { console.error("✖ seed で予期しないエラー:", e instanceof Error ? e.message : e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
