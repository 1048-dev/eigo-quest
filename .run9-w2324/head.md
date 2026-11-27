# run9 英語レビュー: ワールド23・24（レッスン 661〜720）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 661 --to 720`）: **まえ error 0 / warn 23 / info 18 → あと error 0 / warn 1 / info 18**（まえの warn: okay 6・autumn 4・L702 timetable 12・L714 の 16 語の 文 1。あとの warn 1: L714 会話の「I want to go to the museum, the tower, the garden, the palace and the market!」〈5つの ばしょを ならべるのが「ぜんぶは むり」の りゆう なので わざと〉。info は「Very, very」「What is」「sweets」など）
- なおした 欄: **331**（パッチ 339 件。機械的な なおし 21・ブロックの きめごと 85・レビュアー 222・あとの そろえ 11）。なおした レッスン: **53 / 60**（L673・L676・L691・L697・L703・L708・L714 は なおす ところ なし）
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w2324/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号 → 英語がわの 記号だけ のこす（L696・L699 の 5 か所）
2. 話しことばの「Answer, Yes, it does. Or, No, it doesn't.」→「… Or no, it doesn't.」（L674・L680・L693・L696・L716・L719。2つの こたえの 例で クイズの えらびでは ないので、英語字幕も say と おなじ。W15-16 の「Or no, she doesn't.」と おなじ かたち）。teacherScript の おなじ かたち（L696・L698・L699・L718）は あとの そろえで
3. 「okay」→「OK」（6 か所）
4. イギリスふうの ほめことば: 「Brilliant!」→「Fantastic!」（L667・L677・L683・L693・L699・L706・L711）、「Brilliant thinking!」→「Great thinking!」（L671）、「Lovely blogging!」→「Great blogging!」（L716）
5. 「Now, Water it ～」など TPR の 指示 → 小文字（L681〜690 の 40 欄）。L705「Then, Don't worry. I'll help you.」は 引用の こたえ なので 大文字の まま
6. autumn → fall（L678・L683 の 台本「in the fall」、L675「Leaves fall in autumn.」→「Leaves fall from the trees.」〈fall が 2つの いみで ぶつかる ため〉。L678 の 文の はじめの「In autumn」は グループが なおした）
7. L702 の ことば「timetable」→「schedule」（アメリカ英語。ことば・台本・会話・スライド ぜんぶ。world 34 で timetable を イギリスの ことばとして ならう ので あう）
8. 「Ding, dong!」→「Ding-dong!」（L694・L695。W13-22 と おなじ）
9. あとの そろえ（グループの 報告から。20-after.json）:
   - teacherScript の「Or, No, I haven't.」など → 「Or no, ～」（L696・L698・L699・L718）
   - 「who」を つかう 説明 → ふつうの 文（L661「Scientists ask questions about nature and find answers.」、L670「The people watching and listening.」。関係代名詞は ステージ4。L701 は グループが なおした）
   - L690 ことばの「Present.」→「To present. … Let's present!」（たんどくの Present. は 名詞「プレゼント」と よまれる かも。L665 の record と おなじ なおしかた）
   - L716 の 日本語字幕「がっこうめい」→「がっこうの なまえ」の グループの なおし（2 パッチ）は **とりけした**。tests/teacher.test.ts が 台本に「がっこうの なまえ」を 入れない ように して いる（がっこうの なまえを きく 文に きこえない ため）ので、もとの いいかたは わざと

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L702 ことば「timetable」→「schedule」
- L711 表現「It takes about thirty minutes by underground.」→「… by subway.」（名詞の underground は イギリスふう。L711・L713・L715 の「by underground / take the underground」も subway に。テストが つかう「Take the underground line to the museum.」と ことば・フォニックスの underground は のこした）
- テストや src で これらを さして いる ところは なし

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- lint warn 1（L714 の 16 語の 会話の 文）
- **大文字の 音節**（L671〜675「strong on PHO / TOG」、L691〜695・L716〜720「CAN, a, da」「Hok, KAI, do」「IT, a, ly」など）: この せかいの 強勢の 学習の 中心で、2つの グループが「いえの きまり」として のこした。「IT」「AF」「NA」などを TTS が 文字で よむ かは、いちど きいて たしかめる と よい。L672・L690 の「SCI-en-tist」「EN-er-gy」は グループが ふつうの はくの かたちに した
- L710「I'm going to the sea.」（アメリカでは the beach / the ocean が ふつう）: tests/curriculum.test.ts が もとめる 文なので のこした
- L719「How long does it take to go home?」（to get home の ほうが しぜん。1人だけ）
- 「Well done!」「Thumbs up!」「Very, very」（lint info）、L717「sweets」、L718「Ciao!」

## レビュアーの メモ（グループごと・英語）
