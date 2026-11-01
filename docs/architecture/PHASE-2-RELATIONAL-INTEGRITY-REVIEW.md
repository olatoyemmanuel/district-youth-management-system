# DYMS Phase 2 Relational Integrity Review

**Status:** Initial independent design review  
**Scope:** `PHASE-2-RELATIONAL-INTEGRITY-MATRIX.md` and current physical-design proposal  
**Implementation status:** NOT AUTHORIZED

## 1. Executive assessment

The new matrix reconciles the actual physical table inventory to **65 distinct tables**. It makes the key relationships, candidate constraints, cross-scope rules, concurrency controls, and explicit blockers visible in one place.

The review finds that the matrix is useful as a relational-integrity control document, but it is **not yet sufficient for physical-design approval**. Several source definitions do not contain enough column detail to specify executable constraints without assumptions. Those gaps are recorded as blockers rather than filled with invented schema.

## 2. Findings

| ID | Severity | Finding | Required resolution |
|---|---|---|---|
| RIM-01 | High | The physical catalogue has 65 tables, not 58. Grouped headings hid seven additional table definitions. | Maintain one canonical inventory and validate every table exactly once. |
| RIM-02 | High | Several tables do not have complete column inventories: budgets, budget_lines, report_definitions, report_runs, report_export_audits. | Complete their columns, ownership, actors, keys, nullability, indexes, and lifecycle before approval. |
| RIM-03 | High | Scope integrity is described as a pattern, but a complete table/column composite-FK map is not yet fully specified. | Produce a per-FK source/target column map and delete/update action for every scoped table. |
| RIM-04 | High | Appointment scope, position scope, and department/church ownership need a final exact relational mapping. | Define allowed scope combinations and composite FKs for position, appointment, and organizational parents. |
| RIM-05 | High | Attendance mode requires a trigger or normalized subtype implementation to enforce parent mode and child shape under concurrency. | Choose one design and specify trigger timing, lock order, SQLSTATE/error contract, and race tests after PostgreSQL version confirmation. |
| RIM-06 | High | Finance reversal integrity is not fully specified for same account/currency and cumulative partial reversal. | Complete composite relationships and obtain accounting-policy decisions before final constraints. |
| RIM-07 | High | Retention subject mapping needs complete target-specific FK coverage. | List every retained source table and its exact subject FK or link table; verify one-to-one mapping and hold/disposal lock. |
| RIM-08 | High | Audit actor-type constraints and append-only behavior require exact CHECK expressions, FK shape, and database privilege proof. | Specify all valid actor identity combinations and test runtime roles cannot update/delete audit rows. |
| RIM-09 | Medium | Idempotency uniqueness depends on PostgreSQL null semantics and the exact normalized scope identity. | Confirm PostgreSQL version and choose either NULLS NOT DISTINCT or mutually exclusive partial unique indexes. |
| RIM-10 | Medium | Several uniqueness predicates depend on proposed lifecycle states, including current memberships, pending transfers, active registrations, and active preferences. | Approve state values and transition predicates before translating them into partial indexes or CHECK constraints. |
| RIM-11 | Medium | Index requirements are categories rather than a fully named index catalogue with column order and workload rationale. | Produce a named index register after column inventories and expected query patterns are stable. |
| RIM-12 | Medium | Nullability/default rules are global conventions, not a verified column-by-column matrix for all 65 tables. | Add a complete column-level worksheet including default, nullability, FK actions, and status source for every column. |
| RIM-13 | Medium | Several actor/decision relationships require independent-actor rules beyond ordinary FKs. | Specify and test self-approval/self-review prevention for financial, credential, deny, role-conflict, and retention workflows. |
| RIM-14 | Medium | PostgreSQL version, extension policy, collation, UUID strategy, and trigger capabilities are not confirmed. | Obtain deployment target and compatibility evidence before selecting implementation-specific constructs. |

## 3. Validation performed

- Counted physical table definition headings and expanded grouped headings.
- Confirmed 65 distinct table names when the three Section 18 additions are included.
- Compared the 52-row lifecycle catalogue conceptually as a state-bearing subset, not a complete table inventory.
- Preserved policy-blocked lifecycle states and did not promote proposed values into approved CHECK constraints.
- Preserved the individual-account-per-member rule and excluded guardian/delegation entities.
- Retained the no-Prisma/no-migration/no-SQL/no-database-change boundary.

This is a document consistency review. No PostgreSQL DDL was compiled or executed. No database concurrency tests were run.

## 4. Disposition

**Result: Further revision required.** The relational-integrity matrix is ready for owner/technical review as a working artifact. The physical design remains unapproved for implementation until all High findings and the relevant Medium findings are closed, the PostgreSQL target is confirmed, and the project owner explicitly approves the complete physical design.

DFR-001 through DFR-006 remain preserved. The repository's conflicting DFR-006 status statements remain unresolved and must not be silently altered.


## 5. Follow-up: proposed remediation recorded

A dedicated [High-Severity Relational Integrity Remediation](./PHASE-2-HIGH-SEVERITY-RELATIONAL-INTEGRITY-REMEDIATION.md) has been added.

| Finding | Follow-up result | Remaining acceptance condition |
|---|---|---|
| RIM-01 | Addressed: canonical inventory reconciles to 65 distinct tables. | Keep inventory synchronized with future table changes. |
| RIM-02 | Proposed definitions supplied for budgets, budget lines, report definitions, report runs, and report export audits. | Reconcile every column into canonical matrix; confirm budget/report policy and scope. |
| RIM-03 | Explicit FK/scope-binding approach and scope inventory supplied. | Produce final source-column/target-column FK map and delete/update actions for all scope-bearing columns. |
| RIM-04 | Proposed normalization makes position own scope and appointment inherit through position. | Reconcile position columns, confirm department ownership policy, specify exact named constraints and overlap enforcement. |
| RIM-05 | Attendance subject parent, composite relationships, mode checks, lock order, and concurrency acceptance test specified. | Choose deferred trigger or normalized child design; confirm PostgreSQL support and specify executable trigger behavior. |
| RIM-06 | Full reversal model binds original and reversal transactions to same account and currency; partial reversal remains disabled. | Finance authority must confirm full-reversal-only MVP and transaction type/accounting semantics. |
| RIM-07 | Retention subject source-link and shared-lock model specified. | Complete record-class enrollment inventory and verify exactly-one-source enforcement strategy. |
| RIM-08 | Actor identity truth table and append-only runtime privilege model specified. | Reconcile service principal FK and exact CHECK/privilege grants; confirm audit access authority. |

The follow-up closes the documentation gap by recording concrete proposals. It does not close the findings as implementation-ready constraints.

## 6. Current review disposition

**Result: Proposed remediation documented; canonical reconciliation and independent verification still required.** The next review must compare the remediation addendum against the full 65-table matrix, eliminate duplicate/conflicting definitions, produce the exact FK and index registers, and confirm PostgreSQL compatibility. RIM-09 through RIM-14 remain open.

No PostgreSQL DDL was compiled or executed. No database concurrency tests were run. No Prisma schema, migration, SQL DDL, database object, generated client, or application code was created or changed.


## 7. Medium-severity follow-up

A [Medium-Severity Relational Integrity Remediation](./PHASE-2-MEDIUM-SEVERITY-RELATIONAL-INTEGRITY-REMEDIATION.md) has been added.

| Finding | Follow-up result | Remaining acceptance condition |
|---|---|---|
| RIM-09 | Proposed four-way partial unique index strategy avoids nullable-scope uniqueness ambiguity and does not require PostgreSQL 15. | Approve scope_kind values and reconcile named indexes. |
| RIM-10 | Explicitly blocks partial unique predicates that rely on unapproved lifecycle strings. | Approve table-specific state transitions and predicates. |
| RIM-11 | Named unique and access index register supplied. | Reconcile every index to final columns and validate workload/non-redundancy. |
| RIM-12 | Global nullability and RESTRICT FK action policy supplied. | Complete exact per-column type/nullability/default/FK-action matrix for all 65 tables. |
| RIM-13 | Financial submitter/approver and role-conflict reviewer separation rules specified. | Confirm whether credential, retention, and appointment workflows require additional actor inequality rules. |
| RIM-14 | Portable baseline and compatibility-sensitive PostgreSQL features identified. | Confirm production PostgreSQL version, extension and managed-role support. |

## 8. Current review disposition

**Result: Further canonical reconciliation and independent review required.** RIM-09 has a concrete portable uniqueness proposal. RIM-10 remains policy-blocked where lifecycle semantics are not approved. RIM-11 is a proposed named index register. RIM-12 remains open because column-level coverage is incomplete. RIM-13 is partially resolved. RIM-14 remains environment-blocked.

No PostgreSQL DDL was compiled or executed. No database tests were run. No Prisma schema, migration, database object, generated client, seed, or application code was created or changed.