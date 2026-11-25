# Phase 3 - monthly PDF delivery via LINE
- NOTE: the LINE Messaging API cannot send PDF files directly. Send a message with a secure download link instead.
- Monthly package per child: (1) the worksheet bundle for the world the child is currently in or about to start (reuse worksheets:month),
  (2) a 1-page progress report for the parent (lessons this month, streak, mastery by skill, weak points, next month's topics). Generate as PDF.
- Download page /d/<token>: random token, stored hashed, expires in 30 days, only serves that family's files. Store generated PDFs under a configurable folder (REPORT_STORAGE_DIR) for now.
- Sending: Messaging API push message to Parent.lineUserId (Flex message: child name, summary, "PDFをひらく" button). Env: LINE_MESSAGING_CHANNEL_ACCESS_TOKEN, APP_BASE_URL.
  Also a webhook route for follow/unfollow events with signature verification (LINE_MESSAGING_CHANNEL_SECRET) to track whether the parent has added the account.
- Command: npm run line:monthly [-- --dry-run] [-- --parent <id>]. Without keys or with --dry-run, write the messages and PDFs to an outbox folder and print what would be sent.
- Parent settings: turn monthly LINE delivery on/off; "send me this month's PDF now" button (rate limited).
- Tests: report builder, token expiry/ownership, dry-run output, webhook signature check, push request shape (mocked fetch).
