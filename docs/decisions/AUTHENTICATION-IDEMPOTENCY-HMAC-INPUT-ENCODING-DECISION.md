# AUTH-IDEM-028: Authentication Idempotency HMAC Input Encoding

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: HMAC input encoding for sensitive fields in authentication request fingerprints

## Decision

Use an unambiguous, versioned, length-prefixed and domain-separated encoding for each sensitive-field HMAC input. The input must identify the operation, field, HMAC key version, and sensitive value. Replace sensitive request values with their HMAC representation and key version before calculating the final SHA-256 request fingerprint.

## Rationale

Explicit field and operation boundaries prevent ambiguous concatenation and reduce the risk of cross-operation or cross-field HMAC reuse.

## Constraints

- Use the approved HMAC-SHA-256 algorithm and cryptographically random 256-bit keys.
- Keep HMAC keys outside the database and source repository in deployment secrets.
- Never persist raw sensitive values or credentials in idempotency records, logs, audit events, traces, queue payloads, or errors.
- Preserve key version information for records that depend on a particular key.

## Consequences

Implementation must define and test a deterministic binary or textual length-prefixed encoding, including encoding version and field identity. The final fingerprint envelope must be deterministic across supported application instances.
