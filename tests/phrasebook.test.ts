/**
 * run10 Phase 5: フレーズブック（scripts/lib/phrasebook.ts・docs/phrasebook.md・english:lint の phrasebook・phrasebook:fix）
 *  - つかわない 形・ステージの そとの 形を 見つける／正しい 形は 見のがす
 *  - 自動の なおし（Bye-bye・Me, too・I'm so-so …）が 意味を かえず、2回 かけても おなじ
 *  - ぜんぶの レッスン・としょかん・力だめし・アプリの 文字で phrasebook が 0（再発ふせぎ）
 *  - docs/phrasebook.md が データと おなじ（最新）
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { applyPhrasebook, fixByeBye, PHRASEBOOK, phrasebookHits } from "../scripts/lib/phrasebook";
import { lintEntries, type TextEntry } from "../scripts/lib/englishLint";
import { collectLessons, collectLibrary, collectYearly, lintSource, parseArgs, rangeName } from "../scripts/english-lint";
import { collectSlots, contentFiles, diffSnippet, fixJson, fixText, MANUAL_EDITS, valueTokens } from "../scripts/phrasebook-fix";
import { DOC_PATH, formRegex, formStat, loadUnits, renderPhrasebook } from "../scripts/phrasebook-doc";
import { extractStrings, stripComments } from "../scripts/lib/sourceStrings";

const ROOT = path.resolve(__dirname, "..");
const hits = (t: string, stage: number | null = 1) => phrasebookHits(t, stage).map((h) => h.fn);

describe("データの 形", () => {
  it("id は かさならない・canonical が ある・ステージは 1〜5・from ≦ to", () => {
    const ids = PHRASEBOOK.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(PHRASEBOOK.length).toBeGreaterThanOrEqual(20);
    for (const f of PHRASEBOOK) {
      expect(f.canonical.length, f.id).toBeGreaterThan(0);
      for (const c of f.canonical) {
        expect(c.stages[0]).toBeGreaterThanOrEqual(1);
        expect(c.stages[1]).toBeLessThanOrEqual(5);
        expect(c.stages[0]).toBeLessThanOrEqual(c.stages[1]);
      }
      for (const v of f.variants) {
        if (v.from && v.to) expect(v.from, v.form).toBeLessThanOrEqual(v.to);
        if (v.fix) expect(v.re, `${v.form}: fix には re が いる`).toBeDefined();
      }
      for (const a of f.avoid) {
        expect(a.why.length, a.form).toBeGreaterThan(5);
        expect(a.use.length, a.form).toBeGreaterThan(1);
        if (a.fix) expect(a.re, `${a.form}: fix には re が いる`).toBeDefined();
      }
    }
  });
  it("ステージ 1〜5 の どこでも、はたらきごとに canonical が ある", () => {
    for (const f of PHRASEBOOK) for (let s = 1; s <= 5; s++) expect(f.canonical.some((c) => c.stages[0] <= s && s <= c.stages[1]), `${f.id} stage ${s}`).toBe(true);
  });
  it("頼まれた はたらきが そろっている", () => {
    const ids = PHRASEBOOK.map((f) => f.id);
    for (const id of ["greeting", "goodbye", "name", "feelings", "praise", "encouragement", "classroom", "repeat-child", "turns", "agree", "thanks", "apology", "asking", "opinion"]) expect(ids).toContain(id);
  });
  it("avoid の re は その 形の 例に あたる・canonical には あたらない", () => {
    for (const f of PHRASEBOOK) {
      for (const c of f.canonical) for (const form of c.forms) {
        const t = form.replace(/～/g, "pizza");
        for (let s = c.stages[0]; s <= c.stages[1]; s++) expect(phrasebookHits(t, s), `${f.id}: "${t}" stage ${s}`).toEqual([]);
      }
    }
  });
});

describe("見つける もの・見のがす もの", () => {
  it("つかわない 形は どの ステージでも error", () => {
    expect(hits("Hmm... I'm so-so.")).toContain("how-are-you");
    expect(hits("Me, too! I like soccer.", 3)).toContain("agree");
    expect(hits("Please listen to my speech.")).toContain("speech");
    expect(hits("Once more, from the top!", 4)).toContain("repeat-teacher");
    expect(hits("Nice to meet you too.")).toContain("meeting");
    expect(hits("See you again!")).toContain("goodbye");
    expect(hits("Bye, bye!")).toContain("goodbye");
    expect(hits("Do you understand?")).toContain("checking");
    expect(hits("In my opinion, I think it's fun.", 4)).toContain("opinion");
    expect(hits("Brilliant!")).toContain("praise");
    expect(hits("Don't mind!")).toContain("apology");
  });
  it("正しい 形は 見のがす", () => {
    for (const t of ["Me too!", "Nice to meet you, too.", "I'm OK.", "The movie was so-so.", "Show me so-so.", "One more time!", "See you next time!", "Give me five!", "Excuse me. Where is the park?"]) expect(hits(t), t).toEqual([]);
  });
  it("Bye-bye は ステージ 1〜2 だけ", () => {
    expect(hits("Next, talk with Riko! Bye-bye!", 1)).toEqual([]);
    expect(hits("Next, talk with Riko! Bye-bye!", 2)).toEqual([]);
    for (const s of [3, 4, 5]) expect(hits("Next, talk with Riko! Bye-bye!", s)).toContain("goodbye");
  });
  it("まだ ならって いない 形（from より 前）は error", () => {
    expect(hits("I think it's fun.", 1)).toContain("opinion");
    expect(hits("I think it's fun.", 2)).toEqual([]);
    expect(hits("In my opinion, school lunch is great.", 2)).toContain("opinion");
    expect(hits("In my opinion, school lunch is great.", 3)).toEqual([]);
    expect(hits("Pardon?", 4)).toContain("repeat-child");
    expect(hits("Pardon?", 5)).toEqual([]);
    expect(hits("Here you go!", 1)).toContain("handing");
    expect(hits("Here you go!", 2)).toEqual([]);
    expect(hits("I agree because it's fun.", 2)).toContain("agree");
  });
  it("アプリの 文字（stage = null）: to が ある 形と avoid だけ", () => {
    expect(hits("Bye-bye!", null)).toContain("goodbye");
    expect(hits("I think so, too.", null)).toEqual([]); // テンプレートは ステージを しぼって 出す ことが ある
    expect(hits("Please listen to my speech.", null)).toContain("speech");
  });
  it("allowUnits の ユニットでは 見のがす", () => {
    const f = PHRASEBOOK.find((x) => x.avoid.some((a) => a.re))!;
    const a = f.avoid.find((x) => x.re)!;
    const sample = a.form.split(" / ")[0].replace(/\(.*?\)/g, "").trim();
    if (a.re!.test(sample)) {
      const saved = a.allowUnits;
      (a as { allowUnits?: readonly string[] }).allowUnits = ["L0999"];
      expect(phrasebookHits(sample, 1, "L0999").filter((h) => h.form === a.form)).toEqual([]);
      expect(phrasebookHits(sample, 1, "L0001").filter((h) => h.form === a.form).length).toBe(1);
      (a as { allowUnits?: readonly string[] }).allowUnits = saved;
    }
  });
  it("english:lint の ルール phrasebook（error）として 出る", () => {
    const e: TextEntry = { unit: "L0700", stage: 3, path: "teacher.segments[20].subtitleEn", text: "Great job! Next, talk with Riko! Bye-bye!", kind: "line", strict: false, spoken: true };
    const issues = lintEntries([e], { isKnownWord: () => true, names: [] });
    expect(issues.filter((i) => i.rule === "phrasebook").map((i) => i.level)).toEqual(["error"]);
    const mixed: TextEntry = { ...e, stage: 1, kind: "mixed", path: "teacher.segments[3].say", text: "おなじ ときは Me, too! だよ。" };
    expect(lintEntries([mixed], { isKnownWord: () => true, names: [] }).some((i) => i.rule === "phrasebook")).toBe(true);
  });
});

describe("自動の なおし", () => {
  it("Bye-bye: 先生の さいごは See you!（すぐ まえに See you なら Bye!）、ほかは Bye", () => {
    expect(fixByeBye("Next, go and talk with Riko! Bye-bye!")).toBe("Next, go and talk with Riko! See you!");
    expect(fixByeBye("Great job! See you! Bye-bye!")).toBe("Great job! See you! Bye!");
    expect(fixByeBye("It sank. Bye-bye, carrot!")).toBe("It sank. Bye, carrot!");
    expect(fixByeBye("Not at home. Bye-bye! Out!")).toBe("Not at home. Bye! Out!");
  });
  it("ステージで かわる: 1〜2 は そのまま", () => {
    expect(applyPhrasebook("Talk with Riko! Bye-bye!", 2).text).toBe("Talk with Riko! Bye-bye!");
    expect(applyPhrasebook("Talk with Riko! Bye-bye!", 3).text).toBe("Talk with Riko! See you!");
    expect(applyPhrasebook("Here you go, giraffe!", 1).text).toBe("Here you are, giraffe!");
    expect(applyPhrasebook("Here you go, giraffe!", 2).text).toBe("Here you go, giraffe!");
    expect(applyPhrasebook("No worries. Kind words help.", 2).text).toBe("No problem. Kind words help.");
  });
  it("つかわない 形を なおす（日本語まじりでも）", () => {
    expect(applyPhrasebook("おなじなら「Me, too!」", 1).text).toBe("おなじなら「Me too!」");
    expect(applyPhrasebook("Hmm... I'm so-so. So-so? Let's have a fun day!", 1).text).toBe("Hmm... I'm OK. Just OK? Let's have a fun day!");
    expect(applyPhrasebook("Once more, calmly.", 4).text).toBe("One more time, calmly.");
    expect(applyPhrasebook("Bye, bye! ゆらゆら", 1).text).toBe("Bye-bye! ゆらゆら");
    expect(applyPhrasebook("See you again!", 1).text).toBe("See you next time!");
  });
  it("なおした あとは phrasebook が 0・2回 かけても おなじ", () => {
    const samples: [string, number][] = [["Me, too! Bye-bye!", 4], ["I'm so-so.", 1], ["Here you go! Bye, bye!", 1], ["Once more! Nice to meet you too.", 3], ["Do you understand? In my opinion, I think so.", 4]];
    for (const [t, s] of samples) {
      const once = applyPhrasebook(t, s).text;
      expect(phrasebookHits(once, s), `${t} → ${once}`).toEqual([]);
      expect(applyPhrasebook(once, s).text).toBe(once);
    }
  });
  it("文脈の 置きかえ（MANUAL_EDITS）: L0239 の スピーチの はじめ", () => {
    expect(fixText('Start with "Please listen to my speech."', 1, "L0239").text).toBe('Start your speech! "Let me tell you about my hero."');
    expect(fixText("Please listen to my speech.", 1, "L0001").text).toBe("Please listen to my speech."); // ほかの ユニットは 自動で かえない（lint が 知らせる）
    expect(Object.keys(MANUAL_EDITS)).toContain("L0239");
  });
});

describe("JSON を くずさずに なおす", () => {
  const raw = '{\r\n  "world": 21,\r\n  "stage": 3,\r\n  "lessons": [\r\n    { "lessonNo": 601, "teacher": {}, "id": "Bye-bye", "en": "Talk with Riko! Bye-bye!", "ja": "またね \\"Me, too!\\"", "n": [1, "Me, too!"] }\r\n  ]\r\n}\r\n';
  it("値の 文字列だけ・ならびと 改行は そのまま", () => {
    expect(valueTokens(raw).map((t) => t.value)).toEqual(["Bye-bye", "Talk with Riko! Bye-bye!", 'またね "Me, too!"', "Me, too!"]);
    const slots = collectSlots(JSON.parse(raw), "world");
    expect(slots.map((s) => `${s.unit}:${s.stage}`)).toEqual(["L0601:3", "L0601:3", "L0601:3", "L0601:3"]);
    const r = fixJson(raw, "world", "x.json");
    expect(r.raw).toBe(raw.replace("Talk with Riko! Bye-bye!", "Talk with Riko! See you!").replace('\\"Me, too!\\"', '\\"Me too!\\"').replace('[1, "Me, too!"]', '[1, "Me too!"]'));
    expect(r.raw).toContain('"id": "Bye-bye"'); // id は かえない
    expect(r.changes.map((c) => c.fn).sort()).toEqual(["agree", "agree", "goodbye"]);
    expect(fixJson(r.raw, "world").changes).toEqual([]);
  });
  it("ちがう ところの まわりだけ みせる", () => {
    const [b, a] = diffSnippet("x".repeat(100) + " Bye-bye! " + "y".repeat(100), "x".repeat(100) + " See you! " + "y".repeat(100), 5);
    // ちがいは「Bye-bye」/「See you」。その まえ 5 文字・あと 5 文字（おなじ "! " を ふくむ）
    expect(b).toBe("…xxxx Bye-bye! yyy…");
    expect(a).toBe("…xxxx See you! yyy…");
  });
});

describe("アプリの 文字（src）", () => {
  it("コメントを けして 文字列を ぬきだす（URL・行番号は そのまま）", () => {
    const src = 'const a = "Bye-bye! See you."; // "Me, too!"\n/* "Once more" */\nconst u = "https://x.y/z a b";\nconst t = `Hello, ${name}! Great job.`;\n';
    expect(stripComments(src)).not.toContain("Me, too");
    const s = extractStrings(src);
    expect(s.map((x) => x.text)).toEqual(["Bye-bye! See you.", "https://x.y/z a b", "Hello, ～! Great job."]);
    expect(s.map((x) => x.line)).toEqual([1, 3, 4]);
    expect(extractStrings("x = 'Me, too!'  # \"Once more\"\n", true).map((x) => x.text)).toEqual(["Me, too!"]);
  });
  it("いまの src・worksheets に phrasebook の まちがいは ない", () => {
    const { entries, issues } = lintSource(ROOT);
    expect(entries.length).toBeGreaterThan(1000);
    expect(issues.map((i) => `${i.unit} ${i.path}: ${i.message}`)).toEqual([]);
  });
  it("--src は --all と 既定に 入る", () => {
    expect(parseArgs([]).src).toBe(true);
    expect(parseArgs(["--all"]).src).toBe(true);
    expect(parseArgs(["--from", "1", "--to", "30"]).src).toBe(false);
    expect(rangeName(parseArgs(["--src"]))).toBe("src");
    expect(rangeName(parseArgs(["--all"]))).toBe("all");
  });
});

describe("ぜんぶの 英語（再発ふせぎ）", () => {
  it("レッスン 1〜1200・としょかん・力だめしで phrasebook が 0", () => {
    const entries = [...collectLessons(1, 1200), ...collectLibrary(), ...collectYearly()];
    expect(entries.length).toBeGreaterThan(150_000);
    const bad: string[] = [];
    for (const e of entries) for (const h of phrasebookHits(e.text, e.stage, e.unit)) bad.push(`${e.unit} ${e.path}: ${h.message}`);
    expect(bad.slice(0, 20)).toEqual([]);
  });
  it("phrasebook:fix を もう一度 かけても なにも かわらない", () => {
    for (const { file, kind } of contentFiles(ROOT)) {
      const raw = readFileSync(path.join(ROOT, file), "utf8");
      expect(fixJson(raw, kind, file).changes.length, file).toBe(0);
    }
  });
  it("lint が しらべない 形（re なし）も ステージの そとで つかわれて いない", () => {
    const units = loadUnits(ROOT);
    const bad: string[] = [];
    for (const f of PHRASEBOOK) for (const v of f.variants) {
      if (v.re) continue;
      for (const re of v.form.split(" / ").map(formRegex).filter((r): r is RegExp => !!r)) {
        const s = formStat(units, re);
        s.byStage.forEach((n, i) => { if (n > 0 && (i + 1 < (v.from ?? 1) || i + 1 > (v.to ?? 5))) bad.push(`${f.id} ${re} stage ${i + 1}: ${n}`); });
      }
    }
    expect(bad).toEqual([]);
  });
  it("なおした ことばが のこって いない（L66 の I'm so-so・L239 の Please listen to my speech・ステージ3〜 の Bye-bye）", () => {
    const l66 = collectLessons(66, 66).map((e) => e.text).join("\n");
    expect(l66).not.toMatch(/I'm so-so/);
    expect(l66).toMatch(/I'm OK\./);
    expect(l66).toMatch(/\bso-so\b/); // ことばと しての so-so（まあまあ）は のこす
    expect(collectLessons(239, 239).map((e) => e.text).join("\n")).not.toMatch(/listen to my speech/);
    expect(collectLessons(601, 1200).some((e) => /Bye-bye/.test(e.text))).toBe(false);
  });
});

describe("docs/phrasebook.md", () => {
  it("データから つくった ものと おなじ（npm run phrasebook:doc）", () => {
    const cur = readFileSync(DOC_PATH, "utf8").replace(/\r\n/g, "\n");
    expect(cur).toBe(renderPhrasebook(loadUnits(ROOT)));
  });
  it("ぜんぶの はたらき・avoid の 形が のっている", () => {
    const doc = readFileSync(DOC_PATH, "utf8");
    for (const f of PHRASEBOOK) {
      expect(doc).toContain(`id: \`${f.id}\``);
      for (const a of f.avoid) expect(doc).toContain(a.form.replace(/\|/g, "\\|"));
    }
  });
  it("formRegex: ～ は なにか・さいごの 記号は なくても よい", () => {
    expect(formRegex("I'd like ～.")!.test("I'd like pizza, please.")).toBe(true);
    expect(formRegex("Me neither.")!.test("Me neither!")).toBe(true);
    expect(formRegex("Me neither.")!.test("Mme neither")).toBe(false);
    expect(formRegex("OK")).toBeNull();
  });
});
