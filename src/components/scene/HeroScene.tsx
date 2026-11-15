/**
 * ページ上部の「冒険の一場面」バナー。
 * 空 → 遠くの遺跡 → ジャングルの丘 → 草地 の上に、ハル・リコ・キコ・ビリモとモンスターたちが並ぶ。
 * タイトルは手前のリボン（羊皮紙色）に置くので、絵がにぎやかでも文字は読みやすい。
 */
import { Standing, type Pose } from "@/components/characters/StandingArt";
import { MonsterArt } from "@/components/characters/MonsterArt";
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";
import { Bush, Flowers, JungleTree, Palm, RuinPillar } from "./SceneryArt";

export type HeroVariant = "map" | "dashboard" | "arena" | "gacha" | "ranking";

interface Cast { kind: "char"; id: CharacterId; x: number; s: number; pose?: Pose; mood?: Mood; flip?: boolean }
interface Mon { kind: "mon"; id: string; x: number; s: number; flip?: boolean; letter?: string }

const CASTS: Record<HeroVariant, (Cast | Mon)[]> = {
  map: [
    { kind: "mon", id: "m-sammy-snake", x: 14, s: 0.55 },
    { kind: "char", id: "riko", x: 92, s: 0.62, pose: "wave" },
    { kind: "char", id: "haru", x: 150, s: 0.72, pose: "point" },
    { kind: "char", id: "kiko", x: 208, s: 0.6, pose: "cheer" },
    { kind: "char", id: "birimo", x: 258, s: 0.5, mood: "excited" },
    { kind: "mon", id: "m-tiger-tap", x: 312, s: 0.55, flip: true },
  ],
  dashboard: [
    { kind: "mon", id: "m-penguin-pop", x: 18, s: 0.5 },
    { kind: "char", id: "kiko", x: 82, s: 0.62, pose: "wave" },
    { kind: "char", id: "haru", x: 140, s: 0.72, pose: "cheer" },
    { kind: "char", id: "riko", x: 200, s: 0.62, pose: "idle", flip: true },
    { kind: "char", id: "birimo", x: 254, s: 0.5, mood: "happy" },
    { kind: "mon", id: "m-magic-e-fairy", x: 312, s: 0.5, flip: true },
  ],
  arena: [
    { kind: "char", id: "haru", x: 30, s: 0.72, pose: "point" },
    { kind: "char", id: "birimo", x: 96, s: 0.5, mood: "excited" },
    { kind: "mon", id: "m-ant-anty", x: 196, s: 0.55, flip: true },
    { kind: "mon", id: "m-shhh-ghost", x: 252, s: 0.55, flip: true },
    { kind: "mon", id: "m-alpha-dragon", x: 316, s: 0.68, flip: true },
  ],
  gacha: [
    { kind: "char", id: "kiko", x: 40, s: 0.62, pose: "cheer" },
    { kind: "mon", id: "m-slime-a", x: 110, s: 0.45, letter: "A" },
    { kind: "mon", id: "m-magic-e-fairy", x: 176, s: 0.55 },
    { kind: "mon", id: "m-slime-b", x: 242, s: 0.45, letter: "B" },
    { kind: "char", id: "birimo", x: 306, s: 0.5, mood: "excited" },
  ],
  ranking: [
    { kind: "char", id: "riko", x: 46, s: 0.62, pose: "cheer" },
    { kind: "char", id: "haru", x: 180, s: 0.76, pose: "cheer" },
    { kind: "char", id: "kiko", x: 314, s: 0.62, pose: "cheer", flip: true },
    { kind: "char", id: "birimo", x: 240, s: 0.45, mood: "excited" },
    { kind: "mon", id: "m-penguin-pop", x: 112, s: 0.45 },
  ],
};

const W = 360;
const H = 200;
const GROUND = 176;

export function HeroScene({ title, subtitle, variant = "map" }: { title: string; subtitle?: string; variant?: HeroVariant }) {
  return (
    <header className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-[24px] sm:border-4 sm:border-[var(--gold)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`${title}：ハルたちとモンスターが冒険している場面`}>
        <defs>
          <linearGradient id={`sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8fd3ff" /><stop offset="55%" stopColor="#d9f3ff" /><stop offset="100%" stopColor="#fff3c9" />
          </linearGradient>
          <radialGradient id={`sun-${variant}`} cx="80%" cy="18%" r="40%">
            <stop offset="0%" stopColor="#fff7c2" stopOpacity="1" /><stop offset="100%" stopColor="#fff7c2" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#sky-${variant})`} />
        <rect width={W} height={H} fill={`url(#sun-${variant})`} />
        {/* 遠くの遺跡と山 */}
        <path d={`M0 120 L40 92 L80 112 L130 78 L170 104 L220 84 L270 108 L320 80 L360 100 L360 ${H} L0 ${H} Z`} fill="#9ccfb0" opacity={0.8} />
        <g transform="translate(250 104)" opacity={0.75}>
          <path d="M-34 0 L-34 -28 L0 -50 L34 -28 L34 0 Z" fill="#c9b48a" stroke="rgba(43,34,22,.35)" strokeWidth={1.5} />
          <rect x={-8} y={-18} width={16} height={18} fill="#8a7550" />
        </g>
        {/* ジャングルの丘 */}
        <path d={`M0 146 Q60 120 120 140 Q190 160 250 132 Q310 112 360 138 L360 ${H} L0 ${H} Z`} fill="#4fae66" />
        <g transform="translate(28 150)"><JungleTree s={0.55} tone={0} /></g>
        <g transform="translate(330 146)"><Palm s={0.62} /></g>
        <g transform="translate(120 140)"><RuinPillar s={0.5} broken /></g>
        <g transform="translate(290 140)"><JungleTree s={0.42} tone={2} /></g>
        {/* 手前の草地 */}
        <path d={`M0 ${GROUND - 10} Q90 ${GROUND - 20} 180 ${GROUND - 10} Q270 ${GROUND} 360 ${GROUND - 14} L360 ${H} L0 ${H} Z`} fill="#6cc779" />
        <g transform={`translate(64 ${GROUND + 6})`}><Bush s={0.6} /></g>
        <g transform={`translate(232 ${GROUND + 8})`}><Flowers s={0.9} /></g>
        <g transform={`translate(346 ${GROUND + 10})`}><Flowers s={0.8} /></g>

        {/* キャラクターとモンスター */}
        {CASTS[variant].map((c, i) => {
          if (c.kind === "char") {
            const h = 170 * c.s;
            return (
              <g key={i} transform={`translate(${c.x - 50 * c.s} ${GROUND - h + 6})`}>
                <g transform={`scale(${c.s})${c.flip ? " translate(100 0) scale(-1 1)" : ""}`}><Standing id={c.id} pose={c.pose} mood={c.mood} /></g>
              </g>
            );
          }
          const h = 100 * c.s;
          return (
            <g key={i} transform={`translate(${c.x - 50 * c.s} ${GROUND - h + 4})`}>
              <g transform={`scale(${c.s})${c.flip ? " translate(100 0) scale(-1 1)" : ""}`}><MonsterArt id={c.id} letter={c.letter} flip={c.flip} /></g>
            </g>
          );
        })}
      </svg>
      {/* タイトルのリボン（絵の上にかぶせても読める羊皮紙色） */}
      <div className="absolute inset-x-0 top-2 flex justify-center px-4">
        <div className="rounded-2xl border-[3px] border-[var(--gold-dark)] bg-[var(--surface)]/95 px-5 py-1.5 text-center shadow-[0_4px_0_var(--gold-deep)]">
          <h1 className="font-title text-xl text-[var(--ink)]">{title}</h1>
          {subtitle && <p className="text-[11px] font-bold text-[var(--ink-2)]">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
