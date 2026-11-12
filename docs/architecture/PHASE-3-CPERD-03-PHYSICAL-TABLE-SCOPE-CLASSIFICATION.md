# DYMS CPERD-03 — Physical Table Scope Classification

- Revision: 0.1
- Date: 2026-11-12
- Source: CPERD-02 canonical physical column register, SHA `f1979b191fe98da487ada89e4409fde838ad3c47`
- Status: **FIRST-PASS SCOPE CLASSIFICATION — NOT A CANONICAL SUCCESSOR REGISTER**
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Purpose and limits

This document classifies the CPERD-02 physical tables against the DYMS 1.0 scope baseline. It remains a first-pass scope filter, not the final CPERD-03 table or column inventory. The successor column register now records a mechanical 57-table/547-column first-pass candidate, not a certified final inventory.

The CPERD-02 source contains 70 tables and 692 column declarations. The classifications below are intended to prevent deferred capabilities from leaking into the successor model.

## 2. Tables excluded from DYMS 1.0

### 2.1 Church Transfer — excluded

| Table | CPERD-02 columns | CPERD-03 disposition |
|---|---:|---|
| `church_transfer_requests` | 17 | EXCLUDE |

All transfer-only API commands, lifecycle states, indexes, constraints, trigger/transaction contracts, permissions and report definitions must also be excluded.

### 2.2 Finance and payment management — deferred

| Table | CPERD-02 columns | CPERD-03 disposition |
|---|---:|---|
| `financial_accounts` | 9 | DEFER |
| `currencies` | 4 | DEFER |
| `financial_transactions` | 14 | DEFER |
| `transaction_revisions` | 10 | DEFER |
| `transaction_approvals` | 7 | DEFER |
| `payments` | 11 | DEFER |
| `transaction_reversals` | 15 | DEFER |
| `budgets` | 15 | DEFER |
| `budget_lines` | 10 | DEFER |

The approved NUMERIC(19,4) monetary standard remains a future design standard. It does not justify retaining finance tables in DYMS 1.0.

### 2.3 Credential issuance and evidence — deferred

| Table | CPERD-02 columns | CPERD-03 disposition |
|---|---:|---|
| `credential_definitions` | 6 | DEFER |
| `credential_definition_versions` | 10 | DEFER |
| `credential_issuances` | 12 | DEFER |
| `credential_evidence` | 9 | DEFER |

The membership model must preserve the distinction between membership category and credential. Adventurer, Pathfinder and Senior Youth remain member categories. Master Guide is not a member category. This classification does not authorize credential issuance, evidence storage or verification features in DYMS 1.0.

## 3. Existing tables retained for first-pass DYMS 1.0 scope

The following 56 CPERD-02 tables are retained for further reconciliation. Retention here means the table has a plausible in-scope responsibility; it does not certify every column, relationship, index, API or requirement mapping.

### Identity and access (5)
- `user_accounts`
- `members`
- `auth_sessions`
- `auth_session_tokens`
- `password_reset_tokens`

### Organization and membership (7)
- `districts`
- `churches`
- `member_categories`
- `member_category_assignments`
- `church_memberships`
- `departments`
- `department_eligibility_rules`

### Department membership and leadership (14)
- `department_memberships`
- `positions`
- `appointments`
- `roles`
- `permissions`
- `role_permissions`
- `user_role_assignments`
- `appointment_role_links`
- `access_denies`
- `role_conflict_rules`
- `role_conflict_reviews`
- `member_category_eligibility_rules`
- `service_principals`
- `idempotency_records`

### Events and attendance (9)
- `events`
- `event_approvals`
- `event_change_records`
- `event_registrations`
- `event_sessions`
- `attendance_records`
- `attendance_corrections`
- `event_attendance_subjects`
- `event_organizing_departments`

### Notifications and integration operations (9)
- `notification_templates`
- `notification_preferences`
- `notifications`
- `notification_recipients`
- `integration_providers`
- `notification_deliveries`
- `outbox_messages`
- `webhook_events`
- `integration_failures`

Provider and webhook records must be restricted to included notification/integration purposes. Payment-provider functionality is excluded with finance.

### Audit, retention and reporting (8)
- `audit_events`
- `audit_access_events`
- `retention_policies`
- `retention_holds`
- `retention_actions`
- `report_definitions`
- `report_runs`
- `report_export_audits`

### Security and workflow support (4)
- `pre_auth_contexts`
- `idempotency_recovery_events`
- `retention_subjects`
- `report_data_owners`

The group headings are responsibility groupings, not separate bounded-context approvals. The canonical context ownership must be reconciled in the CPERD-03 master.

## 4. Required federation entity

CPERD-02 has no `federations` table and no `districts.federation_id`, although the approved organizational hierarchy is Federation → District → Local Church.

CPERD-03 must add a federation entity and district ownership relationship.

Candidate minimum federation attributes for design review:
- `id`: PostgreSQL UUID, application-generated UUIDv7.
- `code`: federation identifier.
- `name`: display name.
- `status`: stable technical state.
- `created_at`: trusted creation instant.
- `updated_at`: trusted update instant.

Required district change:
- Add non-null `federation_id` referencing `federations(id)`.
- Enforce `UNIQUE (federation_id, code)` for district codes.
- Ensure child records cannot cross district ownership boundaries.

These are design candidates. The exact lifecycle values, defaults, naming and constraints must be reconciled across all registers before final approval.

## 5. Church membership transfer-field correction

The CPERD-02 `church_memberships` table contains the following transfer-associated columns:
- `initiated_by_user_account_id`
- `accepted_by_user_account_id`
- `approved_by_user_account_id`

These columns must not be carried forward merely to preserve the excluded transfer workflow.

CPERD-03 must decide and document the appropriate membership-creation actor provenance using the approved membership lifecycle and audit design. Do not silently rename a transfer actor field or assume the member is the creator. The current membership record must support ACTIVE, SUSPENDED and TERMINATED semantics, with reactivation restoring the same suspended record. The audit event stream must preserve transition actor, time and reason.

## 6. First-pass arithmetic only

Removing the 14 tables listed in Section 2 from CPERD-02 leaves 56 existing tables and 543 existing column declarations.

Adding one federation table with six candidate columns and one `districts.federation_id` column, then removing the three transfer-associated actor columns from `church_memberships`, gives a simple first-pass arithmetic projection of 57 tables and 547 columns.

**These figures are not canonical CPERD-03 counts.** They exclude further changes required by:
- Column default and nullability reconciliation.
- Stable ENUM and lookup-table normalization.
- Membership lifecycle metadata and audit mapping.
- Federation composite keys and supporting indexes.
- Additional scope corrections discovered during FK, index, trigger, API and requirements reconciliation.
- Any other approved design correction.

Only regenerated canonical registers and a static verification report establish final CPERD-03 counts.

## 7. Required follow-on reconciliation

1. Regenerate the column register from retained tables and approved federation additions.
2. Remove all FKs to excluded transfer, finance and credential tables.
3. Add federation/district FK and composite ownership keys.
4. Remove transfer-only membership actor FKs and indexes.
5. Rebuild unique indexes from approved current-state predicates.
6. Remove finance, transfer and credential CHECK/trigger definitions.
7. Restrict integration-provider records to included channels and purposes.
8. Remove deferred finance/transfer/credential report definitions and mappings.
9. Classify every requirement as included, deferred, excluded or cross-cutting.
10. Regenerate all inventory counts and exact artifact hashes.

## 8. Implementation boundary

This is documentation-only scope classification.

**No Prisma schema, SQL DDL, migration, database object, seed, application code, CI or deployment change is authorized.**
