"use client";
/**
 * 年に1回の 力だめし（run7 P-yearly）。ここでは データを 読むだけ。画面は YearlyView（components/yearly/YearlyView.tsx）。
 *  - 受ける ステージは 到達レッスンで きまる。問題は その ステージの JSON だけ あとから 読む
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { YearlyView } from "@/components/yearly/YearlyView";
import { loadYearlyTest } from "@/lib/yearly/catalog";
import { loadYearlyState, type YearlyState } from "@/lib/yearly/client";
import type { YearlyTest } from "@/lib/yearly/types";

export default function YearlyPage() {
  const [state, setState] = useState<YearlyState | null>(null);
  const [test, setTest] = useState<YearlyTest | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    void loadYearlyState().then(async (s) => {
      if (!alive) return;
      setState(s);
      const t = await loadYearlyTest(s.stage);
      if (alive) setTest(t);
    });
    return () => { alive = false; };
  }, []);

  if (!state || test === undefined) return <p className="rpg-title p-8 text-center text-xl">力だめしを じゅんびちゅう…</p>;
  if (!test) {
    return (
      <div className="card p-6 text-center">
        <p className="font-black">力だめしの 問題が よみこめなかったよ。</p>
        <Link href="/map" className="btn btn-primary mt-4">マップへ もどる</Link>
      </div>
    );
  }
  return <YearlyView state={state} test={test} />;
}
