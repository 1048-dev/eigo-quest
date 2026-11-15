/**
 * キャラクターの全身「立ち絵」（オリジナルSVG）。
 * 座標系は 100×170。頭部は CharacterArt の顔イラストを再利用し、その下に体・腕・足を描く。
 * ポーズ: idle（気をつけ）/ wave（手をふる）/ point（前を指さす）/ cheer（ばんざい）
 */
import { BirimoArt, HaruArt, KikoArt, RikoArt } from "./CharacterArt";
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";

export type Pose = "idle" | "wave" | "point" | "cheer";

const SKIN = "#ffd9b5";
const LINE = "#3b2a1a";

function Arm({ side, pose, sleeve }: { side: "L" | "R"; pose: Pose; sleeve: string }) {
  const s = side === "L" ? -1 : 1;
  const sx = 50 + s * 22; // 肩
  const sy = 96;
  let hand: [number, number];
  if (pose === "cheer") hand = [50 + s * 36, 64];
  else if (pose === "wave" && side === "R") hand = [86, 66];
  else if (pose === "point" && side === "R") hand = [92, 100];
  else hand = [50 + s * 27, 126];
  const [hx, hy] = hand;
  const mx = (sx + hx) / 2 + s * 3;
  const my = (sy + hy) / 2;
  return (
    <g>
      <path d={`M${sx} ${sy} Q${mx} ${my} ${hx} ${hy}`} stroke={sleeve} strokeWidth={11} strokeLinecap="round" fill="none" />
      <circle cx={hx} cy={hy} r={6.5} fill={SKIN} stroke={LINE} strokeWidth={1.5} />
      {pose === "point" && side === "R" && <path d={`M${hx + 4} ${hy - 1} l8 -2`} stroke={SKIN} strokeWidth={4} strokeLinecap="round" />}
    </g>
  );
}

function Legs({ pants, shoes, skirt }: { pants?: string; shoes: string; skirt?: string }) {
  return (
    <g>
      {skirt ? (
        <path d="M30 118 L70 118 L80 142 Q50 150 20 142 Z" fill={skirt} stroke={LINE} strokeWidth={1.5} />
      ) : (
        <path d="M32 118 L68 118 L70 140 L53 140 L50 128 L47 140 L30 140 Z" fill={pants} stroke={LINE} strokeWidth={1.5} />
      )}
      <rect x={36} y={skirt ? 142 : 138} width={9} height={skirt ? 18 : 20} rx={3} fill={SKIN} />
      <rect x={55} y={skirt ? 142 : 138} width={9} height={skirt ? 18 : 20} rx={3} fill={SKIN} />
      <ellipse cx={39} cy={162} rx={9} ry={5} fill={shoes} stroke={LINE} strokeWidth={1.5} />
      <ellipse cx={61} cy={162} rx={9} ry={5} fill={shoes} stroke={LINE} strokeWidth={1.5} />
    </g>
  );
}

function Body({ color, accent }: { color: string; accent?: string }) {
  return (
    <g>
      <path d="M28 92 Q50 84 72 92 L70 122 Q50 128 30 122 Z" fill={color} stroke={LINE} strokeWidth={1.5} />
      {accent && <path d="M44 92 L50 106 L56 92" fill="none" stroke={accent} strokeWidth={3} strokeLinejoin="round" />}
    </g>
  );
}

/** 頭部（100×100）を体の上に少し小さめに置く */
function Head({ children }: { children: React.ReactNode }) {
  return <g transform="translate(6 -4) scale(0.88)">{children}</g>;
}

export function HaruStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <ellipse cx={50} cy={166} rx={30} ry={5} fill="rgba(0,0,0,.25)" />
      <Legs pants="#b5894f" shoes="#7a3a1a" />
      <Body color="#3f7d4e" accent="#f6efe0" />
      {/* 探検かばんのベルト */}
      <path d="M30 94 L68 122" stroke="#7a4a2a" strokeWidth={4} />
      <rect x={62} y={114} width={14} height={11} rx={2} fill="#a0612f" stroke={LINE} strokeWidth={1.2} />
      <Arm side="L" pose={pose} sleeve="#3f7d4e" />
      <Arm side="R" pose={pose} sleeve="#3f7d4e" />
      <Head><HaruArt /></Head>
    </g>
  );
}

export function RikoStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <ellipse cx={50} cy={166} rx={30} ry={5} fill="rgba(0,0,0,.25)" />
      <Legs skirt="#e8742b" shoes="#ffd23f" />
      <Body color="#ff8a3d" accent="#ffd23f" />
      <Arm side="L" pose={pose} sleeve="#ff8a3d" />
      <Arm side="R" pose={pose} sleeve="#ff8a3d" />
      <Head><RikoArt /></Head>
    </g>
  );
}

export function KikoStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <ellipse cx={50} cy={166} rx={28} ry={5} fill="rgba(0,0,0,.25)" />
      <Legs skirt="#7a52d6" shoes="#ff7eb6" />
      <Body color="#9b6bff" accent="#ff7eb6" />
      {/* ことばノート */}
      <rect x={18} y={110} width={16} height={20} rx={2} fill="#fff4c2" stroke={LINE} strokeWidth={1.2} transform="rotate(-12 26 120)" />
      <Arm side="L" pose={pose === "point" ? "idle" : pose} sleeve="#9b6bff" />
      <Arm side="R" pose={pose} sleeve="#9b6bff" />
      <Head><KikoArt /></Head>
    </g>
  );
}

/** ビリモは全身キャラなので、立ち絵の座標系（100×170）の足元にそろえて置く */
export function BirimoStanding({ mood = "happy" }: { mood?: Mood }) {
  return (
    <g>
      <ellipse cx={50} cy={166} rx={26} ry={5} fill="rgba(0,0,0,.25)" />
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

/** 単体の <svg> として置く立ち絵 */
export function StandingFigure({ id, pose, mood, height = 160, className = "", flip = false }: { id: CharacterId; pose?: Pose; mood?: Mood; height?: number; className?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 100 170" height={height} width={(height * 100) / 170} className={className} aria-hidden overflow="visible">
      <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}><Standing id={id} pose={pose} mood={mood} /></g>
    </svg>
  );
}
