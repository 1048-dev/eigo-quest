# check:all レポート（さいごの 実行）

- 日時: 2026-11-27T20:49:25.813Z
- コミット: af36263 run10 さいごの check:all 通し: 11 ステップ ぜんぶ PASS（47 分 45 秒・lint error 0・tsc・vit（コミット前の 変更あり）
- コマンド: `npm run check:all`
- けっか: **PASS**（11 PASS / 0 FAIL / 0 SKIP）・ぜんぶで 48m10s

| # | name | result | count | time | note |
|---|---|---|---|---|---|
| 1 | english:lint（ぜんぶ） | ✅ PASS | 161841 strings / 1635 units・error 0 warn 464 info 274 | 10s |  |
| 2 | tsc | ✅ PASS | 0 errors | 11s |  |
| 3 | vitest | ✅ PASS | 2735 passed / 2735 tests（88 files） | 1m15s |  |
| 4 | next build | ✅ PASS | 81 routes | 1m30s |  |
| 5 | データの 確認（Phase 2） | ✅ PASS | レッスン 1,200・テスト 2,719・問題 455,781・おはなし 100・力だめし 5・問題の ある データ 0 | 1m26s |  |
| 6 | 画面の 描画（Phase 3） | ✅ PASS | レッスン 1,200・テスト 3,035・おはなし 100・力だめし 5・描画 333,549・問題 0 | 5m15s |  |
| 7 | DB 停止の スモーク | ✅ PASS | 125 OK / 0 NG | 6m59s |  |
| 8 | E2E（本物の DB・Phase 4） | ✅ PASS | worlds 40/40・checks 341 OK / 0 NG・1215s | 22m53s |  |
| 9 | アクセシビリティ（axe） | ✅ PASS | 26 pages・critical/serious 0・moderate/minor 0 | 1m59s |  |
| 10 | 内部リンク | ✅ PASS | 4122 URLs（画面 27）・broken 0・crawl errors 0 | 6m30s |  |
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
