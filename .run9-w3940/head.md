# run9 英語レビュー: ワールド39・40（レッスン 1141〜1200）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校・中学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 1141 --to 1200`）: **まえ error 0 / warn 51 / info 11 → あと error 0 / warn 21 / info 12**（のこりの warn は ぜんぶ わざと: テストで きまった タイトルの「…」〈However…・It Seems That…・We Believe That…・Our First Point Is…・We Disagree Because…・One Solution Is…・I Hope to…〉と その スライド 13、L1184 の かんがえる 間「Let me see…」6、書きかたの ゆれ「bow and say, Thank you」1）
- なおした 欄: **534**（パッチ 574 件。ブロックの きめごと 131・AI の さいしょの ひとこと 60・レビュアー 373・あとの そろえ 10）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいて（partner.ts）・文法の じゅんばん・きんしの ことば・団体や 試験の なまえ（order.mjs。テストが 見ない teacher.segments も）を たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. イギリスふうの ほめことば: 「Brilliant!」→「Great job!」（L1145・L1150・L1152・L1161・L1170・L1177・L1178・L1184）、「Lovely!」→「Wonderful! / Nice job!」（L1168・L1172・L1189・L1193・L1194）、L1187 の 会話「Lovely plans.」→「Great plans.」
2. アメリカ英語: L1154・L1155「(the) summer holidays」→「summer vacation」（ことば・表現・会話・スライド ぜんぶ）、L1143「football」→「soccer」、L1173「In Year 1」→「In our first year」、「Okay / okay」→「OK」（L1153・L1160・L1174）
3. エマ先生 じぶんの 語り: say・字幕の「Ms. Emma says / asks」→「I say / I ask」（日本語「エマ先生「」→「わたし「」。L1161・L1162・L1163・L1170）、teacherScript の「Ms. Emma says / smiles / nods / laughs / gives / writes / sits / teaches / helps ～」→ I ～（with everyone / me。36 レッスン）。こどもが エマ先生に はなしかける 文、こどもが 書いた カード・手紙・リスト・スピーチ（「Dear Ms. Emma」「A note from Ms. Emma:」「With love, Ms. Emma」など）と それへの しつもん、会話の 話し手「Ms. Emma」、goalJa の「AI の エマ先生」は のこした
4. エマ先生の あいさつ「Good morning / Good evening, ～!」→「Hi, ～!」（L1144・L1149・L1153・L1157・L1162・L1173・L1193・L1195・L1199 の さいしょ。日本語「やあ、みんな！」）。物語の「Tonight, ～」、面接の ロールプレイの「Good morning. Please sit down.」（L1181・L1185）、スピーチの 出だしの れい「Good morning, EVeryone」（L1186）は のこした
5. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに 60 レッスン ぜんぶが オービット・サム・アミナ・プリヤ・マテオ（の おじさん）・サムの おばさん・リアム・ナディア・セレスト・エマ先生（面接官）・はじめたばかりの 子・フェアの お客さん・はんたいチームの 子 として 話して いた。goalJa の やくは のこし、「Let's pretend I'm ～.」で ごっこあそびに した（W25-38 と おなじ。W27-28 にも「Let's pretend I'm Ms. Emma.」が ある）。「I'm Orbit, the chair」「I'm Sam from North America」「I'm Celeste, the keeper of this star」は わくに まとめ、2つめの Let's は「We can / Here are / Now, ～ begins」に（L1196 は core「Let's talk about anything you like!」なので のこした）、L1182 の 23 語の 文を 2つに
6. **話す 人の ない セリフ**: 「Kiko smiles. I think ～」「Riko points. Orbit, ～」のように、うごきの すぐ あとに こどもの セリフが あって、エマ先生の ことばに きこえる 文に「and says,」「Kiko says,」などを つけた（6 グループ ぜんぶで たくさん。say を 中心に、物語の くいちがいに なる ものは teacherScript も）
7. **声に 出す ための なおし**: たんどくの 字の かたまり（ion・ation・al・ar・ed・ow・ai・ph・ea・er・ful・ly・ay・ir・Im）を 字の 読みあげ（i, o, n）か ほんものの ことば（the sound in her）に。ment・able・ness・re・eco など ことばとして 読める ものは のこした。L1199「Make FU strong」→「Make the start of future strong」（FU を 字で 読むと 下品な ことばに きこえる）、「Lead, as in lead the way」「Tear, as in teardrop」など 読みかたの ちがう ことば
8. **however の 強勢**: L1156・L1160 の「HOWever」→「howEVer」（つよいのは 2つめの 音節）と src/lib/curriculum/w39Phonics.ts の say。おなじ 表の せつめい「はじめを つよく」も moreOver・as a reSULT・for exAMple には あわないので「大文字の ところを つよく」に（content の「さいしょを つよく」「Strong start」も）
9. **ランタン・光が ともる 文**: 現在形の 語り（begins to shine / starts to glow）の あとの「The Lantern of ～ lit up!」を「lights up!」に そろえた（teacherScript の 語り 10 レッスン）。こどもが さけぶ 文（L1175 の 表現「The Ray of Memories lit up!」・L1180・L1185 seg9）と エマ先生の「Look! ～ lit up!」は のこした

## 学習項目が かわった もの
- L1154 vocab[2]「summer holidays」→「summer vacation」と school.expressions[1]「Good point, but what about the summer holidays?」→「～ about summer vacation?」（アメリカ英語。テスト・src には 書かれて いない。core ではない）
- L1187 school.expressions[1]「～ study sea animals at university.」→「～ at a university.」（アメリカ英語。core ではない）
- L1156・L1160 phonics.sounds「HOWever, ‖」→「howEVer, ‖」と src/lib/curriculum/w39Phonics.ts の However の say・せつめいの 文（テストは 字だけ 見て いる）
- core 表現・フォニックスの ことば・タイトル・TPR は かえて いない

## のこした こと（1人だけの 指摘・テストで きまって いる・あとで 決める）
- タイトルと スライドの「…」、L1184「Let me see…」（かんがえる 間 そのもの）、会話の「...」
- **L1141 core「Children from every continent sit at this table.」**: 南極の いすは 空いて いる ので 厳密には ちがうが、テストで きまった 表現（tests/curriculum.test.ts:4519）。ほかの 文では「from all over the world」に した（L1177 など）。かえる なら テストと いっしょに
- 「wonky veggie box」（L1147・L1150。アメリカでも つかう ことばで、かわりの「ugly」は テストの きんしの ことば）、「tap」（L1158。アメリカでも わかる）
- teacherScript の なかの 話す 人の ない 文の 一部（声に なるのは say なので、物語の くいちがいが ない ものは のこした）
- say の 大文字の 強勢（We BELIEVE・Six years aGO・EVeryone など）と スピーチの 間の「pause」（W36-38 と おなじ）
- 書きかたの ゆれ「bow and say, Thank you」（L1180・L1191）と「bow and say thank you」（L1181）

## レビュアーの メモ（グループごと・英語）
