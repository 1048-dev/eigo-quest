/** 英語モンスター図鑑ガチャ（純粋関数）。レアガチャ券はボス戦合格で付与され RARE 以上確定。 */
import { GACHA_RULES } from "./config";

export type Rarity = "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
export interface MonsterDef { id: string; nameEn: string; nameJa: string; rarity: Rarity; theme: string; imageKey: string }

export function rollRarity(kind: "NORMAL" | "RARE", rng: () => number): Rarity {
  const rates = kind === "RARE" ? GACHA_RULES.rareTicketRates : GACHA_RULES.normalRates;
  let x = rng();
  for (const r of ["LEGENDARY", "EPIC", "RARE", "COMMON"] as const) {
    x -= rates[r];
    if (x < 0) return r;
  }
  return kind === "RARE" ? "RARE" : "COMMON";
}

export function rollMonster<T extends MonsterDef>(pool: readonly T[], kind: "NORMAL" | "RARE", rng: () => number): T {
  const rarity = rollRarity(kind, rng);
  // 該当レア度がプールに無ければ1段階ずつ下げる
  const order: Rarity[] = ["LEGENDARY", "EPIC", "RARE", "COMMON"];
  for (let i = order.indexOf(rarity); i < order.length; i++) {
    const c = pool.filter((m) => m.rarity === order[i]);
    if (c.length) return c[Math.min(c.length - 1, Math.floor(rng() * c.length))];
  }
  return pool[0];
}
