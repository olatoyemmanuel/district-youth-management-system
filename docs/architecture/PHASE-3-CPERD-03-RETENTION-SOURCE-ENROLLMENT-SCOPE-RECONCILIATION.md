# DYMS Phase 3 — CPERD-03 Retention Source-Enrollment Scope Reconciliation

- Revision: RET-CPERD-03 Draft 0.1
- Date: 2026-11-12
- Source: CPERD-12 Retention Source-Enrollment Candidate Inventory, CPERD-03 table scope, current DFR/ODR/AUD decisions
- Status: **SCOPE RECONCILIATION PROPOSAL; NO SCHEDULES OR SOURCE LINKS APPROVED**
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Purpose

This document reconciles the CPERD-12 retention candidate inventory against DYMS 1.0 scope. It identifies included source classes that warrant future retention review and removes deferred/excluded domains from active v1 retention enrollment.

It does not approve retention durations, legal basis, source authority, disposal triggers, source links, retention FKs, polymorphic references or automated deletion.

## 2. Governing rules

- AUD-OD-01 through AUD-OD-10 are approved governance decisions. This does not approve any retention schedule or destructive disposal.
- ODR-011 requires no automated permanent deletion without an approved schedule. Holds suspend disposal.
- DFR-005 backup retention/recovery is separate from business-record retention.
- DFR-004 password reset/session expiry and DDD-013 idempotency response/tombstone lifetimes are protocol-specific technical lifetimes, not general ODR-011 schedules.
- A terminal business status does not itself authorize deletion.
- No retention source is enrolled until record class, source authority, duration, trigger, permitted action, data owner and hold behavior are approved.

## 3. Existing physical retention model

| Table | Current role | Scope disposition |
|---|---|---|
| retention_policies | Versioned schedule catalogue | INCLUDED; no approved schedules or seeded values |
| retention_subjects | Typed retention anchor | INCLUDED; no source table FK, source-row ID or source-owner link exists in the current design |
| retention_holds | Hold/release record for one retention subject | INCLUDED; hold workflow requires approved authority |
| retention_actions | Controlled action against one retention subject | INCLUDED structurally; destructive execution disabled until schedule and source enrollment are approved |

The current model does not identify which business record a retention subject represents. Do not invent a polymorphic source reference or add a source FK in this scope reconciliation.

## 4. Included DYMS 1.0 source-class candidates

All rows below are candidate classes only. They are not enrolled and have no approved duration.

| Candidate source class | Included candidate tables | Owning context | Candidate trigger to evaluate | Current disposition |
|---|---|---|---|---|
| Identity and account lifecycle | user_accounts, auth_sessions, auth_session_tokens, password_reset_tokens, pre_auth_contexts | Identity & Access | Account closure/suspension; session revocation/expiry; reset-token use/expiry; pre-auth context completion/expiry | Not enrolled; DFR-004 protocol expiry remains separate |
| Authorization and access history | roles, permissions, role_permissions, user_role_assignments, access_denies, role_conflict_rules, role_conflict_reviews | Identity & Access / Security | Grant/deny expiry or revocation; conflict review completion/supersession | Not enrolled; preserve authority provenance |
| Idempotency and safe replay | idempotency_records, idempotency_recovery_events | Identity & Access | Terminal response expiry and tombstone expiry | Separate approved DDD-013 protocol lifetimes; no general ODR-011 schedule inferred |
| Organization and reference catalogues | federations, districts, churches, departments, member_categories, member_category_eligibility_rules, department_eligibility_rules | Organization / Membership | Closure, merger, supersession or catalogue-version retirement | Not enrolled; preserve historical ownership and policy provenance |
| Member and membership history | members, member_category_assignments, church_memberships, department_memberships | Membership / Department Membership | Membership/category end; department withdrawal/termination | Not enrolled; preserve membership and category history; Church Transfer excluded |
| Leadership and appointment history | positions, appointments, appointment_role_links | Leadership / Identity & Access | Appointment end/termination; position retirement; derived grant termination | Not enrolled; reconstruct historic authority |
| Event and registration records | events, event_approvals, event_change_records, event_registrations, event_sessions, event_organizing_departments | Events | Event completion/cancellation; registration cancellation; final event reconciliation | Not enrolled; terminal state does not authorize deletion |
| Attendance and correction evidence | event_attendance_subjects, attendance_records, attendance_corrections | Attendance | Event/session completion; correction approval/rejection | Not enrolled; preserve original attendance and correction provenance |
| Audit and privileged-access evidence | audit_events, audit_access_events | Audit & Retention / Security | Audit event creation; investigation closure; authorized review completion | Not enrolled; append-only behavior remains |
| Reporting and export records | report_data_owners, report_definitions, report_runs, report_export_audits | Reporting / source-domain data owners | Definition retirement; run completion; export expiry/retrieval | Not enrolled; export expiry duration and disposal remain unset |
| Notifications and delivery evidence | notification_templates, notification_preferences, notifications, notification_recipients, notification_deliveries | Notifications & Integrations | Delivery exhaustion/completion; preference supersession; template retirement | Not enrolled; provider acceptance is not delivery |
| Provider integration and operational records | service_principals, integration_providers, outbox_messages, webhook_events, integration_failures | Identity & Access / Notifications & Integrations | Provider event reconciliation; outbox completion/exhaustion; failure resolution; principal deactivation | Not enrolled; operational cleanup is distinct from business retention |
| Retention control evidence | retention_policies, retention_subjects, retention_holds, retention_actions | Audit & Retention | Policy supersession; hold release; action completion/verification | Not enrolled as source classes; recursive retention requirements remain open |

## 5. Excluded or deferred source classes

| CPERD-12 candidate | CPERD-03 disposition | Reason |
|---|---|---|
| Church Transfer request history | EXCLUDED FROM DYMS 1.0 | Church Transfer workflow and table are excluded |
| Finance and budget records | DEFERRED FROM DYMS 1.0 | Finance, payment, budget and transaction management are deferred |
| Credential definitions and evidence | DEFERRED FROM DYMS 1.0 | Credential definition/version, issuance and evidence workflows are deferred |
| Currency catalogue | EXCLUDED FROM ACTIVE V1 RETENTION SCOPE | Finance-specific catalogue is not an active v1 domain |

These rows may remain in historical CPERD-12 source material. They must not be treated as active DYMS 1.0 retention source classes or receive source links, schedules, APIs or permissions.

## 6. Separate protocol and infrastructure lifetimes

| Record/control | Governing lifetime | Boundary |
|---|---|---|
| Password reset token | DFR-004: 30 minutes, single use | Token expiry/replay control, not account-history deletion |
| Authentication session | DFR-004: 7-day inactivity and 30-day absolute lifetime | Session validity/revocation is not deletion of account/security history |
| Idempotency terminal response | DDD-013: 24-hour terminal response retention | Protocol-specific response retention; cleanup validation is implementation-stage |
| Idempotency tombstone | DDD-013: 30-day compact identity/tombstone retention | Protocol-specific; not a general business retention schedule |
| Backup copies | DFR-005 daily encrypted backups, RPO no greater than 24 hours, RTO within 8 hours, restore tests and alerts | Backup retention/recovery is separate from business-record retention |
| Report export | report_runs.expires_at exists | No expiry duration or automatic object deletion is selected |
| Outbox/webhook processing | Durable processing, bounded retries and deduplication | Operational cleanup values require a separate worker/operations contract |

## 7. Conditions before enrollment or disposal

Before a source class is enrolled:
1. Identify the exact source record class and owning bounded context.
2. Identify the accountable data owner and approving authority.
3. Document legal/institutional basis and authoritative source/version where applicable.
4. Approve duration, trigger event, permitted action and exception/hold rules.
5. Specify source-record identity linkage without unsafe polymorphic references.
6. Define retention subject creation, update and closure semantics.
7. Define same-subject concurrency control between hold issuance/release and disposal.
8. Define audit evidence, verification and failure handling.
9. Reconcile report exports, backups and operational lifetimes separately.
10. Obtain owner approval before any new physical source link or FK is added.

A retention subject with no approved schedule, no source enrollment, unknown duration or unresolved hold state is not eligible for automated permanent deletion.

## 8. Federation oversight boundary

Federation oversight reports are read-only aggregate queries and are not persisted as report runs or exports under the current API proposal. They do not introduce a new retention source class or source FK. If a future implementation stores federation oversight snapshots, their retention classification and source-owner authority require a separate decision.

## 9. Disposition

- Approved ODR-011 business retention durations added: **0**.
- Active DYMS 1.0 retention source enrollments approved: **0**.
- New retention FKs/columns/tables proposed by this document: **0**.
- Automated permanent deletion authorized: **NO**.
- Deferred/excluded retention source classes reactivated: **0**.

**Status: DRAFT 0.1 — NOT APPROVED.**
