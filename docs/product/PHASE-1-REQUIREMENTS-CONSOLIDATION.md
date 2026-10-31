# DYMS Phase 1 — Consolidated Requirements and Traceability Baseline

- Product: District Youth Management System (DYMS)
- Release scope: DYMS v1.0, Sango District
- Status: Working consolidation for project-owner review; not a final PRD or ERD approval
- Decision baseline: DDD-001 through DDD-015, including project-owner approvals recorded through 2026-10-31
- Implementation gate: No application code, Prisma domain models, migrations, or physical database schema changes before explicit approval of the consolidated ERD.
- Related frozen decisions: DFR-001 through DFR-006, subject to the repository discrepancy recorded in §11.

## 1. Purpose

This document consolidates approved business and domain rules into a requirements baseline that can be traced into the conceptual domain model and ERD. It records what DYMS must do, what it must prevent, and which decisions support each requirement.

This is a design artifact. It does not claim that any feature has been implemented, tested, deployed, or approved for physical database implementation.

## 2. Product scope and boundaries

### 2.1 In-scope for v1.0

DYMS is a district-level Adventist Youth Ministries management platform for Sango District. The v1.0 domain includes:

- Individual user accounts and ministry member records.
- Member categories and credential records.
- Local churches and district organizational structure.
- Church transfers.
- Department membership.
- Leadership appointments and scoped authorization.
- Events, registration, sessions, and attendance.
- District and church financial accounts, transactions, budgets, and reporting.
- Notifications and external service integrations.
- Audit, accountability, retention, and controlled disposal.
- Reporting and authorized exports.

### 2.2 Out of scope or deferred

- Conference-wide or multi-district administration unless separately approved.
- Blockchain anchoring and public credential verification in the MVP.
- Putting personal or sensitive member information on a public blockchain.
- Physical database design, Prisma domain models, migrations, API implementation, and application code before ERD approval.
- Provider-specific commitments for email, SMS, WhatsApp, or payment gateways until providers are selected and approved.

## 3. Core identity and membership requirements

### 3.1 Individual member account policy

The project owner approved the following policy:

1. Every DYMS member must have an individual account and login credentials.
2. Each member logs in using their own credentials.
3. A member must not share an account with another member.
4. No parent-owned, guardian-owned, or guardian-managed account is permitted.
5. DYMS must not model guardian-to-child account access or delegated guardian login.
6. Each member has one account linked to one member record.
7. Activities performed by a member are attributed to that member's own authenticated identity.

The earlier guardian-managed membership proposal is rejected and superseded. Do not add guardian relationship or guardian verification entities to the ERD.

**Design implication:** The conceptual model requires a one-to-one USER–MEMBER relationship. The ERD must define the lifecycle for account creation and access for younger members without introducing guardian-operated accounts. Age thresholds, child-safety controls, consent requirements, and any applicable official policy remain evidence/policy questions and must not be invented.

### 3.2 Member category requirements

- Each member has one active primary category at a time.
- Categories in the current baseline are Adventurer, Pathfinder, and Senior Youth.
- Master Guide is a separate credential, not a primary member category.
- Category changes require authorization by an administrator acting within assigned scope.
- Category history must be retained.
- Category changes do not deactivate the member account.
- Department participation is separate from primary category.
- Eligibility must follow applicable official Adventist Youth Ministries requirements.
- An authorized departmental coordinator verifies eligibility and supporting evidence before approval.
- Category transitions record prior category, new category, evidence, verifier/approver, reason, and effective date.
- Exceptional assignments require district-level authorization and a recorded reason.
- DYMS must not invent age limits, class requirements, or qualification criteria.

## 4. Organization, transfer, appointment, and department requirements

### 4.1 Church transfer

- A member initiates a transfer request.
- Receiving church acceptance is required.
- District approval is required for the transfer to complete.
- The effective date is the district-approved date; backdating is not permitted.
- A member has only one current primary church and one pending transfer request at a time.
- A member may withdraw a pending request before district approval.
- Receiving church and district rejection require recorded reasons.
- An approved transfer may be cancelled before its effective date only with district authorization and a recorded reason.
- A rejected or cancelled request requires a new request if the member still wants to transfer.
- Transfer completion updates current church and history atomically. Historical church assignments remain preserved.

### 4.2 Leadership appointments

- Only designated higher authority may approve an appointment.
- A person cannot approve their own appointment.
- Appointment statuses: Draft, Pending Approval, Active, Rejected, Expired, Terminated, and Cancelled.
- Acting appointments are permitted with approval, reason, start date, and end date. They do not erase the substantive appointment.
- Renewal requires fresh approval and is never automatic.
- The normal annual term is January 1 to December 31.
- A mid-year replacement normally serves through December 31 unless a different term is formally authorized.
- The appointing authority or a higher authority may terminate an appointment early with a recorded reason and effective date.
- A replacement takes effect on its approved effective date.
- Two people must not hold the same active position in the same organizational scope at the same time.
- Appointment, approval, renewal, acting, rejection, cancellation, expiry, and termination history must be retained.

### 4.3 Department membership

- A member requests department membership.
- The designated department coordinator approves or rejects the request.
- Members may belong to multiple departments.
- Members may request withdrawal.
- An authorized coordinator may terminate membership with a recorded reason.
- Department transfer ends the old membership and creates a new membership while preserving history.
- Department membership alone does not grant leadership authority.
- Each department must have documented eligibility requirements approved by the appropriate authority.
- Rejection requires a reason.
- A member may appeal rejection or termination to district authority.
- Membership is reviewed annually; renewal confirms continued eligibility.
- A primary church transfer triggers a review, not automatic deletion, of department membership.
- District authority may authorize an eligibility exception with a recorded reason and approval.
- Application, approval, rejection, renewal, withdrawal, transfer, and termination history must be retained.

## 5. Authorization and security requirements

### 5.1 Authorization model

- Deny by default.
- Every protected request is authorized server-side.
- Permission grants are additive only within valid assigned scope.
- Explicit DENY overrides every applicable ALLOW for the named permission and resource scope.
- A deny does not spread to unrelated scopes. Descendant coverage applies only where the approved permission scope explicitly defines it.
- Ambiguous scope fails closed for the affected operation.
- Users cannot grant themselves privileges.
- Expired, terminated, or revoked appointments cannot grant appointment-derived permissions.
- Department membership does not grant leadership permissions.
- Access to another church or department requires explicit scope authorization.
- Role titles do not establish precedence or expand another role's scope.
- Review-required role combinations remain inactive until independently approved.
- Prohibited role combinations must not be active concurrently.
- The affected actor cannot create, approve, modify, or remove their own explicit deny.
- Deny creation, attempted use, review, modification, expiry, and revocation must be auditable.

### 5.2 Appointment-independent operational roles

Certain technical or oversight roles may exist independently of ministry leadership appointments, including System Administrator, Security Administrator, and designated Audit Officer roles. Their permissions, assignment authority, and scope must be explicit. Technical administration does not automatically grant ministry, finance, credential issuance, or unrestricted audit authority.

### 5.3 Authentication and API controls

The following frozen security requirements remain applicable:

- Argon2id password hashing.
- Short-lived access credentials and rotating refresh credentials.
- Server-side session validation and revocation.
- Secure, HttpOnly cookies; CSRF protection; explicit CORS allowlist.
- Access credential lifetime 15 minutes; session inactivity timeout 7 days; absolute session lifetime 30 days.
- Single-use password reset token lifetime 30 minutes.
- Refresh rotation, reuse detection, and session revocation.
- Mandatory rate limiting, including sensitive and abuse-prone operations.
- Versioned REST API under /api/v1, standard response envelopes, OpenAPI, and contract testing.
- UUID internal identifiers, foreign-key integrity, decimal monetary values, UTC timestamps, and preservation of event time zones.
- Critical workflows must be transaction-safe and auditable.

## 6. Event, registration, and attendance requirements

### 6.1 Events

- Authorized coordinators create events within their scope.
- District events require district approval before publication.
- Local church events require approval from the designated local church authority before publication.
- Only approved events are published for registration.
- Event coordinators specify whether registration is mandatory or optional.
- Registration deadlines and capacity are controlled.
- Late registration reopening requires authorized action and a recorded reason.
- Registration above capacity requires event-authority approval and a recorded reason.
- Significant event changes require approval and audit.
- Postponement follows the required approval process; registered members are notified of revised details.
- Cancellation requires authorized decision and recorded reason.
- Refunds for paid cancelled events follow the approved finance workflow.
- Completed event records cannot be silently changed or physically deleted. Corrections require authorization, reason, and audit history.

### 6.2 Attendance

- Authorized event personnel record attendance for DYMS members.
- Attendance is linked to event and member, and may be session-specific.
- Valid event registration is the normal check-in prerequisite. An authorized coordinator may grant a documented exception.
- QR check-in is supported and must be protected against unauthorized reuse.
- Self-check-in is available only when explicitly enabled by the event coordinator.
- Duplicate valid attendance for the same member and event/session is prevented.
- Manual attendance entry is supported when scanning is unavailable.
- Attendance statuses include Present, Absent, Late, and Excused, with other approved statuses where needed.
- Multi-session events may record session attendance and produce an overall event summary.
- Offline capture is supported for authorized personnel; synchronization validates and deduplicates records.
- Corrections preserve original and revised values, reason, actor, approver, and timestamps.
- Event coordinators may submit correction requests; designated event or district authorities approve within scope.
- Reports distinguish attendance statuses.

## 7. Finance requirements

### 7.1 Accounts and currency

- Every account belongs to a defined organizational scope.
- District and local church accounts have separate ownership.
- District and churches may maintain multiple approved accounts.
- Each account has one currency; NGN is the Sango District default.
- Foreign currency requires explicit support and exchange-rate records.
- Every transaction references its owning account.
- Departments may maintain financial records through approved subaccounts or allocations, not independent unapproved accounts.
- Authorized district financial officers may view church reports within scope; viewing does not grant authority to operate church accounts.
- Account opening requires designated financial approval.
- Account closure requires reconciliation and approval; historical transactions remain available to authorized users.
- Authorized financial or security officers may freeze an account for a documented reason, authority, and duration.
- Foreign currency transactions preserve original amount and currency. Converted reports preserve rate, conversion date, and resulting NGN value.
- District consolidation does not transfer church account ownership.

### 7.2 Transaction workflow

- Authorized officers submit transactions within scope.
- Designated approvers review transactions.
- Submitter cannot approve their own transaction.
- Authorized payment officers execute approved payments.
- Submission, approval, payment execution, and posting remain separated where required by the approved control policy.
- Approval thresholds are configurable; actual amounts require separate approval.
- Transactions above configured thresholds may require multiple independent approvals.
- Rejections require reasons.
- Submitted transactions cannot be silently edited; authorized revision and resubmission are controlled.
- Approved and completed transactions are posted through the defined workflow.
- Partial payments are supported and independently recorded; outstanding balance is tracked.
- Failed, returned, or reversed payments are recorded and are not treated as successful.
- Reimbursements require evidence, review, approval, and payment workflow.
- Budget checks apply to transactions. Excess expenditure requires additional authorization and a recorded reason.
- Posted transactions are corrected through linked, reasoned reversals. Duplicate reversals are prevented.
- Reports distinguish pending, approved, paid, posted, rejected, and reversed states.

## 8. Credentials, audit, retention, and integrations

### 8.1 Credentials

- DYMS maintains a controlled, versioned credential catalogue with issuer, scope, and requirements.
- Requirements follow recognized Adventist Youth Ministries standards; DYMS must not invent qualifications.
- Authorized personnel verify evidence; designated issuers approve issuance.
- Credential records identify member, definition/version, issuer, approver, issue date, and any authority-defined validity.
- No expiry is invented where the governing definition has no expiry.
- Renewal follows authority rules and creates a linked issuance record.
- Revocation requires authorized issuer/higher authority and a reason.
- Reissue for lost/damaged certificate does not imply a new qualification.
- Corrections preserve history.
- Verification is limited to authorized users and minimum necessary disclosure.
- Blockchain/public verification is deferred from MVP.

### 8.2 Audit and accountability

- Audit coverage includes account, membership, transfer, appointment, permission, event, attendance, finance, credential, integration, and administrative actions.
- Each audit event identifies actor type: USER, SYSTEM, SERVICE, or ANONYMOUS, as applicable.
- Delegated/represented actions identify both initiating actor and represented party where relevant.
- Audit records are append-only through application policy and database permissions.
- Ordinary users and administrators cannot edit or delete audit records.
- Corrections append new records.
- Audit access is explicitly permissioned and scope-limited, separate from ordinary administration.
- Audit searches, exports, and exceptional access are themselves audited.
- Passwords, tokens, secrets, and full session cookies must never be logged.
- Emergency access requires documented reason, authorization, limited duration, and audit.
- Audit retention follows approved schedules; append-only does not mean indefinite retention.

### 8.3 Retention and disposal

- Records are classified into membership/organization, finance, attendance/events, appointments/credentials, security/authentication, and operational data.
- Each class requires an approved retention period, rationale, authority, start event, and disposal action.
- No arbitrary deletion.
- Posted finance records and required audit history are not deleted through ordinary administration.
- Legal/investigation holds suspend disposal until authorized release.
- Privacy and data minimization apply; lawful anonymization/deletion must not destroy records that must be preserved.
- Disposal/anonymization requires approved schedule, authorization, reason, and audit.
- Retention schedules are versioned and reviewed.
- Where official periods are unknown, automated permanent deletion remains disabled pending an approved schedule.

### 8.4 Notifications and external integrations

- In-app notifications are supported; architecture supports email, SMS, and WhatsApp.
- Provider-independent adapters isolate core business logic from vendors.
- Workflow: request, queue, preference/consent check, delivery attempt, result, controlled retry.
- Notification failure does not roll back an approved business action.
- Delivery statuses: Pending, Processing, Accepted, Delivered, Failed, Exhausted, Cancelled.
- Provider acceptance is not represented as delivery or read confirmation.
- Optional communications respect member preferences and applicable consent; essential security/account notices follow approved policy.
- Payment verification uses authenticated provider callbacks or API checks, validating reference, amount, currency, and status.
- Browser redirects alone never prove payment.
- Webhooks require signature verification, replay protection, validation, rate limiting, and audit.
- Provider credentials remain in managed secrets/protected configuration, never frontend code.
- Failed integrations support controlled retries, monitoring, and reconciliation.

## 9. Cross-cutting data integrity requirements

- Each member has one primary current church and one active primary category.
- A member has one individual account; no guardian or shared login relationship.
- Historical membership, category, transfer, appointment, department, credential, finance, event, and attendance records are preserved according to policy.
- Critical multi-record state changes are atomic.
- Uniqueness and concurrency controls prevent duplicate current assignments, duplicate attendance, duplicate reversals, duplicate payment posting, and duplicate logical operations.
- Sensitive mutations use idempotency keys bound to actor, operation, scope, and normalized request fingerprint.
- Reusing a key with a different payload returns a conflict and does not execute.
- Repeated completed requests return the original safe result; in-progress duplicates do not execute again.
- Retry handling distinguishes pre-commit failure from response loss after commit.
- External payment outcomes that are uncertain require reconciliation.
- Money uses decimal precision, never binary floating-point arithmetic.
- Store timestamps consistently in UTC and preserve event timezone.
- Every controlled action records actor, time, scope, outcome, and reason where required.

## 10. Requirements traceability matrix

The following ranges are checked against the current detailed testable requirements document. The group IDs below are the IDs currently enumerated there, not planned or reserved identifiers.

| Requirement group | Current requirement IDs | Source decisions |
|---|---|---|
| Identity and account | ID-001 to ID-004 | DDD-001, DDD-002, project-owner individual-account approval |
| Member categories | MEM-001 to MEM-006 | DDD-002 |
| Church transfers | ORG-001 to ORG-007 | DDD-003 |
| Appointments | APP-001 to APP-007 | DDD-004 |
| Authorization and roles | AUTHZ-001 to AUTHZ-011 | DDD-005 and approved explicit-deny/role-conflict follow-up |
| Department membership | DEPT-001 to DEPT-006 | DDD-006 |
| Events and registration | EVT-001 to EVT-007 | DDD-007 |
| Attendance | ATT-001 to ATT-007 | DDD-008 |
| Accounts and currency | FIN-001 to FIN-005 | DDD-009 |
| Transactions and finance workflow | FIN-006 to FIN-012 | DDD-010 |
| Credentials | CRED-001 to CRED-004 | DDD-011 |
| Audit and accountability | AUD-001 to AUD-004 | DDD-012 |
| Idempotency and sensitive mutation controls | SEC-005 to SEC-006 | DDD-013 |
| Retention and disposal | RET-001 to RET-004 | DDD-014 |
| Notifications, webhooks and payment integration | NOTIF-001 to NOTIF-006 | DDD-015 |
| Cross-cutting security/data integrity | SEC-001 to SEC-012 | DFR-001 to DFR-006; DDD-005; DDD-012 to DDD-015 |

The current detailed file enumerates 97 testable requirement IDs. This table is maintained against the actual IDs in `PHASE-1-TESTABLE-REQUIREMENTS.md`. It does not imply that every policy question is closed. DDD-013 and DDD-015 details are mapped to SEC and NOTIF requirement groups respectively; additional independent IDs should be added only if the acceptance criteria are expanded.

## 11. Open decisions, evidence gaps, and repository reconciliation

The following are deliberately not invented or silently resolved:

1. **Official Adventist Youth Ministries eligibility standards:** Confirm age bands, class/qualification criteria, category transitions, credential requirements, issuer authority, and evidence standards from current official sources and applicable local Conference policy.
2. **Individual login for younger members:** The individual-account rule is approved. The safe account registration, identity verification, consent, and age-appropriate access process still requires an approved policy. No guardian login is permitted.
3. **Permission catalogue:** Define stable permission identifiers and complete permission-to-resource/scope mappings.
4. **Operational roles:** Confirm the full appointment-independent role catalogue, exact authorities, and independent review responsibilities.
5. **Appointment governance:** Confirm designated appointing authorities for every position, acting appointment limits, and edge cases not specified by the approved rules.
6. **Department eligibility:** Obtain approved requirements for each department and confirm the authority that approves them.
7. **Event policy:** Confirm any local church-specific approval authority and event fee/refund rules where not already defined by approved finance policy.
8. **Finance thresholds:** Monetary approval limits, multi-approval thresholds, budget variance tolerances, and exact authorized officers require financial authority approval.
9. **Account governance:** Confirm the final account/subaccount structure and who may open, close, freeze, and unfreeze each account class.
10. **Credential authority:** Obtain official catalogue definitions, issuer authority, validity/expiry, renewal, revocation grounds, and evidence retention rules.
11. **Retention schedule:** Obtain approved durations and legal/institutional basis for every record class. Automated permanent deletion remains disabled where duration is unknown.
12. **Providers:** Select email, SMS, WhatsApp, and payment providers; define provider-specific retry, webhook, and reconciliation rules after selection.
13. **Audit governance:** Confirm named security/audit authorities, emergency access approvers, and review cadence.
14. **Historical PRD evidence:** The expected product requirements baseline file was not present at the repository audit point. A previously approved working baseline was referenced in project history, but its source artifact must be recovered or its contents reconstructed and explicitly labelled. This document does not claim to replace a missing approved PRD.
15. **DFR-006 status conflict:** README states the formal design freeze was lifted on 2026-10-29 and implementation authorized. The decision register still marks DFR-006 APPROVED and describes the design as frozen. The project owner's later explicit instruction for this Phase 1 work requires preserving DFR-001–DFR-006 and prohibits implementation before explicit ERD approval. Do not infer implementation permission from README. Resolve the documentation conflict through a recorded owner decision/change record before any implementation gate is reconsidered.

## 12. ERD preparation and approval gate

The conceptual ERD must represent, at minimum, the following domain concepts and their historical relationships:

- User account and member identity, with mandatory one-to-one relationship.
- Member category assignments and category history.
- Credential definitions, versions, issuance, evidence references, renewal, revocation, and reissue.
- District, local church, department, and organizational scope.
- Church membership/assignment history and transfer requests/approvals.
- Department membership history and application workflow.
- Appointment positions, appointments, acting appointments, terms, approvals, and lifecycle history.
- Role catalogue, permission catalogue, scoped role assignments, grants, explicit denies, role-conflict review, and authorization audit.
- Events, event sessions, registration, capacity exceptions, event changes, cancellation, and attendance.
- Attendance records, correction requests, approvals, and history.
- Financial accounts, currency, exchange rates, budgets, allocations, transaction requests, approvals, payments, postings, reversals, and supporting evidence.
- Notifications, recipients, delivery attempts, preferences/consent, templates, provider configuration references, webhook events, and integration failures.
- Audit events, audit access, retention schedules, legal holds, and disposal/anonymization records.
- Idempotency records and external payment reconciliation records where required by the domain design.

This is a conceptual coverage checklist, not a physical schema proposal. Entity boundaries, cardinalities, optionality, keys, indexes, and physical representations remain subject to ERD design review.

**Approval gate:** The project owner must explicitly approve the complete consolidated ERD. Until then, do not create Prisma domain models, migrations, physical database schema, or application code.

## 13. Phase 1 completion criteria

Phase 1 is complete only when:

1. DDD-001 through DDD-015 are reconciled into one decision register with approval status and remaining gaps.
2. Every requirement has a stable ID, source decision, rationale, priority, and testable acceptance criteria.
3. Open official-policy questions and owner decisions are explicitly recorded.
4. Domain boundaries, ownership, dependencies, and cross-module interactions are documented.
5. The conceptual ERD includes entities, relationships, cardinalities, history, invariants, and scope constraints.
6. The ERD passes review for authorization, financial separation of duties, auditability, retention, concurrency, and data integrity.
7. A final approval package presents the ERD, assumptions, unresolved issues, risks, and traceability.
8. The project owner explicitly approves the ERD before implementation work begins.

---
This document is a working consolidation. It must be reviewed against the full approved decision records and official Adventist Youth Ministries evidence before being promoted to a final requirements baseline.
