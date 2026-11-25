/**
 * 保護者あてのメールの文面（ていねい語。テキスト + かんたんな HTML）。
 * 会社名は入れない（アプリ名「英語クエスト」だけ）。リンクは https?:// のものだけ受けつけ、HTML では必ずエスケープする。
 */
import type { MailMessage } from "./index";

export const APP_NAME_JA = "英語クエスト";

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function assertHttpUrl(url: string): string {
  const u = new URL(url);
  if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("mail link must be http(s)");
  return u.toString();
}

const FOOTER_TEXT = [
  "",
  "――",
  `${APP_NAME_JA}`,
  "このメールは送信専用です。ご返信いただいてもお答えできません。",
  "お心当たりのない場合は、このメールを破棄してください。",
].join("\n");

interface Section {
  greeting: string;
  paragraphs: string[];
  button?: { label: string; url: string };
  notes?: string[];
}

function render(to: string, subject: string, s: Section): MailMessage {
  const url = s.button ? assertHttpUrl(s.button.url) : null;
  const text = [
    s.greeting,
    "",
    ...s.paragraphs.flatMap((p) => [p, ""]),
    ...(url && s.button ? [`▼ ${s.button.label}`, url, ""] : []),
    ...(s.notes ?? []).map((n) => `※ ${n}`),
    FOOTER_TEXT,
  ].join("\n");
  const p = (t: string) => `<p style="margin:0 0 14px;line-height:1.7">${escapeHtml(t)}</p>`;
  const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:24px;background:#f5f3ee;font-family:'Hiragino Sans','Noto Sans JP',Meiryo,sans-serif;color:#222">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px 24px">
<p style="margin:0 0 18px;font-weight:bold;font-size:18px">${escapeHtml(APP_NAME_JA)}</p>
${p(s.greeting)}
${s.paragraphs.map(p).join("\n")}
${url && s.button ? `<p style="margin:22px 0;text-align:center"><a href="${escapeHtml(url)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px">${escapeHtml(s.button.label)}</a></p>
<p style="margin:0 0 14px;font-size:12px;color:#555;line-height:1.6">ボタンが押せない場合は、次の URL をブラウザに貼り付けてください。<br><span style="word-break:break-all">${escapeHtml(url)}</span></p>` : ""}
${(s.notes ?? []).map((n) => `<p style="margin:0 0 6px;font-size:12px;color:#555;line-height:1.6">※ ${escapeHtml(n)}</p>`).join("\n")}
<hr style="border:none;border-top:1px solid #ddd;margin:22px 0 12px">
<p style="margin:0;font-size:11px;color:#777;line-height:1.6">${escapeHtml(APP_NAME_JA)}<br>このメールは送信専用です。ご返信いただいてもお答えできません。<br>お心当たりのない場合は、このメールを破棄してください。</p>
</div></body></html>`;
  return { to, subject: `【${APP_NAME_JA}】${subject}`, text, html };
}

/** パスワードの再設定リンク */
export function passwordResetMail(to: string, url: string, minutes: number): MailMessage {
  return render(to, "パスワード再設定のご案内", {
    greeting: `${APP_NAME_JA}をご利用いただき、ありがとうございます。`,
    paragraphs: [
      "パスワードの再設定のお手続きを受け付けました。",
      "下のボタンから、新しいパスワードを設定してください。",
    ],
    button: { label: "新しいパスワードを設定する", url },
    notes: [
      `このリンクの有効期限は ${minutes}分 です。1回だけ使えます。`,
      "パスワードを再設定すると、すべての端末でログアウトされます。",
      "お手続きに心当たりのない場合は、このメールを破棄してください。パスワードは変更されません。",
    ],
  });
}

/** パスワードを再設定しました（お知らせ） */
export function passwordChangedMail(to: string, loginUrl: string): MailMessage {
  return render(to, "パスワードを再設定しました", {
    greeting: `${APP_NAME_JA}をご利用いただき、ありがとうございます。`,
    paragraphs: [
      "保護者アカウントのパスワードを再設定しました。安全のため、すべての端末でログアウトしています。",
      "新しいパスワードで、もう一度ログインしてください。",
    ],
    button: { label: "ログインする", url: loginUrl },
    notes: ["お手続きに心当たりのない場合は、すぐに「パスワードを忘れた方」から再設定してください。"],
  });
}

/** LINE で登録した保護者が メールアドレスを追加するときの確認 */
export function emailVerifyMail(to: string, url: string, hours: number): MailMessage {
  return render(to, "メールアドレスの確認のお願い", {
    greeting: `${APP_NAME_JA}をご利用いただき、ありがとうございます。`,
    paragraphs: [
      "保護者アカウントに、このメールアドレスとパスワードでのログインを追加するお手続きを受け付けました。",
      "下のボタンを押して、お手続きを完了してください。",
    ],
    button: { label: "メールアドレスを確認する", url },
    notes: [
      `このリンクの有効期限は ${hours}時間 です。1回だけ使えます。`,
      "お手続きに心当たりのない場合は、このメールを破棄してください。アカウントには追加されません。",
    ],
  });
}

/** 追加しようとした メールアドレスが すでに ほかのアカウントで使われているとき（その持ち主へのお知らせ） */
export function emailInUseMail(to: string, loginUrl: string, forgotUrl: string): MailMessage {
  return render(to, "メールアドレスの追加について", {
    greeting: `${APP_NAME_JA}をご利用いただき、ありがとうございます。`,
    paragraphs: [
      "このメールアドレスを、LINE で登録した保護者アカウントに追加するお手続きがありましたが、このメールアドレスはすでに別のアカウントで登録されているため、追加できませんでした。",
      `すでにご登録がある方は、メールアドレスでログインしてください（ログイン: ${loginUrl}）。`,
      "パスワードをお忘れの場合は、下のボタンから再設定できます。",
    ],
    button: { label: "パスワードを再設定する", url: forgotUrl },
    notes: ["お手続きに心当たりのない場合は、このメールを破棄してください。"],
  });
}
