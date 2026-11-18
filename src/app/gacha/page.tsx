"use client";
/**
 * 召喚（ガチャ）と英語モンスター図鑑（100体）。
 * - 召喚: 魔法陣の祭壇でコインまたはレアガチャ券を使い、光とともにカードが現れる
 * - 図鑑: 100体をレア度の額縁つきで並べ、まだ出会っていないモンスターはシルエットで見せる
 * データはすべて契約（lib/api/contracts.ts）どおりに受け取り、欠けていてもデフォルト値で表示する。
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { HeroScene } from "@/components/scene/HeroScene";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { OfflineNote } from "@/components/common/OfflineNote";
import { CoinBadge } from "@/components/common/CoinBadge";
import { MonsterCard } from "@/components/monsters/MonsterCard";
import { CompanionBubble } from "@/components/game/CompanionBubble";
import { apiGet, apiPost, isUnreachable } from "@/lib/api/client";
import { offlineGacha } from "@/lib/offline";
import { CollectionResponseSchema, GachaResponseSchema, type CollectionResponse, type GachaResponse } from "@/lib/api/contracts";
import { GACHA_RULES } from "@/lib/domain/config";
import { MONSTERS, MONSTER_COUNT, RARITIES, RARITY_STYLE, resolveMonster, type Rarity } from "@/lib/game/monsters";

type Filter = "ALL" | Rarity;

const RATE_ROWS: Rarity[] = ["LEGENDARY", "EPIC", "RARE", "COMMON"];
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;

export default function GachaPage() {
  const [col, setCol] = useState<CollectionResponse>({ owned: [], coins: 0, rareTickets: 0 });
  const [result, setResult] = useState<GachaResponse | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await apiGet("/api/monsters", CollectionResponseSchema);
    setCol(r.data); // 届かなくても空の図鑑として表示できる
    setOffline(!r.ok || !!r.data.offline);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const ownedMap = useMemo(() => new Map((col.owned ?? []).map((o) => [o.id, o.count])), [col.owned]);
  const ownedCount = ownedMap.size;
  const list = useMemo(() => MONSTERS.filter((m) => filter === "ALL" || m.rarity === filter), [filter]);

  const roll = async (useRareTicket: boolean) => {
    setMsg(null);
    setBusy(true);
    setResult(null);
    const res = await apiPost("/api/gacha", GachaResponseSchema, { useRareTicket });
    // サーバーに届かないときは「おためし召喚」（記録はされない）
    const r = isUnreachable(res) ? { ...res, ok: true, data: offlineGacha(useRareTicket) } : res;
    setBusy(false);
    if (r.data.offline) setOffline(true);
    if (r.data.ok && r.data.monster) {
      setResult(r.data);
      setCol((c) => ({
        coins: r.data.coins,
        rareTickets: r.data.rareTickets,
        owned: ownedMap.has(r.data.monster!.id)
          ? (c.owned ?? []).map((o) => (o.id === r.data.monster!.id ? { ...o, count: o.count + 1 } : o))
          : [...(c.owned ?? []), { id: r.data.monster!.id, count: 1 }],
      }));
    } else {
      setMsg(r.data.reasonJa || r.error || "召喚できなかったよ。");
    }
  };

  const got = result?.monster ? resolveMonster(result.monster.id) : null;
  const sel = selected ? resolveMonster(selected) : null;

  return (
    <div className="space-y-5">
      <HeroScene title="召喚の神殿" subtitle={`英語モンスター図鑑 ${ownedCount} / ${MONSTER_COUNT}`} variant="gacha" />
      <OfflineNote show={offline} note="おためし召喚は きろくされないよ" />
      <ErrorBanner message={msg} />

      <div className="flex items-center justify-between gap-2">
        <CompanionBubble className="flex-1" size={56} line={{ mood: "excited", text: got ? (RARITY_STYLE[got.rarity].stars >= 3 ? "すごいビリ！！ものすごく強いモンスターが来たビリ！" : "新しいなかまビリ！英単語もいっしょに覚えるビリ！") : "魔法陣にコインをささげると、モンスターが召喚されるビリ！" }} />
      </div>
      <div className="flex justify-end"><CoinBadge coins={col.coins} /><span className="ml-2 rounded-full border-2 border-[#3a2270] bg-[radial-gradient(120%_90%_at_50%_0%,#e9d6ff,#8a55e8_45%,#2c0f66)] px-3 py-1 text-sm font-black text-white shadow-[0_0_14px_rgba(138,85,232,.6)]">🎟️ ×{col.rareTickets}</span></div>

      {/* 召喚の祭壇 */}
      <section className="rpg-wood relative overflow-hidden p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_60%,rgba(242,193,78,.25),transparent_70%)]" />
        <div className="relative grid min-h-[300px] place-items-center">
          {got ? (
            <div className="relative" key={result?.monster?.id + String(Date.now())}>
              <div className="summon-burst pointer-events-none absolute inset-0 m-auto h-40 w-40 rounded-full bg-[radial-gradient(circle,#fff8d0,rgba(242,193,78,.6)_40%,transparent_70%)]" />
              <div className="summon-in w-[240px]"><MonsterCard id={got.id} size="lg" isNew={!!result?.isNew} /></div>
            </div>
          ) : (
            <svg viewBox="0 0 200 200" className="h-64 w-64" aria-label="召喚の魔法陣">
              <g className={busy ? "spin-slow" : ""} style={{ transformOrigin: "100px 100px" }} filter="url(#f-bloom-gold)">
                <circle cx={100} cy={100} r={86} fill="none" stroke="#ffd96a" strokeWidth={2} />
                <circle cx={100} cy={100} r={70} fill="none" stroke="#ffd96a" strokeWidth={1} strokeDasharray="6 5" />
                <path d="M100 18 L171 141 L29 141 Z M100 182 L29 59 L171 59 Z" fill="none" stroke="#ffd96a" strokeWidth={1.4} />
                {"ABCDEFGHIJKL".split("").map((c, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  return <text key={c} x={100 + Math.cos(a) * 78} y={104 + Math.sin(a) * 78} fontSize={10} textAnchor="middle" fill="#ffe7a0" fontFamily="Georgia, serif">{c}</text>;
                })}
              </g>
              <circle cx={100} cy={100} r={30} fill="url(#g-magic)" className="pulse-glow" />
            </svg>
          )}
        </div>
        <div className="relative mt-4 flex gap-3">
          <button className="btn btn-coin flex-1 whitespace-nowrap px-3" disabled={busy} onClick={() => roll(false)}>🪙{GACHA_RULES.normalCost} で召喚</button>
          <button className="btn btn-berry flex-1 whitespace-nowrap px-3" disabled={busy || col.rareTickets <= 0} onClick={() => roll(true)}>🎟️ レア召喚</button>
        </div>
        <details className="relative mt-3 text-xs text-[var(--on-dark-2)]">
          <summary className="cursor-pointer font-bold">出現率（おうちの方へ）</summary>
          <table className="mt-2 w-full">
            <thead><tr className="text-left"><th>ランク</th><th>コイン召喚</th><th>レア召喚</th></tr></thead>
            <tbody>
              {RATE_ROWS.map((r) => (
                <tr key={r}><td>{RARITY_STYLE[r].frameJa}・{RARITY_STYLE[r].gradeJa}</td><td>{pct(GACHA_RULES.normalRates[r] ?? 0)}</td><td>{pct(GACHA_RULES.rareTicketRates[r] ?? 0)}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1">コインは学習でのみ手に入り、お金で買うことはできません。</p>
        </details>
      </section>

      {/* 図鑑 */}
      <section className="card rpg-rivets p-4">
        <div className="flex items-end justify-between">
          <h2 className="title-metal text-xl">英語モンスター図鑑</h2>
          <span className="font-title text-sm text-[var(--gold-dark)]">{ownedCount} / {MONSTER_COUNT}</span>
        </div>
        <div className="mt-2 rpg-gauge"><span style={{ width: `${(ownedCount / MONSTER_COUNT) * 100}%`, ["--gauge" as string]: "linear-gradient(90deg,#ffd96a,#ff9cf0,#9cf0ff)" }} /></div>
        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="ランクでしぼりこむ">
          {(["ALL", ...RARITIES] as Filter[]).map((f) => (
            <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}
              className={`rounded-full border px-3 py-1 text-xs font-black ${filter === f ? "border-[#ffd96a] bg-[#ffd96a] text-[#2a1a03]" : "border-[#ffd96a]/40 text-[var(--ink-2)]"}`}>
              {f === "ALL" ? "すべて" : RARITY_STYLE[f].frameJa}
            </button>
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {list.map((m) => {
            const count = ownedMap.get(m.id) ?? 0;
            return (
              <li key={m.id}>
                <button className="block w-full text-left" onClick={() => setSelected(count > 0 ? m.id : null)} aria-label={count > 0 ? m.nameJa : `No.${m.no} まだ出会っていない`}>
                  <MonsterCard id={m.id} owned={count > 0} count={count} size="sm" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {sel && (
        <div role="dialog" aria-modal className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-[280px]" onClick={(e) => e.stopPropagation()}>
            <MonsterCard id={sel.id} size="lg" count={ownedMap.get(sel.id) ?? 0} />
            <button className="btn mt-3 w-full" onClick={() => setSelected(null)}>とじる</button>
          </div>
        </div>
      )}
    </div>
  );
}
