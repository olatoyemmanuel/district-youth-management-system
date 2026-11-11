# DYMS CPERD-02 — Successor Trigger, Transaction and Concurrency Contract Register

- Revision: CPERD-08R2
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **SUCCESSOR CONTRACT DESIGN CANDIDATE; STATIC REGISTER RECONCILIATION REQUIRED BEFORE OWNER APPROVAL**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose and authority

CPERD-08 refines the trigger and transactional enforcement catalogue after CPERD-06 identified contracts requiring exact timing, event, row scope, function ownership, lock order and bypass protection.

This is a design-only reconciliation. It creates no SQL, trigger, function, index, Prisma model, migration, database object, application code, test implementation or deployment resource.

The CPERD-01 master ERD and canonical integrity register remain the current physical-design references. This report does not silently amend either. Proposed changes must be reconciled into the canonical registers and reviewed by the project owner before implementation.

## 2. Enforcement decision rules

1. Use a row-local CHECK only for deterministic predicates on the row being written. Do not query another row from a CHECK.
2. Use FK and UNIQUE constraints for referential and duplicate protection wherever they express the invariant.
3. Use a trigger only when a database-level cross-row guard is required and its lock target, timing, predicate, error outcome and bypass controls are explicit.
4. Use a single authorized transaction for actor authorization, lifecycle transitions, multi-row business invariants and required audit/outbox writes.
5. Use database privileges to protect append-only evidence and separate operational duties. Triggers do not replace least-privilege grants.
6. Use Redis/BullMQ only for scheduling and delivery. PostgreSQL remains the durable source of truth for business state, idempotency and outbox work.
7. Apply the owner-approved Phase 4 DYMS product defaults. Do not invent unspecified lifecycle values, partial unique predicates, retention schedules or trigger bypass rights. Keep disabled features disabled and unconfigured policy values unset.
8. All multi-row transactions must document lock ordering. If a workflow needs a new lock order, document and test it before implementation.
9. Use parameterized SQL and fixed, schema-qualified database object references. No client-provided identifier, table name or sort expression may enter dynamic SQL.
10. The PostgreSQL production provider/version remains open. PostgreSQL 15 is the minimum design target in TBR-01, not a claim that the production service has been selected.

## 3. Trigger contract catalogue

### 3.1 Appointment overlap guard

| Contract element | Required design |
|---|---|
| Trigger | `trg_appointments_prevent_overlap` |
| Table | `appointments` |
| Timing/event | BEFORE INSERT OR UPDATE |
| Scope | FOR EACH ROW |
| Serialization lock | Lock the parent `positions` row FOR UPDATE before checking appointment overlap |
| Predicate | Compare only rows that crossed the approved boundary, using `approved_at IS NOT NULL` |
| Interval semantics | Half-open intervals [effective_from, effective_to); NULL end is unbounded; adjacent intervals are allowed |
| Update behavior | Exclude OLD/current row from the overlap scan; reject position identity changes after approval |
| Scope integrity | Composite FKs prove appointment district/type/child scope matches the selected position |
| Failure | Reject the write with a stable constraint/domain error; no partial appointment state |
| Bypass | Runtime cannot disable trigger, alter function, set replication role or change ownership |
| Status | Core no-overlap rule approved; exact trigger implementation remains subject to final physical review |

Lock sequence: position parent row first, then overlap query over appointments in the same transaction. The lock serializes competing approvals for the same position. Do not add a second lock on appointment rows in a different order without a deadlock review.

### 3.2 Attendance subject-mode and session guard

| Contract element | Required design |
|---|---|
| Trigger | `trg_attendance_records_enforce_subject_mode` |
| Table | `attendance_records` |
| Timing/event | BEFORE INSERT OR UPDATE |
| Scope | FOR EACH ROW |
| Serialization lock | Lock the referenced `event_attendance_subjects` row FOR UPDATE before checking mode/session shape |
| EVENT mode | `event_session_id` must be NULL |
| SESSION mode | `event_session_id` must be NOT NULL and reference a session belonging to the same event |
| Identity | Attendance subject/event/member identity columns are immutable after insert |
| Duplicate protection | Canonical partial unique indexes remain the final duplicate guard |
| Failure | Reject mismatched mode, event/session, or immutable identity mutation |
| Bypass | Runtime cannot disable trigger or mutate trigger function/ownership |
| Status | ODR-006 owner-approved product default. Preserve EVENT/SESSION subject-mode behavior and documented authorized registration exceptions. The current physical owner is per member-event subject; reconcile this representation in the successor ERD. No external attendance-authority confirmation is a DYMS design prerequisite. |

Critical unresolved decision: the current ERD stores mode on `event_attendance_subjects`, which means mode is per member-event subject. A single mode for the entire event would require a different physical owner. Do not change the ERD or add an `events.attendance_mode` column without explicit reconciliation and approval.

### 3.3 Event capacity reservation

| Contract element | Required design |
|---|---|
| Guard | `trg_event_registrations_reserve_capacity` or an explicitly approved application transaction with equivalent serialization |
| Serialization lock | Lock the parent `events` row FOR UPDATE before reading/updating capacity state |
| Counter | Increment/decrement `reserved_count` atomically with the registration transition |
| Eligibility | Only confirmed registrations consume capacity under the approved v1 default |
| Idempotency | Repeated confirmation/cancellation must not double-increment or double-decrement |
| Failure | Reject confirmation when capacity is exhausted; no partial counter or registration mutation |
| Bypass | Runtime cannot directly set the counter outside the approved workflow |
| Status | ODR-008 owner-approved product default: confirmed registrations consume capacity; no waitlist; late registration/capacity override require approval and reason; material changes reapproved. Map these rules to an explicit lifecycle vocabulary without inventing additional states. |

No status CHECK or partial-unique predicate is authorized until the registration lifecycle catalogue is approved. The counter must be treated as derived transactional state, not a client-controlled field.

### 3.4 Retention hold guard

| Contract element | Required design |
|---|---|
| Guard | `trg_retention_actions_hold_guard` or equivalent controlled retention transaction |
| Serialization lock | Lock the `retention_subjects` row FOR UPDATE as the common subject serialization point |
| Recheck | Within the same transaction, recheck approved retention policy/version, due condition, active holds and subject enrollment |
| Approval | Verify initiator/approver separation and authorized disposal capability |
| Effect | Record an auditable retention action; perform only the specific approved action |
| Failure | Active hold, missing schedule, missing enrollment, missing approval or stale policy blocks disposal |
| Bypass | Runtime/worker cannot delete source records directly or create an unapproved retention action |
| Status | No retention schedule or source enrollment approved; destructive automation remains disabled |

No automatic permanent deletion is enabled for unknown/unapproved retention classes. The database lock does not substitute for the ODR-011 authority decision.

### 3.5 Updated timestamp trigger

| Contract element | Required design |
|---|---|
| Trigger family | `trg_<table>_set_updated_at` |
| Timing/event | BEFORE UPDATE |
| Scope | FOR EACH ROW |
| Function | One shared, narrowly scoped timestamp function or equivalent generated per-table trigger |
| Clock | Database-owned timestamp; TBR-01 records `statement_timestamp()` for update time |
| Targets | `user_accounts`, `members`, `church_memberships`, `events`, `budgets`, `budget_lines`, `service_principals`, `idempotency_records`, `pre_auth_contexts` |
| Caller control | Ignore caller-supplied/backdated `updated_at`; set from database time |
| Bypass | Runtime cannot disable trigger or update trigger function |
| Status | Nine-table scope corrected in CPERD-06; update semantics must remain consistent with TBR-01 |

The design baseline says every UPDATE advances `updated_at`. If the project later wants business-field-only updates, that is a design change requiring an explicit decision. Do not silently narrow the trigger to selected columns.

### 3.6 Append-only evidence boundary

Tables include `audit_events`, `audit_access_events` and `idempotency_recovery_events`, plus other history records classified in CPERD-07.

- Runtime and worker have no UPDATE, DELETE or TRUNCATE on append-only evidence.
- Inserts occur through the approved narrow writer path or explicit INSERT grant.
- Defensive triggers may reject mutation attempts, but the primary enforcement is database privileges and ownership separation.
- Audit reads are separately permissioned and themselves audited.
- Retention disposal is a distinct, approved operation. It must not be implemented as ordinary runtime delete access.

This is a privilege/operations control, not a business trigger that grants its caller additional authority.

### 3.7 Credential definition validity policy

The validity-duration rule depends on a related `credential_definitions` row. It is not a valid row-local CHECK.

- Validate definition/version consistency in the authorized transaction before approval or activation.
- Read the referenced definition under the documented consistency model.
- Prevent a definition/version change race by locking the authoritative definition row or using an immutable versioned definition contract.
- Do not reintroduce a cross-row CHECK or volatile lookup function.
- ODR-009 is an owner-approved configurable credential catalogue design: recognized issuer role, evidence review, linked renewal/reissue, reasoned revocation and controlled disclosure. Unknown validity remains unset; do not invent a duration or require external confirmation to accept the DYMS design.

## 4. Transaction contracts

### 4.1 Authentication refresh rotation

- Validate the presented refresh credential against server-side session/token state.
- Serialize rotation for the session/token family using the approved row-lock/atomic update contract.
- Consume the old credential and persist exactly one successor atomically.
- Ensure the successor cannot extend beyond the absolute session expiry.
- Reuse of a consumed credential invokes the frozen DFR-004 family-revocation behavior.
- Record security audit evidence without logging credential values.
- Concurrent requests must not both receive valid successors.
- Failure/timeout handling must not leave two valid successors or silently revive a consumed credential.

DFR-001/004 values and behavior remain frozen. Exact physical token-family constraints remain subject to the DDD-013 assurance and implementation validation.

### 4.2 DDD-013 idempotency claim and recovery

- Resolve the server-derived idempotency identity and scope fingerprint.
- Acquire the target idempotency record lock under the approved transaction protocol.
- Enforce the five-second lock timeout and no more than ten-second transaction duration recorded in D13-PDR-01.
- Increment the fencing counter atomically.
- Insert the CLAIMED recovery event in the same transaction as the successful fencing increment.
- Reject stale worker completion when its fencing token is no longer current.
- Fail closed at BIGINT overflow without changing the counter or allowing the protected operation.
- Append outcome events; do not rewrite prior recovery events.
- The business/authentication side effect and idempotency terminal outcome must have a documented atomicity boundary.
- Same key with a different request fingerprint returns the approved conflict outcome and does not execute.

Exact PostgreSQL lock/isolation/unique-conflict handling and concurrency proof remain implementation-time validation. External independent DDD-013 technical assurance remains unperformed.

### 4.3 Finance posting and full reversal

- Finance context alone owns financial state transitions.
- Submitter cannot approve their own transaction.
- Posting occurs only after required approval and confirmed payment under the approved workflow.
- A posted transaction is immutable.
- A reversal is a new linked transaction, not an edit or deletion of the original.
- For full reversal, lock the original transaction row before checking whether a reversal already exists.
- Verify same account and currency, full amount equality, authorized actor and no prior full reversal in the same transaction.
- Use the canonical unique relationship to prevent concurrent duplicate reversal.
- Provider webhook processing must be idempotent and must not post twice.
- Do not implement partial reversal, FX, partial payment or budget exceptions without the relevant authority approval.

ODR-005 owner-approved conservative DYMS defaults apply. Partial payments, multiple successful payments, FX, refunds, budget exceptions and amount-based approval thresholds remain disabled unless separately configured under an approved change/decision. Official external accounting policy is not a prerequisite for the accepted DYMS default.

### 4.4 Transactional outbox and worker lease

- Write the outbox row in the same database transaction as the business mutation.
- Worker claims eligible rows using a bounded lease and concurrency-safe claim operation.
- Claim/lease state is committed before external provider calls.
- External call occurs outside the business transaction.
- Completion is accepted only from the worker holding the current lease/fencing token.
- Record each delivery attempt as history.
- Retry uses bounded backoff and an explicit maximum; poison messages enter controlled review/dead-letter handling.
- A stable event identity and consumer deduplication prevent duplicate business side effects.
- Queue loss is recovered by scanning PostgreSQL outbox rows.
- Provider acceptance is not proof of delivery and does not rewrite business transaction truth.

Exact lease duration, retry ceiling, poison-message policy and manual replay authority require ODR-012/operational confirmation. Do not invent numeric settings.

### 4.5 Retention execution

A retention action is permitted only when all of the following are true in one controlled transaction:
- the source class is enrolled against an approved retention subject;
- an approved policy version defines basis, duration and trigger;
- the action is due;
- no active hold exists;
- the initiating actor is authorized;
- the required independent approval is present;
- the action and evidence are recorded.

Until ODR-011 confirms schedules and enrolled classes, destructive retention automation remains disabled. Backup retention remains governed separately by DFR-005.

## 5. Global lock-order policy

The following lock order is proposed as a baseline. It is not a universal sequence across unrelated aggregates. A workflow touching multiple protected resources must list its exact order and must not acquire them in reverse order elsewhere.

| Workflow | Required lock order | Reason |
|---|---|---|
| Appointment approval/overlap | Position parent → appointment overlap check/row | Serialize position schedule |
| Attendance insert/correction | Attendance subject → referenced session if required → attendance row | Serialize mode and session shape |
| Event registration capacity | Event parent → registration row/state | Serialize final capacity slot |
| Retention action | Retention subject → policy/hold state → source record/action | Serialize hold and disposal decision |
| Idempotency recovery | Idempotency record → append recovery event | Atomic fencing and event evidence |
| Finance reversal | Original financial transaction → reversal relationship/row | Prevent duplicate full reversal |
| Outbox worker | Outbox candidate row claim → lease/fencing update | Prevent simultaneous ownership |
| Credential version approval | Credential definition/version authority row → version state | Prevent validity-policy race |

Before implementation, generate a wait-for/deadlock review for every multi-aggregate transaction. Deadlock retry must be bounded and must not repeat an external side effect. Never use Redis locks as the only protection for a PostgreSQL invariant.

## 6. Concurrency and failure test specifications

These are test requirements, not executed tests.

| ID | Concurrent/failure scenario | Required invariant |
|---|---|---|
| TX-001 | Two appointment approvals for overlapping intervals and same position | At most one conflicting approval commits |
| TX-002 | Adjacent appointment intervals | Both may commit |
| TX-003 | Appointment scope/position mutation after approval | Mutation rejected; new appointment workflow required |
| TX-004 | Two attendance inserts race with subject-mode change | One consistent mode; no mixed-mode rows |
| TX-005 | Attendance session belongs to a different event | Insert rejected |
| TX-006 | Two registrations race for final event capacity | At most one confirmation; reserved_count remains exact |
| TX-007 | Duplicate registration confirm/cancel delivery | Counter changes at most once per transition |
| TX-008 | Retention hold creation races with disposal | Hold wins or disposal commits first under serialized order; never both violate policy |
| TX-009 | Caller attempts to backdate updated_at | Database timestamp wins |
| TX-010 | Runtime attempts UPDATE/DELETE/TRUNCATE on append-only evidence | Permission denied |
| TX-011 | Two refresh rotations use same consumed credential | One successor at most; reuse behavior applied |
| TX-012 | Two identical idempotency claims race | One authoritative claim and one protected side effect |
| TX-013 | Stale worker completes after a newer fencing claim | Stale completion rejected |
| TX-014 | Idempotency counter reaches BIGINT max | Fail closed; no claim or side effect |
| TX-015 | Two full reversals race on one posted transaction | At most one full reversal commits |
| TX-016 | Duplicate payment webhook arrives | No duplicate posting or payment side effect |
| TX-017 | Worker crashes after provider success but before completion | Reconciliation/deduplication prevents duplicate business effect |
| TX-018 | Queue is unavailable for an extended period | Durable outbox remains recoverable |
| TX-019 | Credential definition validity policy changes during version approval | Version approval observes one consistent definition version |
| TX-020 | Pooled connection is reused after actor-scoped operation | No actor/scope context leaks to next request |

## 7. Cross-register reconciliation required

Before a final physical ERD candidate is regenerated:

1. Reconcile every trigger target against the 70-table column register.
2. Reconcile every trigger predicate against named CHECK, FK and index entries.
3. Add explicit trigger/function metadata: name, table, timing, events, row/statement scope, function, owner, execution mode, lock target, lock order, error behavior and bypass controls.
4. Reconcile append-only classification with CPERD-07 role/grant matrix and the exact per-table lifecycle.
5. Reconcile the nine updated_at targets and timestamp source with TBR-01.
6. Reconcile event capacity trigger behavior with approved registration lifecycle values.
7. Reconcile attendance subject-mode placement and semantics with the owner-approved ODR-006 product default. Preserve the current per member-event subject representation unless a documented change request approves a different physical owner.
8. Reconcile retention transaction with approved schedule, source enrollment and holds.
9. Reconcile finance reversal cardinality, amount/account/currency and payment-posting states with finance authority.
10. Reconcile idempotency transaction and recovery ledger with the DDD-013 exact physical slice and independent assurance findings.
11. Reconcile outbox lease/fencing/retry with ODR-012 and worker role grants.
12. Regenerate manifest hashes and static cross-register checks after any approved changes.

## 8. Unresolved gates

| Gate | Status | Required evidence |
|---|---|---|
| ODR-003 appointment lifecycle | OWNER DESIGN CLOSED | Standard annual appointment lifecycle, higher-authority approval, fresh renewal, one active holder per position/scope and reasoned early termination. Acting, overlap and retroactive exceptions remain disabled in v1. |
| ODR-005 finance | OWNER DEFAULT APPROVED | Conservative account/approval/payment/reversal/budget workflow. Advanced payment/FX/refund/budget-exception/threshold features remain disabled; do not infer their behavior. |
| ODR-006 attendance | OWNER DEFAULT APPROVED | EVENT/SESSION subject mode; confirmed registration normally required; documented authorized exception; self-check-in/offline disabled. Preserve current subject-mode physical owner in this candidate. |
| ODR-008 event registration | OWNER DEFAULT APPROVED | Confirmed registrations consume capacity; no waitlist; late registration/capacity override require approval and reason; material changes reapproved. Lifecycle mapping remains a design reconciliation task. |
| ODR-009 credentials | OWNER DESIGN CLOSED | Versioned configurable catalogue, recognized issuer role, evidence review, linked renewal/reissue, reasoned revocation and controlled disclosure; unknown validity remains unset. |
| ODR-010 audit | OWNER DEFAULT APPROVED | Separate Audit Officer; administrator has no automatic audit-read; exceptional access independently approved; break-glass disabled until a procedure is configured. |
| ODR-011 retention | OWNER DEFAULT APPROVED | No automated permanent deletion without an approved schedule; holds suspend disposal; source enrollment/schedule configuration is required before disposal. |
| ODR-012 notifications/integrations | OWNER DEFAULT APPROVED | In-app baseline; verified email/templates; optional SMS/WhatsApp with consent; provider-independent adapters. Retry ceiling/provider configuration remain operational design selections. |
| ODR-ENV-001/006/007 | OPEN | Confirm PostgreSQL provider/version, grants, topology and backup evidence |
| CPERD-07 role/grant matrix | NOT CLOSED | Complete provider-specific grants and verify privilege boundaries |
| DDD-013 independent technical assurance | NOT PERFORMED | Independent review and documented findings |
| DFR-006 governance | CLARIFIED — 2026-11-02 | Formal design freeze/change control remains in force; implementation remains NOT AUTHORIZED. See DFR-006-GOVERNANCE-CLARIFICATION-2026-11-02.md. |
| Final consolidated ERD owner approval | NOT GRANTED for any amended package | Exact package/hash review by project owner |
| Separate implementation authorization | NOT GRANTED | Explicit owner authorization after design closure |

## 9. CPERD-08 disposition

- Trigger and transaction catalogue: **RECONCILED AT CONTRACT LEVEL**.
- Exact trigger/function implementation inventory: **OPEN**.
- Global lock-order policy: **PROPOSED; workflow-specific proof required**.
- Concurrency test specifications: **20 DEFINED; NOT EXECUTED**.
- Delegated-authority confirmation is not a prerequisite for the owner-approved DYMS product defaults under Phase 4. Unspecified values remain configurable or disabled; external institutional policy is recorded separately where relevant.
- Provider-specific validation: **OPEN**.
- CPERD-08 design-contract disposition: **RECONCILIATION IN PROGRESS** pending exact trigger/function inventory metadata and successor-register/ERD alignment. Runtime concurrency tests remain unexecuted and are post-authorization implementation validation.
- Implementation authorization: **NOT GRANTED**.

## 10. Protected implementation boundary

Do not create or modify application code, Prisma schema/models, SQL DDL, PostgreSQL roles/grants/functions/triggers, migrations, database state, seeds, implementation tests or deployment resources under this reconciliation.

This report is not a final physical schema certification. The project owner retains review and approval authority. No coding-stage transition is inferred.


## 11. CPERD-02 exact trigger/function metadata

This section supersedes the earlier generic trigger catalogue for the CPERD-02 successor. Only the following three trigger families are selected as database triggers. Other invariants are enforced by a single authorized application transaction, declarative constraints, or database privileges. Do not add triggers merely because an operation is transactional.

| Trigger | Table | Timing/event | Scope | Function | Owner | Execution mode | Lock target/order | Predicate and failure |
|---|---|---|---|---|---|---|---|---|
| `trg_appointments_prevent_overlap` | `appointments` | BEFORE INSERT OR UPDATE | FOR EACH ROW | `fn_appointments_prevent_overlap` | `dyms_object_owner` | SECURITY INVOKER | Lock `positions` parent row FOR UPDATE; then inspect overlapping appointments for that position | Apply only where `approved_at IS NOT NULL`; compare half-open effective intervals [from,to); reject overlap and approved position/scope identity mutation with stable constraint error |
| `trg_attendance_records_enforce_subject_mode` | `attendance_records` | BEFORE INSERT OR UPDATE | FOR EACH ROW | `fn_attendance_records_enforce_subject_mode` | `dyms_object_owner` | SECURITY INVOKER | Lock referenced `event_attendance_subjects` row FOR UPDATE; then validate session/event relationship | EVENT mode requires NULL session; SESSION mode requires non-NULL session belonging to same event; reject mixed mode and immutable identity changes |
| `trg_<table>_set_updated_at` | Nine registered mutable tables | BEFORE UPDATE | FOR EACH ROW | `fn_set_updated_at` | `dyms_object_owner` | SECURITY INVOKER | No additional row lock beyond the update | Set NEW.updated_at to statement_timestamp(); caller-supplied updated_at is ignored |

Updated timestamp targets, exactly as listed in the CPERD-02 integrity register:
`user_accounts`, `members`, `church_memberships`, `events`, `budgets`, `budget_lines`, `service_principals`, `idempotency_records`, `pre_auth_contexts`.

### 11.1 Trigger hardening and bypass controls

- All functions use fixed, schema-qualified object references and parameterized operations. No user-supplied table/function identifier or dynamic SQL is permitted.
- Functions are owned by the non-login object-owner identity. Runtime and worker roles cannot alter functions, alter trigger definitions, change ownership, disable triggers, set session_replication_role or assume owner/migrator privileges.
- Both trigger functions use SECURITY INVOKER. No SECURITY DEFINER function is selected by CPERD-02.
- Function EXECUTE grants are limited to the roles required by the trigger path. Exact provider-specific grant syntax remains a deployment/implementation verification artifact.
- Stable constraint/domain errors must not expose SQL, internal object names, or sensitive record values to API clients.
- Trigger exceptions abort the entire statement/transaction. No partial row or counter state is committed.

### 11.2 Application transaction contracts, not triggers

| Workflow | Enforcement contract | Lock/transaction rule | Status |
|---|---|---|---|
| Church transfer completion | One authorized transaction updates source membership, creates receiving membership, completes request, appends audit and outbox | Lock member serialization row first; then transfer request; verify source church and both church scopes; commit all or none | Enabled |
| Event capacity | Registration confirmation and `reserved_count` change are one transaction | Lock event parent first, then registration; compare capacity and counter; repeated transition changes counter once | Enabled |
| Finance full reversal | One full reversal only; same account/currency; original posted fact immutable | Lock original transaction first; check existing reversal; create linked reversal and audit/outbox atomically | Enabled |
| Idempotency fencing | Atomic claim, monotonically increasing fencing counter, stale worker rejection and overflow fail-closed | Lock idempotency record; append recovery event in same transaction | Enabled |
| Transactional outbox | Business state and outbox event commit together; at-least-once delivery and stable event identity | Worker claims row with lease/fencing; stale worker cannot complete | Enabled |
| Retention disposal | Schedule, source enrollment, hold and approval must be rechecked | Lock retention subject; no destructive operation while schedule/source enrollment is absent | Disabled until configured |
| Credential validity | Validate the referenced definition/version and validity policy | One transaction reads a consistent definition version and records issuance | Enabled only for configured definitions |

The event-capacity counter is application-owned derived state. Direct client mutation is prohibited; every transition must use the event-registration command. PostgreSQL row locking and the event parent serialization point prevent two confirmations from consuming the same final slot. The counter must be reconciled against confirmed registrations before any manual repair.

### 11.3 Lock-order rules

The workflow-specific lock order is authoritative for each transaction:
1. Appointment approval: position parent, then appointment overlap read/write.
2. Attendance record: attendance subject, then referenced session where needed, then attendance row.
3. Event registration: event parent, then registration row.
4. Transfer completion: member serialization row, then transfer request, then church-membership rows in deterministic source/receiving order.
5. Finance reversal: original financial transaction, then reversal relation.
6. Idempotency recovery: idempotency record, then recovery event.
7. Outbox: candidate outbox row, then lease/fencing update.

No workflow may acquire these same resources in reverse order. Deadlock retries are bounded and must not repeat provider side effects.

## 12. CPERD-02 static contract disposition

- Trigger families and metadata: **DEFINED**.
- Database trigger count: three trigger families plus nine per-table updated_at instances.
- Application transaction contracts: transfer, event capacity, finance reversal, idempotency, outbox, retention and credential validity defined.
- Concurrency/failure test specifications: 20 defined; **NOT EXECUTED**.
- Provider-specific grants, PostgreSQL execution, query plans, concurrency tests, backup/restore tests and operational evidence: **POST-AUTHORIZATION OR DEPLOYMENT VALIDATION**.
- Static cross-register verification is recorded in the CPERD-02 reconciliation report.
- Implementation remains **NOT AUTHORIZED**.
