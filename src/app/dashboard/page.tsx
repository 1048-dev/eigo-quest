"use client";
import { useEffect, useState } from "react";
import { MasteryRadar, TrendLine } from "@/components/dashboard/MasteryRadar";
import { StatusBoard } from "@/components/game/StatusBoard";
import { ErrorBanner } from "@/components/common/ErrorBanner";
import { HeroScene } from "@/components/scene/HeroScene";
import { PeekCharacter, PeekMonster } from "@/components/scene/Peek";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { Portrait } from "@/components/characters/CharacterArt";
import { apiGet } from "@/lib/api/client";
import { DashboardResponseSchema, DEFAULT_USER, type DashboardResponse } from "@/lib/api/contracts";
import { SKILL_LABELS_JA } from "@/lib/domain/mastery";
import { SKILLS, type Skill } from "@/lib/domain/types";
import { companionLine, OFFLINE_LINE } from "@/lib/game/companion";
import type { CharacterId } from "@/lib/game/characters";

const SHORT: Record<Skill, string> = { SCHOOL_TEST: "学校テスト", PHONICS: "フォニックス", LISTENING: "リスニング", SPEAKING: "発音", VOCABULARY: "語彙", WRITING: "筆記" };
/** 6つの力それぞれの「担当キャラ」 */
const SKILL_BUDDY: Record<Skill, CharacterId> = { SCHOOL_TEST: "haru", PHONICS: "riko", LISTENING: "birimo", SPEAKING: "haru", VOCABULARY: "kiko", WRITING: "kiko" };
const WEAK_MONSTERS = ["mon-019", "mon-080", "mon-089", "mon-070", "mon-014"];

export default function DashboardPage() {
  const [d, setD] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => apiGet("/api/dashboard", DashboardResponseSchema).then((r) => {
      if (!alive) return;
      // 再読み込みに失敗しても、前回の正しいデータは消さない
      setD((prev) => (r.ok || !prev ? r.data : prev));
      setError(r.error);
    });
    void load();
    const id = setInterval(load, 30_000); // 学習中もリアルタイムに更新（忘却で少しずつ下がるのも見える）
    return () => { alive = false; clearInterval(id); };
  }, []);

  if (!d) return <p className="rpg-title p-8 text-center text-xl">ステータスを よみこみちゅう…</p>;

  const user = d.user ?? DEFAULT_USER;
  const scores = d.scores;
  const weakest = d.weakest ?? [];
  const history = d.history ?? [];
  const weakestSkill = d.lessonsCompleted > 0 ? [...SKILLS].sort((a, b) => (scores[a] ?? 0) - (scores[b] ?? 0))[0] : null;
  const line = error ? OFFLINE_LINE : companionLine({ playerName: user.nickname, streakDays: user.streakDays, coins: user.coins, lessonsCleared: d.lessonsCompleted, weakestSkill });

  return (
    <div className="space-y-5">
      <HeroScene title="ぼうけんのステータス" subtitle="パーティの成長をチェック！" variant="dashboard" />

      <ErrorBanner message={error} />

      <StatusBoard playerName={user.nickname} coins={user.coins} streakDays={user.streakDays}
        lessonsCleared={d.lessonsCompleted} totalLessons={d.totalLessons} line={line}
        extra={[
          { label: "総合習得率", value: `${d.overall}%` },
          { label: "学校テスト対応度", value: `${scores.SCHOOL_TEST}%` },
          { label: "カリキュラム進捗", value: `${d.coverage}%` },
        ]} />

      <section className="card rpg-rivets relative mt-12 p-4">
        <PeekCharacter id="kiko" pose="wave" place="top-left" />
        <PeekMonster id="mon-055" place="top-right" />
        <h2 className="font-title text-center text-lg text-[var(--gold-dark)]">6つのちから</h2>
        <p className="text-center text-xs text-[var(--ink-2)]">いま思い出せる度合い（わすれると少しずつ下がるよ）</p>
        <MasteryRadar axes={SKILLS.map((s) => ({ key: s, label: SHORT[s], value: scores[s] ?? 0 }))} />
        {/* 表ビュー（色に頼らず数値で読める） */}
        <table className="mt-2 w-full text-sm">
          <tbody>
            {SKILLS.map((s) => (
              <tr key={s} className="border-t-2 border-dashed border-[var(--parchment-edge)]">
                <th className="py-2 text-left font-black">
                  <span className="mr-1 inline-block align-middle" aria-hidden><Portrait id={SKILL_BUDDY[s]} size={24} /></span>
                  {SKILL_LABELS_JA[s]}
                </th>
                <td className="w-2/5 py-2">
                  <div className="rpg-gauge"><span style={{ width: `${scores[s] ?? 0}%`, ["--gauge" as string]: s === weakestSkill ? "var(--berry)" : "var(--accent)" }} /></div>
                </td>
                <td className="w-14 py-2 text-right font-black tabular-nums">{scores[s] ?? 0}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card rpg-rivets relative mt-12 p-4">
        <PeekMonster id="mon-037" place="top-right" />
        <h2 className="font-title text-lg text-[var(--gold-dark)]">総合習得率のきろく</h2>
        <TrendLine points={history.map((h) => ({ date: h.date, value: h.overall }))} />
      </section>

      {weakest.length > 0 && (
        <section className="card rpg-rivets relative mt-12 p-4">
          <PeekCharacter id="haru" pose="point" place="top-right" />
          <h2 className="font-title text-lg text-[var(--gold-dark)]">わすれかけモンスター</h2>
          <ul className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {weakest.map((w, i) => (
              <li key={w.id} className="flex items-center gap-2 rounded-xl border-2 border-[var(--gold-dark)] bg-[var(--bg)] px-2 py-1">
                <MonsterFigure id={WEAK_MONSTERS[i % WEAK_MONSTERS.length]} size={36} letter={(w.text ?? "?").slice(0, 1).toUpperCase()} />
                <span className="text-sm font-black">{w.text || "？？？"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-[var(--ink-2)]">復習アリーナでは、これらが優先的に出てくるよ。たおしてコインをゲット！</p>
        </section>
      )}
    </div>
  );
}
