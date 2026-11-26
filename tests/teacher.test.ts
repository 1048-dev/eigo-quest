/**
 * run8: エマ先生の 授業台本（lesson.teacher）の 検証。docs/teacher-plan.md
 */
import { describe, expect, it } from "vitest";
import { LESSONS } from "@/lib/curriculum";
import { LessonResponseSchema } from "@/lib/api/contracts";
import type { TeacherSegmentKind } from "@/lib/domain/types";
import {
  TEACHER_MAX_MS,
  TEACHER_MIN_MS,
  countEnWords,
  countJaChars,
  englishShare,
  immersionFor,
  scriptMs,
  speechMs,
  unknownSlideItems,
} from "@/lib/teacher/timing";

const ORDER: TeacherSegmentKind[] = ["greet", "goal", "words", "expressions", "phonics", "tpr", "repeat", "check", "wrap"];
/** この run で 台本が そろって いるべき 範囲（フェーズが すすんだら のばす） */
const REQUIRED_RANGE: [number, number] = [1, 750];

const withTeacher = LESSONS.filter((l) => l.teacher);

describe("timing helpers", () => {
  it("英語の 語・日本語の 文字を 数える", () => {
    expect(countEnWords("Hello! I'm Emma.")).toBe(3);
    expect(countJaChars("こんにちは！ エマ 先生")).toBe(9);
    expect(speechMs("Hello")).toBeGreaterThan(0);
  });
  it("イマージョンの はんいは ワールドが すすむほど 英語が ふえる", () => {
    const worlds = [1, 3, 7, 13, 21].map(immersionFor);
    for (let i = 1; i < worlds.length; i++) expect(worlds[i].minEnglishShare).toBeGreaterThan(worlds[i - 1].minEnglishShare);
    expect(immersionFor(21).allowJaSegments).toBe(false);
  });
});

describe("lesson.teacher（授業台本）", () => {
  it(`L${REQUIRED_RANGE[0]}〜${REQUIRED_RANGE[1]} に 台本が ある`, () => {
    const missing = LESSONS.filter((l) => l.lessonNo >= REQUIRED_RANGE[0] && l.lessonNo <= REQUIRED_RANGE[1] && !l.teacher).map((l) => l.lessonNo);
    expect(missing).toEqual([]);
  });

  it("むかしの teacherScript（みじかい 要約）も のこっている", () => {
    for (const l of withTeacher) expect(l.teacherScript.length, `L${l.lessonNo}`).toBeGreaterThan(0);
  });

  it("セグメント 8 個以上、9 つの kind が この 順番で ぜんぶ ある", () => {
    for (const l of withTeacher) {
      const segs = l.teacher!.segments;
      expect(segs.length, `L${l.lessonNo}`).toBeGreaterThanOrEqual(8);
      expect(segs[0].kind, `L${l.lessonNo}`).toBe("greet");
      expect(segs[segs.length - 1].kind, `L${l.lessonNo}`).toBe("wrap");
      for (const k of ORDER) expect(segs.some((s) => s.kind === k), `L${l.lessonNo} ${k}`).toBe(true);
      const idx = segs.map((s) => ORDER.indexOf(s.kind));
      for (let i = 1; i < idx.length; i++) expect(idx[i], `L${l.lessonNo} seg${i}`).toBeGreaterThanOrEqual(idx[i - 1]);
    }
  });

  it("話す 長さが 3〜4 分（まち時間を ふくむ）、minutes も 3〜4", () => {
    for (const l of withTeacher) {
      const ms = scriptMs(l.teacher!);
      expect(ms, `L${l.lessonNo}`).toBeGreaterThanOrEqual(TEACHER_MIN_MS);
      expect(ms, `L${l.lessonNo}`).toBeLessThanOrEqual(TEACHER_MAX_MS);
      expect(l.teacher!.minutes, `L${l.lessonNo}`).toBeGreaterThanOrEqual(3);
      expect(l.teacher!.minutes, `L${l.lessonNo}`).toBeLessThanOrEqual(4);
    }
  });

  it("repeat には まち時間（1.5 秒以上）、tpr にも まち時間", () => {
    for (const l of withTeacher) {
      for (const s of l.teacher!.segments) {
        if (s.kind === "repeat") expect(s.pauseMs ?? 0, `L${l.lessonNo} ${s.say}`).toBeGreaterThanOrEqual(1500);
        if (s.pauseMs !== undefined) expect(s.pauseMs, `L${l.lessonNo}`).toBeLessThanOrEqual(8000);
      }
      expect(l.teacher!.segments.some((s) => s.kind === "tpr" && (s.pauseMs ?? 0) >= 2000), `L${l.lessonNo}`).toBe(true);
    }
  });

  it("スライドの ことばは レッスンに ある", () => {
    for (const l of withTeacher) {
      expect(unknownSlideItems(l), `L${l.lessonNo}`).toEqual([]);
      for (const s of l.teacher!.segments) if (s.slide) {
        expect(s.slide.title.trim().length, `L${l.lessonNo}`).toBeGreaterThan(0);
        expect(s.slide.items.length, `L${l.lessonNo}`).toBeLessThanOrEqual(7);
      }
    }
  });

  it("字幕: すべてに 日本語字幕、英語が 入る セグメントには 英語字幕。lang と 中身が あう", () => {
    for (const l of withTeacher) {
      for (const s of l.teacher!.segments) {
        const tag = `L${l.lessonNo} ${s.kind}: ${s.say.slice(0, 30)}`;
        expect(s.say.trim().length, tag).toBeGreaterThan(0);
        expect(s.subtitleJa?.trim().length ?? 0, tag).toBeGreaterThan(0);
        const en = countEnWords(s.say);
        const ja = countJaChars(s.say);
        if (en > 0) expect(s.subtitleEn?.trim().length ?? 0, tag).toBeGreaterThan(0);
        if (s.lang === "en") expect(ja, tag).toBe(0);
        if (s.lang === "ja") expect(en, tag).toBe(0);
        if (s.lang === "mix") expect(en > 0 && ja > 0, tag).toBe(true);
      }
    }
  });

  it("英語の わりあいが ワールドの めやすの 中（W21〜 は 英語だけ）", () => {
    for (const l of withTeacher) {
      const band = immersionFor(l.world);
      const share = englishShare(l.teacher!);
      expect(share, `L${l.lessonNo}`).toBeGreaterThanOrEqual(band.minEnglishShare);
      expect(share, `L${l.lessonNo}`).toBeLessThanOrEqual(band.maxEnglishShare);
      if (!band.allowJaSegments) expect(l.teacher!.segments.filter((s) => s.lang === "ja").length, `L${l.lessonNo}`).toBe(0);
    }
  });

  it("会社名・ドル表記・ほんとうの なまえを たずねる 文が ない", () => {
    for (const l of withTeacher) {
      const text = l.teacher!.segments.map((s) => `${s.say} ${s.subtitleJa ?? ""} ${s.subtitleEn ?? ""}`).join(" ");
      expect(text, `L${l.lessonNo}`).not.toMatch(/\b(dollars?|cents?)\b/i);
      expect(text, `L${l.lessonNo}`).not.toMatch(/じゅうしょ|がっこうの なまえ|your address|which school/i);
    }
  });

  it("API の 契約を とおっても 台本が のこる（こわれた セグメントは すてられる）", () => {
    const l = withTeacher[0];
    if (!l) return;
    const parsed = LessonResponseSchema.parse({ lesson: l, items: [], steps: [] });
    expect(parsed.lesson?.teacher?.segments.length).toBe(l.teacher!.segments.length);
    const broken = LessonResponseSchema.parse({ lesson: { ...l, teacher: { minutes: 3, segments: [{ kind: "nope", say: "x" }, l.teacher!.segments[0]] } }, items: [], steps: [] });
    expect(broken.lesson?.teacher?.segments.length).toBe(1);
    const none = LessonResponseSchema.parse({ lesson: { ...l, teacher: undefined }, items: [], steps: [] });
    expect(none.lesson?.teacher).toBeUndefined();
  });
});
