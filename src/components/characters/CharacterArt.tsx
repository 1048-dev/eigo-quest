/**
 * キャラクターの顔イラスト（3Dアニメ風の陰影つき・オリジナル）。
 * 100×100 の座標系の <g>。質感は components/art/ArtDefs.tsx の共通定義（url(#...)）を参照する。
 */
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";

const LINE = "#2a170a";

/** つやのある瞳（白目・グラデーションの虹彩・瞳孔・2つのハイライト・まつげ） */
function Eye({ x, y, iris, size = 1, closed = false }: { x: number; y: number; iris: string; size?: number; closed?: boolean }) {
  if (closed) return <path d={`M${x - 5 * size} ${y} q${5 * size} ${4 * size} ${10 * size} 0`} stroke={LINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />;
  const rx = 5.2 * size, ry = 5.9 * size;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#fffaf5" />
      <ellipse cx={x} cy={y + 0.8 * size} rx={rx * 0.86} ry={ry * 0.86} fill={`url(#iris-${iris})`} />
      <ellipse cx={x} cy={y + 1.4 * size} rx={rx * 0.42} ry={ry * 0.46} fill="#0d0603" />
      <ellipse cx={x - 1.8 * size} cy={y - 2.2 * size} rx={1.9 * size} ry={2.3 * size} fill="#fff" />
      <circle cx={x + 2 * size} cy={y + 2.8 * size} r={0.9 * size} fill="#fff" opacity={0.85} />
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="url(#shade-top)" opacity={0.5} />
      <path d={`M${x - rx - 1} ${y - ry * 0.55} Q${x} ${y - ry - 2.2} ${x + rx + 1} ${y - ry * 0.55}`} stroke={LINE} strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** あごの線のある輪郭（幼い丸顔ではなく、少し大人びた顔立ち） */
function jaw(cx: number, cy: number, r: number) {
  return `M${cx - r} ${cy - 2} Q${cx - r} ${cy - r * 1.05} ${cx} ${cy - r * 1.05} Q${cx + r} ${cy - r * 1.05} ${cx + r} ${cy - 2} Q${cx + r * 0.98} ${cy + r * 0.55} ${cx + r * 0.45} ${cy + r * 0.92} Q${cx} ${cy + r * 1.18} ${cx - r * 0.45} ${cy + r * 0.92} Q${cx - r * 0.98} ${cy + r * 0.55} ${cx - r} ${cy - 2} Z`;
}

/** 顔の土台（肌のグラデーション＋陰影＋耳＋ほお） */
function Face({ cx = 50, cy = 52, r = 25 }: { cx?: number; cy?: number; r?: number }) {
  return (
    <g>
      <ellipse cx={cx - r + 1} cy={cy + 3} rx={4.5} ry={6} fill="url(#g-skin)" />
      <ellipse cx={cx + r - 1} cy={cy + 3} rx={4.5} ry={6} fill="url(#g-skin)" />
      <path d={jaw(cx, cy, r)} fill="url(#g-skin)" />
      <path d={jaw(cx, cy, r)} fill="url(#shade-sphere)" opacity={0.55} />
      {/* ほおの下の影（輪郭を引きしめる） */}
      <path d={`M${cx - r * 0.92} ${cy + r * 0.2} Q${cx - r * 0.7} ${cy + r * 0.85} ${cx} ${cy + r * 1.08}`} stroke="#b06a45" strokeOpacity={0.25} strokeWidth={2.4} fill="none" />
      <ellipse cx={cx - r * 0.55} cy={cy + r * 0.42} rx={6} ry={3.6} fill="url(#blush)" />
      <ellipse cx={cx + r * 0.55} cy={cy + r * 0.42} rx={6} ry={3.6} fill="url(#blush)" />
      <path d={`M${cx + 0.5} ${cy - 2} L${cx - 0.5} ${cy + 5}`} stroke="#fff" strokeOpacity={0.35} strokeWidth={1.4} strokeLinecap="round" />
      <path d={`M${cx - 1.5} ${cy + 6.5} q1.8 1.6 3.4 0`} stroke="#b9714c" strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

function Neck({ color }: { color: string }) {
  return (
    <g>
      <path d="M16 100 Q18 80 50 77 Q82 80 84 100 Z" fill={color} />
      <path d="M16 100 Q18 80 50 77 Q82 80 84 100 Z" fill="url(#shade-top)" />
      <rect x={43} y={70} width={14} height={10} rx={3} fill="url(#g-skin)" />
      <rect x={43} y={70} width={14} height={5} fill="#000" opacity={0.12} />
    </g>
  );
}

/** 主人公ハル（10歳）: ツンツン髪＋赤いバンダナ＋探検ベスト。自信のある笑顔 */
export function HaruArt({ bust = true }: { bust?: boolean } = {}) {
  return (
    <g>
      {bust && <Neck color="url(#g-vest)" />}
      {bust && <path d="M40 78 L50 92 L60 78" fill="#f6efe0" />}
      <Face />
      {/* 髪（後ろ→前の順に重ねる） */}
      <path d="M22 50 L20 26 L32 30 L34 12 L46 24 L54 6 L60 22 L72 10 L74 28 L84 24 L80 48 Q72 34 50 33 Q30 33 22 50 Z" fill="url(#g-hair-haru)" />
      <path d="M38 22 L46 24 M58 16 L60 22" stroke="#b07a4a" strokeWidth={2} strokeLinecap="round" opacity={0.8} />
      <path d="M26 46 Q32 34 44 36 L40 46 Z M74 46 Q68 34 56 36 L60 46 Z" fill="url(#g-hair-haru)" />
      {/* バンダナ */}
      <path d="M23 40 Q50 27 77 40 L77 47 Q50 35 23 47 Z" fill="url(#g-bandana)" />
      <path d="M23 40 Q50 27 77 40" stroke="#ffb3b3" strokeWidth={1.5} fill="none" opacity={0.8} />
      <path d="M76 42 l12 -6 l-3 10 z M77 45 l11 5 l-9 3 z" fill="url(#g-bandana)" />
      {/* 眉・目・口 */}
      <path d="M33 47 Q39 43 45 45 M55 45 Q61 43 67 47" stroke={LINE} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      <Eye x={39} y={55} iris="brown" />
      <Eye x={61} y={55} iris="brown" />
      <path d="M42 66 Q50 73 58 66 Q50 69 42 66 Z" fill="#7a2a1a" />
      <path d="M44 66.5 Q50 68.5 56 66.5" stroke="#fff" strokeWidth={1.4} fill="none" />
    </g>
  );
}

/** なかまリコ（8歳）: オレンジのツインテール＋黄色いヘアバンド＋そばかす */
export function RikoArt({ bust = true }: { bust?: boolean } = {}) {
  return (
    <g>
      {bust && <Neck color="url(#g-riko-dress)" />}
      <g>
        <path d="M24 44 Q6 50 10 76 Q14 66 22 62 Z" fill="url(#g-hair-riko)" />
        <path d="M76 44 Q94 50 90 76 Q86 66 78 62 Z" fill="url(#g-hair-riko)" />
        <circle cx={22} cy={46} r={4.5} fill="url(#gem-topaz)" />
        <circle cx={78} cy={46} r={4.5} fill="url(#gem-topaz)" />
      </g>
      <Face />
      <path d="M25 52 Q22 26 50 25 Q78 26 75 52 Q70 38 58 35 Q52 44 42 37 Q31 40 25 52 Z" fill="url(#g-hair-riko)" />
      <path d="M34 32 Q44 27 54 28" stroke="#ffd7a8" strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.9} />
      <path d="M27 38 Q50 22 73 38" stroke="#ffd23f" strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M27 38 Q50 22 73 38" stroke="#fff6b8" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <path d="M35 47 Q40 45 44 47 M56 47 Q60 45 65 47" stroke={LINE} strokeWidth={2} fill="none" strokeLinecap="round" />
      <Eye x={40} y={56} iris="green" />
      <Eye x={60} y={56} iris="green" />
      <g fill="#c26a3a" opacity={0.65}>
        <circle cx={31} cy={63} r={1} /><circle cx={34.5} cy={65} r={1} /><circle cx={65.5} cy={65} r={1} /><circle cx={69} cy={63} r={1} />
      </g>
      <path d="M44 67 Q50 72 56 67" stroke="#7a2a1a" strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** なかまキコ（7歳）: むらさきのボブ＋花のヘアピン＋大きな目 */
export function KikoArt({ bust = true }: { bust?: boolean } = {}) {
  return (
    <g>
      {bust && <Neck color="url(#g-kiko-dress)" />}
      <path d="M20 66 Q14 24 50 22 Q86 24 80 66 L71 70 L71 46 L29 46 L29 70 Z" fill="url(#g-hair-kiko)" />
      <Face cy={54} r={23} />
      <path d="M27 52 Q28 30 50 29 Q72 30 73 52 Q62 40 52 45 Q42 39 27 52 Z" fill="url(#g-hair-kiko)" />
      <path d="M36 34 Q46 29 56 31" stroke="#b39cf0" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.85} />
      <g transform="translate(71 34)">
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="0" cy="-5.5" rx="3.8" ry="5.4" fill="#ff8fc0" transform={`rotate(${r})`} />)}
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={`s${r}`} cx="0" cy="-5.5" rx="3.8" ry="5.4" fill="url(#shade-sphere)" transform={`rotate(${r})`} />)}
        <circle r="3.2" fill="url(#gem-topaz)" />
      </g>
      <Eye x={39} y={57} iris="violet" size={1.12} />
      <Eye x={61} y={57} iris="violet" size={1.12} />
      <path d="M45 68 Q50 72 55 68" stroke="#7a2a1a" strokeWidth={2.2} fill="none" strokeLinecap="round" />
    </g>
  );
}

/**
 * 相棒ビリモ（オリジナルの電撃モンスター）。
 * つやのあるレモン色のまんまるボディ・雲形のおなか・星のアンテナ・空色のいなずましっぽ・ほっぺの星。
 */
export function BirimoArt({ mood = "happy" }: { mood?: Mood }) {
  const mouth =
    mood === "excited" ? <path d="M42 64 Q50 77 58 64 Z" fill="#a8243a" stroke={LINE} strokeWidth={1.6} strokeLinejoin="round" />
    : mood === "sleepy" ? <ellipse cx="50" cy="66" rx="3" ry="2.4" fill={LINE} />
    : mood === "worried" ? <path d="M43 68 Q50 63 57 68" stroke={LINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    : <path d="M43 64 Q46.5 68 50 64 Q53.5 68 57 64" stroke={LINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />;
  return (
    <g>
      {/* いなずましっぽ（発光） */}
      <g filter="url(#f-bloom-volt)">
        <path d="M74 66 L92 52 L84 50 L96 34 L76 48 L84 50 Z" fill="url(#g-sky)" stroke="#0d5b80" strokeWidth={1.2} strokeLinejoin="round" />
      </g>
      {/* アンテナと星 */}
      <path d="M50 26 Q50 12 60 12 Q66 12 64 18 Q62 22 58 19" stroke="#136f9c" strokeWidth={3} fill="none" strokeLinecap="round" />
      <g filter="url(#f-bloom-volt)">
        <path d="M64 4 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8z" fill="#fff7a8" stroke="#e8a400" strokeWidth={1} />
      </g>
      {/* 耳 */}
      {[26, 74].map((x) => (
        <g key={x}>
          <circle cx={x} cy={34} r={11} fill="url(#g-volt)" />
          <circle cx={x} cy={34} r={5.5} fill="url(#g-sky)" />
          <circle cx={x} cy={34} r={11} fill="url(#shade-sphere)" opacity={0.5} />
        </g>
      ))}
      {/* ボディ（球体の陰影＋スペキュラー） */}
      <circle cx="50" cy="58" r="32" fill="url(#g-volt)" />
      <path d="M32 78 Q30 68 40 68 Q42 60 50 62 Q58 60 60 68 Q70 68 68 78 Q60 88 50 88 Q40 88 32 78 Z" fill="#fff6d2" />
      <circle cx="50" cy="58" r="32" fill="url(#shade-sphere)" opacity={0.6} />
      <ellipse cx="38" cy="38" rx="9" ry="5" fill="url(#spec)" transform="rotate(-30 38 38)" />
      <Eye x={38} y={52} iris="night" closed={mood === "sleepy"} />
      <Eye x={62} y={52} iris="night" closed={mood === "sleepy"} />
      {/* ほっぺの星（発光） */}
      <g filter="url(#f-bloom-gold)">
        {[30, 70].map((x) => (
          <path key={x} d="M0 -4.5 l1.3 3 3.2 .3 -2.4 2.1 .7 3.2 -2.8 -1.7 -2.8 1.7 .7 -3.2 -2.4 -2.1 3.2 -.3z" fill="#ff9a3d" transform={`translate(${x} 63)`} />
        ))}
      </g>
      {mouth}
      {mood === "excited" && (
        <g stroke="#fff27a" strokeWidth={2.6} strokeLinecap="round" filter="url(#f-bloom-volt)">
          <path d="M8 50 l-6 -3" /><path d="M8 60 l-7 1" /><path d="M10 70 l-6 4" />
        </g>
      )}
      {mood === "sleepy" && <text x="80" y="22" fontSize="14" fontWeight="900" fill="#cfe8ff">z</text>}
    </g>
  );
}

export function CharacterArt({ id, mood }: { id: CharacterId; mood?: Mood }) {
  switch (id) {
    case "haru": return <HaruArt />;
    case "riko": return <RikoArt />;
    case "kiko": return <KikoArt />;
    case "birimo": return <BirimoArt mood={mood} />;
  }
}

/** ダークゴールドのメタル枠のメダル型ポートレート */
export function Portrait({ id, size = 56, ring, mood, className = "" }: { id: CharacterId; size?: number; ring?: string; mood?: Mood; className?: string }) {
  const clip = `clip-${id}-${size}`;
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={id}>
      <defs>
        <clipPath id={clip}><circle cx="50" cy="50" r="42" /></clipPath>
        <radialGradient id={`bg-${id}-${size}`} cx="50%" cy="30%" r="75%">
          <stop offset="0%" stopColor={ring ?? "#3a7a6a"} stopOpacity=".95" />
          <stop offset="100%" stopColor="#0b1d1a" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="48" fill="#000" opacity={0.35} />
      <circle cx="50" cy="50" r="48" fill="url(#metal-gold)" />
      <circle cx="50" cy="50" r="44.5" fill="none" stroke="#3a2404" strokeWidth={1.5} />
      <circle cx="50" cy="50" r="42" fill={`url(#bg-${id}-${size})`} />
      <g clipPath={`url(#${clip})`}><CharacterArt id={id} mood={mood} /></g>
      <path d="M14 38 A40 40 0 0 1 50 10" stroke="#fff8d6" strokeWidth={2} fill="none" opacity={0.7} strokeLinecap="round" />
    </svg>
  );
}
