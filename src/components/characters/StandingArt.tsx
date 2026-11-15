/**
 * キャラクターの全身「立ち絵」（3Dアニメ風の陰影つき・オリジナル）。
 * 座標系は 100×170。頭部は CharacterArt の顔を再利用し、その下に体・腕・足を描く。
 * ポーズ: idle（気をつけ）/ wave（手をふる）/ point（前を指さす）/ cheer（ばんざい）
 */
import { BirimoArt, HaruArt, KikoArt, RikoArt } from "./CharacterArt";
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";
import { RENDERED_STANDING } from "@/lib/art/renderedArt";

export type Pose = "idle" | "wave" | "point" | "cheer";

const LINE = "#2a170a";

function Arm({ side, pose, sleeve }: { side: "L" | "R"; pose: Pose; sleeve: string }) {
  const s = side === "L" ? -1 : 1;
  const sx = 50 + s * 22;
  const sy = 96;
  let hand: [number, number];
  if (pose === "cheer") hand = [50 + s * 36, 62];
  else if (pose === "wave" && side === "R") hand = [86, 64];
  else if (pose === "point" && side === "R") hand = [93, 98];
  else hand = [50 + s * 27, 126];
  const [hx, hy] = hand;
  const mx = (sx + hx) / 2 + s * 3;
  const my = (sy + hy) / 2;
  const d = `M${sx} ${sy} Q${mx} ${my} ${hx} ${hy}`;
  return (
    <g>
      <path d={d} stroke={sleeve} strokeWidth={12} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#000" strokeOpacity={0.18} strokeWidth={5} strokeLinecap="round" fill="none" transform={`translate(${s * 2.5} 1)`} />
      <path d={d} stroke="#fff" strokeOpacity={0.22} strokeWidth={3} strokeLinecap="round" fill="none" transform={`translate(${-s * 2.5} -1)`} />
      <circle cx={hx} cy={hy} r={6.8} fill="url(#g-skin)" />
      <circle cx={hx} cy={hy} r={6.8} fill="url(#shade-sphere)" opacity={0.6} />
      {pose === "point" && side === "R" && <path d={`M${hx + 4} ${hy - 1} l9 -2`} stroke="#ffd2ad" strokeWidth={4} strokeLinecap="round" />}
    </g>
  );
}

function Legs({ pants, skirt, boots = "url(#g-boot)" }: { pants?: string; skirt?: string; boots?: string }) {
  const top = skirt ? 142 : 138;
  return (
    <g>
      {[36, 55].map((x) => (
        <g key={x}>
          <rect x={x} y={top} width={9.5} height={20} rx={3.5} fill="url(#g-skin)" />
          <rect x={x} y={top} width={9.5} height={20} rx={3.5} fill="url(#shade-cyl)" />
        </g>
      ))}
      {skirt ? (
        <g>
          <path d="M29 116 L71 116 L82 143 Q50 152 18 143 Z" fill={skirt} />
          <path d="M29 116 L71 116 L82 143 Q50 152 18 143 Z" fill="url(#shade-cyl)" />
          <path d="M40 118 L36 146 M50 118 L50 149 M60 118 L64 146" stroke="#000" strokeOpacity={0.15} strokeWidth={1.4} />
        </g>
      ) : (
        <g>
          <path d="M31 116 L69 116 L71 140 L53 140 L50 127 L47 140 L29 140 Z" fill={pants} />
          <path d="M31 116 L69 116 L71 140 L53 140 L50 127 L47 140 L29 140 Z" fill="url(#shade-cyl)" />
        </g>
      )}
      {[40.5, 59.5].map((x) => (
        <g key={x}>
          <path d={`M${x - 8} 158 Q${x - 8} 152 ${x} 152 Q${x + 9} 152 ${x + 10} 162 Q${x} 167 ${x - 9} 164 Z`} fill={boots} />
          <ellipse cx={x - 1} cy={155} rx={4} ry={1.6} fill="#fff" opacity={0.45} />
        </g>
      ))}
    </g>
  );
}

function Torso({ fill, accent }: { fill: string; accent?: string }) {
  const d = "M27 92 Q50 83 73 92 L71 122 Q50 129 29 122 Z";
  return (
    <g>
      <path d={d} fill={fill} />
      <path d={d} fill="url(#shade-cyl)" />
      <path d="M30 120 Q50 126 70 120" stroke="#000" strokeOpacity={0.2} strokeWidth={2} fill="none" />
      {accent && <path d="M44 92 L50 107 L56 92" fill="none" stroke={accent} strokeWidth={3} strokeLinejoin="round" />}
    </g>
  );
}

/** 接地影（アンビエントオクルージョン風のやわらかい影） */
const Floor = ({ rx = 32 }: { rx?: number }) => <ellipse cx={50} cy={165} rx={rx} ry={6} fill="url(#ao-floor)" />;

function Head({ children }: { children: React.ReactNode }) {
  return <g transform="translate(6 -4) scale(0.88)">{children}</g>;
}

export function HaruStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <Floor />
      <Legs pants="url(#g-shorts)" />
      <Torso fill="url(#g-vest)" accent="#f6efe0" />
      <path d="M29 94 L68 122" stroke="#5a3418" strokeWidth={4} />
      <g>
        <rect x={61} y={113} width={16} height={12} rx={2.5} fill="url(#g-boot)" />
        <rect x={61} y={113} width={16} height={4} rx={2} fill="#fff" opacity={0.18} />
        <circle cx={69} cy={119} r={1.6} fill="url(#metal-gold)" />
      </g>
      <Arm side="L" pose={pose} sleeve="url(#g-vest)" />
      <Arm side="R" pose={pose} sleeve="url(#g-vest)" />
      <Head><HaruArt /></Head>
    </g>
  );
}

export function RikoStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <Floor />
      <Legs skirt="url(#g-riko-dress)" boots="url(#gem-topaz)" />
      <Torso fill="url(#g-riko-dress)" accent="#ffd23f" />
      <Arm side="L" pose={pose} sleeve="url(#g-riko-dress)" />
      <Arm side="R" pose={pose} sleeve="url(#g-riko-dress)" />
      <Head><RikoArt /></Head>
    </g>
  );
}

export function KikoStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <Floor rx={29} />
      <Legs skirt="url(#g-kiko-dress)" boots="url(#gem-amethyst)" />
      <Torso fill="url(#g-kiko-dress)" accent="#ff8fc0" />
      {/* ことばノート（金の留め具つき） */}
      <g transform="rotate(-12 26 120)">
        <rect x={17} y={109} width={18} height={22} rx={2} fill="#7a3a12" />
        <rect x={19} y={111} width={14} height={18} rx={1.5} fill="#fff4d2" />
        <rect x={17} y={109} width={18} height={22} rx={2} fill="url(#shade-cyl)" />
        <rect x={31} y={118} width={4} height={4} fill="url(#metal-gold)" />
      </g>
      <Arm side="L" pose={pose === "point" ? "idle" : pose} sleeve="url(#g-kiko-dress)" />
      <Arm side="R" pose={pose} sleeve="url(#g-kiko-dress)" />
      <Head><KikoArt /></Head>
    </g>
  );
}

export function BirimoStanding({ mood = "happy" }: { mood?: Mood }) {
  return (
    <g>
      <Floor rx={27} />
      <g transform="translate(0 72)"><BirimoArt mood={mood} /></g>
    </g>
  );
}

export function Standing({ id, pose, mood }: { id: CharacterId; pose?: Pose; mood?: Mood }) {
  switch (id) {
    case "haru": return <HaruStanding pose={pose} />;
    case "riko": return <RikoStanding pose={pose} />;
    case "kiko": return <KikoStanding pose={pose} />;
    case "birimo": return <BirimoStanding mood={mood} />;
  }
}

/** 単体の <svg> として置く立ち絵（逆光のふち取り＋影つき） */
export function StandingFigure({ id, pose, mood, height = 160, className = "", flip = false, rim = true }: { id: CharacterId; pose?: Pose; mood?: Mood; height?: number; className?: string; flip?: boolean; rim?: boolean }) {
  const rendered = RENDERED_STANDING[id];
  if (rendered) {
    // 3DCGの画像が登録されていればそれを使う（lib/art/renderedArt.ts）
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={rendered} alt="" aria-hidden height={height} width={(height * 100) / 170} className={`object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,.55)] ${flip ? "-scale-x-100" : ""} ${className}`} />;
  }
  return (
    <svg viewBox="0 0 100 170" height={height} width={(height * 100) / 170} className={className} aria-hidden overflow="visible">
      <g filter={rim ? "url(#f-rim)" : undefined}>
        <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}><Standing id={id} pose={pose} mood={mood} /></g>
      </g>
    </svg>
  );
}

/** 立ち絵の線の色（他コンポーネント用） */
export const ART_LINE = LINE;
