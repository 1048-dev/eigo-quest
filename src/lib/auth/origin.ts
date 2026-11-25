/**
 * CSRF 対策: 状態を変えるリクエスト（POST/PUT/PATCH/DELETE）の Origin を確認する。
 * Edge（middleware）でも動くよう、Node 専用 API は使わない。
 *
 *  - Origin がある → リクエスト先のホスト（x-forwarded-host / host）と一致するか、ALLOWED_ORIGINS にあれば OK
 *  - Origin が無い → Sec-Fetch-Site が "cross-site" なら NG、それ以外は OK
 *    （ブラウザは fetch の POST などに必ず Origin を付ける。付かないのはブラウザ以外のクライアントで、
 *     その場合 httpOnly の cookie を持っていないので CSRF にならない）
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function isStateChanging(method: string): boolean {
  return !SAFE_METHODS.has(method.toUpperCase());
}

function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
}

export function isSameOrigin(req: Request): boolean {
  if (!isStateChanging(req.method)) return true;
  const origin = req.headers.get("origin");
  if (!origin) return req.headers.get("sec-fetch-site") !== "cross-site";
  if (origin === "null") return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  if (allowedOrigins().includes(origin.replace(/\/$/, ""))) return true;
  const hosts = [req.headers.get("x-forwarded-host"), req.headers.get("host")]
    .flatMap((h) => (h ? h.split(",").map((s) => s.trim()) : []));
  try {
    hosts.push(new URL(req.url).host);
  } catch {
    /* url が相対のとき */
  }
  return hosts.some((h) => h.toLowerCase() === originHost.toLowerCase());
}
