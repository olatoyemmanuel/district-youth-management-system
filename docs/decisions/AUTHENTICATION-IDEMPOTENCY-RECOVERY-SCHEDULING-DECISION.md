# AUTH-IDEM-025: Authentication Idempotency Recovery Scheduling

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Scheduling and delivery of controlled authentication idempotency recovery work

## Decision

Use BullMQ to schedule and deliver recovery work. PostgreSQL remains the authoritative source of truth for operation state, lease state, fencing version, and recovery outcome. Redis/BullMQ is a scheduling and delivery mechanism only.

Recovery processing must tolerate duplicate queue delivery without duplicate operation execution. Use bounded retries and provide a dead-letter or manual-review path for work that cannot be safely resolved.

## Rationale

Separating durable operation state from queue delivery prevents queue loss, restart, or duplicate delivery from becoming the source of truth for whether an authentication operation committed.

## Constraints

- A queue message must not independently authorize re-execution.
- Before recovery action, reload and validate the PostgreSQL operation record, lease, state, and fencing counter under the approved locking protocol.
- Preserve the approved READ COMMITTED isolation, five-second lock-acquisition timeout, and two-minute fixed processing lease.
- Preserve the approved retry and failure-classification decisions.
- Do not place credentials or raw authentication secrets in queue payloads.

## Consequences

Implementation must make recovery scheduling idempotent, reconcile persisted eligible operations with queued work, and expose exhausted or unresolved recovery work for authorized review.
