"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/map", label: "ぼうけん", icon: "🗺️" },
  { href: "/arena", label: "アリーナ", icon: "⚔️" },
  { href: "/gacha", label: "ずかん", icon: "🥚" },
  { href: "/ranking", label: "ランキング", icon: "🏆" },
  { href: "/dashboard", label: "ステータス", icon: "📜" },
];

/** 木の板＋金縁のRPGメニュー */
export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t-4 border-[var(--gold)] bg-gradient-to-b from-[#5a3d22] to-[#3a2614] shadow-[0_-6px_18px_rgba(0,0,0,.45)]">
      <ul className="mx-auto grid max-w-3xl grid-cols-5 px-2 pb-[env(safe-area-inset-bottom)]">
        {NAV.map((n) => {
          const active = path?.startsWith(n.href);
          return (
            <li key={n.href} className="p-1">
              <Link href={n.href} aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center rounded-xl py-1.5 text-[11px] font-black transition ${active ? "bg-gradient-to-b from-[#fff1a6] to-[var(--gold)] text-[#3b2a00] shadow-[inset_0_-3px_0_rgba(0,0,0,.25)]" : "text-[var(--on-dark-2)] hover:text-[var(--volt)]"}`}>
                <span className={`text-2xl ${active ? "" : "drop-shadow-[0_2px_0_rgba(0,0,0,.5)]"}`} aria-hidden>{n.icon}</span>
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
