# DYMS Phase 2 Named Foreign-Key Relationship Register

**Status:** Complete document-level relationship inventory, pending independent review and owner approval  
**Scope:** DYMS v1.0, Sango District, 65 proposed physical tables  
**Source baseline:** Phase 2 Foreign-Key and Column Register and Physical Database Design  
**Implementation:** NOT AUTHORIZED

## 1. Purpose and authority

This register expands each declared FK relationship into one row. It supersedes the grouped relationship summary in Section 3 of the [Foreign-Key and Column Register](./PHASE-2-FOREIGN-KEY-AND-COLUMN-REGISTER.md) for constraint-level review. The summary remains useful for table coverage; this file is the relationship-level inventory.

Every row records a stable proposed constraint name, ordered source and target tuples, source nullability, exact target PK/UNIQUE evidence, MATCH behavior, delete/update actions, and the proposed source index or left-prefix support index.

This is a document-level design proposal. No PostgreSQL DDL or database catalogue was generated or inspected.

## 2. Coverage and reconciliation

| Measure | Count |
|---|---:|
| Physical tables in scope | 65 |
| Tables with one or more declared FK relationships | 54 |
| Tables with no parent FK | 11 |
| Distinct FK relationships | 155 |
| Distinct proposed constraint names | 155 |
| Constraint names over 63 bytes | 0 |
| Relationships missing source nullability | 0 |
| Relationships missing target-key evidence | 0 |

Tables with no parent FK: `user_accounts`, `districts`, `member_categories`, `roles`, `permissions`, `currencies`, `notification_templates`, `integration_providers`, `outbox_messages`, `service_principals`, `retention_policies`.

The coverage set is 54 FK-bearing tables plus the 11 listed zero-parent-FK tables, matching the 65-table physical design inventory. Retention source-record links remain intentionally excluded because ODR-011 has not approved the source record classes or enrollment mapping.

## 3. Canonical one-row-per-FK register

All relationships use PostgreSQL MATCH SIMPLE. For a single-column FK, this is the ordinary default. For optional composite relationships, MATCH SIMPLE is intentional and must be read with the source-column nullability shown in the row. All proposed actions are ON DELETE RESTRICT and ON UPDATE RESTRICT.

| Constraint name | Source table | Ordered source columns | Ordered target columns | Source nullability | Target PK / UNIQUE evidence | MATCH | ON DELETE | ON UPDATE | Supporting index / coverage |
|---|---|---|---|---|---|---|---|---|---|
| `fk_members_user_account_id` | `members` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_members_user_account` |
| `fk_auth_sessions_user_account_id` | `auth_sessions` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_auth_sessions_account_expiry` |
| `fk_auth_session_tokens_auth_session_id` | `auth_session_tokens` | `auth_session_id` | `auth_sessions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_auth_session_tokens_session_generation` |
| `fk_password_reset_tokens_user_account_id` | `password_reset_tokens` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_password_reset_tokens_account_expiry` |
| `fk_churches_district_id` | `churches` | `district_id` | `districts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_churches_district_code` |
| `fk_member_category_assignments_member_id` | `member_category_assignments` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_member_category_assignments_member_time` |
| `fk_member_category_assignments_member_category_id` | `member_category_assignments` | `member_category_id` | `member_categories(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_member_category_assignments_member_category_id` |
| `fk_member_category_assignments_assigned_by_user_account_id` | `member_category_assignments` | `assigned_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_member_category_assignments_assigned_by_user_account_id` |
| `fk_church_memberships_member_id` | `church_memberships` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_church_memberships_member_time` |
| `fk_church_memberships_church_id` | `church_memberships` | `church_id` | `churches(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_church_id` |
| `fk_church_memberships_initiated_by_user_account_id` | `church_memberships` | `initiated_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_initiated_by_user_account_id` |
| `fk_church_memberships_accepted_by_user_account_id` | `church_memberships` | `accepted_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_accepted_by_user_account_id` |
| `fk_church_memberships_approved_by_user_account_id` | `church_memberships` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_approved_by_user_account_id` |
| `fk_church_transfer_requests_member_id` | `church_transfer_requests` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_church_transfer_requests_member_time` |
| `fk_church_transfer_requests_source_church_id` | `church_transfer_requests` | `source_church_id` | `churches(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_source_church_id` |
| `fk_church_transfer_requests_receiving_church_id` | `church_transfer_requests` | `receiving_church_id` | `churches(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_receiving_church_id` |
| `fk_church_transfer_requests_requested_by_user_account_id` | `church_transfer_requests` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_requested_by_user_account_id` |
| `fk_church_transfer_requests_receiving_decided_by_user_a_081ab9` | `church_transfer_requests` | `receiving_decided_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_receiving_decider` |
| `fk_church_transfer_requests_district_decided_by_user_account_id` | `church_transfer_requests` | `district_decided_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_district_decider` |
| `fk_departments_district_id` | `departments` | `district_id` | `districts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_departments_district_id` |
| `fk_departments_church_district` | `departments` | `church_id,district_id` | `churches(id,district_id)` | NULL / NOT NULL | UNIQUE(id,district_id), `uq_churches_id_district` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_departments_church_district` |
| `fk_department_eligibility_rules_department_id` | `department_eligibility_rules` | `department_id` | `departments(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_department_eligibility_rules_version` |
| `fk_department_memberships_member_id` | `department_memberships` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_department_memberships_member_time` |
| `fk_department_memberships_department_id` | `department_memberships` | `department_id` | `departments(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_department_id` |
| `fk_department_memberships_requested_by_user_account_id` | `department_memberships` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_requested_by_user_account_id` |
| `fk_department_memberships_approved_by_user_account_id` | `department_memberships` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_approved_by_user_account_id` |
| `fk_department_memberships_ended_by_user_account_id` | `department_memberships` | `ended_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_ended_by_user_account_id` |
| `fk_department_memberships_eligibility_rule_id` | `department_memberships` | `eligibility_rule_id` | `department_eligibility_rules(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_eligibility_rule_id` |
| `fk_positions_district_id` | `positions` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_positions_district_id` |
| `fk_positions_church_id` | `positions` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_positions_church_id` |
| `fk_positions_department_id` | `positions` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_positions_department_id` |
| `fk_appointments_position_id` | `appointments` | `position_id` | `positions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_appointments_position_effective` |
| `fk_appointments_appointee_member_id` | `appointments` | `appointee_member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_appointments_appointee_effective` |
| `fk_appointments_appointing_authority_user_account_id` | `appointments` | `appointing_authority_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointments_appointing_authority_user_account_id` |
| `fk_appointments_approved_by_user_account_id` | `appointments` | `approved_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointments_approved_by_user_account_id` |
| `fk_role_permissions_role_id` | `role_permissions` | `role_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_role_permissions_role_permission` |
| `fk_role_permissions_permission_id` | `role_permissions` | `permission_id` | `permissions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_permissions_permission_id` |
| `fk_ura_user_account` | `user_role_assignments` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_user_scope` |
| `fk_ura_role` | `user_role_assignments` | `role_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_user_role_assignments_role_id` |
| `fk_ura_granted_by_user` | `user_role_assignments` | `granted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_user_role_assignments_granted_by_user_account_id` |
| `fk_ura_district` | `user_role_assignments` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_district_id` |
| `fk_ura_church` | `user_role_assignments` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_church_id` |
| `fk_ura_department` | `user_role_assignments` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_department_id` |
| `fk_appointment_role_links_appointment_id` | `appointment_role_links` | `appointment_id` | `appointments(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_appointment_role_links_mapping` |
| `fk_appointment_role_links_role_id` | `appointment_role_links` | `role_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointment_role_links_role_id` |
| `fk_appointment_role_links_created_by_user_account_id` | `appointment_role_links` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointment_role_links_created_by_user_account_id` |
| `fk_access_denies_target_user` | `access_denies` | `target_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_target_scope` |
| `fk_access_denies_permission` | `access_denies` | `permission_id` | `permissions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_access_denies_permission_id` |
| `fk_access_denies_district` | `access_denies` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_district_id` |
| `fk_access_denies_church` | `access_denies` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_church_id` |
| `fk_access_denies_department` | `access_denies` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_department_id` |
| `fk_access_denies_issuer` | `access_denies` | `issued_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_access_denies_issued_by_user_account_id` |
| `fk_access_denies_reviewer` | `access_denies` | `reviewed_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_access_denies_reviewed_by_user_account_id` |
| `fk_role_conflict_rules_role_a_id` | `role_conflict_rules` | `role_a_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_role_conflict_rules_pair_version` |
| `fk_role_conflict_rules_role_b_id` | `role_conflict_rules` | `role_b_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_rules_role_b_id` |
| `fk_role_conflict_reviews_user_account_id` | `role_conflict_reviews` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_reviews_user_account_id` |
| `fk_role_conflict_reviews_role_conflict_rule_id` | `role_conflict_reviews` | `role_conflict_rule_id` | `role_conflict_rules(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_reviews_role_conflict_rule_id` |
| `fk_role_conflict_reviews_reviewed_by_user_account_id` | `role_conflict_reviews` | `reviewed_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_reviews_reviewed_by_user_account_id` |
| `fk_events_district` | `events` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_events_district_id` |
| `fk_events_church` | `events` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_events_church_id` |
| `fk_events_department` | `events` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_events_department_id` |
| `fk_events_creator` | `events` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_events_created_by_user_account_id` |
| `fk_event_approvals_event_id` | `event_approvals` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_approvals_event_id` |
| `fk_event_approvals_reviewer_user_account_id` | `event_approvals` | `reviewer_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_approvals_reviewer_user_account_id` |
| `fk_event_change_records_event_id` | `event_change_records` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_change_records_event_id` |
| `fk_event_change_records_requested_by_user_account_id` | `event_change_records` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_change_records_requested_by_user_account_id` |
| `fk_event_change_records_approved_by_user_account_id` | `event_change_records` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_change_records_approved_by_user_account_id` |
| `fk_event_registrations_event_id` | `event_registrations` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_event_registrations_event_status` |
| `fk_event_registrations_member_id` | `event_registrations` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_registrations_member_id` |
| `fk_event_sessions_event_id` | `event_sessions` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_event_sessions_event_start` |
| `fk_event_attendance_subjects_event_id` | `event_attendance_subjects` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_event_attendance_subject_event_member` |
| `fk_event_attendance_subjects_member_id` | `event_attendance_subjects` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_attendance_subjects_member_id` |
| `fk_event_attendance_subjects_created_by_user_account_id` | `event_attendance_subjects` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_attendance_subjects_created_by_user_account_id` |
| `fk_attendance_records_subject_event_member` | `attendance_records` | `attendance_subject_id,event_id,member_id` | `event_attendance_subjects(id,event_id,member_id)` | NOT NULL / NOT NULL / NOT NULL | UNIQUE(id,event_id,member_id), `uq_event_attendance_subjects_id_event_member` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_subject_event_member` |
| `fk_attendance_records_registration_event_member` | `attendance_records` | `registration_id,event_id,member_id` | `event_registrations(id,event_id,member_id)` | NULL / NOT NULL / NOT NULL | UNIQUE(id,event_id,member_id), `uq_event_registrations_id_event_member` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_registration_id_event_id_member_id` |
| `fk_attendance_records_session_event` | `attendance_records` | `event_session_id,event_id` | `event_sessions(id,event_id)` | NULL / NOT NULL | UNIQUE(id,event_id), `uq_event_sessions_id_event` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_event_session_id_event_id` |
| `fk_attendance_records_recorded_by_user_account_id` | `attendance_records` | `recorded_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_recorded_by_user_account_id` |
| `fk_attendance_corrections_attendance_record_id` | `attendance_corrections` | `attendance_record_id` | `attendance_records(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_attendance_corrections_record_time` |
| `fk_attendance_corrections_requested_by_user_account_id` | `attendance_corrections` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_corrections_requested_by_user_account_id` |
| `fk_attendance_corrections_approved_by_user_account_id` | `attendance_corrections` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_corrections_approved_by_user_account_id` |
| `fk_financial_accounts_district_id` | `financial_accounts` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_accounts_district_id` |
| `fk_financial_accounts_church_id` | `financial_accounts` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_accounts_church_id` |
| `fk_financial_accounts_currency_code` | `financial_accounts` | `currency_code` | `currencies(code)` | NOT NULL | PK(code) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_accounts_currency_code` |
| `fk_financial_transactions_financial_account_id_currency_code` | `financial_transactions` | `financial_account_id,currency_code` | `financial_accounts(id,currency_code)` | NOT NULL / NOT NULL | UNIQUE(id,currency_code), `uq_financial_accounts_id_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_transactions_financial_account_id_currency_code` |
| `fk_financial_transactions_submitted_by_user_account_id` | `financial_transactions` | `submitted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_transactions_submitted_by_user_account_id` |
| `fk_financial_transactions_posted_by_user_account_id` | `financial_transactions` | `posted_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_transactions_posted_by_user_account_id` |
| `fk_transaction_revisions_financial_transaction_id` | `transaction_revisions` | `financial_transaction_id` | `financial_transactions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_transaction_revisions_transaction_number` |
| `fk_transaction_revisions_requested_by_user_account_id` | `transaction_revisions` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_revisions_requested_by_user_account_id` |
| `fk_transaction_approvals_financial_transaction_id` | `transaction_approvals` | `financial_transaction_id` | `financial_transactions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_transaction_approvals_transaction_time` |
| `fk_transaction_approvals_approver_user_account_id` | `transaction_approvals` | `approver_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_approvals_approver_user_account_id` |
| `fk_payments_financial_transaction_id_currency_code` | `payments` | `financial_transaction_id,currency_code` | `financial_transactions(id,currency_code)` | NOT NULL / NOT NULL | UNIQUE(id,currency_code), `uq_financial_transactions_id_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_payments_financial_transaction_id_currency_code` |
| `fk_payments_provider_id` | `payments` | `provider_id` | `integration_providers(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_payments_provider_id` |
| `fk_transaction_reversals_original_transaction_id_financ_aba661` | `transaction_reversals` | `original_transaction_id,financial_account_id,currency_code` | `financial_transactions(id,financial_account_id,currency_code)` | NOT NULL / NOT NULL / NOT NULL | UNIQUE(id,financial_account_id,currency_code), `uq_financial_transactions_id_account_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_original_tuple` |
| `fk_transaction_reversals_reversal_transaction_id_financ_9b229f` | `transaction_reversals` | `reversal_transaction_id,financial_account_id,currency_code` | `financial_transactions(id,financial_account_id,currency_code)` | NOT NULL / NOT NULL / NOT NULL | UNIQUE(id,financial_account_id,currency_code), `uq_financial_transactions_id_account_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_reversal_tuple` |
| `fk_transaction_reversals_initiated_by_user_account_id` | `transaction_reversals` | `initiated_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_initiated_by_user_account_id` |
| `fk_transaction_reversals_approved_by_user_account_id` | `transaction_reversals` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_approved_by_user_account_id` |
| `fk_budgets_district_id` | `budgets` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_district_id` |
| `fk_budgets_church_id` | `budgets` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_church_id` |
| `fk_budgets_currency_code` | `budgets` | `currency_code` | `currencies(code)` | NOT NULL | PK(code) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_currency_code` |
| `fk_budgets_submitted_by_user_account_id` | `budgets` | `submitted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_submitted_by_user_account_id` |
| `fk_budgets_approved_by_user_account_id` | `budgets` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_approved_by_user_account_id` |
| `fk_budget_lines_budget_id_currency_code` | `budget_lines` | `budget_id,currency_code` | `budgets(id,currency_code)` | NOT NULL / NOT NULL | UNIQUE(id,currency_code), `uq_budgets_id_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budget_lines_budget_id_currency_code` |
| `fk_credential_definitions_issuer_scope_district_id` | `credential_definitions` | `issuer_scope_district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_definitions_issuer_scope_district_id` |
| `fk_credential_definitions_issuer_scope_church_id` | `credential_definitions` | `issuer_scope_church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_definitions_issuer_scope_church_id` |
| `fk_credential_definition_versions_credential_definition_id` | `credential_definition_versions` | `credential_definition_id` | `credential_definitions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_credential_definition_versions` |
| `fk_credential_definition_versions_approved_by_user_account_id` | `credential_definition_versions` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_definition_versions_approver` |
| `fk_credential_issuances_member_id` | `credential_issuances` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_credential_issuances_member_date` |
| `fk_credential_issuances_credential_definition_version_id` | `credential_issuances` | `credential_definition_version_id` | `credential_definition_versions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_credential_definition_version_id` |
| `fk_credential_issuances_issuer_user_account_id` | `credential_issuances` | `issuer_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_issuer_user_account_id` |
| `fk_credential_issuances_approved_by_user_account_id` | `credential_issuances` | `approved_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_approved_by_user_account_id` |
| `fk_credential_issuances_prior_issuance_id` | `credential_issuances` | `prior_issuance_id` | `credential_issuances(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_prior_issuance_id` |
| `fk_credential_evidence_credential_issuance_id` | `credential_evidence` | `credential_issuance_id` | `credential_issuances(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_credential_evidence_issuance` |
| `fk_credential_evidence_submitted_by_user_account_id` | `credential_evidence` | `submitted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_evidence_submitted_by_user_account_id` |
| `fk_credential_evidence_verified_by_user_account_id` | `credential_evidence` | `verified_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_evidence_verified_by_user_account_id` |
| `fk_notification_preferences_user_account_id` | `notification_preferences` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_notification_preferences_user_account_id` |
| `fk_notifications_template_id` | `notifications` | `template_id` | `notification_templates(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_notifications_template_id` |
| `fk_notification_recipients_notification_id` | `notification_recipients` | `notification_id` | `notifications(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_notification_recipients_notification_user` |
| `fk_notification_recipients_user_account_id` | `notification_recipients` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_notification_recipients_user_account_id` |
| `fk_notification_deliveries_notification_recipient_id` | `notification_deliveries` | `notification_recipient_id` | `notification_recipients(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_notification_deliveries_attempt` |
| `fk_notification_deliveries_provider_id` | `notification_deliveries` | `provider_id` | `integration_providers(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_notification_deliveries_provider_id` |
| `fk_webhook_events_provider_id` | `webhook_events` | `provider_id` | `integration_providers(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_webhook_events_provider_event` |
| `fk_integration_failures_provider_id` | `integration_failures` | `provider_id` | `integration_providers(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_integration_failures_provider_status` |
| `fk_integration_failures_webhook_event_id` | `integration_failures` | `webhook_event_id` | `webhook_events(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_integration_failures_webhook_event_id` |
| `fk_audit_events_actor_user` | `audit_events` | `actor_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_actor_user_time` |
| `fk_audit_events_actor_service` | `audit_events` | `actor_service_principal_id` | `service_principals(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_actor_service_time` |
| `fk_audit_events_initiating_user` | `audit_events` | `initiating_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_audit_events_initiating_user_account_id` |
| `fk_audit_events_district` | `audit_events` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_district_id` |
| `fk_audit_events_church` | `audit_events` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_church_id` |
| `fk_audit_events_department` | `audit_events` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_department_id` |
| `fk_audit_access_user` | `audit_access_events` | `accessing_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_actor_time` |
| `fk_audit_access_event` | `audit_access_events` | `audit_event_id` | `audit_events(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_audit_access_events_audit_event_id` |
| `fk_audit_access_district` | `audit_access_events` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_district_id` |
| `fk_audit_access_church` | `audit_access_events` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_church_id` |
| `fk_audit_access_department` | `audit_access_events` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_department_id` |
| `fk_idempotency_actor_user` | `idempotency_records` | `actor_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_idempotency_records_actor_operation` |
| `fk_idempotency_district` | `idempotency_records` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_idempotency_records_district_id` |
| `fk_idempotency_church` | `idempotency_records` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_idempotency_records_church_id` |
| `fk_idempotency_department` | `idempotency_records` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_idempotency_records_department_id` |
| `fk_retention_subjects_creator` | `retention_subjects` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_subjects_created_by_user_account_id` |
| `fk_retention_holds_subject` | `retention_holds` | `retention_subject_id` | `retention_subjects(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_retention_holds_subject_status` |
| `fk_retention_holds_issuer` | `retention_holds` | `issued_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_holds_issued_by_user_account_id` |
| `fk_retention_holds_approver` | `retention_holds` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_holds_approved_by_user_account_id` |
| `fk_retention_actions_policy` | `retention_actions` | `retention_policy_id` | `retention_policies(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_actions_retention_policy_id` |
| `fk_retention_actions_subject` | `retention_actions` | `retention_subject_id` | `retention_subjects(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_retention_actions_subject_time` |
| `fk_retention_actions_initiator` | `retention_actions` | `initiated_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_actions_initiated_by_user_account_id` |
| `fk_retention_actions_approver` | `retention_actions` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_actions_approved_by_user_account_id` |
| `fk_report_definitions_created_by_user_account_id` | `report_definitions` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_definitions_created_by_user_account_id` |
| `fk_report_definitions_approved_by_user_account_id` | `report_definitions` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_definitions_approved_by_user_account_id` |
| `fk_report_runs_report_definition_id_report_definition_version` | `report_runs` | `report_definition_id,report_definition_version` | `report_definitions(id,version)` | NOT NULL / NOT NULL | UNIQUE(id,version), `uq_report_definitions_id_version` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_runs_definition_version` |
| `fk_report_runs_requested_by_user_account_id` | `report_runs` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_runs_requester_time` |
| `fk_report_runs_scope_district_id` | `report_runs` | `scope_district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_runs_scope_district_id` |
| `fk_report_runs_scope_church_id` | `report_runs` | `scope_church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_runs_scope_church_id` |
| `fk_report_runs_scope_department_id` | `report_runs` | `scope_department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_runs_scope_department_id` |
| `fk_report_export_audits_report_run_id` | `report_export_audits` | `report_run_id` | `report_runs(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_export_audits_run_time` |
| `fk_report_export_audits_actor_user_account_id` | `report_export_audits` | `actor_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_export_audits_actor_time` |

## 4. Composite relationship contracts

- `departments(church_id,district_id)` references `churches(id,district_id)`. The target must expose the exact ordered UNIQUE key. The nullable church identifier makes this an optional composite relationship; MATCH SIMPLE skips the FK only when church_id is NULL. district_id remains NOT NULL and has its own FK to districts.
- `attendance_records(attendance_subject_id,event_id,member_id)` is mandatory and binds the attendance subject to its event/member context.
- `attendance_records(registration_id,event_id,member_id)` is optional and uses MATCH SIMPLE. registration_id is NULL when no registration is attached; event_id and member_id remain NOT NULL and continue to be bound by the mandatory subject FK.
- `attendance_records(event_session_id,event_id)` is optional and uses MATCH SIMPLE. event_session_id is NULL when no session is attached; event_id remains NOT NULL and continues to be bound by the mandatory subject FK.
- Finance composite references use the exact ordered candidate keys shown in the table. Their currency/account identity must match across the referenced transaction/account chain.
- `report_runs(report_definition_id,report_definition_version)` references the immutable report-definition version key.

A composite FK is accepted only when the referenced ordered tuple is backed by a PK or UNIQUE candidate key with exactly the same column order. The source index must begin with the complete ordered source tuple. A wider index with only a shared first column is not complete composite-FK support.

## 5. Nullability and policy boundaries

Source nullability is transcribed from the current physical-design column declarations and explicit scope/retention corrections. NULL scope columns remain governed by their existing exactly-one or zero-or-one CHECK contracts. This FK register does not approve those scope policies or lifecycle values.

The optional registration FK does not decide whether registration is a prerequisite for attendance. Credential issuer scope, finance ownership/approval, report scope, and other ODR-gated semantics remain unresolved where identified in the Owner Decision Register.

## 6. Index-support interpretation

The supporting-index column identifies the proposed source-side index or suitable existing unique/workload index whose leading key columns cover the FK source tuple. It does not claim the index exists in PostgreSQL. The [Canonical Index Inventory](./PHASE-2-CANONICAL-INDEX-INVENTORY.md) is the single name inventory; any support index named here must be present there.

Partial indexes are not used as universal FK support where their predicates could omit referencing rows needed for referential checks. Where a workload index or unique index is cited, its left-prefix coverage is limited to the exact leading columns shown by that index definition.

## 7. Review and implementation gates

- Independently verify all 155 relationships against the physical table definitions and conceptual ERD.
- Confirm every target PK/UNIQUE key is defined with the exact ordered columns.
- Verify every supporting index definition, predicate and leading-column sequence in the canonical inventory.
- Confirm nullable composite MATCH SIMPLE behavior with PostgreSQL compatibility tests.
- Reconcile the four scope-bearing areas with the approved owner policy and CHECK/trigger contracts.
- Generate DDL only after complete physical-design approval and separate explicit implementation authorization.

This register does not approve physical design or implementation. No Prisma schema, SQL DDL, migration, database object, generated client, seed, or application code has been created or changed. DFR-001 through DFR-006 and the approved conceptual ERD remain preserved.
