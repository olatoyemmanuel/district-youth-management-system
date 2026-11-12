# DYMS Phase 3 — CPERD-03 Technical ENUM and State-Type Catalogue

- Revision: ENUM-03 Draft 0.2
- Date: 2026-11-12
- Status: **TECHNICAL CANDIDATE; RECONCILIATION IN PROGRESS; NOT APPROVED**
- Governing decision: OD-07 requires PostgreSQL ENUM for stable technical states and lookup tables for business categories.
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Purpose

This catalogue reconciles stable technical state columns against the CPERD-03 lifecycle candidate. It distinguishes owner-approved product behavior from proposed persisted labels. Candidate lifecycle values are not automatically approved database ENUM labels.

A field with an OPEN or CONFLICT vocabulary must not be finalized. It remains a closure item for the owning domain/API contract. Business categories and configurable classifications must use lookup/catalogue data rather than PostgreSQL ENUMs where values evolve.

## 2. State-column to ENUM mapping

| Column | Proposed PostgreSQL ENUM type | Candidate labels / status | Authority and qualification |
|---|---|---|---|
| `user_accounts.status` | `user_account_status` | PENDING, ACTIVE, SUSPENDED, CLOSED | Candidate labels in inherited physical CHECK and lifecycle catalogue; persisted ENUM proposal, owner approval pending. |
| `church_memberships.status` | `church_membership_status` | ACTIVE, SUSPENDED, TERMINATED | IDX-R02 owner-approved product states; persisted ENUM mapping remains a physical-design proposal. |
| `appointments.status` | `appointment_status` | PENDING_APPROVAL, APPROVED, REJECTED, TERMINATED | Candidate lifecycle and appointment decision metadata; exact persisted mapping requires final reconciliation. |
| `positions.allowed_scope_type` | `organizational_scope_type` | DISTRICT, CHURCH, DEPARTMENT | Explicit scope catalogue; shared with appointments.scope_type. |
| `appointments.scope_type` | `organizational_scope_type` | DISTRICT, CHURCH, DEPARTMENT | Must use same enum as positions.allowed_scope_type. |
| `report_runs.scope_kind` | `report_scope_kind` | DISTRICT, CHURCH, DEPARTMENT | Standard persisted report-run scope; Federation oversight remains a separate read-only query surface. |
| `event_attendance_subjects.mode` | `event_attendance_subject_mode` | EVENT, SESSION | Owner-approved attendance subject mode. |
| `audit_events.actor_type` | `audit_actor_type` | USER, SYSTEM, SERVICE, ANONYMOUS | Candidate labels from audit actor contract; cross-column identity check remains separate. |
| `idempotency_records.scope_mode` | `idempotency_scope_mode` | AUTHENTICATED, PRE_AUTHENTICATION | Candidate labels from authentication idempotency contract. |
| `idempotency_records.status` | `idempotency_record_status` | CONFLICT: IN_PROGRESS, COMPLETED, FAILED in inherited CHECK vs IN_PROGRESS, COMPLETED, FAILED_RETRYABLE, EXPIRED in lifecycle catalogue | BLOCKED. Do not finalize persisted labels until the two source contracts are reconciled. |
| `idempotency_recovery_events.event_type` | `idempotency_recovery_event_type` | CLAIMED, COMPLETED, FAILED, STALE_WORKER_REJECTED, OVERFLOW_BLOCKED | Candidate labels from integrity contract. |
| `role_permissions.effect` | `role_permission_effect` | ALLOW | DENY is a separate access_denies record; one-value ENUM remains a technical proposal. |
| `member_category_assignments.status` | `member_category_assignment_status` | PENDING, ACTIVE, ENDED, REVOKED | Lifecycle proposal; one ACTIVE primary category per member; owner approval of persisted labels pending. |
| `department_eligibility_rules.status` | `department_eligibility_rule_status` | DRAFT, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN | Lifecycle proposal; rule cannot activate without authority/source evidence. |
| `department_memberships.status` | `department_membership_status` | REQUESTED, ACTIVE, WITHDRAWAL_REQUESTED, ENDED, REJECTED | Candidate vocabulary only; final transitions remain policy/design open. |
| `roles.status` | `role_status` | DRAFT, ACTIVE, RETIRED | Lifecycle proposal; role catalogue governance remains to be completed. |
| `permissions.status` | `permission_status` | DRAFT, ACTIVE, RETIRED | Lifecycle proposal; permission catalogue governance remains to be completed. |
| `user_role_assignments.status` | `user_role_assignment_status` | PENDING, ACTIVE, EXPIRED, REVOKED, REJECTED | Lifecycle proposal; grant/expiry transitions require final API mapping. |
| `access_denies.status` | `access_deny_status` | ACTIVE, EXPIRED, REVOKED | Derived from approved DDD-005 deny lifecycle; permanent deny review remains open. |
| `role_conflict_reviews.decision` | `role_conflict_review_decision` | APPROVED, REJECTED, REVOKED | Lifecycle proposal; reviewer independence and validity remain open. |
| `events.status` | `event_status` | DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, CANCELLED, COMPLETED, CLOSED | Lifecycle proposal; exact local-church and postponement behavior remains open. |
| `event_approvals.decision` | `event_approval_decision` | APPROVED, REJECTED | Lifecycle proposal; each decision is an immutable history row. |
| `event_change_records.status` | `event_change_status` | SUBMITTED, APPROVED, REJECTED, WITHDRAWN, APPLIED | Lifecycle proposal; APPLIED is distinct from approval. |
| `event_registrations.status` | `event_registration_status` | SUBMITTED, CONFIRMED, CANCELLED, REJECTED | Lifecycle proposal; capacity-consuming predicate remains unresolved. |
| `event_sessions.status` | `event_session_status` | SCHEDULED, OPEN, CLOSED, CANCELLED | Lifecycle proposal; session operational transitions remain open. |
| `attendance_records.attendance_status` | `attendance_status` | OPEN: exact attendance vocabulary TBD | Lifecycle catalogue explicitly leaves attendance status unresolved; present/absent/other labels must not be invented. |
| `attendance_corrections.previous_status` | `attendance_status` | OPEN: inherits the approved attendance_status vocabulary | Must use same type as attendance_records.attendance_status. |
| `attendance_corrections.proposed_status` | `attendance_status` | OPEN: inherits the approved attendance_status vocabulary | Must use same type as attendance_records.attendance_status. |
| `attendance_corrections.status` | `attendance_correction_status` | REQUESTED, APPROVED, REJECTED, APPLIED | Lifecycle proposal; original attendance fact remains preserved. |
| `notification_templates.status` | `notification_template_status` | DRAFT, ACTIVE, RETIRED | Lifecycle proposal; used template versions are immutable. |
| `notification_preferences.consent_state` | `notification_consent_state` | UNKNOWN, GRANTED, DENIED, WITHDRAWN | Lifecycle proposal; optional channels require applicable consent. |
| `notifications.status` | `notification_status` | PENDING, PROCESSING, ACCEPTED, DELIVERED, FAILED, EXHAUSTED, CANCELLED | Lifecycle proposal; ACCEPTED is not proof of delivery. |
| `notification_recipients.preference_decision` | `notification_preference_decision` | PENDING, ELIGIBLE, SUPPRESSED | Candidate preference evaluation outcomes; confirm exact transition contract. |
| `notification_recipients.status` | `notification_recipient_status` | PENDING, ELIGIBLE, SUPPRESSED, COMPLETED, FAILED | Lifecycle proposal. |
| `integration_providers.status` | `integration_provider_status` | CONFIGURED, ACTIVE, DISABLED, SUSPENDED | Lifecycle proposal; provider secrets remain outside the database. |
| `notification_deliveries.status` | `notification_delivery_status` | PENDING, PROCESSING, ACCEPTED, DELIVERED, FAILED, EXHAUSTED, CANCELLED | Lifecycle proposal; provider acceptance is distinct from delivery. |
| `outbox_messages.status` | `outbox_message_status` | PENDING, PROCESSING, PUBLISHED, RETRY_WAIT, EXHAUSTED, DEAD_LETTERED | Lifecycle proposal; retry ceilings remain operational settings. |
| `webhook_events.processing_status` | `webhook_processing_status` | RECEIVED, VERIFIED, REJECTED, PROCESSING, PROCESSED, FAILED | Lifecycle proposal; signature and replay checks remain mandatory. |
| `integration_failures.status` | `integration_failure_status` | OPEN, RETRYING, RESOLVED, EXHAUSTED, DISMISSED | Lifecycle proposal; retry ceiling and alert thresholds remain operational. |
| `retention_policies.status` | `retention_policy_status` | DRAFT, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN | Lifecycle proposal; no schedule activation without approved source/duration. |
| `retention_holds.status` | `retention_hold_status` | ACTIVE, RELEASED, EXPIRED | Lifecycle proposal; release authority must be designated. |
| `retention_actions.outcome` | `retention_action_outcome` | REQUESTED, APPROVED, BLOCKED_BY_HOLD, EXECUTED, REJECTED, FAILED | Lifecycle proposal; permanent disposal remains disabled without schedule/source enrollment. |
| `report_definitions.status` | `report_definition_status` | DRAFT, ACTIVE, RETIRED | Lifecycle proposal; report-specific catalogue approval remains open. |
| `report_runs.status` | `report_run_status` | QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED, EXPIRED | Lifecycle proposal; export lifecycle remains separately authorized. |
| `member_category_eligibility_rules.status` | `member_category_eligibility_status` | DRAFT, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN | Lifecycle proposal; no eligibility rules seeded. |
| `federations.status` | `federation_status` | OPEN: lifecycle vocabulary not defined | Do not invent federation activation/retirement policy. |
| `members.status` | `member_status` | OPEN: lifecycle vocabulary not defined | Member lifecycle remains distinct from user-account lifecycle. |
| `districts.status` | `district_status` | OPEN: lifecycle vocabulary not defined | District activation/deactivation governance unresolved. |
| `churches.status` | `church_status` | OPEN: lifecycle vocabulary not defined | Church closure/merger behavior unresolved. |
| `departments.status` | `department_status` | OPEN: lifecycle vocabulary not defined | Department activation/closure governance unresolved. |
| `positions.status` | `position_status` | OPEN: lifecycle vocabulary not defined | Position catalogue lifecycle unresolved. |
| `role_conflict_rules.outcome` | `role_conflict_outcome` | OPEN: outcome vocabulary not reconciled | Do not confuse rule outcome with lifecycle status. |
| `retention_subjects.lifecycle_state` | `retention_subject_lifecycle_state` | OPEN: lifecycle vocabulary not defined | No source enrollment or deletion behavior is implied. |
| `service_principals.status` | `service_principal_status` | OPEN: lifecycle vocabulary not defined | Service-principal provisioning/revocation policy unresolved. |
| `idempotency_records.recovery_state` | `idempotency_recovery_state` | OPEN: operational summary vocabulary not reconciled | Not equivalent to idempotency_records.status. |
| `report_data_owners.status` | `report_data_owner_status` | OPEN: lifecycle vocabulary not defined | Owner approval and replacement history unresolved. |

## 3. Business classifications and catalogue values

The following fields are not automatically ENUMs. Treat them as controlled lookup/catalogue data or explicitly reviewed bounded text contracts: events.event_type, event_registrations.registration_channel, attendance_records.method, notification_templates.channel, notification_preferences.channel/category, notifications.category, outbox_messages.event_type/delivery_purpose, webhook_events.event_type, audit_access_events.purpose, retention_policies.record_category, report_definitions.classification, report_export_audits.destination_classification/purpose, and integration failure/provider classifications.

## 4. Required reconciliation

1. Every status/state/mode/decision/outcome field in the column register appears exactly once in this catalogue.
2. Reuse an ENUM type only when two fields have identical semantics and lifecycle.
3. Resolve the idempotency status conflict between the integrity CHECK candidate and lifecycle catalogue before approving the type.
4. Resolve all OPEN vocabularies from the owning domain decision and API transition contract.
5. Ensure CHECKs do not duplicate ENUM value restrictions. Cross-column metadata and scope-shape CHECKs remain valid where required.
6. Ensure partial unique predicates use exact ENUM labels, including IDX-R02 ACTIVE membership.
7. Keep business categories in lookup tables and do not encode mutable ministry eligibility or official credential standards as ENUM values.
8. Record PostgreSQL ENUM evolution/versioning implications before implementation.

**Status: DRAFT 0.2 — NOT APPROVED.**
