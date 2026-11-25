/**
 * LINE 公式アカウント（Messaging API）。
 *  - push: 保護者（Parent.lineUserId）に Flex メッセージ（お子さまの名前・要約・「PDFをひらく」ボタン）を送る
 *    ※ Messaging API では PDF ファイルそのものは送れないので、ダウンロードページ /d/<token> へのリンクを送る
 *  - webhook の署名（X-Line-Signature = base64(HMAC-SHA256(チャネルシークレット, 本文)))を確かめる
 * キーは環境変数だけから読む（LINE_MESSAGING_CHANNEL_ACCESS_TOKEN / LINE_MESSAGING_CHANNEL_SECRET / APP_BASE_URL）。
 * アクセストークンが無いときは送らない（dry-run: outbox に書くだけ）。
 *
 * 注意: LINE ログインのユーザーID と Messaging API のユーザーID は、2つのチャネルが同じ「プロバイダー」に
 * あるときだけ同じになる。かならず同じプロバイダーの下に作ること（README）。
 */
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { summaryLinesJa, type ReportSummary } from "@/lib/report/monthlyReport";

export const LINE_PUSH_URL = "https://api.line.me/v2/bot/message/push";
export const LINE_BUTTON_LABEL = "PDFをひらく";
const LINE_GREEN = "#06C755";
const ACCENT = "#2a78d6";

export interface LineMessagingConfig {
  /** 送信に使う（無ければ dry-run） */
  accessToken: string | null;
  /** webhook の署名の確認に使う（無ければ webhook は受け付けない） */
  channelSecret: string | null;
  /** メッセージに入れるリンクの もと（例: https://example.com）。無ければ送れない */
  baseUrl: string | null;
}

export function normalizeBaseUrl(raw: string | undefined | null): string | null {
  const v = raw?.trim();
  if (!v) return null;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.origin + u.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function lineMessagingConfig(env: Record<string, string | undefined> = process.env): LineMessagingConfig {
  return {
    accessToken: env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN?.trim() || null,
    channelSecret: env.LINE_MESSAGING_CHANNEL_SECRET?.trim() || null,
    baseUrl: normalizeBaseUrl(env.APP_BASE_URL),
  };
}

/** 本当に LINE へ送れるか（アクセストークンと APP_BASE_URL がそろっている） */
export function canPush(cfg: LineMessagingConfig): boolean {
  return !!cfg.accessToken && !!cfg.baseUrl;
}

// ---------------------------------------------------------------------------
// webhook の署名
// ---------------------------------------------------------------------------
export function lineSignature(channelSecret: string, rawBody: string | Buffer): string {
  return createHmac("sha256", channelSecret).update(rawBody).digest("base64");
}

/** 署名が正しいか（時間一定で比べる）。シークレット・署名が無ければ false */
export function verifyLineSignature(channelSecret: string | null, rawBody: string | Buffer, signature: string | null): boolean {
  if (!channelSecret || !signature) return false;
  const expected = Buffer.from(lineSignature(channelSecret, rawBody));
  const given = Buffer.from(signature.trim());
  return expected.length === given.length && timingSafeEqual(expected, given);
}

// ---------------------------------------------------------------------------
// Flex メッセージ
// ---------------------------------------------------------------------------
export interface DeliveryMessageItem {
  summary: ReportSummary;
  /** ダウンロードページの URL（/d/<token>） */
  url: string;
}

export function downloadUrl(baseUrl: string, token: string): string {
  return `${baseUrl}/d/${token}`;
}

function bubble(item: DeliveryMessageItem) {
  const s = item.summary;
  return {
    type: "bubble",
    header: {
      type: "box",
      layout: "vertical",
      backgroundColor: ACCENT,
      paddingAll: "16px",
      contents: [
        { type: "text", text: "Eigo Quest 学習レポート", color: "#ffffff", size: "sm", weight: "bold" },
        { type: "text", text: s.monthLabelJa, color: "#ffffff", size: "xs" },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      contents: [
        { type: "text", text: `${s.childName} さん`, weight: "bold", size: "lg", wrap: true },
        ...summaryLinesJa(s).map((text) => ({ type: "text", text, size: "sm", color: "#555555", wrap: true })),
        { type: "separator", margin: "md" },
        { type: "text", text: "学習レポートと 1か月ワークブック（PDF）をお届けします。リンクの有効期限は30日です。", size: "xs", color: "#888888", wrap: true, margin: "md" },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [{ type: "button", style: "primary", color: LINE_GREEN, action: { type: "uri", label: LINE_BUTTON_LABEL, uri: item.url } }],
    },
  };
}

/** お子さま1人なら バブル1つ、2人以上なら カルーセル（最大12。保護者1人の子どもは6人まで） */
export function buildMonthlyFlexMessage(items: readonly DeliveryMessageItem[]) {
  if (items.length === 0) throw new Error("no items");
  const month = items[0]!.summary.monthLabelJa;
  const names = items.map((i) => `${i.summary.childName}さん`).join("、");
  const altText = `${month}の学習レポート（${names}）`.slice(0, 400);
  const bubbles = items.slice(0, 12).map(bubble);
  return {
    type: "flex" as const,
    altText,
    contents: bubbles.length === 1 ? bubbles[0]! : { type: "carousel", contents: bubbles },
  };
}

export type PushResult = { ok: true; status: number } | { ok: false; status: number; reason: string };
type Fetch = (input: string, init?: RequestInit) => Promise<Response>;

/**
 * push メッセージを送る。失敗しても例外にしない（ログ・DB には失敗の種類だけ残す。トークンは出さない）。
 * X-Line-Retry-Key を付けるので、同じ retryKey で送り直しても二重には届かない。
 */
export async function pushMessage(
  cfg: LineMessagingConfig, to: string, messages: unknown[], opts: { fetchImpl?: Fetch; retryKey?: string } = {},
): Promise<PushResult> {
  if (!cfg.accessToken) return { ok: false, status: 0, reason: "NOT_CONFIGURED" };
  const fetchImpl = opts.fetchImpl ?? fetch;
  try {
    const res = await fetchImpl(LINE_PUSH_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cfg.accessToken}`,
        "x-line-retry-key": opts.retryKey ?? randomUUID(),
      },
      body: JSON.stringify({ to, messages }),
    });
    if (res.ok) return { ok: true, status: res.status };
    // 409 = 同じ retry key ですでに受け付けずみ（二重送信にはならない）
    if (res.status === 409) return { ok: true, status: res.status };
    let reason = `HTTP_${res.status}`;
    try {
      const body = (await res.json()) as { message?: unknown };
      if (typeof body.message === "string") reason += `: ${body.message.slice(0, 120)}`;
    } catch {
      /* 本文が JSON でない */
    }
    return { ok: false, status: res.status, reason };
  } catch {
    return { ok: false, status: 0, reason: "NETWORK_ERROR" };
  }
}

// ---------------------------------------------------------------------------
// webhook のイベント
// ---------------------------------------------------------------------------
export interface FriendEvent {
  type: "follow" | "unfollow";
  userId: string;
  timestamp: number;
}

const LINE_USER_ID_RE = /^U[0-9a-f]{32}$/;

/** webhook の本文から follow / unfollow（ユーザーから）だけを取り出す。おかしな形は無視 */
export function parseFriendEvents(body: unknown): FriendEvent[] {
  const events = (body as { events?: unknown } | null)?.events;
  if (!Array.isArray(events)) return [];
  const out: FriendEvent[] = [];
  for (const e of events) {
    const ev = e as { type?: unknown; source?: { type?: unknown; userId?: unknown }; timestamp?: unknown };
    if (ev?.type !== "follow" && ev?.type !== "unfollow") continue;
    if (ev.source?.type !== "user" || typeof ev.source.userId !== "string" || !LINE_USER_ID_RE.test(ev.source.userId)) continue;
    out.push({ type: ev.type, userId: ev.source.userId, timestamp: typeof ev.timestamp === "number" ? ev.timestamp : Date.now() });
  }
  return out;
}
