"use client";
/**
 * としょかんの AI フリートーク: テーマを えらんで キャラと じゆうに 話す（さいだい 6 回）。
 *  - 返事は /api/library/talk（AI。使えない ときは 台本）。サーバーに つながらない ときは ブラウザで 台本の 返事
 *  - 3回 以上 話したら 1日1回 スタンプ（＋ コイン）
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ConversationStep } from "@/components/lesson/ConversationStep";
import { OfflineNote } from "@/components/common/OfflineNote";
import { loadTalkTheme } from "@/lib/library/catalog";
import { finishActivity, loadLibraryState, type FinishResult, type LibraryState } from "@/lib/library/client";
import { isTalkUnlocked } from "@/lib/library/rules";
import { FREE_TALK_TURNS, themeConversation } from "@/lib/library/talk";
import { LIBRARY_RULES } from "@/lib/domain/config";
import type { TalkTheme } from "@/lib/library/types";

export default function TalkPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const router = useRouter();
  const [theme, setTheme] = useState<TalkTheme | null | undefined>(undefined);
  const [state, setState] = useState<LibraryState | null>(null);
  const [result, setResult] = useState<(FinishResult & { turns: number }) | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let alive = true;
    void Promise.all([loadTalkTheme(id), loadLibraryState()]).then(([t, st]) => {
      if (!alive) return;
      setTheme(t);
      setState(st);
    });
    return () => { alive = false; };
  }, [id]);

  if (theme === undefined || !state) return <p className="rpg-title p-8 text-center text-xl">フリートークを よみこみちゅう…</p>;
  if (!theme || !isTalkUnlocked(theme, state.reachedLesson)) {
    const lesson = Math.max(theme?.unlockLesson ?? 0, LIBRARY_RULES.freeTalkUnlockLesson);
    return (
      <div className="card p-6 text-center">
        <p className="text-4xl" aria-hidden>🔒</p>
        <p className="font-black">{theme ? `この テーマは Lesson ${lesson} を クリアすると ひらくよ。` : "その テーマは みつからないよ。"}</p>
        <Link href="/library" className="btn btn-primary mt-4">としょかんへ もどる</Link>
      </div>
    );
  }

  const onDone = async (turns: number) => {
    if (turns === 0) { router.push("/library"); return; }
    const r = await finishActivity({ kind: "talk", id: theme.id, turns }, null, state.offline);
    setResult({ ...r, turns });
  };

  return (
    <div className="space-y-4">
      <OfflineNote show={state.offline} note="AI の かわりに だいほんで おへんじ するよ" />
      <Link href="/library" className="text-sm font-bold text-[var(--on-dark-2)] underline">◀ としょかん</Link>
      <h1 className="rpg-title text-center text-2xl">{theme.emoji} {theme.titleJa}</h1>

      {result ? (
        <div className="card p-6 text-center">
          <p className="text-4xl" aria-hidden>{result.completed ? "🎉" : "🙂"}</p>
          <p className="font-black">{result.turns}かい おはなし したよ！</p>
          <p className="mt-1 font-bold">{result.completed ? result.messageJa : `${LIBRARY_RULES.talkMinTurns}かい いじょう はなすと スタンプが もらえるよ。`}</p>
          <div className="mt-4 grid gap-2">
            <button className="btn btn-ghost w-full" onClick={() => { setResult(null); setRound((r) => r + 1); }}>🔁 もういちど はなす</button>
            <Link href="/library" className="btn btn-primary w-full">としょかんへ もどる</Link>
          </div>
        </div>
      ) : (
        <ConversationStep
          key={round}
          lessonNo={1}
          conversation={themeConversation(theme)}
          character={theme.character}
          maxTurns={FREE_TALK_TURNS}
          items={[]}
          onDone={(_logs, _finished, turns) => void onDone(turns)}
          variant={{
            endpoint: { url: "/api/library/talk", body: { themeId: theme.id } },
            coinNote: `${LIBRARY_RULES.talkMinTurns}かい いじょう はなすと きょうの スタンプ${state.offline ? "" : `（🪙+${state.dailyCoins}・1日1かい）`}`,
            doneText: "おはなし おしまい！",
            doneLabel: "おわる ▶",
            skipLabel: "としょかんへ もどる",
          }}
        />
      )}
    </div>
  );
}
