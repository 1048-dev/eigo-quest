import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src"), "@content": path.resolve(__dirname, "content") } },
  esbuild: { jsx: "automatic" },
  // 1,200 レッスンを ぜんぶ 見る テストが あるので、いそがしい マシンでも 既定の 5 秒で 落ちない ように 30 秒
  test: { include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"], testTimeout: 30_000 },
});
