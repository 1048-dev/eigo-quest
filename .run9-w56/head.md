# run9 英語レビュー: ワールド5・6（レッスン 121〜180）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 121 --to 180`）: **まえ error 0 / warn 3 / info 10 → あと error 0 / warn 0 / info 9**（まえ: L123・L161 の 文が ながい 2、L133「thumbs up」の ゆれ 1、L161 の Please ～ info 1。あと: のこった info は Let's の かず 9 レッスン〈L127〜130・L134・L135・L142・L147・L150。ねらいの 表現（Let's play ～. など）なので のこす〉）
- なおした 欄: **434**（パッチ 445 件。共通の 機械的な なおし 155・ブロックの きめごと 11 欄・レビュアー 252・あとの そろえ 25。おなじ 欄が 2回 なおった ものが あるので 合計は 一致しない）、なおした レッスン: **59 / 60**（L130 だけ 変更なし）
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。グループごとに スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあい（40〜70%）も たしかめた

## 共通の きめごと（ブロック全体）
1. 2択クイズの 英語字幕「Sorry. or Yes, let's!」→「Sorry. / Yes, let's!」（W01-04 と おなじ）。日本語字幕の「Sorry.？ Yes, let's!？」も「Sorry. / Yes, let's!」
2. 話しことばの 2択: 「Yes, I do. or No, I don't.」→「Yes, I do. Or no, I don't.」、「Good morning? Or, Good afternoon?」→「Good morning? Or good afternoon?」（Or の あとの コンマと 文の なかの 大文字を とる。W03-04 の きめごと 3。I・P.E.・人の 名前は 大文字の まま）。字幕の「A? Or, B?」も おなじ
3. 日本語の なかの 英語: 「Good night.、」「Wake up!。」「Good night.！」の ような 2重の 記号は 英語がわだけ のこし、あとに 日本語が つづく ときは スペース
4. L133 TPR「Give a thumbs up.」→「Give a thumbs-up.」（名詞は ハイフン。L88・L179 と そろえた。lint の ゆれ）。**学習項目 ID が かわる**
5. イギリスふうの ほめことば「Brilliant!」（L129・L158・L162）→「Awesome! / Perfect! / Way to go!」（W01-04 と おなじ）
6. クイズの こたえで 質問を くりかえす とき「How many cherries!」（L158）→「?」（W03-04 の きめごと 8）。L180 の 2つめの 選択肢「I'm nervous...?」の よけいな「?」を とった
7. あとの そろえ: チャイムの 音「Ding, dong!」→「Ding-dong!」（L136・L169・L177。W03-04・W07 と おなじ。L150 は グループで なおした）、「It's show time!」→「It's showtime!」（L180。アメリカの つづり）、先生の 日本語字幕の 書きだし「みんな、やあ！」→「やあ、みんな！」（7 レッスン。L124・L127・L129 と おなじ 自然な ならび）
8. L145 の タイトル「Stationery Swap」→「Sharing School Supplies」（A+B。stationery は かたくて イギリスより、swap は「とりかえる」で、レッスンの「かしかり」と ちがう）。content/curriculum/titles.json・docs/curriculum-plan.md も あわせた。L156「Lunch at the Café」は アメリカでも ふつうの つづりなので のこした

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L133 TPR「Give a thumbs up.」→「Give a thumbs-up.」
- L147 TPR「Take a rest.」→「Take a break.」（A+B+C。こどもが 休けいで いうのは take a break。会話・スライド・字幕も あわせた）
- L149 TPR「Pack your pencil case.」→「Put your pencil case in your bag.」（A+B。pack は「ふでばこに つめる」に きこえる。日本語と 動作は「かばんに いれる」）
- L166 フォニックス「tube」→「huge」（objective+A。アメリカでは tube は /tuːb/「トゥーブ」で、u_e「ユー」の なかまに ならない）
- L175 表現「Once upon a time, I'm a little cat.」→「Once upon a time... I'm a little cat.」（A+B+C。むかしむかしと いまの 形を コンマで つなぐと 文が へん。「...」で ひと呼吸 おいて ごっこあそびに。L174 の aiTask も おなじ 形）

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- 「lunch time」（L137・L177 など。アメリカの 辞書は lunchtime）: ことばの ID で、bath time / snack time と ならべて 教えて いるので のこした。ワールド2・9・10 にも ある。全体で 決める
- L157 の ことば「jelly」（ゼリー。アメリカでは ジャムに きこえる。ふつうは Jell-O だが 会社の 名前なので つかえない）・「pudding」（プリン）: ワールド1 にも ある ID。全体で 決める
- 「small letter / It's a small b.」（アメリカの 先生は lowercase と いう ことが おおい）: ことばの ID なので のこした
- L164「teachers' room」（アメリカでは teachers' lounge）: ことばの ID なので のこした（1人）
- フォニックスの 音の わけかた「St, a, mp」「He, lp」: TTS が「Saint」や 文字の 名前で よむ おそれ。ブロック全体の 型なので のこし、L177 の silent e だけ なおした（くわしくは L141-150 の メモ）
- L170 の `phonics.sounds`「/juː/」と tune（アメリカでは /uː/）: 構造の 欄なので のこし、先生の 説明だけ「ユー か ウー」に した
- L173 で /ɒ/ → /ɑ/ に した。ワールド1（4 か所）・34（2 か所）にも /ɒ/ が ある。それぞれの ブロックで なおす
- 「My day」の 場面で いま している ことを 現在形で いう（It's eight o'clock. I go to school.）: ステージ1 の 文型なので のこした
- L123 TPR「Put your hands together.」（アメリカでは「はくしゅ」に きこえる。1人・ID）
- 漢字の「大きな」「母音」: ワールド5・6 の なかで ゆれて いる。L154・L160 の TPR だけ ひらがなに した

## 変更一覧（before → after）

