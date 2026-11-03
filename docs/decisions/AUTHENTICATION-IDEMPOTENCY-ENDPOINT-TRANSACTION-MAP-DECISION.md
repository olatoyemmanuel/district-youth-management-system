# AUTH-IDEM-033: Authentication Endpoint Transaction Map

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Atomic database work for authentication idempotency operations

## Decision

Define the following atomic database work for each authentication operation:

| Operation | Atomic database work |
|---|---|
| Login | Idempotency completion and session creation |
| Refresh | Idempotency completion, old refresh-token consumption, and replacement-token creation |
| Logout | Idempotency completion and session revocation |
| Logout all | Idempotency completion and applicable session revocations |
| Password-reset request | Idempotency completion, reset-token creation, and delivery-outbox record |
| Password-reset completion | Idempotency completion, password update, reset-token consumption, and session revocation |

External email delivery and other network calls must execute outside the database transaction. Where delivery must follow a committed database change, persist a transactional outbox record in the same transaction and deliver it asynchronously.

## Rationale

Atomic database changes ensure the idempotency result and the corresponding authentication state cannot be committed independently. The outbox pattern prevents external delivery from being mistaken for part of a database transaction.

## Constraints

- Preserve the approved 10-second maximum transaction duration, READ COMMITTED isolation, five-second lock-acquisition timeout, and lock ordering.
- Do not perform external network calls while holding database locks.
- A timeout or connection loss must not be treated as proof of rollback until the commit outcome is established.
- Outbox payloads must not contain raw credentials or reset secrets unless a separately approved, secure delivery design explicitly requires a protected short-lived secret reference.

## Consequences

Each endpoint must have a transaction and recovery map with a defined commit point, persisted outcome, and evidence available to recovery. The ERD must represent the outbox dependency before schema approval.
