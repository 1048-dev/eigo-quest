/** ファイルの置き場所（ローカルのフォルダ / S3 互換）の共通の形 */
export interface StoredObject {
  body: ReadableStream<Uint8Array>;
  /** バイト数（わからなければ null） */
  size: number | null;
}

export interface ObjectStorage {
  readonly driver: "local" | "s3";
  /** 秘密を含まない説明（ログ・ヘルスチェック用） */
  readonly description: string;
  put(key: string, data: Uint8Array, contentType?: string): Promise<void>;
  /** 無ければ null */
  get(key: string): Promise<Uint8Array | null>;
  /** 少しずつ読む（ダウンロードで使う）。無ければ null */
  stream(key: string): Promise<StoredObject | null>;
  /** 無ければ null */
  head(key: string): Promise<{ size: number } | null>;
  /** 無くてもエラーにしない */
  delete(key: string): Promise<void>;
  /** つながるか（ヘルスチェック）。detail には秘密を入れない */
  ping(): Promise<{ ok: boolean; detail?: string }>;
}

export class StorageError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "StorageError";
  }
}

const KEY_RE = /^[A-Za-z0-9_-][A-Za-z0-9._\-/]{0,511}$/;

/**
 * キー（置き場所の中の場所）として使えるか。
 * 英数字と ._-/ だけ・「.」「..」のセグメントや 空のセグメント（//）・末尾の / はだめ
 * （どの置き場所でも「外に出る」書き方ができないようにする）。
 */
export function isValidKey(key: unknown): key is string {
  if (typeof key !== "string" || !KEY_RE.test(key) || key.endsWith("/")) return false;
  return key.split("/").every((seg) => seg !== "" && seg !== "." && seg !== "..");
}

export function assertValidKey(key: string): void {
  if (!isValidKey(key)) throw new StorageError("INVALID_KEY", "invalid storage key");
}
