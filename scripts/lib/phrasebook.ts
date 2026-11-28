/**
 * フレーズブック（run10 Phase 5）: 「おなじ はたらきの ことばは、ステージごとに 1つの 言いかた」。
 *
 *  - docs/phrasebook.md は この データから つくる（npm run phrasebook:doc。--check で 最新か しらべる）
 *  - npm run english:lint の ルール「phrasebook」が つかう（phrasebookIssues）
 *  - npm run phrasebook:fix が つかう（applyPhrasebook。fix が ある ものだけ 自動で なおす）
 *
 * きまり:
 *  - canonical … その ステージで いちばんに つかう 形（ふつうは これ）
 *  - variants  … つかって よい べつの 形。from / to は 「わざと 入れる ステージ」。re が ある ものは
 *                lint が ステージの そとで 見つけたら error（from より 前 = まだ ならって いない、to より 後 = 年れいに あわない）
 *  - avoid     … つかわない 形（理由つき）。re が ある ものは lint が いつでも error。re が ない ものは 文脈で きまるので
 *                ドキュメントだけ（ほかの ルール・人の 目で みる）
 * 正規表現は 英語の 文字列（日本語まじりの 先生の say も）に そのまま あてる。
 */

export type Stage = 1 | 2 | 3 | 4 | 5;
export type AvoidReason = "british" | "stiff" | "textbook" | "unnatural" | "babyish" | "rude" | "wasei" | "grammar" | "consistency";

export const REASON_LABEL: Readonly<Record<AvoidReason, string>> = {
  british: "British",
  stiff: "stiff / formal",
  textbook: "textbook-only",
  unnatural: "unnatural",
  babyish: "too babyish for the age",
  rude: "can sound rude",
  wasei: "Japanese-made English",
  grammar: "grammar error",
  consistency: "house style (one spelling)",
};

/** 文字列を なおす: 置きかえの リスト か 関数 */
export type Fix = { to: string } | ((text: string) => string);

export interface Variant {
  form: string;
  from?: Stage;
  to?: Stage;
  note?: string;
  /** ある ときだけ lint が ステージを しらべる */
  re?: RegExp;
  /** ステージの そとで 見つかった ときの なおしかた */
  fix?: Fix;
}

export interface Avoid {
  form: string;
  reason: AvoidReason;
  why: string;
  use: string;
  /** ない ものは ドキュメントだけ（文脈で きまる・ほかの ルールが みる） */
  re?: RegExp;
  fix?: Fix;
  /** わざと つかう ユニット（L1088 など） */
  allowUnits?: readonly string[];
}

export interface PhraseFunction {
  id: string;
  en: string;
  ja: string;
  canonical: readonly { stages: readonly [Stage, Stage]; forms: readonly string[]; note?: string }[];
  variants: readonly Variant[];
  avoid: readonly Avoid[];
}

/** ステージ 3〜5 の「Bye-bye」: 先生の さいごの あいさつは See you!（すぐ まえに See you が あれば Bye!）、ほかは Bye */
export function fixByeBye(text: string): string {
  let t = text.replace(/Bye-bye!(\s*)$/, (_m, sp: string, off: number) => (/See you/i.test(text.slice(Math.max(0, off - 40), off)) ? `Bye!${sp}` : `See you!${sp}`));
  t = t.replace(/\bBye-bye\b/g, "Bye");
  return t;
}

export const PHRASEBOOK: readonly PhraseFunction[] = [
  {
    id: "greeting",
    en: "Greetings",
    ja: "あいさつ（会った とき）",
    canonical: [
      { stages: [1, 5], forms: ["Hello!", "Hi!"], note: "Kids to kids and to the teacher. Both are taught in L1." },
      { stages: [1, 5], forms: ["Hello, everyone!"], note: "Ms. Emma opening a lesson." },
    ],
    variants: [
      { form: "Good morning! / Good afternoon! / Good evening!", from: 1, note: "Time-of-day greetings (school textbook unit)." },
      { form: "Hi, everyone! / Good morning, everyone!", from: 1, note: "Teacher opening." },
      { form: "Welcome back!", from: 1, note: "Teacher opening for a lesson that continues a story." },
      { form: "Hi there! / Hey!", from: 1, note: "Casual, between friends." },
    ],
    avoid: [
      { form: "How do you do?", reason: "stiff", why: "Very formal and old-fashioned; American kids never say it.", use: "Nice to meet you.", re: /\bHow do you do\?/, fix: { to: "Nice to meet you." } },
      { form: "Good day!", reason: "british", why: "British / Australian and old-fashioned as a greeting in the US.", use: "Hello! / Hi!", re: /\bGood day!/ },
      { form: "Let's start the lesson.", reason: "textbook", why: "Translated classroom Japanese (授業を はじめます). Sounds cold.", use: "Hello, everyone! Are you ready?", re: /\bLet's start the lesson\b/ },
    ],
  },
  {
    id: "how-are-you",
    en: "How are you?",
    ja: "げんき？（ちょうしを きく・こたえる）",
    canonical: [
      { stages: [1, 5], forms: ["How are you?"] },
      { stages: [1, 5], forms: ["I'm good.", "I'm great!", "I'm OK."], note: "Answers. Add a feeling word: I'm tired. / I'm hungry." },
    ],
    variants: [
      { form: "I'm fine, thanks.", from: 1, note: "School textbook answer. Natural with \"thanks\" (L3)." },
      { form: "How are you doing? / How's it going?", from: 3, note: "Casual questions for older kids.", re: /\bHow are you doing\?|\bHow's it going\?/ },
    ],
    avoid: [
      { form: "I'm so-so.", reason: "textbook", why: "Japanese-textbook answer (まあまあ). Americans say \"I'm OK.\" The word so-so is fine for things (The movie was so-so.).", use: "I'm OK.", re: /\bI'm so-so\b/i, fix: { to: "I'm OK" } },
      { form: "So-so? (as a reply)", reason: "textbook", why: "Same as above.", use: "Just OK?", re: /\bSo-so\?/, fix: { to: "Just OK?" } },
      { form: "I'm fine, thank you. And you?", reason: "textbook", why: "The classic textbook chain. Checked by the stiff-phrase rule.", use: "I'm good! How about you?" },
    ],
  },
  {
    id: "name",
    en: "Asking and telling names",
    ja: "なまえを きく・いう",
    canonical: [
      { stages: [1, 5], forms: ["What's your name?", "I'm ～."] },
    ],
    variants: [
      { form: "My name is ～.", from: 1, note: "Self-introductions and speeches (school textbook form)." },
      { form: "Call me ～.", from: 2, note: "Nicknames." },
    ],
    avoid: [
      { form: "What is your name?", reason: "stiff", why: "Uncontracted in speech sounds like a form or a police officer.", use: "What's your name?", re: /\bWhat is your name\?/, fix: { to: "What's your name?" } },
      { form: "May I have your name?", reason: "stiff", why: "Adult customer-service phrase.", use: "What's your name?", re: /\bMay I have your name\?/ },
    ],
  },
  {
    id: "meeting",
    en: "Meeting someone",
    ja: "はじめまして",
    canonical: [
      { stages: [1, 5], forms: ["Nice to meet you.", "Nice to meet you, too."] },
    ],
    variants: [
      { form: "It's nice to meet you.", from: 2 },
    ],
    avoid: [
      { form: "Nice to meet you too.", reason: "consistency", why: "House style: comma before a final \"too\" in a sentence (only the two-word reply is \"Me too\").", use: "Nice to meet you, too.", re: /\bNice to meet you too\b/, fix: { to: "Nice to meet you, too" } },
      { form: "Pleased to meet you. / Glad to meet you.", reason: "stiff", why: "Formal adult forms.", use: "Nice to meet you.", re: /\b(Pleased|Glad) to meet you\b/, fix: { to: "Nice to meet you" } },
    ],
  },
  {
    id: "goodbye",
    en: "Goodbyes",
    ja: "さようなら・またね",
    canonical: [
      { stages: [1, 5], forms: ["Bye!", "See you!", "Goodbye!"], note: "Kids to kids." },
      { stages: [1, 5], forms: ["Great job today! See you!"], note: "Ms. Emma's sign-off at the end of a lesson (also the built-in template)." },
    ],
    variants: [
      { form: "Bye-bye!", from: 1, to: 2, note: "Warm with 6–8-year-olds. From Stage 3 it sounds babyish from a teacher: use See you! / Bye!", re: /\bBye-bye\b/, fix: fixByeBye },
      { form: "See you next time! / See you tomorrow! / See you later! / See you soon!", from: 1 },
      { form: "Bye for now! / Take care! / Have a nice day!", from: 1 },
      { form: "Good night!", from: 1, note: "Only when going to bed or leaving at night." },
    ],
    avoid: [
      { form: "Bye, bye / Bye bye", reason: "consistency", why: "One spelling: Bye-bye (Stage 1–2).", use: "Bye-bye!", re: /\bBye,? bye\b/, fix: { to: "Bye-bye" } },
      { form: "See you again!", reason: "textbook", why: "Translation of また あおうね. In the US it sounds like you won't meet for a long time.", use: "See you next time!", re: /\bSee you again[!.]/, fix: (t) => t.replace(/\bSee you again([!.])/g, "See you next time$1") },
      { form: "Good bye", reason: "consistency", why: "Checked by the stiff-phrase and canonical rules.", use: "Goodbye! / Bye!" },
      { form: "That's all for today.", reason: "textbook", why: "Translated classroom Japanese. Checked by stiff-phrase.", use: "That's it for today! / Great job today!" },
    ],
  },
  {
    id: "thanks",
    en: "Thanking",
    ja: "ありがとう・どういたしまして",
    canonical: [
      { stages: [1, 5], forms: ["Thank you!", "Thanks!"] },
      { stages: [1, 5], forms: ["You're welcome!"], note: "Reply." },
    ],
    variants: [
      { form: "Thank you very much!", from: 1 },
      { form: "Thank you for ～.", from: 1, note: "Thank you for listening. (speeches)" },
      { form: "No problem!", from: 2, note: "Casual reply to thanks or to a request.", re: /\bNo problem\b/ },
      { form: "No worries!", from: 3, note: "Casual; Stage 1–2 use No problem! (one casual reply).", re: /\bNo worries\b/, fix: { to: "No problem" } },
      { form: "My pleasure.", from: 4, note: "Polite (hotel, guide).", re: /\bMy pleasure\b/ },
    ],
    avoid: [
      { form: "Not at all. (reply to Thank you)", reason: "british", why: "British reply to thanks. (Not at all. as the answer to Would you mind ～? is correct US English.)", use: "You're welcome!" },
      { form: "Don't mention it.", reason: "stiff", why: "Dated.", use: "You're welcome!", re: /\bDon't mention it\b/, fix: { to: "You're welcome" } },
    ],
  },
  {
    id: "apology",
    en: "Apologizing",
    ja: "ごめんね・いいよ",
    canonical: [
      { stages: [1, 5], forms: ["I'm sorry.", "Sorry!"] },
      { stages: [1, 5], forms: ["That's OK.", "It's OK."], note: "Reply." },
    ],
    variants: [
      { form: "Excuse me.", from: 1, note: "Bumping into someone / getting attention." },
      { form: "Don't worry about it.", from: 2 },
      { form: "No problem. / No worries.", from: 2, note: "See Thanking." },
    ],
    avoid: [
      { form: "Don't mind!", reason: "wasei", why: "ドンマイ is Japanese-made English.", use: "Don't worry! / It's OK!", re: /\bDon't mind[!.]/, fix: (t) => t.replace(/\bDon't mind([!.])/g, "Don't worry$1") },
      { form: "Never mind. (reply to Sorry)", reason: "unnatural", why: "Never mind means \"forget what I said\", not \"it's OK\".", use: "That's OK." },
      { form: "My bad.", reason: "rude", why: "Slang; too casual for the app.", use: "Sorry!", re: /\bMy bad\b/ },
    ],
  },
  {
    id: "praise",
    en: "Praise",
    ja: "ほめる",
    canonical: [
      { stages: [1, 5], forms: ["Great job!"], note: "Rotate with the variants; don't repeat the same one twice in a row (style guide §8)." },
    ],
    variants: [
      { form: "Good job! / Nice! / Awesome! / Perfect! / Excellent! / Wonderful! / Fantastic! / Super! / Cool!", from: 1 },
      { form: "You got it! / That's right! / Well done! / Way to go! / Nice work! / Very good!", from: 1 },
      { form: "You said \"～\" so clearly!", from: 1, note: "Praise the specific thing." },
    ],
    avoid: [
      { form: "Brilliant!", reason: "british", why: "British praise word.", use: "Awesome! / Great job!", re: /\bBrilliant!/, fix: { to: "Awesome!" } },
      { form: "Good boy! / Good girl! (to a child)", reason: "rude", why: "Sounds like talking to a pet. (OK to a dog, e.g. L869.)", use: "Great job!" },
    ],
  },
  {
    id: "encouragement",
    en: "Encouragement",
    ja: "はげます",
    canonical: [
      { stages: [1, 5], forms: ["You can do it!"] },
      { stages: [1, 5], forms: ["Good try!", "Nice try!"], note: "After a wrong answer (never No. / Wrong.)." },
    ],
    variants: [
      { form: "Don't give up! / Keep going! / Keep trying! / Almost! / So close! / Take your time.", from: 1 },
      { form: "Break a leg!", from: 3, note: "Idiom before a show (L773).", re: /\bBreak a leg\b/ },
    ],
    avoid: [
      { form: "Fight!", reason: "wasei", why: "ファイト！ Checked by the wasei-eigo rule.", use: "You can do it! / Go, go!" },
      { form: "Do your best.", reason: "textbook", why: "Not wrong, but a translation of がんばって (info in stiff-phrase).", use: "You can do it!" },
      { form: "Cheer up! (as がんばって)", reason: "unnatural", why: "Cheer up means \"don't be sad\". Correct when a friend is sad (L773).", use: "You can do it!" },
    ],
  },
  {
    id: "classroom",
    en: "Classroom instructions",
    ja: "教室の 指示",
    canonical: [
      { stages: [1, 5], forms: ["Listen.", "Look!", "Stand up.", "Sit down.", "Raise your hand.", "Point to ～."] },
    ],
    variants: [
      { form: "Listen carefully. / Look at this! / Open your book. / Close your book. / Hands up!", from: 1 },
      { form: "Can you ～?", from: 1, note: "Softer than Please + verb (style guide §4)." },
    ],
    avoid: [
      { form: "Please listen to me. / Please be quiet.", reason: "stiff", why: "Please + verb from a teacher sounds like scolding.", use: "Listen! / Quiet voices, please.", re: /\bPlease (listen to me|be quiet)\b/ },
      { form: "Please look at here.", reason: "grammar", why: "Checked by stiff-phrase.", use: "Look here! / Look at this!" },
      { form: "Do it with your body!", reason: "unnatural", why: "Word-for-word からだで やってみよう.", use: "Act it out! / Show me!", re: /\bDo it with your body\b/, fix: { to: "Act it out" } },
    ],
  },
  {
    id: "repeat-teacher",
    en: "Asking kids to repeat",
    ja: "まねして いってね（先生）",
    canonical: [
      { stages: [1, 5], forms: ["Say it with me.", "Repeat after me.", "Your turn!", "One more time!"] },
    ],
    variants: [
      { form: "Now you say it! / Let's say it together!", from: 1 },
    ],
    avoid: [
      { form: "Once more!", reason: "stiff", why: "Literary / British-sounding in a classroom.", use: "One more time!", re: /\bOnce more\b/, fix: (t) => t.replace(/\bOnce more\b/g, "One more time").replace(/\bonce more\b/g, "one more time") },
      { form: "Repeat again.", reason: "grammar", why: "Repeat already means again.", use: "Say it again. / One more time!", re: /\b[Rr]epeat again\b/ },
      { form: "Please repeat. / Repeat, please.", reason: "stiff", why: "Checked by stiff-phrase.", use: "Say it with me! / Your turn!" },
    ],
  },
  {
    id: "repeat-child",
    en: "Asking someone to say it again",
    ja: "ききかえす（こども）",
    canonical: [
      { stages: [1, 2], forms: ["One more time, please.", "Sorry? Can you say that again?"], note: "Taught in L384." },
      { stages: [3, 5], forms: ["Sorry? Can you say that again?", "Could you say that again?"] },
    ],
    variants: [
      { form: "Can you speak more slowly, please? / Could you speak more slowly?", from: 1, note: "L328, L384." },
      { form: "Could you say that again?", from: 3, note: "Polite.", re: /\bCould you say that again\?/ },
      { form: "Pardon?", from: 5, note: "Formal; kids will hear it in tests and from adults (L1184).", re: /\bPardon\?/ },
    ],
    avoid: [
      { form: "Excuse me? (to ask again)", reason: "rude", why: "With rising tone it often means \"How dare you?\" (used that way on purpose in L1088).", use: "Sorry? Can you say that again?" },
      { form: "What? (alone)", reason: "rude", why: "Sounds impatient.", use: "Sorry?" },
      { form: "Once again, please.", reason: "textbook", why: "Translation of もう一度 おねがいします.", use: "One more time, please.", re: /\bOnce again, please\b/, fix: { to: "One more time, please" } },
    ],
  },
  {
    id: "turns",
    en: "Turn-taking",
    ja: "じゅんばん",
    canonical: [
      { stages: [1, 5], forms: ["Your turn!", "My turn!"] },
    ],
    variants: [
      { form: "It's your turn. / Who's next? / You go first.", from: 1 },
      { form: "After you.", from: 2, note: "Polite, letting someone go first.", re: /\bAfter you\b/ },
    ],
    avoid: [
      { form: "Next is you.", reason: "unnatural", why: "Word-for-word つぎは あなた.", use: "You're next!", re: /\bNext is you\b/, fix: { to: "You're next" } },
    ],
  },
  {
    id: "agree",
    en: "Agreeing and disagreeing",
    ja: "さんせい・はんたい",
    canonical: [
      { stages: [1, 5], forms: ["Me too!", "That's right!"] },
      { stages: [3, 5], forms: ["I agree.", "I disagree."], note: "With a reason: I agree because ～." },
    ],
    variants: [
      { form: "You're right. / Good idea! / That's a good idea.", from: 1 },
      { form: "Me neither.", from: 2, note: "After a negative sentence.", re: /\bMe neither\b/ },
      { form: "I think so, too. / I don't think so.", from: 2, note: "L528.", re: /\bI think so, too\b/ },
      { form: "I agree. / I disagree. / I don't agree.", from: 3, re: /\bI (agree|disagree|don't agree)\b/ },
      { form: "I see your point, but ～.", from: 3, re: /\bI see your point\b/ },
    ],
    avoid: [
      { form: "Me, too.", reason: "consistency", why: "One spelling for the two-word reply: Me too (no comma, US style).", use: "Me too!", re: /\bMe, too\b/, fix: (t) => t.replace(/\bMe, too\b/g, "Me too") },
      { form: "I think so too.", reason: "consistency", why: "House style keeps the comma before a final too in a sentence.", use: "I think so, too.", re: /\bI think so too\b/, fix: { to: "I think so, too" } },
      { form: "Me either.", reason: "consistency", why: "Informal; the app teaches Me neither.", use: "Me neither.", re: /\bMe either\b/, fix: { to: "Me neither" } },
      { form: "I'm agree.", reason: "grammar", why: "agree is a verb.", use: "I agree.", re: /\bI'm agree\b/, fix: { to: "I agree" } },
    ],
  },
  {
    id: "asking",
    en: "Asking for things",
    ja: "たのむ・ほしい ものを いう",
    canonical: [
      { stages: [1, 3], forms: ["～, please.", "Can I have ～?"] },
      { stages: [4, 5], forms: ["Can I have ～?", "Could I have ～?"] },
    ],
    variants: [
      { form: "I'd like ～.", from: 1, note: "Ordering (school textbook: What would you like? ― I'd like ～.)." },
      { form: "Could you ～?", from: 1, note: "Polite request (L328 Could you speak more slowly?)." },
      { form: "May I ～?", from: 2, note: "Asking permission (school textbook).", re: /\bMay I\b/ },
      { form: "Could I have ～?", from: 4, re: /\bCould I have\b/ },
      { form: "Would you mind ～ing? ― Not at all.", from: 4, note: "L1002.", re: /\bWould you mind\b/ },
    ],
    avoid: [
      { form: "Give me ～. (to ask for something)", reason: "rude", why: "Sounds demanding. (Give me five! is fine.)", use: "Can I have ～, please?" },
      { form: "I want ～. (when ordering)", reason: "rude", why: "Blunt in a shop or restaurant.", use: "I'd like ～. / Can I have ～?" },
    ],
  },
  {
    id: "handing",
    en: "Handing something over",
    ja: "はい、どうぞ",
    canonical: [
      { stages: [1, 1], forms: ["Here you are."], note: "School textbook form, natural US English." },
      { stages: [2, 5], forms: ["Here you are.", "Here you go."] },
    ],
    variants: [
      { form: "Here it is.", from: 1 },
      { form: "Here you go.", from: 2, note: "Casual. Stage 1 keeps one form.", re: /\bHere you go\b/, fix: { to: "Here you are" } },
    ],
    avoid: [],
  },
  {
    id: "inviting",
    en: "Inviting and suggesting",
    ja: "さそう・ていあんする",
    canonical: [
      { stages: [1, 5], forms: ["Let's ～!", "How about ～?"] },
    ],
    variants: [
      { form: "Do you want to ～?", from: 2, re: /\bDo you want to\b/ },
      { form: "Why don't we ～?", from: 2, re: /\bWhy don't we\b/ },
      { form: "Shall we ～?", from: 2, note: "School textbook form (L574). Sounds a little formal; prefer Let's ～ in casual talk.", re: /\bShall we\b/ },
      { form: "Would you like to ～?", from: 2, note: "See Offering." },
    ],
    avoid: [
      { form: "Let's enjoy! / Let's challenge!", reason: "unnatural", why: "Checked by stiff-phrase.", use: "Have fun! / Let's try it!" },
    ],
  },
  {
    id: "offering",
    en: "Offering",
    ja: "すすめる・こたえる",
    canonical: [
      { stages: [1, 1], forms: ["Do you want ～?", "Yes, please.", "No, thank you."] },
      { stages: [2, 5], forms: ["Would you like ～?", "Yes, please.", "No, thank you."] },
    ],
    variants: [
      { form: "Would you like ～?", from: 2, re: /\bWould you like\b/ },
      { form: "No, thanks.", from: 1 },
    ],
    avoid: [],
  },
  {
    id: "opinion",
    en: "Giving opinions and reasons",
    ja: "いけん・りゆう",
    canonical: [
      { stages: [1, 1], forms: ["I like ～.", "It's fun!"] },
      { stages: [2, 5], forms: ["I think ～.", "～ because ～."] },
      { stages: [3, 5], forms: ["In my opinion, ～."], note: "L822." },
    ],
    variants: [
      { form: "～ because ～.", from: 1, note: "Simple reasons (I like dogs because they're cute.)." },
      { form: "I think ～.", from: 2, re: /\bI think\b/ },
      { form: "In my opinion, ～.", from: 3, re: /\bIn my opinion\b/ },
      { form: "What do you think?", from: 1, note: "Ms. Emma asks it from Stage 1." },
      { form: "What's your opinion?", from: 3, note: "L822." },
    ],
    avoid: [
      { form: "In my opinion, I think ～.", reason: "unnatural", why: "Says the same thing twice.", use: "In my opinion, ～. / I think ～.", re: /\bIn my opinion, I think\b/, fix: { to: "I think" } },
      { form: "The reason is because ～.", reason: "grammar", why: "Redundant.", use: "The reason is that ～. / ～ because ～.", re: /\bThe reason is because\b/, fix: { to: "The reason is that" } },
    ],
  },
  {
    id: "feelings",
    en: "Feelings",
    ja: "きもち",
    canonical: [
      { stages: [1, 5], forms: ["I'm happy.", "I'm sad.", "I'm tired.", "I'm hungry.", "I'm sleepy."] },
    ],
    variants: [
      { form: "I'm excited. / I'm nervous. / I'm scared.", from: 1 },
    ],
    avoid: [
      { form: "I'm exciting. / I'm boring.", reason: "grammar", why: "Checked by grammar-habit (-ing = the thing, -ed = the person).", use: "I'm excited. / I'm bored." },
    ],
  },
  {
    id: "word-questions",
    en: "Asking about words",
    ja: "ことばの しつもん",
    canonical: [
      { stages: [1, 5], forms: ["What's this?", "How do you spell ～?", "How do you say ～ in English?"] },
    ],
    variants: [
      { form: "What does ～ mean?", from: 2, re: /\bWhat does [^?]{1,30} mean\?/ },
    ],
    avoid: [
      { form: "How to say ～?", reason: "unnatural", why: "Not a question in English.", use: "How do you say ～?", re: /\bHow to say\b[^.!]*\?/ },
    ],
  },
  {
    id: "checking",
    en: "Checking understanding (teacher)",
    ja: "わかったか たしかめる（先生）",
    canonical: [
      { stages: [1, 5], forms: ["Ready?", "Got it?", "OK?"] },
    ],
    variants: [
      { form: "Are you ready? / Does that make sense?", from: 1 },
    ],
    avoid: [
      { form: "Do you understand?", reason: "rude", why: "Can sound condescending from a teacher.", use: "Got it?", re: /\bDo you understand\?/, fix: { to: "Got it?" } },
    ],
  },
  {
    id: "speech",
    en: "Starting and ending a speech",
    ja: "スピーチの はじめと おわり",
    canonical: [
      { stages: [1, 5], forms: ["Let me tell you about ～.", "Thank you for listening."], note: "L239, L328." },
    ],
    variants: [
      { form: "Hi, everyone! Today I'm going to talk about ～.", from: 2 },
    ],
    avoid: [
      { form: "Please listen to my speech.", reason: "textbook", why: "Japanese school formula (きいて ください). A real speech just starts.", use: "Let me tell you about ～.", re: /\bPlease listen to my speech\b/ },
    ],
  },
  {
    id: "spelling",
    en: "One spelling for compound words (run11)",
    ja: "ふくごう語の つづりを 1つに",
    canonical: [
      { stages: [1, 5], forms: ["seat belt", "tug-of-war", "lunchtime"], note: "The more common US spelling. Learning item IDs use these forms." },
    ],
    variants: [],
    avoid: [
      { form: "seatbelt", reason: "consistency", why: "One spelling: seat belt (two words, the more common US form).", use: "seat belt", re: /\b[Ss]eatbelts?\b/, fix: (t) => t.replace(/\b([Ss])eatbelt(s?)\b/g, "$1eat belt$2") },
      { form: "tug of war", reason: "consistency", why: "One spelling: tug-of-war (hyphenated, the more common US form).", use: "tug-of-war", re: /\b[Tt]ug of war\b/, fix: (t) => t.replace(/\b([Tt])ug of war\b/g, "$1ug-of-war") },
      { form: "lunch time", reason: "consistency", why: "One spelling: lunchtime (one word, the more common US form).", use: "lunchtime", re: /\b[Ll]unch time\b/, fix: (t) => t.replace(/\b([Ll])unch time\b/g, "$1unchtime") },
    ],
  },
];

// ---------------------------------------------------------------------------
// lint と なおす
// ---------------------------------------------------------------------------

export interface PhrasebookHit {
  fn: string;
  form: string;
  match: string;
  kind: "avoid" | "stage";
  message: string;
}

const inStage = (v: Variant, stage: number) => (v.from === undefined || stage >= v.from) && (v.to === undefined || stage <= v.to);

/**
 * stage = null は アプリの 文字（UI・テンプレート）。どの ステージの 子も 見るので
 * 「to が ある 形（Bye-bye）」と avoid だけ しらべる（from は テンプレートが その ステージで しか 出ない ことが あるので しらべない）
 */
export function phrasebookHits(text: string, stage: number | null, unit = ""): PhrasebookHit[] {
  const out: PhrasebookHit[] = [];
  for (const f of PHRASEBOOK) {
    for (const a of f.avoid) {
      if (!a.re || a.allowUnits?.includes(unit)) continue;
      const m = text.match(a.re);
      if (m) out.push({ fn: f.id, form: a.form, match: m[0], kind: "avoid", message: `[${f.id}] "${m[0]}" (${REASON_LABEL[a.reason]}) → ${a.use}` });
    }
    for (const v of f.variants) {
      if (!v.re) continue;
      if (stage === null ? v.to === undefined : inStage(v, stage)) continue;
      const m = text.match(v.re);
      if (!m) continue;
      const range = `${v.from ?? 1}–${v.to ?? 5}`;
      const where = stage === null ? "app text (all stages)" : `stage ${stage}`;
      out.push({ fn: f.id, form: v.form, match: m[0], kind: "stage", message: `[${f.id}] "${m[0]}" is for stage ${range}, found in ${where}` });
    }
  }
  return out;
}

const applyFix = (fix: Fix, re: RegExp, text: string) => (typeof fix === "function" ? fix(text) : text.replace(new RegExp(re.source, re.flags.includes("g") ? re.flags : `${re.flags}g`), fix.to));

export interface PhrasebookChange { fn: string; form: string; before: string; after: string }

/** fix が ある ものを なおす（avoid → ステージの そとの variant の じゅん） */
export function applyPhrasebook(text: string, stage: number | null, unit = ""): { text: string; changes: PhrasebookChange[] } {
  let t = text;
  const changes: PhrasebookChange[] = [];
  for (const f of PHRASEBOOK) {
    for (const a of f.avoid) {
      if (!a.re || !a.fix || a.allowUnits?.includes(unit) || !a.re.test(t)) continue;
      const next = applyFix(a.fix, a.re, t);
      if (next !== t) { changes.push({ fn: f.id, form: a.form, before: t, after: next }); t = next; }
    }
  }
  for (const f of PHRASEBOOK) {
    for (const v of f.variants) {
      if (!v.re || !v.fix) continue;
      if (stage === null ? v.to === undefined : inStage(v, stage)) continue;
      if (!v.re.test(t)) continue;
      const next = applyFix(v.fix, v.re, t);
      if (next !== t) { changes.push({ fn: f.id, form: v.form, before: t, after: next }); t = next; }
    }
  }
  return { text: t, changes };
}
