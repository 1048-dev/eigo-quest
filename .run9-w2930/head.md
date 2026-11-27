# run9 英語レビュー: ワールド29・30（レッスン 841〜900）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校・中学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 841 --to 900`）: **まえ error 0 / warn 15 / info 9 → あと error 0 / warn 14 / info 5**（まえの warn: 「…」14・stiff「Please enjoy」1。あとの のこりは ぜんぶ わざと: タイトル「I Think So Because…」「I See Your Point, But…」「So You Mean…」「In 2050…」と その スライド〈テストで きまって いる〉、会話の「…」〈ためらい・ま〉。info は 会話の「What is」2 と「Let's」4回の レッスン 3〈L854「Let's vote」・L855 など 学習項目〉）
- なおした 欄: **436**（パッチ 453 件。機械的な なおし 2・ブロックの きめごと 78・AI の さいしょの ひとこと 60・レビュアー 268・あとの そろえ 45）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w2930/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. 話しことばの「Yes, exactly. Or, Not quite.」→「Or not quite.」（L857）
2. イギリスふうの ほめことば: 「Brilliant!」→「Great job! / Fantastic!」（L844・L845・L858・L864・L874・L894）、「Lovely work!」→「Great work!」（L846・L859）、「Lovely!」→「Great! / Nice!」（L846・L862）、「What a lovely tour!」→「What a great tour!」（L869）
3. エマ先生 じぶんの 語りの「Ms. Emma says / asks / explains / has a plan」→「I say / I ask / I explain / I have a plan」、日本語「エマ先生「」→「わたし「」（L847・L855・L862・L868・L882・L886・L887）
4. エマ先生の あいさつの「Good morning / Good evening」→「Hi / Hello」・日本語「やあ / こんにちは」（L843・L857・L859・L860・L873・L895）
5. ノバの カタカナを「ノバ」に そろえた（L891〜L900 は「ノヴァ」だった。30 か所）
6. **AI の さいしょの ひとこと**: アプリは あいてを こどもの キャラ（ハル・リコ・キコ・ビリモ）から えらび、その かおと なまえで ひとことを 出す。なのに 60 レッスン ぜんぶが「I'm Captain Pell.」「I'm Nova.」「Ahoy!」「Beep!」など べつの 人として 話して いた。goalJa が やくを きめて いるので やくは のこし、「Let's pretend I'm Captain Pell / Gus / Gale / Pip / Nova / Ms. Lin / Tess / a robot teacher from the future.」で ごっこあそびだと わかる ように した（W25-28 と おなじ）。L877 は goalJa の とおり ノバに した。2つめの Let's は「Time for / It's time for / We can」に、lint の info（that is・I am・Please show me）も ついでに なおした
7. あとの そろえ（グループの 報告から。20-after.json）:
   - 「Your turn! Maybe, ～」→「Your turn! You could say, ～」（W30 の 38 欄。W29 は グループが おなじ かたちに。Maybe, だと こどもが じぶんの 文に じしんが ない ように きこえる）
   - L882 energetic の 声の 音節「en-er-GET-ic」→「en-er-JET-ic」（g は やわらかい 音。L898 と おなじ。かく 音節の 表 w30Phonics.ts と tipJa は つづりの ままで のこした）
   - L871「many years later」→「many years from now」（これからの ことなので）
   - L875 看板の「Please enjoy both kinds of trees!」→「Enjoy both kinds of trees!」（lint stiff-phrase）
8. グループで ブロック全体に あてた もの: ワールド29 の ことばの せつめいに のこって いた 関係代名詞（「Someone who helps」「An animal that lives」「A toy that spins」など。テストの 正規表現は segments を みない）と、W30 で ならう まえの L871〜L875 の「A machine that ～」「The person who drives」を ふつうの 文に。-ic の 強勢を「e, LEC, tric」の コンマ区切りから「e-LEC-tric」に（L881〜L900）

## 学習項目 ID が かわった もの
- なし（表現・ことば・TPR・フォニックスの ことば・タイトルは かえて いない。テスト・src の 変更も なし）

## のこした こと（1人だけの 指摘・テストで きまって いる・あとで 決める）
- タイトルと スライドの「…」、会話の「…」
- 「before ic」「Words that end in ic」の たんどくの ic（TTS が「アイ・シー」と よむか きいて たしかめたい）、強勢の「SO」「DO」（L851〜L855。文字で よまれないか きいて たしかめたい）
- 弱形の つづりの ゆれ（teacherScript の「fur」「un」と segments の「fer」「n」。1グループだけ）
- L863 core「I read it on a note at the harbor.」の read（TTS が「リード」と よむ かも しれないが 学習項目）
- L867 ことば「holiday」（「やすみの 日」の いみで アメリカでも つかう。summer vacation は べつに ある）、L900「World 30 Invention Expo」、「Say thank you with a bow」（W19 と おなじ TPR）、「Ahoy!」「shipshape」「Beep!」

## レビュアーの メモ（グループごと・英語）
