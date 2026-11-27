# run9 英語レビュー: ワールド17・18（レッスン 481〜540）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 481 --to 540`）: **まえ error 0 / warn 86 / info 17 → あと error 0 / warn 1 / info 17**（まえの warn: Okay・okay 77・Please enjoy 4・That's all for today 2・ながい 文 2・key chain と keychain の ゆれ 1。あとの warn 1: L485 の 会話「Then, we're going to put on our jackets and go to the roof.」〈13 語〉。First / Then / After that / Finally の 4つの じゅんばんの 2つめで、しぜんな 英語なので のこす）
- なおした 欄: **616**（パッチ 649 件。機械的な なおし 15・ブロックの きめごと 342〈340 欄〉・レビュアー 231・あとの そろえ 57・lint の そろえ 4）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w1718/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号（「How about you?。」）→ 英語がわの 記号だけ のこす（W01-16 と おなじ）
2. 話しことばの 2択「Yes, I am. Or, No, I'm not.」→「Yes, I am. Or no, I'm not.」、英語字幕は「A / B」（W03-16 と おなじ）。ただし L514・L515・L523 の「A. Or, b ...」「Walk... or Speak...」は 2択の クイズでは なく ひとつづきの 文なので、字幕も「Or a cat ...」「Walk... or speak...」に した（道具の けっかを 手で なおした: mechfix.mjs）
3. 「Okay / okay」→「OK」（スタイルガイドの 決まった 形。lint の 77 warn。teacherScript・会話・スライド・L484・L523 の 学校の 表現も）
4. 文の なかの「Now, Ring ～」「Then, Look ～」「After that, Watch ～」「Finally, Drink ～」→ 小文字（say・英語字幕・teacherScript。TPR の 項目と スライドは 大文字の まま。名前と I'm は そのまま）。L485 の「First, Then, After that, Finally.」も「First, then, after that, finally.」
5. イギリスふうの ほめことば: L485「Brilliant planning!」→「Great planning!」、L493・L504「Brilliant!」→「Fantastic!」、L516「Lovely work, everyone!」→「Great work, everyone!」、L523「Lovely work, quiet explorers!」→「Nice work, quiet explorers!」、L516・L538 の teacherScript「Lovely!」→「Great!」、L502 会話「What a lovely name.」→「What a beautiful name.」
6. エマ先生 じぶんの 語りの「Ms. Emma says, / asks, / smiles.」→「I say, / I ask, / I smile.」、日本語「エマ先生「」→「わたし「」（L503・L505・L508・L509・L510。L490 の「And I say, Bravo!」／「わたし「ブラボー！」」と そろえた。W15-16 の 報告より）
7. L510「I think it will be a wonderful show. Please enjoy!」→「… Have fun!」（Please enjoy! は「たのしんで ください」の 直訳で 英語では いわない。lint stiff-phrase。学校の 表現・say・字幕・スライド。日本語は そのまま）
8. L490 の さいごの あいさつ「That's all for today. See you!」→「That's it for today. See you!」（lint stiff-phrase）。ニュースの きまり文句「That's all for today's weather.」は 学習項目で、ほんものの 天気よほうの いいかた なので のこした
9. L510 の teacherScript「speed TPR」→「speed challenge」（W13-16 と おなじ）
10. あとの そろえ（グループの 報告から）:
    - **AI かいわの さいしょの ひとこと「Hi! I'm Ms. Emma.」→ ほんとうの かいわ あいて**（L489・L500・L501・L511〜540 の 33 レッスン）。アプリは かいわ あいてに エマ先生を えらばない（src/lib/conversation/engine.ts の pickConversationPartner）ので、ハルくんたちが「I'm Ms. Emma.」と いって しまって いた。さいごの「Next, talk with X!」の X に した（L501-510 の グループの 報告。partner.ts で アプリと おなじ 関数を つかって たしかめた）
    - L504 の かいわ あいては ビリモ なのに、ひとことが ゲストの「Hi! I'm Luka.」だった（ルカは アプリの かいわ あいてに なれない）→「Hi! I'm Birimo. Let's make a promise, like Luka! I'll call you tomorrow. What time is good for you?」、goalJa「ルカと」→「ビリモと」
    - L483「key chain」→「keychain」（L528・ワールド16 L459 と そろえた。lint inconsistent-form。アメリカで ふつうの かきかた）
    - TURE の 音の かきかた「cher」→「chur」（L506・L508・L510。TTS が 名前の Cher と よむ。L488・L489 は グループで chur に した）
    - L481・L484 の 音節の よみ: グループが「Ob, ser, vay, shun」「Ih, ma, jih, nay, shun」と 音で かいたが、lint の spelling error に なり 字幕にも 出るので、この ブロックの「DI-no-saur」「Vol-CA-no」と おなじ ハイフンの かたち「Ob-ser-va-tion」「Im-ag-i-na-tion」に した

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L483 ことば「key chain」→「keychain」
- L483 表現「I'm going to give her this key chain.」→「I'm going to give her this keychain.」
- L484 表現「Okay. Maybe next time!」→「OK. Maybe next time!」
- L510 表現「I think it will be a wonderful show. Please enjoy!」→「I think it will be a wonderful show. Have fun!」
- L523 表現「Speak softly, please. ― Okay.」→「Speak softly, please. ― OK.」

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- L485 の 13 語の 会話の 文（lint warn 1）
- 「Well done!」（L504・L530・L532）は アメリカでも ふつう
- 「That's all for today's weather.」（L490 の 学習項目。天気よほうの きまり文句）
- 「zhun」（-sion の 音。L486・L490・L495・L506）: へんだが ブロックで そろって いるので のこした。TTS の よみかたの ヒントで 決める
- L488「fifteen degrees」（せっし。アメリカの こどもには さむく きこえるが、日本の こども むけ なので のこした）
- phonics.tipJa の「ブロック1 の まとめ:」（L485・L490・L495・L505）: 1人の 指摘。まちがいでは ないので のこした
- 学習項目: L522 TPR「Get ready, set, go!」（ふつうは Ready, set, go!）、L533「untidy」（ふつうは messy）。まちがいでは なく ID が かわるので のこした
- 「Valley Museum / valley museum」「Valley Zoo / valley zoo」の 大文字の ゆれ（L514・L517）、teacherScript「l, y」と スライド「L Y」の ゆれ（L521〜524）
- まとめの「You can say X and Y」の ことばを ならべる 文（L522・L526・L528・L529）: よめるので のこした（ながすぎる ものは グループで 2つの 文に わけた）
- わざと まちがえた かたち（beautifuler・colorfuler・more far の クイズ）、「very, very」（lint info）
- ほかの ワールドで みつけた もの: AI かいわの「Hi! I'm Ms. Emma.」（W19 いこうも あるか しらべる）、まとめの「, and you can ～」で 12 語を こえる 文

## レビュアーの メモ（グループごと・英語）
