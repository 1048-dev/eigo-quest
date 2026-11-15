/**
 * 画面全体の背景（固定）。ドット柄をやめ、ジャングルの丘・遺跡・木々を重ねたイラスト背景にする。
 * 広い画面（lg以上）では、中央のカラムの左右にキャラクターとモンスターの立ち絵が並ぶ。
 */
import { StandingFigure } from "@/components/characters/StandingArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { JungleTree, Palm, RuinPillar } from "./SceneryArt";

export function FieldBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#123a28" /><stop offset="45%" stopColor="#1f5a3a" /><stop offset="100%" stopColor="#4a3a24" />
          </linearGradient>
          <radialGradient id="bd-light" cx="20%" cy="8%" r="55%">
            <stop offset="0%" stopColor="#ffe9a8" stopOpacity=".45" /><stop offset="100%" stopColor="#ffe9a8" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="800" fill="url(#bd-sky)" />
        <rect width="400" height="800" fill="url(#bd-light)" />
        {/* 光の筋 */}
        {[40, 110, 190].map((x, i) => <path key={x} d={`M${x} 0 L${x + 60} 0 L${x + 160} 800 L${x + 90} 800 Z`} fill="#fff6d0" opacity={0.05 + i * 0.01} />)}
        {/* 奥の丘 */}
        <path d="M0 520 Q100 470 200 510 Q300 550 400 500 L400 800 L0 800 Z" fill="#245c3c" opacity={0.85} />
        <path d="M0 640 Q120 600 220 640 Q320 680 400 630 L400 800 L0 800 Z" fill="#2c6b45" />
        <g opacity={0.55}>
          <g transform="translate(40 540)"><JungleTree s={1.1} tone={2} /></g>
          <g transform="translate(360 520)"><Palm s={1.2} /></g>
          <g transform="translate(300 640)"><RuinPillar s={1.1} broken /></g>
          <g transform="translate(90 690)"><RuinPillar s={0.9} /></g>
        </g>
      </svg>
      {/* 広い画面では左右の余白にキャラクターが立つ */}
      <div className="absolute inset-y-0 left-0 hidden w-[calc((100vw-48rem)/2)] items-end justify-center gap-2 pb-28 lg:flex">
        <StandingFigure id="riko" pose="wave" height={190} />
        <MonsterFigure id="m-sammy-snake" size={96} />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[calc((100vw-48rem)/2)] items-end justify-center gap-2 pb-28 lg:flex">
        <MonsterFigure id="m-tiger-tap" size={96} flip />
        <StandingFigure id="kiko" pose="cheer" height={180} />
      </div>
      <div className="absolute left-0 top-24 hidden w-[calc((100vw-48rem)/2)] justify-center lg:flex">
        <MonsterFigure id="m-shhh-ghost" size={90} className="bob" />
      </div>
      <div className="absolute right-0 top-32 hidden w-[calc((100vw-48rem)/2)] justify-center lg:flex">
        <MonsterFigure id="m-magic-e-fairy" size={90} className="bob" />
      </div>
    </div>
  );
}
