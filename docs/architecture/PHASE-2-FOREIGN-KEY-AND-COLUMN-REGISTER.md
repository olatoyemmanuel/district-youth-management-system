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
- Proposed supporting index names follow `ix_fk_<table>_<source_columns>`. Where several actor FKs point to the same target table, each independently queried actor column receives its own index unless workload review documents otherwise.
- Composite FK targets must have a matching PK/UNIQUE candidate key with the exact ordered columns.
- Nullable FK means the relationship is optional at the point represented. It does not authorize deletion of the referenced row.
- The final DDL review must verify every index against query plans and avoid redundant indexes.

## 3. Canonical FK register

| Table | Source column(s) | Target column(s) | Nullability / scope | Proposed supporting index |
|---|---|---|---|---|
| `user_accounts` | None | — | No parent FK | — |
| `members` | `user_account_id` | `user_accounts(id)` | NOT NULL, UNIQUE | `uq_members_user_account` |
| `auth_sessions` | `user_account_id` | `user_accounts(id)` | NOT NULL | `ix_fk_auth_sessions_user_account_id` |
| `auth_session_tokens` | `auth_session_id` | `auth_sessions(id)` | NOT NULL | `ix_fk_auth_session_tokens_auth_session_id` |
| `password_reset_tokens` | `user_account_id` | `user_accounts(id)` | NOT NULL | `ix_fk_password_reset_tokens_user_account_id` |
| `districts` | None | — | No parent FK | — |
| `churches` | `district_id` | `districts(id)` | NOT NULL | `ix_fk_churches_district_id`; candidate UNIQUE `(id,district_id)` |
| `member_categories` | None | — | No parent FK | — |
| `member_category_assignments` | `member_id`; `member_category_id`; `assigned_by_user_account_id` | `members(id)`; `member_categories(id)`; `user_accounts(id)` | All NOT NULL | `ix_fk_member_category_assignments_member_id`; `ix_fk_member_category_assignments_member_category_id`; `ix_fk_member_category_assignments_assigned_by_user_account_id` |
| `church_memberships` | `member_id`; `church_id`; `initiated_by_user_account_id`; `accepted_by_user_account_id`; `approved_by_user_account_id` | `members(id)`; `churches(id)`; `user_accounts(id)` for each actor | Member/church/initiator NOT NULL; acceptor/approver NULL | `ix_fk_church_memberships_member_id`; `ix_fk_church_memberships_church_id`; actor indexes for initiator, acceptor, approver |
| `church_transfer_requests` | `member_id`; `source_church_id`; `receiving_church_id`; `requested_by_user_account_id`; `receiving_decided_by_user_account_id`; `district_decided_by_user_account_id` | `members(id)`; `churches(id)` for both church columns; `user_accounts(id)` for each actor | Member/source/receiving/requester NOT NULL; decision actors NULL | One index per source FK column using `ix_fk_church_transfer_requests_<column>` |
| `departments` | `district_id`; `church_id` | `districts(id)`; `churches(id)` | District NOT NULL; church NULL. If both are stored, require composite FK `(church_id,district_id) → churches(id,district_id)` | `ix_fk_departments_district_id`; `ix_fk_departments_church_id` |
| `department_eligibility_rules` | `department_id` | `departments(id)` | NOT NULL | `ix_fk_department_eligibility_rules_department_id` |
| `department_memberships` | `member_id`; `department_id`; `requested_by_user_account_id`; `approved_by_user_account_id`; `ended_by_user_account_id`; `eligibility_rule_id` | `members(id)`; `departments(id)`; `user_accounts(id)` for actor columns; `department_eligibility_rules(id)` | Member/department/requester NOT NULL; approver/ender/rule NULL | One index per FK column using `ix_fk_department_memberships_<column>` |
| `positions` | `district_id`; `church_id`; `department_id` | `districts(id)`; `churches(id)`; `departments(id)` | Exactly one scope FK NOT NULL per row; all three columns individually nullable. Department and church hierarchy must be inherited from referenced parent, not duplicated inconsistently. | `ix_fk_positions_district_id`; `ix_fk_positions_church_id`; `ix_fk_positions_department_id` |
| `appointments` | `position_id`; `appointee_member_id`; `appointing_authority_user_account_id`; `approved_by_user_account_id` | `positions(id)`; `members(id)`; `user_accounts(id)` for both authority columns | All NOT NULL. Appointment scope is inherited from position; no duplicated scope FK | `ix_fk_appointments_position_id`; `ix_fk_appointments_appointee_member_id`; separate authority and approver indexes |
| `roles` | None | — | No parent FK | — |
| `permissions` | None | — | No parent FK | — |
| `role_permissions` | `role_id`; `permission_id` | `roles(id)`; `permissions(id)` | Both NOT NULL | UNIQUE `(role_id,permission_id)` also supports both FKs |
| `user_role_assignments` | `user_account_id`; `role_id`; `granted_by_user_account_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `roles(id)`; `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Actor/role/grantor NOT NULL; exactly one scope FK populated, remaining scope FKs NULL | One index per FK column; scoped composite index begins with role/scope columns used by authorization |
| `appointment_role_links` | `appointment_id`; `role_id`; `created_by_user_account_id` | `appointments(id)`; `roles(id)`; `user_accounts(id)` | All NOT NULL | UNIQUE `(appointment_id,role_id,mapping_version)`; `ix_fk_appointment_role_links_role_id`; `ix_fk_appointment_role_links_created_by_user_account_id` |
| `access_denies` | `target_user_account_id`; `permission_id`; `district_id`; `church_id`; `department_id`; `issued_by_user_account_id`; `reviewed_by_user_account_id` | `user_accounts(id)`; `permissions(id)`; `districts(id)`; `churches(id)`; `departments(id)`; `user_accounts(id)` for issuer/reviewer | Target/permission/issuer NOT NULL; exactly one scope FK populated; reviewer NULL | One index per FK column; target/permission/scope composite access index |
| `role_conflict_rules` | `role_a_id`; `role_b_id` | `roles(id)` for both | Both NOT NULL | UNIQUE canonical role pair/version supports both |
| `role_conflict_reviews` | `user_account_id`; `role_conflict_rule_id`; `reviewed_by_user_account_id` | `user_accounts(id)`; `role_conflict_rules(id)`; `user_accounts(id)` | All NOT NULL | `ix_fk_role_conflict_reviews_user_account_id`; `ix_fk_role_conflict_reviews_role_conflict_rule_id`; `ix_fk_role_conflict_reviews_reviewed_by_user_account_id` |
| `events` | `district_id`; `church_id`; `department_id`; `created_by_user_account_id` | `districts(id)`; `churches(id)`; `departments(id)`; `user_accounts(id)` | Exactly one owner FK populated; creator NOT NULL. Owner columns and hierarchy composite keys require final event-scope binding | One index per owner FK and creator |
| `event_approvals` | `event_id`; `reviewer_user_account_id` | `events(id)`; `user_accounts(id)` | Both NOT NULL | `ix_fk_event_approvals_event_id`; `ix_fk_event_approvals_reviewer_user_account_id` |
| `event_change_records` | `event_id`; `requested_by_user_account_id`; `approved_by_user_account_id` | `events(id)`; `user_accounts(id)` for both actors | Event/requester NOT NULL; approver NULL | One index per FK column |
| `event_registrations` | `event_id`; `member_id` | `events(id)`; `members(id)` | Both NOT NULL; candidate UNIQUE `(id,event_id,member_id)` | `ix_fk_event_registrations_event_id`; `ix_fk_event_registrations_member_id` |
| `event_sessions` | `event_id` | `events(id)` | NOT NULL; UNIQUE `(id,event_id)` | `ix_fk_event_sessions_event_id` |
| `event_attendance_subjects` | `event_id`; `member_id`; `created_by_user_account_id` | `events(id)`; `members(id)`; `user_accounts(id)` | All NOT NULL; UNIQUE `(event_id,member_id)` and `(id,event_id,member_id)` | UNIQUE keys support event/member subject lookup; `ix_fk_event_attendance_subjects_created_by_user_account_id` |
| `attendance_records` | `attendance_subject_id,event_id,member_id`; `registration_id,event_id,member_id`; `event_session_id,event_id`; `event_id`; `member_id`; `recorded_by_user_account_id` | `event_attendance_subjects(id,event_id,member_id)`; `event_registrations(id,event_id,member_id)`; `event_sessions(id,event_id)`; `events(id)`; `members(id)`; `user_accounts(id)` | Subject/event/member NOT NULL; registration nullable as a complete composite; session nullable as a complete composite; recorder NOT NULL. Redundant standalone event/member FKs may be retained only if they serve an explicit independent integrity/query need and do not conflict with composite FKs. | Composite source indexes on `(attendance_subject_id,event_id,member_id)`, `(registration_id,event_id,member_id)`, `(event_session_id,event_id)`; plus `(event_id,member_id)` where not covered |
| `attendance_corrections` | `attendance_record_id`; `requested_by_user_account_id`; `approved_by_user_account_id` | `attendance_records(id)`; `user_accounts(id)` for both actors | Record/requester NOT NULL; approver NULL | `ix_fk_attendance_corrections_attendance_record_id`; requester/approver indexes |
| `financial_accounts` | `district_id`; `church_id`; `currency_code` | `districts(id)`; `churches(id)`; `currencies(code)` | Exactly one district/church owner; currency NOT NULL | `ix_fk_financial_accounts_district_id`; `ix_fk_financial_accounts_church_id`; `ix_fk_financial_accounts_currency_code` |
| `currencies` | None | — | Primary reference catalogue | — |
| `financial_transactions` | `financial_account_id,currency_code`; `submitted_by_user_account_id`; `posted_by_user_account_id` | `financial_accounts(id,currency_code)`; `user_accounts(id)` for submitter/poster | Account/currency and submitter NOT NULL; poster NULL. Candidate UNIQUE `(id,currency_code)` and `(id,financial_account_id,currency_code)` | Composite account/currency index via candidate key; submitter/poster indexes |
| `transaction_revisions` | `financial_transaction_id`; `requested_by_user_account_id` | `financial_transactions(id)`; `user_accounts(id)` | Both NOT NULL | UNIQUE `(financial_transaction_id,revision_number)`; requester index |
| `transaction_approvals` | `financial_transaction_id`; `approver_user_account_id` | `financial_transactions(id)`; `user_accounts(id)` | Both NOT NULL | `ix_fk_transaction_approvals_financial_transaction_id`; `ix_fk_transaction_approvals_approver_user_account_id` |
| `payments` | `financial_transaction_id,currency_code`; `provider_id` | `financial_transactions(id,currency_code)`; `integration_providers(id)` | Transaction/currency NOT NULL; provider NULL | `ix_fk_payments_financial_transaction_id_currency_code`; `ix_fk_payments_provider_id` |
| `transaction_reversals` | `original_transaction_id,financial_account_id,currency_code`; `reversal_transaction_id,financial_account_id,currency_code`; `initiated_by_user_account_id`; `approved_by_user_account_id` | `financial_transactions(id,financial_account_id,currency_code)` for both transaction links; `user_accounts(id)` for actors | Both transaction links and account/currency NOT NULL; initiator NOT NULL; approver NULL | Composite indexes on both transaction FK tuples; initiator/approver indexes |
| `budgets` | `district_id`; `church_id`; `currency_code`; `submitted_by_user_account_id`; `approved_by_user_account_id` | `districts(id)`; `churches(id)`; `currencies(code)`; `user_accounts(id)` for actors | Exactly one district/church owner; currency/submitter NOT NULL; approver NULL. Owner/approval model remains policy-blocked | One index per FK column; UNIQUE `(id,currency_code)` |
| `budget_lines` | `budget_id,currency_code` | `budgets(id,currency_code)` | Both NOT NULL | Composite FK index `ix_fk_budget_lines_budget_id_currency_code`; unique budget/line_code and budget/sort_order |
| `credential_definitions` | `issuer_scope_district_id`; `issuer_scope_church_id` | `districts(id)`; `churches(id)` | Both nullable pending explicit issuer-scope/global-definition rule; do not assume exactly one until approved | `ix_fk_credential_definitions_issuer_scope_district_id`; `ix_fk_credential_definitions_issuer_scope_church_id` |
| `credential_definition_versions` | `credential_definition_id`; `approved_by_user_account_id` | `credential_definitions(id)`; `user_accounts(id)` | Definition NOT NULL; approver NULL | UNIQUE `(credential_definition_id,version)`; approver index |
| `credential_issuances` | `member_id`; `credential_definition_version_id`; `issuer_user_account_id`; `approved_by_user_account_id`; `prior_issuance_id` | `members(id)`; `credential_definition_versions(id)`; `user_accounts(id)` for issuer/approver; self-FK `credential_issuances(id)` | Member/definition/issuer/approver NOT NULL; prior issuance NULL | One index per FK; prior-issuance index |
| `credential_evidence` | `credential_issuance_id`; `submitted_by_user_account_id`; `verified_by_user_account_id` | `credential_issuances(id)`; `user_accounts(id)` for submitter/verifier | Issuance/submitter NOT NULL; verifier NULL | One index per FK column |
| `notification_templates` | None | — | No parent FK | — |
| `notification_preferences` | `user_account_id` | `user_accounts(id)` | NOT NULL | `ix_fk_notification_preferences_user_account_id` |
| `notifications` | `template_id` | `notification_templates(id)` | NULL | `ix_fk_notifications_template_id` |
| `notification_recipients` | `notification_id`; `user_account_id` | `notifications(id)`; `user_accounts(id)` | Both NOT NULL | UNIQUE `(notification_id,user_account_id)` supports notification FK; `ix_fk_notification_recipients_user_account_id` |
| `integration_providers` | None | — | No parent FK | — |
| `notification_deliveries` | `notification_recipient_id`; `provider_id` | `notification_recipients(id)`; `integration_providers(id)` | Both NOT NULL | UNIQUE `(notification_recipient_id,attempt_number)` supports recipient FK; `ix_fk_notification_deliveries_provider_id` |
| `outbox_messages` | None | — | Aggregate reference is event metadata, intentionally not a polymorphic FK | — |
| `webhook_events` | `provider_id` | `integration_providers(id)` | NOT NULL | `ix_fk_webhook_events_provider_id`; UNIQUE `(provider_id,provider_event_id)` |
| `integration_failures` | `provider_id`; `webhook_event_id` | `integration_providers(id)`; `webhook_events(id)` | Provider NOT NULL; webhook event NULL | `ix_fk_integration_failures_provider_id`; `ix_fk_integration_failures_webhook_event_id` |
| `service_principals` | None | — | No parent FK | — |
| `audit_events` | `actor_user_account_id`; `actor_service_principal_id`; `initiating_user_account_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `service_principals(id)`; `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Actor columns optional according to actor_type truth table; initiating actor optional; zero or one scope FK | One index per actor/scope FK where used by audit queries |
| `audit_access_events` | `accessing_user_account_id`; `audit_event_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `audit_events(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Accessing user NOT NULL; audit_event optional; zero or one scope FK | One index per FK column; actor/time and scope/time access indexes |
| `idempotency_records` | `actor_user_account_id`; `district_id`; `church_id`; `department_id` | `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Actor NOT NULL; scope_kind must select GLOBAL or exactly one scope FK; values proposed pending approval | Four scope-specific unique partial indexes; actor/operation/time access index |
| `retention_policies` | None | — | No parent FK | — |
| `retention_subjects` | `created_by_user_account_id` | `user_accounts(id)` | NOT NULL; source-record link is deliberately not invented here. Every activated source class must add a real one-to-one source FK or typed link | `ix_fk_retention_subjects_created_by_user_account_id`; source-link unique index per approved source class |
| `retention_holds` | `retention_subject_id`; `issued_by_user_account_id`; `approved_by_user_account_id` | `retention_subjects(id)`; `user_accounts(id)` for issuer/approver | Subject/issuer NOT NULL; approver NULL | `ix_fk_retention_holds_retention_subject_id`; issuer/approver indexes |
| `retention_actions` | `retention_policy_id`; `retention_subject_id`; `initiated_by_user_account_id`; `approved_by_user_account_id` | `retention_policies(id)`; `retention_subjects(id)`; `user_accounts(id)` for initiator/approver | Policy/subject/initiator NOT NULL; approver NULL | One index per FK column |
| `report_definitions` | `created_by_user_account_id`; `approved_by_user_account_id` | `user_accounts(id)` for creator/approver | Creator NOT NULL; approver NULL | `ix_fk_report_definitions_created_by_user_account_id`; `ix_fk_report_definitions_approved_by_user_account_id` |
| `report_runs` | `report_definition_id,report_definition_version`; `requested_by_user_account_id`; `scope_district_id`; `scope_church_id`; `scope_department_id` | `report_definitions(id,version)`; `user_accounts(id)`; `districts(id)`; `churches(id)`; `departments(id)` | Definition/requester NOT NULL; exactly one scope FK or explicit GLOBAL; scope_kind values pending approval | Composite definition FK index; requester/time index; one index per scope FK |
| `report_export_audits` | `report_run_id`; `actor_user_account_id` | `report_runs(id)`; `user_accounts(id)` | Both NOT NULL | `ix_fk_report_export_audits_report_run_id`; `ix_fk_report_export_audits_actor_user_account_id` |

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
