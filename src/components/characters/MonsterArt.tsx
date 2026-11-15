/**
 * 英語モンスター図鑑のモンスター（オリジナルSVG・100×100）。
 * id は content/curriculum/monsters.json と対応。専用の絵がないモンスターは「ことだまスライム」を色ちがいで描く。
 */
const LINE = "#3b2a1a";

function Face({ x = 50, y = 50, gap = 10, mouth = "smile" }: { x?: number; y?: number; gap?: number; mouth?: "smile" | "o" | "grin" }) {
  return (
    <g>
      {[x - gap, x + gap].map((cx) => (
        <g key={cx}>
          <ellipse cx={cx} cy={y} rx={3.6} ry={4.6} fill={LINE} />
          <circle cx={cx + 1.2} cy={y - 1.8} r={1.3} fill="#fff" />
        </g>
      ))}
      {mouth === "o" ? <ellipse cx={x} cy={y + 9} rx={3} ry={3.5} fill="#c2394b" stroke={LINE} strokeWidth={1.5} />
        : mouth === "grin" ? <path d={`M${x - 7} ${y + 7} Q${x} ${y + 15} ${x + 7} ${y + 7} Z`} fill="#c2394b" stroke={LINE} strokeWidth={1.5} strokeLinejoin="round" />
        : <path d={`M${x - 5} ${y + 7} Q${x} ${y + 12} ${x + 5} ${y + 7}`} stroke={LINE} strokeWidth={2.2} fill="none" strokeLinecap="round" />}
      <circle cx={x - gap - 5} cy={y + 7} r={3} fill="#ff9f9f" opacity={0.55} />
      <circle cx={x + gap + 5} cy={y + 7} r={3} fill="#ff9f9f" opacity={0.55} />
    </g>
  );
}

/** 左右反転したモンスターでも文字が鏡文字にならないよう、文字だけ反転し直す */
function Txt({ flip, cx, children }: { flip?: boolean; cx: number; children: React.ReactNode }) {
  return <g transform={flip ? `translate(${2 * cx} 0) scale(-1 1)` : undefined}>{children}</g>;
}

const Shadow = ({ rx = 30 }: { rx?: number }) => <ellipse cx={50} cy={94} rx={rx} ry={5} fill="rgba(0,0,0,.22)" />;

/** スースーへび（s の音） */
function Snake() {
  return (
    <g>
      <Shadow rx={34} />
      <path d="M20 88 Q10 70 30 66 Q55 62 52 48 Q48 34 66 30" stroke="#5bbf5a" strokeWidth={18} fill="none" strokeLinecap="round" />
      <path d="M20 88 Q10 70 30 66 Q55 62 52 48 Q48 34 66 30" stroke="#8fe08a" strokeWidth={6} fill="none" strokeLinecap="round" strokeDasharray="2 10" />
      <circle cx={70} cy={28} r={16} fill="#5bbf5a" stroke={LINE} strokeWidth={2} />
      <Face x={70} y={25} gap={6} />
      <path d="M84 34 l7 2 m-7 -2 l6 5" stroke="#e5484d" strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

/** アリンコ（a の音） */
function Ant() {
  return (
    <g>
      <Shadow />
      {[30, 45, 60].map((x) => <path key={x} d={`M${x} 74 l-6 16 M${x + 8} 74 l6 16`} stroke={LINE} strokeWidth={3} strokeLinecap="round" />)}
      <ellipse cx={34} cy={70} rx={14} ry={12} fill="#e5484d" stroke={LINE} strokeWidth={2} />
      <ellipse cx={56} cy={70} rx={12} ry={10} fill="#e5484d" stroke={LINE} strokeWidth={2} />
      <circle cx={68} cy={50} r={18} fill="#ff6b6b" stroke={LINE} strokeWidth={2} />
      <path d="M62 34 Q56 18 50 20 M74 34 Q80 18 86 20" stroke={LINE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      <circle cx={50} cy={20} r={3} fill="#ffd23f" /><circle cx={86} cy={20} r={3} fill="#ffd23f" />
      <Face x={68} y={48} gap={7} mouth="grin" />
    </g>
  );
}

/** タップタイガー（t の音） */
function Tiger() {
  return (
    <g>
      <Shadow />
      <path d="M78 74 Q96 66 90 50" stroke="#ff9a3d" strokeWidth={8} fill="none" strokeLinecap="round" />
      <ellipse cx={50} cy={74} rx={26} ry={18} fill="#ff9a3d" stroke={LINE} strokeWidth={2} />
      <circle cx={28} cy={30} r={9} fill="#ff9a3d" stroke={LINE} strokeWidth={2} /><circle cx={72} cy={30} r={9} fill="#ff9a3d" stroke={LINE} strokeWidth={2} />
      <circle cx={50} cy={46} r={26} fill="#ffb15e" stroke={LINE} strokeWidth={2} />
      <path d="M50 22 l0 9 M40 24 l2 8 M60 24 l-2 8" stroke={LINE} strokeWidth={3} strokeLinecap="round" />
      <ellipse cx={50} cy={58} rx={13} ry={9} fill="#fff4e0" />
      <Face x={50} y={46} gap={10} mouth="o" />
    </g>
  );
}

/** ポップペンギン（p の音） */
function Penguin() {
  return (
    <g>
      <Shadow rx={24} />
      <ellipse cx={50} cy={58} rx={28} ry={36} fill="#2b3a55" stroke={LINE} strokeWidth={2} />
      <ellipse cx={50} cy={66} rx={19} ry={26} fill="#f6f7fb" />
      <path d="M22 56 Q12 70 20 80" stroke="#2b3a55" strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d="M78 56 Q88 70 80 80" stroke="#2b3a55" strokeWidth={8} fill="none" strokeLinecap="round" />
      <Face x={50} y={44} gap={9} />
      <path d="M45 53 L55 53 L50 59 Z" fill="#ffb020" stroke={LINE} strokeWidth={1.2} />
      <ellipse cx={40} cy={93} rx={8} ry={4} fill="#ffb020" /><ellipse cx={60} cy={93} rx={8} ry={4} fill="#ffb020" />
    </g>
  );
}

/** シーゴースト（sh の音） */
function Ghost({ flip }: { flip?: boolean }) {
  return (
    <g>
      <Shadow rx={22} />
      <path d="M22 84 L22 46 Q22 16 50 16 Q78 16 78 46 L78 84 L70 78 L62 86 L54 78 L46 86 L38 78 L30 86 Z" fill="#f4f1ff" stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      <Face x={50} y={44} gap={10} mouth="o" />
      <rect x={58} y={48} width={6} height={16} rx={3} fill="#e7e0ff" stroke={LINE} strokeWidth={1.2} />
      <Txt flip={flip} cx={79}><text x={70} y={30} fontSize={12} fontWeight={900} fill="#9b6bff">shh</text></Txt>
    </g>
  );
}

/** まほうのEフェアリー（magic e） */
function Fairy({ flip }: { flip?: boolean }) {
  return (
    <g>
      <Shadow rx={18} />
      <ellipse cx={30} cy={48} rx={16} ry={24} fill="#bdf3ff" opacity={0.8} stroke="#4cc9f0" strokeWidth={2} transform="rotate(-20 30 48)" />
      <ellipse cx={70} cy={48} rx={16} ry={24} fill="#bdf3ff" opacity={0.8} stroke="#4cc9f0" strokeWidth={2} transform="rotate(20 70 48)" />
      <path d="M40 60 L60 60 L66 86 L34 86 Z" fill="#ff7eb6" stroke={LINE} strokeWidth={2} />
      <circle cx={50} cy={42} r={16} fill="#ffd9b5" stroke={LINE} strokeWidth={2} />
      <path d="M34 40 Q36 22 50 24 Q64 22 66 40 Q58 30 50 32 Q42 30 34 40 Z" fill="#ffd23f" />
      <Face x={50} y={44} gap={6} />
      <path d="M68 66 L84 44" stroke="#a87a12" strokeWidth={3} strokeLinecap="round" />
      <circle cx={86} cy={40} r={8} fill="#fff7a8" stroke="#e8a400" strokeWidth={2} />
      <Txt flip={flip} cx={85}><text x={82} y={44} fontSize={11} fontWeight={900} fill="#a87a12">e</text></Txt>
    </g>
  );
}

/** アルファベットドラゴン（ワールド1のボス） */
function Dragon({ flip }: { flip?: boolean }) {
  return (
    <g>
      <Shadow rx={36} />
      <path d="M14 58 Q2 30 26 34 L36 50 Z" fill="#7ed957" stroke={LINE} strokeWidth={2} />
      <path d="M86 58 Q98 30 74 34 L64 50 Z" fill="#7ed957" stroke={LINE} strokeWidth={2} />
      <path d="M74 84 Q96 84 94 66" stroke="#3fae5c" strokeWidth={9} fill="none" strokeLinecap="round" />
      <ellipse cx={50} cy={70} rx={28} ry={22} fill="#3fae5c" stroke={LINE} strokeWidth={2} />
      <ellipse cx={50} cy={74} rx={17} ry={14} fill="#fff1a6" />
      <Txt flip={flip} cx={50}><text x={50} y={79} textAnchor="middle" fontSize={11} fontWeight={900} fill="#a87a12">ABC</text></Txt>
      <circle cx={50} cy={36} r={22} fill="#4cc05e" stroke={LINE} strokeWidth={2} />
      <path d="M34 20 L30 6 L40 16 M66 20 L70 6 L60 16" fill="#ffd23f" stroke={LINE} strokeWidth={1.5} strokeLinejoin="round" />
      <Face x={50} y={34} gap={9} mouth="grin" />
      <circle cx={44} cy={48} r={1.6} fill={LINE} /><circle cx={56} cy={48} r={1.6} fill={LINE} />
    </g>
  );
}

/** ことだまスライム（汎用・色ちがい） */
function Slime({ color = "#4cc9f0", letter, flip }: { color?: string; letter?: string; flip?: boolean }) {
  return (
    <g>
      <Shadow />
      <path d="M18 86 Q14 50 50 30 Q86 50 82 86 Z" fill={color} stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
      <path d="M34 50 Q40 40 48 38" stroke="rgba(255,255,255,.7)" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Face x={50} y={62} gap={10} />
      {letter && <Txt flip={flip} cx={50}><text x={50} y={28} textAnchor="middle" fontSize={16} fontWeight={900} fill="#fff" stroke={LINE} strokeWidth={0.8}>{letter}</text></Txt>}
    </g>
  );
}

const SLIME_COLORS = ["#4cc9f0", "#ff6fa5", "#9b6bff", "#ffb020", "#5bd17a", "#ff8a3d"];

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

/** 図鑑・背景に並べる代表モンスター */
export const FEATURED_MONSTERS = ["m-sammy-snake", "m-tiger-tap", "m-penguin-pop", "m-ant-anty", "m-shhh-ghost", "m-magic-e-fairy", "m-slime-a", "m-slime-b"] as const;

export function MonsterFigure({ id, size = 64, className = "", letter, flip = false }: { id: string; size?: number; className?: string; letter?: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} aria-hidden overflow="visible">
      <g transform={flip ? "translate(100 0) scale(-1 1)" : undefined}><MonsterArt id={id} letter={letter} flip={flip} /></g>
    </svg>
  );
}
