/**
 * run10 Phase 4: クリックで すすめる ロボット（npm run check:e2e）の ブラウザ側の 部品。
 *
 *  - FAKE_MEDIA: 音の ない 環境の かわり（読みあげは すぐ おわる・マイクは window.__e2eSay を 「きこえた ことば」に する）
 *  - answerQuestion(): E2E=1 の ビルドが 出す 正解（data-e2e-answer / data-e2e-correct。src/lib/e2e.ts）で 1 問 こたえる
 *  - playLesson(): レッスンを 先生の 授業 → … → かいわ → クリア まで ぜんぶ クリックで すすめる
 * どの 操作にも 時間制限が ある（ふだんは 30 秒）。
 */
import type { Locator, Page } from "playwright";

/**
 * ブラウザに 入れる にせものの 声と マイク（tsx が 関数に __name を 入れるので 文字列で わたす）。
 *  - speechSynthesis: speak() は 5ms で onstart → onend。声の 一覧は から（先生の 授業は 字幕の 時間で すすむ）
 *  - SpeechRecognition: start() の 40ms あとに window.__e2eSay を 「きこえた ことば」（確信度 0.95）に して かえす
 */
export const FAKE_MEDIA = `(() => {
  const synth = {
    speaking: false, pending: false, paused: false,
    speak(u) { setTimeout(() => { try { u.onstart && u.onstart({ charIndex: 0 }); } catch (e) {} try { u.onend && u.onend({}); } catch (e) {} }, 5); },
    cancel() {}, pause() {}, resume() {},
    getVoices() { return []; },
    addEventListener() {}, removeEventListener() {},
  };
  Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
  class FakeRecognition {
    constructor() { this.lang = "en-US"; this.interimResults = false; this.maxAlternatives = 1; this.continuous = false; this.onresult = null; this.onerror = null; this.onend = null; this._t = 0; }
    start() {
      const say = String(window.__e2eSay || "");
      window.__e2eHeard = (window.__e2eHeard || 0) + 1;
      this._t = setTimeout(() => {
        if (say && this.onresult) this.onresult({ results: [[{ transcript: say, confidence: 0.95 }]] });
        if (this.onend) this.onend();
      }, 40);
    }
    stop() {}
    abort() { clearTimeout(this._t); }
  }
  window.SpeechRecognition = FakeRecognition;
  window.webkitSpeechRecognition = FakeRecognition;
})();`;

const T = 30_000;

/** つぎに マイクに 「きこえる」 ことば */
export const setSay = (page: Page, text: string) => page.evaluate(`window.__e2eSay = ${JSON.stringify(text)}`);

/**
 * いま 画面に ある 問題（QuestionView）に 正しく こたえる。こたえた 問題の 形式を かえす。
 * 反射クイズ（tpr_reflex・4 秒）は ロボットが おそいと アプリの 時間切れが さきに こたえる → "late"（アプリの まちがいでは ない）。
 * 1 問の あいだの やりとりを へらして はやく こたえる（属性は 1 回の evaluate で よむ）。
 */
export async function answerQuestion(page: Page, opts: { wrong?: boolean } = {}): Promise<{ type: string; answer: string; late: boolean; ms: number }> {
  const root = page.locator("[data-e2e-type]").first();
  await root.waitFor({ timeout: T });
  const handle = await root.elementHandle();
  if (!handle) throw new Error("問題が 見つからない");
  const t0 = Date.now();
  const info = await handle.evaluate((el) => ({ type: el.getAttribute("data-e2e-type") ?? "", answer: el.getAttribute("data-e2e-answer") ?? "", answered: !!el.querySelector("[data-e2e-correct][disabled]") }));
  const res = { type: info.type, answer: info.answer, late: false, ms: 0 };
  try {
    if (info.answered) throw new Error("もう こたえが きまっている");
    if (info.type === "spell") {
      await root.getByLabel("えいごで かいてね").fill(opts.wrong ? "zzz" : info.answer, { timeout: 10_000 });
      await root.getByRole("button", { name: "こたえる" }).click({ timeout: 10_000 });
    } else if (info.type === "speak") {
      await setSay(page, opts.wrong ? "" : info.answer);
      await root.getByRole("button", { name: /いってみる/ }).click({ timeout: 10_000 });
    } else {
      const pick = opts.wrong ? root.locator("button:not([data-e2e-correct]):not([aria-label])").first() : root.locator('[data-e2e-correct="1"]');
      await pick.click({ timeout: 10_000 });
    }
  } catch (e) {
    // ボタンが もう おせない（時間切れで こたえが きまった・つぎの 問題に なった）なら "late"、ちがえば ほんとうの 失敗
    const gone = await handle.evaluate((el) => !el.isConnected || !!el.querySelector("[data-e2e-correct][disabled]")).catch(() => true);
    if (!gone) throw e;
    res.late = true;
  }
  res.ms = Date.now() - t0;
  // つぎの 問題に なる（key が かわって 作りなおされる）か、おわって 消えるまで まつ
  await handle.waitForElementState("hidden", { timeout: T });
  return res;
}

export interface StepLog { kind: string; detail: string; ms: number }
export interface LessonPlay { steps: StepLog[]; resultTitle: string; coinsText: string; quizFlashes: { ok: number; ng: number; late: number; wrong: string[] }; conversationTurns: number; teacherSegments: number; notes: string[] }

/** Playwright の エラーから 1 行目と「なぜ まったか」の 行だけ */
export function callLog(e: unknown): string {
  const lines = String(e instanceof Error ? e.message : e).split("\n");
  return [lines[0], ...lines.slice(1).filter((l) => /waiting|intercept|stable|visible|enabled|retrying|scroll|detached/i.test(l)).slice(-4)].map((l) => l.trim()).join(" / ");
}

const waitText = (page: Page, text: string | RegExp, timeout = T) => page.getByText(text).first().waitFor({ timeout });
const btn = (scope: Page | Locator, name: string | RegExp, exact = false) => scope.getByRole("button", { name, exact });

/** クイズ・スピードリスニングの 1 ラウンド: title が 見えて いる あいだ こたえつづける */
async function answerWhile(page: Page, title: RegExp, flashes: { ok: number; ng: number; late: number; wrong: string[] }, max = 60): Promise<number> {
  let n = 0;
  await waitText(page, title);
  for (; n < max; n++) {
    const still = await page.getByText(title).first().isVisible().catch(() => false);
    const q = page.locator("[data-e2e-type]").first();
    if (!still || !(await q.isVisible().catch(() => false))) {
      // つぎの 問題が 出る まえの 一瞬かも しれないので すこし まつ
      const again = await q.waitFor({ timeout: 1500 }).then(() => true).catch(() => false);
      if (!again || !(await page.getByText(title).first().isVisible().catch(() => false))) break;
    }
    // 正解・まちがいの おしらせ（QuizRun の <p class="card mt-3">）。選択肢にも「❌ からだで X を…」が あるので ボタンは 見ない
    const ok = page.locator("p.card.mt-3", { hasText: /^⭕ せいかい！/ }).first();
    const ng = page.locator("p.card.mt-3", { hasText: /^❌ / }).first();
    const flash = ok.or(ng).first().waitFor({ timeout: 10_000 }).then(async () => ((await ok.isVisible().catch(() => false)) ? "ok" : `ng ${(await ng.textContent().catch(() => "")) ?? ""}`)).catch(() => "none");
    const r = await answerQuestion(page);
    const f = await flash;
    if (r.late) { flashes.late++; flashes.wrong.push(`ロボットが おそかった ${r.type}=${r.answer}（${r.ms}ms）${f.slice(3, 60)}`); }
    else if (f === "ok") flashes.ok++;
    else if (f.startsWith("ng")) { flashes.ng++; flashes.wrong.push(`${r.type}=${r.answer}（${r.ms}ms）${f.slice(3, 80)}`); }
  }
  return n;
}

/**
 * レッスンを 1 つ クリックで さいごまで。kinds は ステップの じゅんばん（buildLessonFlow と おなじ）。
 * /lesson/<n> を ひらいた あとに よぶ。
 */
export async function playLesson(page: Page, lessonNo: number, kinds: string[]): Promise<LessonPlay> {
  const out: LessonPlay = { steps: [], resultTitle: "", coinsText: "", quizFlashes: { ok: 0, ng: 0, late: 0, wrong: [] }, conversationTurns: 0, teacherSegments: 0, notes: [] };
  await page.getByRole("list", { name: "レッスンの進み具合" }).waitFor({ timeout: 45_000 });
  for (const kind of kinds) {
    const t0 = Date.now();
    let detail = "";
    if (kind === "teacher_video") {
      const vc = page.getByTestId("virtual-classroom");
      const video = page.locator("video");
      await vc.or(video).first().waitFor({ timeout: 45_000 });
      if (await video.isVisible().catch(() => false)) {
        await btn(page, "つぎへ ▶").click();
        detail = "動画";
      } else {
        await page.getByTestId("teacher-start").click();
        const counter = vc.getByText(/^\d+ \/ \d+　/);
        await counter.waitFor({ timeout: T });
        const total = Number(/\/ (\d+)/.exec((await counter.textContent()) ?? "")?.[1] ?? 0);
        const next = page.getByTestId("teacher-next");
        const seen = new Set<number>();
        for (let i = 0; i < total + 5; i++) {
          const m = /^(\d+) \//.exec((await counter.textContent().catch(() => "")) ?? "");
          if (m) seen.add(Number(m[1]));
          if (/れんしゅう/.test((await next.textContent()) ?? "")) break;
          // 1 つめの パートは すこし 再生してから とばす（字幕が 出る ことも みる）
          if (i === 0) await page.waitForTimeout(400);
          await page.getByTestId("teacher-skip").click();
          await page.waitForFunction((prev) => {
            const el = [...document.querySelectorAll('[data-testid="virtual-classroom"] p')].find((p) => /^\d+ \/ \d+/.test(p.textContent ?? ""));
            const nx = document.querySelector('[data-testid="teacher-next"]')?.textContent ?? "";
            return /れんしゅう/.test(nx) || (el && !el.textContent!.startsWith(`${prev} /`));
          }, m ? Number(m[1]) : 0, { timeout: 10_000 });
        }
        if (!/れんしゅう/.test((await next.textContent()) ?? "")) throw new Error(`先生の 授業が おわらない（${seen.size}/${total}）`);
        out.teacherSegments = seen.size;
        detail = `パート ${seen.size}/${total}`;
        await next.click();
      }
    } else if (kind === "flashcards") {
      const label = page.getByText(/カードをタップしてね（\d+\/\d+）/).first();
      await label.waitFor({ timeout: T });
      const total = Number(/\/(\d+)）/.exec((await label.textContent()) ?? "")?.[1] ?? 0);
      for (let i = 0; i < total; i++) {
        await page.getByText(`カードをタップしてね（${i + 1}/${total}）`).waitFor({ timeout: T });
        await page.locator("button[class*='aspect-[3/4]']").click();
        await btn(page, "つぎへ ▶").click();
      }
      detail = `カード ${total}`;
    } else if (kind === "tpr") {
      await waitText(page, "せんせいの めいれいを きいて うごこう！");
      let n = 0;
      while (n < 40 && (await btn(page, "できた！").isVisible().catch(() => false))) { await btn(page, "できた！").click(); n++; }
      await waitText(page, "からだで おぼえたね！");
      await btn(page, "つぎへ ▶").click();
      detail = `めいれい ${n}`;
    } else if (kind === "phonics") {
      await waitText(page, "おとを つなげて よもう（ブレンディング）");
      const words = page.locator("div.grid-cols-2 > button");
      const nw = await words.count();
      if (nw > 0) await words.first().click();
      await btn(page, "つぎへ ▶").click();
      detail = `ことば ${nw}`;
    } else if (kind === "school_expressions") {
      await waitText(page, "がっこうの テストに でる ポイント");
      let n = 0;
      for (; n < 20; n++) {
        const input = page.locator("input[data-e2e-answer]");
        if (!(await input.isVisible().catch(() => false))) break;
        await input.fill((await input.getAttribute("data-e2e-answer")) ?? "");
        await btn(page, "さいてん").click();
        await page.getByText(/^(⭕ ごうかく|🟡 さいちょうせん|❌ ざんねん)/).first().waitFor({ timeout: T });
        if (!(await page.getByText(/^⭕ ごうかく/).first().isVisible())) throw new Error(`書きとりが 合格に ならない: ${await page.getByText(/^(🟡|❌)/).first().textContent()}`);
        await btn(page, "つぎ", true).click();
      }
      await btn(page, "つぎへ ▶").click();
      detail = `書きとり ${n}`;
    } else if (kind === "pronunciation") {
      await btn(page, "つぎの ことば ▶").or(page.getByText("🎤✨")).first().waitFor({ timeout: T });
      let n = 0;
      for (; n < 30; n++) {
        const say = page.locator("[data-e2e-say]").first();
        if (!(await say.isVisible().catch(() => false))) break;
        await setSay(page, (await say.getAttribute("data-e2e-say")) ?? "");
        await btn(say, /いってみる/).click();
        await say.getByText("⭐⭐⭐").waitFor({ timeout: T });
        await btn(page, "つぎの ことば ▶").click();
      }
      await waitText(page, "🎤✨");
      await btn(page, "つぎへ ▶").click();
      detail = `ことば ${n}（⭐⭐⭐）`;
    } else if (kind === "quiz") {
      const n = await answerWhile(page, /✅ かくにんクイズ/, out.quizFlashes);
      detail = `${n} 問`;
    } else if (kind === "speed_listening") {
      let n = 0;
      for (let r = 1; r <= 3; r++) n += await answerWhile(page, new RegExp(`スピードリスニング ラウンド${r}：`), out.quizFlashes);
      detail = `${n} 問（3 ラウンド）`;
    } else if (kind === "conversation") {
      await waitText(page, /と おはなし しよう！/);
      const startBtn = btn(page, "▶ はじめる", true);
      try {
        await startBtn.click({ timeout: 15_000 });
      } catch (e) {
        // 15 秒 おせなかった わけ（Playwright の call log）を のこして、もう一度 おす
        out.notes.push(`かいわの「▶ はじめる」が 15 秒 おせなかった: ${callLog(e)}`);
        await startBtn.click({ timeout: 15_000 });
      }
      const clear = btn(page, "レッスン クリア！ ▶");
      let turns = 0;
      for (; turns < 10; turns++) {
        if (await clear.isVisible().catch(() => false)) break;
        const sugg = page.locator("div:has(> p:text('こんなふうに いえるよ（タップ）')) button").first();
        await sugg.or(clear).first().waitFor({ timeout: T });
        if (await clear.isVisible().catch(() => false)) break;
        const text = ((await sugg.textContent()) ?? "").trim();
        const before = await page.locator("ul[aria-live] li p").count();
        if (turns === 0) {
          // 1 回目は 🎤（にせものの マイクが その ことばを きく）
          await setSay(page, text);
          await btn(page, "🎤 おして えいごで はなす").click();
        } else {
          await sugg.click();
        }
        await page.waitForFunction((b) => document.querySelectorAll("ul[aria-live] li p").length > b, before, { timeout: T });
        await page.getByText(/が かんがえちゅう…/).waitFor({ state: "hidden", timeout: T });
      }
      await clear.waitFor({ timeout: T });
      out.conversationTurns = turns;
      detail = `${turns} ターン`;
      await clear.click();
    } else {
      throw new Error(`知らない ステップ: ${kind}`);
    }
    out.steps.push({ kind, detail, ms: Date.now() - t0 });
  }
  // 結果の カード（div.rpg-rivets の h2）。レッスンの タイトル（h1）に「クイズ」が ある 回も あるので h2 だけ
  const title = page.locator("div.rpg-rivets h2").first();
  await title.waitFor({ timeout: 45_000 });
  out.resultTitle = ((await title.textContent()) ?? "").trim();
  out.coinsText = ((await page.getByText(/^🪙 \+\d+/).first().textContent().catch(() => "")) ?? "").trim();
  return out;
}

/** テスト（/test/...）を ぜんぶ 正しく こたえて 結果まで。結果の 見出しと 正解率の 文を かえす */
export async function playTest(page: Page, opts: { wrongFirst?: number } = {}): Promise<{ answered: number; title: string; rate: string; unlock: string; types: Record<string, number> }> {
  const counter = page.getByText(/^\d+ \/ \d+$/).first();
  await counter.waitFor({ timeout: 45_000 });
  const total = Number(/\/ (\d+)/.exec((await counter.textContent()) ?? "")?.[1] ?? 0);
  const types: Record<string, number> = {};
  let answered = 0;
  for (let i = 0; i < total; i++) {
    const r = await answerQuestion(page, { wrong: i < (opts.wrongFirst ?? 0) });
    const type = r.late ? `${r.type}（おそかった）` : r.type;
    types[type] = (types[type] ?? 0) + 1;
    answered++;
  }
  const title = page.getByRole("heading", { name: /ごうかく！|おしい！/ });
  await title.waitFor({ timeout: 45_000 });
  const rate = ((await page.getByText(/^せいかいりつ/).first().textContent()) ?? "").trim();
  const unlock = ((await page.getByText(/^🔓 Lesson \d+ がひらいた！/).first().textContent({ timeout: 1000 }).catch(() => "")) ?? "").trim();
  return { answered, title: ((await title.textContent()) ?? "").trim(), rate, unlock, types };
}
