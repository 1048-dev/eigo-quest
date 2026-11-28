/**
 * run11 決定 3: のこって いた つづりの ゆれを アメリカで ふつうの 形に そろえた。
 *   me too（Me, too ではなく）・seat belt・tug-of-war・lunchtime
 * 教材・としょかん・力だめし に もとの 形が もどらない こと、学習項目 ID が あたらしい つづりに なって いる こと、
 * フレーズブックの lint / fix が つかまえる こと を しらべる。
 * run11 決定 4: L1011〜1018 の「イギリス英語 と アメリカ英語」レッスンは そのまま（UK の つづりも のこす）。
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyPhrasebook, phrasebookHits } from "../scripts/lib/phrasebook";
import { ALL_ITEMS, LESSONS } from "../src/lib/curriculum";

const ROOT = path.join(__dirname, "..", "content");
const jsonFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? jsonFiles(path.join(dir, d.name)) : d.name.endsWith(".json") ? [path.join(dir, d.name)] : []));

const OLD_FORMS: [string, RegExp][] = [
  ["Me, too（ひとことの へんじ）", /(^|[.!?「"“(]\s*)Me, too\b/],
  ["seatbelt", /\bseatbelts?\b/i],
  ["tug of war", /\btug of war\b/i],
  ["lunch time", /\blunch time\b/i],
];

describe("run11 決定 3: つづりの ゆれ", () => {
  const files = jsonFiles(ROOT);
  it("教材の JSON を よんで いる（空振りして いない）", () => {
    expect(files.length).toBeGreaterThan(40);
  });

  it("content/ に もとの 形が のこって いない", () => {
    const bad: string[] = [];
    for (const f of files) {
      const lines = readFileSync(f, "utf8").split(/\r?\n/);
      lines.forEach((line, i) => {
        for (const [name, re] of OLD_FORMS) if (re.test(line)) bad.push(`${path.relative(ROOT, f)}:${i + 1} ${name}`);
      });
    }
    expect(bad).toEqual([]);
  });

  it("学習項目 ID は あたらしい つづり", () => {
    const ids = ALL_ITEMS.map((it) => it.id);
    for (const id of ["L177-W-lunchtime", "L302-W-tug-of-war", "L302-C-play-tug-of-war", "L349-W-tug-of-war", "L996-W-seat-belt", "L996-C-fasten-your-seat-belt-click"]) {
      expect(ids, id).toContain(id);
    }
    expect(ids.filter((id) => /seatbelt|lunch-time/.test(id))).toEqual([]);
    expect(ALL_ITEMS.filter((it) => /\b(seatbelt|lunch time|tug of war)\b/i.test(it.text)).map((it) => it.id)).toEqual([]);
  });

  it("フレーズブックの lint が もとの 形を error に して、fix で なおせる", () => {
    for (const [before, after] of [
      ["Fasten your seatbelt!", "Fasten your seat belt!"],
      ["Seatbelts on, everyone.", "Seat belts on, everyone."],
      ["We played tug of war.", "We played tug-of-war."],
      ["Tug of war! つなひき。", "Tug-of-war! つなひき。"],
      ["It's lunch time.", "It's lunchtime."],
      ["Lunch time! What do you want?", "Lunchtime! What do you want?"],
      ["Me, too!", "Me too!"],
    ]) {
      expect(phrasebookHits(before, 3).length, before).toBeGreaterThan(0);
      const r = applyPhrasebook(before, 3);
      expect(r.text).toBe(after);
      expect(phrasebookHits(r.text, 3), after).toEqual([]);
      expect(applyPhrasebook(r.text, 3).text).toBe(after); // 2回 かけても おなじ
    }
  });

  it("あたらしい 形は lint に ひっかからない", () => {
    for (const t of ["Fasten your seat belt!", "We played tug-of-war.", "It's lunchtime.", "Me too!", "It's bath time.", "Can I come, too?"]) {
      expect(phrasebookHits(t, 3).filter((h) => h.fn === "spelling" || h.fn === "agree"), t).toEqual([]);
    }
  });
});

describe("run11 決定 4: L1011〜1018 の UK と US の くらべっこ は そのまま", () => {
  it("UK の つづり（colour・centre・theatre・favourite）が のこって いる", () => {
    const lessons = LESSONS.filter((l) => l.lessonNo >= 1011 && l.lessonNo <= 1018);
    expect(lessons).toHaveLength(8);
    const text = JSON.stringify(lessons);
    for (const w of ["colour", "centre", "theatre", "favourite"]) expect(text, w).toContain(w);
  });
});
