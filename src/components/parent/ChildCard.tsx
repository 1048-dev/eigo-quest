"use client";
/** 「おうちの方」ページ: お子さま1人分のようすカード（キャラクター・進みぐあい・連続日数・習得率・最終学習日・回数制限・編集・削除） */
import { useState, type FormEvent } from "react";
import { AvatarPicker } from "@/components/account/AvatarPicker";
import { ChildAvatar } from "@/components/account/ChildAvatar";
import { FormMessage, inputClass, TextField } from "@/components/account/Form";
import { Gauge } from "@/components/game/StatusBoard";
import { AUTH_LIMITS, ChildResponseSchema, ParentSettingsResponseSchema, AuthResultResponseSchema, type ChildOverview } from "@/lib/api/contracts";
import { avatarFor, sendJson } from "@/lib/auth/client";
import type { AvatarCharacter } from "@/lib/domain/avatars";
import type { ApiResult } from "@/lib/api/client";

export type Guard = <T>(r: ApiResult<T>) => boolean;

const GRADES = [1, 2, 3, 4, 5, 6];

/** "2026-11-25" → 「11月25日（今日）」 */
export function formatStudyDate(d: string | null, today = new Date()): string {
  if (!d) return "まだ学習していません";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d);
  if (!m) return d;
  const date = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = Math.round((base.getTime() - date.getTime()) / 86_400_000);
  const rel = diff === 0 ? "今日" : diff === 1 ? "昨日" : diff > 1 ? `${diff}日前` : "";
  return `${Number(m[2])}月${Number(m[3])}日${rel ? `（${rel}）` : ""}`;
}

export function ChildCard({ child, index, birthYear: initialBirthYear, guard, onChanged, onShowRadar }: {
  child: ChildOverview;
  index: number;
  birthYear: number | null;
  guard: Guard;
  onChanged: (msg?: string) => void;
  onShowRadar: (id: string) => void;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "remove">("view");
  const [nickname, setNickname] = useState(child.nickname);
  const [grade, setGrade] = useState<number>(child.schoolGrade ?? 1);
  const initialAvatar = avatarFor(child.id, index, child.avatarCharacter).id as AvatarCharacter;
  const [avatar, setAvatar] = useState<AvatarCharacter>(initialAvatar);
  const [birthYear, setBirthYear] = useState<string>(initialBirthYear ? String(initialBirthYear) : "");
  const [limit, setLimit] = useState<string>(child.dailyLessonLimit ? String(child.dailyLessonLimit) : "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [removeStep, setRemoveStep] = useState<1 | 2>(1);

  const pct = child.totalLessons > 0 ? Math.round((child.lessonsDone / child.totalLessons) * 100) : 0;

  const saveLimit = async (value: string) => {
    setLimit(value);
    setError(null); setOk(null);
    const r = await sendJson("PATCH", "/api/parent/settings", ParentSettingsResponseSchema, { dailyLessonLimit: { childId: child.id, limit: value ? Number(value) : null } });
    if (!guard(r)) return;
    if (r.ok && r.data.ok) setOk(value ? `1日 ${value}回までにしました。` : "回数の制限をなくしました。");
    else { setError(r.error ?? "保存できませんでした。"); setLimit(child.dailyLessonLimit ? String(child.dailyLessonLimit) : ""); }
  };

  const saveEdit = async (ev: FormEvent) => {
    ev.preventDefault();
    setError(null);
    const name = nickname.trim();
    if (!name || name.length > AUTH_LIMITS.nicknameMax) { setError(`ニックネームは1〜${AUTH_LIMITS.nicknameMax}文字で入力してください。`); return; }
    const by = birthYear.trim();
    if (by && !/^(20\d{2})$/.test(by)) { setError("生まれ年は西暦4けたで入力してください（空欄でもかまいません）。"); return; }
    setBusy(true);
    const body = { nickname: name, schoolGrade: grade, birthYear: by ? Number(by) : null, avatarCharacter: avatar };
    const r = await sendJson("PATCH", `/api/children/${encodeURIComponent(child.id)}`, ChildResponseSchema, body);
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) { setMode("view"); onChanged(r.data.messageJa || "変更を保存しました。"); }
    else setError(r.error ?? "保存できませんでした。");
  };

  const remove = async () => {
    setBusy(true);
    setError(null);
    const r = await sendJson("DELETE", `/api/children/${encodeURIComponent(child.id)}`, AuthResultResponseSchema);
    setBusy(false);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) onChanged(r.data.messageJa || "削除しました。");
    else setError(r.error ?? "削除できませんでした。");
  };

  return (
    <article className="card p-4" aria-labelledby={`child-${child.id}`}>
      <div className="flex items-center gap-3">
        <ChildAvatar childId={child.id} index={index} avatar={child.avatarCharacter} size={52} />
        <div className="min-w-0 flex-1">
          <h3 id={`child-${child.id}`} className="truncate text-lg font-black">{child.nickname} さん</h3>
          <p className="text-xs text-[var(--ink-2)]">{child.schoolGrade ? `小学${child.schoolGrade}年生` : "学年未設定"}・最終学習 {formatStudyDate(child.lastStudyDate)}</p>
        </div>
      </div>

      {/* run7: いまの ステージ・レベル と 学校の英語（保護者向けの めやす） */}
      <div className="mt-3 rounded-xl border border-[var(--gold)]/50 bg-black/25 p-2 text-sm">
        <p className="font-black">
          ステージ{child.stage}{child.stageNameJa ? `「${child.stageNameJa}」` : ""}
          {child.level && <span className="ml-1 rounded bg-[var(--sky)]/20 px-1.5 py-0.5 text-xs text-[var(--sky)]">{child.level}</span>}
        </p>
        <p className="mt-0.5 text-xs text-[var(--ink-2)]">{child.schoolLineJa}・覚えた ことば {child.wordsLearned}語</p>
      </div>

      <div className="mt-3">
        <Gauge label="レッスンの進みぐあい" value={child.lessonsDone} max={child.totalLessons} color="linear-gradient(90deg,#5fe39a,#e8b63a)" right={`${child.lessonsDone} / ${child.totalLessons}（${pct}%）`} />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { k: "連続学習", v: `${child.streakDays}日`, s: `最長 ${child.longestStreak}日` },
          { k: "総合習得率", v: `${child.masteryOverall}%`, s: "6つの力の平均" },
          { k: "今日のレッスン", v: `${child.lessonsToday}回`, s: child.dailyLessonLimit ? `上限 ${child.dailyLessonLimit}回` : "上限なし" },
        ].map((x) => (
          <div key={x.k} className="rounded-xl border border-[var(--gold)]/50 bg-black/25 px-1 py-1.5">
            <dt className="text-[10px] font-bold text-[var(--on-dark-2)]">{x.k}</dt>
            <dd className="font-title text-lg leading-tight text-[var(--volt)] tabular-nums">{x.v}</dd>
            <dd className="text-[10px] text-[var(--ink-2)]">{x.s}</dd>
          </div>
        ))}
      </dl>

      {child.weakestSkills.length > 0 && (
        <p className="mt-3 text-xs text-[var(--ink-2)]">
          <span className="font-black text-[var(--on-dark)]">伸ばしたい力：</span>
          {child.weakestSkills.map((w) => `${w.labelJa}（${w.score}%）`).join("、")}
        </p>
      )}

      <button type="button" onClick={() => onShowRadar(child.id)} className="mt-3 w-full rounded-xl border border-[var(--sky)]/60 bg-[var(--sky)]/10 py-2 text-sm font-black text-[var(--sky)] hover:bg-[var(--sky)]/20">
        6つの力のレーダーを見る →
      </button>

      <div className="mt-3 flex items-center gap-2 rounded-xl bg-black/25 p-2">
        <label htmlFor={`limit-${child.id}`} className="flex-1 text-sm font-bold">1日のレッスン回数</label>
        <select id={`limit-${child.id}`} value={limit} onChange={(e) => void saveLimit(e.target.value)} className={`${inputClass} !w-32 !py-1.5 text-sm`}>
          <option value="">制限なし</option>
          {Array.from({ length: AUTH_LIMITS.dailyLessonLimitMax }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}回まで</option>)}
        </select>
      </div>

      <div className="mt-2"><FormMessage error={mode === "view" ? error : null} ok={mode === "view" ? ok : null} /></div>

      {mode === "view" && (
        <div className="mt-2 flex gap-2">
          <button type="button" className="btn btn-ghost flex-1 !px-2 !py-2 text-sm" onClick={() => { setMode("edit"); setError(null); setOk(null); }}>編集</button>
          <button type="button" className="btn btn-ghost flex-1 !px-2 !py-2 text-sm btn-danger-text" onClick={() => { setMode("remove"); setRemoveStep(1); setError(null); setOk(null); }}>削除</button>
        </div>
      )}

      {mode === "edit" && (
        <form onSubmit={saveEdit} className="mt-3 space-y-3 rounded-xl border border-[var(--gold)]/40 bg-black/25 p-3" aria-label={`${child.nickname}さんの情報を編集`}>
          <FormMessage error={error} />
          <TextField label="ニックネーム" value={nickname} maxLength={AUTH_LIMITS.nicknameMax} onChange={(e) => setNickname(e.target.value)} hint={`${AUTH_LIMITS.nicknameMax}文字まで。本名でなくてかまいません。`} />
          <GradeSelect value={grade} onChange={setGrade} id={`grade-${child.id}`} />
          <AvatarPicker name={`avatar-${child.id}`} legend="キャラクター（お子さまの画面でも変えられます）" value={avatar} onChange={setAvatar} size={40} />
          <TextField label="生まれ年（西暦・任意）" inputMode="numeric" placeholder="例：2018" maxLength={4} value={birthYear} onChange={(e) => setBirthYear(e.target.value.normalize("NFKC").replace(/\D/g, ""))} />
          <div className="flex gap-2">
            <button type="submit" className="btn btn-coin flex-1 !py-2" disabled={busy}>保存</button>
            <button type="button" className="btn btn-ghost flex-1 !py-2" onClick={() => { setMode("view"); setNickname(child.nickname); setGrade(child.schoolGrade ?? 1); setAvatar(initialAvatar); setError(null); }}>やめる</button>
          </div>
        </form>
      )}

      {mode === "remove" && (
        <div className="mt-3 space-y-3 rounded-xl border-2 border-[var(--ng)]/70 bg-[var(--ng)]/10 p-3" role="group" aria-label={`${child.nickname}さんを削除`}>
          <FormMessage error={error} />
          {removeStep === 1 ? (
            <>
              <p className="text-sm font-bold">{child.nickname}さんの情報と、これまでの学習記録（レッスン・コイン・モンスターなど）をすべて削除します。元に戻すことはできません。</p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-berry flex-1 !py-2 text-sm" onClick={() => setRemoveStep(2)}>削除にすすむ</button>
                <button type="button" className="btn btn-ghost flex-1 !py-2 text-sm" onClick={() => setMode("view")}>やめる</button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-black">本当に {child.nickname}さんを削除しますか？</p>
              <div className="flex gap-2">
                <button type="button" className="btn btn-berry flex-1 !py-2 text-sm" disabled={busy} onClick={() => void remove()}>{busy ? "削除しています…" : "削除する"}</button>
                <button type="button" className="btn btn-ghost flex-1 !py-2 text-sm" onClick={() => setMode("view")}>やめる</button>
              </div>
            </>
          )}
        </div>
      )}
    </article>
  );
}

export function GradeSelect({ value, onChange, id }: { value: number; onChange: (g: number) => void; id: string }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-black">学年</legend>
      <div className="grid grid-cols-6 gap-1.5" role="radiogroup">
        {GRADES.map((g) => (
          <label key={g} className={`cursor-pointer rounded-lg border-2 py-1.5 text-center text-sm font-black transition ${value === g ? "border-[var(--volt)] bg-[var(--volt)]/20 text-[var(--volt)]" : "border-[var(--gold)]/40 bg-black/30"}`}>
            <input type="radio" name={id} value={g} checked={value === g} onChange={() => onChange(g)} className="sr-only" />
            {g}<span className="text-[10px]">年</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
