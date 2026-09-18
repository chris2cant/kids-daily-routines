---
name: run
description: Start and verify the Petites Routines development environment.
disable-model-invocation: true
---

# Run Petites Routines

1. Confirm Node 24 and the pinned pnpm version from `package.json`.
2. Run `pnpm install --frozen-lockfile` when dependencies are missing or the lockfile changed.
3. Do not start Supabase for the current localStorage-only MVP. If a future feature uses it and
   Docker is available, run `pnpm db:start` first.
4. Start Next.js with `pnpm dev`. Read the actual port from the ready banner; Turbopack must be active.
5. Follow the installed `next-dev-loop` skill against that URL:
   - confirm `/_next/mcp` lists `get_compilation_issues`;
   - check compilation issues, routes, and runtime errors;
   - open the URL in a worktree-scoped `agent-browser` session with React DevTools;
   - verify the requested behavior, browser console, and React tree when applicable.
6. Run `pnpm check` for the fast local gate. Run the relevant Playwright test with
   `PLAYWRIGHT_BASE_URL=<running-url> pnpm test:e2e`.
7. Close the browser session with the same session and restore key. Leave `next dev` running for the
   next development loop unless asked to stop it.

Use `pnpm verify` only for repository or PR-level validation; it includes a production build and the
full E2E suite.
