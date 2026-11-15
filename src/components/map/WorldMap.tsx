"use client";
/**
 * RPG風ぼうけんマップ。ジャングル → 古代遺跡 の上を土の道がくねくね進み、
 * ステージ（石のメダル=レッスン / 宝石=翌日テスト / 宝箱=まとめ / 神殿=ボス）が並ぶ。
 * 現在地にはハルたちパーティと相棒ビリモが立つ。ノードの状態は domain/progression.ts が決める。
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { StageNode } from "@/lib/domain/progression";
import { BirimoArt, CharacterArt } from "@/components/characters/CharacterArt";
import type { CharacterId } from "@/lib/game/characters";

const WORLD_THEMES: Record<number, { name: string; top: string; bottom: string; decor: string[] }> = {
  1: { name: "はじまりのジャングル", top: "#2f7a45", bottom: "#1d5232", decor: ["🌴", "🌿", "🍄", "🌺", "🪨", "🗿", "🦜", "🌳"] },
  2: { name: "フォニックス火山", top: "#8a4b2a", bottom: "#4a2614", decor: ["🌋", "🪨", "🔥", "🦎", "💎"] },
  3: { name: "グラマーの海の遺跡", top: "#2a6f8a", bottom: "#163e52", decor: ["🏝️", "🐚", "🐠", "🏛️", "🌊"] },
  4: { name: "スピーキング天空城", top: "#6b5aa8", bottom: "#352a66", decor: ["☁️", "🏯", "🌈", "⭐", "🪽"] },
};

const W = 360;
const STEP = 92;
const TOP = 120;

const pos = (i: number) => ({ x: W / 2 + Math.sin(i * 0.85) * 105, y: TOP + i * STEP });

function statusColors(n: StageNode) {
  switch (n.status) {
    case "CLEARED": return { fill: "url(#gem-clear)", ring: "#e8b63a", text: "#fff" };
    case "AVAILABLE": return { fill: n.type === "BOSS" ? "url(#gem-boss)" : "url(#gem-open)", ring: "#fff1a6", text: "#fff" };
    case "WAIT_TOMORROW": return { fill: "url(#gem-night)", ring: "#c9b8ff", text: "#fff" };
    default: return { fill: "url(#gem-stone)", ring: "#8b7d62", text: "#e9e2cf" };
  }
}

function Node({ n }: { n: StageNode }) {
  const c = statusColors(n);
  switch (n.type) {
    case "LESSON":
      return (
        <g>
          <circle r={31} fill="#2b1b0c" opacity={0.35} cy={5} />
          <circle r={30} fill={c.ring} stroke="#5c4310" strokeWidth={2.5} />
          <circle r={23} fill={c.fill} stroke="rgba(0,0,0,.35)" strokeWidth={2} />
          <path d="M-14 -10 Q0 -22 14 -10" stroke="rgba(255,255,255,.45)" strokeWidth={3} fill="none" strokeLinecap="round" />
          <text y={7} textAnchor="middle" fontSize={20} fontWeight={900} fill={c.text} className="font-pixel" style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.45)", strokeWidth: 3 }}>{n.lessonNo}</text>
        </g>
      );
    case "CHECK":
      return (
        <g>
          <rect x={-13} y={-13} width={26} height={26} rx={4} transform="rotate(45)" fill={c.fill} stroke={c.ring} strokeWidth={3} />
          <text y={5} textAnchor="middle" fontSize={13} fontWeight={900} fill="#fff">✓</text>
        </g>
      );
    case "MINI":
      return (
        <g>
          <ellipse cy={18} rx={26} ry={6} fill="#2b1b0c" opacity={0.35} />
          <rect x={-22} y={-6} width={44} height={24} rx={4} fill={n.status === "LOCKED" ? "#8b7d62" : "#a0522d"} stroke="#5c3010" strokeWidth={2.5} />
          <path d="M-22 -6 Q0 -26 22 -6 Z" fill={n.status === "LOCKED" ? "#9c8e72" : "#c46a35"} stroke="#5c3010" strokeWidth={2.5} />
          <rect x={-22} y={-2} width={44} height={5} fill={c.ring} />
          <rect x={-5} y={-4} width={10} height={12} rx={2} fill={c.ring} stroke="#5c4310" strokeWidth={1.5} />
          {n.status !== "LOCKED" && <text x={18} y={-16} fontSize={14} className="spark">✨</text>}
        </g>
      );
    case "BOSS":
      return (
        <g>
          {n.status === "AVAILABLE" && <circle r={46} fill="#e5484d" opacity={0.35} className="spark" />}
          <ellipse cy={30} rx={40} ry={8} fill="#2b1b0c" opacity={0.4} />
          <path d="M-36 30 L-36 -8 L0 -34 L36 -8 L36 30 Z" fill={n.status === "LOCKED" ? "#7d725c" : "#b69a6a"} stroke="#4a3a24" strokeWidth={3} />
          {[-24, -8, 8, 24].map((x) => <rect key={x} x={x - 4} y={-4} width={8} height={30} fill="rgba(0,0,0,.18)" />)}
          <path d="M-12 30 L-12 8 Q0 -4 12 8 L12 30 Z" fill="#2b1b0c" />
          <circle cy={-14} r={7} fill={n.status === "LOCKED" ? "#5a5246" : "#e5484d"} stroke="#ffd23f" strokeWidth={2} />
          <text y={52} textAnchor="middle" fontSize={11} fontWeight={900} fill="#ffd23f" className="font-pixel" style={{ paintOrder: "stroke", stroke: "#2b1b0c", strokeWidth: 3 }}>BOSS</text>
        </g>
      );
  }
}

/** マップ上のキャラクターピン（丸メダル） */
function Pin({ id, x, y, size }: { id: CharacterId; x: number; y: number; size: number }) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 100 100" overflow="visible">
      <circle cx={50} cy={50} r={48} fill="#e8b63a" stroke="#5c4310" strokeWidth={4} />
      <clipPath id={`map-clip-${id}`}><circle cx={50} cy={50} r={43} /></clipPath>
      <circle cx={50} cy={50} r={43} fill="#fff8dc" />
      <g clipPath={`url(#map-clip-${id})`}><CharacterArt id={id} /></g>
    </svg>
  );
}

export function WorldMap({ nodes }: { nodes: StageNode[] }) {
  const router = useRouter();
  const currentRef = useRef<SVGGElement>(null);
  const height = TOP + 80 + nodes.length * STEP;

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [nodes]);

  const pts = nodes.map((_, i) => pos(i));
  const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `Q${(pts[i - 1].x + p.x) / 2 + (i % 2 ? 30 : -30)},${(pts[i - 1].y + p.y) / 2} ${p.x},${p.y}`)).join(" ");

  const open = (n: StageNode) => {
    if (n.status === "LOCKED") return;
    if (n.status === "WAIT_TOMORROW") return alert("このテストは あした うけられるよ！今日はよくがんばったね 🌙");
    router.push(n.type === "LESSON" ? `/lesson/${n.lessonNo}` : `/test/${n.assessmentId}`);
  };

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="list" aria-label="ぼうけんマップ">
      <defs>
        <radialGradient id="gem-clear" cx="35%" cy="30%"><stop offset="0%" stopColor="#9dffc5" /><stop offset="100%" stopColor="#1f9d5a" /></radialGradient>
        <radialGradient id="gem-open" cx="35%" cy="30%"><stop offset="0%" stopColor="#bdf3ff" /><stop offset="100%" stopColor="#1f7fa8" /></radialGradient>
        <radialGradient id="gem-boss" cx="35%" cy="30%"><stop offset="0%" stopColor="#ffb3b5" /><stop offset="100%" stopColor="#b42328" /></radialGradient>
        <radialGradient id="gem-night" cx="35%" cy="30%"><stop offset="0%" stopColor="#d9ccff" /><stop offset="100%" stopColor="#5a3fb0" /></radialGradient>
        <radialGradient id="gem-stone" cx="35%" cy="30%"><stop offset="0%" stopColor="#b9ab8a" /><stop offset="100%" stopColor="#6e624c" /></radialGradient>
        <pattern id="leaf-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.4" fill="rgba(255,255,255,.08)" />
          <circle cx="12" cy="11" r="1" fill="rgba(0,0,0,.12)" />
        </pattern>
      </defs>

      {/* ワールドごとの地形 */}
      {[...new Set(nodes.map((n) => n.world))].map((w) => {
        const idx = nodes.map((n, i) => (n.world === w ? i : -1)).filter((i) => i >= 0);
        const y0 = pos(idx[0]).y - 100;
        const y1 = pos(idx[idx.length - 1]).y + 70;
        const t = WORLD_THEMES[w] ?? WORLD_THEMES[1];
        return (
          <g key={w}>
            <linearGradient id={`world-${w}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.top} /><stop offset="100%" stopColor={t.bottom} />
            </linearGradient>
            <rect x={0} y={y0} width={W} height={y1 - y0} fill={`url(#world-${w})`} rx={22} />
            <rect x={0} y={y0} width={W} height={y1 - y0} fill="url(#leaf-dots)" rx={22} />
            {/* ワールド名の看板 */}
            <g transform={`translate(${W / 2} ${y0 + 34})`}>
              <rect x={-120} y={-18} width={240} height={34} rx={8} fill="#6b4a2b" stroke="#e8b63a" strokeWidth={3} />
              <text y={5} textAnchor="middle" fontSize={15} fill="#ffd23f" className="font-pixel" style={{ paintOrder: "stroke", stroke: "#2b1b0c", strokeWidth: 3 }}>WORLD {w}・{t.name}</text>
            </g>
            {/* かざり（道の反対側に置く） */}
            {idx.map((i) => {
              const p = pos(i);
              const side = p.x > W / 2 ? -1 : 1;
              const x = Math.max(24, Math.min(W - 24, W / 2 + side * (70 + ((i * 37) % 60))));
              return <text key={i} x={x} y={p.y + ((i * 23) % 30) - 10} fontSize={22 + ((i * 7) % 10)} textAnchor="middle" opacity={0.9}>{t.decor[i % t.decor.length]}</text>;
            })}
          </g>
        );
      })}

      {/* 土の道 */}
      <path d={path} fill="none" stroke="#5c3d1e" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />
      <path d={path} fill="none" stroke="var(--path)" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#fff6d6" strokeOpacity={0.55} strokeWidth={3} strokeDasharray="2 12" strokeLinecap="round" />

      {nodes.map((n, i) => {
        const p = pos(i);
        const isCurrent = n.status === "AVAILABLE" || n.status === "WAIT_TOMORROW";
        return (
          <g
            key={n.key}
            ref={isCurrent ? currentRef : undefined}
            role="listitem"
            aria-label={`${n.type === "LESSON" ? `レッスン${n.lessonNo}` : n.assessmentId} ${n.status}`}
            transform={`translate(${p.x} ${p.y})`}
            onClick={() => open(n)}
            className={n.status === "LOCKED" ? "cursor-not-allowed" : "cursor-pointer"}
          >
            <circle r={40} fill="transparent" />
            <g className={isCurrent ? "glow" : ""}><Node n={n} /></g>
            {n.status === "LOCKED" && n.type !== "BOSS" && <text x={18} y={-16} fontSize={13}>🔒</text>}
            {n.status === "WAIT_TOMORROW" && <text x={20} y={-18} fontSize={16}>🌙</text>}
          </g>
        );
      })}

      {/* 現在地のパーティ */}
      {(() => {
        const i = nodes.findIndex((n) => n.status === "AVAILABLE" || n.status === "WAIT_TOMORROW");
        if (i < 0) return null;
        const p = pos(i);
        const left = p.x > W / 2;
        const bx = left ? p.x - 118 : p.x + 40;
        return (
          <g className="bob" pointerEvents="none">
            <Pin id="haru" x={bx + 22} y={p.y - 58} size={44} />
            <Pin id="riko" x={bx} y={p.y - 22} size={32} />
            <Pin id="kiko" x={bx + 52} y={p.y - 20} size={30} />
            <svg x={left ? p.x - 52 : p.x + 4} y={p.y - 86} width={46} height={46} viewBox="0 0 100 100" overflow="visible">
              <BirimoArt mood={nodes[i].status === "WAIT_TOMORROW" ? "sleepy" : "excited"} />
            </svg>
            <g transform={`translate(${left ? p.x - 30 : p.x + 26} ${p.y - 94})`}>
              <rect x={-24} y={-14} width={48} height={20} rx={10} fill="#fffdf3" stroke="#2b2216" strokeWidth={2} />
              <text y={1} textAnchor="middle" fontSize={11} fontWeight={900} fill="#2b2216">ここ！</text>
            </g>
          </g>
        );
      })()}
    </svg>
  );
}
