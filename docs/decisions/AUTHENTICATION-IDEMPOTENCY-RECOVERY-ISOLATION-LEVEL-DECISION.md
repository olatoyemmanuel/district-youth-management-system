# Authentication Idempotency Recovery Transaction Isolation Decision

- Decision ID: AUTH-IDEM-017
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-016
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: PostgreSQL transaction isolation for authentication idempotency recovery operations

## Decision

DYMS shall use PostgreSQL READ COMMITTED transaction isolation with explicit row-level locking for authentication idempotency recovery transactions.

Recovery operations shall use the approved PostgreSQL row-level locking and fencing/version controls. Lock acquisition, fencing validation, and the corresponding recovery-state changes must be performed within an appropriately bounded transaction.

## Requirements

1. Recovery transactions shall use READ COMMITTED isolation.
2. Recovery workers shall explicitly lock the relevant idempotency operation row before changing recovery state.
3. Fencing/version validation and state transitions must be atomic with the relevant locked-row operation.
4. A stale worker must not commit a recovery-state change.
5. Transactions must be bounded and must not hold row locks while performing unrelated or long-running external work.
6. The implementation must handle lock contention, transaction rollback, and retryable database conflicts without duplicating authentication side effects.
7. The approved rule that lease expiry does not prove the original operation failed or did not commit remains in force.

## Decision boundary

This decision approves READ COMMITTED isolation with explicit row-level locking for authentication idempotency recovery transactions. It does not define lock timeout values, lock ordering, transaction duration limits, retry/backoff policy, or operation-specific commit verification. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
