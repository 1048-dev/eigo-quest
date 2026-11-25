/**
 * run7 P-yearly: 年に1回の 力だめし（問題データ・採点・CEFR バンド・のび・受けられる 回数・サービス・API・AI 採点の まぜかた）。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeDb } from "./helpers/fakePrisma";
import stage1 from "@content/yearly/stage-1.json";
import stage2 from "@content/yearly/stage-2.json";
import stage3 from "@content/yearly/stage-3.json";
import stage4 from "@content/yearly/stage-4.json";
import stage5 from "@content/yearly/stage-5.json";
import type { SkillScores, YearlyAnswers, YearlyTest } from "@/lib/yearly/types";

const db = new FakeDb();
let dbUp = true;
let userId = "u1";
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => dbUp, markDbDown: () => {} }));
vi.mock("@/lib/auth", () => ({ currentUserId: async () => userId }));

const { validateYearlyTest, PERSONAL_INFO } = await import("@/lib/yearly/validate");
const { YEARLY_SPECS } = await import("@/lib/yearly/spec");
const scoring = await import("@/lib/yearly/scoring");
const av = await import("@/lib/yearly/availability");
const { loadYearlyTest } = await import("@/lib/yearly/catalog");
const { mergeAiScores, buildScoringRequest, buildScoringPrompt, scoreOpenTasks } = await import("@/lib/yearly/aiScoring");
const { YEARLY_RULES } = await import("@/lib/domain/config");
const service = await import("@/lib/services/yearlyService");
const statusRoute = await import("@/app/api/yearly/route");
const submitRoute = await import("@/app/api/yearly/submit/route");
const { getParentOverview, deleteUsersData } = await import("@/lib/services/parentService");

const TESTS = [stage1, stage2, stage3, stage4, stage5] as unknown as YearlyTest[];
const S = (l: number, r: number, s: number, w: number): SkillScores => ({ listening: l, reading: r, speaking: s, writing: w });
const all = (n: number) => S(n, n, n, n);

/** お手本どおりの こたえ（選ぶ 問題は 正解・話す/書くは sample） */
function modelAnswers(t: YearlyTest): YearlyAnswers {
  const choices: Record<string, number> = {};
  for (const i of [...t.listening, ...t.reading]) choices[i.id] = i.answer;
  return {
    choices,
    speaking: Object.fromEntries(t.speaking.prompts.map((p) => [p.id, p.readText ?? p.sample])),
    writingText: t.writing.kind === "words" ? undefined : t.writing.sample,
    writingWords: t.writing.kind === "words" ? t.writing.items!.map((i) => i.answer) : undefined,
  };
}
const blankAnswers = (): YearlyAnswers => ({ choices: {}, speaking: {} });

function completeLessonsUpTo(uid: string, n: number) {
  for (let i = 1; i <= n; i++) db.table("lessonProgress").push({ userId: uid, lessonNo: i, status: "COMPLETED" });
}
function addUser(id: string, opts: { trial?: boolean } = {}) {
  db.table("user").push({ id, nickname: id, friendCode: `F${id}`, isTrial: !!opts.trial, parentId: opts.trial ? null : "p1", coins: 0 });
}
const day = (s: string) => new Date(`${s}T03:00:00Z`);

// ---------------------------------------------------------------------------
describe("問題データ（5 ステージ・すべて オリジナル）", () => {
  it("ステージ 1〜5 の 問題が あり、どれも チェックに 通る", () => {
    expect(TESTS.map((t) => t.stage)).toEqual([1, 2, 3, 4, 5]);
    for (const t of TESTS) expect(validateYearlyTest(t)).toEqual([]);
  });

  it("問題の 数は docs/curriculum-6year.md §8 の とおり（聞く 10/15/20/20/25・読む 10/15/15/15/15）", () => {
    expect(TESTS.map((t) => t.listening.length)).toEqual([10, 15, 20, 20, 25]);
    expect(TESTS.map((t) => t.reading.length)).toEqual([10, 15, 15, 15, 15]);
    expect(TESTS.map((t) => t.minutes)).toEqual(YEARLY_SPECS.map((s) => s.minutes));
    expect(TESTS.map((t) => t.writing.kind)).toEqual(["words", "sentences", "email", "opinion", "opinion"]);
  });

  it("問題の id は ステージを こえて ぜんぶ ちがう", () => {
    const ids = TESTS.flatMap((t) => [...t.listening, ...t.reading, ...t.speaking.prompts].map((x) => x.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("話す・書くで 個人情報（本名・年齢・住所・学校名など）を きかない", () => {
    for (const t of TESTS) {
      for (const p of t.speaking.prompts) expect(PERSONAL_INFO.test(p.askEn), p.id).toBe(false);
      expect(PERSONAL_INFO.test(t.writing.promptEn)).toBe(false);
    }
    expect(PERSONAL_INFO.test("What is your name?")).toBe(true);
    expect(PERSONAL_INFO.test("How old are you?")).toBe(true);
  });

  it("ステージが あがるほど 英文が ながくなる（聞く・読むの 語数）", () => {
    const words = (t: YearlyTest) => [...t.listening.flatMap((i) => i.audio?.map((a) => a.en) ?? []), ...t.passages.flatMap((p) => p.lines)].join(" ").split(/\s+/).length;
    const w = TESTS.map(words);
    for (let i = 1; i < w.length; i++) expect(w[i]).toBeGreaterThan(w[i - 1]);
  });

  it("チェックは まちがいを 見つける（数・正解の 位置・日本語の まじり・個人情報）", () => {
    const t = structuredClone(TESTS[1]);
    t.listening.pop();
    t.reading[0].answer = 9;
    t.reading[1].choices[0] = "ねこ";
    t.speaking.prompts[0].askEn = "What is your name?";
    const errors = validateYearlyTest(t).join("\n");
    expect(errors).toContain("listening は 15 問");
    expect(errors).toContain("answer が 範囲の 外");
    expect(errors).toContain("日本語");
    expect(errors).toContain("個人情報");
  });

  it("問題は ステージごとに あとから 読める（別チャンク）", async () => {
    expect((await loadYearlyTest(3))?.stage).toBe(3);
    expect(await loadYearlyTest(9)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
describe("採点（聞く・読む・話す・書く）", () => {
  it("選ぶ 問題: 正解数 ÷ 問題数（こたえて いない 問題は まちがい）", () => {
    const t = TESTS[0];
    const half = Object.fromEntries(t.listening.slice(0, 5).map((i) => [i.id, i.answer]));
    const g = scoring.gradeChoices(t.listening, half);
    expect(g).toMatchObject({ correct: 5, percent: 50 });
    expect(Object.values(g.results).filter(Boolean)).toHaveLength(5);
    expect(scoring.gradeChoices([], {}).percent).toBe(0);
  });

  it("お手本どおりに こたえると どの ステージも 4 技能 ほぼ 満点（ルール採点）", () => {
    for (const t of TESTS) {
      const r = scoring.buildResult(t, modelAnswers(t), "2026-11-25");
      expect(r.scores.listening, `stage ${t.stage}`).toBe(100);
      expect(r.scores.reading).toBe(100);
      expect(r.scores.speaking, `stage ${t.stage} speaking`).toBeGreaterThanOrEqual(75);
      expect(r.scores.writing, `stage ${t.stage} writing`).toBeGreaterThanOrEqual(75);
      expect(r.gradedBy).toBe("rule");
    }
  });

  it("なにも こたえないと 0 点・いちばん 下の バンド", () => {
    for (const t of TESTS) {
      const r = scoring.buildResult(t, blankAnswers(), "2026-11-25");
      expect(r.scores).toEqual(all(0));
      expect(r.total).toBe(0);
      expect(r.band).toBe(scoring.BAND_TABLE[t.stage].at(-1)!.band);
    }
  });

  it("話す: 長さ・内容（キーワード）・文の かたちで 0〜4 点", () => {
    const p = TESTS[0].speaking.prompts.find((x) => x.kind === "question")!;
    expect(scoring.scoreSpeakingRule(p, "").score).toBe(0);
    expect(scoring.scoreSpeakingRule(p, "えっと").score).toBe(0);
    const full = scoring.scoreSpeakingRule(p, p.sample);
    expect(full.score).toBe(4);
    expect(full.max).toBe(4);
    const short = scoring.scoreSpeakingRule(p, "um");
    expect(short.score).toBeLessThan(full.score);
    expect(short.commentJa.length).toBeGreaterThan(0);
  });

  it("話す（意見）: because などの 理由が ないと 満点に ならない", () => {
    const p = TESTS[3].speaking.prompts.find((x) => x.kind === "opinion")!;
    const topic = p.keywords.find((k) => !scoring.hasReason(k))!;
    const noReason = `I think it is good. ${topic} is good for me and my friends every day at home and at school with my family.`;
    expect(scoring.hasReason(noReason)).toBe(false);
    const withReason = `${noReason} I think so because it helps us.`;
    expect(scoring.scoreSpeakingRule(p, noReason).score).toBeLessThan(scoring.scoreSpeakingRule(p, withReason).score);
  });

  it("話す（音読）: お手本の ことばが どれだけ 読めたか", () => {
    const p = TESTS[2].speaking.prompts.find((x) => x.kind === "readAloud")!;
    expect(scoring.scoreSpeakingRule(p, p.readText!).score).toBe(4);
    const half = p.readText!.split(" ").slice(0, Math.ceil(p.readText!.split(" ").length * 0.55)).join(" ");
    expect(scoring.scoreSpeakingRule(p, half).score).toBe(2);
    expect(scoring.readAloudMatch("the cat and the dog", "the dog")).toBeCloseTo(0.4);
  });

  it("キーワード: like → likes / liked / liking も みとめる。2 語の キーワードも", () => {
    expect(scoring.keywordHits("She likes apples.", ["like"])).toBe(1);
    expect(scoring.keywordHits("We played soccer.", ["play", "soccer"])).toBe(2);
    expect(scoring.keywordHits("I go there by bus.", ["by bus", "train"])).toBe(1);
  });

  it("書く（ことば）: つづり 1 つ 1 点（大文字・空白は 気にしない）", () => {
    const w = TESTS[0].writing;
    const right = w.items!.map((i) => i.answer);
    expect(scoring.scoreWritingRule(w, { writingWords: right })).toMatchObject({ score: 3, max: 3 });
    expect(scoring.scoreWritingRule(w, { writingWords: [right[0].toUpperCase() + " ", "zzz"] }).score).toBe(1);
    expect(scoring.scoreWritingRule(w, {}).score).toBe(0);
  });

  it("書く（文・意見文）: 内容・長さ・まとまり・書きかた（8 点満点）", () => {
    const w = TESTS[3].writing;
    const good = scoring.scoreWritingRule(w, { writingText: w.sample });
    expect(good.max).toBe(8);
    expect(good.score).toBeGreaterThanOrEqual(7);
    const sloppy = scoring.scoreWritingRule(w, { writingText: w.sample.toLowerCase().replace(/[.!?]/g, "") });
    expect(sloppy.score).toBeLessThan(good.score);
    const tooShort = scoring.scoreWritingRule(w, { writingText: "I like paper books." });
    expect(tooShort.score).toBeLessThanOrEqual(4);
    expect(scoring.scoreWritingRule(w, { writingText: "" }).score).toBe(0);
  });

  it("書きかた: 文の はじめの 大文字・おわりの 記号・I の 大文字", () => {
    expect(scoring.mechanicsRatio("I like dogs. They are cute.")).toBe(1);
    expect(scoring.mechanicsRatio("i like dogs")).toBeLessThan(0.4);
    expect(scoring.sentencesOf("I like dogs. They are cute! Do you")).toHaveLength(3);
  });

  it("こたえを きれいに する（ない 問題・範囲外・長すぎる こたえを おとす）", () => {
    const t = TESTS[1];
    const a = scoring.sanitizeAnswers(t, { choices: { [t.listening[0].id]: 1, nope: 2, [t.listening[1].id]: 99 }, speaking: { [t.speaking.prompts[0].id]: "x".repeat(900), zzz: "hi" } });
    expect(a.choices).toEqual({ [t.listening[0].id]: 1 });
    expect(a.speaking[t.speaking.prompts[0].id]).toHaveLength(400);
    expect(a.speaking.zzz).toBeUndefined();
    expect(scoring.sanitizeAnswers(t, null)).toEqual({ choices: {}, speaking: {}, writingText: undefined, writingWords: undefined });
  });
});

// ---------------------------------------------------------------------------
describe("合計と 推定 CEFR バンド", () => {
  it("重みは 合計 1・スピーキングが いちばん 重い", () => {
    const w = YEARLY_RULES.weights;
    expect(w.listening + w.reading + w.speaking + w.writing).toBeCloseTo(1);
    expect(Math.max(w.listening, w.reading, w.writing)).toBeLessThan(w.speaking);
    expect(scoring.weightedTotal(S(100, 0, 0, 0))).toBe(25);
    expect(scoring.weightedTotal(S(0, 0, 100, 0))).toBe(30);
    expect(scoring.weightedTotal(all(80))).toBe(80);
  });

  it("ステージごとの 表（ねらいの バンドと 先どり）", () => {
    expect(scoring.estimateBand(1, all(100))).toBe("A1+");
    expect(scoring.estimateBand(1, all(70))).toBe("A1");
    expect(scoring.estimateBand(1, all(40))).toBe("Pre-A1");
    expect(scoring.estimateBand(2, all(90))).toBe("A2");
    expect(scoring.estimateBand(2, all(60))).toBe("A1+");
    expect(scoring.estimateBand(2, all(59))).toBe("A1");
    expect(scoring.estimateBand(3, all(70))).toBe("A2");
    expect(scoring.estimateBand(4, all(85))).toBe("B1");
    expect(scoring.estimateBand(4, all(60))).toBe("A2+");
    expect(scoring.estimateBand(5, all(80))).toBe("B1+");
    expect(scoring.estimateBand(5, all(95))).toBe("B2");
    expect(scoring.estimateBand(5, all(60))).toBe("B1");
  });

  it("さかいめ ちょうど（min 以上）で その バンド", () => {
    for (const [stage, table] of Object.entries(scoring.BAND_TABLE)) {
      for (const row of table) {
        if (row.min === 0) continue;
        expect(scoring.estimateBand(Number(stage), all(row.min)), `${stage}:${row.band}`).toBe(row.band);
      }
    }
  });

  it("点数が 上がって バンドが 下がる ことは ない（どの ステージも）", () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      let prev = -1;
      for (let n = 0; n <= 100; n += 5) {
        const i = scoring.bandIndex(scoring.estimateBand(stage, all(n)));
        expect(i).toBeGreaterThanOrEqual(prev);
        prev = i;
      }
    }
  });

  it("いちばん上の バンドは 話す 力も ないと とどかない", () => {
    // 合計は 先どりの 線を こえていても スピーキングが 低い
    const s = S(100, 100, YEARLY_RULES.speakingTopBandMin - 1, 100);
    expect(scoring.weightedTotal(s)).toBeGreaterThanOrEqual(85);
    expect(scoring.estimateBand(4, s)).toBe("A2+");
    expect(scoring.estimateBand(4, S(100, 100, YEARLY_RULES.speakingTopBandMin, 100))).toBe("B1");
  });

  it("話す 力が とても 低いと 1 段 さがる（下の はしより 下には ならない）", () => {
    const s = S(90, 90, YEARLY_RULES.speakingLowDrop - 1, 90);
    // 合計 70 → ふつうなら A2、話す力が 低いので A1+
    expect(scoring.weightedTotal(s)).toBe(70);
    expect(scoring.estimateBand(3, s)).toBe("A1+");
    expect(scoring.estimateBand(3, S(10, 10, 0, 10))).toBe("A1");
  });

  it("バンドは CEFR の はしごの 中・ステージが 上がるほど 上の バンドまで とどく", () => {
    for (const table of Object.values(scoring.BAND_TABLE)) for (const row of table) expect(scoring.bandIndex(row.band)).toBeGreaterThanOrEqual(0);
    const tops = [1, 2, 3, 4, 5].map((s) => scoring.bandIndex(scoring.estimateBand(s, all(100))));
    for (let i = 1; i < tops.length; i++) expect(tops[i]).toBeGreaterThan(tops[i - 1]);
    // 約束（小6 で A2〜B1）: ステージ5 の ねらいどおり（55 点）で B1
    expect(scoring.estimateBand(5, all(55))).toBe("B1");
  });

  it("どの バンドにも 保護者向けの めやすが ある", () => {
    for (const b of scoring.BAND_LADDER) {
      expect(scoring.BAND_EIKEN_JA[b]).toBeTruthy();
      expect(scoring.BAND_CAN_DO_JA[b]).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
describe("ちから スコアと のび", () => {
  it("(ステージ − 1) × 150 ＋ 点数 × 2。となりの ステージと かさなる", () => {
    expect(scoring.scaledScore(1, 0)).toBe(0);
    expect(scoring.scaledScore(1, 100)).toBe(200);
    expect(scoring.scaledScore(2, 25)).toBe(200);
    expect(scoring.scaledScore(5, 100)).toBe(800);
    expect(scoring.scaledScore(3, 150)).toBe(scoring.scaledScore(3, 100));
  });

  it("ステージが ちがっても のびを くらべられる", () => {
    const t1 = TESTS[0];
    const prev = scoring.buildResult(t1, modelAnswers(t1), "2025-11-25");
    const t2 = TESTS[1];
    const half: YearlyAnswers = { ...modelAnswers(t2), speaking: {}, writingText: "" };
    const cur = scoring.buildResult(t2, half, "2026-11-25");
    const g = scoring.growthBetween(prev, cur);
    expect(g.previousStage).toBe(1);
    expect(g.previousTakenOn).toBe("2025-11-25");
    expect(g.delta.listening).toBe(cur.scaled.listening - prev.scaled.listening);
    expect(g.delta.listening).toBe(150); // 200 → 350
    expect(g.delta.speaking).toBeLessThan(0);
    expect(g.bandSteps).toBe(scoring.bandIndex(cur.band) - scoring.bandIndex(prev.band));
  });
});

// ---------------------------------------------------------------------------
describe("どの ステージを 受けるか・1 年に 1 回", () => {
  it("そのステージに 入って 60 レッスン（2 ワールド）すすんだら その ステージ", () => {
    expect([0, 200, 360, 400, 419].map(av.testStageFor)).toEqual([1, 1, 1, 1, 1]);
    expect([420, 600, 659].map(av.testStageFor)).toEqual([2, 2, 2]);
    expect([660, 800, 899].map(av.testStageFor)).toEqual([3, 3, 3]);
    expect([900, 1000, 1109].map(av.testStageFor)).toEqual([4, 4, 4]);
    expect([1110, 1200, 5000].map(av.testStageFor)).toEqual([5, 5, 5]);
    expect(av.testStageFor(Number.NaN)).toBe(1);
    expect(av.stageFirstLesson(2)).toBe(361);
    expect(av.stageFirstLesson(5)).toBe(1051);
  });

  it("週5 の 子の 年度末（§5-1）: 小1=ステージ1・小2=ステージ1 の 仕上げ・小3=2・小4=3・小5=4・小6=5", () => {
    expect([200, 400, 600, 800, 1000, 1200].map(av.testStageFor)).toEqual([1, 1, 2, 3, 4, 5]);
  });

  it("1 年後の 同じ日（うるう日は 3/1）", () => {
    expect(av.oneYearAfter("2026-11-25")).toBe("2027-11-25");
    expect(av.oneYearAfter("2028-02-29")).toBe("2029-03-01");
    expect(av.oneYearAfter("bad")).toBe("bad");
  });

  it("受けた ことが なければ 受けられる。1 年 たつまでは まつ", () => {
    expect(av.yearlyAvailability({ isTrial: false, takenDays: [], today: "2026-11-25" })).toEqual({ available: true });
    expect(av.yearlyAvailability({ isTrial: false, takenDays: ["2026-03-10"], today: "2026-11-25" })).toEqual({ available: false, reason: "WAIT", nextOn: "2027-03-10" });
    expect(av.yearlyAvailability({ isTrial: false, takenDays: ["2026-03-10"], today: "2027-03-09" }).available).toBe(false);
    expect(av.yearlyAvailability({ isTrial: false, takenDays: ["2026-03-10"], today: "2027-03-10" })).toEqual({ available: true });
    // いちばん あたらしい 日で きめる
    expect(av.yearlyAvailability({ isTrial: false, takenDays: ["2026-03-10", "2025-02-01"], today: "2026-12-01" })).toMatchObject({ nextOn: "2027-03-10" });
  });

  it("おためしは 1 回だけ（1 年 たっても）", () => {
    expect(av.yearlyAvailability({ isTrial: true, takenDays: [], today: "2026-11-25" })).toEqual({ available: true });
    expect(av.yearlyAvailability({ isTrial: true, takenDays: ["2020-01-01"], today: "2026-11-25" })).toEqual({ available: false, reason: "TRIAL_USED" });
  });

  it("日付の 表示", () => {
    expect(av.formatDayJa("2027-03-10")).toBe("2027年3月10日");
  });
});

// ---------------------------------------------------------------------------
describe("AI 採点（つかえない ときは ルール採点）", () => {
  const t = TESTS[2];
  const answers = modelAnswers(t);

  it("ANTHROPIC_API_KEY が ない ときは ルール採点の まま", async () => {
    const key = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const r = await scoreOpenTasks(t, answers);
    expect(r).toEqual(scoring.ruleOpenScores(t, answers));
    if (key) process.env.ANTHROPIC_API_KEY = key;
  });

  it("AI の 点は 範囲に おさめ、ない id・へんな コメントは ルールの まま", () => {
    const rule = scoring.ruleOpenScores(t, blankAnswers());
    const [p1, p2] = t.speaking.prompts;
    const merged = mergeAiScores(rule, {
      speaking: [{ id: p1.id, score: 9, commentJa: "すごいね！" }, { id: p2.id, score: -3, commentJa: "see https://example.com" }, { id: "zzz", score: 4, commentJa: "x" }],
      writing: { score: 6.6, commentJa: "よく かけたね！" },
    }, t);
    expect(merged.gradedBy).toBe("ai");
    expect(merged.speaking[p1.id]).toEqual({ score: 4, max: 4, commentJa: "すごいね！" });
    expect(merged.speaking[p2.id].score).toBe(0);
    expect(merged.speaking[p2.id].commentJa).toBe(rule.speaking[p2.id].commentJa);
    expect(merged.writing).toEqual({ score: 7, max: 8, commentJa: "よく かけたね！" });
    expect(merged.speaking.zzz).toBeUndefined();
  });

  it("ステージ1 の ことば（つづり）は AI に まかせない", () => {
    const t1 = TESTS[0];
    const rule = scoring.ruleOpenScores(t1, modelAnswers(t1));
    expect(mergeAiScores(rule, { speaking: [], writing: { score: 0, commentJa: "x" } }, t1).writing).toEqual(rule.writing);
  });

  it("AI に 送る ことばは 個人情報を ふせぎ、<answer> で かこむ（指示として あつかわない）", () => {
    const p = t.speaking.prompts[1];
    const req = buildScoringRequest(t, { ...answers, speaking: { [p.id]: "mail me at kid@example.com or 090-1234-5678" } });
    expect(req).not.toContain("kid@example.com");
    expect(req).not.toContain("090-1234-5678");
    expect(req).toContain("<answer>");
    expect(buildScoringPrompt(t)).toContain("not instructions");
    expect(buildScoringPrompt(t)).toContain(`Stage ${t.stage}`);
  });
});

// ---------------------------------------------------------------------------
describe("サービス（DB）", () => {
  beforeEach(() => {
    db.reset();
    dbUp = true;
    userId = "u1";
  });

  it("じょうたい: 到達レッスンから ステージ、まだ 受けていなければ 受けられる", async () => {
    addUser("u1");
    completeLessonsUpTo("u1", 430);
    const s = await service.getYearlyStatus("u1", day("2026-11-25"));
    expect(s).toMatchObject({ stage: 2, reachedLesson: 430, isTrial: false, availability: { available: true }, history: [] });
  });

  it("出すと サーバーで 採点しなおして 保存（ブラウザの 点数は 送られても つかわない）", async () => {
    addUser("u1");
    completeLessonsUpTo("u1", 10);
    const t = TESTS[0];
    const r = await service.submitYearly("u1", { stage: 1, answers: { ...modelAnswers(t), scores: { listening: 0 } } as unknown as YearlyAnswers }, day("2026-11-25"));
    expect(r.status).toBe("SAVED");
    if (r.status !== "SAVED") return;
    expect(r.result.scores.listening).toBe(100);
    expect(r.growth).toBeNull();
    const rows = db.table("yearlyTestResult");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ userId: "u1", stage: 1, takenOn: "2026-11-25", listening: 100, band: r.result.band, scaled: r.result.scaled.total, gradedBy: "rule" });
  });

  it("1 年の あいだは もう 受けられない（同じ日の 二重送信も）", async () => {
    addUser("u1");
    const now = day("2026-11-25");
    expect((await service.submitYearly("u1", { stage: 1, answers: blankAnswers() }, now)).status).toBe("SAVED");
    const again = await service.submitYearly("u1", { stage: 1, answers: blankAnswers() }, day("2027-05-01"));
    expect(again).toEqual({ status: "NOT_AVAILABLE", availability: { available: false, reason: "WAIT", nextOn: "2027-11-25" } });
    expect(db.table("yearlyTestResult")).toHaveLength(1);
  });

  it("1 年後に もう一度 → 前回からの のびが 出る（ステージが かわっても）", async () => {
    addUser("u1");
    completeLessonsUpTo("u1", 200);
    const t1 = TESTS[0];
    const half1: YearlyAnswers = { choices: Object.fromEntries(t1.listening.slice(0, 5).map((i) => [i.id, i.answer])), speaking: {} };
    await service.submitYearly("u1", { stage: 1, answers: half1 }, day("2025-11-20"));
    for (let i = 201; i <= 450; i++) db.table("lessonProgress").push({ userId: "u1", lessonNo: i, status: "COMPLETED" });
    const t2 = TESTS[1];
    const r = await service.submitYearly("u1", { stage: 2, answers: modelAnswers(t2) }, day("2026-11-20"));
    expect(r.status).toBe("SAVED");
    if (r.status !== "SAVED") return;
    expect(r.growth).toMatchObject({ previousTakenOn: "2025-11-20", previousStage: 1 });
    expect(r.growth!.delta.total).toBeGreaterThan(0);
    expect(r.growth!.delta.listening).toBe(scoring.scaledScore(2, 100) - scoring.scaledScore(1, 50));
    const child = await service.getChildYearly("u1", day("2026-11-21"));
    expect(child).toMatchObject({ count: 2, nextOn: "2027-11-20", latest: { stage: 2, takenOn: "2026-11-20" } });
    expect(child!.growth!.delta.total).toBe(r.growth!.delta.total);
  });

  it("ステージが かわっていたら 保存しない（画面を 読みなおす）", async () => {
    addUser("u1");
    completeLessonsUpTo("u1", 430);
    expect(await service.submitYearly("u1", { stage: 1, answers: blankAnswers() }, day("2026-11-25"))).toEqual({ status: "STAGE_CHANGED", stage: 2 });
    expect(db.table("yearlyTestResult")).toHaveLength(0);
  });

  it("おためしの 学習者は 1 回だけ", async () => {
    addUser("t1", { trial: true });
    expect((await service.submitYearly("t1", { stage: 1, answers: blankAnswers() }, day("2026-11-25"))).status).toBe("SAVED");
    const later = await service.submitYearly("t1", { stage: 1, answers: blankAnswers() }, day("2028-01-01"));
    expect(later).toEqual({ status: "NOT_AVAILABLE", availability: { available: false, reason: "TRIAL_USED" } });
    expect((await service.getYearlyStatus("t1", day("2028-01-01"))).isTrial).toBe(true);
  });

  it("保存する こたえは 個人情報を ふせぐ", async () => {
    addUser("u1");
    const t = TESTS[0];
    const p = t.speaking.prompts[0];
    await service.submitYearly("u1", { stage: 1, answers: { choices: {}, speaking: { [p.id]: "I like cats. my mail is kid@example.com" } } }, day("2026-11-25"));
    const detail = db.table("yearlyTestResult")[0].detail as { speaking: Record<string, { text: string }> };
    expect(detail.speaking[p.id].text).not.toContain("kid@example.com");
    expect(detail.speaking[p.id].text).toContain("I like cats.");
  });

  it("保護者ページ: 子どもごとの さいしんの 結果（まだ なら null）", async () => {
    db.table("parent").push({ id: "p1", settings: {} });
    addUser("u1");
    addUser("u2");
    await service.submitYearly("u1", { stage: 1, answers: modelAnswers(TESTS[0]) }, day("2026-11-25"));
    const overview = await getParentOverview("p1", day("2026-11-26"));
    const u1 = overview.find((c) => c.id === "u1")!;
    const u2 = overview.find((c) => c.id === "u2")!;
    expect(u1.yearly).toMatchObject({ count: 1, growth: null, nextOn: "2027-11-25", latest: { stage: 1, scores: { listening: 100, reading: 100 } } });
    expect(u2.yearly).toBeNull();
  });

  it("子どもを 消すと 力だめしの 結果も 消える", async () => {
    addUser("u1");
    await service.submitYearly("u1", { stage: 1, answers: blankAnswers() }, day("2026-11-25"));
    await deleteUsersData(db.client() as never, ["u1"]);
    expect(db.table("yearlyTestResult")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
describe("API", () => {
  beforeEach(() => {
    db.reset();
    dbUp = true;
    userId = "u1";
  });
  const post = (body: unknown) => submitRoute.POST(new Request("http://x/api/yearly/submit", { method: "POST", body: JSON.stringify(body) }), {});

  it("GET /api/yearly: じょうたい。DB が 止まっていれば offline", async () => {
    addUser("u1");
    const res = await statusRoute.GET(new Request("http://x/api/yearly"), {});
    expect(await res.json()).toMatchObject({ success: true, stage: 1, isTrial: false, availability: { available: true }, history: [] });
    dbUp = false;
    expect(await (await statusRoute.GET(new Request("http://x/api/yearly"), {})).json()).toMatchObject({ success: true, offline: true, stage: 1 });
  });

  it("POST /api/yearly/submit: 保存 → 2 回目は 409", async () => {
    addUser("u1");
    const t = TESTS[0];
    const res = await post({ stage: 1, answers: modelAnswers(t) });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, saved: true, result: { stage: 1, scores: { listening: 100 } }, growth: null });
    const again = await post({ stage: 1, answers: modelAnswers(t) });
    expect(again.status).toBe(409);
    expect((await again.json()).code).toBe("WAIT");
  });

  it("POST: こわれた ボディでも 500 に ならない", async () => {
    addUser("u1");
    const res = await submitRoute.POST(new Request("http://x/api/yearly/submit", { method: "POST", body: "{oops" }), {});
    expect(res.status).toBe(200);
    expect((await res.json()).result.total).toBe(0);
  });

  it("POST: DB が 止まっていたら ルール採点だけ して saved:false", async () => {
    dbUp = false;
    const t = TESTS[2];
    const res = await post({ stage: 3, answers: modelAnswers(t) });
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, saved: false, result: { stage: 3, scores: { listening: 100, reading: 100 }, gradedBy: "rule" } });
    expect(db.table("yearlyTestResult")).toHaveLength(0);
  });
});
