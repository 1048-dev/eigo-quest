"use client";
/**
 * シネマティックなぼうけんマップ。
 * 夜のジャングルの古代遺跡を、金のルーンが光る石の参道がくねくね進む。
 * ステージ: レッスン＝金枠の宝玉 / 復習クエスト＝カットされた宝石 / まとめ＝金具の宝箱 / ボス＝神殿の門。
 * 道の両側には古代樹・レリーフの壁・シダと、ひそむモンスター。現在地にはスポットライトの中にパーティが立つ。
 * ノードの状態は domain/progression.ts が決め、API（/api/map）の契約どおりに受け取る。
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MapResponse } from "@/lib/api/contracts";
import { Standing } from "@/components/characters/StandingArt";
import { MonsterArt } from "@/components/characters/MonsterArt";
import { BirimoArt } from "@/components/characters/CharacterArt";
import { worldName } from "@/lib/game/worlds";
import { AncientTree, At, Crystals, Fern, Fog, Motes, RuinRelief, TempleGate } from "@/components/scene/CinematicScenery";

type StageNode = MapResponse["nodes"][number];

const WORLD_THEMES: Record<number, { top: string; bottom: string; fog: string; monsters: string[]; glyphs: string[][] }> = {
  1: { top: "#0e2a24", bottom: "#081814", fog: "#bfe6d6", monsters: ["mon-044", "mon-028", "mon-091", "mon-037", "mon-019", "mon-056", "mon-055"], glyphs: [["A", "B"], ["C", "D"], ["E", "F"], ["G", "H"]] },
  2: { top: "#2e1408", bottom: "#140804", fog: "#ffcf9a", monsters: ["mon-031", "mon-091", "mon-080"], glyphs: [["cat"], ["pig"], ["dog"], ["bed"], ["bus"]] },
  3: { top: "#0b2236", bottom: "#05101c", fog: "#a8e2ff", monsters: ["mon-037", "mon-089", "mon-056"], glyphs: [["sh"], ["ch"], ["th"], ["wh"], ["ck"]] },
  4: { top: "#1d1a3e", bottom: "#0c0a20", fog: "#d9ccff", monsters: ["mon-055", "mon-070"], glyphs: [["ABC"], ["st"], ["bl"], ["tr"], ["tw"]] },
  5: { top: "#2a1f0c", bottom: "#120c04", fog: "#ffe7a8", monsters: ["mon-080", "mon-089", "mon-031"], glyphs: [["-st"], ["-nd"], ["-s"], ["-ing"], ["7:00"]] },
  6: { top: "#1a2a1c", bottom: "#0a140c", fog: "#c8f5c0", monsters: ["mon-055", "mon-037", "mon-091"], glyphs: [["a_e"], ["i_e"], ["o_e"], ["u_e"], ["abc"]] },
  7: { top: "#0c2a33", bottom: "#04141a", fog: "#fff2b0", monsters: ["mon-080", "mon-056", "mon-031"], glyphs: [["ai"], ["ee"], ["ea"], ["oa"], ["ow"]] },
  8: { top: "#2e1a0e", bottom: "#140a04", fog: "#ffd2a6", monsters: ["mon-037", "mon-070", "mon-089"], glyphs: [["oo"], ["ou"], ["ow"], ["oy"], ["igh"]] },
  9: { top: "#14234a", bottom: "#080f24", fog: "#cfe4ff", monsters: ["mon-056", "mon-091", "mon-055"], glyphs: [["ar"], ["or"], ["er"], ["ir"], ["air"]] },
  10: { top: "#06303a", bottom: "#021418", fog: "#b8fff0", monsters: ["mon-031", "mon-080", "mon-070"], glyphs: [["ce"], ["ge"], ["-y"], ["-le"], ["aw"]] },
  11: { top: "#2a1640", bottom: "#120820", fog: "#ffd6f5", monsters: ["mon-091", "mon-037", "mon-055"], glyphs: [["-ed"], ["was"], ["-er"], ["-est"], ["said"]] },
  12: { top: "#3a2a08", bottom: "#181004", fog: "#ffeaa0", monsters: ["mon-044", "mon-055", "mon-091", "mon-037"], glyphs: [["who"], ["why"], ["how"], ["bas-ket"], ["360"]] },
  // run7: ワールド13〜40（docs/curriculum-6year.md §4）。見た目（古代樹・レリーフ・霧・モンスター）は そのまま使い回し、色の組み合わせと 文字だけ かえる
  13: { top: "#3a1f12", bottom: "#170b06", fog: "#ffd9b8", monsters: ["mon-037", "mon-089", "mon-056"], glyphs: [["-s"], ["-es"], ["does"], ["tch"], ["dge"]] },
  14: { top: "#3a1630", bottom: "#170812", fog: "#ffc8e6", monsters: ["mon-031", "mon-080", "mon-091"], glyphs: [["some"], ["any"], ["-ies"], ["how"], ["much"]] },
  15: { top: "#1f3414", bottom: "#0b1606", fog: "#e2ffb8", monsters: ["mon-028", "mon-055", "mon-019"], glyphs: [["-ing"], ["kn"], ["wr"], ["is"], ["are"]] },
  16: { top: "#2c2a26", bottom: "#12110f", fog: "#e8dcc4", monsters: ["mon-070", "mon-037", "mon-044"], glyphs: [["-ed"], ["-ied"], ["was"], ["went"], ["mb"]] },
  17: { top: "#101a44", bottom: "#05081e", fog: "#d6dcff", monsters: ["mon-056", "mon-091", "mon-089"], glyphs: [["will"], ["ph"], ["gh"], ["going"], ["to"]] },
  18: { top: "#0f2e2a", bottom: "#051411", fog: "#c4fff2", monsters: ["mon-019", "mon-031", "mon-055"], glyphs: [["-er"], ["-est"], ["more"], ["most"], ["as"]] },
  19: { top: "#33240c", bottom: "#151004", fog: "#ffe0a0", monsters: ["mon-080", "mon-070", "mon-028"], glyphs: [["must"], ["un-"], ["re-"], ["-ful"], ["-less"]] },
  20: { top: "#3d0f22", bottom: "#18050d", fog: "#ffd0dc", monsters: ["mon-044", "mon-091", "mon-037", "mon-056"], glyphs: [["shall"], ["-ly"], ["to"], ["two"], ["too"]] },
  21: { top: "#1a1f3a", bottom: "#090c1a", fog: "#cfe0ff", monsters: ["mon-089", "mon-055", "mon-031"], glyphs: [["tele"], ["phone"], ["was"], ["-ing"], ["@"]] },
  22: { top: "#3a2608", bottom: "#181004", fog: "#ffd98a", monsters: ["mon-037", "mon-080", "mon-091"], glyphs: [["dis-"], ["mis-"], ["-ment"], ["-ness"], ["story"]] },
  23: { top: "#0d3320", bottom: "#04160c", fog: "#b8ffd2", monsters: ["mon-028", "mon-056", "mon-070"], glyphs: [["if"], ["-able"], ["-ous"], ["graph"], ["photo"]] },
  24: { top: "#26304a", bottom: "#0e1322", fog: "#e4ecff", monsters: ["mon-091", "mon-019", "mon-089"], glyphs: [["have"], ["ever"], ["been"], ["pre-"], ["port"]] },
  25: { top: "#1c1430", bottom: "#0a0714", fog: "#d4c4ff", monsters: ["mon-070", "mon-055", "mon-037"], glyphs: [["might"], ["must"], ["-al"], ["-er"], ["-or"]] },
  26: { top: "#3a0c18", bottom: "#170409", fog: "#ffc0c8", monsters: ["mon-031", "mon-044", "mon-080"], glyphs: [["to"], ["-ing"], ["-ist"], ["act"], ["actor"]] },
  27: { top: "#0c2c34", bottom: "#041318", fog: "#c0f4ff", monsters: ["mon-056", "mon-028", "mon-019"], glyphs: [["since"], ["for"], ["over-"], ["under-"], ["im-"]] },
  28: { top: "#2a1a3c", bottom: "#100a18", fog: "#ffe6b0", monsters: ["mon-044", "mon-091", "mon-055", "mon-037"], glyphs: [["I"], ["think"], ["in-"], ["-y"], ["840"]] },
  29: { top: "#0e2236", bottom: "#050e18", fog: "#fff4c0", monsters: ["mon-089", "mon-031", "mon-070"], glyphs: [["because"], ["dict"], ["ject"], ["spect"], ["agree"]] },
  30: { top: "#132a3a", bottom: "#061118", fog: "#b8f0ff", monsters: ["mon-080", "mon-056", "mon-091"], glyphs: [["that"], ["who"], ["struct"], ["auto"], ["bio"]] },
  31: { top: "#2e2416", bottom: "#130f08", fog: "#f0dcb4", monsters: ["mon-037", "mon-070", "mon-044"], glyphs: [["was"], ["built"], ["had"], ["rupt"], ["geo"]] },
  32: { top: "#40280a", bottom: "#1a0f03", fog: "#ffe2a0", monsters: ["mon-019", "mon-080", "mon-028"], glyphs: [["-tion"], ["-sion"], ["-cian"], ["%"], ["graph"]] },
  33: { top: "#3a1006", bottom: "#170502", fog: "#ffc49a", monsters: ["mon-070", "mon-089", "mon-031"], glyphs: [["if"], ["when"], ["-ible"], ["safe"], ["geo"]] },
  34: { top: "#183048", bottom: "#08131e", fog: "#dcefff", monsters: ["mon-091", "mon-056", "mon-055"], glyphs: [["could"], ["would"], ["mind"], ["where"], ["gate"]] },
  35: { top: "#2c2410", bottom: "#120e05", fog: "#fff0b8", monsters: ["mon-044", "mon-055", "mon-037", "mon-091"], glyphs: [["why"], ["don't"], ["we"], ["vote"], ["1050"]] },
  36: { top: "#04263e", bottom: "#010d18", fog: "#a8eaff", monsters: ["mon-031", "mon-080", "mon-056"], glyphs: [["in"], ["short"], ["research"], ["result"], ["Q&A"]] },
  37: { top: "#261040", bottom: "#0e051a", fog: "#f0c8ff", monsters: ["mon-055", "mon-070", "mon-091"], glyphs: [["if"], ["I"], ["were"], ["wish"], ["tale"]] },
  38: { top: "#183a2a", bottom: "#081a10", fog: "#d8ffe4", monsters: ["mon-019", "mon-028", "mon-037"], glyphs: [["feel"], ["must"], ["be"], ["hard"], ["heart"]] },
  39: { top: "#30200e", bottom: "#140d05", fog: "#ffe4c0", monsters: ["mon-089", "mon-044", "mon-080"], glyphs: [["however"], ["on"], ["the"], ["other"], ["hand"]] },
  40: { top: "#14123a", bottom: "#060518", fog: "#fff2c8", monsters: ["mon-044", "mon-055", "mon-091", "mon-037", "mon-056"], glyphs: [["dream"], ["future"], ["grow"], ["shine"], ["1200"]] },
};

/** いまの ワールドの まえ・あとに いくつ 見せるか（1,200 レッスン ≒ 2,700 ノードを 一度に 描かない。ボタンで ふやせる） */
const WORLD_WINDOW = 1;
const WORLD_STEP = 2;

/** ワールドの 色・モンスター・文字（知らない番号は 1〜12 を くりかえす） */
export function themeOfWorld(w: number) {
  return WORLD_THEMES[w] ?? WORLD_THEMES[((Math.max(1, w) - 1) % 12) + 1];
}

export const THEMED_WORLDS = Object.keys(WORLD_THEMES).map(Number);

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

/** 現在地 = domain/progression.ts の pickCurrent と同じ優先順（受けられる復習クエスト → 次のレッスン/ゲート） */
function currentIndex(list: readonly StageNode[]): number {
  const firstIdx = (f: (n: StageNode) => boolean) => list.findIndex(f);
  return [
    firstIdx((n) => n.type === "CHECK" && n.status === "AVAILABLE"),
    firstIdx((n) => n.type !== "CHECK" && n.status === "AVAILABLE"),
    firstIdx((n) => n.status === "WAIT_TOMORROW"),
  ].find((i) => i >= 0) ?? -1;
}

/** 見せる ワールドの はんい（いまの ワールド ± WORLD_WINDOW。ボタンで まえ・あとに ふやす） */
export function visibleWorldRange(nodes: readonly StageNode[], extra: { before: number; after: number } = { before: 0, after: 0 }): { from: number; to: number; first: number; last: number } {
  if (nodes.length === 0) return { from: 1, to: 1, first: 1, last: 1 };
  const first = nodes[0].world;
  const last = nodes[nodes.length - 1].world;
  const cur = nodes[currentIndex(nodes)]?.world ?? (nodes.every((n) => n.status === "CLEARED") ? last : first);
  return { from: Math.max(first, cur - WORLD_WINDOW - extra.before), to: Math.min(last, cur + WORLD_WINDOW + extra.after), first, last };
}

export function WorldMap({ nodes }: { nodes: StageNode[] }) {
  const allNodes = useMemo(() => nodes ?? [], [nodes]);
  const [extra, setExtra] = useState({ before: 0, after: 0 });
  const range = visibleWorldRange(allNodes, extra);
  const shown = useMemo(() => allNodes.filter((n) => n.world >= range.from && n.world <= range.to), [allNodes, range.from, range.to]);
  const more = "block w-full bg-black/60 py-2 text-sm font-black text-[var(--volt)]";
  return (
    <div>
      {range.from > range.first && (
        <button type="button" className={more} onClick={() => setExtra((e) => ({ ...e, before: e.before + WORLD_STEP }))}>
          ▲ まえの ワールドも みる（ワールド{Math.max(range.first, range.from - WORLD_STEP)}〜）
        </button>
      )}
      <MapSvg nodes={shown} scrollKey={allNodes} />
      {range.to < range.last && (
        <button type="button" className={more} onClick={() => setExtra((e) => ({ ...e, after: e.after + WORLD_STEP }))}>
          ▼ さきの ワールドを のぞく（〜ワールド{Math.min(range.last, range.to + WORLD_STEP)}）
        </button>
      )}
    </div>
  );
}

function MapSvg({ nodes: safeNodes, scrollKey }: { nodes: StageNode[]; scrollKey: unknown }) {
  const router = useRouter();
  const currentRef = useRef<SVGGElement>(null);
  const height = TOP + 90 + safeNodes.length * STEP;

  // 現在地へ スクロールするのは マップの データが かわったときだけ（「まえの ワールドも みる」で もどされないように）
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [scrollKey]);

  const pts = safeNodes.map((_, i) => pos(i));
  const path = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `Q${(pts[i - 1].x + p.x) / 2 + (i % 2 ? 30 : -30)},${(pts[i - 1].y + p.y) / 2} ${p.x},${p.y}`)).join(" ");

  const open = (n: StageNode) => {
    if (n.status === "LOCKED") return;
    if (n.status === "WAIT_TOMORROW") return alert("この復習クエストは あした ひらくよ！きょうは つぎのレッスンに すすめるよ 🌙");
    if (n.type === "LESSON") return router.push(`/lesson/${n.lessonNo}`);
    if (n.assessmentId) router.push(`/test/${encodeURIComponent(n.assessmentId)}`);
  };

  const curIdx = currentIndex(safeNodes);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} className="w-full" role="list" aria-label="ぼうけんマップ">
      {/* ワールドごとの地形 */}
      {[...new Set(safeNodes.map((n) => n.world))].map((w) => {
        const idx = safeNodes.map((n, i) => (n.world === w ? i : -1)).filter((i) => i >= 0);
        if (idx.length === 0) return null;
        const y0 = pos(idx[0]).y - 110;
        const y1 = pos(idx[idx.length - 1]).y + 80;
        const t = themeOfWorld(w);
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
              <text y={5} textAnchor="middle" fontSize={14} fontWeight={900} fill="#f2cf6a" letterSpacing={1}>WORLD {w}・{worldName(w)}</text>
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
          const t = themeOfWorld(n.world);
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
        // ワールドの さいしょの ステージでは 上に ワールド名の プレートが あるので、ビリモと「ここ！」は ステージの よこ（パーティと はんたい がわ）に おく
        const firstOfWorld = curIdx === 0 || safeNodes[curIdx - 1]?.world !== safeNodes[curIdx]?.world;
        const birimo = firstOfWorld ? { x: left ? p.x + 30 : p.x - 76, y: p.y - 26 } : { x: left ? p.x - 54 : p.x + 8, y: p.y - 92 };
        const tag = firstOfWorld ? { x: birimo.x + 23, y: p.y - 34 } : { x: left ? p.x - 28 : p.x + 30, y: p.y - 100 };
        return (
          <g pointerEvents="none">
            <path d={`M${bx + 30} ${p.y - 170} L${bx + 70} ${p.y - 170} L${bx + 112} ${p.y + 30} L${bx - 12} ${p.y + 30} Z`} fill="#fff1c2" opacity={0.12} filter="url(#f-dof-2)" />
            <ellipse cx={bx + 50} cy={p.y + 28} rx={62} ry={9} fill="url(#g-magic)" opacity={0.5} />
            <g filter="url(#f-rim)">
              {([["riko", 0, 0.42], ["kiko", 66, 0.4], ["haru", 26, 0.5]] as const).map(([id, dx, s]) => (
                <g key={id} transform={`translate(${bx + dx} ${p.y + 30 - 170 * s})`}><g transform={`scale(${s})`}><Standing id={id} pose={id === "haru" ? "point" : "wave"} /></g></g>
              ))}
              <g transform={`translate(${birimo.x} ${birimo.y}) scale(0.46)`}><g className="bob"><BirimoArt mood={sleepy ? "sleepy" : "excited"} /></g></g>
            </g>
            <g transform={`translate(${tag.x} ${tag.y})`}>
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
