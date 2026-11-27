"use client";
/**
 * としょかんの おはなし。ここでは データを 読むだけ。画面は StoryView（components/library/StoryView.tsx）。
 * 本文は ステージごとの JSON を この 画面で あとから 読む。おためしモードでも 動く。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { StoryView } from "@/components/library/StoryView";
import { loadStory } from "@/lib/library/catalog";
import { loadLibraryState, type LibraryState } from "@/lib/library/client";
import type { Story } from "@/lib/library/types";

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const [story, setStory] = useState<Story | null | undefined>(undefined);
  const [state, setState] = useState<LibraryState | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([loadStory(id), loadLibraryState()]).then(([s, st]) => {
      if (!alive) return;
      setStory(s);
      setState(st);
    });
    return () => { alive = false; };
  }, [id]);

  if (story === undefined || !state) return <p className="rpg-title p-8 text-center text-xl">おはなしを よみこみちゅう…</p>;
  if (!story) {
    return (
      <div className="card p-6 text-center">
        <p className="font-black">その おはなしは みつからないよ。</p>
        <Link href="/library" className="btn btn-primary mt-4">としょかんへ もどる</Link>
      </div>
    );
  }
  return <StoryView key={story.id} story={story} state={state} />;
}
