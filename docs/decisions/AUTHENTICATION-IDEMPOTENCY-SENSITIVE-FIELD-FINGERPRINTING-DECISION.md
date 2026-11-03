# Authentication Idempotency Sensitive-Field Fingerprinting Decision

- Decision ID: AUTH-IDEM-007
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-006
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Protection of sensitive request fields used in authentication idempotency fingerprints

## Decision

DYMS shall use keyed HMAC-SHA-256 to represent sensitive request fields when constructing authentication idempotency fingerprints.

Raw sensitive values, including passwords, password-reset tokens, refresh tokens, cookies, and authorization credentials, must not be persisted in idempotency records or exposed in logs and diagnostic output.

The HMAC key shall be held separately from the application database and managed through deployment secrets.

## Requirements

1. Sensitive request fields shall be represented using HMAC-SHA-256 under a server-controlled secret key before they contribute to the request fingerprint.
2. The HMAC key must not be stored in the application database, source repository, or ordinary application logs.
3. Key material shall be supplied through the approved deployment secret-management mechanism.
4. HMAC processing and the resulting fingerprint must be performed server-side.
5. The design must prevent raw sensitive values from appearing in persisted idempotency records, audit events, logs, traces, or error responses.
6. The HMAC representation must be unambiguously associated with its field identity and purpose so values from different fields cannot be confused.

## Decision boundary

This decision approves HMAC-SHA-256 for sensitive-field fingerprinting and separate secret management for its key. It does not define the exact HMAC input encoding, key identifier/version format, key rotation and retirement procedure, handling of in-flight idempotency records during rotation, or canonical composition of sensitive and non-sensitive request components. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
