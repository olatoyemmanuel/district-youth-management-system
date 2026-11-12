# DYMS CPERD-03 — Owner Decision and Scope Reconciliation

- Revision: 0.1
- Date: 2026-11-12
- Status: **WORKING RECONCILIATION REGISTER — NOT AN APPROVAL RECORD**
- Implementation: **NOT AUTHORIZED**

## 1. Authority and preservation

This register reconciles CPERD-02 design content against later project-owner decisions. It does not alter historical approval records. CPERD-01 and CPERD-02 remain preserved as their exact approved/candidate artifacts and hashes.

A physical-design proposal is not an owner approval. An owner approval is not implementation authorization.

## 2. Explicitly approved DFR-003 decisions

| Decision | Approval status | Required CPERD-03 application |
|---|---|---|
| OD-01 Technology stack | APPROVED | NestJS, TypeScript, Prisma ORM and PostgreSQL are authoritative. |
| OD-02 Identifier strategy | APPROVED | UUIDv7, application-generated, verified generator; PK `id`; FK `{entity}_id`; PostgreSQL UUID. |
| OD-03 Referential integrity | APPROVED | Mandatory applicable FKs; RESTRICT default; CASCADE only for explicitly approved disposable dependents; protect cross-district ownership in DB and application. |
| OD-04 Uniqueness | APPROVED | Global normalized email; federation-scoped district code; district-scoped church code; one current church membership per member; no conflicting active appointment for same position/scope; unique member/event/attendance context. |
| OD-05 Transactions/concurrency | APPROVED | ACID; Read Committed default; stronger isolation only when justified; constraints/transactions/locking/optimistic concurrency; bounded safe retries; deadlock handling; no duplicated external effects. |
| OD-06 History/lifecycle | APPROVED | Preserve important history; restrict hard deletion; append-only audit evidence; explicit membership lifecycle; retention governed by approved policies. |
| OD-07 Data types/precision | APPROVED | NUMERIC(19,4) future monetary standard; bounded VARCHAR/TEXT; DATE/TIMESTAMPTZ UTC; stable technical ENUM; lookup tables for business categories; limited JSONB; explicit NULL/DEFAULT; app and DB validation. |
| OD-08 Timestamp/timezone | APPROVED | UTC TIMESTAMPTZ; IANA zones; preserve local recurrence rule and zone; DST-aware resolution; trusted audit timestamps; synchronized server clocks; DATE for calendar dates and TIMESTAMPTZ for exact instants. |
| OD-09 Migration governance | PROPOSED; NOT APPROVED | Do not represent as approved. Preserve as a pending owner-decision item. No migration or implementation work is authorized. |
| OD-10 Integrity verification | STATUS NOT VERIFIED | Obtain exact owner decision record before claiming approval. |
| OD-11 Indexing/performance | STATUS NOT VERIFIED | Obtain exact owner decision record before claiming approval. |
| OD-12 Final reconciliation | STATUS NOT VERIFIED | Obtain exact owner decision record before claiming approval. |

The status of OD-10 through OD-12 is intentionally not inferred. A final register reconciliation must cite the authoritative owner record or retain the item as pending.

## 3. Other controlling decisions

### 3.1 IDX-R02 — Current church membership

**Status: APPROVED (2026-11-12).**

- One current church membership per member.
- Current membership uniqueness is independent of Church Transfer.
- Suspension removes membership from current status.
- Termination removes membership from current status.
- Reactivation restores the original suspended membership.
- Preserve membership history.
- Church Transfer is excluded from DYMS 1.0.

Physical consequence: the membership lifecycle predicate and partial unique index must be based on the approved ACTIVE/SUSPENDED/TERMINATED semantics. Exact database labels and predicates must be consistent across all CPERD-03 registers.

### 3.2 AUD-OD-01 through AUD-OD-10

**Status: CLOSED/APPROVED as governance decisions.**

Preserve these approvals in the audit, security-event, retention and records-governance design. Their approval does not authorize implementation, database changes or destructive retention actions. Do not describe them as unresolved.

### 3.3 DFR-001 through DFR-006

Preserve the approved architecture and governance baseline. In particular:
- DFR-001 authentication and security architecture remains authoritative.
- DFR-004 session and deployment parameters remain authoritative.
- DFR-005 backup and recovery targets remain authoritative.
- DFR-006 formal design freeze remains in force as clarified by the project owner.
- No prior wording or PR activity overrides the current prohibition on implementation.

### 3.4 DDD-013

Preserve the project-owner approval of the DDD-013 design decision. External independent technical assurance is a separate evidence item. Do not claim it has been performed unless an actual review report and reviewer disposition are available.

## 4. DYMS 1.0 scope correction

| Capability | CPERD-03 disposition |
|---|---|
| Federation/district/church hierarchy | INCLUDE |
| Individual accounts and access | INCLUDE |
| Membership and membership history | INCLUDE |
| Single active primary category and eligibility configuration | INCLUDE |
| Leadership positions and appointments | INCLUDE |
| Basic departmental administration | INCLUDE |
| Events, registration and attendance | INCLUDE |
| Audit, security events and records governance | INCLUDE |
| Basic operational reports | INCLUDE |
| Federation oversight | INCLUDE, READ-ONLY |
| Church Transfer workflow | EXCLUDE |
| Finance/payment management and budgets | DEFER |
| Blockchain integration | DEFER |
| Verifiable credential issuance and evidence management | DEFER |
| Conference-level administration | DEFER |
| Advanced Progressive Classes | DEFER |

A future scope change requires explicit project-owner approval and impact analysis. Do not retain a deferred feature in the active physical model merely because it exists in CPERD-02.

## 5. CPERD-02 contradictions to resolve

1. CPERD-02 contains `church_transfer_requests`, transfer API commands, transfer indexes and transfer transaction contracts. Remove them from DYMS 1.0.
2. CPERD-02 includes finance tables and finance reports. Remove them from DYMS 1.0.
3. CPERD-02 includes credential issuance/evidence tables. Remove issuance/evidence capabilities from DYMS 1.0; preserve only membership category distinctions and any explicitly included qualification references.
4. CPERD-02 has no explicit federation entity and no district-to-federation FK. Add the hierarchy and federation-scoped district code uniqueness.
5. CPERD-02 marks current church membership uniqueness as policy blocked. IDX-R02 resolves the product rule; the exact persisted lifecycle predicate must be specified.
6. CPERD-02 marks normalized email uniqueness as policy blocked. OD-04 resolves the uniqueness requirement; the canonical normalization representation still needs a deterministic technical specification.
7. CPERD-02 marks the current member-category index predicate as blocked. OD-04/DDD-002 require one active primary category; define the exact predicate.
8. CPERD-02 marks department membership uniqueness as blocked. Preserve multiple departments while preventing duplicate current membership in the same department.
9. CPERD-02 marks event registration uniqueness as blocked. Reconcile it with approved event registration and capacity behavior.
10. CPERD-02 column defaults are frequently recorded as NOT SPECIFIED IN SOURCE. Resolve each column's default policy.
11. CPERD-02 uses UUID columns but does not state the approved UUIDv7 generation contract.
12. CPERD-02 uses VARCHAR plus CHECK for multiple technical states. Reconcile stable technical states with OD-07's PostgreSQL ENUM requirement.
13. CPERD-02 contains multiple inconsistent inventory totals. Regenerate all counts from CPERD-03 canonical registers.
14. CPERD-02 and its manifest contain inconsistent owner-review and approval language. CPERD-03 must use one consistent status and exact-hash manifest.

## 6. Technical questions that require explicit specification, not invented policy

The following are design details to resolve using approved decisions:
- Exact canonical email normalization algorithm and storage/index representation.
- Exact stable technical ENUM type catalogue and values.
- Exact membership, category, department membership, appointment and event registration lifecycle predicates.
- Every column's default source and nullability rationale.
- Exact UUIDv7 generator contract and failure behavior.
- Every event/recurrence timezone field and local-time interpretation rule.
- Exact FK source/target ordered column pairs and composite ownership keys.
- Index rationale and duplicate/redundant index elimination.
- Trigger execution context and trusted timestamp source.
- Retention-source enrollment for included tables, with no invented duration.
- Report definitions and data owners restricted to included source domains.

## 7. Status control

This document is a reconciliation register only.

- CPERD-03 final physical model: NOT YET GENERATED.
- Canonical successor inventory counts: NOT YET ESTABLISHED.
- OD-09: NOT APPROVED.
- OD-10 through OD-12: approval status not verified.
- CPERD-03 final owner approval: NOT GRANTED.
- Implementation authorization: NOT GRANTED.
