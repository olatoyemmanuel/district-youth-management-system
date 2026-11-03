# Authentication Idempotency Fencing Counter Decision

- Decision ID: AUTH-IDEM-016
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-015
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Data type and increment semantics for the authentication idempotency recovery fencing counter

## Decision

DYMS shall use a PostgreSQL BIGINT fencing/version counter for authentication idempotency recovery coordination.

The counter shall be initialized to 0 and incremented by 1 on every successful recovery claim.

## Requirements

1. The fencing/version counter must use PostgreSQL BIGINT.
2. The initial value must be 0.
3. Every successful recovery claim must atomically increment the counter by exactly 1.
4. A worker must validate that its fencing/version value is current before committing a recovery state change.
5. A stale worker must not commit a state change using an outdated counter value.
6. Counter increment and recovery claim must be atomic within the relevant database transaction.
7. Counter overflow must be treated as an exceptional integrity failure, not allowed to wrap or silently reset.

## Decision boundary

This decision approves PostgreSQL BIGINT, initial value 0, and increment-by-one semantics for each successful recovery claim. It does not define lock timeout, transaction isolation level, lock ordering, retry/backoff policy, or operation-specific commit verification. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
