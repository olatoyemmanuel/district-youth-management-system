# AUTH-IDEM-027: Authentication Request Canonicalization

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Request representation used for authentication idempotency fingerprints

## Decision

Authentication mutation endpoints accept JSON request bodies only. Canonicalize JSON using RFC 8785 JSON Canonicalization Scheme. Identify an endpoint by HTTP method and stable route template. Include only query parameters explicitly defined as semantically relevant by that endpoint. Reject unsupported content types with HTTP 415.

## Rationale

A restricted and deterministic request format prevents ambiguity in fingerprint calculation and avoids implicit canonicalization rules for multipart or other body formats.

## Constraints

- Preserve the approved SHA-256 request fingerprint and HMAC-SHA-256 sensitive-field treatment.
- Do not include cookies, authentication credentials, idempotency keys, or volatile transport headers in the canonical request representation.
- Route identity must use a stable route template, not a concrete path containing user-controlled identifiers unless the endpoint contract explicitly requires them.
- Query parameters are excluded unless explicitly declared relevant.

## Consequences

Authentication endpoint contracts must declare their accepted JSON schema and any relevant query parameters. Unsupported content types must fail before operation execution.
