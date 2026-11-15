/**
 * 開発用: 100体のモンスターを1枚のHTMLに並べて確認する。
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/render-monsters-preview.tsx > preview.html
 */
import { renderToStaticMarkup } from "react-dom/server";
import { ArtDefs } from "../src/components/art/ArtDefs";
import { MonsterFigure } from "../src/components/characters/MonsterArt";
import { MONSTERS, RARITY_STYLE } from "../src/lib/game/monsters";

const body = renderToStaticMarkup(
  <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 120px)", gap: 8, background: "#0b1a1a", padding: 12 }}>
    <ArtDefs />
    {MONSTERS.map((m) => (
      <div key={m.id} style={{ color: "#f7ecd4", font: "10px sans-serif", textAlign: "center" }}>
        <MonsterFigure id={m.id} size={110} />
        <div>{m.no}. {m.nameJa}</div>
        <div style={{ opacity: 0.7 }}>{RARITY_STYLE[m.rarity].frameJa}</div>
      </div>
    ))}
  </div>,
);
process.stdout.write(`<!doctype html><meta charset="utf-8"><body style="margin:0;background:#0b1a1a">${body}</body>`);
