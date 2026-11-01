# DYMS Phase 2: Owner Decision Register

**Status:** Working decision register for owner and delegated-authority review  
**Scope:** DYMS v1.0, Sango District  
**Branch:** `phase-1/requirements-consolidation`  
**Purpose:** Consolidate policy, governance, and environment decisions that prevent completion and approval of the physical database design.  
**Implementation status:** NOT AUTHORIZED

## 1. How to use this register

This register separates decisions already approved from decisions still requiring an authorized answer. It does not treat silence, a technical proposal, or the creation of this register as approval.

For each open item:
1. The named authority confirms the decision or identifies the correct decision-maker.
2. The decision is recorded with date, approver, rationale, and any supporting policy source.
3. The physical design, requirements, lifecycle catalogue, and tests are updated together.
4. An independent review verifies that the decision is reflected consistently.

Where no official rule or evidence exists, retain the item as unresolved. Do not invent age thresholds, eligibility rules, retention periods, financial limits, or church policy.

Priority:
- **P0:** Must be resolved before physical-design approval because it changes core integrity or authorization rules.
- **P1:** Required to finalize the affected domain design; it may be handled in a later decision batch if isolated from P0 constraints.
- **ENV:** Requires a deployment or technical-owner confirmation, not a ministry-policy decision.

## 2. Decisions already approved: do not reopen without a change request

| Reference | Approved decision | Current effect |
|---|---|---|
| DFR-001–DFR-006 | Frozen architecture/security/database/operations baseline and formal design-change governance | Preserve all six decisions. The repository's conflicting DFR-006 statements remain unresolved; do not silently alter them. |
| Conceptual ERD approval | Exact conceptual ERD revision `25f2813e0256d9472daded45657dfb7ac9f70a43` approved | Physical design may progress; this is not physical-design or implementation approval. |
| DDD-002 | One active primary member category; preserve category history; Adventurer, Pathfinder and Senior Youth are categories; Master Guide is a separate credential; authorized scoped administration | Eligibility criteria, age/class rules, evidence and exceptions remain open. |
| DDD-003 | Member-initiated church transfer; receiving church acceptance; final district approval; effective on approval; cancellation before effective date | Detailed cancellation, rejection, appeal and backdating rules remain open. |
| DDD-004 | Higher-authority appointment approval; fresh approval for renewal; replacement until 31 December unless formally authorized otherwise; reasoned early termination; no overlapping active holders for one position | Acting appointments, exceptional overlap, precise transitions and termination authority remain open. |
| DDD-005 | Additive grants; deny-by-default; explicit deny overrides applicable grant; approved four-role permission matrix and role-conflict classifications | Stable permission catalogue and remaining independent-role/scope mappings remain open. |
| DDD-005 follow-up | All four explicit-deny and role-conflict policy groups approved on 2026-10-31 | Do not ask the owner to reapprove the deny precedence, administration controls, role-pair classifications, or independent-review requirement. |
| DDD-006 | Member requests department membership; designated coordinator approves; multiple departments allowed; withdrawal and reasoned coordinator termination; preserve history | Department eligibility, appeals, renewal and transfer effects remain open. |
| DDD-007 | Authorized event creation; district approval before district event publication; significant changes approved/audited; cancellation with reason; preserve completed events | Local-event approval and registration/capacity edge cases remain open. |
| DDD-008 | Authorized event personnel record attendance; QR and manual entry; prevent duplicate valid attendance; preserve originals and corrections | Registration prerequisite, exact statuses, QR rules, offline sync and correction authority remain open. |
| DDD-009 | Separately owned district/church accounts; one currency per account; NGN default; decimal arithmetic; scoped access | Multiple accounts, subaccounts, FX reporting and account authority remain open. |
| DDD-010 | Submit/approve/pay/post separation; submitter cannot approve own transaction; reasoned rejection; revisions before posting; linked reversal after posting | Approval thresholds, payment/posting sequence, partial payments, returned payments and budget checks remain open. |
| DDD-011 | Controlled versioned credential catalogue; recognized issuer authority; evidence verification; linked renewals/reissues; reasoned revocation; blockchain deferred | Credential standards, eligibility, validity and disclosure authority remain open. |
| DDD-012 | Append-only audit; actor types USER/SYSTEM/SERVICE/ANONYMOUS; protected audit access; no secrets in logs | Audit access authority, security investigator roles and retention remain open. |
| DDD-013 | Idempotency for sensitive mutations; actor/operation/scope binding; same-key retry behavior; conflict on changed payload; authorization rechecked | Key format, expiry, lease and provider reconciliation details remain technical design work. |
| DDD-014 | Retention schedules require an approved basis, duration, trigger, authority, action and holds; unknown periods disable automated permanent deletion | Official retention schedules and enrolled record classes remain open. |
| DDD-015 | Provider-independent notifications/integrations; consent/preferences; idempotent callbacks; payment verification; provider acceptance is not delivery | Provider selection, retry limits and operational monitoring remain open. |
| Individual member account rule | Every member has an individual USER account linked 1:1 to MEMBER; no shared, guardian-owned or guardian-managed accounts; no guardian relationship entities | Younger-member onboarding/safeguarding requirements require official policy; no age threshold is assumed. |

## 3. Open owner and delegated-authority decisions

### P0: Core integrity and governance blockers

#### ODR-001 — Member category eligibility and progression

**Status:** AWAITING AUTHORITATIVE MINISTRY GUIDANCE  
**Responsible for supplying the rules:** The relevant Adventurer, Pathfinder, Senior Youth and Master Guide ministry authorities must provide the official eligibility, progression, class-completion and credentialing rules applicable to their respective ministries. Each authority should identify the governing source, issuing body, document/version and effective date. Where a rule crosses ministry categories, the relevant authorities should provide a coordinated interpretation.  
**Decision authority:** The relevant recognized ministry authority confirms its official rules; the project owner records the resulting DYMS platform decision and any approved implementation implications.  
**Related:** DDD-002, member category assignments, credential issuance.

Required submission from the responsible ministry authorities:
1. Official eligibility rules governing entry into and progression within Adventurer, Pathfinder and Senior Youth categories.
2. Applicable age bands, class levels, completion requirements and other criteria, where formally defined.
3. Required evidence, verification authority and any formally authorized exception process.
4. The authority permitted to correct a historical category assignment, including required evidence and reason.
5. Whether category changes require separate approval or may be completed after verification by an authorized scoped administrator.

**Required output:** A documented rule set for each relevant ministry, with authoritative source, version/effective date, responsible issuer, evidence requirements and any approved exception process. If no official rule exists for an item, the authority must state that explicitly.  

**Do not assume:** age cut-offs, class completion rules, automatic promotion, or an exception authority.

**Physical-design impact:** eligibility-rule references, evidence links, approval actors, effective dates, history and uniqueness of the current primary category.

#### ODR-002 — Church transfer completion, rejection and cancellation

**Status:** OPEN  
**Decision authority:** District/church membership governance authority; project owner confirms the DYMS workflow.  
**Related:** DDD-003, church memberships, church transfer requests.

Decisions required:
1. Who may cancel a transfer request before the effective date: only the initiating member, the receiving church, or an authorized district officer as well?
2. At what point is cancellation no longer permitted: after receiving-church acceptance, after district approval, or only after the effective date?
3. What happens when the receiving church rejects a request? Is there a reason requirement and a resubmission route?
4. What happens when the district rejects a request after receiving-church acceptance?
5. Is there an appeal/reconsideration process, and who decides it?
6. Are backdated effective dates ever allowed? If yes, who approves them and how are membership periods reconciled?
7. Is one unresolved transfer request per member the intended rule?
8. Does the transfer take effect immediately on final district approval, or at a separately approved future effective date?

**Already approved and not reopened:** member initiates, receiving church accepts, district gives final approval, approved date is the effective date, and cancellation is allowed before the effective date.

**Physical-design impact:** resolution/cancellation timestamps, decision history, uniqueness predicate for open requests, effective-date semantics and atomic membership transfer.

#### ODR-003 — Appointment lifecycle exceptions and authority

**Status:** OPEN  
**Decision authority:** District/church appointing authorities and project owner.  
**Related:** DDD-004, positions, appointments, role assignments.

Decisions required:
1. What are the exact appointment states and permitted transitions from submission through approval, activation, expiry, termination and rejection?
2. Which authority may terminate an appointment early: only the appointing authority, or also a higher authority?
3. Is a temporary/acting appointment allowed? If yes, who authorizes it, what is its maximum/defined term, and can it overlap a substantive appointment?
4. Can an appointment be approved with a future effective date?
5. Are retroactive appointments or termination dates ever allowed? If yes, who approves and what reason/evidence is required?
6. If an office holder is replaced mid-year, does the replacement always end on 31 December, or may a formally authorized appointment use another end date?
7. What authority resolves a disputed or withdrawn appointment?

**Already approved and not reopened:** higher-authority approval, fresh approval for renewal, no two active holders of the same position in the same scope, preservation of appointment history, and reasoned early termination.

**Physical-design impact:** lifecycle state machine, effective-date constraints, overlap exception model, decision history and role-grant derivation.

#### ODR-004 — Organizational ownership and scope boundaries

**Status:** OPEN  
**Decision authority:** District governance authority and project owner.  
**Related:** DDD-005, DDD-006, DDD-007, positions, departments, events, accounts, reports.

Decisions required:
1. Are departments exclusively district-owned, or may a local church own a department?
2. If church-owned departments are allowed, which authority creates, approves, transfers and closes them?
3. Which event types may be district-owned, church-owned or department-owned?
4. Which event types require district approval, and which local events require church approval?
5. May a department coordinator create/publish events within the department scope without a separate church approval?
6. Are church-scoped leadership positions allowed only within the appointing church, or can a district position have defined descendant authority?
7. Are any cross-church or cross-department assignments permitted beyond the approved role-combination cases? If yes, who grants the explicit scope?

**Already approved and not reopened:** DYMS v1.0 is Sango District only; explicit scope is required; role accumulation never widens scope; department membership alone grants no leadership authority.

**Physical-design impact:** exact scope CHECK constraints, hierarchy composite FKs, allowed owner types, role assignment scopes and report scopes.

#### ODR-005 — Finance approval, payment and budget policy

**Status:** OPEN  
**Decision authority:** Authorized district/church finance authority and project owner.  
**Related:** DDD-009, DDD-010, financial accounts, transactions, payments, reversals, budgets.

Decisions required:
1. May a church or district own multiple accounts in the same currency? Are department subaccounts permitted, or must every account belong directly to a district/church?
2. Who may open, freeze, reopen and close each account?
3. What is the required approval matrix? Are there transaction amount thresholds, multiple approvers, or different authorities by transaction type?
4. Must payment execution always follow approval? Who records posting, and is payment confirmation distinct from accounting posting?
5. Are partial payments allowed? If yes, can one transaction have multiple successful payments, and what determines when it is fully paid?
6. How are failed, returned, refunded, disputed or charged-back payments represented?
7. Is the MVP reversal policy strictly full reversal only? Can a full reversal occur after partial payment, and how is the amount reconciled?
8. Are budgets mandatory for all expenditure transactions? What happens when a transaction exceeds an approved budget line?
9. What is the approval and revision process for budgets, budget amendments and budget closure?
10. If foreign currency is enabled later, which authority supplies exchange rates and which rate/date is used for reports?

**Already approved and not reopened:** account ownership is separate by district/church; one currency per account; NGN default; decimal money; submitter cannot approve own transaction; posted corrections use linked reversals; no silent edits.

**Physical-design impact:** account owner keys, budget structure, payment rows, transaction state transitions, reversal cardinality, approval history and currency integrity.

#### ODR-006 — Attendance registration and correction rules

**Status:** OPEN  
**Decision authority:** Event/attendance ministry authority and project owner.  
**Related:** DDD-007, DDD-008, event registrations, attendance records, attendance corrections.

Decisions required:
1. Must a member have a confirmed event registration before attendance can be recorded, or is walk-in attendance allowed?
2. What exact attendance outcomes are required (for example, present, absent, excused, late or other official values)?
3. Is attendance recorded once per event, once per session, or both depending on the event configuration?
4. Who may correct an attendance record, and which authority approves the correction?
5. Is self-check-in permitted? If yes, what identity and anti-replay controls are required?
6. Should QR credentials expire after a configured time or be single-use? Who may issue/reissue them?
7. Must offline attendance capture be supported in v1.0? If yes, who validates conflicts during synchronization?
8. Can attendance be corrected after an event is completed or closed, and for how long?

**Already approved and not reopened:** authorized event personnel record attendance; QR and manual entry are permitted; duplicate valid attendance is prevented; original records and correction history are preserved.

**Physical-design impact:** registration FK nullability, attendance subject mode, status catalogue, QR token model, correction authorization and concurrency enforcement.

### P1: Domain rules required to finish affected specifications

#### ODR-007 — Department eligibility and membership lifecycle

**Status:** OPEN  
**Decision authority:** Departmental ministry coordinators and district governance authority.  
**Related:** DDD-006, department eligibility rules and department memberships.

Decisions required:
1. What eligibility requirements apply to each department?
2. Which recognized source or authority approves each eligibility rule and its version?
3. Who may reject a membership request, and must a reason be recorded?
4. Is there an appeal/reconsideration process?
5. Does department membership expire annually or continue until withdrawal/termination?
6. Is periodic renewal required, and who approves renewal?
7. What happens to department membership when a member transfers churches?
8. Who may override an eligibility failure, and what evidence/reason is required?

**Already approved and not reopened:** member requests, designated coordinator approves, multiple departments are allowed, member may withdraw, authorized coordinator may end membership with reason, and history is preserved.

**Physical-design impact:** eligibility rule versions, membership lifecycle, review history, effective dates and uniqueness rules.

#### ODR-008 — Event registration, capacity and schedule exceptions

**Status:** OPEN  
**Decision authority:** Event authority for the event's scope.  
**Related:** DDD-007, events, event approvals, event registrations and event sessions.

Decisions required:
1. Is registration mandatory for each event type, optional, or disabled?
2. Which registration statuses consume capacity?
3. Are waitlists permitted? If so, how are places offered and released?
4. Who may approve late registration or override capacity?
5. Can registration reopen after the deadline, and who authorizes it?
6. What changes require renewed approval: date, venue, capacity, event owner, cost or other material fields?
7. Is postponement a distinct event state/action, or is it an approved event change with new dates?
8. Who may reopen a completed/closed event for corrections or reporting?

**Already approved and not reopened:** coordinators set deadlines/capacity; significant changes require approval and audit; cancellation requires an authorized event authority and reason; completed events are retained.

**Physical-design impact:** capacity counter semantics, registration state predicates, event change records, approval stages and event/session lifecycle.

#### ODR-009 — Credential standards, issuer authority and disclosure

**Status:** OPEN  
**Decision authority:** Recognized Adventurer, Pathfinder, Senior Youth and Master Guide credentialing authorities; project owner confirms platform controls.  
**Related:** DDD-011, credential definitions, versions, issuances and evidence.

Decisions required:
1. Which credentials are in the initial DYMS catalogue, and which authority owns each definition?
2. What are the official requirements, evidence types, assessment/verification process and authorized issuers?
3. Which credentials expire, and what official validity period applies?
4. What are the authorized grounds and process for revocation?
5. Who may correct a credential record or issue a replacement certificate?
6. What information may be disclosed during internal verification, and to whom?
7. Which evidence is sensitive and who may view or export it?
8. What official records-retention rules apply to evidence and issued credentials?

**Already approved and not reopened:** versioned catalogue, recognized issuer authority, evidence verification, linked renewal/reissue, reasoned revocation, preservation of history, and blockchain verification deferred.

**Physical-design impact:** issuer scope, credential definition/version, evidence metadata, validity dates, revocation history and disclosure permissions.

#### ODR-010 — Audit access and investigation authority

**Status:** OPEN  
**Decision authority:** District governance/security authority and project owner.  
**Related:** DDD-012, audit events and audit-access events.

Decisions required:
1. Which named office/role is authorized to administer audit access?
2. Which role(s) may view ordinary audit records, and which may view security-sensitive events?
3. Who authorizes an investigation and grants temporary exceptional access?
4. Must exceptional access receive prior approval, or is emergency break-glass access with retrospective review permitted?
5. What is the maximum duration and required review evidence for emergency access?
6. Who independently reviews audit exports and exceptional-access records?
7. Which users may request an audit report about their own activity, and what disclosure limits apply?

**Already approved and not reopened:** audit access is deny-by-default and separately permissioned; reading audit records is distinct from ordinary administration; audit reads/exports and exceptional access are themselves audited; ordinary users cannot modify/delete audit history.

**Physical-design impact:** audit permission catalogue, reviewer/approver actor rules, exceptional-access workflow and export audit history.

#### ODR-011 — Retention record classes, legal basis and disposal authority

**Status:** OPEN — P0 for retention implementation  
**Decision authority:** Records/administrative authority, district/church governance, finance authority for financial records, and qualified legal/privacy advice where applicable.  
**Related:** DDD-014, retention policies, subjects, holds and actions.

Decisions required:
1. Which DYMS record classes are subject to formal retention schedules?
2. For each class, what authoritative source or legal/organizational basis establishes retention?
3. What is the approved retention duration, trigger event and required end action?
4. Who approves and versions each schedule?
5. Who may issue, approve, release and review a legal/investigation hold?
6. Who authorizes anonymization or permanent deletion, and must approval be independent?
7. What evidence of disposal must be retained?
8. Are financial, membership, attendance, appointment, credential, audit, authentication and evidence records subject to different schedules?
9. Which attachments inherit their parent record's schedule, and which need a separate schedule?

**Already approved and not reopened:** no arbitrary duration; unknown/unapproved duration disables automated permanent deletion; holds suspend disposal; financial posted transactions are corrected by reversal, not deletion; historical/audit records are not silently erased.

**Physical-design impact:** source-table enrollment, one-to-one subject FKs, schedule versions, hold/action approvals and disposal evidence. Do not add source FKs until record classes and scope are approved.

#### ODR-012 — Notifications, consent and provider operations

**Status:** OPEN  
**Decision authority:** Project owner, communications/content authority, privacy/consent authority and integration administrator.  
**Related:** DDD-015, notification preferences, templates, deliveries, providers and webhooks.

Decisions required:
1. Which channels are enabled at initial launch: in-app, email, SMS, WhatsApp?
2. Which messages are essential service notices and which are optional communications?
3. What consent is required for each optional channel, and how is withdrawal recorded?
4. Who approves message templates and localized content?
5. Which provider(s) are selected for email, SMS, WhatsApp and payment processing?
6. What are the approved retry ceiling, retry intervals, alert thresholds and dead-letter review authority?
7. Who may manually replay or resolve a failed integration?
8. What delivery evidence and provider callback data are retained?

**Already approved and not reopened:** provider-independent adapters; notification failure does not undo the business action; callback/idempotency and webhook security controls; provider acceptance is not delivery; optional channel consent is required.

**Physical-design impact:** provider catalogue, consent history, notification template approval, delivery attempts and integration failure controls.

#### ODR-013 — Reporting scope, classification and export governance

**Status:** OPEN  
**Decision authority:** District reporting owner, data owners for each domain, security/privacy authority and project owner.  
**Related:** report definitions, report runs and report export audits.

Decisions required:
1. Which reports are required for the first release?
2. Which reports contain ordinary, confidential or sensitive personal/financial information?
3. Who approves report definitions and each version?
4. Are reports permitted at district, church and department scope? Which roles can request each scope?
5. Are global reports allowed in a Sango District-only system, or must every report be bound to a district descendant scope?
6. Who may export reports, for which purposes, and which formats are permitted?
7. What is the approved export expiry and retention rule?
8. Must report outputs be redacted or aggregated for particular roles?

**Already approved and not reopened:** authorization is rechecked at request, execution and export retrieval; report parameters cannot widen scope; exports are protected and audited.

**Physical-design impact:** report scope discriminator, composite scope FKs, classification catalogue, approval actors, export expiry and retention.

## 4. Environment and technical-owner confirmations

These are not ministry-policy choices. The responsible technical/deployment owner must provide evidence or an explicit decision.

| ID | Status | Confirmation required | Why it matters |
|---|---|---|---|
| ODR-ENV-001 | OPEN | Production PostgreSQL major version and managed service/provider | Determines supported constraints, extensions, trigger behavior, collation and operational privileges. |
| ODR-ENV-002 | OPEN | Whether `btree_gist` and other required extensions are permitted | Appointment overlap enforcement and other compatibility-sensitive constraints. |
| ODR-ENV-003 | OPEN | UUID generation strategy: application-generated UUIDs or approved database function | Consistent defaults and portability across environments. |
| ODR-ENV-004 | OPEN | Database collation/locale and case/Unicode normalization policy for login identifiers | Predictable uniqueness and identity lookup. |
| ODR-ENV-005 | OPEN | Timestamp authority: application-supplied UTC timestamps or database `CURRENT_TIMESTAMP`, including update-time policy | The eight normalized timestamp columns currently have no selected default. |
| ODR-ENV-006 | OPEN | Managed database role/privilege model for append-only audit, triggers, migrations, backups and restore tests | Required controls must be enforceable in the target environment. |
| ODR-ENV-007 | OPEN | Production deployment topology and backup/restore evidence for the approved DFR-005 RPO/RTO | Validates operational targets without changing their approved values. |

## 5. Technical design work that does not require a policy vote

The following can proceed as design work while owner decisions are pending, provided the open policy boundaries remain explicit:
- Complete the per-column type, nullability and default register using only fields already grounded in the canonical definitions.
- Identify columns whose definitions remain absent or ambiguous and record them as gaps, not guessed nullable fields.
- Review FK action policy table by table and document any proposed exception to RESTRICT/RESTRICT.
- Perform exact index redundancy analysis using the full 190-index proposal catalogue; do not remove an index merely because another index appears similar without checking key order, predicate and workload.
- Expand all named FK constraints with stable names and exact ordered source/target columns.
- Specify attendance enforcement alternatives and their concurrency trade-offs without selecting a database-specific implementation before PostgreSQL confirmation.
- Reconcile the role-conflict and audit actor CHECK contracts with approved policy.
- Prepare a test traceability matrix for each approved integrity rule and each policy-dependent blocker.

## 6. Recommended decision sequence

| Sequence | Decision group | Why this order |
|---|---|---|
| 1 | ODR-001 category eligibility; ODR-002 transfers; ODR-003 appointments | These affect member, membership and authorization integrity. |
| 2 | ODR-004 organizational scope | Scope hierarchy controls positions, departments, events, accounts, access and reports. |
| 3 | ODR-005 finance | Finance constraints depend on approved account ownership, payment and reversal policy. |
| 4 | ODR-006 attendance; ODR-008 event registration | These determine attendance FKs, uniqueness and capacity concurrency. |
| 5 | ODR-007 department membership; ODR-009 credentials | These complete the remaining ministry domain rules. |
| 6 | ODR-010 audit; ODR-011 retention | Retention enrollment must follow approved record classes and authority. |
| 7 | ODR-012 notifications; ODR-013 reporting | These close integration and data-export governance. |
| 8 | ODR-ENV-001–007 | Confirm environment before selecting PostgreSQL-specific implementation mechanisms. |

## 7. Decision recording template

For every approved or rejected item, add:
- Decision ID and exact question.
- Final decision text.
- Decision authority and approver.
- Approval date.
- Rationale and source policy/evidence.
- Affected requirements, conceptual entities, physical tables, constraints, indexes and tests.
- Whether a formal design change request is required under DFR-006.
- Implementation authorization status (must remain NOT AUTHORIZED until separately granted).

## 8. Approval boundary

This register does not itself approve any open policy question. A reply approving one package must be mapped to the exact decision IDs and recorded before changing the canonical physical design.

DFR-001 through DFR-006 remain preserved. The approved conceptual ERD remains the logical source. Physical database design is not approved for implementation. No Prisma schema, SQL DDL, migration, database object, generated client, seed, or application code is authorized by this register.
