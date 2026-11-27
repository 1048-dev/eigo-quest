/**
 * run10 Phase 4: テスト用の 時計（npm run check:e2e だけが つかう。アプリの コードには 入らない）。
 *
 *   NODE_OPTIONS="--require scripts/e2e/clock-preload.cjs" E2E_CLOCK_FILE=.tmp/e2e/clock.json next start
 *
 * E2E_CLOCK_FILE の JSON {"offsetMs": 86400000} を 読んで、サーバーの Date（new Date()・Date.now()）を その ぶん すすめる。
 * ファイルは 200ms ごとに 読みなおすので、サーバーを とめずに「つぎの 日」へ タイムトラベル できる。
 * E2E_CLOCK_FILE が なければ なにもしない。
 */
"use strict";
const file = process.env.E2E_CLOCK_FILE;
if (file) {
  const fs = require("node:fs");
  const RealDate = Date;
  const realNow = RealDate.now.bind(RealDate);
  const perf = typeof performance !== "undefined" ? performance : { now: () => realNow() };
  let offset = 0;
  let readAt = -Infinity;
  const off = () => {
    const t = perf.now();
    if (t - readAt > 200) {
      readAt = t;
      try {
        const v = Number(JSON.parse(fs.readFileSync(file, "utf8")).offsetMs);
        offset = Number.isFinite(v) ? v : 0;
      } catch {
        offset = 0;
      }
    }
    return offset;
  };
  function FakeDate(...args) {
    if (!new.target) return new RealDate(realNow() + off()).toString();
    if (args.length === 0) return Reflect.construct(RealDate, [realNow() + off()], new.target);
    return Reflect.construct(RealDate, args, new.target);
  }
  FakeDate.prototype = RealDate.prototype;
  Object.setPrototypeOf(FakeDate, RealDate);
  FakeDate.now = () => realNow() + off();
  FakeDate.parse = RealDate.parse;
  FakeDate.UTC = RealDate.UTC;
  globalThis.Date = FakeDate;
}
