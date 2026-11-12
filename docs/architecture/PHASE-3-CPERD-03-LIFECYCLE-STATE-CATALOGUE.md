# DYMS Phase 3 — CPERD-03 Lifecycle and State Catalogue

- Revision: LSC-03 Draft 0.1
- Date: 2026-11-12
- Status: **SUCCESSOR CANDIDATE; RECONCILIATION IN PROGRESS; NOT APPROVED**
- Implementation authorization: **GRANTED CONDITIONALLY; NOT EXERCISABLE BEFORE FINAL CPERD-03 APPROVAL**

## 1. Authority

This catalogue filters the CPERD-02 lifecycle candidate to remove excluded/deferred domains and supersedes the CPERD-02 church-membership lifecycle wording with the explicit IDX-R02 owner decision. It does not alter historical approval artifacts.

The owner-approved product behavior is authoritative. Candidate persisted ENUM labels for other entities remain technical proposals unless explicitly approved.

## 2. IDX-R02 membership lifecycle

- ACTIVE: current church membership.
- SUSPENDED: not current; retains the original membership record and history.
- TERMINATED: not current; preserves historical membership.
- Reactivation: transition the same suspended membership row back to ACTIVE.
- Uniqueness: no member has more than one ACTIVE church membership.
- Church Transfer: excluded from DYMS 1.0 and absent from the active lifecycle.

These three labels are the canonical candidate persisted labels for cross-register consistency. Final ENUM type name, transition constraints and actor/time/reason evidence remain subject to technical reconciliation and owner approval.

## 3. Included lifecycle rows

| Table | Initial state / creation condition | Candidate states or outcome values | Transition authority | Terminal states | Classification and notes |
|---|---|---|---|---|---|
| `user_accounts` | Provisioning creates PENDING or another explicitly authorized initial state | PENDING, ACTIVE, SUSPENDED, CLOSED | Account provisioning and designated account/security authority | CLOSED; SUSPENDED is reversible only through authorized reinstatement | PROPOSED. PENDING/ACTIVE/SUSPENDED/CLOSED already appear in the physical proposal; confirm closure and reinstatement policy. |
| `members` | Created with linked individual account | TBD | Authorized membership administrator | TBD | POLICY BLOCKED. Member lifecycle must remain distinct from account lifecycle. Do not infer that account suspension closes membership. |
| `districts` | Administrative setup | TBD | Project/district system authority | TBD | POLICY BLOCKED. District activation/deactivation governance is not yet defined. |
| `churches` | Created under a district | TBD | Authorized district administrator | TBD | POLICY BLOCKED. Define closure/merger and effect on memberships before state constraints. |
| `member_category_assignments` | Created by an authorized category decision | PENDING, ACTIVE, ENDED, REVOKED | Authorized administrator within assigned scope; verification/approval path still requires policy confirmation | ENDED, REVOKED | PROPOSED. Eligibility and exception rules remain open. Only one current active primary category per member. |
| `church_memberships` | Authorized initial membership creation | ACTIVE, SUSPENDED, TERMINATED | Authorized membership authority within district/church scope; actor, timestamp and reason evidence preserved | TERMINATED; SUSPENDED is reversible | OWNER-APPROVED PRODUCT RULE (IDX-R02). ACTIVE is the sole current state. SUSPENDED and TERMINATED are not current. Reactivation restores the same suspended membership row to ACTIVE. One ACTIVE church membership per member. Church Transfer excluded from DYMS 1.0. Exact database ENUM name and index predicate must match all CPERD-03 registers. |
| `departments` | Authorized organizational setup | TBD | District authority; church ownership model requires confirmation | TBD | POLICY BLOCKED. District-wide versus church-specific department governance remains unresolved. |
| `department_eligibility_rules` | Drafted from an authoritative source | DRAFT, APPROVED, ACTIVE, SUPERSEDED, WITHDRAWN | Recognized policy authority approves; designated administrator publishes | SUPERSEDED, WITHDRAWN | PROPOSED. Never activate without source authority and approval evidence. |
| `department_memberships` | Member submits request | Candidate vocabulary only: REQUESTED, ACTIVE, WITHDRAWAL_REQUESTED, ENDED, REJECTED | Approved core: member requests; designated department coordinator approves; member may withdraw; authorized coordinator may terminate with reason | Not finalized | POLICY BLOCKED for final state/transition constraints. Multiple concurrent department memberships are approved. Eligibility, rejection/appeal, annual review/renewal, church-transfer effects, eligibility exceptions, and department-change workflow remain unresolved. Candidate labels are not approved values. |
| `positions` | Created by authorized organization administrator | TBD | Authority responsible for the position's declared scope | TBD | POLICY BLOCKED. Position catalogue and scope ownership require owner confirmation. |
| `appointments` | Appointment submitted for higher-authority approval | PENDING_APPROVAL, APPROVED, REJECTED, TERMINATED | Designated higher authority in the exact position scope; requester/appointee self-approval prohibited | REJECTED, TERMINATED | CPERD-16 successor candidate. APPROVED and TERMINATED retain approval actor/time. REJECTED records rejection actor/time/reason. TERMINATED records termination actor/time/reason. Expiry is derived from the effective interval, not a persisted EXPIRED state. Renewal creates a new appointment row. Acting, overlapping and retroactive appointments are disabled. |
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

## 4. Technical label boundary

OD-07 requires stable technical states to use PostgreSQL ENUM types. For every included status-bearing table, CPERD-03 must specify the exact enum type, exact labels, allowed transitions, terminal behavior and history semantics. Business categories remain lookup data, not technical ENUMs.

Do not infer missing institutional policy. A state marked POLICY BLOCKED or TBD remains unresolved. Disabled features must not be represented as active state machines in DYMS 1.0.

## 5. Closure checks

1. Ensure each status-bearing column maps to exactly one named ENUM type.
2. Ensure every enum label exists in this catalogue and every catalogue label exists in the column register.
3. Ensure CHECKs, partial indexes, API contracts and requirements use identical state labels.
4. Ensure actor, timestamp and reason provenance is preserved for consequential lifecycle transitions.
5. Ensure membership reactivation updates the same row and does not create a second current membership.
6. Ensure no Church Transfer, finance, payment, budget or credential issuance lifecycle remains in DYMS 1.0.
7. Reconcile all remaining rows against approved DDD and ODR decisions.

**Status: DRAFT 0.1 — NOT APPROVED. No implementation is authorized by this register.**
