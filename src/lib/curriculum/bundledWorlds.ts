/**
 * 自動生成（npm run curriculum:index）。手で 書きかえない。
 * サーバー（Node・API・seed・テスト）で 全ワールドの レッスンを 読みこむ。
 * ブラウザの ビルドでは next.config.ts が bundledWorlds.browser.ts（空）に 差しかえる（カリキュラム全体を ブラウザに 送らない）。
 */
import type { WorldFile } from "./types";
import w01 from "@content/curriculum/worlds/world-01.json";
import w02 from "@content/curriculum/worlds/world-02.json";
import w03 from "@content/curriculum/worlds/world-03.json";
import w04 from "@content/curriculum/worlds/world-04.json";
import w05 from "@content/curriculum/worlds/world-05.json";
import w06 from "@content/curriculum/worlds/world-06.json";
import w07 from "@content/curriculum/worlds/world-07.json";
import w08 from "@content/curriculum/worlds/world-08.json";
import w09 from "@content/curriculum/worlds/world-09.json";
import w10 from "@content/curriculum/worlds/world-10.json";
import w11 from "@content/curriculum/worlds/world-11.json";
import w12 from "@content/curriculum/worlds/world-12.json";
import w13 from "@content/curriculum/worlds/world-13.json";
import w14 from "@content/curriculum/worlds/world-14.json";
import w15 from "@content/curriculum/worlds/world-15.json";
import w16 from "@content/curriculum/worlds/world-16.json";
import w17 from "@content/curriculum/worlds/world-17.json";
import w18 from "@content/curriculum/worlds/world-18.json";
import w19 from "@content/curriculum/worlds/world-19.json";
import w20 from "@content/curriculum/worlds/world-20.json";
import w21 from "@content/curriculum/worlds/world-21.json";
import w22 from "@content/curriculum/worlds/world-22.json";
import w23 from "@content/curriculum/worlds/world-23.json";
import w24 from "@content/curriculum/worlds/world-24.json";
import w25 from "@content/curriculum/worlds/world-25.json";
import w26 from "@content/curriculum/worlds/world-26.json";
import w27 from "@content/curriculum/worlds/world-27.json";
import w28 from "@content/curriculum/worlds/world-28.json";
import w29 from "@content/curriculum/worlds/world-29.json";
import w30 from "@content/curriculum/worlds/world-30.json";
import w31 from "@content/curriculum/worlds/world-31.json";
import w32 from "@content/curriculum/worlds/world-32.json";
import w33 from "@content/curriculum/worlds/world-33.json";
import w34 from "@content/curriculum/worlds/world-34.json";
import w35 from "@content/curriculum/worlds/world-35.json";
import w36 from "@content/curriculum/worlds/world-36.json";
import w37 from "@content/curriculum/worlds/world-37.json";
import w38 from "@content/curriculum/worlds/world-38.json";
import w39 from "@content/curriculum/worlds/world-39.json";
import w40 from "@content/curriculum/worlds/world-40.json";

export const BUNDLED_WORLDS = [w01, w02, w03, w04, w05, w06, w07, w08, w09, w10, w11, w12, w13, w14, w15, w16, w17, w18, w19, w20, w21, w22, w23, w24, w25, w26, w27, w28, w29, w30, w31, w32, w33, w34, w35, w36, w37, w38, w39, w40] as unknown as readonly WorldFile[];
