# run9 英語レビュー: ワールド7・8（レッスン 181〜240）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 181 --to 240`）: **まえ error 0 / warn 70 / info 12 → あと error 0 / warn 5 / info 9**（まえ: timetable 63・文が ながい 6・thumbs up の ゆれ 1。あと: のこった warn 5 は L232「We have a station, but we don't have an airport.」3 か所と L235「We don't have a zoo, but we have a farm.」2 か所の 10 語。but で つなぐ ことが この 2レッスンの ねらいなので のこした。info は very, very 4〈おはなしの なかなので OK〉・yen の 文 3〈ねだんの れんしゅう〉・L194 is not 1・L239「Please listen to my speech.」1〈スピーチの はじめの きまり文句〉）
- なおした 欄: **501**（パッチ 526 件。共通の 機械的な なおし 56・ブロックの きめごと 107〈99 欄〉・レビュアー 252・あとの そろえ 111。おなじ 欄が 2回 なおった ものが あるので 合計は 一致しない）＋ L239 の `phonics.sounds` に「/ʊ/」を 1つ たした。なおした レッスン: **58 / 60**（L201・L202 だけ 変更なし）
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）

## 共通の きめごと（ブロック全体）
1. 2択クイズの 日本語字幕「My name is Haru.？ それとも Nice to meet you, too.？」→ 英語がわの 記号だけ のこす。日本語の なかの「I want a new bike.。」「P.E.。」の ような 2重の 記号も おなじ（W01-06 と おなじ）
2. 話しことばの 2択: 「Yes, I can. Or, No, I can't.」→「Yes, I can. Or no, I can't.」、「What do you do? Or, Thank you for your time?」→「… Or thank you for your time?」。英語字幕の「A. or B.」は「A / B」。「He can... or She can...」は say では「He can... or she can...」（「...」の あとは 文が つづくので 小文字）、字幕は「He can... / She can...」
3. **timetable → schedule**（イギリスの ことば。lint の 63 warn）。L191〜195・L207 の ぜんぶ（「timetable designers」→「schedule designers」も）。**L192 の ことば・L195 の 表現・TPR の ID が かわる**。L195 の タイトル「My Dream Timetable」→「My Dream Schedule」（content/curriculum/titles.json・docs/curriculum-plan.md も）
4. **L239 フォニックス「football」→「cookbook」**（アメリカでは football は アメフト。おなじ oo の「ウ」で 2つに わけられる ことば。vowelTeams.ts に ある）。「Foot, ball. Football!」→「Cook, book. Cookbook!」、tipJa の「foot-ball」も。`phonics.sounds` に cookbook の「/ʊ/」が なかったので たした（football の ときから ぬけて いた）。curriculum-plan.md も
5. 「Give a thumbs up.」→「Give a thumbs-up.」（L200・L209 の TPR。名詞は ハイフン。L224・L88・L133 と そろえた。lint の ゆれ）
6. イギリスふうの ほめことば: 「Brilliant!」（L184・L199・L214・L232）→「Awesome! / Fantastic! / Perfect! / Way to go!」、「Brilliant thinking!」（L193）→「Great thinking!」、「Lovely manners!」（L206）→「Great manners!」、L196「Splendid!」→「Awesome!」、L236「a lovely speech」→「a wonderful speech」
7. 「It's show time!」→「It's showtime!」（L210。アメリカの つづり。L180 と おなじ）
8. 先生の 日本語字幕の 書きだし「みんな、やあ！」「みんな やあ！」→「やあ、みんな！」（「やあ、しらべ チームの みんな！」なども。W05-06 と おなじ）
9. あとの そろえ: 文の なかの「Now, Point to Monday.」「Now, Play the recorder.」→「Now, point … / Now, play …」（say と 英語字幕 108 欄。TPR の 項目と スライドは 大文字の まま）
10. L188 の titleJa「1にち、2にち、3にち」→「ついたち、ふつか、みっか」（1にち は「いちにち」と よめて、ひづけに ならない。seg1 の 字幕も おなじ。titles.json も）
11. 先生の 説明で 文型を コンマで ならべる 言いかた（「Do you have, a subject, on, a day?」「You can, then an action word」）は、こえに だすと 文に ならないので、見本の 文や「"I have" ＋ ことば」の ように 引用符で くくった（W05-06 の L142 と おなじ）
12. つぎの 時間を きめつける「きのう」「あしたは」（L209・L210・L232・L240）→「まえの レッスン」「つぎは」（L72・L150 と おなじ）

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L188 TPR「First, raise your hand.」「Second, touch your nose.」「Third, sit down.」→「First in line, raise your hand.」「Second in line, touch your nose.」「Third in line, sit down.」（A+B。英語で「First, ～」は「まず ～」の いみに なり、「1ばんめの ひと」に ならない。スピード チャレンジでは じゅんばんも ばらばら）
- L192 ことば「timetable」→「schedule」
- L195 表現「This is my dream timetable.」→「This is my dream schedule.」、TPR「Show your timetable.」→「Show your schedule.」
- L200 TPR・L209 TPR「Give a thumbs up.」→「Give a thumbs-up.」
- L239 フォニックス「football」→「cookbook」

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- L232・L235 の but の 文（10 語。ステージ1 の めやす 8 語を こえるが、but で 2つを つなぐ ことが ねらい）。L232 の aiTask だけ「in our town」を けずって みじかく した
- 「Grade 5 show」（アメリカでは fifth-grade show）: ワールド4・7〜11 に 37 か所。表現・スライドの ID にも なって いるので ブロックでは かえず、全体で 決める
- 「Now, Point …」の 大文字: ワールド9 いこうにも 1,000 か所 いじょう ある。それぞれの ブロックで おなじ きまりで なおす
- L217「And you, Ms. Emma?」: レストランで 順番に 注文を きく ときの「And you?」は ふつうなので のこした（W03-04 の「And you?」は あいさつの へんじ）
- クイズの 質問の「Is he a baker, or a farmer?」の コンマ: 全体で 決める
- フォニックスの 音の わけかた（「tr, ai, n」「m, oo, n」）を TTS が 文字の 名前で よむ おそれ: ブロック全体の 型なので のこした。L220 の「O, O says oo or u」（u が「ユー」に きこえる）だけ なおした
- 「Road Cafe」（Café でなくても アメリカで ふつう）、L185「exchange」、L186「Stand up for your month.」、L201〜210 の「Knead the bread.」「railway」、L230 TPR「Give a big hand.」、漢字の「母音」: 1人だけの 指摘 or ID なので のこした
- exports/teacher/summary.csv の L188 titleJa は 書きだしの ファイルなので `npm run teacher:export` で 作りなおす ときに かわる

## レビュアーの メモ（グループごと・英語）
