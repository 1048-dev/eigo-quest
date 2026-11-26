/**
 * run8 P8: バーチャル先生プレイヤーの セグメントの タイムライン（src/lib/teacher/timeline.ts）
 */
import { describe, expect, it } from "vitest";
import { LESSONS, getLesson } from "@/lib/curriculum";
import type { LessonDef, TeacherSegmentKind } from "@/lib/domain/types";
import { MS_SEGMENT_GAP, englishShare, immersionFor, scriptMs, unknownSlideItems } from "@/lib/teacher/timing";
import {
  DEFAULT_GESTURE,
  autoScript,
  buildTeacherTimeline,
  pausePrompt,
  segmentAt,
  segmentDurationMs,
  segmentStartMs,
  speakable,
  speechUnits,
  splitByLanguage,
  timelineDurationMs,
  visemeAt,
  visemeOf,
} from "@/lib/teacher/timeline";
import { vttUrlFor } from "@/lib/teacher/media";
import { pickVoice } from "@/components/teacher/useTeacherPlayer";

const ORDER: TeacherSegmentKind[] = ["greet", "goal", "words", "expressions", "phonics", "tpr", "repeat", "check", "wrap"];
const L = (n: number) => {
  const l = getLesson(n);
  if (!l) throw new Error(`lesson ${n} missing`);
  return l;
};
const noScript = (l: LessonDef): LessonDef => ({ ...l, teacher: undefined });

describe("言語の 切りわけ", () => {
  it("日本語の 中の 英語を わける", () => {
    expect(splitByLanguage("hello は「こんにちは」。てを ふって、Hello! さあ")).toEqual([
      { lang: "en", text: "hello" },
      { lang: "ja", text: "は「こんにちは」。てを ふって、" },
      { lang: "en", text: "Hello!" },
      { lang: "ja", text: "さあ" },
    ]);
  });
  it("英語だけ・日本語だけは 1 つ", () => {
    expect(splitByLanguage("Hello, everyone! I'm Emma.")).toEqual([{ lang: "en", text: "Hello, everyone! I'm Emma." }]);
    expect(splitByLanguage("きょうの ゴールは ふたつ。")).toEqual([{ lang: "ja", text: "きょうの ゴールは ふたつ。" }]);
  });
  it("数字や 記号だけの かたまりは まわりに くっつく", () => {
    const parts = splitByLanguage("ワールド10 の さいご。Let's go!");
    expect(parts.map((p) => p.lang)).toEqual(["ja", "en"]);
    expect(parts[0].text).toContain("10");
  });
  it("～ や ― は 読み上げで 間に なる", () => {
    expect(speakable("I'm ～.", "en")).toBe("I'm ... .");
    expect(speakable("Who helps the hero? ― A tiny breeze.", "en")).toBe("Who helps the hero?, A tiny breeze.");
    expect(speakable("I'm ～. で なまえ", "ja")).not.toContain("～");
  });
  it("mix の セグメントは 声の 単位に わかれ、時間は 0 より 大きい", () => {
    const u = speechUnits("Hello, everyone! I'm Emma. こんにちは！ わたしは エマせんせい。", "mix");
    expect(u[0].lang).toBe("en");
    expect(u.at(-1)!.lang).toBe("ja");
    expect(u.filter((x) => x.lang === "ja").map((x) => x.text).join("")).toContain("こんにちは");
    expect(u.every((x) => x.ms > 0 && x.speak.length > 0)).toBe(true);
  });
  it("en の セグメントは 英語の 声だけ", () => {
    const u = speechUnits("Repeat after me. Excuse me. I'm lost. Could you help me?", "en");
    expect(u.length).toBeGreaterThan(0);
    expect(u.every((x) => x.lang === "en")).toBe(true);
  });
});

describe("台本が ある レッスン（L1）", () => {
  const lesson = L(1);
  const tl = buildTeacherTimeline(lesson, { partner: "haru" });
  it("台本を そのまま つかう", () => {
    expect(tl.source).toBe("script");
    expect(tl.segments.length).toBe(lesson.teacher!.segments.length);
    expect(tl.segments.map((s) => s.say)).toEqual(lesson.teacher!.segments.map((s) => s.say));
  });
  it("はじまり・おわりが すきまなく つながり、合計が 台本の 長さと ほぼ 同じ", () => {
    let t = 0;
    for (const s of tl.segments) {
      expect(s.startMs).toBe(t);
      expect(s.endMs).toBe(s.startMs + s.speakMs + s.pauseMs + MS_SEGMENT_GAP);
      t = s.endMs;
    }
    expect(tl.totalMs).toBe(t);
    expect(Math.abs(tl.totalMs - scriptMs(lesson.teacher!)) / scriptMs(lesson.teacher!)).toBeLessThan(0.05);
  });
  it("gesture が ない ところは kind の きまりで うめる", () => {
    tl.segments.forEach((s, i) => expect(s.gesture).toBe(lesson.teacher!.segments[i].gesture ?? DEFAULT_GESTURE[s.kind]));
  });
  it("0.8 倍は 話す 時間だけ のびる（まち時間は 同じ）", () => {
    const s = tl.segments.find((x) => x.pauseMs > 0)!;
    expect(segmentDurationMs(s, 0.8) - segmentDurationMs(s, 1)).toBeCloseTo(s.speakMs / 0.8 - s.speakMs, 5);
    expect(timelineDurationMs(tl, 1)).toBeCloseTo(tl.totalMs, 5);
    expect(timelineDurationMs(tl, 0.8)).toBeGreaterThan(tl.totalMs);
  });
  it("時刻 → セグメント と セグメント → 時刻 が あう", () => {
    for (const rate of [1, 0.8]) {
      for (const s of tl.segments) {
        const at = segmentStartMs(tl, s.index, rate);
        expect(segmentAt(tl, at + 1, rate)).toBe(s.index);
      }
      expect(segmentAt(tl, 10 ** 9, rate)).toBe(tl.segments.length - 1);
    }
  });
});

describe("台本が まだ ない レッスンの 自動の 授業", () => {
  const sample = [1, 45, 150, 300, 420, 700, 1100, 1200].map((n) => noScript(L(n)));
  it("9 つの ながれの 順番（greet で はじまり wrap で おわる）", () => {
    for (const l of sample) {
      const tl = buildTeacherTimeline(l, { partner: "riko" });
      expect(tl.source).toBe("auto");
      const kinds = tl.segments.map((s) => s.kind);
      expect(kinds[0]).toBe("greet");
      expect(kinds[kinds.length - 1]).toBe("wrap");
      const idx = kinds.map((k) => ORDER.indexOf(k));
      expect(idx).toEqual([...idx].sort((a, b) => a - b));
      expect(new Set(kinds).size).toBeGreaterThanOrEqual(7);
    }
  });
  it("ぜんぶの レッスンで: 黒板の ことばは レッスンに ある・字幕あり・まち時間の きまり", () => {
    for (const lesson of LESSONS) {
      const segs = autoScript(lesson, "haru");
      expect(unknownSlideItems({ ...lesson, teacher: { minutes: 3, segments: segs } }), `L${lesson.lessonNo}`).toEqual([]);
      for (const s of segs) {
        expect(s.say.trim().length, `L${lesson.lessonNo} ${s.kind}`).toBeGreaterThan(0);
        expect(s.subtitleJa?.trim().length, `L${lesson.lessonNo} ${s.kind}`).toBeGreaterThan(0);
        if (s.kind === "repeat") expect(s.pauseMs ?? 0).toBeGreaterThanOrEqual(1500);
        if (s.kind === "tpr") expect(s.pauseMs ?? 0).toBeGreaterThan(0);
        expect(s.say).not.toMatch(/undefined|null|\[object/);
      }
    }
  });
  it("ステージ2 から（W13〜）は 英語で 話す。W21〜 は 英語だけ", () => {
    for (const lesson of LESSONS.filter((l) => l.world >= 13)) {
      const segs = autoScript(lesson);
      expect(segs.every((s) => s.lang === "en"), `L${lesson.lessonNo}`).toBe(true);
      if (lesson.world >= 21) expect(englishShare({ minutes: 3, segments: segs })).toBeGreaterThanOrEqual(immersionFor(lesson.world).minEnglishShare);
    }
  });
  it("W1〜6 は 日本語の 説明つき（mix）", () => {
    const segs = autoScript(noScript(L(40)));
    expect(segs.some((s) => s.lang === "mix")).toBe(true);
  });
  it("会話の あいてへ つなぐ", () => {
    expect(autoScript(noScript(L(10)), "kiko").at(-1)!.say).toContain("キコちゃん");
    expect(autoScript(noScript(L(1100)), "birimo").at(-1)!.say).toContain("Birimo");
  });
  it("まちがった 台本（セグメントが すくない）は 自動の 授業に する", () => {
    const l = { ...L(1), teacher: { minutes: 3, segments: [{ kind: "greet" as const, lang: "en" as const, say: "Hi" }] } };
    expect(buildTeacherTimeline(l).source).toBe("auto");
  });
  it("まち時間の 合図", () => {
    expect(pausePrompt("repeat")).toBe("いってみよう！");
    expect(pausePrompt("tpr")).toContain("からだ");
    expect(pausePrompt("check")).toContain("かんがえ");
  });
});

describe("口の 形", () => {
  it("英語の 文字", () => {
    expect([...Array(3)].map((_, i) => visemeAt("map", i))).toEqual(["m", "a", "m"]);
    expect(visemeOf("o")).toBe("o");
    expect(visemeOf("f")).toBe("f");
    expect(visemeOf("w")).toBe("u");
    expect(visemeAt("hi there", 2)).toBe("rest");
  });
  it("かな（カタカナも）", () => {
    expect([..."あいうえお"].map((c) => visemeOf(c))).toEqual(["a", "e", "u", "e", "o"]);
    expect(visemeOf("カ")).toBe("a");
    expect(visemeOf("ん")).toBe("m");
    expect(visemeOf("ー", "o")).toBe("o");
  });
  it("はんいの 外は 口を とじる", () => {
    expect(visemeAt("abc", -1)).toBe("rest");
    expect(visemeAt("abc", 3)).toBe("rest");
    expect(visemeAt("", 0)).toBe("rest");
  });
});

describe("動画と 字幕・声", () => {
  it("videoUrl の となりの .vtt", () => {
    expect(vttUrlFor("/media/teacher/lesson-0001.mp4")).toBe("/media/teacher/lesson-0001.vtt");
    expect(vttUrlFor("https://cdn.example.test/v/l1.webm?sig=abc")).toBe("https://cdn.example.test/v/l1.vtt?sig=abc");
    expect(vttUrlFor("/media/teacher/l1")).toBe("/media/teacher/l1.vtt");
    expect(vttUrlFor("")).toBeNull();
    expect(vttUrlFor(undefined)).toBeNull();
  });
  it("en-US と ja-JP の 女性の 声を えらぶ", () => {
    const v = (name: string, lang: string) => ({ name, lang }) as SpeechSynthesisVoice;
    const voices = [v("Microsoft Guy Online - English (United States)", "en-US"), v("Microsoft Aria Online - English (United States)", "en-US"), v("Google UK English Male", "en-GB"),
      v("Microsoft Keita - Japanese", "ja-JP"), v("Microsoft Nanami Online - Japanese", "ja-JP")];
    expect(pickVoice(voices, "en")?.name).toContain("Aria");
    expect(pickVoice(voices, "ja")?.name).toContain("Nanami");
    expect(pickVoice([v("Daniel", "en-GB")], "en")?.name).toBe("Daniel");
    expect(pickVoice([], "en")).toBeNull();
  });
});
