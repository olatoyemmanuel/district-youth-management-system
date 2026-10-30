# Authentication Idempotency Fixed Processing Lease Decision

- Decision ID: AUTH-IDEM-014
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-013
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Lease renewal behavior for IN_PROGRESS authentication idempotency operations

## Decision

DYMS shall use a fixed two-minute processing lease for authentication idempotency operations. The lease shall not be automatically renewed.

If an operation has not reached a terminal state before its lease expires, it shall become eligible for controlled recovery assessment under AUTH-IDEM-013. Lease expiry does not prove that the operation failed or did not commit, and does not authorize automatic re-execution.

## Requirements

1. The processing lease duration is fixed at two minutes.
2. The server must not automatically renew or extend the lease.
3. An operation that exceeds the lease duration must enter controlled recovery assessment.
4. Recovery must establish whether the original operation committed before deciding whether any further processing is safe.
5. An uncertain outcome must not be blindly retried or re-executed.
6. Lease expiry, recovery assessment, and recovery actions must be auditable.

## Decision boundary

This decision approves fixed two-minute leases without automatic renewal. It does not define worker locking/fencing, recovery scheduling and ownership, operation-specific commit evidence, or handling of external side effects whose outcome cannot be conclusively determined. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
