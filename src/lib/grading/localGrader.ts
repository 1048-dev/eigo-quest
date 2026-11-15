/**
 * ルールベースの一次採点（LLMを呼ぶ前に確定できるものはここで確定させる）。
 *   確定: 完全一致 / 大文字小文字だけの差 / 句読点だけの差 / 明らかな別単語
 *   未確定: 軽微なスペルミス（編集距離1〜2）や、別の正しい言い方の可能性がある文 → AI採点へ
 *
 * strictness:
 *   "lenient" … レッスン中。大文字・ピリオド忘れは合格＋アドバイス
 *   "school"  … 学校テスト対策モード（まとめ/ボス）。学校で×になる誤りは「再挑戦」
 */
export type Verdict = "PASS" | "RETRY" | "WRONG";
export type Strictness = "lenient" | "school";

export interface GradeResult {
  verdict: Verdict;
  feedbackJa: string;
  /** true ならAI採点不要 */
  certain: boolean;
  issues: string[];
  gradedBy: "rule" | "ai" | "cache";
}

export function normalizeInput(s: string): string {
  return s
    .normalize("NFKC") // 全角英数 → 半角
    .replace(/[‘’`´]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const stripPunct = (s: string) => s.replace(/[.,!?"]/g, "").replace(/\s+/g, " ").trim();
const lettersOnly = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** 学校テストで減点される大文字ルールの違反を列挙 */
export function capitalizationIssues(expected: string, answer: string): string[] {
  const issues: string[] = [];
  const e = expected.split(" ");
  const a = answer.split(" ");
  if (e.length !== a.length) return issues;
  e.forEach((ew, i) => {
    const aw = a[i];
    if (ew.toLowerCase() !== aw.toLowerCase() || ew === aw) return;
    const startsSentence = i === 0 || /[.!?]$/.test(e[i - 1] ?? "");
    if (/^[A-Z]/.test(ew) && /^[a-z]/.test(aw)) {
      if (startsSentence && e.length > 1) issues.push(`文の最初の「${ew}」は大文字で書こう`);
      else if (/^I('|$)/.test(ew)) issues.push(`「I（わたし）」はいつも大文字だよ`);
      else issues.push(`「${ew}」は名前・曜日・月・国などなので大文字で始めよう`);
    } else if (/^[a-z]/.test(ew) && /^[A-Z]/.test(aw) && !startsSentence) {
      issues.push(`「${ew}」は小文字で書こう`);
    }
  });
  return issues;
}

export function gradeLocally(expectedRaw: string, answerRaw: string, strictness: Strictness = "lenient"): GradeResult {
  const expected = normalizeInput(expectedRaw);
  const answer = normalizeInput(answerRaw);
  const isSentence = expected.includes(" ");
  const done = (verdict: Verdict, feedbackJa: string, issues: string[] = []): GradeResult => ({ verdict, feedbackJa, certain: true, issues, gradedBy: "rule" });

  if (!answer) return done("WRONG", "まだ何も書いていないよ。ゆっくりでいいから書いてみよう！");
  if (answer === expected) return done("PASS", "パーフェクト！つづりも大文字も完ぺき！");

  // 1) 大文字・小文字だけの差
  if (answer.toLowerCase() === expected.toLowerCase()) {
    const issues = capitalizationIssues(expected, answer);
    if (issues.length === 0) {
      // 単語単体で "Hello" と書いた等 → 内容は正しい
      return done("PASS", `正解！（${expected} と書くのがふつうだよ）`);
    }
    return strictness === "school"
      ? done("RETRY", `おしい！つづりは合ってるよ。${issues[0]}。学校のテストではここも見られるよ！`, issues)
      : done("PASS", `正解！ワンポイント：${issues[0]}。`, issues);
  }

  // 2) 句読点・アポストロフィだけの差（I'm → Im、ピリオド忘れ）
  if (stripPunct(answer).replace(/'/g, "").toLowerCase() === stripPunct(expected).replace(/'/g, "").toLowerCase()) {
    const tips: string[] = [];
    if (expected.includes("'") && !answer.includes("'")) tips.push("アポストロフィ（'）をわすれずに");
    if (/[.?!]$/.test(expected) && !/[.?!]$/.test(answer)) tips.push(`文の終わりには「${expected.slice(-1)}」をつけよう`);
    tips.push(...capitalizationIssues(stripPunct(expected), stripPunct(answer)));
    const tip = tips[0] ?? "記号をもう一度見てみよう";
    return strictness === "school"
      ? done("RETRY", `おしい！単語は合ってるよ。${tip}。`, tips)
      : done("PASS", `正解！ワンポイント：${tip}。`, tips);
  }

  // 3) 軽微なスペルミス or 別の言い方 → AIに判断を委ねる（ここでは暫定判定）
  const dist = levenshtein(lettersOnly(answer), lettersOnly(expected));
  const len = lettersOnly(expected).length;
  const minor = dist <= (len >= 8 ? 2 : 1);
  if (minor) {
    return { verdict: "RETRY", feedbackJa: "おしい！あと少しでつづりが合うよ。もう一度見てみよう。", certain: false, issues: [`edit_distance=${dist}`], gradedBy: "rule" };
  }
  if (isSentence) {
    // "Hi! I'm Ken." のような別解の可能性 → AI
    return { verdict: "WRONG", feedbackJa: "お手本の文とちがうみたい。もう一度聞いてみよう。", certain: false, issues: [`edit_distance=${dist}`], gradedBy: "rule" };
  }
  return done("WRONG", `ざんねん！正しくは「${expected}」だよ。いっしょに書いてみよう。`, [`edit_distance=${dist}`]);
}
