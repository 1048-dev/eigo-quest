import type { NextConfig } from "next";

/** 学習レポートの PDF に埋め込む日本語フォント（src/lib/report/pdf.ts が実行時に読む）。サーバーレスの関数に同梱する */
const REPORT_FONT_FILES = ["./assets/fonts/**/*"];

const nextConfig: NextConfig = {
  // マイク（発音判定）を使うため、Permissions-Policy で microphone を自ドメインに許可
  // run5 Phase 4（セキュリティの見直し）: ほかのサイトの枠（iframe）に入れさせない・ファイルの種類を ブラウザに推測させない・
  // 外のサイトへ URL の パスを送らない。メールのリンク（?token=）で開く画面は Referer を まったく送らない
  // （画面の HTML には トークンが入らないので Cache-Control は Next.js の既定のまま。トークンは画面がすぐ URL から消す）
  async headers() {
    const tokenPage = [
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
    ];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Permissions-Policy", value: "microphone=(self)" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      { source: "/reset-password", headers: tokenPage },
      { source: "/verify-email", headers: tokenPage },
    ];
  },
  outputFileTracingIncludes: {
    "/api/parent/line-monthly": REPORT_FONT_FILES,
    "/api/cron/line-monthly": REPORT_FONT_FILES,
  },
};

export default nextConfig;
