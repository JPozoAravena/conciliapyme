# ADR 0003: Atomic reconciliation confirmation and append-only audit log

- Status: accepted
- Date: 2026-11-21

## Decision

- Confirming a match runs in one `prisma.$transaction`: movement `SIN_CONCILIAR → CONCILIADO`,
  invoice `PENDIENTE → PAGADA | CON_DIFERENCIA`, and a `Conciliacion` row. All or nothing.
- Concurrency is decided by conditional `updateMany` (`UPDATE ... WHERE estado = ...`): if another
  transaction already changed the state, `count` is 0 and this one rolls back. No read-then-write
  check that could go stale. Covered by integration tests with simultaneous confirmations.
- The rule is recalculated on the server; a pair that meets no rule (100/70/40) is rejected.
- The audit event is written to MongoDB **after** the commit, append-only (no update or delete is
  exposed). If it fails, the confirmation is not undone; the failure is logged by type only.

## Alternatives

- **Outbox in PostgreSQL** (write the event inside the same transaction, publish to MongoDB later):
  durable audit, more moving parts. Future work.
- **Serializable isolation**: unnecessary, conditional updates already serialize on the row lock.
