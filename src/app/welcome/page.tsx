"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HeroScene } from "@/components/scene/HeroScene";
import { PeekCharacter } from "@/components/scene/Peek";
import { LineLoginButton } from "@/components/account/LineLoginButton";
import { fetchMe, rememberTrial } from "@/lib/auth/client";

/** スタート画面: おうちの方の とうろく・ログイン ／ おためしで あそぶ */
export default function WelcomePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [lineAvailable, setLineAvailable] = useState(false);

  useEffect(() => {
    void fetchMe().then((r) => {
      setLoggedIn(r.ok && r.data.loggedIn);
      setLineAvailable(r.ok && r.data.lineLoginAvailable);
    });
  }, []);

  const trial = () => {
    rememberTrial();
    router.push("/map");
  };

  return (
    <div className="space-y-5 pb-6">
      <HeroScene title="英語クエスト" subtitle="ハルたちと まいにち えいごの だいぼうけん！" variant="map" />

      {loggedIn && (
        <Link href="/who" className="btn btn-primary block w-full text-center text-lg">つづきから あそぶ</Link>
      )}

      <section className="card rpg-rivets relative mt-12 p-5" aria-labelledby="parent-start">
        <PeekCharacter id="riko" pose="wave" place="top-right" />
        <h2 id="parent-start" className="rpg-title text-lg">おうちの方へ</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
          保護者の方が登録すると、お子さまごとに学習の記録が残り、進みぐあいを確認できます（お子さまは6人まで登録できます）。
        </p>
        <div className="mt-4 grid gap-3">
          {lineAvailable && <LineLoginButton label="LINEで ログイン・とうろく" />}
          <Link href="/register" className="btn btn-coin block text-center">おうちの方：とうろく</Link>
          <Link href="/login" className="btn btn-ghost block text-center">おうちの方：ログイン</Link>
        </div>
      </section>

      <section className="card rpg-rivets relative mt-12 p-5" aria-labelledby="trial-start">
        <PeekCharacter id="haru" pose="point" place="top-left" />
        <h2 id="trial-start" className="rpg-title text-right text-lg">すぐに あそびたい？</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--ink-2)]">
          とうろく しなくても、すぐに ぼうけんを はじめられるよ。
        </p>
        <button type="button" onClick={trial} className="btn btn-primary mt-4 block w-full text-lg">おためしで あそぶ</button>
      </section>
    </div>
  );
}
