# Phase 1 Conceptual ERD

**Status:** Working conceptual model for project-owner review. Not approved for physical implementation.  
**Scope:** DYMS v1.0, Sango District.  
**Branch:** `phase-1/requirements-consolidation`

## 1. Purpose and implementation boundary

This document defines the proposed conceptual data model derived from the approved DFR-001–DFR-006 constraints, DDD-001–DDD-015 decisions, the Phase 1 requirements consolidation, testable requirements, and domain-boundary document.

This is a logical design aid. Entity names and attributes are conceptual candidates, not approved physical table names or a Prisma schema. No application code, Prisma models, migrations, or database schema are authorized by this document. The project owner must explicitly approve the consolidated ERD before implementation.

The product boundary is one district. A church is an organizational unit within the district. Conference-wide administration is out of scope for v1.0.

## 2. Modelling conventions

- **PK** means conceptual primary identifier. Prefer UUID identifiers in the eventual physical design, consistent with DFR-003.
- **FK** means a conceptual reference to another record. It does not prescribe a physical column.
- **1 : 0..*** means one parent may have zero or many children.
- **1 : 0..1** means one parent may have at most one related child.
- Effective-dated records preserve history. A current assignment is determined by its active status and effective interval, not by deleting old records.
- Every mutable business record should carry creation/update metadata as appropriate. Sensitive state changes also create immutable audit events.
- Money is decimal, never binary floating point. Account currency is fixed per account.
- All timestamps are stored in UTC; event-local timezone is separately retained.
- Organizational scope is explicit. A role or permission does not imply access outside its assigned scope.

## 3. Core identity, account, and member model

### 3.1 Candidate entities

**USER_ACCOUNT**
- PK: user_id
- Candidate attributes: login identifier(s), password hash, account status, email/phone verification state, created_at, updated_at, last_login_at
- Security details: password hash uses Argon2id; session and refresh credentials follow DFR-001/004.
- One account per member. No guardian-managed account, shared login, guardian delegation, or guardian-to-child relationship is part of the approved product model.

**MEMBER**
- PK: member_id
- FK: user_id (unique, required)
- Candidate attributes: member number, names, date of birth if collected, contact/profile fields, member status, created_at
- Personal data collection must be minimized and justified. Exact identity and child-safeguarding requirements remain subject to approved policy.

**MEMBER_CATEGORY**
- PK: category_id
- Candidate attributes: controlled code and display name
- Initial values: Adventurer, Pathfinder, Senior Youth.

**MEMBER_CATEGORY_ASSIGNMENT**
- PK: category_assignment_id
- FK: member_id, category_id, assigned_by_user_id
- Candidate attributes: effective_from, effective_to, status, reason, evidence reference, created_at
- Preserve all transitions. At most one active primary category per member.
- Master Guide is a credential, not a primary member category.

**MEMBER_PROFILE_CONTACT** (optional conceptual extension)
- PK: contact_id
- FK: member_id
- Candidate attributes: contact type, value, verification status, preferred flag, effective interval
- Include only if multiple contacts and contact history are required. Do not duplicate contact values across unrelated records.

### 3.2 Relationships

- USER_ACCOUNT 1 : 0..1 MEMBER at account creation; the approved operating rule requires every member to have exactly one individual account before member access is enabled. A user account may exist before a member profile is completed.
- MEMBER 1 : 0..* MEMBER_CATEGORY_ASSIGNMENT.
- MEMBER_CATEGORY 1 : 0..* MEMBER_CATEGORY_ASSIGNMENT.
- Each assignment has one assigning actor.
- Enforce one active primary category per member. Eligibility criteria and evidence requirements are policy gaps; do not encode age thresholds until approved.

## 4. Organization and church membership

### 4.1 Candidate entities

**DISTRICT**
- PK: district_id
- Candidate attributes: code, name, status, timezone
- v1.0 has the Sango District as the configured district boundary.

**CHURCH**
- PK: church_id
- FK: district_id
- Candidate attributes: code, name, location/contact fields, status
- A church belongs to one district in v1.0.

**CHURCH_MEMBERSHIP**
- PK: church_membership_id
- FK: member_id, church_id, initiated_by_user_id, accepted_by_user_id, approved_by_user_id
- Candidate attributes: status, requested_at, accepted_at, approved_at, effective_from, effective_to, cancellation/rejection reason
- Represents a member's relationship to a church over time.

**CHURCH_TRANSFER_REQUEST**
- PK: transfer_request_id
- FK: member_id, source_church_id, receiving_church_id, requested_by_user_id, reviewed_by_user_id
- Candidate attributes: status, requested_at, receiving_decision_at, district_decision_at, approved_effective_date, reason, decision_note
- A transfer request is workflow evidence; successful approval creates/closes the relevant CHURCH_MEMBERSHIP records atomically.

### 4.2 Relationships and invariants

- DISTRICT 1 : 1..* CHURCH.
- CHURCH 1 : 0..* CHURCH_MEMBERSHIP.
- MEMBER 1 : 0..* CHURCH_MEMBERSHIP.
- MEMBER 1 : 0..* CHURCH_TRANSFER_REQUEST.
- A member has at most one current primary church membership.
- Transfer initiation is by the member; receiving church acceptance is required; district approval is final; effective date is the approved date.
- On approval, close the former membership and open the receiving membership in one transaction. Concurrent transfers must not produce two current primary churches.
- Cancellation authority, rejection workflow details, duplicate pending request policy, and backdating rules remain open. Do not infer them from the conceptual structure.

## 5. Departments and departmental membership

### 5.1 Candidate entities

**DEPARTMENT**
- PK: department_id
- Candidate attributes: code, name, description, status
- Examples include Pathfinder, Adventurer, Master Guide, and Senior Youth departments/programmes as governed by district structure.

**DEPARTMENT_MEMBERSHIP**
- PK: department_membership_id
- FK: member_id, department_id, church_id (nullable where district-level), requested_by_user_id, approved_by_user_id, ended_by_user_id
- Candidate attributes: status, requested_at, approved_at, effective_from, effective_to, end_reason
- Supports multiple concurrent department memberships.

**DEPARTMENT_ELIGIBILITY_RULE**
- PK: eligibility_rule_id
- FK: department_id
- Candidate attributes: rule version, description, effective interval, source authority, evidence requirements, status
- Candidate placeholder only. The actual eligibility policy must come from an approved authority.

### 5.2 Relationships and invariants

- DEPARTMENT 1 : 0..* DEPARTMENT_MEMBERSHIP.
- MEMBER 1 : 0..* DEPARTMENT_MEMBERSHIP.
- CHURCH 1 : 0..* DEPARTMENT_MEMBERSHIP where membership is church-scoped.
- A member requests membership; designated coordinator approves.
- Multiple departments are allowed. Membership does not itself grant leadership authority.
- A department transfer ends the old membership and creates a new one, preserving both histories.
- Annual renewal, appeals, rejection details, and the effect of church transfer on department membership remain open.

## 6. Leadership appointments and authorization

### 6.1 Candidate entities

**POSITION**
- PK: position_id
- Candidate attributes: code, title, department_id (optional), description, status
- Defines a recognized office, not a person holding it.

**APPOINTMENT**
- PK: appointment_id
- FK: position_id, appointee_member_id, appointing_authority_user_id, approved_by_user_id, organizational scope reference
- Candidate attributes: scope_type, scope_id, term_start, term_end, effective_from, effective_to, status, appointment_reason, termination_reason, approved_at
- Every appointment is a distinct historical record. Renewal is a new appointment/term with fresh approval.

**ROLE**
- PK: role_id
- Candidate attributes: code, name, description, status
- Represents a permission bundle or platform role, distinct from a position title.

**PERMISSION**
- PK: permission_id
- Candidate attributes: code, resource/action definition, description, status.

**ROLE_PERMISSION**
- PK: role_permission_id
- FK: role_id, permission_id
- Candidate attributes: effect (allow/deny only if explicitly designed for the role model), effective interval
- Role grants must be constrained by explicit permission catalogue and scope.

**USER_ROLE_ASSIGNMENT**
- PK: user_role_assignment_id
- FK: user_id, role_id, granted_by_user_id
- Candidate attributes: scope_type, scope_id, effective_from, effective_to, status, reason
- Separates account authorization from member category and department membership.

**APPOINTMENT_ROLE_LINK**
- PK: appointment_role_link_id
- FK: appointment_id, role_id
- Maps an approved appointment to its appointment-derived role(s). An expired/revoked appointment cannot grant active permissions.

**ACCESS_DENY**
- PK: access_deny_id
- FK: target_user_id, permission_id, issuer_user_id, reviewer_user_id (optional)
- Candidate attributes: resource scope type/id, reason, effective_from, expires_at, status, review_due_at, revoked_at, revocation_reason
- Explicit deny overrides applicable grants only within its named permission and resource scope. It does not spread to unrelated scopes. Ambiguous scope fails closed.

**ROLE_CONFLICT_RULE**
- PK: role_conflict_rule_id
- FK: role_a_id, role_b_id
- Candidate attributes: outcome (allowed, review_required, prohibited), scope, rule version, effective interval, rationale.

**ROLE_CONFLICT_REVIEW**
- PK: role_conflict_review_id
- FK: user_id, role_conflict_rule_id, reviewer_user_id
- Candidate attributes: decision, reason, reviewed_at, effective interval, status.

### 6.2 Relationships and invariants

- POSITION 1 : 0..* APPOINTMENT.
- MEMBER 1 : 0..* APPOINTMENT.
- ROLE 1 : 0..* ROLE_PERMISSION; PERMISSION 1 : 0..* ROLE_PERMISSION.
- USER_ACCOUNT 1 : 0..* USER_ROLE_ASSIGNMENT; ROLE 1 : 0..* USER_ROLE_ASSIGNMENT.
- APPOINTMENT 1 : 0..* APPOINTMENT_ROLE_LINK; ROLE 1 : 0..* APPOINTMENT_ROLE_LINK.
- USER_ACCOUNT 1 : 0..* ACCESS_DENY; PERMISSION 1 : 0..* ACCESS_DENY.
- ROLE_CONFLICT_RULE 1 : 0..* ROLE_CONFLICT_REVIEW.
- Role grants are independently evaluated within explicit scope. Deny-by-default. Explicit deny wins over applicable allow. Multiple roles do not bypass scope restrictions.
- Users cannot grant themselves privileges. Affected actors cannot create, approve, modify, or remove their own deny.
- Role combinations marked review-required require independent approval before becoming effective. Prohibited combinations cannot become active.
- No two people may simultaneously hold the same active position in the same scope, except a future formally approved exception.
- Appointment renewal needs fresh approval. Mid-year replacement runs to 31 December unless a different term is formally authorized.
- Acting appointments, exceptional overlaps, detailed termination authority, precedence, and backdating remain unresolved.
- The final ERD must represent organizational scope explicitly. A generic untyped scope reference is conceptually convenient but may be unsafe physically; the final physical design must enforce valid scope targets and foreign-key integrity.

## 7. Events, registration, sessions, and attendance

### 7.1 Candidate entities

**EVENT**
- PK: event_id
- FK: owning district/church/department references; created_by_user_id; approved_by_user_id
- Candidate attributes: title, description, event_type, status, venue, starts_at_utc, ends_at_utc, timezone, registration_open_at, registration_close_at, capacity, approval metadata, cancellation reason
- Keep event timezone separate from UTC timestamps.

**EVENT_APPROVAL**
- PK: event_approval_id
- FK: event_id, reviewer_user_id
- Candidate attributes: decision, reason, decided_at, approval stage
- District events require district approval before publication. The exact local church event approval policy remains open.

**EVENT_REGISTRATION**
- PK: event_registration_id
- FK: event_id, member_id
- Candidate attributes: status, registered_at, registration_channel, cancellation metadata
- Enforce one valid registration per member/event unless a formally approved business rule requires otherwise.

**EVENT_SESSION**
- PK: event_session_id
- FK: event_id
- Candidate attributes: name, starts_at_utc, ends_at_utc, timezone, venue, status
- Sessions support attendance uniqueness by member/event/session.

**ATTENDANCE_RECORD**
- PK: attendance_record_id
- FK: event_id, event_session_id (optional only where event-level attendance is allowed), member_id, registration_id (nullable pending registration policy), recorded_by_user_id
- Candidate attributes: attendance_status, recorded_at, method (QR/manual), source reference, note
- Prevent duplicate valid attendance for the same member and event/session.
- Preserve original record and corrections.

**ATTENDANCE_CORRECTION**
- PK: attendance_correction_id
- FK: attendance_record_id, requested_by_user_id, approved_by_user_id
- Candidate attributes: old value snapshot/reference, proposed value, reason, status, requested_at, approved_at
- Correction is a separate record, never silent overwrite.

### 7.2 Relationships and invariants

- EVENT 1 : 0..* EVENT_APPROVAL.
- EVENT 1 : 0..* EVENT_REGISTRATION.
- MEMBER 1 : 0..* EVENT_REGISTRATION.
- EVENT 1 : 0..* EVENT_SESSION.
- EVENT_SESSION 1 : 0..* ATTENDANCE_RECORD.
- MEMBER 1 : 0..* ATTENDANCE_RECORD.
- ATTENDANCE_RECORD 1 : 0..* ATTENDANCE_CORRECTION.
- Only approved events are published for registration. Coordinators set registration deadline and capacity.
- Significant changes require approval and audit. Cancellation requires reason. Completed events are closed and retained.
- Events with registrations or attendance are not physically deleted.
- Attendance is recorded by authorized event personnel and linked to a DYMS member. QR and manual entry are supported. Corrections require designated approval and audit.
- Self-check-in, QR expiry/security, registration prerequisite, offline synchronization, late arrival/early departure, and post-completion correction policy remain open.

## 8. Finance

### 8.1 Candidate entities

**FINANCIAL_ACCOUNT**
- PK: financial_account_id
- Candidate attributes: owner_scope_type, owner_scope_id, account_name, account_code, currency_code, status, opened_at, closed_at
- Each account has one owning organizational scope and one currency. NGN is the district default.
- Account ownership is distinct from who is permitted to view or transact.

**FINANCIAL_TRANSACTION**
- PK: financial_transaction_id
- FK: financial_account_id, submitted_by_user_id, approved_by_user_id (optional), executed_by_user_id (optional), posted_by_user_id (optional)
- Candidate attributes: transaction_type, reference, description, amount, currency_code, status, transaction_date, submitted_at, approved_at, executed_at, posted_at, rejection_reason
- Amounts use decimal precision. Transaction currency must match account currency.

**TRANSACTION_LINE** (candidate, pending accounting policy)
- PK: transaction_line_id
- FK: financial_transaction_id
- Candidate attributes: line description, amount, account/category code, optional budget reference
- Include if multi-line transactions or fund allocation are required. Accounting treatment needs review.

**TRANSACTION_APPROVAL**
- PK: transaction_approval_id
- FK: financial_transaction_id, approver_user_id
- Candidate attributes: decision, reason, approved_at, approval level
- Supports multiple approvals if thresholds are later defined.

**PAYMENT**
- PK: payment_id
- FK: financial_transaction_id, payment_provider_id (optional)
- Candidate attributes: payment_reference, amount, currency_code, status, initiated_at, confirmed_at, provider_reference, failure_reason
- A transaction may have zero or more payment attempts. Partial payments and allocation rules remain open.

**TRANSACTION_REVERSAL**
- PK: transaction_reversal_id
- FK: original_transaction_id, reversal_transaction_id, initiated_by_user_id, approved_by_user_id
- Candidate attributes: reason, status, created_at, posted_at
- Reversal is linked to original; prevent duplicate full reversals and enforce amount constraints. Partial reversal rules require policy.

**BUDGET**
- PK: budget_id
- Candidate attributes: owner_scope_type, owner_scope_id, period_start, period_end, currency_code, status, approved_by_user_id
- Candidate for later approved budget controls. Budget enforcement is not yet defined.

**BUDGET_LINE**
- PK: budget_line_id
- FK: budget_id
- Candidate attributes: category, description, allocated_amount, revised_amount
- Candidate pending budget policy.

### 8.2 Relationships and invariants

- FINANCIAL_ACCOUNT 1 : 0..* FINANCIAL_TRANSACTION.
- FINANCIAL_TRANSACTION 1 : 0..* TRANSACTION_APPROVAL.
- FINANCIAL_TRANSACTION 1 : 0..* PAYMENT.
- FINANCIAL_TRANSACTION 1 : 0..* TRANSACTION_LINE.
- Original FINANCIAL_TRANSACTION 1 : 0..* TRANSACTION_REVERSAL; each reversal points to one original and one reversal transaction.
- BUDGET 1 : 0..* BUDGET_LINE.
- Account belongs to one defined scope; district and church account ownership are separate. Reports may consolidate authorized information without transferring ownership.
- Submitter cannot approve own transaction. Rejections require reason. Submitted transactions cannot silently change; revisions require controlled resubmission. Posted transaction corrections use linked reversal records.
- Approved and completed transactions are posted under authorized workflow. Payment execution and accounting posting remain distinct concepts.
- A browser redirect is not payment proof. Verify provider reference, amount, currency and status using authenticated callback/API; prevent duplicate posting and reconcile uncertain outcomes.
- Approval thresholds, approver matrix, multiple accounts per church, subaccounts, account freeze/close authority, payment-vs-posting separation, partial/failed/returned payments, reimbursements, budget enforcement, and FX reporting remain open.
- District reporting must respect account ownership and authorization scope.

## 9. Credentials and evidence

### 9.1 Candidate entities

**CREDENTIAL_DEFINITION**
- PK: credential_definition_id
- Candidate attributes: code, title, issuing_authority, issuer_scope, requirements_reference, rule_version, validity_policy, status, effective interval
- Definitions are controlled and versioned. Requirements must come from recognized governing authority; no invented age, training, or examination requirements.

**CREDENTIAL_ISSUANCE**
- PK: credential_issuance_id
- FK: member_id, credential_definition_id, issuer_user_id, approved_by_user_id, prior_issuance_id (optional)
- Candidate attributes: issue_date, valid_from, valid_until, status, revocation_reason, evidence reference, certificate reference
- A new record is created for renewal/reissue. Reissue for lost/damaged certificate does not imply a new qualification.
 
**CREDENTIAL_EVIDENCE**
- PK: credential_evidence_id
- FK: credential_issuance_id, submitted_by_user_id, verified_by_user_id
- Candidate attributes: evidence_type, secure object reference, submitted_at, verified_at, verification status, notes
- Sensitive evidence access is restricted and minimized.

### 9.2 Relationships and invariants

- MEMBER 1 : 0..* CREDENTIAL_ISSUANCE.
- CREDENTIAL_DEFINITION 1 : 0..* CREDENTIAL_ISSUANCE.
- CREDENTIAL_ISSUANCE 1 : 0..* CREDENTIAL_EVIDENCE.
- CREDENTIAL_ISSUANCE may link to one prior issuance for renewal/reissue chain.
- Authorized department personnel verify evidence; designated issuer approves. Preserve the rule version applied.
- Expiry exists only where the governing credential definition requires it. Revocation requires authorized actor and reason. Corrections preserve history.
- Public verification disclosure, retention, issuer authority and detailed revocation grounds require approved policy. Blockchain verification is deferred; no sensitive personal data is placed on-chain.

## 10. Notifications, integrations, payments, and webhooks

### 10.1 Candidate entities

**NOTIFICATION**
- PK: notification_id
- Candidate attributes: logical event key, template_id, channel, category, payload reference, status, created_at, scheduled_at
- Represents one logical notification request.

**NOTIFICATION_RECIPIENT**
- PK: notification_recipient_id
- FK: notification_id, user_id
- Candidate attributes: destination snapshot/reference, preference decision, status.

**NOTIFICATION_DELIVERY**
- PK: notification_delivery_id
- FK: notification_recipient_id, integration_provider_id
- Candidate attributes: provider message ID, attempt number, accepted_at, delivered_at, failed_at, status, failure code.

**NOTIFICATION_TEMPLATE**
- PK: notification_template_id
- Candidate attributes: code, version, channel, content, locale, status.

**NOTIFICATION_PREFERENCE**
- PK: notification_preference_id
- FK: user_id
- Candidate attributes: channel, category, consent state, effective interval, source, updated_at.

**INTEGRATION_PROVIDER**
- PK: integration_provider_id
- Candidate attributes: provider code, service type, status, configuration reference
- Secrets remain in a secrets manager, not ordinary database fields.

**WEBHOOK_EVENT**
- PK: webhook_event_id
- FK: integration_provider_id
- Candidate attributes: provider event ID, event type, received_at, signature validation result, processing status, payload reference, deduplication key.

**INTEGRATION_FAILURE**
- PK: integration_failure_id
- FK: integration_provider_id, webhook_event_id (optional)
- Candidate attributes: failure type, reason, first_seen_at, last_attempt_at, retry_count, status, resolution metadata.

### 10.2 Relationships and invariants

- NOTIFICATION 1 : 1..* NOTIFICATION_RECIPIENT.
- NOTIFICATION_RECIPIENT 1 : 0..* NOTIFICATION_DELIVERY.
- NOTIFICATION_TEMPLATE 1 : 0..* NOTIFICATION.
- INTEGRATION_PROVIDER 1 : 0..* NOTIFICATION_DELIVERY.
- INTEGRATION_PROVIDER 1 : 0..* WEBHOOK_EVENT.
- INTEGRATION_PROVIDER 1 : 0..* INTEGRATION_FAILURE.
- User preference and consent are evaluated before optional-channel delivery. Essential security/account notices are distinguished from optional communications.
- Provider acceptance is not equivalent to delivery or read. Only reliable provider confirmation supports those states.
- Notification failure does not roll back the business action. Retries must not create duplicate logical messages. Duplicate webhook callbacks are safely deduplicated.
- Webhooks require signature/replay protection, validation, rate limiting and audit.
- Payment provider events are not trusted until reference, amount, currency and state are verified. Uncertain payments enter reconciliation.
- Provider selection, retry ceilings, backoff, monitoring targets and message retention require later operational decisions.

## 11. Audit, security sessions, idempotency, and retention

### 11.1 Candidate entities

**AUTH_SESSION**
- PK: auth_session_id
- FK: user_id
- Candidate attributes: created_at, last_activity_at, inactivity_expires_at, absolute_expires_at, revoked_at, revocation_reason, device metadata
- Enforce DFR-004: 15-minute access credential, 7-day inactivity timeout, 30-day absolute session lifetime. Refresh rotation and reuse detection are atomic.
- Store only appropriately protected credential/session material. Never log tokens or secrets.

**AUDIT_EVENT**
- PK: audit_event_id
- Candidate attributes: actor_type (USER, SYSTEM, SERVICE, ANONYMOUS), actor_user_id (nullable), initiating_user_id (nullable), represented_party_reference (nullable), action, target_type, target_id, scope_type, scope_id, occurred_at, reason, correlation_id, safe change summary
- Append-only. Corrections add events; ordinary users cannot modify/delete audit events.
- Never record passwords, tokens, session secrets, or unnecessary sensitive payloads.

**AUDIT_ACCESS_EVENT**
- PK: audit_access_event_id
- FK: audit_event_id (optional), accessing_user_id
- Candidate attributes: access purpose, query/export action, scope, occurred_at, exceptional_access flag
- Audit searches and exports are themselves auditable.

**IDEMPOTENCY_RECORD**
- PK: idempotency_record_id
- Candidate attributes: key digest, actor reference, operation, resource scope, request fingerprint, status, created_at, completed_at, expiry_at, safe result reference
- Bound to actor, operation and scope. Same key/different normalized payload returns conflict. Same key/same payload returns original safe outcome or in-progress status.
- Detailed key format, lease, retention and concurrency implementation are deferred to implementation design.

**RETENTION_POLICY**
- PK: retention_policy_id
- Candidate attributes: record category, duration, trigger event, required action, legal/policy basis, approving authority, version, effective interval, status.

**RETENTION_HOLD**
- PK: retention_hold_id
- Candidate attributes: target category/reference, reason, issued_by_user_id, approved_by_user_id, created_at, released_at, release_reason, status.

**RETENTION_ACTION**
- PK: retention_action_id
- FK: retention_policy_id, initiated_by_user_id, approved_by_user_id
- Candidate attributes: target reference, action (delete/anonymize/archive), reason, executed_at, outcome, verification reference.

### 11.2 Relationships and invariants

- USER_ACCOUNT 1 : 0..* AUTH_SESSION.
- AUDIT_EVENT 1 : 0..* AUDIT_ACCESS_EVENT where an access event concerns a specific event; searches/exports may be represented without a single event target.
- RETENTION_POLICY 1 : 0..* RETENTION_ACTION.
- RETENTION_HOLD suspends an otherwise scheduled destructive action for its covered records.
- Audit actor types include user, system, service and anonymous. Delegated actions distinguish initiator from represented party.
- Audit access is denied by default and separately permissioned by scope. Security events are restricted. Emergency access requires reason, time limit, independent approval and audit; detailed authorities remain open.
- Retention schedules must have approved basis, duration, trigger, action and authority. Unknown official retention periods are not invented; automated permanent deletion remains disabled for affected categories.
- Legal/investigation holds suspend deletion. Financial posted records are corrected through reversals, not deletion. Append-only audit does not mean indefinite retention.
- Attachments normally follow their parent record schedule unless a separate requirement applies.
- Retention periods and authorities for membership, finance, attendance/events, appointments/credentials, and security logs remain unresolved.

## 12. Reporting and read models

Reporting is a consumer of authoritative domain records, not an alternate owner of member, finance, attendance, or appointment data.

Candidate concepts:
- REPORT_DEFINITION: report code, version, scope, access classification.
- REPORT_RUN: requester, scope, parameters reference, generated_at, status, output reference, expiry.
- REPORT_EXPORT_AUDIT: report run, actor, export format, destination classification, timestamp.

Reports must re-evaluate authorization at request time, aggregate only permitted scopes, minimize personal data, and audit sensitive exports. District consolidation does not change church account ownership. Materialized views or CQRS read models are implementation choices deferred until after ERD approval.

## 13. Cross-domain relationship overview

- USER_ACCOUNT 1 : 0..1 MEMBER.
- MEMBER 1 : 0..* church memberships, category assignments, department memberships, event registrations, attendance records, appointments, and credential issuances.
- DISTRICT 1 : 1..* CHURCH.
- CHURCH 1 : 0..* church memberships and church-scoped department memberships.
- EVENT 1 : 0..* registrations, sessions, approvals, and attendance records.
- FINANCIAL_ACCOUNT 1 : 0..* financial transactions.
- APPOINTMENT and USER_ROLE_ASSIGNMENT may grant scoped roles; neither member category nor department membership grants leadership authority.
- Domain changes produce AUDIT_EVENT records. Sensitive mutations use IDEMPOTENCY_RECORD.
- Notification and integration records reference business events but do not own the underlying business state.

## 14. Transaction boundaries and concurrency controls

The eventual implementation must preserve these atomic business operations:

1. **Church transfer approval:** approve transfer, close prior active church membership, create new membership, record audit event, and commit together.
2. **Appointment approval/replacement:** prevent overlapping active holder for the same position/scope; record approval and audit atomically.
3. **Attendance capture:** validate event/session/member and uniqueness, create attendance and audit atomically.
4. **Attendance correction:** approve correction, preserve old value/history, apply corrected effective state, and audit atomically.
5. **Finance approval/posting/reversal:** enforce separation of duties, account currency, valid state transition, no duplicate reversal, and audit in a transaction.
6. **Payment confirmation:** verify provider evidence and idempotently transition payment/transaction state; uncertain external outcomes require reconciliation.
7. **Credential issuance/revocation:** validate issuer authority and evidence, preserve prior issuance chain, and audit atomically.
8. **Role and deny changes:** enforce scope, self-approval restrictions and conflict matrix; record audit with the change.
9. **Idempotent sensitive mutation:** bind request identity and fingerprint to the logical operation; prevent duplicate side effects under retries/concurrency.

Use database uniqueness, foreign keys, check constraints and transaction isolation in the physical design to enforce invariants. Application-only validation is insufficient for critical uniqueness and ownership rules.

## 15. Candidate uniqueness and integrity constraints

These are conceptual constraints to validate during physical design:

- One MEMBER per USER_ACCOUNT; one USER_ACCOUNT per MEMBER.
- One active primary MEMBER_CATEGORY_ASSIGNMENT per member.
- At most one current primary CHURCH_MEMBERSHIP per member.
- No duplicate active department membership for the same member, department and scope.
- No overlapping active APPOINTMENT for the same position and scope, unless an approved exception model exists.
- No duplicate ROLE_PERMISSION mapping for a role/permission/version.
- No self-grant or self-approval where prohibited by DDD-005 and DDD-010.
- ACCESS_DENY scope must be explicit and valid; deny target and issuer cannot violate separation rules.
- One active/valid EVENT_REGISTRATION per member/event.
- One valid ATTENDANCE_RECORD per member/event/session.
- EVENT_SESSION must belong to the referenced EVENT.
- FINANCIAL_TRANSACTION currency equals FINANCIAL_ACCOUNT currency.
- Transaction amount is positive or negative only according to an explicitly defined transaction type; do not infer sign conventions before accounting policy is approved.
- A posted transaction cannot be edited or deleted; reversal references a valid posted original and cannot be duplicated beyond permitted reversal amount.
- Provider event IDs are unique within provider; notification logical keys are deduplicated.
- IDEMPOTENCY_RECORD key is unique within its actor/operation/scope contract.
- Credential issuance definition/version and issuer authority are traceable.
- Retention action cannot execute while a valid hold applies.
- Historical records are retained according to approved schedules; no unapproved automated deletion.

## 16. Open policy and evidence register

The following issues do not block a conceptual draft, but they do block final policy sign-off or specific physical constraints.

| ID | Area | Outstanding decision/evidence |
|---|---|---|
| ERD-OPEN-01 | Member category | Official eligibility criteria, age/class requirements, evidence, verifier, exception and correction authority. |
| ERD-OPEN-02 | Younger members | Approved safe onboarding, identity verification and access process for members who need individual accounts. No guardian account delegation is allowed. |
| ERD-OPEN-03 | Church transfer | Pending cancellation authority/reason, rejection/appeal, duplicate pending request, effective-date/backdating rules. |
| ERD-OPEN-04 | Appointments | Acting appointments, overlap exceptions, exact termination authority, precedence and backdating. |
| ERD-OPEN-05 | Authorization | Complete permission catalogue, exact scope map, appointment-independent roles, full role conflict matrix and governance authority. |
| ERD-OPEN-06 | Department membership | Eligibility by department, rejection/appeal, renewal, and effect of church transfer. |
| ERD-OPEN-07 | Events | Local church approval, mandatory registration, late registration, capacity exception, refund, postponement and post-completion correction. |
| ERD-OPEN-08 | Attendance | Self-check-in, QR validity/security, registration prerequisite, correction authority, offline sync, late/early statuses. |
| ERD-OPEN-09 | Finance accounts | Multiple accounts, subaccounts, district visibility, open/close/freeze authority and FX reporting. |
| ERD-OPEN-10 | Finance workflow | Approval thresholds/matrix, payment/posting separation, partial/failed/returned payments, reimbursements, budget checks and accounting policy. |
| ERD-OPEN-11 | Credentials | Official requirements, issuer authority, validity/expiry, revocation grounds, public verification disclosure and retention. |
| ERD-OPEN-12 | Audit | Audit access authority, security investigation roles, emergency access authority and privacy/disclosure rules. |
| ERD-OPEN-13 | Idempotency | Key format, retention, lease, in-progress response and provider reconciliation technical rules. |
| ERD-OPEN-14 | Retention | Official periods, trigger events, approving authorities and disposal method for each record class. |
| ERD-OPEN-15 | Integrations | Provider selection, retry ceilings/backoff, monitoring targets and provider-specific delivery evidence. |
| ERD-OPEN-16 | Freeze governance | README says DFR-006 was lifted on 2026-10-29, while the decision register records the freeze and the user's current instruction requires DFR-001–DFR-006 to remain frozen and prohibits implementation before final ERD approval. Owner direction controls this work. Reconcile repository governance records explicitly before implementation. |

## 17. Source traceability

| Model area | Governing source |
|---|---|
| Identity, member, category | DFR-001, DFR-003, DDD-001, DDD-002, approved individual-account correction |
| Church and department membership | DDD-003, DDD-006 |
| Appointment, roles, scope and deny | DDD-004, DDD-005 |
| Event and registration | DDD-007 |
| Attendance | DDD-008 |
| Financial account and transaction | DDD-009, DDD-010 |
| Credential definition and issuance | DDD-011 |
| Audit actor/access | DDD-012 |
| Idempotency | DDD-013 |
| Retention and holds | DDD-014 |
| Notification and integrations | DDD-015 |
| Sessions, API, security and data integrity | DFR-001–DFR-005 |
| Governance and implementation gate | DFR-006 and explicit current project-owner instruction |

## 18. Review checklist before final ERD approval

- [ ] Confirm the conceptual entity catalogue covers all approved requirements.
- [ ] Confirm every relationship has a clear owner, cardinality and optionality.
- [ ] Confirm all historical/effective-dated records preserve prior states.
- [ ] Confirm account/member one-to-one individual login rule and no guardian delegation.
- [ ] Confirm organizational scope is explicit and cannot be bypassed by role accumulation.
- [ ] Confirm finance separation of duties, account ownership, currency and reversal rules.
- [ ] Confirm event/session attendance uniqueness and correction history.
- [ ] Confirm credential issuer/version/evidence traceability.
- [ ] Confirm notification/payment webhook deduplication and idempotent workflows.
- [ ] Confirm audit access and retention controls.
- [ ] Resolve any owner-policy blockers that materially change entities, relationships or constraints.
- [ ] Reconcile DFR-006 repository documentation conflict.
- [ ] Obtain explicit project-owner approval of the final ERD.
- [ ] Only after approval, prepare physical schema design and implementation plan under the approved change-control process.

## 19. Approval status

**Not approved for implementation.** This document is a working conceptual ERD. The next Phase 1 activity is a consistency review against the requirements and domain-boundary documents, followed by a final ERD approval package. No Prisma schema, migration, physical database schema, or application code has been created or changed as part of this work.


## 20. Integrity review refinements (supersedes ambiguous wording above)

This section records the refinements required by the Phase 1 integrity review. Where an earlier section is less precise, this section controls the conceptual interpretation.

### 20.1 Exact account/member cardinality

- Every MEMBER references exactly one USER_ACCOUNT.
- A USER_ACCOUNT references zero or one MEMBER.
- The USER_ACCOUNT-to-MEMBER link is unique in both directions.
- A user account may exist before a member profile is created or completed.
- A MEMBER record cannot be activated for DYMS member use until its individual USER_ACCOUNT exists and is linked.
- No guardian account, shared account, login delegation, or guardian-child relationship is modelled.

### 20.2 Supported organizational scope targets

The conceptual scope targets for v1.0 are:
- DISTRICT: district-wide authority and district-owned records.
- CHURCH: records owned or administered within one church.
- DEPARTMENT: a department/programme scope, optionally bounded by its owning district or church as defined by the relevant business rule.

Not every entity supports every target. Each scoped entity must declare its permitted target types. For example, a church-owned financial account must reference a CHURCH, while a district account must reference a DISTRICT. A role assignment must reference only a scope type permitted for that role.

The eventual physical design must enforce valid scope targets and referential integrity. A free-form `scope_type + scope_id` pair without target validation is not sufficient. The physical design may use separate nullable foreign keys with a controlled exactly-one rule, or another integrity-preserving structure approved during physical design.

### 20.3 Appointment and authorization separation

- POSITION is the definition of an office.
- APPOINTMENT is the approved time-bounded assignment of a member to that office and scope.
- ROLE is an application authorization bundle.
- PERMISSION is an individual action/resource capability.
- USER_ROLE_ASSIGNMENT represents a role granted independently of an appointment.
- APPOINTMENT_ROLE_LINK explicitly maps an appointment to zero or more roles under a versioned mapping.
- Appointment approval does not grant an implicit unrestricted role. Authorization is computed from active, approved appointment-derived and independently granted roles, explicit scope, permission rules, conflict decisions, and active denies.
- The appointing authority and approving actor are separately recorded where they are different people. Self-approval restrictions apply wherever required by the approved governance rules.

### 20.4 Decision and approval history

For any workflow that permits multiple reviewers, approval stages, rejection, resubmission, or a later decision, preserve a decision history record with at least:
- target workflow record;
- decision-maker account;
- decision value;
- reason or decision note where required;
- decision timestamp;
- stage or decision sequence where multiple stages are formally defined.

This is a conceptual pattern, not a mandate to add identical generic approval tables to every bounded context. Prefer domain-specific decision records where they make ownership and constraints clearer. Do not invent approval stages for policies that have not defined them.

### 20.5 Attendance uniqueness with optional sessions

Attendance must support one of two mutually exclusive modes for a given event:
- Event-level attendance: one valid attendance record per member/event, with no session reference.
- Session-level attendance: one valid attendance record per member/event session, where the session belongs to that event.

A member/event must not be double-counted by mixing an event-level record and session-level records for the same attendance purpose. The final physical design must enforce this with suitable conditional uniqueness and validation. The business decision on whether registration is mandatory before attendance remains open.

### 20.6 Financial amount and reversal semantics

- The amount representation and debit/credit sign convention require an approved accounting policy before physical schema approval.
- PAYMENT may represent one or more payment attempts, but this does not approve partial settlement.
- Partial payments, allocation, refunds, failed/returned payments and partial reversals remain policy gaps.
- A full reversal must not exceed the amount of its original posted transaction. If partial reversals are later approved, cumulative successful reversals must not exceed the original reversible amount.
- A transaction's account currency and transaction currency must match. Foreign-exchange reporting is a separate approved capability, not an implicit conversion.

### 20.7 Idempotency and webhook identity

- An idempotency operation is scoped by actor identity, operation identity, resource/organizational scope, and normalized request fingerprint.
- Reuse of the same key with a different fingerprint is a conflict. Reuse with the same fingerprint returns the original safe result or an in-progress outcome without repeating the business effect.
- Provider webhook identity is separately unique within a provider. A provider event ID is not a substitute for the application's idempotency key.
- Repeated or out-of-order provider events must not duplicate or regress a business state. Store processing outcome and correlation to the affected business record.
- Exact key format, storage lease, expiry and retry values remain technical implementation decisions.

### 20.8 Audit actor and payload minimization

AUDIT_EVENT preserves actor type and, where applicable, the stable account identity. For delegated activity, preserve both the initiating actor and the represented subject. Audit data stores a safe change summary and references, not credentials, tokens, secrets, or unnecessary copies of sensitive personal or financial payloads. Access to audit records, searches and exports is itself auditable.

### 20.9 Retention target and hold integrity

Retention policies and holds must identify a supported record category and a valid target/scope. A hold must resolve to the exact records covered and block destructive actions until released by an authorized actor. Generic target references require enforceable target validation in physical design. Evidence files use secure object references and must follow their parent record's approved access and retention rules unless a separate approved schedule applies.

### 20.10 Provider event processing

Webhook event identifiers are unique within the provider that issued them. Signature verification, replay detection, payload validation, deduplication, and state-transition validation occur before the event triggers a business mutation. Provider callbacks are evidence of an external event, not authorization grants. Processing result, failure/retry state, and business correlation are retained for reconciliation.

