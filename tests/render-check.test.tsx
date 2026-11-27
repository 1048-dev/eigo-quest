/**
 * run10 Phase 3: 画面の 描画の 確認（npm run check:render）の テスト。
 *  - いくつかの レッスン・テスト・としょかん・力だめしを ほんとうに 描いて 問題 0
 *  - わざと こわした 画面（エラー・key なし・おなじ key・文字が ない・undefined・名前の ない ボタン・<div> in <p>）を 見つける
 *  - 見つけて なおした もの（発音の 結果の key）の 再発ふせぎ
 * ぜんぶ（1,200 レッスン・33 万 画面）は npm run check:render（ワーカーで 約 5 分）。
 */
import { describe, expect, it, vi } from "vitest";

// おなじ key の リストを 見つける しかけ（JSX の 関数を つつむ）。vitest は jsx-dev-runtime を つかう
vi.mock("react/jsx-dev-runtime", async (importOriginal) => {
  const { wrapJsxRuntime } = await import("../scripts/lib/renderHooks");
  return wrapJsxRuntime(await importOriginal<Record<string, unknown>>());
});

import { renderToStaticMarkup } from "react-dom/server";
import {
  chantCases, emptyTally, lessonCases, nestingProblems, problemCount, renderCase, renderUnits, runUnit, storyCases, talkCases, testCases, testUnits, yearlyCases,
} from "../scripts/lib/renderCheck";
import { SpeakButton } from "@/components/test/QuestionView";
import { Flashcards } from "@/components/lesson/LessonSteps";
import { scorePronunciation } from "@/lib/speech/pronunciation";
import { loadChants, loadStoryStage, loadTalkThemes } from "@/lib/library/catalog";
import { loadYearlyTest } from "@/lib/yearly/catalog";
import { itemsOfLesson, getLesson } from "@/lib/curriculum";

const noop = () => {};
const problemsOf = (cases: { where: string; el: React.ReactElement; expect?: readonly (string | undefined | null | false)[] }[]) => cases.flatMap(renderCase);

describe("描画の 確認: ほんものの 画面", () => {
  it.each([1, 2, 5, 60, 600, 1200])("L%i の ぜんぶの 画面（ステップ・先生・まとめ・かいわ）が 問題 0", (n) => {
    const c = lessonCases(n);
    expect(c.lesson.length).toBeGreaterThan(50);
    expect(c.teacher.length).toBeGreaterThan(20);
    expect(c.recap.length).toBeGreaterThan(20);
    expect(problemsOf([...c.lesson, ...c.teacher, ...c.recap, ...c.conversation])).toEqual([]);
  });

  it("テスト（復習・まとめ・ボス・アリーナ × モード・お宝）の 画面が 問題 0", () => {
    const units = testUnits();
    expect(units.length).toBe(3035);
    const pick = ["check-1", "mini-1-5", "boss-1-30", "boss-1-1200", "treasure-7"].map((id) => units.find((u) => u.id === id)!).concat(units.filter((u) => u.id.startsWith("arena-")).slice(0, 5));
    for (const u of pick) {
      const r = testCases(u);
      expect(r.questions, u.id).toBeGreaterThan(0);
      expect(problemsOf(r.cases), u.id).toEqual([]);
    }
  });

  it("としょかん（おはなし ステージ1・チャンツ・フリートーク）と 力だめし ステージ1・5 が 問題 0", async () => {
    const stories = await loadStoryStage(1);
    expect(stories.length).toBeGreaterThan(0);
    expect(problemsOf(stories.slice(0, 5).flatMap(storyCases))).toEqual([]);
    expect(problemsOf((await loadChants()).slice(0, 5).flatMap(chantCases))).toEqual([]);
    expect(problemsOf((await loadTalkThemes()).slice(0, 3).flatMap(talkCases))).toEqual([]);
    for (const stage of [1, 5]) expect(problemsOf(yearlyCases((await loadYearlyTest(stage))!))).toEqual([]);
  });

  it("単位は レッスン 1,200・テスト 3,035・おはなし 5 ステージ・チャンツ・フリートーク・力だめし 5", async () => {
    const units = renderUnits();
    expect(units.filter((u) => u.kind === "lesson").length).toBe(1200);
    expect(units.filter((u) => u.kind === "test").length).toBe(3035);
    expect(units.filter((u) => u.kind === "stories").length).toBe(5);
    expect(units.filter((u) => u.kind === "yearly").length).toBe(5);
    const tally = emptyTally();
    await runUnit({ kind: "lesson", n: 3 }, tally);
    expect(problemCount(tally)).toBe(0);
    expect(tally.lesson.renders).toBeGreaterThan(50);
    expect(tally.lesson.counts["しらべた 文字"]).toBeGreaterThan(200);
  });
});

describe("描画の 確認: わざと こわした 画面を 見つける", () => {
  it("描画中の エラー", () => {
    const Boom = () => { throw new Error("boom"); };
    expect(renderCase({ where: "x", el: <Boom /> }).join()).toMatch(/描画で エラー: boom/);
  });

  it("key が ない リスト（React の 警告）", () => {
    const List = () => <ul>{["a", "b"].map((x) => <li>{x}</li>)}</ul>;
    expect(renderCase({ where: "x", el: <List /> }).join()).toMatch(/unique "key"/);
  });

  it("おなじ key の リスト", () => {
    const List = () => <ul>{["a", "a", "b"].map((x) => <li key={x}>{x}</li>)}</ul>;
    expect(renderCase({ where: "x", el: <List /> }).join()).toMatch(/おなじ key「a」/);
  });

  it("出る はずの 文字が ない・undefined / NaN・名前の ない ボタン・<div> in <p>", () => {
    expect(renderCase({ where: "x", el: <p>Hello</p>, expect: ["Good morning"] }).join()).toMatch(/「Good morning」が 画面に ない/);
    expect(renderCase({ where: "x", el: <p>Hello</p>, expect: ["H e l l o"] })).toEqual([]);
    expect(renderCase({ where: "x", el: <p>{`${undefined}`} words</p> }).join()).toMatch(/undefined/);
    expect(renderCase({ where: "x", el: <p>{`${0 / 0}`}</p> }).join()).toMatch(/NaN/);
    expect(renderCase({ where: "x", el: <span className={`a ${undefined}`}>ok</span> }).join()).toMatch(/属性に/);
    expect(renderCase({ where: "x", el: <button /> }).join()).toMatch(/名前も ない ボタン/);
    expect(renderCase({ where: "x", el: <button aria-label="とじる" /> })).toEqual([]);
    expect(renderCase({ where: "x", el: <p><div>x</div></p> }).join()).toMatch(/<div> が <p> の 中/);
  });

  it("HTML の 入れ子の きまり", () => {
    expect(nestingProblems("<button><a href='/'>x</a></button>")).toEqual(["<a> が <button> の 中に ある"]);
    expect(nestingProblems("<div><li>x</li></div>")).toEqual(["<li> の 親が <div>"]);
    expect(nestingProblems("<ul><li><p>x</p></li></ul><p>a<br/>b</p><svg><circle /><text>1</text></svg>")).toEqual([]);
  });
});

describe("描画の 確認で 見つけて なおした もの", () => {
  it("発音の 結果: おなじ ことばが 2回 ある 文（Bye, bye.・I'm …, I'm …）でも key が かさならない", () => {
    for (const text of ["Bye, bye.", "I'm Haru. I'm happy.", "Look, look!"]) {
      const last = scorePronunciation(text, text, 0.9);
      expect(renderCase({ where: text, el: <SpeakButton target={text} itemId="x" onDone={noop} initial={{ last }} />, expect: last.wordResults.map((w) => w.word) }), text).toEqual([]);
    }
  });

  it("initial を わたさない ときは 今までと おなじ（1まいめ・おもて）", () => {
    const items = itemsOfLesson(getLesson(1)!).filter((i) => i.kind === "WORD").slice(0, 3);
    const html = renderToStaticMarkup(<Flashcards items={items} onDone={noop} />);
    expect(html).toContain(`（1/${items.length}）`);
    expect(html).not.toContain(items[0].ja);
  });
});
