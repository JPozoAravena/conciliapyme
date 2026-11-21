# ADR 0001: Accept the deepmerge-ts audit advisory in the Prisma CLI

- Status: accepted
- Date: 2026-10-20

## Context

`npm audit --omit=dev` reports a high-severity advisory
([GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx))
in `deepmerge-ts`, pulled in by `@prisma/config`, which is part of the Prisma CLI
(`prisma` 6.x). The advisory is a stack exhaustion when merging recursive object graphs.

The only automatic fix (`npm audit fix --force`) installs Prisma 7, a breaking change
(new `prisma.config.ts`, different generator and seed configuration).

## Decision

Keep Prisma 6 and accept the advisory for now.

## Rationale

- The vulnerable code runs inside the Prisma CLI while merging configuration that the
  developers write. It never processes input sent by application users.
- The deployed application only uses `@prisma/client`, not the CLI config loader.
- Upgrading to Prisma 7 is planned as its own change with its own tests, not as a
  side effect of an audit command.

## Consequences

- The advisory stays visible in `npm audit`. It is tracked here instead of being hidden.
- Dependabot is enabled and will open a PR when a patched Prisma release is available.
- Revisit this decision when migrating to Prisma 7 or when a patched 6.x release appears.