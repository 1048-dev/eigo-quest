"use client";
/**
 * 「おうちの方」ページ: おためしの きろくを ひきつぐ（run5 Phase 1）。
 *  - この端末に おためしの きろく（ブラウザの オフライン分・この端末の おためし学習者）が あるときだけ 出す。
 *  - 「だれが あそぶ？」で「いいえ」と こたえた あとでも ここから ひきつげる。
 *  - お子さまを えらぶ → 確認 → ひきつぐ。きろくごとに 1回だけ（サーバーが 2回目を ふせぐ）。
 */
import { useEffect, useState } from "react";
import { ChildAvatar } from "@/components/account/ChildAvatar";
import { FormMessage } from "@/components/account/Form";
import { trialCounts } from "@/components/account/TrialCarryDialog";
import type { ChildOverview } from "@/lib/api/contracts";
import { carryTrialTo, fetchTrialStatus } from "@/lib/auth/client";
import { hasDeviceTrialProgress, type ServerTrialStatus } from "@/lib/offline/trialLog";
import type { Guard } from "./ChildCard";

export function TrialCarryPanel({ kids, guard, onCarried }: { kids: ChildOverview[]; guard: Guard; onCarried: (msg: string) => void }) {
  const [server, setServer] = useState<ServerTrialStatus | null | undefined>(undefined);
  const [available, setAvailable] = useState(false);
  const [childId, setChildId] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    void fetchTrialStatus().then((s) => {
      if (!alive) return;
      setServer(s);
      setAvailable(hasDeviceTrialProgress(s));
    });
    return () => { alive = false; };
  }, []);

  if (server === undefined || !available || kids.length === 0) return null;
  const counts = trialCounts(server);
  const target = kids.find((k) => k.id === childId) ?? null;

  const carry = async () => {
    if (!target) return;
    setBusy(true);
    setError(null);
    const r = await carryTrialTo(target.id);
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) {
      setAvailable(false);
      const c = r.data.carried;
      onCarried(r.data.nothing
        ? "引き継ぐ記録はありませんでした。"
        : r.data.alreadyCarried
          ? "この記録はすでに引き継がれています。"
          : `おためしの記録を${target.nickname}さんに引き継ぎました（レッスン${c.lessons}・テスト合格${c.tests}・コイン${c.coins}）。`);
      return;
    }
    setConfirming(false);
    setError(r.error ?? "引き継げませんでした。時間をおいてもう一度お試しください。");
  };

  return (
    <section className="card rpg-rivets p-4" aria-labelledby="trial-carry-title">
      <h2 id="trial-carry-title" className="rpg-title text-lg">おためしの記録</h2>
      <p className="mt-1 text-sm">
        この端末には、ログインせずに遊んだ記録があります（レッスン{counts.lessons}・テスト合格{counts.tests}・コイン{counts.coins}）。
        お子さまの記録に引き継ぐことができます。
      </p>
      <FormMessage error={error} />
      <fieldset className="mt-3" disabled={busy || confirming}>
        <legend className="text-xs font-bold text-[var(--ink-2)]">引き継ぐお子さま</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {kids.map((k, i) => (
            <label key={k.id} className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-2 py-1.5 ${childId === k.id ? "border-[var(--volt)]" : "border-[var(--gold)]/40"}`}>
              <input type="radio" name="trial-carry-child" value={k.id} checked={childId === k.id} onChange={() => setChildId(k.id)} className="sr-only" />
              <ChildAvatar childId={k.id} index={i} avatar={k.avatarCharacter} size={32} />
              <span className="truncate text-sm font-bold">{k.nickname}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {!confirming ? (
        <button type="button" className="btn btn-coin mt-3 w-full" disabled={!target || busy} onClick={() => setConfirming(true)}>
          おためしの きろくを ひきつぐ
        </button>
      ) : (
        <div className="mt-3 rounded-xl border-2 border-[var(--volt)] p-3" role="alertdialog" aria-labelledby="trial-carry-confirm">
          <p id="trial-carry-confirm" className="text-sm font-bold">
            おためしの記録を{target?.nickname}さんに引き継ぎます。引き継いだ記録は元に戻せません。よろしいですか？
          </p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn btn-coin flex-1" disabled={busy} onClick={() => void carry()}>{busy ? "引き継いでいます…" : "引き継ぐ"}</button>
            <button type="button" className="btn btn-ghost flex-1" disabled={busy} onClick={() => setConfirming(false)}>やめる</button>
          </div>
        </div>
      )}
    </section>
  );
}
