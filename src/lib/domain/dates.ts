import { APP_TIMEZONE } from "./config";

/** APP_TIMEZONE 基準の "YYYY-MM-DD"。1日のレッスン回数・復習クエスト（完了の翌日から）の判定はすべてこの日付で行う。 */
export function localDate(d: Date, tz: string = APP_TIMEZONE): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86_400_000);
}

/** その日の終わり（APP_TIMEZONE）。お宝アラートの有効期限に使う。 */
export function endOfLocalDay(d: Date, tz: string = APP_TIMEZONE): Date {
  const day = localDate(d, tz);
  // tz のオフセットを求めて翌日0時を UTC に変換
  const probe = new Date(day + "T00:00:00Z");
  const offsetMin = tzOffsetMinutes(probe, tz);
  return new Date(probe.getTime() + 86_400_000 - offsetMin * 60_000 - 1);
}

function tzOffsetMinutes(d: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
  }).formatToParts(d);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((asUtc - d.getTime()) / 60_000);
}
