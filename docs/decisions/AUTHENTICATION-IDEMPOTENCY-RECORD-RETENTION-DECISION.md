# Authentication Idempotency Record Retention Decision

- Decision ID: AUTH-IDEM-010
- Related decisions: AUTH-IDEM-001 through AUTH-IDEM-009
- Related domain decision: DDD-013 (Idempotency contract)
- Related retention decision: AUTH-RET-001
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Retention period for completed authentication idempotency records

## Decision

DYMS shall retain completed authentication idempotency records for 24 hours after operation completion.

During the retention period, the server shall retain sufficient non-secret operation state and result information to process legitimate retries consistently, subject to the approved scope, request-fingerprint, and response-replay security requirements.

After the 24-hour retention period, the server shall no longer treat the expired record as an available completed-operation replay record. A client initiating a new logical operation must use a new idempotency key.

This retention period does not extend authentication session, access credential, refresh token, or password-reset token lifetimes.

Documented legal holds and active security investigations suspend deletion of relevant records, consistent with AUTH-RET-001.

## Requirements

1. The 24-hour period begins when the logical operation reaches its completed state.
2. Completed records must remain available for retry handling during the retention period.
3. Raw passwords, reset tokens, refresh tokens, cookies, authorization credentials, and HMAC key material must not be stored in idempotency records.
4. Expired records must be eligible for deletion unless a documented legal hold or active security investigation applies.
5. Cleanup must be auditable, safely retryable, and must preserve referential integrity.
6. Idempotency record retention must not extend any authentication credential or session lifetime.
7. The implementation must define safe behavior for a retry arriving after record expiry; it must not silently reinterpret an old key as authorization to repeat a sensitive operation.

## Decision boundary

This decision approves 24-hour retention for completed authentication idempotency records. It does not define retention for in-progress or failed records, exact cleanup scheduling, response replay payload format, post-expiry key tombstones or reuse prevention, or detailed failure recovery. Those details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
