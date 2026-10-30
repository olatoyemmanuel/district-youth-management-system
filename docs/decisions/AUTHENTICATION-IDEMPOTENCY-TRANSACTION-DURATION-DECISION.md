# AUTH-IDEM-020: Authentication Idempotency Transaction Duration

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Database transactions participating in authentication idempotency

## Decision

Set a maximum duration of 10 seconds for an individual database transaction used by an authentication idempotency operation.

External service calls, network delivery, queue waits, and other lengthy work must not execute while holding the transaction's database locks. Transactions must remain bounded and must atomically persist the idempotency state transition together with the associated database-side authentication effect where required by the operation contract.

## Rationale

Long-running transactions retain locks, increase contention, and raise deadlock and recovery risks. A bounded transaction keeps critical state transitions short and predictable.

## Constraints

- The 10-second maximum is a transaction-duration ceiling, not permission to extend the approved two-minute processing lease.
- Preserve READ COMMITTED isolation and the approved five-second lock-acquisition timeout.
- A timeout or rollback must not be interpreted as proof of non-commit unless the database outcome is established.

## Consequences

Implementation and tests must enforce or verify the transaction bound, keep external work outside locked transactions, and define safe handling for timeout and uncertain-commit outcomes.
