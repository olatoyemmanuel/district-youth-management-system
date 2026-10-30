# Authentication Idempotency Recovery Worker Coordination Decision

- Decision ID: AUTH-IDEM-015
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-014
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Concurrency control for workers assessing and recovering expired authentication idempotency operations

## Decision

DYMS shall use PostgreSQL row-level locking with `SELECT ... FOR UPDATE` and a fencing/version counter to coordinate recovery workers handling expired authentication idempotency operations.

This coordination must prevent two workers from concurrently recovering the same operation and prevent a stale worker from overwriting a newer recovery decision.

## Requirements

1. Recovery workers must acquire the relevant database row lock before changing an operation's recovery state.
2. A fencing/version counter must be checked and advanced as part of the controlled recovery transition.
3. A worker with a stale fencing/version value must not commit a state change.
4. Lock acquisition, fencing/version validation, and recovery-state updates must be performed atomically within an appropriate database transaction.
5. The design must safely handle worker crashes, transaction rollbacks, lock timeouts, and repeated recovery attempts.
6. Recovery coordination must preserve the rule that lease expiry alone does not prove the original operation failed or did not commit.
7. All recovery decisions and state transitions must be auditable.

## Decision boundary

This decision approves PostgreSQL row-level locking using `SELECT ... FOR UPDATE` and fencing/version checks for recovery coordination. It does not define the exact counter type or initial value, lock timeout, transaction isolation level, lock ordering, retry/backoff policy, or detailed operation-specific commit verification. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
