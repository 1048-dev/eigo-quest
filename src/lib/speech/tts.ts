"use client";
/**
 * 音声再生。骨組みではブラウザの speechSynthesis（en-US 女性声を優先）を使う。
 * 本番はネイティブ収録音声 or 事前生成TTS（/media/audio/{itemId}.mp3）を <audio playbackRate> で再生し、
 * 0.8 / 1.0 / 1.2 倍速のスピードリスニングでもピッチが変わらないようにする（preservesPitch）。
 */
import { estimateWordDurations, wordIndexAt, wordRanges } from "@/lib/library/words";

export function speak(text: string, rate = 1.0, lang: "en-US" | "ja-JP" = "en-US"): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return resolve();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate * 0.9; // 子ども向けに基準速度を少し落とす
    const voices = window.speechSynthesis.getVoices();
    const prefix = lang.slice(0, 2);
    u.voice = voices.find((v) => v.lang.startsWith(prefix) && /female|samantha|jenny|aria|zira|kyoko|nanami/i.test(v.name)) ?? voices.find((v) => v.lang.startsWith(prefix)) ?? null;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export interface TrackedSpeech {
  done: Promise<void>;
  cancel: () => void;
}

/**
 * 読みながら「いま 読んでいる ことば」を しらせる（としょかんの 読み聞かせの ハイライト）。
 *  - ブラウザが boundary イベント（word）を 出せば その 位置を 使う
 *  - 出さない（声による）・speechSynthesis が ない ときは、ことばの 長さから 時間を 見つもって すすめる（音が なくても ハイライトは 動く）
 * onWord(-1) で おわり。
 */
export function speakTracked(text: string, rate: number, onWord: (index: number) => void): TrackedSpeech {
  const ranges = wordRanges(text);
  const durations = estimateWordDurations(text, rate * 0.9);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let gotBoundary = false;
  let finished = false;
  let resolveDone: () => void = () => {};
  const done = new Promise<void>((r) => { resolveDone = r; });
  const finish = () => {
    if (finished) return;
    finished = true;
    if (timer) clearTimeout(timer);
    onWord(-1);
    resolveDone();
  };
  // 見つもりで すすめる（boundary が 来たら やめる）
  const step = (i: number, endWhenDone: boolean) => {
    if (finished || gotBoundary) return;
    if (i >= ranges.length) { if (endWhenDone) finish(); return; }
    onWord(i);
    timer = setTimeout(() => step(i + 1, endWhenDone), durations[i] ?? 300);
  };

  const synth = typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;
  if (!synth || ranges.length === 0) {
    step(0, true);
    if (ranges.length === 0) finish();
    return { done, cancel: finish };
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate * 0.9;
  const voices = synth.getVoices();
  u.voice = voices.find((v) => v.lang.startsWith("en") && /female|samantha|jenny|aria|zira/i.test(v.name)) ?? voices.find((v) => v.lang.startsWith("en")) ?? null;
  u.onstart = () => step(0, false);
  u.onboundary = (e) => {
    if (e.name && e.name !== "word") return;
    gotBoundary = true;
    if (timer) clearTimeout(timer);
    onWord(wordIndexAt(ranges, e.charIndex));
  };
  u.onend = finish;
  u.onerror = finish;
  synth.speak(u);
  // onstart も onend も 来ない（声が ない・ブロックされた）ときの 保険
  const total = durations.reduce((a, b) => a + b, 0);
  setTimeout(() => { if (!finished && !gotBoundary && !timer) step(0, true); }, 1200);
  setTimeout(finish, total * 2 + 4000);
  return { done, cancel: () => { synth.cancel(); finish(); } };
}

const RECORDED_AUDIO = process.env.NEXT_PUBLIC_RECORDED_AUDIO === "1";

/** audioKey = audioKeyOf(itemId)。音声生成パイプラインも同じハッシュでファイル名を付ける */
export async function playItemAudio(audioKey: string, fallbackText: string, rate = 1.0) {
  // 収録音声（public/media/audio）を 置いて NEXT_PUBLIC_RECORDED_AUDIO=1 に するまでは 読み上げだけ。
  // ない ファイルを 毎回 取りに いくと 404 と コンソールの エラーが 出て、音も おくれる
  if (!RECORDED_AUDIO) return speak(fallbackText, rate);
  const audio = new Audio(`/media/audio/${audioKey}.mp3`);
  audio.playbackRate = rate;
  audio.preservesPitch = true;
  try {
    await audio.play();
    await new Promise((r) => (audio.onended = r));
  } catch {
    await speak(fallbackText, rate);
  }
}

/** 日英まじりの台本を文ごとに言語を切り替えて読み上げる（AI教師アニメーションのフォールバック） */
export async function speakMixed(script: string, onSentence?: (s: string) => void) {
  window.speechSynthesis?.cancel();
  const sentences = script.match(/[^。！？!?.]+[。！？!?.]?/g) ?? [script];
  for (const s of sentences) {
    const t = s.trim();
    if (!t) continue;
    onSentence?.(t);
    const ascii = t.replace(/[^\x00-\x7F]/g, "").length / t.length;
    await speak(t, 1, ascii > 0.6 ? "en-US" : "ja-JP");
  }
  onSentence?.("");
}
