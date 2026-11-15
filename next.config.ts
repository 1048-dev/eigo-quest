import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // マイク（発音判定）を使うため、Permissions-Policy で microphone を自ドメインに許可
  async headers() {
    return [{ source: "/(.*)", headers: [{ key: "Permissions-Policy", value: "microphone=(self)" }] }];
  },
};

export default nextConfig;
