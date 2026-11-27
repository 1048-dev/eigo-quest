import fs from "node:fs";
import path from "node:path";
export const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const wfile = (w) => path.join(REPO, `content/curriculum/worlds/world-${String(w).padStart(2, "0")}.json`);
export function loadWorlds(ws = [31, 32]) {
  const m = new Map();
  for (const w of ws) m.set(w, JSON.parse(fs.readFileSync(wfile(w), "utf8")));
  return m;
}
export function saveWorlds(m) {
  for (const [w, wf] of m) fs.writeFileSync(wfile(w), JSON.stringify(wf, null, 2) + "\n", "utf8");
}
export function lessonOf(m, n) {
  for (const wf of m.values()) {
    const l = wf.lessons.find((x) => x.lessonNo === n);
    if (l) return l;
  }
  throw new Error(`no lesson ${n}`);
}
function tokens(p) {
  const out = [];
  for (const part of p.split(".")) {
    const re = /^([^[]+)|\[(\d+)\]/g;
    let mm;
    while ((mm = re.exec(part))) out.push(mm[1] !== undefined ? mm[1] : Number(mm[2]));
  }
  return out;
}
export function getAt(obj, p) {
  let o = obj;
  for (const t of tokens(p)) {
    if (o == null) return undefined;
    o = o[t];
  }
  return o;
}
export function setAt(obj, p, v) {
  const ts = tokens(p);
  let o = obj;
  for (const t of ts.slice(0, -1)) o = o[t];
  o[ts.at(-1)] = v;
}
const SKIP = new Set(["emoji", "gesture", "kind", "lang", "rule", "world", "lessonNo", "reviewed"]);
export function strings(l) {
  const acc = [];
  const walk = (v, p) => {
    if (typeof v === "string") acc.push([p, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${p}[${i}]`));
    else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) walk(x, p ? `${p}.${k}` : k);
  };
  walk(l, "");
  return acc;
}
