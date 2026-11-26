/**
 * run7 P-library: えいごの としょかん（データ・解放・採点・1日1回の ごほうび・API）。
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FakeDb } from "./helpers/fakePrisma";
import stories1 from "@content/library/stories-1.json";
import stories2 from "@content/library/stories-2.json";
import stories3 from "@content/library/stories-3.json";
import stories4 from "@content/library/stories-4.json";
import stories5 from "@content/library/stories-5.json";
import chantsRaw from "@content/library/chants.json";
import talkRaw from "@content/library/talk.json";
import indexRaw from "@content/library/index.json";
import type { Chant, Story, TalkTheme } from "@/lib/library/types";

const db = new FakeDb();
let dbUp = true;
let userId = "u1";
vi.mock("@/lib/db", () => ({ prisma: db.client(), isDbUp: async () => dbUp, markDbDown: () => {} }));
vi.mock("@/lib/auth", () => ({ currentUserId: async () => userId }));

const rules = await import("@/lib/library/rules");
const { buildLibraryIndex } = await import("@/lib/library/buildIndex");
const { LIBRARY_INDEX, loadStory, loadChant, loadTalkTheme, metaOf } = await import("@/lib/library/catalog");
const { rewardForLibrary } = await import("@/lib/domain/coins");
const { COIN_RULES, LIBRARY_RULES } = await import("@/lib/domain/config");
const service = await import("@/lib/services/libraryService");
const statusRoute = await import("@/app/api/library/route");
const rewardRoute = await import("@/app/api/library/reward/route");
const talkRoute = await import("@/app/api/library/talk/route");
const { buildSystemPrompt, levelGuide } = await import("@/lib/conversation/aiConversation");
const { themeConversation } = await import("@/lib/library/talk");

const STORIES = [stories1, stories2, stories3, stories4, stories5].flatMap((f) => f.stories as Story[]);
const CHANTS = chantsRaw.chants as Chant[];
const TALKS = talkRaw.themes as TalkTheme[];

/** その おはなしの 正解の 答え */
const rightAnswers = (s: Story) => s.questions.map((q) => q.answer);
const wrongAnswers = (s: Story) => s.questions.map((q) => (q.answer + 1) % q.choices.length);

function completeLessonsUpTo(uid: string, n: number) {
  for (let i = 1; i <= n; i++) db.table("lessonProgress").push({ userId: uid, lessonNo: i, status: "COMPLETED" });
}

describe("としょかんの データ", () => {
  it("おはなしは ステージ1〜5 で 100話（20話ずつ）", () => {
    expect(STORIES).toHaveLength(100);
    for (const stage of [1, 2, 3, 4, 5]) expect(STORIES.filter((s) => s.stage === stage)).toHaveLength(20);
    // ファイルの stage と 中身の stage が あう（loadStoryStage が 正しい チャンクを ひらく）
    for (const [i, f] of [stories1, stories2, stories3, stories4, stories5].entries()) expect(f.stories.every((s) => s.stage === i + 1)).toBe(true);
  });

  it("チャンツは ステージ3〜5 にも 4曲ずつ（ぜんぶで 28曲）", () => {
    expect(CHANTS).toHaveLength(28);
    for (const stage of [3, 4, 5]) expect(CHANTS.filter((c) => c.stage === stage)).toHaveLength(4);
  });

  it("ステージ3〜5 の おはなしの レベル（CEFR）は ワールドの レベルと あう", () => {
    const allowed: Record<number, string[]> = { 3: ["A2", "A2+"], 4: ["A2+", "B1"], 5: ["B1", "B1+"] };
    for (const s of STORIES.filter((x) => x.stage >= 3)) expect(allowed[s.stage]).toContain(s.level);
  });

  it("どの おはなしも チェックに 通る（3問・3択・正解の 位置・英語と 日本語・解放レッスンの 範囲）", () => {
    expect(STORIES.flatMap(rules.validateStory)).toEqual([]);
    for (const s of STORIES) expect(s.questions).toHaveLength(3);
  });

  it("チャンツと フリートークの テーマも チェックに 通る（個人情報を きかない）", () => {
    expect(CHANTS.flatMap(rules.validateChant)).toEqual([]);
    expect(TALKS.flatMap(rules.validateTalkTheme)).toEqual([]);
    expect(CHANTS.length).toBeGreaterThanOrEqual(12);
    expect(TALKS.length).toBeGreaterThanOrEqual(8);
  });

  it("id は ぜんぶ ちがう", () => {
    const ids = [...STORIES, ...CHANTS, ...TALKS].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("正解の 位置が かたよらない（どの 位置も 25% 以上）", () => {
    const pos = [0, 0, 0];
    for (const s of STORIES) for (const q of s.questions) pos[q.answer]++;
    for (const p of pos) expect(p / (STORIES.length * 3)).toBeGreaterThan(0.25);
  });

  it("ステージの 中では レベルが すすむほど 本文が ながくなる（さいしょの 5話 < さいごの 5話）", () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      const list = STORIES.filter((s) => s.stage === stage).sort((a, b) => a.unlockLesson - b.unlockLesson);
      const avg = (xs: Story[]) => xs.reduce((n, s) => n + rules.storyWordCount(s), 0) / xs.length;
      expect(avg(list.slice(0, 5))).toBeLessThan(avg(list.slice(-5)));
    }
  });

  it("索引（index.json）は 本文から 作ったものと 同じ（npm run library:index わすれ を 見つける）", () => {
    expect(indexRaw).toEqual(buildLibraryIndex(STORIES, CHANTS, TALKS));
  });

  it("索引は 小さく、本文を ふくまない（ブラウザに カリキュラムを まとめて 送らない）", () => {
    const text = JSON.stringify(indexRaw);
    expect(text.length).toBeLessThan(50_000);
    expect(text).not.toContain("\"lines\"");
    expect(text).not.toContain("\"questions\"");
  });

  it("本文は あとから 読める（ステージごとの チャンク）", async () => {
    expect((await loadStory("s1-01"))?.title).toBe("Hello, Birimo!");
    expect((await loadStory("s2-20"))?.stage).toBe(2);
    for (const id of ["s3-01", "s4-10", "s5-20"]) expect((await loadStory(id))?.questions).toHaveLength(3);
    expect(await loadStory("nope")).toBeNull();
    expect((await loadChant("c-01"))?.lines.length).toBeGreaterThan(0);
    expect((await loadTalkTheme("t-food"))?.character).toBe("birimo");
    expect(metaOf("story", "s1-05")?.unlockLesson).toBe(20);
    expect(metaOf("talk", "zzz")).toBeNull();
  });
});

describe("解放（到達レッスン）", () => {
  it("到達レッスン = クリアした いちばん先の レッスン", () => {
    expect(rules.reachedLessonFrom([])).toBe(0);
    expect(rules.reachedLessonFrom([1, 2, 30, 7])).toBe(30);
    expect(rules.reachedLessonFrom([Number.NaN, -3, 1.5])).toBe(0);
  });

  it("unlockLesson 0 は さいしょから、それ以外は その レッスンを クリアしたら", () => {
    expect(rules.isUnlocked({ unlockLesson: 0 }, 0)).toBe(true);
    expect(rules.isUnlocked({ unlockLesson: 20 }, 19)).toBe(false);
    expect(rules.isUnlocked({ unlockLesson: 20 }, 20)).toBe(true);
  });

  it("はじめての子（Lesson 0）でも おはなしと チャンツが ある", () => {
    expect(LIBRARY_INDEX.stories.filter((s) => rules.isUnlocked(s, 0)).length).toBeGreaterThanOrEqual(1);
    expect(LIBRARY_INDEX.chants.filter((c) => rules.isUnlocked(c, 0)).length).toBeGreaterThanOrEqual(1);
  });

  it("ステージ1 を おえる（L360）と ステージ2 の さいしょの おはなしが ひらく。L600 で ステージ2 まで ぜんぶ", () => {
    expect(LIBRARY_INDEX.stories.filter((s) => rules.isUnlocked(s, 359)).every((s) => s.stage === 1)).toBe(true);
    expect(rules.isUnlocked(LIBRARY_INDEX.stories.find((s) => s.id === "s2-01")!, 360)).toBe(true);
    expect(LIBRARY_INDEX.stories.filter((s) => s.stage <= 2).every((s) => rules.isUnlocked(s, 600))).toBe(true);
  });

  it("ステージ3〜5 は レベルで ひらく（L599 では まだ、L600・L840・L1050 で それぞれの さいしょ、L1200 で ぜんぶ）", () => {
    const meta = (id: string) => LIBRARY_INDEX.stories.find((s) => s.id === id)!;
    expect(LIBRARY_INDEX.stories.filter((s) => rules.isUnlocked(s, 599)).every((s) => s.stage <= 2)).toBe(true);
    expect(rules.isUnlocked(meta("s3-01"), 600)).toBe(true);
    expect(rules.isUnlocked(meta("s3-02"), 600)).toBe(false);
    expect(LIBRARY_INDEX.stories.filter((s) => rules.isUnlocked(s, 839)).every((s) => s.stage <= 3)).toBe(true);
    expect(rules.isUnlocked(meta("s4-01"), 840)).toBe(true);
    expect(LIBRARY_INDEX.stories.filter((s) => rules.isUnlocked(s, 1049)).every((s) => s.stage <= 4)).toBe(true);
    expect(rules.isUnlocked(meta("s5-01"), 1050)).toBe(true);
    expect(LIBRARY_INDEX.stories.every((s) => rules.isUnlocked(s, 1200))).toBe(true);
    expect(LIBRARY_INDEX.chants.every((c) => rules.isUnlocked(c, 1200))).toBe(true);
    expect(rules.recommendedStory(LIBRARY_INDEX.stories, 1000)?.stage).toBe(4);
  });

  it("フリートークは Lesson 90（ステージ1 の ワールド4）から", () => {
    expect(LIBRARY_RULES.freeTalkUnlockLesson).toBe(90);
    const food = LIBRARY_INDEX.talks.find((t) => t.id === "t-food")!;
    expect(rules.isTalkUnlocked(food, 89)).toBe(false);
    expect(rules.isTalkUnlocked(food, 90)).toBe(true);
    // テーマの unlockLesson が 90 より 小さくても 90 まで ひらかない
    expect(rules.isTalkUnlocked({ unlockLesson: 0 }, 50)).toBe(false);
  });

  it("つぎに ひらく もの・おすすめ（まだ よんでいない いちばん あたらしい おはなし）", () => {
    expect(rules.nextToUnlock(LIBRARY_INDEX.stories, 0)?.id).toBe("s1-02");
    expect(rules.nextToUnlock(LIBRARY_INDEX.stories, 1000)?.id).toBe("s4-17");
    expect(rules.nextToUnlock(LIBRARY_INDEX.stories, 1200)).toBeNull();
    expect(rules.recommendedStory(LIBRARY_INDEX.stories, 12)?.id).toBe("s1-03");
    expect(rules.recommendedStory(LIBRARY_INDEX.stories, 12, new Set(["s1-03"]))?.id).toBe("s1-02");
    // ぜんぶ よんでいたら いちばん あたらしい ものを もう一回
    expect(rules.recommendedStory(LIBRARY_INDEX.stories, 12, new Set(["s1-01", "s1-02", "s1-03"]))?.id).toBe("s1-03");
  });
});

describe("おはなしの クイズ と ごほうびの ルール", () => {
  const s = STORIES[0];

  it("3問中 2問 以上 正解で 合格", () => {
    expect(rules.gradeStory(s, rightAnswers(s))).toMatchObject({ correct: 3, total: 3, passed: true });
    const two = rightAnswers(s); two[0] = wrongAnswers(s)[0];
    expect(rules.gradeStory(s, two)).toMatchObject({ correct: 2, passed: true, results: [false, true, true] });
    const one = wrongAnswers(s); one[2] = s.questions[2].answer;
    expect(rules.gradeStory(s, one)).toMatchObject({ correct: 1, passed: false });
  });

  it("足りない・へんな 答えは まちがい（例外に しない）", () => {
    expect(rules.gradeStory(s, [])).toMatchObject({ correct: 0, passed: false });
    expect(rules.gradeStory(s, ["0", null, 99])).toMatchObject({ correct: 0, passed: false });
  });

  it("やりきった の 判定（おはなし: 合格・チャンツ: さいごまで・フリートーク: 3回 以上）", () => {
    expect(rules.isActivityComplete({ kind: "story", id: s.id, answers: rightAnswers(s) }, s)).toBe(true);
    expect(rules.isActivityComplete({ kind: "story", id: s.id, answers: rightAnswers(s) }, null)).toBe(false);
    expect(rules.isActivityComplete({ kind: "chant", id: "c-01", finished: true })).toBe(true);
    expect(rules.isActivityComplete({ kind: "chant", id: "c-01", finished: false })).toBe(false);
    expect(rules.isActivityComplete({ kind: "talk", id: "t-food", turns: 2 })).toBe(false);
    expect(rules.isActivityComplete({ kind: "talk", id: "t-food", turns: 3 })).toBe(true);
  });

  it("ごほうびは 1日1回 5コイン", () => {
    expect(COIN_RULES.libraryDaily).toBe(5);
    expect(rewardForLibrary({ completed: true, alreadyRewardedToday: false })).toMatchObject({ total: 5, coins: [{ reason: "LIBRARY_DAILY" }] });
    expect(rewardForLibrary({ completed: true, alreadyRewardedToday: true }).total).toBe(0);
    expect(rewardForLibrary({ completed: false, alreadyRewardedToday: false }).total).toBe(0);
  });
});

describe("読み上げの ハイライト（ことばの 位置）", () => {
  it("ことばに わけ、boundary の 位置から 何番目か わかる", () => {
    const r = rules.wordRanges("\"Hello! I'm Haru.\"");
    expect(r.map((w) => w.word)).toEqual(["\"Hello!", "I'm", "Haru.\""]);
    expect(rules.wordIndexAt(r, 0)).toBe(0);
    expect(rules.wordIndexAt(r, 8)).toBe(1);
    expect(rules.wordIndexAt(r, 12)).toBe(2);
    expect(rules.wordIndexAt(r, 999)).toBe(2);
    expect(rules.wordIndexAt([], 3)).toBe(-1);
  });

  it("タップした ことばは 記号を とって 読む", () => {
    expect(rules.bareWord("\"Hello!")).toBe("Hello");
    expect(rules.bareWord("I'm")).toBe("I'm");
    expect(rules.bareWord("...")).toBe("");
  });

  it("時間の 見つもり: ことばの 数だけ、ゆっくり だと ながく、文の おわりは 間が ある", () => {
    const t = "One cat sits on a box. Two cats come.";
    const d1 = rules.estimateWordDurations(t, 1);
    expect(d1).toHaveLength(rules.wordRanges(t).length);
    const slow = rules.estimateWordDurations(t, 0.75);
    expect(slow.reduce((a, b) => a + b)).toBeGreaterThan(d1.reduce((a, b) => a + b));
    expect(d1[5]).toBeGreaterThan(d1[4]); // "box." は 文の おわり
  });
});

describe("サービス: 1日1回の ごほうび（DB）", () => {
  beforeEach(() => { db.reset(); dbUp = true; userId = "u1"; db.table("user").push({ id: "u1", coins: 0, totalCoinsEarned: 0 }); });
  const s105 = STORIES.find((s) => s.id === "s1-05")!; // unlock 20
  const day1 = new Date("2026-11-20T03:00:00Z");
  const day2 = new Date("2026-11-21T03:00:00Z");

  it("到達レッスンは クリアした いちばん先の レッスン（とちゅうの レッスンは 数えない）", async () => {
    completeLessonsUpTo("u1", 12);
    db.table("lessonProgress").push({ userId: "u1", lessonNo: 13, status: "IN_PROGRESS" });
    db.table("lessonProgress").push({ userId: "u2", lessonNo: 200, status: "COMPLETED" });
    expect(await service.getReachedLesson("u1")).toBe(12);
  });

  it("ひらいていない おはなしは LOCKED（コインなし）", async () => {
    completeLessonsUpTo("u1", 19);
    expect(await service.claimLibraryReward("u1", { kind: "story", id: s105.id, answers: rightAnswers(s105) }, day1)).toEqual({ status: "LOCKED", unlockLesson: 20 });
    expect(db.table("coinLedger")).toHaveLength(0);
  });

  it("クイズが 1問しか あっていない → NOT_COMPLETE。2問 以上 → 5コイン。同じ日の 2回目は ALREADY_TODAY。つぎの日は また もらえる", async () => {
    completeLessonsUpTo("u1", 20);
    const one = wrongAnswers(s105); one[0] = s105.questions[0].answer;
    expect((await service.claimLibraryReward("u1", { kind: "story", id: s105.id, answers: one }, day1)).status).toBe("NOT_COMPLETE");
    expect(await service.claimLibraryReward("u1", { kind: "story", id: s105.id, answers: rightAnswers(s105) }, day1)).toMatchObject({ status: "AWARDED", coins: 5 });
    expect((await service.claimLibraryReward("u1", { kind: "chant", id: "c-01", finished: true }, day1)).status).toBe("ALREADY_TODAY");
    expect(db.table("user")[0]).toMatchObject({ coins: 5, totalCoinsEarned: 5 });
    expect(db.table("coinLedger")[0]).toMatchObject({ reason: "LIBRARY_DAILY", amount: 5, refType: "library-story", refId: "s1-05", idempotencyKey: "u1:library:2026-11-20" });
    expect(await service.isLibraryRewardedToday("u1", day1)).toBe(true);
    expect(await service.isLibraryRewardedToday("u1", day2)).toBe(false);
    expect((await service.claimLibraryReward("u1", { kind: "chant", id: "c-01", finished: true }, day2)).status).toBe("AWARDED");
    expect(db.table("user")[0]).toMatchObject({ coins: 10 });
  });

  it("フリートーク: Lesson 90 まで LOCKED、3回 以上 話したら ごほうび", async () => {
    completeLessonsUpTo("u1", 89);
    expect((await service.claimLibraryReward("u1", { kind: "talk", id: "t-food", turns: 6 }, day1)).status).toBe("LOCKED");
    completeLessonsUpTo("u1", 90);
    expect((await service.claimLibraryReward("u1", { kind: "talk", id: "t-food", turns: 2 }, day1)).status).toBe("NOT_COMPLETE");
    expect((await service.claimLibraryReward("u1", { kind: "talk", id: "t-food", turns: 3 }, day1)).status).toBe("AWARDED");
  });

  it("ない id は NOT_FOUND", async () => {
    expect((await service.claimLibraryReward("u1", { kind: "story", id: "s9-99", answers: [] }, day1)).status).toBe("NOT_FOUND");
  });

  it("ほかの 子の きろくとは まざらない（idempotencyKey に userId）", async () => {
    db.table("user").push({ id: "u2", coins: 0, totalCoinsEarned: 0 });
    expect((await service.claimLibraryReward("u1", { kind: "chant", id: "c-01", finished: true }, day1)).status).toBe("AWARDED");
    expect((await service.claimLibraryReward("u2", { kind: "chant", id: "c-01", finished: true }, day1)).status).toBe("AWARDED");
  });
});

describe("API: /api/library・/api/library/reward・/api/library/talk", () => {
  beforeEach(() => { db.reset(); dbUp = true; userId = "u1"; db.table("user").push({ id: "u1", coins: 7, totalCoinsEarned: 7 }); });
  const post = async (handler: (req: Request, ctx: unknown) => Promise<Response>, url: string, body: unknown) => {
    const res = await handler(new Request(`http://x${url}`, { method: "POST", body: JSON.stringify(body) }), {});
    return { status: res.status, body: await res.json() };
  };
  const getStatus = async () => {
    const res = await statusRoute.GET(new Request("http://x/api/library"), {});
    return res.json();
  };

  it("GET: 到達レッスン・きょうの ごほうび・コイン", async () => {
    completeLessonsUpTo("u1", 33);
    expect(await getStatus()).toMatchObject({ success: true, reachedLesson: 33, rewardedToday: false, coins: 7, dailyCoins: 5 });
  });

  it("GET: DB が 止まっていれば offline:true（画面は この 端末の きろくで ひらく）", async () => {
    dbUp = false;
    expect(await getStatus()).toMatchObject({ success: true, offline: true, reachedLesson: 0, rewardedToday: false });
  });

  it("POST reward: おはなし 合格 → 5コイン、2回目は alreadyToday", async () => {
    const s = STORIES[0];
    const r1 = await post(rewardRoute.POST, "/api/library/reward", { kind: "story", id: s.id, answers: rightAnswers(s) });
    expect(r1).toMatchObject({ status: 200, body: { ok: true, coinsAwarded: 5, completed: true, saved: true } });
    const r2 = await post(rewardRoute.POST, "/api/library/reward", { kind: "chant", id: "c-01", finished: true });
    expect(r2.body).toMatchObject({ ok: true, coinsAwarded: 0, alreadyToday: true });
    expect((await getStatus()).rewardedToday).toBe(true);
  });

  it("POST reward: 不合格は completed:false（コインなし）", async () => {
    const s = STORIES[0];
    const r = await post(rewardRoute.POST, "/api/library/reward", { kind: "story", id: s.id, answers: wrongAnswers(s) });
    expect(r.body).toMatchObject({ ok: true, coinsAwarded: 0, completed: false });
  });

  it("POST reward: ひらいていない → 403、ない id → 404（どちらも JSON）", async () => {
    const s = STORIES.find((x) => x.id === "s2-01")!;
    const locked = await post(rewardRoute.POST, "/api/library/reward", { kind: "story", id: s.id, answers: rightAnswers(s) });
    expect(locked.status).toBe(403);
    expect(locked.body).toMatchObject({ ok: false, code: "LOCKED", unlockLesson: 360 });
    const missing = await post(rewardRoute.POST, "/api/library/reward", { kind: "story", id: "../../etc", answers: [] });
    expect(missing.status).toBe(404);
    expect(typeof missing.body.error).toBe("string");
  });

  it("POST reward: ブラウザが 送る 正解数は 信じない（answers で サーバーが 採点しなおす）", async () => {
    const r = await post(rewardRoute.POST, "/api/library/reward", { kind: "story", id: "s1-01", answers: [9, 9, 9], correct: 3, passed: true });
    expect(r.body).toMatchObject({ coinsAwarded: 0, completed: false });
  });

  it("POST reward: DB が 止まっていても ok:true（コイン0・saved:false）", async () => {
    dbUp = false;
    const r = await post(rewardRoute.POST, "/api/library/reward", { kind: "chant", id: "c-01", finished: true });
    expect(r).toMatchObject({ status: 200, body: { ok: true, coinsAwarded: 0, saved: false } });
  });

  it("POST talk: ひらいていない テーマは 403（AI を つかわない）", async () => {
    completeLessonsUpTo("u1", 50);
    const r = await post(talkRoute.POST, "/api/library/talk", { themeId: "t-food", history: [], childText: "I like curry." });
    expect(r.status).toBe(403);
  });

  it("POST talk: ひらいていれば 返事（AI の キーが ない ときは 台本）。ない テーマは 404", async () => {
    completeLessonsUpTo("u1", 90);
    const r = await post(talkRoute.POST, "/api/library/talk", { themeId: "t-food", history: [{ role: "ai", text: "Hi! I'm hungry! What food do you like?" }], childText: "I like curry." });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ success: true, source: "script", done: false, turn: 1, maxTurns: 6 });
    expect(r.body.replyEn.length).toBeGreaterThan(0);
    expect((await post(talkRoute.POST, "/api/library/talk", { themeId: "t-none", history: [], childText: "hi" })).status).toBe(404);
  });

  it("POST talk: DB が 止まっていて 解放を 確かめられない ときは 台本の 返事（止まらない）", async () => {
    dbUp = false;
    const r = await post(talkRoute.POST, "/api/library/talk", { themeId: "t-animals", history: [], childText: "I like pandas." });
    expect(r).toMatchObject({ status: 200, body: { success: true, source: "script" } });
  });
});

describe("AI フリートークの プロンプト", () => {
  const conv = themeConversation(TALKS.find((t) => t.id === "t-weekend")!);

  it("free モードは 個人情報を きかない・ステージに あわせた ことば・話題を 子どもに あわせる", () => {
    const p = buildSystemPrompt("haru", conv, 6, { mode: "free", stage: 2 });
    expect(p).toContain("free talk time");
    expect(p).toContain("NEVER ask for personal information");
    expect(p).toContain(levelGuide(2));
    expect(p).toContain("follow-up question");
    expect(p).toContain("<child>");
  });

  it("ステージで ことばの 長さの めやすが かわる。レッスンの かいわは いままでどおり", () => {
    expect(levelGuide(1)).toContain("Pre-A1");
    expect(levelGuide(2)).toContain("A2");
    expect(levelGuide(3)).toContain("B1");
    expect(buildSystemPrompt("haru", conv, 6)).toContain("talking at the end of today's lesson");
  });
});
