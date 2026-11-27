
## REVIEW: ワールド39・40（レッスン 1141〜1200）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・teacherScript・testPoints を 60 レッスン ぜんぶ 見なおした（ステージ5〈せかいの円卓。せかいの 課題・立場・ディベート・解決策・子ども会議・意見文〉と〈はじまりの星。6 年間の ふりかえり・ポートフォリオ・面接・ゆめ・ありがとう・卒業〉。これで 1,200 レッスン ぜんぶの さいご）
- さきに ブロックの きめごと（イギリスふうの ほめことば・アメリカ英語〈summer holidays・football・Year 1・Okay〉・エマ先生 じぶんの 語りを I say / I ask / I ～ に〈teacherScript 36 レッスンも〉・エマ先生の Good morning / Good evening → Hi・AI の さいしょの ひとこと 60 レッスン ぜんぶを「Let's pretend I'm ～.」に）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがい（じじつ・物語の くいちがい・文法・きまりの せつめい）だけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た ものを ブロック全体で そろえた（however の 強勢〈src/lib/curriculum/w39Phonics.ts も〉、ランタン・光が ともる 文の 時制）
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、HEAD から じゅんばんに あてなおした（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいて・文法の じゅんばん・きんしの ことば・団体や 試験の なまえ（テストが 見ない teacher.segments も）を たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W39-40.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 1141 --to 1200`）: **まえ error 0 / warn 51 / info 11 → あと error 0 / warn 21 / info 12**（へった 30 は summer holidays 21・football 1・Year 1 1・Okay 6・23 語の 文 1。のこりの warn は ぜんぶ わざと: テストで きまった タイトルの「…」と その スライド 13、L1184 の かんがえる 間「Let me see…」6、書きかたの ゆれ「bow and say, Thank you」1。info は 会話の「What is / is not」、Let's 4回〈L1168〉と L1196〈core が Let's ～〉、面接の「Please sit down.」など）
- なおした 欄 **534**（パッチ 574 件: ブロックの きめごと 131・AI の ひとこと 60・レビュアー 373・あとの そろえ 10）、なおした レッスン **60 / 60**
- 学習項目が かわった もの: **3つ**（L1154 ことば・表現 summer holidays → summer vacation、L1187 表現 at university → at a university〈どちらも アメリカ英語・core ではない〉、L1156・L1160 phonics.sounds HOWever → howEVer と w39Phonics.ts の say と せつめい）。テストには どれも 書かれて いない

### before → after の 例
1. L1149 teacherScript（objective・物語の くいちがい）: 「Riko tries it. It seems that more people are recycling.」→「Haru tries again. It seems that more people are recycling.」（会話と seg7 では、言いすぎて なおすのは ハル）
2. L1156・L1160 phonics（objective・強勢）: 「HOWever, pause」→「howEVer, pause」（however は 2つめの 音節が つよい。「はじめを つよく」の せつめいも moreOver・as a reSULT に あわないので「大文字の ところを つよく」に）
3. L1191 seg7（objective・時制）: 「That means, if you were not here, I couldn't do it!」→「That means, I did it because you were there to help!」（I couldn't have done it without you は すぎた ことの 話。いまの ことの 文に なって いた。日本語も あわせた）

### きめた こと
- **AI の さいしょの ひとこと**: 60 レッスン ぜんぶ、こどもの キャラが オービット・サム・アミナ・プリヤ・マテオ・リアム・ナディア・セレスト・エマ先生（面接官）などとして 話して いた。goalJa の やくは のこし、「Let's pretend I'm ～.」で ごっこあそびに した（W25-38 と おなじ。エマ先生の やくは W27-28 の「Let's pretend I'm Ms. Emma.」と おなじ）。こどもの なまえは ひとことに 入れて いない ので、アプリの えらぶ あいてと まとめの「Next, go and talk with ～!」は かわらない（partner.ts で たしかめた）
- **話す 人の ない セリフ**: うごきの あとの こどもの セリフが エマ先生の 声に きこえる ところに「and says,」「Kiko says,」を つけた（6 グループ ぜんぶ。いちばん 多い なおし）
- **声に 出す ための なおし**: 字の かたまり（ion・ation・al・ow・ai・er・ful・ly など）を 字の 読みあげか ほんものの ことばに、L1199「Make FU strong」→「Make the start of future strong」、L1180「Bow.」→「Bow, like wow!」、Lead・Tear の 読みわけ
- **じじつ・物語**: L1151 ルールの ばんごう、L1161「Time's up!」（2 分より まえに おわった）→「Done!」、L1177「every continent」→「all over the world」（南極の いすは 空いて いる）、L1183・L1185 セリフの 話し手、L1197「the oldest words in storytelling」→「the most famous」、L1198 プリヤも リコも アジア なので「another continent」→「far away」、L1188 パイロットは「control tower」と 話す、ペンパルは「おうちの 人と いっしょに」さがす、L1147 best-before → best-by、日本語の セレステ → セレスト・たいよう → うみ など
- のこした こと: テストで きまった L1141 core「Children from every continent sit at this table.」（南極の いすは 空き。かえる なら テストと いっしょに）、「wonky veggie box」（アメリカでも つかう。かわりの ugly は きんしの ことば）、「tap」、say の 大文字の 強勢と スピーチの 間の「pause」、こどもが さけぶ「The Ray of ～ lit up!」。くわしくは W39-40.md

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
- npm run curriculum:check: 索引は 最新
