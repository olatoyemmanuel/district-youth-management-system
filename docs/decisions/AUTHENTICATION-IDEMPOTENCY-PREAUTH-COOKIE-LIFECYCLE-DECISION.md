# AUTH-IDEM-036: Pre-authentication Cookie Lifecycle

**Status:** Approved by product owner  
**Date:** 2026-10-30  
**Scope:** Authentication idempotency pre-authentication context

## Decision

1. The browser pre-authentication cookie is host-only. Do not set the `Domain` attribute.
2. Set `Path=/api/v1/auth`, `Secure`, `HttpOnly`, and `SameSite=Lax`.
3. Set `Max-Age=600` (10 minutes). The server-side pre-authentication context must expire no later than the cookie.
4. Persist only a cryptographic hash or non-reversible reference to the pre-authentication identifier. Never persist or log its raw value.
5. Bind unauthenticated authentication mutations that require idempotency to the appropriate live pre-authentication context, including login and password-reset request/completion. Password-reset completion must additionally validate the reset token and its state. These bindings must not disclose whether an account exists.
6. Preserve existing CSRF and Origin validation requirements. The pre-authentication cookie is not a substitute for CSRF protection.
7. Rotate or invalidate the pre-authentication context after successful login, expiry, revocation, or other completion that makes the context no longer appropriate. A completed login must not leave the old context usable for a new login operation.
8. Non-browser clients require a separately specified client-binding mechanism. Do not silently reuse the browser-cookie design for them.

## Rationale

This limits cross-client idempotency replay and prevents an unauthenticated caller from using another client's operation context. Cookie scope and lifecycle are explicit and aligned with the approved 10-minute lifetime.

## Constraints

This is a design decision. It does not authorize Prisma schema changes, migrations, or implementation. Physical representation and endpoint integration remain subject to ERD and contract review.
