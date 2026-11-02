# DYMS Phase 3 — Canonical Named Foreign-Key Relationship Register

- Revision: FK-PR-01
- Date: 2026-11-02
- Scope: DYMS v1.0, Sango District
- Status: **CONSOLIDATED PHYSICAL-DESIGN PROPOSAL; NOT APPROVED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose and authority

This is the Phase 3 one-row-per-FK candidate register. It reconciles the Phase 2 155 relationship baseline with ODR-004 owner-approved defaults, DDD-013/TBR-01, attendance exception evidence, member-category eligibility provenance and REPORT-004 data ownership.

All relationships use ON DELETE RESTRICT and ON UPDATE RESTRICT unless a future explicitly approved exception is recorded. No cascade deletion is proposed. Nullable FK columns are nullable only for the stated scope/lifecycle mode. Composite FKs use exact ordered target keys and matching source indexes.

## 2. Reconciliation totals

| Measure | Count |
|---|---:|
| Phase 2 named FK relationships | 155 |
| Phase 3 candidate named FK relationships | 163 |
| Phase 3 additions / replacements | 13 new named rows, with superseded scope relationships removed |
| Delete/update action baseline | RESTRICT / RESTRICT |
| Implementation | NOT AUTHORIZED |

## 3. Canonical one-row-per-FK register

| Constraint name | Source table | Ordered source column(s) | Target table(column(s)) | Source nullability | Target candidate key | Match | ON DELETE | ON UPDATE | Supporting source index |
| `fk_access_denies_church` | `access_denies` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_church_id` |
| `fk_access_denies_department` | `access_denies` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_department_id` |
| `fk_access_denies_district` | `access_denies` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_district_id` |
| `fk_access_denies_issuer` | `access_denies` | `issued_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_access_denies_issued_by_user_account_id` |
| `fk_access_denies_permission` | `access_denies` | `permission_id` | `permissions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_access_denies_permission_id` |
| `fk_access_denies_reviewer` | `access_denies` | `reviewed_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_access_denies_reviewed_by_user_account_id` |
| `fk_access_denies_target_user` | `access_denies` | `target_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_access_denies_target_scope` |
| `fk_appointment_role_links_appointment_id` | `appointment_role_links` | `appointment_id` | `appointments(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_appointment_role_links_mapping` |
| `fk_appointment_role_links_created_by_user_account_id` | `appointment_role_links` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointment_role_links_created_by_user_account_id` |
| `fk_appointment_role_links_role_id` | `appointment_role_links` | `role_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointment_role_links_role_id` |
| `fk_appointments_appointee_member_id` | `appointments` | `appointee_member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_appointments_appointee_effective` |
| `fk_appointments_appointing_authority_user_account_id` | `appointments` | `appointing_authority_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointments_appointing_authority_user_account_id` |
| `fk_appointments_approved_by_user_account_id` | `appointments` | `approved_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_appointments_approved_by_user_account_id` |
| `fk_appointments_position_id` | `appointments` | `position_id` | `positions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_appointments_position_effective` |
| `fk_attendance_corrections_approved_by_user_account_id` | `attendance_corrections` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_corrections_approved_by_user_account_id` |
| `fk_attendance_corrections_attendance_record_id` | `attendance_corrections` | `attendance_record_id` | `attendance_records(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_attendance_corrections_record_time` |
| `fk_attendance_corrections_requested_by_user_account_id` | `attendance_corrections` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_corrections_requested_by_user_account_id` |
| `fk_attendance_records_recorded_by_user_account_id` | `attendance_records` | `recorded_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_recorded_by_user_account_id` |
| `fk_attendance_records_registration_event_member` | `attendance_records` | `registration_id,event_id,member_id` | `event_registrations(id,event_id,member_id)` | NULL / NOT NULL / NOT NULL | UNIQUE(id,event_id,member_id), `uq_event_registrations_id_event_member` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_registration_id_event_id_member_id` |
| `fk_attendance_records_session_event` | `attendance_records` | `event_session_id,event_id` | `event_sessions(id,event_id)` | NULL / NOT NULL | UNIQUE(id,event_id), `uq_event_sessions_id_event` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_event_session_id_event_id` |
| `fk_attendance_records_subject_event_member` | `attendance_records` | `attendance_subject_id,event_id,member_id` | `event_attendance_subjects(id,event_id,member_id)` | NOT NULL / NOT NULL / NOT NULL | UNIQUE(id,event_id,member_id), `uq_event_attendance_subjects_id_event_member` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_attendance_records_subject_event_member` |
| `fk_audit_access_church` | `audit_access_events` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_church_id` |
| `fk_audit_access_department` | `audit_access_events` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_department_id` |
| `fk_audit_access_district` | `audit_access_events` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_district_id` |
| `fk_audit_access_event` | `audit_access_events` | `audit_event_id` | `audit_events(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_audit_access_events_audit_event_id` |
| `fk_audit_access_user` | `audit_access_events` | `accessing_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_access_events_actor_time` |
| `fk_audit_events_actor_service` | `audit_events` | `actor_service_principal_id` | `service_principals(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_actor_service_time` |
| `fk_audit_events_actor_user` | `audit_events` | `actor_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_actor_user_time` |
| `fk_audit_events_church` | `audit_events` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_church_id` |
| `fk_audit_events_department` | `audit_events` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_department_id` |
| `fk_audit_events_district` | `audit_events` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_audit_events_district_id` |
| `fk_audit_events_initiating_user` | `audit_events` | `initiating_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_audit_events_initiating_user_account_id` |
| `fk_auth_session_tokens_auth_session_id` | `auth_session_tokens` | `auth_session_id` | `auth_sessions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_auth_session_tokens_session_generation` |
| `fk_auth_sessions_user_account_id` | `auth_sessions` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_auth_sessions_account_expiry` |
| `fk_budget_lines_budget_id_currency_code` | `budget_lines` | `budget_id,currency_code` | `budgets(id,currency_code)` | NOT NULL / NOT NULL | UNIQUE(id,currency_code), `uq_budgets_id_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budget_lines_budget_id_currency_code` |
| `fk_budgets_approved_by_user_account_id` | `budgets` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_approved_by_user_account_id` |
| `fk_budgets_church_id` | `budgets` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_church_id` |
| `fk_budgets_currency_code` | `budgets` | `currency_code` | `currencies(code)` | NOT NULL | PK(code) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_currency_code` |
| `fk_budgets_district_id` | `budgets` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_district_id` |
| `fk_budgets_submitted_by_user_account_id` | `budgets` | `submitted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_budgets_submitted_by_user_account_id` |
| `fk_church_memberships_accepted_by_user_account_id` | `church_memberships` | `accepted_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_accepted_by_user_account_id` |
| `fk_church_memberships_approved_by_user_account_id` | `church_memberships` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_approved_by_user_account_id` |
| `fk_church_memberships_church_id` | `church_memberships` | `church_id` | `churches(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_church_id` |
| `fk_church_memberships_initiated_by_user_account_id` | `church_memberships` | `initiated_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_memberships_initiated_by_user_account_id` |
| `fk_church_memberships_member_id` | `church_memberships` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_church_memberships_member_time` |
| `fk_church_transfer_requests_district_decided_by_user_account_id` | `church_transfer_requests` | `district_decided_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_district_decider` |
| `fk_church_transfer_requests_member_id` | `church_transfer_requests` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_church_transfer_requests_member_time` |
| `fk_church_transfer_requests_receiving_church_id` | `church_transfer_requests` | `receiving_church_id` | `churches(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_receiving_church_id` |
| `fk_church_transfer_requests_receiving_decided_by_user_a_081ab9` | `church_transfer_requests` | `receiving_decided_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_receiving_decider` |
| `fk_church_transfer_requests_requested_by_user_account_id` | `church_transfer_requests` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_requested_by_user_account_id` |
| `fk_church_transfer_requests_source_church_id` | `church_transfer_requests` | `source_church_id` | `churches(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_church_transfer_requests_source_church_id` |
| `fk_churches_district_id` | `churches` | `district_id` | `districts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_churches_district_code` |
| `fk_credential_definition_versions_approved_by_user_account_id` | `credential_definition_versions` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_definition_versions_approver` |
| `fk_credential_definition_versions_credential_definition_id` | `credential_definition_versions` | `credential_definition_id` | `credential_definitions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_credential_definition_versions` |
| `fk_credential_definitions_issuer_scope_church_id` | `credential_definitions` | `issuer_scope_church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_definitions_issuer_scope_church_id` |
| `fk_credential_definitions_issuer_scope_district_id` | `credential_definitions` | `issuer_scope_district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_definitions_issuer_scope_district_id` |
| `fk_credential_evidence_credential_issuance_id` | `credential_evidence` | `credential_issuance_id` | `credential_issuances(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_credential_evidence_issuance` |
| `fk_credential_evidence_submitted_by_user_account_id` | `credential_evidence` | `submitted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_evidence_submitted_by_user_account_id` |
| `fk_credential_evidence_verified_by_user_account_id` | `credential_evidence` | `verified_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_evidence_verified_by_user_account_id` |
| `fk_credential_issuances_approved_by_user_account_id` | `credential_issuances` | `approved_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_approved_by_user_account_id` |
| `fk_credential_issuances_credential_definition_version_id` | `credential_issuances` | `credential_definition_version_id` | `credential_definition_versions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_credential_definition_version_id` |
| `fk_credential_issuances_issuer_user_account_id` | `credential_issuances` | `issuer_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_issuer_user_account_id` |
| `fk_credential_issuances_member_id` | `credential_issuances` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_credential_issuances_member_date` |
| `fk_credential_issuances_prior_issuance_id` | `credential_issuances` | `prior_issuance_id` | `credential_issuances(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_credential_issuances_prior_issuance_id` |
| `fk_department_eligibility_rules_department_id` | `department_eligibility_rules` | `department_id` | `departments(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_department_eligibility_rules_version` |
| `fk_department_memberships_approved_by_user_account_id` | `department_memberships` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_approved_by_user_account_id` |
| `fk_department_memberships_department_id` | `department_memberships` | `department_id` | `departments(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_department_id` |
| `fk_department_memberships_eligibility_rule_id` | `department_memberships` | `eligibility_rule_id` | `department_eligibility_rules(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_eligibility_rule_id` |
| `fk_department_memberships_ended_by_user_account_id` | `department_memberships` | `ended_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_ended_by_user_account_id` |
| `fk_department_memberships_member_id` | `department_memberships` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_department_memberships_member_time` |
| `fk_department_memberships_requested_by_user_account_id` | `department_memberships` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_department_memberships_requested_by_user_account_id` |
| `fk_departments_district_id` | `departments` | `district_id` | `districts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_departments_district_id` |
| `fk_event_approvals_event_id` | `event_approvals` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_approvals_event_id` |
| `fk_event_approvals_reviewer_user_account_id` | `event_approvals` | `reviewer_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_approvals_reviewer_user_account_id` |
| `fk_event_attendance_subjects_created_by_user_account_id` | `event_attendance_subjects` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_attendance_subjects_created_by_user_account_id` |
| `fk_event_attendance_subjects_event_id` | `event_attendance_subjects` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_event_attendance_subject_event_member` |
| `fk_event_attendance_subjects_member_id` | `event_attendance_subjects` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_attendance_subjects_member_id` |
| `fk_event_change_records_approved_by_user_account_id` | `event_change_records` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_change_records_approved_by_user_account_id` |
| `fk_event_change_records_event_id` | `event_change_records` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_change_records_event_id` |
| `fk_event_change_records_requested_by_user_account_id` | `event_change_records` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_change_records_requested_by_user_account_id` |
| `fk_event_organizing_departments_assigned_by_user` | `event_organizing_departments` | `assigned_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_event_organizing_departments_assigned_by_user` |
| `fk_event_organizing_departments_department_district` | `event_organizing_departments` | `department_id,district_id` | `departments(id,district_id)` | NOT NULL / NOT NULL | UNIQUE(id,district_id), `uq_departments_id_district` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_event_organizing_departments_department_district` |
| `fk_event_organizing_departments_event_district` | `event_organizing_departments` | `event_id,district_id` | `events(id,district_id)` | NOT NULL / NOT NULL | UNIQUE(id,district_id), `uq_events_id_district` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_event_organizing_departments_event_district` |
| `fk_event_registrations_event_id` | `event_registrations` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_event_registrations_event_status` |
| `fk_event_registrations_member_id` | `event_registrations` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_event_registrations_member_id` |
| `fk_event_sessions_event_id` | `event_sessions` | `event_id` | `events(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_event_sessions_event_start` |
| `fk_events_church_district` | `events` | `church_id,district_id` | `churches(id,district_id)` | NULL / NOT NULL | UNIQUE(id,district_id), `uq_churches_id_district` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_events_church_district` |
| `fk_events_creator` | `events` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_events_created_by_user_account_id` |
| `fk_events_district` | `events` | `district_id` | `districts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_events_district_start` |
| `fk_financial_accounts_church_id` | `financial_accounts` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_accounts_church_id` |
| `fk_financial_accounts_currency_code` | `financial_accounts` | `currency_code` | `currencies(code)` | NOT NULL | PK(code) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_accounts_currency_code` |
| `fk_financial_accounts_district_id` | `financial_accounts` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_accounts_district_id` |
| `fk_financial_transactions_financial_account_id_currency_code` | `financial_transactions` | `financial_account_id,currency_code` | `financial_accounts(id,currency_code)` | NOT NULL / NOT NULL | UNIQUE(id,currency_code), `uq_financial_accounts_id_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_transactions_financial_account_id_currency_code` |
| `fk_financial_transactions_posted_by_user_account_id` | `financial_transactions` | `posted_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_transactions_posted_by_user_account_id` |
| `fk_financial_transactions_submitted_by_user_account_id` | `financial_transactions` | `submitted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_financial_transactions_submitted_by_user_account_id` |
| `fk_idempotency_actor_user` | `idempotency_records` | `actor_user_account_id` | `user_accounts(id)` | NULL; AUTHENTICATED mode only | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_idempotency_records_actor_operation` |
| `fk_idempotency_pre_auth_context` | `idempotency_records` | `pre_auth_context_id` | `pre_auth_contexts(id)` | NULL; PRE_AUTHENTICATION mode only | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_idempotency_pre_auth_identity` |
| `fk_idempotency_recovery_events_record_id` | `idempotency_recovery_events` | `idempotency_record_id` | `idempotency_records(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_idempotency_recovery_events_record_time` |
| `fk_idempotency_session_actor` | `idempotency_records` | `session_id,actor_user_account_id` | `auth_sessions(id,user_account_id)` | NULL / NULL; AUTHENTICATED mode only | UNIQUE(id,user_account_id), `uq_auth_sessions_id_user_account` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_idempotency_records_session_actor` |
| `fk_integration_failures_provider_id` | `integration_failures` | `provider_id` | `integration_providers(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_integration_failures_provider_status` |
| `fk_integration_failures_webhook_event_id` | `integration_failures` | `webhook_event_id` | `webhook_events(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_integration_failures_webhook_event_id` |
| `fk_member_category_assignments_assigned_by_user_account_id` | `member_category_assignments` | `assigned_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_member_category_assignments_assigned_by_user_account_id` |
| `fk_member_category_assignments_eligibility_rule_id` | `member_category_assignments` | `eligibility_rule_id` | `member_category_eligibility_rules(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_member_category_assignments_eligibility_rule_id` |
| `fk_member_category_assignments_member_category_id` | `member_category_assignments` | `member_category_id` | `member_categories(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_member_category_assignments_member_category_id` |
| `fk_member_category_assignments_member_id` | `member_category_assignments` | `member_id` | `members(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_member_category_assignments_member_time` |
| `fk_member_category_eligibility_rules_approved_by` | `member_category_eligibility_rules` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_member_category_eligibility_rules_approver` |
| `fk_member_category_eligibility_rules_category` | `member_category_eligibility_rules` | `member_category_id` | `member_categories(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_member_category_eligibility_rules_version` |
| `fk_members_user_account_id` | `members` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_members_user_account` |
| `fk_notification_deliveries_notification_recipient_id` | `notification_deliveries` | `notification_recipient_id` | `notification_recipients(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_notification_deliveries_attempt` |
| `fk_notification_deliveries_provider_id` | `notification_deliveries` | `provider_id` | `integration_providers(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_notification_deliveries_provider_id` |
| `fk_notification_preferences_user_account_id` | `notification_preferences` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_notification_preferences_user_account_id` |
| `fk_notification_recipients_notification_id` | `notification_recipients` | `notification_id` | `notifications(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_notification_recipients_notification_user` |
| `fk_notification_recipients_user_account_id` | `notification_recipients` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_notification_recipients_user_status` |
| `fk_notifications_template_id` | `notifications` | `template_id` | `notification_templates(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_notifications_template_id` |
| `fk_outbox_messages_idempotency_record_id` | `outbox_messages` | `idempotency_record_id` | `idempotency_records(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_outbox_messages_idempotency_record_id` |
| `fk_outbox_messages_password_reset_token_id` | `outbox_messages` | `password_reset_token_id` | `password_reset_tokens(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_outbox_messages_password_reset_token_id` |
| `fk_password_reset_tokens_user_account_id` | `password_reset_tokens` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_password_reset_tokens_account_expiry` |
| `fk_payments_financial_transaction_id_currency_code` | `payments` | `financial_transaction_id,currency_code` | `financial_transactions(id,currency_code)` | NOT NULL / NOT NULL | UNIQUE(id,currency_code), `uq_financial_transactions_id_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_payments_financial_transaction_id_currency_code` |
| `fk_payments_provider_id` | `payments` | `provider_id` | `integration_providers(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_payments_provider_id` |
| `fk_positions_church_id` | `positions` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_positions_church_id` |
| `fk_positions_department_id` | `positions` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_positions_department_id` |
| `fk_positions_district_id` | `positions` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_positions_district_id` |
| `fk_report_data_owners_approved_by` | `report_data_owners` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_data_owners_approver` |
| `fk_report_definitions_approved_by_user_account_id` | `report_definitions` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_definitions_approved_by_user_account_id` |
| `fk_report_definitions_created_by_user_account_id` | `report_definitions` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_definitions_created_by_user_account_id` |
| `fk_report_definitions_data_owner_id` | `report_definitions` | `data_owner_id` | `report_data_owners(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_definitions_data_owner_id` |
| `fk_report_export_audits_actor_user_account_id` | `report_export_audits` | `actor_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_export_audits_actor_time` |
| `fk_report_export_audits_report_run_id` | `report_export_audits` | `report_run_id` | `report_runs(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_export_audits_run_time` |
| `fk_report_runs_report_definition_id_report_definition_version` | `report_runs` | `report_definition_id,report_definition_version` | `report_definitions(id,version)` | NOT NULL / NOT NULL | UNIQUE(id,version), `uq_report_definitions_id_version` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_report_runs_definition_version` |
| `fk_report_runs_requested_by_user_account_id` | `report_runs` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_runs_requester_time` |
| `fk_report_runs_scope_church_district` | `report_runs` | `scope_church_id,scope_district_id` | `churches(id,district_id)` | NULL / NOT NULL | UNIQUE(id,district_id), `uq_churches_id_district` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_runs_scope_church_district` |
| `fk_report_runs_scope_department_district` | `report_runs` | `scope_department_id,scope_district_id` | `departments(id,district_id)` | NULL / NOT NULL | UNIQUE(id,district_id), `uq_departments_id_district` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_runs_scope_department_district` |
| `fk_report_runs_scope_district_id` | `report_runs` | `scope_district_id` | `districts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_report_runs_scope_district_kind` |
| `fk_retention_actions_approver` | `retention_actions` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_actions_approved_by_user_account_id` |
| `fk_retention_actions_initiator` | `retention_actions` | `initiated_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_actions_initiated_by_user_account_id` |
| `fk_retention_actions_policy` | `retention_actions` | `retention_policy_id` | `retention_policies(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_actions_retention_policy_id` |
| `fk_retention_actions_subject` | `retention_actions` | `retention_subject_id` | `retention_subjects(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_retention_actions_subject_time` |
| `fk_retention_holds_approver` | `retention_holds` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_holds_approved_by_user_account_id` |
| `fk_retention_holds_issuer` | `retention_holds` | `issued_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_holds_issued_by_user_account_id` |
| `fk_retention_holds_subject` | `retention_holds` | `retention_subject_id` | `retention_subjects(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_retention_holds_subject_status` |
| `fk_retention_subjects_creator` | `retention_subjects` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_retention_subjects_created_by_user_account_id` |
| `fk_role_conflict_reviews_reviewed_by_user_account_id` | `role_conflict_reviews` | `reviewed_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_reviews_reviewed_by_user_account_id` |
| `fk_role_conflict_reviews_role_conflict_rule_id` | `role_conflict_reviews` | `role_conflict_rule_id` | `role_conflict_rules(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_reviews_role_conflict_rule_id` |
| `fk_role_conflict_reviews_user_account_id` | `role_conflict_reviews` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_reviews_user_account_id` |
| `fk_role_conflict_rules_role_a_id` | `role_conflict_rules` | `role_a_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_role_conflict_rules_pair_version` |
| `fk_role_conflict_rules_role_b_id` | `role_conflict_rules` | `role_b_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_conflict_rules_role_b_id` |
| `fk_role_permissions_permission_id` | `role_permissions` | `permission_id` | `permissions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_role_permissions_permission_id` |
| `fk_role_permissions_role_id` | `role_permissions` | `role_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_role_permissions_role_permission` |
| `fk_transaction_approvals_approver_user_account_id` | `transaction_approvals` | `approver_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_approvals_approver_user_account_id` |
| `fk_transaction_approvals_financial_transaction_id` | `transaction_approvals` | `financial_transaction_id` | `financial_transactions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_transaction_approvals_transaction_time` |
| `fk_transaction_reversals_approved_by_user_account_id` | `transaction_reversals` | `approved_by_user_account_id` | `user_accounts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_approved_by_user_account_id` |
| `fk_transaction_reversals_initiated_by_user_account_id` | `transaction_reversals` | `initiated_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_initiated_by_user_account_id` |
| `fk_transaction_reversals_original_transaction_id_financ_aba661` | `transaction_reversals` | `original_transaction_id,financial_account_id,currency_code` | `financial_transactions(id,financial_account_id,currency_code)` | NOT NULL / NOT NULL / NOT NULL | UNIQUE(id,financial_account_id,currency_code), `uq_financial_transactions_id_account_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_original_tuple` |
| `fk_transaction_reversals_reversal_transaction_id_financ_9b229f` | `transaction_reversals` | `reversal_transaction_id,financial_account_id,currency_code` | `financial_transactions(id,financial_account_id,currency_code)` | NOT NULL / NOT NULL / NOT NULL | UNIQUE(id,financial_account_id,currency_code), `uq_financial_transactions_id_account_currency` | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_reversals_reversal_tuple` |
| `fk_transaction_revisions_financial_transaction_id` | `transaction_revisions` | `financial_transaction_id` | `financial_transactions(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_transaction_revisions_transaction_number` |
| `fk_transaction_revisions_requested_by_user_account_id` | `transaction_revisions` | `requested_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_transaction_revisions_requested_by_user_account_id` |
| `fk_ura_church` | `user_role_assignments` | `church_id` | `churches(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_church_id` |
| `fk_ura_department` | `user_role_assignments` | `department_id` | `departments(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_department_id` |
| `fk_ura_district` | `user_role_assignments` | `district_id` | `districts(id)` | NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_district_id` |
| `fk_ura_granted_by_user` | `user_role_assignments` | `granted_by_user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_user_role_assignments_granted_by_user_account_id` |
| `fk_ura_role` | `user_role_assignments` | `role_id` | `roles(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_fk_user_role_assignments_role_id` |
| `fk_ura_user_account` | `user_role_assignments` | `user_account_id` | `user_accounts(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `ix_user_role_assignments_user_scope` |
| `fk_webhook_events_provider_id` | `webhook_events` | `provider_id` | `integration_providers(id)` | NOT NULL | PK(id) | MATCH SIMPLE | RESTRICT | RESTRICT | `uq_webhook_events_provider_event` |

## 4. Critical composite relationship contracts

### 4.1 User account and member

`members.user_account_id` remains UNIQUE and NOT NULL, enforcing at most one member per account. Member provisioning must create the account and member relationship through the approved atomic workflow. No guardian or shared-account relationship is permitted.

### 4.2 Authentication session ownership

`auth_sessions` exposes UNIQUE `(id,user_account_id)`. Authenticated idempotency references `(session_id,actor_user_account_id)` to that exact tuple. A session cannot be attached to a different actor.

### 4.3 DDD-013 identity modes

- AUTHENTICATED: actor is present; pre-auth context is absent; session is present for session-bound operations and may be absent only for endpoint contracts explicitly defined as principal-scoped.
- PRE_AUTHENTICATION: pre-auth context is present; actor and session are absent.
- The mode CHECK and two partial unique indexes are mandatory.
- A pre-auth context is not an authenticated session and grants no application permission.
- The raw pre-auth secret is never stored; only a digest is stored for the ten-minute cookie lifetime.

### 4.4 Department and event ownership

Departments are district-owned and reference one district. Events always carry their district boundary; a church-owned event uses the composite church/district FK. Department organizing participation is a separate join entity with composite FKs to event/district and department/district. Department ownership of events is not permitted.

### 4.5 Attendance

The attendance subject composite FK binds attendance to one event/member pair. Optional registration and session FKs use MATCH SIMPLE because their identifier columns are nullable while event/member context remains NOT NULL. A registration exception must carry complete actor/reason/time evidence.

### 4.6 Reporting

Every report run is bound to a district and may additionally identify exactly one church or department scope. No GLOBAL or cross-district report scope is supported in v1. Church/department composite FKs must match the same district. Report definitions reference an approved data-owner catalogue entry.

### 4.7 Retention

Retention holds and actions reference an exact retention subject. Source-record enrollment remains blocked until ODR-011 identifies approved record classes and schedules. Do not introduce polymorphic business ownership FKs.

## 5. Source-index integrity

Every FK source tuple must have a supporting index whose leading columns match the exact ordered source tuple. A partial unique index may support a nullable-mode FK only when its predicate covers every possible referencing row by an enforced CHECK. Target composite tuples must have exact UNIQUE candidate keys.

The canonical index inventory and ERD approval manifest must reconcile all supporting indexes, including session ownership, outbox references, recovery events, event organizer tuples, category rule provenance and report owner references.

## 6. Approval boundary

This register is a physical-design proposal. It does not approve DDL, Prisma models, migrations, database objects, seeds, API implementation or application code. Final physical ERD approval and separate implementation authorization remain outstanding.

