# DYMS Phase 1 — Domain Boundaries and Module Responsibilities

Status: Working design proposal for ERD preparation.
Scope: DYMS v1.0, Sango District.
Approval gate: This document does not approve physical schema, Prisma models, migrations, or application code.

## 1. Architecture

DYMS uses a modular monolith with explicit Domain-Driven Design boundaries. The API and background worker are separate runtime processes. Each business module owns its rules and authoritative records. Other modules interact through explicit application contracts, not by directly changing another module's records.

The database may be shared by modules in the modular monolith. Shared persistence does not remove module ownership.

## 2. Organizational scope

The initial scope is one district, Sango District, and its local churches and departments.

- District owns district-wide records and decisions.
- A local church owns its local church records and decisions.
- Departments operate within an explicitly assigned district or church scope.
- A member has one current primary church.
- Department membership is separate from church assignment and leadership appointment.
- A district role does not silently grant access to every church or department.
- Every permission and assignment has an explicit organizational scope.

Conference-wide administration is outside v1.0 unless separately approved.

## 3. Bounded contexts

### 3.1 Identity and Account

Owns:
- Individual user accounts and login identity.
- Password credential lifecycle.
- Account status, suspension, and recovery.
- Sessions and authentication security state.

Invariants:
- Every member has an individual account and login.
- One account is linked to one member, and one member to one account.
- No shared or guardian-operated account.
- Authentication identifies the actor but does not grant business permissions.

### 3.2 Membership

Owns:
- Member profile and ministry membership lifecycle.
- Primary category definitions and member category assignments/history.

Invariants:
- One active primary category at a time.
- Categories are Adventurer, Pathfinder, and Senior Youth.
- Master Guide is a separate credential.
- Category changes require applicable eligibility verification and authorized approval.
- Category history is retained.
- Department participation does not determine primary category.

Official age, class, and eligibility criteria remain an evidence gap. Do not invent them.

### 3.3 Organization

Owns:
- District, local church, and department records.
- Member-to-church current assignment and history.
- Church transfer requests, receiving church decisions, district approval, and transfer completion.
- Department membership applications and lifecycle history.

Invariants:
- One current primary church per member.
- Transfer requires member initiation, receiving church acceptance, and district approval.
- Transfer effective date is the approved date.
- Department membership may be multiple and does not confer leadership authority.
- Church transfer triggers review of department membership; it does not silently delete it.
- Historical assignments remain preserved.

### 3.4 Leadership and Authorization

Owns:
- Position catalogue and appointment lifecycle.
- Appointment approvals, terms, renewal, acting appointment, replacement, expiry, and termination.
- Role and permission catalogues.
- Scoped role assignments and permission grants.
- Explicit denies and role-conflict review decisions.
- Authorization policy and decision evidence.

Invariants:
- Only designated higher authority approves appointments.
- No self-approval.
- Renewal requires fresh approval.
- Appointment-derived permissions cease when the appointment ends or expires.
- Explicit deny overrides applicable allow only for its defined permission and resource scope.
- Ambiguous scope fails closed.
- Review-required role combinations need independent approval.
- Prohibited combinations cannot be active concurrently.
- The affected actor cannot administer their own explicit deny.

The complete permission catalogue, resource mapping, and scope inheritance rules remain design prerequisites.

### 3.5 Events and Registration

Owns:
- Event definitions, scheduling, venue, scope, publication, registration policy, capacity, deadlines, postponement, cancellation, and completion.
- Event sessions.
- Member registrations and authorized registration exceptions.

Invariants:
- Events are created within authorized scope.
- District events require district approval before publication.
- Only approved events are open for registration.
- Capacity and deadline rules are enforced.
- Significant changes and cancellation are authorized and audited.
- Events with registration or attendance are not physically deleted.
- Refunds are handled by Finance.

Local church event approval details and some exception rules require policy confirmation.

### 3.6 Attendance

Owns:
- Attendance records and statuses.
- Session attendance.
- Manual entry, QR check-in configuration, offline capture reconciliation.
- Attendance correction requests, approvals, and history.

Invariants:
- Attendance links a member to an event and, where relevant, a session.
- Duplicate valid attendance is prevented for the same member/event/session.
- Manual entry records the acting user and timestamp.
- Corrections preserve original values and require authorized approval.
- Attendance reports distinguish statuses.

### 3.7 Finance

Owns:
- District and church financial accounts.
- Currency and exchange rates.
- Budgets and allocations.
- Transaction requests, approvals, payment execution, postings, partial payments, reversals, reimbursements, and reconciliation.
- Financial evidence references and reports.

Invariants:
- Every account has one organizational owner and one currency.
- District and church account ownership remain separate.
- NGN is the Sango District default.
- Every transaction references its owning account.
- Submitter cannot approve their own transaction.
- Posted transactions are corrected by linked reversal.
- Duplicate posting and reversal are prevented.
- District reporting does not transfer church account ownership.

Approval thresholds, exact account hierarchy, and financial authority matrix require separate approval.

### 3.8 Credentials

Owns:
- Credential catalogue and versioned definitions.
- Issuer authority references and credential scope.
- Evidence references, verification, approval, issuance, renewal, expiry, revocation, correction, and reissue history.

Invariants:
- Credential requirements follow recognized governing authority.
- DYMS does not invent qualifications or expiry periods.
- Issuance requires authorized verification and designated issuer approval.
- Reissue for a lost/damaged certificate does not imply a new qualification.
- Credential history is retained.
- Public blockchain verification is deferred.

### 3.9 Notifications and External Integrations

Owns:
- Notification requests and templates.
- Recipient/channel preferences and consent.
- Delivery attempts and provider responses.
- Provider integration references and webhook processing.
- Retry, exhausted delivery, and integration failure records.

Invariants:
- Notification delivery is asynchronous where appropriate.
- Notification failure does not roll back an approved business action.
- Provider acceptance is distinct from delivery/read confirmation.
- Retries are controlled and idempotent.
- Webhooks are verified, replay-protected, validated, and audited.
- Payment confirmation requires verified provider evidence, not a browser redirect.
- Provider secrets are stored outside frontend code and ordinary business records.

### 3.10 Audit, Retention, and Governance

Owns:
- Append-only audit events.
- Audit access and export history.
- Retention schedule versions.
- Legal/investigation holds.
- Approved disposal and anonymization records.

Invariants:
- Audit events identify USER, SYSTEM, SERVICE, or ANONYMOUS actor type as applicable.
- Ordinary users and administrators cannot edit or delete audit history.
- Audit access is permissioned and scope-limited.
- Audit searches and exports are themselves audited.
- Secrets and authentication tokens are never logged.
- Retention periods require approved schedules.
- Unknown retention periods do not trigger automated permanent deletion.
- Append-only does not mean indefinite retention.

### 3.11 Reporting

Owns:
- Report definitions and read-optimized projections.
- Authorized report/export jobs and artifact references.

Invariants:
- Reports enforce the requesting actor's permissions and organizational scope.
- Reporting does not mutate authoritative business records.
- District consolidation does not transfer ownership of church records.
- Exports are audited and protected according to source-data sensitivity.

## 4. Shared platform capabilities

These capabilities support all modules but do not take ownership of their business records:

- Authentication and session management.
- Server-side authorization enforcement.
- Rate limiting and abuse protection.
- Idempotency and duplicate-operation protection.
- Audit event capture.
- Secure file/object storage.
- Background jobs and retry infrastructure.
- Observability, health checks, and correlation IDs.
- API validation, response envelopes, and OpenAPI contracts.

## 5. Cross-module interaction rules

1. A module requests another module's action through an explicit application contract.
2. The owning module validates its own business invariants and performs its state transition.
3. Authorization evaluates the actual actor, action, resource, and scope.
4. Critical state changes use transaction boundaries or equivalent consistency guarantees.
5. Long-running external operations use durable asynchronous processing, idempotency, and reconciliation.
6. Notification failure does not reverse the source business action.
7. Audit history is written through a controlled audit capability, not edited by business modules.
8. Reporting reads authorized outputs and is not an alternate write path.
9. Corrections preserve provenance and the original business fact.
10. No module infers authority from a category, department membership, job title, or account login alone.

## 6. Critical workflow ownership and consistency

| Workflow | Primary owner | Required consistency |
|---|---|---|
| Member account provisioning | Identity and Account | One-to-one account/member link |
| Category transition | Membership | Close old assignment and activate new assignment consistently |
| Church transfer | Organization | Close prior current assignment and open new assignment consistently |
| Appointment activation/termination | Leadership and Authorization | Appointment state and derived permission validity agree |
| Department membership approval | Organization | Membership status and approval history agree |
| Event registration | Events and Registration | Capacity and duplicate registration controls are atomic |
| Attendance recording | Attendance | Duplicate event/session attendance prevented |
| Financial posting/reversal | Finance | Ledger effect and transaction state remain consistent |
| Credential issuance/revocation | Credentials | Credential state and provenance remain consistent |
| Verified payment webhook | Finance, coordinated with Integrations | Provider event deduplicated before financial effect |
| Notification delivery | Notifications and Integrations | Retry does not create duplicate logical notification |

Exact database transaction and outbox patterns remain technical design decisions.

## 7. Candidate conceptual entity coverage

These are candidate concepts for the ERD, not approved physical table names:

- Identity: User, AccountCredential, Session, PasswordReset.
- Membership: Member, MemberCategoryDefinition, MemberCategoryAssignment, CategoryChangeRequest.
- Organization: District, Church, Department, MemberChurchAssignment, ChurchTransferRequest, DepartmentMembership, DepartmentMembershipRequest.
- Leadership/Authorization: Position, Appointment, AppointmentApproval, ActingAppointment, Role, Permission, RolePermission, ScopedRoleAssignment, ExplicitDeny, RoleConflictReview.
- Events: Event, EventSession, EventApproval, EventRegistration, RegistrationException, EventChange.
- Attendance: AttendanceRecord, AttendanceCorrectionRequest, AttendanceCorrectionApproval, CheckInToken.
- Finance: FinancialAccount, AccountAllocation, Currency, ExchangeRate, Budget, BudgetAllocation, FinancialTransaction, TransactionApproval, Payment, Posting, Reversal, Reimbursement.
- Credentials: CredentialDefinition, CredentialDefinitionVersion, CredentialEvidence, CredentialIssuance, CredentialRenewal, CredentialRevocation.
- Notifications/Integrations: Notification, NotificationRecipient, NotificationDelivery, NotificationTemplate, NotificationPreference, IntegrationProviderReference, WebhookEvent, IntegrationFailure.
- Audit/Governance: AuditEvent, AuditAccessEvent, RetentionSchedule, RetentionHold, DisposalRecord.
- Reporting: ReportDefinition, ReportJob, ExportArtifactReference.
- Shared platform: IdempotencyRecord, ExternalPaymentReconciliation.

Entity names, attributes, relationships, cardinalities, optionality, and physical representation remain subject to ERD analysis.

## 8. Open design and policy questions

1. Safe account registration and identity verification for younger members under the individual-login-only policy.
2. Official Adventurer, Pathfinder, and Senior Youth eligibility rules.
3. Full position catalogue and appointing authority per position.
4. Complete permission catalogue, resource mapping, and scope inheritance.
5. Exact assignment lifecycle for appointment-independent operational roles.
6. Department-specific eligibility and renewal policy.
7. Local church event approval and event fee/refund rules.
8. Financial account hierarchy, approval thresholds, and authorized officers.
9. Credential issuer catalogue and official credential requirements.
10. Approved retention durations and hold authority.
11. Named audit/security authorities and emergency access approvers.
12. Notification and payment providers and provider-specific guarantees.
13. DFR-006 status discrepancy between repository README and decision register.

## 9. ERD and implementation gate

Before final ERD approval, complete entity attributes and identifiers, cardinalities, optionality, temporal history, uniqueness, scope constraints, concurrency controls, and transaction boundaries. Trace each element to an approved requirement. Review authorization, finance separation of duties, audit, privacy, retention, and failure handling.

The project owner must explicitly approve the consolidated ERD. Until then, no Prisma domain models, migrations, physical database schema, or application code may be created.
