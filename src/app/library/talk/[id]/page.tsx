"use client";
/**
 * としょかんの AI フリートーク。ここでは データを 読むだけ。画面は TalkView（components/library/TalkView.tsx）。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { TalkView } from "@/components/library/TalkView";
import { loadTalkTheme } from "@/lib/library/catalog";
import { loadLibraryState, type LibraryState } from "@/lib/library/client";
import type { TalkTheme } from "@/lib/library/types";

export default function TalkPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const router = useRouter();
  const [theme, setTheme] = useState<TalkTheme | null | undefined>(undefined);
  const [state, setState] = useState<LibraryState | null>(null);

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
  if (!theme) {
    return (
      <div className="card p-6 text-center">
        <p className="text-4xl" aria-hidden>🔒</p>
        <p className="font-black">その テーマは みつからないよ。</p>
        <Link href="/library" className="btn btn-primary mt-4">としょかんへ もどる</Link>
      </div>
    );
  }
  return <TalkView key={theme.id} theme={theme} state={state} onLeave={() => router.push("/library")} />;
}
