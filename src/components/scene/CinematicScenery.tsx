/**
 * 映画的な背景アセット（SVGの <g>）。原点 (0,0) は「地面に接する中心」。
 * 質感（陰影・発光・ぼかし・石の彫刻）は components/art/ArtDefs.tsx の共通定義を使う。
 */
import type { ReactNode } from "react";

export type Depth = "far" | "mid" | "near";

const DEPTH = {
  far: { leaf: ["#123b2c", "#184a36"], trunk: "#1a2a20", filter: "url(#f-dof-2)", rim: 0.15 },
  mid: { leaf: ["#1f6b44", "#2f8a55"], trunk: "#4a3320", filter: undefined, rim: 0.5 },
  near: { leaf: ["#0d2a1c", "#123726"], trunk: "#120d08", filter: "url(#f-dof-4)", rim: 0.25 },
} as const;

/** 巨大な古代樹: 板根・つた・幾層もの葉のかたまり・逆光のふち */
export function AncientTree({ s = 1, depth = "mid", seed = 0 }: { s?: number; depth?: Depth; seed?: number }) {
  const d = DEPTH[depth];
  const clusters: [number, number, number][] = [
    [-46, -150, 34], [-10, -178, 40], [34, -158, 36], [60, -128, 28], [-68, -120, 26], [6, -132, 30], [-30, -116, 24], [38, -112, 22],
    [-60, -168, 22], [52, -176, 24], [16, -196, 24], [-28, -196, 20], [76, -150, 18], [-82, -142, 16],
  ];
  return (
    <g transform={`scale(${s})`} filter={d.filter}>
      {/* 幹と板根 */}
      <path d="M-16 0 Q-14 -60 -8 -120 L10 -120 Q16 -60 20 0 Z" fill={d.trunk} filter="url(#f-texture)" />
      <path d="M-6 -10 Q-4 -60 -2 -110 M6 -12 Q8 -60 4 -112" stroke="#000" strokeOpacity={0.3} strokeWidth={1.2} fill="none" />
      <path d="M-16 0 Q-40 -6 -52 4 Q-30 -10 -14 -30 Z M20 0 Q44 -6 58 4 Q34 -12 18 -34 Z M-4 0 Q-10 -20 -2 -40 Q6 -20 8 0 Z" fill={d.trunk} />
      <path d="M-8 -120 Q-12 -60 -14 0" stroke="#fff" strokeOpacity={d.rim * 0.4} strokeWidth={3} fill="none" />
      {/* 葉のかたまり（奥→手前）。f-organic で輪郭をゆらして本物のしげみの形に */}
      <g filter="url(#f-organic)">
      {clusters.map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x + ((seed * 7 + i * 3) % 6)} cy={y} r={r} fill={d.leaf[i % 2]} />
          <circle cx={x + ((seed * 7 + i * 3) % 6)} cy={y} r={r} fill="url(#shade-sphere)" opacity={0.7} />
          <path d={`M${x - r * 0.7} ${y - r * 0.55} A${r} ${r} 0 0 1 ${x + r * 0.2} ${y - r * 0.95}`} stroke="#ffe39a" strokeOpacity={d.rim} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      ))}
      </g>
      {/* つた */}
      {[-40, -14, 22, 50].map((x, i) => (
        <path key={x} d={`M${x} -120 Q${x + 6} -90 ${x - 2} ${-64 + i * 6} Q${x - 8} -40 ${x + 2} ${-24 + i * 4}`} stroke={d.leaf[1]} strokeWidth={2.5} fill="none" />
      ))}
    </g>
  );
}

/** 手前のシダ（ぼかして被写界深度を出す） */
export function Fern({ s = 1, flip = false, blur = true }: { s?: number; flip?: boolean; blur?: boolean }) {
  return (
    <g transform={`scale(${flip ? -s : s} ${s})`} filter={blur ? "url(#f-dof-2)" : undefined}>
      {[-60, -35, -12, 10, 32].map((r, i) => (
        <g key={r} transform={`rotate(${r})`}>
          <path d={`M0 0 Q${10 + i * 2} -40 ${4 + i} -${80 + i * 6}`} stroke="#14482c" strokeWidth={3} fill="none" />
          {Array.from({ length: 9 }, (_, k) => (
            <ellipse key={k} cx={4 + i + k * 0.4} cy={-12 - k * 8} rx={10 - k * 0.7} ry={3} fill={k % 2 ? "#1d6a3e" : "#185a35"} transform={`rotate(${k % 2 ? 25 : -25} ${4 + i} ${-12 - k * 8})`} />
          ))}
        </g>
      ))}
    </g>
  );
}

/** 古代遺跡のレリーフ壁（彫られた文字・うずまき・モンスターの浮き彫り＋苔＋ひび） */
export function RuinRelief({ w = 120, h = 90, glyphs = ["A", "B", "C"], glow = false }: { w?: number; h?: number; glyphs?: string[]; glow?: boolean }) {
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} fill="url(#g-stone-warm)" filter="url(#f-texture)" />
      <rect x={-w / 2} y={-h} width={w} height={h} fill="url(#shade-top)" opacity={0.7} />
      {/* 石積みの目地 */}
      {[0.33, 0.66].map((f) => <line key={f} x1={-w / 2} x2={w / 2} y1={-h * f} y2={-h * f} stroke="#000" strokeOpacity={0.25} strokeWidth={1.5} />)}
      {[-0.3, 0.05, 0.35].map((f, i) => <line key={f} x1={w * f + (i % 2) * 10} x2={w * f + (i % 2) * 10} y1={-h * 0.66} y2={-h * 0.33} stroke="#000" strokeOpacity={0.2} strokeWidth={1.5} />)}
      {/* 彫刻（スペキュラーライティングで凹凸） */}
      <g filter="url(#f-relief)" fill="#8a7650">
        <rect x={-w / 2 + 6} y={-h + 6} width={w - 12} height={h * 0.26} rx={3} fill="none" stroke="#8a7650" strokeWidth={3} />
        {glyphs.map((g, i) => (
          <text key={i} x={-w / 2 + (w / (glyphs.length + 1)) * (i + 1)} y={-h * 0.4} textAnchor="middle" fontSize={h * 0.3} fontWeight={900} fontFamily="Georgia, serif">{g}</text>
        ))}
        <path d={`M${-w / 2 + 14} ${-h * 0.14} q8 -10 16 0 t16 0 t16 0 t16 0 t16 0`} stroke="#8a7650" strokeWidth={3} fill="none" />
        <path d={`M${w / 2 - 26} ${-h + 18} a7 7 0 1 1 -7 7 a4 4 0 1 0 4 -4`} stroke="#8a7650" strokeWidth={2.5} fill="none" />
      </g>
      {glow && (
        <g filter="url(#f-bloom-gold)">
          {glyphs.map((g, i) => (
            <text key={i} x={-w / 2 + (w / (glyphs.length + 1)) * (i + 1)} y={-h * 0.4} textAnchor="middle" fontSize={h * 0.3} fontWeight={900} fontFamily="Georgia, serif" fill="none" stroke="#ffd96a" strokeWidth={1.2} opacity={0.9}>{g}</text>
          ))}
        </g>
      )}
      {/* ひびと苔 */}
      <path d={`M${w * 0.2} ${-h} l-6 14 l5 8 l-7 16`} stroke="#000" strokeOpacity={0.4} strokeWidth={1.4} fill="none" />
      <path d={`M${-w / 2} ${-h + 4} q${w * 0.2} 10 ${w * 0.38} 2 q${w * 0.2} -6 ${w * 0.62} 4`} stroke="#3f7d3a" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d={`M${-w / 2 + 10} ${-h + 6} q4 20 -2 34`} stroke="#3f7d3a" strokeWidth={3} fill="none" opacity={0.8} />
    </g>
  );
}

/** 古代の神殿の門（柱・彫刻のある梁・光るルーン・階段） */
export function TempleGate({ s = 1, glow = true }: { s?: number; glow?: boolean }) {
  return (
    <g transform={`scale(${s})`}>
      {glow && <ellipse cx={0} cy={-60} rx={70} ry={70} fill="url(#g-magic)" opacity={0.75} />}
      {[0, 1, 2].map((i) => <rect key={i} x={-60 + i * 4} y={-8 + i * 4 - 8} width={120 - i * 8} height={6} fill="url(#g-stone)" />)}
      {[-46, -22, 22, 46].map((x) => (
        <g key={x}>
          <rect x={x - 7} y={-104} width={14} height={92} fill="url(#g-stone-warm)" />
          <rect x={x - 7} y={-104} width={14} height={92} fill="url(#shade-cyl)" />
        </g>
      ))}
      <path d="M-62 -104 L62 -104 L52 -124 L-52 -124 Z" fill="url(#g-stone-warm)" />
      <path d="M-30 -124 L0 -146 L30 -124 Z" fill="url(#g-stone)" />
      <rect x={-12} y={-90} width={24} height={78} fill="#0a0d0c" />
      <rect x={-12} y={-90} width={24} height={78} fill="url(#g-teal-glow)" opacity={0.55} />
      <g filter="url(#f-bloom-gold)">
        <circle cx={0} cy={-114} r={6} fill="none" stroke="#ffd96a" strokeWidth={1.6} />
        <path d="M-3 -114 h6 M0 -117 v6" stroke="#ffd96a" strokeWidth={1.4} />
      </g>
    </g>
  );
}

/** 神々しい光の筋（ゴッドレイ） */
export function GodRays({ x = 0, w = 400, h = 300, count = 5, opacity = 0.12 }: { x?: number; w?: number; h?: number; count?: number; opacity?: number }) {
  return (
    <g opacity={opacity} style={{ mixBlendMode: "screen" }}>
      {Array.from({ length: count }, (_, i) => {
        const x0 = x + (w / count) * i;
        return <path key={i} d={`M${x0} 0 L${x0 + 26} 0 L${x0 + 110 + i * 10} ${h} L${x0 + 60 + i * 6} ${h} Z`} fill="#fff1c2" filter="url(#f-dof-2)" />;
      })}
    </g>
  );
}

/** 霧の層 */
export function Fog({ y, w = 400, opacity = 0.35 }: { y: number; w?: number; opacity?: number }) {
  return (
    <g opacity={opacity} filter="url(#f-glow-soft)">
      <ellipse cx={w * 0.2} cy={y} rx={w * 0.35} ry={14} fill="#cfeee4" />
      <ellipse cx={w * 0.65} cy={y + 6} rx={w * 0.4} ry={16} fill="#cfeee4" />
    </g>
  );
}

/** ただよう光の粒（ホタル・魔力のかけら） */
export function Motes({ w = 360, h = 240, n = 14, seed = 1, color = "#ffe9a0" }: { w?: number; h?: number; n?: number; seed?: number; color?: string }) {
  return (
    <g style={{ mixBlendMode: "screen" }}>
      {Array.from({ length: n }, (_, i) => {
        const x = ((i * 97 + seed * 31) % 100) / 100 * w;
        const y = ((i * 57 + seed * 13) % 100) / 100 * h;
        const r = 1.2 + ((i * 7 + seed) % 5) * 0.6;
        return (
          <g key={i} className="mote" style={{ animationDelay: `${(i % 7) * 0.6}s` }}>
            <circle cx={x} cy={y} r={r * 3.2} fill={color} opacity={0.18} filter="url(#f-dof-1)" />
            <circle cx={x} cy={y} r={r} fill="#fffbe6" />
          </g>
        );
      })}
    </g>
  );
}

/** 地面の魔法陣（ゆっくり光る） */
export function MagicCircle({ rx = 90, ry = 18 }: { rx?: number; ry?: number }) {
  return (
    <g className="pulse-glow" filter="url(#f-bloom-gold)" opacity={0.8}>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke="#ffd96a" strokeWidth={1.6} />
      <ellipse cx={0} cy={0} rx={rx * 0.78} ry={ry * 0.78} fill="none" stroke="#ffd96a" strokeWidth={1} strokeDasharray="6 5" />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <text key={i} x={Math.cos(a) * rx * 0.89} y={Math.sin(a) * ry * 0.89 + 2} fontSize={6} textAnchor="middle" fill="#ffe7a0">{"ABCDEFGH"[i]}</text>;
      })}
    </g>
  );
}

/** 光る水晶のかたまり（遺跡の魔力） */
export function Crystals({ s = 1, gem = "sapphire" }: { s?: number; gem?: "sapphire" | "amethyst" | "emerald" | "topaz" }) {
  const shards: [number, number, number, number][] = [[-12, 26, 7, -14], [0, 40, 9, 0], [12, 30, 7, 16], [-22, 16, 5, -26], [22, 18, 5, 28]];
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx={0} cy={0} rx={30} ry={6} fill="url(#ao-floor)" />
      <circle cx={0} cy={-18} r={30} fill="url(#g-magic)" opacity={0.35} className="pulse-glow" />
      <g filter="url(#f-bloom-gold)">
        {shards.map(([x, h, w, r], i) => (
          <g key={i} transform={`translate(${x} 0) rotate(${r})`}>
            <path d={`M${-w} 0 L${-w} ${-h * 0.75} L0 ${-h} L${w} ${-h * 0.75} L${w} 0 Z`} fill={`url(#gem-${gem})`} />
            <path d={`M${-w} ${-h * 0.75} L0 ${-h} L0 0 L${-w} 0 Z`} fill="#fff" opacity={0.22} />
          </g>
        ))}
      </g>
    </g>
  );
}

/** 画面のふちを暗くする（ビネット） */
export function Vignette({ w, h, id }: { w: number; h: number; id: string }) {
  return (
    <>
      <radialGradient id={id} cx="50%" cy="45%" r="70%">
        <stop offset="55%" stopColor="#000" stopOpacity="0" /><stop offset="100%" stopColor="#000" stopOpacity=".65" />
      </radialGradient>
      <rect width={w} height={h} fill={`url(#${id})`} pointerEvents="none" />
    </>
  );
}

export function At({ x, y, children, filter, opacity }: { x: number; y: number; children: ReactNode; filter?: string; opacity?: number }) {
  return <g transform={`translate(${x} ${y})`} filter={filter} opacity={opacity}>{children}</g>;
}
