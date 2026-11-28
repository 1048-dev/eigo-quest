# Run 11 progress

## 決定 1: 作業フォルダの かたづけ（2026-11-28）

- git に 入って いた 一時作業フォルダは run9 の `.run9-w56`〜`.run9-w3940` の 18 こ（840 ファイル）だけ だった。`.run10-*` など ほかの 一時フォルダは git に 入って いなかった（`.tmp/`・`.tmp-run3/`・`tmp-teacher/` は もともと .gitignore 済み）
- 消す まえに 情報が docs に あるか たしかめた: 各フォルダの 変更表 `table.md` の 行数と `docs/run9/changes/WXX-YY.md` の 表の 行数が 18 ペア ぜんぶ 一致（例: W05-06 445 行 / W39-40 574 行）。W01-04 は もともと 作業フォルダが なく docs に だけ ある。のこりの パッチ JSON・スクリプト・メモは 作業用で、結果は すでに コンテンツと 変更表に 入って いる
- `git rm -r --cached` で git から はずした（ディスクの フォルダは のこして ある。docs は 1 つも 消して いない）
- .gitignore に `.run9-*/`・`.run10-*/`・`.run11-*/`・`.run[0-9]*-*/` を 追加（これからの 作業フォルダも 入らない）
- 注意: docs/run9/changes の 一部（W17-18〜W31-32）と docs/run9/lint に `.run9-wXXXX/...` への 言及が のこる。新しく clone した 場所には その ファイルは ないが、記録 として そのまま に した
- tsc OK・vitest 2,735 passed・next build OK
