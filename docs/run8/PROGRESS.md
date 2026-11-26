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
