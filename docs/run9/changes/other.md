# run9 英語レビュー: レッスン いがいの 英語（P-other）

- 日付: 2026-11-27
- はんい: としょかんの おはなし 100 話（stories-1〜5.json）・うた / チャンツ 28 曲（chants.json）・AI フリートークの テーマ 11（talk.json。lines は AI が つかえない ときの 台本）・力だめし ステージ1〜5（content/yearly/stage-*.json）・AI かいわの フォールバック台本と システムプロンプト・まとめ動画の テンプレート・エマ先生の 自動台本・英語の UI 文字列・メール / LINE の テンプレート（src）
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=読みあげる 声優）を べつべつに 書いて から 決める。2人 いじょうの 指摘か 客観的な まちがい（文法・つづり・じじつ・物語の くいちがい・こたえが 0 か 2つ ある 問題・英語と 日本語の くいちがい）だけ、いちばん 小さく なおした。6 つの グループ（おはなし 1・2 / 3 / 4 / 5、チャンツ＋トーク、力だめし）に わけて レビューし、src は まとめ役が 見た
- lint（`npm run english:lint -- --library --yearly`）: **まえ error 2 / warn 90 / info 32 → あと error 0 / warn 2 / info 19**（のこりの warn は わざと: s2-13 の 手紙の むすび「From, Kiko of today」〈おわりの 記号なし〉、t-dream「I want to be a writer because I love stories.」〈because を つかう テーマの お手本で 10 語〉）。結果は docs/run9/lint/library+yearly.md
- なおした 欄: **240**（おはなし 1・2: 47 / 3: 42 / 4: 40 / 5: 28、チャンツ＋トーク: 42、力だめし: 36、src: 5）
- `"reviewed": "run9"`: おはなし 100 話・チャンツ 28・トーク 11 の それぞれと、力だめし 5 ファイルの いちばん 上に つけた（型・検証・索引づくりは よけいな 欄を むしする ことを たしかめた）
- 学習項目: words・targetExpressions・こたえの ばんごう・ids・unlockLesson・力だめしの keywords / minWords / 音読の 文は かえて いない。かわったのは 問題文と えらぶ 文の ことばづかい（s1-01・s1-05・s3-09・s3-19・s4-01・s4-06・s4-16・s5-19 など。こたえは どれも 1つ）、y4-s3 の お手本の こたえ（24 語・keywords ぜんぶ あり）、src の GENERIC_CONVERSATION の 目標表現「I'm fine.」→「I'm good.」
- としょかんの 索引 content/library/index.json は `npm run library:index` で つくりなおした（語数が かわった ため）

## としょかん おはなし ステージ1・2（content/library/stories-1.json・stories-2.json）
- lint まえ → あと: error 0 / warn 19 / info 7 → error 0 / warn 1 / info 2（のこりの warn は s2-13 の てがみの むすび「From, Kiko of today」。てがみの サインなので おわりの 記号を つけないのが ふつう。info は s1-07「is not sad now」の くらべの 強調と、s2-16 の おはなしの「very, very long ears」で わざと）
- なおした 欄: 47（items 23 / total 40）。40 話 すべてに `"reviewed": "run9"`（rules.ts・buildIndex.ts は よけいな フィールドを 見ないので だいじょうぶ）
- words・選択肢・answer は かえていない。本文の 語数が かわったので index.json の wordCount が ずれる（coordinator が library:index を 実行）

### 変更一覧
| id | 欄 | before | after | reviewers | りゆう |
|---|---|---|---|---|---|
| s1-01 | questions[1].q | How is Birimo first? | How does Birimo feel at first? | A B | 英語として ふしぜん・いみが あいまい |
| s1-05 | lines[6].en | "That's okay! Let's share!" says Riko. | "That's OK! Let's share!" says Riko. | lint | OK に そろえる |
| s1-05 | questions[0].q | What is the weather? | How's the weather? | A B | ネイティブは What is the weather? と いわない |
| s1-05 | questions[1].qJa | キコは なにを もってきた？ | キコは なにを もっている？ | B | 英語（have）と 本文の 日本語に あわせる |
| s1-07 | lines[2].en | "What do you want, pig?" asks Kiko. | "What do you want, Mr. Pig?" asks Kiko. | A B | 「pig」だけで よぶと わるくちに きこえる。日本語「ぶたさん」と あわせる |
| s1-07 | lines[7].en | "Thank you! I am a cool pig!" | "Thank you! I'm a cool pig!" | A C | セリフは 短縮形が しぜん |
| s1-11 | lines[1].en | "What's this? Here is a hint." | "What's this? Here's a hint." | A C | セリフは 短縮形が しぜん |
| s1-14 | lines[2].en | It's lunch time! | It's lunchtime! | A C | 米語の つづりは 1語 |
| s1-16 | lines[7].en | Riko draws a picture of Haru with the new pencils. | Riko draws Haru with the new pencils. | lint A B | ステージ1 は 8語まで（10語）。Q3 の こたえは そのまま |
| s1-17 | lines[0].en / ja | A traveler has a big bag and a map. / おおきな かばんと… | A traveler has a bag and a map. / かばんと… | lint B | 8語まで（9語） |
| s1-17 | lines[7].en | …"You are very kind." | …"You're very kind." | A C | セリフは 短縮形 |
| s1-18 | lines[1].en | "I went to my grandma's house by the sea." | "I went to Grandma's house by the sea." | lint A | 8語まで（9語）。米語で ふつうの いいかた |
| s1-19 | lines[8].en / ja | That day, they picked up trash on the beach. / その日、…ひろいました。 | Then they pick up trash on the beach. / それから、…ひろいます。 | lint A B | 8語まで（9語）、本文は 現在形 なのに さいごだけ 過去形 |
| s1-20 | lines[2].en / ja | Riko says, "I want to be a vet, because I love animals." / …だいすきだから。 | Riko says, "I want to be a vet. I love animals." / …だいすきなの。 | lint B C | 8語まで（12語）。ハル・キコの 行と おなじ 形に。because は さいごの 行に のこる |
| s1-20 | lines[7].en / ja | "Because English is fun, and I want to share it!" / …たのしいから、… | "Because English is fun! I want to share it!" / …たのしいから！ … | lint C | 8語まで（10語）。Why? への こたえは Because ～! が しぜん |
| s2-03 | lines[0].en | Today is Job Day at the port town. | Today is Job Day in the port town. | A B | まちには in |
| s2-06 | lines[0].en | It's a windy day on the meadow. | It's a windy day in the meadow. | A B | meadow は in |
| s2-06 | lines[6].en | Wait. What is Birimo doing? | Wait. What's Birimo doing? | A C | 短縮形 |
| s2-08 | lines[8].en | …It was a nice paper! | …It was nice paper! | 文法 | paper（かみ）は 数えない |
| s2-08 | lines[9].ja | それは ぼくたちの ちずでした！ | それは みんなの ちずでした！ | B | 語り手が いないのに「ぼくたち」。their に あわせる |
| s2-09 | lines[0].en / ja | Once upon a time, there was a stone fox in front of an old temple. / おてらの まえに | Once upon a time, a stone fox sat by an old temple. / おてらの そばに | lint B | ステージ2 は 12語まで（15語） |
| s2-10 | lines[0].en | Saturday, October 12th. | Saturday, October 12. | style | 米語の 日づけ（ガイド §7） |
| s2-10 | lines[1].en | Today we had a sports day at the ruins. | Today we had a field day at the ruins. | A B | sports day は イギリス。米国の 学校は field day |
| s2-11 | lines[5].en | …on the roof of the observatory. | …on the observatory roof. | lint C | 12語まで（13語） |
| s2-11 | lines[8].en | "What is your wish, Birimo?" | "What's your wish, Birimo?" | A C | 短縮形 |
| s2-12 | lines[3].en / ja | "It says it will be cloudy in the morning and sunny in the afternoon." / ごごは はれ | "It says it will be cloudy in the morning, then sunny." / それから はれ | lint C | 12語まで（14語） |
| s2-12 | lines[4].en | …for good weather and hangs it by the window. | …for good weather. He hangs it by the window. | lint C | 12語まで（14語）、2文に わけた |
| s2-12 | lines[6].en | The next morning, it is cloudy… | The next morning, it's cloudy… | A C | 短縮形 |
| s2-13 | lines[6].en / ja | I will practice English every day, so you can talk with people all over the world. / …はなせるから。 | I'll practice English every day. Then you can talk with people all over the world. / …はなせるよ。 | lint A C | 12語まで（16語）。Q3 は そのまま こたえられる |
| s2-13 | lines[7].en / ja | …The sky was full of stars. / いっぱい でした。 | …The sky is full of stars. / いっぱいだよ。 | 時制 | いま てんもんだいで 書いているので 現在形 |
| s2-14 | lines[5].en | The cedar shakes. It is too tall, … | The cedar shakes. It's too tall, … | A C | 短縮形 |
| s2-17 | lines[8].en | "It's okay. …" | "It's OK. …" | lint | OK に そろえる |
| s2-18 | lines[3].en | He makes the robot by using old boxes, … | He makes the robot with old boxes, … | lint A C | 12語まで（13語）、by using は かたい |
| s2-18 | lines[7].en / ja | …carries a bag of apples across the room. / へやの むこうまで | …carries a bag of apples. / （とった） | lint C | 12語まで（13語）。Q3 は そのまま |
| s2-19 | lines[4].en / ja | "I'd love to, but I have to help my mom at her shop on Saturday." / どようびは … | "I'd love to, but I have to help at my mom's shop." / （どようびは を とった） | lint C | 12語まで（15語）。Saturday は 1行目と Q1 に ある |
| s2-19 | lines[5].en | "That's okay. Maybe next time!" | "That's OK. Maybe next time!" | lint | OK に そろえる |
| s2-20 | lines[8].en | …the rain stops, and a rainbow appears over the sea. | …the rain stops. A rainbow appears over the sea. | lint C | 12語まで（13語）、2文に |

### のこした こと
- s2-13「From, Kiko of today」: 1行目「Dear Kiko of the future,」と ついに なる てがみの サイン。おわりの 記号を つけないのが ふつうなので warn は のこした。
- s1-07「The big pig is not sad now.」: 2行目「The pig is sad.」と くらべる 強調なので is not の まま（info）。
- s2-16「very, very long ears」: おはなしの おもしろさ。Q3 の 選択肢は「very long ears」で あう（info）。
- s1-15「What do you want?」（おみせで）: What would you like? の ほうが ていねいだが、ステージ1 の want を ならう 形なので のこした（B）。
- s2-05「one thousand two hundred yen」: twelve hundred が ふつうだが thousand を ならう ことばなので のこした。
- s2-09 いしの きつねは ふつう じんじゃだが、おてらにも あるので temple の まま。
- しつもんの 時制の ゆれ（s1-19・s2-16 で 本文は 現在形、しつもんは 過去形）は ふりかえりの しつもんとして しぜんなので のこした。

### レビュアーの メモ
#### s1-01 Hello, Birimo!
- A: "How is Birimo first?" isn't something a teacher says. B: ambiguous for kids; "feel" makes the target clear. C: story lines fine.
- Decision: fix Q2 only.
#### s1-02 Red, Blue, Yellow
- A: natural. B: one color per line, questions answerable. C: "up, up, up" good rhythm.
- Decision: no change.
#### s1-03 How Many Cats?
- A: fine. B: counting builds up 1→3→5, Q3 clear. C: counting line reads well.
- Decision: no change.
#### s1-04 Touch Your Nose!
- A: classic game, natural. B: body parts + his/her, one correct answer each. C: fine.
- Decision: no change.
#### s1-05 Picnic Day
- A: "What is the weather?" is textbook; "How's the weather?" B: same; qJa "もってきた" vs "have". C: fine.
- Decision: OK canonical, Q1 wording, Q2 qJa.
#### s1-06 Rain, Rain!
- A: natural. B: clear; "wet and cold" fair. C: "Splash, splash!" fun.
- Decision: no change.
#### s1-07 The Big Pig
- A: calling him "pig" sounds rude; "I am a cool pig" stiff. B: JA already ぶたさん. C: "I'm a cool pig" flows.
- Decision: Mr. Pig, I'm. Keep "is not sad" (contrast).
#### s1-08 Where Is My Hat?
- A: natural. B: "in the mirror" distractor is a little tempting but "on her head" is stated. C: repetition good.
- Decision: no change.
#### s1-09 The Bus to the Sea
- A/B/C: fine, "sea" repetition intended.
- Decision: no change.
#### s1-10 Hello from the World
- A: "Children" a bit formal but OK in a teacher's explanation. B: greetings correct. C: fine.
- Decision: no change.
#### s1-11 What Is This?
- A: "Here's a hint." C: contraction reads smoother. B: fine.
- Decision: Here's.
#### s1-12 Who Are You?
- A: "Who is it?" for an animal could be "What is it?", but it mirrors "Who are you?". B: fine. C: "Hoo, hoo!" good.
- Decision: no change.
#### s1-13 Birimo's Week
- A/B/C: clean day-by-day pattern.
- Decision: no change.
#### s1-14 What Time Is It?
- A: "lunchtime" is one word in US. C: same. B: fine.
- Decision: lunchtime.
#### s1-15 The Parfait Shop
- A: shopkeeper would say "What would you like?". B: keep "want" as the stage-1 pattern. C: food list reads well.
- Decision: no change (only A).
#### s1-16 A Birthday Present
- A: fine. B: last line 10 words > 8. C: shorter line is easier.
- Decision: shorten last line.
#### s1-17 Excuse Me, Where Is the Station?
- A: "You're very kind." B: line 1 9 words. C: contraction smoother.
- Decision: shorten line 1, You're.
#### s1-18 My Summer Vacation
- A: "Grandma's house" natural US. B: 9 words > 8. C: fine.
- Decision: Grandma's.
#### s1-19 Save the Sea Turtle
- A: tense jumps to past at the end. B: 9 words; keep present. C: fine.
- Decision: "Then they pick up trash on the beach."
#### s1-20 My Dream
- A: comma before because is non-standard. B: 12/10 words > 8; parallel with Haru/Kiko lines helps. C: "Because English is fun!" is the natural answer to "Why?".
- Decision: split both lines.
#### s2-01 The Lighthouse Keeper
- A: natural. B: usually/always routine clear, questions fine. C: good pacing.
- Decision: no change.
#### s2-02 Does Birimo Like Fish?
- A/B/C: natural Does ~? / Yes, he does. pattern.
- Decision: no change.
#### s2-03 Job Day
- A: "in the port town". B: same. C: fine.
- Decision: in.
#### s2-04 Stone Soup at the Market
- A/B/C: some/any clear, natural.
- Decision: no change.
#### s2-05 How Much Is It?
- A: "twelve hundred" more common but thousand is the target. B: math consistent (500 > 100). C: fine.
- Decision: no change.
#### s2-06 Look! It's Flying!
- A: "in the meadow"; "What's". B: "in" is the standard preposition. C: contraction.
- Decision: in, What's.
#### s2-07 Hide-and-Seek
- A/B/C: natural, behind/between clear.
- Decision: no change.
#### s2-08 The Lost Map
- A: "a nice paper" is a grammar error. B: JA ぼくたち has no narrator. C: fine.
- Decision: nice paper, みんなの.
#### s2-09 The Stone Fox
- A: fine. B: line 1 15 words > 12. C: shorter opening reads better.
- Decision: "a stone fox sat by an old temple."
#### s2-10 Riko's Diary
- A: US diary date has no "th"; "field day" not "sports day". B: US standard. C: fine.
- Decision: both.
#### s2-11 The Shooting Star Night
- A: "What's your wish". B: 13 words. C: "observatory roof" easier.
- Decision: both.
#### s2-12 Will It Rain Tomorrow?
- A: "it's". B: two lines 14 words. C: long lines hard to read aloud.
- Decision: shorten/split, it's.
#### s2-13 A Letter to the Future
- A: "The sky was" wrong tense while writing tonight. B: 16-word line. C: split reads better.
- Decision: split line 7, is. Keep sign-off.
#### s2-14 The Tallest Tree in the Valley
- A: "It's too tall". C: same. B: comparatives clear.
- Decision: It's.
#### s2-15 Mountains or the Sea?
- A/B/C: natural, opinions with reasons fit A2.
- Decision: no change.
#### s2-16 The Toy Machine
- A: "very, very" fine in storytelling. B: sequence words clear. C: fine.
- Decision: no change.
#### s2-17 You Have to Wait Your Turn
- A/B/C: natural; only OK canonical.
- Decision: OK.
#### s2-18 The Helping Robot
- A: "by using" stiff. B: two lines 13 words. C: shorter lines.
- Decision: with, drop "across the room".
#### s2-19 Would You Like to Come?
- A: fine. B: 15 words; Saturday repeated. C: shorter line easier.
- Decision: shorten, OK.
#### s2-20 If It Rains
- A: fine. B: 13 words. C: split gives a nice pause before the rainbow.
- Decision: split.
## としょかん ステージ3 の おはなし（content/library/stories-3.json）
- lint まえ → あと: error 0 / warn 21 / info 2 → error 0 / warn 0 / info 1（のこりの info は s3-14 の「So the waiting is boring, and I am bored?」。boring と bored を くらべる 強調なので わざと I am の まま）
- なおした 欄: 42（items 15 / total 20）。20 話 ぜんぶに "reviewed": "run9"
- 学習項目（words）の 変更は なし。questions は 文だけ 2つ（s3-09 Q2・s3-19 Q2）。choices・answer は そのまま
- 本文が かわったので content/library/index.json（wordCount ほか）は 古く なる → coordinator が npm run library:index を 実行

### 変更一覧
| id | 欄 | before | after | reviewers | りゆう |
|---|---|---|---|---|---|
| s3-02 | lines[4].ja | はを みがきながら、… | はを みがいて、… | B | EN は「みがいて、うたった」。ながら は EN に ない |
| s3-03 | lines[7].en/ja | After the call, Kiko told her mom, "Grandma said she couldn't hear me at first." | After the call, Kiko tells her mom, "At first, Grandma couldn't find the microphone button." | A B C | 物語の くいちがい（きこえなかったのは キコの ほう。おばあちゃんの マイクが オフ）。現在形の 物語に 時制を そろえた。16 語 → 14 語 |
| s3-03 | lines[10].en/ja | Mom laughed. / わらいました | Mom laughs. / わらいます | A B | 現在形の 物語に そろえた |
| s3-04 | lines[8].en | It is a little golden key! | It's a little golden key! | A C | contraction（info）。読みあげが 自然 |
| s3-06 | lines[9].en | …with all her friends, and they had a picnic with the giant. | …with all her friends. They had a picnic with the giant. | 機械 | 19 語 > 15 を 2文に |
| s3-07 | lines[4].en | …by the window, too, but she didn't give it any water. | …by the window, too. But she didn't give it any water. | 機械 | 16 語 > 15 を 2文に |
| s3-08 | lines[5].en | "Made in tells you … | "'Made in' tells you … | B C | ことばの なまえを クォートで しめす（Q2 と おなじ） |
| s3-08 | lines[9].en/ja | It was made by her hands. / おばあちゃんの てで あんだの | She made it by hand. / おばあちゃんが てで あんだの | A C | made by her hands は ふしぜん。by hand が ふつう |
| s3-09 | lines[5].en | "Where have you been, Riko?" | "Riko, what places have you been to?" | A B | Where have you been? は「どこに いってたの（おそいよ）」に きこえる。have been to を そのまま つかう |
| s3-09 | questions[1].q | Where has Riko been? | What places has Riko been to? | A B | 本文に あわせた（choices・answer は そのまま） |
| s3-12 | lines[0].en/ja | …found a stone door with words carved on it. | …found a stone door. There were words carved on it. | 機械 | 16 語 > 15 を 2文に |
| s3-12 | lines[9].ja | こたえは あしおとに ちがいない！ | こたえは「あしあと」に ちがいない！ | B | あしおと（音）は まちがい。footsteps＝あるいた あと |
| s3-13 | lines[11].en/ja | Next to it, a mother fox and two baby foxes were sleeping in its soft light. | A mother fox and two baby foxes were sleeping in its soft light. | 機械 | 16 語 > 15。JA は「ランタンの ひかり」で つながりを のこした |
| s3-15 | lines[0].en | …at the Echo Theater, and every seat is full. | …at the Echo Theater. Every seat is full. | 機械 | 16 語 > 15 を 2文に |
| s3-15 | lines[1].en | …checking the props: a paper moon, … | …checking the props. There's a paper moon, … | 機械 | 19 語 > 15 を 2文に |
| s3-15 | lines[6].en | They are painted with paint that glows in the dark. | They are covered in glow-in-the-dark paint. | A C | painted with paint の くりかえし。glow-in-the-dark は こどもの ことば |
| s3-15 | lines[12].en/ja | "That was the most interesting show I've ever seen," says an old man in the front row. | An old man in the front row smiles. "That was the most interesting show I've ever seen." | 機械 | 17 語 > 15。Q3 の most interesting は のこした |
| s3-16 | lines[12].en | …spoke all by itself: "Thank you for listening to me." | …spoke all by itself. "Thank you for listening to me." | 機械 | 21 語 > 15 を 2文に |
| s3-17 | lines[7].en/ja | Her shoulders feel a little softer. / かたが すこし かるく なりました | Her shoulders relax a little. / かたの ちからが すこし ぬけます | A B | feel softer は ふしぜん。JA も 現在形に |
| s3-18 | lines[1].en/ja | Their first interview is with two old women who run a tea shop together, Mrs. Hana and Mrs. Yuki. | Their first interview is with Mrs. Hana and Mrs. Yuki. They are two old friends who run a tea shop together. | 機械 A C | ほんとうは 18 語（Mrs. の ピリオドで lint が 見おとし）。さいごの 同格が わかりにくい |
| s3-18 | lines[8].en/ja | "One morning, I found a cup of warm tea on my desk at school, with a note that said, 'I miss you,'" says Mrs. Yuki. | "One morning, I found warm tea on my desk at school," says Mrs. Yuki. "There was a note with it. It said, 'I miss you.'" | 機械 C | 24 語 > 15。Q3（warm tea and a note）は そのまま あう |
| s3-18 | lines[10].en/ja | …," they say at the same time. | …," they both say. | 機械 | 16 語 > 15 |
| s3-19 | lines[1].en | …meet in the middle and give each other presents. | …meet in the middle. They'll give each other presents. | 機械 | 20 語 > 15 を 2文に |
| s3-19 | lines[13].en | …," said Haru, and they all gave each other a high five. | …," said Haru. They all gave each other high fives. | 機械 | 17 語 > 15 |
| s3-19 | questions[1].q | Why did Haru disagree with the gold paper? | Why did Haru disagree about the gold paper? | A B | disagree with は 人・考えに つかう |
| s3-20 | lines[0].en/ja | …shone in seven colors over the river. | …shone in seven colors. | 機械 | 17 語 > 15 |
| s3-20 | lines[6].en | …painted on it: a boy, two girls, … | …painted on it. There was a boy, two girls, … | 機械 | 24 語 > 15 を 2文に |
| s3-20 | lines[8].en/ja | "We saw you on the screen when …," said Lina, smiling. | Lina smiled. "We saw you on the screen when …" | 機械 | 18 語 > 15 |
| s3-20 | lines[12].en | …above the bridge, and the wind carried … | …above the bridge. The wind carried … | 機械 | 19 語 > 15（JA は もとから 2文） |
| s3-20 | lines[13].en | …," she said softly, "but friendship is … | …," she said softly. "But friendship is … | 機械 | 19 語 > 15 |

### のこした こと
- s3-14 lines[10]「and I am bored?」: boring / bored を くらべる 強調なので 短縮しない（info のみ）
- s3-02「You have a lovely voice.」: lovely は words の 学習語。アメリカでも ふつうに つかう（ほめことばの「Lovely!」とは ちがう）
- s3-11「I have bought you a small present.」: アメリカでは bought が ふつうだが、この 話は 現在完了の 練習なので のこした
- s3-15「We were frightened」: このあたりは -ed / -ing の 形容詞の テーマ。わざと
- s3-18「Mrs. Hana / Mrs. Yuki」: Ms. Emma と おなじく 名前に つける よびかた。物語の なかで 一貫しているので のこした
- index.json が 古く なるので tests/library.test.ts の「索引は 本文と 同じ」が 1件 失敗（予定どおり。npm run library:index で なおる）

### レビュアーの メモ
#### s3-01 He Said He Was Busy
- A: Natural; reported speech sounds like a real phone story.
- B: Reported speech is the focus and is clear; questions answerable.
- C: Reads well.
- Decision: no change.
#### s3-02 The Very Long Voice Message
- A: Fine. "lovely voice" OK in US.
- B: JA line 5 adds ながら (while) not in EN.
- C: Fine.
- Decision: JA fix only.
#### s3-03 Grandma's First Online Call
- A: "Grandma said she couldn't hear me" contradicts the scene (Kiko couldn't hear Grandma). Tense jumps to past.
- B: Story inconsistency confuses learners; mixed tense.
- C: Line 8 long with the quote.
- Decision: fix line 8 meaning + tense, Mom laughs.
#### s3-04 If I Find the Key
- A: "It is a little golden key!" reads stiff in an exciting moment.
- B: Fine.
- C: "It's" flows better.
- Decision: contract.
#### s3-05 Brave and Kind at Story Time
- A: Warm and natural.
- B: Level fits; questions clear.
- C: Fine.
- Decision: no change.
#### s3-06 The Book with an Empty Page
- A: Fine.
- B: Line 10 over length.
- C: Line 10 long breath.
- Decision: split.
#### s3-07 What Happens If a Plant Gets No Light?
- A: Science accurate (etiolated bean).
- B: Line 5 one word over.
- C: Split helps the "but" contrast.
- Decision: split.
#### s3-08 What Is It Made From?
- A: "made by her hands" odd; say "by hand".
- B: "Made in" as a term needs quotes.
- C: Quotes help read the term; "by her hands" clunky.
- Decision: two small fixes.
#### s3-09 Have You Ever Been on the Cloud Train?
- A: "Where have you been?" sounds like "Where were you?!"
- B: Ambiguous with the target "have been to"; question 2 same.
- C: Fine.
- Decision: "what places have you been to?" in line and Q2.
#### s3-10 I Left My Bag on the Train
- A: Natural.
- B: Clear; questions fair.
- C: Fine.
- Decision: no change.
#### s3-11 A Postcard from the Sky
- A: "I have bought you" a bit British, but it's the present-perfect focus.
- B: Keep for the grammar point.
- C: Fine.
- Decision: no change.
#### s3-12 The Riddle Doors
- A: Fine.
- B: JA あしおと is wrong for footsteps; line 1 over length.
- C: Line 1 long.
- Decision: split line 1, JA fix.
#### s3-13 Where Were You Last Night?
- A: Fine.
- B: Line 12 one over.
- C: Fine.
- Decision: drop "Next to it,".
#### s3-14 Bored or Boring?
- A: Natural teaching moment.
- B: Contrast clear; "I am bored" stress intended.
- C: Fine.
- Decision: no change.
#### s3-15 The Show in the Dark
- A: "painted with paint" repetitive.
- B: Three lines over length.
- C: "painted with paint" awkward to read.
- Decision: split 3 lines, glow-in-the-dark paint.
#### s3-16 The Theater That Wanted to Talk
- A: Fine.
- B: Line 13 over length.
- C: Colon before a quote is hard to voice.
- Decision: period before quote.
#### s3-17 Three Ways to Calm Down
- A: "shoulders feel softer" odd.
- B: "relax" clearer.
- C: Fine.
- Decision: "Her shoulders relax a little."
#### s3-18 How Long Have You Known Each Other?
- A: Appositive at end of line 2 is awkward.
- B: Lines 2, 9, 11 over length.
- C: Line 9 too long in one breath.
- Decision: split lines 2 and 9, shorten 11.
#### s3-19 Something to Wrap Them With
- A: "disagree with the gold paper" odd.
- B: Two lines over length; Q2 wording.
- C: Fine.
- Decision: split 2 lines, Q2 "about".
#### s3-20 Meeting in the Middle
- A: Natural, warm ending.
- B: Five lines over length.
- C: Long lines; split at natural pauses.
- Decision: split/shorten 5 lines.
## としょかん おはなし ステージ4（content/library/stories-4.json、s4-01〜s4-20）
- lint まえ → あと: error 0 / warn 11 / info 3 → error 0 / warn 0 / info 3（のこりの info: s4-08 lines[7]「but it is green」・s4-11 lines[6]「It is bigger」は 語りの 文で どちらでも しぜん。s4-16 lines[9]「Please wait here,」は 空港の しんさかんが おとなの エマ先生たちに いう ていねいな ことばで わざと）
- なおした 欄: 40（items 13 / total 20）。20話 すべてに `"reviewed": "run9"`（rules.ts・buildIndex.ts は よけいな 欄を みないので だいじょうぶ）

### 変更一覧
| id | 欄 | before | after | reviewers | りゆう |
|---|---|---|---|---|---|
| s4-01 | lines[4].en/ja | ...take care of the pet on holidays? / おやすみの ひは | ...during school vacations? / がっこうが やすみの あいだは | A,B（style guide） | holiday（がっこうの やすみ）→ vacation（アメリカ英語） |
| s4-01 | lines[8].en/ja | ...feed them on holidays. | ...feed them during vacations. | A,B | 同上 |
| s4-01 | questions[1].choices[1] | ...on holidays? | ...during school vacations? | — | 本文に あわせる |
| s4-01 | questions[2].choices[2] | Someone can feed them on holidays. | Someone can feed them during vacations. | — | 本文に あわせる |
| s4-03 | lines[10].en | "It's okay," | "It's OK," | lint | canonical OK |
| s4-04 | lines[7].en/ja | Good question! Extra electricity is saved... | Good question! On sunny days, extra electricity is saved... / はれの ひに あまった でんきは | A,B | 「雨の日は？」への こたえが つながらない（晴れの日に ためる、が ぬけていた） |
| s4-05 | lines[4].en/ja | "I can help you understand it, but you should... | "I can help you understand it," says Pip, "but you should... / …と ピップ。 | B,C | 話す 人の ない セリフ（ビリモの しつもんの すぐ あと で だれの こたえか わかりにくい） |
| s4-06 | lines[8].en/ja | ...too close to the reading place. | ...too close to the reading area. / ほんを よむ ばしょ | A,B | reading place / reading garden の ゆれ を reading area に そろえた |
| s4-06 | lines[10].en/ja | move the reading garden / よむ にわ | move the reading area / ほんを よむ ばしょ | A,B | 同上（物語の くいちがい） |
| s4-06 | lines[11].en | When they show the map to the city planners, one of them says, "..." | They show the map to the city planners. One of them says, "..." | lint,C | 20語 > 18 |
| s4-06 | questions[1].choices[1], questions[2].q/qJa | reading place / reading garden / よむ にわ | reading area / ほんを よむ ばしょ | — | 本文に あわせる（answer は そのまま） |
| s4-07 | lines[3].ja | はつめいかに よって よく されました | はつめいかが すこしずつ よく して いきました | 日本語 | 「よく される」が ふしぜん |
| s4-08 | lines[6].en/ja | ...grown tall and thin, and its leaves are pale yellow. | ...grown tall and thin. Its leaves are pale yellow. | lint,C | 19語 > 18 |
| s4-15 | lines[6].en | "It's okay. I'm Birimo. | "It's OK. I'm Birimo. | lint | canonical OK |
| s4-16 | lines[7].en | fill in the arrival card | fill out the arrival card | A,B | アメリカ英語は fill out |
| s4-16 | lines[9].en/ja | "Please wait here. Someone will... | "Please wait here," says the officer. "Someone will... / …と しんさかん。 | B,C | 話す 人の ない セリフ（しんさかんか スタッフか わからない） |
| s4-16 | lines[10].en | What would happen if it weren't found? | What would happen if nobody found it? | A,B,C | こどもの 口に しては かたい 受け身の 仮定法。仮定法は のこす |
| s4-16 | questions[2].q | ...if the passport weren't found? | ...if nobody found the passport? | — | 本文に あわせる |
| s4-17 | lines[8].en/ja | They said "Do you know where...?" | They said "Do you know where...?" and "Could you tell me where...?" | B（客観） | キコは「Could you tell me where...?」と きいたので 物語と くいちがい |
| s4-18 | lines[0].en/ja | ...for a week, and they have to do the chores themselves. | ...for a week. They have to do the chores themselves. | lint,C | 24語 > 18 |
| s4-18 | lines[10].en/ja | ...so they agree that he can cook twice a week if he also cleans the bathroom. | ...so they make a deal. He can cook twice a week if he also cleans the bathroom. | lint,C | 20語 > 18 |
| s4-19 | lines[11].en | ...a reading corner, too, so we've asked... | ...a reading corner, too. So we've asked... | lint,C | 20語 > 18（日本語は もともと 2文） |
| s4-20 | lines[0].en/ja | To say thank you, the friends decide to hold a small party for all the people who have helped them this year. | The friends want to say thank you to all the people who have helped them this year. So they decide to hold a small party. | lint,C | 22語 > 18 |
| s4-20 | lines[10].en | "That's okay," | "That's OK," | lint | canonical OK |
| s4-20 | lines[11].en | ...who have helped them: the desert guide, ... | ...who have helped them. There's the desert guide, ... | lint,C | 25語 > 18 |
| s4-20 | lines[14].en | ...she says, "and I can't wait... | ...she says. "I can't wait... | lint,C | 20語 > 18 |

### のこした こと
- words・answer の いち・行数・id・unlockLesson は かえていない。words の 見出し語は どれも かわっていない（holidays・reading garden・weren't は words に ない）。
- s4-01「school guard」（US では custodian も あるが ふつうに つうじる）、s4-06「walking stick」（cane より こどもに わかりやすい）、s4-02「His ears are shaking」は 好みの はんい なので のこした。
- s4-08 / s4-11 の contraction info は 語りの 文なので そのまま。
- content/library/index.json は wordCount が かわるので 古く なる（tests/library.test.ts の 索引テスト 1件が おちる。coordinator が `npm run library:index` を）。

### レビュアーの メモ
#### s4-01 I See Your Point, But...
- A: "on holidays" for school breaks is British; US kids say "over vacation / during school vacations".
- B: Opinion/reason language is clear; questions answerable. Q2/Q3 must follow the wording change.
- C: Reads well; "during school vacations" keeps the rhythm.
- Decision: holidays → (school) vacations in story + 2 choices.
#### s4-02 The Talking Stick
- A: Natural classroom scene. "His ears are shaking" slightly odd (twitching?), but fine for Birimo.
- B: take turns / what kind of introduced clearly.
- C: Fine.
- Decision: no change.
#### s4-03 Is It Really True?
- A: Natural. B: Fact-checking steps clear, Q fair. C: Fine.
- Decision: okay → OK only.
#### s4-04 How Does It Work?
- A: The answer to "What happens on a rainy day?" skips the sunny-day step.
- B: Same; the logic link (store on sunny days, use on rainy days) should be explicit for learners.
- C: Fine.
- Decision: add "On sunny days," (+JA).
#### s4-05 The Helper Who Said "I'm Not Sure"
- A: Fine. B: Pip's first reply has no speaker right after Birimo's question. C: TTS listener can't tell who is speaking.
- Decision: add "says Pip".
#### s4-06 A Park for Everyone
- A: "reading place" then "reading garden" — pick one; "reading area" is what a US teacher says.
- B: Same inconsistency affects Q2/Q3. Last line too long.
- C: Last line long; split.
- Decision: unify to "reading area" (story + Q), split last line.
#### s4-07 Who Invented It?
- A: Fine. B: Passive focus clear; facts OK (paper in China ~2,000 years ago). C: Fine.
- Decision: JA fix only (よく されました).
#### s4-08 What If...?
- A: Fine. B: Long line 6. C: Line 6 runs on; split.
- Decision: split line 6.
#### s4-09 The Quiet Hero
- A: Warm. B: Math checks (40 x 365 > 14,000). C: Fine.
- Decision: no change.
#### s4-10 Three Desert Rules
- A: Good safety story. B: Q answers in text. C: Fine.
- Decision: no change.
#### s4-11 The Map on the Tent
- A: Fine. B: Facts OK (70% ocean, Pacific > all land, deserts ~1/3 of land). C: Fine.
- Decision: no change.
#### s4-12 Half a Bottle Left
- A: Fine. B: Fractions add up (1/4 + some = 1/2 left). C: Fine.
- Decision: no change.
#### s4-13 When the Typhoon Came
- A: Natural family talk. B: Clear. C: Fine.
- Decision: no change.
#### s4-14 Don't Go Back Unless It's Safe
- A: Fine. B: unless explained well. C: Fine.
- Decision: no change.
#### s4-15 Let's Practice Helping
- A: Fine. B: Fine. C: Fine.
- Decision: okay → OK only.
#### s4-16 The Lost Passport
- A: "fill in" is UK; "fill out" in US. "if it weren't found" is stiff from a child.
- B: "Please wait here." has no speaker. Kiko's question should stay a 2nd conditional but simpler.
- C: "if it weren't found" is awkward to say; "if nobody found it" flows.
- Decision: fill out; add "says the officer"; "if nobody found it" (+Q3). "Please wait here" kept (adult official to adults).
#### s4-17 Do You Know Where It Is?
- A: Fine. B: Riko says both used "Do you know where...?", but Kiko said "Could you tell me where...?" — inconsistency. C: Fine.
- Decision: mention both forms.
#### s4-18 Who Does the Dishes?
- A: Fine. B: Two lines too long. C: Split for breath.
- Decision: split lines 0 and 10.
#### s4-19 The Big Vote
- A: Fine. B: Votes add up (12+11+5=28). Line 11 long. C: Split.
- Decision: split line 11.
#### s4-20 Could You Possibly Help Us?
- A: Polite request forms natural. B: Three lines too long. C: Same; split.
- Decision: okay → OK; split lines 0, 11, 14.
## としょかん ステージ5 の おはなし（content/library/stories-5.json）
- lint まえ → あと: error 1 / warn 11 / info 7 → error 0 / warn 0 / info 4（のこりの info: s5-02「what is it about」は 3つの しつもんを ならべる リズムで わざと、s5-07 いしの フクロウの「I will not」は おごそかな はなしかたで わざと、s5-18「I am Haru.」「It is too hard」は ハルが 1年めに かいた ノートの 文で わざと）
- なおした 欄: 28（items 13 / total 20）。20話 すべてに `"reviewed": "run9"`（buildIndex は きまった 欄だけ ひろうので えいきょう なし）
- まなぶ ことば（words）・こたえの いち は かえていない。s5-19 Q2 の せいかいの 文だけ ことばの じゅんばんを なおした（answer は 2 の まま）

### 変更一覧
| id | 欄 | before | after | reviewers | りゆう |
|---|---|---|---|---|---|
| s5-01 | lines[3].ja | さくいんから はじめなさい。 | さくいんから はじめると いいよ。 | A・B | 〜しなさい は こどもむけ に つかわない（ガイド10） |
| s5-02 | lines[0].en | gave the class a strange homework: "Read ... | gave the class some strange homework. "Read ... | 文法 | homework は 数えない（a は つかない）。24語→2文 |
| s5-03 | lines[7].en / ja | their songs can travel very far / とても とおくまで | their songs can travel far / とおくまで | A・C | 23語→22語。まとめの 文を みじかく |
| s5-04 | lines[8].en | "What is the scientist's favorite sandwich?" | "What's the scientist's favorite sandwich?" | A・C | ビリモの さけび声は 短縮形が しぜん |
| s5-05 | lines[12].en | be okay? | be OK? | 機械 | canonical OK |
| s5-09 | lines[13] → lines[13]・[14] | ビリモと ハルの セリフが 1行 | 2行に わけた（ja も） | A・C | 話す 人が かわる ところで 行を わける（TTS で まざらない）。15行で 上限16 以内 |
| s5-11 | lines[4].en | I had put every house | I put every house | A・B | 会話では 過去形が しぜん。過去完了は いらない |
| s5-14 | lines[14].en | three melon breads | three pieces of melon bread | 文法 | bread は 数えない（lint error） |
| s5-15 | lines[0].en | for the children: what should be built | for the children. What should be built | 機械・C | 25語→2文 |
| s5-16 | lines[0].en | from five different countries | from five countries | 機械 | 23語→22語。いみは おなじ |
| s5-16 | lines[5].en | What is everyone good at? | What's everyone good at? | A・C | 会話の 短縮形 |
| s5-17 | lines[15].en / ja | Our idea is better than any of our ideas alone. / みんなの アイデアは、だれか ひとりの アイデアより ずっと いい。 | Our plan is better than any of our ideas alone. / みんなで つくった けいかくは、ひとりずつの アイデアの どれよりも いい。 | A・B | idea / ideas の くりかえしで いみが わかりにくい |
| s5-19 | lines[6].en / ja | at an observatory, and that night changed ... / あの よるで せかいの みかたが かわりました | at an observatory. That night changed ... / てがみを かきました。あの よるが、わたしの せかいの みかたを かえました | 機械・ja | 25語→2文。「よるで」は ふしぜんな 日本語 |
| s5-19 | lines[10].en | why stars twinkle, and I explained it | why stars twinkle. I explained it | 機械 | 24語→2文 |
| s5-19 | lines[11].en | "What is your favorite planet, and why?" | "What's your favorite planet, and why?" | A・C | 会話の 短縮形 |
| s5-19 | lines[12].en | "Saturn," said Kiko, "because its rings remind me ... | "Saturn," said Kiko. "Its rings remind me ... | 機械 | 24語→2文（ことばは そのまま） |
| s5-19 | lines[13].ja | えらそうに うなずきました | かしこそうに うなずきました | EN/JA | nodded wisely に あわせた |
| s5-19 | questions[1].choices[2] | She agreed partly, then gave her own view. | She partly agreed, then gave her own view. | A・B | partly は 動詞の まえが しぜん |
| s5-20 | lines[5].en | the bottom of the sea, and in every place | the bottom of the sea. In every place | 機械 | 24語→2文 |
| s5-20 | lines[7].en / ja | If you are having a hard day ..., and how we fixed them together. | If you're having a hard day ... went out. Remember how we fixed them together. | 機械・A | 25語→2文、手紙の 語りは 短縮形（ja も 2文に） |
| s5-20 | lines[12].en | rockets, Kiko's had a tiny star map on it, and Birimo's had | rockets, and Kiko's had a tiny star map on it. Birimo's had | 機械 | 26語→2文 |
| ぜんぶ | reviewed | — | "run9" | — | マーカー |

### のこした こと
- s5-04「host the question time」: A は「Q&A」の ほうが アメリカらしいと いったが、B・C は こどもに わかりやすいと 判断。1人だけ なので そのまま
- s5-08 ビリモの「That ending made my ears warm.」: heartwarming の ビリモふうの もじり（ja も「みみが あったかく」）。キャラの ジョークとして のこした
- s5-11 Q2 の せいかい「The rain was part of her plan.」: すこし ことばたらずだが、ほかの 2つは あきらかに ちがい せいかいは 1つ。のこした
- s5-13 オオタさんの「もとめなさい／なりなさい」: おとしよりの おしえの ことばとして のこした
- s5-20「From Riko, today.」: 手紙の むすびとして すこし ふしぎだが、詩的な ねらい。A だけ なので のこした
- index.json の wordCount が かわる（s5-02・s5-03・s5-09・s5-14・s5-15・s5-16・s5-17・s5-19・s5-20 など）。`npm run library:index` は コーディネーターが まわす

### レビュアーの メモ
#### s5-01 The Library Under the Sea
- A: Natural; turtle's advice fine. JA "はじめなさい" too bossy for a kind librarian.
- B: Good research-skills story; questions answerable, one correct each.
- C: Reads smoothly.
- Decision: JA only.
#### s5-02 Three Sentences Only
- A: "a strange homework" is a classic error.
- B: Uncountable noun error in line 1 must go; summary model is excellent.
- C: Line 1 too long in one breath; split at the colon.
- Decision: "some strange homework." + new sentence.
#### s5-03 To Sum Up
- A: Fine. Summary sentence a bit long.
- B: Level OK; "travel" sense in words kept.
- C: 23-word summary; dropping "very" helps the breath.
- Decision: drop "very" (EN/JA).
#### s5-04 Any Questions?
- A: "the question time" slightly odd (Q&A); Birimo would say "What's".
- B: Fine; rephrasing skill clear.
- C: "What's" sounds like a kid shouting.
- Decision: contraction only.
#### s5-05 When the Bubble Lights Went Out
- A: Good. "okay" → "OK".
- B: Good recycling of to sum up / Any questions.
- C: Kiko's summary reads well.
- Decision: OK only.
#### s5-06 The Key That Opens Nothing
- A: Warm, natural. B: Clear. C: Good pauses.
- Decision: no change.
#### s5-07 What Would You Do?
- A: Stone owl's "I will not" fits its solemn voice.
- B: Conditionals well modeled; 4 answers consistent with "four different answers".
- C: Fine.
- Decision: no change.
#### s5-08 A Better Ending
- A: "made my ears warm" is odd, but it's Birimo.
- B: Could confuse learners slightly; Birimo's quirks are established.
- C: Fine.
- Decision: no change (character joke).
#### s5-09 A Night of a Hundred Stories
- A: Last line puts two speakers in one paragraph.
- B: Fine.
- C: TTS would run Birimo and Haru together.
- Decision: split into two lines.
#### s5-10 I Know How You Feel
- A/B/C: Natural, empathy language clear.
- Decision: no change.
#### s5-11 I Should Have Asked
- A: Kids say "I put every house...", not "I had put".
- B: Unnecessary past perfect in speech; target "should have" stays clear.
- C: Fine.
- Decision: "I put".
#### s5-12 Saying No Kindly
- A/B/C: Natural ("I'd rather not", "How about ~?").
- Decision: no change.
#### s5-13 The Highland Talk Show
- A: Natural. B: Open vs. yes/no questions clear. C: Fine.
- Decision: no change.
#### s5-14 From the Shop's Side
- A: "melon breads" is wrong.
- B: Uncountable; time math (4 to 6 = 14 h) checks out.
- C: Fine.
- Decision: "three pieces of melon bread".
#### s5-15 My First Point Is...
- A: Fine.
- B: Opening sentence long for the stage.
- C: The colon + question is one long breath.
- Decision: split.
#### s5-16 The Bridge of Many Hands
- A: "What's everyone good at?" more natural.
- B: Opening 23 words; "different" is redundant.
- C: Contraction flows.
- Decision: drop "different", contract.
#### s5-17 The Round Table Agreement
- A: "Our idea is better than any of our ideas" sounds clumsy.
- B: Meaning unclear for learners.
- C: OK.
- Decision: "Our plan is better than...".
#### s5-18 The Old Me, the Me Now
- A: Full forms in the old notebook are intentional beginner writing.
- B: Good. C: Good.
- Decision: no change.
#### s5-19 The Practice Interview
- A: "What's" in Birimo's line; "partly agreed" order.
- B: Three over-long sentences; Q2 choice wording awkward; JA "えらそうに" ≠ "wisely".
- C: Long answers need breath breaks.
- Decision: split 3 sentences, contraction, Q2 choice word order, JA fixes.
#### s5-20 A Letter to Me in Ten Years
- A: "From Riko, today." a little odd but poetic.
- B: Three sentences too long for stage; content consistent with s5-05/s5-09/s5-12.
- C: Long letter lines; split helps.
- Decision: split three sentences, "you're".
## うた・チャンツ と AI フリートークの テーマ（content/library/chants.json・content/library/talk.json）
- lint まえ → あと: error 0 / warn 3 / info 4 → error 0 / warn 1 / info 4
  - のこりの warn: t-dream lines[4]「I want to be a writer because I love stories.」（10 語 > 8）。この テーマの めあては because で りゆうを いう こと（L320・ステージ1 の さいご）なので、because の 文の お手本として わざと のこした
  - のこりの info: c-13「What is she doing?」「What is he doing?」・c-22「it is sung」は チャンツの 拍と 文の 形（現在進行形・うけみ）を みせるため わざと。t-food「sweets」は「あまい もの」の いみで OK
- なおした 欄: 42（items 20 / total 39）。28 曲・11 テーマ ぜんぶに `"reviewed": "run9"`（types / validateChant / validateTalkTheme / library-index は 余分な 欄を 気に しない）
- まなぶ ことば（targetExpressions・focusJa・title）は かえて いない。テストで つかう「I like curry.」（t-food）・「I like pandas.」（t-animals）の 行と、t-food の starterEn は そのまま

### 変更一覧
| id | 欄 | before | after | reviewers | りゆう |
|---|---|---|---|---|---|
| c-01 | lines[1].en | I'm fine, I'm fine, and you? | I'm good, I'm good! How about you? | A, B, C + lint | 教科書の きまり文句。拍は のこした |
| c-05 | lines[0-4].en | A, a, a, a cat on a mat.（E/I/O/U も） | Short a, short a! A cat on a mat.（e/i/o/u も） | B, C | TTS は「A」「I」「O」「U」を 字の なまえ（長い 音）で 読み、みじかい 音の チャンツが 反対の 音を おしえて いた。8 語 いないに 2文に わけた |
| c-05 | lines[0-4].ja | ア、ア、ア、… | みじかい a（ア）！ … | B | 英語に あわせた |
| c-09 | lines[4].en | Magic e, quiet e, it makes the vowel say its name! | Magic e, quiet e! It makes the vowel say its name! | lint, B | 11 語 → 4 + 7 語 |
| c-11 | lines[3].en | It was a dream! | It was like a dream! | A, B | 「ほんとうに ゆめだった」に なる。ja「ゆめみたい」と あわせた（cream と 韻は のこる） |
| c-14 | lines[3].en | Okay, I will! | OK, I will! | canonical | OK |
| c-17 | lines[1].en | said that he can't wait! | said that he couldn't wait! | B + 文法 | said の あとは 時制を もどす（world-21 で おしえる きまり）。1行目の was と そろう |
| c-18 | lines[3].en/ja | Let's try and know! / ためして しろう！ | Let's try, and then we'll know! / ためせば わかるよ！ | A, B | try and know は 英語として へん。grow と 韻は のこる |
| c-20 | lines[2].en/ja | The joke is amazing / ジョーク | The magic trick is amazing / てじな | A, B | ジョークは amazing / amazed に ならない。てじなの ほうが「びっくり」が つたわる |
| c-21 | lines[3].en/ja | Okay, let's both try! / どっちも かって みよう！ | OK, let's give both a try! / どっちも ためして みよう！ | A, B + canonical | let's both try は いみが わからない。why と 韻は のこる |
| c-22 | lines[1].en/ja | The map was drawn of faraway lands. / ちずは とおくの くにを えがいた。 | The maps were drawn in faraway lands. / ちずは とおくの くにで かかれた。 | A, B | drawn of は ぶんぽうが へん。hands と 韻は のこる |
| c-23 | lines[1].en/ja | Keep a flashlight and a jacket on. / …わすれずに。 | Have a flashlight, put a jacket on. / かいちゅうでんとうを もって、うわぎを きよう。 | A, B | keep a flashlight on は「つけっぱなし」に なる。gone と 韻は のこる |
| c-24 | lines[3].en/ja | Thank you so much! You're welcome, too! / …どういたしまして！ | Thank you so much! You're welcome. Have a nice trip! / …どういたしまして。よい たびを！ | A, B, C | You're welcome, too は いみが ない |
| c-27 | lines[2].en | That's okay | That's OK | canonical | OK |
| t-animals | lines[2].en | What can pandas do? | What can a panda do? | A, B | こたえの It can climb trees. と 数を あわせた（目標の It can ～. は のこす） |
| t-animals | lines[5].en | Yes! It's cute! | Yes! They're cute! | A, B | dolphins（ふくすう）への こたえ |
| t-weather | starterEn・lines[0].en | How is the weather today? | How's the weather today? | A, C | 話しことばは How's |
| t-day | lines[2].en | Early! | That's early! | A, C | 1語だけでは ぶっきらぼうに きこえる |
| t-day | lines[6].en | What is your favorite time of the day? | What's your favorite time of day? | A, C + lint | ふつうの いいかた・短縮形 |
| t-trip | lines[5].en | I want to eat local food. | I want to eat the food there. | A, B | local は ステージ1 には むずかしい・おとなっぽい。ja「その くにの たべもの」と あう |
| t-future | lines[4].en/ja | Are you going to watch the stars, too? / あなたも ほしを みる？ | Are you going to watch the stars? / あなたは ほしを みる？ | A, B | キコは 本を よむ と いったので「too」が あわない |
| t-future | lines[5].en/ja | Yes, I'm going to look at the moon. / うん、つきを みる つもり。 | Yes! I'm going to look at the moon, too. / うん！ つきも みる つもり。 | A, B | ほし の しつもんに Yes で こたえて つきの はなしに つなげた |
| t-compare | lines[3].en | Because dogs are more friendly. | Because dogs are friendlier. | A, B | -y の 形容詞の 比較級（ステージ2 で ならう -er） |
| t-compare | lines[6].en | What is the best food | What's the best food | A, C + lint | 短縮形 |
| t-anything | lines[2].en | What is it about? | What's it about? | A, C + lint | 短縮形 |

### のこした こと
- c-01「Hello, hello, nice day!」: ことばの かけらだが チャンツとして しぜん（A だけ）
- c-05 の 日本語で a と u が どちらも「ア」: 日本の フォニックスで ふつうの かきかた
- c-24「ten past two」: アメリカでも つかう
- c-26「If I were you, what would I do?」: チャンツの 問いかけとして のこした
- t-food「sweets」: 「あまい もの」の いみで OK（lint info）。さいごの「What do you like?」は 目標表現の お手本
- t-weekend「How did you feel at the end of the day?」: すこし かたいが まちがいでは ない（A だけ）
- t-dream の because の 文（上の warn）
- index.json は うごかして いない。チャンツ・テーマの 索引の 欄（title・titleJa・focusJa など）は かえて いないので、この 2 ファイルの せいで 索引は かわらない

### レビュアーの メモ
#### c-01 Hello, Hello Chant
- A: "I'm fine, and you?" is textbook; kids say "I'm good! How about you?"
- B: model the natural reply from day one.
- C: "I'm GOOD, I'm GOOD! How a-BOUT YOU?" keeps the 4-beat line.
- Decision: change line 2.
#### c-02 Rainbow Colors
- A: fine. B: fine, one pattern. C: good rhythm.
- Decision: no change.
#### c-03 Count to Ten
- A: classic counting rhyme feel. B: fine. C: fine.
- Decision: no change.
#### c-04 Head and Hands
- A/B/C: fine, TPR friendly.
- Decision: no change.
#### c-05 Short Vowel Rap
- A: teachers say "short a"; "A, a, a" only works with a live voice.
- B: TTS reads I/O/U as long names (eye, oh, you) — teaches the wrong sound.
- C: "A, a, a, a cat" is four identical a's, unreadable as intended.
- Decision: "Short a, short a! A cat on a mat." for all five.
#### c-06 What Do You Like?
- A/B/C: fine.
- Decision: no change.
#### c-07 Days of the Week
- A/B/C: fine.
- Decision: no change.
#### c-08 What Time Is It?
- A/B/C: fine.
- Decision: no change.
#### c-09 Magic E
- A: fine. B: last line too long for stage 1. C: needs a breath after "quiet e".
- Decision: split into two sentences.
#### c-10 Twelve Months
- A/B/C: fine (no personal question asked of the child; it is a chant line).
- Decision: no change.
#### c-11 Went, Saw, Ate
- A: "It was a dream" means it wasn't real. B: JA says ゆめみたい. C: "like a" still scans.
- Decision: "It was like a dream!"
#### c-12 He Plays, She Plays
- A/B/C: fine.
- Decision: no change.
#### c-13 What Are You Doing?
- A: fine. B: full "What is" shows the pattern. C: fine.
- Decision: no change.
#### c-14 Did You? Yes, I Did!
- Canonical OK. Otherwise fine.
- Decision: Okay → OK.
#### c-15 Big, Bigger, Biggest
- A/B/C: fine.
- Decision: no change.
#### c-16 Have To, Must
- A/B/C: fine.
- Decision: no change.
#### c-17 She Said, He Said
- A: "said he can't wait" is heard, but not in teaching material. B: the course teaches backshift; line 1 already uses "was". C: "couldn't" fits.
- Decision: couldn't.
#### c-18 What Happens If?
- A: "try and know" is not English. B: unclear. C: fine either way.
- Decision: "Let's try, and then we'll know!"
#### c-19 Have You Ever?
- A/B/C: fine (sky train is fantasy, fits the app world).
- Decision: no change.
#### c-20 Exciting and Excited
- A: a joke is funny, not amazing. B: a magic trick makes "amazed" clear. C: fine.
- Decision: magic trick / てじな.
#### c-21 I See Your Point
- A: "let's both try" is unclear. B: JA says "try keeping both". C: fine.
- Decision: "OK, let's give both a try!"
#### c-22 It Was Made By
- A: "drawn of faraway lands" is awkward. B: confuses the passive. C: fine.
- Decision: "The maps were drawn in faraway lands."
#### c-23 Stay Safe
- A: "keep a flashlight on" = leave it switched on. B: ambiguous. C: fine.
- Decision: "Have a flashlight, put a jacket on."
#### c-24 Do You Know Where?
- A: "You're welcome, too!" makes no sense. B: confusing. C: awkward ending.
- Decision: "You're welcome. Have a nice trip!" (airport scene).
#### c-25 First, Next, Finally
- A/B/C: fine.
- Decision: no change.
#### c-26 If I Were You
- A: line 3 slightly odd but rhetorical. B/C: fine.
- Decision: no change.
#### c-27 I Should Have
- Canonical OK.
- Decision: okay → OK.
#### c-28 I Used to Be
- A/B/C: fine.
- Decision: no change.
#### t-food すきな たべもの
- A: "sweets" OK for sweet things. B: fine; curry flow kept. C: fine.
- Decision: no change.
#### t-animals どうぶつ
- A: "What can pandas do? — It can..." and "dolphins — It's cute" mismatch number. B: models wrong agreement. C: fine.
- Decision: "a panda" / "They're cute!"; pandas flow kept.
#### t-weather てんきと きせつ
- A: "How's the weather?" is what people say. B: fine. C: smoother.
- Decision: How's (starter and line 0).
#### t-day わたしの 1日
- A: "Early!" alone is clipped; "time of day" idiom. B: fine. C: "That's early!" reads better.
- Decision: two small fixes.
#### t-hobby すきな こと・できる こと
- A/B/C: fine.
- Decision: no change.
#### t-trip ゆめの りょこう
- A: kids don't say "local food". B: "local" is hard at stage 1. C: fine.
- Decision: "the food there".
#### t-dream しょうらいの ゆめ
- A: fine. B: 10-word because sentence is the theme goal. C: fine.
- Decision: no change (warn kept on purpose).
#### t-weekend しゅうまつの できごと
- A: last question a bit formal. B/C: fine.
- Decision: no change.
#### t-future これからの よてい
- A: "too" doesn't fit, Kiko said she'll read. B: logic break. C: fine.
- Decision: drop "too", move it to Haru's reply.
#### t-compare どっちが すき？
- A: "friendlier" is more natural. B: stage 2 teaches -er comparatives. C: "What's" smoother.
- Decision: friendlier / What's.
#### t-anything なんでも トーク
- A: "What's it about?" natural. B: fine. C: smoother.
- Decision: What's.
## 力だめし ステージ1〜5（content/yearly/stage-1.json 〜 stage-5.json）
- lint まえ → あと: error 1 / warn 26 / info 6 → error 0 / warn 0 / info 5（のこりの info は おしらせ・語りの「do not / did not / are not / it is」。アナウンスや 説明文なので かたい 形で わざと）
- なおした 欄: 36（items 32 / total 192：5 ステージ・聞く 90・読む 70・文章 7・話す 20・書く 5。ぜんぶ 見なおした）
- テスト: `npm run yearly:check` 5 ステージ OK、`npx vitest run tests/yearly.test.ts tests/yearly-offline.test.ts` 58 passed
- 5 ファイルの いちばん 上に `"reviewed": "run9"` を 入れた（validate.ts・yearly-check.ts・catalog.ts の `as YearlyTest` は よけいな 欄を 気に しない。テストも 通る）
- 正解の 位置（answer）・選択肢の 数・id・keywords・minWords は かえていない。音読の 文（readText）も そのまま

### 変更一覧
| id | 欄 | before | after | reviewers | りゆう |
|---|---|---|---|---|---|
| y1-r08 / r09 / r10 | prompt | `A: …?␣␣B: ( )` | `A: …? B: ( )` | lint | 空白が 2 つ |
| y1-s1 | askEn | Hello! Please tell me about you. What do you like? | Hello! Tell me about yourself. What do you like? | A, B, C | tell me about you は ふしぜん・Please ＋ めいれいは つめたい |
| y2-l07 | audio[0] | Shall we play tennis after school? | Do you want to play tennis after school? | A, B | Shall we は 教科書っぽい（アメリカの 子は Do you want to ～?） |
| y2-l07 | choices[2] | That's okay. Maybe next time. | That's OK. Maybe next time. | lint | OK に そろえる |
| y2-l13 | audio[2] | Okay. Let's play after that. | OK. Let's play after that. | lint | OK |
| y2-p1 | lines[4] | The third-grade students will sing songs in the gym at 11:00 a.m. | Third graders will sing in the gym at 11:00 a.m. | lint, A, C | ながすぎ（14 語）・third graders が ふつう |
| y2-p1 | lines[7] | If it rains, the games on the playground will move to the gym. | If it rains, the playground games will move to the gym. | lint, C | ながすぎ（13 語）。y2-r13 の こたえ「The games will move to the gym.」は そのまま 正しい |
| y2-r08 / r09 / r10 | prompt | `?␣␣B:` | `? B:` | lint | 空白が 2 つ |
| y2-s1 | picture.descriptionEn | In a park, a boy is playing soccer, a girl is riding a bike, and a dog is running. | This is a park. A boy is playing soccer. A girl is riding a bike. A dog is running. | lint, C | 19 語。aria-label で 読みあげるので みじかい 文に わけた（キーワードは ぜんぶ のこる） |
| y3-l04 | choices[0] | That's okay. I wanted … | That's OK. I wanted … | lint | OK |
| y3-l08 | audio[0] | … Are you okay? | … Are you OK? | lint | OK |
| y3-p1 | lines[6] | My cousin Taro is a great skier, so he taught me how to stop and turn. | My cousin Taro is a great skier. He taught me how to stop and turn. | lint, C | 16 語 → 2 文 |
| y3-p1 | lines[9] | Tomorrow we're going to visit a snow monkey park, and then we'll go home on Wednesday. | Tomorrow we're going to visit a snow monkey park. Then we'll go home on Wednesday. | lint, C | 16 語 → 2 文（y3-r12 Wednesday は そのまま） |
| y3-p2 | lines[8] | "I sat on that bench with my husband many years ago," she said with a smile. | "I sat on that bench with my husband long ago," she said with a smile. | lint | 16 語 |
| y3-r02 | prompt | The museum is very popular, so we had to wait in a long ( ) to buy tickets. | The museum is popular, so we had to wait in a long ( ) to buy tickets. | lint | 16 語（いみは おなじ・こたえ line） |
| y3-s2 | picture.descriptionEn | At a lake, a boy is fishing, a girl is reading a book under a tree, and a dog is running. | This is a lake. A boy is fishing. A girl is reading a book under a tree. A dog is running. | lint, C | 21 語 → みじかい 文 |
| y3-s4 | askEn | … Please tell me two things. | … Can you tell me two things? | A, B | Please ＋ めいれい → Can you ～? |
| y4-l01 | audio[0] | … plant flowers along the school gate. | … plant flowers by the school gate. | A, C | along は ながい ものに そって。門は by |
| y4-l19 | audio[0] | … has been cancelled. | … has been canceled. | lint (error) | アメリカの つづり |
| y4-s3 | sample | I think children should have a little homework every day because it helps us remember what we learned at school. But … | I think a little homework every day is good because it helps us remember what we learned. But … | lint | 20 語 > 18。keywords（think・because・homework・every・day）は ぜんぶ のこる・24 語 ≥ minWords 20 |
| y5-l01 | audio[1] | … nervous about the question time after it. | … nervous about answering questions at the end. | A, B | question time は イギリスふう・after it が ぎこちない |
| y5-l02 | audio[0] | … but I have a swimming competition. | … but I have a swim meet. | A, C | アメリカの 子は swim meet |
| y5-l05 | audio[0] | … debate whether homework should be stopped. | … debate whether schools should stop giving homework. | A, B | homework should be stopped は ふしぜん |
| y5-l13 | audio[0] | … joining the school council. | … joining the student council. | A, B | アメリカの 学校は student council |
| y5-l16 | audio[0] | … Is everything okay? | … Is everything OK? | lint | OK |
| y5-l23 | audio[1] | … a shy girl who only came out at night because she did not want people to see her. | … a shy girl. She only came out at night because she didn't want people to see her. | lint, C | 25 語 → 2 文・didn't |
| y5-l24 | audio[2] | … along the roads to school, because many children get tired on hot days. | … along the roads to school. Many children said they get tired walking on hot days. | lint, C | 25 語 → 2 文（こたえ「walking to school easier in hot weather」は より はっきり） |
| y5-p1 | lines[10] | It is eaten in soups and salads, and it can be turned into … | It is eaten in soups and salads. It can also be turned into … | lint | 23 語 → 2 文 |
| y5-p2 | lines[4] | Entries can be sent by post … | Entries can be sent by mail … | A, B | post は イギリス英語 |
| y5-p3 | lines[2] | When she arrived at his small house by the harbor, however, … | When she arrived at his house by the harbor, however, … | lint | 23 語 |
| y5-p3 | lines[5] | He told her about windy nights when he climbed the 120 steps to the top of the lighthouse again and again to keep the light shining. | He told her about windy nights at the lighthouse. On those nights, he climbed its 120 steps again and again to keep the light shining. | lint, C | 26 語 → 2 文 |
| y5-r03 | prompt | Leo couldn't think of a topic for his story, but after a long walk in the forest, he ( ) with … | Leo couldn't think of a topic for his story. But after a long walk in the forest, he ( ) with … | lint | 26 語 → 2 文（こたえ came up は そのまま） |

### のこした こと
- info contraction 5 件（y3-l19・y4-l14・y4-l17・y5-l18・y5-l21 の おしらせ・説明の 語り）: アナウンス・説明文は かたい 形が しぜん。
- y1-r04「Please wear your ( ).」・y3-s1 / y4-s1「Please read this aloud.」: しけんの 指示・おうちの きまりとして ふつう。1 人だけ 気に した。
- 「the sea」（y2-r02・y3-s3 ほか）: アメリカでは ocean / beach が 多いが、まちがいでは なく keywords にも あるので のこした。
- y4-p1「wild flowers」「flower pots」・y5-l12「garden」「shop」・y4-l04「match」: アメリカでも つかう 形。好みの ちがいなので のこした。
- y4-r01 と y5-r02 は おなじ かたち（Our class wanted to ( ) the amount … / reduce）。ステージが ちがうので のこした（つぎの 見なおしで 入れかえを 検討）。
- 子どもの 登場人物「Emma」（y3-l08・y3 の メール・y5-l08）は エマ先生（Ms. Emma）と べつの 人。名前は かえていない。

### レビュアーの メモ
#### stage 1 ステージ1 の 力だめし
- A: 「Please tell me about you.」は 先生が いわない。ほかは 小1 に しぜん。
- B: 選択肢は どれも 1 つだけ 正しい。y1-r07（went）は ステージ1 には すこし はやいが テストの 形なので のこす。
- C: 会話の あなうめの 二重空白は 読みあげに 関係ないが lint を けす。s1 は「Tell me about yourself.」で リズムよし。
- Decision: 空白 3・s1 を なおした。
#### stage 2 ステージ2 の 力だめし
- A: 「Shall we ～?」は アメリカの 子は つかわない。third-grade students → third graders。
- B: l07 は 会話が 自然に なっても こたえ（That's OK. Maybe next time.）は 1 つ。p1 の 文が ながい。
- C: 絵の 説明は カンマ 3 つで 息が つづかない → 4 文に。
- Decision: l07・OK 2・p1 2 行・空白 3・descriptionEn を なおした。
#### stage 3 ステージ3 の 力だめし
- A: 「Please tell me two things.」は ややかたい。メールの 文は 2 文に わけると 子どもの メールらしい。
- B: メールの 日にち（土→日→きのう→あした→水よう）は むじゅん なし。r02 は very を とっても こたえは line だけ。
- C: p2 の セリフは long ago で 言いやすい。descriptionEn は みじかい 文に。
- Decision: OK 2・p1 2 行・p2 1 行・r02・descriptionEn・s4 を なおした。
#### stage 4 ステージ4 の 力だめし
- A: 「along the school gate」は ことばの いみが あわない。cancelled は イギリスの つづり。
- B: l09（つぎに する こと＝でんちを とりに いく）、l18（3 人）、r07（when）など どれも 正解 1 つ。s3 の お手本が ながい。
- C: s3 の お手本は 17 語＋7 語で 言いやすい。
- Decision: l01・l19・s3 sample を なおした。
#### stage 5 ステージ5 の 力だめし
- A: question time・swimming competition・school council・by post は イギリスふう。homework should be stopped は ふしぜん。
- B: どの しつもんも 正解 1 つ。l24 は 2 文に しても 理由（hot days）が きこえる。r03 は came up だけが with に つながる。
- C: 25 語の 語り（l23・l24）と p3 の 26 語の 文は 息つぎが むずかしい → 2 文に。
- Decision: l01・l02・l05・l13・l16・l23・l24・p1・p2・p3 2 行・r03 を なおした。
## AI かいわの 台本（フォールバック）・システムプロンプト・まとめ・UI・メール / LINE（src）

- しらべた もの: src/lib/conversation/engine.ts（AI が つかえない ときの 台本エンジンの きまり文句・あいさつだけの 台本 GENERIC_CONVERSATION）、src/lib/conversation/aiConversation.ts（レッスンの かいわ・としょかんの フリートークの システムプロンプトと 例）、src/lib/yearly/aiScoring.ts（力だめしの 採点プロンプト）、src/lib/recap/script.ts（まとめ動画の テンプレート）、src/lib/teacher/timeline.ts（台本の ない レッスン用の エマ先生の 自動台本・スライドの 見出し）、src/lib/api/contracts.ts（返事が こわれた ときの きまり文句）、src/lib/game/worlds.ts・monsters.ts（英語名）、src/components・src/app の 英語の UI 文字列、src/lib/mail/templates.ts・src/lib/line/messaging.ts・src/lib/auth/lineMessages.ts・src/lib/report（メール・LINE・月の レポート）、content/announcements.json
- メール・LINE・レポート・おしらせは ぜんぶ 日本語で、英語は 製品名「Eigo Quest」だけ（なおす ところ なし）。UI の 英語は「BOSS」「No.」「Eigo Quest」と 台本スライドの 見出し（Words / Listen / Sounds / Let's move! / Say it! / Quiz / Today's wrap-up / Today's goal）だけで、どれも しぜん
- なおした 欄: **5**（src/lib/conversation の 2 ファイル）

### 変更一覧
| ファイル | 欄 | before | after | reviewers | りゆう |
|---|---|---|---|---|---|
| engine.ts | CLOSING（さいごの ターンの あいさつ） | That was fun! Bye-bye! See you! / たのしかった！ バイバイ！ またね！ | That was fun! See you next time! / たのしかった！ また こんどね！ | A+C | さようならが 2つ かさなる（スタイルガイド §9「See you! / See you next time!」）。声に すると Bye-bye! See you! が つっかえる |
| engine.ts | GENERIC_CONVERSATION lines[3] | I'm fine, thanks. / げんきだよ、ありがとう。 | I'm good, thanks! / げんきだよ、ありがとう！ | A+B | 教科書の「I'm fine」より こどもが ふつうに いう 言いかた（スタイルガイド §5） |
| engine.ts | GENERIC_CONVERSATION lines[4] | Goodbye! / さようなら！ | Bye! See you! / バイバイ！ またね！ | A+C | ともだちどうしの わかれで Goodbye! は かたい |
| engine.ts | GENERIC_CONVERSATION targetExpressions[1] | I'm fine. | I'm good. | （lines[3] に あわせた） | 台本の 文と 目標表現を そろえる（タップ候補・お手本に なる） |
| aiConversation.ts | buildSystemPrompt・buildFreeTalkPrompt の Rules | （なし） | NATURAL_ENGLISH:「Speak natural, warm, everyday American English (US spelling and words), the way a friendly American kid really talks. Use contractions (I'm, it's, don't). Avoid textbook phrases such as "I'm fine, thank you. And you?", "Let's enjoy!" or "Please repeat."」 | A+B | AI の 返事にも スタイルガイドの きまり（アメリカ英語・短縮形・かたい 決まり文句を さける）を つたえる。まえは レベルと 安全の きまり だけだった |

### のこした こと
- engine.ts の「Let's try together! Say, "～"」（いえなかった ときの お手本）と「Can you say, "～"?」: 1人（C）だけが「Say, の 読点が いらない」と いった。アメリカの 書きかたでも ふつうで、テスト（tests/conversation.test.ts:108 の `Say, "`）にも きまって いる
- ほめことば Great! / Nice! / Good job! / Wonderful! / Cool!（しぜん。Cool! は 1人が「内容より 気もち」と いったが のこした）
- recap/script.ts の さいご「Great job! See you tomorrow!」（日本語「また あした！」と あう。毎日 つづける アプリなので tomorrow で よい）
- timeline.ts の 自動台本（Hello, everyone! It's me, Ms. Emma. / Here is our goal for today. Let's learn to say: ～ / First, some new words. … Now you say it! / Sound time! / Quiz time! Which one means ～? / Wonderful! Today we practiced: ～ You did a great job! See you!）: 3人とも しぜん。Let's は 3回で きまりの 中
- aiScoring.ts・aiConversation.ts の プロンプトの 英語（モデル むけ。例「Wow!」「Really?」「Me too!」も しぜん）。tests/library.test.ts が 見て いる 文（free talk time・NEVER ask for personal information・follow-up question・talking at the end of today's lesson）は かえて いない
- ワールドの 英語名（Road of Departure・Sky Continent など）・モンスターの 英語名: ファンタジーの 名前で、レッスン 1,200 と テスト（tests/curriculum.test.ts）で つかわれ、ワールドの レビューで 見て ある。かえない
- contracts.ts の「Great job! Let's talk again!」（しぜん）

### レビュアーの メモ
- A（先生）: Closing "Bye-bye! See you!" stacks two goodbyes; "See you next time!" is what I'd say. "I'm fine, thanks." is OK but "I'm good, thanks!" is what kids say. "Goodbye!" between friends is stiff. The system prompt never tells the model to use American English or avoid textbook phrases; worth one line.
- B（ESL）: The generic script is the only greeting a child sees when a lesson has no conversation data, so it should model the natural form. Keep the target expression in sync with the line so suggestions match. The prompt should state the style rules the content follows (US, contractions), otherwise AI replies can drift to "I am fine, thank you."
- C（声優）: "Bye-bye! See you!" is three short goodbye beats in a row and sounds rushed. "Say, "Hello!"" reads fine aloud (the comma is a natural pause). The teacher auto-script reads smoothly.
- Decision: CLOSING (A+C), generic lines 3 and 4 (A+B / A+C), target synced, NATURAL_ENGLISH rule added to both prompts (A+B). Everything else kept.
