# AUTH-IDEM-035: Authentication Idempotency Database Identity and Constraints

- Status: APPROVED
- Approval date: 2026-10-30
- Scope: Logical identity, uniqueness, and query indexes for authentication idempotency records

## Decision

Define idempotency logical identity using a unique composite scope comprising:

- Operation identifier.
- Endpoint identity.
- Principal or pre-authentication context, as applicable.
- Active session, where applicable.
- Idempotency-key hash.

Store the request fingerprint separately. A request that matches the logical identity but supplies a different fingerprint must be rejected and must not execute.

Provide indexes supporting lookup and operational processing by:

- Operation state.
- Processing lease expiry.
- Terminal-record expiry.
- Recovery scheduling.
- Principal and session.

## Rationale

A stable scoped identity prevents duplicate records for the same logical operation, while a separate fingerprint detects attempts to reuse a key with a different request.

## Constraints

- Store a hash of the idempotency key, not a raw secret-bearing key representation.
- Preserve the separate safe pre-authentication scope for login.
- Uniqueness and indexes must be consistent with the approved operation-scoping and fingerprint decisions.
- The exact physical column set, partial indexes, and foreign-key relationships require ERD review and must not be inferred from this logical decision alone.
- No Prisma schema or migration is authorized by this decision.

## Consequences

The authentication idempotency ERD slice must specify the physical uniqueness constraint, supporting indexes, lifecycle checks, and relationship behavior for review before schema authorization.
