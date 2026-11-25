/**
 * LINE ログインから戻ってきたときの ?line=... → 画面に出すメッセージ（保護者向け・ていねい語）。
 * サーバー（/api/auth/line/start・callback）が付けるコードと対応している。
 */
export type LineNotice = { kind: "ok" | "error"; text: string };

const RETRY = "もう一度「LINEでログイン」からお試しください。";

const MESSAGES: Record<string, LineNotice> = {
  linked: { kind: "ok", text: "LINE と連携しました。次からは「LINEでログイン」でもログインできます。" },
  canceled: { kind: "error", text: "LINE でのログインを中止しました。" },
  state: { kind: "error", text: `ログインの確認ができませんでした（時間がたったか、別の画面で始めた可能性があります）。${RETRY}` },
  nonce: { kind: "error", text: `ログインの確認ができませんでした。${RETRY}` },
  expired: { kind: "error", text: `ログインの有効期限が切れました。${RETRY}` },
  error: { kind: "error", text: "LINE でのログインに失敗しました。時間をおいてもう一度お試しください。" },
  offline: { kind: "error", text: "ただいまアカウント機能を利用できません。しばらくしてからもう一度お試しください（おためしモードはそのまま遊べます）。" },
  not_configured: { kind: "error", text: "LINE ログインはまだ準備中です。メールアドレスでログイン・登録してください。" },
  not_logged_in: { kind: "error", text: "ログインの状態が変わったため、LINE と連携できませんでした。ログインしてからもう一度お試しください。" },
  pin_required: { kind: "error", text: "LINE と連携するには、先に暗証番号を入力してください。" },
  already_linked: { kind: "error", text: "この LINE アカウントは、すでに別のアカウントと連携しています。連携できる LINE アカウントは1つのアカウントにつき1つです。" },
  has_other_line: { kind: "error", text: "すでに別の LINE アカウントと連携しています。先に連携を解除してください。" },
  reauth_ok: { kind: "ok", text: "LINE で本人確認ができました。10分以内に新しい暗証番号を決めてください。" },
  reauth_mismatch: { kind: "error", text: "このアカウントと連携している LINE アカウントと違うため、本人確認ができませんでした。連携している LINE アカウントでお試しください。" },
  reauth_not_linked: { kind: "error", text: "このアカウントは LINE と連携していません。アカウントのパスワードで本人確認してください。" },
  rate_limited: { kind: "error", text: "登録の回数が多すぎます。しばらく待ってからもう一度お試しください。" },
};

export function lineNotice(code: string | null | undefined): LineNotice | null {
  if (!code) return null;
  return Object.prototype.hasOwnProperty.call(MESSAGES, code) ? MESSAGES[code] : null;
}

/** いまの URL の ?line=... を読む（ブラウザだけ） */
export function readLineNoticeFromUrl(): LineNotice | null {
  if (typeof window === "undefined") return null;
  return lineNotice(new URLSearchParams(window.location.search).get("line"));
}

export const LINE_LOGIN_HREF = "/api/auth/line/start?mode=login";
export const LINE_LINK_HREF = "/api/auth/line/start?mode=link";
export const LINE_REAUTH_HREF = "/api/auth/line/start?mode=reauth";
