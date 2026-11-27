# run9 英語レビュー: ワールド37・38（レッスン 1081〜1140）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校・中学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 1081 --to 1140`）: **まえ error 0 / warn 91 / info 25 → あと error 0 / warn 91 / info 26**（数は へらない が、のこりは ぜんぶ わざと: ローワンおばあさんの 牧羊犬の なまえ「Biscuit」50、語りの「間」を ならう レッスン〈L1091〜1095 と ふりかえり〉の「…」と その スライド・タイトル「I Wish I Could…」39〈L1101 seg17 の 声に 出す「pause」を「…」に した ので 1 ふえた〉、L1095 core「If I had three wishes, I would ask for ～」23 語 2〈テストの 正規表現で きまった 表現〉。info は「very, very」〈whisper・glance の せつめい〉・会話の「I am / it is / What is」・Let's 4回〈L1100・L1134。Let's pretend の ため〉）
- なおした 欄: **454**（パッチ 480 件。ブロックの きめごと 115・AI の さいしょの ひとこと と まとめの なまえ 68・レビュアー 279・あとの そろえ 18）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいて（partner.ts）・文法の じゅんばんと きんしの ことば（order.mjs。テストが 見ない teacher.segments も）を たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. イギリスふうの ほめことば: 「Brilliant!」→「Great job! / Great listening!」（L1086・L1094・L1097・L1125・L1127・L1130・L1132）、「Lovely!」→「Nice job! / Wonderful!」（L1092・L1109・L1114）、L1124 の イントネーション れんしゅう「Lovely news?」→「Good news?」
2. エマ先生 じぶんの 語り: say・字幕の「Ms. Emma says / asks / reads / laughs」→「I say / I ask / I read / I laugh」（日本語「エマ先生「」→「わたし「」）、teacherScript の「Ms. Emma leads / smiles / sits / walks / lights / adds / has a plan / sets her alarm / checks her watch / writes ～」「with Ms. Emma」→ I / my / me / together（L1081〜1140 の 33 レッスン）。日本語の「先生に いい 考えが ある」なども「わたし」に。こどもが エマ先生に はなしかける 文・会話の 話し手「Ms. Emma」・L1119 の カードの「From Ms. Emma:」は のこした
3. エマ先生の あいさつ「Good morning / Good evening, ～!」→「Hi, ～!」（L1105・L1108・L1112・L1115・L1120・L1123・L1126・L1131・L1135・L1138 の さいしょ。日本語は「やあ、みんな！」に そろえた〈L1113・L1117・L1122・L1128・L1130・L1137 の「みんな、やあ！」も〉）。物語の なかの「Tonight is Storytelling Night!」や、番組の 司会・ローワンおばあさん・ブラムさんの あいさつは のこした。L1098「Good day, everyone!」→「Hi, everyone!」、L1105 の さいごの「Good night!」→「See you!」
4. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに ニブ・サフラン・ねがいの 泉・ペル・ウィラおばあさん・オオカミ・パフ・ローワンおばあさん・ブラムさん などとして 話して いた。goalJa の やくは のこし、48 レッスンを「Let's pretend I'm Nib / Saffron, the old golden dragon / the Well of Wishes / Pell / Granny Willa / the wolf from The Lost Lamb / Puff / Grandma Rowan / Mr. Bram / a child at the village school / a farmer from the village.」で ごっこあそびに した（W25-36 と おなじ）。「I'm Nib, your guide」「I'm Pell」「I'm your host, Puff」は わくに まとめ、2つめの Let's は「it's time to / We can / Imagine」に、L1103 の 25 語の 文を 2つに
5. **AI の あいてと goalJa を あわせた**: goalJa が「AI の キコ」「AI の ビリモ」なのに、アプリが べつの こどもを えらんで いた 5 レッスン（L1116・L1117・L1132 キコ、L1118・L1139 ビリモ）。ほかの こどもの なまえを ひとことに しぜんに 入れて（アプリは なまえの 出た こどもを えらばない）goalJa の こどもが 出る ように し、まとめの「Next, go and talk with ～!」も なおした（pickConversationPartner で たしかめた）
6. **声に 出す ための なおし**: たんどくの 字の かたまり（ive・ous・ful・ly・er）を 字の 読みあげ（i, v, e）に（TTS は「Ive」を「I've」と 読む）、つくった つづり（Fru, s, tra, ted・Oyd・Ank, shus・Fyoo, ree, us・Haaa・Sssizzle・Creeeak〈L1110〉）を ハイフンの 拍（Frus-trat-ed）か ほんものの ことばに、「Squee!」→「Squeak!」、つなぐ 音の れい（Cheer, rup → Chee-rup）。L1091〜1095 の「then BIG!」→「then big!」
7. **話す 人の ない こたえ**: 「What was your favorite part, Kiko? The part where ～!」のように、きいた 人が じぶんで こたえて いる ように きこえる 文に「Kiko says,」などを つけた（6 グループ ぜんぶで たくさん）

## 学習項目が かわった もの
- L1137 vocab[3]「post」→「mail」（アメリカ英語。せつめい・スライド・会話「Let's mail them tomorrow.」・teacherScript も。テスト・src には 書かれて いない）
- L1118・L1120 phonics.sounds「count‿ON」→「COUNT‿on」と src/lib/curriculum/w38Phonics.ts の count on の sound「on を つよく」→「count を つよく」（count on は 動詞＋前置詞で、つよいのは 動詞。L1119 でも「TURN to」と ならう。テストは この 文を 見て いない）
- L1116 school.expressions[0].ja と L1120 vocab[0].ja（日本語の やくだけ）
- core 表現・フォニックスの ことば・タイトルは かえて いない

## のこした こと（1人だけの 指摘・テストで きまって いる・あとで 決める）
- タイトルと スライドの「…」、語りの 間の「…」（ならう ことそのもの）、会話の「…」
- 「Biscuit」（ローワンおばあさんの 牧羊犬の なまえ）
- say の なかの 大文字の 強勢（UP・DOWN・ON・OVER・TURN など 句動詞と イントネーションの れんしゅう。字幕・スライドで つよさを 見せる ため。TTS で きいて たしかめたい）
- teacherScript の「-ly」「-ful」や「, pause,」（台本の 書きかた。W36 の「pause here」と おなじく あとで 考える）
- L1089・L1090 の「Creeeak」（長い e を のばして 見せる 声の れい）
- L1095 core の 23 語、L1134 core の シングル クォート「'I never gave up,' she told me.」（テストの 正規表現で きまって いる）

## レビュアーの メモ（グループごと・英語）
