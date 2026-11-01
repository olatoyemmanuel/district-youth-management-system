# DYMS Phase 2: FK Constraint and Index Redundancy Audit

**Status:** Technical review findings; remediation required  
**Scope:** DYMS v1.0, Sango District; 65 proposed physical tables  
**Branch:** `phase-1/requirements-consolidation`  
**Inputs:** Physical Database Design, Foreign-Key and Column Register, Relational Integrity Matrix, Medium-Severity Relational Integrity Remediation  
**Implementation:** NOT AUTHORIZED

## 1. Purpose and boundary

This audit checks whether the proposed foreign-key register identifies complete, ordered relationships and whether the proposed FK-support indexes are consistent with the broader access/unique-index catalogue.

This is a document-level review. It does not run SQL, inspect a live PostgreSQL catalogue, benchmark queries, or create database objects. An index described in a design document is a proposal, not proof that the index exists.

## 2. Findings requiring correction

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

The register proposes RESTRICT/RESTRICT globally. This is a sensible preservation baseline, but the current relationship rows do not provide a fully expanded per-FK declaration for all 65 tables. The project therefore cannot yet prove that every relationship has been reviewed for its exact action and optionality.

**Required correction:** Once FKI-01 is addressed, record ON DELETE and ON UPDATE per FK. Any deviation from RESTRICT/RESTRICT must include the business reason, history impact, and corresponding test. No CASCADE should be introduced implicitly.

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

- [ ] Every one of the 65 tables has an explicit FK inventory row, including tables with zero FKs.
- [ ] Every FK is represented as a distinct relationship with a stable constraint name.
- [ ] Every composite FK has exact, ordered source and target tuples.
- [ ] Every target tuple is backed by a PK or UNIQUE constraint with the same ordered columns.
- [ ] Every nullable composite FK has a documented all-null/all-present rule; partial tuples are rejected.
- [ ] Every FK has a per-relationship delete/update action.
- [ ] Every FK has either a complete left-prefix support index or a documented exception.
- [ ] No standalone index duplicates a wider suitable index without a workload justification.
- [ ] No two constraint/index names collide after PostgreSQL identifier-length handling.
- [ ] Attendance composite integrity is not duplicated by unexplained standalone relationships.
- [ ] The FK inventory, column inventory, relational matrix and physical-design source reconcile table-by-table.

## 5. Implementation boundary

This audit authorizes no implementation. No Prisma schema, SQL DDL, migration, database object, generated client, seed or application code has been changed. The physical design remains unapproved for implementation. DFR-001 through DFR-006 and the approved conceptual ERD remain preserved. Open owner decisions remain open.
