# Run 10 progress

## Phase 1 ぜんぶの 確認を 1つの コマンドで（npm run check:all）

### できた こと
- **`npm run check:all`**（scripts/check-all.ts）: 下の 11 ステップを じゅんばんに 実行し、さいごに 表（name・result・count・time）を 出して **docs/run10/report/latest.md** に 書く。
  1. english:lint（ぜんぶ・`--strict`。error が 1つでも あれば 失敗）→ docs/run10/report/english-lint.md
  2. tsc 3. vitest 4. next build
  5. データの 確認（Phase 2）6. 画面の 描画（Phase 3）
  7. DB 停止の スモーク（scripts/smoke-offline.ts）
  8. E2E（本物の DB・Phase 4）
  9. アクセシビリティ（axe-core + Playwright）→ docs/run10/report/a11y.md
  10. 内部リンク → docs/run10/report/links.md
  11. JS の 大きさの 予算（/map・/lesson/[lessonNo] の First Load JS が 230 kB を こえたら 失敗）
- 各ステップに 時間制限（english-lint 15分・vitest 30分・build 20分・スモーク 約32分・E2E 60分 など）。こえたら プロセスを ツリーごと 止めて TIMEOUT。30秒ごとに「…実行中（経過 / 最長）」を 出す。出力は そのまま 画面に 流し、`.data/check-all/<name>.log` にも のこす（git には 入れない）。
- オプション: `--only tsc,vitest`・`--skip e2e`・`--list`・`--strict`（SKIP も 失敗に する）。FAIL・TIMEOUT が 1つでも あれば 終了コード 1。
- **Phase 2〜4 の ステップ**は package.json に `check:data`・`check:render`・`check:e2e` が できたら 自動で 実行される（いまは SKIP と 表示）。E2E には `-- --db <URL>` で 確認用の DB を わたす。
- **本物の DB**（scripts/lib/checkDb.ts）: Docker が 使えれば 使いすての `postgres:16`（コンテナ名 eq-check-db・ポート 5544・`--rm`）、使えなければ npm の embedded-postgres（devDependency。PostgreSQL 16 に あわせて 16.16.0-beta.19 に 固定。19 の beta は 本番と ちがうので やめた）。`prisma migrate deploy` と seed の あと next start（メールは outbox・LINE は dry-run・AI キーなし）。おわったら コンテナを 消す。**ポート 5432 の URL は コードで こばむ**（ほかの プロジェクトの DB）。
- 単体でも うごく: `npm run check:a11y`（DB を 自分で 起動。`--offline`・`--base` も）、`npm run check:links`、`npm run check:bundle`（`--log` か なければ next build）。
- **アクセシビリティ**: スマホ 390x844 で 23 画面（スタート・ログイン・登録・パスワード / 暗証番号を 忘れた・マップ・レッスン1/31・まとめ動画・ふくしゅうクエスト・ミニテスト・ダッシュボード・ガチャ・アリーナ・ランキング・としょかん（おはなし・チャンツ・フリートーク）・力だめし・規約 3つ）＋ 保護者を 登録した あとの 3 画面（おうちの方ページ 2・だれが あそぶ？）。WCAG 2.1 A/AA。critical・serious は 失敗、moderate・minor は 数だけ。
- **内部リンク**: ブラウザで おもな 画面を ひらいて 表示された リンクと ファイル（img・link・script・audio など）を あつめ、見つけた 画面も たどる（同じ かたちの URL は 3 つまで）。さらに ルート ぜんぶ（レッスン 1〜1200・まとめ 1〜1200・テスト ぜんぶ・としょかん 139）を くわえて ぜんぶ GET。4xx・5xx・つながらない・ブラウザで ひらけない が 1つでも あれば 失敗。

### 見つかって なおした もの（axe）
- **color-contrast（マップの おしらせの 札）**: 白い 文字に うすい 色（コントラスト 2.4〜3.5）→ 5.1〜6.0 の 色に（src/components/common/AnnouncementsPanel.tsx）。
- **label-content-name-mismatch**（見えている 文字と 読みあげの 名前が ちがう）:
  - ガチャの 図鑑 100 まい: ボタンの aria-label を やめ、カードの 文字（No.・星・名前）から 名前を つくる。まだの カードは 読みあげ用に「まだ出会っていない」（MonsterCard）。
  - としょかんの 読みあげの 行（おはなし・チャンツ）: aria-label を やめ、英文＋訳＋「（タップで よむ）」（sr-only）に（ReadAlong.tsx）。
  - だれが あそぶ？ の こどもの ボタン: aria-label を やめ、「そらさん 小1（いま えらばれているよ）」に（「さん」と「いま えらばれているよ」は sr-only、「いま」の 札は 読まない）。run4・run5 の 確認スクリプトの `/^そらさん/` も そのまま つかえる。
- 内部リンクの 確認で、tsx が 関数に 足す `__name()` で ブラウザの 中の page.evaluate が ReferenceError に なり、画面の リンクが 1つも あつまって いなかった → 文字列の スクリプトに して なおし、ひらけない 画面は 失敗に した。
- 再発ふせぎの テスト: tests/check-all.test.ts（next build の 表の 読みとり・予算・数の とりだし・レポート・5432 を こばむ・URL の まとめかた 17 件）、tests/a11y-labels.test.tsx（上の 4 つの aria と おしらせの 色の コントラスト 5 件）。

### けっか（npm run check:all・ぜんぶで 20分03秒）
| name | result | count | time |
|---|---|---|---|
| english:lint（ぜんぶ） | PASS | 154,506 strings / 1,344 units・error 0 warn 465 info 275 | 7s |
| tsc | PASS | 0 errors | 8s |
| vitest | PASS | 2,656 passed / 2,656 tests（84 files） | 53s |
| next build | PASS | 81 routes | 1m20s |
| データの 確認（Phase 2） | SKIP | まだ ない | - |
| 画面の 描画（Phase 3） | SKIP | まだ ない | - |
| DB 停止の スモーク | PASS | 125 OK / 0 NG | 6m57s |
| E2E（本物の DB・Phase 4） | SKIP | まだ ない | - |
| アクセシビリティ（axe） | PASS | 26 画面・critical/serious 0・moderate/minor 0（なおす まえは serious 5 種類・114 か所） | 4m14s |
| 内部リンク | PASS | 4,123 URL（ブラウザで 27 画面）・こわれた 0 | 6m21s |
| JS の 大きさ | PASS | /map 193 kB・/lesson 197 kB（予算 230 kB） | 1s |

### 決めた こと・メモ
- SKIP は ふだんは 失敗に しない（Phase 2〜4 が できる まで check:all を 通すため）。`--strict` で 失敗に できる。
- a11y と リンクは 1 つの サーバー（本物の DB）を つかいまわして 時間を へらした。リンクの 確認は DB なしでも 同じ ため、単体では `--offline` が 既定。
- 英語の warn 465 は run9 で「わざと」と きめた もの（error だけ 失敗に する）。
- 入れた devDependencies: axe-core・@axe-core/playwright・embedded-postgres（16 系）。
- ※ とちゅうで 外の 自動保存（コミット 68ec4da「run9: zz-summary (auto-save)」）が、作りかけの scripts/check-all.ts などを コミットした。履歴は いじらず、のこりを この フェーズの コミットに 入れた。
