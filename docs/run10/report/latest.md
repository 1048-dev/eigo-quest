# check:all レポート（さいごの 実行）

- 日時: 2026-11-27T12:02:37.229Z
- コミット: 68ec4da run9: zz-summary (auto-save)（コミット前の 変更あり）
- コマンド: `npm run check:all`
- けっか: **PASS**（8 PASS / 0 FAIL / 3 SKIP）・ぜんぶで 20m03s

| # | name | result | count | time | note |
|---|---|---|---|---|---|
| 1 | english:lint（ぜんぶ） | ✅ PASS | 154506 strings / 1344 units・error 0 warn 465 info 275 | 7s |  |
| 2 | tsc | ✅ PASS | 0 errors | 8s |  |
| 3 | vitest | ✅ PASS | 2656 passed / 2656 tests（84 files） | 53s |  |
| 4 | next build | ✅ PASS | 81 routes | 1m20s |  |
| 5 | データの 確認（Phase 2） | ⏭ SKIP | - | 0ms | npm run check:data が まだ ない（Phase 2 で つくる） |
| 6 | 画面の 描画（Phase 3） | ⏭ SKIP | - | 0ms | npm run check:render が まだ ない（Phase 3 で つくる） |
| 7 | DB 停止の スモーク | ✅ PASS | 125 OK / 0 NG | 6m57s |  |
| 8 | E2E（本物の DB・Phase 4） | ⏭ SKIP | - | 1ms | npm run check:e2e が まだ ない（Phase 4 で つくる） |
| 9 | アクセシビリティ（axe） | ✅ PASS | 26 pages・critical/serious 0・moderate/minor 0 | 4m14s |  |
| 10 | 内部リンク | ✅ PASS | 4123 URLs（画面 27）・broken 0・crawl errors 0 | 6m21s |  |
| 11 | JS の 大きさ（/map・/lesson ≤ 230 kB） | ✅ PASS | /map 193/230 kB・/lesson/[lessonNo] 197/230 kB | 1s |  |

## JS の 大きさ（First Load JS）

| ページ | First Load JS | 予算 |
|---|---|---|
| /map | 193 kB | 230 kB ✅ |
| /lesson/[lessonNo] | 197 kB | 230 kB ✅ |

## くわしい レポート

- 英語チェック: [english-lint.md](english-lint.md)
- アクセシビリティ: [a11y.md](a11y.md)
- 内部リンク: [links.md](links.md)

ログ（ステップごと）は `.data/check-all/<name>.log`（git には 入れない）。
