/**
 * ブラウザ用の bundledPhonics（空）。next.config.ts が ブラウザの ビルドでだけ bundledPhonics.ts と 差しかえる。
 * ブラウザでは ワールド13〜40 の フォニックス問題を ensurePhonicsLoaded で あとから 読みこむ（ワールドごとの チャンク）。
 */
import type { WorldPhonics } from "./phonicsWorlds";

export const BUNDLED_PHONICS: readonly WorldPhonics[] = [];
