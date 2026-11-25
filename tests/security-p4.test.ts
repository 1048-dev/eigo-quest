/**
 * run5 Phase 4 のセキュリティの見直しで直したところ。
 *  - 画面の共通ヘッダー（iframe に入れさせない・nosniff・Referer）と、メールのリンクで開く画面の no-referrer
 *  - 本物の DB で確かめるスクリプトは ぜんぶ 時間制限つき・サーバーの標準出力を 読まないまま パイプにしない
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

type Rule = { source: string; headers: { key: string; value: string }[] };

/** Next.js と同じく、あとに書いた ルールが 同じキーを上書きする */
function headersFor(rules: Rule[], pathname: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of rules) {
    const re = new RegExp(`^${r.source.replace("/(.*)", "/.*")}$`);
    if (!re.test(pathname)) continue;
    for (const h of r.headers) out[h.key.toLowerCase()] = h.value;
  }
  return out;
}

describe("画面の共通ヘッダー", () => {
  it("どの画面も iframe に入れさせない・nosniff・外へは origin だけ", async () => {
    const rules = (await nextConfig.headers!()) as Rule[];
    for (const p of ["/", "/parent", "/login", "/map"]) {
      const h = headersFor(rules, p);
      expect(h["x-frame-options"]).toBe("DENY");
      expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["permissions-policy"]).toBe("microphone=(self)");
    }
  });

  it("メールのリンク（?token=）で開く画面は Referer を送らない・検索よけ", async () => {
    const rules = (await nextConfig.headers!()) as Rule[];
    for (const p of ["/reset-password", "/verify-email"]) {
      const h = headersFor(rules, p);
      expect(h["referrer-policy"]).toBe("no-referrer");
      expect(h["x-robots-tag"]).toContain("noindex");
      expect(h["x-frame-options"]).toBe("DENY");
    }
  });
});

describe("S3_ENDPOINT は https だけ（http は 同じパソコンの中だけ）", () => {
  const base = { STORAGE_DRIVER: "s3", S3_BUCKET: "b", S3_ACCESS_KEY_ID: "k", S3_SECRET_ACCESS_KEY: "s" };
  it.each([
    ["https://acct.r2.cloudflarestorage.com", true],
    ["https://ref.supabase.co/storage/v1/s3", true],
    ["http://localhost:9000", true],
    ["http://127.0.0.1:9000", true],
    ["http://[::1]:9000", true],
    ["http://minio.example.com", false],
    ["http://10.0.0.5:9000", false],
    ["https://user:pass@acct.r2.cloudflarestorage.com", false],
    ["ftp://example.com", false],
    ["not a url", false],
  ])("%s → %s", async (endpoint, ok) => {
    const { isAllowedEndpoint, storageConfig } = await import("../src/lib/storage");
    expect(isAllowedEndpoint(endpoint)).toBe(ok);
    expect(storageConfig({ ...base, S3_ENDPOINT: endpoint }).missing.includes("S3_ENDPOINT")).toBe(!ok);
  });
});

describe("確かめるスクリプトの時間制限", () => {
  const dir = path.resolve(__dirname, "../scripts");
  const checks = readdirSync(dir).filter((f) => /-check\.ts$/.test(f));

  it("本物の DB で確かめるスクリプトが ある", () => {
    expect(checks).toEqual(expect.arrayContaining(["run4-flow-check.ts", "run5-flow-check.ts", "reset-db-check.ts", "carry-db-check.ts"]));
  });

  it.each(checks)("%s: ぜんたいの時間制限・コマンドの時間制限・パイプを読まない stdout なし", (f) => {
    const src = readFileSync(path.join(dir, f), "utf8");
    expect(/installDeadline\(|TIMEOUT_SEC \* 1000/.test(src)).toBe(true);
    // spawnSync はぜんぶ timeout つき（ checkKit の run() を使うか、自分で timeout: を書く）
    for (const m of src.matchAll(/spawnSync\((?!"taskkill")[^;]*?\);/gs)) expect(m[0]).toMatch(/timeout:/);
    expect(src).not.toMatch(/stdio:\s*\["ignore",\s*"pipe"/);
    // prisma migrate は DIRECT_URL を使う（run5 Phase 3）。渡さないと .env の DIRECT_URL（ふだんの DB）に migrate してしまう
    if (src.includes('"migrate", "deploy"')) expect(src).toMatch(/DIRECT_URL\s*[:=]\s*DB/);
  });
});
