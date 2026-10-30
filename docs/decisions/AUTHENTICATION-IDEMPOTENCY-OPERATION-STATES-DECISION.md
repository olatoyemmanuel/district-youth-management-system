# Authentication Idempotency Operation State Decision

- Decision ID: AUTH-IDEM-011
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-010
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Operation states and concurrent duplicate-request behavior for authentication idempotency

## Decision

DYMS shall use three explicit idempotency operation states:

- IN_PROGRESS: The logical operation is currently being processed.
- COMPLETED: The logical operation has finished successfully.
- FAILED: The logical operation has finished unsuccessfully.

When a request arrives with the same applicable idempotency key and scope while the original operation is IN_PROGRESS, the server shall return HTTP 409 Conflict with a retry instruction. The server must not execute the same logical operation concurrently a second time.

## Requirements

1. State transitions must be controlled and atomic.
2. Only one execution of a given scoped idempotency key and request fingerprint may be active at a time.
3. A concurrent duplicate request observing IN_PROGRESS receives HTTP 409 Conflict and a clear retry instruction.
4. A concurrent duplicate request must not start another execution of the same logical operation.
5. COMPLETED requests are handled under the approved 24-hour replay policy and the response-security rules still to be defined.
6. FAILED requests are handled according to a separately defined failure and retry policy; failure must not silently permit unsafe duplicate side effects.
7. State changes must be consistent with the approved key scope, request fingerprint, and operation lifecycle.

## Decision boundary

This decision approves the three states and HTTP 409 behavior for a concurrent request while the original operation is IN_PROGRESS. It does not define the exact FAILED-state retry policy, which failures are retryable, response body/schema and Retry-After behavior, lease/timeout handling for abandoned IN_PROGRESS records, transaction boundaries, crash recovery, or response replay format. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
