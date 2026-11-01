# DYMS Phase 2 Foreign-Key and Column Register Review

**Review type:** Structural/document-level validation  
**Scope:** 65-table FK register and explicit column declaration inventory  
**Branch:** `phase-1/requirements-consolidation`  
**Implementation status:** NOT AUTHORIZED

## 1. Result

**Review outcome: Further revision required.**

The new register now has:
- 65 FK inventory rows for 65 distinct table names.
- 65 explicit column-declaration inventory rows for 65 distinct table names.
- A proposed global `ON DELETE RESTRICT` / `ON UPDATE RESTRICT` baseline.
- Composite scope and cross-domain integrity contracts.
- A field-by-field list of typed declarations currently present in the canonical physical-design document.

The inventory is a transcription of current source definitions. It does not prove every table is complete, nor that PostgreSQL accepts the proposed composite constraints.

## 2. Structural validation

The reviewer re-fetched the current branch files and checked:
1. The FK register contains exactly 65 rows and 65 unique table names.
2. The column declaration inventory contains exactly 65 rows and 65 unique table names.
3. The two inventories contain the same table names; no missing or duplicate table row was found.
4. The global FK action baseline explicitly states RESTRICT for delete and update.
5. The canonical matrix rows for positions, appointments, budgets, budget lines, financial transactions, reversals, and report entities reflect the newer physical definitions.
6. The implementation boundary remains explicit.

The source inventory parser found 9 column declarations with type and nullability not specified, and 11 declarations with nullability not specified. These counts are diagnostics against the current transcription, not a claim that only those many gaps exist. Prose-only scope fields, grouped actor fields, and absent operational columns remain additional gaps.

## 3. Findings

| ID | Severity | Finding | Disposition |
|---|---|---|---|
| FKC-01 | High | All 65 tables appear in both registers, with no duplicate or missing table names. | Addressed at inventory level |
| FKC-02 | High | Several FK declarations are grouped or inferred from scope prose rather than individually typed in the physical table section. | Open |
| FKC-03 | High | FK support-index names are partly a naming convention and partly existing unique keys; they have not been reconciled against actual query workload or redundant indexes. | Open |
| FKC-04 | High | A typed field inventory exists for all 65 tables, but some columns have unspecified nullability and some have unspecified type/nullability. | Open |
| FKC-05 | High | The retention subject anchor still lacks an approved list of retained source tables and corresponding source-specific one-to-one FKs. | Open |
| FKC-06 | Medium | Global RESTRICT/RESTRICT is a reasonable preservation baseline but requires table-specific review for every FK before DDL. | Proposed |
| FKC-07 | Medium | Some physical table fields remain described as shorthand timestamps, scope columns, or grouped definitions. | Open |
| FKC-08 | Medium | Production PostgreSQL version, extension availability, collation, UUID generation, and managed database privileges remain unknown. | Environment blocker |

## 4. Required next revision

1. Expand all grouped FK declarations into individual typed columns with explicit nullability.
2. Reconcile each supporting index to the exact FK source-column order and final index catalogue.
3. Complete every field's type, nullability, and default, including timestamps and scope fields.
4. Confirm whether any FK needs a documented exception to RESTRICT/RESTRICT.
5. Obtain the approved retention record-class inventory, then map each selected source record to exactly one retention subject using a real FK or typed link.
6. Confirm finance and organizational policy gaps without inventing thresholds or ownership rules.
7. Confirm the production PostgreSQL target and managed-service capabilities.
8. Run a final independent review after the above design corrections.

## 5. Implementation boundary

No SQL DDL, Prisma schema, migration, database object, seed, generated client, or application code has been created or changed. No database tests were run. DFR-001 through DFR-006 remain preserved. Physical design is not approved, and PR #53 must remain draft and unmerged.

**Final assessment:** The FK and column inventories now cover all 65 table names structurally. They are not yet complete enough to authorize physical database implementation.


## 6. Follow-up reconciliation: scope, actors, timestamps, retention

The next design pass expanded the previously prose-only scope columns for user-role assignments, access denies, events, audit events, audit-access events, and idempotency records. It also normalized the four timestamp shorthand groups and named 21 support-index proposals for the newly explicit scope/retention FKs.

The canonical retention relationships are now:
- `retention_holds.retention_subject_id NOT NULL → retention_subjects(id)`
- `retention_actions.retention_subject_id NOT NULL → retention_subjects(id)`

The misleading generic `target_binding_id` proposal has been replaced by the exact retention-subject FK. The `retention_subjects` table itself does not contain a self-reference. Source-record enrollment remains open until the approved retention record-class inventory is known.

### Updated finding disposition

| ID | Severity | Finding | Updated status |
|---|---|---|---|
| FKC-02 | High | Grouped scope columns in the named leadership, event, audit and idempotency tables | Partially addressed; individual declarations now listed. Composite hierarchy and lifecycle checks remain open. |
| FKC-03 | High | Support-index reconciliation | Partially addressed; 21 named indexes added for expanded scope/retention FKs. Full 65-table redundancy/workload review remains open. |
| FKC-04 | High | Column type/nullability/default completeness | Partially addressed; timestamp shorthand and grouped scope columns expanded. Remaining source gaps and default authority remain open. |
| FKC-05 | High | Retention subject source enrollment | Partially addressed; hold/action FK is exact. Enrolled source-table inventory and source-side one-to-one FKs remain open. |
| FKC-06 | Medium | FK action baseline | Proposed RESTRICT/RESTRICT remains subject to table-by-table exception review. |

**Current outcome remains: further revision required.** No SQL compilation, database test, or PostgreSQL compatibility test has been performed.


## 7. FK source-index coverage audit

A document-level structural audit compared every FK source-column group in the canonical FK register with the proposed unique/access index catalogue and the new named support-index proposals.

Results:
- 90 proposed indexes in the existing medium-severity catalogue.
- 21 named indexes for expanded scope and retention FKs.
- 79 additional FK support-index proposals.
- 190 total proposed index names, all unique.
- 56 table rows in the FK register contain one or more FK source groups; the remaining nine tables have no parent FK.
- The cross-reference audit found zero FK source-column groups without a matching left-prefix index proposal.

This is a structural coverage check only. It does not prove that all indexes are necessary, optimal, non-redundant under every composite key, or performant against real workloads. Some partial predicates remain blocked until lifecycle states are approved. No PostgreSQL index was created and no query plan was run.

**Updated result:** FK source-index coverage is addressed at proposal level. Final index redundancy/workload review remains open. Overall physical-design outcome remains further revision required.

## 8. Owner decision dependencies

The open policy and environment dependencies are consolidated in the [Phase 2 Owner Decision Register](../decisions/PHASE-2-OWNER-DECISION-REGISTER.md). In particular, retention source enrollment, lifecycle predicates, finance rules, scope exceptions and PostgreSQL capabilities remain decision-gated.
