/**
 * イラスト（SVG）の健全性チェック。画面のスクリーンショットが撮れない環境でも、壊れた絵を見つけられるようにする。
 *  - 共通定義（ArtDefs）の id が重複していない
 *  - どの絵の url(#...) も、ArtDefs かその絵の中で定義された id を指している（参照切れ＝真っ黒・透明になるのを防ぐ）
 *  - 座標に NaN / undefined / Infinity が混ざっていない
 *  - 絵の中の id が ArtDefs の id とぶつからない
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { ArtDefs } from "@/components/art/ArtDefs";
import { BirimoArt, CharacterArt, HaruArt, KikoArt, Portrait, RikoArt } from "@/components/characters/CharacterArt";
import { Standing, StandingFigure, type Pose } from "@/components/characters/StandingArt";
import { TeacherArt } from "@/components/characters/TeacherArt";
import { MonsterArt, MonsterFigure } from "@/components/characters/MonsterArt";
import { HeroScene, type HeroVariant } from "@/components/scene/HeroScene";
import { CharacterParade } from "@/components/scene/CharacterParade";
import { FieldBackdrop } from "@/components/scene/FieldBackdrop";
import { MONSTERS } from "@/lib/game/monsters";
import type { Mood } from "@/lib/game/companion";

const svg = (el: ReactElement) => renderToStaticMarkup(<svg>{el}</svg>);
const idsIn = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const refsIn = (html: string) => [...html.matchAll(/url\(#([^)]+)\)/g), ...html.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);

const defsHtml = renderToStaticMarkup(<ArtDefs />);
const defIds = idsIn(defsHtml);
const defSet = new Set(defIds);

function check(name: string, html: string) {
  const local = idsIn(html);
  const known = new Set([...defSet, ...local]);
  const missing = [...new Set(refsIn(html).filter((r) => !known.has(r)))];
  expect(missing, `${name}: 参照切れ`).toEqual([]);
  expect(html, `${name}: 数値が壊れている`).not.toMatch(/NaN|Infinity|="undefined"|="null"/);
  const clash = local.filter((id) => defSet.has(id));
  expect(clash, `${name}: ArtDefs と id が重複`).toEqual([]);
}

const IDS = ["haru", "riko", "kiko", "birimo"] as const;
const POSES: Pose[] = ["idle", "wave", "point", "cheer"];
const MOODS: Mood[] = ["happy", "excited", "sleepy", "cheer", "worried"];

describe("ArtDefs", () => {
  it("id が重複していない", () => {
    const dup = defIds.filter((id, i) => defIds.indexOf(id) !== i);
    expect(dup).toEqual([]);
  });
  it("ArtDefs 自身の参照も切れていない", () => {
    expect(refsIn(defsHtml).filter((r) => !defSet.has(r))).toEqual([]);
  });
});

describe("キャラクター", () => {
  it("顔（バスト・頭だけ）", () => {
    for (const [n, C] of [["haru", HaruArt], ["riko", RikoArt], ["kiko", KikoArt]] as const) {
      check(`${n}-bust`, svg(<C />));
      check(`${n}-head`, svg(<C bust={false} />));
    }
    for (const m of MOODS) check(`birimo-${m}`, svg(<BirimoArt mood={m} />));
    for (const id of IDS) check(`art-${id}`, svg(<CharacterArt id={id} />));
  });
  it("ポートレート", () => {
    for (const id of IDS) check(`portrait-${id}`, renderToStaticMarkup(<Portrait id={id} size={48} ring="#ff8a3d" />));
  });
  it("立ち絵（全キャラ×全ポーズ・反転）", () => {
    for (const id of IDS) {
      for (const pose of POSES) {
        check(`${id}-${pose}`, svg(<Standing id={id} pose={pose} mood="happy" />));
        check(`${id}-${pose}-fig`, renderToStaticMarkup(<StandingFigure id={id} pose={pose} height={120} flip />));
      }
    }
  });
  it("エマ先生（話す／だまる）", () => {
    check("teacher", svg(<TeacherArt />));
    check("teacher-talking", svg(<TeacherArt talking />));
  });
});

describe("モンスター", () => {
  it("全100体", () => {
    for (const m of MONSTERS) check(m.id, svg(<MonsterArt id={m.id} letter="A" />));
    check("figure", renderToStaticMarkup(<MonsterFigure id={MONSTERS[0].id} flip />));
    check("unknown-id", svg(<MonsterArt id="does-not-exist" />));
  });
});

describe("背景・シーン", () => {
  const variants: HeroVariant[] = ["map", "dashboard", "arena", "gacha", "ranking", "lesson"];
  it("ヒーローバナー（全種類）", () => {
    for (const v of variants) {
      const html = renderToStaticMarkup(<HeroScene title="テスト" subtitle="sub" variant={v} />);
      check(`hero-${v}`, html);
      const ids = idsIn(html);
      expect(ids.filter((id, i) => ids.indexOf(id) !== i), `hero-${v}: id 重複`).toEqual([]);
    }
  });
  it("パレードと全画面の背景", () => {
    check("parade", renderToStaticMarkup(<CharacterParade />));
    check("backdrop", renderToStaticMarkup(<FieldBackdrop />));
  });
});
