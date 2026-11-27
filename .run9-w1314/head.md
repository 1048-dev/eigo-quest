# run9 英語レビュー: ワールド13・14（レッスン 361〜420）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 361 --to 420`）: **まえ error 0 / warn 29 / info 19 → あと error 0 / warn 4 / info 17**（まえの warn: Okay 23・L393 の bread 3・L384 の ながい 文 2・thumbs up の ゆれ 1。あとの warn 4: L393 の「breads」「a bread」3 は「one bread, two breads とは いわない」の 説明と クイズの まちがいの 選択肢なので わざと。L384 の 15 語の 早口ことば 1 は「Sorry? One more time, please.」を 言わせる ための もので、こどもは 言わなくて いい）
- なおした 欄: **487**（パッチ 503 件。共通の 機械的な なおし 21・ブロックの きめごと 220〈218 欄〉・レビュアー 246・あとの そろえ 16）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号（「No, she doesn't.。」「What kind?！」）→ 英語がわの 記号だけ のこす（W01-12 と おなじ）
2. 話しことばの 2択「He likes... or She has...」→「... or she has...」、「Yes, she does. Or, No, she doesn't.」→「Or no, she doesn't.」、英語字幕は「A... / B...」（W03-12 と おなじ）。※ W11-12 の 道具の ままでは「I sometimes... or I never...」が「Or I never」に なる バグが あったので、「...」の あとは 大文字に しない ように なおした
3. 「Okay / okay」→「OK」（スタイルガイドの 決まった 形。lint の 23 warn。L377・L391・L402 の 会話と スライドも）
4. 文の なかの「Now, Point to ～.」「Then, Press ～.」→ 小文字（say・英語字幕・teacherScript。TPR の 項目と スライドは 大文字の まま。「Next, Kiko」「Now, Haru's」の ような 名前は そのまま）
5. 「Give a thumbs up.」→「Give a thumbs-up.」（L406 の TPR。W01-12 と そろえた）、「a big thumbs up」→「a big thumbs-up」。「Two thumbs up for you!」「Thumbs up, sound masters!」は 名詞では ないので そのまま
6. イギリスふうの ほめことば: L396「Brilliant!」→「Fantastic!」、L367「Lovely job!」→「Great job!」・「Isn't that lovely?」→「Isn't that nice?」、L389「What a lovely walk!」→「What a nice walk!」、L393「Lovely work!」→「Nice work!」、L407「What a lovely evening!」→「What a nice evening!」、L417「Lovely stories!」→「Wonderful stories!」
7. ベルの 音「Ding, dong!」→「Ding-dong!」（L372・L374）
8. まえの レッスンを「きのう」と きめつけない: L382「Yesterday we ～」→「Last time, we ～」、「きのうは」→「まえの レッスンでは」（グループで L362・L372 も おなじに した）
9. あとの そろえ（グループの 報告から）: L405「show time」→「showtime」（L365・L420 と おなじ）、L391「どこにも りんごの はこが あります」→「あちこちに」（どこにも は うちけしの ことば。学習項目の 日本語・会話・字幕 4 欄）、L397「Top teeth on your lip」→「on your bottom lip」（L408・L409 と おなじ）、L417「Wrong sounds like rong.」・L420「Knife sounds like nife.」→「The W in wrong is silent.」「The K in knife is silent.」（rong・nife は TTS が よみまちがえる おそれ。日本語も「w は よまないよ」）、L390・L420 の まとめ「スピード TPR」→「スピード チャレンジ」（say は もう speed challenge）

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L406 TPR「Give a thumbs up.」→「Give a thumbs-up.」（この 1つだけ）

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- 「fisher」（L376・L379・L386・L389。アメリカの こどもは fisherman の ほうが なじむが、男女の ない ことばで 学習項目なので のこした）
- L414「Don't eat too many sweets.」（lint の info。あまい もの ぜんぶの いみの sweets は アメリカでも つかう）
- 「Well done!」「Cheers!」（L394 の ジュースで かんぱい）は アメリカでも ふつう
- L385・L414 の「Tomorrow is the harbor festival / lunch box contest」は おはなしの なかの あした なので のこした
- L370 TPR「Give a big hand.」（目的語が ない。ID なので のこした）、L365 の teacherScript の「～」（声に する ときは よみかたを 決める）
- フォニックスの 音の わけかた（「t c h」「Fif-ty」）を TTS が どう よむか: ブロック全体の 型なので のこした。「Badg, er」「Thehedgehog…」「Ty」「rong」「nife」の ような はっきりした よみまちがいだけ なおした
- 英語の わりあいが 97〜98%（W11-12 は 89〜90%）: もとの 台本の 形で、ワールド13 の はんいの なか（ALL OK）
- exports/teacher/ と tmp-teacher/ の 書きだしは `npm run teacher:export` で 作りなおす ときに かわる

## レビュアーの メモ（グループごと・英語）
