# 英語クエストを インターネットに公開する手順（オーナー向け）

LINE（ログイン・毎月の学習レポート）を使うには、アプリが **インターネットから見える HTTPS の URL** で動いている必要があります。
この手順書では、次の組み合わせで公開します。

| 役わり | 使うサービス（例） | 説明 |
|---|---|---|
| アプリを動かす | **Vercel** | Next.js をそのまま動かせます。毎月・毎日の定期実行（Cron Jobs）もここで |
| データベース | **Neon** か **Supabase**（どちらか1つ） | PostgreSQL。東京リージョンを選びます |
| PDF の置き場所 | **Cloudflare R2**（おすすめ）か **Supabase Storage** か **AWS S3** | 学習レポート・ワークブックの PDF。S3 互換なら どれでも動きます |
| メール | **Resend**（か ふつうの SMTP） | パスワードの再設定メールなど |
| LINE | LINE Developers | [docs/run4/LINE-SETUP.md](../run4/LINE-SETUP.md) の手順 |

> コードは特定の会社に しばられない作りです（DB は ふつうの PostgreSQL、PDF の置き場所は S3 互換、定期実行は「合い言葉つきの URL を呼ぶ」だけ）。
> あとから別のサービスに移ることもできます。
>
> 各サービスの画面の名前やボタンの位置は 変わることがあります。見つからないときは、各サービスの公式ドキュメントで
> 同じ名前の項目を さがしてください。料金は 2026年11月時点の目安で、変わることがあります。

---

## 0. 全体の流れ（約1〜2時間）

1. データベースを作る（Neon か Supabase）→ 接続文字列を2つ もらう
2. PDF の置き場所を作る（R2 など）→ バケットと 鍵を もらう
3. 手元のパソコンで ワークブック（12ワールド分の PDF）を作って アップロード
4. Vercel にプロジェクトを作り、環境変数を入れて デプロイ
5. データベースに カリキュラムを入れる（seed）
6. 独自ドメインをつける（任意）→ URL を確定
7. LINE Developers に URL を登録
8. 動作確認（`/api/health`・ログイン・LINE・定期実行）

最後に [チェックリスト](#チェックリスト) があります。

---

## 1. データベース（Neon または Supabase）

アプリは2つの接続文字列を使います。

| 変数 | 使いみち | Neon | Supabase |
|---|---|---|---|
| `DATABASE_URL` | アプリが ふだん使う（たくさん同時につながるので「プール」を通す） | 「Pooled connection」（ホスト名に `-pooler` が入る） | 「Transaction pooler」（ポート **6543**） |
| `DIRECT_URL` | マイグレーション（表を作る・変える）だけに使う | プールなしの接続（`-pooler` が無い） | 「Direct connection」か「Session pooler」（ポート **5432**） |

### A. Neon の場合
1. https://neon.tech でアカウントを作り、**New Project** を作ります。
   - リージョン: **AWS Asia Pacific (Tokyo)**（`ap-northeast-1`）
   - Postgres のバージョン: 既定のままでよい
2. ダッシュボードの **Connect**（Connection Details）で、
   - 「Connection pooling」を **オン** にした文字列 → `DATABASE_URL`
   - **オフ** にした文字列 → `DIRECT_URL`
3. どちらも最後に `?sslmode=require` が付いていることを確認します。`DATABASE_URL` には `&pgbouncer=true` を足します。

```
DATABASE_URL="postgresql://<ユーザー>:<パスワード>@ep-xxxx-pooler.ap-northeast-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://<ユーザー>:<パスワード>@ep-xxxx.ap-northeast-1.aws.neon.tech/neondb?sslmode=require"
```

> Neon には「ブランチ」（DB のコピー）があります。Vercel のプレビュー用に別のブランチを作っておくと、本番の DB を さわらずに試せます（下の「プレビューについて」）。

### B. Supabase の場合
1. https://supabase.com でアカウントを作り、**New project** を作ります。
   - リージョン: **Northeast Asia (Tokyo)**
   - データベースのパスワードを決めて、どこかに安全に保存します
2. プロジェクトの **Connect** ボタン（または Project Settings → Database）で、
   - 「Transaction pooler」（ポート 6543）の文字列 → `DATABASE_URL`（最後に `?pgbouncer=true` を足す）
   - 「Direct connection」（ポート 5432）の文字列 → `DIRECT_URL`
     （Direct が IPv6 だけで つながらないときは「Session pooler」（ポート 5432）の文字列を使います）

```
DATABASE_URL="postgresql://postgres.<ref>:<パスワード>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<パスワード>@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

---

## 2. PDF の置き場所（S3 互換）

Vercel のサーバーは ファイルを保存しても 消えてしまうため、PDF は 外の置き場所に入れます。
**バケットは必ず「非公開（private）」** にしてください（PDF は アプリの `/d/<合い言葉>` を通してだけ配ります）。

### A. Cloudflare R2（おすすめ。ダウンロードの転送料がかからない）
1. Cloudflare のダッシュボード → **R2** → **Create bucket**。名前の例: `eigo-quest-files`。場所は「Asia-Pacific」など。
2. **R2** → **Manage R2 API Tokens**（API トークン）→ **Create API token**
   - 権限: **Object Read & Write**
   - 対象: さっき作ったバケット**だけ**
3. 表示される値を控えます（**シークレットは この画面でしか見られません**）。

```
STORAGE_DRIVER="s3"
S3_BUCKET="eigo-quest-files"
S3_ENDPOINT="https://<アカウントID>.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_ACCESS_KEY_ID="<Access Key ID>"
S3_SECRET_ACCESS_KEY="<Secret Access Key>"
```

### B. Supabase Storage（DB を Supabase にした場合に まとめやすい）
1. Supabase → **Storage** → **New bucket**。名前の例: `eigo-quest-files`、**Public bucket はオフ**。
2. Project Settings → **Storage** → 「S3 Connection」で **S3 access keys** を作ります。エンドポイントとリージョンも ここに出ます。

```
STORAGE_DRIVER="s3"
S3_BUCKET="eigo-quest-files"
S3_ENDPOINT="https://<ref>.supabase.co/storage/v1/s3"
S3_REGION="ap-northeast-1"
S3_ACCESS_KEY_ID="<Access key ID>"
S3_SECRET_ACCESS_KEY="<Secret access key>"
```

### C. AWS S3
バケット（東京 `ap-northeast-1`・パブリックアクセスはすべてブロック）と、そのバケットだけに
`s3:GetObject`・`s3:PutObject`・`s3:DeleteObject`・`s3:ListBucket` を許す IAM ユーザーの アクセスキーを作ります。

```
STORAGE_DRIVER="s3"
S3_BUCKET="<バケット名>"
S3_REGION="ap-northeast-1"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
# S3_ENDPOINT は空のまま
```

---

## 3. ワークブック（12ワールド分）を作って アップロード（手元のパソコンで1回だけ）

ワークブック（1か月分のワークシート）は どの家も同じ内容なので、あらかじめ作って置き場所に入れておきます
（Vercel では Python が動かないため）。**学習レポート（1ページ）は サーバーが Node だけで毎回作る**ので、ここでは不要です。

1. Python 3 と reportlab を用意します。

```bash
pip install -r worksheets/requirements.txt
```

2. 12ワールド分を作ります（数分かかります。`worksheets/out/monthly/world-01.pdf` 〜 `world-12.pdf` ができます）。

```bash
npm run worksheets:month -- --all
```

3. 手元の `.env` に **手順2の `STORAGE_DRIVER`・`S3_*`** を入れて、アップロードします。

```bash
npm run worksheets:upload
```

`[1/12] world-01.pdf  ✔ worksheets/monthly/world-01.pdf（〇.〇 MB・〇.〇秒）` のような行が12行出れば完了です。
もう一度実行すると「すでにあります」で とばします（中身を作りなおしたときは `-- --force`）。

> アップロードが終わったら、手元の `.env` の `S3_*` は消しても かまいません（手元で開発するときは `STORAGE_DRIVER` を空に戻すと `.data/reports` を使います）。

---

## 4. Vercel にプロジェクトを作る

1. このリポジトリを GitHub などに置きます（**非公開リポジトリ**にしてください）。
2. https://vercel.com → **Add New… → Project** → リポジトリを選んで **Import**。
   - Framework Preset: **Next.js**（自動で選ばれます）
   - Build Command: 変えなくてよい（`vercel.json` の `npm run vercel-build` が使われます）
3. **Environment Variables** に、下の表の値を入れます（「Production」にチェック）。
4. **Deploy**。

### 環境変数

| 変数 | 必須 | 値 |
|---|---|---|
| `DATABASE_URL` | ✔ | 手順1（プール） |
| `DIRECT_URL` | ✔ | 手順1（直接） |
| `APP_BASE_URL` | ✔ | 公開 URL。最初は `https://<プロジェクト名>.vercel.app`、独自ドメインをつけたら `https://<ドメイン>`（最後の `/` なし） |
| `APP_TIMEZONE` | ✔ | `Asia/Tokyo` |
| `STORAGE_DRIVER` `S3_BUCKET` `S3_ENDPOINT` `S3_REGION` `S3_ACCESS_KEY_ID` `S3_SECRET_ACCESS_KEY` | ✔ | 手順2 |
| `CRON_SECRET` | ✔ | 定期実行の合い言葉（16文字以上のランダムな文字列。下のコマンドで作る） |
| `MAIL_PROVIDER` `MAIL_FROM` `RESEND_API_KEY`（または `SMTP_URL`） | ✔ | メール（下の「メール」） |
| `LINE_LOGIN_CHANNEL_ID` `LINE_LOGIN_CHANNEL_SECRET` `LINE_LOGIN_CALLBACK_URL` | LINE を使うなら | [LINE-SETUP.md](../run4/LINE-SETUP.md) の手順3 |
| `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` `LINE_MESSAGING_CHANNEL_SECRET` | LINE を使うなら | LINE-SETUP.md の手順2 |
| `ANTHROPIC_API_KEY` | 任意 | AI 採点・AI 会話（無ければ ルールベース・台本で動く） |
| `CONVERSATION_MODEL` | 任意 | 空なら `claude-haiku-5-5` |
| `MIGRATE_ON_BUILD` | 任意 | 空のままでよい（本番デプロイのときだけ マイグレーション） |
| `SEED_DEMO_PARENT` | **入れない** | 本番では空（既知のパスワードのデモ保護者を作らない） |

`CRON_SECRET` の作り方（手元のパソコンで）:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

> **秘密の値（パスワード・鍵・トークン）は Vercel の環境変数にだけ入れ、リポジトリには入れないでください。** `.env` は Git に入らない設定です。

### メール（Resend の例）
1. https://resend.com でアカウントを作り、**Domains** で送信に使うドメイン（例 `mail.<ドメイン>`）を追加し、表示される DNS レコードを登録して **Verified** にします。
2. **API Keys** で キーを作ります（権限は Sending access）。
3. `MAIL_PROVIDER="resend"`、`RESEND_API_KEY="..."`、`MAIL_FROM="英語クエスト <no-reply@mail.<ドメイン>>"`。

> メールの設定が無いと、パスワードの再設定メールが届きません（`/api/health` の `mail.deliverable` が `false` になります）。

### ビルドのとき 何が起きるか
`npm run vercel-build`（`scripts/vercel-build.mjs`）が、次の順に動きます（それぞれ時間を区切り、進みぐあいを表示します）。
1. `prisma generate`
2. `prisma migrate deploy`（**本番デプロイのときだけ**。`DIRECT_URL` を使って 表を作る・変える）
3. `next build`

マイグレーションを手で流したいときは、`MIGRATE_ON_BUILD=0` にして、手元から:

```bash
npx prisma migrate deploy
```

（手元の `.env` の `DATABASE_URL`・`DIRECT_URL` を本番の値にして実行。終わったら元に戻す）

### プレビューについて
Vercel は ブランチごとに「プレビュー」も作ります。プレビューの環境変数に **本番の DB を入れない** でください。
- いちばん簡単: プレビューには `DATABASE_URL` を入れない（アプリは「おためしモード」で動き、マイグレーションもしません）
- Neon のブランチなど 別の DB を入れるなら、プレビューの環境変数に `MIGRATE_ON_BUILD=1` も入れると その DB にマイグレーションします

---

## 5. データベースに カリキュラムを入れる（seed・最初の1回）

レッスン・テスト・モンスターなどの データを入れます（何度実行しても同じ結果になります）。
手元の `.env` の `DATABASE_URL` を **本番の `DIRECT_URL` の値** にして:

```bash
npm run db:seed
```

終わったら 手元の `.env` を元に戻します。カリキュラムを更新したときも 同じコマンドを実行します。

---

## 6. 独自ドメイン（任意）

1. Vercel → プロジェクト → **Settings → Domains** → ドメインを追加（例 `eigo-quest.example.jp`）。
2. Vercel が表示する DNS レコード（A レコード か CNAME）を、ドメインを買った会社の DNS 設定に登録します。数分〜数時間で **Valid Configuration** になり、HTTPS の証明書も自動で付きます。
3. 環境変数を新しい URL に変えて、**Redeploy** します。
   - `APP_BASE_URL="https://eigo-quest.example.jp"`
   - `LINE_LOGIN_CALLBACK_URL="https://eigo-quest.example.jp/api/auth/line/callback"`

> URL を変えると、それまでに LINE で送ったダウンロードのリンク（古い URL）は 開けなくなることがあります。できれば LINE を本番で使い始める前に ドメインを決めてください。

---

## 7. LINE Developers に URL を登録する

[docs/run4/LINE-SETUP.md](../run4/LINE-SETUP.md) の手順どおりに、公開 URL（`https://<ドメイン>`）で登録します。

| どこに | 登録する値 |
|---|---|
| Messaging API チャネル →「Webhook URL」 | `https://<ドメイン>/api/line/webhook`（「Webhookの利用」をオン →「検証」で成功） |
| LINE ログインチャネル →「コールバックURL」 | `https://<ドメイン>/api/auth/line/callback` |

LINE-SETUP.md の「6. 毎月の自動配信（cron）」の crontab は、Vercel では不要です（次の手順8の Cron Jobs が かわりに動きます）。

---

## 8. 定期実行（Vercel Cron Jobs）

`vercel.json` に書いてあるので、デプロイすると自動で登録されます（Vercel → プロジェクト → **Settings → Cron Jobs** で確認できます）。

| いつ（日本時間） | 呼ぶ URL | すること |
|---|---|---|
| 毎月 1日・2日・3日 の 9:00 | `/api/cron/line-monthly` | 先月の学習レポートを LINE で送る。2日・3日は「送れなかった分」（時間切れ・LINE のエラー）だけ送る（送信ずみの子には二重に送らない） |
| 毎日 3:30 | `/api/cron/trial-cleanup` | 60日 あそばれていない おためし学習者を消す・古いレート制限の行を消す |

- Vercel は `CRON_SECRET` を入れておくと、`Authorization: Bearer <CRON_SECRET>` を付けて呼んでくれます。**`CRON_SECRET` が無いと 何もしません**（503）。
- 時刻は UTC で書いてあります（`0 0 1-3 * *` = UTC 0:00 = 日本時間 9:00）。プランによっては 数十分ずれて実行されることがあります。
- 1回の実行は 約4分で区切ります（プランの上限がもっと短い場合は その上限まで）。時間切れになっても、翌日の実行（2日・3日）で のこりを送ります。
- LINE の送信が未設定（`LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` か `APP_BASE_URL` が空）のときは 何もしません。

手で動かして確かめるとき（手元のパソコンから）:

```bash
curl -H "Authorization: Bearer <CRON_SECRET>" https://<ドメイン>/api/cron/trial-cleanup
```

`{"ok":true,"trialCandidates":0,...}` のような答えが返れば OK です（`line-monthly` を手で呼ぶと 本当に LINE に送るので注意。月を指定するときは `?month=2026-11`）。
Vercel 以外で動かすときは、cron-job.org や GitHub Actions などから 同じヘッダーで GET（または POST）すれば同じように動きます。

---

## 9. 動作確認

### `/api/health`
ブラウザで `https://<ドメイン>/api/health` を開きます。

```json
{
  "ok": true,
  "db": { "configured": true, "reachable": true },
  "storage": { "driver": "s3", "configured": true, "reachable": true, "persistent": true },
  "line": { "login": true, "messaging": true, "webhook": true },
  "mail": { "provider": "resend", "deliverable": true },
  "cron": { "configured": true }
}
```

- `ok: false`（503）→ `db.reachable` か `storage.reachable` が `false`。接続文字列・鍵を見直します。
- `storage.persistent: false` → `STORAGE_DRIVER=s3` になっていません（PDF が消えてしまいます）。
- 秘密の値・バケット名・ホスト名は ここには出ません（設定されているか・つながるか だけ）。

### アプリ
1. `/register` で保護者を登録 → お子さまを追加 → レッスンを1つクリア。
2. `/login` → 「パスワードを忘れた方」→ メールが届く → 再設定できる。
3. LINE でログインできる（LINE-SETUP.md の「5. 動作の確認」）。
4. おうちの方ページ → 「LINE で学習レポート」→ **「今月のPDFを今すぐ送る」** → LINE に届く → 「PDFをひらく」で 学習レポート（日本語の1ページ）と ワークブックが開く。
5. Vercel → **Logs** に エラーが出ていないこと。

---

## チェックリスト

**準備**
- [ ] DB を東京リージョンに作った（Neon / Supabase）
- [ ] `DATABASE_URL`（プール）と `DIRECT_URL`（直接）を控えた
- [ ] PDF の置き場所のバケットを **非公開** で作り、そのバケットだけの鍵を作った
- [ ] `npm run worksheets:month -- --all` → `npm run worksheets:upload` で 12件 アップロードした
- [ ] Resend などで 送信ドメインを認証し、API キーを作った
- [ ] `CRON_SECRET` を作った（16文字以上・ランダム）

**Vercel**
- [ ] 非公開リポジトリから プロジェクトを作った
- [ ] Production の環境変数を すべて入れた（`SEED_DEMO_PARENT` は入れない）
- [ ] プレビューの環境変数に 本番の DB を入れていない
- [ ] デプロイが成功した（ビルドのログに `✔ prisma migrate deploy`）
- [ ] `npm run db:seed` を 本番の DB に1回 実行した

**URL・LINE**
- [ ] （任意）独自ドメインを追加し、`APP_BASE_URL`・`LINE_LOGIN_CALLBACK_URL` を変えて Redeploy した
- [ ] LINE の Webhook URL を登録し、「検証」が成功した
- [ ] LINE ログインのコールバック URL を登録した

**確認**
- [ ] `/api/health` が `ok: true`・`storage.persistent: true`・`mail.deliverable: true`
- [ ] Settings → Cron Jobs に 2つ出ている
- [ ] `curl -H "Authorization: Bearer <CRON_SECRET>" .../api/cron/trial-cleanup` が `ok: true`
- [ ] 登録・ログイン・パスワード再設定メール・LINE ログイン・「今すぐ送る」→ PDF が開く

---

## こまったとき

| ようす | 見るところ |
|---|---|
| ビルドで `prisma migrate deploy` が失敗 | `DIRECT_URL` がプールの URL になっていないか（Neon は `-pooler` なし、Supabase は 5432）。パスワードの記号は URL エンコード（`@` → `%40` など） |
| アプリが「おためしモード」になる・`db.reachable: false` | `DATABASE_URL` の値・`?sslmode=require`・DB が一時停止していないか（Neon の無料プランは しばらく使わないと止まり、最初の接続に数秒かかります） |
| `storage.reachable: false` / `storage.configured: false` | `S3_ENDPOINT`（**https:// だけ**。http は手元の localhost だけ。URL にキーを入れない）・`S3_REGION`・鍵の権限（Read & Write）・バケット名 |
| LINE で届いたレポートに ワークブックが無い | 手順3のアップロードが済んでいるか（Vercel の Logs に「ワークブックが置き場所にありません」） |
| Cron Jobs が 401 | `CRON_SECRET` を入れたあと Redeploy したか |
| Cron Jobs が 503 `CRON_NOT_CONFIGURED` | `CRON_SECRET` が空か 16文字未満 |
| パスワード再設定のメールが届かない | `MAIL_PROVIDER`・`MAIL_FROM`（認証したドメインのアドレス）・`RESEND_API_KEY`、`APP_BASE_URL` |

## 費用の目安（2026年11月時点・変わることがあります）
- Vercel: 個人の非商用なら Hobby（無料）で試せます。**商用で使う場合は Pro**（有料）が必要です。Cron Jobs・関数の実行時間の上限は プランで違います。
- Neon / Supabase: 小さな規模なら 無料プランから始められます（容量・停止の条件あり）。
- Cloudflare R2: 保存 10GB まで無料・ダウンロードの転送料なし（PDF はお子さま1人あたり 月に数十KB ＋ 共有のワークブック 12冊）。
- Resend: 1日 100通程度まで無料のプランがあります。
- LINE 公式アカウント: 無料メッセージの通数に上限があります（LINE-SETUP.md の「7. 料金について」）。
