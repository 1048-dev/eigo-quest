/**
 * 問題ファクトリ。学習項目から問題を決定的（seed付き）に生成する。
 * サーバーは同じ seed で問題を再生成して採点するため、クライアントに正解を渡さずに済む。
 */
import type { AssessmentDef, LearningItemDef, LessonDef, MemoryState, Skill } from "@/lib/domain/types";
import { pickArenaItems, type ArenaMode } from "@/lib/domain/arena";
import { MAX_CONVERSATION_TURNS, pickConversationPartner } from "@/lib/conversation/engine";
import { getLesson, itemsInRange, itemsOfLesson } from "./index";
import { VOWEL_TEAMS, VOWEL_TEAM_INTRO, possibleSounds, shortVowelOf, teamSound } from "./vowelTeams";
import { R_MOUTH, R_VOWELS, R_VOWEL_INTRO, findRSpellings, rSound, shortVowelOfR } from "./rControlled";
import { CG_CHOICES, CG_KANA, CG_LETTER, W10_INTRO as W10_INTRO_MAP, W10_TEAMS, Y_TEAM, cgSounds, w10TeamSound, ySound } from "./w10Phonics";
import { ED_KANA, ED_LABEL, ER_MORE_WORDS, SIGHT_TIP, W11_INTRO as W11_INTRO_MAP, W11_SIGHT_WORDS, edSound } from "./w11Phonics";
import { W12_INTRO as W12_INTRO_MAP, W12_SIGHT_TIP, W12_SIGHT_WORDS, W12_START, W12_SYLLABLE_START, syllablesOf } from "./w12Phonics";
import { CH_CHOICES, S_KANA, S_LABEL, W13_CH_FOCUS, W13_HE_FOCUS, W13_IZ_START, W13_START, W13_S_FOCUS, chBlank, heSpelling, sSound, type SSound } from "./w13Phonics";
import { PLURAL_WHY, SILENT_CHOICES, SILENT_WHY, W14_NUMBER_FOCUS, W14_PLURAL_FOCUS, W14_SILENT_FOCUS, W14_START, numberSpelling, pluralSpelling, silentBlank } from "./w14Phonics";
import { W40_START, partsReviewDisplay, partsReviewOf, partsReviewWhy, pauseReviewDisplay, pauseReviewOf, pauseReviewWhy, rootReviewDisplay, rootReviewOf, rootReviewWhy, soundCheckDisplay, soundCheckOf, soundCheckWhy, spellReviewDisplay, spellReviewOf, spellReviewWhy } from "./w40Phonics";
import { W39_START, bigNumberDisplay, bigNumberOf, bigNumberWhy, debateDisplay, debateOf, debateWhy, ecoWordDisplay, ecoWordOf, ecoWordWhy, hedgeDisplay, hedgeOf, hedgeWhy, markerDisplay, markerOf, markerWhy } from "./w39Phonics";
import { W38_START, characterDisplay, characterOf, characterWhy, feelingSpellDisplay, feelingSpellOf, feelingSpellWhy, idiomDisplay, idiomOf, idiomWhy, phrasalDisplay, phrasalOf, phrasalWhy, toneDisplay, toneOf, toneWhy } from "./w38Phonics";
import { W37_START, adverbDisplay, adverbOf, adverbWhy, simileDisplay, simileOf, simileWhy, soundWordDisplay, soundWordOf, soundWordWhy, storyVerbDisplay, storyVerbOf, storyVerbWhy, suspenseDisplay, suspenseOf, suspenseWhy } from "./w37Phonics";
import { W36_START, academicDisplay, academicOf, academicWhy, bioDisplay, bioOf, bioWhy, ologyDisplay, ologyOf, ologyWhy, pauseDisplay, pauseOf, pauseWhy,unitDisplay, unitOf, unitWhy } from "./w36Phonics";
import { W35_START, contrastDisplay, contrastOf, contrastWhy, formalDisplay, formalOf, formalWhy, interCoDisplay, interCoOf, interCoWhy, ityDisplay, ityOf, ityWhy, rootDisplay, rootOf, rootWhy } from "./w35Phonics";
import { W34_START, doubleDisplay, doubleOf, doubleWhy, izeDisplay, izeOf, izeWhy, travelNumberDisplay, travelNumberOf, travelNumberWhy, ukUsDisplay, ukUsOf, ukUsPrompt, ukUsWhy, visDisplay, visOf, visWhy } from "./w34Phonics";
import { W33_START, jectDisplay, jectOf, jectWhy, listDisplay, listOf, listPrompt, listWhy, nounEndDisplay, nounEndOf, nounEndWhy, proofDisplay, proofOf, proofWhy, ruptDisplay, ruptOf, ruptWhy } from "./w33Phonics";
import { W32_START, alDisplay, alOf, alWhy, dataDisplay, dataOf, dataWhy, directionDisplay, directionOf, directionWhy, geoDisplay, geoOf, geoWhy, numberDisplay, numberOf, numberWhy } from "./w32Phonics";
import { W31_START, familyDisplay as family31Display, familyOf as family31Of, familyWhy as family31Why, personDisplay as person31Display, personOf as person31Of, personWhy as person31Why, portDisplay, portOf, portWhy, structDisplay, structOf, structWhy, yearDisplay, yearOf, yearWhy } from "./w31Phonics";
import { W30_START, abbrDisplay, abbrOf, abbrWhy, autoDisplay, autoOf, autoWhy, casualDisplay, casualOf, casualPrompt, casualWhy, icDisplay, icOf, icWhy, transDisplay, transOf, transWhy } from "./w30Phonics";
import { W29_START, dictOf, dictWhy, emphasisDisplay, emphasisOf, emphasisWhy, ibleOf, ibleWhy, spectDisplay, spectOf, spectWhy, weakDisplay, weakOf, weakPrompt, weakWhy } from "./w29Phonics";
import { W28_START, katakanaDisplay, katakanaOf, katakanaWhy, linkOf as link28Of, linkWhy as link28Why, loanOf, loanWhy, partsDisplay, partsOf, partsWhy, rhythmDisplay, rhythmOf, rhythmWhy } from "./w28Phonics";
import { FOR_SINCE_CHOICES, W27_START, ableDisplay, ableOf, ableWhy, chKOf, chKWhy, forSinceDisplay, forSinceOf, forSinceWhy, homoOf, homoWhy, silentOf, silentWhy } from "./w27Phonics";
import { VOICE_CHOICES, W26_START, edIngDisplay, edIngOf, edIngWhy, punctOf, punctWhy, stressOf as meaningStressOf, stressWhy as meaningStressWhy, twisterDisplay, twisterOf, twisterWhy, voiceOf, voiceWhy } from "./w26Phonics";
import { INTONATION_CHOICES, W25_IVE_FOCUS, W25_NESS_FOCUS, W25_START, compoundDisplay, compoundOf, compoundWhy25, intonationOf, intonationWhy, iveDisplay, iveOf, iveWhy, nessDisplay, nessOf, nessWhy, synOf, synWhy } from "./w25Phonics";
import { W24_CONTRACTION_FOCUS, W24_IMIN_FOCUS, W24_OU_FOCUS, W24_PP_FOCUS, W24_START, contrOf, contrWhy, imInOf, imInWhy, overUnderOf, overUnderWhy, placeOf, placeWhy, ppDisplay, ppOf, ppWhy } from "./w24Phonics";
import { W23_MENT_FOCUS, W23_PART_FOCUS, W23_START, W23_TION_FOCUS, W23_Y_FOCUS, mentDisplay, mentOf, mentWhy, sciPartOf, sciPartWhy, shiftOf, shiftWhy, tionOf, tionWhy, yAdjOf, yAdjWhy } from "./w23Phonics";
import { MARK_CHOICES, W22_ADJ_FOCUS, W22_FAMILY_FOCUS, W22_PERSON_FOCUS, W22_START, adjOf, adjWhy, familyOf, familyWhy, markOf, markWhy, personOf, personWhy, schwaStressBlank, schwaStressWhy } from "./w22Phonics";
import { W21_DIS_FOCUS, W21_MISPRE_FOCUS, W21_PART_FOCUS, W21_START, W21_SUFFIX_FOCUS, disOf, disWhy, linkOf, linkWhy, misPreBlank, misPreWhy, partOf, partWhy, suffixOf, suffixWhy } from "./w21Phonics";
import { EAR_CHOICES, EAR_SOUNDS, URE_SOUNDS, W20_EAR_FOCUS, W20_START, W20_URE_FOCUS, earOf, earWhy, schwaBlank, schwaWhy, ureSound, ureWhy } from "./w20Phonics";
import { QU_CHOICES, QU_WHY, SILENT19_CHOICES, SILENT19_WHY, TOOL_CHOICES, TOOL_WHY, W19_OU_FOCUS, W19_QU_FOCUS, W19_RE_FOCUS, W19_SILENT_FOCUS, W19_START, W19_TOOL_FOCUS, ouSound, ouWhy, quBlank, reOf, reWhy, silentBlank19, toolEnding } from "./w19Phonics";
import { COMPARE_WHY, LY_WHY, W18_COMPARE_FOCUS, W18_FUL_FOCUS, W18_LY_FOCUS, W18_START, W18_UN_FOCUS, compareSpelling, fulLessOf, fulLessWhy, lySpelling, stressChoices, stressWhy, unOf, unWhy } from "./w18Phonics";
import { ENDING_WHY, OR_FOCUS_OF, OR_WHY, W17_CONTRACTION_FOCUS, W17_ENDING_FOCUS, W17_HOMOPHONE_RULE, W17_OR_FOCUS, W17_START, endingSpelling, homophoneOf, homophoneWhy, orSpelling, willContraction, willContractionWhy } from "./w17Phonics";
import { ED_WHY, IRREGULAR_FOCUS_OF, IRREGULAR_WHY, W16_ED_FOCUS, W16_ED_SOUND_RULE, W16_IRREGULAR_FOCUS, W16_START, edSpelling, irregularPast } from "./w16Phonics";
import { ING_WHY, W15_CONTRACTION_FOCUS, W15_ING_FOCUS, W15_START, W15_Y_FOCUS, Y3_LABEL, Y3_SOUNDS, Y3_WHY, compoundChoices, compoundSplit, compoundWhy, contractionOf, contractionWhy, ingSpelling, y3Sound } from "./w15Phonics";

export type QuestionType =
  | "listen_choose" // 音声を聞いて絵を選ぶ（リスニング）
  | "tpr_reflex" // 命令を聞いて動作を選ぶ（反射神経・制限時間あり）
  | "meaning_choose" // 英語 → 日本語の意味（語彙）
  | "expression_choose" // 学校テスト形式: 日本語に合う英文を選ぶ
  | "phonics_sound" // 単語を聞いて、最初の音/含まれる綴りを選ぶ（フォニックス）
  | "spell" // 絵と日本語を見て英語を書く（筆記・AI採点）
  | "speak"; // 発音判定

export interface Choice {
  id: string;
  label: string;
  sub?: string;
}

export interface Question {
  id: string;
  itemId: string;
  type: QuestionType;
  skill: Skill;
  promptJa: string;
  audioText?: string;
  playbackRate?: number;
  display?: string; // 画面に出す英語・絵文字など
  choices?: Choice[];
  answer: string; // 正解（choice.id もしくは期待するスペル）
  explanationJa: string; // 間違えたときの救済解説
  timeLimitMs?: number;
}

/**
 * クライアントに渡す形。正解・解説・itemId（スラッグに単語が含まれる）を伏せ、
 * 音声ファイルは itemId のハッシュ（audioKey）で引く。選択肢IDも a/b/c/d の不透明な記号。
 */
export type PublicQuestion = Omit<Question, "answer" | "explanationJa" | "itemId"> & { audioKey: string };
export const audioKeyOf = (itemId: string) => `a${hashSeed(itemId).toString(36)}`;
export const toPublic = ({ answer: _a, explanationJa: _e, itemId, ...q }: Question): PublicQuestion => ({
  ...q,
  // スペル問題は「日本語→英語で書く」学校テスト形式。読み上げ文字列＝正解なので渡さない
  audioText: q.type === "spell" ? undefined : q.audioText,
  audioKey: audioKeyOf(itemId),
});

// ---------------------------------------------------------------------------
// seed 付き乱数（mulberry32）
// ---------------------------------------------------------------------------
export function seededRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** ダイグラフ（2文字で1つの音。ワールド3） */
export const DIGRAPHS = ["sh", "ch", "th", "wh", "ck", "ng", "nk"] as const;
/** ことばの はじめに来るダイグラフ */
const START_DIGRAPHS = ["sh", "ch", "th", "wh"];

/**
 * その回のフォーカスがダイグラフなら、ダイグラフで問う（ship の最初の音を「s」にしない）。
 * - sh / ch / th / wh で始まる → 「さいしょの おとは どれ？」（選択肢はダイグラフ4つ）
 * - 途中・おわりにある（fish, duck, ring）→ 「どの つづりが はいってる？」
 * フォーカスが1文字の回（ワールド1の duck など）は、今までどおり最初の文字で問う。
 */
export function digraphQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const w = item.text.toLowerCase();
  const start = START_DIGRAPHS.find((d) => w.startsWith(d));
  // sh / ch / th / wh で始まる語は、どの回でもダイグラフで問う（chipmunk の最初の音を「c」にしない）
  if (!start && !focus.some((f) => (DIGRAPHS as readonly string[]).includes(f))) return null;
  if (start) {
    return { promptJa: "さいしょの おとは どれ？", choices: shuffle(START_DIGRAPHS, rng).map((d) => ({ id: d, label: d })), answer: start,
      explanationJa: `${item.text} は「${start}」の音ではじまるよ。2もじで 1つの おと！` };
  }
  const inside = DIGRAPHS.find((d) => w.includes(d));
  if (!inside) return null;
  const others = shuffle(DIGRAPHS.filter((d) => !w.includes(d)), rng).slice(0, 3);
  return { promptJa: "どの つづりが はいってる？", choices: shuffle([inside, ...others], rng).map((d) => ({ id: d, label: d })), answer: inside,
    explanationJa: `${item.text} には「${inside}」が はいってるよ。2もじで 1つの おと！` };
}

/** 語頭ブレンド（ワールド4）。2つの子音を つなげて読む */
export const BLENDS = ["st", "sp", "sn", "sm", "sk", "sw", "bl", "cl", "fl", "gl", "pl", "sl", "br", "cr", "dr", "fr", "gr", "tr", "tw"] as const;
/** 3つの子音のブレンド */
export const THREE_BLENDS = ["str", "spr", "scr", "spl"] as const;

/**
 * その回のフォーカスに語頭ブレンドがあり、語がブレンドで始まるなら「さいしょの 2つ（3つ）の おと」で問う
 * （stop の答えを「s」だけにしない）。まちがいの選択肢は、同じ1文字目（cl ↔ cr）や
 * 同じ2文字目（cl ↔ bl）のブレンドを優先する＝聞きくらべの練習になる。
 */
export function blendQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const all: readonly string[] = [...THREE_BLENDS, ...BLENDS];
  if (!focus.some((f) => all.includes(f))) return null;
  const w = item.text.toLowerCase();
  const start = all.find((b) => w.startsWith(b));
  if (!start) return null;
  const pool = (start.length === 3 ? THREE_BLENDS : BLENDS).filter((b) => b !== start && !w.startsWith(b)) as string[];
  const sameFirst = shuffle(pool.filter((b) => b[0] === start[0]), rng);
  const sameSecond = shuffle(pool.filter((b) => b[0] !== start[0] && b[1] === start[1]), rng);
  const rest = shuffle(pool.filter((b) => !sameFirst.includes(b) && !sameSecond.includes(b)), rng);
  // 同じ1文字目だけだと s- ブレンドばかりになるので、1つは2文字目が同じものを入れる
  const near = [...sameFirst.slice(0, 2), ...sameSecond.slice(0, 1)];
  const others = [...near, ...sameFirst.slice(2), ...sameSecond.slice(1), ...rest].slice(0, 3);
  const n = start.length === 3 ? "3つ" : "2つ";
  return { promptJa: `さいしょの ${n}の おとは どれ？`, choices: shuffle([start, ...others], rng).map((b) => ({ id: b, label: b })), answer: start,
    explanationJa: `${item.text} は「${start}」ではじまるよ。${start.split("").join(" と ")} を くっつけて よもう！` };
}

/** 語末ブレンド（ワールド5）。focus では "-st" のように 先頭に ハイフンを つけて「ことばの おわり」を あらわす */
export const FINAL_BLENDS = ["st", "nd", "mp", "nt", "lk", "ft", "sk", "lp"] as const;
/** 語尾（ワールド5）: 複数形の -s と -ing */
export const SUFFIXES = ["ing", "s"] as const;

/**
 * その回のフォーカスに語末（"-st" "-s" "-ing" など）があり、語が それで おわるなら「おわりの おと」で問う
 * （nest の答えを 最初の「n」にしない）。
 * - 語末ブレンド → 「おわりの 2つの おとは どれ？」（まちがいの選択肢は nd ↔ nt のような 1文字目が同じもの、
 *   st ↔ nt のような 2文字目が同じものを優先＝聞きくらべ）
 * - -s / -ing → 「おわりに ついている のは どれ？」
 */
export function endingQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  // ワールド10 の "-y" "-le" は w10Question で 問う（語末ブレンドの 選択肢に しない）
  const known: readonly string[] = [...SUFFIXES, ...FINAL_BLENDS];
  const endings = (getLesson(item.lessonNo)?.phonics.focus ?? []).filter((f) => f.startsWith("-")).map((f) => f.slice(1).toLowerCase()).filter((e) => known.includes(e));
  if (endings.length === 0) return null;
  const w = item.text.toLowerCase();
  const end = endings.filter((e) => w.endsWith(e)).sort((a, b) => b.length - a.length)[0];
  if (!end) return null;
  const all: readonly string[] = [...SUFFIXES, ...FINAL_BLENDS];
  const pool = all.filter((e) => e !== end && !w.endsWith(e));
  if ((SUFFIXES as readonly string[]).includes(end)) {
    const others = [...pool.filter((e) => (SUFFIXES as readonly string[]).includes(e)), ...shuffle(pool.filter((e) => !(SUFFIXES as readonly string[]).includes(e)), rng)].slice(0, 3);
    return { promptJa: "おわりに ついている のは どれ？", choices: shuffle([end, ...others], rng).map((e) => ({ id: e, label: e })), answer: end,
      explanationJa: end === "s"
        ? `${item.text} は おわりに「s」。ふたつ いじょうの ときに つけるよ。`
        : `${item.text} は おわりに「ing」。「〜している」の いみに なるよ。` };
  }
  const blends = pool.filter((e) => (FINAL_BLENDS as readonly string[]).includes(e));
  const sameFirst = shuffle(blends.filter((b) => b[0] === end[0]), rng);
  const sameSecond = shuffle(blends.filter((b) => b[0] !== end[0] && b[1] === end[1]), rng);
  const rest = shuffle(blends.filter((b) => !sameFirst.includes(b) && !sameSecond.includes(b)), rng);
  const others = [...sameFirst.slice(0, 1), ...sameSecond.slice(0, 1), ...sameFirst.slice(1), ...sameSecond.slice(1), ...rest].slice(0, 3);
  return { promptJa: "おわりの 2つの おとは どれ？", choices: shuffle([end, ...others], rng).map((e) => ({ id: e, label: e })), answer: end,
    explanationJa: `${item.text} は「${end}」で おわるよ。${end.split("").join(" と ")} を くっつけて よもう！` };
}

/** マジック e（ワールド6）。focus では "a_e" のように書く（_ に子音が1つ入る） */
export const MAGIC_E = ["a_e", "i_e", "o_e", "u_e", "e_e"] as const;
const SHORT_VOWELS = ["a", "i", "o", "u", "e"] as const;
/** 長い母音＝アルファベットの なまえの よみ */
const LETTER_NAME: Record<string, string> = { a: "エイ", i: "アイ", o: "オウ", u: "ユー（ウー）", e: "イー" };

/**
 * その回のフォーカスにマジック e（"a_e" など）があれば、母音の おとで問う（cake の答えを 最初の「c」にしない）。
 * - cake / cakes / cupcake（おわりが 母音＋子音1つ＋e）→ 正解は a_e
 * - cap（短母音1つ。くらべの回）→ 正解は a
 * まちがいの選択肢には かならず 同じ母音の ペア（a ↔ a_e）を入れる＝みじかい おと と ながい おとの 聞きくらべ。
 */
export function magicEQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  if (!focus.some((f) => (MAGIC_E as readonly string[]).includes(f))) return null;
  const w = item.text.toLowerCase();
  const magic = w.match(/([aeiou])[b-df-hj-np-tv-z]es?$/);
  const short = w.match(/^[^aeiou]*([aeiou])[^aeiou]+$/);
  const v = magic?.[1] ?? short?.[1];
  if (!v) return null;
  const answer = magic ? `${v}_e` : v;
  const pair = magic ? v : `${v}_e`;
  const all: string[] = [...MAGIC_E, ...SHORT_VOWELS];
  const rest = all.filter((x) => x !== answer && x !== pair);
  // その回の フォーカスに ある おとを 先に（ふりかえり回は a_e / i_e / o_e の 聞きわけに なる）
  const others = [...shuffle(rest.filter((x) => focus.includes(x)), rng), ...shuffle(rest.filter((x) => !focus.includes(x)), rng)].slice(0, 2);
  return { promptJa: "きこえた ぼいん（a i u e o）の おとは どれ？", choices: shuffle([answer, pair, ...others], rng).map((x) => ({ id: x, label: x })), answer,
    explanationJa: magic
      ? `${item.text} は「${answer}」。おわりの e は よまないで、${v} を なまえの「${LETTER_NAME[v]}」で よむよ。`
      : `${item.text} は みじかい「${v}」の おと。おわりに e が ないね。` };
}

/** 母音チーム（ワールド7〜8）。おとの表は ./vowelTeams.ts（oo・ow は ことばで おとが かわる） */
export { VOWEL_TEAM_GROUPS, VOWEL_TEAMS } from "./vowelTeams";

/**
 * その回のフォーカスに母音チーム（"ai" "oo" "igh" など）があれば、母音の おとで問う（rain の答えを 最初の「r」にしない）。
 * 音声だけの問題なので、おなじ おとに なりうる つづり（ai ↔ ay、ee ↔ ea、oa ↔ ow、ou ↔ ow、oi ↔ oy、igh ↔ ie）は
 * いっしょに 選択肢に 出さない（聞きわけられない）。ことばの 中に きこえる おとの つづりも 出さない（playground の ay など）。
 * 選択肢 = 正解 ＋ みじかい母音（rain ↔ a、night ↔ i）＋ ほかの おとの つづり 2つ（その回の フォーカスを 先に。まだ ならっていない つづりは 出さない）。
 * ことばに 入っている チームが 2つ あるとき（railway、moonlight）は フォーカスの 順で 先の もの。
 */
export function vowelTeamQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const teams = focus.filter((f) => VOWEL_TEAMS.includes(f));
  if (teams.length === 0) return null;
  const w = item.text.toLowerCase();
  const answer = teams.find((f) => w.includes(f));
  if (!answer) return null;
  const ja = teamSound(answer, w);
  const short = shortVowelOf(answer);
  // 正解の つづりが なりうる おと（ow なら オウ と アウ → oa も ou も 出さない）と、ことばの 中で きこえる おとは 出さない
  const blocked = new Set<string>([ja, ...possibleSounds(answer), ...VOWEL_TEAMS.filter((x) => w.includes(x)).map((x) => teamSound(x, w))]);
  const learned = VOWEL_TEAMS.filter((x) => x !== answer && (VOWEL_TEAM_INTRO[x] <= item.lessonNo || focus.includes(x)));
  const ordered = [...shuffle(learned.filter((x) => focus.includes(x)), rng), ...shuffle(learned.filter((x) => !focus.includes(x)), rng)];
  const others: string[] = [];
  for (const x of ordered) {
    if (others.length === 2) break;
    const s = possibleSounds(x);
    if (s.some((v) => blocked.has(v))) continue;
    others.push(x);
    s.forEach((v) => blocked.add(v));
  }
  // おとの グループが たりない とき（seaweed＋ai など）は、のこりの みじかい母音で うめる
  const fill = shuffle(["a", "e", "i", "o", "u"].filter((x) => x !== short && !others.some((o) => shortVowelOf(o) === x)), rng);
  const choices = [answer, short, ...others, ...fill].slice(0, 4);
  return { promptJa: "きこえた ぼいんの おとは どれ？", choices: shuffle(choices, rng).map((x) => ({ id: x, label: x })), answer,
    explanationJa: `${item.text} は「${answer}」。${answer.length}つの もじで「${ja}」の おとに なるよ（みじかい ${short} とは ちがう おと）。` };
}

/** r の つく母音（ワールド9）。おとの表は ./rControlled.ts（er / ir / ur は おなじ おと） */
export { R_VOWEL_GROUPS, R_VOWELS } from "./rControlled";

/**
 * その回のフォーカスに r の つく母音（"ar" "er" "air" など）があれば、母音の おとで問う（car の答えを 最初の「c」に、
 * shark の答えを「sh」に しない）。
 * 音声だけの問題なので、おなじ おとの つづり（er ↔ ir ↔ ur）は いっしょに 選択肢に 出さない。
 * ことばの 中に ある ほかの r の つく母音（airport の or、farmer の er）の おとも 出さない。
 * 選択肢 = 正解 ＋ みじかい母音（car ↔ a、bird ↔ i）＋ ほかの おとの つづり 2つ（その回の フォーカスを 先に。
 * まだ ならっていない つづりは 出さない。たりない ときは のこりの みじかい母音で うめる）。
 * ことばに 2つ あるとき（farmer、airport）は フォーカスの 順で 先の もの。
 */
export function rControlledQuestion(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa"> | null {
  const focus = (getLesson(item.lessonNo)?.phonics.focus ?? []).filter((f) => R_VOWELS.includes(f));
  if (focus.length === 0) return null;
  const found = findRSpellings(item.text);
  const answer = focus.find((f) => found.includes(f));
  if (!answer) return null;
  const ja = rSound(answer);
  const short = shortVowelOfR(answer);
  const blocked = new Set<string>([ja, ...found.map(rSound)]);
  const lessonFocus = getLesson(item.lessonNo)?.phonics.focus ?? [];
  const learned = R_VOWELS.filter((x) => x !== answer && (R_VOWEL_INTRO[x] <= item.lessonNo || lessonFocus.includes(x)));
  const ordered = [...shuffle(learned.filter((x) => lessonFocus.includes(x)), rng), ...shuffle(learned.filter((x) => !lessonFocus.includes(x)), rng)];
  const others: string[] = [];
  for (const x of ordered) {
    if (others.length === 2) break;
    if (blocked.has(rSound(x))) continue;
    others.push(x);
    blocked.add(rSound(x));
  }
  const fill = shuffle(["a", "e", "i", "o", "u"].filter((x) => x !== short), rng);
  const choices = [answer, short, ...others, ...fill].slice(0, 4);
  return { promptJa: "きこえた ぼいんの おとは どれ？", choices: shuffle(choices, rng).map((x) => ({ id: x, label: x })), answer,
    explanationJa: `${item.text} は「${answer}」。r が つくと ${R_MOUTH[ja]}「${ja}」の おとに なるよ（みじかい ${short} とは ちがう おと）。` };
}

/** ワールド10（soft c・soft g・-y・-le・aw au ew）。おとの表は ./w10Phonics.ts */
export { W10_FOCUS, W10_INTRO } from "./w10Phonics";

/**
 * その回のフォーカスに ワールド10 の つづりが あれば（W10_INTRO より あとの 回だけ）、フォーカスの 順に ことばに あうもので 問う。
 * - "c" / "g": 「この ことばの c は どの おと？」（s / k / ch / sh、g は j / g / ch / d）。ことばを 画面に 出す（あとの もじで きまる ため）。
 *   ことばの 中で c（g）の おとが まざる とき（bicycle）は 問わない。
 * - "-y": 「おわりの y は どの つづりと おなじ おと？」（happy → ee、fly → igh ＋ ほかの ながい おと 2つ）
 * - "-le": 「おわりに きこえる おとは どれ？」（-le ＋ -y / -er / -ing）
 * - "aw" "au" "ew": 「きこえた ぼいんの おとは どれ？」（正解 ＋ みじかい母音 ＋ ちがう おとの つづり。aw と au は いっしょに 出さない）
 * 語末（endingQuestion）より 先に よぶ（"-y" "-le" を 語末ブレンドとして 問わない）。
 */
export function w10Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  const focus = (getLesson(item.lessonNo)?.phonics.focus ?? []).filter((f) => W10_INTRO_MAP[f] !== undefined && W10_INTRO_MAP[f] <= item.lessonNo);
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if (f === "c" || f === "g") {
      const s = cgSounds(f, w);
      if (s.length === 0 || s.some((x) => x !== s[0])) continue;
      const answer = CG_LETTER[f][s[0]];
      const kana = CG_KANA[f][s[0]];
      const why = s[0] === "soft" ? `${f} の あとに e・i・y が くると「${kana}」に なるよ。` : `${f} の あとが e・i・y では ない ときは「${kana}」だよ。`;
      return { promptJa: `この ことばの ${f} は どの おと？`, display: item.text, choices: pick(CG_CHOICES[f]), answer,
        explanationJa: `${item.text} の ${f} は「${kana}」（${answer} と おなじ おと）。${why}` };
    }
    if (f === "-y") {
      const ys = ySound(w);
      if (!ys) continue;
      const answer = Y_TEAM[ys];
      const other = Y_TEAM[ys === "イー" ? "アイ" : "イー"];
      const fill = shuffle(["ai", "oa", "oo", "oi"], rng).slice(0, 2);
      return { promptJa: "おわりの y は どの つづりと おなじ おと？", display: item.text, choices: pick([answer, other, ...fill]), answer,
        explanationJa: ys === "イー"
          ? `${item.text} の おわりの y は「イー」（ee と おなじ おと）。2つ いじょうの まとまりの ことばの おわりの y は「イー」が おおいよ。`
          : `${item.text} の おわりの y は「アイ」（igh と おなじ おと）。ほかに ぼいんの ない みじかい ことばの y は「アイ」だよ。` };
    }
    if (f === "-le") {
      if (!w.endsWith("le")) continue;
      return { promptJa: "おわりに きこえる おとは どれ？", choices: pick(["-le", "-y", "-er", "-ing"]), answer: "-le",
        explanationJa: `${item.text} は おわりが「-le」。さいごの e は よまないで、かるく「ル」と よむよ。` };
    }
    if ((W10_TEAMS as readonly string[]).includes(f)) {
      if (!w.includes(f)) continue;
      const ja = w10TeamSound(f);
      const short = f[0];
      // aw と au は おなじ おと。ew の ときは aw（au）を、aw / au の ときは ew を（ならっていれば）くらべに 入れる
      const pair = (ja === "オー" ? ["ew"] : ["aw", "au"]).filter((x) => W10_INTRO_MAP[x] <= item.lessonNo || focus.includes(x));
      const contrast = shuffle(pair, rng).slice(0, 1);
      const fill = shuffle(["ai", "ee", "igh", "oi", "ou"].filter((x) => !w.includes(x)), rng);
      const choices = [f, short, ...contrast, ...fill].slice(0, 4);
      return { promptJa: "きこえた ぼいんの おとは どれ？", choices: pick(choices), answer: f,
        explanationJa: ja === "オー"
          ? `${item.text} は「${f}」。2つの もじで「オー」の おとに なるよ（aw と au は おなじ おと。みじかい a とは ちがう）。`
          : `${item.text} は「ew」。2つの もじで「ウー」の おとに なるよ（moon の oo と おなじ おと）。` };
    }
  }
  return null;
}

/** ワールド11（-ed・-er・-est・サイトワード）。おとの表は ./w11Phonics.ts */
export { W11_FOCUS, W11_INTRO } from "./w11Phonics";

/**
 * その回のフォーカスに ワールド11 の つづりが あれば（W11_INTRO より あとの 回だけ）、フォーカスの 順に ことばに あうもので 問う。
 * - "-ed": 「この ことばの おわりの -ed は どの おと？」（ト / ド / イド）。まえの もじで きまるので ことばを 画面に 出す。
 * - "-er" / "-est": 「おわりに きこえる おとは どれ？」（-er / -est / -ed / -ing）
 * - サイトワード: 「きこえた ことばは どれ？」（その回の ことば・ならった サイトワードから にている つづりを 選択肢に）。
 *   サイトワードの 回（rule "sight-words"）は、その回の ことば（saw, wood など）も おなじ 形で 問う。
 * 語末（endingQuestion）より 先に よぶ。
 */
export function w11Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  const lesson = getLesson(item.lessonNo);
  const focus = (lesson?.phonics.focus ?? []).filter((f) => W11_INTRO_MAP[f] !== undefined && W11_INTRO_MAP[f] <= item.lessonNo);
  if (!lesson || focus.length === 0) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if (f === "-ed") {
      const s = edSound(w);
      if (!s) continue;
      const why = s === "id" ? "t や d の あとの -ed は「イド」と よむよ。"
        : s === "t" ? "p・k・s・sh・ch のような いきだけの おとの あとの -ed は ちいさく「ト」と よむよ。"
        : "こえの でる おと（n・l・y など）の あとの -ed は「ド」と よむよ。";
      return { promptJa: "この ことばの おわりの -ed は どの おと？", display: item.text,
        choices: shuffle(["t", "d", "id"] as const, rng).map((x) => ({ id: x, label: ED_LABEL[x] })), answer: s,
        explanationJa: `${item.text} の -ed は「${ED_KANA[s]}」。${why}` };
    }
    if (f === "-er" || f === "-est") {
      const end = f.slice(1);
      if (!w.endsWith(end)) continue;
      const mean = f === "-est" ? "「いちばん」の いみ" : ER_MORE_WORDS.has(w) ? "「もっと」の いみ" : "「～する ひと」の いみ";
      return { promptJa: "おわりに きこえる おとは どれ？", choices: pick(["-er", "-est", "-ed", "-ing"]), answer: f,
        explanationJa: `${item.text} は おわりが「${f}」。${f} が つくと ${mean}に なるよ。` };
    }
    // サイトワード: その ことばか、サイトワードの 回の ことば
    if (w !== f && lesson.phonics.rule !== "sight-words") continue;
    const ending = (x: string) => focus.some((e) => e.startsWith("-") && x.endsWith(e.slice(1)));
    const fromLesson = lesson.phonics.words.map((x) => x.toLowerCase()).filter((x) => x !== w && !ending(x));
    const learned = W11_SIGHT_WORDS.filter((x) => W11_INTRO_MAP[x] <= item.lessonNo && x !== w && !fromLesson.includes(x));
    const others = [...shuffle(fromLesson, rng), ...shuffle(learned, rng)].slice(0, 3);
    return { promptJa: "きこえた ことばは どれ？", choices: pick([w, ...others]), answer: w,
      explanationJa: `${SIGHT_TIP[w] ?? `${item.text} は サイトワード。`}もじを みたら すぐ よめるように しよう。` };
  }
  return null;
}

/** ワールド12（サイトワード 総復習・5W1H・多音節語）。おとの表は ./w12Phonics.ts */
export { W12_INTRO, W12_SIGHT_WORDS } from "./w12Phonics";

/**
 * ワールド12 の 回（L331〜）で、フォーカスに サイトワード か 多音節語（"bas-ket-ball"）が あれば 問う。
 * - サイトワード: 「きこえた ことばは どれ？」（w11Question と おなじ 形。選択肢は その回の ことば → ならった サイトワード
 *   〈ワールド11 ＋ ワールド12〉の じゅん。-ed / -er / -est の ことばや 多音節語は 入れない）。
 *   サイトワードの 回（rule "sight-words"）は その回の ことば（where, then など）も おなじ 形で 問う。ふりかえり回は その ことば だけ。
 * - 多音節語（L336〜）: 「この ことばは いくつに わけて よむ？」（てを たたく かず。ことばを 画面に 出す。選択肢は 1〜5 の ちかい かず 4つ）
 * あてはまらなければ null（音読の 回の a_e・ai・-ed などは それぞれの ワールドの 問題で 問う）。
 * blendQuestion の つぎ・ワールド10 の まえに よぶ（what / when / where / why の wh を ダイグラフで 問わない）。
 */
export function w12Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W12_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const introOf = (x: string) => W11_INTRO_MAP[x] ?? W12_INTRO_MAP[x];
  const allSight = [...W11_SIGHT_WORDS, ...W12_SIGHT_WORDS];
  const sightFocus = lesson.phonics.focus.filter((f) => allSight.includes(f) && introOf(f) <= item.lessonNo);

  const syl = item.lessonNo >= W12_SYLLABLE_START ? syllablesOf(w, lesson.phonics.focus) : null;
  if (syl) {
    const n = syl.length;
    const near = [1, 2, 3, 4, 5].filter((k) => k !== n).sort((a, b) => Math.abs(a - n) - Math.abs(b - n) || a - b).slice(0, 3);
    return { promptJa: "この ことばは いくつに わけて よむ？（てを たたいて かぞえよう）", display: item.text,
      choices: shuffle([n, ...near], rng).map((k) => ({ id: String(k), label: `${k}つ` })), answer: String(n),
      explanationJa: `${item.text} は ${syl.join("・")} の ${n}つ。まとまりごとに てを たたいて よもう。` };
  }

  if (sightFocus.length === 0) return null;
  if (!sightFocus.includes(w) && lesson.phonics.rule !== "sight-words") return null;
  const skip = (x: string) => (/(ed|er|est)$/.test(x) && !allSight.includes(x)) || syllablesOf(x, lesson.phonics.focus) !== null;
  const fromLesson = lesson.phonics.words.map((x) => x.toLowerCase()).filter((x) => x !== w && !skip(x));
  const learned = allSight.filter((x) => introOf(x) <= item.lessonNo && x !== w && !fromLesson.includes(x));
  const others = [...shuffle(fromLesson, rng), ...shuffle(learned, rng)].slice(0, 3);
  return { promptJa: "きこえた ことばは どれ？", choices: pick([w, ...others]), answer: w,
    explanationJa: `${W12_SIGHT_TIP[w] ?? SIGHT_TIP[w] ?? `${item.text} は サイトワード。`}もじを みたら すぐ よめるように しよう。` };
}

/** ワールド13（3 単現の -s / -es / -ies・-tch / -dge）。おとの表は ./w13Phonics.ts */
export { W13_START } from "./w13Phonics";

/**
 * ワールド13 の 回（L361〜）で、フォーカスに ワールド13 の つづりが あれば、フォーカスの 順に ことばに あうもので 問う。
 * - "-s" / "-es": 「この ことばの おわりの s は どの おと？」（ス / ズ / イズ。イズは -es を ならう L366 から）。ことばを 画面に 出す。
 * - "-ies" / "goes" / "does" / "has": 「he / she の ときの ただしい つづりは どれ？」（studies / studys / studyes、plays / plaies …）
 * - "tch" / "dge"（ふりかえりの "ch" / "ge"）: 「＿ に はいる つづりは どれ？」（ca＿ → tch、tea＿ → ch）。みじかい母音の あとかで きまる。
 * あてはまらなければ null。語末（endingQuestion：複数形の -s）より 先に よぶ。
 */
export function w13Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W13_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W13_S_FOCUS as readonly string[]).includes(f)) {
      const s = sSound(w);
      if (!s) continue;
      const opts: SSound[] = item.lessonNo >= W13_IZ_START || s === "iz" ? ["s", "z", "iz"] : ["s", "z"];
      const why = s === "iz" ? "s・x・ch・sh の あとは es を つけて「イズ」と よむよ。"
        : s === "s" ? "p・t・k・f のような いきだけの おとの あとの s は「ス」と よむよ。"
        : "こえの でる おと（n・m・l・d・y や 母音）の あとの s は「ズ」と よむよ。";
      return { promptJa: "この ことばの おわりの s は どの おと？", display: item.text,
        choices: shuffle(opts, rng).map((x) => ({ id: x, label: S_LABEL[x] })), answer: s,
        explanationJa: `${item.text} の おわりは「${S_KANA[s]}」。${why}` };
    }
    if ((W13_HE_FOCUS as readonly string[]).includes(f)) {
      const h = heSpelling(w);
      if (!h) continue;
      const why = h.kind === "ies" ? `${h.base} は y の まえが 子音なので、y を i に かえて es を つけるよ。`
        : h.kind === "ys" ? `${h.base} は y の まえが 母音（a e i o u）なので、そのまま s を つけるよ。`
        : `${h.base} は he / she の とき とくべつな 形「${h.answer}」に なるよ。`;
      return { promptJa: "he / she の ときの ただしい つづりは どれ？", choices: pick([h.answer, ...h.wrong]), answer: h.answer,
        explanationJa: `ただしい つづりは「${h.answer}」。${why}` };
    }
    if ((W13_CH_FOCUS as readonly string[]).includes(f)) {
      const b = chBlank(w, focus);
      if (!b) continue;
      const short = b.answer === "tch" || b.answer === "dge";
      const sound = b.answer === "tch" || b.answer === "ch" ? "チ" : "ヂ";
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(CH_CHOICES[b.answer]), answer: b.answer,
        explanationJa: short
          ? `${item.text} は「${b.answer}」。みじかい 母音（${b.before}）の すぐ あとの「${sound}」は ${b.answer} と かくよ。`
          : `${item.text} は「${b.answer}」。みじかい 母音の すぐ あと では ない（${b.before} の あと）ので ${b.answer} と かくよ。` };
    }
  }
  return null;
}

/** ワールド14（複数形の -es / -ies / -ves・だまっている もじ kn wr mb・ph・大きな数の つづり）。表は ./w14Phonics.ts */
export { W14_START } from "./w14Phonics";

/**
 * ワールド14 の 回（L391〜）で、フォーカスに ワールド14 の つづりが あれば、フォーカスの 順に ことばに あうもので 問う。
 * - "es" / "ies" / "ys" / "ves": 「ふたつ いじょうの ときの ただしい つづりは どれ？」（box → boxes / boxs / boxis、knife → knives / knifes / knifs）
 * - "kn" / "wr" / "mb" / "ph": 「＿ に はいる つづりは どれ？」（＿ife → kn、la＿ → mb、＿one → ph）
 * - "-ty" / "-teen" / "hundred" / "thousand": 「きこえた 数の ただしい つづりは どれ？」（forty / fourty。-teen と -ty の 回は thirteen / thirty の ききわけ）
 * あてはまらなければ null。ワールド13 の 問題より 先に よぶ（ふりかえり回の ワールド13 の focus は w13Question へ）。
 */
export function w14Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W14_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W14_PLURAL_FOCUS as readonly string[]).includes(f)) {
      const p = pluralSpelling(w);
      if (!p) continue;
      return { promptJa: "ふたつ いじょうの ときの ただしい つづりは どれ？", display: `${p.base} → ？`, choices: pick([p.answer, ...p.wrong]), answer: p.answer,
        explanationJa: `${p.base} → ${p.answer}。${PLURAL_WHY[p.kind](p.base)}` };
    }
    if ((W14_SILENT_FOCUS as readonly string[]).includes(f)) {
      const b = silentBlank(w, f);
      if (!b) continue;
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(SILENT_CHOICES[b.answer]), answer: b.answer,
        explanationJa: `${item.text} は「${b.answer}」。${SILENT_WHY[b.answer]}` };
    }
    if ((W14_NUMBER_FOCUS as readonly string[]).includes(f)) {
      const n = numberSpelling(w, focus);
      if (!n) continue;
      return { promptJa: "きこえた 数の ただしい つづりは どれ？", choices: pick([n.answer, ...n.wrong]), answer: n.answer,
        explanationJa: `ただしい つづりは「${n.answer}」。${n.tip}` };
    }
  }
  return null;
}

/**
 * ワールド15（かぜの草原・L421〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-ing": 「ing を つけた ただしい つづりは？」（make → making / makeing / makking、run → running / runing）
 * - "sun-flower"（複合語）: 「2つの ことばに わけると？」（sun + flower / su + nflower / sunf + lower）
 * - "'m" "'s" "'re" "n't": 「みじかい かたちは？」（she is → she's / shes / she'is）
 * - "y": 「この ことばの y は どの おと？」（イェ / イー / アイ）
 * あてはまらなければ null。ワールド14 の 問題より 先に よぶ（running を 語末の -ing、sunflower を はくの 数で 問わない）。
 */
export function w15Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W15_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W15_ING_FOCUS as readonly string[]).includes(f)) {
      const g = ingSpelling(w);
      if (!g) continue;
      return { promptJa: "ing を つけた ただしい つづりは どれ？", display: `${g.base} → ？`, choices: pick([g.answer, ...g.wrong]), answer: g.answer,
        explanationJa: `${g.base} → ${g.answer}。${ING_WHY[g.kind](g.base)}` };
    }
    if (f.includes("-")) {
      const parts = compoundSplit(w, [f]);
      if (!parts) continue;
      const c = compoundChoices(parts[0], parts[1]);
      return { promptJa: "2つの ことばに わけると どれ？", display: item.text, choices: pick([c.answer, ...c.wrong]), answer: c.answer,
        explanationJa: compoundWhy(item.text, parts[0], parts[1]) };
    }
    if ((W15_CONTRACTION_FOCUS as readonly string[]).includes(f)) {
      const c = contractionOf(item.text);
      if (!c || !w.includes(f)) continue;
      return { promptJa: "みじかい かたちは どれ？", display: `${c.full} → ？`, choices: pick([c.answer, ...c.wrong]), answer: c.answer,
        explanationJa: contractionWhy(c.full, c.answer) };
    }
    if ((W15_Y_FOCUS as readonly string[]).includes(f)) {
      const y = y3Sound(w);
      if (!y) continue;
      return { promptJa: "この ことばの y は どの おと？", display: item.text, choices: Y3_SOUNDS.map((s) => ({ id: s, label: Y3_LABEL[s] })), answer: y,
        explanationJa: `${item.text} の y は「${y}」。${Y3_WHY[y]}` };
    }
  }
  return null;
}

/**
 * ワールド40（はじまりの星・L1171〜）の フォニックス（6 年間の 総まとめ: つづり・ことばの パーツ・語根・スピーチの 間・苦手な 音）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - つづり（"rain"）: 「つづりの まとめ。＿＿ に 入る つづりは どれ？」（r＿＿n（雨）→ ai / ay / ei）
 * - パーツ（"unhappy"）: 「ことばの パーツの まとめ。＿＿ に 入る パーツは どれ？」（＿＿ ＋ happy → un / dis / re）
 * - 語根（"inspect"）: 「語根の まとめ。おなじ 語根の なかまは どれ？」（inspect（しらべる）→ spectator / structure / export）
 * - スピーチの 間（"Six years ago"）: 「スピーチの 間。どの ことばの あとで 間（‖）を とる？」（Six years ago I didn't know any English. → ago）
 * - 苦手な 音（"right"）: 「苦手な 音の 総点検。きこえた ことばは どれ？」（🔊 right → right / light / night）
 * あてはまらなければ null。ワールド39 の 問題より 先に よぶ。
 */
export function w40Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W40_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const s = spellReviewOf(item.text);
  if (s && focus.includes(s.word)) return { promptJa: "つづりの まとめ。＿＿ に 入る つづりは どれ？", display: spellReviewDisplay(s), choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: spellReviewWhy(s) };
  const p = partsReviewOf(item.text);
  if (p && focus.includes(p.word)) return { promptJa: "ことばの パーツの まとめ。＿＿ に 入る パーツは どれ？", display: partsReviewDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: partsReviewWhy(p) };
  const r = rootReviewOf(item.text);
  if (r && focus.includes(r.word)) return { promptJa: "語根の まとめ。おなじ 語根の なかまは どれ？", display: rootReviewDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: rootReviewWhy(r) };
  const a = pauseReviewOf(item.text);
  if (a && focus.includes(a.phrase.toLowerCase())) return { promptJa: "スピーチの 間。どの ことばの あとで 間（‖）を とる？", display: pauseReviewDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: pauseReviewWhy(a), audioText: a.spoken };
  const o = soundCheckOf(item.text);
  if (o && focus.includes(o.word)) return { promptJa: "苦手な 音の 総点検。きこえた ことばは どれ？", display: soundCheckDisplay(o), choices: pick([o.answer, ...o.wrong]), answer: o.answer, explanationJa: soundCheckWhy(o), audioText: o.word };
  return null;
}

/**
 * ワールド39（せかいの円卓・L1141〜）の フォニックス（環境の ことばの パーツ・大きな 数と 割合・ディベートの プロソディ・つなぎの ことば・ヘッジの ことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - パーツ（"renewable"）: 「環境の ことばの パーツ。＿＿ に 入る パーツは どれ？」（re ＋ ＿＿ ＋ able → new / cycle / duce）
 * - 数（"one million"）: 「大きな 数と 割合。英語で どう よむ？」（1,000,000 → one million / one billion / ten thousand）
 * - プロソディ（"We believe that"）: 「ディベートの プロソディ。いちばん つよく いう ことばは どれ？」（We believe that schools should have gardens. → believe）
 * - つなぎ（"However"）: 「つなぎの ことば。＿＿ に 入る ことばは どれ？」（Plastic is useful. ＿＿, it can harm the sea. → However）
 * - ヘッジ（"probably"）: 「ヘッジの ことば。いいすぎない ことばは どれ？」（It will ＿＿ rain this afternoon.（たぶん）→ probably / definitely / never）
 * あてはまらなければ null。ワールド38 の 問題より 先に よぶ。
 */
export function w39Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W39_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const e = ecoWordOf(item.text);
  if (e && focus.includes(e.word)) return { promptJa: "環境の ことばの パーツ。＿＿ に 入る パーツは どれ？", display: ecoWordDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: ecoWordWhy(e) };
  const n = bigNumberOf(item.text);
  if (n && focus.includes(n.word)) return { promptJa: "大きな 数と 割合。英語で どう よむ？", display: bigNumberDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: bigNumberWhy(n), audioText: n.answer };
  const d = debateOf(item.text);
  if (d && focus.includes(d.phrase.toLowerCase())) return { promptJa: "ディベートの プロソディ。いちばん つよく いう ことばは どれ？", display: debateDisplay(d), choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: debateWhy(d), audioText: d.sentence };
  const m = markerOf(item.text);
  if (m && focus.includes(m.marker.toLowerCase())) return { promptJa: "つなぎの ことば。＿＿ に 入る ことばは どれ？", display: markerDisplay(m), choices: pick([m.answer, ...m.wrong]), answer: m.answer, explanationJa: markerWhy(m) };
  const h = hedgeOf(item.text);
  if (h && focus.includes(h.word)) return { promptJa: "ヘッジの ことば。いいすぎない ことばは どれ？", display: hedgeDisplay(h), choices: pick([h.answer, ...h.wrong]), answer: h.answer, explanationJa: hedgeWhy(h) };
  return null;
}

/**
 * ワールド38（こころの高原・L1111〜）の フォニックス（気持ちの ことばの つづり・句動詞・共感の イントネーション・慣用句・性格の ことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - つづり（"embarrassed"）: 「気持ちの ことばの つづり。ただしい つづりは どれ？」（I fell in front of everyone. I was so ＿＿. → embarrassed / embarassed / embarrased）
 * - 句動詞（"cheer up"）: 「気持ちの 句動詞。＿＿ に 入る ことばは どれ？」（Cheer ＿＿! You'll do better next time. → up / down / off）
 * - イントネーション（"Oh no"）: 「共感の イントネーション。この 返事は どんな 声で いう？」（↘ ひくく・ゆっくり・やさしく など）
 * - 慣用句（"over the moon"）: 「気持ちの 慣用句。＿＿ に 入る ことばは どれ？」（I'm over the ＿＿! → moon / sun / rain）
 * - 性格の ことば（"helpful"）: 「性格の ことば。＿＿ に 入る おわりは どれ？」（help＿＿ → -ful / -ive / -ous）
 * あてはまらなければ null。ワールド37 の 問題より 先に よぶ。
 */
export function w38Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W38_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const f = feelingSpellOf(item.text);
  if (f && focus.includes(f.word)) return { promptJa: "気持ちの ことばの つづり。ただしい つづりは どれ？", display: feelingSpellDisplay(f), choices: pick([f.answer, ...f.wrong]), answer: f.answer, explanationJa: feelingSpellWhy(f) };
  const p = phrasalOf(item.text);
  if (p && focus.includes(p.phrase)) return { promptJa: "気持ちの 句動詞。＿＿ に 入る ことばは どれ？", display: phrasalDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: phrasalWhy(p) };
  const t = toneOf(item.text);
  if (t && focus.includes(t.phrase.toLowerCase())) return { promptJa: "共感の イントネーション。この 返事は どんな 声で いう？", display: toneDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: toneWhy(t) };
  const i = idiomOf(item.text);
  if (i && focus.includes(i.key)) return { promptJa: "気持ちの 慣用句。＿＿ に 入る ことばは どれ？", display: idiomDisplay(i), choices: pick([i.answer, ...i.wrong]), answer: i.answer, explanationJa: idiomWhy(i) };
  const c = characterOf(item.text);
  if (c && focus.includes(c.suffix)) return { promptJa: "性格の ことば。＿＿ に 入る おわりは どれ？", display: characterDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: characterWhy(c) };
  return null;
}

/**
 * ワールド37（おとぎの迷宮・L1081〜）の フォニックス（物語の 動詞・音の ことば・語りの 間・-ly の 副詞・たとえ）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - 物語の 動詞（"whisper"）: 「物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？」（say very quietly, using only your breath → ＿＿ → whisper / grin / stumble）
 * - 音の ことば（"splash"）: 「音の ことば。この 場面の 音は どれ？」（The frog jumped into the pond. ＿＿! → splash / creak / hiss）
 * - 語りの 間（"She opened the box, and inside was a tiny dragon"）: 「お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？」（was / She / tiny）
 * - -ly（"silently"）: 「どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？」（英語の 文 → silently / proudly / eagerly）
 * - たとえ（"as brave as a lion"）: 「たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？」（as brave as a ＿＿ → lion / mouse / snail）
 * あてはまらなければ null。ワールド36 の 問題より 先に よぶ。
 */
export function w37Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W37_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const v = storyVerbOf(item.text);
  if (v && focus.includes(v.word)) return { promptJa: "物語の ことば。ふつうの いいかたを ようすが 見える ことばに すると？", display: storyVerbDisplay(v), choices: pick([v.answer, ...v.wrong]), answer: v.answer, explanationJa: storyVerbWhy(v) };
  const so = soundWordOf(item.text);
  if (so && focus.includes(so.word)) return { promptJa: "音の ことば。この 場面の 音は どれ？", display: soundWordDisplay(so), choices: pick([so.answer, ...so.wrong]), answer: so.answer, explanationJa: soundWordWhy(so) };
  const p = suspenseOf(item.text);
  if (p && focus.includes(p.pause.toLowerCase())) return { promptJa: "お話を 語る ときの 間。どきどき させる 間（…）を とるのは どの ことばの あと？", display: suspenseDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: suspenseWhy(p) };
  const a = adverbOf(item.text);
  if (a && focus.includes("-ly")) return { promptJa: "どんな ふうに？ ＿＿ に あう -ly の ことばは どれ？", display: adverbDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: adverbWhy(a) };
  const m = simileOf(item.text);
  if (m && focus.includes(m.kind)) return { promptJa: "たとえ（as ～ as・like）。＿＿ に 入る ことばは どれ？", display: simileDisplay(m), choices: pick([m.answer, ...m.wrong]), answer: m.answer, explanationJa: simileWhy(m) };
  return null;
}

/**
 * ワールド36（しんかいの都・L1051〜）の フォニックス（語根 bio・学習語彙の 強勢・発表の 区切り・-ology と -ologist・数と たんいの 読みかた）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - bio（"biology"）: 「bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？」（＿＿: the study of living things → biology / biography / biosphere）
 * - 強勢（"research"）: 「つよく いう ところ（●）が あう ことばは どれ？」（○●（2つの 音の 2ばんめを つよく）→ research / summary / topic）
 * - 区切り（"In short, the deep sea is dark and cold"）: 「発表の 文。ひと いき いれる（｜）のは どの ことばの あと？」（short / the / deep）
 * - -ology（"zoology"）: 「-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？」（英語の 文 → zoology / zoologist / zooology）
 * - 数と たんい（"-2°C"）: 「数と たんいの 読みかた。英語で どう よむ？」（minus two degrees / two minus degrees / minus twenty degrees）
 * あてはまらなければ null。ワールド35 の 問題より 先に よぶ。
 */
export function w36Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W36_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const b = bioOf(item.text);
  if (b && focus.includes("bio")) return { promptJa: "bio（いのち）の ことば。英語の せつめいに あう ことばは どれ？", display: bioDisplay(b), choices: pick([b.answer, ...b.wrong]), answer: b.answer, explanationJa: bioWhy(b) };
  const st = academicOf(item.text);
  if (st && focus.includes(st.word)) return { promptJa: "つよく いう ところ（●）が あう ことばは どれ？", display: academicDisplay(st), choices: pick([st.answer, ...st.wrong]), answer: st.answer, explanationJa: academicWhy(st) };
  const p = pauseOf(item.text);
  if (p && focus.includes(p.pause.toLowerCase())) return { promptJa: "発表の 文。ひと いき いれる（｜）のは どの ことばの あと？", display: pauseDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: pauseWhy(p) };
  const o = ologyOf(item.text);
  if (o && focus.includes(o.kind)) return { promptJa: "-ology（学問）と -ologist（その 学問を する 人）。文に あう ことばは どれ？", display: ologyDisplay(o), choices: pick([o.answer, ...o.wrong]), answer: o.answer, explanationJa: ologyWhy(o) };
  const u = unitOf(item.text);
  if (u && focus.includes(u.word)) return { promptJa: "数と たんいの 読みかた。英語で どう よむ？", display: unitDisplay(u), choices: pick([u.answer, ...u.wrong]), answer: u.answer, explanationJa: unitWhy(u), audioText: u.answer };
  return null;
}

/**
 * ワールド35（ちえの議事堂・L1021〜）の フォニックス（-ity の 名詞・inter- と co-・対比の 強勢・あらたまった ことば・ステージ4 の 語根の まとめ）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - -ity（"responsibility"）: 「-ity の ことば。もとの ことば（形容詞）は どれ？」（responsible / responsable / responsibil）
 * - inter- と co-（"cooperate"）: 「inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？」（英語の 文 → cooperate / interview / intersection）
 * - 対比の 強勢（"I said Thursday"）: 「B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？」（A: Did you say Tuesday? → Thursday / I / said）
 * - あらたまった ことば（"receive"）: 「あらたまった ことば（手紙・発表で つかう）は どれ？」（ふだん: get → receive / recieve / receeve）
 * - 語根（"inspect"）: 「ステージ4 の 語根。＿＿ に 入る パーツは どれ？」（in＿＿（中まで よく 見る）→ spect / port / rupt）
 * あてはまらなければ null。ワールド34 の 問題より 先に よぶ。
 */
export function w35Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W35_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const t = ityOf(item.text);
  if (t && focus.includes("-ity")) return { promptJa: "-ity の ことば。もとの ことば（形容詞）は どれ？", display: ityDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: ityWhy(t) };
  const ic = interCoOf(item.text);
  if (ic && focus.includes(ic.prefix)) return { promptJa: "inter（あいだ）と co（いっしょに）の ことば。文に あう ことばは どれ？", display: interCoDisplay(ic), choices: pick([ic.answer, ...ic.wrong]), answer: ic.answer, explanationJa: interCoWhy(ic) };
  const c = contrastOf(item.text);
  if (c && focus.includes(c.strong.toLowerCase())) return { promptJa: "B は くらべて いって いるよ。B の 文で いちばん つよく いう ことばは どれ？", display: contrastDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: contrastWhy(c) };
  const fm = formalOf(item.text);
  if (fm && focus.includes(fm.word)) return { promptJa: "あらたまった ことば（手紙・発表で つかう）は どれ？", display: formalDisplay(fm), choices: pick([fm.answer, ...fm.wrong]), answer: fm.answer, explanationJa: formalWhy(fm) };
  const r = rootOf(item.text);
  if (r && focus.includes(r.root)) return { promptJa: "ステージ4 の 語根。＿＿ に 入る パーツは どれ？", display: rootDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: rootWhy(r), audioText: r.word };
  return null;
}

/**
 * ワールド34（つばさの空港・L991〜）の フォニックス（空港の 数字の 読みかた・語根 vis・2つ ならぶ 文字・-ize の 動詞・イギリス英語と アメリカ英語）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - 数字（"Flight 205"）: 「空港の 数字。英語で なんと よむ？」（two oh five / twenty-five / two fifty）。音は 読みかたの 文（Flight two oh five.）
 * - vis（"visa"）: 「vis（見る）の ことば。英語の せつめいに あう ことばは どれ？」（a paper or stamp that lets you enter a country → visa / vision / visit）
 * - 2つ ならぶ 文字（"recommend"）: 「ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）」（recommend / reccomend / recomend）
 * - -ize（"apologize"）: 「-ize を つけて 動詞に すると？ ただしい つづりは どれ？」（apology → apologize / apologyize / appologize）
 * - イギリス英語と アメリカ英語（"lift"・"colour"）: 「イギリス英語では なんと いう？」（アメリカ: elevator → lift / flat / queue）・「イギリスの つづりは どれ？」
 * あてはまらなければ null。ワールド33 の 問題より 先に よぶ。
 */
export function w34Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W34_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const n = travelNumberOf(item.text);
  if (n && focus.includes(n.word)) return { promptJa: "空港の 数字。英語で なんと よむ？", display: travelNumberDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: travelNumberWhy(n), audioText: n.say };
  const v = visOf(item.text);
  if (v && focus.includes("vis")) return { promptJa: "vis（見る）の ことば。英語の せつめいに あう ことばは どれ？", display: visDisplay(v), choices: pick([v.answer, ...v.wrong]), answer: v.answer, explanationJa: visWhy(v) };
  const d = doubleOf(item.text);
  if (d && focus.includes(d.focus)) return { promptJa: "ただしい つづりは どれ？（2つ ならぶ 文字に 気を つけよう）", display: doubleDisplay(d), choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: doubleWhy(d) };
  const z = izeOf(item.text);
  if (z && focus.includes("-ize")) return { promptJa: "-ize を つけて 動詞に すると？ ただしい つづりは どれ？", display: izeDisplay(z), choices: pick([z.answer, ...z.wrong]), answer: z.answer, explanationJa: izeWhy(z) };
  const u = ukUsOf(item.text);
  if (u && focus.includes(u.word)) return { promptJa: ukUsPrompt(u), display: ukUsDisplay(u), choices: pick([u.answer, ...u.wrong]), answer: u.answer, explanationJa: ukUsWhy(u) };
  return null;
}

/**
 * ワールド33（ほのおの火山島・L961〜）の フォニックス（語根 rupt・名詞の おわり -ance / -ence / -ency / -ty・-proof の 複合語・リストの 読みかた・語根 ject）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - rupt（"erupt"）: 「rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？」（文と いみ → erupt / eruption / interrupt）
 * - 名詞の おわり（"distance"）: 「ものの なまえ（名詞）に すると？ ただしい つづりは どれ？」（distance / distence / distanse）
 * - -proof（"waterproof"）: 「-proof（〜を ふせぐ・〜に つよい）の ことば。文に あう ことばは どれ？」（waterproof / fireproof / soundproof）
 * - リスト（"We need water, food, and a flashlight"）: 「リストを いう ときの こえの 上がり下がりは どれ？」（water ↗, food ↗, and a flashlight ↘）。
 *   音は 文の おわりに . か ? を つけて よむ（? が ないと TTS が どっち？の 上がり下がりで よまない）
 * - ject（"project"）: 「ject（なげる）の まえに つく パーツは どれ？」（＿＿ject「けいかく」→ pro / in / ob）
 * あてはまらなければ null。ワールド32 の 問題より 先に よぶ。
 */
export function w33Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W33_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const r = ruptOf(item.text);
  if (r && focus.includes("rupt")) return { promptJa: "rupt（やぶれる・こわれる）の ことば。文に あう ことばは どれ？", display: ruptDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: ruptWhy(r) };
  const e = nounEndOf(item.text);
  if (e && focus.includes(e.focus)) return { promptJa: "ものの なまえ（名詞）に すると？ ただしい つづりは どれ？", display: nounEndDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: nounEndWhy(e) };
  const p = proofOf(item.text);
  if (p && focus.includes("-proof")) return { promptJa: "-proof（〜を ふせぐ・〜に つよい）の ことば。文に あう ことばは どれ？", display: proofDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: proofWhy(p) };
  const l = listOf(item.text);
  if (l && focus.includes(l.focus)) return { promptJa: listPrompt(l), display: listDisplay(l), choices: pick([l.answer, ...l.wrong]), answer: l.answer, explanationJa: listWhy(l), audioText: l.say };
  const j = jectOf(item.text);
  if (j && focus.includes("ject")) return { promptJa: "ject（なげる）の まえに つく パーツは どれ？", display: jectDisplay(j), choices: pick([j.answer, ...j.wrong]), answer: j.answer, explanationJa: jectWhy(j) };
  return null;
}

/**
 * ワールド32（たいようの砂漠・L931〜）の フォニックス（語根 geo・-al・方角の ことば・数と 分数と 割合の 読みかた・データの ことばの つづり）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - geo（"geology"）: 「geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？」（パーツと いみ → ことば）
 * - -al（"natural"）: 「-al を つけて ようすの ことばに。ただしい つづりは どれ？」（natural / natureal / naturel）
 * - 方角（"northern" "northeast" "upward"）: 「ほうがくの ことば。あう ことばは どれ？」（northern / northen / northal）
 * - 数（"1/2" "30%" "2.5"）: 「英語で なんと よむ？」（one half / one two / two ones）。音は 答えの よみで よむ（1/2 を 日づけと よまない ように）
 * - データの ことば（"average"）: 「ただしい つづりは どれ？」（average / averege / avrage）
 * あてはまらなければ null。ワールド31 の 問題より 先に よぶ（-al の ことばを ワールド31 の 家族、geologist を -ist で 問わない）。
 */
export function w32Question(item: LearningItemDef, rng: () => number): (Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> & { audioText?: string }) | null {
  if (item.lessonNo < W32_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const g = geoOf(item.text);
  if (g && focus.includes("geo")) return { promptJa: "geo（ちきゅう・とち）の ことば。パーツと いみに あう ことばは どれ？", display: geoDisplay(g), choices: pick([g.answer, ...g.wrong]), answer: g.answer, explanationJa: geoWhy(g) };
  const a = alOf(item.text);
  if (a && focus.includes("-al")) return { promptJa: "-al を つけて ようすの ことばに。ただしい つづりは どれ？", display: alDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: alWhy(a) };
  const d = directionOf(item.text);
  if (d && focus.includes(d.focus)) return { promptJa: "ほうがくの ことば。あう ことばは どれ？", display: directionDisplay(d), choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: directionWhy(d) };
  const n = numberOf(item.text);
  if (n && focus.includes(n.word)) return { promptJa: "英語で なんと よむ？", display: numberDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: numberWhy(n), audioText: n.answer };
  const t = dataOf(item.text);
  if (t && focus.includes(t.focus)) return { promptJa: "ただしい つづりは どれ？", display: dataDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: dataWhy(t) };
  return null;
}

/**
 * ワールド31（ときの回廊・L901〜）の フォニックス（動詞と 名詞の 家族・年号の 読みかた・語根 struct・-ian / -ist・語根 port）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - 家族（"invention"）: 「動詞を 名詞（もの・こと）に すると？」（invent（はつめいする）→ ＿＿ → invention / inventment / invental）
 * - 年号（"1868"）: 「英語で なんと よむ？」（eighteen sixty-eight / one eight six eight / eighty-six eighteen）
 * - struct（"construction"）: 「struct（たてる・くみたてる）の ことば。文に あう ことばは どれ？」
 * - -ian / -ist（"musician"）: 「〜を する 人は？ あう ことばは どれ？」（musician / musicist / musicer）
 * - port（"export"）: 「port の ことば。いみは どれ？」（ことば → いみ）
 * あてはまらなければ null。ワールド30 の 問題より 先に よぶ（invention を ワールド23 の -tion、magician を ワールド30 で 問わない）。
 */
export function w31Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W31_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const f = family31Of(item.text);
  if (f && focus.includes(f.ending)) return { promptJa: "動詞を 名詞（もの・こと）に すると？", display: family31Display(f), choices: pick([f.answer, ...f.wrong]), answer: f.answer, explanationJa: family31Why(f) };
  const y = yearOf(item.text);
  if (y && focus.includes(y.word)) return { promptJa: "英語で なんと よむ？", display: yearDisplay(y), choices: pick([y.answer, ...y.wrong]), answer: y.answer, explanationJa: yearWhy(y) };
  const s = structOf(item.text);
  if (s && focus.includes("struct")) return { promptJa: "struct（たてる・くみたてる）の ことば。文に あう ことばは どれ？", display: structDisplay(s), choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: structWhy(s) };
  const p = person31Of(item.text);
  if (p && focus.includes(p.ending)) return { promptJa: "〜を する 人は？ あう ことばは どれ？", display: person31Display(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: person31Why(p) };
  const o = portOf(item.text);
  if (o && focus.includes("port")) return { promptJa: "port の ことば。いみは どれ？", display: portDisplay(o), choices: pick([o.answer, ...o.wrong]), answer: o.answer, explanationJa: portWhy(o) };
  return null;
}

/**
 * ワールド30（みらい都市・L871〜）の フォニックス（auto-・trans-・-ic の 強勢・略語の 読みかた・くだけた 話しことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - auto-（"autograph"）: 「auto（じぶんで）の ことば。いみに あう ことばは どれ？」（いみ → ことば）
 * - trans-（"transport"）: 「trans の あとに つづく パーツは どれ？」（trans ＋ ＿＿（はこぶ）→ port / form / mit）
 * - -ic（"electric"）: 「-ic の ことば。どこを いちばん つよく いう？」（e-LEC-tric / E-lec-tric / e-lec-TRIC）
 * - 略語（"km"）: 「なんと よむ？」（キロメーターズ / ケーエム / クム）
 * - 話しことば（"I'm gonna try it"）: 「gonna を ふつうの いいかたに すると？」（going to / gone to / go and）
 * あてはまらなければ null。ワールド29 の 問題より 先に よぶ（automatic を ワールド12 の はく、electric を ほかの ワールドで 問わない）。
 */
export function w30Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W30_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const a = autoOf(item.text);
  if (a && focus.includes("auto-")) return { promptJa: "auto（じぶんで）の ことば。いみに あう ことばは どれ？", display: autoDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: autoWhy(a) };
  const t = transOf(item.text);
  if (t && focus.includes("trans-")) return { promptJa: "trans の あとに つづく パーツは どれ？", display: transDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: transWhy(t) };
  const c = icOf(item.text);
  if (c && focus.includes("-ic")) return { promptJa: "-ic の ことば。どこを いちばん つよく いう？", display: icDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: icWhy(c) };
  const b = abbrOf(item.text);
  if (b && focus.includes(b.abbr)) return { promptJa: "なんと よむ？", display: abbrDisplay(b), choices: pick([b.answer, ...b.wrong]), answer: b.answer, explanationJa: abbrWhy(b) };
  const k = casualOf(item.text);
  if (k && focus.includes(k.form)) return { promptJa: casualPrompt(k), display: casualDisplay(k), choices: pick([k.answer, ...k.wrong]), answer: k.answer, explanationJa: casualWhy(k) };
  return null;
}

/**
 * ワールド29（かんがえる灯台・L841〜）の フォニックス（語根 spect・語根 dict・意見を 強める 強勢・弱形・-ible / -able）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - spect（"inspect"）: 「spect（みる）の ことば。いみは どれ？」（答えも 選択肢も いみ）
 * - dict（"predict"）: 「ぶんに あう dict の ことばは どれ？」（Can you ＿＿ the weather for tomorrow?）
 * - 強勢（"I really think so"）: 「いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？」（really / think / so）
 * - 弱形（"I can help you"）: 「ふつうの はやさで いうと、can は どう きこえる？」（クン / キャン / カーン。選択肢は きまった 順）
 * - -ible / -able（"possible"）: 「ただしい つづりは どれ？」（possible / possable / posible）
 * あてはまらなければ null。ワールド28 の 問題より 先に よぶ（prediction を ワールド23 の -tion、respectable を ワールド27 の -able で 問わない）。
 */
export function w29Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W29_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const s = spectOf(item.text);
  if (s && focus.includes("spect")) return { promptJa: "spect（みる）の ことば。いみは どれ？", display: spectDisplay(s), choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: spectWhy(s) };
  const d = dictOf(item.text);
  if (d && focus.includes("dict")) return { promptJa: "ぶんに あう dict の ことばは どれ？", display: d.sentence, choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: dictWhy(d) };
  const e = emphasisOf(item.text);
  if (e && focus.includes(e.strong.toLowerCase())) return { promptJa: "いけんを つよく つたえる とき、いちばん つよく いう ことばは どれ？", display: emphasisDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: emphasisWhy(e) };
  const w = weakOf(item.text);
  if (w && focus.includes(w.weak)) return { promptJa: weakPrompt(w), display: weakDisplay(w), choices: w.choices.map((x) => ({ id: x, label: x })), answer: w.answer, explanationJa: weakWhy(w) };
  const b = ibleOf(item.text);
  if (b && focus.includes(b.focus)) return { promptJa: "ただしい つづりは どれ？", display: `🔊（${b.meaning}）`, choices: pick([b.answer, ...b.wrong]), answer: b.answer, explanationJa: ibleWhy(b) };
  return null;
}

/**
 * ワールド28（にじの架け橋・L811〜）の フォニックス（カタカナ語と 英語の おと・英語に なった 日本語・英語の リズム・音の つながりの まとめ・ことばの パーツの まとめ）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - カタカナ語（"energy"）: 「英語で いうと、つよく よむ ところは どれ？」（EN-er-gy / en-ER-gy / en-er-GY。選択肢は きまった 順）
 * - 英語に なった 日本語（"tsunami"）: 「英語に なった 日本語。英語の つづりは どれ？」（tsunami / tunami / sunami）
 * - リズム（"I want to swim in the sea"）: 「ふつうに いう とき、よわく みじかく いう ことばは どれ？」（to / swim / sea）
 * - 音の つながり（"meet you"）: 「つなげて いうと どう きこえる？」（ミーチュー / ミート・ユー / …）
 * - ことばの パーツ（"unhappiness"）: 「パーツを くっつけた ことばで ただしい つづりは どれ？」
 * あてはまらなければ null。ワールド27 の 問題より 先に よぶ（video を ワールド12 の はく、unhappiness を ワールド21 の -ness で 問わない）。
 */
export function w28Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W28_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const k = katakanaOf(item.text);
  if (k && focus.includes(k.syllables)) return { promptJa: "英語で いうと、つよく よむ ところは どれ？", display: katakanaDisplay(k), choices: k.choices.map((x) => ({ id: x, label: x })), answer: k.answer, explanationJa: katakanaWhy(k) };
  const j = loanOf(item.text);
  if (j && focus.includes(j.word)) return { promptJa: "英語に なった 日本語。英語の つづりは どれ？", display: `🔊（${j.meaning}）`, choices: pick([j.answer, ...j.wrong]), answer: j.answer, explanationJa: loanWhy(j) };
  const r = rhythmOf(item.text);
  if (r && focus.includes(r.weak)) return { promptJa: "ふつうに いう とき、よわく みじかく いう ことばは どれ？", display: rhythmDisplay(r), choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: rhythmWhy(r) };
  const l = link28Of(item.text);
  if (l && focus.includes(l.phrase)) return { promptJa: "つなげて いうと どう きこえる？", display: `${l.phrase}（${l.meaning}）`, choices: pick([l.answer, ...l.wrong]), answer: l.answer, explanationJa: link28Why(l) };
  const p = partsOf(item.text);
  if (p && focus.includes(p.focus)) return { promptJa: "パーツを くっつけた ことばで ただしい つづりは どれ？", display: partsDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: partsWhy(p) };
  return null;
}

/**
 * ワールド27（いずみの里・L781〜）の フォニックス（k の おとの ch と -ache・だまって いる もじ・for と since・-able・同音異義語 2）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - ch / -ache（"stomach" "headache"）: 「ただしい つづりは どれ？」（ずつう → headache / headake / hedache）
 * - だまって いる もじ（"knee"）: 「こえに ださない もじは どれ？」（k / n / e）
 * - for / since（"for ten years"）: 「＿＿ に 入る ことばは どれ？」（for / since / from。選択肢は きまった 順）
 * - -able（"comfortable"）: 「able の ことばで ただしい つづりは どれ？」
 * - 同音異義語（"weak"）: 「ぶんに あう ことばは どれ？」（weak / week / wake）
 * あてはまらなければ null。ワールド26 の 問題より 先に よぶ（knee を ワールド14 の kn、here を ワールド17 の 同音異義語で 問わない）。
 */
export function w27Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W27_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const c = chKOf(item.text);
  if (c && focus.includes(c.focus)) return { promptJa: "ただしい つづりは どれ？", display: `🔊（${c.meaning}）`, choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: chKWhy(c) };
  const s = silentOf(item.text);
  if (s && focus.includes(s.letter)) return { promptJa: "こえに ださない もじは どれ？", display: `${s.word}（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: silentWhy(s) };
  const f = forSinceOf(item.text);
  if (f && focus.includes(f.focus)) return { promptJa: "＿＿ に 入る ことばは どれ？", display: forSinceDisplay(f), choices: FOR_SINCE_CHOICES.map((x) => ({ id: x, label: x })), answer: f.answer, explanationJa: forSinceWhy(f) };
  const a = ableOf(item.text);
  if (a && focus.includes("-able")) return { promptJa: "able の ことばで ただしい つづりは どれ？", display: ableDisplay(a), choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: ableWhy(a) };
  const h = homoOf(item.text);
  if (h && focus.includes(h.focus)) return { promptJa: "ぶんに あう ことばは どれ？", display: h.sentence, choices: pick([h.answer, ...h.wrong]), answer: h.answer, explanationJa: homoWhy(h) };
  return null;
}

/**
 * ワールド26（ひびきの劇場・L751〜）の フォニックス（きもちの こえ・-ed / -ing・セリフの くとうてん・いみを かえる 強勢・はやくちことば）。
 * ことばが どの 表に あるかで 問いを きめ、その 表の focus が レッスンの focus に ある ときだけ 問う。
 * - きもちの こえ（"Really?!"）: 「この きもちで いうと、どんな こえ？」（↗ たかく げんきに / ↘ ひくく しずかに / → ずっと おなじ。選択肢は きまった 順）
 * - -ed / -ing（"exciting"）: 「＿＿ に あてはまる ことばは どれ？」（The play is ＿＿. → exciting / excited / exciteing）
 * - セリフ（'"Help!" shouted the princess.'）: 「セリフの かきかたが ただしいのは どれ？」
 * - 強勢（"I didn't eat YOUR cake"。focus は "YOUR"）: 「この いみに なるのは、どこを つよく いう とき？」
 * - はやくちことば: 「おなじ おとで はじまる ことばは どれ？」
 * あてはまらなければ null。ワールド25 の 問題より 先に よぶ（excited を ワールド11 の -ed の おとで 問わない）。
 */
export function w26Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W26_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const v = voiceOf(item.text);
  if (v && focus.includes(v.focus)) return { promptJa: "この きもちで いうと、どんな こえ？", display: `${item.text}（${v.feeling}）`, choices: VOICE_CHOICES.map((x) => ({ id: x, label: x })), answer: v.answer, explanationJa: voiceWhy(v) };
  const e = edIngOf(item.text);
  if (e && focus.includes(e.focus)) return { promptJa: "＿＿ に あてはまる ことばは どれ？", display: edIngDisplay(e), choices: pick([e.answer, ...e.wrong]), answer: e.answer, explanationJa: edIngWhy(e) };
  const p = punctOf(item.text);
  if (p && focus.includes(p.point)) return { promptJa: "セリフの かきかたが ただしいのは どれ？", display: p.meaning, choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: punctWhy(p) };
  const s = meaningStressOf(item.text);
  if (s && focus.includes(s.stressed)) return { promptJa: "この いみに なるのは、どこを つよく いう とき？", display: `（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: meaningStressWhy(s) };
  const t = twisterOf(item.text);
  if (t && focus.includes(t.sound)) return { promptJa: "はやくちことば！ おなじ おとで はじまる ことばは どれ？", display: twisterDisplay(t), choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: twisterWhy(t) };
  return null;
}

/**
 * ワールド25（なぞときの洞くつ・L721〜）の フォニックス（-ness・-ive・複合語・にた いみの ことば・しつもんの イントネーション）。フォーカスの 順に ことばに あうもので 問う。
 * - "-ness": 「『〜さ』を あらわす ことばは どれ？」（dark（くらい）→ darkness / darkly / darker。happy は happyness も）
 * - "-ive": 「ive の ことばで ただしい つづりは どれ？」（create → creative / creativ / createive）
 * - "foot-print" の ような 2つに わけた 形: 「あと 1つの ことばは どれ？」（＿＿print（あしあと）→ foot / ear / sky）
 * - ことば そのもの（"huge"）: 「にた いみの ことばは どれ？」（huge → big / small / quiet）
 * - しつもん そのもの（"Is it bigger than a box"）: 「この しつもんの おわりは？」（↗ あがる / ↘ さがる / → かわらない。選択肢は きまった 順）
 * あてはまらなければ null。ワールド24 の 問題より 先に よぶ（kindness を ワールド21 の -ness、active を ワールド22 の 語の家族、something を ワールド15 の 複合語で 問わない）。
 */
export function w25Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W25_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W25_NESS_FOCUS) {
      const n = nessOf(w);
      if (!n) continue;
      return { promptJa: "「〜さ」を あらわす ことばは どれ？", display: nessDisplay(n), choices: pick([n.answer, ...n.wrong]), answer: n.answer, explanationJa: nessWhy(n) };
    }
    if (f === W25_IVE_FOCUS) {
      const x = iveOf(w);
      if (!x) continue;
      return { promptJa: "ive の ことばで ただしい つづりは どれ？", display: iveDisplay(x), choices: pick([x.answer, ...x.wrong]), answer: x.answer, explanationJa: iveWhy(x) };
    }
    if (/^[a-z]+-[a-z]+$/.test(f) && f.replace(/-/g, "") === w) {
      const c = compoundOf(w, [f]);
      if (!c) continue;
      return { promptJa: "あと 1つの ことばは どれ？", display: compoundDisplay(c), choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: compoundWhy25(item.text, c) };
    }
    if (f.toLowerCase() === w) {
      const s = synOf(w, [f]);
      if (s) return { promptJa: "にた いみの ことばは どれ？", display: `${s.word}（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: synWhy(s) };
      const t = intonationOf(item.text);
      if (t) return { promptJa: "この しつもんの おわりは あがる？ さがる？", display: `${item.text}?`, choices: INTONATION_CHOICES.map((x) => ({ id: x, label: x })), answer: t.answer, explanationJa: intonationWhy(item.text, t) };
    }
  }
  return null;
}

/**
 * ワールド24（くもの上の鉄道・L691〜）の フォニックス（地名の 強勢・過去分詞・短縮形・over- / under-・im- / in-）。フォーカスの 順に ことばに あうもので 問う。
 * - "can-a-da" の ような はくの 形: 「つよく よむ ところは どれ？」（CAN-a-da / can-A-da / can-a-DA）
 * - "-een" "-one" "-en" "-wn" "-um": 「have の あとに くる かたちは どれ？」（seen / saw / see。written は writen も）
 * - "'ve" "n't" "'s": 「みじかい かたちは どれ？」（I have → I've / Ive / I'have、she has → she's）
 * - "over-" "under-": 「この ことばの over は どんな いみ？」（うえ・こえて・〜すぎる / した / まえ / もう いちど）
 * - "im-" "in-": 「ただしい ことばは どれ？」（possible（できる）の はんたい → impossible / inpossible / unpossible）
 * あてはまらなければ null。ワールド23 の 問題より 先に よぶ（she's を ワールド15 の she is、Canada を ワールド12 の はく、eaten を ブレンドで 問わない）。
 */
export function w24Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W24_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (/^[a-z]+(-[a-z]+)+$/.test(f) && f.replace(/-/g, "") === w) {
      const p = placeOf(w, [f]);
      if (!p) continue;
      return { promptJa: "つよく よむ ところは どれ？", display: `${item.text}（${p.meaning}）`, choices: p.choices.map((x) => ({ id: x, label: x })), answer: p.answer, explanationJa: placeWhy(item.text, p) };
    }
    if ((W24_PP_FOCUS as readonly string[]).includes(f)) {
      const p = ppOf(w);
      if (!p || !w.endsWith(f.slice(1))) continue;
      return { promptJa: "have の あとに くる かたちは どれ？", display: ppDisplay(p), choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: ppWhy(p) };
    }
    if ((W24_CONTRACTION_FOCUS as readonly string[]).includes(f)) {
      const c = contrOf(item.text);
      if (!c || !w.includes(f)) continue;
      return { promptJa: "みじかい かたちは どれ？", display: `${c.full} → ？`, choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: contrWhy(c) };
    }
    if ((W24_OU_FOCUS as readonly string[]).includes(f)) {
      const o = overUnderOf(w, [f]);
      if (!o) continue;
      return { promptJa: `この ことばの ${o.part} は どんな いみ？`, display: `${item.text}（${o.meaning}）`, choices: pick(o.choices), answer: o.answer, explanationJa: overUnderWhy(item.text, o) };
    }
    if ((W24_IMIN_FOCUS as readonly string[]).includes(f)) {
      const x = imInOf(w);
      if (!x || x.prefix !== f.slice(0, -1)) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${x.base}（${x.baseMeaning}）の はんたい → ？（${x.meaning}）`, choices: pick([x.answer, ...x.wrong]), answer: x.answer, explanationJa: imInWhy(x) };
    }
  }
  return null;
}

/**
 * ワールド23（みどりの研究所・L661〜）の フォニックス（理科の ことばの パーツ）。フォーカスの 順に ことばに あうもので 問う。
 * - "micro-" "-scope" "-meter" "thermo-": 「この ことばの micro は どんな いみ？」（ちいさい / はかる どうぐ / ねつ・あたたかさ / とおく）
 * - "-ment": 「ただしい つづりは どれ？」（measure → ？（はかった あたい）→ measurement / measurment / measuremant）
 * - "pho-tog-ra-phy" の ような はくの 形（強勢の 移動）: 「つよく よむ ところは どれ？」（pho-TOG-ra-phy / PHO-tog-ra-phy / …。かぞくの PHO-to-graph を 見せる）
 * - "-y": 「ただしい ことばは どれ？」（shine → ？（ぴかぴかの）→ shiny / shiney / shinie）
 * - "-tion": 「ただしい ことばは どれ？」（observe → ？（かんさつ）→ observation / observetion / observasion）
 * あてはまらなければ null。ワールド22 の 問題より 先に よぶ（photography を ワールド22 の あいまい母音、measurement を ワールド21 の -ment、
 * cloudy を ワールド10 の -y、prediction を ワールド17 の -tion で 問わない）。
 */
export function w23Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W23_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if ((W23_PART_FOCUS as readonly string[]).includes(f)) {
      const p = sciPartOf(w, [f]);
      if (!p) continue;
      return { promptJa: `この ことばの ${p.part} は どんな いみ？`, display: `${item.text}（${p.meaning}）`, choices: pick(p.choices), answer: p.answer, explanationJa: sciPartWhy(item.text, p) };
    }
    if (f === W23_MENT_FOCUS) {
      const m = mentOf(w);
      if (!m) continue;
      return { promptJa: "ただしい つづりは どれ？", display: mentDisplay(m), choices: pick([m.answer, ...m.wrong]), answer: m.answer, explanationJa: mentWhy(m) };
    }
    if (/^[a-z]+(-[a-z]+)+$/.test(f) && f.replace(/-/g, "") === w) {
      const s = shiftOf(w, [f]);
      if (!s) continue;
      return { promptJa: "つよく よむ ところは どれ？", display: `${item.text}（${s.meaning}）　かぞく: ${s.pairStressed}`, choices: pick(s.choices), answer: s.answer, explanationJa: shiftWhy(item.text, s) };
    }
    if (f === W23_Y_FOCUS) {
      const y = yAdjOf(w);
      if (!y) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${y.base}（${y.baseMeaning}）→ ？（${y.meaning}）`, choices: pick([y.answer, ...y.wrong]), answer: y.answer, explanationJa: yAdjWhy(y) };
    }
    if (f === W23_TION_FOCUS) {
      const t = tionOf(w);
      if (!t) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${t.base}（${t.baseMeaning}）→ ？（${t.meaning}）`, choices: pick([t.answer, ...t.wrong]), answer: t.answer, explanationJa: tionWhy(t) };
    }
  }
  return null;
}

/**
 * ワールド22（こはくの図書館・L631〜）の フォニックス（形態素の つづき）。フォーカスの 順に ことばに あうもので 問う。
 * - "-er" "-or" "-ist": 「〜する 人を あらわす ことばは どれ？」（write → ？（さっか）→ writer / writor / writist）
 * - "act" "invent" "protect" "direct"（語の家族）: 「act の かぞくで「はいゆう」は どれ？」（actor / action / active）
 * - "pen-cil" の ような はくの 形（あいまい母音と 強勢）: 「よわい「ア」の ところに はいる もじは どれ？」（penc＿l（PEN・cil）→ i / u / a / e）
 * - "-ous" "-al": 「ただしい ことばは どれ？」（danger → ？（きけんな）→ dangerous / dangeral / dangerus）
 * - しるしの 回（focus が フレーズ そのもの）: 「おわりに つける しるしは どれ？」（Who are you ＿ → ? / ! / .）
 * あてはまらなければ null。ワールド21 の 問題より 先に よぶ（writer を ワールド11 の -er、pencil を ワールド20 で 問わない）。
 */
export function w22Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W22_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if ((W22_PERSON_FOCUS as readonly string[]).includes(f)) {
      const p = personOf(w);
      if (!p || `-${p.kind}` !== f) continue;
      return { promptJa: "「〜する 人」を あらわす ことばは どれ？", display: `${p.base}（${p.baseMeaning}）→ ？（${p.meaning}）`, choices: pick([p.answer, ...p.wrong]), answer: p.answer, explanationJa: personWhy(p) };
    }
    if ((W22_FAMILY_FOCUS as readonly string[]).includes(f)) {
      const q = familyOf(w, [f]);
      if (!q) continue;
      return { promptJa: `${q.root} の かぞくで「${q.meaning}」の いみの ことばは どれ？`, display: `${q.root}（${q.baseMeaning}）の かぞく`, choices: pick(q.choices), answer: q.answer, explanationJa: familyWhy(q) };
    }
    if (/^[a-z]+(-[a-z]+)+$/.test(f) && f.replace(/-/g, "") === w) {
      const s = schwaStressBlank(w);
      if (!s) continue;
      return { promptJa: "よわい「ア」の ところに はいる もじは どれ？", display: s.display, choices: pick(s.choices), answer: s.answer, explanationJa: schwaStressWhy(item.text, s) };
    }
    if ((W22_ADJ_FOCUS as readonly string[]).includes(f)) {
      const a = adjOf(w);
      if (!a || `-${a.kind}` !== f) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${a.base}（${a.baseMeaning}）→ ？（${a.meaning}）`, choices: pick([a.answer, ...a.wrong]), answer: a.answer, explanationJa: adjWhy(a) };
    }
    if (f.toLowerCase() === w) {
      const m = markOf(w);
      if (!m) continue;
      return { promptJa: "おわりに つける しるしは どれ？", display: `${item.text} ＿（${m.meaning}）`, choices: pick(MARK_CHOICES), answer: m.answer, explanationJa: markWhy(item.text, m) };
    }
  }
  return null;
}

/**
 * ワールド21（ことづての塔・L601〜）の フォニックス（形態素の はじまり）。フォーカスの 順に ことばに あうもので 問う。
 * - "dis-": 「はんたいの いみの ことばは？」（agree → ？（さんせいしない）→ disagree / unagree / inagree）
 * - "mis-" "pre-": 「＿ に はいる パーツは？」（＿spell（つづりを まちがえる）→ mis / pre / dis）
 * - "tele-" "phone" "graph" "photo-": 「この ことばの tele は どんな いみ？」（とおく / かく・えがく / ひかり / じぶんで）
 * - "-ment" "-ness": 「ただしい ことばは どれ？」（kind → ？（やさしさ）→ kindness / kindment / kindnes）
 * - 音の つながり（focus が フレーズ そのもの）: 「つなげて いうと どう きこえる？」（hold on → ホウルドン / ホウルド・オン / …）
 * あてはまらなければ null。ワールド20 の 問題より 先に よぶ（telephone を ワールド14 の ph、disappear を ear で 問わない）。
 */
export function w21Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W21_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W21_DIS_FOCUS) {
      const d = disOf(w);
      if (!d) continue;
      return { promptJa: "はんたいの いみの ことばは どれ？", display: `${d.base}（${d.baseMeaning}）→ ？（${d.meaning}）`, choices: pick([d.answer, ...d.wrong]), answer: d.answer, explanationJa: disWhy(d) };
    }
    if ((W21_MISPRE_FOCUS as readonly string[]).includes(f)) {
      const m = misPreBlank(w);
      if (!m || `${m.answer}-` !== f) continue;
      return { promptJa: "＿ に はいる パーツは どれ？", display: m.display, choices: pick(m.choices), answer: m.answer, explanationJa: misPreWhy(item.text, m) };
    }
    if ((W21_PART_FOCUS as readonly string[]).includes(f)) {
      const p = partOf(w, [f]);
      if (!p) continue;
      return { promptJa: `この ことばの ${p.part} は どんな いみ？`, display: `${item.text}（${p.meaning}）`, choices: pick(p.choices), answer: p.answer, explanationJa: partWhy(item.text, p) };
    }
    if ((W21_SUFFIX_FOCUS as readonly string[]).includes(f)) {
      const s = suffixOf(w);
      if (!s || `-${s.kind}` !== f) continue;
      return { promptJa: "ただしい ことばは どれ？", display: `${s.base}（${s.baseMeaning}）→ ？（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: suffixWhy(s) };
    }
    if (f.toLowerCase() === w) {
      const l = linkOf(w);
      if (!l) continue;
      const other = l.others[Math.floor(rng() * l.others.length)];
      return { promptJa: "つなげて いうと どう きこえる？", display: item.text, choices: pick([l.answer, l.split, other]), answer: l.answer, explanationJa: linkWhy(item.text, l) };
    }
  }
  return null;
}

/**
 * ワールド20（まつりの島・L571〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-ure": 「この ことばの ure は どの おと？」（treasure → チャー / ジャー / ユア）
 * - "ear" "eer": 「イア」の ことばは「＿ に はいる つづりは？」（ch＿（おうえんする）→ eer / ear / ere / ier）、
 *   bear・learn の ような ear は「この ことばの ear は どの おと？」（イア / エア / アー）
 * - "a-bout" の ような はくの まとまり（あいまい母音の 表に ある ことば）: 「よわい『ア』の ところに はいる もじは？」（＿bout → a / u / e / o）
 * あてはまらなければ null（ステージ2 の つづりの まとめ -tch -dge -tion・だまっている もじ・-ed・-ing は まえの ワールドの 問題へ）。
 * ワールド19 の 問題より 先に よぶ（picture を ワールド17 の -ture、bear を ワールド9 の ear、banana を ワールド18 の 強勢で 問わない）。
 */
export function w20Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W20_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W20_URE_FOCUS) {
      const u = ureSound(w);
      if (!u) continue;
      return { promptJa: "この ことばの ure は どの おと？", display: `${item.text}（${u.meaning}）`, choices: URE_SOUNDS.map((s) => ({ id: s, label: s })), answer: u.answer,
        explanationJa: ureWhy(item.text, u) };
    }
    if ((W20_EAR_FOCUS as readonly string[]).includes(f)) {
      const e = earOf(w);
      if (!e || e.spelling !== f) continue;
      if (e.kind === "blank") {
        return { promptJa: "＿ に はいる つづりは どれ？", display: e.display, choices: pick(EAR_CHOICES), answer: e.answer, explanationJa: earWhy(item.text, e) };
      }
      return { promptJa: "この ことばの ear は どの おと？", display: `${item.text}（${e.meaning}）`, choices: EAR_SOUNDS.map((s) => ({ id: s, label: s })), answer: e.answer,
        explanationJa: earWhy(item.text, e) };
    }
    if (f.includes("-") && f.replace(/-/g, "") === w) {
      const s = schwaBlank(w);
      if (!s) continue;
      return { promptJa: "よわい「ア」の ところに はいる もじは どれ？", display: s.display, choices: pick(s.choices), answer: s.answer, explanationJa: schwaWhy(item.text, s) };
    }
  }
  return null;
}

/**
 * ワールド19（からくり工房・L541〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "re-": 「『もう いちど』の いみの ことばは？」（make → ？（つくりなおす）→ remake / unmake / rimake）
 * - "-er" "-or"（道具の ことば）: 「おわりの つづりは？」（elevat＿＿（エレベーター）→ or / er / ar）
 * - "wr" "kn" "mb" "gu" "-stle": 「＿ に はいる つづりは？」（＿ench（レンチ）→ wr / r / rr / wh、whi＿（ふえ）→ stle / sle / ssle / sel）
 * - "qu" "squ": 「＿ に はいる つづりは？」（＿iz（クイズ）→ qu / kw / cu / q、＿are → squ / skw / scu / sq）
 * - "ou" "ough": 「この ことばの ou（ough）は どの おと？」（touch → アウ / ア / ウー、enough → ウー / アフ / オウ / オー）
 * あてはまらなければ null。ワールド18 の 問題より 先に よぶ（opener を くらべる かたち、knob を ワールド14 の 問題で 問わない）。
 */
export function w19Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W19_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if (f === W19_RE_FOCUS) {
      const r = reOf(w);
      if (!r) continue;
      return { promptJa: "「もう いちど」の いみの ことばは どれ？", display: `${r.base} → ？（${r.meaning}）`, choices: pick([r.answer, ...r.wrong]), answer: r.answer, explanationJa: reWhy(r) };
    }
    if ((W19_TOOL_FOCUS as readonly string[]).includes(f)) {
      const t = toolEnding(w);
      if (!t) continue;
      return { promptJa: "おわりの つづりは どれ？", display: t.display, choices: pick(TOOL_CHOICES), answer: t.answer, explanationJa: TOOL_WHY[t.kind](t) };
    }
    if ((W19_SILENT_FOCUS as readonly string[]).includes(f)) {
      const s = silentBlank19(w);
      if (!s || s.family !== f) continue;
      return { promptJa: "＿ に はいる つづりは どれ？", display: s.display, choices: pick(SILENT19_CHOICES[s.family]), answer: s.answer,
        explanationJa: `${item.text} は「${s.answer}」。${SILENT19_WHY[s.family]}` };
    }
    if ((W19_QU_FOCUS as readonly string[]).includes(f)) {
      const b = quBlank(w);
      if (!b) continue;
      return { promptJa: "＿ に はいる つづりは どれ？", display: b.display, choices: pick(QU_CHOICES[b.answer]), answer: b.answer,
        explanationJa: `${item.text} は「${b.answer}」。${QU_WHY[b.answer]}` };
    }
    if ((W19_OU_FOCUS as readonly string[]).includes(f)) {
      const o = ouSound(w);
      if (!o) continue;
      return { promptJa: `この ことばの ${o.team} は どの おと？`, display: `${item.text}（${o.meaning}）`, choices: o.choices.map((s) => ({ id: s, label: s })), answer: o.answer,
        explanationJa: ouWhy(item.text, o) };
    }
  }
  return null;
}

/**
 * ワールド18（こだまの谷・L511〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-er" "-est": 「くらべる かたちの ただしい つづりは？」（big → ？（もっと）→ bigger / biger / biggar）
 * - "el-e-phant" の ような まとまり（rule が "stress" の 回と ふりかえり）: 「つよく よむ ところは どこ？」（EL-e-phant / el-E-phant / el-e-PHANT）
 * - "-ly": 「ly を つけた ただしい つづりは？」（happy + ly → happily / happyly / happly）
 * - "-ful" "-less": 「いみに あう ことばは？」（「いろいろな いろの」→ colorful / colorless / colorfull）
 * - "un-": 「はんたいの いみの ことばは？」（happy → ？ → unhappy / inhappy / dishappy）
 * あてはまらなければ null。ワールド17 の 問題より 先に よぶ（shorter を or の つづり、careful を ワールド12 の まとまりで 問わない）。
 */
export function w18Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W18_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of lesson.phonics.focus) {
    if ((W18_COMPARE_FOCUS as readonly string[]).includes(f)) {
      const c = compareSpelling(w);
      if (!c || `-${c.suffix}` !== f) continue;
      return { promptJa: "くらべる かたちの ただしい つづりは どれ？", display: `${c.base} → ？（${c.suffix === "er" ? "もっと" : "いちばん"} ${c.meaning}）`,
        choices: pick([c.answer, ...c.wrong]), answer: c.answer, explanationJa: COMPARE_WHY[c.kind](c) };
    }
    if (f.includes("-") && f.replace(/-/g, "") === w) {
      const s = stressChoices(w, lesson.phonics.focus);
      if (!s) continue;
      return { promptJa: "つよく よむ ところは どこ？", display: `${w}（${s.meaning}）`, choices: pick([s.answer, ...s.wrong]), answer: s.answer, explanationJa: stressWhy(s) };
    }
    if (f === W18_LY_FOCUS) {
      const l = lySpelling(w);
      if (!l) continue;
      return { promptJa: "ly を つけた ただしい つづりは どれ？", display: `${l.base} + ly → ？`, choices: pick([l.answer, ...l.wrong]), answer: l.answer, explanationJa: LY_WHY[l.kind](l) };
    }
    if ((W18_FUL_FOCUS as readonly string[]).includes(f)) {
      const q = fulLessOf(w);
      if (!q || `-${q.suffix}` !== f) continue;
      return { promptJa: "いみに あう ことばは どれ？", display: `「${q.meaning}」`, choices: pick([q.answer, ...q.wrong]), answer: q.answer, explanationJa: fulLessWhy(q) };
    }
    if (f === W18_UN_FOCUS) {
      const u = unOf(w);
      if (!u) continue;
      return { promptJa: "はんたいの いみの ことばは どれ？", display: `${u.base} → ？（はんたいの いみ）`, choices: pick([u.answer, ...u.wrong]), answer: u.answer, explanationJa: unWhy(u) };
    }
  }
  return null;
}

/**
 * ワールド17（ほしふる天文台・L481〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-tion" "-sion" "-ture": 「ただしい つづりは？」（sta＿＿＿＿（えき）→ station / stasion / stashun、fu＿＿＿＿ → future / fucher / fuchur）
 * - "'ll" "n't": 「みじかい かたちは？」（I will → I'll / I'will / Il'l、will not → won't / willn't / wo'nt）
 * - 同音異義語（rule が "homophones" の 回、ふりかえりでは 表に ある ことば）: 「ぶんに あう ことばは？」（I can ＿＿ the stars. → see / sea / meet）
 * - "or" "ore" "oar" "our": 「「オー」の ただしい つづりは？」（4（よん）→ four / for / fore / foar）
 * あてはまらなければ null。ワールド16 の 問題より 先に よぶ（blew を ew の 過去形、won't を ワールド15 の n't で 問わない）。
 */
export function w17Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W17_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  const homophone = () => {
    const h = homophoneOf(w);
    if (!h) return null;
    return { promptJa: "ぶんに あう ことばは どれ？", display: h.sentence, choices: pick([w, ...h.choices]), answer: w, explanationJa: homophoneWhy(w, h) };
  };
  if (lesson.phonics.rule === W17_HOMOPHONE_RULE) return homophone();
  for (const f of lesson.phonics.focus) {
    if ((W17_ENDING_FOCUS as readonly string[]).includes(f)) {
      const e = endingSpelling(w);
      if (!e || `-${e.kind}` !== f) continue;
      return { promptJa: "ただしい つづりは どれ？", display: `${e.stem}＿＿＿＿（${e.meaning}）`, choices: pick([e.answer, ...e.wrong]), answer: e.answer,
        explanationJa: ENDING_WHY[e.kind](e.answer) };
    }
    if ((W17_CONTRACTION_FOCUS as readonly string[]).includes(f)) {
      const c = willContraction(item.text);
      if (!c || !w.includes(f)) continue;
      return { promptJa: "みじかい かたちは どれ？", display: `${c.full} → ？`, choices: pick([c.answer, ...c.wrong]), answer: c.answer,
        explanationJa: willContractionWhy(c.full, c.answer) };
    }
    if ((W17_OR_FOCUS as readonly string[]).includes(f)) {
      const o = orSpelling(w);
      if (!o || OR_FOCUS_OF[o.kind] !== f) continue;
      return { promptJa: "「オー」の ただしい つづりは どれ？", display: `「${o.meaning}」`, choices: pick([o.answer, ...o.wrong]), answer: o.answer,
        explanationJa: OR_WHY[o.kind](o.answer) };
    }
  }
  // ふりかえりの 回: 母音の つづりの focus（ee / ea / o …）の 同音異義語
  return homophone();
}

/**
 * ワールド16（きおくの遺跡・L451〜）の フォニックス。フォーカスの 順に ことばに あうもので 問う。
 * - "-ed": 「ed を つけた ただしい つづりは？」（stop → stopped / stoped / stopeed、cry → cried / cryed / cryied）。
 *   rule が "ed-sounds" の 回は「おわりの -ed は どの おと？」（ト / ド / イド）
 * - "a" "o_e" "ew" "ought" "aught": 「すぎた ことの かたちは？」（sing → sang / singed / sanged、buy → bought / buyed / baught）。
 *   表に ある ふきそくな 過去形だけ
 * あてはまらなければ null。ワールド15 の 問題より 先に よぶ（wrote を マジック e、stopped を はじめの ブレンドで 問わない）。
 */
export function w16Question(item: LearningItemDef, rng: () => number): Pick<Question, "promptJa" | "choices" | "answer" | "explanationJa" | "display"> | null {
  if (item.lessonNo < W16_START) return null;
  const lesson = getLesson(item.lessonNo);
  if (!lesson) return null;
  const focus = lesson.phonics.focus;
  const w = item.text.toLowerCase();
  const pick = (xs: readonly string[]) => shuffle(xs, rng).map((x) => ({ id: x, label: x }));
  for (const f of focus) {
    if ((W16_ED_FOCUS as readonly string[]).includes(f)) {
      if (lesson.phonics.rule === W16_ED_SOUND_RULE) {
        const s = edSound(w);
        if (!s) continue;
        const why = s === "id" ? "t や d の あとの -ed は「イド」と よむよ。"
          : s === "t" ? "p・k・s・sh・ch のような いきだけの おとの あとの -ed は ちいさく「ト」と よむよ。"
          : "こえの でる おと（n・l・y など）の あとの -ed は「ド」と よむよ。";
        return { promptJa: "この ことばの おわりの -ed は どの おと？", display: item.text,
          choices: shuffle(["t", "d", "id"] as const, rng).map((x) => ({ id: x, label: ED_LABEL[x] })), answer: s,
          explanationJa: `${item.text} の -ed は「${ED_KANA[s]}」。${why}` };
      }
      const e = edSpelling(w);
      if (!e) continue;
      return { promptJa: "ed を つけた ただしい つづりは どれ？", display: `${e.base} → ？`, choices: pick([e.answer, ...e.wrong]), answer: e.answer,
        explanationJa: `${e.base} → ${e.answer}。${ED_WHY[e.kind](e.base)}` };
    }
    if ((W16_IRREGULAR_FOCUS as readonly string[]).includes(f)) {
      const p = irregularPast(w);
      if (!p || IRREGULAR_FOCUS_OF[p.kind] !== f) continue;
      return { promptJa: "すぎた ことの かたちは どれ？", display: `${p.base} → ？`, choices: pick([p.answer, ...p.wrong]), answer: p.answer,
        explanationJa: IRREGULAR_WHY[p.kind](p.base, p.answer) };
    }
  }
  return null;
}

function shuffle<T>(arr: readonly T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function distractors(target: LearningItemDef, pool: readonly LearningItemDef[], n: number, rng: () => number) {
  // おなじ ことば・おなじ 日本語の 項目が べつの 回にも あるので、選択肢が かさならないように 1つずつに する
  const norm = (s: string) => s.trim().toLowerCase();
  const seenText = new Set([norm(target.text)]);
  const seenJa = new Set([target.ja.trim()]);
  const out: LearningItemDef[] = [];
  for (const p of shuffle(pool, rng)) {
    if (out.length >= n) break;
    if (p.id === target.id || p.kind !== target.kind) continue;
    if (seenText.has(norm(p.text)) || seenJa.has(p.ja.trim())) continue;
    seenText.add(norm(p.text));
    seenJa.add(p.ja.trim());
    out.push(p);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 1項目 → 1問
// ---------------------------------------------------------------------------
export function makeQuestion(item: LearningItemDef, type: QuestionType, pool: readonly LearningItemDef[], rng: () => number, idx: number): Question {
  const base = { id: `q${idx}`, itemId: item.id };
  // 選択肢IDは位置ベースの記号（a,b,c,d）。正解はその記号。
  const LETTERS = "abcd";
  let correctId = "";
  let optItems: LearningItemDef[] = [];
  const opts = (labelOf: (i: LearningItemDef) => string, n = 3) => {
    optItems = shuffle([item, ...distractors(item, pool, n, rng)], rng);
    return optItems.map((i, k) => {
      if (i.id === item.id) correctId = LETTERS[k];
      return { id: LETTERS[k], label: labelOf(i) };
    });
  };

  switch (type) {
    case "listen_choose": {
      const raw = opts((i) => i.emoji ?? i.ja);
      // 絵だけで区別できないとき（曜日がすべて📅など）は日本語も添える
      const pics = optItems.map((i) => i.emoji ?? i.ja);
      const choices = new Set(pics).size === pics.length ? raw : raw.map((c, k) => ({ ...c, label: `${pics[k]} ${optItems[k].ja}` }));
      return { ...base, type, skill: "LISTENING", promptJa: "きこえた ことばの えを えらんでね", audioText: item.text,
        choices, answer: correctId,
        explanationJa: `「${item.text}」は「${item.ja}」だよ。もう一度きいてみよう！` };
    }
    case "tpr_reflex": {
      const choices = opts((i) => `${i.emoji ?? ""} ${i.ja}`);
      return { ...base, type, skill: "LISTENING", promptJa: "めいれいを きいたら すぐに うごきを えらぼう！", audioText: item.text,
        choices, answer: correctId, timeLimitMs: 4000,
        explanationJa: `「${item.text}」は「${item.ja}」。体をうごかしながら言うと覚えやすいよ。` };
    }
    case "meaning_choose": {
      const choices = opts((i) => i.ja);
      return { ...base, type, skill: "VOCABULARY", promptJa: "いみを えらんでね", display: item.text, audioText: item.text,
        choices, answer: correctId, explanationJa: `${item.text} ＝ ${item.ja}` };
    }
    case "expression_choose": {
      const choices = opts((i) => i.text);
      return { ...base, type, skill: "SCHOOL_TEST", promptJa: `「${item.ja}」を英語にすると？`,
        choices, answer: correctId,
        explanationJa: `正解は「${item.text}」。文の最初は大文字、最後はピリオド（.）かクエスチョンマーク（?）だよ。` };
    }
    case "phonics_sound": {
      // 語頭ブレンド → ワールド12（サイトワード・多音節語）→ ワールド10（soft c / g・-y・-le・aw au ew）→ ワールド11（-ed・-er・-est・サイトワード）→ 語末（-st / -s / -ing）→ マジック e → 母音チーム → r の つく母音 → ダイグラフ の順
      // （shopping は sh ではなく ing の回、shape は sh ではなく a_e の回、sheep は sh ではなく ee の回、shark は sh ではなく ar の回、
      //   shy は sh ではなく -y の回、chew は ch ではなく ew の回、what は wh ではなく サイトワードの 回の問題にする）
      // ワールド13（3 単現の -s・-tch / -dge）は いちばん 先（likes を 複数形の -s、catch を ダイグラフの ch で 問わない）
      // ワールド14（複数形・だまっている もじ・数の つづり）は さらに その 先（boxes を ワールド13 の -s の おと、knife を さいしょの おとで 問わない）
      // ワールド15（-ing の つづり・複合語・短縮形・y の 3つの おと）は その 先（running を 語末の -ing、sunflower を はくの 数で 問わない）
      // ワールド16（-ed の つづり・ふきそくな 過去形・-ed の おと）は その 先（wrote を マジック e、stopped を ブレンドで 問わない）
      // ワールド17（-tion / -sion / -ture・'ll / won't・同音異義語・or ore oar our）は その 先（blew を ew の 過去形、won't を n't で 問わない）
      // ワールド18（-er / -est・強勢・-ly・-ful / -less・un-）は その 先（shorter を or の つづり、careful を まとまりで 問わない）
      // ワールド19（re-・道具の -er / -or・だまっている もじ・qu / squ・ou / ough）は その 先（opener を くらべる かたち、knob を ワールド14 で 問わない）
      // ワールド20（-ure・ear / eer・あいまい母音）は その 先（picture を -ture、bear を ワールド9 の ear、banana を 強勢で 問わない）
      // ワールド21（dis-・mis- / pre-・ことばの パーツ・-ment / -ness・音の つながり）は その 先（telephone を ph、disappear を ear、kindness を ブレンドで 問わない）
      // ワールド22（人の -er / -or / -ist・語の家族・あいまい母音と 強勢・-ous / -al・おわりの しるし）は その 先（writer を ワールド11 の -er、pencil を ワールド20 で 問わない）
      // ワールド23（理科の パーツ・-ment・強勢の 移動・-y・-tion）は その 先（photography を あいまい母音、cloudy を ワールド10 の -y、prediction を ワールド17 の -tion で 問わない）
      // ワールド24（地名の 強勢・過去分詞・I've / haven't / she's・over- / under-・im- / in-）は その 先（she's を ワールド15 の she is、Canada を ワールド12 の はくで 問わない）
      // ワールド25（-ness・-ive・複合語・にた いみ・イントネーション）は その 先（kindness を ワールド21、active を ワールド22、something を ワールド15 で 問わない）
      // ワールド26（きもちの こえ・-ed / -ing・セリフの くとうてん・強勢・はやくちことば）は その 先（excited を ワールド11 の -ed の おとで 問わない）
      // ワールド27（ch / -ache・だまって いる もじ・for / since・-able・同音異義語 2）は その 先（knee を ワールド14 の kn、here を ワールド17 で 問わない）
      // ワールド28（カタカナ語・英語に なった 日本語・リズム・音の つながり・ことばの パーツ）は その 先（video を ワールド12 の はく、unhappiness を ワールド21 の -ness で 問わない）
      // ワールド29（spect・dict・意見の 強勢・弱形・-ible / -able）は その 先（prediction を ワールド23 の -tion、respectable を ワールド27 の -able で 問わない）
      // ワールド30（auto-・trans-・-ic の 強勢・略語・話しことば）は その 先（automatic を ワールド12 の はく、translation を ワールド23 の -tion で 問わない）
      // ワールド31（動詞と 名詞の 家族・年号・struct・-ian / -ist・port）は その 先（invention を ワールド23 の -tion、magician を ワールド30 で 問わない）
      // ワールド32（geo・-al・方角・数の 読みかた・データの つづり）は その 先（natural を ワールド31 の 家族、geologist を -ist で 問わない）
      // ワールド33（rupt・-ance / -ence / -ency / -ty・-proof・リストの 読みかた・ject）は その 先（eruption を ワールド23 の -tion、safety を まえの ワールドで 問わない）
      // ワールド34（空港の 数字・vis・2つ ならぶ 文字・-ize・イギリスと アメリカの 英語）は その 先（vacation を ワールド17 の -tion、vis の ことばを まえの ワールドで 問わない）
      // ワールド35（-ity・inter- と co-・対比の 強勢・あらたまった ことば・語根の まとめ）は その 先（interrupt を ワールド33 の rupt、respect を ワールド29 の spect の 問いで 問わない）
      // ワールド36（bio・学習語彙の 強勢・発表の 区切り・-ology・数と たんい）は その 先（biology を ワールド23 の 強勢、-2°C を まえの ワールドで 問わない）
      // ワールド37（物語の 動詞・音の ことば・語りの 間・-ly・たとえ）は その 先（bravely を ワールド18 の -ly、crash を ワールド4 の cr で 問わない）
      // ワールド38（気持ちの つづり・句動詞・共感の イントネーション・慣用句・性格の ことば）は その 先（helpful を まえの ワールドの -ful、cheer up を 音の つながりで 問わない）
      // ワールド39（環境の ことばの パーツ・大きな 数と 割合・ディベートの プロソディ・つなぎの ことば・ヘッジ）は その 先（renewable を まえの ワールドの 接頭辞、seventy percent を まえの 数の 問題で 問わない）
      // ワールド40（つづり・ことばの パーツ・語根・スピーチの 間・苦手な 音の 総まとめ）は いちばん 先（rain を ワールド1〜12 の 母音チーム、inspect を ワールド29 の spect の 問いで 問わない）
      const dq = w40Question(item, rng) ?? w39Question(item, rng) ?? w38Question(item, rng) ?? w37Question(item, rng) ?? w36Question(item, rng) ?? w35Question(item, rng) ?? w34Question(item, rng) ?? w33Question(item, rng) ?? w32Question(item, rng) ?? w31Question(item, rng) ?? w30Question(item, rng) ?? w29Question(item, rng) ?? w28Question(item, rng) ?? w27Question(item, rng) ?? w26Question(item, rng) ?? w25Question(item, rng) ?? w24Question(item, rng) ?? w23Question(item, rng) ?? w22Question(item, rng) ?? w21Question(item, rng) ?? w20Question(item, rng) ?? w19Question(item, rng) ?? w18Question(item, rng) ?? w17Question(item, rng) ?? w16Question(item, rng) ?? w15Question(item, rng) ?? w14Question(item, rng) ?? w13Question(item, rng) ?? blendQuestion(item, rng) ?? w12Question(item, rng) ?? w10Question(item, rng) ?? w11Question(item, rng) ?? endingQuestion(item, rng) ?? magicEQuestion(item, rng) ?? vowelTeamQuestion(item, rng)
        ?? rControlledQuestion(item, rng) ?? digraphQuestion(item, rng);
      if (dq) return { ...base, type, skill: "PHONICS", audioText: item.text, display: "🔊", ...dq };
      const first = item.text[0];
      // c と k は同じ /k/ の音なので、聞き分けられない組み合わせは出さない
      const sameSound = first === "c" ? "k" : first === "k" ? "c" : "";
      const letterPool = "satpinmdgockeurhbfl".split("").filter((l) => l !== sameSound);
      const letters = shuffle([...new Set([first, ...shuffle(letterPool, rng)])].slice(0, 4), rng);
      return { ...base, type, skill: "PHONICS", promptJa: "さいしょの おとは どれ？", audioText: item.text, display: "🔊",
        choices: letters.map((l) => ({ id: l, label: l })), answer: first,
        explanationJa: `${item.text} は「${first}」の音ではじまるよ。${item.ja}` };
    }
    case "spell":
      return { ...base, type, skill: "WRITING", promptJa: `「${item.ja}」を英語で書いてみよう`, display: item.emoji,
        answer: item.text, explanationJa: `正しいつづりは「${item.text}」。` };
    case "speak":
      return { ...base, type, skill: "SPEAKING", promptJa: "マイクをおして、まねして言ってみよう", display: item.text, audioText: item.text,
        answer: item.text, explanationJa: `お手本をよく聞いて、もう一回！` };
  }
}

/** 項目の種類ごとに出題可能な形式 */
function typesFor(item: LearningItemDef, allowSpeak: boolean): QuestionType[] {
  const t: QuestionType[] = [];
  switch (item.kind) {
    case "WORD":
      t.push("listen_choose", "meaning_choose");
      if (item.schoolCore) t.push("spell");
      break;
    case "EXPRESSION":
      t.push("expression_choose");
      if (item.schoolCore) t.push("spell");
      break;
    case "COMMAND":
      t.push("tpr_reflex");
      break;
    case "PHONICS":
      t.push("phonics_sound");
      break;
  }
  if (allowSpeak && item.kind !== "PHONICS") t.push("speak");
  return t;
}

// ---------------------------------------------------------------------------
// テスト（復習クエスト / まとめ / ボス / アリーナ / お宝）
// ---------------------------------------------------------------------------
export interface BuildTestOptions {
  seed: number;
  memories?: ReadonlyMap<string, MemoryState>;
  now?: Date;
  arenaMode?: ArenaMode;
  /** お宝アラート: 対象項目を固定 */
  fixedItemIds?: string[];
}

export function buildTestQuestions(a: AssessmentDef, o: BuildTestOptions): Question[] {
  const rng = seededRng(o.seed);
  const pool = itemsInRange(a.rangeStart, a.rangeEnd);
  const allowSpeak = o.arenaMode === "SPEAKING" || o.arenaMode === "MIXED";

  let chosen: LearningItemDef[];
  if (o.fixedItemIds?.length) {
    chosen = pool.filter((i) => o.fixedItemIds!.includes(i.id)).slice(0, a.questionCount);
  } else if (a.kind === "ARENA" && o.memories) {
    chosen = pickArenaItems(pool, o.memories, a.questionCount, o.now ?? new Date(), rng);
  } else {
    // 範囲内の各レッスンから均等に、学校頻出項目を優先して抽出
    const lessons = [...new Set(pool.map((i) => i.lessonNo))];
    const perLesson = Math.max(1, Math.ceil(a.questionCount / lessons.length));
    chosen = lessons.flatMap((n) => {
      const li = pool.filter((i) => i.lessonNo === n);
      const core = shuffle(li.filter((i) => i.schoolCore), rng);
      const rest = shuffle(li.filter((i) => !i.schoolCore), rng);
      return [...core, ...rest].slice(0, perLesson);
    });
    chosen = shuffle(chosen, rng).slice(0, a.questionCount);
  }

  return chosen.map((item, idx) => {
    let types = typesFor(item, allowSpeak);
    if (o.arenaMode === "LISTENING") types = types.filter((t) => ["listen_choose", "tpr_reflex", "phonics_sound"].includes(t));
    if (o.arenaMode === "WRITING") types = types.filter((t) => t === "spell" || t === "expression_choose");
    if (o.arenaMode === "SPEAKING") types = ["speak"];
    if (types.length === 0) types = typesFor(item, false);
    const type = types[Math.floor(rng() * types.length)];
    return makeQuestion(item, type, pool, rng, idx);
  });
}

// ---------------------------------------------------------------------------
// 1日のレッスン構成（約25〜30分）
// ---------------------------------------------------------------------------
export type LessonStep =
  | { kind: "teacher_video"; minutes: number; script: string; videoUrl?: string }
  | { kind: "flashcards"; minutes: number; itemIds: string[] }
  | { kind: "tpr"; minutes: number; itemIds: string[] }
  | { kind: "phonics"; minutes: number; focus: string[]; words: string[]; tipJa: string }
  | { kind: "school_expressions"; minutes: number; itemIds: string[]; testPoints: string[] }
  | { kind: "pronunciation"; minutes: number; itemIds: string[] }
  | { kind: "quiz"; minutes: number; questions: Question[] }
  | { kind: "speed_listening"; minutes: number; rounds: { rate: number; questions: Question[] }[] }
  | { kind: "conversation"; minutes: number; character: "haru" | "riko" | "kiko" | "birimo"; maxTurns: number };

export const SPEED_ROUNDS = [0.8, 1.0, 1.2] as const;

export function buildLessonFlow(lesson: LessonDef, seed = lesson.lessonNo): LessonStep[] {
  const rng = seededRng(seed);
  const items = itemsOfLesson(lesson);
  const ids = (k: LearningItemDef["kind"]) => items.filter((i) => i.kind === k).map((i) => i.id);
  // 反射クイズのプールは「当日 + 直前4レッスン」（ずっと同じ4択にならないように）
  const reflexPool = itemsInRange(Math.max(1, lesson.lessonNo - 4), lesson.lessonNo).filter((i) => i.kind !== "PHONICS" && i.kind !== "EXPRESSION");
  const todays = items.filter((i) => i.kind === "WORD" || i.kind === "COMMAND");

  const quizItems = shuffle(items, rng).slice(0, 8);
  return [
    { kind: "teacher_video", minutes: 3, script: lesson.teacherScript },
    { kind: "flashcards", minutes: 4, itemIds: [...ids("COMMAND"), ...ids("WORD")] },
    { kind: "tpr", minutes: 4, itemIds: ids("COMMAND") },
    { kind: "phonics", minutes: 5, focus: lesson.phonics.focus, words: lesson.phonics.words, tipJa: lesson.phonics.tipJa },
    { kind: "school_expressions", minutes: 4, itemIds: ids("EXPRESSION"), testPoints: lesson.school.testPoints },
    { kind: "pronunciation", minutes: 3, itemIds: [...ids("WORD").slice(0, 3), ...ids("EXPRESSION").slice(0, 1)] },
    { kind: "quiz", minutes: 4, questions: quizItems.map((it, i) => makeQuestion(it, typesFor(it, false)[0], items, rng, i)) },
    {
      kind: "speed_listening",
      minutes: 3,
      rounds: SPEED_ROUNDS.map((rate, r) => ({
        rate,
        questions: shuffle(todays, rng).slice(0, 4).map((it, i) => ({
          ...makeQuestion(it, it.kind === "COMMAND" ? "tpr_reflex" : "listen_choose", reflexPool, rng, r * 10 + i),
          playbackRate: rate,
          timeLimitMs: Math.round(5000 / rate),
        })),
      })),
    },
    // さいごに AIキャラと かいわ（相手は レッスンごとに Haru → Riko → Kiko → Birimo。その回の 台本で 話す キャラから）。会話データのある レッスンだけ
    ...(lesson.conversation
      ? [{ kind: "conversation" as const, minutes: 3, character: pickConversationPartner(lesson.lessonNo, lesson.conversation), maxTurns: MAX_CONVERSATION_TURNS }]
      : []),
  ];
}
