# Run 3 progress

## Phase 1 - 片付け（完了）

### やったこと
- **night-logs/ を git から外した**: `.gitignore` に `night-logs/` を追加し、`git rm -r --cached night-logs` で追跡を解除（39ファイル）。ディスク上のファイルはそのまま残している。
- **ワールド12の名前を「グランドフィナーレ」→「えいごの王国」に変更**
  - `src/lib/game/worlds.ts`（ワールド名のただ1つのもと。マップ `WorldMap.tsx` とレッスン画面のヘッダーはここを参照しているので自動で反映）
  - `content/curriculum/lessons.json`
    - L331（ワールド12の入口）: teacherScript「ワールド12「えいごの王国」へ ようこそ！」、会話シーン「An entrance ceremony at a junior high school in the Kingdom of English／えいごの王国の ちゅうがっこうの にゅうがくしき」、セリフ「Welcome to the Kingdom of English!／えいごの王国へ ようこそ！」
    - L360（最終回）: titleJa「えいごの王国の グランドフィナーレ（360レッスン そうまとめ）」、シーン「The Grand Finale party in the Kingdom of English／えいごの王国の グランドフィナーレ・パーティー」
    - L360 のまとめ（recap）: 「えいごの王国での さいごの スピーチ、さいこうだったよ」
  - `README.md` と `docs/curriculum-plan.md` のワールド表、curriculum-plan のレッスン360の行

### 判断したこと
- 指示どおり、最終回（L356〜360）の「グランドフィナーレ・パーティー」は **王国の中で開かれる最後のパーティーの名前** としてそのまま残した。ワールドそのものを指していた箇所（L331の入口、ワールド表）だけを王国に変えた。L360 の英語タイトル「World 12 Grand Finale」も最終回の名前として残した。
- L360 の単語 "finale／フィナーレ" はパーティーの単語として残した。
- `docs/night/`・`docs/night2/` の過去の記録は当時の記録なので書き換えていない。
- curriculum-plan の「### ワールド12（…）」見出しは、ほかのワールドの見出しにも名前がないので、そろえるために変えていない。

### チェック
- `npx tsc --noEmit` OK
- `npx vitest run` OK（25ファイル・703テスト）
- `npx next build` OK
