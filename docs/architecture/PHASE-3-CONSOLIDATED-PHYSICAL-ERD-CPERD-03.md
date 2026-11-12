# DYMS Phase 3 — Consolidated Physical ERD CPERD-03

- Revision: CPERD-03 / Draft 0.1
- Date: 2026-11-12
- Product: District Youth Management System
- Release: DYMS 1.0, Sango District
- Status: **SUCCESSOR RECONCILIATION IN PROGRESS — NOT APPROVED**
- Supersedes for review: CPERD-02 candidate only; CPERD-02 and CPERD-01 approval artifacts remain immutable
- Design authority: Project owner
- Implementation authorization: **GRANTED BY PROJECT OWNER ON 2026-11-12; CONDITIONAL ON FINAL CPERD-03 PHYSICAL ERD APPROVAL**

## 1. Purpose

CPERD-03 is the documentation-only successor reconciliation package. It is being prepared because CPERD-02 does not reflect later project-owner decisions and contains physical structures for capabilities excluded from the current DYMS 1.0 scope.

CPERD-03 will become the authoritative successor review target only after:
1. Every approved owner decision is reconciled into the master ERD and all supporting registers.
2. Deferred and excluded capabilities are removed from the DYMS 1.0 physical model.
3. Every remaining table, column, key, relationship, constraint, index and trigger is justified and cross-referenced.
4. The canonical counts are regenerated from the successor registers, not copied from CPERD-01 or CPERD-02.
5. Static cross-register verification and independent technical review are recorded.
6. The project owner approves the exact CPERD-03 artifact hashes.

This draft does not amend the previously approved CPERD-01 artifact or the CPERD-02 review baseline.

## 2. Governing authority

Apply this precedence:
1. DFR-001–DFR-006 and dated project-owner governance clarifications.
2. Explicit project-owner approvals and later scope decisions.
3. Approved DDD decisions and approved owner decision records.
4. CPERD-01, as the preserved previously approved physical-design baseline.
5. CPERD-02 and its supporting registers, as a successor candidate and source material only.
6. Engineering recommendations, which are not owner approvals unless separately approved.

A later explicit owner decision supersedes an earlier design proposal where they conflict. Do not treat a candidate ERD, recommendation, static report, PR or implementation artifact as an owner decision.

## 3. DYMS 1.0 scope baseline

### 3.1 Included

The CPERD-03 physical model is limited to the lean but complete district administration scope:
- Federation, district and local-church organizational hierarchy.
- Individual user identity and access. One account per member; no guardian/delegated child account model.
- District and church membership administration, including lifecycle and permanent history.
- Single active primary membership category, category history and configurable eligibility model.
- Leadership positions, appointments, approval, term, renewal and termination history.
- Basic district-owned departmental administration and department membership.
- Event administration, registration and attendance.
- RBAC, scoped authorization and federation read-only oversight.
- Security events, append-only audit and accountability.
- Records governance and retention controls, with no invented retention durations.
- District/church/department operational reporting, limited to included domains.
- Backup and disaster-recovery design requirements.

### 3.2 Deferred or excluded from DYMS 1.0

The following must not remain as active DYMS 1.0 physical capabilities:
- Church Transfer workflow and transfer request aggregate.
- Finance/payment management, budgets, financial accounts, transactions, payments and reversals.
- Blockchain integration and on-chain verification.
- Verifiable credential issuance, credential evidence management and advanced verification.
- Conference-level administration.
- Advanced Progressive Classes functionality.

A deferred capability may be documented in a future-scope note. It must not retain active DYMS 1.0 tables, foreign keys, indexes, triggers, API routes, permissions, reports, seed definitions or requirements mappings unless the project owner approves a scope change.

### 3.3 Church membership is not Church Transfer

IDX-R02 is authoritative:
- One current church membership per member.
- Current membership uniqueness is independent of any transfer workflow.
- Suspension removes a membership from current status.
- Termination removes a membership from current status.
- Authorized reactivation restores the original suspended membership record.
- Membership history is preserved.
- Church Transfer remains excluded from DYMS 1.0.

CPERD-03 must not recreate transfer semantics through membership actor columns, hidden status transitions, APIs, audit workflows or report definitions.

## 4. Owner-approved physical-design standards

The successor must reconcile the following approved DFR-003 decisions:

### OD-01 — Technology stack
NestJS, TypeScript, Prisma ORM and PostgreSQL are authoritative for DYMS.

### OD-02 — Identifiers
Use UUIDv7 identifiers, generated in the application layer using a verified UUIDv7-compatible generator. Primary key column name is `id`; foreign key naming is `{entity}_id`; PostgreSQL native UUID columns are used.

### OD-03 — Referential integrity
Use database-enforced foreign keys for applicable relationships. RESTRICT is the default referential action. CASCADE is permitted only for explicitly approved disposable dependent records. Cross-district ownership must be protected at both database and application levels. SET NULL is limited to genuinely optional relationships where the child survives without the parent.

### OD-04 — Uniqueness
- Normalized email is globally unique.
- District identifiers are unique within a federation.
- Church identifiers are unique within a district.
- One current church membership exists per member, consistent with IDX-R02.
- Conflicting active appointments for the same position and scope are prevented.
- One attendance record per member per event and attendance context is enforced.
- Use database uniqueness, scoped composite keys, partial indexes and transaction-safe concurrency controls as appropriate.

### OD-05 — Transactions and concurrency
Use ACID transactions. PostgreSQL Read Committed is the default. Stronger isolation is used only where justified, with safe retry handling. Combine constraints, transactions, row locks and optimistic concurrency as appropriate. Retries are bounded, use exponential backoff and jitter, and must not duplicate external side effects. Deadlocks must be detected and eligible transactions safely retried.

### OD-06 — Historical records and lifecycle
Preserve important historical records. Hard deletion is restricted to separately authorized disposal processes. Audit evidence is append-only through ordinary application operations and protected by database privileges. Membership lifecycle states and history are explicit. Retention and archival follow approved governance policies. Soft deletion does not replace lifecycle states.

### OD-07 — Data types and precision
- Monetary values use NUMERIC(19,4) as a future standard; finance is deferred from DYMS 1.0.
- Use bounded VARCHAR for bounded values and TEXT for descriptions.
- Use DATE for calendar dates and TIMESTAMPTZ for exact instants; persist absolute instants in UTC.
- Use PostgreSQL ENUM for stable technical states and lookup tables for business categories.
- Restrict JSONB to flexible metadata and integration payloads, not core relational data.
- Every column must have an explicit nullability and default policy.
- Enforce validation in both application and database layers.

### OD-08 — Timestamp and timezone standards
- Persist absolute instants using UTC TIMESTAMPTZ.
- Use IANA timezone identifiers, such as Africa/Lagos.
- For recurring schedules, preserve the local scheduling rule and IANA timezone, not only a computed UTC instant.
- Handle ambiguous and nonexistent local times using timezone-database-aware logic.
- Audit timestamps are generated by trusted server/database processes, not freely supplied by clients.
- Synchronize server clocks using NTP or an equivalent trusted mechanism.
- Use DATE for calendar-only semantics and TIMESTAMPTZ for exact instants.

### OD-09 through OD-12
Do not infer approval. The authoritative owner decision record must be checked and reconciled before these milestones are represented as approved. OD-09 migration governance is currently known as a proposal, not an approval. No migration, schema or implementation work is authorized.

## 5. CPERD-03 correction directives

| Area | CPERD-02 condition | CPERD-03 required disposition |
|---|---|---|
| Church Transfer | Transfer aggregate, APIs, indexes, constraints and reporting are present | Remove from DYMS 1.0 physical and API scope |
| Church membership | Current-membership index predicate remains blocked; transfer actor fields are present | Define current membership from IDX-R02; remove transfer-only fields; preserve membership history |
| Finance | Nine finance tables and finance reporting are present | Remove finance tables, relationships, indexes, constraints, APIs and reports from DYMS 1.0 |
| Federation | No federation entity or district federation FK in the 70-table model | Add federation ownership and district-to-federation relationship |
| District identifiers | District code has no federation-scoped unique constraint | Enforce uniqueness of (federation_id, code) |
| Church identifiers | District-scoped church code candidate exists | Preserve uniqueness of (district_id, code) |
| Credentials | Credential definition, issuance and evidence tables are present | Remove issuance/evidence capabilities from DYMS 1.0; preserve only approved category/qualification distinctions required by membership scope |
| Normalized email | Unique index is policy-blocked due to undefined normalization expression | Specify one canonical normalization representation and enforce global uniqueness |
| Member category | Current-category uniqueness remains blocked | Enforce one active primary category and preserve category history |
| Department membership | Current-membership uniqueness is blocked | Enforce the approved multiple-department model and one current membership per member/department |
| Event registration | Valid-registration uniqueness predicate is blocked | Reconcile with approved event registration and capacity lifecycle; document the exact capacity-consuming states |
| Data types | Several stable technical states use VARCHAR plus CHECK | Reconcile stable technical states to PostgreSQL ENUM; retain lookup tables for business categories |
| Defaults | Column register contains NOT SPECIFIED IN SOURCE | Resolve every column default as database default, application-generated value or explicitly no default |
| Identifiers | UUID columns do not express UUIDv7 generation contract | Record application-generated UUIDv7 authority and generator contract |
| Timestamps | TIMESTAMPTZ fields exist but standards are not fully reconciled | Apply OD-08 to every timestamp and timezone-sensitive field |
| Reporting | Candidate reports include finance and transfer reports | Retain only reports whose source domains are in DYMS 1.0 |
| Retention | Candidate source enrollment includes deferred tables | Reconcile retention subjects only to included source records; retain approved retention controls |
| Governance | CPERD-02 status and manifest language conflict | Generate one exact-hash manifest for CPERD-03 and preserve prior approvals |

## 6. Federation and organizational ownership model

The target hierarchy is:

`Federation → District → Local Church`

The physical model must:
- Represent a federation as an explicit organizational parent.
- Require each district to belong to one federation.
- Require each church to belong to one district.
- Enforce federation-scoped district identifier uniqueness.
- Enforce district-scoped church identifier uniqueness.
- Use composite foreign keys or equivalent database constraints to prevent cross-parent references.
- Derive authorization scope from trusted server-side relationships.
- Preserve federation access as read-only oversight.
- Prevent federation users from creating, editing, deleting or approving district/local-church operational records.
- Prevent one district from accessing another district's operational records.

Department ownership follows the approved ODR-004 design: departments are district-owned. Events are district-owned or church-owned; a department may organize an event but does not own it.

## 7. Membership physical invariant

The current church membership predicate must be based on the IDX-R02 lifecycle, not transfer state.

At minimum:
- ACTIVE is current.
- SUSPENDED is not current.
- TERMINATED is not current.
- Reactivation transitions the same suspended membership record back to ACTIVE.
- A member cannot have two ACTIVE church membership rows.
- The membership history remains queryable.
- Suspension/termination/reactivation actor, timestamp and reason provenance must be preserved where required by the approved lifecycle and audit model.

The exact persisted ENUM labels, CHECK predicates and partial unique-index expression must be made identical across the column, lifecycle, index, integrity, API and traceability registers. No conflicting membership state vocabulary is permitted.

## 8. Required successor artifact set

CPERD-03 is not complete until the following artifacts are generated and reconciled:

1. CPERD-03 master physical ERD.
2. Canonical physical column register.
3. Canonical primary/unique key and foreign-key register.
4. Canonical index inventory.
5. CHECK, trigger and database-integrity register.
6. Lifecycle state catalogue.
7. Bounded-context and ownership reconciliation.
8. API contract and scope reconciliation.
9. Requirement-to-physical traceability matrix.
10. Retention-source enrollment reconciliation.
11. Report catalogue and data-governance reconciliation.
12. DFR/DDD/IDX owner-decision reconciliation register.
13. Technical ENUM and state-type catalogue.
14. Physical table scope classification.
15. Static consistency verification report.
16. Independent technical review report.
17. Exact-hash approval manifest.

Current documentation-level candidate counts are 57 tables, 547 columns, 127 named foreign keys, 176 index rows, 40 lifecycle rows and 107 requirement rows. The initial static report records 0 duplicate column pairs, 0 unresolved default placeholders, 0 missing FK source/target columns, 0 missing FK support-index references, 0 duplicate index names and 0 scope-excluded table references in the candidate column/FK/index/lifecycle registers. These are draft candidate counts, not certified final physical inventory totals. The master ERD, API, ownership, retention and report mappings remain under reconciliation. Do not treat these numbers as approval or runtime verification.

## 9. Verification acceptance criteria

The final verification must establish:
- Every table and column is in DYMS 1.0 scope or explicitly excluded.
- Every column has a justified type, length/precision, nullability and default policy.
- Every primary key and foreign key has an exact target and valid ordered column set.
- Every foreign key has an appropriate supporting index.
- Every scoped relationship enforces its organizational parent.
- Every unique business invariant has database-level protection where feasible.
- Every partial unique index uses an approved lifecycle predicate.
- Every CHECK references existing columns and enforces a documented invariant.
- Every trigger has a defined owner, timing, execution context and side-effect boundary.
- No deferred capability remains in active DYMS 1.0 tables, APIs, permissions, reports or traceability.
- All 107 requirements are mapped exactly once or explicitly classified as deferred/excluded through an owner-approved scope mapping.
- No duplicate table/column pairs, FK names, index names or conflicting lifecycle labels exist.
- The approval manifest hashes match the exact reviewed files.

Static verification does not substitute for post-authorization PostgreSQL execution, concurrency, security, workload or disaster-recovery tests.

## 10. Open owner-decision status

- DFR-003-OD-01 through OD-08: APPROVED.
- DFR-003-OD-09: PROPOSED; NOT APPROVED.
- DFR-003-OD-10 through OD-12: exact owner approval status must be verified from authoritative records; do not infer.
- IDX-R02: APPROVED.
- AUD-OD-01 through AUD-OD-10: CLOSED/APPROVED as governance decisions; this does not authorize implementation.
- DDD-013: project-owner approval is preserved; independent technical assurance must be recorded separately and must not be represented as completed without evidence.
- DFR-001 through DFR-006: preserve approved baseline and current clarification. DFR-006 does not authorize implementation.

## 11. Implementation boundary

**IMPLEMENTATION AUTHORIZATION GRANTED; EXECUTION BLOCKED PENDING FINAL CPERD-03 APPROVAL.**

This CPERD-03 draft authorizes documentation-only reconciliation. It does not authorize:
- Prisma schema/model creation or modification.
- SQL DDL or database object creation.
- Migrations or migration execution.
- Database creation, modification or testing.
- Seed data or generated clients.
- API, backend or frontend implementation.
- CI changes, infrastructure provisioning or deployment.

The project owner has issued explicit implementation authorization on 2026-11-12. This authorization is conditional and cannot be exercised until the project owner approves the exact final CPERD-03 physical ERD artifact hashes. Final ERD approval remains a separate required gate. Any scope change beyond the approved DYMS 1.0 package requires renewed owner authorization.

## 12. Current status

**CPERD-03 Draft 0.4 — RECONCILIATION IN PROGRESS.**

The current file is a control and correction baseline. It is not the final physical ERD or a certification report. The separate implementation authorization has been granted but cannot be exercised before approval of the final CPERD-03 artifact hashes.
