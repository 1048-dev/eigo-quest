import { describe, expect, it } from "vitest";
import { RegisterRequestSchema } from "@/lib/api/contracts";
import { avatarFor, codeOf, gradeLabel, isAccountOffline, passwordChecks } from "@/lib/auth/client";
import { isAccountPath } from "@/components/account/AccountBar";
import { formatStudyDate } from "@/components/parent/ChildCard";

describe("保護者アカウントの画面ヘルパー", () => {
  it("パスワードのチェックリストはサーバーの検証と同じ結果になる", () => {
    for (const pw of ["abc", "abcdefgh", "12345678", "abcd1234", "ａｂｃｄ１２３４", "a1" + "x".repeat(130), "Passw0rd!"]) {
      const client = passwordChecks(pw).every((c) => c.ok);
      const server = RegisterRequestSchema.safeParse({ email: "a@example.com", password: pw, pin: "1234" }).success;
      expect(client, pw).toBe(server);
    }
  });

  it("アバターは同じ子どもならいつも同じキャラクター", () => {
    expect(avatarFor("child-abc")).toEqual(avatarFor("child-abc"));
    const ids = new Set(Array.from({ length: 40 }, (_, i) => avatarFor(`c${i}x`).id));
    expect(ids.size).toBeGreaterThan(1);
  });

  it("学年の表示", () => {
    expect(gradeLabel(3)).toBe("3ねんせい");
    expect(gradeLabel(null)).toBe("");
    expect(gradeLabel(7)).toBe("");
  });

  it("最終学習日の表示（今日・昨日・N日前・未学習）", () => {
    const today = new Date(2026, 10, 25);
    expect(formatStudyDate("2026-11-25", today)).toBe("11月25日（今日）");
    expect(formatStudyDate("2026-11-24", today)).toBe("11月24日（昨日）");
    expect(formatStudyDate("2026-11-20", today)).toBe("11月20日（5日前）");
    expect(formatStudyDate(null, today)).toBe("まだ学習していません");
    expect(formatStudyDate("おかしな値", today)).toBe("おかしな値");
  });

  it("アカウント画面ではゲームのメニューとアカウントバーを出さない", () => {
    for (const p of ["/welcome", "/register", "/login", "/who", "/parent"]) expect(isAccountPath(p)).toBe(true);
    for (const p of ["/map", "/lesson/1", "/dashboard", "/parents-guide"]) expect(isAccountPath(p)).toBe(false);
  });

  it("API の失敗の見分け（code・DB 停止）", () => {
    expect(codeOf({ data: { code: "PIN_REQUIRED" } })).toBe("PIN_REQUIRED");
    expect(codeOf({ data: {} })).toBeUndefined();
    expect(isAccountOffline({ status: 503, data: {} })).toBe(true);
    expect(isAccountOffline({ status: 0, data: {} })).toBe(true);
    expect(isAccountOffline({ status: 200, data: { offline: true } })).toBe(true);
    expect(isAccountOffline({ status: 401, data: { code: "LOGIN_FAILED" } })).toBe(false);
  });
});
