import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "Eigo Quest", description: "毎日30分のえいごぼうけん" };

const NAV = [
  { href: "/map", label: "マップ", icon: "🗺️" },
  { href: "/arena", label: "アリーナ", icon: "⚔️" },
  { href: "/gacha", label: "ずかん", icon: "🥚" },
  { href: "/ranking", label: "ランキング", icon: "🏆" },
  { href: "/dashboard", label: "しゅうとく", icon: "📈" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-dvh pb-20">
        <main className="mx-auto max-w-3xl px-4 pt-4">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-[var(--surface)]">
          <ul className="mx-auto grid max-w-3xl grid-cols-5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="flex flex-col items-center py-2 text-xs font-bold text-[var(--ink-2)]">
                  <span className="text-2xl" aria-hidden>{n.icon}</span>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </body>
    </html>
  );
}
