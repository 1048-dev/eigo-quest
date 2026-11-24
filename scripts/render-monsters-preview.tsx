/**
 * 開発用: 100体のモンスターと カードの額縁を PNG（2倍）に保存する。
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/render-monsters-preview.tsx <出力名>
 *   → docs/night2/screens/<出力名>-grid.png（100体の一覧）/ -cards.png（100枚のカード）/ -zoom.png（種族ごとの拡大）/ -frames.png（4つの額縁・大小・未入手）
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";
import { ArtDefs } from "../src/components/art/ArtDefs";
import { MonsterFigure } from "../src/components/characters/MonsterArt";
import { MonsterCard } from "../src/components/monsters/MonsterCard";
import { ARCHETYPES, MONSTERS, RARITY_STYLE, findMonster, monstersByRarity } from "../src/lib/game/monsters";

const name = process.argv[2] ?? "monsters-preview";
const OUT = path.resolve(__dirname, "../docs/night2/screens");
const label = { color: "#f2c46a", font: "bold 14px sans-serif", margin: "4px 0" } as const;
const tierColor: Record<string, string> = { COMMON: "#e8b48a", RARE: "#ffd96a", EPIC: "#dfe9ff", LEGENDARY: "#ff9cf0" };
const zoomIds = ARCHETYPES.map((a, i) => findMonster(a.id, (["flame", "tide", "thunder", "verdant", "radiant", "umbra", "frost", "terra", "gale", "crystal"] as const)[i]).id);
const oneOfEach = (["COMMON", "RARE", "EPIC", "LEGENDARY"] as const).map((r) => monstersByRarity(r)[0].id);

const html = renderToStaticMarkup(
  <div style={{ background: "#0b1a1a", padding: 16, width: 1380 }}>
    <ArtDefs />
    <div id="grid">
      <p style={label}>100体（たて＝種族 / よこ＝属性）</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 128px)", gap: 6 }}>
        {MONSTERS.map((m) => (
          <div key={m.id} style={{ color: "#f7ecd4", font: "10px sans-serif", textAlign: "center", background: "radial-gradient(circle at 50% 45%, #1d3a38, #0b1a1a 70%)", borderRadius: 8, padding: "4px 0" }}>
            <MonsterFigure id={m.id} size={112} />
            <div>{m.no}. {m.nameJa}</div>
            <div style={{ color: tierColor[m.rarity] }}>{RARITY_STYLE[m.rarity].frameJa}</div>
          </div>
        ))}
      </div>
    </div>
    <div id="cards" style={{ marginTop: 16 }}>
      <p style={label}>カード（md）100枚</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 124px)", gap: 8 }}>
        {MONSTERS.map((m) => <MonsterCard key={m.id} id={m.id} size="md" count={m.no % 3} />)}
      </div>
    </div>
    <div id="zoom" style={{ marginTop: 16 }}>
      <p style={label}>種族ごとの拡大（10種）</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 256px)", gap: 8 }}>
        {zoomIds.map((id) => (
          <div key={id} style={{ background: "radial-gradient(circle at 50% 45%, #1d3a38, #0b1a1a 70%)", borderRadius: 12 }}>
            <MonsterFigure id={id} size={256} />
          </div>
        ))}
      </div>
    </div>
    <div id="frames" style={{ marginTop: 16 }}>
      <p style={label}>4つの額縁（lg / md / sm / 未入手 / NEW）</p>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        {oneOfEach.map((id) => <div key={id} style={{ width: 250 }}><MonsterCard id={id} size="lg" /></div>)}
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 12 }}>
        {oneOfEach.map((id) => <div key={id} style={{ width: 124 }}><MonsterCard id={id} size="md" isNew count={3} /></div>)}
        {oneOfEach.map((id) => <div key={id + "s"} style={{ width: 110 }}><MonsterCard id={id} size="sm" /></div>)}
        {oneOfEach.map((id) => <div key={id + "u"} style={{ width: 124 }}><MonsterCard id={id} size="md" owned={false} /></div>)}
      </div>
    </div>
  </div>,
);

// 本物の globals.css（tailwind の @import だけ外す）＋ MonsterCard が使う最小限のユーティリティ
const globals = readFileSync(path.resolve(__dirname, "../src/app/globals.css"), "utf8").replace(/@import\s+"tailwindcss";/, "");
const util = `
  *{box-sizing:border-box} p{margin:0}
  .flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:space-between}.grid{display:grid}.grid-cols-3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .gap-1{gap:4px}.px-2{padding-left:8px;padding-right:8px}.pt-1\\.5{padding-top:6px}.pb-2{padding-bottom:8px}.mt-2{margin-top:8px}.text-center{text-align:center}
  .text-\\[10px\\]{font-size:10px}.text-\\[11px\\]{font-size:11px}.text-\\[12px\\]{font-size:12px}.text-lg{font-size:18px;line-height:28px}.leading-tight{line-height:1.25}
  .font-black{font-weight:900}.font-bold{font-weight:700}.text-\\[var\\(--ink-2\\)\\]{color:var(--ink-2)}
`;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const file = path.join(tmpdir(), `eigo-${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${globals}${util}</style><body style="margin:0;background:#0b1a1a">${html}</body>`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1420, height: 900 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`file:///${file.replace(/\\/g, "/")}`);
  for (const id of ["grid", "cards", "zoom", "frames"]) await page.locator(`#${id}`).screenshot({ path: path.join(OUT, `${name}-${id}.png`) });
  await browser.close();
  console.log("saved", name);
}
main().catch((e) => { console.error(e); process.exit(1); });
