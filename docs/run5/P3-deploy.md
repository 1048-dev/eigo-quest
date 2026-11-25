# Phase 3 - ready for publishing (Vercel + managed Postgres)
Problems to solve for serverless hosting:
1. Files: the server filesystem is not persistent. Add a storage adapter (STORAGE_DRIVER=local|s3) with an S3-compatible implementation
   (works with Vercel Blob alternatives, Cloudflare R2, AWS S3, Supabase Storage via S3 API). Download page /d/<token> streams from storage.
2. Python is not available on Vercel: the per-world worksheet bundles are the same for every child, so generate the 12 bundles once
   (npm run worksheets:month -- --all) and upload them to storage with a script (scripts/upload-worksheets.ts). Monthly delivery links to the stored bundle.
   The 1-page progress report must be generated in Node only (e.g. pdf-lib + an embedded open-license Japanese font such as Noto Sans JP, subset if possible). Remove the Python dependency from the server path.
   Also find out why the worksheet bundle could not be attached in a test run ("ワールド1 のワークシートを作れませんでした") and fix it.
3. Rate limits: move login/PIN/reset/send-now limits from memory to the DB (works with many server instances).
4. Cron: vercel.json crons for monthly LINE delivery (1st of each month, morning JST) and trial cleanup, calling protected routes that require CRON_SECRET.
5. /api/health (DB reachable?, storage reachable?, LINE configured?) without leaking secrets.
6. prisma: use DATABASE_URL (pooled) + DIRECT_URL for migrations; document "npx prisma migrate deploy" in the build/deploy steps.
7. Write docs/run5/DEPLOY.md in Japanese for the owner: step by step Vercel + Neon (or Supabase) + storage + domain + environment variables + LINE URLs + cron, with a checklist.
Tests for the storage adapter (local + mocked S3), cron auth, health route, Node PDF report.
