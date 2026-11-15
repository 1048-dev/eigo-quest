"use client";
import { useState } from "react";
import { GACHA_RULES } from "@/lib/domain/config";
import type { MonsterDef } from "@/lib/domain/gacha";

/** 英語モンスター図鑑ガチャ（骨組み）。図鑑一覧・アバターショップは同じパターンで追加する */
export default function GachaPage() {
  const [got, setGot] = useState<MonsterDef | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const roll = async (useRareTicket: boolean) => {
    setMsg(null);
    const r = await fetch("/api/gacha", { method: "POST", body: JSON.stringify({ useRareTicket }) }).then((x) => x.json());
    r.ok ? setGot(r.monster) : setMsg(r.reasonJa);
  };
  return (
    <div className="space-y-4 text-center">
      <h1 className="text-xl font-black">🥚 えいごモンスター ガチャ</h1>
      <div className="card grid place-items-center p-8">
        <span className="bob text-8xl">{got ? got.imageKey : "🥚"}</span>
        {got && <p className="mt-3 text-xl font-black">{got.nameEn}<span className="block text-sm text-[var(--ink-2)]">{got.nameJa}・{got.rarity}</span></p>}
        {msg && <p className="mt-3 font-bold text-[var(--ng)]">{msg}</p>}
      </div>
      <div className="flex gap-3">
        <button className="btn btn-coin flex-1" onClick={() => roll(false)}>🪙{GACHA_RULES.normalCost} でまわす</button>
        <button className="btn btn-primary flex-1" onClick={() => roll(true)}>🎟️ レアけん</button>
      </div>
    </div>
  );
}
