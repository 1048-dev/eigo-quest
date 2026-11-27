
## REVIEW: ワールド21・22（レッスン 601〜660）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・teacherScript・testPoints を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（「A. Or, B.」）と ブロックの きめごと（Okay → OK・「Now, ～」の あとの TPR の 小文字・イギリスふうの ほめことば〈Lovely・Brilliant〉・L612 タイトルの「…」→「...」・toilet → bathroom・「むかしの かたち」→「すぎた かたち」）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た ものを ブロック全体で たしかめて そろえた（AI かいわの なのりかた、Ding-dong、L647・L603 の TPR、L643 の 大文字の 音節）
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあい・かいわ あいても たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W21-22.md**
- 60 レッスンに `"reviewed": "run9"` を つけた

### 数
- lint（`npm run english:lint -- --from 601 --to 660`）: **まえ error 0 / warn 56 / info 9 → あと error 0 / warn 8 / info 7**（まえの warn は Okay・okay 46・「…」2・てがみの むすび 2・that's all for today 6。のこりの warn 8 は L623 の てがみの むすび「Best wishes, Riko」「Love, Kiko」〈記号を つけないのが ただしい〉と L644 の おはなしの「But that's all for today!」・クイズの まちがいの えらびかた〈わざと〉。info は「Very, very」「What is」など）
- なおした 欄 **385**（パッチ 397 件: 機械的な なおし 4・ブロックの きめごと 104・レビュアー 260・あとの そろえ 29）、なおした レッスン **59 / 60**（L646 は なし）
- 学習項目 ID が かわった もの 3つ: L603 TPR「Hold up one finger and say, Wait.」、L647 TPR「Pretend to run away.」、L654 フォニックス「Are you OK」（src/lib/curriculum/w22Phonics.ts の 表の キーと tests/phonics-w22.test.ts も なおした）。L612 タイトルの「…」→「...」に あわせて titles.json を なおした

### before → after の 例
1. L622 音の じかん（B・C）: 「Checki-tout! Picki-tup! Thinka-bou-tit!」→「Check-it-out! Pick-it-up! Think-about-it!」（つくった つづりを TTS が へんに よみ、さいごは 声に だすと よくない ことばに きこえる。L621・L623・L624 の「Holdon / Leeva / Signin」なども おなじ かたちに した）
2. L651 フォニックス（objective）: 「Who's there? Your voice goes up.」→「… Your voice goes down.」（Who・Where の しつもんは 下がる。L652・L654・L655 と、L651 の やじるしと スライドも あわせた）
3. L607 会話（A・B）: 「We can only see your ears!」→「We can't see your face!」（みみが みえるなら カメラは ついて いるので、クイズの こたえ「Can you turn on your camera?」と あわなかった。スライド・クイズ・日本語も あわせた）

### きめた こと
- AI かいわの さいしょの ひとことで なのる なまえは、グループが「This is X」に したが、アプリは「I'm X」いがいで なまえが 出た キャラを あいてから はずすので、べつの キャラが えらばれて しまった。なまえを いわない 文に した（L605・L606・L611・L612）。アプリの しくみ（engine.ts）は かえない
- L624 の 台本の「home address / where I live / おうちの ばしょ」は のこした（グループの「address / じゅうしょ」への なおし 6 件は とりけし）。tests/teacher.test.ts が 台本に「your address」「じゅうしょ」を 入れない ように して いる（じゅうしょを きく 文に きこえない ため）
- 「bird post」（world 21 の ことば・L628 タイトル）は この せかいの なまえ なので のこした（かえる なら bird mail で まとめて）
- のこした こと: L623 てがみの むすび、L644「that's all for today」、「Wipe your tears.」（TTS の よみ）、「Tur-non / Ist!」、おはなしの なかの「this week」、「Well done!」。くわしくは W21-22.md
- ほかの ワールドで みつけた もの: partner.ts は「I'm X」しか みないので「This is X / It's me, X / call me X」の なのりも みる ひつようが ある（この ブロックの partner.ts は アプリと おなじ きまりで たしかめた）、つなげて いう 音の つくった つづり（Holdon など）、大文字の 音節（GI-ant など）、Wh の しつもんの やじるし「↗」

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
- npm run curriculum:check: 索引は 最新
