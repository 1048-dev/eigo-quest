"use client";
import { useEffect, useState } from "react";
import { MasteryRadar, TrendLine } from "@/components/dashboard/MasteryRadar";
import { StatusBoard } from "@/components/game/StatusBoard";
import { SKILL_LABELS_JA } from "@/lib/domain/mastery";
import { SKILLS, type LearningItemDef, type MasteryScores, type Skill } from "@/lib/domain/types";
import { companionLine } from "@/lib/game/companion";

interface Dashboard {
  scores: MasteryScores; overall: number; coverage: number; lessonsCompleted: number;
  weakest: LearningItemDef[]; history: { date: string; overall: number }[];
}
interface MapLite { user: { nickname: string; coins: number; streakDays: number } | null; nodes: { type: string }[] }

const SHORT: Record<Skill, string> = { SCHOOL_TEST: "学校テスト", PHONICS: "フォニックス", LISTENING: "リスニング", SPEAKING: "発音", VOCABULARY: "語彙", WRITING: "筆記" };
const SKILL_ICON: Record<Skill, string> = { SCHOOL_TEST: "🏫", PHONICS: "🔤", LISTENING: "👂", SPEAKING: "🎤", VOCABULARY: "📚", WRITING: "✏️" };

export default function DashboardPage() {
  const [d, setD] = useState<Dashboard | null>(null);
  const [m, setM] = useState<MapLite | null>(null);
  useEffect(() => {
    const load = () => fetch("/api/dashboard").then((r) => r.json()).then(setD);
    load();
    fetch("/api/map").then((r) => r.json()).then(setM);
    const id = setInterval(load, 30_000); // 学習中もリアルタイムに更新（忘却で少しずつ下がるのも見える）
    return () => clearInterval(id);
  }, []);
  if (!d || !m) return <p className="rpg-title p-8 text-center text-xl">ステータスを よみこみちゅう…</p>;

  const weakestSkill = d.lessonsCompleted > 0 ? [...SKILLS].sort((a, b) => d.scores[a] - d.scores[b])[0] : null;
  const name = m.user?.nickname ?? "ハル";
  const line = companionLine({ playerName: name, streakDays: m.user?.streakDays ?? 0, coins: m.user?.coins ?? 0, lessonsCleared: d.lessonsCompleted, weakestSkill });

  return (
    <div className="space-y-4">
      <h1 className="rpg-title text-center text-2xl">📜 ぼうけんのステータス</h1>

      <StatusBoard playerName={name} coins={m.user?.coins ?? 0} streakDays={m.user?.streakDays ?? 0}
        lessonsCleared={d.lessonsCompleted} totalLessons={m.nodes.filter((n) => n.type === "LESSON").length} line={line}
        extra={[
          { label: "総合習得率", value: `${d.overall}%` },
          { label: "学校テスト対応度", value: `${d.scores.SCHOOL_TEST}%` },
          { label: "カリキュラム進捗", value: `${d.coverage}%` },
        ]} />

      <section className="card rpg-rivets p-4">
        <h2 className="font-pixel text-center text-lg text-[var(--gold-dark)]">6つのちから</h2>
        <p className="text-center text-xs text-[var(--ink-2)]">いま思い出せる度合い（わすれると少しずつ下がるよ）</p>
        <MasteryRadar axes={SKILLS.map((s) => ({ key: s, label: SHORT[s], value: d.scores[s] }))} />
        {/* 表ビュー（色に頼らず数値で読める） */}
        <table className="mt-2 w-full text-sm">
          <tbody>
            {SKILLS.map((s) => (
              <tr key={s} className="border-t-2 border-dashed border-[var(--parchment-edge)]">
                <th className="py-2 text-left font-black"><span aria-hidden className="mr-1">{SKILL_ICON[s]}</span>{SKILL_LABELS_JA[s]}</th>
                <td className="w-2/5 py-2">
                  <div className="rpg-gauge"><span style={{ width: `${d.scores[s]}%`, ["--gauge" as string]: s === weakestSkill ? "var(--berry)" : "var(--accent)" }} /></div>
                </td>
                <td className="w-14 py-2 text-right font-black tabular-nums">{d.scores[s]}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card rpg-rivets p-4">
        <h2 className="font-pixel text-lg text-[var(--gold-dark)]">総合習得率のきろく</h2>
        <TrendLine points={d.history.map((h) => ({ date: h.date, value: h.overall }))} />
      </section>

      {d.weakest.length > 0 && (
        <section className="card rpg-rivets p-4">
          <h2 className="font-pixel text-lg text-[var(--gold-dark)]">🧩 わすれかけモンスター</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {d.weakest.map((w) => <span key={w.id} className="rounded-full border-2 border-[var(--gold-dark)] bg-[var(--bg)] px-3 py-1 text-sm font-black">{w.emoji} {w.text}</span>)}
          </div>
          <p className="mt-2 text-xs text-[var(--ink-2)]">復習アリーナでは、これらが優先的に出てくるよ。たおしてコインをゲット！</p>
        </section>
      )}
    </div>
  );
}
