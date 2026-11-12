# DYMS Phase 3 — CPERD-03 Physical Integrity, CHECK and Trigger Register

- Revision: PITR-03 Draft 0.1
- Date: 2026-11-12
- Status: **SUCCESSOR CANDIDATE; RECONCILIATION IN PROGRESS; NOT APPROVED**
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Authority

This candidate is derived from the CPERD-02 physical integrity and trigger register. It removes Church Transfer, finance/payment/budget and credential issuance/evidence enforcement. It retains only the first-pass checks and controls associated with DYMS 1.0 included domains.

The inherited constraints are candidates, not certified final predicates. Every predicate must be reconciled with the CPERD-03 columns, ENUM catalogue, FK register, index inventory, lifecycle catalogue, API contract and approved decisions.

## 2. Enforcement classes

| Class | Meaning |
|---|---|
| CHECK | Deterministic single-row predicate. Must not query other rows or call volatile functions. |
| UNIQUE / partial UNIQUE | Candidate identity or concurrency-safe duplicate prevention. See CPERD-03 index inventory. |
| FOREIGN KEY | Referential and composite organizational-scope integrity. See CPERD-03 FK register. |
| TRIGGER | Cross-row invariant or trusted timestamp/append-only guard with documented execution context and lock strategy. |
| TRANSACTION / APPLICATION | Actor authorization, lifecycle transition or multi-row invariant enforced atomically. |
| PRIVILEGE / OPERATIONS | Database role separation, backup, retention, rate limits, secrets and external controls. |

## 3. Retained structural CHECK candidates

| auth_sessions | `ck_auth_sessions_expiry_order` | inactivity_expires_at <= absolute_expires_at | DFR-004 structural |
| auth_session_tokens | `ck_auth_session_tokens_generation_positive` | token_generation > 0 | Structural |
| password_reset_tokens | `ck_password_reset_tokens_expiry_order` | expires_at > created_at | DFR-004 structural |
| pre_auth_contexts | `ck_pre_auth_contexts_expiry_window` | expires_at > created_at AND expires_at <= created_at + 10 minutes | AUTH-IDEM-026/036 |
| pre_auth_contexts | `ck_pre_auth_contexts_secret_digest_shape` | secret_digest is NULL only after secret_erased_at is set; non-NULL digest is exactly 32 bytes | AUTH-IDEM-026/036 |
| idempotency_records | `ck_idempotency_records_scope_mode_identity` | AUTHENTICATED requires actor and no pre-auth context; PRE_AUTHENTICATION requires context and no actor/session | AUTH-IDEM-004/026/038 |
| idempotency_records | `ck_idempotency_records_fencing_nonnegative` | fencing_counter >= 0 | AUTH-IDEM-016 |
| idempotency_records | `ck_idempotency_records_session_not_reserved` | session_id IS NULL OR session_id <> reserved zero UUID | D13-PDR-01 |
| idempotency_records | `ck_idempotency_records_scope_fingerprint_length` | octet_length(scope_fingerprint) = 32 and version is supported | D13-PDR-01 |
| idempotency_records | `ck_idempotency_records_key_digest_length` | octet_length(key_digest) = 32 | AUTH-IDEM-003/035 |
| idempotency_records | `ck_idempotency_records_request_fingerprint_length` | octet_length(request_fingerprint) = 32 | AUTH-IDEM-005–008 |
| idempotency_records | `ck_idempotency_records_terminal_metadata` | IN_PROGRESS has no completed_at; COMPLETED/FAILED require completed_at and response/tombstone expiry metadata | AUTH-IDEM-010–014 |
| idempotency_recovery_events | `ck_idempotency_recovery_events_fencing_positive` | fencing_counter > 0 | AUTH-IDEM-016 |
| outbox_messages | `ck_outbox_password_reset_reference_set` | PASSWORD_RESET delivery requires idempotency_record_id, password_reset_token_id and protected_secret_reference; unrelated purposes must not carry reset-only references | AUTH-IDEM-039 |
| outbox_messages | `ck_outbox_messages_event_version_positive` | event_version > 0 | PDB-R11 |
| outbox_messages | `ck_outbox_messages_attempt_count_nonnegative` | attempt_count >= 0 | PDB-R11 |
| appointments | `ck_appointments_decision_metadata` | PENDING_APPROVAL: approved/rejected actor, time and rejection reason all NULL; APPROVED or TERMINATED: approved actor/time NOT NULL and rejection fields NULL; REJECTED: approved fields NULL, rejected actor/time NOT NULL and non-empty rejection reason | CPERD-16 successor candidate |
| appointments | `ck_appointments_termination_metadata` | TERMINATED requires terminated actor/time and non-empty termination reason; all three are NULL for every other status | CPERD-16 successor candidate |
| member_category_assignments | `ck_member_category_assignments_effective_interval` | effective_to IS NULL OR effective_to > effective_from | DDD-002 |
| member_category_eligibility_rules | `ck_member_category_eligibility_rules_effective_interval` | effective_to IS NULL OR effective_to > effective_from | ODR-001; rule remains inactive until authority approval |
| church_memberships | `ck_church_memberships_effective_interval` | effective_to IS NULL OR effective_to > effective_from | DDD-003 |
| appointments | `ck_appointments_term_interval` | term_end >= term_start | DDD-004 |
| appointments | `ck_appointments_effective_interval` | effective_to IS NULL OR effective_to > effective_from | DDD-004 |
| events | `ck_events_capacity_nonnegative` | capacity IS NULL OR capacity >= 0 | EVT-004 / ODR-008 |
| events | `ck_events_reserved_count_nonnegative` | reserved_count >= 0 | EVT-004 / ODR-008 |
| events | `ck_events_time_order` | ends_at > starts_at | Structural |
| events | `ck_events_registration_window` | registration_closes_at IS NULL OR registration_opens_at IS NULL OR registration_closes_at >= registration_opens_at | Structural |
| event_sessions | `ck_event_sessions_time_order` | ends_at > starts_at | Structural |
| attendance_records | `ck_attendance_records_registration_evidence` | registration_id present iff exception actor/reason/time are all absent; missing registration requires all three exception fields and a non-empty reason | ATT-007 / TBR-01 |
| positions | `ck_positions_scope_shape` | district_id is always NOT NULL; DISTRICT requires church_id/department_id NULL; CHURCH requires church_id NOT NULL and department_id NULL; DEPARTMENT requires department_id NOT NULL and church_id NULL | DDD-004 technical scope |
| appointments | `ck_appointments_scope_shape` | district_id and scope_type are NOT NULL; DISTRICT requires child scope IDs NULL; CHURCH requires church_id only; DEPARTMENT requires department_id only. Composite FKs prove scope_type/IDs match the position. | DDD-004 technical scope |
| user_role_assignments | `ck_user_role_assignments_exactly_one_owner_scope` | Exactly one valid organizational scope is populated | DDD-005 |
| access_denies | `ck_access_denies_exactly_one_owner_scope` | Exactly one valid organizational scope is populated | DDD-005 |
| member_category_eligibility_rules | `ck_member_category_eligibility_rules_approval_pair` | approved_by_user_account_id and approved_at are both NULL or both NOT NULL | ODR-001; no rule activates without approval |

## 4. ENUM-backed technical states

Stable technical state vocabularies are defined in the CPERD-03 Technical ENUM and State-Type Catalogue. The following legacy VARCHAR/TEXT state CHECKs are superseded by candidate PostgreSQL ENUM types and are not duplicated as CHECK constraints: appointment status, user-account status, audit actor type, event attendance subject mode, position/appointment scope type, role-permission effect, idempotency scope mode/status and idempotency recovery event type. Cross-column metadata and scope-shape CHECKs remain separate where required.

## 5. Owner-approved membership invariant

IDX-R02 controls current church membership:
- ACTIVE is current.
- SUSPENDED and TERMINATED are not current.
- Reactivation restores the same suspended membership row to ACTIVE.
- One member cannot have more than one ACTIVE church membership.
- History is preserved.
- Church Transfer is excluded.

The unique index predicate must enforce exactly the ACTIVE state. The same state labels must be used in the column register, lifecycle catalogue, API contract and requirements. Do not retain a transfer-open-state predicate.

## 6. Organizational ownership and scope constraints

- Federation → District → Local Church is the required hierarchy.
- Each district has one required federation_id.
- District code uniqueness is scoped to (federation_id, code).
- Each church has one required district_id; church code uniqueness is scoped to (district_id, code).
- Department ownership remains district-level.
- Events are district-owned or church-owned; departments organize but do not own events.
- Composite FKs must prove child ownership matches the parent district. Authorization scope is separately enforced server-side.
- Federation access remains read-only oversight.

## 7. Trigger and transactional enforcement candidates

| Trigger / operation | Timing and lock | Invariant | Authority / status |
|---|---|---|---|
| `trg_appointments_prevent_overlap` | BEFORE INSERT OR UPDATE; lock parent position row FOR UPDATE | Approved appointment intervals for the same position cannot overlap; half-open intervals; adjacent intervals allowed | DDD-004 core rule approved; trigger design remains subject to final physical review |
| `trg_attendance_records_enforce_subject_mode` | BEFORE INSERT OR UPDATE; lock event_attendance_subjects row FOR UPDATE | EVENT mode requires no session; SESSION mode requires a same-event session; one subject cannot mix modes | Candidate; reconcile exact approved attendance mode semantics |
| Event registration capacity transaction | Application transaction; lock events row FOR UPDATE before registration mutation | Confirmed registrations consume capacity; reserved_count updates atomically; prevent last-slot race | Candidate; reconcile registration states and capacity predicate |
| Retention disposal transaction | Application transaction; lock retention subject row FOR UPDATE | Active hold blocks disposal; recheck approved schedule and source enrollment atomically | Disposal execution remains disabled until approved schedule and source enrollment are configured |
| `trg_<table>_set_updated_at` | BEFORE UPDATE; trusted database/server timestamp | Set updated_at from trusted time source; callers cannot backdate | Candidate target tables: federations, user_accounts, members, church_memberships, events, service_principals, idempotency_records and pre_auth_contexts; exact trigger function/privilege contract remains to be reconciled |
| Audit/recovery append-only privilege boundary | Database grants; no trigger selected | Runtime/worker roles cannot UPDATE, DELETE or TRUNCATE audit_events, audit_access_events or idempotency_recovery_events | AUD-OD governance approval; database role model requires independent verification |
| Appointment approval actor check | Application transaction | Higher-authority approval; requester/appointee cannot approve own appointment | DDD-004 |
| Explicit deny administration | Application transaction | Target actor cannot administer own explicit deny | DDD-005 |
| Role conflict activation | Application transaction and independent review | Prohibited pairs cannot coexist; review-required pair remains inactive until independent approval | DDD-005 |
| Idempotency recovery claim | READ COMMITTED transaction, row lock; bounded lock/transaction timeout | Atomic fencing increment and CLAIMED event; stale worker completion rejected; overflow fails closed | AUTH-IDEM controls; exact values remain subject to approved source contract |
| Outbox publish | Transactional outbox + worker lease | At-least-once delivery; stable event identity; consumers deduplicate | DDD-015 |

## 8. Required verification

1. Every CHECK references an existing CPERD-03 column and valid type.
2. Stable technical state checks are represented by PostgreSQL ENUM types under OD-07, not redundant VARCHAR+CHECK state catalogues.
3. Every partial unique predicate uses an exact lifecycle state from the lifecycle catalogue.
4. Every composite FK has an exact ordered UNIQUE target key and matching source index.
5. Every trigger has owner, timing, execution context, lock strategy, recursion boundary and side-effect policy.
6. Audit append-only privileges are verified against actual database roles during post-authorization implementation testing.
7. Concurrency cases cover appointment overlap, current membership, event capacity, attendance mode, refresh rotation, idempotency recovery, retention holds and duplicate webhook delivery.
8. No finance, transfer or credential issuance/evidence constraint, trigger or test remains active in DYMS 1.0.
9. Static verification is independent of the source transformation and reports all discrepancies.

## 9. PostgreSQL validation boundary

PostgreSQL 15 remains the minimum design target. No SQL, DDL, trigger, index or concurrency test has been executed as part of CPERD-03 documentation work. Runtime and concurrency testing are implementation-stage tasks after final physical ERD approval and within the separately granted implementation authorization.

**Status: DRAFT 0.2 — NOT APPROVED.**
