"use client";
/**
 * としょかんの うた・チャンツ。ここでは データを 読むだけ。画面は ChantView（components/library/ChantView.tsx）。おためしモードでも 動く。
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChantView } from "@/components/library/ChantView";
import { loadChant } from "@/lib/library/catalog";
import { loadLibraryState, type LibraryState } from "@/lib/library/client";
import type { Chant } from "@/lib/library/types";

export default function ChantPage() {
  const params = useParams<{ id: string }>();
  const id = String(params?.id ?? "");
  const [chant, setChant] = useState<Chant | null | undefined>(undefined);
  const [state, setState] = useState<LibraryState | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all([loadChant(id), loadLibraryState()]).then(([c, st]) => {
      if (!alive) return;
      setChant(c);
      setState(st);
    });
    return () => { alive = false; };
  }, [id]);

  if (chant === undefined || !state) return <p className="rpg-title p-8 text-center text-xl">うたを よみこみちゅう…</p>;
  if (!chant) {
    return (
      <div className="card p-6 text-center">
        <p className="text-4xl" aria-hidden>🔒</p>
        <p className="font-black">その チャンツは みつからないよ。</p>
        <Link href="/library" className="btn btn-primary mt-4">としょかんへ もどる</Link>
      </div>
    );
  }
  return <ChantView key={chant.id} chant={chant} state={state} />;
}
