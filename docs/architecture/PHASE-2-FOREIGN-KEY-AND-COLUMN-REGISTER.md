# DYMS Phase 2 Foreign-Key and Column Register

**Status:** Canonical reconciliation proposal, incomplete where source definitions are abbreviated or policy-blocked  
**Scope:** 65 physical tables, DYMS v1.0, Sango District  
**Implementation:** NOT AUTHORIZED

## 1. Purpose and authority

This register translates the current physical table proposals into explicit source-column to target-column relationships. It is intended to be reconciled with:
- [Physical Database Design](./PHASE-2-PHYSICAL-DATABASE-DESIGN.md)
- [Relational Integrity Matrix](./PHASE-2-RELATIONAL-INTEGRITY-MATRIX.md)
- [High-Severity Remediation](./PHASE-2-HIGH-SEVERITY-RELATIONAL-INTEGRITY-REMEDIATION.md)
- [Medium-Severity Remediation](./PHASE-2-MEDIUM-SEVERITY-RELATIONAL-INTEGRITY-REMEDIATION.md)

This is not SQL DDL. The FK actions below are proposed defaults. The register does not resolve policy questions by implication.

## 2. Global FK action and index policy

- Proposed `ON DELETE RESTRICT` and `ON UPDATE RESTRICT` for every relationship in this register. Historical records are preserved; lifecycle changes use explicit closure, revocation, reversal, or retention workflows.
- No cascade delete is proposed.
- Every FK column set must have a supporting B-tree index unless a primary-key or unique index with a suitable left-prefix already provides the access path. A composite FK requires an index beginning with the same source-column order.
- Proposed supporting index names follow `ix_fk_<table>_<source_columns>`. All names must be unique and remain within PostgreSQL's 63-byte identifier limit. If a readable logical name exceeds the limit, use a deterministic shortened table/column token plus a stable six-character hash derived from the full logical name. Do not use arbitrary ordinal suffixes or rely on silent PostgreSQL truncation. Where several actor FKs point to the same target table, each independently queried actor column receives its own index unless a wider suitable left-prefix index or workload review documents otherwise.
- Composite FK targets must have a matching PK/UNIQUE candidate key with the exact ordered columns.
- Nullable FK means the relationship is optional at the point represented. It does not authorize deletion of the referenced row.
- The final DDL review must verify every index against query plans and avoid redundant indexes.

## 3. Canonical FK register

| Table | Source column(s) | Target column(s) | Nullability / scope | Proposed supporting index |
|---|---|---|---|---|
| `user_accounts` | None | — | No parent FK | — |
| `members` | `user_account_id` | `user_accounts(id)` | NOT NULL, UNIQUE | `uq_members_user_account`; RESTRICT/RESTRICT for every listed FK |
| `auth_sessions` | `user_account_id` | `user_accounts(id)` | NOT NULL | `ix_fk_auth_sessions_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `auth_session_tokens` | `auth_session_id` | `auth_sessions(id)` | NOT NULL | `ix_fk_auth_session_tokens_auth_session_id`; RESTRICT/RESTRICT for every listed FK |
| `password_reset_tokens` | `user_account_id` | `user_accounts(id)` | NOT NULL | `ix_fk_password_reset_tokens_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `districts` | None | — | No parent FK | — |
| `churches` | `district_id` | `districts(id)` | NOT NULL | `ix_fk_churches_district_id`; candidate UNIQUE `(id,district_id)`; RESTRICT/RESTRICT for every listed FK |
| `member_categories` | None | — | No parent FK | — |
| `member_category_assignments` | `member_id`; `member_category_id`; `assigned_by_user_account_id` | `members(id)`; `member_categories(id)`; `user_accounts(id)` | All NOT NULL | `ix_fk_member_category_assignments_member_id`; `ix_fk_member_category_assignments_member_category_id`; `ix_fk_member_category_assignments_assigned_by_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `church_memberships` | `member_id`; `church_id`; `initiated_by_user_account_id`; `accepted_by_user_account_id`; `approved_by_user_account_id` | `members(id)`; `churches(id)`; `user_accounts(id)` for each actor | Member/church/initiator NOT NULL; acceptor/approver NULL | `ix_fk_church_memberships_member_id`; `ix_fk_church_memberships_church_id`; actor indexes for initiator, acceptor, approver; RESTRICT/RESTRICT for every listed FK |
| `church_transfer_requests` | `member_id`; `source_church_id`; `receiving_church_id`; `requested_by_user_account_id`; `receiving_decided_by_user_account_id`; `district_decided_by_user_account_id` | `members(id)`; `churches(id)` for both church columns; `user_accounts(id)` for each actor | Member/source/receiving/requester NOT NULL; decision actors NULL | One index per source FK column using `ix_fk_church_transfer_requests_<column>`; RESTRICT/RESTRICT for every listed FK |
| `departments` | `district_id`; `church_id` | `districts(id)`; `churches(id)` | District NOT NULL; church NULL. If both are stored, require composite FK `(church_id,district_id) → churches(id,district_id)` | `ix_fk_departments_district_id`; `ix_fk_departments_church_id`; RESTRICT/RESTRICT for every listed FK |
| `department_eligibility_rules` | `department_id` | `departments(id)` | NOT NULL | `ix_fk_department_eligibility_rules_department_id`; RESTRICT/RESTRICT for every listed FK |
| `department_memberships` | `member_id`; `department_id`; `requested_by_user_account_id`; `approved_by_user_account_id`; `ended_by_user_account_id`; `eligibility_rule_id` | `members(id)`; `departments(id)`; `user_accounts(id)` for actor columns; `department_eligibility_rules(id)` | Member/department/requester NOT NULL; approver/ender/rule NULL | One index per FK column using `ix_fk_department_memberships_<column>`; RESTRICT/RESTRICT for every listed FK |
| `positions` | `district_id`; `church_id`; `department_id` | `districts(id)`; `churches(id)`; `departments(id)` | Exactly one scope FK NOT NULL per row; all three columns individually nullable. Department and church hierarchy must be inherited from referenced parent, not duplicated inconsistently. | `ix_fk_positions_district_id`; `ix_fk_positions_church_id`; `ix_fk_positions_department_id`; RESTRICT/RESTRICT for every listed FK |
| `appointments` | `position_id`; `appointee_member_id`; `appointing_authority_user_account_id`; `approved_by_user_account_id` | `positions(id)`; `members(id)`; `user_accounts(id)` for both authority columns | All NOT NULL. Appointment scope is inherited from position; no duplicated scope FK | `ix_fk_appointments_position_id`; `ix_fk_appointments_appointee_member_id`; separate authority and approver indexes; RESTRICT/RESTRICT for every listed FK |
| `roles` | None | — | No parent FK | — |
| `permissions` | None | — | No parent FK | — |
| `role_permissions` | `role_id`; `permission_id` | `roles(id)`; `permissions(id)` | Both NOT NULL | `uq_role_permissions_role_permission` supports `role_id` by left prefix only; `ix_fk_role_permissions_permission_id` separately supports `permission_id`; RESTRICT/RESTRICT for both FKs |
| `user_role_assignments` | `user_account_id`; `role_id`; `granted_by_user_account_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `roles(id)`; `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | User/role/grantor NOT NULL; exactly one of district/church/department scope FKs populated; composite hierarchy binding required where scope stores parent context | Separate source indexes for each FK; `ix_user_role_assignments_user_scope` covers user lookup only; RESTRICT/RESTRICT for every FK |
| `appointment_role_links` | `appointment_id`; `role_id`; `created_by_user_account_id` | `appointments(id)`; `roles(id)`; `user_accounts(id)` | All NOT NULL | UNIQUE `(appointment_id,role_id,mapping_version)`; `ix_fk_appointment_role_links_role_id`; `ix_fk_appointment_role_links_created_by_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `access_denies` | `target_user_account_id`; `permission_id`; `district_id`; `church_id`; `department_id`; `issued_by_user_account_id`; `reviewed_by_user_account_id` | `user_accounts(id)`; `permissions(id)`; `districts(id)`; `churches(id)`; `departments(id)`; `user_accounts(id)`; `user_accounts(id)` | Target/permission/issuer NOT NULL; reviewer NULL; exactly one scope FK populated | Separate source indexes for every FK; `ix_access_denies_target_scope` covers target/permission leading pair for lookup, not each FK independently; RESTRICT/RESTRICT for every FK |
| `role_conflict_rules` | `role_a_id`; `role_b_id` | `roles(id)` for both | Both NOT NULL | UNIQUE canonical role pair/version supports both; RESTRICT/RESTRICT for every listed FK |
| `role_conflict_reviews` | `user_account_id`; `role_conflict_rule_id`; `reviewed_by_user_account_id` | `user_accounts(id)`; `role_conflict_rules(id)`; `user_accounts(id)` | All NOT NULL | `ix_fk_role_conflict_reviews_user_account_id`; `ix_fk_role_conflict_reviews_role_conflict_rule_id`; `ix_fk_role_conflict_reviews_reviewed_by_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `events` | `district_id`; `church_id`; `department_id`; `created_by_user_account_id` | `districts(id)`; `churches(id)`; `departments(id)`; `user_accounts(id)` | Exactly one permitted owner FK populated; creator NOT NULL; owner scope validity remains subject to ODR-004 | Separate scope FK indexes and creator index; RESTRICT/RESTRICT for every FK |
| `event_approvals` | `event_id`; `reviewer_user_account_id` | `events(id)`; `user_accounts(id)` | Both NOT NULL | `ix_fk_event_approvals_event_id`; `ix_fk_event_approvals_reviewer_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `event_change_records` | `event_id`; `requested_by_user_account_id`; `approved_by_user_account_id` | `events(id)`; `user_accounts(id)` for both actors | Event/requester NOT NULL; approver NULL | One index per FK column; RESTRICT/RESTRICT for every listed FK |
| `event_registrations` | `event_id`; `member_id` | `events(id)`; `members(id)` | Both NOT NULL; candidate UNIQUE `(id,event_id,member_id)` | `ix_fk_event_registrations_event_id`; `ix_fk_event_registrations_member_id`; RESTRICT/RESTRICT for every listed FK |
| `event_sessions` | `event_id` | `events(id)` | NOT NULL; UNIQUE `(id,event_id)` | `ix_fk_event_sessions_event_id`; RESTRICT/RESTRICT for every listed FK |
| `event_attendance_subjects` | `event_id`; `member_id`; `created_by_user_account_id` | `events(id)`; `members(id)`; `user_accounts(id)` | All NOT NULL; UNIQUE `(event_id,member_id)` and `(id,event_id,member_id)` | UNIQUE keys support event/member subject lookup; `ix_fk_event_attendance_subjects_created_by_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `attendance_records` | `attendance_subject_id,event_id,member_id`; `registration_id,event_id,member_id`; `event_session_id,event_id`; `recorded_by_user_account_id` | `event_attendance_subjects(id,event_id,member_id)`; `event_registrations(id,event_id,member_id)`; `event_sessions(id,event_id)`; `user_accounts(id)` | Subject tuple and recorder NOT NULL; registration and session tuples nullable only as complete tuples; `event_id` and `member_id` remain columns in the mandatory subject tuple but have no duplicate standalone FKs | Full-tuple indexes on `(attendance_subject_id,event_id,member_id)`, `(registration_id,event_id,member_id)` where present, `(event_session_id,event_id)` where present; RESTRICT/RESTRICT for all declared FKs |
| `attendance_corrections` | `attendance_record_id`; `requested_by_user_account_id`; `approved_by_user_account_id` | `attendance_records(id)`; `user_accounts(id)` for both actors | Record/requester NOT NULL; approver NULL | `ix_fk_attendance_corrections_attendance_record_id`; requester/approver indexes; RESTRICT/RESTRICT for every listed FK |
| `financial_accounts` | `district_id`; `church_id`; `currency_code` | `districts(id)`; `churches(id)`; `currencies(code)` | Exactly one district/church owner; currency NOT NULL | `ix_fk_financial_accounts_district_id`; `ix_fk_financial_accounts_church_id`; `ix_fk_financial_accounts_currency_code`; RESTRICT/RESTRICT for every listed FK |
| `currencies` | None | — | Primary reference catalogue | — |
| `financial_transactions` | `financial_account_id,currency_code`; `submitted_by_user_account_id`; `posted_by_user_account_id` | `financial_accounts(id,currency_code)`; `user_accounts(id)` for submitter/poster | Account/currency and submitter NOT NULL; poster NULL. Candidate UNIQUE `(id,currency_code)` and `(id,financial_account_id,currency_code)` | Composite account/currency index via candidate key; submitter/poster indexes; RESTRICT/RESTRICT for every listed FK |
| `transaction_revisions` | `financial_transaction_id`; `requested_by_user_account_id` | `financial_transactions(id)`; `user_accounts(id)` | Both NOT NULL | UNIQUE `(financial_transaction_id,revision_number)`; requester index; RESTRICT/RESTRICT for every listed FK |
| `transaction_approvals` | `financial_transaction_id`; `approver_user_account_id` | `financial_transactions(id)`; `user_accounts(id)` | Both NOT NULL | `ix_fk_transaction_approvals_financial_transaction_id`; `ix_fk_transaction_approvals_approver_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `payments` | `financial_transaction_id,currency_code`; `provider_id` | `financial_transactions(id,currency_code)`; `integration_providers(id)` | Transaction/currency NOT NULL; provider NULL | `ix_fk_payments_financial_transaction_id_currency_code`; `ix_fk_payments_provider_id`; RESTRICT/RESTRICT for every listed FK |
| `transaction_reversals` | `original_transaction_id,financial_account_id,currency_code`; `reversal_transaction_id,financial_account_id,currency_code`; `initiated_by_user_account_id`; `approved_by_user_account_id` | `financial_transactions(id,financial_account_id,currency_code)` for both transaction links; `user_accounts(id)` for actors | Both transaction links and account/currency NOT NULL; initiator NOT NULL; approver NULL | Composite indexes on both transaction FK tuples; initiator/approver indexes; RESTRICT/RESTRICT for every listed FK |
| `budgets` | `district_id`; `church_id`; `currency_code`; `submitted_by_user_account_id`; `approved_by_user_account_id` | `districts(id)`; `churches(id)`; `currencies(code)`; `user_accounts(id)` for actors | Exactly one district/church owner; currency/submitter NOT NULL; approver NULL. Owner/approval model remains policy-blocked | One index per FK column; UNIQUE `(id,currency_code)`; RESTRICT/RESTRICT for every listed FK |
| `budget_lines` | `budget_id,currency_code` | `budgets(id,currency_code)` | Both NOT NULL | Composite FK index `ix_fk_budget_lines_budget_id_currency_code`; unique budget/line_code and budget/sort_order; RESTRICT/RESTRICT for every listed FK |
| `credential_definitions` | `issuer_scope_district_id`; `issuer_scope_church_id` | `districts(id)`; `churches(id)` | Both nullable pending explicit issuer-scope/global-definition rule; do not assume exactly one until approved | `ix_fk_credential_definitions_issuer_scope_district_id`; `ix_fk_credential_definitions_issuer_scope_church_id`; RESTRICT/RESTRICT for every listed FK |
| `credential_definition_versions` | `credential_definition_id`; `approved_by_user_account_id` | `credential_definitions(id)`; `user_accounts(id)` | Definition NOT NULL; approver NULL | UNIQUE `(credential_definition_id,version)`; approver index; RESTRICT/RESTRICT for every listed FK |
| `credential_issuances` | `member_id`; `credential_definition_version_id`; `issuer_user_account_id`; `approved_by_user_account_id`; `prior_issuance_id` | `members(id)`; `credential_definition_versions(id)`; `user_accounts(id)` for issuer/approver; self-FK `credential_issuances(id)` | Member/definition/issuer/approver NOT NULL; prior issuance NULL | One index per FK; prior-issuance index; RESTRICT/RESTRICT for every listed FK |
| `credential_evidence` | `credential_issuance_id`; `submitted_by_user_account_id`; `verified_by_user_account_id` | `credential_issuances(id)`; `user_accounts(id)` for submitter/verifier | Issuance/submitter NOT NULL; verifier NULL | One index per FK column; RESTRICT/RESTRICT for every listed FK |
| `notification_templates` | None | — | No parent FK | — |
| `notification_preferences` | `user_account_id` | `user_accounts(id)` | NOT NULL | `ix_fk_notification_preferences_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `notifications` | `template_id` | `notification_templates(id)` | NULL | `ix_fk_notifications_template_id`; RESTRICT/RESTRICT for every listed FK |
| `notification_recipients` | `notification_id`; `user_account_id` | `notifications(id)`; `user_accounts(id)` | Both NOT NULL | UNIQUE `(notification_id,user_account_id)` supports notification FK; `ix_fk_notification_recipients_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `integration_providers` | None | — | No parent FK | — |
| `notification_deliveries` | `notification_recipient_id`; `provider_id` | `notification_recipients(id)`; `integration_providers(id)` | Both NOT NULL | UNIQUE `(notification_recipient_id,attempt_number)` supports recipient FK; `ix_fk_notification_deliveries_provider_id`; RESTRICT/RESTRICT for every listed FK |
| `outbox_messages` | None | — | Aggregate reference is event metadata, intentionally not a polymorphic FK | — |
| `webhook_events` | `provider_id` | `integration_providers(id)` | NOT NULL | `ix_fk_webhook_events_provider_id`; UNIQUE `(provider_id,provider_event_id)`; RESTRICT/RESTRICT for every listed FK |
| `integration_failures` | `provider_id`; `webhook_event_id` | `integration_providers(id)`; `webhook_events(id)` | Provider NOT NULL; webhook event NULL | `ix_fk_integration_failures_provider_id`; `ix_fk_integration_failures_webhook_event_id`; RESTRICT/RESTRICT for every listed FK |
| `service_principals` | None | — | No parent FK | — |
| `audit_events` | `actor_user_account_id`; `actor_service_principal_id`; `initiating_user_account_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `service_principals(id)`; `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Actor user/service columns nullable under actor-type CHECK; initiating user nullable; scope FKs nullable with zero-or-one scope rule | Separate source indexes for each FK; actor/time indexes do not replace independent initiating-user or scope FK support; RESTRICT/RESTRICT for every FK |
| `audit_access_events` | `accessing_user_account_id`; `audit_event_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `audit_events(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Accessing user NOT NULL; audit event nullable; scope FKs nullable with zero-or-one scope rule | Separate source indexes for every FK; RESTRICT/RESTRICT for every FK |
| `idempotency_records` | `actor_user_account_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Actor NOT NULL; zero or one resource scope FK populated according to approved scope identity model | Actor/operation lookup plus separate source indexes for each scope FK; RESTRICT/RESTRICT for every FK |
| `retention_policies` | None | — | No parent FK | — |
| `retention_subjects` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL; source-record enrollment FKs remain intentionally unresolved pending ODR-011 approved record classes | `ix_fk_retention_subjects_created_by_user_account_id`; RESTRICT/RESTRICT |
| `retention_holds` | `retention_subject_id`; `issued_by_user_account_id`; `approved_by_user_account_id` | `retention_subjects(id)`; `user_accounts(id)`; `user_accounts(id)` | Subject and issuer NOT NULL; approver NULL | `ix_retention_holds_subject_status` covers subject FK by left prefix; separate issuer/approver FK indexes; RESTRICT/RESTRICT for every FK |
| `retention_actions` | `retention_policy_id`; `retention_subject_id`; `initiated_by_user_account_id`; `approved_by_user_account_id` | `retention_policies(id)`; `retention_subjects(id)`; `user_accounts(id)`; `user_accounts(id)` | Policy/subject/initiator NOT NULL; approver NULL | `ix_retention_actions_subject_time` covers subject FK by left prefix; separate policy/initiator/approver FK indexes; RESTRICT/RESTRICT for every FK |
| `report_definitions` | `created_by_user_account_id`; `approved_by_user_account_id` | `user_accounts(id)` for creator/approver | Creator NOT NULL; approver NULL | `ix_fk_report_definitions_created_by_user_account_id`; `ix_fk_report_definitions_approved_by_user_account_id`; RESTRICT/RESTRICT for every listed FK |
| `report_runs` | `report_definition_id,report_definition_version`; `requested_by_user_account_id`; `scope_district_id`; `scope_church_id`; `scope_department_id` | `report_definitions(id,version)`; `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Definition/requester NOT NULL; exactly one scope FK or explicit GLOBAL; scope_kind values pending approval | Composite definition FK index; requester/time index; one index per scope FK; RESTRICT/RESTRICT for every listed FK |
| `report_export_audits` | `report_run_id`; `actor_user_account_id` | `report_runs(id)`; `user_accounts(id)` | Both NOT NULL | `ix_fk_report_export_audits_report_run_id`; `ix_fk_report_export_audits_actor_user_account_id`; RESTRICT/RESTRICT for every listed FK |

## 3.1 Stable constraint names for expanded FK rows

The following names are the proposed stable PostgreSQL FK constraint identifiers for the rows expanded after FKI-01. Every relationship uses `ON DELETE RESTRICT ON UPDATE RESTRICT`. Nullable relationships remain nullable as stated; a nullable FK does not make its target optional when a value is present.

| Table | Proposed constraint name | Ordered source columns | Ordered target columns | Nullability |
|---|---|---|---|---|
| `user_role_assignments` | `fk_ura_user_account` | user_account_id | user_accounts(id) | NOT NULL |
| `user_role_assignments` | `fk_ura_role` | role_id | roles(id) | NOT NULL |
| `user_role_assignments` | `fk_ura_granted_by_user` | granted_by_user_account_id | user_accounts(id) | NOT NULL |
| `user_role_assignments` | `fk_ura_district` | district_id | districts(id) | NULL, exactly-one scope CHECK |
| `user_role_assignments` | `fk_ura_church` | church_id | churches(id) | NULL, exactly-one scope CHECK |
| `user_role_assignments` | `fk_ura_department` | department_id | departments(id) | NULL, exactly-one scope CHECK |
| `access_denies` | `fk_access_denies_target_user` | target_user_account_id | user_accounts(id) | NOT NULL |
| `access_denies` | `fk_access_denies_permission` | permission_id | permissions(id) | NOT NULL |
| `access_denies` | `fk_access_denies_district` | district_id | districts(id) | NULL, exactly-one scope CHECK |
| `access_denies` | `fk_access_denies_church` | church_id | churches(id) | NULL, exactly-one scope CHECK |
| `access_denies` | `fk_access_denies_department` | department_id | departments(id) | NULL, exactly-one scope CHECK |
| `access_denies` | `fk_access_denies_issuer` | issued_by_user_account_id | user_accounts(id) | NOT NULL |
| `access_denies` | `fk_access_denies_reviewer` | reviewed_by_user_account_id | user_accounts(id) | NULL |
| `events` | `fk_events_district` | district_id | districts(id) | NULL, exactly-one owner CHECK |
| `events` | `fk_events_church` | church_id | churches(id) | NULL, exactly-one owner CHECK |
| `events` | `fk_events_department` | department_id | departments(id) | NULL, exactly-one owner CHECK |
| `events` | `fk_events_creator` | created_by_user_account_id | user_accounts(id) | NOT NULL |
| `audit_events` | `fk_audit_events_actor_user` | actor_user_account_id | user_accounts(id) | NULL, actor-type CHECK |
| `audit_events` | `fk_audit_events_actor_service` | actor_service_principal_id | service_principals(id) | NULL, actor-type CHECK |
| `audit_events` | `fk_audit_events_initiating_user` | initiating_user_account_id | user_accounts(id) | NULL |
| `audit_events` | `fk_audit_events_district` | district_id | districts(id) | NULL, zero-or-one scope CHECK |
| `audit_events` | `fk_audit_events_church` | church_id | churches(id) | NULL, zero-or-one scope CHECK |
| `audit_events` | `fk_audit_events_department` | department_id | departments(id) | NULL, zero-or-one scope CHECK |
| `audit_access_events` | `fk_audit_access_user` | accessing_user_account_id | user_accounts(id) | NOT NULL |
| `audit_access_events` | `fk_audit_access_event` | audit_event_id | audit_events(id) | NULL |
| `audit_access_events` | `fk_audit_access_district` | district_id | districts(id) | NULL, zero-or-one scope CHECK |
| `audit_access_events` | `fk_audit_access_church` | church_id | churches(id) | NULL, zero-or-one scope CHECK |
| `audit_access_events` | `fk_audit_access_department` | department_id | departments(id) | NULL, zero-or-one scope CHECK |
| `idempotency_records` | `fk_idempotency_actor_user` | actor_user_account_id | user_accounts(id) | NOT NULL |
| `idempotency_records` | `fk_idempotency_district` | district_id | districts(id) | NULL, zero-or-one resource-scope CHECK |
| `idempotency_records` | `fk_idempotency_church` | church_id | churches(id) | NULL, zero-or-one resource-scope CHECK |
| `idempotency_records` | `fk_idempotency_department` | department_id | departments(id) | NULL, zero-or-one resource-scope CHECK |
| `retention_subjects` | `fk_retention_subjects_creator` | created_by_user_account_id | user_accounts(id) | NOT NULL |
| `retention_holds` | `fk_retention_holds_subject` | retention_subject_id | retention_subjects(id) | NOT NULL |
| `retention_holds` | `fk_retention_holds_issuer` | issued_by_user_account_id | user_accounts(id) | NOT NULL |
| `retention_holds` | `fk_retention_holds_approver` | approved_by_user_account_id | user_accounts(id) | NULL |
| `retention_actions` | `fk_retention_actions_policy` | retention_policy_id | retention_policies(id) | NOT NULL |
| `retention_actions` | `fk_retention_actions_subject` | retention_subject_id | retention_subjects(id) | NOT NULL |
| `retention_actions` | `fk_retention_actions_initiator` | initiated_by_user_account_id | user_accounts(id) | NOT NULL |
| `retention_actions` | `fk_retention_actions_approver` | approved_by_user_account_id | user_accounts(id) | NULL |
| `departments` | `fk_departments_church_district` | church_id, district_id | churches(id, district_id) | Composite relationship present only when church_id is NOT NULL |
| `attendance_records` | `fk_attendance_records_subject_event_member` | attendance_subject_id, event_id, member_id | event_attendance_subjects(id, event_id, member_id) | NOT NULL |
| `attendance_records` | `fk_attendance_records_registration_event_member` | registration_id, event_id, member_id | event_registrations(id, event_id, member_id) | All NULL or all present |
| `attendance_records` | `fk_attendance_records_session_event` | event_session_id, event_id | event_sessions(id, event_id) | All NULL or all present |

Source-record FKs from `retention_subjects` to retained business records are intentionally not named or invented. They remain blocked until ODR-011 identifies the approved record classes and source mapping. The scope CHECK constraints listed above are not foreign keys and require their own stable CHECK names in the final DDL worksheet.

## 4. Composite scope contracts

1. **Church within district:** where a child stores both `church_id` and `district_id`, bind `(church_id,district_id)` to `churches(id,district_id)`. Do not rely on independent FKs to prove the church belongs to that district.
2. **Department within district:** where a child stores both `department_id` and `district_id`, bind `(department_id,district_id)` to `departments(id,district_id)`. If church-owned departments are approved, include church_id in the candidate key and tuple.
3. **Position scope:** exactly one of district_id/church_id/department_id is present. Appointment references only position_id; appointment scope is inherited from the position.
4. **Event owner scope:** exactly one approved owner FK is present. If the event row stores both a child scope and district, use the relevant composite hierarchy FK.
5. **Finance:** transaction account/currency and reversal original/reversal transaction/account/currency use composite keys. Payment references transaction/currency together.
6. **Attendance:** subject, registration, and session references bind event and member identity using the exact composite target keys.
7. **Report:** report run references immutable definition version with (report_definition_id, report_definition_version).

## 5. Column declaration inventory and completion rules

The current canonical table descriptions specify many columns, but several are abbreviated. The following rules govern conversion to the final column-level specification:

- A field written as `created_at` or `updated_at` without an explicit type is not yet a complete column definition. It is proposed as `timestamptz NOT NULL`, but this proposal must be reconciled and approved in the canonical physical design.
- A field written as an untyped FK name (for example, `district_id` in a grouped scope description) is proposed as UUID based on the referenced PK, but the exact declaration and nullability must be made explicit.
- PK implies NOT NULL. This does not supply a default or UUID-generation mechanism.
- Every nullable column must have an explicit reason. A nullable FK must not silently represent a missing approval or unknown owner.
- Every default must be explicit. No generic default is applied to status, money, date, actor, or scope fields.
- Every JSONB field needs a versioned schema, allowed-key list, size bound, and data-minimization rule.
- Every timestamp must be classified as an instant (`timestamptz`) or a date-only business value (`date`). Event-local timezone remains separately stored.
- Numeric money fields remain `numeric(19,4)` until the approved currency/accounting rules establish any narrower scale.
- The final appendix must list every column, including PK, FK, unique, check, default, and audit metadata columns. A field omitted from the source definition is an unresolved specification gap, not an implicit nullable column.

### 5.1 Known incomplete or policy-blocked column groups

| Table(s) | Incomplete column or contract | Required correction |
|---|---|---|
| `user_accounts` | Exact login/email/phone normalization and optional identity rules | Specify normalized storage columns or deterministic normalized expression/index; confirm login identifier uniqueness |
| `auth_sessions`, `auth_session_tokens`, `password_reset_tokens` | Timestamp shorthand and token lifecycle constraints | Expand every timestamp type/default and exact session-token uniqueness predicates |
| `church_transfer_requests` | Cancellation actor/time and resolution markers are not fully defined | Do not add columns until cancellation/rejection authority and state graph are approved |
| `departments`, `positions`, `events`, `user_role_assignments`, `access_denies`, `audit_events`, `audit_access_events`, `idempotency_records`, `report_runs` | Grouped scope FK declarations | Spell out each UUID column, nullable flag, exactly-one/global scope CHECK and composite hierarchy key |
| `role_conflict_rules`, `role_conflict_reviews` | Grouped table heading and exact lifecycle/review-cycle columns | Preserve two-table inventory; define cycle/supersession only after policy approval |
| `events` | Reserved/capacity counter appears in matrix but not fully reconciled in canonical event definition | Select one capacity concurrency model and specify counter/lock fields consistently |
| `attendance_records` | Mode trigger versus normalized subtype strategy not finally selected | Select one database-enforceable design; define trigger timing, lock order, and negative/concurrency tests |
| `financial_accounts`, `financial_transactions`, `payments`, `transaction_reversals` | Account and currency candidate keys/FKs require exact ordered target keys | Reconcile candidate unique keys and every composite FK; retain unresolved payment/refund/partial reversal rules |
| `budgets`, `budget_lines` | Approval, category/account mapping, revision and variance fields | Do not add unsupported accounting semantics; obtain finance authority decisions |
| `credential_definitions` | Global versus district/church issuer scope | Define scope discriminator and exactly-one/global shape only after issuer authority confirms |
| `outbox_messages` | Stable logical event identity columns are not finalized | Specify event_id/event_version or another stable idempotency key; reconcile matrix claims with physical definition |
| `retention_subjects`, `retention_holds`, `retention_actions` | Source record enrollment list and per-source FKs | Inventory approved retained record classes and add one-to-one source FKs/typed links only for those classes |
| `report_definitions`, `report_runs`, `report_export_audits` | Definition approval, scope policy, status, output and export lifecycle | Confirm report governance and scope; keep current proposed columns explicit and version-bound |

## 6. Table inventory and review coverage

The relational matrix contains 65 table rows and 65 unique names. This register has one row for each table in that inventory. Tables without parent FKs are explicitly marked as such. The register must not be treated as proof that every source column has been compiled or tested.

## 7. Acceptance checks before physical-design approval

- [ ] Every FK source and target column exists in the final column catalogue.
- [ ] Every FK target is a PK/UNIQUE key with the exact ordered columns.
- [ ] Every FK has explicit ON DELETE and ON UPDATE behavior.
- [ ] Every FK has a supporting source index or documented left-prefix coverage.
- [ ] Every scope pair is proven with a composite FK where hierarchy matters.
- [ ] Every nullable FK has an approved lifecycle reason.
- [ ] Every field has explicit PostgreSQL type and nullability.
- [ ] Every default is explicit, justified, and approved.
- [ ] Every status field has an approved state catalogue before CHECK constraints or seeds.
- [ ] Every index references existing columns and has no avoidable redundancy.
- [ ] Attendance and retention concurrency invariants have an approved enforcement design and executable negative tests.
- [ ] PostgreSQL version, extension availability, managed-role privileges, collation, and UUID generation are confirmed.
- [ ] Independent review finds no unresolved high-severity relational-integrity gaps.

## 8. Implementation boundary

No SQL DDL, Prisma schema, migration, database object, seed, generated client, or application code is created or changed by this register. DFR-001 through DFR-006 remain preserved. Physical design requires explicit project-owner approval, and implementation requires separate explicit authorization.


## 5.2 Explicit column declaration inventory

The following inventory records the typed field declarations currently present in the canonical physical-design sections. It is a transcription aid, not an inferred completion of missing columns. `NOT SPECIFIED` means the source text does not state nullability; `TYPE / NULLABILITY NOT SPECIFIED` means even the type is abbreviated. PK columns are treated as NOT NULL by PostgreSQL semantics.

| Table | Explicitly declared columns and source nullability |
|---|---|
| `user_accounts` | `id (uuid / NOT NULL)`; `login_identifier (text / NOT NULL)`; `email (text / NULL)`; `phone_e164 (varchar / NULL)`; `password_hash (text / NOT NULL)`; `status (varchar / NOT NULL)`; `email_verified_at (timestamptz / NULL)`; `phone_verified_at (timestamptz / NULL)`; `last_login_at (timestamptz / NULL)`; `created_at (TYPE / NULLABILITY NOT SPECIFIED)`; `updated_at (TYPE / NULLABILITY NOT SPECIFIED)` |
| `members` | `id (uuid / NOT NULL)`; `user_account_id (uuid / NOT NULL)`; `member_number (varchar / NOT NULL)`; `first_name (text / NOT NULL)`; `last_name (text / NOT NULL)`; `other_names (text / NULL)`; `date_of_birth (date / NULL)`; `status (varchar / NOT NULL)`; `created_at (TYPE / NULLABILITY NOT SPECIFIED)`; `updated_at (TYPE / NULLABILITY NOT SPECIFIED)` |
| `auth_sessions` | `id (uuid / NOT NULL)`; `user_account_id (uuid / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `last_activity_at (timestamptz / NOT NULL)`; `inactivity_expires_at (timestamptz / NOT NULL)`; `absolute_expires_at (timestamptz / NOT NULL)`; `revoked_at (timestamptz / NULL)`; `revocation_reason (text / NULL)`; `user_agent_summary (text / NULL)`; `ip_address (inet / NULL)` |
| `auth_session_tokens` | `id (uuid / NOT NULL)`; `auth_session_id (uuid / NOT NULL)`; `token_hash (text / NOT NULL)`; `token_generation (integer / NOT NULL)`; `issued_at (timestamptz / NOT NULL)`; `consumed_at (timestamptz / NULL)`; `revoked_at (timestamptz / NULL)` |
| `password_reset_tokens` | `id (uuid / NOT NULL)`; `user_account_id (uuid / NOT NULL)`; `token_hash (text / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `expires_at (timestamptz / NOT NULL)`; `consumed_at (timestamptz / NULL)` |
| `districts` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `name (text / NOT NULL)`; `timezone (text / NOT NULL)`; `status (varchar / NOT NULL)` |
| `churches` | `id (uuid / NOT NULL)`; `district_id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `name (text / NOT NULL)`; `status (varchar / NOT NULL)` |
| `member_categories` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `name (text / NOT NULL)`; `is_active (boolean / NOT NULL)` |
| `member_category_assignments` | `id (uuid / NOT NULL)`; `member_id (uuid / NOT NULL)`; `member_category_id (uuid / NOT NULL)`; `assigned_by_user_account_id (uuid / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `status (varchar / NOT NULL)`; `reason (text / NULL)`; `evidence_reference (text / NULL)` |
| `church_memberships` | `id (uuid / NOT NULL)`; `member_id (uuid / NOT NULL)`; `church_id (uuid / NOT NULL)`; `status (varchar / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `initiated_by_user_account_id (uuid / NOT NULL)`; `accepted_by_user_account_id (uuid / NULL)`; `approved_by_user_account_id (uuid / NULL)`; `created_at (TYPE / NULLABILITY NOT SPECIFIED)`; `updated_at (TYPE / NULLABILITY NOT SPECIFIED)` |
| `church_transfer_requests` | `id (uuid / NOT NULL)`; `member_id (uuid / NOT NULL)`; `source_church_id (uuid / NOT NULL)`; `receiving_church_id (uuid / NOT NULL)`; `requested_by_user_account_id (uuid / NOT NULL)`; `status (varchar / NOT NULL)`; `requested_at (timestamptz / NOT NULL)`; `receiving_decided_by_user_account_id (uuid / NULL)`; `receiving_decided_at (timestamptz / NULL)`; `receiving_decision (text / NULL)`; `district_decided_by_user_account_id (uuid / NULL)`; `district_decided_at (timestamptz / NULL)`; `district_decision (text / NULL)`; `approved_effective_at (timestamptz / NULL)`; `cancellation_reason (text / NULL)` |
| `departments` | `id (uuid / NOT NULL)`; `district_id (uuid / NOT NULL)`; `church_id (uuid / NULL)`; `code (varchar / NOT NULL)`; `name (text / NOT NULL)`; `status (varchar / NOT NULL)` |
| `department_eligibility_rules` | `id (uuid / NOT NULL)`; `department_id (uuid / NOT NULL)`; `version (varchar / NOT NULL)`; `description (text / NOT NULL)`; `source_authority (text / NULL)`; `evidence_requirements (jsonb / NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `status (varchar / NOT NULL)` |
| `department_memberships` | `id (uuid / NOT NULL)`; `member_id (uuid / NOT NULL)`; `department_id (uuid / NOT NULL)`; `requested_by_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `ended_by_user_account_id (uuid / NULL)`; `eligibility_rule_id (uuid / NULL)`; `status (varchar / NOT NULL)`; `requested_at (timestamptz / NOT NULL)`; `effective_from (timestamptz / NULL)`; `effective_to (timestamptz / NULL)`; `end_reason (text / NULL)` |
| `positions` | `id (uuid / NOT NULL)`; `district_id (uuid / NULL)`; `church_id (uuid / NULL)`; `department_id (uuid / NULL)`; `code (varchar / NOT NULL)`; `title (text / NOT NULL)`; `status (varchar / NOT NULL)` |
| `appointments` | `id (uuid / NOT NULL)`; `position_id (uuid / NOT NULL)`; `appointee_member_id (uuid / NOT NULL)`; `appointing_authority_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NOT NULL)`; `term_start (date / NOT NULL)`; `term_end (date / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `status (varchar / NOT NULL)`; `appointment_reason (text / NULL)`; `termination_reason (text / NULL)`; `approved_at (timestamptz / NOT NULL)` |
| `roles` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `name (text / NOT NULL)`; `status (varchar / NOT NULL)` |
| `permissions` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `resource (text / NOT NULL)`; `action (text / NOT NULL)`; `description (text / NULL)`; `status (varchar / NOT NULL)` |
| `role_permissions` | `id (uuid / NOT NULL)`; `role_id (uuid / NOT NULL)`; `permission_id (uuid / NOT NULL)`; `effect (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)` |
| `user_role_assignments` | `id (uuid / NOT NULL)`; `user_account_id (uuid / NOT NULL)`; `role_id (uuid / NOT NULL)`; `granted_by_user_account_id (uuid / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `status (varchar / NOT NULL)`; `reason (text / NULL)` |
| `appointment_role_links` | `id (uuid / NOT NULL)`; `appointment_id (uuid / NOT NULL)`; `role_id (uuid / NOT NULL)`; `mapping_version (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `created_by_user_account_id (uuid / NOT NULL)` |
| `access_denies` | `id (uuid / NOT NULL)`; `target_user_account_id (uuid / NOT NULL)`; `permission_id (uuid / NOT NULL)`; `issued_by_user_account_id (uuid / NOT NULL)`; `reviewed_by_user_account_id (uuid / NULL)`; `reason (text / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `expires_at (timestamptz / NULL)`; `review_due_at (timestamptz / NULL)`; `status (varchar / NOT NULL)`; `revoked_at (timestamptz / NULL)`; `revocation_reason (text / NULL)` |
| `role_conflict_rules` | `id (uuid / NOT NULL)`; `role_a_id (uuid / NOT NULL)`; `role_b_id (uuid / NOT NULL)`; `outcome (varchar / NOT NULL)`; `version (varchar / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `rationale (text / NOT NULL)` |
| `role_conflict_reviews` | `id (uuid / NOT NULL)`; `user_account_id (uuid / NOT NULL)`; `role_conflict_rule_id (uuid / NOT NULL)`; `reviewed_by_user_account_id (uuid / NOT NULL)`; `decision (varchar / NOT NULL)`; `reason (text / NOT NULL)`; `reviewed_at (timestamptz / NOT NULL)`; `effective_from (timestamptz / NULL)`; `effective_to (timestamptz / NULL)` |
| `events` | `id (uuid / NOT NULL)`; `title (text / NOT NULL)`; `description (text / NULL)`; `event_type (varchar / NOT NULL)`; `status (varchar / NOT NULL)`; `venue (text / NULL)`; `starts_at (timestamptz / NOT NULL)`; `ends_at (timestamptz / NOT NULL)`; `timezone (text / NOT NULL)`; `registration_opens_at (timestamptz / NULL)`; `registration_closes_at (timestamptz / NULL)`; `capacity (integer / NULL)`; `created_by_user_account_id (uuid / NOT NULL)`; `created_at (TYPE / NULLABILITY NOT SPECIFIED)`; `updated_at (TYPE / NULLABILITY NOT SPECIFIED)`; `cancelled_at (timestamptz / NULL)`; `cancellation_reason (text / NULL)` |
| `event_approvals` | `id (uuid / NOT NULL)`; `event_id (uuid / NOT NULL)`; `reviewer_user_account_id (uuid / NOT NULL)`; `stage (varchar / NOT NULL)`; `decision (varchar / NOT NULL)`; `reason (text / NULL)`; `decided_at (timestamptz / NOT NULL)` |
| `event_change_records` | `id (uuid / NOT NULL)`; `event_id (uuid / NOT NULL)`; `requested_by_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `change_type (varchar / NOT NULL)`; `previous_values (jsonb / NOT NULL)`; `proposed_values (jsonb / NOT NULL)`; `reason (text / NOT NULL)`; `status (varchar / NOT NULL)`; `requested_at (timestamptz / NOT NULL)`; `decided_at (timestamptz / NULL)` |
| `event_registrations` | `id (uuid / NOT NULL)`; `event_id (uuid / NOT NULL)`; `member_id (uuid / NOT NULL)`; `status (varchar / NOT NULL)`; `registered_at (timestamptz / NOT NULL)`; `registration_channel (varchar / NOT NULL)`; `cancelled_at (timestamptz / NULL)`; `cancellation_reason (text / NULL)` |
| `event_sessions` | `id (uuid / NOT NULL)`; `event_id (uuid / NOT NULL)`; `name (text / NOT NULL)`; `starts_at (timestamptz / NOT NULL)`; `ends_at (timestamptz / NOT NULL)`; `timezone (text / NOT NULL)`; `venue (text / NULL)`; `status (varchar / NOT NULL)` |
| `attendance_records` | `id (uuid / NOT NULL)`; `attendance_subject_id (uuid / NOT NULL)`; `event_id (uuid / NOT NULL)`; `event_session_id (uuid / NULL)`; `member_id (uuid / NOT NULL)`; `registration_id (uuid / NULL)`; `recorded_by_user_account_id (uuid / NOT NULL)`; `attendance_status (varchar / NOT NULL)`; `recorded_at (timestamptz / NOT NULL)`; `method (varchar / NOT NULL)`; `note (text / NULL)` |
| `attendance_corrections` | `id (uuid / NOT NULL)`; `attendance_record_id (uuid / NOT NULL)`; `requested_by_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `previous_status (varchar / NOT NULL)`; `proposed_status (varchar / NOT NULL)`; `reason (text / NOT NULL)`; `status (varchar / NOT NULL)`; `requested_at (timestamptz / NOT NULL)`; `approved_at (timestamptz / NULL)` |
| `financial_accounts` | `id (uuid / NOT NULL)`; `account_code (varchar / NOT NULL)`; `name (text / NOT NULL)`; `district_id (uuid / NULL)`; `church_id (uuid / NULL)`; `currency_code (char / NOT NULL)`; `status (varchar / NOT NULL)`; `opened_at (timestamptz / NOT NULL)`; `closed_at (timestamptz / NULL)` |
| `currencies` | `code (char / NOT NULL)`; `name (text / NOT NULL)`; `minor_unit (smallint / NOT NULL)`; `is_active (boolean / NOT NULL)` |
| `financial_transactions` | `id (uuid / NOT NULL)`; `financial_account_id (uuid / NOT NULL)`; `transaction_type (varchar / NOT NULL)`; `reference (varchar / NOT NULL)`; `description (text / NOT NULL)`; `amount (numeric / NOT NULL)`; `currency_code (char / NOT NULL)`; `status (varchar / NOT NULL)`; `transaction_date (date / NOT NULL)`; `submitted_by_user_account_id (uuid / NOT NULL)`; `submitted_at (timestamptz / NULL)`; `rejection_reason (text / NULL)`; `posted_at (timestamptz / NULL)`; `posted_by_user_account_id (uuid / NULL)` |
| `transaction_revisions` | `id (uuid / NOT NULL)`; `financial_transaction_id (uuid / NOT NULL)`; `revision_number (integer / NOT NULL)`; `requested_by_user_account_id (uuid / NOT NULL)`; `reason (text / NOT NULL)`; `previous_snapshot (jsonb / NOT NULL)`; `proposed_snapshot (jsonb / NOT NULL)`; `status (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `decided_at (timestamptz / NULL)` |
| `transaction_approvals` | `id (uuid / NOT NULL)`; `financial_transaction_id (uuid / NOT NULL)`; `approver_user_account_id (uuid / NOT NULL)`; `decision (varchar / NOT NULL)`; `reason (text / NULL)`; `approval_level (integer / NULL)`; `decided_at (timestamptz / NOT NULL)` |
| `payments` | `id (uuid / NOT NULL)`; `financial_transaction_id (uuid / NOT NULL)`; `provider_id (uuid / NULL)`; `payment_reference (varchar / NOT NULL)`; `provider_reference (varchar / NULL)`; `amount (numeric / NOT NULL)`; `currency_code (char / NOT NULL)`; `status (varchar / NOT NULL)`; `initiated_at (timestamptz / NOT NULL)`; `confirmed_at (timestamptz / NULL)`; `failure_reason (text / NULL)` |
| `transaction_reversals` | `id (uuid / NOT NULL)`; `original_transaction_id (uuid / NOT NULL)`; `reversal_transaction_id (uuid / NOT NULL)`; `financial_account_id (uuid / NOT NULL)`; `currency_code (char / NOT NULL)`; `initiated_by_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `reason (text / NOT NULL)`; `status (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `posted_at (timestamptz / NULL)` |
| `budgets` | `id (uuid / NOT NULL)`; `district_id (uuid / NULL)`; `church_id (uuid / NULL)`; `budget_code (varchar / NOT NULL)`; `title (text / NOT NULL)`; `period_start (date / NOT NULL)`; `period_end (date / NOT NULL)`; `currency_code (char / NOT NULL)`; `status (varchar / NOT NULL)`; `submitted_by_user_account_id (uuid / NOT NULL)`; `submitted_at (timestamptz / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `approved_at (timestamptz / NULL)`; `created_at (timestamptz / NOT NULL)`; `updated_at (timestamptz / NOT NULL)` |
| `budget_lines` | `id (uuid / NOT NULL)`; `budget_id (uuid / NOT NULL)`; `line_code (varchar / NOT NULL)`; `description (text / NOT NULL)`; `allocated_amount (numeric / NOT NULL)`; `revised_amount (numeric / NULL)`; `currency_code (char / NOT NULL)`; `sort_order (integer / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `updated_at (timestamptz / NOT NULL)` |
| `credential_definitions` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `issuing_authority (text / NOT NULL)`; `issuer_scope_district_id (uuid / NULL)`; `issuer_scope_church_id (uuid / NULL)`; `status (varchar / NOT NULL)` |
| `credential_definition_versions` | `id (uuid / NOT NULL)`; `credential_definition_id (uuid / NOT NULL)`; `version (varchar / NOT NULL)`; `title (text / NOT NULL)`; `requirements_reference (text / NOT NULL)`; `validity_policy (varchar / NOT NULL)`; `validity_duration (interval / NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `approved_by_user_account_id (uuid / NULL)` |
| `credential_issuances` | `id (uuid / NOT NULL)`; `member_id (uuid / NOT NULL)`; `credential_definition_version_id (uuid / NOT NULL)`; `issuer_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NOT NULL)`; `prior_issuance_id (uuid / NULL)`; `issued_at (timestamptz / NOT NULL)`; `valid_from (timestamptz / NOT NULL)`; `valid_until (timestamptz / NULL)`; `status (varchar / NOT NULL)`; `revoked_at (timestamptz / NULL)`; `revocation_reason (text / NULL)` |
| `credential_evidence` | `id (uuid / NOT NULL)`; `credential_issuance_id (uuid / NOT NULL)`; `submitted_by_user_account_id (uuid / NOT NULL)`; `verified_by_user_account_id (uuid / NULL)`; `evidence_type (varchar / NOT NULL)`; `object_storage_key (text / NOT NULL)`; `submitted_at (timestamptz / NOT NULL)`; `verified_at (timestamptz / NULL)`; `verification_status (varchar / NOT NULL)` |
| `notification_templates` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `version (integer / NOT NULL)`; `channel (varchar / NOT NULL)`; `locale (varchar / NOT NULL)`; `content (text / NOT NULL)`; `status (varchar / NOT NULL)` |
| `notification_preferences` | `id (uuid / NOT NULL)`; `user_account_id (uuid / NOT NULL)`; `channel (varchar / NOT NULL)`; `category (varchar / NOT NULL)`; `consent_state (varchar / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `source (text / NULL)` |
| `notifications` | `id (uuid / NOT NULL)`; `logical_key (varchar / NOT NULL)`; `template_id (uuid / NULL)`; `category (varchar / NOT NULL)`; `payload_reference (text / NULL)`; `status (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `scheduled_at (timestamptz / NULL)` |
| `notification_recipients` | `id (uuid / NOT NULL)`; `notification_id (uuid / NOT NULL)`; `user_account_id (uuid / NOT NULL)`; `destination_snapshot (text / NULL)`; `preference_decision (varchar / NOT NULL)`; `status (varchar / NOT NULL)` |
| `integration_providers` | `id (uuid / NOT NULL)`; `provider_code (varchar / NOT NULL)`; `service_type (varchar / NOT NULL)`; `status (varchar / NOT NULL)`; `configuration_reference (text / NULL)` |
| `notification_deliveries` | `id (uuid / NOT NULL)`; `notification_recipient_id (uuid / NOT NULL)`; `provider_id (uuid / NOT NULL)`; `attempt_number (integer / NOT NULL)`; `provider_message_id (text / NULL)`; `status (varchar / NOT NULL)`; `accepted_at (timestamptz / NULL)`; `delivered_at (timestamptz / NULL)`; `failed_at (timestamptz / NULL)`; `failure_code (text / NULL)` |
| `outbox_messages` | `id (uuid / NOT NULL)`; `aggregate_type (varchar / NOT NULL)`; `aggregate_id (uuid / NOT NULL)`; `event_type (varchar / NOT NULL)`; `payload (jsonb / NOT NULL)`; `occurred_at (timestamptz / NOT NULL)`; `status (varchar / NOT NULL)`; `attempt_count (integer / NOT NULL)`; `available_at (timestamptz / NOT NULL)`; `locked_at (timestamptz / NULL)`; `published_at (timestamptz / NULL)`; `last_error_code (text / NULL)` |
| `webhook_events` | `id (uuid / NOT NULL)`; `provider_id (uuid / NOT NULL)`; `provider_event_id (text / NOT NULL)`; `event_type (varchar / NOT NULL)`; `received_at (timestamptz / NOT NULL)`; `signature_valid (boolean / NOT NULL)`; `processing_status (varchar / NOT NULL)`; `payload_reference (text / NULL)`; `processed_at (timestamptz / NULL)`; `correlation_id (uuid / NULL)` |
| `integration_failures` | `id (uuid / NOT NULL)`; `provider_id (uuid / NOT NULL)`; `webhook_event_id (uuid / NULL)`; `failure_type (varchar / NOT NULL)`; `reason (text / NOT NULL)`; `first_seen_at (timestamptz / NOT NULL)`; `last_attempt_at (timestamptz / NULL)`; `retry_count (integer / NOT NULL)`; `status (varchar / NOT NULL)`; `resolved_at (timestamptz / NULL)` |
| `audit_events` | `id (uuid / NOT NULL)`; `actor_type (varchar / NOT NULL)`; `actor_user_account_id (uuid / NULL)`; `actor_service_principal_id (uuid / NULL)`; `initiating_user_account_id (uuid / NULL)`; `action (varchar / NOT NULL)`; `target_type (varchar / NOT NULL)`; `target_id (uuid / NULL)`; `occurred_at (timestamptz / NOT NULL)`; `reason (text / NULL)`; `correlation_id (uuid / NULL)`; `safe_change_summary (jsonb / NULL)` |
| `audit_access_events` | `id (uuid / NOT NULL)`; `accessing_user_account_id (uuid / NOT NULL)`; `audit_event_id (uuid / NULL)`; `access_action (varchar / NOT NULL)`; `purpose (text / NOT NULL)`; `occurred_at (timestamptz / NOT NULL)`; `exceptional_access (boolean / NOT NULL)` |
| `idempotency_records` | `id (uuid / NOT NULL)`; `key_digest (text / NOT NULL)`; `actor_user_account_id (uuid / NOT NULL)`; `operation_code (varchar / NOT NULL)`; `request_fingerprint (text / NOT NULL)`; `status (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `lease_expires_at (timestamptz / NULL)`; `completed_at (timestamptz / NULL)`; `safe_result_reference (text / NULL)` |
| `retention_policies` | `id (uuid / NOT NULL)`; `record_category (varchar / NOT NULL)`; `duration (interval / NULL)`; `trigger_code (varchar / NULL)`; `required_action (varchar / NOT NULL)`; `legal_basis (text / NULL)`; `approving_authority (text / NULL)`; `version (varchar / NOT NULL)`; `effective_from (timestamptz / NOT NULL)`; `effective_to (timestamptz / NULL)`; `status (varchar / NOT NULL)` |
| `retention_holds` | `id (uuid / NOT NULL)`; `record_category (varchar / NOT NULL)`; `reason (text / NOT NULL)`; `issued_by_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `created_at (timestamptz / NOT NULL)`; `released_at (timestamptz / NULL)`; `release_reason (text / NULL)`; `status (varchar / NOT NULL)` |
| `retention_actions` | `id (uuid / NOT NULL)`; `retention_policy_id (uuid / NOT NULL)`; `initiated_by_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `target_binding_id (uuid / NOT NULL)`; `action (varchar / NOT NULL)`; `reason (text / NOT NULL)`; `executed_at (timestamptz / NULL)`; `outcome (varchar / NOT NULL)`; `verification_reference (text / NULL)` |
| `report_definitions` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `version (integer / NOT NULL)`; `name (text / NOT NULL)`; `description (text / NULL)`; `classification (varchar / NOT NULL)`; `definition_payload (jsonb / NOT NULL)`; `status (varchar / NOT NULL)`; `created_by_user_account_id (uuid / NOT NULL)`; `approved_by_user_account_id (uuid / NULL)`; `created_at (timestamptz / NOT NULL)`; `effective_from (timestamptz / NULL)`; `effective_to (timestamptz / NULL)` |
| `report_runs` | `id (uuid / NOT NULL)`; `report_definition_id (uuid / NOT NULL)`; `report_definition_version (integer / NOT NULL)`; `requested_by_user_account_id (uuid / NOT NULL)`; `scope_district_id (uuid / NULL)`; `scope_church_id (uuid / NULL)`; `scope_department_id (uuid / NULL)`; `scope_kind (varchar / NOT NULL)`; `parameters (jsonb / NOT NULL)`; `status (varchar / NOT NULL)`; `requested_at (timestamptz / NOT NULL)`; `started_at (timestamptz / NULL)`; `completed_at (timestamptz / NULL)`; `failure_code (varchar / NULL)`; `output_object_key (text / NULL)`; `output_checksum (text / NULL)`; `output_size_bytes (bigint / NULL)`; `expires_at (timestamptz / NULL)` |
| `report_export_audits` | `id (uuid / NOT NULL)`; `report_run_id (uuid / NOT NULL)`; `actor_user_account_id (uuid / NOT NULL)`; `export_object_key (text / NOT NULL)`; `format (varchar / NOT NULL)`; `destination_classification (varchar / NOT NULL)`; `exported_at (timestamptz / NOT NULL)`; `download_expires_at (timestamptz / NULL)`; `purpose (text / NOT NULL)`; `correlation_id (uuid / NULL)` |
| `event_attendance_subjects` | `id (uuid / NOT NULL)`; `event_id (uuid / NOT NULL)`; `member_id (uuid / NOT NULL)`; `mode (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `created_by_user_account_id (uuid / NOT NULL)` |
| `retention_subjects` | `id (uuid / NOT NULL)`; `record_class (varchar / NOT NULL)`; `lifecycle_state (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `disposal_eligible_at (timestamptz / NULL)`; `created_by_user_account_id (uuid / NOT NULL)`; `retention_subject_id (uuid / NOT SPECIFIED)` |
| `service_principals` | `id (uuid / NOT NULL)`; `code (varchar / NOT NULL)`; `display_name (varchar / NOT NULL)`; `description (text / NULL)`; `status (varchar / NOT NULL)`; `created_at (timestamptz / NOT NULL)`; `updated_at (timestamptz / NOT NULL)` |

The table inventory contains 65 definition blocks after splitting the grouped role-conflict heading and adding the three Section 18 structures. It is not yet a one-to-one completed 65-table column matrix because some fields remain described only in prose, grouped scope clauses, or shorthand. Do not interpret omitted columns as absent from the intended model or as nullable. The next reconciliation must expand the remaining scope and actor fields, timestamps, and any missing operational metadata into explicit typed declarations.


## 5.3 Explicit scope and actor column expansion

The following columns were previously stated in prose as “explicit scope FKs” or “exactly one scope FK”. This appendix makes the proposed PostgreSQL declarations explicit. Each listed scope column is a nullable UUID FK individually; the table-level CHECK requires the approved scope shape. No polymorphic `scope_type + scope_id` pair is introduced.

| Table | Column | Proposed type/nullability | Target | Constraint |
|---|---|---|---|---|
| `departments` | `church_id` | `uuid NULL` | `churches(id)` | Optional church ownership; if populated, composite `(church_id,district_id)` must reference `churches(id,district_id)` |
| `user_role_assignments` | `district_id` | `uuid NULL` | `districts(id)` | Exactly one of district/church/department |
| `user_role_assignments` | `church_id` | `uuid NULL` | `churches(id)` | Exactly one of district/church/department |
| `user_role_assignments` | `department_id` | `uuid NULL` | `departments(id)` | Exactly one of district/church/department |
| `access_denies` | `district_id` | `uuid NULL` | `districts(id)` | Exactly one of district/church/department |
| `access_denies` | `church_id` | `uuid NULL` | `churches(id)` | Exactly one of district/church/department |
| `access_denies` | `department_id` | `uuid NULL` | `departments(id)` | Exactly one of district/church/department |
| `events` | `district_id` | `uuid NULL` | `districts(id)` | Exactly one event owner; allowed owner type still policy-bound |
| `events` | `church_id` | `uuid NULL` | `churches(id)` | Exactly one event owner; church/district hierarchy bound where district also stored |
| `events` | `department_id` | `uuid NULL` | `departments(id)` | Exactly one event owner; department ownership policy remains open |
| `audit_events` | `district_id` | `uuid NULL` | `districts(id)` | Zero or one audit scope FK; NULL permitted for genuinely global/system event |
| `audit_events` | `church_id` | `uuid NULL` | `churches(id)` | Zero or one audit scope FK |
| `audit_events` | `department_id` | `uuid NULL` | `departments(id)` | Zero or one audit scope FK |
| `audit_access_events` | `district_id` | `uuid NULL` | `districts(id)` | Zero or one access scope FK |
| `audit_access_events` | `church_id` | `uuid NULL` | `churches(id)` | Zero or one access scope FK |
| `audit_access_events` | `department_id` | `uuid NULL` | `departments(id)` | Zero or one access scope FK |
| `idempotency_records` | `district_id` | `uuid NULL` | `districts(id)` | Global or exactly one resource scope; scope discriminator contract required |
| `idempotency_records` | `church_id` | `uuid NULL` | `churches(id)` | Global or exactly one resource scope |
| `idempotency_records` | `department_id` | `uuid NULL` | `departments(id)` | Global or exactly one resource scope |

These are proposed physical columns, not claims of approved church-owned department or local event policies. Where a row carries both church and district identifiers, the composite hierarchy FK is mandatory. The district-only, church-only, and department-only shapes must be encoded by an explicit CHECK once the permitted scope values are approved.

## 5.4 Timestamp shorthand normalization

Four canonical table definitions previously used untyped `created_at` / `updated_at` shorthand. The proposed physical declarations are:

| Table | Column | Proposed type | Nullability | Default |
|---|---|---|---|---|
| `user_accounts` | `created_at` | `timestamptz` | NOT NULL | No default selected |
| `user_accounts` | `updated_at` | `timestamptz` | NOT NULL | No default selected |
| `members` | `created_at` | `timestamptz` | NOT NULL | No default selected |
| `members` | `updated_at` | `timestamptz` | NOT NULL | No default selected |
| `church_memberships` | `created_at` | `timestamptz` | NOT NULL | No default selected |
| `church_memberships` | `updated_at` | `timestamptz` | NOT NULL | No default selected |
| `events` | `created_at` | `timestamptz` | NOT NULL | No default selected |
| `events` | `updated_at` | `timestamptz` | NOT NULL | No default selected |

The absence of a default is intentional in this proposal. A single trusted timestamp authority must be selected before implementation. Other already-typed timestamps retain their table-specific nullability.

## 5.5 Retention relationship correction

- `retention_holds.retention_subject_id uuid NOT NULL` references `retention_subjects(id)`.
- `retention_actions.retention_subject_id uuid NOT NULL` references `retention_subjects(id)`.
- The prior generic `target_binding_id` wording is superseded by the exact retention_subject_id FK.
- `retention_subjects` itself does not contain a self-referencing retention_subject_id column. Each enrolled source record must instead carry a unique FK to the subject, or use a typed one-to-one link table with a real FK.
- The exact set of enrolled source tables is not yet approved. No source table is claimed to be enrolled until its source-specific FK/link is listed and reviewed.


## 5.6 Named support-index proposals for expanded scope and retention FKs

These names make the previously generic scope-index requirements concrete. They are proposed B-tree indexes on the FK source columns, filtered to non-NULL values where the column is optional. They must be reconciled with final uniqueness/index definitions before DDL; they are not asserted to exist in a database.

| Table | FK source column | Proposed index name | Predicate |
|---|---|---|---|
| `user_role_assignments` | `district_id` | `ix_user_role_assignments_district_id` | `district_id IS NOT NULL` |
| `user_role_assignments` | `church_id` | `ix_user_role_assignments_church_id` | `church_id IS NOT NULL` |
| `user_role_assignments` | `department_id` | `ix_user_role_assignments_department_id` | `department_id IS NOT NULL` |
| `access_denies` | `district_id` | `ix_access_denies_district_id` | `district_id IS NOT NULL` |
| `access_denies` | `church_id` | `ix_access_denies_church_id` | `church_id IS NOT NULL` |
| `access_denies` | `department_id` | `ix_access_denies_department_id` | `department_id IS NOT NULL` |
| `events` | `district_id` | `ix_events_district_id` | `district_id IS NOT NULL` |
| `events` | `church_id` | `ix_events_church_id` | `church_id IS NOT NULL` |
| `events` | `department_id` | `ix_events_department_id` | `department_id IS NOT NULL` |
| `audit_events` | `district_id` | `ix_audit_events_district_id` | `district_id IS NOT NULL` |
| `audit_events` | `church_id` | `ix_audit_events_church_id` | `church_id IS NOT NULL` |
| `audit_events` | `department_id` | `ix_audit_events_department_id` | `department_id IS NOT NULL` |
| `audit_access_events` | `district_id` | `ix_audit_access_events_district_id` | `district_id IS NOT NULL` |
| `audit_access_events` | `church_id` | `ix_audit_access_events_church_id` | `church_id IS NOT NULL` |
| `audit_access_events` | `department_id` | `ix_audit_access_events_department_id` | `department_id IS NOT NULL` |
| `idempotency_records` | `district_id` | `ix_idempotency_records_district_id` | `district_id IS NOT NULL` |
| `idempotency_records` | `church_id` | `ix_idempotency_records_church_id` | `church_id IS NOT NULL` |
| `idempotency_records` | `department_id` | `ix_idempotency_records_department_id` | `department_id IS NOT NULL` |

These are FK-maintenance and scoped-query candidates. A composite index may satisfy a single-column FK lookup only when the FK column is the leftmost prefix. The final index review must remove redundant standalone indexes where a suitable unique/composite index already provides the needed prefix.


## 5.7 Additional FK support-index coverage proposals

A structural comparison was performed between the FK source-column register and the named unique/access indexes. The following proposals supplement the earlier catalogue. Composite FK coverage must be checked against the full ordered tuple, not merely the first source column. Entries already covered by Section 5.6 or a wider suitable index are not duplicated here.

| Proposed index name | Table | Key columns | Predicate |
|---|---|---|---|
| `ix_fk_user_role_assignments_role_id` | `user_role_assignments` | `role_id` | `None` |
| `ix_fk_user_role_assignments_granted_by_user_account_id` | `user_role_assignments` | `granted_by_user_account_id` | `None` |
| `ix_fk_events_created_by_user_account_id` | `events` | `created_by_user_account_id` | `None` |
| `ix_fk_audit_events_initiating_user_account_id` | `audit_events` | `initiating_user_account_id` | `WHERE initiating_user_account_id IS NOT NULL` |
| `ix_fk_audit_access_events_audit_event_id` | `audit_access_events` | `audit_event_id` | `WHERE audit_event_id IS NOT NULL` |
| `ix_fk_retention_subjects_created_by_user_account_id` | `retention_subjects` | `created_by_user_account_id` | `None` |
| `ix_fk_retention_holds_issued_by_user_account_id` | `retention_holds` | `issued_by_user_account_id` | `None` |
| `ix_fk_retention_holds_approved_by_user_account_id` | `retention_holds` | `approved_by_user_account_id` | `WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_retention_actions_retention_policy_id` | `retention_actions` | `retention_policy_id` | `None` |
| `ix_fk_retention_actions_initiated_by_user_account_id` | `retention_actions` | `initiated_by_user_account_id` | `None` |
| `ix_fk_retention_actions_approved_by_user_account_id` | `retention_actions` | `approved_by_user_account_id` | `WHERE approved_by_user_account_id IS NOT NULL` |

| `ix_fk_departments_church_district` | `departments` | `church_id, district_id` | `WHERE church_id IS NOT NULL` |
| `ix_fk_departments_district_id` | `departments` | `district_id` | `None` |
| `ix_fk_member_category_assignments_member_category_id` | `member_category_assignments` | `member_category_id` | `None` |
| `ix_fk_member_category_assignments_assigned_by_user_account_id` | `member_category_assignments` | `assigned_by_user_account_id` | `None` |
| `ix_fk_church_memberships_church_id` | `church_memberships` | `church_id` | ` WHERE church_id IS NOT NULL` |
| `ix_fk_church_memberships_initiated_by_user_account_id` | `church_memberships` | `initiated_by_user_account_id` | `None` |
| `ix_fk_church_memberships_accepted_by_user_account_id` | `church_memberships` | `accepted_by_user_account_id` | ` WHERE accepted_by_user_account_id IS NOT NULL` |
| `ix_fk_church_memberships_approved_by_user_account_id` | `church_memberships` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_church_transfer_requests_source_church_id` | `church_transfer_requests` | `source_church_id` | `None` |
| `ix_fk_church_transfer_requests_receiving_church_id` | `church_transfer_requests` | `receiving_church_id` | `None` |
| `ix_fk_church_transfer_requests_requested_by_user_account_id` | `church_transfer_requests` | `requested_by_user_account_id` | `None` |
| `ix_fk_church_transfer_requests_receiving_decider` | `church_transfer_requests` | `receiving_decided_by_user_account_id` | ` WHERE receiving_decided_by_user_account_id IS NOT NULL` |
| `ix_fk_church_transfer_requests_district_decider` | `church_transfer_requests` | `district_decided_by_user_account_id` | ` WHERE district_decided_by_user_account_id IS NOT NULL` |
| `ix_fk_department_memberships_department_id` | `department_memberships` | `department_id` | ` WHERE department_id IS NOT NULL` |
| `ix_fk_department_memberships_requested_by_user_account_id` | `department_memberships` | `requested_by_user_account_id` | `None` |
| `ix_fk_department_memberships_approved_by_user_account_id` | `department_memberships` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_department_memberships_ended_by_user_account_id` | `department_memberships` | `ended_by_user_account_id` | ` WHERE ended_by_user_account_id IS NOT NULL` |
| `ix_fk_department_memberships_eligibility_rule_id` | `department_memberships` | `eligibility_rule_id` | `None` |
| `ix_fk_appointments_appointing_authority_user_account_id` | `appointments` | `appointing_authority_user_account_id` | `None` |
| `ix_fk_appointments_approved_by_user_account_id` | `appointments` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_role_permissions_permission_id` | `role_permissions` | `permission_id` | `None` |
| `ix_fk_appointment_role_links_role_id` | `appointment_role_links` | `role_id` | `None` |
| `ix_fk_appointment_role_links_created_by_user_account_id` | `appointment_role_links` | `created_by_user_account_id` | `None` |
| `ix_fk_role_conflict_rules_role_b_id` | `role_conflict_rules` | `role_b_id` | `None` |
| `ix_fk_role_conflict_reviews_user_account_id` | `role_conflict_reviews` | `user_account_id` | `None` |
| `ix_fk_role_conflict_reviews_role_conflict_rule_id` | `role_conflict_reviews` | `role_conflict_rule_id` | `None` |
| `ix_fk_role_conflict_reviews_reviewed_by_user_account_id` | `role_conflict_reviews` | `reviewed_by_user_account_id` | ` WHERE reviewed_by_user_account_id IS NOT NULL` |
| `ix_fk_event_approvals_event_id` | `event_approvals` | `event_id` | `None` |
| `ix_fk_event_approvals_reviewer_user_account_id` | `event_approvals` | `reviewer_user_account_id` | `None` |
| `ix_fk_event_change_records_event_id` | `event_change_records` | `event_id` | `None` |
| `ix_fk_event_change_records_requested_by_user_account_id` | `event_change_records` | `requested_by_user_account_id` | `None` |
| `ix_fk_event_change_records_approved_by_user_account_id` | `event_change_records` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_event_registrations_member_id` | `event_registrations` | `member_id` | `None` |
| `ix_fk_event_attendance_subjects_member_id` | `event_attendance_subjects` | `member_id` | `None` |
| `ix_fk_event_attendance_subjects_created_by_user_account_id` | `event_attendance_subjects` | `created_by_user_account_id` | `None` |
| `ix_fk_attendance_records_subject_event_member` | `attendance_records` | `attendance_subject_id, event_id, member_id` | `None` |
| `ix_fk_attendance_records_registration_id_event_id_member_id` | `attendance_records` | `registration_id, event_id, member_id` | ` WHERE registration_id IS NOT NULL AND event_id IS NOT NULL AND member_id IS NOT NULL` |
| `ix_fk_attendance_records_event_session_id_event_id` | `attendance_records` | `event_session_id, event_id` | ` WHERE event_session_id IS NOT NULL AND event_id IS NOT NULL` |
| ~~`ix_fk_attendance_records_member_id`~~ | `attendance_records` | `member_id` | Removed: no standalone member FK remains; member identity is bound by the attendance-subject composite FK |
| `ix_fk_attendance_records_recorded_by_user_account_id` | `attendance_records` | `recorded_by_user_account_id` | `None` |
| `ix_fk_attendance_corrections_requested_by_user_account_id` | `attendance_corrections` | `requested_by_user_account_id` | `None` |
| `ix_fk_attendance_corrections_approved_by_user_account_id` | `attendance_corrections` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_financial_accounts_district_id` | `financial_accounts` | `district_id` | ` WHERE district_id IS NOT NULL` |
| `ix_fk_financial_accounts_church_id` | `financial_accounts` | `church_id` | ` WHERE church_id IS NOT NULL` |
| `ix_fk_financial_accounts_currency_code` | `financial_accounts` | `currency_code` | `None` |
| `ix_fk_financial_transactions_financial_account_id_currency_code` | `financial_transactions` | `financial_account_id, currency_code` | `None` |
| `ix_fk_financial_transactions_submitted_by_user_account_id` | `financial_transactions` | `submitted_by_user_account_id` | `None` |
| `ix_fk_financial_transactions_posted_by_user_account_id` | `financial_transactions` | `posted_by_user_account_id` | ` WHERE posted_by_user_account_id IS NOT NULL` |
| `ix_fk_transaction_revisions_requested_by_user_account_id` | `transaction_revisions` | `requested_by_user_account_id` | `None` |
| `ix_fk_transaction_approvals_approver_user_account_id` | `transaction_approvals` | `approver_user_account_id` | `None` |
| `ix_fk_payments_financial_transaction_id_currency_code` | `payments` | `financial_transaction_id, currency_code` | `None` |
| `ix_fk_payments_provider_id` | `payments` | `provider_id` | ` WHERE provider_id IS NOT NULL` |
| `ix_fk_transaction_reversals_original_tuple` | `transaction_reversals` | `original_transaction_id, financial_account_id, currency_code` | `None` |
| `ix_fk_transaction_reversals_reversal_tuple` | `transaction_reversals` | `reversal_transaction_id, financial_account_id, currency_code` | `None` |
| `ix_fk_transaction_reversals_initiated_by_user_account_id` | `transaction_reversals` | `initiated_by_user_account_id` | `None` |
| `ix_fk_transaction_reversals_approved_by_user_account_id` | `transaction_reversals` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_budgets_district_id` | `budgets` | `district_id` | ` WHERE district_id IS NOT NULL` |
| `ix_fk_budgets_church_id` | `budgets` | `church_id` | ` WHERE church_id IS NOT NULL` |
| `ix_fk_budgets_currency_code` | `budgets` | `currency_code` | `None` |
| `ix_fk_budgets_submitted_by_user_account_id` | `budgets` | `submitted_by_user_account_id` | `None` |
| `ix_fk_budgets_approved_by_user_account_id` | `budgets` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_budget_lines_budget_id_currency_code` | `budget_lines` | `budget_id, currency_code` | `None` |
| `ix_fk_credential_definitions_issuer_scope_district_id` | `credential_definitions` | `issuer_scope_district_id` | `None` |
| `ix_fk_credential_definitions_issuer_scope_church_id` | `credential_definitions` | `issuer_scope_church_id` | `None` |
| `ix_fk_credential_definition_versions_approver` | `credential_definition_versions` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_credential_issuances_credential_definition_version_id` | `credential_issuances` | `credential_definition_version_id` | `None` |
| `ix_fk_credential_issuances_issuer_user_account_id` | `credential_issuances` | `issuer_user_account_id` | `None` |
| `ix_fk_credential_issuances_approved_by_user_account_id` | `credential_issuances` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_credential_issuances_prior_issuance_id` | `credential_issuances` | `prior_issuance_id` | ` WHERE prior_issuance_id IS NOT NULL` |
| `ix_fk_credential_evidence_submitted_by_user_account_id` | `credential_evidence` | `submitted_by_user_account_id` | `None` |
| `ix_fk_credential_evidence_verified_by_user_account_id` | `credential_evidence` | `verified_by_user_account_id` | ` WHERE verified_by_user_account_id IS NOT NULL` |
| `ix_fk_notification_preferences_user_account_id` | `notification_preferences` | `user_account_id` | `None` |
| `ix_fk_notifications_template_id` | `notifications` | `template_id` | ` WHERE template_id IS NOT NULL` |
| `ix_fk_notification_deliveries_provider_id` | `notification_deliveries` | `provider_id` | ` WHERE provider_id IS NOT NULL` |
| `ix_fk_integration_failures_webhook_event_id` | `integration_failures` | `webhook_event_id` | ` WHERE webhook_event_id IS NOT NULL` |
| `ix_fk_report_definitions_created_by_user_account_id` | `report_definitions` | `created_by_user_account_id` | `None` |
| `ix_fk_report_definitions_approved_by_user_account_id` | `report_definitions` | `approved_by_user_account_id` | ` WHERE approved_by_user_account_id IS NOT NULL` |
| `ix_fk_report_runs_definition_version` | `report_runs` | `report_definition_id, report_definition_version` | `None` |
| `ix_fk_report_runs_scope_district_id` | `report_runs` | `scope_district_id` | ` WHERE scope_district_id IS NOT NULL` |
| `ix_fk_report_runs_scope_church_id` | `report_runs` | `scope_church_id` | ` WHERE scope_church_id IS NOT NULL` |
| `ix_fk_report_runs_scope_department_id` | `report_runs` | `scope_department_id` | ` WHERE scope_department_id IS NOT NULL` |

All names and predicates remain proposed. Before DDL, verify each source column exists, composite FK columns appear in exact source order, optional composite FKs use a predicate requiring every component to be non-NULL, and no equivalent index already covers the same access path. This index list does not claim performance benchmarking or database creation.


## 5.8 FK constraint and index redundancy audit

The follow-up [FK Constraint and Index Redundancy Audit](./PHASE-2-FK-CONSTRAINT-AND-INDEX-REDUNDANCY-AUDIT.md) records seven findings requiring correction before physical-design approval:
- relationship rows mixed with column inventories;
- incorrect claim that one ordered composite index supports both `role_permissions` FKs;
- duplicate retention-subject support-index proposals;
- incomplete composite-FK index coverage claims;
- potentially redundant standalone event/member FKs on attendance records;
- shortened index names requiring a canonical naming pass;
- global FK action defaults not yet expanded per relationship.

The audit is a structural document review, not SQL or database validation. Its findings must be reconciled into this register and the relational integrity matrix before the FK inventory is considered complete. No implementation is authorized.


## 5.9 Canonical index-name validation

The current index-name inventory was checked after the FKI-06 cleanup:
- 109 index names are present across the FK/column register's unique/access and FK-support proposals.
- All 109 names are unique.
- No proposed name exceeds PostgreSQL's 63-byte identifier limit.
- No shortened name uses an opaque ordinal suffix or doubled-underscore collision workaround.

This validates naming structure only. It does not prove index necessity, query performance, or successful creation on a target PostgreSQL server.
