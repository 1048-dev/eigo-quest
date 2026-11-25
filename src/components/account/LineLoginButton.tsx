/**
 * 「LINEでログイン」ボタン。API（/api/auth/line/start）へのふつうのリンク（LINE の画面へページ移動する）。
 * LINE ログインが未設定のときは、呼ぶ側でこのボタンを出さない（me.lineLoginAvailable）。
 */
import { LINE_LINK_HREF, LINE_LOGIN_HREF } from "@/lib/auth/lineMessages";

export function LineLoginButton({ label = "LINEでログイン", mode = "login", className = "" }: { label?: string; mode?: "login" | "link"; className?: string }) {
  return (
    <a href={mode === "link" ? LINE_LINK_HREF : LINE_LOGIN_HREF}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-black text-white shadow-[0_3px_0_#04913f] transition hover:brightness-105 active:translate-y-0.5 active:shadow-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--volt)] ${className}`}
      style={{ background: "#06C755" }}>
      <LineMark />
      <span>{label}</span>
    </a>
  );
}

/** 吹き出しの形のシンプルなマーク（ロゴ画像は使わない） */
function LineMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path fill="#fff" d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.6 1.1-.5 6-3.5 8.2-6C21.4 14.3 22 12.7 22 11c0-4.4-4.5-8-10-8z" />
      <text x="12" y="13.6" textAnchor="middle" fontSize="6.2" fontWeight="900" fill="#06C755" fontFamily="system-ui, sans-serif">LINE</text>
    </svg>
  );
}
