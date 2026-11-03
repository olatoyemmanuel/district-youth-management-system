# AUTH-IDEM-031: Authentication Idempotency In-Progress HTTP 409 Contract

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: HTTP response for duplicate requests while an operation is IN_PROGRESS

## Decision

When a duplicate request with the same idempotency key and matching request fingerprint arrives while the original operation remains IN_PROGRESS, return HTTP 409 with:

- Standard error code: `IDEMPOTENCY_IN_PROGRESS`.
- The standard DYMS error response envelope.
- `Retry-After: 1` response header.
- A safe instruction to retry the same logical operation using the same idempotency key.

Do not execute a second operation while the original remains in progress.

## Rationale

A stable machine-readable error and retry instruction allow clients to handle concurrent requests consistently without creating duplicate effects.

## Constraints

- Preserve the approved operation-state and fingerprint-matching rules.
- Do not expose internal database, lock, lease, or recovery details in the response.
- Client retries must preserve the same idempotency key and logical request.
- This response does not authorize automatic re-execution of terminal FAILED or uncertain operations.

## Consequences

The API contract and OpenAPI specification must define the error code, response envelope, and Retry-After behavior. Integration tests must verify the response and ensure no duplicate execution occurs.
