/**
 * ブラウザ用の bundledWorlds（空）。next.config.ts が ブラウザの ビルドでだけ bundledWorlds.ts と 差しかえる。
 * ブラウザでは レッスンを ワールドごとに あとから 読みこむ（ensureLessonsLoaded → content/curriculum/worlds/world-NN.json の チャンク）。
 */
import type { WorldFile } from "./types";

export const BUNDLED_WORLDS: readonly WorldFile[] = [];
