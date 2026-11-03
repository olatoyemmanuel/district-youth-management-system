# AUTH-IDEM-019: Authentication Idempotency Retry Backoff

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Authentication idempotency lock-contention retries

## Decision

Use exponential backoff with full jitter for bounded retries following database lock contention. The configured backoff ceilings are:

1. 250 milliseconds
2. 500 milliseconds
3. 1 second
4. 2 seconds
5. 4 seconds

For each attempt, the actual delay is selected randomly between zero and the corresponding ceiling. Stop after five attempts. If contention persists, leave the operation for controlled recovery scheduling. This policy does not authorize blind re-execution of an operation whose commit outcome is uncertain.

## Rationale

Jitter reduces synchronized retry collisions. A finite retry budget prevents tight retry loops and uncontrolled resource consumption.

## Constraints

- Preserve the approved five-second database lock-acquisition timeout.
- Preserve the approved two-minute fixed processing lease.
- Apply fencing and transaction-state checks before any recovery action.
- Do not treat retry exhaustion as proof that the original operation failed.

## Consequences

The implementation must expose bounded retry behavior and route unresolved contention to controlled recovery. Retry exhaustion and recovery handoff must be observable without logging credentials or other secrets.
