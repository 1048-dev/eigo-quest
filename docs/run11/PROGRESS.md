# Run 11 progress

## 決定 1: 作業フォルダの かたづけ（2026-11-28）

- git に 入って いた 一時作業フォルダは run9 の `.run9-w56`〜`.run9-w3940` の 18 こ（840 ファイル）だけ だった。`.run10-*` など ほかの 一時フォルダは git に 入って いなかった（`.tmp/`・`.tmp-run3/`・`tmp-teacher/` は もともと .gitignore 済み）
- 消す まえに 情報が docs に あるか たしかめた: 各フォルダの 変更表 `table.md` の 行数と `docs/run9/changes/WXX-YY.md` の 表の 行数が 18 ペア ぜんぶ 一致（例: W05-06 445 行 / W39-40 574 行）。W01-04 は もともと 作業フォルダが なく docs に だけ ある。のこりの パッチ JSON・スクリプト・メモは 作業用で、結果は すでに コンテンツと 変更表に 入って いる
- `git rm -r --cached` で git から はずした（ディスクの フォルダは のこして ある。docs は 1 つも 消して いない）
- .gitignore に `.run9-*/`・`.run10-*/`・`.run11-*/`・`.run[0-9]*-*/` を 追加（これからの 作業フォルダも 入らない）
- 注意: docs/run9/changes の 一部（W17-18〜W31-32）と docs/run9/lint に `.run9-wXXXX/...` への 言及が のこる。新しく clone した 場所には その ファイルは ないが、記録 として そのまま に した
- tsc OK・vitest 2,735 passed・next build OK

## 決定 2: TPR の バツ絵文字を わかりやすく（2026-11-28）

- しらべた: 教材（content/curriculum/worlds）の emoji 欄で ❌ は 16 ワールド・34 か所（TPR 7・単語 14・スライド 13）。✖ ✗ ✕ ❎ は 教材に なし
- 置きかえ（ルール）:
  - TPR「Make an X」「Cross your arms」など うでで バツを する もの → 🙅（うでを クロスする 人。もとから 🙅 の TPR と そろう）
  - 単語 mistake（8 こ）→ 🤦（「しまった」。W16 L22 の mistake は もとから 😅 で そのまま）
  - 単語 wrong・false・impossible → 🙅。ただし 同じ レッスンに 🙅 の TPR（Shake your head など）が あって 絵の 選択肢が かぶる 3 こは べつの 絵に した: W04 L12 wrong → 👎、W27 L26 false → 👎、W24 L23 impossible → 🤯
  - 先生スライドの 絵（Words・「まる？ バツ？」）は その レッスンの 単語と 同じ 絵に した
- そのまま に した もの:
  - アプリ画面の ❌（LessonSteps の「❌ ざんねん」「❌ 説明」、StoryQuiz、TestRunner）は まちがいの しるし なので のこした
  - scripts・prisma/seed の ✖ ✗ は チェックの ログ表示（失敗の しるし）なので のこした
  - 🚫（never・nobody・taken など「〜ない」）は バツ印 ではなく 禁止マーク なので のこした
  - docs の 過去の 記録は さわって いない
- これから もどらない ように tests/emoji-marks.test.ts を 追加: 教材の emoji 欄に ❌ ❎ ✖ ✗ ✘ ✕ ╳ が ない こと・「Make an X / Cross your arms」の TPR は 🙅・mistake は 🤦（または 😅）
- 気づいた こと（今回は 未対応）: W25 L22 の 単語 can't be と TPR Shake your head. No, no, no! が もとから どちらも 🙅（data-check は 問題 0）
- check:data 問題 0・tsc OK・vitest 2,739 passed（+4）・next build OK
