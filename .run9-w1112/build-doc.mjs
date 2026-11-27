// docs/run9/changes/W11-12.md = head.md + notes/*.md + change table
import fs from "node:fs";
import path from "node:path";
import { REPO } from "./lib.mjs";
const d = path.join(REPO, ".run9-w1112");
const parts = [fs.readFileSync(path.join(d, "head.md"), "utf8")];
for (const f of fs.readdirSync(path.join(d, "notes")).sort()) parts.push(fs.readFileSync(path.join(d, "notes", f), "utf8").replace(/^#+ /, "### "));
parts.push("## 変更一覧（before → after）\n\n" + fs.readFileSync(path.join(d, "table.md"), "utf8"));
fs.writeFileSync(path.join(REPO, "docs/run9/changes/W11-12.md"), parts.join("\n"));
console.log("ok");
