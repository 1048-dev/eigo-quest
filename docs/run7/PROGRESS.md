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

## WORLD — ワールド24「くもの上の鉄道」（L691〜720・ステージ3・A2+）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-24.json` を 新しく 作成（30 レッスン、ステージ3・A2+（stages.ts の きまりどおり）、`school.grade` は「中3」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 720 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 132、会話の セリフ 188 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 168 語・最少 157 語・最大 191 語）で、まいかい「読みもの」（えきの はりがみ・ねだんひょう・きっぷ・あんないばん・アナウンス・ざっし・りょこうノート・しゃないはんばいの メニュー・まいごの ポスター・じこくひょう・わすれものの リスト・ガイドブック・えはがき・しゃないの マナー・ろせんず・ブログ・てがみ など 40〜80 語）を いっしょに 読む。日本語の ヒントは 2 回だけ（L693「おうふく」・L703「わすれもの センター」）。
- ブロック構成: 691〜695 えきと きっぷ（This train runs above the clouds!・A ticket to Star Station, please.・One way or round trip?・Which platform does the train leave from?・The next train leaves at 10:15 from platform 3.）→ 696〜700 けいけん（現在完了の はじまり。Have you ever seen a rainbow train? ― Yes, I have. / No, I haven't.・I've been to Hokkaido. ＋ When did you go? / How was it?・I've never eaten it. Is it good?・I've been there twice.・L700 は 700 かい きねんの けいけん ビンゴ）→ 701〜705 こまった とき（Excuse me. I'm lost. Could you help me?・I missed the train! When's the next one?・I left my bag on the train.・It's a small blue bag with a star on it.・Don't worry. I'll help you.）→ 706〜710 しゃないで（What a view!・Look out the window! There's a castle. ＋ on the left / next to / under・Excuse me. Is this seat taken?・I'll have the sandwich set, please.・Where are you going? ＋ もう 1つ しつもん）→ 711〜715 たびの けいかく（How long does it take? ― It takes two hours.・We're taking the overnight train.・Take the underground line / Change trains at / Get off at・It's impossible to see everything in one day.・First, ～. Then, ～. Finally, ～.）→ 716〜720 しめくくり（Day 1: I've arrived at Star Station!・I'll buy this for my sister.・Have you ever been abroad?・さよなら・L720 I've had the best trip ever!）。
- 物語の 糸: ワールド23 の ぎんいろの きっぷで 研究所の おくじょうの えきから くもの れっしゃへ（L691）。きっぷは さいしょの えき（クラウド・ジャンクション）まで なので L692 で スター・ステーションまでの きっぷを かう。しゃしょうは あおい ぼうしの 背の 高い とりの ニンバスさん（台本と セリフの なかだけ）。L699 の ニンバスさんの ノート「なぞときの どうくつには いった ことが ない」が つなぎの ふせん。L703〜704 で キコの「ほしの ついた ちいさな あおい かばん」を わすれもの センターで とりもどす。ルートは クラウド・ジャンクション → スカイ・ハーバー → レインボー・フォールズ → ミスト・マウンテン → ムーン・レイク（しんだい れっしゃ）→ クリスタル・シティ（ちかてつ）→ スター・ステーション。L719 で ニンバスさんから てがみと ふるい ちず（はてなマークの どうくつ）、L720 で ちずが ひかって「なぞときの どうくつ」へ（ワールド25 へ）。
- フォニックス（`src/lib/curriculum/w24Phonics.ts`・`questions.ts` の `w24Question`。w23Question より 先に よぶ）:
  - 地名の 音節と 強勢（focus は はくで わけた 小文字の 形 "can-a-da"）: 「つよく よむ ところは どれ？」（Canada（カナダ）→ CAN-a-da / can-A-da / can-a-DA。選択肢は はくの 順の まま。日本の 地名（o-SA-ka・hok-KAI-do・o-ki-NA-wa・na-ga-SA-ki）は「日本語では たいらでも 英語では 1つを つよく」と せつめい）
  - 過去分詞（"-een" "-one" "-en" "-wn" "-um"）: 「have の あとに くる かたちは どれ？」（I have ＿＿.（see＝みる）→ seen / saw / see。written・ridden・forgotten・hidden は かさねない つづり（writen など）も 4つめに）
  - 短縮形（"'ve" "n't" "'s"）: 「みじかい かたちは どれ？」（I have → I've / Ive / I'have、have not → haven't / havent / have'nt、she has → she's。's が has の ときの せつめい つき）
  - over- / under-: 「この ことばの over は どんな いみ？」（うえ・こえて・〜すぎる / した / まえ / もう いちど）
  - im- / in-: 「ただしい ことばは どれ？」（possible（できる）の はんたい → impossible / inpossible / unpossible、visible → invisible / imvisible / unvisible）
- `vowelTeams.ts` の 読み上げで 過去分詞の おわり・短縮形・over- / under-・im- / in- は その回の ことばを よむ（`w24Say`。ワールド23 より 先）。地名の はくの 形は ワールド12 の きまりで ことば まるごと。
- テスト: `tests/curriculum.test.ts` に ワールド24 の 決まりごと（範囲・ステージ3・A2+・中3・タイトル・フォニックスの 順と 種類と わなの 種類・文法と 会話の 型・現在完了は L696 から・関係代名詞なし・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行・話し手は 5 人だけ・あんぜん・L720 スピード TPR・物語）を 追加。`tests/phonics-w24.test.ts`（15 テスト。L690 までの どの 回でも w24Say が はたらかない ことも たしかめる）を 追加。

### 決めたこと（理由）
- **フォニックスの ブロックの 順を 計画から 入れかえた**: 計画は B1 過去分詞 → B2 短縮形 → B3 over- / under- → B4 im- / in- → B5 地名。過去分詞を 691〜694 に おくと 現在完了（L696〜）より まえに なるので、地名（えきと きっぷの 回に あう）を 691〜694、過去分詞を 696〜699（Have you ever ～? と おなじ ブロック）、短縮形を 701〜704、over- / under- を 706〜709（L706 overlook・L708 overhead の たな）、im- / in- を 711〜714（L714 It's impossible!）に した。overnight（L712）・underground（L713）は ふりかえり（L708・L709・L715）で あつかう。
- **新しい phonics.rule**: "place-stress" "past-participle" "perfect-contraction" "over-under" "im-in"（ふりかえりは "review"）。
- **過去分詞の 選択肢は 3つの かたち**: 「規則で つくった まちがい（eated・seed）」は seed・sawed の ように ほんとうに ある ことばが まじるので つかわず、すぎた かたちと もとの かたち（seen / saw / see）を くらべる 問題に した（have の あとに どれ？が いちばん だいじな ポイント）。come・run（もとの かたちと おなじ）は 入れない。もじを かさねる 4語だけ かさねない つづりを 4つめに たした。
- **まちがいの 選択肢は 表に 手で 書く**: its（その）・inpatient（入院患者）の ように ほんとうに ある ことばは 入れない（it's の まちがいは it'has / its'、impatient の まちがいは unpatient / impatiant）。2はくの 地名（Japan・Tokyo・Kyoto）は 選択肢が 2つに なるので 入れない。
- **core の 表現には ― を 入れない**（全体の きまり）: 計画の「One way or round trip? ― Round trip, please.」「How long does it take? ― It takes two hours.」「Where are you going? ― I'm going to the sea.」は core を 前半だけに して、こたえは 2つめの 表現に した。L715 の core は 計画の「It takes three hours.」を クリスタル・シティの 1にちの けいかくに あわせて「It takes twenty minutes.」に した。
- **文法の じゅんばん**: 現在完了（I've / Have you ever ～? / haven't）は L696 から（691〜695 の 表現・会話・台本・TPR・AI の さいしょの ことばに 出さない ことを テストで まもる）。けいけんの こたえに「いつ？」を いう ときは すぎた かたち（Yes, I have. I saw it ten years ago. / I went there last winter.）と 台本で くらべた。L699 の しゃしょうさんの ノートは 継続の 現在完了（have worked for）を さけて I started working ～ ago. に した。関係代名詞（ステージ4）は 出さない（L708 の マナーの はりがみは people with small children、L700 の ビンゴは Find a friend who ～ を やめて Have you ever ～? の しつもんの ならびに した）。
- **あんぜん**: L701 まいごの ときは おちついて、せいふくの えきいんさん・あんないじょへ、しらない ひとと どこにも いかない。L705 こどもは「おとなを よぶ」ことで たすける。L710・L718 あたらしい ひとと はなすのは かぞくや 先生と いっしょの とき。L716 ブログに かおや がっこうの なまえを のせない・まず おうちの ひとに きく。AI 会話は なまえ・すんで いる ところを きかない（テストで まもる）。
- **地名・会社名**: 実在の 地名は くにと 日本の 地名だけ。駅・路線（クラウド・ジャンクション・スター・ステーション・ブルー・ライン など）と たべもの（くもパン・かみなりチップス）は ぜんぶ オリジナル。会社名・商品名は 出さない。
- **新しい 話し手は 増やさない**: ニンバスしゃしょう・マルコ（イタリアの りょこうしゃ）は ビリモが やくを する か 台本の なかだけ。えきいんさん・うりこさん・ウェイター・じょうきゃくも ビリモや リコが ロールプレイで えんじる。
- 自分で 1 回 見なおして なおした ところ: 短い 台本 4 回（L694・L695・L702・L709）を 150 語 以上に、L709 の「2はいめの カレー」の つじつま（ちゅうもんを カレーと ヌードルに）、L693 の ex3 を たびの いきさき（スター・ステーション・5まい）に、L720 の 日本語訳を しぜんに。ワールド19 の ouWhy と 名前が ぶつかったので overUnderOf / overUnderWhy に した。
- 気づいた こと（このフェーズでは かえていない）: レッスンの AI 会話の プロンプトが ステージに かかわらず やさしい 文の まま なのは ワールド21〜23 と おなじ（あとの フェーズで）。vitest を まとめて 回した とき 1 回だけ 1 テスト 失敗 → 2 回 回しなおして 58 ファイル すべて 成功（時間に よる ゆれと みられる。再現しなかった）。

### 例（L697「I've Been to Hokkaido」）
- 表現（core）: I've been to Hokkaido. ／ When did you go? ― I went there last winter. ／ How was it? ― It was really cold, but fun!
- 読みもの（台本より）: "Places I've been to: Hokkaido, Kyoto and Okinawa. My favorite was Hokkaido. I went there last winter with my family. We saw lots of snow, and we ate hot ramen. Places I want to go to: Canada and Australia."
- 会話: Riko「Have you ever been to Hokkaido, Haru?」 Haru「No, I haven't. Have you?」 Riko「Yes! I've been to Hokkaido. I went there last winter.」 Kiko「Wow! How was it?」 … Ms. Emma「Great follow-up question, Kiko. When did you go? How was it? Those questions keep the talk going.」
- フォニックス: eaten / taken / given / spoken（問題は「have の あとに くる かたちは どれ？」I have ＿＿.（eat＝たべる）→ eaten / ate / eat）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 58 ファイル・1,716 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 211 → 214 kB、/lesson/[lessonNo] 217 → 219 kB、/gacha 200 → 202 kB、/test/[assessmentId] 199 → 202 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド24 の 問題の コードと 表と 索引の 1 ワールドぶん。ワールド23 と おなじ くらい。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 35` / `--pack 36`: No.35（L681〜700）・No.36（L701〜720）とも 62 ページで 作れることを 確認

## WORLD — ワールド25「なぞときの洞くつ」（L721〜750・ステージ3・A2+）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-25.json` を 新しく 作成（30 レッスン、ステージ3・A2+、`school.grade` は「中3」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 750 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 127、会話の セリフ 186 行（1 回 5〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 167 語・最少 151 語・最大 197 語）で、まいかい「読みもの」（どうくつの いりぐちの はりがみ・ルマの メモ・かべの え の せつめい・ちずの はんれい・ハルの ノート・てがかりボード・なぞなぞの とびら・ミステリーの えほん・ショーの ポスター など 40〜75 語）を いっしょに 読む。日本語の ヒントは 2 回だけ（L729「probably（たぶん）」・L734「witness（もくげきしゃ）」）。
- ブロック構成: 721〜725 くわしく せつめい（It's dark in here. Turn on your flashlight.・There's a small door at the back of the cave.・In the top left corner, there's a bat.・There's a lamp next to the box.・At the end of the tunnel, there's a lake.）→ 726〜730 すいりょう（What's that sound? / It might be a bat.・It must be a key.・It can't be a ghost. Ghosts aren't real!・maybe / probably / definitely・ふくろの なかみ あて）→ 731〜735 じけん（Someone was here.・The crown was here yesterday. Now it's gone.・Where were you at three o'clock?（過去進行形で アリバイ）・Do you know who took it?（間接疑問の 入門）・Clue 1 / Clue 2）→ 736〜740 なぞなぞ（It has four legs, but it can't walk.・The more you take, the more you leave behind.・huge / tiny / giant・じぶんの なぞなぞ・なぞなぞ大会）→ 741〜745 しぼりこむ・はんろん（Is it bigger than a box?・Was the thief tall?・It can't be Haru. He was with me.・The thief was the crow! It loves shiny things.・First, ～. Then, ～. So, ～.）→ 746〜750 よむ・かく（Who ate the cookies?・In this picture, something is strange.・One night, the museum's painting disappeared.・さよなら たんけん・L750 The case is closed! Great detective work!）。
- 物語の 糸: ワールド24 の ひかる ちずで スター・ステーションの さきの どうくつへ（L721、キコの あおい かばんの かいちゅうでんとう）。どうくつの まもりびとは ひかる むしの ルマ、すんで いるのは モグラの モールさん・コウモリの ベラ・あおい とりの ピップ・カラスの コーラ（台本と、ビリモや リコが やくを する セリフの なかだけ）。L727 で みつけた きんの かぎで L738 の かぎあなの いわが ひらく。L732 で ルマの クリスタルの おうかんが きえる（きのうの ごご 3じごろ・6じに ルマが きづく）→ L733 アリバイ（モールさんは トンネル、ベラは ねて いた、ピップは たきで うたって いた、コーラだけ だれも みて いない）→ L734 ピップが「ひかる ものを もった くろい とり」を 見た → L735 ゆびが 3本の ぬれた あしあと と あおい はね（ピップが あやしい？）→ L743 ピップが ハルを うたがうが「ハルは わたしと いっしょ」・ピップも たきに いた → L744 カラスの はねは ランプの ひかりで あおく 見える、はんにんは コーラ。コーラは あやまり、「つぎは さきに きく」。L749 ルマから「ひびきの劇場」への しょうたいじょう、L750 こだまに みちびかれて ワールド26 へ。
- フォニックス（`src/lib/curriculum/w25Phonics.ts`・`questions.ts` の `w25Question`。w24Question より 先に よぶ）:
  - -ness: 「『〜さ』を あらわす ことばは どれ？」（dark（くらい）→ ？（くらやみ・くらさ）→ darkness / darkly / darker。happy・lazy・tidy は happyness など y の まま つけた つづりも 4つめに。ワールド21 の「おわりを つけると？」とは べつの 角度で、-ly（〜に）・-er（もっと）と 品詞を くらべる）
  - -ive: 「ive の ことばで ただしい つづりは どれ？」（create → creative / creativ / createive。わなは 4種類: そのまま・e を とる・つづりが かわる（explode → explosive・describe → descriptive・defend → defensive）・ative（talkative・imaginative）。「英語の ことばは v で おわらない」を まいかい せつめい）
  - 複合語（focus は "foot-print"）: 「あと 1つの ことばは どれ？」（＿＿print（あしあと）→ foot / ear / sky、some＿＿（なにか）→ thing / body / where。ワールド15 の「2つに わけると？」とは べつの 角度で、パーツの いみから 考える）
  - にた いみの ことば（focus は ことば そのもの "huge"）: 「にた いみの ことばは どれ？」（huge（とても おおきい）→ big / small / quiet。まちがいに ほかの にた ことばを 入れない ことを テストで まもる）
  - しつもんの イントネーション（focus は しつもん そのもの "Is it bigger than a box"）: 「この しつもんの おわりは あがる？ さがる？」（↗ あがる / ↘ さがる / → かわらない。Wh は ↘、Yes / No は ↗。Do you know who took it? は who が あっても ↗ と せつめい）
- `vowelTeams.ts` の 読み上げで -ness・-ive は その回の ことばを よむ（`w25Say`。ワールド24 より 先。ワールド21 の -ness の 回と ことばが ぜんぶ かさなる ときは はたらかない）。複合語は ワールド12 の きまりで ことば まるごと、ことば・しつもんは そのまま。
- テスト: `tests/curriculum.test.ts` に ワールド25 の 決まりごと（範囲・ステージ3・A2+・中3・タイトル・フォニックスの 順と 種類と わな・文法と 会話の 型・might / must は L726 から・It can't be は L728 から・Do you know who ～? は L734 から・関係代名詞なし・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行・話し手は 5 人だけ・AI 会話で 個人情報を きかない・L750 スピード TPR・物語）を 追加。`tests/phonics-w25.test.ts`（14 テスト。L720 までの どの 回でも w25Say が はたらかない ことも たしかめる）を 追加。

### 決めたこと（理由）
- **フォニックスの ブロックの 順を 計画から 入れかえた**: 計画は B4 イントネーション → B5 にた いみの ことば だが、L738「Huge, Tiny, Giant」は 736〜739 の ブロック、20 の 質問・はい / いいえ たんていは 741〜744 の ブロックに あるので、にた いみの ことばを 736〜739、イントネーションを 741〜744 に した。
- **新しい phonics.rule**: "ness" "ive" "compound" "synonym" "intonation"（ふりかえりは "review"）。
- **イントネーションの 選択肢は 3つ**（↗ / ↘ / →）。ほかの ワールドの 問題と おなじく 3つ 以上に そろえる ため「→ かわらない」を わなに した。おなじ しつもんの フレーズは ワールド22 の おわりの しるしの 表（Who are you など）と かさならない ものだけに した。
- **core の 表現には ― ・ ～ を 入れない**（全体の きまり）: L726 は core を「What's that sound?」、こたえ「It might be a bat.」を 2つめに。L730 の 計画「It might be a ～ because ～.」は「It might be a ball because it's round.」に。L741・L742・L743・L744 は 計画の 2文を core と 2つめの 表現に わけた（テストでは つなげて たしかめる）。L739 の 2つめは 3人称の なぞなぞに あわせて「What is it? ― A banana!」。L749 の core は ふりかえりで くりかえしに ならない よう「There's a light at the end of the tunnel.」。
- **文法の じゅんばん**: 推量の might / must は L726 から（721〜725 には 義務の must も 出さない）、It can't be ～ は L728 から、間接疑問 Do you know who / where ～? は L734 から（テストで まもる）。関係代名詞（ステージ4）は 出さない。
- **あんぜん**: L721 くらい ところでは おとなの そばに いる・ほんとうの どうくつに ひとりで 入らない。どろぼう やくの コーラは あやまって ゆるされる（こわく しない）。AI 会話は なまえ・すんで いる ところを きかない。
- **新しい 話し手は 増やさない**: ルマ・どうくつの どうぶつたち・なぞなぞの とびらは 台本の なかか、ビリモ・リコが「I'm playing Pip!」と やくを する。L746 の ものがたり（ミア・ケン・ネコの モモ・イヌの ポチ）は オリジナル。会社名・商品名は 出さない。
- **作りかた**: 30 レッスンを 3つの まとまり（721〜730・731〜740・741〜750）に わけて 同じ 計画書から 並行して 下書きし、まとめてから 自分で 1 回 見なおした。なおした ところ: おうかんの いれもの（treasure box → glass box に そろえる）、じけんの じかん（「きのうの よる」→ きのうの ごご 3じごろ・6じに きづく に そろえる、L732・L742・L743）、ピップの アリバイ（「ベラと うたって いた」は ベラが ねて いた L733 と あわないので「たきで うたって いた。ハルと リコが きいて いた」に、L745 も）、L736 の 先生の なぞなぞ（L740 の とけいと かぶるので「It has keys, but it can't open a door.」に）、L744 の it / her の まじり。
- **テストの 時間**: `tests/choices-unique.test.ts` の 2つの テスト（全テスト × 4 seed・全レッスン）が、ワールドが ふえて まとめて 回すと 5 秒を こえる ように なった（単体では 通る）。中身は かえず タイムアウトを 60 秒に した。

### 例（L733「Where Were You?」）
- 表現（core）: Where were you at three o'clock? ／ I was sleeping in my nest. ／ What were you doing then? ― I was reading by the waterfall.
- 読みもの（台本より）: "Cave animals: Mr. Mole lives in a tunnel under the big rock. Bella the bat sleeps on the ceiling in the daytime. Pip the bluebird sings by the waterfall. Cora the crow loves shiny stones. Everyone was in the cave yesterday afternoon."
- 会話: Haru「Mr. Mole, where were you at three o'clock?」 Birimo「I'm playing Mr. Mole! I was digging a tunnel under the big rock.」 … Riko「So, where was Cora the crow? Nobody saw her.」 Ms. Emma「Good questions! Write every answer in your notebook. We'll check them later.」
- フォニックス: keyhole / footstep / moonlight / waterfall（問題は「あと 1つの ことばは どれ？」key＿＿（かぎあな）→ hole / cup / sun）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 59 ファイル・1,768 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 214 → 218 kB、/lesson/[lessonNo] 219 → 223 kB、/gacha 202 → 206 kB、/test/[assessmentId] 202 → 206 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド25 の 問題の コードと 表と 索引の 1 ワールドぶん。ワールド24 より 少し 多い（表が 5つ・まちがいを 手で 書いた ぶん）。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 37`: No.37（L721〜740・63 ページ）を 作れることを 確認（No.38 は ワールド26 が できてから）

## WORLD — ワールド26「ひびきの劇場」（L751〜780・ステージ3・A2+）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-26.json` を 新しく 作成（30 レッスン、ステージ3・A2+、`school.grade` は「中3」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 780 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 126、会話の セリフ 177 行（1 回 5〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 187 語・最少 173 語・最大 207 語）で、まいかい「読みもの」（げきじょうの はりがみ・やくしゃの けいじばん・やくの リスト・オーディションの メモ・はいやくひょう・フートさんの メモと てがみ・だいほんの ページ・ト書き・プログラム・おきゃくさんの カード など 45〜80 語）を いっしょに 読む。日本語の ヒントは 2 回だけ（L757「excited（わくわく）」・L773「Break a leg!（がんばって）」）。
- ブロック構成: 751〜755 げきじょうと やくぎめ（Welcome to the theater! The show starts soon.・I enjoy acting. How about you?・I want to be the dragon in the play.・I'm good at singing. Can I try?・Riko plays the princess. Birimo plays the dragon.）→ 756〜760 きもち（I'm nervous. / Don't worry. You'll be great.・The play is exciting. I'm excited!・This scene is boring. Let's make it better.・I feel proud of myself.・Are you surprised? / No, I'm confused!）→ 761〜765 ものがたりづくり（We decided to write our own play.・Suddenly, the lights went out.・Luckily, a little bird helped them.・They tried to escape, but the door was locked.・Our story has a beginning, a problem, a solution, and an ending.）→ 766〜770 けいこ（Say it with feeling.・Speak louder, please. The people at the back can't hear.・I didn't eat YOUR cake.・Walk to the center. Then, look up.・Who's there? / It's me, your friend!）→ 771〜775 ほんばん（We need a crown and a cape.・It's fun to act in costumes!・Break a leg!・The princess opened the gate.・You were amazing! I loved the ending.）→ 776〜780 ふりかえりと かく（The best part was ～. Next time, we should ～.・Narrator: One day, a fox found a magic hat.・Let's make a story one word at a time.・I enjoy singing on the stage. / I decided to try something new.・L780 Thank you for watching our play!）。
- 物語の 糸: L750 の こだまに みちびかれて ふるい「ひびきの劇場」へ（L751）。劇場の かんとくは ふくろうの フートさん、うさぎの やくしゃ ルル、劇場の こえ エコー（台本と、ビリモや リコが やくを する セリフの なかだけ）。ながく げきが なくて こだまが よわって いる。「ほんとうの きもちが こもった げきで こだまは もどる」。フートさんの げき「おひめさまと ドラゴン」の オーディションで、ドラゴンを やりたかった ハルより ビリモの ほえごえが かつ（L754）→ はいやく リコ＝おひめさま・ビリモ＝ドラゴン・ハル＝きし・キコ＝ことり（L755）。L761 で だいほんの さいごの ページが なくなって いて、じぶんたちの げき「おひめさまと かぎの かかった とう」を かく ことに（オルゴールを とった ドラゴンは さびしかった だけ → ともだちに なる やさしい おわり）。けいこの たびに こだまが すこしずつ おおきく なり（L759・L766・L767・L770）、L771 で ワールド25 の ルマが クリスタルの おうかんを こどうぐに かして くれる（カラスの コーラが はこぶ）。L774 の ほんばんで こだまが もどり、L779 で フートさんが やまみちの さきの「いずみの里（Village of Springs）」を おしえ、L780 で ワールド27 へ。
- フォニックス（ことばの リズム。`src/lib/curriculum/w26Phonics.ts`・`questions.ts` の `w26Question`。w25Question より 先に よぶ）:
  - きもちの こえ（rule "voice"）: 「この きもちで いうと、どんな こえ？」（Really?!（びっくり！）→ ↗ たかく げんきに、Oh, really…（がっかり）→ ↘ ひくく しずかに、→ ずっと おなじ は きもちが つたわらない わな。選択肢は きまった 順）
  - -ed / -ing（rule "ed-ing"）: 「＿＿ に あてはまる ことばは どれ？」（The play is ＿＿. → exciting / excited / exciteing。いみ（ひとの きもち か、そう させる もの か）と つづり（e を とる・そのまま・worry の y）を いっしょに 問う。-ed と -ing は かならず ペアで 出す）
  - セリフの くとうてん（rule "punctuation"）: 「セリフの かきかたが ただしいのは どれ？」（"Help!" shouted the princess. / "Help"! shouted the princess. / "Help! shouted the princess."。まちがいは 記号の いちだけ ちがい、ことばは おなじ ことを テストで まもる）
  - いみを かえる 強勢（rule "stress"）: 「この いみに なるのは、どこを つよく いう とき？」（（あなたの ケーキは たべて いない）→ I didn't eat YOUR cake / I didn't EAT your cake / I didn't eat your CAKE。大文字の ことばを つよく よむ）
  - はやくちことば（rule "tongue-twister"・オリジナル 16 こ）: 「おなじ おとで はじまる ことばは どれ？」（Crazy crows carry ＿＿ crackers → crunchy / soft / big。cr・p・th・ch・r・l・b・v・f。r / l、b / v、f の くちの かたちを せつめい）
- フォーカスの ボタン（`phonicsButtons.ts` の `focusExampleWord` から `w26Example` を よぶ）: くとうてんは しるしの なまえ（comma・exclamation mark・three dots・quotation marks）、きもちの こえは キーワード（Really）、強勢は つよく いう ことば（YOUR）、はやくちことばは その はやくちことば（, を とる）を よむ。`vowelTeams.ts` の `focusSay` には `w26Say`（その focus で 問う セリフ・文）。どちらも L750 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド26 の 決まりごと（範囲・ステージ3・A2+・中3・タイトル 30・フォニックスの 順と 種類・ペアと わな・core の 表現・動名詞は L752 から・decided to は L761 から・tried to は L764 から・関係代名詞なし・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行・話し手は 5 人だけ・AI の targetExpressions は 表現と おなじ・AI 会話で 個人情報を きかない・L780 スピード TPR・物語）を 追加。`tests/phonics-w26.test.ts`（12 テスト）を 追加。

### 決めたこと（理由）
- **フォニックスの ブロックの 順を 計画から 入れかえた**: 計画は B1 きもちの イントネーション → B2 強勢 → B3 -ed / -ing → B4 くとうてん → B5 はやくちことば だが、L757「Excited or Exciting?」・L758「Bored or Boring?」は 756〜759、L768「Which Word Is Important?」は 766〜769、ものがたりを かく 761〜764 は くとうてんと あうので、B2 を -ed / -ing（756〜759）、B3 を くとうてん（761〜764）、B4 を 強勢（766〜769）に した（ワールド25 と おなじ かんがえかた）。
- **同じ id に なる ことばを ならべない**: 学習項目の id は 小文字に して 記号を とった 形なので、"Really?!" と "Really…"、"I didn't eat YOUR cake" と "I didn't EAT your cake" は おなじ id に なる。きもちの こえは "Really?!" と "Oh, really…" の ように ことばを かえ、強勢は 1回に 1つの 文を 1つの 強勢で 出して、ほかの 強勢は まちがいの 選択肢だけに した。
- **focus の かきかた**: 強勢は つよく いう ことば（"YOUR"）、きもちの こえは キーワード、くとうてんは しるし そのもの、はやくちことばは はじめの おと。? は 正規表現で こわれるので focus に しない。フォーカスの ボタンで よむ おてほんは 英字と スペース だけ（アポストロフィは さいしょの ことばだけ）と いう 全体の きまりが あるので、"I can't" は "can't" に した。
- **きもちの こえの 選択肢は 3つ**（↗ / ↘ / →）。ワールド25 の イントネーションと おなじく「→ ずっと おなじ」は かならず まちがいで、「たいらに いうと きもちが つたわらない」と せつめいする。
- **core の 表現には ― ・ ～ を 入れない**: L756（I'm nervous.）・L760（Are you surprised?）・L770（Who's there?）・L773（Break a leg!）は 計画の 2文を core と 2つめの 表現に わけた。L765 の 計画「Beginning, problem, solution, ending」は 文に して「Our story has a beginning, a problem, a solution, and an ending.」、L766 は core「Say it with feeling.」と 2つめ「Try this line: "I'm free!"」、L776・L777・L779 は 計画の ～ を うめた 文に した。
- **文法の じゅんばん**: 動名詞（enjoy / good at ～ing）は L752 から、decided to は L761 から、tried to は L764 から（テストで まもる）。関係代名詞（ステージ4）は 出さない。
- **あんぜん・やさしさ**: ドラゴンは わるものに しない（さびしかった だけ → ともだちに）。Break a leg! は「あしを おる」では なく「がんばって」と ビリモの かんちがいで わらいに する。AI 会話は なまえ・すんで いる ところを きかない。
- **新しい 話し手は 増やさない**: フートさん・ルル・エコーは 台本の なかか、ビリモ・リコが「I'm playing Mr. Hoot!」と やくを する。げきの なかみ（おひめさまと かぎの かかった とう・キツネと まほうの ぼうし）と はやくちことばは すべて オリジナル。会社名・商品名は 出さない。
- **作りかた**: 30 レッスンを 3つの まとまり（751〜760・761〜770・771〜780）に わけて おなじ 下書きの きまり（物語・core・フォニックスの ことば）から 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: フートさんの 日本語の よびかた（ミスター・フート / ホーさん → フートさん に そろえる）、L770 の ドラゴンが じぶんで ノックして いた セリフ（→「Someone is knocking. Who's there?」）。

### 例（L768「Which Word Is Important?」）
- 表現（core）: I didn't eat YOUR cake. ／ Which word is important? ― YOUR is important. ／ So whose cake did you eat? ― I ate MY cake!
- 読みもの（台本より）: "Backstage Snack Table. Two cakes are here today. The big chocolate cake is for Ms. Emma. The small strawberry cake is for Birimo. Please eat only your own cake. And please share the cookies. There are six cookies for the whole team. Thank you! Mr. Hoot."
- 会話: Haru「Birimo! There's cream on your face. Did you eat Ms. Emma's cake?」 Birimo「I didn't eat YOUR cake, Ms. Emma!」 … Birimo「I ate MY cake! The strawberry one. But… I ate the LAST cookie, too.」 Ms. Emma「Ha ha! Thank you for being honest. Next time, let's share.」
- フォニックス: I didn't eat YOUR cake / I didn't say SHE took it / Birimo ate the LAST cookie / My BROTHER made this crown（問題は「この いみに なるのは、どこを つよく いう とき？」（ほかの ひとが とったと いったんだよ）→ I didn't say SHE took it / I didn't SAY she took it / I didn't say she TOOK it）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 60 ファイル・1,818 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 218 → 224 kB、/lesson/[lessonNo] 223 → 229 kB、/gacha 206 → 212 kB、/test/[assessmentId] 206 → 212 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド26 の 問題の コードと 表（セリフ・文の まちがいを 手で 書いた ぶん、ワールド25 より 少し 多い）と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 38`: No.38（L741〜760・62 ページ）を 作れることを 確認（… も ふつうに 出る）。`--pack 39`（L761〜780・62 ページ）も 作れて、セリフの くとうてんの " ! , も そのまま 出る ことを 確認

## WORLD — ワールド27「いずみの里」（L781〜810・ステージ3・A2+）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-27.json` を 新しく 作成（30 レッスン、ステージ3・A2+、`school.grade` は「中3」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 810 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 126、会話の セリフ 186 行（1 回 6〜7 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 206 語・最少 181 語・最大 229 語）で、まいかい「読みもの」（いずみの里の かんばん・つかれた ときの カード・やたいの メニュー・ファーン先生の メモ・おみまいカード・あさの たいそうの ポスター・やどの きまり・アンケートの ひょう・いずみ しんぶんの コラムと おなやみの てがみ・800 かい きねんの ポスター・こころの ポスター・おちつく プラン・1しゅうかんの プラン・クイズカード・アドバイスの てがみ・フェスティバルの プログラム など 45〜60 語）を いっしょに 読む。日本語の ヒントは 2 回だけ（L784「fever（ねつ）」・L802「breathe（いきを する）」）。
- ブロック構成: 781〜785 たいちょう（The spring water here is warm.・What's wrong? / I have a headache.・My stomach hurts. I ate too much.・How long have you had a fever? / Since yesterday.・I hope you feel better soon.）→ 786〜790 しゅうかん（How often do you exercise? / Three times a week.・I usually go to bed at nine.・Eating breakfast is good for your brain.・I play video games for one hour a day.・Five people eat breakfast every day.）→ 791〜795 現在完了（継続）（I've lived here for ten years.・I've played the piano since I was five.・How long have you known Riko?・We've been here since Monday.・I've practiced karate for three years.）→ 796〜800 アドバイス（You should drink more water.・You shouldn't skip breakfast.・Why don't you take a break?・Dear Birimo, I can't sleep well. What should I do?・L800 I think you should go to bed early because sleep is important.）→ 801〜805 こころの ケア（When I'm worried, I talk to my mom.・Take a deep breath. Count to five.・It's OK to feel sad sometimes.・You did your best. I'm proud of you.・When I'm angry, I count to ten.）→ 806〜810 けいかく・クイズ・てがみ（On Monday, I'm going to walk to school.・How many hours should children sleep? / Nine to twelve hours.・Dear friend, you should try a morning walk.・We've been here for two weeks, and I feel great!・L810 Healthy body, happy mind!）。
- 物語の 糸: L780 の フートさんの はなしの とおり、やまみちを くだって わき水の「いずみの里」へ（L781）。里の やど「いずみの やど」の カピーおばあちゃん（カピバラ・10ねん まえに うみべから きた）、しんりょうじょの ファーン先生（シカ）、里の 子 トト（ニホンザル）、里の しんぶん「いずみ しんぶん」（台本と、ビリモや キコが やくを する セリフの なかだけ）。里の あいことばは「Warm water, warm hearts.」。ながたびで つかれた キコ（L782）→ やたいで たべすぎた ビリモ（L783）→ ねつを だした ハルが しんりょうじょへ（L784）→ みんなで おみまいカード（L785）→ トトと あさの たいそう（L786）→ ハルは 水曜日から げんきに（L794）→ さかみちで みずと ぼうし（L796）・あさごはんを ぬいた ハル（L797）・べんきょうしすぎの リコ（L798）→ いずみ しんぶんの おなやみコーナー「Ask Birimo!」（L799）→ 800 かい きねんの アドバイス ショー（L800）→ フェスティバルの スピーチが しんぱいな キコ（L801〜802・804）、ともだちの ミミが ひっこして かなしい トト（L803）→ L809 の さよなら さんぽで ハートの いずみの ゆげに にじ。カピーおばあちゃんの「にじを たどって。とおくの ともだちへの はしだよ」→ L810 健康フェスティバルの あと、にじを たどって ワールド28「にじの架け橋（Rainbow Bridge）」へ。
- フォニックス（`src/lib/curriculum/w27Phonics.ts`・`questions.ts` の `w27Question`。w26Question より 先に よぶ）:
  - k の おとの ch と -ache（rule "ch-k"。focus "ch" "-ache"）: 「ただしい つづりは どれ？」（🔊（ずつう）→ headache / headake / hedache、stomach / stomack / stomac。echo・school・chorus・character・orchestra・Christmas・anchor・mechanic と、からだの ばしょ ＋ ache の 6 こ）
  - だまって いる もじ（rule "silent"。focus は その もじ "k" "w" "b" "c" "h" "l" "t"）: 「こえに ださない もじは どれ？」（knee（ひざ）→ k / n / e。knee・wrist・answer・thumb・climb・hour・honest・should・muscle・calf・palm・walk・talk・half・salmon・listen。hour・honest は「an hour」と いっしょに せつめい）
  - for と since の リズム（rule "for-since"。focus "for" "since"。ことばは フレーズ "for ten years" "since I was five"）: 「＿＿ に 入る ことばは どれ？」（I've lived here ＿＿ ten years.（10ねん まえから ずっと）→ for / since / from。選択肢は きまった 順。for は よわく みじかく、ten years を つよく と リズムも せつめい。from は I've ～ の 文では つかわない）
  - -able（rule "able"）: 「able の ことばで ただしい つづりは どれ？」（comfort → comfortable / comfortible / comfortabel。わなは ible と、e を とる（valuable・believable・adorable）・y を i に（reliable）・e を のこす（changeable・noticeable）・t を かさねる（unforgettable）の 5しゅるい）
  - 同音異義語 2（rule "homophones"。focus は ことば そのもの）: 「ぶんに あう ことばは どれ？」（I have a cold. I feel ＿＿. → weak / week / wake。week / weak・here / hear・piece / peace・nose / knows・flour / flower・whole / hole・right / write・pair / pear。いつも ペアで おなじ 回に ならべる）
- フォーカスの ボタン（`phonicsButtons.ts` の `w27Example`）と 読み上げ（`vowelTeams.ts` の `w27Say`）は その focus で 問う ことば・フレーズを よむ（"ch" を chip、"l" を lion、"-able" を「エイブル」だけで よまない）。どちらも L780 までの どの 回でも はたらかない ことを テストで たしかめる（まえの ワールドの 回には かならず 表に ない ことば（knife・lamb・there など）が まじる）。
- テスト: `tests/curriculum.test.ts` に ワールド27 の 決まりごと（範囲・ステージ3・A2+・中3・タイトル 30・フォニックスの 順と 種類・-able の 5つの きまり・同音異義語の ペア・ふりかえりは 5つの きまりを ぜんぶ・core の 表現・現在完了の for / since は L791 から（L784 の How long have you had a fever? だけ 先に）・How often は L786 から・Why don't you は L798 から・関係代名詞なし・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行・話し手は 5 人だけ・AI 会話で 個人情報を きかない・すいみんは 9〜12 じかん・くすりの りょうは 出さない・L810 スピード TPR・物語）を 追加。`tests/phonics-w27.test.ts`（12 テスト）を 追加。

### 決めたこと（理由）
- **フォニックスの ブロックの 順を 計画から 入れかえた**: 計画は B1 黙字 → B2 -ache → B3 for / since → B4 -able → B5 同音異義語 だが、781〜784 は たいちょうの 回（headache・stomach）なので B1 を「k の おとの ch と -ache」に まとめ、からだを うごかす 786〜789（knee・wrist・muscle）を 黙字に した。-able は さんぽ・てがみの 796〜799（comfortable shoes・drinkable water）、同音異義語は こころの 801〜804（I'm here for you・I hear you・peace）に あわせた。
- **黙字の ことばは ワールド14（kn / wr / mb の ＿ うめ）と かさなりすぎない ように** kneel・knit・wrap・comb を やめて should・answer・hour・honest を 入れ、問いかたも「こえに ださない もじは どれ？」と べつの 角度に した。
- **同音異義語の focus は ことば そのもの**: さいしょは "week / weak" に したが、全体の テスト「フォニックスの ことばは その回の focus（つづり）を ふくむ」に あわないので、ワールド25 の にた いみの ことばと おなじく ことば そのもの（"week" "weak"）に した。ペアは 表の `pair` で もつ。ワールド17 の 同音異義語（see / sea・here / hear など）とは 表を わけ、here / hear は 計画どおり 入れて ワールド27 の 文で 問う。
- **core の 表現には ― ・ ～ を 入れない**: L782 は core「What's wrong?」、こたえ「I have a headache. ― That's too bad.」を 2つめに。L784・L786・L807 も 計画の 2文を core と 2つめに わけた。L800 の「I think you should ～ because ～.」は「I think you should go to bed early because sleep is important.」、L805 は「When I'm angry, I count to ten.」、L808 は「Dear friend, you should try a morning walk.」、L809 は「We've been here for two weeks, and I feel great!」に した。
- **文法の じゅんばん**: 現在完了（継続）は L791 から。L784 の「How long have you had a fever? / Since yesterday.」だけは しんりょうじょの きまり文句として 先に 出す（台本で Haru has had a fever since yesterday. も 1 回）。How often は L786 から、Why don't you は L798 から（テストで まもる）。関係代名詞（ステージ4）は 出さない。
- **学年の めやす**: 計画は「中3 修了〜高校初級」だが、保護者向けの 表（§6）では L780 で 中3 修了、高校初級は L1050 なので、ワールド26 と おなじ「中3」に した。
- **けんこうの ないよう**: すいみんは 小学生の めやす「9〜12 じかん」、ぐあいが わるい ときは おとなに いう・おいしゃさんに みて もらう・みず・やすむ・ねる まで。くすりの なまえや りょうは 出さない（テストで まもる）。スクリーン タイムは せめずに「バランス」と「やすむ」。きもちの 回は「どんな きもちも OK」「おとなや ともだちに はなす」「しんこきゅう」。AI 会話は なまえ・すんで いる ところを きかない。
- **新しい 話し手は 増やさない**: カピーおばあちゃん・ファーン先生・トト・ミミ・スリーピー・スクワレル（おなやみの てがみ）は 台本の なかか、ビリモ・キコが「I'm playing Granny Capy!」と やくを する。会社名・商品名は 出さない。
- **作りかた**: おなじ 下書きの きまり（物語・core・フォニックスの ことば・文法の じゅんばん）を 書いて、30 レッスンを 3つの まとまり（781〜790・791〜800・801〜810）で 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: 日本語の よびかた（カピおばあちゃん → カピーおばあちゃん、いずみの さと → いずみの里 に そろえる）、L789 の リコの「いぬと あそぶ」（まえの ワールドに ない せってい なので「なわとびを する」に）、L798 の ten minute → ten-minute、L810 の さいごの 一言（2しゅうかん いたので unforgettable week → unforgettable stay）。

### 例（L802「Deep Breaths」）
- 表現（core）: Take a deep breath. Count to five. ／ Breathe in through your nose. ／ Breathe out slowly. ― I feel calm now.
- 読みもの（台本より）: "Heart Spring Calm Corner. Sit down on the warm stones and close your eyes. Breathe in through your nose and count to five. Then breathe out slowly through your mouth. Do this three times. Listen to the sound of the water. Feel the warm steam on your face. Now you are ready for a calm and happy day."
- 会話: Kiko「My heart is beating so fast. I'm nervous about my speech.」 Ms. Emma「Take a deep breath. Count to five.」 … Kiko「Ahh… I feel calm now. Thank you.」 Birimo「Me too! But my nose smells cake. Breathe in… cake!」
- フォニックス: piece / peace / nose / knows（問題は「ぶんに あう ことばは どれ？」Breathe in through your ＿＿. → nose / knows / news）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 61 ファイル・1,868 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 224 → 228 kB、/lesson/[lessonNo] 229 → 233 kB、/gacha 212 → 217 kB、/test/[assessmentId] 212 → 216 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド27 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 40`: No.40（L781〜800・62 ページ）を 作れることを 確認。`--pack 41`（L801〜820）は ワールド27 の 10 レッスンぶん（32 ページ）まで 作れる（のこりは ワールド28 が できてから）

## WORLD — ワールド28「にじの架け橋」（L811〜840・ステージ3・A2+・ステージ3 の 総まとめ）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-28.json` を 新しく 作成（30 レッスン、ステージ3・A2+、`school.grade` は「中3」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 840 レッスン。ステージ3 が そろった）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 127、会話の セリフ 197 行（1 回 6〜7 行、L826 の ビデオ通話だけ 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 212 語・最少 189 語・最大 252 語）で、まいかい「読みもの」（はしの かんばん・文化くらべ表・おにぎりの せつめい・ふろしきの つかいかた・きせつの カレンダー・日本しょうかいビデオの 台本・意見カード・きゅうしょくの こんだて・ビデオ通話の マナーカード・おりづるに そえた カード・おわかれの カード・てがみ・しつもんリスト・日本しょうかい文 など 45〜61 語）を いっしょに 読む。日本語の ヒントは 2 回だけ（L814「differently（ちがう やりかたで）」・L822「opinion（いけん）」）。
- ブロック構成: 811〜815 おなじ？ ちがう？（This bridge connects many countries.・In Japan, we take off our shoes at home.・How about in your country?・That's interesting! We do it differently.・In both countries, people celebrate New Year.）→ 816〜820 日本を せつめいする（Onigiri is a kind of rice ball.・A furoshiki is used for wrapping things.・You can see cherry blossoms in spring.・Let me tell you about my town.・Welcome to Japan! Let me show you around.）→ 821〜825 意見（I think summer is the best season because we can swim in the sea.・In my opinion, school lunch is great.・Do you agree? / Yes, I agree. / I'm not sure.・First, it's fun. Second, it's good for our health.・Opinion Corner）→ 826〜830 ビデオ通話・おくりもの・ステージ3 の ふりかえり（It's nice to finally see you!・I've made this for you. It's a paper crane.・First, we found a clue. Suddenly, we heard a noise. It must be a bird!・Have you ever made sushi?・It's made of paper. You should try it!）→ 831〜835 ふりかえりと スピーチ（I've traveled to many places.・I can make phone calls in English now.・Friends can be different, but we can learn from each other.・Speak clearly. Smile at the audience.・Welcome to the friendship festival!）→ 836〜840 かく・フィナーレ（Dear friend, thank you for sharing your culture with me.・What do children in your country do for fun?・Japan has four seasons.・Mochi is a kind of rice cake. I think you'll love it because it's soft and sweet.・L840 Our languages are different, but our hearts are the same.）。
- 物語の 糸: L810 の にじを たどって 雲の 上の「にじの架け橋（Rainbow Bridge）」へ（L811）。はしの まもりびとは しろい ツルの アイリス。まんなかの「ともだち広場（Friendship Plaza）」で フィンランドの アイノ・ケニアの アマラ・メキシコの マテオと 会う（L812。台本と、ビリモが「I'm playing Aino!」と やくを する セリフの なかだけ。ビリモは つうやく やく）。たずねる ともだちが へって はしの いろが うすく なって いて、ぶんかと やさしい ことばを わけあう たびに 1 色ずつ もどる（赤 L815・オレンジ L820・黄 L825・緑 L830・青と あい L835・むらさき L840）。L826 で ワールド21 の ペンパル レオと はじめての ビデオ通話、L827 で おりづるを プレゼント（ツルの アイリスが わらう）、L828 で アイノの マフラーの なぞとき（ことりの ベッドに なって いた）、L831 で ステージ3 の たびを ちずで ふりかえり、L835 の ゆうじょうフェスティバルで キコが スピーチ。L839 の さよなら さんぽで ビリモが とおくの とうだいの ひかりを 見つけ、L840 で 7 色 ぜんぶが かがやいて ステージ3 が おわり、つぎは「かんがえる灯台（Lighthouse of Ideas）」へ。
- フォニックス（`src/lib/curriculum/w28Phonics.ts`・`questions.ts` の `w28Question`。w27Question より 先に よぶ）:
  - カタカナ語と 英語の おと（rule "katakana"。focus は はくの 形 "en-er-gy"、sounds は つよい はく "EN"）: 「英語で いうと、つよく よむ ところは どれ？」（energy（エネルギー）→ EN-er-gy / en-ER-gy / en-er-GY。選択肢は きまった 順。energy・allergy・vitamin・hamburger・camera・video・radio・calendar・idea・piano・museum・volunteer・vanilla・pajamas・spaghetti・macaroni。せつめいで カタカナと 英語の よみの めやす（エネルギー → エナジー）を くらべる）
  - 英語に なった 日本語（rule "japanese-loan"。focus は ことば そのもの）: 「英語に なった 日本語。英語の つづりは どれ？」（🔊（つなみ）→ tsunami / tunami / sunami。わなは 訓令式の ローマ字（susi・tohu・zyudo）・p の まえの ん（tenpura）・のばす おと（bentou・juudou）。sushi・tofu・tempura・bento・origami・futon・kimono・emoji・haiku・karaoke・tsunami・samurai・judo・manga・anime・ninja）
  - 英語の リズム（rule "rhythm"。focus は よわく いう ことば "to" "of" "and" など。ことばは 文 "I want to swim in the sea"）: 「ふつうに いう とき、よわく みじかく いう ことばは どれ？」（to / swim / sea。and・to・for・can・of・at・or・was・are・them の 16 文）
  - 音の つながりの まとめ（rule "linking"。focus は フレーズ そのもの）: 「つなげて いうと どう きこえる？」（meet you → ミーチュー / ミート・ユー / …。ぼいんと つながる（a kind of・made of・put it on・keep in touch・take off・all over）・おなじ おとは 1 かい（bus stop・take care・good day・hot tea・this summer）・t / d ＋ you（meet you・could you・would you・did you・don't you）の 3 しゅるい。ワールド21 の フレーズとは かさならない）
  - ことばの パーツの まとめ（rule "word-parts"。focus は "dis-" "un-" "-ful" "-ness" "-ment"）: 「パーツを くっつけた ことばで ただしい つづりは どれ？」（un ＋ happy ＋ ness → unhappiness / unhappyness / unhapiness。わなは y → i・e を のこす（peaceful・excitement）・e を とる（argument）・おなじ もじが ならぶ（unnatural・openness）・1つだけ（disappear・helpful）。ふりかえりでは パーツ 3つの ことば（disagreement・thankfulness・unhelpful・unhappiness・disrespectful・unkindness）も 出す）
- フォーカスの ボタン（`phonicsButtons.ts` の `w28Example`）と 読み上げ（`vowelTeams.ts` の `w28Say`）は その focus で 問う ことば・文・フレーズを よむ（"to" や "dis-" だけで よまない）。どちらも L810 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド28 の 決まりごと（範囲・ステージ3・A2+・中3・タイトル 30・フォニックスの 順と 種類・カタカナ語の sounds は つよい はく・音の つながり 3 しゅるい・パーツ 5 つ・ふりかえり L836〜840 は 5 つの きまりを ぜんぶ・core の 表現・is a kind of は L816 から・used for は L817 から・In my opinion は L822 から・Do you agree は L823 から・関係代名詞なし・先生の台本は 英語だけで 150 語 以上＋読みもの・会話 5〜7 行（L826 は 8 行）・話し手は 5 人だけ・AI 会話で 個人情報を きかない・L840 スピード TPR・物語）を 追加。`tests/phonics-w28.test.ts`（12 テスト）を 追加。

### 決めたこと（理由）
- **フォニックスの ブロックは 計画どおりの 順**（B1 カタカナ語 → B2 英語に なった 日本語 → B3 リズム → B4 音の つながり → B5 パーツ → B6 ふりかえり）。それぞれの 回の テーマと あう（日本を せつめいする 816〜819 に 日本語の ことば、意見の 821〜824 に 文の リズム、ビデオ通話の 826 に could you / did you）。
- **カタカナ語は ワールド18・24 と かさならない ことば**（banana・tomato・Canada などは つかわない）に して、問いも「カタカナとの ちがい」を せつめいに 入れた。3 はく 以上の ことばだけに して、選択肢が かならず 3 つ 以上に なる ように した。
- **リズムの 文は 記号なし**（"Can I ask a question" の ように ? や , を つけない）。フォーカスの ボタンで よむ おてほんは「英字と スペース、' は さいしょの ことばだけ」と いう 全体の きまりが あるので、"I think so, but I'm not sure" は やめて "Are your reasons the same" に した。選択肢には よわい ことばを 1 つだけ 入れる（のこり 2 つは いみの だいじな ことば）。
- **ワールド21 の 回の 読み上げを かえない**: パーツの 表に agreement を 入れると L620（agreement・excitement・kindness・happiness）の ことばが ぜんぶ ワールド28 の 表に 入って しまうので、agreement を amazement に かえた。
- **学年の めやす**: 計画は「高校初級」だが、保護者向けの 表（§6）では 高校初級は L1050 なので、ワールド26・27 と おなじ「中3」に した。
- **ほかの 国の はなしは「In my family, ～」「At my school, ～」か ほんとうの こと だけ**（フィンランドは 7 さいから がっこう・きゅうしょくは むりょう、ケニアは 1 がつ はじまり・Jambo、メキシコは 8 がつ おわりに はじまる・ピニャータ）。ひとくくりに しない ように アイリスの「Every family is different.」を くりかえす。つなみは「うみから くる とても おおきな なみ」だけで こわがらせない。
- **新しい 話し手は 増やさない**: アイリス・アイノ・アマラ・マテオ・レオは 台本の なかか、ビリモが やくを する か、「Aino says, ～」と つたえる。アイノの なまえは ワールド22 の 作家 Nora Bell と かぶらない ように えらんだ。会社名・商品名は 出さない。ビデオ通話と てがみでは じゅうしょ・がっこうの なまえを 出さない ことを くりかえす。
- **作りかた**: 下書きの きまり（物語・core・フォニックスの ことば・文法の じゅんばん）を 書いて、30 レッスンを 3 つの まとまり（811〜820・821〜830・831〜840）で 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: L839 の「It's used for celebrating New Year.」（たべものに used for は 不自然 → We eat it to celebrate New Year.）、L836 の ビリモの てがみ（マテオに もらって いない タコス → ピニャータの ゲーム）、L829 の「How long have you played it?」（since I was six の すぐ あとで くりかえしに なるので → Do you play every day?）。

### 例（L827「A Gift from Japan」）
- 表現（core）: I've made this for you. It's a paper crane. ／ It's made of paper. In Japan, cranes mean long life. ／ Thank you! I'll keep it forever.
- 読みもの（台本より）: "To Aino, Amara, and Mateo. These are paper cranes. They are a kind of origami. We made them from one square of paper. No scissors and no glue! In Japan, people sometimes fold one thousand cranes for a wish. Our wish is easy. Please keep in touch! From Kiko and friends."
- 会話: Kiko「Amara, I've made this for you. It's a paper crane.」 Birimo「I'm playing Amara! Wow, it's so cute! What is it made of?」 … Haru「Look! Iris is laughing. She's a crane, too!」 Ms. Emma「What a kind gift. Let's keep in touch with our friends.」
- フォニックス: a kind of / made of / put it on / keep in touch（問題は「つなげて いうと どう きこえる？」made of（〜で できて いる）→ メイダヴ / メイド・オブ / …）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 62 ファイル・1,918 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 228 → 233 kB、/lesson/[lessonNo] 233 → 238 kB、/gacha 217 → 221 kB、/test/[assessmentId] 216 → 221 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド28 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 41`: No.41（L801〜820・62 ページ）、`--pack 42`（L821〜840・63 ページ）を 作れる ことを 確認（piñata の ñ も そのまま 出る）

## WORLD — ワールド29「かんがえる灯台」（L841〜870・ステージ4 の はじまり・B1）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-29.json` を 新しく 作成（30 レッスン、ステージ4・`level` は B1（`stages.ts` の ワールド29 の 値）、`school.grade` は「高校初級」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 870 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 120、会話の セリフ 203 行（1 回 6〜7 行、L860 の インタビューだけ 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 305 語・最少 281 語・最大 325 語）で、まいかい「読みもの」（灯台の かんばん・ログ・本の ポスター・ガスと ゲイルの 2つの 意見・会議の きまり・投票の けっか・インタビューカード・灯台新聞の 記事・こうこく・事実チェックの レポート・60 語の 意見文の おてほん など 64〜93 語）を 読み、L861 から 毎回「Is this a fact or an opinion?」の 問いを 入れた。日本語の ヒントは 2 回だけ（L842「loyal（ちゅうじつ）」・L861「fact（じじつ）」）。
- ブロック構成: 841〜845 意見＋理由＋例（This light shines when people share ideas.・I think dogs are great pets because they're loyal.・For example, ～.・One reason is ～. Another reason is ～.・まとめで レンズ 1）→ 846〜850 賛成と 反対（I agree with you.・I see your point, but ～.・I'm not sure about that.・I partly agree.・I disagree because ～.・レンズ 2）→ 851〜855 話し合いの 司会（What do you think, Kiko?・Let's hear from everyone.・Can I say something? / Sure, go ahead.・Let's vote.・クラス会議ごっこ・レンズ 3）→ 856〜860 たしかめる（What do you mean by "cool"?・So you mean ～?・Could you give me an example?・That's a good question. Let me think.・追加質問の インタビュー・レンズ 4）→ 861〜865 事実と 意見（"Cats sleep a lot" is a fact.・It's just my opinion, but ～.・Is that true? Where did you read that?・こうこくの ことば・Fact Check Team・レンズ 5）→ 866〜870 ミニ話し合いと まとめ（週末の しゅくだい・クラスの ペット・意見文 60 語・さよなら見学・L870 話し合いショーで レンズ 6）。
- 物語の 糸: L840 で 見えた 灯台の ひかりを たどって、雲の 海の 岩の 島に たつ「かんがえる灯台」へ（L841）。灯台守は ペリカンの ペル船長（Captain Pell）と 年よりの いぬ アンカー（Anchor）。みんなが 言いあらそうか だまって しまって ひかりが よわく、小さな ふねが 帰れない。ランプの まわりの 6 つの レンズが ブロックの まとめごとに 1 つずつ ひかる。L847〜850 は いつも けんかする カモメの きょうだい ガスと ゲイル（山 か 海 か）が「I see your point, but ～.」で やさしく 話せる ように なる。851〜860 は 島の おまつりの じゅんび（ちょうちん・たべもの・かざり・ピクニックの 場所の 投票）と 霧の 前の 日、おまつりの 夜、インタビュー（ペル船長は 40 年 灯台守）。861〜865 は パフィンの 記者 ピップ（Pip）の「The Lighthouse News」の へやで 事実と 意見を わける（「灯台の 下に 大きな ケーキ」の うわさは じつは lake、こうこくの おもちゃ「The Spinning Star」、灯台の かいだんは 99 だん）。L870 で ペル船長への プレゼント（アンカーの え）を 投票で きめ、6 つの レンズが ぜんぶ ひかり、ひかりの 先に「みらい都市（City of Tomorrow）」が 見える。
- フォニックス（`src/lib/curriculum/w29Phonics.ts`・`questions.ts` の `w29Question`。w28Question より 先に よぶ）:
  - 語根 spect（rule "root-spect"。focus "spect"）: 「spect（みる）の ことば。いみは どれ？」（inspect（in ＋ spect）→ よく 見て しらべる / 大切に おもう・そんけいする / あやしいと おもう。答えも 選択肢も いみ。まちがいは 表に 手で 書いた ほかの spect の ことばの いみ）。respect・inspect・spectator・suspect・inspector・respectful・spectacular・perspective・inspection・disrespect・spectrum・spectacles・aspect・respectable の 14 語。
  - 語根 dict（rule "root-dict"。focus "dict"）: 「ぶんに あう dict の ことばは どれ？」（Can you ＿＿ the weather for tomorrow? → predict / contradict / dictate）。predict・dictionary・contradict・prediction・dictation・verdict・predictable・unpredictable・dictate・contradiction・dictionaries・predicted の 12 語。
  - 意見を 強める 強勢（rule "emphasis"。focus は つよく いう ことば "really" "do" など、sounds は その 大文字）: 「いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？」（I really think so → really / think / so）。16 文。
  - 弱形（rule "weak-form"。focus "can" "to" "for" "and"）: 「ふつうの はやさで いうと、can は どう きこえる？」（クン / キャン / カーン。選択肢は きまった 順）。16 文。
  - -ible・-able（rule "ible-able"。focus "-ible" "-able"）: 「ただしい つづりは どれ？」（🔊（ありうる・できる）→ possible / possable / posible）。ible 8 語・able 8 語（ワールド27 の -able の ことばとは べつ）。
- フォーカスの ボタン（`phonicsButtons.ts` の `w29Example`）と 読み上げ（`vowelTeams.ts` の `w29Say`）は その focus で 問う ことば・文を よむ（"spect" "can" "-ible" だけで よまない）。L840 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド29 の 決まりごと（範囲・ステージ4・B1・高校初級・タイトル 30・フォニックスの 順と 種類・強勢の sounds・弱形 4 つ・-ible / -able 2 つずつ・ふりかえり L866〜870 は 5 つの きまりを ぜんぶ・core の 表現・For example は L843 から〜Where did you read that は L863 から の 17 の じゅんばん・関係代名詞なし・台本は 英語だけで 200 語 以上＋読みもの・会話 6〜7 行（L860 は 8 行）・日本語の ヒントは L842 と L861 だけ・AI 会話で 個人情報を きかない・L870 スピード TPR・物語）を 追加。`tests/phonics-w29.test.ts`（12 テスト）を 追加。

### 決めたこと（理由）
- **学年の めやすは「高校初級」**: ワールド26〜28 は「中3」に したが、ステージ4 は 計画書 §9 で「高校初級」と して いて、§6 の「L1050 で 高校初級の 会話レベル」は ワールド27〜35 の 範囲の おわりを さす。ワールド29 からは 中身が 高校初級の 文法・話題に なるので「高校初級」に した。
- **フォニックスの 問いは 5 しゅるいとも ちがう 角度に**: spect は いみ（語根の いみから ことばの いみを そうぞうする）、dict は 文に 入れる（つかいかた）、強勢と 弱形は 文、-ible / -able は つづり。ワールド28 の リズム（どの ことばが よわい？）と かさならない ように、弱形は「よわい ときに どう きこえるか」を 問う。
- **spect の ことばは つづりに spect が ある ものだけ**: expect・expectation・unexpected は ex ＋ pect で つづりに spect が ない（全体の テスト「フォニックスの ことばは focus を ふくむ」に あわない）ので 入れなかった。dict も 12 語なので L846〜849 と L843〜844 は 1 回 3 語。
- **can't は 入れない**: フォーカスの ボタンの おてほんは「' は さいしょの ことばだけ」と いう 全体の きまりが あるので、I can't ～ の 文は つかわず can の よわい おとだけに した。
- **文法の じゅんばん**: 計画の 表現は その 回から（テストで まもる）。関係代名詞は ワールド30 から なので 出さない。One reason is that ～ の that（接続詞）は つかう。
- **台本の ながさと 読みもの**: ステージ4 の「読む: 毎回 150〜300 語」は 1 回 15〜20 分の レッスンに 入りきらないので、台本 全体を 約 300 語（ステージ3 より 約 90 語 ふやした）、その なかの 読みものを 64〜93 語に した。長い 読みものは としょかんで おぎなう。
- **話し合いは どちらかを ただしいと しない**: 山 か 海 か・しゅくだい・クラスの ペットは「Both ideas are good.」で まとめ、ペットの 回は「まいにちの せわ（休みの 日も）」と いう 事実を 出して かんがえる。こうこくの おもちゃは 架空（The Spinning Star、ねだんは かいがら）で、会社名・商品名は 出さない。
- **新しい 話し手は 増やさない**: ペル船長・アンカー・ガス・ゲイル・ピップは 台本の なかか、ビリモが「I'm playing Captain Pell!」と やくを するか、「Gale says, ～」と つたえる。登場人物に ペットは いない（L843 の「my dog」は ペル船長の アンカー）。
- **作りかた**: 下書きの きまり（物語・core・フォニックスの ことば・文法の じゅんばん）を 書いて、30 レッスンを 3 つの まとまり（841〜850・851〜860・861〜870）で 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: L855 の AI の さいしょの ことば（Today's topic is your school trip → our school trip。your school は 個人情報の テストに かかる うえ、core と そろえる）、L857 の 会話の おわり（リコの「Not at five, right? So you mean ～?」が かみあわないので「So you mean we should get up at five?」→ ハル「Not quite. I mean we should finish before lunch.」に）。

### 例（L847「I See Your Point, But…」）
- 表現（core）: I see your point, but I think the beach is more fun. ／ I think the mountains are more fun because we can hike. ／ Let's listen to each other.
- 読みもの（台本より）: "Gus: I think the mountains are more fun because we can hike and see beautiful views. The air is cool and fresh, too. Gale: I see your point, but I think the beach is more fun. We can swim, build sandcastles, and play in the waves. The sound of the sea is relaxing, and the sand feels warm under our feet. Captain Pell: Both ideas are good. Mountains and beaches are both special places. Thank you for writing kindly!"
- 会話: Birimo「I'm playing Gus! The mountains are more fun! The mountains!」 Haru「Gus, please say a reason.」 … Kiko「Gale says, I see your point, but I think the beach is more fun.」 Riko「That's a kind way to answer. Nobody is shouting now.」 Ms. Emma「Let's listen to each other. Both ideas are good.」
- フォニックス: prediction / dictation / verdict（問題は「ぶんに あう dict の ことばは どれ？」My ＿＿ was right. It rained! → prediction / dictation / contradiction）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 63 ファイル・1,968 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 233 → 237 kB、/lesson/[lessonNo] 238 → 242 kB、/gacha 221 → 225 kB、/test/[assessmentId] 221 → 225 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド29 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 43`: No.43（L841〜860・63 ページ）、`--pack 44`（L861〜880）は ワールド29 の 10 レッスンぶん（32 ページ）まで 作れる ことを 確認

## WORLD — ワールド30「みらい都市」（L871〜900・ステージ4・B1）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-30.json` を 新しく 作成（30 レッスン、ステージ4・`level` は B1、`school.grade` は「高校初級」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 900 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 123、会話の セリフ 207 行（1 回 6〜7 行、L885 の プレゼンと L900 は 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 287 語・最少 271 語・最大 312 語）で、まいかい「読みもの」（まちの 案内板・バスの 案内・ツアーカード・しごとの カード・テスの ノート・アイデアボード・設計カード・テストの きろく・プレゼンの げんこう・ロボットの よい点と しんぱいな点の 表・画面の ルール・ネットの やくそく・AI の つかいかた・未来の 予想・The Tomorrow Times の 記事・80 語の 企画書の おてほん など 63〜84 語）を 読み、ほとんどの 回で「Is this a fact or an opinion?」を きく。日本語の ヒントは 2 回だけ（L872「a robot that cleans（そうじする ロボット）」・L888「post（とうこうする）」）。
- ブロック構成: 871〜875 みらいの まち（Cars fly and robots work here.・関係代名詞 that は L872 から・自動運転バス・which は L874 から（It's a building which makes energy from the sun.）・ツアーガイド）→ 876〜880 しごと（who は L876 から: She's a person who designs games.・Doctors are people who help sick people.・子ども発明家・Who Am I? クイズ・In the future, there will be people who ～.）→ 881〜885 発明（The problem is that ～.・My idea is a bag that follows you.・It uses sensors to find you.・It didn't work well, so we changed the design.・発明プレゼン）→ 886〜890 テクノロジーと くらし（One good point is ～. One problem is ～.・画面と やすみ・Think before you post.・AI can help us, but we should check the answers.・However, で はなしあい）→ 891〜895 未来の 予想（will probably・might・My future home will have ～.・If we use clean energy, ～.・未来都市の 計画）→ 896〜900 まとめ（gonna / wanna・記事を よむ・企画書・さよならツアー・L900 発明博覧会）。
- 物語の 糸: L870 の 灯台の ひかりの 先の「みらい都市」に とうちゃく（L871）。案内役は 小さな まるい ロボットの ノバ（Nova）。ノバに もらった「Expo Pass」の 6 つの ほしの バッジが ブロックの まとめごとに 1 つずつ ひかる（875・880・885・890・895・900）。そうじロボット（Street Helper Number Seven）、自動運転の Sky Line Bus（ねこの ために とまる）、太陽と 風の Sun Tower、ソーラーツリーの 公園と アヒルの子の ツアー、ゲームを つくる キツネの リンさん、11 さいの 発明家 テス（Tess）と ロボット犬 スプロケット（Sprocket）。881〜885 は 坂道で おもい にもつを 運べない カメの シェルさん（Mr. Shell）の ために「Follow-Me Bag」を 考え、ためして（ねこに ついて いって しまう）、なおして、プレゼン。889 は AI が「クモの あしは 6 本」と まちがえ、本で たしかめる。897 は 木を うえる ロボット Rooty の 記事。899 で 広場の 下の 大きな とけいの ついた とびらを 見つけ、L900（900 回記念の 発明博覧会）で バッジが ぜんぶ ひかり、とびらが ひらいて「ときの回廊（Corridor of Time）」へ。
- フォニックス（`src/lib/curriculum/w30Phonics.ts`・`questions.ts` の `w30Question`。w29Question より 先に よぶ）:
  - auto-（rule "prefix-auto"。focus "auto-"）: 「auto（じぶんで）の ことば。いみに あう ことばは どれ？」（「（有名な 人が じぶんで かく）サイン」→ autograph / automobile / autopilot）。spect（ことば → いみ）と ぎゃくの むき（いみ → ことば）。14 語。
  - trans-（rule "prefix-trans"。focus "trans-"）: 「trans の あとに つづく パーツは どれ？」（trans ＋ ＿＿（はこぶ・ゆそうする）→ port / form / mit）。13 語。
  - -ic の 強勢（rule "ic-stress"。focus "-ic"）: 「-ic の ことば。どこを いちばん つよく いう？」（electric → e-LEC-tric / E-lec-tric / e-lec-TRIC）。-ic の すぐ まえの はくを つよく いう きまり。3 はく 以上の 16 語。
  - 略語の 読みかた（rule "abbreviation"。focus は その 略語）: 「なんと よむ？」（AI → エーアイ / アイ / エイ、km → キロメーターズ / ケーエム / クム）。1もじずつ（AI・USB・TV・PC・VR・LED・GPS・ID・DIY）・ことばとして（NASA・STEM）・たんい（km・cm・kg・mm）・かず（3D）の 4 しゅるい 16 こ。
  - くだけた 話しことば（rule "casual-speech"。focus "gonna" など）: 「gonna を ふつうの いいかたに すると？」（going to / gone to / go and）。gonna・wanna・gotta・kinda・lemme・gimme・dunno・outta の 8 つ、16 文。
- フォーカスの ボタン（`phonicsButtons.ts` の `w30Example`。いちばん 先に よぶ）と 読み上げ（`vowelTeams.ts` の `w30Say`）は その focus で 問う ことば・文を よむ。略語は 読みかたで よむ（km → kilometers、3D → three D、AI → A I）。L870 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド30 の 決まりごと（範囲・ステージ4・B1・高校初級・タイトル 30・フォニックスの 順と 種類・略語 4 しゅるい・話しことば 8 つ・ふりかえり L896〜900 は 5 つの きまりを ぜんぶ・core の 表現・関係代名詞 that / which / who の はじまり・One good point is / However, / will probably / If we use / Think before you post / 話しことば の じゅんばん・台本は 英語だけで 200 語 以上＋読みもの・日本語の ヒントは L872 と L888 だけ・AI 会話で 個人情報を きかない・L888 で 住所を 出さない・L900 スピード TPR・物語）を 追加。`tests/phonics-w30.test.ts`（12 テスト）を 追加。

### 決めたこと（理由）
- **フォニックスの 問いは 5 しゅるいとも ちがう 角度に**: auto- は いみ → ことば、trans- は パーツを くみあわせる、-ic は 強勢、略語は 読みかた、話しことばは ふつうの いいかたに なおす。ワールド29 の spect（ことば → いみ）・dict（文に 入れる）と かさならない。
- **automatic は auto- の 表だけ**: 計画では -ic の れいにも 入って いるが、1 つの ことばが 2 つの 表に あると focus が きまらないので、-ic の 回では electric・robotic など auto で はじまらない ことばを つかう（テストで w30FocusOf("automatic") は "auto-"）。
- **-ic は 3 はく 以上の ことばだけ**: plastic・magic の ような 2 はくの ことばは 選択肢が 2 つしか 作れないので 入れない。
- **略語の 選択肢は カタカナ**（ワールド29 の 弱形と おなじ）。大文字・小文字は 表の とおりに 見る（"ai" は 略語では ない）。会社名・商品名の 略語は つかわない。
- **話しことばは 891〜894 の フォニックスで 先に ならい、会話や 表現で つかうのは L896 から**（テストで まもる）。L896 で「ともだちとは gonna、かく ときや テストでは going to」と おしえる。
- **L881 の core は older people**: 計画は old people だが、ていねいな いいかたに した（L885 も おなじ）。
- **テクノロジーは よい点と しんぱいな点を かならず 両方**: ロボット（つかれない・でも こわれる・だきしめて くれない）、画面（べんり・でも やすみが ひつよう）、ネット（たのしい・でも 住所や 学校名を 出さない、へんだと おもったら おとなに）、AI（たすけて くれる・でも 答えを たしかめる・じぶんで かんがえる）。L877 の AI は しごとに 順番を つけない よう「very important」と きく。
- **新しい 話し手は 増やさない**: ノバ・テス・リンさん・シェルさんは 台本の なかか、ビリモが「I'm playing Nova!」と やくを するか、「Tess says, ～」と つたえる。
- **作りかた**: 下書きの きまり（物語・core・フォニックスの ことば・文法の じゅんばん）と チェックの スクリプトを 書き、30 レッスンを 3 つの まとまり（871〜880・881〜890・891〜900）で 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: L886 で ロボットの ノバが「We work at night」と じぶんを 人の がわに 入れて いた ところ（→ Robots can do hard jobs for you.）、L889 の「Spiders have eight legs is a fact」（→ Is it a fact that spiders have eight legs? Yes, it is.）、L899 の ミス・エマの さいごの セリフ（→ Maybe it will open at the Expo tomorrow. Let's bring our best ideas!）。

### 例（L882「An Idea That Helps」）
- 表現（core）: My idea is a bag that follows you. ／ Do you have any ideas? ― How about a robot arm? ／ That's a great idea! Let's draw it.
- 読みもの（台本より）: "Tess's Idea Board. Idea 1, from Haru: a robot arm that lifts heavy bags. It is strong, but it is very big. Idea 2, from Kiko: a moving sidewalk on Hill Street. It helps everyone, but it takes years to build. Idea 3, from Birimo: balloons that lift bags into the sky. It is fun, but windy days are dangerous. Idea 4, from Riko: a bag that follows you. It is small, and it can go anywhere."
- 会話: Ms. Emma「Do you have any ideas for Mr. Shell?」 Haru「How about a robot arm? It can lift heavy bags.」 Birimo「How about balloons? The bags can fly up the hill!」 Kiko「That's fun, but I think balloons are a problem on windy days.」 Riko「My idea is a bag that follows you. Mr. Shell doesn't have to carry it.」 …
- フォニックス: magnetic / electronic / energetic / futuristic（問題は「-ic の ことば。どこを いちばん つよく いう？」futuristic → fu-tur-IS-tic / FU-tur-is-tic / fu-tur-is-TIC）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 64 ファイル・2,018 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 237 → 241 kB、/lesson/[lessonNo] 242 → 247 kB、/gacha 225 → 230 kB、/test/[assessmentId] 225 → 229 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド30 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 44`: No.44（L861〜880・63 ページ）、`--pack 45`（L881〜900・63 ページ）を 作れる ことを 確認

## WORLD — ワールド31「ときの回廊」（L901〜930・ステージ4・B1）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-31.json` を 新しく 作成（30 レッスン、ステージ4・`level` は B1、`school.grade` は「高校初級」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 930 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 120、会話の セリフ 201 行（1 回 6〜7 行、L925 と L930 は 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 303 語・最少 282 語・最大 322 語）で、まいかい「読みもの」（Time Map・やどの 案内板・ハナの 手紙・おもちゃの 展示カード・お城の 案内・発明の 部屋・沈没船 Silver Wave の 話・土器の カード・ステラ・モスの 絵本・ウィロー・ヒルの 年表・時の劇場の 案内・鉄道の カード・まちの 年表・偉人の 部屋・Respect Cards・ヒーロー紹介文・インタビュー・伝記・クイズカード など 61〜123 語。L926 の 伝記が いちばん 長い）を 読む。日本語の ヒントは 2 回だけ（L902「used to（むかしは ～した）」・L906「was built（たてられた）」）。
- ブロック構成: 901〜905 むかしの くらし（used to は L902 から・There were no phones, so ～.・むかしと 今の くらべ）→ 906〜910 過去の 受け身（This castle was built about 400 years ago.・The light bulb was improved by many inventors.・was found・was made by・博物館ガイド）→ 911〜915 伝記（She was born in a small village. は L911 から・When she was ten, ～.・became・never gave up・一生を 5 文で）→ 916〜920 年表（First, ～ in 1900. Then, ～ in 1920.・過去完了の 入門 When we arrived, the show had already started. は L917 から・Before the train was built, ～.・What if ～? は L919 から・まちの 年表）→ 921〜925 世界を かえた 人（I respect her because ～. は L922 から・身近な ヒーロー・インタビュー・I'd like to talk about ～. は L925 から）→ 926〜930 まとめ（伝記を よむ・歴史クイズ・ヒーロー紹介文 80 語・さよなら散歩・L930 歴史フェスティバル）。
- 物語の 糸: L900 の 広場の 下の とびらから「ときの回廊」へ（L901）。案内役は あるく 大どけいの オールド・トック（Old Tock）。もらった「Time Map」の 6 つの あなに 金の ギアが ブロックの まとめごとに 1 つずつ はまる（905・910・915・920・925・930）。L911〜915 は 伝記の とびらの 絵本の 天文学者 ステラ・モス（1890 年 山の ちかくの 村で 生まれ、10 さいで めがねの レンズから 望遠鏡を つくり、図書館の 本で べんきょうし、1920 年に 天文学者、「女の子は 科学者に なれない」と いわれ 望遠鏡も こわれたが あきらめず、1931 年に すい星を 発見、のちに むりょうの 星の 学校）。L916 から ネズミの 歴史家 ニブ先生（Professor Nib）。L923・925 の ヒーローは ハルの おじいちゃん（40 年 自転車屋）・キコの おばあちゃん・リコの お母さん（看護師）・ビリモは オールド・トック。L930 で ギアが ぜんぶ ひかり、さいごの とびらの 先は「たいようの砂漠（Desert of the Sun）」。
- フォニックス（`src/lib/curriculum/w31Phonics.ts`・`questions.ts` の `w31Question`。w30Question より 先に よぶ）:
  - 動詞と 名詞の 家族（rule "word-family"。focus は 名詞の おわり "-tion" "-ation" "-ment" "-al" "-y"）: 「動詞を 名詞（もの・こと）に すると？」（invent（はつめいする）→ ＿＿ → invention / inventment / invental）。32 語。まちがいの 選択肢は どれも ない ことば。
  - 年号と 数の 読みかた（rule "year-reading"。focus は その ことば）: 「英語で なんと よむ？」（1868 → eighteen sixty-eight / one eight six eight / eighty-six eighteen）。2 けたずつ（1600・1868・1964・1850）・oh（1903・1801）・two thousand（2001・2008）・年代（the 1990s など）・世紀（the 21st century など）の 5 しゅるい 16 こ。
  - 語根 struct（rule "root-struct"）: 「struct の ことば。文に あう ことばは どれ？」（The ＿＿ of the castle took twenty years. → construction / construct / constructive）。12 語。おなじ 家族の なかで 品詞を えらぶ。
  - -ian・-ist（rule "person-ian-ist"）: 「〜を する 人は？」（music → ＿＿ → musician / musicist / musicer）。16 語。
  - 語根 port（rule "root-port"）: 「port の ことば。いみは どれ？」（export（ex ＝ そとへ ＋ port ＝ はこぶ）→ 外国へ 売る / 外国から 買い入れる / もちはこびが できる）。はこぶ と みなと の 2 つの いみ。12 語。
- フォーカスの ボタン（`phonicsButtons.ts` の `w31Example`）と 読み上げ（`vowelTeams.ts` の `w31Say`）は その focus で 問う ことばを よむ。年号は 英語の よみで よむ（ボタンは 英字と スペース だけの きまりなので 1868 → "eighteen sixty eight"）。L900 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド31 の 決まりごと（範囲・ステージ4・B1・高校初級・タイトル 30・フォニックスの 順と 種類・家族の 5 つの おわり・年号の 5 しゅるい・ふりかえり L926〜930 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（used to / 過去の 受け身 / was born / 過去完了 / What if / I respect / I'd like to talk about）・台本は 英語だけで 200 語 以上＋読みもの・日本語の ヒントは L902 と L906 だけ・AI 会話で 個人情報を きかない・まちと ヒーローの 回は goalJa に「ほんとうの なまえは いわなくて いい」・物語）を 追加。`tests/phonics-w31.test.ts`（12 テスト）を 追加。

### 決めたこと（理由）
- **フォニックスの 問いは 5 しゅるいとも ちがう 角度に**: 家族は 動詞 → 名詞、年号は 英語の よみ、struct は 文に あう 品詞、-ian / -ist は もとの ことば → 人、port は ことば → いみ。ワールド30 の auto-（いみ → ことば）・trans-（パーツ）と かさならない。
- **家族の まちがいの 選択肢は ない ことば だけ**: 「informal」は ほんとうに ある ことばなので information の 選択肢から はずした（informion に）。
- **port の 2 つの いみ**: airport・seaport・passport の port は「みなと」（ラテン語 portus）で、import・export の「はこぶ」（portare）と もとが ちがう。いっしょに 教えるが せつめいで 分ける。transport は ワールド30 の 表に あるので つかわない。
- **年号の 選択肢は 英語の よみ**（カタカナに しない）。2010 年 いこうは two thousand ten / twenty ten の 両方が ただしいので 出さない。
- **歴史の 事実は たしかな ものだけ**: ライト兄弟 1903 年（約 12 秒）・ベル 1876 年・日本の 鉄道 1872 年（新橋〜横浜）・東京オリンピック 1964 年・明治 1868 年・月面着陸 1969 年・マリー・キュリー・ヘレン・ケラーと アン・サリバン。お城・沈没船・まち（ウィロー・ヒル）は 架空。ステラ・モスは 架空の 人物で、L911 と L926 で「つくった おはなし」と ことわる。
- **むかしと 今は どちらも よい点**: 歩く 旅・手紙・木の おもちゃ・電気の ない 夜は、たいへんな 点と よい点を かならず 両方 出す。
- **新しい 話し手は 増やさない**: オールド・トック・ニブ先生・ステラ・モスは 台本の なかか、ビリモが「I'm playing ～!」と やくを する。
- **作りかた**: 下書きの きまり（物語・core・フォニックスの ことば・文法の じゅんばん・つかって よい 事実）と チェックの スクリプトを 書き、30 レッスンを 3 つの まとまり（901〜910・911〜920・921〜930）で 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: L910 の 会話で リコが 2 行 つづけて いた ところ（1 行に まとめた）、年号の ボタンの 読み上げ（sixty-eight の ハイフンが 全体の きまり「英字と スペース だけ」に あわないので sixty eight に）。

### 例（L922「I Respect Her Because…」）
- 表現（core）: I respect her because she helped many children. ／ Who do you respect? ― I respect Helen Keller because she never gave up. ／ Why do you respect her? ― Because she was brave and patient.
- 読みもの（台本より）: "Our Respect Cards. Riko: I respect Stella Moss because she helped many children. She opened a free star school, so any child could learn about the sky. Kiko: I respect Helen Keller because she never gave up. She learned words, wrote books, and helped many people. Haru: I respect Anne Sullivan because she was a patient teacher. Birimo: I respect Marie Curie because she was the first woman to win a Nobel Prize. And she won two!"
- 会話: Ms. Emma「Old Tock wants to know which great person you respect.」 Riko「I respect her because she helped many children. I mean Stella Moss and her free star school.」 … Haru「Because she was brave and patient. She helped Helen learn words.」
- フォニックス: report / reporter / support（問題は「port の ことば。いみは どれ？」support（sup ＝ 下から ＋ port ＝ はこぶ）→ 下から ささえる・おうえんする / しらせを もちかえる・ほうこくする / 外国から 買い入れる（ゆにゅう））

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 65 ファイル・2,068 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 241 → 246 kB、/lesson/[lessonNo] 247 → 252 kB、/gacha 230 → 235 kB、/test/[assessmentId] 229 → 234 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド31 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 46`: No.46（L901〜920・63 ページ）、`--pack 47`（L921〜940）は ワールド31 の 10 レッスンぶん（32 ページ）まで 作れる ことを 確認

## WORLD — ワールド32「たいようの砂漠」（L931〜960・ステージ4・B1）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-32.json` を 新しく 作成（30 レッスン、ステージ4・`level` は B1、`school.grade` は「高校初級」）。計画書 §10 の タイトル・中心の表現・会話シーンどおり。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 960 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30）、フォニックスの ことば 118、会話の セリフ 209 行（1 回 6〜7 行、L950 と L960 は 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 318 語・最少 277 語・最大 333 語）で、まいかい「読みもの」（サン・コンパスの メモ・キャンプの 日記・オアシスの 看板・気候の 地図・気候レポート・ハンフリーの キャラバン・フェネックの 自己紹介・サボテン園の カード・寒い 土地の ポスター・フェアの ポスター・地図・地球儀・国あてカード・宝の地図・ミラ博士の グラフと 円グラフ・パーム村の 井戸・ミラー湖・グリーンバレー・水の 日記・キャンペーンの ポスター・リナの おはなし・クイズカード・グラフ レポートの お手本（69 語）など 68〜105 語）を 読む。日本語の ヒントは 2 回だけ（L931「hardly ever（ほとんど ～ない）」・L937「so that（～できるように）」）。
- ブロック構成: 931〜935 砂漠と 気候（It hardly ever rains here. は L931 から・during the day / at night・a place where ～・all year・is located in ～ は L935 から）→ 936〜940 生きものの 工夫（can go many days without ～・so that は L937 から・to ～（目的）・in order to は L939 から・adaptations）→ 941〜945 地図と 方角（to the east of ～・located in the north・There are seven continents.・It's a country in ～.・Go north for two kilometers. You'll see ～.）→ 946〜950 グラフと 表（The graph shows ～. は L946 から・increased / decreased / stayed the same は L947 から・twice as many ～ as は L948 から・half / one quarter / percent は L949 から・As you can see, ～.）→ 951〜955 水（precious・because of ～ は L952 から・As a result, ～ は L953 から・about 200 liters a day・We can save water by ～ing.）→ 956〜960 まとめ（砂漠の 物語を よむ・地理クイズラリー・グラフの 説明文・さよならキャラバン・L960 地球フェスティバル）。
- 物語の 糸: L930 の さいごの とびらの 先は まぶしい「たいようの砂漠」（L931）。案内役は 耳の 大きな フェネックの フェン（Fen）で、6 つの あなが ある「サン・コンパス（Sun Compass）」を くれる。ブロックの まとめごとに たいようの クリスタルが 1 つずつ はまる（935・940・945・950・955・960）。L936 から ラクダの キャラバンの ハンフリー（Humphrey）、L946 から 砂漠の 気象学者 ミラ・サンズ博士（Dr. Mira Sands）。パーム村の 井戸（L951）・小さく なった ミラー湖（L952）・木を うえて 緑が もどった グリーンバレー（L953）は 架空。L956 の リナ（Lina）の 話は「つくった おはなし」と ことわる。L960 で クリスタルが ぜんぶ ひかり、はりが 海を さし、遠くに 火山の けむり ―「ほのおの火山島（Island of Fire）」への つなぎ。
- フォニックス（`src/lib/curriculum/w32Phonics.ts`・`questions.ts` の `w32Question`。w31Question より 先に よぶ）:
  - 語根 geo（rule "root-geo"。focus "geo"）: 「geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？」（geo（ちきゅう）＋ logy（〜の 学問）→ ＿＿「ちしつがく」→ geology / geography / geologist）。12 語（geography・geology・geometry・geographer・geologist・geoscientist・geothermal・geopark・geoglyph・geographic・geometric・geode）。
  - -al（rule "suffix-al"。focus "-al"）: 「-al を つけて ようすの ことばに。ただしい つづりは どれ？」（nature ＋ al → natural / natureal / naturel）。e が きえる・center → central・nation → national の 音の かわりかたを せつめい。12 語。
  - 方角の ことば（rule "direction-words"。focus "-ern" "-east" "-west" "-ward"）: 「ほうがくの ことば。あう ことばは どれ？」（north → ＿＿「きたの」→ northern / northen / northal、＿＿「北東」→ northeast / eastnorth / northest、up → upward / upword / upwerd）。16 語。
  - 数・分数・割合の 読みかた（rule "number-reading"。focus は その ことば）: 「英語で なんと よむ？」（1/2 → one half / one two / two ones）。hundred（350）・thousand（4,000・12,000・60,000・250,000）・million（1,000,000 など）・分数（1/2・1/4・3/4・1/3）・percent（30%・75%）・小数（2.5・0.5）の 6 しゅるい 16 こ。問題の 音は 答えの よみ（`audioText`）で よむ（1/2 を 日づけと よまない ように）。
  - データの ことばの つづり（rule "data-spelling"。focus "-age" "-ure" "-ease" "-ount"）: 「ただしい つづりは どれ？」（へいきん：The ＿＿ temperature in July is 35 degrees. → average / averege / avrage）。14 語。
- フォーカスの ボタン（`phonicsButtons.ts` の `w32Example`）と 読み上げ（`vowelTeams.ts` の `w32Say`）は その focus で 問う ことばを よむ。数は 英語の よみで よむ（英字と スペース だけ: 75% → "seventy five percent"）。L930 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド32 の 決まりごと（範囲・ステージ4・B1・高校初級・タイトル 30・フォニックスの 順と 種類・方角の 4 つの focus・数の 6 しゅるい・つづりの 4 つの focus・ふりかえり L956〜960 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（hardly ever / located / so that / in order to / The graph shows / increased / twice as / percent / because of / As a result）・台本は 英語だけで 200 語 以上＋読みもの・日本語の ヒントは L931 と L937 だけ・AI 会話で 個人情報を きかない・L944・L954・L958 は goalJa に「ほんとうの なまえや すんで いる ところは いわなくて いい」・物語）を 追加。`tests/phonics-w32.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **フォニックスの ブロックの 順を テーマに あわせた**: 計画の B3（数の 読みかた）と B4（方角）を 入れかえ、方角を 地図の ブロック（941〜944）、数を グラフの ブロック（946〜949）に した。データの つづり（B5）は 水の ブロック（951〜954・average・amount・increase）で つかう。
- **問いの 角度は ワールド31 と かさならない ように**: geo は パーツと いみ → ことば、-al は つづり（e が きえる など）、方角は ことばの かたち、数は よみかた、データは 文の なかの ただしい つづり。-al・方角・つづりの まちがいの 選択肢は どれも ない ことば（personnel・foreword・northwards・litre の ような 本当に ある ことばは さけた）。数の まちがいも「a half」「one fourth」「point five」「fifteen hundred」の ような 正しい よみは 出さない。
- **数の 問題の 音**: TTS が "1/2" を 日づけと よむ おそれが あるので、数の 問題だけ 音を 答えの よみに した（ワールド31 の 年号と おなじく、よみを 聞いて 選ぶ 問題）。
- **事実は たしかな ものだけ**: 砂漠は 年に 約 250 mm より 少ない 雨・いちばん 大きい 砂漠は 南極、暑い 砂漠では サハラ（アメリカと ほぼ おなじ 大きさ・大部分は 岩と 小石）・アタカマ・ゴビ・ラクダの こぶは 脂肪・フェネックは いちばん 小さい キツネ・サボテンの とげは 葉・サワロ・ペンギンの ハドル・7 大陸 5 大洋・地表の 約 70%が 水・淡水は 約 3%・陸の 約 3 分の 1 が 砂漠・日本の 家庭の 水は 1 人 1 日 約 200 L・シャワー 1 分 約 12 L・アフリカの「緑の 長城」。グラフの 数字（ミラ博士の まちの 雨・公園の 来場者・オアシスの 動物・グリーンバレーの 木）は 架空で「わたしたちの まち」などと ことわる。
- **新しい 話し手は 増やさない**: フェン・ハンフリー・ミラ博士は 台本の なかか、ビリモが「I'm playing ～!」と やくを する。
- **作りかた**: 下書きの きまり（物語・core・フォニックスの ことば・文法の じゅんばん・つかって よい 事実）と チェックの スクリプトを 書き、30 レッスンを 3 つの まとまり（931〜940・941〜950・951〜960）で 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: L949 の 雨の 数字（6 月に 0.5 mm）が L950 の グラフ（6〜8 月は 雨 なし）と くいちがって いたので L949 を 5 月に。

### 例（L937「So That They Can Survive」）
- 表現（core）: Desert foxes have big ears so that they can stay cool. ／ Why do fennec foxes have furry feet? ― So that they can walk on hot sand. ／ They sleep in burrows during the day and hunt at night.
- 読みもの（台本より）: "How Desert Animals Survive. I'm a fennec fox, the smallest fox in the world. My huge ears let heat out of my body so that I can stay cool. They also help me hear insects under the sand. My feet are covered with fur so that I can walk on hot sand. During the day, I sleep in a cool burrow under the ground. At night, when the air is cooler, I go out to hunt. My friend Humphrey has long eyelashes so that sand can't get into his eyes."
- 会話: Riko「Fen, your ears are so big. Why?」 Birimo「I'm playing Fen! Desert foxes have big ears so that they can stay cool.」 … Ms. Emma「Excellent! Every part of Fen's body helps him survive in the desert.」
- フォニックス: coastal / seasonal / central（問題は「-al を つけて ようすの ことばに。ただしい つづりは どれ？」center（まんなか）＋ al → ＿＿（まんなかの・中央の）→ central / centeral / centrel）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 66 ファイル・2,119 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 246 → 250 kB、/lesson/[lessonNo] 252 → 256 kB、/gacha 235 → 239 kB、/test/[assessmentId] 234 → 238 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド32 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 47`（L921〜940）・`--pack 48`（L941〜960）: どちらも 63 ページで 作れる ことを 確認

## WORLD — ワールド33「ほのおの火山島」（L961〜990・ステージ4・B1）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-33.json` を 新しく 作成（30 レッスン、ステージ4・`level` は B1、`school.grade` は「高校初級」）。計画書 §10 の タイトル・会話シーンどおり（中心の表現は 下の「決めたこと」の 2 つだけ ことばを ととのえた）。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 990 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30・ワールドの なかで かさなり なし）、フォニックスの ことば 109、会話の セリフ 208 行（1 回 6〜7 行、L980 と L990 は 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 307 語・最少 284 語・最大 329 語）で、まいかい「読みもの」（港の 看板・科学館の パネル・実験カード・温泉の 看板・リコの ポスター・地震コーナーの パネル・台風カード・ヒルトップ・パークの 看板・島の 放送・クイズカード・もちだし ぶくろの チェックリスト・家の 安全チェック・集合場所の カード・お店の 看板・家族の 防災計画・教室の ポスター・おはしもの 4 つの きまり・手順カード・学校の 安全の やくそく・避難訓練の アナウンス・ボランティアの 仕事の 表・やさしい ことばカード・旅行者を たすける カード・トモおばあちゃんの えほん・ステーションカード・防災ポスター・やどの 避難カード・やくそくカード・モリ博士の 手紙・フェスティバルの プログラム。61〜82 語）を 読む。日本語の ヒントは 2 回だけ（L972「Make sure（かならず ～して ね）」・L979「unless（～で なければ）」）。
- ブロック構成: 961〜965 地球の しくみ（That mountain is a volcano.・The earth is made of layers.・When a volcano erupts, hot lava comes out.・火山の めぐみ・プレート）→ 966〜970 自然災害の しくみ（An earthquake happens when ～.・台風と 大雨・If you hear a warning, go to high ground.・放送の ききとり The announcement said to stay inside.・防災クイズ）→ 971〜975 そなえ（もちだし ぶくろ・make sure は L972 から・家族の 集合場所・防水と 耐火・家族の 防災計画）→ 976〜980 避難訓練（hold on は L976 から・stay calm は L977 から・as soon as は L978 から・unless は L979 から・司会 First, ～. As soon as ～, ～.）→ 981〜985 たすけあい（How can we help? は L981 から・Are you OK? Do you need anything?・旅行者を 英語で 案内・rebuilt は L984 から・ロールプレイ）→ 986〜990 まとめ（防災ポスター・手順書を 読む・防災の やくそく・さよなら見学・L990 防災フェスティバル）。
- 物語の 糸: L960 の コンパスが さした 海の むこうの「ほのおの火山島」の ハーバータウンに 船で つく（L961）。火山 マウント・シンダーは おだやかで、てっぺんから すこし ゆげが でて いる だけ（さいごの 噴火は 約 300 年 まえ）。案内役は 黄色い ヘルメットの サンショウウオ、島の ジュニア安全レンジャー エンバー（Ember・口ぐせ Safety first, fun always!）で、6 つの まどが ある「セーフティ・ランタン（Safety Lantern）」を くれる。ブロックの まとめごとに まどが 1 つずつ ひかる（965・970・975・980・985・990）。L962 から 火山学者の モリ博士（Dr. Mori）、L981 から ボランティアセンターの トモおばあちゃん（Grandma Tomo）。L984 の 50 年 まえの 台風と 復興の 話は「つくった おはなし」と ことわる。L990 で まどが ぜんぶ ひかり、光が 島の 小さな 空港を さす ―「つばさの空港（Airport of Wings）」への つなぎ。
- フォニックス（`src/lib/curriculum/w33Phonics.ts`・`questions.ts` の `w33Question`。w32Question より 先に よぶ）:
  - 語根 rupt（rule "root-rupt"。focus "rupt"）: 「rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？」（The volcano may ＿＿ again someday.（ふんかする）→ erupt / eruption / interrupt）。13 語（erupt・eruption・erupted・erupting・interrupt・interruption・interrupted・interrupting・disrupt・disruption・abrupt・abruptly・rupture）。品詞の ちがう なかまを 選択肢に して、いみと 文の かたちの 両方で えらぶ。
  - 名詞の おわり（rule "noun-ending"。focus "-ance" "-ence" "-ency" "-ty"）: 「ものの なまえ（名詞）に すると？ ただしい つづりは どれ？」（distant（とおい）→ ＿＿（きょり）→ distance / distence / distanse）。-ant → -ance、-ent → -ence / -ency、enter → entrance（e が きえる）、safe → safety（e が のこる）を せつめい。19 語。
  - -proof の 複合語（rule "compound-proof"。focus "-proof"）: 「-proof（〜を ふせぐ・〜に つよい）の ことば。文に あう ことばは どれ？」（Keep your papers in a ＿＿ bag.（水を とおさない）→ waterproof / fireproof / soundproof）。12 語（earthquake-proof は ハイフンの 例）。
  - リストの 読みかた（rule "list-intonation"。focus "and"（ならべる 文）・"or"（どっち？の 文））: 「リストを いう ときの こえの 上がり下がりは どれ？」（water ↗, food ↗, and a flashlight ↘ / water ↘, food ↘, and a flashlight ↗ / ぜんぶ ↗）・「「どっち？」と きく ときの こえの 上がり下がりは どれ？」（an earthquake ↗ or a typhoon ↘）。17 文。選択肢は まとまり（items）から 自動で つくる。問題の 音は おわりに . か ? を つけた 文（`audioText`）で よむ。
  - 語根 ject（rule "root-ject"。focus "ject"）: 「ject（なげる）の まえに つく パーツは どれ？」（＿＿ject「スクリーンに うつす・けいかく（プロジェクト）」→ pro / in / ob）。12 語（project・projector・subject・object・objection・interject・inject・injection・eject・reject・rejection・dejected）。
- フォーカスの ボタン（`phonicsButtons.ts` の `w33Example`）と 読み上げ（`vowelTeams.ts` の `w33Say`）は その focus で 問う ことば・文を 英字と スペース だけで よむ（earthquake-proof → earthquake proof、リストの , は とる）。`focusSay` では ワールド33 を ワールド9 の r の つく母音（R_SAY）より 先に みる（リストの focus "or" を「or の おと」で よまない ため。ワールド33 の 表の ことば だけの 回でしか はたらかないので、ワールド9 の "or" は これまでどおり）。L960 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド33 の 決まりごと（範囲・ステージ4・B1・高校初級・タイトル 30・フォニックスの 順と 種類・名詞の おわりの 4 つの focus・リストの 2 つの focus・ふりかえり L986〜990 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（make sure / hold on / stay calm / as soon as / unless / How can we help / rebuilt）・台本は 英語だけで 200 語 以上＋読みもの・日本語の ヒントは L972 と L979 だけ・AI 会話で 個人情報を きかない・L972・L973・L975・L988 は goalJa に「ほんとうの じゅうしょや ばしょは いわなくて いいよ」・こわい ことばを つかわない・物語）の 8 テストを 追加。`tests/phonics-w33.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **フォニックスの ブロックの 順を テーマに あわせた**: 計画の B3（リストの 読みかた）と B5（-proof）を 入れかえ、-proof を そなえの ブロック（971〜974・L974「Waterproof and Fireproof」）、リストを 避難訓練の ブロック（976〜979・Drop, cover, and hold on）に した。B4 の ject は たすけあいの ブロック（981〜984・project・volunteer project）。
- **計画の -ency・-ance を 4 つに ひろげた**: safety（計画の 例）を 入れる ため -ty を くわえ、-ance と まちがえやすい -ence も 入れて「もとの ことばの ant・ent を 思い出す」と いう 1 つの きまりで おしえる。
- **問いの 角度は ワールド29〜32 と かさならない ように**: rupt は 文と いみ → ことば（品詞ちがいの なかまが 選択肢）、名詞の おわりは もとの ことば → つづり、-proof は 文と いみ → ことば、リストは 矢印の パターン、ject は いみ → まえの パーツ（geo の「パーツと いみ → ことば」・port の「ことば → いみ」とは ぎゃく むき）。名詞の おわりの まちがいの つづりは どれも ない ことば（loyality・certainity の ような よく ある まちがいも 本当には ない ことば）。リストの まちがいの パターンは 英語として ふつうでは ない ものだけ（↗↗ は「はい・いいえ」の しつもんに なるので「どっち？」の 選択肢から はずした）。
- **リストの focus は "and" と "or"**: さいしょ "A, B, and C" に したが、全体テスト（フォニックスの ことばは focus の つづりを ふくむ・ボタンは 英字だけ）に あわせて、どの 文にも ある "and" / "or" に した。ワールド29 の 弱形の focus "and" とは、ワールド33 の 問題を いちばん 先に よぶ ので ぶつからない。
- **中心の表現を 2 つ ととのえた**: L969 は 計画の「"Please stay inside." What did it say?」を「The announcement said to stay inside.」に（B1 の 間接話法で 1 文に なり、台本の " を 読みものだけに できる）。L971 は リストの 読みかたに あわせて and の まえに , を つけた（water, food, and a flashlight）。L975・L980・L981・L989 の「～」の ところは 島の 物語に あわせて きめた（Hilltop Park・the big tree など）。
- **こわがらせない・ただしい 行動だけ**: 火山は いつも おだやかで 毎日 見まもられて いる。災害の 説明は しくみと そなえ だけで、けが・なくなる 人・こわい 音は 出さない（チェックの スクリプトと テストで died・killed・terrifying などを きんし）。行動は 日本の 学校の きまりどおり（Drop, Cover, Hold On・まどや たかい たなから はなれる・エレベーターは つかわない・おさない はしらない しゃべらない もどらない（osahashimo）・津波けいほうでは すぐ 高台へ、はまべへ 見に いかない、けいほうが おわるまで もどらない・大雨の 日は 川や 海に ちかづかない・子どもは 大人と いっしょに 声かけ）。L984 の 復興の 話は「みんな はやく 避難したので みんな 無事だった」と して、絵本の ことばも「屋根が こわれた」→「屋根の 修理が ひつようだった」と やわらかく した。
- **事実は たしかな ものだけ**: 地球の 4 つの 層（地殻は りんごの 皮の ように うすい・内核は 太陽の 表面ほど あつい）・プレートは 1 年に 数 cm（つめが のびる くらい）・日本は 4 つの プレートが であう ところ・活火山は 約 111・マグマと 溶岩・火山の めぐみ（温泉・ゆたかな 土・地熱・ハワイの 島々）・台風は あたたかい 海で できる（目の なかは しずか）・津波は 何回も くる／深い 海では ジェット機ほど はやい・水は 1 人 1 日 約 3 L を 3 日ぶん 以上・119 と 110・9 月 1 日。島・町・人・50 年 まえの 台風は ぜんぶ 架空。
- **新しい 話し手は 増やさない**: エンバー・モリ博士・トモおばあちゃん・旅行者・近所の おじいさんは 台本の なかか、ビリモが「I'm playing ～!」と やくを する。
- **作りかた**: 下書きの きまり（RULES.md・spec.mjs: 物語・core・フォニックスの ことば・文法の じゅんばん・つかって よい 事実・あんぜんの きまり）と チェックの スクリプトを 書き、30 レッスンを 3 つの まとまり（961〜970・971〜980・981〜990）で 並行して 書き、まとめてから 自分で 1 回 見なおした。なおした ところ: 単語の かさなり 2 つ（L987 step → staff、L979 promise → safety check。promise は L988 の core）・L987 の「hotel guest」を 物語の「やど（inn）」に・L986 の 水の 量の いいかた（every day, for at least three days → for one day, and keep enough for at least three days）・L984 の 絵本の 1 文を やわらかく。

### 例（L976「Drop, Cover, Hold On」）
- 表現（core）: Get under a desk and hold on. ／ What should we do if there's no desk? ― Cover your head with your bag. ／ Stay where you are until the shaking stops.
- 読みもの（台本より）: "When the Ground Shakes. Drop down onto your hands and knees. Get under a desk and cover your head and neck. Hold on to the desk legs until the shaking stops. Stay away from windows and tall shelves. If there is no desk, cover your head with your bag or your arms. Stay where you are until your teacher tells you to move."
- 会話: Kiko「The bell is ringing! Is this a drill?」 Ms. Emma「Yes, this is a drill. Get under a desk and hold on.」 Birimo「I'm too big for the desk! What should we do if there's no desk?」 … Ms. Emma「Not yet, Haru. Stay where you are until the shaking stops.」
- フォニックス: Drop, cover, and hold on ／ We need water, food, and a flashlight ／ Bring a radio, batteries, and a whistle（問題は「リストを いう ときの こえの 上がり下がりは どれ？」We need water, food, and a flashlight. → water ↗, food ↗, and a flashlight ↘ ／ water ↘, food ↘, and a flashlight ↗ ／ water ↗, food ↗, and a flashlight ↗）

### 確認
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 67 ファイル・2,170 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 250 → 255 kB、/lesson/[lessonNo] 256 → 261 kB、/gacha 239 → 243 kB、/test/[assessmentId] 238 → 243 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド33 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 49`（L961〜980）: 63 ページ。`--pack 50`（L981〜1000）: いまは L990 までなので 32 ページで 作れる ことを 確認（ワールド34 が できれば 63 ページに なる）

## WORLD — ワールド34「つばさの空港」（L991〜1020・ステージ4・B1）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-34.json` を 新しく 作成（30 レッスン、ステージ4・`level` は B1、`school.grade` は「高校初級」）。計画書 §10 の タイトル・会話シーンどおり（中心の表現は 下の「決めたこと」の ところだけ ことばを ととのえた）。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 1,020 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30・ワールドの なかで かさなり なし）、フォニックスの ことば 115、会話の セリフ 213 行（1 回 6〜7 行、L1000・L1010・L1020 は 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 316 語・最少 290 語・最大 332 語）で、まいかい「読みもの」（スカイの 本の さいしょの ページ・チェックインカウンターの 看板・搭乗券・空港の 放送・スカイの メモ・機内の 案内・入国カード・乗りつぎの 案内板・両替所の 看板・スカイの おいわいカード・ホテルの ウェルカムカード・へやの 案内・駅までの 道案内・おすすめの カード・かさの 貸し出しの 看板・手荷物の 用紙・修理の カード・お礼の カード・広場の 看板・メニュー・ブラウンさんの カード・美術館の 料金表・ホテルへの メール・観光パンフレット・旅行記・出発の 案内板・ちえの議事堂からの 手紙 など。60〜82 語）を 読む。日本語の ヒントは 2 回だけ（L1002「Would you mind（～して もらえますか）」・L1007「I'm afraid（ざんねんですが）」）。
- ブロック構成: 991〜995 空港（Planes leave for every corner of the world.・I'd like to check in, please.・窓がわ／通路がわ・Flight 205 is now boarding at gate 23B.・Do you know where gate 23B is? は L995 から）→ 996〜1000 機内・入国・乗りつぎ・両替（Could I have some water, please?・What's the purpose of your visit? Sightseeing.・How do I transfer to my next flight?・I'd like to change some yen, please.・L1000 We've arrived! This is our 1,000th lesson!）→ 1001〜1005 ホテル（よやく・Would you mind ～ing? は L1002 から・間接疑問 Do you know where the nearest station is? と Could you tell me how ～? は L1003 から・recommend は L1004 から・I'd like to borrow an umbrella. Could you lend me one?）→ 1006〜1010 トラブル解決（My suitcase didn't arrive.・I'm afraid は L1007 から・instead は L1008 から・I lost my passport. What should I do?・That's very kind of you. は L1010 から）→ 1011〜1015 まち（写真を たのむ・レストラン・In the UK, people say lift.・美術館の チケットと ファミリーわりびき・We visited ～. Then, we ～.）→ 1016〜1020 まとめ（I'm writing to は L1016 から の ホテルへの メール・パンフレットを 読んで えらぶ・旅行記・帰りの 空港・L1020 旅の トークショー）。
- 物語の 糸: L990 の ランタンの 光が さした 火山島の 小さな 空港は、白い 屋根が 2 まいの つばさの ような「つばさの空港（Airport of Wings）」（L991）。案内役は 青い スカーフの アホウドリ、空港の ジュニアガイド スカイ（Skye・口ぐせ Every trip is a story!）で、6 ページの「ウィング・スタンプ帳（Wing Stamp Book・本物の パスポートでは ない）」を くれる。ブロックの まとめごとに スタンプが 1 つずつ（995・1000・1005・1010・1015・1020）。ミス・エマと 4 人で Flight 205（gate 23B・10:45）→ 海外の 大きな 空港 スカイポート国際空港で 入国審査 → 国内線 Flight 1120（gate 41C）に 乗りつぎ・両替 → L1000 で 海辺の まち ブライトウォーター（Brightwater）に とうちゃく。シーガル・ホテルの フロントの リーさん（Mr. Lee）。ミス・エマの スーツケースが 出て こなかった 話（L1006・その よる とどく）・エアコンの こしょうと 部屋の かえ（L1007〜1008）・パスポートは 手荷物サービスの 窓口に わすれて いて ぶじ（L1009）。ホテルで イギリスの ブラウンさんと アメリカの グリーンさんに あう（L1013）。L1020 で 6 つの スタンプが まるい 屋根の 大きな たてものの 絵に なり、「ちえの議事堂（Hall of Wisdom）」からの しょうたいじょう ― ワールド35 への つなぎ。
- フォニックス（`src/lib/curriculum/w34Phonics.ts`・`questions.ts` の `w34Question`。w33Question より 先に よぶ）:
  - 空港の 数字の 読みかた（rule "travel-number"。focus は その ことば そのもの "Flight 205" "10:45" "Seat 14A" "Gate 23B" など）: 「空港の 数字。英語で なんと よむ？」（Flight 205（205びん）→ two oh five / twenty-five / two fifty）。便名・時刻・座席・ゲート 16 こ。まちがいは「ききまちがえた ほかの 数」の 読みかた（fifteen / fifty、fourteen / forty、0 を oh と よむ）。音は 読みかたの 文（Flight two oh five.）。
  - 語根 vis（rule "root-vis"。focus "vis"）: 「vis（見る）の ことば。英語の せつめいに あう ことばは どれ？」（a paper or stamp that lets you enter a country → visa / vision / visit）。13 語（visit・visitor・visa・vision・visual・visibility・invisible・television・revise・supervise・supervisor・advise・visualize）。B1 の 一歩と して 英語の やさしい 定義から えらぶ（これまでの 語根の 問いと ちがう 角度）。
  - 2 つ ならぶ 文字（rule "double-letters"。focus は その 文字 "cc" "dd" "ss" "ll" "ff" "rr" "mm" "gg"）: 「ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）」（Could you ＿＿ a good restaurant?（すすめる）→ recommend / reccomend / recomend）。14 語（accommodation・address・necessary・pillow・coffee・occupied・tomorrow・different・arrive・recommend・excellent・suggest・luggage・baggage）。まちがいは どれも ない つづり。
  - -ize の 動詞（rule "suffix-ize"。focus "-ize"）: 「-ize を つけて 動詞に すると？ ただしい つづりは どれ？」（apology（あやまる こと）→ ＿＿（あやまる）→ apologize / apologyize / appologize）。12 語。y で おわる ことばは y を とる こと、イギリスでは -ise も つかう ことを せつめい。
  - イギリス英語と アメリカ英語（rule "uk-us"。focus は その ことば そのもの）: 「イギリス英語では なんと いう？」（アメリカ: elevator（エレベーター）→ イギリス: ＿＿ → lift / flat / queue）・「アメリカ英語では なんと いう？」・「イギリスの つづりは どれ？」（アメリカ: color → colour / colur / coulor）。ことば 12 こ・つづり 4 こ。ことばの まちがいは おなじ がわの ことば、つづりの まちがいは ない つづり。
- フォーカスの ボタン（`phonicsButtons.ts` の `w34Example`）と 読み上げ（`vowelTeams.ts` の `w34Say`・いちばん 先に みる）は その focus で 問う ことばを 英字と スペース だけで よむ（数字は 英語の 読みかた: Flight 205 → Flight two oh five）。L990 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド34 の 決まりごと（範囲・ステージ4・B1・高校初級・タイトル 30・フォニックスの 順と 種類・数字は 便名／時刻／座席／ゲートが そろう・イギリスと アメリカは 両がわと つづりが そろう・ふりかえり L1016〜1020 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（Do you know where / Would you mind / Could you tell me where / recommend / I'm afraid / instead / That's very kind of you / I'm writing to）・台本は 英語だけで 200 語 以上＋読みもの・日本語の ヒントは L1002 と L1007 だけ・AI 会話で 個人情報を きかない・L997・L1001・L1009・L1016・L1018 は goalJa に「ほんとうの なまえや じゅうしょは いわなくて いいよ」・物語）の 8 テストを 追加。`tests/phonics-w34.test.ts`（13 テスト）を 追加。全体の「どの レッスンも レッスンフローを 作れる」テストは 1,000 レッスンを こえて 全体 実行では 5 秒を こえる ことが あったので、タイムアウトを 30 秒に した（ひとりで 動かすと 5 秒 以内で 通る）。

### 決めたこと（理由）
- **フォニックスの きまりを 3 つ かえた**: 計画の B1 trans-（ワールド30 で 済み）・B3 旅行の -tion（ワールド17・23・31 で 済み）・B2 ていねいな お願いの イントネーション（上がる／下がる／かわらないの 問いは ワールド25 で 済み。Could you の つながる 音も ワールド21 で 済み）は くりかえしに なるので、旅の テーマに あう 新しい きまりに した: 語根 vis（visit・visa は 入国審査の ブロック）・2 つ ならぶ 文字（recommend・accommodation は ホテルの ブロック）・-ize（apologize は トラブル解決の ブロック）。B4 の 便名・ゲート・時刻は 空港の ブロック、B5 の イギリスと アメリカは L1013「Lift or Elevator?」の ある まちの ブロックに おいた（つづり colour・centre・theatre・favourite も くわえた）。ていねいな お願いの 言いかた（Could you ～? / Would you mind ～ing?）は 会話と 文法で しっかり あつかう。
- **問いの 角度**: 数字は「かきかた → 英語の 読みかた」（ワールド31 の 年号・ワールド32 の 大きな 数と ちがう 便名・時刻・座席・ゲート）、vis は「英語の せつめい → ことば」（これまでの 語根の 問いに ない 角度）、2 つ ならぶ 文字は「文と いみ → つづり」、-ize は「もとの ことば → 動詞の つづり」（ワールド33 は → 名詞）、イギリスと アメリカは「もう かたほうの 国の ことば → この 国の ことば」。
- **中心の表現を ととのえた**: 計画の「～」や ― を core に 入れない きまりに あわせて、L997 は What's the purpose of your visit? Sightseeing.、L1001 は I have a reservation under the name Haru.（" を とった）、L1013 は In the UK, people say lift.、L1005・L1015・L1016・L1018・L1019 の「～」は 物語に あわせて きめた（かさを かりる・Clock Tower と 川の ボート・空港バス・マーケットと ボート・チェックインカウンター）。L998 は より しぜんな How do I transfer to my next flight? に、L1014 は 子どもの チケットに 学生わりびきを きくのは ふしぜんなので One adult and four children, please. Is there a family discount? に した。L995 の Do you know where gate 23B is? は 計画どおり 間接疑問の さいしょの まる おぼえ と して のこし、L1003 で ことばの じゅんばん（Where is the station? → Do you know where the station is?）を せつめいする。
- **あんぜん**: 子どもは いつも ミス・エマと いっしょ（ひとりで うごく 文は チェックの スクリプトで さがした）。パスポートは ミス・エマの ポーチに。こまった ときは すぐ 大人や スタッフに いう。AI 会話では なまえ・じゅうしょ・たんじょうび・パスポート番号などを きかない。L1016 の メールと L1018 の 旅行記では キコが「じゅうしょも かく？」と きき、ミス・エマが「かかなくて いい」と こたえる。なくしものの 回は おちついて しらべて、さいごは ぶじに 見つかる。
- **事実は たしかな ものだけ・名前は ぜんぶ 架空**: 空港・ホテル・まち・便は ぜんぶ つくった もの（航空会社・ブランドの 名前は なし）。機内で みみが へんな ときは あくびや かむ こと・シートベルト・入国審査で きかれる こと・ビザの いみ・イギリスと アメリカの ことばの ペアは たしかな ものだけ。L1006 の 宿泊は 入国審査の「5 日間」に あわせて「4 はく」に そろえた。
- **新しい 話し手は 増やさない**: スカイ・リーさん・ブラウンさん・グリーンさん・係の 人は 台本の なかか、ビリモが「I'm playing ～!」と やくを する。
- **作りかた**: 下書きの きまり（RULES.md・spec.mjs: 物語・core・フォニックスの ことば・文法の じゅんばん・つかって よい 事実・あんぜんの きまり）と チェックの スクリプトを 書き、30 レッスンを 3 つの まとまり（991〜1000・1001〜1010・1011〜1020）で 並行して 書き、まとめてから 自分で 1 回 見なおした（3 つ あわせても 単語の かさなり なし。なおした ところ: L1001 の 宿泊を 5 はく → 4 はく）。

### 例（L1003「Do You Know Where…?」）
- 表現（core）: Do you know where the nearest station is? ／ Could you tell me how to get there? ― It's a five-minute walk. ／ Go straight and turn right at the bakery.
- 読みもの（台本より）: "From the Seagull Hotel to Clock Tower Station. Go out of the front entrance and turn left. Walk straight along Harbor Street for two blocks. You will see a bakery on the corner. Turn right at the bakery. The station is at the end of that street, right next to the tall clock tower. You can't miss it! It takes about five minutes on foot."
- 会話: Riko「Excuse me. Do you know where the nearest station is?」 Birimo（リーさんの やく）「Yes! It's Clock Tower Station.」 Haru「Could you tell me how to get there?」 … Ms. Emma「Thank you very much. Let's go, everyone. Stay close to me!」
- フォニックス: tomorrow ／ different ／ arrive（問題は「ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）」Our flight leaves ＿＿ morning.（あした）→ tomorrow ／ tommorow ／ tomorow）

### 確認
- `node .tmp/w34/check-part.mjs content/curriculum/worlds/world-34.json`: OK
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 68 ファイル・2,221 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 255 → 260 kB、/lesson/[lessonNo] 261 → 265 kB、/gacha 243 → 248 kB、/test/[assessmentId] 243 → 248 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド34 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 50`（L981〜1000）: 63 ページ（ワールド34 が できたので 32 → 63 ページ）。`--pack 51`（L1001〜1020）: 63 ページ

## WORLD — ワールド35「ちえの議事堂」（L1021〜1050・ステージ4・B1・ステージ4 の 総まとめ）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-35.json` を 新しく 作成（30 レッスン、ステージ4・`level` は B1、`school.grade` は 計画どおり「高校中級」）。計画書 §10 の タイトル・会話シーンどおり（中心の表現は 下の「決めたこと」の ところだけ ことばを ととのえた）。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 1,050 レッスン。ステージ4 が そろった）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30・ワールドの なかで かさなり なし・ワールド34 とも かさなり なし）、フォニックスの ことば 107、会話の セリフ 210 行（1 回 6〜7 行、L1030・L1040・L1050 は 8 行）、AI 会話 30、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 317 語・最少 294 語・最大 329 語）で、まいかい「読みもの」（オリーブの あいさつ・アンケート結果・アマラの 物語・レオの ボール計画・絵本・子どもの 権利の リスト・家の しごと表・公園そうじの おしらせ・ハート市長の 手紙・投票結果・提案書・グラフの せつめい・2 つの 意見文・市長への 手紙・こども議会の メッセージ など。61〜90 語）を 読む。日本語の ヒントは 2 回だけ（L1025「On the one hand（いっぽうでは）」・L1038「compromise（だきょうあん）」）。
- ブロック構成: 1021〜1025 学校の ルール（Children from many places meet here to talk.・Should students wear uniforms?・I think we should have longer breaks because ～.・Most students want to choose their own seats.・On the one hand / On the other hand は L1025 から）→ 1026〜1030 公平と やさしさ（It's not fair if only some people can play.・have a chance to は L1027 から・Stop it. That's not kind.・Do you want to join us?・Let's make our school a kind place.）→ 1031〜1035 権利と 役割（have the right to は L1031 から・responsible for は L1032 から・What can children do for our community?・We have the right to speak, and we should listen to others.）→ 1036〜1040 提案（suggest that は L1036 から・How about making a map for visitors?・compromise は L1038 から・Twelve people voted for the idea.・Our proposal is ～. It will help ～.）→ 1041〜1045 動物と 環境・ステージ4 の ふりかえり（野生の 動物を ペットに？・マイボトル・I see your point, but ～.・The graph shows that ～.・Would you mind ～ing?）→ 1046〜1050 まとめ（2 つの 意見文を 読みくらべる・市長への 提案の 手紙・ディベート練習 First, I'd like to say that ～.・L1049 さよなら・L1050 Children's voices can change the world.）。
- 物語の 糸: L1020 の しょうたいじょうで、架空の まち ウィローフォード（Willowford）の まるい みどりの やねの「ちえの議事堂（Hall of Wisdom）」へ（L1021）。案内役は まるい めがねの メンフクロウ、こども議会の 議長 オリーブ（Olive・口ぐせ Every voice matters!・小さな 木の ベルを ならす）。ホールの まんなかの「声の木（Tree of Voices）」の 6 本の えだに、ブロックの まとめごとに 金の 葉っぱが 1 まいずつ（1025・1030・1035・1040・1045・1050）。議会の 子どもは レオ（山の まち）・アマラ（海辺の 村）・プリヤ（大きな 都市）で、台本の なかか ビリモの やくだけ。L1036 から ハート市長（Mayor Hart・赤い スカーフ）。あき地は 花だん＋小さな 遊び場の 妥協案（L1038）、投票で 観光客の 地図が 20 票中 12 票（L1039）、市長が 地図の 提案を うけいれる（L1040）。L1047 の 手紙で 公園に ベンチ 4 つ（L1050 で 決定）。L1049 で ビリモが 議事堂の 図書室で「Deep Sea City」と かかれた 海の底への 古い 地図を 見つけ（ミス・エマが 高い たなから とって くれる）、L1050 で 声の木に 白い 花が さき、地図が 青く ひかる ― ワールド36「しんかいの都」への つなぎ。
- フォニックス（`src/lib/curriculum/w35Phonics.ts`・`questions.ts` の `w35Question`。w34Question より 先に よぶ）:
  - -ity の 名詞（rule "suffix-ity"。focus "-ity"）: 「-ity の ことば。もとの ことば（形容詞）は どれ？」（responsibility（せきにん・やくわり）→ もとの ことば: ＿＿（せきにんの ある）→ responsible / responsable / responsibil）。14 語。ble → bil・ous → os・e を とる かわりかたと、-ity の すぐ まえを つよく いう こと（re-spon-si-BIL-i-ty）を せつめい。
  - inter- と co-（rule "prefix-inter-co"。focus "inter" "co"）: 「inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？」（If we all ＿＿, we can finish the poster faster. → cooperate / interview / intersection）。12 語。日本語の ヒントなしで 英語の 文だけから えらぶ（B1 の 一歩）。
  - 対比の 強勢（rule "contrast-stress"。focus は つよく いう ことばの 小文字）: 「B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？」（A: Did you say Tuesday?　B: I said Thursday. → Thursday / I / said）。16 文。ワールド29 の 意見を 強める 強勢と ちがい、A の 文と くらべて ちがう ことばを みつける。
  - あらたまった ことばと くだけた ことば（rule "formal-casual"。focus は その ことば そのもの）: 「あらたまった ことば（手紙・発表で つかう）は どれ？」（ふだん: get（うけとる・もらう）→ あらたまった: ＿＿ → receive / recieve / receeve）。12 語（children・receive・request・purchase・assist・provide・perhaps・require・repair・inform・bicycle・photograph）。
  - ステージ4 の 語根の まとめ（rule "root-review"。focus "spect" "dict" "struct" "port" "rupt" "ject"）: 「ステージ4 の 語根。＿＿ に 入る パーツは どれ？」（in＿＿（中まで よく 見る → しらべる）→ spect / port / rupt）。12 語。まちがいの 語根は 入れても ことばに ならない もの だけ（eject・report・prospect の ような ほんとうの ことばに なる くみあわせは さけた）。
- フォーカスの ボタン（`phonicsButtons.ts` の `w35Example`）と 読み上げ（`vowelTeams.ts` の `w35Say`・いちばん 先に みる）は その focus で 問う ことば・文を よむ。L1020 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド35 の 決まりごと（範囲・ステージ4・B1・高校中級・タイトル 30・フォニックスの 順と 種類・inter と co の 両方・語根 6 つ ぜんぶ・ふりかえり L1046〜1050 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（On the one hand / On the other hand / have a chance to / have the right to / responsible for / suggest that / compromise）・台本は 英語だけで 200 語 以上＋読みもの・日本語の ヒントは L1025 と L1038 だけ・AI 会話で 個人情報を きかない・L1021・L1024・L1047 は goalJa に「ほんとうの なまえや じゅうしょは いわなくて いいよ」・物語）の 8 テストを 追加。`tests/phonics-w35.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **学年の めやすは「高校中級」**: 計画書どおり（ワールド29〜34 は 高校初級）。スキーマの きまり（高校 で はじまる）にも あう。
- **-ity の 問いの 角度を「名詞 → もとの 形容詞」に した**: ワールド33（-ty）・ワールド34（-ize）は「もとの ことば → あたらしい つづり」だったので、ぎゃくむきに した。計画の community は もとの 形容詞が はっきり しない（common とは つづりも ちがう）ので フォニックスの 表に 入れず、L1034 の 単語・台本で あつかった。
- **あらたまった ことばは つづりで 問う**: kids / children の ような ペアを 選択肢に すると いみで すぐ わかって しまうので、ふだんの ことばを 見せて あらたまった ことばの ただしい つづり（receive の ei など まちがえやすい もの）を えらぶ 形に した。どちらも ただしい 英語で ばめんで つかいわける ことを せつめいに 入れた。
- **中心の表現を ととのえた**: 計画の「～」を 物語に あわせて きめた（L1023 because we need time to relax・L1024 choose their own seats・L1025 せいふくの 両がわ・L1035 We have the right to speak, and we should listen to others.・L1040 地図の 提案・L1043 野生の 動物・L1044 クラスの プラスチック・L1045 いすの じゅんび・L1047 公園の ベンチ・L1048 学校の 畑）。L1049 は「I suggest ～ / On the other hand ～」を さよならの 回に しぜんに あう On the one hand, I'm sad to leave. On the other hand, I'm excited about our next adventure. に した（I suggest that ～ は L1036・L1042・L1047 で なんども つかって いるので、さよならの 回は 両がわを みる 言いかたを 中心に した）。
- **あんぜんと かたよらない こと**: 話し合いの 話題（せいふく・休み時間・宿題・野生の 動物・学校の 畑）は かならず 両がわの 理由を のせ、どちらかを ばかに しない。政治・政党・ニュースは あつかわない。いじわるの 回（L1028）は 絵本の 物語に して、おちついて「Stop it. That's not kind.」・友だちの そばに いる・すぐ 大人に 知らせる・けんかしない、を おしえ、つぎの 日に あやまって なかなおり。子どもの 権利は「たくさんの 国が やくそくした」と だけ いい、団体の 名前は 出さない。野生の 動物の 法律・プラスチックが なくなるまで 何百年も かかる こと は たしかな 事実だけ。子どもは いつも 大人と いっしょ（犬の さんぽ・公園そうじ・プリヤが 駅で まよう 場面も 先生と いっしょ）。
- **新しい 話し手は 増やさない**: オリーブ・レオ・アマラ・プリヤ・ハート市長・ケン（L1029 で 仲間に 入る 子）は 台本の なかか、ビリモが「I'm playing ～!」と やくを する。
- **作りかた**: 下書きの きまり（`.tmp/w35/RULES.md`・`spec.mjs`）と チェックの スクリプトを 書き、30 レッスンを 3 つの まとまり（1021〜1030・1031〜1040・1041〜1050）で 並行して 書き、まとめてから 自分で 1 回 見なおした。チェックの スクリプトの 正規表現に \b の かわりに バックスペース文字が 入って いた ミスを なおした。なおした ところ: 3 つの まとまりの あいだで かさなった 単語 5 こ（opinion・result・bench×2・point of view → voice・show of hands・tally・buddy・side）。

### 例（L1038「Let's Find a Compromise」）
- 表現（core）: Let's find a compromise. ／ What if we make a flower garden with a small playground? ― That sounds fair. ／ I see your point, but children need a place to run.
- 読みもの（台本より）: "The Empty Lot. Leo's idea: a playground. Good points: children can run, climb, and play together. Amara's idea: a flower garden. Good points: it is beautiful, quiet, and good for bees. Our compromise: perhaps we can use both halves of the lot. A flower garden on one side and a small playground on the other side. It will require some benches and a path in the middle, so families can enjoy both."
- 会話: Birimo（レオの やく）「I think this lot should be a playground, because kids love to climb and play soccer.」 Riko「I agree with Amara. I think a flower garden is better, because flowers make people happy.」 … Ms. Emma「You both have good reasons. Let's find a compromise.」 Kiko「What if we make a flower garden with a small playground?」
- フォニックス: perhaps ／ require ／ repair（問題は「あらたまった ことば（手紙・発表で つかう）は どれ？」ふだん: maybe（もしかすると・たぶん）→ あらたまった: ＿＿ → perhaps ／ perhap ／ prehaps）

### 確認
- `node .tmp/w35/check-part.mjs content/curriculum/worlds/world-35.json`: OK
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 69 ファイル・2,272 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 260 → 264 kB、/lesson/[lessonNo] 265 → 270 kB、/gacha 248 → 253 kB、/test/[assessmentId] 248 → 252 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド35 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 52`（L1021〜1040）: 63 ページ。`--pack 53`（L1041〜1060）: 32 ページ（ワールド36 が まだ ないので L1041〜1050 だけ）

## WORLD — ワールド36「しんかいの都」（L1051〜1080・ステージ5 の はじまり・B1・高校中級）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-36.json` を 新しく 作成（30 レッスン、ステージ5「せかいへ はばたく」の さいしょの ワールド。`level` は B1、`school.grade` は 計画どおり「高校中級」）。計画書 §10 の タイトル・会話シーンどおり（中心の表現の「～」は 下の「決めたこと」の とおり きめた）。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 1,080 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30・ワールドの なかで かさなり なし・ワールド35 とも かさなり なし）、フォニックスの ことば 110、会話の セリフ 261 行（1 回 7〜9 行、ブロックの まとめ L1055・1060・1065・1070・1075・1080 は 10 行まで）、AI 会話 30（goalJa に「6 かい いじょう やりとり」と、AI が「Where did you find that?」と 情報源を きく・反対の 立場を とる ことを 明記）、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 373 語・最少 343 語・最大 399 語）で、まいかい 100〜123 語（平均 約 110 語）の「読みもの」（都の 入口の かんばん・水族館の せつめい・深さの 表・研究カード・図書館の ポスター・本の 1 ページ・あやしい ウェブページ・研究計画・記事・メモ・発表原稿・質疑応答カード・3 つの 資料・ポスター・発表会の プログラム など）を 読む。日本語の ヒントは 2 回だけ（L1059「reliable（しんらい できる）」・L1061「In short（つまり）」）。
- ブロック構成: 1051〜1055 深海の ふしぎ（This is the place where light never reaches.・Some deep-sea fish make their own light.・the reason why は L1053 から・Deep-sea animals have special bodies.・One amazing fact is that ～.）→ 1056〜1060 調べる（My research question is: ～・We can use books, websites and interviews.・according to は L1058 から・Who wrote it? When was it written?・First, we'll ～. Then, we'll ～.）→ 1061〜1065 要約（in short は L1061 から・the main point is は L1062 から・3 文の 要約・Take notes: glow, food, dark.・30 秒 要約チャレンジ）→ 1066〜1070 発表（Today, I'd like to talk about ～.・First / Second / Finally・As you can see in this picture, ～.・in conclusion は L1069 から・Speak slowly. Pause after each point.）→ 1071〜1075 質疑応答（let me explain と great question は L1071 から・I'm not sure, but I think ～.・I have a question about ～.・look it up は L1074 から・Does anyone have any questions?）→ 1076〜1080 まとめ（3 つの 資料の 読みくらべ・深海を 守る・発表原稿を 書いて 書きなおす・さよなら・L1080 Thank you for listening. Are there any questions?）。
- 物語の 糸: L1050 で 青く ひかった 地図に したがい、海辺の 研究所から 海洋学者 マリーナ・ヴェイル博士（Dr. Marina Vale・銀の ダイバーウォッチ）が そうじゅうする 小さな 潜水艇 ブルーベル号（the Bluebell）で 3,800 メートルの 海の底へ（L1051）。ガラスの ドームと トンネルの 架空の 都「しんかいの都（Deep Sea City）」（ドームの 中は 空気が あって あんぜん）。案内役は 青い 光の 点を もつ ハダカイワシの ルミ（Lumi・口ぐせ Let's find out!・貝の スピーカーで 話す）。ルミの「ちしきの ランプ（Lamp of Knowledge）」に、ブロックの まとめごとに しんじゅ（pearl）が 1 つずつ（1055・1060・1065・1070・1075・1080）。サンゴ図書館の カメの 司書 オズウィンさん（Mr. Oswin・口ぐせ Check your sources!）は L1057 から。4 人の 研究の 問い: リコ「深海魚は どう やって えさを 見つける？」・ハル「ダイオウイカは どこまで 大きく なる？」・キコ「なぜ ひかる 生きものが いる？」・ビリモ「深海の 生きものは ねむる？」（科学者も まだ 調べて いる ところ）。L1079 で 大ドームの おくに ドラゴン・お城・ウサギ・星の ほられた かぎの かかった 古い 扉を 見つけ、L1080 の 研究発表会で 6 つめの しんじゅが そろうと 扉が ひらき、ひかる ページの 道と 物語を 語る 声 ― ワールド37「おとぎの迷宮」への つなぎ。
- フォニックス（`src/lib/curriculum/w36Phonics.ts`・`questions.ts` の `w36Question`。w35Question より 先に よぶ）:
  - 語根 bio（rule "root-bio"。focus "bio"）: 「bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？」（＿＿: the study of living things → biology / biography / biosphere）。12 語（bioluminescent・biodiversity・symbiosis・biomimicry など）。ワールド32 の geo（パーツと いみ → ことば）・ワールド30 の autobiography と かさならない よう、英語の せつめいだけで えらぶ 形に した。
  - 学習語彙の 強勢（rule "academic-stress"。focus は その ことば）: 「つよく いう ところ（●）が あう ことばは どれ？」（○●（2つの 音の 2ばんめを つよく）→ research / summary / topic）。16 語（research・compare・result・summary・evidence・discover・explain・information・experiment・conclusion・observe・example・presentation・important・topic・conclude）。まちがいは かならず ●○ の かたちが ちがう 表の ことば（テストで たしかめる）。
  - 発表の 区切り（rule "presentation-pause"。focus は 区切る ことばの 小文字）: 「発表の 文。ひと いき いれる（｜）のは どの ことばの あと？」（In short, the deep sea is dark and cold. → short / the / deep）。16 文。区切るのは はじめの ことばの あと・コンマ・ながい 主語の あと、まちがいは the ｜ deep sea の ような まとまりの とちゅう。
  - -ology と -ologist（rule "suffix-ology"。focus "-ology" "-ologist"）: 「-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？」（A marine ＿＿ studies animals and plants that live in the sea. → biologist / biology / biologyist）。12 語。強勢は いつも OL の ところ（bi-OL-o-gist）。
  - 数と たんいの 読みかた（rule "numbers-units"。focus は その 書きかた）: 「数と たんいの 読みかた。英語で どう よむ？」（−2°C（マイナス 2 ど）→ minus two degrees / two minus degrees / minus twenty degrees）。12 こ（3,800 meters・11,000 meters・200 meters・−2°C・4°C・350°C・13 meters・27 cm・11 km・400 times・3.8 km・100 km/h）。ワールド32（数・分数・割合）・ワールド34（びんめい・時刻）と かさならない たんいの 読みかた。読み上げは 英語の 読みかた（−2°C → minus two degrees）。
- フォーカスの ボタン（`phonicsButtons.ts` の `w36Example`）と 読み上げ（`vowelTeams.ts` の `w36Say`・いちばん 先に みる）は その focus で 問う ことば・文・数の 読みかたを よむ。L1050 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド36 の 決まりごと（範囲・ステージ5・B1・高校中級・タイトル 30・フォニックスの 順と 種類・-ology と -ologist の 両方・ふりかえり L1076〜1080 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（the reason why / according to / in short / the main point is / in conclusion / let me explain / great question / look it up）・台本は 英語だけで 320 語 以上＋95 語 以上の 読みもの・会話 7〜9 行（まとめ 10 行）・AI は 6 かい いじょう・日本語の ヒントは L1059 と L1061 だけ・AI 会話で 個人情報を きかない・L1051・L1057・L1078 は goalJa に「ほんとうの なまえや じゅうしょは いわなくて いいよ」・物語）の 8 テストを 追加。`tests/phonics-w36.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **ステージ5 の 量**: 計画書の ステージ5 共通（読む 250〜500 語・会話 6〜10 行・AI 6 往復 以上）に あわせ、ステージ4（台本 約 320 語・読みもの 60〜90 語・会話 6〜7 行）より ふやした（台本 340〜400 語・読みもの 100〜150 語・会話 7〜9 行）。1 レッスン 15〜20 分 の なかでは 250〜500 語の 読みものは ながすぎる ので、レッスン内は 100〜150 語に して、ながい 読みものは「えいごの としょかん」（追加インプット）で おぎなう 方針。まとめ台本（recap）の 3 分 以内の きまりも まもる（L1063 の 2 つめの 表現を みじかく した）。
- **学年の めやすは「高校中級」**: 計画書どおり（ワールド35 と おなじ）。
- **中心の表現を ととのえた**: 計画の「～」を 物語に あわせて きめた（L1053 sunlight can't reach this deep・L1055 ダイオウイカの 目・L1056 は 引用符を つかわず My research question is: How do deep-sea fish find food?・L1058 ハダカイワシは 夜に 上へ およぐ・L1063 マリンスノーの 3 文 要約・L1064 は 引用符なしの Take notes: glow, food, dark.・L1067 dark / cold / pressure の 3 点・L1072 about four degrees・L1076 12 メートルと 13 メートル・L1078 ハダカイワシの 発表・L1079 In short, we learned how to research, summarize and present.）。L1079 は 計画の「According to / In short / Let me explain」の うち、さよならの 回に しぜんな In short を 中心に した（ほかの 2 つは 会話と 台本で つかう）。
- **事実の あつかい**: 深海の 事実は たしかな もの だけ（光が よく とどくのは 約 200 m・1,000 m より 深いと 真っ暗・いちばん 深い 所は 約 11,000 m・深い 海の 水は 約 2〜4 ど・熱水は 350 ど 以上・4,000 m で 水圧は 約 400 倍・ダイオウイカの 目は 約 27 cm で 体は 大きい もので 12〜13 m・マリンスノー・プラスチックが いちばん 深い 海溝でも 見つかって いる）。わからない ことは「Scientists are still finding out.」と いう（ビリモの「深海の 生きものは ねむる？」など）。しんかいの都・ブルーベル号・本の 名前などは 架空。あやしい ウェブサイトの 回（L1059）は 架空の ページで、プレゼントの リンクを おさない ことも おしえる。
- **あんぜん**: 子どもは いつも ミス・エマと ヴェイル博士と いっしょ。潜水艇は 大人が そうじゅうし、ドームの 外には 出ない。深海は こわい 場所では なく ふしぎで すてきな 場所 として えがく。
- **新しい 話し手は 増やさない**: ルミ・ヴェイル博士・オズウィンさんは 台本の なかか、ビリモが「I'm playing ～!」と やくを する。
- **フォニックスの 記号**: −2°C は ふつうの ハイフンでは なく マイナス記号（−）に した（"-" で はじまる focus は「おわりの おと」の ボタンに なって しまう ため。テストで みつけて なおした）。区切りの 文の can't は ボタンの きまり（2 語め いこうに アポストロフィを 入れない）に あわせて cannot に した。
- **作りかた**: ワールド35 と おなじく 下書きの きまり（`.tmp/w36/RULES.md`・`spec.mjs`）と チェックの スクリプト（`check-part.mjs`）を 書き、30 レッスンを 3 つの まとまり（1051〜1060・1061〜1070・1071〜1080）で 並行して 書き、まとめてから 自分で 見なおした。なおした ところ: まとまりの あいだで かさなった 単語 6 こ（vampire squid → drift・step → point・listener → explain・dinner plate → giant・time limit → next question・cheer → clap）、L1080 の ビリモへの こたえ（ねむりは もう ビリモの 研究の 問いなので「発表で いって いた とおり」に）、L1071 の「日の光は 200 m までしか とどかない」を「ほとんどの 日の光は 約 200 m で とまる」に（事実を ただしく）。

### 例（L1061「In Short」）
- 表現（core）: In short, anglerfish use light to catch food. ／ What's the most important part? ― They use a glowing lure. ／ That's too long. Can you say it in one sentence?
- 読みもの（台本より）: "How Anglerfish Catch Their Food. Anglerfish live in the deep sea, where it is completely dark. Food is hard to find down there, so many anglerfish don't swim around looking for it. Instead, they wait. Some anglerfish have a glowing lure on their head, which looks a little like a fishing rod with a light at the end. … Scientists are still finding out more about these amazing fish."
- 会話: Riko「This page about anglerfish is so long. It took me five minutes to read!」 Haru「That's too long for our talk. Can you say it in one sentence?」 … Kiko「Wait, that's still long! What's the most important part?」 … Riko「In short, anglerfish use light to catch food.」 Kiko「That's so clear! Where did you find that?」
- フォニックス: In short, the deep sea is dark and cold ／ Anglerfish live in the dark, so they make their own light ／ The animals that live down there have special bodies ／ As you know, sunlight cannot reach the bottom（問題は「発表の 文。ひと いき いれる（｜）のは どの ことばの あと？」→ short ／ the ／ deep）

### 確認
- `node .tmp/w36/check-part.mjs content/curriculum/worlds/world-36.json`: OK
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 70 ファイル・2,323 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 264 → 270 kB、/lesson/[lessonNo] 270 → 275 kB、/gacha 253 → 258 kB、/test/[assessmentId] 252 → 258 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド36 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 53`（L1041〜1060）: 63 ページ。`--pack 54`（L1061〜1080）: 63 ページ

## WORLD — ワールド37「おとぎの迷宮」（L1081〜1110・ステージ5・B1+・高校中級）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-37.json` を 新しく 作成（30 レッスン、ステージ5「せかいへ はばたく」の 2 つめの ワールド。`level` は 計画の 表どおり B1+、`school.grade` は「高校中級」）。計画書 §10 の タイトル・会話シーンどおり（中心の表現の「～」や 引用符は 下の「決めたこと」の とおり ととのえた）。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 1,110 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30・ワールドの なかで かさなり なし・ワールド36 とも かさなり なし）、フォニックスの ことば 106、会話の セリフ 271 行（1 回 7〜9 行、ブロックの まとめ L1085・1090・1095・1100・1105・1110 は 10 行まで）、AI 会話 30（goalJa に「6 かい いじょう やりとり」と、AI が「And then what happened?」「Why?」と きく・反対の 立場を とる ことを 明記）、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 390 語・最少 349 語・最大 411 語）で、まいかい 104〜170 語（平均 約 125 語）の「読みもの」（迷宮の 入口の メモ・物語の ページ・なぞなぞカード・ねがいの 泉の かんばん・ゲームカード・物語マップ・書き出しの 工房カード・2 つの バージョンの 段落・語りの カード・感想と 書きなおし・長めの お話・オオカミが 語る お話・本の うら表紙・フェスティバルの プログラム など）を 読む。日本語の ヒントは 2 回だけ（L1087「Show, don't tell（見せて つたえる）」・L1094「had never seen（いちども 見た ことが なかった）」）。
- ブロック構成: 1081〜1085 物語の 型（Every path in this maze tells a story.・かしこい ウサギ・月の むかし話と ほんとうの りゆう・せかいの 物語の 5 つの 型・The lesson of this story is: Don't give up.）→ 1086〜1090 物語の 技法（場所・登場人物・問題・Show, don't tell・as ～ as は L1088 から・音の ことば Creak! The old door slowly opened.・so ～ that は L1090 から）→ 1091〜1095 もしもの 話（If I were は L1091 から・I wish I could は L1092 から・What would you do if は L1093 から・had never は L1094 から・If I had は L1095 から）→ 1096〜1100 自分の 物語を 書く（主人公・書き出し On the coldest night of the year, ～.・Just then は L1098 から・In the end は L1099 から・1,100 回 記念 パーティー）→ 1101〜1105 語る（間・小さな 声・BOO!・Can you guess what happened next?・I loved the part where ～. Maybe you could ～.・書きなおし・語りの 夜）→ 1106〜1110 まとめ（長めの お話・What if は L1107 から・さいごの 物語・さよなら・L1110 Every one of us has a story to tell.）。
- 物語の 糸: L1080 で ひらいた 扉から ひかる ページの みちを ぬけ、本だなと 紙の 葉っぱの 生けがきで できた 架空の「おとぎの迷宮（Labyrinth of Tales）」へ（ヴェイル博士と ルミは 扉で 見おくり）。案内役は 赤い マントで 羽ペンを もつ 灰色の ネズミ ニブ（Nib・口ぐせ And then what happened?）。迷宮の「物語の 本（Storybook）」の さいごの 6 ページは まっしろで、ブロックの まとめごとに「物語の ひみつ」が 1 つずつ 金の ページ（golden page）に なる（1085・1090・1095・1100・1105・1110）。オリジナルの お話: かしこい ウサギと トラ（にんじんは 1,000 まで かぞえないと あまく ならない）・月が 光を わけて あげる なぜなぜ話・巣を 3 回 つくる 小鳥 ピップ・こおりの 王国（羊かいの オレンと おばあさんが 太陽の 鳥の 金の 羽を さがす。へびは ていねいに たのむと 羽を かえして くれる）・年とった 金色の 竜 サフラン（L1091〜）・ねがいの 泉・山の むらの 女の子 ペル（いちども 海を 見た ことが なかった）・語り部の ウィラおばあさん（L1101〜、だんろの 部屋）・雪の ランタンに 火を ともす カタツムリの ドット・歌を きんじた 王さま（女の子 テスの 子守歌で 気が かわる）・オオカミが 語る「まいごの 子ヒツジ」。4 人の 物語: キコ「The Girl Who Talked to the Wind」（風と 話せる 女の子 アリアと、いちばん 年下の 風）・リコ「The Lighthouse Cat」（ねこの ペッパー）・ハル「The Boy and the Stone Giant」（レオと さびしい 石の 巨人）・ビリモ「The Dragon Who Sneezed Glitter」（くしゃみで ラメを 出す 竜 フィズ）。L1109 で 出口の まるい まどから みどりの 高原が 見え、L1110 の 物語フェスティバルで 6 まいめの 金の ページが そろい、本から むらさきの おし花と「Come to the Highlands of the Heart」の メモ ― ワールド38「こころの高原」への つなぎ。
- フォニックス（`src/lib/curriculum/w37Phonics.ts`・`questions.ts` の `w37Question`。w36Question より 先に よぶ）:
  - 物語の 動詞（rule "story-verbs"。focus は その ことば）: 「物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？」（speak very quietly, using only your breath → ＿＿ → whisper / grin / stumble）。12 語（whisper・glimmer・tremble・gasp・stumble・glance・shiver・sparkle・wander・grin・mutter・flutter）。まちがいは いみが はっきり ちがう 表の 動詞（tremble と shiver、glimmer と sparkle の ような にた いみは まちがいに しない）。
  - 音の ことば（rule "sound-words"。focus は その ことば）: 「音の ことば。この 場面の 音は どれ？」（The frog jumped into the pond. ＿＿! → splash / creak / hiss）。12 語（thud・rustle・sizzle・drip・boom・crackle・hiss・whoosh・clang・crash・splash・creak）。せつめいに 日本語の 音（ガシャン・ギーッ）。crash は ワールド4 の cr、rustle は ワールド19 の -stle と ちがう 問い。
  - 語りの 間（rule "suspense-pause"。focus は 間を とる ことばの 小文字）: 「お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？」（She opened the box, and inside was a tiny dragon → was / She / tiny）。16 文。ワールド36 の 発表の 区切り（まとまりの おわり）と ちがい、びっくりの すぐ まえで 間を とる。
  - -ly の 副詞（rule "adverb-ly"。focus "-ly"）: 「どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？」（The cat crept ＿＿ toward the bird, without making a sound. → silently / proudly / eagerly）。12 語。ワールド18 の -ly（つづりの かわりかた）と かさならない よう、物語の 文に あう いみを えらぶ 形に して、せつめいで つくりかた（gentle → gently・careful → carefully）を おさらい。
  - たとえ（rule "simile"。focus "as" と "like"）: 「たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？」（as brave as a ＿＿（とても ゆうかん）→ lion / mouse / snail）。12 こ（as brave as a lion・as quiet as a mouse・as busy as a bee・as cold as ice・as light as a feather・as slow as a snail・as white as snow・as hard as a rock・like a shooting star・sleep like a log・swim like a fish・run like the wind）。
- フォーカスの ボタン（`phonicsButtons.ts` の `w37Example`）と 読み上げ（`vowelTeams.ts` の `w37Say`・いちばん 先に みる）は その focus で 問う ことば・文・たとえを よむ。L1080 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド37 の 決まりごと（範囲・ステージ5・B1+・高校中級・タイトル 30・フォニックスの 順と 種類・たとえは as と like の 両方・ふりかえり L1106〜1110 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（as ～ as / so ～ that / If I were / I wish I could / What would you do if / had never / If I had / Just then / In the end / What if）・台本は 英語だけで 320 語 以上＋95 語 以上の 読みもの・会話 7〜9 行（まとめ 10 行）・AI は 6 かい いじょう・日本語の ヒントは L1087 と L1094 だけ・AI 会話で 個人情報を きかない・こわい ことば（kill・blood・dead など）を つかわない・L1081・L1096・L1108 は goalJa に「ほんとうの なまえや じゅうしょは いわなくて いいよ」・物語）の 8 テストを 追加。`tests/phonics-w37.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **レベルは B1+**: 計画の ワールド一覧と ワールドの ファイルの テスト（ステージ・レベルは 計画どおり）に あわせ、world-37.json の `level` は B1+（ワールド36 は B1）。量は ワールド36 と おなじ ステージ5 の 量（台本 340〜400 語・読みもの 100〜150 語・会話 7〜9 行・AI 6 かい いじょう）。L1106「長めの お話」だけ 読みものを 170 語まで（計画の 400〜500 語の 物語は「えいごの としょかん」で おぎなう 方針は ワールド36 と おなじ）。
- **中心の表現を ととのえた**: 台本の きまり（" は 読みものの 2 つ だけ）と スペル問題の きまり（core に ― ～ を 入れない）の ため、引用符や「～」を つかわない 形に した: L1085 The lesson of this story is: Don't give up.・L1087 Her hands were shaking.（(= She was scared.) は 2 つめの 表現と 台本で せつめい）・L1095 If I had three wishes, I would ask for a flying bike, a library in my room and a sunny day for everyone.・L1097 On the coldest night of the year, a strange wind knocked on her window.・L1101 Pause. Lower your voice. Then, BOO!・L1103 I loved the part where the dragon sneezed. Maybe you could tell us more about the castle.・L1104 I changed 'said' to 'whispered.'（' だけ）・L1105 Once, in a land beyond the clouds, there lived a girl who could talk to the wind.・L1108 My story is called The Girl Who Talked to the Wind.・L1109 If I were a storyteller, I would tell stories as bright as the stars.（計画の「If I were ～ / as ～ as ～」を 1 文に）。
- **お話は ぜんぶ オリジナル**: 有名な 昔話・童話・映画の 名前や すじは つかわない（「こおりの 王国」は 羊かいの 男の子と おばあさんの 話に して、よく しられた 作品に にない ように した）。「せかいの 物語の 型」は 一般的な いいかた（ゆうかんな 子ども・3 回・かしこい 小さな 動物・魔法の 道具・旅）と オリジナルの 小さな 例だけ。月の 回は むかし話の あとに ほんとうの りゆう（太陽が いつも 半分を てらし、見える 部分が かわる・約 29.5 日）を ミス・エマが せつめい。
- **あんぜん**: こわい ところは「きしむ 扉の むこうは ねむそうな ねこ」「ベッドの 下は 子犬」の ような 楽しい どきどき だけ。わるもの（トラ・王さま・へび・オオカミ）は ちょっと 不きげんな だけで、さいごは かわる・じつは やさしい。物語の 子どもも おばあさんや 大人と いっしょ（オレン・ペル・テス）。ねがいは 「やさしい ねがい」で、3 つの ねがいの うち 1 つは だれかの ため。感想は「よかった ところ → やさしい アイデア 1 つ」。
- **新しい 話し手は 増やさない**: ニブ・サフラン・ウィラおばあさん・ねがいの 泉は 台本の なかか、ビリモが「I'm playing ～!」と やくを する。
- **フォニックスの 記号**: たとえの focus は さいしょ "as…as" に したが、ぜんたいの テスト（フォニックスの ことばは その回の focus を ふくむ）に あわせて "as" に した。語りの 間の 文は ボタンの きまりに あわせて アポストロフィを 入れない。
- **作りかた**: ワールド36 と おなじく 下書きの きまり（`.tmp/w37/RULES.md`・`spec.mjs`）と チェックの スクリプト（`check-part.mjs`。こわい ことばの チェックと「金の ページは まとめの 回 だけ」を 追加）を 書き、30 レッスンを 3 つの まとまり（1081〜1090・1091〜1100・1101〜1110）で 並行して 書き、まとめてから 自分で ぜんぶ 読みなおした。なおした ところ: まとまりの あいだで くいちがった アリアの 風（L1108 の「年とった 南風」→ L1098・1099 と おなじ「いちばん 年下の 風」。日本語訳も）、L1105 の 風の 声（rough and tired → soft and a little sad）、金の ページの ことば（L1105 を 3 つめと かさならない「a story comes alive when you tell it aloud」に、L1110 に 6 つめの ひみつ「every one of us has a story to tell」を 追加）、L1103 の 文の あいだの スペース、L1091 の まとめ台本が 3 分を 0.6 秒 こえたので 2 つめの 表現を みじかく（To the highest mountain!）。単語の かさなりは 1 こ（tale → L1084 は legend）。

### 例（L1087「Show, Don't Tell」）
- 表現（core）: Her hands were shaking. ／ How do we know Oren is cold? ― His teeth are chattering. ／ Don't say she was happy. Show it! ― She jumped up and laughed.
- 読みもの（台本より）: "Version A: Oren was scared and cold. His grandmother was worried. Version B: Oren stood at the bottom of the icy mountain. His hands were shaking, and his teeth chattered. Above him, the path disappeared into the clouds. His grandmother pulled her scarf tighter. She didn't say anything, but she held his hand a little more firmly. … Maybe, he whispered, the kingdom isn't completely frozen yet."
- 会話: Ms. Emma「Listen to this. Oren was scared. Is that a good sentence?」 Haru「It's OK, but it's a little boring. Show, don't tell!」 Kiko「Her hands were shaking. That's how I would show a scared girl.」 … Riko「Why do you think so? Telling is faster.」 Kiko「It's faster, but showing makes a picture in your head. Don't say she was happy. Show it! She jumped up and laughed.」
- フォニックス: drip ／ boom ／ crackle（問題は「音の ことば。この 場面の 音は どれ？」→ Dry sticks are burning in the campfire. ＿＿! → crackle / splash / clang）

### 確認
- `node .tmp/w37/check-part.mjs content/curriculum/worlds/world-37.json`: OK
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 71 ファイル・2,374 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 270 → 274 kB、/lesson/[lessonNo] 275 → 280 kB、/gacha 258 → 262 kB、/test/[assessmentId] 258 → 262 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド37 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 55`（L1081〜1100）: 63 ページ（L1101〜1120 の パック56 は ワールド38 が できてから）

## WORLD — ワールド38「こころの高原」（L1111〜1140・ステージ5・B1+・高校中級）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-38.json` を 新しく 作成（30 レッスン、ステージ5「せかいへ はばたく」の 3 つめの ワールド。`level` は 計画の 表どおり B1+、`school.grade` は「高校中級」）。計画書 §10 の タイトル・会話シーンどおり（中心の表現の「～」や「―」は 下の「決めたこと」の とおり ととのえた）。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 1,140 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30・ワールドの なかで かさなり なし・ワールド37 とも かさなり なし・この ワールドの フォニックスの ことばとも かさならない）、フォニックスの ことば 103、会話の セリフ 272 行（1 回 7〜9 行、ブロックの まとめ L1115・1120・1125・1130・1135・1140 は 10 行まで）、AI 会話 30（goalJa に「6 かい いじょう やりとり」と、AI が「How did you feel?」「Why?」と きく・「No.」と いったら べつの りゆうで せっとくする ことを 明記）、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 393 語・最少 368 語・最大 400 語）で、まいかい 109〜133 語（平均 約 122 語）の「読みもの」（高原の 門の かんばん・パフの 気持ちの 本・気持ちの 温度計カード・リコの 日記・ハルの 気持ちの 天気予報・なやみ相談コーナー・はげましカード・聞き上手ポスター・ふりかえりカード・ローワンおばあさんの 手紙・けんかを とく ポスター・ブラムさんへの 提案書・リコの スピーチ・インタビューの メモ・インタビュー記事・番組の プログラム・慣用句クイズ・キコの 手紙・やさしさの リレーの ポスター・キコの スピーチ など）を 読む。日本語の ヒントは 2 回だけ（L1114「embarrassed（はずかしい）」・L1136「a piece of cake（とても かんたん）」）。
- ブロック構成: 1111〜1115 気持ちの ことば（The weather here changes with your feelings.・over the moon・a little annoyed, not angry・embarrassed → relieved・気持ちの 天気予報）→ 1116〜1120 きく（That must be hard は L1116 から・I know how you feel は L1117 から・Do you want advice, or do you just want me to listen?・Cheer up!・Tell me what happened.）→ 1121〜1125 けんかと なかなおり（地図で けんか・I didn't mean to は L1122 から・I should have / I could have は L1123 から・Let's make up. Friends?・4 つの ステップ）→ 1126〜1130 せっとく（Wouldn't it be better if は L1126 から・Trust me. It'll be worth it.・If we do this, everyone will benefit.・I'd rather not は L1129 から・せっとく チャレンジ）→ 1131〜1135 インタビュー（I look up to ～ because ～.・How did you feel at that moment?・What was your childhood like?・'I never gave up,' she told me.・インタビュー番組）→ 1136〜1140 まとめ（慣用句クイズ・手紙・やさしさの リレー・さよなら・L1140 Words can heal hearts.）。
- 物語の 糸: L1110 の おし花の メモの とおり、迷宮の まるい 出口から（ニブが 見おくり）架空の「こころの高原（Highlands of the Heart）」へ。気持ちで 天気が かわる（かなしいと 小さな 雨雲・はずかしいと ピンクの きり・みんなで わらうと 日ざし・けんかすると こい きり）。案内役は 気持ちで 色が かわる 小さな 雲 パフ（Puff・口ぐせ How are you really feeling?）、とまる 家は 羊かいの ローワンおばあさん（毛糸の ぼうし・牧羊犬の ビスケット）の 石の 農家、村は ヘザーブルック。ハートの丘の 上の「大きな にじ」は 人びとが 気持ちを 話さなく なって 色が きえて いて、ブロックの まとめごとに 1 色ずつ もどる（1115 赤・1120 オレンジ・1125 黄・1130 みどり・1135 青・1140 むらさき → 6 色で かんせい）。できごと: ビリモが パンケーキで over the moon・ビスケットが くつしたを もって にげる（a little annoyed）・リコが 村の 子の まえで どろの 水たまりに しりもち（embarrassed → relieved）・キコの フルートの 高い 音が ピーッと なって おちこむ → ハルの はじめての ピアノ発表会の 話 → ビリモの あみものの なやみを リコが きくだけ → かんげい会で キコが さいごまで ふく・ハートの丘の いずみへの 地図で ハルと リコが けんか（こい きりが でるが、ミス・エマが みんなを とめて きりが うすく なるまで まつ。だれも あぶなく ない）→ あやまる → ふりかえりカード → 握手で なかなおり（きりが はれて いずみへ。ローワンおばあさんの 手紙）→ 村の 学校に ポスター・リコの 提案で 日の出を 見に 4 時半に 出発・ビリモの「Trust me.」で 尾根の みちから 雲海・ひとりで すわって いる はずかしがりの 男の子 フィンの ため、村の まとめ役 ブラムさん（灰色の 長い ひげ）に「なかよし ベンチ」を 提案 → つめたい みずうみでの およぎ（フィンの 兄 ローリーと お父さん）と すっぱい グーズベリー・ジュースを ていねいに ことわる → 村の 集会所で スピーチ、投票で ベンチに きまる・あこがれの 人（リコの おば・ハルの 水泳コーチ・キコの おじいちゃん・ビリモは パフ）→ インタビュー番組の ゲストは ローワンおばあさん（こどもの ころ 3 つの 丘を こえて 学校へ、試験に いちど おちたが 先生に はげまされ、高原の 動物の お医者さんに。いまは 引退して 羊かい）→ 村の 新聞の 記事「From Lambs to Legends」→ 番組で 青・慣用句クイズ・キコが 引っこした 友だち ソラに 手紙・できた ベンチで フィンに エリーが「Do you want to play?」（やさしさの リレー 42 こ）・さよならの さんぽで ビリモが ビスケットと わかれるのが さびしい（That must be hard for you. I should have noticed sooner.）→ 空が はじめて すっかり はれる・L1140 ハートの フェスティバルで むらさきが もどり、丘の てっぺんの 雲の 上に 大きな 円卓の ある 会議場と、せかいの 大陸から あつまる 子どもたち ― ワールド39「せかいの円卓」への つなぎ。
- フォニックス（`src/lib/curriculum/w38Phonics.ts`・`questions.ts` の `w38Question`。w37Question より 先に よぶ）:
  - 気持ちの ことばの つづり（rule "feeling-spelling"。focus は その ことば）: 「気持ちの ことばの つづり。ただしい つづりは どれ？」（I fell in front of everyone. I was so ＿＿.（はずかしい）→ embarrassed / embarassed / embarrased）。12 語（embarrassed・frustrated・relieved・annoyed・anxious・disappointed・jealous・confused・grateful・furious・lonely・exhausted）。まちがいは よく ある つづりの まちがい（rr・ss・ie・dis＋appoint・grate＋ful・音の ない h）。
  - 句動詞（rule "phrasal-verbs"。focus は その 句動詞）: 「気持ちの 句動詞。＿＿ に 入る ことばは どれ？」（Cheer ＿＿! You'll do better next time. → up / down / off）。12 こ（cheer up・calm down・make up・look up to・let down・get over・open up・count on・stand up for・put up with・work out・turn to）。sounds と せつめいで 音の つながり（cheer‿up = チアラップ）と 小さな ことばを つよく いう リズム（calm DOWN）。ワールド28 の 音の つながり（カタカナで えらぶ）と かさならない よう、いみに あう 小さな ことばを えらぶ 形。
  - 共感の イントネーション（rule "empathy-tone"。focus は 返事の 小文字）: 「共感の イントネーション。この 返事は どんな 声で いう？」（Kiko: I dropped my ice cream on the ground. → Oh no… → ↘ ひくく・ゆっくり・やさしく / ↗↘ 高く・明るく・大きく / ↗ さいごを 上げて きく）。12 この 返事（かなしい 話 ↘ Oh no・That must be hard・I'm so sorry・That's too bad／うれしい 話 ↗↘ That's great・Congratulations・Good for you・How wonderful／しんぱい・びっくりの はい・いいえ しつもん ↗ Really・Are you OK・Is everything all right・Did it hurt）。
  - 気持ちの 慣用句（rule "idioms"。focus は かぎの ことば）: 「気持ちの 慣用句。＿＿ に 入る ことばは どれ？」（I'm over the ＿＿!（とても うれしい）→ moon / sun / rain）。12 こ（over the moon・feel blue・a piece of cake・butterflies in my stomach・on cloud nine・break the ice・under the weather・keep your chin up・get cold feet・all ears・a heart of gold・lose your temper）。
  - 性格の ことば（rule "character-suffix"。focus "-ful" "-ive" "-ous"）: 「性格の ことば。＿＿ に 入る おわりは どれ？」（help＿＿（よく 手つだう）→ -ful / -ive / -ous）。12 語（helpful・thoughtful・cheerful・playful・creative・sensitive・supportive・attentive・generous・courageous・adventurous・humorous）。courage の e を のこす・create／adventure の e を とる も せつめい。
- フォーカスの ボタン（`phonicsButtons.ts` の `w38Example`）と 読み上げ（`vowelTeams.ts` の `w38Say`・いちばん 先に みる）は その focus で 問う ことば・句動詞・返事・慣用句を よむ（"-ful" "moon" だけで よまない）。性格の ことば だけで おわりが 1 しゅるいの 回（まえの ワールドの -ful の 回 など）では はたらかない ように して、L1110 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド38 の 決まりごと（範囲・ステージ5・B1+・高校中級・タイトル 30・フォニックスの 順と 種類・イントネーションは 3 しゅるい・性格の ことばの 回の focus は -ful／-ive／-ous・ふりかえり L1136〜1140 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（must be / I know how you feel / didn't mean to / should have・could have / Wouldn't it be better if / I'd rather not）・台本は 英語だけで 330 語 以上＋100 語 以上の 読みもの・会話 7〜9 行（まとめ 10 行）・AI は 6 かい いじょう・日本語の ヒントは L1114 と L1136 だけ・こころの あんぜん・物語）の 8 テストを 追加。`tests/phonics-w38.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **レベルは B1+**: 計画の ワールド一覧（stages.ts の WORLD_LEVELS も 38 は B1+）に あわせた。量は ワールド37 と おなじ ステージ5 の 量（台本 340〜400 語・読みもの 100〜150 語・会話 7〜9 行・AI 6 かい いじょう）。計画の「悩み相談の記事・インタビュー記事を読む／ 手紙・インタビュー記事（120 語）を書く」は 読みもの（なやみ相談コーナー 2 回・インタビュー記事・キコの 手紙）と AI 会話で あつかい、長い 作文は ワークシートと「えいごの としょかん」で おぎなう 方針は これまでと おなじ。
- **中心の表現を ととのえた**: スペル問題の きまり（core に ― ～ を 入れない）と 台本の きまり（" は 読みものの 2 つ だけ）の ため: L1124 Let's make up. Friends?（― Friends! は 会話と 台本で こたえる）・L1134 'I never gave up,' she told me.（' だけ）・L1135 Our guest today is Grandma Rowan.・L1139 That must be hard for you. I should have noticed sooner.（計画の「That must be hard. / I should have ～.」を 1 つの 場面の 2 文に）。タイトル L1112 は 計画どおり Not Just "Happy"（タイトルの " は まえの ワールドにも ある）。
- **こころの あんぜん**: なやみは どれも 小さな 日常の こと（フルートの 音・くつした・どろの 水たまり・あみもの・地図の けんか・引っこした 友だち）。病気・死・家族の もんだい・いじめの 場面は 入れない。けんかは 声が 大きく なる・だまる だけで、わるくちは 1 つも ない（チェックで hate・stupid・shut up などを きんし）。きりの 場面も「あぶなく ない・みんな いっしょ・ミス・エマが とめて まつ」と 台本で はっきり いう。聞き上手の ブロック（L1116・1118・1120）は 台本と goalJa の 両方で「ほんとうに つらい ことは おうちの 人や 先生に 話そう」。であい・あこがれの 人・インタビュー・手紙の 回（L1111・1131・1133・1137）は goalJa に「ほんとうの なまえや じゅうしょは いわなくて いいよ」。せっとくは「りゆうを いう・あいての 気持ちを かんがえる・No も うけいれる」形だけ、ことわる 回は「ことわられたら That's OK.」まで。みずうみの およぎは お父さんと いっしょの さそいで、子どもだけの 行動は ない。
- **新しい 話し手は 増やさない**: パフ・ローワンおばあさん・ブラムさん・フィンは 台本の なかか、ビリモが「I'm playing ～!」と やくを する。AI の starterEn で 子どもの なまえを なのらない（パートナーの きまりと ぶつからない ように チェックに 追加）。
- **フォニックスの 記号**: イントネーションの focus は 返事の 小文字（"that's great"）に して、読み上げは もとの 返事（That's great）を よむ（ボタンの きまり: アポストロフィは さいしょの ことばの なか だけ）。慣用句の focus は かぎの ことば（"moon"）に して、ぜんたいの テスト（ことばは focus を ふくむ）に あわせた。
- **作りかた**: ワールド37 と おなじく 下書きの きまり（`.tmp/w38/RULES.md`・`spec.mjs`）と チェックの スクリプト（`check-part.mjs`。きずつける ことばの チェック・「にじの 色が もどるのは まとめの 回 だけ」・各まとめの 色・goalJa の「おうちの 人」を 追加）を 書き、30 レッスンを 3 つの まとまり（1111〜1120・1121〜1130・1131〜1140）で 並行して 書き、まとめてから 自分で ぜんぶ 読みなおした。なおした ところ: まとまりの あいだで かさなった 単語 2 こ（L1123 mistake → regret、L1139 fork in the path → drawing。L1139 は さいしょ ワールド37 で つかった memory に して チェックで ひっかかったので、台本の「ビスケットの 絵を 毎月 おくる」に あう drawing に）、L1122 の なやみ相談の こたえの 文が 書いた 子を「He」と きめつけて いたので「Oops knocked over a friend's tower of blocks.」に。

### 例（L1116「That Must Be Hard」）
- 表現（core）: That must be hard. I'm sorry to hear that. ／ What's wrong? ― My flute keeps squeaking. ／ Do you want to talk about it? ― Yes, I'd like that.
- 読みもの（台本より）: "Dear Puff, I have a problem. I'm learning to ride a bike, but I keep falling off. My big sister rides so easily. I feel sad, and I want to give up. From, Wobbly Wheels. Dear Wobbly Wheels, thank you for telling me how you feel. That must be hard. … And if something ever feels really hard for a long time, talk to a grown-up you trust, like someone in your family or a teacher. Your friend, Puff."
- 会話: Riko「Kiko, there's a little rain cloud over your head. What's wrong?」 Kiko「My flute keeps squeaking. The party is on Saturday, and the high notes still sound terrible.」 Riko「That must be hard. I'm sorry to hear that.」 Haru「Do you want to talk about it?」 … Birimo「Oh no. Why do you think that's happening?」 Kiko「Maybe because I'm so worried. My fingers get stiff when I'm nervous.」
- フォニックス: cheer up ／ calm down ／ make up（問題は「気持ちの 句動詞。＿＿ に 入る ことばは どれ？」→ Cheer ＿＿! You'll do better next time.（げんきを 出す）→ up / down / off。せつめいで cheer‿up = チアラップ、up を つよく）

### 確認
- `node .tmp/w38/check-part.mjs content/curriculum/worlds/world-38.json`: OK
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 72 ファイル・2,425 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 274 → 279 kB、/lesson/[lessonNo] 280 → 284 kB、/gacha 262 → 267 kB、/test/[assessmentId] 262 → 267 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド38 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 56`（L1101〜1120）: 63 ページ／`--pack 57`（L1121〜1140、ぜんぶ ワールド38）: 63 ページ（PDF は git の 対象外）

## WORLD — ワールド39「せかいの円卓」（L1141〜1170・ステージ5・B1+・高校中級）（2026-11-26）

### やったこと
- `content/curriculum/worlds/world-39.json` を 新しく 作成（30 レッスン、ステージ5「せかいへ はばたく」の 4 つめの ワールド。`level` は 計画の 表どおり B1+、`school.grade` は「高校中級」）。計画書 §10 の タイトル・会話シーンどおり（中心の表現の「～」は 下の「決めたこと」の とおり ととのえた）。`npm run curriculum:index` で 索引（index.json・titles.json・bundledWorlds.ts）を 更新（ぜんぶで 1,170 レッスン）。
- 件数: レッスン 30、表現 90（core 30）、TPR 120、単語 120（core 30・ワールドの なかで かさなり なし・ワールド38 とも かさなり なし・この ワールドの フォニックスの ことばとも かさならない）、フォニックスの ことば 103、会話の セリフ 274 行（1 回 7〜9 行、ブロックの まとめ L1145・1150・1155・1160・1165・1170 は 10 行まで）、AI 会話 30（goalJa に「6 かい いじょう やりとり」と、AI が「Why?」と きく・はんたいの 意見を いう・べつの 立場を きく ことを 明記）、まとめハイライト 90。先生の台本は 英語だけ（1 回 平均 約 373 語・最少 346 語・最大 398 語）で、まいかい 104〜147 語（平均 約 117 語）の「読みもの」（円卓の かんばん・食べものの ファクトカード・アミナの 手紙・プリヤの ブログ・課題マップの 発表・農家の インタビュー・お店の おしらせ・海岸そうじの 報告・アンケート結果・ディベートの ルール・主張カード・反論カード・ディベートの 台本・わけあい 冷蔵庫の おしらせ・ダークスカイ アワーの ポスター・小さな 行動の 表・アイデアボード・行動計画・会議の じゅんびの こつ・開会スピーチ・提案書・質疑応答の メモ・円卓の やくそく・立場の ちがう 2 つの 記事・リコの 意見文・せかいへの メッセージ・お礼の カード・オービットの ことば）を 読む。日本語の ヒントは 2 回だけ（L1146「point of view（見かた・立場）」・L1151「debate（ディベート）」）。
- ブロック構成: 1141〜1145 せかいの 課題を 知る（Children from every continent sit at this table.・About one third of food is wasted.・Millions of people don't have clean water nearby.・Every child should be able to go to school.・課題マップ）→ 1146〜1150 いろいろな 立場（point of view は L1146 から・お店の 立場・However は L1148 から・It seems that は L1149 から・Moreover / Therefore は L1150 から）→ 1151〜1155 ディベート入門（ルール・We believe that は L1152 から・Our first point is・We disagree because は L1154 から・ミニ ディベート）→ 1156〜1160 解決策（One solution is・If everyone turned off the lights, we would ～ は L1157 から・小さな 行動・Let's combine our ideas.・行動計画）→ 1161〜1165 こども国際会議（1 チーム 2 分・開会スピーチ・We propose that は L1163 から・That's a great point. However, ～.・We all agree that ～.）→ 1166〜1170 まとめ（2 つの 記事・意見文・せかいへの メッセージ・さよなら・L1170 Together, we can make the world a better place.）。
- 物語の 糸: L1140 の つづきで、ハートの丘の てっぺんの 雲の 階段を のぼって 架空の「円卓の 会議場（Hall of the Round Table）」へ。議長は うかんで まわる 小さな 地球儀 オービット（Orbit・口ぐせ Every voice counts!）。円卓の まわりには 6 大陸の 子どもたち（アフリカの アミナ・アジアの プリヤ・ヨーロッパの ナディア・北アメリカの サム・南アメリカの マテオ・オセアニアの リアム、みんな 先生と いっしょ）。南極の いすは あいて いて「ペンギンから よろしく！」。4 週間後に「こども国際会議」。円卓の まわりの 6 つの ランタンは くらく、ブロックの まとめごとに 1 つずつ ともる（1145 知る ランタン・1150 いろいろな 見かたの ランタン・1155 ディベートの ランタン・1160 行動の ランタン・1165 合意の ランタン・1170 希望の ランタン）。できごと: ビリモが ビュッフェで 山もり → 食べものの むだ・アミナの 町の 新しい 井戸と ポンプ・プリヤの 町の 図書館バス・課題マップ（青・みどり・黄の ピン）→ マテオの おじさんの 足が 2 本 ある ニンジン・サムの おばさんの お店の「ワンキー ベジ ボックス」と 賞味期限・リアムの クラスの 海岸そうじ（手ぶくろ・大人が とがった ものを ひろう）・会議場の 40 人 アンケート（Everyone recycles! → It seems that ～）・4 つの 立場の 発表 → オービットの ディベートの 6 つの ルール・テーマ「学校に 畑を」（ハルと リコが 賛成、キコと ビリモが 反対。キコは 畑が すきだが 反対がわで 話す）・夏休みの 水やりで 反論・ミニ ディベートは 手を あげて 3 対 3 の 引き分け「りょうほう よい 点が あって、やさしかった。それが ほんとうの 勝ち」→ サムの 町の わけあい 冷蔵庫・ナディアの 町の ダークスカイ アワー（大きな 道と 駅の 明かりは つけたまま）・せかいの 問題に おちこむ キコに ミス・エマ「ぜんぶ 自分で なおさなくて いい。しんぱいなら 信じられる 大人に」→ キャプテン・タップ・冷蔵庫・ポスター・歌を あわせる（サムと ハルが あやまって 握手）・行動計画の 3 ステップ → 会議の リハーサル（3 分 20 秒 → 1 分 50 秒）・キコの 開会スピーチ・「学校に わけあい だな」の 提案・アミナ・マテオ・ナディアからの 質問（当番表・金曜の のこりは 給食室へ・くだものと ふくろの しまった おかしだけ）・「円卓の やくそく」に みんなで サイン → ナディアの 町の 新聞の 2 つの 記事（夜の 街灯を けす？ つける？）・リコと キコが ちがう 意見で どちらも 公平な 意見文・せかいへの メッセージ・6 人への お礼の カード → L1170 閉会式で 希望の ランタンが ともり、6 つ ぜんぶ かがやいて 円卓から 光が 雲の 上の 星へ。オービット「あの 星は すべての 旅が はじまった 場所を しめして いる」― ワールド40「はじまりの星」への つなぎ。
- フォニックス（`src/lib/curriculum/w39Phonics.ts`・`questions.ts` の `w39Question`。w38Question より 先に よぶ）:
  - 環境の ことばの パーツ（rule "eco-words"。focus は その ことば）: 「環境の ことばの パーツ。＿＿ に 入る パーツは どれ？」（re ＋ ＿＿ ＋ able（また 新しく つくれる）→ new / cycle / duce）。12 語（environment・sustainable・renewable・pollution・recycle・conservation・ecosystem・deforestation・global・endangered・solar・reusable）。e を とる 形（pollute → pollut＋ion・globe → glob＋al・use → us＋able）も せつめい。ワールド35・36 の 語根の 問題と かさならない ように、パーツを うめる 形に した。
  - 大きな 数と 割合（rule "big-numbers"。focus は その よみかた）: 「大きな 数と 割合。英語で どう よむ？」（1,000,000（0 が 6こ）→ one million / one billion / ten thousand）。12 こ（one million・ten million・one hundred million・one billion・eight billion・two point five million・half・one third・two thirds・a quarter・fifty percent・seventy percent）。まちがいは millions・percents・third/thirds・fifteen/fifty など よく ある まちがい。
  - ディベートの プロソディ（rule "debate-prosody"。focus は 文の はじめの 小文字）: 「ディベートの プロソディ。いちばん つよく いう ことばは どれ？」（We believe that schools should have gardens. → believe / we / that。音は 例文）。12 この 文の はじめ（Our main point is・Let me explain why・This is the key point・We believe that・We strongly believe・That is not true・Our first point is・Our second point is・Let me give an example・We disagree because・We do not agree・The other team said）。sounds は つよく いう ところを 大文字（we beLIEVE that）。
  - つなぎの ことば（rule "discourse-markers"。focus は 小文字）: 「つなぎの ことば。＿＿ に 入る ことばは どれ？」（Plastic is useful. ＿＿, it can harm the sea. → However / For example / In addition）。12 こ（However・Therefore・For example・Moreover・As a result・On the other hand・In addition・Instead・In conclusion・First of all・Finally・Because of this）。せつめいで よみかた（HOWever, ‖ はじめを つよく、コンマの あとに 間）。
  - ヘッジの ことば（rule "hedging"。focus は その ことば）: 「ヘッジの ことば。いいすぎない ことばは どれ？」（It will ＿＿ rain this afternoon.（たぶん）→ probably / definitely / never）。12 語（seem・appear・might・may・probably・possibly・perhaps・likely・usually・generally・almost・about）。まちがいは いいすぎの ことば（always・never・definitely・exactly・will・must など）。
- フォーカスの ボタン（`phonicsButtons.ts` の `w39Example`）と 読み上げ（`vowelTeams.ts` の `w39Say`・いちばん 先に みる）は その focus の ことば・数・文の はじめ・つなぎの ことばを よむ。ことばが 2 こ いじょうで ぜんぶ ワールド39 の 表に ある 回 だけで はたらき（about・may・half の 1 こだけの 回では はたらかない）、L1140 までの どの 回でも はたらかない ことを テストで たしかめる。
- テスト: `tests/curriculum.test.ts` に ワールド39 の 決まりごと（範囲・ステージ5・B1+・高校中級・タイトル 30・フォニックスの 順と 種類・ふりかえり L1166〜1170 は 5 つの きまりを ぜんぶ・core の 表現・文法の じゅんばん（point of view / However / It seems / Moreover・Therefore / We believe that / We disagree / If everyone ～ would / We propose that）・台本は 英語だけで 330 語 以上＋100 語 以上の 読みもの・会話 7〜9 行（まとめ 10 行）・AI は 6 かい いじょう・日本語の ヒントは L1146 と L1151 だけ・あんぜん・物語）の 8 テストを 追加。`tests/phonics-w39.test.ts`（13 テスト）を 追加。

### 決めたこと（理由）
- **レベルは B1+**: 計画の ワールド一覧（stages.ts の WORLD_LEVELS も 39 は B1+）に あわせた。量は ワールド38 と おなじ ステージ5 の 量（台本 340〜400 語・読みもの 100〜150 語・会話 7〜9 行・AI 6 かい いじょう）。計画の「立場のちがう 2〜3 の文章を読む」は L1166 の 2 つの 記事（1 つの 読みものに 143 語）、「意見文（120 語・両方の立場にふれる）を書く」は L1167 の リコの 意見文（147 語）を おてほんに 読む 形で あつかい、この 2 回だけ 読みものを 165 語まで に した。長い 作文は ワークシートと「えいごの としょかん」で おぎなう 方針は これまでと おなじ。
- **中心の表現を ととのえた**: スペル問題の きまり（core に ― ～ を 入れない）の ため、計画の「～」を 物語に あう ことばで うめた: L1146 From the farmer's point of view, every carrot is precious.・L1147 Shops throw away food because customers want perfect fruit.・L1150 Moreover, it saves money. Therefore, we should share extra food.・L1162 Welcome, everyone. Today, we'll talk about food waste.・L1163 We propose that every school has a sharing shelf. This will help reduce food waste.・L1164 That's a great point. However, someone needs to look after the shelf.・L1165 We all agree that no food should go to waste.・L1167 Some people think street lights should stay on all night. However, I believe we can turn some off.・L1168 Dear world, we children want a cleaner and kinder planet.・L1169 We believe that every point of view matters.（計画の「From ～'s point of view / However / We believe that ～」を 1 文に。However は 2 つめの 表現と 台本で）。
- **せかいの 課題の あつかい**: こわがらせない・だれも せめない・かならず「いま 人びとが して いる こと」と いっしょに 出す（井戸・図書館バス・ワンキー ベジ ボックス・海岸そうじ・わけあい 冷蔵庫）。国の なまえは 出さず 大陸だけ。ほんとうの 団体（UN・SDGs など）の なまえも 出さない。数字は ほんとうの ことを「about」で まるめて（食べものの やく 3 分の 1・地球の 表面の やく 70%・人口 やく 80 億人・きれいな 水が 近くに ない 人や 学校に 行けない 子は「millions」）、アンケートや 投票の 数は 物語の なかの 数。チェックで war・disaster・starving・poor people・ugly などを きんし（「ugly vegetables」では なく funny-shaped / wonky）。L1143・L1158 は 台本と goalJa の 両方で「ぜんぶ 自分で なおさなくて いい。せかいの ニュースで しんぱいに なったら おうちの 人や 先生に 話そう」。であい・スピーチ・メッセージの 回（L1141・1162・1168）は goalJa に「ほんとうの なまえや じゅうしょは いわなくて いいよ」。子どもの 行動は いつも 大人と いっしょ（海岸そうじは 手ぶくろと 大人、冷蔵庫や たなは 大人が 毎日 チェック）。
- **ディベートは かならず 両がわ**: テーマは 子どもに みぢかで 意見が わかれる「学校に 畑を」。「自分の 考えと ちがう がわで 話すと 人の 気持ちが わかる」と せつめいし、反論は We disagree because ～ で りゆうを いう 形だけ（You're wrong! と いわない）。さいごは 握手と おれい、引き分けでも「やさしかった ことが ほんとうの 勝ち」。記事も 2 つの 立場を おなじ くらいの 長さで 書き、リコと キコが ちがう 意見で どちらも 公平な 意見文を 書く。
- **新しい 話し手は 増やさない**: オービット・6 人の 子どもたち・マテオの おじさん・サムの おばさんは 台本の なかか、ビリモが「I'm playing ～!」と やくを する。AI の starterEn で 子どもの なまえを なのらない。
- **フォニックスの 記号**: ディベートの 文の はじめと つなぎの ことばの focus は 小文字（"we believe that" "however"）に して、読み上げは もとの 形（We believe that・However）を よむ。数は よみかたを ことばに（"one million"）して、数字は 問題の 表示（1,000,000）だけに した（ボタンの きまり: 英字・スペース・アポストロフィ だけ）。ディベートの ことばを L1151 に 入れると We believe that が L1152 より まえに 出るので、L1151 は Our main point is / Let me explain why / This is the key point に した。
- **作りかた**: ワールド38 と おなじく 下書きの きまり（`.tmp/w39/RULES.md`・`spec.mjs`）と チェックの スクリプト（`check-part.mjs`。こわい ことば・ほんとうの 団体の なまえ・「ランタンが ともるのは まとめの 回 だけ」・ランタンの なまえは その回まで 出さない・goalJa の「おうちの 人」を 追加）を 書き、30 レッスンを 3 つの まとまり（1141〜1150・1151〜1160・1161〜1170）で 並行して 書き、まとめてから 自分で ぜんぶ 読みなおした。なおした ところ: まとまりの あいだで かさなった 単語 3 こ（L1153 weed → sprout、L1155 audience → fair play、L1164 take turns → schedule）、L1161 の 台本が「行動計画は 学校の わけあい だな」と いって いて L1160 の「わけあい 冷蔵庫」と くいちがって いたので「冷蔵庫の 計画が できた。会議では どの 学校でも できる もっと 大きな アイデアを」に、オービットを さす ことばが it と he で まざって いたので he に そろえた（L1141・1145）、L1170 の フォニックスの せつめい（stress AM in exAMple）。

### 例（L1152「We Believe That…」）
- 表現（core）: We believe that schools should have gardens. ／ Which side are you on? ― We're the yes team. ／ What's your team's claim? ― Schools should have gardens.
- 読みもの（台本より）: "Claim Card. Topic: Schools should have gardens. Our side: Yes. Our claim: We believe that schools should have gardens. What is a school garden? It is a small piece of land where students grow vegetables, flowers or herbs. … Speak slowly, and stress the word believe. Don't say, Everybody knows this! Just say, We believe that, and give your reasons later. Remember: a strong claim is short, clear and kind."
- 会話: Birimo「The topic is, Schools should have gardens. Which side are you on, Haru?」 Haru「We're the yes team. Riko, do you want to say our claim?」 Riko「Sure. We believe that schools should have gardens.」 Kiko「Nice claim! But why gardens? Why not a bigger playground?」 … Ms. Emma「Remember, Birimo. Be tough on ideas, but kind to people.」
- フォニックス: We believe that ／ We strongly believe ／ That is not true（問題は「ディベートの プロソディ。いちばん つよく いう ことばは どれ？」→ We believe that schools should have gardens. → believe / we / that。せつめいで we beLIEVE that、さいごは ↘）

### 確認
- `node .tmp/w39/check-part.mjs content/curriculum/worlds/world-39.json`: OK
- `npm run curriculum:check`: 索引は 最新／`npm run library:check`: 最新
- `npx tsc --noEmit`: エラーなし
- `npx vitest run`: 73 ファイル・2,476 テスト すべて成功
- `npx next build`: 成功。First Load JS（前回の 記録 → 後）: /map 279 → 283 kB、/lesson/[lessonNo] 284 → 288 kB、/gacha 267 → 271 kB、/test/[assessmentId] 267 → 271 kB、/parent 162 → 162 kB、共有 102 → 102 kB（増えたのは ワールド39 の 問題の コードと 表と 索引の 1 ワールドぶん。レッスン本文は これまでどおり あとから 読む チャンク）
- `python worksheets/generate_worksheets.py --month --pack 58`（L1141〜1160）: 63 ページ（L1161〜1180 の パック59 は ワールド40 が できてから。PDF は git の 対象外）
