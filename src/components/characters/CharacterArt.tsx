/**
 * キャラクターの顔イラスト（3DCGアニメ映画風・オリジナル）。
 * 100×100 の座標系の <g>。質感は components/art/ArtDefs.tsx の共通定義（url(#...)）を参照する。
 *
 * 見た目のルール:
 *  - 年齢どおりの顔立ち（ちびキャラにしない）。目は顔の高さのまんなか、鼻・くちびる・耳まで描く。
 *  - 肌は「色 → 皮下散乱（ふちが赤い）→ 陰 → 逆光」の4層。髪は毛束の線と天使の輪のつや。
 *  - 光は左上から（暖色）、ふちの逆光は右から（寒色）。
 */
import type { CharacterId } from "@/lib/game/characters";
import type { Mood } from "@/lib/game/companion";
import { Brow, BustNeck, Eye, Face, Folds, Hair, HairHalo, Mouth, Nose, type FaceGeo } from "./parts";

const LINE = "#2a170a";

/** 顔の形（StandingArt で頭の大きさ・位置を決めるのにも使う） */
export const FACE_GEO: Record<"haru" | "riko" | "kiko", FaceGeo> = {
  haru: { cx: 50, top: 28, chin: 82, hw: 22, jaw: 7, cheek: 60 },
  riko: { cx: 50, top: 30, chin: 81, hw: 21, jaw: 8, cheek: 61 },
  kiko: { cx: 50, top: 31, chin: 80, hw: 21, jaw: 9, cheek: 62 },
};

/** バストアップの肩（服の色＋布の陰影） */
function Shoulders({ fill, children }: { fill: string; children?: React.ReactNode }) {
  const d = "M9 101 C11 90 24 84.5 40 82 L60 82 C76 84.5 89 90 91 101 Z";
  return (
    <g>
      <path d={d} fill={fill} />
      <path d={d} fill="url(#cloth-shade)" />
      <path d={d} fill="url(#rim-cool)" />
      {children}
    </g>
  );
}

// ---------------------------------------------------------------------------
// ハル（10歳）
// ---------------------------------------------------------------------------

/** 主人公ハル（10歳）: 毛先のはねた茶色の髪＋赤いバンダナ＋探検ベスト。自信のある笑顔 */
export function HaruArt({ bust = true }: { bust?: boolean } = {}) {
  const g = FACE_GEO.haru;
  return (
    <g>
      {bust && (
        <>
          <BustNeck />
          <Shoulders fill="url(#g-vest)">
            <path d="M42.5 82 L50 93 L57.5 82 Z" fill="url(#g-tee)" />
            <path d="M42.5 82 L50 93 L57.5 82" stroke="#cfc3ad" strokeWidth={1.2} fill="none" />
            <path d="M40.5 82 L47.5 101 M59.5 82 L52.5 101" stroke="#143823" strokeWidth={1.3} />
            <Folds paths={["M22 92 Q28 89 33 92", "M70 90 Q75 92 79 96", "M36 95 Q38 98 37 101"]} />
            <path d="M28 86 L60 101" stroke="#5a3418" strokeWidth={3.6} />
            <path d="M28 85.2 L60 100.2" stroke="#a8754a" strokeWidth={0.8} opacity={0.7} />
          </Shoulders>
        </>
      )}
      <Face g={g} blush={0.8} />
      {/* 髪（後ろ→前の順に重ねる） */}
      {/* 頭の まるみに そって 右へ 流れる 毛束（ブラシのように 真上へ 立てない） */}
      <Hair
        d="M25.5 52 C22 40 23 30 28 23 C26 19 26.5 15 29 12 C31 15 33 16.5 35.5 17 C35 12 37 8 40.5 5.5 C41.5 9.5 43.5 12 46.5 13 C47.5 8.5 50.5 5 55 3.5 C55 7.5 56 10.5 58.5 12.5 C61 9.5 64.5 8 69 8 C67 11 66.5 14 67 16.5 C70 15.5 73 16 76 18 C73.5 20 72.5 22.5 72.5 25 C77.5 31 79 42 74.5 52 C73 45 71 41 68 39 L32 39 C29 41 27 45 25.5 52 Z"
        fill="url(#g-hair-haru)"
        dark={["M29 12 C30.5 18 31.5 25 31 33", "M40.5 5.5 C40 14 40.5 24 41.5 36", "M55 3.5 C51 12 50 24 50.5 36", "M69 8 C64 15 61 25 60.5 36", "M76 18 C71 24 68.5 30 68 37", "M35.5 17 C36.5 24 36.5 30 35.5 37", "M27 32 C28 38 28.4 44 27.6 50"]}
        light={["M33 15.5 C34.5 20 35.5 25 36 30", "M44.5 9.5 C44.6 15 45.2 20 46 25", "M57.5 8.5 C55.6 14 55 19 55.4 24", "M68 12 C65 17 63.6 21 63.2 26"]}
        lightColor="#c99464"
      />
      <HairHalo cx={50} cy={37} rx={22.5} ry={22} a0={-158} a1={-28} w={3} o={0.3} color="#ffd9a8" />
      <path d="M26.5 48 C26 52 26.6 56 28 59 C28.6 55 29 51.5 30 49 Z M73.5 48 C74 52 73.4 56 72 59 C71.4 55 71 51.5 70 49 Z" fill="url(#g-hair-haru)" />
      {/* バンダナ（布のしわ・小さな模様・結び目） */}
      <path d="M27 48.5 Q50 38 73 48.5 Q50 42.5 27 51 Z" fill="#7a3418" opacity={0.25} filter="url(#f-soft)" />
      <path d="M24.5 41 Q50 29.5 75.5 41 L75.5 48.5 Q50 37 24.5 48.5 Z" fill="url(#g-bandana)" />
      <path d="M24.5 41 Q50 29.5 75.5 41 L75.5 48.5 Q50 37 24.5 48.5 Z" fill="url(#cloth-shade)" />
      <path d="M26 41.6 Q50 30.8 74 41.6" stroke="#ffc2b8" strokeWidth={1} fill="none" opacity={0.9} />
      <g fill="#fff" opacity={0.55}>
        {[[31, 41.5], [38, 38.6], [45, 37], [55, 37], [62, 38.6], [69, 41.5]].map(([x, y]) => <circle key={x} cx={x} cy={y + 2.6} r={0.7} />)}
      </g>
      <path d="M74 42 C79 39 84 36 89 35 C87.5 38.5 86.5 41 86.5 44 C83 43 79 43.5 75.5 45 Z" fill="url(#g-bandana)" />
      <path d="M75.5 45.5 C80 46.5 84 49 87 52.5 C83.5 53 80.5 52.5 78 51.5 C77 49.5 76.5 47.5 75.5 45.5 Z" fill="url(#g-bandana)" />
      <path d="M77 41.5 C80 40 83 38.5 86 38 M78 48 C80.5 49 82.5 50 84.5 51.5" stroke="#6a0c14" strokeOpacity={0.5} strokeWidth={0.8} fill="none" />
      <circle cx={76.5} cy={44.5} r={2.8} fill="url(#g-bandana)" />
      <circle cx={76.5} cy={44.5} r={2.8} fill="url(#shade-sphere)" />
      {/* 前髪（バンダナにかかる毛束） */}
      <Hair d="M33 41 C35 38 38 37 41 37.5 C40.5 41 39.5 44 37.5 47 C36.5 44.5 35 42.5 33 41 Z" fill="url(#g-hair-haru)" light={["M38.5 38.5 C38.6 40.5 38.2 42.5 37.6 44"]} />
      <Hair d="M42 37.5 C45 36.5 48 36.5 51 37.5 C49.5 41 48 44.5 45.5 48 C45 44 44 40.5 42 37.5 Z" fill="url(#g-hair-haru)" light={["M47.5 38 C47.2 40.5 46.6 43 45.8 45"]} />
      <Hair d="M52 37.5 C55 37 58 37.5 60.5 39 C59 41.5 58.5 44 58 46.5 C56.5 43 54.5 40 52 37.5 Z" fill="url(#g-hair-haru)" />
      {/* 眉・目・鼻・口 */}
      <Brow x={40.5} y={48.6} side={-1} color="#3a1d0c" w={1.05} />
      <Brow x={59.5} y={48.2} side={1} color="#3a1d0c" lift={0.6} w={1.05} />
      <Eye x={40.4} y={55.5} side={-1} iris="brown" />
      <Eye x={59.6} y={55.5} side={1} iris="brown" />
      <Nose x={50} y={63.8} />
      <Mouth x={50} y={70.4} kind="grin" s={0.9} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// リコ（8歳）
// ---------------------------------------------------------------------------

/** なかまリコ（8歳）: オレンジのツインテール＋黄色いヘアバンド＋そばかす */
export function RikoArt({ bust = true }: { bust?: boolean } = {}) {
  const g = FACE_GEO.riko;
  return (
    <g>
      {bust && (
        <>
          <BustNeck />
          <Shoulders fill="url(#g-riko-dress)">
            <Folds paths={["M24 92 Q29 89 34 93", "M68 91 Q73 92 77 97"]} />
          </Shoulders>
          <path d="M40 82 Q50 90 60 82 L59 87.5 Q50 95 41 87.5 Z" fill="#ffd23f" />
          <path d="M40 82 Q50 90 60 82 L59 87.5 Q50 95 41 87.5 Z" fill="url(#cloth-shade)" />
          <path d="M55 88 L60.5 100 L53 97 Z" fill="#f0a81c" />
          <path d="M55 88 L60.5 100 L53 97 Z" fill="url(#cloth-shade)" />
        </>
      )}
      {/* ツインテール（顔の後ろ） */}
      <Hair
        d="M28 42 C17 43 10.5 52 11 64 C11.5 74 15 82 20.5 86 C19 80 18.5 74 20 68 C21.5 62 25 58 29.5 56 Z"
        fill="url(#g-hair-riko)"
        dark={["M24 46 C16 52 14 64 17 78", "M27 50 C21 56 19.5 66 20 74"]}
        light={["M20 49 C15 55 13.8 63 14.6 70"]}
        darkColor="#6a2408" lightColor="#ffe2b8"
      />
      <Hair
        d="M72 42 C83 43 89.5 52 89 64 C88.5 74 85 82 79.5 86 C81 80 81.5 74 80 68 C78.5 62 75 58 70.5 56 Z"
        fill="url(#g-hair-riko)"
        dark={["M76 46 C84 52 86 64 83 78", "M73 50 C79 56 80.5 66 80 74"]}
        light={["M80 49 C85 55 86.2 63 85.4 70"]}
        darkColor="#6a2408" lightColor="#ffe2b8"
      />
      {/* ツインテールの 内側の 毛束（ボリュームと 奥行き） */}
      {([-1, 1] as const).map((s) => (
        <g key={`tail${s}`} transform={s > 0 ? "translate(100 0) scale(-1 1)" : undefined}>
          <path d="M27.5 50 C20.5 55 17.5 64 18.6 74 C19.4 80 21.4 84 23.6 86.4 C22.6 80 22.6 73 24 67 C25.4 61.5 28 58 31 56 Z" fill="#a8400e" opacity={0.55} />
          <Hair d="M28 51.5 C22.5 56.5 20.5 65 21.6 73.5 C22.2 78 23.6 81.5 25.4 83.6 C25 78 25.2 72 26.6 66.5 C27.8 61.8 29.6 58.6 31.6 56.6 Z" fill="url(#g-hair-riko)" dark={["M27 55 C23.5 61 22.8 69 24 77"]} darkColor="#6a2408" />
          <HairHalo cx={30} cy={66} rx={16} ry={18} a0={-170} a1={-120} w={2.4} o={0.35} color="#ffe6c4" />
        </g>
      ))}
      <path d="M26 52 C23 34 33 24 50 23.5 C67 24 77 34 74 52 Z" fill="url(#g-hair-riko)" />
      <path d="M26 52 C23 34 33 24 50 23.5 C67 24 77 34 74 52 Z" fill="url(#hair-sheen)" />
      <HairHalo cx={50} cy={46} rx={22.5} ry={21.5} a0={-150} a1={-32} w={2.6} o={0.32} color="#fff0d6" />
      {[26, 74].map((x) => (
        <g key={x}>
          <circle cx={x} cy={46} r={3.8} fill="url(#gem-topaz)" />
          <circle cx={x - 1.2} cy={44.8} r={1} fill="#fff" opacity={0.85} />
        </g>
      ))}
      <Face g={g} />
      {/* 前髪（横に流したバング） */}
      <Hair
        d="M27.5 55 C25.5 38 33 27.5 50 27 C67 27.5 74.5 38 72.5 55 C71 48 68 42.5 63.5 39 C58 44.5 50 46 43.5 40.5 C38 44 31 48.5 27.5 55 Z"
        fill="url(#g-hair-riko)"
        dark={["M50 27.5 C47 33 45 37 43.5 40.5", "M58 28.5 C60 33 62 36.5 63.5 39", "M38 31 C33 38 30 45 28.5 52", "M64 31 C69 37 71.5 44 72 51"]}
        light={["M40 31.5 Q47 28.5 55 29", "M66 34 C68.5 38 70 42 70.6 46"]}
        darkColor="#6a2408" lightColor="#ffe2b8"
      />
      <Hair d="M44 32 C40 37 36.5 42 33.5 47.5 C36 45.5 39 44 43.5 40.5 Z" fill="url(#g-hair-riko)" darkColor="#6a2408" />
      <path d="M28.5 40.5 Q50 22.5 71.5 40.5" stroke="#e8a810" strokeWidth={4.6} fill="none" strokeLinecap="round" />
      <path d="M28.5 40 Q50 22 71.5 40" stroke="#ffd23f" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <path d="M30.5 38.6 Q50 23.4 69.5 38.6" stroke="#fff7c4" strokeWidth={1} fill="none" strokeLinecap="round" opacity={0.9} />
      <Brow x={40.8} y={48.4} side={-1} color="#9a4a18" lift={0.6} w={0.92} />
      <Brow x={59.2} y={48.4} side={1} color="#9a4a18" lift={0.6} w={0.92} />
      <Eye x={40.8} y={55.6} side={-1} iris="green" size={1.05} lashes={1} />
      <Eye x={59.2} y={55.6} side={1} iris="green" size={1.05} lashes={1} />
      <g fill="#c26a3a" opacity={0.55}>
        <circle cx={33} cy={62.5} r={0.8} /><circle cx={35.6} cy={64.2} r={0.7} /><circle cx={32.2} cy={65} r={0.6} />
        <circle cx={67} cy={62.5} r={0.8} /><circle cx={64.4} cy={64.2} r={0.7} /><circle cx={67.8} cy={65} r={0.6} />
      </g>
      <Nose x={50} y={63.6} s={0.88} />
      <Mouth x={50} y={70.2} kind="smile" s={0.95} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// キコ（7歳）
// ---------------------------------------------------------------------------

/** なかまキコ（7歳）: むらさきのボブ＋花のヘアピン＋大きめの目 */
export function KikoArt({ bust = true }: { bust?: boolean } = {}) {
  const g = FACE_GEO.kiko;
  return (
    <g>
      {bust && (
        <>
          <BustNeck />
          <Shoulders fill="url(#g-kiko-dress)" />
          <path d="M8 101 C10 88 22 83 37 81 L42 84.5 Q50 89.5 58 84.5 L63 81 C78 83 90 88 92 101 Z" fill="url(#g-kiko-cape)" />
          <path d="M8 101 C10 88 22 83 37 81 L42 84.5 Q50 89.5 58 84.5 L63 81 C78 83 90 88 92 101 Z" fill="url(#rim-cool)" />
          <Folds paths={["M20 94 Q25 90 30 92", "M72 92 Q77 93 81 98"]} />
          <path d="M42 82.5 C42 87.5 46 89.5 50 87.5 C54 89.5 58 87.5 58 82.5 Q50 85.5 42 82.5 Z" fill="#fff8ee" />
          <circle cx={50} cy={89} r={2.6} fill="url(#gem-topaz)" />
        </>
      )}
      {/* うしろのボブ */}
      <Hair
        d="M21.5 64 C17.5 44 25 24.5 50 23.5 C75 24.5 82.5 44 78.5 64 C78 69 74.5 71 71 69.5 C71.5 62 71 56 70 52 L30 52 C29 56 28.5 62 29 69.5 C25.5 71 22 69 21.5 64 Z"
        fill="url(#g-hair-kiko)"
        dark={["M24 50 C23 56 23.5 62 25 67", "M76 50 C77 56 76.5 62 75 67"]}
        darkColor="#120630"
      />
      <Face g={g} />
      {/* 前髪（ぱっつん）と顔まわりの毛束 */}
      <Hair
        d="M27 56 C25.5 38 33 28 50 27.5 C67 28 74.5 38 73 56 C72 51.5 71 48 70 45.5 C68 46 66 46.2 64 45.6 L61.5 44 C59 45.8 56 46.2 53 45.5 L50 44 C47 45.8 44 46.2 41 45.5 L38.5 44 C36 45.8 33.5 46 30.5 45.5 C29 48.5 27.8 52 27 56 Z"
        fill="url(#g-hair-kiko)"
        dark={["M41 30 C40 36 40.5 41 41 45.5", "M50 28 L50 44", "M59 30 C60 36 59.5 41 59 45.5", "M31 36 C28.5 44 27.6 50 27.6 55", "M69 36 C71.5 44 72.4 50 72.4 55"]}
        light={["M45 31.5 C44.6 35 44.8 38 45.2 41", "M56 31.5 C56.3 35 56.1 38 55.6 40.5"]}
        darkColor="#120630" lightColor="#d6c4ff"
      />
      <HairHalo cx={50} cy={50} rx={21.5} ry={20.5} a0={-152} a1={-30} w={2.8} o={0.34} color="#e6dcff" />
      {/* 顔まわりの 毛束（あごの 横で 内側に まるまる） */}
      <Hair d="M27 50 C25.6 57 26 64 28.4 69.4 C29.4 70.8 31 70.8 31.8 69.6 C30.8 63 30.9 57 31.6 51 Z" fill="url(#g-hair-kiko)" dark={["M29 54 C28.2 59 28.4 64 29.6 68"]} darkColor="#120630" />
      <Hair d="M73 50 C74.4 57 74 64 71.6 69.4 C70.6 70.8 69 70.8 68.2 69.6 C69.2 63 69.1 57 68.4 51 Z" fill="url(#g-hair-kiko)" dark={["M71 54 C71.8 59 71.6 64 70.4 68"]} darkColor="#120630" />
      <path d="M30 46 Q50 41 70 46 Q50 44 30 48 Z" fill="#3a1a6a" opacity={0.25} filter="url(#f-soft)" />
      {/* 花のヘアピン */}
      <g transform="translate(69.5 35)">
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx="0" cy="-4.6" rx="3.2" ry="4.6" fill="#ff8fc0" transform={`rotate(${r})`} />)}
        {[0, 72, 144, 216, 288].map((r) => <ellipse key={`s${r}`} cx="0" cy="-4.6" rx="3.2" ry="4.6" fill="url(#shade-sphere)" transform={`rotate(${r})`} />)}
        {[0, 72, 144, 216, 288].map((r) => <path key={`v${r}`} d="M0 -1.5 L0 -7" stroke="#d65a92" strokeOpacity={0.5} strokeWidth={0.5} transform={`rotate(${r})`} />)}
        <circle r="2.6" fill="url(#gem-topaz)" />
        <circle cx={-0.8} cy={-0.8} r={0.8} fill="#fff" opacity={0.9} />
      </g>
      <Brow x={41} y={48.8} side={-1} color="#3a2068" lift={0.8} w={0.85} />
      <Brow x={59} y={48.8} side={1} color="#3a2068" lift={0.8} w={0.85} />
      <Eye x={41} y={56} side={-1} iris="violet" size={1.1} lashes={2} />
      <Eye x={59} y={56} side={1} iris="violet" size={1.1} lashes={2} />
      <Nose x={50} y={63.6} s={0.82} />
      <Mouth x={50} y={69.8} kind="open" s={0.95} />
    </g>
  );
}

// ---------------------------------------------------------------------------
// ビリモ（オリジナルの相棒モンスター）
// ---------------------------------------------------------------------------

/** マスコットの目（大きなつやつやの瞳） */
function MascotEye({ x, y, closed }: { x: number; y: number; closed?: boolean }) {
  if (closed) return <path d={`M${x - 5} ${y} q5 4.5 10 0`} stroke={LINE} strokeWidth={2.4} fill="none" strokeLinecap="round" />;
  return (
    <g>
      <ellipse cx={x} cy={y} rx={5.4} ry={6.6} fill="#0d1a3a" />
      <ellipse cx={x} cy={y + 1.6} rx={4.2} ry={4.6} fill="url(#iris-night)" />
      <ellipse cx={x} cy={y} rx={5.4} ry={6.6} fill="url(#eye-lid)" />
      <ellipse cx={x - 1.8} cy={y - 2.6} rx={2} ry={2.4} fill="#fff" />
      <circle cx={x + 2.1} cy={y + 2.8} r={0.95} fill="#fff" opacity={0.85} />
      <path d={`M${x - 3} ${y + 4.6} Q${x} ${y + 6} ${x + 3} ${y + 4.6}`} stroke="#bfe8ff" strokeOpacity={0.45} strokeWidth={0.9} fill="none" />
    </g>
  );
}

/**
 * 相棒ビリモ（オリジナルの電撃モンスター）。
 * つやのあるレモン色のまんまるボディ・雲形のおなか・星のアンテナ・空色のいなずましっぽ・ほっぺの星。
 */
export function BirimoArt({ mood = "happy" }: { mood?: Mood }) {
  const happyUp = mood === "excited" || mood === "cheer";
  const BROWN = "#5a2a0a";
  const mouth =
    happyUp ? (
      <g>
        <path d="M42.5 64 Q50 77 57.5 64 Q50 66.2 42.5 64 Z" fill="#7a1828" />
        <path d="M45.5 70.2 Q50 67.4 54.5 70.2 Q50 74.2 45.5 70.2 Z" fill="#ff7088" />
        <path d="M42.5 64 Q50 66.2 57.5 64" stroke={BROWN} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      </g>
    )
    : mood === "sleepy" ? <ellipse cx="50" cy="66" rx="2.6" ry="2.1" fill="#7a1828" />
    : mood === "worried" ? <path d="M44 68 Q50 64 56 68" stroke={BROWN} strokeWidth={1.7} fill="none" strokeLinecap="round" />
    : <path d="M43.5 64.2 Q46.8 67.6 50 64.4 Q53.2 67.6 56.5 64.2" stroke={BROWN} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  /**
   * まるい 耳（内側は 空色の くぼみ）。とがった 耳＋黄色い 体＋いなずまの しっぽ に すると
   * 有名な キャラクターに 似てしまうので、耳は まるく・しっぽは くるくるの 電気の ばね に する（オリジナルの 形を 守る）。
   */
  const ear = (x: number, rot: number) => (
    <g transform={`translate(${x} 33) rotate(${rot})`}>
      <ellipse cx={0} cy={0} rx={11} ry={10.4} fill="url(#g-volt)" />
      <ellipse cx={0.6} cy={1.4} rx={6.4} ry={5.8} fill="#0e5e88" opacity={0.45} filter="url(#f-soft)" />
      <ellipse cx={0} cy={0.6} rx={6} ry={5.4} fill="url(#g-sky)" />
      <path d="M-4.6 2.4 A6 5.4 0 0 1 -1.4 -4.6" stroke="#0b4a70" strokeOpacity={0.35} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={0} rx={11} ry={10.4} fill="url(#shade-sphere)" opacity={0.42} />
      <path d="M-8.4 -3 A10 9.4 0 0 1 -1 -9.6" stroke="#fffbe0" strokeOpacity={0.55} strokeWidth={1.3} fill="none" strokeLinecap="round" filter="url(#f-soft)" />
    </g>
  );
  /** 体の 前に そえた 小さな 手（体の 輪郭の 内側。下に やわらかい 影） */
  const hand = (x: number, y: number, rot: number) => (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <ellipse cx={x + 1} cy={y + 2} rx={4.6} ry={5.8} fill="#8a4a00" opacity={0.25} filter="url(#f-soft)" />
      <ellipse cx={x} cy={y} rx={4.4} ry={5.8} fill="url(#g-volt)" />
      <ellipse cx={x} cy={y} rx={4.4} ry={5.8} fill="url(#shade-sphere)" opacity={0.5} />
      <path d={`M${x - 1.4} ${y + 4.4} l0 1.2 M${x + 1.4} ${y + 4.4} l0 1.2`} stroke="#b86e00" strokeOpacity={0.5} strokeWidth={0.6} strokeLinecap="round" />
    </g>
  );
  return (
    <g>
      {/* くるくるの 電気の ばねの しっぽ（体の 右下の うしろから 生え、先に 光る 玉） */}
      <g filter="url(#f-bloom-volt)">
        <path d="M74 78 C84 80 90 74 86 68 C82 62 74 68 80 72 C88 77 96 68 92 60 C88 52 80 58 86 62 C92 66 98 58 96 50" stroke="#0d5b80" strokeWidth={4.6} fill="none" strokeLinecap="round" />
        <path d="M74 78 C84 80 90 74 86 68 C82 62 74 68 80 72 C88 77 96 68 92 60 C88 52 80 58 86 62 C92 66 98 58 96 50" stroke="url(#g-sky)" strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d="M75 77 C83 78.6 88 74 85.4 69 M80.6 71.4 C87 75 94 68 91.2 61" stroke="#eafcff" strokeOpacity={0.7} strokeWidth={0.9} fill="none" strokeLinecap="round" />
        <circle cx={96} cy={48} r={4} fill="url(#g-sky)" />
        <circle cx={96} cy={48} r={4} fill="url(#shade-sphere)" opacity={0.6} />
        <circle cx={94.8} cy={46.8} r={1.2} fill="#fff" opacity={0.9} />
      </g>
      {/* アンテナと星 */}
      <path d="M50 27 Q50 12 60 12 Q66 12 64 18 Q62 22 58 19" stroke="#0e5e88" strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M49.4 26 Q49.4 12.6 60 12.4 Q65 12.6 63.6 17" stroke="#9fe6ff" strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.8} />
      <g filter="url(#f-bloom-volt)">
        <path d="M64 4 l2.6 5.4 5.9 .8 -4.3 4.1 1 5.8 -5.2 -2.8 -5.2 2.8 1 -5.8 -4.3 -4.1 5.9 -.8z" fill="#fff7a8" stroke="#e8a400" strokeWidth={0.9} strokeLinejoin="round" />
        <path d="M64 6.6 l1.5 3.2 -3 .4 z" fill="#fff" opacity={0.8} />
      </g>
      {/* 耳（しずく形・先が 空色） */}
      {ear(27, -18)}
      {ear(73, 18)}
      {/* 足（体の 下から のぞく。足の うらの 影と 指の すじ） */}
      {[38, 62].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={88.6} rx={8.2} ry={4.6} fill="url(#g-volt)" />
          <ellipse cx={x} cy={88.6} rx={8.2} ry={4.6} fill="url(#shade-sphere)" opacity={0.55} />
          <path d={`M${x - 2.4} 90.6 l0 1.6 M${x + 2.4} 90.6 l0 1.6`} stroke="#b86e00" strokeOpacity={0.55} strokeWidth={0.7} strokeLinecap="round" />
        </g>
      ))}
      {/* ボディ（ベルベットのような やわらかい 毛なみ: かたい 白い 反射の 線は 使わず、ぼかした つやと ふちの 産毛） */}
      <circle cx="50" cy="58" r="32" fill="url(#g-volt)" />
      <circle cx="50" cy="58" r="32" fill="url(#skin-sss)" opacity={0.55} />
      <circle cx="50" cy="58" r="32" fill="url(#shade-sphere)" opacity={0.38} />
      {/* おなか（ふちを ぼかして 毛なみに とけこませる） */}
      <ellipse cx="50" cy="76" rx="17.5" ry="13" fill="url(#g-volt-belly)" opacity={0.7} filter="url(#f-soft)" />
      <path d="M35 75 C35 66.5 42 63.5 50 64.5 C58 63.5 65 66.5 65 75 C65 84 58 88.5 50 88.5 C42 88.5 35 84 35 75 Z" fill="url(#g-volt-belly)" />
      <path d="M35 75 C35 66.5 42 63.5 50 64.5 C58 63.5 65 66.5 65 75 C65 84 58 88.5 50 88.5 C42 88.5 35 84 35 75 Z" fill="url(#shade-sphere)" opacity={0.22} />
      <circle cx="50" cy="58" r="32" fill="url(#rim-cool)" />
      <circle cx="50" cy="58" r="31.4" fill="none" stroke="#fff6c0" strokeOpacity={0.4} strokeWidth={1.4} filter="url(#f-soft)" />
      <ellipse cx="39" cy="40" rx="11" ry="6.5" fill="#fff" opacity={0.42} transform="rotate(-32 39 40)" filter="url(#f-soft)" />
      <ellipse cx="36.5" cy="37.5" rx="3.6" ry="2" fill="#fff" opacity={0.7} transform="rotate(-32 36.5 37.5)" filter="url(#f-soft)" />
      {/* アンテナの 根もと */}
      <ellipse cx={50} cy={27} rx={3} ry={1.6} fill="#0e5e88" />
      {/* 手（きぶんで 位置が かわる。よろこぶと ばんざい） */}
      {happyUp ? (<>{hand(22, 46, 28)}{hand(78, 46, -28)}</>) : (<>{hand(25, 69, 24)}{hand(75, 69, -24)}</>)}
      {/* まゆ（よろこび・しんぱいの 気もちが 伝わるように） */}
      {happyUp && <path d="M33 42.6 Q38 39 43 41.6 M57 41.6 Q62 39 67 42.6" stroke="#a85e00" strokeOpacity={0.75} strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      {mood === "worried" && <path d="M33 43.6 Q38 43 43 40 M67 43.6 Q62 43 57 40" stroke="#a85e00" strokeOpacity={0.75} strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      <MascotEye x={38} y={52} closed={mood === "sleepy"} />
      <MascotEye x={62} y={52} closed={mood === "sleepy"} />
      {/* ほっぺ（赤みの ぼかし＋小さく 光る 星） */}
      {[30, 70].map((x) => <ellipse key={`b${x}`} cx={x} cy={63} rx={6.4} ry={3.8} fill="url(#blush)" />)}
      <g filter="url(#f-bloom-gold)">
        {[30, 70].map((x) => (
          <path key={x} d="M0 -4.5 l1.3 3 3.2 .3 -2.4 2.1 .7 3.2 -2.8 -1.7 -2.8 1.7 .7 -3.2 -2.4 -2.1 3.2 -.3z" fill="#ff9a3d" transform={`translate(${x} 63) scale(0.8)`} />
        ))}
      </g>
      {mouth}
      {(mood === "excited" || mood === "cheer") && (
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
        <radialGradient id={`bg-${id}-${size}`} cx="40%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#fff3cf" stopOpacity=".55" />
          <stop offset="22%" stopColor={ring ?? "#3a7a6a"} stopOpacity=".95" />
          <stop offset="100%" stopColor="#081613" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="52" r="48" fill="#000" opacity={0.35} />
      <circle cx="50" cy="50" r="48" fill="url(#metal-gold)" />
      <circle cx="50" cy="50" r="44.5" fill="none" stroke="#3a2404" strokeWidth={1.5} />
      <circle cx="50" cy="50" r="42" fill={`url(#bg-${id}-${size})`} />
      {/* 人間の 3人は 少し 小さく・下げて、髪の 先が 枠で 切れないように */}
      <g clipPath={`url(#${clip})`}><g transform={id === "birimo" ? undefined : "translate(5 9) scale(0.9)"}><CharacterArt id={id} mood={mood} /></g></g>
      <circle cx="50" cy="50" r="42" fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={2} />
      <path d="M14 38 A40 40 0 0 1 50 10" stroke="#fff8d6" strokeWidth={2} fill="none" opacity={0.7} strokeLinecap="round" />
    </svg>
  );
}
