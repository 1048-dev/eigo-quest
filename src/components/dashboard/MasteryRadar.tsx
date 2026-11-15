"use client";
/**
 * 習得率レーダーチャート（6軸・単一系列）。
 * 単一系列なので凡例なし（見出しが系列名）。各頂点にホバー/タップでツールチップ、数値は横の表でも読める。
 */
import { useState } from "react";

export interface Axis { key: string; label: string; value: number } // value: 0..100

const SIZE = 340;
const C = SIZE / 2;
const R = 100;

const point = (i: number, n: number, v: number) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return { x: C + Math.cos(a) * R * (v / 100), y: C + Math.sin(a) * R * (v / 100) };
};

export function MasteryRadar({ axes }: { axes: Axis[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const n = axes.length;
  const poly = axes.map((a, i) => point(i, n, a.value)).map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-sm" role="img" aria-label={axes.map((a) => `${a.label} ${a.value}%`).join("、")}>
        {/* 目盛り（控えめなグリッド） */}
        {[25, 50, 75, 100].map((g) => (
          <polygon key={g} points={axes.map((_, i) => point(i, n, g)).map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="var(--ink-2)" strokeOpacity={0.18} strokeWidth={1} />
        ))}
        {axes.map((_, i) => {
          const p = point(i, n, 100);
          return <line key={i} x1={C} y1={C} x2={p.x} y2={p.y} stroke="var(--ink-2)" strokeOpacity={0.18} />;
        })}
        <polygon points={poly} fill="var(--accent)" fillOpacity={0.22} stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" />
        {axes.map((a, i) => {
          const p = point(i, n, a.value);
          const lp = point(i, n, 124);
          return (
            <g key={a.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)}>
              <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
              <circle cx={p.x} cy={p.y} r={hover === i ? 6 : 4.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
              <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize={11} fontWeight={700} fill="var(--ink-2)">{a.label}</text>
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-lg bg-[var(--surface)] px-3 py-1 text-sm shadow">
          <span className="text-[var(--ink-2)]">{axes[hover].label}</span> <b className="text-[var(--ink)]">{axes[hover].value}%</b>
        </div>
      )}
    </div>
  );
}

/** 推移（総合習得率）。単一系列の折れ線 + ホバーでその日の値 */
export function TrendLine({ points }: { points: { date: string; value: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return <p className="text-sm text-[var(--ink-2)]">2日以上学習すると推移グラフが表示されます</p>;
  const W = 320, H = 120, pad = 24;
  const x = (i: number) => pad + (i * (W - pad * 2)) / (points.length - 1);
  const y = (v: number) => H - pad - (v / 100) * (H - pad * 2);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.value)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="総合習得率の推移"
      onMouseLeave={() => setHover(null)}
      onMouseMove={(e) => {
        const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
        const rel = ((e.clientX - r.left) / r.width) * W;
        setHover(Math.max(0, Math.min(points.length - 1, Math.round(((rel - pad) / (W - pad * 2)) * (points.length - 1)))));
      }}>
      <line x1={pad} x2={W - pad} y1={y(0)} y2={y(0)} stroke="var(--ink-2)" strokeOpacity={0.3} />
      <path d={d} fill="none" stroke="var(--accent)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {hover != null && (
        <g>
          <line x1={x(hover)} x2={x(hover)} y1={pad / 2} y2={y(0)} stroke="var(--ink-2)" strokeOpacity={0.4} />
          <circle cx={x(hover)} cy={y(points[hover].value)} r={4.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />
          <text x={Math.min(x(hover) + 6, W - 90)} y={14} fontSize={11} fill="var(--ink)">{points[hover].date.slice(5)}  {points[hover].value}%</text>
        </g>
      )}
    </svg>
  );
}
