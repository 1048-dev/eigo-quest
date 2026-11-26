"use client";
/**
 * うごく エマ先生（run8 P8）。TeacherArt と 同じ キャラクター（顔・髪・ジャケット・アーチ）を 部品で 組みなおし、
 *  - いき（からだが ゆっくり ふくらむ）・まばたき（CSS）
 *  - 口の 形（rest / a / e / o / u / m / f）を getViseme() で 毎フレーム 更新（その 部分だけ 再描画）
 *  - ジェスチャー（wave / point / nod / clap / think / open_hands / mime / talk / rest）
 *    うでは「ひじ」を 原点に した リグ（前腕 ＋ 上腕 ＋ 手）。ポーズの あいだは CSS の transition で なめらかに うごく
 * 座標は 200×200（TeacherArt と 同じ）。
 */
import { memo, useEffect, useState, type ReactNode } from "react";
import { Arch, EmmaBackHair, EmmaFace, EmmaSmile, EmmaTorso, OpenHand } from "@/components/characters/TeacherArt";
import { SmoothLimb, capsule } from "@/components/characters/parts";
import type { Viseme } from "@/lib/teacher/timeline";

export type EmmaGesture = "rest" | "talk" | "wave" | "point" | "nod" | "clap" | "think" | "open_hands" | "mime";

type HandKind = "open" | "point" | "edge";
interface ArmPose { x: number; y: number; a: number; u: number; h: number; hand: HandKind; anim?: string }

const FOREARM = 57;
const REST: ArmPose = { x: 184, y: 300, a: -4, u: 180, h: 10, hand: "open" };
const TALK: ArmPose = { x: 170, y: 212, a: -14, u: 175, h: 20, hand: "open" };

/** 向かって 右の うで（R）と 左の うで（L。左右反転して 同じ リグで かく） */
const POSES: Record<EmmaGesture, { r: ArmPose; l: ArmPose; tilt?: number; nod?: boolean; body?: string }> = {
  rest: { r: REST, l: REST },
  talk: { r: TALK, l: REST },
  wave: { r: { x: 170, y: 194, a: 10, u: 165, h: 0, hand: "open", anim: "emma-wave" }, l: REST, tilt: 3 },
  point: { r: { x: 157, y: 200, a: 26, u: 180, h: -4, hand: "point", anim: "emma-tap" }, l: REST, tilt: 2.5 },
  nod: { r: TALK, l: REST, nod: true },
  clap: { r: { x: 146, y: 214, a: -48, u: 170, h: 48, hand: "edge", anim: "emma-clap" }, l: { x: 146, y: 214, a: -48, u: 170, h: 48, hand: "edge", anim: "emma-clap" }, nod: true },
  think: { r: { x: 150, y: 197, a: -34, u: 172, h: -20, hand: "point" }, l: REST, tilt: -5 },
  open_hands: { r: { x: 170, y: 206, a: 12, u: 172, h: 22, hand: "open", anim: "emma-sway" }, l: { x: 170, y: 206, a: 12, u: 172, h: 22, hand: "open", anim: "emma-sway" } },
  mime: { r: { x: 168, y: 186, a: 6, u: 168, h: 6, hand: "open", anim: "emma-mime" }, l: { x: 168, y: 186, a: 6, u: 168, h: 6, hand: "open", anim: "emma-mime-alt" }, body: "emma-hop" },
};

const EASE = "transform 520ms cubic-bezier(.34,1.2,.5,1)";

/** 人さし指で さす 手（手首が 原点。指先は −y） */
function PointHand() {
  const parts = [
    "M-6.4 0 C-7.4 -4.6 -7.2 -9.6 -5.6 -12.8 Q0 -14.6 5.8 -12.6 C7.6 -9 7.6 -4.4 6.6 0 Q0 2.4 -6.4 0 Z",
    capsule([-3.2, -12.6], [-3.9, -29], 1.95, 1.65),
    capsule([0.6, -12.4], [1.6, -17.6], 2.2, 2),
    capsule([3.4, -11.8], [4.6, -16.2], 2.1, 1.9),
    capsule([5.6, -10.4], [6.6, -14], 1.9, 1.7),
    capsule([-6.1, -4.4], [-9.4, -11.4], 2.3, 1.8),
  ];
  return (
    <g>
      {parts.map((d, i) => <path key={i} d={d} fill="url(#g-skin)" />)}
      {parts.map((d, i) => <path key={`s${i}`} d={d} fill="url(#skin-shade)" />)}
      <path d="M-0.8 -14.2 Q2.6 -16.6 6 -13.6" stroke="#a24f34" strokeOpacity={0.4} strokeWidth={0.5} fill="none" strokeLinecap="round" />
      <ellipse cx={-3.9} cy={-27.6} rx={0.9} ry={1.2} fill="#fff" opacity={0.45} />
    </g>
  );
}

function Hand({ kind }: { kind: HandKind }) {
  const fade = (on: boolean) => ({ opacity: on ? 1 : 0, transition: "opacity 220ms ease" });
  return (
    <g>
      <g style={fade(kind === "open")}><OpenHand /></g>
      <g style={fade(kind === "point")}><PointHand /></g>
      {/* はくしゅ: てのひらを よこから 見た 形 */}
      <g style={fade(kind === "edge")} transform="scale(0.5 1)"><OpenHand /></g>
    </g>
  );
}

/** ひじが 原点の うで。outer の transform を CSS で うごかす */
const Arm = memo(function Arm({ p, delay = 0 }: { p: ArmPose; delay?: number }) {
  return (
    <g style={{ transform: `translate(${p.x}px, ${p.y}px) rotate(${p.a}deg)`, transition: EASE, transitionDelay: `${delay}ms` }}>
      <g className={p.anim} style={{ transformOrigin: "0 0" }}>
        {/* 上腕（ひじから かたへ。前腕に たいする 角度） */}
        <g style={{ transform: `rotate(${p.u - p.a - 180}deg)`, transition: EASE }}>
          <SmoothLimb pts={[[0, 2], [0, 28], [0, 56], [0, 90]]} radii={[11.4, 12.4, 13, 13.6]} fill="url(#g-emma-jacket)" gloss={0.1} />
        </g>
        {/* 前腕・そで口・手 */}
        <SmoothLimb pts={[[0, 6], [0, -16], [0, -36], [0, -FOREARM + 5]]} radii={[11.6, 10.8, 9.4, 8.4]} fill="url(#g-emma-jacket)" gloss={0.12} />
        <path d={capsule([0, -FOREARM + 5.4], [0, -FOREARM + 0.6], 8.2, 7.9)} fill="#f4efe6" />
        <path d={capsule([0, -FOREARM + 5.4], [0, -FOREARM + 0.6], 8.2, 7.9)} fill="url(#cloth-shade)" />
        <g transform={`translate(0 ${-FOREARM})`}>
          <g style={{ transform: `rotate(${p.h}deg)`, transition: EASE }}>
            <g className={p.anim ? `${p.anim}-hand` : undefined} style={{ transformOrigin: "0 0" }}>
              <Hand kind={p.hand} />
            </g>
          </g>
        </g>
      </g>
    </g>
  );
});

/** 口の 形（くちびるの 色は TeacherArt の ほほえみと 同じ） */
function MouthShape({ v }: { v: Viseme }) {
  if (v === "rest") return <EmmaSmile />;
  const lip = "#b8464f";
  const lower = "#cc5a64";
  const dark = "#5e1810";
  let inner: ReactNode;
  if (v === "a") {
    inner = (<>
      <path d="M-6 -0.5 Q0 -2.2 6 -0.5 Q4 4.6 0 5 Q-4 4.6 -6 -0.5 Z" fill={dark} />
      <path d="M-4.6 -0.4 Q0 -1.7 4.6 -0.4 L4.1 0.8 Q0 0 -4.1 0.8 Z" fill="#fffaf2" />
      <path d="M-2.8 3.6 Q0 2.2 2.8 3.6 Q0 4.8 -2.8 3.6 Z" fill="#d9555a" />
      <path d="M-6 -0.5 Q-3.2 -3.2 0 -2.2 Q3.2 -3.2 6 -0.5 Q0 -1.5 -6 -0.5 Z" fill={lip} />
      <path d="M-6 -0.5 Q-4 4.6 0 5 Q4 4.6 6 -0.5 Q3.8 6.6 0 6.7 Q-3.8 6.6 -6 -0.5 Z" fill={lower} />
    </>);
  } else if (v === "e") {
    inner = (<>
      <path d="M-7.2 -0.4 Q0 -1.8 7.2 -0.4 Q4 3.6 0 3.9 Q-4 3.6 -7.2 -0.4 Z" fill={dark} />
      <path d="M-5.8 -0.3 Q0 -1.4 5.8 -0.3 L5.2 0.9 Q0 0.2 -5.2 0.9 Z" fill="#fffaf2" />
      <path d="M-4 2.9 Q0 2.2 4 2.9 L3.4 3.5 Q0 3.2 -3.4 3.5 Z" fill="#f4ece2" />
      <path d="M-7.2 -0.4 Q-3.6 -3.2 0 -2.1 Q3.6 -3.2 7.2 -0.4 Q0 -1.4 -7.2 -0.4 Z" fill={lip} />
      <path d="M-7.2 -0.4 Q-4 3.6 0 3.9 Q4 3.6 7.2 -0.4 Q4 5.8 0 5.9 Q-4 5.8 -7.2 -0.4 Z" fill={lower} />
    </>);
  } else if (v === "o") {
    inner = (<>
      <ellipse cx={0} cy={1.6} rx={3.8} ry={4.4} fill={dark} />
      <path d="M-2.6 -1.4 Q0 -2.4 2.6 -1.4 L2.2 -0.4 Q0 -1 -2.2 -0.4 Z" fill="#fffaf2" />
      <ellipse cx={0} cy={1.6} rx={4.4} ry={5} fill="none" stroke={lip} strokeWidth={1.9} />
      <path d="M-3.6 4.6 Q0 7.8 3.6 4.6" stroke={lower} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </>);
  } else if (v === "u") {
    inner = (<>
      <ellipse cx={0} cy={1} rx={2.2} ry={2.4} fill={dark} />
      <ellipse cx={0} cy={1} rx={3.1} ry={3.3} fill="none" stroke={lip} strokeWidth={2.3} />
      <path d="M-2.4 3.6 Q0 5.6 2.4 3.6" stroke={lower} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </>);
  } else if (v === "m") {
    inner = (<>
      <path d="M-6.2 0.2 Q-3 -1.8 0 -1 Q3 -1.8 6.2 0.2 Q0 0.9 -6.2 0.2 Z" fill={lip} />
      <path d="M-6.2 0.2 Q0 0.9 6.2 0.2 Q3.4 3.4 0 3.4 Q-3.4 3.4 -6.2 0.2 Z" fill={lower} />
      <path d="M-6.2 0.2 Q0 1 6.2 0.2" stroke="#7a2228" strokeWidth={0.7} fill="none" strokeLinecap="round" />
    </>);
  } else {
    inner = (<>
      <path d="M-6.4 -0.4 Q0 -1.8 6.4 -0.4 Q0 2.4 -6.4 -0.4 Z" fill={dark} />
      <path d="M-5.2 -0.3 Q0 -1.4 5.2 -0.3 L4.8 1.3 Q0 0.8 -4.8 1.3 Z" fill="#fffaf2" />
      <path d="M-6.4 -0.4 Q-3.4 -3 0 -2 Q3.4 -3 6.4 -0.4 Q0 -1.4 -6.4 -0.4 Z" fill={lip} />
      <path d="M-5.6 1.4 Q0 0.6 5.6 1.4 Q3 4 0 4 Q-3 4 -5.6 1.4 Z" fill={lower} />
    </>);
  }
  return <g transform="translate(100 114.4) scale(1.25)">{inner}</g>;
}

/** 口だけ 自分の rAF で 更新（ほかの 部品は 再描画しない） */
function LiveMouth({ getViseme }: { getViseme?: () => Viseme }) {
  const [v, setV] = useState<Viseme>("rest");
  useEffect(() => {
    if (!getViseme) { setV("rest"); return; }
    let raf = 0;
    let last: Viseme = "rest";
    let lastAt = 0;
    const loop = (t: number) => {
      // 1 秒に 約 14 回まで（口が ちらつかない ように）
      if (t - lastAt > 70) {
        const n = getViseme();
        if (n !== last) { last = n; setV(n); lastAt = t; }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [getViseme]);
  return <MouthShape v={v} />;
}

const StaticHead = memo(function StaticHead() {
  return <EmmaFace blinkClass="emma-blink" />;
});
const StaticBack = memo(function StaticBack() {
  return (<><Arch /></>);
});

export function EmmaAnimated({ gesture, getViseme, label = "Ms. Emma" }: { gesture: EmmaGesture; getViseme?: () => Viseme; label?: string }) {
  const pose = POSES[gesture] ?? POSES.rest;
  const headStyle = { transform: `rotate(${pose.tilt ?? 0}deg)`, transformOrigin: "100px 132px", transition: EASE };
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={label} data-gesture={gesture}>
      <defs><clipPath id="emma-live-frame"><rect width={200} height={200} rx={6} /></clipPath></defs>
      <g clipPath="url(#emma-live-frame)">
        <StaticBack />
        <g filter="url(#f-rim)">
          <g className={`emma-breathe ${pose.body ?? ""}`} style={{ transformOrigin: "100px 200px" }}>
            <g style={headStyle}>
              <g className={pose.nod ? "emma-nod" : undefined} style={{ transformOrigin: "100px 132px" }}>
                <EmmaBackHair />
              </g>
            </g>
            <EmmaTorso />
            <g style={headStyle}>
              <g className={pose.nod ? "emma-nod" : undefined} style={{ transformOrigin: "100px 132px" }}>
                <StaticHead />
                <LiveMouth getViseme={getViseme} />
              </g>
            </g>
            <Arm p={pose.r} />
            <g transform="translate(200 0) scale(-1 1)"><Arm p={pose.l} delay={60} /></g>
          </g>
        </g>
      </g>
    </svg>
  );
}
