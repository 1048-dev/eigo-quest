
## REVIEW: ワールド19・20（レッスン 541〜600）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・teacherScript・testPoints を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（2重の 文末記号・2択の 字幕と say）と ブロックの きめごと（Okay → OK・「Now, / Then, / First, ...」の あとの 小文字・イギリスふうの ほめことば・エマ先生 じぶんの 語りの「Ms. Emma says / asks」→「I say / I ask」・AI かいわの「Hi! I'm Ms. Emma.」→ ほんとうの あいて・autumn → fall・タイトルの「…」→「...」・Yesterday we → Last time, we・「むかしの かたち」→「すぎた かたち」）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た ものを ブロック全体で たしかめて そろえた（cher → chur、Now いがいの ことばの あとの 大文字、L590 の「this week」、L588 の 強く よむ ところ）
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいても たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W19-20.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 541 --to 600`）: **まえ error 0 / warn 160 / info 14 → あと error 0 / warn 1 / info 14**（まえの warn は Okay・okay 146・autumn 5・ながい 文 5・「…」3・ゆれ 1。のこりの warn 1 は「thank you」〈どうし〉と「thank-you note」〈名詞〉で、ただしい つかいわけ なので のこす。info は「Very, very」「Please ～」など）
- なおした 欄 **720**（パッチ 776 件: 機械的な なおし 13・ブロックの きめごと 480・レビュアー 278・あとの そろえ 5。重なり あり）、なおした レッスン **60 / 60**
- 学習項目 ID が かわった もの 2つ: L573 表現「That's OK. Maybe next time!」、L598 表現「It's OK to be nervous.」（この 2項目だけ 記録が あたらしく なる）。タイトル 2つ（L573・L589）の「…」→「...」に あわせて titles.json と tests/curriculum.test.ts を なおした

### before → after の 例
1. L557 会話（objective・lint）: 「If you land on a duck, you have to answer a question card.」→「On a duck space, you have to pick a question card.」（13 語で ながく、こたえるのは カード では なく しつもん。say・字幕・スライド・日本語も あわせた）
2. L586 会話（A・B）: 「If it rains, the food stands will move to the kitchen of the hall.」→「… will move to the hall's kitchen.」（「ホールの キッチン」の 直訳。14 語 → 12 語）
3. L599 AI かいわ（A・B）: 「Hi! I'm Ms. Emma. Tomorrow is a special day for me. I'm going to a concert!」→「Hi! I'm Kiko. Tomorrow is the big day! I can't wait for the festival!」（あいては キコちゃん。おはなしでは あしたは おまつり なのに コンサートと いって いた）

### きめた こと
- AI かいわの ひとことは 60 レッスン ぜんぶ、アプリが えらぶ あいて（さいごの「Next, talk with X!」と おなじ）に した。こどもが いうと へんな 役（「I'm new at this workshop」「Today I'm the workshop master」）は「Let's pretend I'm ...」に した
- L581 の ことば「lovely」「What a lovely house!」は 学習項目で、おきゃくさんの ほめことばと して アメリカでも しぜんなので のこした（先生の ほめことばの Lovely は Great などに した）
- タイトルの「…」は lint と W01-02 の きまりどおり「...」に した（テストも なおした。計画書 docs/curriculum-6year.md は そのまま）
- 「Cel-e-BRAY-tion」の「Cel」は 音節なので scripts/english-words.txt の 音節の ところに たした
- のこした こと: 「Wind it up.」（学習項目・TTS の よみ）、「kw / skw / J, j, j!」の 音の つづり、L595「bin」、L597・L600 の 日本語「むかし」、tipJa の「ステージ2 の つづり①:」、「Well done!」。くわしくは W19-20.md
- ほかの ワールドで みつけた もの: 「Now, / Then,」いがいの ことば（And now, / OK, / And,）の あとの 大文字、「a paper」（かぞえられる 名詞の まちがい）、TTS が 文字の 名前で よむ 音の つづり（J, j / kw）、「this week」など まいしゅうの ペースを まえに した ことば

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
- npm run curriculum:check: 索引は 最新
