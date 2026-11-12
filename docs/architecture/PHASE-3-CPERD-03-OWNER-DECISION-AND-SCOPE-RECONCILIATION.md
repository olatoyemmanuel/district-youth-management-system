# DYMS CPERD-03 — Owner Decision and Scope Reconciliation

- Revision: 0.1
- Date: 2026-11-12
- Status: **WORKING RECONCILIATION REGISTER — NOT AN APPROVAL RECORD**
- Implementation authorization: **GRANTED BY PROJECT OWNER ON 2026-11-12; CONDITIONAL ON FINAL CPERD-03 PHYSICAL ERD APPROVAL**

## 1. Authority and preservation

This register reconciles CPERD-02 design content against later project-owner decisions. It does not alter historical approval records. CPERD-01 and CPERD-02 remain preserved as their exact approved/candidate artifacts and hashes.

A physical-design proposal is not an owner approval. The project owner has separately granted implementation authorization on 2026-11-12. That authorization cannot be exercised until the exact final CPERD-03 physical ERD artifacts are approved.

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

## 5. CPERD-02 contradictions and CPERD-03 disposition

1. Church Transfer: CPERD-02 contained transfer table/API/index/trigger/lifecycle proposals. CPERD-03 successor physical candidates exclude the transfer table, transfer actor fields, transfer FKs and transfer indexes. The API scope proposal excludes all transfer routes. Transfer reporting and retention are excluded from active v1.
2. Finance/payment/budget: CPERD-02 contained finance tables, routes and reports. CPERD-03 successor physical candidates exclude finance/payment/budget tables and their FKs/indexes. API and report proposals defer these capabilities. Payment-provider callbacks are not active v1 integrations.
3. Credential issuance/evidence: CPERD-02 contained credential definition, version, issuance and evidence tables/routes. CPERD-03 excludes these capabilities. Master Guide remains a qualification/credential distinction, not a primary membership category.
4. Federation hierarchy: CPERD-03 adds a Federation entity candidate, required districts.federation_id, federation-scoped district code uniqueness and a federation FK. The current candidate inventory has 57 tables and 547 columns.
5. Federation oversight: The approved owner boundary is read-only cross-district oversight within one federation. CPERD-03 API and report proposals add a GET-only aggregate query surface. It does not grant operational mutation, report-run creation, export, audit detail or member-level evidence access.
6. Current church membership: IDX-R02 resolves the product rule. ACTIVE is current; SUSPENDED and TERMINATED are not current; reactivation restores the same row. The candidate unique index predicate is status = 'ACTIVE'. API transition and transaction contracts remain open.
7. Primary member category: DDD-002/OD-04 require one active primary category. The candidate unique index uses status = 'ACTIVE'; persisted ENUM and transition reconciliation remain open.
8. Department membership: Multiple departments remain allowed. Exact current-state uniqueness predicate remains open.
9. Event registration: Exact uniqueness and capacity-consuming state predicate remain open.
10. Column defaults: All 547 column rows now have an explicit candidate default policy. Nullable/non-nullable handling and UUIDv7 defaults were reconciled. Owner review remains pending.
11. UUID strategy: All 56 UUID primary-key rows specify application-generated UUIDv7 with no database default. Exact generator package/version and operational contract remain open.
12. Technical states: The ENUM catalogue maps 56 state columns to 53 proposed types. Sixteen mappings remain open or conflicted, including the idempotency status mismatch between the integrity CHECK and lifecycle catalogue.
13. Cross-register counts: Current documentation-level candidate totals are 57 tables, 547 columns, 127 FKs, 175 index rows, 40 lifecycle rows and 107 requirement rows. Static checks passed for FK column existence, target keys, support-index coverage, duplicate names and scope leaks. Independent review remains pending.
14. Phone uniqueness: OD-04 does not approve global phone uniqueness. CPERD-03 removes the inherited unique phone index; phone_e164 remains optional and is not a unique account key.
15. Historical approvals: CPERD-01/CPERD-02 approval records and hashes remain immutable. CPERD-03 uses a successor status and will require a new exact-hash approval manifest.

## 6. Technical questions that require explicit specification, not invented policy

The following are design details to resolve using approved decisions:
- Exact canonical email normalization algorithm and storage/index representation.
- Final ENUM vocabulary and transition reconciliation for the 16 open/conflicted state mappings.
- Exact membership, category, department membership, appointment and event registration lifecycle predicates.
- Owner review of the 547 explicit candidate default policies.
- Exact UUIDv7 generator package/version and failure behavior.
- Every event/recurrence timezone field and local-time interpretation rule; 126 TIMESTAMPTZ fields, three IANA timezone identifiers and the absence of recurrence fields are documented in the timestamp semantics register.
- Exact FK source/target ordered column pairs and composite ownership keys.
- Index rationale and duplicate/redundant index elimination.
- Trigger execution context and trusted timestamp source.
- Retention-source enrollment for included tables, with no invented duration or unapproved source links.
- Report definitions, data owners and field disclosure restricted to included source domains, including Federation aggregate-only oversight.

## 7. Status control

This document is a reconciliation register only.

- CPERD-03 final physical model: NOT YET GENERATED.
- Canonical successor inventory counts: NOT YET ESTABLISHED.
- OD-09: NOT APPROVED.
- OD-10 through OD-12: approval status not verified.
- CPERD-03 final owner approval: NOT GRANTED.
- Implementation authorization: GRANTED CONDITIONALLY on 2026-11-12; execution remains blocked pending final CPERD-03 approval.
