"use client";
/**
 * 自由発話の音声認識（Web Speech API, en-US）。かいわステップで使う。
 * 使えないブラウザ・マイク拒否・聞きとれないときは "" を返す（例外を投げない）。
 */
type Rec = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
};

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export interface Listening {
  result: Promise<string>;
  stop: () => void;
}

export function listenOnce(timeoutMs = 7000): Listening {
  let rec: Rec | null = null;
  const result = new Promise<string>((resolve) => {
    try {
      const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!Ctor) return resolve("");
      rec = new Ctor() as Rec;
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.continuous = false;
      rec.maxAlternatives = 1;
      let done = false;
      const finish = (s: string) => { if (!done) { done = true; resolve(s.trim()); } };
      rec.onresult = (e: any) => finish(String(e?.results?.[0]?.[0]?.transcript ?? ""));
      rec.onerror = () => finish("");
      rec.onend = () => finish("");
      rec.start();
      // 時間切れ: stop() のあと結果が来るのを少しだけ待つ（onend が来ないブラウザ対策で最後は "" で終わる）
      setTimeout(() => { try { rec?.stop(); } catch { /* noop */ } setTimeout(() => finish(""), 1500); }, timeoutMs);
    } catch {
      resolve("");
    }
  });
  return { result, stop: () => { try { (rec as Rec | null)?.stop(); } catch { /* noop */ } } };
}
