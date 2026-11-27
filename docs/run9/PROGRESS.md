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

## REVIEW: ワールド3・4（レッスン 61〜120）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（クイズ字幕・2重の 文末記号）と ブロックの きめごと（L62・L87・L88）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、1つの グループだけが なおした 形（「? Or, X?」の コンマ、イギリスふうの ほめことば）を ブロック全体で おなじ きめかたに そろえた
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W03-04.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 61 --to 120`）: **まえ error 0 / warn 23 / info 9 → あと error 0 / warn 0 / info 9**（のこりの info は Let's の かず 3 レッスンと、よみきかせの「Very, very」6 か所。どちらも ガイドで OK）
- なおした 欄 **294**（機械的な なおし 115・ブロックの きめごと 34・レビュアー 104・あとの そろえ 46。重なり あり）、なおした レッスン **53 / 60**
- 学習項目 ID が かわった もの 2つ: L62「I'm Kiko. And you?」→「I'm Kiko. How about you?」、L88「Give a thumbs up.」→「Give a thumbs-up.」（この 2項目だけ 記録が あたらしく なる）

### before → after の 例
1. L62 表現・会話（A・C＋lint）: 「I'm Kiko. And you?」→「I'm Kiko. How about you?」（教科書の「And you?」を こどもが ほんとうに いう 形に。文型・スライド・字幕・teacherScript・まとめも あわせた）
2. L74 あいさつ（objective・A・B）: 「Are you strong at janken?」→「Are you good at rock, paper, scissors?」（「とくい」の 直訳を なおし、レッスンで ならう 英語の よびかたに。さいごの ひとことも おなじに）
3. L97 日本語の 説明（objective・B）: 「かどが 4つ、ぜんぶ おなじ ながさ だよ」→「かどが 4つ、へんの ながさも ぜんぶ おなじ だよ」（square の 説明で「かど」と「へん」が まちがって いた）

### きめた こと
- 日本語字幕の 2択「Thank you.？ What do you want?？」も 英語字幕と おなじ「A / B」に。話しことばの 2択は「A? Or B?」（Or の あとに コンマなし）
- クイズの こたえで 質問を くりかえす ときは「!」ではなく「?」（「Are you a pig!」は からかって いる ように きこえる）
- 「Brilliant!」「Lovely job!」は イギリスふうなので、W01-02 の L59 と おなじく アメリカの ほめことばに（ならびで おなじに ならない ように えらんだ）
- のこした こと: L116 の「hotdog」（アメリカの ふつうの 書きかたは hot dog。合成語の フォニックスの ことばで ID なので のこした）。1人だけの 指摘（L99「Hold the card with two hands.」など）は のこした。ワールド5 いこうの「And you?」「thumbs up」は それぞれの ブロックで なおす

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK

## REVIEW: ワールド5・6（レッスン 121〜180）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（2重の 文末記号・クイズの 2択の 字幕と 話しことば）と ブロックの きめごと（L133 thumbs-up・イギリスふうの ほめことば・くりかえす 質問の「?」）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た もの（Ding-dong・showtime・「やあ、みんな！」）を ブロック全体で そろえた
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。グループごとに スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい（40〜70%）も たしかめた。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W05-06.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 121 --to 180`）: **まえ error 0 / warn 3 / info 10 → あと error 0 / warn 0 / info 9**（のこりの info は Let's の かず 9 レッスン。ねらいの 表現なので のこす）
- なおした 欄 **434**（パッチ 445 件: 機械的な なおし 155・ブロックの きめごと 13・レビュアー 252・あとの そろえ 25。重なり あり）、なおした レッスン **59 / 60**（L130 だけ 変更なし）
- 学習項目 ID が かわった もの 5つ: L133 TPR「Give a thumbs up.」→「Give a thumbs-up.」、L147 TPR「Take a rest.」→「Take a break.」、L149 TPR「Pack your pencil case.」→「Put your pencil case in your bag.」、L166 フォニックス「tube」→「huge」、L175 表現「Once upon a time, I'm a little cat.」→「Once upon a time... I'm a little cat.」（この 5項目だけ 記録が あたらしく なる）
- L145 の タイトル「Stationery Swap」→「Sharing School Supplies」（titles.json・curriculum-plan.md も）

### before → after の 例
1. L168 会話（A・B・C）: 「I go to school by... flying! Bye!」→「Me? I fly to school! Bye!」（by の あとに 動詞の ing は こない。会話・スライド・字幕・クイズも あわせた）
2. L166 フォニックス（objective・B）: 「tube」→「huge」（アメリカの 発音では tube は「トゥーブ」で、u_e の「ユー」の なかまに ならない）
3. L148 先生の 日本語（objective・B）: 「ようびの あとには s」→「「どようびが すき」は おわりに s を つけて」（おなじ レッスンの It's Thursday. には s が つかないので、まちがった きまりを 教えて いた）

### きめた こと
- 話しことばの 2択「Yes, I do. or No, I don't.」は「Yes, I do. Or no, I don't.」、「A? Or, B?」は「A? Or b?」（Or の あとに コンマなし・文の なかで 大文字に しない。I・P.E.・名前は のぞく）。英語字幕の「A. or B.」は「A / B」
- 「Ding, dong!」は「Ding-dong!」に そろえた（ワールド9 いこうにも ある。それぞれの ブロックで なおす）
- L156「Lunch at the Café」は アメリカでも ふつうの つづりなので のこした（グループの 案を とりけし）
- のこした こと: 「lunch time」（辞書は lunchtime。ID で ほかの ワールドにも ある）、L157「jelly」「pudding」、「small letter」、L164「teachers' room」、フォニックスの 音の わけかた（St, a, mp）、ワールド1・34 の /ɒ/。どれも 全体で 決める（くわしくは W05-06.md）

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK

## REVIEW: ワールド7・8（レッスン 181〜240）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・testPoints を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（2重の 文末記号・クイズの 2択）と ブロックの きめごと（timetable → schedule・L239 football → cookbook・thumbs-up・イギリスふうの ほめことば・showtime・「やあ、みんな！」）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た もの（文の なかの「Now, Point …」の 大文字・L188 の titleJa）を ブロック全体で そろえた
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあいも たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W07-08.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 181 --to 240`）: **まえ error 0 / warn 70 / info 12 → あと error 0 / warn 5 / info 9**（まえの warn は timetable 63・文が ながい 6・thumbs up の ゆれ 1。のこりの warn 5 は L232・L235 の but の 文〈10 語〉。but で 2つを つなぐ ことが ねらいなので のこす）
- なおした 欄 **501**（パッチ 526 件: 機械的な なおし 56・ブロックの きめごと 107・レビュアー 252・あとの そろえ 111。重なり あり）＋ L239 の `phonics.sounds` に「/ʊ/」を たした。なおした レッスン **58 / 60**（L201・L202 だけ 変更なし）
- 学習項目 ID が かわった もの 9つ: L188 TPR「First, raise your hand.」など 3つ →「First in line, …」、L192 ことば「timetable」→「schedule」、L195 表現「This is my dream timetable.」・TPR「Show your timetable.」→ schedule、L200・L209 TPR「Give a thumbs up.」→「Give a thumbs-up.」、L239 フォニックス「football」→「cookbook」（この 9項目だけ 記録が あたらしく なる）
- L195 の タイトル「My Dream Timetable」→「My Dream Schedule」、L188 の titleJa「1にち、2にち、3にち」→「ついたち、ふつか、みっか」（titles.json・curriculum-plan.md も）

### before → after の 例
1. L188 TPR（A・B）: 「First, raise your hand.」→「First in line, raise your hand.」（英語の「First, ～」は「まず ～」で、「1ばんめの ひと」の いみに ならない。スライド・字幕・スピード チャレンジも あわせた）
2. L214 会話（A・B・C）: 「Next to the park, between the park and the bookstore. Got it!」→「Between the park and the bookstore. Got it!」（2つの こたえを くっつけた 10 語の 文。日本語も「こうえんと ほんやの あいだ。わかった！」に）
3. L236・L238 フォニックス（objective）: 「Or a short u, like foot.」「Wood says a short u.」→「a short oo」（foot・wood の oo を「みじかい u」と 説明して いた（L211〜220 と おなじ よびかた。まちがった きまりを 教えて いた）

### きめた こと
- timetable は schedule に そろえた（ワールド15・24・28・34・35・39 にも ある。34 の イギリス英語・アメリカ英語の 回は わざと のこす もの。ほかは それぞれの ブロックで なおす）
- 文の なかの「Now, Point to ～.」は「Now, point to ～.」（TPR の 項目と スライドは 大文字の まま）。ワールド9 いこうにも たくさん あるので それぞれの ブロックで おなじ きまりで なおす
- L217「And you, Ms. Emma?」は レストランで 順番に きく ときの ふつうの 言いかたなので のこした
- のこした こと: 「Grade 5 show」（アメリカでは fifth-grade show。ワールド4・7〜11 に 37 か所・ID）、クイズの「A, or B?」の コンマ、フォニックスの 音の わけかたを TTS が 文字で よむ おそれ。どれも 全体で 決める（くわしくは W07-08.md）

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK

## REVIEW: ワールド11・12（レッスン 301〜360）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・testPoints を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（2重の 文末記号・クイズの 2択）と ブロックの きめごと（L349 autumn → fall / August・thumbs-up・イギリスふうの ほめことば・Ding-dong・「Now, / Then, / Next,」の あとの 小文字・「やあ、みんな！」・「つぎは」）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た もの（ゴールや まとめが「with Thank you for.」の ように ことばの とちゅうで おわる 文。L321・L322・L342）を そろえた
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあいも たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W11-12.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 301 --to 360`）: **まえ error 0 / warn 38 / info 14 → あと error 0 / warn 18 / info 13**（まえの warn は autumn 16・文が ながい 21・thumbs up の ゆれ 1。のこりの warn 18 は 小6 の 会話・aiTask の 9〜11 語の 文〈when・because・in junior high school を つなぐ ことが ねらい〉なので のこす。info は 文型の ふくしゅうの「I am」「What is」）
- なおした 欄 **609**（パッチ 633 件: 機械的な なおし 44・ブロックの きめごと 285・レビュアー 298・あとの そろえ 6。重なり あり）、なおした レッスン **60 / 60**
- 学習項目 ID が かわった もの 5つ: L319 ことば「senior student」→「older student」、L325 表現「We could do our best because you helped us.」→「We did our best because you helped us.」、L334 TPR「Give a thumbs up.」→「Give a thumbs-up.」、L349 表現「We had a big stage show in autumn.」→「We had a stage show in the fall.」・フォニックス「autumn」→「August」（この 5項目だけ 記録が あたらしく なる）

### before → after の 例
1. L314 クイズ（A・B）: 「Riko is even more tall.」「Taller means more tall.」→「Riko is tall, tall, tall!」「Riko is taller than Haru.」（more tall は こどもが よく する まちがいで、それを 先生が 見本に して いた）
2. L319 ことば（A・B）: 「senior student」→「older student」（せんぱい の 直訳。アメリカでは senior は 高校3年生。説明も「A big kid in your club.」に して、スライド・会話・字幕も あわせた）
3. L308 サイトワード（B・C）: 「A I, but not ay. Just a short e. Said. Say is say, but said is said!」→「It looks like say. But it has a short e sound. Said. Say, said. Hear the difference?」（TTS が「A I」を「AI」と よみ、「Say is say, but said is said!」は ぐるぐるで ちがいを 教えて いなかった）

### きめた こと
- 「Now, Walk slowly.」の 小文字の きまりを「Then, / Next, / First,」にも あてた（ワールド13 いこうにも ある。それぞれの ブロックで おなじ きまりで なおす）
- autumn は 会話では fall、フォニックスでは おなじ au の August（phonicsButtons.ts と おなじ）。音読の 文も 8がつに あう 文に した
- のこした こと: 小6 の ながい 会話文、「Grade 6 show」、ねらいの 文型の「I could ～」、日本の 学校の ことば（sports day・music festival・teachers' room・message board・lunch room）、フォニックスの 音の わけかたを TTS が よむ おそれ、L346・L350 の「the sea」。どれも 全体で 決める（くわしくは W11-12.md）
- ほかの ワールドで みつけた もの: world-30「more fast」、world-14・16「Give a thumbs up.」（それぞれの ブロックで なおす）

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
- npm run curriculum:check: 索引は 最新
