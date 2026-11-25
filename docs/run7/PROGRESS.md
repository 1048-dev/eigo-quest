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
