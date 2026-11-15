/**
 * 画面全体の背景（固定）。夜明け前のジャングルの奥に眠る古代遺跡。
 * 巨大な古代樹・神殿の光・ゴッドレイ・霧・光の粒を重ね、パネルはガラス越しにこの景色が透けて見える。
 * 広い画面（lg以上）では、中央の左右にキャラクターとモンスターが逆光の中に立つ。
 */
import { StandingFigure } from "@/components/characters/StandingArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { AncientTree, At, Fern, Fog, GodRays, Motes, RuinRelief, TempleGate } from "./CinematicScenery";

export function FieldBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06121a" /><stop offset="35%" stopColor="#0d2b2c" /><stop offset="70%" stopColor="#173c2c" /><stop offset="100%" stopColor="#24190e" />
          </linearGradient>
          <radialGradient id="bd-glow" cx="50%" cy="34%" r="45%">
            <stop offset="0%" stopColor="#f2c46a" stopOpacity=".38" /><stop offset="100%" stopColor="#f2c46a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="800" fill="url(#bd-sky)" />
        <rect width="400" height="800" fill="url(#bd-glow)" />
        <At x={200} y={360} filter="url(#f-dof-2)" opacity={0.7}><TempleGate s={1.5} /></At>
        <GodRays x={70} w={260} h={800} count={6} opacity={0.1} />
        <At x={40} y={520} opacity={0.85}><AncientTree s={2.1} depth="far" seed={1} /></At>
        <At x={370} y={500} opacity={0.85}><AncientTree s={2.3} depth="far" seed={4} /></At>
        <Fog y={430} w={400} opacity={0.18} />
        <At x={90} y={700} opacity={0.75}><RuinRelief w={150} h={110} glyphs={["A", "B", "C"]} /></At>
        <At x={320} y={720} opacity={0.75}><RuinRelief w={140} h={96} glyphs={["X", "Y"]} /></At>
        <At x={0} y={820}><AncientTree s={1.4} depth="near" seed={2} /></At>
        <At x={410} y={830}><AncientTree s={1.3} depth="near" seed={6} /></At>
        <At x={-20} y={800}><Fern s={1.6} /></At>
        <At x={420} y={800}><Fern s={1.5} flip /></At>
        <Fog y={680} w={400} opacity={0.22} />
        <Motes w={400} h={760} n={26} seed={3} />
      </svg>
      {/* 広い画面: 左右の余白にキャラクター（奥のモンスターはぼかして奥行きを出す） */}
      <div className="absolute inset-y-0 left-0 hidden w-[calc((100vw-48rem)/2)] items-end justify-center gap-2 pb-28 lg:flex">
        <StandingFigure id="riko" pose="wave" height={220} />
        <MonsterFigure id="m-sammy-snake" size={110} />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[calc((100vw-48rem)/2)] items-end justify-center gap-2 pb-28 lg:flex">
        <MonsterFigure id="m-tiger-tap" size={110} flip />
        <StandingFigure id="kiko" pose="cheer" height={210} />
      </div>
      <div className="absolute left-0 top-28 hidden w-[calc((100vw-48rem)/2)] justify-center opacity-80 blur-[1.5px] lg:flex">
        <MonsterFigure id="m-shhh-ghost" size={100} className="float-slow" />
      </div>
      <div className="absolute right-0 top-40 hidden w-[calc((100vw-48rem)/2)] justify-center opacity-80 blur-[1.5px] lg:flex">
        <MonsterFigure id="m-magic-e-fairy" size={100} className="float-slow" />
      </div>
    </div>
  );
}
