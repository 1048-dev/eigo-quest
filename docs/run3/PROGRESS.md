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
