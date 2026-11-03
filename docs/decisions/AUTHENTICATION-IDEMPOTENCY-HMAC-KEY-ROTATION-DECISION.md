# AUTH-IDEM-034: Authentication Idempotency HMAC Key Rotation

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Lifecycle, rotation, and compromise handling for authentication idempotency HMAC keys

## Decision

Rotate HMAC keys every 90 days. Use versioned key identifiers. Keep old key versions available while valid idempotency records depend on them.

On suspected key compromise, immediately disable the affected key for generating new fingerprints. Assess affected records and route uncertain cases to controlled recovery or manual review. Never silently reinterpret an existing fingerprint using a different key version.

## Rationale

A defined rotation schedule reduces long-term key exposure, while versioning preserves the ability to validate records created under earlier keys. A compromise procedure avoids silently changing the meaning of existing fingerprints.

## Constraints

- HMAC keys are cryptographically random 256-bit values.
- Keys must be stored outside the database and source repository in deployment secrets.
- Key access must be restricted and audited.
- Old key versions must not be destroyed while valid records still depend on them.
- Emergency rotation and record assessment must not expose raw sensitive request values.

## Consequences

Deployment operations must support versioned key configuration, routine 90-day rotation, old-key retention, and emergency disablement. The exact key identifier syntax and secret-manager procedures must be specified in the implementation runbook without changing this approved policy.
