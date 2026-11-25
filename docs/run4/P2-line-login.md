# Phase 2 - Log in with LINE (parents)
- Standard LINE Login (OAuth 2.0 / OpenID Connect): authorize URL with state + nonce (stored in a short-lived httpOnly cookie), callback route that exchanges the code,
  verifies the ID token (signature/issuer/audience/nonce/expiry via LINE's verify endpoint or JWT verification), and gets the LINE user id.
- Env: LINE_LOGIN_CHANNEL_ID, LINE_LOGIN_CHANNEL_SECRET, LINE_LOGIN_CALLBACK_URL, and request bot_prompt=aggressive so the parent can add the Official Account as a friend.
- Parent.lineUserId (unique, optional). Flows: (a) new parent via LINE -> create account -> set 4-digit PIN screen -> add children;
  (b) existing email parent can link/unlink LINE in /parent settings; (c) login with LINE when linked.
- If the env vars are missing: hide the LINE buttons (and show a small note in /parent settings that LINE is not configured yet).
- Tests with a mocked LINE token endpoint: state mismatch, nonce mismatch, expired token, linking to an already-linked LINE id, success paths.
