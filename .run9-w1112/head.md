# run9 英語レビュー: ワールド11・12（レッスン 301〜360）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 301 --to 360`）: **まえ error 0 / warn 38 / info 14 → あと error 0 / warn 18 / info 13**（まえ: autumn 16・文が ながい 21・thumbs up の ゆれ 1。あと: のこった warn 18 は ぜんぶ 小6 の 会話・aiTask の 9〜11 語の 文〈「When I'm older, I want to be a teacher.」「I would like to see you again in junior high school.」など〉。when・because・in junior high school を つなぐ ことが その レッスンの ねらいなので のこした。info 13 は 文型の ふくしゅうで わざと ちぢめない「I am」「What is」）
- なおした 欄: **609**（パッチ 633 件。共通の 機械的な なおし 44・ブロックの きめごと 285〈280 欄〉・レビュアー 298・あとの そろえ 6。おなじ 欄が 2回 なおった ものが あるので 合計は 一致しない）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号（「I am ～. と You are ～.。」「Yes, I do. か No, I don't.。」）→ 英語がわの 記号だけ のこす（W01-08 と おなじ）
2. 話しことばの 2択「The games were... or The song was...」→「... or the song was...」、英語字幕は「A... / B...」。「Answer, It's on the third floor. Or, It's next to ～.」→「Or it's next to ～.」（W03-08 と おなじ）
3. 文の なかの「Now, Walk slowly.」「Then, Ring the bell.」「Next, Put it in the box.」→ 小文字（say と 英語字幕 268 欄。TPR の 項目と スライドは 大文字の まま。W07-08 の きまりを Then・Next・First にも あてた）
4. **L349「autumn」**（イギリスの ことば。lint の 16 warn）: 会話の 文「We had a big stage show in autumn.」→「We had a stage show in the fall.」（in the fall で 9 語に なるので big を けずった。日本語も「あきに ステージショーが」）。フォニックスの ことば「autumn」→「August」（おなじ au の「オー」。phonicsButtons.ts でも au は August）。音読の 文「In autumn, I saw red leaves. I drew a picture. The leaves flew away.」→「In August, I saw the sea. I drew a picture. The birds flew away.」（8がつに あかい はっぱは あわないので）
5. 「Give a thumbs up.」→「Give a thumbs-up.」（L334 の TPR。L321 と W01-08 と そろえた。lint の ゆれ）
6. イギリスふうの ほめことば: 「Brilliant!」（L303・L353）→「Awesome! / Fantastic!」、L326「Brilliant writers today!」→「Great writers today!」、L322「Mmm, lovely!」→「Mmm, so nice!」、L324「What lovely messages!」→「What wonderful messages!」、L358「What a lovely memory talk!」→「What a great memory talk!」
7. ベルの 音「Ding dong!」「Ding, dong!」→「Ding-dong!」（L318・L326・L333・L343。W05-06 と おなじ）
8. 先生の 日本語字幕「みんな、やあ！」→「やあ、みんな！」（L347）、L330 teacherScript「あしたは ボスせんだよ。」→「つぎは ボスせんだよ。」（W07-08 と おなじ）
9. レビュアーの 共通の 指摘: 「Here's the point」「Today's goal」「まとめ」で 文型を コンマで ならべる 言いかた（「Say I want to be, then a, then the job.」「Who said it, then said, then the words.」「You can say, I went to, and I played.」）や、ことばの とちゅうで おわる 文（「Thank you for.」「My dream is to be a teacher, because.」）は、見本の 文か「I went to... and I played...」の ような 「...」の 間に した（W07-08 の 11 と おなじ）。あとの そろえで L321・L322 の ゴールと L342 の まとめも おなじに した

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L319 ことば「senior student」→「older student」（A+B。せんぱい の 直訳で、アメリカでは senior は 高校3年生。説明も「A big kid in your club.」に）
- L325 表現「We could do our best because you helped us.」→「We did our best because you helped us.」（A+B。1回の できごとに could は ネイティブには ふしぜん。Ms. Emma の「You all did your best.」とも そろう）
- L334 TPR「Give a thumbs up.」→「Give a thumbs-up.」
- L349 表現「We had a big stage show in autumn.」→「We had a stage show in the fall.」、フォニックス「autumn」→「August」

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- 小6 の 会話の ながい 文（lint の warn 18。上を 見て）
- 「Grade 6 show」（アメリカでは sixth-grade show）: W07-08 と おなじく 全体で 決める
- 「I could ～」（L321〜330 の ねらいの 文型。「I could swim 25 meters.」「Because of you, I could speak English.」）: 1回の できごとに could は ネイティブには すこし ふしぜんだが、カリキュラムの 文型なので 全体で 決める
- 日本の 学校の ことば: 「sports day」（アメリカは field day）、「music festival」、「teachers' room」、「message board」（よせがき）、「lunch room」、「Hit the shuttle.」（アメリカの こどもは birdie）。どれも 学習項目なので のこした
- フォニックスの 音の わけかた（「Walked, t.」「It says id」「A I says ay」「C says s」）を TTS が 文字や「I.D.」と よむ おそれ: ブロック全体の 型なので のこした。「A I」→ AI、「thay」、「a say its name」など よみまちがいが はっきり ある ものだけ なおした
- L346・L350 の「the sea」「in summer」（beach / ocean の ほうが アメリカふう だが ID）、L359「How do you say pan in English?」（TTS が「パン」と よまない おそれ。じっさいの 声で たしかめる）
- L328・L330 の `phonics.focus` と `phonics.sounds` の かずが あわない（7 と 4、10 と 5）: データの 形の はなしで 英語では ないので のこした
- exports/teacher/ と tmp-teacher/ の L325 は 書きだしの ファイルなので `npm run teacher:export` で 作りなおす ときに かわる
- ほかの ワールドで みつかった もの: world-30 の「more fast」、world-14・16 の「Give a thumbs up.」（それぞれの ブロックで なおす）

## レビュアーの メモ（グループごと・英語）
