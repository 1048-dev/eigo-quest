"use client";
/**
 * LINE で新しく登録した保護者が、はじめての暗証番号（4けた）を決める画面。
 * 決めたら「おうちの方」ページへ（そのままお子さまを追加できる）。
 * メールで登録ずみの方が まちがえて LINE で登録してしまったときは「登録を取り消す」で消せる。
 */
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { AccountHeader, FormMessage, PinField } from "@/components/account/Form";
import { AuthResultResponseSchema, type AuthMeResponse } from "@/lib/api/contracts";
import { codeOf, fetchMe, isAccountOffline, notifyAccountChanged, sendJson } from "@/lib/auth/client";

export default function SetupPinPage() {
  const router = useRouter();
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchMe().then((r) => {
      if (!r.ok || !r.data.loggedIn) { router.replace(isAccountOffline(r) || r.data.offline ? "/who" : "/login"); return; }
      if (!r.data.parent?.needsPin) { router.replace("/who"); return; }
      setMe(r.data);
    });
  }, [router]);

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    if (!/^\d{4}$/.test(pin)) { setError("暗証番号は数字4けたで入力してください。"); return; }
    if (pin !== pin2) { setError("確認用の暗証番号が一致しません。"); return; }
    setBusy(true);
    const r = await sendJson("POST", "/api/auth/line/pin", AuthResultResponseSchema, { pin });
    setBusy(false);
    if (r.ok && r.data.ok) {
      notifyAccountChanged();
      router.replace("/parent?add=1&welcome=1");
      return;
    }
    if (codeOf(r) === "PIN_ALREADY_SET") { router.replace("/who"); return; }
    if (codeOf(r) === "NOT_LOGGED_IN") { router.replace("/login"); return; }
    setError(r.error ?? "保存できませんでした。時間をおいてもう一度お試しください。");
  };

  const cancel = async () => {
    if (!window.confirm("LINE での登録を取り消しますか？（このアカウントは削除されます）")) return;
    setBusy(true);
    const r = await sendJson("POST", "/api/auth/line/cancel", AuthResultResponseSchema);
    setBusy(false);
    if (r.ok && r.data.ok) { notifyAccountChanged(); router.replace("/login"); return; }
    setError(r.error ?? "取り消せませんでした。");
  };

  if (!me) return <p className="rpg-title p-8 text-center text-xl">読み込み中…</p>;
  const name = me.parent?.lineDisplayName;

  return (
    <div className="pb-6">
      <AccountHeader title="暗証番号を決めてください" sub={name ? `LINE（${name}）で登録しました。` : "LINE で登録しました。"} />
      <form onSubmit={submit} noValidate className="card rpg-rivets space-y-4 p-5" aria-label="保護者用の暗証番号を決める">
        <FormMessage error={error} />
        <div>
          <p className="text-sm font-black">保護者用の暗証番号（4けた）</p>
          <p className="mt-0.5 text-xs text-[var(--ink-2)]">「おうちの方」のページに入るときに使います。お子さまに知られない番号にしてください。</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <PinField label="暗証番号" value={pin} onChange={setPin} />
          <PinField label="暗証番号（確認）" value={pin2} onChange={setPin2} />
        </div>
        <button type="submit" className="btn btn-coin block w-full text-lg" disabled={busy}>{busy ? "保存しています…" : "決定して お子さまを追加する"}</button>
      </form>

      <section className="card mt-5 p-4">
        <p className="text-xs text-[var(--ink-2)]">
          すでにメールアドレスで登録している方へ：この LINE アカウントで新しく登録されています。登録を取り消してメールアドレスでログインし、
          「おうちの方」のページから LINE を連携してください。
        </p>
        <button type="button" className="btn btn-ghost mt-3 w-full !py-2 text-sm" disabled={busy} onClick={() => void cancel()}>LINE での登録を取り消す</button>
      </section>
    </div>
  );
}
