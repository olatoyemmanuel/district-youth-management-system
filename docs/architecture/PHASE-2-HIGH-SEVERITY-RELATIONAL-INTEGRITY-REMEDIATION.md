# DYMS Phase 2 High-Severity Relational Integrity Remediation

**Status:** Proposed design amendment for review  
**Scope:** RIM-01 through RIM-08, with emphasis on high-severity blockers  
**Logical source:** Approved conceptual ERD revision `25f2813e0256d9472daded45657dfb7ac9f70a43`  
**Physical source:** `PHASE-2-PHYSICAL-DATABASE-DESIGN.md`  
**Implementation status:** NOT AUTHORIZED

## 1. Purpose

This amendment resolves the design-level gaps identified in the initial relational-integrity review where the current requirements are sufficient to propose a relational pattern. It does not convert unresolved church, finance, safeguarding, credential, or retention policy into approved policy.

The amendment distinguishes:
- **Proposed technical resolution:** a concrete database design pattern that preserves approved domain rules.
- **Policy blocked:** the structure can be designed, but production behavior or values depend on an authority decision.
- **Evidence required:** target environment or official source must be confirmed before final physical approval.

No SQL DDL, Prisma schema, migration, database object, or application code is created.

## 2. RIM-02: Complete budget and reporting definitions

### 2.1 `budgets`

Proposed columns:
- `id uuid PK`
- `district_id uuid NULL FK districts(id)`
- `church_id uuid NULL FK churches(id)`
- `budget_code varchar(60) NOT NULL`
- `title text NOT NULL`
- `period_start date NOT NULL`
- `period_end date NOT NULL`
- `currency_code char(3) NOT NULL FK currencies(code)`
- `status varchar(24) NOT NULL`
- `submitted_by_user_account_id uuid NOT NULL FK user_accounts(id)`
- `submitted_at timestamptz NOT NULL`
- `approved_by_user_account_id uuid NULL FK user_accounts(id)`
- `approved_at timestamptz NULL`
- `created_at timestamptz NOT NULL`
- `updated_at timestamptz NOT NULL`

Constraints and indexes:
- CHECK exactly one of `district_id` and `church_id` is non-null.
- CHECK `period_end >= period_start`.
- Candidate unique key `(district_id, budget_code, period_start, period_end)` and `(church_id, budget_code, period_start, period_end)`, implemented as separate partial unique indexes because the owner columns are nullable.
- Composite candidate key `(id, currency_code)` for budget-line currency binding.
- Index `(district_id, period_start, period_end, status)` and corresponding church index.
- FK delete behavior RESTRICT. Historical approved budgets are not cascaded away.

### 2.2 `budget_lines`

Proposed columns:
- `id uuid PK`
- `budget_id uuid NOT NULL FK budgets(id)`
- `line_code varchar(60) NOT NULL`
- `description text NOT NULL`
- `allocated_amount numeric(19,4) NOT NULL`
- `revised_amount numeric(19,4) NULL`
- `currency_code char(3) NOT NULL`
- `sort_order integer NOT NULL`
- `created_at timestamptz NOT NULL`
- `updated_at timestamptz NOT NULL`

Constraints and indexes:
- Composite FK `(budget_id, currency_code)` to `budgets(id, currency_code)`.
- UNIQUE `(budget_id, line_code)`; UNIQUE `(budget_id, sort_order)`.
- CHECK `sort_order >= 0`.
- Do not impose positive/zero amount, revised amount, or sum-of-lines constraints until finance authority defines treatment of zero allocations, reductions, contingency, and over-allocation.
- Index `(budget_id, sort_order)`.

Policy boundary:
- Budget approval authority, revision rules, actual-versus-budget variance treatment, and whether budget lines map to account codes or ministry programme categories remain unapproved. The proposal intentionally does not invent these rules.

### 2.3 `report_definitions`

Proposed columns:
- `id uuid PK`
- `code varchar(80) NOT NULL`
- `version integer NOT NULL`
- `name text NOT NULL`
- `description text NULL`
- `classification varchar(24) NOT NULL`
- `definition_payload jsonb NOT NULL`
- `status varchar(20) NOT NULL`
- `created_by_user_account_id uuid NOT NULL FK user_accounts(id)`
- `approved_by_user_account_id uuid NULL FK user_accounts(id)`
- `created_at timestamptz NOT NULL`
- `effective_from timestamptz NULL`
- `effective_to timestamptz NULL`

Constraints:
- UNIQUE `(code, version)`.
- CHECK `version > 0`.
- CHECK effective end is null or later than effective start.
- Definition payload is versioned, allowlisted declarative configuration. It must not contain executable SQL, secrets, arbitrary code, or unrestricted user-supplied expressions.
- Index `(code, status, effective_from)`.

### 2.4 `report_runs`

Proposed columns:
- `id uuid PK`
- `report_definition_id uuid NOT NULL FK report_definitions(id)`
- `report_definition_version integer NOT NULL`
- `requested_by_user_account_id uuid NOT NULL FK user_accounts(id)`
- `scope_district_id uuid NULL FK districts(id)`
- `scope_church_id uuid NULL FK churches(id)`
- `scope_department_id uuid NULL FK departments(id)`
- `scope_kind varchar(20) NOT NULL`
- `parameters jsonb NOT NULL`
- `status varchar(24) NOT NULL`
- `requested_at timestamptz NOT NULL`
- `started_at timestamptz NULL`
- `completed_at timestamptz NULL`
- `failure_code varchar(80) NULL`
- `output_object_key text NULL`
- `output_checksum text NULL`
- `output_size_bytes bigint NULL`
- `expires_at timestamptz NULL`

Constraints:
- Exactly one scope FK for scoped reports; global reports require an explicit `scope_kind = 'GLOBAL'` and all scope FKs null. The allowed `scope_kind` values are proposed and require owner approval before CHECK/seed.
- If department scope is used, prove the department's district and optional church relationship through a composite FK or controlled scope binding.
- Report definition version is immutable for the run. Add a composite FK to `report_definitions(code, version)` only if the run stores code as well; otherwise reference a version row by FK. Preferred normalization: add `report_definition_version_id uuid NOT NULL FK report_definition_versions(id)` and create `report_definition_versions` if version history needs immutable content.
- CHECK output size is null or >= 0.
- CHECK completion timestamp is null or >= requested timestamp.
- Index `(requested_by_user_account_id, requested_at DESC)`, `(status, requested_at)`, and each explicit scope plus requested time.
- Recheck authorization when queued, when execution begins, and before export retrieval. Scope must not be widened by report parameters.

### 2.5 `report_export_audits`

Proposed columns:
- `id uuid PK`
- `report_run_id uuid NOT NULL FK report_runs(id)`
- `actor_user_account_id uuid NOT NULL FK user_accounts(id)`
- `export_object_key text NOT NULL`
- `format varchar(20) NOT NULL`
- `destination_classification varchar(24) NOT NULL`
- `exported_at timestamptz NOT NULL`
- `download_expires_at timestamptz NULL`
- `purpose text NOT NULL`
- `correlation_id uuid NULL`

Constraints and indexes:
- FK delete RESTRICT.
- Index `(report_run_id, exported_at)`, `(actor_user_account_id, exported_at)`.
- Each export/download issuance is an append-only audit event. If repeated download events are required, create one row per issuance rather than updating an earlier row.
- Never store a public, permanent URL. Store protected object key and issue short-lived access through the authorized service.

## 3. RIM-03 and RIM-04: Organizational scope and appointment integrity

### 3.1 Scope representation

Retain explicit nullable foreign keys for supported scope targets. Never accept an arbitrary `scope_type + scope_id` pair as a business FK.

For each scope-owning table, document:
- permitted scope kinds;
- the exact nullable FK columns;
- a named exactly-one or zero-or-one CHECK;
- composite FK to prove parent hierarchy;
- FK delete/update actions;
- scope index;
- authorization rule that is separate from relational validity.

Churches already expose `UNIQUE (id, district_id)`. Departments must expose `UNIQUE (id, district_id)` and, where church-owned departments are approved, `UNIQUE (id, district_id, church_id)`. A department's church must belong to the same district.

### 3.2 Normalize position scope into the position

To avoid duplicating and potentially mismatching the appointment's scope, the recommended design is:
- `positions` owns the scope through exactly one of `district_id`, `church_id`, or `department_id`.
- `appointments` references `position_id` and does not repeat the scope columns.
- The appointment's scope is inherited through its position. There is no second appointment scope to contradict.
- `positions` has `UNIQUE (id, district_id)`, `UNIQUE (id, church_id)`, and `UNIQUE (id, department_id)` where needed for downstream scope-specific references, plus exactly-one scope CHECK.
- Position code uniqueness uses separate partial unique indexes per scope kind.
- A position's scope is immutable once it has an appointment. A scope change creates a new position and preserves old appointment history.

This removes the RIM-04 mismatch class by construction. If the project owner wants appointments to move independently of positions, this normalization must be rejected and a separately reviewed composite-scope design supplied.

### 3.3 Appointment non-overlap

- Appointment overlap key is `position_id` plus effective time range.
- The invariant is no two active appointments for the same position may overlap in effective time.
- A PostgreSQL exclusion constraint using `tstzrange(effective_from, effective_to, '[)')` and GiST equality on `position_id` is a candidate. Open-ended `effective_to` is treated as infinity.
- `btree_gist` support and managed database extension permission must be confirmed.
- If extension support is unavailable, use a transactionally locked position row plus a database trigger that rejects overlap. The trigger must use a stable lock order and a concurrency test with two competing transactions.
- No acting/overlap exception is enabled by this proposal.

## 4. RIM-05: Attendance cross-mode integrity

Use the existing `event_attendance_subjects` parent as the one-per-member/event serialization anchor.

Proposed shape:
- `event_attendance_subjects`: `id`, `event_id`, `member_id`, `mode`, actor and timestamps; UNIQUE `(event_id, member_id)`; UNIQUE `(id, event_id, member_id)`.
- `attendance_records`: `id`, `attendance_subject_id`, `event_id`, `member_id`, nullable `event_session_id`, attendance status, recorder and timestamps.
- Composite FK `(attendance_subject_id, event_id, member_id)` references `event_attendance_subjects(id, event_id, member_id)`.
- Composite FK `(event_session_id, event_id)` references `event_sessions(id, event_id)`.
- Unique event-level record: partial unique `(attendance_subject_id)` where `event_session_id IS NULL`.
- Unique session-level record: partial unique `(attendance_subject_id, event_session_id)` where `event_session_id IS NOT NULL`.

Cross-mode rule:
- A deferred constraint trigger or a normalized mode-specific child table must enforce that subject mode EVENT has no session and mode SESSION requires a session.
- The trigger locks the `event_attendance_subjects` row FOR UPDATE before checking/inserting.
- The subject mode becomes immutable once a record exists.
- For a SESSION subject, multiple sessions are allowed, but duplicate records for the same session are not.
- For an EVENT subject, only one event-level attendance record is allowed.
- Trigger error should use a stable application-recognized SQLSTATE and constraint name. The exact SQLSTATE mapping is an implementation detail to be confirmed in the database error contract.
- Race test: two transactions concurrently attempt event-level and session-level capture for the same event/member. Exactly one mode is allowed to commit; the other fails.
- Registration remains nullable until the project owner approves a registration prerequisite.

Alternative if trigger use is rejected: separate `event_attendance_records` and `session_attendance_records` child tables, with a single mode discriminator on the subject and trigger/serialized parent lock still required to prevent both child types. This is not automatically simpler and must be compared before DDL.

## 5. RIM-06: Financial reversal integrity

### 5.1 Transaction/account currency chain

- `financial_accounts`: UNIQUE `(id, currency_code)`.
- `financial_transactions`: UNIQUE `(id, financial_account_id, currency_code)` and composite FK `(financial_account_id, currency_code)` to financial accounts.
- `payments`: composite FK `(financial_transaction_id, currency_code)` to transaction candidate key.
- The transaction currency is copied only as a constrained key component, not independently editable data.

### 5.2 Reversal model

Proposed `transaction_reversals` columns:
- `id uuid PK`
- `original_transaction_id uuid NOT NULL`
- `reversal_transaction_id uuid NOT NULL UNIQUE`
- `financial_account_id uuid NOT NULL`
- `currency_code char(3) NOT NULL`
- `initiated_by_user_account_id uuid NOT NULL FK user_accounts(id)`
- `approved_by_user_account_id uuid NULL FK user_accounts(id)`
- `reason text NOT NULL`
- `status varchar(24) NOT NULL`
- `created_at timestamptz NOT NULL`
- `posted_at timestamptz NULL`

Constraints:
- Composite FK `(original_transaction_id, financial_account_id, currency_code)` to `financial_transactions(id, financial_account_id, currency_code)`.
- Composite FK `(reversal_transaction_id, financial_account_id, currency_code)` to the same transaction candidate key.
- CHECK original transaction differs from reversal transaction.
- UNIQUE `(original_transaction_id)` for one full reversal per original transaction.
- UNIQUE `(reversal_transaction_id)`.
- A reversal transaction must be a transaction type designated as reversal by the approved transaction-type catalogue. The exact value is not seeded until finance approval.
- Serialize reversal creation by locking the original transaction row. Verify original is posted and not already reversed before creating the linked reversal. Posting the reversal and reversal link must commit atomically.

Policy boundary:
- This proposal supports one full reversal per original transaction. Partial reversal, cumulative reversal caps, fees, refunds, chargebacks, and returned payments remain disabled until the finance authority approves their accounting treatment. Do not infer a positive amount or sign convention.

## 6. RIM-07: Retention target coverage and hold/disposal locking

Use a retention subject anchor only where the source record participates in the approved retention schedule.

For each retained source table:
- Add `retention_subject_id uuid NOT NULL UNIQUE FK retention_subjects(id)`.
- Source record creation and retention-subject creation commit in one transaction.
- The source-specific FK makes the link to the source record enforceable in the direction used by holds/actions.
- A deferred constraint trigger on `retention_subjects` verifies exactly one source record points to the subject at transaction commit. It must be updated whenever a new record class is enrolled.
- The subject carries a stable `record_class` and current retention processing state. Its record class must match the source table registered for that FK.
- No source row may be assigned two retention subjects; UNIQUE enforces this.
- A retention subject may not be used for multiple source records; exactly-one-source deferred validation enforces this.

Hold/action relationships:
- `retention_holds.retention_subject_id NOT NULL FK retention_subjects(id)`.
- `retention_actions.retention_subject_id NOT NULL FK retention_subjects(id)`.
- Hold creation, release and disposal all lock the same retention-subject row FOR UPDATE.
- A disposal transaction checks the active approved policy, eligibility date, current holds, and authorization while holding that lock.
- If a hold transaction commits first, disposal sees the active hold and fails. If disposal commits first, a later hold cannot retroactively prevent an already completed action; audit and investigation policy governs such cases.
- Active-hold uniqueness can use one partial unique index per subject if policy allows only one active hold. If multiple independent legal/investigation holds are allowed, retain multiple rows and block disposal while any active hold exists. Do not force single-hold cardinality without policy approval.

Retention enrollment inventory must name every table governed by each retention record class. Do not assume every technical table requires the same retention treatment. No automated deletion is permitted for classes without an approved schedule and authority.

## 7. RIM-08: Audit actor and append-only integrity

Add nullable `actor_service_principal_id uuid FK service_principals(id)` to `audit_events`.

Exact actor identity CHECK truth table:

| actor_type | actor_user_account_id | actor_service_principal_id | Valid |
|---|---|---|---|
| USER | NOT NULL | NULL | Yes |
| SYSTEM | NULL | NULL | Yes |
| SERVICE | NULL | NOT NULL | Yes |
| ANONYMOUS | NULL | NULL | Yes |
| USER | NULL | any | No |
| SYSTEM | NOT NULL or service principal set | any | No |
| SERVICE | any user ID | NULL | No |
| ANONYMOUS | any user ID or service principal set | any | No |

`initiating_user_account_id` is independent and may be set when a user initiates work executed by a service/system actor. It does not replace the actor identity.

Append-only control:
- Application runtime role receives INSERT and SELECT only for audit event tables as needed; no UPDATE, DELETE, TRUNCATE, or ownership privileges.
- Separate migration/maintenance role owns the table and is not used by the runtime service.
- Audit correction creates a new event referencing the prior event; it does not update or delete the prior row.
- Audit-access events are also append-only.
- Database owner/superuser access remains an operational trust boundary and must be protected by restricted credentials, change control, and external administrative logging.
- Test using the actual runtime database role: UPDATE, DELETE, and TRUNCATE must fail; INSERT succeeds only through the approved writer path.
- Add indexes `(actor_user_account_id, occurred_at DESC)`, `(actor_service_principal_id, occurred_at DESC)`, `(target_type, target_id, occurred_at DESC)`, and `(correlation_id)`. Confirm whether partitioning is deferred; partitioning can affect uniqueness/FK design.

## 8. Scope-binding inventory required before final DDL

The following is the minimum table-by-table scope binding plan. Any row marked inherited must not duplicate a scope field unless a composite FK proves the duplicated value matches the owner.

| Table family | Scope source | Binding rule |
|---|---|---|
| Churches | District | `churches.district_id` FK; unique `(id, district_id)` |
| Departments | District, optional church | Composite FK proves church belongs to district; church ownership remains a product-policy decision |
| Positions | Exactly one district/church/department | Position owns scope; immutable after appointment |
| Appointments | Position | Scope inherited through `position_id`; no duplicated scope columns |
| User role assignments | Exactly one explicit scope | Real FK to district/church/department; department hierarchy composite proof |
| Access denies | Exactly one explicit scope | Real FK and scoped deny semantics |
| Events | Exactly one permitted owner | Real owner FK; child event records inherit event scope |
| Event approvals/change/registrations/sessions/attendance | Event | Composite FK to event; no independent scope duplication |
| Financial accounts | Exactly one district/church | Owner CHECK; church must belong to district if district duplicated |
| Financial transactions/payments/reversals | Financial account/transaction | Composite account/currency/transaction FK |
| Budgets | Exactly one district/church | Owner CHECK; line currency bound to budget |
| Credential definitions | Issuer scope | Exactly one issuer scope unless an explicit global issuer type is approved |
| Credential issuance/evidence | Credential/member | Inherit issuer authority from definition version and member |
| Notifications/recipients/deliveries | Notification/recipient/provider | Scope only where a business notification explicitly requires it; otherwise no synthetic scope |
| Audit events/access events | Optional explicit scope | Zero-or-one scope; historical target remains metadata |
| Idempotency records | Operation scope | Explicit normalized scope identity; null/global scope distinguished |
| Retention subjects/holds/actions | Source record | Target-specific source FK through retention subject |
| Report runs/exports | Requested report scope | Exactly one supported scope or explicit GLOBAL scope; authorization rechecked |

This inventory is not a substitute for the final per-column FK/action matrix. Each final FK must name its source columns, target columns, ON DELETE, ON UPDATE, and supporting index.

## 9. Required acceptance tests

1. Budget with both owner FKs null or both set is rejected.
2. Church-owned budget cannot reference a church from another district if district context is also stored.
3. Budget line with a different currency from its budget is rejected.
4. Duplicate budget line code/order within one budget is rejected.
5. Report definition code/version duplicate is rejected.
6. Report run with two scopes, no scope without GLOBAL classification, or department outside the requested district is rejected.
7. Report execution after permission revocation is denied.
8. Position scope change after appointment exists is rejected.
9. Appointment whose position is in another scope cannot be created by supplying a conflicting scope; normalized design has no appointment scope columns.
10. Two overlapping appointments for one position cannot both commit.
11. Concurrent event-level and session-level attendance for the same event/member cannot both commit.
12. Attendance session from a different event is rejected by composite FK.
13. Reversal transaction with a different account or currency from the original is rejected.
14. Two full reversals racing for one original transaction cannot both commit.
15. Partial reversal request is rejected while partial reversal policy is unapproved.
16. Retention subject without exactly one source record cannot commit.
17. One source record cannot have two retention subjects.
18. Active hold racing with disposal prevents disposal when the hold commits first.
19. Audit actor truth-table invalid combinations are rejected.
20. Runtime database role cannot UPDATE, DELETE, or TRUNCATE audit rows.
21. Service audit actor must reference a registered service principal.
22. Cross-scope role assignment, access deny, event, account, budget, credential issuer and report-run relationships reject invalid scope references.

## 10. Open items that remain policy- or environment-blocked

- Whether church-owned department instances are permitted.
- Whether budgets support both district and church ownership as proposed, and who approves/revises them.
- Budget categories, account-code mapping, over-allocation and variance rules.
- Report catalogue ownership, report classification values, and who approves report definitions.
- Global reports and cross-scope reporting authority.
- Appointment exceptional/acting overlaps remain disabled.
- Event registration prerequisite for attendance remains unresolved.
- Partial payments, partial reversals, refunds, chargebacks, and accounting sign convention.
- Retention record classes, schedules, legal basis, approvers, and exact enrolled table list.
- Audit access authority and security investigator roles.
- Production PostgreSQL major version, extension availability, trigger capabilities, and database privilege model.
- Exact lifecycle states and transition graph approval.

## 11. Disposition

RIM-02 through RIM-08 now have concrete proposed technical resolutions or explicit policy blockers. They are not closed as approved constraints until the physical design is reconciled, every FK and column is inventoried, the target PostgreSQL environment is confirmed, and an independent review verifies the result.

RIM-01 table-count reconciliation remains addressed by the 65-table canonical inventory. The original review's medium findings RIM-09 through RIM-14 remain open for the next design pass.

## 12. Implementation boundary

No application code, Prisma schema, migration, SQL DDL, database object, seed data, generated client, or database mutation is authorized by this amendment. DFR-001 through DFR-006 remain preserved. Physical design still requires explicit project-owner approval, followed by separate implementation authorization.
