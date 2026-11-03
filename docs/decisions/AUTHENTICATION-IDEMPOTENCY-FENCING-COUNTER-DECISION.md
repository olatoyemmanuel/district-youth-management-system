# Authentication Idempotency Fencing Counter Decision

- Decision ID: AUTH-IDEM-016
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-015
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Fencing/version counter representation and increment behavior for authentication idempotency recovery

## Decision

DYMS shall use a PostgreSQL BIGINT fencing/version counter for authentication idempotency recovery coordination.

The counter shall be initialized to 0 and incremented by 1 for every successful recovery claim.

## Requirements

1. The counter must use PostgreSQL BIGINT storage.
2. Its initial value must be 0.
3. Each successful recovery claim must atomically increment the counter by exactly 1.
4. A recovery worker must present and validate the fencing/version value associated with its claim before committing a state change.
5. A stale fencing/version value must be rejected.
6. Counter increment, claim ownership/state transition, and fencing validation must be coordinated transactionally with the approved row-level locking mechanism.
7. Counter values must not be reset or reused during the lifetime of the corresponding idempotency operation.

## Decision boundary

This decision approves the BIGINT type, initial value, and increment rule. It does not define overflow handling, exact database column nullability/default constraints, transaction isolation level, lock timeout, lock ordering, or retry/backoff behavior. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
