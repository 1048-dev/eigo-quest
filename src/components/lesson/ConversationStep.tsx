"use client";
/**
 * レッスンさいごの ステップ「AIキャラと かいわ」（さいだい 6 ターン）。
 *  - 入力: 🎤 音声認識（en-US。使えるブラウザだけ）／ことばを タップ／キーボードで 入力
 *  - 出力: speechSynthesis で キャラの返事を 読み上げ（日本語訳は 表示だけ）
 *  - サーバーに つながらないときは、同じ台本エンジンで その場で 返事を作る（止まらない）
 *  - 音声が使えなくても タップだけで さいごまで できる。とばしても レッスンは クリアできる
 */
import { useEffect, useRef, useState } from "react";
import type { LearningItemDef, LessonConversation } from "@/lib/domain/types";
import type { AnswerLog } from "@/lib/services/progressService";
import { apiPost } from "@/lib/api/client";
import { ConversationResponseSchema, type ConversationResponse } from "@/lib/api/contracts";
import {
  CHARACTER_NAME, GENERIC_CONVERSATION, buildSuggestions, normalizeWords, scriptedReply, starterLine, targetStem, usedTargets,
  type ConversationCharacter, type ConversationTurn,
} from "@/lib/conversation/engine";
import { speak } from "@/lib/speech/tts";
import { isSpeechRecognitionSupported, listenOnce, type Listening } from "@/lib/speech/recognition";
import { StandingFigure } from "@/components/characters/StandingArt";
import { COIN_RULES } from "@/lib/domain/config";

interface Bubble extends ConversationTurn { ja?: string }

/** 子どもの ことばに 入っていた目標表現 → レッスンの EXPRESSION 項目（SPEAKING のログ用） */
export function conversationLogs(childTexts: string[], targets: string[], items: LearningItemDef[]): AnswerLog[] {
  const exprs = items.filter((i) => i.kind === "EXPRESSION");
  const out = new Map<string, AnswerLog>();
  for (const text of childTexts) {
    for (const hit of usedTargets(text, targets)) {
      const stem = targetStem(hit).join(" ");
      const item = exprs.find((i) => ` ${normalizeWords(i.text).join(" ")} `.includes(` ${stem} `));
      if (item && !out.has(item.id)) out.set(item.id, { itemId: item.id, skill: "SPEAKING", questionType: "conversation", correct: true, score: 1, answer: text.slice(0, 200) });
    }
  }
  return [...out.values()];
}

/** レッスン以外（としょかんの フリートーク）で つかう ときの 文言と 送り先 */
export interface ConversationVariant {
  /** 返事を もらう API と、毎回 いっしょに 送る 値（既定: /api/conversation に lessonNo と character） */
  endpoint?: { url: string; body: Record<string, unknown> };
  /** はじめる 画面の ごほうびの 一言（null で 出さない） */
  coinNote?: string | null;
  /** おわった ときの 文 と ボタン */
  doneText?: string;
  doneLabel?: string;
  skipLabel?: string;
}

export function ConversationStep({ lessonNo, conversation, character = "haru", maxTurns = 6, items, onDone, variant = {} }: {
  lessonNo: number;
  conversation: LessonConversation | null | undefined;
  character?: ConversationCharacter;
  maxTurns?: number;
  items: LearningItemDef[];
  /** finished = さいごまで おはなし できた（レッスンごとに1回 コイン+5）。turns = 子どもが 話した 回数 */
  onDone: (logs: AnswerLog[], finished: boolean, turns: number) => void;
  variant?: ConversationVariant;
}) {
  const conv = conversation ?? GENERIC_CONVERSATION;
  const name = CHARACTER_NAME[character];
  const endpoint = variant.endpoint ?? { url: "/api/conversation", body: { lessonNo, character } };
  const coinNote = variant.coinNote === undefined ? `さいごまで おはなし すると 🪙+${COIN_RULES.conversationFinished}` : variant.coinNote;
  const [started, setStarted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [talking, setTalking] = useState(false);
  const [listening, setListening] = useState(false);
  const [done, setDone] = useState(false);
  const [stars, setStars] = useState(0);
  const [micOk, setMicOk] = useState(false);
  const [heardNothing, setHeardNothing] = useState(false);
  const listenRef = useRef<Listening | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setMicOk(isSpeechRecognitionSupported()); }, []);
  useEffect(() => { endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "nearest" }); }, [bubbles.length]);
  useEffect(() => () => { listenRef.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  const say = async (en: string) => {
    setTalking(true);
    await speak(en, 0.95);
    setTalking(false);
  };

  const start = () => {
    const first = starterLine(conv, character);
    setStarted(true);
    setBubbles([{ role: "ai", text: first }]);
    setSuggestions(buildSuggestions(conv, []));
    void say(first);
  };

  const childTurns = bubbles.filter((b) => b.role === "child").length;

  const send = async (raw: string) => {
    const said = raw.trim();
    if (busy || done || !said) return;
    setBusy(true);
    setText("");
    setHeardNothing(false);
    const history: ConversationTurn[] = bubbles.map(({ role, text: t }) => ({ role, text: t }));
    setBubbles((b) => [...b, { role: "child", text: said }]);
    const r = await apiPost(endpoint.url, ConversationResponseSchema, { ...endpoint.body, history, childText: said });
    const reply: ConversationResponse = r.ok
      ? r.data
      : { success: true, ...scriptedReply({ conversation: conv, history, childText: said, maxTurns }) };
    setBubbles((b) => [...b, { role: "ai", text: reply.replyEn, ja: reply.replyJa }]);
    setSuggestions(reply.suggestions);
    if (reply.usedTarget) setStars((s) => s + 1);
    // サーバーが done を返さなくても、さいだいターンで おわり
    const finished = reply.done || childTurns + 1 >= maxTurns;
    if (finished) setDone(true);
    setBusy(false);
    void say(reply.replyEn);
  };

  const mic = async () => {
    if (listening || busy || done) return;
    window.speechSynthesis?.cancel();
    setListening(true);
    const l = listenOnce();
    listenRef.current = l;
    const heard = await l.result;
    listenRef.current = null;
    setListening(false);
    if (heard) void send(heard);
    else setHeardNothing(true);
  };

  const finish = () => {
    window.speechSynthesis?.cancel();
    const childTexts = bubbles.filter((b) => b.role === "child").map((b) => b.text);
    onDone(conversationLogs(childTexts, conv.aiTask.targetExpressions, items), done, childTexts.length);
  };

  if (!started) {
    return (
      <div className="card p-6 text-center">
        <p className="font-title text-lg">💬 {name}と おはなし しよう！</p>
        <div className="my-3 flex justify-center"><StandingFigure id={character} pose="wave" height={150} /></div>
        <p className="text-sm text-[var(--ink-2)]">ばめん：{conv.sceneJa}</p>
        <p className="mt-2 rounded-lg bg-[var(--surface)] p-3 font-bold">🎯 {conv.aiTask.goalJa}</p>
        <p className="mt-2 text-xs text-[var(--ink-2)]">{micOk ? "🎤 で えいごを はなしてね。ことばを タップしても いいよ。" : "ことばを タップするか、キーボードで いれてね。"}</p>
        {coinNote && <p className="mt-2 text-sm font-black text-[var(--coin)]">{coinNote}</p>}
        <button className="btn btn-coin mt-4 w-full" onClick={start}>▶ はじめる</button>
        <button className="mt-3 text-sm text-[var(--ink-2)] underline" onClick={() => onDone([], false, 0)}>{variant.skipLabel ?? "きょうは とばす"}</button>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <p className="font-black">💬 {name}と おはなし</p>
        <p className="text-sm font-bold text-[var(--ink-2)]" aria-label="はなした かいすう">🗣️ {childTurns}/{maxTurns}　⭐ {stars}</p>
      </div>
      <div className="mt-3 flex gap-3">
        <div className={`shrink-0 ${talking ? "bob" : ""}`} aria-hidden><StandingFigure id={character} pose={done ? "cheer" : talking ? "wave" : "idle"} height={120} /></div>
        <ul className="flex max-h-80 flex-1 flex-col gap-2 overflow-y-auto" aria-live="polite">
          {bubbles.map((b, i) => (
            <li key={i} className={b.role === "ai" ? "self-start max-w-[90%]" : "self-end max-w-[90%]"}>
              {b.role === "ai" ? (
                <button className="rounded-2xl rounded-tl-sm border-2 border-[#7a4e0c]/50 bg-white p-2 text-left text-[#2a1a03]" onClick={() => void say(b.text)} aria-label={`${name}: ${b.text}（もういちど きく）`}>
                  <span className="block text-lg font-black">{b.text} <span aria-hidden className="text-sm">🔊</span></span>
                  {b.ja && <span className="block text-xs text-[#6b5a3a]">{b.ja}</span>}
                </button>
              ) : (
                <p className="rounded-2xl rounded-tr-sm bg-[#2fd08a] p-2 text-lg font-black text-white">{b.text}</p>
              )}
            </li>
          ))}
          {busy && <li className="self-start text-sm text-[var(--ink-2)]">{name}が かんがえちゅう…</li>}
          <div ref={endRef} />
        </ul>
      </div>

      {done ? (
        <div className="mt-4 text-center">
          <p className="text-4xl">🎉</p>
          <p className="font-black">{variant.doneText ?? `かいわ クリア！ 🪙+${COIN_RULES.conversationFinished}`} {stars > 0 ? `つかえた ひょうげん ⭐×${stars}` : "さいごまで おはなし できたね！"}</p>
          <button className="btn btn-coin mt-3 w-full" onClick={finish}>{variant.doneLabel ?? "レッスン クリア！ ▶"}</button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {micOk && (
            <button className={`btn w-full ${listening ? "bg-[#e05656] text-white" : "btn-primary"}`} onClick={() => void mic()} disabled={busy}>
              {listening ? "🎤 きいてるよ… はなしてね" : "🎤 おして えいごで はなす"}
            </button>
          )}
          {heardNothing && <p className="text-center text-sm font-bold text-[var(--ink-2)]">うまく きこえなかったよ。もういちど はなすか、したの ことばを タップしてね。</p>}
          {suggestions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-[var(--ink-2)]">こんなふうに いえるよ（タップ）</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button key={s} className="btn bg-[var(--surface)] px-3 py-1 text-base" onClick={() => void send(s)} disabled={busy}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); void send(text); }}>
            <input
              className="min-w-0 flex-1 rounded-lg border-2 border-[#7a4e0c]/50 bg-white px-3 py-2 text-lg text-[#2a1a03] placeholder:text-[#8a7a5a]"
              value={text} onChange={(e) => setText(e.target.value.slice(0, 200))}
              placeholder="えいごで かいてね" aria-label="えいごで かく" autoComplete="off" autoCapitalize="off" spellCheck={false} lang="en"
            />
            <button className="btn btn-primary" type="submit" disabled={busy || !text.trim()}>おくる</button>
          </form>
          {childTurns >= 2 && <button className="w-full text-sm text-[var(--ink-2)] underline" onClick={finish}>ここで おわりにする</button>}
        </div>
      )}
    </div>
  );
}
