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
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t-4 border-[var(--gold)] bg-gradient-to-b from-[#5a3d22] to-[#3a2614] shadow-[0_-6px_18px_rgba(0,0,0,.45)]">
      <ul className="mx-auto grid max-w-3xl grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map((n) => {
          const active = path.startsWith(n.href);
          return (
            <li key={n.href} className="p-1">
              <Link href={n.href} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center rounded-xl py-1 text-[11px] font-black transition ${active ? "bg-gradient-to-b from-[#fff1a6] to-[var(--gold)] text-[#3b2a00] shadow-[inset_0_-3px_0_rgba(0,0,0,.25)]" : "text-[var(--on-dark-2)] hover:text-[var(--volt)]"}`}>
                <span className={active ? "-mt-4 drop-shadow-[0_3px_0_rgba(0,0,0,.35)]" : ""} aria-hidden>
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
