import type { NextConfig } from "next";

/** 学習レポートの PDF に埋め込む日本語フォント（src/lib/report/pdf.ts が実行時に読む）。サーバーレスの関数に同梱する */
const REPORT_FONT_FILES = ["./assets/fonts/**/*"];

const nextConfig: NextConfig = {
  // マイク（発音判定）を使うため、Permissions-Policy で microphone を自ドメインに許可
  async headers() {
    return [{ source: "/(.*)", headers: [{ key: "Permissions-Policy", value: "microphone=(self)" }] }];
  },
  outputFileTracingIncludes: {
    "/api/parent/line-monthly": REPORT_FONT_FILES,
    "/api/cron/line-monthly": REPORT_FONT_FILES,
  },
};

export default nextConfig;
