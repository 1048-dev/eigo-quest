# Run 5 progress

## Phase 1: 端末ごとの おためし学習者 ＋「おためしの きろくを ひきつぐ」ボタン（完了）

### やったこと
- **端末ごとの おためし学習者**: DB が動いているとき、ログインしていない端末は さいしょのゲーム API で 保護者なしの `User`（`isTrial = true`、ニックネーム「おためし」）を1人つくります。httpOnly cookie `eq_trial_learner` には 32バイトの乱数トークンだけを入れ、DB には その SHA-256（`User.trialTokenHash`）だけを保存します（セッションと同じ方式。ランキングなどで User.id が見えても なりすませない）。
  - スキーマ: `User.isTrial`・`trialTokenHash`（ユニーク）・`lastActiveAt`、インデックス `(isTrial, lastActiveAt)`。マイグレーション `20261129090000_trial_learner` は `prisma migrate diff` で DB なしに作成。
  - `resolveLearner()`（`src/lib/auth/index.ts`）: ① ログイン中の保護者が えらんだ 自分の子ども → ② この端末の おためし学習者 → ③ DB 停止なら「だれでもない」（`NO_LEARNER_ID`。画面は これまでどおり ブラウザの きろくで あそぶ オフラインモード）。`currentUserId()` は その userId。
  - 共有のデモユーザー（`demo-user`）は seed にだけ のこし、あそぶときには もう使いません。
  - レッスン完了・テスト送信の `trial` は「ログインした子どもではない」の意味に。画面は オンラインのときは ブラウザに おためしの きろくを書かず（DB の おためし学習者に入るため・二重に ならないように）、オフラインのときだけ これまでどおり書きます。
  - 全国ランキングには ほかの端末の おためし学習者を出しません（自分だけは見える）。
- **ひきつぎ**: `POST /api/children/:id/carry-over` が ブラウザの きろく（ボディ）＋ この端末の おためし学習者（cookie）の DB の きろく（クリアしたレッスン・合格したテスト・コイン・れんぞく日数・記憶・モンスター）を いっしょに その子に たします。計算は純粋な関数 `planDeviceTrialMerge`（`src/lib/domain/trialMerge.ts`）。
  - 1回だけ: CoinLedger の しるし `trial-carry:<ブラウザのID>` と `trial-carry-db:<おためし学習者のID>` を べつべつに書く（同時に2回送られても・ほかの子どもに送られても 2回目は なにもしない）。
  - コピー: おためし学習者の行は のこし（60日後の そうじで消える）、`trialTokenHash` を null にして cookie も消す（この端末は もう その おためし学習者に もどらない）。
  - ブラウザの コインは これまでどおり「ありえる上限」で おさえ、DB の コインは そのまま（サーバーの きろくなので信用できる）。
  - `GET /api/trial`: この端末の おためし学習者に ひきつげる きろくが あるか（数と、「いいえ」を おぼえるための ref。つくらない・書かない）。
- **「だれが あそぶ？」の「ひきつぐ？」**: ブラウザ か DB の どちらかに きろくが あれば きく。「いいえ」は その きろく（ブラウザのID｜サーバーの ref）に たいしてだけ おぼえる（あたらしい おためしの きろくが できたら また きく）。run4 の しるし（"declined"/"carried"）も読めます。
- **おうちの方ページの「おためしの きろくを ひきつぐ」ボタン**（`src/components/parent/TrialCarryPanel.tsx`）: この端末に きろくが あるときだけ出る。お子さまを えらぶ → 「元に戻せません。よろしいですか？」の確認 → 引き継ぐ。「いいえ」のあとでも つかえます。
- **そうじ**: `scripts/cleanup-trial.ts`（`npm run trial:cleanup`）。60日 あそばれていない おためし学習者を 学習記録ごと消す（`lastActiveAt` が無い古い行は つくった日で判定）。`--dry-run`（数だけ）・`--days`（7〜3650）・`--timeout`（既定600秒。時間ぎれなら とちゅうでやめて 次の実行で つづき。さらに +30秒で強制終了）。1バッチごとに進みぐあいを表示し、消す直前に もう一度 条件を たしかめます。cron の例は README とスクリプトの先頭に記載。
- **テスト**: `tests/trial-learner.test.ts`（21件: だれの きろくに なるかの順番・cookie の中身と DB のハッシュ・でたらめ cookie・DB 停止・描画中は つくらない・lastActiveAt の間引き・ブラウザ＋DB の ひきつぎ・1回だけ・ほかの家・そうじの えらびかた・dry-run・時間ぎれ・消す直前の再確認）。既存のテストを新しい動きに合わせて更新（デモユーザー → おためし学習者）。合計 904 件 すべて OK。
- 本物の DB 用の確認スクリプト（`carry-db-check.ts`・`run4-flow-check.ts`・`e2e-smoke.ts`）も、デモユーザーではなく おためし学習者を使う形に直しました。

### 決めたこと（理由）
- cookie には User.id ではなく乱数トークン、DB にはハッシュだけ: User.id は ランキング API などで見えるため。
- おためし学習者を つくるのは ルートハンドラ（cookie を書ける場所）だけ。`/recap` の Server Component では つくらない（書けない cookie のために 行が ふえないように）。いなければ「まだ わからない」として まとめ動画を見せる。
- GET でも つくる（「さいしょのゲーム API」）。クローラーなどで ふえた行は 60日の そうじで消える。
- ひきついだあとも おためし学習者の行は すぐには消さない（指示どおり「コピー」。万一のときに確認できる）。60日で自動的に消える。
- `lastActiveAt` の更新は1時間に1回まで（毎リクエスト書かない）。cookie の期限（400日）も そのときに のばす。
- 「いいえ」は 端末ずっとではなく その きろくに たいしてだけ（指示3: あとからでも ひきつげる ように。ボタンは「いいえ」に かかわらず出す）。
- 環境変数の追加なし（.env.example の変更なし）。

### 確認
- `npx tsc --noEmit`（本体・scripts）OK、`npx vitest run` 34ファイル 904件 OK、`npx next build` OK。
- 本物の DB（Docker の PostgreSQL・ポート 5544）での確認は **できませんでした**: Docker Desktop が起動しておらず、この実行では起動の許可が得られなかったため。マイグレーションは `prisma migrate diff` で生成し、メモリ内 Prisma のテストで確認しています。Phase 4 で Docker が使えれば `carry-db-check.ts` / `run4-flow-check.ts` で通し確認します。

## Phase 2: パスワードの再設定・暗証番号を忘れた・メールアドレスの追加（完了）

### やったこと
- **メール送信のしくみ**（`src/lib/mail/`）: `MAIL_PROVIDER=resend|smtp|outbox` で えらぶ。
  - `resend`: Resend の HTTP API（`RESEND_API_KEY`・`MAIL_FROM`。15秒でタイムアウト）
  - `smtp`: nodemailer（`SMTP_URL`・`MAIL_FROM`。接続・あいさつ・通信それぞれ15秒でタイムアウト）。依存に `nodemailer` を追加
  - `outbox`（キーが無いときの既定）: 送らずに `.data/mail-outbox/`（`MAIL_OUTBOX_DIR`）へ JSON と HTML を書き、ログにファイルの場所だけを出す
  - MAIL_PROVIDER が空なら RESEND_API_KEY → SMTP_URL → outbox の順。えらんだ送り方に必要な値が足りなければ outbox にして警告。ログには あて先・本文（トークン）を出さない
  - 文面（`templates.ts`）: 再設定のご案内・再設定しました のお知らせ・メールアドレスの確認・「すでに登録があります」のお知らせ。ていねい語、テキスト + かんたんな HTML、アプリ名「英語クエスト」だけ（会社名なし）、HTML はエスケープ、http(s) 以外のリンクは うけつけない
- **トークン**: 新しい表 `AuthToken`（`PASSWORD_RESET` / `EMAIL_VERIFY`）。32バイトの乱数を DB には SHA-256 だけ保存。再設定は **30分**、メール確認は **24時間**。**1回だけ**（`usedAt` を「まだ null で期限内のときだけ」書く `updateMany` = 同時に2回送られても1回しか通らない）。新しく発行すると 同じ保護者・同じ種類の まだ使っていないトークンは消す。期限切れから7日たった行は ついでに掃除。`Session.lineReauthAt` も追加（マイグレーション `20261130090000_password_reset` は `prisma migrate diff` で DB なしに作成）。
- **パスワードを忘れた**: `/login` に「パスワードを忘れた方」→ `/forgot-password`。`POST /api/auth/password-reset/request` は **登録の有無に かかわらず同じ答え**。DB を調べて送るのは **応答のあと**（`after()`。`src/lib/mail/background.ts`）なので、時間でも わからない。登録が無ければ メールもトークンも作らない。
  - `/reset-password?token=...`: 画面は `?token=` をすぐ URL から消し（Referrer-Policy: no-referrer・検索よけ）、`check`（使わない）→ 新しいパスワード2回 → `complete`。成功すると **その保護者のすべてのセッションを消し**（すべての端末でログアウト）、この端末の cookie も消して `/login?reset=1` へ。「再設定しました」のお知らせメールも送る。
  - 送ったあとで メールアドレスが変わっていたら そのリンクは使えない。設定画面でパスワードを変えたときも 未使用の再設定リンクを無効に。退会でトークンも消す。
  - レート制限: 同じ IP から1時間に10回（こえたら 429）、同じメールへは1時間に3通（こえても同じ答えで だまって送らない＝登録の有無を教えない・メール爆撃よけ）、リンクの確認・使用は同じ IP から15分に20回。
- **暗証番号を忘れた**: 暗証番号パッド（おうちの方ページ・ヘッダーの「おうちの方」ダイアログ）の下に「暗証番号を忘れた」→ `/forgot-pin`。
  - パスワードがある保護者: アカウントのパスワード + 新しい暗証番号（`POST /api/parent/reset-pin`。15分に8回まで）
  - LINE と連携ずみ: 「LINEで本人確認する」（`/api/auth/line/start?mode=reauth`）→ コールバックで「始めた保護者が まだログイン中」かつ「戻ってきた LINE が その保護者の LINE と同じ」ことを確認 → セッションに `lineReauthAt` → **10分以内・1回だけ** 新しい暗証番号を決められる。ちがう LINE なら `reauth_mismatch`。
  - 決めると その端末は暗証番号を入力ずみ → そのまま おうちの方ページへ。
- **LINE だけの保護者のメールアドレス + パスワード追加**: `/parent` に「メールアドレスでのログインを追加」（パスワードが無い保護者だけ表示）。`POST /api/parent/email`（暗証番号が必要・1時間に5回）→ 確認メール → `/verify-email?token=...` で「確定する」を押すと `Parent.email`・`passwordHash` に入る（`email: null` のときだけ書く・ユニーク違反は `EMAIL_TAKEN`）。そのアドレスが ほかのアカウントで使われていても画面の答えは同じで、そのアドレスに「すでに登録があります（パスワードの再設定はこちら）」のお知らせが届く（確認リンクは作らない）。
- **画面**: `/forgot-password`・`/reset-password`・`/verify-email`・`/forgot-pin` を追加（ゲームのバー・下のメニューは出さない）。DB 停止中は「ただいまアカウント機能を利用できません」と表示（ページを開いたときの API は 200 + `offline: true` で返す）。
- **テスト**: `tests/password-reset.test.ts`（40件: 送る・登録の有無で同じ答え・メールなしの LINE 保護者・レート制限・古いリンクの無効化・check は使わない・成功・すべてのセッションが消える・1回だけ・同時に2回・30分の期限・でたらめ／ほかの種類のトークン・弱いパスワード・メールアドレスの変更・設定画面のパスワード変更で無効・ほかの保護者に影響しない・退会・APP_BASE_URL・暗証番号を忘れた（パスワード／LINE／10分／ちがう LINE／未連携／とちゅうで保護者が切りかわる）・メールアドレスの追加（確定・使用中のアドレス・競合・24時間・409/403/400・回数・再設定には使えない））、`tests/mailer.test.ts`（8件: 送り方の えらび方・Resend の HTTP・失敗・outbox・文面とエスケープ）。メモリ内 Prisma に `authToken` と `updateMany` のユニーク確認を追加。合計 36ファイル 952件 すべて OK。
- 本物の DB 用の確認スクリプト `scripts/reset-db-check.ts`（`npm run check:reset-db`。進みぐあいを表示・`--timeout` 秒で終了）。スモークに新しい4画面を追加。
- `.env.example` と README に `MAIL_PROVIDER`・`MAIL_FROM`・`RESEND_API_KEY`・`SMTP_URL`・`MAIL_OUTBOX_DIR`（すべて空）と `APP_BASE_URL` の新しい使いみちを記載。

### 決めたこと（理由）
- 再設定のあとは 自動ではログインさせず、ログイン画面へ（すべてのセッションを消す指示と そろえる。新しいパスワードを ブラウザに覚えてもらいやすい）。
- 再設定リンクを新しく送ると古いものは無効（さいごのメールだけ有効）。期限切れの案内に「新しいメールが送られています」も入れた。
- 同じメールへの回数制限は 429 にせず だまって送らない（429 にすると 送った／送らないの差は出ないが、ふつうの答えと同じにしておく方が安全・メール爆撃も防げる）。IP の制限だけ 429。
- メールのリンクは `APP_BASE_URL` から作る。開発中だけ リクエストの URL を使い、**本番で未設定なら送らない**（Host ヘッダーを書きかえて 他人の再設定リンクを攻撃者のサイトへ向けさせる攻撃を防ぐ）。
- メールアドレスの確認は「リンクを開く」だけでは確定せず「確定する」ボタン（メールの安全チェックが自動でリンクを開いても 勝手に確定しない）。再設定の画面も 開いただけでは使わない。
- 追加するパスワードは 申し込みのときに ハッシュにして トークンの行に入れ、確定したときに写す（確認前のアカウントは変えない）。
- 「暗証番号を忘れた」の LINE 本人確認は、連携ずみの LINE と同じ人か だけを見る（LINE アプリにログインしたままの端末を お子さまが使うと通ってしまう点は、LINE だけの保護者には ほかに確かめる手段が無いため 受け入れた。メールアドレスを追加すればパスワードでも確かめられる）。
- LINE の本人確認の しるしは 1日ごとのセッション入れ替えでも引きつぐ（10分の間に入れ替わっても失敗しないように）。
- メールアドレスの「変更」は今回の範囲外（追加だけ。すでにメールがある保護者は 409）。
- メールの送信は 応答のあと（`after()`）。Vercel などでも 応答のあとに処理を続けられる。テストでは `flushBackgroundTasks()` で待つ。
- Vercel ではファイルが残らないため outbox は開発用。本番は resend か smtp を設定する（README に記載）。

### 確認
- `npx tsc --noEmit`（本体・scripts）OK、`npx vitest run` 36ファイル 952件 OK、`npx next build` OK。
- `npm run smoke:offline`（DB 停止 + next start + Playwright）: 新しい4画面を含めて ぜんぶ OK。
- 本物の DB（Docker の PostgreSQL・ポート 5544）での確認は **できませんでした**: Docker Desktop が起動していないため（Phase 1 と同じ）。`scripts/reset-db-check.ts` を用意したので、Phase 4 で Docker が使えれば `npm run check:reset-db -- --db postgresql://eigo:eigo@localhost:5544/eigo_quest?schema=public` で通し確認します。

## Phase 3: 公開の準備（Vercel + マネージド PostgreSQL）（完了）

### やったこと
- **ファイルの置き場所（`src/lib/storage/`）**: `STORAGE_DRIVER=local|s3`。
  - `local`: これまでどおり `REPORT_STORAGE_DIR`（既定 `.data/reports`）。書くときは別名で書いてから置きかえる。
  - `s3`: S3 互換（AWS S3・Cloudflare R2・Supabase Storage の S3 API・MinIO）。**SDK を入れず** fetch + AWS Signature V4 を自前で実装（PUT / GET / HEAD / DELETE / ListObjectsV2 を1件だけ）。署名は AWS の公式の例と同じ値になることをテストで確認。パス形式（R2・Supabase）とバーチャルホスト形式（AWS）、`S3_PREFIX` に対応。ヘッダーが届くまで 15秒（PUT は 60秒）で時間切れ。エラーには HTTP のステータスだけを入れ、キー・秘密は出さない。
  - キーは「英数字と ._-/ だけ・`.` `..` や空のセグメントは だめ」（`isValidKey`）。どの置き場所でも 外に出る書き方ができない。
  - STORAGE_DRIVER が空なら `S3_BUCKET` があれば s3、なければ local。
- **ダウンロード `/d/<token>/<file>`**: 置き場所から **少しずつ流して** 返す（S3 の本文をそのまま中継。`content-length` つき）。置き場所が こわれていれば 503、ファイルが無ければ 404。持ち主チェック（レポートは `reports/<保護者ID>/` の中だけ、ワークブックは `worksheets/` の中だけ）は キーの文字列で行う（`..` は キーとして受け付けないので抜けられない）。
- **Python をサーバーから外した**:
  - 学習レポート（1ページ）は **Node だけ**で作る（`src/lib/report/pdf.ts`）: `pdf-lib` + `@pdf-lib/fontkit` + 日本語フォント **Noto Sans JP Regular**（SIL Open Font License 1.1。`assets/fonts/NotoSansJP-Regular.ttf` と `OFL.txt`）を **使った文字だけ埋め込む（サブセット）**。1ページ 約20KB、作るのに 約0.2秒。フォントが読めないときは これまでの依存なしの かんたんな PDF。レイアウトは2つのエンジンで共通の関数（`layoutReport`）。
  - フォントは npm の `@expo-google-fonts/noto-sans-jp`（Google Fonts の TTF をそのまま入れた パッケージ）から Regular だけを取り出しました（直接のダウンロードは この環境では許可されなかったため）。
  - **fontkit の不具合を見つけて回避**: `@pdf-lib/fontkit` のサブセットは、グリフの位置表（loca）を「短い形式」で書くとき 長さが奇数バイトのグリフを 1バイト切ってしまい、それ以降のグリフが すべてずれる（＝文字化け）。Noto Sans JP は 17808 グリフ中 13345 が奇数・4の倍数でない長さだったため、`scripts/prepare-report-font.ts` で **すべてのグリフを 4バイト単位にゼロで うめた** フォントを作って同梱（loca は長い形式・チェックサムも計算しなおし。見た目は変わらない）。埋め込んだサブセットのグリフが 元のフォントと同じバイトで、すべて読めることを確認し、テストにも入れた。
  - ワークブック（ワールドごとの 1か月分。どの家も同じ）は あらかじめ作って アップロード: `npm run worksheets:month -- --all` → **`npm run worksheets:upload`**（`scripts/upload-worksheets.ts`。1件ごとに進みぐあいを表示・アップロード後に大きさを確認・すでにあれば とばす（`--force` で上書き）・`--world`・`--dry-run`・`--dir`・`--timeout`（既定600秒、+30秒で強制終了））。サーバーは置き場所にあるものを使い、無ければ警告して レポートだけ送る（開発中は `worksheets/out/monthly/` にあれば 自動でアップロード）。
  - `PYTHON` 環境変数と `runGenerator`（Python を呼ぶ処理）を削除。Python + reportlab は ワークシートを作るコマンドだけに必要。
- **「ワールド1 のワークシートを作れませんでした」の原因と修正**: `generate_worksheets.py` が 作り終わったあと 出力先を `p.relative_to(ROOT)`（プロジェクトからの相対パス）で表示していて、出力先が プロジェクトの外（テストの一時フォルダ・`REPORT_STORAGE_DIR` を外に設定したとき）だと `ValueError` で 終了コード 1 になっていた（**PDF は できているのに 失敗あつかい**）。プロジェクトの外なら そのままのパスを表示するように直しました（実際に一時フォルダへ出力して 終了コード 0 を確認）。なお Phase 3 からは サーバーは そもそも Python を呼びません。
- **レート制限を DB へ**（`src/lib/auth/rateLimit.ts`）: 新しい表 `RateLimitBucket(key, count, resetAt)`（マイグレーション `20261201090000_rate_limit_bucket`。`prisma migrate diff` の出力と一字一句同じことを確認）。
  - `SharedRateLimiter`: 1つの SQL（`INSERT ... ON CONFLICT DO UPDATE ... RETURNING`）で数えるので、サーバーが何台あっても・同時に来ても 数えもれがない。キーは「制限の名前:SHA-256」で、メールアドレス・IP は そのまま保存しない。
  - DB が止まっている・SQL が失敗したときは そのサーバーのメモリで数える（ログイン自体は止めない。警告は1回だけ）。
  - ログイン（3種）・登録・暗証番号・パスワードの再入力・パスワードを忘れた（2種）・リンクの確認・メールアドレスの追加 の 10個すべてを置きかえ、15のルートで `await` するように変更。
  - 「今すぐ送る」: 回数（10分・1日3回）は これまでどおり DB（ReportDelivery）で数え、**同時に2回動かさないロック**も DB に（`acquireLock`。5分で自動に とける）。これまでの メモリの `inFlight` を置きかえ。
  - 期限が切れて1時間たった行は 毎日の cron で消す。
- **定期実行（`vercel.json` の crons）**:
  - `GET /api/cron/line-monthly`: 毎月 **1〜3日の 9:00（日本時間）**。1日に送り、2日・3日は 送れなかった分（時間切れ・LINE のエラー）だけ（送信ずみの子には二重に送らない）。1回 約4分で区切り（`maxDuration = 300`）、のこりは翌日。`?month=YYYY-MM` で月を指定可。LINE の送信が未設定なら 何もしない（サーバーレスで outbox を書こうとしない）。
  - `GET /api/cron/trial-cleanup`: 毎日 3:30（日本時間）。おためし学習者の そうじ（60日）＋ レート制限の行の そうじ。
  - どちらも `Authorization: Bearer <CRON_SECRET>` が必要（`src/lib/cron.ts`。ハッシュどうしを一定時間で比較）。`CRON_SECRET` が無い・16文字未満なら 503 で何もしない、ちがえば 401。POST でも呼べる（Vercel 以外のスケジューラ用）。進みぐあいを1人ごとにログに出す。
  - `npm run line:monthly` にも `--timeout`（既定1800秒・+60秒で強制終了）と 進みぐあいの表示を追加。
- **`GET /api/health`**: DB に つながるか・置き場所に つながるか（5秒で見切り）・置き場所が消えない場所か（Vercel で local なら `persistent: false`）・LINE（ログイン / 送信 / webhook）・メールの送り方・cron の合い言葉が 設定されているか。DB と置き場所の両方が OK なら 200、どちらかが だめなら 503。**秘密・バケット名・ホスト名・パスは出さない**（テストで確認）。
- **Prisma**: `directUrl = env("DIRECT_URL")`（`DATABASE_URL` = プール、`DIRECT_URL` = マイグレーション用の直接の接続）。`DIRECT_URL` が無くても アプリは動く（`src/lib/db.ts` で `DATABASE_URL` を使う）。
  - `npm run vercel-build`（`scripts/vercel-build.mjs`、`vercel.json` の buildCommand）: `prisma generate` → **本番デプロイのときだけ** `prisma migrate deploy` → `next build`。プレビューのビルドで 本番の DB を書きかえない（`MIGRATE_ON_BUILD=1/0` で切りかえ）。各手順に時間制限と30秒ごとの進みぐあい。
  - `npm run db:deploy`（= `prisma migrate deploy`）を追加。
- **ビルドの中身**: フォント（5.7MB）は 必要な2つの API（`/api/parent/line-monthly`・`/api/cron/line-monthly`）にだけ入るようにした（`outputFileTracingIncludes`。最初は 自動の依存追跡で 41 の API すべてに入っていたので、パスを組み立てる形にして止めた。`.next/**/*.nft.json` で確認）。`vercel.json` の `regions` は東京（`hnd1`）。
- **手順書 `docs/run5/DEPLOY.md`**（オーナー向け・日本語）: Neon / Supabase の接続文字列（プールと直接）・R2 / Supabase Storage / AWS S3・ワークブックのアップロード・Vercel の環境変数の表・メール（Resend）・seed・独自ドメイン・LINE の URL・Cron Jobs・`/api/health` の見かた・チェックリスト・こまったとき・費用の目安。LINE-SETUP.md と README も更新。
- `.env.example` と README に `DIRECT_URL`・`STORAGE_DRIVER`・`S3_BUCKET`・`S3_REGION`・`S3_ENDPOINT`・`S3_ACCESS_KEY_ID`・`S3_SECRET_ACCESS_KEY`・`S3_FORCE_PATH_STYLE`・`S3_PREFIX`・`CRON_SECRET`・`MIGRATE_ON_BUILD` を追加（値は空。`DIRECT_URL` だけ `"${DATABASE_URL}"`）。`PYTHON` を削除。
- 手元の `.env` に `DIRECT_URL="${DATABASE_URL}"` を1行追加しました（`prisma migrate dev` が `DIRECT_URL` を必要とするため。値は DATABASE_URL と同じ）。
- **テスト**（新しく 4ファイル 38件）:
  - `tests/storage.test.ts`（13件）: キーの形・ローカルの往復と外に出られないこと・S3 の往復（モックの S3 が 署名と本文のハッシュを確認）・AWS の公式の署名の例・URL の形（AWS / R2 / Supabase）・403 やネットワークエラー・時間切れ（秘密やキーが メッセージに入らない）・設定のえらび方・サーバーレスで local・ワークブック（あれば使う / 無ければ null）・サーバーのコードが child_process を使わないこと。
  - `tests/report-pdf.test.ts`（7件）: A4・1ページ・サブセット（40万バイト未満）・FontFile2・「学」「は」の ToUnicode・長い名前でも1ページ・フォントが無いときのフォールバック・**フォントのグリフが すべて4バイト単位**・**埋め込んだグリフが すべて読める**。
  - `tests/rate-limit-db.test.ts`（8件）: 2台のサーバーで同じ数・ウィンドウ・reset・キーに個人情報が入らない・そうじ・ロック（1つだけ / はずす / 期限）・DB 停止や SQL 失敗でメモリに切りかえ。
  - `tests/deploy-routes.test.ts`（10件）: cron の認証（503 / 401 / OK）・cron → LINE のリンク → S3 から PDF が流れてくる（レポート・ワークブック）・2回目は送らない・置き場所の故障は 503・未設定なら何もしない・POST・おためしの そうじ・health（200 / 503・秘密が出ない・Vercel で local）。
  - 既存: `line-monthly.test.ts` を新しい置き場所の形に合わせて更新（子どもの削除で PDF が消えるのは 応答のあと）。

### 決めたこと（理由）
- S3 は SDK（`@aws-sdk/client-s3`）を入れずに 自前の署名にした: 使う操作が5つだけで、依存が大きく（サーバーレスの起動も重くなる）、R2・Supabase・MinIO でも同じコードで動くため。署名は AWS の公式の例で検証。
- ダウンロードは「アプリを通して流す」（署名つき URL へのリダイレクトにしない）: 合い言葉つきの URL・期限・持ち主チェックを これまでどおりアプリだけで管理でき、バケットを完全に非公開にできるため。PDF は小さいので 転送の負担も小さい。
- フォントは Regular の1つだけ（太字なし）: リポジトリに 5.7MB 増えるだけで済ませるため。見出しは 大きさと色で区別。
- 「ワークブックが無ければ その場で作る」は やめた（サーバーで Python を動かさない指示）。かわりにアップロードのスクリプトと、無いときの警告（ログ）で知らせる。
- レート制限は DB が使えないときに「止める」ではなく「メモリで数える」: DB 停止中でも おためしモードを動かす方針と そろえるため（ログイン自体は DB が無いと できないので 実害はない）。
- DB で数えるときは 上限をこえた回も数える（メモリ版は数えない）: 1つの SQL で 原子的に数えるため。ウィンドウの終わりは 変わらないので 待つ時間は同じ。
- cron は 1日だけでなく 1〜3日の3回: サーバーレスの時間制限で とちゅうで切れても・LINE が一時的にエラーでも、のこりを自動で送るため（送信ずみの子は とばすので 二重にならない）。Vercel の Hobby プランでも 1日1回の cron は使える。
- cron の時刻: 月次は UTC 0:00（日本時間 9:00）、そうじは UTC 18:30（日本時間 3:30）。
- マイグレーションは 本番デプロイのビルドでだけ自動: プレビューのビルドが 本番の DB を書きかえる事故を防ぐ。
- お子さま・アカウントを消すときの PDF の削除は トランザクションの外（応答のあと）: S3 の通信を トランザクションの中で待つと 時間切れ（Prisma の既定 5秒）で 削除ぜんたいが失敗するおそれがあるため。万一 トランザクションが失敗すると PDF だけ先に消えることがあるが、その場合は リンクが「ファイルが見つかりません」になるだけ。
- `/api/health` は公開（ログイン不要）: 外部の死活監視から使えるように。出すのは true/false と 送り方の名前だけ。
- `vercel.json` の `regions: ["hnd1"]`（東京）: DB を東京に置き、利用者も日本のため。

### 確認
- `npx tsc --noEmit`（本体・scripts）OK、`npx vitest run` 40ファイル 990件 OK、`npx next build` OK（新しい API `/api/cron/line-monthly`・`/api/cron/trial-cleanup`・`/api/health` を含む）。
- `npm run smoke:offline`（DB 停止 + next start + Playwright）: ぜんぶ OK（ダウンロードは DB 停止中 503・no-store・noindex のまま）。
- `generate_worksheets.py --month --world 1 --out <プロジェクトの外>`: 修正前は ValueError で終了コード 1、修正後は 終了コード 0（86ページ）。
- 本物の PostgreSQL での確認（`RateLimitBucket` の SQL を本物で流す）は **できませんでした**（Docker Desktop が起動していないため。Phase 1・2 と同じ）。SQL は Prisma の `migrate diff` で表の形を確認し、数え方の SQL は メモリ内の まね で動きを確認しています。本物の S3 / R2 への接続も この環境では していません（AWS の公式の署名の例とモックで確認）。
