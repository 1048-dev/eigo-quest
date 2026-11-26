/**
 * run8 P9: 先生の 動画の マニフェスト（content/teacher-videos.json）。
 *
 * きめたこと: 動画の URL は DB ではなく リポジトリの JSON に おく。
 *  - DB が ねていても（おためし・オフライン）同じ 動画が 出る
 *  - レッスンの データと 同じく git で 変更が のこる・もどせる
 *  - 1,200 本 ぜんぶ 入っても 100KB くらい（ブラウザに のっても 問題ない 大きさ）
 * 書きかえは scripts/teacher-link.ts で する（手で 書いても よいが URL の チェックが 入らない）。
 */
import manifestRaw from "@content/teacher-videos.json";

export interface TeacherVideoEntry {
  /** 動画の URL（https:// か、public/ の 下を さす / から はじまる パス） */
  url: string;
  /** どの プロバイダーで つくったか（いまは "manual" だけ） */
  provider: string;
  /** つないだ 日時（ISO） */
  linkedAt: string;
  note?: string;
}

export interface TeacherVideoManifest {
  version: 1;
  note?: string;
  videos: Record<string, TeacherVideoEntry>;
}

const MANIFEST = manifestRaw as TeacherVideoManifest;

/** 動画に つかって よい URL か（javascript: などを ふせぐ） */
export function isAllowedVideoUrl(url: string): boolean {
  const u = url.trim();
  if (!u || /\s/.test(u)) return false;
  if (u.startsWith("/") && !u.startsWith("//")) return true;
  try {
    const p = new URL(u);
    return p.protocol === "https:" || (p.protocol === "http:" && (p.hostname === "localhost" || p.hostname === "127.0.0.1"));
  } catch {
    return false;
  }
}

/** マニフェストの まちがいを 見つける（空なら OK） */
export function validateManifest(m: unknown, totalLessons?: number): string[] {
  const errors: string[] = [];
  if (!m || typeof m !== "object") return ["manifest is not an object"];
  const mm = m as Partial<TeacherVideoManifest>;
  if (mm.version !== 1) errors.push(`version must be 1 (got ${String(mm.version)})`);
  if (!mm.videos || typeof mm.videos !== "object") return [...errors, "videos must be an object"];
  for (const [k, v] of Object.entries(mm.videos)) {
    const n = Number(k);
    if (!Number.isInteger(n) || n < 1 || String(n) !== k) errors.push(`bad lesson key "${k}"`);
    else if (totalLessons && n > totalLessons) errors.push(`L${k}: lesson does not exist (max ${totalLessons})`);
    if (!v || typeof v.url !== "string" || !isAllowedVideoUrl(v.url)) errors.push(`L${k}: bad url ${JSON.stringify(v?.url)}`);
    if (!v || typeof v.provider !== "string" || !v.provider) errors.push(`L${k}: provider missing`);
  }
  return errors;
}

/** レッスンの 動画の URL（なければ undefined → バーチャル先生が 授業する） */
export function teacherVideoUrl(lessonNo: number, manifest: TeacherVideoManifest = MANIFEST): string | undefined {
  const e = manifest.videos?.[String(lessonNo)];
  return e && typeof e.url === "string" && isAllowedVideoUrl(e.url) ? e.url.trim() : undefined;
}

export function linkedLessonNos(manifest: TeacherVideoManifest = MANIFEST): number[] {
  return Object.keys(manifest.videos ?? {}).map(Number).filter(Number.isInteger).sort((a, b) => a - b);
}

// ---------------------------------------------------------------------------
// 書きかえ（scripts/teacher-link.ts・テスト用。もとの オブジェクトは かえない）
// ---------------------------------------------------------------------------

export function withVideo(m: TeacherVideoManifest, lessonNo: number, url: string, opts: { provider?: string; now?: Date; note?: string } = {}): TeacherVideoManifest {
  if (!Number.isInteger(lessonNo) || lessonNo < 1) throw new Error(`bad lesson number: ${lessonNo}`);
  if (!isAllowedVideoUrl(url)) throw new Error(`URL must start with https:// or / : ${url}`);
  const entry: TeacherVideoEntry = { url: url.trim(), provider: opts.provider ?? "manual", linkedAt: (opts.now ?? new Date()).toISOString() };
  if (opts.note) entry.note = opts.note;
  return { ...m, videos: sortVideos({ ...m.videos, [String(lessonNo)]: entry }) };
}

export function withoutVideo(m: TeacherVideoManifest, lessonNo: number): TeacherVideoManifest {
  const videos = { ...m.videos };
  delete videos[String(lessonNo)];
  return { ...m, videos };
}

function sortVideos(v: Record<string, TeacherVideoEntry>): Record<string, TeacherVideoEntry> {
  return Object.fromEntries(Object.entries(v).sort((a, b) => Number(a[0]) - Number(b[0])));
}

/**
 * まとめて つなぐ ときの URL。{n} = 1、{nnnn} = 0001（4 けた）。
 * 例: urlFromPattern("https://cdn.example.com/teacher/lesson-{nnnn}.mp4", 12) → .../lesson-0012.mp4
 */
export function urlFromPattern(pattern: string, lessonNo: number): string {
  return pattern.replace(/\{nnnn\}/g, String(lessonNo).padStart(4, "0")).replace(/\{n\}/g, String(lessonNo));
}
