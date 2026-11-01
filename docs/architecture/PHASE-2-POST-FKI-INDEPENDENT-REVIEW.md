# DYMS Phase 2 Post-FKI Independent Review

**Branch:** `phase-1/requirements-consolidation`  
**Review scope:** Corrected FK register, relational integrity matrix, physical database design, medium-severity index catalogue, FKI audit and owner decision register  
**Review type:** Independent document-level structural review  
**Implementation status:** NOT AUTHORIZED  
**Outcome:** FURTHER REVISION REQUIRED

## 1. Executive assessment

The previous FKI-01 through FKI-07 remediation improved the source documents. The canonical FK register and relational integrity matrix still contain the same 65 table rows in the same order. The initial review confirmed 44 named expanded FKs and 109 FK-register index names. The corrected relationship register now contains 155 uniquely named FKs; the canonical index inventory contains 116 FK-register names.

However, the corrections do not yet satisfy the complete acceptance contract. Several relationships remain grouped rather than represented as individually named FK declarations. Some FK-support indexes are asserted but not named or are absent. Attendance optional-composite semantics are contradictory. The total index inventory is inconsistent across the source documents.

The physical database design is therefore not ready for owner approval or implementation.

## 2. Validation performed

The review inspected:
- `PHASE-2-PHYSICAL-DATABASE-DESIGN.md`;
- `PHASE-2-RELATIONAL-INTEGRITY-MATRIX.md`;
- `PHASE-2-FOREIGN-KEY-AND-COLUMN-REGISTER.md`;
- `PHASE-2-MEDIUM-SEVERITY-RELATIONAL-INTEGRITY-REMEDIATION.md`;
- `PHASE-2-FK-CONSTRAINT-AND-INDEX-REDUNDANCY-AUDIT.md`;
- `PHASE-2-RELATIONAL-INTEGRITY-SECOND-REVIEW.md`;
- `PHASE-2-LIFECYCLE-STATE-CATALOGUE.md`;
- `PHASE-2-OWNER-DECISION-REGISTER.md`.

Document-level checks:
- 65 FK-register table rows.
- 65 relational-matrix table rows.
- Table names and order match exactly.
- 54 rows declare one or more FKs; 11 tables have no parent FK.
- 44 expanded FK constraint names are unique and within 63 bytes.
- At the time of the initial review, 109 FK-register names and 91 medium-catalogue names were counted. Subsequent PIR-03 corrections added three named access-deny FK indexes to both inventories.
- The canonical inventory now contains 116 distinct FK-register names and 94 medium-catalogue names, with four shared names.
- The combined distinct proposed index-name count is 206. All names remain within PostgreSQL's 63-byte identifier limit.
- No live PostgreSQL parser, database catalogue, SQL execution, query plan, migration or application test was run.

## 3. Findings

### PIR-01 — FK inventory is still not a complete one-relationship-per-entry register

**Severity:** High  
**Status:** RESOLVED AT DOCUMENT LEVEL, pending independent re-review

The table-level Section 3 summary remains grouped but is now explicitly designated as a table-coverage summary. The [Named Foreign-Key Relationship Register](./PHASE-2-NAMED-FOREIGN-KEY-RELATIONSHIP-REGISTER.md) provides 155 one-row-per-FK declarations across 54 FK-bearing tables, with 11 zero-FK tables retained in the 65-table coverage summary.

All 155 rows record stable constraint names, ordered source/target tuples, source nullability, target PK/UNIQUE evidence, MATCH SIMPLE semantics, ON DELETE/UPDATE actions, and a named supporting index or documented left-prefix support.

**Correction recorded:** The relationship-level register supplies the one-row-per-FK inventory. Independent review must verify each relationship against the source design and confirm candidate-key and index definitions.

### PIR-02 — Optional attendance composite-FK nullability is internally contradictory

**Severity:** High  
**Status:** RESOLVED AT DOCUMENT LEVEL, pending independent re-review

The canonical physical design, FK register and integrity matrix now agree: `event_id` and `member_id` are NOT NULL; `registration_id` and `event_session_id` are independently nullable. The optional registration and session composite FKs use MATCH SIMPLE, not MATCH FULL. A NULL optional identifier skips only its optional FK; the mandatory subject FK continues to enforce event/member identity.

Positive and negative integrity-test requirements cover valid references, absent optional references, mismatched event/member registration, mismatched event/session, and subject/context mismatch.

**Correction recorded:** The three canonical documents now state the same nullability and MATCH SIMPLE contract. PostgreSQL execution tests remain pending an approved implementation environment.

### PIR-03 — FK-support index declarations are incomplete or inaccurate for authorization relationships

**Severity:** High  
**Status:** RESOLVED AT DOCUMENT LEVEL, pending independent re-review

The FK register and medium catalogue now name separate indexes for `access_denies.permission_id`, `issued_by_user_account_id`, and `reviewed_by_user_account_id`. The target-scope index is correctly described as supporting `target_user_account_id` only by left prefix. The `role_conflict_rules` row now states that the pair/version unique key supports `role_a_id`; `ix_fk_role_conflict_rules_role_b_id` supports `role_b_id`.

**Correction recorded:** All three missing access-deny FK index proposals are included in the canonical combined inventory. Independent review must still verify the index definitions against final column and workload requirements.

### PIR-04 — Department FK row does not match its corrected composite-index catalogue

**Severity:** Medium  
**Status:** RESOLVED AT DOCUMENT LEVEL, pending independent re-review

The table-level row now references `ix_fk_departments_church_district(church_id,district_id)` for the composite church/district relationship and `ix_fk_departments_district_id(district_id)` for the district FK. The redundant standalone church FK is not listed; the composite FK proves both church existence and same-district ownership.

**Correction recorded:** The table summary, named relationship register and index catalogue now agree.

### PIR-05 — Total proposed index inventory is inconsistent

**Severity:** Medium  
**Status:** PARTIALLY RESOLVED, pending definition-level redundancy review

The [Canonical Index Inventory](./PHASE-2-CANONICAL-INDEX-INVENTORY.md) contains 206 distinct proposed index names: 116 in the FK register, 94 in the medium-severity catalogue, and four shared names. It contains one row per distinct proposed name and classifies each as FK support, unique/partial unique, or access/workload. Primary-key indexes are excluded because PostgreSQL generates them.

Definition-level duplicate detection, final column/predicate verification, lifecycle-predicate approval and workload review remain outstanding.

**Correction recorded:** The conflicting 190-, 199- and 202-name summaries have been superseded by the 206-name inventory. The remaining definition-level review keeps this finding partially resolved.

### PIR-06 — FKI finding statuses and historical summaries are inconsistent

**Severity:** Medium  
**Status:** OPEN

The FKI audit's original finding headings FKI-01 through FKI-07 still say OPEN. Its remediation table later labels several findings addressed in documentation. The acceptance checklist remains unchecked even where the later verification section reports completion. The physical-design document also contains older status statements that say the full FK/column matrix and index reconciliation are still pending.

This creates ambiguity about what was corrected, what remains open, and which status is authoritative.

**Required correction:**
- Keep the original finding descriptions as history, but add a current disposition at the top of the audit.
- Mark each finding RESOLVED, PARTIALLY RESOLVED or OPEN based on the independent evidence, not merely on a change being committed.
- Retain outstanding acceptance checklist items as open.
- Update physical-design and matrix status summaries to reference this review as the current status source.

### PIR-07 — Column-level physical specification remains incomplete

**Severity:** High  
**Status:** OPEN

The medium-severity remediation Section 5.3 explicitly says the complete column inventory for all 65 tables is not available and that an exact per-column nullability/default/FK-action matrix cannot be marked complete. The FK/column register also identifies abbreviated declarations and unresolved source-record enrollment for retention subjects.

The 65-row count proves table coverage, not complete column coverage. The current column declaration inventory is a transcription aid and cannot yet serve as a DDL-ready specification.

**Required correction:**
- Complete every table's column inventory from the canonical physical definitions.
- For every column, record type, nullability, default or explicit no-default, PK/UNIQUE/CHECK/FK participation, FK action, supporting index, and approval/source status.
- Keep unresolved policy-dependent fields visibly blocked rather than inventing defaults or nullability.
- Reconcile the completed column inventory with the FK register and matrix.

## 4. FKI-01 through FKI-07 disposition after independent review

| Original finding | Independent disposition | Reason |
|---|---|---|
| FKI-01 | RESOLVED AT DOCUMENT LEVEL, pending independent re-review | The 155-row named FK relationship register records one row per declared FK, ordered tuples, source nullability, target-key evidence, MATCH semantics, actions and supporting index coverage. |
| FKI-02 | RESOLVED AT DOCUMENT LEVEL | role_permissions permission_id index is explicitly proposed. |
| FKI-03 | RESOLVED AT DOCUMENT LEVEL | Redundant standalone retention-subject indexes removed. |
| FKI-04 | PARTIALLY RESOLVED | Several full composite proposals are present, but the complete 65-table composite FK/index pairing has not been independently proven. |
| FKI-05 | RESOLVED AT DOCUMENT LEVEL | Duplicate standalone attendance event/member FKs removed; optional composite null semantics now explicitly use MATCH SIMPLE and have positive/negative test requirements. |
| FKI-06 | RESOLVED AT DOCUMENT LEVEL | Names are unique and within 63 bytes; the canonical combined inventory contains 206 distinct names. |
| FKI-07 | RESOLVED AT DOCUMENT LEVEL, pending independent re-review | The 155-row named FK relationship register states RESTRICT/RESTRICT for every relationship. SQL validation remains outside this document review. |

## 5. Required next correction sequence

1. Complete the one-row-per-FK register and per-relationship action contract (PIR-01 and PIR-06).
2. Reconcile historical finding statuses and acceptance evidence (PIR-06).
3. Complete the per-column specification, preserving policy blockers (PIR-07).
4. Finish definition-level duplicate/predicate/index validation (PIR-05).
5. Conduct another independent review after the corrections.

## 6. Owner decisions and environment blockers retained

The review does not approve or infer any open decision in the Phase 2 Owner Decision Register. In particular, the following remain decision-gated:
- organizational scope and department ownership;
- finance approval, posting, payment, currency and budget rules;
- attendance registration/correction rules;
- credential authority and evidence rules;
- retention classes, source enrollment and disposal schedules;
- reporting scope/classification/export rules;
- production PostgreSQL version, extensions, UUID generation, collation, timestamp authority, database privileges, and deployment/backup evidence.

The approved DFR-001 through DFR-006 decisions and approved conceptual ERD remain preserved. No owner decision is reopened by this review.

## 7. Implementation boundary

This review authorizes no implementation. No Prisma schema, SQL DDL, migration, database object, generated client, seed or application code has been created or changed.

The physical design remains **not approved for implementation**. Separate explicit project-owner approval of the complete physical design and separate explicit implementation authorization remain mandatory.
