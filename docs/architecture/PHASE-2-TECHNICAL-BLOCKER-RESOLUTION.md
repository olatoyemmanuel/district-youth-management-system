# DYMS Phase 2 Technical Blocker Resolution

- Revision: TBR-01
- Date: 2026-11-02
- Branch: `phase-1/requirements-consolidation`
- Scope: Technical and physical-design blockers that can be resolved without inventing church, ministry, finance, safeguarding, privacy or records policy
- Authority: Approved conceptual ERD, DFR-001–DFR-006, DDD-001–DDD-015, requirements consolidation, owner decision register
- Status: **ENGINEERING BASELINE PROPOSED FOR PROJECT-OWNER APPROVAL**
- Physical design approval: **NOT GRANTED**
- Implementation authorization: **NOT AUTHORIZED**

## 1. Executive disposition

This document resolves technical design questions where an enforceable, conservative design can be selected from the approved requirements and PostgreSQL capabilities. It does not convert policy questions into engineering assumptions.

The design is suitable to continue detailed project design. It is not a declaration that every domain policy is approved, that PostgreSQL DDL has been executed, or that implementation is authorized.

Three dispositions are used:

- **RESOLVED AT DESIGN LEVEL**: a concrete engineering mechanism is selected. It still requires normal implementation tests after authorization.
- **PROPOSED OWNER DEFAULT**: a recommended product/domain choice is grounded in the existing DYMS scope but needs explicit owner confirmation.
- **AUTHORITY BLOCKED**: the schema can preserve the data and enforce approved boundaries, but a competent ministry, finance, safeguarding, privacy or records authority must supply the rule.

## 2. Technical baseline decisions

| ID | Previous blocker | Resolution | Disposition |
|---|---|---|---|
| TBR-01 | Schema and naming convention | One PostgreSQL schema, `public`; plural snake_case table names; snake_case columns; stable constraint/index names. No multi-schema split in v1.0. | RESOLVED AT DESIGN LEVEL |
| TBR-02 | PostgreSQL compatibility | PostgreSQL 15 is the minimum design target because the DDD-013 review explicitly targets PG15. Use only core PG15 features. Deployment provider/version must still be confirmed. | RESOLVED AT DESIGN LEVEL; ENV confirmation pending |
| TBR-03 | Extension dependency | No required extension. Do not require `btree_gist`, `citext`, PostGIS or a third-party UUID extension for the baseline. | RESOLVED AT DESIGN LEVEL |
| TBR-04 | UUID generation | Use PostgreSQL `gen_random_uuid()` defaults for UUID primary keys on PG15. Application-generated UUIDv4 remains valid for offline/client-created identifiers, but one row must have one authoritative generated ID. | RESOLVED AT DESIGN LEVEL |
| TBR-05 | Login identifier normalization | Normalize identifiers in the application using Unicode NFC and a documented, versioned canonicalization routine before persistence. Persist the canonical value separately from display input. Compare canonical values under deterministic `COLLATE "C"`; enforce uniqueness on the canonical stored column. Do not rely on locale-dependent `lower()` expression indexes or `citext`. Email-specific case policy must be confirmed before enabling email as a login identifier. | RESOLVED TECHNICALLY; email policy confirmation pending |
| TBR-06 | Timestamp authority | PostgreSQL is authoritative for persistence timestamps. `created_at` defaults to `transaction_timestamp()`; `updated_at` is maintained by a single BEFORE UPDATE trigger using `statement_timestamp()`. Business-effective dates and externally supplied event times remain explicit values. Store instants as `timestamptz`; preserve IANA timezone names for scheduled events. | RESOLVED AT DESIGN LEVEL |
| TBR-07 | Database role model | Separate non-login object owner/migration role, restricted runtime application role, outbox worker role, backup/restore operator role, and audit-reader role. Runtime roles do not own tables and have no DDL, TRUNCATE, unrestricted UPDATE/DELETE on audit evidence, or role-management privileges. Audit insertion is exposed through a narrowly scoped database function or dedicated writer privilege. | RESOLVED AT DESIGN LEVEL; provider privilege capability pending |
| TBR-08 | FK actions | Default to ON DELETE RESTRICT and ON UPDATE RESTRICT. Any exception must be named and justified by a domain lifecycle rule. No cascading deletion across membership, finance, audit, credentials, attendance or appointment history. | RESOLVED AT DESIGN LEVEL |
| TBR-09 | Defaults in 617-column register | Apply defaults only to technical identity/creation/concurrency fields: UUID PKs use `gen_random_uuid()`; `created_at` uses `transaction_timestamp()`; `updated_at` uses the update trigger; explicitly approved counters retain their stated zero defaults. Do not invent defaults for status, role, approval, category, money, event dates, or policy-bearing fields. | RESOLVED AT DESIGN LEVEL |
| TBR-10 | Index naming and redundancy | Preserve the reconciled canonical inventory; PostgreSQL identifiers must be <=63 bytes. A candidate index is accepted only after exact key order, predicate, uniqueness semantics and FK support are checked. No index is declared workload-approved without query-plan evidence. | DOCUMENT-LEVEL BASELINE RESOLVED; workload review pending |

### 2.1 Timestamp contract

- `created_at` is assigned by PostgreSQL at transaction start and is immutable after insert.
- `updated_at` is set by a database trigger on every update. Application code must not choose or backdate it.
- Domain event time, approval time, effective date, attendance time and payment-provider time are separate business facts. They must not be replaced by `created_at`.
- Store UTC instants in `timestamptz`. Store an IANA timezone string for events and schedules.
- Historical imports must use a separately authorized import path and preserve source timestamps in explicit source/effective columns. They must not override the audit timestamps.

### 2.2 Login identifier contract

Use a canonical stored identifier rather than a locale-sensitive expression index. The canonicalization function must be versioned and covered by test vectors for Unicode normalization, case folding, whitespace rejection and allowed identifier characters. The application must reject invalid input before insert. The database unique constraint protects the canonical stored value from concurrent duplicates.

Do not silently assume that email is the sole login identifier. DFR-001 and the account requirements remain authoritative for the allowed identifier types. If email login is approved, store a separate canonical email value and enforce uniqueness only for non-null values. The exact email local-part case policy is an owner decision.

## 3. Appointment overlap enforcement

### 3.1 Selected mechanism

Use a PostgreSQL trigger-based overlap guard that does not require `btree_gist`.

For an appointment insert or update:

1. Lock the referenced `positions` row with `SELECT ... FOR UPDATE`.
2. Validate the position and appointee relationship.
3. Check for another approved appointment for the same `position_id` whose effective interval overlaps the proposed interval.
4. Exclude the current row on update.
5. Reject overlap with a stable constraint-style error.
6. Keep the check and write in the same transaction.

Use half-open effective intervals `[effective_from, effective_to)`. A NULL end means unbounded future. Adjacent appointments are allowed when the first end equals the next start. The lock serializes concurrent writes for the same position, preventing a check-then-insert race.

The trigger must evaluate only appointment rows that have passed the approval boundary. Pending/rejected request lifecycle must not be represented as an approved appointment. If the final lifecycle design keeps pending requests in the same table, the trigger predicate must use an explicitly approved, stable approval marker, not an invented status string.

### 3.2 Preserved policy

- One active holder per position and scope remains the approved rule.
- Annual normal term, higher-authority approval, no self-approval, fresh renewal, history and reasoned early termination remain unchanged.
- Acting appointments and exceptional overlap remain disabled.
- Exact state vocabulary, future/retroactive effective-date exceptions and early-termination authority remain ODR-003 authority decisions.

**Disposition:** Core overlap mechanism RESOLVED AT DESIGN LEVEL. Appointment request/state modeling remains AUTHORITY BLOCKED until ODR-003 is closed.

## 4. Attendance integrity and concurrency

### 4.1 Canonical attendance subject

Retain `event_attendance_subjects` as the unique event/member anchor. `attendance_records` must reference this anchor using the mandatory composite relationship. Keep event/member identity in the composite FK and do not add duplicate standalone event/member FKs.

Optional registration and session relationships use PostgreSQL MATCH SIMPLE:
- `event_id` and `member_id` are NOT NULL.
- `registration_id` and `event_session_id` are independently nullable.
- A NULL optional ID skips only that optional FK; it does not weaken the mandatory subject FK.

### 4.2 Duplicate prevention

Use two partial unique indexes:
- Event-level record: unique `attendance_subject_id` where `event_session_id IS NULL`.
- Session-level record: unique `(attendance_subject_id, event_session_id)` where `event_session_id IS NOT NULL`.

Each event-member attendance subject selects one mode, EVENT or SESSION, in the existing `event_attendance_subjects.mode` column. Do not add a second `events.attendance_mode` column. A subject cannot mix modes after its first attendance record. The database trigger locks the subject row before inserting/updating attendance and rejects a record whose event/session shape does not match the subject mode. In SESSION mode, event-level summary attendance is derived from session records; it is not stored as a second attendance row. This avoids double-counting and prevents mixed-mode duplicates.

### 4.3 Registration exception

The approved requirements state that valid registration is the normal prerequisite and an authorized coordinator may grant a documented exception. Preserve nullable `registration_id`, but a missing registration must require an explicit exception record containing the granting actor, reason and timestamp. Do not interpret NULL registration as an automatic walk-in allowance.

### 4.4 Policy still requiring confirmation

ODR-006 must confirm the exact event/session mode vocabulary, permitted self-check-in, QR expiry/single-use behavior, offline synchronization and post-event correction window. ODR-008 must confirm registration capacity-consuming states, waitlist and late-registration rules. No partial unique predicate may depend on an unapproved lifecycle status.

**Disposition:** Relational and concurrency mechanism RESOLVED AT DESIGN LEVEL. Mode vocabulary and operational exceptions remain authority-gated.

## 5. Organizational scope recommendations

### 5.1 District boundary

DYMS v1.0 remains Sango District only. Every business record must have a typed, enforceable owner scope. No global cross-district reporting or arbitrary `scope_type + scope_id` ownership is introduced.

### 5.2 Department ownership

**Proposed owner default:** Department instances are district-owned in v1.0. A department coordinator is a district-scoped role. Local church youth leadership remains a separate local-church structure. Church-specific department instances are not included unless the district governance authority approves them.

This matches the currently documented hierarchy of district departmental coordinators and local church youth leaders. It is a proposal, not a new approved church policy.

### 5.3 Event ownership

**Proposed owner default:** An event is owned by exactly one district or one local church. A department may be the organizing/participating unit, but is not a third event owner in v1.0. District events require district approval; local church events require the designated local church authority's approval before publication. Significant changes retain approval history.

This preserves the existing requirement for district and local church event approval while avoiding a department-owned event authority that has not been approved. ODR-004 and ODR-008 remain open for explicit confirmation.

### 5.4 Composite scope enforcement

For a church-owned row, store `church_id` and enforce the church's district through a composite FK to `churches(id,district_id)`. Do not also add a redundant standalone church FK when the composite FK already proves existence and hierarchy. For a department row, `department_id` references the department record, and the department's district ownership is inherited through that record. A request must not duplicate conflicting district/church/department scope values.

**Disposition:** FK mechanism RESOLVED AT DESIGN LEVEL. Department and event owner types are PROPOSED OWNER DEFAULTS awaiting confirmation.

## 6. Finance design boundary

The following approved rules remain fixed:
- Separate district and church account ownership.
- One currency per account.
- NGN is the Sango District default.
- Monetary values use exact decimal/numeric types.
- Submitter cannot approve their own transaction.
- Posted corrections use linked reversals; no silent edit/delete.
- Account ownership is not transferred by district consolidation.

Keep `numeric(19,4)` as a storage-capacity proposal, not as an approved currency-scale rule. Keep the currency code on every monetary aggregate and enforce account/transaction/payment currency with composite FKs. Do not add an amount-positive, debit/credit sign, partial-payment, multiple-successful-payment, refund, chargeback, budget-overrun or approval-threshold rule until ODR-005 is approved.

**Proposed future accounting shape:** positive absolute amount plus a controlled direction/type field, with all posted facts immutable and corrections represented by linked reversal records. This is a recommendation for finance-authority review, not an approved accounting policy.

**Disposition:** Referential integrity is RESOLVED AT DESIGN LEVEL. Accounting and payment workflow remains AUTHORITY BLOCKED.

## 7. Retention and audit

### 7.1 Retention

Keep `retention_subjects`, `retention_policies`, `retention_holds` and `retention_actions` as the retention-control model. Every enrolled source record must have a real typed FK to its retention subject. Do not use a polymorphic table/record string as the only integrity mechanism.

Do not enroll source tables, set durations, or enable automatic disposal until ODR-011 identifies:
- record classes and source tables;
- approved basis and schedule version;
- duration and trigger event;
- disposal/anonymization action;
- hold authority and approval;
- disposal evidence and independent reviewer.

Unknown schedule means no automated permanent deletion. Holds suspend disposal. DFR-005 backup retention remains separate from business-record retention.

### 7.2 Audit

Audit events remain append-only. Runtime application and worker roles receive no UPDATE, DELETE or TRUNCATE on audit tables. Audit access is separately permissioned and itself audited. The exact audit reader, investigator and break-glass roles remain ODR-010 decisions.

**Disposition:** Audit enforcement mechanism RESOLVED AT DESIGN LEVEL. Retention source enrollment and schedule remain AUTHORITY BLOCKED.

## 8. Credentials, child accounts and personal data

- Keep one individual user account per member. No guardian account, shared login, guardian-managed account or delegated guardian-to-child login.
- Do not infer a member's age category or credential eligibility from a date-of-birth field alone.
- Collect date of birth, address, emergency contact, identity documents or other sensitive attributes only when a confirmed requirement and safeguarding basis justify them.
- Keep credential definitions versioned, with issuer, approver, evidence reference, validity and revocation history.
- Credential issuance must remain disabled for any credential whose official standard, issuer authority or evidence requirement has not been confirmed.
- Do not put personal or sensitive evidence on a public blockchain. Blockchain verification remains deferred from MVP.

ODR-001 and ODR-009 require official ministry/credential standards. Safeguarding/onboarding policy requires the competent authority. The physical design must not create a guardian login as a workaround.

**Disposition:** Data-minimization and individual-account boundary RESOLVED. Eligibility, credential authority, evidence and younger-member onboarding remain AUTHORITY BLOCKED.

## 9. Reporting requirements gap

The current 97-row requirement catalogue has no dedicated REPORT group although report definitions, runs and export audits are in the approved conceptual ERD and physical proposal.

Add a proposed REPORT requirement group before final physical approval. Candidate requirements must cover:
- report definition ownership, approval and immutable versioning;
- district/church/department scope binding;
- authorization recheck at request, execution and export retrieval;
- data classification, aggregation and redaction;
- export format, download authorization and expiry;
- report-run reproducibility and definition-version binding;
- export audit actor, purpose and outcome;
- retention/expiry controlled by ODR-011 and ODR-013.

These are candidate requirements, not silently added approved requirements. Update the requirement catalogue and crosswalk together after owner acceptance. Do not claim the existing 97-row count includes them.

**Disposition:** Traceability gap identified and remediation defined. Report catalogue, classification and export rules remain ODR-013 authority decisions.

## 10. DDD-013 technical resolution

The DDD-013 proposal must use the following exact engineering contracts before it is treated as ready for owner approval:

1. **Session ownership:** add candidate UNIQUE `auth_sessions(id,user_account_id)`; authenticated idempotency uses composite FK `(session_id,actor_user_account_id)` to that tuple. Session-bound operations require a session; principal-scoped operations may omit it. Pre-auth mode has neither actor nor session.
2. **Scope fingerprint:** 32-byte SHA-256 digest over a versioned, length-prefixed binary tuple. Prefix with domain separator `DYMS/AUTH-IDEM/SCOPE/v1\0`; encode scope kind explicitly (GLOBAL, DISTRICT, CHURCH, DEPARTMENT) and each UUID in network byte order. Include parent district identity for church/department scopes where the approved authorization scope requires it. Global scope is an explicit tagged value, never an all-NULL ambiguity. Clients cannot submit this digest.
3. **Index sentinel:** the authenticated unique expression index may normalize absent session with the reserved zero UUID only if a CHECK rejects the zero UUID as an actual session. PostgreSQL 15 supports expression and partial unique indexes. Keep the request fingerprint outside the unique identity key.
4. **Recovery ledger:** use an append-only `idempotency_recovery_events` ledger. Insert CLAIMED in the same transaction as the successful fencing increment. Insert subsequent outcome events instead of mutating prior events. Unique partial index on `(idempotency_record_id,fencing_counter)` for CLAIMED events.
5. **Tombstone:** keep the same idempotency row as the compact tombstone. At 24 hours, remove replayable safe-result fields and preserve the identity digest, scope, operation, fingerprint/key version and tombstone expiry through day 30. Do not copy into a second table where uniqueness could split.
6. **Overflow:** BIGINT max overflow is an integrity failure. Fail closed; no wrap, reset, truncation, reuse, claim or protected state transition.
7. **Password-reset secret choreography:** generate and place the raw secret in an envelope-encrypted external store with a <=30-minute TTL before the DB transaction. Then atomically insert the reset-token hash, idempotency terminal record and outbox row containing only an opaque secret reference. If the DB transaction definitively fails, delete the secret; if commit outcome is uncertain, query the idempotency key before cleanup. TTL is the final safety net. Delivery success or expiry erases the external secret. Never put the raw secret in PostgreSQL, queue payload, logs or traces.
8. **FK actions:** RESTRICT/RESTRICT while the idempotency row/tombstone, recovery evidence or outbox row depends on the referenced actor/session/context/token. Cleanup is ordered and must not remove referenced evidence prematurely.

The revised DDD-013 file must carry these exact rules, and the physical column/FK/index registers must be regenerated from the accepted revision before final DDD-013 approval. This is an internal engineering refinement, not an independent external review.

## 11. Environment and operational decisions

| Environment item | Engineering baseline | Still required |
|---|---|---|
| PostgreSQL | Minimum PG15, no required extensions | Confirm production managed service/provider and supported major |
| UUID | PG15 `gen_random_uuid()` default | Confirm provider supports function; PG15 does |
| Collation | Deterministic `C` comparison of canonical values | Confirm database encoding/locale at provisioning |
| Timestamps | DB authoritative, UTC instants | Confirm host/managed-service time synchronization and operational monitoring |
| Roles | Separate migration, runtime, worker, audit-reader, backup roles | Confirm provider grants and ownership model |
| Backups | Preserve DFR-005: daily encrypted backup, RPO <=24h, RTO <=8h, restore tests and alerting | Confirm deployment topology and produce restore-test evidence |
| Extensions | None required by this baseline | Revisit only if a later reviewed feature needs one |

## 12. Remaining authority decisions

These cannot be closed by engineering alone:

| Decision | Authority | What must be supplied | Physical design handling until then |
|---|---|---|---|
| ODR-001 | Recognized Adventurer/Pathfinder/Senior Youth/Master Guide authorities | Applicable official standards, versions, local adaptations, eligibility and evidence | Keep category/credential catalogue versioned; no age or eligibility CHECK invented |
| ODR-002 | District and local church membership authorities | Rejection, cancellation, appeal, backdating and open-request cardinality | Preserve approved transfer stages; do not add open-request unique predicate |
| ODR-003 | Higher appointing authority | Lifecycle states, early termination authority, future/retroactive dates, acting/overlap exceptions | Acting and overlap exceptions disabled; approved appointment overlap guard retained |
| ODR-004 | District governance/project owner | Department owner types, event owner types, cross-scope role rules | Apply proposed district-only departments and district/church events only after owner confirmation |
| ODR-005 | District/church finance authorities | Account multiplicity, approval matrix, payment lifecycle, reversal and budget policy | Keep finance referential model; do not enforce unapproved accounting semantics |
| ODR-006 | District event/attendance authority | Event/session mode, registration exceptions, correction and self-check-in rules | Keep nullable registration with explicit exception evidence; mode trigger awaits mode approval |
| ODR-007 | Departmental ministry authority | Eligibility, renewal, appeal and transfer effects | Preserve request/coordinator approval/history; no status predicate invented |
| ODR-008 | District/local event authorities | Capacity states, waitlists, late registration, postponement, reopening and refunds | Keep capacity atomicity; do not invent consuming registration statuses |
| ODR-009 | Recognized credential authorities | Catalogue, issuer, evidence, validity, revocation and disclosure | Keep versioned model; issuance disabled until authority mapping exists |
| ODR-010 | District governance/security/audit authority | Named audit roles, investigation and break-glass process | Append-only audit; no broad reader grants |
| ODR-011 | Records/finance/privacy authorities | Record classes, basis, duration, trigger, disposal and holds | No source enrollment or automatic permanent deletion without schedule |
| ODR-012 | Project owner/privacy/integration owners | Channels, consent, providers, retry ceiling and manual replay | Provider-independent adapters; no provider secrets in DB/code |
| ODR-013 | Reporting/security/data owners | Report catalogue, classification, export authority and expiry | Scope rechecks and export audit; candidate requirements must be approved |
| ODR-ENV-007 | Technical/deployment owner | Provider/topology and backup/restore evidence | DFR-005 targets remain unchanged; no claim of operational validation |

## 13. Approval and project-start recommendation

The project can continue detailed design now. The following work is not blocked by the authority decisions above:

- finalize domain boundaries and bounded contexts;
- finalize API contracts for approved workflows;
- finalize authorization and audit architecture;
- complete physical schema for domains whose approved invariants are known;
- create the final ERD/physical design review package;
- prepare test cases and threat model;
- plan deployment and backup architecture against DFR-005.

The following implementation areas must remain feature-gated until their authority decisions are recorded: member eligibility/category transitions, transfer exceptions, acting appointments, department lifecycle exceptions, attendance mode and exception workflows, finance posting/payment/reversal rules, credential issuance, automated retention/disposal, and report export policy.

Before implementation, complete the final physical registers from this baseline, obtain owner approval of the physical design, and receive separate explicit implementation authorization. The conflicting DFR-006 repository statements must also be reconciled by a dated owner governance record; this document does not lift or change DFR-006.

**No Prisma schema, SQL DDL, migration, database object, seed, generated client, API implementation or application code is authorized by this document.**


## 14. Exact trigger and identity refinements

### 14.1 Appointment overlap trigger contract

The overlap guard uses a BEFORE INSERT OR UPDATE trigger on `appointments`. The trigger:
- requires `position_id`, `effective_from`, and the approved appointment marker to be present before the appointment becomes effective;
- locks the parent `positions` row with `FOR UPDATE` before checking for overlap;
- checks only other approved rows (`approved_at IS NOT NULL`) using the half-open interval predicate:
  `existing.effective_from < COALESCE(NEW.effective_to, 'infinity'::timestamptz)` AND
  `NEW.effective_from < COALESCE(existing.effective_to, 'infinity'::timestamptz)`;
- excludes the current appointment on UPDATE;
- rejects an approved appointment's `position_id` change; a scope/position change requires a new appointment and preserved history;
- allows adjacent intervals where one interval ends exactly when the next begins;
- runs the overlap query after acquiring the parent lock, in the same transaction as the insert/update.

The trigger does not use a lifecycle status string. The `approved_at IS NOT NULL` marker identifies records that crossed the approved appointment boundary. If appointment requests are stored separately in the final model, only the approved appointment table receives this trigger. The lock serializes competing approvals for the same position, so the second transaction observes the first committed interval before accepting its own.

### 14.2 Attendance mode and registration exception columns

The existing `event_attendance_subjects.mode varchar(16) NOT NULL` is the authoritative mode for one member within one event, with candidate values `EVENT` and `SESSION`. Do not add `events.attendance_mode` in this revision. The subject mode becomes immutable after the first attendance record is inserted. This preserves the current physical ERD shape; ODR-006 must confirm whether the final business rule is per member-event subject or one mode for the entire event before final approval.

For `attendance_records`, add:
- `registration_exception_granted_by_user_account_id uuid NULL` FK to `user_accounts(id)`;
- `registration_exception_reason text NULL`;
- `registration_exception_granted_at timestamptz NULL`.

A CHECK enforces one of two shapes:
- registered attendance: `registration_id IS NOT NULL` and all three exception columns are NULL;
- approved exception: `registration_id IS NULL` and all three exception columns are NOT NULL.

A BEFORE INSERT/UPDATE trigger locks the referenced `event_attendance_subjects` row before checking its mode and the referenced session. EVENT mode requires `event_session_id IS NULL`; SESSION mode requires `event_session_id IS NOT NULL` and the session must belong to the same event. The event-level and session-level partial unique indexes prevent duplicate rows. In SESSION mode, an event-level summary is derived and not stored as a duplicate attendance row.

Attendance identity fields (`attendance_subject_id`, `event_id`, `member_id`) are immutable after insert. Corrections are represented by the approved correction workflow, not by moving an attendance row to another member/event.

ODR-006 remains the authority gate for approving the mode vocabulary and operational exceptions. These column/trigger details are the proposed physical contract for that decision.

### 14.3 Canonical login identifier storage

The existing `user_accounts.login_identifier` column is the canonical stored identifier, not a display-preserving copy. The application normalizes it using versioned Unicode NFC plus the selected case-folding rule before insert. A separate display/contact field may preserve presentation, but authentication lookup and the unique index use only the canonical `login_identifier` under `COLLATE "C"`. The exact case policy for email as an accepted login identifier remains an owner decision; email contact uniqueness is not inferred from login identifier uniqueness.

### 14.4 No implicit status defaults

All lifecycle-bearing values remain explicit command inputs after authorization and transition validation. Do not default an account, appointment, transfer, registration, attendance, finance, credential, notification or report status to an assumed active/pending value. Database defaults are limited to technical IDs, creation timestamps, update timestamps and explicitly approved counters.


## 15. Attendance exception integrity and register delta

The registration exception columns in §14.2 are governed by this exact candidate CHECK:

```sql
(
  registration_id IS NOT NULL
  AND registration_exception_granted_by_user_account_id IS NULL
  AND registration_exception_reason IS NULL
  AND registration_exception_granted_at IS NULL
)
OR
(
  registration_id IS NULL
  AND registration_exception_granted_by_user_account_id IS NOT NULL
  AND registration_exception_reason IS NOT NULL
  AND length(btrim(registration_exception_reason)) > 0
  AND registration_exception_granted_at IS NOT NULL
)
```

Proposed stable name: `ck_attendance_records_registration_evidence`.

The exception actor FK is:
- `fk_attendance_records_registration_exception_granted_by_user_account_id`;
- source `attendance_records.registration_exception_granted_by_user_account_id`;
- target `user_accounts(id)`;
- ON DELETE RESTRICT / ON UPDATE RESTRICT;
- candidate source support index `ix_attendance_records_registration_exception_granted_by_user_account_id`.

This CHECK proves that an unregistered attendance row carries a complete exception record. Authorization still verifies that the granting user is an event coordinator with authority for the event scope. A database CHECK cannot prove that role/scope authorization.

The attendance subject mode remains the existing `event_attendance_subjects.mode` column. The prior draft sentence that said the event itself chooses a mode is superseded. The event/member subject locks itself before checking child attendance shape. ODR-006 must confirm whether the mode should be per member-event subject (the current ERD shape) or a single setting for the entire event before the final schema is frozen.

The candidate column, FK, CHECK and index above must be added to the canonical column/FK/index registers during final register regeneration. They are not represented as already present in the 617-column/155-FK/214-index source inventories.


## 16. Stable CHECK-constraint naming catalogue

Use the stable pattern `ck_<table>_<invariant>`. Names are lowercase ASCII, deterministic, unique within the schema and no longer than PostgreSQL's 63-byte identifier limit. Do not put lifecycle status values in a CHECK until the corresponding state catalogue is approved.

The following structural CHECK names are the proposed baseline:

| Table | Constraint name | Invariant |
|---|---|---|
| `auth_sessions` | `ck_auth_sessions_expiry_order` | Inactivity expiry does not exceed absolute expiry |
| `auth_session_tokens` | `ck_auth_session_tokens_generation_positive` | Token generation is greater than zero |
| `password_reset_tokens` | `ck_password_reset_tokens_expiry_order` | Expiry is later than creation |
| `member_category_assignments` | `ck_member_category_assignments_effective_interval` | Effective end is NULL or later than start |
| `church_memberships` | `ck_church_memberships_effective_interval` | Effective end is NULL or later than start |
| `church_transfer_requests` | `ck_church_transfer_requests_distinct_churches` | Source and receiving church differ |
| `positions` | `ck_positions_allowed_scope_type` | Scope type is one of DISTRICT, CHURCH or DEPARTMENT |
| `appointments` | `ck_appointments_term_interval` | Term end is not before term start |
| `appointments` | `ck_appointments_effective_interval` | Effective end is NULL or later than start |
| `role_permissions` | `ck_role_permissions_effect_allow` | Role-permission rows represent ALLOW only; DENY remains separate |
| `events` | `ck_events_capacity_nonnegative` | Capacity is NULL or nonnegative |
| `events` | `ck_events_reserved_count_nonnegative` | Reserved count is nonnegative |
| `events` | `ck_events_time_order` | Event end is later than event start |
| `events` | `ck_events_registration_window` | Registration close is not before registration open when both are set |
| `event_sessions` | `ck_event_sessions_time_order` | Session end is later than session start |
| `event_attendance_subjects` | `ck_event_attendance_subjects_mode` | Mode is EVENT or SESSION |
| `financial_accounts` | `ck_financial_accounts_exactly_one_owner` | Exactly one of district_id and church_id is populated |
| `currencies` | `ck_currencies_minor_unit_range` | Minor unit is between zero and four |
| `transaction_reversals` | `ck_transaction_reversals_not_self` | Original and reversal transaction differ |
| `transaction_revisions` | `ck_transaction_revisions_number_positive` | Revision number is greater than zero |
| `budgets` | `ck_budgets_exactly_one_owner` | Exactly one of district_id and church_id is populated |
| `budgets` | `ck_budgets_period_order` | Period end is not before period start |
| `budget_lines` | `ck_budget_lines_sort_order_nonnegative` | Sort order is nonnegative |
| `credential_definition_versions` | `ck_credential_definition_versions_validity` | Duration is present only when the validity policy requires it |
| `credential_issuances` | `ck_credential_issuances_validity_order` | Valid-until is NULL or not before valid-from |
| `notification_deliveries` | `ck_notification_deliveries_attempt_positive` | Attempt number is greater than zero |
| `outbox_messages` | `ck_outbox_messages_event_version_positive` | Event version is greater than zero |
| `outbox_messages` | `ck_outbox_messages_attempt_count_nonnegative` | Attempt count is nonnegative |
| `integration_failures` | `ck_integration_failures_retry_count_nonnegative` | Retry count is nonnegative |
| `audit_events` | `ck_audit_events_actor_type` | Actor type is USER, SYSTEM, SERVICE or ANONYMOUS |
| `audit_events` | `ck_audit_events_actor_identity` | Actor type matches the required user/service/null identity shape |
| `report_runs` | `ck_report_runs_output_size_nonnegative` | Output size is NULL or nonnegative |
| `idempotency_records` | `ck_idempotency_records_scope_mode_identity` | Exactly one authenticated or pre-auth identity shape |
| `idempotency_records` | `ck_idempotency_records_status` | Status is IN_PROGRESS, COMPLETED or FAILED |
| `idempotency_records` | `ck_idempotency_records_fencing_nonnegative` | Fencing counter is nonnegative |
| `idempotency_records` | `ck_idempotency_records_session_not_reserved` | Reserved zero UUID is never a real session reference |
| `attendance_records` | `ck_attendance_records_registration_evidence` | Registration FK and exception evidence are mutually exclusive complete shapes |

Additional exact-one-scope CHECKs must be named per table using `ck_<table>_exactly_one_owner_scope` only where the table has the corresponding typed owner columns. Their permitted owner set is table-specific and must match the final ODR-004 decision. Do not apply a generic three-way district/church/department CHECK to finance accounts or budgets.

The following are not ordinary row CHECK constraints and must remain separate enforcement mechanisms:
- appointment overlap: serialized parent-position trigger;
- attendance mode/child-shape: serialized attendance-subject trigger plus partial unique indexes;
- submitter/approver inequality: transactionally enforced actor comparison;
- parent/child organizational hierarchy: composite FKs;
- finance reversal equality and one-full-reversal rule: composite FKs, unique keys and transactionally enforced amount comparison;
- event capacity: atomic reservation operation and parent-event lock;
- retention hold versus disposal: locked hold check in the same disposal transaction;
- append-only audit/recovery evidence: database privileges and restricted writer path.

Lifecycle state CHECKs for transfer, appointment, department membership, event registration, finance, credentials, notification and report workflows remain blocked until their state catalogues are approved. This catalogue supplies stable names for structural invariants; the final register must still include exact expressions, field participation and source traceability.
