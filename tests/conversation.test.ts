/**
 * Phase 5: レッスンさいごの「AIキャラとの かいわ」
 *  - 台本フォールバックエンジン（キーワード一致・目標表現・ターン上限・個人情報）
 *  - API POST /api/conversation（キー無し・AI成功・AIエラー・壊れた入力 → いつでも success:true）
 *  - 契約 ConversationResponseSchema
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getLesson, LESSONS, itemsOfLesson } from "@/lib/curriculum";
import {
  GENERIC_CONVERSATION, MAX_CONVERSATION_TURNS, buildSuggestions, concreteTarget, redactPersonalInfo, scriptedReply,
  starterLine, targetStem, usedTargets, type ConversationTurn,
} from "@/lib/conversation/engine";
import { ConversationRequestSchema, ConversationResponseSchema } from "@/lib/api/contracts";
import { coerce } from "@/lib/api/client";

const parse = vi.fn();
class APIError extends Error { status = 500; }
class RateLimitError extends APIError {}
class APIConnectionError extends APIError {}
vi.mock("@anthropic-ai/sdk", () => {
  class Anthropic {
    static APIError = APIError;
    static RateLimitError = RateLimitError;
    static APIConnectionError = APIConnectionError;
    beta = { messages: { parse: (...a: unknown[]) => parse(...a) } };
  }
  return { default: Anthropic };
});
vi.mock("@anthropic-ai/sdk/helpers/beta/zod", () => ({ betaZodOutputFormat: () => ({ type: "json_schema" }) }));

const { buildMessages, buildSystemPrompt, converse, isAcceptableReply } = await import("@/lib/conversation/aiConversation");
const { POST } = await import("@/app/api/conversation/route");
const { conversationLogs } = await import("@/components/lesson/ConversationStep");

const L1 = getLesson(1)!;
const C1 = L1.conversation!;
const C6 = getLesson(6)!.conversation!;

// ---------------------------------------------------------------------------
describe("台本エンジン: 目標表現の判定", () => {
  it("～ の前だけを stem にする", () => {
    expect(targetStem("I'm ～.")).toEqual(["i'm"]);
    expect(targetStem("Nice to meet you.")).toEqual(["nice", "to", "meet", "you"]);
  });

  it("大文字・記号・I am / it is のゆれを気にしない", () => {
    expect(usedTargets("hello", C1.aiTask.targetExpressions)).toEqual(["Hello!"]);
    expect(usedTargets("I am Ken", C1.aiTask.targetExpressions)).toEqual(["I'm ～."]);
    expect(usedTargets("im ken", C1.aiTask.targetExpressions)).toEqual([]);
    expect(usedTargets("it is red", C6.aiTask.targetExpressions)).toEqual(["It's red."]);
    expect(usedTargets("NICE TO MEET YOU!!", C1.aiTask.targetExpressions)).toEqual(["Nice to meet you."]);
  });

  it("～ つきの表現は台本の具体的な文に置きかえる", () => {
    expect(concreteTarget("I'm ～.", C1)).toBe("I'm Haru.");
    expect(concreteTarget("Hello!", C1)).toBe("Hello!");
    expect(concreteTarget("I like ～.", C1)).toBe("I like ....");
  });

  it("候補はまだ言っていない目標表現を先に、重複なし・3つまで", () => {
    const s = buildSuggestions(C1, [{ role: "child", text: "Hello!" }]);
    expect(s.length).toBeLessThanOrEqual(3);
    expect(s[0]).not.toBe("Hello!");
    expect(new Set(s.map((x) => x.toLowerCase())).size).toBe(s.length);
  });

  it("個人情報っぽいものを伏せる", () => {
    expect(redactPersonalInfo("my phone is 090-1234-5678")).toBe("my phone is ***");
    expect(redactPersonalInfo("mail a@b.jp ok")).toBe("mail *** ok");
    expect(redactPersonalInfo("x".repeat(500))).toHaveLength(200);
  });
});

describe("台本エンジン: 返事", () => {
  const start: ConversationTurn[] = [{ role: "ai", text: starterLine(C1) }];

  it("さいしょの ひとことは aiTask.starterEn", () => {
    expect(starterLine(C1)).toBe(C1.aiTask.starterEn);
    expect(starterLine(null, "riko")).toContain("Riko");
  });

  it("キーワードに近い台本の行の『つぎの行』を返し、目標表現をほめる", () => {
    const r = scriptedReply({ conversation: C1, history: start, childText: "I'm Ken. Nice to meet you." });
    expect(r.usedTarget).toBe(true);
    expect(r.replyEn).toMatch(/^Great! /);
    expect(r.replyEn).toContain("Nice to meet you, too.");
    expect(r.replyJa).toContain("こちらこそ");
    expect(r.source).toBe("script");
    expect(r.done).toBe(false);
    expect(r.turn).toBe(1);
  });

  it("子どもの名前をオウム返ししない", () => {
    const r = scriptedReply({ conversation: C1, history: start, childText: "I'm Takeshi" });
    expect(r.replyEn).not.toMatch(/takeshi/i);
  });

  it("何も聞きとれなかったら お手本を見せる", () => {
    const r = scriptedReply({ conversation: C1, history: start, childText: "   " });
    expect(r.usedTarget).toBe(false);
    expect(r.replyEn).toMatch(/Say, "/);
    expect(r.suggestions.length).toBeGreaterThan(0);
  });

  it("同じ台本の行を くりかえさない", () => {
    let history = [...start];
    const replies: string[] = [];
    for (let i = 0; i < MAX_CONVERSATION_TURNS - 1; i++) {
      const r = scriptedReply({ conversation: C6, history, childText: "It's red." });
      replies.push(r.replyEn);
      history = [...history, { role: "child", text: "It's red." }, { role: "ai", text: r.replyEn }];
    }
    const lineReplies = replies.filter((x) => !/Can you say/.test(x));
    expect(new Set(lineReplies).size).toBe(lineReplies.length);
  });

  it(`${MAX_CONVERSATION_TURNS} ターン目で おしまい（done）`, () => {
    const history: ConversationTurn[] = [...start];
    for (let i = 0; i < MAX_CONVERSATION_TURNS - 1; i++) history.push({ role: "child", text: "hello" }, { role: "ai", text: "Hi!" });
    const r = scriptedReply({ conversation: C1, history, childText: "Bye!" });
    expect(r.done).toBe(true);
    expect(r.turn).toBe(MAX_CONVERSATION_TURNS);
    expect(r.suggestions).toEqual([]);
  });

  it("全レッスンで どんな入力でも返事が作れる（空・日本語・ふざけた入力）", () => {
    for (const l of [...LESSONS.map((x) => x.conversation!), GENERIC_CONVERSATION]) {
      for (const t of ["", "うーん", "banana banana", "Hello!", "@@@", l.aiTask.targetExpressions[0] ?? ""]) {
        const r = scriptedReply({ conversation: l, history: [{ role: "ai", text: starterLine(l) }], childText: t });
        expect(r.replyEn.trim().length).toBeGreaterThan(0);
        expect(r.replyEn).not.toMatch(/undefined|NaN/);
      }
    }
  });

  it("目標表現を言ったら EXPRESSION 項目に SPEAKING のログ（同じ項目は1回だけ）", () => {
    const logs = conversationLogs(["Nice to meet you!", "nice to meet you"], C1.aiTask.targetExpressions, itemsOfLesson(L1));
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ skill: "SPEAKING", questionType: "conversation", correct: true });
    expect(conversationLogs(["banana"], C1.aiTask.targetExpressions, itemsOfLesson(L1))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
describe("AI かいわ（Claude）", () => {
  const OLD = { ...process.env };
  beforeEach(() => { parse.mockReset(); });
  afterEach(() => { process.env = { ...OLD }; });

  it("システムプロンプト: やさしい友だち・短い英語・話題をまもる・個人情報をきかない", () => {
    const p = buildSystemPrompt("haru", C1, 6);
    expect(p).toContain("Haru");
    expect(p).toContain(C1.scene);
    for (const t of C1.aiTask.targetExpressions) expect(p).toContain(t);
    expect(p).toMatch(/NEVER ask for personal information/);
    expect(p).toMatch(/unsafe/);
    expect(p).toMatch(/<child>/);
  });

  it("messages は user から始まり交互になる・個人情報は伏せる", () => {
    const m = buildMessages([{ role: "ai", text: "Hello!" }, { role: "child", text: "call 0312345678" }, { role: "child", text: "hi" }], "I'm Ken", 3, 6);
    expect(m[0].role).toBe("user");
    for (let i = 1; i < m.length; i++) expect(m[i].role).not.toBe(m[i - 1].role);
    expect(m[m.length - 1].role).toBe("user");
    expect(JSON.stringify(m)).not.toContain("0312345678");
  });

  it("キーが無ければ AI を呼ばず台本", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const r = await converse({ conversation: C1, character: "haru", history: [], childText: "Hello!", maxTurns: 6 });
    expect(r.source).toBe("script");
    expect(parse).not.toHaveBeenCalled();
  });

  it("キーがあれば CONVERSATION_MODEL（既定 claude-haiku-5-5）で呼ぶ", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    delete process.env.CONVERSATION_MODEL;
    parse.mockResolvedValue({ stop_reason: "end_turn", parsed_output: { replyEn: "Nice to meet you! Do you like dogs?", replyJa: "よろしくね！ いぬは すき？", suggestions: ["Yes, I do.", "Nice to meet you."] } });
    const r = await converse({ conversation: C1, character: "haru", history: [{ role: "ai", text: C1.aiTask.starterEn }], childText: "I'm Ken.", maxTurns: 6 });
    expect(r).toMatchObject({ source: "ai", usedTarget: true, done: false, turn: 1, replyEn: "Nice to meet you! Do you like dogs?" });
    expect(parse.mock.calls[0][0].model).toBe("claude-haiku-5-5");
    process.env.CONVERSATION_MODEL = "claude-sonnet-5-5";
    await converse({ conversation: C1, character: "haru", history: [], childText: "hi", maxTurns: 6 });
    expect(parse.mock.calls[1][0].model).toBe("claude-sonnet-5-5");
  });

  it("AI のエラー・拒否・へんな出力 → 台本", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    parse.mockRejectedValueOnce(new RateLimitError("429"));
    expect((await converse({ conversation: C1, character: "haru", history: [], childText: "hi", maxTurns: 6 })).source).toBe("script");
    parse.mockRejectedValueOnce(new Error("boom"));
    expect((await converse({ conversation: C1, character: "haru", history: [], childText: "hi", maxTurns: 6 })).source).toBe("script");
    parse.mockResolvedValueOnce({ stop_reason: "refusal", parsed_output: null });
    expect((await converse({ conversation: C1, character: "haru", history: [], childText: "hi", maxTurns: 6 })).source).toBe("script");
    parse.mockResolvedValueOnce({ stop_reason: "end_turn", parsed_output: { replyEn: "Visit https://example.com", replyJa: "", suggestions: [] } });
    expect((await converse({ conversation: C1, character: "haru", history: [], childText: "hi", maxTurns: 6 })).source).toBe("script");
  });

  it("さいごのターンは AI を呼ばず台本で しめくくる", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    const history: ConversationTurn[] = [];
    for (let i = 0; i < 5; i++) history.push({ role: "ai", text: "Hi!" }, { role: "child", text: "hello" });
    const r = await converse({ conversation: C1, character: "haru", history, childText: "bye", maxTurns: 6 });
    expect(r.done).toBe(true);
    expect(parse).not.toHaveBeenCalled();
  });

  it("isAcceptableReply", () => {
    expect(isAcceptableReply("Hi!")).toBe(true);
    expect(isAcceptableReply("")).toBe(false);
    expect(isAcceptableReply("a".repeat(201))).toBe(false);
    expect(isAcceptableReply("mail me at x@y.z")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe("POST /api/conversation", () => {
  const OLD = { ...process.env };
  beforeEach(() => { parse.mockReset(); });
  afterEach(() => { process.env = { ...OLD }; });
  const call = async (body: unknown) => {
    const res = await POST(new Request("http://x/api/conversation", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }), undefined);
    return { status: res.status, body: await res.json() };
  };

  it("キー無し → 台本で success:true・契約どおり", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const r = await call({ lessonNo: 1, history: [{ role: "ai", text: C1.aiTask.starterEn }], childText: "Hello! I'm Ken." });
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ success: true, source: "script", usedTarget: true, maxTurns: 6, turn: 1 });
    expect(ConversationResponseSchema.parse(r.body)).toEqual(r.body);
  });

  it("AI がエラーでも success:true", async () => {
    process.env.ANTHROPIC_API_KEY = "test";
    parse.mockRejectedValue(new APIConnectionError("down"));
    const r = await call({ lessonNo: 6, childText: "It's red." });
    expect(r.status).toBe(200);
    expect(r.body.success).toBe(true);
    expect(r.body.source).toBe("script");
  });

  it("壊れた入力・知らないレッスンでも success:true", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    for (const b of ["", "{bad", "[1,2]", { lessonNo: 9999, character: "pikachu", history: "x", childText: 5 }, { lessonNo: -3 }]) {
      const r = await call(b);
      expect(r.status).toBe(200);
      expect(r.body.success).toBe(true);
      expect(typeof r.body.replyEn).toBe("string");
      expect(r.body.replyEn.length).toBeGreaterThan(0);
    }
  });
});

describe("契約: ConversationRequest / ConversationResponse", () => {
  it("リクエストはどんな値でも安全なデフォルト", () => {
    expect(ConversationRequestSchema.parse({})).toEqual({ lessonNo: 1, character: "haru", history: [], childText: "" });
    const v = ConversationRequestSchema.parse({ lessonNo: "3", history: Array.from({ length: 30 }, () => ({ role: "child", text: "hi" })), childText: "x".repeat(400) });
    expect(v.lessonNo).toBe(3);
    expect(v.history).toHaveLength(12);
    expect(v.childText).toHaveLength(200);
  });

  it("レスポンスが壊れていても success:true と返事のデフォルト", () => {
    for (const g of [undefined, null, "", "<html>", [], { suggestions: "x", done: "yes", source: "gpt" }]) {
      const v = coerce(ConversationResponseSchema, g);
      expect(v.success).toBe(true);
      expect(v.replyEn.length).toBeGreaterThan(0);
      expect(Array.isArray(v.suggestions)).toBe(true);
      expect(v.source).toBe("script");
      expect(v.maxTurns).toBe(6);
    }
  });
});
