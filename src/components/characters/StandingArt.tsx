/**
 * キャラクターの全身「立ち絵」（オリジナル）。座標系は 100×170。
 * アニメの公式設定画のような約5頭身（頭は小さめ・手足は長め）で、服のしわ・ベルト・ブーツまで陰影つきで描く。
 * ポーズ: idle（気をつけ）/ wave（手をふる）/ point（前を指さす）/ cheer（ばんざい）
 */
import { BirimoArt, HaruArt, KikoArt, RikoArt } from "./CharacterArt";
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";
import { RENDERED_STANDING } from "@/lib/art/renderedArt";

export type Pose = "idle" | "wave" | "point" | "cheer";

const LINE = "#2a170a";

type Pt = [number, number];

/** 腕の関節（肩→ひじ→手） */
function armPoints(side: "L" | "R", pose: Pose): [Pt, Pt, Pt] {
  const s = side === "L" ? -1 : 1;
  const shoulder: Pt = [50 + s * 19, 53];
  if (pose === "cheer") return [shoulder, [50 + s * 25, 32], [50 + s * 29, 10]];
  if (pose === "wave" && side === "R") return [shoulder, [80, 40], [84, 18]];
  if (pose === "point" && side === "R") return [shoulder, [80, 60], [97, 57]];
  return [shoulder, [50 + s * 24, 77], [50 + s * 25, 99]];
}

/** 手足（太さのある線＋円柱の陰影＋光のふち） */
function Limb({ pts, w, fill }: { pts: Pt[]; w: number; fill: string }) {
  const d = `M${pts[0][0]} ${pts[0][1]} ` + pts.slice(1).map((p) => `L${p[0]} ${p[1]}`).join(" ");
  return (
    <g>
      <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={d} stroke="#000" strokeOpacity={0.22} strokeWidth={w * 0.4} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(1.4 0.6)" />
      <path d={d} stroke="#fff" strokeOpacity={0.2} strokeWidth={w * 0.25} strokeLinecap="round" strokeLinejoin="round" fill="none" transform="translate(-1.6 -0.6)" />
    </g>
  );
}

function Hand({ at, pointing = false }: { at: Pt; pointing?: boolean }) {
  const [x, y] = at;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={4.2} ry={4.6} fill="url(#g-skin)" />
      <ellipse cx={x} cy={y} rx={4.2} ry={4.6} fill="url(#shade-sphere)" opacity={0.55} />
      {pointing && <path d={`M${x + 3} ${y - 1} l6 -1`} stroke="#ffd2ad" strokeWidth={2.6} strokeLinecap="round" />}
    </g>
  );
}

function Arm({ side, pose, sleeve, cuff, long = false }: { side: "L" | "R"; pose: Pose; sleeve: string; cuff?: string; long?: boolean }) {
  const [sh, el, ha] = armPoints(side, pose);
  // long=false: ひじから先は袖をまくった素肌 / long=true: 手首までの長袖
  const wrist: Pt = [el[0] + (ha[0] - el[0]) * 0.82, el[1] + (ha[1] - el[1]) * 0.82];
  return (
    <g>
      <Limb pts={[sh, el]} w={10.5} fill={sleeve} />
      <Limb pts={[el, wrist]} w={long ? 9 : 7.5} fill={long ? sleeve : "url(#g-skin)"} />
      {cuff && <circle cx={el[0]} cy={el[1]} r={4.6} fill={cuff} />}
      <Hand at={ha} pointing={pose === "point" && side === "R"} />
    </g>
  );
}

function Legs({ pants, boot = "url(#g-boot)", skin = false }: { pants: string; boot?: string; skin?: boolean }) {
  const legs: [Pt, Pt, Pt][] = [[[43.5, 98], [42.5, 128], [42.5, 154]], [[56.5, 98], [57.5, 128], [57.5, 154]]];
  return (
    <g>
      {legs.map((pts, i) => (
        <g key={i}>
          <Limb pts={pts} w={12} fill={skin ? "url(#g-skin)" : pants} />
          {/* ブーツ（つや・ふち） */}
          <path d={`M${pts[2][0] - 6} 146 L${pts[2][0] + 5} 146 L${pts[2][0] + 6} 160 Q${pts[2][0] + (i ? 12 : 10)} 162 ${pts[2][0] + (i ? 12 : 10)} 166 L${pts[2][0] - 6} 166 Z`} fill={boot} />
          <path d={`M${pts[2][0] - 6} 146 L${pts[2][0] + 5} 146 L${pts[2][0] + 5.5} 149 L${pts[2][0] - 6} 149 Z`} fill="url(#metal-gold)" opacity={0.8} />
          <ellipse cx={pts[2][0] - 2} cy={153} rx={1.6} ry={4} fill="#fff" opacity={0.3} />
        </g>
      ))}
    </g>
  );
}

/** 接地影（アンビエントオクルージョン風） */
const Floor = ({ rx = 26 }: { rx?: number }) => <ellipse cx={50} cy={166} rx={rx} ry={5} fill="url(#ao-floor)" />;

/** 頭部（首から上だけ）を小さめに置く */
function Head({ children }: { children: React.ReactNode }) {
  return <g transform="translate(27 0) scale(0.46)">{children}</g>;
}

function Neck() {
  return (
    <g>
      <rect x={45} y={33} width={10} height={16} rx={3} fill="url(#g-skin)" />
      <rect x={45} y={33} width={10} height={6} fill="#000" opacity={0.14} />
    </g>
  );
}

/** 主人公ハル（10歳）: 探検ジャケット・金のバックルのベルト・ななめがけのかばん・カーゴパンツ・ブーツ */
export function HaruStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <Floor />
      <Legs pants="url(#g-shorts)" />
      <Neck />
      {/* ジャケット */}
      <path d="M28 52 Q30 45 50 44 Q70 45 72 52 L72 92 Q50 98 28 92 Z" fill="url(#g-vest)" />
      <path d="M28 52 Q30 45 50 44 Q70 45 72 52 L72 92 Q50 98 28 92 Z" fill="url(#shade-cyl)" />
      <path d="M44 48 L50 66 L56 48 Z" fill="#f6efe0" />
      <path d="M44 48 L50 66 M56 48 L50 66" stroke="#173d28" strokeWidth={1.4} />
      <path d="M50 66 L50 92" stroke="#173d28" strokeWidth={1.2} />
      {[72, 80].map((y) => <rect key={y} x={34} y={y} width={9} height={6} rx={1} fill="#1f5236" stroke="#173d28" strokeWidth={0.8} />)}
      <path d="M36 58 Q40 64 36 72 M64 58 Q60 64 64 72" stroke="#000" strokeOpacity={0.18} strokeWidth={1.2} fill="none" />
      {/* ベルト */}
      <rect x={28} y={89} width={44} height={6} fill="#3a1d0a" />
      <rect x={46.5} y={88.5} width={7} height={7} rx={1} fill="url(#metal-gold)" />
      {/* かばんのベルトとかばん */}
      <path d="M34 50 L66 88" stroke="#5a3418" strokeWidth={3.4} />
      <rect x={60} y={84} width={15} height={12} rx={2.4} fill="url(#g-boot)" />
      <rect x={60} y={84} width={15} height={4} rx={2} fill="#fff" opacity={0.15} />
      <circle cx={67.5} cy={90} r={1.4} fill="url(#metal-gold)" />
      <Arm side="L" pose={pose} sleeve="url(#g-vest)" />
      <Arm side="R" pose={pose} sleeve="url(#g-vest)" />
      <Head><HaruArt bust={false} /></Head>
    </g>
  );
}

/** なかまリコ（8歳）: オレンジのチュニック・黄色の帯・スカーフ・レギンス・ブーツ */
export function RikoStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <Floor />
      <Legs pants="#3a2a4a" boot="url(#g-boot)" />
      <Neck />
      <path d="M29 52 Q31 46 50 45 Q69 46 71 52 L76 116 Q50 124 24 116 Z" fill="url(#g-riko-dress)" />
      <path d="M29 52 Q31 46 50 45 Q69 46 71 52 L76 116 Q50 124 24 116 Z" fill="url(#shade-cyl)" />
      <path d="M40 98 L36 116 M50 98 L50 120 M60 98 L64 116" stroke="#000" strokeOpacity={0.15} strokeWidth={1.4} />
      <rect x={29} y={86} width={42} height={6} rx={2} fill="url(#gem-topaz)" />
      {/* スカーフ */}
      <path d="M40 47 Q50 54 60 47 L58 53 Q50 58 42 53 Z" fill="#ffd23f" />
      <path d="M56 52 L60 66 L54 62 Z" fill="#f0a81c" />
      <Arm side="L" pose={pose} sleeve="url(#g-riko-dress)" long />
      <Arm side="R" pose={pose} sleeve="url(#g-riko-dress)" long />
      <Head><RikoArt bust={false} /></Head>
    </g>
  );
}

/** なかまキコ（7歳）: フードつきのマント・ラベンダーのワンピース・タイツ・ことばノート */
export function KikoStanding({ pose = "idle" }: { pose?: Pose }) {
  return (
    <g>
      <Floor rx={28} />
      <Legs pants="#2c1a5c" boot="url(#gem-amethyst)" />
      {/* マント（背中） */}
      <path d="M26 50 Q50 40 74 50 L84 128 Q50 136 16 128 Z" fill="#3a2270" />
      <path d="M26 50 Q50 40 74 50 L84 128 Q50 136 16 128 Z" fill="url(#shade-cyl)" />
      <Neck />
      <path d="M31 53 Q33 47 50 46 Q67 47 69 53 L73 118 Q50 126 27 118 Z" fill="url(#g-kiko-dress)" />
      <path d="M31 53 Q33 47 50 46 Q67 47 69 53 L73 118 Q50 126 27 118 Z" fill="url(#shade-cyl)" />
      <path d="M42 96 L38 118 M58 96 L62 118" stroke="#000" strokeOpacity={0.15} strokeWidth={1.4} />
      {/* マントの留め具 */}
      <circle cx={50} cy={52} r={3} fill="url(#gem-topaz)" />
      <path d="M38 50 Q50 56 62 50" stroke="#2a1660" strokeWidth={2.4} fill="none" />
      {/* ことばノート */}
      <g transform="rotate(-10 26 104)">
        <rect x={18} y={94} width={15} height={19} rx={2} fill="#7a3a12" />
        <rect x={20} y={96} width={11} height={15} rx={1.5} fill="#fff4d2" />
        <rect x={30} y={102} width={3} height={4} fill="url(#metal-gold)" />
      </g>
      <Arm side="L" pose={pose === "point" ? "idle" : pose} sleeve="url(#g-kiko-dress)" long />
      <Arm side="R" pose={pose} sleeve="url(#g-kiko-dress)" long />
      <Head><KikoArt bust={false} /></Head>
    </g>
  );
}

export function BirimoStanding({ mood = "happy" }: { mood?: Mood }) {
  return (
    <g>
      <Floor rx={24} />
      <g transform="translate(8 86) scale(0.84)"><BirimoArt mood={mood} /></g>
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

export const ART_LINE = LINE;
