"use client";
/**
 * シネマティックなぼうけんマップ。
 * 夜のジャングルの古代遺跡を、金のルーンが光る石の参道がくねくね進む。
 * ステージ: レッスン＝金枠の宝玉 / 復習クエスト＝カットされた宝石 / まとめ＝金具の宝箱 / ボス＝神殿の門。
 * 道の両側には古代樹・レリーフの壁・シダと、ひそむモンスター。現在地にはスポットライトの中にパーティが立つ。
 * ノードの状態は domain/progression.ts が決め、API（/api/map）の契約どおりに受け取る。
 */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { MapResponse } from "@/lib/api/contracts";
import { Standing } from "@/components/characters/StandingArt";
import { MonsterArt } from "@/components/characters/MonsterArt";
import { BirimoArt } from "@/components/characters/CharacterArt";
import { AncientTree, At, Crystals, Fern, Fog, Motes, RuinRelief, TempleGate } from "@/components/scene/CinematicScenery";

type StageNode = MapResponse["nodes"][number];

const WORLD_THEMES: Record<number, { name: string; top: string; bottom: string; fog: string; monsters: string[]; glyphs: string[][] }> = {
  1: { name: "はじまりのジャングル遺跡", top: "#0e2a24", bottom: "#081814", fog: "#bfe6d6", monsters: ["mon-044", "mon-028", "mon-091", "mon-037", "mon-019", "mon-056", "mon-055"], glyphs: [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"]] },
  2: { name: "フォニックス火山の神殿", top: "#2e1408", bottom: "#140804", fog: "#ffcf9a", monsters: ["mon-031", "mon-091", "mon-080"], glyphs: [["cat"], ["pig"], ["dog"], ["bed"], ["bus"]] },
  3: { name: "グラマーの海底遺跡", top: "#0b2236", bottom: "#05101c", fog: "#a8e2ff", monsters: ["mon-037", "mon-089", "mon-056"], glyphs: [["sh"], ["ch"], ["th"], ["wh"], ["ck"]] },
  4: { name: "スピーキング天空城", top: "#1d1a3e", bottom: "#0c0a20", fog: "#d9ccff", monsters: ["mon-055", "mon-070"], glyphs: [["ABC"], ["st"], ["bl"], ["tr"], ["tw"]] },
  5: { name: "じかんの塔", top: "#2a1f0c", bottom: "#120c04", fog: "#ffe7a8", monsters: ["mon-080", "mon-089", "mon-031"], glyphs: [["-st"], ["-nd"], ["-s"], ["-ing"], ["7:00"]] },
  6: { name: "まなびの城", top: "#1a2a1c", bottom: "#0a140c", fog: "#c8f5c0", monsters: ["mon-055", "mon-037", "mon-091"], glyphs: [["a_e"], ["i_e"], ["o_e"], ["u_e"], ["abc"]] },
  7: { name: "ひかりの島", top: "#0c2a33", bottom: "#04141a", fog: "#fff2b0", monsters: ["mon-080", "mon-056", "mon-031"], glyphs: [["ai"], ["ee"], ["ea"], ["oa"], ["ow"]] },
  8: { name: "たびだちの道", top: "#2e1a0e", bottom: "#140a04", fog: "#ffd2a6", monsters: ["mon-037", "mon-070", "mon-089"], glyphs: [["oo"], ["ou"], ["ow"], ["oy"], ["igh"]] },
  9: { name: "そらの大陸", top: "#14234a", bottom: "#080f24", fog: "#cfe4ff", monsters: ["mon-056", "mon-091", "mon-055"], glyphs: [["ar"], ["or"], ["er"], ["ir"], ["air"]] },
};

const W = 360;
const STEP = 96;
const TOP = 130;

const pos = (i: number) => ({ x: W / 2 + Math.sin(i * 0.85) * 100, y: TOP + i * STEP });

const GEM: Record<StageNode["status"], string> = {
  CLEARED: "url(#gem-emerald)",
  AVAILABLE: "url(#gem-sapphire)",
  WAIT_TOMORROW: "url(#gem-amethyst)",
  LOCKED: "url(#gem-obsidian)",
};

function Node({ n }: { n: StageNode }) {
  const gem = n.type === "BOSS" && n.status === "AVAILABLE" ? "url(#gem-ruby)" : GEM[n.status];
  const lit = n.status !== "LOCKED";
  switch (n.type) {
    case "LESSON":
      return (
        <g>
          <ellipse cy={26} rx={28} ry={7} fill="url(#ao-floor)" />
          {lit && <circle r={40} fill="url(#g-magic)" opacity={n.status === "AVAILABLE" ? 0.75 : 0.3} className={n.status === "AVAILABLE" ? "pulse-glow" : undefined} />}
          <circle r={30} fill="url(#metal-gold)" />
          <circle r={27} fill="none" stroke="#2a1a03" strokeWidth={1.5} />
          <circle r={24} fill={gem} />
          <circle r={24} fill="url(#shade-sphere)" opacity={0.5} />
          <ellipse cx={-8} cy={-11} rx={9} ry={5} fill="url(#spec)" transform="rotate(-30 -8 -11)" />
          <text y={7} textAnchor="middle" fontSize={19} fontWeight={900} fill={lit ? "#fffbe6" : "#9a9a8a"} style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,.55)", strokeWidth: 3 }}>{n.lessonNo}</text>
        </g>
      );
    case "CHECK":
      return (
        <g>
          <ellipse cy={16} rx={14} ry={4} fill="url(#ao-floor)" />
          <path d="M0 -16 L14 -4 L8 14 L-8 14 L-14 -4 Z" fill={gem} stroke="url(#metal-gold)" strokeWidth={2.5} strokeLinejoin="round" />
          <path d="M0 -16 L4 -4 L-4 -4 Z M-14 -4 L-4 -4 L-8 14 Z" fill="#fff" opacity={0.3} />
          <text y={6} textAnchor="middle" fontSize={11} fontWeight={900} fill="#fff">✓</text>
        </g>
      );
    case "MINI":
      return (
        <g>
          <ellipse cy={20} rx={28} ry={6} fill="url(#ao-floor)" />
          {lit && <circle r={36} fill="url(#g-magic)" opacity={0.45} className="pulse-glow" />}
          <rect x={-22} y={-4} width={44} height={24} rx={3} fill={lit ? "#7a3a12" : "#3a2c22"} />
          <path d="M-22 -4 Q0 -26 22 -4 Z" fill={lit ? "#9a4e1c" : "#4a3a2c"} />
          <rect x={-22} y={-4} width={44} height={24} rx={3} fill="url(#shade-cyl)" />
          <path d="M-22 -4 Q0 -26 22 -4" fill="url(#shade-top)" />
          {[-14, 14].map((x) => <rect key={x} x={x - 2.5} y={-17} width={5} height={37} fill="url(#metal-gold)" />)}
          <rect x={-22} y={-1} width={44} height={4} fill="url(#metal-gold)" />
          <rect x={-5} y={-3} width={10} height={11} rx={2} fill="url(#metal-gold)" />
          <circle cy={2} r={1.6} fill="#2a1a03" />
        </g>
      );
    case "BOSS":
      return (
        <g>
          {n.status === "AVAILABLE" && <circle r={60} fill="#ff4f5a" opacity={0.28} filter="url(#f-glow-soft)" className="pulse-glow" />}
          <ellipse cy={30} rx={48} ry={9} fill="url(#ao-floor)" />
          <g transform="translate(0 30)" opacity={lit ? 1 : 0.55}><TempleGate s={0.42} glow={lit} /></g>
          <circle cy={-6} r={9} fill={gem} stroke="url(#metal-gold)" strokeWidth={2} />
          <text y={52} textAnchor="middle" fontSize={11} fontWeight={900} fill="#ffd96a" style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 3 }}>BOSS</text>
        </g>
      );
  }
}

export function WorldMap({ nodes }: { nodes: StageNode[] }) {
  const router = useRouter();
  const currentRef = useRef<SVGGElement>(null);
  const safeNodes = nodes ?? [];
  const height = TOP + 90 + safeNodes.length * STEP;

  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [safeNodes]);

  const pts = safeNodes.map((_, i) => pos(i));
  const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `Q${(pts[i - 1].x + p.x) / 2 + (i % 2 ? 30 : -30)},${(pts[i - 1].y + p.y) / 2} ${p.x},${p.y}`)).join(" ");

  const open = (n: StageNode) => {
    if (n.status === "LOCKED") return;
    if (n.status === "WAIT_TOMORROW") return alert("この復習クエストは あした ひらくよ！きょうは つぎのレッスンに すすめるよ 🌙");
    if (n.type === "LESSON") return router.push(`/lesson/${n.lessonNo}`);
    if (n.assessmentId) router.push(`/test/${encodeURIComponent(n.assessmentId)}`);
  };

  // 現在地 = domain/progression.ts の pickCurrent と同じ優先順（受けられる復習クエスト → 次のレッスン/ゲート）
  const firstIdx = (f: (n: StageNode) => boolean) => safeNodes.findIndex(f);
  const curIdx = [
    firstIdx((n) => n.type === "CHECK" && n.status === "AVAILABLE"),
    firstIdx((n) => n.type !== "CHECK" && n.status === "AVAILABLE"),
    firstIdx((n) => n.status === "WAIT_TOMORROW"),
  ].find((i) => i >= 0) ?? -1;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="list" aria-label="ぼうけんマップ">
      {/* ワールドごとの地形 */}
      {[...new Set(safeNodes.map((n) => n.world))].map((w) => {
        const idx = safeNodes.map((n, i) => (n.world === w ? i : -1)).filter((i) => i >= 0);
        if (idx.length === 0) return null;
        const y0 = pos(idx[0]).y - 110;
        const y1 = pos(idx[idx.length - 1]).y + 80;
        const t = WORLD_THEMES[w] ?? WORLD_THEMES[1];
        return (
          <g key={w}>
            <linearGradient id={`world-${w}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.top} /><stop offset="100%" stopColor={t.bottom} />
            </linearGradient>
            <rect x={0} y={y0} width={W} height={y1 - y0} fill={`url(#world-${w})`} />
            {/* 奥の古代樹（ぼかし）とレリーフ壁・霧を交互に */}
            {idx.map((i) => {
              const p = pos(i);
              const side = p.x > W / 2 ? -1 : 1;
              const x = W / 2 + side * (120 + ((i * 29) % 30));
              if (i % 4 === 0) return <At key={`t${i}`} x={x} y={p.y + 70} opacity={0.75}><AncientTree s={0.75} depth="far" seed={i} /></At>;
              if (i % 4 === 2) return <At key={`r${i}`} x={x} y={p.y + 50}><RuinRelief w={88} h={58} glyphs={t.glyphs[i % t.glyphs.length]} glow={i % 8 === 2} /></At>;
              // 道と同じ側の画面のふち: 手前の大きな古代樹（ぼかし）
              return <At key={`n${i}`} x={side < 0 ? W + 18 : -18} y={p.y + 120} opacity={0.85}><AncientTree s={0.7} depth="near" seed={i + 3} /></At>;
            })}
            {idx.filter((i) => i % 3 === 0).map((i) => <Fog key={`f${i}`} y={pos(i).y + 40} w={W} opacity={0.16} />)}
            {/* ワールド名のメタルプレート */}
            <g transform={`translate(${W / 2} ${y0 + 40})`}>
              <rect x={-132} y={-19} width={264} height={36} rx={10} fill="url(#metal-gold)" />
              <rect x={-129} y={-16} width={258} height={30} rx={8} fill="#08150f" opacity={0.92} />
              <text y={5} textAnchor="middle" fontSize={14} fontWeight={900} fill="#f2cf6a" letterSpacing={1}>WORLD {w}・{t.name}</text>
            </g>
          </g>
        );
      })}

      {/* 石の参道（影→石→金のルーンの光） */}
      <path d={path} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={34} strokeLinecap="round" strokeLinejoin="round" transform="translate(0 4)" />
      <path d={path} fill="none" stroke="#2f5a34" strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#6e5f45" strokeWidth={24} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke="#a8946c" strokeWidth={20} strokeLinejoin="round" strokeDasharray="18 3" />
      <path d={path} fill="none" stroke="#fff1c9" strokeOpacity={0.18} strokeWidth={6} strokeLinejoin="round" transform="translate(-2 -2)" />
      <path d={path} fill="none" stroke="#ffd96a" strokeOpacity={0.35} strokeWidth={3} strokeLinecap="round" filter="url(#f-bloom-gold)" />

      {/* 道ばたにひそむモンスターと手前のシダ */}
      <g filter="url(#f-rim)">
        {safeNodes.map((n, i) => {
          if (i % 3 !== 1) return null;
          const t = WORLD_THEMES[n.world] ?? WORLD_THEMES[1];
          const p = pos(i);
          const side = p.x > W / 2 ? -1 : 1;
          const x = Math.max(40, Math.min(W - 40, W / 2 + side * (86 + ((i * 37) % 40))));
          const s = 0.44 + ((i * 13) % 10) / 100;
          return (
            <g key={`m${i}`} transform={`translate(${x - 50 * s} ${p.y + 30 - 100 * s})`}>
              <g transform={`scale(${s})${side < 0 ? " translate(100 0) scale(-1 1)" : ""}`}><MonsterArt id={t.monsters[i % t.monsters.length]} flip={side < 0} /></g>
            </g>
          );
        })}
      </g>
      {safeNodes.map((_, i) => {
        if (i % 3 !== 2) return null;
        const p = pos(i);
        const side = p.x > W / 2 ? -1 : 1;
        const gems = ["sapphire", "amethyst", "emerald", "topaz"] as const;
        return <At key={`cr${i}`} x={Math.max(34, Math.min(W - 34, W / 2 + side * 72))} y={p.y + 44}><Crystals s={0.55} gem={gems[i % 4]} /></At>;
      })}
      {safeNodes.map((_, i) => {
        if (i % 5 !== 3) return null;
        const p = pos(i);
        const left = p.x > W / 2;
        return <At key={`fern${i}`} x={left ? 6 : W - 6} y={p.y + 60} opacity={0.9}><Fern s={0.55} flip={!left} /></At>;
      })}

      {/* ステージ */}
      {safeNodes.map((n, i) => {
        const p = pos(i);
        const isCurrent = i === curIdx;
        return (
          <g
            key={n.key}
            ref={isCurrent ? currentRef : undefined}
            role="listitem"
            aria-label={`${n.type === "LESSON" ? `レッスン${n.lessonNo}` : n.assessmentId ?? "テスト"} ${n.status}`}
            transform={`translate(${p.x} ${p.y})`}
            onClick={() => open(n)}
            className={n.status === "LOCKED" ? "cursor-not-allowed" : "cursor-pointer"}
          >
            <circle r={42} fill="transparent" />
            <Node n={n} />
            {n.status === "LOCKED" && n.type !== "BOSS" && <text x={18} y={-16} fontSize={12}>🔒</text>}
            {n.status === "WAIT_TOMORROW" && <text x={20} y={-18} fontSize={15}>🌙</text>}
          </g>
        );
      })}

      {/* 現在地: スポットライトの中に立つパーティ */}
      {curIdx >= 0 && (() => {
        const p = pos(curIdx);
        const left = p.x > W / 2;
        const bx = left ? p.x - 150 : p.x + 38;
        const sleepy = safeNodes[curIdx]?.status === "WAIT_TOMORROW";
        return (
          <g pointerEvents="none">
            <path d={`M${bx + 30} ${p.y - 170} L${bx + 70} ${p.y - 170} L${bx + 112} ${p.y + 30} L${bx - 12} ${p.y + 30} Z`} fill="#fff1c2" opacity={0.12} filter="url(#f-dof-2)" />
            <ellipse cx={bx + 50} cy={p.y + 28} rx={62} ry={9} fill="url(#g-magic)" opacity={0.5} />
            <g filter="url(#f-rim)">
              {([["riko", 0, 0.42], ["kiko", 66, 0.4], ["haru", 26, 0.5]] as const).map(([id, dx, s]) => (
                <g key={id} transform={`translate(${bx + dx} ${p.y + 30 - 170 * s})`}><g transform={`scale(${s})`}><Standing id={id} pose={id === "haru" ? "point" : "wave"} /></g></g>
              ))}
              <g transform={`translate(${left ? p.x - 54 : p.x + 8} ${p.y - 92}) scale(0.46)`}><g className="bob"><BirimoArt mood={sleepy ? "sleepy" : "excited"} /></g></g>
            </g>
            <g transform={`translate(${left ? p.x - 28 : p.x + 30} ${p.y - 100})`}>
              <rect x={-26} y={-14} width={52} height={20} rx={10} fill="#08150f" stroke="#e9b949" strokeWidth={1.5} />
              <text y={1} textAnchor="middle" fontSize={11} fontWeight={900} fill="#f2cf6a">{sleepy ? "また明日" : "ここ！"}</text>
            </g>
          </g>
        );
      })()}
      <Motes w={W} h={height} n={Math.min(60, 8 + safeNodes.length)} seed={5} />
    </svg>
  );
}
