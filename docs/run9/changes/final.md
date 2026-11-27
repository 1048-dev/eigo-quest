# run9 さいごの しあげ（2026-11-27）

`npm run english:lint`（ぜんぶ）の のこりの error を 1つずつ 見て 決めた。

## なおした もの

| L | 欄 | before | after | reviewers | reason |
|---:|---|---|---|---|---|
| 977 | `teacherScript` | Schools in Japan have a special word for these rules, osahashimo. | Schools in Japan have a special word for these rules, ohashimo. | objective | 「おはしも」の ローマ字の まちがい（o-ha-shi-mo）。goalJa・topic は もともと「おはしも」 |
| 26 | `teacher.segments[18].subtitleEn` | Lovely work! Make a card with Kiko next. See you! | Great work! Make a card with Kiko next. See you! | objective（ブロックの きめごと） | イギリスふうの ほめことば。W03 いこうの きまり（Lovely → アメリカの ほめことば）が W01-02 の レビューの あとに できたので、のこって いた |

ワールド9・10（L241〜300）は とちゅうで 止まって いたので、ここで しあげた（docs/run9/changes/W09-10.md）。

## わざと のこす もの（lint の [allow] に いれた）

`scripts/english-words.txt` の `[allow]`（ユニットごとに ゆるす もの）に たした。`_` で つないだ ものは 表現（`_` = スペース）として 文法の くせ・UK の ことばの ルールにも きく ように した（scripts/lib/englishLint.ts・tests/english-lint.test.ts）。

| L | ゆるした もの | りゆう |
|---:|---|---|
| 757 | `i'm_exciting` | excited / exciting を くらべる レッスン。ビリモの「I'm exciting, too!」を レッスンの なかで なおす |
| 1014 | colour centre theatre favourite | イギリスの つづりと アメリカの つづりを くらべる レッスン（「Theatre. In the US, theater.」）。フォニックスの 表と テストで きまって いる |
| 1015 | colour | 同じ（ふりかえり） |
| 1017 | theatre | 同じ |
| 1018 | favourite | 同じ |
| 977 | ohashimo | 日本の ひなんの あいことばの ローマ字 |

けっか: lint ぜんぶ **error 61 → 0**（warn 475 → 465・info 278 → 275。warn は ほぼ ぜんぶ わざと: ワールド26 で ならう「…」、犬の なまえ「Biscuit」、UK と US を くらべる レッスンの queue・timetable など）
