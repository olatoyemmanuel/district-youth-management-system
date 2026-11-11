# DYMS Phase 3 — Physical ERD Approval Manifest

- Manifest revision: ERD-MANIFEST-01
- Date: 2026-11-02
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Review pull request: #53
- Master ERD revision: CPERD-01
- Master ERD Git blob SHA: **6d0b47973f4e24c73409832a4986f00817805638**
- Physical ERD approval: **PROJECT OWNER APPROVED — CPERD-01 (2026-11-02)**
- Implementation authorization: **NOT AUTHORIZED**

## 1. Exact approval target

The project-owner review target is the exact content of:

[PHASE-3-CONSOLIDATED-PHYSICAL-ERD.md](./PHASE-3-CONSOLIDATED-PHYSICAL-ERD.md)

Git blob SHA:

```text
6d0b47973f4e24c73409832a4986f00817805638
```

Approval must identify revision CPERD-01 and this exact blob SHA. If the file changes, its Git blob SHA changes and this approval target must be regenerated.

## 2. Supporting artifact hashes

These hashes identify the supporting files fetched from the working branch when this manifest was assembled.

| Artifact | Git blob SHA |
|---|---|
| PHASE-3-CANONICAL-PHYSICAL-COLUMN-REGISTER.md | 282419018c64967ff577ffcd806aefd4f8766187 |
| PHASE-3-CANONICAL-FOREIGN-KEY-REGISTER.md | 116e61cfe06d43badf543cc7bbb32bbc32fa1ae0 |
| PHASE-3-CANONICAL-INDEX-INVENTORY.md | 84b3a5de0afd8176e39f27bd20f9563abe75d43f |
| PHASE-3-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md | 1f32158086c65751089464a46b975cd8c5964756 |
| PHASE-3-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md | b0cca40fb095bab32820a3f8b6c4420bd3a5023f |
| PHASE-3-DDD-013-PHYSICAL-SLICE-REVIEW.md | 0a172162e83925472d7f258efaf0935314f0848b |
| PHASE-3-FINAL-PHYSICAL-ERD-RECONCILIATION-PLAN.md | f6a4fded9bf03732ae48f0b9e16905e8f5cfb819 |
| PHASE-3-SYSTEM-DESIGN-BASELINE.md | 43e4a26fdb40ff2bd4cad7dbce6ae303752796e5 |

The Phase 2 source records and DFR/DDD/ODR decision registers remain referenced by the master ERD. The DDD-013 project-owner approval is recorded separately in [PHASE-3-DDD-013-PROJECT-OWNER-APPROVAL-RECORD.md](./PHASE-3-DDD-013-PROJECT-OWNER-APPROVAL-RECORD.md). Phase 2 physical registers have been marked as historical where the Phase 3 candidate supersedes them.

## 3. Reconciled package counts

| Item | Candidate count |
|---|---:|
| Physical tables | 70 |
| Column declarations | 679 |
| Named foreign-key relationships | 166 |
| Distinct named index candidates | 228 |
| Named structural CHECK constraints | 54 |
| Testable requirements mapped | 107 |

### 3.1 Register delta checks

- Phase 2 column baseline: 617 declarations across 65 tables.
- Phase 3 candidate: 679 declarations across 70 tables.
- Five candidate tables added: pre_auth_contexts, idempotency_recovery_events, event_organizing_departments, member_category_eligibility_rules and report_data_owners.
- Two obsolete ownership columns removed: departments.church_id and events.department_id.
- Four appointment scope columns added: district_id, scope_type, church_id and department_id.
- DDD-013 idempotency record revised from the prior 13-column proposal to the 23-column candidate; additional non-idempotency column additions total 54.
- Phase 2 FK source contained 155 named rows. Phase 3 contains 166, with 11 old names removed/renamed and 22 new/renamed names added.
- Phase 2 index source enumerated 216 distinct names although its summary said 214. Phase 3 contains 228, with 21 names removed and 33 added.

## 4. Static consistency validation

The candidate registers were fetched back from the repository and checked against each other:

- 679 column declarations across 70 tables.
- 166 named FK relationships.
- 228 distinct named indexes.
- All FK source tables and columns exist in the column register.
- All FK target tables and columns exist in the column register.
- Every FK source supporting index exists in the canonical index inventory.
- Every named target candidate key referenced by an FK exists in the canonical index inventory.
- All 54 named structural CHECKs in the integrity register are referenced by the column register.
- No duplicate index names.
- No index or FK identifier exceeds PostgreSQL's 63-byte identifier limit.
- CPERD-05 correction verification: 228 unique index entries; 30 malformed predicate descriptions corrected; eight appointment-scope entries relocated into the canonical inventory; six policy blockers and two DDD-013 independent-review entries preserved; all 166 named FK rows have supporting indexes; no FK source/target columns are missing. See [CPERD-05 Correction and Verification Report](./PHASE-3-CPERD-05-CORRECTION-AND-VERIFICATION-REPORT.md).
- No stale removed owner/index names remain in the current column register's index references.
- All 107 requirement IDs are mapped exactly once; no unmapped or unrecognized IDs.

These are static documentation consistency checks only. They do not establish that PostgreSQL DDL executes, that query plans are optimal, or that concurrency tests pass.

## 5. Material amendments requiring explicit owner approval

The consolidated candidate includes the following material physical refinements:

1. Five new physical entities and their bounded-context ownership.
2. Removal of departments.church_id and events.department_id under the ODR-004 district-owned department and district/church event model.
3. District-bound event and report scope with composite same-district FKs.
4. Position scope now has a mandatory district boundary. Appointment records persist district_id and scope_type plus optional church/department scope, with three composite FKs binding the appointment to the exact position scope.
5. DDD-013 authenticated/pre-authentication identity split, recovery event ledger, pre-auth context, password-reset outbox and secret-store boundary.
6. Versioned member-category eligibility rule provenance and report data-owner catalogue.
7. The 54 structural CHECK catalogue entries and trigger/transaction enforcement contracts.

The five new tables and appointment scope additions are physical design proposals. They require explicit project-owner approval as amendments to the previously approved conceptual model. Delegated ministry, finance, attendance, records, security and data authority decisions remain separately required as listed in the Owner Decision Register.

## 6. Outstanding approval gates

| Gate | State |
|---|---|
| DFR-001–DFR-006 preserved | YES |
| ODR-REC-01 project-owner approval recorded | YES, 2026-11-02 |
| DDD-013 internal engineering review | COMPLETE |
| DDD-013 project-owner review | APPROVED — ALL TEN AREAS, 2026-11-02 |
| DDD-013 project-owner review of all ten areas | APPROVED — D13-POA-01, 2026-11-02 |
| DDD-013 external independent technical assurance | NOT PERFORMED; separate assurance consideration |
| Delegated authority confirmation | PENDING where identified |
| DFR-006 governance discrepancy | OPEN |
| Production PostgreSQL provider/version confirmation | OPEN |
| Retention schedules/source enrollment | OPEN |
| Final physical ERD project-owner approval | APPROVED — CPERD-01, exact SHA recorded below |
| Separate implementation authorization | NOT GRANTED |

## 7. Approval record

- Revision: CPERD-01
- Master Git blob SHA: 6d0b47973f4e24c73409832a4986f00817805638
- Decision: **APPROVED**
- Decision authority: Project owner
- Date: 2026-11-02
- Evidence: Explicit approval in the project conversation, “I approve CPERD-01, SHA 6d0b47973f4e24c73409832a4986f00817805638”.
- Detailed record: [CPERD-01 Project-Owner Approval Record](./PHASE-3-CPERD-01-OWNER-APPROVAL-RECORD.md)

This is physical-ERD design approval only. It does not authorize implementation. Implementation requires separate explicit authorization after the outstanding governance, delegated-authority, independent-review and environment gates are addressed and recorded.

## 8. Implementation restriction

Until the final physical ERD is approved and a separate implementation authorization is recorded, do not create or modify Prisma models, migrations, SQL DDL, database objects, seeds, API code, backend modules, frontend features or production infrastructure.
