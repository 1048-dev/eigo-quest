/**
 * 開発用: キャラクター・エマ先生・モンスターを1枚のHTMLに並べて確認する（ブラウザで開くだけ）。
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/render-characters-preview.tsx > docs/night/screens/characters-preview.html
 */
import { renderToStaticMarkup } from "react-dom/server";
import { ArtDefs } from "../src/components/art/ArtDefs";
import { Standing, StandingFigure } from "../src/components/characters/StandingArt";
import { Portrait } from "../src/components/characters/CharacterArt";
import { TeacherArt } from "../src/components/characters/TeacherArt";
import { MonsterFigure } from "../src/components/characters/MonsterArt";
import { MONSTERS } from "../src/lib/game/monsters";

const ids = ["haru", "riko", "kiko", "birimo"] as const;
const poses = ["idle", "wave", "point", "cheer"] as const;
const label = { color: "#f2c46a", font: "bold 14px sans-serif", margin: "8px 0 0" } as const;
const html = renderToStaticMarkup(
  <div style={{ background: "#0b1a1a", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
    <ArtDefs />
    <p style={label}>身長くらべ（ハル10歳・リコ8歳・キコ7歳／同じ縮尺）</p>
    <svg viewBox="0 0 330 175" width={660} height={350} overflow="visible">
      <g filter="url(#f-rim)">
        <g transform="translate(0 0)"><Standing id="haru" pose="idle" /></g>
        <g transform="translate(100 13.3) scale(0.92)"><Standing id="riko" pose="idle" /></g>
        <g transform="translate(195 19.9) scale(0.88)"><Standing id="kiko" pose="idle" /></g>
        <g transform="translate(270 66.4) scale(0.6)"><Standing id="birimo" mood="happy" /></g>
      </g>
    </svg>
    {ids.map((id) => (
      <div key={id} style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        <Portrait id={id} size={120} />
        {poses.map((p) => <StandingFigure key={p} id={id} pose={p} height={260} />)}
      </div>
    ))}
    <p style={label}>エマ先生（だまっている／話している）</p>
    <div style={{ display: "flex", gap: 16 }}>
      <svg viewBox="0 0 200 200" width={260} height={260} overflow="visible"><g filter="url(#f-rim)"><TeacherArt /></g></svg>
      <svg viewBox="0 0 200 200" width={260} height={260} overflow="visible"><g filter="url(#f-rim)"><TeacherArt talking /></g></svg>
    </div>
    <p style={label}>モンスター（全100体）</p>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {MONSTERS.map((m) => <MonsterFigure key={m.id} id={m.id} size={110} />)}
    </div>
  </div>,
);
process.stdout.write(`<!doctype html><meta charset="utf-8"><title>Eigo Quest characters preview</title><body style="margin:0;background:#0b1a1a">${html}</body>`);
