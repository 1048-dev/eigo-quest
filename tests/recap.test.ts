import { describe, expect, it } from "vitest";
import { LESSONS, getLesson } from "@/lib/curriculum";
import { buildRecapScript, estimateReadMs, estimateSpeechMs, recapProgress, RECAP_TIMING, type RecapSection } from "@/lib/recap/script";
import { rewardForRecap } from "@/lib/domain/coins";
import { COIN_RULES } from "@/lib/domain/config";
import { RecapWatchedResponseSchema } from "@/lib/api/contracts";
import type { LessonDef } from "@/lib/domain/types";

const lesson1 = getLesson(1)!;

/** 会話・まとめの無い、最小の旧形式レッスン */
const tiny: LessonDef = {
  lessonNo: 99, world: 4, title: "Tiny", titleJa: "ちいさい",
  school: { grade: "小3", topic: "テスト", grammar: "", expressions: [{ en: "Hi.", ja: "やあ。", core: true }], testPoints: [] },
  tpr: [{ en: "Sit down.", ja: "すわって", action: "すわる", emoji: "🪑" }],
  phonics: { rule: "letter-sound", focus: ["b"], sounds: ["/b/"], words: ["bat"], tipJa: "b は くちびるを とじて ぱっ" },
  vocab: [{ en: "cat", ja: "ねこ", emoji: "🐱", core: true }],
  teacherScript: "",
};

describe("まとめ台本ビルダー（buildRecapScript）", () => {
  it("すべてのレッスンが 2〜3分 におさまる", () => {
    for (const l of LESSONS) {
      const s = buildRecapScript(l);
      expect(s.totalMs, `Lesson ${l.lessonNo}`).toBeGreaterThanOrEqual(RECAP_TIMING.minTotalMs);
      expect(s.totalMs, `Lesson ${l.lessonNo}`).toBeLessThanOrEqual(RECAP_TIMING.maxTotalMs);
    }
  }, 30_000);

  it("セクションは はじまり→ことば→ひょうげん→フォニックス→うごこう→かいわ→…→おわり の順", () => {
    const s = buildRecapScript(lesson1);
    const order: RecapSection[] = ["intro", "words", "expressions", "phonics", "tpr", "conversation", "highlights", "outro"];
    expect(s.chapters.map((c) => c.section)).toEqual(order);
    expect(s.segments[0].section).toBe("intro");
    expect(s.segments.at(-1)!.section).toBe("outro");
  });

  it("時間は すきまなく つながり、合計 = 最後の終わり", () => {
    const s = buildRecapScript(lesson1);
    let t = 0;
    for (const seg of s.segments) {
      expect(seg.startMs).toBe(t);
      expect(seg.durationMs).toBe(seg.speakMs + seg.pauseMs);
      expect(seg.speakMs).toBeGreaterThan(0);
      t += seg.durationMs;
    }
    expect(s.totalMs).toBe(t);
    expect(new Set(s.segments.map((x) => x.id)).size).toBe(s.segments.length);
  });

  it("call-and-response: くりかえす行は英語があり、約2.5秒まつ", () => {
    const s = buildRecapScript(lesson1);
    const reps = s.segments.filter((x) => x.repeat);
    expect(reps.length).toBeGreaterThan(10);
    for (const r of reps) {
      expect(r.en).toBeTruthy();
      expect(r.pauseMs).toBe(2500);
    }
    for (const x of s.segments.filter((y) => !y.repeat)) expect(x.pauseMs).toBe(RECAP_TIMING.gapMs);
  });

  // 1,200 レッスン × 約 60 セグメントで expect を よぶと 重い（いそがしい マシンで 5 秒を こえた）ので、まとめて 1 回で たしかめる
  it("ホストは ハル と ビリモ だけ。日本語のセリフはいつもある", () => {
    const bad: string[] = [];
    for (const l of LESSONS) {
      for (const seg of buildRecapScript(l).segments) {
        if (seg.host !== "haru" && seg.host !== "birimo") bad.push(`L${l.lessonNo} ${seg.id} host=${seg.host}`);
        if (!seg.sayJa.trim()) bad.push(`L${l.lessonNo} ${seg.id} sayJa が からっぽ`);
      }
    }
    expect(bad).toEqual([]);
  }, 30_000);

  it("レッスンの中身が入っている（ことば・表現・フォニックス・TPR・会話）", () => {
    const s = buildRecapScript(lesson1);
    const ens = s.segments.map((x) => x.en);
    expect(ens).toContain("hello");
    expect(ens).toContain("Hello. I'm Haru.");
    expect(ens).toContain("sun");
    expect(ens).toContain("Look!");
    expect(ens).toContain("Nice to meet you, too.");
    // フォニックスの単語には、ふくまれる文字が出る
    expect(s.segments.find((x) => x.en === "sun")!.letters).toEqual(["s"]);
    expect(s.segments.find((x) => x.en === "apple")!.letters).toEqual(["a"]);
    // TPR は動きの説明をホストが言う
    expect(s.segments.find((x) => x.en === "Stop!" && x.section === "tpr")!.sayJa).toContain("とまる");
  });

  it("会話は シーンを聞く（くりかえさない）→ だいじな文を くりかえす", () => {
    const conv = buildRecapScript(lesson1).segments.filter((x) => x.section === "conversation");
    const listen = conv.filter((x) => x.speaker && !x.repeat);
    const practice = conv.filter((x) => x.repeat);
    expect(listen.map((x) => x.speaker)).toEqual(["Haru", "Riko", "Haru", "Riko", "Haru"]);
    expect(practice.length).toBeGreaterThan(0);
    expect(practice.length).toBeLessThanOrEqual(2);
    expect(practice.every((p) => listen.some((l) => l.en === p.en))).toBe(true);
  });

  it("学校テストに出る core 表現を先に練習する", () => {
    const first = buildRecapScript(lesson1).segments.find((x) => x.section === "expressions" && x.repeat)!;
    expect(first.en).toBe("Hello. I'm Haru.");
  });

  it("会話・まとめが無い旧データでも作れる（短いときは もういちど で 2分に近づける）", () => {
    const s = buildRecapScript(tiny);
    expect(s.chapters.map((c) => c.section)).not.toContain("conversation");
    expect(s.segments.filter((x) => x.en === "cat").length).toBeGreaterThanOrEqual(2);
    expect(s.totalMs).toBeLessThanOrEqual(RECAP_TIMING.maxTotalMs);
  });

  it("空の英語は読み上げセグメントにしない", () => {
    const s = buildRecapScript({ ...tiny, vocab: [{ en: " ", ja: "から", emoji: "" }, ...tiny.vocab] });
    expect(s.segments.every((x) => x.en === undefined || x.en.trim().length > 0)).toBe(true);
  });

  it("おなじレッスンからは いつも おなじ台本（純粋関数）", () => {
    expect(buildRecapScript(lesson1)).toEqual(buildRecapScript(lesson1));
  });
});

describe("時間の見積もり・進み具合", () => {
  it("長い文ほど長い・読み上げは rate が遅いほど長い", () => {
    expect(estimateSpeechMs("Nice to meet you, too.")).toBeGreaterThan(estimateSpeechMs("hello"));
    expect(estimateSpeechMs("hello", 0.8)).toBeGreaterThan(estimateSpeechMs("hello", 1));
    expect(estimateReadMs("あ")).toBe(1800);
    expect(estimateReadMs("あ".repeat(200))).toBe(5000);
  });

  it("recapProgress は 0→1 で単調にふえる", () => {
    const s = buildRecapScript(lesson1);
    expect(recapProgress(s, 0, 0)).toBe(0);
    expect(recapProgress(s, s.segments.length)).toBe(1);
    let prev = -1;
    s.segments.forEach((seg, i) => {
      const p = recapProgress(s, i, seg.durationMs / 2);
      expect(p).toBeGreaterThan(prev);
      prev = p;
    });
    // セグメントの長さをこえた経過時間は切りつめる
    expect(recapProgress(s, 0, 10_000_000)).toBeCloseTo(s.segments[0].durationMs / s.totalMs);
  });
});

describe("まとめのごほうび", () => {
  it("1日1回 5コイン、2回目は 0", () => {
    const r = rewardForRecap({ alreadyRewardedToday: false });
    expect(r.total).toBe(COIN_RULES.recapWatched);
    expect(r.total).toBe(5);
    expect(r.coins[0].reason).toBe("RECAP_WATCHED");
    expect(rewardForRecap({ alreadyRewardedToday: true }).total).toBe(0);
  });

  it("契約: 空・壊れたレスポンスでも ok:true・コイン0（子どもに失敗を見せない）", () => {
    const empty = RecapWatchedResponseSchema.parse({});
    expect(empty).toMatchObject({ ok: true, coinsAwarded: 0, alreadyToday: false, saved: false });
    expect(empty.messageJa.length).toBeGreaterThan(0);
    const broken = RecapWatchedResponseSchema.parse({ ok: "yes", coinsAwarded: "many", messageJa: 3 });
    expect(broken.ok).toBe(true);
    expect(broken.coinsAwarded).toBe(0);
  });
});
