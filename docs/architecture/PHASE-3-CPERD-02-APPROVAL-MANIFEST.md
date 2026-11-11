# DYMS Phase 3 — CPERD-02 Successor Physical ERD Approval Manifest

- Manifest revision: ERD-MANIFEST-02
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **SUCCESSOR OWNER-REVIEW PACKAGE PREPARED; NOT APPROVED**
- Implementation authorization: **NOT AUTHORIZED**

## 1. Approval target

The project-owner review target is the exact successor master:

[PHASE-3-CONSOLIDATED-PHYSICAL-ERD-CPERD-02.md](./PHASE-3-CONSOLIDATED-PHYSICAL-ERD-CPERD-02.md)

- Revision: CPERD-02
- Git blob SHA: `995b025d8381bc3c7e91acc64c71fadfc042546d`
- Base approval preserved: CPERD-01 exact blob SHA `6d0b47973f4e24c73409832a4986f00817805638`, owner-approved 2026-11-02.
- CPERD-02 is a material successor candidate. It does not amend or replace the CPERD-01 artifact or its historical approval.

Project-owner approval must identify this manifest's exact Git blob SHA and the CPERD-02 master SHA above. If any listed artifact changes, regenerate this manifest before approval.

## 2. Successor physical-design artifacts and exact hashes

| Artifact | Git blob SHA |
|---|---|
| PHASE-3-CONSOLIDATED-PHYSICAL-ERD-CPERD-02.md | 995b025d8381bc3c7e91acc64c71fadfc042546d |
| PHASE-3-CPERD-02-CANONICAL-PHYSICAL-COLUMN-REGISTER.md | f1979b191fe98da487ada89e4409fde838ad3c47 |
| PHASE-3-CPERD-02-CANONICAL-FOREIGN-KEY-REGISTER.md | 77d6a8705083f5cedad8d34403bd62ddf4be268a |
| PHASE-3-CPERD-02-CANONICAL-INDEX-INVENTORY.md | ac195c012ab1704d289bac389ca8f96b2d6960fb |
| PHASE-3-CPERD-02-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md | 2319ec755465df0fbbd3db46128162989f3abc84 |
| PHASE-3-CPERD-02-LIFECYCLE-STATE-CATALOGUE.md | bee5ea6469f17d2471ea860421de8b85afd2aeb4 |
| PHASE-3-CPERD-02-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md | 817a1e43e2127912b796bbc00db906a3e3a846fc |
| PHASE-3-API-CONTRACT-DESIGN-CPERD-02.md | b37b6fce8f9059149164fe35a3c1224faeacf3d5 |
| PHASE-3-CPERD-02-TRIGGER-TRANSACTION-AND-CONCURRENCY-CONTRACTS.md | 07272821b9cead1cb2c0a47eee73ae477010a7f6 |
| PHASE-3-CPERD-16-FINAL-ENGINEERING-DESIGN-RECOMMENDATIONS.md | cf6eb7aa51fd633422e8b2b7a5485d8d8fafd3d2 |
| PHASE-3-CPERD-17-STATIC-CONSISTENCY-VERIFICATION-REPORT.md | 729eafe34e6c5f53c65aede2dba1cf7aa8d94584 |

## 3. Governing product, security and assurance artifacts

| Artifact | Git blob SHA |
|---|---|
| PHASE-4-GOVERNANCE-AND-DESIGN-CLOSURE-REGISTER.md | af5174f536f5b33a4f9c3e839c818a3a9d5acf01 |
| PHASE-2-OWNER-DECISION-REGISTER.md | bdb4d672873fac4f5feaa7a4b8bde0d769109d8f |
| DECISION-REGISTER.md (DFR-001–DFR-006) | fc1f95a9c37cfdd27762c19572bb2b6ad5e6a090 |
| PHASE-3-DDD-013-PROJECT-OWNER-APPROVAL-RECORD.md | 1327e373bc8b46cbb5d5af521850ed86663e8d5a |
| PHASE-3-DDD-013-PHYSICAL-SLICE-REVIEW.md | a2c1eb8a4989bad7cb7687b1eae208642eb22abe |
| PHASE-3-CPERD-07-DATABASE-SECURITY-AND-LEAST-PRIVILEGE-REPORT.md | 98279e69950b7b9aa8fb139cae5b61d1b2e2cf6a |
| PHASE-3-CPERD-12-RETENTION-SOURCE-ENROLLMENT-CANDIDATE-INVENTORY.md | 552c87f0733165fa833a10b36f7f2b5970674c77 |
| PHASE-3-CPERD-13-REPORT-CATALOGUE-AND-DATA-GOVERNANCE-PROPOSAL.md | 3d6973500c777d3669ee8229189248c956c71df0 |
| PHASE-3-CPERD-14-CREDENTIAL-AND-YOUTH-ELIGIBILITY-EVIDENCE-MATRIX.md | 85c74983504aef370ddda76f6e36d11b25f5fb53 |
| PHASE-3-CPERD-15-TRANSFER-AND-APPOINTMENT-LIFECYCLE-DECISION-SHEETS.md | f801baa18e4857e9ee75a28356098940e2123040 |

## 4. CPERD-02 inventory baseline

| Measure | Verified count |
|---|---:|
| Physical tables | 70 |
| Column declarations | 692 |
| Named foreign-key relationships | 171 |
| Named index candidates | 235 |
| Row-local structural CHECK candidates | 68 |
| Testable requirement IDs | 107 |
| Requirement IDs mapped exactly once | 107 |
| Policy-blocked indexes excluded | 5 |

Five policy-blocked index candidates remain excluded:
- `uq_church_memberships_current`
- `uq_department_memberships_current`
- `uq_event_registrations_current_member`
- `uq_member_category_assignments_current`
- `uq_user_accounts_email_present`

The transfer open-request candidate uses the explicit two-state predicate PENDING_RECEIVING_CHURCH/PENDING_DISTRICT. The two finance uniqueness candidates enforce one final approval decision per transaction and at most one CONFIRMED full payment per transaction.

## 5. Static verification

CPERD-17 records:
- no duplicate column/table pairs, FK names or index names;
- no missing FK source or target columns;
- no missing FK supporting indexes or target candidate keys;
- no CHECK name missing from the column register;
- no FK/index identifier longer than PostgreSQL's 63-byte limit;
- all 107 requirement IDs mapped exactly once;
- transfer, appointment, finance, API and lifecycle semantics reconciled across the successor documents.

These checks are static documentation checks only. No PostgreSQL DDL was executed. No live database, workload, query plan, concurrency, security, provider, backup or disaster-recovery test is claimed.

## 6. Material CPERD-02 changes from CPERD-01

1. Transfer lifecycle now uses explicit pending, completed, rejected and cancelled states, requester cancellation provenance, and atomic district approval.
2. Appointment lifecycle now records requester/submission, rejection and termination provenance while retaining the existing appointment aggregate.
3. Finance now defines one final decision per submitted transaction, one confirmed full payment, separate payment/posting, explicit reversal decision provenance and one full reversal per original.
4. Four appointment/transfer actor FKs and one reversal rejection actor FK are added, each with supporting indexes.
5. Fifteen successor CHECK candidates are added across appointment, transfer and finance metadata.
6. Trigger scope is narrowed to appointment overlap, attendance subject mode and the nine updated_at instances; other controls are authorized application transactions, declarative constraints or privileges.
7. The role/authority map preserves federation oversight as read-only and maintains finance, appointment, audit, credential and retention separation of duties.
8. Five policy-dependent indexes remain excluded; no unapproved age, credential validity, retention duration, payment threshold or FX rule is invented.

## 7. Explicit exclusions and implementation boundary

The following remain outside CPERD-02 design approval or are explicitly disabled:
- RLS is not selected.
- Production PostgreSQL provider, service tier, hostnames, secrets and topology are not selected.
- Provider-specific grants and measured backup/restore evidence remain deployment/implementation verification.
- Retention source schedules and permanent disposal remain disabled until approved enrollment and schedules exist.
- Partial payments, multiple successful payments, FX, refunds, budget overrides, amount thresholds and multi-level finance approvals are disabled.
- Acting, overlapping and retroactive appointments are disabled.
- Transfer appeal/reconsideration and backdating are disabled.
- Blockchain anchoring and public on-chain credential verification are deferred.
- Full OpenAPI schemas and automated API contract tests are implementation deliverables under DFR-002.

DDD-013 remains project-owner approved under D13-POA-01. External independent technical assurance has NOT been performed and is not represented as completed. PostgreSQL execution, concurrency, recovery and security tests remain post-authorization implementation validation.

## 8. Owner decision and authorization boundary

The project owner is asked to approve or return for revision:
- CPERD-02 master SHA `995b025d8381bc3c7e91acc64c71fadfc042546d`;
- this exact successor approval manifest and all supporting artifact hashes above;
- the CPERD-16 change-impact recommendations and CPERD-17 static verification result.

**Project-owner approval: NOT YET RECORDED.**

Approval of CPERD-02 design does not authorize application implementation. A separate explicit project-owner authorization is required before any application code, Prisma schema, SQL DDL, migration, database object, seed, generated client, implementation test, infrastructure change or deployment work.

**Implementation remains NOT AUTHORIZED.**
