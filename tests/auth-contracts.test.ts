/**
 * 保護者アカウントの契約（zod）: リクエストは厳しく、レスポンスは壊れていても安全なデフォルト
 */
import { describe, expect, it } from "vitest";
import * as C from "@/lib/api/contracts";
import { coerce } from "@/lib/api/client";

describe("リクエストの検証", () => {
  it("登録: メールは小文字・前後の空白なし、パスワードは英字+数字8文字以上、PIN は4けた", () => {
    expect(C.RegisterRequestSchema.parse({ email: " Mom@Example.JP ", password: "abcd1234", pin: "0123" }))
      .toEqual({ email: "mom@example.jp", password: "abcd1234", pin: "0123" });
    for (const bad of [
      { email: "x", password: "abcd1234", pin: "0123" },
      { email: "a@b.jp", password: "abc123", pin: "0123" },
      { email: "a@b.jp", password: "abcdefgh", pin: "0123" },
      { email: "a@b.jp", password: "12345678", pin: "0123" },
      { email: "a@b.jp", password: "abcd1234", pin: "123" },
      { email: "a@b.jp", password: "abcd1234", pin: "12345" },
      { email: "a@b.jp", password: "abcd1234", pin: 1234 },
      { email: "a@b.jp", password: "a1".repeat(65), pin: "1234" },
      {},
    ]) expect(C.RegisterRequestSchema.safeParse(bad).success).toBe(false);
  });

  it("ログイン: 空・長すぎはだめ（ルールの中身は確認しない）", () => {
    expect(C.LoginRequestSchema.safeParse({ email: "a@b.jp", password: "x" }).success).toBe(true);
    expect(C.LoginRequestSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
    expect(C.LoginRequestSchema.safeParse({ email: "a@b.jp", password: "x".repeat(129) }).success).toBe(false);
  });

  it("子ども: ニックネーム1〜12文字・学年1〜6・生まれ年は任意", () => {
    expect(C.ChildCreateRequestSchema.parse({ nickname: " ハル ", schoolGrade: 3 })).toEqual({ nickname: "ハル", schoolGrade: 3 });
    expect(C.ChildCreateRequestSchema.parse({ nickname: "ハル", schoolGrade: 3, birthYear: 2018 }).birthYear).toBe(2018);
    for (const bad of [
      { nickname: "", schoolGrade: 3 },
      { nickname: "   ", schoolGrade: 3 },
      { nickname: "ハル", schoolGrade: 0 },
      { nickname: "ハル", schoolGrade: 2.5 },
      { nickname: "ハル", schoolGrade: "3" },
      { nickname: "<script>", schoolGrade: 3 },
      { nickname: "a\u0000b", schoolGrade: 3 },
      { nickname: "ハル", schoolGrade: 3, birthYear: 1990 },
    ]) expect(C.ChildCreateRequestSchema.safeParse(bad).success).toBe(false);
    expect(C.ChildUpdateRequestSchema.safeParse({}).success).toBe(false);
    expect(C.ChildUpdateRequestSchema.safeParse({ birthYear: null }).success).toBe(true);
  });

  it("設定: 回数は1〜10か null、何もない更新はだめ", () => {
    expect(C.ParentSettingsRequestSchema.safeParse({ dailyLessonLimit: { childId: "c1", limit: 2 } }).success).toBe(true);
    expect(C.ParentSettingsRequestSchema.safeParse({ dailyLessonLimit: { childId: "c1", limit: null } }).success).toBe(true);
    expect(C.ParentSettingsRequestSchema.safeParse({ dailyLessonLimit: { childId: "c1", limit: 11 } }).success).toBe(false);
    expect(C.ParentSettingsRequestSchema.safeParse({ dailyLessonLimit: { childId: "c/1", limit: 1 } }).success).toBe(false);
    expect(C.ParentSettingsRequestSchema.safeParse({ changePin: { password: "x", newPin: "12" } }).success).toBe(false);
    expect(C.ParentSettingsRequestSchema.safeParse({ changePassword: { currentPassword: "x", newPassword: "abcdefgh" } }).success).toBe(false);
    expect(C.ParentSettingsRequestSchema.safeParse({}).success).toBe(false);
  });
});

describe("レスポンスの安全なデフォルト", () => {
  const schemas = {
    AuthResult: C.AuthResultResponseSchema,
    AuthMe: C.AuthMeResponseSchema,
    Children: C.ChildrenResponseSchema,
    Child: C.ChildResponseSchema,
    VerifyPin: C.VerifyPinResponseSchema,
    ParentOverview: C.ParentOverviewResponseSchema,
    ParentSettings: C.ParentSettingsResponseSchema,
  };

  for (const [name, schema] of Object.entries(schemas)) {
    it(`${name}: 空・null・HTML でも例外にならない`, () => {
      for (const raw of [undefined, null, {}, "<html>", 42, []]) expect(() => coerce(schema, raw)).not.toThrow();
    });
  }

  it("me: 空なら未ログイン（おためしモード）", () => {
    expect(coerce(C.AuthMeResponseSchema, {})).toMatchObject({ ok: false, loggedIn: false, parent: null, children: [], selectedChildId: null, pinUnlocked: false });
  });

  it("壊れた子どもの要素だけ捨てる", () => {
    const r = coerce(C.ChildrenResponseSchema, { ok: true, children: [{ id: "c1", nickname: "ハル", schoolGrade: 3 }, { nickname: "id なし" }, null] });
    expect(r.children).toEqual([{ id: "c1", nickname: "ハル", schoolGrade: 3, birthYear: null, avatarCharacter: null }]);
  });

  it("ようす: 欠けた数字は 0、にがては空", () => {
    const r = coerce(C.ParentOverviewResponseSchema, { ok: true, children: [{ id: "c1", weakestSkills: "x", coins: "many" }] });
    expect(r.children[0]).toMatchObject({ id: "c1", coins: 0, lessonsDone: 0, weakestSkills: [], lastStudyDate: null, dailyLessonLimit: null });
  });

  it("レッスン完了: code を受けとれる", () => {
    expect(coerce(C.LessonCompleteResponseSchema, { ok: false, code: "DAILY_LIMIT" }).code).toBe("DAILY_LIMIT");
  });
});
