/**
 * 英語モンスター図鑑のモンスター（3Dアニメ風の陰影つき・オリジナルSVG・100×100）。
 * id は content/curriculum/monsters.json と対応。専用の絵がないモンスターは「ことだまスライム」を色ちがいで描く。
 * 立体感は、色の形の上に共通の陰影（url(#shade-sphere) など）とハイライトを重ねて出す。
 */
const LINE = "#2a170a";

type Shape =
  | { t: "circle"; cx: number; cy: number; r: number }
  | { t: "ellipse"; cx: number; cy: number; rx: number; ry: number; rot?: number }
  | { t: "path"; d: string };

/** 色＋陰影＋（任意で）ハイライトを重ねた立体パーツ */
function Vol({ s, fill, shade = "url(#shade-sphere)", spec = true, opacity = 1 }: { s: Shape; fill: string; shade?: string; spec?: boolean; opacity?: number }) {
  const draw = (f: string, o = 1) =>
    s.t === "circle" ? <circle cx={s.cx} cy={s.cy} r={s.r} fill={f} opacity={o} />
    : s.t === "ellipse" ? <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} fill={f} opacity={o} transform={s.rot ? `rotate(${s.rot} ${s.cx} ${s.cy})` : undefined} />
    : <path d={s.d} fill={f} opacity={o} />;
  let hl: React.ReactNode = null;
  if (spec && s.t !== "path") {
    const cx = s.cx, cy = s.cy, r = s.t === "circle" ? s.r : Math.min(s.rx, s.ry);
    hl = <ellipse cx={cx - r * 0.38} cy={cy - r * 0.45} rx={r * 0.32} ry={r * 0.18} fill="url(#spec)" transform={`rotate(-30 ${cx - r * 0.38} ${cy - r * 0.45})`} />;
  }
  return <g opacity={opacity}>{draw(fill)}{draw(shade, 0.9)}{hl}</g>;
}

/** つやのある黒目（大きなハイライト2つ） */
function Face({ x = 50, y = 50, gap = 10, mouth = "smile", glow }: { x?: number; y?: number; gap?: number; mouth?: "smile" | "o" | "grin"; glow?: string }) {
  return (
    <g>
      {[x - gap, x + gap].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={y} rx={4} ry={5.2} fill={glow ? glow : "#120a05"} filter={glow ? "url(#f-bloom-gold)" : undefined} />
          <ellipse cx={cx - 1.2} cy={y - 2} rx={1.6} ry={2} fill="#fff" />
          <circle cx={cx + 1.4} cy={y + 2} r={0.8} fill="#fff" opacity={0.8} />
        </g>
      ))}
      {mouth === "o" ? <ellipse cx={x} cy={y + 9} rx={3} ry={3.5} fill="#8a1e30" />
        : mouth === "grin" ? <path d={`M${x - 7} ${y + 7} Q${x} ${y + 15} ${x + 7} ${y + 7} Z`} fill="#8a1e30" />
        : <path d={`M${x - 5} ${y + 7} Q${x} ${y + 12} ${x + 5} ${y + 7}`} stroke={LINE} strokeWidth={2} fill="none" strokeLinecap="round" />}
      <ellipse cx={x - gap - 5} cy={y + 7} rx={4} ry={2.6} fill="url(#blush)" />
      <ellipse cx={x + gap + 5} cy={y + 7} rx={4} ry={2.6} fill="url(#blush)" />
    </g>
  );
}

/** 左右反転したモンスターでも文字が鏡文字にならないよう、文字だけ反転し直す */
function Txt({ flip, cx, children }: { flip?: boolean; cx: number; children: React.ReactNode }) {
  return <g transform={flip ? `translate(${2 * cx} 0) scale(-1 1)` : undefined}>{children}</g>;
}

const Floor = ({ rx = 30 }: { rx?: number }) => <ellipse cx={50} cy={94} rx={rx} ry={5.5} fill="url(#ao-floor)" />;

/** スースーへび（s の音） */
function Snake() {
  const body = "M20 88 Q10 70 30 66 Q55 62 52 48 Q48 34 66 30";
  return (
    <g>
      <Floor rx={34} />
      <path d={body} stroke="#2f8a43" strokeWidth={19} fill="none" strokeLinecap="round" />
      <path d={body} stroke="#6fd36a" strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={body} stroke="#d8ffc9" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="3 9" opacity={0.7} transform="translate(-2 -3)" />
      <Vol s={{ t: "circle", cx: 70, cy: 28, r: 16 }} fill="#5bbf5a" />
      <Face x={70} y={26} gap={6} />
      <path d="M84 34 l7 2 m-7 -2 l6 5" stroke="#e5484d" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

/** アリンコ（a の音） */
function Ant() {
  return (
    <g>
      <Floor />
      {[30, 45, 60].map((x) => <path key={x} d={`M${x} 74 l-6 16 M${x + 8} 74 l6 16`} stroke="#3a0d10" strokeWidth={3} strokeLinecap="round" />)}
      <Vol s={{ t: "ellipse", cx: 34, cy: 70, rx: 14, ry: 12 }} fill="#d8343b" />
      <Vol s={{ t: "ellipse", cx: 56, cy: 70, rx: 12, ry: 10 }} fill="#d8343b" />
      <path d="M62 34 Q56 18 50 20 M74 34 Q80 18 86 20" stroke="#3a0d10" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <circle cx={50} cy={20} r={3.4} fill="url(#gem-topaz)" /><circle cx={86} cy={20} r={3.4} fill="url(#gem-topaz)" />
      <Vol s={{ t: "circle", cx: 68, cy: 50, r: 18 }} fill="#f05a5f" />
      <Face x={68} y={48} gap={7} mouth="grin" />
    </g>
  );
}

/** タップタイガー（t の音） */
function Tiger() {
  return (
    <g>
      <Floor />
      <path d="M78 74 Q96 66 90 50" stroke="#c4621a" strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M78 74 Q96 66 90 50" stroke="#ffb15e" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Vol s={{ t: "ellipse", cx: 50, cy: 74, rx: 26, ry: 18 }} fill="#ff9a3d" />
      <Vol s={{ t: "circle", cx: 28, cy: 30, r: 9 }} fill="#ff9a3d" spec={false} />
      <Vol s={{ t: "circle", cx: 72, cy: 30, r: 9 }} fill="#ff9a3d" spec={false} />
      <Vol s={{ t: "circle", cx: 50, cy: 46, r: 26 }} fill="#ffad55" />
      <path d="M50 21 l0 9 M40 23 l2 8 M60 23 l-2 8 M25 44 l8 2 M75 44 l-8 2" stroke="#5a2a08" strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={50} cy={58} rx={13} ry={9} fill="#fff1dd" />
      <Face x={50} y={46} gap={10} mouth="o" />
    </g>
  );
}

/** ポップペンギン（p の音） */
function Penguin() {
  return (
    <g>
      <Floor rx={24} />
      <Vol s={{ t: "ellipse", cx: 50, cy: 58, rx: 28, ry: 36 }} fill="#24324f" />
      <ellipse cx={50} cy={66} rx={19} ry={26} fill="#f6f7fb" />
      <ellipse cx={50} cy={66} rx={19} ry={26} fill="url(#shade-sphere)" opacity={0.5} />
      <path d="M22 56 Q12 70 20 80" stroke="#1a2440" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M78 56 Q88 70 80 80" stroke="#1a2440" strokeWidth={8} fill="none" strokeLinecap="round" />
      <Face x={50} y={44} gap={9} />
      <path d="M45 53 L55 53 L50 59 Z" fill="url(#gem-topaz)" />
      <ellipse cx={40} cy={93} rx={8} ry={4} fill="url(#gem-topaz)" /><ellipse cx={60} cy={93} rx={8} ry={4} fill="url(#gem-topaz)" />
    </g>
  );
}

/** シーゴースト（sh の音）: 半透明で青白く光る */
function Ghost({ flip }: { flip?: boolean }) {
  const d = "M22 84 L22 46 Q22 16 50 16 Q78 16 78 46 L78 84 L70 78 L62 86 L54 78 L46 86 L38 78 L30 86 Z";
  return (
    <g>
      <Floor rx={22} />
      <path d={d} fill="#bfe9ff" opacity={0.5} filter="url(#f-glow-soft)" />
      <path d={d} fill="#f2f0ff" opacity={0.92} />
      <path d={d} fill="url(#shade-sphere)" opacity={0.55} />
      <Face x={50} y={44} gap={10} mouth="o" glow="#3b6cff" />
      <rect x={58} y={48} width={6} height={16} rx={3} fill="#e7e0ff" />
      <Txt flip={flip} cx={79}><text x={70} y={30} fontSize={12} fontWeight={900} fill="#c9b8ff">shh</text></Txt>
    </g>
  );
}

/** まほうのEフェアリー（magic e）: 光る羽と杖 */
function Fairy({ flip }: { flip?: boolean }) {
  return (
    <g>
      <Floor rx={18} />
      <g opacity={0.85} filter="url(#f-bloom-gold)">
        <ellipse cx={30} cy={48} rx={16} ry={24} fill="#bdf3ff" opacity={0.7} transform="rotate(-20 30 48)" />
        <ellipse cx={70} cy={48} rx={16} ry={24} fill="#bdf3ff" opacity={0.7} transform="rotate(20 70 48)" />
      </g>
      <Vol s={{ t: "path", d: "M40 60 L60 60 L66 86 L34 86 Z" }} fill="#ff7eb6" shade="url(#shade-cyl)" />
      <Vol s={{ t: "circle", cx: 50, cy: 42, r: 16 }} fill="#ffd8b8" />
      <path d="M34 40 Q36 22 50 24 Q64 22 66 40 Q58 30 50 32 Q42 30 34 40 Z" fill="url(#gem-topaz)" />
      <Face x={50} y={44} gap={6} />
      <path d="M68 66 L84 44" stroke="url(#metal-gold)" strokeWidth={3} strokeLinecap="round" />
      <circle cx={86} cy={40} r={9} fill="url(#g-magic)" filter="url(#f-bloom-gold)" />
      <Txt flip={flip} cx={85}><text x={82} y={44} fontSize={11} fontWeight={900} fill="#7a4e0c">e</text></Txt>
    </g>
  );
}

/** アルファベットドラゴン（ワールド1のボス）: 金のつのと光る目 */
function Dragon({ flip }: { flip?: boolean }) {
  return (
    <g>
      <Floor rx={36} />
      <Vol s={{ t: "path", d: "M14 58 Q2 30 26 34 L36 50 Z" }} fill="#5fca63" shade="url(#shade-top)" />
      <Vol s={{ t: "path", d: "M86 58 Q98 30 74 34 L64 50 Z" }} fill="#5fca63" shade="url(#shade-top)" />
      <path d="M74 84 Q96 84 94 66" stroke="#1f6e35" strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M74 84 Q96 84 94 66" stroke="#4cc05e" strokeWidth={6} fill="none" strokeLinecap="round" />
      <Vol s={{ t: "ellipse", cx: 50, cy: 70, rx: 28, ry: 22 }} fill="#3fae5c" />
      <ellipse cx={50} cy={74} rx={17} ry={14} fill="#fff1a6" />
      <ellipse cx={50} cy={74} rx={17} ry={14} fill="url(#shade-sphere)" opacity={0.5} />
      <Txt flip={flip} cx={50}><text x={50} y={79} textAnchor="middle" fontSize={11} fontWeight={900} fill="#7a4e0c">ABC</text></Txt>
      <Vol s={{ t: "circle", cx: 50, cy: 36, r: 22 }} fill="#4cc05e" />
      <path d="M34 20 L30 4 L41 16 Z M66 20 L70 4 L59 16 Z" fill="url(#metal-gold)" />
      <Face x={50} y={34} gap={9} mouth="grin" glow="#ffd23f" />
      <circle cx={44} cy={48} r={1.6} fill={LINE} /><circle cx={56} cy={48} r={1.6} fill={LINE} />
    </g>
  );
}

/** ことだまスライム（汎用・色ちがい）: ぷるっとした半透明のつや */
function Slime({ color = "#4cc9f0", letter, flip }: { color?: string; letter?: string; flip?: boolean }) {
  const d = "M18 86 Q14 50 50 30 Q86 50 82 86 Z";
  return (
    <g>
      <Floor />
      <path d={d} fill={color} opacity={0.95} />
      <path d={d} fill="url(#shade-sphere)" />
      <path d="M32 52 Q38 40 48 37" stroke="#fff" strokeOpacity={0.8} strokeWidth={5} fill="none" strokeLinecap="round" />
      <ellipse cx={62} cy={74} rx={8} ry={4} fill="#fff" opacity={0.18} />
      <Face x={50} y={62} gap={10} />
      {letter && <Txt flip={flip} cx={50}><text x={50} y={28} textAnchor="middle" fontSize={16} fontWeight={900} fill="#fff" stroke={LINE} strokeWidth={0.8}>{letter}</text></Txt>}
    </g>
  );
}

const SLIME_COLORS = ["#3cc4f0", "#ff6fa5", "#8a55e8", "#f0a81c", "#3fcf7a", "#ff7a3d"];

/** flip: 外側で左右反転して置くときに true（文字だけ読める向きに戻す） */
export function MonsterArt({ id, letter, flip }: { id: string; letter?: string; flip?: boolean }) {
  switch (id) {
    case "m-sammy-snake": return <Snake />;
    case "m-ant-anty": return <Ant />;
    case "m-tiger-tap": return <Tiger />;
    case "m-penguin-pop": return <Penguin />;
    case "m-shhh-ghost": return <Ghost flip={flip} />;
    case "m-magic-e-fairy": return <Fairy flip={flip} />;
    case "m-alpha-dragon": return <Dragon flip={flip} />;
    default: {
      let h = 0;
      for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
      return <Slime color={SLIME_COLORS[h % SLIME_COLORS.length]} letter={letter} flip={flip} />;
    }
  }
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
