# DYMS Phase 2 Relational Integrity Matrix

**Status:** Working relational-integrity specification, not approved for implementation  
**Scope:** DYMS v1.0, Sango District  
**Branch:** `phase-1/requirements-consolidation`  
**Logical source:** Approved conceptual ERD revision `25f2813e0256d9472daded45657dfb7ac9f70a43`  
**Physical source:** `PHASE-2-PHYSICAL-DATABASE-DESIGN.md`  
**Implementation status:** NOT AUTHORIZED

## 1. Purpose and boundary

This matrix turns the current PostgreSQL physical-design proposal into a table-by-table integrity review. It identifies primary keys, foreign-key dependencies, candidate unique keys, checks, indexes, cross-scope rules, and enforcement requirements.

It is a design artifact only. It does not create SQL, Prisma models, migrations, database objects, or application code. It does not approve unresolved ministry, financial, safeguarding, credential, retention, or organizational policies.

The matrix deliberately marks incomplete source definitions as blockers instead of inventing columns or constraints.

## 2. Catalogue reconciliation

A fresh heading-level inventory of the current physical-design document produces **62 table definitions before the three Section 18 additions**, and **65 distinct physical tables after adding** `event_attendance_subjects`, `retention_subjects`, and `service_principals`.

The source document contains 58 definition headings because four headings group multiple tables (`role_conflict_rules` with `role_conflict_reviews`, `budgets` with `budget_lines`, and the three report tables). The actual table count is therefore 65, not 58. The lifecycle catalogue has 52 rows because it catalogues state-bearing entities, not every physical table.

This count reconciliation is important. All 65 physical tables appear below exactly once.

## 3. Table-by-table key and constraint matrix

All tables use a UUID primary key named `id`, except `currencies`, whose primary key is `code`, unless the row explicitly says otherwise. Every FK is intended to use restrictive delete behavior by default. Cascade deletion is prohibited for membership, appointment, finance, credential, attendance, audit, retention, and other historically significant records.

| Table | Primary key | Foreign-key dependencies | Candidate unique keys | Checks, indexes, and enforcement |
|---|---|---|---|---|
| `user_accounts` | `id` | — | login_identifier; optional normalized email/phone unique when present | PK; partial unique indexes for nullable identifiers | Derived; normalization policy open |
| `members` | `id` | user_account_id → user_accounts | user_account_id UNIQUE; member_number UNIQUE | 1:1 account/member enforced by UNIQUE FK | Approved individual-account rule |
| `auth_sessions` | `id` | user_account_id → user_accounts | — | expiry CHECK; index (user_account_id, revoked_at, absolute_expires_at) | DFR-004 approved; immutable absolute expiry |
| `auth_session_tokens` | `id` | auth_session_id → auth_sessions | token_hash; (auth_session_id, token_generation) | token_generation > 0; partial unique active token per session | DFR-001/004 approved; rotation transaction required |
| `password_reset_tokens` | `id` | user_account_id → user_accounts | token_hash | expires_at > created_at; conditional single-use consume | DFR-001 approved |
| `districts` | `id` | — | code | Base organization record; status values policy-blocked | Sango District scope; lifecycle unresolved |
| `churches` | `id` | district_id → districts | (district_id, code); (id, district_id) | Composite key supports child scope binding | Derived |
| `member_categories` | `id` | — | code | Controlled values Adventurer, Pathfinder, Senior Youth; not Master Guide | Category set approved; eligibility open |
| `member_category_assignments` | `id` | member_id → members; member_category_id → member_categories; assigned_by → user_accounts | Partial unique current assignment per member | effective_to > effective_from; one current active primary category | Approved cardinality/history; eligibility policy open |
| `church_memberships` | `id` | member_id → members; church_id → churches; initiated/accepted/approved actors → user_accounts | Partial unique current approved membership per member | effective interval; transfer update atomic | Approved one-current-church rule |
| `church_transfer_requests` | `id` | member_id → members; source/receiving church → churches; requester/decision actors → user_accounts | Partial unique pending request per member, predicate awaits lifecycle decision | source_church_id <> receiving_church_id | Transfer workflow approved; cancellation/rejection details open |
| `departments` | `id` | district_id → districts; optional church_id → churches | Scope-aware code uniqueness; (id, district_id) | Composite church/district binding; department ownership policy needs final confirmation | Partly derived; church-owned model unresolved |
| `department_eligibility_rules` | `id` | department_id → departments | (department_id, version) | effective interval; JSONB evidence metadata only | Official rule source required before activation |
| `department_memberships` | `id` | member_id → members; department_id → departments; requester/approver/ender → user_accounts; optional eligibility_rule_id → department_eligibility_rules | Partial unique active member/department membership | effective interval; preserve ended history | Workflow approved; eligibility/renewal gaps |
| `positions` | `id` | optional department_id → departments | Scope-aware code uniqueness | allowed_scope_type must constrain appointment scope; exact scope type proposal | Position scope definition needs review |
| `appointments` | `id` | position_id → positions; appointee_member_id → members; authority/approver → user_accounts; one explicit district/church/department scope FK | No overlapping active appointment for same position and exact scope | term_end >= term_start; effective_to > effective_from; exclusion constraint candidate | No overlap approved; PostgreSQL implementation/version proof open |
| `roles` | `id` | — | code | Controlled role catalogue | Role catalogue governance open |
| `permissions` | `id` | — | code | Resource/action/scope mapping required | Permission catalogue incomplete |
| `role_permissions` | `id` | role_id → roles; permission_id → permissions | (role_id, permission_id) | effect CHECK = ALLOW; DENY is separate | Explicit DENY policy approved |
| `user_role_assignments` | `id` | user_account_id → user_accounts; role_id → roles; granted_by → user_accounts; one explicit scope FK | Scoped assignment uniqueness/overlap rule must be finalized | effective interval; no self-grant via service/transaction guard | Authorization policy approved; catalogue gaps |
| `appointment_role_links` | `id` | appointment_id → appointments; role_id → roles; created_by → user_accounts | (appointment_id, role_id, mapping_version) | Only effective approved appointment grants role | Derived |
| `access_denies` | `id` | target/issuer/reviewer → user_accounts; permission_id → permissions; one explicit scope FK | Active duplicate rule needs definition | reason required; service guard prevents target actor self-administration | Explicit deny semantics approved |
| `role_conflict_rules` | `id` | role_a_id/role_b_id → roles | Canonical role pair + version | role_a <> role_b unless explicit self-conflict rule approved; effective interval | Role conflict policy approved; catalogue data open |
| `role_conflict_reviews` | `id` | user_account_id/reviewed_by → user_accounts; rule_id → role_conflict_rules | Review uniqueness per user/rule/effective decision needs definition | Independent reviewer; decision/reason required | Policy approved; review workflow details open |
| `events` | `id` | creator → user_accounts; exactly one approved owner FK: district/church/department | Scope-bound composite key for children | ends_at > starts_at; registration close >= open; capacity >= 0; reserved_count >= 0 | District approval approved; local approval policy open |
| `event_approvals` | `id` | event_id → events; reviewer → user_accounts | No destructive overwrite; retain decision rows | Decision/stage values require lifecycle catalogue | Approval history required |
| `event_change_records` | `id` | event_id → events; requester/approver → user_accounts | No destructive overwrite | Allowlisted previous/proposed JSONB snapshots; reason required | History approved |
| `event_registrations` | `id` | event_id → events; member_id → members | Partial unique active event/member registration | Capacity via locked event row and atomic counter; lifecycle predicate awaits approved states | Capacity protocol proposed |
| `event_sessions` | `id` | event_id → events | (id, event_id) | ends_at > starts_at | Derived |
| `event_attendance_subjects` | `id` | event_id → events; member_id → members; created_by → user_accounts | (event_id, member_id); (id, event_id, member_id) | mode in EVENT/SESSION; one mode per member/event | Design requirement; deferred trigger/subtype proof needed |
| `attendance_records` | `id` | event_id → events; event_session_id + event_id → event_sessions; member_id → members; registration_id → event_registrations; recorder → user_accounts; subject composite FK | Partial unique event/member or session/member by attendance mode | Subject mode and event/member/session shape enforced by locked subject + deferred trigger/subtype | Attendance uniqueness approved; registration prerequisite open |
| `attendance_corrections` | `id` | attendance_record_id → attendance_records; requester/approver → user_accounts | Append correction history | reason required; effective status update atomic with approval | Correction history approved |
| `financial_accounts` | `id` | currency_code → currencies; exactly one district/church owner FK | account_code unique within owner; (id, currency_code) | Exactly-one owner CHECK; account currency immutable after first posting | Ownership/currency approved; account multiplicity open |
| `currencies` | `code` | — | code PK | minor_unit between 0 and 4; NGN seed | NGN default approved; foreign currency requires approval |
| `financial_transactions` | `id` | financial_account_id + currency_code → financial_accounts; submitter/poster → user_accounts | (financial_account_id, reference); (id, currency_code) | amount numeric(19,4); no amount-sign CHECK until accounting policy | Workflow approved; accounting semantics open |
| `transaction_revisions` | `id` | financial_transaction_id → financial_transactions; requester → user_accounts | (financial_transaction_id, revision_number) | revision_number > 0; posted transactions cannot be revised | History approved |
| `transaction_approvals` | `id` | financial_transaction_id → financial_transactions; approver → user_accounts | Decision history retained; duplicate decision rule needs definition | Approver != submitter via trigger or locked service transaction | Separation of duties approved |
| `payments` | `id` | financial_transaction_id + currency_code → financial_transactions; optional provider_id → integration_providers | payment_reference; provider_reference uniqueness scoped by provider if approved | amount/currency consistency; uncertain outcomes reconciled; partial/refund policy open | Payment verification approved |
| `transaction_reversals` | `id` | original_transaction_id and reversal_transaction_id → financial_transactions; initiator/approver → user_accounts | reversal_transaction_id UNIQUE; original full-reversal uniqueness needs accounting policy | original != reversal; same account/currency composite binding; serialize cumulative reversal | Reversal policy approved; partial reversal open |
| `budgets` | `id` | Proposed owner/account/currency FKs require completion from finance policy | Budget code/period uniqueness not specified | Owner scope, period boundaries, amount semantics and lifecycle missing | BLOCKER: source definition incomplete |
| `budget_lines` | `id` | budget_id → budgets; any category/account reference requires explicit FK definition | Line uniqueness and ordering not specified | Amount/variance checks require approved budget semantics | BLOCKER: source definition incomplete |
| `credential_definitions` | `id` | issuer_scope_district_id → districts; issuer_scope_church_id → churches | Scoped code uniqueness must be defined | Exactly-one scope vs approved global definition discriminator unresolved | Issuer authority evidence open |
| `credential_definition_versions` | `id` | credential_definition_id → credential_definitions; optional approved_by → user_accounts | (credential_definition_id, version) | Validity policy/duration consistency; effective interval | Official standards required |
| `credential_issuances` | `id` | member_id → members; definition_version_id → credential_definition_versions; issuer/approver → user_accounts; optional prior_issuance_id self-FK | No one-current constraint until reissue/renewal policy finalized | valid_until >= valid_from; expiry follows definition version | Platform policy accepted; authority evidence open |
| `credential_evidence` | `id` | credential_issuance_id → credential_issuances; submitter/verifier → user_accounts | No evidence deduplication key specified | Storage object key protected; verification state and actor consistency | Privacy/retention controls required |
| `notification_templates` | `id` | — | (code, version, channel, locale) | version > 0; content/locale validation at application boundary | Approved DDD-015 |
| `notification_preferences` | `id` | user_account_id → user_accounts | Active preference uniqueness by account/channel/category must be finalized | effective interval; consent state values approved by policy | Consent policy approved |
| `notifications` | `id` | optional template_id → notification_templates | logical_key | Payload references only; no secrets | Approved DDD-015 |
| `notification_recipients` | `id` | notification_id → notifications; user_account_id → user_accounts | (notification_id, user_account_id) | Preference decision captured at dispatch | Approved DDD-015 |
| `integration_providers` | `id` | — | provider_code | No secret fields; secret manager references only | Approved DDD-015 |
| `notification_deliveries` | `id` | notification_recipient_id → notification_recipients; provider_id → integration_providers | (notification_recipient_id, attempt_number) | attempt_number > 0; provider acceptance != delivery | Approved DDD-015 |
| `outbox_messages` | `id` | No FK to aggregate by design; aggregate reference is event metadata | event_id UNIQUE | event_version > 0; attempt_count >= 0; lease state consistency; source mutation + outbox atomic | Reliable outbox policy approved; details proposed |
| `webhook_events` | `id` | provider_id → integration_providers | (provider_id, provider_event_id) | signature_valid required; duplicate provider event deduplicated | Approved DDD-015 |
| `integration_failures` | `id` | provider_id → integration_providers; optional webhook_event_id → webhook_events | No dedupe key specified | retry_count >= 0; resolved state consistency | Approved DDD-015 |
| `service_principals` | `id` | — | code | No authentication secrets stored in table | Audit service identity policy proposed |
| `audit_events` | `id` | optional actor_user_account_id/initiating_user_account_id → user_accounts; optional actor_service_principal_id → service_principals | Indexes by actor/time and target/time; no business uniqueness | Actor-type CHECK; append-only writer role; target_type/target_id historical reference only | Audit policy approved; append-only privilege proof open |
| `audit_access_events` | `id` | accessing_user_account_id → user_accounts; optional audit_event_id → audit_events; explicit scope FKs | Index by actor/time and scope/time | purpose required; exceptional_access default false; audit reads audited | Audit authority roles open |
| `idempotency_records` | `id` | actor_user_account_id → user_accounts; explicit resource scope FKs | Unique actor + operation + normalized scope + key digest | Fingerprint conflict; lease/terminal state consistency; null-scope uniqueness strategy PostgreSQL-version dependent | Idempotency contract approved; technical values open |
| `retention_policies` | `id` | — | (record_category, version) candidate | No disposal from unknown/unapproved duration; effective interval | Retention periods/authority open |
| `retention_subjects` | `id` | created_by_user_account_id → user_accounts; target-specific source-record link required | One-to-one unique source link; subject mapping exactly one record | record_class matches link type; stable subject lock anchor | Design proposal; coverage inventory required |
| `retention_holds` | `id` | retention_subject_id → retention_subjects; issuer/approver → user_accounts | Active-hold uniqueness per subject/reason policy to define | Hold/release lifecycle; lock same subject row as disposal | Retention hold policy approved; retention schedule open |
| `retention_actions` | `id` | retention_policy_id → retention_policies; retention_subject_id → retention_subjects; initiator/approver → user_accounts | Action idempotency key or unique subject/policy/action execution to define | No disposal under active hold; schedule and authorization checked under subject lock | Retention schedule open |
| `report_definitions` | `id` | No complete FK catalogue in source | Definition code/version uniqueness needs definition | Scope/filter contract and report authorization need completion | BLOCKER: source definition incomplete |
| `report_runs` | `id` | report definition and requester/scope FKs require explicit column inventory | Run identity/idempotency uniqueness needs definition | Recheck authorization at execution; status/retention policy | BLOCKER: source definition incomplete |
| `report_export_audits` | `id` | report_run and exporting actor FKs require explicit column inventory | Export identity uniqueness needs definition | Protected object storage; export access audit and retention | BLOCKER: source definition incomplete |

## 4. Required cross-table integrity contracts

### 4.1 Account and member cardinality
- `members.user_account_id` is NOT NULL and UNIQUE, with an FK to `user_accounts.id`.
- This creates exactly one account for each member row and at most one member per account. Account creation and member creation must commit atomically where the workflow creates both.
- No guardian, shared-account, delegated-login, or guardian-to-child relationship is part of the approved model.

### 4.2 Organizational scope
- Scope is represented by explicit FKs, not an unchecked `scope_type + scope_id` pair.
- For district-or-church ownership, require exactly one owner FK with a named CHECK.
- For district/church/department scope, use explicit nullable FKs and a CHECK requiring exactly one permitted target.
- A church reference paired with a district must be bound using a composite FK to `churches(id, district_id)`.
- A department reference paired with a district must use a composite FK to `departments(id, district_id)`. If church-specific departments are supported, bind the complete church/district tuple.
- Child records inherit scope from their parent. If a child duplicates scope columns, a composite FK must prove they match the parent.
- A permission scope must never be inferred from an unrelated role or membership.

### 4.3 Appointments and role scope
- Position scope type and appointment scope must match exactly.
- Appointment scope must bind to a real district, church, or department row.
- No two effective appointments may overlap for the same position and exact scope.
- A simple partial unique index is insufficient for arbitrary time overlap. A PostgreSQL exclusion constraint over a time range is a candidate, but requires confirmed server-version and extension support. Otherwise use a serialized transaction plus a database-enforced guard.
- Acting appointments and exceptional overlaps remain disabled until policy approval.

### 4.4 Event and attendance consistency
- Event session must belong to the same event referenced by the attendance record. Use composite FK `(event_session_id, event_id)` to `event_sessions(id, event_id)`.
- `event_attendance_subjects` establishes one attendance mode per event/member pair.
- `attendance_records` must bind to the subject using a composite FK that proves subject, event, and member identity.
- EVENT mode permits one event-level record with no session. SESSION mode requires a valid session from the same event and permits one record per session/member.
- A deferred constraint trigger or normalized subtype design must enforce mode/child shape while locking the subject row. Concurrent event-level and session-level inserts must not both succeed.
- Registration prerequisite is unresolved. Do not make `registration_id` mandatory until the policy is approved.

### 4.5 Finance account and currency chain
- `financial_accounts` needs candidate key `(id, currency_code)`.
- `financial_transactions` must reference `(financial_account_id, currency_code)` and expose `(id, currency_code)` as a candidate key.
- `payments` must reference transaction and currency together.
- Reversal records must prove original and reversal transactions share the same account and currency, using composite FKs or a normalized shared-account relationship.
- Currency is immutable for an account after its first posted transaction.
- Do not impose a positive-amount CHECK or debit/credit sign convention until accounting policy defines amount semantics.
- Full and partial reversal constraints must be serialized. Partial reversal remains blocked pending policy.

### 4.6 Retention target and hold integrity
- Every governed source record must map to exactly one `retention_subjects` row through a target-specific FK or target-specific link table.
- A generic free-form target type and UUID are not sufficient for a deletion authority.
- `retention_holds` and `retention_actions` reference the exact `retention_subjects.id`.
- Hold creation/release and disposal lock the same subject row. Disposal checks approved policy, due date, and active holds while holding that lock.
- No automated permanent deletion is permitted where the record-class retention period or approving authority remains unapproved.

### 4.7 Audit actor integrity
- USER actor requires `actor_user_account_id`.
- SYSTEM actor must not be represented as a human user.
- SERVICE actor requires a registered `service_principals` row.
- ANONYMOUS actor must not carry a fabricated human or service identity.
- Delegated activity records the initiating user separately from the represented subject.
- Audit event target references are historical metadata, not business ownership FKs.
- Runtime database roles must not UPDATE or DELETE audit history. Use a dedicated append-only writer path and test actual privileges.

### 4.8 Idempotency and webhook identity
- Idempotency uniqueness is over actor, operation, normalized resource scope, and key digest.
- Request fingerprint binds the key to one normalized logical request. Same key with different fingerprint returns conflict and creates no second business effect.
- Nullable scope columns require a deliberate uniqueness strategy. PostgreSQL 15+ `NULLS NOT DISTINCT` is one candidate; alternatively use separate partial unique indexes per scope shape. Do not select a strategy until production PostgreSQL version is confirmed.
- Provider webhook identity is unique on `(provider_id, provider_event_id)`.
- Outbox event identity is stable and unique. Outbox insertion commits with the source business mutation.

## 5. Nullability, defaults, and temporal rules

Apply these rules consistently unless an approved table-specific exception is documented:

1. Primary keys, required parent FKs, owner FKs, business keys, required actors, required amounts/currencies, and creation timestamps are NOT NULL.
2. Nullable FKs require a written lifecycle reason. NULL must never imply approval, verification, successful payment, consent, publication, or authorization.
3. Decision actors/timestamps remain NULL until the decision occurs. Rejection, revocation, cancellation, closure, and release reasons are required when the corresponding transition requires a reason.
4. UUID primary keys have no permissive business default. Use database UUID generation or a trusted cryptographically secure application UUID generator consistently.
5. `created_at` is NOT NULL and set consistently. Mutable tables have `updated_at` NOT NULL and one centrally enforced update mechanism.
6. Event/session start and end instants are NOT NULL where the event is scheduled. End must be later than start.
7. Effective intervals require end > start. Term dates require term_end >= term_start. Expiry must be later than issue/creation.
8. Counters default to zero only where zero is semantically valid and must have a non-negative CHECK. Do not give monetary amounts a generic default.
9. Required lifecycle state is explicitly supplied at creation. Do not add permissive defaults to status fields.
10. Optional email/phone values use normalized partial unique indexes. Normalization must be identical for writes and lookups.
11. Financial amounts use `numeric(19,4)` pending accounting policy. Never use floating-point types for authoritative money.
12. JSONB snapshots are allowlisted, bounded, versioned, and exclude secrets and unrelated personal data.

The physical-design source does not yet provide a complete column-by-column nullability/default listing for every one of the 65 tables. Before DDL approval, add a column-level appendix generated from the final reviewed table definitions. This matrix does not pretend that an omitted column has been verified.

## 6. Indexing requirements

The final DDL worksheet must name each index and classify it as PK, UNIQUE, partial UNIQUE, FK-supporting, query-supporting, or concurrency-supporting.

Minimum index families:
- Every FK used in joins, authorization, or parent deletion/update checks.
- Current membership/category/department assignment lookups.
- Appointment scope, position, effective interval, and status.
- Event owner, publication/status, registration window, and start time.
- Registration event/member/status and attendance event/member/session/status.
- Finance account/date/status/reference and transaction/reversal relationships.
- Credential member/definition/status/validity.
- Notification recipient/status/scheduled time and provider delivery identity.
- Outbox status/available time/lease expiry and webhook provider/event identity.
- Audit actor/time, target/time, correlation ID, and audit-access actor/time.
- Idempotency actor/operation/scope/key digest and lease expiry.
- Retention class/state/due date, subject/hold state, and action status.
- Report definition/status, run owner/time/status, and export audit actor/time.

Do not add indexes without a query or integrity purpose. Confirm query plans with representative data after implementation is separately authorized.

## 7. Enforcement method register

| Invariant | Primary enforcement | Additional protection |
|---|---|---|
| Account/member one-to-one | UNIQUE FK | Atomic account/member creation |
| One current church/category/department assignment | Partial UNIQUE index | Serialized transition transaction |
| Valid organization scope | FK + CHECK + composite FK | Server authorization |
| Appointment non-overlap | Exclusion constraint if supported | Locked transaction and negative concurrency test |
| Event capacity | Locked event row + counter CHECK | Restricted write path and reconciliation |
| Attendance mode exclusivity | Composite FK + deferred trigger or normalized subtype | Lock attendance subject |
| Finance account/currency match | Composite FK | Transactional posting |
| Submitter cannot approve | Trigger or locked transaction guard | Independent authorization and audit |
| Reversal consistency | Composite FK + unique constraints | Serialize by original transaction |
| Retention hold vs disposal | Exact subject FK | Shared subject-row lock |
| Audit actor shape | CHECK + FK | Append-only database role privileges |
| Idempotency replay | UNIQUE scope key + fingerprint | Atomic mutation and response record |
| Webhook replay | UNIQUE provider/event ID | Signature validation and idempotent handler |
| Outbox event uniqueness | UNIQUE event ID | Transactional outbox and consumer deduplication |

Application pre-checks alone are not acceptable for concurrency-sensitive invariants.

## 8. PostgreSQL compatibility and proof requirements

The production PostgreSQL major version is not confirmed. The user's previously used local PostgreSQL version is not evidence of the production target.

Before final DDL approval, confirm:
- PostgreSQL major/minor target and managed-service compatibility.
- Whether required extensions such as `btree_gist` are permitted.
- Whether PostgreSQL 15+ `NULLS NOT DISTINCT` is available, if selected.
- Whether deferred constraint triggers and required privileges are supported in the deployment environment.
- The chosen timestamp, collation, normalization, and UUID-generation strategy.

No extension or version-specific syntax is approved by this document.

## 9. Required negative and concurrency tests

1. Duplicate member account link and duplicate member number.
2. Cross-district church, department, event, appointment, and financial scope mismatch.
3. Concurrent current church transfer and concurrent category/department assignment.
4. Two overlapping appointments for the same position/scope.
5. Two registrations racing for the final event slot.
6. Event-level and session-level attendance racing for the same member/event.
7. Attendance session from another event.
8. Transaction, payment, and reversal currency mismatch.
9. Two simultaneous full reversals and cumulative partial reversal overrun.
10. Submitter attempting to approve their own transaction.
11. Hold creation racing with a retention action.
12. Audit event with invalid actor-type/identity combination; runtime UPDATE/DELETE attempt.
13. Concurrent refresh rotation and consumed-token replay.
14. Same idempotency key with different payload; same key in different scopes; null-scope uniqueness.
15. Duplicate webhook callback and outbox consumer replay.
16. Invalid interval, negative counter, invalid status, missing required actor, and missing owner.
17. Individual member account cardinality and absence of guardian/delegation relationships.

## 10. Blockers before physical design can be approved

- Complete column-level FK, nullability, default, unique, CHECK, index and delete/update-action definitions for every table.
- Complete definitions for `budgets`, `budget_lines`, `report_definitions`, `report_runs`, and `report_export_audits`.
- Confirm whether church-owned department instances are supported and how they bind to district/church.
- Confirm the full position-to-appointment scope mapping.
- Resolve access-deny active uniqueness and role-conflict review uniqueness.
- Resolve transfer pending-state predicate and cancellation/rejection transitions.
- Approve all lifecycle states and transition authorities. The 52-row lifecycle catalogue is not blanket approval.
- Complete account/currency/reversal semantics, partial payment and budget rules.
- Complete target-specific retention-subject coverage for all retained tables.
- Complete report ownership, run and export audit fields.
- Confirm PostgreSQL production version and extension support.
- Complete independent review and owner approval.

## 11. Implementation boundary

The conceptual ERD approval authorizes physical design work only. This matrix does not authorize:
- Prisma schema changes or generated clients.
- SQL DDL or database objects.
- Migrations or seed data.
- Application/backend/frontend code.
- Production or local database changes.

Physical design requires explicit project-owner approval. Implementation requires a separate explicit authorization. DFR-001 through DFR-006 remain preserved. The repository's DFR-006 status discrepancy remains unresolved and must not be silently changed.


---

## 12. High-severity remediation addendum

The proposed detailed resolutions for the high-severity findings are recorded in the [High-Severity Relational Integrity Remediation](./PHASE-2-HIGH-SEVERITY-RELATIONAL-INTEGRITY-REMEDIATION.md).

The addendum completes proposed table-column inventories for budgets, budget lines, report definitions, report runs, and report export audits. It also specifies proposed normalized position/appointment scope, attendance subject locking, same-account/same-currency reversal references, retention-subject source binding, and exact audit actor identity combinations.

These are proposed technical resolutions, not final approved constraints. The addendum explicitly preserves policy and environment blockers. Reconcile the addendum into the canonical per-column matrix before physical-design approval.
