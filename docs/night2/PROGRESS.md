# Night 2 progress


## Phase 1 — 修正とオーナー決定の反映（docs/night2/P1-fixes.md）

### やったこと
- **ごほうび**
  - お宝アラート: 基本 12 × 2倍 = **24コイン**（復習クエスト一発 30 より少なく）。`COIN_RULES.treasureBase = 12`
  - AIキャラとの会話を最後までやると **+5コイン（レッスンごとに1回）**。台帳の idempotencyKey（`<userId>:conversation:<n>:CONVERSATION_FINISHED:0`）で二重付与を防止。Prisma の `CoinReason` に `CONVERSATION_FINISHED` を追加（マイグレーション `20261125120000_conversation_finished`）
  - きょうのまとめ動画は 1日1回 5コインのまま
- **フォニックスのボタン**: 「a_e」「-st」などを子ども向けの表示に（a…e「マジック e」、…st「おわりの おと」、sun・set「はくで よもう」）。押すと文字名ではなく**例の単語**（rain, bird, saw…）を読む。ブレンディングも文字名（シー・エー・ティー）を読まず、文字を順に光らせてから単語をゆっくり→ふつうの速さで読むように変更。きょうのまとめの文字表示も同じ表記に（`src/lib/curriculum/phonicsButtons.ts`）
- **会話相手のローテーション**: レッスンごとに Haru → Riko → Kiko → Birimo。その回の台本で話しているキャラから選ぶ（`pickConversationPartner`）。最初のセリフが「I'm Haru.」のような自己紹介ならそのキャラ、「Birimo's birthday」のように3人称で出てくるキャラは相手にしない。360レッスンで4人とも十分に登場することをテストで確認
- **最後のレッスン（Lesson 360）**: 「つぎのレッスンへ」を出さず「🎉 ぜんぶクリア！」を表示（最後のボスへのボタンは残す）。最後のボス（boss-1-360）合格時も「ぜんぶクリア！」
- **ワールド名の統一**: 計画書・会話シーンで使われている名前に統一（はじまりの森 / ことばの町 / せかいの港 / なぞなぞ山 / じかんの塔 / まなびの城 / ひかりの島 / たびだちの道 / そらの大陸 / いのちの海 / ゆめの都 / グランドフィナーレ）。ただ1つのもと `src/lib/game/worlds.ts` をマップとレッスン画面のヘッダーで使用。README の表からマップ名の列を削除
- **オフライン（DB停止）対応の拡張**
  - レッスン完了 API のオフライン応答が会話ボーナスも反映
  - おためしモードでクリアしたレッスン・合格したテストを、その**ブラウザの localStorage にだけ**記録（`src/lib/offline/localProgress.ts`）。マップ・アリーナはサーバーがオフラインのとき、この記録を載せてマップを作り直す → **Lesson 1 をオフラインでクリアすると、マップに ✓ と「きょうのまとめ」リンクが出る**（コイン・習得率は保存しない）
  - きょうのまとめ画面・視聴 API は先に DB の死活確認（1.5秒・キャッシュ付き）をして、接続待ちで止まらないように
  - 会話ステップはもともと DB を使わない（サーバーに届かなくても台本エンジンで返事）ことを確認
- **収録音声の 404 を解消**: `/media/audio/*.mp3` はまだ1つもないのに毎回取りに行き、404 とコンソールエラーが出ていた。`NEXT_PUBLIC_RECORDED_AUDIO=1` のときだけ収録音声を使い、それ以外はブラウザの読み上げのみ（.env.example に追記）
- **Playwright スモークテスト** `scripts/smoke.ts`（`npm run smoke -- <URL>`）: playwright を devDependency に追加し chromium をインストール。全ページ（/ /map /dashboard /gacha /arena /ranking /test/check-1 /test/mini-1-5 /recap/1 と各ワールド最初のレッスン 1,31,…,331）を開き、pageerror・console.error・5xx・ファイルの 404・エラー文言・「よみこみちゅう」で止まる、を検出。スクリーンショットは docs/night2/screens/（22枚）。最後に DB なしで レッスン完了 / 会話 / まとめ視聴 API と「オフラインでクリア後のマップのまとめリンク」を確認
  - DB 停止のまま `next build` → `next start` に対して実行し、**全項目 OK**（ログ: night-logs/night2/01-smoke.log）。見つかった問題は上の音声 404 のみで、修正済み
- テスト追加: `tests/night2-decisions.test.ts`（ごほうび・ローテーション・フォニックス表示・ローカル記録・ワールド名）。tsc / vitest（24ファイル・700件）/ next build すべて通過

### 判断したこと
- 会話ボーナスは「最後まで話した（done）」ときだけ。「きょうは とばす」「ここで おわりにする」では付かない。開始画面に「さいごまで おはなし すると 🪙+5」と表示
- Lesson 360 の後にも最後のボスがあるため、360 クリア画面では「ぜんぶクリア！」と最後のボスへのボタンを両方出す
- ワールド名は、会話・計画書ですでに多く使われている名前（5〜12 はマップとも一致）に合わせた。マップ独自の「はじまりのジャングル遺跡」「フォニックス火山の神殿」などは廃止
- スモークテストでレッスンを UI で最後（会話ステップ）まで進めるのは、クイズや音声認識があり不安定なので見送り。会話・完了は API と単体テストで確認し、マップ側はブラウザの記録を入れて確認した

### オーナーへの確認
- 「グランドフィナーレ」は場所の名前ではないので、将来 場所らしい名前（例: えいごの王国）に変えるかどうか
- 収録音声を用意したら `NEXT_PUBLIC_RECORDED_AUDIO=1` を設定してください

## Phase 2 — カリキュラム品質レビュー ワールド1〜3（Lesson 1〜90、docs/night2/REVIEW.md）

### やったこと
- 90レッスンを ぜんぶ読み、REVIEW.md のチェック項目（英語・日本語・順序・学校との対応・フォニックス・会話・タイトル・TPR の安全）で その場で直した。スキーマ・レッスン数・話す人（speaker）は変えていない
- **なおしたレッスン: 56 / 90**（ワールド1: 22、ワールド2: 19、ワールド3: 15）
- 内容別のおおよその件数（1レッスンで複数あり）
  - 会話・aiTask: 約32（目標表現がレッスン内に出てこない 12件をすべて解消、むずかしすぎる最初のセリフ、流れの不自然なセリフ、事実のまちがい）
  - 英語: 約18（3人称の has など まだ習っていない文法、不自然な言い方）
  - 日本語: 約11（英語と意味がずれている訳、男の子のセリフの口調、単語の訳）
  - フォニックス: 約10（まだ習っていない文字が入った単語、有声/無声の th の分け方、空だった sounds）
  - TPR の安全: 5（はしりだす・テーブルの下をくぐる・ほうきで走る などを「その場で」の動きに）
  - まとめ（recap）・testPoints・単語・先生のセリフ: 約10
- 例
  - L1 TPR「Go!」: ゆびさした ほうへ はしりだす → 2、3ぽ あるいて すすむ（家の中で安全に）
  - L8・L9: 目標表現「Four.」「Five.」「Seven, eight, nine, ten!」が会話に無かった → 会話で 1〜5、1〜10 を数えるように
  - L15 ふりかえりの単語 bus → sun（b はまだ L18 まで習っていない）。計画書も更新
  - L17 / L41: 「It has a long nose.」「It has wings.」（3人称の has は まだ）→「A long, long nose!」「Look at its wings!」
  - L28: 「Today is Birimo's birthday party!」→「Hi! I'm Kiko. It's my birthday today!」（場面はキコの誕生会。会話相手のローテーションでも キコが相手になるように）
  - L29: 「What would you like?」（小1には むずかしい）→「Cookies or candy?」
  - L43: テントウムシに「Can it fly? No, it can't!」（まちがい）→「Look! The ladybug can fly!」
  - L60: 「Where is Birimo? ― He's under the table!」（he はワールド7から）→「Where is my cap? ― It's under the table!」
  - L73・L75: 「with」は有声にも無声にもなるので th（いきだけ）の例から外し、tenth / math に。計画書も更新
  - L87: サイコロの目と きもちの対応が台本・最初のセリフ・先生のセリフで ばらばら → 1=happy, 3=sleepy, 6=hungry に統一
  - L66・L76・L87 などの goalJa「ハルにも ききかえそう」→「あいてにも ～」（実際の会話相手はローテーションで決まるため）
  - L64 titleJa「せかいの あいさつの しかた」→「あいさつの ジェスチャー」（L61「せかいの あいさつ」と まぎらわしい）
- タイトルは 1〜90 ですべて別々（英語・日本語とも）であることを確認
- tsc / vitest（24ファイル・700件）/ next build すべて通過

### 判断したこと
- 目標表現が会話に無いときは、セリフを足すか、レッスン内にある表現に目標を変えるか、自然なほうを選んだ（L6 は会話テストが「It's red.」の判定を使うので、色の目標を「It's ～.」にまとめず「It's red. / It's blue. / What color is it?」に）
- 計画書にある少しめずらしい単語（whim, whiff, cuff, fuzz, peg など）は、ブレンドを使わない代わりの単語がほとんど無いので残した
- L26 の「You're welcome!」（L29 で習う）は、場面に自然で よく使う決まり文句なので そのまま

## Phase 3 — カリキュラム品質レビュー ワールド4〜6（Lesson 91〜180、docs/night2/REVIEW.md）

### やったこと
- 90レッスンを ぜんぶ読み、REVIEW.md のチェック項目で その場で直した。スキーマ・レッスン数・フォニックスの単語・話す人の顔ぶれは変えていない（ファイルの書式も そのまま、該当の文字列だけを置きかえ）
- **なおしたレッスン: 39 / 90**（ワールド4: 14、ワールド5: 10、ワールド6: 15）
- 内容別のおおよその件数（1レッスンで複数あり）
  - 会話・aiTask: 約20（目標表現・中心表現が会話に出てこない 9件を解消、流れの不自然なセリフ、キャラ設定の食いちがい、むずかしい AI の最初のことば）
  - まだ習っていない文法: 12（3人称の has / means / looks、過去形 made / found / did、will / I'll、must、進行形）
  - TPR の安全: 8（「かべまで スキップ」「ドアまで ダッシュ」「はしって タッチ」「テーブルへ はしって」などを その場の動きや すわる・あるく に）
  - タイトルの重複: 5（ワールド1〜2・4 と同じ英語／日本語タイトルだった L92・L99・L101・L156・L179）
  - 日本語: 直したセリフに合わせて訳も見直し（約15）
- 例
  - L92「What Do You Want?」（L37 と同じ）→「Letter Cards, Please! / もじカード ください！」、L156 →「Lunch at the Café / カフェで おひるごはん」、L99 →「A Card for You! / カードの プレゼント」、L101 →「Mystery Box Quiz / はこの なかみ クイズ」、L179「Practice Time」（L118 と同じ）→「Let's Practice Together! / いっしょに れんしゅう！」。計画書の表も更新
  - L95: ハルが「A, please. Here you are, T!」と、ほしい人と あげる人が ごちゃまぜ → ハルが A と T を持っていて、リコが「A, please. And T, please!」でもらい、C・A・T で cat に
  - L119: 中心表現「Do you like frogs?」が会話に無かった → リコの発表を「I like animals.」にして、「Do you like frogs? ― Yes, I do!」「Do you like snakes? ― No, I don't.」を入れた
  - L122: 目標表現「How are you? / I'm good.」が会話に無かった → 「Jambo, Haru! How are you? ― Jambo! I'm good.」を追加。「Jambo means hello.」（3人称）→「Jambo! It's hello in Kenya.」（L124 の Adios も同様）
  - L131「This tower has seven rooms.」→「Look! Seven rooms.」、L157・L173「It looks yummy!」→「Yummy!」（ワールド6は3人称を使わない決まり）
  - L133: 目標表現「No, I don't.」がどこにも無かった → ビリモが「Do you like Mondays?」に「No, I don't. I like Sundays.」と答える
  - L134: リコのピアノが L133 では金曜、L134 では土曜 → L134 は「I have swimming on Saturday.」に
  - L155「I found ten letters!」→「Look! Ten letters!」、L174「Did you like the story?」→「Do you like the story?」（過去形はワールド9から）
  - L163: 目標表現「Turn left.」が会話に無かった → 最後に「Now turn left. Stop. This is the art room!」
  - L180: 目標表現「This is my favorite place.」が会話に無い → その回の中心表現「Welcome to my favorite place!」に
  - L102 の AI の最初のことば「I'm thinking of a fruit.」→「It's a fruit.」
- タイトルは 1〜180 で すべて別々（英語・日本語とも）であることを確認
- tsc / vitest（24ファイル・700件）/ next build すべて通過

### 判断したこと
- 中心表現が2人のセリフに分かれて出てくるだけの回（L146・L147・L170 の「Good afternoon. Let's play soccer.」のような 2文の まとめ表現）は、それぞれの文が会話にあるので そのまま
- 「Once upon a time, I'm a little cloud.」のような 現在形の おはなし（L174・L175）は、過去形がまだなので わざと そのままにした
- 「It's hello in Kenya.」: Jambo はスワヒリ語で ケニア以外でも使うが、小4向けには「ケニアの こんにちは」で十分と判断
- 「I want to draw ～」（L141）、「I'm nervous」（L118・L179）、「Don't be scared!」（L109）などは、場面に自然な決まり文句として残した

## Phase 4 — カリキュラム品質レビュー ワールド7〜9（Lesson 181〜270、docs/night2/REVIEW.md）

### やったこと
- 90レッスンを ぜんぶ読み、REVIEW.md のチェック項目で その場で直した。スキーマ・レッスン数・フォニックスの単語・ファイルの書式は変えていない（該当の文字列だけを置きかえ）
- **なおしたレッスン: 55 / 90**（ワールド7: 21、ワールド8: 12、ワールド9: 22）
- 内容別のおおよその件数（1レッスンで複数あり）
  - **AI 会話の最初のことばと 相手キャラの くいちがい: 約40**（いちばん多かった）。会話相手は レッスンごとに ハル→リコ→キコ→ビリモ と回るのに、最初のことばが「My name is Birimo.」「My birthday is February 29th.」（ビリモの設定）のままで、リコや キコが ビリモの なまえ・たんじょうびを 名のっていた（L181・185・187・188・190・206・210）。ほかにも「I like science.」（その回の キコは math と English）、「Please call me Haru.」を キコが いう（L243）、「I went to Okinawa」を キコが いう（L259。おきなわは ハル）など。**全90回の 相手を プログラムで出して 1つずつ 照らし合わせ**、相手キャラの台本・設定に合うように直した
  - キャラ設定の くいちがい: 約12（L207 キコの いちばん すきな きょうか music → art〈L194 と同じ〉、L228・L229・L230 リコの ヒーローを「おばあちゃん（おいしゃさん）」に統一、L236 エマ先生の スピーチを ビリモに〈キコの ヒーローは しょうぼうし〉、L270 キコの とくい singing → drawing、L205 エマ先生が「じゅうい」と名のる → インタビューごっこで じゅうい やく と わかるように）
  - タイトルの重複: 4（L184「What Animal Do You Like?」= L34、L185「My Name Card」= L63、L239「Speech Rehearsal」= L209、L248「My School Day」= L177）。計画書の表も更新
  - 英語: 約10（「I don't like spiders, too」→ either、「cheese cake」→ cheesecake、「Cook a soup」→ Make some soup、「What don't you have?」→ Do you have an aquarium?、「I can hear summer stories all day」→ I want to hear more summer stories! など）
  - 会話の流れ: 約6（L219 お会計のあとに「That's all.」→ 先に Anything else? ― That's all, thank you. → Your total is…、L266 リコが ハルの スピーチの つづきを 先に いう → ハル自身が Then, I saw a starfish. と つなげる、L206 ビリモが 話していないのに「Thank you for listening!」など）
  - 日本語: 直したセリフに合わせた訳 ＋ L243 の「5月5日」などの漢字の日づけを「5がつ 5にち」に
- 例
  - L181 最初のことば「Hello! My name is Birimo.」（実際は ハルが 話す）→「Hello! I'm Haru. Nice to meet you. What's your name?」
  - L192「Let's clean the classroom, too!」（ようびの 時間わりの こたえとして 不自然）→「Science is fun!」
  - L195 ハルの ゆめの時間わり swimming → soccer（L197 で「He can't swim.」）、キコ「I want your timetables!」→「I like your timetables!」
  - L221・L225 ハルが「I'm from far away.」「I'm visiting Japan.」→「Let's role-play! I'm a friend from far away.」のように ごっこ遊びと わかる形に
  - L233 プールが ほしい セリフを リコに（およげないはずの ハルから）、相手キコの 最初のことばを パイやさんに
- タイトルは 1〜270 で すべて別々（英語・日本語とも）であることを確認
- tsc / vitest（24ファイル・700件）/ next build すべて通過

### 判断したこと
- 会話相手を決める `pickConversationPartner` は「I'm ～.」だけを 自己紹介として 見る。コードは変えず、最初のことばのほうを「I'm Riko.」の形にしたり、キャラの なまえを 出さない形にしたりして 合わせた（コードを変えると ほかの ワールドの ローテーションも 変わるため）
- ワールド9〜12 の topic にある「学校生活と1日」「行きたい国」などの漢字は、計画書の単元名と そろえた 保護者向けの見出しで、ワールド10〜12 も 同じ書き方なので そのまま
- 「He can't swim.」（L197）の あとも L263「I enjoyed swimming in the sea.」は 1年後の できごととして 残した（中心表現のため）
- 重複タイトルで 相手が ワールド10〜12 の回（L246 ↔ L341「What Time Do You Get Up?」、L226 ↔ L351「Who Is Your Hero?」、L268 ↔ L298・L328「Speech Practice」、L64 ↔ L283）は、あとの回を ワールド10〜12 の レビューで 直す ことにした

## Phase 5 — カリキュラム品質レビュー ワールド10〜12（Lesson 271〜360、docs/night2/REVIEW.md）

### やったこと
- 90レッスンを ぜんぶ読み、REVIEW.md のチェック項目で その場で直した。スキーマ・レッスン数・フォニックス（focus・rule・words）・ファイルの書式は変えていない（レッスンごとの範囲で「1か所だけ一致」を確かめながら 文字列を置きかえる スクリプトで修正）
- **なおしたレッスン: 60 / 90**（ワールド10: 13、ワールド11: 18、ワールド12: 29）＋ ワールド8 の L212（タイトルの重複。前回のレビューで見のがしていた）
- 内容別のおおよその件数（1レッスンで複数あり）
  - **キャラ設定の くいちがい: 約20**（いちばん多かった）。ワールド11〜12 で キャラの ゆめ・ぶかつ・おもいでが 回ごとに ばらばらだったので 統一した → ハル: ゆめ サッカーせんしゅ／バスケットボールぶ／いちばんの おもいで しゅうがくりょこう、リコ: ゆめ せんせい／テニスぶ、キコ: ゆめ かしゅ／びじゅつぶ（えが とくい）、ビリモ: ゆめ パンやさん
  - **AI 会話の最初のことばと 相手キャラの くいちがい: 約25**。ローテーションで決まる相手が、ほかのキャラの セリフ・設定を 自分の ことのように 言っていた（L313 ハルが「I want to be a swimmer.」、L315 キコが「I want to be a baker.」、L346 リコが「I went to the sea.」など）。また「I am Kiko.」は 自己紹介として 読まれず、名前が 出た キャラが 相手から 外れるため、L331・L335・L356 では 名のる キャラと 実際の 相手が ちがっていた → 「I'm Haru.」「I'm Riko.」の形に。**全90回の 相手を プログラムで出して 照らし合わせ、くいちがいが 0 件**であることを 確認
  - 目標表現・中心表現が 会話に 出てこない: 約25（L312 の「Why do you want to be a baker?」、L315「Why do you want to be a singer?」、L354「Why ～?」の やりとりを 追加、L337「No, I can't.」、L346「I went to the sea in summer.」、L360 の 中心表現「Thank you for a wonderful year.」を 会話に、L336・L338・L340・L341・L344・L345・L349・L350・L355・L357 は 表現を 会話の 中身に 合わせた）
  - タイトルの重複: 9（L283・L298・L328・L334・L341・L346・L349・L351 と L212）。計画書の表も更新
  - 英語・文法: 約10（L274「Turtles think they are jellyfish」→ the bags are、L282・L286 の 3人称単数 says / wears / goes をさけた言い方に、L288・L316・L356 の will をさけた言い方に、L307「Where were my shoes?」→ My shoes were so muddy、L296「call out to everyone」→ ask everyone to help など）
  - 会話の流れ: 約6（L332 1年間 教えている エマ先生が ハルに「Nice to meet you」→ ともだちしょうかいの れんしゅうに、L333 キコが リコに ビリモを「おにいさん？」→ キコの おにいちゃん〈L247 の 設定〉の はなしに、L355 インタビューされた キコが「インタビュー ありがとう」→ インタビューした リコが いう、L306 そつぎょうする 小6が「らいねんも はしりたい」→ ちゅうがくでも）
  - TPR の安全・しやすさ: 7（L289「はりに いとを とおす」→ えの なかの はりを ゆびさす、「ともだちを くすぐる」→ じぶんの おなか、L278・L341・L344 の「～へ はしって」→ その ばで、L293 はしる まね → その ばで、L297「Cry "Hooray!"」→ Shout）
  - 日本語: 直したセリフ・表現に合わせて 訳も 見直し（約60）
- 例
  - L305 アルバムの まとめ: ハルが「いちばんの おもいでは おんがくかい」（L301 では しゅうがくりょこう）、リコが「しゅうがくりょこう」（L302 では うんどうかい）→ ハル＝しゅうがくりょこう（なら）、リコ＝うんどうかい、ビリモ＝おんがくかいで ドラム
  - L326 リコの ゆめ「いしゃ」（L311・L314・L329・L330 では せんせい）→「My dream is to be a teacher. Because I want to teach children.」。中心表現・単語（sick / hospital → children / school）・計画書も更新
  - L320 ハルが テニスぶに さそう／キコが かがくぶ → ハル「I want to join the basketball team. It's the strongest team!」、キコ「I want to join the art club.」
  - L339・L340: キコ「おんがくぶ」↔ びじゅつぶ、リコ「びじゅつぶ」↔ テニスぶ を 統一
  - L353 ハルの 最初のことば「I like summer because I can swim.」（ハルは ふゆが すきで、L197 で およげない）→「I like winter because I can ski.」
- タイトルは 1〜360 で すべて別々（英語・日本語とも。記号を のぞいて くらべた）であることを確認
- tsc / vitest（24ファイル・700件）/ next build すべて通過

### 判断したこと
- 中心表現が 会話では 2つの セリフに 分かれて出る回（L312「I want to be a baker.」→ Why? →「Because I like bread!」、L315 も 同じ）は、インタビューの 自然な やりとりなので そのまま
- 表現が 会話では 少し ちがう形で 出る回（L308「Our teacher said, "Well done!"」↔「Ms. Emma said, "Well done!"」、L343「I have six classes a day.」↔「They have six classes a day.」、L352「When is the concert?」↔「when is your concert?」など 約15件）は、意味と 型が 同じなので そのまま
- L321「I could swim 25 meters.」の could（1回できた ことには ふつう was able to）は、小学校の 教科書の 型に そろえて 残した
- ワールド10 の 3人称単数（lives / says）は 先生の セリフでも さけ、ワールド11 の L327（She wants to be ～.）から 出す 形に そろえた
- L313 の 単語 doctor（中心）は、ゆめの しごとの 単語として 残した（会話には 出ないが 単語クイズで つかう）
