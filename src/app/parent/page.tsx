"use client";
/**
 * おうちの方のページ（保護者PINが必要）
 *  - お子さまごとのようす（進みぐあい・連続日数・習得率・最終学習日）と 6つの力のレーダーへのリンク
 *  - お子さまの追加・編集・削除、1日のレッスン回数
 *  - 暗証番号・パスワードの変更、ログアウト、退会（2段階の確認）
 * どの API でも PIN の期限切れ（PIN_REQUIRED）なら暗証番号パッドに戻り、ログイン切れならログイン画面へ。
 */
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { AccountHeader, FormMessage } from "@/components/account/Form";
import { PinPad } from "@/components/account/PinPad";
import { ChildCard, type Guard } from "@/components/parent/ChildCard";
import { AddChildForm, ChangePasswordForm, ChangePinForm, DeleteAccountPanel } from "@/components/parent/SettingsPanels";
import { apiGet } from "@/lib/api/client";
import {
  AUTH_LIMITS, AuthResultResponseSchema, ChildResponseSchema, ParentOverviewResponseSchema,
  type AuthMeResponse, type ChildOverview,
} from "@/lib/api/contracts";
import { avatarFor, codeOf, fetchMe, isAccountOffline, notifyAccountChanged, sendJson } from "@/lib/auth/client";

type Phase = "loading" | "locked" | "ready" | "offline" | "deleted";

export default function ParentPageWrapper() {
  return (
    <Suspense fallback={<p className="rpg-title p-8 text-center text-xl">読み込み中…</p>}>
      <ParentPage />
    </Suspense>
  );
}

function ParentPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("loading");
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [children, setChildren] = useState<ChildOverview[]>([]);
  const [showAdd, setShowAdd] = useState(params.get("add") === "1");
  const [notice, setNotice] = useState<string | null>(params.get("welcome") === "1" ? "ご登録ありがとうございます。まずはお子さまを追加してください。" : null);
  const [error, setError] = useState<string | null>(null);

  /** API の結果を見て、PIN 切れ・ログイン切れ・DB 停止なら画面を切りかえる。続けてよければ true */
  const guard: Guard = useCallback((r) => {
    const code = codeOf(r);
    if (code === "NOT_LOGGED_IN") { router.replace("/login"); return false; }
    if (code === "PIN_REQUIRED") { setPhase("locked"); return false; }
    if (isAccountOffline(r)) { setPhase("offline"); return false; }
    return true;
  }, [router]);

  const loadData = useCallback(async () => {
    // ログインを確かめてから ようすを読む（未ログイン・DB 停止のときに むだな 401/503 を出さない）
    const m = await fetchMe();
    if (!m.ok || !m.data.loggedIn) {
      if (isAccountOffline(m) || m.data.offline) { setPhase("offline"); return; }
      router.replace("/login");
      return;
    }
    setMe(m.data);
    if (!m.data.pinUnlocked) { setPhase("locked"); return; }
    const o = await apiGet("/api/parent/overview", ParentOverviewResponseSchema);
    if (!guard(o)) return;
    if (!o.ok) { setError(o.error ?? "情報を読み込めませんでした。"); setPhase("ready"); return; }
    setChildren(o.data.children);
    setPhase("ready");
  }, [guard, router]);

  useEffect(() => { void loadData(); }, [loadData]);

  const refresh = (msg?: string) => {
    setNotice(msg ?? null);
    notifyAccountChanged();
    void loadData();
  };

  const showRadar = async (id: string) => {
    const r = await sendJson("POST", `/api/children/${encodeURIComponent(id)}/select`, ChildResponseSchema);
    if (!guard(r)) return;
    if (r.ok && r.data.ok) { notifyAccountChanged(); router.push("/dashboard"); }
    else setError(r.error ?? "表示できませんでした。");
  };

  const logout = async () => {
    await sendJson("POST", "/api/auth/logout", AuthResultResponseSchema);
    notifyAccountChanged();
    router.replace("/welcome");
  };

  if (phase === "loading") return <p className="rpg-title p-8 text-center text-xl">読み込み中…</p>;

  if (phase === "offline") {
    return (
      <div className="pb-6">
        <AccountHeader title="おうちの方のページ" back={{ href: "/map", label: "ゲームにもどる" }} />
        <section className="card p-5">
          <p className="font-bold">ただいまアカウント機能を利用できません。しばらくしてからもう一度お試しください。</p>
          <p className="mt-1 text-sm text-[var(--ink-2)]">おためしモードはそのまま遊べます。</p>
          <button type="button" className="btn btn-coin mt-4 w-full" onClick={() => { setPhase("loading"); void loadData(); }}>もう一度読み込む</button>
        </section>
      </div>
    );
  }

  if (phase === "deleted") {
    return (
      <div className="pb-6">
        <AccountHeader title="退会が完了しました" />
        <section className="card p-5">
          <p className="font-bold">アカウントとすべての学習記録を削除しました。ご利用ありがとうございました。</p>
          <Link href="/welcome" className="btn btn-coin mt-4 block text-center">スタート画面へ</Link>
        </section>
      </div>
    );
  }

  if (phase === "locked") {
    return (
      <div className="pb-6">
        <AccountHeader title="おうちの方のページ" sub="保護者用の暗証番号（4けた）を入力してください。" back={{ href: "/who", label: "もどる" }} />
        <section className="card rpg-rivets p-5">
          <PinPad onUnlocked={() => { setPhase("loading"); void loadData(); }} onNotLoggedIn={() => router.replace("/login")} />
        </section>
      </div>
    );
  }

  const birthYears = new Map((me?.children ?? []).map((c) => [c.id, c.birthYear]));
  const canAdd = children.length < AUTH_LIMITS.maxChildren;

  return (
    <div className="space-y-5 pb-6">
      <AccountHeader title="おうちの方のページ" sub={me?.parent?.email ? `${me.parent.email} でログイン中` : undefined} back={{ href: "/who", label: "お子さまの画面へ" }} />

      <FormMessage error={error} ok={notice} />

      <section aria-labelledby="kids-title" className="space-y-3">
        <div className="flex items-end justify-between">
          <h2 id="kids-title" className="rpg-title text-lg">お子さまのようす</h2>
          <span className="text-xs text-[var(--ink-2)]">{children.length} / {AUTH_LIMITS.maxChildren}人</span>
        </div>
        {children.length === 0 && !showAdd && <p className="card p-4 text-sm">まだお子さまが登録されていません。「お子さまを追加」から登録してください。</p>}
        {children.map((c, i) => (
          <ChildCard key={`${c.id}-${c.nickname}-${c.schoolGrade}-${c.dailyLessonLimit}-${c.avatarCharacter}`} child={c} index={i} birthYear={birthYears.get(c.id) ?? null} guard={guard} onChanged={refresh} onShowRadar={(id) => void showRadar(id)} />
        ))}
      </section>

      <section className="card rpg-rivets relative p-4" aria-labelledby="add-title">
        <h2 id="add-title" className="rpg-title text-lg">お子さまを追加</h2>
        {!canAdd ? (
          <p className="mt-2 text-sm text-[var(--ink-2)]">登録できるお子さまは{AUTH_LIMITS.maxChildren}人までです。</p>
        ) : showAdd ? (
          <div className="mt-3"><AddChildForm guard={guard} siblings={children.map((c, i) => avatarFor(c.id, i, c.avatarCharacter).id)} onAdded={(msg) => { setShowAdd(false); refresh(msg); }} onCancel={children.length > 0 ? () => setShowAdd(false) : undefined} /></div>
        ) : (
          <button type="button" className="btn btn-coin mt-3 w-full" onClick={() => setShowAdd(true)}>＋ お子さまを追加</button>
        )}
      </section>

      <section className="card p-4" aria-labelledby="pin-title">
        <h2 id="pin-title" className="rpg-title text-lg">暗証番号の変更</h2>
        <p className="mb-3 mt-1 text-xs text-[var(--ink-2)]">「おうちの方」のページに入るときの4けたの番号です。</p>
        <ChangePinForm guard={guard} />
      </section>

      <section className="card p-4" aria-labelledby="pw-title">
        <h2 id="pw-title" className="rpg-title text-lg">パスワードの変更</h2>
        <div className="mt-3"><ChangePasswordForm guard={guard} /></div>
      </section>

      <section className="card p-4" aria-labelledby="session-title">
        <h2 id="session-title" className="rpg-title text-lg">ログアウト</h2>
        <p className="mt-1 text-xs text-[var(--ink-2)]">この端末からログアウトします。ログアウト中はおためしモードで遊べます。</p>
        <button type="button" className="btn btn-ghost mt-3 w-full" onClick={() => void logout()}>ログアウト</button>
      </section>

      <section className="card p-4" aria-labelledby="delete-title">
        <h2 id="delete-title" className="rpg-title text-lg">退会</h2>
        <div className="mt-2"><DeleteAccountPanel guard={guard} onDeleted={() => { notifyAccountChanged(); setPhase("deleted"); }} /></div>
      </section>

      <div className="text-center">
        <Link href="/who" className="btn btn-primary">お子さまの画面にもどる</Link>
      </div>
    </div>
  );
}
