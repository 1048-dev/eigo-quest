# run9 英語レビュー: ワールド31・32（レッスン 901〜960）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校・中学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 901 --to 960`）: **まえ error 0 / warn 7 / info 17 → あと error 0 / warn 7 / info 13**（warn の のこりは ぜんぶ わざと: タイトル「It Was Invented by…」「I Respect Her Because…」「The Graph Shows…」と その スライド〈テストで きまって いる〉6、L938 teacherScript の「After a rain」〈アメリカ英語で ふつう〉1。info は 会話の「What is」・L954 の「toilet」〈べんきそのもの。アメリカでも ふつう〉・せつめいの「very, very」・L929 の Let's 4回〈AI の「Let's pretend」の ため〉）
- なおした 欄: **405**（パッチ 417 件。ブロックの きめごと 67・AI の さいしょの ひとこと 59・レビュアー 250・あとの そろえ 41）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w3132/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. イギリスふうの ほめことば: 「Brilliant!」→「Great job!」（L905・L907・L915・L924・L932・L948・L953）・「Great guides!」（L910）・「Fantastic!」（L946）、「Lovely!」→「Nice!」（L928 teacherScript）
2. エマ先生 じぶんの 語りの「Ms. Emma says / asks」→「I say / I ask」、日本語「エマ先生「」→「わたし「」（L906・L908・L926・L943・L944・L946・L954・L955・L957。L908・L956 の のこりは グループが なおした）
3. エマ先生の あいさつ「Good morning, explorers!」→「Hi, explorers!」（L933・L941）、「Good evening, everyone!」→「Hello, everyone!」（L956）、さいごの「Good night, and see you!」→「See you!」（L932・L956）。物語の なかの「Tonight」や フェン・ハンフリーの Good morning は のこした
4. お手本の「A! Or, B!」→「Or B」（L904・L911・L913）、L911「Maybe, She was born ～」→「You could say, ～」
5. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに「I'm Professor Nib.」「I'm Fen.」「Tick, tock!」など べつの 人として 話して いた。goalJa の やくは のこし、「Let's pretend I'm Old Tock / Professor Nib / Stella Moss / Fen / Humphrey / Dr. Mira / the castle guide ～.」で ごっこあそびだと わかる ように した（59 レッスン。L940 は やくが ないので そのまま。L901 は Who are you? と きく ゴールなので「the keeper of this corridor」に。W25-30 と おなじ）。2つめの Let's は「Time to / We can」に、lint の info（What is・Please show me・very, very）も ついでに なおした
6. あとの そろえ（グループの 報告から。20-after.json）:
   - **L959 core**「Camels have humps so that they can live without food.」→「～ so that they can go a long time without food.」（ラクダは たべものなしでは 生きられない。L936 の せつめいとも あう。テストの 正規表現 /so that .*The graph shows / は そのまま とおる。表現・targetExpressions・recap・台本・会話・スライド・L960 の まえの かいの 文を いっしょに。日本語は「たべものが なくても ながく すごせるように」）
   - ニブ先生の 日本語名を「ニブ先生」に そろえた（字幕 5 か所が「ニブ はかせ」）、金の ギアを「ギア」に（L915・L920 の「はぐるま」。L901 は「ギア（はぐるま）」で しょうかい）、L915 TPR の「ときの ちず」→「タイムマップ」
   - L915 phonics「And ation. ～ Observe plus ation」→「And a, t, i, o, n. ～ Observe, observation. Ob-ser-VA-tion!」（TTS が ation を ことばとして よむ）
   - L937「Talk about you.」→「Talk about yourself.」（L912・L914・L918 と おなじ）

## 学習項目が かわった もの
- L959 の core 表現（上の 6）。テスト・src は かえて いない（テストは 正規表現で、この 文を そのまま もって いない）
- L936 vocab caravan の 日本語「ラクダの たいしょう」→「ラクダと いっしょに たびを する 人たちの れつ」（英語・ID は そのまま）
- ほかの 表現・ことば・TPR・フォニックスの ことば・タイトルは かえて いない

## のこした こと（1人だけの 指摘・テストで きまって いる・あとで 決める）
- タイトルと スライドの「…」、会話の「…」
- L918 core「Before the train was built, ～」（railway の ほうが しぜんだが テストで きまって いる）、L925 core「There are two reasons.」
- 「tap」（L954・L955・L959 の ことば・TPR・core。アメリカでは faucet が ふつうだが tap water・turn off the tap も つうじる。学習項目なので のこした）
- L954「toilet」（べんきの いみ）、L938「After a rain」
- たんどくの 接頭辞・接尾辞（「Im means in」「Re means」「Ist means」「Al makes a noun」）。TTS で きいて たしかめたい
- 「Birimo says, I'm playing Fen!」の あとの「Fen laughs」（ごっこあそびと して よめる）
- 「To plus a verb gives the reason」（L938・L939。こども むけと して のこした）

## レビュアーの メモ（グループごと・英語）
