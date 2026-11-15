"use client";
import { useState } from "react";
import monsters from "@content/curriculum/monsters.json";
import { HeroScene } from "@/components/scene/HeroScene";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { StandingFigure } from "@/components/characters/StandingArt";
import { apiPost } from "@/lib/api/client";
import { GachaResponseSchema, type GachaResponse } from "@/lib/api/contracts";
import { GACHA_RULES } from "@/lib/domain/config";

const RARITY_JA: Record<string, string> = { COMMON: "ふつう", RARE: "レア", EPIC: "スーパーレア", LEGENDARY: "でんせつ" };
const ALL_MONSTERS = (monsters.monsters ?? []) as { id: string; nameJa: string; rarity: string }[];

/** 英語モンスター図鑑ガチャ */
export default function GachaPage() {
  const [got, setGot] = useState<GachaResponse["monster"]>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const roll = async (useRareTicket: boolean) => {
    setMsg(null);
    setBusy(true);
    const r = await apiPost("/api/gacha", GachaResponseSchema, { useRareTicket });
    setBusy(false);
    if (r.data.ok && r.data.monster) setGot(r.data.monster);
    else setMsg(r.data.reasonJa || r.error || "ガチャを回せなかったよ。");
  };

  return (
    <div className="space-y-5">
      <HeroScene title="🥚 えいごモンスター ガチャ" subtitle="コインでなかまを ふやそう！" variant="gacha" />
      <ErrorBanner message={msg} />

      <div className="card rpg-rivets relative grid place-items-center overflow-hidden p-6">
        <div className="pointer-events-none absolute -left-2 bottom-0" aria-hidden><StandingFigure id="kiko" pose="cheer" height={120} /></div>
        <div className="pointer-events-none absolute -right-2 bottom-0" aria-hidden><StandingFigure id="birimo" mood="excited" height={110} /></div>
        {got ? (
          <>
            <MonsterFigure id={got.id} size={140} className="bob" />
            <p className="mt-2 text-xl font-black">{got.nameEn}<span className="block text-center text-sm text-[var(--ink-2)]">{got.nameJa}・{RARITY_JA[got.rarity] ?? got.rarity}</span></p>
          </>
        ) : (
          <div className="grid h-36 w-36 place-items-center rounded-full border-4 border-dashed border-[var(--gold-dark)] bg-[var(--bg)]">
            <p className="font-title text-center text-sm text-[var(--ink-2)]">なにが<br />でるかな？</p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button className="btn btn-coin flex-1 whitespace-nowrap px-3" disabled={busy} onClick={() => roll(false)}>🪙{GACHA_RULES.normalCost} でまわす</button>
        <button className="btn btn-primary flex-1 whitespace-nowrap px-3" disabled={busy} onClick={() => roll(true)}>🎟️ レアけん</button>
      </div>

      <section className="card rpg-rivets p-4">
        <h2 className="font-title text-lg text-[var(--gold-dark)]">モンスター図鑑</h2>
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {ALL_MONSTERS.map((m) => (
            <li key={m.id} className="flex flex-col items-center rounded-xl border-2 border-[var(--parchment-edge)] bg-[var(--bg)] p-1 text-center">
              <MonsterFigure id={m.id} size={56} />
              <span className="text-[11px] font-black leading-tight">{m.nameJa}</span>
              <span className="text-[10px] text-[var(--ink-2)]">{RARITY_JA[m.rarity] ?? m.rarity}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
