# ADR 0001: Accept the deepmerge-ts and effect audit advisories in the Prisma CLI

- Status: accepted
- Date: 2026-10-20 (updated 2026-11-21 to add `effect`)

## Context

`npm audit` reports two high-severity advisories in packages pulled in by
`@prisma/config`, which is part of the Prisma CLI (`prisma` 6.x):

| Package | Advisory | Issue |
|---|---|---|
| `deepmerge-ts` | [GHSA-ggr8-5vv4-36mx](https://github.com/advisories/GHSA-ggr8-5vv4-36mx) | Stack exhaustion when merging recursive object graphs |
| `effect` | [GHSA-7589-6fvf-x4pw](https://github.com/advisories/GHSA-7589-6fvf-x4pw) | ReDoS in the regex compiled by `Schema.TemplateLiteral` |

The only automatic fix (`npm audit fix --force`) installs Prisma 7, a breaking change
(new `prisma.config.ts`, different generator and seed configuration).

## Decision

Keep Prisma 6 and accept both advisories for now.

## Rationale

- The vulnerable code runs inside the Prisma CLI while loading and validating configuration
  that the developers write. It never processes input sent by application users.
- The deployed application only uses `@prisma/client`, not the CLI config loader.
- Upgrading to Prisma 7 is planned as its own change with its own tests, not as a
  side effect of an audit command.

## Consequences

- Both advisories stay visible in `npm audit`. They are tracked here instead of being hidden.
- Dependabot is enabled and will open a PR when a patched Prisma release is available.
- Revisit this decision when migrating to Prisma 7 or when a patched 6.x release appears.
