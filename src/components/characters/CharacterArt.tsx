/**
 * キャラクターのオリジナルSVGアート。
 * どれも 100×100 の座標系で描いた <g> なので、単体のアイコン（Portrait）としても、
 * マップのSVGの中（<g transform>）にもそのまま置ける。
 */
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";

const SKIN = "#ffd9b5";
const SKIN_SHADE = "#f2bf94";
const LINE = "#3b2a1a";

function Eyes({ y = 54, gap = 14, closed = false }: { y?: number; gap?: number; closed?: boolean }) {
  if (closed) {
    return (
      <g stroke={LINE} strokeWidth={2.6} strokeLinecap="round" fill="none">
        <path d={`M${50 - gap - 4} ${y} q4 3 8 0`} />
        <path d={`M${50 + gap - 4} ${y} q4 3 8 0`} />
      </g>
    );
  }
  return (
    <g>
      {[50 - gap, 50 + gap].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={y} rx={4.2} ry={5.4} fill={LINE} />
          <circle cx={x + 1.4} cy={y - 2} r={1.6} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

/** 主人公ハル（10歳）: ツンツン髪＋赤いバンダナ＋探検ベスト */
export function HaruArt() {
  return (
    <g>
      <path d="M18 100 Q20 78 50 76 Q80 78 82 100 Z" fill="#3f7d4e" />
      <path d="M40 78 L50 92 L60 78" fill="#f6efe0" />
      <rect x="44" y="70" width="12" height="9" fill={SKIN_SHADE} />
      <circle cx="50" cy="50" r="26" fill={SKIN} />
      <path d="M22 46 L26 22 L34 32 L40 14 L48 28 L56 12 L62 28 L72 18 L74 34 L80 30 L78 48 Q70 34 50 34 Q32 34 22 46 Z" fill="#5a3a22" />
      <path d="M23 40 Q50 28 77 40 L77 46 Q50 35 23 46 Z" fill="#e5484d" />
      <path d="M76 42 l10 -4 l-3 9 z" fill="#e5484d" />
      <Eyes y={55} />
      <path d="M43 66 Q50 72 57 66" stroke={LINE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      <circle cx="31" cy="63" r="3.5" fill="#ff9f9f" opacity={0.6} />
      <circle cx="69" cy="63" r="3.5" fill="#ff9f9f" opacity={0.6} />
    </g>
  );
}

/** なかまリコ（8歳）: オレンジのツインテール＋黄色いヘアバンド＋そばかす */
export function RikoArt() {
  return (
    <g>
      <path d="M20 100 Q22 79 50 77 Q78 79 80 100 Z" fill="#ff8a3d" />
      <rect x="44" y="70" width="12" height="9" fill={SKIN_SHADE} />
      <ellipse cx="17" cy="56" rx="9" ry="16" fill="#e8742b" transform="rotate(-18 17 56)" />
      <ellipse cx="83" cy="56" rx="9" ry="16" fill="#e8742b" transform="rotate(18 83 56)" />
      <circle cx="50" cy="51" r="25" fill={SKIN} />
      <path d="M25 50 Q24 26 50 25 Q76 26 75 50 Q68 36 56 34 Q50 42 40 36 Q30 40 25 50 Z" fill="#e8742b" />
      <path d="M27 38 Q50 22 73 38" stroke="#ffd23f" strokeWidth={5} fill="none" strokeLinecap="round" />
      <Eyes y={55} gap={13} />
      <g fill="#c96a3a" opacity={0.7}>
        <circle cx="33" cy="62" r="1.1" /><circle cx="36" cy="64" r="1.1" /><circle cx="64" cy="64" r="1.1" /><circle cx="67" cy="62" r="1.1" />
      </g>
      <path d="M44 66 Q50 71 56 66" stroke={LINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
    </g>
  );
}

/** なかまキコ（7歳）: むらさきのボブ＋花のヘアピン＋大きな目 */
export function KikoArt() {
  return (
    <g>
      <path d="M22 100 Q24 80 50 78 Q76 80 78 100 Z" fill="#9b6bff" />
      <rect x="44" y="71" width="12" height="8" fill={SKIN_SHADE} />
      <path d="M22 62 Q18 26 50 24 Q82 26 78 62 L70 66 L70 46 L30 46 L30 66 Z" fill="#4b2e83" />
      <circle cx="50" cy="53" r="23" fill={SKIN} />
      <path d="M27 50 Q28 30 50 29 Q72 30 73 50 Q60 40 50 44 Q40 40 27 50 Z" fill="#4b2e83" />
      <g transform="translate(70 34)">
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="0" cy="-5" rx="3.6" ry="5" fill="#ff7eb6" transform={`rotate(${r})`} />)}
        <circle r="3" fill="#ffd23f" />
      </g>
      <Eyes y={56} gap={11} />
      <path d="M45 67 Q50 71 55 67" stroke={LINE} strokeWidth={2.2} fill="none" strokeLinecap="round" />
      <circle cx="35" cy="63" r="3.2" fill="#ff9fc8" opacity={0.6} />
      <circle cx="65" cy="63" r="3.2" fill="#ff9fc8" opacity={0.6} />
    </g>
  );
}

/**
 * 相棒ビリモ（オリジナルの電撃モンスター）。
 * まんまるのレモン色ボディ・雲形のおなか・ぜんまい形のアンテナの先に星・空色のいなずましっぽ・ほっぺの星。
 */
export function BirimoArt({ mood = "happy" }: { mood?: Mood }) {
  const mouth =
    mood === "excited" ? <path d="M42 64 Q50 76 58 64 Z" fill="#c2394b" stroke={LINE} strokeWidth={2} strokeLinejoin="round" />
    : mood === "sleepy" ? <ellipse cx="50" cy="66" rx="3" ry="2.4" fill={LINE} />
    : mood === "worried" ? <path d="M43 68 Q50 63 57 68" stroke={LINE} strokeWidth={2.6} fill="none" strokeLinecap="round" />
    : <path d="M43 64 Q46.5 68 50 64 Q53.5 68 57 64" stroke={LINE} strokeWidth={2.6} fill="none" strokeLinecap="round" />;
  return (
    <g>
      {/* いなずましっぽ */}
      <path d="M74 66 L92 52 L84 50 L96 34 L76 48 L84 50 Z" fill="#4cc9f0" stroke="#1f7fa8" strokeWidth={2} strokeLinejoin="round" />
      {/* アンテナ */}
      <path d="M50 26 Q50 12 60 12 Q66 12 64 18 Q62 22 58 19" stroke="#1f7fa8" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M50 4 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8z" fill="#fff7a8" stroke="#e8a400" strokeWidth={1.5} transform="translate(14 0)" />
      {/* 耳 */}
      <circle cx="26" cy="34" r="11" fill="#ffd23f" stroke="#d99a00" strokeWidth={2} />
      <circle cx="74" cy="34" r="11" fill="#ffd23f" stroke="#d99a00" strokeWidth={2} />
      <circle cx="26" cy="34" r="5.5" fill="#4cc9f0" />
      <circle cx="74" cy="34" r="5.5" fill="#4cc9f0" />
      {/* ボディ */}
      <circle cx="50" cy="58" r="32" fill="#ffd23f" stroke="#d99a00" strokeWidth={2.5} />
      <path d="M32 78 Q30 68 40 68 Q42 60 50 62 Q58 60 60 68 Q70 68 68 78 Q60 88 50 88 Q40 88 32 78 Z" fill="#fff4c2" />
      <Eyes y={52} gap={12} closed={mood === "sleepy"} />
      {/* ほっぺの星 */}
      {[30, 70].map((x) => (
        <path key={x} d="M0 -4.5 l1.3 3 3.2 .3 -2.4 2.1 .7 3.2 -2.8 -1.7 -2.8 1.7 .7 -3.2 -2.4 -2.1 3.2 -.3z" fill="#ff9a3d" transform={`translate(${x} 62)`} />
      ))}
      {mouth}
      {mood === "excited" && <g stroke="#ffe066" strokeWidth={3} strokeLinecap="round"><path d="M8 50 l-6 -3" /><path d="M8 60 l-7 1" /><path d="M10 70 l-6 4" /></g>}
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

/** 丸いメダル枠のポートレート */
export function Portrait({ id, size = 56, ring = "#e8b63a", mood, className = "" }: { id: CharacterId; size?: number; ring?: string; mood?: Mood; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className} role="img" aria-label={id}>
      <defs>
        <clipPath id={`clip-${id}`}><circle cx="50" cy="50" r="44" /></clipPath>
        <radialGradient id={`bg-${id}`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff8dc" />
          <stop offset="100%" stopColor="#b6e3b0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={ring} />
      <circle cx="50" cy="50" r="44" fill={`url(#bg-${id})`} />
      <g clipPath={`url(#clip-${id})`}>
        <CharacterArt id={id} mood={mood} />
      </g>
      <circle cx="50" cy="50" r="44" fill="none" stroke="#5c4310" strokeWidth={2} />
    </svg>
  );
}
