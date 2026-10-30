# AUTH-IDEM-024: Authentication Idempotency Recovery Outcomes

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Controlled recovery assessment of authentication idempotency operations

## Decision

A controlled recovery assessment must resolve an operation to one of four outcomes:

- COMPLETED: evidence establishes that the original operation committed.
- FAILED: evidence establishes that the original operation did not commit and the operation is not safe to retry.
- RETRYABLE: evidence establishes that the original operation did not commit and the operation is explicitly classified as safe for controlled server-side re-execution.
- MANUAL_REVIEW: the outcome remains uncertain or requires human intervention.

These are recovery outcomes and classifications. They do not replace the approved persisted lifecycle states IN_PROGRESS, COMPLETED, and FAILED.

## Rationale

Explicit recovery outcomes prevent a worker from blindly repeating an operation after a crash, timeout, or uncertain commit.

## Constraints

- Preserve the approved two-minute fixed processing lease.
- Lease expiry makes an operation eligible for recovery assessment only; it does not prove failure.
- Preserve PostgreSQL row-level locking, fencing counters, READ COMMITTED isolation, and bounded transactions.
- A RETRYABLE outcome requires positive evidence of non-commit and an operation-specific safety rule.

## Consequences

Recovery logic must record the evidence and decision supporting each outcome. MANUAL_REVIEW must remain visible for authorized operational handling and must not be silently retried.
