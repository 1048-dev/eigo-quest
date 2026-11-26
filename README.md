# Eigo Quest（えいごクエスト）

6〜12歳（字が読める子ども）向けの、月額制・毎日つづけるゲーミフィケーション英語学習Webアプリです。英語ゼロから、全員 Lesson 1 からはじめます（スキップ・レベル判定なし）。対応するA4教材も自動で生成します。

**学校テスト対策（教科書の単元・表現・筆記）× フォニックス × TPR（体で反応する反射神経）× 日常会話のインプットとアウトプット** を、1つのカリキュラムJSONにまとめています。アプリのレッスン・テスト・まとめ動画・AI会話・PDF教材は、すべてこのJSONから作られます。

- **全1,200レッスン（40ワールド×30・5ステージ）** が完成しています（run7: 小1〜小6 の 6 年間 使う 設計。週5レッスン×年40週 ≒ 6年）。ステージ1（W1〜12・L1〜360）は小1〜小6・中学準備のテーマで Pre-A1〜A1、ステージ2〜5（W13〜40）は A1+ → A2 → A2+ → B1 → B1+ へ進みます。フォニックスは文字の音26音から始まり、つづりのパターン・ことばのパーツ（接頭辞・接尾辞）・語根まで積み上げます。保護者には「学校の英語: 小N まで修了」も表示します。
- レッスン以外の毎日のインプットとして **えいごの としょかん**（/library: おはなし・チャンツ・フリートーク）と、年に1回の **力だめし**（/yearly）があります。
- 各レッスンの最後に **AIキャラ（ハル・リコ・キコ・ビリモがレッスンごとに交代）との英語の会話**（最後まで話すと +5コイン）、終わったあとに任意の **2〜3分「きょうのまとめ動画」**（レッスンデータから自動生成）があります。

```
content/curriculum/worlds/world-NN.json   ← カリキュラムの元データはここだけ（ワールドごと。索引 index.json・titles.json は npm run curriculum:index で作る）
        │
        ├─→ src/lib/curriculum   学習項目・テスト定義・問題をルールで展開
        │        ├─→ prisma/seed.ts   DBに投入
        │        └─→ API / 画面        レッスン・テスト・アリーナ・お宝アラート
        ├─→ src/lib/recap        きょうのまとめ動画の台本（時間つきセグメント）
        ├─→ src/lib/conversation AIキャラとの会話（Claude ＋ 台本フォールバック）
        └─→ worksheets/generate_worksheets.py   A4ワークシートPDF（同じ範囲ルール）
```

## 使い方

```bash
cp .env.example .env
```

```bash
docker compose up -d
```

```bash
npm install
```

```bash
npm run db:migrate
```

```bash
npm run db:seed
```

```bash
npm run dev
```

http://localhost:3000 を開くと、はじめてのときはスタート画面（`/welcome`）が出ます。「おうちの方：とうろく」で保護者アカウントを作ってお子さまを追加するか、「おためしで あそぶ」でログインせずにマップへ進みます（おためしは端末ごとの「おためし学習者」の記録で遊びます。ほかの人の記録とはまざりません。次からは `/` でそのままマップが開きます）。

開発用のデモ保護者が欲しいときは、seed のときに `SEED_DEMO_PARENT=1` を付けます（`demo-parent@example.com` / `demo-pass-1234` / 暗証番号 `1234`、子ども「リコ」）。

> マイグレーション（`prisma/migrations/`）には、保護者アカウント用の `20261125130000_parent_auth`（`Parent` のパスワード・暗証番号・設定、`Session` テーブル）、アバターとおためしの引き継ぎ用の `20261126090000_avatar_trial_carry`（`User.avatarCharacter`。既存の子どもには登録順の顔を入れる）、LINE ログイン用の `20261127090000_line_login`（`Parent.lineUserId` など。メール・パスワード・暗証番号を null 可に）、LINE の月間レポート用の `20261128090000_line_monthly`（`Parent.lineFriend`・`lineMonthlyEnabled`、`ReportDelivery` テーブル）、端末ごとの おためし学習者用の `20261129090000_trial_learner`（`User.isTrial`・`trialTokenHash`・`lastActiveAt`）、パスワードの再設定・メールアドレスの確認用の `20261130090000_password_reset`（`AuthToken` テーブル・`Session.lineReauthAt`）、DB で数えるレート制限用の `20261201090000_rate_limit_bucket`（`RateLimitBucket` テーブル）が含まれます。既存のDBでも `npm run db:migrate` → `npm run db:seed` をもう一度実行してください。
>
> `docker-compose.yml` は 5432 番を使います。ほかの PostgreSQL が 5432 を使っている PC では、`docker-compose.yml` のポートを `"5544:5432"` などに変え、`.env` の `DATABASE_URL`・`DIRECT_URL` も同じポートにしてください。
>
> インターネットに公開する（Vercel + Neon / Supabase）ときは [docs/run5/DEPLOY.md](docs/run5/DEPLOY.md) の手順で進めます（下の「公開」）。
>
> LINE（ログイン・月間レポート）を本番で使うときは [docs/run4/LINE-SETUP.md](docs/run4/LINE-SETUP.md) の手順で `.env` に値を入れます。入れていない間は LINE のボタンが出ず、レポートは送らずに `.data/line-outbox/` に書くだけ（dry-run）です。
>
> **DBが動いていないとき**: Docker・DB なしで `npm run dev` だけでも、エラー画面を出さずに「おためしモード」で遊べます（下の「DBが止まっていても動く『おためしモード』」）。クリアしたレッスンはそのブラウザにだけ記録され、マップに ✓ が付きます（コイン・習得率は保存されません）。登録・ログインの画面は「ただいまアカウント機能を利用できません」と案内し、「おためしで あそぶ」へ進めます。キャラクターの絵は `docs/night/screens/characters-preview.html` をブラウザで開くと確認できます。

| コマンド | 内容 |
|---|---|
| `npm test` | 単体テスト（vitest・41ファイル・1010件） |
| `npm run typecheck` | 型チェック |
| `npm run smoke -- http://localhost:3000` | Playwright でゲームの画面（マップ・各ワールド最初のレッスン・テスト・まとめ・ガチャなど）と保護者アカウントの画面（/welcome・/register・/login・/who・/parent・/setup-pin・/d/<token>・/forgot-password・/reset-password・/verify-email・/forgot-pin）を開き、ページエラー・console.error・5xx・404・エラー文言・読み込みで止まる を検出。スクリーンショットは `docs/night2/screens/`（2つ目の引数で保存先を指定）。DB なしでも動く。初回は `npx playwright install chromium` |
| `npm run smoke:offline -- <保存先> [--port 3100]` | つながらない DATABASE_URL で `next start` を起動 → スモーク（DB 停止中のアカウントの流れも確認）→ 停止 を1コマンドで。先に `npx next build`。ポートが使用中（古いサーバーの消し忘れ）なら次の空きポートを使う。40 ワールドで約 70 画面・20 分ほど |
| `npm run check:auth-db -- --db <テスト用URL> [--port 3457]` | 本物の DB で migrate deploy → seed → `next start` → 登録・子ども2人・切りかえ・回数制限・持ち主チェック・CSRF・退会後に何も残らないこと まで 41項目を HTTP で確認。**使い捨ての DB を指定すること**（中身を書きかえます） |
| `npx tsx scripts/carry-db-check.ts --db <テスト用URL> [--port 3458]` | 本物の DB + `next start` で、おためしの きろくの ひきつぎ（1回だけ・持ち主チェック）とアバターの選択・変更 を 18項目確認。**使い捨ての DB を指定すること** |
| `npm run check:line-db -- --db <テスト用URL> [--port 3461]` | 本物の DB + `next start` で LINE ログイン（state cookie・署名・コールバック・新規登録 → 暗証番号・連携/解除）を確認（LINE のサーバーには接続しない。ダミーの値で動かす）。**使い捨ての DB を指定すること** |
| `npm run check:reset-db -- --db <テスト用URL> [--port 3459] [--timeout 300]` | 本物の DB + `next start`（メールは outbox）で、パスワードを忘れた（登録の有無で同じ答え）→ メールのリンク → 再設定 → すべての端末でログアウト・リンクの2回目は だめ → 暗証番号を忘れた → 退会でトークンも消える を確認。**使い捨ての DB を指定すること** |
| `npm run trial:cleanup [-- --dry-run] [-- --days 60]` | 60日 遊ばれていない おためし学習者（と その学習記録）を消す。1日1回 cron で実行する想定（下の「端末ごとの おためし学習者」） |
| `npm run line:monthly [-- --dry-run] [-- --parent <id>]` | 月間レポート（PDF）を LINE で届ける。キーが無ければ dry-run（下の「LINE で月間レポート」） |
| `npm run check:line-monthly-db -- --db <テスト用URL> [--port 3463]` | 本物の DB + `next start` で webhook の署名・`line:monthly --dry-run`・ダウンロードページ・おうちの方 API・期限切れ・退会 まで 32項目を確認（LINE には接続しない）。**使い捨ての DB を指定すること** |
| `npm run check:run4-flow -- --db <テスト用URL> [--port 3475] [--timeout 900]` | 本物の DB + `next start` + ブラウザで、おためしで遊ぶ → 新規登録 → お子さまを追加（キャラクター）→ おためしの きろくを ひきつぐ → おうちの方ページに反映 → `line:monthly --dry-run` のリンクを開いて PDF まで を通しで確認（スクリーンショット `docs/run4/screens/p4-flow/`）。**使い捨ての DB を指定すること** |
| `npm run check:run5-flow -- --db <テスト用URL> [--port 3485] [--timeout 900]` | 本物の DB + `next start` + ブラウザで、2つのブラウザで おためし（きろく・コインが べつべつ）→ 新規登録 →「ひきつぐ？」に いいえ → おうちの方ページのボタンで ひきつぐ → パスワードを忘れた（outbox のメール）→ 再設定 → ほかの端末もログアウト → 暗証番号を忘れた → `line:monthly --dry-run`（`STORAGE_DRIVER=local`）のリンクで Node 製のレポート PDF とワークブック → cron・health まで 約60項目（スクリーンショット `docs/run5/screens/p4-flow/`）。**使い捨ての DB を指定すること** |
| （共通） | `*-check.ts` は どれも 進みぐあいを1行ずつ表示し、`--timeout <秒>`（既定 600〜900）で とちゅうでも止まります（`scripts/lib/checkKit.ts`）。Docker が使えないときは、使い捨ての PostgreSQL 16 を 5544 で動かしてから渡してください |
| `npm run screens:auth -- --db <テスト用URL>` | 本物の DB と DB 停止の両方で、保護者アカウントの画面を Playwright で操作してスクリーンショット（`docs/run3/screens/`） |
| `npx tsx scripts/e2e-smoke.ts http://localhost:3000` | 実サーバーとDBを使い、30日分のプレイ（ボス戦・アリーナ・お宝アラートまで）を早送りで実行 |
| `pip install -r worksheets/requirements.txt` | PDF生成に必要な reportlab をインストール |
| `npm run worksheets` | 全レッスン＋全テストのPDFを `worksheets/out/` に出力 |
| `python3 worksheets/generate_worksheets.py --lesson 1` | Lesson 1 の教材だけ出力 |
| `python3 worksheets/generate_worksheets.py --test boss --range 1-30` | ボス戦テスト（1〜30）を出力 |
| `npm run worksheets:month -- --pack 1` | 1か月ワークブック No.1（20レッスン＝平日ペースで約1か月を1冊。No.2 = L21〜40 …）を `worksheets/out/monthly/month-NN.pdf` に出力（`-- --world 13` で そのワールドに かかる冊） |
| `npm run worksheets:month -- --all` | 全レッスン分の 1か月ワークブックを出力（360レッスンで 18冊、1,200レッスンで 60冊） |
| `npm run curriculum:index` / `npm run curriculum:check` | `content/curriculum/worlds/` から 索引（index.json・titles.json・src/lib/curriculum/bundledWorlds.ts）を作る / 最新か確かめる（run7） |
| `npm run teacher:export [-- --from 1 --to 30] [-- --only-script]` | 先生の 台本を AI アバター動画サービス用に 書きだす（`exports/teacher/<0001>/` に script.txt・script.json・subtitles.vtt・slides.json、`exports/teacher/summary.csv` に 分数の 合計）。docs/run8/VIDEO-VENDORS.md（run8） |
| `npm run teacher:link -- link 12 <URL>` / `list` / `check [--head]` | できあがった 先生の 動画を レッスンに つなぐ（`content/teacher-videos.json`）。つないだ レッスンは バーチャル先生の かわりに 動画を 再生（run8） |
| `npm run worksheets:upload [-- --dry-run] [-- --pack 1 \| --world 1] [-- --force]` | `worksheets/out/monthly/month-NN.pdf` の 1か月ワークブックを置き場所（`STORAGE_DRIVER`）へアップロード。すでにあれば とばす。進みぐあいを表示・`--timeout`（既定600秒） |
| `npm run db:deploy` | `prisma migrate deploy`（本番の DB にマイグレーションを当てる。`DIRECT_URL` を使う） |
| `npm run vercel-build` | Vercel のビルド（`prisma generate` → 本番デプロイのときだけ `migrate deploy` → `next build`）。`vercel.json` から呼ばれる |
| `npx tsx scripts/prepare-report-font.ts` | 同梱のレポート用フォント（Noto Sans JP）を作り直す（fontkit の不具合よけに グリフを4バイト単位に うめる）。ふだんは不要 |

`ANTHROPIC_API_KEY` を設定すると、筆記テストのAI採点と、レッスン最後のAI会話（モデルは `CONVERSATION_MODEL`、既定 `claude-haiku-5-5`）が有効になります。未設定のときは、採点はルールベース、会話は台本の返事だけで動きます。開発中は `SKIP_DAILY_LOCK=1` で復習クエストの「翌日まで待つ」制限を外せます（まとめ・ボスには影響しません）。

## ディレクトリ構成

```
eigo-quest/
├── content/curriculum/
│   ├── worlds/world-NN.json  カリキュラム（ワールドごと 30レッスン。Lesson 1〜1200・40ワールド。サーバーだけが全ワールドを持ち、ブラウザ（おためし）はワールド単位であとから読む）。学校単元・表現・テストのポイント・TPR・フォニックス・単語・教師の台本・会話シーン・まとめ。年間計画は docs/curriculum-plan.md、6年計画は docs/curriculum-6year.md
│   ├── index.json            小さな索引（先生・レッスン数・ワールドごとの ステージ／レベル／範囲）。ブラウザにも のる
│   ├── titles.json           レッスンの タイトルの 索引（サーバー・ツール用）
│   └── monsters.json         モンスター図鑑・アバターショップ
├── prisma/
│   ├── schema.prisma         データベース設計（下記）
│   └── seed.ts               JSON → DB
├── src/lib/
│   ├── domain/               ★ 純粋関数（DBに依存しないので単体テストできる）
│   │   ├── config.ts         調整できる定数（コイン表・合格ライン・ガチャ排出率・忘却の閾値）
│   │   ├── coins.ts          コインの付与ロジック
│   │   ├── progression.ts    マップのノード並び・ロック解除・復習クエストの翌日オープン
│   │   ├── memory.ts         記憶モデル（忘却曲線）
│   │   ├── mastery.ts        習得率の計算
│   │   ├── treasureAlert.ts  お宝復習アラートの判定
│   │   ├── arena.ts          復習アリーナ（開放条件・忘れかけ優先の出題）
│   │   ├── gacha.ts          ガチャ
│   │   └── dates.ts          APP_TIMEZONE 基準の日付
│   ├── curriculum/
│   │   ├── index.ts          JSON → 学習項目・テスト定義
│   │   ├── questions.ts      問題の生成（seed付きで再現できる）・1日のレッスン構成。フォニックス問題はその回のフォーカスで形が変わる（最初の音・ダイグラフ・ブレンド・語末・マジック e・母音チーム・r のつく母音・soft c/g・-ed・サイトワード・音節の数）
│   │   ├── vowelTeams.ts     母音チームの音の表（oo の ウー／ウ、ow の オウ／アウ）とフォーカスボタンの読み上げ（focusSay）
│   │   ├── rControlled.ts    r のつく母音（ar or er ir ur air ear）
│   │   └── w10Phonics.ts / w11Phonics.ts / w12Phonics.ts   ワールド10〜12 の音の表（soft c/g・-y・-le・-ed・サイトワード・多音節語）
│   ├── recap/script.ts       きょうのまとめ動画の台本ビルダー（純粋関数・2〜3分に調整）
│   ├── conversation/
│   │   ├── engine.ts         台本フォールバックの会話エンジン（サーバーとクライアントの両方で使う）
│   │   └── aiConversation.ts Claude で返事を作る（安全なシステムプロンプト・個人情報の伏せ字・失敗時は台本）
│   ├── grading/
│   │   ├── localGrader.ts    ルール採点（大文字・句読点・編集距離。学校モードとやさしいモード）
│   │   └── aiGrader.ts       Claude API による採点（未確定の答えだけを送る。キャッシュとフォールバックあり）
│   ├── speech/
│   │   ├── tts.ts            音声再生（0.8 / 1.0 / 1.2 倍速）・日英まじりの読み上げ
│   │   └── pronunciation.ts  発音判定（Web Speech API と採点関数）
│   ├── services/
│   │   ├── progressService.ts   ドメインロジックとDBをつなぐ層（トランザクション・台帳・記憶の更新）
│   │   ├── parentService.ts     保護者・子ども・ようす・設定・退会（子どもの処理はすべて parentId で絞る）
│   │   └── dailyLimit.ts        1日のレッスン回数の上限
│   │   ├── monthlyDeliveryService.ts  LINE の月間レポートの作成・送信・dry-run・期限切れの掃除
│   ├── auth/                 保護者アカウント（scrypt・セッション・cookie・Origin 確認・レート制限・currentUserId()）。line.ts は LINE ログイン（OAuth / OIDC・PKCE・署名つき state cookie）
│   ├── line/messaging.ts     LINE Messaging API（push・Flex メッセージ・webhook の署名確認）
│   ├── report/               月間レポートの中身（monthlyReport.ts・純粋関数）と PDF の作成（pdf.ts。pdf-lib + Noto Sans JP のサブセット）
│   ├── storage/              ファイルの置き場所（local / S3 互換。fetch + AWS Signature V4）
│   ├── mail/                 メール送信（resend / smtp / outbox）と文面
│   ├── cron.ts               Cron の合い言葉（CRON_SECRET）の確認
│   ├── offline/              おためしモードの内蔵データ・端末の記録（localProgress.ts）・おためしの きろく（trialLog.ts）
│   ├── db.ts                 Prismaクライアント
├── src/middleware.ts         /api の POST/PUT/PATCH/DELETE の Origin を確認（CSRF 対策）
├── src/app/
│   ├── page.tsx              入口（cookie だけで /who・/map・/welcome にふりわけ）
│   ├── welcome/ register/ login/   スタート・保護者の登録・ログイン
│   ├── setup-pin/            LINE で登録した保護者が暗証番号を決める
│   ├── d/[token]/            LINE で届いたレポート・ワークブックのダウンロードページ（ログイン不要・トークンつき）
│   ├── who/                  「だれが あそぶ？」（子どもを選ぶ・おためしの きろくの ひきつぎ）
│   ├── parent/               おうちの方ページ（暗証番号で保護。ようす・回数制限・子どもの編集・暗証番号/パスワード変更・退会）
│   ├── map/                  RPG風ステージマップ（40ワールド。描くのは いまのワールド ± 1）＋お宝アラートのポップアップ
│   ├── lesson/[lessonNo]/    1日のレッスン（9ステップ・さいごは AI会話）
│   ├── recap/[lessonNo]/     きょうのまとめ動画（自動再生）
│   ├── test/[assessmentId]/  復習クエスト / まとめ / ボス / アリーナ / お宝
│   ├── dashboard/            習得率ダッシュボード（レーダーチャート・推移・苦手）
│   ├── arena/ gacha/ ranking/
│   └── api/                  ルートハンドラ
├── src/components/           WorldMap / QuestionView / TestRunner / LessonSteps / ConversationStep / RecapPlayer / MasteryRadar / account（AccountBar・PinPad）/ parent ...
├── worksheets/generate_worksheets.py   A4 PDF生成
├── scripts/e2e-smoke.ts      30日分の通しプレイを早送りで実行（DB が必要）
├── scripts/smoke.ts          Playwright の全画面スモークテスト（DB なしでも可）。smoke-offline.ts は DB 停止での起動〜スモークを1コマンドで
├── scripts/auth-db-check.ts / auth-ui-screens.ts   本物の DB での保護者アカウントの通し確認 / 画面の確認
├── scripts/carry-db-check.ts 本物の DB での「おためしの きろくの ひきつぎ」とアバターの通し確認
├── scripts/line-db-check.ts / line-monthly-db-check.ts / run4-flow-check.ts   本物の DB での LINE ログイン / 月間レポート / run4 の通し（ブラウザ）確認
├── scripts/line-monthly.ts   月間レポートを LINE で届けるコマンド（npm run line:monthly）
├── scripts/cleanup-trial.ts  使われなくなった おためし学習者の そうじ（npm run trial:cleanup）
├── scripts/reset-db-check.ts / run5-flow-check.ts   本物の DB での パスワード再設定 / run5 の通し（ブラウザ）確認。共通部品は scripts/lib/checkKit.ts
├── scripts/upload-worksheets.ts / vercel-build.mjs / prepare-report-font.ts   ワークブックのアップロード / Vercel のビルド / レポート用フォントの準備
├── assets/fonts/             レポート PDF 用の Noto Sans JP（SIL Open Font License・OFL.txt）
├── vercel.json               Vercel の設定（ビルドコマンド・東京リージョン・Cron Jobs）
├── docs/curriculum-plan.md   年間計画（12ワールド×30）と全ワールドのレッスン詳細表
├── docs/night/ docs/night2/ docs/run3/ docs/run4/ docs/run5/  夜間作業の記録（PROGRESS.md・MORNING.md・キャラクタープレビュー・スクリーンショット）。LINE の設定手順は docs/run4/LINE-SETUP.md、公開の手順は docs/run5/DEPLOY.md
└── tests/                    単体テスト（カリキュラム検証・フォニックス問題・まとめ動画・会話・イラスト など）
```

## 世界観とデザイン（RPG風）

| キャラクター | 設定 | 登場する場所 |
|---|---|---|
| **ハル**（10歳・男の子） | 主人公。ゆうしゃ見習い。プレイヤー自身 | ステータスボード、マップの現在地、ボス戦 |
| **リコ**（8歳・女の子） | 仲間。フォニックス使い | 同上 |
| **キコ**（7歳・女の子） | 仲間。ことばコレクター | 同上 |
| **ビリモ** | 相棒の電撃モンスター（オリジナル）。口ぐせは「〜ビリ！」 | ステータスボードの吹き出し、マップのナビ、お宝アラート、まとめ動画のホスト |
| **エマ先生** | 英語の先生（大人） | レッスンのAI教師、会話シーン |

- キャラクターはすべてオリジナルのSVG（`src/components/characters/`）。3DCGアニメ映画の子どもの頭身（髪をふくめて ハル≒4.7頭身・リコ≒4.4・キコ≒4.2）で、並べるときはリコ＝ハル×0.92、キコ＝ハル×0.88 の大きさにします。設定は `src/lib/game/characters.ts`。
- ビリモのセリフは `src/lib/game/companion.ts` が状況（今日のクエスト・復習クエスト待ち・ボス・お宝・苦手な力）から選ぶ。
- パーティのレベルは5レッスン（まとめテスト1回）ごとに上がる。
- テーマは `src/app/globals.css`：羊皮紙＋金の二重枠のパネル（`.card` / `.rpg-wood`）、立体ボタン（`.btn-primary` / `.btn-coin` / `.btn-berry`）、HP/EXP風ゲージ（`.rpg-gauge`）。見出しは丸ゴシックの極太（`.font-title`）。
- マップはワールドごとに地形と看板が変わり、レッスン＝石のメダル、復習クエスト＝宝石、まとめ＝宝箱、ボス＝神殿で表示する。道の両側には木・遺跡・モンスターのイラストが並ぶ。

## キャラクタービジュアルとエラーに強い作り

**ビジュアル（シネマティック・3Dアニメ風）**
- `src/components/art/ArtDefs.tsx`：全イラスト共通の質感。陰影（立体感・アンビエントオクルージョン風）、スペキュラーハイライト、多層ドロップシャドウ、逆光のふち取り、ブルーム、被写界深度のぼかし、石の彫刻（スペキュラーライティング）、ダークゴールドのメタル、宝石のグラデーション。layout で1回だけ描画し、各SVGから `url(#id)` で参照する
- `src/components/characters/`：ハル・リコ・キコ・ビリモ・エマ先生。骨組み（Rig）から描く立ち絵（腕は角度で計算・手は4種類・服のしわとすその波・接地影）と、目・鼻・口・耳・髪の毛束を共通パーツ（`parts.tsx`）で描く顔。3灯ライティング風の陰影（キー光・逆光・やわらかい影）と色調補正（`KeyLight` / `ColorGrade`）
- `src/components/scene/CinematicScenery.tsx`：巨大な古代樹、手前のシダ、遺跡のレリーフ壁、神殿の門、ゴッドレイ、霧、光の粒、魔法陣、光る水晶、ビネット
- `src/components/scene/HeroScene.tsx`：各ページ上部のキービジュアル（月・オーロラ・そびえるボスのシルエット・神殿の光・レリーフ・パーティとモンスター・手前のぼけ）
- `src/app/globals.css`：すりガラスのパネル＋ダークゴールドのメタル枠、宝石の立体ボタン、光るゲージ、金属の金文字
- `src/lib/art/renderedArt.ts`：3DCGでレンダリングした本物のキャラクター画像の差し替え口。`public/art/` に画像を置いてパスを書くと、立ち絵がその画像に置きかわる

**英語モンスター図鑑（100体）**
- `src/lib/game/monsters.ts`：10種族（ドラゴン・フェンリル・ベヒモス・フェニックス・リヴァイアサン・スピリット・ゴーレム・ユニコーン・グリフォン・レオ）× 10属性（炎・水・雷・森・光・闇・氷・大地・風・晶）＝100体。名前・二つ名・覚える英単語・ちからを決まったルールで生成
- ランクと額縁：通常種＝ブロンズ（50体）／希少種＝ゴールド（30体）／英雄級＝プラチナ・ホロ（14体）／神話級＝ダークエピック・プリズムのオーラ（6体）
- `src/components/characters/MonsterArt.tsx`：種族の形×属性の色と光で描画。ランクが上がるほどオーラ・プラチナの装飾・光輪・ルーンが増える
- `src/components/monsters/MonsterCard.tsx` と `/gacha`：召喚の祭壇（光の演出つきのカード出現）、出現率の表示、100体の図鑑（まだ出会っていないモンスターはシルエット）
- `GET /api/monsters`：持っているモンスター・コイン・レアガチャ券。`resolveMonster()` はどんな id でも必ず1体を返し、以前のモンスターID（m-…）も新しいモンスターに対応させる
- 開発用プレビュー（Playwright で PNG を `docs/night2/screens/` に保存）：`npx tsx --tsconfig scripts/tsconfig.json scripts/render-kids-preview.tsx <名前>`（ハル・リコ・キコの全ポーズ）、`render-adults-preview.tsx <名前>`（エマ先生・ビリモ・ヒーロー場面・背景）、`render-monsters-preview.tsx <名前>`（モンスター100体・カード・額縁）。全キャラ一覧の HTML は `docs/night/screens/characters-preview.html`

**エラーに強い作り**
- `src/lib/api/contracts.ts`：各APIの返すデータの形を zod で1か所に定義。ルートは `satisfies` でこの形に合わせ、画面も同じ定義で受け取る
- 各項目に安全なデフォルト値（`[]`・`0`・`null` など）があり、項目の欠け・型ちがい・壊れた要素があってもデフォルトで埋まる
- `src/lib/api/client.ts`（`apiGet` / `apiPost`）：通信失敗・HTTPエラー・空のボディ・HTMLのエラーページでも例外を投げず、契約どおりの形と表示用のメッセージを返す
- `src/lib/api/server.ts`（`withApi`）：ルートで例外が起きても必ず JSON（`{ ok: false, error }`）を返す
- `tests/api-contracts.test.ts`：壊れたレスポンスでも落ちないこと、サーバーの正しい形がそのまま通ることを確認

## 保護者アカウント（src/lib/auth・/welcome・/who・/parent）

支払う人＝保護者（メール＋パスワード、または LINE）、学ぶ人＝子ども（ニックネーム・学年1〜6・生まれ年は任意。本名は不要）。月報（LINE）や月額課金の土台で、課金はまだありません。

- **流れ**: `/welcome` → 登録（メール・パスワード・暗証番号4けた）→ お子さまを追加（6人まで）→ `/who`「だれが あそぶ？」で子どもを選ぶ → マップ。ゲームの画面の上のヘッダー（AccountBar）に いま遊んでいる子と「かわる」「おうちの方」が出ます。
- **おうちの方ページ `/parent`**: 入るたびに暗証番号（入れてから10分有効）。お子さまごとのようす（進みぐあい・連続日数・総合習得率・今日の回数・最終学習日・伸ばしたい力）、1日のレッスン回数の上限（既定は制限なし、1〜10回）、お子さまの編集・削除、暗証番号・パスワードの変更、ログアウト、退会（保護者とすべての子どもの学習データを1つのトランザクションで完全に削除）。
- **currentUserId() / resolveLearner()**: 学習記録を書く相手は ①ログイン中で選ばれた子ども（本当にその保護者の子のときだけ）→ ②この端末の おためし学習者 → ③DB 停止なら だれでもない（`NO_LEARNER_ID`。画面はブラウザの記録で遊ぶ おためしモード）の順。共有のデモユーザー（`demo-user`）は seed にだけ残し、遊ぶときには使いません。
- **安全**: パスワードは Node の `crypto.scrypt`（ネイティブモジュールなし）。セッションは32バイト乱数のトークンを httpOnly・SameSite=Lax（本番は Secure）の cookie `eq_session` に入れ、DB には SHA-256 だけを期限つき（30日）で保存。ログインのたびにトークンを作り直し、1日ごとに入れ替え。状態を変える API は Origin を確認。ログイン・登録・暗証番号・再設定などのレート制限は DB の表 `RateLimitBucket` で数える（run5。サーバーが何台でも同じ。DB 停止中はそのサーバーのメモリ）。すべての画面に `X-Frame-Options: DENY`・`frame-ancestors 'none'`・`nosniff`・`Referrer-Policy` を付けます（`next.config.ts`）。入力はすべて zod、ログイン失敗は共通の文言、パスワード・トークン・暗証番号はログに出しません。
- **アバター（キャラクター）**: お子さまごとにハル・リコ・キコ・ビリモから1人を選びます（`User.avatarCharacter`、`src/lib/domain/avatars.ts`）。追加・編集のとき（おうちの方）に選べ、選ばなければ きょうだいがまだ使っていない顔になります。お子さま自身もヘッダーの顔をタッチして小さなシートから変えられます（暗証番号なし）。「だれが あそぶ？」・ヘッダー・おうちの方ページで同じ顔を表示します。
- **端末ごとの おためし学習者（run5）**: DB が動いているとき、ログインしていない端末は最初のゲーム API で 保護者なしの `User`（`isTrial = true`、ニックネーム「おためし」）を1人作り、httpOnly cookie `eq_trial_learner` にランダムなトークン（32バイト）を入れます。DB にはトークンの SHA-256（`trialTokenHash`）だけを保存します。cookie を書けない Server Component（`/recap`）では作りません。遊ぶと `lastActiveAt` を更新し（1時間に1回まで）、全国ランキングには ほかの端末の おためし学習者を出しません。**60日** 遊ばれていない おためし学習者は `npm run trial:cleanup` が学習記録ごと消します（`--dry-run` で数だけ表示・`--timeout` 秒で途中終了し、残りは次回）。Vercel では `vercel.json` の Cron Jobs が毎日 `GET /api/cron/trial-cleanup` を呼ぶので設定は不要です。自分のサーバーでの cron の例: `30 4 * * * cd /path/to/app && npm run trial:cleanup >> /var/log/eigo-quest-trial-cleanup.log 2>&1`（Vercel などでは Cron Jobs や外部のスケジューラから同じコマンドを実行）。
- **おためしの きろくの ひきつぎ**: おためしの きろくは ①この端末の おためし学習者（DB）と ②DB 停止中に遊んだ分（ブラウザの localStorage の「おためしの きろく」）の2つ。②は（`src/lib/offline/trialLog.ts`。クリアしたレッスン・合格したテスト・もらったコイン・遊んだ日・答えた項目）。保護者が登録・ログインして「だれが あそぶ？」で子どもを選ぶと、どちらかに きろくがあれば「おためしで あそんだ きろくを ひきつぐ？」と聞きます（DB 側は `GET /api/trial` で確認。作らない・書かない）。「はい」で `POST /api/children/:id/carry-over` が両方をその子に たし合わせます（レッスン・テスト合格は まだ無い分だけ、コインは合計（ブラウザの分は おためしで ありえる上限まで・DB の分はそのまま）、連続日数は大きい方、記憶はまだ無い項目だけ、モンスターは数を たす）。そのあとブラウザの きろくと `eq_trial_learner` cookie を消します（おためし学習者の行はコピー元として残り、60日後のそうじで消えます）。「いいえ」は その きろくについてだけ覚えます。**「おうちの方」ページの「おためしの きろくを ひきつぐ」ボタン**（お子さまを選んで確認）なら、「いいえ」のあとでも この端末に きろくが残っていれば引き継げます。それぞれ CoinLedger の `trial-carry:<ブラウザのID>` / `trial-carry-db:<おためし学習者のID>` で1回だけ（2回目は `alreadyCarried: true`）。ほかの家の子どもには引き継げません。計算は `src/lib/domain/trialMerge.ts`（`planDeviceTrialMerge`）。
- **1日の回数制限**: 上限に届くと、新しいレッスンは「きょうの レッスンは ここまで！ また あした あそぼうね。」（403 + `code: "DAILY_LIMIT"`）。完了ずみのレッスンのおさらいはできます。
- **DB 停止時**: アカウント API は 503 + `offline: true` + ていねいな案内（`GET /api/auth/me` だけは 200 + `loggedIn:false`）。画面はおためしモードへ進めます。
- API: `POST /api/auth/register`・`login`・`logout`、`GET /api/auth/me`、`GET /api/auth/line/start`・`callback`、`POST /api/auth/line/pin`・`cancel`、`DELETE /api/parent/line`、`GET/POST /api/children`、`PATCH/DELETE /api/children/:id`、`POST /api/children/:id/select`、`PATCH /api/children/:id/avatar`、`POST /api/children/:id/carry-over`、`POST /api/parent/verify-pin`、`GET/POST /api/parent/reset-pin`、`POST /api/parent/email`、`POST /api/auth/password-reset/request`・`check`・`complete`、`POST /api/auth/email/check`・`confirm`、`GET /api/parent/overview`、`GET/PATCH /api/parent/settings`、`GET/PATCH/POST /api/parent/line-monthly`、`DELETE /api/parent/account`、`POST /api/line/webhook`。
- **LINE ログイン（`src/lib/auth/line.ts`）**: 標準の LINE ログイン（OAuth 2.0 / OpenID Connect）。`GET /api/auth/line/start?mode=login|link` が state・nonce・PKCE（S256）を作って httpOnly cookie `eq_line_oauth`（path `/api/auth/line`・10分）に入れ、LINE の認可画面へ（`scope=profile openid`、`bot_prompt=aggressive` で公式アカウントの友だち追加もすすめる）。`GET /api/auth/line/callback` が state を照合 → code をトークンに交換 → ID トークンを LINE の verify エンドポイントで検証し、こちらでも iss・aud・exp・nonce・sub を確認して LINE のユーザーID（`Parent.lineUserId`、ユニーク）を得ます。
  - (a) はじめての LINE → 保護者を作ってログイン → `/setup-pin` で暗証番号を決める（`POST /api/auth/line/pin`）→ お子さまを追加。まちがえて登録したときは `/setup-pin` の「登録を取り消す」（`POST /api/auth/line/cancel`。暗証番号・子どもがまだ無いときだけ）。
  - (b) メールで登録した保護者は `/parent` の「LINE の連携」から連携（`start?mode=link`。暗証番号の入力が必要）・解除（`DELETE /api/parent/line`）。ほかの保護者に連携ずみの LINE は連携できません。LINE だけで登録したアカウントは解除できません（ログインできなくなるため）。
  - (c) 連携ずみなら「LINEでログイン」でログイン。
  - LINE だけで登録した保護者はメール・パスワードを持たないので、暗証番号の変更・退会の本人確認は暗証番号で行い、パスワードの変更は出しません。
  - 環境変数がそろっていないときは LINE のボタンを出さず（`GET /api/auth/me` の `lineLoginAvailable: false`）、`/parent` に「LINE ログインはまだ設定されていません」と小さく表示します。
  - 安全のため: state cookie は `LINE_LOGIN_CHANNEL_SECRET` で HMAC 署名し（書きかえると受け付けない）、ほかのサイトからのリンク・自動の移動（`Sec-Fetch-Site: cross-site / same-site`）では LINE ログインを始めません。
  - LINE Developers でのチャネル設定: LINE ログインのチャネルを作り、コールバック URL に `LINE_LOGIN_CALLBACK_URL` と同じ値（例 `https://<ドメイン>/api/auth/line/callback`）を登録。友だち追加をすすめるには、そのチャネルに公式アカウント（Messaging API チャネル）をリンクします。手順は [docs/run4/LINE-SETUP.md](docs/run4/LINE-SETUP.md)。
- **パスワードを忘れた（run5・`src/lib/services/accountRecoveryService.ts`）**: `/login` の「パスワードを忘れた方」→ `/forgot-password` でメールアドレスを入れると、`POST /api/auth/password-reset/request` が **登録の有無に かかわらず同じ答え** を返し、DB を調べて メールを送るのは応答のあと（`after()`。時間でも登録の有無が わからないように）。登録があれば `/reset-password?token=...` のリンクを送ります。トークンは32バイトの乱数で、DB（`AuthToken`）には SHA-256 だけ。**30分**で期限切れ・**1回だけ**（`usedAt` を「まだ null のときだけ」書く）・新しく送ると古いリンクは使えません。再設定の画面は `?token=` をすぐ URL から消し（Referrer-Policy: no-referrer）、`POST /api/auth/password-reset/check`（使わずに確認）→ `complete`（新しいパスワード）。成功すると **その保護者のすべてのセッションを消して**（すべての端末でログアウト）ログイン画面へ。「パスワードを再設定しました」のお知らせメールも送ります。設定画面でパスワードを変えたときも、まだ使っていない再設定リンクは無効にします。レート制限: 同じ IP から1時間に10回（こえたら 429）、同じメールへは1時間に3通（こえても同じ答えで だまって送らない）、リンクの確認・使用は同じ IP から15分に20回。
- **暗証番号を忘れた（`/forgot-pin`）**: 暗証番号パッド（おうちの方ページ・ヘッダーの「おうちの方」）の下の「暗証番号を忘れた」から。パスワードがある保護者は **アカウントのパスワード** で本人確認して新しい暗証番号を決めます（`POST /api/parent/reset-pin {password, newPin}`）。LINE と連携ずみなら **LINE で本人確認** もできます（`GET /api/auth/line/start?mode=reauth` → コールバックで「ログイン中の保護者に連携している LINE と同じ人か」を確認 → セッションの `lineReauthAt` に しるし → 10分以内・1回だけ `newPin` だけで決められる）。決めると その端末は暗証番号を入力ずみになり、そのまま おうちの方ページへ。
- **LINE だけの保護者のメールアドレス追加**: `/parent` の「メールアドレスでのログインを追加」でメールアドレスと新しいパスワードを入れると（`POST /api/parent/email`。暗証番号の入力が必要・1時間に5回まで）、確認メール（`/verify-email?token=...`・**24時間**・1回だけ）を送ります。リンクの画面で「確定する」を押すと（`POST /api/auth/email/confirm`。リンクを開いただけでは確定しない＝メールの安全チェックが自動で開いても大丈夫）、メールアドレス + パスワードでもログインでき、「パスワードを忘れた」も使えるようになります。そのアドレスが ほかのアカウントで使われているときも画面の答えは同じで、そのアドレスには「すでに登録があります」のお知らせが届きます。
- **メール送信（`src/lib/mail`）**: `MAIL_PROVIDER=resend|smtp|outbox`。`resend` は Resend の HTTP API（`RESEND_API_KEY`・`MAIL_FROM`）、`smtp` は nodemailer（`SMTP_URL`・`MAIL_FROM`）、`outbox`（キーが無いときの既定）は送らずに `MAIL_OUTBOX_DIR`（既定 `.data/mail-outbox/`）へ JSON と HTML を書き、ログにファイルの場所を出します（開発中は ここからリンクを開く）。特定のサービスに しばらないので、ほかの送信サービスも SMTP で使えます。メールのリンクは `APP_BASE_URL`（公開 URL）から作り、開発中だけは開いているサイトの URL を使います。**本番（`NODE_ENV=production`）で `APP_BASE_URL` が無いとメールを送りません**（Host ヘッダーの書きかえで 他人のリンクを よそへ向けさせないため）。Vercel などでは `outbox` は使えない（ファイルが残らない）ので、`resend` か `smtp` を設定してください。文面は `src/lib/mail/templates.ts`（ていねい語・テキスト + かんたんな HTML・会社名なし）。
- 環境変数: `ALLOWED_ORIGINS`（同じホスト以外から受け付けるオリジン。通常は空）、`SEED_DEMO_PARENT`（1 でデモ保護者を seed）、`LINE_LOGIN_CHANNEL_ID`・`LINE_LOGIN_CHANNEL_SECRET`・`LINE_LOGIN_CALLBACK_URL`（LINE ログイン。3つそろったときだけ有効。キーはコードに書かず環境変数だけ）、`APP_BASE_URL`（メールのリンクのもと）・`MAIL_PROVIDER`・`MAIL_FROM`・`RESEND_API_KEY`・`SMTP_URL`・`MAIL_OUTBOX_DIR`（メール送信）。

## DBが止まっていても動く「おためしモード」

PostgreSQL が止まっている・サーバーに届かないときでも、エラー画面は出さずに内蔵データで遊べます。

- **API（src/lib/api/server.ts の `withOffline`）**: 全ルートが DB 接続を事前チェック（`isDbUp()`、1.5秒タイムアウト・結果は短時間キャッシュ）。
  DB が落ちている／P1001 などの接続エラー／想定外の例外 → **200 + `success: true, offline: true`** で `src/lib/offline` のモックデータを返します。エラー内容は外に出しません（サーバーログにだけ残ります）。
- **画面**: `apiGet` は8秒でタイムアウトし、GET は1回だけ自動リトライ。それでも届かなければ `isUnreachable()` で判定して、ブラウザ側で同じ内蔵データに切り替えます（マップは Lesson 1 から、レッスン・テストはブラウザで出題・採点）。
- おためしモードでクリアしたレッスン・合格したテストは、そのブラウザの localStorage にだけ記録します（`src/lib/offline/localProgress.ts`）。マップはこの記録をのせて作り直すので、✓ と「きょうのまとめ」リンクが出ます（コイン・習得率は保存しません）。
- 画面には小さな「おためしモードで表示中」チップだけを出します（`src/components/common/OfflineNote.tsx`）。召喚・レッスン完了・テスト結果は「記録されない」ことを明記します。
- ゲーム上の理由（まだひらいていないレッスンなど 4xx）は、これまでどおりメッセージを表示します。
- おしらせは `content/announcements.json`（`GET /api/announcements`、マップ画面下に表示）。DB を使わないので常に表示できます。

### seed（`npm run db:seed` / `npx prisma db seed`）
最初に接続確認 → データ検証（ID重複・空欄・件数）→ セクションごとに upsert（何度実行しても同じ結果）。
書きこむ列は**生成済み Prisma スキーマに実在する列だけ**に絞り、スキーマ側にある必須列（例: `category`）がデータに無ければ既定値で埋めます
（ShopItem → slot、Monster → theme、Announcement → JSON の category）。`Announcement` モデルがあれば、おしらせも投入します。

## カリキュラムとステージの流れ

1日の流れは「**きのうまでの復習クエスト（3〜5分）→ 新しいレッスン（約25分・何回でも）**」です。いちばん大事なのは毎日つづけることです。

```
L1 → C1 → L2 → C2 → L3 → C3 → L4 → C4 → L5 → C5 → まとめ(1-5) → L6 … L30 → C30 → ボス(1-30) → L31 …
```

- レッスンは1日に何回でも進められます（おうちの方ページで1日の上限を決めたときを除く）。レッスン n を終えると、すぐにレッスン n+1 が開きます。
- **復習クエスト**（C）はすべてのレッスンにあり、レッスンを終えた**次の日以降**に開きます。進行はブロックしません（受けなくても先に進めます）が、一発合格がいちばんコインのもらえる「1分あたり最もお得」なクエストです。
- 5の倍数のレッスンの後は**まとめテスト**、30の倍数の後は**ボス戦**があり、これは合格しないと次のレッスンが開かない「関門」です。関門はレッスン後すぐに受けられます。
- テストは何度でも再挑戦できます。間違えた問題には解説が出ます（救済措置）。
- まとめテストとボス戦は「学校モード」で採点します。文頭や曜日の小文字、ピリオド忘れなど、学校のテストで×になる誤りは「再挑戦」になります。
- 1日のレッスンは9ステップです。AI教師 → フラッシュカード → TPR → フォニックス → 学校テスト対策（書き取り＋AI採点）→ 発音 → 確認クイズ → スピードリスニング（0.8 → 1.0 → 1.2倍速）→ **AIキャラとの会話**。合格の条件は確認クイズだけで、会話はブロックしません。
- 最後のレッスン（Lesson 1200）のクリア画面では「つぎのレッスンへ」を出さず「🎉 ぜんぶクリア！」を表示します（全クリア後の体験はまだ未定）。

### 5ステージ・40ワールド（docs/curriculum-6year.md・src/lib/curriculum/stages.ts）

| ステージ | ワールド | レッスン | レベル（CEFR のめやす） | 英検のめやす |
|---|---|---|---|---|
| 1 はじまりの旅 | 1〜12 | 1〜360 | Pre-A1 → A1 | 5級 |
| 2 ひろがる せかい | 13〜20 | 361〜600 | A1 → A2 | 4級 → 3級の入口 |
| 3 ことばで つながる | 21〜28 | 601〜840 | A2 → A2+ | 3級 → 準2級 |
| 4 じぶんの ことばで | 29〜35 | 841〜1050 | A2+ → B1 | 準2級 → 準2級プラス |
| 5 せかいへ はばたく | 36〜40 | 1051〜1200 | B1 → B1+ | 準2級プラス → 2級 |

- ワールド13〜40: あさひの港町・にぎわいの市場・かぜの草原・きおくの遺跡・ほしふる天文台・こだまの谷・からくり工房・まつりの島（ステージ2）／ことづての塔・こはくの図書館・みどりの研究所・くもの上の鉄道・なぞときの洞くつ・ひびきの劇場・いずみの里・にじの架け橋（ステージ3）／かんがえる灯台・みらい都市・ときの回廊・たいようの砂漠・ほのおの火山島・つばさの空港・ちえの議事堂（ステージ4）／しんかいの都・おとぎの迷宮・こころの高原・せかいの円卓・はじまりの星（ステージ5）。
- 先生の台本は ステージ2 が ほぼ英語（短い日本語の助け）、ステージ3 以降は英語だけ（ごく小さな日本語ヒントのみ）。英検のめやすは感じをつかむためのもので、合格の保証ではありません。
- 1か月ワークブック（PDF）は 20 レッスンごと（No.1〜60）。

### ステージ1 の 12ワールド（docs/curriculum-plan.md）

| ワールド | レッスン | 学年・テーマの対応 | フォニックス |
|---|---|---|---|
| 1 はじまりの森 | 1〜30 | 小1（定番テーマ） | 文字の音 26音 |
| 2 ことばの町 | 31〜60 | 小2（定番テーマ） | 短母音の CVC・ff ll ss zz |
| 3 せかいの港 | 61〜90 | 小3（Let's Try! 1 前半） | ダイグラフ sh ch th wh ck ng nk |
| 4 なぞなぞ山 | 91〜120 | 小3（Let's Try! 1 後半） | 語頭ブレンド s- l- r-・2音節入門 |
| 5 じかんの塔 | 121〜150 | 小4（Let's Try! 2 前半） | 語末ブレンド・-s・-ing・2音節 |
| 6 まなびの城 | 151〜180 | 小4（Let's Try! 2 後半） | マジック e |
| 7 ひかりの島 | 181〜210 | 小5（NEW HORIZON Elementary 5 前半） | 母音チーム ai ay ee ea oa ow |
| 8 たびだちの道 | 211〜240 | 小5（NEW HORIZON Elementary 5 後半） | 母音チーム oo ou ow oi oy igh ie |
| 9 そらの大陸 | 241〜270 | 小6（NEW HORIZON Elementary 6 前半） | r のつく母音 ar or er ir ur air ear |
| 10 いのちの海 | 271〜300 | 小6（NEW HORIZON Elementary 6 中盤） | soft c/g・-y・-le・aw au ew |
| 11 ゆめの都 | 301〜330 | 小6（NEW HORIZON Elementary 6 後半） | -ed・-er・-est・サイトワード |
| 12 えいごの王国 | 331〜360 | 小6〜中学準備（総復習・5W1H） | サイトワード総復習・多音節語・音読 |

- ワールド名はマップ・会話・計画書・この表で同じです（ただ1つのもと: `src/lib/game/worlds.ts`）。
- 学年は「テーマの対応先」で、子どもの実際の学年ではありません（全員 Lesson 1 から）。教科書の文・イラストは使わず、単元のテーマと目標表現だけを合わせ、英文はすべてオリジナルです。
- 各レッスンには会話シーン（`conversation`：場面・セリフ・AI会話のゴールと目標表現）と、まとめのポイント（`recap.highlightsJa`）があります。どちらも省略可能なフィールドで、worksheets のスクリプトには影響しません。
- `tests/curriculum.test.ts` が、連番・ワールドと学年の対応・空欄・英語欄に日本語がないこと・フォニックスの順番・まだ習っていない文法（3人称・過去形など）を先に出していないこと・AI会話で個人情報を聞かないこと などを自動で確認します。

## きょうのまとめ動画（src/lib/recap・/recap/[lessonNo]）

- `buildRecapScript(lesson)` がレッスンデータを時間つきのセグメントに変換します（動画ファイルは不要）。はじまり → ことば → ひょうげん → フォニックス → うごこう（TPR）→ かいわ → きょうのポイント → おわり。全レッスンが2〜3分に収まることをテストで確認しています。
- ホストはハルとビリモ。英語は speechSynthesis で読み上げ、日本語のセリフは表示だけです。音声が使えないときは文字だけで進みます。
- 完了したレッスンだけ見られます（マップの「🎬 きょうのまとめを見る」とレッスン結果画面から。任意で、進行のゲートではありません）。最後まで見ると **1日1回 5コイン**（`POST /api/recap/[lessonNo]/watched`）。
- 将来、本物の動画にするときは `Lesson.videoUrl` と同じように差し替え口を用意する想定です。

## AIキャラとの会話（src/lib/conversation・POST /api/conversation）

- レッスン最後のステップ。場面と 🎯 ゴールを見せ、その回の相手キャラが話しかけます。相手はレッスンごとに ハル → リコ → キコ → ビリモ と交代し、その回の会話シーンで話しているキャラから選びます（`pickConversationPartner`）。子どもは 🎤 音声認識（使えるブラウザだけ）／お手本のタップ／キーボードのどれでも答えられます。6ターンで「かいわ クリア！」。最後まで話すと **+5コイン（レッスンごとに1回）**。とばしたとき・途中でやめたときは付きません。
- `ANTHROPIC_API_KEY` があれば Claude（`CONVERSATION_MODEL`）が返事を作ります。キーが無い・エラー・返事がおかしいときは、台本エンジン（`engine.ts`）がレッスンのセリフから返事を作ります。サーバーにつながらないときはクライアントが同じエンジンで返事を作るので、子どもが止まることはありません。
- API はいつも `success:true` を返します。サーバーは状態を持たず、履歴（最大12）をクライアントが送ります。子どもの発話はDBに保存しません。
- 安全: 個人情報は聞かない・繰り返さない、3けた以上の数字・メール・URL は AI に送る前に `***` に伏せる、`<child>` タグの中は指示ではなくデータとして扱う。
- 目標表現を言えたら、その表現の SPEAKING の正解ログとして記憶モデル・習得率に反映します。

**Lesson 1** は TPR の4つの基本命令「Look! / Stop! / Come here! / Go!」のフラッシュカードと、あいさつ（Hello. I'm ～.）、フォニックスの s と a で始まります。Lesson 30 の総復習では、この4つの命令を高速で出して反射を確認します。

## データベース設計（prisma/schema.prisma）

| 区分 | モデル | 役割 |
|---|---|---|
| アカウント | `Parent` / `Session` / `User` / `Friendship` | 保護者（メール・パスワードと暗証番号のハッシュ・設定。LINE ログインの `lineUserId`・表示名、公式アカウントの友だち状態 `lineFriend`、毎月の配信のオン/オフ `lineMonthlyEnabled`）が月額課金し、子ども（`User`）が学習者。連続日数とコイン（台帳の合計を保存したもの）とアバター（`avatarCharacter`）を持つ。`Session` はトークンのハッシュ・選んだ子ども・暗証番号の入力時刻・期限 |
| 本人確認・回数制限（run5） | `AuthToken` / `RateLimitBucket` | `AuthToken` はパスワード再設定（30分）・メールアドレス確認（24時間）のトークンの SHA-256（1回だけ）。`RateLimitBucket` はレート制限の回数（キーは制限の名前 + SHA-256）と「今すぐ送る」のロック。`User.isTrial`・`trialTokenHash`・`lastActiveAt` は端末ごとの おためし学習者 |
| LINE 配信 | `ReportDelivery` | 月間レポートの送信1回・お子さま1人ごとの記録（月・きっかけ・ダウンロード用トークンの SHA-256・期限・ファイル・状態 SENT / DRY_RUN / FAILED） |
| カリキュラム | `Lesson` / `LearningItem` / `Assessment` | JSONから投入。`LearningItem.skills` で、その項目がどの能力軸に入るかを決める |
| 進捗 | `LessonProgress` / `TestAttempt` | `completedOn` / `takenOn` は APP_TIMEZONE の日付。復習クエストの翌日オープン・1日のレッスン回数・一発合格の判定に使う |
| 学習ログ | `ItemResponse` | 1問ごとの正誤・反応時間・再生速度・発音スコア。習得率の元データ |
| 記憶 | `ItemMemory` | 項目ごとの安定度・難易度・直近の正答率。解答のたびに更新する |
| 習得率 | `MasterySnapshot` | 日ごとの6軸スコア（推移グラフ用） |
| コイン | `CoinLedger` | 追記のみの台帳。`idempotencyKey` で二重付与を防ぐ |
| 復習 | `ReviewAlert` | お宝アラート（1日1件・当日中に期限切れ・倍率2） |
| ご褒美 | `Monster` / `UserMonster` / `GachaTicket` / `ShopItem` / `UserShopItem` | 図鑑・ガチャ・アバター |
| AI | `AiGradingCache` | 同じ正解と同じ誤答の組み合わせでは、LLMを二度呼ばない |

## コインの設計（src/lib/domain/coins.ts と config.ts）

| イベント | コイン | 1分あたりの目安 |
|---|---|---|
| 新しいレッスン完了 | その日の1〜3回目 10 / 4回目 6 / 5回目 4 / 6回目以降 2 | 0.4（毎日の習慣への基本報酬） |
| **復習クエスト一発合格** | **30**（再挑戦で合格したら 5） | **10（一番お得）** |
| 5日ごとのまとめ合格 | 60（再挑戦で合格したら 20） | 7.5 |
| 30日ごとのボス合格 | 300 ＋ レアガチャ券（RARE以上確定） | 一度きりの大ボーナス |
| お宝アラート経由でクリア | 12 × **2倍** = 24（復習クエスト一発の30より少ない） | — |
| きょうのまとめ動画を最後まで見る | 5（1日1回） | おまけ |
| AIキャラとの会話を最後まで | 5（レッスンごとに1回） | おまけ |
| 復習アリーナ | 1回15（1日5回まで。その後は3）・満点で＋10 | 日常のコイン稼ぎ |
| **連続学習（いちばん大きな報酬）** | 毎日 ＋min(連続日数, 10)、7日ごと ＋50、30日ごと ＋300 ＋ レアガチャ券 | — |

- テストに既に合格している場合、再受験してもコインは出ません。コイン稼ぎはアリーナに誘導します。
- アリーナは正答率が60%未満だとコインが出ません（適当に連打するのを防ぐため）。

## 習得率の計算（src/lib/domain/mastery.ts）

1. **項目の習得度** = 想起率 R(今) × 直近の正答率（EWMA）
   - R は記憶モデル `R(t) = (1 + t/(9S))^-1` で計算します（S は安定度・単位は日。t = S のとき約90%）。時間がたつとダッシュボードの値が少しずつ下がり、忘却がそのまま見えます。
   - 一度学習したのに解答していない項目は 0 として数えます。
2. **軸のスコア** = その軸に入る学習済み項目の平均。学校テスト対応度だけは、教科書頻出の項目を2倍の重みで計算します。
3. **軸ごとの補正**
   - リスニング反射力 = 0.7 × 項目の習得度 ＋ 0.3 × 反射スコア（反応の速さ × 再生速度）
   - 発音 = 0.5 × 項目の習得度 ＋ 0.5 × 直近の発音スコア
4. **総合** = 6軸の重み付き平均（学校25%・リスニング20%・フォニックス15%・発音15%・語彙15%・筆記10%）。**進捗** = 学習済みの項目数 ÷ 全項目数

記憶モデル（memory.ts）は、忘れかけたときに正解するほど安定度が大きく伸びます。同じ日に何度正解しても、ほとんど伸びません。

## お宝復習アラート（src/lib/domain/treasureAlert.ts）

- ログインしたとき（マップを表示したとき）に `GET /api/treasure-alert` を呼びます。
- 2レッスン以上前の項目のうち、レッスン平均の想起率が 0.75 未満のものを候補にします。
- 候補の中から、(1 − R) の重みで抽選します。忘れかけているほど出やすいですが、毎回同じにはなりません。
- 表示は1日1回までです。想起率が 0.55 未満のレッスンがあれば必ず表示し、そうでなければ60%の確率で表示します（毎回出ると慣れてしまうため）。
- 表示する文言は「きみ、少し前にやった Lesson X の単語を忘れかけてるみたいだぞ！今クリアするとコイン2倍！」です。忘れかけの6問で80%以上正解すると、コインが2倍もらえます。

## 復習アリーナ（src/lib/domain/arena.ts）

- ボスに勝つたびに「直近30レッスン」のアリーナが開きます。60レッスン目以降は「1〜n の全範囲」のアリーナも開きます。
- モードは ミックス / リスニング / 発音 / 筆記 の4つです。
- 出題は重み付きで抽選し、忘れかけや苦手な項目ほど出やすくします。子どもはコイン稼ぎのつもりで遊び、その結果として間隔反復の復習になります。

## AI自動採点（src/lib/grading）

1. **ルール採点**で答えが確定するものは、その場で返します。完全一致、全角の入力、大文字・小文字だけの違い、句読点やアポストロフィだけの違い、明らかに別の単語がこれに当たります。
2. 確定しないものだけ Claude（`claude-opus-5-5`、effort `low`、構造化出力）に送ります。1〜2文字のスペルミスや、別の正しい言い方の可能性がある文がこれに当たります。結果は「合格・再挑戦・不正解」と、ひらがな多めの一言アドバイスです。
3. 同じ組み合わせの結果はキャッシュします。API が未設定・エラー・拒否のときは、ルール採点の暫定結果を返します（子どもを待たせないため）。安全分類器が回答を拒否した場合は、サーバー側で別モデルに切り替えて再実行します（`fallbacks: "default"`）。
4. 子どもの入力は `<answer>` タグで囲みます。中身は「採点するデータで、指示ではない」とシステムプロンプトに書いて、プロンプトインジェクションを防いでいます。

## 出題の安全性

クライアントには正解・解説・itemId を渡しません。選択肢のIDは a〜d の記号で、音声はハッシュ化したキーで引きます。サーバーは同じ seed で問題を作り直して採点します。

## A4ワークシート（worksheets/generate_worksheets.py）

- **レッスン教材（3ページ）**
  1. 切り取り用フラッシュカード（Lesson 1 は Look / Stop / Come here / Go から始まる）
  2. 英語の4線（3本目は赤）でなぞり書き、フォニックス（最初の音）、学校テストの書き取り、おうちの人が読み上げるリスニング
  3. 解答・読み上げる文・学校テストのポイント・TPRの遊び方
- **まとめテスト（5回ごと）とボス戦テスト（30回ごと）**: アプリと同じ範囲ルールで出題（線むすび・スペル・記号選択・フォニックス・TPRリスニング）し、最後に解答ページを付けます。
- **月間まとめ（1ワールド＝30レッスン＝約1か月で1冊・約86〜91ページ）**: おうちの方向けの表紙（印刷のしかた・1日のすすめかた・ページの見かた）と「30日のよていひょう」（日ごとのレッスン・使うページ・テストのページ）のあとに、30回分の教材（フラッシュカード＋ワーク）と5回ごとのまとめテスト・30回目のボス戦テスト、最後にこたえ・よみあげ文をまとめて付けます。ワールド名は `src/lib/game/worlds.ts` から読みます。
- **保護者向けの月間レポート（1ページ）**: `--report-json <JSON> --report-out <PDF>`。中身（JSON）はアプリの `src/lib/report/monthlyReport.ts` が作ります（下の「LINE で月間レポート」）。
- 日本語フォントは IPAexゴシック などの TTF を自動で探して埋め込みます。`EIGO_JA_FONT` でフォントのパスを指定することもできます。

## LINE で月間レポート（src/lib/services/monthlyDeliveryService.ts・`npm run line:monthly`）

毎月、保護者の LINE にお子さまごとの「学習レポート（A4 1ページ）」と「いまのワールドの 1か月ワークブック」を届けます。
LINE の Messaging API は PDF ファイルそのものを送れないため、**ダウンロードページへのリンク**を Flex メッセージ（お子さまの名前・要約・「PDFをひらく」ボタン。きょうだいはカルーセル）で送ります。

- **レポートの中身**: 今月のレッスン数・学習した日数・合格したテスト、連続日数・最長連続、6つの力の習得率（送信時点）、にがて（低い力・忘れかけの ことば）、来月の予定（次のレッスンからの単元・フォニックス）、おうちの方への ひとこと。PDF は **Node だけ**で作ります（run5: `pdf-lib` + 日本語フォント Noto Sans JP を使った文字だけ埋め込み。`src/lib/report/pdf.ts`。フォントは `assets/fonts/`・SIL Open Font License）。サーバーで Python は使いません。フォントが読めないときは依存なしの かんたんな PDF で代わりに作ります。
- **ワークブック**: お子さまが これから進む 20 レッスンの 1か月ワークブック（No.N = Lesson 20N−19〜20N。run7 で ワールドごと → 20レッスンごと。`worksheets:month` と同じもの。どの家も同じ内容）。**あらかじめ作って置き場所にアップロード**しておきます（`npm run worksheets:month -- --all` → `npm run worksheets:upload`）。置き場所に無い冊は レポートだけ送ります（開発中は `worksheets/out/monthly/` にあれば 自動でアップロード）。
- **置き場所（run5）**: `STORAGE_DRIVER=local`（`REPORT_STORAGE_DIR`、既定 `.data/reports/`）か `s3`（S3 互換: AWS S3・Cloudflare R2・Supabase Storage の S3 API。`S3_BUCKET`・`S3_ENDPOINT`・`S3_REGION`・`S3_ACCESS_KEY_ID`・`S3_SECRET_ACCESS_KEY`）。`src/lib/storage/`。SDK なしで fetch + 署名（AWS Signature V4）だけで話します。Vercel などのサーバーレスでは ファイルが残らないので `s3` にします（[docs/run5/DEPLOY.md](docs/run5/DEPLOY.md)）。
- **ダウンロードページ `/d/<token>`**: トークンは 256 ビットのランダム値で、DB（`ReportDelivery.tokenHash`）には SHA-256 だけを保存。30日で期限切れ。その配信のファイル（`/d/<token>/report`・`/d/<token>/worksheets`）だけを返し、レポートはその家のフォルダ（`reports/<保護者ID>/`）にあるものだけ。ログイン不要（LINE のアプリ内ブラウザで開くため）、検索エンジンに載せない・リファラーを送らない・キャッシュしない。期限切れの配信と PDF は次の一斉配信のときに消えます。お子さまの削除・退会でも消えます。LINE の連携を解除すると、それまでに送ったリンクもすぐ使えなくなります。
- **送信**: `Parent.lineUserId` に push（`X-Line-Retry-Key` 付きで二重送信なし）。毎月の配信は「LINE と連携ずみ・配信オン（`Parent.lineMonthlyEnabled`）・ブロックされていない」保護者だけ。同じ月の送信ずみのお子さまには送りません（`--force` を除く）。
- **webhook `POST /api/line/webhook`**: `X-Line-Signature` を `LINE_MESSAGING_CHANNEL_SECRET` で受け取ったバイト列のまま確かめ（違えば 401。1MB を超える本文は読み切らずに 413）、follow / unfollow で `Parent.lineFriend` を更新します（ブロック中の保護者には送らない）。LINE Developers の「Webhook URL」に `https://<ドメイン>/api/line/webhook` を登録し、「Webhook の利用」をオンにします。
- **おうちの方ページ**: 「LINE で学習レポート」で毎月の配信のオン/オフと「今月のPDFを今すぐ送る」（今月のここまでの分。前回から10分・24時間に3回まで。DB で数えるので再起動しても効く）。送信が未設定のときは「準備中」と表示し、押すと dry-run でダウンロードページへのリンクを出します。
- **キーが無いとき（dry-run）**: `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` と `APP_BASE_URL` がそろっていなければ、LINE には何も送らず、`LINE_OUTBOX_DIR`（既定 `.data/line-outbox/`）に送るはずだった `message.json`（push のリクエストそのもの）と PDF のコピーを書きます。

```bash
npm run line:monthly                          # 先月の分を送る（毎月1日に cron などで実行する想定）
npm run line:monthly -- --dry-run             # 送らずに outbox へ書いて、送る内容を表示
npm run line:monthly -- --parent <保護者ID>   # 1人だけ（dry-run なら LINE 未連携でも試せる）
npm run line:monthly -- --month 2026-11 --force
```

公開したサーバー（Vercel など）では、`vercel.json` の Cron Jobs が `GET /api/cron/line-monthly`（毎月1〜3日の 9:00 日本時間。2日目・3日目は送れなかった分だけ）と `GET /api/cron/trial-cleanup`（毎日 3:30）を `Authorization: Bearer <CRON_SECRET>` 付きで呼びます。`CRON_SECRET` が無いと 何もしません（503）。ほかのスケジューラからも同じヘッダーで GET / POST できます。

- **LINE Developers での準備**（くわしい手順: [docs/run4/LINE-SETUP.md](docs/run4/LINE-SETUP.md)）: LINE ログインのチャネルと**同じプロバイダー**に Messaging API チャネル（公式アカウント）を作ります（プロバイダーがちがうと LINE のユーザーID が一致せず届きません）。長期のチャネルアクセストークンを `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`、チャネルシークレットを `LINE_MESSAGING_CHANNEL_SECRET`、公開 URL を `APP_BASE_URL` に入れます。LINE ログインのチャネルにこの公式アカウントをリンクすると、ログインのときに友だち追加をすすめられます。
- 環境変数: `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`・`LINE_MESSAGING_CHANNEL_SECRET`・`APP_BASE_URL`・`STORAGE_DRIVER`・`REPORT_STORAGE_DIR`（既定 `.data/reports/`）・`S3_*`・`LINE_OUTBOX_DIR`・`CRON_SECRET`。（run5 で `PYTHON` は使わなくなりました。Python + reportlab は ワークシートを作るコマンドだけに必要です）

## 公開（Vercel + Neon / Supabase）（run5）

手順書: **[docs/run5/DEPLOY.md](docs/run5/DEPLOY.md)**（オーナー向け・チェックリストつき）。要点:

- **DB**: `DATABASE_URL`（プールの接続）と `DIRECT_URL`（マイグレーション用の直接の接続）。ビルドは `npm run vercel-build`（`prisma generate` → 本番デプロイのときだけ `prisma migrate deploy` → `next build`。`MIGRATE_ON_BUILD` で切りかえ）。手で流すときは `npm run db:deploy`（= `npx prisma migrate deploy`）。
- **ファイル**: `STORAGE_DRIVER=s3`。ワークブックは `npm run worksheets:month -- --all` → `npm run worksheets:upload`（本番の `S3_*` を入れて実行）。
- **レート制限**: ログイン・暗証番号・再設定・メールの回数制限は DB の表 `RateLimitBucket` で数えます（サーバーが何台でも同じ。キーは SHA-256 で、メールアドレスや IP はそのまま保存しない）。DB が止まっているときは そのサーバーのメモリで数えます。「今すぐ送る」の同時実行も DB のロックで1つずつ。
- **定期実行**: `vercel.json` の `crons`（上の「LINE で月間レポート」）。`CRON_SECRET` が必要。
- **ようすの確認**: `GET /api/health` → DB・置き場所に つながるか、LINE・メール・cron が設定されているか（秘密・バケット名・ホスト名は出しません）。つながらなければ 503。

## 骨組みとして残している部分（本番に向けて差し替える）

| 項目 | 今の実装 | 本番での想定 |
|---|---|---|
| 認証 | 保護者アカウント（メール＋パスワード・LINE・暗証番号・子どもを選ぶ）、パスワードの再設定・暗証番号を忘れた・メールアドレスの確認（run5）は実装済み。レート制限は DB（run5。DB 停止中はメモリ） | 送信サービス（Resend か SMTP）のキーと `MAIL_FROM`・`APP_BASE_URL` を設定。月額課金は Stripe などのWebhookで `Parent.subscriptionStatus` を更新 |
| AI教師の動画 | SVGアバター（口とジェスチャーのアニメーション）＋ブラウザの音声合成 | 事前に生成したアバター動画を `Lesson.videoUrl` に入れる（UIはすでに対応済み） |
| 音声 | ブラウザの音声合成（`NEXT_PUBLIC_RECORDED_AUDIO=1` のときだけ `/media/audio/{audioKey}.mp3` を優先） | ネイティブの収録音声か、事前に生成したTTS |
| 発音判定 | Web Speech API で単語の一致率 × 確信度 | 音素単位で評価できるAPIを `PronunciationScorer` の実装として差し替える |
| アリーナの採点 | seed と現在の記憶状態から問題を作り直す | 出題した内容を TestSession テーブルに保存して採点する |
| まとめ動画 | 台本＋ブラウザの音声合成で自動再生 | リアルなAI先生の動画サービスで生成した動画（`videoUrl` の差し替え口を使う） |
| AI会話 | Claude ＋ 台本フォールバック（相手は4人のローテーション） | 同意フォームは不要（オーナー決定）。電話・メール・URL の伏せ字と「子どもの発話は保存しない」を守ったまま有効化 |
| カリキュラム | 1,200レッスン（40ワールド・5ステージ）完成。ステージ2 以降はネイティブの最終チェック前 | ネイティブ講師による英文の確認、全クリア後の体験（2周目など）は未定 |
| 月額課金・無料体験 | 未実装（保護者アカウントとようす画面が土台） | 今後のフェーズで実装 |
| LINE の月間レポート | 実装済み（キーが無い間は dry-run）。PDF の置き場所は ローカル / S3 互換（run5）、毎月の送信は Cron Jobs | 本番の `S3_*`・`CRON_SECRET` を設定し、ワークブックをアップロード（docs/run5/DEPLOY.md） |
