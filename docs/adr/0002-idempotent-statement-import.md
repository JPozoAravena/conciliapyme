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
   `bank | date | amount | description | balance or reference | occurrence`, unique in PostgreSQL
   (`MovimientoBancario.lineHash`), and rows are inserted with `createMany({ skipDuplicates: true })`.
   The running balance (bank A) or reference (bank B) tells apart identical payments on the same day
   even when they arrive in different files. The occurrence counter covers lines that are still
   identical. A line repeated by an overlapping statement keeps its balance, so it hashes the same.

   Known limitation: the CSV has no account column, so the same movement in two accounts of the same
   bank (same date, amount, description and balance) is stored once. Accepted until accounts are
   modeled.

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
2. Insert raw lines in MongoDB and refresh the record's `updatedAt`.
3. Insert movements in PostgreSQL with a single `createMany`. **This is the commit point**: one
   statement, so either all new rows are stored or none.
4. Mark the import `COMPLETA`.

Failures before step 3 completes undo only the MongoDB side. **PostgreSQL rows are never deleted by
compensation**, because once stored another, overlapping import may already have counted them as
existing (deleting them would lose movements silently).

A record found in `PROCESANDO`:

- with movements in PostgreSQL passed the commit point, so it is marked `COMPLETA` and reported as
  already imported;
- without movements and updated less than 5 minutes ago is still running (`cartola_en_proceso`);
- without movements and older than that is abandoned: it is claimed atomically (`findOneAndDelete`
  matching the `updatedAt` that was read), its raw lines are removed and the file is imported again.

## Alternatives considered

- **Import table in PostgreSQL** (single transaction for log and movements): simpler consistency, but
  raw rows of every bank format would need either a schema per bank or an untyped JSON column, and
  the project deliberately uses MongoDB for schema-less raw data.
- **Partial imports** (skip invalid rows): rejected, because silent gaps break reconciliation.

## Consequences

- Integration tests run against real PostgreSQL and MongoDB (locally via Docker, in CI as services).
- If marking `COMPLETA` fails, the user sees an error but the movements are kept; the next upload of
  the same file completes the import.
- A process that dies before the commit point leaves only MongoDB data, which the 5-minute
  abandonment rule cleans up on the next attempt.
