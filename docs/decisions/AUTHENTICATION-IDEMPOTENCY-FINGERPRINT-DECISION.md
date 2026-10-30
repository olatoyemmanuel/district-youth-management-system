# Authentication Idempotency Request Fingerprint Decision

- Decision ID: AUTH-IDEM-005
- Related decisions: AUTH-IDEM-001, AUTH-IDEM-002, AUTH-IDEM-003, AUTH-IDEM-004
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Request fingerprinting for state-changing authentication operations

## Decision

DYMS shall use SHA-256 to calculate a request fingerprint from a canonical representation of the request.

The canonical representation shall include:
- HTTP method.
- API endpoint.
- Relevant request payload.
- Authenticated user identifier, where applicable.
- Active session identifier, where applicable.

It shall exclude:
- The Idempotency-Key header value.
- Cookies and authorization credentials.
- Volatile headers, including request timestamps.

## Requirements

1. The server, not the client, constructs the canonical representation and calculates the SHA-256 fingerprint.
2. The canonicalization procedure must be deterministic so semantically identical retries produce the same fingerprint.
3. The fingerprint must be bound to the applicable idempotency scope approved in AUTH-IDEM-004.
4. A key reused with a different fingerprint must be rejected and must not execute the changed request.
5. Raw passwords, reset tokens, refresh tokens, cookies, authorization credentials, and other authentication secrets must not be stored as part of the fingerprint input record or idempotency record.
6. Implementation must define how sensitive payload fields are represented during canonicalization without persisting or logging their raw values.

## Decision boundary

This decision approves SHA-256 and the listed canonical request components and exclusions. It does not define the exact canonical serialization standard, normalization of JSON or query parameters, treatment of duplicate/unknown fields, secret-field handling algorithm, storage representation, response replay, retention, concurrency, or failure recovery. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
