# DYMS CPERD-03 — Open Issues and Verification Matrix

- Revision: 0.1
- Date: 2026-11-12
- Status: **WORKING CHECKLIST — NOT FINAL VERIFICATION**
- Implementation authorization: **GRANTED CONDITIONALLY; EXECUTION BLOCKED PENDING FINAL CPERD-03 APPROVAL**

## 1. Purpose

This matrix controls the CPERD-03 documentation reconciliation. Each item must be closed with evidence in the successor registers. No item is closed merely because a proposal exists or a static report lists a count.

## 2. Scope and model corrections

| ID | Required work | Evidence required | Status |
|---|---|---|---|
| SCOPE-01 | Remove Church Transfer from DYMS 1.0 | CPERD-03 column/FK/index/lifecycle/traceability candidates exclude transfer; integrity/API/report reconciliation still required | PARTIALLY CLOSED |
| SCOPE-02 | Remove finance/payment/budget model from DYMS 1.0 | CPERD-03 column/FK/index/lifecycle/traceability/integrity candidates exclude finance; API/report/retention reconciliation still required | PARTIALLY CLOSED |
| SCOPE-03 | Defer credential issuance and evidence management | CPERD-03 column/FK/index/lifecycle/traceability/integrity candidates exclude issuance/evidence; API/report/retention reconciliation still required | PARTIALLY CLOSED |
| SCOPE-04 | Preserve the distinction between membership category and credential | Membership categories remain Adventurer, Pathfinder and Senior Youth as approved; Master Guide remains a credential/qualification, not a member category | OPEN |
| ORG-01 | Add federation parent entity | Federation candidate and districts.federation_id represented in column and FK candidates; master ERD, composite ownership and static checks remain | PARTIALLY CLOSED |
| ORG-02 | Enforce district code uniqueness within federation | Composite unique key/index and supporting relationship design | OPEN |
| ORG-03 | Enforce church code uniqueness within district | Composite unique key/index retained and verified | OPEN |
| ORG-04 | Enforce district ownership on child records | Composite FK or equivalent database-level ownership constraints, plus application validation | OPEN |
| MEM-01 | Define IDX-R02 current membership invariant | Exact lifecycle states, partial unique index predicate, CHECK constraints and API transition contract | OPEN |
| MEM-02 | Preserve suspension/reactivation identity | Reactivation restores the same membership record; no new current membership row is created | OPEN |
| MEM-03 | Preserve termination history | Terminated record remains historical and is excluded from current membership uniqueness | OPEN |

## 3. Uniqueness and integrity

| ID | Required work | Evidence required | Status |
|---|---|---|---|
| UNI-01 | Normalized email uniqueness | Canonical normalization specification and global unique constraint/index | OPEN |
| UNI-02 | Single active primary category | Exact current-category predicate and partial unique index | OPEN |
| UNI-03 | Department membership uniqueness | Multiple departments allowed; one current membership per member/department | OPEN |
| UNI-04 | Event attendance uniqueness | Unique member/event/attendance context enforced | OPEN |
| UNI-05 | Appointment conflict prevention | Exact scope key and approved active-interval overlap invariant | OPEN |
| INT-01 | UUIDv7 generation | Application-layer generator contract, native UUID storage and no implicit random UUID defaults | OPEN |
| INT-02 | FK integrity | Every FK target exists, ordered columns match, delete/update action is approved | OPEN |
| INT-03 | Cross-district integrity | Parent scope enforced by composite relationships and transaction-safe application checks | OPEN |
| INT-04 | CHECK integrity | Every CHECK references existing columns and enforces a documented invariant | OPEN |
| INT-05 | Trigger integrity | Every trigger has exact timing, event, owner, function, privilege and side-effect contract | OPEN |
| INT-06 | Append-only audit | Runtime/worker cannot UPDATE, DELETE or TRUNCATE append-only evidence; narrowly controlled writer path | OPEN |

## 4. Data type, default and time standards

| ID | Required work | Evidence required | Status |
|---|---|---|---|
| TYPE-01 | Stable technical states | PostgreSQL ENUM catalogue and exact use by every relevant column | OPEN |
| TYPE-02 | Business categories | Lookup tables and versioned business values, not ENUMs where values evolve | OPEN |
| TYPE-03 | JSONB boundary | Every JSONB column has documented metadata/integration purpose and validation boundary | OPEN |
| TYPE-04 | Numeric precision | NUMERIC(19,4) retained as a future finance standard only; no finance tables in DYMS 1.0 | OPEN |
| TYPE-05 | Column defaults | Every column specifies database default, application-generated value or explicitly no default | OPEN |
| TIME-01 | UTC persistence | All exact instants use TIMESTAMPTZ and are persisted as UTC instants | OPEN |
| TIME-02 | IANA zones | Every timezone field uses a valid IANA identifier and has a documented owner/source | OPEN |
| TIME-03 | Recurring schedules | Local recurrence rule and timezone are preserved separately from calculated instants | OPEN |
| TIME-04 | Audit clocks | Audit timestamps are server/database-generated; synchronized system clock requirement is documented | OPEN |
| TIME-05 | Calendar semantics | DATE used for calendar-only values; TIMESTAMPTZ used for exact instants | OPEN |

## 5. Reporting, retention and audit

| ID | Required work | Evidence required | Status |
|---|---|---|---|
| GOV-01 | Audit approvals | AUD-OD-01 through AUD-OD-10 recorded as closed/approved governance decisions | OPEN |
| GOV-02 | Retention scope | Retention subjects link only to included DYMS 1.0 source records | OPEN |
| GOV-03 | No invented schedules | No retention duration or destructive disposal action is invented; no approved schedule means no automated permanent deletion | OPEN |
| GOV-04 | Report scope | Reports use only included domains and district/church/department scope | OPEN |
| GOV-05 | Finance/transfer reports | Remove deferred finance and excluded transfer reports | OPEN |
| GOV-06 | Data ownership | Every report has an accountable data owner and source-domain authorization | OPEN |
| GOV-07 | Federation oversight | Cross-district reports are read-only and do not expose unauthorized personal records | OPEN |

## 6. Cross-register consistency

| ID | Required work | Acceptance criteria | Status |
|---|---|---|---|
| XREG-01 | Master ERD ↔ column register | Exact same table and column sets | OPEN |
| XREG-02 | Column register ↔ FK register | Every FK source/target column exists and ordered key matches | OPEN |
| XREG-03 | FK register ↔ index register | Every FK has a suitable supporting index | OPEN |
| XREG-04 | Unique rules ↔ index register | Every approved uniqueness invariant has exact database enforcement or documented justified alternative | OPEN |
| XREG-05 | CHECK register ↔ column register | No dangling or ambiguous CHECK references | OPEN |
| XREG-06 | Trigger register ↔ lifecycle/API | Trigger effects do not contradict application transition contracts | OPEN |
| XREG-07 | Lifecycle ↔ API | Every command maps to one approved transition and actor/scope rule | OPEN |
| XREG-08 | API ↔ physical model | Every persisted field, FK, status and idempotency invariant has a physical mapping | OPEN |
| XREG-09 | Requirements ↔ physical model | Every included requirement maps once; deferred requirements are explicitly classified | OPEN |
| XREG-10 | Scope exclusion | No excluded/deferred capability remains active in the DYMS 1.0 model | OPEN |
| XREG-11 | Inventory totals | Counts are generated from canonical successor registers and agree across all documents | OPEN |
| XREG-12 | Exact hash manifest | Every reviewed artifact hash matches the committed file | OPEN |

## 7. Static verification requirements

The CPERD-03 static verification report must include:
- Table count and unique table names.
- Column count and unique table/column pairs.
- PK and unique key counts.
- FK count, ordered source/target columns and referential actions.
- FK supporting index coverage.
- Named index count, duplicate detection and blocked/pending predicate list.
- CHECK count and referenced-column validation.
- Trigger count, target table and execution contract validation.
- Enum type/value usage and consistency.
- Column nullability/default completeness.
- Requirement mapping completeness and uniqueness.
- Deferred/excluded scope leak detection.
- Exact artifact SHA inventory.

Static verification must not be described as PostgreSQL execution, concurrency testing or production readiness.

## 8. Independent review

Independent technical review must examine:
- Organizational ownership and tenant isolation.
- Membership lifecycle and IDX-R02 invariant.
- Appointment scope and overlap integrity.
- Attendance uniqueness and correction history.
- Audit immutability and privilege separation.
- Data types, defaults, indexes, constraints and triggers.
- Transaction and concurrency contracts.
- Scope exclusions and traceability.
- Cross-register consistency.

The review report must identify reviewer, date, exact artifact hashes, findings, severity, disposition and ACCEPT/REVISE/BLOCK result. Do not mark external independent DDD-013 assurance complete without the actual review evidence.

## 9. Implementation boundary

The project owner issued explicit implementation authorization on 2026-11-12. This authorization is conditional and cannot be exercised until the exact final CPERD-03 physical ERD artifacts are approved. Final ERD approval remains a separate required gate.

All work in this matrix is documentation-only.

**No Prisma schema, SQL DDL, migrations, database objects, seed data, application code, CI changes, infrastructure changes or implementation tests are authorized.**

Final CPERD-03 approval and separate implementation authorization remain distinct owner decisions.
