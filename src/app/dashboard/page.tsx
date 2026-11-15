"use client";
import { useEffect, useState } from "react";
import { MasteryRadar, TrendLine } from "@/components/dashboard/MasteryRadar";
import { SKILL_LABELS_JA } from "@/lib/domain/mastery";
import { SKILLS, type LearningItemDef, type MasteryScores } from "@/lib/domain/types";

interface Dashboard {
  scores: MasteryScores; overall: number; coverage: number; lessonsCompleted: number;
  weakest: LearningItemDef[]; history: { date: string; overall: number }[];
}

const SHORT: Record<string, string> = { SCHOOL_TEST: "学校テスト", PHONICS: "フォニックス", LISTENING: "リスニング", SPEAKING: "発音", VOCABULARY: "語彙", WRITING: "筆記" };

export default function DashboardPage() {
  const [d, setD] = useState<Dashboard | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/dashboard").then((r) => r.json()).then(setD);
    load();
    const id = setInterval(load, 30_000); // 学習中もリアルタイムに更新（忘却で少しずつ下がるのも見える）
    return () => clearInterval(id);
  }, []);
  if (!d) return <p className="p-8 text-center">よみこみちゅう…</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-black">📈 えいご しゅうとくりつ</h1>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="総合習得率" value={`${d.overall}%`} />
        <Stat label="学校テスト対応度" value={`${d.scores.SCHOOL_TEST}%`} />
        <Stat label="カリキュラム進捗" value={`${d.coverage}%`} sub={`${d.lessonsCompleted}レッスン`} />
      </div>

      <section className="card p-4">
        <h2 className="font-black">6つのちから（いま思い出せる度合い）</h2>
        <MasteryRadar axes={SKILLS.map((s) => ({ key: s, label: SHORT[s], value: d.scores[s] }))} />
        {/* 表ビュー（色に頼らず数値で読める） */}
        <table className="mt-2 w-full text-sm">
          <tbody>
            {SKILLS.map((s) => (
              <tr key={s} className="border-t border-black/5">
                <th className="py-2 text-left font-bold">{SKILL_LABELS_JA[s]}</th>
                <td className="w-1/2 py-2">
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--locked)]"><div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${d.scores[s]}%` }} /></div>
                </td>
                <td className="w-14 py-2 text-right font-black tabular-nums">{d.scores[s]}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card p-4">
        <h2 className="font-black">総合習得率のすいい</h2>
        <TrendLine points={d.history.map((h) => ({ date: h.date, value: h.overall }))} />
      </section>

      {d.weakest.length > 0 && (
        <section className="card p-4">
          <h2 className="font-black">🧩 わすれかけ・にがて</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {d.weakest.map((w) => <span key={w.id} className="rounded-full bg-[var(--bg)] px-3 py-1 text-sm font-bold">{w.emoji} {w.text}</span>)}
          </div>
          <p className="mt-2 text-xs text-[var(--ink-2)]">復習アリーナでは、これらが優先的に出題されます。</p>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-[11px] font-bold text-[var(--ink-2)]">{label}</p>
      <p className="text-2xl font-black tabular-nums">{value}</p>
      {sub && <p className="text-[11px] text-[var(--ink-2)]">{sub}</p>}
    </div>
  );
}
