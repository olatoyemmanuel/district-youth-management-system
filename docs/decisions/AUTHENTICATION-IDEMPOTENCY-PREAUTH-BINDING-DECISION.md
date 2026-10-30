# AUTH-IDEM-026: Login Pre-Authentication Binding

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Login idempotency before user authentication

## Decision

Create a cryptographically random pre-authentication identifier on the server and deliver it in a Secure, HttpOnly, SameSite=Lax cookie. The pre-authentication context has a 10-minute lifetime. Store only a hash or secure reference server-side. Bind login idempotency scope to this context so one unauthenticated client cannot retrieve another client's result.

Non-browser clients require a separately defined binding mechanism before they are supported.

## Rationale

A short-lived server-issued context provides a client-specific boundary for unauthenticated login retries without exposing a reusable credential to browser scripts.

## Constraints

- The pre-authentication context is not an authenticated session and grants no application authorization.
- It must be protected by the approved CSRF/origin controls applicable to the login flow.
- Do not store raw pre-authentication secrets in idempotency records, logs, audit events, traces, or errors.
- Expiry or loss of the context requires a new logical login attempt and a new idempotency key.

## Consequences

The login endpoint and client bootstrap flow must establish this context before login. Non-browser client support remains out of scope until its binding method is approved.
