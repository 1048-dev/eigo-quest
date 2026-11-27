# フレーズブックで そろえた 英語（run10 Phase 5）

`npm run phrasebook:fix` が なおした 文字列の 一覧（ルールは docs/phrasebook.md・scripts/lib/phrasebook.ts）。

- ぜんぶで **639 文字列**（258 ユニット）
- agree: 58
- goodbye: 507
- handing: 12
- how-are-you: 27
- manual: 29
- repeat-teacher: 4
- thanks: 2

| unit | path | rule | before | after |
|---|---|---|---|---|
| L0062 | `lessons[1].conversation.lines[1].en` | handing | Here you go! What's your name? | Here you are! What's your name? |
| L0062 | `lessons[1].teacher.segments[5].say` | handing | …say your name. ハルくんが ボールを なげたよ。Here you go! What's your name? I'm Kiko. How about … | …say your name. ハルくんが ボールを なげたよ。Here you are! What's your name? I'm Kiko. How about … |
| L0062 | `lessons[1].teacher.segments[5].subtitleEn` | handing | … the ball and say your name. / Here you go! What's your name? / I'm Kiko. How abou… | … the ball and say your name. / Here you are! What's your name? / I'm Kiko. How abou… |
| L0062 | `lessons[1].teacher.segments[5].slide.items[1]` | handing | Here you go! What's your name? | Here you are! What's your name? |
| L0066 | `lessons[5].school.grammar` | how-are-you | …are you? ― I'm great. / I'm good. / I'm so-so. | …are you? ― I'm great. / I'm good. / I'm OK. |
| L0066 | `lessons[5].school.expressions[2].en` | how-are-you | I'm so-so. | I'm OK. |
| L0066 | `lessons[5].conversation.lines[3].en` | how-are-you | Hmm... I'm so-so. | Hmm... I'm OK. |
| L0066 | `lessons[5].conversation.lines[4].en` | how-are-you | So-so? Let's have a fun day! | Just OK? Let's have a fun day! |
| L0066 | `lessons[5].conversation.aiTask.goalJa` | how-are-you | …u? と きかれたら I'm great. / I'm good. / I'm so-so. で こたえて、あいてにも How are you? と ききかえそう | …u? と きかれたら I'm great. / I'm good. / I'm OK. で こたえて、あいてにも How are you? と ききかえそう |
| L0066 | `lessons[5].recap.highlightsJa[1]` | how-are-you | I'm great. / I'm so-so. で こたえられたよ | I'm great. / I'm OK. で こたえられたよ |
| L0066 | `lessons[5].teacher.segments[1].say` | how-are-you | …u? And answer, I'm great. I'm good. I'm so-so. きょうの ちょうしを きいて、こたえられるように なろうね。 | …u? And answer, I'm great. I'm good. I'm OK. きょうの ちょうしを きいて、こたえられるように なろうね。 |
| L0066 | `lessons[5].teacher.segments[1].subtitleJa` | how-are-you | …で ちょうしを きく。I'm great. / I'm good. / I'm so-so. で こたえる。 | …で ちょうしを きく。I'm great. / I'm good. / I'm OK. で こたえる。 |
| L0066 | `lessons[5].teacher.segments[1].subtitleEn` | how-are-you | …u? And answer, I'm great. I'm good. I'm so-so. | …u? And answer, I'm great. I'm good. I'm OK. |
| L0066 | `lessons[5].teacher.segments[1].slide.items[0]` | how-are-you | …are you? ― I'm great. / I'm good. / I'm so-so. | …are you? ― I'm great. / I'm good. / I'm OK. |
| L0066 | `lessons[5].teacher.segments[7].say` | how-are-you | … morning, Haru. How are you? Hmm... I'm so-so. So-so? Let's have a fun day! | … morning, Haru. How are you? Hmm... I'm OK. Just OK? Let's have a fun day! |
| L0066 | `lessons[5].teacher.segments[7].subtitleEn` | how-are-you | …orning, Haru. How are you? / Hmm... I'm so-so. / So-so? Let's have a fun day! | …orning, Haru. How are you? / Hmm... I'm OK. / Just OK? Let's have a fun day! |
| L0066 | `lessons[5].teacher.segments[7].slide.items[1]` | how-are-you | Hmm... I'm so-so. | Hmm... I'm OK. |
| L0066 | `lessons[5].teacher.segments[7].slide.items[2]` | how-are-you | So-so? Let's have a fun day! | Just OK? Let's have a fun day! |
| L0066 | `lessons[5].teacher.segments[8].subtitleJa` | how-are-you | …ちょうしは どう？」。I'm great. / I'm good. / I'm so-so. で こたえる。しょうじきで だいじょうぶ。 | …ちょうしは どう？」。I'm great. / I'm good. / I'm OK. で こたえる。しょうじきで だいじょうぶ。 |
| L0066 | `lessons[5].teacher.segments[16].say` | how-are-you | I'm so-so. | I'm OK. |
| L0066 | `lessons[5].teacher.segments[16].subtitleEn` | how-are-you | I'm so-so. | I'm OK. |
| L0066 | `lessons[5].teacher.segments[16].slide.items[0]` | how-are-you | I'm so-so. | I'm OK. |
| L0066 | `lessons[5].teacher.segments[17].say` | how-are-you | …たの ちょうしで こたえてね。I'm great? I'm good? I'm so-so? どれ かな？ | …たの ちょうしで こたえてね。I'm great? I'm good? I'm OK? どれ かな？ |
| L0066 | `lessons[5].teacher.segments[17].subtitleJa` | how-are-you | … ちょうしは どう？ I'm great. / I'm good. / I'm so-so. の どれかで こたえてね。 | … ちょうしは どう？ I'm great. / I'm good. / I'm OK. の どれかで こたえてね。 |
| L0066 | `lessons[5].teacher.segments[17].subtitleEn` | how-are-you | …are you today? I'm great? I'm good? I'm so-so? | …are you today? I'm great? I'm good? I'm OK? |
| L0066 | `lessons[5].teacher.segments[18].say` | how-are-you | Quiz! Haru says, I'm so-so. ハルくんの ちょうしは どっち？ すごく げんき？ それとも まあまあ？ | Quiz! Haru says, I'm OK. ハルくんの ちょうしは どっち？ すごく げんき？ それとも まあまあ？ |
| L0066 | `lessons[5].teacher.segments[18].subtitleJa` | how-are-you | クイズ！ ハルが I'm so-so. と いったよ。ハルの ちょうしは「すごく げんき」と「まあまあ」の どっち？ | クイズ！ ハルが I'm OK. と いったよ。ハルの ちょうしは「すごく げんき」と「まあまあ」の どっち？ |
| L0066 | `lessons[5].teacher.segments[18].subtitleEn` | how-are-you | Quiz! Haru says, I'm so-so. | Quiz! Haru says, I'm OK. |
| L0066 | `lessons[5].teacher.segments[18].slide.items[1]` | how-are-you | I'm so-so. | I'm OK. |
| L0066 | `lessons[5].teacher.segments[19].slide.items[0]` | how-are-you | I'm so-so. | I'm OK. |
| L0066 | `lessons[5].teacher.segments[20].say` | how-are-you | …w are you? で ちょうしを きいて、I'm great. や I'm so-so. で こたえられたね。あたらしい ch の おとも でたよ。このあと キコちゃ… | …w are you? で ちょうしを きいて、I'm great. や I'm OK. で こたえられたね。あたらしい ch の おとも でたよ。このあと キコちゃ… |
| L0183 | `lessons[2].school.expressions[2].en` | agree | Me, too! | Me too! |
| L0183 | `lessons[2].teacherScript` | agree | …cer.」 にがてな ものは「I don't like ～.」 おなじなら「Me, too!」 | …cer.」 にがてな ものは「I don't like ～.」 おなじなら「Me too!」 |
| L0183 | `lessons[2].conversation.lines[1].en` | agree | Me, too! I like soccer. | Me too! I like soccer. |
| L0183 | `lessons[2].recap.highlightsJa[1]` | agree | おなじ ときは Me, too! | おなじ ときは Me too! |
| L0183 | `lessons[2].teacher.segments[6].say` | agree | …cer. I play every day. Kiko jumps in. Me, too! I like soccer. おなじ ときは Me, too! だよ。 | …cer. I play every day. Kiko jumps in. Me too! I like soccer. おなじ ときは Me too! だよ。 |
| L0183 | `lessons[2].teacher.segments[6].subtitleJa` | agree | …」 キコちゃんが とびこむ。「わたしも！サッカー すき。」 おなじ ときは Me, too! だよ。 | …」 キコちゃんが とびこむ。「わたしも！サッカー すき。」 おなじ ときは Me too! だよ。 |
| L0183 | `lessons[2].teacher.segments[6].subtitleEn` | agree | …cer. I play every day. Kiko jumps in. Me, too! I like soccer. | …cer. I play every day. Kiko jumps in. Me too! I like soccer. |
| L0183 | `lessons[2].teacher.segments[6].slide.items[1]` | agree | Me, too! I like soccer. | Me too! I like soccer. |
| L0183 | `lessons[2].teacher.segments[8].say` | agree | …じゃない に なるよ。 Same as your friend? Say, Me, too! | …じゃない に なるよ。 Same as your friend? Say, Me too! |
| L0183 | `lessons[2].teacher.segments[8].subtitleJa` | agree | …。don't を いれると「すきじゃない」に なるよ。ともだちと おなじ？ Me, too! と いおう！ | …。don't を いれると「すきじゃない」に なるよ。ともだちと おなじ？ Me too! と いおう！ |
| L0183 | `lessons[2].teacher.segments[8].subtitleEn` | agree | …humbs down. Same as your friend? Say, Me, too! | …humbs down. Same as your friend? Say, Me too! |
| L0183 | `lessons[2].teacher.segments[8].slide.items[2]` | agree | Me, too! | Me too! |
| L0183 | `lessons[2].teacher.segments[16].say` | agree | Me, too! | Me too! |
| L0183 | `lessons[2].teacher.segments[16].subtitleEn` | agree | Me, too! | Me too! |
| L0183 | `lessons[2].teacher.segments[16].slide.items[0]` | agree | Me, too! | Me too! |
| L0183 | `lessons[2].teacher.segments[18].say` | agree | …likes soccer, too. What does she say? Me, too? Or I don't like soccer? どっちかな？ | …likes soccer, too. What does she say? Me too? Or I don't like soccer? どっちかな？ |
| L0183 | `lessons[2].teacher.segments[18].subtitleJa` | agree | …くんが「サッカーが すき」。キコちゃんも サッカーが すき。なんて いう？ Me, too! それとも I don't like soccer. どっちかな？ | …くんが「サッカーが すき」。キコちゃんも サッカーが すき。なんて いう？ Me too! それとも I don't like soccer. どっちかな？ |
| L0183 | `lessons[2].teacher.segments[18].subtitleEn` | agree | …likes soccer, too. What does she say? Me, too? Or I don't like soccer? | …likes soccer, too. What does she say? Me too? Or I don't like soccer? |
| L0183 | `lessons[2].teacher.segments[18].slide.items[0]` | agree | Me, too! | Me too! |
| L0183 | `lessons[2].teacher.segments[19].say` | agree | Me, too! せいかい！ Goal! You scored a point! | Me too! せいかい！ Goal! You scored a point! |
| L0183 | `lessons[2].teacher.segments[19].subtitleJa` | agree | こたえは Me, too! せいかい！ ゴール！ 1てん ゲット！ | こたえは Me too! せいかい！ ゴール！ 1てん ゲット！ |
| L0183 | `lessons[2].teacher.segments[19].subtitleEn` | agree | Me, too! Goal! You scored a point! | Me too! Goal! You scored a point! |
| L0183 | `lessons[2].teacher.segments[19].slide.items[0]` | agree | Me, too! | Me too! |
| L0183 | `lessons[2].teacher.segments[20].say` | agree | … I like and I don't like. You can say Me, too! Day, play, say, May. Next, talk wi… | … I like and I don't like. You can say Me too! Day, play, say, May. Next, talk wi… |
| L0183 | `lessons[2].teacher.segments[20].subtitleJa` | agree | …トークだったね！ I like と I don't like が いえるね。Me, too! も いえるよ。day、play、say、May。このあと キコちゃん… | …トークだったね！ I like と I don't like が いえるね。Me too! も いえるよ。day、play、say、May。このあと キコちゃん… |
| L0183 | `lessons[2].teacher.segments[20].subtitleEn` | agree | … I like and I don't like. You can say Me, too! Day, play, say, May. Next, talk wi… | … I like and I don't like. You can say Me too! Day, play, say, May. Next, talk wi… |
| L0183 | `lessons[2].teacher.segments[20].slide.items[2]` | agree | Me, too! | Me too! |
| L0193 | `lessons[12].conversation.lines[1].en` | agree | Me, too! Do you have music on Thursday? | Me too! Do you have music on Thursday? |
| L0193 | `lessons[12].teacher.segments[6].say` | agree | …math and art on Wednesday. Haru says, Me, too! Do you have music on Thursday? Rik… | …math and art on Wednesday. Haru says, Me too! Do you have music on Thursday? Rik… |
| L0193 | `lessons[12].teacher.segments[6].subtitleEn` | agree | …math and art on Wednesday. Haru says, Me, too! Do you have music on Thursday? Rik… | …math and art on Wednesday. Haru says, Me too! Do you have music on Thursday? Rik… |
| L0193 | `lessons[12].teacher.segments[6].slide.items[1]` | agree | Me, too! Do you have music on Thursday? | Me too! Do you have music on Thursday? |
| L0204 | `lessons[23].teacher.segments[12].say` | handing | …a zookeeper. Feed the animals! Here you go, giraffe! Now throw a ball. えさを あげて、ボール… | …a zookeeper. Feed the animals! Here you are, giraffe! Now throw a ball. えさを あげて、ボール… |
| L0204 | `lessons[23].teacher.segments[12].subtitleEn` | handing | …a zookeeper. Feed the animals! Here you go, giraffe! Now throw a ball. | …a zookeeper. Feed the animals! Here you are, giraffe! Now throw a ball. |
| L0239 | `lessons[28].school.grammar` | manual | Please listen to my speech. / Thank you for listening. | Let me tell you about my hero. / Thank you for listening. |
| L0239 | `lessons[28].school.expressions[0].en` | manual | Please listen to my speech. | Let me tell you about my hero. |
| L0239 | `lessons[28].teacherScript` | manual | あしたの はっぴょうかいの リハーサル！はじめは Please listen to my speech. おわりは Thank you for listening. ゆっくり、えがお… | あしたの はっぴょうかいの リハーサル！はじめは Let me tell you about my hero. おわりは Thank you for listening. ゆっくり、えがお… |
| L0239 | `lessons[28].conversation.lines[1].en` | manual | Please listen to my speech. My hero is my coach. He is strong and … | Let me tell you about my hero. My hero is my coach. He is strong and … |
| L0239 | `lessons[28].conversation.aiTask.starterEn` | manual | It's rehearsal time! Start with "Please listen to my speech." | It's rehearsal time! Start your speech! "Let me tell you about my hero." |
| L0239 | `lessons[28].conversation.aiTask.targetExpressions[0]` | manual | Please listen to my speech. | Let me tell you about my hero. |
| L0239 | `lessons[28].recap.highlightsJa[0]` | manual | Please listen to my speech. が いえたね | Let me tell you about my hero. が いえたね |
| L0239 | `lessons[28].teacher.segments[1].say` | manual | …tart and end your speech the right way. Please listen to my speech. Thank you for listening. はじめと おわりの ことば… | …tart and end your speech the right way. Let me tell you about my hero. Thank you for listening. はじめと おわりの ことば… |
| L0239 | `lessons[28].teacher.segments[1].subtitleEn` | manual | …tart and end your speech the right way. Please listen to my speech. Thank you for listening. | …tart and end your speech the right way. Let me tell you about my hero. Thank you for listening. |
| L0239 | `lessons[28].teacher.segments[1].slide.items[0]` | manual | Please listen to my speech. / Thank you for listening. | Let me tell you about my hero. / Thank you for listening. |
| L0239 | `lessons[28].teacher.segments[6].say` | manual | …ice. Haru, you're first. Haru walks up. Please listen to my speech. My hero is my coach. He is strong and … | …ice. Haru, you're first. Haru walks up. Let me tell you about my hero. My hero is my coach. He is strong and … |
| L0239 | `lessons[28].teacher.segments[6].subtitleEn` | manual | …ice. Haru, you're first. Haru walks up. Please listen to my speech. My hero is my coach. He is strong and … | …ice. Haru, you're first. Haru walks up. Let me tell you about my hero. My hero is my coach. He is strong and … |
| L0239 | `lessons[28].teacher.segments[6].slide.items[1]` | manual | Please listen to my speech. My hero is my coach. He is strong and … | Let me tell you about my hero. My hero is my coach. He is strong and … |
| L0239 | `lessons[28].teacher.segments[8].say` | manual | Here's the point. Begin with Please listen to my speech. End with Thank you for listening. And … | Here's the point. Begin with Let me tell you about my hero. End with Thank you for listening. And … |
| L0239 | `lessons[28].teacher.segments[8].subtitleJa` | manual | ポイント。はじめは Please listen to my speech. おわりは Thank you for listening. そして いつも … | ポイント。はじめは Let me tell you about my hero. おわりは Thank you for listening. そして いつも … |
| L0239 | `lessons[28].teacher.segments[8].subtitleEn` | manual | Here's the point. Begin with Please listen to my speech. End with Thank you for listening. And … | Here's the point. Begin with Let me tell you about my hero. End with Thank you for listening. And … |
| L0239 | `lessons[28].teacher.segments[8].slide.items[0]` | manual | Please listen to my speech. | Let me tell you about my hero. |
| L0239 | `lessons[28].teacher.segments[14].say` | manual | Repeat after me. Please listen to my speech. | Repeat after me. Let me tell you about my hero. |
| L0239 | `lessons[28].teacher.segments[14].subtitleEn` | manual | Repeat after me. Please listen to my speech. | Repeat after me. Let me tell you about my hero. |
| L0239 | `lessons[28].teacher.segments[14].slide.items[0]` | manual | Please listen to my speech. | Let me tell you about my hero. |
| L0239 | `lessons[28].teacher.segments[17].say` | manual | Your turn! Make a tiny speech. Please listen to my speech. My hero is... Thank you for listening.… | Your turn! Make a tiny speech. Let me tell you about my hero. My hero is... Thank you for listening.… |
| L0239 | `lessons[28].teacher.segments[17].subtitleJa` | manual | あなたの ばん！ みじかい スピーチを しよう。Please listen to my speech. My hero is…。Thank you for listening. か… | あなたの ばん！ みじかい スピーチを しよう。Let me tell you about my hero. My hero is…。Thank you for listening. か… |
| L0239 | `lessons[28].teacher.segments[17].subtitleEn` | manual | Your turn! Make a tiny speech. Please listen to my speech. My hero is... Thank you for listening. | Your turn! Make a tiny speech. Let me tell you about my hero. My hero is... Thank you for listening. |
| L0239 | `lessons[28].teacher.segments[17].slide.items[0]` | manual | Please listen to my speech. | Let me tell you about my hero. |
| L0239 | `lessons[28].teacher.segments[18].say` | manual | …speech is finished. What do you say? A, Please listen to my speech. Or B, Thank you for listening. どっちかな？ | …speech is finished. What do you say? A, Let me tell you about my hero. Or B, Thank you for listening. どっちかな？ |
| L0239 | `lessons[28].teacher.segments[18].subtitleJa` | manual | クイズ！ スピーチが おわったよ。なんて いう？ A「Please listen to my speech.」 B「Thank you for listening.」 どっちかな？ | クイズ！ スピーチが おわったよ。なんて いう？ A「Let me tell you about my hero.」 B「Thank you for listening.」 どっちかな？ |
| L0239 | `lessons[28].teacher.segments[18].subtitleEn` | manual | …speech is finished. What do you say? A, Please listen to my speech. Or B, Thank you for listening. | …speech is finished. What do you say? A, Let me tell you about my hero. Or B, Thank you for listening. |
| L0239 | `lessons[28].teacher.segments[18].slide.items[0]` | manual | Please listen to my speech. | Let me tell you about my hero. |
| L0239 | `lessons[28].teacher.segments[20].slide.items[0]` | manual | Please listen to my speech. | Let me tell you about my hero. |
| L0244 | `lessons[3].school.expressions[2].en` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacherScript` | agree | …rite animal?」で ともだちの おきにいりを きこう。おなじなら「Me, too!」。garden や market は 2つに わけて よもう！ | …rite animal?」で ともだちの おきにいりを きこう。おなじなら「Me too!」。garden や market は 2つに わけて よもう！ |
| L0244 | `lessons[3].conversation.lines[4].en` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].recap.highlightsJa[1]` | agree | おなじ ときは Me, too! | おなじ ときは Me too! |
| L0244 | `lessons[3].teacher.segments[5].say` | agree | Too. Me, too! Point to yourself and smile. too は… | Too. Me too! Point to yourself and smile. too は… |
| L0244 | `lessons[3].teacher.segments[5].subtitleJa` | agree | too。Me, too！ じぶんを ゆびさして にっこり。too は「〜も」。too！ | too。Me too！ じぶんを ゆびさして にっこり。too は「〜も」。too！ |
| L0244 | `lessons[3].teacher.segments[5].subtitleEn` | agree | Too. Me, too! Point to yourself and smile. Too! | Too. Me too! Point to yourself and smile. Too! |
| L0244 | `lessons[3].teacher.segments[7].say` | agree | …vorite season is spring. Birimo says, Me, too! みんな なかよし。 | …vorite season is spring. Birimo says, Me too! みんな なかよし。 |
| L0244 | `lessons[3].teacher.segments[7].subtitleEn` | agree | …vorite season is spring. Birimo says, Me, too! | …vorite season is spring. Birimo says, Me too! |
| L0244 | `lessons[3].teacher.segments[7].slide.items[1]` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacher.segments[8].say` | agree | …orite animal is..." Same thing? おなじなら Me, too! | …orite animal is..." Same thing? おなじなら Me too! |
| L0244 | `lessons[3].teacher.segments[8].subtitleJa` | agree | …My favorite animal is…。おなじ ときは？ おなじなら Me, too! | …My favorite animal is…。おなじ ときは？ おなじなら Me too! |
| L0244 | `lessons[3].teacher.segments[8].subtitleEn` | agree | …My favorite animal is..." Same thing? Me, too! | …My favorite animal is..." Same thing? Me too! |
| L0244 | `lessons[3].teacher.segments[8].slide.items[1]` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacher.segments[16].say` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacher.segments[16].subtitleEn` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacher.segments[16].slide.items[0]` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacher.segments[18].say` | agree | …spring, too. Look at the spelling. A, Me, too! Or B, Me, two! どっちかな？ | …spring, too. Look at the spelling. A, Me too! Or B, Me, two! どっちかな？ |
| L0244 | `lessons[3].teacher.segments[18].subtitleJa` | agree | …「すきな きせつは はる。」 あなたも はるが すき。つづりを みてね。A「Me, too!」 B「Me, two!」 どっちかな？ | …「すきな きせつは はる。」 あなたも はるが すき。つづりを みてね。A「Me too!」 B「Me, two!」 どっちかな？ |
| L0244 | `lessons[3].teacher.segments[18].subtitleEn` | agree | …spring, too. Look at the spelling. A, Me, too! Or B, Me, two! | …spring, too. Look at the spelling. A, Me too! Or B, Me, two! |
| L0244 | `lessons[3].teacher.segments[18].slide.items[0]` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacher.segments[19].slide.items[0]` | agree | Me, too! | Me too! |
| L0244 | `lessons[3].teacher.segments[20].say` | agree | …hat's your favorite animal?" and say "Me, too!" garden や market も よめたね。Next, talk… | …hat's your favorite animal?" and say "Me too!" garden や market も よめたね。Next, talk… |
| L0244 | `lessons[3].teacher.segments[20].subtitleJa` | agree | …ね！ What's your favorite animal? と きけて、Me, too! も いえたね。garden や market も よめたね。このあと… | …ね！ What's your favorite animal? と きけて、Me too! も いえたね。garden や market も よめたね。このあと… |
| L0244 | `lessons[3].teacher.segments[20].subtitleEn` | agree | …hat's your favorite animal?" and say "Me, too!" Next, talk with Birimo! See you! | …hat's your favorite animal?" and say "Me too!" Next, talk with Birimo! See you! |
| L0244 | `lessons[3].teacher.segments[20].slide.items[2]` | agree | Me, too! | Me too! |
| L0253 | `lessons[12].teacher.segments[12].say` | handing | Help the nurse. Here you go! Now, touch something purple. むらさきの もの、… | Help the nurse. Here you are! Now, touch something purple. むらさきの もの、… |
| L0253 | `lessons[12].teacher.segments[12].subtitleEn` | handing | Help the nurse. Here you go! Now, touch something purple. | Help the nurse. Here you are! Now, touch something purple. |
| L0302 | `lessons[1].teacher.segments[3].say` | handing | …. Run fast and pass the baton. Here you go! relay は リレー。Relay! | …. Run fast and pass the baton. Here you are! relay は リレー。Relay! |
| L0302 | `lessons[1].teacher.segments[3].subtitleEn` | handing | …. Run fast and pass the baton. Here you go! Relay! | …. Run fast and pass the baton. Here you are! Relay! |
| L0306 | `lessons[5].teacher.segments[12].say` | handing | … up, yay! Now, pass the baton. Here you go! となりの ひとに バトンを わたして。 | … up, yay! Now, pass the baton. Here you are! となりの ひとに バトンを わたして。 |
| L0306 | `lessons[5].teacher.segments[12].subtitleEn` | handing | … up, yay! Now, pass the baton. Here you go! | … up, yay! Now, pass the baton. Here you are! |
| L0325 | `lessons[24].teacher.segments[12].say` | goodbye | …. Sway and sing! Then, wave goodbye. Bye, bye! ゆらゆら うたってね。 | …. Sway and sing! Then, wave goodbye. Bye-bye! ゆらゆら うたってね。 |
| L0325 | `lessons[24].teacher.segments[12].subtitleEn` | goodbye | …. Sway and sing! Then, wave goodbye. Bye, bye! | …. Sway and sing! Then, wave goodbye. Bye-bye! |
| L0553 | `lessons[12].teacher.segments[8].say` | thanks | … don't have to means it's OK not to. No worries. Kind words make friends smile. | … don't have to means it's OK not to. No problem. Kind words make friends smile. |
| L0553 | `lessons[12].teacher.segments[8].subtitleEn` | thanks | … don't have to means it's OK not to. No worries. Kind words make friends smile. | … don't have to means it's OK not to. No problem. Kind words make friends smile. |
| L0602 | `lessons[1].teacher.segments[20].say` | goodbye | …isconnect. Next, go and talk with Riko! Bye-bye! | …isconnect. Next, go and talk with Riko! See you! |
| L0602 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …isconnect. Next, go and talk with Riko! Bye-bye! | …isconnect. Next, go and talk with Riko! See you! |
| L0604 | `lessons[3].teacher.segments[20].say` | goodbye | …rangers. Next, go and talk with Birimo! Bye-bye! | …rangers. Next, go and talk with Birimo! See you! |
| L0604 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …rangers. Next, go and talk with Birimo! Bye-bye! | …rangers. Next, go and talk with Birimo! See you! |
| L0606 | `lessons[5].teacher.segments[20].say` | goodbye | …ou see me? Next, go and talk with Riko! Bye-bye! | …ou see me? Next, go and talk with Riko! See you! |
| L0606 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | …ou see me? Next, go and talk with Riko! Bye-bye! | …ou see me? Next, go and talk with Riko! See you! |
| L0608 | `lessons[7].teacher.segments[20].say` | goodbye | …s smart. Next, go and talk with Birimo! Bye-bye! | …s smart. Next, go and talk with Birimo! See you! |
| L0608 | `lessons[7].teacher.segments[20].subtitleEn` | goodbye | …s smart. Next, go and talk with Birimo! Bye-bye! | …s smart. Next, go and talk with Birimo! See you! |
| L0610 | `lessons[9].teacher.segments[20].say` | goodbye | …ning here. Next, go and talk with Riko! Bye-bye! | …ning here. Next, go and talk with Riko! See you! |
| L0610 | `lessons[9].teacher.segments[20].subtitleEn` | goodbye | …ning here. Next, go and talk with Riko! Bye-bye! | …ning here. Next, go and talk with Riko! See you! |
| L0611 | `lessons[10].teacher.segments[3].say` | goodbye | Out. Not here. Not at home. Bye-bye! Out! | Out. Not here. Not at home. Bye! Out! |
| L0611 | `lessons[10].teacher.segments[3].subtitleEn` | goodbye | Out. Not here. Not at home. Bye-bye! Out! | Out. Not here. Not at home. Bye! Out! |
| L0612 | `lessons[11].teacher.segments[20].say` | goodbye | …problem. Next, go and talk with Birimo! Bye-bye! | …problem. Next, go and talk with Birimo! See you! |
| L0612 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …problem. Next, go and talk with Birimo! Bye-bye! | …problem. Next, go and talk with Birimo! See you! |
| L0617 | `lessons[16].teacher.segments[20].say` | goodbye | …n it rang. Next, go and talk with Haru! Bye-bye! | …n it rang. Next, go and talk with Haru! See you! |
| L0617 | `lessons[16].teacher.segments[20].subtitleEn` | goodbye | …n it rang. Next, go and talk with Haru! Bye-bye! | …n it rang. Next, go and talk with Haru! See you! |
| L0620 | `lessons[19].teacher.segments[20].say` | goodbye | …e truth. Next, go and talk with Birimo! Bye-bye! | …e truth. Next, go and talk with Birimo! See you! |
| L0620 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …e truth. Next, go and talk with Birimo! Bye-bye! | …e truth. Next, go and talk with Birimo! See you! |
| L0622 | `lessons[21].teacher.segments[20].say` | goodbye | …tion back. Next, go and talk with Riko! Bye-bye! | …tion back. Next, go and talk with Riko! See you! |
| L0622 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …tion back. Next, go and talk with Riko! Bye-bye! | …tion back. Next, go and talk with Riko! See you! |
| L0624 | `lessons[23].teacher.segments[20].say` | goodbye | …d talk with Birimo! Help him stay safe. Bye-bye! | …d talk with Birimo! Help him stay safe. See you! |
| L0624 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …d talk with Birimo! Help him stay safe. Bye-bye! | …d talk with Birimo! Help him stay safe. See you! |
| L0628 | `lessons[27].teacher.segments[20].say` | goodbye | …olitely. Next, go and talk with Birimo! Bye-bye! | …olitely. Next, go and talk with Birimo! See you! |
| L0628 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | …olitely. Next, go and talk with Birimo! Bye-bye! | …olitely. Next, go and talk with Birimo! See you! |
| L0630 | `lessons[29].teacher.segments[20].say` | goodbye | …lk with Birimo! Get ready for World 22! Bye-bye! | …lk with Birimo! Get ready for World 22! See you! |
| L0630 | `lessons[29].teacher.segments[20].subtitleEn` | goodbye | …lk with Birimo! Get ready for World 22! Bye-bye! | …lk with Birimo! Get ready for World 22! See you! |
| L0632 | `lessons[1].teacher.segments[20].say` | goodbye | …e story. Next, go and talk with Birimo! Bye-bye! | …e story. Next, go and talk with Birimo! See you! |
| L0632 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …e story. Next, go and talk with Birimo! Bye-bye! | …e story. Next, go and talk with Birimo! See you! |
| L0635 | `lessons[4].teacher.segments[20].say` | goodbye | …u like it. Next, go and talk with Kiko! Bye-bye! | …u like it. Next, go and talk with Kiko! See you! |
| L0635 | `lessons[4].teacher.segments[20].subtitleEn` | goodbye | …u like it. Next, go and talk with Kiko! Bye-bye! | …u like it. Next, go and talk with Kiko! See you! |
| L0637 | `lessons[6].teacher.segments[20].say` | goodbye | … a little. Next, go and talk with Haru! Bye-bye! | … a little. Next, go and talk with Haru! See you! |
| L0637 | `lessons[6].teacher.segments[20].subtitleEn` | goodbye | … a little. Next, go and talk with Haru! Bye-bye! | … a little. Next, go and talk with Haru! See you! |
| L0639 | `lessons[8].teacher.segments[20].say` | goodbye | …or Really? Next, go and talk with Kiko! Bye-bye! | …or Really? Next, go and talk with Kiko! See you! |
| L0639 | `lessons[8].teacher.segments[20].subtitleEn` | goodbye | …or Really? Next, go and talk with Kiko! Bye-bye! | …or Really? Next, go and talk with Kiko! See you! |
| L0642 | `lessons[11].teacher.segments[20].say` | goodbye | … Suddenly. Next, go and talk with Riko! Bye-bye! | … Suddenly. Next, go and talk with Riko! See you! |
| L0642 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | … Suddenly. Next, go and talk with Riko! Bye-bye! | … Suddenly. Next, go and talk with Riko! See you! |
| L0644 | `lessons[13].teacher.segments[20].say` | goodbye | …me more? Next, go and talk with Birimo! Bye-bye! | …me more? Next, go and talk with Birimo! See you! |
| L0644 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …me more? Next, go and talk with Birimo! Bye-bye! | …me more? Next, go and talk with Birimo! See you! |
| L0645 | `lessons[14].teacher.segments[20].say` | goodbye | …t the end. Next, go and talk with Haru! Bye-bye! | …t the end. Next, go and talk with Haru! See you! |
| L0645 | `lessons[14].teacher.segments[20].subtitleEn` | goodbye | …t the end. Next, go and talk with Haru! Bye-bye! | …t the end. Next, go and talk with Haru! See you! |
| L0647 | `lessons[16].teacher.segments[20].say` | goodbye | …different. Next, go and talk with Kiko! Bye-bye! | …different. Next, go and talk with Kiko! See you! |
| L0647 | `lessons[16].teacher.segments[20].subtitleEn` | goodbye | …different. Next, go and talk with Kiko! Bye-bye! | …different. Next, go and talk with Kiko! See you! |
| L0650 | `lessons[19].teacher.segments[20].say` | goodbye | …d the key! Next, go and talk with Riko! Bye-bye! | …d the key! Next, go and talk with Riko! See you! |
| L0650 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …d the key! Next, go and talk with Riko! Bye-bye! | …d the key! Next, go and talk with Riko! See you! |
| L0651 | `lessons[20].teacher.segments[19].say` | goodbye | …h feeling. Next, go and talk with Kiko! Bye-bye! | …h feeling. Next, go and talk with Kiko! See you! |
| L0651 | `lessons[20].teacher.segments[19].subtitleEn` | goodbye | …h feeling. Next, go and talk with Kiko! Bye-bye! | …h feeling. Next, go and talk with Kiko! See you! |
| L0654 | `lessons[23].teacher.segments[20].say` | goodbye | …the story? Next, go and talk with Riko! Bye-bye! | …the story? Next, go and talk with Riko! See you! |
| L0654 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …the story? Next, go and talk with Riko! Bye-bye! | …the story? Next, go and talk with Riko! See you! |
| L0657 | `lessons[26].teacher.segments[20].say` | goodbye | …ur ending? Next, go and talk with Haru! Bye-bye! | …ur ending? Next, go and talk with Haru! See you! |
| L0657 | `lessons[26].teacher.segments[20].subtitleEn` | goodbye | …ur ending? Next, go and talk with Haru! Bye-bye! | …ur ending? Next, go and talk with Haru! See you! |
| L0660 | `lessons[29].teacher.segments[20].say` | goodbye | …s on to World 23, the Green Laboratory! Bye-bye! | …s on to World 23, the Green Laboratory! See you! |
| L0660 | `lessons[29].teacher.segments[20].subtitleEn` | goodbye | …s on to World 23, the Green Laboratory! Bye-bye! | …s on to World 23, the Green Laboratory! See you! |
| L0662 | `lessons[1].teacher.segments[20].say` | goodbye | …hot plate. Next, go and talk with Riko! Bye-bye! | …hot plate. Next, go and talk with Riko! See you! |
| L0662 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …hot plate. Next, go and talk with Riko! Bye-bye! | …hot plate. Next, go and talk with Riko! See you! |
| L0665 | `lessons[4].teacher.segments[20].say` | goodbye | …t you saw. Next, go and talk with Haru! Bye-bye! | …t you saw. Next, go and talk with Haru! See you! |
| L0665 | `lessons[4].teacher.segments[20].subtitleEn` | goodbye | …t you saw. Next, go and talk with Haru! Bye-bye! | …t you saw. Next, go and talk with Haru! See you! |
| L0667 | `lessons[6].teacher.segments[20].say` | goodbye | … and down. Next, go and talk with Kiko! Bye-bye! | … and down. Next, go and talk with Kiko! See you! |
| L0667 | `lessons[6].teacher.segments[20].subtitleEn` | goodbye | … and down. Next, go and talk with Kiko! Bye-bye! | … and down. Next, go and talk with Kiko! See you! |
| L0670 | `lessons[9].conversation.lines[5].en` | goodbye | …ted the carrot would float. It sank. Bye-bye, carrot! | …ted the carrot would float. It sank. Bye, carrot! |
| L0670 | `lessons[9].teacher.segments[7].say` | goodbye | …Twelve spoons! Birimo's carrot sank. Bye-bye, carrot! | …Twelve spoons! Birimo's carrot sank. Bye, carrot! |
| L0670 | `lessons[9].teacher.segments[7].subtitleEn` | goodbye | …Twelve spoons! Birimo's carrot sank. Bye-bye, carrot! | …Twelve spoons! Birimo's carrot sank. Bye, carrot! |
| L0670 | `lessons[9].teacher.segments[7].slide.items[2]` | goodbye | …ted the carrot would float. It sank. Bye-bye, carrot! | …ted the carrot would float. It sank. Bye, carrot! |
| L0670 | `lessons[9].teacher.segments[20].say` | goodbye | …h a smile. Next, go and talk with Riko! Bye-bye! | …h a smile. Next, go and talk with Riko! See you! |
| L0670 | `lessons[9].teacher.segments[20].subtitleEn` | goodbye | …h a smile. Next, go and talk with Riko! Bye-bye! | …h a smile. Next, go and talk with Riko! See you! |
| L0672 | `lessons[11].teacher.segments[20].say` | goodbye | …fe, too. Next, go and talk with Birimo! Bye-bye! | …fe, too. Next, go and talk with Birimo! See you! |
| L0672 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …fe, too. Next, go and talk with Birimo! Bye-bye! | …fe, too. Next, go and talk with Birimo! See you! |
| L0675 | `lessons[14].teacher.segments[20].say` | goodbye | …r friends. Next, go and talk with Kiko! Bye-bye! | …r friends. Next, go and talk with Kiko! See you! |
| L0675 | `lessons[14].teacher.segments[20].subtitleEn` | goodbye | …r friends. Next, go and talk with Kiko! Bye-bye! | …r friends. Next, go and talk with Kiko! See you! |
| L0677 | `lessons[16].teacher.segments[10].say` | goodbye | … e before the y! Wave the e goodbye. Bye-bye, e! Shiny. Icy. Noisy. Juicy. Your turn… | … e before the y! Wave the e goodbye. Bye, e! Shiny. Icy. Noisy. Juicy. Your turn… |
| L0677 | `lessons[16].teacher.segments[10].subtitleEn` | goodbye | … e before the y! Wave the e goodbye. Bye-bye, e! Shiny. Icy. Noisy. Juicy. Your turn… | … e before the y! Wave the e goodbye. Bye, e! Shiny. Icy. Noisy. Juicy. Your turn… |
| L0677 | `lessons[16].teacher.segments[20].say` | goodbye | …n recycle! Next, go and talk with Haru! Bye-bye! | …n recycle! Next, go and talk with Haru! See you! |
| L0677 | `lessons[16].teacher.segments[20].subtitleEn` | goodbye | …n recycle! Next, go and talk with Haru! Bye-bye! | …n recycle! Next, go and talk with Haru! See you! |
| L0680 | `lessons[19].teacher.segments[20].say` | goodbye | …e hints. Next, go and talk with Birimo! Bye-bye! | …e hints. Next, go and talk with Birimo! See you! |
| L0680 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …e hints. Next, go and talk with Birimo! Bye-bye! | …e hints. Next, go and talk with Birimo! See you! |
| L0682 | `lessons[21].teacher.segments[20].say` | goodbye | … words. Next, go and talk with Riko! Bye-bye, little sprouts! | … words. Next, go and talk with Riko! Bye, little sprouts! |
| L0682 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | … words. Next, go and talk with Riko! Bye-bye, little sprouts! | … words. Next, go and talk with Riko! Bye, little sprouts! |
| L0684 | `lessons[23].teacher.segments[20].say` | goodbye | …mystery! Next, go and talk with Birimo! Bye-bye! | …mystery! Next, go and talk with Birimo! See you! |
| L0684 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …mystery! Next, go and talk with Birimo! Bye-bye! | …mystery! Next, go and talk with Birimo! See you! |
| L0688 | `lessons[27].teacher.segments[20].say` | goodbye | …lusion. Next, go and talk with Haru! Bye-bye, scientists! | …lusion. Next, go and talk with Haru! Bye, scientists! |
| L0688 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | …lusion. Next, go and talk with Haru! Bye-bye, scientists! | …lusion. Next, go and talk with Haru! Bye, scientists! |
| L0690 | `lessons[29].teacher.segments[21].say` | goodbye | … talk with Riko! World 24 is coming up! Bye-bye! | … talk with Riko! World 24 is coming up! See you! |
| L0690 | `lessons[29].teacher.segments[21].subtitleEn` | goodbye | … talk with Riko! World 24 is coming up! Bye-bye! | … talk with Riko! World 24 is coming up! See you! |
| L0692 | `lessons[1].teacher.segments[20].say` | goodbye | …ish way. Next, go and talk with Birimo! Bye-bye! | …ish way. Next, go and talk with Birimo! See you! |
| L0692 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …ish way. Next, go and talk with Birimo! Bye-bye! | …ish way. Next, go and talk with Birimo! See you! |
| L0693 | `lessons[2].teacher.segments[4].say` | goodbye | Come back. Return to this place. Bye-bye! And then, I'm back! Come back! | Come back. Return to this place. Bye! And then, I'm back! Come back! |
| L0693 | `lessons[2].teacher.segments[4].subtitleEn` | goodbye | Come back. Return to this place. Bye-bye! And then, I'm back! Come back! | Come back. Return to this place. Bye! And then, I'm back! Come back! |
| L0693 | `lessons[2].teacher.segments[12].say` | goodbye | … Now, wave goodbye, then wave hello. Bye-bye! Hello again! | … Now, wave goodbye, then wave hello. Bye! Hello again! |
| L0693 | `lessons[2].teacher.segments[12].subtitleEn` | goodbye | … Now, wave goodbye, then wave hello. Bye-bye! Hello again! | … Now, wave goodbye, then wave hello. Bye! Hello again! |
| L0694 | `lessons[3].teacher.segments[4].say` | goodbye | …place. The train leaves the station. Bye-bye, train! Leave! | …place. The train leaves the station. Bye, train! Leave! |
| L0694 | `lessons[3].teacher.segments[4].subtitleEn` | goodbye | …place. The train leaves the station. Bye-bye, train! Leave! | …place. The train leaves the station. Bye, train! Leave! |
| L0694 | `lessons[3].teacher.segments[20].say` | goodbye | … platform. Next, go and talk with Riko! Bye-bye! | … platform. Next, go and talk with Riko! See you! |
| L0694 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | … platform. Next, go and talk with Riko! Bye-bye! | … platform. Next, go and talk with Riko! See you! |
| L0698 | `lessons[7].teacher.segments[20].say` | goodbye | …thank you. Next, go and talk with Kiko! Bye-bye! | …thank you. Next, go and talk with Kiko! See you! |
| L0698 | `lessons[7].teacher.segments[20].subtitleEn` | goodbye | …thank you. Next, go and talk with Kiko! Bye-bye! | …thank you. Next, go and talk with Kiko! See you! |
| L0702 | `lessons[11].teacher.segments[20].say` | goodbye | …the bench. Next, go and talk with Riko! Bye-bye! | …the bench. Next, go and talk with Riko! See you! |
| L0702 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …the bench. Next, go and talk with Riko! Bye-bye! | …the bench. Next, go and talk with Riko! See you! |
| L0704 | `lessons[13].teacher.segments[20].say` | goodbye | …'s inside? Next, go and talk with Riko! Bye-bye! | …'s inside? Next, go and talk with Riko! See you! |
| L0704 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …'s inside? Next, go and talk with Riko! Bye-bye! | …'s inside? Next, go and talk with Riko! See you! |
| L0707 | `lessons[16].teacher.segments[20].say` | goodbye | …ans below. Next, go and talk with Kiko! Bye-bye! | …ans below. Next, go and talk with Kiko! See you! |
| L0707 | `lessons[16].teacher.segments[20].subtitleEn` | goodbye | …ans below. Next, go and talk with Kiko! Bye-bye! | …ans below. Next, go and talk with Kiko! See you! |
| L0709 | `lessons[18].teacher.segments[20].say` | goodbye | …t overeat! Next, go and talk with Haru! Bye-bye! | …t overeat! Next, go and talk with Haru! See you! |
| L0709 | `lessons[18].teacher.segments[20].subtitleEn` | goodbye | …t overeat! Next, go and talk with Haru! Bye-bye! | …t overeat! Next, go and talk with Haru! See you! |
| L0713 | `lessons[22].teacher.segments[20].say` | goodbye | … im or in. Next, go and talk with Haru! Bye-bye! | … im or in. Next, go and talk with Haru! See you! |
| L0713 | `lessons[22].teacher.segments[20].subtitleEn` | goodbye | … im or in. Next, go and talk with Haru! Bye-bye! | … im or in. Next, go and talk with Haru! See you! |
| L0715 | `lessons[24].teacher.segments[20].say` | goodbye | …akes, too. Next, go and talk with Kiko! Bye-bye! | …akes, too. Next, go and talk with Kiko! See you! |
| L0715 | `lessons[24].teacher.segments[20].subtitleEn` | goodbye | …akes, too. Next, go and talk with Kiko! Bye-bye! | …akes, too. Next, go and talk with Kiko! See you! |
| L0717 | `lessons[26].teacher.segments[20].say` | goodbye | …t, please? Next, go and talk with Haru! Bye-bye! | …t, please? Next, go and talk with Haru! See you! |
| L0717 | `lessons[26].teacher.segments[20].subtitleEn` | goodbye | …t, please? Next, go and talk with Haru! Bye-bye! | …t, please? Next, go and talk with Haru! See you! |
| L0718 | `lessons[27].teacher.segments[20].say` | goodbye | …t someday. Next, go and talk with Riko! Bye-bye! | …t someday. Next, go and talk with Riko! See you! |
| L0718 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | …t someday. Next, go and talk with Riko! Bye-bye! | …t someday. Next, go and talk with Riko! See you! |
| L0722 | `lessons[1].teacher.segments[20].say` | goodbye | …he middle? Next, go and talk with Riko! Bye-bye! | …he middle? Next, go and talk with Riko! See you! |
| L0722 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …he middle? Next, go and talk with Riko! Bye-bye! | …he middle? Next, go and talk with Riko! See you! |
| L0724 | `lessons[3].teacher.segments[20].say` | goodbye | …r small? Next, go and talk with Birimo! Bye-bye! | …r small? Next, go and talk with Birimo! See you! |
| L0724 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …r small? Next, go and talk with Birimo! Bye-bye! | …r small? Next, go and talk with Birimo! See you! |
| L0726 | `lessons[5].teacher.segments[20].say` | goodbye | … might. Next, go and talk with Riko! Bye-bye, and say hi to Bella! | … might. Next, go and talk with Riko! Bye, and say hi to Bella! |
| L0726 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | … might. Next, go and talk with Riko! Bye-bye, and say hi to Bella! | … might. Next, go and talk with Riko! Bye, and say hi to Bella! |
| L0728 | `lessons[7].teacher.segments[20].say` | goodbye | …d words. Next, go and talk with Birimo! Bye-bye! | …d words. Next, go and talk with Birimo! See you! |
| L0728 | `lessons[7].teacher.segments[20].subtitleEn` | goodbye | …d words. Next, go and talk with Birimo! Bye-bye! | …d words. Next, go and talk with Birimo! See you! |
| L0730 | `lessons[9].teacher.segments[20].say` | goodbye | …h because. Next, go and talk with Riko! Bye-bye! | …h because. Next, go and talk with Riko! See you! |
| L0730 | `lessons[9].teacher.segments[20].subtitleEn` | goodbye | …h because. Next, go and talk with Riko! Bye-bye! | …h because. Next, go and talk with Riko! See you! |
| L0732 | `lessons[11].teacher.segments[20].say` | goodbye | …he cave. Next, go and talk with Birimo! Bye-bye! | …he cave. Next, go and talk with Birimo! See you! |
| L0732 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …he cave. Next, go and talk with Birimo! Bye-bye! | …he cave. Next, go and talk with Birimo! See you! |
| L0734 | `lessons[13].teacher.segments[20].say` | goodbye | …on't know. Next, go and talk with Riko! Bye-bye! | …on't know. Next, go and talk with Riko! See you! |
| L0734 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …on't know. Next, go and talk with Riko! Bye-bye! | …on't know. Next, go and talk with Riko! See you! |
| L0736 | `lessons[15].teacher.segments[20].say` | goodbye | …t is it? Next, go and talk with Birimo! Bye-bye! | …t is it? Next, go and talk with Birimo! See you! |
| L0736 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …t is it? Next, go and talk with Birimo! Bye-bye! | …t is it? Next, go and talk with Birimo! See you! |
| L0738 | `lessons[17].teacher.segments[20].say` | goodbye | …ll for me. Next, go and talk with Riko! Bye-bye! | …ll for me. Next, go and talk with Riko! See you! |
| L0738 | `lessons[17].teacher.segments[20].subtitleEn` | goodbye | …ll for me. Next, go and talk with Riko! Bye-bye! | …ll for me. Next, go and talk with Riko! See you! |
| L0740 | `lessons[19].teacher.segments[20].say` | goodbye | …I'm not. Next, go and talk with Birimo! Bye-bye! | …I'm not. Next, go and talk with Birimo! See you! |
| L0740 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …I'm not. Next, go and talk with Birimo! Bye-bye! | …I'm not. Next, go and talk with Birimo! See you! |
| L0741 | `lessons[20].teacher.segments[19].say` | goodbye | …yes or no. Next, go and talk with Haru! Bye-bye! | …yes or no. Next, go and talk with Haru! See you! |
| L0741 | `lessons[20].teacher.segments[19].subtitleEn` | goodbye | …yes or no. Next, go and talk with Haru! Bye-bye! | …yes or no. Next, go and talk with Haru! See you! |
| L0744 | `lessons[23].teacher.segments[20].say` | goodbye | …on, too. Next, go and talk with Birimo! Bye-bye! | …on, too. Next, go and talk with Birimo! See you! |
| L0744 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …on, too. Next, go and talk with Birimo! Bye-bye! | …on, too. Next, go and talk with Birimo! See you! |
| L0746 | `lessons[25].teacher.segments[20].say` | goodbye | … a reason. Next, go and talk with Riko! Bye-bye! | … a reason. Next, go and talk with Riko! See you! |
| L0746 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | … a reason. Next, go and talk with Riko! Bye-bye! | … a reason. Next, go and talk with Riko! See you! |
| L0750 | `lessons[29].teacher.segments[20].say` | goodbye | … on to World 26, the Theater of Echoes! Bye-bye! | … on to World 26, the Theater of Echoes! See you! |
| L0750 | `lessons[29].teacher.segments[20].subtitleEn` | goodbye | … on to World 26, the Theater of Echoes! Bye-bye! | … on to World 26, the Theater of Echoes! See you! |
| L0752 | `lessons[1].teacher.segments[20].say` | goodbye | … or sad. Next, go and talk with Birimo! Bye-bye! | … or sad. Next, go and talk with Birimo! See you! |
| L0752 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | … or sad. Next, go and talk with Birimo! Bye-bye! | … or sad. Next, go and talk with Birimo! See you! |
| L0754 | `lessons[3].teacher.segments[20].say` | goodbye | …it's hard. Next, go and talk with Riko! Bye-bye! | …it's hard. Next, go and talk with Riko! See you! |
| L0754 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …it's hard. Next, go and talk with Riko! Bye-bye! | …it's hard. Next, go and talk with Riko! See you! |
| L0756 | `lessons[5].teacher.segments[20].say` | goodbye | … tiring. Next, go and talk with Birimo! Bye-bye! | … tiring. Next, go and talk with Birimo! See you! |
| L0756 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | … tiring. Next, go and talk with Birimo! Bye-bye! | … tiring. Next, go and talk with Birimo! See you! |
| L0758 | `lessons[7].teacher.segments[20].say` | goodbye | …t amazing. Next, go and talk with Riko! Bye-bye! | …t amazing. Next, go and talk with Riko! See you! |
| L0758 | `lessons[7].teacher.segments[20].subtitleEn` | goodbye | …t amazing. Next, go and talk with Riko! Bye-bye! | …t amazing. Next, go and talk with Riko! See you! |
| L0760 | `lessons[9].teacher.segments[20].say` | goodbye | …le body. Next, go and talk with Birimo! Bye-bye! | …le body. Next, go and talk with Birimo! See you! |
| L0760 | `lessons[9].teacher.segments[20].subtitleEn` | goodbye | …le body. Next, go and talk with Birimo! Bye-bye! | …le body. Next, go and talk with Birimo! See you! |
| L0762 | `lessons[11].teacher.segments[20].say` | goodbye | …es inside. Next, go and talk with Riko! Bye-bye! | …es inside. Next, go and talk with Riko! See you! |
| L0762 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …es inside. Next, go and talk with Riko! Bye-bye! | …es inside. Next, go and talk with Riko! See you! |
| L0764 | `lessons[13].teacher.segments[20].say` | goodbye | …because. Next, go and talk with Birimo! Bye-bye! | …because. Next, go and talk with Birimo! See you! |
| L0764 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …because. Next, go and talk with Birimo! Bye-bye! | …because. Next, go and talk with Birimo! See you! |
| L0766 | `lessons[15].teacher.segments[20].say` | goodbye | …rong word. Next, go and talk with Riko! Bye-bye! | …rong word. Next, go and talk with Riko! See you! |
| L0766 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …rong word. Next, go and talk with Riko! Bye-bye! | …rong word. Next, go and talk with Riko! See you! |
| L0768 | `lessons[17].teacher.segments[20].say` | goodbye | …meaning. Next, go and talk with Birimo! Bye-bye! | …meaning. Next, go and talk with Birimo! See you! |
| L0768 | `lessons[17].teacher.segments[20].subtitleEn` | goodbye | …meaning. Next, go and talk with Birimo! Bye-bye! | …meaning. Next, go and talk with Birimo! See you! |
| L0769 | `lessons[18].teacher.segments[4].say` | goodbye | Exit. Go off the stage. Bye-bye! Exit! | Exit. Go off the stage. Bye! Exit! |
| L0769 | `lessons[18].teacher.segments[4].subtitleEn` | goodbye | Exit. Go off the stage. Bye-bye! Exit! | Exit. Go off the stage. Bye! Exit! |
| L0769 | `lessons[18].teacher.segments[19].say` | goodbye | It's B! Exit means go out. Bye-bye, stage! Perfect! | It's B! Exit means go out. Bye, stage! Perfect! |
| L0769 | `lessons[18].teacher.segments[19].subtitleEn` | goodbye | It's B! Exit means go out. Bye-bye, stage! Perfect! | It's B! Exit means go out. Bye, stage! Perfect! |
| L0770 | `lessons[19].teacher.segments[20].say` | goodbye | …ene again. Next, go and talk with Riko! Bye-bye! | …ene again. Next, go and talk with Riko! See you! |
| L0770 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …ene again. Next, go and talk with Riko! Bye-bye! | …ene again. Next, go and talk with Riko! See you! |
| L0773 | `lessons[22].teacher.segments[19].say` | goodbye | …eak a leg! Next, go and talk with Haru! Bye-bye! | …eak a leg! Next, go and talk with Haru! See you! |
| L0773 | `lessons[22].teacher.segments[19].subtitleEn` | goodbye | …eak a leg! Next, go and talk with Haru! Bye-bye! | …eak a leg! Next, go and talk with Haru! See you! |
| L0775 | `lessons[24].teacher.segments[19].say` | goodbye | …rite part. Next, go and talk with Kiko! Bye-bye! | …rite part. Next, go and talk with Kiko! See you! |
| L0775 | `lessons[24].teacher.segments[19].subtitleEn` | goodbye | …rite part. Next, go and talk with Kiko! Bye-bye! | …rite part. Next, go and talk with Kiko! See you! |
| L0777 | `lessons[26].teacher.segments[19].say` | goodbye | …s at home. Next, go and talk with Haru! Bye-bye! | …s at home. Next, go and talk with Haru! See you! |
| L0777 | `lessons[26].teacher.segments[19].subtitleEn` | goodbye | …s at home. Next, go and talk with Haru! Bye-bye! | …s at home. Next, go and talk with Haru! See you! |
| L0780 | `lessons[29].teacher.segments[19].say` | goodbye | …go to World 27, the Village of Springs! Bye-bye! | …go to World 27, the Village of Springs! See you! |
| L0780 | `lessons[29].teacher.segments[19].subtitleEn` | goodbye | …go to World 27, the Village of Springs! Bye-bye! | …go to World 27, the Village of Springs! See you! |
| L0782 | `lessons[1].teacher.segments[20].say` | goodbye | …some rest. Next, go and talk with Riko! Bye-bye! | …some rest. Next, go and talk with Riko! See you! |
| L0782 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …some rest. Next, go and talk with Riko! Bye-bye! | …some rest. Next, go and talk with Riko! See you! |
| L0784 | `lessons[3].teacher.segments[20].say` | goodbye | …t, Haru! Next, go and talk with Birimo! Bye-bye! | …t, Haru! Next, go and talk with Birimo! See you! |
| L0784 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …t, Haru! Next, go and talk with Birimo! Bye-bye! | …t, Haru! Next, go and talk with Birimo! See you! |
| L0786 | `lessons[5].teacher.segments[20].say` | goodbye | …wly today! Next, go and talk with Riko! Bye-bye! | …wly today! Next, go and talk with Riko! See you! |
| L0786 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | …wly today! Next, go and talk with Riko! Bye-bye! | …wly today! Next, go and talk with Riko! See you! |
| L0789 | `lessons[8].teacher.segments[20].say` | goodbye | …our a day. Next, go and talk with Haru! Bye-bye! | …our a day. Next, go and talk with Haru! See you! |
| L0789 | `lessons[8].teacher.segments[20].subtitleEn` | goodbye | …our a day. Next, go and talk with Haru! Bye-bye! | …our a day. Next, go and talk with Haru! See you! |
| L0792 | `lessons[11].teacher.segments[20].say` | goodbye | …ng time? Next, go and talk with Birimo! Bye-bye! | …ng time? Next, go and talk with Birimo! See you! |
| L0792 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …ng time? Next, go and talk with Birimo! Bye-bye! | …ng time? Next, go and talk with Birimo! See you! |
| L0794 | `lessons[13].teacher.segments[20].say` | goodbye | …five days. Next, go and talk with Riko! Bye-bye! | …five days. Next, go and talk with Riko! See you! |
| L0794 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …five days. Next, go and talk with Riko! Bye-bye! | …five days. Next, go and talk with Riko! See you! |
| L0802 | `lessons[21].teacher.segments[20].say` | goodbye | … calm now. Next, go and talk with Riko! Bye-bye! | … calm now. Next, go and talk with Riko! See you! |
| L0802 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | … calm now. Next, go and talk with Riko! Bye-bye! | … calm now. Next, go and talk with Riko! See you! |
| L0803 | `lessons[22].teacher.segments[3].say` | goodbye | …things and go to live in a new town. Bye-bye, house! Move away! | …things and go to live in a new town. Bye, house! Move away! |
| L0803 | `lessons[22].teacher.segments[3].subtitleEn` | goodbye | …things and go to live in a new town. Bye-bye, house! Move away! | …things and go to live in a new town. Bye, house! Move away! |
| L0804 | `lessons[23].teacher.segments[20].say` | goodbye | …lf, too. Next, go and talk with Birimo! Bye-bye! | …lf, too. Next, go and talk with Birimo! See you! |
| L0804 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …lf, too. Next, go and talk with Birimo! Bye-bye! | …lf, too. Next, go and talk with Birimo! See you! |
| L0806 | `lessons[25].teacher.segments[20].say` | goodbye | … the week. Next, go and talk with Riko! Bye-bye! | … the week. Next, go and talk with Riko! See you! |
| L0806 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | … the week. Next, go and talk with Riko! Bye-bye! | … the week. Next, go and talk with Riko! See you! |
| L0808 | `lessons[27].teacher.segments[20].say` | goodbye | … reason. Next, go and talk with Birimo! Bye-bye! | … reason. Next, go and talk with Birimo! See you! |
| L0808 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | … reason. Next, go and talk with Birimo! Bye-bye! | … reason. Next, go and talk with Birimo! See you! |
| L0809 | `lessons[28].teacher.segments[11].say` | goodbye | …lowly. Now wave goodbye to the village. Bye-bye! | …lowly. Now wave goodbye to the village. See you! |
| L0809 | `lessons[28].teacher.segments[11].subtitleEn` | goodbye | …lowly. Now wave goodbye to the village. Bye-bye! | …lowly. Now wave goodbye to the village. See you! |
| L0810 | `lessons[29].teacher.segments[20].say` | goodbye | …coming up! Next, go and talk with Riko! Bye-bye! | …coming up! Next, go and talk with Riko! See you! |
| L0810 | `lessons[29].teacher.segments[20].subtitleEn` | goodbye | …coming up! Next, go and talk with Riko! Bye-bye! | …coming up! Next, go and talk with Riko! See you! |
| L0812 | `lessons[1].teacher.segments[20].say` | goodbye | …fferent? Next, go and talk with Birimo! Bye-bye! | …fferent? Next, go and talk with Birimo! See you! |
| L0812 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …fferent? Next, go and talk with Birimo! Bye-bye! | …fferent? Next, go and talk with Birimo! See you! |
| L0816 | `lessons[5].teacher.segments[20].say` | goodbye | … tastes. Next, go and talk with Birimo! Bye-bye! | … tastes. Next, go and talk with Birimo! See you! |
| L0816 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | … tastes. Next, go and talk with Birimo! Bye-bye! | … tastes. Next, go and talk with Birimo! See you! |
| L0819 | `lessons[8].teacher.segments[20].say` | goodbye | …ial there. Next, go and talk with Kiko! Bye-bye! | …ial there. Next, go and talk with Kiko! See you! |
| L0819 | `lessons[8].teacher.segments[20].subtitleEn` | goodbye | …ial there. Next, go and talk with Kiko! Bye-bye! | …ial there. Next, go and talk with Kiko! See you! |
| L0822 | `lessons[11].teacher.segments[19].say` | goodbye | …ds softly. Next, go and talk with Riko! Bye-bye! | …ds softly. Next, go and talk with Riko! See you! |
| L0822 | `lessons[11].teacher.segments[19].subtitleEn` | goodbye | …ds softly. Next, go and talk with Riko! Bye-bye! | …ds softly. Next, go and talk with Riko! See you! |
| L0824 | `lessons[13].teacher.segments[20].say` | goodbye | … reason? Next, go and talk with Birimo! Bye-bye! | … reason? Next, go and talk with Birimo! See you! |
| L0824 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | … reason? Next, go and talk with Birimo! Bye-bye! | … reason? Next, go and talk with Birimo! See you! |
| L0826 | `lessons[15].teacher.segments[20].say` | goodbye | …ask again. Next, go and talk with Haru! Bye-bye! | …ask again. Next, go and talk with Haru! See you! |
| L0826 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …ask again. Next, go and talk with Haru! Bye-bye! | …ask again. Next, go and talk with Haru! See you! |
| L0830 | `lessons[19].teacher.segments[20].say` | goodbye | …ou should. Next, go and talk with Riko! Bye-bye! | …ou should. Next, go and talk with Riko! See you! |
| L0830 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …ou should. Next, go and talk with Riko! Bye-bye! | …ou should. Next, go and talk with Riko! See you! |
| L0832 | `lessons[21].teacher.segments[20].say` | goodbye | …ul part. Next, go and talk with Birimo! Bye-bye! | …ul part. Next, go and talk with Birimo! See you! |
| L0832 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …ul part. Next, go and talk with Birimo! Bye-bye! | …ul part. Next, go and talk with Birimo! See you! |
| L0834 | `lessons[23].teacher.segments[2].say` | repeat-teacher | …arsal. Practice before the real show. Once more, from the top! Rehearsal! | …arsal. Practice before the real show. One more time, from the top! Rehearsal! |
| L0834 | `lessons[23].teacher.segments[2].subtitleEn` | repeat-teacher | …arsal. Practice before the real show. Once more, from the top! Rehearsal! | …arsal. Practice before the real show. One more time, from the top! Rehearsal! |
| L0834 | `lessons[23].teacher.segments[20].say` | goodbye | …ment part. Next, go and talk with Riko! Bye-bye! | …ment part. Next, go and talk with Riko! See you! |
| L0834 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …ment part. Next, go and talk with Riko! Bye-bye! | …ment part. Next, go and talk with Riko! See you! |
| L0836 | `lessons[25].teacher.segments[20].say` | goodbye | …enjoyed. Next, go and talk with Birimo! Bye-bye! | …enjoyed. Next, go and talk with Birimo! See you! |
| L0836 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | …enjoyed. Next, go and talk with Birimo! Bye-bye! | …enjoyed. Next, go and talk with Birimo! See you! |
| L0842 | `lessons[1].teacher.segments[20].say` | goodbye | … think so? Next, go and talk with Riko! Bye-bye! | … think so? Next, go and talk with Riko! See you! |
| L0842 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | … think so? Next, go and talk with Riko! Bye-bye! | … think so? Next, go and talk with Riko! See you! |
| L0844 | `lessons[3].teacher.segments[20].say` | goodbye | … reason. Next, go and talk with Birimo! Bye-bye! | … reason. Next, go and talk with Birimo! See you! |
| L0844 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | … reason. Next, go and talk with Birimo! Bye-bye! | … reason. Next, go and talk with Birimo! See you! |
| L0847 | `lessons[6].teacher.segments[20].say` | goodbye | …ach other. Next, go and talk with Kiko! Bye-bye! | …ach other. Next, go and talk with Kiko! See you! |
| L0847 | `lessons[6].teacher.segments[20].subtitleEn` | goodbye | …ach other. Next, go and talk with Kiko! Bye-bye! | …ach other. Next, go and talk with Kiko! See you! |
| L0849 | `lessons[8].teacher.segments[20].say` | goodbye | …true, but. Next, go and talk with Haru! Bye-bye! | …true, but. Next, go and talk with Haru! See you! |
| L0849 | `lessons[8].teacher.segments[20].subtitleEn` | goodbye | …true, but. Next, go and talk with Haru! Bye-bye! | …true, but. Next, go and talk with Haru! See you! |
| L0852 | `lessons[11].teacher.segments[20].say` | goodbye | …g voice. Next, go and talk with Birimo! Bye-bye! | …g voice. Next, go and talk with Birimo! See you! |
| L0852 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …g voice. Next, go and talk with Birimo! Bye-bye! | …g voice. Next, go and talk with Birimo! See you! |
| L0854 | `lessons[13].teacher.segments[20].say` | goodbye | …'t chosen. Next, go and talk with Riko! Bye-bye! | …'t chosen. Next, go and talk with Riko! See you! |
| L0854 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …'t chosen. Next, go and talk with Riko! Bye-bye! | …'t chosen. Next, go and talk with Riko! See you! |
| L0856 | `lessons[15].teacher.segments[20].say` | goodbye | …ick way. Next, go and talk with Birimo! Bye-bye! | …ick way. Next, go and talk with Birimo! See you! |
| L0856 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …ick way. Next, go and talk with Birimo! Bye-bye! | …ick way. Next, go and talk with Birimo! See you! |
| L0859 | `lessons[18].teacher.segments[20].say` | goodbye | …ome-n-see! Next, go and talk with Kiko! Bye-bye! | …ome-n-see! Next, go and talk with Kiko! See you! |
| L0859 | `lessons[18].teacher.segments[20].subtitleEn` | goodbye | …ome-n-see! Next, go and talk with Kiko! Bye-bye! | …ome-n-see! Next, go and talk with Kiko! See you! |
| L0862 | `lessons[21].teacher.segments[20].say` | goodbye | …on counts. Next, go and talk with Riko! Bye-bye! | …on counts. Next, go and talk with Riko! See you! |
| L0862 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …on counts. Next, go and talk with Riko! Bye-bye! | …on counts. Next, go and talk with Riko! See you! |
| L0864 | `lessons[23].teacher.segments[20].say` | goodbye | …pinions. Next, go and talk with Birimo! Bye-bye! | …pinions. Next, go and talk with Birimo! See you! |
| L0864 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …pinions. Next, go and talk with Birimo! Bye-bye! | …pinions. Next, go and talk with Birimo! See you! |
| L0868 | `lessons[27].teacher.segments[20].say` | goodbye | …with So. Next, go and talk with Birimo! Bye-bye! | …with So. Next, go and talk with Birimo! See you! |
| L0868 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | …with So. Next, go and talk with Birimo! Bye-bye! | …with So. Next, go and talk with Birimo! See you! |
| L0872 | `lessons[1].teacher.segments[20].say` | goodbye | …y clean. Next, go and talk with Birimo! Bye-bye! | …y clean. Next, go and talk with Birimo! See you! |
| L0872 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …y clean. Next, go and talk with Birimo! Bye-bye! | …y clean. Next, go and talk with Birimo! See you! |
| L0874 | `lessons[3].teacher.segments[20].say` | goodbye | …ith which. Next, go and talk with Riko! Bye-bye! | …ith which. Next, go and talk with Riko! See you! |
| L0874 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …ith which. Next, go and talk with Riko! Bye-bye! | …ith which. Next, go and talk with Riko! See you! |
| L0876 | `lessons[5].teacher.segments[20].say` | goodbye | …od, too! Next, go and talk with Birimo! Bye-bye! | …od, too! Next, go and talk with Birimo! See you! |
| L0876 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | …od, too! Next, go and talk with Birimo! Bye-bye! | …od, too! Next, go and talk with Birimo! See you! |
| L0878 | `lessons[7].teacher.segments[20].say` | goodbye | …like Tess! Next, go and talk with Riko! Bye-bye! | …like Tess! Next, go and talk with Riko! See you! |
| L0878 | `lessons[7].teacher.segments[20].subtitleEn` | goodbye | …like Tess! Next, go and talk with Riko! Bye-bye! | …like Tess! Next, go and talk with Riko! See you! |
| L0880 | `lessons[9].teacher.segments[20].say` | goodbye | …shining! Next, go and talk with Birimo! Bye-bye! | …shining! Next, go and talk with Birimo! See you! |
| L0880 | `lessons[9].teacher.segments[20].subtitleEn` | goodbye | …shining! Next, go and talk with Birimo! Bye-bye! | …shining! Next, go and talk with Birimo! See you! |
| L0882 | `lessons[11].teacher.segments[21].say` | goodbye | …any ideas? Next, go and talk with Riko! Bye-bye! | …any ideas? Next, go and talk with Riko! See you! |
| L0882 | `lessons[11].teacher.segments[21].subtitleEn` | goodbye | …any ideas? Next, go and talk with Riko! Bye-bye! | …any ideas? Next, go and talk with Riko! See you! |
| L0884 | `lessons[13].teacher.segments[21].say` | goodbye | …t wrong? Next, go and talk with Birimo! Bye-bye! | …t wrong? Next, go and talk with Birimo! See you! |
| L0884 | `lessons[13].teacher.segments[21].subtitleEn` | goodbye | …t wrong? Next, go and talk with Birimo! Bye-bye! | …t wrong? Next, go and talk with Birimo! See you! |
| L0886 | `lessons[15].teacher.segments[21].say` | goodbye | …V, and PC. Next, go and talk with Riko! Bye-bye! | …V, and PC. Next, go and talk with Riko! See you! |
| L0886 | `lessons[15].teacher.segments[21].subtitleEn` | goodbye | …V, and PC. Next, go and talk with Riko! Bye-bye! | …V, and PC. Next, go and talk with Riko! See you! |
| L0888 | `lessons[17].teacher.segments[21].say` | goodbye | …rown-up. Next, go and talk with Birimo! Bye-bye! | …rown-up. Next, go and talk with Birimo! See you! |
| L0888 | `lessons[17].teacher.segments[21].subtitleEn` | goodbye | …rown-up. Next, go and talk with Birimo! Bye-bye! | …rown-up. Next, go and talk with Birimo! See you! |
| L0890 | `lessons[19].teacher.segments[21].say` | goodbye | …d reasons! Next, go and talk with Riko! Bye-bye! | …d reasons! Next, go and talk with Riko! See you! |
| L0890 | `lessons[19].teacher.segments[21].subtitleEn` | goodbye | …d reasons! Next, go and talk with Riko! Bye-bye! | …d reasons! Next, go and talk with Riko! See you! |
| L0892 | `lessons[21].teacher.segments[20].say` | goodbye | …da, too. Next, go and talk with Birimo! Bye-bye! | …da, too. Next, go and talk with Birimo! See you! |
| L0892 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …da, too. Next, go and talk with Birimo! Bye-bye! | …da, too. Next, go and talk with Birimo! See you! |
| L0894 | `lessons[23].teacher.segments[20].say` | goodbye | …utta, too. Next, go and talk with Riko! Bye-bye! | …utta, too. Next, go and talk with Riko! See you! |
| L0894 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …utta, too. Next, go and talk with Riko! Bye-bye! | …utta, too. Next, go and talk with Riko! See you! |
| L0896 | `lessons[25].teacher.segments[20].say` | goodbye | …l words. Next, go and talk with Birimo! Bye-bye! | …l words. Next, go and talk with Birimo! See you! |
| L0896 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | …l words. Next, go and talk with Birimo! Bye-bye! | …l words. Next, go and talk with Birimo! See you! |
| L0898 | `lessons[27].teacher.segments[19].say` | goodbye | …an answer. Next, go and talk with Riko! Bye-bye! | …an answer. Next, go and talk with Riko! See you! |
| L0898 | `lessons[27].teacher.segments[19].subtitleEn` | goodbye | …an answer. Next, go and talk with Riko! Bye-bye! | …an answer. Next, go and talk with Riko! See you! |
| L0900 | `lessons[29].teacher.segments[20].say` | goodbye | …World thirty-one, the Corridor of Time! Bye-bye! | …World thirty-one, the Corridor of Time! See you! |
| L0900 | `lessons[29].teacher.segments[20].subtitleEn` | goodbye | …World thirty-one, the Corridor of Time! Bye-bye! | …World thirty-one, the Corridor of Time! See you! |
| L0902 | `lessons[1].teacher.segments[20].say` | goodbye | …many days. Next, go and talk with Riko! Bye-bye! | …many days. Next, go and talk with Riko! See you! |
| L0902 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …many days. Next, go and talk with Riko! Bye-bye! | …many days. Next, go and talk with Riko! See you! |
| L0904 | `lessons[3].teacher.segments[21].say` | goodbye | … better? Next, go and talk with Birimo! Bye-bye! | … better? Next, go and talk with Birimo! See you! |
| L0904 | `lessons[3].teacher.segments[21].subtitleEn` | goodbye | … better? Next, go and talk with Birimo! Bye-bye! | … better? Next, go and talk with Birimo! See you! |
| L0906 | `lessons[5].teacher.segments[20].say` | goodbye | …ead years! Next, go and talk with Riko! Bye-bye! | …ead years! Next, go and talk with Riko! See you! |
| L0906 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | …ead years! Next, go and talk with Riko! Bye-bye! | …ead years! Next, go and talk with Riko! See you! |
| L0908 | `lessons[7].teacher.segments[21].say` | goodbye | …decades. Next, go and talk with Birimo! Bye-bye! | …decades. Next, go and talk with Birimo! See you! |
| L0908 | `lessons[7].teacher.segments[21].subtitleEn` | goodbye | …decades. Next, go and talk with Birimo! Bye-bye! | …decades. Next, go and talk with Birimo! See you! |
| L0910 | `lessons[9].teacher.segments[21].say` | goodbye | …gears now! Next, go and talk with Riko! Bye-bye! | …gears now! Next, go and talk with Riko! See you! |
| L0910 | `lessons[9].teacher.segments[21].subtitleEn` | goodbye | …gears now! Next, go and talk with Riko! Bye-bye! | …gears now! Next, go and talk with Riko! See you! |
| L0911 | `lessons[10].teacher.segments[19].say` | goodbye | …ans build. Next, go and talk with Kiko! Bye-bye! | …ans build. Next, go and talk with Kiko! See you! |
| L0911 | `lessons[10].teacher.segments[19].subtitleEn` | goodbye | …ans build. Next, go and talk with Kiko! Bye-bye! | …ans build. Next, go and talk with Kiko! See you! |
| L0913 | `lessons[12].teacher.segments[20].say` | goodbye | …he result. Next, go and talk with Haru! Bye-bye! | …he result. Next, go and talk with Haru! See you! |
| L0913 | `lessons[12].teacher.segments[20].subtitleEn` | goodbye | …he result. Next, go and talk with Haru! Bye-bye! | …he result. Next, go and talk with Haru! See you! |
| L0915 | `lessons[14].teacher.segments[20].say` | goodbye | …r is ours! Next, go and talk with Kiko! Bye-bye! | …r is ours! Next, go and talk with Kiko! See you! |
| L0915 | `lessons[14].teacher.segments[20].subtitleEn` | goodbye | …r is ours! Next, go and talk with Kiko! Bye-bye! | …r is ours! Next, go and talk with Kiko! See you! |
| L0916 | `lessons[15].teacher.segments[20].say` | goodbye | …finally. Next, go and talk with Birimo! Bye-bye! | …finally. Next, go and talk with Birimo! See you! |
| L0916 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …finally. Next, go and talk with Birimo! Bye-bye! | …finally. Next, go and talk with Birimo! See you! |
| L0918 | `lessons[17].teacher.segments[12].say` | goodbye | …lop! Now wave from the train window. Bye-bye, mountains! | …lop! Now wave from the train window. Bye, mountains! |
| L0918 | `lessons[17].teacher.segments[12].subtitleEn` | goodbye | …lop! Now wave from the train window. Bye-bye, mountains! | …lop! Now wave from the train window. Bye, mountains! |
| L0918 | `lessons[17].teacher.segments[20].say` | goodbye | …venty-two. Next, go and talk with Riko! Bye-bye! | …venty-two. Next, go and talk with Riko! See you! |
| L0918 | `lessons[17].teacher.segments[20].subtitleEn` | goodbye | …venty-two. Next, go and talk with Riko! Bye-bye! | …venty-two. Next, go and talk with Riko! See you! |
| L0920 | `lessons[19].teacher.segments[20].say` | goodbye | …is ours! Next, go and talk with Birimo! Bye-bye! | …is ours! Next, go and talk with Birimo! See you! |
| L0920 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …is ours! Next, go and talk with Birimo! Bye-bye! | …is ours! Next, go and talk with Birimo! See you! |
| L0922 | `lessons[21].teacher.segments[20].say` | goodbye | …ld kinder. Next, go and talk with Riko! Bye-bye! | …ld kinder. Next, go and talk with Riko! See you! |
| L0922 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …ld kinder. Next, go and talk with Riko! Bye-bye! | …ld kinder. Next, go and talk with Riko! See you! |
| L0924 | `lessons[23].teacher.segments[20].say` | goodbye | …ur time. Next, go and talk with Birimo! Bye-bye! | …ur time. Next, go and talk with Birimo! See you! |
| L0924 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …ur time. Next, go and talk with Birimo! Bye-bye! | …ur time. Next, go and talk with Birimo! See you! |
| L0926 | `lessons[25].teacher.segments[20].say` | goodbye | …our dream! Next, go and talk with Riko! Bye-bye! | …our dream! Next, go and talk with Riko! See you! |
| L0926 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | …our dream! Next, go and talk with Riko! Bye-bye! | …our dream! Next, go and talk with Riko! See you! |
| L0928 | `lessons[27].teacher.segments[20].say` | goodbye | …example. Next, go and talk with Birimo! Bye-bye! | …example. Next, go and talk with Birimo! See you! |
| L0928 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | …example. Next, go and talk with Birimo! Bye-bye! | …example. Next, go and talk with Birimo! See you! |
| L0930 | `lessons[29].teacher.segments[20].say` | goodbye | …orld thirty-two, the Desert of the Sun! Bye-bye! | …orld thirty-two, the Desert of the Sun! See you! |
| L0930 | `lessons[29].teacher.segments[20].subtitleEn` | goodbye | …orld thirty-two, the Desert of the Sun! Bye-bye! | …orld thirty-two, the Desert of the Sun! See you! |
| L0933 | `lessons[2].teacher.segments[20].say` | goodbye | …omes from. Next, go and talk with Haru! Bye-bye! | …omes from. Next, go and talk with Haru! See you! |
| L0933 | `lessons[2].teacher.segments[20].subtitleEn` | goodbye | …omes from. Next, go and talk with Haru! Bye-bye! | …omes from. Next, go and talk with Haru! See you! |
| L0936 | `lessons[5].teacher.segments[20].say` | goodbye | …ith not. Next, go and talk with Birimo! Bye-bye! | …ith not. Next, go and talk with Birimo! See you! |
| L0936 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | …ith not. Next, go and talk with Birimo! Bye-bye! | …ith not. Next, go and talk with Birimo! See you! |
| L0938 | `lessons[7].teacher.segments[20].say` | goodbye | …s with to. Next, go and talk with Riko! Bye-bye! | …s with to. Next, go and talk with Riko! See you! |
| L0938 | `lessons[7].teacher.segments[20].subtitleEn` | goodbye | …s with to. Next, go and talk with Riko! Bye-bye! | …s with to. Next, go and talk with Riko! See you! |
| L0940 | `lessons[9].teacher.segments[20].say` | goodbye | …ng quiz. Next, go and talk with Birimo! Bye-bye! | …ng quiz. Next, go and talk with Birimo! See you! |
| L0940 | `lessons[9].teacher.segments[20].subtitleEn` | goodbye | …ng quiz. Next, go and talk with Birimo! Bye-bye! | …ng quiz. Next, go and talk with Birimo! See you! |
| L0942 | `lessons[11].teacher.segments[20].say` | goodbye | …irections. Next, go and talk with Riko! Bye-bye! | …irections. Next, go and talk with Riko! See you! |
| L0942 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …irections. Next, go and talk with Riko! Bye-bye! | …irections. Next, go and talk with Riko! See you! |
| L0944 | `lessons[13].teacher.segments[20].say` | goodbye | …e it is. Next, go and talk with Birimo! Bye-bye! | …e it is. Next, go and talk with Birimo! See you! |
| L0944 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …e it is. Next, go and talk with Birimo! Bye-bye! | …e it is. Next, go and talk with Birimo! See you! |
| L0946 | `lessons[15].teacher.segments[20].say` | goodbye | …g numbers. Next, go and talk with Riko! Bye-bye! | …g numbers. Next, go and talk with Riko! See you! |
| L0946 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …g numbers. Next, go and talk with Riko! Bye-bye! | …g numbers. Next, go and talk with Riko! See you! |
| L0949 | `lessons[18].teacher.segments[21].say` | goodbye | … decimals. Next, go and talk with Haru! Bye-bye! | … decimals. Next, go and talk with Haru! See you! |
| L0949 | `lessons[18].teacher.segments[21].subtitleEn` | goodbye | … decimals. Next, go and talk with Haru! Bye-bye! | … decimals. Next, go and talk with Haru! See you! |
| L0952 | `lessons[21].teacher.segments[20].say` | goodbye | …changed. Next, go and talk with Birimo! Bye-bye! | …changed. Next, go and talk with Birimo! See you! |
| L0952 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …changed. Next, go and talk with Birimo! Bye-bye! | …changed. Next, go and talk with Birimo! See you! |
| L0955 | `lessons[24].teacher.segments[20].say` | goodbye | …op counts. Next, go and talk with Kiko! Bye-bye! | …op counts. Next, go and talk with Kiko! See you! |
| L0955 | `lessons[24].teacher.segments[20].subtitleEn` | goodbye | …op counts. Next, go and talk with Kiko! Bye-bye! | …op counts. Next, go and talk with Kiko! See you! |
| L0958 | `lessons[27].teacher.segments[21].say` | goodbye | …r opinion. Next, go and talk with Riko! Bye-bye! | …r opinion. Next, go and talk with Riko! See you! |
| L0958 | `lessons[27].teacher.segments[21].subtitleEn` | goodbye | …r opinion. Next, go and talk with Riko! Bye-bye! | …r opinion. Next, go and talk with Riko! See you! |
| L0960 | `lessons[29].teacher.segments[14].say` | goodbye | …dbye to Fen, Humphrey, and Dr. Mira. Bye-bye, friends! | …dbye to Fen, Humphrey, and Dr. Mira. Bye, friends! |
| L0960 | `lessons[29].teacher.segments[14].subtitleEn` | goodbye | …dbye to Fen, Humphrey, and Dr. Mira. Bye-bye, friends! | …dbye to Fen, Humphrey, and Dr. Mira. Bye, friends! |
| L0962 | `lessons[1].teacher.segments[20].say` | goodbye | …errupting. Next, go and talk with Riko! Bye-bye! | …errupting. Next, go and talk with Riko! See you! |
| L0962 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …errupting. Next, go and talk with Riko! Bye-bye! | …errupting. Next, go and talk with Riko! See you! |
| L0964 | `lessons[3].teacher.segments[20].say` | goodbye | …islands. Next, go and talk with Birimo! Bye-bye! | …islands. Next, go and talk with Birimo! See you! |
| L0964 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …islands. Next, go and talk with Birimo! Bye-bye! | …islands. Next, go and talk with Birimo! See you! |
| L0966 | `lessons[5].teacher.segments[20].say` | goodbye | …stay safe. Next, go and talk with Riko! Bye-bye! | …stay safe. Next, go and talk with Riko! See you! |
| L0966 | `lessons[5].teacher.segments[20].subtitleEn` | goodbye | …stay safe. Next, go and talk with Riko! Bye-bye! | …stay safe. Next, go and talk with Riko! See you! |
| L0968 | `lessons[7].teacher.segments[20].say` | goodbye | …ogether. Next, go and talk with Birimo! Bye-bye! | …ogether. Next, go and talk with Birimo! See you! |
| L0968 | `lessons[7].teacher.segments[20].subtitleEn` | goodbye | …ogether. Next, go and talk with Birimo! Bye-bye! | …ogether. Next, go and talk with Birimo! See you! |
| L0970 | `lessons[9].teacher.segments[20].say` | goodbye | …e shining. Next, go and talk with Riko! Bye-bye! | …e shining. Next, go and talk with Riko! See you! |
| L0970 | `lessons[9].teacher.segments[20].subtitleEn` | goodbye | …e shining. Next, go and talk with Riko! Bye-bye! | …e shining. Next, go and talk with Riko! See you! |
| L0972 | `lessons[11].teacher.segments[21].say` | goodbye | …its are. Next, go and talk with Birimo! Bye-bye! | …its are. Next, go and talk with Birimo! See you! |
| L0972 | `lessons[11].teacher.segments[21].subtitleEn` | goodbye | …its are. Next, go and talk with Birimo! Bye-bye! | …its are. Next, go and talk with Birimo! See you! |
| L0974 | `lessons[13].teacher.segments[21].say` | goodbye | …h because. Next, go and talk with Riko! Bye-bye! | …h because. Next, go and talk with Riko! See you! |
| L0974 | `lessons[13].teacher.segments[21].subtitleEn` | goodbye | …h because. Next, go and talk with Riko! Bye-bye! | …h because. Next, go and talk with Riko! See you! |
| L0976 | `lessons[15].teacher.segments[21].say` | goodbye | …r voice. Next, go and talk with Birimo! Bye-bye! | …r voice. Next, go and talk with Birimo! See you! |
| L0976 | `lessons[15].teacher.segments[21].subtitleEn` | goodbye | …r voice. Next, go and talk with Birimo! Bye-bye! | …r voice. Next, go and talk with Birimo! See you! |
| L0978 | `lessons[17].teacher.segments[20].say` | goodbye | …our voice. Next, go and talk with Riko! Bye-bye! | …our voice. Next, go and talk with Riko! See you! |
| L0978 | `lessons[17].teacher.segments[20].subtitleEn` | goodbye | …our voice. Next, go and talk with Riko! Bye-bye! | …our voice. Next, go and talk with Riko! See you! |
| L0980 | `lessons[19].teacher.segments[20].say` | goodbye | …is here. Next, go and talk with Birimo! Bye-bye! | …is here. Next, go and talk with Birimo! See you! |
| L0980 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …is here. Next, go and talk with Birimo! Bye-bye! | …is here. Next, go and talk with Birimo! See you! |
| L0981 | `lessons[20].teacher.segments[18].say` | goodbye | …u say? A, Let's lift it together. B, Bye-bye! Think! | …u say? A, Let's lift it together. B, Bye! Think! |
| L0981 | `lessons[20].teacher.segments[18].subtitleEn` | goodbye | …u say? A, Let's lift it together. B, Bye-bye! Think! | …u say? A, Let's lift it together. B, Bye! Think! |
| L0982 | `lessons[21].teacher.segments[20].say` | goodbye | …thank you. Next, go and talk with Riko! Bye-bye! | …thank you. Next, go and talk with Riko! See you! |
| L0982 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …thank you. Next, go and talk with Riko! Bye-bye! | …thank you. Next, go and talk with Riko! See you! |
| L0984 | `lessons[23].teacher.segments[20].say` | goodbye | … helped. Next, go and talk with Birimo! Bye-bye! | … helped. Next, go and talk with Birimo! See you! |
| L0984 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | … helped. Next, go and talk with Birimo! Bye-bye! | … helped. Next, go and talk with Birimo! See you! |
| L0986 | `lessons[25].teacher.segments[20].say` | goodbye | …make sure. Next, go and talk with Riko! Bye-bye! | …make sure. Next, go and talk with Riko! See you! |
| L0986 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | …make sure. Next, go and talk with Riko! Bye-bye! | …make sure. Next, go and talk with Riko! See you! |
| L0988 | `lessons[27].teacher.segments[20].say` | goodbye | …st well. Next, go and talk with Birimo! Bye-bye! | …st well. Next, go and talk with Birimo! See you! |
| L0988 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | …st well. Next, go and talk with Birimo! Bye-bye! | …st well. Next, go and talk with Birimo! See you! |
| L0990 | `lessons[29].teacher.segments[20].say` | goodbye | …orld thirty-four, the Airport of Wings! Bye-bye! | …orld thirty-four, the Airport of Wings! See you! |
| L0990 | `lessons[29].teacher.segments[20].subtitleEn` | goodbye | …orld thirty-four, the Airport of Wings! Bye-bye! | …orld thirty-four, the Airport of Wings! See you! |
| L0992 | `lessons[1].teacherScript` | goodbye | …lerk puts a baggage tag on each one. Bye-bye, bags! See you later! Birimo tries to c… | …lerk puts a baggage tag on each one. Bye, bags! See you later! Birimo tries to c… |
| L0992 | `lessons[1].conversation.lines[6].en` | goodbye | Two bags, please. Bye-bye, bags! See you later! | Two bags, please. Bye, bags! See you later! |
| L0992 | `lessons[1].teacher.segments[7].say` | goodbye | …ecking? Riko says, Two bags, please. Bye-bye, bags! | …ecking? Riko says, Two bags, please. Bye, bags! |
| L0992 | `lessons[1].teacher.segments[7].subtitleEn` | goodbye | …ecking? Riko says, Two bags, please. Bye-bye, bags! | …ecking? Riko says, Two bags, please. Bye, bags! |
| L0993 | `lessons[2].teacher.segments[20].say` | goodbye | …t numbers. Next, go and talk with Haru! Bye-bye! | …t numbers. Next, go and talk with Haru! See you! |
| L0993 | `lessons[2].teacher.segments[20].subtitleEn` | goodbye | …t numbers. Next, go and talk with Haru! Bye-bye! | …t numbers. Next, go and talk with Haru! See you! |
| L0996 | `lessons[5].teacher.segments[19].say` | goodbye | … better. Next, go and talk with Birimo! Bye-bye! | … better. Next, go and talk with Birimo! See you! |
| L0996 | `lessons[5].teacher.segments[19].subtitleEn` | goodbye | … better. Next, go and talk with Birimo! Bye-bye! | … better. Next, go and talk with Birimo! See you! |
| L1002 | `lessons[11].teacher.segments[19].say` | goodbye | …e letters. Next, go and talk with Riko! Bye-bye! | …e letters. Next, go and talk with Riko! See you! |
| L1002 | `lessons[11].teacher.segments[19].subtitleEn` | goodbye | …e letters. Next, go and talk with Riko! Bye-bye! | …e letters. Next, go and talk with Riko! See you! |
| L1004 | `lessons[13].teacher.segments[19].say` | goodbye | …y words. Next, go and talk with Birimo! Bye-bye! | …y words. Next, go and talk with Birimo! See you! |
| L1004 | `lessons[13].teacher.segments[19].subtitleEn` | goodbye | …y words. Next, go and talk with Birimo! Bye-bye! | …y words. Next, go and talk with Birimo! See you! |
| L1005 | `lessons[14].teacher.segments[5].say` | goodbye | … leave the hotel. Give back the key. Bye-bye, hotel! Check-out! | … leave the hotel. Give back the key. Bye, hotel! Check-out! |
| L1005 | `lessons[14].teacher.segments[5].subtitleEn` | goodbye | … leave the hotel. Give back the key. Bye-bye, hotel! Check-out! | … leave the hotel. Give back the key. Bye, hotel! Check-out! |
| L1006 | `lessons[15].teacher.segments[19].say` | goodbye | …the hotel! Next, go and talk with Riko! Bye-bye! | …the hotel! Next, go and talk with Riko! See you! |
| L1006 | `lessons[15].teacher.segments[19].subtitleEn` | goodbye | …the hotel! Next, go and talk with Riko! Bye-bye! | …the hotel! Next, go and talk with Riko! See you! |
| L1008 | `lessons[17].teacher.segments[19].say` | goodbye | …e words. Next, go and talk with Birimo! Bye-bye! | …e words. Next, go and talk with Birimo! See you! |
| L1008 | `lessons[17].teacher.segments[19].subtitleEn` | goodbye | …e words. Next, go and talk with Birimo! Bye-bye! | …e words. Next, go and talk with Birimo! See you! |
| L1012 | `lessons[21].teacher.segments[20].say` | goodbye | …e check. Next, go and talk with Birimo! Bye-bye! | …e check. Next, go and talk with Birimo! See you! |
| L1012 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …e check. Next, go and talk with Birimo! Bye-bye! | …e check. Next, go and talk with Birimo! See you! |
| L1014 | `lessons[23].teacher.segments[19].say` | goodbye | …ee things. Next, go and talk with Riko! Bye-bye! | …ee things. Next, go and talk with Riko! See you! |
| L1014 | `lessons[23].teacher.segments[19].subtitleEn` | goodbye | …ee things. Next, go and talk with Riko! Bye-bye! | …ee things. Next, go and talk with Riko! See you! |
| L1016 | `lessons[25].teacher.segments[20].say` | goodbye | … kindly. Next, go and talk with Birimo! Bye-bye! | … kindly. Next, go and talk with Birimo! See you! |
| L1016 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | … kindly. Next, go and talk with Birimo! Bye-bye! | … kindly. Next, go and talk with Birimo! See you! |
| L1018 | `lessons[27].teacher.segments[20].say` | goodbye | … feelings. Next, go and talk with Riko! Bye-bye! | … feelings. Next, go and talk with Riko! See you! |
| L1018 | `lessons[27].teacher.segments[20].subtitleEn` | goodbye | … feelings. Next, go and talk with Riko! Bye-bye! | … feelings. Next, go and talk with Riko! See you! |
| L1022 | `lessons[1].teacher.segments[20].say` | goodbye | …oint, but. Next, go and talk with Riko! Bye-bye! | …oint, but. Next, go and talk with Riko! See you! |
| L1022 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …oint, but. Next, go and talk with Riko! Bye-bye! | …oint, but. Next, go and talk with Riko! See you! |
| L1023 | `lessons[2].teacherScript` | agree | …eo says, I like that idea. Kiko says, Me, too, but let's ask the teachers what th… | …eo says, I like that idea. Kiko says, Me too, but let's ask the teachers what th… |
| L1024 | `lessons[3].teacher.segments[20].say` | goodbye | …y a few. Next, go and talk with Birimo! Bye-bye! | …y a few. Next, go and talk with Birimo! See you! |
| L1024 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …y a few. Next, go and talk with Birimo! Bye-bye! | …y a few. Next, go and talk with Birimo! See you! |
| L1027 | `lessons[6].teacher.segments[20].say` | goodbye | … don't we. Next, go and talk with Kiko! Bye-bye! | … don't we. Next, go and talk with Kiko! See you! |
| L1027 | `lessons[6].teacher.segments[20].subtitleEn` | goodbye | … don't we. Next, go and talk with Kiko! Bye-bye! | … don't we. Next, go and talk with Kiko! See you! |
| L1028 | `lessons[7].teacher.segments[13].say` | repeat-teacher | Once more, calmly. Breathe! Hand up! Next to you… | One more time, calmly. Breathe! Hand up! Next to you… |
| L1028 | `lessons[7].teacher.segments[13].subtitleEn` | repeat-teacher | Once more, calmly. Breathe! Hand up! Next to you… | One more time, calmly. Breathe! Hand up! Next to you… |
| L1032 | `lessons[11].teacher.segments[20].say` | goodbye | … strong. Next, go and talk with Birimo! Bye-bye! | … strong. Next, go and talk with Birimo! See you! |
| L1032 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | … strong. Next, go and talk with Birimo! Bye-bye! | … strong. Next, go and talk with Birimo! See you! |
| L1034 | `lessons[13].teacher.segments[20].say` | goodbye | …rd strong. Next, go and talk with Riko! Bye-bye! | …rd strong. Next, go and talk with Riko! See you! |
| L1034 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …rd strong. Next, go and talk with Riko! Bye-bye! | …rd strong. Next, go and talk with Riko! See you! |
| L1036 | `lessons[15].teacher.segments[20].say` | goodbye | …l words. Next, go and talk with Birimo! Bye-bye! | …l words. Next, go and talk with Birimo! See you! |
| L1036 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …l words. Next, go and talk with Birimo! Bye-bye! | …l words. Next, go and talk with Birimo! See you! |
| L1038 | `lessons[17].teacher.segments[20].say` | goodbye | …mal words. Next, go and talk with Riko! Bye-bye! | …mal words. Next, go and talk with Riko! See you! |
| L1038 | `lessons[17].teacher.segments[20].subtitleEn` | goodbye | …mal words. Next, go and talk with Riko! Bye-bye! | …mal words. Next, go and talk with Riko! See you! |
| L1040 | `lessons[19].teacher.segments[20].say` | goodbye | …matters! Next, go and talk with Birimo! Bye-bye! | …matters! Next, go and talk with Birimo! See you! |
| L1040 | `lessons[19].teacher.segments[20].subtitleEn` | goodbye | …matters! Next, go and talk with Birimo! Bye-bye! | …matters! Next, go and talk with Birimo! See you! |
| L1042 | `lessons[21].teacher.segments[20].say` | goodbye | …ur planet. Next, go and talk with Riko! Bye-bye! | …ur planet. Next, go and talk with Riko! See you! |
| L1042 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …ur planet. Next, go and talk with Riko! Bye-bye! | …ur planet. Next, go and talk with Riko! See you! |
| L1044 | `lessons[23].teacher.segments[20].say` | goodbye | …ngs are. Next, go and talk with Birimo! Bye-bye! | …ngs are. Next, go and talk with Birimo! See you! |
| L1044 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …ngs are. Next, go and talk with Birimo! Bye-bye! | …ngs are. Next, go and talk with Birimo! See you! |
| L1047 | `lessons[26].teacher.segments[20].say` | goodbye | …as a team. Next, go and talk with Kiko! Bye-bye! | …as a team. Next, go and talk with Kiko! See you! |
| L1047 | `lessons[26].teacher.segments[20].subtitleEn` | goodbye | …as a team. Next, go and talk with Kiko! Bye-bye! | …as a team. Next, go and talk with Kiko! See you! |
| L1052 | `lessons[1].teacher.segments[19].say` | goodbye | …with to. Next, go and talk with Birimo! Bye-bye! | …with to. Next, go and talk with Birimo! See you! |
| L1052 | `lessons[1].teacher.segments[19].subtitleEn` | goodbye | …with to. Next, go and talk with Birimo! Bye-bye! | …with to. Next, go and talk with Birimo! See you! |
| L1054 | `lessons[3].teacher.segments[20].say` | goodbye | …ach other. Next, go and talk with Riko! Bye-bye! | …ach other. Next, go and talk with Riko! See you! |
| L1054 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | …ach other. Next, go and talk with Riko! Bye-bye! | …ach other. Next, go and talk with Riko! See you! |
| L1057 | `lessons[6].teacher.segments[19].say` | goodbye | …formation. Next, go and talk with Haru! Bye-bye! | …formation. Next, go and talk with Haru! See you! |
| L1057 | `lessons[6].teacher.segments[19].subtitleEn` | goodbye | …formation. Next, go and talk with Haru! Bye-bye! | …formation. Next, go and talk with Haru! See you! |
| L1059 | `lessons[8].teacher.segments[19].say` | goodbye | … reliable. Next, go and talk with Kiko! Bye-bye! | … reliable. Next, go and talk with Kiko! See you! |
| L1059 | `lessons[8].teacher.segments[19].subtitleEn` | goodbye | … reliable. Next, go and talk with Kiko! Bye-bye! | … reliable. Next, go and talk with Kiko! See you! |
| L1062 | `lessons[11].teacher.segments[20].say` | goodbye | … big idea. Next, go and talk with Riko! Bye-bye! | … big idea. Next, go and talk with Riko! See you! |
| L1062 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | … big idea. Next, go and talk with Riko! Bye-bye! | … big idea. Next, go and talk with Riko! See you! |
| L1064 | `lessons[13].teacher.segments[20].say` | goodbye | … commas. Next, go and talk with Birimo! Bye-bye! | … commas. Next, go and talk with Birimo! See you! |
| L1064 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | … commas. Next, go and talk with Birimo! Bye-bye! | … commas. Next, go and talk with Birimo! See you! |
| L1066 | `lessons[15].teacher.segments[20].say` | goodbye | …gist does! Next, go and talk with Riko! Bye-bye! | …gist does! Next, go and talk with Riko! See you! |
| L1066 | `lessons[15].teacher.segments[20].subtitleEn` | goodbye | …gist does! Next, go and talk with Riko! Bye-bye! | …gist does! Next, go and talk with Riko! See you! |
| L1069 | `lessons[18].teacher.segments[20].say` | goodbye | …ike a pro. Next, go and talk with Haru! Bye-bye! | …ike a pro. Next, go and talk with Haru! See you! |
| L1069 | `lessons[18].teacher.segments[20].subtitleEn` | goodbye | …ike a pro. Next, go and talk with Haru! Bye-bye! | …ike a pro. Next, go and talk with Haru! See you! |
| L1072 | `lessons[21].teacher.segments[20].say` | goodbye | …degrees. Next, go and talk with Birimo! Bye-bye! | …degrees. Next, go and talk with Birimo! See you! |
| L1072 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …degrees. Next, go and talk with Birimo! Bye-bye! | …degrees. Next, go and talk with Birimo! See you! |
| L1074 | `lessons[23].teacher.segments[20].say` | goodbye | …ilometers. Next, go and talk with Riko! Bye-bye! | …ilometers. Next, go and talk with Riko! See you! |
| L1074 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …ilometers. Next, go and talk with Riko! Bye-bye! | …ilometers. Next, go and talk with Riko! See you! |
| L1076 | `lessons[25].teacher.segments[20].say` | goodbye | …isagree. Next, go and talk with Birimo! Bye-bye! | …isagree. Next, go and talk with Birimo! See you! |
| L1076 | `lessons[25].teacher.segments[20].subtitleEn` | goodbye | …isagree. Next, go and talk with Birimo! Bye-bye! | …isagree. Next, go and talk with Birimo! See you! |
| L1078 | `lessons[27].teacher.segments[21].say` | goodbye | …nd a fact. Next, go and talk with Riko! Bye-bye! | …nd a fact. Next, go and talk with Riko! See you! |
| L1078 | `lessons[27].teacher.segments[21].subtitleEn` | goodbye | …nd a fact. Next, go and talk with Riko! Bye-bye! | …nd a fact. Next, go and talk with Riko! See you! |
| L1079 | `lessons[28].teacher.segments[2].say` | goodbye | …t visit to all your favorite places. Bye-bye, aquarium! Goodbye tour! | …t visit to all your favorite places. Bye, aquarium! Goodbye tour! |
| L1079 | `lessons[28].teacher.segments[2].subtitleEn` | goodbye | …t visit to all your favorite places. Bye-bye, aquarium! Goodbye tour! | …t visit to all your favorite places. Bye, aquarium! Goodbye tour! |
| L1081 | `lessons[0].teacher.segments[18].say` | goodbye | …d tremble. Next, go and talk with Haru! Bye-bye! | …d tremble. Next, go and talk with Haru! See you! |
| L1081 | `lessons[0].teacher.segments[18].subtitleEn` | goodbye | …d tremble. Next, go and talk with Haru! Bye-bye! | …d tremble. Next, go and talk with Haru! See you! |
| L1084 | `lessons[3].teacher.segments[18].say` | goodbye | … common. Next, go and talk with Birimo! Bye-bye! | … common. Next, go and talk with Birimo! See you! |
| L1084 | `lessons[3].teacher.segments[18].subtitleEn` | goodbye | … common. Next, go and talk with Birimo! Bye-bye! | … common. Next, go and talk with Birimo! See you! |
| L1087 | `lessons[6].teacher.segments[20].say` | goodbye | …und words. Next, go and talk with Kiko! Bye-bye! | …und words. Next, go and talk with Kiko! See you! |
| L1087 | `lessons[6].teacher.segments[20].subtitleEn` | goodbye | …und words. Next, go and talk with Kiko! Bye-bye! | …und words. Next, go and talk with Kiko! See you! |
| L1089 | `lessons[8].teacher.segments[20].say` | goodbye | …o a story. Next, go and talk with Haru! Bye-bye! | …o a story. Next, go and talk with Haru! See you! |
| L1089 | `lessons[8].teacher.segments[20].subtitleEn` | goodbye | …o a story. Next, go and talk with Haru! Bye-bye! | …o a story. Next, go and talk with Haru! See you! |
| L1092 | `lessons[11].teacher.segments[20].say` | goodbye | …nd wish! Next, go and talk with Birimo! Bye-bye! | …nd wish! Next, go and talk with Birimo! See you! |
| L1092 | `lessons[11].teacher.segments[20].subtitleEn` | goodbye | …nd wish! Next, go and talk with Birimo! Bye-bye! | …nd wish! Next, go and talk with Birimo! See you! |
| L1094 | `lessons[13].teacher.segments[20].say` | goodbye | …ig moment. Next, go and talk with Riko! Bye-bye! | …ig moment. Next, go and talk with Riko! See you! |
| L1094 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | …ig moment. Next, go and talk with Riko! Bye-bye! | …ig moment. Next, go and talk with Riko! See you! |
| L1100 | `lessons[19].teacher.segments[19].say` | goodbye | … of you! Next, go and talk with Birimo! Bye-bye! | … of you! Next, go and talk with Birimo! See you! |
| L1100 | `lessons[19].teacher.segments[19].subtitleEn` | goodbye | … of you! Next, go and talk with Birimo! Bye-bye! | … of you! Next, go and talk with Birimo! See you! |
| L1102 | `lessons[21].teacher.segments[20].say` | goodbye | …eir faces. Next, go and talk with Riko! Bye-bye! | …eir faces. Next, go and talk with Riko! See you! |
| L1102 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …eir faces. Next, go and talk with Riko! Bye-bye! | …eir faces. Next, go and talk with Riko! See you! |
| L1104 | `lessons[23].teacher.segments[20].say` | goodbye | …changed. Next, go and talk with Birimo! Bye-bye! | …changed. Next, go and talk with Birimo! See you! |
| L1104 | `lessons[23].teacher.segments[20].subtitleEn` | goodbye | …changed. Next, go and talk with Birimo! Bye-bye! | …changed. Next, go and talk with Birimo! See you! |
| L1109 | `lessons[28].teacher.segments[20].say` | goodbye | …If I were. Next, go and talk with Haru! Bye-bye! | …If I were. Next, go and talk with Haru! See you! |
| L1109 | `lessons[28].teacher.segments[20].subtitleEn` | goodbye | …If I were. Next, go and talk with Haru! Bye-bye! | …If I were. Next, go and talk with Haru! See you! |
| L1112 | `lessons[1].teacher.segments[21].say` | goodbye | …r heart. Next, go and talk with Birimo! Bye-bye! | …r heart. Next, go and talk with Birimo! See you! |
| L1112 | `lessons[1].teacher.segments[21].subtitleEn` | goodbye | …r heart. Next, go and talk with Birimo! Bye-bye! | …r heart. Next, go and talk with Birimo! See you! |
| L1114 | `lessons[3].teacher.segments[21].say` | goodbye | … you feel. Next, go and talk with Haru! Bye-bye! | … you feel. Next, go and talk with Haru! See you! |
| L1114 | `lessons[3].teacher.segments[21].subtitleEn` | goodbye | … you feel. Next, go and talk with Haru! Bye-bye! | … you feel. Next, go and talk with Haru! See you! |
| L1122 | `lessons[11].teacher.segments[19].say` | goodbye | …nd kindly. Next, go and talk with Riko! Bye-bye! | …nd kindly. Next, go and talk with Riko! See you! |
| L1122 | `lessons[11].teacher.segments[19].subtitleEn` | goodbye | …nd kindly. Next, go and talk with Riko! Bye-bye! | …nd kindly. Next, go and talk with Riko! See you! |
| L1124 | `lessons[13].teacher.segments[20].say` | goodbye | … voices. Next, go and talk with Birimo! Bye-bye! | … voices. Next, go and talk with Birimo! See you! |
| L1124 | `lessons[13].teacher.segments[20].subtitleEn` | goodbye | … voices. Next, go and talk with Birimo! Bye-bye! | … voices. Next, go and talk with Birimo! See you! |
| L1126 | `lessons[15].teacher.segments[19].say` | goodbye | …ew idioms. Next, go and talk with Riko! Bye-bye! | …ew idioms. Next, go and talk with Riko! See you! |
| L1126 | `lessons[15].teacher.segments[19].subtitleEn` | goodbye | …ew idioms. Next, go and talk with Riko! Bye-bye! | …ew idioms. Next, go and talk with Riko! See you! |
| L1128 | `lessons[17].teacher.segments[17].say` | goodbye | …ne wins. Next, go and talk with Birimo! Bye-bye! | …ne wins. Next, go and talk with Birimo! See you! |
| L1128 | `lessons[17].teacher.segments[17].subtitleEn` | goodbye | …ne wins. Next, go and talk with Birimo! Bye-bye! | …ne wins. Next, go and talk with Birimo! See you! |
| L1130 | `lessons[19].teacher.segments[21].say` | goodbye | …us friend. Next, go and talk with Riko! Bye-bye! | …us friend. Next, go and talk with Riko! See you! |
| L1130 | `lessons[19].teacher.segments[21].subtitleEn` | goodbye | …us friend. Next, go and talk with Riko! Bye-bye! | …us friend. Next, go and talk with Riko! See you! |
| L1132 | `lessons[21].teacher.segments[20].say` | goodbye | …questions. Next, go and talk with Kiko! Bye-bye! | …questions. Next, go and talk with Kiko! See you! |
| L1132 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …questions. Next, go and talk with Kiko! Bye-bye! | …questions. Next, go and talk with Kiko! See you! |
| L1135 | `lessons[24].teacher.segments[20].say` | goodbye | … big hand. Next, go and talk with Kiko! Bye-bye! | … big hand. Next, go and talk with Kiko! See you! |
| L1135 | `lessons[24].teacher.segments[20].subtitleEn` | goodbye | … big hand. Next, go and talk with Kiko! Bye-bye! | … big hand. Next, go and talk with Kiko! See you! |
| L1137 | `lessons[26].teacher.segments[20].say` | goodbye | …an to you. Next, go and talk with Haru! Bye-bye! | …an to you. Next, go and talk with Haru! See you! |
| L1137 | `lessons[26].teacher.segments[20].subtitleEn` | goodbye | …an to you. Next, go and talk with Haru! Bye-bye! | …an to you. Next, go and talk with Haru! See you! |
| L1139 | `lessons[28].teacher.segments[19].say` | goodbye | …for you. Next, go and talk with Birimo! Bye-bye! | …for you. Next, go and talk with Birimo! See you! |
| L1139 | `lessons[28].teacher.segments[19].subtitleEn` | goodbye | …for you. Next, go and talk with Birimo! Bye-bye! | …for you. Next, go and talk with Birimo! See you! |
| L1142 | `lessons[1].teacher.segments[20].say` | goodbye | …leftovers. Next, go and talk with Riko! Bye-bye! | …leftovers. Next, go and talk with Riko! See you! |
| L1142 | `lessons[1].teacher.segments[20].subtitleEn` | goodbye | …leftovers. Next, go and talk with Riko! Bye-bye! | …leftovers. Next, go and talk with Riko! See you! |
| L1144 | `lessons[3].teacher.segments[20].say` | goodbye | … borrow. Next, go and talk with Birimo! Bye-bye! | … borrow. Next, go and talk with Birimo! See you! |
| L1144 | `lessons[3].teacher.segments[20].subtitleEn` | goodbye | … borrow. Next, go and talk with Birimo! Bye-bye! | … borrow. Next, go and talk with Birimo! See you! |
| L1147 | `lessons[6].teacher.segments[19].say` | goodbye | …g numbers. Next, go and talk with Kiko! Bye-bye! | …g numbers. Next, go and talk with Kiko! See you! |
| L1147 | `lessons[6].teacher.segments[19].subtitleEn` | goodbye | …g numbers. Next, go and talk with Kiko! Bye-bye! | …g numbers. Next, go and talk with Kiko! See you! |
| L1149 | `lessons[8].teacher.segments[19].say` | goodbye | …d percent. Next, go and talk with Haru! Bye-bye! | …d percent. Next, go and talk with Haru! See you! |
| L1149 | `lessons[8].teacher.segments[19].subtitleEn` | goodbye | …d percent. Next, go and talk with Haru! Bye-bye! | …d percent. Next, go and talk with Haru! See you! |
| L1152 | `lessons[11].teacher.segments[19].say` | goodbye | …believe. Next, go and talk with Birimo! Bye-bye! | …believe. Next, go and talk with Birimo! See you! |
| L1152 | `lessons[11].teacher.segments[19].subtitleEn` | goodbye | …believe. Next, go and talk with Birimo! Bye-bye! | …believe. Next, go and talk with Birimo! See you! |
| L1154 | `lessons[13].teacher.segments[19].say` | goodbye | …ther idea. Next, go and talk with Riko! Bye-bye! | …ther idea. Next, go and talk with Riko! See you! |
| L1154 | `lessons[13].teacher.segments[19].subtitleEn` | goodbye | …ther idea. Next, go and talk with Riko! Bye-bye! | …ther idea. Next, go and talk with Riko! See you! |
| L1158 | `lessons[17].teacher.segments[19].say` | goodbye | …onclusion. Next, go and talk with Riko! Bye-bye! | …onclusion. Next, go and talk with Riko! See you! |
| L1158 | `lessons[17].teacher.segments[19].subtitleEn` | goodbye | …onclusion. Next, go and talk with Riko! Bye-bye! | …onclusion. Next, go and talk with Riko! See you! |
| L1162 | `lessons[21].teacher.segments[20].say` | goodbye | …l nervous. Next, go and talk with Riko! Bye-bye! | …l nervous. Next, go and talk with Riko! See you! |
| L1162 | `lessons[21].teacher.segments[20].subtitleEn` | goodbye | …l nervous. Next, go and talk with Riko! Bye-bye! | …l nervous. Next, go and talk with Riko! See you! |
| L1169 | `lessons[28].teacher.segments[19].say` | goodbye | …thank you. Next, go and talk with Haru! Bye-bye! | …thank you. Next, go and talk with Haru! See you! |
| L1169 | `lessons[28].teacher.segments[19].subtitleEn` | goodbye | …thank you. Next, go and talk with Haru! Bye-bye! | …thank you. Next, go and talk with Haru! See you! |
| L1172 | `lessons[1].teacherScript` | goodbye | …y, a girl named Kiko waved and said, Bye-bye, Haru! A few days later, a round, fluff… | …y, a girl named Kiko waved and said, Bye, Haru! A few days later, a round, fluff… |
| L1172 | `lessons[1].teacher.segments[19].say` | goodbye | …nd snow. Next, go and talk with Birimo! Bye-bye! | …nd snow. Next, go and talk with Birimo! See you! |
| L1172 | `lessons[1].teacher.segments[19].subtitleEn` | goodbye | …nd snow. Next, go and talk with Birimo! Bye-bye! | …nd snow. Next, go and talk with Birimo! See you! |
| L1182 | `lessons[11].teacher.segments[21].say` | goodbye | … own idea. Next, go and talk with Riko! Bye-bye! | … own idea. Next, go and talk with Riko! See you! |
| L1182 | `lessons[11].teacher.segments[21].subtitleEn` | goodbye | … own idea. Next, go and talk with Riko! Bye-bye! | … own idea. Next, go and talk with Riko! See you! |
| L1184 | `lessons[13].teacher.segments[21].say` | goodbye | …st idea. Next, go and talk with Birimo! Bye-bye! | …st idea. Next, go and talk with Birimo! See you! |
| L1184 | `lessons[13].teacher.segments[21].subtitleEn` | goodbye | …st idea. Next, go and talk with Birimo! Bye-bye! | …st idea. Next, go and talk with Birimo! See you! |
| L1187 | `lessons[16].teacher.segments[21].say` | goodbye | …st of all. Next, go and talk with Kiko! Bye-bye! | …st of all. Next, go and talk with Kiko! See you! |
| L1187 | `lessons[16].teacher.segments[21].subtitleEn` | goodbye | …st of all. Next, go and talk with Kiko! Bye-bye! | …st of all. Next, go and talk with Kiko! See you! |
| L1189 | `lessons[18].teacher.segments[21].say` | goodbye | … the star. Next, go and talk with Haru! Bye-bye! | … the star. Next, go and talk with Haru! See you! |
| L1189 | `lessons[18].teacher.segments[21].subtitleEn` | goodbye | … the star. Next, go and talk with Haru! Bye-bye! | … the star. Next, go and talk with Haru! See you! |
| L1192 | `lessons[21].teacher.segments[21].say` | goodbye | …ou, too! Next, go and talk with Birimo! Bye-bye! | …ou, too! Next, go and talk with Birimo! See you! |
| L1192 | `lessons[21].teacher.segments[21].subtitleEn` | goodbye | …ou, too! Next, go and talk with Birimo! Bye-bye! | …ou, too! Next, go and talk with Birimo! See you! |

## アプリの コード（手で なおした もの・`npm run english:lint -- --src` で 見つけた）

| file | rule | before | after |
|---|---|---|---|
| src/lib/teacherVideo/export.ts（先生の 動画の 字幕・TPR の まち時間） | classroom | (Do it with your body!) | (Act it out!) |
