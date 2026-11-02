# DYMS Phase 3 — Consolidated Physical ERD

- Revision: CPERD-01
- Date: 2026-11-02
- Product: District Youth Management System
- Release: v1.0, Sango District
- Status: **CONSOLIDATED PHYSICAL-DESIGN CANDIDATE FOR PROJECT-OWNER REVIEW; NOT APPROVED**
- Conceptual source: owner-approved conceptual ERD revision 25f2813e0256d9472daded45657dfb7ac9f70a43, limited to physical-design progression
- Requirement baseline: 107 testable requirements
- Implementation: **NOT AUTHORIZED**

## 1. Purpose and authority

This document is the master entry point for the reconciled physical ERD package. It defines the proposed relational model, bounded-context ownership, aggregate candidates, key relationships, organizational scope model, physical reconciliation changes and approval gates.

Supporting registers:
1. [Canonical Physical Column Register](./PHASE-3-CANONICAL-PHYSICAL-COLUMN-REGISTER.md)
2. [Canonical Foreign-Key Register](./PHASE-3-CANONICAL-FOREIGN-KEY-REGISTER.md)
3. [Canonical Index Inventory](./PHASE-3-CANONICAL-INDEX-INVENTORY.md)
4. [Physical Integrity and Trigger Register](./PHASE-3-PHYSICAL-INTEGRITY-AND-TRIGGER-REGISTER.md)
5. [Requirement-to-Physical Traceability](./PHASE-3-REQUIREMENT-TO-PHYSICAL-TRACEABILITY.md)
6. [DDD-013 Physical Slice Engineering Review](./PHASE-3-DDD-013-PHYSICAL-SLICE-REVIEW.md)
7. [Final Physical ERD Reconciliation Plan](./PHASE-3-FINAL-PHYSICAL-ERD-RECONCILIATION-PLAN.md)
8. [TBR-01 Technical Blocker Resolution](./PHASE-2-TECHNICAL-BLOCKER-RESOLUTION.md)
9. [DDD-013 Physical Design Revision](./PHASE-2-DDD-013-PHYSICAL-DESIGN-REVISION.md)

This package is design-only. It does not approve SQL DDL, Prisma models, migrations, database objects, seeds, API implementation or application code.

## 2. Authority hierarchy and preserved decisions

Apply the following precedence:
1. DFR-001–DFR-006 and formal dated project-owner governance records.
2. Explicit project-owner approvals and clarifications.
3. Approved DDD decisions and their evidence.
4. Canonical Owner Decision Register, distinguishing owner approval from delegated-authority confirmation.
5. Canonical 107-ID testable requirements.
6. Approved conceptual ERD and formally approved amendments.
7. TBR-01 and reviewed physical proposals.
8. Supporting design artifacts.

Preserved boundaries:
- DFR-001–DFR-006 remain recorded as approved architecture decisions.
- DFR-001/004 authentication parameters remain unchanged.
- DFR-005 remains daily encrypted backups, RPO <=24 hours and RTO <=8 hours with restore testing and alerting.
- DFR-006 repository discrepancy remains unresolved. The decision register says design frozen for implementation; the current explicit owner instruction requires final ERD approval and separate implementation authorization. No implementation authorization is inferred.
- Every member has one individual account linked one-to-one to one member. No guardian, shared or delegated guardian-to-child login model.
- Blockchain anchoring and public credential verification remain deferred from v1.
- Rate limiting applies to public and authenticated APIs.
- ODR-REC-01 items ODR-004/005/006/008/010/011/012/013 were approved by the project owner on 2026-11-02 as proposed; delegated-authority confirmation remains pending where identified.
- ODR-001/002/003/007/009 and ODR-ENV confirmations remain open as recorded.
- No policy-blocked lifecycle value, partial unique predicate or retention schedule is invented.

## 3. Reconciled physical inventory

| Measure | Phase 2 baseline | Phase 3 candidate |
|---|---:|---:|
| Tables | 65 | 70 |
| Column declarations | 617 | 679 |
| Named FK relationships | 155 | 166 |
| Distinct named index candidates | 216 enumerated in Phase 2 source (its summary incorrectly stated 214) | 228 |
| Testable requirements | 97 historical | 107 current |

Counts refer to the reconciled candidate registers, not a live database. The Phase 3 index count is the number of distinct named candidate indexes after removing superseded entries and adding Phase 3 indexes. PK indexes are not listed unless separately named composite candidate keys are required.

### 3.1 Five new physical tables

| Table | Context | Purpose | Approval dependency |
|---|---|---|---|
| pre_auth_contexts | Identity & Access | Hashed 10-minute browser pre-authentication context; no authorization grant | AUTH-IDEM-026/036 |
| idempotency_recovery_events | Identity & Access | Append-only fencing/recovery event ledger | AUTH-IDEM-013–025, D13-PDR-01 |
| event_organizing_departments | Events | Associates district departments as organizers without making them event owners | ODR-004 owner-approved default; delegated confirmation pending |
| member_category_eligibility_rules | Membership | Versioned official eligibility rule provenance; no criteria invented or seeded | ODR-001 authority confirmation |
| report_data_owners | Reporting | Controlled accountable data-owner catalogue referenced by report definitions | ODR-013 delegated data authority |

The five additions are candidate physical refinements. They are not an assertion that all five are already present in the approved conceptual ERD. The owner must approve the exact consolidated package and its conceptual-to-physical amendments.

### 3.2 Two removed columns

- departments.church_id: removed. ODR-004 establishes district-owned department instances in v1. A department does not become church-owned.
- events.department_id: removed. ODR-004 establishes district or local-church event ownership. A department is an organizer, represented through event_organizing_departments, not a third event owner.

## 4. Bounded-context and aggregate ownership

Every table has one owning context. Cross-context relationships use explicit FKs/read contracts and public application interfaces. No context may write another context's aggregate through its ORM repository.

| Bounded context | Tables | Aggregate / record ownership |
|---|---|---|
| Identity & Access | user_accounts, auth_sessions, auth_session_tokens, password_reset_tokens, pre_auth_contexts, idempotency_records, idempotency_recovery_events, roles, permissions, role_permissions, user_role_assignments, access_denies, role_conflict_rules, role_conflict_reviews | UserAccount, AuthSession, PreAuthContext, IdempotencyRecord, Role/Permission catalogue, scoped grants and denies |
| Organization | districts, churches, departments | District, Church, Department catalogues and ownership hierarchy |
| Membership | members, member_categories, member_category_assignments, member_category_eligibility_rules, church_memberships, church_transfer_requests | Member, category assignment/rule, church membership and transfer request |
| Leadership | positions, appointments, appointment_role_links | Position and Appointment; appointment decision/term history |
| Department Membership | department_memberships, department_eligibility_rules | DepartmentMembership and versioned department eligibility rules |
| Events | events, event_approvals, event_change_records, event_registrations, event_sessions, event_organizing_departments | Event, Registration, Session and event organizer association |
| Attendance | event_attendance_subjects, attendance_records, attendance_corrections | EventAttendanceSubject, AttendanceRecord and correction history |
| Finance | financial_accounts, currencies, financial_transactions, transaction_revisions, transaction_approvals, payments, transaction_reversals, budgets, budget_lines | FinancialAccount, FinancialTransaction, Budget, Payment and reversal records |
| Credentials | credential_definitions, credential_definition_versions, credential_issuances, credential_evidence | Versioned CredentialDefinition and CredentialIssuance/evidence lineage |
| Reporting | report_data_owners, report_definitions, report_runs, report_export_audits | Data-owner catalogue, immutable ReportDefinition version, ReportRun and export audit |
| Audit & Retention | audit_events, audit_access_events, service_principals, retention_policies, retention_subjects, retention_holds, retention_actions | Append-only audit, service identity, RetentionPolicy, RetentionSubject and hold/action evidence |
| Notifications & Integrations | notification_templates, notification_preferences, notifications, notification_recipients, integration_providers, notification_deliveries, outbox_messages, webhook_events, integration_failures | Notification, delivery, durable outbox message, provider and webhook processing |

### 4.1 Full 70-table catalogue

| # | Table | Owning context | Aggregate role |
|---:|---|---|---|
| 1 | user_accounts | Identity & Access | UserAccount root |
| 2 | auth_sessions | Identity & Access | AuthSession root |
| 3 | auth_session_tokens | Identity & Access | AuthSession child/token history |
| 4 | password_reset_tokens | Identity & Access | PasswordResetToken root |
| 5 | pre_auth_contexts | Identity & Access | PreAuthContext root |
| 6 | idempotency_records | Identity & Access | IdempotencyRecord root |
| 7 | idempotency_recovery_events | Identity & Access | Append-only idempotency child events |
| 8 | roles | Identity & Access | Role catalogue root |
| 9 | permissions | Identity & Access | Permission catalogue root |
| 10 | role_permissions | Identity & Access | Role-permission association |
| 11 | user_role_assignments | Identity & Access | Scoped grant root |
| 12 | access_denies | Identity & Access | Explicit deny root |
| 13 | role_conflict_rules | Identity & Access | Versioned conflict rule |
| 14 | role_conflict_reviews | Identity & Access | Independent conflict review history |
| 15 | districts | Organization | District root |
| 16 | churches | Organization | Church root |
| 17 | departments | Organization | District-owned department root |
| 18 | members | Membership | Member root |
| 19 | member_categories | Membership | Category catalogue |
| 20 | member_category_assignments | Membership | Category assignment history |
| 21 | member_category_eligibility_rules | Membership | Versioned category rule catalogue |
| 22 | church_memberships | Membership | Membership history |
| 23 | church_transfer_requests | Membership | Transfer request root |
| 24 | positions | Leadership | Position root |
| 25 | appointments | Leadership | Appointment root |
| 26 | appointment_role_links | Leadership | Appointment-to-role grant linkage |
| 27 | department_eligibility_rules | Department Membership | Versioned department eligibility rule |
| 28 | department_memberships | Department Membership | DepartmentMembership root |
| 29 | events | Events | Event root |
| 30 | event_approvals | Events | Immutable approval decisions |
| 31 | event_change_records | Events | Event change workflow/history |
| 32 | event_registrations | Events | EventRegistration root |
| 33 | event_sessions | Events | EventSession child |
| 34 | event_organizing_departments | Events | Event/department organizer association |
| 35 | event_attendance_subjects | Attendance | EventAttendanceSubject root |
| 36 | attendance_records | Attendance | AttendanceRecord child/fact |
| 37 | attendance_corrections | Attendance | Append-only correction history |
| 38 | financial_accounts | Finance | FinancialAccount root |
| 39 | currencies | Finance | Currency catalogue |
| 40 | financial_transactions | Finance | FinancialTransaction root |
| 41 | transaction_revisions | Finance | Pre-posting revision history |
| 42 | transaction_approvals | Finance | Immutable approval decisions |
| 43 | payments | Finance | Payment attempt/reconciliation records |
| 44 | transaction_reversals | Finance | Full reversal relationship |
| 45 | budgets | Finance | Budget root |
| 46 | budget_lines | Finance | Budget line child |
| 47 | credential_definitions | Credentials | CredentialDefinition root |
| 48 | credential_definition_versions | Credentials | Immutable definition version |
| 49 | credential_issuances | Credentials | CredentialIssuance root |
| 50 | credential_evidence | Credentials | Issuance evidence child |
| 51 | report_data_owners | Reporting | Data-owner catalogue |
| 52 | report_definitions | Reporting | Versioned ReportDefinition |
| 53 | report_runs | Reporting | ReportRun root |
| 54 | report_export_audits | Reporting | Export audit history |
| 55 | audit_events | Audit & Retention | Append-only audit fact |
| 56 | audit_access_events | Audit & Retention | Audit-of-audit access fact |
| 57 | service_principals | Audit & Retention | Non-secret service identity catalogue |
| 58 | retention_policies | Audit & Retention | Versioned retention policy |
| 59 | retention_subjects | Audit & Retention | Typed retention anchor |
| 60 | retention_holds | Audit & Retention | Retention hold root |
| 61 | retention_actions | Audit & Retention | Controlled disposal action |
| 62 | notification_templates | Notifications & Integrations | Versioned template |
| 63 | notification_preferences | Notifications & Integrations | Account preference |
| 64 | notifications | Notifications & Integrations | Logical notification root |
| 65 | notification_recipients | Notifications & Integrations | Notification recipient child |
| 66 | integration_providers | Notifications & Integrations | Provider catalogue |
| 67 | notification_deliveries | Notifications & Integrations | Delivery attempt history |
| 68 | outbox_messages | Notifications & Integrations | Durable outbox message |
| 69 | webhook_events | Notifications & Integrations | Provider event identity/processing |
| 70 | integration_failures | Notifications & Integrations | Integration failure/recovery record |

## 5. Core relational diagrams

### 5.1 Identity, member, session and authentication idempotency

~~~mermaid
erDiagram
  USER_ACCOUNTS ||--o| MEMBERS : "one individual member"
  USER_ACCOUNTS ||--o{ AUTH_SESSIONS : owns
  AUTH_SESSIONS ||--o{ AUTH_SESSION_TOKENS : rotates
  USER_ACCOUNTS ||--o{ PASSWORD_RESET_TOKENS : requests
  PRE_AUTH_CONTEXTS ||--o{ IDEMPOTENCY_RECORDS : binds
  USER_ACCOUNTS o|--o{ IDEMPOTENCY_RECORDS : authenticated_actor
  AUTH_SESSIONS o|--o{ IDEMPOTENCY_RECORDS : session_binding
  IDEMPOTENCY_RECORDS ||--o{ IDEMPOTENCY_RECOVERY_EVENTS : records
  IDEMPOTENCY_RECORDS o|--o{ OUTBOX_MESSAGES : reset_operation
  PASSWORD_RESET_TOKENS o|--o{ OUTBOX_MESSAGES : reset_delivery
~~~

### 5.2 Organization, membership, categories and leadership

~~~mermaid
erDiagram
  DISTRICTS ||--o{ CHURCHES : contains
  DISTRICTS ||--o{ DEPARTMENTS : owns
  USER_ACCOUNTS ||--o| MEMBERS : authenticates
  MEMBERS ||--o{ CHURCH_MEMBERSHIPS : history
  MEMBERS ||--o{ CHURCH_TRANSFER_REQUESTS : initiates
  CHURCHES ||--o{ CHURCH_MEMBERSHIPS : hosts
  MEMBERS ||--o{ MEMBER_CATEGORY_ASSIGNMENTS : receives
  MEMBER_CATEGORIES ||--o{ MEMBER_CATEGORY_ASSIGNMENTS : classifies
  MEMBER_CATEGORIES ||--o{ MEMBER_CATEGORY_ELIGIBILITY_RULES : governs
  MEMBER_CATEGORY_ELIGIBILITY_RULES o|--o{ MEMBER_CATEGORY_ASSIGNMENTS : evidence_rule
  MEMBERS ||--o{ DEPARTMENT_MEMBERSHIPS : participates
  DEPARTMENTS ||--o{ DEPARTMENT_MEMBERSHIPS : includes
  POSITIONS ||--o{ APPOINTMENTS : appoints
  MEMBERS ||--o{ APPOINTMENTS : holds
  APPOINTMENTS ||--o{ APPOINTMENT_ROLE_LINKS : derives
~~~

### 5.3 Events, organizing departments and attendance

~~~mermaid
erDiagram
  DISTRICTS ||--o{ EVENTS : boundary
  CHURCHES o|--o{ EVENTS : church_owner
  EVENTS ||--o{ EVENT_ORGANIZING_DEPARTMENTS : organized_by
  DEPARTMENTS ||--o{ EVENT_ORGANIZING_DEPARTMENTS : organizes
  EVENTS ||--o{ EVENT_APPROVALS : decisions
  EVENTS ||--o{ EVENT_CHANGE_RECORDS : changes
  EVENTS ||--o{ EVENT_REGISTRATIONS : registrations
  EVENTS ||--o{ EVENT_SESSIONS : sessions
  EVENTS ||--o{ EVENT_ATTENDANCE_SUBJECTS : attendance_subjects
  MEMBERS ||--o{ EVENT_ATTENDANCE_SUBJECTS : attends
  EVENT_ATTENDANCE_SUBJECTS ||--o{ ATTENDANCE_RECORDS : records
  EVENT_SESSIONS o|--o{ ATTENDANCE_RECORDS : session
  ATTENDANCE_RECORDS ||--o{ ATTENDANCE_CORRECTIONS : corrections
~~~

### 5.4 Finance, credentials and reporting

~~~mermaid
erDiagram
  FINANCIAL_ACCOUNTS ||--o{ FINANCIAL_TRANSACTIONS : ledger
  CURRENCIES ||--o{ FINANCIAL_ACCOUNTS : denomination
  FINANCIAL_TRANSACTIONS ||--o{ TRANSACTION_REVISIONS : revisions
  FINANCIAL_TRANSACTIONS ||--o{ TRANSACTION_APPROVALS : approvals
  FINANCIAL_TRANSACTIONS ||--o{ PAYMENTS : attempts
  FINANCIAL_TRANSACTIONS ||--o| TRANSACTION_REVERSALS : reversal_link
  BUDGETS ||--o{ BUDGET_LINES : lines
  CREDENTIAL_DEFINITIONS ||--o{ CREDENTIAL_DEFINITION_VERSIONS : versions
  MEMBERS ||--o{ CREDENTIAL_ISSUANCES : receives
  CREDENTIAL_DEFINITION_VERSIONS ||--o{ CREDENTIAL_ISSUANCES : defines
  CREDENTIAL_ISSUANCES ||--o{ CREDENTIAL_EVIDENCE : evidence
  REPORT_DATA_OWNERS ||--o{ REPORT_DEFINITIONS : owns
  REPORT_DEFINITIONS ||--o{ REPORT_RUNS : runs
  REPORT_RUNS ||--o{ REPORT_EXPORT_AUDITS : exports
~~~

### 5.5 Audit, retention, notifications and integrations

~~~mermaid
erDiagram
  SERVICE_PRINCIPALS ||--o{ AUDIT_EVENTS : service_actor
  AUDIT_EVENTS ||--o{ AUDIT_ACCESS_EVENTS : access_history
  RETENTION_POLICIES ||--o{ RETENTION_ACTIONS : authorizes
  RETENTION_SUBJECTS ||--o{ RETENTION_HOLDS : held_by
  RETENTION_SUBJECTS ||--o{ RETENTION_ACTIONS : acts_on
  NOTIFICATION_TEMPLATES ||--o{ NOTIFICATIONS : renders
  NOTIFICATIONS ||--o{ NOTIFICATION_RECIPIENTS : recipients
  NOTIFICATION_RECIPIENTS ||--o{ NOTIFICATION_DELIVERIES : attempts
  INTEGRATION_PROVIDERS ||--o{ WEBHOOK_EVENTS : receives
  INTEGRATION_PROVIDERS ||--o{ NOTIFICATION_DELIVERIES : sends
  OUTBOX_MESSAGES ||--o{ INTEGRATION_FAILURES : failures
~~~

The diagrams show logical cardinality and ownership. The canonical FK register is authoritative for exact source/target columns, nullability, candidate keys and delete/update actions.

## 6. Organizational ownership and scope model

### 6.1 Departments

- Every department has a required district_id.
- departments.church_id is removed.
- Candidate UNIQUE (id,district_id) supports composite child relationships.
- Department membership is separate from department ownership.
- A department does not gain event ownership or leadership authority merely because it participates in an event or member's department membership.

### 6.2 Events

- Every event has a required district_id.
- church_id is nullable. NULL means district-owned; non-NULL means local-church-owned and must reference churches(id,district_id).
- events.department_id is removed.
- Departments that organize an event are represented in event_organizing_departments(event_id,district_id,department_id,assigned_by_user_account_id,assigned_at).
- Composite FKs require the event and organizing department to share the same district.
- A department never becomes a third event owner type.

### 6.3 Report runs

- scope_district_id is NOT NULL for every report run.
- scope_kind is one of DISTRICT, CHURCH or DEPARTMENT.
- DISTRICT scope has no church/department reference.
- CHURCH scope has a church reference bound to the same district.
- DEPARTMENT scope has a department reference bound to the same district.
- GLOBAL and cross-district report scopes are prohibited in v1.
- Each report definition references one approved report_data_owners record and a classification.

### 6.4 Position and appointment scope

Positions are always bound to a district boundary. A position has a required district_id, an allowed_scope_type and an optional church_id or department_id:
- DISTRICT: church_id and department_id are NULL.
- CHURCH: church_id is NOT NULL and department_id is NULL.
- DEPARTMENT: department_id is NOT NULL and church_id is NULL.

The position's church/department composite FK must match the same district. Appointments persist district_id and scope_type and copy the relevant child scope reference. The appointment scope-shape CHECK validates the child columns. Composite FKs bind:
- (position_id,district_id,scope_type) to positions(id,district_id,allowed_scope_type);
- (position_id,church_id) to positions(id,church_id) when church scope is present;
- (position_id,department_id) to positions(id,department_id) when department scope is present.

This prevents an appointment from being assigned under a different district, church, department or scope type than its position. The overlap trigger still locks the position parent row and checks approved half-open effective intervals. Position identity/scope is immutable once an approved appointment depends on it.

## 7. Critical composite relationships and invariants

| Invariant | Physical design |
|---|---|
| One account per member | UNIQUE NOT NULL members.user_account_id; account/member provisioning transaction |
| Church belongs to district | Composite candidate key churches(id,district_id) |
| Department belongs to district | Required district FK and UNIQUE departments(id,district_id) |
| Church-owned event belongs to district | Composite FK events(church_id,district_id) to churches(id,district_id) |
| Event organizer belongs to same district | Composite FKs from event_organizing_departments to events and departments |
| Appointment scope matches position | Required district/scope_type plus three scope-specific composite FKs and parent-position lock |
| Attendance subject is one event/member | UNIQUE subject(event_id,member_id) and attendance composite FK |
| Attendance mode cannot mix | Subject row lock plus trigger/constraint enforcement and mode-specific unique indexes |
| Financial account and transaction currency match | Composite candidate keys/FKs across account, transaction and payment |
| Full reversal stays within same account/currency | Composite FKs, uniqueness and original-transaction lock |
| Audit actor identity is valid | Actor-type CHECK and user/service principal FKs |
| Report scope is same district | Required district boundary plus composite church/department FKs |
| Session belongs to idempotency actor | Composite FK (session_id,actor_user_account_id) |
| Recovery event belongs to operation | FK from idempotency_recovery_events to idempotency_records |
| Password-reset outbox cannot expose token | Opaque secret reference, reset token/idempotency FKs and all-or-none CHECK |

## 8. DDD-013 authentication idempotency model

The revised DDD-013 slice is the only idempotency persistence approved as a policy requirement. It applies to authentication operations only.

- AUTHENTICATED and PRE_AUTHENTICATION are mutually exclusive identity modes.
- The 23-column idempotency_records design stores a nullable actor/session or a required pre-auth context, not both.
- Authenticated identity uniqueness uses a PostgreSQL 15 expression/partial unique index with a reserved zero UUID for absent session; a CHECK prohibits the sentinel as a real session.
- Pre-auth identity uniqueness uses a separate partial unique index.
- Scope fingerprint is server-derived SHA-256 over the exact versioned binary encoding defined in D13-PDR-01 §12.1. The /v1 literal suffix is not part of the domain separator; version is a separate byte.
- Request fingerprint is separate from identity uniqueness.
- A same-identity/different-fingerprint request returns HTTP 409 IDEMPOTENCY_KEY_REUSED.
- Recovery fencing is PostgreSQL BIGINT, initial zero, increment-by-one, atomic and fail-closed on overflow.
- idempotency_recovery_events is append-only.
- Completed/failed replay response data expires after 24 hours; compact identity tombstone remains for 30 days.
- Pre-auth cookie/context lifetime is 10 minutes. The secret digest is erased after context expiry/consumption/revocation; a non-secret context identity stub remains while tombstones reference it.
- Password-reset delivery secrets live only in an external envelope-encrypted short-lived secret store. Outbox and queue contain opaque references only.

The internal DDD-013 review is documented separately. External independent reviewer acceptance remains pending.

## 9. Finance design and feature gates

The relational structure supports accounts, currencies, transactions, approvals, revisions, payments, reversals, budgets and lines. It does not silently choose unresolved accounting policy.

Under the owner-approved ODR-005 default:
- NGN is the Sango District default currency.
- Partial payments and multiple successful payments per transaction are disabled.
- FX, refunds, budget exceptions and amount-based thresholds remain disabled pending finance authority confirmation.
- Failed provider attempts remain separate from posted transactions.
- Corrections to posted transactions use linked full reversals.
- Submitter cannot approve their own transaction.

Do not add amount-sign, debit/credit, FX-rate, partial-payment or approval-threshold CHECKs until the finance authority approves the policy. The current physical transaction amount precision remains a proposal, not a currency-scale decision.

## 10. Lifecycle and policy-blocked constraints

The lifecycle catalogue contains PROPOSED and POLICY BLOCKED values. They must not become production CHECKs, enum seeds or partial unique predicates until the appropriate authority approves them.

Specifically blocked:
- category current-state uniqueness and eligibility rule content (ODR-001);
- transfer cancellation/rejection/appeal and open-request cardinality (ODR-002);
- acting appointments, exceptional overlaps and lifecycle transitions (ODR-003);
- department eligibility, renewal and appeal (ODR-007);
- event registration lifecycle, waitlists, late registration and capacity exception labels (ODR-008);
- credential issuer, evidence and validity catalogue (ODR-009);
- exceptional audit access and break-glass (ODR-010);
- retention schedules/source enrollment/disposal (ODR-011);
- channel consent/provider rules (ODR-012);
- report catalogue/classification/disclosure/export authority (ODR-013).

The six policy-blocked indexes remain excluded from DDL.

## 11. Physical register reconciliation

| Register | Phase 3 candidate | Key changes |
|---|---|---|
| Columns | 70 tables / 679 column declarations | DDD-013 23-column record; pre-auth/recovery; organizer association; category-rule provenance; report data owner; attendance exception; remove obsolete owner columns |
| Foreign keys | 166 named relationships | Session-owner composite FK; pre-auth/recovery/outbox FKs; organizer composite FKs; category eligibility and report-owner FKs; remove obsolete scope FKs |
| Indexes | 228 distinct named candidates | Two DDD-013 identity indexes; supporting composite indexes; remove superseded idempotency and obsolete ownership indexes; retain six policy blockers as blocked |
| Integrity/triggers | Structural CHECK and concurrency register | Exact structural names, trigger/transaction boundaries and test requirements |
| Traceability | 107 / 107 requirements mapped | Explicit platform-only and policy-gated requirements |

The Phase 3 canonical registers supersede conflicting Phase 2 inventory statements for the changed tables/columns/indexes/FKs. The Phase 2 files remain source history and must not be used as the implementation source of truth where they conflict with the Phase 3 registers.

## 12. Open issues that prevent final approval

| ID | Issue | Why it remains open | Required closure |
|---|---|---|---|
| G-01 | DFR-006 governance discrepancy | Formal register and historical README/PR evidence differ; current owner instruction blocks implementation pending final ERD approval | Dated owner governance clarification |
| G-02 | DDD-013 independent review | Internal review completed; external independent reviewer response not recorded | Independent reviewer ACCEPT/REVISE/BLOCK for all ten questions |
| G-03 | ODR-001/002/003/007/009 | Official ministry/membership/appointment/credential policy details remain unresolved | Competent authority sign-off or explicit exclusion |
| G-04 | ODR-004/005/006/008/010/011/012/013 | Owner-approved defaults require delegated authority confirmation for policy-dependent details | Relevant district/ministry/finance/attendance/data/security/records authority confirmation |
| G-05 | TBR-01 register completeness | The Phase 3 candidate captures the identified deltas; exact constraint/trigger expressions still need final review | Verify all candidate register cross-references and exact expressions |
| G-06 | Retention source enrollment | Retention subjects are not yet linked to every source table | ODR-011 record classes and schedules |
| G-07 | Production PostgreSQL provider | PostgreSQL 15 minimum is a design target; provider, collation, locale, managed service and restore topology are not confirmed | ODR-ENV technical/deployment confirmation |
| G-08 | Workload/index validation | Index candidates have not been tested against production-like data | Post-approval non-production EXPLAIN/ANALYZE and concurrency tests |
| G-09 | Conceptual-to-physical amendments | Five new tables, two removed ownership columns, and four appointment scope columns with composite position FKs refine the previously approved conceptual model | Explicit project-owner approval of this exact consolidated revision |

## 13. Final approval checklist

- [ ] Approve the five new physical entities and their ownership.
- [ ] Approve removal of departments.church_id and events.department_id under ODR-004.
- [ ] Approve district-bound event/report scope and district-bound position/appointment composite-key model.
- [ ] Approve the 70-table / 679-column candidate inventory.
- [ ] Approve the 166 named FK candidate register.
- [ ] Approve the 228 named index candidate inventory, including six blocked entries remaining excluded.
- [ ] Approve the structural CHECK and trigger/transaction register.
- [ ] Review all 107 requirement mappings.
- [ ] Receive external independent DDD-013 review.
- [ ] Resolve DFR-006 governance record.
- [ ] Record all relevant delegated-authority confirmations or explicitly exclude the affected capabilities.
- [ ] Approve the exact revision and Git blob hash recorded in the approval manifest.
- [ ] Record separate implementation authorization after physical ERD approval.

## 14. No implementation authorization

This package is a consolidated physical-design candidate only. Do not:
- create or modify Prisma schema/models;
- generate or run migrations;
- write or execute SQL DDL;
- create database tables, indexes, triggers, constraints, roles or seeds;
- implement API controllers, DTOs, services or routes;
- implement frontend application features;
- provision or modify production infrastructure.

**Final physical ERD approval: NOT GRANTED. Implementation authorization: NOT GRANTED.**


## 15. Exact revision and approval record

The immutable review target is identified in [PHASE-3-PHYSICAL-ERD-APPROVAL-MANIFEST.md](./PHASE-3-PHYSICAL-ERD-APPROVAL-MANIFEST.md). The manifest records the Git blob SHA of this master ERD and the exact hashes of its supporting registers.

Project-owner approval must explicitly identify revision CPERD-01 and the recorded blob SHA. Approval of this document does not authorize implementation; implementation requires a separate explicit authorization after physical ERD approval.
