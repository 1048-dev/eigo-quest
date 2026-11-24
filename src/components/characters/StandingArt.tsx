/**
 * キャラクターの全身「立ち絵」（オリジナル・3DCGアニメ映画風）。座標系は 100×170、床は y=166。
 *
 * 年齢どおりの頭身（ちびキャラにしない）:
 *   ハル10歳 ≒ 6頭身 / リコ8歳 ≒ 5.6頭身 / キコ7歳 ≒ 5.3頭身。
 *   どのキャラも箱いっぱい（同じ高さ）に描くので、並べるときの身長差は置く側の scale で付ける
 *   （目安: リコ = ハル×0.92、キコ = ハル×0.88）。
 * 手足は先が細くなる円柱（影・つや・逆光つき）、服は布のしわ・すその波、足もとに接地影。
 * ポーズ: idle（気をつけ）/ wave（手をふる）/ point（前を指さす）/ cheer（ばんざい）
 */
import { BirimoArt, FACE_GEO, HaruArt, KikoArt, RikoArt } from "./CharacterArt";
import { Folds, Limb, capsule, type Pt } from "./parts";
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";
import { RENDERED_STANDING } from "@/lib/art/renderedArt";

export type Pose = "idle" | "wave" | "point" | "cheer";

const LINE = "#2a170a";
const FLOOR = 166;

const f = (n: number) => Math.round(n * 100) / 100;

/** 体の骨組み（キャラごとの頭身・肩幅・関節の位置） */
interface Rig {
  head: number; // 顔イラスト（100×100）の縮尺
  chin: number;
  neckHW: number;
  shY: number;
  shX: number;
  chestY: number;
  waistY: number;
  waistX: number;
  hipX: number;
  crotchY: number;
  kneeY: number;
  ankleY: number;
  legX: number;
  upper: number;
  fore: number;
  armR: [number, number, number]; // 肩・ひじ・手首の半径
  legR: [number, number, number, number]; // ももの付け根・ひざ・ふくらはぎ・足首
  hand: number;
}

const RIG: Record<"haru" | "riko" | "kiko", Rig> = {
  haru: { head: 0.44, chin: 38, neckHW: 3.6, shY: 45.5, shX: 16, chestY: 60, waistY: 82, waistX: 12.2, hipX: 13.6, crotchY: 92, kneeY: 128, ankleY: 158, legX: 6.6, upper: 27, fore: 23.5, armR: [3.9, 3.2, 2.5], legR: [5.7, 4.1, 4.5, 2.9], hand: 1 },
  riko: { head: 0.494, chin: 41, neckHW: 3.4, shY: 48.5, shX: 15, chestY: 62, waistY: 84, waistX: 11.5, hipX: 13.4, crotchY: 94.5, kneeY: 129, ankleY: 158.5, legX: 6.4, upper: 26, fore: 22.5, armR: [3.7, 3, 2.4], legR: [5.4, 4, 4.3, 2.8], hand: 0.96 },
  kiko: { head: 0.539, chin: 43, neckHW: 3.4, shY: 50.5, shX: 14.5, chestY: 64, waistY: 86, waistX: 11.8, hipX: 13.4, crotchY: 96.5, kneeY: 130, ankleY: 158.5, legX: 6.4, upper: 25, fore: 21.5, armR: [3.7, 3, 2.45], legR: [5.5, 4.1, 4.4, 2.9], hand: 0.94 },
};

// ---------------------------------------------------------------------------
// 腕
// ---------------------------------------------------------------------------

/** [上腕の角度, 前腕の角度, 長さの倍率]。角度は真下=0°、外側に開くほど＋、真上=180°。倍率<1 は手前に出した腕の遠近（短く見える） */
type ArmDef = [number, number, number];
const ARMS: Record<Pose, { L: ArmDef; R: ArmDef }> = {
  idle: { L: [9, 4, 1], R: [9, 4, 1] },
  wave: { L: [9, 4, 1], R: [105, 170, 1] },
  point: { L: [9, 4, 1], R: [62, 78, 0.68] },
  cheer: { L: [140, 158, 0.9], R: [140, 158, 0.9] },
};

type HandKind = "relaxed" | "point" | "open" | "fist";

interface ArmGeo { sh: Pt; el: Pt; wr: Pt; dir: Pt; side: 1 | -1; kind: HandKind }

function armGeo(r: Rig, side: 1 | -1, def: ArmDef, kind: HandKind): ArmGeo {
  const [a, b, k] = def;
  const rad = Math.PI / 180;
  const sh: Pt = [50 + side * (r.shX - 3.2), r.shY + 3];
  const d1: Pt = [side * Math.sin(a * rad), Math.cos(a * rad)];
  const el: Pt = [sh[0] + d1[0] * r.upper * k, sh[1] + d1[1] * r.upper * k];
  const dir: Pt = [side * Math.sin(b * rad), Math.cos(b * rad)];
  const wr: Pt = [el[0] + dir[0] * r.fore * k, el[1] + dir[1] * r.fore * k];
  return { sh, el, wr, dir, side, kind };
}

function arms(r: Rig, pose: Pose): { L: ArmGeo; R: ArmGeo } {
  const p = ARMS[pose];
  const kindR: HandKind = pose === "wave" ? "open" : pose === "point" ? "point" : pose === "cheer" ? "fist" : "relaxed";
  return { L: armGeo(r, -1, p.L, pose === "cheer" ? "fist" : "relaxed"), R: armGeo(r, 1, p.R, kindR) };
}

const SKIN_DARK = "#b5664a";

/** 手（手首から指先へ +y 方向に描き、腕の向きに回す） */
function Hand({ g, k = 1 }: { g: ArmGeo; k?: number }) {
  const rot = (Math.atan2(g.dir[1], g.dir[0]) * 180) / Math.PI - 90;
  const parts: string[] = [];
  const palm = "M-3 0.4 C-3.4 3 -3.2 6 -2.2 7.6 C-1 8.6 1.2 8.6 2.4 7.6 C3.3 6 3.4 3 3 0.4 Z";
  let lines: string | null = null;
  if (g.kind === "fist") {
    parts.push("M-3.2 0.4 C-3.8 3 -3.6 7 -1.6 8.4 C0 9.2 2 9 3 7.8 C3.8 6 3.7 2.6 3.2 0.4 Z");
    parts.push(capsule([-2.4, 2.4], [-0.6, 6.4], 1.15, 1));
    lines = "M-2.4 7.6 Q0 8.4 2.6 7.2 M-1 5 L-1 8.4 M1 5 L1 8.6";
  } else if (g.kind === "point") {
    parts.push("M-3 0.4 C-3.4 3 -3.2 6 -1.8 7.2 C-0.6 8 1.4 8 2.6 7 C3.3 5.6 3.4 3 3 0.4 Z");
    parts.push(capsule([1.4, 6.2], [1.7, 13.2], 1.15, 0.95));
    parts.push(capsule([-2.3, 2.2], [-1.2, 6.6], 1.15, 1));
    lines = "M-2 6.6 Q0 7.6 1 7.2";
  } else if (g.kind === "open") {
    parts.push(palm);
    [[-2.2, -14, 4.4], [-0.75, -5, 5.2], [0.75, 4, 5], [2.2, 13, 4.2]].forEach(([x, ang, len]) => {
      const t = (ang * Math.PI) / 180;
      parts.push(capsule([x, 7], [x + Math.sin(t) * len, 7 + Math.cos(t) * len], 0.95, 0.8));
    });
    parts.push(capsule([-2.6, 2.6], [-5.8, 5.4], 1.15, 0.95));
  } else {
    parts.push(palm);
    parts.push("M-2.5 7 C-2.5 9.4 -1 10.6 0.2 10.4 C1.6 10.2 2.6 9 2.4 7 Z");
    parts.push(capsule([-2.3, 2], [-3.3, 6.2], 1.15, 1));
    lines = "M-0.8 8.2 L-0.8 10.2 M0.8 8.2 L0.9 10.1";
  }
  return (
    <g transform={`translate(${f(g.wr[0])} ${f(g.wr[1])}) rotate(${f(rot)}) scale(${g.side * k} ${k})`}>
      {parts.map((d, i) => <path key={i} d={d} fill="url(#g-skin)" />)}
      {parts.map((d, i) => <path key={`s${i}`} d={d} fill="url(#skin-shade)" />)}
      {lines && <path d={lines} stroke={SKIN_DARK} strokeOpacity={0.45} strokeWidth={0.45} fill="none" strokeLinecap="round" />}
    </g>
  );
}

/** そで（上腕・前腕）＋手。rolled=true は半そで（ひじでまくったそで口・前腕は素肌） */
function Arm({ g, r, sleeve, cuff, rolled = false }: { g: ArmGeo; r: Rig; sleeve: string; cuff?: string; rolled?: boolean }) {
  const [rs, re, rw] = r.armR;
  const u: Pt = [(g.el[0] - g.sh[0]) / r.upper, (g.el[1] - g.sh[1]) / r.upper];
  const cuffA: Pt = [g.el[0] - u[0] * 4, g.el[1] - u[1] * 4];
  const wristIn: Pt = [g.wr[0] - g.dir[0] * 1.2, g.wr[1] - g.dir[1] * 1.2];
  return (
    <g>
      {rolled ? (
        <>
          <Limb a={g.el} b={g.wr} ra={re - 0.2} rb={rw} fill="url(#g-skin)" gloss={0.14} />
          <Limb a={g.sh} b={g.el} ra={rs + 0.9} rb={re + 0.9} fill={sleeve} />
          <Limb a={cuffA} b={g.el} ra={re + 1.5} rb={re + 1.5} fill={cuff ?? sleeve} gloss={0.26} />
        </>
      ) : (
        <>
          <Limb a={g.el} b={wristIn} ra={re + 0.6} rb={rw + 0.9} fill={sleeve} />
          <Limb a={g.sh} b={g.el} ra={rs + 0.9} rb={re + 0.7} fill={sleeve} />
          <path d={`M${f(g.el[0] - 1.6)} ${f(g.el[1] - 1)} q1.6 1.4 3.2 0`} stroke="#1a0a04" strokeOpacity={0.25} strokeWidth={0.8} fill="none" />
          {cuff && <Limb a={[wristIn[0] - g.dir[0] * 2.2, wristIn[1] - g.dir[1] * 2.2]} b={wristIn} ra={rw + 1.2} rb={rw + 1.2} fill={cuff} gloss={0.24} />}
        </>
      )}
      <Hand g={g} k={r.hand} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 胴・脚・足
// ---------------------------------------------------------------------------

/** 胴体（肩→胸→腰→すそ）。flare>0 でスカートのように広がり、waves 本のすその波をつける */
function torsoPath(r: Rig, hemY: number, hemX: number, waves = 0): string {
  const c = 50, n = r.neckHW + 1.2;
  let hem = `L${f(c - hemX)} ${f(hemY)} Q${c} ${f(hemY + 3)} ${f(c + hemX)} ${f(hemY)}`;
  if (waves > 0) {
    const w = (2 * hemX) / waves;
    hem = `C${f(c - r.waistX - 1)} ${f(r.waistY + 7)} ${f(c - hemX + 1.5)} ${f(hemY - 9)} ${f(c - hemX)} ${f(hemY)}`;
    for (let i = 0; i < waves; i++) {
      const x0 = c - hemX + w * i;
      hem += ` Q${f(x0 + w / 2)} ${f(hemY + (i % 2 ? -1.6 : 3.2))} ${f(x0 + w)} ${f(hemY)}`;
    }
    hem += ` C${f(c + hemX - 1.5)} ${f(hemY - 9)} ${f(c + r.waistX + 1)} ${f(r.waistY + 7)} ${f(c + r.waistX)} ${f(r.waistY)}`;
  } else {
    hem += ` L${f(c + r.waistX)} ${f(r.waistY)}`;
  }
  return `M${f(c - n)} ${f(r.shY - 3.5)} C${f(c - n - 4)} ${f(r.shY - 2.5)} ${f(c - r.shX + 3)} ${f(r.shY - 1.5)} ${f(c - r.shX)} ${f(r.shY + 2.5)} C${f(c - r.shX - 1.2)} ${f(r.shY + 9)} ${f(c - r.waistX - 1.5)} ${f(r.chestY + 6)} ${f(c - r.waistX)} ${f(r.waistY)} ${hem} C${f(c + r.waistX + 1.5)} ${f(r.chestY + 6)} ${f(c + r.shX + 1.2)} ${f(r.shY + 9)} ${f(c + r.shX)} ${f(r.shY + 2.5)} C${f(c + r.shX - 3)} ${f(r.shY - 1.5)} ${f(c + n + 4)} ${f(r.shY - 2.5)} ${f(c + n)} ${f(r.shY - 3.5)} Q${c} ${f(r.shY + 2.5)} ${f(c - n)} ${f(r.shY - 3.5)} Z`;
}

/** 布の形に陰影を重ねる（上からの光・円柱の陰・右ふちの逆光） */
function Cloth({ d, fill }: { d: string; fill: string }) {
  return (
    <g>
      <path d={d} fill={fill} />
      <path d={d} fill="url(#shade-cyl)" opacity={0.8} />
      <path d={d} fill="url(#cloth-shade)" />
      <path d={d} fill="url(#rim-cool)" />
    </g>
  );
}

function Leg({ r, s, fill }: { r: Rig; s: 1 | -1; fill: string }) {
  const x = 50 + s * r.legX;
  const [rt, rk, rc, ra] = r.legR;
  const hip: Pt = [50 + s * (r.legX - 0.6), r.crotchY - 5];
  const knee: Pt = [x + s * 0.3, r.kneeY];
  const calf: Pt = [x + s * 0.4, r.kneeY + 9];
  const ankle: Pt = [x, r.ankleY];
  return (
    <g>
      <Limb a={hip} b={knee} ra={rt} rb={rk} fill={fill} />
      <Limb a={knee} b={calf} ra={rk} rb={rc} fill={fill} />
      <Limb a={calf} b={ankle} ra={rc} rb={ra} fill={fill} />
      <ellipse cx={knee[0] - 0.8} cy={knee[1] - 0.5} rx={1.8} ry={1.2} fill="#fff" opacity={0.18} />
    </g>
  );
}

/** くつ（正面から）。shaft>0 でブーツの筒の高さ */
function Shoe({ x, y, fill, shaft = 0, laces = false, strap = false }: { x: number; y: number; fill: string; shaft?: number; laces?: boolean; strap?: boolean }) {
  const body = `M${x - 4.4} ${y - 1} C${x - 4.8} ${y + 3} ${x - 6.4} ${y + 5} ${x - 6.2} ${y + 7.2} Q${x} ${y + 9} ${x + 6.2} ${y + 7.2} C${x + 6.4} ${y + 5} ${x + 4.8} ${y + 3} ${x + 4.4} ${y - 1} Z`;
  return (
    <g>
      <ellipse cx={x} cy={FLOOR + 0.6} rx={7.6} ry={1.9} fill="url(#ao-contact)" />
      {shaft > 0 && <Limb a={[x, y - shaft]} b={[x, y + 1]} ra={4.7} rb={4.5} fill={fill} gloss={0.22} />}
      {shaft > 0 && <ellipse cx={x} cy={y - shaft} rx={5.2} ry={1.6} fill={fill} />}
      {shaft > 0 && <ellipse cx={x} cy={y - shaft} rx={5.2} ry={1.6} fill="#fff" opacity={0.14} />}
      <path d={body} fill={fill} />
      <path d={body} fill="url(#shade-sphere)" opacity={0.7} />
      <path d={`M${x - 6.2} ${y + 7.2} Q${x} ${y + 9} ${x + 6.2} ${y + 7.2} L${x + 6.2} ${y + 8.1} Q${x} ${y + 9.9} ${x - 6.2} ${y + 8.1} Z`} fill="#22120a" />
      <ellipse cx={x - 1.8} cy={y + 4.8} rx={2} ry={1.1} fill="#fff" opacity={0.3} />
      {laces && <path d={`M${x - 2} ${y + 0.5} L${x + 2} ${y + 1.8} M${x + 2} ${y + 0.5} L${x - 2} ${y + 1.8} M${x - 2} ${y + 2.6} L${x + 2} ${y + 3.8}`} stroke="#f4e6c8" strokeWidth={0.6} strokeLinecap="round" />}
      {strap && <path d={`M${x - 4.6} ${y + 2.4} Q${x} ${y + 3.6} ${x + 4.6} ${y + 2.4}`} stroke="#1e0b3c" strokeWidth={1.1} fill="none" />}
      {strap && <circle cx={x + 3.4} cy={y + 2.8} r={0.7} fill="url(#metal-gold)" />}
    </g>
  );
}

/** 足もとの影（アンビエントオクルージョン風） */
const Floor = ({ rx = 26 }: { rx?: number }) => <ellipse cx={50} cy={FLOOR} rx={rx} ry={5} fill="url(#ao-floor)" />;

function Neck({ r }: { r: Rig }) {
  const hw = r.neckHW;
  const d = `M${f(50 - hw)} ${f(r.chin - 5)} L${f(50 + hw)} ${f(r.chin - 5)} L${f(50 + hw + 0.8)} ${f(r.shY - 1)} Q50 ${f(r.shY + 1.5)} ${f(50 - hw - 0.8)} ${f(r.shY - 1)} Z`;
  return (
    <g>
      <path d={d} fill="url(#g-skin)" />
      <path d={d} fill="url(#skin-shade)" />
      <path d={`M${f(50 - hw)} ${f(r.chin - 3)} Q50 ${f(r.chin + 2.5)} ${f(50 + hw)} ${f(r.chin - 3)} L${f(50 + hw)} ${f(r.chin + 0.5)} Q50 ${f(r.chin + 4.5)} ${f(50 - hw)} ${f(r.chin + 0.5)} Z`} fill="#7a3418" opacity={0.35} filter="url(#f-soft)" />
    </g>
  );
}

/** 顔イラスト（100×100）を、あごが rig.chin に来るように置く */
function HeadAt({ r, faceChin, children }: { r: Rig; faceChin: number; children: React.ReactNode }) {
  const s = r.head;
  const tx = 50 - 50 * s;
  const ty = r.chin - faceChin * s;
  return <g transform={`translate(${f(tx)} ${f(ty)}) scale(${s})`}>{children}</g>;
}

// ---------------------------------------------------------------------------
// キャラクター
// ---------------------------------------------------------------------------

/** 主人公ハル（10歳）: 探検ジャケット（そでまくり）・白いTシャツ・ベルト・ななめがけのかばん・ハーフパンツ・ハイキングブーツ */
export function HaruStanding({ pose = "idle" }: { pose?: Pose }) {
  const r = RIG.haru;
  const a = arms(r, pose);
  const hemY = r.crotchY - 1;
  const shorts = `M${50 - r.hipX + 0.4} ${r.waistY + 1} L${50 - r.hipX - 1.8} ${r.kneeY - 9} Q${50 - r.legX} ${r.kneeY - 7} ${50 - 1.2} ${r.kneeY - 9.5} L50 ${r.crotchY + 3} L${50 + 1.2} ${r.kneeY - 9.5} Q${50 + r.legX} ${r.kneeY - 7} ${50 + r.hipX + 1.8} ${r.kneeY - 9} L${50 + r.hipX - 0.4} ${r.waistY + 1} Z`;
  return (
    <g>
      <Floor rx={27} />
      {([-1, 1] as const).map((s) => <Leg key={s} r={r} s={s} fill="url(#g-skin)" />)}
      {([-1, 1] as const).map((s) => <Limb key={`sock${s}`} a={[50 + s * r.legX, r.ankleY - 7]} b={[50 + s * r.legX, r.ankleY - 1]} ra={3.5} rb={3.3} fill="#f4efe6" gloss={0.3} />)}
      {([-1, 1] as const).map((s) => <Shoe key={`shoe${s}`} x={50 + s * r.legX} y={r.ankleY} fill="url(#g-boot)" shaft={3} laces />)}
      {/* ハーフパンツ（カーゴポケット・しわ） */}
      <Cloth d={shorts} fill="url(#g-shorts)" />
      <path d={`M${50 - r.hipX - 1.2} ${r.kneeY - 22} h6 v7 h-6 Z M${50 + r.hipX - 4.8} ${r.kneeY - 22} h6 v7 h-6 Z`} fill="#9a6a34" stroke="#5a3a18" strokeWidth={0.5} />
      <Folds paths={[`M${50 - 3} ${r.crotchY + 4} Q${50 - 5} ${r.crotchY + 12} ${50 - 4} ${r.crotchY + 20}`, `M${50 + 3} ${r.crotchY + 4} Q${50 + 5} ${r.crotchY + 12} ${50 + 4} ${r.crotchY + 20}`, `M${50 - r.hipX} ${r.kneeY - 11} q4 -1 8 0`, `M${50 + r.hipX - 8} ${r.kneeY - 11} q4 -1 8 0`]} />
      <Neck r={r} />
      {/* ジャケット（前あき）と白いTシャツ */}
      <Cloth d={torsoPath(r, hemY, r.hipX + 0.8)} fill="url(#g-vest)" />
      <path d={`M${50 - 4.2} ${r.shY - 3} L${50 - 6} ${hemY + 0.6} Q50 ${hemY + 2} ${50 + 6} ${hemY + 0.6} L${50 + 4.2} ${r.shY - 3} Q50 ${r.shY + 2.5} ${50 - 4.2} ${r.shY - 3} Z`} fill="url(#g-tee)" />
      <path d={`M${50 - 4.2} ${r.shY - 3} Q50 ${r.shY + 2.5} ${50 + 4.2} ${r.shY - 3}`} stroke="#cdbfa6" strokeWidth={1.1} fill="none" />
      <Folds paths={[`M${50 - 2} ${r.chestY + 4} q2 2 4 0`, `M${50 - 3} ${r.waistY - 6} q3 1.5 6 0`]} o={0.7} />
      {/* ベルト */}
      <rect x={50 - 6.6} y={r.waistY - 1.6} width={13.2} height={4} fill="#3a1d0a" />
      <rect x={47} y={r.waistY - 2} width={6} height={4.8} rx={0.8} fill="url(#metal-gold)" />
      <rect x={48.4} y={r.waistY - 0.8} width={3.2} height={2.4} rx={0.4} fill="#3a1d0a" />
      {/* えり・ポケット・しわ */}
      <path d={`M${50 - 4.6} ${r.shY - 3.4} L${50 - 9} ${r.shY + 8} L${50 - 5.8} ${r.chestY + 6} M${50 + 4.6} ${r.shY - 3.4} L${50 + 9} ${r.shY + 8} L${50 + 5.8} ${r.chestY + 6}`} stroke="#123220" strokeWidth={1.1} fill="none" strokeLinejoin="round" />
      <path d={`M${50 - 4.6} ${r.shY - 3.4} L${50 - 9} ${r.shY + 8} L${50 - 6.6} ${r.shY + 8.6} Z M${50 + 4.6} ${r.shY - 3.4} L${50 + 9} ${r.shY + 8} L${50 + 6.6} ${r.shY + 8.6} Z`} fill="#2e6e48" />
      {[-1, 1].map((s) => (
        <g key={s}>
          <rect x={s < 0 ? 50 - 14 : 50 + 7} y={r.chestY - 1} width={7} height={6.4} rx={0.8} fill="#2c6a44" stroke="#123220" strokeWidth={0.6} />
          <path d={`M${s < 0 ? 50 - 14.4 : 50 + 6.6} ${r.chestY - 1.4} h7.8 v2.6 h-7.8 Z`} fill="#3f8a5a" stroke="#123220" strokeWidth={0.5} />
          <circle cx={s < 0 ? 50 - 10.5 : 50 + 10.5} cy={r.chestY + 0.6} r={0.6} fill="url(#metal-gold)" />
        </g>
      ))}
      <Folds paths={[`M${50 - r.shX + 2} ${r.shY + 8} Q${50 - r.shX + 5} ${r.shY + 14} ${50 - r.waistX + 1} ${r.chestY + 10}`, `M${50 + r.shX - 2} ${r.shY + 8} Q${50 + r.shX - 5} ${r.shY + 14} ${50 + r.waistX - 1} ${r.chestY + 10}`, `M${50 - r.waistX} ${r.waistY + 2} q2 3 1 7`, `M${50 + r.waistX} ${r.waistY + 2} q-2 3 -1 7`]} />
      {/* ななめがけのかばん */}
      <path d={`M${50 - r.shX + 5} ${r.shY - 1} L${50 + r.hipX - 1} ${r.waistY + 3}`} stroke="#4a2810" strokeWidth={3.4} />
      <path d={`M${50 - r.shX + 5} ${r.shY - 1.8} L${50 + r.hipX - 1} ${r.waistY + 2.2}`} stroke="#a8754a" strokeWidth={0.7} opacity={0.7} />
      <g>
        <path d={`M${50 + r.hipX - 5} ${r.waistY + 1} h12 q1.5 0 1.5 1.5 v9 q0 2 -2 2 h-9.5 q-2 0 -2 -2 v-9 q0 -1.5 1.5 -1.5 Z`} fill="url(#g-boot)" />
        <path d={`M${50 + r.hipX - 5.4} ${r.waistY + 1} h13 v4.6 q-6.5 2 -13 0 Z`} fill="#7a4420" />
        <path d={`M${50 + r.hipX - 5.4} ${r.waistY + 1} h13 v1.2 h-13 Z`} fill="#fff" opacity={0.18} />
        <rect x={50 + r.hipX} y={r.waistY + 4.6} width={2.4} height={2.6} rx={0.5} fill="url(#metal-gold)" />
      </g>
      <Arm g={a.L} r={r} sleeve="url(#g-vest)" cuff="#5aa874" rolled />
      <Arm g={a.R} r={r} sleeve="url(#g-vest)" cuff="#5aa874" rolled />
      <HeadAt r={r} faceChin={FACE_GEO.haru.chin}><HaruArt bust={false} /></HeadAt>
    </g>
  );
}

/** なかまリコ（8歳）: オレンジのチュニック・黄色のサッシュ・スカーフ・レギンス・ロングブーツ */
export function RikoStanding({ pose = "idle" }: { pose?: Pose }) {
  const r = RIG.riko;
  const a = arms(r, pose);
  const hemY = r.kneeY - 7;
  const hemX = r.hipX + 7.5;
  return (
    <g>
      <Floor rx={27} />
      {([-1, 1] as const).map((s) => <Leg key={s} r={r} s={s} fill="url(#g-leggings)" />)}
      {([-1, 1] as const).map((s) => <Shoe key={`b${s}`} x={50 + s * r.legX} y={r.ankleY} fill="url(#g-boot)" shaft={20} />)}
      <Neck r={r} />
      {/* チュニック（すそが波打つ）とプリーツのしわ */}
      <Cloth d={torsoPath(r, hemY, hemX, 6)} fill="url(#g-riko-dress)" />
      <Folds paths={[0, 1, 2, 3, 4].map((i) => {
        const x = 50 - hemX + ((2 * hemX) / 6) * (i + 1);
        return `M${f(50 + (x - 50) * 0.45)} ${r.waistY + 4} Q${f(50 + (x - 50) * 0.8)} ${f((r.waistY + hemY) / 2 + 2)} ${f(x)} ${f(hemY - (i % 2 ? 1 : 0))}`;
      })} />
      <Folds paths={[`M${50 - r.shX + 2} ${r.shY + 7} Q${50 - r.shX + 5} ${r.shY + 13} ${50 - r.waistX + 1} ${r.chestY + 10}`, `M${50 + r.shX - 2} ${r.shY + 7} Q${50 + r.shX - 5} ${r.shY + 13} ${50 + r.waistX - 1} ${r.chestY + 10}`]} />
      {/* サッシュ（リボン結び） */}
      <path d={`M${50 - r.waistX - 0.6} ${r.waistY - 2.4} Q50 ${r.waistY - 0.8} ${50 + r.waistX + 0.6} ${r.waistY - 2.4} L${50 + r.waistX + 0.9} ${r.waistY + 2.4} Q50 ${r.waistY + 4} ${50 - r.waistX - 0.9} ${r.waistY + 2.4} Z`} fill="#ffd23f" />
      <path d={`M${50 - r.waistX - 0.6} ${r.waistY - 2.4} Q50 ${r.waistY - 0.8} ${50 + r.waistX + 0.6} ${r.waistY - 2.4} L${50 + r.waistX + 0.9} ${r.waistY + 2.4} Q50 ${r.waistY + 4} ${50 - r.waistX - 0.9} ${r.waistY + 2.4} Z`} fill="url(#cloth-shade)" />
      <g transform={`translate(${50 - r.waistX + 3} ${r.waistY})`}>
        <path d="M0 0 L-5 -3.4 L-5 3.4 Z M0 0 L5 -3.4 L5 3.4 Z" fill="#f0b21c" />
        <path d="M0 0 L-2 9 L0.6 8 L1.6 10 L1.2 0.5 Z" fill="#e8a010" />
        <circle r={1.6} fill="#ffd23f" />
      </g>
      {/* スカーフ */}
      <path d={`M${50 - 6.4} ${r.shY - 3} Q50 ${r.shY + 3} ${50 + 6.4} ${r.shY - 3} L${50 + 6} ${r.shY + 1.6} Q50 ${r.shY + 7} ${50 - 6} ${r.shY + 1.6} Z`} fill="#ffd23f" />
      <path d={`M${50 - 6.4} ${r.shY - 3} Q50 ${r.shY + 3} ${50 + 6.4} ${r.shY - 3} L${50 + 6} ${r.shY + 1.6} Q50 ${r.shY + 7} ${50 - 6} ${r.shY + 1.6} Z`} fill="url(#cloth-shade)" />
      <path d={`M${50 + 3} ${r.shY + 3} L${50 + 6.5} ${r.shY + 15} L${50 + 2} ${r.shY + 12} Z`} fill="#f0a81c" />
      <Arm g={a.L} r={r} sleeve="url(#g-riko-dress)" cuff="#ffd23f" />
      <Arm g={a.R} r={r} sleeve="url(#g-riko-dress)" cuff="#ffd23f" />
      <HeadAt r={r} faceChin={FACE_GEO.riko.chin}><RikoArt bust={false} /></HeadAt>
    </g>
  );
}

/** なかまキコ（7歳）: フードつきのマント・ラベンダーのワンピース・白いハイソックス・ストラップぐつ・ことばノート */
export function KikoStanding({ pose = "idle" }: { pose?: Pose }) {
  const r = RIG.kiko;
  const a = arms(r, pose === "point" ? "idle" : pose);
  if (pose === "point") a.R = armGeo(r, 1, ARMS.point.R, "point");
  const hemY = r.kneeY - 4;
  const hemX = r.hipX + 8;
  const cape = `M${50 - r.shX + 2} ${r.shY - 1} C${50 - r.shX - 8} ${r.shY + 22} ${50 - r.shX - 12} ${r.kneeY - 12} ${50 - r.shX - 11} ${r.kneeY + 9} Q50 ${r.kneeY + 15} ${50 + r.shX + 11} ${r.kneeY + 9} C${50 + r.shX + 12} ${r.kneeY - 12} ${50 + r.shX + 8} ${r.shY + 22} ${50 + r.shX - 2} ${r.shY - 1} Z`;
  const holdBook = a.L.kind === "relaxed";
  return (
    <g>
      <Floor rx={29} />
      {/* マント（背中） */}
      <Cloth d={cape} fill="url(#g-kiko-cape)" />
      <Folds paths={[`M${50 - r.shX - 4} ${r.chestY} Q${50 - r.shX - 8} ${r.waistY + 20} ${50 - r.shX - 8} ${r.kneeY + 8}`, `M${50 + r.shX + 4} ${r.chestY} Q${50 + r.shX + 8} ${r.waistY + 20} ${50 + r.shX + 8} ${r.kneeY + 8}`]} />
      {([-1, 1] as const).map((s) => <Leg key={s} r={r} s={s} fill="url(#g-skin)" />)}
      {([-1, 1] as const).map((s) => <Limb key={`sock${s}`} a={[50 + s * r.legX, r.kneeY + 3]} b={[50 + s * r.legX, r.ankleY]} ra={4.5} rb={3.3} fill="#f6f2fb" gloss={0.3} />)}
      {([-1, 1] as const).map((s) => <ellipse key={`cuff${s}`} cx={50 + s * (r.legX + 0.3)} cy={r.kneeY + 3} rx={4.9} ry={1.4} fill="#e4dcf0" />)}
      {([-1, 1] as const).map((s) => <Shoe key={`shoe${s}`} x={50 + s * r.legX} y={r.ankleY} fill="url(#gem-amethyst)" strap />)}
      <Neck r={r} />
      {/* ワンピース */}
      <Cloth d={torsoPath(r, hemY, hemX, 7)} fill="url(#g-kiko-dress)" />
      <Folds paths={[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 50 - hemX + ((2 * hemX) / 7) * (i + 1);
        return `M${f(50 + (x - 50) * 0.5)} ${r.waistY + 3} Q${f(50 + (x - 50) * 0.82)} ${f((r.waistY + hemY) / 2 + 2)} ${f(x)} ${f(hemY - (i % 2 ? 0 : 1))}`;
      })} />
      <path d={`M${50 - r.waistX - 0.5} ${r.waistY - 1.6} Q50 ${r.waistY} ${50 + r.waistX + 0.5} ${r.waistY - 1.6} L${50 + r.waistX + 0.7} ${r.waistY + 1.4} Q50 ${r.waistY + 3} ${50 - r.waistX - 0.7} ${r.waistY + 1.4} Z`} fill="#5a33b8" />
      {/* ことばノート（左手でかかえる） */}
      {holdBook && (
        <g transform={`translate(${f(a.L.wr[0] + 1)} ${f(a.L.wr[1] - 4)}) rotate(-8)`}>
          <rect x={-8} y={-2} width={13} height={17} rx={1.6} fill="#7a3a12" />
          <rect x={-8} y={-2} width={13} height={17} rx={1.6} fill="url(#shade-cyl)" />
          <rect x={-6.4} y={-0.4} width={9.6} height={13.6} rx={1} fill="#fff4d2" />
          <text x={-1.6} y={8.6} textAnchor="middle" fontSize={6} fontWeight={900} fill="#7a3a12" fontFamily="Georgia, serif">Aa</text>
          <rect x={3.4} y={4} width={2.4} height={3.4} fill="url(#metal-gold)" />
        </g>
      )}
      <Arm g={a.L} r={r} sleeve="url(#g-kiko-dress)" cuff="#fff8ee" />
      <Arm g={a.R} r={r} sleeve="url(#g-kiko-dress)" cuff="#fff8ee" />
      {/* 肩のケープ・白いえり・留め具 */}
      {([-1, 1] as const).map((s) => {
        const d = `M${50 + s * 3.8} ${r.shY - 3.4} C${50 + s * 10} ${r.shY - 3} ${50 + s * (r.shX + 1)} ${r.shY - 1.5} ${50 + s * (r.shX + 2.8)} ${r.shY + 5} L${50 + s * (r.shX + 1.2)} ${r.shY + 12.5} Q${50 + s * (r.shX - 5)} ${r.shY + 13.5} ${50 + s * 5.2} ${r.shY + 5.5} Z`;
        return <Cloth key={s} d={d} fill="url(#g-kiko-cape)" />;
      })}
      <path d={`M${50 - 6.4} ${r.shY - 2.6} C${50 - 6.6} ${r.shY + 3} ${50 - 2.4} ${r.shY + 4.6} 50 ${r.shY + 2.6} C${50 + 2.4} ${r.shY + 4.6} ${50 + 6.6} ${r.shY + 3} ${50 + 6.4} ${r.shY - 2.6} Q50 ${r.shY + 0.6} ${50 - 6.4} ${r.shY - 2.6} Z`} fill="#fff8ee" />
      <circle cx={50} cy={r.shY + 3.6} r={1.9} fill="url(#gem-topaz)" />
      <circle cx={49.4} cy={r.shY + 3} r={0.55} fill="#fff" opacity={0.9} />
      <HeadAt r={r} faceChin={FACE_GEO.kiko.chin}><KikoArt bust={false} /></HeadAt>
    </g>
  );
}

export function BirimoStanding({ mood = "happy" }: { mood?: Mood }) {
  return (
    <g>
      <Floor rx={24} />
      <ellipse cx={50} cy={FLOOR + 0.5} rx={18} ry={2.4} fill="url(#ao-contact)" />
      <g transform="translate(8 88) scale(0.84)"><BirimoArt mood={mood} /></g>
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
