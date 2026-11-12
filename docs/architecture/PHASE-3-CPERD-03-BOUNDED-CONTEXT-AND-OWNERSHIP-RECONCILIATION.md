# DYMS Phase 3 — CPERD-03 Bounded-Context and Ownership Reconciliation

- Revision: BCM-CPERD-03 Draft 0.1
- Date: 2026-11-12
- Source: CPERD-02 Bounded Context Map, CPERD-11 domain/lifecycle/API reconciliation, current owner decisions and CPERD-03 scope baseline
- Status: **SUCCESSOR DOMAIN-OWNERSHIP PROPOSAL; RECONCILIATION IN PROGRESS; NOT APPROVED**
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Purpose

This document reconciles the existing bounded-context proposal against the current DYMS 1.0 scope. It preserves domain ownership boundaries while removing Church Transfer, finance and credential issuance/evidence from active v1 contexts.

The bounded-context map describes logical ownership and information flow. It does not authorize direct cross-context table writes, new database relationships or implementation.

## 2. Current DYMS 1.0 context map

Active contexts:

1. Identity & Access
2. Organization
3. Membership
4. Leadership
5. Department Membership
6. Events
7. Attendance
8. Reporting
9. Audit & Retention
10. Notifications & Integrations

Finance and Credentials remain future/deferred domains. They are not active DYMS 1.0 bounded contexts, aggregates, route families, permission domains, event publishers or report sources.

Federation Oversight is a read-only query boundary over Organization and approved operational reporting data. It is not a separate operational write context.

## 3. Organizational ownership model

| Entity | Owning context | Parent / scope | v1 rule |
|---|---|---|---|
| Federation | Organization | Top-level organization | Federation owns its district set; oversight users are read-only |
| District | Organization | One Federation | District owns churches and district-level departments |
| Church | Organization | One District | Church membership and church-owned events reference a district-owned church |
| Department | Organization | One District | Departments are district-owned; a department may organize events but does not own them |

Hierarchy: Federation → District → Local Church. Department is a district-owned catalogue and participation scope, not a fourth organizational parent level.

Cross-district operational data access is denied. The only cross-district v1 exception is read-only Federation Oversight for the districts in the authenticated user's federation. It exposes aggregate operational information, not operational records or mutation authority.

## 4. Context ownership and aggregate candidates

| Context | Owns and decides | Candidate aggregate roots | Must not own |
|---|---|---|---|
| Identity & Access | Individual accounts, credentials, sessions, password reset, roles, permissions, explicit denies, authorization and authentication idempotency | UserAccount, AuthSession, IdempotencyRecord | Member profile/category, appointments, event ownership or business approval decisions |
| Organization | Federation, district, church, department catalogue, identifiers, hierarchy and ownership | Federation, District, Church, Department | Member's current church membership, department participation, appointments or event lifecycle |
| Membership | Member profile, one-to-one account link, primary category assignment history, church membership lifecycle | Member, MemberCategoryAssignment, ChurchMembership | Login secrets, church catalogue, appointments or transfer workflow |
| Leadership | Position catalogue, appointment request/approval/termination/renewal, appointment-derived role grants | Position, Appointment | Organization hierarchy, account authentication, department participation |
| Department Membership | Member request, coordinator approval, withdrawal, reasoned termination and participation history | DepartmentMembership | Department ownership, position catalogue, appointment authority or account permissions |
| Events | District/church-owned event lifecycle, approvals, material changes, sessions and registration | Event, EventRegistration | Attendance records, department ownership, finance/payment or notification delivery truth |
| Attendance | Event attendance subject, attendance records, correction requests/decisions and attendance history | EventAttendanceSubject, AttendanceRecord, AttendanceCorrection | Event approval, registration policy or member identity |
| Reporting | Versioned report definitions, authorized report runs, protected export lifecycle and read-only oversight queries | ReportDefinition, ReportRun | Source business mutations or independent authorization policy |
| Audit & Retention | Append-only audit evidence, audited audit access, approved retention policies, holds and retention actions | AuditEvent, RetentionPolicy, RetentionSubject, RetentionHold, RetentionAction | Business approvals, unilateral deletion or source-domain ownership |
| Notifications & Integrations | Notification requests/preferences/templates, transactional outbox, provider adapters, webhook verification and delivery attempts | Notification, OutboxMessage, WebhookEvent, NotificationDelivery | Business transaction truth, payment confirmation or authorization decisions |

## 5. Membership and leadership boundaries

- Each member has one individual user account. Shared/guardian-operated accounts are not supported.
- Candidate physical ownership correction: members carries a required district_id, derived during provisioning from the authorized district administrator's scope and immutable in DYMS 1.0 while Church Transfer is excluded. The exact composite FK correction is documented in the Cross-District Ownership Integrity Reconciliation and remains subject to owner review.
- Primary membership categories are Adventurer, Pathfinder and Senior Youth.
- Master Guide is a credential/qualification classification, not a primary membership category. Credential definition/issuance/evidence workflows remain deferred.
- One member has one current church membership. ACTIVE is current; SUSPENDED and TERMINATED are not current. Reactivation restores the same suspended membership row to ACTIVE.
- Church Transfer is excluded from DYMS 1.0. Membership history must not depend on a transfer request aggregate.
- Department membership is independent of primary membership category. Multiple simultaneous department memberships are allowed.
- Leadership appointments require higher-authority approval, fresh approval on renewal, no self-approval, and no overlapping active holder for the same position/scope. Acting, overlap and retroactive exceptions are disabled in v1.

## 6. Context dependencies and permitted integration

| Upstream context | Downstream context | Permitted information | Contract boundary |
|---|---|---|---|
| Identity & Access | All protected contexts | Authenticated actor, session state, permission decision | Server-side authorization port; deny by default |
| Organization | Membership, Leadership, Department Membership, Events, Reporting | Stable organization IDs, hierarchy and owner scope | Read contract; composite ownership integrity where required |
| Membership | Leadership, Department Membership, Events, Attendance, Reporting | Member identity reference, category and current membership facts | Read contract; owning context controls mutation |
| Leadership | Identity & Access, Reporting | Effective appointment and appointment-derived grant facts | Explicit grant/revocation event; scope remains bounded |
| Department Membership | Reporting | Active participation and decision history | Read contract or domain event |
| Events | Attendance, Notifications & Integrations, Reporting | Approved event, session and registration facts | Domain event and read contract; attendance owns attendance records |
| Attendance | Reporting | Attendance facts and correction outcomes | Read contract; original facts and correction history preserved |
| All active contexts | Audit & Retention | Auditable action facts and actor/scope metadata | Append-only audit port; ordinary contexts cannot alter audit evidence |
| All active contexts | Notifications & Integrations | Transactional outbox events | Outbox contract; delivery does not change source business truth |
| Active source contexts | Reporting | Authorized read models and source metadata | Query contract; report scope/field disclosure is independently authorized |
| Organization and approved operational reporting data | Federation Oversight | Federation-bounded aggregate metrics | GET-only query facade; no source-table mutation or sensitive record disclosure |

No downstream context writes directly to an upstream context's tables. Every cross-context dependency must be an explicit application port, read contract, domain event or authorized projection.

## 7. Federation Oversight query boundary

- The authenticated federation principal resolves to one federation through an explicit federation-scoped grant. The current grant/deny register lacks this scope; the proposed authorization_scope_type/federation_id correction remains a physical-design blocker.
- The query service derives the set of districts belonging to that federation from Organization ownership.
- Every aggregate is filtered to that set before aggregation.
- Only predefined, approved aggregate metrics are returned.
- No member-level profile, personal identifier, attendance row, credential evidence, audit detail, finance record or sensitive investigation content is returned.
- The query surface is GET-only and does not create report runs or exports.
- Federation authority does not grant district/church operational permissions, even if an actor has other scoped roles.
- All results are read-only. No federation-level create, edit, delete, appointment approval, finance approval, event administration or local-church administration is permitted.

## 8. Deferred domain isolation

The following must not remain active dependencies in DYMS 1.0:
- Church Transfer request/acceptance/approval/cancellation aggregates, APIs, events and reports.
- Finance accounts, budgets, transactions, payment execution, posting and reversal.
- Credential definition/version, evidence, verification, issuance, renewal and revocation workflows.
- Blockchain wallets, on-chain proofs and public credential verification.

Generic audit, outbox, notification and reporting mechanisms must not be treated as authorization to reactivate a deferred domain. A future feature requires an explicit scope change and physical/API reconciliation.

## 9. Open design closure

1. Reconcile every active table and API route to exactly one owning context.
2. Reconcile the CPERD-03 physical table list and all 107 requirement dispositions with this context map.
3. Confirm exact aggregate transaction boundaries and event ownership.
4. Complete the API command/query and permission matrix.
5. Complete Federation Oversight metrics, source-owner review, redaction and freshness rules.
6. Complete retention source enrollment without inventing schedules or adding unapproved FKs.
7. Confirm report data-owner responsibility for multi-context reports.
8. Record unresolved domain states as open; do not invent ENUM values.
9. Obtain owner review and independent technical review against final artifact hashes.

## 10. Approval boundary

This is a successor domain-ownership proposal. It does not amend the frozen DFR-001 through DFR-006 decisions, approve new institutional policy, certify the final physical ERD, or authorize implementation.

The project owner's implementation authorization is conditional on final CPERD-03 physical ERD approval. No implementation begins before that approval.

**Status: DRAFT 0.1 — NOT APPROVED.**
