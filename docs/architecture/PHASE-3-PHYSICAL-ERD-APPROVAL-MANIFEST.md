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
| PHASE-3-CANONICAL-PHYSICAL-COLUMN-REGISTER.md | 61d1ee90b0aad07e9234d6327df2cda4c410e472 |
| PHASE-3-CANONICAL-FOREIGN-KEY-REGISTER.md | a2d7595809faaad165396aed08f4ab3aa1149ab2 |
| PHASE-3-CANONICAL-INDEX-INVENTORY.md | 84b3a5de0afd8176e39f27bd20f9563abe75d43f |
| PHASE-3-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md | 6e7959f9ca562e0b3488cf366de4436ec20dc0ad |
| PHASE-3-CPERD-07-DATABASE-SECURITY-AND-LEAST-PRIVILEGE-REPORT.md | 98279e69950b7b9aa8fb139cae5b61d1b2e2cf6a |
| PHASE-3-CPERD-08-TRIGGER-TRANSACTION-AND-CONCURRENCY-CONTRACTS.md | dfd8953f4b5087f51289df908e2bb58cbcafe5ac |
| PHASE-3-CPERD-05-CORRECTION-AND-VERIFICATION-REPORT.md | e708cb8a504d8698780cf2f77c2ce8ddd9eaa5c6 |
| PHASE-3-CPERD-06-STRUCTURAL-INTEGRITY-RECONCILIATION-REPORT.md | 1520f5f6f496e327efce42c59d64d8f8ac25d5b7 |
| PHASE-3-CPERD-10-GOVERNANCE-AUTHORITY-AND-DESIGN-STATUS-RECONCILIATION.md | 82cab77039fbb1fc5a4a6f6bcf9ab11260caf091 |
| DFR-006-GOVERNANCE-CLARIFICATION-2026-11-02.md | 8452b503ccd542b639600d1d01d7dc5f38e13285 |
| PHASE-4-GOVERNANCE-AND-DESIGN-CLOSURE-REGISTER.md | d63ab2846ee509ab44abc6d0e92dc203e457d529 |
| PHASE-3-CPERD-09-CONSOLIDATED-PHYSICAL-DESIGN-RECONCILIATION-REPORT.md | 5703575c4545ba7aec089c6d73c6b52345d4fb5f |
| DDD-DECISION-REGISTER.md | bc4b8b045012fe57517ebdcb59f17a9a59f6223b |
| PHASE-2-LIFECYCLE-STATE-CATALOGUE.md | 96e4e1ad0f4e0c2d4781f45680c67abfc6348052 |
| PHASE-3-API-CONTRACT-DESIGN.md | 6a6f3e3481027482564d4c6b1b3de314d6ed5a65 |
| PHASE-3-CPERD-11-DOMAIN-LIFECYCLE-API-AND-REQUIREMENT-STATUS-RECONCILIATION.md | 7f02db1cdab0e9e10007657bb4c3a79c9df1ad9f |
| PHASE-3-CPERD-12-RETENTION-SOURCE-ENROLLMENT-CANDIDATE-INVENTORY.md | 552c87f0733165fa833a10b36f7f2b5970674c77 |
| PHASE-3-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md | 0cc3ed044f31b2bbd1de4922579e0f7b9ecd70d8 |
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
| Named structural CHECK constraints | 53 |
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
- All 53 row-local structural CHECKs in the integrity register are referenced by the column register; the credential-definition validity rule is separately classified as a cross-row application policy.
- No duplicate index names.
- No index or FK identifier exceeds PostgreSQL's 63-byte identifier limit.
- CPERD-05 correction verification: 228 unique index entries; 30 malformed predicate descriptions corrected; eight appointment-scope entries relocated into the canonical inventory; six policy blockers and two DDD-013 independent-review entries preserved; all 166 named FK rows have supporting indexes; no FK source/target columns are missing. See [CPERD-05 Correction and Verification Report](./PHASE-3-CPERD-05-CORRECTION-AND-VERIFICATION-REPORT.md).
- CPERD-06 integrity reconciliation: 53 row-local structural CHECK candidates are cross-referenced; credential-definition validity is reclassified as a cross-row application policy; the updated_at trigger scope now enumerates all nine affected tables. Trigger/function metadata and implementation validation remain separate follow-up work. See [CPERD-06 Structural Integrity Reconciliation Report](./PHASE-3-CPERD-06-STRUCTURAL-INTEGRITY-RECONCILIATION-REPORT.md).
- No stale removed owner/index names remain in the current column register's index references.
- CPERD-07 database security/least-privilege design: logical object-owner, migration, runtime, worker, reporting, audit-reader, backup-operator and narrow audit-writer roles are defined; owner-approved audit/reporting defaults are applied; provider-specific grants, append-only privilege proof, backup/restore capabilities and trigger/function hardening remain open. See [CPERD-07 Database Security and Least-Privilege Report](./PHASE-3-CPERD-07-DATABASE-SECURITY-AND-LEAST-PRIVILEGE-REPORT.md).
- CPERD-08 trigger/transaction reconciliation: contracts recorded for appointment overlap, attendance mode/session validation, event capacity, retention holds, updated_at, append-only evidence, credential validity, refresh rotation, DDD-013 fencing, finance reversal and outbox processing; 20 concurrency/failure test specifications defined but not executed. Exact trigger/function metadata and provider-specific validation remain open. See [CPERD-08 Trigger, Transaction and Concurrency Contracts](./PHASE-3-CPERD-08-TRIGGER-TRANSACTION-AND-CONCURRENCY-CONTRACTS.md).
- CPERD-09 static cross-register reconciliation: 70 tables, 679 columns, 166 FKs, 228 named indexes and 53 structural CHECKs verified; the missing named category-eligibility unique-index reference and malformed FK-register section boundary were corrected. Approval/status hash differences were compared and explained as additive governance/approval records. See [CPERD-09 Consolidated Physical-Design Reconciliation Report](./PHASE-3-CPERD-09-CONSOLIDATED-PHYSICAL-DESIGN-RECONCILIATION-REPORT.md).
- CPERD-10 governance reconciliation: DFR-006 is clarified; Phase 4 owner-approved DYMS product defaults supersede older delegated-authority blocker wording; DDD-013 and system-baseline hash differences are verified status/governance addenda. See [CPERD-10 Governance Authority and Design-Status Reconciliation](./PHASE-3-CPERD-10-GOVERNANCE-AUTHORITY-AND-DESIGN-STATUS-RECONCILIATION.md).
- CPERD-11 domain/lifecycle/API/traceability reconciliation: DDD-001–015 current statuses align with Phase 4; lifecycle catalogue has 52 rows, all matching physical tables; 107 requirements map exactly once; API and traceability notes distinguish owner-approved defaults from technical/configuration gates. See [CPERD-11 Domain, Lifecycle, API and Requirement-Status Reconciliation](./PHASE-3-CPERD-11-DOMAIN-LIFECYCLE-API-AND-REQUIREMENT-STATUS-RECONCILIATION.md).
- CPERD-12 retention source-enrollment inventory: 15 candidate record classes cover all 70 physical tables; no source-link FK, retention duration, schedule or destructive action was added. Phase 4 GDC-01 §8 records the inventory as prepared. See [CPERD-12 Retention Source-Enrollment Candidate Inventory](./PHASE-3-CPERD-12-RETENTION-SOURCE-ENROLLMENT-CANDIDATE-INVENTORY.md).
- All 107 requirement IDs are mapped exactly once; no unmapped or unrecognized IDs.

These are static documentation consistency checks only. They do not establish that PostgreSQL DDL executes, that query plans are optimal, or that concurrency tests pass.


### 4.1 Current-branch artifact hash drift

The support hashes above preserve the original manifest snapshot and exact approval references. CPERD-09/10 compared both historical blobs with their current branch versions. The differences are later status/governance addenda only; the historical approval references remain preserved:

| Artifact | Hash recorded in original support snapshot / approval | Current branch blob | Disposition |
|---|---|---|---|
| PHASE-3-DDD-013-PHYSICAL-SLICE-REVIEW.md | 0a172162e83925472d7f258efaf0935314f0848b | a2c1eb8a4989bad7cb7687b1eae208642eb22abe | Verified status-only owner-approval addendum; no physical-slice specification changed. |
| PHASE-3-SYSTEM-DESIGN-BASELINE.md | 43e4a26fdb40ff2bd4cad7dbce6ae303752796e5 | eb25d44d30a65c2028eb6897ade4a30a74ef457c | Verified §17 governance/status addendum only; no physical schema or domain rule changed. |

The CPERD-01 master file remains at its exact owner-approved blob. Its internal header status is stale and is not to be edited in place. See [CPERD-09 Consolidated Physical-Design Reconciliation Report](./PHASE-3-CPERD-09-CONSOLIDATED-PHYSICAL-DESIGN-RECONCILIATION-REPORT.md).

## 5. CPERD-01 approved scope and successor-package boundary

The consolidated candidate includes the following material physical refinements:

1. Five new physical entities and their bounded-context ownership.
2. Removal of departments.church_id and events.department_id under the ODR-004 district-owned department and district/church event model.
3. District-bound event and report scope with composite same-district FKs.
4. Position scope now has a mandatory district boundary. Appointment records persist district_id and scope_type plus optional church/department scope, with three composite FKs binding the appointment to the exact position scope.
5. DDD-013 authenticated/pre-authentication identity split, recovery event ledger, pre-auth context, password-reset outbox and secret-store boundary.
6. Versioned member-category eligibility rule provenance and report data-owner catalogue.
7. The 53 structural CHECK candidates and trigger/transaction enforcement contracts.

The five new tables and appointment scope additions are included in the exact CPERD-01 master blob approved by the project owner. That approval remains valid for the master file SHA recorded above. The current supporting column/FK/index/integrity registers and CPERD-05 through CPERD-10 reconciliations provide later detailed corrections and refinements; they are not a new owner-approved implementation schema. A successor consolidated package must be reconciled and submitted for owner review before coding. Phase 4 GDC-01 confirms the owner-approved DYMS product defaults; external institutional confirmation is not a prerequisite for accepting those defaults.

## 6. Outstanding approval gates

| Gate | State |
|---|---|
| DFR-001–DFR-006 preserved | YES |
| ODR-REC-01 project-owner approval recorded | YES, 2026-11-02 |
| DDD-013 internal engineering review | COMPLETE |
| DDD-013 project-owner review | APPROVED — ALL TEN AREAS, 2026-11-02 |
| DDD-013 project-owner review of all ten areas | APPROVED — D13-POA-01, 2026-11-02 |
| DDD-013 external independent technical assurance | NOT PERFORMED; separate assurance consideration |
| DYMS product/design decisions | OWNER-APPROVED under Phase 4 GDC-01 and ODR register §§12–13; external institutional confirmation is not a DYMS design blocker |
| DFR-006 governance status | CLARIFIED — 2026-11-02; design freeze/change control remains in force |
| Production PostgreSQL provider/version confirmation | OPEN |
| Retention schedules/source enrollment | Not configured; automated permanent deletion remains disabled until an approved schedule and source enrollment exist |
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

This is physical-ERD design approval only. It does not authorize implementation. The current supporting-register reconciliation is not a new final implementation schema approval. Any successor package that materially changes the approved master must receive exact-hash owner review. Implementation still requires separate explicit authorization. Provider and operational evidence are deployment gates; external institutional confirmation is not required to accept the owner-approved DYMS defaults. DDD-013 independent technical assurance has not been performed and is not represented as complete.

## 8. Implementation restriction

The exact CPERD-01 master blob is owner-approved, but the later supporting-register corrections and CPERD-05–CPERD-10 design refinements have not been consolidated into a successor owner-approved implementation package. Regardless, separate implementation authorization is NOT GRANTED. Do not create or modify Prisma models, migrations, SQL DDL, database objects, seeds, API code, backend modules, frontend features, implementation tests or production infrastructure.
