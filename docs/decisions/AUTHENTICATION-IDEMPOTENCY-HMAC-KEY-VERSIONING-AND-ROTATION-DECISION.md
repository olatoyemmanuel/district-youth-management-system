# Authentication Idempotency HMAC Key Versioning and Rotation Decision

- Decision ID: AUTH-IDEM-008
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-007
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Versioning and rotation of HMAC keys used for sensitive-field idempotency fingerprints

## Decision

DYMS shall use versioned HMAC keys.

Each HMAC key shall have a version identifier. Each persisted idempotency fingerprint that depends on an HMAC key shall retain the corresponding key version identifier.

Previous HMAC keys shall remain available for verification for as long as valid idempotency records depend on them. An old key may be retired only after all dependent records have expired or have otherwise been safely handled under the approved idempotency lifecycle.

## Requirements

1. HMAC keys must be independently generated using a cryptographically secure random number generator.
2. Each key must have a unique, non-secret version identifier.
3. The idempotency record must identify the HMAC key version used to produce its sensitive-field representation.
4. Key material must remain outside the application database and source repository, in deployment secret management.
5. Rotation must not invalidate legitimate retries for still-valid idempotency records.
6. Verification must select the key version associated with the existing record, not silently substitute the current key.
7. Old keys must not be destroyed while unexpired records still require them for verification.
8. Key retirement and destruction must be controlled and auditable.

## Decision boundary

This decision approves versioned HMAC keys and retention of previous keys while dependent idempotency records remain valid. It does not define the key identifier syntax, cryptographic key size, rotation cadence, emergency compromise response, exact retirement procedure, or handling of records that outlive normal retention because of legal holds or investigations. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
