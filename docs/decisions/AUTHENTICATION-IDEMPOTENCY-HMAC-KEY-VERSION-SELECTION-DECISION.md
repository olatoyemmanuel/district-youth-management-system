# AUTH-IDEM-037: HMAC Key-Version Selection on Idempotency Retries

**Status:** Approved by product owner  
**Date:** 2026-10-30  
**Scope:** Sensitive-field fingerprint verification for authentication idempotency

## Decision

1. A newly accepted logical operation uses the currently active HMAC key version.
2. A retry matching an existing idempotency identity must use the HMAC key version recorded with that existing operation to recompute and compare its request fingerprint. It must not silently use the currently active key version instead.
3. Retain each prior HMAC key version for as long as any unexpired idempotency response record or key tombstone requires it for safe identity/fingerprint verification.
4. Key-version identifiers must be stored with the relevant idempotency record and be unambiguous.
5. If the required key version is unavailable, disabled, or suspected compromised and safe verification is impossible, do not execute the operation and do not reinterpret the request under another key. Route the case to controlled recovery or manual security review.
6. Key rotation and compromise handling must follow AUTH-IDEM-008 and AUTH-IDEM-034. This decision clarifies which key is selected when verifying retries.

## Rationale

A retry must be evaluated using the same cryptographic interpretation as the original operation. Recomputing with a newly rotated key would create false fingerprint mismatches or unsafe ambiguity.

## Constraints

Design only. No key material belongs in source control, database records, logs, or client responses. No schema or implementation is authorized by this decision alone.
