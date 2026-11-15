/**
 * 英語モンスター（全100体）のイラスト。100×100 の座標系、地面は y≒94。
 *
 * 「種族の形」（10種）×「属性の色と光」（10種）で描く。色は ArtDefs の url(#el-<属性>-body) などを参照。
 * レア度が上がるほど装飾が増える: RARE＝金の装飾 / EPIC＝オーラ＋プラチナの装飾 / LEGENDARY＝光輪＋ルーン＋強いオーラ。
 * どんな id を渡しても lib/game/monsters の resolveMonster が必ず1体を返すので、表示が欠けることはない。
 */
import { elementOf, resolveMonster, type ArchetypeId, type ElementDef, type MonsterDef, type Rarity } from "@/lib/game/monsters";

const LINE = "#140a06";

interface P {
  el: ElementDef;
  body: string; // 体（陰影つきの属性グラデーション）
  wing: string; // 翼膜・ひれ
  trim: string; // 角・よろいの金属
  tier: number; // 0=COMMON … 3=LEGENDARY
}

const TIER: Record<Rarity, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };

/** 光る目 */
function GlowEye({ x, y, rx = 2.6, ry = 1.5, c, rot = 0 }: { x: number; y: number; rx?: number; ry?: number; c: string; rot?: number }) {
  return (
    <g filter="url(#f-bloom)">
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={c} transform={`rotate(${rot} ${x} ${y})`} />
      <ellipse cx={x} cy={y} rx={rx * 0.35} ry={ry * 0.8} fill="#fff" transform={`rotate(${rot} ${x} ${y})`} />
    </g>
  );
}

/** 体のパーツ: 色＋立体の陰影 */
function Shape({ d, fill, shade = "url(#shade-sphere)", o = 0.85 }: { d: string; fill: string; shade?: string; o?: number }) {
  return <g><path d={d} fill={fill} /><path d={d} fill={shade} opacity={o} /></g>;
}

const Floor = ({ rx = 34 }: { rx?: number }) => <ellipse cx={50} cy={94} rx={rx} ry={5} fill="url(#ao-floor)" />;

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

// ---------------------------------------------------------------------------
// 種族ごとの形
// ---------------------------------------------------------------------------

function Dragon({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} cy={50} />
      <Floor rx={38} />
      {/* 奥の翼 */}
      <path d="M52 46 L90 6 L86 22 L98 20 L84 36 L94 40 L70 52 Z" fill={p.wing} opacity={0.75} />
      {/* 尾 */}
      <path d="M36 70 Q14 74 8 62 Q4 54 12 50" stroke={p.el.dark} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M36 70 Q14 74 8 62 Q4 54 12 50" stroke={p.body} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M12 50 l-6 -6 l9 2 z" fill={p.trim} />
      {/* 後ろ足・胴 */}
      <Shape d="M30 70 Q28 84 34 92 L42 92 L40 76 Z" fill={p.body} shade="url(#shade-cyl)" />
      <Shape d="M26 64 Q30 46 52 48 Q72 50 72 66 Q68 80 48 80 Q30 80 26 64 Z" fill={p.body} />
      <path d="M36 74 Q48 80 62 74 Q56 66 46 66 Q38 68 36 74 Z" fill={p.el.light} opacity={0.55} />
      {[40, 46, 52, 58].map((x) => <path key={x} d={`M${x} 68 l1 9`} stroke={p.el.dark} strokeOpacity={0.4} strokeWidth={1} />)}
      {/* 前足（爪） */}
      <Shape d="M60 72 Q64 84 62 92 L70 92 L70 78 Z" fill={p.body} shade="url(#shade-cyl)" />
      <path d="M61 92 l-2 3 M65 92 l0 3 M69 92 l2 3" stroke={p.trim} strokeWidth={1.4} strokeLinecap="round" />
      {/* 手前の翼（骨と膜） */}
      <path d="M48 50 L18 8 L22 26 L6 22 L20 38 L4 42 L34 56 Z" fill={p.wing} />
      <path d="M48 50 L18 8 M48 50 L6 22 M48 50 L4 42" stroke={p.el.dark} strokeWidth={1.6} fill="none" />
      <path d="M48 50 L18 8 L22 26 L6 22" fill="url(#shade-top)" opacity={0.5} />
      {/* 首と頭 */}
      <path d="M64 56 Q70 40 72 28" stroke={p.el.dark} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d="M64 56 Q70 40 72 28" stroke={p.body} strokeWidth={10} fill="none" strokeLinecap="round" />
      {[44, 38, 32].map((y, i) => <path key={y} d={`M${62 + i * 2} ${y + 8} l-5 -3 l4 -3`} fill={p.trim} />)}
      <Shape d="M64 24 Q70 14 82 17 L95 24 Q88 30 76 31 Q66 31 64 24 Z" fill={p.body} />
      <path d="M78 28 L95 24" stroke={LINE} strokeWidth={1} opacity={0.6} />
      <path d="M70 18 L58 4 L74 14 Z M76 16 L70 2 L80 13 Z" fill={p.trim} />
      <GlowEye x={78} y={21} c={p.el.glow} rot={-12} />
      {p.tier >= 1 && <path d="M66 20 q6 -3 12 -1" stroke={p.trim} strokeWidth={1.2} fill="none" />}
      {p.tier >= 3 && <path d="M66 12 l3 -8 l3 6 l3 -8 l3 8" stroke={p.trim} strokeWidth={1.6} fill="none" filter="url(#f-bloom)" />}
    </g>
  );
}

function Wolf({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} />
      <Floor rx={32} />
      {/* しっぽ（先が属性の光） */}
      <path d="M68 78 Q92 76 90 54 Q88 44 80 42" stroke={p.body} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M86 50 Q90 44 82 40" stroke={p.el.glow} strokeWidth={6} fill="none" strokeLinecap="round" filter="url(#f-bloom)" />
      {/* 座った体 */}
      <Shape d="M40 54 Q36 70 42 90 L76 90 Q82 72 72 58 Q60 48 40 54 Z" fill={p.body} />
      <Shape d="M42 70 L40 92 L48 92 L50 72 Z M54 70 L54 92 L62 92 L60 72 Z" fill={p.body} shade="url(#shade-cyl)" />
      {/* たてがみ（胸の毛） */}
      <path d="M30 40 L26 54 L34 50 L30 64 L40 58 L38 72 L48 62 L52 46 Z" fill={p.el.light} opacity={0.75} />
      {/* 頭 */}
      <Shape d="M28 26 Q30 14 44 14 Q56 16 58 28 Q58 38 48 42 L32 44 Q22 40 14 36 Q20 30 28 26 Z" fill={p.body} />
      <path d="M14 36 Q20 36 26 40" stroke={LINE} strokeWidth={1} fill="none" opacity={0.6} />
      <path d="M38 16 L36 0 L46 12 Z M48 16 L52 2 L56 18 Z" fill={p.body} />
      <path d="M39 13 L37.5 4 L44 11 Z" fill={p.el.dark} />
      <GlowEye x={36} y={27} c={p.el.glow} rot={-8} />
      {/* 肩のルーン */}
      {p.tier >= 1 && <path d="M60 64 l4 -8 l4 8 m-6 -3 h4" stroke={p.el.glow} strokeWidth={1.4} fill="none" filter="url(#f-bloom)" />}
      {p.tier >= 2 && <path d="M40 46 Q50 50 58 44" stroke={p.trim} strokeWidth={3} fill="none" />}
      {p.tier >= 3 && <circle cx={50} cy={47} r={2.6} fill={p.el.glow} filter="url(#f-bloom)" />}
    </g>
  );
}

function Behemoth({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} cy={60} />
      <Floor rx={42} />
      {[18, 32, 64, 78].map((x) => <Shape key={x} d={`M${x} 74 L${x - 1} 92 L${x + 10} 92 L${x + 9} 74 Z`} fill={p.el.dark} shade="url(#shade-cyl)" />)}
      <Shape d="M10 62 Q12 40 44 38 Q80 38 88 58 Q90 76 70 80 L22 80 Q8 78 10 62 Z" fill={p.body} />
      {/* よろいの板（とがった装甲が重なる） */}
      {[22, 38, 54, 70].map((x, i) => (
        <g key={x}>
          <path d={`M${x - 9} 50 L${x - 6} ${40 - (i % 2) * 3} L${x} ${30 - (i % 2) * 3} L${x + 6} ${40 - (i % 2) * 3} L${x + 9} 50 L${x + 5} 60 L${x - 5} 60 Z`} fill={p.trim} />
          <path d={`M${x - 9} 50 L${x - 6} ${40 - (i % 2) * 3} L${x} ${30 - (i % 2) * 3} L${x} 60 L${x - 5} 60 Z`} fill="#fff" opacity={0.18} />
          <path d={`M${x - 9} 50 L${x + 9} 50`} stroke="#000" strokeOpacity={0.35} strokeWidth={1} />
        </g>
      ))}
      {/* 頭と角 */}
      <Shape d="M78 50 Q96 50 98 66 Q96 76 84 76 L74 70 Z" fill={p.body} />
      <path d="M90 56 Q100 44 94 30 Q92 44 84 52 Z" fill={p.trim} />
      <path d="M86 72 q6 6 10 2" stroke="#fff4dc" strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <GlowEye x={86} y={60} c={p.el.glow} />
      {p.tier >= 2 && <path d="M30 64 h40" stroke={p.el.glow} strokeWidth={1.6} strokeDasharray="4 3" filter="url(#f-bloom)" />}
    </g>
  );
}

function Phoenix({ p }: { p: P }) {
  const feathers = [-60, -45, -30, -15];
  return (
    <g>
      <Aura p={p} cy={46} r={48} />
      <Floor rx={22} />
      {/* 尾羽（扇のように広がり、先が光る） */}
      {[-30, -15, 0, 15, 30].map((r, i) => (
        <g key={r} transform={`rotate(${r} 50 64)`}>
          <path d="M50 64 Q46 80 50 96 Q54 80 50 64 Z" fill={i === 2 ? p.body : p.wing} />
          <ellipse cx={50} cy={95} rx={3} ry={2.2} fill={p.el.glow} filter="url(#f-bloom)" />
        </g>
      ))}
      {/* 翼（左右に重ねた羽根） */}
      {[-1, 1].map((s) => (
        <g key={s} transform={s < 0 ? "translate(100 0) scale(-1 1)" : undefined}>
          {feathers.map((r, i) => (
            <path key={r} d="M54 48 Q74 30 96 18 Q84 36 60 54 Z" fill={i % 2 ? p.wing : p.body} transform={`rotate(${r + 60} 54 48)`} opacity={0.95} />
          ))}
          <path d="M54 48 Q74 30 96 18" stroke={p.el.light} strokeOpacity={0.6} strokeWidth={1.2} fill="none" />
        </g>
      ))}
      {/* 体と頭 */}
      <Shape d="M50 30 Q62 36 60 54 Q58 68 50 70 Q42 68 40 54 Q38 36 50 30 Z" fill={p.body} />
      <Shape d="M50 14 Q58 16 58 26 Q56 34 50 34 Q44 34 42 26 Q42 16 50 14 Z" fill={p.body} />
      <path d="M50 14 Q46 4 40 2 Q48 2 52 8 Q54 2 60 0 Q56 8 54 14 Z" fill={p.el.glow} filter="url(#f-bloom)" />
      <path d="M48 26 L50 32 L52 26 Z" fill={p.trim} />
      <GlowEye x={46} y={23} rx={1.8} ry={1.2} c={p.el.light} />
      <GlowEye x={54} y={23} rx={1.8} ry={1.2} c={p.el.light} />
      {p.tier >= 1 && <circle cx={50} cy={44} r={2.4} fill={p.trim} />}
    </g>
  );
}

function Leviathan({ p }: { p: P }) {
  const body = "M14 92 Q8 70 28 66 Q52 62 50 44 Q48 26 68 22";
  return (
    <g>
      <Aura p={p} cy={50} />
      {/* 水しぶき */}
      <path d="M2 94 Q14 84 26 94 Q38 84 50 94 Q62 84 74 94 Q86 84 98 94 L98 100 L2 100 Z" fill={p.el.dark} opacity={0.75} />
      <path d="M4 92 Q14 86 24 92 M52 92 Q62 86 72 92" stroke={p.el.light} strokeWidth={1.4} fill="none" opacity={0.8} />
      {/* 体（うろこの光）とひれ */}
      <path d={body} stroke={p.el.dark} strokeWidth={17} fill="none" strokeLinecap="round" />
      <path d={body} stroke={p.el.main} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={body} stroke={p.el.light} strokeWidth={3} fill="none" strokeLinecap="round" strokeDasharray="5 6" opacity={0.65} transform="translate(-2 -3)" />
      <path d="M30 60 L24 46 L36 56 Z M46 52 L44 36 L52 48 Z M52 36 L58 22 L60 34 Z" fill={p.wing} />
      {/* 頭（えらのひれ・角） */}
      <Shape d="M60 22 Q66 10 80 12 L96 18 Q90 26 78 28 Q64 30 60 22 Z" fill={p.body} />
      <path d="M64 14 L54 4 L66 10 Z M70 12 L66 0 L74 9 Z" fill={p.wing} />
      <path d="M62 26 L52 34 L64 30 Z" fill={p.wing} />
      <path d="M80 24 L96 18" stroke={LINE} strokeWidth={0.9} opacity={0.6} />
      <GlowEye x={78} y={17} c={p.el.glow} rot={-8} />
      {p.tier >= 2 && <path d="M66 10 q6 -6 12 -2" stroke={p.trim} strokeWidth={1.6} fill="none" />}
    </g>
  );
}

function Spirit({ p, letter }: { p: P; letter?: string }) {
  const robe = "M50 26 Q66 30 70 50 Q76 72 88 92 Q70 88 60 96 Q52 86 46 96 Q36 86 14 92 Q28 72 30 50 Q34 30 50 26 Z";
  return (
    <g>
      <circle cx={50} cy={50} r={46} fill={`url(#el-${p.el.id}-aura)`} opacity={p.tier >= 2 ? 1 : 0.6} className="pulse-glow" />
      <Aura p={p} />
      {/* 衣（下に向かって透ける） */}
      <path d={robe} fill={p.wing} opacity={0.85} />
      <path d={robe} fill="url(#shade-top)" />
      <path d="M50 30 Q44 60 34 90 M50 30 Q56 60 66 90" stroke={p.el.light} strokeOpacity={0.5} strokeWidth={1.2} fill="none" />
      {/* 腕（ひろげる）と光の玉 */}
      <path d="M36 46 Q22 40 12 30 M64 46 Q78 40 88 30" stroke={p.body} strokeWidth={5} fill="none" strokeLinecap="round" />
      {[[10, 28], [90, 28]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={4} fill={p.el.glow} filter="url(#f-bloom)" />)}
      {/* 顔（仮面）と冠 */}
      <Shape d="M50 10 Q60 12 60 24 Q58 34 50 36 Q42 34 40 24 Q40 12 50 10 Z" fill={p.el.light} />
      <GlowEye x={46} y={22} rx={2} ry={1.2} c={p.el.glow} />
      <GlowEye x={54} y={22} rx={2} ry={1.2} c={p.el.glow} />
      <path d="M40 12 L44 2 L48 10 L50 0 L52 10 L56 2 L60 12 Z" fill={p.trim} />
      {p.tier >= 3 && <ellipse cx={50} cy={4} rx={14} ry={3} fill="none" stroke={p.el.glow} strokeWidth={1.4} filter="url(#f-bloom)" />}
      {letter && <text x={50} y={60} textAnchor="middle" fontSize={14} fontWeight={900} fill={p.el.light} filter="url(#f-bloom)" fontFamily="Georgia, serif">{letter}</text>}
    </g>
  );
}

function Golem({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} />
      <Floor rx={36} />
      <Shape d="M34 72 L30 92 L44 92 L46 74 Z M56 74 L56 92 L70 92 L66 72 Z" fill="url(#g-stone)" shade="url(#shade-cyl)" />
      {/* 胴（石＋ひび） */}
      <g filter="url(#f-texture)">
        <Shape d="M28 36 L72 36 L78 60 L66 76 L34 76 L22 60 Z" fill="url(#g-stone-warm)" />
      </g>
      <path d="M40 40 l4 10 l-3 8 l5 10 M62 42 l-3 8 l4 6" stroke="#000" strokeOpacity={0.45} strokeWidth={1.2} fill="none" />
      {/* 腕とこぶし */}
      <Shape d="M24 40 L10 60 L14 76 L24 72 L24 58 L32 46 Z" fill="url(#g-stone)" />
      <Shape d="M76 40 L90 60 L86 76 L76 72 L76 58 L68 46 Z" fill="url(#g-stone)" />
      {/* 肩の結晶 */}
      {[[26, 34], [74, 34]].map(([x, y]) => (
        <g key={x} filter="url(#f-bloom)">
          <path d={`M${x - 6} ${y + 4} L${x - 3} ${y - 10} L${x} ${y + 2} L${x + 3} ${y - 14} L${x + 6} ${y + 4} Z`} fill={p.body} />
        </g>
      ))}
      {/* 頭と核 */}
      <Shape d="M40 18 L60 18 L62 34 L38 34 Z" fill="url(#g-stone-warm)" />
      <rect x={42} y={24} width={16} height={3.4} rx={1.7} fill={p.el.glow} filter="url(#f-bloom)" />
      <g filter="url(#f-bloom)">
        <circle cx={50} cy={54} r={6 + p.tier} fill={p.el.glow} opacity={0.9} />
        <path d="M50 46 l3 8 l-3 8 l-3 -8 z" fill="#fff" />
      </g>
    </g>
  );
}

function Unicorn({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} cy={50} />
      <Floor rx={34} />
      {/* 足 */}
      {[30, 38, 62, 70].map((x, i) => <Shape key={x} d={`M${x} 64 L${x - 1 + (i % 2) * 2} 90 L${x + 5} 90 L${x + 6} 64 Z`} fill={p.el.light} shade="url(#shade-cyl)" />)}
      {[29, 37, 61, 69].map((x) => <rect key={x} x={x} y={89} width={7} height={3} rx={1} fill={p.trim} />)}
      {/* しっぽ */}
      <path d="M24 52 Q8 58 12 80 Q16 70 24 64" fill={p.wing} />
      {/* 胴と首 */}
      <Shape d="M24 50 Q28 40 46 42 L66 42 Q78 44 78 56 Q76 68 62 68 L32 68 Q22 64 24 50 Z" fill={p.el.light} />
      <Shape d="M64 46 Q66 30 74 22 L84 26 Q78 38 76 50 Z" fill={p.el.light} />
      {/* 頭 */}
      <Shape d="M72 18 Q80 12 88 18 L96 32 Q92 36 86 34 L78 28 Z" fill={p.el.light} />
      <GlowEye x={82} y={22} rx={1.8} ry={1.3} c={p.el.main} />
      {/* たてがみ（属性の色が流れる） */}
      <path d="M72 16 Q60 22 62 34 Q56 30 58 44 Q52 40 54 50 Q66 40 70 30 Q72 24 76 20 Z" fill={p.body} />
      {/* らせんの角（光る） */}
      <g filter="url(#f-bloom)">
        <path d="M80 14 L90 -4 L84 16 Z" fill={p.trim} />
        <path d="M82 10 l4 -1 M84 6 l3 -1 M86 2 l2 -1" stroke={p.el.glow} strokeWidth={1} />
      </g>
      {p.tier >= 2 && <path d="M40 48 Q52 54 64 48" stroke={p.trim} strokeWidth={2.2} fill="none" />}
    </g>
  );
}

function Griffin({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} cy={48} />
      <Floor rx={34} />
      {/* 翼（上に広げる） */}
      <path d="M44 44 Q30 10 6 4 Q16 18 14 26 Q24 22 22 34 Q30 30 32 42 Z" fill={p.wing} />
      <path d="M56 44 Q72 8 98 2 Q88 16 90 26 Q80 22 82 34 Q72 30 70 42 Z" fill={p.wing} />
      <path d="M44 44 Q30 10 6 4 M56 44 Q72 8 98 2" stroke={p.el.light} strokeOpacity={0.6} strokeWidth={1.2} fill="none" />
      {/* 獅子の体と後ろ足・しっぽ */}
      <path d="M26 72 Q12 70 10 56" stroke="#b5894f" strokeWidth={4} fill="none" strokeLinecap="round" />
      <Shape d="M26 60 Q28 48 46 48 L64 48 Q74 52 72 66 Q70 76 60 76 L34 76 Q24 72 26 60 Z" fill="#c9a06a" />
      <Shape d="M30 70 L28 92 L36 92 L38 72 Z" fill="#b5894f" shade="url(#shade-cyl)" />
      {/* 鷲の胸と前足（かぎ爪） */}
      <Shape d="M54 40 Q70 38 72 54 Q70 66 58 66 Q50 60 54 40 Z" fill={p.body} />
      <Shape d="M60 64 L62 92 L70 92 L68 66 Z" fill={p.trim} shade="url(#shade-cyl)" />
      {/* 鷲の頭 */}
      <Shape d="M56 22 Q66 16 74 24 Q76 32 70 38 L58 40 Q52 32 56 22 Z" fill={p.el.light} />
      <path d="M72 26 Q84 28 80 36 Q76 32 70 32 Z" fill={p.trim} />
      <GlowEye x={66} y={27} rx={1.8} ry={1.4} c={p.el.glow} />
      <path d="M56 22 L52 14 L60 20" fill={p.el.light} />
      {p.tier >= 2 && <path d="M58 40 Q64 44 70 40" stroke={p.trim} strokeWidth={2} fill="none" />}
    </g>
  );
}

function Lion({ p }: { p: P }) {
  return (
    <g>
      <Aura p={p} cy={46} />
      <Floor rx={36} />
      {/* 体（伏せの姿勢）と前足 */}
      <Shape d="M14 70 Q16 58 34 56 L70 56 Q86 60 86 74 Q84 86 70 86 L24 86 Q12 82 14 70 Z" fill="#d6a868" />
      <Shape d="M54 78 L52 92 L66 92 L66 80 Z M70 78 L70 92 L84 92 L82 80 Z" fill="#c99a5c" shade="url(#shade-cyl)" />
      <path d="M14 76 Q2 70 6 58" stroke="#b5894f" strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={6} cy={57} r={4} fill={p.body} />
      {/* たてがみ（属性の色の炎のよう） */}
      <g filter="url(#f-organic)">
        <circle cx={64} cy={40} r={26} fill={p.body} />
      </g>
      <circle cx={64} cy={40} r={26} fill="url(#shade-sphere)" opacity={0.6} />
      {/* 顔 */}
      <Shape d="M52 30 Q64 22 76 30 Q80 42 74 52 Q64 60 54 52 Q48 42 52 30 Z" fill="#e8bd7c" />
      <path d="M60 46 Q64 50 68 46 L64 42 Z" fill="#3a1d0a" />
      <path d="M58 52 Q64 56 70 52" stroke="#3a1d0a" strokeWidth={1.2} fill="none" />
      <GlowEye x={58} y={36} rx={2} ry={1.2} c={p.el.glow} rot={8} />
      <GlowEye x={70} y={36} rx={2} ry={1.2} c={p.el.glow} rot={-8} />
      {/* 額のかぶと／王冠 */}
      <path d="M54 26 L58 16 L62 24 L64 12 L66 24 L70 16 L74 26 Q64 22 54 26 Z" fill={p.trim} />
      {p.tier >= 1 && <circle cx={64} cy={22} r={2} fill={p.el.glow} filter="url(#f-bloom)" />}
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
    trim: tier >= 2 ? "url(#metal-platinum)" : tier >= 1 ? "url(#metal-gold)" : el.light,
    tier,
  };
}

/** flip: 外側で左右反転して置くときに true（ルーンや文字は読める向きのまま） */
export function MonsterArt({ id, letter, flip: _flip }: { id: string; letter?: string; flip?: boolean }) {
  const m = resolveMonster(id);
  const Draw = DRAW[m.archetype] ?? Dragon;
  return <Draw p={paletteOf(m)} letter={letter} />;
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
