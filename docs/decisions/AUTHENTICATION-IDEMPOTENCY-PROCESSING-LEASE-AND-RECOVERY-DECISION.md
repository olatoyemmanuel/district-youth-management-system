# Authentication Idempotency Processing Lease and Recovery Decision

- Decision ID: AUTH-IDEM-013
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-012
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Processing lease and controlled recovery for abandoned IN_PROGRESS authentication idempotency operations

## Decision

Each IN_PROGRESS authentication idempotency operation shall have a processing lease of two minutes.

The server shall record the processing start time and lease expiry time. If processing completes within the lease, the operation shall transition to COMPLETED or FAILED according to its outcome.

If the processing lease expires before a terminal outcome is recorded, the operation shall be considered potentially abandoned and eligible for controlled recovery assessment. Lease expiry alone does not prove that the operation did not commit.

A recovery worker or equivalent controlled server-side mechanism must establish whether the original operation committed before deciding whether recovery or further processing is safe. An operation with an uncertain outcome must not be blindly re-executed.

## Requirements

1. Every IN_PROGRESS operation must have a recorded lease start and expiry.
2. The lease duration is two minutes.
3. Successful completion transitions the operation to COMPLETED.
4. A conclusively unsuccessful operation transitions to FAILED.
5. Lease expiry makes an operation eligible for recovery assessment; it does not authorize automatic re-execution.
6. Recovery must determine whether the original operation committed or produced an externally visible side effect.
7. An uncertain outcome must remain protected from duplicate execution until safely reconciled.
8. Recovery actions and state transitions must be auditable.
9. The recovery mechanism must be safe under concurrent workers and repeated recovery attempts.

## Decision boundary

This decision approves the two-minute processing lease and controlled recovery assessment after expiry. It does not define lease renewal/heartbeat behavior, worker locking or fencing, exact recovery ownership and scheduling, operation-specific commit evidence, recovery state representation, or the handling of external side effects that cannot be conclusively queried. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
