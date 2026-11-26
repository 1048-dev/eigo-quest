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
