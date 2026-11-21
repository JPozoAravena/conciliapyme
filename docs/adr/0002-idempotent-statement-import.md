# ADR 0002: Idempotent bank statement import across PostgreSQL and MongoDB

- Status: accepted
- Date: 2026-11-21

## Context

Accountants upload bank statements (cartolas) as CSV files. Each bank exports different columns,
files are often uploaded twice by mistake, and consecutive statements overlap (the same movements
appear in two files). Movements must never be duplicated, because reconciliation sums them.

## Decision

Two idempotency rules, each enforced by a unique index:

1. **Same file twice changes nothing.** The SHA-256 of the uploaded bytes is unique in MongoDB
   (`importacions.fileHash`). A second upload of a completed import returns "already imported".
2. **Overlapping files do not duplicate movements.** Each line gets a hash of
   `bank | date | amount | description | occurrence`, unique in PostgreSQL
   (`MovimientoBancario.lineHash`), and rows are inserted with `createMany({ skipDuplicates: true })`.
   The occurrence counter tells apart two identical payments on the same day in one file, and still
   produces the same hashes when a later file repeats those lines.

Storage split:

- **MongoDB** keeps the import log and the original rows (`raw`, known columns only), so a new bank
  format needs no migration.
- **PostgreSQL** keeps the normalized movements that the business queries and sums.

Validation happens before touching either database: file type and size (512 KB, below the 1 MB
Server Actions body limit), known columns, at most 5,000 rows, integer CLP amounts within 32-bit
range, real dates between 2000 and 2100, bounded text. **One invalid row rejects the whole file**,
with its row number, rather than importing part of it and leaving the accountant unsure of what is
missing. Dates are stored as UTC midnight so the server time zone never shifts the day.

## Cross-database consistency

PostgreSQL and MongoDB share no transaction. The import follows "record intent, execute, confirm or
undo":

1. Insert the import record in MongoDB with `estado: PROCESANDO` (the unique index decides races).
2. Insert raw lines in MongoDB and movements in PostgreSQL.
3. Mark the import `COMPLETA`.
4. On any failure, delete what this import created in both databases.

A record left in `PROCESANDO` by a crashed process blocks re-imports of that file for 5 minutes
(`cartola_en_proceso`), then it is treated as abandoned, cleaned up and retried.

## Alternatives considered

- **Import table in PostgreSQL** (single transaction for log and movements): simpler consistency, but
  raw rows of every bank format would need either a schema per bank or an untyped JSON column, and
  the project deliberately uses MongoDB for schema-less raw data.
- **Partial imports** (skip invalid rows): rejected, because silent gaps break reconciliation.

## Consequences

- Integration tests run against real PostgreSQL and MongoDB (locally via Docker, in CI as services).
- Compensation is best effort: if the process dies during step 4, the 5-minute abandonment rule
  cleans up on the next attempt.
