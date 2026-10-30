# AUTH-IDEM-040: Idempotency Replay Authorization Context

**Status:** Approved by product owner  
**Date:** 2026-10-30  
**Scope:** Authorization and context validation before returning an idempotent response

## Decision

1. Every replay must validate the current operation context before returning a stored response. A matching idempotency key and fingerprint alone do not authorize disclosure.
2. Authenticated operations require the current authenticated principal and applicable active session to match the stored scope. Re-evaluate current account/session status and the authorization required to receive the response.
3. Login replay requires the same live, valid pre-authentication context bound to the original operation. Never replay authentication cookies, access credentials, or refresh credentials.
4. Password-reset request replay requires the appropriate live pre-authentication context. Return only the approved generic response and do not disclose account existence or reset-token state.
5. Password-reset completion replay requires the appropriate live pre-authentication context and validation that the referenced reset operation/token state permits the safe response. Never replay or disclose the reset token.
6. If the required context is expired, revoked, mismatched, or no longer authorized, do not return the stored response. Return a safe authentication/authorization failure that does not disclose sensitive account or operation information.
7. Apply the same validation to any future unauthenticated authentication mutation, with its binding defined in that endpoint's contract.

## Rationale

Idempotency is a duplicate-execution control, not an authorization bypass. Replay must preserve the endpoint's current authentication, authorization, and anti-enumeration requirements.

## Constraints

This clarifies AUTH-IDEM-022 for authentication endpoints. Exact status codes and safe error envelopes remain governed by the API contract. No implementation or schema change is authorized by this decision alone.
