# run9 英語レビュー: ワールド15・16（レッスン 421〜480）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 421 --to 480`）: **まえ error 0 / warn 102 / info 8 → あと error 0 / warn 1 / info 5**（まえの warn: Okay・okay 93・football 7・thumbs up の ゆれ 1・ながい 文 1。あとの warn 1: L466 の おはなしの 文「He had a big castle and lots of gold, but he was lonely.」〈13 語〉。but で つなぐ おはなしの 文で、こどもが 言う 文では ないので のこす）
- なおした 欄: **586**（パッチ 657 件。共通の 機械的な なおし 48・ブロックの きめごと 337〈316 欄〉・レビュアー 239・あとの そろえ 33）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号（「What are you doing?。」「brighter.。」）→ 英語がわの 記号だけ のこす（W01-14 と おなじ）
2. 話しことばの 2択「Yes, I am! or No, I'm not.」「Yes, I did. Or, No, I didn't.」→「Yes, I am! Or no, I'm not.」、英語字幕は「A / B」（W03-14 と おなじ）。※ W13-14 の 道具では「We're... or I'm...」が「or i'm...」に なる バグが あった（「I'm...」の「...」で 名前の リストに あたらなかった）。さいごの「.」を とって から しらべる ように なおした
3. 「Okay / okay」→「OK」（スタイルガイドの 決まった 形。lint の 93 warn。teacherScript の「Okay, ～」・会話・スライド・L473 の 学校の 表現も）
4. 文の なかの「Now, Ring the bell.」「Then, Look ～」→ 小文字（say・英語字幕・teacherScript。TPR の 項目と スライドは 大文字の まま。名前は そのまま）。グループで「After that, Plant」「Finally, Show」も 小文字に した
5. 「Give a thumbs up.」→「Give a thumbs-up.」（L473 の TPR。W01-14 と そろえた）
6. イギリスふうの ほめことば: L444「Lovely work tonight.」→「Great work tonight.」・「Brilliant, little stars!」→「Great job, little stars!」、L455「Lovely work!」→「Great work!」、L478「Lovely work!」→「Nice work!」、L452・L474「Brilliant!」→「Fantastic!」、L445「That's lovely!」→「That's so nice!」（会話・aiTask の ねらいの 文・スライドも）。グループで L426「Baa-rilliant!」→「Baa! Great job!」、L422・L423「Run on the spot」→「Run in place」
7. ベルの 音「Ding, dong!」→「Ding-dong!」（L456）
8. まえの レッスンを「きのう」と きめつけない: L442・L472「Yesterday we ～」→「Last time, we ～」（L452 は「きのう」を ならう レッスンなので そのまま）
9. L450・L480 の teacherScript「speed TPR」→「speed challenge」（say は もう speed challenge。W13-14 と おなじ）
10. L431 フォニックス「football」→「classroom」（class + room）。サッカーの レッスンで football は イギリスの いいかた（アメリカでは べつの スポーツ）。おなじ 複合語の homework・playground と そろう。focus・sounds・tipJa・testPoints・まとめ・台本・スライドを あわせ、tests/phonics-w15.test.ts も なおした（W07-08 L239 と おなじ 型の なおし）
11. あとの そろえ（グループの 報告から）:
    - 過去形の よびかた「sing の むかしは sang」「むかしの かたち」「とくべつな むかしの ことば」→「すぎた かたち」に そろえた（L456〜463・L469・L471・L474・L476。むかし は「ずっと まえ」の いみで、過去形の 名まえに あわない、と 2つの グループが べつべつに 指摘。ワールド16 では もう「すぎた かたち」が 30 回 つかわれて いて、W17〜31 も おなじ）。「むかし の ことは ed!」（L451 の ずっと まえの はなし）や「むかしむかし」は そのまま。※ L451-460 の グループの メモに ある「sing は sang」の パッチは いちど はずし、この そろえで「sing の すぎた かたちは sang」に した（メモの 決定と 実際の 値が ちがうのは ここだけ）
    - 「did の あとは ed なし」→「did の あとは もとの かたち」（L454・L475。Did you see の ように ed の ない ことばにも あう）
    - y の はじめの 音の かきかた「yeh」→「yuh」（L443・L444 の teacherScript、L449。TTS が ちがう 音で よむので、L443〜445 の 台本の「yuh」に そろえた）
    - まとめの 文の なかの ものがたりの ことば「Once upon a time, First, then, and Finally」「Yesterday, Then, and Finally」→ 小文字（L480・L477。L467 と おなじ）

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L431 フォニックス「football」→「classroom」
- L473 TPR「Give a thumbs up.」→「Give a thumbs-up.」
- L473 表現「Are you okay now? ― Yes, I'm fine.」→「Are you OK now? ― Yes, I'm fine.」

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- 「Well done!」（L467）は アメリカでも ふつう
- 学習項目の ことば: L465「treasure box」（アメリカでは treasure chest の ほうが おおい）、L469 TPR「Show me surprised.」、L470 TPR「Speak loudly.」、L449 TPR「Blow it up high.」。どれも まちがいでは なく ID が かわるので のこした（全体で 決める）
- L466 の 13 語の おはなしの 文（lint warn 1）
- フォニックスの tipJa の「重ねる」（漢字）: おなじ tipJa に「母音・子音」も ある ので、ほかの 10 か所は そのまま（L475 だけ グループが かさねる に した）
- 「Hello, my stars!」（エマ先生の あいさつ）、「What's the past of buy?」、わざと まちがえた かたち（goed・eated・buyed・flied）、文字の よみあげ（「E D」）
- L450 の「Live.」だけの よみ: 「Like a live show!」を たして、TTS が 動詞の live と よまない ように した。のこる ぶんは よみかたの ヒントで 決める
- 日本語の「かれ・かのじょ」（L436 ほか）: ほかの ワールドでも つかって いるので のこした
- ほかの ワールドで みつけた もの: 「Ms. Emma says / asks」（エマ先生 じぶんの 語りで。W17・W20・W26〜40）、world-24「Show time!」、world-40 の「むかしは」

## レビュアーの メモ（グループごと・英語）
