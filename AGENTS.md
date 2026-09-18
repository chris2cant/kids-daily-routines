# Petites Routines

`SPEC.md` is the product source of truth. Implement only the requested slice; the initial MVP has no
backend, account, authentication, gamification, or analytics.

- Use Node 24 and the pinned pnpm version. Never add npm or Yarn lockfiles.
- Keep routes and composition in `src/app`; keep product logic and its colocated tests in vertical
  slices under `src/features`.
- Put only genuinely shared UI in `src/components` and external/cross-cutting infrastructure in
  `src/lib`. Import owning modules directly; avoid re-export-only barrels.
- Prefer Server Components. Add a Client Component only at the browser-interactivity boundary.
- Treat Supabase migrations as the schema source of truth if a backend is introduced. Generate
  database types; never edit them manually.
- During edits, validate the narrowest useful scope. Before handoff run `pnpm check`, runtime/browser
  verification, and the relevant Playwright test. Run `pnpm verify` for repository/PR validation.
- Never commit secrets. `.env.example` contains names and safe placeholders only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
