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

An event must select one recording mode: EVENT or SESSION. The database trigger locks the parent event row before inserting/updating attendance and rejects a record whose event/session shape does not match the event's configured mode. In SESSION mode, event-level summary attendance is derived from session records; it is not stored as a second attendance row. This avoids double-counting and prevents mixed-mode duplicates.

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
