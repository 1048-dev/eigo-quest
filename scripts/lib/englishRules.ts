/**
 * 英語チェック（npm run english:lint）の ルールの データ（run9 Phase 1）。
 * docs/english-style-guide.md の 表と 同じ 内容。ガイドを かえたら ここも かえる。
 */

export type Level = "error" | "warn" | "info";

export interface PhraseRule {
  rule: string;
  level: Level;
  re: RegExp;
  suggestion: string;
  /** spoken = セリフ・先生の ことばだけで チェック */
  spokenOnly?: boolean;
}

/** ステージごとの 1文の 最大語数（ガイド §2） */
export const MAX_WORDS_BY_STAGE: Readonly<Record<number, number>> = { 1: 8, 2: 12, 3: 15, 4: 18, 5: 22 };

/** イギリス式の つづり → アメリカ式（ガイド §5） */
export const UK_SPELLINGS: Readonly<Record<string, string>> = {
  organise: "organize", organised: "organized", organising: "organizing",
  realise: "realize", realised: "realized", realising: "realizing",
  recognise: "recognize", recognised: "recognized",
  apologise: "apologize", apologised: "apologized",
  memorise: "memorize", memorised: "memorized",
  practise: "practice", practised: "practiced", practising: "practicing",
  finalise: "finalize", criticise: "criticize", summarise: "summarize", categorise: "categorize",
  emphasise: "emphasize", visualise: "visualize", sympathise: "sympathize", prioritise: "prioritize",
  analyse: "analyze", analysed: "analyzed", paralyse: "paralyze",
  centre: "center", centres: "centers", theatre: "theater", theatres: "theaters",
  metre: "meter", metres: "meters", litre: "liter", litres: "liters", kilometre: "kilometer", kilometres: "kilometers",
  centimetre: "centimeter", centimetres: "centimeters", fibre: "fiber",
  defence: "defense", offence: "offense", licence: "license",
  travelled: "traveled", travelling: "traveling", traveller: "traveler", travellers: "travelers",
  cancelled: "canceled", cancelling: "canceling", labelled: "labeled", modelling: "modeling",
  fuelled: "fueled", counsellor: "counselor", jewellery: "jewelry", pyjamas: "pajamas",
  programme: "program", programmes: "programs", grey: "gray", greyish: "grayish",
  cheque: "check", tyre: "tire", tyres: "tires", kerb: "curb", plough: "plow", aeroplane: "airplane", aeroplanes: "airplanes",
  aluminium: "aluminum", moustache: "mustache", sceptical: "skeptical", storey: "story", storeys: "stories",
  enrol: "enroll", fulfil: "fulfill", skilful: "skillful", instalment: "installment", ageing: "aging",
  mum: "mom", mums: "moms", mummy: "mommy", maths: "math", catalogue: "catalog",
};

/** -our で おわるけど イギリス式では ない ことば */
export const OUR_EXCEPTIONS = new Set([
  "our", "ours", "four", "fours", "hour", "hours", "your", "yours", "pour", "pours", "poured", "pouring",
  "tour", "tours", "toured", "touring", "flour", "sour", "detour", "devour", "devoured", "contour", "dour", "scour", "scoured",
  "velour", "amour", "troubadour", "tourist", "tourists",
]);

/** イギリス式の ことばえらび（warn）。ガイド §5 */
export const UK_WORDS: readonly PhraseRule[] = [
  { rule: "uk-word", level: "warn", re: /\ba rubber\b(?! (duck|band|ball|boot|glove|tree|stamp|tire|mat))|\brubbers\b/i, suggestion: "eraser(s)" },
  { rule: "uk-word", level: "warn", re: /\bbiscuits?\b/i, suggestion: "cookie(s)" },
  { rule: "uk-word", level: "warn", re: /\bcrisps\b/i, suggestion: "chips" },
  { rule: "uk-word", level: "warn", re: /\brubbish\b/i, suggestion: "trash" },
  { rule: "uk-word", level: "warn", re: /\bdustbins?\b/i, suggestion: "trash can" },
  { rule: "uk-word", level: "warn", re: /\btrousers\b/i, suggestion: "pants" },
  { rule: "uk-word", level: "warn", re: /\bjumpers?\b/i, suggestion: "sweater" },
  { rule: "uk-word", level: "warn", re: /\btrainers\b/i, suggestion: "sneakers" },
  { rule: "uk-word", level: "warn", re: /\blorr(y|ies)\b/i, suggestion: "truck(s)" },
  { rule: "uk-word", level: "warn", re: /\bpetrol\b/i, suggestion: "gas" },
  { rule: "uk-word", level: "warn", re: /\bcar parks?\b/i, suggestion: "parking lot" },
  { rule: "uk-word", level: "warn", re: /\bqueue\b/i, suggestion: "line" },
  { rule: "uk-word", level: "warn", re: /\b(summer|winter|spring) holidays?\b/i, suggestion: "summer/winter/spring vacation or break" },
  { rule: "uk-word", level: "warn", re: /\bon holiday\b/i, suggestion: "on vacation" },
  { rule: "uk-word", level: "warn", re: /\bfootball\b/i, suggestion: "soccer (football = American football in the US)" },
  { rule: "uk-word", level: "warn", re: /\bautumn\b/i, suggestion: "fall" },
  { rule: "uk-word", level: "warn", re: /\bfilms?\b/i, suggestion: "movie(s)" },
  { rule: "uk-word", level: "info", re: /\btoilet\b/i, suggestion: "bathroom / restroom" },
  { rule: "uk-word", level: "warn", re: /\btimetables?\b/i, suggestion: "schedule" },
  { rule: "uk-word", level: "warn", re: /\b(Have|Has) (you|he|she|they|we|it) got\b/i, suggestion: "Do you have ~?" },
  { rule: "uk-word", level: "warn", re: /\bat the weekend\b/i, suggestion: "on the weekend" },
  { rule: "uk-word", level: "warn", re: /\bfortnight\b/i, suggestion: "two weeks" },
  { rule: "uk-word", level: "warn", re: /\b(learnt|spelt|dreamt|burnt|smelt|spilt)\b/i, suggestion: "learned / spelled / dreamed / burned / smelled / spilled" },
  { rule: "uk-word", level: "warn", re: /\b(whilst|amongst)\b/i, suggestion: "while / among" },
  { rule: "uk-word", level: "warn", re: /\bmobile phones?\b/i, suggestion: "cell phone / phone" },
  { rule: "uk-word", level: "warn", re: /\bpavement\b/i, suggestion: "sidewalk" },
  { rule: "uk-word", level: "warn", re: /\bnapp(y|ies)\b/i, suggestion: "diaper(s)" },
  { rule: "uk-word", level: "warn", re: /\baubergines?\b/i, suggestion: "eggplant" },
  { rule: "uk-word", level: "warn", re: /\bcourgettes?\b/i, suggestion: "zucchini" },
  { rule: "uk-word", level: "warn", re: /\bcandyfloss\b/i, suggestion: "cotton candy" },
  { rule: "uk-word", level: "warn", re: /\bice lolly\b/i, suggestion: "ice pop" },
  { rule: "uk-word", level: "warn", re: /\bYear [1-9]\b/, suggestion: "first/second/... grade" },
  { rule: "uk-word", level: "warn", re: /\bhead ?teacher\b/i, suggestion: "principal" },
  { rule: "uk-word", level: "warn", re: /\brucksacks?\b/i, suggestion: "backpack" },
  { rule: "uk-word", level: "warn", re: /\bzebra crossing\b/i, suggestion: "crosswalk" },
  { rule: "uk-word", level: "warn", re: /\bfizzy drinks?\b/i, suggestion: "soda" },
  { rule: "uk-word", level: "warn", re: /\btakeaway\b/i, suggestion: "takeout" },
  { rule: "uk-word", level: "warn", re: /(?<!\b(rice|slow|pressure) )\bcookers?\b/i, suggestion: "stove" },
  { rule: "uk-word", level: "info", re: /\bsweets\b/i, suggestion: "candy (sweets is OK for 'sweet things')" },
];

/** 和製英語（ガイド §5） */
export const WASEI_EIGO: readonly PhraseRule[] = [
  { rule: "wasei-eigo", level: "warn", re: /\bmansions?\b/i, suggestion: "apartment (building)" },
  { rule: "wasei-eigo", level: "warn", re: /\bconsents?\b/i, suggestion: "outlet" },
  { rule: "wasei-eigo", level: "warn", re: /\bsharp pencils?\b/i, suggestion: "mechanical pencil" },
  { rule: "wasei-eigo", level: "warn", re: /\bnote ?PCs?\b/i, suggestion: "laptop" },
  { rule: "wasei-eigo", level: "warn", re: /\bbaby ?cars?\b/i, suggestion: "stroller" },
  { rule: "wasei-eigo", level: "warn", re: /\bsalary ?m[ae]n\b/i, suggestion: "office worker" },
  { rule: "wasei-eigo", level: "warn", re: /\bcunning\b/i, suggestion: "cheating" },
  { rule: "wasei-eigo", level: "warn", re: /\btrumps?\b/i, suggestion: "cards / playing cards" },
  { rule: "wasei-eigo", level: "warn", re: /\bfree size\b/i, suggestion: "one size fits all" },
  { rule: "wasei-eigo", level: "warn", re: /\bhigh tension\b/i, suggestion: "excited / hyper" },
  { rule: "wasei-eigo", level: "warn", re: /\bskinship\b/i, suggestion: "hugs / cuddles" },
  { rule: "wasei-eigo", level: "warn", re: /\bpierces?\b/i, suggestion: "earrings" },
  { rule: "wasei-eigo", level: "warn", re: /\bshort ?cake\b/i, suggestion: "strawberry shortcake" },
  { rule: "wasei-eigo", level: "warn", re: /\bgasoline stand\b/i, suggestion: "gas station" },
  { rule: "wasei-eigo", level: "warn", re: /\bwhite board\b/i, suggestion: "whiteboard" },
  { rule: "wasei-eigo", level: "warn", re: /\b(stage|game) clear\b/i, suggestion: "You did it! / Level complete!" },
  { rule: "wasei-eigo", level: "warn", re: /\bmy pace\b/i, suggestion: "at my own pace" },
  { rule: "wasei-eigo", level: "warn", re: /\bFight!/, suggestion: "You can do it! / Go, go!" },
];

/** かたい・直訳っぽい 表現（warn）（ガイド §5） */
export const STIFF_PHRASES: readonly PhraseRule[] = [
  { rule: "stiff-phrase", level: "warn", re: /\bI'm fine,? thank you\b/i, suggestion: "I'm good! / Great, thanks!" },
  { rule: "stiff-phrase", level: "warn", re: /(^|[.!?]\s+|,\s*)and you\?/i, suggestion: "How about you? / You?" },
  { rule: "stiff-phrase", level: "warn", re: /\bvery very\b|\bvery,? very,? very\b/i, suggestion: "really ~ / super ~ / so ~" },
  { rule: "stiff-phrase", level: "info", re: /\bvery, very\b(?!,? very)/i, suggestion: "OK in storytelling; don't overuse (really ~ / so ~)" },
  { rule: "stiff-phrase", level: "warn", re: /\b(Let's|Please) enjoy\b(?! (the|this|our|your|it|a|some|my)\b)/i, suggestion: "Have fun!" },
  { rule: "stiff-phrase", level: "warn", re: /\bLet's challenge\b/i, suggestion: "Let's try it! / Give it a try!" },
  { rule: "stiff-phrase", level: "warn", re: /\bLet's study\b/i, suggestion: "Let's learn ~ / Let's practice!" },
  { rule: "stiff-phrase", level: "info", re: /\bDo your best\b/i, suggestion: "You can do it! (Do your best is OK)" },
  { rule: "stiff-phrase", level: "warn", re: /\bThank you for your hard work\b/i, suggestion: "Great job today! / Nice work!" },
  { rule: "stiff-phrase", level: "warn", re: /\bWhat is your hobby\b|\bWhat's your hobby\b/i, suggestion: "What do you like to do for fun?" },
  { rule: "stiff-phrase", level: "warn", re: /\bPlease look at here\b/i, suggestion: "Look here! / Look at this!" },
  { rule: "stiff-phrase", level: "warn", re: /\bGood bye\b/, suggestion: "Goodbye / Bye! / See you!" },
  { rule: "stiff-phrase", level: "warn", re: /\bThat's all for today\b(?!')/i, suggestion: "That's it for today! / Great job today!" },
  { rule: "stiff-phrase", level: "warn", re: /\bRepeat, please\b|\bPlease repeat\b/i, suggestion: "Say it with me! / Your turn!" },
];

/** よくある 文法の まちがい（error）（ガイド §5・§6） */
export const GRAMMAR_HABITS: readonly PhraseRule[] = [
  { rule: "grammar-habit", level: "error", re: /\bI very (like|love|want|enjoy)\b/i, suggestion: "I really like ~ / I like ~ a lot" },
  { rule: "grammar-habit", level: "error", re: /\b(I'm|I am|we're|we are|they're|they are|you're|you are) (boring)\b/i, suggestion: "bored (boring = つまらない もの)" },
  { rule: "grammar-habit", level: "error", re: /\b(I'm|I am|we're|we are|they're|they are) (exciting)\b/i, suggestion: "excited" },
  { rule: "grammar-habit", level: "error", re: /\binteresting in\b/i, suggestion: "interested in" },
  { rule: "grammar-habit", level: "error", re: /\b(go|goes|went|going|come|comes|came|coming) to (home|there|here)\b/i, suggestion: "go home / go there / come here" },
  { rule: "grammar-habit", level: "error", re: /\bin (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?\b/, suggestion: "on Monday" },
  { rule: "grammar-habit", level: "error", re: /\bin (the )?night\b(?! (sky|air))/i, suggestion: "at night" },
  // うしろに 名詞が つづく（at the morning assembly / a snow festival / a bread shop）ときは 正しいので、文の おわり・記号・機能語の 前だけ
  { rule: "grammar-habit", level: "error", re: /\bat (the )?(morning|afternoon|evening)(?=\s*([.,!?;:]|$)|\s+(and|or|is|was|we|I|you|they|he|she|it)\b)/i, suggestion: "in the morning / in the afternoon" },
  { rule: "grammar-habit", level: "error", re: /\b(a|an) (homework|information|advice|furniture|luggage|baggage|bread|music|rain|snow|money)(?=\s*([.,!?;:"]|$)|\s+(is|was|and|or|for|to|from|in|on|at|with|please|today|now)\b)/i, suggestion: "uncountable: no a/an (some ~ / a piece of ~)" },
  { rule: "grammar-habit", level: "error", re: /\b(homeworks|informations|advices|furnitures|luggages|breads|musics)\b/i, suggestion: "uncountable: no -s" },
  { rule: "grammar-habit", level: "error", re: /\breturn back\b/i, suggestion: "return / go back" },
  { rule: "grammar-habit", level: "error", re: /\bdiscuss about\b/i, suggestion: "discuss / talk about" },
  { rule: "grammar-habit", level: "error", re: /\bYes, I'm\.|\bYes, it's\.|\bYes, you're\.|\bYes, he's\.|\bYes, she's\./, suggestion: "Yes, I am. (no contraction at the end)" },
  { rule: "grammar-habit", level: "error", re: /\bYes, I like\.|\bNo, I don't like\./, suggestion: "Yes, I do. / No, I don't." },
];

/** いつも おなじ 形で 書く もの（error）（ガイド §9） */
export const CANONICAL_FORMS: readonly PhraseRule[] = [
  { rule: "canonical", level: "error", re: /\bMs Emma\b/, suggestion: "Ms. Emma" },
  { rule: "canonical", level: "error", re: /\bMiss Emma\b|\bMrs\.? Emma\b|\bteacher Emma\b|\bEmma[- ]sensei\b/i, suggestion: "Ms. Emma" },
  { rule: "canonical", level: "warn", re: /\bOkay\b|\bokay\b/, suggestion: "OK" },
  { rule: "canonical", level: "error", re: /(?<![A-Za-z'-])ok(?![A-Za-z'-])/, suggestion: "OK" },
  { rule: "canonical", level: "error", re: /\b[Gg]ood-bye\b/, suggestion: "goodbye" },
  { rule: "canonical", level: "error", re: /\bt-shirts?\b|\bT shirts?\b|\bt shirts?\b|\b[Tt]shirts?\b/, suggestion: "T-shirt" },
  { rule: "canonical", level: "error", re: /\be-mails?\b/i, suggestion: "email" },
  { rule: "canonical", level: "error", re: /\bcan not\b/i, suggestion: "cannot / can't" },
];

/** ちぢめられる 形（info・セリフだけ）。うしろが . , ! ? の ときは ちぢめられないので のぞく */
export const CONTRACTIONS: readonly { re: RegExp; to: string }[] = [
  { re: /\bI am\b(?!\s*[.,!?])/, to: "I'm" },
  { re: /\b[Ii]t is\b(?!\s*[.,!?])/, to: "it's" },
  { re: /\b[Dd]o not\b/, to: "don't" },
  { re: /\b[Dd]oes not\b/, to: "doesn't" },
  { re: /\b[Dd]id not\b/, to: "didn't" },
  { re: /\b[Ii]s not\b/, to: "isn't" },
  { re: /\b[Aa]re not\b/, to: "aren't" },
  { re: /\b[Ll]et us\b/, to: "let's" },
  { re: /\b[Tt]hat is\b(?!\s*[.,!?])/, to: "that's" },
  { re: /\b[Ww]hat is\b(?!\s*[.,!?])/, to: "what's" },
  { re: /\b[Ww]ill not\b/, to: "won't" },
  { re: /\b[Ww]as not\b/, to: "wasn't" },
];

/** cspell に ない けれど 正しい と 確かめた 文字の まとまり（フォニックス） */
export const PHONICS_GRAPHEMES = new Set([
  "sh", "ch", "th", "wh", "ph", "ck", "ng", "nk", "qu", "tch", "dge", "kn", "wr", "mb", "gh", "igh",
  "ee", "ea", "ai", "ay", "oa", "oe", "ow", "ou", "oi", "oy", "oo", "ue", "ew", "ie", "ei", "ey", "au", "aw",
  "ar", "er", "ir", "ur", "or", "ore", "air", "ear", "eer", "ure",
  "bl", "cl", "fl", "gl", "pl", "sl", "br", "cr", "dr", "fr", "gr", "pr", "tr", "sc", "sk", "sm", "sn", "sp", "st", "sw",
  "spl", "spr", "str", "scr", "squ", "thr", "shr", "nd", "nt", "mp", "lk", "lt", "ft", "pt", "xt",
]);
