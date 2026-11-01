# DYMS Phase 2 Relational Integrity Second Review

**Review type:** Independent document-level follow-up review  
**Scope:** Canonical physical design, 65-table relational matrix, high- and medium-severity remediation addenda  
**Branch:** `phase-1/requirements-consolidation`  
**Implementation status:** NOT AUTHORIZED

## 1. Executive assessment

The canonical physical design has been materially improved. The table inventory reconciles to 65 distinct table rows, and the previously abbreviated budget and reporting entities now have proposed column definitions. Position scope is normalized into positions; attendance records reference an attendance-subject anchor; reversal relationships specify shared account/currency binding; audit events identify service principals; and a named index register and portable idempotency uniqueness strategy have been proposed.

**Review result: Further revision required.**

The documents are not yet a complete physical specification. In particular:
- retention-subject coverage is not mapped to a definitive list of source tables and source FKs;
- the exact source/target column and FK-action register is not complete for all 65 tables;
- the per-column nullability/default register remains incomplete;
- attendance trigger/subtype enforcement is described but not selected and proven;
- production PostgreSQL compatibility is unknown;
- lifecycle-dependent uniqueness predicates remain blocked by unapproved states;
- some separation-of-duties rules require authority confirmation.

This review did not execute SQL, connect to a database, or run concurrency tests. It verifies document structure and consistency only.

## 2. Validation performed

1. Fetched the current physical-design document, relational-integrity matrix, high-severity remediation, and medium-severity remediation from the working branch.
2. Counted the table rows in the relational-integrity matrix: 65 rows and 65 unique table names.
3. Confirmed the canonical physical design includes:
   - position-owned organizational scope and appointment scope inheritance;
   - `attendance_subject_id` on attendance records;
   - composite reversal binding to account and currency;
   - complete proposed budget and budget-line fields;
   - report definition version binding in report runs;
   - service-principal identity on audit events.
4. Confirmed the high-severity addendum preserves the retention enrollment inventory as an unresolved requirement rather than asserting unverified coverage.
5. Confirmed the medium-severity addendum includes a four-way scope-specific idempotency uniqueness strategy, named index catalogue, FK action policy, nullability rules, and PostgreSQL compatibility list.
6. Confirmed the implementation boundary remains explicit.

## 3. Finding-by-finding disposition

| Finding | Severity | Second-review assessment | Status |
|---|---|---|---|
| RIM-01 | High | 65 distinct matrix rows; no duplicate table names found. | Addressed at document inventory level |
| RIM-02 | High | Budget, budget-line, report-definition, report-run, and export-audit definitions are now expanded in the canonical physical document. | Proposed definition complete; policy and FK details remain |
| RIM-03 | High | Scope inventory exists, but exact FK source/target columns, composite hierarchy keys, ON DELETE/ON UPDATE and supporting indexes are not enumerated for every scope-bearing table. | Open |
| RIM-04 | High | Position scope ownership removes duplicated appointment scope. However, position scope FK binding, hierarchy proofs, and overlap enforcement are not yet fully reconciled into named constraints and verified against all dependent tables. | Partially addressed |
| RIM-05 | High | Attendance subject anchor and lock-before-validation concurrency contract are described. A single final enforcement mechanism is not selected, and no trigger/transaction race test has been run. | Open pending final design and proof |
| RIM-06 | High | Original and reversal transactions are now specified to share account and currency, with a full-reversal-only model and serialized creation. Canonical transaction candidate key has been aligned to include id, account and currency. | Proposed integrity model addressed; finance authority confirmation remains |
| RIM-07 | High | Retention subject model is described, but the exact enrolled source-table list and source-specific FK on each retained table are absent. Exactly-one-source enforcement remains a proposed deferred validation pattern. | Open |
| RIM-08 | High | Actor truth table, service-principal FK, and append-only runtime privilege model are specified. Exact named constraints and privilege verification remain unexecuted. | Proposed design addressed; proof remains |
| RIM-09 | Medium | Four partial unique indexes partition global/district/church/department idempotency scope and avoid nullable-scope ambiguity. | Proposed resolution accepted for next reconciliation |
| RIM-10 | Medium | Status-dependent predicates are explicitly blocked where lifecycle decisions are not approved. | Open, correctly policy-blocked |
| RIM-11 | Medium | Named unique and access index register supplied. It still needs column-by-column reconciliation and redundant-index review. | Partially addressed |
| RIM-12 | Medium | Global nullability and FK-action policy supplied, but not a complete field-by-field register for all 65 tables. | Open |
| RIM-13 | Medium | Financial submitter/approver separation and independent role-conflict review are specified. Additional inequality rules for credentials, retention, and appointments remain authority-dependent. | Partially addressed |
| RIM-14 | Medium | Portable baseline and compatibility-sensitive constructs identified. Production major version and managed-service capabilities remain unknown. | Open |

## 4. Additional consistency issues to resolve

### 4.1 Scope binding and hierarchy

The position-scope normalization is the preferred model, but the final catalogue must show exact FK names and target keys for district, church, and department scope. For a church-scoped position, the church's district must be unambiguously inherited or bound. For a department-scoped position, the department's district and optional church relationship must be proven without permitting contradictory duplicate scope.

### 4.2 Attendance registration relationship

The attendance model retains nullable registration_id because the registration prerequisite is unresolved. The canonical physical design now proposes UNIQUE (id, event_id, member_id) on event_registrations and a composite FK from attendance_records (registration_id, event_id, member_id). This closes the cross-event/member reference gap at proposal level. The constraint still requires DDL compilation and negative tests after implementation is authorized.

### 4.3 Financial payment currency

The canonical design binds a payment's transaction and currency, but the final payment-to-transaction FK should use the transaction candidate key (id, currency_code). The transaction amount/payment amount equality, partial payment, multiple attempts, refund, and chargeback rules remain finance policy decisions.

### 4.4 Retention subject source mapping

A shared retention-subject anchor only provides enforceable source integrity if each enrolled source table has a real FK to it and the reverse exactly-one-source rule is enforced. The project must first decide which record classes are retained under DYMS schedules. Do not add retention_subject_id indiscriminately to every technical table. Do not claim the model is complete until the source-table inventory and each source FK are listed.

### 4.5 Report definition immutability

The report run now binds report_definition_id plus report_definition_version. Confirm that report_definitions exposes the exact candidate unique key (id, version), that definition versions cannot be edited after use, and that export audit rows preserve the exact run and actor.

### 4.6 Named indexes

The index register is a useful working inventory, but some proposed indexes reference fields whose exact physical definitions are not yet fully expanded. The next revision must verify every column exists, identify partial-index predicates as approved or blocked, and remove indexes already covered by a suitable left-prefix unique index.

## 5. Required next revision

1. Produce a complete 65-table FK register: source table/columns, target table/columns, nullability, ON DELETE, ON UPDATE, supporting index, and requirement/decision reference.
2. Complete the column inventory for every table, then produce exact type, nullability, default, FK and index matrix.
3. Verify the attendance registration composite relationship through future DDL compilation and negative tests.
4. Finalize one attendance mode-enforcement design and specify trigger timing, parent lock, lock order, stable error mapping, and executable concurrency tests.
5. Complete the retention enrollment inventory with named source tables and source-specific FKs, but only for record classes approved for retention scheduling.
6. Reconcile every named index against the final table columns and identify lifecycle-blocked predicates separately.
7. Confirm finance authority decisions for full reversal, payment amount/currency relationships, and budget scope/approval.
8. Obtain the production PostgreSQL version and managed database capability constraints.
9. Obtain independent owner/authority decisions for the remaining policy blockers.
10. Conduct a further independent review before presenting the physical design for approval.

## 6. Implementation and governance boundary

- Physical database design remains unapproved.
- No SQL DDL, Prisma schema, migration, seed, generated client, database object, or application code is authorized.
- No database was modified and no database tests were run.
- DFR-001 through DFR-006 remain preserved.
- The repository's conflicting DFR-006 status statements remain unresolved and must not be silently changed.
- PR #53 must remain draft and unmerged unless the project owner explicitly instructs otherwise.

**Final assessment:** The remediation has moved the design forward, but it is not ready for physical-design approval. Complete the FK and column-level matrices, resolve or explicitly retain policy blockers, then perform the next independent review.


## 7. Foreign-key register follow-up

A dedicated [65-Table Foreign-Key and Column Register](./PHASE-2-FOREIGN-KEY-AND-COLUMN-REGISTER.md) has been added and linked from the canonical physical design, integrity matrix, and approval package.

The register contains one FK inventory row for each of the 65 table names. It records source columns, target columns, proposed nullability, a uniform proposed RESTRICT/RESTRICT action policy, and supporting-index requirements. The integrity matrix summary rows for positions, appointments, budgets, budget lines, financial transactions, reversals, and reporting have been reconciled to the newer canonical definitions.

### Follow-up findings

| ID | Severity | Finding | Status |
|---|---|---|---|
| RIM2-01 | High | The FK register now has 65 table rows, but some scope and actor references are still grouped, and some support-index names are expressed as a naming rule rather than individually verified physical indexes. | Partially addressed |
| RIM2-02 | High | The column register documents known incomplete groups but does not yet provide a fully expanded field-by-field type/nullability/default listing for all 65 tables. | Open |
| RIM2-03 | High | Retention subject source enrollment is intentionally not asserted complete. No definitive approved source-table inventory and one-to-one FK mapping exists yet. | Open |
| RIM2-04 | Medium | Several source definitions retain shorthand timestamps, scope columns, and grouped role-conflict table declarations. | Open |
| RIM2-05 | Medium | Proposed ON DELETE/ON UPDATE RESTRICT policy is consistent with history preservation, but each final FK must be reviewed for exceptional lifecycle cases before DDL. | Proposed baseline |

### Current result

The register is a meaningful structural improvement, but it is not yet a complete column-level physical specification. It must not be used to generate migrations. Further work is required before approval.
