"use client";
/**
 * おしらせパネル。/api/announcements が届かなくても、内蔵のおしらせ（content/announcements.json）を表示する。
 */
import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/client";
import { AnnouncementsResponseSchema, type Announcement } from "@/lib/api/contracts";
import { offlineAnnouncements } from "@/lib/offline";

/** 札の 色（白い 文字との コントラスト 4.5 以上。run10 axe color-contrast。tests/a11y-contrast.test.ts） */
export const CATEGORY: Record<Announcement["category"], { label: string; color: string }> = {
  update: { label: "アップデート", color: "#1f7a70" },
  event: { label: "イベント", color: "#b4500f" },
  tips: { label: "コツ", color: "#7442d8" },
  parents: { label: "保護者の方へ", color: "#866a0e" },
  maintenance: { label: "メンテナンス", color: "#5f646c" },
};

export function AnnouncementsPanel({ limit = 3 }: { limit?: number }) {
  const [list, setList] = useState<Announcement[]>(() => offlineAnnouncements().announcements);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiGet("/api/announcements", AnnouncementsResponseSchema).then((r) => {
      if (alive && r.ok && r.data.announcements.length > 0) setList(r.data.announcements);
    });
    return () => { alive = false; };
  }, []);

  const items = (list ?? []).slice(0, limit);
  if (items.length === 0) return null;
  return (
    <section className="card rpg-rivets p-4" aria-labelledby="ann-h">
      <h2 id="ann-h" className="font-title text-sm text-[var(--gold-dark)]">📜 おしらせ</h2>
      <ul className="mt-2 divide-y divide-dashed divide-[var(--parchment-edge)]">
        {items.map((a) => {
          const c = CATEGORY[a.category] ?? CATEGORY.update;
          const isOpen = open === a.id;
          return (
            <li key={a.id} className="py-2">
              <button className="flex w-full items-start gap-2 text-left" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : a.id)}>
                <span className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black text-white" style={{ background: c.color }}>{c.label}</span>
                <span className="flex-1 text-sm font-bold leading-snug">{a.pinned && "📌 "}{a.title}</span>
                <span className="shrink-0 text-[10px] text-[var(--ink-2)]">{a.date}</span>
              </button>
              {isOpen && <p className="mt-1.5 whitespace-pre-line pl-1 text-sm text-[var(--ink-2)]">{a.body}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
