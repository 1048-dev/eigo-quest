/**
 * AI女性教師「エマ先生」（オリジナル・3Dアニメ風の陰影つき）。座標系は 200×200。
 * talking=true で口が動き、右手をふる（ジェスチャー）。背後には英字が光る遺跡の石板。
 */
const LINE = "#2a170a";

export function TeacherArt({ talking = false }: { talking?: boolean }) {
  return (
    <g>
      {/* 光る英字の石板 */}
      <g transform="translate(100 120)">
        <rect x={-88} y={-112} width={176} height={86} rx={8} fill="url(#g-stone)" />
        <rect x={-88} y={-112} width={176} height={86} rx={8} fill="url(#shade-top)" opacity={0.6} />
        <rect x={-80} y={-104} width={160} height={70} rx={5} fill="#0e2421" />
        <g filter="url(#f-bloom-gold)" fill="#ffe29a" fontWeight={900} fontFamily="Georgia, serif">
          <text x={-60} y={-60} fontSize={26}>A</text><text x={-28} y={-52} fontSize={20}>b</text>
          <text x={34} y={-60} fontSize={24}>c</text><text x={56} y={-48} fontSize={16}>!</text>
        </g>
      </g>
      {/* 後ろ髪 */}
      <path d="M52 90 Q44 40 100 34 Q156 40 148 90 L150 150 Q130 140 128 110 L72 110 Q70 140 50 150 Z" fill="url(#g-hair-haru)" />
      {/* 体（ティールのジャケット＋白いブラウス＋金のブローチ） */}
      <path d="M40 200 Q44 150 100 142 Q156 150 160 200 Z" fill="#1f6f78" />
      <path d="M40 200 Q44 150 100 142 Q156 150 160 200 Z" fill="url(#shade-cyl)" />
      <path d="M86 144 L100 176 L114 144 Z" fill="#fbf4e6" />
      <circle cx={122} cy={164} r={5} fill="url(#gem-topaz)" />
      <rect x={90} y={128} width={20} height={18} rx={5} fill="url(#g-skin)" />
      {/* 顔 */}
      <ellipse cx={100} cy={94} rx={36} ry={40} fill="url(#g-skin)" />
      <ellipse cx={100} cy={94} rx={36} ry={40} fill="url(#shade-sphere)" opacity={0.5} />
      <ellipse cx={78} cy={112} rx={8} ry={4.5} fill="url(#blush)" />
      <ellipse cx={122} cy={112} rx={8} ry={4.5} fill="url(#blush)" />
      {/* 前髪（ハイライトつき） */}
      <path d="M62 86 Q64 52 100 50 Q136 52 138 86 Q126 66 108 64 Q96 76 80 68 Q68 74 62 86 Z" fill="url(#g-hair-haru)" />
      <path d="M78 58 Q92 52 106 54" stroke="#c99a6a" strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.8} />
      {/* 目・まゆ */}
      <path d="M74 82 Q81 78 88 81 M112 81 Q119 78 126 82" stroke={LINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {[82, 118].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={96} rx={7} ry={8.5} fill="#fffaf5" />
          <ellipse cx={x} cy={97} rx={6} ry={7.4} fill="url(#iris-green)" />
          <ellipse cx={x} cy={98} rx={2.8} ry={3.4} fill="#0d0603" />
          <ellipse cx={x - 2.2} cy={93.5} rx={2.2} ry={2.6} fill="#fff" />
          <path d={`M${x - 8} ${91} Q${x} ${85} ${x + 8} ${91}`} stroke={LINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />
        </g>
      ))}
      <path d="M98 106 q2 3 4 0" stroke="#c9825c" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      {/* 口（話すと動く） */}
      <ellipse cx={100} cy={118} rx={9} ry={5.5} fill="#a8303f" className={talking ? "mouth-talk" : ""} />
      <path d="M93 116.5 Q100 119 107 116.5" stroke="#fff" strokeWidth={1.4} fill="none" opacity={0.8} />
      {/* 手（話している間はふる） */}
      <g transform={talking ? "translate(150 128) rotate(-18)" : "translate(146 176)"}>
        <path d="M-10 30 Q-4 10 0 0" stroke="#1f6f78" strokeWidth={14} strokeLinecap="round" fill="none" />
        <circle cx={0} cy={-4} r={10} fill="url(#g-skin)" />
        <circle cx={0} cy={-4} r={10} fill="url(#shade-sphere)" opacity={0.5} />
      </g>
    </g>
  );
}
