# Run 9 progress

## Phase 1: スタイルガイド・英語チェック・「この英語、へん？」ボタン（2026-11-27）

### つくった もの
1. **docs/english-style-guide.md**（英語の きまり・日本語メモつき）
   - アメリカ英語・こども向けの 話しかた・ステージごとの 1文の 最大語数（ステージ1=8／2=12／3=15／4=18／5=22）と 語彙の めやす
   - 短縮形の つかいかた、教室で ほんとうに いう 英語（Please ～ を さける・Let's は 1レッスン 3回くらい）
   - さける 表現の 表（I'm fine, thank you. And you? / I very like / Let's enjoy! / Let's challenge! / Thank you for your hard work など）、和製英語、UK→US の つづりと ことば、文法の くせ（冠詞・数えられない名詞・時の前置詞）
   - 句読点と 大文字（ASCII だけ・`Ms. Emma`・`OK`・`T-shirt`・`email`・`～` は 文の型の 欄だけ）
   - エマ先生の 話しかた（ほめことばの バリエーション・まちがえた ときの 声かけ）、日本語がわの きまり、lint の ルール一覧（§11）
2. **npm run english:lint**（scripts/english-lint.ts ＋ scripts/lib/englishLint.ts・englishRules.ts）
   - `-- --from N --to M`（レッスン）、`--library`（としょかん。はんいを つけると その はんいで 解放される もの）、`--yearly`（力だめし）、引数なしで ぜんぶ。`--strict` で error が あれば 終了コード 1
   - cspell（en-US、devDependency）で つづり。ネットワークなしで うごく（約10秒で 15万 文字列）
   - しらべる こと: つづり・UK つづり/ことば・和製英語・かたい 表現・文法の くせ・a/an・Please ～・Let's の かず・短縮形・ステージごとの 文の 長さ・ASCII 句読点・文頭の 大文字・名前の まちがい・きまった 書きかた・となりの 重複・1〜2文字 ちがいの 行・はんい全体の 書きかたの ゆれ
   - 結果は docs/run9/lint/<range>.md（例: `all.md`、`L1-30+library.md`）
   - 単語リスト scripts/english-words.txt: `[names]`（登場人物・場所。小文字や 1文字 ちがいを name エラーに）、`[words]`（日本語由来の ことば・あいさつ・音まね・辞書に ない 正しい 英語）、`[intentional]`（先生の 台本・字幕・スライドで だけ ゆるす「goed」「meechu」「Rab, bit」の ような 教えるための 形）、`[allow]`（ユニットごとに ゆるす もの。例: `L1178 goed eated`）
3. **「この英語、へん？」ボタン**
   - レッスンの 各ステップの 下（`step:<種類>:<番号>`）、エマ先生の 字幕の 下（`teacher:<番号>:<種類>`＋その ときの 英語字幕）、としょかんの おはなし・チャンツ（さいごに よんだ 行も 送る）・フリートーク
   - おすと ひとこと（200字まで・かかなくても OK）を 書いて「おくる」。POST /api/english-report → DB の EnglishReport（migration 20261204090000_english_report）
   - DB が 止まっている・オフライン・5xx・429 → 端末の localStorage に のこし、つぎに ボタンの ある 画面を ひらいた とき・online に もどった とき・5分ごとに 送りなおす（おなじ clientId なので 2重に ならない。400/403 は すてる。50件・30日・20回まで）
   - 学習者は あたらしく つくらない（create:false）。IP ごとに 10分 30件まで。保護者ページには なにも 出さない
   - 運営用: `npm run english:reports`（`--from/--to`・`--since`・`--status open|fixed|wontfix|all`・`--json`・`--mark <id> fixed`）。先生の 字幕の 報告は いまの 字幕も ならべる
4. テスト: tests/english-lint.test.ts（21件）、tests/english-report.test.ts（14件）、tests/english-report-button.test.tsx（1件）

### いまの 数（npm run english:lint ぜんぶ = docs/run9/lint/all.md）
- 15万4,505 文字列・1,344 ユニット → **error 74 / warn 1,258 / info 306**
- error の なかみ: uk-spelling 71（ほぼ ぜんぶ W34 の「イギリスの ことば と アメリカの ことば」の レッスン L1014〜1018。わざと くらべて いる ので ブロックの レビューで 決める）、grammar-habit 2（L0757「I'm exciting, too!」= excited/exciting の レッスンの セリフ）、spelling 1（L0977 の「osahashimo」。日本の ひなんの 合言葉は ふつう「おはしも／おかしも」なので まちがいの 可能性が 高い）
- warn の おもな もの: Okay → OK 456（先生の 台本）、「…」→「...」 258、UK ことば 271（timetable・autumn・summer holidays・sweets など）、文が ながい 122、かたい 表現 55（I'm fine, thank you. / And you? / Please enjoy! など）、書きかたの ゆれ 21（me too / me, too・thumbs-up / thumbs up など）
- レッスン 1〜30＋としょかん（解放 0〜30）: error 0 / warn 19 / info 2

### きめた こと
- 「OK」を 正しい 形に した。「Okay」は まちがい では ないので warn（そろえる ための しるし）。小文字の「ok」は error
- 先生の 台本（say・teacherScript・字幕・スライド）は「音節に わけて よむ」「わざと まちがえた 形を くらべる」が 多いので、となりと つなげて 正しい ことばに なる かけら・同じ 文の ことばの 一部は つづりの エラーに しない。文法の くせも そこでは warn（「one bread, two breads とは いわない」の ような 説明）
- 「very, very」は 読み聞かせでは ふつうなので info。「very very」（読点なし）と 3回 いじょうは warn
- Please ～ は「Please call me ～」「Please help me!」の ような ふつうの 言いかたは のぞき、教室の めいれい（sit / listen / repeat …）だけ。先生の 字幕・TPR は warn、会話は info
- 冠詞の あとに 名詞が つづく（a snow festival / a bread shop / at the morning assembly）は 正しいので 数えない。「A is a letter」「C, A and T」の 文字の A も のぞく
- 単語リストに たした ことばは ぜんぶ 本文で つかいかたを 見て たしかめた（osahashimo は たさず エラーの まま のこした）
- EnglishReport の userId は 外部キーに しない（おためし学習者の そうじで 消えても 報告は のこす）

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK

## REVIEW: ワールド1・2（レッスン 1〜60）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）を 60 レッスン ぜんぶ 見なおした
- 10 レッスンずつ 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ なおし、なおしかたは いちばん 小さく
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）に して、before が いまの 値と あう ときだけ あてた（はずれ 0）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W01-02.md**
- 60 レッスンに `"reviewed": "run9"` を つけた（LessonDef に reviewed?: string を 追加）

### 数
- lint（`npm run english:lint -- --from 1 --to 60`）: **まえ error 0 / warn 25 / info 5 → あと error 0 / warn 0 / info 5**（のこりの info は Let's の かず。レッスンの ねらいの 表現なので のこす）
- なおした 欄 **128**（レビュアー 48・共通の 機械的な なおし 80）、なおした レッスン **53 / 60**
- 学習項目 ID が かわった もの 2つ: L3「I'm fine, thank you.」→「I'm fine, thanks.」、L23「Hug.」→「Hug yourself.」（この 2項目だけ 記録が あたらしく なる。ほかの ことば・表現・TPR の 英語は かえて いない）

### before → after の 例
1. L3 会話（A・B・C）: 「I'm fine, thank you. How are you?」→「I'm fine, thanks. How are you?」（教科書の 決まり文句を 自然に。fine は のこす。スライド・字幕・まとめも あわせた）
2. L46 さいごの 英語字幕（objective）: 「Welcome home! Talk with Riko next. Bye-bye!」→「This is my room. Talk with Riko next. Bye-bye!」（Welcome home は かえって きた 人に いう ことばで いみが ちがう）
3. L1 などの クイズ字幕（objective・40 か所）: 「Nice to meet you. or Go!?」→「Nice to meet you. / Go!」（文末の 記号が 2つ ならんで いた）

### きめた こと
- 2択クイズの 英語字幕は「A / B」の 形に そろえた（ほかの 字幕と おなじ）
- 日本語の なかの 英語: 「Yes, I do.！」の 2重の 文末記号は 英語がわだけ のこす。「windy.かぜ」の ように すきまの ない ところに スペース（TTS が つなげて よまない ように）
- イギリスの ほめことば「Brilliant!」（L59）→「Awesome!」、「Great moving today!」（L11）→「You moved a lot today!」など、不自然な さいごの ひとことを なおした
- 日本語の まちがい（L6 で 会話と ちがう 人の なまえ、L8「てを みて」→「かたてを みて」、L36 chocolate の カナ「チョクレット」など）も なおした
- のこした こと: L27 の クイズの スライドに こたえが 見えている（選択肢の「Your turn.」が L27 の ことばに なく スライドの 検証に とおらない）。1人だけの 指摘（店員の「What do you want?」など）は のこした

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
