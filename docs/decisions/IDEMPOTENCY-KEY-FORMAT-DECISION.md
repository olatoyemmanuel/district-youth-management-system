# Idempotency Key Format Decision

- Decision ID: AUTH-IDEM-003
- Related decisions: AUTH-IDEM-001, AUTH-IDEM-002
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Idempotency key format for DYMS state-changing authentication operations

## Decision

DYMS shall use UUID version 4 (UUID v4) as the standard idempotency key format.

Clients shall generate UUID v4 values using a cryptographically secure random number generator and transmit the key in the `Idempotency-Key` HTTP request header.

Example:

```http
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

## Requirements

1. Each new logical operation receives a newly generated UUID v4 key.
2. Retries of the exact same logical operation reuse its original key.
3. A key must not be reused for a different logical operation.
4. The server validates the UUID v4 format and enforces the approved idempotency scope and request-fingerprint rules.
5. UUID v4 key generation must use a cryptographically secure random number generator.

## Decision boundary

This decision approves the UUID v4 format and HTTP header name only. It does not define key scope, request fingerprint construction, storage, response replay, retention, concurrency handling, or failure recovery. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
