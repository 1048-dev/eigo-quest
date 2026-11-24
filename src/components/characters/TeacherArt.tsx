/**
 * AI女性教師「エマ先生」（オリジナル・3DCGアニメ映画風）。座標系は 200×200。
 * 大人の顔立ち（面長・小さめの目・ほお骨・くちびる）で、子どもキャラとはっきり区別する。
 * talking=true で口が動き、左手（向かって右）を 胸の 高さに 上げて 話す（ジェスチャー）。
 * 背後は 遺跡の 石の アーチ。アーチの 中に 英字が 光って うかぶ（頭に かくれない 左右の 位置）。
 * 将来 AI 先生の動画サービスに切りかえるときは、LessonSteps 側の videoUrl を使う（このイラストは代わりの表示）。
 *
 * 見た目のルール（Night2 の みがきこみ）:
 *  - 大人の 女性の 肩幅（頭の 約2倍）。ジャケットは 肩の 線が はっきりした 仕立て（ベルの 形に しない）
 *  - 首は 短めに 見せる（えりもとの ブラウスで 首の つけねを かくす）
 *  - 髪は 左わけの セミロング。前髪は 向かって 右へ 流して 耳に かけ、イヤリングを 見せる。毛先は 肩で 外はね
 *  - 上げた 腕は ひじで 曲げ、枠（200×200）の 外に はみ出さない
 */
import { Brow, Eye, Face, Folds, Hair, HairHalo, Mouth, Nose, SmoothLimb, capsule, type FaceGeo } from "./parts";

const EMMA: FaceGeo = { cx: 100, top: 52, chin: 128, hw: 30, jaw: 10, cheek: 100 };
const K = 1.35; // 子どもの顔パーツに対する大きさ

/** 遺跡の 石の アーチと、その 中に うかぶ 光る 英字 */
function Arch() {
  const outer = "M22 200 L22 74 A78 64 0 0 1 178 74 L178 200 Z";
  const inner = "M38 200 L38 78 A62 50 0 0 1 162 78 L162 200 Z";
  return (
    <g>
      <g filter="url(#f-dof-1)">
        <path d={outer} fill="url(#g-stone-warm)" filter="url(#f-texture)" />
        <path d={outer} fill="url(#shade-top)" opacity={0.6} />
        {/* アーチの 石（放射状の 目地）と かなめ石 */}
        <g stroke="#000" strokeOpacity={0.28} strokeWidth={1.2}>
          {[-60, -38, -18, 18, 38, 60].map((a) => {
            const r = (a * Math.PI) / 180;
            return <line key={a} x1={100 + Math.sin(r) * 62} y1={78 - Math.cos(r) * 50} x2={100 + Math.sin(r) * 78} y2={74 - Math.cos(r) * 64} />;
          })}
          <line x1={22} y1={118} x2={38} y2={118} /><line x1={22} y1={160} x2={38} y2={160} />
          <line x1={162} y1={118} x2={178} y2={118} /><line x1={162} y1={160} x2={178} y2={160} />
        </g>
        <path d="M92 12 L108 12 L106 30 L94 30 Z" fill="url(#g-stone)" />
        <path d="M92 12 L108 12 L106 30 L94 30 Z" fill="url(#shade-cyl)" />
        {/* つたと 苔 */}
        <path d="M24 92 C34 70 52 40 82 24 M176 100 C170 84 160 62 140 44" stroke="#3f7d3a" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.85} />
        {[[30, 80], [40, 62], [54, 46], [70, 32], [170, 86], [162, 68], [150, 54]].map(([x, y], i) => (
          <ellipse key={i} cx={x} cy={y} rx={4} ry={2} fill={i % 2 ? "#4f9a48" : "#3f7d3a"} transform={`rotate(${i % 2 ? 35 : -35} ${x} ${y})`} />
        ))}
      </g>
      {/* アーチの 中: 夕方の 空の 光 */}
      <path d={inner} fill="#0b201d" />
      <path d={inner} fill="url(#g-teal-glow)" opacity={0.55} />
      <ellipse cx={100} cy={96} rx={58} ry={40} fill="#ffe2a0" opacity={0.18} filter="url(#f-glow-soft)" />
      {/* アーチの 内側の ふちの 影（奥行き） */}
      <path d={inner} fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={3} filter="url(#f-soft)" />
      {/* うかぶ 英字（頭に かくれない 左右に） */}
      <g filter="url(#f-bloom-gold)" fill="#ffe29a" fontWeight={900} fontFamily="Georgia, serif" textAnchor="middle">
        <text x={50} y={102} fontSize={22}>A</text>
        <text x={44} y={136} fontSize={13} opacity={0.85}>b</text>
        <text x={150} y={100} fontSize={20}>c</text>
        <text x={156} y={136} fontSize={13} opacity={0.85}>!</text>
      </g>
    </g>
  );
}

/** 話すときに 上げる 手（てのひらを こちらに 向けた 説明の しぐさ）。手首が 原点で、指先は −y 方向 */
function OpenHand() {
  const parts = [
    "M-6.8 0 C-7.8 -5 -7.9 -10.5 -6.6 -14.6 Q0 -16.4 6.6 -14.6 C7.9 -10.5 7.8 -5 6.8 0 Q0 2.6 -6.8 0 Z",
    capsule([-4.6, -13.6], [-5.6, -25.4], 1.85, 1.6),
    capsule([-1.5, -14.4], [-1.7, -28], 1.9, 1.65),
    capsule([1.6, -14.4], [2.2, -26.8], 1.85, 1.6),
    capsule([4.6, -13.4], [6.2, -23], 1.7, 1.45),
    capsule([-6, -4.6], [-11.6, -12.6], 2.3, 1.8),
  ];
  return (
    <g>
      {parts.map((d, i) => <path key={i} d={d} fill="url(#g-skin)" />)}
      {parts.map((d, i) => <path key={`s${i}`} d={d} fill="url(#skin-shade)" />)}
      {/* 指の つけねの すきま・てのひらの しわ・つめの つや */}
      <path d="M-3.1 -14.6 L-3.2 -17 M0.05 -14.9 L0.1 -17.4 M3.1 -14.4 L3.4 -16.8" stroke="#a24f34" strokeOpacity={0.45} strokeWidth={0.5} strokeLinecap="round" />
      <path d="M-4.6 -9 Q0 -6.6 4.4 -9.6 M-5 -4.6 Q-1 -3 2.4 -6" stroke="#b5664a" strokeOpacity={0.35} strokeWidth={0.55} fill="none" strokeLinecap="round" />
      {[[-5.5, -24.2], [-1.7, -26.8], [2.15, -25.6], [6, -21.9]].map(([x, y]) => <ellipse key={x} cx={x} cy={y} rx={0.9} ry={1.2} fill="#fff" opacity={0.45} />)}
    </g>
  );
}

export function TeacherArt({ talking = false }: { talking?: boolean }) {
  const body = "M10 200 C12 178 20 164 38 158 C54 153 70 150 84 146 L116 146 C130 150 146 153 162 158 C180 164 188 178 190 200 Z";
  const lapelL = "M84 146 L100 182 L94 200 L78 200 L68 166 L77 155 Z";
  const lapelR = "M116 146 L100 182 L106 200 L122 200 L132 166 L123 155 Z";
  return (
    <g clipPath="url(#emma-frame)">
      <clipPath id="emma-frame"><rect width={200} height={200} /></clipPath>
      <Arch />
      {/* 後ろ髪（左わけの セミロング。毛先は 肩で 外に はねる） */}
      <Hair
        d="M62 100 C54 64 70 36 100 35 C130 36 146 64 138 100 C140 116 145 128 151 139 C155 147 150 155 142 154 C136 153 131 147 125 145 L75 145 C69 147 64 153 58 154 C50 155 45 147 49 139 C55 128 60 116 62 100 Z"
        fill="url(#g-hair-emma)"
        dark={["M66 104 C62 120 58 134 54 146", "M134 104 C138 120 142 134 146 146", "M72 116 C70 128 68 138 66 146"]}
        light={["M60 124 C58 134 55 142 52 148", "M141 124 C144 134 147 142 149 148"]}
        darkColor="#2a0e04" lightColor="#f2b27a"
      />
      {/* 首と体（ティールの ジャケット＋白い ブラウス＋金の ブローチ） */}
      {/* 首（細めで、つけねに 向かって ゆるく 広がる。円柱に 見せない） */}
      <path d="M90 116 L110 116 C110 128 111 138 115 147 Q100 152 85 147 C89 138 90 128 90 116 Z" fill="url(#g-skin)" />
      <path d="M90 116 L110 116 C110 128 111 138 115 147 Q100 152 85 147 C89 138 90 128 90 116 Z" fill="url(#skin-shade)" />
      <path d="M90 120 Q100 133 110 120 L110 128 Q100 139 90 128 Z" fill="#7a3418" opacity={0.32} filter="url(#f-soft)" />      <path d={body} fill="url(#g-emma-jacket)" />
      <path d={body} fill="url(#cloth-shade)" />
      <path d={body} fill="url(#rim-cool)" />
      {/* 肩の 縫い目（仕立ての 肩の 線） */}
      <path d="M40 158 C37 166 36 172 36 178 M160 158 C163 166 164 172 164 178" stroke="#0b3238" strokeOpacity={0.3} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <path d="M38 158 C54 153 70 150 84 146 M116 146 C130 150 146 153 162 158" stroke="#9fe6e6" strokeOpacity={0.3} strokeWidth={1} fill="none" />
      {/* ブラウス（V の えりもと＋えり先） */}
      <path d="M84 146 L100 180 L116 146 Q100 152 84 146 Z" fill="url(#g-tee)" />
      <path d="M100 164 L100 180" stroke="#d8ccb6" strokeWidth={0.8} />
      <path d={lapelL} fill="#1e6870" />
      <path d={lapelR} fill="#185860" />
      <path d={lapelL} fill="url(#cloth-shade)" />
      <path d={lapelR} fill="url(#cloth-shade)" />
      <path d="M84 146 L77 155 L68 166" stroke="#8fe0e0" strokeOpacity={0.4} strokeWidth={0.9} fill="none" />
      <path d="M100 182 L94 200 M100 182 L106 200" stroke="#0b3238" strokeOpacity={0.5} strokeWidth={0.8} />
      <path d="M85 146 L91 163 L79 158 Z" fill="#fbf7ef" />
      <path d="M115 146 L109 163 L121 158 Z" fill="#efe7d8" />
      <path d="M85 146 L91 163 L79 158 Z M115 146 L109 163 L121 158 Z" fill="none" stroke="#c9bca4" strokeWidth={0.6} />
      <Folds paths={["M56 190 Q60 182 66 178", "M144 190 Q140 182 134 178"]} o={0.6} />
      <g>
        <circle cx={127} cy={172} r={5} fill="url(#metal-gold)" />
        <circle cx={127} cy={172} r={3.5} fill="url(#gem-topaz)" />
        <circle cx={125.9} cy={170.9} r={1} fill="#fff" opacity={0.9} />
      </g>
      {/* 顔（大人の骨格：ほお骨のつや） */}
      <Face g={EMMA} blush={0.55} k={K} />
      <ellipse cx={79} cy={99} rx={6} ry={3.4} fill="#fff" opacity={0.13} />
      <ellipse cx={121} cy={99} rx={6} ry={3.4} fill="#fff" opacity={0.1} />
      {/* イヤリング（耳に かけた 髪の 下で ゆれる 金の しずく） */}
      <circle cx={131.4} cy={99.4} r={1.3} fill="url(#metal-gold)" />
      <path d="M131.4 100.6 L131.4 103" stroke="#c99a3a" strokeWidth={0.6} />
      <ellipse cx={131.4} cy={105} rx={1.9} ry={2.4} fill="url(#gem-topaz)" />
      <circle cx={130.8} cy={104.2} r={0.55} fill="#fff" opacity={0.9} />
      {/* 頭の てっぺんの 髪（分けめの まわりに 肌の すきまが 出ないように 先に しく） */}
      <path d="M66 74 C66 50 80 37 100 36.5 C120 37 135 50 136 70 C126 58 112 54 100 54 C86 54 74 60 66 74 Z" fill="url(#g-hair-emma)" />
      <path d="M90.5 41 C91 47 92.5 53 94.5 58" stroke="#2a0e04" strokeOpacity={0.35} strokeWidth={0.9} fill="none" strokeLinecap="round" />
      {/* 前髪: 向かって 左の 顔まわりの 毛束（肩へ 流れる） */}
      <Hair
        d="M92 40 C78 40 66 52 63.5 72 C61.5 90 63 106 65.5 120 C67 130 70 138 75 144 C70.5 130 70 116 71.5 102 C73.5 86 77.5 70 87 60 C89.5 54 91.5 47 92 40 Z"
        fill="url(#g-hair-emma)"
        dark={["M84 48 C74 60 68 80 67 104", "M76 70 C72 88 71 110 73 132"]}
        light={["M80 50 C72 62 68 76 66.5 92"]}
        darkColor="#2a0e04" lightColor="#f6c08a"
      />
      {/* 前髪: 分けめから 向かって 右へ 流して 耳に かける */}
      <path d="M94 60 C104 62 114 66 122 72 C128 78 131 84 133 90 L130 92 C126 84 120 78 112 74 C106 70 100 68 94 66 Z" fill="#7a3418" opacity={0.26} filter="url(#f-soft)" />
      <Hair
        d="M90 40 C108 34 132 42 139 64 C141 74 139.5 84 135 92 C132 83 127.5 76 121.5 70.5 C112.5 63 101.5 60.5 94 58.5 C91.5 52.5 90 46.5 90 40 Z"
        fill="url(#g-hair-emma)"
        dark={["M94 44 C110 42 126 50 134 68", "M96 50 C110 50 122 58 130 74", "M104 40 C120 40 132 50 137 64"]}
        light={["M100 43 C112 42.5 122 47 128 55"]}
        darkColor="#2a0e04" lightColor="#f6c08a"
      />
      {/* ひたいに かかる やわらかい 毛先 */}
      <Hair d="M95 57 C91 62 87.5 69 86 78 C89.5 71 93.5 66 99 61.5 Z" fill="url(#g-hair-emma)" darkColor="#2a0e04" />
      <HairHalo cx={100} cy={70} rx={36} ry={33} a0={-160} a1={-40} w={4} o={0.28} color="#ffd9b0" />
      {/* まゆ・アイシャドウ・目・鼻・くちびる */}
      <Brow x={86.5} y={78} side={-1} color="#5a2a12" lift={0.5} w={1.25} />
      <Brow x={113.5} y={78} side={1} color="#5a2a12" lift={0.5} w={1.25} />
      <ellipse cx={86.5} cy={83.6} rx={7.4} ry={3} fill="#a0587a" opacity={0.2} filter="url(#f-soft)" />
      <ellipse cx={113.5} cy={83.6} rx={7.4} ry={3} fill="#a0587a" opacity={0.2} filter="url(#f-soft)" />
      {/* まつげは 目じりの 1本だけ（大人の 落ちついた 目もと。くもの足のような とげを 出さない） */}
      <Eye x={86.5} y={88} side={-1} iris="hazel" size={1.25} lashes={0} />
      <Eye x={113.5} y={88} side={1} iris="hazel" size={1.25} lashes={0} />
      <Nose x={100} y={104} s={1.3} />
      {talking ? (
        <Mouth x={100} y={114.5} kind="talk" s={1.35} className="mouth-talk" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      ) : (
        <g>
          {/* やさしい ほほえみ（口角を 少し 上げる） */}
          <path d="M89 113.4 Q94.5 111.6 100 112.9 Q105.5 111.6 111 113.4 Q100 116 89 113.4 Z" fill="#b8464f" />
          <path d="M90.4 114 Q100 121 109.6 114 Q100 116.4 90.4 114 Z" fill="#cc5a64" />
          <path d="M89 113.4 Q100 116.4 111 113.4" stroke="#7a2228" strokeWidth={0.8} fill="none" strokeLinecap="round" />
          <path d="M96 118 Q100 119 104 118" stroke="#ffd0c8" strokeOpacity={0.6} strokeWidth={0.9} fill="none" strokeLinecap="round" />
          <path d="M88.2 112.4 q-0.7 0.8 -0.3 1.8 M111.8 112.4 q0.7 0.8 0.3 1.8" stroke="#a65a44" strokeOpacity={0.45} strokeWidth={0.65} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* 手（話している間は 向かって 右の 手を ひじで 曲げて 上げる。枠の 外には 出さない） */}
      {talking && (
        <g>
          <SmoothLimb pts={[[172, 214], [167, 194], [161, 172], [157.4, 156]]} radii={[12, 11, 9.4, 8.4]} fill="url(#g-emma-jacket)" gloss={0.12} />
          <path d={capsule([157.6, 156.4], [156.9, 151.6], 8.2, 7.9)} fill="#f4efe6" />
          <path d={capsule([157.6, 156.4], [156.9, 151.6], 8.2, 7.9)} fill="url(#cloth-shade)" />
          <g transform="translate(156.4 150) rotate(6)"><OpenHand /></g>
        </g>
      )}
    </g>
  );
}
