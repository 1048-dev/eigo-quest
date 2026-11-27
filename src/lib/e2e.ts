/**
 * run10 Phase 4: クリックで すすめる ロボット（npm run check:e2e）用の テストの しかけ。
 *
 *  - 正解を 画面の data-e2e-answer / data-e2e-type / data-e2e-correct / data-e2e-say に 出す（QuestionView・SpeakButton・学校の 書きとり）
 *  - テストの 出題（/api/tests/:id/start と ブラウザの 出題）が e2eAnswers（問題 id → 正解）を いっしょに 返す（src/lib/offline/tests.ts）
 *
 * E2E=1 で ビルドした とき（出力は .next-e2e）だけ うごく。next.config.ts の env で process.env.E2E は ビルドの ときに
 * "1" / "0" に 置きかわる。ふつうの ビルド（本番）では `process.env.E2E === "1"` が "0" === "1" に なり、
 * しかけは 属性の 名前ごと コードから 消える（check:e2e が .next/static に「data-e2e」が ない ことを たしかめる）。
 * そのため 画面の コードでは この 関数を よばず、その場で `process.env.E2E === "1" ? {…} : {}` と 書く
 * （べつの モジュールの 関数だと ミニファイで 消えない ことが ある）。vitest では process.env.E2E を 自分で 入れて ためす。
 */
export function e2eHooks(): boolean {
  return process.env.E2E === "1";
}
