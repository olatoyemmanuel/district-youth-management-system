# AUTH-IDEM-038: PostgreSQL Idempotency Scope Uniqueness

**Status:** Approved by product owner  
**Date:** 2026-10-30  
**Scope:** Physical uniqueness model for authentication idempotency

## Decision

1. Authenticated and pre-authentication idempotency scopes must be represented as mutually exclusive identity modes.
2. Exactly one scope mode applies to each idempotency record: authenticated principal/session scope, or pre-authentication context scope, as applicable to the operation.
3. Do not rely on one ordinary PostgreSQL composite UNIQUE constraint containing nullable principal, session, or pre-authentication columns to enforce logical uniqueness. PostgreSQL's default NULL uniqueness semantics do not provide the required guarantee.
4. Enforce uniqueness separately for each identity mode using partial unique indexes or an equivalent PostgreSQL design that demonstrably enforces the same invariant.
5. The logical uniqueness identity remains the approved AUTH-IDEM-035 tuple: operation identifier, endpoint identity, principal or pre-authentication context, active session where applicable, and idempotency-key hash. Request fingerprint remains a separate value used to detect key reuse with a different request.
6. The ERD must show the two scope modes, exclusivity invariant, exact unique-index predicates, and relevant foreign keys before schema approval.

## Rationale

This avoids a false uniqueness guarantee caused by nullable columns and makes authenticated and unauthenticated operation identities explicit.

## Constraints

The precise columns, predicates, and migration SQL remain subject to ERD review and explicit schema authorization. This decision does not authorize Prisma models or migrations.
