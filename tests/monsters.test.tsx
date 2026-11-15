/**
 * モンスター図鑑（100体）のテスト: データの整合性・どんな id でも落ちないこと・全員の絵が描けること。
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ARCHETYPES, ELEMENTS, LEGACY_ALIASES, MONSTERS, MONSTER_COUNT, RARITY_COUNTS, RARITY_STYLE, getMonster, resolveMonster } from "@/lib/game/monsters";
import { rollMonster } from "@/lib/domain/gacha";
import { MonsterArt } from "@/components/characters/MonsterArt";
import { MonsterCard } from "@/components/monsters/MonsterCard";
import { CollectionResponseSchema, GachaResponseSchema } from "@/lib/api/contracts";
import { coerce } from "@/lib/api/client";

describe("図鑑データ", () => {
  it("ちょうど100体・IDと図鑑番号が重複しない", () => {
    expect(MONSTER_COUNT).toBe(100);
    expect(new Set(MONSTERS.map((m) => m.id)).size).toBe(100);
    expect(MONSTERS.map((m) => m.no)).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it("10種族×10属性をすべて網羅", () => {
    for (const a of ARCHETYPES) for (const e of ELEMENTS) {
      expect(MONSTERS.some((m) => m.archetype === a.id && m.element === e.id)).toBe(true);
    }
  });

  it("レア度の内訳が設定どおり（神話級6・英雄級14・希少種30・通常種50）", () => {
    for (const [r, n] of Object.entries(RARITY_COUNTS)) {
      expect(MONSTERS.filter((m) => m.rarity === r)).toHaveLength(n);
    }
  });

  it("全員に名前・二つ名・覚える英単語がある", () => {
    for (const m of MONSTERS) {
      expect(m.nameJa.length).toBeGreaterThan(0);
      expect(m.titleJa.length).toBeGreaterThan(0);
      expect(m.words.length).toBeGreaterThan(0);
      expect(RARITY_STYLE[m.rarity]).toBeDefined();
    }
  });
});

describe("どんな id でも落ちない", () => {
  it("知らない id・空・null・undefined でも必ず1体を返す", () => {
    for (const id of ["", "nope", "mon-999", null, undefined, "m-slime-zzz"]) {
      const m = resolveMonster(id as string | null | undefined);
      expect(MONSTERS).toContain(m);
    }
    expect(getMonster("nope")).toBeUndefined();
  });

  it("以前のモンスターID（m-…）は対応する新しいモンスターになる", () => {
    for (const [legacy, id] of Object.entries(LEGACY_ALIASES)) {
      expect(resolveMonster(legacy).id).toBe(id);
    }
  });

  it("ガチャは必ず図鑑の中の1体を返す（レア券は希少種以上）", () => {
    let seed = 1;
    const rng = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 500; i++) {
      expect(MONSTERS).toContain(rollMonster(MONSTERS, "NORMAL", rng));
      expect(rollMonster(MONSTERS, "RARE", rng).rarity).not.toBe("COMMON");
    }
    // 乱数がちょうど 1 を返しても範囲外にならない
    expect(MONSTERS).toContain(rollMonster(MONSTERS, "NORMAL", () => 0.9999999999));
  });
});

describe("全員の絵とカードが描ける", () => {
  it("100体ぶんの絵とカードを例外なく描画できる", () => {
    for (const m of MONSTERS) {
      expect(renderToStaticMarkup(<svg><MonsterArt id={m.id} /></svg>)).toContain("<g");
      expect(renderToStaticMarkup(<MonsterCard id={m.id} size="sm" owned={m.no % 2 === 0} />)).toContain("mcard");
    }
  });
});

describe("図鑑・ガチャのAPI契約", () => {
  it("壊れたレスポンスでも安全なデフォルト値", () => {
    expect(coerce(CollectionResponseSchema, null)).toEqual({ owned: [], coins: 0, rareTickets: 0 });
    const g = coerce(GachaResponseSchema, { ok: true, monster: "bad" });
    expect(g.monster).toBeNull();
    expect(g.isNew).toBe(false);
  });
  it("持っているモンスターの壊れた要素だけ捨てる", () => {
    const c = coerce(CollectionResponseSchema, { owned: [{ id: "mon-001", count: 2 }, null, { count: 3 }] });
    expect(c.owned).toEqual([{ id: "mon-001", count: 2 }]);
  });
});
