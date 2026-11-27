
## REVIEW: ワールド17・18（レッスン 481〜540）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・teacherScript・testPoints を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（2重の 文末記号・2択の 字幕と say）と ブロックの きめごと（Okay → OK・イギリスふうの ほめことば・エマ先生 じぶんの 語りの「Ms. Emma says」→「I say」・「Now, / Then, / After that, / Finally,」の あとの 小文字・L510 Please enjoy! → Have fun!・L490 That's it for today・speed TPR → speed challenge）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た ものを ブロック全体で そろえた（AI かいわの「Hi! I'm Ms. Emma.」→ ほんとうの あいて〈33 レッスン〉、L504 の ルカ → ビリモ、key chain → keychain、cher → chur、音節の よみを ハイフンの かたちに）
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあいも たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W17-18.md**
- 60 レッスンに `"reviewed": "run9"` を つけた
- 機械的な なおしの 道具は「A. Or, b ...」（2択では ない ひとつづきの 文）の 英語字幕を「/ a cat ...」に して しまった ので、L514・L515・L523 は say と おなじ 文に もどした

### 数
- lint（`npm run english:lint -- --from 481 --to 540`）: **まえ error 0 / warn 86 / info 17 → あと error 0 / warn 1 / info 17**（まえの warn は Okay・okay 77・Please enjoy 4・That's all for today 2・ながい 文 2・key chain の ゆれ 1。のこりの warn 1 は L485 の 会話の 13 語の 文〈First / Then / After that / Finally の 2つめで、しぜんな 英語〉なので のこす。info は「What is」「very, very」など）
- なおした 欄 **616**（パッチ 649 件: 機械的な なおし 15・ブロックの きめごと 342・レビュアー 231・あとの そろえ 57・lint の そろえ 4。重なり あり）、なおした レッスン **60 / 60**
- 学習項目 ID が かわった もの 5つ: L483 ことば「key chain」→「keychain」と 表現「I'm going to give her this keychain.」、L484 表現「OK. Maybe next time!」、L510 表現「… Have fun!」、L523 表現「Speak softly, please. ― OK.」（この 5項目だけ 記録が あたらしく なる）

### before → after の 例
1. L511〜540 ほか AI かいわ（objective）: 「Hi! I'm Ms. Emma. Welcome to Echo Valley! …」→「Hi! I'm Kiko. Welcome to Echo Valley! …」（アプリは かいわ あいてに エマ先生を えらばないので、キコちゃんが「わたしは エマ先生」と いって いた。33 レッスンで、さいごの「Next, talk with X!」と アプリの えらびかたが おなじ ことを たしかめた）
2. L513 フォニックス（objective）: 「A short word with one vowel and one last letter? Double it!」→「One short vowel and one consonant at the end? Double it!」（どの ことばにも「さいごの 1文字」は あるので、きまりと して まちがい。long は 2つ かさねない。teacherScript・日本語も あわせた）
3. L534 ポイント（A・B）: 「Riko's bag means the bag of Riko.」→「Riko's bag means the bag that belongs to Riko.」（「リコの かばん」の 直訳で、英語では いわない）

### きめた こと
- AI かいわの ひとことは、アプリが じっさいに えらぶ あいて（さいごの「Next, talk with X!」と おなじ）に そろえた。エマ先生を あいてに する ほうほうも あったが、アプリの しくみ（engine.ts）を かえない ほうを えらんだ。L504 は ゲストの ルカの かわりに ビリモが やくそくの れんしゅうを する かたちに した
- エマ先生 じぶんの 語りは「I say, ～」「わたし「～」」（L490 の かたちに そろえた）
- 「key chain」は ワールド16（レビューずみ）と L528 の「keychain」に そろえた（ID が 2つ かわる）
- 音節の よみは、音の つづり（vay・jih）では なく この ブロックの ハイフンの かたち（Ob-ser-va-tion）に した。字幕にも ほんとうの つづりが 出る
- のこした こと: L485 の 13 語の 文、「Well done!」、「That's all for today's weather.」（天気よほうの きまり文句・学習項目）、「zhun」、L488「fifteen degrees」、tipJa の「ブロック1 の まとめ:」、学習項目の「Get ready, set, go!」「untidy」。くわしくは W17-18.md
- ほかの ワールドで みつけた もの: AI かいわの「Hi! I'm Ms. Emma.」が world-19・20・21 にも ある（それぞれの ブロックで なおす）。まとめの「, and you can ～」で 12 語を こえる 文

### チェック
