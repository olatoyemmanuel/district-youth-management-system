# DYMS Final ERD and Database Domain Model Review

> **Restoration and current-decision note (2026-10-30):** This document is restored from the latest recoverable project snapshot located in the user's saved files. Its original content is retained as the design baseline, with the status corrections below taking precedence wherever older text conflicts. This restoration is not ERD approval and does not authorize Prisma models or migrations.
>
> Current resolutions: DDD-001 adopts PRB-001 v0.1 as the reconstructed, versioned working baseline; the historical original PRD remains unrecovered. MEM-02 one-to-one User–Member is approved. DDD-002 allows overlapping Ambassador and Young Adult affiliations at age 21 with local approval. DDD-003 approves one current primary church and atomic, history-preserving transfers. DDD-004 approves annual Jan 1–Dec 31 appointments, higher-authority renewal as a new historical record, and no self-renewal. Authentication idempotency decisions AUTH-IDEM-001–041 are consolidated in DDD-013; that domain is not blanket approval of idempotency for other business domains.

## 1. Review status

**NOT READY — material blockers remain.**

This is a completed remediation review of the conceptual database design. It does not approve the ERD, authorize a Prisma schema or migration, alter DFR-001 through DFR-006, or certify implementation readiness.

The design documents have undergone structural reconciliation and are ready for focused product and design-decision review. Final approval must wait for the authoritative evidence and decisions listed in §5.

## 2. Scope and evidence

The review inspected:

- `README.md`
- `docs/architecture/ARCHITECTURE.md`
- `docs/security/SECURITY-BASELINE.md`
- `docs/decisions/DECISION-REGISTER.md`
- `docs/database/ERD.md`
- `docs/database/DATA-MODEL.md`
- Available Git history, including the original data-model commit `440b929`

No authoritative product-requirements document was identified in the reviewed tree or available Git history. The provenance classification is recorded in [Requirements Traceability](REQUIREMENTS-TRACEABILITY.md) §2.

This review records the state of the reviewed documentation. It does not establish that every proposed relationship, cardinality, lifecycle rule, or enforcement mechanism has authoritative approval.

## 3. Remediation completed

| Finding                                                                             | Correction                                                                 |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ERD and data-model inventories differed.                                            | Reconciled the 28-entity inventory in both documents, including `ROLE_PERMISSION` and `REFRESH_TOKEN_USE`.                                                         |
| Entity purpose, ownership, cardinality, history, and open decisions were scattered. | Added the per-entity responsibility catalogue in `DATA-MODEL.md` §11.1.                                                                 |
| Appointment actor relationships were ambiguous.                                     | Distinguished appointment subject, linked role assignment, creator, approver, and ending/revokingactor in ERD §§4.2.1–4.2.2.                                      |
| Authorization risks from multiple assignments were not explicit.                    | Preserved the separate linked assignment/appointment model and documented missing precedence, role catalogue, scope, and conflict rules as blocked.                |
| Authentication inventory omitted refresh-token history.                             | Added `REFRESH_TOKEN_USE` and documented required hash-only rotation, confirmed-reuse, lost-response, and transactional behavior.                                  |
| No single integrity-to-test record existed.                                         | Added the [Invariant Enforcement Register](INVARIANT-ENFORCEMENT-REGISTER.md), distinguishing database, transaction, and application enforcement.                  |
| No requirement-provenance matrix existed.                                           | Added the [Requirements Traceability Matrix](REQUIREMENTS-TRACEABILITY.md), including DFR-001–DFR-006 coverage and explicit source classifications.                |
| DFR-005 lacked design traceability.                                                 | Added DFR-005 operational-artifact traceability. Required artifacts are recorded as outstanding implementation deliverables, not completed controls.               |
| Audit-retention status needed explicit qualification.                               | Documented append-only controls separately from the unresolved retention period and exceptions; DDD-014 remains blocked, and indefinite retention is not approved. |

No existing approved decision was modified. No entity was added solely to model backup infrastructure, and no unresolved product policy was presented as an approved fact.

## 4. Conceptual database readiness

| Design dimension                                | Review result                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Primary keys and time/money conventions         | UUID, UTC/event-time-zone, and fixed-decimal requirements are preserved from DFR-003. Exact fields and decimal precision await schemaand product decisions.                     |
| Required/optional relationships and cardinality | Reconciled conceptually in the ERD diagrams and `DATA-MODEL.md` §11.1. Ambiguous finance and polymorphic-scope details remain blocked. The proposed one-to-one `USER`–`MEMBER` cardinality is not authoritatively confirmed (RT-003).                     |
| Foreign-key ownership and business uniqueness   | Conceptual ownership is catalogued. Concrete composite keys, partial uniqueness, and check constraints remain proposed or blocked where policy is missing.                     |
| Authorization and lifecycle indexing            | Scope, active-state, effective-date, andhistory-query needs are recorded. Exact index design remains a schema-design deliverable.                     |
| Historical preservation and retention           | Preservation requirements and history controls are documented for relevant business and security records. Audit logs must remain append-only under approved controls, but the audit-retention period and exceptions remain unresolved under DDD-014, AD-06, and RT-026. Append-only integrity does not authorize indefinite retention. Retention and deletion rules for other record classes must also follow their applicable approved policies. |
| Transactions and concurrency                    | Required transaction boundaries and racerisks are recorded in the invariant register. Several mechanisms require product or schema decisions before implementation.                     |
| Append-only and immutable records               | Audit logs are append-only under approved controls; posted finance transactions are immutable; attendance corrections and credential histories must preserve the required history. Implementation controls and tests remain futurework. These integrity requirements do not, by themselves, determine retention periods.                     |

Conceptual reconciliation does not constitute approval of every proposed relationship, cardinality, lifecycle rule, or database constraint.

## 5. Material blockers to final ERD approval

| Blocker                             | Exact decision or evidence required                                    | Consequence if unresolved                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Authoritative product requirements  | Provide the approved requirements record or explicitly approve a reconstructed, versioned replacement.                                    | Proposed entities, lifecycle rules, and cardinalities cannot be fully verified.                        |
| Membership categories and transfers | Define category transitions/history and transfer-state and concurrency policies.                                    | Current-membership and category schema cannot be finalized.                                            |
| User–member cardinality             | Confirm the proposed one-to-one `USER`–`MEMBER` relationship from an authoritative product requirement (RT-003).                                    | The relationship and its uniqueness constraints cannotbe finalized.                                   |
| Leadership and authorization        | Define the role catalogue, assignment-scope representation, appointment states, mid-year/renewal/overlap rules, appointment-independent roles, permission combination and precedence. | Effective access and contradictory-active-record constraints cannot be safely implemented.             |
| Event registration                  | Define ownership, registration eligibility, active-registration uniqueness, cancellation, capacity, and waitlist rules (DDD-007 / RT-025).                                    | Registration constraints and lifecycle behavior would be invented by implementation.                   |
| Attendance                          | Define duplicate-scan responses, correction conflicts, authorization, and applicable retention rules.                                    | Attendance behavior and correction enforcement cannot be finalized safely.                             |
| Finance                             | Define account ownership and requiredness, currencies, numbering, lifecycle, authorities, thresholds/stages, and reversal-concurrency policy.                                    | The finance schema cannot safely represent a complete authorized lifecycle.                            |
| Credentials                         | Define catalogue ownership, eligibility, issuer authority, reissuance criteria, verification disclosure, privacy, and retention.                                    | Credential issuance and verification cannot be authorized or disclosed safely.                         |
| Audit access and retention          | Define the audit actor model, access policy, retention period, and exceptions. DDD-014, invariant AD-06, and RT-026 remain blocked; indefinite retention must not be assumed.         | Audit access and retention behavior cannot be approvedor implemented against an authoritative policy. |
| Idempotency and external effects    | Define idempotency key, request fingerprint, replay and recovery behavior, external-side-effect coordination, and security-record retention.                                    | Retry safety and recovery behavior cannot be established consistently across endpoints.                |

The complete questions, evidence rationale, and traceability references are in [RequirementsTraceability](REQUIREMENTS-TRACEABILITY.md) §6 and the [Database Design Decision Register](DATABASE-DESIGN-DECISION-REGISTER.md).

## 6. Non-blocking implementation deliverables after approval

After the blocked product decisions are resolved and the ERD is explicitly approved, schema and feature design must still select and review exact field names, index definitions, decimalprecision, check-constraint expressions, transaction-isolation or locking techniques, and operational implementations for DFR-005.

These implementation choices must preserve the approved controls and must not introduce unapproved product rules. Any change to an approved decision must follow DFR-006 change control.

## 7. Approval checklist for the user

Before granting final ERD approval, confirm that:

1. An authoritative product-requirements source has been recovered or a reconstructed sourcehas been explicitly approved.
2. Every blocker in §5 has a recorded decision, owner, and authoritative source or approved decision record.
3. `ERD.md`, `DATA-MODEL.md`, the traceability matrix, the invariant register, and the decision register have been reconciled against those decisions, with no remaining contradictory rule.
4. Proposed relationships and cardinalities—including RT-003—have authoritative support, andconstraints, transaction boundaries, authorization checks, and test cases have been reviewedagainst the invariant register.
5. Event-registration policy (DDD-007 / RT-025) and audit-retention policy (DDD-014 / AD-06 / RT-026) are explicitly resolved. Indefinite audit retention must not be assumed without formal approval.
6. DFR-005 operational artifacts have owners and an implementation plan; restore evidence isscheduled before production release.
7. Any specification change is handled through DFR-006 change control.
8. You explicitly approve the final ERD before any Prisma model or migration work begins.

**Final disposition: NOT READY.** This review documents remediation and outstanding decisions; it does not grant ERD approval or authorize schema implementation.
nuel_toye@nueltoye:~/project/dyms$

## 9. Current decision reconciliation — 2026-10-30

This section supersedes older traceability rows only for the specific decisions stated below. It does not imply that every related implementation mechanism is approved.

| Requirement | Current approved rule | Design trace | Status and remaining boundary |
|---|---|---|---|
| RT-003 / MEM-02 | Every Member has exactly one User; each User has at most one Member. | USER ↔ MEMBER; unique User reference from Member. | **Policy approved 2026-10-30.** Exact mandatory-participation enforcement remains a schema-design choice. |
| RT-004 / DDD-003 | Each Member has one current primary church. Transfer closes the previous membership and opens the new membership atomically; history is preserved. | MEMBER, CHURCH, CHURCH_MEMBERSHIP_HISTORY. | **Policy approved 2026-10-30.** Exact concurrency/constraint mechanism remains proposed. |
| RT-006 / DDD-002 | Top-level categories: Adventurer 4–9, Pathfinder 10–15, Senior Youth 16–30+. Ambassador and Young Adult are Senior Youth affiliations; Public Campus Ministry is an additional affiliation; Master Guide is a credential/training pathway. | Member category and ministry affiliation representation; CREDENTIAL_DEFINITION, MEMBER_CREDENTIAL. | **Classification approved 2026-10-30.** A 21-year-old may hold both Ambassador and Young Adult affiliations with local ministry approval. Other transition/history details remain open. |
| RT-008 / DDD-004 | Appointment term is Jan 1–Dec 31. Renewal creates a new historical appointment; higher authority controls appointment/renewal; no self-appointment or self-renewal. | ROLE_ASSIGNMENT, APPOINTMENT, actor/authority references. | **Policy approved 2026-10-30.** Role catalogue, precedence, and conflicting-position matrix remain blocked under DDD-005. |
| RT-027 / DDD-013 | Authentication mutations use the approved idempotency contract in AUTH-IDEM-001–041. | IDEMPOTENCY_RECORD and protected authentication mutation workflows. | **Authentication policy consolidated.** DDD-013 consistency review passed policy consistency but lists implementation-contract gaps; authentication ERD slice is NOT READY. Do not infer idempotency policy for all business domains. |
| RT-028 / DDD-014 | Authentication retention: sessions 12 months; refresh-token history 12 months; password-reset records 90 days; security events 24 months, measured from the approved lifecycle event. Legal holds/investigations suspend deletion. | SESSION, REFRESH_TOKEN_USE, PASSWORD_RESET_TOKEN, SECURITY_EVENT. | **Authentication retention approved 2026-10-30.** Other business-domain retention remains blocked. Backup retention is separate. |

### 9.1 Product baseline provenance

PRB-001 v0.1 is approved as the reconstructed, versioned working product baseline. The historical authoritative original PRD remains unrecovered. Do not describe PRB-001 as the historical original. The baseline approval does not approve every proposed requirement or close unrelated blockers.

### 9.2 Authoritative youth ministry source note

The official General Conference Adventist Youth Ministries website lists Adventurers 4–9, Pathfinders 10–15, Ambassadors 16–21, and Young Adults 21–30. A July 2025 Adventist News Network report describes Young Adults as 22–30. The approved DYMS rule permits both Ambassador and Young Adult affiliations at age 21, subject to local ministry approval, and does not invent a replacement boundary. Public Campus Ministry is campus-context affiliation, not an exclusive age category. Master Guide is a training/credential pathway.

### 9.3 DFR-006 status

DFR-006 remains part of the historical decision record but was explicitly lifted on 2026-10-29. Implementation was authorized. This does not remove the requirement for formal ERD approval before Prisma models or migrations.
