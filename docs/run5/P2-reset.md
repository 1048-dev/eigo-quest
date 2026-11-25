# Phase 2 - password reset and forgot PIN
- Mailer abstraction: provider chosen by env (MAIL_PROVIDER=resend|smtp|outbox). "outbox" (default when no keys) writes emails to .data/mail-outbox and logs the path.
  Resend via its HTTP API (RESEND_API_KEY, MAIL_FROM). SMTP via nodemailer (SMTP_URL, MAIL_FROM).
- /forgot-password: always the same answer whether the email exists or not. Token: random, stored hashed, 30-minute expiry, single use, invalidates all sessions after reset.
  /reset-password?token=... page. Rate limit per email and per IP.
- Forgot PIN: in the parent area entry, "暗証番号を忘れた" -> enter account password (or re-login with LINE for LINE-only parents) -> set a new PIN.
- LINE-only parents can add an email + password in /parent settings (email confirmation link through the mailer).
- Polite Japanese emails (plain text + simple HTML). Tests for tokens, expiry, single use, no account enumeration, session invalidation.
