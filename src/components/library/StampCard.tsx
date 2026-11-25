"use client";
/**
 * としょかんの「きょうの ごほうび」カード。1日1回の スタンプ（＋ つながっていれば コイン）と、さいきん 7日の スタンプ。
 */
import { localDate } from "@/lib/domain/dates";
import { stampStreak, stampsThisMonth, type LocalLibrary } from "@/lib/library/localLibrary";

const WEEK = ["にち", "げつ", "か", "すい", "もく", "きん", "ど"];

export function StampCard({ local, rewardedToday, dailyCoins, offline, now = new Date() }: {
  local: LocalLibrary;
  rewardedToday: boolean;
  dailyCoins: number;
  offline: boolean;
  now?: Date;
}) {
  const stamps = new Set(local.stamps);
  const days = Array.from({ length: 7 }, (_, i) => new Date(now.getTime() - (6 - i) * 86_400_000));
  const streak = stampStreak(local, now);
  return (
    <div className="card rpg-rivets p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="font-title text-lg">📮 きょうの ごほうび</p>
        <p className="text-sm font-black">{rewardedToday ? "✅ もらったよ！" : offline ? "🔖 スタンプ" : `🪙+${dailyCoins} と スタンプ`}</p>
      </div>
      <p className="mt-1 text-xs text-[var(--ink-2)]">
        {rewardedToday ? "また あした きてね。きょうも たくさん よんで いいよ！" : "おはなしを 1つ よんで クイズに こたえるか、チャンツを さいごまで きくと もらえるよ（1日1かい）"}
      </p>
      <ul className="mt-3 grid grid-cols-7 gap-1 text-center" aria-label="さいきん 7日の スタンプ">
        {days.map((d) => {
          const key = localDate(d);
          const has = stamps.has(key);
          return (
            <li key={key} className={`rounded-lg py-1 text-xs font-bold ${has ? "bg-[#fff4c2]" : "bg-black/5"}`}>
              <span className="block text-xl" aria-hidden>{has ? "🌟" : "・"}</span>
              <span className="sr-only">{has ? "スタンプ あり" : "スタンプ なし"}</span>
              {WEEK[d.getDay()]}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs font-bold text-[var(--ink-2)]">こんげつ 🌟×{stampsThisMonth(local, now)}{streak >= 2 ? `　${streak}日 れんぞく！` : ""}</p>
    </div>
  );
}
