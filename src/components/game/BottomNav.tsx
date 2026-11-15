"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Portrait } from "@/components/characters/CharacterArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import type { CharacterId } from "@/lib/game/characters";

type Icon = { char: CharacterId } | { monster: string };

const NAV: { href: string; label: string; icon: Icon }[] = [
  { href: "/map", label: "ぼうけん", icon: { char: "haru" } },
  { href: "/arena", label: "アリーナ", icon: { monster: "m-alpha-dragon" } },
  { href: "/gacha", label: "ずかん", icon: { char: "birimo" } },
  { href: "/ranking", label: "ランキング", icon: { char: "riko" } },
  { href: "/dashboard", label: "ステータス", icon: { char: "kiko" } },
];

/** 木の板＋金縁のRPGメニュー。アイコンはキャラクターの顔 */
export function BottomNav() {
  const path = usePathname() ?? "";
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-[#b8862a] bg-[linear-gradient(180deg,rgba(14,32,32,.88),rgba(4,10,12,.95))] shadow-[inset_0_1px_0_#fff2b0,0_-10px_30px_rgba(0,0,0,.6)] backdrop-blur-xl">
      <ul className="mx-auto grid max-w-3xl grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map((n) => {
          const active = path.startsWith(n.href);
          return (
            <li key={n.href} className="p-1">
              <Link href={n.href} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center rounded-xl py-1 text-[11px] font-black transition ${active ? "bg-[radial-gradient(120%_90%_at_50%_0%,rgba(255,248,207,.95),rgba(242,193,78,.9)_45%,rgba(176,122,28,.9))] text-[#2a1a03] shadow-[inset_0_1px_0_rgba(255,255,255,.6),0_0_18px_rgba(242,193,78,.5)]" : "text-[var(--on-dark-2)] hover:text-[var(--volt)]"}`}>
                <span className={active ? "-mt-4 drop-shadow-[0_4px_8px_rgba(0,0,0,.6)]" : "opacity-90"} aria-hidden>
                  {"char" in n.icon ? <Portrait id={n.icon.char} size={active ? 40 : 32} /> : <MonsterFigure id={n.icon.monster} size={active ? 42 : 34} />}
                </span>
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
