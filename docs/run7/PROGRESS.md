# Run 7 progress

## Phase 1 — 6年カリキュラムの全体計画（2026-11-25）

### やったこと
- `docs/curriculum-6year.md` を新しく作成（約 1,400 行・日本語）。内容:
  - 基本方針（週5 × 年40週 = 年200レッスンで 6年 1,200 レッスン、保護者への約束は「小6で CEFR A2〜B1 の会話力」）
  - 先生の台本の英語の割合（ステージ2 はほぼ英語＋短い日本語、ステージ3 以降は英語だけ）
  - ステージ一覧と各ステージの CEFR can-do・英検のめやす・文法・累計語彙・フォニックス／つづり／形態素・会話スキル・読む・書く
  - ワールド13〜40 の一覧（名前・英語名・テーマ）と、各ワールドの詳細（文法、ブロックごとのつづりの焦点、会話スキル、読み書き、**30 レッスンのタイトル・中心の表現・会話シーン**）
  - 年ごとのマイルストーン（週5 と 週7以上）、学校の英語との対応表（保護者向け表示）、追加インプット「えいごの としょかん」の計画、年1回の「力だめし」の計画、データと技術の方針、書くときのチェックリスト
- 表の検証: L361〜1200 の 840 行がすべて連番でそろっていること、タイトルが重複しないこと（ステージ1 の 360 タイトルとも重複しない）を node で確認。

### 決めたこと（理由）
- **ステージの区切り**: ステージ1 = W1〜12（L1〜360・既存）／ステージ2 = W13〜20（L361〜600・A1→A2）／ステージ3 = W21〜28（L601〜840・A2→A2+）／ステージ4 = W29〜35（L841〜1050・B1）／ステージ5 = W36〜40（L1051〜1200・B1+、B2 の入口へ）。
  週5ペースでステージ2 の終わりが小3 の終わり、全修了が小6 の終わりになるように割り当てた。
- **ワールド名**: 既存と同じ「○○の△△」型（あさひの港町・にぎわいの市場・かぜの草原 … ちえの議事堂・しんかいの都 … はじまりの星）。最後の W40「はじまりの星」は W1「はじまりの森」と対になる名前にした。
- **話し手は既存の 5 人のまま**（Haru / Riko / Kiko / Birimo / Ms. Emma）。スキーマを変えずに済むため。外国の友だちやお店の人は、ビリモやエマ先生が役を演じる形にする。
- **物語の流れ**: W12 で王国に着いた一行が、ビリモの見つけた「まだ地図にない せかい」の地図で新しい旅に出る。各ワールドの最終回で次の場所への手がかりを見つける。
- **学校の英語との対応**: L30 小1 → L60 小2 → L120 小3 → L180 小4 → L240 小5 → L330 小6 → L480 中1 → L630 中2 → L780 中3 → L1050 高校初級の会話レベル → L1200 高校卒業程度の会話レベルをめざす。中学の内容は「文法の型と話題の対応」で、教科書の本文は使わない。
- **英検のめやす**は「その級の会話・リスニング・読む力の感じ」とし、合格の保証ではないと明記（英検2級の語彙は約 5,000 語と多く、本カリキュラムは会話力を優先するため）。英検準2級プラス（2025年度新設）もめやすに入れた。
- **伝記・社会の話題**: 実在の有名人・会社名・商品名は出さない（伝記は架空の人物か一般化）。防災はこわがらせない、社会の話題は一方の立場に寄せない、とチェックリストに明記。
- 1,200 回のうち記念回（L400・500・600・700・800・900・1000・1100・1200）は、お祝いの場面にした。

### 確認
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 41 ファイル・1,010 テスト すべて成功
- `npx next build`: 成功。P2（ワールド分割）前の基準値として記録: 共有 First Load JS 101 kB、/map 416 kB、/lesson/[lessonNo] 421 kB、/gacha 407 kB、/test/[assessmentId] 406 kB、/parent 158 kB（First Load）。

## Phase 2 — 1,200 レッスンに むけた コードの変更（2026-11-25）

### やったこと
- **カリキュラムを ワールドごとの ファイルに分割**: `content/curriculum/lessons.json`（1.38 MB）を `content/curriculum/worlds/world-01.json 〜 world-12.json`（`{ world, stage, level, lessons }`）に分けて、lessons.json は削除。分割前後で 360 レッスンの中身が完全に同じことを確認。
  - 小さな索引 `content/curriculum/index.json`（先生・レッスン数・ワールドごとの ステージ／レベル／範囲／ファイル名、約 3 KB）と、タイトルの索引 `content/curriculum/titles.json`（番号・ワールド・ステージ・英日タイトル）。
  - `scripts/curriculum-index.ts`（`npm run curriculum:index` / `npm run curriculum:check`）: ワールドのファイルから 索引と `src/lib/curriculum/bundledWorlds.ts`（サーバー用の import 一覧）を作る。番号の抜け・world の不一致はエラー。進みぐあい表示・60 秒の時間制限つき。`--split` は 古い lessons.json を分ける（一度だけ使用）。
- **読み込み層（src/lib/curriculum/index.ts）を作り直し**:
  - TOTAL_LESSONS・テスト定義（ASSESSMENTS）は 索引だけで決まる。getAssessment / gateTestAfterLesson / reviewQuestFor は Map で引く（1,200 レッスンで テスト約 1,500 個でも マップ作成が速い）。
  - サーバー（Node・API・seed・テスト）は bundledWorlds.ts で 全ワールドを読む（同期 API はそのまま）。
  - ブラウザでは next.config.ts の NormalModuleReplacementPlugin で bundledWorlds を 空の `bundledWorlds.browser.ts` に差しかえ、`ensureLessonsLoaded(start, end)` で 必要なワールドの JSON だけを あとから読む（ワールドごとのチャンク）。
  - おためし・オフライン: `loadOfflineLesson`（そのレッスン＋直前 4 レッスンのワールド）、`loadOfflineTestStart / loadOfflineTestSubmit`（テスト範囲のワールド）を追加し、レッスン画面と TestRunner はこれを使う。
  - itemsInRange / getItem はレッスンごとのキャッシュから（全項目の filter / find をやめた）。`countWordsLearned` を追加。
- **ステージ・レベル**: `src/lib/curriculum/stages.ts`（ブラウザでも使える純粋関数）に STAGES・ワールドごとのレベル・`schoolGradeCompleted`（§6 の表）・1か月ワークブックの範囲（20 レッスンごと）。LessonDef に任意の `stage` / `level` を追加（ファイルに無ければワールドの値を入れる）。レッスン画面の見出しに「ステージ1（Pre-A1）」を表示。
- **ワールド13〜40**: `src/lib/game/worlds.ts` に 40 ワールドの名前（計画どおり）と英語名。マップ（WorldMap）に 13〜40 のテーマ（既存の古代樹・レリーフ・霧・モンスターを使い回し、色の組み合わせとレリーフの文字だけ新しく。40 ワールドすべて別の配色）。
- **マップは いまのワールド ± 1 だけ描く**（1,200 レッスンだと約 2,700 ノード）。上下に「まえの ワールドも みる」「さきの ワールドを のぞく」ボタン（2 ワールドずつ増える）。現在地へのスクロールはデータが変わったときだけ。
- **1か月ワークブックは 20 レッスンごと**: Python（generate_worksheets.py）は ワールドのファイルを索引どおりに読み、`--month --pack N`（No.N = L20N−19〜20N）・`--world N`（そのワールドにかかる冊）・`--all` で `worksheets/out/monthly/month-NN.pdf` を作る（表紙・20日のよていひょう・こたえ。ボス戦がある冊だけ説明に入る）。置き場所のキーは `worksheets/monthly/month-NN.pdf`、アップロードは `--pack N`。毎月のレポートは「つぎに進むレッスン」の冊を同封する。
- **保護者向けの表示**: おうちの方ページのお子さまカードに「ステージN『名前』＋レベル」「学校の英語: 小6 の内容まで修了」「覚えた ことば ○語」。学習レポート（PDF・LINE の要約）にも ステージ・レベル・学校の英語・覚えた ことばの数を追加。
- **テスト**: `tests/curriculum.test.ts` はワールドのファイルを直接読み、索引（index.json・titles.json・bundledWorlds）とのずれ、ファイル名、ステージ・レベル、ワールドの連続を確認（ワールド数によらず動く。ステージ2 以降の学年「中1〜中3・高校」も許可）。`tests/run7-infra.test.ts`（16 テスト）: ステージ・レベル、学校の英語の表、20 レッスンのワークブック、レポート、保護者カードの値、表引きが全探索と同じ答え、**bundledWorlds を空にした「ブラウザと同じしくみ」で あとから読み込んで おためしレッスン・ボステストが作れること**、1,200 レッスン（40 ワールド）でのテスト定義の数・マップ・表示範囲、40 ワールドのテーマ。

### クライアントのバンドルサイズ（next build の First Load JS）
| ページ | 前（P1 の基準値） | 後 |
|---|---|---|
| /map | 416 kB | **187 kB** |
| /lesson/[lessonNo] | 421 kB | **191 kB** |
| /gacha | 407 kB | **176 kB** |
| /test/[assessmentId] | 406 kB | **175 kB** |
| /arena | — | 177 kB |
| /dashboard | — | 178 kB |
| /parent | 158 kB | 158 kB |
| 共有 | 101 kB | 101 kB |

- ビルドの静的ファイルにレッスン本文が入っているのは、あとから読むワールドのチャンク 12 個（1 つ 77〜101 KB、おためしでそのワールドを開いたときだけ読む）だけであることを確認。ワールドが 40 になっても最初に読む量は増えない（索引が少し増えるだけ）。

### 決めたこと（理由）
- **サーバーは全ワールドを同期で持つ**（API・seed・進行の計算はそのまま速く・単純に）。ブラウザだけをワールド単位の遅延読み込みにした。差しかえは webpack のプラグインで行い、Node（vitest・tsx）では本物の bundledWorlds が使われる。
- **タイトルの索引は titles.json に分けた**: index.json はブラウザにものるので、1,200 件のタイトル（約 90 KB）を入れない。
- **レベルの割り当て**: ステージ1 は W1〜6 = Pre-A1、W7〜12 = A1。W13 以降は計画書 §10 の各ワールドの見出し（到達のめやす）に合わせた（W13〜16 A1+、W17〜23 A2、W24〜28 A2+、W29〜36 B1、W37〜40 B1+）。
- **学校の英語の表示**は「1 から順にクリアしたレッスン数」で判定（進み方は順番どおりなので）。L1050 以降は「〜に とうたつ」と表示。
- **ワークブックの番号は 20 レッスン区切りの通し番号**（No.1〜60）。ワールドの区切り（30）とずれるため、表紙には かかるワールド名をすべて書く。古い world-NN.pdf のキーはもう使わない（本番の置き場所には `npm run worksheets:month -- --all` → `npm run worksheets:upload` で month-NN.pdf を置き直す）。
- **マップの表示範囲**: いまのワールド ± 1（最初の表示で約 200 ノード）。360 レッスンの今でも描く量が約 1/4 になる。
- 新しいワールドを書く作業（WORLD.md）では、`world-NN.json` を置いたあと `npm run curriculum:index` を実行する（docs/curriculum-6year.md §9 に追記）。

### 確認
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 42 ファイル・1,032 テスト すべて成功
- `npx next build`: 成功（警告なし）
- `python worksheets/generate_worksheets.py --month --pack 2`: No.2（L21〜40・58 ページ、ワールド1・2 の名前、ボス戦 1〜30 入り）を作れることを確認

## WORLD — ワールド13「あさひの港町」（L361〜390）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-13.json` を新しく作成（30 レッスン、ステージ2・A1+、`school.grade` は「中1」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 390 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 128、会話の セリフ 168 行（1 回 5〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 144 語の英語＋短い日本語の たすけ。
- ブロック構成: 361〜365 3単現の -s（has / likes）→ 366〜370 かぞく・doesn't・Does ～?（-es）→ 371〜375 ひんど always / usually / sometimes / never・What time does she ～?（-ies・goes / does / has）→ 376〜380 しごと What does he do? / works at / Who catches ～?（-tch）→ 381〜385 かいわの わざ（あいづち・How about you?・What kind?・ききかえし）（-dge）→ 386〜390 ふりかえり（クイズ・ともだちの 1日・えはがき 3 文・さよならさんぽ・はっぴょうかい）。5 の倍数回は 発表・インタビュー・ビデオ・ショー。L390 は スピード TPR と、次の ワールド（にぎわいの市場）への 手がかり。
- フォニックスの 問題（`src/lib/curriculum/w13Phonics.ts`・`questions.ts` の `w13Question`。いちばん 先に よぶ）:
  - -s / -es: 「この ことばの おわりの s は どの おと？」（ス / ズ / イズ。イズは -es を ならう L366 から）。likes を 複数形の -s の 問題に しない。
  - -ies・goes / does / has: 「he / she の ときの ただしい つづりは？」（studies / studys / studyes、plays / plaies / playes）。
  - tch / dge: 「＿ に はいる つづりは？」（ca＿ → tch、tea＿ → ch、pa＿ → ge）。ふりかえり回は ch / ge と くらべる。
- テスト: `tests/curriculum.test.ts` に ワールド13 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順と おと・文法と 会話スキルの 型・doesn't / Does の あとに s を つけない・先生の台本の 英語の 割合・AI 会話で 個人情報を きかない）を 追加。`tests/phonics-w13.test.ts`（8 テスト）を 追加。ワールド12 の テストの「全部で 360 レッスン」「ボス 360 は ひらく レッスンが ない」を「ステージ1 は 360」「さいごの ボスだけ null（ボス 360 は L361 を ひらく）」に なおした。

### 決めたこと（理由）
- **先生の台本は 既存の `teacherScript` に そのまま 書いた**（スキーマに `teacher` という 項目は 無く、docs/teacher-plan.md も 無い）。ステージ2 の 方針どおり ほぼ 英語で、日本語の たすけは 1 セクション 1〜2 文。あいさつ → 場面 → きょうの 文（いっしょに いう）→ 文法の ポイント → フォニックス → 会話の コツ → しめ の 形で、約 1.5〜2 分の 読み上げ量（テストで 英語 120 語 以上・日本語の 文字は 25% 未満を 確認）。
- **新しい phonics.rule**: "ending-s" "ending-es" "ending-ies" "tch" "dge"（ふりかえりは "review"）。-s の 「ス／ズ」は L361 = ス、L362 = ズ、L363・364 = まざる の 順で、-es の「イズ」より 先に した。
- **新しい 話し手は 増やさない**: 港の 人（はたらく人・じもとの子）は エマ先生・ビリモが「ごっこ あそび」で 演じる（計画書 §1-2）。
- AI 会話は、紹介・ビデオ・えはがき・スピーチの 回の goalJa に「ほんとうの なまえ・じゅうしょは いわなくて OK」を 明記。ビデオの 回は 先生の台本でも「じゅうしょや がっこうの なまえは いわない」と 教える。
- 自分で 1 回 見なおして なおした ところ: 早口の セリフ（単語を つなげた 文字列）は 読み上げが こわれるので ふつうの 文に（日本語に「とても はやくちで」）、L390 の キコの 不自然な セリフ、tch の 回の ヒントに 例外（which）を 書かない。

### 例（L369「Does She Like Cats?」）
- 表現（core）: Does she like cats? ／ Yes, she does. She has five cats! ／ Does he drink milk? ― No, he doesn't.
- 会話（ねこカフェ）: Haru「Does that big cat drink milk?」 Ms. Emma「No, he doesn't. He drinks water. Milk isn't good for cats.」
- フォニックス: dances / changes / passes / buzzes（-es の「イズ」）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 43 ファイル・1,079 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 189 kB（187 → +2）、/lesson/[lessonNo] 192 kB（191 → +1）、/gacha 177 kB、/test/[assessmentId] 176 kB、/parent 158 kB（増えたのは ワールド13 の 問題の コードと 索引の 1 ワールドぶん。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 19`: No.19（L361〜380・62 ページ）を 作れることを 確認

## WORLD — ワールド14「にぎわいの市場」（L391〜420）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-14.json` を 新しく 作成（30 レッスン、ステージ2・A1+、`school.grade` は「中1」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 420 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 127、会話の セリフ 184 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 129 語の 英語（最少 121 語）＋短い 日本語の たすけ。
- ブロック構成: 391〜395 市場・some / any・Can I have some ～?・a glass of / a cup of / a piece of（複数形 -es）→ 396〜400 ねだん How much is / are ～?・大きな 数と How many ～?・That's too expensive.・おつり（-ies / -ys / -ves）。L400 は「400 回 記念」で 4人が おみせを 開く → 401〜405 料理教室 What's in ～?・命令文の てじゅん First / Next / Then / Finally・It smells / tastes / looks ～（kn・wr）→ 406〜410 すすめる・ことわる・たべられない もの・あじ・もてなし（mb・ph）→ 411〜415 せかいの たべもの People in ～ eat a lot of ～・あさごはん・come from・けんこう・お弁当コンテスト（大きな 数の つづり）→ 416〜420 ふりかえり（なぞなぞ・好きな 食べものの 話・レシピカード・さよなら買いもの・マーケットショー）。
- 物語の 糸: L391 で ビリモの 地図に「市場で きんの りんごを さがせ」。L419 で 見つけ、L420 で りんごの 中から 次の 地図（かぜの 草原）が 出てくる。
- フォニックスの 問題（`src/lib/curriculum/w14Phonics.ts`・`questions.ts` の `w14Question`。w13Question より 先に よぶ）:
  - 複数形 "es" "ies" "ys" "ves": 「ふたつ いじょうの ときの ただしい つづりは？」（box → ？ で boxes / boxs / boxis、knife → knives / knifes / knifs、key → keys / keies / keyes）。
  - だまっている もじ "kn" "wr" "mb" と "ph": 「＿ に はいる つづりは？」（＿ife → kn、la＿ → mb、ele＿ant → ph）。
  - 大きな 数 "-ty" "-teen" "hundred" "thousand": 「きこえた 数の ただしい つづりは？」（forty / fourty / forthy）。-teen と -ty が ならぶ L413 は thirteen / thirty の ききわけ。
- テスト: `tests/curriculum.test.ts` に ワールド14 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順・文法と 会話の 型・先生の台本の 英語の 割合・会話の 行数・L400 記念・L420 スピード TPR・ねだんは 円・AI 会話で なまえを いわなくて OK）を 追加。`tests/phonics-w14.test.ts`（8 テスト）を 追加。

### 決めたこと（理由）
- **複数形の focus は ハイフン なしの "es" "ies" "ys" "ves"**: ワールド13 の "-es"（3 単現の s の おと）と 区別するため。focus の 正規表現（ハイフンを 消す）では どちらも ことばに ふくまれる。
- **新しい phonics.rule**: "plural-es" "plural-ies-ves" "silent-letters"（kn・wr・mb）"ph" "number-spelling"（ふりかえりは "review"）。ph は「だまっている もじ」では ないので rule を 分けた。
- **複数形の 問題は もとの 形が はっきり わかる ことばだけ**（pluralSpelling は horses・oranges・apples などを null に する）。f / fe → ves は 表（knives, loaves, leaves …）で もつ。
- **AI の 相手**: 「さいしょの ひとことの I'm ○○ は 会話に 出る キャラ」の 既存ルールに 合わせ、L398・L399 の starter を ビリモに した。
- **ねだんは 円**（日本の 子ども向け。ドル・セントは 出さない）。国の たべものは「多くの 人が」「よく」と 言い、決めつけない 言い方に した。アレルギー（L408）は「おみせの 人に はっきり つたえる」「友だちの 食べられない ものを おぼえる」と 前向きに 教える。
- 自分で 1 回 見なおして なおした ところ: L415 の ハルの セリフと 表現の 食い違い（ブロッコリー → きゅうり に そろえた）、L397 の titleJa（数字だけで 日本語の 検証に かからない → 「50、60、そして 100」）、L398 で ビリモが ロボットに 見える セリフを「おどりかたが にてる」に、先生の台本が 120 語に 足りない 回（L402〜406・L413・L414）に 1〜2 文 足した。

### 例（L398「That's Too Expensive!」）
- 表現（core）: That's too expensive. ／ Do you have a cheaper one? ／ This one is only three hundred yen. I'll take it!
- 会話（おもちゃ屋さん）: Haru「Five thousand? That's too expensive. Do you have a cheaper one?」 Ms. Emma「How about this little robot? It's only three hundred yen.」
- フォニックス: knives / wolves / scarves / calves（f / fe → ves）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 44 ファイル・1,123 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 190 kB（189 → +1）、/lesson/[lessonNo] 193 kB（192 → +1）、/gacha 178 kB、/test/[assessmentId] 177 kB、/parent 158 kB（増えたのは ワールド14 の 問題の コードと 索引の 1 ワールドぶん。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 20`: No.20（L381〜400・62 ページ）を 作れることを 確認

## WORLD — ワールド15「かぜの草原」（L421〜450）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-15.json` を 新しく 作成（30 レッスン、ステージ2・A1+、`school.grade` は「中1」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 450 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 121、会話の セリフ 182 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 136 語の 英語（最少 125 語）＋短い 日本語の たすけ。
- ブロック構成: 421〜425 現在進行形の はじまり The wind is blowing.・What are you doing? ― I'm ～ing.・Look! She's running.・Are you ～ing? ― Yes, I am.・ビデオ通話（-ing で e を とる）→ 426〜430 どうぶつ観察 The horses are eating grass.・behind / in front of / next to / between・What is the dog doing? ― It's digging.・観察報告（-ing で 子音を 重ねる）→ 431〜435 スポーツ 現在形と 進行形の くらべ（I play soccer every day. / I'm playing soccer now.）・Pass the ball! Nice try!・Keep going!・Who's winning?・運動会の 実況（複合語）→ 436〜440 えの 説明 In the picture, ～.・On the left / On the right / In the middle・What's happening?・まちがいさがし（isn't / aren't）・発表会（短縮形）→ 441〜445 しぜん It's raining. We're staying inside.・A rainbow is coming out.・growing tall・The stars are shining.・草原日記（y の 3つの おと）→ 446〜450 ふりかえり（ジェスチャーゲーム・服と 動作で 人さがし・えと 3 文・さよならピクニック・実況ショー）。
- 物語の 糸: L421 で ちずに「草原で かぜの はねを さがせ」。L449 の さよならピクニックで はねが そらから おちてきて、L450 で はねが ひかり、ちずに「ふるい いしの いせき」（ワールド16 きおくの遺跡）が うつる。
- フォニックスの 問題（`src/lib/curriculum/w15Phonics.ts`・`questions.ts` の `w15Question`。w14Question より 先に よぶ）:
  - -ing "-ing": 「ing を つけた ただしい つづりは？」（make → ？ で making / makeing / makking、run → running / runing / runeing、play → playing / playying / playeing）。e を とる・重ねる ことばは 表で もつ（falling を fal＋l に しない）。
  - 複合語 "sun-flower" など: 「2つの ことばに わけると？」（sun + flower / su + nflower / sunf + lower）。せつめいに パーツの いみ（sun たいよう＋flower はな）。
  - 短縮形 "'m" "'s" "'re" "n't": 「みじかい かたちは？」（she is → ？ で she's / shes / she'is、is not → isn't / isnt / is'nt）。せつめいで「' は きえた もじ（i）の しるし」。
  - y "y": 「この ことばの y は どの おと？」（イェ（yes）/ イー（happy）/ アイ（fly））。ワールド10 の ySound を つかい、はじめの y を「イェ」に した。
- フォニックスの ボタン: 短縮形の focus は「…n't」「みじかい かたち」と 見せる（`phonicsButtons.ts`）。読み上げは その回の ことば（I'm, isn't）。
- テスト: `tests/curriculum.test.ts` に ワールド15 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順と 種類・文法と 会話の 型・先生の台本の 英語の 割合・会話の 行数・L450 スピード TPR・AI 会話で なまえ・じゅうしょを いわなくて OK）を 追加。`tests/phonics-w15.test.ts`（8 テスト）を 追加。`tests/night2-decisions.test.ts` の「ボタンは 英字だけを 読む」を「ことばの なかの ' は OK」に した（I'm は ふつうに 読み上げられる）。

### 決めたこと（理由）
- **新しい phonics.rule**: "ing-drop-e" "ing-double" "compound-words" "contractions" "y-sounds"（ふりかえりは "review"）。-ing の focus は ワールド5 と おなじ "-ing" だが、w15Question を いちばん 先に よぶので L421 からは つづりの 問題に なる（ボタンも「…ing おわりの おと」の まま）。
- **複合語の focus は "sun-flower" の ハイフン形**（ワールド12 の はくの 形と おなじ 書きかた。ボタンは「sun・flower」）。わけかたの 選択肢は 1もじ ずらした もの。
- **短縮形の まちがいの 選択肢は「' が ない」「きえた もじを のこす・' の いちが ちがう」**（shes / she'is、isnt / is'nt）。it's / its の ような ほんとうに ある ことばは まちがいに しない。
- **y の 3つの おと**: yummy の ような「はじめも おわりも y」、play / boy の ような 母音チーム、gym の ような まんなかの y は 出題しない（null）。
- **新しい 話し手は 増やさない**: 牧場の 人・画家は エマ先生が「ごっこ あそび」で 演じる。ビデオ通話（L425）は エマ先生が 町に いる 設定。
- 現在形と 進行形の くらべ（L431）は every day / now を 合図に する（計画書どおり）。L438 の 理由（because）と L443 の taller than は 先どりの 「ききなれ」だけで、テストの core には しない。
- AI 会話は ビデオ通話・日記・ステージ発表の 回の goalJa に「ほんとうの なまえ・じゅうしょは いわなくて（かかなくて）OK」を 明記。L425 の 先生の台本でも「じゅうしょや がっこうの なまえは いわない」と 教える。L447 の 人さがしは「いじわるな ことは いわない」と 台本で ことわる。
- 自分で 1 回 見なおして なおした ところ: L434 の core 表現に ― が 入っていた（スペル問題に なるので「Who's winning?」と「The red team is.」に 分けた）、L437 で ビリモが 自分に「ビリモ」と よびかける セリフ、L439 で ビリモが もっていない えの 話を する セリフ、L446 の 語順（Kiko, is he dancing?）、台本が みじかい 回（L426・L434）に 1 文 足した。

### 例（L429「What Is the Dog Doing?」）
- 表現（core）: What is the dog doing? ／ It's digging. ／ Is it wagging its tail? ― Yes, it is.
- 会話（牧場）: Riko「What is the dog doing?」 Haru「It's digging. Look at the dirt!」 Birimo「Is it looking for a bone?」 Ms. Emma「Yes, it is. Pochi always hides bones here.」
- フォニックス: digging / wagging / jogging / grabbing（子音を 重ねて ing。問題は dig → ？ で digging / diging / digeing）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 45 ファイル・1,167 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 192 kB（190 → +2）、/lesson/[lessonNo] 195 kB（193 → +2）、/gacha 180 kB、/test/[assessmentId] 179 kB、/parent 158 kB（増えたのは ワールド15 の 問題の コードと 索引の 1 ワールドぶん。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 22`: No.22（L421〜440・62 ページ）を 作れることを 確認

## WORLD — ワールド16「きおくの遺跡」（L451〜480）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-16.json` を 新しく 作成（30 レッスン、ステージ2・A1+、`school.grade` は「中1」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 480 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 121、会話の セリフ 209 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 126 語の 英語（最少 121 語）＋短い 日本語の たすけ。
- ブロック構成: 451〜455 過去形の ひろがり People lived here long ago.・What did you do yesterday?・We stopped and looked.・Did you see that? ― Yes, I did. / No, I didn't.・遺跡日記（wasn't / weren't）→ 456〜460 ふきそくな 過去形 sang・wrote・knew・Where did you go last weekend? ― I went to ～. / I stayed home.・週末トーク → 461〜465 bought・I thought it was a ghost!（正体は シーツ）・Who taught you? ― My grandpa did.・It wasn't easy, but I did it. / Were you tired?・1日の ふりかえり（A, B, and C）→ 466〜470 はじめての「おはなし」Once upon a time・First / Then / After that・Finally・How did he feel? ― He felt sad because ～.・おはなし タイム → 471〜475 ついかの しつもんと はんのう How was your summer?・Who did you go with? / How long did you stay?・Sounds fun! / Oh no! What happened?・My best day was ～.・思い出インタビュー When did you ～? How was it? → 476〜480 ふりかえり（過去形クエスト・4コマの おはなし・むかしの 日記 5文を よんで 自分の 日記・さよならツアー・おはなし発表会）。
- 物語の 糸: L451 で かぜの はねが しめした いせきに つく。L466〜469 の 石版の むかし話（さびしい 王さまに とりが はこを とどけ、たねから 大きな 木が そだち、こどもたちが あそびに きて 王さまが わらう）は オリジナル。L465 で とうの てっぺんで かぎを 見つけ、L476 で その かぎの たからばこを あけると「むかしの 日記」が 出てきて、L478 で よむ（王さまの 木が 出てくる）。L480 で 日記の さいごの ページに「ほしの ちず」と「やまの うえの とう」（ワールド17 ほしふる天文台）。
- フォニックスの 問題（`src/lib/curriculum/w16Phonics.ts`・`questions.ts` の `w16Question`。w15Question より 先に よぶ）:
  - -ed の つづり "-ed": 「ed を つけた ただしい つづりは？」（like → liked / likeed / likked、stop → stopped / stoped / stopeed、cry → cried / cryed / cryied、walk → walked / walkked / walkt）。
  - ふきそくな 過去形 "a"（i → a）"o_e" "ew" "ought" "aught": 「すぎた ことの かたちは？」（sing → sang / singed / sanged、write → wrote / writed / wroted、fly → flew / flied / flewed、buy → bought / buyed / baught、catch → caught / catched / cought）。表に ある 30 語だけ 出題。
  - -ed の 3つの おと（rule が "ed-sounds" の L471〜474）: ワールド11 と おなじ「おわりの -ed は どの おと？」（ト / ド / イド）。ふりかえり回（rule: review）の -ed は つづりの 問題。
- テスト: `tests/curriculum.test.ts` に ワールド16 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順と 種類・文法と 会話の 型・先生の台本の 英語の 割合・会話の 行数・L480 スピード TPR・日記／インタビュー／発表で なまえ・じゅうしょを いわなくて OK・手紙と 日記の 台本で じゅうしょを 教えない）を 追加。`tests/phonics-w16.test.ts`（7 テスト）を 追加。

### 決めたこと（理由）
- **新しい phonics.rule**: "ed-spelling" "past-i-a" "past-o-e" "past-ew" "ought-aught" "ed-sounds"（ふりかえりは "review"）。計画の B3「i → o・o → e」は、o…e に なる もの（wrote・woke・broke …）と ew に なる もの（knew・flew・drew …）に 2回ずつ わけた。
- **focus は ことばに ふくまれる つづり**（全体テスト「フォニックスの単語は フォーカスを 含む」を そのまま 通すため）。i → a は "a"、o…e は マジック e と おなじ "o_e"（wrote は ほんとうに o…e の かたちなので ボタンの「o…e マジック e」も まちがいでは ない）。ふきそくな 過去形は focus の もじが あっても 表に ない ことばは 出題しない。
- **まちがいの 選択肢**: こどもが ほんとうに しがちな「きそくどおりの -ed」（singed・buyed・flied）と「過去形に もう一度 ed」（sanged・wroted）。ought / aught は 2つめを いれかえ（baught・cought）に して、つづりの みわけを 練習させる。sat（→ sated が ほんとうの ことば）の ような まぎらわしい ものは レッスンに 入れなかった。
- **-ed の つづりの「そのまま」**: まちがいは 重ねた 形（walkked）と 音の とおりの 形（walkt・playd・wantid）。agreed の ような e の つづく ことばは 出題しない。
- **新しい 話し手は 増やさない**: 案内人の むすめ（L459）・つぼ職人（L463）は エマ先生、旅の子 レオ（L471）は ビリモが「ごっこ」で 演じる。
- **やすみの 話**: どこにも いかなかった 子の ために L459 で I stayed home and read a book. を 表現に 入れ、AI の goalJa にも「I stayed home. で OK」と 書いた。L472 の AI 会話は「ほんとうの ばしょの なまえは いわなくて OK」。L462 の おばけは こわく しない（正体は シーツ、goalJa に「こわい はなしは しなくて OK」）。L473 は「しっぱいを わらうのでは なく いっしょに わらう」と 台本で 教える。
- 自分で 1 回 見なおして なおした ところ: L476 の 日本語欄が 英語だけに なっていた（スキーマの 検証で 発見 → 日本語に）、L456 の 台本で エマ先生が 自分を「with Ms. Emma」と よぶ 文、L451 の sounds（liked・danced は /t/）、L477 の 台本の 流れ（おはなしを くりかえす と いって すぐ フォニックスに うつっていた）、台本が 120 語に 足りない 回（L459・460・462・463・467〜469・472〜477・479）に 練習の やりとりを 1〜2 文 足した。

### 例（L462「I Thought It Was a Ghost!」）
- 表現（core）: I thought it was a ghost! ／ It was just a sheet. ／ Were you scared? ― Yes, I was!
- 会話（夜の 遺跡）: Haru「Look! Something white is moving over there!」 Kiko「Eek! Is it a ghost?」 Birimo「Ha ha! It's just a sheet. It's drying in the wind.」 Haru「Phew! I thought it was a ghost!」
- フォニックス: woke / broke / spoke / chose（o…e に なる 過去形。問題は wake → ？ で woke / waked / woked）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 46 ファイル・1,210 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 193 kB（192 → +1）、/lesson/[lessonNo] 196 kB（195 → +1）、/gacha 181 kB、/test/[assessmentId] 181 kB、/parent 158 kB（増えたのは ワールド16 の 問題の コードと 索引の 1 ワールドぶん。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 24`: No.24（L461〜480・61 ページ）を 作れることを 確認

## WORLD — ワールド17「ほしふる天文台」（L481〜510）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-17.json` を 新しく 作成（30 レッスン、ステージ2・A2、`school.grade` は「中2」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 510 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 127、会話の セリフ 201 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 130 語の 英語（最少 125 語）＋短い 日本語の たすけ（1〜2 文）。
- ブロック構成: 481〜485 be going to（We're going to see the stars tonight.・What are you going to do this weekend?・I'm going to visit my grandma.・Are you going to join us? ― Yes, I am. / No, I'm not.・First, we're going to ～. Then, ～. の けいかく発表）→ 486〜490 will（Will it rain tomorrow? ― I think it will. / I don't think so.・It will be sunny tomorrow.・It won't be cold. Don't worry.・I'll help you.・てんきよほう ばんぐみ）→ 491〜495 うちゅう（The moon goes around the Earth.・Mars is red.・Astronauts sleep in sleeping bags.・Look! A shooting star! Make a wish!・Which planet is the biggest? の クイズナイト）→ 496〜500 ゆめと みらい（Someday I will go to space.・What will you be in twenty years? ― I'll be ～.・I think robots will help us at home.・I want to go to Mars because it's exciting.・L500 記念パーティー）→ 501〜505 せいざと メッセージ（Long ago, people saw pictures in the stars.・These stars look like a bear.・うちゅうへの メッセージ・I'll call you tomorrow. I promise. ― Don't forget! ― I won't!・みらいフェア）→ 506〜510 ふりかえり（ゴーイングトゥー ビンゴ・Why don't we go together?・Dear future me, I will ～.・さよなら観察会・ほしぞらショー）。
- 物語の 糸: ワールド16 の「ほしの ちず」が しめす 丘の 上の 天文台に 着く（L481）。L501 の せいざの むかし話（北の くにの こぐまが ほしに よばれて そらで ねむる「ねむい くま」）は オリジナル。L502 で キコが 自分の せいざ「しあわせ ねこ」を つくり、L510 の ショーで 2つを 紹介。L504 の 天文台の 子 ルカ と やくそくし、L509 で「ルカが でんわ くれる」と ふりかえる。L510 で 望遠鏡の むこうに 山の あいだの みどりの 谷が 見え、Hello! が かえってくる（ワールド18 こだまの谷 L511「Hello! Hello! Hello!」へ）。
- フォニックスの 問題（`src/lib/curriculum/w17Phonics.ts`・`questions.ts` の `w17Question`。w16Question より 先に よぶ）:
  - -tion / -sion / -ture "-tion" "-sion" "-ture": 「ただしい つづりは どれ？」（sta＿＿＿＿（えき）→ station / stasion / stashun、fu＿＿＿＿（みらい）→ future / fucher / fuchur）。
  - will の 短縮形 "'ll" と "n't": 「みじかい かたちは どれ？」（I will → I'll / I'will / Il'l、will not → won't / willn't / wo'nt、did not → didn't / didnt / did'nt）。
  - 同音異義語（rule が "homophones" の 回と、ふりかえりの 回の 表に ある ことば）: 「ぶんに あう ことばは どれ？」（Fish swim in the ＿＿. → sea / see / meat、I like stars, ＿＿. → too / to / two）。
  - or・ore・oar・our "or" "ore" "oar" "our": 「「オー」の ただしい つづりは どれ？」（「4（よん）」→ four / for / fore / foar）。
- テスト: `tests/curriculum.test.ts` に ワールド17 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順と 種類・文法と 会話の 型・先生の台本の 英語の 割合・会話の 行数・L510 スピード TPR・メッセージ／やくそく／メモ／発表で なまえ・じゅうしょを いわなくて OK・台本で じゅうしょや パスワードを 教えない）を 追加。`tests/phonics-w17.test.ts`（10 テスト）を 追加。

### 決めたこと（理由）
- **新しい phonics.rule**: "tion" "sion" "ture" "contractions-will" "homophones" "or-spellings"（ふりかえりは "review"）。計画の B2「-sion と -ture」は 486〜487 を -sion（ジョンの vision 系と ss の mission 系に 1回ずつ）、488〜489 を -ture に わけた。
- **つづりの 問題は いみを いっしょに 見せる**（sta＿＿＿＿（えき）、「4（よん）」）。four / for、board / bored の ように ほんとうに ある ことばが まちがいの 選択肢に なっても、いみで 1つに きまる。そのため 出題は `W17_MEANING` の 表に ある ことばだけ。question・mansion の ような よみの ちがう ことばは 入れていない。
- **-tion / -sion の まちがいは「もう 一方の おわり」と「音の とおりの shun」**、-ture は「cher / chur」（こどもが 音の まま かきがちな 形）。
- **'ll の まちがいに「' を とった 形」を つかわない**（he'll → hell、we'll → well に なるため）。かわりに I'will（will を のこす）と Il'l（' の いち）。won't は こどもが つくりがちな willn't を まちがいに した。
- **同音異義語の focus は その 回の ことばの 母音の つづり**（"ee" "ea"、"u" "o"、"o" "ue" "ew"、"ere" "eir" "ear"）。全体テスト「フォニックスの単語は フォーカスを 含む」を そのまま 通し、ボタンも「ee」「ea」の ように おなじ おとの ちがう つづりを 見せられる。2つ組の ことばは 3つめの 選択肢に おなじ 回の べつの 組の ことば（see / sea / meet）を つかう（にせの つづりを 見せない）。
- **新しい 話し手は 増やさない**: 天文台の 子 ルカ（L504）は ビリモが「ごっこ」で 演じる。
- **文法の さきどり**: L492 の Much bigger than ～、L495 の Which planet is the biggest? は ワールド18（比較）の「ききなれ」だけで、テストの core には しない。L507 の Why don't we ～? は さそいの 決まり文句として 入れた。
- **こじん じょうほう**: うちゅうへの メッセージ（L503）と みらいの じぶんへの メモ（L508）は「From the children of Earth」「From me」で おわり、台本と 会話で「ほんとうの なまえや じゅうしょは かかなくて いい」と 教える。L504 の ビデオ通話は「でんわの まえに おとなに きく・じゅうしょや パスワードを ネットで いわない」と 台本で 教え、AI の goalJa は「じゅうしょや でんわばんごうは いわなくて OK」。L496・L497 の ゆめは「うちゅう いがいでも・まだ きまって いなくても OK」。
- 自分で 1 回 見なおして なおした ところ: core の 表現に ― が 入っていた（L489「I'll help you. ― Thanks!」、L509「Will it be clear tonight? ― I think it will.」→ core を 前半だけに）、L500 の 単語の 日本語欄が「100」だけ（→「ひゃく」）、L484 の 会話で ハルが ことわった まま おわっていた（ココアで「いく！」に かわる 1 行を 足し、リコの 2 行を 1 行に まとめて 7 行に）、L493 の ビリモの セリフ（You won't go there tomorrow → You won't live there.）、L499 の If we have a rocket（→ Imagine we have a rocket.）、L509 の 日本語訳（なつかしく なる → おわかれ するのは さびしい）、台本が 125 語に 足りない 回（L487・490・492・495・500・505〜509）に 1〜2 文 足した。

### 例（L489「I'll Help You」）
- 表現（core）: I'll help you. ／ This box is heavy. ― I'll carry it. ／ I'll open the door for you. ― Thanks!
- 会話（天文台の かいだん）: Ms. Emma「We need to take the telescope to the roof. But this box is heavy.」 Haru「I'll help you!」 Riko「I'll open the door for you.」 Kiko「It's dark on the stairs. I'll get a flashlight.」 Birimo「And I'll carry the blankets!」
- フォニックス: future / creature / furniture / capture（おわりの「チャー」は ture。問題は fu＿＿＿＿（みらい）で future / fucher / fuchur）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 47 ファイル・1,256 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 195 kB（193 → +2）、/lesson/[lessonNo] 199 kB（196 → +3）、/gacha 184 kB（181 → +3）、/test/[assessmentId] 183 kB（181 → +2）、/parent 158 kB（増えたのは ワールド17 の 問題の コード・いみの 表と 索引の 1 ワールドぶん。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 25`: No.25（L481〜500・61 ページ）を 作れることを 確認

## WORLD — ワールド18「こだまの谷」（L511〜540）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-18.json` を 新しく 作成（30 レッスン、ステージ2・A2、`school.grade` は「中2」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 540 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 123、会話の セリフ 204 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 135 語の 英語（最少 124 語）＋短い 日本語の たすけ（1 文）。
- ブロック構成: 511〜515 比較級・最上級（Echo Valley is bigger than the plains.・This tree is taller than that tree.・This is the longest river in the valley.・A blue whale is heavier than an elephant.・どうぶつの きろくカード The cheetah is the fastest land animal.）→ 516〜520 more / most・better / best（This flower is more beautiful.・Pandas are the most popular.・I like apples better than oranges.・Which do you like better, summer or winter?・グループ ランキング発表）→ 521〜525 as ～ as と -ly（This dinosaur was as big as a bus.・I'm not as fast as a horse.・Walk quietly. The birds are sleeping.・more colorful than this one・観察レポート It's one of the best hunters.）→ 526〜530 きもちと いけん（The echo sounds unhappy today.・Be careful! Don't be careless.・I think so, too. / I don't think so.・I like this one better because it's cuter.・いぬと ねこの ミニ話し合い That's a good point.）→ 531〜535 くらべて 説明（A frog can jump farther than you think!・Which is older, the bridge or the tower?・In picture A, the dog is bigger.・くらべる ぶんを 3〜4 文 かく・What is the tallest animal? の クイズショー）→ 536〜540 ふりかえり（Let's make the biggest echo ever!・You're the best friend in the valley.・谷の ガイドブック・さよならハイキング・くらべっこショー）。
- 物語の 糸: ワールド17 の 望遠鏡で 見えた みどりの 谷に 着き、こだまで あそぶ（L511）。L526 で こだまの精が「いまは だれも 谷に こない。さびしい」と げんきを なくし、L536 の 作戦会議で みんなで やさしい ことばを さけんで「いままでで いちばん おおきな こだま」を つくる。L537 で おれい、L538 で「もっと ひとが くるように」ガイドブックを つくる。L540 の ショーの さいごに おかの むこうから「カチン、カタン」と 音が して、ワールド19 からくり工房へ。
- フォニックスの 問題（`src/lib/curriculum/w18Phonics.ts`・`questions.ts` の `w18Question`。w17Question より 先に よぶ）:
  - -er / -est "-er" "-est": 「くらべる かたちの ただしい つづりは？」（big → ？（もっと おおきい）→ bigger / biger / biggar、heavy → ？（いちばん おもい）→ heaviest / heavyest / heavest）。
  - 音節と 強勢（rule "stress"、focus は ワールド12 と おなじ "el-e-phant" の かたち）: 「つよく よむ ところは どこ？」（elephant（ぞう）→ EL-e-phant / el-E-phant / el-e-PHANT）。
  - -ly "-ly": 「ly を つけた ただしい つづりは？」（happy + ly → happily / happyly / happly、careful + ly → carefully / carefuly / carefulley）。
  - -ful / -less "-ful" "-less": 「いみに あう ことばは？」（「ふちゅういな」→ careless / careful / careles）。
  - un- "un-": 「はんたいの いみの ことばは？」（kind → ？（はんたいの いみ）→ unkind / inkind / diskind）。
- フォーカスの ボタン: `phonicsButtons.ts` に はじめに つける つづり（"un-" →「un…」「はじめに つける」）を 追加。`vowelTeams.ts` の 読み上げで "-ly" "-ful" "-less" "un-" を その回の ことばで よむ（「ハイフン エル ワイ」と よまない）。
- テスト: `tests/curriculum.test.ts` に ワールド18 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順と 種類・文法と 会話の 型・先生の台本の 英語の 割合・会話の 行数・L540 スピード TPR・ガイドブック／発表で なまえを いわなくて OK・ひとの からだを くらべない・ペットが いなくても OK）を 追加。`tests/phonics-w18.test.ts`（11 テスト）を 追加。

### 決めたこと（理由）
- **新しい phonics.rule**: "er-est" "stress" "ly" "ful-less" "un"（ふりかえりは "review"）。-er / -est は 1回ごとに つけかたを 1つ（511 そのまま・512 e で おわる・513 重ねる・514 y → i）、-ly も 521 そのまま・522 e で おわる（e を のこす）・523 y → i・524 ful ＋ ly に わけた。
- **まちがいの 選択肢は こどもが ほんとうに しがちな もの**: -er / -est は「重ねない／重ねすぎ」「e を のこす」「y の まま」と 母音の まちがい（tallar・nicist）、-ly は「y の まま」「l が 1つ」、-ful / -less は「もう一方の おわり」と「full・les」、un- は にた はたらきの in- / dis-。fat → fatter は からだの ことなので 表には あるが レッスンでは つかわない。
- **強勢は 3つ以上の まとまりの ことばだけ**（選択肢を 3つ 以上に するため）。日本語の カタカナと つよい ところが ちがう ことば（ba-NA-na・to-MA-to・po-TA-to・av-o-CA-do・chim-pan-ZEE）を 多めに えらんだ。まとまりの わけかたは focus に かくので、ワールド12 の「はくの かず」の 表示とも そろう。
- **-ful / -less と un- は いみを 見せて えらばせる**（colorless・fearful の ように ほんとうに ある ことばが まちがいに なっても、いみで 1つに きまる）。
- **新しい 話し手は 増やさない**: こだまの精の ことばは エマ先生と キコが「〜って いってる」と つたえる 形に した。
- **文法の さきどり**: L514 の Which is heavier, A or B? は L532 の ききなれ。L536 の Why don't we ～? は ワールド17 L507 の くりかえし。L537 の Thank you for ～ing. は 決まり文句として 入れた。
- **こころの くばり**: L534 の くらべる ぶんは「もの」を くらべる（台本に Compare things, not people. That's kind.、goalJa に「ともだちの からだは くらべない」）。L530 は「ペットが いなくても OK」、L538・L540 は「ほんとうの なまえは いわなくて OK」。L522 は「かめは はやくないけど あきらめない」で だれにも とくいな ことが あると 教える。どうぶつの じじつ（シロナガスクジラ・チーター・キリン・カンガルー・ペンギン）は ほんとうの ことだけ。
- 自分で 1 回 見なおして なおした ところ: テストの 期待値の うちまちがい（carelles → careles）、L524 の 単語の 絵文字（🩶 は ふるい 端末で 出ないので 🌫️ に）、台本が 125 語に 足りない 回（L516・518・523・526・527・534〜536・539）に 練習の やりとりを 1〜2 文 足した。

### 例（L527「Careful, Not Careless!」）
- 表現（core）: Be careful! Don't be careless. ／ Hold the rope with both hands. ／ Don't run on the bridge. Walk slowly.
- 会話（谷の つり橋）: Birimo「Wow, a rope bridge! Let's go!」 Ms. Emma「Be careful! Don't be careless. Hold the rope with both hands.」 Haru「Okay. ... Whoa, it's moving!」 Kiko「Don't run on the bridge, Haru. Walk slowly.」 Riko「Don't look down. Look at me. You can do it!」
- フォニックス: careful / careless / useful / useless（問題は「ふちゅういな」で careless / careful / careles）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 48 ファイル・1,303 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 198 kB（195 → +3）、/lesson/[lessonNo] 201 kB（199 → +2）、/gacha 186 kB（184 → +2）、/test/[assessmentId] 185 kB（183 → +2）、/parent 159 kB（158 → +1）（増えたのは ワールド18 の 問題の コード・表と 索引の 1 ワールドぶん。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 26` / `--pack 27`: No.26（L501〜520・61 ページ）・No.27（L521〜540・62 ページ）を 作れることを 確認

## WORLD — ワールド19「からくり工房」（L541〜570）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-19.json` を 新しく 作成（30 レッスン、ステージ2・A2、`school.grade` は「中2」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 570 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 127、会話の セリフ 210 行（1 回 7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 128 語の 英語（最少 125 語）＋短い 日本語の たすけ（1 文）。
- ブロック構成: 541〜545 どうぐと つかいかた（This machine makes toys.・It's used for cutting paper.・How do you use it? / Push this button. Then, turn it.・Like this? ― Yes, that's right! / Not quite.・どうぐ あてクイズ It's used for opening cans. ― A can opener!）→ 546〜550 てじゅん（First, fold the paper in half.・Next, cut along the line.・Finally, it works!・It didn't work. Let's remake it.・つくりかた はっぴょうかい First, cut. Next, fold. Then, glue. Finally, play!）→ 551〜555 あんぜんの きまり（You have to wear goggles.・You must not touch it. It's hot.・You don't have to hurry.・May I use this hammer? ― Sure. Here you are.・きまりポスター We must clean up. We have to share tools.）→ 556〜560 アドバイスと ゲームの ルール（You look tired. You should rest. / You shouldn't ～.・First, you have to roll the dice.・It's your turn. You can move three spaces.・That's not fair! Let's check the rules.・オリジナルゲームの 発表 In our game, you have to collect stars.）→ 561〜565 はつめい（The telephone helps people talk.・My machine can clean my room.・You can start it by pushing this button.・We can reuse these boxes.・はつめいフェア This is my invention. It's used for watering plants.）→ 566〜570 ふりかえり（Squeeze it. Turn it. Pull it.・It's broken. What should we do?・つくりかたカード How to make a paper cup: First, fold it in half.・さよなら かたづけ・はつめいショー We made a dream machine together!）。
- 物語の 糸: ワールド18 の さいごの「カチン、カタン」を たどって 工房に 着く。はつめいかは 旅に でていて「どうぐを つかって すてきな ものを つくってね」と メモだけ のこっている（L541）。L566 の からくり箱から 大きな きかいの せっけいずが でて、L567 で その「ドリームマシン」が こわれていると わかる。みんなの ゆめの アイデア（L562）を たして くみなおし、L569 で はつめいかに おれいの メモ、L570 の ショーで きかいが おまつりの おんがくと ちょうちんの 島の ちずを だして、ワールド20 まつりの島へ。
- フォニックスの 問題（`src/lib/curriculum/w19Phonics.ts`・`questions.ts` の `w19Question`。w18Question より 先に よぶ）:
  - re- "re-": 「『もう いちど』の いみの ことばは？」（make → ？（つくりなおす）→ remake / unmake / rimake）。
  - 道具の -er / -or "-er" "-or": 「おわりの つづりは？」（elevat＿＿（エレベーター）→ or / er / ar、cutt＿＿（カッター）→ er）。
  - だまっている もじ "wr" "kn" "mb" "gu" "-stle": 「＿ に はいる つづりは？」（＿ench（レンチ）→ wr / r / rr / wh、＿itar → gu / g / gw / gh、whi＿（ふえ）→ stle / sle / ssle / sel）。
  - qu・squ "qu" "squ": 「＿ に はいる つづりは？」（＿iz（クイズ）→ qu / kw / cu / q、li＿id → qu、＿are → squ / skw / scu / sq）。
  - ou・ough "ou" "ough": 「この ことばの ou（ough）は どの おと？」（touch → アウ / ア / ウー、enough → ウー / アフ / オウ / オー）。
- フォーカスの ボタン: re- は ワールド18 で 足した「はじめに つける」（re…）、-stle は「…stle」で そのまま 出る。`vowelTeams.ts` の 読み上げで re-・-or・-stle・gu・squ・ough と、アウ 以外の おとが ある 回の ou を その回の ことばで よむ（`w19Say`）。
- テスト: `tests/curriculum.test.ts` に ワールド19 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順と 種類・ou 3つ／ough 4つの おとを ぜんぶ あつかう・文法と 会話の 型・先生の台本の 英語の 割合・会話の 行数・L570 スピード TPR・あんぜん・発表で なまえを いわなくて OK）を 追加。`tests/phonics-w19.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **新しい phonics.rule**: "re" "er-or" "silent" "qu"（squ も ふくむ）"ou" "ough"（ふりかえりは "review"）。-er / -or は 546 そのまま er・547 e で おわる／重ねる・548 or（ate → ator）・549 er と or を まぜる、の じゅんに した。
- **まちがいの 選択肢**: re- は はんたいの un-（ワールド18 で ならった ばかりで まざりやすい）と おとの まま かいた ri-。道具の ことばは er / or / ar の 3つ（おとは どれも おなじなので つづりで おぼえる）。だまっている もじは ワールド14 と おなじ「だまっている もじを ぬいた もの・重ねた もの・にた つづり」。ou・ough は おとを えらぶ（つづりは おなじなので、おとの ちがいが 学ぶ ところ）。cough（オフ）は「オー」と まぎらわしいので 入れなかった。
- **ワールド14・ワールド1 の よみかたは かえない**: kn / wr / mb（ワールド14）と qu（ワールド1）の 読み上げは これまでどおり。w19Say は ワールド19 にしか ない フォーカスと、アウ 以外の おとが ある ou の 回だけ あつかう（ワールド8 の ou は "ow" の まま）。問題も W19_START（541）より 前では でない。
- **新しい 話し手は 増やさない**: 工房の「おやかた」は エマ先生が 役を する（L551・L554）。はつめいかは メモと せっけいずだけで 出る。
- **文法の さきどり・ふくしゅう**: L541 の makes は 3単現の ふくしゅう。L557 の If you land on ～, ... は ゲームの きまり文句として 1回だけ。L564 の can be ～ も 決まり文句。have to / must / should の ちがい（きまり／つよい きんし／アドバイス）と don't have to（しなくて いい）と must not（しては いけない）の ちがいは 台本で くらべて 教えた。
- **こころの くばり**: どうぐの 回（L542・L551）は「いえでは おとなに きいてから」、L552 は「あつい きかいに さわらない」、L547 は「はさみは ゆっくり」。L549 は「はつめいかは みんな しっぱいする」、L553 は「かんぺきで なくて いい」、L559 は ずるいと おもっても おだやかに いって、あやまられたら It's okay. It's just a game. と ゆるす。L550・L560・L562・L565・L570 の AI 会話は「ほんとうの なまえは いわなくて OK」。
- 自分で 1 回 見なおして なおした ところ: 台本が 125 語に 足りない 回（L541〜543・546〜550・552・553・555〜560・565・566・570）に 練習の 文を 1〜2 文 足した。ふるい 端末で 出ない 絵文字（🪽 🛞 🫳 😮‍💨 🟰 🫴）を 🛩️ 🚲 🔓 🌬️ 🍪 💪 に かえた。L558 の rule を "squ" から "qu" に そろえた（squ は qu の なかま）。

### 例（L552「You Must Not Touch It」）
- 表現（core）: You must not touch it. It's hot. ／ You must wait until it cools down. ／ You must not run in the workshop.
- 会話（あつい きかいの まえで）: Birimo「Ooh, what's this shiny box? Can I touch it?」 Ms. Emma「Stop! You must not touch it. It's hot.」 Kiko「Look at the sign. It says, danger, hot!」 Ms. Emma「You must wait until it cools down. About ten minutes.」 Riko「And we must not run in the workshop. Walk, Birimo!」
- フォニックス: thumb / climb / comb / plumber（問題は「thu＿（おやゆび）」で mb / m / mm / mp）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 49 ファイル・1,352 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 201 kB（198 → +3）、/lesson/[lessonNo] 204 kB（201 → +3）、/gacha 189 kB（186 → +3）、/test/[assessmentId] 188 kB（185 → +3）、/parent 159 kB（159 → ±0）（増えたのは ワールド19 の 問題の コード・表と 索引の 1 ワールドぶん。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 28`: No.28（L541〜560・61 ページ）を 作れることを 確認（No.29 は ワールド20 が できてから）

## WORLD — ワールド20「まつりの島」（L571〜600・ステージ2 の 総まとめ）（2026-11-25）

### やったこと
- `content/curriculum/worlds/world-20.json` を 新しく 作成（30 レッスン、ステージ2・A2、`school.grade` は「中2」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 600 レッスン。ステージ2 が そろった）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 125、会話の セリフ 210 行（1 回 7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 1 回 平均 約 127 語の 英語（最少 125 語）＋短い 日本語の たすけ（1 文）。
- ブロック構成: 571〜575 さそう・ことわる（There's a festival on the island!・Would you like to come to the festival? ― Yes, I'd love to!・I'd love to, but I have to help my mom. / That's okay. Maybe next time!・Shall we dance? ― Sure!・しょうたいじょう Please come to our festival on Saturday. It starts at five o'clock.）→ 576〜580 せかいの おまつり（People float lanterns on the river.・People throw colored powder and laugh.・We say thank you for the food.・There will be lights all over the town.・しょうかいショー In some countries, people float lanterns at the festival.）→ 581〜585 もてなす（Make yourself at home.・Would you like some tea? ― Yes, please. / No, thank you.・Thank you for having me.・When I was little, I was scared of drums.・We're going to cook together. It will be fun.）→ 586〜590 はっぴょうかいの じゅんび（If it rains, we will dance inside.・We have to make the costumes.・We're practicing every day.・Why don't we sing together?・おまつりの けいかく There will be food stands and a dance show.）→ 591〜595 ステージ2 の ふりかえり（3単現・進行形と 過去形・be going to と will・比較・have to / must not / should）→ 596〜600 しめくくり（おもいでの アルバム・5ぶんスピーチ・リハーサル Speak slowly. Look at the audience.・おまつり前夜・L600 グランドフェスティバル Thank you for coming to our festival!）。
- 物語の 糸: ワールド19 の ゆめの きかいが だした ちずの とおり、たいこの なる しまに つく（L571）。島には エマ先生の おばの いえが あり、おばの いえで もてなしを うける（L581〜583）。おばの ちちの トマおじいさんの「ちいさい ころ たいこが こわかった」話（L584）。しまの こどもたちに さそわれて はっぴょうかいに でる ことに なり（L587）、じゅんび・れんしゅう・リハーサルを へて、L599 の 前夜に ビリモが まくらの したで「てがみが とびまわる たかい とう」の ちずを みつける。L600 は 600 かい きねんの ステージで、さいごに「ことづての塔へ いこう！」（ワールド21 へ）。
- フォニックスの 問題（`src/lib/curriculum/w20Phonics.ts`・`questions.ts` の `w20Question`。w19Question より 先に よぶ）:
  - -ure "-ure": 「この ことばの ure は どの おと？」（treasure（たからもの）→ チャー / ジャー / ユア）。t の あと＝チャー、s の あと＝ジャー、p・c の あと＝ユア。
  - ear / eer "ear" "eer": 「イア」の ことばは「＿ に はいる つづりは？」（ch＿（おうえんする）→ eer / ear / ere / ier、n＿（ちかくに）→ ear）。bear・wear・learn・earth の ear は「この ことばの ear は どの おと？」（イア / エア / アー）。
  - あいまい母音 "a-bout" "ba-na-na" "lem-on" "fes-ti-val" …: 「よわい『ア』の ところに はいる もじは？」（＿bout（〜に ついて）→ a / u / e / o、lem＿n → o、sev＿n → e）。
  - ステージ2 の つづりの まとめ（586〜595）は 新しい 問題を 作らず、まえの ワールドの 問題を そのまま つかう: tch・dge（w13）、-tion（w17）、kn・wr・mb（w19 の 表 → なければ w14）、-ed（w16）、-ing（w15）。
- フォーカスの ボタン: -ure は「…ure」、あいまい母音は「a・bout」（はくで よもう）で そのまま 出る。`vowelTeams.ts` の 読み上げで -ure と eer を その回の ことばで よむ（`w20Say`）。ear は ワールド9 の「イア」の よみかたの まま。
- テスト: `tests/curriculum.test.ts` に ワールド20 の 決まりごと（範囲・ステージ・タイトル・フォニックスの 順と 種類・-ure 3つ／ear 3つの おとを ぜんぶ あつかう・ステージ2 の つづりの まとめの focus・文法と 会話の 型・There will be は L579 から／Why don't we は L589 から・先生の台本の 英語の 割合・会話の 行数・L600 スピード TPR・こころの くばり・発表で なまえを いわなくて OK・L599 の ちずと L600 の 600 かい きねん）を 追加。`tests/phonics-w20.test.ts`（11 テスト）を 追加。

### 決めたこと（理由）
- **新しい phonics.rule**: "ure" "ear-eer" "schwa" "stage2-spelling"（ふりかえりは "review"）。-ure は 571 チャー → 572 ジャー（＋nature と くらべる）→ 573 ユア（＋furniture と くらべる）→ 574 3つ まぜる の じゅん。ear / eer は 576 ear（イア）→ 577 eer → 578 dear / deer の くらべ → 579 イア では ない ear（エア・アー）。
- **-ure は おとを えらぶ 問題**: -ture の つづりは ワールド17 で 問うたので、ここでは「ure の まえの もじで おとが かわる」ことを 学ぶ。sure（シュア）・figure は きまりから はずれるので 入れなかった。secure は アメリカ英語の「キュア」で ユア の なかま。
- **ear / eer は 2しゅるいの 問題**: 「イア」は ear と eer の どちらも あるので つづりを えらぶ（おなじ おとで いみが ちがう dear / deer が いちばん わかりやすい れい）。bear・learn は つづりが 1つしか ないので おとを えらぶ。まちがいの 選択肢 ere / ier は here・pier の つづり（ワールド17 で here を ならった）。
- **あいまい母音は「どの もじ？」を 問う**: 計画書の「a-BOUT, ba-NA-na の a」に くわえて、lemon の o・seven の e も 入れた。よわい「ア」は どの 母音でも おきるので、つづりで おぼえる ことが 学ぶ ところ。まちがいの 選択肢には「ア」に きこえる u を かならず 入れた（about → a / u / e / o）。focus を ワールド18 と おなじ はくの まとまり（a-bout）に して、ことばと 1つずつ 対応させた（ワールド18 の 強勢の 問題には ならない）。
- **ステージ2 の つづりの まとめは 新しい コードなし**: まえの ワールドの 問題は レッスン番号の 下限しか みないので、focus に tch / dge / -tion / kn / wr / mb / -ed / -ing を かけば そのまま 出る。テストで L586〜600 の ことばが ぜんぶ 選択肢つきの 問題に なる ことを たしかめた。
- **新しい 話し手は 増やさない**: しまの おばの かぞく・トマおじいさん・しまの こどもたちは エマ先生の はなしの なかと チラシ・しょうたいじょうで 出る。もてなしの 回（L581〜583）は エマ先生が おばの かわりに いう（「おばが『くつろいでね』って」）。
- **文法の じゅんばん**: There will be は 計画どおり L579 から（それまでの 表現・セリフに 出さない）、Why don't we は L589 から（テストで たしかめる）。when・if は 計画どおり「入門」として When I was little, ～.（L584）と If it rains, we will ～.（L586）の かたちだけ。Would you like to ～?（さそう）と Would you like some ～?（すすめる）の ちがいは L582 の 台本で くらべて 教えた。
- **世界の おまつり**: じっさいの くにの なまえは まちがいの ない ところだけ（インドの はるの いろの おまつり、日本などの かわに ランタンを ながす おまつり、日本の あきの おこめの しゅうかくさい）。ふゆの ひかりの おまつりは「さむい くにの まち」と ぼかした。宗教の ことばは 出さない。
- **こころの くばり**: L573 は「ことわっても いい・ことわられても It's okay.」、L576 は「ろうそくの ひは おとなが つける・みずべに ちかづかない」、L577 は「こなが め と くちに はいらないように」、L585 は「ほうちょう・コンロは おとなに きいてから」、L587 は「はさみは ゆっくり」、L595 は「まいごに なったら その ばで まって スタッフに きく」、L598 は「きんちょうしても だいじょうぶ」、L575 は「ネットに じゅうしょを かかない」。L575・580・590・591・596・597・600 の AI 会話は「ほんとうの なまえは いわなくて OK」（L597 は ニックネームで いい）。
- 自分で 1 回 見なおして なおした ところ: 台本が 125 語に 足りない 回（L571・574〜577・580〜583・586〜600 の 多く）に 練習の 文を 1〜3 文 足した。ふるい 端末で 出ない かもしれない 絵文字（🧑‍🌾 🧑‍🤝‍🧑）を 🚜 👭 に かえた。L596 の「It's the old ruins.」を「It's from the old ruins.」に なおした（しゃしんの せつめいとして しぜんに）。

### 例（L573「I'd Love To, But…」）
- 表現（core）: I'd love to, but I have to help my mom. ／ Sorry, I can't. I'm busy today. ／ That's okay. Maybe next time!
- 会話（やさしく ことわる れんしゅう）: Haru「Riko, would you like to go fishing this afternoon?」 Riko「I'd love to, but I have to help my mom. Sorry!」 Haru「That's okay. Maybe next time!」 Birimo「Kiko, would you like to eat ten bananas with me?」 Kiko「Ha ha! I'd love to, but I'm full. Maybe next time!」
- フォニックス: pure / cure / secure / furniture（問題は「この ことばの ure は どの おと？」で secure → ユア、furniture → チャー）

### 確認
- `npm run curriculum:check`: 索引は 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 50 ファイル・1,401 テスト すべて成功
- `npx next build`: 成功。First Load JS は /map 202 kB（201 → +1）、/lesson/[lessonNo] 205 kB（204 → +1）、/gacha 190 kB（189 → +1）、/test/[assessmentId] 189 kB（188 → +1）、/parent 159 kB（159 → ±0）（増えたのは ワールド20 の 問題の コード・表と 索引の 1 ワールドぶん。ステージ2 の まとめは まえの ワールドの 問題を つかうので 増えかたが ちいさい。レッスン本文は あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 29` / `--pack 30`: No.29（L561〜580・61 ページ）・No.30（L581〜600・62 ページ）を 作れることを 確認

## P-library: えいごの としょかん（はじめの セット）

### やったこと
- 新しい エリア「えいごの としょかん」（`/library`）を 追加。ぼうけんマップに 入口の カード（📚 えいごの としょかん・1日1かい 🪙+5）。
  - 📖 **段階別の おはなし 40 話**（すべて オリジナル）。ステージ1（Pre-A1 → A1）20 話・ステージ2（A1+ → A2）20 話。各話に あたらしい ことば 2〜3 語と 内容の 質問 3 問（英語の しつもん＋日本語・3 択）。
    ステージ1 は あいさつ・いろ・かず・からだ → 場所の前置詞・曜日・時刻 → can・道案内・過去形・ゆめ、ステージ2 は ワールド13〜20 の 文法（3単現・some/any・ねだん・進行形・前置詞・過去形の 物語・日記・be going to・will・比較・てじゅん・have to / must・さそう・if / when）に そって ならべた。後ろの 話ほど 長い（テストで 確認）。
  - 🔊 **読み聞かせと ハイライト**: speechSynthesis で 1 行ずつ 読み上げ、いま 読んでいる ことばを 黄色で ハイライト（boundary イベント。こない ブラウザ・声が ない 環境では ことばの 長さから 時間を 見つもって うごかす）。文を タップ → その 文、ことばを タップ → その ことばを ゆっくり。🐢 ゆっくり / 🐇 ふつう、日本語訳の 表示切りかえ（ステージ1 は 最初から 表示、ステージ2 は かくす）。
  - 🎵 **うた・チャンツ 16 曲**（オリジナル。あいさつ・いろ・かず・からだ・短母音・マジック e・曜日・時刻・月・過去形・3単現・進行形・Did you・比較・have to）。「🎵 きく」と「🗣️ まねっこ」（1 行 きいたら「きみの ばん！」の 間）。
  - 💬 **AI フリートーク 11 テーマ**（すきな たべもの・どうぶつ・てんき・1日・できること・ゆめの りょこう・しょうらいの ゆめ・しゅうまつ・よてい・くらべる・なんでも トーク）。レッスンの かいわ画面（`ConversationStep`）を つかいまわし、`/api/library/talk` が AI（free モード）で 返事。
- **解放**: 到達レッスン（クリアした いちばん先の レッスン）>= unlockLesson で ひらく。はじめての子でも おはなし 1 話・チャンツ 1 曲が ひらいている。フリートークは Lesson 90 クリア（ステージ1 の ワールド4）から。ひらいていない ものは 🔒「L○○ で ひらく」。サーバーでも 判定（ひらいていない フリートークは 403 で AI を よばない・ごほうびも 403）。
- **1日1回の 小さな ごほうび**: おはなしの クイズで 2 問 以上 正解・チャンツを さいごまで・フリートークを 3 回 以上 → きょうの スタンプ（🌟）＋ つながっていれば 🪙+5（`COIN_RULES.libraryDaily`、`CoinReason.LIBRARY_DAILY`、idempotencyKey `<userId>:library:<日付>`）。採点は サーバーで やりなおす（ブラウザの「正解数」は 信じない）。スタンプカードに さいきん 7 日・こんげつの 数・れんぞく日数。
- **オフライン（おためしモード）**: サーバー・DB に つながらなくても ぜんぶ 動く。解放は この ブラウザで クリアした レッスン（localStorage）、きろくと スタンプは localStorage（`eigo-quest:library:v1`）。コインは つながっている ときだけ。フリートークは DB で 解放を 確かめられない ときは AI を つかわず 台本の 返事。
- データと しくみ: `content/library/stories-1.json`・`stories-2.json`・`chants.json`・`talk.json` と 小さな 索引 `index.json`（本文なし・約 15 KB）。`npm run library:index`（作りなおし）・`npm run library:check`（ずれと データの まちがいを 確認）。本文は ひらいた ときに ステージごとの 別チャンクを 読む。
- 新しい ファイル: `src/lib/library/`（types・catalog・rules・words・buildIndex・localLibrary・client・talk）、`src/lib/services/libraryService.ts`、API 3 本（`GET /api/library`・`POST /api/library/reward`・`POST /api/library/talk`）、画面 4 枚（`/library`・`/library/story/[id]`・`/library/chant/[id]`・`/library/talk/[id]`）、`src/components/library/`（ReadAlong・StoryQuiz・StampCard）、マイグレーション `20261202090000_library_daily`、`scripts/library-check.ts`（画面の 通し確認）。
- テスト: `tests/library.test.ts`（40 テスト: データの チェック・正解の 位置の かたより・索引の ずれ・解放・採点・ごほうび・サービス（FakeDb）・API・フリートークの プロンプト）、`tests/library-offline.test.ts`（7 テスト: localStorage の きろくと スタンプ・おためしモードの 解放・サーバーに 送らない）。`tests/helpers/fakePrisma.ts` の findFirst に orderBy を 足した。

### 決めたこと（理由）
- **ごほうびは としょかん ぜんぶで 1日1回**（おはなし・チャンツ・フリートークの どれでも）。たくさん 読んでも コインは ふえない（コイン目当ての 早読みを ふせぐ。読む こと そのものを たのしむ）。きまりは 5 コイン（きょうのまとめ・かいわと おなじ）。
- **おはなしの 合格は 3 問中 2 問**（ちいさな 子でも とどく。1 問 だけ なら「もういちど よんでみよう」）。
- **オフラインの ごほうびは スタンプ**: これまでの おためしモードは コインを きろくしない ルールなので、この 端末に のこる スタンプを「1日1回の 小さな ごほうび」に した。つながっていれば スタンプ＋コイン。
- **よんだ きろくは この 端末（localStorage）**: DB の 新しい テーブルは まだ 作らない（コイン台帳に refType `library-story` 等と id は のこる）。保護者ページの「今月 読んだ 数」は 計画書どおり あとの フェーズで（そのとき DB の きろくを 足す）。
- **フリートークは レッスンの かいわの しくみを つかいまわす**: テーマを LessonConversation の 形に かえるだけで、AI の 安全ルール・個人情報を ふせぐ 処理・台本エンジンの フォールバックを そのまま つかえる。free モードの プロンプトは「話題を 子どもに あわせる・ついかの しつもんを 1 つ・個人情報を きかない」と ステージ別の ことばの めやす（ステージ1: 14 語まで、ステージ2: 25 語まで・過去形や will も OK）。台本の 上限に あわせて 6 回まで。
- **解放の 間かく**: ステージ1 は L0〜325 に 20 話（はじめは 5 レッスンごと、あとは 20〜35 レッスンごと）、ステージ2 は L360〜586 に 約 12 レッスンごと（その 文法を ならう ワールドの あとで ひらく）。s2-05 の 解放を L404 → L405 に した（画面スモークの「404」検出に ひっかかるため）。
- **バンドル**: 読み上げの ことばの 位置の 関数は `words.ts` に わけた（tts.ts が rules.ts ぜんぶを レッスン画面に ひきこんで +4 kB に なったので）。
- ついでに なおした: レッスンの かいわ画面で AI の ふきだしの 文字が 白地に うすい 色で 読みにくかった（もとからの 問題）→ こい 色に。入力欄の 文字・プレースホルダーも。

### 確認
- `npm run library:check`: 索引は 最新（おはなし 40・チャンツ 16・テーマ 11、データの まちがい なし）／`npm run curriculum:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 52 ファイル・1,449 テスト すべて成功
- `npx next build`: 成功。First Load JS（前 → 後）: /map 202 → 202 kB、/lesson/[lessonNo] 205 → 207 kB（+2: 読み上げの ハイライトと かいわ画面の 切りかえ）、/gacha 190 → 191 kB、/test/[assessmentId] 189 → 190 kB、/parent 159 → 159 kB、共有 101 → 102 kB。新しい 画面: /library 168 kB、/library/story/[id] 149 kB、/library/chant/[id] 142 kB、/library/talk/[id] 153 kB。おはなしの 本文は ステージごとの 別チャンク（ひらいた ときだけ 読む）。
- `npx tsx scripts/library-check.ts`（DB 停止・next start）: 一覧・ハイライト・クイズ 3/3 → スタンプ・一覧に「✅ もらったよ」と ⭐⭐⭐・チャンツ さいごまで・2 回目は スタンプなし・🔒 の 案内・Lesson 90 の きろくで フリートーク 3 回、すべて OK（スクリーンショット: docs/run7/screens/library/）。`scripts/smoke.ts` にも としょかんの 4 画面を 追加。

## P-yearly: 年に1回の 力だめし

### やったこと
- **問題（すべて オリジナル）**: `content/yearly/stage-1.json`〜`stage-5.json`（ステージごとに 1 つ・受ける ステージの JSON だけ あとから 読む）。数は docs/curriculum-6year.md §8 の とおり。
  - ステージ1（15 分・Pre-A1→A1）: 聞く 10（絵を えらぶ 6・つづきを えらぶ 4）・読む 10・話す 3（じこしょうかい＋しつもん 2）・書く（絵を みて ことば 3 つ）
  - ステージ2（20 分・A1→A2）: 聞く 15（絵・つづき・会話の しつもん）・読む 15（お祭りの おしらせ・日記）・話す 4（絵の 説明＋しつもん 3）・書く（3 文）
  - ステージ3（25 分・A2→A2+）: 聞く 20・読む 15（メール・物語）・話す 4（音読＋絵＋じぶんの こと）・書く（メールの 返事 5 文）
  - ステージ4（30 分・A2+→B1）: 聞く 20・読む 15（ミツバチの 説明文・写真部の おしらせ）・話す 4（音読＋絵＋意見＋追加の しつもん）・書く（意見文 50〜70 語）
  - ステージ5（35 分・B1→B1+）: 聞く 25・読む 15（記事・コンテストの ポスター・物語）・話す 5（音読＋絵＋意見＋例＋反対の 意見）・書く（意見文 80〜110 語）
- **画面 `/yearly`**: はじめに → 👂 聞く（▶ は 2 回まで。会話は A/B で 声の 高さを かえる。ステージ1〜2 の「つづき」は 選択肢も 読む）→ 📖 読む → 🗣️ 話す（AI の しけんかんの キャラが 読み上げ → マイク、つかえない ときは 入力）→ ✏️ 書く → 採点 → 結果（子ども向けの ⭐ と「おうちの方へ」の 結果・ふりかえりと おてほん）。受けられない ときは つぎの 日と さいしんの 結果。マップに 入口を 追加。
- **保護者ページ**: 子どもの カードに「🏆 力だめし：A2（78点）前回から +40」→ ひらくと 技能ごとの 点数（聞く・読む・話す・書く）・推定 CEFR バンド・英検の めやす・できる ことの めやす・前回からの のび・つぎに 受けられる 日（`YearlyResultCard` を 結果画面と 共有）。
- **採点**（`src/lib/yearly/scoring.ts`・純粋関数で サーバーと ブラウザ 共通）: 聞く・読むは 正解率。話すは 1 問 0〜4 点（長さ・キーワード・文の かたち。意見は because などの 理由が いる。音読は お手本との 一致率）。書くは 内容・長さ・まとまり・書きかた 各 0〜2 点（8 点満点）、ステージ1 は つづり 1 つ 1 点。`ANTHROPIC_API_KEY` が あれば 話す・書くを サーバーで AI が ルーブリック採点（`aiScoring.ts`、aiGrader と 同じ 形・effort low・`YEARLY_MODEL` で かえられる）。エラー・拒否・未設定は ルール採点。子どもの ことばは 個人情報を ふせいで `<answer>` に 入れて 送る。
- **DB**: `YearlyTestResult`（マイグレーション `20261203090000_yearly_test`、`@@unique([userId, takenOn])`）。子どもの 削除・おためしの そうじ（deleteUsersData）でも 消す。こたえは 個人情報を ふせいで 保存。
- **API**: `GET /api/yearly`（ステージ・受けられるか・これまでの 結果。DB なしは offline）、`POST /api/yearly/submit`（サーバーで 受けられるかを 確かめて 採点しなおし・保存・のびを かえす。もう 受けた → 409。DB なし → ルール採点だけ して saved:false）。保護者の `GET /api/parent/overview` に `yearly` を 追加。
- **おためしモード**: サーバーに つながらなくても 受けられる（この ブラウザで ルール採点 → `eigo-quest:yearly:v1` に のこす・1 回だけ）。
- データの チェック `npm run yearly:check`（`scripts/yearly-check.ts`）、画面の 通し確認 `scripts/yearly-flow-check.ts`、`scripts/smoke.ts` に /yearly。
- テスト: `tests/yearly.test.ts`（51: データ・採点・CEFR バンドの 表と さかいめ・単調性・スピーキングの 条件・ちから スコアと のび・ステージの きめかた・1 年に 1 回・おためし 1 回・AI 採点の まぜかたと 個人情報・サービス（FakeDb）・保護者ページ・削除・API）、`tests/yearly-offline.test.ts`（7）。`tests/helpers/fakePrisma.ts` に 複合ユニーク（"a+b"）を 足した。

### 決めたこと（理由）
- **ステージの きめかた**: そのステージに 入って 60 レッスン（2 ワールド）すすんだら その ステージの 問題（L420〜 ステージ2、L660〜 3、L900〜 4、L1110〜 5）。週5 の 子の 年度末（L200/400/600/800/1000/1200）が §5-1 の 表（1・1・2・3・4・5）と ぴったり あう。レッスン数の 下限は つけない（おためしの 保護者が すぐ 見られるように）。
- **1 年に 1 回**: 前回の 日の 1 年後の 同じ日から（2/29 → 3/1）。年度で 区切ると 3/31 と 4/1 に つづけて 受けられて しまうため。保護者ページに「年度末が おすすめ」と 書いた。**おためしは 1 回だけ**（保護者が いない 学習者・オフライン）。会員に なった あとの 子どもには おためしの 結果は 引きつがない（子ども本人の 1 回目を あらためて 受けられる）。
- **合計の 重み**: 聞く 25%・読む 25%・**話す 30%**・書く 20%（会話の 力が 約束の 中心なので 話すを いちばん 重く）。
- **CEFR バンドの 表**（合計点 → バンド）: S1 A1+≥90 / A1≥65 / Pre-A1、S2 A2≥85 / A1+≥60 / A1≥35 / Pre-A1、S3 A2+≥85 / A2≥60 / A1+≥35 / A1、S4 B1≥85 / A2+≥60 / A2≥35 / A1+、S5 B2≥92 / B1+≥75 / B1≥55 / A2+≥30 / A2。いちばん上（先どり）は 話す 60 点 以上が 条件、話すが 25 点 未満なら 1 段 さげる。ステージ5 の ねらいどおり（55 点）で B1＝約束の「小6 で A2〜B1」。
- **のびの くらべかた**: ステージが かわると 点数は くらべられないので「ちから スコア」＝(ステージ−1)×150＋点数×2 を 技能ごとに 出して 差を 見せる（ステージ1 の 満点 200 ＝ ステージ2 の 25 点。となりの ステージと 50 点ぶん かさなる）。
- **ステージ1 にも 書く を 入れた**（§8 の 表には ない）: 4 技能 そろえて 保護者に 見せるため、フォニックスで 書ける 3 文字の ことば 3 つだけ。
- **英検の 級は「めやす（参考）」として だけ 表示**し、「検定の 合格を 保証するものでは ない」と そえた（stages.ts の eikenJa と 同じ あつかい）。問題は 英検の 形式に にせた オリジナルで、過去問・教科書は つかっていない。
- **テスト中は ⭕❌ を 出さない**（さいごに まとめて）。とちゅうで やめても 回数は へらない（「おわり」で はじめて きろく）。もどる ボタンで 前の 問題を なおせる。
- **話すの 入力**: マイクが ない ブラウザでも 受けられるよう 入力も みとめた（きこえた ことばも なおせる）。
- 問題の 文は サブエージェントに ステージごとに 書いて もらい、チェック（数・形式・正解の 位置の かたより 15〜50%・日本語の まじり・個人情報）に 通るまで なおした。ステージ4 と 5 の 音読が どちらも「わたり鳥」だったので、ステージ5 を「むかしの 船乗りの 星の よみかた」に かえた。
- バンドの 表示用データは `labels.ts` に わけた（保護者ページに 採点の しくみを ひきこむと +8 kB だったため → +3 kB）。

### 確認
- `npm run yearly:check`: 5 ステージ すべて OK／`npm run curriculum:check`・`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 54 ファイル・1,509 テスト すべて成功
- `npx next build`: 成功。First Load JS（前 → 後）: /parent 159 → 162 kB（+3: 力だめしの 結果カード）、/map 202 → 203 kB、/lesson/[lessonNo] 207 → 208 kB、/library 168 → 169 kB（共有の contracts に 力だめしの 形を 足した ぶん）、共有 102 → 102 kB。新しい 画面: /yearly 157 kB（問題は ステージごとの 別チャンクで 受ける ステージだけ 読む）。
- `npx tsx scripts/yearly-flow-check.ts`（DB 停止・next start）: L10 → ステージ1・▶ きくで のこり 1 かい・聞く 10/10・読む 10/10・話す・書く → 結果（推定 A1+・保護者向けの 点数）・2 回目は「おためしでは 1 かいだけ」＋ さいしんの 結果・L700 → ステージ3 の 文章、すべて OK（スクリーンショット: docs/run7/screens/yearly/）。
- 保護者ページの 表示は DB が いるので 画面では 確かめていない（サービスと overview の テストで 確認）。AI 採点は キーなしの 環境なので 本番の 呼び出しは 未確認（まぜかた・フォールバックは テストで 確認）。

## WORLD — ワールド21「ことづての塔」（L601〜630・ステージ3 の はじまり・A2）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-21.json` を 新しく 作成（30 レッスン、ステージ3・A2、`school.grade` は「中2」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 630 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 112、会話の セリフ 197 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は **英語だけ**（1 回 平均 約 176 語・最少 161 語）で、まいかい「読みもの」（ドアの はりがみ・でんごんメモ・チャット・日記・メール・ポスター・てがみ など 40〜80 語）を いっしょに 読む。日本語の ヒントは 3 回だけ（L601「これからは えいごだけ。だいじょうぶ！」・L603 hold on・L607 mute）。
- ブロック構成: 601〜605 でんわ（Messages fly from this tower every day.・Hello, this is Haru. May I speak to Riko?・Hold on, please. I'll get her. / Who's calling, please?・I'm sorry. I think you have the wrong number.・Hi, it's Kiko. Are you free on Saturday?）→ 606〜610 ビデオ通話（Can you hear me? ― Yes, loud and clear.・You're on mute. Click the microphone.・The screen froze. Can you say that again? / You're breaking up. / Let me call you back.・Let me show you my room. / On the left, there's ～.・What time is it there?）→ 611〜615 でんごん（She's out right now. Can I take a message?・Could you tell her to call me back?・He said he was busy. / She said she would ～.・Riko says the bus leaves at nine.・Here's a message for you.）→ 616〜620 過去進行形（What were you doing at seven?・I was taking a bath when you called.・While we were sleeping, it snowed.・When the phone rang, I was cooking.・Birimo was reading. Kiko was painting.）→ 621〜625 メール（Dear Ms. Emma, How are you?・Thanks for your email. I was happy to hear from you.・See you soon. Best wishes, Riko・Don't share your address online.・I'm writing to tell you about my trip. ＋ First / Then / Also）→ 626〜630 まとめ（This emoji means "I'm excited."・I think email is better for long messages.・I'm writing this letter from the top of the tower.・とうの さよなら けんがく・L630 タワーラジオ Thank you for calling. Talk to you soon!）。
- 物語の 糸: ワールド20 の ちずの とおり ことづての塔に つく（L601）。エマ先生は L606〜610 しまの おばの ところへ もどっていて、塔から ビデオ通話（L611 で もどる）。L616 で 塔の おやつの パイが きえ、みんなの アリバイ（ハルは おふろ・リコは てがみ・キコは え・ビリモは マンガ）→ はね・ゆきの あしあと（L618）・かいだんの パンくず → L620 で とりの リーダー キャプテン・ピップの はらぺこの ひなたちだったと わかり、パイを みんなで やきなおす（L619 の でんわは ピップからの「あやまりたい」だった）。L621〜622 エマ先生は 塔の 地下で ふるい「こはくの としょかん」の ほんを みつけ、L630 の ラジオの さいごに「とうの したの こはくの図書館へ」（ワールド22 へ）。
- フォニックス（形態素の はじまり。`src/lib/curriculum/w21Phonics.ts`・`questions.ts` の `w21Question`。w20Question より 先に よぶ）:
  - dis- "dis-": 「はんたいの いみの ことばは？」（appear（あらわれる）→ ？（きえる）→ disappear / unappear / inappear）
  - mis- / pre- "mis-" "pre-": 「＿ に はいる パーツは？」（＿spell（つづりを まちがえる）→ mis / pre / dis）
  - ことばの パーツ "tele-" "phone" "graph" "photo-": 「この ことばの tele は どんな いみ？」（telephone（でんわ）→ とおく / かく・えがく / ひかり / じぶんで）
  - -ment / -ness: 「ただしい ことばは どれ？」（move（うごく）→ ？（うごき）→ movement / moveness / movment、happy → happiness / happiment / happyness）
  - 音の つながり（focus は フレーズ そのもの "hold on" "can I" "check it out" …）: 「つなげて いうと どう きこえる？」（hold on → ホウルドン / ホウルド・オン / ほかの フレーズ）
- `vowelTeams.ts` の 読み上げで dis-・mis-・pre-・パーツ・-ment・-ness は その回の ことばを、フレーズは そのまま よむ（`w21Say`）。フォーカスの ボタンは これまでの きまりで「dis…」「…ment」「hold on」と 出る。
- テスト: `tests/curriculum.test.ts` に ワールド21 の 決まりごと（範囲・ステージ3・タイトル・フォニックスの 順と 種類・表の カバー・文法と 会話の 型・過去進行形は L616 から／while は L618 から・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行・L630 スピード TPR・あんぜん・物語）を 追加。`tests/phonics-w21.test.ts`（14 テスト）を 追加。`tests/night2-decisions.test.ts` の「ボタンが ことば（英字だけ）を 読む」に フレーズ（スペースで くぎった 英字）を みとめる 1 行を 足した。

### 決めたこと（理由）
- **ステージ3 の 先生の台本は 英語だけ**: ステージ2（1 文の 日本語の たすけ）から きりかえ。いきなり だと こわいので L601 の さいしょに「これからは えいごだけ。だいじょうぶ！」と 1 回だけ 日本語で つたえ、「Listen carefully, look at the pictures, and guess.」と きく コツを 英語で おしえた。日本語の ヒントは ことばの いみを 1 語 そえる 2 回（hold on・mute）だけ。テストで 日本語の 割合 3% 未満・ヒントの ある 回が 601・603・607 だけ で ある ことを まもる。
- **まいかい 読みものを 入れる**: 計画書の「毎回 80〜150 語の 短い 文章」に あわせ、台本の なかに 40〜80 語の 読みもの（はりがみ・メモ・日記・メール・ポスター）を 入れ、台本ぜんたいで 160〜190 語。ワークシートの 読みものは この 台本から そのまま つかえる。
- **新しい phonics.rule**: "dis" "mis-pre" "word-parts" "ment-ness" "linking"（ふりかえりは "review"）。L604 は dis- と un-（ワールド18）を くらべる 回に して、un の ことばは ワールド18 の 問題を そのまま つかう。
- **まちがいの 選択肢に ほんとうに ある ことばを 出さない**: dis- は ことばごとに 選択肢を きめた（dislike に unlike は 出さない）。mis- / pre- は パーツを かえると ある ことば（review・repay・replace・displace など）を のぞく。discover・mistrust の ような いみが ずれる・同じ いみの ことばが ある ものは 表に 入れなかった。
- **パーツの 問題では もう 1つの パーツの いみを 出さない**: telephone の tele を きく とき「おと・こえ」も 正しく 見えて しまうため。xylo（き）・micro（ちいさい）・auto（じぶんで）は 台本と せつめいで ふれるだけ。
- **-ment / -ness の まちがい**: もう 1つの おわり（kindment）と、子どもが じっさいに まちがえる つづり（movment・agrement・enjoiment・happyness・kindnes）を 1つずつ。「うごきの ことば ＋ ment」「ようすの ことば ＋ ness」の めやすで おしえる。
- **音の つながりは フレーズを そのまま phonics.words に**: これまでは 1 語だけ だったが、つながりは 2 語 以上で ないと おしえられないため。カタカナは めやす（つなげた いいかた と 1 つずつの いいかた を くらべる）。アメリカ英語の t の 音の へんか（チェケラ）は ステージ4 の「聞いて わかる」に のこし、ここでは まっすぐ つなげた 形（チェキタウト）に した。come・take・leave の よまない e は その まえの しいんで つながると せつめい。
- **過去進行形の じゅんばん**: was / were ＋ ～ing は L616 から、while の 文は L618 から（それまでの 表現・セリフ・台本に 出さない ことを テストで たしかめる）。伝言の 文（He said he was busy.）は L613 で「said の あとは すぎた かたち（is → was、will → would）」だけ。L614 で says（いま つたえる）と said を くらべた。
- **あんぜん**: L604 でんわで しらない ひとに なまえ・じゅうしょを いわない、L609 ビデオ通話で じゅうしょの わかる ものや かぞくの しゃしんを うつさない、L619 りょうりは おとなと、L624 ネットの きまり（じゅうしょ・パスワード・ひとりで あわない・へんな リンク・へんだと おもったら おとなに。はなしても おこられない）、L625 ペンパルは ニックネームで じゅうしょ・がっこうを かかない。AI 会話の しょうかい・でんわ・メール・てがみ・ラジオの 回は「なまえ（・じゅうしょ）は いわなくて OK」。
- **新しい 話し手は 増やさない**: キャプテン・ピップ・とりの かしゅ・ペンパルの レオは 台本と セリフの なかだけ。L610 の とおい くにの ともだち（ボボ）は ビリモが 演じる。
- 自分で 1 回 見なおして なおした ところ: 台本が 160 語に 足りない 回（L603・L626）に 1 文 足した。L616 と L620 で アリバイが くいちがっていた（ハルが「よんでいた」）ので ハルは おふろ（L617 の でんわと つながる）に そろえた。ふるい 端末で 出ない かもしれない 絵文字（🪹・ZWJ の 🙇‍♂️ 🙋‍♀️）を かえた。つながる おとの せつめいが come in を「e で おわる」と いって いたのを「m の おと」に なおした。
- 気づいた こと（このフェーズでは かえていない）: レッスンの AI 会話の プロンプト（`buildSystemPrompt`）は ステージに かかわらず「12 語まで の やさしい 文」の まま。ステージ3 の「4〜5 往復・AI が 1 回は 追加の しつもん」に あわせるには フリートークの `levelGuide` の ように ステージを わたす 必要が ある（あとの フェーズで）。

### 例（L617「I Was Taking a Bath」）
- 表現（core）: I was taking a bath when you called. ／ Why didn't you answer the phone? ／ Sorry I missed your call.
- 読みもの（台本より）: "Hi, Ms. Emma. Sorry I missed your call last night. I was taking a bath when you called. I saw your message after my bath, but it was late. Is it about the missing pie? I didn't eat it! Haru"
- 会話: Ms. Emma「Haru, I called you at seven last night. Why didn't you answer the phone?」 Haru「Sorry I missed your call. I was taking a bath when you called.」 Riko「So Haru didn't eat the pie!」 Birimo「I was reading a comic book when you called. I didn't hear the phone!」
- フォニックス: excitement / enjoyment / announcement / improvement（問題は「ただしい ことばは どれ？」excite → excitement / exciteness / excitment）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 55 ファイル・1,561 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 203 → 206 kB、/lesson/[lessonNo] 208 → 211 kB、/gacha 191 → 194 kB、/test/[assessmentId] 190 → 194 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド21 の 問題の コードと 表（せつめいの 文・カタカナの 表）と 索引の 1 ワールドぶん。ワールド20 の +1 kB より 多いのは 5 しゅるいの 新しい 問題を 作ったため。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 31`: No.31（L601〜620・62 ページ）を 作れることを 確認（No.32 は ワールド22 が できてから）

## WORLD — ワールド22「こはくの図書館」（L631〜660・ステージ3・A2）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-22.json` を 新しく 作成（30 レッスン、ステージ3・A2、`school.grade` は「中3」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 660 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 116、会話の セリフ 204 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 174 語・最少 161 語・最大 200 語）で、まいかい「読みもの」（はりがみ・うらびょうし・ポスター・ほんの 1 ページ・カード・きもちの ちず・げきの 台本・てがみ など 40〜90 語）を いっしょに 読む。日本語の ヒントは 2 回だけ（L636「しゅじんこう」・L638「わるもの」）。
- ブロック構成: 631〜635 ほんの しょうかい（This library has a million books.・What's it about? ― It's about a brave cat.・Who wrote this book? ― A famous writer did.・You should read it. It's really funny.・This book is about ～. I like it because ～.）→ 636〜640 とうじょうじんぶつ（The main character is a shy dragon.・She's brave and kind. / What's ～ like?・The villain wanted the magic stone. / tried to・I like the fox because he's clever.・This is Mira. She's a famous inventor.）→ 641〜645 あらすじ（At the beginning, ～.・In the middle, ～. / One day / Suddenly・At the end, ～. / Finally・What happened next? / Can you tell me more? / And then?・First, ～. Then, ～. At the end, ～. を 30 びょうで）→ 646〜650 きもちと りゆう（She was sad because ～. / I think she felt ～ because ～.・He was scared, so he ran away.・When the bell rang, the door opened.・If we find the key, we can open the book.・At first, she felt lonely. Later, she felt happy.）→ 651〜655 セリフ（"Help!" shouted the boy.・She said, "～." / He asked, "～?"・きもちを こめて よむ（sadly / in surprise）・Once upon a time, ～. "Hello," said the fox.・"Who are you?" asked the dragon. で 4 人げき）→ 656〜660 まとめ（We need three words to open this book.・In my ending, the dragon flies home.・ほんの しょうかいカード・さよならツアー・L660 ブックフェスティバル This story is about friendship. I loved it!）。
- 物語の 糸: ワールド21 の さいごの とおり 塔の 地下の かいだんを おりて こはくの図書館へ（L631・としょかんいんは ふくろうの クイルはかせ）。図書館の ほんは すべて オリジナルの 作中作: 『はずかしがりの ドラゴン』（ノラ・ベル作。ひとりぼっちの ドラゴン エンバーが ゆきの 日に まいごの ルルを たすけ、ともだちに なる。L636・641〜645・647・650・655 で くりかえし よむ）、『まほうの いし』（ヒーローの カイ・きつねの ラスティ・わるものの グリムきょう）、『ミラと はつめい』（はつめいかの ミラと ロボットの ボルト）、『ひみつの ドア』（L644 の よみきかせ → L648 で 図書館の とけいの ベルと 同時に ほんものの ドアが ひらく）。L649 で ひみつの へやの「ひらかない ほん」→ L650 きもちの ちずの うらに かぎ → L656 なぞなぞで 3 つの ことば（Friendship! Courage! Imagination!。3 さつの ほんの テーマ）を きもちを こめて いうと ほんが ひらく → 中は おわりの ない おはなしだけ → L657 じぶんの おわりかたを かんがえる → L660 さいごの ページの みどりの はっぱと ちずで「みどりの研究所」（ワールド23 へ）。
- フォニックス（形態素の つづき。`src/lib/curriculum/w22Phonics.ts`・`questions.ts` の `w22Question`。w21Question より 先に よぶ）:
  - 人の -er / -or / -ist "-er" "-or" "-ist": 「「〜する 人」を あらわす ことばは どれ？」（write（かく）→ ？（さっか）→ writer / writor / writist）
  - 語の家族（focus は もとの ことば "act" "invent" "protect" "direct"）: 「act の かぞくで「はいゆう」の いみの ことばは どれ？」（actor / action / active）
  - あいまい母音と 強勢（focus は はくの 形 "pen-cil"）: 「よわい「ア」の ところに はいる もじは どれ？」（penc＿l（PEN・cil・えんぴつ）→ i / e / u / a）
  - -ous / -al: 「ただしい ことばは どれ？」（danger（きけん）→ ？（きけんな）→ dangerous / dangeral / dangerus、mystery → mysterious / mysterial / mysteryous）
  - おわりの しるし（focus は フレーズ そのもの "Who are you" "Help"）: 「おわりに つける しるしは どれ？」（Who are you ＿（あなたは だれ）→ ? / ! / .）
- `vowelTeams.ts` の 読み上げで -ist・-ous・-al は その回の ことばを、しるしの 回は フレーズを そのまま よむ（`w22Say`）。-er・-or は これまでの きまり（ワールド11・19）で その回の ことばを よむ。はくの 形は ワールド12 の きまりで ことば まるごと。
- テスト: `tests/curriculum.test.ts` に ワールド22 の 決まりごと（範囲・ステージ3・中3・タイトル・フォニックスの 順と 種類・表の カバー・文法と 会話の 型・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行・話し手は 5 人だけ・セリフの かぎかっこの 文は L651 から・L660 スピード TPR・物語）を 追加。`tests/phonics-w22.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **新しい phonics.rule**: "person-suffix" "word-family" "schwa-stress" "ous-al" "end-marks"（ふりかえりは "review"）。計画の B5「句読点と 表情を つけた 音読」は つづりでは ないので、フレーズの おわりに ? か ! を えらぶ 問題に して、表情は 台本・TPR・会話（L653）で あつかった。focus に " ? ! を 入れると テストの 正規表現・ボタンの 読み上げが こわれるため、W21 の 音の つながりと おなじく フレーズ そのものを focus に した。
- **まちがいの 選択肢に ほんとうに ある ことばを 出さない**: 人の ことばは sailor（sailer）・visitor（visiter）・inventor（inventer）の ように べつの つづりが ある ものを 表に 入れない。-ous / -al は もう 1つの おわりで ある ことばに なる nervous（nerval）・humorous（humoral）を 入れない。あいまい母音は lesson（lessen と おなじ おと）を 入れず button に した。しるしは「.」でも 正しい Thank you の ような ことばを 入れない。
- **しるしの 問題の いみに ！ ？ を つけない**: 1 回目の 確認で「Help ＿（たすけて！）」と こたえが みえて いたので、いみの 表から ！ ？ を とった（テストで まもる）。
- **語の家族は もとの ことばの 形が かわらない かぞくだけ**（act・invent・protect・direct）: create → creation の ように e が きえると「ことばの なかに もとの ことばが ある」と いう 見せかたが できないため。選択肢は おなじ かぞくの 3 つ（いみで えらぶ）。
- **あいまい母音は ワールド20 と ちがう 形**: ワールド20 は ＿ に はいる もじ だけ。ワールド22 は つよい はくを 大文字（PEN・cil・a・SLEEP）で みせて「つよく ない ところが よわく なる」と 強勢と むすびつけた（計画の a-BOUT, PEN-cil, SEC-ond）。ことばは ものがたりの ことば（asleep・dragon・giant・wizard）から。
- **文法の じゅんばん**: because / so（L646〜647）・when（L648）・if（L649）は ステージ2 で 入門ずみ なので きびしい 制限は しない。セリフの かぎかっこの 文（"～," said ～.）は L651 から 表現に 出す（テスト）。読みものの なかでは それまでも 'Help!' の ような セリフを つかう（ものがたりを しぜんに するため）。関係代名詞（a robot who ～）・現在完了・受け身は ステージ3 の あとの ワールド・ステージ4 なので 出さない ように 1 回 見なおして なおした（L632・L634・L659 の a robot who ～ / a cat who ～ を 2 文に わけた）。"a dragon named Ember" の named は よく つかう きまった いいかたと して のこした。
- **新しい 話し手は 増やさない**: クイルはかせ・作中作の 人物（エンバー・ルル・カイ・ラスティ・グリムきょう・ミラ・ボルト・トム・ケン）は 台本と セリフの なかだけ。L655 の げきは 4 人が やくを えんじる。
- **あんぜん**: L654 の よみきかせは ちいさい 子に えが みえる ように もつ・やさしい こえ。AI 会話の ちかくの としょかん（L631）・ブックトーク（L635）・ブックフェスティバル（L660）は「なまえは いわなくて OK」。
- 自分で 1 回 見なおして なおした ところ: 上の 関係代名詞 3 か所、しるしの 問題の いみの ！ ？、ZWJ の 絵文字（👩‍🏫・🧑‍🏫）と ふるい 端末で 出ない かもしれない 🫨 を かえた。joyous が「y を i に」の わなに なって こたえと おなじ つづりの 選択肢が できる バグ（o ＋ y は そのまま）を なおした。
- 気づいた こと（このフェーズでは かえていない）: レッスンの AI 会話の プロンプトが ステージに かかわらず やさしい 文の まま なのは ワールド21 の とき と おなじ（あとの フェーズで）。

### 例（L647「So He Ran Away」）
- 表現（core）: He was scared, so he ran away. ／ Lulu was cold, so Ember made a fire. ／ He ran away because he was scared.
- 読みもの（台本より）: "A long time ago, a hunter came to Ember's mountain. He had a loud horn and a big net. Ember was scared, so he ran away and hid in a deep cave. He stayed there for many days. Since that day, Ember was afraid of people. That's why he was so shy."
- 会話: Haru「Why was Ember so shy? I don't understand.」 Kiko「Look at this page. A hunter came to his mountain.」 Riko「He was scared, so he ran away.」 … Kiko「He was scared, but he was brave for Lulu!」
- フォニックス: adventurous / mysterious / joyous / envious（問題は「ただしい ことばは どれ？」mystery → mysterious / mysterial / mysteryous）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 56 ファイル・1,611 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 206 → 209 kB、/lesson/[lessonNo] 211 → 214 kB、/gacha 194 → 197 kB、/test/[assessmentId] 194 → 196 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド22 の 問題の コードと 表（せつめいの 文）と 索引の 1 ワールドぶん。ワールド21 と おなじ くらい。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 32` / `--pack 33`: No.32（L621〜640）・No.33（L641〜660）とも 62 ページで 作れることを 確認

## WORLD — ワールド23「みどりの研究所」（L661〜690・ステージ3・A2）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-23.json` を 新しく 作成（30 レッスン、ステージ3・A2、`school.grade` は「中3」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 690 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 124、会話の セリフ 192 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 173 語・最少 158 語・最大 187 語）で、まいかい「読みもの」（はりがみ・あんぜんポスター・じっけんカード・かんさつノート・レポート・いきものの ポスター・プログラム など 40〜90 語）を いっしょに 読む。日本語の ヒントは 2 回だけ（L683「いもむし」・L688「けつろん」）。
- ブロック構成: 661〜665 けんきゅうじょと どうぐ（Scientists study plants here.・Wear your goggles. Don't touch the hot plate. / We need to ～・I can see tiny circles! / It looks like ～・The water is 20 degrees. / How long is it?・Today, I observed a leaf.）→ 666〜670 よそう・かんさつ・けっか（I predict the apple will float.・I observed small bubbles.・The result was surprising. The egg floated!・It happened because salt water is heavier.・We predicted the egg would sink. The result was different.）→ 671〜675 if / when（If you heat ice, it melts.・When water freezes, it gets bigger.・What happens if we mix blue and yellow?・Magnets stick to iron, but not to paper.・If you drop a ball, it falls.）→ 676〜680 うけみの 入門（This chair is made of wood.・Paper is made from trees.（made of と made from の ちがい）・Rice is grown in many parts of Japan.・Where is chocolate made?・What is it made of? ― It's made of glass and metal.）→ 681〜685 しょくぶつと いきもの（Seeds need water and warm air.・First, a root grows. Then, a stem grows.・A caterpillar becomes a butterfly.・Plants need sunlight to grow.・On day five, the stem was three centimeters tall.）→ 686〜690 かがくフェア（Our question is "Do plants like music?"・We played music for one plant every day.・purpose, prediction, result and conclusion / We can't be sure yet.・さよなら けんがく・L690 We found out something amazing!）。
- 物語の 糸: ワールド22 の さいごの ちずの とおり 図書館の うらぐちから おんしつの ような 研究所へ（L661・研究所の はかせは とても としよりの カメの モスはかせ）。研究所の「ねむる たね（Sleeping Seed）」が めを ださない なぞを、じっけんで わかった こと（L681 みずと あたたかい くうき → L684 ひかりは めを だす ときには いらない）で すこしずつ しぼる。L686 で キコと ビリモが かがくフェアの テーマに する → L689 さよなら けんがくで モスはかせの おじいさんの ノート「さむい やまの たねは ふゆを まつ」を みつけ、れいぞうこで「ふゆ」を つくる → L690 かがくフェアで めが でて、さいしょの はっぱに「くもの上の鉄道」の ぎんいろの きっぷ（えきは 研究所の おくじょう。ワールド24 へ）。
- フォニックス（理科の ことばの パーツ。`src/lib/curriculum/w23Phonics.ts`・`questions.ts` の `w23Question`。w22Question より 先に よぶ）:
  - 理科の パーツ "micro-" "-scope" "-meter" "thermo-": 「この ことばの micro は どんな いみ？」（microscope（けんびきょう）→ ちいさい / はかる どうぐ / ねつ・あたたかさ / とおく。もう 1つの パーツの いみは 選択肢に 出さない）
  - -ment: 「ただしい つづりは どれ？」（measure（はかる）→ ？ → measurement / measurment / measuremant、もとの ことばが ない experiment は「？（じっけん）」→ experiment / experimant / experimint）
  - 強勢の 移動（focus は はくで わけた 小文字の 形 "pho-tog-ra-phy"）: 「つよく よむ ところは どれ？」（photography（しゃしんを とる こと）かぞく: PHO-to-graph → pho-TOG-ra-phy / PHO-tog-ra-phy / pho-tog-RA-phy …）
  - -y の ようすの ことば: 「ただしい ことばは どれ？」（shine（ひかる）→ shiny / shiney / shinie、sun → sunny / suny / sunney）
  - -tion の 理科の ことば: 「ただしい ことばは どれ？」（observe（かんさつする）→ observation / observetion / observasion、migrate → migration / migrateion / migrasion）
- `vowelTeams.ts` の 読み上げで パーツ・-ment・-y・-tion は その回の ことばを よむ（`w23Say`。ワールド10 の -y より 先）。強勢の はくの 形は ワールド12 の きまりで ことば まるごと。
- テスト: `tests/curriculum.test.ts` に ワールド23 の 決まりごと（範囲・ステージ3・中3・タイトル・フォニックスの 順と 種類と わなの 種類・文法と 会話の 型・うけみは L676 から・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行・話し手は 5 人だけ・あんぜん・L690 スピード TPR・物語）を 追加。`tests/phonics-w23.test.ts`（15 テスト）を 追加。

### 決めたこと（理由）
- **新しい phonics.rule**: "science-parts" "ment-spelling" "stress-shift" "y-adjective" "tion-noun"（ふりかえりは "review"）。
- **まちがいの 選択肢は 表に 手で 書く**: -ment・-y・-tion は きまりで つくると ほんとうに ある ことばや よく ある べつの つづりが まじる（shinny・smokey・stoney・predication など）ので、ワールド22 までの 自動の まちがいでは なく 1 語ずつ 書いた。stony・smoky・foggy（fogy が ある）・fury に なる furry は 表に 入れない。ワールド21 で つかった movement・agreement などの -ment は 入れない（ちがう 問題に なる）。
- **強勢の 選択肢は 3〜4つ**: 2はくの ことば（photo・science・magnet）は 選択肢が 2つに なって しまうので 問題の ことばに せず、3はく 以上の かぞく（PHO-to-graph ↔ pho-TOG-ra-phy、SCI-en-tist ↔ sci-en-TIF-ic、EN-er-gy ↔ en-er-GET-ic、e-LEC-tric ↔ e-lec-TRIC-i-ty、bi-OL-o-gy ↔ bi-o-LOG-i-cal、mag-NET-ic ↔ MAG-ne-tism、ex-PER-i-ment ↔ ex-per-i-MEN-tal）に した。5はくの ことばは こたえの まわりの 4つ。かぞくの ことばの つよい はくを 問題に 見せて「うごく」ことが わかる ように した。focus は ワールド18 と おなじ 小文字の はくの 形（ボタンの 見た目・読み上げを そのまま つかえる）。
- **まえの ワールドの 読み上げを かえない**: -y（L282・L297・L350）・-tion（L481〜600）の 回にも sunny・rotation・celebration が 入って いるので、`w23Say` は「その回の ことばが ぜんぶ ワールド23 の 表に ある とき」だけ はたらく。L660 までの 全レッスンで この じょうけんに あう 回が ない ことを たしかめた。
- **文法の じゅんばん**: うけみ（is made of / made from / is grown in / is made in）は L676 から（それまでの 表現・会話・台本・TPR に 出さない ことを テストで まもる。L677・L679 の 読みものの 工場の てじゅんは 読む だけの うけみ）。現在完了（ワールド24 から）・関係代名詞（ステージ4）は 出さない ように 見なおした（L665 の「100 年 ノートを かいて いる」を every day に なおした）。L670 の We predicted the egg would sink. は ワールド21 の said ～ would と おなじ「すぎた かたち」。
- **理科の ないようは ほんとうの こと**: たまごは しおを たくさん 入れて うく、みずは こおると 体積が ふえる、たねの はつがに ひかりは ふつう いらない（L684 で ビリモの「ひかりかも」を エマ先生が なおす）、さむい ところの たねは ふゆ（低温）を まつ（L689）、アゲハの いっしょう（たまご 約 5 日・よう虫 約 20 日・さなぎ 約 10 日）、カカオは ガーナ・コートジボワールなど。L687〜688 の「しょくぶつは おんがくが すき？」は 1 cm の ちがいで「まだ たしかとは いえない。もっと たくさんで もう いちど」と こたえを いそがない けつろんに した（かがくの たいど）。L669 の しかいは くにの なまえを 出さず「West Asia」に した。
- **あんぜん**: L662 で きまり（さきに おとなに きく・ゴーグル・ホットプレートに さわらない・あじみ しない・てを あらう・こぼしたら おとなに）、L667 で ビリモが のんだのは じぶんの ジュースと はっきり させた、L671 は おとなが ホットプレートを つける、L672 ガラスの びんを れいとうこに 入れない、L674 じしゃくを でんわ・コンピューターに ちかづけない。
- **新しい 話し手は 増やさない**: モスはかせ・モスはかせの おじいさんは 台本と セリフの なかだけ。ビリモは ロボットでは ないので L674 の「ロボットの うで」の じょうだんを「おべんとうばこ」に なおした。
- 自分で 1 回 見なおして なおした ところ: 上の 現在完了と ロボットの じょうだん、electricity の つよい はくの いち（TRIC は 3ばんめ）、develop の まちがいの 選択肢（developement は ふるい つづりなので developmant に）、Unicode 14 の 絵文字（🛟 🫧 🫠 🫘 🫙）を ふるい 端末でも 出る ものに かえた。
- 気づいた こと（このフェーズでは かえていない）: レッスンの AI 会話の プロンプトが ステージに かかわらず やさしい 文の まま なのは ワールド21・22 と おなじ（あとの フェーズで）。

### 例（L668「The Result Was Surprising」）
- 表現（core）: The result was surprising. The egg floated! ／ At first, the egg sank to the bottom. ／ After we added salt, it floated.
- 読みもの（台本より）: "At first, the egg sank to the bottom of the glass. We added salt, one spoon at a time. After six spoons, nothing happened. After we added salt again and again, the egg slowly floated up to the top. Our prediction was wrong, and that was the best part!"
- 会話: Haru「The egg sank to the bottom. Let's add salt.」 Kiko「One spoon... two spoons... Nothing is happening.」 … Riko「Look! It's going up! The egg floated!」 Haru「The result was surprising. I predicted it would sink.」
- フォニックス: equipment / development / environment / experiment（問題は「ただしい つづりは どれ？」equip（そなえる）→ equipment / equippment / equipmant）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 57 ファイル・1,663 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 209 → 211 kB、/lesson/[lessonNo] 214 → 217 kB、/gacha 197 → 200 kB、/test/[assessmentId] 196 → 199 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド23 の 問題の コードと 表（まちがいの 選択肢を 手で 書いた ぶん）と 索引の 1 ワールドぶん。ワールド22 と おなじ くらい。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 34`: No.34（L661〜680・62 ページ）を 作れることを 確認（No.35 は ワールド24 が できてから）
