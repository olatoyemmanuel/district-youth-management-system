# DYMS CPERD-16 — Final Engineering Design Recommendations and Change-Impact Record

- Revision: CPERD-16
- Date: 2026-11-11
- Repository: olatoyemmanuel/district-youth-management-system
- Branch: phase-1/requirements-consolidation
- Status: **ENGINEERING RECOMMENDATIONS RECORDED; SUCCESSOR ERD AND OWNER APPROVAL REQUIRED**
- Governing decisions: DFR-001–DFR-006; CPERD-01; D13-POA-01; Phase 4 GDC-01; ODR-REC-01
- Implementation: **NOT AUTHORIZED**

## 1. Purpose

This record consolidates the remaining material engineering recommendations needed to prepare one coherent successor physical-design package. It is deliberately not another general architecture specification. It resolves contradictions where existing owner-approved product rules are sufficient, identifies the minimum physical changes required, and separates design closure from provider-specific implementation verification.

This record is a DFR-006 change-impact proposal. It does not amend CPERD-01, the canonical registers, or any owner-approved decision. All proposed physical changes remain subject to the project owner's approval of the exact successor package.

## 2. Binding authority and scope

The following are treated as fixed inputs, not reopened:

1. DFR-001–DFR-006 remain approved. DFR-006 change control remains in force.
2. CPERD-01 remains owner-approved only at exact blob SHA `6d0b47973f4e24c73409832a4986f00817805638`.
3. D13-POA-01 records owner approval of all ten DDD-013 physical review areas. It does not represent external independent assurance.
4. Phase 4 GDC-01 §§4–5 and the current Owner Decision Register govern DYMS product behavior. External institutional confirmation is not a prerequisite for accepting these product defaults.
5. Every member has an individual account linked one-to-one to a member. No guardian-owned, shared or guardian-managed login is introduced.
6. Federation access is oversight-only and read-only across authorized districts. It cannot perform district or church operations, approve appointments or finance, or mutate source records.
7. Districts manage their own churches, members, departments, events and district-scoped workflows. A district cannot read another district's operational data.
8. Blockchain credential anchoring and public on-chain verification are deferred.
9. Rate limiting, server-side authorization, scope enforcement, auditability, idempotency for sensitive mutations and financial separation of duties remain mandatory.
10. No application code, Prisma schema, SQL DDL, migrations, database objects, seeds, implementation tests or deployment resources are authorized.

## 3. ODR-002 — Church transfer: recommended v1 disposition

### 3.1 Canonical semantic lifecycle

Use the following persisted status vocabulary for the owner-approved core:

| Status | Meaning | Next permitted action |
|---|---|---|
| PENDING_RECEIVING_CHURCH | Member has submitted a transfer request | Receiving church accepts or rejects; requester may cancel |
| PENDING_DISTRICT | Receiving church accepted | District gives final approval or rejection; requester may cancel |
| COMPLETED | District approval and membership transfer committed atomically | Terminal |
| REJECTED | Receiving church or district rejected with reason | Terminal |
| CANCELLED | Requester cancelled before district approval | Terminal |

The district approval is the effective event. There is no separate delayed-effective or backdated state. The district decision, source-membership end, receiving-membership creation, request completion, audit event and outbox event commit in one transaction.

### 3.2 Actor and decision rules

- Only the member linked to the individual account may initiate the request.
- The receiving church's authorized membership authority records the receiving decision.
- A district-authorized membership authority records the final decision.
- The requester may cancel while the request is pending and before district approval. Cancellation requires actor, timestamp and reason.
- Rejection is terminal in v1. Appeal, reconsideration and reopening are disabled until a separate approved workflow exists.
- One unresolved request per member is enforced using the exact pending states above.
- The source church must equal the member's current primary church at submission and must be rechecked at final approval.
- Source and receiving churches must belong to the same district as the request.
- No user-selected effective date is accepted. The district approval timestamp is the effective timestamp.
- No request or decision is deleted. Rejected and cancelled requests remain historical records.

### 3.3 Minimum physical delta recommended

Retain the existing `church_transfer_requests` aggregate and its single receiving and district decision fields. Do not add a decision-history child table for v1: each stage has at most one decision, rejection is terminal, and reconsideration is disabled. Preserve every transition in the immutable, resource-linked audit event stream.

Add:
- `cancelled_by_user_account_id` UUID nullable FK to `user_accounts(id)`;
- `cancelled_at` timestamptz nullable;
- a CHECK requiring cancellation actor, timestamp and non-empty reason to be all present or all absent.

Retain `cancellation_reason`. Add or verify composite district-scope FKs so the source and receiving churches are in the request district. Enforce requester-is-member and current-primary-church conditions in the authorized transaction because they are cross-row/user-identity invariants.

Canonical unique predicate for one unresolved request:
`status IN ('PENDING_RECEIVING_CHURCH', 'PENDING_DISTRICT')`.
This replaces the current unresolved placeholder predicate. The index remains a design candidate until the successor register and owner approval are complete.

## 4. ODR-003 — Appointment: recommended v1 aggregate correction

### 4.1 Chosen model

Retain `appointments` as the single lifecycle aggregate. Do not add separate `appointment_requests` or `appointment_decisions` tables for v1.

The current table already represents the position, appointee, appointing authority, term, effective interval and appointment outcome. Its defect is that it requires approval fields before an appointment can be submitted and lacks request and termination provenance. Correct the row lifecycle instead of duplicating the aggregate across new tables.

### 4.2 Required physical delta

Add:
- `requested_by_user_account_id` UUID NOT NULL FK to `user_accounts(id)`;
- `submitted_at` timestamptz NOT NULL;
- `rejected_by_user_account_id` UUID nullable FK to `user_accounts(id)`;
- `rejected_at` timestamptz nullable;
- `rejection_reason` text nullable;
- `terminated_by_user_account_id` UUID nullable FK to `user_accounts(id)`;
- `terminated_at` timestamptz nullable.

Retain `approved_by_user_account_id` and `approved_at`, but make them nullable while PENDING_APPROVAL or REJECTED. They are mandatory for APPROVED and TERMINATED. Rejection uses its own actor/time/reason fields, all mandatory for REJECTED and all NULL otherwise. `appointing_authority_user_account_id` remains the designated authority reference and is not proof by itself that the acting approver has current authority.

A single terminal decision is allowed for each submitted appointment request. Rejected requests remain as rows. Renewal creates a new appointment row with a new request lifecycle and fresh approval. No automatic extension, acting appointment, overlapping holder or retroactive appointment is enabled.

### 4.3 Canonical appointment lifecycle

| Status | Meaning | Required metadata |
|---|---|---|
| PENDING_APPROVAL | Submitted and awaiting designated higher authority | requester, submitted_at, proposed position/appointee/scope/term |
| APPROVED | Higher-authority approval recorded; appointment is effective according to its approved interval | approved_by, approved_at, effective_from |
| REJECTED | Higher authority rejected the request | rejected_by_user_account_id, rejected_at, non-empty rejection_reason |
| TERMINATED | Previously approved appointment ended early | terminated_by, terminated_at, termination_reason |
| Expired (derived) | Approved appointment's effective interval has ended | No persisted EXPIRED status is required; authority is inactive when the evaluation instant is outside the effective interval |

Do not use a generic status alone to determine permission. Appointment-derived grants are valid only when the appointment is approved, its effective interval contains the evaluation instant, and the underlying role mapping and scope remain valid.

### 4.4 Authority and concurrency rules

- The requester cannot approve their own request.
- The appointee cannot approve their own appointment.
- Approver authority is resolved server-side against an active higher-authority appointment/permission in the same district and exact position scope.
- Lock the parent `positions` row before the overlap check.
- The no-overlap invariant applies only to approved appointments with an effective interval that intersects the candidate interval. Use half-open intervals [start, end); adjacent intervals are allowed.
- Position, district and scope identity are immutable after approval. A changed appointment requires a new request.
- Early termination records actor, time and non-empty reason. The appointment fact and its audit history remain preserved.
- The annual term (1 January–31 December) is a calendar entitlement period. The effective interval is the actual period in which the approved appointment confers authority. Approval cannot grant authority before approval time or outside the approved term. The district timezone is Africa/Lagos for local calendar interpretation; persisted instants remain timestamptz/UTC.
- If an appointment is approved before its term begins, effective_from is the term start instant in Africa/Lagos. If approved after term start, effective_from is approved_at. effective_to cannot exceed the end boundary of the approved term and may be shortened by an authorized termination.

### 4.5 Audit and history

Every submission, approval, rejection, termination and expiry transition emits an immutable audit event containing resource type/id, actor, action, event time, reason where applicable, and before/after state reference. Audit events supplement explicit domain provenance; they do not replace the requester, decision and termination columns.

## 5. ODR-005 — Finance: conservative v1 workflow

The following is the recommended canonical workflow, consistent with the owner-approved conservative defaults:

1. Create a draft transaction under exactly one financial account and its account currency.
2. Submitter submits the transaction. Submission freezes the submitted revision and records actor/time.
3. An authorized approver reviews it. The submitter cannot approve their own transaction.
4. Rejection records actor/time/reason and leaves the rejected transaction historical.
5. Approval authorizes the transaction but does not mean payment has occurred.
6. A single full payment is recorded. Partial payments and multiple successful payments are disabled.
7. Payment/provider confirmation is independently verified. Provider acceptance alone is not settlement.
8. Posting is a separate controlled action by an authorized actor. The posting record references the approved transaction and verified payment evidence where payment is required by transaction type.
9. A posted transaction is immutable. Correction requires one linked full reversal in the same account and currency. At most one full reversal is permitted.
10. Budget availability is checked in the same transaction as approval/posting when the approved budget rule applies. No budget override is enabled in v1.
11. All approval, payment, posting and reversal actions are audited and idempotent where duplicate delivery or retries could create a second financial effect.

Disabled in v1: partial payments, multiple successful payments, foreign exchange, refunds, budget exceptions, amount-based approval thresholds and unconfigured payment providers. NGN is the district default, but every account and transaction retains an explicit currency. Do not invent debit/credit sign semantics or a universal amount-positive CHECK until the accounting convention is selected.

## 6. CPERD-07 — Logical database security disposition

The logical database role families are accepted as the design target:

- non-login object owner;
- tightly controlled migration identity;
- API runtime identity;
- asynchronous worker identity;
- read-only reporting identity;
- separately authorized audit-reader identity;
- restricted backup/restore identity;
- narrow append-only audit writer path.

The runtime and worker identities must not own schema objects, manage roles, execute unrestricted DDL, truncate append-only evidence or bypass approved trigger/function controls. Reporting is read-only against approved reporting views/read models. Application authorization remains authoritative for user, role, appointment, scope and separation-of-duties checks. Database grants provide a second technical boundary.

RLS is not selected. Do not add it without a separate connection-pool actor-context and bypass design.

Provider-specific LOGIN/NOLOGIN attributes, exact schema/table/column/function grants, backup privileges, managed-service capabilities and restore proof are deployment/implementation verification items. They are not reasons to invent provider-specific grants before the provider is selected. CPERD-07 can be closed at logical design level only; it cannot be called provider-certified or privilege-tested.

## 7. CPERD-08 — Trigger and transaction disposition

Use the following trigger/transaction contracts in the successor register:

| Contract | Final design rule | Enabled in v1 |
|---|---|---|
| Appointment overlap | BEFORE INSERT/UPDATE guard; lock position parent; evaluate only APPROVED appointments; half-open interval; deny trigger bypass | Yes |
| Attendance subject mode | Lock event-attendance subject; EVENT means no session; SESSION means same-event session required; immutable identity; canonical unique guard | Yes |
| Event capacity | Lock event parent; confirm registration and reserve capacity atomically; only CONFIRMED consumes capacity; no waitlist; override requires separate approval and reason | Yes |
| Updated timestamps | Database-owned timestamp on the nine registered mutable tables; callers cannot backdate | Yes |
| Append-only evidence | Runtime/worker cannot UPDATE, DELETE or TRUNCATE audit events, audit-access events or idempotency recovery events; narrow append path only | Yes |
| Finance full reversal | Lock original posted transaction; same account/currency; unique original full reversal; immutable original | Yes |
| Idempotency fencing | Atomic claim, monotonically increasing fencing counter, stale worker rejection, overflow fail-closed | Yes |
| Transactional outbox | Business state and outbox event commit together; at-least-once delivery; deduplicate by stable event identity | Yes |
| Retention disposal | Recheck enrollment, approved schedule and active holds under subject lock; record approval and action | No, destructive disposal disabled until source/schedule configuration exists |
| Credential validity | Validate definition/version policy in the approval transaction; never infer cross-table validity from a row CHECK | Yes, when a credential definition is configured |

Every multi-row workflow must document its exact lock order and retry policy. Redis/BullMQ is scheduling/delivery infrastructure only. PostgreSQL is the durable source of truth. Deadlock retries are bounded and must not repeat external side effects.

The CPERD-08 static contract can be closed after the successor trigger register contains, for each trigger/function: stable name, target table, timing, event, row/statement scope, function, execution identity, lock target/order, predicate, failure outcome and bypass controls. Runtime tests remain post-authorization.

## 8. API contract decisions

The API catalogue remains REST under `/api/v1`. Apply these rules to every endpoint:

- Explicit request and response schema, including required/optional fields, validation, stable IDs and timestamps.
- Authentication class, permission code, organization scope, ownership and separation-of-duties requirement.
- Lifecycle precondition and allowed transition.
- Actor attribution and audit event.
- Idempotency/deduplication behavior for sensitive mutations.
- Rate-limit profile and abuse controls.
- Stable error code and HTTP status.
- Private file/export storage and authorization recheck at retrieval.
- OpenAPI contract tests after implementation authorization.

Federation endpoints are read-only cross-district oversight endpoints. They expose aggregate/reporting views only within assigned federation scope. They must not expose operational write routes or member-level sensitive evidence by default. Federation users cannot approve or mutate district appointments, finance, membership, attendance, credentials or church records.

Appointment API commands must use the single `appointments` lifecycle aggregate: submit, approve, reject, terminate, list and retrieve. Transfer API commands must use the canonical transfer states in §3. Remove any route that implies delayed transfer completion after district approval.

## 9. Reporting, retention and credential configuration

- CPERD-12's 15 retention candidate classes are sufficient for design inventory. No retention schedule, source link or destructive action is approved by this record.
- CPERD-13's 14 report candidates remain the initial report catalogue proposal. Each report definition must have an accountable owner role, scope, classification, purpose, field minimization, export permission, expiry and audit policy before activation. The current single-owner relationship is retained for v1; cross-domain report owners are represented by a designated accountable owner, with consultation recorded in approval metadata rather than adding a many-to-many schema without need.
- CPERD-14's evidence matrix remains the source of truth for credential source metadata. Eligibility is versioned/configurable; no age thresholds or credential validity periods are invented. Master Guide remains a credential, not a member category. Progressive classes and honors are distinct from membership categories.
- Consent evidence for minors must not create guardian accounts. A member's individual account rule remains unchanged. Any external parent/guardian consent process is an evidence/authorization workflow, not a login identity.
- Credentials remain off-chain and are issued only from configured definitions by authorized issuers after evidence review.

## 10. Cross-register changes required for successor package

The successor CPERD must reconcile all of the following atomically:

1. Add the five appointment provenance/termination columns and revise nullability/transition constraints in `appointments`.
2. Add transfer cancellation actor/time columns and their paired-presence constraint.
3. Replace the appointment overlap predicate with the approved appointment status and effective interval semantics.
4. Replace the open-transfer placeholder predicate with the two pending states in §3.
5. Reconcile appointment and transfer status catalogues, lifecycle catalogue and API command descriptions.
6. Update column, FK, index and CHECK/trigger registers, including supporting indexes for every new FK.
7. Reconcile the 107 requirement mappings without losing or duplicating any ID.
8. Reconcile CPERD-07 logical role model and CPERD-08 exact trigger/function metadata.
9. Reconcile finance transaction/payment/reversal states and audit/outbox transaction boundaries.
10. Reconcile Phase 4 governance register, DDD register, API catalogue and approval manifest.
11. Regenerate exact Git blob hashes for every artifact in the owner-review package.
12. Preserve CPERD-01 and all prior approval artifacts unchanged.

No new table is recommended for v1 appointment requests or transfer decision history. This minimizes schema growth while preserving complete domain history through explicit provenance columns and immutable resource-linked audit events.

## 11. Engineering disposition and remaining gates

| Area | Engineering disposition | Remaining gate |
|---|---|---|
| Owner product defaults ODR-001–013 | Applied as binding design inputs | None requiring new owner policy decisions |
| Transfer lifecycle | Canonical v1 states and actor rules recommended | Successor ERD/register reconciliation |
| Appointment lifecycle | Single aggregate corrected; five-column physical delta recommended | Successor ERD/register reconciliation |
| Finance | Conservative workflow defined; advanced features disabled | Reconcile exact existing payment/approval/reversal columns and states |
| Database security | Logical least-privilege design complete | Provider-specific grants and evidence after provider selection |
| Trigger/transaction | Contract rules defined | Exact metadata and static cross-register verification |
| Reporting | Initial catalogue and owner model defined | Per-report configuration before activation |
| Retention | Candidate enrollment inventory complete | Approved schedules/source enrollment before disposal |
| Credentials | Versioned configurable catalogue defined | Source/version selection before issuing specific credentials |
| API | Contract rules defined | Endpoint-by-endpoint schemas and traceability in successor API contract |
| Deployment | DFR-005 objectives preserved | Provider/topology/backup evidence at deployment |
| DDD-013 | Owner-approved design | Independent assurance not performed; implementation validation post-authorization |

The design is not ready to be represented as a final successor physical schema until the cross-register successor package is generated and statically checked. Provider-specific and runtime verification are explicitly post-authorization or deployment gates, not reasons to keep expanding design documents indefinitely.

## 12. Owner review boundary

The project owner retains final approval authority. This recommendation record does not approve its own physical changes. The owner-review package must identify the exact successor ERD revision, every supporting register hash, the change-impact summary and explicit exclusions. Approval must name the exact manifest/package hash.

Implementation remains **NOT AUTHORIZED** unless and until the project owner separately authorizes it.


## 13. Logical role and authority map

This is the application-level authority map. It is deliberately separate from PostgreSQL connection roles. The exact permission codes must map to the approved DDD-005 deny-by-default, explicit-deny and role-conflict model. A role name alone never grants access outside its assigned organizational scope.

| Capability role family | Scope | Permitted authority | Explicit restriction / separation |
|---|---|---|---|
| Federation Oversight Reader | Assigned federation and its districts | Read aggregate oversight reports and permitted activity summaries | Read-only; no member, church or district mutation; no appointment, finance or credential approval |
| District Organization Administrator | One district | Maintain district organization catalogue and local-church records | Cannot act outside own district; cannot bypass appointment or finance approval |
| District Membership Authority | One district | Final transfer decision, membership administration and category administration | Cannot initiate a transfer on behalf of a member; member self-service remains account-bound |
| Church Membership Authority | One church | Review receiving-church transfer decisions and local membership records | Cannot give final district transfer approval |
| Department Coordinator | Assigned district department | Review department membership requests and organize permitted events | Department membership does not confer leadership authority; department does not own events |
| Member | Own member/account identity | Read/update permitted own profile and initiate own transfer | Cannot impersonate another member or submit actor/scope identifiers as authority |
| Appointment Requester | Exact position scope | Submit an appointment request for an eligible appointee | Cannot approve own request or self-appoint |
| Higher Appointment Authority | Exact position scope and higher-authority relationship | Approve/reject appointment and authorize early termination | Must be higher authority in the same scope; cannot approve own appointment or appointee-self approval |
| Finance Preparer | One district/church account scope | Prepare and submit transaction/budget | Cannot approve own transaction or post own transaction where separation applies |
| Finance Approver | One account/budget scope | Approve/reject independently | Submitter cannot approve; independent approval required |
| Payment Officer | One account scope | Initiate approved payment and reconcile provider evidence | Payment initiation is not posting; provider acceptance is not settlement |
| Posting Officer | One account scope | Post verified approved transaction or approved reversal | Separate from submitter and approval actor under the finance separation model |
| Audit Officer | Explicit authorized audit scope | Search/read permitted audit evidence and investigation records | System Administrator receives no automatic audit-read; exceptional access independently approved |
| Records Authority | Approved record-class scope | Propose/approve schedules, place/release holds and request disposal | No permanent disposal without approved schedule, enrolled source and independent approval |
| Credential Catalogue Editor | Configured credential catalogue scope | Propose definition/version changes | Cannot issue credentials solely by catalogue-edit permission |
| Credential Evidence Verifier | Configured issuer/source scope | Verify submitted evidence | Separate from requester; evidence access is minimized and audited |
| Credential Issuer | Configured credential/source scope | Issue, renew/reissue or revoke a configured credential | Issuer authority is explicit and scoped; unknown standards/validity remain unset |
| Report Data Owner | One report definition/domain | Approve report purpose, source fields, classification, scope and disclosure | One accountable owner per report in v1; consultation with other domains is recorded |
| Report Operator | Authorized district/church/department scope | Request, run and retrieve permitted reports/exports | Authorization is rechecked at request, execution and retrieval; exports are private and expiring |
| System Administrator | Platform administration scope | Manage platform configuration and technical operations | No automatic business approval, finance authority, membership authority or audit-read permission |

### 13.1 Separation-of-duties invariants

- The actor who submits a financial transaction cannot approve it.
- Payment initiation, verification/reconciliation and posting are distinct actions with separately authorized actors.
- A requester/appointee cannot approve their appointment.
- A transfer requester cannot make the receiving-church or district decision.
- A credential requester/evidence submitter cannot self-verify or self-issue where independent verification is required.
- A report requester does not become its data owner or disclosure approver.
- An audit subject cannot approve their own exceptional audit access.
- A retention initiator cannot independently approve destructive disposal.
- System administration does not imply domain authority or audit-read.

This map defines capability families, not a new role catalogue seed. Existing DDD-005 role-pair classifications and explicit-deny precedence remain authoritative. Exact role-to-permission assignments are generated only from those approved records and must be checked against the target resource scope at every protected operation.
