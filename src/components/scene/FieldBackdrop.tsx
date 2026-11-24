/**
 * 画面全体の背景（固定）。夜明け前のジャングルの奥に眠る古代遺跡。
 * 巨大な古代樹・神殿の光・ゴッドレイ・霧・光の粒を重ね、パネルはガラス越しにこの景色が透けて見える。
 * 広い画面（lg以上）では、中央の左右にキャラクターとモンスターが逆光の中に立つ。
 */
import { StandingFigure } from "@/components/characters/StandingArt";
import { MonsterFigure } from "@/components/characters/MonsterArt";
import { AncientTree, At, ColorGrade, Fern, Flagstones, Fog, GodRays, Motes, Mountains, RuinRelief, TempleGate } from "./CinematicScenery";

export function FieldBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/*
        横長（1200×900）の 1枚絵を slice で しきつめる。スマホ（たて長）では まんなかの 約420幅（神殿）だけが、
        広い 画面では 左右の 森・遺跡・山なみまで 見える。以前の たて長 400×800 は 広い 画面で 3倍以上に 拡大されて ぼやけていた。
      */}
      <svg viewBox="0 0 1200 900" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="bd-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06121a" /><stop offset="30%" stopColor="#0d2b2c" /><stop offset="55%" stopColor="#1d4a46" /><stop offset="66%" stopColor="#173c2c" /><stop offset="100%" stopColor="#1c140b" />
          </linearGradient>
          <radialGradient id="bd-glow" cx="50%" cy="50%" r="34%">
            <stop offset="0%" stopColor="#f2c46a" stopOpacity=".55" /><stop offset="100%" stopColor="#f2c46a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bd-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3a3222" /><stop offset="100%" stopColor="#120e08" />
          </linearGradient>
        </defs>
        <rect width="1200" height="900" fill="url(#bd-sky)" />
        <circle cx={860} cy={150} r={60} fill="#ffe9b0" opacity={0.22} filter="url(#f-glow-soft)" />
        <circle cx={860} cy={150} r={15} fill="#fff6dc" />
        <circle cx={855} cy={146} r={4} fill="#f0dca8" opacity={0.6} />
        <At x={0} y={560} opacity={0.9}><Mountains w={1200} h={190} seed={7} layers={3} /></At>
        <rect width="1200" height="900" fill="url(#bd-glow)" />
        <At x={600} y={560} filter="url(#f-dof-1)" opacity={0.85}><TempleGate s={2.1} /></At>
        <GodRays x={360} w={480} h={900} count={7} opacity={0.1} />
        <Fog y={540} w={1200} opacity={0.2} />
        {/* 広場（石だたみ） */}
        <path d="M0 600 Q600 560 1200 600 L1200 900 L0 900 Z" fill="url(#bd-ground)" />
        <At x={600} y={585}><Flagstones w={1200} h={315} opacity={0.3} /></At>
        <ellipse cx={600} cy={610} rx={260} ry={30} fill="#ffd98a" opacity={0.12} filter="url(#f-glow-soft)" />
        {/* 奥の 古代樹（画面の 左右） */}
        <At x={150} y={640} opacity={0.9}><AncientTree s={2.4} depth="far" seed={1} /></At>
        <At x={1060} y={630} opacity={0.9}><AncientTree s={2.5} depth="far" seed={4} /></At>
        <At x={330} y={640} opacity={0.8}><AncientTree s={1.25} depth="far" seed={8} /></At>
        <At x={880} y={640} opacity={0.8}><AncientTree s={1.3} depth="far" seed={9} /></At>
        {/* 中景の 遺跡の かべ */}
        <At x={270} y={760} opacity={0.85}><RuinRelief w={170} h={110} glyphs={["A", "B", "C"]} /></At>
        <At x={940} y={770} opacity={0.85}><RuinRelief w={160} h={100} glyphs={["X", "Y"]} /></At>
        {/* 手前の 古代樹・シダ（ぼかして 被写界深度） */}
        <At x={-40} y={960}><AncientTree s={2.2} depth="near" seed={2} /></At>
        <At x={1250} y={970}><AncientTree s={2.1} depth="near" seed={6} /></At>
        <At x={380} y={920}><Fern s={1.6} /></At>
        <At x={820} y={920}><Fern s={1.5} flip /></At>
        <Fog y={800} w={1200} opacity={0.18} />
        <Motes w={1200} h={860} n={34} seed={3} />
        <ColorGrade w={1200} h={900} />
      </svg>
      {/* 広い画面: 左右の余白にキャラクター（奥のモンスターはぼかして奥行きを出す） */}
      <div className="absolute inset-y-0 left-0 hidden w-[calc((100vw-48rem)/2)] items-end justify-center gap-2 pb-28 lg:flex">
        <StandingFigure id="riko" pose="wave" height={220} />
        <MonsterFigure id="mon-044" size={110} />
      </div>
      <div className="absolute inset-y-0 right-0 hidden w-[calc((100vw-48rem)/2)] items-end justify-center gap-2 pb-28 lg:flex">
        <MonsterFigure id="mon-091" size={110} flip />
        <StandingFigure id="kiko" pose="cheer" height={210} />
      </div>
      <div className="absolute left-0 top-28 hidden w-[calc((100vw-48rem)/2)] justify-center opacity-80 blur-[1.5px] lg:flex">
        <MonsterFigure id="mon-056" size={100} className="float-slow" />
      </div>
      <div className="absolute right-0 top-40 hidden w-[calc((100vw-48rem)/2)] justify-center opacity-80 blur-[1.5px] lg:flex">
        <MonsterFigure id="mon-055" size={100} className="float-slow" />
      </div>
    </div>
  );
}
