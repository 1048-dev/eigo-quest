/**
 * run8 P9: できあがった 先生の 動画を レッスンに つなぐ（content/teacher-videos.json を 書きかえる）。
 * 動画は さきに ストレージ（CDN など）に アップロードしておく。字幕は 動画と 同じ 名前の .vtt を となりに おく
 * （lesson-0001.mp4 → lesson-0001.vtt。exports/teacher/0001/subtitles.vtt を その 名前に して アップロード）。
 *
 *   npx tsx scripts/teacher-link.ts link 12 https://cdn.example.com/teacher/lesson-0012.mp4
 *   npx tsx scripts/teacher-link.ts link-range --from 1 --to 30 --pattern "https://cdn.example.com/teacher/lesson-{nnnn}.mp4"
 *   npx tsx scripts/teacher-link.ts unlink 12          （--from/--to で まとめても よい）
 *   npx tsx scripts/teacher-link.ts list
 *   npx tsx scripts/teacher-link.ts check [--head]    … マニフェストの チェック（--head で URL に HEAD を おくって ある か たしかめる。1 本 10 秒まで）
 *   オプション: --dry（書かずに 表示だけ）/ --note "メモ" / --provider manual
 *   （npm run teacher:link -- list）
 *
 * つないだ あとは アプリを デプロイしなおすと そのレッスンの「せんせい」が 本物の 動画に なる（なければ バーチャル先生）。
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import indexRaw from "../content/curriculum/index.json";
import { linkedLessonNos, urlFromPattern, validateManifest, withVideo, withoutVideo, type TeacherVideoManifest } from "../src/lib/teacherVideo/manifest";
import { vttUrlFor } from "../src/lib/teacher/media";
import { installDeadline } from "./lib/checkKit";

const FILE = path.join(process.cwd(), "content", "teacher-videos.json");
const TOTAL = (indexRaw as { totalLessons: number }).totalLessons;

const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (name: string) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const VALUE_FLAGS = new Set(["--from", "--to", "--pattern", "--note", "--provider"]);
const positional: string[] = [];
for (let i = 1; i < argv.length; i++) {
  if (VALUE_FLAGS.has(argv[i])) i++;
  else if (!argv[i].startsWith("--")) positional.push(argv[i]);
}
const dry = argv.includes("--dry");
const provider = opt("--provider") ?? "manual";
const note = opt("--note");

function usage(): never {
  console.error("usage: tsx scripts/teacher-link.ts <link N URL | link-range --from N --to N --pattern URL | unlink N | list | check [--head]> [--dry]");
  process.exit(1);
}
function lessonNo(v: string | undefined): number {
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > TOTAL) {
    console.error(`lesson number must be 1-${TOTAL}: ${v}`);
    process.exit(1);
  }
  return n;
}
function load(): TeacherVideoManifest {
  return JSON.parse(readFileSync(FILE, "utf8")) as TeacherVideoManifest;
}
function save(m: TeacherVideoManifest, msg: string) {
  const errors = validateManifest(m, TOTAL);
  if (errors.length) {
    console.error("✖ manifest has errors (not written):\n  " + errors.join("\n  "));
    process.exit(1);
  }
  if (dry) {
    console.log(`(dry) ${msg}`);
    return;
  }
  writeFileSync(FILE, JSON.stringify(m, null, 2) + "\n", "utf8");
  console.log(`✔ ${msg} → ${path.relative(process.cwd(), FILE)}`);
}
function range(): number[] {
  const a = lessonNo(opt("--from"));
  const b = lessonNo(opt("--to") ?? opt("--from"));
  if (b < a) usage();
  return Array.from({ length: b - a + 1 }, (_, i) => a + i);
}

async function head(url: string): Promise<string> {
  if (url.startsWith("/")) return "local path (served from public/; check after deploy)";
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 10_000);
  try {
    const r = await fetch(url, { method: "HEAD", signal: ctl.signal });
    return r.ok ? `OK ${r.status}` : `NG ${r.status}`;
  } catch (e) {
    return `NG ${(e as Error).name === "AbortError" ? "timeout" : (e as Error).message}`;
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  installDeadline(argv.includes("--head") ? 600 : 60);
  let m = load();
  switch (cmd) {
    case "link": {
      const n = lessonNo(positional[0]);
      const url = positional[1];
      if (!url) usage();
      m = withVideo(m, n, url, { provider, note });
      save(m, `L${n} → ${url}`);
      break;
    }
    case "link-range": {
      const pattern = opt("--pattern");
      if (!pattern || !/\{n(nnn)?\}/.test(pattern)) {
        console.error('--pattern must contain {n} or {nnnn}, e.g. "https://cdn.example.com/teacher/lesson-{nnnn}.mp4"');
        process.exit(1);
      }
      const ns = range();
      for (const n of ns) m = withVideo(m, n, urlFromPattern(pattern, n), { provider, note });
      save(m, `L${ns[0]}-${ns[ns.length - 1]} (${ns.length}) → ${pattern}`);
      break;
    }
    case "unlink": {
      const ns = positional[0] ? [lessonNo(positional[0])] : range();
      for (const n of ns) m = withoutVideo(m, n);
      save(m, `unlinked ${ns.length === 1 ? `L${ns[0]}` : `L${ns[0]}-${ns[ns.length - 1]}`}`);
      break;
    }
    case "list": {
      const ns = linkedLessonNos(m);
      console.log(`${ns.length} / ${TOTAL} lessons have a video`);
      for (const n of ns) {
        const e = m.videos[String(n)];
        console.log(`  L${n}\t${e.url}\t(${e.provider}, ${e.linkedAt.slice(0, 10)}${e.note ? `, ${e.note}` : ""})`);
      }
      break;
    }
    case "check": {
      const errors = validateManifest(m, TOTAL);
      if (errors.length) {
        console.error("✖ " + errors.join("\n✖ "));
        process.exit(1);
      }
      const ns = linkedLessonNos(m);
      console.log(`✔ manifest OK (${ns.length} videos)`);
      if (argv.includes("--head")) {
        let bad = 0;
        for (const [i, n] of ns.entries()) {
          const url = m.videos[String(n)].url;
          const v = await head(url);
          const vtt = vttUrlFor(url);
          const s = vtt ? await head(vtt) : "none";
          if (v.startsWith("NG")) bad++;
          console.log(`  [${i + 1}/${ns.length}] L${n} video ${v} · subtitles ${s}`);
        }
        if (bad) {
          console.error(`✖ ${bad} videos not reachable`);
          process.exit(1);
        }
      }
      break;
    }
    default:
      usage();
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("✖", (e as Error).message);
  process.exit(1);
});
