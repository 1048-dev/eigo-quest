# run9 英語レビュー: ワールド35・36（レッスン 1021〜1080）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校・中学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 1021 --to 1080`）: **まえ error 0 / warn 37 / info 27 → あと error 0 / warn 27 / info 27**（のこりは ぜんぶ わざと: アマラの 犬の なまえ「Biscuit」9、テストで きまった タイトルの「…」と その スライド 10、L1078 ビリモの「very, very, very cute!」〈事実では ない 文の わるい 例〉6、L1056 の せつめい「A big white board」2。info は 会話の「What is / it is」・「very, very」〈オズウィンさんの ゆっくり〉・Let's 4回〈Let's pretend の ため〉）
- なおした 欄: **507**（パッチ 536 件。ブロックの きめごと 125・AI の さいしょの ひとこと 60・レビュアー 329・あとの そろえ 22）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいて（partner.ts）・文法の じゅんばん（order.mjs。テストが 見ない teacher.segments も）を たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. イギリスふうの ほめことば: 「Brilliant!」→「Great job!」（L1022・L1029・L1033・L1036・L1042・L1051・L1068・L1076）、「Lovely!」→「Nice job! / Wonderful!」（L1029・L1036・L1047）
2. エマ先生 じぶんの 語り: say・字幕の「Ms. Emma says / asks」→「I say / I ask」（日本語「エマ先生「」→「わたし「」）、teacherScript の「Ms. Emma says / holds / finds / whispers / puts / explains / gives ～」「with Ms. Emma」→ I / me / together（L1021〜1080 の 30 レッスン）。日本語の「先生が きくよ / いうよ」も「わたしが ～」に（L1031・L1033・L1034・L1038・L1039）。こどもが エマ先生に はなしかける 文と キコの 計画カードは なまえの まま
3. 日本語の 先生の なまえ「ミス・エマ / ミズ・エマ」→「エマ先生」（L1045・L1072・L1074）
4. エマ先生の あいさつ「Good morning, ～!」→「Hi / Hello, ～!」（L1022・L1033・L1043・L1062 の さいしょ）。L1066 の 発表の はじめかた「Good morning, everyone. Have you ever seen ～?」（学習項目）と TPR「Wave and say, Good morning!」は のこした
5. 「Or, ～」→「Or ～」（L1022・L1027）、okay → OK（L1054・L1057・L1059）
6. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに「I'm Olive.」「I'm Priya!」「I'm Mayor Hart.」「I'm Lumi」や、ヴェイル博士・オズウィンさん・ルミとして 話して いた。goalJa の やくは のこし、60 レッスン ぜんぶ「Let's pretend I'm Olive / Priya / Amara / Leo / Ken / Mayor Hart / the librarian / Lumi / Dr. Vale / Mr. Oswin.」に した（W25-34 と おなじ）。2つめの Let's は「Time to / We can」に、ルミの「Let's find out!」は ひとことでは とった。L1061 の 27 語の 文を みじかく、L1044 lovely → great
7. **アメリカ英語**: L1048「in the holidays」→「during vacation」（学習項目の 表現も）、L1023 ことば「timetable」→「schedule」、L1045「Tick!」→「Check!」
8. **温度は「degrees Celsius」**: アメリカの こどもは「4 degrees」を 華氏（こおる より つめたい）と きく。各レッスンの さいしょの 1回だけ「degrees Celsius」に（L1053・L1055・L1067・L1072・L1076）
9. **声に 出す ための なおし**: たんどくの 字の かたまり（ity・ble・bil・ous・tion・Re, c, ei, ve）を 字の 読みあげ（i, t, y）や「the ending」に、こま切れの 音節（bi, OL, o, gist）を ハイフンの 拍（Bi-OL-o-gist）に。話す 人が ない こたえ（「Can I interview you? Of course!」）に 話す 人を つけた（W35・W36 の 20 か所 いじょう）

## 学習項目が かわった もの（テスト・src の 文字列は かえて いない＝どこにも 書かれて いない）
- L1023 vocab[3]「timetable」→「schedule」（アメリカ英語）
- L1042 tpr[3]「Shake your hand and say, No straw, thank you!」→「Shake your head and say, ～」（hand だと あくしゅ）
- L1048 school.expressions[1]「～ who will water the plants in the holidays?」→「～ during vacation?」
- L1053 school.expressions[1]「It reaches well only the top 200 meters.」→「Bright sunlight reaches only the top 200 meters.」（語順の まちがい。うすい ひかりは 1,000 m まで とどくので Bright を つけた）
- L1058 school.expressions[2]「～ they go back down in the day.」→「～ during the day.」
- src/lib/curriculum/w36Phonics.ts の biome の definition「climate, plants and animals」→「climate and living things」（しんかいに しょくぶつは ない。テストは この 文を 見て いない）
- core 表現・フォニックスの ことば・タイトルは かえて いない

## のこした こと（1人だけの 指摘・テストで きまって いる・あとで 決める）
- タイトルと スライドの「…」、会話の「…」、オズウィンさんの「Wel... come...」
- 「Biscuit」（アマラの 犬の なまえ）
- たんどくの 語根 spect・dict・struct・port・rupt・ject・Inter・Co（ならう 音そのもの。W33 と おなじ）。TTS で きいて たしかめたい
- W36 の「pause here」が お手本の 文の なかに ある こと（ブロック全体の かたち。声で 読まれるので、あとで「Pause after X.」の かたちに する ことを 考える）
- 文の あたまの 名詞・動詞で 強勢が かわる ことば（Transport. Project. Export.）

## レビュアーの メモ（グループごと・英語）
