/**
 * 顔・体の共通パーツ（3DCGアニメ映画風）。
 * 光はすべて「左上から暖かいキーライト・右うしろから冷たいリムライト」で統一する。
 * 色・質感は components/art/ArtDefs.tsx の共通定義（url(#...)）を参照するので、ここでは <defs> を作らない（id の重複を防ぐ）。
 */
import type { CSSProperties, ReactNode } from "react";

/** やわらかい線（真っ黒ではなくこげ茶にして、CGっぽい柔らかさを出す） */
export const INK = "#3a1c0e";
const SHADOW = "#7a3418";

export type Pt = [number, number];

/** 小数を2けたに丸める（SVGの文字数を減らす） */
const f = (n: number) => Math.round(n * 100) / 100;

/** 顔の形の数値 */
export interface FaceGeo {
  cx: number;
  /** おでこの上（生えぎわ）のy */
  top: number;
  /** あごの先のy */
  chin: number;
  /** 顔の半分の幅 */
  hw: number;
  /** あごの丸み（大きいほど丸い・幼い） */
  jaw: number;
  /** ほおのふくらみの高さ */
  cheek: number;
}

export function facePath({ cx, top, chin, hw, jaw, cheek }: FaceGeo): string {
  const t = top + 12;
  return `M${cx - hw} ${t} C${cx - hw} ${top - 6} ${cx + hw} ${top - 6} ${cx + hw} ${t} C${cx + hw} ${cheek + 6} ${cx + jaw + 5} ${chin - 3} ${cx} ${chin} C${cx - jaw - 5} ${chin - 3} ${cx - hw} ${cheek + 6} ${cx - hw} ${t} Z`;
}

/**
 * 先が細くなる「カプセル」の形（腕・脚・指）。a→b、半径 ra→rb。
 */
export function capsule(a: Pt, b: Pt, ra: number, rb: number): string {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 0.001;
  const nx = -dy / L, ny = dx / L;
  return `M${f(a[0] + nx * ra)} ${f(a[1] + ny * ra)} L${f(b[0] + nx * rb)} ${f(b[1] + ny * rb)} A${f(rb)} ${f(rb)} 0 0 0 ${f(b[0] - nx * rb)} ${f(b[1] - ny * rb)} L${f(a[0] - nx * ra)} ${f(a[1] - ny * ra)} A${f(ra)} ${f(ra)} 0 0 0 ${f(a[0] + nx * ra)} ${f(a[1] + ny * ra)} Z`;
}

/** 影になる側（右下）を向いた法線 */
function shadowNormal(a: Pt, b: Pt): Pt {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 0.001;
  let nx = -dy / L, ny = dx / L;
  if (nx < -1e-6 || (Math.abs(nx) <= 1e-6 && ny < 0)) { nx = -nx; ny = -ny; }
  return [nx, ny];
}

const off = (p: Pt, n: Pt, k: number): Pt => [p[0] + n[0] * k, p[1] + n[1] * k];

/**
 * 円柱の陰影つきの手足: 本体 → 影の側（内側にずらした細いカプセル）→ 光の筋 → 右のふちの逆光
 */
export function Limb({ a, b, ra, rb, fill, gloss = 0.18 }: { a: Pt; b: Pt; ra: number; rb: number; fill: string; gloss?: number }) {
  const n = shadowNormal(a, b);
  return (
    <g>
      <path d={capsule(a, b, ra, rb)} fill={fill} />
      <path d={capsule(off(a, n, ra * 0.38), off(b, n, rb * 0.38), ra * 0.58, rb * 0.58)} fill="#2a0f05" opacity={0.24} />
      <path d={capsule(off(a, n, -ra * 0.5), off(b, n, -rb * 0.5), ra * 0.22, rb * 0.22)} fill="#fff" opacity={gloss} />
      <path d={capsule(off(a, n, ra * 0.82), off(b, n, rb * 0.82), ra * 0.14, rb * 0.14)} fill="#bfefff" opacity={0.28} />
    </g>
  );
}

/**
 * 関節をまたいで 1本につながる「なめらかな手足」の輪郭（肩→ひじ→手首、もも→ひざ→足首）。
 * capsule を何本も重ねると 関節に段差（人形の関節のような継ぎ目）が出るので、
 * 各点の左右に半径ぶんずらした点を Catmull-Rom 曲線で結び、両はしを半円でとじる。
 */
export function smoothLimb(pts: Pt[], radii: number[]): string {
  const n = pts.length;
  const tan = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const L = Math.hypot(dx, dy) || 0.001;
    return [dx / L, dy / L] as Pt;
  });
  const L = pts.map((p, i): Pt => [p[0] - tan[i][1] * radii[i], p[1] + tan[i][0] * radii[i]]);
  const R = pts.map((p, i): Pt => [p[0] + tan[i][1] * radii[i], p[1] - tan[i][0] * radii[i]]);
  const curve = (q: Pt[]) => {
    let s = "";
    for (let i = 0; i < q.length - 1; i++) {
      const p0 = q[Math.max(0, i - 1)], p1 = q[i], p2 = q[i + 1], p3 = q[Math.min(q.length - 1, i + 2)];
      s += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return s;
  };
  const re = radii[n - 1], rs = radii[0];
  const Rr = [...R].reverse();
  return `M${f(L[0][0])} ${f(L[0][1])}${curve(L)} A${f(re)} ${f(re)} 0 0 0 ${f(R[n - 1][0])} ${f(R[n - 1][1])}${curve(Rr)} A${f(rs)} ${f(rs)} 0 0 0 ${f(L[0][0])} ${f(L[0][1])} Z`;
}

/** smoothLimb に 円柱の陰影（影の側・光の筋・逆光）を重ねたもの */
export function SmoothLimb({ pts, radii, fill, gloss = 0.16 }: { pts: Pt[]; radii: number[]; fill: string; gloss?: number }) {
  const nrm = shadowNormal(pts[0], pts[pts.length - 1]);
  const shift = (k: number, s: number) => smoothLimb(pts.map((p, i) => off(p, nrm, radii[i] * k)), radii.map((r) => r * s));
  return (
    <g>
      <path d={smoothLimb(pts, radii)} fill={fill} />
      <path d={shift(0.4, 0.6)} fill="#2a0f05" opacity={0.2} filter="url(#f-soft)" />
      <path d={shift(-0.48, 0.24)} fill="#fff" opacity={gloss} filter="url(#f-soft)" />
      <path d={shift(0.84, 0.13)} fill="#bfefff" opacity={0.26} />
    </g>
  );
}

/** つやのある瞳。side=-1 は向かって左の目（形を左右反転）。ハイライトは両目とも左上。 */
export function Eye({ x, y, iris, size = 1, side, closed = false, lashes = 0, crease = true }: { x: number; y: number; iris: string; size?: number; side: 1 | -1; closed?: boolean; lashes?: number; crease?: boolean }) {
  if (closed) {
    return (
      <g transform={`translate(${x} ${y}) scale(${size * side} ${size})`}>
        <path d="M-4.6 0.2 Q0 4 4.8 0.2" stroke={INK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <path d="M4.6 0.4 l1.6 -1" stroke={INK} strokeWidth={1} strokeLinecap="round" />
      </g>
    );
  }
  const white = "M-4.6 0.8 C-4.2 -3.6 -1.2 -5.1 1 -5 C3.4 -4.8 4.6 -2.4 4.7 0.4 C4.2 3.6 1.8 4.9 0 4.9 C-2.4 4.9 -4.3 3.4 -4.6 0.8 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      <g transform={`scale(${side} 1)`}>
        <path d={white} fill="url(#eye-white)" />
        <ellipse cx={0} cy={0.4} rx={3.75} ry={4.25} fill={`url(#iris-${iris})`} />
        <ellipse cx={0} cy={0.4} rx={3.75} ry={4.25} fill="none" stroke="#120804" strokeOpacity={0.55} strokeWidth={0.55} />
        {/* 虹彩の 放射状の すじ（ガラス玉のような 奥行き） */}
        <path d="M0 -2.4 L0 -3.4 M1.9 -1.6 L2.7 -2.4 M2.6 0.6 L3.4 0.7 M-1.9 -1.6 L-2.7 -2.4 M-2.6 0.6 L-3.4 0.7 M1.8 2.8 L2.4 3.4 M-1.8 2.8 L-2.4 3.4" stroke="#fff" strokeOpacity={0.16} strokeWidth={0.4} strokeLinecap="round" />
        <ellipse cx={0} cy={0.8} rx={1.7} ry={2} fill="#080302" />
        <path d={white} fill="url(#eye-lid)" />
        {/* 上まぶたのライン＋目じりのまつげ */}
        <path d="M-4.9 0.9 C-4.4 -3.8 -1.3 -5.5 1 -5.4 C3.6 -5.2 4.9 -2.6 5.2 0.2" stroke={INK} strokeWidth={1.45} fill="none" strokeLinecap="round" />
        <path d="M4.9 -0.4 l1.8 -1.5" stroke={INK} strokeWidth={1.05} strokeLinecap="round" />
        {lashes > 0 && <path d="M4.1 -2.6 l1.8 -1.9 M2.4 -4.4 l1 -2" stroke={INK} strokeWidth={0.75} strokeLinecap="round" />}
        {lashes > 1 && <path d="M0.4 -5.2 l0.3 -1.8" stroke={INK} strokeWidth={0.65} strokeLinecap="round" />}
        {/* 下まぶた・二重のライン */}
        <path d="M-3.2 3.9 Q0 5.6 3.6 3.6" stroke="#a5583a" strokeOpacity={0.45} strokeWidth={0.55} fill="none" />
        {crease && <path d="M-2.6 -6.6 Q1 -7.8 4.4 -5.6" stroke="#b46a48" strokeOpacity={0.4} strokeWidth={0.6} fill="none" />}
      </g>
      {/* 光の映りこみ（大・小）と虹彩の下の照り返し */}
      <ellipse cx={-1.3} cy={-1.5} rx={1.35} ry={1.5} fill="#fff" />
      <circle cx={1.5} cy={2.3} r={0.6} fill="#fff" opacity={0.8} />
      <path d="M-2.4 2.7 Q0 3.9 2.4 2.7" stroke="#fff" strokeOpacity={0.22} strokeWidth={0.9} fill="none" />
    </g>
  );
}

/** まゆ（内側が太く、外側に向かって細くなる） side=-1 は向かって左 */
export function Brow({ x, y, side, color, lift = 0, w = 1 }: { x: number; y: number; side: 1 | -1; color: string; lift?: number; w?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${side * w} ${w})`}>
      <path d={`M-5.4 0.9 C-3 ${-1.6 - lift} 1.5 ${-2.3 - lift} 6 ${-0.4 - lift * 0.4} C1.8 ${-1 - lift * 0.8} -2.6 ${-0.4 - lift * 0.5} -5.4 2.5 Z`} fill={color} />
    </g>
  );
}

/** 鼻（鼻すじの影・小鼻・鼻先のつや） */
export function Nose({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M1.2 -8 C2.2 -4.5 2.5 -2 1.7 0" stroke="#b5664a" strokeOpacity={0.32} strokeWidth={1.5} fill="none" strokeLinecap="round" />
      <path d="M-2.1 0.5 Q-1 2.1 0 1.5 Q1 2.1 2.1 0.5" stroke="#a24f34" strokeOpacity={0.7} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <ellipse cx={-0.5} cy={-0.9} rx={1.2} ry={0.8} fill="#fff" opacity={0.5} />
    </g>
  );
}

export type MouthKind = "grin" | "smile" | "open" | "talk" | "worried";

/** 口（くちびるの色・歯・舌・口角） */
export function Mouth({ x, y, kind, s = 1, className, style }: { x: number; y: number; kind: MouthKind; s?: number; className?: string; style?: CSSProperties }) {
  let body: ReactNode;
  if (kind === "grin") {
    body = (
      <>
        <path d="M-7.5 -0.5 Q0 8 7.5 -0.5 Q0 2.2 -7.5 -0.5 Z" fill="#5e1810" />
        <path d="M-6.2 0.1 Q0 2.6 6.2 0.1 L5.6 1.5 Q0 3.6 -5.6 1.5 Z" fill="#fffaf2" />
        <path d="M-3.4 4.6 Q0 2.8 3.4 4.6 Q0 6.4 -3.4 4.6 Z" fill="#d9555a" />
        <path d="M-7.5 -0.5 Q0 2.2 7.5 -0.5" stroke="#8a3424" strokeWidth={0.8} fill="none" />
        <path d="M-3 6.7 Q0 7.7 3 6.7" stroke="#ffd2c0" strokeOpacity={0.6} strokeWidth={0.9} fill="none" strokeLinecap="round" />
        {/* 口角（ほおの ふくらみの 小さな くぼみ。線を長くすると ほうれい線に見えて 大人っぽくなるので 短く・うすく） */}
        <path d="M-8 -1.2 q-0.4 0.5 -0.1 1.1 M8 -1.2 q0.4 0.5 0.1 1.1" stroke="#b06048" strokeOpacity={0.28} strokeWidth={0.6} fill="none" strokeLinecap="round" />
      </>
    );
  } else if (kind === "open" || kind === "talk") {
    body = (
      <>
        <path d="M-4.8 -0.4 Q0 6.6 4.8 -0.4 Q0 1.4 -4.8 -0.4 Z" fill="#6a1c14" />
        <path d="M-3.8 0.2 Q0 1.6 3.8 0.2 L3.4 1 Q0 2.2 -3.4 1 Z" fill="#fffaf2" />
        <path d="M-2.4 3.9 Q0 2.6 2.4 3.9 Q0 5.3 -2.4 3.9 Z" fill="#e0646a" />
        <path d="M-2.2 5.6 Q0 6.4 2.2 5.6" stroke="#ffd2c0" strokeOpacity={0.55} strokeWidth={0.8} fill="none" strokeLinecap="round" />
      </>
    );
  } else if (kind === "worried") {
    body = <path d="M-4.6 1.6 Q0 -1.6 4.6 1.6" stroke="#8a3424" strokeWidth={1.4} fill="none" strokeLinecap="round" />;
  } else {
    body = (
      <>
        <path d="M-5.6 -0.6 Q0 4.6 5.6 -0.6" stroke="#8a3424" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <path d="M-2.8 3.7 Q0 4.9 2.8 3.7" stroke="#e0806e" strokeOpacity={0.55} strokeWidth={1.2} fill="none" strokeLinecap="round" />
        <path d="M-6.1 -1.1 q-0.4 0.5 -0.1 1.1 M6.1 -1.1 q0.4 0.5 0.1 1.1" stroke="#b06048" strokeOpacity={0.28} strokeWidth={0.55} fill="none" strokeLinecap="round" />
      </>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={className} style={style}>{body}</g>
    </g>
  );
}

/** 耳（皮下散乱で赤みのあるふち＋内側のくぼみ） side=-1 は向かって左 */
export function Ear({ x, y, side, s = 1 }: { x: number; y: number; side: 1 | -1; s?: number }) {
  const d = "M-1 -6 C3 -7.5 5.6 -3.5 4.8 0.8 C4.2 4.6 1.8 6.8 -1 5.8 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${side * s} ${s})`}>
      <path d={d} fill="url(#g-skin)" />
      <path d={d} fill="url(#skin-sss)" />
      <path d={d} fill="url(#skin-shade)" />
      <path d="M0.6 -3.6 C3 -3.8 3.6 -0.4 2.6 2.2 C2 3.6 0.8 3.8 0.4 2.8" stroke="#b5664a" strokeOpacity={0.55} strokeWidth={0.8} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** 顔の土台: 耳 → 肌（色・皮下散乱・陰・逆光）→ ほお骨の下の影 → ほおの赤み */
export function Face({ g, blush = 1, k = 1 }: { g: FaceGeo; blush?: number; k?: number }) {
  const d = facePath(g);
  const { cx, top, chin, hw, jaw, cheek } = g;
  const earY = top + (chin - top) * 0.5;
  const by = top + (chin - top) * 0.68;
  return (
    <g>
      <Ear x={cx - hw + 0.8 * k} y={earY} side={-1} s={k} />
      <Ear x={cx + hw - 0.8 * k} y={earY} side={1} s={k} />
      <path d={d} fill="url(#g-skin)" />
      <path d={d} fill="url(#skin-sss)" />
      <path d={d} fill="url(#skin-shade)" />
      <path d={d} fill="url(#skin-rim)" />
      <path d={`M${cx + hw - 1.5 * k} ${cheek - 6 * k} C${cx + hw - 2 * k} ${cheek + 8 * k} ${cx + jaw + 6 * k} ${chin - 6 * k} ${cx + 2 * k} ${chin - 1.2 * k}`} stroke={SHADOW} strokeOpacity={0.2} strokeWidth={3 * k} fill="none" filter="url(#f-soft)" />
      <ellipse cx={cx - hw * 0.56} cy={by} rx={5.6 * k} ry={3.3 * k} fill="url(#blush)" opacity={blush} />
      <ellipse cx={cx + hw * 0.56} cy={by} rx={5.6 * k} ry={3.3 * k} fill="url(#blush)" opacity={blush} />
    </g>
  );
}

/** 髪の束: 色 → 天使の輪のつや → 毛束の線（暗い線と明るい線） */
export function Hair({ d, fill, dark = [], light = [], darkColor = "#1e0e06", lightColor = "#f0c08a" }: { d: string; fill: string; dark?: string[]; light?: string[]; darkColor?: string; lightColor?: string }) {
  return (
    <g>
      <path d={d} fill={fill} />
      <path d={d} fill="url(#hair-sheen)" />
      {dark.map((s, i) => <path key={`d${i}`} d={s} stroke={darkColor} strokeOpacity={0.45} strokeWidth={0.8} fill="none" strokeLinecap="round" />)}
      {light.map((s, i) => <path key={`l${i}`} d={s} stroke={lightColor} strokeOpacity={0.7} strokeWidth={0.95} fill="none" strokeLinecap="round" />)}
    </g>
  );
}

/**
 * 天使の輪（髪の丸みに そって 光る 三日月形の つや）。かたい 線ではなく ぼかした 面で描く。
 * 頭の まるみを 楕円 (cx, cy, rx, ry) で あらわし、その上の a0→a1 度（真上=-90）の 帯を 光らせる。
 */
export function HairHalo({ cx, cy, rx, ry, a0 = -150, a1 = -40, w = 2.6, color = "#fff", o = 0.38 }: { cx: number; cy: number; rx: number; ry: number; a0?: number; a1?: number; w?: number; color?: string; o?: number }) {
  const pt = (a: number, k: number): Pt => [cx + Math.cos((a * Math.PI) / 180) * (rx - k), cy + Math.sin((a * Math.PI) / 180) * (ry - k)];
  const N = 8;
  const outer: Pt[] = [], inner: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const a = a0 + ((a1 - a0) * i) / N;
    const t = Math.sin((Math.PI * i) / N); // まんなかが 太く、両はしは 細く
    outer.push(pt(a, 0));
    inner.push(pt(a, w * (0.25 + 0.75 * t)));
  }
  const d = `M${outer.map((p) => `${f(p[0])} ${f(p[1])}`).join(" L")} L${inner.reverse().map((p) => `${f(p[0])} ${f(p[1])}`).join(" L")} Z`;
  return <path d={d} fill={color} opacity={o} filter="url(#f-soft)" />;
}

/** 布のしわ（暗い谷＋明るい山のペア） */
export function Folds({ paths, o = 1 }: { paths: string[]; o?: number }) {
  return (
    <g fill="none" strokeLinecap="round">
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p} stroke="#1a0a04" strokeOpacity={0.24 * o} strokeWidth={1.1} />
          <path d={p} stroke="#fff" strokeOpacity={0.16 * o} strokeWidth={0.7} transform="translate(-0.7 -0.5)" />
        </g>
      ))}
    </g>
  );
}

/** 首（あごの下の影つき）。バストアップ用 */
export function BustNeck({ cx = 50, y0 = 70, y1 = 85, hw = 6.5 }: { cx?: number; y0?: number; y1?: number; hw?: number }) {
  return (
    <g>
      <path d={`M${cx - hw} ${y0} L${cx + hw} ${y0} L${cx + hw + 1} ${y1} Q${cx} ${y1 + 3} ${cx - hw - 1} ${y1} Z`} fill="url(#g-skin)" />
      <path d={`M${cx - hw} ${y0 + 2} Q${cx} ${y0 + 10} ${cx + hw} ${y0 + 2} L${cx + hw} ${y0 + 6} Q${cx} ${y0 + 12} ${cx - hw} ${y0 + 6} Z`} fill={SHADOW} opacity={0.32} filter="url(#f-soft)" />
    </g>
  );
}
