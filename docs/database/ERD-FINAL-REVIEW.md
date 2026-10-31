# DYMS Final ERD and Database Domain Model Review

## 1. Review status

**NOT READY — material blockers remain.**

This is a restored remediation review of the conceptual database design. It does not approve the ERD, authorize a Prisma schema or migration, alter DFR-001 through DFR-005, or certify implementation readiness. DFR-006 was lifted on 2026-10-29.

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
| Leadership and authorization        | DDD-005 approved the initial role catalogue, assignment scopes, action-specific permission groups, additive grants, explicit deny-overrides-allow, strict scope enforcement, and no title-seniority override on 2026-10-31. Complete the role-to-permission/resource-scope matrix, explicit-deny representation, specific prohibited/review-required role combinations, and DDD-004 mid-year/early-ending/overlap lifecycle rules. | Effective access and contradictory-active-record constraints cannot be safely implemented until the remaining matrix and lifecycle decisions are completed. |
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
## 8. Current review update — 2026-10-30

The following approvals were received after the original review snapshot and must be treated as current:

- DDD-001: PRB-001 v0.1 approved as the reconstructed, versioned working baseline. The historical original PRD remains unrecovered.
- MEM-02: one-to-one User–Member cardinality approved.
- DDD-002: ministry category/affiliation classification approved; a 21-year-old may hold both Ambassador and Young Adult affiliations with local ministry approval.
- DDD-003: one current primary church membership; transfers close the previous membership and open the new one atomically, preserving history.
- DDD-004: annual Jan 1–Dec 31 appointments; renewals create new historical records; higher authority controls appointment/renewal; self-appointment and self-renewal are prohibited.
- AUTH-IDEM-001–041: consolidated authentication idempotency decisions. CR-01 through CR-06 are approved. DDD-013 policy consistency passes, but its authentication ERD slice remains NOT READY pending physical modeling and verification.
- Authentication retention is approved for sessions (12 months), refresh-token history (12 months), password-reset records (90 days), and security events (24 months), with legal holds/investigations suspending deletion. Other business-domain retention remains unresolved.

DFR-006 was lifted on 2026-10-29. Implementation was authorized, but this does not bypass the explicit ERD approval gate.

## 9. Current disposition

**NOT READY.** DDD-005 is partially resolved; its detailed role-to-permission grants, explicit-deny representation, and specific role-conflict matrix remain open. Other outstanding DDD-006 through DDD-012 and DDD-015 policy questions, non-authentication DDD-014 retention, DDD-002 category transition/history, DDD-004 appointment lifecycle details, and DDD-013 physical ERD-slice validation remain. The user must formally approve the corrected ERD before Prisma models or migrations are created.


## 10. Review update — 2026-10-31

The original blocker table in §§4–7 is a historical snapshot and must be read together with this current update and the detailed findings in [ERD-REVIEW-2026-10-31.md](ERD-REVIEW-2026-10-31.md). Its entries concerning PRB-001 provenance, User–Member cardinality, category/affiliation classification, church-transfer policy, annual appointment renewal, and authentication idempotency policy have since been partly or fully resolved as stated below.

| Area | Current disposition |
|---|---|
| Product requirements baseline | PRB-001 v0.1 is approved as a reconstructed working baseline. Historical original PRD remains unrecovered. |
| User–Member | One-to-one cardinality approved. Mandatory participation enforcement remains a technical design item. |
| Ministry categories | Top-level category and affiliation classification approved, including age-21 dual Ambassador/Young Adult affiliation with local approval. Category transition/history and its explicit ERD representation remain outstanding. |
| Primary church | One current primary church and atomic history-preserving transfer approved. Current-reference/history consistency and concurrency enforcement remain to be modeled. |
| Appointments | Annual term, renewal as a new historical appointment, higher-authority appointment/renewal, and no self-appointment/self-renewal approved. DDD-005 initial roles, scope, and precedence approved 2026-10-31; detailed role grants, explicit-deny representation, specific role-conflict matrix, and DDD-004 mid-year/early-ending lifecycle remain open. |
| Authentication idempotency | AUTH-IDEM-001–041 and CR-01 through CR-06 approved. Policy consistency passes. The authentication ERD slice remains NOT READY pending physical modeling and verification. |
| Authentication retention | Session, refresh-token, password-reset, and security-event retention periods approved. Audit-log and other business-domain retention remain blocked. |
| Remaining product decisions | DDD-005 is partially resolved; its detailed grant/deny/conflict matrix remains open. DDD-006 through DDD-012 and DDD-015 remain blocked or partially resolved as recorded in the decision register; DDD-002 and DDD-014 remain partially resolved. |

### 10.1 Additional structural findings

The review identified that the ERD does not yet explicitly represent the approved ministry-affiliation model or the pre-authentication idempotency context. It also lacks a clear outbox relationship and protected password-reset delivery-secret boundary required by DDD-013. These are material design gaps, not merely naming or indexing tasks.

The Requirements Traceability Matrix was also restored from an incorrect source during the initial restoration. It has since been replaced with the correct October 30 traceability source and updated with the current decision overlay. Review the final branch diff to verify this correction.

**Current disposition remains NOT READY.** Do not approve the ERD or create Prisma models/migrations until the structural gaps and remaining blockers in ERD-REVIEW-2026-10-31.md are resolved.

## 11. Structural remediation and policy reconciliation — 2026-10-31

This section supersedes contradictory historical statements in §§4–10. Earlier tables are retained as review history, not current status.

### 11.1 Three critical structural gaps

| Finding | Current conceptual correction | Remaining validation |
|---|---|---|
| ERD-R02: ministry category/affiliation model absent | Added MINISTRY_AFFILIATION, MEMBER_MINISTRY_AFFILIATION, and MINISTRY_AFFILIATION_APPROVAL. MEMBER retains one top-level category. Ambassador/Young Adult are affiliations; age-21 dual affiliation references local approval. Public Campus Ministry is an additional affiliation; Master Guide remains a credential/training pathway. | Confirm approval authority/scope semantics and category/affiliation history rules. No new age boundary or one-active-category rule is inferred. |
| ERD-R03: pre-authentication idempotency scope absent | Added PRE_AUTH_CONTEXT, linked to pre-authentication idempotency records and not owned by a User. Authenticated and pre-authentication scope modes are explicitly mutually exclusive. | Verify physical partial unique-index predicates, foreign keys, cookie-context lifecycle, and operation-scope constraints. |
| ERD-R04: reset delivery outbox and secret boundary absent | Added OUTBOX_MESSAGE and its relationship to the password-reset token and idempotency operation. The reset secret remains in an external envelope-encrypted, short-lived secret store; outbox and queue carry opaque references only. | Select and review the secret-store integration, worker permissions, expiry/erasure behavior, and transactional failure/recovery tests. No vendor is selected. |

The conceptual inventory is now 33 entities: the original 28 plus three ministry-affiliation entities, PRE_AUTH_CONTEXT, and OUTBOX_MESSAGE. The external secret store is a component boundary, not a relational entity.

### 11.2 Current policy decision status

- DDD-001: RESOLVED for PRB-001 v0.1 as the reconstructed working baseline. The historical original PRD remains unrecovered.
- MEM-02: one-to-one User–Member cardinality approved; mandatory participation enforcement remains a technical design item.
- DDD-002: category/affiliation classification and age-21 dual affiliation with local approval approved and represented. Category transitions/effective dates/history remain open.
- DDD-003: one current primary church and atomic history-preserving transfer approved. Current-reference/history invariant and concurrency mechanism remain technical design items.
- DDD-004: annual Jan 1–Dec 31 terms, renewal as a new historical appointment, higher-authority appointment/renewal, and no self-appointment/self-renewal approved. Mid-year/early-ending and specific role-overlap rules remain open.
- DDD-005: initial role categories and scopes, action-specific permission groups, additive permission combination, explicit deny-overrides-allow, strict scope enforcement, and no title-seniority override approved on 2026-10-31. Detailed role grants, explicit-deny representation, and specific role-conflict matrix remain open.
- DDD-012: partially resolved. Role-based sensitive-record access and access logging are approved. Audit Viewer and Audit Administrator responsibilities are approved. Only the single System Administrator appoints/revokes Audit Administrators; no second-person approval is required. Detailed record scopes, masking, exports, access reviews, break-glass, system/anonymous actor taxonomy, and audit-of-audit retention remain open. The decision records are in PRs #4, #5, #6, #8, and #9.
- DDD-013: AUTH-IDEM-001–041 and CR-01–CR-06 approved. Policy consistency passes. Conceptual scope, pre-auth context, outbox, and protected reset-secret boundary are now represented. Physical constraints and endpoint verification remain.
- DDD-014: authentication retention approved: sessions 12 months, refresh-token history 12 months, password-reset records 90 days, security events 24 months, subject to legal holds/active investigations. Audit-log and other business-domain retention remain blocked.
- DDD-005–DDD-011 and DDD-015 remain blocked to the extent specified in the decision register.

### 11.3 Cross-document integrity checks

The following companion records were updated in the same specification branch:
- ERD.md: inventory, category/affiliation model, pre-auth scope, outbox, secret-store boundary, DDD-013 persistence contract.
- DATA-MODEL.md: matching inventory and entity catalogue, approved authentication retention, category/affiliation and reset-delivery structures.
- DATABASE-DESIGN-DECISION-REGISTER.md: DDD-002 and DDD-013 current status, plus partially resolved DDD-012 approvals.
- REQUIREMENTS-TRACEABILITY.md: RT-006 and blockers B-002/B-008 updated.
- INVARIANT-ENFORCEMENT-REGISTER.md: audit-access invariant AD-07 and record-class-specific AD-06 status.

A fresh final verification is still required for every relationship/cardinality, all catalogue rows, relative links, and invariant/traceability IDs. The historical PRs documenting DDD-012 approvals are open and unmerged; their approval statements are recorded here for reconciliation but must be checked against the canonical decision history before merge.

**Current disposition: NOT READY FOR FORMAL ERD APPROVAL.** The three critical conceptual gaps have been addressed. Remaining policy blockers and physical validation items are not resolved by these structural corrections. No Prisma models, migrations, or schema changes are authorized.
