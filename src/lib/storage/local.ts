/**
 * ローカルのフォルダに置く（開発・自分のサーバー用）。
 * Vercel などのサーバーレスでは ファイルが残らないので、本番は STORAGE_DRIVER=s3 にする。
 */
import { createReadStream } from "node:fs";
import { access, mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { Readable } from "node:stream";
import type { ObjectStorage, StoredObject } from "./types";
import { assertValidKey, isValidKey } from "./types";

/** キー → 絶対パス。置き場所の外を指していたら null */
export function resolveInRoot(root: string, key: string): string | null {
  if (!isValidKey(key)) return null;
  const abs = path.resolve(root, ...key.split("/"));
  const rootWithSep = root.endsWith(path.sep) ? root : root + path.sep;
  return abs.startsWith(rootWithSep) ? abs : null;
}

export class LocalStorage implements ObjectStorage {
  readonly driver = "local" as const;
  readonly root: string;

  constructor(root: string) {
    this.root = path.resolve(root);
  }

  get description(): string {
    return `local:${this.root}`;
  }

  private abs(key: string): string {
    assertValidKey(key);
    const p = resolveInRoot(this.root, key);
    if (!p) throw new Error("invalid storage key");
    return p;
  }

  async put(key: string, data: Uint8Array): Promise<void> {
    const abs = this.abs(key);
    await mkdir(path.dirname(abs), { recursive: true });
    // とちゅうまで書いたファイルを読まれないよう、別名で書いてから置きかえる
    const tmp = `${abs}.${randomBytes(6).toString("hex")}.tmp`;
    await writeFile(tmp, data);
    await rename(tmp, abs);
  }

  async get(key: string): Promise<Uint8Array | null> {
    try {
      return new Uint8Array(await readFile(this.abs(key)));
    } catch (e) {
      if ((e as NodeJS.ErrnoException)?.code === "ENOENT") return null;
      throw e;
    }
  }

  async stream(key: string): Promise<StoredObject | null> {
    const info = await this.head(key);
    if (!info) return null;
    const node = createReadStream(this.abs(key));
    return { body: Readable.toWeb(node) as unknown as ReadableStream<Uint8Array>, size: info.size };
  }

  async head(key: string): Promise<{ size: number } | null> {
    try {
      const s = await stat(this.abs(key));
      return s.isFile() ? { size: s.size } : null;
    } catch (e) {
      if ((e as NodeJS.ErrnoException)?.code === "ENOENT") return null;
      throw e;
    }
  }

  async delete(key: string): Promise<void> {
    await rm(this.abs(key), { force: true });
  }

  async ping(): Promise<{ ok: boolean; detail?: string }> {
    try {
      await mkdir(this.root, { recursive: true });
      await access(this.root, constants.W_OK);
      return { ok: true };
    } catch (e) {
      return { ok: false, detail: (e as NodeJS.ErrnoException)?.code ?? "ERROR" };
    }
  }
}
