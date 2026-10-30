# AUTH-IDEM-022: Authentication Idempotency Response Replay

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Responses to repeated authentication requests using the same idempotency key

## Decision

For a repeated request with the same valid idempotency key and matching request fingerprint, return the recorded HTTP status and a safe response representation instead of executing the operation again.

Never persist or replay passwords, raw access or refresh tokens, session cookies, password-reset tokens, reset links, or other authentication secrets in idempotency records.

Before disclosing a stored result, revalidate the caller's current authorization and the endpoint-specific conditions governing access to that result. Apply endpoint-specific response rules whenever replaying the original result would expose sensitive information.

## Rationale

Safe response replay gives clients a consistent outcome without repeating state-changing operations or disclosing authentication credentials.

## Constraints

- Preserve the approved request fingerprint and sensitive-field HMAC rules.
- Preserve operation scoping, including the separate safe pre-authentication scope for login.
- A matching key and fingerprint must never bypass current authorization checks.
- Secret-bearing responses must not be reconstructed from stored raw credentials.

## Consequences

Each authentication endpoint must define which status and response fields are safe to retain and replay. Tests must verify that secrets never appear in idempotency storage, logs, audit events, traces, or replay responses.
