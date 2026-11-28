# Eigo Quest Phrasebook（フレーズブック）

<!-- 自動生成: npm run phrasebook:doc（データは scripts/lib/phrasebook.ts）。この ファイルを 手で かえない -->

One canonical way to say each everyday function, for each stage. American English, natural spoken style, the way a friendly US elementary teacher and US kids really talk.
This file is generated from `scripts/lib/phrasebook.ts`; the same data drives the `phrasebook` rule of `npm run english:lint` and the auto-fixer `npm run phrasebook:fix`.

> にほんごメモ: おなじ はたらき（あいさつ・おれい・ほめる …）の 英語は、ステージごとに **1つの 言いかた（Canonical）** に そろえます。
> べつの 言いかたは **わざと 入れる ステージ** を きめて つかいます（Allowed variants）。**Avoid** は つかわない 形と 理由です。
> 英語が わからなくても、`npm run english:lint` の `phrasebook` が 0 なら この きまりが まもられて います。

## How the lint uses this

- **Avoid** rows marked ✓ are always an **error** (`phrasebook` rule). Rows without ✓ depend on context and are checked by other rules (stiff-phrase, wasei-eigo, grammar-habit) or by review.
- **Allowed variants** marked ✓ are an **error outside their stage range**: before `from` (not taught yet) or after `to` (no longer fits the age).
- App text (UI strings, templates in `src/`, workbook templates in `worksheets/`) is shown to every stage, so it may not use variants that have an upper stage limit (e.g. `Bye-bye`) and may not use avoid forms. (`npm run english:lint -- --src`)
- `✓ auto-fix` = `npm run phrasebook:fix` rewrites it (log: docs/run10/changes/phrasebook.md).
- **First lesson** and **Uses** are counted from `content/` when this file is generated (lessons, library, 力だめし).
- To use a listed form on purpose somewhere else, add the unit to `allowUnits` in the data, with a comment.

| Stage | Worlds | Lessons | Age (approx.) |
|---|---|---|---|
| 1 | 1–12 | 1–360 | 6–8 |
| 2 | 13–20 | 361–600 | 7–9 |
| 3 | 21–28 | 601–840 | 8–10 |
| 4 | 29–35 | 841–1050 | 9–11 |
| 5 | 36–40 | 1051–1200 | 10–12 |

Reasons: **British** · **stiff / formal** · **textbook-only** · **unnatural** · **too babyish for the age** · **can sound rude** · **Japanese-made English** · **grammar error** · **house style (one spelling)**

## Contents

1. Greetings（あいさつ（会った とき））
2. How are you?（げんき？（ちょうしを きく・こたえる））
3. Asking and telling names（なまえを きく・いう）
4. Meeting someone（はじめまして）
5. Goodbyes（さようなら・またね）
6. Thanking（ありがとう・どういたしまして）
7. Apologizing（ごめんね・いいよ）
8. Praise（ほめる）
9. Encouragement（はげます）
10. Classroom instructions（教室の 指示）
11. Asking kids to repeat（まねして いってね（先生））
12. Asking someone to say it again（ききかえす（こども））
13. Turn-taking（じゅんばん）
14. Agreeing and disagreeing（さんせい・はんたい）
15. Asking for things（たのむ・ほしい ものを いう）
16. Handing something over（はい、どうぞ）
17. Inviting and suggesting（さそう・ていあんする）
18. Offering（すすめる・こたえる）
19. Giving opinions and reasons（いけん・りゆう）
20. Feelings（きもち）
21. Asking about words（ことばの しつもん）
22. Checking understanding (teacher)（わかったか たしかめる（先生））
23. Starting and ending a speech（スピーチの はじめと おわり）
24. One spelling for compound words (run11)（ふくごう語の つづりを 1つに）

## Greetings（あいさつ（会った とき））

id: `greeting`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Hello!` `Hi!` | Kids to kids and to the teacher. Both are taught in L1. |
| 1–5 | `Hello, everyone!` | Ms. Emma opening a lesson. |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Good morning! / Good afternoon! / Good evening! | 1+ | L3 | 322 / 164 / 58 / 48 / 48 |  | Time-of-day greetings (school textbook unit). |
| Hi, everyone! / Good morning, everyone! | 1+ | L4 | 139 / 160 / 96 / 137 / 107 |  | Teacher opening. |
| Welcome back! | 1+ | L71 | 23 / 13 / 13 / 9 / 5 |  | Teacher opening for a lesson that continues a story. |
| Hi there! / Hey! | 1+ | L84 | 24 / 47 / 17 / 17 / 20 |  | Casual, between friends. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| How do you do? | **stiff / formal** — Very formal and old-fashioned; American kids never say it. | Nice to meet you. | ✓ auto-fix |
| Good day! | **British** — British / Australian and old-fashioned as a greeting in the US. | Hello! / Hi! | ✓ |
| Let's start the lesson. | **textbook-only** — Translated classroom Japanese (授業を はじめます). Sounds cold. | Hello, everyone! Are you ready? | ✓ |

## How are you?（げんき？（ちょうしを きく・こたえる））

id: `how-are-you`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `How are you?` |  |
| 1–5 | `I'm good.` `I'm great!` `I'm OK.` | Answers. Add a feeling word: I'm tired. / I'm hungry. |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| I'm fine, thanks. | 1+ | L3 | 13 / 0 / 0 / 0 / 0 |  | School textbook answer. Natural with "thanks" (L3). |
| How are you doing? / How's it going? | 3+ | - | 0 / 0 / 0 / 0 / 0 | ✓ | Casual questions for older kids. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| I'm so-so. | **textbook-only** — Japanese-textbook answer (まあまあ). Americans say "I'm OK." The word so-so is fine for things (The movie was so-so.). | I'm OK. | ✓ auto-fix |
| So-so? (as a reply) | **textbook-only** — Same as above. | Just OK? | ✓ auto-fix |
| I'm fine, thank you. And you? | **textbook-only** — The classic textbook chain. Checked by the stiff-phrase rule. | I'm good! How about you? | （文脈で きまる・ほかの ルール） |

## Asking and telling names（なまえを きく・いう）

id: `name`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `What's your name?` `I'm ～.` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| My name is ～. | 1+ | L181 | 118 / 0 / 1 / 0 / 0 |  | Self-introductions and speeches (school textbook form). |
| Call me ～. | 2+ | L612 | 0 / 0 / 7 / 0 / 0 |  | Nicknames. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| What is your name? | **stiff / formal** — Uncontracted in speech sounds like a form or a police officer. | What's your name? | ✓ auto-fix |
| May I have your name? | **stiff / formal** — Adult customer-service phrase. | What's your name? | ✓ |

## Meeting someone（はじめまして）

id: `meeting`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Nice to meet you.` `Nice to meet you, too.` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| It's nice to meet you. | 2+ | L826 | 0 / 0 / 4 / 0 / 0 |  |  |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Nice to meet you too. | **house style (one spelling)** — House style: comma before a final "too" in a sentence (only the two-word reply is "Me too"). | Nice to meet you, too. | ✓ auto-fix |
| Pleased to meet you. / Glad to meet you. | **stiff / formal** — Formal adult forms. | Nice to meet you. | ✓ auto-fix |

## Goodbyes（さようなら・またね）

id: `goodbye`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Bye!` `See you!` `Goodbye!` | Kids to kids. |
| 1–5 | `Great job today! See you!` | Ms. Emma's sign-off at the end of a lesson (also the built-in template). |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Bye-bye! | 1–2 | L2 | 250 / 188 / 0 / 0 / 0 | ✓ auto-fix | Warm with 6–8-year-olds. From Stage 3 it sounds babyish from a teacher: use See you! / Bye! |
| See you next time! / See you tomorrow! / See you later! / See you soon! | 1+ | L2 | 135 / 50 / 46 / 17 / 2 |  |  |
| Bye for now! / Take care! / Have a nice day! | 1+ | L70 | 78 / 37 / 62 / 2 / 6 |  |  |
| Good night! | 1+ | L102 | 76 / 47 / 32 / 0 / 1 |  | Only when going to bed or leaving at night. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Bye, bye / Bye bye | **house style (one spelling)** — One spelling: Bye-bye (Stage 1–2). | Bye-bye! | ✓ auto-fix |
| See you again! | **textbook-only** — Translation of また あおうね. In the US it sounds like you won't meet for a long time. | See you next time! | ✓ auto-fix |
| Good bye | **house style (one spelling)** — Checked by the stiff-phrase and canonical rules. | Goodbye! / Bye! | （文脈で きまる・ほかの ルール） |
| That's all for today. | **textbook-only** — Translated classroom Japanese. Checked by stiff-phrase. | That's it for today! / Great job today! | （文脈で きまる・ほかの ルール） |

## Thanking（ありがとう・どういたしまして）

id: `thanks`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Thank you!` `Thanks!` |  |
| 1–5 | `You're welcome!` | Reply. |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Thank you very much! | 1+ | L150 | 3 / 1 / 0 / 2 / 1 |  |  |
| Thank you for ～. | 1+ | L117 | 310 / 191 / 196 / 209 / 139 |  | Thank you for listening. (speeches) |
| No problem! | 2+ | L549 | 0 / 6 / 21 / 1 / 21 | ✓ | Casual reply to thanks or to a request. |
| No worries! | 3+ | - | 0 / 0 / 0 / 0 / 0 | ✓ auto-fix | Casual; Stage 1–2 use No problem! (one casual reply). |
| My pleasure. | 4+ | L1004 | 0 / 0 / 0 / 2 / 0 | ✓ | Polite (hotel, guide). |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Not at all. (reply to Thank you) | **British** — British reply to thanks. (Not at all. as the answer to Would you mind ～? is correct US English.) | You're welcome! | （文脈で きまる・ほかの ルール） |
| Don't mention it. | **stiff / formal** — Dated. | You're welcome! | ✓ auto-fix |

## Apologizing（ごめんね・いいよ）

id: `apology`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `I'm sorry.` `Sorry!` |  |
| 1–5 | `That's OK.` `It's OK.` | Reply. |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Excuse me. | 1+ | L164 | 35 / 25 / 88 / 99 / 8 |  | Bumping into someone / getting attention. |
| Don't worry about it. | 2+ | - | 0 / 0 / 0 / 0 / 0 |  |  |
| No problem. / No worries. | 2+ | L549 | 0 / 6 / 21 / 1 / 21 |  | See Thanking. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Don't mind! | **Japanese-made English** — ドンマイ is Japanese-made English. | Don't worry! / It's OK! | ✓ auto-fix |
| Never mind. (reply to Sorry) | **unnatural** — Never mind means "forget what I said", not "it's OK". | That's OK. | （文脈で きまる・ほかの ルール） |
| My bad. | **can sound rude** — Slang; too casual for the app. | Sorry! | ✓ |

## Praise（ほめる）

id: `praise`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Great job!` | Rotate with the variants; don't repeat the same one twice in a row (style guide §8). |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Good job! / Nice! / Awesome! / Perfect! / Excellent! / Wonderful! / Fantastic! / Super! / Cool! | 1+ | L1 | 939 / 647 / 568 / 560 / 323 |  |  |
| You got it! / That's right! / Well done! / Way to go! / Nice work! / Very good! | 1+ | L6 | 157 / 98 / 95 / 130 / 52 |  |  |
| You said "～" so clearly! | 1+ | - | 0 / 0 / 0 / 0 / 0 |  | Praise the specific thing. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Brilliant! | **British** — British praise word. | Awesome! / Great job! | ✓ auto-fix |
| Good boy! / Good girl! (to a child) | **can sound rude** — Sounds like talking to a pet. (OK to a dog, e.g. L869.) | Great job! | （文脈で きまる・ほかの ルール） |

## Encouragement（はげます）

id: `encouragement`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `You can do it!` |  |
| 1–5 | `Good try!` `Nice try!` | After a wrong answer (never No. / Wrong.). |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Don't give up! / Keep going! / Keep trying! / Almost! / So close! / Take your time. | 1+ | L313 | 4 / 114 / 71 / 16 / 40 |  |  |
| Break a leg! | 3+ | L773 | 0 / 0 / 35 / 0 / 0 | ✓ | Idiom before a show (L773). |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Fight! | **Japanese-made English** — ファイト！ Checked by the wasei-eigo rule. | You can do it! / Go, go! | （文脈で きまる・ほかの ルール） |
| Do your best. | **textbook-only** — Not wrong, but a translation of がんばって (info in stiff-phrase). | You can do it! | （文脈で きまる・ほかの ルール） |
| Cheer up! (as がんばって) | **unnatural** — Cheer up means "don't be sad". Correct when a friend is sad (L773). | You can do it! | （文脈で きまる・ほかの ルール） |

## Classroom instructions（教室の 指示）

id: `classroom`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Listen.` `Look!` `Stand up.` `Sit down.` `Raise your hand.` `Point to ～.` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Listen carefully. / Look at this! / Open your book. / Close your book. / Hands up! | 1+ | L14 | 88 / 91 / 69 / 58 / 45 |  |  |
| Can you ～? | 1+ | L27 | 124 / 165 / 295 / 100 / 121 |  | Softer than Please + verb (style guide §4). |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Please listen to me. / Please be quiet. | **stiff / formal** — Please + verb from a teacher sounds like scolding. | Listen! / Quiet voices, please. | ✓ |
| Please look at here. | **grammar error** — Checked by stiff-phrase. | Look here! / Look at this! | （文脈で きまる・ほかの ルール） |
| Do it with your body! | **unnatural** — Word-for-word からだで やってみよう. | Act it out! / Show me! | ✓ auto-fix |

## Asking kids to repeat（まねして いってね（先生））

id: `repeat-teacher`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Say it with me.` `Repeat after me.` `Your turn!` `One more time!` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Now you say it! / Let's say it together! | 1+ | L64 | 2 / 3 / 0 / 0 / 0 |  |  |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Once more! | **stiff / formal** — Literary / British-sounding in a classroom. | One more time! | ✓ auto-fix |
| Repeat again. | **grammar error** — Repeat already means again. | Say it again. / One more time! | ✓ |
| Please repeat. / Repeat, please. | **stiff / formal** — Checked by stiff-phrase. | Say it with me! / Your turn! | （文脈で きまる・ほかの ルール） |

## Asking someone to say it again（ききかえす（こども））

id: `repeat-child`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–2 | `One more time, please.` `Sorry? Can you say that again?` | Taught in L384. |
| 3–5 | `Sorry? Can you say that again?` `Could you say that again?` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Can you speak more slowly, please? / Could you speak more slowly? | 1+ | L328 | 8 / 22 / 0 / 0 / 0 |  | L328, L384. |
| Could you say that again? | 3+ | L826 | 0 / 0 / 7 / 0 / 0 | ✓ | Polite. |
| Pardon? | 5+ | L1184 | 0 / 0 / 0 / 0 / 2 | ✓ | Formal; kids will hear it in tests and from adults (L1184). |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Excuse me? (to ask again) | **can sound rude** — With rising tone it often means "How dare you?" (used that way on purpose in L1088). | Sorry? Can you say that again? | （文脈で きまる・ほかの ルール） |
| What? (alone) | **can sound rude** — Sounds impatient. | Sorry? | （文脈で きまる・ほかの ルール） |
| Once again, please. | **textbook-only** — Translation of もう一度 おねがいします. | One more time, please. | ✓ auto-fix |

## Turn-taking（じゅんばん）

id: `turns`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Your turn!` `My turn!` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| It's your turn. / Who's next? / You go first. | 1+ | L304 | 4 / 28 / 20 / 2 / 3 |  |  |
| After you. | 2+ | L374 | 0 / 4 / 1 / 3 / 3 | ✓ | Polite, letting someone go first. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Next is you. | **unnatural** — Word-for-word つぎは あなた. | You're next! | ✓ auto-fix |

## Agreeing and disagreeing（さんせい・はんたい）

id: `agree`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Me too!` `That's right!` |  |
| 3–5 | `I agree.` `I disagree.` | With a reason: I agree because ～. |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| You're right. / Good idea! / That's a good idea. | 1+ | L77 | 27 / 54 / 55 / 81 / 22 |  |  |
| Me neither. | 2+ | L381 | 0 / 31 / 4 / 0 / 2 | ✓ | After a negative sentence. |
| I think so, too. / I don't think so. | 2+ | L528 | 0 / 50 / 0 / 12 / 0 | ✓ | L528. |
| I agree. / I disagree. / I don't agree. | 3+ | L823 | 0 / 0 / 28 / 137 / 38 | ✓ |  |
| I see your point, but ～. | 3+ | L823 | 0 / 0 / 27 / 254 / 23 | ✓ |  |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Me, too. | **house style (one spelling)** — One spelling for the two-word reply: Me too (no comma, US style). | Me too! | ✓ auto-fix |
| I think so too. | **house style (one spelling)** — House style keeps the comma before a final too in a sentence. | I think so, too. | ✓ auto-fix |
| Me either. | **house style (one spelling)** — Informal; the app teaches Me neither. | Me neither. | ✓ auto-fix |
| I'm agree. | **grammar error** — agree is a verb. | I agree. | ✓ auto-fix |

## Asking for things（たのむ・ほしい ものを いう）

id: `asking`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–3 | `～, please.` `Can I have ～?` |  |
| 4–5 | `Can I have ～?` `Could I have ～?` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| I'd like ～. | 1+ | L216 | 99 / 19 / 8 / 192 / 149 |  | Ordering (school textbook: What would you like? ― I'd like ～.). |
| Could you ～? | 1+ | L328 | 12 / 0 / 125 / 215 / 24 |  | Polite request (L328 Could you speak more slowly?). |
| May I ～? | 2+ | L554 | 0 / 42 / 63 / 20 / 0 | ✓ | Asking permission (school textbook). |
| Could I have ～? | 4+ | L996 | 0 / 0 / 0 / 65 / 7 | ✓ |  |
| Would you mind ～ing? ― Not at all. | 4+ | L1002 | 0 / 0 / 0 / 101 / 0 | ✓ | L1002. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Give me ～. (to ask for something) | **can sound rude** — Sounds demanding. (Give me five! is fine.) | Can I have ～, please? | （文脈で きまる・ほかの ルール） |
| I want ～. (when ordering) | **can sound rude** — Blunt in a shop or restaurant. | I'd like ～. / Can I have ～? | （文脈で きまる・ほかの ルール） |

## Handing something over（はい、どうぞ）

id: `handing`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1 | `Here you are.` | School textbook form, natural US English. |
| 2–5 | `Here you are.` `Here you go.` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Here it is. | 1+ | L149 | 31 / 5 / 5 / 5 / 0 |  |  |
| Here you go. | 2+ | L393 | 0 / 55 / 4 / 4 / 2 | ✓ auto-fix | Casual. Stage 1 keeps one form. |

## Inviting and suggesting（さそう・ていあんする）

id: `inviting`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Let's ～!` `How about ～?` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Do you want to ～? | 2+ | L364 | 0 / 38 / 20 / 25 / 33 | ✓ |  |
| Why don't we ～? | 2+ | L507 | 0 / 80 / 29 / 60 / 0 | ✓ |  |
| Shall we ～? | 2+ | L466 | 0 / 47 / 0 / 1 / 0 | ✓ | School textbook form (L574). Sounds a little formal; prefer Let's ～ in casual talk. |
| Would you like to ～? | 2+ | L426 | 0 / 60 / 1 / 3 / 12 |  | See Offering. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Let's enjoy! / Let's challenge! | **unnatural** — Checked by stiff-phrase. | Have fun! / Let's try it! | （文脈で きまる・ほかの ルール） |

## Offering（すすめる・こたえる）

id: `offering`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1 | `Do you want ～?` `Yes, please.` `No, thank you.` |  |
| 2–5 | `Would you like ～?` `Yes, please.` `No, thank you.` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Would you like ～? | 2+ | L407 | 0 / 151 / 23 / 45 / 13 | ✓ |  |
| No, thanks. | 1+ | - | 0 / 0 / 0 / 0 / 0 |  |  |

## Giving opinions and reasons（いけん・りゆう）

id: `opinion`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1 | `I like ～.` `It's fun!` |  |
| 2–5 | `I think ～.` `～ because ～.` |  |
| 3–5 | `In my opinion, ～.` | L822. |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| ～ because ～. | 1+ | L312 | 141 / 265 / 403 / 634 / 596 |  | Simple reasons (I like dogs because they're cute.). |
| I think ～. | 2+ | L386 | 0 / 309 / 294 / 594 / 204 | ✓ |  |
| In my opinion, ～. | 3+ | L822 | 0 / 0 / 37 / 5 / 0 | ✓ |  |
| What do you think? | 1+ | L274 | 2 / 7 / 30 / 117 / 11 |  | Ms. Emma asks it from Stage 1. |
| What's your opinion? | 3+ | L822 | 0 / 0 / 16 / 2 / 7 |  | L822. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| In my opinion, I think ～. | **unnatural** — Says the same thing twice. | In my opinion, ～. / I think ～. | ✓ auto-fix |
| The reason is because ～. | **grammar error** — Redundant. | The reason is that ～. / ～ because ～. | ✓ auto-fix |

## Feelings（きもち）

id: `feelings`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `I'm happy.` `I'm sad.` `I'm tired.` `I'm hungry.` `I'm sleepy.` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| I'm excited. / I'm nervous. / I'm scared. | 1+ | L118 | 12 / 5 / 113 / 18 / 20 |  |  |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| I'm exciting. / I'm boring. | **grammar error** — Checked by grammar-habit (-ing = the thing, -ed = the person). | I'm excited. / I'm bored. | （文脈で きまる・ほかの ルール） |

## Asking about words（ことばの しつもん）

id: `word-questions`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `What's this?` `How do you spell ～?` `How do you say ～ in English?` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| What does ～ mean? | 2+ | L376 | 0 / 2 / 16 / 37 / 31 | ✓ |  |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| How to say ～? | **unnatural** — Not a question in English. | How do you say ～? | ✓ |

## Checking understanding (teacher)（わかったか たしかめる（先生））

id: `checking`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Ready?` `Got it?` `OK?` |  |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Are you ready? / Does that make sense? | 1+ | L15 | 59 / 26 / 20 / 8 / 21 |  |  |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Do you understand? | **can sound rude** — Can sound condescending from a teacher. | Got it? | ✓ auto-fix |

## Starting and ending a speech（スピーチの はじめと おわり）

id: `speech`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `Let me tell you about ～.` `Thank you for listening.` | L239, L328. |

**Allowed variants**（stage = わざと 入れる ステージ）

| Variant | Stage | First lesson | Uses s1/s2/s3/s4/s5 | Lint | Note |
|---|---|---|---|---|---|
| Hi, everyone! Today I'm going to talk about ～. | 2+ | - | 0 / 0 / 0 / 0 / 0 |  |  |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| Please listen to my speech. | **textbook-only** — Japanese school formula (きいて ください). A real speech just starts. | Let me tell you about ～. | ✓ |

## One spelling for compound words (run11)（ふくごう語の つづりを 1つに）

id: `spelling`

**Canonical**

| Stage | Use | Note |
|---|---|---|
| 1–5 | `seat belt` `tug-of-war` `lunchtime` | The more common US spelling. Learning item IDs use these forms. |

**Avoid**

| Avoid | Why | Use instead | Lint |
|---|---|---|---|
| seatbelt | **house style (one spelling)** — One spelling: seat belt (two words, the more common US form). | seat belt | ✓ auto-fix |
| tug of war | **house style (one spelling)** — One spelling: tug-of-war (hyphenated, the more common US form). | tug-of-war | ✓ auto-fix |
| lunch time | **house style (one spelling)** — One spelling: lunchtime (one word, the more common US form). | lunchtime | ✓ auto-fix |

## Related

- docs/english-style-guide.md — spelling, punctuation, register, stage length limits
- docs/run10/changes/phrasebook.md — every string changed by `phrasebook:fix`
