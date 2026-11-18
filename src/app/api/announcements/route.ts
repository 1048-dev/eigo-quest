import { jsonOk, withApi } from "@/lib/api/server";
import { offlineAnnouncements } from "@/lib/offline";
import type { AnnouncementsResponse } from "@/lib/api/contracts";

/**
 * GET /api/announcements — おしらせ一覧（content/announcements.json）。
 * DBを使わないので、DBが止まっていても必ず表示できる。
 */
export const GET = withApi("announcements", async () => {
  const { announcements } = offlineAnnouncements();
  return jsonOk({ announcements } satisfies AnnouncementsResponse);
});
