/**
 * サーバー（Node・API・seed・テスト）用: ワールド13〜40 の フォニックス問題を ぜんぶ 同期で 登録する。
 * ブラウザの ビルドでは next.config.ts が bundledPhonics.browser.ts（空）に 差しかえる（ensurePhonicsLoaded で あとから 読む）。
 */
import type { WorldPhonics } from "./phonicsWorlds";
import { phonics as w13 } from "./phonicsQ/w13";
import { phonics as w14 } from "./phonicsQ/w14";
import { phonics as w15 } from "./phonicsQ/w15";
import { phonics as w16 } from "./phonicsQ/w16";
import { phonics as w17 } from "./phonicsQ/w17";
import { phonics as w18 } from "./phonicsQ/w18";
import { phonics as w19 } from "./phonicsQ/w19";
import { phonics as w20 } from "./phonicsQ/w20";
import { phonics as w21 } from "./phonicsQ/w21";
import { phonics as w22 } from "./phonicsQ/w22";
import { phonics as w23 } from "./phonicsQ/w23";
import { phonics as w24 } from "./phonicsQ/w24";
import { phonics as w25 } from "./phonicsQ/w25";
import { phonics as w26 } from "./phonicsQ/w26";
import { phonics as w27 } from "./phonicsQ/w27";
import { phonics as w28 } from "./phonicsQ/w28";
import { phonics as w29 } from "./phonicsQ/w29";
import { phonics as w30 } from "./phonicsQ/w30";
import { phonics as w31 } from "./phonicsQ/w31";
import { phonics as w32 } from "./phonicsQ/w32";
import { phonics as w33 } from "./phonicsQ/w33";
import { phonics as w34 } from "./phonicsQ/w34";
import { phonics as w35 } from "./phonicsQ/w35";
import { phonics as w36 } from "./phonicsQ/w36";
import { phonics as w37 } from "./phonicsQ/w37";
import { phonics as w38 } from "./phonicsQ/w38";
import { phonics as w39 } from "./phonicsQ/w39";
import { phonics as w40 } from "./phonicsQ/w40";

export const BUNDLED_PHONICS: readonly WorldPhonics[] = [
  w13, w14, w15, w16, w17, w18, w19, w20, w21, w22, w23, w24, w25, w26, w27, w28,
  w29, w30, w31, w32, w33, w34, w35, w36, w37, w38, w39, w40,
];
