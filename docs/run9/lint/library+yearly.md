# English lint: library+yearly

- 日付: 2026-11-27
- はんい: としょかん ＋ 力だめし（`npm run english:lint -- --library --yearly`）
- しらべた 文字列: 4283（144 ユニット）
- 結果: **error 0 / warn 2 / info 19**

ルールの いみは docs/english-style-guide.md §11。

| rule | error | warn | info |
|---|---:|---:|---:|
| contraction | 0 | 0 | 16 |
| please-command | 0 | 0 | 1 |
| punctuation | 0 | 1 | 0 |
| sentence-length | 0 | 1 | 0 |
| stiff-phrase | 0 | 0 | 1 |
| uk-word | 0 | 0 | 1 |

## ユニットごと

### chant:c-13 — What Are You Doing?
- **info** contraction `lines[1].en` — "What is" → "what's"?
- **info** contraction `lines[3].en` — "What is" → "what's"?

### chant:c-22 — It Was Made By
- **info** contraction `lines[3].en` — "it is" → "it's"?

### story:s1-07 — The Big Pig
- **info** contraction `lines[6].en` — "is not" → "isn't"?

### story:s2-13 — A Letter to the Future
- **warn** punctuation `lines[8].en` — missing end mark (. ! ?)  
  > From, Kiko of today

### story:s2-16 — The Toy Machine
- **info** stiff-phrase `lines[7].en` — "very, very" → OK in storytelling; don't overuse (really ~ / so ~)  
  > The machine shakes and beeps. Out comes a rabbit with very, very long ears.

### story:s3-14 — Bored or Boring?
- **info** contraction `lines[10].en` — "I am" → "I'm"?

### story:s4-08 — What If...?
- **info** contraction `lines[7].en` — "it is" → "it's"?

### story:s4-11 — The Map on the Tent
- **info** contraction `lines[6].en` — "It is" → "it's"?

### story:s4-16 — The Lost Passport
- **info** please-command `lines[9].en` — ""Please wait here," says the officer." → Can you ~? / Let's ~. / plain imperative  
  > "Please wait here," says the officer. "Someone will check the plane for you."

### story:s5-02 — Three Sentences Only
- **info** contraction `lines[5].en` — "what is" → "what's"?

### story:s5-07 — What Would You Do?
- **info** contraction `lines[1].en` — "will not" → "won't"?

### story:s5-18 — The Old Me, the Me Now
- **info** contraction `lines[2].en` — "I am" → "I'm"?
- **info** contraction `lines[5].en` — "It is" → "it's"?

### talk:t-food — すきな たべもの
- **info** uk-word `lines[2].en` — "sweets" → candy (sweets is OK for 'sweet things')  
  > Curry! It's yummy! Do you like sweets?

### talk:t-dream — しょうらいの ゆめ
- **warn** sentence-length `lines[4].en` — 10 words > 8 (stage 1): "I want to be a writer because I love stories."  
  > That's wonderful! I want to be a writer because I love stories. What are you good at?

### yearly:3 — ステージ3 の 力だめし
- **info** contraction `listening[18].audio[0].en` — "do not" → "don't"?

### yearly:4 — ステージ4 の 力だめし
- **info** contraction `listening[13].audio[0].en` — "do not" → "don't"?
- **info** contraction `listening[16].audio[0].en` — "did not" → "didn't"?

### yearly:5 — ステージ5 の 力だめし
- **info** contraction `listening[17].audio[3].en` — "are not" → "aren't"?
- **info** contraction `listening[20].audio[1].en` — "it is" → "it's"?
