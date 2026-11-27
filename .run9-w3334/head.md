# run9 英語レビュー: ワールド33・34（レッスン 961〜1020）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校・中学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 961 --to 1020`）: **まえ error 71 / warn 49 / info 14 → あと error 60 / warn 47 / info 17**（のこりは ぜんぶ わざと: L1011〜1018 の イギリスと アメリカを くらべる フォニックスの ことば〈colour・centre・theatre・favourite・queue・timetable・pavement・biscuit・rubbish〉と その せつめい・スライド〈テストと w34Phonics.ts の 表で きまって いる〉、L1013 の イギリスから きた ブラウンさんの「on holiday」「biscuits」、タイトル「Make Sure You…」「Would You Mind…?」「Do You Know Where…?」「Could You Recommend…?」と その スライド〈テスト〉、L977 の「osahashimo」〈日本の 学校の ことばと して しょうかい〉。info は 会話の「What is」・「very, very」・くんれんの ほうそうの「Please listen carefully.」・「Let's」4回〈AI の「Let's pretend」の ため〉）
- なおした 欄: **456**（パッチ 480 件。ブロックの きめごと 116・AI の さいしょの ひとこと 60・レビュアー 284・あとの そろえ 20）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいて（partner.ts）・文法の じゅんばん（order.mjs。テストが 見ない teacher.segments も）を たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. イギリスふうの ほめことば: 「Brilliant!」→「Great job!」（L962・L971・L986・L1005・L1013）・「Fantastic!」（L994）・「Great job, email writers!」（L1016）、「Lovely ～!」→「Wonderful work! / Nice job! / Wonderful journals!」（L982・L996・L1018。L982 会話の Lovely は グループ）
2. エマ先生 じぶんの 語り: 「Ms. Emma says / asks / practices / reads」→「I say / I ask / I give a practice announcement / I read the first question」、「Ms. Emma has a secret / got her suitcase / Ms. Emma's passport」→ I / my、日本語「エマ先生「」→「わたし「」（L966〜970・L1002・L1005〜1010）。teacherScript の「Ms. Emma says / takes us / her pouch」も L991〜1000（グループ）と L1001〜1020（20-after）で I / my / me に。ほかの 人の カード・スカイの ことば・メールの しょめいは なまえの まま
3. 日本語の 先生の なまえ「ミス・エマ」→「エマ先生」（W34 だけ ちがって いた）、「ミスター・リー」→「リーさん」
4. エマ先生の あいさつ「Good morning / Good evening, ～!」→「Hi / Hello, ～!」（L973・L980・L982・L992・L1001・L1003・L1009・L1011・L1013・L1018・L1019 の さいしょ）。物語の なかの Tonight や、トモおばあちゃん・かかりの 人・リーさん・ほうそうの Good morning / Good evening は のこした
5. L988「Maybe, I promise ～」→「You could say, ～」、L967 autumn → fall
6. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに「I'm Ember.」「I'm Dr. Mori.」「I'm Mr. Lee.」「I'm your check-in clerk today.」など べつの 人として 話して いた。goalJa の やくは のこし、60 レッスン ぜんぶ「Let's pretend I'm Ember / Dr. Mori / Grandma Tomo / Skye / Mr. Lee / Mrs. Brown from the UK / a traveler ～.」「Let's pretend I work at ～.」に した（W25-32 と おなじ）。2つめの Let's は「We can / Time to」に、Ding, dong → Ding-dong、Look out of → Look out
7. **イギリスと アメリカ（W34）**: L1011〜1014 は イギリスと アメリカの ちがいを ならう 回。イギリスの ことばは「In the UK, ～」と くらべる とき・フォニックスの ことば・イギリスから きた ブラウンさんの ことばだけ のこし、ブライトウォーター（ドルを つかう まち＝イギリスではない）の かんばん・メニュー・エマ先生と こどもたちの ことばは アメリカ英語に（check・cookie・Science Center・Color Room・Little Theater・Old Theater・sidewalk・subway・line・schedule・elevator）

## 学習項目が かわった もの（イギリスと アメリカの きめごとの ため。テスト・src は かえて いない＝どこにも 書かれて いない）
- L1012 school.expressions[2]「Could we have the bill, please?」→「Could we have the check, please?」（grammar・会話・targetExpressions・goalJa・recap・台本・スライドも）
- L1014 school.expressions[2]「～ It's in the Science Centre, on the second floor.」→「～ Science Center ～」
- L1013 tpr[0]「Press the button for the lift!」→「Press the button for the elevator!」
- L1004 phonics.sounds[2]「/ɡ/」→「/ɡdʒ/」（suggest の gg。ことばは そのまま）
- core 表現・ことば・フォニックスの ことば・タイトルは かえて いない

## のこした こと（1人だけの 指摘・テストで きまって いる・あとで 決める）
- タイトルと スライドの「…」、会話の「…」、L977「osahashimo」
- L1011〜1018 の イギリスの ことば・つづり（フォニックスの 表と テストで きまって いる。「In the UK」と くらべる かたちで だけ 出る）
- L997 core「What's the purpose of your visit? Sightseeing.」（テストの 正規表現で きまって いる）
- TPR「Stay right next to Ms. Emma!」（先生が こどもに いう ふつうの ことば）
- たんどくの 語根・接尾辞（rupt・ject・vis・ize）。ならう 音そのものなので のこした。TTS で きいて たしかめたい
- L991 と w34Phonics.ts の「2けたずつ よむ」（3けたの 便名では みぎから かぞえないと わかりにくい。src の ため のこした）

## レビュアーの メモ（グループごと・英語）
