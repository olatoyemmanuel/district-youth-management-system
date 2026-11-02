# DYMS Phase 3 — Requirement-to-Physical-Design Traceability

- Revision: RPT-ERD-01
- Date: 2026-11-02
- Source: `PHASE-1-TESTABLE-REQUIREMENTS.md`
- Requirement count: **107**
- Status: **PHYSICAL-DESIGN TRACEABILITY CANDIDATE; NOT APPROVED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This register maps every testable requirement currently in the canonical 107-ID requirements baseline to its owning physical table(s), enforcement mechanism and remaining policy status.

A requirement does not need a table if it is an API, security, transaction, infrastructure or operational control. Such requirements are explicitly marked as cross-cutting controls rather than forced into artificial persistence entities.

## 2. Complete requirement-level traceability

| Requirement ID | Testable requirement | Physical table(s) / platform boundary | Physical enforcement / design mapping | Coverage status |
|---|---|---|---|---|
| ID-001 | Each member has an individual DYMS account and login. | user_accounts; members | One-to-one unique FK; atomic provisioning | Covered |
| ID-002 | Shared and guardian-operated accounts are not supported. | user_accounts; members | Individual account identity; no guardian/delegation relation exists | Covered |
| ID-003 | Account identity and ministry membership remain distinct concepts. | user_accounts; members | Separate account and member aggregates; no account reassignment | Covered |
| ID-004 | Account status is checked during protected requests. | user_accounts; auth_sessions | Account/session status checked on protected requests | Covered; account lifecycle vocabulary remains gated |
| MEM-001 | A member has one active primary category. | member_categories; member_category_assignments | Category assignment history; current-category unique predicate remains policy blocked | Partially gated by ODR-001 |
| MEM-002 | Supported primary categories are Adventurer, Pathfinder, and Senior Youth. | member_categories; member_category_assignments | Controlled category catalogue FK | Covered |
| MEM-003 | Master Guide is a credential, not a primary category. | credential_definitions; credential_definition_versions; credential_issuances | Master Guide represented as credential definition/issuance, not category | Covered |
| MEM-004 | Category changes preserve history. | member_category_assignments | Effective interval and immutable decision history | Covered |
| MEM-005 | Category assignment requires eligibility verification and authorized approval. | member_category_eligibility_rules; member_category_assignments | Versioned authority rule and exact rule reference; no eligibility values seeded | Structural candidate; ODR-001 authority pending |
| MEM-006 | Department participation is independent of primary category. | member_categories; department_memberships | Separate aggregates; no category mutation from department membership | Covered |
| ORG-001 | A member has one current primary church. | members; churches; church_memberships | Membership history plus current-member projection; current uniqueness predicate blocked pending ODR-002 | Partially gated |
| ORG-002 | A member initiates a church transfer. | church_transfer_requests; members; churches | Member actor FK and receiving church FK | Covered |
| ORG-003 | Receiving church acceptance is required. | church_transfer_requests; churches | Receiving decision actor/time/reason fields | Covered |
| ORG-004 | District approval is required. | church_transfer_requests; districts | District final decision actor/time/reason fields | Covered |
| ORG-005 | Transfer history is preserved. | church_transfer_requests; church_memberships | Effective dates and preserved prior membership | Covered |
| ORG-006 | Transfer completion is consistent under concurrent requests. | church_transfer_requests; church_memberships | Atomic transaction and member-level locking; partial unique current-membership predicate blocked | Partially gated |
| ORG-007 | Transfer cancellation and rejection rules are explicit. | church_transfer_requests | Decision actor/reason/time fields; cancellation/rejection/appeal lifecycle remains policy blocked | Policy blocked by ODR-002 |
| DEPT-001 | A member requests department membership. | department_memberships; members; departments | Member request and department FK | Covered |
| DEPT-002 | Designated department coordinator approves membership. | department_memberships; departments; user_accounts | Coordinator decision actor and department scope | Covered |
| DEPT-003 | Multiple simultaneous department memberships are permitted. | department_memberships | No global one-department-per-member uniqueness; multiple memberships permitted | Covered |
| DEPT-004 | Membership withdrawal and authorized termination are supported. | department_memberships | Withdrawal/termination actor, reason and history | Covered; exact lifecycle states gated |
| DEPT-005 | Department membership does not confer leadership authority. | department_memberships; appointments; user_role_assignments; permissions | No authorization grant derived from department membership | Covered |
| DEPT-006 | Department eligibility and annual renewal are controlled. | department_eligibility_rules; department_memberships | Versioned eligibility rule catalogue; renewal/review policy not seeded | Partially gated by ODR-007 |
| APP-001 | Appointment approval is performed by designated higher authority. | appointments; positions; user_accounts | Approver actor FK, position/district/scope composite FKs and application-level higher-authority check | Covered; appointing authority matrix remains gated |
| APP-002 | A person cannot approve their own appointment. | appointments; user_accounts | Application transaction rejects subject/approver identity equality | Covered |
| APP-003 | Renewal requires fresh approval. | appointments | Renewal is a new appointment/history record with fresh approval | Covered |
| APP-004 | Appointment term and replacement rules are enforced. | appointments; positions | Term/effective intervals; annual term rule; exceptional transitions gated | Partially gated |
| APP-005 | Same-position overlapping active appointments in the same scope are prevented. | appointments; positions | Position/district/scope composite FK, parent-position row lock and overlap trigger; exact occupied-state predicate gated | Covered with lifecycle predicate gate |
| APP-006 | Appointment history is preserved. | appointments; appointment_role_links; user_role_assignments | Historical appointment and grant linkage | Covered |
| APP-007 | Acting appointments have explicit authority and duration. | appointments | Acting appointments explicitly disabled; no acting-specific entity/flow in v1 candidate | Excluded pending ODR-003 |
| AUTHZ-001 | Authorization denies by default. | roles; permissions; role_permissions; user_role_assignments | Deny-by-default application authorization | Covered |
| AUTHZ-002 | Authorization is enforced server-side for every protected operation. | permissions; role_permissions; user_role_assignments | Server-side enforcement; no UI-only authorization | Platform/domain control |
| AUTHZ-003 | Permission grants are additive only within valid assigned scope. | user_role_assignments; appointments; positions | Scope-bound grant records and appointment-derived grant links | Covered |
| AUTHZ-004 | Explicit DENY overrides applicable ALLOW for its named scope. | access_denies; permissions | Separate explicit DENY records; deny-overrides-allow | Covered |
| AUTHZ-005 | Explicit DENY does not spread to unrelated scopes. | access_denies; districts; churches; departments | Typed scope FKs; deny applies only to exact approved scope | Covered |
| AUTHZ-006 | Ambiguous authorization scope fails closed. | access_denies; user_role_assignments; resource owner FKs | Fail-closed application scope resolution | Platform/domain control |
| AUTHZ-007 | Affected actor cannot administer their own explicit deny. | access_denies; user_accounts | Target cannot administer own deny; actor separation enforced in transaction | Covered |
| AUTHZ-008 | Review-required role combinations require independent approval. | role_conflict_rules; role_conflict_reviews; user_role_assignments | Independent review record and activation guard | Covered; full catalogue authority gate remains |
| AUTHZ-009 | Prohibited role combinations cannot be active concurrently. | role_conflict_rules; user_role_assignments | Prohibited pair activation guard and conflict uniqueness | Covered; full catalogue authority gate remains |
| AUTHZ-010 | Expired or terminated appointments no longer grant appointment-derived permissions. | appointments; appointment_role_links; user_role_assignments | Appointment expiry/termination revokes derived grant effectiveness | Covered |
| AUTHZ-011 | Permission catalogue and scope inheritance are explicit. | permissions; role_permissions; user_role_assignments; access_denies | Explicit action/resource/scope mapping; no implicit inheritance | Catalogue completion and authority confirmation pending |
| EVT-001 | Authorized coordinators create events within scope. | events; event_organizing_departments; districts; churches | District boundary, optional church owner, organizer join; owner scope authorization | Covered; delegated event authority pending |
| EVT-002 | District events require approval before publication. | events; event_approvals | Immutable approval decisions before publication | Covered |
| EVT-003 | Only approved events are open for registration. | events; event_approvals; event_registrations | Approval/publication precondition checked in owning use case | Covered |
| EVT-004 | Registration deadline and capacity are enforced. | events; event_registrations | Atomic event-row lock and reserved_count; confirmed registrations consume capacity | Covered; exact lifecycle label and delegated authority pending |
| EVT-005 | Significant event changes and cancellation are authorized and audited. | events; event_change_records; event_approvals | Versioned change request and immutable approval history | Covered; exact material-change policy gated |
| EVT-006 | Event records with registration or attendance are not physically deleted. | events; event_registrations; attendance_records; retention_subjects | RESTRICT FKs and lifecycle policy; no physical deletion through normal APIs | Covered |
| EVT-007 | Local church approval, late registration, postponement, and refund rules are fully defined. | events; event_approvals; event_registrations; payments; transaction_reversals | Approval model represented; local approval, late registration and refunds remain disabled until policy confirmation | Partially gated by ODR-008 |
| ATT-001 | Authorized event personnel record member attendance. | attendance_records; event_attendance_subjects; events; user_accounts | Actor FK plus scope authorization | Covered |
| ATT-002 | Attendance is linked to event and member. | attendance_records; event_attendance_subjects; members; events | Composite subject FK binds event/member | Covered |
| ATT-003 | Duplicate valid attendance is prevented per event/session. | attendance_records; event_attendance_subjects; event_sessions | Subject-mode locking plus mode-specific partial unique indexes | Covered; ODR-006 confirmation pending |
| ATT-004 | Manual attendance entry is supported and attributed. | attendance_records; user_accounts | Recorded actor and timestamp; method catalogue gated | Covered |
| ATT-005 | Attendance corrections preserve original values and approval history. | attendance_corrections; attendance_records; user_accounts | Append-only correction history with requester/approver | Covered |
| ATT-006 | Attendance statuses are distinguishable in reports. | attendance_records; report_runs; report_definitions | Status remains distinct in reports; final status catalogue gated | Partially gated |
| ATT-007 | Self-check-in, QR expiry, offline synchronization, and registration exceptions are controlled. | attendance_records; event_attendance_subjects; event_registrations | Registration exception evidence included; QR/self-check-in/offline workflows excluded until authority/security approval | Partially gated by ODR-006 |
| FIN-001 | Every financial account has one organizational owner and one currency. | financial_accounts; currencies; districts; churches | Exactly one account owner and one currency; composite scope FK | Covered |
| FIN-002 | District and church account ownership remain separate. | financial_accounts; financial_transactions; user_role_assignments | Separate district/church ownership and scope authorization | Covered |
| FIN-003 | NGN is the district default currency. | currencies; financial_accounts | NGN catalogue/default policy; no unapproved DB default assumed | Covered; finance authority confirmation pending |
| FIN-004 | Foreign-currency support preserves original currency and conversion evidence. | financial_transactions; payments; currencies | FX workflow disabled pending finance authority; no exchange-rate fields/records activated | Excluded pending ODR-005 confirmation |
| FIN-005 | Every transaction references its owning account. | financial_accounts; financial_transactions | Transaction/account/currency composite FK | Covered |
| FIN-006 | Submitter cannot approve own transaction. | financial_transactions; transaction_approvals; user_accounts | Approval decision history and submitter/approver separation | Covered |
| FIN-007 | Transaction changes after submission are controlled. | financial_transactions; transaction_revisions | Immutable revision history before posting | Covered |
| FIN-008 | Rejections require a reason. | transaction_approvals; financial_transactions | Rejection reason and actor recorded | Covered; lifecycle vocabulary gated |
| FIN-009 | Posted transactions are corrected by linked reversal. | financial_transactions; transaction_reversals | Posted original retained; linked full reversal | Covered; finance authority confirmation pending |
| FIN-010 | Duplicate reversals and duplicate posting are prevented. | payments; financial_transactions; transaction_reversals | Provider identity dedupe, transaction uniqueness and full-reversal guard | Covered; finance authority confirmation pending |
| FIN-011 | Payment execution, posting, partial payment, and failed payment are represented distinctly. | payments; financial_transactions | Separate payment attempts and posted transaction; partial payments disabled in v1 default | Partially gated by ODR-005 |
| FIN-012 | Approval thresholds, budget controls, and reimbursement rules are enforced. | budgets; budget_lines; transaction_approvals; financial_transactions | Budget entities and approval records; thresholds/overrun rules disabled until approved | Partially gated by ODR-005 |
| CRED-001 | Credential definitions are controlled and versioned. | credential_definitions; credential_definition_versions | Versioned definition catalogue | Covered structurally; ODR-009 issuer/standard gate |
| CRED-002 | Credential issuance requires authorized verification and issuer approval. | credential_issuances; credential_evidence; user_accounts | Evidence and verifier/issuer actor references | Covered structurally; issuance disabled pending authority |
| CRED-003 | Renewal, revocation, correction, and reissue preserve lineage. | credential_issuances; credential_evidence | Lineage, validity and revocation fields/history | Covered structurally; lifecycle authority gate |
| CRED-004 | Credential requirements and issuer authority follow official standards. | credential_definitions; credential_definition_versions; credential_issuances | Official issuer and standard mapping not invented | Policy blocked by ODR-009 |
| AUD-001 | Audit events identify actor type and relevant actor identity. | audit_events; service_principals; user_accounts | Actor type plus mutually exclusive user/service identity | Covered |
| AUD-002 | Audit history is append-only and ordinary users cannot alter it. | audit_events; idempotency_recovery_events | Append-only table privileges and restricted writer | Covered |
| AUD-003 | Audit access is explicitly authorized and scope-limited. | audit_access_events; roles; permissions; user_role_assignments | Separate audit access permission and scope | Partially gated by ODR-010 |
| AUD-004 | Audit searches, exports, and emergency access are audited. | audit_access_events; report_export_audits; audit_events | Audit searches/exports and exceptional access linked to append-only events | Covered structurally; exceptional access policy gated |
| RET-001 | Retention schedules are versioned and authority-approved. | retention_policies; retention_subjects | Versioned policy model; no unapproved schedule seeded | Covered structurally; ODR-011 schedules pending |
| RET-002 | Unknown retention periods do not trigger automated permanent deletion. | retention_policies; retention_subjects; retention_actions | No automated permanent deletion without approved schedule | Covered |
| RET-003 | Legal/investigation holds suspend disposal. | retention_holds; retention_subjects; retention_actions | Hold FK and same-subject lock before disposal | Covered structurally; authority/schedule pending |
| RET-004 | Disposal/anonymization is authorized and auditable. | retention_actions; retention_policies; retention_holds; retention_subjects | Approval, reason, outcome and verification evidence | Covered structurally; disposal execution disabled |
| NOTIF-001 | Notification requests are processed asynchronously where appropriate. | notifications; notification_recipients; outbox_messages | Transactional outbox and async delivery | Covered |
| NOTIF-002 | Notification delivery states distinguish acceptance from delivery. | notification_deliveries; notifications | Provider acceptance/delivery/read states distinct; lifecycle labels gated | Covered structurally |
| NOTIF-003 | Notification retries are controlled and idempotent. | notification_deliveries; outbox_messages; integration_failures | Stable logical event identity, bounded retry and failure records | Covered structurally; retry ceilings remain operational decision |
| NOTIF-004 | Preferences and applicable consent are checked before optional delivery. | notification_preferences; user_accounts | Preference/consent record; channel policy owner-approved default | Covered structurally; delegated consent/provider confirmation pending |
| NOTIF-005 | Webhooks are verified and replay-protected. | webhook_events; integration_providers; integration_failures | Provider identity, signature verification and deduplication | Covered |
| NOTIF-006 | Payment confirmation requires verified provider evidence. | payments; webhook_events; integration_providers | Verified provider evidence before payment confirmation/posting | Covered |
| SEC-001 | Passwords are hashed using Argon2id. | user_accounts | Argon2id hash field and credential handling | Covered |
| SEC-002 | Access/refresh credentials follow approved lifetimes and rotation. | auth_sessions; auth_session_tokens; user_accounts | Server-side sessions, token rotation, inactivity/absolute expiry | Covered |
| SEC-003 | Cookie-authenticated mutations enforce CSRF and origin validation. | No persistent entity; API security boundary | CSRF synchronizer token and Origin validation at API boundary | Platform control; not a business table |
| SEC-004 | Rate limiting applies to public and authenticated APIs. | No persistent entity; edge/API rate-limit configuration | Rate limits on public/authenticated routes and abuse-prone operations | Platform control; not a business table |
| SEC-005 | Sensitive mutations support idempotent retries. | idempotency_records; pre_auth_contexts; idempotency_recovery_events | Authentication idempotency identity, context and recovery ledger | Covered |
| SEC-006 | Reusing an idempotency key with a different payload is rejected. | idempotency_records; audit_events | Fingerprint conflict and safe 409 response; no second execution | Covered |
| SEC-007 | Money uses decimal precision. | financial_transactions; payments; financial_accounts; currencies | Exact NUMERIC amounts and currency-bound relationships | Covered structurally; finance precision/scale authority gate |
| SEC-008 | Timestamps use UTC and event timezone is retained. | events; event_sessions | UTC instants plus original event timezone | Covered |
| SEC-009 | Critical workflows preserve atomic consistency. | All aggregate tables; outbox_messages; audit_events | Atomic transaction boundaries and outbox/audit integration | Cross-cutting transaction control; no single table |
| SEC-010 | Sensitive operations are auditable. | audit_events; audit_access_events; service_principals | Sensitive action and actor audit records | Covered |
| SEC-011 | API is versioned and contract-documented. | No persistent entity; OpenAPI contract | Versioned REST API, success/error envelopes and contract documentation | API contract control; not a business table |
| SEC-012 | Backup and recovery targets are testable. | No persistent entity; backup/DR infrastructure | Daily encrypted backups, RPO <=24h, RTO <=8h, restore tests and alerts | Operational control; not a business table |
| REPORT-001 | Report definitions are versioned and immutable once used. | report_definitions; report_runs | Immutable definition version and run reference | Covered structurally; catalogue authority pending |
| REPORT-002 | Every report run is bound to a server-authorized district, church or department scope. | report_runs; districts; churches; departments | Required district boundary and optional same-district church/department scope; no global scope | Covered structurally; ODR-013 authority pending |
| REPORT-003 | Authorization is rechecked at request, execution and export retrieval. | report_runs; report_export_audits; audit_events | Request/execution/retrieval reauthorization and audit | Covered structurally |
| REPORT-004 | Every published report definition has an approved data classification and data owner. | report_definitions; report_data_owners; user_accounts | Approved classification and FK to accountable data-owner catalogue | Covered structurally; catalogue entries await delegated authority |
| REPORT-005 | Report-specific aggregation and redaction rules are applied consistently. | report_definitions; report_runs | Versioned aggregation/redaction configuration in definition payload | Partially gated; disclosure matrix pending |
| REPORT-006 | Report runs retain reproducibility and audit metadata without storing secrets or unnecessary personal data. | report_runs; report_definitions; audit_events | Definition version, scope, parameters, timing, outcome and safe output metadata | Covered structurally |
| REPORT-007 | Exports use private storage and fresh authorization at retrieval. | report_runs; report_export_audits | Private object reference and fresh authorization on retrieval | Covered structurally |
| REPORT-008 | Export requests, generation, retrieval, denial, expiry and authorized disposal are audited. | report_export_audits; audit_events; audit_access_events | Export creation/retrieval/denial/expiry audit metadata | Covered structurally |
| REPORT-009 | Report runs and exports follow approved record-class retention schedules and holds. | report_runs; retention_subjects; retention_policies; retention_holds; retention_actions | Retention linkage and holds; no schedule seeded | Partially gated by ODR-011/013 |
| REPORT-010 | Report execution and export workloads have server-enforced resource limits and rate limits. | report_runs; outbox_messages; edge/API rate limiter | Async jobs, limits, queue dispatch and rate limiting | Cross-cutting platform control; resource-limit values pending |

## 3. Coverage summary

| Coverage class | Treatment |
|---|---|
| Direct relational coverage | Requirement maps to one or more canonical physical tables, columns, FKs, indexes or CHECKs |
| Transactional coverage | Requirement maps to a transaction boundary, row lock, trigger, actor comparison or outbox protocol |
| Platform/API coverage | Requirement is enforced at the HTTP, security, rate-limit, OpenAPI, backup or deployment layer and intentionally has no business table |
| Policy-gated coverage | Physical structure is proposed, but state values, authority, eligibility, issuer, retention, disclosure or exception policy remains unresolved |
| Excluded capability | Capability is deliberately not represented as an enabled v1 workflow pending explicit policy approval |

### Requirements that are not standalone database entities

- SEC-003: CSRF and Origin validation are API security controls.
- SEC-004: rate limiting is an edge/API control with operational configuration, not a business table.
- SEC-009: atomicity is enforced across aggregate transactions, audit and outbox.
- SEC-011: versioned API/OpenAPI contract is an API artifact.
- SEC-012: backup and disaster recovery are infrastructure/operations controls.
- REPORT-010: resource and rate limits are enforced by the reporting worker/API platform, with report run/job persistence.

### Deliberately gated or excluded capabilities

- APP-007: acting appointments are not enabled; no acting appointment entity or flow is included.
- FIN-004: foreign-exchange processing is not enabled until finance authority approves source/rate/conversion policy.
- FIN-011: partial payments and multiple successful payments per transaction remain disabled under the owner-approved v1 default, pending finance authority confirmation.
- EVT-007: local approval, late registration, postponement and refund exceptions remain authority-gated.
- ATT-007: registration exceptions are structurally supported; self-check-in, QR/offline capture are not enabled pending policy/security approval.
- CRED-004: credential issuer and standard catalogue remains authority-gated.
- RET-001–004: retention model exists, but no permanent deletion schedule or source enrollment is enabled without ODR-011 approval.
- REPORT-004: report owner catalogue exists structurally; no owner catalogue entries are active until delegated authority identifies them.

## 4. Reconciliation checks

- Source requirement IDs read directly from the canonical testable requirements file: 107.
- IDs mapped exactly once: 107.
- Missing mappings: 0.
- Unrecognized mapping IDs: 0.
- Reporting requirements REPORT-001–REPORT-010 are included.
- No preliminary range summary is used in place of the detailed source IDs.

## 5. Approval boundary

This traceability register is part of the physical design review package. It does not approve policy-gated features, physical DDL, Prisma models, migrations, database objects, seeds, APIs or application code. The project owner must approve the exact consolidated physical ERD version before implementation authorization is considered.
