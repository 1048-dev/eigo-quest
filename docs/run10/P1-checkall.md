# Phase 1 - one command for everything
Create npm run check:all that runs, in order, and prints a final table (name, result, count, time): english:lint (all), tsc, vitest, next build,
data checks (Phase 2), render checks (Phase 3), offline smoke, E2E with a real DB (Phase 4), accessibility (axe-core with Playwright on main pages), internal link check,
bundle size budget (fail if first-load JS of /map or /lesson > 230 kB). It writes docs/run10/report/latest.md. Each step has a timeout and progress output.
