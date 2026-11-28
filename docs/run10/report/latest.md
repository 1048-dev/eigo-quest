# check:all レポート（さいごの 実行）

- 日時: 2026-11-28T02:34:29.131Z
- コミット: 45dcf96 run11 決定 3・4: のこりの つづりの ゆれを アメリカで ふつうの 形に そろえた（seatbelt → seat belt・tug （コミット前の 変更あり）
- コマンド: `npm run check:all`
- けっか: **PASS**（11 PASS / 0 FAIL / 0 SKIP）・ぜんぶで 49m28s

| # | name | result | count | time | note |
|---|---|---|---|---|---|
| 1 | english:lint（ぜんぶ） | ✅ PASS | 161841 strings / 1635 units・error 0 warn 462 info 274 | 8s |  |
| 2 | tsc | ✅ PASS | 0 errors | 8s |  |
| 3 | vitest | ✅ PASS | 2745 passed / 2745 tests（90 files） | 1m13s |  |
| 4 | next build | ✅ PASS | 81 routes | 1m24s |  |
| 5 | データの 確認（Phase 2） | ✅ PASS | レッスン 1,200・テスト 2,719・問題 455,781・おはなし 100・力だめし 5・問題の ある データ 0 | 1m21s |  |
| 6 | 画面の 描画（Phase 3） | ✅ PASS | レッスン 1,200・テスト 3,035・おはなし 100・力だめし 5・描画 333,549・問題 0 | 5m43s |  |
| 7 | DB 停止の スモーク | ✅ PASS | 125 OK / 0 NG | 7m20s |  |
| 8 | E2E（本物の DB・Phase 4） | ✅ PASS | worlds 40/40・checks 341 OK / 0 NG・1167s | 21m57s |  |
| 9 | アクセシビリティ（axe） | ✅ PASS | 26 pages・critical/serious 0・moderate/minor 0 | 1m52s |  |
| 10 | 内部リンク | ✅ PASS | 4125 URLs（画面 27）・broken 0・crawl errors 0 | 8m19s |  |
| 11 | JS の 大きさ（/map・/lesson ≤ 230 kB） | ✅ PASS | /map 195/230 kB・/lesson/[lessonNo] 200/230 kB | 2s |  |

## JS の 大きさ（First Load JS）

| ページ | First Load JS | 予算 |
|---|---|---|
| /map | 195 kB | 230 kB ✅ |
| /lesson/[lessonNo] | 200 kB | 230 kB ✅ |

## くわしい レポート

- 英語チェック: [english-lint.md](english-lint.md)
- アクセシビリティ: [a11y.md](a11y.md)
- 内部リンク: [links.md](links.md)

ログ（ステップごと）は `.data/check-all/<name>.log`（git には 入れない）。
