# DYMS CPERD-15 — Church Transfer and Appointment Lifecycle Decision Sheets

- Deliverable: CPERD-15
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **OWNER-APPROVED CORE FLOWS MAPPED; OPTIONAL TRANSITIONS AND PHYSICAL GAPS IDENTIFIED**
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This document prepares the ODR-002 and ODR-003 lifecycle decision sheets required by Phase 4 GDC-01 §8. It maps owner-approved behavior to candidate transitions, actors, effective-date semantics, existing physical fields, API commands, audit evidence and concurrency controls.

The project owner has approved the core business behavior. This document does not reopen those decisions. It identifies exact technical labels and optional edge paths that still require reconciliation before a successor ERD/API contract is finalized.

No state enum, CHECK, partial-unique predicate, table, column, FK, API route, SQL, Prisma model or migration is approved or created by this document.

## 2. Authority

Current authority:
- Phase 4 GDC-01 §4, ODR-002 and ODR-003.
- Owner Decision Register ODR-002/ODR-003, including the “Already approved and not reopened” statements.
- DDD-003 and DDD-004.
- CPERD-01 exact owner-approved master ERD.
- Current canonical column/FK/index/integrity registers.

Historical questions in the ODR register are preserved for auditability. Phase 4 GDC-01 closes the core product behavior and requires remaining cancellation/rejection/appeal and appointment exception transitions to be explicit, auditable and configurable before enablement. External delegated confirmation is not a prerequisite.

## 3. ODR-002 — Church transfer lifecycle decision sheet

### 3.1 Owner-approved core

1. The member initiates the transfer.
2. The receiving church must accept.
3. The district gives final approval.
4. The transfer becomes effective on district approval.
5. No backdating by default.
6. One unresolved transfer request per member.
7. Cancellation is permitted before the effective date.
8. Decision and cancellation history/reasons must be preserved.
9. Rejection and appeal paths must be explicit, auditable and configurable before they are enabled.

Because the effective date is the district approval date, the normal cancellation window ends when the district decision makes the transfer effective. No post-effective cancellation is part of the approved core flow.

### 3.2 Candidate semantic transition model

These are semantic transition names, not approved persisted enum strings:

| Current semantic state | Command | Actor / authorization | Next semantic state | Required evidence |
|---|---|---|---|---|
| No open request | Initiate transfer | Authenticated member; requester must be the member whose membership is being transferred | Awaiting receiving-church decision | Source/receiving church, request timestamp, member identity, reason if required |
| Awaiting receiving-church decision | Accept transfer | Authorized receiving-church authority for the target church | Awaiting district decision | Receiving decision actor, decision timestamp, acceptance outcome |
| Awaiting receiving-church decision | Reject transfer | Authorized receiving-church authority | Rejected by receiving church | Decision actor, timestamp, reason; request remains historical |
| Awaiting district decision | Approve transfer | Authorized district authority; must not be the requester where separation-of-duties requires | Effective | District approver, approval timestamp, effective timestamp, source/target church |
| Awaiting district decision | Reject transfer | Authorized district authority | Rejected by district | Decision actor, timestamp, reason |
| Any pre-effective open state | Cancel transfer | Actor permitted by the configured cancellation rule | Cancelled | Cancellation actor, timestamp, reason |
| Rejected state | Request reconsideration/appeal | Actor and window defined by the configured appeal rule | Appeal pending | Original decision preserved, appeal actor/time/reason |
| Appeal pending | Decide appeal | Independent authorized reviewer | Reconsidered outcome | Reviewer, decision, timestamp, reason, link to original decision |

The final owner-approved core does not select every actor/transition in the optional branches. The cancellation, rejection, appeal and reconsideration branches must be explicitly configured before those commands are enabled. Do not expose an appeal route by inference.

### 3.3 Effective transfer transaction

On final district approval, the application transaction must:

1. Lock the member's current church-membership/transfer serialization point.
2. Recheck that the request is still open and the source church still matches the member's current primary church.
3. Recheck receiving-church acceptance and district approver authority.
4. Set the current source membership's end/effective boundary.
5. Create the receiving church membership with the district approval timestamp as its effective start.
6. Record the approved transfer outcome and effective date.
7. Append required audit evidence and outbox event in the same transaction.
8. Commit all steps atomically.

No state may be committed where the request is approved but the membership transfer is only partly applied.

### 3.4 Existing physical fields and constraints

Current canonical model:

- `church_transfer_requests`: `member_id`, `source_church_id`, `receiving_church_id`, `requested_by_user_account_id`, `status`, `requested_at`, receiving decision actor/time/text, district decision actor/time/text, `approved_effective_at`, `cancellation_reason`.
- `church_memberships`: `member_id`, `church_id`, `status`, `effective_from`, `effective_to`, `initiated_by_user_account_id`, `accepted_by_user_account_id`, `approved_by_user_account_id`, timestamps.
- A CHECK requires source and receiving church to differ.
- The FK register restricts deletion of referenced members/churches/users.
- `uq_church_memberships_current` is currently policy-blocked because the exact current-state predicate is not mapped to a canonical persisted state.
- `uq_church_transfer_requests_open_member` is currently policy-blocked because the exact open-state predicate is not mapped to canonical persisted states.

The owner-approved cardinality rules are not blocked. The exact technical predicate and status vocabulary still require mapping.

### 3.5 Transfer physical-model gaps

1. There is no dedicated transfer-decision history table in the current 70-table model. The request row has one receiving decision and one district decision field. If rejection, appeal or reconsideration can produce multiple decisions, overwriting those fields would violate the history requirement. Decide whether an append-only decision child table is needed or whether an existing approved audit/domain event model is sufficient.
2. The request row has `cancellation_reason` but no explicit `cancelled_by_user_account_id` or `cancelled_at` fields. Actor/time must be captured in durable auditable evidence; decide whether the domain record requires explicit columns.
3. The source church must be proven to be the member's current primary church at submission and again at final approval. Existing request FKs alone do not prove that cross-table business invariant.
4. `requested_by_user_account_id` must resolve to the member's own account. Application authorization must enforce this; no guardian/shared-account workflow is introduced.
5. The current-membership and open-request unique predicates must be reconciled to explicit candidate status sets before they can be approved for DDL.
6. The effective-date meaning of `approved_effective_at` must be documented as the district decision timestamp, not a user-selected/backdated date.

### 3.6 Candidate technical status vocabulary

The following semantic labels are candidates only: `SUBMITTED`, `RECEIVING_CHURCH_ACCEPTED`, `REJECTED_BY_RECEIVING_CHURCH`, `AWAITING_DISTRICT_DECISION`, `REJECTED_BY_DISTRICT`, `EFFECTIVE`, `CANCELLED`, `APPEAL_PENDING`, `RECONSIDERED`.

Do not seed these labels or use them in CHECK/partial-unique predicates until the successor lifecycle catalogue and physical registers reconcile them. In particular, the “open request” predicate must include only the states the project owner intends to block a second request.

## 4. ODR-003 — Appointment lifecycle decision sheet

### 4.1 Owner-approved core

1. Standard appointment term is 1 January through 31 December.
2. Appointment requires approval by a designated higher authority.
3. Renewal requires a fresh approval; it is not automatic.
4. No two active holders may occupy the same position in the same organizational scope at the same time.
5. Early termination requires a reason.
6. Appointment history is preserved.
7. Acting appointments, overlapping appointments and retroactive appointments are disabled in v1.
8. Appointment-derived permissions cease when the appointment ceases to be effective.
9. Self-approval is prohibited.

### 4.2 Candidate semantic lifecycle

These are semantic transitions, not approved persisted enum values:

| Current semantic state | Command | Actor / authorization | Next semantic state | Required evidence |
|---|---|---|---|---|
| No appointment request | Submit appointment request | Authorized requester under the position's scope | Awaiting higher-authority approval | Appointee, position, scope, term, request actor/time, reason |
| Awaiting approval | Approve appointment | Designated higher authority; appointee/requester cannot approve own appointment | Approved/effective according to approved start | Approver, approval timestamp, scope, term, decision evidence |
| Awaiting approval | Reject appointment | Designated higher authority | Rejected | Decision actor/time and reason |
| Effective appointment | Reach term end | System derives expiry from approved term boundary; no automatic renewal | Expired | Term boundary and expiry event/projection |
| Effective appointment | Terminate early | Authorized higher authority under the position's scope | Terminated | Termination actor/time and mandatory reason |
| Expired/terminated appointment | Renew | New request and fresh approval | New appointment record | Link to prior appointment; new annual term and fresh approval |
| Any state | Acting/overlap/retroactive exception | Not available in v1 | No transition | Feature remains disabled |

### 4.3 Calendar term and effective interval

The physical model has both:
- `term_start` / `term_end` as dates;
- `effective_from` / `effective_to` as timestamps.

Candidate interpretation for review:
- `term_start` and `term_end` identify the appointment's annual calendar term.
- `effective_from` and `effective_to` identify the actual period during which the appointment grants authority.
- `effective_to` is earlier than term end only for a reasoned early termination.
- At term end, the appointment ceases to be effective and derived grants end; no fresh term is created without a new approval.

Open technical detail: when an appointment is approved after 1 January, whether its authority starts at the approval timestamp or another explicitly approved date must be stated. No backdating is assumed. The selected rule must preserve the 1 January–31 December term without granting authority before approval.

### 4.4 Existing physical fields and constraints

Current canonical `appointments` fields include:
- `position_id`, `appointee_member_id`;
- `appointing_authority_user_account_id`, `approved_by_user_account_id`, `approved_at`;
- `term_start`, `term_end`, `effective_from`, `effective_to`;
- `status`, `appointment_reason`, `termination_reason`;
- district/scope-type/church/department scope fields in the reconciled register.

The CPERD-08 overlap contract locks the parent position row and uses half-open intervals. The CPERD-05 canonical index inventory includes the eight appointment-scope indexes. DDD-004 requires higher-authority approval and no self-approval.

### 4.5 Appointment physical-model gaps

1. The current `appointments` table requires `approved_by_user_account_id` and `approved_at` to be NOT NULL.
2. The table has no `requested_by_user_account_id` or `submitted_at`.
3. There is no separate `appointment_requests` or `appointment_decisions` table in the current 70-table inventory.
4. The lifecycle catalogue/API proposal describes submission, rejection and pending approval, but the current physical table shape appears to represent an already-approved appointment.
5. Early termination has `effective_to` and `termination_reason`, but no explicit termination actor or termination timestamp field. Audit evidence alone may not satisfy the domain history requirement unless the link is explicit and queryable.
6. The higher-authority rule requires a deterministic position/scope-to-approver mapping. The existence of an `appointing_authority_user_account_id` field does not by itself prove the actor's current authority.
7. `term_start` / `term_end` and `effective_from` / `effective_to` need non-overlapping definitions and a precise approval-after-term-start rule.
8. The overlap trigger's approved-state predicate must align with the canonical appointment lifecycle. Do not infer it from a free-text status.

**Critical incompatibility:** the current API/lifecycle proposal cannot safely create a pending appointment request in the existing `appointments` row while `approved_by_user_account_id` and `approved_at` are mandatory. The successor physical design must choose a request/decision model before the API endpoint is treated as implementation-ready.

### 4.6 Candidate technical status vocabulary

Candidate semantic labels: `PENDING_APPROVAL`, `APPROVED`, `ACTIVE`, `EXPIRED`, `TERMINATED`, `REJECTED`.

These are not approved enum values. The final persisted status and the overlap trigger's approved-state predicate must be reconciled together.

## 5. Cross-cutting audit, authorization and concurrency

### Transfer
- Member-only initiation; receiving-church authority for first decision; district authority for final decision.
- Source and target church must belong to the same district.
- Source membership must match the member's current primary church.
- One unresolved request per member.
- Final approval, membership close/open, request outcome, audit event and outbox event are one transaction.
- Rejection/cancellation/appeal must preserve prior decisions and reasons.
- No backdating by default.

### Appointment
- Requester, appointee, appointing authority and approver are distinct actor references where required.
- Approver must have higher authority within the position's exact district/church/department scope.
- No self-approval or self-grant.
- Position parent row is the overlap serialization lock.
- Approved intervals use half-open interval semantics; adjacent appointments are allowed.
- Renewal creates a fresh approved appointment record; no silent extension.
- Early termination requires reason and preserves the original appointment fact.
- Appointment-derived permission grant/revocation is audited and reconciled with the effective interval.

## 6. Decisions and design actions required

| ID | Item | Current status | Required action |
|---|---|---|---|
| TR-01 | Transfer persisted status labels | Candidate only | Select canonical labels and map each to owner-approved semantic states |
| TR-02 | Open-transfer predicate | Blocked from DDL | Define exact open states for one unresolved request per member |
| TR-03 | Transfer decision history | Gap | Decide whether append-only decision child records are required for rejection/appeal/reconsideration |
| TR-04 | Transfer cancellation actor/time | Gap | Decide explicit domain fields versus linked immutable audit/domain event |
| TR-05 | Transfer cancellation boundary | Core decided | Cancellation only before effective district approval; define which actor may cancel |
| TR-06 | Transfer appeal/reconsideration | Configurable, not enabled | Define eligible actor, time window, reviewer, decision history and terminal outcome before enabling |
| AP-01 | Appointment request persistence | Critical physical gap | Choose separate request/decision entities or an explicitly revised appointment aggregate |
| AP-02 | Appointment submission actor/time | Missing in current row | Define durable request provenance |
| AP-03 | Appointment approval actor | Partially represented | Define higher-authority resolver and prevent self-approval |
| AP-04 | Appointment termination actor/time | Missing in current row | Define explicit termination evidence and history |
| AP-05 | Annual term vs effective interval | Ambiguous | Define term dates, actual authority interval and mid-year approval behavior |
| AP-06 | Appointment status/overlap predicate | Candidate only | Select status labels and exact approved-row predicate together |
| AP-07 | Acting/overlap/retroactive appointment | Disabled in v1 | Do not add exception states or indexes |
| AP-08 | Renewal | Core decided | Fresh approval and new appointment record; no automatic extension |

## 7. Implementation boundary

- No new state values are approved for production CHECK constraints or seeds.
- No partial-unique predicate is approved by this sheet.
- No appointment request/decision table or transfer decision-history table is added.
- No existing column, FK, index or trigger is changed.
- The physical gaps above must be incorporated into a successor ERD candidate and reviewed by the project owner.
- DFR-006 remains in force.
- Implementation remains **NOT AUTHORIZED**.
