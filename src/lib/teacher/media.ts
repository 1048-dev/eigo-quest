/**
 * run8 P8: 先生の 動画（videoUrl）まわりの 小さな 関数。
 * 字幕は 動画と 同じ 場所・同じ 名前の .vtt（lesson-0001.mp4 → lesson-0001.vtt）。
 */
export function vttUrlFor(videoUrl: string | undefined | null): string | null {
  if (!videoUrl) return null;
  const m = videoUrl.match(/^([^?#]*?)(\.[A-Za-z0-9]{2,5})?([?#].*)?$/);
  if (!m || !m[1]) return null;
  const base = m[1];
  if (base.endsWith("/")) return null;
  return `${base}.vtt${m[3] ?? ""}`;
}
