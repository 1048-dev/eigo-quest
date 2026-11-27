/**
 * run10: 確認スクリプト（a11y・リンク）が つかう サーバー。
 *   --base <URL>  もう 動いている サーバーを つかう（check:all は 1つの サーバーを つかいまわす）
 *   --offline     DB なし（おためしモード）で next start
 *   どちらも なし → 使いすての DB（ポート 5544）を 起動・migrate・seed して next start
 * next build は すんでいること。
 */
import { createServer } from "node:net";
import path from "node:path";
import type { ChildProcess } from "node:child_process";
import { startServer, stopServer, waitForServer } from "./checkKit";
import { prepareCheckDb, startCheckDb, type CheckDb } from "./checkDb";

export const argOf = (name: string, d?: string) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : d;
};

export function freePort(start: number): Promise<number> {
  const tryPort = (p: number): Promise<number> => new Promise((resolve, reject) => {
    if (p - start > 30) return reject(new Error(`ポート ${start}〜${p} が ぜんぶ 使用中`));
    const s = createServer();
    s.once("error", () => resolve(tryPort(p + 1)));
    s.once("listening", () => s.close(() => resolve(p)));
    s.listen(p);
  });
  return tryPort(start);
}

/** 確認用の サーバーの 環境変数（メールは outbox・LINE は dry-run・ファイルは .tmp の下） */
export function checkServerEnv(dbUrl: string | null, port: number, work: string): NodeJS.ProcessEnv {
  const offlineDb = "postgresql://eigo:eigo@127.0.0.1:5999/eigo_quest?schema=public&connect_timeout=2";
  return {
    ...process.env,
    DATABASE_URL: dbUrl ?? offlineDb,
    DIRECT_URL: dbUrl ?? offlineDb,
    PORT: String(port),
    STORAGE_DRIVER: "local",
    REPORT_STORAGE_DIR: path.join(work, "storage"),
    S3_BUCKET: "",
    LINE_OUTBOX_DIR: path.join(work, "line-outbox"),
    MAIL_PROVIDER: "outbox",
    MAIL_OUTBOX_DIR: path.join(work, "mail-outbox"),
    RESEND_API_KEY: "",
    SMTP_URL: "",
    APP_BASE_URL: `http://localhost:${port}`,
    ANTHROPIC_API_KEY: "",
    LINE_MESSAGING_CHANNEL_ACCESS_TOKEN: "",
    LINE_MESSAGING_CHANNEL_SECRET: "",
    LINE_LOGIN_CHANNEL_ID: "",
    LINE_LOGIN_CHANNEL_SECRET: "",
    LINE_LOGIN_CALLBACK_URL: "",
  };
}

export interface CheckServer { base: string; db: string | null; stop: () => Promise<void> }

export async function ensureServer(defaultPort: number, label: string): Promise<CheckServer> {
  const base = argOf("base");
  if (base) return { base: base.replace(/\/$/, ""), db: argOf("db") ?? null, stop: async () => {} };
  const offline = process.argv.includes("--offline");
  let db: CheckDb | null = null;
  let server: ChildProcess | null = null;
  try {
    if (!offline) {
      db = await startCheckDb();
      prepareCheckDb(db.url);
    }
    const port = await freePort(Number(argOf("port", String(defaultPort))));
    const env = checkServerEnv(db?.url ?? null, port, path.join(process.cwd(), ".tmp", label));
    server = startServer(port, env);
    const b = `http://localhost:${port}`;
    await waitForServer(server, b, 90);
    const s = server;
    const d = db;
    return { base: b, db: d?.url ?? null, stop: async () => { stopServer(s); await d?.stop(); } };
  } catch (e) {
    stopServer(server);
    await db?.stop();
    throw e;
  }
}
