# run9 英語レビュー: ワールド25・26（レッスン 721〜780）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 721 --to 780`）: **まえ error 1 / warn 210 / info 18 → あと error 1 / warn 171 / info 18**（まえの warn: Okay・okay 37・「…」「?!」など 163・小文字 4・L757 の「I'm exciting」6。あとの のこりは ぜんぶ わざと: 「…」「?!」と L778 ストーリーサークルの 1語ずつの 行〈ワールド26 は セリフの くとうてん「…」= ながい ま、「Really?!」= びっくり を ならう。タイトル「The Answer Is…」「Suddenly…」「Luckily…」と フォニックスの 表も テストで きまって いる〉、L757 の error 1・warn 6 は ビリモの「I'm exciting, too!」〈レッスンで なおす わざとの まちがい〉）
- なおした 欄: **347**（パッチ 366 件。機械的な なおし 27・ブロックの きめごと 76・AI の さいしょの ひとこと 19・レビュアー 217・あとの そろえ 27）。なおした レッスン: **57 / 60**（L747・L758・L759 は なおす ところ なし）
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w2526/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号 → 英語がわの 記号だけ のこす（クイズの えらびや ならべた セリフ 13 か所）
2. 話しことばの「Say, It's white. Or, It's round.」「Answer, Yes, I am. Or, No, I'm not.」→「… Or it's round.」「… Or no, I'm not.」（L729・L738〜L741・L743、L737 の teacherScript。2つの 例で クイズの えらびでは ないので、英語字幕も say と おなじ）
3. 「okay / Okay」→「OK」（ぜんぶで 50 欄 いじょう）。L751・L778 の フォニックスの ことば「Okay!」「Well, okay…」→「OK!」「Well, OK…」に あわせて、src/lib/curriculum/w26Phonics.ts の 表の キーと focus、tests/phonics-w26.test.ts の 1行も なおした（W21-22 の L654 と おなじ やりかた）
4. イギリスふうの ほめことば: 「Brilliant!」→「Fantastic!」（L721・L744・L765）、「Brilliant thinking!」→「Great thinking!」（L727）、「Brilliant, detectives!」→「Great job, detectives!」（L732）、「Lovely」→「Great」（L763）
5. ことばの せつめいの「A person who ～ / The people who ～」→ ふつうの 文（L734 witness・L742 thief・L748 guard・L750 と L767 audience・L752 actor・L754 judge・L761 narrator。関係代名詞は ステージ4。あとで L731 clue・L739 monkey の「a thing / an animal that ～」も）
6. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに「Hi! I'm Lulu the rabbit.」「Hoo! I'm Mr. Hoot.」など べつの なまえで なのって いた（L733・L752・L761〜L780 の 19 レッスン）。goalJa は「AI の ルル」「AI の フートさん」と やくを きめて いるので やくは のこし、「Let's pretend I'm Mr. Hoot.」と ごっこあそびだと わかる ように した（2つめの Let's が かさなる ところは けずった）。L756 は グループが おなじ かたちに。partner.ts も「Let's pretend I'm X」を みる ように した
7. あとの そろえ（グループの 報告から。20-after.json）:
   - TTS が「I've」と よむ かも しれない たんどくの「ive」→「I, V, E」（L726〜L730。ワールド26 の「I N G」と おなじ かんがえ。L745〜L750 は グループが「Detect, detective」のような ことばの ペアに した）
   - エマ先生の あいさつの「Good morning / Good evening」→「Hi / Hello」（L732・L742・L753。こどもが いつ べんきょう するか わからない。日本語も「こんにちは」）、L757 の AI の「Tonight」→「Today」（L757 の 台本と おなじ）
   - L731「Clue. A small thing that helps you find the answer.」→「Clue. It helps you find the answer.」、L739「A funny animal that climbs trees.」→「A funny animal. It climbs trees.」

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L751 フォニックス「Okay!」→「OK!」、「Well, okay…」→「Well, OK…」、L778 フォニックス「Well, okay…」→「Well, OK…」（src/lib/curriculum/w26Phonics.ts と tests/phonics-w26.test.ts を なおした）
- 表現・ことば・TPR・タイトルは かえて いない

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- 「…」「?!」（ワールド26 の まなびの 中心。lint warn 162）、L757「I'm exciting, too!」、ワールド26 の 大文字の 強勢（YOUR・OPEN・FOUND）、L731〜L734 の「FOOT, print」など 大文字の まるごとの ことば（ほんとうの ことば なので TTS も よめる）
- ワールド26 の「Ing is the thing that makes me feel it.」（-ed / -ing の きまった せつめい。テストの 関係代名詞の きまりの 外。1グループだけの 指摘）
- L764「the door was locked」と L774「opened the gate」（どちらも テストで きまって いる）、L767「at the back」（テストの 表現。アメリカでも つかう）
- L774・L780 の スピード TPR の たんどくの「Bow!」（声優 1人だけ）
- ストーリーの なかの「yesterday」（L732 の おうかんは きのう きえた、が 物語の きまり）、L740・L750 の ポスターの「Tonight at seven」（読みものの なか）、L742 AI の「last night」（AI の おはなし）

## レビュアーの メモ（グループごと・英語）
