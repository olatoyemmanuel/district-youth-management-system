# DYMS CPERD-06 — Structural CHECK and Trigger/Transaction Integrity Reconciliation

- Deliverable: CPERD-06
- Source revision: PITR-01
- Integrity register Git blob SHA: 1f32158086c65751089464a46b975cd8c5964756
- Canonical column register SHA: 282419018c64967ff577ffcd806aefd4f8766187
- Canonical FK register SHA: 116e61cfe06d43badf543cc7bbb32bbc32fa1ae0
- Canonical index inventory SHA: 84b3a5de0afd8176e39f27bd20f9563abe75d43f
- Status: STATIC RECONCILIATION COMPLETE; CORRECTIONS AND OWNER REVIEW REQUIRED
- Implementation: NOT AUTHORIZED

## 1. Scope and method

This review compares the Phase 3 physical integrity register with the canonical column, FK and index registers. It is a static documentation review only. No SQL, PostgreSQL DDL, migrations, triggers, functions or application code were executed or created.

## 2. Structural CHECK inventory verification

- 54 named CHECK candidates are enumerated in PITR-01.
- All 54 names are unique.
- All 54 names are referenced in the canonical column register.
- No named CHECK reference is missing from the column register.
- The review identified one candidate incorrectly classified as a row-local CHECK: `ck_credential_definition_versions_validity`.

### Required correction: credential-definition validity policy

The proposed invariant says that `validity_duration` exists only when the approved credential definition requires it. This requires reading the related `credential_definitions` row. PostgreSQL CHECK constraints are row-local and cannot safely enforce cross-row lookups.

Disposition:
- Remove `ck_credential_definition_versions_validity` from the structural CHECK catalogue.
- Reclassify the invariant as a transaction/application policy that validates the credential definition's approved validity policy before a version is approved or activated.
- Preserve the rule's business meaning.
- Do not replace it with a trigger unless a separately reviewed locking, update-propagation and concurrency contract is approved.
- Update the column register's participation notes accordingly.

Result: 53 row-local structural CHECK candidates remain; one cross-row policy invariant is reclassified. The candidate count change requires reconciliation of the consolidated ERD and approval manifest before a new physical-design revision is presented for owner approval.

## 3. Other CHECK observations

1. `ck_currencies_minor_unit_range` hard-codes a 0–4 range while the currency catalogue authority remains open. Keep this constraint authority-gated; do not treat the range as approved policy or implement it until the currency authority confirms it.
2. `ck_event_attendance_subjects_mode` uses EVENT/SESSION values while delegated attendance authority remains pending. Preserve the owner-approved default but retain the delegated-authority gate.
3. Credential validity interval ordering on issuance rows is row-local. The definition-policy lookup is not.
4. The DDD-013 identity-mode, digest-length, fencing, status and terminal-metadata checks are structurally row-local as described. Their complete correctness still depends on the separate transaction, FK, unique-index and application contracts.
5. Lifecycle CHECKs intentionally withheld by PITR-01 remain withheld. No blocked lifecycle predicate is introduced by this review.

## 4. Column and reference reconciliation

- 54 distinct CHECK names were found in the integrity register.
- All 54 are cross-referenced in the column register.
- The nine tables with an `updated_at` column are:
  - `user_accounts`
  - `members`
  - `church_memberships`
  - `events`
  - `budgets`
  - `budget_lines`
  - `service_principals`
  - `idempotency_records`
  - `pre_auth_contexts`

The trigger register currently describes a generic `trg_<table>_set_updated_at` trigger and defers the exact table list. The exact nine-table list above should be incorporated into the integrity register and subsequently into the DDL design specification. This does not authorize trigger implementation.

## 5. Trigger and transaction contract review

The register distinguishes row-local CHECKs from cross-row triggers, serialized transactions, application authorization and operational privilege boundaries. The following contracts require additional precision before coding:

1. Appointment overlap: define the exact approved-state predicate and ensure the parent-position lock, interval query, immutable position scope and update path are all covered.
2. Attendance subject mode: define serialization around the subject row and prove that both mode transitions and attendance inserts share the same lock protocol.
3. Event capacity: lifecycle values that consume capacity remain unresolved. Do not implement reserved_count transitions until ODR-008 authority confirms the registration states and transition matrix.
4. Retention hold guard: require the hold and disposal paths to acquire the same subject lock and recheck schedule, approval and hold status in one transaction.
5. updated_at: enumerate the nine mutable tables explicitly; define whether every update or only business-field updates advance the timestamp.
6. Append-only records: specify the runtime/database role matrix, including ownership, migration role, service role and restrictions on UPDATE, DELETE and TRUNCATE. A defensive trigger is not a substitute for privilege separation.
7. Finance reversal: amount equality, same account/currency, authorization and single-reversal enforcement require a transaction contract and approved finance policy. The full-reversal rule remains authority-gated.
8. Idempotency recovery: preserve the approved row-lock/fencing protocol; the exact SQL isolation and retry behavior require PostgreSQL version validation and concurrency tests.
9. Outbox publishing: specify lease expiry, retry/backoff, poison-message handling, event identity and consumer deduplication before implementation.

## 6. Required pre-coding evidence

- Exact CHECK predicates with SQL NULL semantics documented.
- Exact trigger inventory: table, timing, event, row/statement scope, function, lock order and bypass protection.
- Explicit transaction boundaries for every cross-row invariant.
- Least-privilege database role and grant matrix for runtime, worker, reporting, migration and backup identities.
- Concurrency test specifications mapped to the 15 scenarios in PITR-01.
- PostgreSQL provider and major-version confirmation.
- Independent DDD-013 technical assurance and all delegated authority decisions required by the manifest.

## 7. Disposition

- Static inventory/reference reconciliation: PASS.
- CHECK semantic classification: CORRECTION REQUIRED.
- Trigger/transaction contract completeness: OPEN.
- Currency and attendance authority gates: OPEN.
- Runtime PostgreSQL validation: DEFERRED.
- CPERD-06 closure: NOT CLOSED.
- Implementation authorization: NOT GRANTED.

This report is a reconciliation artifact. It does not amend the owner-approved CPERD-01 master ERD or authorize implementation. The cross-row CHECK reclassification and any corresponding master ERD revision must be included in the next owner-review package.
