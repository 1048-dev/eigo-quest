"use client";
/**
 * えいごの としょかん（run7 P-library）: レッスンの 外の 毎日の インプット。
 *  - 📖 段階別の おはなし（読み聞かせ＋ハイライト＋3問クイズ）・🎵 うた・チャンツ・💬 AI フリートーク
 *  - 到達レッスンで ひらく。1日1回 スタンプ（つながっていれば 🪙+5）
 *  - おためしモード（サーバーに つながらない）でも ぜんぶ 動く（この ブラウザで クリアした レッスンで ひらく）
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { HeroScene } from "@/components/scene/HeroScene";
import { OfflineNote } from "@/components/common/OfflineNote";
import { CompanionBubble } from "@/components/game/CompanionBubble";
import { Portrait } from "@/components/characters/CharacterArt";
import { StampCard } from "@/components/library/StampCard";
import { LIBRARY_INDEX } from "@/lib/library/catalog";
import { loadLibraryState, type LibraryState } from "@/lib/library/client";
import { readStoryIds } from "@/lib/library/localLibrary";
import { isTalkUnlocked, isUnlocked, nextToUnlock, recommendedStory } from "@/lib/library/rules";
import { LIBRARY_RULES } from "@/lib/domain/config";
import { stageDef } from "@/lib/curriculum/stages";
import type { StoryMeta } from "@/lib/library/types";

type Tab = "story" | "chant" | "talk";
const TABS: { id: Tab; label: string }[] = [
  { id: "story", label: "📖 おはなし" },
  { id: "chant", label: "🎵 うた・チャンツ" },
  { id: "talk", label: "💬 フリートーク" },
];

function Lock({ lesson }: { lesson: number }) {
  return <span className="shrink-0 rounded-lg bg-black/10 px-2 py-1 text-center text-[11px] font-bold leading-tight" aria-label={`Lesson ${lesson} で ひらく`}>🔒 L{lesson}<br />で ひらく</span>;
}

function StoryRow({ s, open, best }: { s: StoryMeta; open: boolean; best?: number }) {
  const body = (
    <>
      <span className="text-3xl" aria-hidden>{open ? s.emoji : "📕"}</span>
      <span className="min-w-0 flex-1">
        <span lang="en" className="block text-base font-black leading-snug">{s.title}</span>
        <span className="block truncate text-xs text-[var(--ink-2)]">{s.titleJa}・{s.level}・やく{s.minutes}ぷん</span>
      </span>
      {open ? (
        <span className="shrink-0 text-sm font-black" aria-label={best !== undefined ? `よんだ（${best}もん せいかい）` : "まだ よんでいない"}>
          {best !== undefined ? "⭐".repeat(Math.max(1, best)) : "▶"}
        </span>
      ) : <Lock lesson={s.unlockLesson} />}
    </>
  );
  return open
    ? <Link href={`/library/story/${s.id}`} className="card flex items-center gap-3 p-3">{body}</Link>
    : <div className="card flex items-center gap-3 p-3 opacity-60" aria-disabled>{body}</div>;
}

export default function LibraryPage() {
  const [state, setState] = useState<LibraryState | null>(null);
  const [tab, setTab] = useState<Tab>("story");

  useEffect(() => {
    let alive = true;
    void loadLibraryState().then((s) => { if (alive) setState(s); });
    return () => { alive = false; };
  }, []);

  const readIds = useMemo(() => (state ? readStoryIds(state.local) : new Set<string>()), [state]);

  if (!state) return <p className="rpg-title p-8 text-center text-xl">としょかんを よみこみちゅう…</p>;

  const reached = state.reachedLesson;
  const stories = LIBRARY_INDEX.stories;
  const pick = recommendedStory(stories, reached, readIds);
  const nextStory = nextToUnlock(stories, reached);
  const openCount = stories.filter((s) => isUnlocked(s, reached)).length;
  const stages = [...new Set(stories.map((s) => s.stage))].sort();
  const talkOpen = reached >= LIBRARY_RULES.freeTalkUnlockLesson;

  return (
    <div className="space-y-5">
      <HeroScene title="えいごの としょかん" subtitle="まいにち すこしずつ えいごに ふれよう" variant="dashboard" />
      <OfflineNote show={state.offline} note="スタンプは この たんまつに のこるよ" />

      <CompanionBubble line={{ mood: "happy", text: `ひらいている おはなしは ${openCount}/${stories.length}こ。${nextStory ? `Lesson ${nextStory.unlockLesson} を クリアすると つぎの おはなしが ひらくよ！` : "ぜんぶ ひらいたね！ すごい！"}` }} />

      <StampCard local={state.local} rewardedToday={state.rewardedToday} dailyCoins={state.dailyCoins} offline={state.offline} />

      {pick && (
        <Link href={`/library/story/${pick.id}`} className="card rpg-rivets flex items-center gap-3 p-4">
          <Portrait id="kiko" size={52} />
          <span className="min-w-0 flex-1">
            <span className="block font-title text-xs text-[var(--gold-dark)]">きょうの おすすめ</span>
            <span lang="en" className="block truncate text-lg font-black">{pick.emoji} {pick.title}</span>
            <span className="block truncate text-xs text-[var(--ink-2)]">{pick.titleJa}</span>
          </span>
          <span className="btn btn-primary shrink-0 px-4">よむ ▶</span>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-2" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
            className={`btn px-1 py-2 text-sm ${tab === t.id ? "btn-coin" : "btn-ghost"}`}>{t.label}</button>
        ))}
      </div>

      {tab === "story" && stages.map((st) => (
        <section key={st} className="space-y-2">
          <h2 className="rpg-title text-lg">ステージ{st}「{stageDef(st).nameJa}」</h2>
          {stories.filter((s) => s.stage === st).map((s) => (
            <StoryRow key={s.id} s={s} open={isUnlocked(s, reached)} best={state.local.stories[s.id]?.best} />
          ))}
        </section>
      ))}

      {tab === "chant" && (
        <section className="space-y-2">
          <p className="text-sm font-bold text-[var(--on-dark-2)]">きいて → まねして。リズムで ことばの かたちを おぼえよう。</p>
          {LIBRARY_INDEX.chants.map((c) => {
            const open = isUnlocked(c, reached);
            const body = (
              <>
                <span className="text-3xl" aria-hidden>{open ? c.emoji : "🎼"}</span>
                <span className="min-w-0 flex-1">
                  <span lang="en" className="block text-base font-black leading-snug">{c.title}</span>
                  <span className="block truncate text-xs text-[var(--ink-2)]">{c.titleJa}・{c.focusJa}</span>
                </span>
                {open ? <span className="shrink-0 text-sm font-black">{state.local.chants[c.id] ? "✅" : "▶"}</span> : <Lock lesson={c.unlockLesson} />}
              </>
            );
            return open
              ? <Link key={c.id} href={`/library/chant/${c.id}`} className="card flex items-center gap-3 p-3">{body}</Link>
              : <div key={c.id} className="card flex items-center gap-3 p-3 opacity-60" aria-disabled>{body}</div>;
          })}
        </section>
      )}

      {tab === "talk" && (
        <section className="space-y-2">
          {!talkOpen && (
            <div className="card p-4 text-center">
              <p className="text-3xl" aria-hidden>🔒</p>
              <p className="font-black">フリートークは Lesson {LIBRARY_RULES.freeTalkUnlockLesson} を クリアすると ひらくよ。</p>
              <p className="mt-1 text-sm text-[var(--ink-2)]">それまでは おはなしと チャンツで えいごを たくさん きこう！</p>
            </div>
          )}
          {talkOpen && <p className="text-sm font-bold text-[var(--on-dark-2)]">すきな テーマを えらんで、キャラと じゆうに おはなし しよう。（なまえ・じゅうしょ・がっこうの なまえは いわないでね）</p>}
          {LIBRARY_INDEX.talks.map((t) => {
            const open = isTalkUnlocked(t, reached);
            const body = (
              <>
                <Portrait id={t.character} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-black leading-snug">{t.emoji} {t.titleJa}</span>
                  <span className="block text-xs text-[var(--ink-2)]">{state.local.talks[t.id] ? "おはなし したよ ✅" : "タップで はじめる"}</span>
                </span>
                {open ? <span className="shrink-0 text-sm font-black">▶</span> : <Lock lesson={Math.max(t.unlockLesson, LIBRARY_RULES.freeTalkUnlockLesson)} />}
              </>
            );
            return open
              ? <Link key={t.id} href={`/library/talk/${t.id}`} className="card flex items-center gap-3 p-3">{body}</Link>
              : <div key={t.id} className="card flex items-center gap-3 p-3 opacity-60" aria-disabled>{body}</div>;
          })}
        </section>
      )}
    </div>
  );
}
