/**
 * AI女性教師「エマ先生」（オリジナル・3DCGアニメ映画風）。座標系は 200×200。
 * 大人の顔立ち（面長・小さめの目・ほお骨・くちびる）で、子どもキャラとはっきり区別する。
 * talking=true で口が動き、右手を上げて話す（ジェスチャー）。背後には英字が光る遺跡の石板。
 * 将来 AI 先生の動画サービスに切りかえるときは、LessonSteps 側の videoUrl を使う（このイラストは代わりの表示）。
 */
import { Brow, Eye, Face, Folds, Hair, Limb, Mouth, Nose, capsule, type FaceGeo } from "./parts";

const EMMA: FaceGeo = { cx: 100, top: 52, chin: 128, hw: 30, jaw: 10, cheek: 100 };
const K = 1.35; // 子どもの顔パーツに対する大きさ

export function TeacherArt({ talking = false }: { talking?: boolean }) {
  const body = "M28 200 C32 162 58 149 84 145 L116 145 C142 149 168 162 172 200 Z";
  return (
    <g>
      {/* 光る英字の石板（面取りした石の枠＋内側の影） */}
      <g transform="translate(100 120)">
        <rect x={-90} y={-114} width={180} height={90} rx={9} fill="url(#g-stone)" />
        <rect x={-90} y={-114} width={180} height={90} rx={9} fill="url(#shade-top)" opacity={0.7} />
        <rect x={-90} y={-114} width={180} height={90} rx={9} fill="none" stroke="#d9cfa8" strokeOpacity={0.35} strokeWidth={1.2} />
        <rect x={-81} y={-105} width={162} height={72} rx={5} fill="#0b201d" />
        <rect x={-81} y={-105} width={162} height={14} rx={5} fill="#000" opacity={0.35} />
        <g filter="url(#f-bloom-gold)" fill="#ffe29a" fontWeight={900} fontFamily="Georgia, serif">
          <text x={-64} y={-58} fontSize={26}>A</text><text x={-32} y={-50} fontSize={20}>b</text>
          <text x={36} y={-58} fontSize={24}>c</text><text x={58} y={-46} fontSize={16}>!</text>
        </g>
      </g>
      {/* 後ろ髪（肩でくるんと外にはねるミディアム） */}
      <Hair
        d="M64 96 C56 60 70 38 100 37 C130 38 144 60 136 96 C140 118 147 136 141 152 C133 157 124 151 122 140 L78 140 C76 151 67 157 59 152 C53 136 60 118 64 96 Z"
        fill="url(#g-hair-emma)"
        dark={["M66 100 C62 120 60 136 62 150", "M134 100 C138 120 140 136 138 150", "M70 110 C68 124 68 136 70 146"]}
        light={["M62 120 C60 132 60 140 62 148"]}
        darkColor="#2a0e04" lightColor="#f2b27a"
      />
      {/* 首と体（ティールのジャケット＋白いブラウス＋金のブローチ） */}
      <path d="M87 120 L113 120 L115 149 Q100 155 85 149 Z" fill="url(#g-skin)" />
      <path d="M87 120 L113 120 L115 149 Q100 155 85 149 Z" fill="url(#skin-shade)" />
      <path d="M87 123 Q100 136 113 123 L113 130 Q100 141 87 130 Z" fill="#7a3418" opacity={0.32} filter="url(#f-soft)" />
      <path d={body} fill="url(#g-emma-jacket)" />
      <path d={body} fill="url(#cloth-shade)" />
      <path d={body} fill="url(#rim-cool)" />
      <path d="M86 146 L100 184 L114 146 Q100 151 86 146 Z" fill="url(#g-tee)" />
      <path d="M90 147 L100 172 L110 147" stroke="#d8ccb6" strokeWidth={1} fill="none" />
      {/* えり（ラペル） */}
      <path d="M85 145 L100 184 L93 200 L79 200 L72 168 L81 156 Z" fill="#1e6870" />
      <path d="M115 145 L100 184 L107 200 L121 200 L128 168 L119 156 Z" fill="#185860" />
      <path d="M85 145 L100 184 L93 200 L79 200 L72 168 L81 156 Z" fill="url(#cloth-shade)" />
      <path d="M85 145 L81 156 L72 168" stroke="#8fe0e0" strokeOpacity={0.4} strokeWidth={0.9} fill="none" />
      <Folds paths={["M50 178 Q56 172 64 174", "M150 174 Q144 170 138 174", "M60 196 Q64 188 62 180", "M140 196 Q136 188 138 180"]} />
      <g>
        <circle cx={124} cy={170} r={5.4} fill="url(#metal-gold)" />
        <circle cx={124} cy={170} r={3.8} fill="url(#gem-topaz)" />
        <circle cx={122.8} cy={168.8} r={1.1} fill="#fff" opacity={0.9} />
      </g>
      {/* 顔（大人の骨格：ほお骨のつや） */}
      <Face g={EMMA} blush={0.6} k={K} />
      <ellipse cx={79} cy={99} rx={6} ry={3.4} fill="#fff" opacity={0.13} />
      <ellipse cx={121} cy={99} rx={6} ry={3.4} fill="#fff" opacity={0.1} />
      <circle cx={131.6} cy={99.5} r={1.8} fill="url(#metal-gold)" />
      {/* 前髪（左わけ・右に流す） */}
      <Hair
        d="M70 104 C64 78 70 52 86 43 C104 36 128 42 136 64 C139 74 138 88 134 100 C132 88 128 78 120 70 C110 64 98 62 90 58 C86 68 80 78 76 92 C74 98 72 102 70 104 Z"
        fill="url(#g-hair-emma)"
        dark={["M88 46 C104 46 120 54 128 72", "M90 51 C104 53 116 60 124 74", "M84 48 C78 60 74 76 72 96", "M110 42 C124 46 132 56 135 70"]}
        light={["M96 44 C110 44 122 50 130 62", "M82 52 C78 62 76 72 75 82"]}
        darkColor="#2a0e04" lightColor="#f6c08a"
      />
      <path d="M90 60 C100 64 112 68 120 72 L118 76 C110 72 100 68 90 64 Z" fill="#7a3418" opacity={0.22} filter="url(#f-soft)" />
      {/* まゆ・目・鼻・くちびる */}
      <Brow x={86.5} y={78} side={-1} color="#5a2a12" lift={0.5} w={1.25} />
      <Brow x={113.5} y={78} side={1} color="#5a2a12" lift={0.5} w={1.25} />
      <Eye x={86.5} y={88} side={-1} iris="hazel" size={1.25} lashes={2} />
      <Eye x={113.5} y={88} side={1} iris="hazel" size={1.25} lashes={2} />
      <Nose x={100} y={104} s={1.35} />
      {talking ? (
        <Mouth x={100} y={114.5} kind="talk" s={1.35} className="mouth-talk" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      ) : (
        <g>
          <path d="M90 114.5 Q95 112.2 100 113.4 Q105 112.2 110 114.5 Q100 116.4 90 114.5 Z" fill="#b8464f" />
          <path d="M91 115 Q100 121.4 109 115 Q100 116.8 91 115 Z" fill="#cc5a64" />
          <path d="M90 114.5 Q100 116.6 110 114.5" stroke="#7a2228" strokeWidth={0.8} fill="none" strokeLinecap="round" />
          <path d="M96 118.4 Q100 119.4 104 118.4" stroke="#ffd0c8" strokeOpacity={0.6} strokeWidth={0.9} fill="none" strokeLinecap="round" />
          <path d="M88.6 113.4 q-0.6 1 0 2 M111.4 113.4 q0.6 1 0 2" stroke="#a65a44" strokeOpacity={0.5} strokeWidth={0.7} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* 手（話している間は右手を上げる） */}
      {talking && (
        <g>
          <Limb a={[156, 204]} b={[153, 150]} ra={10} rb={7.6} fill="url(#g-emma-jacket)" />
          <Limb a={[153.4, 152]} b={[153, 146]} ra={7.4} rb={7.4} fill="#f4efe6" gloss={0.3} />
          {(() => {
            const parts = [
              "M146 142 C145 134 147 128 153 127 C159 128 161 134 160 142 Q153 147 146 142 Z",
              capsule([148, 129], [145.5, 117], 1.7, 1.45),
              capsule([151.5, 127.5], [150.8, 114], 1.75, 1.5),
              capsule([155, 127.5], [155.6, 115], 1.75, 1.5),
              capsule([158.2, 129], [160.4, 119], 1.6, 1.35),
              capsule([146.5, 137], [140.5, 131], 2, 1.6),
            ];
            return (
              <g>
                {parts.map((d, i) => <path key={i} d={d} fill="url(#g-skin)" />)}
                {parts.map((d, i) => <path key={`s${i}`} d={d} fill="url(#skin-shade)" />)}
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
}
