# AUTH-IDEM-021: Authentication Idempotency Lock Ordering

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Database row-lock ordering for authentication idempotency workflows

## Decision

Use one documented, consistent lock-acquisition order:

1. Idempotency operation record.
2. Relevant user record, where required.
3. Relevant session record, where required.
4. Other dependent records in a documented deterministic order.

A workflow that does not require an earlier record may skip it, but must not acquire locks in an order that reverses this hierarchy. Any justified exception must be documented and reviewed for deadlock risk before implementation.

## Rationale

Consistent lock ordering reduces circular waits and deadlocks when authentication workflows overlap.

## Constraints

- Preserve PostgreSQL READ COMMITTED isolation.
- Preserve explicit row-level locking, fencing-counter validation, and atomic state transitions.
- Keep transactions bounded by the approved 10-second maximum.
- Do not perform external work while holding database locks.

## Consequences

Each authentication workflow and recovery path must document its lock sequence. Tests must exercise concurrent workflows and verify safe handling of lock contention and deadlocks.
