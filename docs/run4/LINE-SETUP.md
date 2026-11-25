# LINE の設定手順（オーナー向け）

英語クエストの「LINEでログイン（保護者）」と「毎月の学習レポート（PDF）を LINE で届ける」を本番で使うための手順です。
アプリ側はもう出来ていて、**下の値を `.env` に入れてサーバーを起動しなおすだけで動きます**。値が入っていない間は、
LINE のボタンは出ず、レポートは LINE に送らずに `.data/line-outbox/` に書き出すだけ（dry-run）で、安全に動きます。

> 画面の名前・場所は LINE 側の変更で少し変わることがあります。見つからないときは、LINE Developers のドキュメント
> （https://developers.line.biz/ja/docs/ ）の「LINEログイン」「Messaging API」を確認してください。

---

## 0. はじめに用意するもの

| もの | 説明 |
|---|---|
| **公開された HTTPS の URL** | 例 `https://eigo-quest.example.jp`。**本番で使うには必須**です。LINE のサーバーが webhook を送ってくる・LINE のアプリからダウンロードページを開くので、インターネットから見える HTTPS（正式な証明書。自己署名は不可）が必要です。`localhost` では LINE からは届きません。 |
| LINE のアカウント | LINE Developers と LINE 公式アカウントの管理に使います（オーナー本人の LINE でかまいません）。 |
| ビジネス用のメールアドレス | LINE Developers の開発者登録・公式アカウントの作成で使います。 |

この手順では、公開 URL を `https://<ドメイン>` と書きます。自分のドメインに読みかえてください。

**大事なこと: 「LINE ログイン」と「公式アカウント（Messaging API）」の2つのチャネルは、かならず同じ「プロバイダー」の中に作ってください。**
プロバイダーがちがうと、同じ人でも LINE のユーザーID が別の値になり、ログインした保護者にレポートが届きません。

---

## 1. LINE Developers に登録して「プロバイダー」を作る

1. https://developers.line.biz/console/ に LINE アカウントでログインします（はじめてなら開発者として名前・メールアドレスを登録）。
2. 「プロバイダー」→「作成」で、プロバイダーを1つ作ります。名前はサービス名（例「英語クエスト」）にします。
   プロバイダー名は、LINE ログインの同意画面に「提供者」として表示されます。

---

## 2. LINE 公式アカウントを作り、Messaging API を有効にする（レポートの送信用）

いまは LINE Developers から直接 Messaging API のチャネルは作れず、**先に LINE 公式アカウントを作ってから Messaging API を有効にします**。

1. LINE 公式アカウントを作成します（「LINE公式アカウント 作成」で検索 → 作成フォーム、または LINE Official Account Manager https://manager.line.biz/ から）。
   - アカウント名: 保護者に表示される名前（例「英語クエスト」）。
   - 業種などを入力して作成します。
2. LINE Official Account Manager で、作ったアカウントを開き、**「設定」→「Messaging API」→「Messaging APIを利用する」** を押します。
   - プロバイダーを選ぶ画面で、**手順1で作ったプロバイダー**を選びます（あとから変更できないので注意）。
3. 同じく Official Account Manager の **「設定」→「応答設定」** で:
   - **Webhook: オン**
   - 応答メッセージ: オフ（おすすめ。オンだと保護者が何か送るたびに自動の返事が出ます）
   - あいさつメッセージ: お好みで（友だち追加されたときのあいさつ）
4. LINE Developers コンソールに戻ると、プロバイダーの中に **Messaging API のチャネル**ができています。開いて次の値を確認します。

| LINE Developers の場所 | 値 | `.env` に入れる変数 |
|---|---|---|
| 「チャネル基本設定」タブ →「チャネルシークレット」 | 32けたくらいの英数字 | `LINE_MESSAGING_CHANNEL_SECRET` |
| 「Messaging API設定」タブ →「チャネルアクセストークン（長期）」→「発行」 | 長い英数字 | `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` |

5. 「Messaging API設定」タブの **「Webhook設定」**:
   - **Webhook URL**: `https://<ドメイン>/api/line/webhook`
   - 「更新」→ **「検証」** を押して「成功」と出ることを確認（サーバーに `LINE_MESSAGING_CHANNEL_SECRET` を入れて起動しなおしてから押してください。入っていないと失敗します）。
   - **「Webhookの利用」をオン**にします。
   - 「Webhookの再送」もオンにしておくと、サーバーが一時的に止まっていたときの「友だち追加・ブロック」をあとで受け取れます。

> webhook は「保護者が公式アカウントを友だち追加した／ブロックした」をアプリに知らせるためのものです。ブロック中の保護者には送らないようにしています。

---

## 3. LINE ログインのチャネルを作る（保護者のログイン用）

1. LINE Developers コンソールで、**手順1と同じプロバイダー**を開き、「新規チャネル作成」→ **「LINEログイン」** を選びます。
   - チャネル名: 同意画面に出る名前（例「英語クエスト」）
   - チャネル説明・メールアドレスなどを入力
   - **アプリタイプ: 「ウェブアプリ」** にチェック
2. 作ったチャネルの値を確認します。

| LINE Developers の場所 | 値 | `.env` に入れる変数 |
|---|---|---|
| 「チャネル基本設定」タブ →「チャネルID」 | 10けたの数字 | `LINE_LOGIN_CHANNEL_ID` |
| 「チャネル基本設定」タブ →「チャネルシークレット」 | 英数字 | `LINE_LOGIN_CHANNEL_SECRET` |
| （自分で決める）コールバック URL | `https://<ドメイン>/api/auth/line/callback` | `LINE_LOGIN_CALLBACK_URL` |

3. **「LINEログイン設定」タブ →「コールバックURL」** に、`https://<ドメイン>/api/auth/line/callback` を登録します。
   **`.env` の `LINE_LOGIN_CALLBACK_URL` と1文字もちがわない同じ値**にしてください（ちがうと LINE がエラーを出します）。
   - 開発中に手元で試すときは `http://localhost:3000/api/auth/line/callback` も追加で登録できます（その場合は `.env` もその値に）。
4. **「チャネル基本設定」タブ →「リンクされたLINE公式アカウント」** で、手順2で作った公式アカウントを選びます。
   これで、LINE でログインするときに「公式アカウントを友だち追加する」画面が出ます（アプリは `bot_prompt=aggressive` を指定しています）。
   友だちになっていないとレポートは届かないので、必ず設定してください。
5. メールアドレスの取得（email）の申請は**不要**です（アプリは名前とユーザーIDだけを使います）。
6. 作ったばかりのチャネルは **「開発中」** で、チャネルの管理者・テスターしかログインできません。
   動作を確かめたら、チャネルの上のほうの **「開発中」を「公開」** に切りかえてください（公開しないと一般の保護者はログインできません）。

---

## 4. `.env` に入れる

サーバーの `.env`（Git には入れないファイル）に次を入れます。`.env.example` に同じ名前の空の行があります。

```dotenv
# LINE ログイン（手順3）
LINE_LOGIN_CHANNEL_ID="1234567890"
LINE_LOGIN_CHANNEL_SECRET="（LINE ログインのチャネルシークレット）"
LINE_LOGIN_CALLBACK_URL="https://<ドメイン>/api/auth/line/callback"

# 公式アカウント / Messaging API（手順2）
LINE_MESSAGING_CHANNEL_ACCESS_TOKEN="（チャネルアクセストークン（長期））"
LINE_MESSAGING_CHANNEL_SECRET="（Messaging API のチャネルシークレット）"

# メッセージに入れるリンクのもと（公開 URL。最後の / はなし）
APP_BASE_URL="https://<ドメイン>"

# （任意）PDF の置き場所。空なら <プロジェクト>/.data/reports
REPORT_STORAGE_DIR=""
```

- **LINE ログインと Messaging API のチャネルシークレットは別の値**です。入れまちがえに注意してください。
- `LINE_LOGIN_CALLBACK_URL` と `APP_BASE_URL` は同じドメインにします。
- 入れたら **サーバーを起動しなおします**（環境変数は起動時に読みます）。
- レポートの PDF を日本語フォントつきで作るには、サーバーに Python 3 と reportlab、日本語フォント（IPAexゴシックなど）が必要です（README の「ワークシート」）。

> キー（シークレット・アクセストークン）は人に見せない・Git に入れない・チャットに貼らないでください。
> 漏れたかもしれないときは、LINE Developers でシークレットの再発行／アクセストークンの取り消し→再発行をして、`.env` を入れかえてください。

---

## 5. 動作の確認

1. `https://<ドメイン>/login` に **「LINEでログイン」** のボタンが出ることを確認します（出ないときは LINE ログインの3つの値のどれかが空か、URL の形がまちがっています）。
2. 自分の LINE でログイン → 公式アカウントの友だち追加の画面 → 「暗証番号を決めてください」→ お子さまを追加、まで進むことを確認します。
   - すでにメールで登録しているアカウントに LINE をつなぐときは、メールでログイン →「おうちの方」→「LINE の連携」→「LINE と連携する」。
3. 「おうちの方」ページの **「LINE で学習レポート」→「今月のPDFを今すぐ送る」** を押すと、LINE にレポートが届きます。「PDFをひらく」で PDF が開けることを確認します。
4. サーバーで1人だけに試すこともできます:
   ```bash
   npm run line:monthly -- --dry-run --parent <保護者ID>   # 送らずに中身だけ確認（.data/line-outbox/ に書く）
   npm run line:monthly -- --parent <保護者ID>             # 本当に送る（今月分は --month 2026-11 のように指定）
   ```

---

## 6. 毎月の自動配信（cron）

毎月1日の朝に、先月の分を送るように設定します（サーバーの cron やスケジューラーで）。

```cron
# 毎月1日 9:00（日本時間のサーバーの場合）
0 9 1 * * cd /path/to/eigo-quest && npm run line:monthly >> /var/log/eigo-quest-line.log 2>&1
```

- 同じ月を2回実行しても、送信ずみのお子さまには送りません（`--force` を付けたときを除く）。失敗した分は次の実行で送りなおします。
- 期限切れ（30日）のダウンロードリンクと PDF も、このときに掃除します。

---

## 7. 料金について（目安）

- LINE 公式アカウントは無料プランから始められますが、**送れるメッセージ数に月ごとの上限**があります（無料プランは月200通程度。最新の内容は LINE の料金ページで確認してください）。
- このアプリは **保護者1人につき毎月1通**（きょうだいがいても1通のカルーセル）を送ります。「今すぐ送る」を押した分も1通に数えられます。
- 保護者の数が増えてきたら、有料プランへの切りかえを検討してください。

---

## 8. まとめ（登録する URL と変数の一覧）

| どこに | 何を |
|---|---|
| Messaging API チャネル →「Webhook URL」 | `https://<ドメイン>/api/line/webhook`（「Webhookの利用」オン） |
| LINE ログインチャネル →「コールバックURL」 | `https://<ドメイン>/api/auth/line/callback` |
| LINE ログインチャネル →「リンクされたLINE公式アカウント」 | 手順2の公式アカウント |
| LINE ログインチャネルの状態 | 「公開」 |
| `.env` | `LINE_LOGIN_CHANNEL_ID`・`LINE_LOGIN_CHANNEL_SECRET`・`LINE_LOGIN_CALLBACK_URL`・`LINE_MESSAGING_CHANNEL_ACCESS_TOKEN`・`LINE_MESSAGING_CHANNEL_SECRET`・`APP_BASE_URL` |

困ったとき:
- 「LINEでログイン」を押すと LINE が「redirect_uri が不正」と出す → LINE Developers のコールバック URL と `LINE_LOGIN_CALLBACK_URL` が完全に同じか確認。
- ログインはできるがレポートが届かない → 2つのチャネルが同じプロバイダーか／公式アカウントを友だち追加しているか（ブロックしていないか）／`LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` と `APP_BASE_URL` が入っているか を確認。サーバーのログと `npm run line:monthly -- --dry-run --parent <ID>` の表示も手がかりになります。
- webhook の「検証」が失敗する → URL が HTTPS で外から見えるか／`LINE_MESSAGING_CHANNEL_SECRET` が Messaging API 側のシークレットか／サーバーを起動しなおしたか を確認。
