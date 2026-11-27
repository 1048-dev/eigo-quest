import { loadWorlds, lessonOf } from "../lib.mjs";
const m = loadWorlds();
const L = { 734: 2, 742: 2, 748: 4, 750: 4, 752: 3, 754: 5, 761: 5, 767: 5 };
for (const [n, i] of Object.entries(L)) {
  const s = lessonOf(m, Number(n)).teacher.segments[i];
  console.log(n, s.subtitleJa, "|", JSON.stringify(s.slide));
}
const t = lessonOf(m, 737).teacherScript;
const k = t.indexOf("Or, ");
console.log(t.slice(k - 100, k + 80));
