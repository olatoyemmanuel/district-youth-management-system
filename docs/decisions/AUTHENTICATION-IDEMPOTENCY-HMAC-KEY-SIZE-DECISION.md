# Authentication Idempotency HMAC Key Size Decision

- Decision ID: AUTH-IDEM-009
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-008
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Cryptographic key size for HMAC-SHA-256 sensitive-field fingerprinting

## Decision

DYMS shall use 256-bit (32-byte) cryptographically random keys for HMAC-SHA-256 operations used in authentication idempotency fingerprinting.

## Requirements

1. Each HMAC key must contain 256 bits (32 bytes) of cryptographically secure random key material.
2. Keys must be generated using a cryptographically secure random number generator.
3. Keys must remain outside the application database and source repository and be held in deployment secret management.
4. Each key must have a unique, non-secret version identifier as required by AUTH-IDEM-008.
5. Key rotation and retirement must preserve verification of still-valid idempotency records that depend on previous key versions.
6. Key material must not appear in logs, audit events, traces, error messages, or source control.

## Decision boundary

This decision approves the 256-bit key size for HMAC-SHA-256 sensitive-field fingerprinting. It does not define the secret-management product, key encoding at rest or in transit, rotation cadence, emergency compromise response, or detailed key retirement procedure. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
