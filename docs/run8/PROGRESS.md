# Run 8 progress

## フェーズ1: 先生の 台本の 設計 ＋ ワールド1（L1〜30）

### やったこと
- **設計書** docs/teacher-plan.md（日本語）: 台本の 形、9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）、長さの 計算（3〜4 分）、ワールドごとの 英語の わりあい、ジェスチャー 7 種の つかいかた、黒板（スライド）の ルール、まち時間（pauseMs）の しくみ、書きかたの 約束。
- **型** `LessonDef.teacher?: TeacherScript`（src/lib/domain/types.ts）。省略可なので 旧データ・ワークシート（Python）は そのまま。むかしの `teacherScript` も のこした。
- **API 契約** contracts.ts に `TeacherScriptSchema` を 追加（こわれた セグメントは すてる、無ければ undefined）。フェーズ8 の プレイヤーが そのまま つかえる。
- **長さの 計算** src/lib/teacher/timing.ts（`scriptMs` / `englishShare` / `immersionFor` / `unknownSlideItems`）。テスト・プレイヤー・エクスポーターで 同じ 計算を つかう。
- **とりこみスクリプト** scripts/teacher-merge.ts（`npm run teacher:merge -- 下書き.json [--dry] [--strict] [--force]`）。すでに teacher が ある レッスンは とばす（やりなおしても 安全）。長さ・英語の わりあい・スライドの ことばを 表示して チェック。
- **台本 30 レッスン**（L1〜30、ワールド1）: 合計 589 セグメント、1 レッスン 188〜214 秒（平均 約 3.2 分、合計 約 97 分）、英語の わりあい 28〜43%（W1〜2 の めやす 15〜50%）。さいごは かならず その回の AI 会話の あいて（pickConversationPartner と 同じ キャラ）へ つなぐ。L30 は ワールド1 の フィナーレ（じこしょうかい ＋ あしたの ボスせんへ）。
- **テスト** tests/teacher.test.ts（12 件）: L1〜30 に 台本が ある・8 セグメント以上で 9 つの kind が 順番どおり・180〜240 秒・repeat の まち時間 ≥ 1.5 秒・tpr に まち時間・スライドの ことばが レッスンに ある・日本語字幕は ぜんぶ／英語が 入れば 英語字幕・lang と 中身が あう・英語の わりあいが ワールドの はんい内（W21〜 は 英語だけ）・ドル表記や ほんとうの なまえを 聞く 文が ない・API 契約を とおっても のこる。

### きめたこと（判断の 記録）
- **長さの 見つもり**: 英語 1 語 0.46 秒（約 130 語/分。こども向けに ゆっくり）、日本語 1 文字 0.145 秒（約 7 文字/秒）、セグメントの きりかえ 0.5 秒、それに pauseMs を たす。3〜4 分 = 180〜240 秒。
- **英語の わりあい**は「話す 時間の うち 英語の 時間」で はかる（まち時間は のぞく）。W1〜2: 15〜50% / W3〜6: 40〜70% / W7〜12: 65〜92% / W13〜20: 88〜100% / W21〜40: 99.5% 以上（ja や mix の セグメントは 使えない）。
- **まち時間**は セグメントの おわりに 1 回だけ。だから「まねして いってね」は 1 セグメント 1 フレーズに した（1 レッスン 16〜22 セグメントに なる）。動画に する ときは `[PAUSE 3.0s]` の 印に する予定（フェーズ9）。
- **スライドの ことば**は レッスンに ある 文字だけ（vocab・expressions・tpr・phonics・grammar・title・会話の セリフ・aiTask）。大文字小文字・文末の 記号の ちがいは 同じと みなす。ほかの 回の ことばが 黒板に 出ないように した。
- 字幕は どの ワールドでも 日本語を かならず つける。英語が 入る セグメントには 英語字幕。
- 下書きは tmp-teacher/（.gitignore）に 書いて merge スクリプトで 入れる。L2〜30 は 3 つに わけて 並行で 書き、L1 を お手本に した。
- L14 は 182 秒と みじかめ だったので、がっこうの ことば（school / teacher / chair）の repeat を 1 つ たして 約 190 秒に した。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 75 ファイル 2,539 件 OK / `npx next build` OK / `npm run curriculum:check` OK

### 例（L1 から）
- words: 「hello. hello は「こんにちは」。てを ふりながら いうよ。Hello! さあ、てを ふって、いっしょに。」（gesture: wave、pauseMs 2,500）
- tpr: 「こんどは はやく いくよ。よーく きいてね。Look! Stop! Come here! Go!」（gesture: mime、pauseMs 5,000）

## フェーズ8: バーチャル先生プレイヤー（うごく エマ先生の 教室）

### やったこと
- **せんせいステップを 作りなおし**（src/components/teacher/VirtualClassroom.tsx）: videoUrl が ない ときは「バーチャル教室」。スマホは 上に エマ先生・下に 黒板、タブレット（640px〜）は 左に エマ先生・右に 黒板。その下に 字幕（英語＋日本語）、すすみぐあいの バー（パートごとの 色・タップで ジャンプ）、コントロール。
- **うごく エマ先生**（src/components/teacher/EmmaAnimated.tsx）: TeacherArt を 部品（Arch / EmmaBackHair / EmmaTorso / EmmaFace / EmmaSmile / OpenHand）に わけて、同じ キャラの まま 組みなおした（TeacherArt の 見た目は かわらない）。
  - いき（からだが ゆっくり ふくらむ）・まばたき（CSS）。
  - 口の 形 7 つ（rest / a / e / o / u / m / f）。speechSynthesis の boundary（ことばの 位置）が 来れば それに あわせ、来ない 声では 文を 時間で ループ。口だけ 自分の requestAnimationFrame で 再描画（ほかの 部品は memo）。
  - ジェスチャー: wave・point（黒板を さす 人さし指）・nod・clap・think（あごに 指＋首を かしげる）・open_hands・mime（りょうてを 上げて はずむ）・talk・rest。うでは「ひじ」が 原点の リグ（前腕＋上腕＋手）で、ポーズの あいだは CSS transition で なめらかに うごく。wave・clap・nod・open_hands は さいしょの 3.5 秒だけ して、話す ときの 手に もどる。まち時間は tpr → mime、check → think、それ以外 → open_hands（あなたの ばん）。prefers-reduced-motion では 動きを とめる。
- **声**（src/components/teacher/useTeacherPlayer.ts）: 英語は en-US の 女性の 声、日本語は ja-JP の 女性の 声。mix の 文は 言語ごとに わけて 声を きりかえる。0.8 / 1.0 倍、一時停止（再開すると その 文から）、もどる、もういちど（セグメント）、とばす、音あり／なし、字幕（りょうほう／にほんご／えいご／なし）。
- **いってみよう！**: pauseMs の あいだ 黒板に「いってみよう！」（tpr は「からだで やってみよう！」、check は「かんがえてみよう！」）と カウントダウンの 輪。🎤 を おすと マイクの 音量メーター（任意。ことわられても「マイクは つかわなくても だいじょうぶ！」と 出して そのまま すすむ）。
- **音なしでも うごく**: speechSynthesis が ない・声が ない・ミュートの ときは、タイムラインの 見つもり時間で 字幕・口・カウントダウンが すすむ。DB なしでも レッスンの データだけで うごく。
- **本物の 動画**: videoUrl が ある ときは `<video>` を 再生し、となりに 同じ 名前の .vtt が あれば 日本語字幕の track を つける（src/lib/teacher/media.ts の vttUrlFor。HEAD で ある か しらべる）。
- **タイムライン**（src/lib/teacher/timeline.ts。ブラウザに 依存しない）: buildTeacherTimeline（台本 → セグメント・声の 単位・時刻）、splitByLanguage、speakable（～ や ― を 間に）、segmentDurationMs / segmentAt / segmentStartMs（速さ こみ）、visemeOf / visemeAt。
- **台本が まだ ない レッスン**（いまは L31〜1200）は、その レッスンの ことば・会話・フォニックス・TPR・表現から、同じ 9 つの ながれの 授業を その場で つくる（autoScript。W1〜6 は 日本語の 説明つき、W7〜12 は やさしい 英語＋日本語、W13〜 は 英語だけ＋日本語字幕。さいごは 会話の あいてへ つなぐ）。
- **テスト** tests/teacher-timeline.test.ts（23 件）: 言語の 切りわけ・L1 の 台本が そのまま つかわれて 時刻が すきまなく つながる・合計が scriptMs と 5% 以内・0.8 倍・時刻 ↔ セグメント・自動の 授業の 順番と 黒板の ことば（1,200 レッスン ぜんぶ）・W13〜 は 英語・W21〜 の 英語の わりあい・会話の あいて・口の 形・.vtt の URL・声の えらびかた。
- **スクリーンショット** scripts/teacher-screens.ts（`npm run teacher:screens`。つながらない DB で next start → Playwright）: L1・300・700・1100 × スマホ 375px／タブレット 820px × 「はじめる まえ／話している ところ／いってみよう！」の 24 まいと、ジェスチャー 4 まい（wave・mime・think・clap）を docs/run8/screens/ に 保存。横の はみ出し なし・コンソールの エラー なし・カウントダウンが 出る ことも チェック（ぜんぶ OK）。

### きめたこと（判断の 記録）
- 自動で 鳴らさない（iOS などは タップが ないと 声が 出ない）。さいしょに「▶ じゅぎょうを はじめる」。
- 声の 一覧が からの ブラウザ（ヘッドレスなど）は「声なし」と みなして 時間で すすめる。声が 出ない ときは「こえが でない ときは じまくで すすむよ」と 出す。
- speechSynthesis.pause() は Android などで あてに ならないので、一時停止は 声を とめて、再開したら その 文から もういちど 読む。
- ながい 読み上げが とちゅうで 止まる ブラウザが あるので、1〜2 文ずつ 読む。onend が 来ない ときの 保険（見つもり × 2.2 ＋ 3 秒）。
- 自動の 授業は 約 2〜3 分と みじかめ（台本が とどくまでの つなぎ）。台本の セグメントが 3 つ 未満の こわれた データも、自動の 授業に する。
- スクショで 見て なおした こと: 「a」の 口が 大人の 顔には 大きすぎた → 小さく した（scale 1.35 → 1.25）。think の 手が あごより 下だった → ひじを 上げた。黒板の 見出しと 同じ ラベルの チップは 出さない。下の ナビに かくれない よう、スクショは 教室まで スクロールした 画面で とる。
- 「つぎへ」は いつでも おせる（まえと 同じ）。ステップを はなれると 声は かならず とまる。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 76 ファイル 2,562 件 OK / `npx next build` OK / `npx tsx scripts/teacher-screens.ts` ぜんぶ OK

## フェーズ9: 本物の AI アバター動画への 書きだし（あとで つかう）

### やったこと
- **書きだし** scripts/teacher-export.ts（`npm run teacher:export`。`--from/--to`・`--only-script`・`--summary-only`・`--out`。時間制限 5 分・100 レッスンごとに 進みぐあいを 表示）。中身の 計算は ブラウザに 依存しない src/lib/teacherVideo/export.ts。
  - `exports/teacher/<0001>/script.txt`: 人が 読める 台本。`#` 行は メモ（パート・ジェスチャー・黒板・時刻）、`[PAUSE 2.5s]` は 子どもが まねする まち時間（tpr は「からだを うごかす」、check は「かんがえる」の メモつき）。
  - `script.json`: セグメントごとの データ（say・言語ごとの かたまり parts・字幕・gesture・slide・見つもりの 時刻 start/speak/pause/end）と レッスンの 合計・英語の わりあい・語数。
  - `subtitles.vtt`（日本語＋英語の 2 行）と `subtitles.ja.vtt`・`subtitles.en.vtt`: 7 秒を こえる 話は 文ごとに 字幕を わける。まち時間には「（いってみよう！）/(Your turn!)」の 字幕。
  - `slides.json`: 黒板の 中身と 出す 時刻。
  - `exports/teacher/summary.csv`: レッスンごとの 話す 秒・まち時間・合計 秒・分・切り上げ分・英語％・語数と、さいごに TOTAL 行（UTF-8 BOM つき で Excel で ひらける）。
- **プロバイダー** src/lib/teacherVideo/index.ts: `TeacherVideoProvider.generate(lesson)` → `ready`（動画 URL＋となりの .vtt）/ `pending`（つぎに すること 4 つ）。実装は `manual` だけ（本物の サービスの API は 書いていない）。
- **動画の つなぎ先** content/teacher-videos.json（マニフェスト）＋ src/lib/teacherVideo/manifest.ts。`buildLessonFlow` が ここを 見て、動画が あれば せんせいステップに `videoUrl` を 入れる（P8 の プレイヤーが 動画＋字幕を 再生。なければ バーチャル先生）。
- **つなぐ スクリプト** scripts/teacher-link.ts（`npm run teacher:link`）: `link N URL`・`link-range --from --to --pattern ".../lesson-{nnnn}.mp4"`・`unlink`・`list`・`check [--head]`（HEAD で 動画と 字幕が あるか。1 本 10 秒まで）・`--dry`・`--note`。
- **手引き** docs/run8/VIDEO-VENDORS.md: ながれ・ファイルの 説明・えらぶ ときに 見る ところ（日本語＋英語の 声・まぜた 文での 声の きりかえ・リップシンク・ジェスチャー・商用ライセンス・オリジナル アバターの 権利・ダウンロード配信の 可否・解約後・1 分 単価と 切り上げ・API／一括）・ためしかた（L1・W10・W24 の 3 本）・summary.csv からの 費用の 見つもりかた・つなぎかた。値段や サービス名は 書かず「最新の 公式ページで たしかめる」と した。
- README の コマンド表に teacher:export / teacher:link を 追加。
- **テスト** tests/teacher-export.test.ts（14 件）: L1 の 書きだしが 台本どおり・長さが プレイヤーと 同じ、script.txt の PAUSE と 読む 行の 数、VTT の 形・時刻が ふえていく・日本語／英語だけの VTT、slides、auto の レッスン、1,200 レッスン ぜんぶ 書きだせる、summary.csv の 行数・TOTAL・合計、マニフェストの チェック・URL の 制限・link/unlink/pattern、手動プロバイダーの ready/pending、レッスンの ながれの videoUrl。

### きめたこと（判断の 記録）
- **動画の URL は DB では なく JSON マニフェスト**（content/teacher-videos.json）。DB が ねていても おためし・オフラインで 同じ 動画が 出る・git で 変更が のこる・1,200 本でも 約 100KB で ブラウザに のっても よい。手で 書いても よいが、teacher-link なら URL を チェックする。
- URL は `https://` か `/`（public/）だけ（javascript: など を ふせぐ。http は localhost だけ）。
- 字幕は P8 の プレイヤーに あわせて「動画と 同じ 名前の .vtt を となりに」。マニフェストには 字幕の URL を もたない。
- 台本が まだ ない レッスン（いまは L31〜1200）も、バーチャル先生と 同じ 自動の 授業を 書きだす（source=auto）。見つもりの 目安に なるが、本番の 動画は `--only-script` で 台本の ある レッスンだけ つくる よう 手引きに 書いた。
- exports/teacher/ は 約 7,200 ファイル なので .gitignore（作りなおせる）。summary.csv だけ コミット。
- 字幕の 時刻は 読む はやさからの 見つもり。日本語と 英語の 文の 数が 同じ ときは 同じ 文どうしを 同じ 字幕に、ちがう ときは 文字数で わける（すこし ずれる ことが ある → 動画が できたら 時刻を あわせる と 手引きに 書いた）。
- いまの 見つもり: 1,200 本 合計 約 2,906 分（48.4 時間）、1 本ずつ 切り上げで 3,596 分（台本 30 本＋自動 1,170 本）。台本が そろうと 約 60〜80 時間の 見こみ。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `npx tsx scripts/teacher-export.ts` 1,200 レッスン 約 8 秒 / `teacher-link.ts` の link・link-range・不正 URL・list・check を --dry で 確認

## 台本ブロック: L31〜90（ワールド2・3）の 授業台本（docs/run8/SCRIPTS.md）

### やったこと
- L31〜90 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。L1〜30 と 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）、そのレッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド2（L31〜60）: 30 レッスン・564 セグメント・195〜224 秒・英語 33〜44%（めやす 15〜50%）。日本語で 説明し、英語は お手本・合図・まねする 文。W1 より「Listen.」「Your turn!」「Great job!」など 教室の 英語を ふやした。
  - ワールド3（L61〜90）: 30 レッスン・604 セグメント・191〜210 秒・英語 52〜64%（めやす 40〜70%）。まず やさしい 英語で いって、すぐ みじかい 日本語で たすける。英語だけの セグメントも ふえた。
  - 合計 1,168 セグメント・約 203 分。まとめの 回（L35・40・45・50・55・60・65・70・75・80・85・90）は ユニットの 文型を おなじ ながれで ふりかえる。
  - さいごは かならず その レッスンの 会話の あいて（pickConversationPartner と 同じ キャラ）へ「このあと ～と おはなし してみてね」と つなぐ。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜30 → L1〜90 に のばした（docs/teacher-plan.md も）。
- exports/teacher/summary.csv を 作りなおした（台本 90 本・自動 1,110 本、合計 約 2,990 分）。

### 例（みじかく）
- L41 Can It Fly?（W2・会話）: 「おにわで キコちゃんが なにかを みつけたよ。きいてね。Look! A butterfly! Can it fly? Yes, it can. Look at its wings! Wow! It can fly high!」
- L78 Mixing Colors（W3・まねして）: 「Repeat after me. まねしてね。It's orange!」→「Red and yellow make orange.」→「Your turn. あなたなら、なにいろと なにいろを まぜて みたい？ Let's mix の あとに、すきな 2つの いろを いれてね。」

### きめたこと（判断の 記録）
- 60 本を 10 本ずつ 6 つに わけて 下書き（tmp-teacher/L031-040.json など。git には 入れない）を 同時に 書き、`scripts/teacher-merge.ts --strict` で とりこんだ（1 つでも NG なら 書かない。すでに 台本が ある レッスンは とばすので やりなおしても 安全）。結果は 60 本 ぜんぶ OK。
- 会話の あいては pickConversationPartner で レッスンごとに 計算して 下書きに わたした（会話ステップの キャラと 台本の さいごの ことばを そろえる）。
- とりこんだ あと goal を ぜんぶ 読みなおし、英語が ぎこちない 2 本を なおした（L69「And share with, Here's my jacket.」→「And be kind. Say, here's my jacket.」、L78「Listen to, red and yellow…」→「Mix colors and say, it's orange! Red and yellow make orange.」）。
- 長さは どれも 190 秒 前後〜225 秒に おさめた。195 秒 未満の 回は minutes を 3、それ以外は 3.5 に した（0.5 きざみで 近い 値）。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 60 本 problems 0

## 台本ブロック: L91〜150（ワールド4・5）の 授業台本（docs/run8/SCRIPTS.md）

### やったこと
- L91〜150 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。これまでと 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）で、その レッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド4（L91〜120）: 30 レッスン・620 セグメント・190〜213 秒・英語 53〜63%（めやす 40〜70%）。ABC・カード・クイズ・なりきり・ようすの ことば・はっぴょう。
  - ワールド5（L121〜150）: 30 レッスン・631 セグメント・191〜221 秒・英語 54〜64%。あいさつ・てんき・ようび・じこく・ぶんぼうぐ・いちにちの ようす。
  - 合計 1,251 セグメント・約 204 分。まとめの 回（L95・100・105・110・115・120・125・130・135・140・145〜150）は ユニットの 文型を おなじ ながれで ふりかえる。L120・L150 は ワールド全体の まとめで、さいごに つぎの ワールドの 予告を ひとこと 入れた。
  - W3 と 同じ「まず やさしい 英語 → すぐ みじかい 日本語の たすけ」。合図・お手本・ほめる・まねする 文は 英語だけの セグメントを ふやした。
  - じぶんの なまえを いう 練習（L116・118・120・125 など）には「ニックネームでも いいよ」を 入れた。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜90 → L1〜150 に のばした（docs/teacher-plan.md も）。
- exports/teacher/summary.csv を 作りなおした（台本 150 本・自動 1,050 本、合計 約 3,067 分＝51.1 時間、1 本ずつ 切り上げで 3,754 分）。

### 例（みじかく）
- L99 A Card for You!（W4・会話）: 「On the snowy slope, Kiko says, Birimo! This is for you. Birimo says, Wow! A sled card! Thank you. I like it! キコちゃんが そりの カードを プレゼント したよ。」→「わたす ときは This is for you、もらったら Thank you、おれいを いわれたら You're welcome。」
- L129 Hot Day, Cold Day（W5・からだで）: 「It's hot! Swim like a fish. Wipe your face. うでを まわして すいすい およいで。」→「Speed challenge! Click! It's hot! Swim like a fish! Click! It's cold! Rub your hands! …」

### きめたこと（判断の 記録）
- L31〜90 と 同じく、10 本ずつ 6 つの 下書き（tmp-teacher/L091-100.json など。git には 入れない）を 同時に 書き、`scripts/teacher-merge.ts --strict` で とりこんだ。60 本 ぜんぶ OK（problems 0）。下書きの 手引き tmp-teacher/WRITER-BRIEF.md を W4・5 むけに なおした（見本は W3 の 台本、英語の ねらいは 52〜64%。W5 は W4 より すこし 英語を 多めに）。
- 会話の あいては pickConversationPartner で 計算した（tmp-teacher/partners-91-150.json）。とりこむ まえに 全 60 本の wrap の キャラ名を 機械で しらべ、1 本（L138 が ハルくんに なっていた → リコちゃん）を なおした。
- 下書きの 段階で 英語が 73〜77% に なって めやす（70%）を こえた ブロックが 3 つ あった → 日本語の たすけを ふやして 53〜64% に した（66% の 手前で とめる）。
- goal を 60 本 ぜんぶ 読みなおした。ぎこちない 英語は なかったので そのまま。
- minutes は 195 秒 未満の 回（L92・96・97・98・113・123・126）を 3、それ以外を 3.5 に した。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 60 本 problems 0

## 台本ブロック: L151〜210（ワールド6・7）の 授業台本（docs/run8/SCRIPTS.md）

### やったこと
- L151〜210 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。これまでと 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）で、その レッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド6（L151〜180）: 30 レッスン・630 セグメント・190〜222 秒・英語 60〜66%（めやす 40〜70%）。こもじ・まちの かんばん・カフェと パフェの ちゅうもん・がっこうの へやと みちあんない・いちにちの ようす・First／Then の おはなし。
  - ワールド7（L181〜210）: 30 レッスン・628 セグメント・192〜225 秒・英語 80〜84%（めやす 65〜92%）。ja だけの セグメントは 0（すべて en か mix）。じこしょうかい・つづり・すきな もの・つき と たんじょうび・きょうか と じかんわり・can／he／she・しごと。
  - 合計 1,258 セグメント・約 209 分。まとめの 回（L155・160・165・170・175・180・185・190・195・200・205〜210）は ユニットの 文型を おなじ ながれで ふりかえる。L180・L210 は ワールド全体の まとめで、さいごに つぎの ワールドの 予告を ひとこと 入れた。
  - W7 は「やさしい 英語が 中心、日本語は みじかい たすけ（subject は きょうか だよ など）」に きりかえた。字幕（subtitleJa）は すべての セグメントに ある。
  - なまえ・つづり・たんじょうびを いう 練習には「ニックネームでも いいよ」「ほんとうの 日で なくても いいよ」を 入れた。できない ことを いう 回（L196〜200）は「No, I can't. But I can ～.」の ように かならず できる ことを そえ、だれも せめない。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜150 → L1〜210 に のばした（docs/teacher-plan.md も）。
- exports/teacher/summary.csv を 作りなおした（台本 210 本・自動 990 本、合計 約 3,144 分＝52.4 時間、1 本ずつ 切り上げで 3,814 分）。

### 例（みじかく）
- L163 Go Straight!（W6・からだで）: 「Stand up! Let's walk to the art room. Go straight. まえに 3ぽ。Turn right. みぎを むいて。」→「Speed challenge! ひっかけに ちゅうい！ Turn left! Turn right! Go straight! Turn right! Go up the stairs! Stop!」
- L198 She Can Play the Piano（W7・会話）: 「Kiko says, This is Riko. She can play the piano. Haru asks, Cool! Can she dance? Kiko says, Yes, she can. And she can cook! リコちゃん、すごいね！」→「Here's the point. For a girl, use she. … he と she を つかいわけよう。」

### きめたこと（判断の 記録）
- これまでと 同じく 10 本ずつ 6 つの 下書き（tmp-teacher/L151-160.json など。git には 入れない）を 同時に 書き、`scripts/teacher-merge.ts --strict` で とりこんだ。60 本 ぜんぶ OK（problems 0）。下書きの 手引き tmp-teacher/WRITER-BRIEF.md を W6・7 むけに なおした（見本は W5 の 台本、英語の ねらいは W6 58〜66%・W7 75〜85%、W7 は ja セグメント 禁止）。
- 会話の あいては pickConversationPartner で 計算した（tmp-teacher/partners.ts を 範囲を 引数で わたせる ように して tmp-teacher/partners-151-210.json）。とりこんだ あと tmp-teacher/audit.ts で 全 60 本の wrap に 正しい キャラ名が あるかを 機械で しらべた（ずれ 0）。
- テストの「ほんとうの なまえを たずねない」チェックに、L176・L177 の「がっこうの なまえは いわなくて OK／いいよ」（いわなくて よい と いう 安全な 文）が ひっかかった → 「へやの なまえで OK。」「じぶんの する ことで いってね。」に いいかえた（テストは ゆるめない）。
- お金の ことばの チェックで L201 の「ハンドル」が「ドル」に ひっかかったが、まちがいの 検出なので そのまま（テストの 正規表現は 英語の dollar／cent だけ）。
- goal を 60 本 ぜんぶ 読みなおした。なおす ほど ぎこちない 英語は なかった。
- minutes は 195 秒 未満の 回（L156・157・158・186）を 3、それ以外を 3.5 に した。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 60 本 problems 0

## 台本ブロック: L271〜330（ワールド10・11）の 授業台本（docs/run8/SCRIPTS.md）＋ L211〜270 の のこり

### はじめに 見つけた こと
- まえの 回（L211〜270）は 下書き（tmp-teacher/L211-220.json〜L261-270.json）を 書いた ところで とまっていた。テストの 必須範囲だけ L1〜270 に なっていて（auto-save）、world-08・09 には 台本が 1 本も 入っていなかった（＝ vitest が おちる 状態）。
- 下書きを しらべると 54 本は OK、L239・L240・L247〜250 の 6 本が ない、L230 が 246 秒で ながすぎ（NG）だった。→ この 回で のこりも かたづけた（6 本を あたらしく 書き、L230 を 220 秒に みじかく）。

### やったこと
- L271〜330 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。これまでと 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）、その レッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド10「いのちの海」（L271〜300）: 30 レッスン・626 セグメント・209〜226 秒・英語 86〜89%（めやす 65〜92%、ja セグメント なし）。うみの いきもの・たべものの さんち・たべものの つながり・せかいの くらし・おすすめ・ちきゅうを まもる ていあん。
  - ワールド11「ゆめの都」（L301〜330）: 30 レッスン・629 セグメント・205〜227 秒・英語 88〜90%。いちばんの おもいで・うんどうかい（was／were・There was／were）・しょうらいの ゆめ・ぶかつ・ありがとうの メッセージ・ゆめの スピーチ。
  - L211〜270 も あわせて 120 本を とりこんだ（W8: 630 セグメント・201〜225 秒・英語 83〜86%、W9: 629 セグメント・205〜229 秒・英語 84〜88%）。
  - L300 は さいごに「Next is World 11, City of Dreams!」の 予告を ひとこと。L330 は つぎの ワールド名を 台本では いわず「あたらしい ぼうけんが まってるよ」に した。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜270 → L1〜330 に のばした（docs/teacher-plan.md も）。
- exports/teacher/summary.csv を 作りなおした（台本 330 本・自動 870 本、合計 約 3,310 分＝55.2 時間、1 本ずつ 切り上げで 3,934 分）。

### 例（みじかく）
- L283 Bow or Shake Hands?（W10・からだで）: 「Let's move! A visitor from Japan. Bow. Slowly! Now, a visitor from America. Shake hands. Nice and firm! じょうずに あいさつ！」→「Speed challenge! Shake hands! Bow! Fly like a bird! …」。表現では「Every greeting is kind. どの あいさつも すてき。」と どの 国の あいさつも みとめる。
- L307 The Races Were Exciting（W11・クイズ）: 「Quiz time! The races, blank, exciting. A, was. Or B, were. Which one?」→「It's B, were! Races means more than one, so we say were. High five! たくさんなら were だね。」

### きめたこと（判断の 記録）
- これまでと 同じく 10 本ずつの 下書き 6 つ（tmp-teacher/L271-280.json〜L321-330.json）と、のこり用の 2 つ（L239-240.json・L247-250.json）を 同時に 書き、`scripts/teacher-merge.ts --strict` で 14 ファイル・120 本を まとめて とりこんだ（problems 0）。手引きは W10・11 むけに tmp-teacher/WRITER-BRIEF-W10-11.md を 新しく 作った（英語の ねらい W10 85〜89%・W11 86〜90%、上限 91%）。
- 会話の あいては pickConversationPartner で 計算（tmp-teacher/partners-271-330.json）。tmp-teacher/audit.ts を 2 つの 一覧を よむ ように して、120 本の wrap の キャラ名を 機械で しらべた（ずれ 0）。
- W10 は こわがらせない（あぶない いきもの → かならず「But we can help!」）、文化は「some people／in many homes」で きめつけない。W11 の おもいで・りょこうは「本当の ことで なくても いいよ」、ゆめは どんな ゆめでも OK、なまえは ニックネームで。
- 「cent」を ふくむ ことばを さけた（L293 recycling center → recycling station、L313 sports center → sports hall、L274 の フォニックスの 例 cent は 台本で つかわない）。
- テストの「ほんとうの なまえを たずねない」チェックに、L248・L310 の「がっこうの なまえは いわなくて いいよ」が ひっかかった（L176 と 同じ）→「じぶんの する ことで いってね。」「つくりばなしでも いいよ。」に いいかえた（テストは ゆるめない）。
- L315 の「ニックネームで でても いいよ」が わかりにくいので「ラジオには ニックネームで でて いいよ。」に なおした。お金チェックの「ハンドル」（L250・294・312）は まちがいの 検出なので そのまま。
- goal を 120 本 ぜんぶ 読みなおした。なおす ほど ぎこちない 英語は なかった。minutes は ぜんぶ 195 秒 以上なので 3.5。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 120 本 problems 0

## 台本ブロック: L331〜390（ワールド12・13）の 授業台本（docs/run8/SCRIPTS.md）

### やったこと
- L331〜390 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。これまでと 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）、その レッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド12「えいごの王国」（L331〜360・ステージ1 さいご）: 30 レッスン・630 セグメント・205〜229 秒・英語 89〜91%（めやす 65〜92%、ja セグメント なし）。be どうし・he／she／they・ぶかつ・いちにちの じかん・がっこうの ばしょ・went／saw／ate／was の おもいで・who／what／when／where／why／how・パーティー・1 年の おもいで。
  - ワールド13「あさひの港町」（L361〜390・ステージ2 はじまり）: 30 レッスン・620 セグメント・209〜226 秒・英語 97〜98%（めやす 88〜100%）。3 たんげんの s／es・doesn't・Does she ～?・always／usually／sometimes／never・みなとの しごと・Really? Me too! などの 会話の コツ。
  - 合計 1,250 セグメント・約 221 分。minutes は ぜんぶ 3.5（すべて 195 秒 以上）。
  - L360 は ステージ1 の フィナーレ: 1 年を ほめて「Thank you for a wonderful year!」、さいごに「ビリモが まだ 地図に ない せかいの 地図を みつけた。あたらしい ぼうけんが はじまる！」（L361「A New Map」に つながる。ワールド名は いわない）。L390 は さいごに「Next is World 14, Bustling Market!」の 予告。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜330 → L1〜390 に のばした（docs/teacher-plan.md も）。
- exports/teacher/summary.csv を 作りなおした（台本 390 本・自動 810 本、合計 約 3,393 分＝56.5 時間、1 本ずつ 切り上げで 3,994 分）。

### 例（みじかく）
- L348 I Ate Curry and Rice.（W12・からだで）: 「Let's move! Set the table. Plate, cup, spoon! Now, Eat with a spoon. Scoop, scoop! じゅんびして、スプーンで たべて！」→「Speed challenge! Eat with a spoon! Fly like a bird! Set the table! Rub your tummy! Whew, I'm full!」
- L368 He Doesn't Like Spiders（W13・クイズ）: 「Quiz time! A, He doesn't likes spiders. Or B, He doesn't like spiders. Careful! Think!」→「It's B! After doesn't, no S. You didn't fall into the spider trap. Amazing!」

### きめたこと（判断の 記録）
- これまでと 同じく 10 本ずつ 6 つの 下書き（tmp-teacher/L331-340.json〜L381-390.json。git には 入れない）を 同時に 書き、`scripts/teacher-merge.ts --strict` で 60 本 まとめて とりこんだ（problems 0）。手引きは tmp-teacher/WRITER-BRIEF-W12-13.md を 新しく 作った。
- **W13 は ステージ2 の はじまり**なので 話しかたを かえた: 英語の ねらい 94〜98%（下限 91%）、日本語は ことばの いみ 1〜2 語（「fisher は りょうし」）や 文法の ちいさな ヒント（「he・she なら s」「doesn't の あとは s なし」）と、wrap の 会話の あいての なまえ だけ。1 レッスン 2〜4 個の mix セグメント（W13 ぜんぶで 87／620）、のこりは en。黒板の 見出しは 英語（Goal / Words / Talk / Sounds / Let's move! / Say it! / Quiz / Answer / Today's wrap-up。日本語の 見出しは 0 を 機械で たしかめた）。
- W12 は ステージ1 の さいご なので めやすの 上の ほう（88〜91%、上限 91.5%）に した。下書きで L338 が 91.6% に なった ので 日本語の たすけを 1 つ たした。
- 会話の あいては pickConversationPartner で 計算（tmp-teacher/partners-331-390.json）。tmp-teacher/audit.ts に この 一覧も よませて、60 本の wrap の キャラ名と お金の ことばを 機械で しらべた（ずれ 0・お金の ことば 0）。
- おもいで・りょこう（L346〜350・358）は「ほんとうの ことで なくても いいよ」、かぞくの 回（L366・367・370・387）は「かぞくでも ともだちでも、つくった ひとでも いいよ」と して、だれでも 参加 できる ように した。しごとは きめつけない いいかた。
- 「がっこうの なまえは いわなくて いい」の ような 文は テストの 正規表現に ひっかかるので、手引きで さいしょから 禁止した（今回は ひっかかり 0）。
- goal を 60 本 ぜんぶ 読みなおした。なおす ほど ぎこちない 英語は なかった。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 60 本 problems 0

## 台本ブロック: L451〜510（ワールド16・17）の 授業台本（docs/run8/SCRIPTS.md）＋ L391〜450 の のこり

### はじめに 見つけた こと
- まえの 回（L391〜450）は 下書き（tmp-teacher/L391-400.json〜L441-450.json）を 書いた ところで とまっていた（auto-save で teacher-plan.md だけ「L1〜450」に なっていて、テストは L1〜390 の まま。world-14・15 には 台本 0 本）。
- 下書きを しらべると 52 本は OK、L409・L410・L430・L438・L439・L440・L449・L450 の 8 本が ない → この 回で 8 本を 書いて（tmp-teacher/L391-450-rest.json）、あわせて とりこんだ。

### やったこと
- L451〜510 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。これまでと 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）、その レッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド16「きおくの いせき」（L451〜480）: 30 レッスン・626 セグメント・208〜229 秒・英語 97〜99%（めやす 88〜100%）。-ed の 過去形・Did you ～?・wasn't／weren't・ふきそくな 過去形（sang・wrote・knew・went・bought・thought・taught・felt）・Once upon a time／First／Then／After that／Finally の おはなし・How did he feel?・How was ～?・はんのうの ことば・日記。
  - ワールド17「ほしふる 天文台」（L481〜510）: 30 レッスン・625 セグメント・205〜227 秒・英語 97〜98%。be going to の よてい・will の 天気よほう・I'll ～（もうしで・やくそく）・月と 地球・わくせい・うちゅうステーション・ながれぼし・Someday I will ～・I think robots will ～・because・せいざ・みらいの じぶんへの 手紙。
  - L391〜450 も あわせて 120 本を とりこんだ（W14: 628 セグメント・205〜228 秒・英語 97〜99%、W15: 629 セグメント・216〜228 秒・英語 97〜99%）。
  - minutes は ぜんぶ 3.5（すべて 195 秒 以上）。L450・L480・L510 は さいごに つぎの ワールドの 予告（Ruins of Memory／Starfall Observatory／Echo Valley）を ひとこと。L500「Star Party」は 500 レッスン 達成を「Congratulations! We studied together for five hundred lessons.」と あたたかく いわう。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜390 → L1〜510 に のばした（docs/teacher-plan.md も L1〜510 に）。
- exports/teacher/summary.csv を 作りなおした（台本 510 本・自動 690 本、合計 約 3,554 分＝59.2 時間、1 本ずつ 切り上げで 4,114 分）。

### 例（みじかく）
- L462 I Thought It Was a Ghost!（W16・会話）: 「Something white is moving over there! … Ha ha! It's just a sheet. Phew! I thought it was a ghost! Were you scared, Kiko? Yes, I was!」→ クイズ「A, Yes, I was. Or B, Yes, I were.」→「It's A! You weren't fooled by the ghost or the quiz.」（こわく しない: おばけは かわかしている シーツ）
- L500 Lesson 500 Star Party（W17・からだで）: 「Hold up five fingers. Five for five hundred! … Make a circle with your arms. A big round cake! Jump for joy! Hooray!」→「おめでとう には Thank you!」

### きめたこと（判断の 記録）
- これまでと 同じく 10 本ずつ 6 つの 下書き（tmp-teacher/L451-460.json〜L501-510.json。git には 入れない）と のこり用の 1 つを 同時に 書き、`scripts/teacher-merge.ts --strict` で 13 ファイル・120 本を まとめて とりこんだ（problems 0）。手引きは tmp-teacher/WRITER-BRIEF-W16-17.md を 新しく 作った（ステージ2: 英語 94〜98%、下限 91%、英語の 見出し、日本語は「go の むかしは went」「よていは going to」の ような ちいさな ヒントと wrap の なまえ だけ）。
- 会話の あいては pickConversationPartner で 計算（tmp-teacher/partners-451-510.json）。tmp-teacher/audit.ts に この 一覧を たして、120 本の wrap の キャラ名を 機械で しらべた（ずれ 0）。お金チェックの ひっかかりは L498 の「ハンドル」（「ドル」を ふくむ）だけで、まちがいの 検出なので そのまま。
- vitest で L470 の フォニックスの スライドが 8 こ（上限 7）で おちた。teacher-merge は この 上限を みないので すりぬけた → "ew" を けして 7 こに した（say は かえない）。
- L500 で「Kiko raises her paw」と なっていた（キコは にんげんの 女の子）→「raises her hand」に なおした（字幕の 日本語は もともと「てを あげる」）。
- いせきは こわく しない（おばけは シーツや トカゲ だった）。週末・りょこう・日記は「ほんとうの ことで なくても いいよ」、おばあちゃんの 回などは「かぞくでも ともだちでも だれでも OK」、ゆめは どんな ゆめでも OK、ながれぼしの ねがいは ひみつでも OK。うちゅうの 事実は かんたんに「about」を つけて（月は 地球の まわりを やく 1 か月で まわる など）。L503・L504・L508 の 手紙では じゅうしょや なまえに ふれず「From the children of Earth」「From me」に した。
- goal は いくつか ぬきとりで 読んだ（全 120 本は 読みなおして いない）。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 120 本 problems 0

## 台本ブロック: L511〜570（ワールド18・19）の 授業台本（docs/run8/SCRIPTS.md）

### やったこと
- L511〜570 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。これまでと 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）、その レッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド18「こだまの谷」（L511〜540）: 30 レッスン・611 セグメント・204〜224 秒・英語 97〜98%（ステージ2 めやす 88〜100%）。比較級・最上級（taller／the tallest）・more／most・better／best・as ～ as／not as ～ as・Which do you like better?・I like A better because ～・I think so, too。こだまの せいを 元気に する おはなし（L526・536・537）は こだまを つかった くりかえし練習に。
  - ワールド19「からくり工房」（L541〜570）: 30 レッスン・629 セグメント・206〜226 秒・英語 97〜98%。It's used for ～ing・First／Next／Then／Finally・Like this?・have to／don't have to・must／must not・should・May I ～?・It's your turn・That's not fair!・by ～ing・reuse。
  - 合計 1,240 セグメント・約 218 分。minutes は ぜんぶ 3.5（すべて 195 秒 以上）。L540 は さいごに「Next is World 19, Gadget Workshop!」、L570 は「Next is World 20, Festival Island!」の 予告を ひとこと。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜510 → L1〜570 に のばした（docs/teacher-plan.md も）。
- exports/teacher/summary.csv を 作りなおした（台本 570 本・自動 630 本、合計 約 3,629 分＝60.5 時間、1 本ずつ 切り上げで 4,174 分）。

### 例（みじかく）
- L522 Not as Fast as a Horse（W18・からだで）: 「Let's move! Get ready, set, go! Now, Run in place. Knees up, up, up! … Walk slowly like a turtle. Slow... slower!」→ クイズ「The horse wins the race. A, I'm as fast as a horse. B, I'm not as fast as a horse.」→「It's B! … But you never give up. Super job!」（じぶんを うまと くらべて わらえる 形に し、子どもどうしは くらべない）
- L552 You Must Not Touch It（W19・会話）: 「Birimo says, Ooh, what's this shiny box? Can I touch it? I say, Stop! You must not touch it. It's hot.」→「Must not is a strong no. … Hot or sharp things? Always ask a grown-up.」→ クイズ「The oven is hot. A, You must touch it. B, You must not touch it.」

### きめたこと（判断の 記録）
- 前回まで（L1〜510）の 台本が そろって いる ことを たしかめ、world-18・19 は 台本 0 本 だったので 60 本 ぜんぶ 新しく 書いた。
- これまでと 同じく 10 本ずつ 6 つの 下書き（tmp-teacher/L511-520.json〜L561-570.json。git には 入れない）を 同時に 書き、`scripts/teacher-merge.ts --strict` で 60 本 まとめて とりこんだ（problems 0）。手引きは tmp-teacher/WRITER-BRIEF-W18-19.md を 新しく 作った（ステージ2: 英語 94〜98%、下限 91%、英語の 見出し、日本語は「くらべる ときは er」「しなきゃ は have to」「だめ は must not」の ような ちいさな ヒントと wrap の なまえ だけ）。
- 会話の あいては pickConversationPartner で 計算（tmp-teacher/partners-511-570.json）。tmp-teacher/audit.ts に この 一覧を たして、60 本の wrap の キャラ名と お金の ことばを 機械で しらべた（ずれ 0・お金の ことば 0）。日本語の 見出し・paw・cent も 機械で しらべて 0。
- W18 は 子どもの からだや のうりょくを 人と くらべて きずつける 文を 禁止（くらべるのは どうぶつ・木・川・かばん・絵）。すきな ものは どれを えらんでも OK（Dogs or cats? Both are great!）。どうぶつの 事実は かんたんで ただしい ものだけ（チーター・キリン・シロナガスクジラ）。
- W19 は 安全を だいじに: はさみ・かなづち・あつい きかいは「Ask a grown-up」（おとなと いっしょに）を かならず いれ、さわらせない。しっぱいは「Let's try again!」で まえむきに。発明は 一般の もの（telephone など）で 会社名・人名は なし。
- L550 の レッスンデータに「center」が あるが「cent」を ふくむ ので、話す ときは「middle」に して スライドにも 出さなかった。L543・L570 の「ハンドル」は「とって」に した。
- L523 は 204 秒（めやす 205〜225 秒より 1 秒 みじかい が 許容 180〜240 秒の なか）なので そのまま。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 60 本 problems 0

## 台本ブロック: L571〜630（ワールド20・21）の 授業台本（docs/run8/SCRIPTS.md）

### やったこと
- L571〜630 の 60 レッスンに lesson.teacher（エマ先生の 3〜4 分の 授業台本）を 書いた。むかしの teacherScript は そのまま。これまでと 同じ 9 つの ながれ（greet → goal → words → expressions → phonics → tpr → repeat → check → wrap）、その レッスンの ことば・表現・フォニックス・TPR・会話の キャラと 場面だけを つかった オリジナルの 文。
  - ワールド20「おまつりの 島」（L571〜600・ステージ2 の さいご）: 30 レッスン・632 セグメント・201〜228 秒・英語 97〜99%（ステージ2 めやす 88〜100%）。Would you like to ～?・I'd love to, but ～（ことわっても OK）・Shall we ～?・しょうたいじょう・People ～（せかいの おまつり）・ホームステイの ことば・When I was little ～・be going to／will・If it rains ～・have to・Why don't we ～?・ステージ2 の ふりかえり（L591〜595）・おもいでアルバム・5 文スピーチ・リハーサル。L600 は ステージ2 の おいわいと「Next is Stage 3. World 21, the Tower of Messages! From now on, English only.」の 予告。
  - ワールド21「ことづての とう」（L601〜630・ステージ3 の はじまり）: 30 レッスン・631 セグメント・205〜226 秒・英語 100%（すべての セグメントが lang "en"、say に 日本語 0。日本語は 字幕だけ）。でんわ（May I speak to ～? / Hold on, please / wrong number）・ビデオ通話（You're on mute / The screen froze）・じさ・でんごん（Can I take a message? / Could you tell her ～?）・He said he was ～・過去進行形（I was ～ing when ～ / While ～）・メール（Dear ～, / Best wishes,）・ネットの あんぜん・絵文字・とりの てがみ。L601 は「From now on, I'll speak only English. Don't worry. Listen, look and guess!」で はじめ、L630 は「Next is World 22!」だけ（つぎの ワールドの なまえは つくらない）。
  - 合計 1,263 セグメント・約 219 分。minutes は ぜんぶ 3.5（すべて 195 秒 以上）。
- tests/teacher.test.ts の「台本が そろって いるべき 範囲」を L1〜570 → L1〜630 に のばした（docs/teacher-plan.md も）。
- exports/teacher/summary.csv を 作りなおした（台本 630 本・自動 570 本、合計 約 3,704 分＝61.7 時間、1 本ずつ 切り上げで 4,234 分）。

### 例（みじかく）
- L574 Shall We Dance?（W20・会話）: 「But Riko says, Um... I'm a little shy. I don't know the steps. I tell her, That's okay. Watch first. … Shall we join the circle? Kiko cheers, Yes, let's!」→「Shall we means, let's do it together. … Feeling shy? It's okay to watch first.」→ クイズ「You want to dance with your friend. What do you say? A, Shall we dance? B, Turn around.」
- L607 You're on Mute!（W21・英語だけ）: 「Birimo talks and talks, but there's no sound! Kiko says, Birimo, you're on mute. Click the microphone.」→ からだで「Mute means quiet. Put your finger on your lips. Shh. Now, click the button. Click!」→ クイズ「You can hear your friend, but you only see ears. A, Can you turn on your camera? B, You're on mute.」

### きめたこと（判断の 記録）
- 前回まで（L1〜570）の 台本が そろって いる ことを たしかめ、world-20・21 は 台本 0 本 だったので 60 本 ぜんぶ 新しく 書いた。
- これまでと 同じく 10 本ずつ 6 つの 下書き（tmp-teacher/L571-580.json〜L621-630.json。git には 入れない）を 同時に 書き、`scripts/teacher-merge.ts --strict` で 60 本 とりこんだ（problems 0）。手引きは tmp-teacher/WRITER-BRIEF-W20-21.md を 新しく 作った（W20 は ステージ2: 英語 94〜98%・ちいさな 日本語ヒント、W21 は ステージ3: 英語だけ、いみは やさしい 英語・ジェスチャー・はんたいの ことばで 説明）。
- 会話の あいては pickConversationPartner で 計算（tmp-teacher/partners-571-630.json）。tmp-teacher/audit.ts に この 一覧を たし、W21 は wrap に 英語の なまえ（Riko など）が あるかを しらべる ように した。60 本で ずれ 0・お金の ことば 0。
- W20: ことわるのも ていねいなら OK、たべものは「No, thank you」で いい、ろうそく・はなび・ちょうちんは おとなと いっしょに あんぜんな ところから。L577・L580 の データに ある 国の なまえ（In India …）は スライドに 出さず「In some countries」と ぼかした（ステレオタイプを さける）。L600 の 予告は 2 つめの wrap セグメント（スライド見出し「Next」）に した。
- W21: ほんとうの でんわ番号・メール・パスワード・じゅうしょ・がっこうは 聞かない。L624 の データの 文「Don't share your address online.」は テストの きんし語（your address）に あたる ので、say と 字幕では「your home address」「おうちの ばしょ」と いいかえ、スライドには データの 文を そのまま のせた（スライドは きんし語チェックの 外）。L625 の「じゅうしょや がっこうの なまえは かかないで」に あたる セリフは 入れなかった。L611・L629 の「Message Center」は つかわず（L615 は タイトルなので そのまま）。L616〜620 の パイの なぞは だれも しからない おはなしで、はんにんは おなかを すかせた ひなどりたち、さいごに あやまって みんなで パイを やきなおす。
- L594 は 201 秒（めやす 205〜225 秒より みじかい が 許容 180〜240 秒の なか）なので そのまま。
- goal・会話は いくつか ぬきとりで 読んだ（全 60 本は 読みなおして いない）。

### チェック
- `npx tsc --noEmit` OK / `npx vitest run` 77 ファイル 2,576 件 OK / `npx next build` OK / `teacher-merge --strict` 60 本 problems 0
