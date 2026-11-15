"use client";
/**
 * ポケモン風ステージマップ。くねくね道に沿ってノード（レッスン / 翌日テスト / まとめ / ボス）が並び、
 * 現在地にアバターが立つ。ノードの状態は API（domain/progression.ts）が決める。
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { StageNode } from "@/lib/domain/progression";

const WORLD_THEMES: Record<number, { name: string; emoji: string; bg: string }> = {
  1: { name: "はじまりの森", emoji: "🌳", bg: "var(--grass)" },
  2: { name: "フォニックス火山", emoji: "🌋", bg: "#f6c9a8" },
  3: { name: "グラマー海", emoji: "🌊", bg: "#a8d8f6" },
  4: { name: "スピーキング城", emoji: "🏯", bg: "#e2c8f6" },
};

const W = 360;
const STEP = 86;

function pos(i: number) {
  return { x: W / 2 + Math.sin(i * 0.9) * 110, y: 110 + i * STEP };
}

const ICON: Record<StageNode["type"], string> = { LESSON: "", CHECK: "✓", MINI: "⭐", BOSS: "🏰" };
const RADIUS: Record<StageNode["type"], number> = { LESSON: 28, CHECK: 16, MINI: 24, BOSS: 36 };

function fill(n: StageNode) {
  if (n.status === "CLEARED") return "var(--ok)";
  if (n.status === "AVAILABLE") return n.type === "BOSS" ? "var(--ng)" : "var(--accent)";
  if (n.status === "WAIT_TOMORROW") return "var(--coin)";
  return "var(--locked)";
}

export function WorldMap({ nodes, avatar = "🧒" }: { nodes: StageNode[]; avatar?: string }) {
  const router = useRouter();
  const currentRef = useRef<SVGGElement>(null);
  const height = 180 + nodes.length * STEP;

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [nodes]);

  const path = nodes.map((_, i) => pos(i)).map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");

  const open = (n: StageNode) => {
    if (n.status === "LOCKED") return;
    if (n.status === "WAIT_TOMORROW") return alert("このテストは あした うけられるよ！今日はよくがんばったね 🌙");
    router.push(n.type === "LESSON" ? `/lesson/${n.lessonNo}` : `/test/${n.assessmentId}`);
  };

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="list" aria-label="ステージマップ">
      {/* ワールドごとの背景帯 */}
      {[...new Set(nodes.map((n) => n.world))].map((w) => {
        const idx = nodes.map((n, i) => (n.world === w ? i : -1)).filter((i) => i >= 0);
        const y0 = pos(idx[0]).y - 90;
        const y1 = pos(idx[idx.length - 1]).y + 50;
        const t = WORLD_THEMES[w] ?? WORLD_THEMES[1];
        return (
          <g key={w}>
            <rect x={0} y={y0} width={W} height={y1 - y0} fill={t.bg} rx={24} opacity={0.6} />
            <text x={16} y={y0 + 28} fontSize={16} fontWeight={900} fill="var(--ink)">{t.emoji} ワールド{w}：{t.name}</text>
          </g>
        );
      })}
      <path d={path} fill="none" stroke="var(--path)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" />

      {nodes.map((n, i) => {
        const p = pos(i);
        const r = RADIUS[n.type];
        const isCurrent = n.status === "AVAILABLE" || n.status === "WAIT_TOMORROW";
        return (
          <g
            key={n.key}
            ref={isCurrent ? currentRef : undefined}
            role="listitem"
            aria-label={`${n.type === "LESSON" ? `レッスン${n.lessonNo}` : n.assessmentId} ${n.status}`}
            onClick={() => open(n)}
            className={n.status === "LOCKED" ? "cursor-not-allowed" : "cursor-pointer"}
          >
            {/* タップ判定はマークより大きく */}
            <circle cx={p.x} cy={p.y} r={r + 10} fill="transparent" />
            <circle cx={p.x} cy={p.y + 4} r={r} fill="rgba(0,0,0,.15)" />
            <circle cx={p.x} cy={p.y} r={r} fill={fill(n)} stroke="#fff" strokeWidth={3} />
            <text x={p.x} y={p.y + (n.type === "LESSON" ? 6 : 7)} textAnchor="middle" fontSize={n.type === "LESSON" ? 18 : r} fontWeight={900} fill="#fff">
              {n.type === "LESSON" ? n.lessonNo : ICON[n.type]}
            </text>
            {n.status === "LOCKED" && <text x={p.x + r - 6} y={p.y - r + 10} fontSize={14}>🔒</text>}
            {isCurrent && (
              <text x={p.x} y={p.y - r - 8} textAnchor="middle" fontSize={34} className="bob">{avatar}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
