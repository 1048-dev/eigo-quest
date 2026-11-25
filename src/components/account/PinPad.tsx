"use client";
/**
 * 保護者用の暗証番号（4けた）パッド。4つ目を押すと自動で確認する。
 * キーボードの数字・Backspace でも入力できる。
 * PinDialog: 子どもの画面から「おうちの方」エリアに入るときのモーダル。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { VerifyPinResponseSchema } from "@/lib/api/contracts";
import { codeOf, isAccountOffline, sendJson } from "@/lib/auth/client";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function PinPad({ onUnlocked, onNotLoggedIn }: { onUnlocked: () => void; onNotLoggedIn?: () => void }) {
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const submit = useCallback(async (value: string) => {
    setBusy(true);
    const r = await sendJson("POST", "/api/parent/verify-pin", VerifyPinResponseSchema, { pin: value });
    setBusy(false);
    if (r.ok && r.data.ok) { onUnlocked(); return; }
    if (codeOf(r) === "NOT_LOGGED_IN") { onNotLoggedIn?.(); }
    setError(isAccountOffline(r) ? "ただいま確認できません。しばらくしてからお試しください。" : r.error ?? "暗証番号が違います。");
    setPin("");
    setShake(true);
    setTimeout(() => setShake(false), 400);
  }, [onUnlocked, onNotLoggedIn]);

  // 連打しても 4けたを こえないよう、最新の値は ref でも持つ（state の更新関数の中で通信はしない）
  const pinRef = useRef("");
  const busyRef = useRef(false);
  busyRef.current = busy;

  const press = useCallback((d: string) => {
    if (busyRef.current || pinRef.current.length >= 4) return;
    setError(null);
    const next = pinRef.current + d;
    pinRef.current = next;
    setPin(next);
    if (next.length === 4) {
      busyRef.current = true;
      void submit(next).finally(() => { pinRef.current = ""; });
    }
  }, [submit]);

  const back = useCallback(() => {
    if (busyRef.current) return;
    pinRef.current = pinRef.current.slice(0, -1);
    setPin(pinRef.current);
  }, []);

  useEffect(() => {
    rootRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); back(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press, back]);

  return (
    <div ref={rootRef} tabIndex={-1} className="mx-auto w-full max-w-[300px] outline-none">
      <div className={`flex justify-center gap-3 ${shake ? "pin-shake" : ""}`} role="status" aria-live="polite" aria-label={`${pin.length}けた入力ずみ`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} aria-hidden
            className={`h-4 w-4 rounded-full border-2 border-[var(--gold)] transition ${i < pin.length ? "bg-[var(--volt)] shadow-[0_0_10px_rgba(255,216,58,.8)]" : "bg-black/40"}`} />
        ))}
      </div>
      <p className="mt-2 min-h-[1.5em] text-center text-sm font-bold text-[#ff9aa2]" role="alert">{error ?? ""}</p>
      <div className="mt-1 grid grid-cols-3 gap-2.5">
        {KEYS.map((k) => (
          <button key={k} type="button" className="btn btn-ghost !px-0 !py-3 text-xl" onClick={() => press(k)} disabled={busy} aria-label={`数字 ${k}`}>{k}</button>
        ))}
        <span aria-hidden />
        <button type="button" className="btn btn-ghost !px-0 !py-3 text-xl" onClick={() => press("0")} disabled={busy} aria-label="数字 0">0</button>
        <button type="button" className="btn btn-ghost !px-0 !py-3 text-sm" onClick={back} disabled={busy || pin.length === 0} aria-label="1文字けす">けす</button>
      </div>
    </div>
  );
}

export function PinDialog({ open, onClose, onUnlocked, onNotLoggedIn }: { open: boolean; onClose: () => void; onUnlocked: () => void; onNotLoggedIn?: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="pin-title" className="card rpg-rivets w-full max-w-sm p-5" onClick={(e) => e.stopPropagation()}>
        <h2 id="pin-title" className="rpg-title text-center text-lg">おうちの方の 暗証番号</h2>
        <p className="mb-3 mt-1 text-center text-xs text-[var(--ink-2)]">保護者の方が 4けたの暗証番号を入力してください。</p>
        <PinPad onUnlocked={onUnlocked} onNotLoggedIn={onNotLoggedIn} />
        <div className="mt-4 text-center">
          <button type="button" className="text-sm font-bold text-[var(--on-dark-2)] underline underline-offset-4" onClick={onClose}>とじる</button>
        </div>
      </div>
    </div>
  );
}
