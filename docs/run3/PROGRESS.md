# Run 3 progress

## Phase 1 - 片付け（完了）

### やったこと
- **night-logs/ を git から外した**: `.gitignore` に `night-logs/` を追加し、`git rm -r --cached night-logs` で追跡を解除（39ファイル）。ディスク上のファイルはそのまま残している。
- **ワールド12の名前を「グランドフィナーレ」→「えいごの王国」に変更**
  - `src/lib/game/worlds.ts`（ワールド名のただ1つのもと。マップ `WorldMap.tsx` とレッスン画面のヘッダーはここを参照しているので自動で反映）
  - `content/curriculum/lessons.json`
    - L331（ワールド12の入口）: teacherScript「ワールド12「えいごの王国」へ ようこそ！」、会話シーン「An entrance ceremony at a junior high school in the Kingdom of English／えいごの王国の ちゅうがっこうの にゅうがくしき」、セリフ「Welcome to the Kingdom of English!／えいごの王国へ ようこそ！」
    - L360（最終回）: titleJa「えいごの王国の グランドフィナーレ（360レッスン そうまとめ）」、シーン「The Grand Finale party in the Kingdom of English／えいごの王国の グランドフィナーレ・パーティー」
    - L360 のまとめ（recap）: 「えいごの王国での さいごの スピーチ、さいこうだったよ」
  - `README.md` と `docs/curriculum-plan.md` のワールド表、curriculum-plan のレッスン360の行

### 判断したこと
- 指示どおり、最終回（L356〜360）の「グランドフィナーレ・パーティー」は **王国の中で開かれる最後のパーティーの名前** としてそのまま残した。ワールドそのものを指していた箇所（L331の入口、ワールド表）だけを王国に変えた。L360 の英語タイトル「World 12 Grand Finale」も最終回の名前として残した。
- L360 の単語 "finale／フィナーレ" はパーティーの単語として残した。
- `docs/night/`・`docs/night2/` の過去の記録は当時の記録なので書き換えていない。
- curriculum-plan の「### ワールド12（…）」見出しは、ほかのワールドの見出しにも名前がないので、そろえるために変えていない。

### チェック
- `npx tsc --noEmit` OK
- `npx vitest run` OK（25ファイル・703テスト）
- `npx next build` OK

## Phase 2 - 保護者アカウント: データと API（完了）

### やったこと
- **スキーマ**: `Parent` に `passwordHash`・`pinHash`・`settings`（Json、既定 `{}`）を追加。新しいモデル `Session { id, parentId, tokenHash @unique, selectedChildId?, pinVerifiedAt?, expiresAt, createdAt }`（保護者を消すとセッションも消える `onDelete: Cascade`）。
  - マイグレーションは DB なしで `prisma migrate diff --from-schema-datamodel <旧スキーマのコピー> --to-schema-datamodel prisma/schema.prisma --script` で作り、`prisma/migrations/20261125130000_parent_auth/migration.sql` に保存。
- **src/lib/auth/**（スタブの `src/lib/auth.ts` は削除して置きかえ）
  - `password.ts`: Node の `crypto.scrypt`（N=16384, r=8, p=1, salt 16バイト）＋ `timingSafeEqual`。形式は `scrypt$N$r$p$salt$hash` なので将来パラメータを上げても古いハッシュを照合できる。未登録メールのときもダミーハッシュで照合して、応答時間で登録の有無がわからないようにした。
  - `session.ts`: 32バイト乱数のトークンを cookie に、DB には SHA-256 だけ。期限30日、期限切れは読んだときに削除。create / read / rotate / destroy / destroyOtherSessions / purgeExpired。
  - `cookies.ts`: cookie `eq_session`（httpOnly・SameSite=Lax・本番は Secure）。
  - `origin.ts` + `src/middleware.ts`: 状態を変えるリクエスト（POST/PUT/PATCH/DELETE）の Origin を **すべての /api** で確認。
  - `rateLimit.ts`: メモリ内の固定ウィンドウ。ログイン（IP+メールで15分8回、IPで15分30回）、登録（IPで1時間10回）、PIN・パスワード再入力（保護者ごとに15分8回）。
  - `index.ts`: `currentParent()`・`currentUserId()`・`requireParent()`・`requirePinUnlocked()`・`requireParentArea()`・`beginSession()`・`rotateCurrentSession()`・`endSession()`。
  - `api.ts`: 保護者 API 用ラッパー `withAuthApi`（Origin 確認・DB 停止時は success:false + ていねいなメッセージ・AuthError → 401/403・ログにはエラーの種類だけ）。
- **API**（契約は `src/lib/api/contracts.ts`。リクエストは zod で厳しく検証、レスポンスは `.catch` で安全なデフォルト）
  - `POST /api/auth/register`・`POST /api/auth/login`・`POST /api/auth/logout`・`GET /api/auth/me`
  - `GET/POST /api/children`・`PATCH/DELETE /api/children/:id`・`POST /api/children/:id/select`
  - `POST /api/parent/verify-pin`・`GET /api/parent/overview`・`GET/PATCH /api/parent/settings`・`DELETE /api/parent/account`
- **サービス**: `src/lib/services/parentService.ts`（子どもを扱う関数はすべて parentId で絞る）。ようす用に `progressService` から習得率の計算だけを `computeUserMastery()` として切り出した（`getDashboard` も同じ関数を使う。ようす画面では MasterySnapshot を書かない）。
- **1日のレッスン回数**: `src/lib/services/dailyLimit.ts`。`GET /api/lessons/:n` と `completeLesson` の両方で確認し、上限なら 403 + `code: "DAILY_LIMIT"` + 子ども向け「きょうの レッスンは ここまで！ また あした あそぼうね。」。`LessonCompleteResponse` に `code` を追加。
- **seed**: `SEED_DEMO_PARENT=1` のときだけデモ保護者（demo-parent@example.com / demo-pass-1234 / PIN 1234、子ども「リコ」）を作る。demo-user はそのまま（保護者にはひもづけない）。
- `.env.example` に `ALLOWED_ORIGINS`・`SEED_DEMO_PARENT` を追加。`npm run check:auth-db` を追加。

### 判断したこと
- **PIN の扱い**: PIN を入れると、そのセッションで **10分間**「おうちの方」エリアが開く（`Session.pinVerifiedAt` を追加。指示のフィールドにはないが、PIN 入力を毎回のリクエストに持たせないため）。
  - PIN が必要: 子どもの追加・変更・削除、ようす、設定、退会。
  - PIN 不要（子どもが操作する）: `GET /api/children`、`POST /api/children/:id/select`、`GET /api/auth/me`。
  - **登録直後** は PIN 入力ずみとして扱う（そのまま子どもを追加できるように）。**ログイン直後** は PIN 未入力（ログインした端末を子どもに渡すことがあるため）。
- **退会** は パスワード + PIN 入力ずみ の両方が必要。保護者・セッション・すべての子ども・子どもの学習データ（進捗・解答・記憶・コイン台帳・モンスター・チケット・ショップ・お宝アラート・テスト結果・スナップショット・フレンド）を1つのトランザクションで完全削除。外部キーの cascade は増やさず、削除する表をコードに明示した（何を消すかが読んでわかるように）。
- **子どもの削除** も同じ削除処理。選ばれていたセッションの `selectedChildId` を空にし、回数制限の設定も消す。
- **currentUserId()**: ログイン中で、選ばれた子どもが本当にその保護者の子どものときだけその id。それ以外（未ログイン・未選択・DB 停止・他人の子ども）はデモユーザー（おためしモード）。cookie が無いときは DB に問い合わせない。
  - 以前のスタブの `uid` cookie は **廃止**（誰でも他人の id を入れてなりすませたため）。
- **ログインのたびに新しいトークン**（cookie に古いセッションがあれば消す＝セッション固定対策）。`GET /api/auth/me` で作成から1日たったセッションは自動で入れ替え。**パスワード変更** でほかの端末はすべてログアウト、この端末はトークン入れ替え。
- **ログイン失敗** は「メールアドレスまたはパスワードが正しくありません。」で統一。登録でメールが使用済みのときは「このメールアドレスでは登録できません。すでに登録済みの場合はログインしてください。」（使いやすさを優先。登録はレート制限つき）。
- **パスワードのルール**: 8〜128文字・英字と数字を両方（`PASSWORD_RULES_JA` を画面でも使える）。全角で入力しても NFKC で同じとみなす。
- **子ども**: ニックネーム 1〜12文字（制御文字・`<>` 不可）、学年 1〜6、生まれ年は任意（2000〜2100）。1保護者 **6人まで**。フレンドコードは自動生成（0/O・1/I を使わない）。
- **回数制限の数え方**: きょう（APP_TIMEZONE）あたらしく完了したレッスン数。上限に届いても **完了ずみレッスンのおさらいはできる**（コインはほとんど増えず、回数にも数えない）。上限は 1〜10、null で制限なし（既定）。おためしモードにはかからない。
- **DB 停止時**: 保護者 API は 503 + `success:false, offline:true` + 「ただいまアカウント機能を利用できません。…（おためしモードはそのまま遊べます）」。`GET /api/auth/me` だけは 200 + `loggedIn:false`（画面がおためしモードで動けるように）。ログアウトは DB が止まっていても cookie を必ず消す。ゲームの API はこれまでどおりオフラインモード。
- Origin が無いリクエストは許可（ブラウザは POST などに必ず Origin を付ける。付かないのはブラウザ以外で、httpOnly cookie を持たないので CSRF にならない）。ただし `Sec-Fetch-Site: cross-site` なら拒否。
- レート制限はメモリ内なのでサーバー1台が前提。複数台にするときは DB / Redis に置きかえる（コードにコメントを書いた）。

### テスト
- `tests/auth-core.test.ts`: ハッシュ（照合・salt・壊れた形式・NFKC・既定パラメータ）、セッション（DB にはハッシュだけ・期限切れ・入れ替え・破棄・PIN の10分）、Origin、レート制限。
- `tests/auth-routes.test.ts`: メモリ内 Prisma（`tests/helpers/fakePrisma.ts`）と cookie のモックでルートハンドラを通しで確認。登録・ログイン・ログアウト・me・子ども・PIN・ようす・設定・退会・DB 停止・**持ち主チェック（B は A の子どもを 見る／選ぶ／変える／消す／回数制限する／ようすで見る のどれもできない）**。
- `tests/auth-contracts.test.ts`: リクエストの検証と、レスポンスの安全なデフォルト。
- `tests/daily-limit.test.ts`: 回数制限（サービスとレッスンのルート2つ）。
- テスト中に見つけたバグ: settings の回数制限に1つでも壊れた値があると zod が全体を捨てていた → 値ごとに検証するよう修正。

### 本物の DB での確認（Docker）
- Docker は使えたが、ポート 5432 は **別プロジェクトのコンテナ（gamblex-db）が使用中** だったため、それには触らず、使い捨ての `postgres:16` をポート 5544 で起動して確認した（確認後に停止・削除ずみ）。`docker compose up -d` はこのポートの衝突で起動できなかった。
- `npx tsx scripts/auth-db-check.ts --db <テスト用URL>`（= `npm run check:auth-db -- --db ...`）で、migrate deploy（4つすべて適用）→ seed（デモ保護者つき）→ `next start`（本番モード）→ HTTP で 27項目を確認し、**すべて OK**。退会後に孤立した子ども・セッション・進捗・コインが残っていないことも SQL で確認した。

### メモ
- `npx prisma generate` は型の生成までは成功したが、クエリエンジンの DLL の置きかえが EPERM で失敗した（ほかのプロセスが DLL を使用中）。Prisma のバージョンは同じなのでエンジンは既存のままで問題なく、tsc・build・本物の DB での確認もすべて通っている。
- 画面（/welcome・/register・/login・/who・/parent）は Phase 3 で作る。

### チェック
- `npx tsc --noEmit` OK
- `npx vitest run` OK（29ファイル・782テスト）
- `npx next build` OK

## Phase 3 - 保護者アカウント: 画面（完了）

### やったこと
- **入口 `/`**: DB に問い合わせずに cookie だけでふりわけ。ログインの cookie あり → `/who`、「おためしで あそぶ」を選んだことがある → `/map`（これまでどおり）、はじめて → `/welcome`。
- **/welcome**: キービジュアル＋「おうちの方：とうろく」「おうちの方：ログイン」「おためしで あそぶ」。ログイン中なら「つづきから あそぶ」も出す。
- **/register**: メール・パスワード（確認つき）・暗証番号4けた（確認つき）。パスワードのルールを入力しながら ✔ で表示（サーバーの検証と同じ判定をテストで確認）。表示/隠す ボタン。エラーは項目ごとにふつうの言葉で表示（サーバーが返す `field` も項目に結びつける）。登録後は `/parent?add=1` でそのままお子さまの追加へ。
- **/login**: 失敗は共通の文言。DB 停止中はていねいなメッセージ＋「おためしで あそぶ」ボタン。ログイン後は `/who`。
- **/who「だれが あそぶ？」**: キャラクターの顔のアバターカード（2列）。タッチで選んで `/map` へ。「＋ こどもを ついか」と「おうちの方」は暗証番号を通る。ログインしていない／DB 停止のときは、ビリモが「いまは アカウントに つながらないよ」と出て おためしモードへ進める。
- **ヘッダー（AccountBar）**: ゲームの画面の上に、いま遊んでいる子の顔と名前・「かわる」（→ `/who`）・小さな「おうちの方」（→ 暗証番号パッド → `/parent`）。未ログイン・DB 停止なら「おためしモード」＋とうろく/ログインへの入口。ログイン中で子どもが未選択なら `/who` へ移動（だれの記録かわからないまま遊ばせない）。
- **暗証番号パッド（PinPad / PinDialog）**: 4つ目で自動確認、違えばゆれてエラー。キーボードの数字・Backspace も使える。ボタンにはすべて aria-label。
- **/parent**: お子さまごとのようすカード（レッスンの進みぐあい・連続学習日数（最長）・総合習得率・今日のレッスン回数・最終学習日（今日/昨日/N日前）・伸ばしたい力）、「6つの力のレーダーを見る」、1日のレッスン回数（制限なし/1〜10回、選ぶとすぐ保存）、編集（ニックネーム・学年・生まれ年）、削除（2段階の確認）、お子さまの追加（6人まで）、暗証番号の変更、パスワードの変更、ログアウト、退会（注意を読んでチェック → パスワードを入れて「完全に削除する」の2段階）。
  - どの操作でも、暗証番号の期限（10分）が切れていたらパッドに戻り、ログインが切れていたら `/login`、DB 停止ならていねいなメッセージに切りかえる。
- アカウント画面（/welcome・/register・/login・/who・/parent）では下のゲームメニューとアカウントバーを出さない。
- 金色のボタンの上のクリーム色の文字が読みにくかったので、2番手のボタン用に `.btn-ghost`（暗いガラス＋金のふち）を追加し、編集・やめる・ログアウト・暗証番号のキーに使った。

### 判断したこと
- **子どものアバターは DB に保存しない**（データを増やさない）。きょうだいの登録順で ハル→リコ→キコ→ビリモ を割りあてる（API はいつも登録順で返すので、同じ子はいつも同じ顔。最初は id のハッシュで決めていたが、スクリーンショットで2人が同じ顔になったので登録順に変更）。
- **「6つの力のレーダーを見る」** は、その子を「いま遊んでいる子」に選んでから既存の `/dashboard` を開く（レーダー画面を保護者用にもう1つ作らない）。ヘッダーの名前もその子に変わる。
- **おためしの目印 cookie `eq_trial`** は「次から最初の画面をとばす」ためだけのもので、ログイン情報ではない（httpOnly でなくてよい）。
- 「＋ こどもを ついか」は `/who` の中にフォームを作らず、暗証番号を通して `/parent?add=1` の追加フォームを開く（追加は保護者の操作なので）。
- 子どもの画面の文言はひらがな多め、保護者の画面はていねい語にした。会社名は入れていない。

### 画面の確認（Playwright・本物の DB）
- `scripts/auth-ui-screens.ts`（`npm run screens:auth -- --db <テスト用URL>`）を追加。migrate → seed → 本物の DB の `next start` と、つながらない DB の `next start`（DB 停止の確認用）を起動し、幅 360px で
  スタート → 登録（エラー表示）→ お子さま2人追加 → 回数制限 → だれが あそぶ？ → マップ（ヘッダー）→ レッスン完了 → ログアウト → ログイン（失敗・成功）→ 暗証番号（違う・正しい）→ おうちの方 → 編集・退会の確認 → レーダー → PIN 未入力で /parent → おためしモード → DB 停止中のログイン・/who・マップ
  を画面で操作して **25項目すべて OK**（横のはみ出しなし・コンソールエラーなし）。
- スクリーンショットは `docs/run3/screens/p3-*.png`（15枚）。見て直したところ: 暗証番号の欄が横いっぱいに広がっていた／2人のアバターが同じ顔／保護者ページの見出しが変な位置で折り返す／のぞきキャラが人数表示に重なる／2番手ボタンの文字が読みにくい／マップのヘッダーのスクリーンショットが自動スクロールで写っていなかった（撮り方を修正）。
- Docker の使い捨て `postgres:16` をポート 5544 で起動して確認し、確認後に停止（`--rm` なので削除ずみ）。ほかのプロジェクトのコンテナ（5432）には触っていない。

### テスト
- `tests/auth-ui.test.ts`: パスワードのチェックリストがサーバーの検証と一致すること、アバター、学年表示、最終学習日の表示、アカウント画面の判定、API の失敗の見分け。

### チェック
- `npx tsc --noEmit` OK
- `npx vitest run` OK（30ファイル・788テスト）
- `npx next build` OK

## Phase 4 - 全体チェック（完了）

### スモークテスト（DB 停止）
- `scripts/smoke.ts` に保護者アカウントの画面（/welcome・/register・/login・/who・/parent）を追加。さらに **DB 停止中のアカウントの流れ** を追加:
  - API: `me` は 200 + `loggedIn:false`、登録・ログイン・子ども一覧/追加・暗証番号・ようす・設定は 503 + `offline:true` + ていねいな文言、ログアウトは 200
  - 画面: はじめて `/` → /welcome →「おためしで あそぶ」→ マップ（ヘッダーに「おためしモード」）→ 次からは `/` でマップへ／ログイン・登録の送信 → ていねいな案内 →「おためしで あそぶ」／古いログイン cookie が残ったまま DB 停止 → `/` → /who の案内 → おためしでマップ／/parent の DB 停止の案内
  - DB 停止中のアカウント API の 503 は「正しい応答」なので、その流れの中だけ許可（ゲーム側の 5xx はこれまでどおり失敗）。保護者ページの「読み込み中…」も止まり検出の対象に追加。
- `scripts/smoke-offline.ts`（`npm run smoke:offline -- <保存先> [--port N]`）を追加。つながらない DATABASE_URL で `next start` を起動 → スモーク → 停止 までを1コマンドで行う。
- 結果: **ぜんぶ OK**。スクリーンショット（アカウント関係のみ）は `docs/run3/screens/p4-smoke/`。
- 見つけて直したバグ: **/parent が未ログイン・DB 停止でも `/api/parent/overview` を同時に呼んでいた**（むだな 401/503 がコンソールに出る）。`me` でログインと PIN を確かめてから ようすを読むように変更（PIN 未入力ならその場で暗証番号パッド）。

### 本物の DB での通し確認（Docker）
- ポート 5432 は別プロジェクトのコンテナが使用中のため触らず、使い捨ての `postgres:16`（コンテナ名 eq-p4-check、ポート 5544、`--rm`）で確認し、終わってから停止・削除した。
  ポート 3100・3457 もほかのプロセスが使っていたので触らず、3461・3471・3473 を使った。
- `scripts/auth-db-check.ts` を Phase 4 の流れに合わせて拡張: migrate deploy → seed → `next start`（本番モード）→
  **登録 → 子ども2人追加 → A を選んでレッスン1 → ようすに A=1・B=0 → B に切りかえ（B のマップはレッスン1未クリア・コイン0）→ B もレッスン1 → ようす A・B それぞれ1** → 回数制限 → 持ち主チェック → ログアウト後の cookie の使い回し → セッション固定のまね → ほかのサイトからの POST → PIN → パスワード変更 → **退会 → 保護者・子ども・セッション・進捗・コイン・解答ログ・記憶・習得率が DB に1件も残っていないことを Prisma で確認**。
  結果: **41項目すべて OK**。
- `scripts/auth-ui-screens.ts`（Playwright・本物の DB）も再実行して **すべて OK**（/parent の読みこみ方を変えたため）。Phase 3 のスクリーンショットは撮り直さずそのまま残した。

### セキュリティの自己レビュー（認証まわり）
確認して問題なかったもの:
- **セッション固定**: ログイン・登録のたびに cookie の古いセッションを消して新しいトークンを発行（ログイン前に仕込まれた cookie は使われない。単体テストと本物の DB の両方で確認）。
- **cookie**: `eq_session` は HttpOnly・SameSite=Lax・Path=/・本番は Secure（本物の DB の確認で Set-Cookie を検査）。トークンは 32バイト乱数、DB には SHA-256 だけ。
- **持ち主チェック**: 子どもを扱う処理はすべて `parentId` で絞りこみ。`currentUserId()` も「選ばれた子どもが本当にその保護者の子か」を毎回確認。ほかの保護者の子は 選ぶ／変える／消す／回数制限／ようす のどれも 404。
- **CSRF**: middleware ですべての API の POST/PATCH/DELETE の Origin を確認（ほかのサイトからは 403）。
- **ログ**: パスワード・PIN・トークン・リクエスト本文をログに出していない（認証 API のエラーログは種類とコードだけ。ゲーム API のログも本文は出さない）。
- **ログアウト・パスワード変更・退会**: サーバー側のセッションを消す（ログアウト前の cookie を使い回しても未ログイン）。パスワード変更でほかの端末はすべてログアウト。
- **入力**: すべて zod。パスワードは 128文字まで（scrypt に巨大な入力を渡さない）。ログイン失敗は共通の文言、存在しないメールでもダミーのハッシュを照合して時間をそろえている。

見つけて直したもの:
1. **ログインのレート制限が IP の偽装ですりぬけられた**: 制限のキーが「x-forwarded-for の IP」と「IP + メール」だけだったので、プロキシの無い環境ではヘッダーを毎回変えれば1つのアカウントを総当たりできた。→ **IP に関係なく同じメールに 15分 20回まで** の制限を追加（成功したら数え直し）。テスト追加。
2. **保護者PIN の試行回数がゆるかった**: 4けた（1万通り）に対して 15分 8回で、パスワード再入力と同じカウンターを共有していた。→ **PIN は 15分 5回** に下げ、パスワードの再入力（暗証番号・パスワードの変更、退会）は別のカウンター（15分 8回）に分けた。制限中は正しい PIN でも開かないことをテスト。
3. **1日ごとのトークン入れ替えで、同時に出ていたリクエストが未ログイン扱いになる**: `me` でトークンを入れ替えた瞬間に古いトークンを消していたため、同じ画面から同時に出ていたリクエスト（例: レッスン完了）が古い cookie のままだと「未ログイン → おためしのデモユーザー」に記録され、**子どもの学習記録が消える**おそれがあった。→ ふだんの入れ替えでは古いトークンを **60秒だけ** 使えるようにした（その間に古いトークンから新しいセッションは作れない）。パスワード変更など安全のための入れ替えは猶予なしで即無効（テストで確認）。

残したもの（判断）:
- 登録で「すでに登録済み」を 409 で返すので、メールアドレスが登録済みかどうかは分かる（登録画面として一般的な挙動。登録は IP ごとに 1時間 10回の制限あり）。
- レート制限はメモリ内（サーバー1台が前提）。複数台にするときは DB / Redis に置きかえる（Phase 2 からの方針どおり）。
- cookie 名に `__Host-` を付けると開発環境（http）でログインできなくなるため付けていない（Path=/・Domain なし・本番 Secure で実質同等）。
- PIN を入れたときにトークンは入れ替えていない（PIN は「子どもから保護者エリアを守る」ためのもので、同じ端末・同じ保護者のセッションの中の状態のため）。

### チェック
- `npx tsc --noEmit` OK
- `npx vitest run` OK（30ファイル・791テスト）
- `npx next build` OK
- `npm run smoke:offline` OK、`npm run check:auth-db`（本物の DB）41項目 OK、`npm run screens:auth`（本物の DB）OK

## Phase 5 - README とおはようメモ（完了）

### やったこと
- **README.md を更新**: はじめの画面（/welcome）と おためし・登録の流れ、デモ保護者（`SEED_DEMO_PARENT=1`）、マイグレーション `parent_auth`、DB 停止時のアカウント画面の案内、コマンド表（テスト件数 30ファイル・791件、`smoke:offline`・`check:auth-db`・`screens:auth` を追加）、ディレクトリ構成（`src/lib/auth/`・`parentService`・`dailyLimit`・`middleware.ts`・/welcome・/register・/login・/who・/parent・`docs/run3/`）、新しい節「保護者アカウント」、DB 設計の表に `Session`、1日の回数制限の注記、「骨組みとして残している部分」の認証の行（実装済み／パスワード再設定・メール確認は未実装）。
- **docs/run3/MORNING.md を作成**（オーナー向け）: かわったこと、ためしかた（DB なし／DB あり・デモ保護者でのログイン手順）、のこっている問題、決めてほしいこと。

### 判断したこと
- `docker compose up -d` はこの PC ではポート 5432 の衝突で起動できなかったため、MORNING.md に注意として書いた（docker-compose.yml のポートは変えていない。ほかの環境では 5432 のままが自然なため）。
- 「のこっている問題」に、パスワード・暗証番号を忘れたときの再設定が無いこと、おためしの記録が登録後に引きつがれないことを明記した。

### チェック
- `npx tsc --noEmit` OK
- `npx vitest run` OK（30ファイル・791テスト）
- `npx next build` OK
