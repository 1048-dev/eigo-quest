# Run 11 progress

## 決定 1: 作業フォルダの かたづけ（2026-11-28）

- git に 入って いた 一時作業フォルダは run9 の `.run9-w56`〜`.run9-w3940` の 18 こ（840 ファイル）だけ だった。`.run10-*` など ほかの 一時フォルダは git に 入って いなかった（`.tmp/`・`.tmp-run3/`・`tmp-teacher/` は もともと .gitignore 済み）
- 消す まえに 情報が docs に あるか たしかめた: 各フォルダの 変更表 `table.md` の 行数と `docs/run9/changes/WXX-YY.md` の 表の 行数が 18 ペア ぜんぶ 一致（例: W05-06 445 行 / W39-40 574 行）。W01-04 は もともと 作業フォルダが なく docs に だけ ある。のこりの パッチ JSON・スクリプト・メモは 作業用で、結果は すでに コンテンツと 変更表に 入って いる
- `git rm -r --cached` で git から はずした（ディスクの フォルダは のこして ある。docs は 1 つも 消して いない）
- .gitignore に `.run9-*/`・`.run10-*/`・`.run11-*/`・`.run[0-9]*-*/` を 追加（これからの 作業フォルダも 入らない）
- 注意: docs/run9/changes の 一部（W17-18〜W31-32）と docs/run9/lint に `.run9-wXXXX/...` への 言及が のこる。新しく clone した 場所には その ファイルは ないが、記録 として そのまま に した
- tsc OK・vitest 2,735 passed・next build OK

## 決定 2: TPR の バツ絵文字を わかりやすく（2026-11-28）

- しらべた: 教材（content/curriculum/worlds）の emoji 欄で ❌ は 16 ワールド・34 か所（TPR 7・単語 14・スライド 13）。✖ ✗ ✕ ❎ は 教材に なし
- 置きかえ（ルール）:
  - TPR「Make an X」「Cross your arms」など うでで バツを する もの → 🙅（うでを クロスする 人。もとから 🙅 の TPR と そろう）
  - 単語 mistake（8 こ）→ 🤦（「しまった」。W16 L22 の mistake は もとから 😅 で そのまま）
  - 単語 wrong・false・impossible → 🙅。ただし 同じ レッスンに 🙅 の TPR（Shake your head など）が あって 絵の 選択肢が かぶる 3 こは べつの 絵に した: W04 L12 wrong → 👎、W27 L26 false → 👎、W24 L23 impossible → 🤯
  - 先生スライドの 絵（Words・「まる？ バツ？」）は その レッスンの 単語と 同じ 絵に した
- そのまま に した もの:
  - アプリ画面の ❌（LessonSteps の「❌ ざんねん」「❌ 説明」、StoryQuiz、TestRunner）は まちがいの しるし なので のこした
  - scripts・prisma/seed の ✖ ✗ は チェックの ログ表示（失敗の しるし）なので のこした
  - 🚫（never・nobody・taken など「〜ない」）は バツ印 ではなく 禁止マーク なので のこした
  - docs の 過去の 記録は さわって いない
- これから もどらない ように tests/emoji-marks.test.ts を 追加: 教材の emoji 欄に ❌ ❎ ✖ ✗ ✘ ✕ ╳ が ない こと・「Make an X / Cross your arms」の TPR は 🙅・mistake は 🤦（または 😅）
- 気づいた こと（今回は 未対応）: W25 L22 の 単語 can't be と TPR Shake your head. No, no, no! が もとから どちらも 🙅（data-check は 問題 0）
- check:data 問題 0・tsc OK・vitest 2,739 passed（+4）・next build OK

## 決定 3: のこりの つづりの ゆれを アメリカで ふつうの 形に（2026-11-28）

- しらべた（content/ ぜんぶ。docs の 過去の 記録は のぞく）:
  - **me too**: ひとことの へんじ「Me, too」は もう 0 こ（run10 の フレーズブックで そろえ済み。lint の ゆれ表からも きえた）。のこる「Can you show me, too?」（L814）・「you and me, too!」（L274）・「listen to me, too.」（L1167）は 文の さいごの too で、ハウススタイル（Can I come, too? / Nice to meet you, too.）どおり コンマを のこした
  - **seatbelt → seat belt**: W34 の L995・L996（ことば・TPR・会話・teacherScript・スライド・字幕）18 か所
  - **tug of war → tug-of-war**: W11 L302（ことば・TPR・表現・スライド）25 か所、W12 L349 10 か所
  - **lunch time → lunchtime**: W2 L37（会話・aiTask の starter・スライド）5 か所、W5 L137・L140（表現・目標・スライド・会話の 目標文）21 か所、W6 L156・L177（ことば・スライド）12 か所。breakfast time・bath time・dinner time は 2 語の まま
  - 合計 91 か所（6 ファイル）。大文字（Seatbelt・Tug of war・Lunch time）も そろえた。日本語の 字幕の 中の 英語（「tug-of-war は つなひき」）も 同じ
- **学習項目 ID が かわった もの 5 つ**: L137 表現「It's lunchtime.」、L140 表現「It's lunchtime in Tokyo.」、L177 ことば `L177-W-lunchtime`、L996 ことば `L996-W-seat-belt`・TPR `L996-C-fasten-your-seat-belt-click`（この 5 項目だけ 記録が あたらしく なる）。tug-of-war は スラッグが もとと 同じ（`tug-of-war`）なので L302・L349 の ID は かわらない
- テスト・src・タイトル・としょかん・力だめしには もとの 形が なかったので 変更 なし（会話の 目標文・スライド・まとめは レッスンの JSON の 中で いっしょに なおした）
- これから もどらない ように:
  - フレーズブック（scripts/lib/phrasebook.ts）に「spelling」を 追加。seatbelt・tug of war・lunch time を avoid（consistency）に して、lint は error、`npm run phrasebook:fix` で 自動で なおせる。docs/phrasebook.md を つくりなおした（23 → 24 functions。doc が 最新か の テスト OK）
  - scripts/english-words.txt から「seatbelts」を はずした
  - docs/english-style-guide.md §9 の 表に Me too・seat belt・tug-of-war・lunchtime を 追加
  - tests/spelling-unify.test.ts を 追加（content/ に もとの 形が ない・ID が あたらしい つづり・lint と fix が つかまえて 2 回 かけても おなじ）
- english:lint error 0（ゆれ表の「tug of war / tug-of-war」も きえた）・check:data 問題 0

## 決定 4: L1011〜1018（UK と US の くらべっこ）は そのまま（2026-11-28）

- 決定 3 の 置きかえは L1011〜1018 に 1 か所も かからなかった（W34 で かえたのは L995・L996 だけ）。colour・centre・theatre・favourite などの UK の つづりも のこした
- tests/spelling-unify.test.ts に「L1011〜1018 の 8 レッスンに colour・centre・theatre・favourite が のこって いる」テストを 追加（そろえる 作業で うっかり 消さない ため）
- tsc OK・vitest 2,745 passed（+6）・next build OK

## さいごの 確認: npm run check:all（ぜんぶ・E2E こみ）（2026-11-28）

- コミット 45dcf96（決定 1〜4 の あと）で `npm run check:all` を 1 回 通した。けっか: **11 PASS / 0 FAIL / 0 SKIP**・ぜんぶで **49 分 28 秒**・終了コード 0

| # | ステップ | けっか | 数 | 時間 |
|---|---|---|---|---|
| 1 | english:lint（ぜんぶ・`--strict`） | ✅ PASS | 161,841 文字列 / 1,635 ユニット・error 0・warn 462・info 274 | 8s |
| 2 | tsc | ✅ PASS | error 0 | 8s |
| 3 | vitest | ✅ PASS | 2,745 / 2,745 passed（90 ファイル） | 1m13s |
| 4 | next build | ✅ PASS | 81 ルート | 1m24s |
| 5 | データの 確認（check:data） | ✅ PASS | レッスン 1,200・テスト 2,719・問題 455,781・おはなし 100・力だめし 5・問題 0 | 1m21s |
| 6 | 画面の 描画（check:render） | ✅ PASS | 描画 333,549 画面・問題 0 | 5m43s |
| 7 | DB 停止の スモーク | ✅ PASS | 125 OK / 0 NG | 7m20s |
| 8 | E2E（本物の DB・ポート 5544） | ✅ PASS | ワールド 40/40・チェック 341 OK / 0 NG | 21m57s |
| 9 | アクセシビリティ（axe） | ✅ PASS | 26 ページ・critical/serious 0・moderate/minor 0 | 1m52s |
| 10 | 内部リンク | ✅ PASS | 4,125 URL（画面 27）・リンク切れ 0・クロール エラー 0 | 8m19s |
| 11 | JS の 大きさ | ✅ PASS | /map 195/230 kB・/lesson 200/230 kB | 2s |

- 失敗が 1 つも なかったので、なおした コードも 新しい テストも なし（run11 の 決定 2・3・4 で 追加した テストは すでに vitest に ふくまれて いる）
- lint の warn が run10 の 464 → 462 に へった（決定 3 で ゆれ表の「tug of war / tug-of-war」などが きえた ため）
- vitest の ファイル数 88 → 90（tests/emoji-marks.test.ts・tests/spelling-unify.test.ts）
- 本番の DB（ポート 5432）には さわって いない。確認用 DB は ポート 5544 の 使いすて
- レポートは docs/run10/report/（latest.md ほか）を 今回の けっかで 上書きした

## 朝の まとめ: docs/run11/MORNING.md（2026-11-28）

- オーナー向けに 短い まとめを 書いた: 決定 1〜4 で かわった こと と 数（18 フォルダ・840 ファイル／34 か所／91 か所・ID 5 つ／L1011〜1018 は そのまま）、さいごの check:all の 表（11 PASS / 0 FAIL / 0 SKIP・49 分 28 秒）、のこって いる こと
- のこって いる こと として 書いた もの: W25 L22 の 🙅 の かぶり（未対応）、docs/run9 に のこる `.run9-wXXXX/` への 言及、レポートの 場所が docs/run10/report の まま、ワークブック PDF の 作りなおし（`npm run worksheets` → `npm run worksheets:upload`）、実機・本物の 音声・ネイティブの 読みあわせ
- docs だけの 変更。tsc OK・vitest 2,745 passed（90 ファイル）・next build OK
