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
