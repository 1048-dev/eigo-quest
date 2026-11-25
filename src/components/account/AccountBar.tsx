"use client";
/**
 * 画面上部のアカウントバー（ゲームの画面だけに出す）。
 *  - ログイン中: いま あそんでいる子の 顔と名前・「かわる」（→ /who）・小さな「おうちの方」（→ 暗証番号 → /parent）
 *    顔を タッチすると 小さなシートで キャラクターを えらびなおせる（暗証番号は いらない）
 *  - ログインしていない／DB 停止: 「おためしモード」と とうろく・ログインへの入口
 *  - ログイン中なのに 子どもが選ばれていなければ /who へ（だれの記録か わからないまま 遊ばせない）
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ChildResponseSchema, type AuthMeResponse } from "@/lib/api/contracts";
import { ACCOUNT_EVENT, avatarFor, fetchMe, notifyAccountChanged, sendJson } from "@/lib/auth/client";
import type { AvatarCharacter } from "@/lib/domain/avatars";
import { AvatarSheet } from "./AvatarPicker";
import { ChildAvatar } from "./ChildAvatar";
import { PinDialog } from "./PinPad";

/** アカウント画面そのもの（ここではバーを出さない） */
// /setup-pin（LINE で登録した直後の暗証番号）と /d（LINE で届いた PDF のダウンロード）も保護者向けの画面なので、
// ゲームのバー・下のメニューを出さない。run5: パスワード・暗証番号を忘れたとき・メールアドレスの確認の画面も
export const ACCOUNT_PATHS = ["/welcome", "/register", "/login", "/who", "/parent", "/setup-pin", "/d", "/forgot-password", "/reset-password", "/verify-email", "/forgot-pin"];
export const isAccountPath = (path: string) => ACCOUNT_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

export function AccountBar() {
  const path = usePathname() ?? "";
  const router = useRouter();
  const hidden = isAccountPath(path);
  const [me, setMe] = useState<AuthMeResponse | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const load = useCallback(() => {
    void fetchMe().then((r) => setMe(r.ok && r.data.loggedIn ? r.data : { ...r.data, loggedIn: false }));
  }, []);

  useEffect(() => {
    if (hidden) return;
    load();
    window.addEventListener(ACCOUNT_EVENT, load);
    return () => window.removeEventListener(ACCOUNT_EVENT, load);
  }, [hidden, load, path]);

  useEffect(() => {
    if (!hidden && me?.loggedIn && !me.selectedChildId) router.replace("/who");
  }, [hidden, me, router]);

  if (hidden || !me) return null;

  const child = me.loggedIn ? me.children.find((c) => c.id === me.selectedChildId) : undefined;

  if (!me.loggedIn || !child) {
    return (
      <div className="mb-3 flex items-center justify-between gap-2 rounded-2xl border border-[var(--gold)]/50 bg-black/40 px-3 py-1.5 text-xs backdrop-blur">
        <span className="inline-flex items-center gap-1.5 font-bold text-[var(--on-dark-2)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--volt)]" aria-hidden />おためしモード
        </span>
        <Link href="/welcome" className="font-black text-[var(--volt)] underline underline-offset-4">おうちの方：とうろく / ログイン</Link>
      </div>
    );
  }

  const openParent = () => (me.pinUnlocked ? router.push("/parent") : setPinOpen(true));
  const index = me.children.indexOf(child);
  const current = avatarFor(child.id, index, child.avatarCharacter).id as AvatarCharacter;

  const pickAvatar = async (a: AvatarCharacter) => {
    setAvatarBusy(true);
    setAvatarError(null);
    const r = await sendJson("PATCH", `/api/children/${encodeURIComponent(child.id)}/avatar`, ChildResponseSchema, { avatarCharacter: a });
    setAvatarBusy(false);
    if (r.ok && r.data.ok) {
      setMe({ ...me, children: me.children.map((c) => (c.id === child.id ? { ...c, avatarCharacter: a } : c)) });
      setSheetOpen(false);
      notifyAccountChanged();
      return;
    }
    setAvatarError(r.error ?? "いまは かえられないみたい。あとで ためしてね。");
  };

  return (
    <>
      <div className="mb-3 flex items-center gap-2 rounded-2xl border border-[var(--gold)]/60 bg-black/45 py-1 pl-1 pr-2 backdrop-blur" aria-label="いま あそんでいる人">
        <button type="button" onClick={() => { setAvatarError(null); setSheetOpen(true); }} className="rounded-full transition hover:brightness-110 focus-visible:outline-3 focus-visible:outline-[var(--volt)]" aria-label="キャラクターを かえる">
          <ChildAvatar childId={child.id} index={index} avatar={child.avatarCharacter} size={30} />
        </button>
        <p className="min-w-0 flex-1 truncate text-sm font-black">
          {child.nickname}<span className="ml-0.5 text-xs font-bold text-[var(--on-dark-2)]">さん</span>
        </p>
        <Link href="/who" className="btn btn-coin !rounded-xl !px-3 !py-1 text-xs" aria-label="あそぶ人を かえる">かわる</Link>
        <button type="button" onClick={openParent} className="rounded-lg border border-[var(--gold)]/50 px-2 py-1 text-[10px] font-bold text-[var(--on-dark-2)] hover:text-[var(--volt)]" aria-label="おうちの方のページ（暗証番号が必要）">
          おうちの方
        </button>
      </div>
      <AvatarSheet open={sheetOpen} current={current} nickname={child.nickname} busy={avatarBusy} error={avatarError} onPick={(a) => void pickAvatar(a)} onClose={() => setSheetOpen(false)} />
      <PinDialog open={pinOpen} onClose={() => setPinOpen(false)} onUnlocked={() => { setPinOpen(false); router.push("/parent"); }} onNotLoggedIn={() => { setPinOpen(false); load(); }} />
    </>
  );
}
