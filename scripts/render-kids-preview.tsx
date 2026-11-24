/**
 * 開発用: ハル・リコ・キコ（全ポーズ＋ポートレート）だけを 1枚の HTML に並べて、Playwright で PNG（2倍）に保存する。
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/render-kids-preview.tsx <出力名>
 *   → docs/night2/screens/<出力名>.png（全体）と <出力名>-faces.png（顔の拡大）
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";
import { ArtDefs } from "../src/components/art/ArtDefs";
import { Standing, StandingFigure } from "../src/components/characters/StandingArt";
import { Portrait } from "../src/components/characters/CharacterArt";

const name = process.argv[2] ?? "kids-preview";
const OUT = path.resolve(__dirname, "../docs/night2/screens");
const ids = ["haru", "riko", "kiko"] as const;
const poses = ["idle", "wave", "point", "cheer"] as const;
const label = { color: "#f2c46a", font: "bold 14px sans-serif", margin: "4px 0 0" } as const;

const html = renderToStaticMarkup(
  <div style={{ background: "#16302c", padding: 16, display: "flex", flexDirection: "column", gap: 10, width: 1180 }}>
    <ArtDefs />
    <div id="all" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={label}>身長くらべ</p>
      <svg viewBox="0 0 300 175" width={600} height={350} overflow="visible">
        <g filter="url(#f-rim)">
          <g transform="translate(0 0)"><Standing id="haru" pose="idle" /></g>
          <g transform="translate(100 13.3) scale(0.92)"><Standing id="riko" pose="idle" /></g>
          <g transform="translate(195 19.9) scale(0.88)"><Standing id="kiko" pose="idle" /></g>
        </g>
      </svg>
      {ids.map((id) => (
        <div key={id} style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
          <Portrait id={id} size={150} />
          {poses.map((p) => <StandingFigure key={p} id={id} pose={p} height={300} />)}
          <StandingFigure id={id} pose="wave" height={300} flip />
        </div>
      ))}
    </div>
    <div id="faces" style={{ display: "flex", gap: 14 }}>
      {ids.map((id) => <Portrait key={id} id={id} size={380} />)}
    </div>
    <div id="bodies" style={{ display: "flex", gap: 14 }}>
      {ids.map((id) => <StandingFigure key={id} id={id} pose="wave" height={640} />)}
    </div>
  </div>,
);

async function main() {
  mkdirSync(OUT, { recursive: true });
  const file = path.join(tmpdir(), `eigo-${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#16302c">${html}</body>`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1220, height: 900 } });
  await page.goto(`file:///${file.replace(/\\/g, "/")}`);
  await page.locator("#all").screenshot({ path: path.join(OUT, `${name}.png`) });
  await page.locator("#faces").screenshot({ path: path.join(OUT, `${name}-faces.png`) });
  await page.locator("#bodies").screenshot({ path: path.join(OUT, `${name}-bodies.png`) });
  await browser.close();
  console.log("saved", name);
}
main().catch((e) => { console.error(e); process.exit(1); });
