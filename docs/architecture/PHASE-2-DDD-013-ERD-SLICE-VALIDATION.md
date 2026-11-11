# DDD-013 Authentication Idempotency ERD-Slice Validation

- Review date: 2026-11-02
- Scope: Authentication idempotency conceptual ERD, data model, and proposed PostgreSQL physical design
- Reviewed sources: PR #35 DDD-013 specification/ERD branch and `phase-1/requirements-consolidation` physical-design branch
- Review outcome: **NOT READY FOR PHYSICAL-DESIGN APPROVAL**
- DDD-013 final approval: **NOT GRANTED**
- Implementation authorization: **NOT AUTHORIZED**

## 1. Purpose and boundary

This review checks whether the current conceptual ERD and physical database proposal represent the recovered and approved AUTH-IDEM-001–041 contract, including the AUTH-IDEM-016 overflow clarification dated 2026-11-02.

This is a document-level consistency review. It is not SQL validation, PostgreSQL execution, load/concurrency testing, security testing, or approval of a physical schema.

No application code, Prisma schema, SQL DDL, migration, database object, seed, generated client, API, or runtime behavior is created or authorized by this review.

## 2. Sources examined

| Source | Revision / branch | Relevant content |
|---|---|---|
| `docs/database/DDD-013-AUTHENTICATION-IDEMPOTENCY-SPECIFICATION.md` | `spec/ddd-013-auth-idempotency-20261030`, blob `d04bd6212f6eed7279e3a50fa1e9a927e31d2d59` | Approved policy/contract baseline AUTH-IDEM-001–041 |
| `docs/database/ERD.md` | `spec/ddd-013-auth-idempotency-20261030`, blob `454b98051a389c87a3d180b5f2e98cff6c0f1fff` | Conceptual authentication/idempotency relationships and persistence requirements |
| `docs/database/DATA-MODEL.md` | `spec/ddd-013-auth-idempotency-20261030`, blob `4e31dddfbc5fcfcc8220081dc4a65af4239564b8` | Conceptual entity responsibilities and security boundaries |
| `docs/database/DDD-013-CONSISTENCY-REVIEW.md` | `spec/ddd-013-auth-idempotency-20261030` | Prior policy consistency review and ERD readiness checklist |
| `docs/architecture/PHASE-2-PHYSICAL-DATABASE-DESIGN.md` | `phase-1/requirements-consolidation`, blob `bc900e506a45d1648b37646c511ad7b96cc837b5` | Proposed PostgreSQL `idempotency_records` and `outbox_messages` |
| `docs/architecture/PHASE-2-CANONICAL-INDEX-INVENTORY.md` | `phase-1/requirements-consolidation`, blob `fea97ea3d29f9617227969e49d32219545ad6d69` | Proposed idempotency indexes |

The conceptual specification and physical-design proposal are not at the same revision lineage. Findings below must be reconciled into one controlled physical-design revision before approval.

## 3. Conceptual ERD assessment

The conceptual ERD in the PR #35 specification branch represents the following key requirements:

| Requirement | Conceptual representation | Assessment |
|---|---|---|
| Authenticated and pre-authenticated requests | Mutually exclusive identity modes on `IDEMPOTENCY_RECORD`; `USER`, `SESSION`, and `PRE_AUTH_CONTEXT` relationships | **PASS at conceptual level** |
| Login and unauthenticated password-reset scope | `PRE_AUTH_CONTEXT` independent of User | **PASS at conceptual level** |
| Password-reset delivery | `OUTBOX_MESSAGE` linked to reset token and idempotency operation; external protected secret-store boundary | **PASS at conceptual level** |
| Fingerprint and HMAC metadata | Required by ERD §9.6 | **PASS as a modeling requirement; exact fields not specified** |
| Operation state, lease and fencing | Required by ERD §9.6 | **PASS as a modeling requirement; exact physical enforcement not specified** |
| Tombstone and recovery lifecycle | Required by ERD §9.6 | **PASS as a modeling requirement; exact physical representation not selected** |
| Scope uniqueness | Separate authenticated/pre-authentication partial unique indexes or equivalent | **PASS as a required strategy; predicates not yet physically validated** |
| Endpoint transactions and safe replay | Required by ERD §§9.6–9.7 and consolidated specification | **PASS as a design requirement; implementation evidence absent** |

The conceptual model is directionally consistent with the approved contract. It is not sufficient to approve the physical design.

## 4. Blocking physical-design findings

### PDB-D13-01 — Physical idempotency table cannot represent pre-authentication scope

**Severity:** BLOCKER

The physical proposal defines:

`actor_user_account_id uuid NOT NULL FK user_accounts(id)`

on `idempotency_records`.

The approved contract requires mutually exclusive authenticated and pre-authenticated scope modes. Login and unauthenticated password-reset mutations use a `PRE_AUTH_CONTEXT` independent of User. A mandatory authenticated user FK makes a pre-authentication-only operation impossible to represent without inventing a user identity or weakening the approved scope boundary.

**Required correction:** Redesign the proposed physical identity representation so one record is bound to exactly one approved mode. The authenticated mode must carry its approved principal and applicable session identity; the pre-authentication mode must reference `PRE_AUTH_CONTEXT`. Define nullability and mode exclusivity explicitly. Do not create a guardian, anonymous-user, or synthetic-user workaround.

### PDB-D13-02 — Proposed unique indexes implement a different scope model

**Severity:** BLOCKER

The current physical design and canonical index inventory define four partial unique indexes for global, district, church, and department scope. Their identity uses `actor_user_account_id`, `operation_code`, optional organizational scope, and `key_digest`.

The approved AUTH-IDEM contract requires distinct authenticated/pre-authentication scope modes and requires identity lookup before comparing the request fingerprint. The conceptual ERD explicitly calls for separate partial unique indexes or an equivalent NULL-safe strategy for the two modes.

The four current indexes do not demonstrate uniqueness for pre-authentication context and do not prove the mutually exclusive authenticated/pre-authentication identity rule.

**Required correction:** Replace or formally reconcile the four-index proposal with a complete uniqueness design for the approved identity modes. Show exact ordered key columns and predicates for each mode, including applicable session semantics. Keep the request fingerprint outside the identity uniqueness key. Verify that same-key/different-fingerprint requests resolve to AUTH-IDEM-041 conflict behavior.

### PDB-D13-03 — Approved DDD-013 persistence attributes are absent from the physical table definition

**Severity:** BLOCKER

The current `idempotency_records` definition includes a key digest, actor, operation, optional organizational scope, request fingerprint, status, creation/lease/completion timestamps, and a safe-result reference. It does not define or map the following approved contract data:

- HMAC key-version identifier used to verify the original fingerprint on retry.
- PostgreSQL BIGINT fencing/version counter, initial value 0, incremented exactly once per successful recovery claim.
- Explicit terminal response-retention deadline.
- Compact key tombstone identity and expiry.
- Recovery classification/outcome and scheduling/reconciliation metadata, whether stored on this record or a clearly defined related record.
- Sufficient safe terminal result metadata for endpoint-specific replay without persisting authentication secrets.

The current status is an unconstrained `varchar(20)` in the physical proposal. The persisted values must be constrained to `IN_PROGRESS`, `COMPLETED`, and `FAILED`; recovery classifications must not be added as persisted operation states.

**Required correction:** Map each approved data responsibility to a proposed column or related entity, state its lifecycle and retention behavior, and show how the database/application contract prevents overflow, stale fencing commits, unsafe replay, and premature cleanup. The AUTH-IDEM-016 overflow rule is fail-closed integrity failure with no wrap, reset, or reuse.

### PDB-D13-04 — Password-reset outbox relationship is not physically reconciled

**Severity:** BLOCKER

The conceptual ERD requires `OUTBOX_MESSAGE` to relate to the password-reset token and idempotency operation, and to carry an opaque reference to a separately envelope-encrypted short-lived delivery secret. The physical design has a generic `outbox_messages` table for integration/domain events, but its current definition does not demonstrate the required password-reset token/idempotency relationships or the protected secret-reference lifecycle.

**Required correction:** Define how the generic outbox safely represents this specific delivery workflow, or propose a distinct related structure. Show the atomic transaction linking reset-token creation, idempotency completion, and outbox persistence. The queue and ordinary database payload must contain only an opaque reference, never the raw reset secret. The external secret store must expire the secret no later than the reset-token lifetime and erase it after delivery or expiry. No vendor is assumed.

### PDB-D13-05 — Authentication scope and general business idempotency are not separated in the physical proposal

**Severity:** HIGH

The physical design describes `idempotency_records` as a generic record with organizational scope. The approved DDD-013 contract is specifically for authentication mutations. The conceptual ERD says other business-domain idempotency remains unresolved and must not inherit the authentication policy by assumption.

**Required correction:** State whether the physical structure is authentication-only or supports multiple explicitly versioned domains. If shared, separate domain-specific identity, policy, retention, replay, and lifecycle contracts. Do not imply that attendance, finance, credential, event, or integration mutations inherit AUTH-IDEM-001–041.

### PDB-D13-06 — Foreign keys and lifecycle enforcement are not demonstrated for the approved scope modes

**Severity:** BLOCKER

The current physical table definition does not provide a `PRE_AUTH_CONTEXT` foreign key, nor a demonstrated mutually exclusive authenticated/pre-authentication identity constraint. It also does not demonstrate the relationship between applicable session scope and the authenticated identity. The conceptual ERD requires these distinctions.

**Required correction:** Provide a named FK and CHECK/constraint strategy for each mode, exact nullability, delete/update actions, and the required FK-supporting indexes. Prove that authenticated scope cannot reference an unrelated session and pre-authentication scope cannot also carry an authenticated principal/session. Preserve session ownership independently from User–Member cardinality.

## 5. Cross-check of approved contract behavior

The consolidated DDD-013 specification records the following policy/contract baseline. These items remain subject to physical mapping and test design:

- UUID v4 client key, one key per logical operation, same key only for exact retries.
- Scope isolation by operation and authenticated principal/session or pre-authentication context.
- SHA-256 server fingerprint, RFC 8785 JSON canonicalization, HMAC-SHA-256 for sensitive fields, versioned 256-bit keys.
- Persisted states `IN_PROGRESS`, `COMPLETED`, `FAILED`.
- Two-minute fixed lease without automatic renewal.
- PostgreSQL row-level locking, READ COMMITTED, five-second lock timeout, ten-second maximum transaction duration.
- BIGINT fencing counter, initial 0, increment by one for each successful recovery claim; overflow fails closed as an integrity failure.
- Five bounded lock-contention retry delays with full jitter; no blind client or server re-execution after uncertain outcomes.
- PostgreSQL authoritative state; BullMQ/Redis scheduling and delivery only.
- Endpoint-specific replay; raw passwords, tokens, cookies, reset links and other secrets are never persisted or replayed.
- 24-hour completed and failed record retention, 30-day compact tombstones, subject to holds and unresolved recovery.
- Transactional outbox and protected reset-delivery secret boundary.
- Current authorization/context revalidation before safe result disclosure.

The PR #35 consistency review reports policy consistency PASS, but ERD readiness NOT READY. This review does not overturn that status.

## 6. Required physical-design remediation sequence

1. Reconcile the `idempotency_records` identity model with the authenticated/pre-authentication modes.
2. Redesign the unique-index proposal and document exact predicates, key ordering, and NULL-safe enforcement.
3. Map HMAC key version, state, lease, fencing counter, safe result, retention, tombstone, and recovery data to columns or related records.
4. Reconcile the password-reset outbox/token/idempotency relationship and external secret-store reference.
5. Add and verify all required FKs, CHECK constraints, nullability, delete/update actions, and supporting indexes.
6. Separate authentication idempotency from unresolved business-domain idempotency.
7. Update the physical table definitions, column register, FK register, index inventory, relational integrity matrix, lifecycle catalogue, and DDD-013 consistency review as one controlled documentation revision.
8. Perform an independent review of the revised documents. Only then prepare the final DDD-013 approval package for the project owner.

No SQL or Prisma artifact is to be generated as part of these documentation corrections.

## 7. Final assessment

| Gate | Result |
|---|---|
| AUTH-IDEM-001–041 policy evidence recovered | **PASS, repository-record level** |
| AUTH-IDEM-016 overflow rule clarified | **PASS** |
| Conceptual ERD represents the required DDD-013 boundaries | **PASS, conceptual only** |
| Physical identity supports authenticated and pre-authentication modes | **FAIL / BLOCKER** |
| Physical uniqueness strategy matches approved identity semantics | **FAIL / BLOCKER** |
| Required HMAC, fencing, tombstone, retention and recovery data mapped | **FAIL / BLOCKER** |
| Password-reset outbox/secret boundary physically reconciled | **FAIL / BLOCKER** |
| DDD-013 ERD slice ready for formal approval | **NO** |
| Physical database design approved | **NO** |
| Implementation authorized | **NO** |

**Disposition:** Keep DDD-013 at **APPROVED POLICY / PHYSICAL ERD REMEDIATION REQUIRED**. The physical design proposal must be reconciled before final DDD-013 approval. No implementation gate changes.


## 8. Remediation proposal submitted for independent review

A candidate response to PDB-D13-01 through PDB-D13-06 is documented in [DDD-013 Physical Design Revision D13-PDR-01](./PHASE-2-DDD-013-PHYSICAL-DESIGN-REVISION.md).

The revision proposes:
- An explicit AUTHENTICATED/PRE_AUTHENTICATION scope mode with mutually exclusive principal/session versus pre-auth context references.
- Two mode-specific unique identity indexes. Request fingerprint remains outside the uniqueness key so AUTH-IDEM-041 conflict detection remains possible.
- Server-derived scope fingerprint rather than carrying unresolved district/church/department scope columns on the authentication idempotency table.
- HMAC key-version, fixed lease, BIGINT fencing, safe result, response-retention, tombstone and recovery metadata.
- An optional append-only recovery-attempt ledger for independent review.
- Explicit password-reset outbox links to the idempotency record and reset-token record, with an opaque external secret reference only.
- Authentication-only domain boundary.

The proposal is intentionally not treated as approved. The prior physical definition and four organizational-scope indexes are marked superseded for authentication idempotency. The column and FK registers now carry revision overlays requiring regeneration after reviewer/owner acceptance; they are not falsely represented as fully reconciled canonical registers yet.

**Independent review status: SUBMITTED / AWAITING REVIEW.**
**Physical design approval: NOT GRANTED.**
**DDD-013 final approval: NOT GRANTED.**
**Implementation: NOT AUTHORIZED.**


## 9. Technical refinement and current disposition

The internal engineering refinement is recorded in [Phase 2 Technical Blocker Resolution TBR-01](./PHASE-2-TECHNICAL-BLOCKER-RESOLUTION.md) and incorporated into the revised [DDD-013 Physical Design Revision D13-PDR-01](./PHASE-2-DDD-013-PHYSICAL-DESIGN-REVISION.md).

The refined DDD-013 candidate now gives exact session-owner composite FK semantics, versioned scope-fingerprint encoding, append-only recovery-event history, same-row tombstone compaction and external reset-secret transaction choreography. The five prior physical findings are addressed at proposal level; this is not independent reviewer acceptance or PostgreSQL execution evidence.

**Current disposition:** DDD-013 technical proposal refined; independent review pending; owner physical approval not granted; DDD-013 final physical approval not granted; implementation not authorized.
