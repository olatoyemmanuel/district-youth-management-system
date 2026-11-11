# DYMS CPERD-08 — Trigger, Transaction and Concurrency Contract Reconciliation

- Revision: CPERD-08
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **CONTRACT RECONCILIATION IN PROGRESS; OWNER AND PROVIDER GATES OPEN**
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
7. Do not infer lifecycle values, partial unique predicates, retention schedules, delegated authority or trigger bypass rights.
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
| Status | EVENT/SESSION default accepted by project owner; delegated attendance authority pending |

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
| Status | ODR-008 owner-approved default; delegated event authority and exact lifecycle values remain pending |

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
- ODR-009 issuer/validity authority remains pending.

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

Finance authority thresholds and some accounting/payment details remain delegated-authority gates.

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
7. Reconcile attendance subject mode owner with delegated attendance authority.
8. Reconcile retention transaction with approved schedule, source enrollment and holds.
9. Reconcile finance reversal cardinality, amount/account/currency and payment-posting states with finance authority.
10. Reconcile idempotency transaction and recovery ledger with the DDD-013 exact physical slice and independent assurance findings.
11. Reconcile outbox lease/fencing/retry with ODR-012 and worker role grants.
12. Regenerate manifest hashes and static cross-register checks after any approved changes.

## 8. Unresolved gates

| Gate | Status | Required evidence |
|---|---|---|
| ODR-003 appointment lifecycle | OPEN where exceptions remain | Confirm approval/termination lifecycle and authority details |
| ODR-005 finance | OPEN where delegated details remain | Confirm finance authority, payment/posting and reversal rules |
| ODR-006 attendance | OPEN | Confirm per-subject versus per-event mode and attendance exception authority |
| ODR-008 event registration | OPEN where delegated details remain | Confirm exact capacity lifecycle and exceptions |
| ODR-009 credential validity/issuer | OPEN | Confirm issuer authority and validity policy |
| ODR-010 audit | OPEN | Confirm investigation, Audit Officer and exceptional-access authority |
| ODR-011 retention | OPEN | Confirm schedules, source classes, holds and disposal authority |
| ODR-012 notifications/integrations | OPEN | Confirm retry ceiling, manual replay and provider operational controls |
| ODR-ENV-001/006/007 | OPEN | Confirm PostgreSQL provider/version, grants, topology and backup evidence |
| CPERD-07 role/grant matrix | NOT CLOSED | Complete provider-specific grants and verify privilege boundaries |
| DDD-013 independent technical assurance | NOT PERFORMED | Independent review and documented findings |
| DFR-006 governance record | OPEN | Preserve and reconcile dated governance clarification |
| Final consolidated ERD owner approval | NOT GRANTED for any amended package | Exact package/hash review by project owner |
| Separate implementation authorization | NOT GRANTED | Explicit owner authorization after design closure |

## 9. CPERD-08 disposition

- Trigger and transaction catalogue: **RECONCILED AT CONTRACT LEVEL**.
- Exact trigger/function implementation inventory: **OPEN**.
- Global lock-order policy: **PROPOSED; workflow-specific proof required**.
- Concurrency test specifications: **20 DEFINED; NOT EXECUTED**.
- Delegated authority gates: **OPEN**.
- Provider-specific validation: **OPEN**.
- CPERD-08 closure: **NOT CLOSED**.
- Implementation authorization: **NOT GRANTED**.

## 10. Protected implementation boundary

Do not create or modify application code, Prisma schema/models, SQL DDL, PostgreSQL roles/grants/functions/triggers, migrations, database state, seeds, implementation tests or deployment resources under this reconciliation.

This report is not a final physical schema certification. The project owner retains review and approval authority. No coding-stage transition is inferred.
