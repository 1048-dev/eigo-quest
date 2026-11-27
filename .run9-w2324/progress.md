
## REVIEW: ワールド23・24（レッスン 661〜720）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・teacherScript・testPoints を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（「Answer, Yes, it does. Or, No, ～」→「Or no, ～」・日本語の なかの 2重の 記号）と ブロックの きめごと（okay → OK・イギリスふうの ほめことば〈Brilliant・Lovely〉・「Now, ～」の あとの TPR の 小文字・autumn → fall・L702 timetable → schedule・Ding-dong）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た ものを ブロック全体で たしかめて そろえた（teacherScript の「Or, No」、who を つかう 説明、L690 の Present.）
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいても たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W23-24.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 661 --to 720`）: **まえ error 0 / warn 23 / info 18 → あと error 0 / warn 1 / info 18**（まえの warn は okay 6・autumn 4・timetable 12・L714 の 16 語の 文 1。のこりの warn 1 は L714 の 会話で 5つの ばしょを ならべる 文〈「ぜんぶは むり」の りゆう なので わざと〉。info は「Very, very」「What is」「sweets」など）
- なおした 欄 **331**（パッチ 339 件: 機械的な なおし 21・ブロックの きめごと 85・レビュアー 222・あとの そろえ 11）、なおした レッスン **53 / 60**（L673・L676・L691・L697・L703・L708・L714 は なし）
- 学習項目 ID が かわった もの 2つ: L702 ことば「timetable」→「schedule」、L711 表現「It takes about thirty minutes by underground.」→「… by subway.」（名詞の underground は イギリスふう。L713・L715 の「take the underground」も subway に。テストが もとめる「Take the underground line to the museum.」と ことば・フォニックスの underground は のこした）。テスト・src の 変更は なし

### before → after の 例
1. L667 会話（A・B）: 「Don't worry. That's Birimo's own soda from lunch.」→「That's Birimo's own soda from lunch. But no drinks in the lab, Birimo!」（L662 で「けんきゅうじょでは あじみしない」と ならったのに、先生が けんきゅうじょで のむのを ゆるして いた。日本語の「ジュース」も ソーダに あわせた）
2. L696 フォニックスの ヒント（objective）: 「seen と been は『イーン』」→「seen は『イーン』と ながく、been は アメリカでは『ビン』と みじかく」（アメリカ英語の been は /bɪn/。台本の「Seen and been rhyme.」と sounds も なおした）
3. L663 会話（A・B）: 「I can see a big black circle. Is it a monster?」→「I can see a big black line. …」（けんびきょうで みた まつげは まるでは なく せんに みえる。台本・スライド・日本語も あわせた）

### きめた こと
- L716 の 日本語字幕「がっこうめい」→「がっこうの なまえ」の グループの なおし（2 パッチ）は とりけした。tests/teacher.test.ts が 台本に「がっこうの なまえ」を 入れない ように して いて（がっこうの なまえを きく 文に きこえない ため）、もとの いいかたは わざと
- 「who」を つかう ことばの 説明（L661 scientist・L670 audience・L701 station staff）は ふつうの 文に した。関係代名詞は ステージ4 で、world 24 の テストも 台本で きんし して いる
- 大文字の 音節（「strong on TOG」「CAN, a, da」「Hok, KAI, do」「IT, a, ly」）は 強勢の 学習の 中心なので のこした（2つの グループが のこす、1つが「きいて たしかめて」）。L672・L690 の「SCI-en-tist」「EN-er-gy」だけ ふつうの はくの かたちに した
- のこした こと: L714 の 16 語の 文、L710「I'm going to the sea.」（テストが もとめる）、L719「to go home」、「Well done!」「Thumbs up!」、L717「sweets」。くわしくは W23-24.md
- ほかの ワールドで みつけた もの: 名詞の「underground」（= subway）、been の 音を「イーン」と する せつめい、teacherScript の「Or, No, ～」（機械的な なおしが teacherScript を みて いない）、ことばの せつめいの「A person who ～」、たんどくの 同形異音語（Record. / Present.）、AI の さいしょの ひとことが こたえを さきに いって しまう もの（L693・L710）、大文字の 音節を TTS が 文字で よむ かの きいて みる チェック

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
- npm run curriculum:check: 索引は 最新
