# run9 英語レビュー: ワールド21・22（レッスン 601〜660）

- 日付: 2026-11-27
- やりかた: docs/run9/BRIEF.md の「Review method」。lint → 3人の レビュアー（A=アメリカの 小学校の 先生 / B=こどもの ESL・言語習得の 専門家 / C=台本を 読む 声優）を べつべつに 書いて から 決める。2人 いじょうが 指摘 or 客観的な まちがい（objective）だけ なおす。10 レッスンずつ 6 グループで レビュー
- lint（`npm run english:lint -- --from 601 --to 660`）: **まえ error 0 / warn 56 / info 9 → あと error 0 / warn 8 / info 7**（まえの warn: Okay・okay 46・L612 タイトルと スライドの「…」2・L623 てがみの むすび 2・L644「that's all for today」6。あとの warn 8: L623 の「See you soon. Best wishes, Riko」「Love, Kiko」〈てがみの むすびで 記号を つけないのが ただしい。テストも ある〉と L644 の おはなしの とちゅうで おわる「But that's all for today!」と クイズの まちがいの えらびかた〈どちらも わざと〉）
- なおした 欄: **385**（パッチ 397 件。機械的な なおし 4・ブロックの きめごと 104〈103 欄〉・レビュアー 260・あとの そろえ 29）。なおした レッスン: **59 / 60**（L646 は なおす ところ なし）
- 60 レッスン ぜんぶに `"reviewed": "run9"` を つけた
- パッチは ぜんぶ「before が いまの 値と おなじ ときだけ あてる」で あてた（はずれ 0）。60 レッスン ぜんぶで スライドの 検証（unknownSlideItems）・台本の 長さ（180〜240 秒）・英語の わりあいを たしかめた（ALL OK）。かいわ あいての チェック（.run9-w2122/partner.ts）も ALL OK

## 共通の きめごと（ブロック全体）
1. 日本語の なかの 英語の あとの 2重の 記号 → 英語がわの 記号だけ のこす（W01-20 と おなじ。この ブロックは 0 か所）
2. 話しことばの「A. Or, B.」→「A. Or B.」（L617・L651。ひとつづきの 例なので 英語字幕も say と おなじ。L639 の「answer, Me too! or Really?」は 1つの 文の なかで 2つの こたえを いって いるので そのまま）
3. 「Okay / okay」→「OK」（55 か所。会話・台本・まとめ・L604 の targetExpressions「That's OK.」・L654 フォニックスの「Are you OK」も。src/lib/curriculum/w22Phonics.ts の 表の キーと tests/phonics-w22.test.ts も なおした）
4. 文の なかの「Now, Write ～」など TPR の 指示 → 小文字（say・英語字幕・teacherScript。L614「Then, Pass it on!」も）。「Then, Sure. I'll tell her.」の ような 引用の こたえ、「First, Then, and Also」の ような ことばの ならびは 大文字の まま
5. イギリスふうの ほめことば: 「Lovely manners!」→「Great manners!」（L634）、「Lovely!」→「Great!」（L621・L628・L654）、「Brilliant ～!」→「Great / Fantastic ～!」（L614・L620・L635・L644・L647）
6. L612 タイトル「Could You Tell Her…?」→「Could You Tell Her...?」（W01-02 の きまり。titles.json も）
7. L652「where is the toilet?」→「where is the bathroom?」（アメリカ英語）
8. 日本語の 過去形の よびかた「むかしの かたち」→「すぎた かたち」（L633・L638。グループが L608 の「かこの かたち」も）
9. あとの そろえ（グループの 報告から。20-after.json）:
   - **AI かいわの さいしょの ひとことで なのる なまえ**: グループが L605・L606・L611・L612 で「This is X / It's X」（X = さいごの「Next, talk with X!」の あいて）に したが、アプリ（pickConversationPartner）は「I'm X」いがいで なまえが 出た キャラを あいてから はずすので、べつの キャラが えらばれて しまった。なまえを いわない 文に した（L605「Hello? Oh, hi! What's up?」、L606「Hi! I'm calling from the tower. Can you hear me?」、L611「Hello! May I speak to Ms. Emma, please?」、L612「Hello, this is the Message Center. ...」）。partner.ts で 60 レッスン ALL OK
   - 「Ding, dong」→「Ding-dong」（L629・L648。W13-20 と おなじ。L612 の「Ding, dong, ding!」は 木琴の 3つの 音なので そのまま）
   - L647 TPR「Run away on the spot.」→「Pretend to run away.」（on the spot は イギリスふう、「その ばで にげる」は いみが ぶつかる。日本語「にげる ふりを して」）
   - L603 TPR「Hold up one finger and say, wait.」→「… say, Wait.」（引用の ことばは 大文字。この アプリの きまり）
   - L643「PROB-lem. CHIL-dren. CIR-cus. HAP-pen.」→「Problem. Children. Circus. Happen.」（大文字の 音節を TTS が 文字や べつの ことばで よむ かも。L642・L644 と おなじ かたち。スライドは はくの かたちの まま）
   - L624 の 台本の「home address / where I live / おうちの ばしょ」を「address / じゅうしょ」に する グループの なおし（6 パッチ）は **とりけした**。tests/teacher.test.ts が 台本に「your address」「じゅうしょ」を 入れない ように して いて（じゅうしょを きく 文に きこえない ため）、もとの いいかたは わざと

## 学習項目 ID が かわった もの（記録が あたらしく なる）
- L603 TPR「Hold up one finger and say, wait.」→「Hold up one finger and say, Wait.」
- L647 TPR「Run away on the spot.」→「Pretend to run away.」
- L654 フォニックス「Are you okay」→「Are you OK」（w22Phonics.ts の 表・テストも なおした）
- （L612 タイトルの「…」→「...」は ID に かんけい ない。titles.json を なおした）

## のこした こと（1人だけの 指摘・ほかの ワールドにも ある・あとで 決める）
- lint warn 8（L623 てがみの むすび・L644 の おはなしの きまり文句と クイズ）
- 「bird post」（world 21 で 14 か所。ことば・L628 の タイトルにも ある）: post は イギリスふうだが、この せかいの なまえ（ファンタジーの ゆうびん）なので のこした。かえる なら「bird mail」で ことば・タイトル・テストを まとめて かえる
- L624 の「home address」（上の 9 を 見て）
- 「Wipe your tears.」（L646 学習項目）の tears を TTS が「tɪrz」と よむか（heteronym）。学習項目なので のこした
- 「Tur-non! / Tur-noff!」（L624 の つなげて いう 音）、L633「Ist!」: TTS で いちど きいて みる と よい
- L622・L619 の「this week」は おはなしの なかの ことばなので のこした（エマ先生の 語りの「this week」「Yesterday」「See you on the weekend」は グループが なおした）
- 「Well done!」、「Very, very」（lint info）、「Thumbs up!」

## レビュアーの メモ（グループごと・英語）
