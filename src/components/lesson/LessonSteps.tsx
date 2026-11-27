"use client";
/**
 * レッスンの各ステップUI。各ステップは onDone(logs) で次へ進み、解答ログを親に渡す。
 */
import { useState } from "react";
import type { LearningItemDef } from "@/lib/domain/types";
import { audioKeyOf, toPublic, type Question } from "@/lib/curriculum/questions";
import { focusExampleWord, focusLabel } from "@/lib/curriculum/phonicsButtons";
import type { AnswerLog } from "@/lib/services/progressService";
import { playItemAudio, speak } from "@/lib/speech/tts";
import { QuestionView, SpeakButton, type AnswerEvent } from "@/components/test/QuestionView";
import { apiPost, isUnreachable } from "@/lib/api/client";
import { gradeLocally } from "@/lib/grading/localGrader";
import dynamic from "next/dynamic";
import type { TimelineLesson } from "@/lib/teacher/timeline";
import { GradeResponseSchema } from "@/lib/api/contracts";

export type Done = (logs?: AnswerLog[]) => void;
/**
 * initial: はじめの 状態（run10 P3 の 描画の 確認 npm run check:render が、とちゅうの 画面を サーバーで 描くために つかう）。
 * ふだんの 画面では わたさない（わたさなければ 今までと おなじ）。
 */
const NextBtn = ({ onClick, label = "つぎへ ▶" }: { onClick: () => void; label?: string }) => (
  <button className="btn btn-primary mt-6 w-full" onClick={onClick}>{label}</button>
);

// ---------------------------------------------------------------------------
// 1. AI女性教師の授業（run8 P8）: videoUrl が あれば 本物の 動画、なければ バーチャル教室
//    （うごく エマ先生 ＋ 黒板 ＋ 字幕。台本 lesson.teacher が なければ レッスンの ことばから つくる）
// ---------------------------------------------------------------------------
// run8: バーチャル教室（先生の 絵・黒板・字幕・タイムライン）は 別の チャンク。最初の 読みこみを かるく するため。
// ページの スクリプトが うごいた ときに すぐ 読みはじめる（レッスンの データを とる あいだに おわる ので まちが ふえない）
const loadClassroom = () => import("@/components/teacher/VirtualClassroom");
if (typeof window !== "undefined") void loadClassroom().catch(() => undefined);
const ClassroomLoading = () => <div className="card p-6 text-center text-sm font-bold text-[var(--ink-2)]">👩‍🏫 せんせいを よんでいるよ…</div>;
const VirtualClassroom = dynamic(() => loadClassroom().then((m) => m.VirtualClassroom), { ssr: false, loading: ClassroomLoading });
const TeacherVideoPlayer = dynamic(() => loadClassroom().then((m) => m.TeacherVideoPlayer), { ssr: false, loading: ClassroomLoading });

export function TeacherVideo({ lesson, partner, videoUrl, teacherName, onDone }: { lesson: TimelineLesson; partner?: string; videoUrl?: string; teacherName: string; onDone: Done }) {
  if (videoUrl) return <TeacherVideoPlayer videoUrl={videoUrl} teacherName={teacherName} onDone={() => onDone()} />;
  return <VirtualClassroom lesson={lesson} partner={partner} teacherName={teacherName} onDone={() => onDone()} />;
}

// ---------------------------------------------------------------------------
// 2. フラッシュカード（Session 1: Look / Stop / Come here / Go ＋ あいさつ単語）
// ---------------------------------------------------------------------------
export function Flashcards({ items, onDone, initial }: { items: LearningItemDef[]; onDone: Done; initial?: { index?: number; flipped?: boolean } }) {
  const [i, setI] = useState(initial?.index ?? 0);
  const [flipped, setFlipped] = useState(initial?.flipped ?? false);
  const it = items[i];
  const next = () => (i + 1 < items.length ? (setI(i + 1), setFlipped(false)) : onDone());
  return (
    <div className="text-center">
      <p className="font-bold text-[var(--on-dark-2)]">カードをタップしてね（{i + 1}/{items.length}）</p>
      <button className="card mx-auto mt-4 grid aspect-[3/4] w-64 place-items-center p-6" onClick={() => { setFlipped(!flipped); playItemAudio(audioKeyOf(it.id), it.text); }}>
        {flipped ? <span><span className="block text-4xl font-black">{it.text}</span><span className="mt-3 block text-xl text-[var(--ink-2)]">{it.ja}</span></span>
          : <span className="text-8xl">{it.emoji ?? "❓"}</span>}
      </button>
      <NextBtn onClick={next} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 3. TPR（体を動かす命令）: 聞く → 動く → 自己申告。サイモンセッズ方式で反射を鍛える
// ---------------------------------------------------------------------------
export function TprDrill({ items, actions, onDone, initial }: { items: LearningItemDef[]; actions: Record<string, string>; onDone: Done; initial?: { round?: number } }) {
  const [round, setRound] = useState(initial?.round ?? 0);
  const order = [...items, ...items].slice(0, Math.max(4, items.length * 2));
  const it = order[round];
  if (!it) return <div className="card p-6 text-center"><p className="text-5xl">🙌</p><p className="mt-2 font-black">からだで おぼえたね！</p><NextBtn onClick={() => onDone()} /></div>;
  return (
    <div className="card p-6 text-center">
      <p className="font-bold text-[var(--ink-2)]">せんせいの めいれいを きいて うごこう！</p>
      <p className="my-4 text-7xl">{it.emoji}</p>
      <p className="text-4xl font-black">{it.text}</p>
      <p className="mt-2 text-[var(--ink-2)]">{it.ja} — {actions[it.text]}</p>
      <div className="mt-5 flex gap-3">
        <button className="btn flex-1 bg-[var(--surface)]" onClick={() => playItemAudio(audioKeyOf(it.id), it.text)}>🔊 きく</button>
        <button className="btn btn-primary flex-1" onClick={() => setRound(round + 1)}>できた！</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 4. フォニックス（文字と音・ブレンディング）
// ---------------------------------------------------------------------------
/** examples: サーバー（または おためしで ワールドを 読んだ あと）が 作った おてほん。なければ ブラウザの 基本の きまりで さがす */
export function Phonics({ focus, words, tipJa, examples, spoken, onDone, initial }: { focus: string[]; words: string[]; tipJa: string; examples?: string[]; spoken?: string[]; onDone: Done; initial?: { lit?: { word: string; n: number } } }) {
  const [lit, setLit] = useState<{ word: string; n: number } | null>(initial?.lit ?? null);
  // 文字の なまえ（シー・エー・ティー）は 読まない。もじを じゅんばんに 光らせてから、ことばを ゆっくり → ふつうの はやさで
  // run10: 数・年号は spoken（英語の 読みかた。1600 → sixteen hundred）で 読む
  const blend = async (w: string, say: string) => {
    for (let n = 1; n <= w.length; n++) {
      setLit({ word: w, n });
      await new Promise((ok) => setTimeout(ok, 220));
    }
    await speak(say, 0.6);
    await speak(say, 0.9);
    setLit(null);
  };
  return (
    <div className="card p-6">
      <p className="rounded-xl bg-[var(--bg)] p-3 text-sm">💡 {tipJa}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {focus.map((f, i) => {
          const label = focusLabel(f);
          const example = examples?.[i] || focusExampleWord(f, words);
          return (
            <button key={f} className="card flex min-w-24 flex-col items-center px-5 py-3" onClick={() => speak(example, 0.75)} aria-label={`${label.main}（${example} を きく）`}>
              <span className="text-4xl font-black text-[var(--accent)]">{label.main}</span>
              {label.hintJa && <span className="text-xs font-bold text-[var(--ink-2)]">{label.hintJa}</span>}
              <span className="mt-1 text-sm font-bold text-[var(--ink-2)]">🔊 {example}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-6 text-center font-bold text-[var(--ink-2)]">おとを つなげて よもう（ブレンディング）</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {words.map((w, i) => (
          <button key={w} className="card p-4 text-3xl font-black tracking-[.3em]" onClick={() => blend(w, spoken?.[i] || w)}>
            {w.split("").map((ch, i) => <span key={i} className={lit?.word === w && i < lit.n ? "text-[var(--coin)]" : ""}>{ch}</span>)}
          </button>
        ))}
      </div>
      <NextBtn onClick={() => onDone()} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 5. 学校テスト対策（教科書表現 ＋ テストに出るポイント ＋ 書き取り＝AI採点）
// ---------------------------------------------------------------------------
export function SchoolExpressions({ items, testPoints, onDone, initial }: {
  items: LearningItemDef[]; testPoints: string[]; onDone: Done;
  initial?: { index?: number; text?: string; res?: { verdict: string; feedbackJa: string } };
}) {
  const core = items.filter((i) => i.schoolCore);
  const [k, setK] = useState(initial?.index ?? 0);
  const [text, setText] = useState(initial?.text ?? "");
  const [res, setRes] = useState<{ verdict: string; feedbackJa: string } | null>(initial?.res ?? null);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const target = core[k];

  const check = async () => {
    const res = await apiPost("/api/grade/written", GradeResponseSchema, { itemId: target.id, answer: text });
    // run10 P4: サーバーに とどかない（電波が ない など）ときは この 端末で ルール採点する
    // （まえは いつも「うまく採点できなかったよ」＝ ざんねん に なっていた）
    const r = isUnreachable(res) ? localGrade(target.text, text) : res.data;
    setRes(r);
    setLogs((l) => [...l, { itemId: target.id, skill: "WRITING", questionType: "spell", correct: r.verdict === "PASS", answer: text }]);
  };

  return (
    <div className="card p-6">
      <h3 className="font-black">🏫 がっこうの テストに でる ポイント</h3>
      <ul className="mt-2 list-inside list-disc text-sm">{testPoints.map((t) => <li key={t}>{t}</li>)}</ul>
      <div className="mt-4 space-y-2">
        {items.map((e) => (
          <button key={e.id} className="block w-full rounded-xl bg-[var(--bg)] p-3 text-left" onClick={() => playItemAudio(audioKeyOf(e.id), e.text)}>
            <span className="text-xl font-black">🔊 {e.text}</span><span className="block text-sm text-[var(--ink-2)]">{e.ja}</span>
          </button>
        ))}
      </div>
      {target && (
        <div className="mt-6">
          <p className="font-bold">✏️ かいてみよう：「{target.ja}」</p>
          <input value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} className="mt-2 w-full rounded-xl border-y-4 border-double border-[var(--ink-2)]/40 bg-[var(--bg)] p-3 text-xl" autoCapitalize="off" spellCheck={false}
            aria-label={`「${target.ja}」を えいごで かく`} {...(process.env.E2E === "1" ? { "data-e2e-answer": target.text } : {})} />
          {res && <p className={`mt-2 font-bold ${res.verdict === "PASS" ? "text-[var(--ok)]" : res.verdict === "RETRY" ? "text-[var(--coin)]" : "text-[var(--ng)]"}`}>{res.verdict === "PASS" ? "⭕ ごうかく" : res.verdict === "RETRY" ? "🟡 さいちょうせん" : "❌ ざんねん"}：{res.feedbackJa}</p>}
          <div className="mt-3 flex gap-2">
            <button className="btn btn-coin flex-1" onClick={check} disabled={!text.trim()}>さいてん</button>
            {res && <button className="btn flex-1 bg-[var(--surface)]" onClick={() => { setK(k + 1); setText(""); setRes(null); }}>つぎ</button>}
          </div>
        </div>
      )}
      <NextBtn onClick={() => onDone(logs)} />
    </div>
  );
}

/** サーバーに とどかない ときの 書きとりの 採点（/api/grade/written の オフラインと おなじ ルール採点） */
export function localGrade(expected: string, answer: string): { verdict: "PASS" | "RETRY" | "WRONG"; feedbackJa: string } {
  const g = gradeLocally(expected, answer, "lenient");
  return { verdict: g.verdict, feedbackJa: g.feedbackJa };
}

// ---------------------------------------------------------------------------
// 6. 発音チェック（マイク → 音声認識 → リアルタイム採点）
// ---------------------------------------------------------------------------
export function Pronunciation({ items, onDone, initial }: { items: LearningItemDef[]; onDone: Done; initial?: { index?: number } }) {
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [i, setI] = useState(initial?.index ?? 0);
  const it = items[i];
  if (!it) return <div className="card p-6 text-center"><p className="text-5xl">🎤✨</p><NextBtn onClick={() => onDone(logs)} /></div>;
  return (
    <div className="card p-6 text-center">
      <p className="text-5xl">{it.emoji}</p>
      <p className="mt-2 text-4xl font-black">{it.text}</p>
      <SpeakButton key={it.id} target={it.text} itemId={audioKeyOf(it.id)} onDone={(r) => setLogs((l) => [...l, { itemId: it.id, skill: "SPEAKING", questionType: "speak", correct: r.score >= 0.7, score: r.score, answer: r.transcript }])} />
      <NextBtn label="つぎの ことば ▶" onClick={() => setI(i + 1)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 7. 確認クイズ / 8. スピードリスニング（0.8 → 1.0 → 1.2 倍速）
// ---------------------------------------------------------------------------
export interface QuizRunInitial { index?: number; flash?: { ok: boolean; explain: string } }
export function QuizRun({ questions, title, onDone, initial }: { questions: Question[]; title?: string; onDone: (logs: AnswerLog[], score: number) => void; initial?: QuizRunInitial }) {
  const [i, setI] = useState(initial?.index ?? 0);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [flash, setFlash] = useState<{ ok: boolean; explain: string } | null>(initial?.flash ?? null);
  const q = questions[i];

  const answer = (a: AnswerEvent) => {
    if (flash) return;
    const ok = a.value === q.answer;
    const nextLogs = [...logs, { itemId: q.itemId, skill: q.skill, questionType: q.type, correct: ok, responseMs: a.responseMs, playbackRate: q.playbackRate }];
    setLogs(nextLogs);
    setFlash({ ok, explain: q.explanationJa });
    setTimeout(() => {
      setFlash(null);
      if (i + 1 < questions.length) setI(i + 1);
      else onDone(nextLogs, nextLogs.filter((l) => l.correct).length / questions.length);
    }, ok ? 700 : 2200);
  };

  return (
    <div>
      {title && <p className="mb-2 text-center font-black">{title}</p>}
      <QuestionView key={q.id} q={toPublic(q)} onAnswer={answer} disabled={!!flash} e2eAnswer={process.env.E2E === "1" ? q.answer : undefined} />
      {flash && <p className={`card mt-3 p-3 text-center font-bold ${flash.ok ? "text-[var(--ok)]" : "text-[var(--ng)]"}`}>{flash.ok ? "⭕ せいかい！" : `❌ ${flash.explain}`}</p>}
    </div>
  );
}

export function SpeedListening({ rounds, onDone, initial }: { rounds: { rate: number; questions: Question[] }[]; onDone: (logs: AnswerLog[], best: number) => void; initial?: { round?: number; quiz?: QuizRunInitial } }) {
  const [r, setR] = useState(initial?.round ?? 0);
  const [all, setAll] = useState<AnswerLog[]>([]);
  const [best, setBest] = useState(0);
  const round = rounds[r];
  return (
    <QuizRun
      key={r}
      title={`⚡ スピードリスニング ラウンド${r + 1}：${round.rate}ばいそく`}
      questions={round.questions}
      initial={r === (initial?.round ?? 0) ? initial?.quiz : undefined}
      onDone={(logs, score) => {
        const merged = [...all, ...logs];
        // そのラウンドで75%以上なら「到達速度」を更新
        const nextBest = score >= 0.75 ? round.rate : best;
        setAll(merged); setBest(nextBest);
        if (r + 1 < rounds.length) setR(r + 1);
        else onDone(merged, nextBest / 1.2);
      }}
    />
  );
}
