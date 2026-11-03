# AUTH-IDEM-023: Authentication Idempotency Failure Classification

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Classification of unsuccessful authentication idempotency operations

## Decision

Classify unsuccessful outcomes into three categories:

1. Permanent validation or business failure: record the operation as terminal FAILED and return the same recorded failure for retries using the same key and fingerprint during the retention period.
2. Recoverable infrastructure failure: record FAILED and permit assessment through the controlled recovery process. A retry is allowed only when evidence establishes that the original operation did not commit and the operation is explicitly safe to re-execute.
3. Uncertain commit outcome: do not re-execute until the original database outcome is established. Route unresolved cases to controlled recovery or manual review.

## Rationale

A rejected request, a recoverable infrastructure problem, and an uncertain commit are materially different conditions. Treating them alike risks duplicate effects or incorrect client outcomes.

## Constraints

- Preserve the approved IN_PROGRESS, COMPLETED, and FAILED lifecycle states.
- This classification does not add a new persisted operation state.
- Client retries of FAILED operations must not automatically re-execute them.
- Any controlled re-execution requires evidence of non-commit, explicit operation safety, and fencing/version validation.

## Consequences

The implementation must define a failure taxonomy and map each failure to a terminal response or controlled recovery path. Tests must cover permanent failures, recoverable failures, and uncertain commit outcomes.
