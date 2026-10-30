# Authentication Idempotency Recovery Row-Lock Timeout Decision

- Decision ID: AUTH-IDEM-018
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-017
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: PostgreSQL row-lock acquisition timeout for authentication idempotency recovery transactions

## Decision

DYMS shall use a five-second timeout for acquiring the relevant PostgreSQL row lock during authentication idempotency recovery transactions.

If a recovery worker cannot acquire the required row lock within five seconds, it shall abort and roll back its transaction, make no changes to the operation, record a retryable contention outcome, and retry only through controlled backoff rather than a tight loop.

## Requirements

1. The row-lock acquisition timeout is five seconds.
2. A timeout must abort and roll back the affected transaction.
3. A timed-out worker must not modify the idempotency operation or its recovery state.
4. The contention outcome must be recorded in a way that does not require changing the locked operation row.
5. Retry must use controlled backoff and must not spin in a tight loop.
6. Lock timeout handling must preserve the approved fencing/version and no-duplicate-execution guarantees.

## Decision boundary

This decision approves the five-second row-lock acquisition timeout and the required timeout behavior. It does not define the backoff schedule, maximum retry count, terminal contention handling, or separate transaction/out-of-band mechanism for recording contention outcomes. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
