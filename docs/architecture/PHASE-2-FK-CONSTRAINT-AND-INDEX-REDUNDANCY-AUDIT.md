# DYMS Phase 2: FK Constraint and Index Redundancy Audit

**Status:** Technical review findings; remediation required  
**Scope:** DYMS v1.0, Sango District; 65 proposed physical tables  
**Branch:** `phase-1/requirements-consolidation`  
**Inputs:** Physical Database Design, Foreign-Key and Column Register, Relational Integrity Matrix, Medium-Severity Relational Integrity Remediation  
**Implementation:** NOT AUTHORIZED

## 1. Purpose and boundary

This audit checks whether the proposed foreign-key register identifies complete, ordered relationships and whether the proposed FK-support indexes are consistent with the broader access/unique-index catalogue.

This is a document-level review. It does not run SQL, inspect a live PostgreSQL catalogue, benchmark queries, or create database objects. An index described in a design document is a proposal, not proof that the index exists.

### Current disposition summary

The original finding headings below retain their initial OPEN labels as historical audit context. The current document-level dispositions are:

| Finding | Current disposition | Evidence |
|---|---|---|
| FKI-01 | RESOLVED AT DOCUMENT LEVEL, pending independent re-review | 155-row named FK relationship register, with 65-table coverage preserved |
| FKI-02 | RESOLVED AT DOCUMENT LEVEL | Separate permission-side role_permissions index |
| FKI-03 | RESOLVED AT DOCUMENT LEVEL | Redundant retention subject-only indexes removed |
| FKI-04 | RESOLVED AT DOCUMENT LEVEL, verified 2026-11-01 | All 10 composite target tuples match exact named UNIQUE keys; all 155 source support indexes begin with the complete ordered source tuple. Partial-index predicates cover every nullable FK component. SQL validation remains pending. |
| FKI-05 | RESOLVED AT DOCUMENT LEVEL | Attendance subject FK retained; duplicate event/member FKs removed; MATCH SIMPLE semantics recorded |
| FKI-06 | RESOLVED AT DOCUMENT LEVEL | 211-name canonical index inventory; names within 63-byte limit |
| FKI-07 | RESOLVED AT DOCUMENT LEVEL, pending independent re-review | RESTRICT/RESTRICT is stated for all 155 FK relationships |

## 2. Findings requiring correction

The OPEN status printed under each original finding records its status when the audit was first created. Use the current disposition summary above and the [Post-FKI Independent Review](./PHASE-2-POST-FKI-INDEPENDENT-REVIEW.md) for present status.

### FKI-01 — FK register rows mix relationship declarations with column inventories

**Severity:** High  
**Status:** OPEN

In Section 3 of the FK and Column Register, rows for `user_role_assignments`, `access_denies`, `events`, `audit_events`, `audit_access_events`, `idempotency_records`, `retention_subjects`, `retention_holds` and `retention_actions` contain column declarations rather than source-to-target FK mappings.

The column inventory is useful, but it is not an FK declaration. The affected rows do not provide a complete ordered list of FK source columns, target columns, constraint names, nullability of each relationship, and supporting index for every relationship.

**Required correction:** Keep the column inventory in Section 5, and restore each affected table's Section 3 row to relationship-only form. Add one FK entry per relationship, including composite relationships, with:
- stable constraint name;
- ordered source-column tuple;
- ordered target-column tuple;
- target PK/UNIQUE key evidence;
- nullability and MATCH semantics;
- ON DELETE and ON UPDATE actions;
- supporting index name or documented left-prefix coverage.

Do not infer a foreign key merely because a column name resembles an entity identifier. Confirm every relationship against the physical-design source and conceptual ERD.

### FKI-02 — Role-permission unique key does not support both FK lookups

**Severity:** Medium  
**Status:** OPEN

The `role_permissions` row states that UNIQUE `(role_id, permission_id)` supports both foreign keys. A B-tree index on this ordered pair supports a lookup by its leftmost prefix `role_id`; it does not provide a left-prefix lookup by `permission_id`.

**Required correction:** Retain the unique key for duplicate prevention and the `role_id` FK access path. Retain or explicitly propose a separate index beginning with `permission_id`. Correct the FK register wording so it does not claim both relationships are covered by the same ordered composite index.

### FKI-03 — Retention subject indexes are duplicated by left-prefix coverage

**Severity:** Medium  
**Status:** OPEN

The medium-severity index catalogue already proposes:
- `ix_retention_holds_subject_status (retention_subject_id, status)`;
- `ix_retention_actions_subject_time (retention_subject_id, executed_at DESC)`.

The FK and Column Register Section 5.6 additionally proposes:
- `ix_retention_holds_retention_subject_id (retention_subject_id)`;
- `ix_retention_actions_retention_subject_id (retention_subject_id)`.

Each wider index begins with the same FK column and therefore supplies the left-prefix access path required by the register's own stated policy. The standalone proposals are redundant unless a measured workload or a different partial predicate justifies them.

**Required correction:** Remove the two standalone proposals from the FK support-index catalogue, or document a concrete reason for retaining them. Do not create both by default.

### FKI-04 — Composite FK support must be assessed against the complete ordered tuple

**Severity:** High  
**Status:** OPEN

The register correctly states that composite FK source indexes should begin with the same ordered source-column tuple. Several proposed access indexes begin with only the first column of a composite FK, which is not equivalent to a complete tuple-specific support index under the register's acceptance rule.

Examples include:
- `financial_transactions(financial_account_id, currency_code)` versus `ix_financial_transactions_account_date(financial_account_id, transaction_date DESC)`;
- `payments(financial_transaction_id, currency_code)` versus `ix_payments_transaction_time(financial_transaction_id, initiated_at DESC)`;
- `budget_lines(budget_id, currency_code)` versus `ix_budget_lines_budget_order(budget_id, sort_order)`.

These wider workload indexes may still help some lookups, but they do not contain the complete FK tuple as the leading key columns. The additional composite FK indexes in Section 5.7 should remain until a reviewed alternative is documented.

**Required correction:** For every composite FK, record the exact ordered tuple and separately record:
1. a full-tuple left-prefix index that supports FK parent-side checks; and
2. any workload index that serves a different query pattern.

Do not label a single-column-prefix workload index as full composite-FK coverage.

### FKI-05 — Attendance records contain potentially redundant direct foreign keys

**Severity:** High  
**Status:** OPEN

The proposed `attendance_records` relationships include mandatory composite references to:
- `event_attendance_subjects(id, event_id, member_id)`;
- optional `event_registrations(id, event_id, member_id)`;
- optional `event_sessions(id, event_id)`.

The same row also lists standalone `event_id → events(id)` and `member_id → members(id)` relationships. Because the mandatory subject composite FK already proves the event/member pair exists and matches the subject, the two standalone FKs appear redundant for referential integrity. The optional registration and session composite FKs separately prove that those records belong to the same event/member/session context.

**Required correction:** Decide whether the standalone event/member FKs are removed from the proposed model or retained for a documented, independent reason. Do not maintain duplicate FK constraints without an explicit integrity benefit. If retained, ensure their indexes are not duplicated unnecessarily. Preserve the mandatory subject composite FK as the anchor for event/member consistency.

### FKI-06 — Proposed FK index names need a canonical naming pass

**Severity:** Medium  
**Status:** OPEN

The additional FK support-index list includes shortened names with ordinal suffixes, for example:
- `ix_fk_church_transfe_receiving_decided_by_use_10`;
- `ix_fk_attendance_rec_attendance_subject_id_ev_34`;
- `ix_fk_transaction_re_original_transaction_id__51`.

These names are difficult to review and maintain. They appear to encode truncation/uniqueness workarounds rather than a stable naming convention.

**Required correction:** Adopt a documented, deterministic naming scheme that respects PostgreSQL's 63-byte identifier limit. Prefer a short table/relationship token plus a stable hash suffix when a readable full name exceeds the limit. Include a collision check over the complete constraint and index catalogue. Do not rely on PostgreSQL silently truncating two distinct proposed names to the same identifier.

### FKI-07 — FK actions are global defaults, not yet a completed per-relationship contract

**Severity:** Medium  
**Status:** OPEN

The canonical FK register now records RESTRICT/RESTRICT for every relationship listed in each of the 54 FK-bearing table rows, and the expanded relationship inventory records the action convention for each of its 44 named constraints. The 11 tables with no parent FK are explicitly marked. This is a consistent proposed baseline; it has not been validated against a live database.

**Required correction:** Before DDL, generate and review the final per-constraint SQL action declaration from this inventory. Any deviation from RESTRICT/RESTRICT must include the business reason, history impact, and corresponding test. No CASCADE should be introduced implicitly.

## 3. Index review: confirmed outcomes

| Item | Outcome | Action |
|---|---|---|
| `role_permissions(role_id, permission_id)` | Covers `role_id` by left prefix, not `permission_id` | Correct FK coverage statement; retain permission_id index |
| `retention_holds(retention_subject_id, status)` plus standalone subject index | Wider index already begins with FK column | Remove standalone proposal unless separately justified |
| `retention_actions(retention_subject_id, executed_at)` plus standalone subject index | Wider index already begins with FK column | Remove standalone proposal unless separately justified |
| `financial_transactions` account/date index vs account/currency FK | Not a complete leading FK tuple | Retain composite FK support proposal |
| `payments` transaction/time index vs transaction/currency FK | Not a complete leading FK tuple | Retain composite FK support proposal |
| `budget_lines` budget/order index vs budget/currency FK | Not a complete leading FK tuple | Retain composite FK support proposal |
| `attendance_records` mandatory subject tuple plus direct event/member FKs | Direct FKs appear redundant | Resolve FKI-05 before final DDL |

This is a structural review only. It does not establish that any index is performant or necessary under production workload.

## 4. Acceptance checklist for the next register revision

- [x] Every one of the 65 tables has an explicit FK inventory row, including tables with zero FKs.
- [x] Every FK is represented as a distinct relationship with a stable constraint name in the 155-row relationship register.
- [x] Every composite FK has exact, ordered source and target tuples.
- [x] Every target tuple has identified PK or UNIQUE evidence with the same ordered columns, pending independent verification.
- [x] Every nullable composite FK has explicit nullability and MATCH semantics; optional attendance references use MATCH SIMPLE.
- [x] Every FK has a per-relationship ON DELETE and ON UPDATE action.
- [x] Every FK has a named supporting index or documented left-prefix coverage in the 155-row relationship register, pending independent verification.
- [ ] No standalone index duplicates a wider suitable index without a workload justification.
- [x] Proposed FK constraint names and index names are unique and within PostgreSQL's 63-byte identifier limit.
- [x] Attendance composite integrity is not duplicated by unexplained standalone relationships.
- [ ] The FK inventory, column inventory, relational matrix and physical-design source reconcile table-by-table.

## 5. Implementation boundary

This audit authorizes no implementation. No Prisma schema, SQL DDL, migration, database object, generated client, seed or application code has been changed. The physical design remains unapproved for implementation. DFR-001 through DFR-006 and the approved conceptual ERD remain preserved. Open owner decisions remain open.


## 6. Canonical-document remediation status

The following changes have now been applied to the canonical FK register, physical database design and relational integrity matrix on the review branch. Stable names were added for the 44 expanded relationships affected by the earlier malformed rows.

| Finding | Document remediation | Current disposition |
|---|---|---|
| FKI-01 | Added the 155-row one-relationship-per-entry register with source/target tuples, target-key evidence, nullability, MATCH semantics, actions and support indexes. Preserved 65-table coverage and 11 zero-FK tables. | RESOLVED AT DOCUMENT LEVEL; independent review pending |
| FKI-02 | Corrected the role_permissions index statement. The unique (role_id, permission_id) key supports role_id by left prefix only; a separate permission_id index is now in the FK register and named index catalogue. | Addressed in documentation; independent review pending |
| FKI-03 | Removed the standalone retention_subject_id index proposals. The wider subject/status and subject/executed_at indexes already cover those FK columns by left prefix. | Addressed in documentation; independent review pending |
| FKI-04 | Kept full ordered tuple support indexes for composite department-scope, finance, payment, budget-line, reversal, attendance and report-definition relationships. Workload indexes are explicitly distinguished from complete composite-FK support. | Addressed at proposal level; SQL/index validation pending |
| FKI-05 | Removed standalone event_id → events and member_id → members FKs from attendance_records. The mandatory subject composite FK remains the authoritative event/member binding; the columns remain present in that tuple. | Addressed in documentation; independent review pending |
| FKI-06 | Replaced shortened ordinal-suffix index names with readable canonical names. A structural check reports 121 unique FK-register index names, none over 63 bytes, and no ordinal-suffix/double-underscore workarounds. | Addressed in documentation; independent review pending |
| FKI-07 | Added ON DELETE RESTRICT and ON UPDATE RESTRICT to each of the 155 relationship rows. Tables with no parent FK remain explicitly distinguished. | RESOLVED AT DOCUMENT LEVEL; SQL validation pending |

### Verification boundary

The document checks confirm that:
- the canonical FK register contains 65 table rows;
- each of the 54 FK-bearing table rows records the proposed RESTRICT/RESTRICT action for its listed relationships;
- the remaining 11 rows have no parent FK;
- the current FK-register index-name list contains 121 unique names, all within the PostgreSQL identifier limit;
- 155 stable FK constraint names are recorded, with no duplicate or overlength names;
- the attendance subject relationship is consistent across the physical design, FK register and integrity matrix.

These are source-document checks only. No PostgreSQL parser, database catalogue, query plan, migration, Prisma schema or application test was run. The physical design remains unapproved for implementation.


## 7. Remaining independent-review gates

The document-level corrections and dispositions are recorded for all seven findings, but this audit is not an independent acceptance review. FKI-04 is now verified at document level. The next review must verify:
1. Every named FK target tuple is backed by an exact PK/UNIQUE candidate key with matching order.
2. Independently verify all 155 named constraints against the physical table definitions and relational matrix.
3. Verify the exact ordered target candidate keys and source index definitions before implementation.
4. The 211 distinct names in the canonical combined inventory reconcile the named unique, partial-unique, FK-supporting and workload index proposals from both source catalogues.
5. Every composite FK has full ordered tuple support, including the departments church/district relationship.
6. PostgreSQL target version, extension availability, partial-index semantics and MATCH SIMPLE composite FK behavior are verified.
7. No SQL compilation, live catalogue or query-plan result is claimed until those checks are actually run in an authorized environment.

The physical design remains **further revision required** until the independent review is completed and the owner approves the full physical design.


## 8. Current disposition after independent review

The [Post-FKI Independent Review](./PHASE-2-POST-FKI-INDEPENDENT-REVIEW.md) supersedes the preliminary remediation labels in Section 6 for acceptance purposes.

Current status:
- FKI-01: RESOLVED AT DOCUMENT LEVEL, pending independent re-review.
- FKI-02: RESOLVED AT DOCUMENT LEVEL.
- FKI-03: RESOLVED AT DOCUMENT LEVEL.
- FKI-04: RESOLVED AT DOCUMENT LEVEL, pending SQL/index validation.
- FKI-05: RESOLVED AT DOCUMENT LEVEL; optional attendance composite FKs now specify MATCH SIMPLE and negative/positive integrity tests.
- FKI-06: RESOLVED AT DOCUMENT LEVEL; the canonical combined inventory reconciles 211 distinct names.
- FKI-07: RESOLVED AT DOCUMENT LEVEL; all 155 FK relationships have explicit RESTRICT/RESTRICT actions.

Do not treat the original finding headings or preliminary remediation labels as current status. The [Post-FKI Independent Review](./PHASE-2-POST-FKI-INDEPENDENT-REVIEW.md) controls the current PIR disposition: PIR-01 through PIR-04 are verified at document level, PIR-05 remains partially resolved, PIR-06 is verified at document level, and PIR-07 remains partially resolved.
