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
| ENUM state-column coverage | PASS WITH OPEN VOCABULARIES | 56 state-column mappings across 53 distinct proposed ENUM types; 16 mappings remain open/conflicted |
| CPERD-02 API route inventory | PASS | 151 endpoint rows; 128 distinct route path strings parsed |
| Deferred API route families | PASS | 8 Church Transfer, 16 finance/payment/budget and 9 credential route strings identified for exclusion/deferment |
| Federation oversight API proposal | PASS WITH OPEN CONTRACT | Three GET-only, federation-bounded, aggregate-only route candidates added; request/response and permission review remains open |
| Non-timezone timestamp types | PASS | 0 non-TIMESTAMPTZ timestamp columns detected |
| Calendar-date columns | PASS | DATE retained for date_of_birth, term_start and term_end |
| Scope-excluded FK/index rows | PASS | 0 excluded/deferred table references in candidate FK and index rows |
| Cross-district semantic ownership | BLOCKED | Referential columns and support indexes resolve, but member district ownership and several member-to-district child relationships are not yet proven by composite FKs |
| Federation-scoped authorization | BLOCKED | Current user_role_assignments/access_denies candidates lack an explicit federation scope; read-only Federation Oversight needs a federation-bound grant/deny model |

## 3. Open design findings

The static checks above do not close these design issues:

1. **Email normalization:** OD-04 approves globally unique normalized email. The canonical normalization algorithm and persisted normalized representation remain unresolved. The corresponding unique index remains blocked.
2. **Department membership uniqueness:** The exact current-state predicate remains unresolved. Multiple department memberships are allowed; duplicate current membership for the same member/department must be prevented.
3. **Event registration uniqueness/capacity:** Exact registration states and the capacity-consuming predicate remain unresolved.
4. **Technical ENUM closure:** The successor ENUM catalogue contains 56 state-column mappings across 53 distinct proposed types. Sixteen mappings remain open or conflicted. In particular, idempotency_records.status differs between the inherited integrity CHECK and lifecycle catalogue and must be reconciled before the ENUM can be finalized.
5. **Timezone validation:** Three IANA timezone fields exist: districts.timezone, events.timezone and event_sessions.timezone. Their application validation and authoritative ownership/source contract remain to be documented.
6. **Recurring events:** No explicit local recurrence-rule column is present in the current column inventory. Confirm whether recurring event schedules are in scope; if they are, preserve the local recurrence rule separately from calculated UTC instants.
7. **Cross-district ownership:** The dedicated CPERD-03 gap review found that members has no district_id and several member-to-district relationships use separate simple FKs. OD-03 requires same-district composite ownership enforcement. Treat this as a high-priority blocker until the proposed correction is reconciled and added to the canonical registers.
8. **Federation authorization scope:** Federation Oversight is read-only, but the current role-grant/deny schema has no federation scope. A federation-bound grant and deny model is a required design correction.
9. **API and permission traceability:** The 107 requirements have been dispositioned, but the final API, command, permission and bounded-context mapping remains open.
10. **Reporting and retention:** Report ownership, report scope, retention subject coverage and source enrollment require full cross-register reconciliation.
11. **Updated timestamps:** Eight tables have updated_at fields. The trusted update trigger candidate and its exact function, execution privilege and bypass protection require final review.
12. **OD-09:** Migration governance remains PROPOSED, NOT APPROVED.
13. **OD-10 through OD-12:** Exact owner approval status remains unverified.
14. **Independent assurance:** DDD-013 independent technical review evidence has not been supplied or completed.

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


## 6. Input artifact SHA inventory

These are the exact Git blob hashes inspected for this report on branch `cperd-03-documentation-reconciliation`. The report's own final blob hash and any later revisions must be recorded in the final approval manifest.

| Artifact | Path | Git blob SHA |
|---|---|---|
| Master physical ERD | `PHASE-3-CONSOLIDATED-PHYSICAL-ERD-CPERD-03.md` | `b37447fa36852f2a6d0993b16c52565aaf1b569f` |
| Column register | `PHASE-3-CPERD-03-CANONICAL-PHYSICAL-COLUMN-REGISTER.md` | `45300927ad9e801e0afcdaf5daca483fcb1e580f` |
| FK register | `PHASE-3-CPERD-03-CANONICAL-FOREIGN-KEY-REGISTER.md` | `9e60b6a2de7f650de9c53079ad78f0072c31f44b` |
| Index inventory | `PHASE-3-CPERD-03-CANONICAL-INDEX-INVENTORY.md` | `1bae0b39ccfb459c329a955df796b2f22d05022f` |
| Lifecycle catalogue | `PHASE-3-CPERD-03-LIFECYCLE-STATE-CATALOGUE.md` | `29c449cfef99eee07bef423180080ab1d9b98335` |
| Integrity and trigger register | `PHASE-3-CPERD-03-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md` | `b0680278a7dd934faf8b02c1812f54cf79a9e3c3` |
| ENUM catalogue | `PHASE-3-CPERD-03-TECHNICAL-ENUM-AND-STATE-TYPE-CATALOGUE.md` | `ca934fe3f925a9b11593d1b534ea2a5af111b7e0` |
| Requirement traceability | `PHASE-3-CPERD-03-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md` | `e99b07568ab7fd093abe8eb5e16e412c0975ebc3` |
| API scope reconciliation | `PHASE-3-CPERD-03-API-CONTRACT-AND-SCOPE-RECONCILIATION.md` | `83380ada31ece92c0122704174cd707e033c65b4` |
| Bounded-context reconciliation | `PHASE-3-CPERD-03-BOUNDED-CONTEXT-AND-OWNERSHIP-RECONCILIATION.md` | `9736ff1991d182858ccedbfdfb07f8ad43678500` |
| Cross-district ownership review | `PHASE-3-CPERD-03-CROSS-DISTRICT-OWNERSHIP-INTEGRITY-RECONCILIATION.md` | `b25bb4579c3da899688e9ce45bfc808d19414ada` |
| Retention source reconciliation | `PHASE-3-CPERD-03-RETENTION-SOURCE-ENROLLMENT-SCOPE-RECONCILIATION.md` | `c1029a4a8f97541c004c3ae812a888c2c512dc22` |
| Open issues matrix | `PHASE-3-CPERD-03-OPEN-ISSUES-AND-VERIFICATION-MATRIX.md` | `8ff3ef03a435d3d0263d0a936e62e56d5b2d7e87` |
| Owner decision reconciliation | `PHASE-3-CPERD-03-OWNER-DECISION-AND-SCOPE-RECONCILIATION.md` | `28397c2a78c7fca79543968a4fdba61b4b6d9fa7` |
| Physical table scope classification | `PHASE-3-CPERD-03-PHYSICAL-TABLE-SCOPE-CLASSIFICATION.md` | `6d4fd2dce548a8ec267a4e4729dd1ff2feceb08a` |
| Reporting catalogue proposal/addendum | `PHASE-3-CPERD-13-REPORT-CATALOGUE-AND-DATA-GOVERNANCE-PROPOSAL.md` | `3a8b4b1c063cfa07cba1d41601cc72ef899675e6` |

The input hashes above identify the precise documentation snapshots used for the current static pass. Any subsequent edit invalidates the corresponding hash and requires a new fetch and verification pass before owner approval.
