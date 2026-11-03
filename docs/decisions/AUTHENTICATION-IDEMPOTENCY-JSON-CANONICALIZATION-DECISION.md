# Authentication Idempotency JSON Canonicalization Decision

- Decision ID: AUTH-IDEM-006
- Related decisions: AUTH-IDEM-001, AUTH-IDEM-002, AUTH-IDEM-003, AUTH-IDEM-004, AUTH-IDEM-005
- Related domain decision: DDD-013 (Idempotency contract)
- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Canonicalization of JSON request payloads for authentication idempotency fingerprints

## Decision

DYMS shall use RFC 8785, JSON Canonicalization Scheme (JCS), to canonicalize JSON request payloads before calculating their SHA-256 request fingerprints.

For request inputs that are not JSON, DYMS shall define explicit normalization rules. Non-JSON inputs must not be implicitly converted to JSON or normalized using unspecified behavior.

## Requirements

1. The server shall perform canonicalization.
2. JSON payloads shall be processed according to RFC 8785 JCS before fingerprint calculation.
3. Canonicalization must be deterministic so equivalent supported JSON inputs produce the same canonical representation.
4. Non-JSON request components require separately specified, deterministic normalization rules.
5. Authentication secrets must not be persisted in raw form as part of idempotency records, logs, or diagnostic output.
6. The implementation must define safe handling of sensitive JSON fields while preserving reliable detection of changed requests.

## Decision boundary

This decision approves RFC 8785 JCS for JSON request payload canonicalization. It does not define normalization for query parameters, path parameters, form data, multipart requests, or other non-JSON inputs. It also does not define sensitive-field transformation, canonical input composition across HTTP components, fingerprint storage, response replay, retention, concurrency, or failure recovery. These details remain open under DDD-013 and require separate decisions.

This decision does not authorize Prisma models, migrations, or implementation.

Changes require explicit change control.
