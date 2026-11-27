
## REVIEW: ワールド15・16（レッスン 421〜480）の ネイティブ品質レビュー（2026-11-27）

### やった こと
- docs/run9/BRIEF.md の やりかたで、学校の 表現・ことば・TPR・フォニックスの ことば・会話と aiTask・まとめ・先生の 台本（say・字幕・スライド）・teacherScript・testPoints を 60 レッスン ぜんぶ 見なおした
- さきに 機械的な なおし（2重の 文末記号・2択の 字幕と say）と ブロックの きめごと（Okay → OK・thumbs-up・イギリスふうの ほめことば・Ding-dong・「Now, / Then, / First,」の あとの 小文字・Yesterday → Last time・speed TPR → speed challenge・L431 football → classroom）を あて、そのあと 10 レッスンずつ 6 グループで 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決めた。2人 いじょうの 指摘か 客観的な まちがいだけ、いちばん 小さく なおした
- さいごに、グループの 報告で「ほかにも ある」と 出た ものを ブロック全体で そろえた（過去形の よびかた「むかしの かたち」→「すぎた かたち」、「did の あとは ed なし」→「もとの かたち」、y の 音の「yeh」→「yuh」、まとめの なかの「First, then, and Finally」の 小文字）
- 変更は ぜんぶ パッチ（レッスン・欄・before・after）で、before が いまの 値と あう ときだけ あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証・台本の 長さ（180〜240 秒）・英語の わりあいも たしかめた（ALL OK）。くわしい 一覧と レビュアーの メモ: **docs/run9/changes/W15-16.md**
- 60 レッスンに `"reviewed": "run9"` を つけた
- W13-14 から うつした 機械的な なおしの 道具に バグが あった（「We're... or I'm...」が「or i'm...」に なる）。なおしてから つかった

### 数
- lint（`npm run english:lint -- --from 421 --to 480`）: **まえ error 0 / warn 102 / info 8 → あと error 0 / warn 1 / info 5**（まえの warn は Okay・okay 93・football 7・thumbs up の ゆれ 1・ながい 文 1。のこりの warn 1 は L466 の おはなしの 13 語の 文〈but で つなぐ 文で、こどもが 言う 文では ない〉なので のこす。info は「What is」「Please read more!」など）
- なおした 欄 **586**（パッチ 657 件: 機械的な なおし 48・ブロックの きめごと 337・レビュアー 239・あとの そろえ 33。重なり あり）、なおした レッスン **60 / 60**
- 学習項目 ID が かわった もの 3つ: L431 フォニックス「football」→「classroom」、L473 TPR「Give a thumbs up.」→「Give a thumbs-up.」、L473 表現「Are you okay now? ― Yes, I'm fine.」→「Are you OK now? ― Yes, I'm fine.」（この 3項目だけ 記録が あたらしく なる）

### before → after の 例
1. L462 ポイント（A・B）: 「And for was, ask with were. Were you scared?」→「And with you, use were. Were you scared?」（「was の しつもんは were で」は まちがいの きまり。おなじ レッスンで「Was it a ghost?」と きいて いる。日本語も「you の ときは were を つかうよ」）
2. L458 会話（A・B）: 「I didn't know the answer, either.」→「Hmm. I don't know the answer.」（なぞなぞが まだ とけて いない ときに、過去形と either を つかって いた。ねらいの「I didn't know the answer.」は 表現・スライド・まとめに のこした）
3. L431 フォニックス（objective・lint）: 「Foot plus ball, football!」→「Class plus room, classroom!」（サッカーの レッスンで football は イギリスの いいかた。tipJa・スライド・テストも あわせた）

### きめた こと
- 過去形の よびかたは「すぎた かたち」に そろえた（ワールド16 で もう 30 回、W17〜31 も おなじ。「むかし」は「ずっと まえ」の いみ）。さいしょは「むかしの かたち」も 27 回 あるので のこす つもりで L451-460 の グループの パッチを はずしたが、L471-480 の グループも べつべつに おなじ 指摘を したので、あとの そろえで ブロック全体を そろえた
- football は 会話に 出ない フォニックスの ことばなので、おなじ 複合語の classroom に した（phonics-w15 の テストも なおした）
- のこした こと: 学習項目の「treasure box」「Show me surprised.」「Speak loudly.」「Blow it up high.」（まちがいでは なく ID が かわる）、「Well done!」、tipJa の「重ねる」、「かれ・かのじょ」、L466 の 13 語の 文。くわしくは W15-16.md
- ほかの ワールドで みつけた もの: エマ先生 じぶんの 語りの「Ms. Emma says / asks」（W17・W20・W26〜40）、world-24「Show time!」、world-40「むかしは」（それぞれの ブロックで なおす）

### チェック
- npx tsc --noEmit: OK
- npx vitest run: 81 ファイル・2,622 件 OK
- npx next build: OK
- npm run curriculum:check: 索引は 最新
