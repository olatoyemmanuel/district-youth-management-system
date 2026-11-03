# Authentication Idempotency Scope Decision

- Decision ID: AUTH-IDEM-004
- Related decisions: AUTH-IDEM-001, AUTH-IDEM-002, AUTH-IDEM-003
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Isolation boundaries for idempotency keys used by state-changing authentication operations

## Decision

DYMS shall scope each idempotency key to the following applicable dimensions:

1. The operation or endpoint.
2. The authenticated user, where available.
3. The active session, where applicable.
4. The request fingerprint.

For login, which occurs before authentication, the server shall use a separate pre-authentication scope. The pre-authentication design must prevent one client from retrieving another client's operation result and must not expose credentials, session secrets, or refresh tokens through idempotency replay.

## Requirements

- A key used for one operation or endpoint must not be treated as the same operation when submitted to another endpoint.
- Authenticated operations must be bound to the applicable user and session context.
- Pre-authentication operations must use a safe context that does not assume an authenticated user or session exists.
- The request fingerprint must be checked before an existing operation result is considered for replay.
- A key reused with a different request fingerprint must be rejected and must not execute the changed request.
- Scope enforcement is server-side; UUID v4 key generation alone does not provide isolation.
- The implementation must prevent cross-user, cross-session, and cross-client disclosure of operation results.

## Decision boundary

This decision approves the scope dimensions and the requirement for a separate pre-authentication scope for login. It does not define the exact pre-authentication binding mechanism, canonical request fingerprint algorithm, database uniqueness constraints, response replay format, treatment of sensitive response data, retention period, concurrency protocol, or failure recovery. These details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
