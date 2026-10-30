# Authentication Idempotency Requirement Decision

- Decision ID: AUTH-IDEM-001
- Related decision: DDD-013 (Idempotency contract)
- Related decisions: DFR-001, DFR-004, AUTH-RET-001
- Status: APPROVED REQUIREMENT; detailed contract remains OPEN
- Approval date: 2026-10-30
- Scope: State-changing DYMS authentication operations

## Decision

DYMS shall require an idempotency key for all state-changing authentication operations, including:

- Login
- Refresh-token rotation
- Logout of one session
- Logout of all sessions
- Password-reset request and password-reset completion
- Other state-changing authentication operations added to the system

The requirement applies to each logical operation attempt. The same key and request identity must be used when retrying the same logical operation.

## Required contract properties to be specified

Before implementation, the detailed idempotency contract must define:

1. Key format, entropy, minimum length, and client generation requirements.
2. Key scope, including operation, authenticated principal or pre-authentication context, and session where applicable.
3. Request fingerprinting and handling when the same key is reused with a different payload.
4. Behaviour for concurrent requests using the same key.
5. Which response status, headers, and body are stored and replayed.
6. How in-progress, completed, and failed operations are represented.
7. Retention period and expiry of idempotency records.
8. Safe retry behaviour after timeouts, lost responses, process crashes, and database commit failures.
9. Abuse controls, storage limits, rate limits, and protection against key guessing.
10. How idempotency interacts with refresh-token single-use rotation, confirmed replay detection, no grace period, and the approved lost-response reauthentication rule.

## Security and correctness constraints

- Idempotency must not weaken authentication, authorization, CSRF protection, rate limiting, or refresh-token replay detection.
- A key must not allow one principal or session to retrieve another principal's result.
- Reuse of a key with a different request fingerprint must be rejected and must not execute the new request.
- Concurrent duplicate requests must not execute the same logical state change more than once.
- The mechanism must not silently make a consumed refresh token reusable.
- The approved no-grace-period refresh policy and lost-response reauthentication rule remain in force unless changed through explicit approval.
- Idempotency records must not store passwords, raw access tokens, raw refresh tokens, raw reset tokens, or other authentication secrets.
- Login idempotency must not become a mechanism for replaying credentials or disclosing authentication results across clients or principals.

## Decision boundary

This decision approves the requirement to use idempotency keys for all state-changing authentication operations. It does not approve the detailed idempotency contract, storage schema, retention duration, or implementation.

DDD-013 remains BLOCKED until its detailed contract is reviewed and approved. No Prisma models, migrations, or implementation are authorised by this decision alone.

Changes require explicit change control.
