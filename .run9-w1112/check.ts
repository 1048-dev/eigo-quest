// Dry-run check of one or more patch files on top of the CURRENT world files (which already contain 00/01 patches).
// npx tsx .run9-w1112/check.ts .run9-w1112/patches/10-L121-130.json
import fs from "node:fs";
import path from "node:path";
import { englishShare, immersionFor, scriptMs, unknownSlideItems, TEACHER_MAX_MS, TEACHER_MIN_MS } from "../src/lib/teacher/timing";

const ROOT = path.resolve(__dirname, "..");
const worlds = new Map<number, any>();
for (const w of [11, 12]) worlds.set(w, JSON.parse(fs.readFileSync(path.join(ROOT, `content/curriculum/worlds/world-${w}.json`), "utf8")));
const lessonOf = (n: number) => worlds.get(n <= 330 ? 11 : 12).lessons.find((l: any) => l.lessonNo === n);
const tok = (p: string) => p.split(".").flatMap((part) => [...part.matchAll(/^([^[]+)|\[(\d+)\]/g)].map((m) => (m[1] !== undefined ? m[1] : Number(m[2]))));
const get = (o: any, p: string) => tok(p).reduce((a, t) => (a == null ? a : a[t]), o);
const set = (o: any, p: string, v: string) => { const t = tok(p); const last = t.pop()!; t.reduce((a, k) => a[k], o)[last] = v; };

let bad = 0;
const touched = new Set<number>();
for (const f of process.argv.slice(2)) {
  const ps = JSON.parse(fs.readFileSync(f, "utf8"));
  for (const p of ps) {
    for (const k of ["lesson", "path", "before", "after", "reviewers", "reason"]) if (p[k] === undefined) { console.log(`FIELD ${k} missing`, p); bad++; }
    const l = lessonOf(p.lesson);
    const cur = get(l, p.path);
    if (typeof cur !== "string") { console.log(`NOPATH L${p.lesson} ${p.path}`); bad++; continue; }
    if (cur !== p.before) { console.log(`MISMATCH L${p.lesson} ${p.path}\n  cur ${JSON.stringify(cur)}\n  bef ${JSON.stringify(p.before)}`); bad++; continue; }
    if (p.before === p.after) { console.log(`NOOP L${p.lesson} ${p.path}`); bad++; continue; }
    set(l, p.path, p.after);
    touched.add(p.lesson);
  }
}
for (const n of [...touched].sort((a, b) => a - b)) {
  const l = lessonOf(n);
  const u = unknownSlideItems(l);
  const ms = scriptMs(l.teacher);
  const sh = englishShare(l.teacher);
  const band = immersionFor(l.world);
  const notes: string[] = [];
  if (u.length) notes.push(`slide items not in lesson: ${u.join(" | ")}`);
  if (ms < TEACHER_MIN_MS || ms > TEACHER_MAX_MS) notes.push(`length ${(ms / 1000).toFixed(0)}s out of 180-240`);
  if (sh < band.minEnglishShare || sh > band.maxEnglishShare) notes.push(`english share ${(sh * 100).toFixed(0)}% out of band`);
  if (notes.length) bad++;
  console.log(`L${n}: ${(ms / 1000).toFixed(0)}s EN ${(sh * 100).toFixed(0)}% ${notes.length ? "NG " + notes.join("; ") : "OK"}`);
}
console.log(bad ? `PROBLEMS: ${bad}` : "ALL OK");
