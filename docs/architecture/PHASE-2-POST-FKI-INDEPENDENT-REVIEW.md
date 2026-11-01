# DYMS Phase 2 Post-FKI Independent Review

**Branch:** `phase-1/requirements-consolidation`  
**Review scope:** Corrected FK register, relational integrity matrix, physical database design, medium-severity index catalogue, FKI audit and owner decision register  
**Review type:** Independent document-level structural review  
**Implementation status:** NOT AUTHORIZED  
**Outcome:** FURTHER REVISION REQUIRED

## 1. Executive assessment

The previous FKI-01 through FKI-07 remediation improved the source documents. The canonical FK register and relational integrity matrix still contain the same 65 table rows in the same order. The review also confirms 44 unique names for the expanded FK set and 109 unique index names in the FK/column register.

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
- 109 proposed index names in the FK/column register are unique and within 63 bytes.
- The medium-severity index catalogue contains 91 unique/access index names, including the permission-side role_permissions index.
- One index name is shared between the two inventories. The combined distinct proposed index-name count is therefore 199, not 109 or 190.
- No live PostgreSQL parser, database catalogue, SQL execution, query plan, migration or application test was run.

## 3. Findings

### PIR-01 — FK inventory is still not a complete one-relationship-per-entry register

**Severity:** High  
**Status:** OPEN

The nine rows previously identified in FKI-01 now contain source-to-target mappings. However, Section 3 still groups several FKs into semicolon-separated source and target lists in a single table row. Section 3.1 names only 44 relationships in the expanded set. The remaining relationships across the other tables do not have individual stable constraint names in the register.

Examples:
- `church_memberships` groups five FKs in one row.
- `church_transfer_requests` groups six FKs in one row.
- `department_memberships` groups six FKs in one row.
- `financial_transactions` groups its account/currency composite relationship and actor relationships.
- `credential_issuances` groups five relationships, including a self-reference.

The register also does not provide, for every FK, the exact target PK/UNIQUE evidence and explicit MATCH behavior. Generic text such as "one index per source FK column" is not a named index declaration.

**Required correction:**
1. Expand the canonical register to one row per FK constraint, not one row per table.
2. Give every FK a stable name, exact ordered source and target tuples, nullability, MATCH behavior, ON DELETE and ON UPDATE actions.
3. Identify the exact target PK/UNIQUE key supporting each referenced tuple.
4. Name the supporting index or cite the exact existing left-prefix index.
5. Preserve a separate 65-table coverage summary so zero-FK tables remain visible.

### PIR-02 — Optional attendance composite-FK nullability is internally contradictory

**Severity:** High  
**Status:** OPEN

The attendance register describes:
- `(registration_id,event_id,member_id)` as nullable only as a complete tuple;
- `(event_session_id,event_id)` as nullable only as a complete tuple;
- Section 3.1 calls both tuples "All NULL or all present".

But `event_id` and `member_id` are required by the mandatory attendance-subject FK. They cannot be NULL when the optional registration or session reference is absent. Therefore an all-NULL tuple is impossible.

The correct physical semantics must be explicitly designed. With required `event_id` and `member_id`, an optional `registration_id` or `event_session_id` normally relies on PostgreSQL MATCH SIMPLE behavior, where a NULL component skips the composite FK check. MATCH FULL would reject the partially NULL tuple. The design must not claim all-null/all-present semantics for these relationships.

**Required correction:**
- State the exact nullability of each source column.
- Specify MATCH SIMPLE or an equivalent explicit CHECK/trigger contract for each optional composite relationship.
- Ensure the registration and session context still matches the mandatory subject tuple.
- Add negative tests for absent optional reference, mismatched event/member, partial nulls, and valid references.

### PIR-03 — FK-support index declarations are incomplete or inaccurate for authorization relationships

**Severity:** High  
**Status:** RESOLVED AT DOCUMENT LEVEL, pending independent re-review

The `access_denies` row says separate source indexes exist for every FK. The medium index catalogue provides `ix_access_denies_target_scope(target_user_account_id, permission_id, effective_from)`, which supports `target_user_account_id` by left prefix, but not `permission_id`, issuer or reviewer lookups. The FK register's Section 5.6/5.7 does not contain named proposals for:
- `access_denies.permission_id`;
- `access_denies.issued_by_user_account_id`;
- `access_denies.reviewed_by_user_account_id`.

The same row's generic "separate source indexes" statement is therefore not backed by a complete named index inventory.

Additionally, `role_conflict_rules` says its canonical unique role-pair/version index supports both role FKs. An ordered unique index on `(role_a_id, role_b_id, version)` supports `role_a_id` by left prefix, not `role_b_id`. A separate `role_b_id)-leading index is present in the proposed FK support list, but the row's explanatory claim must be corrected.

**Required correction:**
- Add and name any missing FK-support indexes after checking all unique/access indexes for valid left-prefix coverage.
- Correct the role-conflict statement to say the pair unique index supports role_a_id only; the separate role_b_id index supports the second FK.
- Verify every index's table and columns against the explicit physical column inventory.

### PIR-04 — Department FK row does not match its corrected composite-index catalogue

**Severity:** Medium  
**Status:** OPEN

The department FK row still lists `ix_fk_departments_church_id` as the church FK index. That name is not present in the current index inventory. The corrected proposal instead has:
- `ix_fk_departments_church_district(church_id,district_id)`, which begins with church_id and supports the composite hierarchy FK;
- `ix_fk_departments_district_id(district_id)`, for the district FK.

The stable constraint-name table correctly describes the composite FK, but Section 3's table-level row remains stale.

**Required correction:** Update the row to name the exact two proposed indexes and explicitly identify the composite FK. Do not retain the removed single-column church index name.

### PIR-05 — Total proposed index inventory is inconsistent

**Severity:** Medium  
**Status:** OPEN

The current FK/column register contains 109 distinct index names. The medium-severity index catalogue contains 91 distinct names. One name is shared, giving 199 distinct proposed index names across both documents.

The FKI audit currently describes 109 as the current index-name list, while the physical database design Section 28 and older matrix follow-up language still describe 190 names (90 + 21 + 79). Those counts describe earlier catalogue revisions and are no longer reliable.

**Required correction:**
- Establish one canonical combined index inventory with one row per distinct index.
- Classify every index as PK, UNIQUE, partial UNIQUE, FK-supporting, query-supporting or concurrency-supporting.
- Identify duplicate definitions, not only duplicate names.
- Recompute counts from the canonical combined inventory and update every summary.
- Verify all proposed columns exist and all predicates are approved or explicitly blocked.

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
| FKI-01 | PARTIALLY RESOLVED | Nine malformed rows corrected, but the complete register is not one row per named FK and lacks target-key/MATCH evidence for every relationship. |
| FKI-02 | RESOLVED AT DOCUMENT LEVEL | role_permissions permission_id index is explicitly proposed. |
| FKI-03 | RESOLVED AT DOCUMENT LEVEL | Redundant standalone retention-subject indexes removed. |
| FKI-04 | PARTIALLY RESOLVED | Several full composite proposals are present, but the complete 65-table composite FK/index pairing has not been independently proven. |
| FKI-05 | RESOLVED AT DOCUMENT LEVEL | Duplicate standalone attendance event/member FKs removed; optional composite nullability still requires PIR-02 correction. |
| FKI-06 | RESOLVED AT DOCUMENT LEVEL | Current register names are unique and within 63 bytes; full combined inventory still needs reconciliation under PIR-05. |
| FKI-07 | PARTIALLY RESOLVED | RESTRICT/RESTRICT is stated per FK-bearing table row and for 44 named constraints, but not as a complete per-relationship action register. |

## 5. Required next correction sequence

1. Complete the one-row-per-FK register and per-relationship action contract (PIR-01 and PIR-06).
2. Correct the department row and reconcile every composite FK/index pair (PIR-04).
3. Create one canonical combined index inventory and correct all counts (PIR-05).
4. Complete the per-column specification, preserving policy blockers (PIR-07).
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
