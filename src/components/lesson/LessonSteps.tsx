"use client";
/**
 * レッスンの各ステップUI。各ステップは onDone(logs) で次へ進み、解答ログを親に渡す。
 */
import { useState } from "react";
import type { LearningItemDef } from "@/lib/domain/types";
import { audioKeyOf, toPublic, type Question } from "@/lib/curriculum/questions";
import type { AnswerLog } from "@/lib/services/progressService";
import { playItemAudio, speak, speakMixed } from "@/lib/speech/tts";
import { QuestionView, SpeakButton, type AnswerEvent } from "@/components/test/QuestionView";
import { apiPost } from "@/lib/api/client";
import { TeacherArt } from "@/components/characters/TeacherArt";
import { GradeResponseSchema } from "@/lib/api/contracts";

export type Done = (logs?: AnswerLog[]) => void;
const NextBtn = ({ onClick, label = "つぎへ ▶" }: { onClick: () => void; label?: string }) => (
  <button className="btn btn-primary mt-6 w-full" onClick={onClick}>{label}</button>
);

// ---------------------------------------------------------------------------
// 1. AI女性教師の動画（無ければアバターアニメーション＋音声合成）
// ---------------------------------------------------------------------------
export function TeacherVideo({ script, videoUrl, teacherName, onDone }: { script: string; videoUrl?: string; teacherName: string; onDone: Done }) {
  const [subtitle, setSubtitle] = useState("");
  const [talking, setTalking] = useState(false);
  const play = async () => {
    setTalking(true);
    await speakMixed(script, setSubtitle);
    setTalking(false);
  };
  return (
    <div className="card overflow-hidden">
      {videoUrl ? (
        // 本番: 口の動き・ジェスチャー付きのAIアバター動画（事前生成して CDN 配信）
        <video src={videoUrl} controls playsInline className="aspect-video w-full bg-black" onEnded={() => onDone()} />
      ) : (
        <div className="relative grid aspect-video place-items-center bg-[radial-gradient(120%_90%_at_50%_10%,#f2c46a_0%,#1d4a52_55%,#0b1f2e_100%)]">
          <svg viewBox="0 0 200 200" className={`h-52 ${talking ? "bob" : ""}`} role="img" aria-label={teacherName} overflow="visible">
            <g filter="url(#f-rim)"><TeacherArt talking={talking} /></g>
          </svg>
          {subtitle && <p className="absolute inset-x-4 bottom-3 rounded-lg border border-[#b8862a]/60 bg-black/70 p-2 text-center text-white backdrop-blur">{subtitle}</p>}
        </div>
      )}
      <div className="p-4">
        <p className="font-black">👩‍🏫 {teacherName}</p>
        {!videoUrl && <button className="btn btn-coin mt-3 w-full" onClick={play} disabled={talking}>{talking ? "おはなしちゅう…" : "▶ せんせいの おはなしを きく"}</button>}
        <NextBtn onClick={() => { window.speechSynthesis?.cancel(); onDone(); }} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. フラッシュカード（Session 1: Look / Stop / Come here / Go ＋ あいさつ単語）
// ---------------------------------------------------------------------------
export function Flashcards({ items, onDone }: { items: LearningItemDef[]; onDone: Done }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
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
export function TprDrill({ items, actions, onDone }: { items: LearningItemDef[]; actions: Record<string, string>; onDone: Done }) {
  const [round, setRound] = useState(0);
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
export function Phonics({ focus, words, tipJa, onDone }: { focus: string[]; words: string[]; tipJa: string; onDone: Done }) {
  const [lit, setLit] = useState<{ word: string; n: number } | null>(null);
  const blend = async (w: string) => {
    for (let n = 1; n <= w.length; n++) {
      setLit({ word: w, n });
      await speak(w[n - 1], 0.6);
    }
    await speak(w, 0.8);
    setLit(null);
  };
  return (
    <div className="card p-6">
      <p className="rounded-xl bg-[var(--bg)] p-3 text-sm">💡 {tipJa}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        {focus.map((f) => <button key={f} className="card px-5 py-3 text-4xl font-black text-[var(--accent)]" onClick={() => speak(f.replace(/^-/, ""), 0.7)}>{f}</button>)}
      </div>
      <p className="mt-6 text-center font-bold text-[var(--ink-2)]">おとを つなげて よもう（ブレンディング）</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {words.map((w) => (
          <button key={w} className="card p-4 text-3xl font-black tracking-[.3em]" onClick={() => blend(w)}>
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
export function SchoolExpressions({ items, testPoints, onDone }: { items: LearningItemDef[]; testPoints: string[]; onDone: Done }) {
  const core = items.filter((i) => i.schoolCore);
  const [k, setK] = useState(0);
  const [text, setText] = useState("");
  const [res, setRes] = useState<{ verdict: string; feedbackJa: string } | null>(null);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const target = core[k];

  const check = async () => {
    const { data: r } = await apiPost("/api/grade/written", GradeResponseSchema, { itemId: target.id, answer: text });
    setRes(r); // 失敗しても「うまく採点できなかったよ」というデフォルトの形で返る
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
          <input value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} className="mt-2 w-full rounded-xl border-y-4 border-double border-[var(--ink-2)]/40 bg-[var(--bg)] p-3 text-xl" autoCapitalize="off" spellCheck={false} />
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

// ---------------------------------------------------------------------------
// 6. 発音チェック（マイク → 音声認識 → リアルタイム採点）
// ---------------------------------------------------------------------------
export function Pronunciation({ items, onDone }: { items: LearningItemDef[]; onDone: Done }) {
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [i, setI] = useState(0);
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
export function QuizRun({ questions, title, onDone }: { questions: Question[]; title?: string; onDone: (logs: AnswerLog[], score: number) => void }) {
  const [i, setI] = useState(0);
  const [logs, setLogs] = useState<AnswerLog[]>([]);
  const [flash, setFlash] = useState<{ ok: boolean; explain: string } | null>(null);
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
      <QuestionView key={q.id} q={toPublic(q)} onAnswer={answer} disabled={!!flash} />
      {flash && <p className={`card mt-3 p-3 text-center font-bold ${flash.ok ? "text-[var(--ok)]" : "text-[var(--ng)]"}`}>{flash.ok ? "⭕ せいかい！" : `❌ ${flash.explain}`}</p>}
    </div>
  );
}

export function SpeedListening({ rounds, onDone }: { rounds: { rate: number; questions: Question[] }[]; onDone: (logs: AnswerLog[], best: number) => void }) {
  const [r, setR] = useState(0);
  const [all, setAll] = useState<AnswerLog[]>([]);
  const [best, setBest] = useState(0);
  const round = rounds[r];
  return (
    <QuizRun
      key={r}
      title={`⚡ スピードリスニング ラウンド${r + 1}：${round.rate}ばいそく`}
      questions={round.questions}
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
