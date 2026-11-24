# Night progress

## Phase 1 — 学習ルール（2026-11-24）

### やったこと
1. **対象年齢を 6〜12歳に変更**: README.md、package.json の description、AI採点のシステムプロンプト（src/lib/grading/aiGrader.ts）。
2. **テスト定義（src/lib/curriculum/index.ts）**
   - `check-N`（DAILY_CHECK）を**すべてのレッスン**に作成（5・30の倍数にも）。「復習クエスト」として `unlocksLesson = null`。
   - `mini-(N-4)-N`（5の倍数・30の倍数以外）と `boss-1-N`（30の倍数）は「関門」のまま（`unlocksLesson = N+1`）。アリーナは変更なし。
   - `gateTestAfterLesson(N)` は MINI/BOSS だけを返す。新しく `reviewQuestFor(N)` を追加。
3. **進行（src/lib/domain/progression.ts）**
   - レッスン N を終え、N の後の関門（あれば）に合格すると、**すぐ** N+1 が開く。関門もレッスン直後から受けられる。1日に何レッスンでも進める。
   - 復習クエストはマップ上でレッスンの直後に並ぶが、進行をブロックしない: レッスン前 LOCKED → 完了当日 WAIT_TOMORROW → 翌日から AVAILABLE → 合格で CLEARED。
   - マップの並び: `L5 → C5 → まとめ1-5 → L6`、`L30 → C30 → ボス1-30 → L31`。
   - `current`（きょうのクエスト）= 受けられる復習クエストの先頭 → なければ次のレッスン/関門。
   - `SKIP_DAILY_LOCK` は復習クエストにだけ効く。
   - `canTakeGateTest` のメッセージを「この復習クエストは あしたになったら ひらくよ。きょうは つぎのレッスンに すすめるよ！」に変更。
   - WorldMap の現在地ハイライトも同じ優先順に合わせた。
4. **コイン（config.ts / coins.ts / progressService.ts）**
   - 新しいレッスン: その日の 1〜3回目 10 / 4回目 6 / 5回目 4 / 6回目以降 2（`completeLesson` で今日の完了数を数えてから付与）。
   - 復習クエスト一発合格は 30 のまま（1分あたり最もお得）。ラベルは「復習クエスト 一発クリアボーナス！」など。
   - 連続学習（いちばん大きな報酬）: 毎日 +min(連続日数,10)、7日ごと +50、30日ごと +300 とレアガチャ券1枚。
5. **「翌日テスト」→「復習クエスト」** をマップ・TestRunner・レッスン結果・ビリモのセリフ・コメント・README・prisma のコメントで置きかえ。レッスン結果画面は「このまま つぎのレッスンに すすめるよ！あしたは復習クエストから。いちばんコインがもらえるよ」と表示し、「つぎのレッスンへ」（関門があるときは「まとめテストへ」「ボスに いどむ！」）ボタンを追加。
6. **テスト**: tests/progression.test.ts を新ルールで書き直し、tests/coins.test.ts と tests/companion.test.ts を拡張（合計 85件）。scripts/e2e-smoke.ts も新しい流れに合わせた。
7. `npx tsc --noEmit` / `npx vitest run`（85件）/ `npx next build` すべて成功。

### 判断したこと
- `ProgressInput.reviewQuestFor` は**省略可能**にした（省略すると復習クエストを出さない）。既存の呼び出し（api-contracts テスト）を壊さないため。
- 全レッスン完了などで「受けられるもの」が何もないときは、`current` に WAIT_TOMORROW の復習クエストを返す（マップに「あしたまでまってね」を出すため）。
- 連続ボーナスの3種類は、DB の enum を増やさないようにすべて `STREAK_BONUS` の理由で記録（移行が不要）。7と30の倍数が重なる日（210日目など）は両方もらえる。
- `LessonCompleteResponse.nextTest` は、関門があればその ID、なければ復習クエストの ID を返す。
- offline-resilience ブランチとの衝突を避けるため、server.ts / client.ts / db.ts / API ルート / seed.ts は変更していない。progressService.ts も最小限の変更。
- DB の Assessment 行は seed が ASSESSMENTS から作るので、新しい `check-5` などは次回の `npm run db:seed` で入る（マイグレーション不要）。

### スキップ / 未対応
- レッスン結果の「つぎのレッスンへ」ボタンは、最後のレッスンでも表示される（押すと「レッスンが見つかりません」）。クライアントが総レッスン数を知らないため。今のカリキュラムの最後に来る子はまだいないので後回し。

### オーナーへの質問
- **お宝アラート**（6問・コイン20×2倍=40）は、1分あたりで見ると復習クエスト一発合格（30）より多くなります。ランダムで1日1回までのイベントなので今回はそのままにしました。お宝の報酬を下げる（例: 基本15×2=30）べきでしょうか？
- 1日のレッスン数に上限はつけていません（ルールどおり無制限、6回目以降は2コイン）。


## Phase 2 — カリキュラム計画 ＋ ワールド1（2026-11-24）

### やったこと
1. **年間計画 docs/curriculum-plan.md（日本語）**: 12ワールド×30レッスン＝360レッスン。
   - ワールド1〜2＝小1〜2の定番テーマ、3〜4＝小3（Let's Try! 1）、5〜6＝小4（Let's Try! 2）、7〜8＝小5（NEW HORIZON Elementary 5）、9〜12＝小6（NEW HORIZON Elementary 6・中学準備）。
   - フォニックスの年間順序: 文字の音26音（W1）→ CVC（W2）→ ダイグラフ（W3）→ ブレンド（W4〜5）→ マジック e（W6）→ 母音チーム（W7〜8）→ r のつく母音・soft c/g など（W9〜10）→ サイトワード・語尾（W11〜12）。
   - 表: 年間の全体表（ワールド→レッスン→学年・テーマ→フォニックス→会話シーン）、全ワールドの5レッスンごとのブロック表、ワールド1の1レッスンごとの表、文法の育ち方、新ワールドを作るときのルール。
2. **LessonDef を拡張（省略可・後方互換）**: `conversation?`（scene / sceneJa / lines / aiTask{goalJa, starterEn, targetExpressions}）と `recap?: { highlightsJa }`。
   - src/lib/domain/types.ts に型、src/lib/api/contracts.ts の LessonSchema に安全なデフォルトつきで追加（壊れていたら null、無ければ undefined。クライアントは落ちない）。
3. **lessons.json のレッスン1〜30を全面書き直し（小1・ゼロレベル）**: あいさつ → きもち → 色 → 数 → からだ・かお → もちもの・教室 → 動物 → 食べもの → 天気・ふく・かぞく・あそび → かたち・できること・誕生日・マナー。5の倍数回はまとめ回、30回目はスピードTPRつきのワールド総復習。
   - Session 1 は Look! / Stop! / Come here! / Go!、「Hello. I'm Haru.」、フォニックス s と a を維持。
   - フォニックスは1回1音で s a t p i n m d g o c k e u r h b f l j v w x y z qu を順番に（まとめ回は CVC をつなげて読む練習）。
   - 全レッスンに会話シーン（ハル・リコ・キコ・ビリモ・エマ先生）と AI 会話タスク、まとめハイライトを追加。英文はすべてオリジナル。
4. **検証テスト tests/curriculum.test.ts（新規・42件）**: zod スキーマ、lessonNo 連番・重複なし、ワールド/学年の対応、学習項目 ID とテスト ID の重複なし、空欄なし、英語欄に日本語が無い／日本語欄に日本語がある、フォニックス単語がフォーカスのつづりを含む、会話とまとめが全レッスンにある、API 契約を通しても会話が残る、Session 1 / 30 の決まり、ワールド1で26音を順に扱う。
5. その他
   - フォニックス問題「さいしょの おとは どれ？」で、c と k（同じ /k/ の音）が同時に選択肢に出ないように修正（src/lib/curriculum/questions.ts）。
   - tests/grading.test.ts の「絵が同じ（曜日📅）」テストが旧レッスン12（曜日）に依存していたので、人工データで同じことを確かめる形に変更。
   - README のカリキュラム説明に会話シーン・年間計画へのリンクを追記。
6. `npx tsc --noEmit` / `npx vitest run`（127件）/ `npx next build` すべて成功。

### 判断したこと
- 小1の数の単語は ja を「いち（1）」のように書いた（日本語欄にひらがなを必ず入れるルールにしたため。絵文字は 1️⃣ のまま）。
- ゼロレベルの子が書く負担を考え、`core`（学校テスト・スペル問題の対象）は各レッスン数語＋表現1つ程度にしぼった。
- AI 会話タスクは個人情報を聞かない方針。名前だけは自己紹介の中心なので「ニックネームでも OK」と goalJa に書いた。年齢（L28）・家族（L23）はキャラ側の話題にして、子どもの本当の情報は聞かない形にした。
- 文法の新しい型は少しずつ（ワールド1はチャンクで覚える型だけ）。
- 学年はテーマの対応先であり、子どもの実学年ではない（全員レッスン1から）ことを計画書に明記。

### スキップ / 未対応
- **worksheets/generate_worksheets.py は実行できなかった**: Python 3.15 はあるが reportlab が入っていない（今夜は勝手にパッケージを入れないことにした）。代わりに、スクリプトが読むフィールド（vocab / school.expressions / tpr / phonics / testPoints など）が全レッスンで読めることを Python で確認済み。新フィールドは追加だけなので影響しないはず。`pip install -r worksheets/requirements.txt` のあとで一度実行して確認してください。
- 会話・まとめを画面に出す部分は Phase 3（まとめ動画）・Phase 5（AI会話）で実装予定のため、今回はデータと型・契約だけ。

### オーナーへの質問
- NEW HORIZON Elementary 5/6 の単元の順序・名称は版によって違うことがあります。計画書のワールド7〜11は一般的なテーマで並べました。お使いの地域・年度の版に合わせて並べ替えが必要なら教えてください。
- 小1の子に「書く」問題（スペル）をどこまで出すか。今は core の語・表現にだけ出ます。ワールド1では書く問題を出さない設定にすることもできます。


## Phase 3 — きょうのまとめ動画（2026-11-24）

### やったこと
1. **台本ビルダー src/lib/recap/script.ts（純粋関数）**: `buildRecapScript(lesson)` がレッスンデータを「時間つきのセグメント」に変換。動画ファイルは不要。
   - セクション: はじまり → ことば → ひょうげん（学校テストに出る core を先に）→ フォニックス（文字を大きく表示）→ うごこう（TPR・動きの説明つき）→ かいわ（シーンを聞く → だいじな文を最大2つくりかえす）→ きょうのポイント（recap.highlightsJa）→ おわり。
   - ホストはハルとビリモ。英語は en-US・rate 0.9 で読み上げ →「いってみよう！」で 2.5 秒まつ → つぎへ。
   - 全体が 2〜3分になるよう調整（長すぎれば項目数をしぼる、短ければ「もういちど チャレンジ」でことば・core 表現をおさらい）。現在のレッスン1〜30はすべて 2:00〜2:28。
2. **ページ /recap/[lessonNo]**（サーバーで台本を作り、クライアントの `RecapPlayer` が自動再生）。
   - 進み具合バー・セクション表示・とめる／さいせい・さいしょから・おとを けす。
   - speechSynthesis が無い／音を消したときは、見積もり時間で文字だけ進む。onend が来ないブラウザ対策で読み上げに上限時間あり。
   - 完了したレッスンだけ見られる（未完了なら「クリアすると見られるよ」）。DB に つながらないときは判定できないので見せる（3秒でタイムアウト）。
3. **ごほうび POST /api/recap/[lessonNo]/watched**: 最後まで見たら 1日1回 5コイン（`COIN_RULES.recapWatched`）。同じ日に何回送っても同じ（idempotencyKey = `<userId>:recap:<日付>`、同時送信のユニーク制約違反も「もらいずみ」扱い）。DB が止まっていても `ok:true`（コイン0・saved:false）。契約 `RecapWatchedResponseSchema` はすべて安全なデフォルトつき。
4. **入口**: マップに「🎬 きょうのまとめを見る」（いちばん新しくクリアしたレッスン）、レッスン結果画面に「きょうのまとめを見る（2ぷん・おまけ）」リンク。どちらも任意で、進行のゲートにはしていない。
5. **テスト**: tests/recap.test.ts（台本ビルダー・時間計算・ごほうび・契約）と tests/recap-route.test.ts（API: 付与／2回目／DB停止／404）。合計 146件。
6. `npx tsc --noEmit` / `npx vitest run`（146件）/ `npx next build` すべて成功。

### 判断したこと
- **コインの理由 `RECAP_WATCHED` を enum に追加**し、マイグレーション `prisma/migrations/20261124120000_recap_watched`（`ALTER TYPE ... ADD VALUE`）を作成。次回 `npm run db:migrate` が必要。
- **既存バグを修正**: `CoinLedger.idempotencyKey` は全ユーザーで一意なのに、progressService のキーに userId が入っていなかった（2人目の子が Lesson 1 をクリアするとユニーク制約違反で失敗していたはず）。キーの先頭に userId を付けた（1行の変更）。
- 日本語のホストのセリフは**表示だけ**（読み上げは英語のみ）。日本語音声は端末によって品質がばらつくため。
- 5コインは「1日1回」（何本見ても同じ）。レッスンごとではない。
- オフライン対応ブランチとの衝突を避けるため、server.ts / client.ts / db.ts / seed.ts は変更なし。lesson ページとマップページはリンク追加だけ。

### スキップ / 未対応
- ブラウザでの実機確認（音声・自動再生）はできていない。`next start` は起動できたが、無人作業中は localhost への curl に承認が必要だったため、HTTP の確認もスキップ。API の動きは route のテストで確認済み。
- Chrome は、ページを直接ひらいたとき（ユーザー操作なし）に speechSynthesis を止めることがある。その場合も文字だけで進み、▶ を押すと音が出る。

### オーナーへの質問
- まとめのごほうび 5コインは「1日1回」にしました。レッスンごと（その日に完了したレッスンの数まで）にしますか？
- 日本語のセリフも読み上げた方がよいですか（小1にはその方が親切かもしれません）？


## Phase 4 — キャラクターの品質（2026-11-24）

### やったこと
1. **共通の質感 src/components/art/ArtDefs.tsx（既存の id はすべて残して追加）**
   - 肌: 5段階のグラデーション＋「皮下散乱（ふちがほんのり赤い）」「暖かい影」「右ふちの逆光」の重ね用グラデーション。
   - 瞳: 白目のグラデーション・まぶたの影・4段階の虹彩（エマ先生用に hazel を追加）。
   - 髪の「天使の輪」つや、布の陰影、ブーツ・レギンス・Tシャツ・マント・エマ先生のジャケットと髪の色、接地影（コンタクトシャドウ）、ゴッドレイ、映画風カラーグレーディング（上が暖色・下がティール）。
   - `f-rim` フィルターを「左上から暖かいふち光＋右から冷たい逆光（どちらも形の内側）＋やわらかい影」の3灯ライティング風に作り直し。
2. **共通パーツ src/components/characters/parts.tsx（新規）**: 目（ハイライトは両目とも左上・まつげ・二重・下まぶた）、先が細いまゆ、鼻（鼻すじの影・小鼻・つや）、口（歯・舌・口角）、耳、顔の土台、髪の毛束、布のしわ、先が細くなる円柱の手足（影・つや・逆光つき）。
3. **顔 CharacterArt.tsx**: ハル・リコ・キコを描き直し。ちびキャラではなく年齢どおりの顔立ち（目は顔の高さのまんなか、鼻・くちびる・耳あり）。毛束の線と天使の輪、バンダナの布のしわと結び目、前髪がバンダナにかかる重なり、ツインテールの毛束、ぱっつんボブ。ビリモは足・小さな手・おなかの陰影・逆光・大きなつやつやの目を追加（オリジナルデザインのまま）。
4. **全身 StandingArt.tsx**: 骨組み（Rig）から描く方式に作り直し。
   - 頭身: ハル10歳≒6頭身、リコ8歳≒5.6頭身、キコ7歳≒5.3頭身。
   - 腕は角度で計算（手を振る・指さす・ばんざい）、指さしは遠近で短く見せる。手は「自然・指さし・パー・グー」の4種類。
   - 服: ハル＝そでまくりの探検ジャケット・白T・ベルト・ななめがけかばん・ハーフパンツ・ハイキングブーツ。リコ＝すそが波打つチュニック・サッシュのリボン・スカーフ・レギンス・ロングブーツ。キコ＝マント（ケープ）・ワンピース・白いハイソックス・ストラップぐつ・ことばノート（左手でかかえる）。しわ・すその波・接地影つき。
5. **エマ先生 TeacherArt.tsx**: 大人の顔立ち（面長・小さめの目・ほお骨のつや・くちびる・イヤリング）、肩でくるんとはねる髪、ラペルつきジャケット＋ブラウス＋ブローチ。話すときは右手を上げ、口が動く（口のアニメが SVG の中心ではなく口の中心で動くよう `transform-box: fill-box` を指定）。
6. **モンスター MonsterArt.tsx**: 全パーツに逆光のふち、光る目を「にじむ光の輪＋縦長の瞳孔＋ハイライト」に、接地影を2重に、足もとに属性の光の照り返し、レア以上は光のかけらが舞う。ドラゴンの背中のとげ・うろこ・翼膜の透け、フェンリルの毛並み、ライオンのたてがみの毛束、ゴーレムのひびの光、フェニックスの羽根の軸を追加。
7. **背景 scene/**: ゴッドレイを上から下へ消えるグラデーションに、古代樹の葉に上からの光、水晶の面の陰、神殿の柱のみぞ・逆光。新しく `KeyLight`（キャラの後ろの光のにじみ）と `ColorGrade`（色調補正）を追加し、HeroScene・CharacterParade・FieldBackdrop で使用。
8. **身長差を年齢どおりに**: HeroScene と CharacterParade で、リコ＝ハル×0.92、キコ＝ハル×0.88 の大きさに調整。
9. **テスト tests/art.test.tsx（新規・9件）**: 全キャラ×全ポーズ×反転、ビリモの全表情、ポートレート、エマ先生、モンスター100体、ヒーローバナー6種、パレード、背景を描画して「ArtDefs の id 重複なし」「url(#…) の参照切れなし」「NaN/undefined なし」「絵の中の id が ArtDefs とぶつからない」「バナー内の id 重複なし」を確認。
10. `npx tsc --noEmit` / `npx vitest run`（155件）/ `npx next build` すべて成功。

### 判断したこと
- **コンポーネントの API と export は一切変えていない**（HaruArt / RikoArt / KikoArt / BirimoArt / CharacterArt / Portrait / Standing / StandingFigure / *Standing / Pose / ART_LINE / TeacherArt / MonsterArt / MonsterFigure / シーン部品）。追加の export（FACE_GEO、KeyLight、ColorGrade）と新ファイル parts.tsx だけ。ページは変更なし。
- 立ち絵はどのキャラも 100×170 の箱いっぱいに描く（Peek の上半分表示などが崩れないため）。身長差は置く側の scale で付けるルールにして、ファイル冒頭のコメントに目安を書いた。
- 新しいグラデーション・フィルターはすべて ArtDefs に集め、各イラストの中では `<defs>` を作らない（id の重複を防ぐ）。
- 写真のような3DCGは SVG では限界があるため、「映画のライティング（キー光・逆光・接地影・色調）」と「質感の層（肌・髪・布）」で 3DCG アニメ映画の雰囲気に近づける方針にした。本物の3DCG画像ができたら、これまでどおり src/lib/art/renderedArt.ts に登録すれば立ち絵が置きかわる。

### スキップ / 未対応
- **スクリーンショットは撮れなかった**: Playwright / Chromium がプロジェクトに入っておらず、無人作業ではシステムのブラウザにもアクセスできなかった（PHASE4 の指示どおりスキップ）。代わりに、ブラウザで開くだけで確認できる **docs/night/screens/characters-preview.html** を作成した（身長くらべ・全キャラ×全ポーズ・ポートレート・エマ先生・モンスター100体）。作り直すときは `npx tsx --tsconfig scripts/tsconfig.json scripts/render-characters-preview.tsx > docs/night/screens/characters-preview.html`。
- 目で見た最終確認ができていないため、細かい位置（前髪の重なり・手の向き・すその波など）に不自然なところがあるかもしれない。朝にプレビューを見て気になる点を教えてください。

### オーナーへの質問
- 目で見ての確認をお願いします（docs/night/screens/characters-preview.html をブラウザで開くだけ）。特に「年齢どおりの頭身」「エマ先生の大人っぽさ」が意図に合っているか。
- 指さしポーズは手が箱（100×170）の右に少しはみ出します（はみ出しても表示されます）。気になる場合は腕をもう少し短くします。
- Playwright を devDependencies に入れてよければ、次回から自動でスクリーンショットを撮って自己チェックできます。


## Phase 5 — AIキャラとの かいわ（2026-11-24）

### やったこと
1. **新しい さいごのステップ「かいわ」**（`buildLessonFlow` の9ステップ目。`lesson.conversation` があるレッスンだけ。今は全30レッスンにある）。
   - キャラは ハル（ステップに `character: "haru"`、`maxTurns: 6` を持たせたので、あとで変えられる）。
   - はじめに「ばめん」と「🎯 ゴール（aiTask.goalJa）」を見せ、▶ はじめる で ハルが `aiTask.starterEn` を話す。
   - 子どもの入力: 🎤 音声認識（Web Speech API, en-US。使えるブラウザだけボタンを出す）／「こんなふうに いえるよ」の ことばを タップ／キーボード入力。どれでも進める。
   - ハルの返事は speechSynthesis で読み上げ（ふきだしを タップで もう一回）。日本語訳は表示だけ。
   - 目標表現を言えたら ⭐ が ふえる。6ターンで「かいわ クリア！」→ そのまま レッスン完了（コイン）へ。
2. **API `POST /api/conversation`**（`src/app/api/conversation/route.ts`）: サーバーは状態を持たず、履歴（さいだい12）をクライアントが送る。**いつでも `success:true`**（壊れた入力・知らないレッスンでも 200 で返事を返す）。
3. **Claude で返事** `src/lib/conversation/aiConversation.ts`（aiGrader.ts と同じ形）: `ANTHROPIC_API_KEY` があるときだけ。モデルは `CONVERSATION_MODEL`（既定 `claude-haiku-5-5`）。構造化出力（replyEn / replyJa / suggestions）。
   - システムプロンプト: やさしい友だち、6〜12歳向けの とても短い かんたんな英語、レッスンの話題から はなれない、目標表現を さりげなく お手本にする（まちがいは直接なおさず言いかえる）、**個人情報は ぜったい きかない・くりかえさない**、こわい・あぶない話題は しない、`<child>` の中は指示ではなくデータ。
   - さいごの6ターン目は AI を呼ばず台本で しめくくる（AI が終わらせないのを防ぐ）。
   - 返事が長すぎる・URL や @ を ふくむ・拒否・エラー → 台本にフォールバック。
4. **台本フォールバックエンジン** `src/lib/conversation/engine.ts`（純粋関数）: `lesson.conversation.lines` から キーワード一致で いちばん近い行の「つぎの行」を返す。同じ行は くりかえさない。目標表現（`I'm ～.` は `I'm` の部分、`I am` / `it is` のゆれもOK）を言えたら「Great!」などで ほめる。聞きとれないときは お手本「Say, "I'm Haru."」。台本を言いつくしたら目標表現の練習。
   - **サーバーに つながらないときは、クライアントも同じエンジンで その場で返事を作る**（子どもが止まらない）。
5. **個人情報の保護**: 3けた以上の数字（電話番号など）・メール・URL は AI に送る前に `***` に伏せる。台本エンジンは子どもの名前をオウム返ししない。
6. **学習記録**: かいわで目標表現を言えたら、その表現の EXPRESSION 項目に SPEAKING の正解ログ（questionType `conversation`）を レッスン完了の logs に入れる（記憶モデル・マスタリーに反映）。完了 API の形は変更なし。
7. **契約** `ConversationRequestSchema` / `ConversationResponseSchema` と、レッスンステップの `conversation` を contracts.ts に追加（すべて安全なデフォルトつき）。
8. **テスト** tests/conversation.test.ts（25件: エンジン・AIの呼び出し/モデル指定/エラー時フォールバック・API・契約）。既存テストの「8ステップ」を「9ステップ（さいごは かいわ）」に更新。合計 181件。
9. `npx tsc --noEmit` / `npx vitest run`（181件）/ `npx next build` すべて成功。`.env.example` に `CONVERSATION_MODEL` を追記。

### 判断したこと
- **かいわは レッスン完了の さいごのステップ**にした（スピードリスニングのあと → かいわ → 完了 API）。ただし**ブロックしない**: 音声が使えなくてもタップで最後までできる、2ターン話せば「ここで おわりにする」、はじめる前なら「きょうは とばす」でも レッスンは完了できる（とばしたときは SPEAKING ログなし）。
- 完了の合格条件は今までどおり「確認クイズ」だけ。かいわの出来は合否に使わない（6歳の音声認識は不安定なので）。
- クイズ不合格で「クイズをもう一回」を押すと、スピードリスニング → かいわ も もう一度通る（既存の作りのまま）。
- 子どもの発話は AI に送るが、DB には保存しない（会話ログのテーブルは作らなかった）。
- オフライン対応ブランチとの衝突を避けるため、server.ts / client.ts / db.ts と 既存 API ルートは変更なし。lesson ページはステップ追加の数行だけ。

### スキップ / 未対応
- 実際の Claude API での動作確認はしていない（無人作業でキーを使わなかった）。SDK はモックしてテスト。もし `claude-haiku-5-5` が構造化出力に対応していないなどでエラーになっても、台本で動き続ける（サーバーログに `[conversation] API error` が出る）。
- ブラウザでの実機確認（マイク・読み上げ）はできていない。

### オーナーへの質問
- 子どもの発話（音声認識の文字）を Claude API に送ることについて、保護者への同意・プライバシーポリシーの記載が必要だと思います。どう扱いますか？
- かいわの相手を レッスンごとに変えますか（例: そのレッスンの台本に多く出るキャラ）？ 今は全部ハル。
- かいわをクリアしたら追加コイン（例: ⭐1つにつき1コイン）を出しますか？ 今はコインなし。


## Phase 6 — ワールド2（レッスン31〜60・小2）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン31〜60を追加**（ワールド2「ことばの町」・school.grade は小2）。ワールド1と同じ形式（conversation・recap つき）、英文はすべてオリジナル。
   - 31〜35 すきなもの・ともだち（What do you like? ― I like ～. / Let's be friends! / I like drawing.）
   - 36〜40 おやつ・たべもの（I want ～. / What do you want? / Strawberry, please. / It's sweet.）
   - 41〜45 いきもの（Can it fly? ― Yes, it can. / No, it can't. / I see a ～. / It can climb.）
   - 46〜50 おうち・へや（This is my room. / Where is ～? ― It's on / in / under ～. / Clean up, please.）
   - 51〜55 まち・のりもの（Let's go to the ～. / By bus! / こうつうルール / パンやさん）
   - 56〜60 きせつ・ぎょうじ（I like summer. / なつまつり / ハロウィン / Happy New Year!）・L60 はスピードTPRつきのワールド総まとめ
   - 5の倍数回はまとめ回（すきなもの はっぴょうかい・おやつやさんごっこ・いきものクイズ・なくしもの探し・バスで おでかけ）。
2. **フォニックス**: 短母音 a → i → o → e → u の CVC を5レッスンずつ（1回1つの「ことばの なかま」: -at, -ap, -ag, -an/-am, -ig, -it, -in, -og, -ot, -op, -ed, -en, -et, -un, -ug, -ut …）。L56〜59 は ff / ll / ss / zz（floss ルール）、L60 は CVC 総まとめ。`phonics.rule` は "cvc" / "floss" / "review"。
3. **テスト追加（tests/curriculum.test.ts）**: ワールド2が31〜60で30レッスン、母音の順番と CVC の形（子音-母音-子音の3文字）、L56〜59 の ff ll ss zz、L60 のスピードTPR、各ブロックの表現の型、「core の表現に ― や ～ を入れない」（全レッスン対象）。
4. **docs/curriculum-plan.md** に「6-2. ワールド2 のレッスン詳細」の表を追加。
5. マップのワールド2の壁のもじ（レリーフ）を sh / ch / th（ワールド3の内容）から cat / pig / dog / bed / bus に変更（src/components/map/WorldMap.tsx の1行）。
6. `npx tsc --noEmit` / `npx vitest run`（216件）/ `npx next build` すべて成功。まとめ動画は全60レッスンで2〜3分に収まることをテストで確認。worksheets のスクリプトが読むフィールドが全60レッスンで読めることも Python で確認。

### 判断したこと
- **サイトワード（I, a, the, is, go, to）は `phonics.words` に入れなかった**。フォニックス問題は「さいしょの おとは どれ？」なので、the を入れると「t」が正解になってしまうため。かわりに、まとめ回の tipJa（「ちいさな ことば the も よめるよ」など）と表現の中で扱った。
- スペル問題になる core の表現には「―」を入れない（子どもが入力できない）。L45 の core は「Is it a fish?」にした。
- 3人称（likes など）や How do you go? のような型はまだ使わず、ワールド2も「かたまり」で覚える型だけにした。「How do we go? ― By bus!」は チャンクとして使用。
- AI 会話タスクでは子ども自身の家・住所・学校などは聞かない。おうちの回はハルの家を案内する形、きせつ・すきなものは好みだけを聞く形にした。
- 行事は小学校低学年で定番の なつまつり・ハロウィン・クリスマス／おしょうがつ を選んだ。

### スキップ / 未対応
- 新しいレッスン用の復習クエスト・まとめテスト・ボス（check-31〜60、mini-31-35 …、boss-1-60、arena-31-60、arena-1-60）は ASSESSMENTS には自動で入るが、DB には次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は Phase 2 と同じ理由（reportlab 未インストール）でスキップ。
- 画面での目視確認はしていない（データ追加のみで、表示部分は変更なし）。

### オーナーへの質問
- ハロウィン・クリスマスなど行事の回は、実際の季節とずれて学ぶことがあります（全員レッスン1から始めるため）。季節に合わせて行事回を出し分ける仕組み（例: 10月はハロウィンのおまけクエスト）が必要ですか？
- ワールド2の名前は計画書では「ことばの町」、マップでは「フォニックス火山の神殿」になっています。どちらかに統一しますか？（今回はマップの名前は変えていません）


## Phase 7 — ワールド3（レッスン61〜90・小3／Let's Try! 1 前半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン61〜90を追加**（ワールド3「せかいの港」・school.grade は小3）。ワールド1〜2と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜60は1行も変えず、末尾に追記しただけ（同じ書式）。
   - 61〜65 せかいの あいさつ・なまえ（Hola / Ni hao / Bonjour / Namaste、Nice to meet you.、What's your name?、なまえカード こうかん、あくしゅ・おじぎ）
   - 66〜70 きもち・ようす（I'm great / so-so / tired / hot / cold、Are you happy? ― Yes, I am. / No, I'm not.、ほけんしつで Are you OK?）
   - 71〜75 かず 1〜20（11〜15、16〜20、How many ～?、じゃんけん I win!、ボウリング たいかい）
   - 76〜80 すきな いろ（What color do you like?、Do you like red?、いろまぜ、にじ、Tシャツやさん）
   - 81〜85 すきな スポーツ・たべもの（What sport / food do you like?、I don't like ～.、I play tennis.、クラスの アンケート）
   - 86〜90 まとめ（じこしょうかいカード、きもちサイコロ、すきなもの クイズ、ビリモの せかい りょこう、L90 はスピードTPRつきの ワールド総まとめ「すきなもの はっぴょうかい」）
2. **フォニックス: ダイグラフ** sh → ch → th → wh を5レッスンずつ（5の倍数回はふりかえり）、L81〜84 は ck・ck・ng・nk、L85〜90 は くらべ・しわけ・総まとめ。単語は「短母音1つ＋子音・ダイグラフ」だけ。th は いきの /θ/ と こえの /ð/ を分けて扱った。`phonics.rule` は "digraph" / "review"。
3. **フォニックス問題をダイグラフ対応に（src/lib/curriculum/questions.ts）**: 今までは「さいしょの おとは どれ？」で必ず最初の1文字を答えにしていたため、ship が「s」の音ではじまる、という まちがった問題に なるところだった。その回のフォーカスがダイグラフのときだけ:
   - sh / ch / th / wh で はじまる語 → 「さいしょの おとは どれ？」（選択肢 sh ch th wh、答え sh など）
   - 途中・おわりに ある語（fish, duck, ring, pink, lunch）→ 「どの つづりが はいってる？」（ほかの選択肢は その語に ふくまれない ダイグラフだけ＝答えが1つに きまる）
   - ワールド1の duck・fish など（フォーカスが1文字の回）は今までどおり。
4. **テスト**: tests/curriculum.test.ts にワールド3の決まりごと（61〜90・小3、ダイグラフの順番と rule、単語は母音1つ、L90 のスピードTPR、各ブロックの表現の型と 11〜20 の数）、tests/phonics-digraph.test.ts（新規・5件）。合計 256件。
5. **docs/curriculum-plan.md** に「6-3. ワールド3 のレッスン詳細」を追加。マップのワールド3の壁のもじ（I / am / is / are）を sh / ch / th / wh / ck に変更（WorldMap.tsx の1行）。
6. `npx tsc --noEmit` / `npx vitest run`（256件）/ `npx next build` すべて成功。まとめ動画は全90レッスンで2〜3分に収まることをテストで確認。worksheets のスクリプトが読むフィールドが全90レッスンで読めることも Python で確認。

### 判断したこと
- 会話の speaker は5人（ハル・リコ・キコ・ビリモ・エマ先生）に限られているので、「世界の子とオンラインであいさつ」は、ビリモが せかい りょこうから かえってきて 各国の あいさつを教える／オンライン パーティーの司会をする形にした。
- 数 11〜20 の単語の絵文字は "11" 〜 "20" の文字にした（11以上の数字の絵文字が無いため）。
- 計画書の「すきなスポーツ・食べもの」ブロックに、Let's Try! 1 で よく出る「I don't like ～.」と「I play ～.」を入れた（3人称はまだ使わない）。
- 「Are you ～? ― Yes, I am. / No, I'm not.」をワールド3で導入した（きもちの ブロック）。
- AI 会話タスクでは子どもの本名・年齢・学校などは聞かない（なまえは ニックネームで OK と goalJa に明記。数の回は カード・シール・ボールの数を聞く形）。
- 世界のあいさつ（Hola, Ni hao, Bonjour, Namaste）は英語欄にローマ字で書き、日本語欄に「スペインごの こんにちは」などの説明を入れた。

### スキップ / 未対応
- 新しいレッスン用の復習クエスト・まとめテスト・ボス（check-61〜90、mini-61-65 …、boss-1-90、arena-61-90、arena-1-90）は ASSESSMENTS には自動で入るが、DB には次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は Phase 2 と同じ理由（reportlab 未インストール）でスキップ。
- 画面での目視確認はしていない（データ追加と問題文の分岐のみ）。

### オーナーへの質問
- ワールド3の名前は計画書では「せかいの港」、マップでは「グラマーの海底遺跡」です。ワールド2と同じく、どちらかに統一しますか？（今回もマップの名前は変えていません）
- ダイグラフの回だけ、フォニックス問題が「どの つづりが はいってる？」の形にもなります。小さい子には むずかしければ、「さいしょの おと」だけに しぼることもできます。


## Phase 8 — ワールド4（レッスン91〜120・小3／Let's Try! 1 後半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン91〜120を追加**（ワールド4「なぞなぞ山」・school.grade は小3）。ワールド1〜3と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜90は変えず、末尾に同じ書式で追記しただけ。
   - 91〜95 アルファベット大文字（ABCの うた、What do you want? ― N, please.、まちの かんばんで I see a T.、からだで Let's make a T.、もじカード こうかんかい）
   - 96〜100 かたち・カードづくり（A star, please.、Two red hearts, please.、Let's make a card.、This is for you. ― Thank you. I like it! / You're welcome.、エマ先生に ありがとうカード）
   - 101〜105 これなあに？クイズ（What's this? / I don't know.、Hint, please.、Is it a frog? ― Yes, it is. / No, it isn't. / That's right!、かげクイズ One more hint, please.、ヒントクイズ大会）
   - 106〜110 動物の絵本（Who are you? ― I'm a rabbit.、Are you a cat? ― Yes, I am. / No, I'm not.、なきごえ あて、よみきかせ Come with me! / Let's go together.、えほんの げき）
   - 111〜115 いきもののようす（It's long / short、It's big / small / big and gray、It's fast / slow / strong、どうぶつ なぞなぞ、どうぶつえんガイド This is a swan. It's white. It can swim.）
   - 116〜120 小3まとめ（じこしょうかいポスター、たからもの しょうかい、はっぴょうの れんしゅう You can do it!、しつもんタイム Any questions?、L120 はスピードTPRつきの ワールド総まとめ「小3 はっぴょうかい」）
2. **フォニックス: 語頭ブレンド** s-（st sp sn sm sk sw）→ l-（bl cl fl gl pl sl）→ r-（br cr dr fr gr tr）を4レッスンずつ（5の倍数回はふりかえり）、L106 tw、L107〜108 l と r の くらべ、L109 3つのブレンド str spr scr、L110〜115 ふりかえり。単語は「ブレンド＋短母音1つ」だけ。L116〜119 は **2音節語の入門**（sunset, backpack, drumstick, chopstick など、習ったつづりだけでできる合成語）。`phonics.rule` は "blend" / "review" / "syllable"。
3. **フォニックス問題をブレンド対応に（src/lib/curriculum/questions.ts）**: 今までは stop の答えが「s」になっていた（まちがいではないが、ブレンドの練習にならない）。ブレンドの回は「さいしょの 2つの おとは どれ？」（strap は「3つ」→ str）。まちがいの選択肢は cl ↔ cr（1文字目が同じ）や cl ↔ bl（2文字目が同じ）を優先して、聞きくらべの問題にした。あわせて **sh / ch / th / wh で始まる語は、どの回でも ダイグラフで問う**ように した（chipmunk の最初の音が「c」に なる まちがいを防ぐ。ワールド1〜2には該当する語が無いことを確認済みで、影響なし）。
4. **まとめ動画（src/lib/recap/script.ts の1行）**: 2音節語のフォーカス "sun-set" を sunset に一致させて文字を表示するようにした。
5. **テスト**: tests/curriculum.test.ts にワールド4の決まりごと（91〜120・小3、ブレンドの順番と rule、単語は ブレンドで始まり母音1つ、2音節語の形、L120 のスピードTPR、各ブロックの表現の型）、tests/phonics-blend.test.ts（新規・7件）。合計 299件。
6. **docs/curriculum-plan.md** に「6-4. ワールド4 のレッスン詳細」を追加、ブロック表と データの書き方（ハイフン）を更新。マップのワールド4の壁のもじ（Hi / Yes）を ABC / st / bl / tr / tw に変更（WorldMap.tsx の1行）。
7. `npx tsc --noEmit` / `npx vitest run`（299件）/ `npx next build` すべて成功。まとめ動画は全120レッスンで2〜3分に収まることをテストで確認。worksheets のスクリプトが読むフィールドが全120レッスンで読めることも Python で確認。

### 判断したこと
- 計画書の s-ブレンドは st sp sn sk sw の5つだったが、sm も よく出るので L93 に sn と いっしょに入れた。l-ブレンドも計画の bl cl fl pl sl に gl を足した（L98 fl と いっしょ）。
- 計画の「106〜110 tw・ブレンドふりかえり」は、tw だけでは1回分なので、l と r の くらべ（日本の子が いちばん にがてな所）と 3つのブレンド（str spr scr）を入れた。
- 2音節語の回は `focus` を "sun-set" のように ハイフンで書く形にした（画面で2つに わかれて見え、読み上げも sun set に なる）。検証テストの「単語がフォーカスを含む」は ハイフンを のぞいて比べるようにした。2音節語の フォニックス問題は今までどおり「さいしょの おと」（sunset → s）。
- 3人称（likes, has など）はまだ使わない方針を守り、ナレーションや ヒントも It's ～. / It can ～. の形にした（「It's in the sea.」など）。
- AI 会話タスクでは子どもの本名・年齢・学校などは聞かない（なまえは ニックネームで OK と goalJa に明記。たからものは「えや おもちゃ でも OK」）。
- ワールド4の会話の舞台は計画書の名前「なぞなぞ山」に合わせた（マップの名前「スピーキング天空城」は変えていない）。

### スキップ / 未対応
- 新しいレッスン用の復習クエスト・まとめテスト・ボス（check-91〜120、mini-91-95 …、boss-1-120、arena-91-120、arena-1-120）は ASSESSMENTS には自動で入るが、DB には次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は Phase 2 と同じ理由（reportlab 未インストール）でスキップ。
- 画面での目視確認はしていない（データ追加と問題文の分岐のみ）。

### オーナーへの質問
- ワールド4の名前は計画書では「なぞなぞ山」、マップでは「スピーキング天空城」です。ワールド2・3と あわせて、どちらかに統一しますか？
- ブレンドの回のフォニックス問題は「さいしょの 2つの おと」（選択肢 st / sp / sl など）です。小さい子には むずかしければ、ふりかえり回だけに しぼることもできます。
- 2音節語（sunset など）を小3まとめで少しだけ入れました。本格的な2音節（rabbit, picnic）は計画どおりワールド5（L141〜145）です。


## Phase 9 — ワールド5（レッスン121〜150・小4／Let's Try! 2 前半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン121〜150を追加**（ワールド5「じかんの塔」・school.grade は小4）。ワールド1〜4と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜120は変えず、末尾に同じ書式で追記しただけ。
   - 121〜125 せかいの あいさつ（Good morning. / Good afternoon. / Good night.、Hello, world!、せかいの あさごはん I like toast.、See you later. / Have a nice day!、あさごはん パーティー）
   - 126〜130 てんきと あそび（How's the weather? ― It's rainy.、Let's play tag. ― Yes, let's!、あめの ひ Let's play cards. / Your turn.、It's hot. Let's swim.、あめの ひの あそび そうだん）
   - 131〜135 ようび（What day is it? ― It's Monday.、7つの ようび、I like Mondays.、Let's play on Saturday. / Sorry.、1しゅうかんの よていひょう）
   - 136〜140 じこく・せいかつ（What time is it? ― It's seven o'clock.、It's breakfast time.、Wake up! / It's bedtime.、せかいの いま なんじ？ It's morning in Tokyo.、とけい クイズ It's snack time!）
   - 141〜145 ぶんぼうぐ（Do you have a pen? ― Yes, I do. / No, I don't.、I have a ruler. / I don't have scissors.、This is my pencil case.、I have three pencils.、かしかり Do you have a red pen?）
   - 146〜150 まとめ「1日の くらし」（わたしの あさ・ごご・1しゅうかん・がっこうの じゅんび、L150 はスピードTPRつきの ワールド総まとめ「わたしの 1しゅうかん はっぴょうかい」）
2. **フォニックス**: 語末ブレンド -st -nd -mp（L121〜124）→ -nt -lk -ft（L126〜129）→ -sk -lp（L131〜132）、複数形 -s（L133〜134。nests / lamps のように ブレンド語にも）、-ing（L136〜139。running のように もじを ふやす語も）、2音節語（L141〜144。picnic, rabbit, magnet, pumpkin …）、L146〜150 は ブレンド総まとめ。`phonics.rule` は "final-blend" / "plural" / "ing" / "syllable" / "review"。
3. **フォニックス問題を語末に対応（src/lib/curriculum/questions.ts に `endingQuestion` を追加）**: 今までのままだと nest の答えが「n」（最初の文字）になり、語末ブレンドの練習にならなかった。focus が "-st" のように ハイフンで はじまる回は:
   - 語末ブレンド → 「おわりの 2つの おとは どれ？」（まちがいの選択肢は nd ↔ nt のような 1文字目が同じもの、st ↔ nt のような 2文字目が同じものを優先＝聞きくらべ）
   - -s / -ing → 「おわりに ついている のは どれ？」
   - 順番は 語頭ブレンド → 語末 → ダイグラフ（shopping は ing の回なので sh ではなく ing で問う）。ワールド1〜4には "-" で はじまる focus が無いので影響なし（テストで確認）。
4. **レッスン画面（LessonSteps.tsx の1行）**: フォーカスの ボタン "-st" を おしたとき、読み上げで「ダッシュ」と いわないように 先頭の ハイフンを とって読む。
5. **マップ（WorldMap.tsx の1行）**: ワールド5の テーマが無く、ワールド1の「はじまりのジャングル遺跡」が表示されてしまう状態だったので、「じかんの塔」（金色っぽい色・壁のもじ -st / -nd / -s / -ing / 7:00）を追加。
6. **テスト**: tests/curriculum.test.ts にワールド5の決まりごと（121〜150・小4、フォニックスの順番と rule、語末の単語が その語末で おわる、語末ブレンドの単語は 母音1つ、2音節語の形、L150 のスピードTPR、各ブロックの表現の型と 7つの ようび）、tests/phonics-ending.test.ts（新規・7件）。合計 342件。
7. **docs/curriculum-plan.md** に「6-5. ワールド5 のレッスン詳細」を追加し、データの書き方に「語末は先頭にハイフン」を追記。
8. `npx tsc --noEmit` / `npx vitest run`（342件）/ `npx next build` すべて成功。まとめ動画は全150レッスンで2〜3分に収まることをテストで確認。worksheets のスクリプトが読むフィールドが全150レッスンで読めることも Python で確認。

### 判断したこと
- **語末は focus に "-st" のように 先頭ハイフンで書く**ことにした。語頭ブレンドの "st"（stop）と 区別でき、問題の出し方を データだけで きりかえられるため。検証テストの「単語がフォーカスを含む」とまとめ動画の文字表示は、もともと ハイフンを のぞいて比べているので そのまま動く。
- 計画書の「136〜140 -ing（playing, running）」の playing は 母音チーム（ay、ワールド7）なので使わず、jumping / singing など ならった つづりだけの語にした。
- 3人称（likes, has）はまだ使わない方針を守った。「What do you do on Saturdays?」「I play tennis on Saturdays.」は 1・2人称だけ。
- じこくは「○じ ちょうど（o'clock）」だけ（Let's Try! 2 の範囲）。せかいの じこくは 11月（日本時間 8時 → ロンドン 23時・ニューヨーク 18時・シドニー 10時）で計算した。
- 「I eat ～.」は ワールド6（わたしの1日）の型なので、あさごはんの回は I like toast. / Rice, please. に した。
- AI 会話タスクでは子どもの本名・年齢・学校名などは聞かない（なまえは ニックネームで OK と goalJa に明記。ふでばこは「えでも OK」）。がっこうの じゅんびの回も もちものだけを聞く。
- ワールド5の会話の舞台は計画書の名前「じかんの塔」に合わせ、マップの名前も同じにした（ワールド5はマップに名前が無かったため）。

### スキップ / 未対応
- 新しいレッスン用の復習クエスト・まとめテスト・ボス（check-121〜150、mini-121-125 …、boss-1-150、arena-121-150、arena-1-150）は ASSESSMENTS には自動で入るが、DB には次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は Phase 2 と同じ理由（reportlab 未インストール）でスキップ。
- 画面での目視確認はしていない（データ追加と問題文の分岐・マップの色の追加のみ）。

### オーナーへの質問
- 語末の回のフォニックス問題は「おわりの 2つの おと」「おわりに ついている のは どれ？」です。選択肢の表示は "st" "ing" のように ハイフンなしにしました。「-st」のように ハイフンつきで 見せた方が わかりやすければ 変えます。
- ワールド5の マップ名は「じかんの塔」にしました（ワールド2〜4は マップと計画書で名前が ちがうまま）。統一の方針を決めていただければ まとめて直します。
- 2音節語（picnic など）は ぶんぼうぐの テーマとは 関係が うすい語です（ぶんぼうぐの 名前は pencil / eraser / scissors など 2音節 CVC に ならない語が多いため）。会話の中で picnic poster・magnet・pumpkin を使って つなげました。


## Phase 10 — ワールド6（レッスン151〜180・小4／Let's Try! 2 後半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン151〜180を追加**（ワールド6「まなびの城」・school.grade は小4）。ワールド1〜5と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜150は変えず、末尾に同じ書式で追記しただけ（git diff は追加行のみ）。
   - 151〜155 アルファベット こもじ・かんばん（What's this letter? ― It's a small b.、Is this p or q?、Look at the sign.、I see a small k.、まちの かんばん たんけん）
   - 156〜160 ほしい たべもの（What do you want? ― I want a hamburger.、I want a parfait.、How many cherries? ― Three cherries, please.、I want ～ and ～.、パフェやさんごっこ）
   - 161〜165 がっこうの ばしょ（This is the library.、This is my favorite place.、Go straight. Turn right. Turn left.、Where is the nurse's office?、てんこうせい「ピポ」に こうない ツアー）
   - 166〜170 わたしの 1日（I wake up at six.、I eat breakfast.、I go to school.、I do my homework. / I go to bed.、1日の しょうかい）
   - 171〜175 えほん・ものがたり（First, ～. Then, ～.〈サンドイッチ〉、はらぺこ うさぎに なりきり、パンケーキの つくりかた Next, ～.、Once upon a time. ... The end.、じぶんたちの えほん）
   - 176〜180 小4まとめ（おきにいりの ばしょ スピーチ、がっこうの 1日、こもじ クイズショー、はっぴょうの れんしゅう、L180 はスピードTPRつきの ワールド総まとめ「小4 はっぴょうかい」）
2. **フォニックス: マジック e** a_e（L151〜154）→ i_e（L156〜159）→ o_e（L161〜164）→ u_e（L166〜167）→ e_e（L168）→ u_e と e_e（L169）。5の倍数回は ふりかえり。L171〜174 は みじかい母音との くらべ（cap / cape、kit / kite、hop / hope、cub / cube）、L175〜180 は 総まとめ（ブレンド＋マジック e、sh / wh / th / ch＋マジック e、cakes の -s、cupcake などの 2音節語）。`phonics.rule` は "magic-e" / "review"。
3. **フォニックス問題をマジック e に対応（src/lib/curriculum/questions.ts に `magicEQuestion` を追加）**: 今までのままだと cake の答えが「c」（最初の文字）になり、マジック e の練習にならなかった。focus に "a_e" などが ある回は「きこえた ぼいん（a i u e o）の おとは どれ？」。cake → a_e、くらべ回の cap → a。まちがいの選択肢には かならず 同じ母音の ペア（a ↔ a_e）を入れて、みじかい おと と ながい おとの 聞きくらべに した。順番は 語頭ブレンド → 語末 → マジック e → ダイグラフ（shape は sh ではなく a_e で問う）。ワールド1〜5には "_" を ふくむ focus が無いので影響なし（テストで確認）。
4. **まとめ動画（src/lib/recap/script.ts の1行）**: フォーカス "a_e" を cake に一致させて文字を表示するようにした（今までは「含む」で比べていたので a_e が どの語にも一致しなかった）。
5. **レッスン画面（LessonSteps.tsx の1行）**: フォーカスの ボタン "a_e" を おしたとき「アンダースコア」と 読まないように、"_" を スペースにして読む（「a e」）。
6. **マップ（WorldMap.tsx の1行）**: ワールド6の テーマが無かったので「まなびの城」（みどりっぽい色・壁のもじ a_e / i_e / o_e / u_e / abc）を追加。
7. **テスト**: tests/curriculum.test.ts にワールド6の決まりごと（151〜180・小4、マジック e の順番と rule、単語の形、くらべ回の ペア、L180 のスピードTPR、各ブロックの表現の型、3人称の動詞を まだ使わない）、tests/phonics-magic-e.test.ts（新規・5件）。合計 384件。
8. **docs/curriculum-plan.md** に「6-6. ワールド6 のレッスン詳細」を追加、ブロック表の 171〜175 を更新。
9. `npx tsc --noEmit` / `npx vitest run`（384件）/ `npx next build` すべて成功。まとめ動画は全180レッスンで2〜3分に収まることをテストで確認。worksheets のスクリプトが読むフィールド（lessonNo, vocab, school.expressions, tpr, phonics.words/tipJa, school.testPoints）は全レッスンのスキーマテストで必須にしているので読める。

### 判断したこと
- 計画書の「166〜170 u_e, e_e」は、e_e の 本当の ことばが とても少ない（these, theme, eve くらい）ので、e_e は L168 の1回と L169 の くらべだけにした。人の名前（Pete, Steve）は 使わなかった。
- u_e は「ユー」（cute）と「ウー」（rule, flute）の 2つの よみかたが あるので、L167 を「ウー」の回にして tipJa で せつめいした。問題の解説は「ユー（ウー）」と書いた。
- 計画の「171〜175 マジック e ふりかえり」は、ただの くりかえしに ならないよう、いちばん だいじな「e が あると おとが かわる」くらべ（cap / cape）に した。focus を ["a","a_e"] に して、短い語も 問題に なるようにした。
- 3人称（has, says, likes, eats など）は まだ使わない方針を守った。えほんの回も「I'm a rabbit. First, I eat a carrot.」のように キャラクターに なりきる 1人称で書き、テストで 自動チェックするようにした（いちど書いた「It has a tail.」「That sign says open.」などは書きかえた）。
- 「Turn right / left」は計画ではワールド8だが、Let's Try! 2 の「お気に入りの場所」単元の型なので、学校の中の あんないとして ワールド6でも入れた（ワールド8では まちの みちあんないに広げる想定）。
- てんこうせい役に、オリジナルの サブキャラ「ピポ（ビリモの いとこ）」を 会話の中だけに 出した（セリフは無い。speaker は今までどおり 5人だけ）。
- AI 会話タスクでは子どもの本名・学校名・すんでいる ばしょは聞かない（がっこうの回・とうこうの回は「なまえは いわなくて OK」と goalJa に明記）。
- ワールド6の会話の舞台は計画書の名前「まなびの城」に合わせ、マップの名前も同じにした（ワールド6はマップに名前が無かったため）。

### スキップ / 未対応
- 新しいレッスン用の復習クエスト・まとめテスト・ボス（check-151〜180、mini-151-155 …、boss-1-180、arena-151-180、arena-1-180）は ASSESSMENTS には自動で入るが、DB には次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は Phase 2 と同じ理由（reportlab 未インストール）でスキップ。
- 画面での目視確認はしていない（データ追加と問題文の分岐・マップの色・読み上げ1行のみ）。

### オーナーへの質問
- マジック e の問題の選択肢は「a_e」「a」のように 表示しています。こどもには「a_e」の見た目が むずかしければ、「a（エイ）」「a（ア）」のような ラベルに かえられます。
- フォーカスの ボタン「a_e」の 読み上げは「a e」です。ブラウザの声によっては 不自然なので、「cake の a」のような れいの語を 読む形に したほうが よければ 直します。
- ワールド7の テーマ（NEW HORIZON 5）は 版によって 単元が かわるので、作る前に 最新版の単元一覧の確認を おねがいします（計画書の 方針どおり）。


## Phase 11 — ワールド7（レッスン181〜210・小5／NEW HORIZON Elementary 5 前半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン181〜210を追加**（ワールド7「ひかりの島」・school.grade は小5）。ワールド1〜6と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜180は変えず、末尾に同じ書式で追記しただけ。
   - 181〜185 じこしょうかい（My name is ～. / Nice to meet you. / How do you spell it? ― H-A-R-U. / I like ～. I don't like ～. / What animal do you like?、なまえカード こうかん）
   - 186〜190 たんじょうびと つき（12の つき、When is your birthday? ― My birthday is May 5th.、first / second / third、What do you want for your birthday?、たんじょうび カレンダーづくり）
   - 191〜195 きょうかと じかんわり（What subject do you like?、What do you have on Monday? ― I have math and music.、Do you have ～? ― Yes, I do. / No, I don't.、My favorite subject is ～.、ゆめの じかんわり）
   - 196〜200 できること（Can you swim? ― Yes, I can. / No, I can't.、He can run fast.、She can play the piano.、She is good at cooking.、ともだち しょうかい）
   - 201〜205 まちの ひと・しごと（He is a doctor.、She is a baker. She can make bread well.、She works at a hospital.、Who is this? Hint, please.、まちの ひと インタビュー）
   - 206〜210 小5前半まとめ（じこしょうかい スピーチ、がっこうの 1しゅうかん、he / she クイズショー、リハーサル、L210 はスピードTPRつきの ワールド総まとめ「小5前半 はっぴょうかい」）
2. **フォニックス: 母音チーム前半** ai（L181〜182）→ ay（L183〜184）→ ee（L186〜189）→ ea（L191〜194）→ oa（L196〜199）→ ow〈snow の オウ〉（L201〜204）。5の倍数回と L206〜210 は ふりかえり（ai/ay・ee/ea・oa/ow の おなじ おとの ペア、see / sea・meet / meat の 同音語、railway / seaweed / mailbox / snowman の 2音節語）。`phonics.rule` は "vowel-team" / "review"。
3. **フォニックス問題を母音チームに対応（questions.ts に `vowelTeamQuestion` を追加）**: このままだと rain の答えが「r」、sheep の答えが「sh」になり 母音チームの練習に ならなかった。focus に 母音チームが ある回は「きこえた ぼいんの おとは どれ？」。音声だけの問題なので、おなじ おとの つづり（ai ↔ ay、ee ↔ ea、oa ↔ ow）は いっしょに 選択肢に 出さない（聞きわけられないため）。選択肢は 正解＋みじかい母音（rain なら a）＋ほかの おとの グループから 1つずつ。順番は ブレンド → 語末 → マジック e → 母音チーム → ダイグラフ。ワールド1〜6には 影響なし（テストで確認）。
4. **レッスン画面（LessonSteps.tsx）**: フォーカスの ボタン「ai」を おすと「エー・アイ」と 読まれてしまうので、母音チームだけ おとの よみ（ai/ay → "ay"、ee/ea → "ee"、oa/ow → "oh"）を 読むように 小さな表を追加。
5. **マップ（WorldMap.tsx の1行）**: ワールド7「ひかりの島」（うみの あお・ひかりの きいろ、壁のもじ ai / ee / ea / oa / ow）を追加。
6. **テスト**: tests/curriculum.test.ts にワールド7の決まりごと（181〜210・小5、母音チームの順番と rule、cow の ow を 出さない、L210 のスピードTPR、ブロックごとの表現の型、he / she は L196 から）、tests/phonics-vowel-team.test.ts（新規・5件）。合計 425件。
7. **docs/curriculum-plan.md** に「6-7. ワールド7 のレッスン詳細」を追加。
8. `npx tsc --noEmit` / `npx vitest run`（425件）/ `npx next build` すべて成功。

### 判断したこと
- 計画書の ブロック表どおり ai,ay / ee / ea / oa / ow（snow）の 順に した。ay は ai の あとに 2回だけ（ことばの おわりの「エイ」）、ee と ea は 同じ おとなので L195 で see / sea の くらべに した。
- ow は ワールド7では snow の「オウ」だけ。cow / town の「アウ」は 計画どおり ワールド8（テストで 自動チェック）。tipJa にも「cow の ow は ワールド8で」と書いた。
- ea は bread / head のような「エ」と よむ語を さけ、「イー」と よむ語だけに した。
- 3人称（he / she）は 計画どおり L196「できること」から。L181〜195 の 表現・セリフには 出さない（テストで 自動チェック）。works の s は L203 の teacherScript で かんたんに せつめい（文法用語は つかわない）。
- 会話の 一貫性のため キャラの たんじょうびを きめた（ハル 5/5 こどもの日、リコ 6/2、キコ 12/8、エマ先生 10/10、ビリモ 2/29「とくべつな 日」）。計画書にも書いた。
- AI 会話タスクでは 本名・本当の たんじょうびを 聞きださない（goalJa に「ニックネームでも OK」「ほんとうの 日でなくても OK」と明記）。
- L210 の 3つめの 表現は、最初「I want to be a doctor. He is my hero.」と書いたが、あこがれの人（ワールド8）・将来の夢（ワールド11）の 先どりに なるので「What do you have on Thursday? ― I have science.」に 書きかえた。
- NEW HORIZON Elementary 5 の 最新版の 単元一覧は 夜間は 確認できなかった（ネット確認なし）。計画書の テーマ（自己紹介・誕生日・教科と時間割・できること・まちの人）に そのまま 合わせた。

### スキップ / 未対応
- 新しいレッスン用の 復習クエスト・まとめテスト・ボス（check-181〜210、mini-181-185 …、boss-1-210、arena-181-210、arena-1-210）は ASSESSMENTS には 自動で入るが、DB には 次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は 前回と同じ理由（reportlab 未インストール）でスキップ。読むフィールドは スキーマテストで 必須にしているので 読める。
- 画面での目視確認はしていない（データ追加・問題の分岐・マップの色・読み上げの表のみ）。

### オーナーへの質問
- 母音チームの ボタンの 読み上げは "ay" / "ee" / "oh" に しました。ブラウザの声で 不自然なら、「rain の ai」のように れいの語を 読む形に かえられます。
- 母音チームの 問題では ai と ay（ee と ea、oa と ow）を いっしょに 出さない ように しました（音だけでは 区別できないため）。「どちらの つづりか」を 見て えらぶ 問題（文字を 見せる形）も ほしければ 追加します。
- ワールド7の テーマは NEW HORIZON Elementary 5 の 版によって 単元の 順番が ちがう ことが あります。最新版の 単元一覧と ずれが あれば 教えてください（ブロックごと 入れかえられる 作りに しています）。


## Phase 12 — ワールド8（レッスン211〜240・小5／NEW HORIZON Elementary 5 後半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン211〜240を追加**（ワールド8「たびだちの道」・school.grade は小5）。ワールド1〜7と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜210は変えず、末尾に同じ書式で追記しただけ。
   - 211〜215 みちあんない（Where is the station?、Go straight. / Turn right. / Turn left.、It's on your right.、It's next to the park. / between ～ and ～、たびびとを たすけよう）
   - 216〜220 ちゅうもんと ねだん（What would you like? ― I'd like ～, please.、What would you like to drink?、How much is it? ― It's 500 yen.、Here you are. / That's all.、レストランごっこ）
   - 221〜225 にほんの すてき しょうかい（In Japan, we have sushi.、You can see Mount Fuji.、We have Tanabata in July. / You can enjoy fireworks.、It's delicious.、にほん しょうかいガイド）
   - 226〜230 あこがれの ひと（Who is your hero? ― My hero is ～.、She is brave.、He is good at soccer.、He helps people.、ヒーロー しょうかい ポスター）
   - 231〜235 わたしたちの まち（We have a park in our town.、We don't have a zoo.、I want a pool in our town.、Our town is nice. / You can see stars at night.、まちの ガイドブック）
   - 236〜240 小5まとめ（ヒーロー スピーチづくり、たからさがし みちあんない〈Turn right at the second corner.〉、カフェで クイズショー、リハーサル〈Please listen to my speech. / Thank you for listening.〉、L240 はスピードTPRつきの ワールド総まとめ「小5 はっぴょうかい」）
2. **フォニックス: 母音チーム後半** oo〈moon の ウー〉（L211〜212）→ oo〈book の ウ〉（L213〜214）→ ou（L216〜219）→ ow〈cow の アウ〉（L221〜224）→ oi（L226〜227）→ oy（L228〜229）→ igh（L231〜232）→ ie〈pie の アイ〉（L233〜234）。5の倍数回と L236〜240 は ふりかえり（oo の 2つの おと、ou / ow・oi / oy・igh / ie の おなじ おとの ペア、moonlight / playground / cowboy / football の 2音節語）。`phonics.rule` は "vowel-team" / "review"。
3. **母音チームの おとの表を 新しいファイルに（src/lib/curriculum/vowelTeams.ts）**: oo（ウー／ウ）と ow（オウ／アウ）は つづりが おなじでも おとが ちがうので、ことばの 表（book の仲間・cow の仲間）で 見分けるようにした。import の無い 純粋な データなので、レッスン画面からも使える。
4. **フォニックス問題を 母音チーム後半に対応（questions.ts の `vowelTeamQuestion` を 一般化）**: 選択肢 = 正解 ＋ みじかい母音（つづりの 1もじめ。night ↔ i）＋ ほかの おとの つづり 2つ。音声だけの問題なので:
   - おなじ おとに なりうる つづり（ou ↔ ow ↔ oa、oi ↔ oy、igh ↔ ie、ai ↔ ay、ee ↔ ea）は いっしょに 出さない
   - ことばの 中で きこえる ほかの おとの つづり（playground の ay、cowboy の ow）も 出さない
   - **まだ ならっていない つづりは 出さない**（ワールド7の 回に igh などが 出ない。いままでは L195 でも まだ ならっていない oa が 出ていたので、それも なおった）
   - 解説は「moon は「oo」。2つの もじで「ウー」の おと」「book は …「ウ」の おと」「night は「igh」。3つの もじで「アイ」の おと」のように ことばごとの おと。
5. **レッスン画面（LessonSteps.tsx）**: フォーカスの ボタンの 読み上げを vowelTeams.ts の `focusSay` に まとめた。ow は その回の ことばで "oh"（snow）か "ow"（cow）、oo は "oo"（book だけの 回は ことば "book" を よむ）、ou → "ow"、oi / oy → "oy"、igh / ie → "eye"。
6. **マップ（WorldMap.tsx の1行）**: ワールド8「たびだちの道」（ゆうやけの オレンジ・壁のもじ oo / ou / ow / oy / igh）を追加。
7. **テスト**: tests/curriculum.test.ts にワールド8の決まりごと（211〜240・小5、母音チームの順番と rule、oo の ウー／ウ の 回わけ、ow は アウ だけ、ie は アイ だけ、L240 のスピードTPR、ブロックごとの表現の型、AI 会話で まちの なまえ・ヒーローの なまえを きかない）、tests/phonics-vowel-team-w8.test.ts（新規・9件: おとの表・読み上げ・cow / night / cowboy / playground・ワールド8 全語の 選択肢チェック・ワールド7に ワールド8の つづりが 出ない）。合計 471件。
8. **docs/curriculum-plan.md** に「6-8. ワールド8 のレッスン詳細」を追加（oo / ow の ことばを 足すときは vowelTeams.ts の 表にも 足す、と 明記）。
9. `npx tsc --noEmit` / `npx vitest run`（471件）/ `npx next build` すべて成功。まとめ動画は全240レッスンで2〜3分に収まることをテストで確認。

### 判断したこと
- 計画の「oo（moon / book）」は 2つの おとが あるので、2回ずつに わけた（ウー → ウ）。L215 で くらべる。問題の 答えは どちらも「oo」で、解説で おとを 分けた。
- ow は ワールド7（snow の オウ）と ワールド8（cow の アウ）で おとが ちがう。つづりだけでは 決められないので、cow の仲間の ことばの 表で 見分ける形にした。ワールド8の ow の ことばは ぜんぶ アウ（テストで 自動チェック）。
- ie は「アイ」（pie, tie）だけ。piece / field のような「イー」の ie は 出さない（テストで チェック）。ie の 本当の ことばが 少ないので、L234 は skies / flies / spies / cries（y → ies）に した。
- 計画の「oi, oy」は 1ブロックなので、oi 2回 → oy 2回 → L230 で くらべ。igh / ie も 同じ 形。
- かいがいの ともだちは speaker が 5人だけの ルールを まもるため、「エマ先生の めいっこ リリー」と オンラインで はなす 形（リリーの セリフは エマ先生が つたえる）に した。
- ヒーローは 実在の 有名人を つかわず、コーチ・おばあちゃん・しょうぼうし・じゅうい・かしゅ・エマ先生 など。AI 会話では「ほんとうの なまえは いわなくて OK」、まちの 回は「ほんとうの まちの なまえは いわなくて OK」と goalJa に 明記した。
- 3人称単数の -s は helps（L229）と has（L227 の セリフ）を 追加。works（L203）と おなじ せつめいに した。
- I want to be ～（しょうらいの ゆめ）は ワールド11 なので 使わず、「I want a pool in our town.」（ほしい もの）に した。L237 は ワールド7の first / second を つかった みちあんない（Turn right at the second corner.）。
- ねだんは えん（yen）だけ。数字は 100 / 300 / 500 / 800 / 1,000 など。

### スキップ / 未対応
- 新しいレッスン用の 復習クエスト・まとめテスト・ボス（check-211〜240、mini-211-215 …、boss-1-240、arena-211-240、arena-1-240）は ASSESSMENTS には 自動で入るが、DB には 次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は 前回と同じ理由（reportlab 未インストール）でスキップ。読むフィールドは スキーマテストで 必須にしているので 読める。
- 画面での目視確認はしていない（データ追加・問題の分岐・マップの色・読み上げの まとめのみ）。

### オーナーへの質問
- 「book の ウ」の 回は フォーカスの ボタンで ことば "book" を 読みます（"oo" だと ブラウザが「ウー」と 読むため）。おとだけを 聞かせたい 場合は 録音の 音声が 必要です。
- 母音チームの 問題の まちがいの 選択肢に、ow（オウ／アウ の 2つの おと）が 出ることが あります（答えが oo や oi の とき）。こどもが まよう ようなら、ow を まちがいの 選択肢から はずせます。
- 3人称の -s（helps, has）を ワールド8で 少し ふやしました。NEW HORIZON 5 の 範囲より 少し 先どりかも しれません。気になる 場合は He is ～. / He can ～. だけに もどせます。


## Phase 13 — ワールド9（レッスン241〜270・小6／NEW HORIZON Elementary 6 前半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン241〜270を追加**（ワールド9「そらの大陸」・school.grade は小6）。ワールド1〜8と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜240は変えず、末尾に同じ書式で追記しただけ。
   - 241〜245 This is me（I'm good at drawing.、My favorite food is curry.、Please call me Haru.、What's your favorite animal?、じこしょうかいカード こうかん）
   - 246〜250 学校生活と1日（What time do you get up? ― I get up at six thirty.、I usually walk to school.、I always / sometimes ～.、What do you do after school?、せかいの がっこう くらべ〈In Japan, we clean our classroom.〉）
   - 251〜255 行きたい国（Where do you want to go? ― I want to go to Italy.、I want to see the pyramids.、You can eat pizza in Italy.、It's a beautiful country. / Canada is famous for maple syrup.、りょこうがいしゃごっこ）
   - 256〜260 夏休みの思い出（I went to the sea.、It was fun.、How was your summer?、I went to Okinawa with my family. / by plane、なつやすみ トーク）
   - 261〜265 過去のできごと（I saw a rainbow.、I ate shaved ice.、I enjoyed swimming.、What did you do on Sunday? ― I played / watched ～.、えにっきの はっぴょう）
   - 266〜270 まとめ（おもいで スピーチづくり〈Let me tell you about my summer.〉、おもいで クイズショー〈Haru went to Okinawa.〉、スピーチの れんしゅう〈Speak loudly and slowly.〉、ふりかえり、L270 はスピードTPRつきの ワールド総まとめ「小6前半 はっぴょうかい」）
2. **フォニックス: r の つく母音** ar（L241〜244）→ or（L246〜249）→ er（L251）→ ir（L252）→ ur（L253）→ er・ir・ur（L254）→ air（L256〜257）→ ear（L258〜259）。5の倍数回と L261〜270 は ふりかえり（far / fur・cord / card の くらべ、air / ear の くらべ、starfish / sunburn / hairbrush などの 2音節語）。`phonics.rule` は "r-controlled"（新しい 値）/ "review"。
3. **r の つく母音の おとの表を 新しいファイルに（src/lib/curriculum/rControlled.ts）**: ar「アー」、or「オー」、er / ir / ur「ア～」（3つ おなじ）、air「エア」、ear「イア」。ことばを 左から よんで ながい つづりを 先に とる（year の 中の ar、chair の 中の ai に まどわされない）。import の無い 純粋な データ。
4. **フォニックス問題（questions.ts に `rControlledQuestion` を 追加）**: 「きこえた ぼいんの おとは どれ？」。選択肢 = 正解 ＋ みじかい母音（bird ↔ i）＋ ほかの おとの つづり 2つ。er / ir / ur を いっしょに 出さない、ことばの 中の ほかの r の つく母音（airport の or）を 出さない、まだ ならっていない つづりは 出さない（たりない ぶんは みじかい母音で うめる）。shark / chair / third は sh・ch・th ではなく ar・air・ir で 問う（母音チームの つぎ、ダイグラフの まえ）。
5. **フォーカスの 読み上げ（vowelTeams.ts の focusSay に 1行）**: ar → "are"、or → "or"、er / ir / ur → "er"、air → "air"、ear → "ear"（つづりの まま だと「エー・アール」と よまれるため）。LessonSteps.tsx は 変更なし。
6. **マップ（WorldMap.tsx の1行）**: ワールド9「そらの大陸」（よぞらの あお・壁のもじ ar / or / er / ir / air）を追加。
7. **テスト**: tests/curriculum.test.ts にワールド9の決まりごと（241〜270・小6、r の つく母音の 順番と rule、r の つく母音として よめない ことばを 出さない、L270 のスピードTPR、ブロックごとの表現の型、すぎた ことの いいかたは L256 から、AI 会話で 本名・ばしょの なまえを きかない）、tests/phonics-r-controlled.test.ts（新規・11件: おとの表・ながい つづり優先・読み上げ・car / bird / shark / chair / third / airport / far・fur・ワールド9 全語の 選択肢チェック）。合計 519件。
8. **docs/curriculum-plan.md** に「6-9. ワールド9 のレッスン詳細」を追加。
9. `npx tsc --noEmit` / `npx vitest run`（519件）/ `npx next build` すべて成功。まとめ動画は全270レッスンで2〜3分に収まることをテストで確認。

### 判断したこと
- er / ir / ur は 1ブロック（L251〜255）なので、1回ずつ → L254 で 3つ いっしょ（her / sir / fur）→ L255 ふりかえり。air と ear は 2回ずつ。
- カタカナの めやすは ar「アー」と er「ア～」を 分けた（どちらも「アー」に きこえやすいので、解説に「くちを おおきく」「くちを ちいさく して したを まるめて」と くちの かたちを そえた）。
- ear は「イア」（ear, hear, near, year, clear, dear, beard, gear）だけ。bear / pear（エア）や earth / learn（ア～）は まぎらわしいので 出さない。work / world の or（ア～）、here / hero の er（r の あとに 母音）も 出さない（テストで 自動チェック）。
- 過去形は 計画どおり L256（夏休みの思い出）から。went / was / saw / ate は ことばとして おぼえる。enjoyed / played / watched の ed は「すぎた こと」と かんたんに せつめいし、-ed の おとの ちがい（フォニックス）は 計画どおり ワールド11 に のこした。L241〜255 には 過去形を 出さない（テストで 確認）。
- 「いちばんの おもいで（My best memory is ～.）」は ワールド11 なので 使わず、「Let me tell you about my summer.」で スピーチを はじめる 形に した。
- 世界の学校くらべは オーストラリア（がっこうで ぼうしを かぶる・9じごろ はじまる）を れいに した。一般的な ことがらだけ。
- L243 の よびかた（Please call me ～.）は ニックネームで OK。キャラの たんじょうびは ワールド7で きめた ものを そのまま（リコ 6/2、ビリモ 2/29）。キコの ニックネームは「キキ」、ビリモは「ビビ」（会話の中だけ）。
- vocab の thirty の ja が 数字だけ（"30"）だと スキーマテストの「日本語の欄に日本語が無い」に かかるので「30（さんじゅう）」に した。

### スキップ / 未対応
- 新しいレッスン用の 復習クエスト・まとめテスト・ボス（check-241〜270、mini-241-245 …、boss-1-270、arena-241-270、arena-1-270）は ASSESSMENTS には 自動で入るが、DB には 次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は 前回と同じ理由（reportlab 未インストール）でスキップ。新しい フィールドは 追加していない（phonics.rule の 値が 1つ ふえただけ）。
- 画面での目視確認はしていない（データ追加・問題の分岐・マップの色・読み上げの表のみ）。
- NEW HORIZON Elementary 6 の 最新版の 単元一覧は 夜間は 確認できなかった（ネット確認なし）。計画書の テーマに そのまま 合わせた。

### オーナーへの質問
- ar のボタンは "are"、er / ir / ur のボタンは "er" と 読ませています。ブラウザの声で "er" が 不自然なら、"her" や "bird" のような ことばを 読む形に かえられます。
- ar「アー」と er「ア～」の カタカナ表記で よいでしょうか（どちらも「アー」と 書く 教材も あります）。
- 過去形（went / was / saw / ate / enjoyed / played / watched）を ワールド9 後半で まとめて 出しています。量が 多ければ 1回に 1つずつに へらせます。


## Phase 14 — ワールド10（レッスン271〜300・小6／NEW HORIZON Elementary 6 中盤）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン271〜300を追加**（ワールド10「いのちの海」・school.grade は小6）。ワールド1〜9と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜270は変えず、末尾に同じ書式で追記しただけ。
   - 271〜275 いきものと地球（Where do sea turtles live? ― They live in the sea.、Penguins live in cold places.、What do ～ eat?、Sea turtles are in danger.、うみの いきもの クイズ）
   - 276〜280 食べもののつながり（Where is this banana from? ― It's from the Philippines.、This milk is from Hokkaido.、What's in the curry?〈きゅうしょくの ざいりょう〉、Rabbits eat grass.〈しょくもつれんさ〉、きゅうしょく たんていだん）
   - 281〜285 世界のくらし（In India, people eat curry.、In Australia, Christmas is in summer.、In Japan, people bow.、In Venice, people go by boat.、せかいの こどもの 1日〈In Finland, children start school at seven.〉）
   - 286〜290 おすすめ（I recommend this book. It's exciting.、I recommend apple pie. It's sweet.、I recommend the park. You can ～.、Why do you recommend it?、おすすめ ずかんづくり）
   - 291〜295 わたしたちにできること（We can pick up trash. / Let's clean the beach.、We can turn off the water.、Reduce, reuse, recycle、We can walk or ride a bike.、ちきゅうを まもる アイデア かいぎ）
   - 296〜300 まとめ（ていあん スピーチづくり〈もんだい → We can ～. → Let's ～.〉、ちきゅう クイズショー、スピーチの れんしゅう〈Look at this picture. / Thank you for listening.〉、ふりかえり、L300 はスピードTPRつきの ワールド総まとめ「小6中盤 はっぴょうかい」）
2. **フォニックス**: soft c（L271〜274・focus "c"・rule "soft-c"）→ soft g（L276〜279・"g"・"soft-g"）→ おわりの y（L281〜282 イー、L283 アイ、L284 くらべ・"-y"・"ending-y"）→ おわりの -le（L286〜289・"-le"・"ending-le"）→ aw（L291）→ au（L292）→ ew（L293）→ aw au ew（L294・"vowel-team"）。5の倍数回と L296〜300 は ふりかえり（L275 city / cat、L280 giant / goat の くらべ）。`phonics.rule` の 値が 4つ ふえた（新しい フィールドは なし）。
3. **おとの表を 新しいファイルに（src/lib/curriculum/w10Phonics.ts）**: c / g の soft・hard（あとに e・i・y → soft。ch・ck・sc・gh・ng は かぞえない、get / girl などは れいがい表）、おわりの y（ほかに 母音が なければ アイ）、aw・au「オー」/ ew「ウー」、フォーカスの 読み上げ。import の無い 純粋な データ。
4. **フォニックス問題（questions.ts に `w10Question` を 追加。語頭ブレンドの つぎ・語末の まえ）**: c / g は「この ことばの c は どの おと？」（s / k / ch / sh、g は j / g / ch / d。ことばを 画面に 出す）、-y は「おわりの y は どの つづりと おなじ おと？」（ee / igh ＋ 2つ）、-le は「おわりに きこえる おとは どれ？」（-le / -y / -er / -ing）、aw au ew は 母音チームと おなじ 形（aw と au は いっしょに 出さない・ew の ときは oo を 出さない・まだ ならっていない つづりは 出さない）。endingQuestion は "-y" "-le" を 無視する ように 1行 追加（語末ブレンドの 選択肢に ならない）。shy / chew は sh・ch ではなく -y・ew で 問う。
5. **フォーカスの 読み上げ（vowelTeams.ts の focusSay に 2行）**: aw / au → "awe"、ew → "oo"、-y → "ee" / "eye"、-le と soft c / g の 回は 1つめの ことば。ワールド1 の c・g の 回は いままでどおり（テストで 確認）。LessonSteps.tsx は 変更なし。
6. **マップ（WorldMap.tsx の1行）**: ワールド10「いのちの海」（うみの みどりがかった あお・壁のもじ ce / ge / -y / -le / aw）を追加。
7. **テスト**: tests/curriculum.test.ts にワールド10の決まりごと（271〜300・小6、フォニックスの 順番と rule、c / g の おとが ことばの 中で まざらない・れいがい語を 出さない、-y の イー / アイ の 回わけ、few を 出さない、L300 のスピードTPR、ブロックごとの表現の型、AI 会話で 本名・ばしょの なまえを きかない）、tests/phonics-w10.test.ts（新規・12件: おとの表・読み上げ・city / cat / giant / goat / happy / fly / apple / shy / chew / saw / flew・ワールド10 全語の 選択肢チェック・ワールド9 までは 影響なし）。合計 569件。
8. **docs/curriculum-plan.md** に「6-10. ワールド10 のレッスン詳細」を追加。
9. `npx tsc --noEmit` / `npx vitest run`（569件）/ `npx next build` すべて成功。まとめ動画は全300レッスンで2〜3分に収まることを既存テストで確認。

### 判断したこと
- soft c / soft g の focus は "c" / "g"（計画の「soft c（city, ice）」どおり、つづりの テストが そのまま 通る）。ワールド1 の 文字の 音と おなじ 書き方なので、問題・読み上げは「L271（g は L276）より あとの 回だけ」「ことばが ぜんぶ soft の ときだけ」に かぎった。
- c / g の 問題は 音声だけ では「どちらの おとか」を ルールで 考えられないので、ことばを 画面に 出した（c の あとの もじを みて きめる 練習）。
- bicycle / circle のように 1つの ことばに soft と hard が まざる ことばは 出さない（テストで 確認）。
- おわりの y は 計画の 例（happy, fly）どおり「イー」と「アイ」を 分けて 教え、L284 で くらべ。July / apply のような れいがいは 出さない。
- -le の 問題は つづりの ちがい（-le / -el / -al）だと 音声で 聞きわけられないので、ちがう おとの 語尾（-y / -er / -ing）と くらべる 形に した。
- aw / au / ew は 計画どおり 1ブロック（L291〜295）。aw・au・ew を 1回ずつ → L294 で 3つ いっしょ。ew は「ウー」の ことばだけ（few / new の「ユー」は 避けた。new は アメリカ英語の「ヌー」に 近い 読みで あつかった）。
- 「or」（ワールド9）と aw / au は カタカナでは どちらも「オー」だが、aw の 問題の 選択肢には or が 入らない（r の つく母音は 別の 問題）ので 混乱は ない と 判断。
- せかいの くらしは 一般的な ことがら（なつの クリスマス、ベネチアの ボート、フィンランドは 7さいで 入学、おじぎ / あくしゅ）だけに し、こくみんせいを きめつける 文は 書かなかった。
- 海外の 話は ワールド8 と おなじく「エマ先生の めいっこ リリー（オーストラリア）」を 通して（speaker は 5人の まま）。
- 「将来の夢・いちばんの思い出」は ワールド11 なので 使わず、L300 の しめくくりは「We can save the sea. Let's start today!」（ていあん）に した。

### スキップ / 未対応
- 新しいレッスン用の 復習クエスト・まとめテスト・ボス（check-271〜300、mini-271-275 …、boss-1-300、arena-271-300、arena-1-300）は ASSESSMENTS には 自動で入るが、DB には 次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は 前回と同じ理由（reportlab 未インストール）でスキップ。新しい フィールドは 追加していない（phonics.rule の 値が ふえただけ）。
- 画面での目視確認はしていない（データ追加・問題の分岐・マップの色・読み上げの表のみ）。
- NEW HORIZON Elementary 6 の 最新版の 単元一覧は 夜間は 確認できなかった（ネット確認なし）。計画書の テーマに そのまま 合わせた。

### オーナーへの質問
- soft c / g の 問題で ことばを 画面に 出しています（「この ことばの c は どの おと？」）。音声だけで 聞かせたい 場合は 表示を 🔊 に もどせますが、その ときは ルールでは なく 耳だけの 問題に なります。
- aw / au のボタンは "awe"、ew のボタンは "oo" と 読ませています。ブラウザの声が 不自然なら ことば（saw / new）を 読む形に かえられます。
- -y の「イー」と「アイ」の 見わけかたを「ほかに 母音が あるか」で 説明しています（happy は a が ある → イー、fly は ない → アイ）。学校の 説明と ちがう 場合は 解説を なおせます。


## Phase 15 — ワールド11（レッスン301〜330・小6／NEW HORIZON Elementary 6 後半）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン301〜330を追加**（ワールド11「ゆめの都」・school.grade は小6）。ワールド1〜10と同じ形式（conversation・recap つき）、英文はすべてオリジナル（教科書の文は使っていない）。既存のレッスン1〜300は変えず、末尾に同じ書式で追記しただけ。
   - 301〜305 いちばんの思い出（What's your best memory? ― My best memory is ～.、I enjoyed the relay.、What did you do? ― We visited Kyoto.、This is me at the music festival.、そつぎょうアルバムづくり）
   - 306〜310 学校行事（We had sports day. It was exciting.、The races were exciting.〈was / were〉、Our teacher said, "Well done!"〈がっしょうコンクール〉、There were many people.〈がくえんさい〉、うんどうかい かべしんぶん）
   - 311〜315 将来の夢（What do you want to be? ― I want to be a teacher.、Because I like bread.、I practice swimming every day.、When I'm older, ～. / I want to run faster.、ゆめラジオ インタビュー）
   - 316〜320 中学でしたいこと（What club do you want to join? ― I want to join the brass band.、I want to study English hard.、The soccer club is the biggest club.、Can I try it?〈たいけんにゅうぶ〉、ぶかつ しょうかいポスター）
   - 321〜325 ありがとうメッセージ（Thank you for your help.、I could swim 25 meters.、I would like to say thank you.、I'm happy because you were kind to me.、Because of you, I could speak English.〈よせがき〉、サプライズ ありがとうパーティー）
   - 326〜330 まとめ（ゆめの スピーチづくり〈おもいで → My dream is to be ～. → Because ～.〉、ゆめ クイズショー〈He / She wants to be ～.〉、スピーチの れんしゅう〈Let me tell you about my dream. / Thank you for listening.〉、ゆめの都 ふりかえり、L330 はスピードTPRつきの ワールド総まとめ「小6 はっぴょうかい」）
2. **フォニックス**: -ed の 3つの おと（L301 ト・L302 ド・L303 イド・L304 まざる。focus "-ed"・rule "ending-ed"）→ サイトワード was / were / said / there（L306〜309・rule "sight-words"）→ -er（L311 ～する ひと・L312 e を とる・L313 もじを 2つに・L314「もっと」。"-er"・"ending-er"）→ -est（L316〜319。"-est"・"ending-est"）→ サイトワード could / would / because（L321〜324）。5の倍数回と L326〜330 は ふりかえり。`phonics.rule` の 値が 4つ ふえた（新しい フィールドは なし）。"sight-words" は 既存テストで すでに 想定されていた 値。
3. **おとの表を 新しいファイルに（src/lib/curriculum/w11Phonics.ts）**: -ed の おと（まえの もじで ト / ド / イド）、「もっと」の -er の ことば表、サイトワードの よみかたヒント、フォーカスの 読み上げ。import の無い 純粋な データ。
4. **フォニックス問題（questions.ts に `w11Question` を 追加。ワールド10 の つぎ・語末の まえ）**: -ed は「この ことばの おわりの -ed は どの おと？」（ト（t）/ ド（d）/ イド（id）の 3択。ことばを 画面に 出す）、-er / -est は「おわりに きこえる おとは どれ？」（-er / -est / -ed / -ing。解説で ひと・もっと・いちばんを 見わける）、サイトワードは「きこえた ことばは どれ？」（画面は 🔊、選択肢は その回の にている ことば〈was / saw / what / want など〉→ ならった サイトワード）。there は th ではなく サイトワードで 問う。既存の 問題関数は 変更なし（呼び出し順に 1つ 足しただけ）。
5. **フォーカスの 読み上げ（vowelTeams.ts の focusSay に 2行）**: -ed / -er / -est は その回の 1つめの ことばを 読む（"ed" を「エド」と 読まない）。サイトワードは ことばの まま。LessonSteps.tsx は 変更なし。
6. **マップ（WorldMap.tsx の1行）**: ワールド11「ゆめの都」（ゆうやけの むらさき・壁のもじ -ed / was / -er / -est / said）を追加。
7. **テスト**: tests/curriculum.test.ts にワールド11の決まりごと（301〜330・小6、フォニックスの 順番と rule、サイトワードの 回は その ことばを ふくむ、-ed の ト / ド / イド の 回わけ・-sed を 出さない、-er / -est の 語尾・L314 は「もっと」、L330 のスピードTPR、ブロックごとの表現の型、AI 会話で 本名・がっこうの なまえを きかない）、tests/phonics-w11.test.ts（新規・8件: おとの表・読み上げ・jumped / played / wanted / teacher / tallest / taller / was / said / there・ワールド11 全語の 選択肢チェック・makeQuestion と 一致・ワールド10 までは 影響なし）。合計 615件。
8. **docs/curriculum-plan.md** に「6-11. ワールド11 のレッスン詳細」を追加。
9. `npx tsc --noEmit` / `npx vitest run`（615件）/ `npx next build` すべて成功。

### 判断したこと
- -ed は 計画どおり「3つの おと」を 1回ずつ（ト → ド → イド）→ L304 で まざる 形に した。音声だけでは ルールを 考えられないので、soft c / g と おなじく ことばを 画面に 出す。選択肢は 3つの おとだけ（4つめに 意味の ない 選択肢を 足さない）。
- passed / used のように s で おわる ことばは ss と s で おとが かわるので、-sed の ことばは 使わなかった（テストで 確認）。
- サイトワードは 「つづりの きまりで よめない ことば」なので、問題は「にている つづりから きこえた ことばを えらぶ」形に した（was / saw の さかさま、would / wood の おなじ おと など、まちがえやすい ペアを その回の ことばに 入れた）。
- 計画の サイトワード（could, would, because）は 3つなので、L324 は 3つ いっしょ ＋ should（-ould の なかま）に した。
- -er は「～する ひと」（teacher）だけでなく、L314 で「もっと」（taller）も あつかい、つぎの -est（いちばん）に つなげた。L320 で taller / tallest の くらべ。
- ワールド9 で とっておいた「いちばんの おもいで（best memory）」と -ed の 3つの おとを、ここで はじめて 出した。
- 中学校の 話は 一般的な ぶかつ（サッカー・バスケ・すいそうがく・びじゅつ・テニス・かがく・えんげき・バドミントン）だけ。ぶかつ・ありがとう・まとめの 回の AI 会話には「ほんとうの なまえ / がっこうの なまえ / せんせいの なまえは いわなくて OK」を 明記。
- キャラの ゆめは 回を またいで そろえた（ハル＝サッカーせんしゅ、リコ＝せんせい、キコ＝かしゅ、ビリモ＝パンやさん）。

### スキップ / 未対応
- 新しいレッスン用の 復習クエスト・まとめテスト・ボス（check-301〜330、mini-301-305 …、boss-1-330、arena など）は ASSESSMENTS には 自動で入るが、DB には 次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は 前回と同じ理由（reportlab 未インストール）でスキップ。新しい フィールドは 追加していない（phonics.rule の 値が ふえただけ）。
- 画面での目視確認はしていない（データ追加・問題の分岐・マップの色・読み上げの表のみ）。
- NEW HORIZON Elementary 6 の 最新版の 単元一覧は 夜間は 確認できなかった（ネット確認なし）。計画書の テーマに そのまま 合わせた。

### オーナーへの質問
- -ed の 問題の 選択肢を「ト（t）/ ド（d）/ イド（id）」の 3つに しています。ほかの 問題と おなじ 4択に そろえたい 場合は おしえてください。
- サイトワードの 回の ことばに saw / wood / why などの「にている ことば」を 入れています。サイトワードだけ（was, were …）で 4つ そろえたい 場合は 入れかえられます。
- -er の「もっと」（taller）を ワールド11 で 出しました。比較級は 中学の 内容なので、小学校の はんいに とどめたい 場合は L314 を ほかの「～する ひと」の ことばに もどせます。


## Phase 16 — ワールド12（レッスン331〜360・小6〜中学準備）（2026-11-24）

### やったこと
1. **content/curriculum/lessons.json にレッスン331〜360を追加**（ワールド12「グランドフィナーレ」・school.grade は小6）。これで 12ワールド × 30 ＝ **360レッスンが すべて そろった**。ワールド1〜11と同じ形式（conversation・recap つき）、英文はすべてオリジナル。既存のレッスン1〜330は変えず、末尾に同じ書式で追記しただけ（diff は追加のみ）。
   - 331〜335 あいさつ・自己紹介 総復習（I am / You are、He is / She is / They are、Are you ～? / Is he ～?、ともだちを くわしく しょうかい、じこしょうかい スピーチ）＝ 中学校の入学式
   - 336〜340 すきなもの・できること・ほしいもの 総復習（Do you like ～?、I can ～. / Can you ～?、I want ～. / I want to ～.、like・can・want を つなげる、ぶかつ えらび）＝ 部活の体験入部
   - 341〜345 1日・時間・場所 総復習（What time do you get up?、Where is the library? ― It's on the third floor.、I have six classes a day. / After school, ～.、Where do you practice? / It starts at four.、わたしの 1日 スピーチ）＝ 中学の1日
   - 346〜350 過去のできごと 総復習（I went to ～.、I saw ～.、I ate ～. It was ～.、How was ～? ― It was fun.、1ねんの できごと トークショー）＝ 1年のできごとトーク
   - 351〜355 5W1H の質問（Who / What、When / Where、Why ― Because / How、6つ ぜんぶ、Thank you for the interview.）＝ インタビュー大会
   - 356〜360 1年のふりかえり（Welcome to the party!、I can speak English.、My best memory is ～.、What did you learn this year?、L360 はスピードTPRつきの 360レッスン総まとめ「Thank you for a wonderful year.」）＝ グランドフィナーレ・パーティー
2. **フォニックス**: サイトワード総復習（ワールド11 の was / were / said / there / could / would / because ＋ あたらしい are / they / should / friend / people）→ 多音節語（てを たたいて まとまりを かぞえる。3つ → 3つ → 4つ → 2〜4つ まざる。rule "syllable"＝既存の 値）→ 短い文章の音読・音読（rule "reading"＝新しい 値。まえの ワールドの つづり a_e / ai ee ea oa / oo ou / ar or ir ur / -ed / c g / -y -le / aw au ew を 1年分 ふりかえる）→ 5W1H の サイトワード（who what / when where / why how / 6つ）。新しい フィールドは なし。
3. **おとの表を 新しいファイルに（src/lib/curriculum/w12Phonics.ts）**: ワールド12 の サイトワードと はじめて ならう 回、よみかたヒント、多音節語の まとまり（syllablesOf）、フォーカスの 読み上げ（w12Say）。import の無い 純粋な データ。
4. **フォニックス問題（questions.ts に `w12Question` を 追加。語頭ブレンドの つぎ・ワールド10 の まえ）**: サイトワードは「きこえた ことばは どれ？」（にている つづり〈who / what / want / how、when / where / then / there、why / how / now / my〉から えらぶ）。多音節語は「この ことばは いくつに わけて よむ？（てを たたいて かぞえよう）」（ことばを 画面に 出し、1〜5 の ちかい かず 4つから えらぶ）。音読の 回は まえの ワールドの 問題を そのまま つかう。L331 より前の 回では かならず null なので、既存レッスンの 問題は かわらない（テストで 確認）。
5. **フォーカスの 読み上げ（vowelTeams.ts の focusSay に 2行）**: "bas-ket-ball" は ことば まるごと "basketball" と 読む。L116〜144 の "sun-set" なども おなじ 読みに なった（ハイフンを 読ませない ための 小さな 改善）。
6. **マップ（WorldMap.tsx の1行）**: ワールド12「グランドフィナーレ」（きんいろ・壁のもじ who / why / how / bas-ket / 360）を追加。
7. **さいごの ボス（index.ts の1行）**: boss-1-360 は ひらく レッスンが ないので unlocksLesson を null に した（合格しても「Lesson 361 が ひらいた」と 出ない）。それ以外の ボス・まとめテストは いままでどおり。
8. **テスト**: tests/curriculum.test.ts にワールド12の決まりごと（331〜360・小6・ぜんぶで 360、フォニックスの 順番と rule、サイトワードの 回は その ことばを ふくむ、多音節語の ハイフンと まとまりの かず、音読の 回の -ed / c g / -y の おと、L360 の スピードTPR と さいごの ボス、ブロックごとの 表現の型、AI 会話で 本名・ばしょの なまえを きかない）、tests/phonics-w12.test.ts（新規・8件: おとの表・読み上げ・サイトワード・多音節語・音読の 回・ワールド12 全語の 選択肢チェック・ワールド11 までは 影響なし）。合計 661件。
9. **docs/curriculum-plan.md** に「6-12. ワールド12 のレッスン詳細」を追加。
10. `npx tsc --noEmit` / `npx vitest run`（661件）/ `npx next build` すべて成功。

### 判断したこと
- 計画の「短い文章の音読」「音読」は、フォニックス画面が 1もじずつ ひかる ブレンディング表示（大きな もじ・2列）なので、phonics.words に 文を 入れると 画面が くずれる。そこで words は 1語ずつに し、短い文章は tipJa の「音読：「…」」と 先生・会話・表現で あつかった。音読の 回の focus は まえの ワールドの つづりに して、1年分の フォニックス総復習に なるように した。
- 「多音節語の読み方」は、音声だけで 答えられる「まとまりの かず（はくしゅの かず）」の 問題に した。chocolate / family / interesting のように 人に よって かずが かわる ことばは 使わなかった。
- 5W1H の ことば（who what when where why how）は 計画の「サイトワード仕上げ」に そのまま あてた（wh だけど who は「フ」）。what / where の wh は ダイグラフではなく サイトワードとして 問う。
- マジック e の 回に park のような みじかい母音1つの ことばを まぜると「a」の 問題に なって しまうので、マジック e を ふくむ ふりかえり回では その組み合わせを さけた（L360 は a_e ではなく ai を 使った）。
- キャラクターは 小学生の まま「ちゅうがっこうを けんがく・たいけん する」お話に した（入学式・体験入部・中学の1日）。中学校の 話は 一般的な ことがらだけ。
- AI 会話タスクの じこしょうかい・インタビュー・パーティーの 回には「ほんとうの なまえ / ばしょの なまえは いわなくて OK」を 明記。たんじょうびなど 個人に ちかい 話題は さけ、「コンサートは いつ？」の ような 話題に した。

### スキップ / 未対応
- 新しいレッスン用の 復習クエスト・まとめテスト・ボス（check-331〜360、mini-331-335 …、boss-1-360、arena-331-360、arena-1-360）は ASSESSMENTS には 自動で入るが、DB には 次回の `npm run db:seed` で入る（マイグレーション不要）。
- worksheets/generate_worksheets.py の実行は 前回と同じ理由（reportlab 未インストール）でスキップ。新しい フィールドは 追加していない（phonics.rule の 値 "reading" が ふえただけ）。
- 360レッスン ぜんぶ おわった あとの 「おめでとう」画面（全クリア演出）は 作っていない（今回は データと 問題のみ。最後の ボスで「Lesson 361」と 出ない ように した だけ）。
- 画面での目視確認はしていない（データ追加・問題の分岐・マップの色・読み上げの表のみ）。

### オーナーへの質問
- 多音節語の 問題を「いくつに わけて よむ？」（かずを えらぶ）に しました。ことばを 画面に 出しているので、音だけで 聞かせたい 場合は 🔊 に もどせます。
- 音読の 回は「1語ずつの フォニックス ＋ tipJa の 短い文章」に しました。文を まるごと 読み上げ・録音する 専用の「音読ステップ」を 作るかどうか（画面の 追加が 必要）を きめてください。
- 360レッスン 全クリア後の 体験（おめでとう画面・2周目・中学コースなど）を どう するか きめてください。


## Phase 17 — README 更新と朝のまとめ（2026-11-24）

### やったこと
1. **README.md を今夜の内容に合わせて更新**
   - 冒頭: 全360レッスン（12ワールド×30）完成、AI会話・まとめ動画、スキップなし、を追記。データの流れの図に recap / conversation を追加。
   - 使い方: `npm run db:migrate` に統一し、`RECAP_WATCHED` のマイグレーションと レッスン31〜360 の seed のための再実行、DB が無いときに見られるもの（/recap/1・キャラクタープレビュー）を追記。テスト件数を 85件 → 661件（22ファイル）に。`CONVERSATION_MODEL` を説明。
   - ディレクトリ構成: lessons.json を 1〜360 に、フォニックスの音の表（vowelTeams / rControlled / w10〜w12Phonics）、recap・conversation、/recap ページ、ConversationStep / RecapPlayer、docs/curriculum-plan.md・docs/night を追加。レッスンを 9ステップに。
   - **「ポケモン風ステージマップ」の表記を「RPG風ステージマップ」に変更**（BRIEF の「ポケモンのデザインをまねしない」に合わせた）。
   - キャラクター: エマ先生を表に追加、年齢どおりの頭身と並べるときの大きさ、立ち絵の作り（Rig・parts.tsx・KeyLight / ColorGrade）を最新に。
   - 新しい節: 「12ワールド」の表（計画書の名前とマップの名前を両方のせた）、「きょうのまとめ動画」、「AIキャラとの会話」。コイン表に まとめ動画 5コイン（1日1回）。
   - 「骨組みとして残している部分」: カリキュラムを「360レッスン完成」に、まとめ動画・AI会話・課金/無料体験/LINE月報の行を追加。
2. **docs/night/MORNING.md（新規・日本語）**: できあがったもの、ためしかた（DB なしで見られるもの／`npm run dev` までの全手順）、うまくいかなかったこと・未確認のこと、決めてほしいこと16項目（優先度順）、次にやるとよいこと。
3. `npx tsc --noEmit` 成功／`npx vitest run`（22ファイル・661件）成功／`npx next build` 成功。

### 判断したこと
- MORNING.md の「決めてほしいこと」は、Phase 1〜16 の「オーナーへの質問」から重複をまとめ、プライバシー・見た目・ワールド名・全クリア後 を最優先にした。
- README のワールド表は、ワールド2〜4 で計画書とマップの名前が違う状態を そのまま見えるようにした（統一はオーナーの判断待ち）。
- offline-resilience ブランチとの衝突を確認: main との差分で、server.ts / client.ts / db.ts / src/lib/offline / seed.ts の変更は0、API ルートは新規2本（conversation・recap watched）だけ。
- `night-logs/99-summary.log`（空のファイル）は BRIEF どおり `git add -A` でコミットに含めた。

### スキップ / 未対応
- コードの変更はなし（ドキュメントのみ）。ブラウザでの目視確認・ワークシートPDFの生成・実際の Claude API での確認は、今夜を通して未実施（MORNING.md に記載）。

### オーナーへの質問
- MORNING.md の「4. 決めてほしいこと」を ご確認ください。
