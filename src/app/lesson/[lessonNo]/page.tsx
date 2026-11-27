"use client";
/**
 * 1日1レッスン（約25〜30分）。ここでは データを 読むだけ。画面は LessonPlayer（components/lesson/LessonPlayer.tsx）。
 * サーバーに 届かない ときは 内蔵の 教材（その ワールドの JSON）で そのまま レッスンできる。
 */
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { LessonPlayer, type LoadedLesson } from "@/components/lesson/LessonPlayer";
import { StandingFigure } from "@/components/characters/StandingArt";
import { apiGet, isUnreachable } from "@/lib/api/client";
import { loadOfflineLesson } from "@/lib/offline";
import { LessonResponseSchema } from "@/lib/api/contracts";

export default function LessonPage({ params }: { params: Promise<{ lessonNo: string }> }) {
  const { lessonNo } = use(params);
  const [data, setData] = useState<LoadedLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let alive = true;
    apiGet(`/api/lessons/${encodeURIComponent(lessonNo)}`, LessonResponseSchema).then(async (r) => {
      if (!alive) return;
      if (r.ok && r.data.lesson && r.data.steps.length > 0) { setData(r.data as LoadedLesson); setOffline(!!r.data.offline); return; }
      // サーバーに届かない → 内蔵の教材でそのままレッスンできる（そのワールドの JSON だけを あとから 読む）
      if (isUnreachable(r) || (r.ok && !r.data.lesson)) {
        const o = await loadOfflineLesson(Number(lessonNo)).catch(() => null);
        if (!alive) return;
        if (o?.lesson && o.steps.length > 0) { setData(o as LoadedLesson); setOffline(true); return; }
      }
      // ここに来るのは「まだひらいていない」などゲーム上の理由だけ
      setError(r.error ?? "このレッスンは まだ ひらいていないよ。");
    });
    return () => { alive = false; };
  }, [lessonNo]);

  if (error) {
    return (
      <div className="card rpg-rivets mt-6 flex flex-col items-center p-6 text-center font-bold">
        <StandingFigure id="birimo" mood="worried" height={110} />
        <p className="mt-2">{error}</p>
        <Link href="/map" className="btn btn-primary mt-4 inline-block">マップへ</Link>
      </div>
    );
  }
  if (!data || !data.lesson) return <p className="rpg-title p-8 text-center text-xl">レッスンを よみこみちゅう…</p>;
  return <LessonPlayer key={data.lesson.lessonNo} data={data} offline={offline} />;
}
