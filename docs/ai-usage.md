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
