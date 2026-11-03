# Idempotency Key Generation and Reuse Decision

- Decision ID: AUTH-IDEM-002
- Related decision: AUTH-IDEM-001
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Client generation and reuse of idempotency keys for state-changing authentication operations

## Decision

For every new logical state-changing authentication operation, the client shall generate a new cryptographically random idempotency key.

When retrying the same logical operation, the client shall reuse the exact same idempotency key.

A key must not be reused for a different logical operation.

After an operation has completed, a subsequent new operation must use a new key, even if its parameters are identical to the earlier operation.

## Requirements

1. Keys must be generated using a cryptographically secure random number generator.
2. A retry of the same logical operation must carry the same key.
3. A distinct logical operation must carry a newly generated key.
4. The server must enforce key uniqueness within the approved idempotency scope.
5. Client-side key generation is not a substitute for server-side idempotency enforcement.
6. The key must be bound to the operation scope and request fingerprint defined by the detailed idempotency contract.
7. Reuse of a key with a different request fingerprint must be rejected and must not execute the new request.

## Decision boundary

This decision approves the client key generation and reuse lifecycle only. It does not define the key encoding, entropy/length, storage schema, scope, fingerprint algorithm, response replay format, retention period, or concurrency implementation. Those details remain part of DDD-013 and require separate review and approval.

This decision does not authorise Prisma models, migrations, or implementation.

Changes require explicit change control.
