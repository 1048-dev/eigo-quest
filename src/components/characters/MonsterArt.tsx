/**
 * 英語モンスター（全100体）のイラスト。100×100 の座標系、地面は y≒94。
 *
 * 「種族の形」（10種）×「属性の色と光」（10種）で描く。色は ArtDefs の url(#el-<属性>-body) などを参照。
 * レア度が上がるほど装飾が増える: RARE＝金の装飾 / EPIC＝オーラ＋プラチナの装飾＋よろい / LEGENDARY＝光輪＋ルーン＋光る冠。
 * どんな id を渡しても lib/game/monsters の resolveMonster が必ず1体を返すので、表示が欠けることはない。
 *
 * 形の作り方（Night2 で作りなおし）:
 *  - 首・しっぽ・脚は tube()（ベジェ曲線にそって太さが変わる1本の輪郭）で描く → 棒や箱の つなぎ目が出ない
 *  - 羽は feather()（羽根1枚ずつ）を 風切り羽 → 雨覆い の順に重ねる / 竜の翼は 骨＋ふちが弧になった膜
 *  - 体の陰影は Shape（色 → 球の陰影 → 右ふちの逆光）。目は くぼみの影＋まゆ＋発光する虹彩
 */
import { elementOf, resolveMonster, type ArchetypeId, type ElementDef, type MonsterDef, type Rarity } from "@/lib/game/monsters";

const LINE = "#140a06";

interface P {
  el: ElementDef;
  body: string; // 体（陰影つきの属性グラデーション）
  wing: string; // 翼膜・ひれ
  pale: string; // 白っぽい毛なみ（属性の色がほんのり）
  trim: string; // 角・よろいの金属
  tier: number; // 0=COMMON … 3=LEGENDARY
}

const TIER: Record<Rarity, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };

// ---------------------------------------------------------------------------
// 形を作る道具
// ---------------------------------------------------------------------------
type Pt = readonly [number, number];
type Bez = readonly [Pt, Pt, Pt, Pt];
const r2 = (n: number) => Math.round(n * 100) / 100;
const rad = (deg: number) => (deg * Math.PI) / 180;

function bez(c: Bez, t: number): Pt {
  const u = 1 - t;
  return [
    u * u * u * c[0][0] + 3 * u * u * t * c[1][0] + 3 * u * t * t * c[2][0] + t * t * t * c[3][0],
    u * u * u * c[0][1] + 3 * u * u * t * c[1][1] + 3 * u * t * t * c[2][1] + t * t * t * c[3][1],
  ];
}
function bezN(c: Bez, t: number): Pt {
  const u = 1 - t;
  const dx = 3 * u * u * (c[1][0] - c[0][0]) + 6 * u * t * (c[2][0] - c[1][0]) + 3 * t * t * (c[3][0] - c[2][0]);
  const dy = 3 * u * u * (c[1][1] - c[0][1]) + 6 * u * t * (c[2][1] - c[1][1]) + 3 * t * t * (c[3][1] - c[2][1]);
  const l = Math.hypot(dx, dy) || 1;
  return [-dy / l, dx / l];
}
/** 曲線にそった帯（a〜b は太さの半分に対する割合。-1〜1 で全体＝tube） */
function band(c: Bez, w0: number, w1: number, a = -1, b = 1, t0 = 0, t1 = 1, n = 30): string {
  const L: string[] = [];
  const R: string[] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((t1 - t0) * i) / n;
    const [x, y] = bez(c, t);
    const [nx, ny] = bezN(c, t);
    const hw = (w0 + (w1 - w0) * t) / 2;
    L.push(`${r2(x + nx * hw * a)} ${r2(y + ny * hw * a)}`);
    R.push(`${r2(x + nx * hw * b)} ${r2(y + ny * hw * b)}`);
  }
  return `M${L.join(" L")} L${R.reverse().join(" L")} Z`;
}
const tube = (c: Bez, w0: number, w1: number) => band(c, w0, w1);
/** 曲線のふちの点と、外向きの角度（度） */
function edge(c: Bez, t: number, w0: number, w1: number, side: 1 | -1): { x: number; y: number; ang: number } {
  const [x, y] = bez(c, t);
  const [nx, ny] = bezN(c, t);
  const hw = ((w0 + (w1 - w0) * t) / 2) * side;
  return { x: x + nx * hw, y: y + ny * hw, ang: (Math.atan2(ny * side, nx * side) * 180) / Math.PI };
}
/** 先のとがった葉の形（羽根・毛の房・ひれ） */
function feather(x: number, y: number, len: number, ang: number, w: number, bend = 0): string {
  const a = rad(ang);
  const tx = x + Math.cos(a) * len;
  const ty = y + Math.sin(a) * len;
  const mx = (x + tx) / 2;
  const my = (y + ty) / 2;
  const nx = -Math.sin(a);
  const ny = Math.cos(a);
  return `M${r2(x)} ${r2(y)} Q${r2(mx + nx * (w + bend))} ${r2(my + ny * (w + bend))} ${r2(tx)} ${r2(ty)} Q${r2(mx - nx * (w - bend))} ${r2(my - ny * (w - bend))} ${r2(x)} ${r2(y)} Z`;
}
/** 根もとが平らな とげ・角 */
function spike(x: number, y: number, len: number, ang: number, w: number, curl = 0): string {
  const a = rad(ang);
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const tx = x + dx * len + nx * curl;
  const ty = y + dy * len + ny * curl;
  const mx = x + dx * len * 0.5 + nx * curl * 0.5;
  const my = y + dy * len * 0.5 + ny * curl * 0.5;
  return `M${r2(x + (nx * w) / 2)} ${r2(y + (ny * w) / 2)} Q${r2(mx + nx * w * 0.3)} ${r2(my + ny * w * 0.3)} ${r2(tx)} ${r2(ty)} Q${r2(mx - nx * w * 0.3)} ${r2(my - ny * w * 0.3)} ${r2(x - (nx * w) / 2)} ${r2(y - (ny * w) / 2)} Z`;
}
/** 脚の先のひづめ（曲線の終わりの向きにそって置く台形） */
function foot(c: Bez, w: number, len: number): string {
  const [x, y] = c[3];
  const [nx, ny] = bezN(c, 1);
  // 進む向き＝法線を -90° 回したもの
  const dx = ny;
  const dy = -nx;
  return `M${r2(x + nx * w * 0.5)} ${r2(y + ny * w * 0.5)} L${r2(x + dx * len + nx * w * 0.62)} ${r2(y + dy * len + ny * w * 0.62)} L${r2(x + dx * len - nx * w * 0.62)} ${r2(y + dy * len - ny * w * 0.62)} L${r2(x - nx * w * 0.5)} ${r2(y - ny * w * 0.5)} Z`;
}

/** 光る目（くぼみの影 → にじむ光の輪 → 発光する虹彩 → 縦長の瞳孔 → 白いハイライト）。brow でまゆの影 */
function GlowEye({ x, y, rx = 2.6, ry = 1.5, c, rot = 0, brow = 0 }: { x: number; y: number; rx?: number; ry?: number; c: string; rot?: number; brow?: number }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <ellipse cx={x} cy={y + ry * 0.2} rx={rx * 1.55} ry={ry * 1.7} fill="#000" opacity={0.4} filter="url(#f-soft)" />
      <ellipse cx={x} cy={y} rx={rx * 2.2} ry={ry * 2.4} fill={c} opacity={0.24} filter="url(#f-dof-1)" />
      <g filter="url(#f-bloom)">
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c} />
        <ellipse cx={x} cy={y} rx={rx * 0.62} ry={ry * 0.7} fill="#fff" opacity={0.55} />
      </g>
      <ellipse cx={x + rx * 0.05} cy={y} rx={Math.max(0.35, rx * 0.16)} ry={ry * 0.85} fill="#14060a" opacity={0.85} />
      <circle cx={x - rx * 0.4} cy={y - ry * 0.35} r={Math.max(0.35, ry * 0.28)} fill="#fff" />
      {brow !== 0 && (
        <path d={`M${x - rx * 1.5} ${y - ry * (1.1 + brow * 0.5)} Q${x} ${y - ry * 1.9} ${x + rx * 1.5} ${y - ry * (1.1 - brow * 0.6)}`} stroke={LINE} strokeOpacity={0.55} strokeWidth={Math.max(0.7, ry * 0.7)} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

/** 体のパーツ: 色 → 立体の陰影 → 右のふちの逆光 */
function Shape({ d, fill, shade = "url(#shade-sphere)", o = 0.85 }: { d: string; fill: string; shade?: string; o?: number }) {
  return <g><path d={d} fill={fill} /><path d={d} fill={shade} opacity={o} /><path d={d} fill="url(#mon-rim)" /></g>;
}
/** 奥にある体のパーツ（暗く・少し青く＝空気遠近法） */
function Far({ d, fill }: { d: string; fill: string }) {
  return <g><path d={d} fill={fill} /><path d={d} fill="#0a0612" opacity={0.42} /><path d={d} fill="url(#shade-cyl)" opacity={0.6} /></g>;
}

/** 接地影（やわらかい影＋足もとの濃い影） */
const Floor = ({ rx = 34, cx = 50 }: { rx?: number; cx?: number }) => (
  <g>
    <ellipse cx={cx} cy={94} rx={rx} ry={5} fill="url(#ao-floor)" />
    <ellipse cx={cx} cy={94} rx={rx * 0.6} ry={2.2} fill="url(#ao-contact)" opacity={0.7} />
  </g>
);

/** レア度の演出（オーラ・光輪・ルーン） */
function Aura({ p, cx = 50, cy = 54, r = 46 }: { p: P; cx?: number; cy?: number; r?: number }) {
  if (p.tier < 2) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={`url(#el-${p.el.id}-aura)`} className="pulse-glow" />
      {p.tier >= 3 && (
        <g filter="url(#f-bloom)" opacity={0.85}>
          <circle cx={cx} cy={cy} r={r * 0.86} fill="none" stroke={p.el.glow} strokeWidth={0.8} strokeDasharray="2 4" />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <text key={i} x={cx + Math.cos(a) * r * 0.86} y={cy + Math.sin(a) * r * 0.86 + 2} fontSize={5} textAnchor="middle" fill={p.el.light}>{"ᚠᚱᚨᛟᛉᛞᛊᛏ"[i]}</text>;
          })}
        </g>
      )}
    </g>
  );
}

/** 宝石（レア度の飾り） */
function Gem({ x, y, r = 2.2, p }: { x: number; y: number; r?: number; p: P }) {
  return (
    <g>
      <path d={`M${x} ${y - r * 1.2} L${x + r} ${y} L${x} ${y + r * 1.2} L${x - r} ${y} Z`} fill={p.trim} />
      <path d={`M${x} ${y - r * 0.8} L${x + r * 0.6} ${y} L${x} ${y + r * 0.8} L${x - r * 0.6} ${y} Z`} fill={p.el.glow} filter="url(#f-bloom)" />
      <circle cx={x - r * 0.2} cy={y - r * 0.35} r={r * 0.22} fill="#fff" />
    </g>
  );
}

/** 鳥の翼: 肩→手首の線にそって 風切り羽（奥）→ 雨覆い（手前）→ 腕のふち の順に重ねる */
function FeatherWing({ p, sh, wr, a0, a1, l0, l1, n = 9, glowTips = false }: { p: P; sh: Pt; wr: Pt; a0: number; a1: number; l0: number; l1: number; n?: number; glowTips?: boolean }) {
  const at = (t: number): Pt => [sh[0] + (wr[0] - sh[0]) * t, sh[1] + (wr[1] - sh[1]) * t];
  const items = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const [x, y] = at(0.12 + 0.88 * t);
    return { t, x, y, ang: a0 + (a1 - a0) * t, len: l0 + (l1 - l0) * t };
  });
  const armAng = (Math.atan2(wr[1] - sh[1], wr[0] - sh[0]) * 180) / Math.PI;
  return (
    <g>
      {/* 風切り羽（外側から順に） */}
      {[...items].reverse().map((f, i) => {
        const tip: Pt = [f.x + Math.cos(rad(f.ang)) * f.len, f.y + Math.sin(rad(f.ang)) * f.len];
        return (
          <g key={`p${i}`}>
            <path d={feather(f.x, f.y, f.len, f.ang, 6.2)} fill={i % 2 ? p.wing : p.body} />
            <path d={feather(f.x, f.y, f.len, f.ang, 6.2)} fill="url(#shade-cyl)" opacity={0.55} />
            <path d={`M${r2(f.x)} ${r2(f.y)} L${r2(tip[0])} ${r2(tip[1])}`} stroke={p.el.light} strokeOpacity={0.45} strokeWidth={0.5} />
            {glowTips && <circle cx={tip[0]} cy={tip[1]} r={1.6} fill={p.el.glow} filter="url(#f-bloom)" opacity={0.9} />}
          </g>
        );
      })}
      {/* 雨覆い（短い羽が うろこのように重なる） */}
      {items.map((f, i) => (
        <path key={`c${i}`} d={feather(f.x, f.y, f.len * 0.42, f.ang - 4, 5.2)} fill={p.body} opacity={0.95} />
      ))}
      {items.filter((_, i) => i % 2 === 0).map((f, i) => (
        <path key={`m${i}`} d={feather(f.x, f.y, f.len * 0.24, f.ang - 8, 4.4)} fill={p.el.light} opacity={0.35} />
      ))}
      {/* 腕のふち（光が当たる） */}
      <Shape d={tube([sh, at(0.35), at(0.7), wr], 6.5, 3.2)} fill={p.body} />
      <path d={band([sh, at(0.35), at(0.7), wr], 6.5, 3.2, armAng > -90 && armAng < 90 ? -1 : 0.4, armAng > -90 && armAng < 90 ? -0.4 : 1)} fill={p.el.light} opacity={0.45} />
    </g>
  );
}

/** 竜の翼（骨＋ふちが弧になった膜） */
function BatWing({ p, sh, el, tips, end, far = false }: { p: P; sh: Pt; el: Pt; tips: Pt[]; end: Pt; far?: boolean }) {
  // 膜: 指先と指先のあいだは ひじ に向かって へこむ弧
  const pull = (a: Pt, b: Pt, k = 0.32): Pt => {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    return [mx + (el[0] - mx) * k, my + (el[1] - my) * k];
  };
  const pts = [...tips, end];
  let d = `M${sh[0]} ${sh[1]} Q${(sh[0] + el[0]) / 2 + (far ? 2 : -2)} ${(sh[1] + el[1]) / 2 - 3} ${el[0]} ${el[1]} L${tips[0][0]} ${tips[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const c = pull(pts[i - 1], pts[i], i === pts.length - 1 ? 0.18 : 0.32);
    d += ` Q${r2(c[0])} ${r2(c[1])} ${pts[i][0]} ${pts[i][1]}`;
  }
  d += " Z";
  return (
    <g opacity={far ? 0.92 : 1}>
      <path d={d} fill={p.wing} />
      <path d={d} fill={`url(#el-${p.el.id}-aura)`} opacity={0.35} />
      <path d={d} fill="url(#shade-top)" opacity={0.6} />
      {far && <path d={d} fill="#0a0612" opacity={0.35} />}
      {/* 骨（腕 → 指） */}
      <path d={`M${sh[0]} ${sh[1]} Q${(sh[0] + el[0]) / 2 + (far ? 2 : -2)} ${(sh[1] + el[1]) / 2 - 3} ${el[0]} ${el[1]}`} stroke={p.el.dark} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d={`M${sh[0]} ${sh[1]} Q${(sh[0] + el[0]) / 2 + (far ? 2 : -2)} ${(sh[1] + el[1]) / 2 - 3} ${el[0]} ${el[1]}`} stroke={p.el.light} strokeOpacity={far ? 0.2 : 0.45} strokeWidth={0.8} fill="none" strokeLinecap="round" transform="translate(-0.5 -0.6)" />
      {tips.map((t, i) => (
        <path key={i} d={`M${el[0]} ${el[1]} L${t[0]} ${t[1]}`} stroke={p.el.dark} strokeWidth={1.5 - i * 0.2} strokeLinecap="round" />
      ))}
      {/* ひじのかぎ爪 */}
      <path d={spike(el[0], el[1], 4.5, far ? -60 : -120, 2)} fill={p.trim} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// 種族ごとの形
// ---------------------------------------------------------------------------

function Dragon({ p }: { p: P }) {
  const tail: Bez = [[32, 74], [12, 82], [2, 66], [10, 50]];
  const neck: Bez = [[60, 62], [62, 46], [72, 42], [74, 27]];
  const claws = (x: number) => <path d={`M${x} 92.6 q1.4 0.4 1.6 2 M${x + 3} 92.6 q1.4 0.4 1.6 2 M${x + 6} 92.6 q1.4 0.4 1.6 2`} stroke={p.trim} strokeWidth={1.1} strokeLinecap="round" fill="none" />;
  return (
    <g>
      <Aura p={p} cy={50} />
      <Floor rx={38} />
      {/* 奥の翼 */}
      <BatWing p={p} far sh={[60, 50]} el={[72, 18]} tips={[[98, 6], [100, 27], [91, 41]]} end={[68, 56]} />
      {/* 奥の脚 */}
      <Far d={tube([[70, 68], [74, 78], [72, 84], [76, 92]], 8, 5)} fill={p.body} />
      <Far d={tube([[44, 74], [46, 82], [42, 86], [46, 92]], 9, 5)} fill={p.body} />
      {/* しっぽ（先にひれ） */}
      <Shape d={tube(tail, 11, 1.4)} fill={p.body} shade="url(#shade-cyl)" />
      <path d={band(tail, 11, 1.4, 0.2, 1, 0, 0.85)} fill={p.el.light} opacity={0.35} />
      <path d={spike(10, 52, 9, -112, 5, -2)} fill={p.wing} />
      <path d={spike(9, 56, 7, -160, 4, 1.5)} fill={p.wing} />
      {/* 胴 */}
      <Shape d="M27 70 C25 57 39 49 54 49 C67 49 76 55 76 65 C76 77 64 83 49 83 C37 83 29 79 27 70 Z" fill={p.body} />
      {/* おなかの板（腹板） */}
      <path d="M44 82 C60 83 73 76 75 63 C70 70 62 75 50 77 C46 78 44 79 44 82 Z" fill={p.el.light} opacity={0.5} />
      {[50, 56, 62, 68].map((x, i) => <path key={x} d={`M${x} ${79 - i * 1.6} q1.2 -3 0.4 -5.4`} stroke={p.el.dark} strokeOpacity={0.4} strokeWidth={0.7} fill="none" />)}
      {/* うろこの照り */}
      <g stroke={p.el.light} strokeOpacity={0.3} strokeWidth={0.6} fill="none">
        {[[38, 58], [44, 56], [50, 55], [56, 56], [41, 63], [47, 61], [53, 61], [59, 62], [35, 64]].map(([x, y]) => <path key={`${x}-${y}`} d={`M${x - 2.4} ${y} q2.4 2.2 4.8 0`} />)}
      </g>
      {/* 背中のとげ */}
      {[[33, 55, -118, 6], [40, 51, -108, 7.5], [48, 49, -98, 7]].map(([x, y, a, l]) => <path key={x} d={spike(x, y, l, a, 4.4, -1.2)} fill={p.trim} />)}
      {/* 後ろ足（大きな もも → すね → 足） */}
      <Shape d="M27 69 C26 60 40 57 47 64 C51 71 47 79 43 82 C38 85 30 82 28 77 Z" fill={p.body} />
      <Shape d={tube([[38, 78], [34, 84], [32, 88], [33, 92]], 8, 5)} fill={p.body} shade="url(#shade-cyl)" />
      <path d="M29 93.4 C29 91 31 90 34 90 C38 90 41 91 41 93.4 Z" fill={p.el.dark} />
      {claws(36)}
      {/* 前足 */}
      <Shape d={tube([[64, 66], [66, 76], [63, 84], [65, 92]], 9, 5.5)} fill={p.body} shade="url(#shade-cyl)" />
      <path d="M61 93.4 C61 91 63 90 66 90 C70 90 72 91 72 93.4 Z" fill={p.el.dark} />
      {claws(67)}
      {/* 手前の翼 */}
      <BatWing p={p} sh={[46, 54]} el={[32, 22]} tips={[[6, 9], [2, 31], [14, 48]]} end={[38, 62]} />
      {/* 首（のど側に明るい板） */}
      <Shape d={tube(neck, 14, 9)} fill={p.body} shade="url(#shade-cyl)" />
      <path d={band(neck, 14, 9, 0.25, 1)} fill={p.el.light} opacity={0.45} />
      {[0.2, 0.4, 0.6, 0.8].map((t) => {
        const a = edge(neck, t, 14, 9, 1);
        const b = edge(neck, t, 14, 9, -1);
        return <path key={t} d={`M${r2(a.x)} ${r2(a.y)} L${r2((a.x * 3 + b.x) / 4)} ${r2((a.y * 3 + b.y) / 4)}`} stroke={p.el.dark} strokeOpacity={0.35} strokeWidth={0.6} />;
      })}
      {[0.25, 0.5, 0.75].map((t) => {
        const e = edge(neck, t, 14, 9, -1);
        return <path key={t} d={spike(e.x, e.y, 5, e.ang - 25, 3.6, -1)} fill={p.trim} />;
      })}
      {/* 頭（長い鼻先・あご・まゆの骨） */}
      <path d="M67 31 L58 35 L64 27 Z" fill={p.wing} />
      <Shape d="M64 26 C63 18 70 13 78 14 C84 14 88 17 92 20 L96 23.5 C97.4 25 96.6 27.6 94.6 28.4 L85 31.4 C78 33.4 70 33.4 66.4 31 C64.6 29.8 64 28 64 26 Z" fill={p.body} />
      <path d="M68 30 C74 33 84 32 94.6 28.4 C88 29.4 80 30 72 29 Z" fill={p.el.light} opacity={0.45} />
      <path d="M79 29.4 Q87 28.6 95.6 26" stroke={LINE} strokeWidth={0.9} fill="none" opacity={0.65} strokeLinecap="round" />
      <path d="M88 28.4 l1 2.2 l1 -2.5 Z M84 29.2 l0.8 1.8 l0.9 -2 Z" fill="#fff4dc" />
      <ellipse cx={93} cy={22.6} rx={1} ry={0.6} fill={LINE} opacity={0.7} />
      {/* 角（うしろへ反る） */}
      <path d={band([[68, 17], [64, 11], [59, 7], [52, 4]], 4.4, 0.3)} fill={p.trim} />
      <path d={band([[73, 15], [71, 9], [69, 5], [65, 1]], 3.4, 0.3)} fill={p.trim} />
      <path d={band([[68, 17], [64, 11], [59, 7], [52, 4]], 4.4, 0.3, -1, -0.3)} fill="#fff" opacity={0.35} />
      <GlowEye x={79} y={21} c={p.el.glow} rot={-10} brow={1} />
      {p.tier >= 1 && <path d="M64.6 13.4 l3.4 1.4 M61.8 10.6 l3 1.6" stroke={p.el.glow} strokeWidth={1} strokeLinecap="round" filter="url(#f-bloom)" />}
      {p.tier >= 2 && <path d="M70 17 Q78 12.6 87 17.4 L85.4 19.2 Q78 15.6 71 18.8 Z" fill={p.trim} />}
      {p.tier >= 2 && <Gem x={58} y={66} r={2.4} p={p} />}
      {p.tier >= 3 && <path d="M67 11 l2 -6 l2.4 4.6 l2.4 -6.4 l2.4 6.4 l2.4 -4.6 l2 6" stroke={p.el.glow} strokeWidth={1.4} fill="none" strokeLinejoin="round" filter="url(#f-bloom)" />}
    </g>
  );
}

function Wolf({ p }: { p: P }) {
  const tail: Bez = [[70, 85], [90, 86], [97, 66], [86, 46]];
  return (
    <g>
      <Aura p={p} />
      <Floor rx={34} />
      {/* ふさふさの しっぽ（先が属性の光） */}
      {/* 毛の房を 両がわに 重ねて ふさふさに */}
      {[0.2, 0.32, 0.44, 0.56, 0.68, 0.8].flatMap((t) => ([1, -1] as const).map((s) => {
        const e = edge(tail, t, 11, 4, s);
        // 毛先は しっぽの先の方へ 流れる
        return <path key={`${t}${s}`} d={feather(e.x, e.y, 9, e.ang - 58 * s, 3.6, -1.2 * s)} fill={p.body} />;
      }))}
      <Shape d={tube(tail, 15, 7)} fill={p.body} shade="url(#shade-cyl)" />
      <path d={band(tail, 15, 7, -0.2, 0.5, 0.1, 0.85)} fill={p.el.light} opacity={0.18} />
      <path d={band(tail, 15, 7, -1, 1, 0.78, 1)} fill={p.el.glow} filter="url(#f-bloom)" />
      <path d={feather(86, 47, 7, -100, 6)} fill={p.el.glow} filter="url(#f-bloom)" />
      {/* 奥の前足 */}
      <Far d={tube([[44, 64], [46, 76], [45, 84], [46, 92]], 7.5, 5.5)} fill={p.body} />
      <path d="M41 93.4 C41 91 43 90 46 90 C49 90 50 91.4 50 93.4 Z" fill={p.el.dark} />
      {/* 座った後ろ足（大きな もも） */}
      <Shape d="M50 70 C50 58 62 54 72 60 C80 66 80 82 74 88 C70 92 58 92 54 88 C50 84 50 78 50 70 Z" fill={p.body} />
      <path d="M47 93.6 C47 90 51 88 57 88.4 C62 88.8 64 91 64 93.6 Z" fill={p.body} />
      <path d="M47 93.6 C47 90 51 88 57 88.4 C62 88.8 64 91 64 93.6 Z" fill="url(#shade-top)" />
      <g stroke={p.el.dark} strokeOpacity={0.35} strokeWidth={0.7} fill="none" strokeLinecap="round">
        <path d="M60 62 q6 4 8 12" /><path d="M58 68 q6 4 6 12" /><path d="M70 66 q3 6 2 12" />
      </g>
      {/* 胸と胴 */}
      <Shape d="M33 46 C29 56 31 72 35 84 L50 88 C55 76 59 64 59 54 C59 44 48 37 33 46 Z" fill={p.body} />
      {/* 手前の前足 */}
      <Shape d={tube([[36, 62], [36, 76], [34, 84], [34, 91]], 8.5, 6)} fill={p.body} shade="url(#shade-cyl)" />
      <path d="M28 93.6 C28 90.6 31 89.6 34.4 89.6 C38 89.6 39.6 91 39.6 93.6 Z" fill={p.body} />
      <path d="M28 93.6 C28 90.6 31 89.6 34.4 89.6 C38 89.6 39.6 91 39.6 93.6 Z" fill="url(#shade-top)" />
      <path d="M31 93.4 v-1.6 M34 93.4 v-1.8" stroke={LINE} strokeOpacity={0.45} strokeWidth={0.6} />
      {/* 胸の毛（ふわっと重なる房） */}
      <path d="M25 33 C23 44 27 54 30 61 Q33 56 34 63 Q37 57 39.5 65 Q41.5 58 45 63 Q46.5 55 51 57 C53 46 51 37 44 33 Z" fill={p.el.light} opacity={0.82} />
      <path d="M25 33 C23 44 27 54 30 61 Q33 56 34 63 Q37 57 39.5 65 Q41.5 58 45 63 Q46.5 55 51 57 C53 46 51 37 44 33 Z" fill="url(#shade-top)" opacity={0.7} />
      <g stroke={p.el.dark} strokeOpacity={0.25} strokeWidth={0.6} fill="none" strokeLinecap="round">
        <path d="M32 44 q1 6 0 12" /><path d="M38 46 q1 6 0 12" /><path d="M44 44 q1 6 0 11" />
      </g>
      {/* 首のうしろの たてがみ */}
      <path d="M40 16 C52 14 61 24 59 38 C57 46 52 50 47 50 C52 42 50 30 40 16 Z" fill={p.wing} />
      {/* 頭（左向き。長い鼻先・あご・ほおの毛） */}
      <Shape d="M48 20 C46 12 38 10 32 13 C28 15 26 18 24 22 L14.4 27.6 C11.4 29.4 11.8 33.6 15 34.8 L26 37 C30 41 38 42.4 44 38.4 C50 34.4 51 26 48 20 Z" fill={p.body} />
      <path d="M15 34.8 C20 38.4 28 40.6 34 38.4 C28 36.6 22 34.6 15.4 32.8 Z" fill={p.el.light} opacity={0.6} />
      <path d="M15 34.8 Q21 35.6 27 34.6" stroke={LINE} strokeWidth={0.8} fill="none" opacity={0.6} strokeLinecap="round" />
      <ellipse cx={13.6} cy={30.2} rx={1.9} ry={1.4} fill={LINE} />
      <ellipse cx={13.1} cy={29.7} rx={0.6} ry={0.4} fill="#fff" opacity={0.6} />
      <path d="M43 38 L50 43 L46.6 36.6 L52.4 38.6 L47.6 33.4 Z" fill={p.el.light} opacity={0.85} />
      {/* 耳 */}
      <path d="M40.6 15 L45 0.6 L49.6 16.6 Z" fill={p.body} />
      <path d="M41.8 14 L44.8 4 L48 15 Z" fill={p.el.dark} opacity={0.6} />
      <path d="M34 14.4 L32.6 1 L41 12.6 Z" fill={p.body} />
      <path d="M35.2 13.2 L34.2 4.6 L39.4 12 Z" fill={p.el.dark} opacity={0.75} />
      <GlowEye x={31} y={22.4} rx={2.4} ry={1.4} c={p.el.glow} rot={12} brow={-1} />
      {p.tier >= 1 && <path d="M64 72 l3.6 -7 l3.6 7 m-5.4 -2.6 h3.6" stroke={p.el.glow} strokeWidth={1.2} fill="none" filter="url(#f-bloom)" />}
      {p.tier >= 1 && <path d="M33 47 Q44 53 56 46" stroke={p.trim} strokeWidth={2.4} fill="none" strokeLinecap="round" />}
      {p.tier >= 2 && <Gem x={44} y={51} p={p} />}
      {p.tier >= 3 && <path d="M30 16 Q38 10 46 15" stroke={p.el.glow} strokeWidth={1.4} fill="none" filter="url(#f-bloom)" />}
    </g>
  );
}

function Behemoth({ p }: { p: P }) {
  const column = (x: number) => `M${x} 70 C${x - 1} 79 ${x - 1.4} 85 ${x - 2} 92 L${x + 12} 92 C${x + 11.4} 85 ${x + 11} 79 ${x + 10} 70 Z`;
  const nails = (x: number) => [0, 3.6, 7.2].map((d) => <ellipse key={d} cx={x + 0.4 + d} cy={91.6} rx={1.5} ry={1.1} fill="#f3e6c8" opacity={0.9} />);
  const seams = [24, 36, 48, 60, 72];
  return (
    <g>
      <Aura p={p} cy={60} />
      <Floor rx={44} />
      {/* 奥の脚 */}
      <Far d={column(30)} fill={p.wing} />
      <Far d={column(74)} fill={p.wing} />
      {/* こん棒のしっぽ */}
      <Shape d={tube([[16, 70], [8, 70], [4, 66], [4, 60]], 7, 4)} fill={p.wing} shade="url(#shade-cyl)" />
      <Shape d="M-1 60 C-1 54 9 54 9 60 C9 66 -1 66 -1 60 Z" fill={p.trim} />
      {[[-1, 57, -150], [4, 54, -90], [9, 57, -30]].map(([x, y, a]) => <path key={a} d={spike(x, y, 3.6, a, 2.4)} fill={p.trim} />)}
      {/* 体（皮ふ） */}
      <Shape d="M10 70 C8 56 22 42 46 40 C66 39 82 47 86 62 C88 72 82 80 72 80 L22 80 C14 80 10 77 10 70 Z" fill={p.wing} />
      {/* 背中のこうら（帯が重なる） */}
      <Shape d="M12 64 C12 50 26 41 46 41 C66 41 81 49 83 63 C70 58 30 58 12 64 Z" fill={p.body} />
      {seams.map((x) => (
        <g key={x}>
          <path d={`M${x} ${x < 50 ? 61.4 - (x - 12) * 0.08 : 59.4 + (x - 50) * 0.1} Q${x + 2.6} 51 ${x + 1} 42`} stroke={p.el.dark} strokeWidth={1.4} fill="none" opacity={0.7} />
          <path d={`M${x + 1.4} ${x < 50 ? 61 - (x - 12) * 0.08 : 59 + (x - 50) * 0.1} Q${x + 4} 51 ${x + 2.4} 42.4`} stroke={p.el.light} strokeWidth={0.7} fill="none" opacity={0.45} />
        </g>
      ))}
      <path d="M12 64 C30 58 70 58 83 63" stroke={p.trim} strokeWidth={1.8} fill="none" />
      {/* 背中の まるい とげ（骨の板） */}
      {[[20, 48, -128, 7], [31, 43, -110, 9], [44, 41, -94, 10], [57, 41.6, -80, 9.4], [70, 45, -64, 8]].map(([x, y, a, l]) => (
        <g key={x}>
          <path d={spike(x, y, l, a, 7)} fill={p.trim} />
          <path d={spike(x, y, l * 0.9, a - 6, 2.4)} fill="#fff" opacity={0.3} />
        </g>
      ))}
      {[[28, 52], [42, 50], [56, 50], [70, 54]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={1.2} fill={p.el.light} opacity={0.6} />)}
      {/* 手前の脚 */}
      <Shape d={column(18)} fill={p.wing} shade="url(#shade-cyl)" />
      {nails(18)}
      <Shape d={column(62)} fill={p.wing} shade="url(#shade-cyl)" />
      {nails(62)}
      {/* 頭（低くかまえる）と角 */}
      <Shape d="M76 56 C82 49 93 50 97 58 C99.6 64 98.6 71 94.6 75.4 C90.6 79 84 78.6 80 74.6 C76.6 71 75 62 76 56 Z" fill={p.wing} />
      <path d="M78 55 C84 50 92 51 96 56 C90 54 84 54 78.6 58 Z" fill={p.trim} />
      <path d={band([[89, 64], [94, 56], [97, 46], [93, 33]], 5.6, 0.4)} fill={p.trim} />
      <path d={band([[89, 64], [94, 56], [97, 46], [93, 33]], 5.6, 0.4, -1, -0.2)} fill="#fff" opacity={0.35} />
      <path d={band([[84, 58], [86, 53], [88, 50], [86, 46]], 3.4, 0.3)} fill={p.trim} />
      <path d="M85 74 q5 5 10 1.4" stroke="#f3e6c8" strokeWidth={2} fill="none" strokeLinecap="round" />
      <ellipse cx={96.6} cy={68} rx={0.9} ry={0.6} fill={LINE} opacity={0.6} />
      <GlowEye x={85.6} y={62} rx={2.2} ry={1.3} c={p.el.glow} brow={1} />
      {p.tier >= 1 && <path d="M30 70 h40" stroke={p.trim} strokeWidth={1.6} strokeDasharray="5 3" />}
      {p.tier >= 2 && <path d="M30 66 h40" stroke={p.el.glow} strokeWidth={1.4} strokeDasharray="4 3" filter="url(#f-bloom)" />}
      {p.tier >= 3 && <Gem x={47} y={52} r={2.8} p={p} />}
    </g>
  );
}

function Phoenix({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} cy={46} r={48} />
      <Floor rx={20} />
      {/* 尾羽（長く流れ、先が炎のように光る） */}
      {[[52, 34], [70, 38], [90, 40], [110, 38], [128, 34]].map(([a, l], i) => {
        const bend = (i - 2) * 4;
        const tip: Pt = [50 + Math.cos(rad(a)) * l, 60 + Math.sin(rad(a)) * l];
        return (
          <g key={a}>
            <path d={feather(50, 60, l, a, 13, bend)} fill={i === 2 ? p.body : p.wing} />
            <path d={feather(50, 60, l, a, 13, bend)} fill="url(#shade-cyl)" opacity={0.5} />
            {/* 先は 炎のように 明るく光る */}
            <path d={feather(tip[0] - Math.cos(rad(a)) * 14, tip[1] - Math.sin(rad(a)) * 14, 14, a, 8, bend * 0.4)} fill={p.el.glow} opacity={0.75} filter="url(#f-bloom)" />
            <path d={`M50 60 Q${r2(50 + Math.cos(rad(a)) * l * 0.5 - Math.sin(rad(a)) * bend * 0.5)} ${r2(60 + Math.sin(rad(a)) * l * 0.5 + Math.cos(rad(a)) * bend * 0.5)} ${r2(tip[0])} ${r2(tip[1])}`} stroke={p.el.light} strokeOpacity={0.45} strokeWidth={0.6} fill="none" />
          </g>
        );
      })}
      {/* 翼（左右。風切り羽が 炎のように上へ） */}
      <FeatherWing p={p} sh={[45, 44]} wr={[22, 22]} a0={168} a1={242} l0={18} l1={30} n={9} glowTips={p.tier >= 1} />
      <g transform="translate(100 0) scale(-1 1)">
        <FeatherWing p={p} sh={[45, 44]} wr={[22, 22]} a0={168} a1={242} l0={18} l1={30} n={9} glowTips={p.tier >= 1} />
      </g>
      {/* 体（胸の羽毛） */}
      <Shape d="M50 30 C61 31 65 42 63 52 C61 61 56 66 50 67 C44 66 39 61 37 52 C35 42 39 31 50 30 Z" fill={p.body} />
      <path d="M50 36 C56 38 58 46 56 54 C54 60 52 62 50 63 C48 62 46 60 44 54 C42 46 44 38 50 36 Z" fill={p.el.light} opacity={0.3} />
      {[[50, 42], [45, 48], [55, 48], [50, 54], [46, 59], [54, 59]].map(([x, y]) => <path key={`${x}-${y}`} d={`M${x - 3} ${y} q3 3 6 0`} stroke={p.el.light} strokeOpacity={0.45} strokeWidth={0.7} fill="none" />)}
      {/* 足（たたんだ かぎ爪） */}
      <path d="M46.6 65 l-0.8 3.4 M53.4 65 l0.8 3.4" stroke={p.trim} strokeWidth={1.5} strokeLinecap="round" />
      <path d="M43.8 68.6 q2 1.4 4 0 M52.2 68.6 q2 1.4 4 0" stroke={p.trim} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      {/* 頭と冠羽（炎のように うしろへ流れる） */}
      {[[-112, 14], [-96, 16], [-80, 13]].map(([a, l], i) => (
        <path key={a} d={feather(50 + (i - 1) * 2, 17, l, a, 4.4, (i - 1) * -1.4)} fill={p.el.glow} filter="url(#f-bloom)" opacity={0.95} />
      ))}
      <Shape d="M50 14 C56 14 59 19 58 24 C57 29 54 32 50 32 C46 32 43 29 42 24 C41 19 44 14 50 14 Z" fill={p.body} />
      <path d="M47.6 25 Q50 23.6 52.4 25 L50.8 31 Q50 32.4 49.2 31 Z" fill={p.trim} />
      <path d="M47.6 25 Q50 23.6 52.4 25" stroke={LINE} strokeOpacity={0.4} strokeWidth={0.5} fill="none" />
      <GlowEye x={46} y={22.4} rx={1.7} ry={1.2} c={p.el.light} brow={0.6} />
      <GlowEye x={54} y={22.4} rx={1.7} ry={1.2} c={p.el.light} brow={-0.6} />
      {p.tier >= 1 && <Gem x={50} y={42} r={2.2} p={p} />}
      {p.tier >= 3 && <ellipse cx={50} cy={6} rx={10} ry={2.4} fill="none" stroke={p.el.glow} strokeWidth={1.2} filter="url(#f-bloom)" />}
    </g>
  );
}

const WATER = "M4 92.6 Q8 88 18 91 Q28 95 38 90 Q48 86 58 91 Q68 95 78 90 Q88 87 96 91.6 Q100 95 92 97.4 Q50 100 8 97.4 Q0 95 4 92.6 Z";

function Leviathan({ p }: { p: P }) {
  const hump: Bez = [[8, 95], [7, 72], [30, 70], [31, 95]];
  const neck: Bez = [[44, 96], [30, 66], [70, 60], [64, 25]];
  const fin = (c: Bez, w0: number, w1: number, t0: number, t1: number, h: number, side: 1 | -1) => {
    const n = 7;
    let d = "";
    for (let i = 0; i <= n; i++) {
      const t = t0 + ((t1 - t0) * i) / n;
      const e = edge(c, t, w0 * 0.8, w1 * 0.8, side);
      const hh = h * Math.sin((Math.PI * i) / n) + 1.5;
      const tip = [e.x + Math.cos(rad(e.ang - 25 * side)) * hh, e.y + Math.sin(rad(e.ang - 25 * side)) * hh];
      d += `${i === 0 ? "M" : "L"}${r2(e.x)} ${r2(e.y)} L${r2(tip[0])} ${r2(tip[1])} `;
    }
    const last = edge(c, t1, w0 * 0.8, w1 * 0.8, side);
    return `${d}L${r2(last.x)} ${r2(last.y)} Z`;
  };
  return (
    <g>
      <Aura p={p} cy={50} />
      {/* 奥の とぐろ（水から出て また もぐる） */}
      <path d={fin(hump, 11, 11, 0.25, 0.75, 3.4, -1)} fill={p.wing} opacity={0.8} />
      <Far d={tube(hump, 11, 11)} fill={p.body} />
      {/* 首（腹側は明るい板、背中に ひれ） */}
      <path d={fin(neck, 16, 9, 0.18, 0.86, 7, -1)} fill={p.wing} />
      <path d={fin(neck, 16, 9, 0.18, 0.86, 7, -1)} fill="url(#shade-top)" opacity={0.5} />
      <Shape d={tube(neck, 16, 9)} fill={p.body} shade="url(#shade-cyl)" />
      <path d={band(neck, 16, 9, 0.25, 1, 0, 1)} fill={p.el.light} opacity={0.5} />
      {Array.from({ length: 9 }, (_, i) => {
        const t = 0.1 + i * 0.09;
        const a = edge(neck, t, 16, 9, 1);
        const b = edge(neck, t, 16, 9, -1);
        return <path key={i} d={`M${r2(a.x)} ${r2(a.y)} L${r2((a.x * 2 + b.x) / 3)} ${r2((a.y * 2 + b.y) / 3)}`} stroke={p.el.dark} strokeOpacity={0.35} strokeWidth={0.6} />;
      })}
      {/* うろこの照り */}
      {Array.from({ length: 8 }, (_, i) => {
        const t = 0.12 + i * 0.1;
        const e = edge(neck, t, 8, 4, -1);
        return <path key={i} d={`M${r2(e.x - 2)} ${r2(e.y)} q2 2 4 0`} stroke={p.el.light} strokeOpacity={0.35} strokeWidth={0.6} fill="none" />;
      })}
      {/* 頭（えらのひれ・ひげ） */}
      {[[-150, 11], [-128, 13], [-106, 10]].map(([a, l]) => (
        <g key={a}>
          <path d={feather(66, 18, l, a, 4.6)} fill={p.wing} />
          <path d={`M66 18 L${r2(66 + Math.cos(rad(a)) * l)} ${r2(18 + Math.sin(rad(a)) * l)}`} stroke={p.el.light} strokeOpacity={0.5} strokeWidth={0.5} />
        </g>
      ))}
      <path d={feather(64, 28, 12, 150, 5)} fill={p.wing} />
      <Shape d="M60 24 C60 16 68 11 76 12 C84 13 90 16 96 20 C97.4 21.6 96.8 24 94.6 25 L84 28.4 C76 31.4 66 31.4 62 28.4 C60.6 27.2 60 26 60 24 Z" fill={p.body} />
      <path d="M64 28 C70 31 80 30 94.6 25 C86 26.4 76 27 68 26.4 Z" fill={p.el.light} opacity={0.5} />
      <path d="M80 25.6 L95.6 22.4" stroke={LINE} strokeWidth={0.8} opacity={0.6} strokeLinecap="round" />
      <path d="M94 24 C98 30 92 36 96 42" stroke={p.el.light} strokeWidth={0.7} fill="none" opacity={0.8} />
      <path d="M90 26 C92 34 86 38 88 46" stroke={p.el.light} strokeWidth={0.6} fill="none" opacity={0.6} />
      <GlowEye x={78} y={17.4} c={p.el.glow} rot={-8} brow={1} />
      {/* 水面（波・しぶき・波紋） */}
      {/* 水たまり（はしは まるく消える。箱のように 切れない） */}
      {[["#0b3448", 0.78], [p.el.main, 0.3], ["url(#shade-top)", 1]].map(([fill, o], i) => (
        <path key={i} d={WATER} fill={fill as string} opacity={o as number} />
      ))}
      <path d="M4 92.6 Q8 88 18 91 Q28 95 38 90 Q48 86 58 91 Q68 95 78 90 Q88 87 96 91.6" stroke={p.el.light} strokeWidth={1.1} fill="none" opacity={0.75} strokeLinecap="round" />
      <ellipse cx={40} cy={93} rx={13} ry={2.6} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={0.8} />
      <ellipse cx={19} cy={93.4} rx={15} ry={2.6} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={0.7} />
      {[[33, 86, 1.1], [48, 85, 0.9], [36, 82, 0.7], [10, 87, 0.8], [28, 88, 0.6]].map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity={0.7} />)}
      {p.tier >= 1 && <path d="M68 13 q5 -5 11 -2" stroke={p.trim} strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      {p.tier >= 2 && <Gem x={70} y={21} r={2} p={p} />}
      {p.tier >= 3 && <path d="M66 8 l2 -5 l2 4 l2 -6 l2 6 l2 -4 l2 5" stroke={p.el.glow} strokeWidth={1.2} fill="none" strokeLinejoin="round" filter="url(#f-bloom)" />}
    </g>
  );
}

function Spirit({ p, letter }: { p: P; letter?: string }) {
  const robe = "M38 40 C29 52 29 66 33 76 C35 84 31 90 24 94 C34 95 41 91 45 86 C47 92 52 96 59 96 C56 90 57 84 62 79 C69 70 71 55 62 40 Z";
  return (
    <g>
      <circle cx={50} cy={50} r={46} fill={`url(#el-${p.el.id}-aura)`} opacity={p.tier >= 2 ? 1 : 0.55} className="pulse-glow" />
      <Aura p={p} />
      <ellipse cx={50} cy={95} rx={16} ry={2.6} fill="url(#ao-floor)" opacity={0.6} />
      {/* 衣（下に向かって透けて消える）と 渦まく霧 */}
      <g mask="url(#mon-fade)">
        <path d={robe} fill={p.wing} />
        <path d={robe} fill="url(#shade-cyl)" opacity={0.7} />
        <path d="M50 44 C46 62 40 78 33 92 M52 44 C54 62 58 78 60 92" stroke={p.el.light} strokeOpacity={0.4} strokeWidth={1} fill="none" />
        <path d="M30 86 C22 84 18 76 24 72 M66 84 C76 84 80 74 74 70" stroke={p.el.glow} strokeOpacity={0.6} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
      {/* 袖（ひろがる ベル形）と 光の玉 */}
      {[1, -1].map((s) => (
        <g key={s} transform={s < 0 ? "translate(100 0) scale(-1 1)" : undefined}>
          <path d="M41 42 C31 44 22 48 14 56 C17 60 21 62 25 61 C30 56 35 53 41 53 Z" fill={p.wing} />
          <path d="M41 42 C31 44 22 48 14 56 C17 60 21 62 25 61 C30 56 35 53 41 53 Z" fill="url(#shade-top)" opacity={0.8} />
          <path d="M14 56 C17 60 21 62 25 61" stroke={p.trim} strokeWidth={1.4} fill="none" strokeLinecap="round" />
          <circle cx={17} cy={63} r={7} fill={`url(#el-${p.el.id}-aura)`} />
          <circle cx={17} cy={63} r={3.4} fill={p.el.glow} filter="url(#f-bloom)" />
          <circle cx={16.2} cy={62.2} r={1.2} fill="#fff" />
        </g>
      ))}
      {/* 肩・胸元（えり と 胸の宝玉） */}
      <path d="M36 42 C42 38 58 38 64 42 L56 54 L50 50 L44 54 Z" fill={p.body} />
      <path d="M36 42 L44 54 L50 50 L56 54 L64 42" stroke={p.trim} strokeWidth={1.3} fill="none" strokeLinejoin="round" />
      <Gem x={50} y={56} r={2.6} p={p} />
      {/* フード（顔は 光る目だけが見える 闇） */}
      <Shape d="M50 6 C62 8 69 20 67 33 C66 40 61 45 50 47 C39 45 34 40 33 33 C31 20 38 8 50 6 Z" fill={p.wing} />
      <path d="M50 6 C56 12 58 18 58 22" stroke={p.el.light} strokeOpacity={0.35} strokeWidth={1} fill="none" />
      <path d="M50 16 C57 16 60.4 22 59.4 29 C58.4 35.4 54.4 39.6 50 39.6 C45.6 39.6 41.6 35.4 40.6 29 C39.6 22 43 16 50 16 Z" fill="#0a0614" />
      <path d="M50 16 C57 16 60.4 22 59.4 29 C58.4 35.4 54.4 39.6 50 39.6 C45.6 39.6 41.6 35.4 40.6 29 C39.6 22 43 16 50 16 Z" fill={`url(#el-${p.el.id}-aura)`} opacity={0.45} />
      <path d="M41 30 C40 21 44 15 50 15 C56 15 60 21 59 30" stroke={p.trim} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <GlowEye x={46} y={27} rx={2} ry={1.1} c={p.el.glow} rot={8} />
      <GlowEye x={54} y={27} rx={2} ry={1.1} c={p.el.glow} rot={-8} />
      {p.tier >= 1 && <path d="M44 9 L47 3 L50 7 L53 3 L56 9" stroke={p.trim} strokeWidth={1.4} fill="none" strokeLinejoin="round" />}
      {p.tier >= 3 && <ellipse cx={50} cy={3} rx={13} ry={3} fill="none" stroke={p.el.glow} strokeWidth={1.4} filter="url(#f-bloom)" />}
      {letter && <text x={50} y={74} textAnchor="middle" fontSize={14} fontWeight={900} fill={p.el.light} filter="url(#f-bloom)" fontFamily="Georgia, serif">{letter}</text>}
    </g>
  );
}

/** 石のかたまり（左の面は明るく、右の面は暗く、上のふちに光） */
function Stone({ d, warm = false, top }: { d: string; warm?: boolean; top?: string }) {
  return (
    <g>
      <path d={d} fill={warm ? "url(#g-stone-warm)" : "url(#g-stone)"} />
      <path d={d} fill="url(#shade-cyl)" opacity={0.9} />
      <path d={d} fill="url(#g-stone)" opacity={0.12} filter="url(#f-texture)" />
      {top && <path d={top} stroke="#fff3d6" strokeOpacity={0.5} strokeWidth={0.9} fill="none" strokeLinecap="round" />}
      <path d={d} fill="url(#mon-rim)" />
    </g>
  );
}

function Golem({ p }: { p: P }) {
  const glow = 0.45 + p.tier * 0.15;
  return (
    <g>
      <Aura p={p} />
      <Floor rx={40} />
      {/* 脚（短く太い） */}
      <Stone d="M33 72 L31 92 L47 92 L46 74 Z" top="M32 92 L46 92" />
      <Stone d="M55 74 L54 92 L70 92 L68 72 Z" />
      {/* 胴（面取りした石のかたまり） */}
      <Stone warm d="M27 32 L73 32 L81 48 L75 72 L63 80 L37 80 L25 72 L19 48 Z" top="M28 33 L72 33" />
      <path d="M27 32 L37 46 L63 46 L73 32 M37 46 L33 70 M63 46 L67 70 M33 70 L37 80 M67 70 L63 80" stroke="#000" strokeOpacity={0.3} strokeWidth={0.9} fill="none" />
      <path d="M37 46 L63 46" stroke="#fff3d6" strokeOpacity={0.35} strokeWidth={0.7} />
      {/* ひびの奥で光る属性の力 */}
      <path d="M40 50 l4 8 l-3 7 l4 9 M62 50 l-3 7 l4 6" stroke="#000" strokeOpacity={0.5} strokeWidth={1.3} fill="none" />
      <path d="M40.5 50.5 l4 8 l-3 7 l4 9 M62.5 50.5 l-3 7 l4 6" stroke={p.el.glow} strokeOpacity={glow} strokeWidth={0.8} fill="none" filter="url(#f-bloom)" />
      {/* 胸の核 */}
      <circle cx={50} cy={58} r={8} fill="#1a140c" opacity={0.7} />
      <g filter="url(#f-bloom)">
        <circle cx={50} cy={58} r={5 + p.tier * 0.6} fill={p.el.glow} opacity={0.9} />
        <path d="M50 51.6 l2.6 6.4 l-2.6 6.4 l-2.6 -6.4 z" fill="#fff" />
      </g>
      {/* 腕（上腕 → 前腕 → 大きなこぶし） */}
      {[1, -1].map((s) => (
        <g key={s} transform={s < 0 ? "translate(100 0) scale(-1 1)" : undefined}>
          <Stone d="M15 44 L26 46 L22 62 L10 59 Z" />
          {/* ひじの つなぎ目で 光る力 */}
          <circle cx={16} cy={61} r={2.2} fill={p.el.glow} opacity={0.5 + p.tier * 0.12} filter="url(#f-bloom)" />
          <Stone d="M8 60 L23 62 L22 73 L5 72 Z" top="M8 60.4 L22 62.2" />
          {/* こぶし（まるみのある 大きな岩。地面から少し 浮かせて 脚と見まちがえないように） */}
          <Stone d="M3 73 C3 70 6 69 9 69 L22 70 C25 70 26 72 26 75 L25.4 83 C25 86 22 87.4 19 87.4 L8 87 C5 87 3 85 3 82 Z" top="M6 69.6 L22 70.4" />
          <path d="M9 74 v9 M14 74 v10 M19 74 v10" stroke="#000" strokeOpacity={0.3} strokeWidth={0.8} />
          <path d="M3.4 76 C1 77 0.6 81 3.4 83" stroke="#000" strokeOpacity={0.25} strokeWidth={0.8} fill="none" />
          {/* 肩の岩と 属性の結晶 */}
          <Stone warm d="M11 40 L17 27 L30 25 L37 33 L35 46 L22 50 Z" top="M17 27.4 L30 25.4" />
          <g>
            <path d="M16 30 L19 14 L24 28 Z" fill={p.body} />
            <path d="M22 28 L27 9 L31 27 Z" fill={p.body} />
            <path d="M28 27 L32 18 L34 28 Z" fill={p.body} />
            <path d="M19 14 L24 28 L21 29 Z M27 9 L31 27 L28 27.6 Z" fill="#fff" opacity={0.35} />
            <path d="M16 30 L19 14 L24 28 Z M22 28 L27 9 L31 27 Z" fill={p.el.glow} opacity={0.25} filter="url(#f-bloom)" />
          </g>
        </g>
      ))}
      {/* 頭（肩のあいだに しずむ。ひたいが 張り出す） */}
      <Stone warm d="M39 20 L61 20 L65 28 L62 40 L38 40 L35 28 Z" top="M40 20.4 L60 20.4" />
      <path d="M35 28 L65 28 L63 31 L37 31 Z" fill="#000" opacity={0.35} />
      <rect x={41} y={31.4} width={18} height={3} rx={1.5} fill={p.el.glow} filter="url(#f-bloom)" />
      <path d="M44 37 h12" stroke="#000" strokeOpacity={0.35} strokeWidth={0.8} />
      {p.tier >= 1 && <path d="M30 40 L50 46 L70 40" stroke={p.trim} strokeWidth={1.8} fill="none" />}
      {p.tier >= 2 && <path d="M41 20 L44 13 L50 17 L56 13 L59 20" fill={p.trim} />}
      {p.tier >= 3 && <path d="M41 13 L44 6 L50 10 L56 6 L59 13" stroke={p.el.glow} strokeWidth={1.3} fill="none" strokeLinejoin="round" filter="url(#f-bloom)" />}
    </g>
  );
}

function Unicorn({ p }: { p: P }) {
  const legs = {
    farHind: [[40, 62], [36, 74], [42, 82], [38, 91]] as Bez,
    farFront: [[66, 62], [66, 74], [63, 84], [64, 91]] as Bez,
    nearHind: [[31, 58], [22, 72], [32, 80], [28, 91]] as Bez,
    nearFront: [[70, 60], [75, 70], [81, 67], [83, 75]] as Bez,
  };
  return (
    <g>
      <Aura p={p} cy={50} />
      <Floor rx={34} />
      {/* 奥の脚 */}
      <Far d={tube(legs.farHind, 7, 3)} fill={p.pale} />
      <path d={foot(legs.farHind, 3.4, 2.4)} fill={p.trim} />
      <Far d={tube(legs.farFront, 6.5, 3)} fill={p.pale} />
      <path d={foot(legs.farFront, 3.4, 2.4)} fill={p.trim} />
      {/* しっぽ（属性の色が流れる 毛の房） */}
      {[[0, 0], [3, 3], [-3, 4]].map(([dx, dy], i) => (
        <path key={i} d={`M25 ${50 + dy * 0.3} C${12 + dx} ${52 + dy} ${5 + dx} ${64 + dy} ${8 + dx} ${80 + dy} C${10 + dx} ${86 + dy} ${14 + dx} ${89 + dy} ${18 + dx} ${90 + dy} C${14 + dx} ${80} ${16 + dx} ${70} ${24 + dx * 0.4} ${60} Z`} fill={i === 1 ? p.wing : p.body} opacity={i === 0 ? 1 : 0.85} />
      ))}
      <path d="M22 54 C12 60 10 72 14 84" stroke={p.el.light} strokeOpacity={0.45} strokeWidth={0.7} fill="none" />
      {/* 胴（まるい おしり → 深い胸） */}
      <Shape d="M22 56 C22 47 30 44 38 46 C46 46 60 46 68 45 C76 46 80 54 76 62 C72 68 62 68 52 68 C46 68 40 69 34 70 C27 70 22 64 22 56 Z" fill={p.pale} />
      <path d="M34 69 C44 70 60 69 72 64 C64 66 50 66 40 65 Z" fill="#000" opacity={0.12} />
      {/* 手前の脚（後ろ足 → 前足は はねあげる） */}
      <Shape d={tube(legs.nearHind, 9, 3.4)} fill={p.pale} shade="url(#shade-cyl)" />
      <path d={foot(legs.nearHind, 3.8, 2.6)} fill={p.trim} />
      <Shape d={tube(legs.nearFront, 8, 3.4)} fill={p.pale} shade="url(#shade-cyl)" />
      <path d={foot(legs.nearFront, 3.8, 2.6)} fill={p.trim} />
      {/* 首（弓なり） */}
      <Shape d="M61 49 C61 36 68 24 78 18 L86 22 C84 30 82 40 78 56 C71 56 65 53 61 49 Z" fill={p.pale} />
      {/* 頭 */}
      <Shape d="M76 16 C80 12 86 12.6 88.4 17 L96 29.4 C97.4 32.6 95.4 35.4 92 35.4 C89 35.4 87 33.6 85 31.4 L78 26.4 Z" fill={p.pale} />
      <ellipse cx={93.4} cy={31.6} rx={1} ry={0.7} fill={LINE} opacity={0.5} />
      <path d="M90 34.6 q2 0.8 4 0.2" stroke={LINE} strokeOpacity={0.4} strokeWidth={0.6} fill="none" />
      <path d="M80 15 L81.4 6.4 L84.6 13.6 Z" fill={p.pale} />
      <path d="M81 13.6 L81.8 8.4 L83.6 12.8 Z" fill={p.el.main} opacity={0.5} />
      <GlowEye x={84} y={21.4} rx={1.8} ry={1.3} c={p.el.main} rot={20} brow={0.4} />
      {/* たてがみ（首にそって流れる房） */}
      <path d="M79 15 C70 17 64 25 62 35 C60 41 58 47 55 52 C61 50 63 46 63.4 42 C65.4 46 65.4 50 63.4 54 C69.4 48 69.6 40 69.6 34 C71.6 38 71.6 42 69.6 46 C75.6 38 75.6 28 80 20 Z" fill={p.body} />
      <path d="M79 15 C70 17 64 25 62 35" stroke={p.el.light} strokeOpacity={0.5} strokeWidth={0.8} fill="none" />
      <path d="M80 15 C84 14 86 17 85 20 C83 18 81 18 79 19 Z" fill={p.body} />
      {/* らせんの角（光る） */}
      <g filter="url(#f-bloom)">
        <path d="M81.4 14.4 L93 -5 L86.6 15.6 Z" fill={p.trim} />
        <path d="M83 10.6 l3.6 0.4 M84.8 6.6 l3 0.4 M86.6 2.6 l2.4 0.3 M88.4 -1.2 l1.8 0.2" stroke={p.el.glow} strokeWidth={0.9} />
      </g>
      {p.tier >= 1 && <path d="M64 50 Q70 56 77 54" stroke={p.trim} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
      {p.tier >= 2 && <path d="M40 46 Q52 52 64 46 L62 54 Q52 58 42 54 Z" fill={p.trim} opacity={0.9} />}
      {p.tier >= 2 && <Gem x={52} y={52} r={2} p={p} />}
      {p.tier >= 3 && <ellipse cx={86} cy={-2} rx={8} ry={2} fill="none" stroke={p.el.glow} strokeWidth={1.1} filter="url(#f-bloom)" />}
    </g>
  );
}

function Griffin({ p }: { p: P }) {
  const hind: Bez = [[30, 68], [22, 78], [31, 84], [28, 91]];
  const front: Bez = [[64, 70], [67, 78], [64, 85], [66, 91]];
  const talons = (x: number) => <path d={`M${x - 3} 92.4 q-1.6 0.6 -1.8 2 M${x} 92.6 q0 1 0.4 2 M${x + 3} 92.4 q1.6 0.6 1.8 2`} stroke={LINE} strokeWidth={0.9} strokeLinecap="round" fill="none" />;
  return (
    <g>
      <Aura p={p} cy={48} />
      <Floor rx={36} />
      {/* 奥の翼（右上へ） */}
      <g opacity={0.92}>
        <FeatherWing p={p} sh={[60, 48]} wr={[76, 20]} a0={-6} a1={-84} l0={14} l1={26} n={10} />
      </g>
      {/* 奥の脚 */}
      <Far d={tube([[40, 70], [36, 80], [42, 85], [40, 91]], 7, 4)} fill="url(#g-tawny)" />
      <Far d={tube([[70, 70], [73, 78], [70, 85], [72, 91]], 4.4, 3)} fill={p.trim} />
      {/* 獅子のしっぽ（先に 房） */}
      <path d={tube([[22, 64], [8, 68], [3, 56], [10, 46]], 3.4, 2)} fill="url(#g-tawny)" />
      <path d={feather(10, 47, 9, -70, 5)} fill={p.body} />
      <path d={feather(10, 47, 7, -100, 4)} fill={p.wing} />
      {/* 獅子の体 */}
      <Shape d="M19 62 C19 52 29 48 41 50 L60 50 C70 50 74 58 72 68 C70 76 62 78 54 78 L32 78 C24 78 19 72 19 62 Z" fill="url(#g-tawny)" />
      <Shape d="M19 63 C19 55 30 53 36 58 C40 64 38 74 32 77 C25 78 19 72 19 63 Z" fill="url(#g-tawny)" />
      <Shape d={tube(hind, 8.4, 4)} fill="url(#g-tawny)" shade="url(#shade-cyl)" />
      <path d="M23 93.6 C23 91 25.6 89.6 29 89.6 C32.6 89.6 34 91 34 93.6 Z" fill="url(#g-tawny)" />
      {/* 鷲の胸（羽毛がうろこのように重なる） */}
      <Shape d="M53 45 C66 39 77 48 77 60 C77 70 69 76 58 76 C53 70 51 58 53 45 Z" fill={p.body} />
      {[[60, 52], [66, 52], [72, 54], [58, 58], [64, 58], [70, 60], [60, 64], [66, 66]].map(([x, y]) => <path key={`${x}-${y}`} d={`M${x - 2.6} ${y} q2.6 2.6 5.2 0`} stroke={p.el.light} strokeOpacity={0.5} strokeWidth={0.7} fill="none" />)}
      {/* 鷲の前足（うろこの脚と かぎ爪） */}
      <Shape d={tube(front, 5, 3.2)} fill={p.trim} shade="url(#shade-cyl)" />
      {[0.4, 0.6, 0.8].map((t) => { const [x, y] = bez(front, t); return <path key={t} d={`M${r2(x - 2)} ${r2(y)} h4`} stroke={LINE} strokeOpacity={0.3} strokeWidth={0.5} />; })}
      {talons(66)}
      {/* 手前の翼（左上へ） */}
      <FeatherWing p={p} sh={[52, 52]} wr={[32, 22]} a0={184} a1={258} l0={16} l1={28} n={11} />
      {/* 鷲の頭（羽の房・曲がったくちばし） */}
      <path d={feather(62, 24, 10, 196, 4.4)} fill={p.pale} />
      <path d={feather(62, 28, 9, 172, 4)} fill={p.pale} />
      <Shape d="M59 30 C59 20 67 15.6 74 17.6 C80 19.4 82.4 25.6 80.6 31.6 C78.6 38 72 44 63 46 C59.6 42 59 36 59 30 Z" fill={p.pale} />
      <path d="M78 23.6 C86 23.4 90.4 27.6 89.4 34 C88.4 32 86.4 31 83 31 L79 32 Z" fill="url(#metal-gold)" />
      <path d="M79 32 L83 31 C85.4 31 87 31.6 88 32.6" stroke={LINE} strokeOpacity={0.55} strokeWidth={0.6} fill="none" />
      <GlowEye x={72} y={25} rx={1.9} ry={1.4} c={p.el.glow} brow={1} />
      {p.tier >= 1 && <path d="M58 44 Q66 48 74 44" stroke={p.trim} strokeWidth={1.8} fill="none" strokeLinecap="round" />}
      {p.tier >= 2 && <Gem x={66} y={46.6} r={2} p={p} />}
      {p.tier >= 3 && <path d="M63 15 l2 -5 l2.4 3.6 l2.4 -5 l2.4 5 l2.4 -3.6 l2 5" stroke={p.el.glow} strokeWidth={1.2} fill="none" strokeLinejoin="round" filter="url(#f-bloom)" />}
    </g>
  );
}

function Lion({ p }: { p: P }) {
  const tail: Bez = [[16, 64], [4, 66], [2, 52], [8, 44]];
  const paw = (x: number) => (
    <g>
      <path d={`M${x - 5.4} 93.6 C${x - 5.4} 90 ${x - 2.4} 88.6 ${x + 1} 88.6 C${x + 4.4} 88.6 ${x + 6.6} 90.4 ${x + 6.6} 93.6 Z`} fill="url(#g-tawny)" />
      <path d={`M${x - 1.6} 93.4 v-2 M${x + 1.6} 93.4 v-2.2 M${x + 4.4} 93.4 v-1.8`} stroke={LINE} strokeOpacity={0.4} strokeWidth={0.6} />
    </g>
  );
  const maneBack = Array.from({ length: 28 }, (_, i) => (i / 28) * 360);
  const maneFront = Array.from({ length: 22 }, (_, i) => (i / 22) * 360 + 8);
  return (
    <g>
      <Aura p={p} cy={46} />
      <Floor rx={38} />
      {/* しっぽ（先の房は 属性の色） */}
      <path d={tube(tail, 3.6, 2)} fill="url(#g-tawny)" />
      <path d={feather(8, 45, 9, -80, 5.4)} fill={p.body} />
      <path d={feather(8, 45, 7, -110, 4)} fill={p.wing} />
      {p.tier >= 1 && <circle cx={8} cy={39} r={2.2} fill={p.el.glow} filter="url(#f-bloom)" opacity={0.8} />}
      {/* 奥の脚 */}
      <Far d={tube([[30, 74], [28, 82], [32, 86], [30, 92]], 9, 7)} fill="url(#g-tawny)" />
      <Far d={tube([[72, 72], [74, 80], [72, 86], [74, 92]], 9, 7)} fill="url(#g-tawny)" />
      {/* 体 */}
      <Shape d="M12 66 C12 56 22 52 36 52 L60 52 C72 54 78 62 76 72 C74 80 66 84 58 84 L26 84 C16 84 12 76 12 66 Z" fill="url(#g-tawny)" />
      <Shape d="M12 66 C12 57 22 54 28 58 C34 64 32 78 26 83 C18 84 12 76 12 66 Z" fill="url(#g-tawny)" />
      <Shape d={tube([[22, 78], [18, 84], [22, 88], [21, 92]], 9, 7)} fill="url(#g-tawny)" shade="url(#shade-cyl)" />
      {paw(20)}
      <Shape d={tube([[60, 72], [61, 80], [59, 86], [60, 92]], 10, 7.6)} fill="url(#g-tawny)" shade="url(#shade-cyl)" />
      {paw(60)}
      {/* たてがみ（炎のような房を 奥 → 手前の2段で） */}
      {maneBack.map((a, i) => (
        <path key={`b${i}`} d={feather(64 + Math.cos(rad(a)) * 8, 40 + Math.sin(rad(a)) * 8, 16 + (i % 3) * 3.4, a + 14, 6, 3)} fill={p.wing} />
      ))}
      {maneFront.map((a, i) => (
        <g key={`f${i}`}>
          <path d={feather(64 + Math.cos(rad(a)) * 7, 40 + Math.sin(rad(a)) * 7, 12 + (i % 3) * 2.4, a + 16, 5.4, 2.6)} fill={p.body} />
          <path d={`M${r2(64 + Math.cos(rad(a)) * 9)} ${r2(40 + Math.sin(rad(a)) * 9)} Q${r2(64 + Math.cos(rad(a + 8)) * 14)} ${r2(40 + Math.sin(rad(a + 8)) * 14)} ${r2(64 + Math.cos(rad(a + 14)) * 18)} ${r2(40 + Math.sin(rad(a + 14)) * 18)}`} stroke={p.el.light} strokeOpacity={0.35} strokeWidth={0.5} fill="none" />
        </g>
      ))}
      <circle cx={64} cy={40} r={24} fill="url(#shade-sphere)" opacity={0.45} />
      {/* 耳 */}
      <ellipse cx={55} cy={28} rx={3.6} ry={3} fill="url(#g-tawny)" />
      <ellipse cx={73} cy={28} rx={3.6} ry={3} fill="url(#g-tawny)" />
      <ellipse cx={55} cy={28.6} rx={1.8} ry={1.4} fill="#5e3a16" opacity={0.6} />
      <ellipse cx={73} cy={28.6} rx={1.8} ry={1.4} fill="#5e3a16" opacity={0.6} />
      {/* 顔（はば広い鼻すじ・ひげの ふくらみ・あご） */}
      <Shape d="M54 32 C56 26 72 26 74 32 C76 38 76 44 72 50 C70 54 67 56.4 64 56.4 C61 56.4 58 54 56 50 C52 44 52 38 54 32 Z" fill="url(#g-tawny)" />
      <path d="M61 33 C62 38 62 41 61 44 L67 44 C66 41 66 38 67 33 Z" fill="#ffe9bf" opacity={0.35} />
      <ellipse cx={61} cy={48} rx={4} ry={3} fill="#fff1d6" />
      <ellipse cx={67} cy={48} rx={4} ry={3} fill="#fff1d6" />
      <ellipse cx={64} cy={53} rx={3} ry={2} fill="#fff1d6" opacity={0.9} />
      {[[58.6, 47.6], [59.8, 49.2], [69.4, 47.6], [68.2, 49.2]].map(([x, y]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={0.35} fill="#5e3a16" />)}
      <path d="M60.4 43.4 L67.6 43.4 C67.2 46 65.4 47.2 64 47.2 C62.6 47.2 60.8 46 60.4 43.4 Z" fill="#3a1d0a" />
      <path d="M62 44 q2 -0.6 4 0" stroke="#fff" strokeOpacity={0.35} strokeWidth={0.5} fill="none" />
      <path d="M64 47.2 L64 49.4 M61 50.4 Q64 51.6 67 50.4" stroke="#3a1d0a" strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <GlowEye x={58.6} y={37} rx={2} ry={1.2} c={p.el.glow} rot={10} brow={1} />
      <GlowEye x={69.4} y={37} rx={2} ry={1.2} c={p.el.glow} rot={-10} brow={-1} />
      {/* 王冠 */}
      <path d="M55 27 L57.6 18 L61 23.6 L64 15 L67 23.6 L70.4 18 L73 27 Q64 24 55 27 Z" fill={p.trim} />
      <path d="M55 27 Q64 24 73 27" stroke={LINE} strokeOpacity={0.35} strokeWidth={0.6} fill="none" />
      {p.tier >= 1 && <circle cx={64} cy={22.6} r={1.6} fill={p.el.glow} filter="url(#f-bloom)" />}
      {p.tier >= 2 && <path d="M36 56 Q46 62 56 58" stroke={p.trim} strokeWidth={2} fill="none" strokeLinecap="round" />}
      {p.tier >= 3 && <path d="M56 15 Q64 10 72 15" stroke={p.el.glow} strokeWidth={1.3} fill="none" filter="url(#f-bloom)" />}
    </g>
  );
}

const DRAW: Record<ArchetypeId, (props: { p: P; letter?: string }) => React.ReactElement> = {
  dragon: Dragon, wolf: Wolf, behemoth: Behemoth, phoenix: Phoenix, leviathan: Leviathan,
  spirit: Spirit, golem: Golem, unicorn: Unicorn, griffin: Griffin, lion: Lion,
};

function paletteOf(m: MonsterDef): P {
  const el = elementOf(m);
  const tier = TIER[m.rarity] ?? 0;
  return {
    el,
    body: `url(#el-${el.id}-body)`,
    wing: `url(#el-${el.id}-wing)`,
    pale: `url(#el-${el.id}-pale)`,
    trim: tier >= 2 ? "url(#metal-platinum)" : tier >= 1 ? "url(#metal-gold)" : el.light,
    tier,
  };
}

/** flip: 外側で左右反転して置くときに true（ルーンや文字は読める向きのまま） */
export function MonsterArt({ id, letter, flip: _flip }: { id: string; letter?: string; flip?: boolean }) {
  const m = resolveMonster(id);
  const Draw = DRAW[m.archetype] ?? Dragon;
  const p = paletteOf(m);
  return (
    <g>
      {/* 足もとに属性の光がにじむ（照り返し） */}
      <ellipse cx={50} cy={93} rx={30} ry={4.5} fill={`url(#el-${p.el.id}-aura)`} opacity={0.35 + p.tier * 0.12} />
      <Draw p={p} letter={letter} />
      {/* レア以上: まわりを舞う光のかけら */}
      {p.tier >= 1 && (
        <g filter="url(#f-bloom)">
          {[[14, 30], [86, 40], [20, 70], [82, 76], [50, 6]].slice(0, 2 + p.tier).map(([x, y], i) => (
            <path key={i} d={`M${x} ${y - 2.4} L${x + 0.7} ${y - 0.7} L${x + 2.4} ${y} L${x + 0.7} ${y + 0.7} L${x} ${y + 2.4} L${x - 0.7} ${y + 0.7} L${x - 2.4} ${y} L${x - 0.7} ${y - 0.7} Z`} fill={p.el.light} className="spark" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </g>
      )}
    </g>
  );
}

export function MonsterFigure({ id, size = 64, className = "", letter, flip = false, rim = true }: { id: string; size?: number; className?: string; letter?: string; flip?: boolean; rim?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden overflow="visible">
      <g filter={rim ? "url(#f-rim)" : undefined}>
        <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}><MonsterArt id={id} letter={letter} flip={flip} /></g>
      </g>
    </svg>
  );
}
