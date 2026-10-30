# AUTH-IDEM-041: Idempotency Key Fingerprint Conflict Response

**Status:** Approved by product owner  
**Date:** 2026-10-30  
**Scope:** Reuse of an idempotency identity with a different request fingerprint

## Decision

1. If an idempotency identity already exists and the incoming request has a different server-computed fingerprint, reject the request with HTTP 409 Conflict.
2. Use error code `IDEMPOTENCY_KEY_REUSED` in the standard DYMS API error envelope.
3. Do not execute the incoming request, alter the original operation, or replace its stored fingerprint/response.
4. The response must not disclose the original request payload, sensitive fields, stored response, account existence, or other protected operation data.
5. Record a security-relevant event using safe metadata sufficient to investigate key misuse. Do not record raw idempotency keys, credentials, cookies, reset tokens, or sensitive request values.
6. This response is distinct from `IDEMPOTENCY_IN_PROGRESS`, which remains HTTP 409 with `Retry-After: 1` under AUTH-IDEM-031.

## Rationale

A key identifies one logical operation. Reusing its identity with a different request is a client contract violation and must never cause a second operation to run.

## Constraints

This decision formalizes the HTTP contract for a conflict already prohibited by the idempotency policy. It does not authorize implementation or schema changes.
