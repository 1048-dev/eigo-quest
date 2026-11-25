"use client";
/**
 * 力だめしの 結果（保護者向けの 見かた）: 推定 CEFR バンド・英検の めやす・技能ごとの 点数・前回からの のび。
 * 子どもの 結果画面と 保護者ページの 両方で 使う。
 */
import { Gauge } from "@/components/game/StatusBoard";
import { BAND_CAN_DO_JA, BAND_EIKEN_JA, formatDayJa, type Band } from "@/lib/yearly/labels";
import type { SkillScores, YearlyGrowth } from "@/lib/yearly/types";

export const SKILL_JA: Record<keyof SkillScores, { label: string; icon: string; color: string }> = {
  listening: { label: "聞く", icon: "👂", color: "linear-gradient(90deg,#4cc9f0,#7be0ff)" },
  reading: { label: "読む", icon: "📖", color: "linear-gradient(90deg,#5fe39a,#b8f5a0)" },
  speaking: { label: "話す", icon: "🗣️", color: "linear-gradient(90deg,#ff9f43,#ffd83a)" },
  writing: { label: "書く", icon: "✏️", color: "linear-gradient(90deg,#c77dff,#f0a6ff)" },
};
const SKILL_KEYS = Object.keys(SKILL_JA) as (keyof SkillScores)[];

export interface YearlyResultView {
  stage: number;
  takenOn: string;
  scores: SkillScores;
  total: number;
  band: string;
  scaled: SkillScores & { total: number };
  gradedBy?: string;
}

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `${n}` : "±0");

export function YearlyResultCard({ result, growth, nextOn, heading = "力だめしの 結果" }: { result: YearlyResultView; growth?: YearlyGrowth | null; nextOn?: string | null; heading?: string }) {
  const band = result.band as Band;
  return (
    <section className="space-y-3 rounded-xl border border-[var(--gold)]/50 bg-black/25 p-3" aria-label={heading}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-[var(--ink-2)]">{heading}（ステージ{result.stage}・{formatDayJa(result.takenOn)}）</p>
          <p className="mt-1 font-black">
            推定レベル <span className="font-title text-2xl text-[var(--volt)]">{result.band}</span>
            <span className="ml-2 text-xs text-[var(--ink-2)]">めやす：{BAND_EIKEN_JA[band] ?? "—"}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-bold text-[var(--ink-2)]">合計</p>
          <p className="font-title text-2xl tabular-nums">{result.total}<span className="text-xs">点</span></p>
        </div>
      </div>
      {BAND_CAN_DO_JA[band] && <p className="text-xs text-[var(--ink-2)]">このレベルの めやす：{BAND_CAN_DO_JA[band]}</p>}

      <div className="space-y-2">
        {SKILL_KEYS.map((k) => (
          <Gauge
            key={k}
            label={`${SKILL_JA[k].icon} ${SKILL_JA[k].label}`}
            value={result.scores[k]}
            max={100}
            color={SKILL_JA[k].color}
            right={`${result.scores[k]}点${growth ? `（${signed(growth.delta[k])}）` : ""}`}
          />
        ))}
      </div>

      {growth ? (
        <div className="rounded-lg bg-[var(--ok)]/10 p-2 text-xs">
          <p className="font-black">
            前回（{formatDayJa(growth.previousTakenOn)}・ステージ{growth.previousStage}・{growth.previousBand}）からの のび：
            ちから スコア {signed(growth.delta.total)}
            {growth.bandSteps > 0 && <span className="ml-1 text-[var(--ok)]">レベル {growth.bandSteps} 段 アップ！</span>}
          </p>
          <p className="mt-0.5 text-[var(--ink-2)]">（ ）の 数字は 技能ごとの ちから スコアの さ。ステージが ちがっても くらべられる 目もりです。</p>
        </div>
      ) : (
        <p className="text-xs text-[var(--ink-2)]">はじめての 力だめしです。来年の 結果と くらべて のびを 表示します。</p>
      )}
      <p className="text-[10px] leading-relaxed text-[var(--ink-2)]">
        ちから スコア {result.scaled.total}・{result.gradedBy === "ai" ? "話す・書くは AI が 採点" : "話す・書くは かんたんな 自動採点"}。
        推定レベルは このアプリの 力だめしからの めやすで、検定の 合格を 保証するものでは ありません。
        {nextOn ? ` つぎは ${formatDayJa(nextOn)} から 受けられます。` : ""}
      </p>
    </section>
  );
}
