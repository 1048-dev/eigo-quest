# Eigo Quest English Style Guide (run9)

This guide covers every piece of English in the product: lesson items, conversation lines, AI tasks, teacher scripts (say, subtitles, slides), recap, test items, library stories, chants and talk themes.
The checker `npm run english:lint` (scripts/english-lint.ts) enforces the mechanical parts. The rule IDs in **[brackets]** match the lint output.

> にほんごメモ: この ガイドは「ネイティブの 先生が こどもに ふつうに いう 英語」に そろえるための きまりです。
> 機械で しらべられる ところは `npm run english:lint` が チェックします（[ ] の 中が ルール名）。

---

## 1. The standard

- **American English only.** US spelling, US words, US punctuation (periods and commas inside quotes, `Ms.` with a period).
  （アメリカ英語に そろえる。イギリス英語の つづり・ことばは つかわない）
- **Natural, warm, child-directed.** Write what a friendly American elementary school teacher would really say to a 6–12-year-old, or what a child would really say to a friend.
  （「教科書の 英語」ではなく、ほんとうに 口から 出る 英語）
- **Short and clear.** One idea per sentence. One new thing at a time.
- **Original sentences only.** No textbook text, no song lyrics, no company or product names.
- **The smallest natural fix wins.** When a line is fine, leave it alone. Do not rewrite for taste.

## 2. Register and length by stage

Count words per sentence (contractions count as one word). The lint warns above the maximum **[sentence-length]**.

| Stage | Worlds | Level | Max words / sentence | Sweet spot | Vocabulary and grammar |
|---|---|---|---|---|---|
| 1 | 1–12 | Pre-A1 → A1 | 8 | 3–6 | Concrete nouns, colors, numbers, feelings, simple verbs. Present tense, `I like / I can / I have / This is`. Lots of `!` and repetition. |
| 2 | 13–20 | A1 → A2 | 12 | 5–9 | Daily routines, past tense of common verbs, `want to`, `going to`, simple `because`. |
| 3 | 21–28 | A2 → A2+ | 15 | 6–11 | Comparisons, `have been / have done`, short opinions with reasons, polite requests. |
| 4 | 29–35 | A2+ → B1 | 18 | 7–13 | Relative clauses, `if` sentences, giving advice, telling short stories. |
| 5 | 36–40 | B1 → B1+ | 22 | 8–15 | Opinions, pros and cons, reported speech, presentations. Still kid-friendly topics. |

- Teacher subtitles follow the same limits as the stage. Split long lines into two sentences rather than adding commas.
- Use words a child of that age uses. Prefer `big` to `enormous` in Stage 1–2, `happy` to `delighted`, `kids` and `friends` to `children` and `classmates` in casual talk.
- New vocabulary: one new word or pattern per line when possible. Recycle old words around the new one.

## 3. Contractions

Spoken English uses contractions. Use them in conversations, teacher talk and stories **[contraction]** (info level).

| Stiff | Natural |
|---|---|
| I am happy. | I'm happy. |
| It is sunny. | It's sunny. |
| Do not run! | Don't run! |
| Let us go. | Let's go. |
| I do not know. | I don't know. |
| That is great! | That's great! |

Full forms are fine when they are the teaching point (`I am ~.` on a grammar slide), for emphasis (`I *am* ready!`), or in short answers that cannot contract (`Yes, I am.` — never `Yes, I'm.`).
（短縮形が ふつう。文法の 説明で わざと 分けて 書く ときと、`Yes, I am.` のような 答えは そのままで OK）

## 4. Natural classroom language

Use these instead of translated Japanese classroom phrases.

| Situation | Natural (use) | Avoid |
|---|---|---|
| Start | Hi, everyone! / Good morning, everyone! / Are you ready? | Let's start the lesson. Please be quiet. |
| Listen | Listen. / Listen carefully. / Can you hear it? | Please listen to me. |
| Repeat | Say it with me. / Your turn! / One more time! / Repeat after me. | Please repeat. Repeat, please. |
| Look | Look at this! / Look at the picture. | Please look at here. |
| Try | Let's try! / Give it a try! / You try! | Let's challenge! Please try your best. |
| Thinking | Hmm, what do you think? / Take your time. | Please think. |
| Done | All done! / That's it for today! / Great job today! | Thank you for your hard work. That's all. |
| Bye | See you next time! / Bye for now! / See you! | Good bye. |

### "Please" commands
In English, `Please + verb` is polite to adults, but from a teacher to a child it can sound cold or like a scolding (`Please sit down.`). Prefer `Can you ~?`, `Let's ~.`, `Your turn to ~.` or a plain friendly imperative (`Sit down, everyone!`) **[please-command]**.
（「Please ～.」は こどもに いうと「〜しなさい」に きこえる ことが ある。`Can you ～?` や ふつうの めいれい文で）

### "Let's ~!"
`Let's ~!` is natural, but Japanese materials overuse it. Use at most about three per lesson and mix in `Now ~`, `Time to ~!`, `Ready? ~`, `Can you ~?`, `Your turn!` **[lets-overuse]**.
（Let's は べんりだけど つかいすぎ注意。1レッスン 3回くらいまで）

## 5. Stiff or Japanese-English patterns to avoid

**[stiff-phrase]** (warn) / **[grammar-habit]** (error)

| Avoid | Use instead | Note |
|---|---|---|
| I'm fine, thank you. And you? | I'm good! How about you? / Great, thanks! You? | 教科書の 決まり文句。じっさいは あまり いわない |
| And you? (alone) | How about you? / You? | |
| I very like it. | I really like it. / I like it a lot. | very は 動詞の 前に こない |
| very very ~ | really ~ / super ~ / so ~ | very の 重ねすぎ |
| Let's enjoy! / Please enjoy. | Have fun! / Let's have fun! | enjoy は 目的語が いる |
| Let's challenge! | Let's try it! / Give it a try! | challenge は「挑戦する」の いみで 動詞に しない |
| Let's study English. | Let's learn some English! / Let's practice! | study は かたい |
| Fight! (as a cheer) | You can do it! / Go, go! | 「ファイト！」は 和製英語 |
| Do your best. | You can do it! / Give it your best! (both OK) | info: 間違いではない |
| Thank you for your hard work. | Great job today! / Nice work! | 「おつかれさま」の 直訳 |
| What is your hobby? | What do you like to do for fun? | hobby は 大人っぽく かたい |
| I'm boring. (= 退屈) | I'm bored. | boring は「つまらない もの」 |
| I'm exciting. | I'm excited. | |
| go to home / go to there | go home / go there | |
| in Monday / in night | on Monday / at night | |
| at morning | in the morning | |
| a homework / homeworks | homework / some homework | 数えられない名詞 |
| an information / informations | information / some information | |
| a bread / breads | bread / a piece of bread | |
| a advice / advices | advice / some advice | |
| a apple / an banana | an apple / a banana | a / an は 発音で きめる |
| Please look at here. | Look here! / Look at this! | |
| My pace | at my own pace | |
| Stage clear! / Game clear! | You did it! / Level complete! | 和製英語 |

### Wasei-eigo (Japanese-made English) **[wasei-eigo]**

| Avoid | Use (US) |
|---|---|
| mansion (=マンション) | apartment / apartment building |
| consent (=コンセント) | outlet |
| sharp pencil | mechanical pencil |
| note PC | laptop |
| baby car | stroller |
| salaryman | office worker |
| cunning (=カンニング) | cheating |
| trump (=トランプ) | cards / playing cards |
| free size | one size fits all |
| high tension | excited / hyper |
| skinship | hugs / cuddles |
| pierce (=ピアス) | earrings |
| short cake | strawberry shortcake / cake |
| gasoline stand | gas station |
| white board | whiteboard |
| naive (=繊細) | sensitive |

### UK words and spellings **[uk-spelling]** (error) / **[uk-word]** (warn)

| UK | US |
|---|---|
| colour, favourite, neighbour, flavour, behaviour, honour | color, favorite, neighbor, flavor, behavior, honor |
| centre, theatre, metre, litre | center, theater, meter, liter |
| organise, realise, apologise, recognise | organize, realize, apologize, recognize |
| travelled, travelling, cancelled | traveled, traveling, canceled |
| grey, pyjamas, jewellery, programme, tyre | gray, pajamas, jewelry, program, tire |
| mum, maths | mom, math |
| rubber (eraser) | eraser |
| biscuit (cookie) | cookie |
| sweets | candy (sweets is OK for "sweet things") |
| rubbish, dustbin | trash, trash can |
| trousers, jumper, trainers | pants, sweater, sneakers |
| lorry, petrol, car park | truck, gas, parking lot |
| queue | line |
| holiday (time off school) | vacation / break (holiday = a special day like a national holiday) |
| football (the sport) | soccer |
| autumn | fall (autumn is OK in poems, prefer fall) |
| film | movie |
| toilet | bathroom / restroom |
| timetable | schedule |
| Have you got ~? | Do you have ~? |
| at the weekend | on the weekend |
| Year 3 | third grade |

## 6. Grammar habits Japanese writers fall into

- **Articles**: singular countable nouns need `a/an/the/my` (`I have a dog.` not `I have dog.`). Use `a/an` by **sound**: `an apple, an hour, a uniform, a unicorn, a one-way street`.
- **Plurals after numbers and "some/many"**: `two cats`, `many friends`. `I like dogs.` (general = plural), not `I like dog.`
- **Uncountable nouns**: homework, information, advice, bread, money, music, rain, snow, furniture, luggage — no `a`, no `-s`.
- **Time prepositions**: `on Monday`, `on my birthday`, `in the morning`, `at night`, `at 7:00`, `in July`, `on the weekend` (US).
- **"Very"**: `very` modifies adjectives, not verbs. `I really like it.` / `It's very fun.` is common; `It's so much fun!` is more natural.
- **"Fun" vs "funny"**: fun = enjoyable, funny = makes you laugh.
- **Answer the question asked**: `Do you like cats? — Yes, I do.` (not `Yes, I like.`)
- **Literal translations**: don't translate Japanese set phrases (いただきます, よろしく, おつかれさま, がんばって). Say what an American would say in that moment.

## 7. Punctuation and capitalization **[punctuation]**

- ASCII punctuation only in English: straight quotes `'` `"`, three periods `...` (not `…`), no full-width `！？。、，．：；` inside English.
- One space between sentences. No space before `, . ! ?`. One space after them (`Hi! I'm Riko.`).
- No `!!` or `?!` (one `!` is enough). Use `!` for excitement, not for every line.
- Start each sentence with a capital letter. `I` is always capital.
- Conversation lines and story lines end with `.`, `!` or `?`. Vocabulary items (single words) have no period and are lowercase unless they are names (`Monday`, `Japan`).
- `Ms. Emma` (period, no `Miss`, no `Mrs.`).
- `OK` (capitals), not `Okay` or `ok`.
- `T-shirt`, `email`, `goodbye`, `cannot`.
- Placeholder `～` is allowed only in pattern fields (grammar, target expressions, slides): `I like ～.` Never in a spoken line or story.
- Commas before names in direct address: `Thank you, Haru!` `Good morning, Ms. Emma!`
- Times and dates: `7:30`, `at seven`, `July 4`. Numbers one to ten in words in stories.

## 8. How Ms. Emma talks

Ms. Emma is warm, upbeat and calm. She talks **to** the child, not **about** the lesson.

- Short sentences. One instruction at a time. Pause after a question.
- She uses the child's world: school, family, food, games, animals, seasons.
- She praises the **effort and the specific thing**: `You said "apple" so clearly!` rather than only `Good.`
- **Praise variety** (rotate; don't repeat the same one twice in a row):
  `Great job! / Nice! / Awesome! / You got it! / Well done! / Perfect! / That's right! / Way to go! / Good thinking! / I love it! / So close! / Nice try!`
- When a child is wrong: `Good try! Let's listen again.` / `Almost! Try one more time.` — never `No.` or `Wrong.`
- Transitions: `Now, ~` / `Next, ~` / `Here's a quiz!` / `Ready?` / `Time for sounds!`
- Questions she asks: `What's this?` `Can you say it?` `Which one?` `What do you think?` `How about you?`
- Endings: `Great job today! See you next time!` / `You did so well. Bye for now!`
- Japanese in `say`: kind, simple, hiragana-heavy, like a teacher speaking to a 1st grader. English words inside Japanese stay in natural English form.

## 9. Recurring expressions and names **[inconsistent-form]** **[name]**

Keep these exactly the same everywhere:

| Canonical | Not |
|---|---|
| Ms. Emma | Ms Emma, Miss Emma, Mrs. Emma, Emma-sensei, teacher Emma |
| Haru, Riko, Birimo, Kiko (and other cast names in scripts/english-words.txt) | lowercase or alternate spellings |
| OK | Okay, ok |
| goodbye | good-bye, good bye |
| T-shirt | t-shirt, tshirt, T shirt |
| email | e-mail |
| cannot | can not |
| See you! / See you next time! | See you again next time! (stacked) |
| Nice to meet you. / Nice to meet you, too. | Nice to meet you too (no comma is OK in US, but stay consistent: use the comma) |

For everyday functions (hello, goodbye, how are you, thanks, sorry, praise, asking to repeat, agreeing, asking for things, opinions …) the one canonical form per stage, the allowed variants and the stage each variant is introduced, and the forms to avoid are in **docs/phrasebook.md** (generated by `npm run phrasebook:doc`; enforced by the `phrasebook` lint rule).
（毎日の 表現の「1つの 言いかた」は docs/phrasebook.md）

The lint also groups identical expressions that differ only in internal punctuation, capitalization or hyphens across the checked range and reports the variants.

## 10. Japanese side

- English and Japanese must mean the same thing. Don't add or drop information (a joke, a name, a number).
- Japanese for kids: hiragana-heavy, katakana for loanwords, kanji only where the product already uses it (小1, 学校, etc.), short phrases with spaces between bunsetsu like the rest of the product (`きょうは はれ`).
- Keep the friendly tone: `〜してね`, `〜だよ`, `〜かな？`. Avoid commands like `〜しなさい`.

## 11. Lint rules reference

| Rule | Level | What it checks |
|---|---|---|
| spelling | error | Unknown word (cspell en-US + scripts/english-words.txt) |
| uk-spelling | error | UK spelling (colour, centre, organise, grey, mum, maths ...) |
| uk-word | warn | UK word choice (biscuit, rubbish, holiday, autumn, film, Have you got ...) |
| wasei-eigo | warn | Japanese-made English (mansion, consent, sharp pencil ...) |
| stiff-phrase | warn | Textbook or translated phrases (I'm fine, thank you. And you? / Let's enjoy ...) |
| grammar-habit | error | Typical errors (I very like, a homework, in Monday, a apple ...) |
| please-command | warn | `Please + verb` at the start of a teacher/character line |
| lets-overuse | info | More than 3 `Let's` in one lesson |
| contraction | info | `I am / it is / do not ...` in spoken lines (consider contracting) |
| sentence-length | warn | Sentence longer than the stage maximum |
| punctuation | error / warn | Non-ASCII punctuation, spacing, `!!`, missing end mark, `～` in spoken lines |
| capitalization | warn | Sentence starting lowercase, lowercase `i` |
| name | error | Cast name in wrong case or misspelled (one letter off) |
| canonical | error | Non-canonical form of a recurring expression (Ms Emma, Okay, e-mail ...) |
| duplicate | warn | The same line twice in a row in a conversation or story |
| near-duplicate | info | Two lines in one lesson that differ by 1–2 letters (typo?) |
| inconsistent-form | warn | The same expression written with different internal punctuation/casing across the range |
| phrasebook | error | Non-canonical form of an everyday function (greetings, thanks, praise, agreeing …): an avoid form, or a variant used outside the stages where it is introduced on purpose. Data: scripts/lib/phrasebook.ts, table: **docs/phrasebook.md** (run10). Also checks app text in `src/` and `worksheets/` (`--src`). |

Words that are correct but unknown to the dictionary (cast names, Japanese foods, phonics letter groups) go into `scripts/english-words.txt`. Add a word only after checking it is really correct.
