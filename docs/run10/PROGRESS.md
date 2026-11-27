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

## Phase 3 すべての 画面の 描画（npm run check:render）

### できた こと
- **`npm run check:render`**（scripts/render-check.ts → scripts/lib/renderCheck.tsx・scripts/lib/renderHooks.ts）: react-dom/server で 画面を ほんとうに 描いて しらべ、進みぐあい・表・**docs/run10/report/render.md** を 出す。問題が 1つでも あれば 終了コード 1、さいごに `CHECK-SUMMARY:` を 出すので **check:all の「画面の 描画（Phase 3）」が SKIP → 自動で 実行**に なった。
- はやく する ため、しごとの 単位（レッスン 1 つ・テスト 1 つ・おはなしの ステージ 1 つ …、ぜんぶで 4,247）を **ワーカー（子プロセス、既定 CPU−1・さいだい 8）に じゅんばんに くばる**。時間制限 1500 秒・`--workers`・`--lessons 1-30`・`--only lesson,tests`。親が 止まったら ワーカーも おわる。
- 描く もの（ぜんぶ・サンプルなし）:
  1. **1,200 レッスン ぜんぶ**: プレイヤーの わく（ステップごと・クリア・クリアできない）、カード（ぜんぶの カードの おもて・うら）、TPR（ぜんぶの かい・おわり）、フォニックス（ことばを ひからせる）、学校の 表現（ぜんぶの 書きとり × ごうかく / さいちょうせん / ざんねん）、発音（ぜんぶの ことば・まねした あとの 結果・マイク なし）、確認クイズ（ぜんぶの 問題 × こたえる まえ / せいかい / まちがい）、スピードリスニング（3 ラウンド × ぜんぶの 問題）
  2. **先生の 授業**（バーチャル教室）: はじめる まえ・ぜんぶの セグメント × 話す（さいしょ / さいごの 文）・まつ・きりかえ・おわり・字幕 4 とおり・ていし / ゆっくり / おと なし・声が ない
  3. **かいわ**: はじめる まえ・台本エンジンで さいごまで 話した 1 ターンごとの 画面・きいてる / きこえない / かんがえちゅう
  4. **きょうの まとめ**: ぜんぶの セグメント・「いってみよう！」・さいご（コイン / きろくちゅう）・とめた・声が でない
  5. **テスト 3,035**（復習 1,200・まとめ 200・ボス 40・アリーナ 79 × モード 5・お宝 1,200）: ぜんぶの 問題・結果（ぜんぶ せいかい / ぜんぶ まちがい＝解説）・さいてんちゅう
  6. **としょかん**: おはなし 100（よむ・やく あり / なし・1 行ずつ ハイライト・クイズ × こたえる まえ / せいかい / まちがい・けっか・まだ ひらいて いない）、チャンツ 28、フリートーク 11
  7. **力だめし 5 ステージ**: はじめに（受けられる / おためし済み / 1年 まつ）・聞く / 読む ぜんぶの 問題・話す・書く・さいてんちゅう・結果（はじめて / のびた / だめ）
- しらべる こと: **描画の エラー**、**React の 警告**（key が ない など）、**おなじ key の リスト**（サーバーの 描画では React が 気づかないので JSX の 関数を つつんで 見つける）、**出る はずの 文字**（英文・訳・選択肢・字幕・解説 … 1,319,751 か所）、「undefined」「NaN」「[object Object]」「null」（文字と 属性）、**文字も 名前も ない ボタン**、**HTML の 入れ子**（`<div>` in `<p>`・ボタンの 中の リンク・`<li>` の 親 など。ブラウザで ハイドレーションの エラーに なる もの）。

### 描けるように した こと（アプリの コード）
- とちゅうの 画面を サーバーで 描くために、ステップの コンポーネントに **`initial`（はじめの 状態）** を 足した（Flashcards・TprDrill・Phonics・SchoolExpressions・Pronunciation・QuizRun・SpeedListening・SpeakButton・ConversationStep・VirtualClassroom / useTeacherPlayer・RecapPlayer・TestRunner・StoryQuiz）。わたさなければ 今までと おなじ（テストで 確認）。こたえを 見せる しかけでは ない ので 本番に あっても 問題ない と きめた。TestRunner は initial を わたすと 問題を とりに いかない。
- ページの 中身を コンポーネントに 分けた（ページは データを 読むだけ）: **LessonPlayer**（/lesson）・**StoryView / ChantView / TalkView**（としょかん）・**YearlyView**（/yearly）。見た目・うごきは おなじ。レッスン・おはなしが かわったら 状態を リセット する（key）。

### 見つかって なおした もの
- **発音の 結果の ことばが おなじ key**（QuestionView.tsx の SpeakButton。`key={w.word}`）: 「Bye, bye.」「I'm Kiko. I'm happy.」のように おなじ ことばが 2 回 ある 文で key が かさなり、ブラウザでは ことばの ○× が ずれたり 消えたり する。**542 画面**（レッスンの 発音 271 ことば × 2）→ key を 順番に。tests/render-check.test.tsx に 再発ふせぎ（もとに もどすと 失敗する ことを 確認）。
- ほかの 画面（先生・まとめ・かいわ・テスト・としょかん・力だめし）と HTML の 入れ子は さいしょから 問題 0。

### けっか（npm run check:render）
| 画面 | 数 | 描画 | しらべた 文字 | 問題 |
|---|---|---|---|---|
| レッスンの ステップ | 1,200 | 117,629 | 520,900 | 0 |
| 先生の 授業 | 1,200 | 98,100 | 293,841 | 0 |
| かいわ | 1,200 | 14,400 | 61,980 | 0 |
| きょうの まとめ | 1,200 | 67,536 | 177,762 | 0 |
| テスト | 3,035（出題 23,340） | 32,445 | 247,572 | 0 |
| としょかん | おはなし 100・チャンツ 28・フリートーク 11 | 3,035 | 15,915 | 0 |
| 力だめし | 5 ステージ | 405 | 1,781 | 0 |
| **ぜんぶ** | 単位 4,247 | **333,550** | **1,319,751** | **0** |

- なおす まえは 問題 542（ぜんぶ 発音の key）。
- 時間: ワーカー 8 で **約 280 秒**（ほかの 重い しごとが ない とき）。ほかの 確認と かさなった ときは 926 秒。
- tsc OK・vitest 2,687 passed（86 files。tests/render-check.test.tsx 16 件を 追加: 6 レッスン・テスト 9 種・としょかん・力だめしで 問題 0、わざと こわした 画面（エラー・key なし・おなじ key・文字が ない・undefined / NaN・名前の ない ボタン・`<div>` in `<p>`）を 見つける、なおした ものの 再発ふせぎ）・next build OK（/lesson 199 kB・/map 195 kB / 予算 230 kB）。

### 決めた こと・メモ
- 「サーバーで 描く」は react-dom/server の renderToStaticMarkup。effect（音・タイマー・通信）は 動かないので、とちゅうの 画面は initial で つくる。クリックで すすめる 確認は Phase 4（E2E）。
- 先生の 授業の `next/dynamic`（ssr: false）は サーバーでは 「よんでいるよ…」に なるので、VirtualClassroom を 直接 描いた。
- vitest では jsx-dev-runtime を vi.mock で つつむ（おなじ key を 見つける ため）。check:render（tsx）では require の jsx-runtime を その場で つつむ。どちらも 確認の 中だけで、アプリの コードは かわらない。
- ※ Windows では バックグラウンドの npm が さきに 終わった ように 見えて、node は のこって 動きつづける ことが あった（確認が 2〜3 本 かさなって おそく なった）。ワーカーは 親が 止まったら おわる ように した。
- check:all の つながり: `--only render` で「画面の 描画（Phase 3）」が SKIP では なく 実行される ことを 確認。ただし この とき 確認が 2〜3 本 かさなって いて 1500 秒の 時間制限に かかった（render.md の 926 秒の 回は さいごまで 問題 0）。latest.md は Phase 1 の ぜんぶの 表に もどした。
- DB 停止の スモーク（ページを 分けた あとの ビルド・確認が かさなって 重い とき）: レッスン 1〜211・テスト・としょかん（おはなし・チャンツ・フリートーク）・力だめしは ✓。/recap/1・/setup-pin・/login?line=not_configured の 3 つが ✗（setup-pin と login は この フェーズで さわって いない ページ。重さに よる 時間切れと みている）。**かさならない 状態で スモークを もう一度 とる 必要が ある**（Phase 4 の はじめに check:all ぜんぶで たしかめる）。
- 追記（さいしょの `check:all --only render,smoke-offline` が おわった）: **画面の 描画（Phase 3）は check:all の 中で ✅ PASS**（描画 333,550・問題 0・15m29s）。DB 停止の スモークは 77 OK / 5 NG だが、5 つ とも `net::ERR_CONNECTION_RESET`（重さで サーバーが 接続を きった。/recap/1・/setup-pin・/login?line=…・/lesson/631 など。画面の 中身の まちがいでは ない）。オフラインの 流れ（レッスン完了・かいわ・まとめ視聴・マップの リンク）と 先生の ステップ（L1・L31）は ✓。かさならない 状態での スモークの とりなおしは Phase 4 の はじめに。latest.md は もどした。
- **とりなおし（ほかの 確認が かさならない 状態）**: `npx tsx scripts/check-all.ts --only render,smoke-offline` → **PASS（2 PASS / 0 FAIL）・11m31s**。画面の 描画 ✅（描画 333,550・問題 0・4m45s。render.md は 282 秒の この 回）、**DB 停止の スモーク ✅ 125 OK / 0 NG**（/recap/1・/setup-pin・/login?line=… も ✓）。まえの 5 NG は 重さ だけが 原因だった と 確認できた。latest.md は Phase 1 の ぜんぶの 表に もどした。

## Phase 4 クリックで すすめる ロボット（npm run check:e2e・本物の DB）

### できた こと
- **`npm run check:e2e`**（scripts/e2e-check.ts・scripts/lib/e2eRobot.ts・scripts/lib/e2eReport.ts）: 本物の DB（Docker の postgres:16・ポート 5544。なければ embedded-postgres。5432 は こばむ）＋ next start ＋ Playwright で、子どもと 保護者の 操作を **ぜんぶ クリックで** たしかめ、**docs/run10/report/e2e.md** に 表を 書く。さいごに `CHECK-SUMMARY:` を 出すので **check:all の「E2E（本物の DB・Phase 4）」が SKIP → 自動で 実行**に なった（check:all は 用意した DB を `--db` で わたす）。時間制限 3000 秒（`--timeout`）・`--only worlds,progress,extras,parent,offline`・`--worlds 1-5`・`--workers`（既定 3）・`--no-build`。
- **テスト用の しかけ（正解を 読む）**: E2E=1 で ビルドした とき（出力は **.next-e2e**。本番の .next とは べつ）だけ、問題に `data-e2e-answer / data-e2e-type`、正解の 選択肢に `data-e2e-correct`、発音に `data-e2e-say`、学校の 書きとりに `data-e2e-answer`、テストの 出題 API に `e2eAnswers` を 出す（src/lib/e2e.ts の 説明）。next.config.ts の `env` で `process.env.E2E` は ビルドの ときに "1" / "0" に 置きかわり、画面の コードは その場で `process.env.E2E === "1" ? {…} : {}` と 書くので、**ふつうの ビルドでは 属性の 名前ごと 消える**。check:e2e は さいしょに **本番の .next/static に「data-e2e」が 0 ファイル**・.next-e2e には ある ことを たしかめる。Vercel で E2E=1 なら ビルドを とめる。
- **テスト用の 時計**: scripts/e2e/clock-preload.cjs を `NODE_OPTIONS=--require` で サーバーに 入れ、`.tmp/e2e/clock.json` の offsetMs だけ サーバーの Date を すすめる（200ms ごとに 読みなおすので サーバーを とめずに「つぎの 日」へ）。アプリの コードには 入らない。ブラウザ側の 長い 再生（まとめ動画）は Playwright の clock で すすめる。
- **音と マイク**: ブラウザに にせものの speechSynthesis（すぐ おわる）と SpeechRecognition（ロボットが きめた ことばが「きこえる」）を 入れる。発音・かいわの 🎤・テストの 発音問題も ほんとうに ボタンを おして すすむ。

### しらべる こと
1. **40 ワールド**: ワールドごとに 1 レッスン（ワールドの 中の 位置を 1〜30 で ずらす: L1・L32・L63 … L900 … L1180）を、あたらしい おためし学習者で（まえの レッスンと まとめ / ボスは DB に 入れて）**先生の 授業（ぜんぶの パートを ⏭ で）→ カード → TPR → フォニックス → 学校の 書きとり → 発音（⭐⭐⭐）→ クイズ 8 問 → スピードリスニング 3 ラウンド → かいわ（1 回目は 🎤、あとは タップ）→ クリア** まで クリック。スマホ 390x844 と タブレット 1024x768 を かわりばんこ。ステップの 数・先生の パート数・クイズが ぜんぶ ⭕・かいわ コイン・クリア画面・**DB の 完了（quizScore 1）と コイン**・画面の エラー / 5xx を しらべる。
2. **タイムトラベル**: L1 を クリックで クリア → 復習クエスト check-1 は WAIT_TOMORROW（マップに 🌙・API は 403）→ L2〜5 → マップの「mini-1-5」を クリック → まとめテスト 100% → L6 が ひらく → **時計を つぎの 日に** → check-1 が AVAILABLE → マップから クリックして 合格（takenOn は つぎの 日）→ L6〜30 を DB に → マップの「boss-1-30」→ ボス 合格 → L31 → アリーナ（まえは ぜんぶ 🔒）が ひらいて ミックスを 1 周（DB に ARENA）。
3. **まとめ動画・としょかん・力だめし**: /recap/1 を さいごまで → 🪙 +5（DB も +5）、おなじ 日に もういちど さいごまで 見ても ふえない（台帳の キーは 1 つ）。おはなし s1-01 を よみきかせ → クイズ 3/3 → スタンプ ＋ コイン。力だめし ステージ1 を 1 回（聞く 10/10・読む 10/10・DB に 1 回・2 回目は うけられない）。
4. **保護者**: おためしで L1 → 新規登録 → お子さま 2 人（うみ＝リコ・そら＝キコ。DB の avatarCharacter）→ だれが あそぶ？ → うみさんに おためしの きろくを ひきつぎ（L1・コイン）→ べつの 端末で ログイン → 暗証番号（まちがいでは ひらかない）→ パスワードを 忘れた（outbox の メール → 再設定 → ほかの 端末も ログアウト・古い パスワード 401）→ 暗証番号を 忘れた → LINE の 毎月の dry-run → お子さまごとの ダウンロードページ 2 つ・レポートの PDF・ワークブックの PDF → 退会（保護者・2 人・セッションが DB から 消える・ログイン 401）。
5. **オフライン**: DB が つながらない サーバー（E2E の ビルド）で 27 画面（スタート・ログイン・登録・マップ・レッスン 1/31/1171・まとめ・テスト 3 種・ダッシュボード・ガチャ・アリーナ・ランキング・としょかん 4・力だめし・おうちの方・だれが あそぶ？ など）に エラー画面・止まった「よみこみちゅう」・pageerror・5xx が ない こと。さらに **ページを ひらいた あとで 電波を きって（Playwright の offline）** レッスン1 を さいごまで・まとめテスト mini-1-5・おはなし＋クイズ・フリートークが できる こと。スマホと タブレットの 両方。
- 失敗した ときだけ スクリーンショットを docs/run10/report/e2e-failures/ に 保存（さいごの 回は 失敗 0 なので フォルダなし）。

### 見つかって なおした もの（アプリ）
- **電波が ない ときの 学校の 書きとりが いつも「❌ ざんねん：うまく採点できなかったよ」**: /api/grade/written に とどかないと 既定の 形（WRONG）に なっていた → とどかない ときは この 端末で ルール採点（gradeLocally。サーバーの オフラインと おなじ）。お手本どおりなら ⭕ ごうかく。書きとりの 入力欄に 名前（aria-label「「～」を えいごで かく」）も つけた。
- **テストの とちゅうで 電波が なくなると、さいごの 問題を こたえても さいごの 問題に もどるだけ**（ブラウザの 採点に いる ワールドの データを まだ 読んでいなくて、Promise が 失敗した まま。おしても なにも おきない）→ ① 出題が とどいた あとで 範囲の データを 先に 読む（2 ワールド＝60 レッスンまでの テスト。1〜n の ボスなどは 大きいので 読まない）② それでも 採点できなければ「でんぱが とどかないみたい／こたえは ぜんぶ のこっているよ」と「もう一回 さいてん」（こたえを のこして 送りなおす）。
- 確認スクリプトの まわり: 使いすての DB コンテナを けした あと ポートが あくまで まつ（とちゅうで 止めた あとの 再実行で「5544 を ほかの なにかが つかっている」に なっていた）。run4 / run5 の 確認スクリプトの「だれが あそぶ？」の ボタンの さがしかたを「うみ さん」（読みあげの 名前は sr-only の まえに すきまが 入る）でも あう ように。

### ロボットの まちがいで なおした もの（アプリは 正しかった）
- 選択肢「❌ からだで X を つくって。」「❌ まちがい」を まちがいの おしらせと よみまちがえた → おしらせの `<p class="card mt-3">` だけを 見る。レッスン名「Health Quiz」を 結果の 見出しと まちがえた → 結果の カードの h2 だけ。
- ボスの テストを DB に 入れる ときに boss-1-30 じしんも 合格に していた。アリーナの ページは 「ボスを たおすと」では なく 🔒 の 一覧を 出す。ダウンロードページは お子さまごと。おためしの フリートークは Lesson 90 から（この 端末の きろくを 90 まで に して ためす）。
- **LINE の dry-run を spawnSync で 動かして いたので ロボットの イベントループが 止まり、同時に うごいている ワールドが いっせいに 時間切れ** → 非同期に。
- 重い ときに 反射クイズ（4 秒）の まえに ロボットが まにあわず、アプリの 時間切れが さきに こたえて、ロボットが おせない ボタンを まちつづけた → 1 問の やりとりを へらし、まにあわなかった ときは「ロボットが おそかった」と べつに 数える（2 問まで。レポートの メモに 出る）。同時に うごかす ワールドは 4 → 3。Next.js の リンクの 先読みが ページ移動で きれた ときの「Failed to fetch RSC payload … Falling back to browser navigation」（Next.js が じぶんで ふつうの 移動に する）は エラーに しない。電波を もどした あと 5 秒は 電波なしの ぶんと みなす。
- ブラウザの タブが クラッシュしたら その ワールドだけ 1 回 やりなおす（メモに のこす。さいごの 回は 0）。

### けっか（npm run check:e2e・さいごの 回 1371 秒）
| しらべた もの | OK | NG |
|---|---|---|
| じゅんび（本番の ビルドに しかけ なし・E2E の ビルド・時計） | 4 | 0 |
| 40 ワールド（40 レッスン ぜんぶ クリア・1 レッスン 約 35〜80 秒） | 280 | 0 |
| タイムトラベル・まとめテスト・ボス・アリーナ | 17 | 0 |
| まとめ動画・としょかん・力だめし | 7 | 0 |
| 保護者の 流れ | 23 | 0 |
| オフライン（DB 停止 27 画面 × 2・電波なし 4 × 2） | 10 | 0 |
| **ぜんぶ** | **341** | **0** |

- 1 レッスンで 先生の 授業 19〜21 パート・カード 7〜8・クイズ 8 問・スピードリスニング 12 問・かいわ 6 ターン（ぜんぶ ⭕・🪙 +15）。くわしくは docs/run10/report/e2e.md。
- なおす まえ（はじめて ぜんぶ 通した 回）は 333 OK / 7 NG（ワールド 38/40）。のこりは 上の ロボットの まちがいと、アプリの 2 つ（電波なしの 書きとり・テスト）。
- tsc OK・vitest **2,707 passed**（87 files。tests/e2e-check.test.tsx 19 件を 追加: しかけは E2E=1 の ときだけ・本番で 消える 書きかた・next.config の distDir / env / Vercel・テスト用の 時計・電波なしの 書きとり・テストの「もう一回 さいてん」と 先読み・部品とレポート）・next build OK（/lesson 200 kB・/map 195 kB / 予算 230 kB）・**本番の .next/static に「data-e2e」0**。

### 決めた こと・メモ
- テストの しかけは「NODE_ENV=test か E2E=1」の きまりに あわせ、E2E=1 の ビルド（.next-e2e）だけに した。vitest では process.env.E2E を 入れて ためす。check:e2e は 毎回 E2E の ビルド（約 2 分）を つくる（`--no-build` で つかいまわし）。
- 40 ワールドは「まえの レッスンを DB に 入れて」その ワールドの 1 レッスンを クリック。1,200 レッスン ぜんぶを クリックすると 約 17 時間 かかるので、ぜんぶの 画面は Phase 3（描画）、ぜんぶの データは Phase 2 で みている。
- ワークブック No.1 の PDF（git には 入れない）が なければ check:e2e が python で つくる（なければ メモに 書いて とばす）。
- 本番の DB（ポート 5432）には さわっていない（ほかの プロジェクトの gamblex-db）。
- 内容の メモ（なおしては いない）: TPR「Make an X」や「mistake」の 絵文字が ❌ なので、まちがいの おしらせ（❌）と ならぶと まぎらわしい かもしれない。英語・内容の 見なおし（Phase 5 など）で 🙅 などに するか きめて ほしい。

## Phase 5 フレーズブック（おなじ はたらきの 英語は 1つの 言いかたに）

### できた こと
- **docs/phrasebook.md**（`npm run phrasebook:doc` で つくる。データは scripts/lib/phrasebook.ts。`--check` で 最新か しらべる）: **23 の はたらき**（あいさつ・げんき？・なまえ・はじめまして・さようなら・ありがとう・ごめんね・ほめる・はげます・教室の 指示・まねして いってね（先生）・ききかえす（こども）・じゅんばん・さんせい / はんたい・たのむ・はい どうぞ・さそう・すすめる・いけん / りゆう・きもち・ことばの しつもん・わかったか たしかめる・スピーチの はじめと おわり）ごとに
  - **Canonical**（その ステージで いちばんに つかう 形。ステージ 1〜5 の どこにも かならず ある）
  - **Allowed variants**（べつの 形と「わざと 入れる ステージ」。はじめて 出る レッスンと ステージごとの 回数は content/ を しらべて 自動で 書く）
  - **Avoid**（つかわない 形と 理由: British・stiff・textbook-only・unnatural・babyish・rude・和製英語・文法・書きかたの 統一）
- **english:lint に ルール `phrasebook`（error）**: avoid の 形は いつでも、variant は ステージの そと（from より 前＝まだ ならって いない／to より 後＝年れいに あわない）で error。`--strict` なので check:all の english:lint が 自動で 見はる。
- **アプリの 文字も しらべる**（`npm run english:lint -- --src`。`--all` と 既定に 入る）: src/ と worksheets/ の 文字列（UI・テンプレート・ワークブックの python。コメントは のぞく）7,302 個・291 ファイル。どの ステージの 子も 見るので、avoid と「to が ある 形（Bye-bye）」を しらべる（つづりの ルールは コードの 名前で たくさん 出るので あてない）。
- **`npm run phrasebook:fix`**: fix が ある 形を 自動で なおし、**docs/run10/changes/phrasebook.md** に 1 文字列ずつ（unit・path・まえ → あと）記録。JSON は 書きなおさず、かわった 文字列だけ 置きかえる（改行・ならびは そのまま。ならびが あわなければ 止まる）。日本語の 説明（ja・～Ja）の 中の 英語も おなじように なおす。2 回目は 0 件（かわらない）。

### なおした もの（ぜんぶ で 639 文字列・258 ユニット）
| もの | ステージ | 件数 | なおしかた・理由 |
|---|---|---|---|
| 先生の さいごの「Bye-bye!」 | 3〜5 | 507 | 「See you!」（テンプレートと おなじ 先生の しめ）。キャラクターの「Bye-bye, carrot!」などは「Bye, carrot!」。8 さい までは あたたかいが、それ より 上には こどもっぽい。ステージ 1〜2 は そのまま |
| 「Me, too!」 | 1・4 | 58 | 「Me too!」（2 語の こたえは コンマなし。Nice to meet you, too. の ような 文の おわりの too は コンマあり と きめた） |
| 「Please listen to my speech.」（L239） | 1 | 29 | 「Let me tell you about my hero.」（日本の 教科書の きまり文句。L328 で ならう 文型に）。aiTask の 1 文は 8 語に おさまる ように「Start your speech! "…"」 |
| 「I'm so-so.」「So-so?」（L66） | 1 | 27 | 「I'm OK.」「Just OK?」（教科書の こたえ。ことばと しての so-so＝まあまあ・TPR「Show me so-so.」は のこした） |
| 「Here you go」 | 1 | 12 | 「Here you are」（ステージ 1 は 1つの 形。Here you go は ステージ 2 から） |
| 「Once more」 | 3・4 | 4 | 「One more time」 |
| 「Bye, bye!」 | 1 | 2 | 「Bye-bye!」（書きかたを 1つに） |
| 「No worries.」 | 2 | 2 | 「No problem.」（ステージ 1〜2 の くだけた こたえは 1つ） |
| アプリ: 先生の 動画の 字幕「(Do it with your body!)」 | 全部 | 1 | 「(Act it out!)」（からだで やってみよう の 直訳） |

- 意味と レベルは かえていない（日本語は そのまま。L66・L239 は 文の 長さ・ステージの 語数の きまりも まもる）。
- しらべた けっか（english:lint --all --strict）: **phrasebook error 620 → 0**、ぜんたい error 0 / warn 464（まえ 465）/ info 274（まえ 275）。161,841 文字列・1,635 ユニット（アプリの 文字を ふくむ）。
- いまは 0 件だが、きまりとして lint が 見はる 形: How do you do? / What is your name? / See you again! / Nice to meet you too / Brilliant! / Don't mind! / Do you understand? / In my opinion, I think / The reason is because / Pardon?（ステージ 5 から）/ I think（ステージ 2 から）/ In my opinion・I agree（3 から）/ Could I have・Would you mind（4 から）など。

### しらべた こと（数）
- tsc OK・**vitest 2,735 passed（88 files）**・next build OK（/lesson 200 kB・/map 195 kB）・`npm run check:data` 問題 0（問題 455,781）・curriculum:check / library:check 最新。
- tests/phrasebook.test.ts **28 件**: データの 形（ステージ 1〜5 に canonical・fix には re）・見つける / 見のがす（so-so の ことば・Give me five! は OK）・Bye-bye は 1〜2 だけ・まだ ならって いない 形・アプリの 文字・allowUnits・lint の error・自動の なおし（2 回 かけても おなじ・なおした あとは 0）・JSON を くずさない（CRLF・\" ・id は かえない）・src の 文字列の ぬきだし（コメント・URL・行番号）・**ぜんぶの レッスン / としょかん / 力だめし / アプリで phrasebook 0**・lint が しらべない 形も ステージの そとで つかわれて いない・docs/phrasebook.md が データと おなじ。

### 決めた こと・メモ
- 学校の テストに 出る 形（Here you are. / I'm fine, thanks. / My name is ～. / May I ～? / Shall we ～? / I'd like ～. / Pardon?）は、アメリカでも ふつうに 通じるので のこし、「わざと 入れる ステージ」を きめた（Shall we は すこし かたいので Let's を 先に）。
- 「Excuse me?」（ききかえし）・「Not at all.」（Thank you への こたえ）・「Good boy!」・「Cheer up!」・「Give me ～.」は 文脈で 正しい ことが ある（L1088 の おこった Excuse me? / L1002 の Would you mind ～? ― Not at all. / L869 の 犬 / L773 の かなしい ともだち / Give me five!）ので、ドキュメントだけ（lint は しない）。
- run9 で「わざと」と きめた warn（stiff-phrase 13 など）は さわって いない。
- vitest の とちゅうで「Timeout calling onTaskUpdate」（tests/data-check.test.ts の 1 つの テストが いそがしい とき 60 秒 イベントループを とめていた。ひとつで 19 秒・ぜんぶ いっしょだと 62 秒）→ runDataChecks の セクションの あいだで イベントループに もどす ように した（scripts/lib/dataCheck.ts）。その あと 2 回 とおった。1 回だけ Windows の 一時ファイルの エラー（UNKNOWN: open …\Temp\…\ssr\…・tests/phonics-w25）が 出たが、やりなおしで 出なかった（テストの 中身では ない）。
- Phase 4 の メモ（TPR の ❌ 絵文字）は 英語の きまりでは ないので この フェーズでは かえていない。

## Phase 5 の あと: check:all を ぜんぶ 通しで（2026-11-28）

### けっか（npm run check:all・48 分 02 秒・終了コード 0）
| ステップ | けっか | 数 | 時間 |
|---|---|---|---|
| english:lint（ぜんぶ） | PASS | 161,841 文字列 / 1,635 ユニット・error 0 warn 464 info 274 | 8s |
| tsc | PASS | error 0 | 8s |
| vitest | PASS | 2,735 passed / 2,735（88 files） | 1m15s |
| next build | PASS | 81 routes | 1m31s |
| データの 確認（Phase 2） | PASS | レッスン 1,200・テスト 2,719・問題 455,781・問題の ある データ 0 | 1m21s |
| 画面の 描画（Phase 3） | PASS | 描画 333,549・問題 0 | 5m14s |
| DB 停止の スモーク | PASS | 125 OK / 0 NG | 6m48s |
| E2E（本物の DB・Phase 4） | PASS | ワールド 40/40・341 OK / 0 NG | 23m23s |
| アクセシビリティ（axe） | PASS | 26 画面・critical/serious 0・moderate/minor 0 | 1m56s |
| 内部リンク | PASS | 4,123 URL（画面 27）・broken 0 | 6m16s |
| JS の 大きさ | PASS | /map 195・/lesson 200 kB（予算 230 kB） | 2s |

- 失敗は 0 件。なおす ものが なかったので、コードと テストは かえていない（レポート docs/run10/report/*.md だけ 更新）。
- 描画の 数が 333,550 → 333,549（先生の 授業 98,100 → 98,099）に へった わけを しらべた: Phase 5 の 前と 後で 1,200 レッスンの 先生の セグメントの「声の 区切り（units）」を くらべると、かわったのは L694・L769・L803・L1005 だけ。L769 の セグメント 5「Exit. Go off the stage. Bye-bye! Exit!」→「… Bye! Exit!」で 短い 文が 1 つの 区切りに まとまり、units が 2 → 1 に なったため「話す（さいごの 文）」の 画面が 1 つ へった。ことばの なおしに よる 正しい へりかたで、バグでは ない。
- 本番の DB（ポート 5432）には さわっていない。

## run10 さいごの 通し: check:all もう一回（2026-11-28）

### けっか（npm run check:all・47 分 45 秒・終了コード 0）
| ステップ | けっか | 数 | 時間 |
|---|---|---|---|
| english:lint（ぜんぶ） | PASS | 161,841 文字列 / 1,635 ユニット・error 0 warn 464 info 274 | 9s |
| tsc | PASS | error 0 | 9s |
| vitest | PASS | 2,735 passed / 2,735（88 files） | 1m16s |
| next build | PASS | 81 routes | 1m27s |
| データの 確認（Phase 2） | PASS | レッスン 1,200・テスト 2,719・問題 455,781・おはなし 100・力だめし 5・問題の ある データ 0 | 1m19s |
| 画面の 描画（Phase 3） | PASS | 描画 333,549・問題 0 | 5m28s |
| DB 停止の スモーク | PASS | 125 OK / 0 NG | 6m49s |
| E2E（本物の DB・Phase 4） | PASS | ワールド 40/40・341 OK / 0 NG | 22m45s |
| アクセシビリティ（axe） | PASS | 26 画面・critical/serious 0・moderate/minor 0 | 1m58s |
| 内部リンク | PASS | 4,125 URL（画面 27）・broken 0・crawl errors 0 | 6m22s |
| JS の 大きさ | PASS | /map 195・/lesson 200 kB（予算 230 kB） | 1s |

- 失敗は 0 件。なおす ものが なかったので コードと テストは かえていない（レポート docs/run10/report/*.md だけ 更新）。tsc・vitest・next build は この 通しの 中で PASS（コードは 前の コミット b86f8a8 と おなじ）。
- 内部リンクが 4,123 → 4,125: ブラウザで 画面から 見つけた URL が 60 → 62 に ふえた ため（ルート ぜんぶの 数は おなじ）。画面に 出る リンクは 日づけや DB の 状態で かわる ので その ぶん と みている。こわれた URL は 0 の まま。
- 本番の DB（ポート 5432）には さわっていない。

## run10 さいごの 通し（3 回目）: check:all（2026-11-28）

### けっか（npm run check:all・48 分 10 秒・終了コード 0）
| ステップ | けっか | 数 | 時間 |
|---|---|---|---|
| english:lint（ぜんぶ） | PASS | 161,841 文字列 / 1,635 ユニット・error 0 warn 464 info 274 | 10s |
| tsc | PASS | error 0 | 11s |
| vitest | PASS | 2,735 passed / 2,735（88 files） | 1m15s |
| next build | PASS | 81 routes | 1m30s |
| データの 確認（Phase 2） | PASS | レッスン 1,200・テスト 2,719・問題 455,781・おはなし 100・力だめし 5・問題の ある データ 0 | 1m26s |
| 画面の 描画（Phase 3） | PASS | 描画 333,549・問題 0 | 5m15s |
| DB 停止の スモーク | PASS | 125 OK / 0 NG | 6m59s |
| E2E（本物の DB・Phase 4） | PASS | ワールド 40/40・341 OK / 0 NG | 22m53s |
| アクセシビリティ（axe） | PASS | 26 画面・critical/serious 0・moderate/minor 0 | 1m59s |
| 内部リンク | PASS | 4,122 URL（画面 27）・broken 0・crawl errors 0 | 6m30s |
| JS の 大きさ | PASS | /map 195・/lesson 200 kB（予算 230 kB） | 2s |

- 失敗は 0 件。なおす ものが なかったので コードと テストは かえていない（レポート docs/run10/report/*.md だけ 更新）。tsc・vitest・next build は この 通しの 中で PASS。
- 内部リンクが 4,125 → 4,122: 画面から 見つけた URL の 数が 日づけや DB の 状態（E2E の あとの データ）で かわる ため。こわれた URL は 0 の まま。
- 本番の DB（ポート 5432）には さわっていない。
