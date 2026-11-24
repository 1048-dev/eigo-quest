/**
 * /recap/[lessonNo] — 「きょうのまとめ」（2〜3分・自動再生）。動画ファイルなし、レッスンデータから台本を作る。
 * おまけ（ゲートではない）。完了したレッスンだけ見られる。DB が動いていないときは判定できないので見せる。
 */
import Link from "next/link";
import { StandingFigure } from "@/components/characters/StandingArt";
import { RecapPlayer } from "@/components/recap/RecapPlayer";
import { currentUserId } from "@/lib/auth";
import { getLesson } from "@/lib/curriculum";
import { buildRecapScript } from "@/lib/recap/script";
import { isLessonCompleted } from "@/lib/services/recapService";
import { isDbUp } from "@/lib/db";

export const dynamic = "force-dynamic";

/** 完了判定。DB が止まっている・おそいときは null（＝わからない → 見せる） */
async function completedOrUnknown(lessonNo: number): Promise<boolean | null> {
  try {
    // DB が止まっているのが わかっていれば すぐ「わからない」（キャッシュつきの 1.5秒チェック）
    if (!(await isDbUp())) return null;
    const uid = await currentUserId();
    return await Promise.race([
      isLessonCompleted(uid, lessonNo),
      new Promise<null>((r) => setTimeout(() => r(null), 3000)),
    ]);
  } catch {
    return null;
  }
}

function Message({ text, lessonNo }: { text: string; lessonNo?: number }) {
  return (
    <div className="card rpg-rivets mt-6 flex flex-col items-center p-6 text-center font-bold">
      <StandingFigure id="birimo" mood="worried" height={110} />
      <p className="mt-2">{text}</p>
      {lessonNo != null && <Link href={`/lesson/${lessonNo}`} className="btn btn-coin mt-4 inline-block">Lesson {lessonNo} へ</Link>}
      <Link href="/map" className="btn btn-primary mt-3 inline-block">マップへ</Link>
    </div>
  );
}

export default async function RecapPage({ params }: { params: Promise<{ lessonNo: string }> }) {
  const n = Number((await params).lessonNo);
  const lesson = Number.isInteger(n) ? getLesson(n) : undefined;
  if (!lesson) return <Message text="この まとめは 見つからないよ。" />;

  const completed = await completedOrUnknown(n);
  if (completed === false) return <Message text={`Lesson ${n} を クリアすると、きょうの まとめが 見られるよ！`} lessonNo={n} />;

  return <RecapPlayer script={buildRecapScript(lesson)} offline={completed === null} />;
}
