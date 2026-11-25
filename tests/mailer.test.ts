/**
 * run5 Phase 2: メール送信の部品（送り方の えらび方・Resend の HTTP API・outbox・文面）。
 */
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { MailError, mailConfig, RESEND_API_URL, sendMail } from "@/lib/mail";
import { emailInUseMail, emailVerifyMail, escapeHtml, passwordChangedMail, passwordResetMail } from "@/lib/mail/templates";

const DIR = mkdtempSync(path.join(tmpdir(), "eq-mailer-"));
afterAll(() => rmSync(DIR, { recursive: true, force: true }));
afterEach(() => vi.restoreAllMocks());

const MSG = { to: "p@example.com", subject: "件名", text: "本文", html: "<p>本文</p>" };

describe("mailConfig（送り方の えらび方）", () => {
  it("何も無ければ outbox（.data/mail-outbox）", () => {
    const c = mailConfig({});
    expect(c.provider).toBe("outbox");
    expect(c.outboxDir).toBe(path.join(process.cwd(), ".data", "mail-outbox"));
    expect(c.fallbackReason).toBeUndefined();
  });
  it("MAIL_PROVIDER が空なら キーで決める: RESEND_API_KEY → resend、SMTP_URL → smtp", () => {
    expect(mailConfig({ RESEND_API_KEY: "re_x", MAIL_FROM: "a <a@x.test>" }).provider).toBe("resend");
    expect(mailConfig({ SMTP_URL: "smtp://u:p@h:587", MAIL_FROM: "a@x.test" }).provider).toBe("smtp");
    expect(mailConfig({ RESEND_API_KEY: "re_x", SMTP_URL: "smtp://h", MAIL_FROM: "a@x.test", MAIL_PROVIDER: "smtp" }).provider).toBe("smtp");
    expect(mailConfig({ RESEND_API_KEY: "re_x", MAIL_FROM: "a@x.test", MAIL_PROVIDER: "outbox" }).provider).toBe("outbox");
  });
  it("えらんだ送り方に 必要な値が足りなければ outbox（理由つき）", () => {
    expect(mailConfig({ MAIL_PROVIDER: "resend" })).toMatchObject({ provider: "outbox", fallbackReason: "RESEND_API_KEY is empty" });
    expect(mailConfig({ MAIL_PROVIDER: "resend", RESEND_API_KEY: "re_x" })).toMatchObject({ provider: "outbox", fallbackReason: "MAIL_FROM is empty" });
    expect(mailConfig({ MAIL_PROVIDER: "smtp", MAIL_FROM: "a@x.test" })).toMatchObject({ provider: "outbox", fallbackReason: "SMTP_URL is empty" });
  });
});

describe("Resend（HTTP API）", () => {
  const env = { MAIL_PROVIDER: "resend", RESEND_API_KEY: "re_test_not_real", MAIL_FROM: "英語クエスト <no-reply@x.test>" };
  it("Bearer キー・from/to/subject/text/html を JSON で送る", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ id: "msg_1" })) as unknown as typeof fetch;
    const r = await sendMail(MSG, { env, fetchImpl });
    expect(r).toEqual({ provider: "resend", id: "msg_1" });
    const [url, init] = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit];
    expect(url).toBe(RESEND_API_URL);
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer re_test_not_real");
    expect(JSON.parse(String(init.body))).toEqual({ from: env.MAIL_FROM, to: ["p@example.com"], subject: "件名", text: "本文", html: "<p>本文</p>" });
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
  it("失敗 → MailError（ステータスだけ。キーは入れない）", async () => {
    const fetchImpl = vi.fn(async () => Response.json({ message: "bad" }, { status: 422 })) as unknown as typeof fetch;
    const e = await sendMail(MSG, { env, fetchImpl }).catch((x) => x);
    expect(e).toBeInstanceOf(MailError);
    expect(e.reason).toBe("http 422");
    expect(String(e.message)).not.toContain("re_test_not_real");
    const down = vi.fn(async () => { throw new TypeError("fetch failed"); }) as unknown as typeof fetch;
    expect((await sendMail(MSG, { env, fetchImpl: down }).catch((x) => x)).reason).toBe("network");
  });
});

describe("outbox", () => {
  it("JSON と HTML を書いて、ログに場所を出す（あて先・本文は ログに出さない）", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    const r = await sendMail(MSG, { env: { MAIL_OUTBOX_DIR: DIR } });
    expect(r.provider).toBe("outbox");
    expect(existsSync(r.id!)).toBe(true);
    expect(JSON.parse(readFileSync(r.id!, "utf8"))).toMatchObject({ to: "p@example.com", subject: "件名", text: "本文" });
    expect(readFileSync(r.id!.replace(/\.json$/, ".html"), "utf8")).toBe("<p>本文</p>");
    const logged = log.mock.calls.flat().join(" ");
    expect(logged).toContain(r.id!);
    expect(logged).not.toContain("p@example.com");
  });
});

describe("文面", () => {
  const url = "https://app.example.test/reset-password?token=abc";
  it("再設定: 件名・期限・リンク（テキスト と HTML）。会社名は入れない", () => {
    const m = passwordResetMail("p@example.com", url, 30);
    expect(m.subject).toBe("【英語クエスト】パスワード再設定のご案内");
    expect(m.text).toContain(url);
    expect(m.text).toContain("30分");
    expect(m.html).toContain(escapeHtml(url));
    expect(m.html).toContain('lang="ja"');
    for (const x of [m, passwordChangedMail("p@example.com", "https://a.test/login"), emailVerifyMail("p@example.com", url, 24), emailInUseMail("p@example.com", "https://a.test/login", "https://a.test/forgot-password")]) {
      expect(x.text).toMatch(/です。|ます。/);
      expect(x.html).toContain("<!doctype html>");
    }
  });
  it("HTML は エスケープ。http(s) 以外のリンクは うけつけない", () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe("&lt;a href=&quot;x&quot;&gt;&amp;&#39;");
    const m = passwordResetMail("p@example.com", 'https://a.test/r?token=a"><script>', 30);
    expect(m.html).not.toContain("<script>");
    expect(() => passwordResetMail("p@example.com", "javascript:alert(1)", 30)).toThrow();
  });
});
