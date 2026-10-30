# AUTH-IDEM-030: Endpoint-Specific Authentication Response Replay

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Safe replay behavior for authentication mutation endpoints

## Decision

Apply the following replay behavior for a repeated request with the same valid idempotency key and matching fingerprint:

| Operation | Replay behavior |
|---|---|
| Login | Never replay authentication cookies or tokens. If the original secret-bearing response is unavailable, require a new login attempt. |
| Refresh | Never replay replacement tokens. If a committed rotation's response is lost, require reauthentication rather than reuse of a consumed refresh token. |
| Logout | Return the recorded safe success response. |
| Logout all | Return the recorded safe success response. |
| Password-reset request | Return a generic safe response. |
| Password-reset completion | Return a safe completion response without exposing the reset token. |

## Rationale

Endpoint-specific replay rules preserve the refresh-token no-grace rule and prevent authentication secrets from being stored or disclosed through idempotency replay.

## Constraints

- Never persist or replay passwords, raw access or refresh tokens, session cookies, password-reset tokens, reset links, or other authentication secrets.
- Revalidate current authorization and endpoint-specific disclosure conditions before returning a stored result.
- Preserve generic password-reset responses to avoid account enumeration.
- A new logical login attempt must use a new idempotency key.

## Consequences

Each endpoint must implement and test the defined replay behavior, including response-loss scenarios. The implementation must not reconstruct secret-bearing responses from persisted credentials.
