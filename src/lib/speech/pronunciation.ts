/**
 * 発音判定。
 *  - クライアント: Web Speech API（SpeechRecognition）で音声→テキスト＋confidence を取得
 *  - スコア: お手本との単語一致率 × 認識の確信度 で 0〜1 に
 * 本番では音素単位の評価ができる発音評価API（例: Azure Pronunciation Assessment 等）を
 * /api/pronunciation 経由で呼ぶ PronunciationScorer 実装に差し替える（インターフェースは同じ）。
 */
export interface PronunciationResult {
  transcript: string;
  confidence: number;
  score: number; // 0..1
  stars: 1 | 2 | 3;
  wordResults: { word: string; ok: boolean }[];
}

export interface PronunciationScorer {
  assess(target: string): Promise<PronunciationResult>;
}

const words = (s: string) => s.toLowerCase().replace(/[^a-z' ]/g, " ").split(/\s+/).filter(Boolean);

/** 純粋関数: 認識結果からスコアを算出（単体テスト対象） */
export function scorePronunciation(target: string, transcript: string, confidence: number): PronunciationResult {
  const t = words(target);
  const heard = new Set(words(transcript));
  const wordResults = t.map((w) => ({ word: w, ok: heard.has(w) }));
  const match = t.length === 0 ? 0 : wordResults.filter((w) => w.ok).length / t.length;
  // 認識エンジンは子どもの声で confidence が低めに出やすいので下駄を履かせる
  const conf = Math.min(1, 0.4 + 0.6 * (confidence || 0.5));
  const score = Math.round(match * conf * 100) / 100;
  return { transcript, confidence, score, stars: score >= 0.85 ? 3 : score >= 0.6 ? 2 : 1, wordResults };
}

type SR = { new (): { lang: string; interimResults: boolean; maxAlternatives: number; onresult: (e: any) => void; onerror: (e: any) => void; onend: () => void; start(): void; stop(): void } };

export class BrowserPronunciationScorer implements PronunciationScorer {
  static isSupported() {
    return typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  assess(target: string): Promise<PronunciationResult> {
    return new Promise((resolve, reject) => {
      const Ctor: SR | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!Ctor) return reject(new Error("SpeechRecognition not supported"));
      const rec = new Ctor();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      let done = false;
      rec.onresult = (e: any) => {
        done = true;
        const alts = Array.from(e.results[0] as ArrayLike<{ transcript: string; confidence: number }>);
        // 代替候補の中で最もスコアが高いものを採用（子どもにやさしく）
        const best = alts.map((a) => scorePronunciation(target, a.transcript, a.confidence)).sort((a, b) => b.score - a.score)[0];
        resolve(best);
      };
      rec.onerror = (e: any) => { if (!done) reject(new Error(e.error)); };
      rec.onend = () => { if (!done) resolve(scorePronunciation(target, "", 0)); };
      rec.start();
      setTimeout(() => rec.stop(), 5000);
    });
  }
}
