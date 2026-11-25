/**
 * /d/<token> — LINE で届いた「PDFをひらく」の行き先（ログイン不要。トークンが合い言葉）。
 * トークンはランダムで、DB には SHA-256 だけ。30日で期限切れ。その配信のファイルだけを出す。
 * 検索エンジンに載せない・リファラーを送らない（URL にトークンが入っているため）。
 */
import type { Metadata } from "next";
import Link from "next/link";
import { isDbUp } from "@/lib/db";
import { summaryLinesJa } from "@/lib/report/monthlyReport";
import { findDeliveryByToken } from "@/lib/services/monthlyDeliveryService";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "学習レポート（PDF）｜英語クエスト",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

function sizeLabel(bytes: number): string {
  if (bytes <= 0) return "";
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 pb-6">
      <h1 className="rpg-title text-2xl">{title}</h1>
      <section className="card p-5 text-sm">{children}</section>
    </div>
  );
}

export default async function DownloadPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!(await isDbUp())) {
    return (
      <Notice title="学習レポート">
        <p className="font-bold">ただいま表示できません。しばらくしてからもう一度お試しください。</p>
      </Notice>
    );
  }
  let view = null;
  try {
    view = await findDeliveryByToken(token);
  } catch {
    view = null;
  }
  if (!view) {
    return (
      <Notice title="リンクが使えません">
        <p className="font-bold">このリンクは有効期限（30日）が切れているか、正しくありません。</p>
        <p className="mt-2 text-[var(--ink-2)]">「おうちの方」のページの「今月のPDFを今すぐ送る」から、もう一度 LINE で受け取れます。</p>
        <Link href="/parent" className="btn btn-primary mt-4 block text-center">おうちの方のページへ</Link>
      </Notice>
    );
  }
  const s = view.summary;
  const expires = new Intl.DateTimeFormat("ja-JP", { timeZone: process.env.APP_TIMEZONE || "Asia/Tokyo", month: "long", day: "numeric" }).format(view.expiresAt);
  return (
    <div className="space-y-4 pb-6">
      <h1 className="rpg-title text-2xl">{s?.monthLabelJa ?? view.month} の学習レポート</h1>
      <section className="card rpg-rivets p-5">
        <p className="text-lg font-black">{view.childName} さん</p>
        {s && (
          <ul className="mt-2 space-y-1 text-sm">
            {summaryLinesJa(s).map((l) => <li key={l}>{l}</li>)}
          </ul>
        )}
      </section>
      <section className="card space-y-3 p-5" aria-label="PDF">
        {view.files.length === 0 && <p className="text-sm">ファイルが見つかりません。</p>}
        {view.files.map((f) => (
          <a key={f.id} href={`/d/${encodeURIComponent(token)}/${f.id}`} className="btn btn-coin block text-center" rel="noreferrer">
            📄 {f.labelJa}{f.bytes > 0 ? `（${sizeLabel(f.bytes)}）` : ""}
          </a>
        ))}
        <p className="text-xs text-[var(--ink-2)]">このリンクは {expires} まで使えます。ほかの方には共有しないでください。ワークブックは A4 で印刷してお使いください。</p>
      </section>
    </div>
  );
}
