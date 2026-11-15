import { describe, expect, it } from "vitest";
import { gradeLocally } from "@/lib/grading/localGrader";
import { scorePronunciation } from "@/lib/speech/pronunciation";

describe("ルール採点（AI前段）", () => {
  it("完全一致は合格", () => expect(gradeLocally("hello", "hello")).toMatchObject({ verdict: "PASS", certain: true }));
  it("全角入力も正規化して合格", () => expect(gradeLocally("hello", "ｈｅｌｌｏ").verdict).toBe("PASS"));
  it("単語の大文字揺れは合格", () => expect(gradeLocally("hello", "Hello").verdict).toBe("PASS"));

  it("曜日の小文字: レッスンでは合格＋アドバイス、学校モードでは再挑戦", () => {
    expect(gradeLocally("It's Monday.", "It's monday.", "lenient")).toMatchObject({ verdict: "PASS", certain: true });
    const s = gradeLocally("It's Monday.", "It's monday.", "school");
    expect(s.verdict).toBe("RETRY");
    expect(s.feedbackJa).toContain("大文字");
  });

  it("アポストロフィ・ピリオド忘れ", () => {
    expect(gradeLocally("I'm happy.", "Im happy", "lenient").verdict).toBe("PASS");
    expect(gradeLocally("I'm happy.", "Im happy", "school").verdict).toBe("RETRY");
  });

  it("軽微なスペルミスは未確定（AI採点へ回す）", () => {
    const r = gradeLocally("banana", "banama");
    expect(r.certain).toBe(false);
    expect(r.verdict).toBe("RETRY");
  });

  it("別の単語は不正解で確定、文は別解の可能性があるので未確定", () => {
    expect(gradeLocally("apple", "dog")).toMatchObject({ verdict: "WRONG", certain: true });
    expect(gradeLocally("Hello. I'm Ken.", "Hi! I'm Ken.").certain).toBe(false);
  });
});

describe("発音スコア", () => {
  it("全単語一致・高確信度で星3", () => expect(scorePronunciation("Come here!", "come here", 0.9).stars).toBe(3));
  it("一部のみ一致で減点", () => expect(scorePronunciation("Come here!", "come", 0.9).score).toBeLessThan(0.6));
});

import { buildTestQuestions, toPublic } from "@/lib/curriculum/questions";
import { getAssessment } from "@/lib/curriculum";

describe("出題の安全性", () => {
  it("クライアントに渡す問題から正解を推測できない（itemId・正解を含まない）", () => {
    const qs = buildTestQuestions(getAssessment("mini-1-5")!, { seed: 42 });
    for (const q of qs) {
      const pub = JSON.stringify(toPublic(q));
      expect(pub).not.toContain(q.itemId);
      expect(pub).not.toContain("explanationJa");
      if (q.choices) expect(q.choices.map((c) => c.id)).toEqual(["a", "b", "c", "d"].slice(0, q.choices.length));
    }
  });
  it("同じ seed なら同じ問題（サーバー再生成で採点できる）", () => {
    const a = getAssessment("boss-1-30")!;
    expect(buildTestQuestions(a, { seed: 7 })).toEqual(buildTestQuestions(a, { seed: 7 }));
  });
});
