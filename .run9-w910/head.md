# run9 英語レビュー: ワールド9・10（レッスン 241〜300）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- とちゅうで 止まって いた ブロック（auto-save の 時点では 共通の なおし 00・01 だけ あたって いて、L251〜300 の グループの パッチ 11〜15 は 書いて あるのに あたって いなかった。L241〜250 は メモも パッチも なかった）。さいごの しあげで L241〜250 を レビューし、11〜15 を「before が いまの 値と おなじ ときだけ」で あてた（はずれ 0）
- lint（`npm run english:lint -- --from 241 --to 300`）: **まえ error 0 / warn 22 / info 10 → あと error 0 / warn 5 / info 7**（まえ: UK の ことば 13〈autumn・Brilliant など〉・文が ながい 9。あと: のこった warn 5 は ステージ1 の 会話の 9〜11 語の 文〈L248「I sometimes read books in the library after lunch.」・L252「Why do you want to go to Egypt, Haru?」・L264 aiTask・L266・L292〉。どれも レッスンの 文型に 時・ばしょ・なまえが ついた もので、1人しか 指摘して いないので のこした）
- なおした 欄: **624**（パッチ 640 件。共通の 機械的な なおし 9・ブロックの きめごと 252・レビュアー 377・あとの そろえ 2。おなじ 欄が 2回 なおった ものが あるので 合計は 一致しない）。なおした レッスン: **60 / 60**
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. 2択クイズの 日本語字幕の 2重の 記号・英語字幕の「A. or B.」→「A / B」・話しことばの「A... Or B...」（W01-08 と おなじ）
2. **autumn → faucet / launch**（イギリスの ことば）。L292 の au の フォニックスの ことば autumn → faucet（じゃぐち。Save Water の テーマに あう）、L298 の ふりかえり autumn → launch。**フォニックスの 学習項目の ID が かわる**
3. 名詞の「thumbs up」→「thumbs-up」（L274 の TPR の ID が かわる。かけ声の「Thumbs up!」は そのまま）
4. イギリスふうの ほめことば「Brilliant!」→ Awesome! / Fantastic! / Perfect! / Way to go!、「What lovely diaries!」→「What great diaries!」
5. show time → showtime、Ding, dong! → Ding-dong!、文の なかの「Now, Point」→「Now, point」（TPR の 項目と スライドは 大文字の まま）
6. 日本語: 「みんな、やあ！」→「やあ、みんな！」、「きのうは」「あしたは ボスせん」→「まえの レッスンでは」「つぎは ボスせん」（まいにち やるとは かぎらない）
7. 先生の「Here's the point.」と さいごの まとめで、文型を コンマで ならべる 文（「Answer with I want to go to, and a country.」）は 引用符で くくった 見本の 文に（W07-08 の L142・L181 と おなじ。6 グループ ぜんぶで いちばん 多い なおし）
8. あとの そろえ: L278 の「It's lunch time!」→「It's lunchtime!」（L248・L250 と おなじ）
