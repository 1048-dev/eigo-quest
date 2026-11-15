/**
 * 開発用: キャラクターの立ち絵と顔を1枚のHTMLに並べて確認する。
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/render-characters-preview.tsx > chars.html
 */
import { renderToStaticMarkup } from "react-dom/server";
import { ArtDefs } from "../src/components/art/ArtDefs";
import { StandingFigure } from "../src/components/characters/StandingArt";
import { Portrait } from "../src/components/characters/CharacterArt";

const ids = ["haru", "riko", "kiko", "birimo"] as const;
const poses = ["idle", "wave", "point", "cheer"] as const;
const html = renderToStaticMarkup(
  <div style={{ background: "#0b1a1a", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
    <ArtDefs />
    {ids.map((id) => (
      <div key={id} style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
        <Portrait id={id} size={120} />
        {poses.map((p) => <StandingFigure key={p} id={id} pose={p} height={260} />)}
      </div>
    ))}
  </div>,
);
process.stdout.write(`<!doctype html><meta charset="utf-8"><body style="margin:0">${html}</body>`);
