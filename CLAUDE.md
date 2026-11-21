# ConciliaPyme: rules for Claude Code

Bank-statement / invoice reconciliation for Chilean SMEs. Portfolio project, public repo.

## Workflow (mandatory)
- Never commit or push to `main`; it is protected. One branch per issue, one PR per branch, squash merge.
- Conventional commits (commitlint + husky run on commit). Branch names: `feat/<issue>-<slug>`, `chore/...`.
- Before every commit run: `npm run lint`, `npm run typecheck`, `npm run test:cov`. All must pass.
- Write tests first for domain logic. Coverage is measured on `src/lib`.
- README, ADRs, commit messages and PR text are in English. UI text is in Spanish.
- Zero paid tools or services. Local dev uses Docker (Postgres on port 5433, Mongo 27017).
- Windows + cmd: give commands for cmd, one per line. Do not use bash-only syntax.
- Subagents: use builder subagents (and a UX/UI one when there is a UI). Do NOT run auditor, QA or security subagents unless the user asks; for backend changes ask the user first whether to review.
- The step-by-step guide is `docs/pasoapaso.md` (Spanish, internal notes, git-ignored: local only). Read it for context before each task.
- See also `AGENTS.md` for Next.js conventions.

## Stack
Next.js 16 (App Router) + TypeScript + Tailwind, Prisma 6 (never upgrade to 7) + PostgreSQL, Mongoose + MongoDB (raw statement lines, import log, audit), Zod, Auth.js v5 (credentials, JWT), bcryptjs, Vitest, Playwright (`*.e2e.ts`).

## Domain rules
- Amounts are integer CLP. RUT validated with modulo 11 (`src/lib/rut.ts`).
- Import is idempotent: file SHA-256 unique in Mongo; per-line hash with occurrence counter unique in Postgres.
- Match suggestions: 100 amount+folio; 70 exact amount + date within 5 days; 40 small difference (<= max(1000, 1%)) + folio or close date.
- Confirming a match is atomic (`prisma.$transaction`, conditional `updateMany`), rule recalculated on the server, audit written after commit.
- Authorization is checked on the server in every page and action with `puede()` from `src/lib/rbac.ts`. Never import `auth` in middleware.
- Error codes in URLs, never raw messages.