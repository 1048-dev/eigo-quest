"use client";
/**
 * 「おためしで あそんだ きろくを ひきつぐ？」— 子どもを えらんだあと、この端末で1回だけ きく。
 *  - ひきつぐもの: ブラウザの おためしの きろく（オフライン分）＋ この端末の おためし学習者（DB）の きろく（server）
 *  - はい → サーバーに送る（その子に たす）→ 端末の きろくを けす
 *  - いいえ → この きろくについては もう きかない（「おうちの方」ページの ボタンなら あとでも ひきつげる）
 *  - つながらない → きろくは のこして、つぎに えらんだときに また きく
 */
import { useMemo, useState } from "react";
import { ChildAvatar } from "@/components/account/ChildAvatar";
import { StandingFigure } from "@/components/characters/StandingArt";
import type { Child, TrialCarryResponse } from "@/lib/api/contracts";
import { carryTrialTo } from "@/lib/auth/client";
import { markCarryDeclined, readTrialCarryData, type ServerTrialStatus } from "@/lib/offline/trialLog";

/** ブラウザ と サーバーの きろくを あわせた 数（同じ レッスンは 1こ。サーバーの分は おおよそ） */
export function trialCounts(server: ServerTrialStatus | null) {
  const data = readTrialCarryData();
  const s = server?.hasProgress ? server : null;
  return {
    lessons: Math.max(Object.keys(data.lessons).length, s?.lessons ?? 0),
    tests: Math.max(Object.keys(data.tests).length, s?.tests ?? 0),
    coins: data.coins + (s?.coins ?? 0),
  };
}

export function TrialCarryDialog({ child, index, server, onDone }: { child: Child; index: number; server: ServerTrialStatus | null; onDone: () => void }) {
  const { lessons, tests, coins } = useMemo(() => trialCounts(server), [server]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<TrialCarryResponse | null>(null);

  const yes = async () => {
    setBusy(true);
    setError(null);
    const r = await carryTrialTo(child.id);
    setBusy(false);
    if (r.ok && r.data.ok) { setDone(r.data); return; }
    setError(r.error ?? "いまは ひきつげないみたい。また あとで きくね。");
  };

  const no = () => { markCarryDeclined(server); onDone(); };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div role="dialog" aria-modal="true" aria-labelledby="carry-title" className="card rpg-rivets w-full max-w-sm p-5 text-center">
        <div className="flex items-end justify-center gap-2" aria-hidden>
          <StandingFigure id="birimo" pose={done ? "wave" : undefined} mood={done ? "happy" : undefined} height={88} />
          <ChildAvatar childId={child.id} index={index} avatar={child.avatarCharacter} size={56} />
        </div>

        {done ? (
          <>
            <h2 id="carry-title" className="rpg-title mt-2 text-xl">{done.alreadyCarried ? "もう ひきついで あるよ" : done.nothing ? "ひきつぐ きろくは なかったよ" : "ひきついだよ！"}</h2>
            {!done.alreadyCarried && !done.nothing && (
              <ul className="mt-3 space-y-1 text-sm font-bold">
                <li>レッスン {done.carried.lessons}こ</li>
                {done.carried.tests > 0 && <li>テスト ごうかく {done.carried.tests}こ</li>}
                <li>コイン +{done.carried.coins}</li>
                {done.carried.monsters > 0 && <li>モンスター {done.carried.monsters}しゅるい</li>}
              </ul>
            )}
            <p className="mt-2 text-xs text-[var(--ink-2)]">{child.nickname}さんの きろくに なったよ。</p>
            <button type="button" className="btn btn-primary mt-4 w-full" onClick={onDone}>マップへ いく</button>
          </>
        ) : (
          <>
            <h2 id="carry-title" className="rpg-title mt-2 text-xl">おためしで あそんだ きろくを ひきつぐ？</h2>
            <p className="mt-2 text-sm">
              この たんまつで あそんだ <span className="font-black text-[var(--volt)]">レッスン {lessons}こ</span>
              {tests > 0 && <>・<span className="font-black text-[var(--volt)]">テスト {tests}こ</span></>}
              {coins > 0 && <>・<span className="font-black text-[var(--volt)]">コイン {coins}</span></>}
              {" "}を、<span className="font-black">{child.nickname}さん</span>の きろくに するよ。
            </p>
            <p className="mt-1 text-xs text-[var(--ink-2)]">おうちの方と いっしょに きめてね。（あとからでも「おうちの方」の ページで ひきつげるよ）</p>
            {error && <p role="alert" className="speech mt-3 px-3 py-2 text-sm font-bold">{error}</p>}
            <div className="mt-4 grid gap-2">
              <button type="button" className="btn btn-coin" disabled={busy} onClick={() => void yes()}>{busy ? "ひきついでいるよ…" : "はい、ひきつぐ"}</button>
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={error ? onDone : no}>{error ? "あとで" : "いいえ、ひきつがない"}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
