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

## Phase 2 すべての データの 確認（npm run check:data）

### できた こと
- **`npm run check:data`**（scripts/data-check.ts → scripts/lib/dataCheck.ts）: ぜんぶの データを seed 5 つ（1・2・3・42・20261127）で しらべ、進みぐあい・表・**docs/run10/report/data.md** を 出す。問題が 1つでも あれば 終了コード 1、さいごに `CHECK-SUMMARY:` を 出すので **check:all の「データの 確認（Phase 2）」が SKIP → 自動で 実行**に なった。時間制限 1500 秒（重い ループの 中でも 止まる）。
- しらべる もの（ぜんぶ・サンプルなし）:
  1. レッスンの ながれ 1,200 × seed 6（レッスン番号＋5）: 作れる・ステップの じゅんばん・項目 ID が その回の もの・フォニックスの おてほんの 数・クイズ 8問・スピードリスニング 3 ラウンドの 速さ
  2. ぜんぶの 項目 18,043 × ぜんぶの 形式（聞いて えらぶ・意味・英文・TPR・フォニックス・スペル・スピーキング）× プール 2 種 × seed 2
  3. 1問ずつ: 正解が 選択肢に ある・選択肢の id / 文字が かさならない・からっぽ なし・3択 以上（フォニックスの 2つの おとの 聞きわけは 2 以上）・正解の 選択肢の 文字が その ことばに あう・読みあげる 英語が ある・まちがえた ときの 解説が ある・「undefined」「NaN」が ない・スペルは キーボードで 打てる 文字だけで お手本どおりなら 学校モードでも 合格（全角でも）／から・べつの ことばは 合格に しない
  4. フォニックス 4,841 語: まだ ならって いない ワールドの 問いかた（ワールド 4・10・11・12・13〜40）に ならない・「さいしょの おと」「おわりの おと」の 正解が ことばに あう
  5. テスト 2,719（復習 1,200・まとめ 200・ボス 40・アリーナ 79・お宝 1,200）× seed 5、アリーナは モード 5 種＋記憶あり、お宝は 項目の 固定あり: 問題数・範囲・おなじ 項目が 2回 出ない・モードの 形式（21,570 とおり・157,440 問）
  6. 採点 3,035 テスト: オフラインの 採点（サーバーと おなじ seed で 作りなおす）で 正しい こたえ → 100点・合格・つぎの レッスンが ひらく、まちがい → 0点・解説が とどく
  7. 先生の 授業 1,200: 180〜240 秒（189〜239 秒）・時間が つながる・字幕・スライドの ことばが レッスンに ある
  8. まとめ動画 1,200: 120〜180 秒・セグメント・章・英語の 読みあげ
  9. かいわの 台本エンジン（AI なし）1,200 レッスン＋フリートーク 11: 目標を 言う・だまる・ちがう ことを 言う の 3 とおりで さいごまで（返事 21,816）。返事・タップの 候補が ある・～ が のこらない・目標の お手本を 言えば「つかった」に なる
  10. 1か月ワークブック 60 冊: python（generate_worksheets.py）と おなじ きまりで データを みる＋定数（5・30・15・30・20）が アプリと おなじ＋**python で 60 冊を ほんとうに 作る**（3,700 ページ。python / reportlab が なければ とばす）
  11. としょかん（おはなし 100・しつもん 300・チャンツ 28・フリートーク 11）: 決まりの チェック・正しい こたえで 合格・あたらしい ことばが 本文に ある・索引が 最新・本文が 読める
  12. 力だめし 5 ステージ: 決まりの チェック・正しい こたえで 100%・お手本の スピーキング / ライティングが ほぼ 満点・結果が 作れる

### 見つかって なおした もの
- **英文を えらぶ 問題が 2択**（L5「Hello. I'm Kiko. I'm happy.」など、その回の 表現が 2つ だけの とき。レッスンの クイズ・復習クエスト）→ プールで たりない ときは まえの 30 レッスン（もう ならった）の 項目で うめて 4択に（questions.ts の makeQuestion）。たりる ときは 乱数の 使いかたも 今までと おなじ。
- **年号・数の フォニックスを 数字の まま 読み上げ**（L906 の 1600 など ワールド31 の 年号。声に よっては「one thousand six hundred」）: ワールド31 の 問題だけ audioText（読みかた）が なかった → sixteen hundred で 読む。あわせて 数・年号・記号の ことばは レッスンの ことばボタン（step.spoken）・まとめ動画でも 英語の 読みかたで 読む（phonicsButtons.ts の spokenPhonicsWord。ワールド31〜36 の 数）。
- **年号の 入った 目標を 言っても「つかった」に ならない**（L891・906・916 など 36 回）: 子どもの ことばは 個人情報の 伏せ字（3けた 以上の 数 → ***）の あとで くらべて いた → 目標の 表現も おなじように 伏せて くらべる（engine.ts の usedTargets）。
- **かいわの タップの 候補・お手本が「It's in ....」**（96 の 目標。台本に その 形の 文が ない とき）→
  - その回の 学校の 表現を お手本に つかう（レッスンを 読みこむ ときに aiTask.examples に 入れる。API の 形にも 追加）
  - 「He / She is a ～.」「behind / next to / between」は どちらか 一方の 形に わけて さがす・判定する（targetVariants）
  - 形の あてはめ（fillTemplate）: 「He has ～.」←「Birimo has a new map.」→「He has a new map.」、「～ is ～ing.」←「Haru is running.」、a / an。名前と 代名詞 以外の 主語（The・Long など）は かえない
  - それでも ない 33 の 目標は、場面に あう お手本の 文を 1つずつ JSON に 書いた（aiTask.examples。L230「She can help sick people.」など 32＋フリートーク「I think it's fun.」）。english:lint は error 0 の まま
  - ついでに「～ is ～ing.」の ような ～ で はじまる 目標は、今まで「is ing」の ならびを さがして いたので **ぜったいに 判定されなかった** → 形で 判定する
- **ワークブックの「さいしょの 音に ○」の こたえが June → J（大文字）・1600 → 1・"Run!" → "**（426 か所。まとめ / ボステスト D は 6,211 か所）→ 英字だけの ことばに かぎり、こたえは 小文字（first_sound_words）。数・セリフの 回（30 レッスン）は その 欄に「アプリで れんしゅう」と 書き、テストの D は 見出しごと 出さない（2 テスト）。
- 確認の まちがい（データは 正しかった）: としょかんの「あたらしい ことば」は「forget (forgot)」「some / any」のような 書きかたが あるので、/ と ( ) で わけて さがす。タイトルにも ある ことば（diary）は OK。

### けっか（npm run check:data・76 秒）
| しらべた もの | 数 | 問題 |
|---|---|---|
| レッスンの ながれ | レッスン 1,200・ながれ 7,200・問題 144,000 | 0 |
| ぜんぶの 項目 × ぜんぶの 形式 | 項目 18,043・問題 154,156 | 0 |
| フォニックス（ステージ） | ことば 4,841 | 0 |
| テスト | 2,719（×seed×モード 21,570・問題 157,440） | 0 |
| 採点（100点 / 0点） | テスト 3,035・スペル 5,001 | 0 |
| 先生の 授業 | 1,200（189〜239 秒） | 0 |
| まとめ動画 | 1,200（120〜180 秒） | 0 |
| かいわ（AI なし） | 1,200＋フリートーク 11・返事 21,816 | 0 |
| ワークブック（データ） | 60 冊・1,200 レッスン・テスト 240 | 0 |
| ワークブック（PDF） | 60 冊・3,700 ページ | 0 |
| としょかん | おはなし 100・しつもん 300・チャンツ 28・フリートーク 11 | 0 |
| 力だめし | 5 ステージ・185 問 | 0 |

- なおす まえ（seed 1 つ）は 問題 6,988（ワークブック 6,637・英文の 2択 172・数字の まま 読み上げ 58・まとめ動画 46・かいわ 36・としょかん 39（確認の まちがい））。かいわは 確認を 強めて さらに 96 見つけた。
- tsc OK・vitest 2,670 passed（85 files。tests/data-check.test.ts 13 件を 追加: seed 1 つで ぜんぶ 問題 0・わざと こわした データを 見つける・なおした ものの 再発ふせぎ）・next build OK（/map 195 kB・/lesson 198 kB / 予算 230 kB）・english:lint error 0（warn 465 は まえと おなじ）・curriculum:check / library:check OK。

### 決めた こと・メモ
- vitest では seed 1 つ（約 17 秒）、check:data では seed 5 つ＋python の PDF。
- フォニックスの 2択（-s の ス / ズ など）は 聞きわけの 問題なので OK に した。ことばを えらぶ 問題は 3択 以上。
- ワークブックの PDF は .tmp/data-check/worksheets に 作る（git には 入れない）。本番の 月の PDF は 今までどおり `npm run worksheets` → `npm run worksheets:upload` で 作りなおす 必要が ある（こたえの 小文字・数の 回の 欄が かわった）。
- check:all を `--only data` で ためした あと、latest.md は Phase 1 の ぜんぶの 表に もどした（データの 表は data.md）。
