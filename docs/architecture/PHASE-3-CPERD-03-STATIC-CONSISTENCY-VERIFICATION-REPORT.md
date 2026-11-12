# DYMS Phase 3 — CPERD-03 Static Consistency Verification Report

- Revision: SCVR-03 Draft 0.1
- Date: 2026-11-12
- Branch: `cperd-03-documentation-reconciliation`
- Verification type: Documentation-level static consistency only
- Status: **INITIAL STATIC CHECK PASS WITH OPEN DESIGN FINDINGS; NOT FINAL CERTIFICATION**
- Independent review: NOT PERFORMED
- Database/DDL execution: NOT PERFORMED

## 1. Scope and method

This report records a programmatic static inspection of the current CPERD-03 column, FK, index, lifecycle and requirement registers. The checks compare the authored register rows and identifiers. They do not parse or execute SQL, Prisma schema, application code, database objects or runtime behavior.

The report is not an independent technical review. It is not final physical ERD approval and does not authorize implementation before the separate final artifact-hash approval gate.

## 2. Static results

| Check | Result | Evidence / interpretation |
|---|---|---|
| Physical tables | PASS | 57 distinct tables in the CPERD-03 column register |
| Physical columns | PASS | 547 column rows; 547 unique table/column pairs |
| Duplicate column declarations | PASS | 0 duplicates |
| Excluded/deferred tables in column inventory | PASS | 0 Church Transfer, finance/payment/budget or credential issuance/evidence tables |
| Column default policy placeholders | PASS | 0 remaining `NOT SPECIFIED IN SOURCE` entries |
| UUID primary key generation | PASS | 56 UUID primary-key columns; all 56 specify application-generated UUIDv7 and no database default |
| Conflicting random UUID defaults | PASS | 0 `gen_random_uuid()` primary-key defaults remain |
| FK relationships | PASS | 127 named FK candidate rows |
| FK source/target columns | PASS | 0 missing source or target columns across the 127 FK rows |
| FK source support indexes | PASS | 127 support-index references resolve; each source index begins with the ordered FK source tuple |
| FK target candidate keys | PASS | All declared PK and composite UNIQUE target keys resolve to their named candidate indexes |
| Index candidates | PASS | 176 named index rows |
| Duplicate index names | PASS | 0 duplicates |
| Index identifier length | PASS | 0 names exceed PostgreSQL's 63-byte identifier limit |
| Index table references | PASS | 0 index rows reference a table absent from the column register |
| Lifecycle rows | PASS | 40 included lifecycle rows; excluded/deferred lifecycle rows absent |
| Requirement traceability | PASS | 107 requirement rows retained and individually classified |
| Non-timezone timestamp types | PASS | 0 non-TIMESTAMPTZ timestamp columns detected |
| Calendar-date columns | PASS | DATE retained for date_of_birth, term_start and term_end |
| Scope-excluded FK/index rows | PASS | 0 excluded/deferred table references in candidate FK and index rows |

## 3. Open design findings

The static checks above do not close these design issues:

1. **Email normalization:** OD-04 approves globally unique normalized email. The canonical normalization algorithm and persisted normalized representation remain unresolved. The corresponding unique index remains blocked.
2. **Department membership uniqueness:** The exact current-state predicate remains unresolved. Multiple department memberships are allowed; duplicate current membership for the same member/department must be prevented.
3. **Event registration uniqueness/capacity:** Exact registration states and the capacity-consuming predicate remain unresolved.
4. **Technical ENUM closure:** The new ENUM catalogue records 12 candidate type mappings. Forty-four additional state-bearing columns still require vocabulary/lifecycle reconciliation. Some existing lifecycle candidates conflict and must not be silently converted into ENUM values.
5. **Timezone validation:** Three IANA timezone fields exist: districts.timezone, events.timezone and event_sessions.timezone. Their application validation and authoritative ownership/source contract remain to be documented.
6. **Recurring events:** No explicit local recurrence-rule column is present in the current column inventory. Confirm whether recurring event schedules are in scope; if they are, preserve the local recurrence rule separately from calculated UTC instants.
7. **Cross-district ownership:** Column existence and FK supporting-index checks pass. Composite ownership coverage for every child relationship still needs a dedicated semantic review.
8. **API and permission traceability:** The 107 requirements have been dispositioned, but the final API, command, permission and bounded-context mapping remains open.
9. **Reporting and retention:** Report ownership, report scope, retention subject coverage and source enrollment require full cross-register reconciliation.
10. **Updated timestamps:** Eight tables have updated_at fields. The trusted update trigger candidate and its exact function, execution privilege and bypass protection require final review.
11. **OD-09:** Migration governance remains PROPOSED, NOT APPROVED.
12. **OD-10 through OD-12:** Exact owner approval status remains unverified.
13. **Independent assurance:** DDD-013 independent technical review evidence has not been supplied or completed.

## 4. Verification limitations

- No PostgreSQL DDL was generated or executed.
- No Prisma schema was changed or generated.
- No migration, database, seed, application or CI changes were made.
- No API, authorization, concurrency, trigger, performance, backup or recovery runtime test was executed.
- Static consistency is not proof of PostgreSQL runtime correctness.
- Independent review must be performed against the exact final artifact hashes.

## 5. Disposition

**INITIAL STATIC CHECK PASS WITH OPEN DESIGN FINDINGS.**

The CPERD-03 package is not ready for final owner approval. Close the open design findings, reconcile the master ERD and all supporting registers, rerun static verification, obtain independent technical review, then prepare the exact-hash owner approval manifest.

The project owner's implementation authorization is recorded as conditional. It is not exercisable until the final CPERD-03 physical ERD artifacts are explicitly approved.

**No implementation is authorized by this report.**
