/**
 * run8 P9: 先生の 動画用の 書きだし（src/lib/teacherVideo/export.ts）・動画の マニフェスト・手動プロバイダー
 */
import { describe, expect, it } from "vitest";
import manifestRaw from "@content/teacher-videos.json";
import { LESSONS, TOTAL_LESSONS, getLesson } from "@/lib/curriculum";
import { buildLessonFlow } from "@/lib/curriculum/questions";
import { buildTeacherTimeline } from "@/lib/teacher/timeline";
import { scriptMs } from "@/lib/teacher/timing";
import {
  buildTeacherExport,
  csvCell,
  groupSentences,
  lessonDirName,
  renderScriptTxt,
  renderSlides,
  renderSummaryCsv,
  renderVtt,
  splitSentences,
  subtitleCues,
  summaryTotals,
  vttTime,
} from "@/lib/teacherVideo/export";
import { isAllowedVideoUrl, teacherVideoUrl, urlFromPattern, validateManifest, withVideo, withoutVideo, type TeacherVideoManifest } from "@/lib/teacherVideo/manifest";
import { getTeacherVideoProvider, manualProvider } from "@/lib/teacherVideo";

const L1 = getLesson(1)!;
const x1 = buildTeacherExport(L1);

describe("teacher export: 1 レッスン", () => {
  it("L1 は 台本（script）を そのまま 書きだす・長さは timing.ts と 同じ", () => {
    expect(x1.source).toBe("script");
    expect(x1.segments).toHaveLength(L1.teacher!.segments.length);
    expect(x1.segments.map((s) => s.say)).toEqual(L1.teacher!.segments.map((s) => s.say));
    expect(Math.abs(x1.totalMs - scriptMs(L1.teacher!)) / scriptMs(L1.teacher!)).toBeLessThan(0.05);
    expect(x1.totalMs).toBe(buildTeacherTimeline(L1).totalMs);
    expect(x1.speakMs + x1.pauseMs).toBeLessThan(x1.totalMs);
  });

  it("script.txt: メモは # 行・まち時間は [PAUSE n.ns]・話す 文は ぜんぶ 入る", () => {
    const txt = renderScriptTxt(x1);
    expect(txt.startsWith("# L0001 ")).toBe(true);
    for (const s of x1.segments) expect(txt).toContain(s.say.trim());
    const pauses = x1.segments.filter((s) => s.pauseMs > 0).length;
    expect((txt.match(/^\[PAUSE \d+\.\ds\]/gm) ?? []).length).toBe(pauses);
    // # でも [PAUSE でも ない 行 = 読む 文。セグメントの 数と 同じ
    const spoken = txt.split("\n").filter((l) => l.trim() && !l.startsWith("#") && !l.startsWith("[PAUSE"));
    expect(spoken).toHaveLength(x1.segments.length);
  });

  it("subtitles.vtt: WEBVTT・時刻は ふえていく・日本語と 英語が 入る・まち時間の 字幕", () => {
    const vtt = renderVtt(x1);
    expect(vtt.startsWith("WEBVTT\n")).toBe(true);
    const cues = subtitleCues(x1);
    expect(cues.length).toBeGreaterThanOrEqual(x1.segments.length);
    for (let i = 0; i < cues.length; i++) {
      expect(cues[i].endMs).toBeGreaterThan(cues[i].startMs);
      if (i > 0) expect(cues[i].startMs).toBeGreaterThanOrEqual(cues[i - 1].endMs - 1);
    }
    expect(cues[cues.length - 1].endMs).toBeLessThanOrEqual(x1.totalMs);
    expect(vtt).toMatch(/[ぁ-ん]/);
    expect(vtt).toMatch(/Hello/);
    expect(vtt).toContain("（いってみよう！）");
    expect(vtt).not.toMatch(/-->.*-->/);
    expect(vtt).toMatch(/^00:00:00\.000 --> \d\d:\d\d:\d\d\.\d{3}$/m);
    // 1 つの 字幕が ながすぎない（ことばの 字幕は 7 秒 + すこし まで。わけられない 1 文は のぞく）
    const ja = renderVtt(x1, { ja: true, en: false });
    const en = renderVtt(x1, { ja: false, en: true });
    expect(ja).not.toMatch(/Hello, everyone/);
    expect(en).not.toMatch(/こんにちは/);
  });

  it("slides.json: セグメントごとに 1 まい・時刻つき", () => {
    const s = renderSlides(x1);
    expect(s.slides).toHaveLength(x1.segments.length);
    expect(s.slides[0].startMs).toBe(0);
    expect(s.slides[1].startMs).toBe(s.slides[0].endMs);
    expect(s.slides.every((x) => typeof x.title === "string" && Array.isArray(x.items))).toBe(true);
  });

  it("台本が ない レッスンは 自動の 授業（auto）を 書きだす", () => {
    // run8: 1,200 レッスン ぜんぶに 台本が ある ので、台本を はずした コピーで ためす
    const l = { ...LESSONS[0], teacher: undefined };
    const x = buildTeacherExport(l, { partner: "riko" });
    expect(x.source).toBe("auto");
    expect(x.segments[0].kind).toBe("greet");
    expect(x.segments[x.segments.length - 1].kind).toBe("wrap");
    expect(renderScriptTxt(x)).toContain("source: auto");
  });
});

describe("teacher export: 小さな 関数", () => {
  it("vttTime / lessonDirName / csvCell", () => {
    expect(vttTime(0)).toBe("00:00:00.000");
    expect(vttTime(3_723_456)).toBe("01:02:03.456");
    expect(lessonDirName(7)).toBe("0007");
    expect(lessonDirName(1200)).toBe("1200");
    expect(csvCell('Hello, "Haru"')).toBe('"Hello, ""Haru"""');
    expect(csvCell("abc")).toBe("abc");
  });

  it("splitSentences / groupSentences", () => {
    expect(splitSentences("Hello! I'm Emma. こんにちは！ よろしくね。")).toEqual(["Hello!", "I'm Emma.", "こんにちは！", "よろしくね。"]);
    expect(splitSentences("hello は「こんにちは」。てを ふろう。")).toEqual(["hello は「こんにちは」。", "てを ふろう。"]);
    expect(groupSentences(["a.", "b.", "c.", "d."], 2)).toHaveLength(2);
    expect(groupSentences(["a.", "b."], 5)).toEqual(["a.", "b."]);
    expect(groupSentences(["a.", "b."], 1)).toEqual(["a. b."]);
    expect(groupSentences([], 3)).toEqual([]);
    expect(groupSentences(["a.", "b.", "c.", "d.", "e."], 3).join(" ")).toBe("a. b. c. d. e.");
  });
});

describe("teacher export: 全レッスン と summary.csv", () => {
  const all = LESSONS.map((l) => buildTeacherExport(l));

  it("1,200 レッスン ぜんぶ 書きだせる（こわれた 字幕・からの セグメントが ない）", () => {
    expect(all).toHaveLength(TOTAL_LESSONS);
    for (const x of all) {
      expect(x.segments.length).toBeGreaterThanOrEqual(3);
      expect(x.totalMs).toBeGreaterThan(60_000);
      expect(x.segments.every((s) => s.say.trim().length > 0)).toBe(true);
      const cues = subtitleCues(x);
      expect(cues.every((c) => c.endMs > c.startMs && (c.ja || c.en))).toBe(true);
    }
  });

  it("summary.csv: BOM・見出し・1 レッスン 1 行・さいごに TOTAL・合計が あう", () => {
    const csv = renderSummaryCsv(all);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    const lines = csv.slice(1).trimEnd().split("\r\n");
    expect(lines[0].startsWith("lessonNo,world,stage,title")).toBe(true);
    expect(lines).toHaveLength(TOTAL_LESSONS + 2);
    expect(lines[lines.length - 1].startsWith("TOTAL,")).toBe(true);
    const t = summaryTotals(all);
    expect(t.lessons).toBe(TOTAL_LESSONS);
    expect(t.scriptLessons + t.autoLessons).toBe(TOTAL_LESSONS);
    expect(t.totalMs).toBe(all.reduce((a, x) => a + x.totalMs, 0));
    expect(t.minutesRoundedUp).toBeGreaterThanOrEqual(Math.ceil(t.totalMs / 60_000));
    expect(lines[lines.length - 1]).toContain((t.totalMs / 60_000).toFixed(2));
  });
});

describe("teacher video: マニフェスト と 手動プロバイダー", () => {
  const empty: TeacherVideoManifest = { version: 1, videos: {} };
  const now = new Date("2026-11-26T00:00:00Z");

  it("リポジトリの マニフェストは 正しい 形", () => {
    expect(validateManifest(manifestRaw, TOTAL_LESSONS)).toEqual([]);
  });

  it("URL は https:// か / から はじまる パスだけ", () => {
    expect(isAllowedVideoUrl("https://cdn.example.com/teacher/lesson-0001.mp4")).toBe(true);
    expect(isAllowedVideoUrl("/videos/lesson-0001.mp4")).toBe(true);
    expect(isAllowedVideoUrl("javascript:alert(1)")).toBe(false);
    expect(isAllowedVideoUrl("http://cdn.example.com/a.mp4")).toBe(false);
    expect(isAllowedVideoUrl("//cdn.example.com/a.mp4")).toBe(false);
    expect(isAllowedVideoUrl("")).toBe(false);
  });

  it("withVideo / withoutVideo / urlFromPattern / teacherVideoUrl", () => {
    const m = withVideo(empty, 12, "https://cdn.example.com/t/lesson-0012.mp4", { now });
    expect(empty.videos).toEqual({});
    expect(m.videos["12"]).toEqual({ url: "https://cdn.example.com/t/lesson-0012.mp4", provider: "manual", linkedAt: "2026-11-26T00:00:00.000Z" });
    expect(teacherVideoUrl(12, m)).toBe("https://cdn.example.com/t/lesson-0012.mp4");
    expect(teacherVideoUrl(13, m)).toBeUndefined();
    expect(teacherVideoUrl(12, withoutVideo(m, 12))).toBeUndefined();
    expect(() => withVideo(empty, 1, "ftp://x/y.mp4")).toThrow();
    expect(urlFromPattern("https://x/lesson-{nnnn}.mp4", 7)).toBe("https://x/lesson-0007.mp4");
    expect(urlFromPattern("https://x/{n}.mp4", 7)).toBe("https://x/7.mp4");
    const two = withVideo(withVideo(empty, 30, "/a.mp4", { now }), 2, "/b.mp4", { now });
    expect(Object.keys(two.videos)).toEqual(["2", "30"]);
    expect(validateManifest(two, TOTAL_LESSONS)).toEqual([]);
    expect(validateManifest({ version: 1, videos: { "1": { url: "javascript:x", provider: "manual", linkedAt: "" } } }).length).toBe(1);
    expect(validateManifest({ version: 1, videos: { "9999": { url: "/a.mp4", provider: "manual", linkedAt: "" } } }, 1200)[0]).toMatch(/does not exist/);
  });

  it("手動プロバイダー: つないで あれば ready（字幕は となりの .vtt）、なければ pending と つぎに すること", async () => {
    const m = withVideo(empty, 5, "https://cdn.example.com/t/lesson-0005.mp4", { now });
    const p = manualProvider(m);
    expect(await p.generate({ lessonNo: 5 })).toEqual({
      status: "ready", provider: "manual", lessonNo: 5,
      videoUrl: "https://cdn.example.com/t/lesson-0005.mp4", subtitlesUrl: "https://cdn.example.com/t/lesson-0005.vtt",
    });
    const r = await p.generate({ lessonNo: 6 });
    expect(r.status).toBe("pending");
    if (r.status === "pending") expect(r.nextStepsJa.join("\n")).toContain("teacher-link.ts link 6");
    expect(getTeacherVideoProvider().id).toBe("manual");
    expect(() => getTeacherVideoProvider("nope")).toThrow();
  });

  it("レッスンの ながれ: 動画が つないで いない レッスンは videoUrl なし（バーチャル先生）", () => {
    const step = buildLessonFlow(L1)[0];
    expect(step.kind).toBe("teacher_video");
    if (step.kind === "teacher_video") expect(step.videoUrl).toBe(teacherVideoUrl(1));
  });
});
