/**
 * RPG風ステータスボード: パーティ（ハル・リコ・キコ）、レベルとEXP、冒険の進みぐあい、コイン・連続日数、相棒からのメッセージ。
 */
import { Portrait } from "@/components/characters/CharacterArt";
import { CoinBadge } from "@/components/common/CoinBadge";
import { CHARACTERS, partyLevel } from "@/lib/game/characters";
import type { CompanionLine } from "@/lib/game/companion";
import { CompanionBubble } from "./CompanionBubble";

export interface StatusBoardProps {
  playerName: string;
  coins: number;
  streakDays: number;
  lessonsCleared: number;
  totalLessons: number;
  line: CompanionLine;
  /** 追加の小さな数値（ダッシュボードで総合習得率などを出す） */
  extra?: { label: string; value: string }[];
}

export function Gauge({ label, value, max, color, right }: { label: string; value: number; max: number; color: string; right?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px] font-black text-[var(--on-dark-2)]">
        <span className="font-title">{label}</span>
        <span className="tabular-nums text-[var(--on-dark)]">{right ?? `${value} / ${max}`}</span>
      </div>
      <div className="rpg-gauge" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <span style={{ width: `${pct}%`, ["--gauge" as string]: color }} />
      </div>
    </div>
  );
}

export function StatusBoard({ playerName, coins, streakDays, lessonsCleared, totalLessons, line, extra }: StatusBoardProps) {
  const lv = partyLevel(lessonsCleared);
  return (
    <section className="rpg-wood p-3" aria-label="ステータスボード">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Portrait id="haru" size={64} ring={CHARACTERS.haru.color} />
          <div>
            <p className="font-title whitespace-nowrap text-[11px] text-[var(--volt)]">Lv.{lv.level} {CHARACTERS.haru.title}</p>
            <p className="text-xl font-black leading-tight">{playerName}</p>
            <div className="mt-1 flex -space-x-2">
              <Portrait id="riko" size={30} ring={CHARACTERS.riko.color} className="drop-shadow" />
              <Portrait id="kiko" size={30} ring={CHARACTERS.kiko.color} className="drop-shadow" />
              <Portrait id="birimo" size={30} ring={CHARACTERS.birimo.color} className="drop-shadow" />
            </div>
          </div>
        </div>
        <CoinBadge coins={coins} streak={streakDays} />
      </div>

      <div className="mt-3 grid gap-2">
        <Gauge label="EXP（つぎのレベルまで）" value={lv.exp} max={lv.expToNext} color="linear-gradient(90deg,#4cc9f0,#9b6bff)" />
        <Gauge label="ぼうけんの進みぐあい" value={lessonsCleared} max={totalLessons} color="linear-gradient(90deg,#5fe39a,#e8b63a)" right={`${lessonsCleared} / ${totalLessons} ステージ`} />
      </div>

      {extra && extra.length > 0 && (
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {extra.map((e) => (
            <div key={e.label} className="rounded-xl border-2 border-[var(--gold)]/60 bg-black/25 px-2 py-1.5 text-center">
              <dt className="text-[10px] font-bold text-[var(--on-dark-2)]">{e.label}</dt>
              <dd className="font-title text-lg text-[var(--volt)] tabular-nums">{e.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <CompanionBubble line={line} className="mt-3" size={64} />
    </section>
  );
}
