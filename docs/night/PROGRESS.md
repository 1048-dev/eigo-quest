# Night progress

## Phase 1 — 学習ルール（2026-11-24）

### やったこと
1. **対象年齢を 6〜12歳に変更**: README.md、package.json の description、AI採点のシステムプロンプト（src/lib/grading/aiGrader.ts）。
2. **テスト定義（src/lib/curriculum/index.ts）**
   - `check-N`（DAILY_CHECK）を**すべてのレッスン**に作成（5・30の倍数にも）。「復習クエスト」として `unlocksLesson = null`。
   - `mini-(N-4)-N`（5の倍数・30の倍数以外）と `boss-1-N`（30の倍数）は「関門」のまま（`unlocksLesson = N+1`）。アリーナは変更なし。
   - `gateTestAfterLesson(N)` は MINI/BOSS だけを返す。新しく `reviewQuestFor(N)` を追加。
3. **進行（src/lib/domain/progression.ts）**
   - レッスン N を終え、N の後の関門（あれば）に合格すると、**すぐ** N+1 が開く。関門もレッスン直後から受けられる。1日に何レッスンでも進める。
   - 復習クエストはマップ上でレッスンの直後に並ぶが、進行をブロックしない: レッスン前 LOCKED → 完了当日 WAIT_TOMORROW → 翌日から AVAILABLE → 合格で CLEARED。
   - マップの並び: `L5 → C5 → まとめ1-5 → L6`、`L30 → C30 → ボス1-30 → L31`。
   - `current`（きょうのクエスト）= 受けられる復習クエストの先頭 → なければ次のレッスン/関門。
   - `SKIP_DAILY_LOCK` は復習クエストにだけ効く。
   - `canTakeGateTest` のメッセージを「この復習クエストは あしたになったら ひらくよ。きょうは つぎのレッスンに すすめるよ！」に変更。
   - WorldMap の現在地ハイライトも同じ優先順に合わせた。
4. **コイン（config.ts / coins.ts / progressService.ts）**
   - 新しいレッスン: その日の 1〜3回目 10 / 4回目 6 / 5回目 4 / 6回目以降 2（`completeLesson` で今日の完了数を数えてから付与）。
   - 復習クエスト一発合格は 30 のまま（1分あたり最もお得）。ラベルは「復習クエスト 一発クリアボーナス！」など。
   - 連続学習（いちばん大きな報酬）: 毎日 +min(連続日数,10)、7日ごと +50、30日ごと +300 とレアガチャ券1枚。
5. **「翌日テスト」→「復習クエスト」** をマップ・TestRunner・レッスン結果・ビリモのセリフ・コメント・README・prisma のコメントで置きかえ。レッスン結果画面は「このまま つぎのレッスンに すすめるよ！あしたは復習クエストから。いちばんコインがもらえるよ」と表示し、「つぎのレッスンへ」（関門があるときは「まとめテストへ」「ボスに いどむ！」）ボタンを追加。
6. **テスト**: tests/progression.test.ts を新ルールで書き直し、tests/coins.test.ts と tests/companion.test.ts を拡張（合計 85件）。scripts/e2e-smoke.ts も新しい流れに合わせた。
7. `npx tsc --noEmit` / `npx vitest run`（85件）/ `npx next build` すべて成功。

### 判断したこと
- `ProgressInput.reviewQuestFor` は**省略可能**にした（省略すると復習クエストを出さない）。既存の呼び出し（api-contracts テスト）を壊さないため。
- 全レッスン完了などで「受けられるもの」が何もないときは、`current` に WAIT_TOMORROW の復習クエストを返す（マップに「あしたまでまってね」を出すため）。
- 連続ボーナスの3種類は、DB の enum を増やさないようにすべて `STREAK_BONUS` の理由で記録（移行が不要）。7と30の倍数が重なる日（210日目など）は両方もらえる。
- `LessonCompleteResponse.nextTest` は、関門があればその ID、なければ復習クエストの ID を返す。
- offline-resilience ブランチとの衝突を避けるため、server.ts / client.ts / db.ts / API ルート / seed.ts は変更していない。progressService.ts も最小限の変更。
- DB の Assessment 行は seed が ASSESSMENTS から作るので、新しい `check-5` などは次回の `npm run db:seed` で入る（マイグレーション不要）。

### スキップ / 未対応
- レッスン結果の「つぎのレッスンへ」ボタンは、最後のレッスンでも表示される（押すと「レッスンが見つかりません」）。クライアントが総レッスン数を知らないため。今のカリキュラムの最後に来る子はまだいないので後回し。

### オーナーへの質問
- **お宝アラート**（6問・コイン20×2倍=40）は、1分あたりで見ると復習クエスト一発合格（30）より多くなります。ランダムで1日1回までのイベントなので今回はそのままにしました。お宝の報酬を下げる（例: 基本15×2=30）べきでしょうか？
- 1日のレッスン数に上限はつけていません（ルールどおり無制限、6回目以降は2コイン）。

