/**
 * ワールド12 の フォニックス（サイトワードの 総復習と 仕上げ・多音節語）の「おと」の表。
 * import の無い 純粋な データなので、レッスン画面（クライアント）からも使える。
 *
 * - サイトワード: ワールド11 の was were said there could would because に、
 *   are they should friend people（L331〜334）と 5W1H の who what when where why how（L351〜353）を くわえる。
 * - 多音節語（L336〜340）: focus は "bas-ket-ball" のように まとまりごとに ハイフンで わけ、words は "basketball"。
 *   まとまりの かず（てを たたく かず）を 問う。
 * - 音読の 回（L341〜349。rule "reading"）は、まえの ワールドの つづり（a_e・ai・ar・-ed・c・-y・aw など）を 文の なかで よむ。
 *   問題は それぞれの ワールドの 問題（magicEQuestion・vowelTeamQuestion・w10Question・w11Question など）を そのまま つかう。
 */

/** ワールド12 で あたらしく focus に なる サイトワードと、はじめて ならう レッスン */
export const W12_INTRO: Record<string, number> = {
  are: 331, they: 332, should: 333, friend: 334, people: 334,
  who: 351, what: 351, when: 352, where: 352, why: 353, how: 353,
};
export const W12_SIGHT_WORDS = Object.keys(W12_INTRO);
/** ワールド12 が はじまる レッスン（それより前の 回では ワールド12 の 問題に しない） */
export const W12_START = 331;
/** 多音節語（まとまりの かずを 問う）が はじまる レッスン（L116〜144 の 2つに わける ことばは いままでどおり） */
export const W12_SYLLABLE_START = 336;

/** サイトワードの よみかたの ヒント（ワールド11 の SIGHT_TIP に ない ことば） */
export const W12_SIGHT_TIP: Record<string, string> = {
  are: "are は「アー」。おわりの e は よまないけど、a を なまえの「エイ」で よまない とくべつな ことば。",
  they: "they は「ゼイ」。ey が「エイ」の おと。th は したを かるく かんで。",
  friend: "friend は「フレンド」。ie だけど「エ」と よむ とくべつな ことば。",
  people: "people は「ピープル」。eo の o は よまないよ。",
  who: "who は「フー」。wh だけど「フ」と よむ とくべつな ことば（だれ）。",
  when: "when は「ウェン」（いつ）。then と おなじ おわりの おと。",
  how: "how は「ハウ」（どうやって・どう）。now と おなじ おわりの おと。",
  now: "now は「ナウ」（いま）。how と おなじ おわりの おと。",
  my: "my は「マイ」。why と おなじ おわりの おと。",
};

/** 多音節語の まとまり（focus の "bas-ket-ball" の なかから ことばに あうもの）。なければ null */
export function syllablesOf(word: string, focus: readonly string[]): string[] | null {
  const w = word.toLowerCase();
  const f = focus.find((x) => /^[a-z]+(-[a-z]+)+$/.test(x) && x.replace(/-/g, "") === w);
  return f ? f.split("-") : null;
}

/** フォーカスの ボタンの 読み上げ（"bas-ket-ball" は ことば まるごと "basketball" で よむ）。あてはまらなければ null */
export function w12Say(focus: string): string | null {
  return /^[a-z]+(-[a-z]+)+$/.test(focus) ? focus.replace(/-/g, "") : null;
}
