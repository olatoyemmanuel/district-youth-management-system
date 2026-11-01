# DYMS Phase 2 Medium-Severity Relational Integrity Remediation

**Status:** Proposed technical decisions and explicit blockers  
**Scope:** RIM-09 through RIM-14  
**Implementation status:** NOT AUTHORIZED

## 1. Purpose

This document records the next design pass for idempotency uniqueness, lifecycle-dependent uniqueness, named indexes, nullability/FK actions, separation-of-duties enforcement, and PostgreSQL compatibility.

It is a design proposal. It does not authorize SQL DDL, Prisma, migrations, database objects, seeds, or application changes.

## 2. RIM-09: Idempotency uniqueness without PostgreSQL 15 null semantics

### Proposed scope key

Retain explicit scope FK columns:
- `district_id uuid NULL`
- `church_id uuid NULL`
- `department_id uuid NULL`

Add a required discriminator `scope_kind varchar(20) NOT NULL` with a proposed finite set:
- `DISTRICT`: district_id populated, other scope columns null.
- `CHURCH`: church_id populated, other scope columns null.
- `DEPARTMENT`: department_id populated, other scope columns null.
- `GLOBAL`: all scope columns null.

The discriminator values are proposed. They must be approved before a final CHECK constraint or seed catalogue is created. A scope-shape CHECK ensures the discriminator and FK nullability agree. A department's district relationship is proved through the department FK or composite scope binding, not by an unverified duplicate.

### Named uniqueness strategy

Avoid `NULLS NOT DISTINCT` and avoid a polymorphic `scope_type + scope_id` reference. Use four mutually exclusive partial unique indexes:

- `uq_idempotency_global_actor_operation_key`: UNIQUE (actor_user_account_id, operation_code, key_digest) WHERE district_id IS NULL AND church_id IS NULL AND department_id IS NULL.
- `uq_idempotency_district_actor_operation_key`: UNIQUE (actor_user_account_id, operation_code, district_id, key_digest) WHERE district_id IS NOT NULL AND church_id IS NULL AND department_id IS NULL.
- `uq_idempotency_church_actor_operation_key`: UNIQUE (actor_user_account_id, operation_code, church_id, key_digest) WHERE church_id IS NOT NULL AND district_id IS NULL AND department_id IS NULL.
- `uq_idempotency_department_actor_operation_key`: UNIQUE (actor_user_account_id, operation_code, department_id, key_digest) WHERE department_id IS NOT NULL AND district_id IS NULL AND church_id IS NULL.

The normalized request fingerprint remains separate from the uniqueness key. Reuse of a key with a different fingerprint returns conflict. A retry with the same fingerprint returns the original safe result or in-progress state. The idempotency key digest is never exposed.

This design does not depend on PostgreSQL 15's `NULLS NOT DISTINCT`.

## 3. RIM-10: Lifecycle-dependent uniqueness predicates

The lifecycle catalogue distinguishes DERIVED, PROPOSED, POLICY BLOCKED, and IMMUTABLE HISTORY. No partial unique index may depend on an unapproved state string.

Use the following rule:
- Prefer temporal/end markers that are already part of the approved workflow, such as `effective_to IS NULL`, `cancelled_at IS NULL`, or `revoked_at IS NULL`, only where the source table and policy define their meaning.
- Where current/open membership depends on approval, include the required approval timestamp/decision evidence in the predicate.
- Where a row has no unambiguous temporal end marker, keep uniqueness as a documented transaction invariant until the owner approves the lifecycle contract.
- Do not treat arbitrary status strings such as ACTIVE, PENDING, APPROVED, or CANCELLED as approved enum values solely because they appear in examples.

Specific disposition:
- Member category: current primary assignment can use `effective_to IS NULL` only if status cannot represent a future or revoked assignment that remains open. Otherwise define a dedicated current marker or lifecycle transition before index design.
- Church membership: one current approved membership requires a clear approved/current marker and effective interval. The current proposal must define whether approval timestamp is sufficient or an explicit membership decision record is required.
- Church transfer: one unresolved request per member requires an explicit completion/cancellation marker. Add `resolved_at timestamptz NULL` and `cancelled_at timestamptz NULL` only after confirming the approved transition model. Until then, do not finalize a partial unique predicate.
- Department membership: active uniqueness requires the approved effective interval and an end marker. Preserve rejected/withdrawn requests as history without treating them as active membership.
- Event registration: uniqueness must distinguish a current valid registration from cancelled, rejected, waitlisted, or withdrawn rows. Those states remain unresolved, so final partial predicate is blocked.
- Notification preference: one current preference per account/channel/category requires an approved effective interval and explicit supersession rule.
- Access deny: active uniqueness must include permission and scope, but overlapping deny records may be intentional if they have distinct issuers/reasons/review periods. Do not force uniqueness until policy owner chooses whether duplicates are prohibited or retained as independent decisions.
- Role conflict reviews: preserve multiple review decisions as history. A current review slot requires a defined review cycle/version or a supersession marker; no arbitrary unique constraint is proposed now.

## 4. RIM-11: Named index register

All indexes must have stable names and a recorded purpose. Names below are proposed and must be reconciled with the final column-level catalogue. PK indexes are generated by PostgreSQL and are not repeated here.

### 4.1 Unique and partial unique indexes

| Proposed index name | Table | Key/predicate | Purpose/status |
|---|---|---|---|
| `uq_user_accounts_login_identifier` | user_accounts | login_identifier | Unique login identity; normalization and nullable policy open |
| `uq_user_accounts_email_present` | user_accounts | UNRESOLVED normalized email expression WHERE email IS NOT NULL | POLICY BLOCKED: no normalized_email column or approved deterministic expression exists in the physical definition |
| `uq_user_accounts_phone_present` | user_accounts | phone_e164 WHERE phone_e164 IS NOT NULL | Optional E.164 phone uniqueness; confirm account identity policy |
| `uq_members_user_account` | members | user_account_id | Enforce one-to-one member/account |
| `uq_members_member_number` | members | member_number | Unique member number |
| `uq_churches_district_code` | churches | district_id, code | Church code within district |
| `uq_member_categories_code` | member_categories | code | Controlled category code |
| `uq_member_category_assignments_current` | member_category_assignments | member_id WHERE UNRESOLVED current-category predicate (ODR-001) | POLICY BLOCKED pending category lifecycle approval |
| `uq_church_memberships_current` | church_memberships | member_id WHERE UNRESOLVED current-membership predicate (ODR-002) | POLICY BLOCKED pending transfer/membership lifecycle approval |
| `uq_church_transfer_requests_open_member` | church_transfer_requests | member_id WHERE UNRESOLVED open-transfer predicate (ODR-002) | POLICY BLOCKED pending open-transfer state approval |
| `uq_departments_district_code` | departments | district_id, code WHERE church_id IS NULL | District department code |
| `uq_departments_church_code` | departments | church_id, code WHERE church_id IS NOT NULL | Church department code; only if church-owned departments approved |
| `uq_department_eligibility_rules_version` | department_eligibility_rules | department_id, version | Rule version history |
| `uq_department_memberships_current` | department_memberships | member_id, department_id WHERE UNRESOLVED current-membership predicate (ODR-007) | POLICY BLOCKED pending department membership lifecycle approval |
| `uq_positions_district_code` | positions | district_id, code WHERE district_id IS NOT NULL | Position code per district scope |
| `uq_positions_church_code` | positions | church_id, code WHERE church_id IS NOT NULL | Position code per church scope |
| `uq_positions_department_code` | positions | department_id, code WHERE department_id IS NOT NULL | Position code per department scope |
| `uq_role_permissions_role_permission` | role_permissions | role_id, permission_id | Unique permission mapping |
| `uq_appointment_role_links_mapping` | appointment_role_links | appointment_id, role_id, mapping_version | Versioned appointment-role mapping |
| `uq_role_conflict_rules_pair_version` | role_conflict_rules | role_a_id, role_b_id, version | One rule per canonical pair/version |
| `uq_events_id_church` | events | id, church_id WHERE church_id IS NOT NULL AND district_id IS NULL AND department_id IS NULL | Church-scoped event candidate key |
| `uq_events_id_department` | events | id, department_id WHERE department_id IS NOT NULL AND district_id IS NULL AND church_id IS NULL | Department-scoped event candidate key |
| `uq_events_id_district` | events | id, district_id WHERE district_id IS NOT NULL AND church_id IS NULL AND department_id IS NULL | District-scoped event candidate key |
| `uq_event_registrations_current_member` | event_registrations | event_id, member_id WHERE UNRESOLVED valid-registration predicate (ODR-008) | POLICY BLOCKED pending registration state approval |
| `uq_event_sessions_id_event` | event_sessions | id, event_id | Composite session/event FK target |
| `uq_event_attendance_subject_event_member` | event_attendance_subjects | event_id, member_id | One attendance subject per member/event |
| `uq_attendance_records_event_subject` | attendance_records | attendance_subject_id WHERE event_session_id IS NULL | One event-level record |
| `uq_attendance_records_session_subject` | attendance_records | attendance_subject_id, event_session_id WHERE event_session_id IS NOT NULL | One record per session |
| `uq_financial_accounts_church_account_code` | financial_accounts | church_id, account_code WHERE church_id IS NOT NULL AND district_id IS NULL | Unique account code within church |
| `uq_financial_accounts_district_account_code` | financial_accounts | district_id, account_code WHERE district_id IS NOT NULL AND church_id IS NULL | Unique account code within district |
| `uq_financial_accounts_id_currency` | financial_accounts | id, currency_code | Composite transaction FK target |
| `uq_financial_transactions_account_reference` | financial_transactions | financial_account_id, reference | Unique reference per account |
| `uq_financial_transactions_id_account_currency` | financial_transactions | id, financial_account_id, currency_code | Reversal composite FK target |
| `uq_transaction_revisions_transaction_number` | transaction_revisions | financial_transaction_id, revision_number | Revision sequence |
| `uq_transaction_reversals_original_full` | transaction_reversals | original_transaction_id | One full reversal per original; full-only proposal |
| `uq_transaction_reversals_reversal_transaction` | transaction_reversals | reversal_transaction_id | One reversal link per reversal transaction |
| `uq_budget_lines_budget_code` | budget_lines | budget_id, line_code | Unique line code per budget |
| `uq_budget_lines_budget_order` | budget_lines | budget_id, sort_order | Stable order per budget |
| `uq_credential_definition_versions` | credential_definition_versions | credential_definition_id, version | Versioned credential definition |
| `uq_notification_templates_version_channel_locale` | notification_templates | code, version, channel, locale | Versioned localized template |
| `uq_notifications_logical_key` | notifications | logical_key | Idempotent logical notification |
| `uq_notification_recipients_notification_user` | notification_recipients | notification_id, user_account_id | One recipient per notification |
| `uq_notification_deliveries_attempt` | notification_deliveries | notification_recipient_id, attempt_number | Unique delivery attempt |
| `uq_outbox_messages_event_id` | outbox_messages | event_id | Stable logical event identity |
| `uq_webhook_events_provider_event` | webhook_events | provider_id, provider_event_id | Provider callback deduplication |
| `uq_idempotency_global_actor_operation_key` | idempotency_records | actor, operation, key WHERE GLOBAL | Global idempotency uniqueness |
| `uq_idempotency_district_actor_operation_key` | idempotency_records | actor, operation, district, key WHERE DISTRICT | District idempotency uniqueness |
| `uq_idempotency_church_actor_operation_key` | idempotency_records | actor, operation, church, key WHERE CHURCH | Church idempotency uniqueness |
| `uq_idempotency_department_actor_operation_key` | idempotency_records | actor, operation, department, key WHERE DEPARTMENT | Department idempotency uniqueness |
| `uq_retention_policies_category_version` | retention_policies | record_category, version | Versioned retention policy |
| `uq_report_definitions_code_version` | report_definitions | code, version | Immutable definition version |
| `uq_report_definitions_id_version` | report_definitions | id, version | Candidate composite FK target for immutable report runs |

### 4.2 Non-unique access indexes

| Proposed index name | Table | Key columns | Purpose |
|---|---|---|---|
| `ix_fk_role_permissions_permission_id` | role_permissions | permission_id | Permission-side FK lookup; required because the role_permissions unique key begins with role_id |
| `ix_auth_sessions_account_expiry` | auth_sessions | user_account_id, absolute_expires_at | Active session lookup/expiry |
| `ix_auth_session_tokens_session_generation` | auth_session_tokens | auth_session_id, token_generation DESC | Refresh token history |
| `ix_password_reset_tokens_account_expiry` | password_reset_tokens | user_account_id, expires_at | Reset-token lookup and cleanup |
| `ix_member_category_assignments_member_time` | member_category_assignments | member_id, effective_from DESC | Category history |
| `ix_church_memberships_member_time` | church_memberships | member_id, effective_from DESC | Church history |
| `ix_church_transfer_requests_member_time` | church_transfer_requests | member_id, requested_at DESC | Transfer history |
| `ix_department_memberships_member_time` | department_memberships | member_id, requested_at DESC | Department history |
| `ix_appointments_position_effective` | appointments | position_id, effective_from, effective_to | Appointment overlap checks |
| `ix_appointments_appointee_effective` | appointments | appointee_member_id, effective_from DESC | Member appointment history |
| `ix_user_role_assignments_user_scope` | user_role_assignments | user_account_id, role_id, effective_from DESC | Authorization evaluation; covers user_account_id by left prefix, not role_id or granted_by_user_account_id |
| `ix_access_denies_target_scope` | access_denies | target_user_account_id, permission_id, effective_from DESC | Explicit deny evaluation; covers target_user_account_id by left prefix only |
| `ix_fk_access_denies_permission_id` | access_denies | permission_id | Permission-side FK lookup; the target-scope index does not begin with permission_id |
| `ix_fk_access_denies_issued_by_user_account_id` | access_denies | issued_by_user_account_id | Issuer-side FK lookup |
| `ix_fk_access_denies_reviewed_by_user_account_id` | access_denies | reviewed_by_user_account_id WHERE reviewed_by_user_account_id IS NOT NULL | Optional reviewer FK lookup; partial because the source column is nullable |
| `ix_events_church_start` | events | church_id, starts_at WHERE church_id IS NOT NULL AND district_id IS NULL AND department_id IS NULL | Church event calendar |
| `ix_events_department_start` | events | department_id, starts_at WHERE department_id IS NOT NULL AND district_id IS NULL AND church_id IS NULL | Department event calendar |
| `ix_events_district_start` | events | district_id, starts_at WHERE district_id IS NOT NULL AND church_id IS NULL AND department_id IS NULL | District event calendar |
| `ix_event_registrations_event_status` | event_registrations | event_id, status, registered_at | Registration administration |
| `ix_event_sessions_event_start` | event_sessions | event_id, starts_at | Session listing |
| `ix_attendance_records_event_member` | attendance_records | event_id, member_id | Event attendance lookup; query-supporting only, not a standalone FK index |
| `ix_attendance_records_session_member` | attendance_records | event_session_id, member_id | Session attendance lookup; query-supporting only, not a complete composite-FK prefix because event_id is between tuple fields |
| `ix_attendance_corrections_record_time` | attendance_corrections | attendance_record_id, requested_at DESC | Correction history |
| `ix_financial_transactions_account_date` | financial_transactions | financial_account_id, transaction_date DESC | Account ledger |
| `ix_financial_transactions_status_date` | financial_transactions | status, submitted_at DESC | Finance workflow queue |
| `ix_transaction_approvals_transaction_time` | transaction_approvals | financial_transaction_id, decided_at DESC | Approval history |
| `ix_payments_transaction_time` | payments | financial_transaction_id, initiated_at DESC | Payment attempts/reconciliation |
| `ix_credential_issuances_member_date` | credential_issuances | member_id, issued_at DESC | Member credential history |
| `ix_credential_evidence_issuance` | credential_evidence | credential_issuance_id, submitted_at DESC | Evidence review |
| `ix_notification_recipients_user_status` | notification_recipients | user_account_id, status | Recipient inbox |
| `ix_notification_deliveries_status_attempt` | notification_deliveries | status, attempt_number | Delivery worker/reconciliation |
| `ix_outbox_messages_ready` | outbox_messages | status, available_at | Outbox worker polling |
| `ix_webhook_events_provider_received` | webhook_events | provider_id, received_at DESC | Provider event processing |
| `ix_integration_failures_provider_status` | integration_failures | provider_id, status, first_seen_at | Failure monitoring |
| `ix_audit_events_actor_user_time` | audit_events | actor_user_account_id, occurred_at DESC | User audit lookup |
| `ix_audit_events_actor_service_time` | audit_events | actor_service_principal_id, occurred_at DESC | Service audit lookup |
| `ix_audit_events_target_time` | audit_events | target_type, target_id, occurred_at DESC | Target audit history |
| `ix_audit_events_correlation` | audit_events | correlation_id | Cross-service tracing |
| `ix_audit_access_events_actor_time` | audit_access_events | accessing_user_account_id, occurred_at DESC | Audit access review |
| `ix_idempotency_records_actor_operation` | idempotency_records | actor_user_account_id, operation_code, created_at DESC | Retry lookup and expiry |
| `ix_retention_holds_subject_status` | retention_holds | retention_subject_id, status | Hold check; also supports retention_subject_id FK by left prefix |
| `ix_retention_actions_subject_time` | retention_actions | retention_subject_id, executed_at DESC | Disposal history; also supports retention_subject_id FK by left prefix |
| `ix_report_runs_requester_time` | report_runs | requested_by_user_account_id, requested_at DESC | User report history |
| `ix_report_runs_status_time` | report_runs | status, requested_at | Report worker queue |
| `ix_report_export_audits_run_time` | report_export_audits | report_run_id, exported_at DESC | Export history |
| `ix_report_export_audits_actor_time` | report_export_audits | actor_user_account_id, exported_at DESC | Export access review |

Index columns must be checked against the final physical column catalogue before DDL. This register is a workload-informed proposal, not proof that each index has been benchmarked. Avoid redundant indexes already covered by a left-prefix unique index or FK index.

## 5. RIM-12: Nullability and FK action register

### 5.1 Nullability rule

- PK columns: NOT NULL.
- Every required relationship in the physical table definition: NOT NULL.
- Optional actor, approval, provider, session, parent-reissue, or scope relationships: NULL only where the workflow explicitly permits absence.
- Optionality does not mean the referenced row may be deleted. Historical actor/provider/approval relationships use RESTRICT.
- Timestamps describing an event that has not happened yet (approved_at, completed_at, delivered_at, revoked_at, ended_at) remain NULL until that event occurs.
- Derived values are not duplicated as writable columns unless the design identifies the consistency constraint.
- Every column omitted from a table's physical definition remains a blocker, not an implicit nullable field.

### 5.2 FK action policy

| Relationship type | ON DELETE | ON UPDATE | Rationale |
|---|---|---|---|
| User/member identity and actor history | RESTRICT | RESTRICT | Preserve identity and audit trace |
| Organization hierarchy | RESTRICT | RESTRICT | Prevent orphaned scope records |
| Membership, appointment, credential, attendance history | RESTRICT | RESTRICT | Preserve historical evidence |
| Finance, budget, payment, reversal | RESTRICT | RESTRICT | Preserve accounting records |
| Approval, correction, revision, review | RESTRICT | RESTRICT | Preserve decision history |
| Notification and provider delivery history | RESTRICT | RESTRICT | Preserve delivery evidence |
| Audit and audit-access history | RESTRICT | RESTRICT | Append-only history |
| Retention policy, subject, hold, action | RESTRICT | RESTRICT | Preserve legal/administrative trace |
| Report definition/run/export | RESTRICT | RESTRICT | Preserve report provenance |
| Optional current relationship | RESTRICT | RESTRICT | NULL is allowed at creation; hard deletion is not |

No cascade delete is proposed. Soft deactivation, revocation, closure, and retention disposal are separate governed workflows. Any exception requires a documented data-lifecycle decision.

### 5.3 Column-level completion status

The new [Column-Level Physical Register](./PHASE-2-COLUMN-LEVEL-PHYSICAL-REGISTER.md) provides 617 one-row-per-column entries across all 65 tables. Type and nullability have been reconciled against the current physical definitions, and the register links PK/UNIQUE/CHECK, FK actions, supporting indexes and owner-decision blockers where declared.

The register is a complete typed-column transcription, not a complete DDL contract. Defaults remain NOT SPECIFIED IN SOURCE for columns where the design makes no decision; CHECK constraints still need stable names and exact expressions; lifecycle, scope, retention and environment blockers remain open. The remaining reconciliation must:
- table and column;
- PostgreSQL type;
- nullability;
- default (or explicit no default);
- PK/unique/check/FK participation;
- FK target columns and ON DELETE/ON UPDATE;
- supporting index;
- source requirement and approval status.

No omitted field is assumed nullable or assigned a default by convention.

## 6. RIM-13: Separation-of-duties enforcement

### Approved rule

For financial transactions, the submitter cannot approve their own transaction. The approval record must be checked against the parent transaction's `submitted_by_user_account_id`.

### Proposed enforcement contract

- Lock the parent transaction row before accepting an approval decision.
- Compare `transaction_approvals.approver_user_account_id` with `financial_transactions.submitted_by_user_account_id`.
- Reject equality at the database enforcement boundary (constraint trigger or equivalent transactionally locked service guard backed by a database invariant).
- Record the rejected attempt in the security/audit path without writing an approval decision.
- Test two concurrent submit/revision/approval sequences to ensure the submitter identity cannot change between comparison and approval.

### Other workflows

- Access deny: the approved rule prohibits the target actor from issuing, approving, modifying, or revoking their own deny. This remains a mandatory service/transaction invariant; a trigger is required if direct database writers must be prevented from bypassing it.
- Role-conflict review: reviewer must be independent of the reviewed user. This is part of the documented independent-review rule.
- Credentials: do not impose issuer/approver inequality until the credential authority confirms whether separation of duties is mandatory for each credential class.
- Retention actions: do not impose initiator/approver inequality until the records authority confirms approval requirements and emergency exceptions.
- Report export: the actor is recorded; no self-approval rule applies.
- Appointment approval: the appointing authority/approver relationship requires authority confirmation; do not infer an inequality rule beyond the higher-authority approval requirement.

## 7. RIM-14: PostgreSQL compatibility baseline

Production PostgreSQL major version is not yet confirmed. The local development server version is not evidence of the production target.

Portable choices in this proposal:
- UUID primary keys using PostgreSQL's native `uuid` type.
- `timestamptz` for instants, with IANA timezone identifier stored separately where event-local scheduling matters.
- `numeric(19,4)` for money, subject to currency minor-unit policy.
- Ordinary composite PK/FK/UNIQUE/CHECK constraints.
- Partial unique indexes for scope-specific uniqueness.
- Explicit nullable FK columns rather than polymorphic unchecked references.

Compatibility-sensitive choices requiring target confirmation:
- `btree_gist` extension and exclusion constraints for temporal appointment overlap.
- Deferred constraint triggers for cross-row/cross-table checks.
- Any use of `NULLS NOT DISTINCT` (not selected in this proposal).
- Database role/privilege behavior under the managed PostgreSQL provider.
- UUID generation function and extension availability.
- Collation/case-folding strategy for login identifiers and codes.
- Partitioning, which is deferred because it affects unique/FK constraints.

Until the target version and managed-service capabilities are confirmed, do not select a DDL implementation for extension-dependent constraints. The design must retain a tested fallback where feasible, or explicitly block approval.

## 8. Review disposition

| Finding | Disposition |
|---|---|
| RIM-09 | Proposed resolution: four scope-specific partial unique indexes, no PostgreSQL 15 null semantics |
| RIM-10 | Partially open: lifecycle predicates explicitly blocked where status semantics are not approved |
| RIM-11 | Proposed named index register supplied; column compatibility and workload validation remain |
| RIM-12 | 617-column type/nullability register completed; defaults, CHECK naming/expressions and policy-dependent constraints remain incomplete |
| RIM-13 | Approved finance self-approval and role-conflict independence specified; other actor inequalities remain policy-blocked |
| RIM-14 | Portable baseline and compatibility-sensitive features identified; production target remains unconfirmed |

## 9. Required next acceptance evidence

1. Reconcile all named indexes against the canonical 65-table physical definitions.
2. Complete every FK's exact source and target column list, ON DELETE, ON UPDATE, and supporting index.
3. Complete default decisions, CHECK names/expressions and policy-dependent constraints in the 617-column register.
4. Obtain approval for lifecycle predicates before implementing partial unique indexes.
5. Run separation-of-duties negative tests using the intended runtime database role.
6. Confirm production PostgreSQL major version, extension policy, collation, UUID generation, trigger and privilege support.
7. Conduct independent document review and retain unresolved policy blockers.

## 10. Implementation boundary

No SQL DDL, Prisma schema, migration, database object, seed, generated client, or application code is created or changed by this document. DFR-001 through DFR-006 remain preserved. Physical design requires explicit owner approval, and implementation requires separate explicit authorization.


## 11. FK source-index coverage follow-up

The earlier 190-name count is historical and superseded. The [Canonical Index Inventory](./PHASE-2-CANONICAL-INDEX-INVENTORY.md) now reconciles the current FK register and this catalogue as one distinct-name inventory.

A document-level left-prefix comparison reports zero FK source-column groups without an index proposal. This does not establish index necessity or performance. Final redundancy analysis and EXPLAIN-based workload validation remain a pre-implementation task.

## 12. Post-FKI independent review dependency

The [Post-FKI Independent Review](./PHASE-2-POST-FKI-INDEPENDENT-REVIEW.md) found that the medium-severity index catalogue and FK-support index register are not yet reconciled as one canonical inventory. It also identified missing named FK-support proposals for access-deny permission, issuer and reviewer relationships.

The current distinct-name count is 98 in this document and 120 in the FK/column register, with four shared names. The combined distinct-name count is 214. These counts do not establish index-definition correctness.

PIR-01 through PIR-04 have document-level corrections recorded and await independent re-review. PIR-05 and PIR-07 remain partially resolved pending definition-level completion. PIR-06 has a document-level status reconciliation. No index or database object has been created. No index or database object has been created.
