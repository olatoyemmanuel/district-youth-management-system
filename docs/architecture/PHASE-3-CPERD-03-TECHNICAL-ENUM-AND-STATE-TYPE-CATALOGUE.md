# DYMS Phase 3 — CPERD-03 Technical ENUM and State-Type Catalogue

- Revision: ENUM-03 Draft 0.1
- Date: 2026-11-12
- Status: **TECHNICAL CANDIDATE; RECONCILIATION IN PROGRESS; NOT APPROVED**
- Governing decision: OD-07 requires PostgreSQL ENUM for stable technical states and lookup tables for business categories.
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Purpose

This catalogue identifies columns that require a stable technical state type and separates vocabularies already evidenced by approved decisions or explicit structural candidates from vocabularies that remain unresolved.

This is not permission to invent lifecycle labels. A field marked OPEN must remain unresolved until its owning domain decision and exact state transitions are reconciled. The final physical ERD must not retain stable technical states as arbitrary VARCHAR/TEXT values with ad hoc CHECKs when OD-07 requires ENUM.

## 2. Candidate ENUM mappings with an evidenced vocabulary

| Column | Proposed PostgreSQL ENUM type | Candidate labels | Authority / qualification |
|---|---|---|---|
| `user_accounts.status` | `user_account_status` | PENDING, ACTIVE, SUSPENDED, CLOSED | Candidate labels present in inherited CHECK. Persisted ENUM type is a CPERD-03 proposal. |
| `church_memberships.status` | `church_membership_status` | ACTIVE, SUSPENDED, TERMINATED | IDX-R02 owner-approved product states. Persisted ENUM mapping is a physical-design proposal. |
| `appointments.status` | `appointment_status` | PENDING_APPROVAL, APPROVED, REJECTED, TERMINATED | Inherited CPERD-02 structural CHECK candidate; reconcile with DDD-004 and appointment lifecycle. |
| `positions.allowed_scope_type` | `organizational_scope_type` | DISTRICT, CHURCH, DEPARTMENT | Explicit allowed-scope CHECK candidate. |
| `appointments.scope_type` | `organizational_scope_type` | DISTRICT, CHURCH, DEPARTMENT | Must use the same type as positions.allowed_scope_type for FK/scope consistency. |
| `report_runs.scope_kind` | `report_scope_kind` | DISTRICT, CHURCH, DEPARTMENT | Report scope CHECK excludes GLOBAL. Persisted mapping is proposed. |
| `event_attendance_subjects.mode` | `event_attendance_subject_mode` | EVENT, SESSION | Owner-approved attendance subject mode. |
| `audit_events.actor_type` | `audit_actor_type` | USER, SYSTEM, SERVICE, ANONYMOUS | Inherited structural CHECK candidate; align with AUD-OD decisions. |
| `idempotency_records.scope_mode` | `idempotency_scope_mode` | AUTHENTICATED, PRE_AUTHENTICATION | Inherited structural CHECK candidate. |
| `idempotency_records.status` | `idempotency_record_status` | IN_PROGRESS, COMPLETED, FAILED | Inherited structural CHECK candidate. |
| `idempotency_recovery_events.event_type` | `idempotency_recovery_event_type` | CLAIMED, COMPLETED, FAILED, STALE_WORKER_REJECTED, OVERFLOW_BLOCKED | Inherited structural CHECK candidate. |
| `role_permissions.effect` | `role_permission_effect` | ALLOW | Inherited DDD-005 design: DENY is represented separately in access_denies. Single-value enum remains a technical proposal. |

## 3. State-bearing fields with unresolved vocabularies

| Column | ENUM status | Required closure |
|---|---|---|
| `federations.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `members.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `districts.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `churches.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `member_category_assignments.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `departments.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `department_eligibility_rules.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `department_memberships.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `positions.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `roles.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `permissions.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `user_role_assignments.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `access_denies.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `role_conflict_rules.outcome` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `role_conflict_reviews.decision` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `events.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `event_approvals.decision` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `event_change_records.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `event_registrations.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `event_sessions.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `attendance_records.attendance_status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `attendance_corrections.previous_status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `attendance_corrections.proposed_status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `attendance_corrections.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `notification_templates.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `notification_preferences.consent_state` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `notifications.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `notification_recipients.preference_decision` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `notification_recipients.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `integration_providers.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `notification_deliveries.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `outbox_messages.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `webhook_events.processing_status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `integration_failures.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `retention_policies.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `retention_holds.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `retention_actions.outcome` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `report_definitions.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `report_runs.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `retention_subjects.lifecycle_state` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `service_principals.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `idempotency_records.recovery_state` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `member_category_eligibility_rules.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |
| `report_data_owners.status` | OPEN | Vocabulary and lifecycle authority not yet reconciled. Do not invent labels or implement a VARCHAR+CHECK substitute. |

## 4. Business classifications are not automatically ENUMs

The following are candidate lookup/catalogue concepts unless a technical review establishes they are fixed technical states: event_type, notification channel/category, notification purpose, attendance method, retention record_category, report classification, report/export purpose, integration failure type, and provider identity. Do not encode configurable business categories as PostgreSQL ENUMs merely because they have a finite current list.

## 5. Required consistency checks

1. Every candidate ENUM type is defined once and reused only where semantic meaning is identical.
2. Every state-bearing column in the physical column register is classified as ENUM, lookup FK, or explicitly unresolved.
3. Every persisted ENUM label matches the lifecycle catalogue, CHECK/trigger register, index predicates, API contract and requirements exactly.
4. No unused or contradictory labels remain.
5. A transition table defines allowed from/to states, actor, preconditions, history and terminal behavior.
6. No disabled DYMS 1.0 workflow receives active states or tables.
7. PostgreSQL ENUM alteration/versioning implications are documented before implementation approval.

**Status: DRAFT 0.1 — NOT APPROVED.**
