# DYMS Phase 3 — Final Physical ERD Reconciliation Plan

- Revision: ERD-RP-01
- Date: 2026-11-02
- Scope: DYMS v1.0, Sango District
- Status: **RECONCILIATION PLAN; FINAL PHYSICAL ERD NOT APPROVED**
- Conceptual ERD: owner-approved revision `25f2813e0256d9472daded45657dfb7ac9f70a43` for physical-design review progression only
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This plan defines how the conceptual ERD, domain decisions, requirements, lifecycle catalogues and technical blocker resolutions will be reconciled into one final physical ERD package.

The conceptual ERD approval authorizes progression to physical-design review only. It does not approve physical tables, columns, keys, constraints, indexes, triggers, SQL, Prisma, migrations or implementation.

## 2. Authority hierarchy

Resolve conflicts in this order:

1. Frozen DFR-001–DFR-006 and formal dated owner governance decisions.
2. Explicit project-owner approvals and clarifications.
3. Approved DDD decisions and their evidence.
4. Canonical Owner Decision Register, including delegated-authority status.
5. Canonical testable requirements (107 IDs).
6. Approved conceptual ERD revision.
7. Technical blocker resolutions and physical-design proposals.
8. Supporting diagrams and implementation-neutral design notes.

A lower-level technical proposal cannot override an approved policy decision. A README statement cannot silently supersede a formal decision register. The DFR-006 repository discrepancy must be resolved by a dated governance record before implementation authorization is reconsidered.

## 3. Source documents to reconcile

| Source | Authority/use | Required treatment |
|---|---|---|
| `docs/decisions/DECISION-REGISTER.md` | DFR-001–DFR-006 | Preserve; resolve DFR-006 conflict with dated governance decision |
| `docs/decisions/DDD-DECISION-REGISTER.md` | Canonical DDD-001–015 | Map every approved decision and unresolved boundary |
| `docs/decisions/PHASE-2-OWNER-DECISION-REGISTER.md` | ODR authority and owner approvals | Preserve owner approval vs delegated-authority confirmation distinction |
| `docs/product/PHASE-1-TESTABLE-REQUIREMENTS.md` | 107 testable requirements | One-to-many traceability to entity, attribute, relationship, constraint, API and test |
| `docs/product/PHASE-1-REQUIREMENTS-CONSOLIDATION.md` | Domain policy narrative | Resolve outdated statements against canonical ODR/DDD register |
| `docs/architecture/PHASE-2-PHYSICAL-DATABASE-DESIGN.md` | Candidate relational design | Mark superseded portions; reconcile every candidate field |
| `docs/architecture/PHASE-2-COLUMN-LEVEL-PHYSICAL-REGISTER.md` | Column inventory | Regenerate from accepted physical model, not overlay-only notes |
| `docs/architecture/PHASE-2-FOREIGN-KEY-AND-COLUMN-REGISTER.md` | FK/nullability | Regenerate exact source/target columns, nullability and delete behavior |
| `docs/architecture/PHASE-2-CANONICAL-INDEX-INVENTORY.md` | Index inventory | Regenerate all PK, unique, FK-support, lookup and partial/expression indexes |
| `docs/architecture/PHASE-2-LIFECYCLE-STATE-CATALOGUE.md` | State vocabulary | Keep POLICY BLOCKED values out of final CHECKs/seeds |
| `docs/architecture/PHASE-2-TECHNICAL-BLOCKER-RESOLUTION.md` | TBR-01 technical proposals | Accept/revise/block each candidate and map into registers |
| `docs/architecture/PHASE-2-DDD-013-PHYSICAL-DESIGN-REVISION.md` | D13-PDR-01 | Independent review and owner approval required |
| `docs/architecture/PHASE-2-DDD-013-ERD-SLICE-VALIDATION.md` | DDD-013 findings | Close every finding with evidence |
| `docs/architecture/PHASE-3-BOUNDED-CONTEXT-MAP.md` | Domain ownership | Reconcile aggregates and cross-context references |
| `docs/architecture/PHASE-3-MODULE-INTERACTION-DESIGN.md` | Transaction/event flows | Reconcile atomicity, audit, outbox and concurrency requirements |
| `docs/architecture/PHASE-3-AUTHENTICATION-AUTHORIZATION-DESIGN.md` | Security design | Reconcile accounts, sessions, grants, denies and audit |
| `docs/architecture/PHASE-3-API-CONTRACT-DESIGN.md` | API catalogue | Reconcile public resource identity and mutation lifecycle |

## 4. Reconciliation workstreams

### ERD-01 — Domain entity and aggregate ownership

For every conceptual entity:
- assign exactly one owning bounded context;
- identify candidate aggregate root and child entities;
- identify immutable history/decision records;
- distinguish identity, reference, transactional and audit entities;
- identify cross-context references and prohibit direct cross-context writes;
- verify every required conceptual relationship appears in the physical model.

Deliverable: entity/aggregate mapping register and revised consolidated ERD.

### ERD-02 — Column and data-type reconciliation

For every physical column:
- canonical name and owning table;
- PostgreSQL type and precision/scale;
- nullability;
- default, if explicitly justified;
- generated vs application-supplied value;
- UTC timestamp and event-timezone semantics;
- sensitive-data classification;
- uniqueness and immutability expectations;
- source requirement/decision ID.

Do not apply blanket defaults. Do not invent lifecycle status defaults. Monetary values use exact decimal types. UUID generation and timestamp conventions must match TBR-01 after review.

Deliverable: complete column-level register with no unexplained omissions.

### ERD-03 — Keys and relationship integrity

For every relationship:
- source and target table/column;
- cardinality and optionality;
- FK name;
- ON DELETE and ON UPDATE behavior;
- supporting index;
- composite ownership invariants;
- cycle and insertion-order implications.

Preserve historical records and avoid destructive cascades. Validate the one-to-one USER–MEMBER relationship and prohibit guardian/delegated account relationships.

Deliverable: complete FK register and relationship diagram.

### ERD-04 — CHECK constraints and lifecycle

For each constraint:
- stable name;
- exact logical predicate in plain language;
- owning policy/decision;
- source requirements;
- whether DERIVED, APPROVED or PROPOSED;
- test cases and invalid examples.

POLICY BLOCKED lifecycle states must not be finalized as CHECK values. Candidate appointment, transfer, department membership, finance and retention states require authority approval before implementation.

Deliverable: canonical CHECK catalogue with no unresolved policy represented as approved.

### ERD-05 — Unique, partial, expression and support indexes

For each index:
- stable name;
- table and ordered columns/expressions;
- uniqueness;
- predicate;
- intended query/invariant;
- FK support purpose;
- PostgreSQL 15 compatibility;
- concurrency test.

Retire superseded index proposals. For DDD-013, the previous four-scope index proposal is superseded by the two mode-specific unique index proposal in D13-PDR-01, which remains unapproved.

Deliverable: complete canonical index inventory.

### ERD-06 — Triggers and database-enforced invariants

For each proposed trigger:
- invariant and why a declarative constraint is insufficient;
- timing and event;
- locking strategy and lock order;
- multi-row behavior;
- deadlock/retry considerations;
- recursion prevention;
- migration/rollback impact;
- concurrency test.

TBR-01 appointment overlap trigger and attendance subject locking remain proposals until independent review. Do not add extensions without a documented requirement and deployment confirmation.

Deliverable: trigger catalogue and concurrency proof plan.

### ERD-07 — Audit and transactional outbox

Map each business mutation to:
- business row changes;
- decision/history rows;
- audit event;
- outbox event;
- correlation/causation metadata;
- transaction boundary;
- retry and duplicate behavior.

Audit evidence must not be silently overwritten. Provider delivery state remains separate from business state.

Deliverable: audit/outbox relationship and transaction matrix.

### ERD-08 — DDD-013 authentication idempotency

Independently review:
- AUTHENTICATED and PRE_AUTHENTICATION identity modes;
- nullable actor/session and required pre-auth context truth table;
- session ownership composite FK;
- scope fingerprint encoding/version;
- key digest and request fingerprint separation;
- HMAC key version retention;
- two partial unique indexes and zero-UUID expression normalization;
- fencing counter and fail-closed BIGINT overflow;
- append-only recovery event ledger;
- password-reset outbox link and protected secret reference;
- 24-hour response retention and 30-day compact tombstone;
- FK-support indexes and cleanup/hold behavior.

No general business idempotency is implied. The D13-PDR-01 design is not approved until every reviewer finding is closed and owner approval is recorded.

Deliverable: approved D13 physical slice, exact constraints/indexes/FKs and test matrix.

### ERD-09 — Reporting, retention and data classification

REPORT-001–010 are part of the 107-ID requirements baseline. The physical design must support:
- versioned report definitions;
- scoped report runs;
- authorization recheck at request, execution and retrieval;
- protected export metadata and private object references;
- audit of export creation and retrieval;
- resource limits and asynchronous jobs.

Report catalogue, classification, disclosure, export permissions and retention policy remain delegated-authority gated. Do not infer a retention duration or permanent deletion rule.

Deliverable: report/retention physical mapping and authority sign-off.

## 5. Known reconciliation findings

| ID | Finding | Current status | Closure evidence required |
|---|---|---|---|
| R-01 | DFR-006 register says design frozen for implementation while current owner gate prohibits implementation pending final ERD approval | OPEN | Dated owner governance clarification preserving DFR-006 and defining separate ERD/implementation gates |
| R-02 | ODR-001/002/003/007/009 delegated policy evidence incomplete | OPEN | Competent authority confirmation or explicit approved conservative exclusion |
| R-03 | ODR-004/005/006/008/010/011/012/013 have project-owner approval but delegated confirmation pending | OPEN | Authority evidence for policy-dependent implementation details |
| R-04 | TBR-01 candidate CHECKs and attendance fields not fully regenerated in canonical column/FK/index registers | OPEN | Regenerated registers and exact cross-reference |
| R-05 | D13-PDR-01 is a revised proposal, not an approved physical slice | OPEN | Independent review, owner decision and full physical mapping |
| R-06 | Lifecycle catalogue contains PROPOSED and POLICY BLOCKED values | OPEN | Approved state catalogue or explicit omission from physical constraints |
| R-07 | Canonical physical registers contain superseded/overlay sections | OPEN | One normalized, internally consistent register set |
| R-08 | API catalogue and domain aggregates not yet fully mapped to physical resources | OPEN | API-to-requirement-to-entity traceability matrix |
| R-09 | Reporting data classification and disclosure matrix incomplete | OPEN | Delegated data/security authority sign-off |
| R-10 | PostgreSQL provider/version and deployment topology not confirmed | OPEN | ODR-ENV technical/deployment owner confirmation |

## 6. Mandatory traceability matrix

The final package must provide at least these mappings:

| From | To |
|---|---|
| Every requirement ID (107) | Owning context and use case |
| Every requirement ID | Entity/attribute/relationship or explicit non-persistence rationale |
| Every domain decision DDD-001–015 | Entity, constraint, workflow and test |
| Every owner decision ODR-001–013 | Physical impact and authority status |
| Every table | Owning bounded context and aggregate |
| Every column | Source requirement/decision and data classification |
| Every FK | Relationship and delete/update rule |
| Every CHECK | Approved invariant and invalid-state test |
| Every index | Query or uniqueness invariant |
| Every trigger | Concurrency invariant and test |
| Every API endpoint | Context, requirement, permission, entity and error contract |
| Every outbox event | Producer transaction, consumer and duplicate behavior |

No row may be labelled approved if its source policy remains proposed or authority blocked.

## 7. Final physical ERD approval package

Before owner approval, assemble:
1. Consolidated logical-to-physical ERD.
2. Entity/aggregate ownership matrix.
3. Complete column-level register.
4. Complete FK and relationship register.
5. Complete PK/unique/index catalogue.
6. CHECK and lifecycle constraint catalogue.
7. Trigger and concurrency design.
8. Audit/outbox transaction matrix.
9. DDD-013 reviewed physical slice.
10. Requirements-to-physical traceability matrix for all 107 requirements.
11. Open-decision and delegated-authority evidence register.
12. Independent review findings and resolutions.
13. PostgreSQL compatibility assessment.
14. Explicit list of excluded/policy-blocked features.
15. Change log and version/hash of the complete ERD package.

## 8. Approval gates

| Gate | Required evidence | State |
|---|---|---|
| Conceptual ERD | Project-owner approval of revision 25f2813e… for progression | COMPLETE, limited to physical review |
| Domain decisions | Canonical DDD register and ODR status | PARTIALLY COMPLETE |
| System architecture | Bounded context, interaction, security and API design review | IN PROGRESS |
| Technical physical design | TBR-01 and D13-PDR-01 independent review | OPEN |
| Register reconciliation | Complete columns, FKs, indexes, CHECKs, triggers | OPEN |
| Delegated policy | Relevant authority sign-offs | OPEN |
| Final physical ERD | Explicit project-owner approval of exact version/hash | NOT APPROVED |
| Implementation | Separate explicit implementation authorization | NOT AUTHORIZED |

## 9. No implementation before approval

Until both final physical ERD approval and separate implementation authorization are recorded, do not:
- create or modify Prisma models/schema;
- generate or run migrations;
- write or execute SQL DDL;
- create database tables, indexes, triggers, constraints or seeds;
- implement controllers, services, DTOs or API routes;
- implement frontend application features;
- provision production infrastructure.

Documentation, diagrams, review matrices and design-only artifacts are permitted.

## 10. Next reconciliation sequence

1. Complete independent review of TBR-01 and D13-PDR-01.
2. Resolve DFR-006 governance discrepancy with a dated owner record.
3. Obtain delegated authority decisions or explicitly exclude affected policy-dependent features.
4. Regenerate canonical physical column, FK, CHECK, index and trigger registers from one source.
5. Reconcile all 107 requirements to contexts, API operations and physical entities.
6. Produce the consolidated final physical ERD and exact artifact hash.
7. Submit the package for explicit project-owner approval.
8. Request separate implementation authorization only after physical ERD approval.

**Current status:** Physical design approval is not granted. Implementation is not authorized.


## 11. Reconciliation execution update (2026-11-02)

The documentation reconciliation pass has produced a consolidated candidate package:

| Workstream | Output | Current result |
|---|---|---|
| Entity/aggregate ownership | PHASE-3-CONSOLIDATED-PHYSICAL-ERD.md | 70 tables assigned to one owning context; five candidate additions identified |
| Column reconciliation | PHASE-3-CANONICAL-PHYSICAL-COLUMN-REGISTER.md | 679 column declarations; old 617-column baseline reconciled |
| FK reconciliation | PHASE-3-CANONICAL-FOREIGN-KEY-REGISTER.md | 166 named candidate relationships; all source/target columns and supporting indexes cross-checked |
| Index reconciliation | PHASE-3-CANONICAL-INDEX-INVENTORY.md | 228 distinct names; 21 superseded names removed; six policy blockers retained as blocked |
| CHECK/trigger enforcement | PHASE-3-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md | Structural predicates, trigger boundaries and concurrency tests catalogued |
| DDD-013 slice | PHASE-3-DDD-013-PHYSICAL-SLICE-REVIEW.md | Ten review questions addressed internally; independent reviewer still pending |
| Requirements traceability | PHASE-3-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md | 107 of 107 requirement IDs mapped, including platform-only and policy-gated requirements |

### 11.1 Automated documentation consistency checks

The current candidate registers were fetched back from the working branch and cross-checked:

- 679 column rows across 70 distinct tables.
- 166 named foreign-key rows.
- 228 distinct index rows.
- Every FK source table and source column exists in the column register.
- Every FK target table and target column exists in the column register.
- Every FK supporting source index exists in the canonical index inventory.
- Every named target candidate key referenced by an FK exists in the index inventory.
- No duplicate index names.
- No index or FK identifier exceeds PostgreSQL's 63-byte identifier limit.
- No stale removed ownership/index names remain in the column register's index references.
- 107 requirement IDs are mapped exactly once; zero unmapped or unrecognized IDs.
- 54 named structural CHECK constraints in the integrity register are referenced by the canonical column register.
- The appointment position-scope model has three composite FKs and three supporting indexes; positions have mandatory district boundary and scope-consistent child references.
- The Phase 2 index comparison is exact: 216 old names, 21 removed, 33 added, 228 current names.
- The Phase 2 FK comparison is exact: 155 old names, 11 removed/renamed, 22 added/renamed, 166 current names.

These are static documentation consistency checks. They are not PostgreSQL DDL execution, query-plan validation, concurrency testing or independent reviewer acceptance.

### 11.2 Remaining gates

The reconciliation package is assembled but is not approved. The following remain open:
- external independent DDD-013 reviewer disposition;
- explicit project-owner approval of five new physical entities and two removed columns;
- ODR-001/002/003/007/009 authority decisions or explicit exclusions;
- delegated confirmation for ODR-004/005/006/008/010/011/012/013 where required;
- DFR-006 governance clarification;
- production PostgreSQL provider/version and environment confirmation;
- retention source enrollment and schedules;
- exact final project-owner approval of the consolidated ERD revision and its Git blob hash.

**Current gate:** consolidated physical-design candidate prepared for review; physical ERD approval NOT GRANTED; implementation NOT AUTHORIZED.
