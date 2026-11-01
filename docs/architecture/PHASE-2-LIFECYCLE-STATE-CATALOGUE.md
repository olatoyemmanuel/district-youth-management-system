# DYMS Phase 2: Lifecycle and State Catalogue

**Status:** Working design catalogue; not approved for implementation  
**Scope:** DYMS v1.0, Sango District  
**Logical authority:** Approved conceptual ERD revision `25f2813e0256d9472daded45657dfb7ac9f70a43`  
**Physical-design source:** `PHASE-2-PHYSICAL-DATABASE-DESIGN.md`  
**Implementation authorization:** NOT GRANTED

## 1. Purpose

This catalogue defines the lifecycle vocabulary that the physical database design must eventually enforce. It separates states directly implied by approved workflows from provisional technical states and unresolved ministry, finance, safeguarding, or governance policy.

It is not a blanket approval of the proposed values. A state marked **PROPOSED** must be confirmed by the project owner and relevant authority before a CHECK constraint, lookup seed, API contract, or migration is created. A state marked **POLICY BLOCKED** must not be implemented as a guessed value set.

The catalogue covers status-bearing entities and decision-bearing history entities. Some history tables have no mutable lifecycle status; they record immutable decisions or outcomes instead.

## 2. Classification

- **DERIVED:** The distinction follows directly from an approved workflow. Exact labels still need consistent technical naming.
- **PROPOSED:** A conservative technical lifecycle suggestion. It requires project-owner confirmation and must not be represented as official church policy.
- **POLICY BLOCKED:** The correct states or transition authority depend on an unresolved policy or owner decision. Do not finalize database CHECK constraints or production seeds.
- **IMMUTABLE HISTORY:** No mutable lifecycle status is required. The row is an append-only decision, evidence, or audit fact. Any processing outcome is represented by a separate related entity where applicable.

## 3. Lifecycle catalogue

| Table | Initial state / creation condition | Candidate states or outcome values | Transition authority | Terminal states | Classification and notes |
|---|---|---|---|---|---|
| `user_accounts` | Provisioning creates PENDING or another explicitly authorized initial state | PENDING, ACTIVE, SUSPENDED, CLOSED | Account provisioning and designated account/security authority | CLOSED; SUSPENDED is reversible only through authorized reinstatement | PROPOSED. PENDING/ACTIVE/SUSPENDED/CLOSED already appear in the physical proposal; confirm closure and reinstatement policy. |
| `members` | Created with linked individual account | TBD | Authorized membership administrator | TBD | POLICY BLOCKED. Member lifecycle must remain distinct from account lifecycle. Do not infer that account suspension closes membership. |
| `districts` | Administrative setup | TBD | Project/district system authority | TBD | POLICY BLOCKED. District activation/deactivation governance is not yet defined. |
| `churches` | Created under a district | TBD | Authorized district administrator | TBD | POLICY BLOCKED. Define closure/merger and effect on memberships before state constraints. |
| `member_category_assignments` | Created by an authorized category decision | PENDING, ACTIVE, ENDED, REVOKED | Authorized administrator within assigned scope; verification/approval path still requires policy confirmation | ENDED, REVOKED | PROPOSED. Eligibility and exception rules remain open. Only one current active primary category per member. |
| `church_memberships` | Created through approved membership or completed transfer workflow | PENDING, CURRENT, ENDED | Receiving church acceptance and district approval for transfer; initial membership authority needs confirmation | ENDED | PROPOSED. The one-current-primary-church invariant is approved. Exact initial membership and rejection flow remain open. |
| `church_transfer_requests` | Member submits request | REQUESTED, RECEIVING_ACCEPTED, RECEIVING_REJECTED, DISTRICT_APPROVED, DISTRICT_REJECTED, CANCELLED, COMPLETED | Member initiates; receiving church decides; district gives final approval | RECEIVING_REJECTED, DISTRICT_REJECTED, CANCELLED, COMPLETED | PROPOSED. Cancellation authority/timing, effective date semantics, and appeals remain open. Store each decision in history, not only current status. |
| `departments` | Authorized organizational setup | TBD | District authority; church ownership model requires confirmation | TBD | POLICY BLOCKED. District-wide versus church-specific department governance remains unresolved. |
| `department_eligibility_rules` | Drafted from an authoritative source | DRAFT, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN | Recognized policy authority approves; designated administrator publishes | SUPERSEDED, WITHDRAWN | PROPOSED. Never activate without source authority and approval evidence. |
| `department_memberships` | Member submits request | REQUESTED, ACTIVE, WITHDRAWAL_REQUESTED, ENDED, REJECTED | Member requests; designated department coordinator approves/ends | ENDED, REJECTED | PROPOSED. Multiple concurrent departments are allowed. Eligibility, renewal and appeals remain open. |
| `positions` | Created by authorized organization administrator | TBD | Authority responsible for the position's declared scope | TBD | POLICY BLOCKED. Position catalogue and scope ownership require owner confirmation. |
| `appointments` | Appointment submitted for higher-authority approval | SUBMITTED, APPROVED, ACTIVE, EXPIRED, TERMINATED, REJECTED | Designated higher authority; renewal requires fresh approval | EXPIRED, TERMINATED, REJECTED | PROPOSED, grounded in approved appointment rules. Acting appointments and exceptional overlap are not enabled. |
| `roles` | Created in controlled role catalogue | DRAFT, ACTIVE, RETIRED | System/security governance authority | RETIRED | PROPOSED. Role catalogue and independent roles remain to be completed. |
| `permissions` | Created in controlled permission catalogue | DRAFT, ACTIVE, RETIRED | System/security governance authority | RETIRED | PROPOSED. Full permission catalogue and scope map remain a prerequisite. |
| `user_role_assignments` | Authorized grant request | PENDING, ACTIVE, EXPIRED, REVOKED, REJECTED | Separately authorized grantor; self-grant prohibited | EXPIRED, REVOKED, REJECTED | PROPOSED. Appointment-derived grants must cease when the appointment ceases to be effective. |
| `access_denies` | Authorized deny issued with reason and scope | ACTIVE, EXPIRED, REVOKED | Separately authorized administrator; affected actor cannot administer own deny | EXPIRED, REVOKED | DERIVED from approved DDD-005 deny lifecycle. Permanent deny requires review controls; expiry/review schedule policy still needs confirmation. |
| `role_conflict_rules` | Governance rule drafted and versioned | DRAFT, ACTIVE, SUPERSEDED, RETIRED | Independent role/security governance authority | SUPERSEDED, RETIRED | PROPOSED. Allowed/review-required/prohibited combinations require approved catalogue. |
| `role_conflict_reviews` | Review created when role pair requires independent review | APPROVED, REJECTED, REVOKED | Independent authorized reviewer | REJECTED, REVOKED | PROPOSED. Exact review validity and renewal conditions require role-conflict policy. |
| `events` | Authorized coordinator creates draft | DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED, CANCELLED, COMPLETED, CLOSED | Event owner/coordinator; district approval required before district event publication | CANCELLED, CLOSED | PROPOSED. Local church approval and postponement/rescheduling states remain open. |
| `event_approvals` | Decision record appended for an approval stage | APPROVED, REJECTED | Authority designated for the event's scope and stage | Immutable decision record | DERIVED. Each decision is a separate history row; later review must not overwrite earlier decisions. |
| `event_change_records` | Authorized change request submitted | SUBMITTED, APPROVED, REJECTED, WITHDRAWN | Authorized requester; designated event authority approves significant changes | REJECTED, WITHDRAWN, APPLIED | PROPOSED. APPLIED records successful application, not merely approval. |
| `event_registrations` | Eligible member submits registration | SUBMITTED, CONFIRMED, CANCELLED, REJECTED | Member submits; event coordinator controls authorized exceptional decisions | CANCELLED, REJECTED | PROPOSED. Capacity-consuming states must be explicitly approved before capacity counter activation. Waitlist and late-registration states are not assumed. |
| `event_sessions` | Session created under an event | SCHEDULED, OPEN, CLOSED, CANCELLED | Authorized event coordinator | CLOSED, CANCELLED | PROPOSED. Session operational rules require event policy confirmation. |
| `attendance_records` | Authorized event personnel records attendance | TBD | Authorized event personnel; correction approvals follow designated event/district authority | Immutable attendance fact subject to approved correction workflow | POLICY BLOCKED. Attendance status vocabulary must include approved present/absent/other statuses, but exact list is not yet approved. |
| `attendance_corrections` | Correction request submitted | REQUESTED, APPROVED, REJECTED, APPLIED | Designated event/district authority, independent of requester where required | REJECTED, APPLIED | PROPOSED. Original attendance remains preserved; applied correction is a separate fact. |
| `financial_accounts` | Account opening request | OPEN, FROZEN, CLOSED | Authorized finance authority within account ownership scope | CLOSED | POLICY BLOCKED. Open/freeze/close authority and reopening rules require finance governance. |
| `financial_transactions` | Draft or submitted transaction | DRAFT, SUBMITTED, APPROVED, REJECTED, PAID, POSTED, REVERSED | Submitter, designated approver, authorized payment officer and posting authority | REJECTED, POSTED, REVERSED | PROPOSED, aligned to approved workflow distinctions. Payment/posting separation and exact sequence remain open. |
| `transaction_revisions` | Pre-posting revision request | REQUESTED, APPROVED, REJECTED, APPLIED | Authorized submitter requests; designated approver decides | REJECTED, APPLIED | DERIVED. Posted transactions cannot be revised; use linked reversal. |
| `transaction_approvals` | Decision appended for transaction approval stage | APPROVED, REJECTED | Authorized independent finance approver | Immutable decision record | DERIVED. Submitter cannot approve own transaction. Approval thresholds and multi-level authority remain open. |
| `payments` | Payment attempt initiated | INITIATED, PENDING, CONFIRMED, FAILED, EXHAUSTED, CANCELLED | Payment provider evidence plus authorized reconciliation process | CONFIRMED, FAILED, EXHAUSTED, CANCELLED | PROPOSED. Provider-specific meanings and returned/refunded/partial states require finance policy. |
| `transaction_reversals` | Full reversal requested | REQUESTED, APPROVED, REJECTED, POSTED | Authorized finance initiator and independent approver/posting authority | REJECTED, POSTED | PROPOSED. Full reversal only; partial reversal remains disabled pending policy. |
| `budgets` | Budget draft created for a defined period | DRAFT, SUBMITTED, APPROVED, ACTIVE, CLOSED, REJECTED | Authorized budget preparer and designated finance approver | CLOSED, REJECTED | POLICY BLOCKED for final use. Approval matrix, budget enforcement and variance policy remain open. |
| `credential_definitions` | Controlled credential catalogue entry proposed | DRAFT, ACTIVE, RETIRED | Recognized issuing authority | RETIRED | PROPOSED. Official credential catalogue and issuer authority evidence required. |
| `credential_definition_versions` | New version drafted | DRAFT, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN | Recognized authority approves requirements and effective period | SUPERSEDED, WITHDRAWN | PROPOSED. No credential standard or validity period is invented. |
| `credential_issuances` | Approved issuance after evidence verification | ISSUED, ACTIVE, EXPIRED, REVOKED, SUPERSEDED | Authorized verifier and designated issuer | EXPIRED, REVOKED, SUPERSEDED | PROPOSED. Expiry only applies when the approved definition requires it. |
| `credential_evidence` | Evidence submitted for an issuance | SUBMITTED, VERIFIED, REJECTED, WITHDRAWN | Authorized verifier | VERIFIED, REJECTED, WITHDRAWN | PROPOSED. Evidence types and retention need official authority. |
| `notification_templates` | Template version drafted | DRAFT, ACTIVE, RETIRED | Notification/system administrator under content governance | RETIRED | PROPOSED. Version is immutable once used for dispatch. |
| `notification_preferences` | Preference/consent choice recorded | UNKNOWN, GRANTED, DENIED, WITHDRAWN | Account holder; applicable consent rules govern optional channels | Superseded by a later preference record | PROPOSED. Essential account/security notices are treated separately from optional channels. |
| `notifications` | Logical notification request created | PENDING, PROCESSING, ACCEPTED, DELIVERED, FAILED, EXHAUSTED, CANCELLED | System notification workflow | DELIVERED, EXHAUSTED, CANCELLED | DERIVED from approved DDD-015 delivery distinctions. ACCEPTED is not proof of delivery or reading. |
| `notification_recipients` | Recipient resolved and preference evaluated | PENDING, ELIGIBLE, SUPPRESSED, COMPLETED, FAILED | Notification workflow applies recorded preference/consent | SUPPRESSED, COMPLETED, FAILED | PROPOSED. Do not send optional channels without applicable consent. |
| `integration_providers` | Provider configuration registered | CONFIGURED, ACTIVE, DISABLED, SUSPENDED | Authorized integration administrator | DISABLED | PROPOSED. Secrets remain in a secrets manager. |
| `notification_deliveries` | Delivery attempt queued | PENDING, PROCESSING, ACCEPTED, DELIVERED, FAILED, EXHAUSTED, CANCELLED | Notification worker and provider evidence | DELIVERED, EXHAUSTED, CANCELLED | DERIVED from approved DDD-015 distinctions. Provider acceptance must not be labelled delivery. |
| `outbox_messages` | Inserted atomically with source business mutation | PENDING, PROCESSING, PUBLISHED, RETRY_WAIT, EXHAUSTED, DEAD_LETTERED | Outbox worker; controlled operator for replay/recovery | PUBLISHED, EXHAUSTED, DEAD_LETTERED | PROPOSED. Retry limits and dead-letter authority are operational settings, not business approval. |
| `webhook_events` | Provider event received | RECEIVED, VERIFIED, REJECTED, PROCESSING, PROCESSED, FAILED | Webhook verifier and integration worker | REJECTED, PROCESSED, FAILED | PROPOSED. Signature/replay validation and provider event identity are mandatory. |
| `integration_failures` | Failure record created | OPEN, RETRYING, RESOLVED, EXHAUSTED, DISMISSED | Integration worker; authorized operator for manual resolution | RESOLVED, EXHAUSTED, DISMISSED | PROPOSED. Retry ceiling and alert threshold remain operational decisions. |
| `audit_events` | Appended when auditable action occurs | No mutable status; immutable event record | Dedicated audit writer | Immutable | IMMUTABLE HISTORY. Actor type/identity is governed by the audit actor contract. |
| `idempotency_records` | First request claims key | IN_PROGRESS, COMPLETED, FAILED_RETRYABLE, EXPIRED | Request transaction/service | COMPLETED, EXPIRED | PROPOSED. Key retention and lease durations remain technical decisions; replay rechecks authorization. |
| `retention_policies` | Schedule drafted | DRAFT, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN | Authorized records/finance/church governance authority | SUPERSEDED, WITHDRAWN | POLICY BLOCKED for activation. No category receives a guessed retention duration. |
| `retention_holds` | Hold issued for exact retention subject | ACTIVE, RELEASED, EXPIRED | Authorized hold issuer; release authority must be designated | RELEASED, EXPIRED | PROPOSED. Legal/investigation hold policy and authority require confirmation. |
| `retention_actions` | Disposal/anonymization action proposed | REQUESTED, APPROVED, BLOCKED_BY_HOLD, EXECUTED, REJECTED, FAILED | Independent authorized approver and controlled executor | EXECUTED, REJECTED, FAILED | PROPOSED. Automated permanent deletion remains disabled without an approved schedule. |
| `report_definitions` | Report definition/version drafted | DRAFT, ACTIVE, RETIRED | Reporting/system administrator; classification owner approves sensitive report | RETIRED | PROPOSED. Report permission and classification catalogue must be approved. |
| `report_runs` | Authorized report request created | QUEUED, RUNNING, COMPLETED, FAILED, CANCELLED, EXPIRED | Reporting worker; requester may cancel only if policy permits | COMPLETED, FAILED, CANCELLED, EXPIRED | PROPOSED. Recheck authorization at execution and export. |

## 4. Decision rules for state implementation

1. Store the current lifecycle state on the aggregate only where the state represents its current operational condition.
2. Store each approval, rejection, review, correction, or revocation as an append-only decision/history record. Do not overwrite decision history.
3. Use one table-specific state catalogue per aggregate. Do not create a universal status enum.
4. Use explicit transition services and authorization checks. A valid state value alone does not authorize a transition.
5. Add database CHECK constraints only after the relevant row is classified DERIVED or the proposed values are explicitly approved.
6. Where a state is POLICY BLOCKED, keep the status field as a working design placeholder and do not seed production values or create restrictive final CHECK constraints.
7. A terminal state is not automatically a deletion instruction. Retention schedules govern disposal separately.
8. Provider delivery states and business workflow states remain separate. Provider acceptance does not mean a business transaction is posted.
9. A background job must record its service actor and, where user-triggered, the initiating user in audit history.
10. State changes that affect capacity, finance, authorization, appointment validity, or retention must be atomic with their associated records and audit/outbox entries.

## 5. Approval checklist

- [ ] Project owner confirms the proposed technical states.
- [ ] Relevant ministry authorities confirm member, category, church, department, appointment, event, attendance, and credential states.
- [ ] Finance authority confirms account, budget, transaction, payment, approval and reversal states.
- [ ] Security authority confirms account, role, permission, deny, session and idempotency states.
- [ ] Records/administrative authority confirms retention policy, hold and action states.
- [ ] Notification/integration owners confirm provider and delivery processing states.
- [ ] Every state-bearing table has an initial state, allowed states, transition authority, terminal states and history record.
- [ ] Every transition has an authorization rule and an auditable outcome.
- [ ] State catalogues are reconciled with all 97 testable requirement rows and the approved conceptual ERD.

## 6. Implementation boundary

This document is a design proposal only. It does not authorize Prisma schema changes, migrations, SQL DDL, database objects, generated clients, or application implementation. The project owner must approve the physical design and separately authorize implementation.
