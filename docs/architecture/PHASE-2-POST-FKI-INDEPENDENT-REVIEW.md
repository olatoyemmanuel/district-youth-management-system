# DYMS Phase 2 Post-FKI Independent Review

**Branch:** `phase-1/requirements-consolidation`  
**Review scope:** Corrected FK register, relational integrity matrix, physical database design, medium-severity index catalogue, FKI audit and owner decision register  
**Review type:** Independent document-level structural review  
**Implementation status:** NOT AUTHORIZED  
**Outcome:** FURTHER REVISION REQUIRED

## 1. Executive assessment

The canonical FK table-coverage summary and relational integrity matrix contain the same 65 table rows in the same order. The new named relationship register contains 155 uniquely named FKs across 54 FK-bearing tables, while preserving 11 zero-FK tables. The canonical index inventory contains 121 FK-register names and 99 medium-catalogue names, with four shared names and 216 combined distinct names.

The document-level corrections address the grouped FK inventory, attendance MATCH semantics, authorization index coverage, department composite-index row, and combined index-name count. PIR-05 remains partially resolved because definition-level duplicate/predicate review is outstanding. PIR-06 status reconciliation is now recorded. PIR-07 is partially resolved: all 617 declared columns now have typed, nullability-reconciled entries, while defaults, CHECK naming and policy-dependent constraints remain open.

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
- 155 FK constraint names are unique and within 63 bytes.
- At the time of the initial review, 109 FK-register names and 91 medium-catalogue names were counted. Subsequent PIR-03 corrections added three named access-deny FK indexes to both inventories.
- The canonical inventory now contains 121 distinct FK-register names and 99 medium-catalogue names, with four shared names.
- The combined distinct proposed index-name count is 211. All names remain within PostgreSQL's 63-byte identifier limit.
- No live PostgreSQL parser, database catalogue, SQL execution, query plan, migration or application test was run.

## 3. Findings

### PIR-01 — FK inventory is still not a complete one-relationship-per-entry register

**Severity:** High  
**Status:** VERIFIED AT DOCUMENT LEVEL, 2026-11-01; SQL/DDL validation pending

The table-level Section 3 summary remains grouped but is now explicitly designated as a table-coverage summary. The [Named Foreign-Key Relationship Register](./PHASE-2-NAMED-FOREIGN-KEY-RELATIONSHIP-REGISTER.md) provides 155 one-row-per-FK declarations across 54 FK-bearing tables, with 11 zero-FK tables retained in the 65-table coverage summary.

All 155 rows record stable constraint names, ordered source/target tuples, source nullability, target PK/UNIQUE evidence, MATCH SIMPLE semantics, ON DELETE/UPDATE actions, and a named supporting index or documented left-prefix support.

**Correction recorded:** The relationship-level register supplies the one-row-per-FK inventory. Independent review must verify each relationship against the source design and confirm candidate-key and index definitions.

### PIR-02 — Optional attendance composite-FK nullability is internally contradictory

**Severity:** High  
**Status:** VERIFIED AT DOCUMENT LEVEL, 2026-11-01; SQL/DDL validation pending

The canonical physical design, FK register and integrity matrix now agree: `event_id` and `member_id` are NOT NULL; `registration_id` and `event_session_id` are independently nullable. The optional registration and session composite FKs use MATCH SIMPLE, not MATCH FULL. A NULL optional identifier skips only its optional FK; the mandatory subject FK continues to enforce event/member identity.

Positive and negative integrity-test requirements cover valid references, absent optional references, mismatched event/member registration, mismatched event/session, and subject/context mismatch.

**Correction recorded:** The three canonical documents now state the same nullability and MATCH SIMPLE contract. PostgreSQL execution tests remain pending an approved implementation environment.

### PIR-03 — FK-support index declarations are incomplete or inaccurate for authorization relationships

**Severity:** High  
**Status:** VERIFIED AT DOCUMENT LEVEL, 2026-11-01; SQL/DDL validation pending

The FK register and medium catalogue now name separate indexes for `access_denies.permission_id`, `issued_by_user_account_id`, and `reviewed_by_user_account_id`. The target-scope index is correctly described as supporting `target_user_account_id` only by left prefix. The `role_conflict_rules` row now states that the pair/version unique key supports `role_a_id`; `ix_fk_role_conflict_rules_role_b_id` supports `role_b_id`.

**Correction recorded:** All three missing access-deny FK index proposals are included in the canonical combined inventory. Independent review must still verify the index definitions against final column and workload requirements.

### PIR-04 — Department FK row does not match its corrected composite-index catalogue

**Severity:** Medium  
**Status:** VERIFIED AT DOCUMENT LEVEL, 2026-11-01; SQL/DDL validation pending

The table-level row now references `ix_fk_departments_church_district(church_id,district_id)` for the composite church/district relationship and `ix_fk_departments_district_id(district_id)` for the district FK. The redundant standalone church FK is not listed; the composite FK proves both church existence and same-district ownership.

**Correction recorded:** The table summary, named relationship register and index catalogue now agree.

### PIR-05 — Total proposed index inventory is inconsistent

**Severity:** Medium  
**Status:** PARTIALLY RESOLVED, pending definition-level redundancy review

The [Canonical Index Inventory](./PHASE-2-CANONICAL-INDEX-INVENTORY.md) contains 216 distinct proposed index names: 121 in the FK register, 99 in the medium-severity catalogue, and four shared names. It contains one row per distinct proposed name and classifies each as FK support, unique/partial unique, or access/workload. Primary-key indexes are excluded because PostgreSQL generates them.

Definition-level duplicate detection, final column/predicate verification, lifecycle-predicate approval and workload review remain outstanding.

**Correction recorded:** The conflicting 190-, 199-, 202- and 206-name summaries have been superseded by the 216-name inventory. The remaining definition-level review keeps this finding partially resolved.

### PIR-06 — FKI finding statuses and historical summaries are inconsistent

**Severity:** Medium  
**Status:** VERIFIED AT DOCUMENT LEVEL, 2026-11-01; SQL/DDL validation pending

The FKI audit now contains a current disposition summary at the top. Its original OPEN labels are explicitly identified as historical initial status. The current disposition table records the status and evidence for FKI-01 through FKI-07.

The acceptance checklist now marks the completed document-level items as checked and retains outstanding index-redundancy and cross-document verification items as open. The physical-design document and relational matrix now identify the Post-FKI Independent Review as the current status source. Historical status statements in earlier physical-design sections are explicitly superseded by Section 31.

**Correction recorded:** The status hierarchy, checklist and current review references are reconciled. Independent review remains necessary to confirm the updated evidence and remaining open items.

### PIR-07 — Column-level physical specification remains incomplete

**Severity:** High  
**Status:** PARTIALLY RESOLVED, pending definition-level completion and independent re-review

The new [Column-Level Physical Register](./PHASE-2-COLUMN-LEVEL-PHYSICAL-REGISTER.md) provides 617 one-row-per-column entries across all 65 physical tables. The type and nullability entries have been reconciled against the current physical table definitions. The register also records explicit defaults where stated, PK/UNIQUE/CHECK participation found in the source, FK participation/actions from the 155-row relationship register, supporting indexes from the canonical index inventory, and owner-decision blockers.

The reconciliation corrected 129 generic type declarations to the exact proposed PostgreSQL types and aligned the remaining timestamp, retention, scope and outbox fields. The three Section 18 table additions and the role_conflict_reviews table now have separate column definitions.

The column-level register still records NOT SPECIFIED IN SOURCE for defaults not declared in the design. Most columns do not yet have an explicit default decision. CHECK constraints need stable names and exact expressions. UUID generation, timestamp defaults, lifecycle state constraints, policy-dependent scope rules, retention-source enrollment, and production PostgreSQL compatibility remain open.

**Correction recorded:** The typed-column transcription gap is closed at document level. The complete physical design is not yet DDL-ready, so this finding remains partially resolved.

## 4. FKI-01 through FKI-07 disposition after independent review

| Original finding | Independent disposition | Reason |
|---|---|---|
| FKI-01 | RESOLVED AT DOCUMENT LEVEL, pending independent re-review | The 155-row named FK relationship register records one row per declared FK, ordered tuples, source nullability, target-key evidence, MATCH semantics, actions and supporting index coverage. |
| FKI-02 | RESOLVED AT DOCUMENT LEVEL | role_permissions permission_id index is explicitly proposed. |
| FKI-03 | RESOLVED AT DOCUMENT LEVEL | Redundant standalone retention-subject indexes removed. |
| FKI-04 | RESOLVED AT DOCUMENT LEVEL, verified 2026-11-01 | All 10 composite target tuples match exact named UNIQUE keys; all 155 source support indexes begin with the complete ordered source tuple. All 57 partial support-index predicates cover nullable FK components without excluding valid references. |
| FKI-05 | RESOLVED AT DOCUMENT LEVEL | Duplicate standalone attendance event/member FKs removed; optional composite null semantics now explicitly use MATCH SIMPLE and have positive/negative test requirements. |
| FKI-06 | RESOLVED AT DOCUMENT LEVEL | Names are unique and within 63 bytes; the canonical combined inventory contains 216 distinct names. |
| FKI-07 | RESOLVED AT DOCUMENT LEVEL, pending independent re-review | The 155-row named FK relationship register states RESTRICT/RESTRICT for every relationship. SQL validation remains outside this document review. |

## 5. Required next correction sequence

1. Complete default decisions, CHECK names/expressions and policy-dependent constraints in the 617-column register (PIR-07).
2. Finish definition-level index duplicate, predicate and workload validation (PIR-05).
3. Independently verify the 155-row FK relationship register and 216-name index inventory.
4. Conduct a fresh acceptance review and update all dispositions.

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
