# DYMS Phase 1 — Testable Requirements and Acceptance Criteria

- Product: District Youth Management System (DYMS)
- Scope: v1.0, Sango District
- Status: Working requirements specification for review
- Parent document: `docs/product/PHASE-1-REQUIREMENTS-CONSOLIDATION.md`
- Approval boundary: This document does not approve an ERD, physical schema, Prisma models, migrations, or application implementation.

## 1. Status labels

- **Approved rule:** Directly supported by an explicit project-owner approval or frozen decision.
- **Derived requirement:** Necessary to implement an approved rule safely, but the detailed wording still requires design review.
- **Policy gap:** Depends on an official church policy, named authority, or project-owner decision not yet evidenced.
- **Proposed control:** A conservative control proposed for the design. Do not represent it as an independently approved church policy.

Acceptance criteria below define observable outcomes for future tests. They do not imply implementation exists.

## 2. Identity and membership

| ID | Requirement | Source/status | Acceptance criteria |
|---|---|---|---|
| ID-001 | Each member has an individual DYMS account and login. | Project-owner approval; approved rule | Given a member record is activated, when account provisioning is completed, then exactly one individual account is linked to that member. |
| ID-002 | Shared and guardian-operated accounts are not supported. | Project-owner approval; approved rule | Given an account is authenticated, when a member performs an action, then the actor is the account's own linked member. The system provides no guardian-to-child login delegation. |
| ID-003 | Account identity and ministry membership remain distinct concepts. | DFR-002/DDD-001; derived requirement | Given an authenticated account, when membership status changes, then the account identity is not silently deleted or reassigned to another member. |
| ID-004 | Account status is checked during protected requests. | DFR-001/004; approved rule | Given an account is suspended or disabled, when it attempts a protected operation, then the request is rejected according to the approved account-status policy. |
| MEM-001 | A member has one active primary category. | DDD-002; approved rule | Given a member has an active category, when another category is approved, then the previous active assignment is closed as part of the same controlled transition. |
| MEM-002 | Supported primary categories are Adventurer, Pathfinder, and Senior Youth. | DDD-002; approved rule | Given a category is assigned, when its definition is validated, then it belongs to the approved category catalogue. |
| MEM-003 | Master Guide is a credential, not a primary category. | DDD-002; approved rule | Given a Master Guide qualification is recorded, then it is stored as a credential and does not replace the member's primary category. |
| MEM-004 | Category changes preserve history. | DDD-002; approved rule | Given a category assignment is ended, when a new category becomes active, then the previous assignment remains retrievable with its effective period and decision provenance. |
| MEM-005 | Category assignment requires eligibility verification and authorized approval. | DDD-002; policy details open | Given evidence is submitted, when an authorized reviewer evaluates it, then the category transition is not activated until the applicable approved eligibility rule is satisfied. Exact age/class criteria remain an evidence gap. |
| MEM-006 | Department participation is independent of primary category. | DDD-002/006; approved rule | Given a member joins or leaves a department, then the member's primary category remains unchanged unless a separate category workflow is approved. |

## 3. Church and department membership

| ID | Requirement | Source/status | Acceptance criteria |
|---|---|---|---|
| ORG-001 | A member has one current primary church. | DDD-003; approved rule | Given a member's current church assignment, when a transfer completes, then only the receiving church is current and the prior assignment is historical. |
| ORG-002 | A member initiates a church transfer. | DDD-003; approved rule | Given a member is eligible to request a transfer, when they submit it, then the request is linked to that member and the proposed receiving church. |
| ORG-003 | Receiving church acceptance is required. | DDD-003; approved rule | Given a transfer request is pending, when the receiving church has not accepted it, then district completion is blocked. |
| ORG-004 | District approval is required. | DDD-003; approved rule | Given receiving church acceptance exists, when district approval is absent, then the transfer remains incomplete. |
| ORG-005 | Transfer history is preserved. | DDD-003; approved rule | Given a transfer completes, when the member's church history is queried, then both the prior and new assignments and their effective dates are available. |
| ORG-006 | Transfer completion is consistent under concurrent requests. | DDD-003; derived requirement | Given two transfer completion attempts race, when both target the same member, then no outcome leaves two current primary church assignments. |
| ORG-007 | Transfer cancellation and rejection rules are explicit. | DDD-003; policy gap | Given a transfer is rejected or cancelled, then the decision actor, reason, status, and time are recorded. Who may cancel and exact cancellation timing require final policy confirmation. |
| DEPT-001 | A member requests department membership. | DDD-006; approved rule | Given a member submits a department request, then it enters a pending state and is visible only to authorized reviewers. |
| DEPT-002 | Designated department coordinator approves membership. | DDD-006; approved rule | Given a pending request, when an authorized coordinator approves it, then membership becomes active within that coordinator's scope. |
| DEPT-003 | Multiple simultaneous department memberships are permitted. | DDD-006; approved rule | Given a member is active in one department, when another department approves a separate request, then both memberships may remain active. |
| DEPT-004 | Membership withdrawal and authorized termination are supported. | DDD-006; approved rule | Given a member requests withdrawal or an authorized coordinator ends membership, then the membership is ended with actor, time, and required reason recorded. |
| DEPT-005 | Department membership does not confer leadership authority. | DDD-006; approved rule | Given a member is active in a department but has no valid appointment/permission, when they attempt a leadership-only action, then access is denied. |
| DEPT-006 | Department eligibility and annual renewal are controlled. | DDD-006; unresolved detail | Given a membership reaches its review point, when renewal is considered, then the system applies the approved department-specific eligibility and renewal policy. Exact rules and timing require authority confirmation. |

## 4. Leadership and authorization

| ID | Requirement | Source/status | Acceptance criteria |
|---|---|---|---|
| APP-001 | Appointment approval is performed by designated higher authority. | DDD-004; approved rule | Given an appointment request, when the approver lacks the designated authority for that position and scope, then approval is rejected. |
| APP-002 | A person cannot approve their own appointment. | DDD-004; approved rule | Given the proposed appointee is also the acting approver, when approval is attempted, then the operation is denied and audited. |
| APP-003 | Renewal requires fresh approval. | DDD-004; approved rule | Given an appointment term is nearing expiry, when renewal is requested, then a new approval decision is required before the next term becomes active. |
| APP-004 | Appointment term and replacement rules are enforced. | DDD-004; approved rule | Given a mid-year replacement is approved, then its end date follows the approved annual term rule unless an authorized exception is recorded. |
| APP-005 | Same-position overlapping active appointments in the same scope are prevented. | DDD-004; approved rule | Given an active appointment exists for a position and scope, when a second overlapping appointment is submitted for activation, then activation is blocked unless a formally approved exception policy applies. |
| APP-006 | Appointment history is preserved. | DDD-004; approved rule | Given an appointment expires or ends, when its history is queried, then the appointment, approvals, term, reason, and effective dates remain available. |
| APP-007 | Acting appointments have explicit authority and duration. | DDD-004; proposed detail | Given an acting appointment is created, then it records its authorizer, scope, reason, start and end dates, and relationship to the substantive position. Exact authority and limits require policy confirmation. |
| AUTHZ-001 | Authorization denies by default. | DDD-005/DFR-002; approved rule | Given no applicable permission grant exists, when a protected action is requested, then the server denies it. |
| AUTHZ-002 | Authorization is enforced server-side for every protected operation. | DFR-002/security baseline; approved rule | Given a client bypasses or alters UI controls, when it sends a protected request, then server authorization still determines the outcome. |
| AUTHZ-003 | Permission grants are additive only within valid assigned scope. | DDD-005; approved rule | Given an actor has multiple roles, when permissions are combined, then no role expands another role's organizational scope. |
| AUTHZ-004 | Explicit DENY overrides applicable ALLOW for its named scope. | DDD-005 follow-up; approved rule | Given a matching explicit deny and otherwise valid grant, when the actor requests the named permission on the named resource, then the request is denied. |
| AUTHZ-005 | Explicit DENY does not spread to unrelated scopes. | DDD-005 follow-up; approved rule | Given a deny applies to one church or department, when the actor requests the same permission in an unrelated scope, then that deny alone does not affect the unrelated scope. |
| AUTHZ-006 | Ambiguous authorization scope fails closed. | DDD-005 follow-up; approved rule | Given the system cannot resolve the relevant permission/resource scope unambiguously, when access is evaluated, then the affected protected operation is denied and the event is recorded. |
| AUTHZ-007 | Affected actor cannot administer their own explicit deny. | DDD-005 follow-up; approved rule | Given an actor is the target of a deny, when they attempt to create, approve, modify, or revoke it, then the operation is rejected. |
| AUTHZ-008 | Review-required role combinations require independent approval. | DDD-005 follow-up; approved rule | Given a role pair is classified as review-required, when the second assignment is activated without independent approval, then activation is blocked. |
| AUTHZ-009 | Prohibited role combinations cannot be active concurrently. | DDD-005 follow-up; approved rule | Given a prohibited role pair is active or pending activation, when the conflicting assignment is activated, then activation is blocked and history is preserved. |
| AUTHZ-010 | Expired or terminated appointments no longer grant appointment-derived permissions. | DFR-004/DDD-004; approved rule | Given an appointment has expired or ended, when a permission depends on it, then the permission is no longer effective. |
| AUTHZ-011 | Permission catalogue and scope inheritance are explicit. | DDD-005; policy/design gap | Given a permission is evaluated, then its action, resource type, scope level, and any descendant coverage are defined in the approved catalogue. Catalogue completion is an ERD/design prerequisite. |

## 5. Events and attendance

| ID | Requirement | Source/status | Acceptance criteria |
|---|---|---|---|
| EVT-001 | Authorized coordinators create events within scope. | DDD-007; approved rule | Given a coordinator creates an event, when their scope does not cover the event's owning organization, then creation is denied. |
| EVT-002 | District events require approval before publication. | DDD-007; approved rule | Given a district event is pending approval, when publication is attempted before approval, then the event remains unpublished. |
| EVT-003 | Only approved events are open for registration. | DDD-007; approved rule | Given an event is not approved/published, when a member attempts registration, then registration is rejected. |
| EVT-004 | Registration deadline and capacity are enforced. | DDD-007; approved rule | Given registration is closed or capacity is reached, when a member registers, then the request is rejected unless an authorized exception is approved. |
| EVT-005 | Significant event changes and cancellation are authorized and audited. | DDD-007; approved rule | Given a significant change or cancellation is requested, when approval is completed, then actor, reason, decision, and changed event state are recorded. |
| EVT-006 | Event records with registration or attendance are not physically deleted. | DDD-007; approved rule | Given an event has registrations or attendance, when deletion is requested, then physical deletion is blocked and a permitted lifecycle action is required. |
| EVT-007 | Local church approval, late registration, postponement, and refund rules are fully defined. | DDD-007; open detail | Given a local church event or exceptional registration/refund case, then the relevant authorized decision path is explicit. Exact local authority and financial terms require confirmation. |
| ATT-001 | Authorized event personnel record member attendance. | DDD-008; approved rule | Given an actor lacks attendance permission for the event, when they attempt to record attendance, then the operation is denied. |
| ATT-002 | Attendance is linked to event and member. | DDD-008; approved rule | Given attendance is saved, then it references a valid event and member record. |
| ATT-003 | Duplicate valid attendance is prevented per event/session. | DDD-008; approved rule | Given a valid attendance record already exists for the same member/event/session, when a duplicate is submitted, then no second valid record is created. |
| ATT-004 | Manual attendance entry is supported and attributed. | DDD-008; approved rule | Given scanning is unavailable, when an authorized user enters attendance manually, then the record identifies the acting user and timestamp. |
| ATT-005 | Attendance corrections preserve original values and approval history. | DDD-008; approved rule | Given a correction is approved, when attendance history is queried, then original value, corrected value, reason, requester, approver, and timestamps are available. |
| ATT-006 | Attendance statuses are distinguishable in reports. | DDD-008; approved rule | Given an attendance report is generated, then present, absent, and other approved statuses are not collapsed into one count. |
| ATT-007 | Self-check-in, QR expiry, offline synchronization, and registration exceptions are controlled. | DDD-008; unresolved design details | Given one of these mechanisms is enabled, then its authorization, replay prevention, deduplication, and audit rules are documented and tested before implementation. |

## 6. Finance

| ID | Requirement | Source/status | Acceptance criteria |
|---|---|---|---|
| FIN-001 | Every financial account has one organizational owner and one currency. | DDD-009; approved rule | Given an account is created, then it has exactly one owning scope and one currency. |
| FIN-002 | District and church account ownership remain separate. | DDD-009; approved rule | Given a district user views a church financial report, then viewing does not grant authority to mutate the church account. |
| FIN-003 | NGN is the district default currency. | DDD-009; approved rule | Given a new Sango District account is created without an approved alternative, then its currency defaults to NGN. |
| FIN-004 | Foreign-currency support preserves original currency and conversion evidence. | DDD-009; approved rule | Given a foreign-currency transaction is reported in NGN, then original amount/currency, exchange rate, conversion date, and converted amount remain traceable. |
| FIN-005 | Every transaction references its owning account. | DDD-009; approved rule | Given a transaction is submitted, then the referenced account exists and belongs to the transaction's authorized scope. |
| FIN-006 | Submitter cannot approve own transaction. | DDD-010; approved rule | Given the submitter attempts approval, then approval is denied and recorded. |
| FIN-007 | Transaction changes after submission are controlled. | DDD-010; approved rule | Given a submitted transaction needs correction, then it is revised through an authorized revision/resubmission process rather than silently overwritten. |
| FIN-008 | Rejections require a reason. | DDD-010; approved rule | Given a transaction is rejected, then a non-empty reason and rejecting actor are recorded. |
| FIN-009 | Posted transactions are corrected by linked reversal. | DDD-010; approved rule | Given a posted transaction requires correction, then a linked reversal is recorded and the original posting remains intact. |
| FIN-010 | Duplicate reversals and duplicate posting are prevented. | DDD-010/013; approved rule | Given a transaction has already been reversed or a payment already posted, when the same logical operation is retried, then no duplicate financial effect occurs. |
| FIN-011 | Payment execution, posting, partial payment, and failed payment are represented distinctly. | DDD-010; detail to finalize | Given a transaction is approved, paid in part, fully paid, failed, or posted, then reports distinguish those states and amounts. |
| FIN-012 | Approval thresholds, budget controls, and reimbursement rules are enforced. | DDD-010; policy gap | Given a transaction exceeds an approved threshold or budget, then the configured additional approval path is required. Threshold values and authority must be approved separately. |

## 7. Credentials, audit, retention, and integrations

| ID | Requirement | Source/status | Acceptance criteria |
|---|---|---|---|
| CRED-001 | Credential definitions are controlled and versioned. | DDD-011; platform policy accepted, official evidence open | Given credential requirements change, then a new definition version is created and prior issued credentials retain the version used at issuance. |
| CRED-002 | Credential issuance requires authorized verification and issuer approval. | DDD-011; platform policy accepted | Given evidence is submitted, when an unauthorized verifier or issuer attempts to approve it, then the action is denied. |
| CRED-003 | Renewal, revocation, correction, and reissue preserve lineage. | DDD-011; platform policy accepted | Given a credential is renewed, revoked, corrected, or reissued, then the prior issuance remains linked and retrievable with actor, reason, and dates. |
| CRED-004 | Credential requirements and issuer authority follow official standards. | DDD-011; policy/evidence gap | Given a credential is offered for issuance, then its requirements and issuer are supported by an approved authoritative source. |
| AUD-001 | Audit events identify actor type and relevant actor identity. | DDD-012; platform policy accepted | Given a user, system process, service, or anonymous action is audited, then the actor type is recorded accurately and human actions are not attributed to a generic system actor. |
| AUD-002 | Audit history is append-only and ordinary users cannot alter it. | DDD-012; platform policy accepted | Given an audit event exists, when an ordinary user or administrator attempts to edit/delete it, then the operation is denied. |
| AUD-003 | Audit access is explicitly authorized and scope-limited. | DDD-012; policy gap on named authorities | Given an actor requests audit data, then access requires a specific audit permission and applicable organizational scope. |
| AUD-004 | Audit searches, exports, and emergency access are audited. | DDD-012; platform policy accepted | Given a privileged audit search/export/emergency access occurs, then actor, purpose, scope, time, and outcome are recorded. |
| RET-001 | Retention schedules are versioned and authority-approved. | DDD-014; platform policy accepted | Given a record class is eligible for disposal, then a current approved schedule defines its duration, start event, authority, and disposal action. |
| RET-002 | Unknown retention periods do not trigger automated permanent deletion. | DDD-014; platform policy accepted | Given no approved retention duration exists for a class, then automated permanent deletion is disabled for that class. |
| RET-003 | Legal/investigation holds suspend disposal. | DDD-014; platform policy accepted | Given a valid hold is active, when a scheduled disposal runs, then covered records are excluded until authorized hold release. |
| RET-004 | Disposal/anonymization is authorized and auditable. | DDD-014; platform policy accepted | Given disposal is approved under a valid schedule, then the operation records schedule version, authority, reason, affected scope, and outcome. |
| NOTIF-001 | Notification requests are processed asynchronously where appropriate. | DDD-015; approved | Given a business action requests a notification, then delivery is queued without making the business action depend on provider availability. |
| NOTIF-002 | Notification delivery states distinguish acceptance from delivery. | DDD-015; approved | Given a provider accepts a message but gives no delivery receipt, then DYMS records Accepted, not Delivered or Read. |
| NOTIF-003 | Notification retries are controlled and idempotent. | DDD-015; approved | Given a transient delivery failure occurs, then retry policy prevents duplicate logical notifications and stops or escalates after the configured limit. |
| NOTIF-004 | Preferences and applicable consent are checked before optional delivery. | DDD-015; approved | Given a member opts out of an optional channel, when an optional notification is dispatched, then the opted-out channel is not used. |
| NOTIF-005 | Webhooks are verified and replay-protected. | DDD-015; approved | Given an invalid signature or previously processed provider event is received, then it is rejected or safely deduplicated without repeating the business effect. |
| NOTIF-006 | Payment confirmation requires verified provider evidence. | DDD-015; approved | Given a browser redirect claims payment success without verified provider confirmation, then DYMS does not mark the payment as successful or post it. |

## 8. Cross-cutting platform and integrity requirements

| ID | Requirement | Source/status | Acceptance criteria |
|---|---|---|---|
| SEC-001 | Passwords are hashed using Argon2id. | DFR-001; approved | Given a password is stored, then only an approved Argon2id password hash is persisted, never plaintext. |
| SEC-002 | Access/refresh credentials follow approved lifetimes and rotation. | DFR-001/004; approved | Given a session is refreshed or expires, then access lifetime, refresh rotation, inactivity, and absolute expiry rules are enforced. |
| SEC-003 | Cookie-authenticated mutations enforce CSRF and origin validation. | DFR-001/004; approved | Given a state-changing browser request lacks valid CSRF/origin evidence, then it is rejected. |
| SEC-004 | Rate limiting applies to public and authenticated APIs. | DFR/security baseline; approved | Given a client exceeds an applicable limit, then the server returns the defined rate-limit response and does not execute the protected mutation. |
| SEC-005 | Sensitive mutations support idempotent retries. | DDD-013; platform policy accepted | Given the same actor, operation, scope, key, and payload are retried, then only one business effect occurs and the safe original result is returned. |
| SEC-006 | Reusing an idempotency key with a different payload is rejected. | DDD-013; platform policy accepted | Given a key already binds to a request fingerprint, when a different payload reuses it, then the server returns a conflict and performs no second mutation. |
| SEC-007 | Money uses decimal precision. | DFR-003; approved | Given a monetary value is calculated or stored, then no binary floating-point arithmetic is used for authoritative amounts. |
| SEC-008 | Timestamps use UTC and event timezone is retained. | DFR-003; approved | Given an event is scheduled in a local timezone, then its instant is stored consistently and the original timezone context remains available. |
| SEC-009 | Critical workflows preserve atomic consistency. | DFR-003/DDD-003/010/013; derived | Given a critical workflow fails before commit, then partial state is not exposed as completed. |
| SEC-010 | Sensitive operations are auditable. | DFR-002/security baseline; approved | Given a sensitive mutation succeeds or fails at a security boundary, then the required actor, action, scope, time, result, and reason are recorded without secrets. |
| SEC-011 | API is versioned and contract-documented. | DFR-002; approved | Given an API operation is released, then it is under /api/v1 and represented in the OpenAPI contract with standard success/error response semantics. |
| SEC-012 | Backup and recovery targets are testable. | DFR-005; approved target | Given a recovery exercise is performed, then evidence demonstrates RPO no greater than 24 hours and restoration of critical services within 8 hours. |

## 9. Non-functional acceptance areas

The following cross-cutting test suites are required before a release is considered ready:

- Authentication: password hashing, login abuse, recovery, CSRF, cookie flags, session expiry, refresh rotation/reuse detection, revocation.
- Authorization: deny-by-default, scope isolation, explicit deny precedence, role conflict, self-approval prevention, appointment expiry.
- Data integrity: unique current assignments, temporal overlap, foreign keys, transaction rollback, idempotent retries, duplicate webhook handling.
- Finance: submitter/approver separation, threshold workflow, partial payment, failed payment, posting, reversal, reconciliation, decimal precision.
- Privacy and audit: access restrictions, actor attribution, sensitive-data redaction, audit immutability, export audit, retention holds.
- Notifications: preferences/consent, delivery status accuracy, retry limits, provider outage, webhook signature and replay protection.
- Operations: rate limiting across instances, queue recovery, backup encryption, restore tests, monitoring and alerting.
- Accessibility and usability: clear error states, keyboard operation, responsive layouts, and age-appropriate registration experience under an approved policy.

## 10. Requirements still blocked by policy evidence or owner decisions

These must not be filled with invented values:

1. Official Adventurer, Pathfinder, and Senior Youth age/class/eligibility rules.
2. Account registration, identity verification, consent, and safe access process for younger members under the individual-login-only rule.
3. Exact church transfer cancellation authority and detailed rejection/cancellation lifecycle.
4. Appointing authority per position, acting appointment duration/limits, and exceptional overlap rules.
5. Full permission catalogue and scope inheritance map.
6. Department-specific eligibility, renewal timing, and appeal authority.
7. Local church event approval authority and event payment/refund rules.
8. Financial thresholds, approval matrix, budget variance limits, and reimbursement rules.
9. Official credential catalogue, issuer authority, validity, revocation grounds, and evidence requirements.
10. Retention durations and legal/institutional basis by record class.
11. Named audit/security roles, emergency access approval, and audit review cadence.
12. Selected notification/payment providers and their verified delivery/reconciliation guarantees.
13. Resolution of the DFR-006 status conflict in repository documentation.

## 11. Review status

This document expands the requirements into testable acceptance criteria. It remains a working specification. Before it is treated as complete, the project owner and relevant ministry/financial authorities must review policy gaps, and the requirement IDs must be reconciled against the final domain decision register.

No ERD, physical schema, Prisma model, migration, or application implementation is approved by this document.
