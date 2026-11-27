# run9 英語レビュー: ワールド27・28（レッスン 781〜840）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 781 --to 840`）: **まえ error 0 / warn 60 / info 8 → あと error 0 / warn 32 / info 8**（まえの warn: autumn・football の uk-word 23・okay 4・「…」と おわりの 記号 32・stiff「What's your hobby」1。あとの のこりは ぜんぶ わざと: 会話・スライドの「…」〈ためらい・ま〉と タイトル「I Think… Because…」〈テストで きまって いる〉、てがみの むすび「Your friend, Kiko」「― Your friend, Haru」、L795 しゅみの レッスンの「What's your hobby?」）
- なおした 欄: **446**（パッチ 472 件。機械的な なおし 6・ブロックの きめごと 154・AI の さいしょの ひとこと 56・レビュアー 228・あとの そろえ 28）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w2728/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. 話しことばの「Say, A. Or, B.」→「Or b.」（L781・L782・L786 と L786 の teacherScript）
2. 「okay」→「OK」（L823・L833）、「autumn / Autumn」→「fall / Fall」（L818・L821・L838）、「football」→「soccer」（L837。日本語は もともと サッカー）、「pen friend」→「pen pal」・「ペンフレンド」→「ペンパル」（L808。L826 と W21 は もともと pen pal）
3. イギリスふうの ほめことば: 「Brilliant!」→「Fantastic! / Great job!」（L788・L797・L802・L814）、「Lovely work!」→「Great work!」（L818・L836。グループで L785・L804 の「Lovely!」も）
4. エマ先生 じぶんの 語りの「Ms. Emma says / asks」→「I say / I ask」、日本語「エマ先生「」→「わたし「」（18 レッスン。グループで「Ms. Emma smiles / gives / takes / tells」なども「I ～」に）
5. エマ先生の あいさつの「Good morning / Good evening, everyone!」→「Hi / Hello, everyone!」・日本語「やあ / こんにちは」（L782・L786・L787・L791・L794・L797・L806・L813・L818・L824。ものがたりの じかんは つぎの 文に のこる）
6. 「A person who / A small thing that / All the people who / someone who」→ ふつうの 文（L820 guide・L828 clue・L834 audience・L810「Think of a helper in your life.」。関係代名詞は ステージ4）
7. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに「I'm Granny Capy.」「It's Toto.」「Moi!（アイノ として）」など べつの 人で 話して いた（56 レッスン）。goalJa が やくを きめて いるので やくは のこし、「Let's pretend I'm Granny Capy / Dr. Fern / Toto / Iris / Aino / Amara / Mateo / Leo / Ms. Emma / your pen pal / Sleepy Squirrel.」で ごっこあそびだと わかる ように した（W25-26 と おなじ）。あさの あいさつ「Good morning」は「Hi / Hello」に、2つめの Let's は We can に。L783・L785・L790 は ひとことが だれでも いえる ので、goalJa の「AI の エマ先生」を ほんとうの あいて（キコ・キコ・リコ）に した
8. あとの そろえ（グループの 報告から。20-after.json）:
   - ch = k の いいかたを「The C H makes a k sound.」に そろえた（L795・L800・L806・L808・L810。たんどくの「k」は TTS が「ケイ」と よむ かも しれない。L781〜L785 は グループが おなじ かたちに）
   - karaoke の 英語の よみを「carry-OH-key」に そろえた（L818・L840。2つの グループが べつの つづりに して いた。日本語の ヒント「キャリオウキ」と あう）
   - つながる 音の ふりかえり（L835 meet-chu・L836 could-joo・L839 aw-low-ver）を もとの レッスン（L826・L829）の つづりに そろえた。「Aw-lover」は lover と よまれるので グループが なおした
   - scripts/english-words.txt の 音の つづりに「ver」を たした（aw-low-ver。先生の 台本・字幕だけで ゆるす）

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L808 ことば「pen friend」→「pen pal」
- L818 表現「When is the best time to visit? ― I think autumn is the best. The leaves turn red.」→「… I think fall is the best. …」（aiTask の targetExpressions・まとめ・スライドも あわせた）
- テスト・src の 変更は なし（テストは どちらの 文字も みて いない）

## のこした こと（1人だけの 指摘・テストで きまって いる・あとで 決める）
- 会話と スライドの「…」、タイトル「I Think… Because…」、てがみの むすびの おわりの 記号なし、L795「What's your hobby?」（しゅみの レッスン）
- L815 core「In both countries, people celebrate New Year.」（アメリカでは New Year's が ふつう だが テストで きまって いる）、L827 core「I've made this for you.」（アメリカでは I made が ふつう だが テストで きまって いる）、L792 core「What have you done for a long time?」（テスト）
- L793 ことば「foot spring」（アメリカなら foot bath。学習項目で 8か所 あり、1グループだけの 指摘）、L801 TPR「Hold your hands.」、L810「half past ten」
- 「VI-ta-min」（L811 ほか。フォニックスの sounds「VI」と あわせて いる）、「Pi-AN-o」「SU-shi」などの 大文字の 音節、たんどくの「Bow!」（L811・L819）。TTS で きいて たしかめたい もの
- L792「Riko, that was lovely!」・L781「What a lovely village!」（キャラの ことば。アメリカでも つかう）、L784 ファーン先生の「Tell Ms. Emma if you feel worse.」（ほかの 人の ことば）、L796・L802・L832・L834 の goalJa の「エマ先生（AI）」（ひとことが「Let's pretend I'm Ms. Emma.」なので あう）
- ゲストの あいさつ「Moi! / Jambo! / Hola!」（ほんとうの ことば）

## レビュアーの メモ（グループごと・英語）
