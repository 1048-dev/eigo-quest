/**
 * パスワード・保護者PINのハッシュ化（Node 標準の crypto.scrypt。ネイティブモジュールは使わない）。
 *
 * 保存形式: "scrypt$<N>$<r>$<p>$<salt base64url>$<hash base64url>"
 *  - 1件ごとにランダムな salt（16バイト）
 *  - 照合は timingSafeEqual（一致するまでの時間で中身を推測されない）
 *  - パラメータを文字列に入れているので、将来 N を上げても古いハッシュを照合できる
 * 平文のパスワード・PIN はどこにも保存・ログ出力しない。
 */
import { randomBytes, scrypt as scryptCb, timingSafeEqual, type ScryptOptions } from "node:crypto";

const KEY_LEN = 64;
const SALT_LEN = 16;
export const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 } as const;
/** N=16384, r=8 で約16MB。既定の maxmem(32MB) に余裕を持たせる */
const MAXMEM = 64 * 1024 * 1024;

function scrypt(secret: string, salt: Buffer, keyLen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCb(secret.normalize("NFKC"), salt, keyLen, opts, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

export async function hashSecret(secret: string, params: { N: number; r: number; p: number } = SCRYPT_PARAMS): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const key = await scrypt(secret, salt, KEY_LEN, { ...params, maxmem: MAXMEM });
  return ["scrypt", params.N, params.r, params.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

/** 形式がおかしいハッシュ・空文字は false（例外にしない） */
export async function verifySecret(secret: string, stored: string | null | undefined): Promise<boolean> {
  if (typeof secret !== "string" || typeof stored !== "string") return false;
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every((x) => Number.isInteger(x) && x > 0) || N > 1 << 20 || r > 32 || p > 16) return false;
  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  if (salt.length === 0 || expected.length === 0) return false;
  try {
    const actual = await scrypt(secret, salt, expected.length, { N, r, p, maxmem: MAXMEM });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * 存在しないメールアドレスでログインされたときに照合する「ダミー」のハッシュ。
 * 登録済みかどうかで応答時間が変わらないようにする（遅延生成して使い回す）。
 */
let dummy: Promise<string> | undefined;
export function dummyHash(): Promise<string> {
  dummy ??= hashSecret(randomBytes(16).toString("hex"));
  return dummy;
}
