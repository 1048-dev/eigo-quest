// Structural fix that a string patch cannot do: L239 phonics.sounds lacks /ʊ/ for cookbook (was football: same gap)
import { loadWorlds, saveWorlds, lessonOf } from "./lib.mjs";
const m = loadWorlds();
const l = lessonOf(m, 239);
if (!l.phonics.sounds.includes("/ʊ/")) {
  l.phonics.sounds.splice(l.phonics.sounds.indexOf("/uː/") + 1, 0, "/ʊ/");
  saveWorlds(m);
}
console.log(l.phonics.sounds);
