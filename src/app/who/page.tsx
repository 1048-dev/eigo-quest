"use client";
/**
 * だれが あそぶ？ — 子どもが自分のカードを えらぶ画面（暗証番号は いらない）。
 * こどもの ついか・おうちの方のページは 暗証番号を通る。
 * この端末に おためしの きろくが あれば、えらんだあと1回だけ「ひきつぐ？」と きく（TrialCarryDialog）。
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChildAvatar } from "@/components/account/ChildAvatar";
import { TrialCarryDialog } from "@/components/account/TrialCarryDialog";
import { PinDialog } from "@/components/account/PinPad";
import { StandingFigure } from "@/components/characters/StandingArt";
import { AUTH_LIMITS, ChildResponseSchema, type AuthMeResponse, type Child } from "@/lib/api/contracts";
import { shouldOfferCarryOver } from "@/lib/offline/trialLog";
import { avatarFor, fetchMe, gradeLabel, notifyAccountChanged, rememberTrial, sendJson } from "@/lib/auth/client";

export default function WhoPage() {
  const router = useRouter();
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [offline, setOffline] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pinFor, setPinFor] = useState<null | "add" | "parent">(null);
  const [carryFor, setCarryFor] = useState<{ child: Child; index: number } | null>(null);

  const load = useCallback(() => {
    void fetchMe().then((r) => {
      setOffline(!r.ok || !!r.data.offline);
      setMe(r.data);
    });
  }, []);
  useEffect(load, [load]);

  const choose = async (id: string) => {
    setBusyId(id);
    setError(null);
    const r = await sendJson("POST", `/api/children/${encodeURIComponent(id)}/select`, ChildResponseSchema);
    if (r.ok && r.data.ok) {
      notifyAccountChanged();
      const index = me?.children.findIndex((c) => c.id === id) ?? -1;
      // この端末で おためしで あそんでいたら、さきに「ひきつぐ？」を きく（端末ごとに1回）
      if (index >= 0 && me && shouldOfferCarryOver()) { setCarryFor({ child: me.children[index], index }); return; }
      router.push("/map");
      return;
    }
    setBusyId(null);
    setError(r.error ?? "うまく いかなかったよ。もう一回 ためしてね。");
    load();
  };

  const toParent = (target: "add" | "parent") => {
    if (me?.pinUnlocked) router.push(target === "add" ? "/parent?add=1" : "/parent");
    else setPinFor(target);
  };

  const trial = () => { rememberTrial(); router.push("/map"); };

  if (!me) return <p className="rpg-title p-8 text-center text-xl">よみこみちゅう…</p>;

  // ログインしていない（cookie 切れ・DB 停止）
  if (!me.loggedIn) {
    return (
      <div className="space-y-4 pt-6">
        <section className="card rpg-rivets p-5 text-center">
          <div className="flex justify-center" aria-hidden><StandingFigure id="birimo" mood="worried" height={110} /></div>
          <h1 className="rpg-title mt-2 text-xl">{offline ? "いまは アカウントに つながらないよ" : "ログインが ひつようだよ"}</h1>
          <p className="mt-2 text-sm text-[var(--ink-2)]">
            {offline ? "おためしモードなら このまま あそべるよ。" : "おうちの方に ログインして もらってね。"}
          </p>
          <div className="mt-4 grid gap-3">
            <button type="button" onClick={trial} className="btn btn-primary">おためしで あそぶ</button>
            {!offline && <Link href="/login" className="btn btn-coin">おうちの方：ログイン</Link>}
          </div>
        </section>
      </div>
    );
  }

  const full = me.children.length >= AUTH_LIMITS.maxChildren;

  return (
    <div className="space-y-5 pb-6 pt-2">
      <header className="text-center">
        <p className="title-metal text-sm">英語クエスト</p>
        <h1 className="rpg-title text-3xl">だれが あそぶ？</h1>
        <p className="mt-1 text-sm text-[var(--on-dark-2)]">じぶんの カードを タッチしてね</p>
      </header>

      {error && <p role="alert" className="speech px-3 py-2 text-center text-sm font-bold">{error}</p>}

      {me.children.length === 0 ? (
        <section className="card rpg-rivets p-5 text-center">
          <div className="flex justify-center" aria-hidden><StandingFigure id="haru" pose="wave" height={120} /></div>
          <p className="mt-2 font-black">まだ だれも いないよ。</p>
          <p className="mt-1 text-sm text-[var(--ink-2)]">おうちの方に こどもを ついか して もらおう！</p>
        </section>
      ) : (
        <ul className="grid grid-cols-2 gap-3" aria-label="あそぶ人">
          {me.children.map((c, i) => {
            const a = avatarFor(c.id, i, c.avatarCharacter);
            const selected = c.id === me.selectedChildId;
            return (
              <li key={c.id}>
                <button type="button" onClick={() => choose(c.id)} disabled={busyId !== null}
                  aria-label={`${c.nickname}さん ${gradeLabel(c.schoolGrade)}${selected ? "（いま えらばれているよ）" : ""}`}
                  className={`card relative flex w-full flex-col items-center gap-2 px-2 pb-3 pt-4 transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-3 focus-visible:outline-[var(--volt)] ${selected ? "shadow-[0_0_0_3px_var(--volt),0_0_24px_rgba(255,216,58,.5)]" : ""} ${busyId === c.id ? "animate-pulse" : ""}`}>
                  {selected && <span className="absolute right-2 top-2 rounded-full bg-[var(--volt)] px-2 text-[10px] font-black text-[#2a1a03]">いま</span>}
                  <span className="bob" style={{ animationDelay: `${(c.id.charCodeAt(0) % 5) * 0.2}s` }}><ChildAvatar childId={c.id} index={i} avatar={c.avatarCharacter} size={76} /></span>
                  <span className="w-full truncate text-center text-lg font-black" style={{ textShadow: `0 0 12px ${a.ring}` }}>{c.nickname}</span>
                  {c.schoolGrade && <span className="rounded-full border border-[var(--gold)]/60 bg-black/30 px-2 text-xs font-bold text-[var(--on-dark-2)]">{gradeLabel(c.schoolGrade)}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!full && (
        <button type="button" onClick={() => toParent("add")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--gold)]/70 bg-black/30 py-4 font-black text-[var(--gold-dark)] hover:bg-black/45"
          aria-label="こどもを ついか（おうちの方の暗証番号が必要）">
          <span className="text-2xl leading-none" aria-hidden>＋</span> こどもを ついか
        </button>
      )}

      <div className="flex items-center justify-center gap-4 pt-2 text-xs">
        <button type="button" onClick={() => toParent("parent")} className="rounded-lg border border-[var(--gold)]/50 px-3 py-1.5 font-bold text-[var(--on-dark-2)] hover:text-[var(--volt)]">
          おうちの方
        </button>
      </div>

      {carryFor && (
        <TrialCarryDialog child={carryFor.child} index={carryFor.index} onDone={() => { setCarryFor(null); router.push("/map"); }} />
      )}

      <PinDialog open={pinFor !== null} onClose={() => setPinFor(null)}
        onUnlocked={() => { const t = pinFor; setPinFor(null); router.push(t === "add" ? "/parent?add=1" : "/parent"); }}
        onNotLoggedIn={() => { setPinFor(null); load(); }} />
    </div>
  );
}
