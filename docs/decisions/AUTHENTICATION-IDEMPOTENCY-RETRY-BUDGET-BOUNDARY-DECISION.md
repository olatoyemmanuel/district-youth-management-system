# AUTH-IDEM-032: Authentication Idempotency Retry-Budget Boundary

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Separation of lock-contention retries, client retries, and recovery scheduling

## Decision

The five-attempt exponential backoff with full jitter applies to server-side database lock-contention retries only. It does not authorize automatic re-execution of terminal FAILED or uncertain operations.

Client retries must preserve the original idempotency key and the same logical request. Recovery workers use a separate bounded scheduling policy and must validate persisted PostgreSQL state, lease, and fencing counter before recovery action.

## Rationale

Separating these retry budgets prevents infrastructure contention handling from becoming an unintended authorization to repeat a business operation.

## Constraints

- Preserve the approved backoff ceilings of 250 ms, 500 ms, 1 second, 2 seconds, and 4 seconds, with full jitter and a five-attempt maximum.
- Preserve the rule that FAILED operations are not automatically re-executed by client retries.
- An uncertain commit outcome must be established before any re-execution.
- Recovery must follow the approved lock, lease, fencing, and transaction rules.

## Consequences

Client libraries, API handlers, and recovery workers must implement distinct retry policies. Tests must verify that retry exhaustion does not cause duplicate authentication effects.
