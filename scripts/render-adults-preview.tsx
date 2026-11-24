/**
 * 開発用: エマ先生・ビリモ・ヒーロー場面（6種）・画面の背景 を 1枚ずつ PNG（2倍）に保存する。
 *   npx tsx --tsconfig scripts/tsconfig.json scripts/render-adults-preview.tsx <出力名>
 *   → docs/night2/screens/<出力名>-emma.png / -birimo.png / -hero.png / -backdrop.png
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "playwright";
import { ArtDefs } from "../src/components/art/ArtDefs";
import { TeacherArt } from "../src/components/characters/TeacherArt";
import { BirimoArt, Portrait } from "../src/components/characters/CharacterArt";
import { StandingFigure } from "../src/components/characters/StandingArt";
import { HeroScene, type HeroVariant } from "../src/components/scene/HeroScene";
import { FieldBackdrop } from "../src/components/scene/FieldBackdrop";

const name = process.argv[2] ?? "adults-preview";
const OUT = path.resolve(__dirname, "../docs/night2/screens");
const label = { color: "#f2c46a", font: "bold 14px sans-serif", margin: "4px 0 0" } as const;
const moods = ["happy", "excited", "cheer", "sleepy", "worried"] as const;
const variants: HeroVariant[] = ["map", "dashboard", "arena", "gacha", "ranking", "lesson"];
const lessonBg = "radial-gradient(120% 90% at 50% 10%, #f2c46a 0%, #1d4a52 55%, #0b1f2e 100%)";

const html = renderToStaticMarkup(
  <div style={{ background: "#16302c", padding: 16, width: 1180 }}>
    <ArtDefs />
    <div id="emma" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={label}>エマ先生（ふだん／話している）— レッスン画面の 大きさ と 拡大</p>
      <div style={{ display: "flex", gap: 14 }}>
        {[false, true].map((t) => (
          <div key={String(t)} style={{ background: lessonBg, width: 380, height: 214, display: "grid", placeItems: "center", borderRadius: 12 }}>
            <svg viewBox="0 0 200 200" height={208} overflow="visible"><g filter="url(#f-rim)"><TeacherArt talking={t} /></g></svg>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        {[false, true].map((t) => (
          <div key={String(t)} style={{ background: lessonBg, borderRadius: 12 }}>
            <svg viewBox="0 0 200 200" width={560} height={560} overflow="visible"><g filter="url(#f-rim)"><TeacherArt talking={t} /></g></svg>
          </div>
        ))}
      </div>
    </div>
    <div id="birimo" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={label}>ビリモ（5つの きぶん・ポートレート・立ち絵・ふきだしの 大きさ）</p>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        {moods.map((m) => <svg key={m} viewBox="0 0 100 100" width={210} height={210} overflow="visible"><BirimoArt mood={m} /></svg>)}
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
        <Portrait id="birimo" size={150} />
        <Portrait id="birimo" size={56} />
        <StandingFigure id="birimo" height={300} />
        <StandingFigure id="birimo" mood="excited" height={300} />
        <svg viewBox="0 0 100 100" width={64} height={64}><BirimoArt mood="happy" /></svg>
        <svg viewBox="0 0 100 100" width={480} height={480} overflow="visible"><BirimoArt mood="happy" /></svg>
      </div>
    </div>
    <div id="hero" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {variants.map((v) => (
        <div key={v} style={{ position: "relative" }}>
          <HeroScene title={v} variant={v} />
        </div>
      ))}
    </div>
  </div>,
);

const backdrop = renderToStaticMarkup(<div><ArtDefs /><FieldBackdrop /></div>);

const css = `
  .hero-frame{border:3px solid #b8862a;border-radius:18px;overflow:hidden;position:relative}
  .hero-frame>svg{display:block;width:100%}
  .absolute{position:absolute}.inset-x-0{left:0;right:0}.top-3{top:12px}.flex{display:flex}.justify-center{justify-content:center}
  .title-plate{border:2px solid #b8862a;border-radius:16px;background:rgba(6,16,18,.85);padding:6px 22px;color:#ffe29a;font:900 18px sans-serif}
  .pointer-events-none{pointer-events:none}.fixed{position:fixed}.inset-0{inset:0}.overflow-hidden{overflow:hidden}.h-full{height:100%}.w-full{width:100%}
  .hidden{display:none}
  @media (min-width:1024px){.lg\\:flex{display:flex}}
  .inset-y-0{top:0;bottom:0}.left-0{left:0}.right-0{right:0}.items-end{align-items:flex-end}.gap-2{gap:8px}.pb-28{padding-bottom:112px}
  .w-\\[calc\\(\\(100vw-48rem\\)\\/2\\)\\]{width:calc((100vw - 48rem)/2)}.top-28{top:112px}.top-40{top:160px}.opacity-80{opacity:.8}.blur-\\[1\\.5px\\]{filter:blur(1.5px)}
`;

async function main() {
  mkdirSync(OUT, { recursive: true });
  const file = path.join(tmpdir(), `eigo-${name}.html`);
  writeFileSync(file, `<!doctype html><meta charset="utf-8"><style>${css}</style><body style="margin:0;background:#16302c">${html}</body>`);
  const file2 = path.join(tmpdir(), `eigo-${name}-bd.html`);
  writeFileSync(file2, `<!doctype html><meta charset="utf-8"><style>${css}</style><body style="margin:0;background:#06121a">${backdrop}<div style="position:absolute;left:50%;top:0;bottom:0;width:48rem;transform:translateX(-50%);background:rgba(8,20,22,.35);border-left:1px solid #b8862a55;border-right:1px solid #b8862a55"></div></body>`);
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1220, height: 900 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`file:///${file.replace(/\\/g, "/")}`);
  for (const id of ["emma", "birimo", "hero"]) await page.locator(`#${id}`).screenshot({ path: path.join(OUT, `${name}-${id}.png`) });
  const p2 = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: 1440, height: 900 } });
  await p2.goto(`file:///${file2.replace(/\\/g, "/")}`);
  await p2.screenshot({ path: path.join(OUT, `${name}-backdrop.png`) });
  await browser.close();
  console.log("saved", name);
}
main().catch((e) => { console.error(e); process.exit(1); });
