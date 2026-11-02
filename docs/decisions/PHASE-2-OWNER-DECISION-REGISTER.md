# DYMS Phase 2: Owner Decision Register

**Status:** Project-owner decision register and design baseline  
**Scope:** DYMS v1.0, Sango District  
**Branch:** `phase-1/requirements-consolidation`  
**Purpose:** Record approved DYMS product decisions, configurable policy boundaries, technical design choices and deployment-time selections.  
**Implementation status:** NOT AUTHORIZED

## 1. How to use this register

This register distinguishes DYMS product decisions from external institutional policy and deployment choices. The project owner is the final decision-maker for DYMS product behavior, scope and design. External committee or church confirmation is not a prerequisite for deciding how the software works.

For each decision:
1. Record the exact DYMS rule, owner decision date and rationale.
2. Record any external source separately when the software represents an official credential, standard or institutional decision.
3. Keep policy-bearing values configurable and versioned where no authoritative value has been selected.
4. Reconcile affected requirements, lifecycle states, physical tables and tests.

Do not invent age thresholds, credential validity periods, financial limits or official church policy. When an external value is unknown, leave it configurable or unset rather than blocking the system design.

Disposition:
- **OWNER DECISION:** Project-owner choice governs DYMS product behavior.
- **CONFIGURABLE:** The platform supports a versioned rule; values are set by authorized DYMS roles when needed.
- **IMPLEMENTATION VALIDATION:** Must be tested after separate implementation authorization.
- **DEPLOYMENT:** Requires a real provider/environment selection before deployment, not before design closure.

## 2. Decisions already approved: do not reopen without a change request

| Reference | Approved decision | Current effect |
|---|---|---|
| DFR-001–DFR-006 | Frozen architecture/security/database/operations baseline and formal design-change governance | Preserve all six decisions. Current DFR-006 status is clarified by DFR-006-GOV-CLAR-01: freeze/change control remains in force; implementation is NOT AUTHORIZED pending separate explicit owner authorization. |
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
| DDD-013 | Idempotency for sensitive mutations; actor/operation/scope binding; same-key retry behavior; conflict on changed payload; authorization rechecked | Detailed physical design approved by project owner under CPERD-01 and D13-POA-01. Implementation-time PostgreSQL/concurrency/security validation and secret-store deployment selection remain open. |
| DDD-014 | Retention schedules require an approved basis, duration, trigger, authority, action and holds; unknown periods disable automated permanent deletion | Official retention schedules and enrolled record classes remain open. |
| DDD-015 | Provider-independent notifications/integrations; consent/preferences; idempotent callbacks; payment verification; provider acceptance is not delivery | Provider selection, retry limits and operational monitoring remain open. |
| Individual member account rule | Every member has an individual USER account linked 1:1 to MEMBER; no shared, guardian-owned or guardian-managed accounts; no guardian relationship entities | Younger-member onboarding/safeguarding requirements require official policy; no age threshold is assumed. |

## 3. Domain decisions and configurable policy boundaries

The following ODR items are design decisions, not external-evidence blockers. The operative DYMS dispositions are recorded in the Phase 4 Governance and Design Closure Register. Detailed values that depend on official standards remain configurable.

#### ODR-001 — Member category eligibility and progression

**Status:** CONFIGURABLE ELIGIBILITY MODEL DECIDED  
**Official baseline:** The General Conference Youth Ministries website publishes official Adventurer, Pathfinder, Ambassador and Young Adult ministry descriptions, Pathfinder membership requirements and curriculum/resource manuals. These are the starting sources for the platform rules, not a reason to ask local authorities to recreate existing standards.  
**Responsible for confirmation:** The relevant West-Central Africa Division, Union, Nigeria Conference and district ministry authorities must identify which current General Conference materials and local adaptations govern Sango District, confirm their current versions/effective dates, and resolve any local administrative interpretation.  
**Decision authority:** The recognized ministry authority confirms the applicable standard and any authorized adaptation; the project owner records the resulting DYMS platform rule and its approved implementation implications.  
**Related:** DDD-002, member category assignments, DDD-011/ODR-009 for Master Guide credentialing.

Official starting references:
- General Conference Adventurer ministry: https://www.gcyouthministries.org/ministries/adventurers/
- General Conference Pathfinder ministry and membership requirements: https://www.gcyouthministries.org/ministries/pathfinders/ and https://www.gcyouthministries.org/ministries/pathfinders/pathfinder-club-membership-requirements/
- General Conference ministries overview, including Adventurers, Pathfinders, Ambassadors and Young Adults: https://www.gcyouthministries.org/ministries/
- General Conference Ambassador membership and Senior Youth age-group description: https://www.gcyouthministries.org/ministries/ambassadors/membership/
- General Conference resource manuals and Division-adaptation instruction: https://www.gcyouthministries.org/resources/resource-manuals/

Required confirmation from the responsible ministry authorities:
1. Identify the current General Conference curriculum, membership and eligibility documents applicable to each ministry.
2. Confirm the applicable West-Central Africa Division, Union and Nigeria Conference adaptations, if any, including document/version and effective date.
3. Confirm how the official ministry groups map to DYMS member categories. In particular, confirm whether the platform's single Senior Youth category represents both Ambassador and Young Adult ministries or requires a different domain model.
4. Confirm required evidence, verification authority and any formally authorized exception process.
5. Confirm the authority permitted to correct a historical category assignment, including required evidence and reason.
6. Confirm whether category changes require separate approval or may be completed after verification by an authorized scoped administrator.

**Important distinction:** Master Guide is treated as a leadership credential/programme, not as a member category. Its candidate eligibility and investiture requirements belong in the credential standards work under ODR-009 and must be sourced from the applicable official Master Guide curriculum and local administration rules.

**Required output:** A source-backed applicability record for each relevant ministry, listing the official source, issuing authority, version/effective date, applicable local adaptation, evidence requirements and any approved exception process. Where no local adaptation exists, record that confirmation rather than treating the General Conference material as absent.

**Do not assume:** that a local adaptation exists, that a General Conference age band is automatically the DYMS category boundary, that class completion triggers automatic promotion, or that an exception authority exists.

**Physical-design impact:** eligibility-rule references, evidence links, approval actors, effective dates, history and uniqueness of the current primary category.

#### ODR-002 — Church transfer completion, rejection and cancellation

**Status:** DYMS WORKFLOW DECIDED; EDGE RULES CONFIGURABLE  
**Decision authority:** Project owner for DYMS behavior.  
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

**Status:** STANDARD LIFECYCLE DECIDED; EXCEPTIONS DISABLED IN V1  
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: District governance authority.
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: Authorized district/church finance authority.
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: Event/attendance ministry authority.
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

**Status:** REQUEST/APPROVAL LIFECYCLE DECIDED; ELIGIBILITY CONFIGURABLE  
**Decision authority:** Project owner for DYMS behavior.  
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: Event authority for the event's scope.
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: District governance/security authority.
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: Records/administrative, district/church governance, finance and privacy/legal authorities.
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: Communications/content, privacy/consent and integration authorities.
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

**Status:** PROJECT OWNER APPROVED AS PROPOSED (2026-11-02); DELEGATED-AUTHORITY CONFIRMATION PENDING  
**Project-owner decision:** ODR-REC-01 approved as proposed on 2026-11-02. This approves the DYMS v1 product/design defaults only. It does not represent approval by the delegated authority: District reporting owner, domain data owners and security/privacy authority.
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

## 4. Technical baseline and deployment-time selections

The following engineering baseline is sufficient to complete physical design. Production provider-specific checks remain deployment gates.

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

## 6. Phase 2 design sequence

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

## 8. Project-owner decision and implementation boundary

The project owner's explicit DYMS decisions are sufficient to approve product behavior and system design. Do not request committee or third-party evidence as a prerequisite for accepting those decisions. Record external standards as source metadata when the system claims official recognition, and keep unselected values configurable.

DFR-001 through DFR-006 remain preserved. The approved conceptual ERD and CPERD-01 remain the logical and physical design baselines. Physical design approval does not authorize implementation. No Prisma schema, SQL DDL, migration, database object, generated client, seed, API or application code is authorized by this register.


## 9. Technical blocker resolution reference (2026-11-02)

[Phase 2 Technical Blocker Resolution TBR-01](../architecture/PHASE-2-TECHNICAL-BLOCKER-RESOLUTION.md) records engineering decisions that can proceed without a policy vote. These include the PostgreSQL 15 minimum design target, no required extensions, UUID/timestamp/canonical-identifier conventions, extension-free appointment overlap enforcement, attendance integrity strategy, audit role separation, and refined DDD-013 physical contracts.

The following remain OPEN until the responsible authority confirms them: ministry eligibility/credential standards; transfer exceptions; appointment lifecycle exceptions; department/event ownership; finance accounting/payment/budget policy; attendance operational modes and exceptions; department lifecycle; event capacity/waitlist exceptions; credential issuer/evidence/disclosure; audit investigation authority; retention classes/schedules/disposal; notification consent/providers; reporting catalogue/classification/exports; and production deployment/backup evidence.

The [Reporting Requirements Proposal RPT-PR-01](../product/PHASE-2-REPORTING-REQUIREMENTS-PROPOSAL.md) addresses the missing REPORT traceability group with proposed REPORT-001–REPORT-010. The IDs remain outside the approved 97-row count pending approval.

TBR-01 is a design baseline, not implementation authorization. DFR-001–DFR-006 and the separate physical-design and implementation approval gates remain unchanged.


## 10. Owner recommendation package

[Phase 2 Owner Decision Recommendations ODR-REC-01](./PHASE-2-OWNER-DECISION-RECOMMENDATIONS.md) contains proposed v1 decisions for organizational scope, finance, attendance, events, audit, retention, notifications and reporting. It does not change the OPEN status of any ODR item. Record the authority, source, effective date and exact decision before updating the canonical register.


## 11. Project-owner approval record: ODR-REC-01 (2026-11-02)

**Decision:** APPROVED AS PROPOSED by the project owner.

**Approved recommendation packages:** ODR-004, ODR-005, ODR-006, ODR-008, ODR-010, ODR-011, ODR-012 and ODR-013, exactly as written in ODR-REC-01 on the approval date.

**Approval scope:** The recommendations are accepted as DYMS v1.0 product/design defaults and may be used to continue detailed system design and physical-design reconciliation. Where a recommendation names a delegated authority, that authority's formal confirmation remains pending. This project-owner approval must not be represented as a finance committee approval, ministry standards approval, district/church governance resolution, records/privacy approval or other delegated-authority sign-off.

**Not approved by this decision:** ODR-001, ODR-002, ODR-003, ODR-007 and ODR-009 remain open for official ministry, membership, appointing or credential authority evidence. ODR-ENV-001–ODR-ENV-007 remain subject to technical/deployment-owner confirmation. The DFR-006 repository conflict remains unresolved.

**Reporting:** Candidate REPORT-001–REPORT-010 are approved for inclusion in the canonical testable requirements catalogue. Their data classification, initial report catalogue, disclosure permissions and export policy remain subject to ODR-013 delegated-authority confirmation.

**Governance boundary:** DFR-001–DFR-006 and all previously approved DDD decisions remain preserved. This approval does not approve the final physical ERD, does not satisfy independent review, and does not authorize Prisma models, SQL DDL, migrations, database objects, seeds, APIs or application code.


## 12. Current status reconciliation (2026-11-02)

This addendum supersedes earlier status wording in this register where later project-owner approvals or the DFR-006 governance clarification have changed the operative status. Historical decision text is retained for auditability.

- DFR-001–DFR-006 remain preserved. DFR-006 remains an approved formal design-freeze/change-control decision. The current operative implementation gate is NOT AUTHORIZED until a separate explicit project-owner implementation authorization is recorded. See [DFR-006-GOV-CLAR-01](./DFR-006-GOVERNANCE-CLARIFICATION-2026-11-02.md).
- CPERD-01 is project-owner approved at exact master blob SHA `6d0b47973f4e24c73409832a4986f00817805638`. This approval is for physical design, not implementation.
- DDD-013's ten-area detailed physical design review is project-owner approved under D13-POA-01. External independent technical assurance has not been performed and is not represented as complete. Required PostgreSQL, concurrency, security and operational tests remain implementation-time validation.
- ODR-REC-01 approval remains limited to project-owner v1 defaults for ODR-004/005/006/008/010/011/012/013. All named delegated-authority confirmations remain pending until evidence is recorded.
- ODR-001/002/003/007/009 are closed at the DYMS design level using configurable standards, explicit lifecycle controls and conservative v1 defaults. Official source metadata remains attachable to individual policy/credential versions.
- ODR-ENV-001–006 have design-level engineering dispositions in TBR-01; ODR-ENV-007 and provider-specific capability checks remain deployment-time selections.
- ODR-013 refers to reporting governance. It is distinct from DDD-013, which concerns idempotency and safe mutation replay.
- REPORT-001–REPORT-010 remain part of the 107-ID testable requirements baseline. Report catalogue, classification, disclosure and export authority remain pending under ODR-013.

The current consolidated closure queue is [PHASE-4-GOVERNANCE-AND-DESIGN-CLOSURE-REGISTER.md](./PHASE-4-GOVERNANCE-AND-DESIGN-CLOSURE-REGISTER.md).

## 13. Superseding project-owner decision status (2026-11-02)

This section is the current status authority and supersedes historical wording in §§3–4 and earlier status snapshots where they describe the decisions below as blocked on external confirmation.

### DYMS design decisions closed

| Decision | Current DYMS disposition |
|---|---|
| ODR-001 | Configurable, versioned category eligibility. One active primary category and permanent assignment history remain. No age threshold or automatic promotion is hardcoded. Master Guide remains a credential. |
| ODR-002 | Member-initiated transfer, receiving-church acceptance, district final approval and effective-on-approval. Preserve all decisions and reasons. One unresolved request per member. No backdating by default. Cancellation/rejection/appeal paths are explicit, auditable and configurable before enablement. |
| ODR-003 | Higher-authority appointment approval, fresh approval on renewal, 1 January–31 December term, one active holder per position/scope, reasoned early termination. Acting, overlap and retroactive exceptions are disabled in v1. |
| ODR-004 | ODR-REC-01 approved. District-owned departments; events owned by district or one church; departments may organize but not own events. |
| ODR-005 | ODR-REC-01 approved. Conservative account and transaction workflow; submitter/approver separation; payment and posting separated; partial payments and FX disabled in v1; linked full reversals. |
| ODR-006 | ODR-REC-01 approved. EVENT or SESSION subject mode; confirmed registration normally required; documented authorized exception; self-check-in and offline sync disabled; corrections audited. |
| ODR-007 | Member-requested department membership, coordinator approval, multiple memberships, withdrawal and reasoned termination. Eligibility is versioned/configurable; no automatic expiry or renewal assumption. |
| ODR-008 | ODR-REC-01 approved. Confirmed registrations consume capacity; no waitlist; late registration/capacity override require approval and reason; material changes reapproved; postponement preserves prior schedule. |
| ODR-009 | Versioned credential catalogue, recognized issuer role, evidence review, linked renewal/reissue, reasoned revocation and controlled disclosure. Only configured definitions are issuable; unknown validity periods remain unset. |
| ODR-010 | ODR-REC-01 approved. Separate Audit Officer; admin does not automatically receive audit-read; scoped access and independently approved exceptional access; break-glass disabled until a procedure is configured. |
| ODR-011 | ODR-REC-01 approved. No automated permanent deletion without an approved schedule; holds suspend disposal; business retention remains separate from DFR-005 backup retention. |
| ODR-012 | ODR-REC-01 approved. In-app baseline; verified email and approved templates; optional SMS/WhatsApp with consent; provider-independent adapters; bounded retries and audited manual replay. |
| ODR-013 | ODR-REC-01 approved. District/church/department reports only; versioned/classified definitions; authorization at request, execution and retrieval; private CSV/PDF exports; retention follows ODR-011. |

These are DYMS product decisions. They do not claim to change external church policy or issue official ministry credentials. External source metadata is attached to a rule or credential version when official recognition is asserted. Where a source or value is unknown, it remains configurable or unset.

### Technical and deployment disposition

- ODR-ENV-001–006: design-level engineering decisions are recorded in TBR-01. PostgreSQL 15 is the minimum design target; no extension is required; UUID, normalization, timestamp, FK and database-role conventions are documented.
- ODR-ENV-007: deployment topology, provider, backup product and proof of DFR-005 RPO/RTO remain deployment-time work.
- DDD-013 implementation-time PostgreSQL DDL, concurrency, security and recovery tests remain blocked only by the separate implementation authorization, not by a request for additional design approval.

### Governance boundary

The project owner's DYMS decision is sufficient to close DYMS product-design questions. Do not request external committee or third-party evidence as a prerequisite for accepting these decisions. Preserve DFR-001–DFR-006 and the separate implementation authorization gate. No Prisma schema, SQL DDL, migration, database object, seed, generated client, API, frontend/backend code, infrastructure change or deployment is authorized.
