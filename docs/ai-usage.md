# AI usage

Builder and auditor roles were separated: one agent wrote the code, a second, independent agent reviewed the branch without editing files. A human decided every item below.

## Audit of `feat/2-auth-roles`

| Finding | Severity | Decision | Reason |
|---|---|---|---|
| Demo credentials in seed | High | Fixed | Seed refuses to run in production |
| No central route protection | High | Deferred to client CRUD | Each server action calls `puede()`; only `/` exists today |
| In-memory rate limit, per-email key | High | Accepted | Known limitation; Redis is on the roadmap |
| bcrypt cost 10 | Medium | Fixed | Raised to 12 |
| User enumeration by response time | Medium | Fixed | Compare against a dummy hash |
| No session max age | Medium | Fixed | 8 hours |
| Example `AUTH_SECRET` values | Medium | Accepted | Examples only, not real secrets |
| `cacheComponents` disabled | Medium | Documented | Disabled on purpose so `auth()` works in pages |
| Beta dependency not pinned | Low | Fixed | Exact version |
| `authorize()` not unit-tested | Low | Deferred | Covered by the E2E tests |
| Sonar quality gate | High | Fixed | Missing button type attributes, literal bcrypt hash replaced by computed dummy hash, auth wiring excluded from coverage (covered by E2E later) |

## Audit of `feat/4-import-cartola`

| Finding | Severity | Decision | Reason |
|---|---|---|---|
| Compensation could delete movements that another import had counted as existing | Medium | Fixed | The PostgreSQL `createMany` is the commit point: compensation only undoes MongoDB, and a `PROCESANDO` import that already stored movements is completed instead of deleted. Covered by integration tests |
| A slow import (over 5 minutes) could be taken for abandoned and wiped | Low | Fixed | `updatedAt` is refreshed before writing to PostgreSQL, abandoned records are claimed atomically (`findOneAndDelete` on the `updatedAt` that was read), and movements are never deleted |
| Line hash collides for identical same-day payments that arrive in different files | Low | Fixed | Hash now includes the running balance (bank A) or reference (bank B); an integration test shows overlapping statements still do not duplicate. Two accounts of the same bank remain indistinguishable (the CSV has no account column): accepted and documented in ADR 0002 |
