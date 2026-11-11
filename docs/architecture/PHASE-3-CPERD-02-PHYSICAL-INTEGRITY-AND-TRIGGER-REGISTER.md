# DYMS Phase 3 — Physical Integrity, CHECK and Trigger Register

- Revision: PITR-01
- Date: 2026-11-02
- Scope: DYMS v1.0, Sango District
- Status: **CONSOLIDATED PHYSICAL-DESIGN PROPOSAL; NOT APPROVED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This register defines the proposed database-enforced invariants and the boundaries between declarative constraints, indexes, triggers, transaction/application rules and operational controls.

It reconciles the Phase 2 structural CHECK catalogue, TBR-01, D13-PDR-01, the Phase 3 column register and the Phase 3 FK/index registers. It does not convert unresolved policy into an approved database constraint.

## 2. Enforcement classes

| Class | Meaning |
|---|---|
| CHECK | Single-row deterministic predicate; no other-row lookup. |
| UNIQUE / partial UNIQUE | Candidate identity or concurrency-safe duplicate prevention. See canonical index inventory. |
| FOREIGN KEY | Referential and composite-scope integrity. See canonical FK register. |
| TRIGGER | Cross-row invariant or controlled timestamp/append-only guard requiring database-level execution. |
| TRANSACTION / APPLICATION | Actor authorization, lifecycle transition, approval authority, or invariant requiring multiple records/rows in one transaction. |
| PRIVILEGE / OPERATIONS | Database role separation, backups, retention scheduling, rate limits, secrets and external controls. |

A CHECK must not query another row or call a volatile function. Cross-row conditions use FK, unique index, trigger with a documented lock, or an authorized transaction.

## 3. Structural CHECK catalogue

### 3.1 Identity, session and DDD-013

| Table | Constraint | Predicate / invariant | Classification |
|---|---|---|---|
| auth_sessions | `ck_auth_sessions_expiry_order` | inactivity_expires_at <= absolute_expires_at | DFR-004 structural |
| auth_session_tokens | `ck_auth_session_tokens_generation_positive` | token_generation > 0 | Structural |
| password_reset_tokens | `ck_password_reset_tokens_expiry_order` | expires_at > created_at | DFR-004 structural |
| pre_auth_contexts | `ck_pre_auth_contexts_expiry_window` | expires_at > created_at AND expires_at <= created_at + 10 minutes | AUTH-IDEM-026/036 |
| pre_auth_contexts | `ck_pre_auth_contexts_secret_digest_shape` | secret_digest is NULL only after secret_erased_at is set; non-NULL digest is exactly 32 bytes | AUTH-IDEM-026/036 |
| idempotency_records | `ck_idempotency_records_scope_mode_identity` | AUTHENTICATED requires actor and no pre-auth context; PRE_AUTHENTICATION requires context and no actor/session | AUTH-IDEM-004/026/038 |
| idempotency_records | `ck_idempotency_records_status` | status IN (IN_PROGRESS, COMPLETED, FAILED) | AUTH-IDEM-011 |
| idempotency_records | `ck_idempotency_records_fencing_nonnegative` | fencing_counter >= 0 | AUTH-IDEM-016 |
| idempotency_records | `ck_idempotency_records_session_not_reserved` | session_id IS NULL OR session_id <> reserved zero UUID | D13-PDR-01 |
| idempotency_records | `ck_idempotency_records_scope_fingerprint_length` | octet_length(scope_fingerprint) = 32 and version is supported | D13-PDR-01 |
| idempotency_records | `ck_idempotency_records_key_digest_length` | octet_length(key_digest) = 32 | AUTH-IDEM-003/035 |
| idempotency_records | `ck_idempotency_records_request_fingerprint_length` | octet_length(request_fingerprint) = 32 | AUTH-IDEM-005–008 |
| idempotency_records | `ck_idempotency_records_terminal_metadata` | IN_PROGRESS has no completed_at; COMPLETED/FAILED require completed_at and response/tombstone expiry metadata | AUTH-IDEM-010–014 |
| idempotency_recovery_events | `ck_idempotency_recovery_events_fencing_positive` | fencing_counter > 0 | AUTH-IDEM-016 |
| idempotency_recovery_events | `ck_idempotency_recovery_events_type` | event_type IN (CLAIMED, COMPLETED, FAILED, STALE_WORKER_REJECTED, OVERFLOW_BLOCKED) | D13-PDR-01 |
| outbox_messages | `ck_outbox_password_reset_reference_set` | PASSWORD_RESET delivery requires idempotency_record_id, password_reset_token_id and protected_secret_reference; unrelated purposes must not carry reset-only references | AUTH-IDEM-039 |
| outbox_messages | `ck_outbox_messages_event_version_positive` | event_version > 0 | PDB-R11 |
| outbox_messages | `ck_outbox_messages_attempt_count_nonnegative` | attempt_count >= 0 | PDB-R11 |

### 3.2 Membership, organization and leadership

| Table | Constraint | Predicate / invariant | Classification |
|---|---|---|---|
| appointments | `ck_appointments_status` | status IN (PENDING_APPROVAL, APPROVED, REJECTED, TERMINATED) | CPERD-16 successor candidate |
| appointments | `ck_appointments_decision_metadata` | PENDING_APPROVAL: approved/rejected actor, time and rejection reason all NULL; APPROVED or TERMINATED: approved actor/time NOT NULL and rejection fields NULL; REJECTED: approved fields NULL, rejected actor/time NOT NULL and non-empty rejection reason | CPERD-16 successor candidate |
| appointments | `ck_appointments_termination_metadata` | TERMINATED requires terminated actor/time and non-empty termination reason; all three are NULL for every other status | CPERD-16 successor candidate |
| church_transfer_requests | `ck_church_transfer_requests_status` | status IN (PENDING_RECEIVING_CHURCH, PENDING_DISTRICT, COMPLETED, REJECTED, CANCELLED) | CPERD-16 successor candidate |
| church_transfer_requests | `ck_church_transfer_requests_cancellation_metadata` | CANCELLED requires cancellation actor/time and non-empty reason; all are NULL for every other status | CPERD-16 successor candidate |
| church_transfer_requests | `ck_church_transfer_requests_receiving_decision_pair` | receiving decision actor/time/text are either all NULL or all NOT NULL; decision text is ACCEPTED or REJECTED | CPERD-16 successor candidate |
| church_transfer_requests | `ck_church_transfer_requests_district_decision_pair` | district decision actor/time/text are either all NULL or all NOT NULL; decision text is APPROVED or REJECTED | CPERD-16 successor candidate |

### 3.2 Membership, organization and leadership

| Table | Constraint | Predicate / invariant | Classification |
|---|---|---|---|
| member_category_assignments | `ck_member_category_assignments_effective_interval` | effective_to IS NULL OR effective_to > effective_from | DDD-002 |
| member_category_eligibility_rules | `ck_member_category_eligibility_rules_effective_interval` | effective_to IS NULL OR effective_to > effective_from | ODR-001; rule remains inactive until authority approval |
| church_memberships | `ck_church_memberships_effective_interval` | effective_to IS NULL OR effective_to > effective_from | DDD-003 |
| church_transfer_requests | `ck_church_transfer_requests_distinct_churches` | source_church_id <> receiving_church_id | DDD-003 |
| positions | `ck_positions_allowed_scope_type` | allowed_scope_type IN (DISTRICT, CHURCH, DEPARTMENT) | DDD-004 technical scope |
| appointments | `ck_appointments_term_interval` | term_end >= term_start | DDD-004 |
| appointments | `ck_appointments_effective_interval` | effective_to IS NULL OR effective_to > effective_from | DDD-004 |
| role_permissions | `ck_role_permissions_effect_allow` | effect = ALLOW; DENY is a separate access_denies record | DDD-005 |

### 3.3 Events and attendance

| Table | Constraint | Predicate / invariant | Classification |
|---|---|---|---|
| events | `ck_events_capacity_nonnegative` | capacity IS NULL OR capacity >= 0 | EVT-004 / ODR-008 |
| events | `ck_events_reserved_count_nonnegative` | reserved_count >= 0 | EVT-004 / ODR-008 |
| events | `ck_events_time_order` | ends_at > starts_at | Structural |
| events | `ck_events_registration_window` | registration_closes_at IS NULL OR registration_opens_at IS NULL OR registration_closes_at >= registration_opens_at | Structural |
| event_sessions | `ck_event_sessions_time_order` | ends_at > starts_at | Structural |
| event_attendance_subjects | `ck_event_attendance_subjects_mode` | mode IN (EVENT, SESSION) | ODR-006 owner-approved default; delegated authority pending |
| attendance_records | `ck_attendance_records_registration_evidence` | registration_id present iff exception actor/reason/time are all absent; missing registration requires all three exception fields and a non-empty reason | ATT-007 / TBR-01 |

### 3.4 Finance, credentials, notification, audit and reporting

| Table | Constraint | Predicate / invariant | Classification |
|---|---|---|---|
| financial_accounts | `ck_financial_accounts_exactly_one_owner` | exactly one of district_id and church_id is non-NULL | DDD-009 |
| currencies | `ck_currencies_minor_unit_range` | minor_unit BETWEEN 0 AND 4 | Structural; currency catalogue authority remains open |
| transaction_revisions | `ck_transaction_revisions_number_positive` | revision_number > 0 | DDD-010 |
| transaction_reversals | `ck_transaction_reversals_not_self` | original_transaction_id <> reversal_transaction_id | DDD-010 |
| budgets | `ck_budgets_exactly_one_owner` | exactly one of district_id and church_id is non-NULL | DDD-009/010 |
| budgets | `ck_budgets_period_order` | period_end >= period_start | Structural |
| budget_lines | `ck_budget_lines_sort_order_nonnegative` | sort_order >= 0 | Structural |

| credential_issuances | `ck_credential_issuances_validity_order` | valid_until IS NULL OR valid_until >= valid_from | ODR-009 gated |
| notification_deliveries | `ck_notification_deliveries_attempt_positive` | attempt_number > 0 | DDD-015 |
| integration_failures | `ck_integration_failures_retry_count_nonnegative` | retry_count >= 0 | DDD-015 |
| audit_events | `ck_audit_events_actor_type` | actor_type IN (USER, SYSTEM, SERVICE, ANONYMOUS) | DDD-012 |
| audit_events | `ck_audit_events_actor_identity` | USER requires user actor only; SERVICE requires service principal only; SYSTEM/ANONYMOUS require neither | DDD-012 |
| report_data_owners | `ck_report_data_owners_approval_pair` | approved_by_user_account_id and approved_at are either both NULL or both NOT NULL | REPORT-004 |
| report_runs | `ck_report_runs_scope_shape` | DISTRICT has no church/department; CHURCH has church only; DEPARTMENT has department only; scope_district_id is mandatory; GLOBAL is prohibited | REPORT-002 / ODR-013 |
| report_runs | `ck_report_runs_output_size_nonnegative` | output_size_bytes IS NULL OR output_size_bytes >= 0 | REPORT-006 |

### 3.5 Scope constraints

Use table-specific, named scope CHECKs. Do not apply a generic three-column scope predicate to every table.

| Table | Constraint | Predicate / invariant | Classification |
|---|---|---|---|
| positions | `ck_positions_scope_shape` | district_id is always NOT NULL; DISTRICT requires church_id/department_id NULL; CHURCH requires church_id NOT NULL and department_id NULL; DEPARTMENT requires department_id NOT NULL and church_id NULL | DDD-004 technical scope |
| appointments | `ck_appointments_scope_shape` | district_id and scope_type are NOT NULL; DISTRICT requires child scope IDs NULL; CHURCH requires church_id only; DEPARTMENT requires department_id only. Composite FKs prove scope_type/IDs match the position. | DDD-004 technical scope |
| user_role_assignments | `ck_user_role_assignments_exactly_one_owner_scope` | Exactly one valid organizational scope is populated | DDD-005 |
| access_denies | `ck_access_denies_exactly_one_owner_scope` | Exactly one valid organizational scope is populated | DDD-005 |
| member_category_eligibility_rules | `ck_member_category_eligibility_rules_approval_pair` | approved_by_user_account_id and approved_at are both NULL or both NOT NULL | ODR-001; no rule activates without approval |


- `positions`: district_id is mandatory for all position scopes; allowed_scope_type determines whether church_id or department_id is additionally populated. Composite FKs bind child scope to the same district.
- `appointments`: district_id and scope_type are mandatory; optional church_id/department_id follow scope_type. Three composite FKs bind appointment district/type and optional child scope to the selected position.
- `user_role_assignments`: exactly one valid organizational scope.
- `access_denies`: exactly one valid organizational scope.
- `financial_accounts` and `budgets`: exactly one of district_id and church_id.
- `events`: district_id is always NOT NULL; church_id is NULL for district-owned events and populated for church-owned events. A composite FK binds church to the same district.
- `report_runs`: district_id always NOT NULL; optional church or department scope follows scope_kind. No GLOBAL scope.

## 4. Lifecycle CHECKs intentionally withheld

Do not finalize status CHECKs or partial-unique predicates for the following until the lifecycle catalogue and delegated authority decisions are closed:

- member account/member lifecycle beyond the frozen authentication requirements;
- category assignment current-state predicate (ODR-001);
- church membership current-state and open transfer predicate (ODR-002);
- transfer cancellation/rejection/appeal state vocabulary (ODR-002);
- appointment lifecycle and occupied-state predicate (ODR-003);
- department membership active/current predicate (ODR-007);
- event registration capacity-consuming and uniqueness predicates (ODR-008);
- finance account, payment, transaction and reversal state vocabularies (ODR-005);
- credential definition/issuance/evidence states (ODR-009);
- audit investigation and exceptional-access lifecycle (ODR-010);
- retention schedule and disposal states (ODR-011);
- notification preference/consent and provider lifecycle (ODR-012);
- report definition/run/export lifecycle (ODR-013).

The six POLICY BLOCKED indexes remain out of DDL until their predicates are approved.

## 5. Trigger and transactional enforcement catalogue

| Trigger / operation | Timing and lock | Invariant | Authority / status |
|---|---|---|---|
| `trg_appointments_prevent_overlap` | BEFORE INSERT OR UPDATE; lock parent positions row FOR UPDATE | Approved appointment intervals for the same position cannot overlap; half-open intervals [start,end); adjacent intervals allowed; position_id immutable after approval | DDD-004 core overlap rule approved; trigger implementation proposal pending final physical approval |
| `trg_attendance_records_enforce_subject_mode` | BEFORE INSERT OR UPDATE or reviewed deferred constraint trigger; lock event_attendance_subjects row FOR UPDATE | EVENT mode requires no session; SESSION mode requires same-event session; one subject cannot mix modes; attendance identity columns immutable | ODR-006 owner-approved default; delegated attendance authority pending |
| `trg_event_registrations_reserve_capacity` | Controlled transaction/trigger; lock events row FOR UPDATE | Only confirmed registrations consume capacity; increment/decrement reserved_count atomically; prevent last-slot race and direct counter bypass | ODR-008 owner-approved default; delegated event authority pending; exact lifecycle value still needs approval |
| `trg_retention_actions_hold_guard` | Controlled transaction; lock retention_subject row FOR UPDATE | Active hold blocks disposal; recheck approved schedule and hold in same transaction | ODR-011 owner-approved default; no schedule/source enrollment until delegated approval |
| `trg_<table>_set_updated_at` | BEFORE UPDATE on mutable tables | Set updated_at from database transaction time; callers cannot backdate | TBR-01 technical baseline; exact target tables: user_accounts, members, church_memberships, events, budgets, budget_lines, service_principals, idempotency_records and pre_auth_contexts |
| Audit/recovery append-only privilege boundary | Database grants; optional defensive trigger | Runtime roles cannot UPDATE, DELETE or TRUNCATE audit_events, audit_access_events or idempotency_recovery_events | DDD-012 / D13-PDR-01 |
| Credential definition validity policy | Application transaction before version approval or activation; read the referenced credential definition | validity_policy and validity_duration consistency depends on the related definition row and is not enforceable by a row-local CHECK | ODR-009; credential authority confirmation pending |
| Finance reversal transaction | Application transaction with original financial transaction row lock | Full reversal only; same account/currency; at most one full reversal; original posted fact retained | ODR-005 owner-approved default; finance authority confirmation pending |
| Appointment approval actor check | Application transaction | Higher-authority approval; requester/appointee cannot approve own appointment | DDD-004 |
| Finance submit/approve actor check | Application transaction | Submitter cannot approve own transaction | DDD-010 |
| Explicit deny administration | Application transaction | Target actor cannot create, approve, modify or revoke own deny | DDD-005 |
| Role conflict activation | Application transaction and independent review | Prohibited pairs cannot coexist; review-required pair inactive until independent approval | DDD-005 |
| Idempotency recovery claim | READ COMMITTED transaction, row lock; 5-second lock timeout; <=10-second transaction | Atomic fencing increment and CLAIMED event; stale worker completion rejected; BIGINT overflow fails closed | AUTH-IDEM-013–021 and owner-approved overflow clarification |
| Outbox publish | Transactional outbox + worker lease | At-least-once delivery; stable event identity; consumers deduplicate; queue loss does not lose business truth | PDB-R11 / DDD-015 |

## 6. Required concurrency tests

1. Two transfers for one member cannot produce two current primary church memberships.
2. Concurrent appointment approvals for one position cannot overlap.
3. Concurrent registrations for the final event slot yield at most one confirmation.
4. Event-level and session-level attendance for one subject cannot both commit.
5. Two attendance rows cannot use a registration/session belonging to another event/member.
6. Concurrent refresh rotations yield one successor; replay of consumed token triggers approved reuse behavior.
7. Two identical idempotency claims create one identity row and one side effect.
8. Same idempotency identity with a different request fingerprint returns AUTH-IDEM-041 without execution.
9. Stale recovery worker cannot complete after a newer fencing claim.
10. BIGINT max overflow creates no claim, no counter change and no protected operation transition.
11. Finance submitter cannot approve their own transaction.
12. Concurrent full reversals produce at most one reversal.
13. Hold creation racing with retention action blocks destructive action on the same subject.
14. Duplicate provider webhook does not repeat payment or notification effect.
15. Report scope mismatch across district/church/department is rejected by composite FKs.

## 7. PostgreSQL and DDL validation boundary

- PostgreSQL 15 is the minimum design target; production provider and major version remain unconfirmed.
- No extension is required by the current proposal.
- The appointment overlap guard uses parent-row locking, not btree_gist.
- The idempotency authenticated identity index uses an immutable COALESCE expression and a reserved-zero-UUID CHECK; exact DDL and planner use still require PostgreSQL 15 validation.
- CHECK names are lower snake_case, deterministic and <=63 bytes.
- Every composite FK requires an exact ordered UNIQUE target key and exact ordered source index.
- No SQL, DDL, trigger, index or concurrency test has been executed as part of this design work.

## 8. Approval boundary

This register defines the proposed physical enforcement model. It does not authorize implementation. Final physical ERD approval and separate implementation authorization remain required.


## CPERD-02 successor lifecycle and integrity delta

Seven additional row-local CHECK candidates are defined above for appointment request/decision/termination metadata and church-transfer state/decision/cancellation metadata. The successor inventory therefore contains 60 row-local structural CHECK candidates. The original 53-check register remains unchanged as the CPERD-01-era source.

The appointment overlap guard remains serialized by the parent position row and uses approved appointment provenance plus half-open effective intervals. Rejected and pending requests do not occupy a position. Terminated appointments retain their approved provenance and have a bounded effective interval.

The church-transfer workflow locks the member serialization row before final membership replacement. The open-request unique predicate is limited to PENDING_RECEIVING_CHURCH and PENDING_DISTRICT. District approval, membership replacement, request completion, audit and outbox writes commit atomically.

All seven additions are owner-review candidates only. No CHECK, trigger or index has been created in a database.
