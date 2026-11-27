# run9 英語レビュー: ワールド19・20（レッスン 541〜600）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 541 --to 600`）: **まえ error 0 / warn 160 / info 14 → あと error 0 / warn 1 / info 14**（まえの warn: Okay・okay 146・autumn 5・ながい 文 5・タイトルと スライドの「…」3・ゆれ 1。あとの warn 1: 「thank you」〈L554 どうし〉と「thank-you」〈L569 a thank-you note の 名詞〉。どちらも ただしい つかいわけ なので のこす）
- なおした 欄: **720**（パッチ 776 件。機械的な なおし 13・ブロックの きめごと 480〈473 欄〉・レビュアー 278・あとの そろえ 5）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w1920/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号（「What should we do?。」）→ 英語がわの 記号だけ のこす（W01-18 と おなじ）
2. 話しことばの 2択「Yes, it is. Or, No, it isn't.」→「Yes, it is. Or no, it isn't.」、英語字幕は「A / B」（W03-18 と おなじ）。ただし L575 の「Use two hands. Or, Put it in the mailbox.」は ひとつづきの 指示なので、字幕も「Or put it in the mailbox.」（mechfix.mjs）
3. 「Okay / okay」→「OK」（159 か所。teacherScript・会話・スライド・L573・L598 の 学校の 表現も）
4. 文の なかの「Now, Touch ～」「Then, Fold ～」など → 小文字（218 欄。say・英語字幕・teacherScript。TPR の 項目と スライドは 大文字の まま。名前と I'm は そのまま）。ことばの ならびを おしえる ところ（First, next, then, finally.）は グループが 小文字に そろえた
5. イギリスふうの ほめことば: L576「Lovely work!」→「Great work!」、L583「Lovely manners, everyone!」→「Great manners, everyone!」、L587・L593「Brilliant!」→「Fantastic!」（グループで L543 の 小文字の brilliant、L596 の Lovely! も）。L581 の ことば「lovely」・「What a lovely house!」は 学習項目で、おきゃくさんの ことばと して アメリカでも しぜんなので のこした
6. エマ先生 じぶんの 語りの「Ms. Emma asks, / says,」→「I ask, / I say,」、日本語「エマ先生「」→「わたし「」（L592・L593・L595・L598・L599・L600。W17-18 と おなじ。こどもが「エマ先生」と よぶ 会話の 行は そのまま）
7. **AI かいわの さいしょの ひとこと「Hi! I'm Ms. Emma.」→ ほんとうの かいわ あいて（60 レッスン ぜんぶ）**。アプリは エマ先生を かいわ あいてに えらばない（pickConversationPartner）。さいごの「Next, talk with X!」の X に した（W17-18 と おなじ）。そのあと グループが「こどもが いうと へんな ところ」を なおした（L551・L554 は「Let's pretend I'm ...」、L552「My little brother」→「A little boy」、L599 は おまつりの まえの日 なのに「コンサートに いく」→「Tomorrow is the big day! I can't wait for the festival!」）
8. autumn → fall（L578・L580。W11-12 と おなじ）
9. 英語の タイトル・スライドの「…」→「...」（L573「I'd Love To, But...」・L589「Why Don't We...?」。W01-02 の きまり。titles.json と テストも なおした）
10. レッスンの はじめの「Yesterday we ～」→「Last time, we ～」（L562・L572。W13-16 と おなじ。グループが のこりの teacherScript と 日本語「きのうは」→「このまえは」も なおした）
11. 日本語の 過去形の よびかた「むかしの かたち」→「すぎた かたち」（L592。W15-18 と おなじ）
12. あとの そろえ（グループの 報告から）:
    - TURE の 音「cher」→「chur」（L571〜580 で 23 か所、L597・L599・L600 も。TTS が 名前の Cher と よむ。W17 と おなじ）
    - 「And now, Smile!」「OK, Play」「And, Turn」など、Now / Then いがいの ことばの あとの 大文字（グループで なおし、L556「And, You shouldn't ...」→「And you shouldn't ...」は あとで なおした）
    - L590「You learned all of these this week!」→「You learned all of these!」（「こんしゅう」は まいしゅう おなじ ペースで まなぶ ことが まえ。日本語も「もう ならったね」）
    - L588 の 強く よむ ところ「Cel-e-BRA-tion」→「Cel-e-BRAY-tion」（BRA を ことばと して よむ）。「Cel」を scripts/english-words.txt の 音節の ところに たした

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L573 表現「That's okay. Maybe next time!」→「That's OK. Maybe next time!」
- L598 表現「It's okay to be nervous.」→「It's OK to be nervous.」
- （タイトルの「…」→「...」は ID に かんけい ない。tests/curriculum.test.ts の L573 タイトル・L573/L598 の 表現・「It's OK to say no」を なおした）

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- 「thank you / thank-you」の lint warn 1（どうしと 名詞の ただしい つかいわけ）
- 「Wind it up.」（L548 TPR・表現、L549 会話）: TTS が 風の wind と よむ かも。学習項目なので のこした（台本の「Wind, rewind.」は なおした）
- 音の つづり「kw」「skw」「sul」（W19）と「J, j, j!」「Ch, ch, ch!」（L586・L587）、「D G E says j」: TTS が 文字の 名前で よむ かも。ブロックで そろって いるので のこした（「juh」を たして まとめて かえる ほうほうが ある）
- L595 TPR「Throw your trash in the bin.」（アメリカでは trash can。学習項目なので のこした）
- L597・L600 の 日本語「むかし」（last year / the past の いみ。そろって いるので のこした。まえ・きょねん に する ほうほうが ある）
- phonics.tipJa の「ステージ2 の つづり①:」「まとめ:」「ふりかえり:」（W17-18 と おなじく のこした）
- AI かいわの「Please tell me ...」「Please sit down.」（こどもの ていねいな いいかたと して しぜん。lint info）
- 「Well done!」、「Very, very」（lint info）、「Thumbs up!」（かんたんの ことば）
- docs/curriculum-6year.md と exports/teacher の L573・L589 タイトルは「…」の まま（計画書と 書き出しは この ブロックの そとで、つぎに 書き出す ときに かわる）

## レビュアーの メモ（グループごと・英語）
