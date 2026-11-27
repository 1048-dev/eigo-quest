"use client";
/**
 * 年に1回の 力だめしの 画面（/yearly が データを 読んだ あとに 描く。run7 P-yearly）。
 * run10 P3: ページから 分けた（npm run check:render が 5 ステージ ぜんぶの 画面を サーバーで 描いて たしかめる）。
 *  はじめに → 👂 聞く → 📖 読む → 🗣️ 話す（AI の キャラクターと）→ ✏️ 書く → 採点 → 結果（保護者向けの 見かたも）
 *  - 受ける ステージは 到達レッスンで きまる。問題は その ステージの JSON だけ あとから 読む
 *  - 1 年に 1 回（おためしは 1 回）。採点は サーバー（話す・書くは AI、つかえない ときは ルール）。
 *    つながらない おためしモードでは この ブラウザで ルール採点して のこす
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { OfflineNote } from "@/components/common/OfflineNote";
import { StandingFigure } from "@/components/characters/StandingArt";
import { ChoiceQuestion } from "@/components/yearly/ChoiceQuestion";
import { SpeakingTask } from "@/components/yearly/SpeakingTask";
import { WritingTaskView } from "@/components/yearly/WritingTaskView";
import { YearlyResultCard } from "@/components/yearly/YearlyResultCard";
import { formatDayJa } from "@/lib/yearly/availability";
import { loadYearlyState, submitYearlyTest, type SubmitOutcome, type YearlyState } from "@/lib/yearly/client";
import { yearlySpec } from "@/lib/yearly/spec";
import type { YearlyAnswers, YearlyTest } from "@/lib/yearly/types";

export type YearlyPhase = "intro" | "listening" | "reading" | "speaking" | "writing" | "submitting" | "result";
type Phase = YearlyPhase;
const SECTION: Record<"listening" | "reading" | "speaking" | "writing", { icon: string; ja: string }> = {
  listening: { icon: "👂", ja: "聞く" },
  reading: { icon: "📖", ja: "読む" },
  speaking: { icon: "🗣️", ja: "話す" },
  writing: { icon: "✏️", ja: "書く" },
};
const ORDER = ["listening", "reading", "speaking", "writing"] as const;

const emptyAnswers = (): YearlyAnswers => ({ choices: {}, speaking: {}, writingText: "", writingWords: [] });

/** initial: はじめの 状態（npm run check:render が とちゅう・結果の 画面を サーバーで 描くため。ふだんは わたさない） */
export interface YearlyViewInitial {
  phase?: YearlyPhase;
  idx?: number;
  answers?: YearlyAnswers;
  outcome?: SubmitOutcome;
}

export function YearlyView({ state: stateAtStart, test, initial }: { state: YearlyState; test: YearlyTest; initial?: YearlyViewInitial }) {
  const [state, setState] = useState<YearlyState>(stateAtStart);
  const [phase, setPhase] = useState<Phase>(initial?.phase ?? "intro");
  const [idx, setIdx] = useState(initial?.idx ?? 0);
  const [answers, setAnswers] = useState<YearlyAnswers>(initial?.answers ?? emptyAnswers);
  const [outcome, setOutcome] = useState<SubmitOutcome | null>(initial?.outcome ?? null);

  // テストの とちゅうで ページを とじそうに なったら たしかめる
  const inProgress = phase === "listening" || phase === "reading" || phase === "speaking" || phase === "writing";
  useEffect(() => {
    if (!inProgress) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [inProgress]);

  const passages = useMemo(() => new Map((test.passages ?? []).map((p) => [p.id, p])), [test]);
  const spec = yearlySpec(test.stage);

  const begin = () => { setAnswers(emptyAnswers()); setIdx(0); setPhase("listening"); };

  const sectionLength = (p: Phase) => p === "listening" ? test.listening.length : p === "reading" ? test.reading.length : p === "speaking" ? test.speaking.prompts.length : 1;

  const submit = async () => {
    setPhase("submitting");
    window.speechSynthesis?.cancel();
    const r = await submitYearlyTest(test, answers, state.offline);
    setOutcome(r);
    setPhase("result");
    if (r.ok) setState(await loadYearlyState());
  };

  const next = () => {
    window.speechSynthesis?.cancel();
    if (idx + 1 < sectionLength(phase)) { setIdx(idx + 1); return; }
    const i = ORDER.indexOf(phase as (typeof ORDER)[number]);
    if (i >= 0 && i < ORDER.length - 1) { setPhase(ORDER[i + 1]); setIdx(0); return; }
    void submit();
  };
  const back = () => {
    window.speechSynthesis?.cancel();
    if (idx > 0) setIdx(idx - 1);
  };

  // ---------------------------------------------------------------- はじめに
  if (phase === "intro") {
    const last = state.history[0];
    return (
      <div className="space-y-4">
        <OfflineNote show={state.offline} note="けっかは この たんまつに のこるよ" />
        <Link href="/map" className="text-sm font-bold text-[var(--on-dark-2)] underline">◀ マップ</Link>
        <header className="card rpg-rivets p-5 text-center">
          <p className="text-5xl" aria-hidden>🏆</p>
          <h1 className="font-title text-2xl">年に1回の 力だめし</h1>
          <p className="mt-1 text-sm text-[var(--ink-2)]">{test.titleJa}（{test.levelJa}）・やく {test.minutes} ぷん</p>
        </header>

        {state.availability.available ? (
          <div className="card space-y-3 p-5">
            <div className="flex items-end gap-3">
              <StandingFigure id={test.character} pose="wave" height={120} />
              <p className="flex-1 rounded-2xl bg-[var(--surface)] p-3 text-sm font-bold">
                1年で どれだけ のびたか、たしかめよう！ むずかしい 問題が あっても だいじょうぶ。わかる ところを ぜんぶ やってみてね。
              </p>
            </div>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {ORDER.map((k) => (
                <li key={k} className="rounded-xl bg-black/25 p-2">
                  <span className="block font-black">{SECTION[k].icon} {SECTION[k].ja}</span>
                  <span className="block text-xs text-[var(--ink-2)]">
                    {k === "listening" ? `${test.listening.length}もん・${spec.formatJa.listening}` : k === "reading" ? `${test.reading.length}もん・${spec.formatJa.reading}` : k === "speaking" ? spec.formatJa.speaking : spec.formatJa.writing}
                  </span>
                </li>
              ))}
            </ul>
            <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--ink-2)]">
              <li>聞く 問題は 2 かいまで きけるよ。音が でるように してね。</li>
              <li>話す 問題は マイクを つかうよ（つかえない ときは 入力できるよ）。</li>
              <li>{state.isTrial ? "おためしでは 1 かいだけ 受けられるよ。" : "受けられるのは 1 年に 1 かい。さいごに「おわり」を おすと きろくされるよ。"}</li>
            </ul>
            <button className="btn btn-coin w-full text-lg" onClick={begin}>はじめる ▶</button>
          </div>
        ) : (
          <div className="card space-y-3 p-5">
            <p className="font-black">
              {state.availability.reason === "TRIAL_USED"
                ? "おためしでは 力だめしは 1 かいだけ。つづきは 会員登録を すると 1 年に 1 かい 受けられるよ。"
                : `つぎの 力だめしは ${formatDayJa(state.availability.nextOn)} から 受けられるよ。それまで レッスンと としょかんで ちからを ためよう！`}
            </p>
            {last && <YearlyResultCard result={last} heading="さいしんの 結果" nextOn={state.availability.reason === "WAIT" ? state.availability.nextOn : null} />}
            <Link href="/map" className="btn btn-primary w-full">マップへ もどる</Link>
          </div>
        )}

        {state.history.length > 1 && (
          <details className="card p-4 text-sm">
            <summary className="cursor-pointer font-black">これまでの 力だめし（{state.history.length}かい）</summary>
            <ul className="mt-2 space-y-1">
              {state.history.map((h) => (
                <li key={h.id + h.takenOn} className="flex justify-between rounded-lg bg-black/25 px-2 py-1">
                  <span>{formatDayJa(h.takenOn)}・ステージ{h.stage}</span>
                  <span className="font-black">{h.band}（{h.total}点）</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------- 採点ちゅう
  if (phase === "submitting") {
    return (
      <div className="card p-8 text-center">
        <div className="flex justify-center"><StandingFigure id={test.character} pose="idle" height={140} /></div>
        <p className="mt-3 text-xl font-black">さいてんちゅう…</p>
        <p className="mt-1 text-sm text-[var(--ink-2)]">話した ことと 書いた ことを よんでいるよ。すこし まってね。</p>
      </div>
    );
  }

  // ---------------------------------------------------------------- 結果
  if (phase === "result" && outcome) {
    if (!outcome.ok) {
      return (
        <div className="card p-6 text-center">
          <p className="font-black">{outcome.messageJa}</p>
          <Link href="/map" className="btn btn-primary mt-4">マップへ もどる</Link>
        </div>
      );
    }
    const r = outcome.result;
    const stars = r.total >= 80 ? 3 : r.total >= 50 ? 2 : 1;
    const correct = (ids: string[]) => ids.filter((id) => r.detail.choices[id]).length;
    return (
      <div className="space-y-4">
        <div className="card p-5 text-center">
          <div className="flex justify-center"><StandingFigure id={test.character} pose="cheer" height={140} /></div>
          <p className="mt-2 text-3xl" aria-label={`ほし ${stars} こ`}>{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
          <p className="text-xl font-black">よく がんばったね！</p>
          <p className="mt-1 text-sm">いまの レベルは <span className="font-title text-2xl text-[var(--volt)]">{r.band}</span></p>
          {outcome.growth && outcome.growth.delta.total > 0 && <p className="mt-1 font-black text-[var(--ok)]">前回より ちから スコアが {outcome.growth.delta.total} アップ！</p>}
          <p className="mt-2 text-xs text-[var(--ink-2)]">{outcome.messageJa}</p>
        </div>

        <div className="card p-4">
          <p className="mb-2 font-black">👪 おうちの方へ</p>
          <YearlyResultCard result={r} growth={outcome.growth} />
        </div>

        <div className="card space-y-3 p-4 text-sm">
          <p className="font-black">ふりかえり</p>
          <p>👂 聞く：{correct(test.listening.map((i) => i.id))} / {test.listening.length} もん　📖 読む：{correct(test.reading.map((i) => i.id))} / {test.reading.length} もん</p>
          {test.speaking.prompts.map((p) => {
            const s = r.detail.speaking[p.id];
            return (
              <div key={p.id} className="rounded-xl bg-black/25 p-2">
                <p lang="en" className="font-bold">🗣️ {p.askEn}</p>
                <p className="text-xs">{"●".repeat(s?.score ?? 0)}{"○".repeat((s?.max ?? 4) - (s?.score ?? 0))} {s?.commentJa}</p>
                {p.kind !== "readAloud" && <p lang="en" className="mt-1 text-xs text-[var(--ink-2)]">おてほん: {p.sample}</p>}
              </div>
            );
          })}
          <div className="rounded-xl bg-black/25 p-2">
            <p className="font-bold">✏️ 書く：{r.detail.writing.score} / {r.detail.writing.max}　{r.detail.writing.commentJa}</p>
            <p lang="en" className="mt-1 text-xs text-[var(--ink-2)]">おてほん: {test.writing.sample}</p>
          </div>
        </div>
        <Link href="/map" className="btn btn-primary w-full">マップへ もどる</Link>
      </div>
    );
  }

  // ---------------------------------------------------------------- 問題
  const section = phase as (typeof ORDER)[number];
  const total = sectionLength(section);
  const head = (
    <div className="card sticky top-2 z-10 p-3">
      <div className="flex items-center justify-between text-sm font-black">
        <span>{SECTION[section].icon} {SECTION[section].ja}{total > 1 ? ` ${idx + 1} / ${total}` : ""}</span>
        <span className="flex gap-1" aria-hidden>
          {ORDER.map((k) => <span key={k} className={`rounded px-1.5 text-xs ${k === section ? "bg-[var(--volt)] text-black" : ORDER.indexOf(k) < ORDER.indexOf(section) ? "bg-[var(--ok)]/40" : "bg-black/30"}`}>{SECTION[k].icon}</span>)}
        </span>
      </div>
    </div>
  );

  let body: ReactNode = null;
  let canNext = true;
  if (section === "listening" || section === "reading") {
    const item = (section === "listening" ? test.listening : test.reading)[idx];
    canNext = answers.choices[item.id] !== undefined;
    body = (
      <ChoiceQuestion
        key={item.id}
        item={item}
        stage={test.stage}
        passage={item.passageId ? passages.get(item.passageId) : undefined}
        picked={answers.choices[item.id]}
        onPick={(i) => setAnswers((a) => ({ ...a, choices: { ...a.choices, [item.id]: i } }))}
      />
    );
  } else if (section === "speaking") {
    const p = test.speaking.prompts[idx];
    body = (
      <>
        {idx === 0 && <p className="rounded-xl bg-black/25 p-2 text-sm"><span lang="en">{test.speaking.introEn}</span><br /><span className="text-xs text-[var(--ink-2)]">{test.speaking.introJa}</span></p>}
        <SpeakingTask key={p.id} prompt={p} character={test.character} stage={test.stage} value={answers.speaking[p.id] ?? ""} onChange={(t) => setAnswers((a) => ({ ...a, speaking: { ...a.speaking, [p.id]: t } }))} />
      </>
    );
  } else {
    body = (
      <WritingTaskView
        task={test.writing}
        text={answers.writingText ?? ""}
        words={answers.writingWords ?? []}
        onText={(t) => setAnswers((a) => ({ ...a, writingText: t }))}
        onWords={(w) => setAnswers((a) => ({ ...a, writingWords: w }))}
      />
    );
  }
  const last = section === "writing";
  const skipLabel = section === "speaking" ? "わからない ときは「つぎへ」で とばしても いいよ" : section === "writing" ? "書けた ところまでで だいじょうぶ" : "";

  return (
    <div className="space-y-3">
      <OfflineNote show={state.offline} note="けっかは この たんまつに のこるよ" />
      {head}
      <div className="card space-y-3 p-4">{body}</div>
      {skipLabel && <p className="text-center text-xs font-bold text-[var(--on-dark-2)]">{skipLabel}</p>}
      <div className="grid grid-cols-3 gap-2">
        <button className="btn btn-ghost" onClick={back} disabled={idx === 0}>◀</button>
        <button className={`btn col-span-2 ${last ? "btn-coin" : "btn-primary"}`} onClick={next} disabled={!canNext}>
          {last ? "おわり（さいてんする）" : idx + 1 < total ? "つぎへ ▶" : `つぎは ${SECTION[ORDER[ORDER.indexOf(section) + 1]].ja} ▶`}
        </button>
      </div>
    </div>
  );
}
