
## REVIEW: ワールド37・38（レッスン 1081〜1140）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・teacherScript・testPoints を 60 レッスン ぜんぶ 見なおした（ステージ5〈おとぎの迷宮。物語の くみたて・たとえ・仮定法・過去完了〉と〈こころの高原。気持ち・共感・あやまる・せっとく・インタビュー〉）
- さきに ブロックの きめごと（イギリスふうの ほめことば・エマ先生 じぶんの 語りを I say / I ask / I ～ に〈teacherScript も〉・エマ先生の Good morning / Good evening → Hi・AI の さいしょの ひとこと 48 レッスンを「Let's pretend I'm ～.」に・AI の あいてが goalJa と ちがった 5 レッスン）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがい（じじつ・物語の くいちがい・文法・きまりの せつめい）だけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た ものを ブロック全体で そろえた（count on の 強勢〈src/lib/curriculum/w38Phonics.ts も〉、日本語の あいさつを「やあ、みんな！」に）
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいて・文法の じゅんばんと きんしの ことば（テストが 見ない teacher.segments も）を たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W37-38.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 1081 --to 1140`）: **まえ error 0 / warn 91 / info 25 → あと error 0 / warn 91 / info 26**（のこりの warn は ぜんぶ わざと: ローワンおばあさんの 牧羊犬の なまえ「Biscuit」50、語りの「間」を ならう レッスンの「…」と その スライド・タイトル「I Wish I Could…」39〈L1101 で 声に 出して いた「pause」を「…」に した ぶん 1 ふえた〉、L1095 core〈テストの 正規表現で きまった 23 語〉2。L1103 の AI の ひとことの 25 語は 2つに わけて きえた。info は whisper・glance の せつめいの「very, very」・会話の「I am / it is / What is」・Let's 4回〈Let's pretend の ため〉）
- なおした 欄 **454**（パッチ 480 件: ブロックの きめごと 115・AI の ひとこと と まとめの なまえ 68・レビュアー 279・あとの そろえ 18）、なおした レッスン **60 / 60**
- 学習項目が かわった もの: **2つ**（L1137 ことば post → mail〈アメリカ英語〉、L1118・L1120 phonics.sounds count‿ON → COUNT‿on と src の sound の せつめい）。テストには どれも 書かれて いない

### before → after の 例
1. L1123 seg3（objective・文法）: 「Oh, I wish I didn't do that.」→「Oh, I shouldn't have done that.」（すぎた ことの こうかいは 過去完了か should have。この レッスンで ならう かたちで、日本語「しなければ よかった」とも あう）
2. L1089 seg7（objective・物語の くいちがい）: 「Birimo pushes it. Creak! The old door slowly opened.」→「Nib pushes it. Birimo says, Creak! The old door slowly opened.」（teacherScript では ドアを おすのは ニブ）
3. L1106 seg7（A+B・物語）: 「…gently hummed to a frightened baby goat. Why did he change his mind?」→「…baby goat. Up in his tower, the king heard the song. Why did he change his mind?」（he が だれか わからず、歌が 王さまに とどいて いなかった）

### きめた こと
- **AI の さいしょの ひとこと**: こどもの キャラが ニブ・サフラン・ねがいの 泉・ペル・ウィラおばあさん・オオカミ・パフ・ローワンおばあさん・ブラムさん などとして 話して いた。goalJa の やくは のこし、48 レッスンを「Let's pretend I'm ～.」で ごっこあそびに した（W25-36 と おなじ）
- **AI の あいてを goalJa に あわせた**: goalJa が「AI の キコ / ビリモ」なのに アプリが べつの こどもを 出して いた 5 レッスン（L1116・L1117・L1118・L1132・L1139）。アプリは ひとことに なまえの 出た こどもを えらばない ので、ほかの こどもの なまえを しぜんに 入れ（「Even Birimo covered his ears!」「Haru and Riko say I'll be fine」など）、まとめの「Next, go and talk with ～!」も あわせた。src は かえて いない
- **count on の 強勢**: L1118・L1120 と w38Phonics.ts は「on を つよく」だったが、count on は 動詞＋前置詞で つよいのは count（You can COUNT on me）。open UP・calm DOWN・cheer UP（句動詞の 副詞）は のこした
- **声に 出す ための なおし**: たんどくの 字の かたまり（ive・ous・ful・ly・er）を 字の 読みあげに（TTS は「Ive」を「I've」と 読む）、つくった つづり（Fru, s, tra, ted・Oyd・Fyoo, ree, us・Haaa・Sssizzle）を ハイフンの 拍や ほんものの ことばに、「Squee!」→「Squeak!」、「then BIG!」→「then big!」（L1091〜1095）、話す 人の ない こたえに「Kiko says,」などを つけた
- **アメリカ英語**: post → mail、postman → mail carrier、filled in → filled out、puts up his hand → raises his hand、a little cross → with a frown、after a long think → after thinking hard、Good day → Hi
- 物語の くいちがい: L1089 ドアを おす 人、L1103 アドバイスを した のは リコ、L1109 しつもん した のは ハル、L1124「Did it hurt? — Just a little」、L1126 目ざましの 時こく、L1128 スピーチの 日、L1138 農家の 人と 郵便屋さん。あんぜん: L1121 パフの 本の「The fog here is not dangerous」を とった（ほんとうの 山の きりで まねしない ように）
- のこした こと: タイトルと 語りの 間の「…」、「Biscuit」、say の 大文字の 強勢（UP・DOWN・TURN など。TTS で きいて たしかめたい）、teacherScript の「-ly」「, pause,」の 書きかた、L1089・L1090 の「Creeeak」、L1134 core の シングル クォート（テストで きまって いる）。くわしくは W37-38.md

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
- npm run curriculum:check: 索引は 最新
