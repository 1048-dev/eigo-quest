"use client";
/**
 * 音声再生。骨組みではブラウザの speechSynthesis（en-US 女性声を優先）を使う。
 * 本番はネイティブ収録音声 or 事前生成TTS（/media/audio/{itemId}.mp3）を <audio playbackRate> で再生し、
 * 0.8 / 1.0 / 1.2 倍速のスピードリスニングでもピッチが変わらないようにする（preservesPitch）。
 */
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

/** audioKey = audioKeyOf(itemId)。音声生成パイプラインも同じハッシュでファイル名を付ける */
export async function playItemAudio(audioKey: string, fallbackText: string, rate = 1.0) {
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
