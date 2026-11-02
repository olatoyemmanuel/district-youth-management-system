# DYMS Domain-Driven Design (DDD) Decision Register

**Project:** District Youth Management System (DYMS)  
**Scope:** v1.0, Sango District  
**Status:** Canonical domain decision register; reconciled against the reviewed repository evidence  
**Working branch:** `phase-1/requirements-consolidation`  
**Register owner:** DYMS Engineering, with policy decisions reserved to the competent ministry, district, finance, security, records, or project authority  
**Implementation authorization:** **NOT AUTHORIZED**  
**Physical database design approval:** **NOT GRANTED**

## 1. Purpose and authority

This is the canonical register for domain decisions DDD-001 through DDD-015. It consolidates the approved domain principles, the limits of each approval, unresolved operational policy, source evidence, requirement traceability, and the authority responsible for closing each open matter.

This register is separate from `DECISION-REGISTER.md`, which remains the canonical Architecture Decision Register for DFR-001 through DFR-006. DDD identifiers must not be merged with or substituted for DFR identifiers.

The register is a governance and design record. It does not:
- amend or lift DFR-001 through DFR-006;
- approve a policy detail merely because it appears in a requirements document;
- change the approved conceptual ERD;
- approve the physical database design;
- authorize SQL DDL, Prisma models, migrations, database objects, seeds, APIs, generated clients, or application code.

### 1.1 Evidence and status rules

The register distinguishes the approval of a domain principle from approval of every operational detail within that domain.

| Status | Meaning |
|---|---|
| **APPROVED PRINCIPLE / OPEN DETAIL** | The core domain rule is recorded as approved. One or more operational, policy, or technical details remain open. |
| **APPROVED** | The exact decision scope has an explicit approval record. This status must not be extended beyond that scope. |
| **PROPOSED / POLICY-DEPENDENT** | A requirement or design proposal exists, but competent-authority approval is not evidenced. It must not be treated as a binding rule. |
| **EVIDENCE GAP** | The repository does not contain sufficient exact approval wording, approver, date, or source evidence to independently establish the decision. |
| **SUPERSEDED** | A later, explicitly approved decision replaces the identified earlier decision. No DDD item is marked superseded in this initial register. |
| **REJECTED** | The competent authority explicitly rejected the proposal. No DDD item is marked rejected in this initial register. |

A statement in a summary table is useful evidence of the recorded project baseline, but it is not a substitute for an exact approval record where approval metadata is missing. Where approval date or approver is not established by a canonical source, this register says so rather than inventing one.

### 1.2 Approval metadata convention

The Owner Decision Register records the approved baseline for DDD-002 through DDD-015, and the requirements/traceability documents record DDD-001. However, the reviewed decision files do not provide a consistent dated approval record for every original DDD decision. Therefore:
- the approved principles below are preserved as the current recorded baseline;
- original approval dates and individual approvers are marked **not established in the reviewed canonical evidence** unless a specific approval record exists;
- this is a metadata/evidence gap, not a request to reapprove an already approved principle;
- no unresolved detail becomes approved by inclusion in this register.

### 1.3 Related governance records

- Architecture decisions: `docs/decisions/DECISION-REGISTER.md` (DFR-001–DFR-006).
- Owner decision queue: `docs/decisions/PHASE-2-OWNER-DECISION-REGISTER.md` (ODR-001–ODR-013 and ODR-ENV-001–ODR-ENV-007).
- Owner decision package: `docs/decisions/PHASE-2-OWNER-DECISION-PACKAGE.md`.
- DDD reconciliation: `docs/decisions/PHASE-2-DDD-DECISION-REGISTER-RECONCILIATION.md`.
- DDD-005 explicit-deny and role-conflict approval: `docs/decisions/DDD-005-EXPLICIT-DENY-AND-ROLE-CONFLICT-PROPOSAL.md`.
- Requirements: `docs/product/PHASE-1-TESTABLE-REQUIREMENTS.md`.
- Requirement crosswalk: `docs/product/PHASE-1-REQUIREMENT-TO-ERD-TRACEABILITY.md`.
- Domain ownership: `docs/architecture/PHASE-1-DOMAIN-BOUNDARIES.md`.
- Lifecycle proposals: `docs/architecture/PHASE-2-LIFECYCLE-STATE-CATALOGUE.md`.
- Physical design review: `docs/architecture/PHASE-2-PHYSICAL-DATABASE-DESIGN-SECOND-REVIEW.md`.

## 2. Decision summary

| ID | Domain | Reconciled status | Primary requirement traceability |
|---|---|---|---|
| DDD-001 | Identity and member account separation | APPROVED PRINCIPLE / approval metadata gap | ID-003, ID-004 |
| DDD-002 | Member categories and ministry classification | APPROVED PRINCIPLE / eligibility detail open | MEM-001–MEM-006 |
| DDD-003 | Church membership and transfer | APPROVED PRINCIPLE / transfer-detail conflict | ORG-001–ORG-007 |
| DDD-004 | Leadership appointments and terms | APPROVED PRINCIPLE / acting-appointment detail open | APP-001–APP-007 |
| DDD-005 | Authorization, permissions, explicit deny, role conflicts | APPROVED PRINCIPLE; follow-up APPROVED 2026-10-31 | AUTHZ-001–AUTHZ-011 |
| DDD-006 | Department membership | APPROVED PRINCIPLE / lifecycle detail open | DEPT-001–DEPT-006 |
| DDD-007 | Event governance and lifecycle | APPROVED PRINCIPLE / local and exception detail open | EVT-001–EVT-007 |
| DDD-008 | Attendance recording and correction | APPROVED PRINCIPLE / recording-mode detail open | ATT-001–ATT-007 |
| DDD-009 | Financial accounts and currency | APPROVED PRINCIPLE / account-authority detail open | FIN-001–FIN-005 |
| DDD-010 | Financial transaction workflow | APPROVED PRINCIPLE / accounting policy detail open | FIN-006–FIN-012 |
| DDD-011 | Verifiable credentials | APPROVED PRINCIPLE / official standards open | CRED-001–CRED-004 |
| DDD-012 | Audit and accountability | APPROVED PRINCIPLE / access and retention detail open | AUD-001–AUD-004 |
| DDD-013 | Idempotency and safe mutation replay | APPROVED PRINCIPLE / technical follow-up evidence gap | SEC-005, SEC-006 |
| DDD-014 | Records retention and disposal | APPROVED GOVERNANCE PRINCIPLE / schedules open | RET-001–RET-004 |
| DDD-015 | Notifications and external integrations | APPROVED PRINCIPLE / provider operations open | NOTIF-001–NOTIF-006 |

The requirement IDs above are the IDs currently present in the detailed testable requirements file. The current crosswalk counts 97 IDs. Reporting is a known separate traceability gap and is not silently assigned new IDs here.

---

## 3. Canonical domain decisions

### DDD-001 — Identity and individual member account separation

**Status:** APPROVED PRINCIPLE; original approval metadata gap  
**Decision authority:** Project owner for DYMS identity policy; safeguarding/ministry authority for any future onboarding policy  
**Approver/date:** Exact original approver and approval date are not established in the reviewed canonical decision files  
**Scope:** DYMS v1.0 identity and member account model

**Recorded decision**
1. Each member has an individual user account linked one-to-one to that member.
2. A member's account is for that member's own login and identity.
3. Shared member logins, guardian-owned accounts, guardian-managed child accounts, and delegated guardian-to-child account access are not part of the approved model.
4. Identity/account records and ministry membership records remain distinct domain concepts. An account does not itself establish a member's category, church, department, appointment, or permissions.
5. The system must preserve the member/account identity relationship and must not create guardian relationship entities as a workaround for the individual-account rule.

**Approval boundary and open detail**
- Younger-member onboarding, safeguarding, consent, recovery assistance, and lawful/official requirements must be confirmed from competent policy sources.
- No minimum age, guardian consent rule, guardian access capability, or exception is inferred by this decision.
- Any proposed change to the one-member/one-account rule requires an explicit formal change request and owner approval.

**Evidence:** `PHASE-1-REQUIREMENTS-CONSOLIDATION.md`; `PHASE-1-TESTABLE-REQUIREMENTS.md` ID-003/ID-004; `PHASE-1-REQUIREMENT-TO-ERD-TRACEABILITY.md` DDD-001 mapping; `PHASE-2-OWNER-DECISION-REGISTER.md` individual member account rule.  
**Related:** DFR-001, DFR-002; DDD-012.  
**Bounded contexts:** Identity and Access; Member Management.  
**Conceptual design impact:** User/account identity, member identity, one-to-one account/member association, authentication identity separation.  
**Lifecycle impact:** Account lifecycle and membership lifecycle remain independent.  
**Test coverage:** ID-003, ID-004; account/member cardinality and prohibited guardian/shared-account cases.  
**Open owner:** Project owner and relevant safeguarding/ministry authority for any onboarding requirements.  
**Change history:** Added to this canonical register because the previous Owner Decision Register summary omitted DDD-001. No domain rule changed.

### DDD-002 — Member categories and ministry classification

**Status:** APPROVED PRINCIPLE / OPEN ELIGIBILITY DETAIL  
**Decision authority:** Recognized Adventist youth ministry authority for official category standards; project owner for DYMS mapping  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Member primary category, category history, and distinction between categories and credentials

**Recorded decision**
1. A member has one active primary category at a time.
2. Category transitions must preserve historical assignments.
3. Adventurer, Pathfinder, and Senior Youth are represented as member categories in the current approved baseline.
4. Master Guide is represented as a credential/programme outcome, not as a member category.
5. Department participation is independent of the member's primary category.
6. Category administration must be performed by an authorized actor within the applicable scope.

**Approval boundary and open detail**
- Official eligibility, age/class thresholds, progression, evidence, verification, exception rules, local adaptations, and historical correction authority remain open.
- ODR-001 requires the responsible ministry authorities to identify applicable General Conference standards and any Division, Union, or Conference adaptations, including version and effective date.
- The current Senior Youth mapping, including whether it represents Ambassador and Young Adult ministries together, requires competent-authority confirmation.
- No age threshold or exception is to be invented or encoded as a fixed constraint before approval.

**Evidence:** Owner Decision Register §2 and ODR-001; MEM-001–MEM-006; requirements consolidation; traceability crosswalk.  
**Related:** DDD-001, DDD-006, DDD-011; ODR-001, ODR-009.  
**Bounded contexts:** Member Management; Credentialing.  
**Conceptual design impact:** Member category, category history/assignment, credential separation.  
**Lifecycle impact:** Category assignment and transition; eligibility remains policy-blocked where criteria are unknown.  
**Test coverage:** MEM-001–MEM-006.  
**Open owner:** Recognized ministry authorities at the applicable Division/Union/Conference/district levels, with project owner recording the approved DYMS mapping.  
**Change history:** Consolidated from the recorded approved baseline; no new eligibility policy approved.

### DDD-003 — Church membership and transfer

**Status:** APPROVED PRINCIPLE / MATERIAL DETAIL CONFLICT  
**Decision authority:** District and local church membership authorities; project owner records the platform rule  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Member's primary church assignment and transfer workflow

**Recorded decision**
1. A member has one current primary church.
2. The member initiates a transfer request.
3. Acceptance by the receiving church is required before district completion.
4. Final approval rests with the district authority.
5. The transfer becomes effective on the approved date under the recorded baseline.
6. Prior church assignments and transfer history are preserved.

**Not approved by the available evidence**
The requirements consolidation states no backdating, member withdrawal before district approval, district-authorized cancellation before the effective date, and one pending transfer per member. The Owner Decision Register and ORG-007 leave material transfer cancellation/rejection details open. These detailed statements are therefore **PROPOSED / POLICY-DEPENDENT**, not approved database predicates.

**Open decisions**
- Who may withdraw or cancel a pending request, and at what workflow stage.
- Whether and how the receiving church or district may reject a request.
- Whether an appeal or reconsideration path exists.
- Whether backdating is prohibited in all cases.
- Whether one unresolved transfer request per member is a binding cardinality rule.
- Who may cancel an approved transfer before its effective date and what evidence/reason is required.

**Evidence:** Owner Decision Register §2 and ODR-002; ORG-001–ORG-007; requirements consolidation §4.1; lifecycle catalogue; reconciliation REC-003.  
**Related:** DDD-001, DDD-004; ODR-002.  
**Bounded contexts:** Member Management; Church/Organization Management.  
**Conceptual design impact:** Current church assignment, transfer request, receiving-church decision, district decision, historical assignment.  
**Lifecycle impact:** Transfer request, acceptance, district approval, completion, and any cancellation/rejection states remain subject to confirmed policy.  
**Test coverage:** ORG-001–ORG-007; ORG-007 is explicitly policy-gap coverage.  
**Open owner:** District membership authority with receiving/local church authorities; project owner records the final rule.  
**Change history:** Detailed clauses previously presented as settled in the requirements consolidation are downgraded here to policy-dependent pending authority confirmation. Core workflow remains preserved.

### DDD-004 — Leadership appointments and terms

**Status:** APPROVED PRINCIPLE / ACTING-APPOINTMENT DETAIL OPEN  
**Decision authority:** Higher appointing authority defined by the applicable district/church governance  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Leadership appointments, renewals, replacement, and appointment-derived authority

**Recorded decision**
1. Appointment approval must be performed by the designated higher authority.
2. A person must not approve their own appointment.
3. Renewal requires fresh approval; continuation is not automatic.
4. The normal annual appointment term is January 1 through December 31.
5. A mid-year replacement follows the approved term end unless a formally authorized exception is recorded.
6. Early termination requires an authorized decision and recorded reason.
7. Concurrent active appointments for the same position and scope are prevented under the approved baseline.
8. Appointment history, approval decisions, effective dates, and termination reasons are preserved.
9. Appointment-derived permissions cease when the appointment expires or ends, without automatically deactivating the member account.

**Not enabled / open detail**
- Acting appointments are not an approved operational capability on current evidence.
- The requirements consolidation describes acting appointments with approval, reason, dates, and link to a substantive appointment. APP-007 marks this as proposed detail, ODR-003 asks whether acting appointments are permitted and under what limits, and the lifecycle catalogue says acting appointments/exceptional overlap are not enabled.
- Acting appointments and exceptional overlap must remain disabled until competent appointing authority confirms eligibility, authorizer, duration, scope, overlap, and termination rules.
- Exact mid-year appointment, early-ending, replacement, and exceptional overlap transitions must remain consistent with the approved no-overlap rule unless a formal exception is approved.

**Evidence:** Owner Decision Register §2 and ODR-003; APP-001–APP-007; DFR-004; lifecycle catalogue; reconciliation REC-004.  
**Related:** DDD-005, DDD-012; ODR-003.  
**Bounded contexts:** Leadership and Appointment Management; Identity and Access.  
**Conceptual design impact:** Appointment, position, scope, approver, appointment history, permission derivation.  
**Lifecycle impact:** Normal appointment/renewal/termination only; acting and exceptional overlap states blocked.  
**Test coverage:** APP-001–APP-007; AUTHZ-010.  
**Open owner:** District/church appointing authority, with project owner documenting approved exceptions.  
**Change history:** Acting appointment capability explicitly classified as not enabled pending authority decision. Core appointment rules preserved.

### DDD-005 — Authorization, permissions, explicit deny, and role conflicts

**Status:** APPROVED PRINCIPLE; FOLLOW-UP APPROVED 2026-10-31  
**Decision authority/approver:** Project owner  
**Approval date:** Follow-up approval 2026-10-31; original baseline approval date not established in reviewed canonical evidence  
**Scope:** DYMS v1.0 authorization model and the four-role initial permission matrix

**Recorded decision**
1. Authorization is deny-by-default and enforced server-side for every protected operation.
2. Permission grants are additive only within independently valid role assignments and resource scopes.
3. A role title does not outrank another role title and does not expand another role's scope.
4. Explicit deny overrides every applicable grant for the named permission and resource scope.
5. A deny does not spread to unrelated scopes. Descendant-resource coverage applies only where the approved permission scope model expressly defines it.
6. Ambiguous authorization scope fails closed for the affected protected operation and is recorded.
7. Only a separately authorized administrative authority may create or revoke an explicit deny. The affected actor cannot create, approve, modify, or remove their own restriction.
8. Deny records require a reason, target actor, permission, resource scope, effective start, optional expiry/review date, issuer, and lifecycle status. Creation, attempted use, review, modification, expiry, and revocation are auditable; revocation does not erase history.
9. The approved role-pair classifications in the DDD-005 follow-up are binding:
   - Allowed combinations require separate valid assignments/appointments and independent scopes.
   - Prohibited combinations must not be active concurrently.
   - Review-required combinations remain inactive until independently approved by an authorized reviewer who is not the affected Member.
10. Existing self-approval, separation-of-duties, account-status, appointment-validity, and business-rule restrictions continue to apply.
11. The approved four-role permission matrix remains in force. A role assignment alone does not create access outside its explicit permission and scope.

**Exact follow-up approval evidence**
The project owner approved all four groups in `DDD-005-EXPLICIT-DENY-AND-ROLE-CONFLICT-PROPOSAL.md` without modification on 2026-10-31:
- explicit-deny scope and precedence;
- explicit-deny administration and audit controls;
- role-combination classifications in §3;
- independent review before a review-required combination becomes effective.

**Approval boundary and open detail**
- Stable permission identifiers, complete action/resource mapping, scope inheritance catalogue, and remaining independent-role/scope mappings remain design work.
- Physical representation of explicit restrictions, role combinations, and history is not decided by the policy approval.
- This approval does not change DDD-004 appointment lifecycle or DDD-012 audit-administration authority.

**Evidence:** `DDD-005-EXPLICIT-DENY-AND-ROLE-CONFLICT-PROPOSAL.md` §§3, 8; Owner Decision Register §2 and ODR-004; AUTHZ-001–AUTHZ-011.  
**Related:** DFR-002, DDD-004, DDD-012; ODR-004.  
**Bounded contexts:** Identity and Access; Leadership and Appointment Management; Audit.  
**Conceptual design impact:** Roles, assignments, permissions, scope, deny restrictions, review decisions, audit history.  
**Lifecycle impact:** Grant/revoke, deny/review/revoke, role-combination review, appointment validity.  
**Test coverage:** AUTHZ-001–AUTHZ-011, including cross-role deny precedence, scope isolation, fail-closed behavior, self-administration prevention, and review/prohibition enforcement.  
**Open owner:** DYMS Engineering for permission catalogue and technical mapping; project owner/security authority for any policy expansion.  
**Change history:** Formal follow-up approved 2026-10-31 without modification. Do not reopen the four approved groups absent a formal change request.

### DDD-006 — Department membership

**Status:** APPROVED PRINCIPLE / LIFECYCLE DETAIL OPEN  
**Decision authority:** Relevant district departmental authority and designated department coordinator  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Member participation in one or more district youth departments

**Recorded decision**
1. A member requests department membership.
2. The designated department coordinator approves membership within the coordinator's authority and scope.
3. A member may belong to multiple departments at the same time.
4. Department participation does not change the member's primary category.
5. Department membership does not itself confer leadership appointment or permissions.
6. A member may withdraw; an authorized coordinator may terminate membership with a recorded reason.
7. Membership history is preserved.

**Proposed / policy-dependent detail**
- Annual review and renewal on continued eligibility.
- Appeals of rejection or termination to district authority.
- Church transfer triggering a department membership review.
- District-authorized eligibility exceptions.
These clauses appear in the requirements consolidation but remain unresolved in the Owner Decision Register and DEPT-006. They must not be treated as approved lifecycle rules until confirmed.

**Evidence:** Owner Decision Register §2 and ODR-007; DEPT-001–DEPT-006; requirements consolidation §4.3; lifecycle catalogue; reconciliation REC-005.  
**Related:** DDD-001, DDD-002, DDD-003; ODR-007.  
**Bounded contexts:** Department Management; Member Management; Leadership and Appointment Management.  
**Conceptual design impact:** Department, department membership request, membership decision, active membership, history.  
**Lifecycle impact:** Request, coordinator approval, active membership, withdrawal, reasoned termination; renewal/appeal/transfer review blocked pending policy.  
**Test coverage:** DEPT-001–DEPT-006.  
**Open owner:** District departmental authority and designated coordinators; project owner records approved policy.  
**Change history:** Annual renewal, appeal, transfer review, and eligibility override are explicitly classified as policy-dependent.

### DDD-007 — Event governance and lifecycle

**Status:** APPROVED PRINCIPLE / LOCAL AND EXCEPTION DETAIL OPEN  
**Decision authority:** District event authority; local church authority for local events  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** District and local youth ministry events

**Recorded decision**
1. Authorized coordinators may create events within their organizational scope.
2. District events require district approval before publication.
3. Significant event changes require authorized approval and audit history.
4. Event cancellation requires an authorized decision and recorded reason.
5. Events with registrations or attendance are not physically deleted; their history is retained.
6. Event approval, registration, attendance, and financial outcomes remain distinct business workflows.

**Open detail**
- Local church event approval authority and whether local events require district notification or approval.
- Registration exceptions, waitlists, capacity handling, late registration, postponement, cancellation, and refund rules.
- Exact definition of a significant event change and the authority required for each change class.
- ODR-008 remains the authority queue for unresolved event and attendance edge cases.

**Evidence:** Owner Decision Register §2 and ODR-008; EVT-001–EVT-007; requirements consolidation; traceability crosswalk.  
**Related:** DDD-008, DDD-010, DDD-012; ODR-008.  
**Bounded contexts:** Event Management; Attendance; Finance; Audit.  
**Conceptual design impact:** Event, event approval, registration, event change/cancellation history, capacity where approved.  
**Lifecycle impact:** Draft, approval, publication, registration, change, cancellation/completion; local and exception paths remain policy-dependent.  
**Test coverage:** EVT-001–EVT-007.  
**Open owner:** District event authority and local church authorities; finance authority for refund terms.  
**Change history:** Core district approval and audit rules preserved; local and exceptional workflows remain open.

### DDD-008 — Attendance recording and correction

**Status:** APPROVED PRINCIPLE / RECORDING-MODE DETAIL OPEN  
**Decision authority:** Authorized event personnel; district event/attendance authority for policy  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Member attendance at events and sessions

**Recorded decision**
1. Authorized event personnel may record attendance for an event within their scope.
2. Attendance is linked to a member and event (and session where applicable).
3. Both QR-assisted and manual attendance entry are supported.
4. Duplicate valid attendance for the same member/event/session is prevented.
5. Manual entry is attributed to the acting user and timestamp.
6. Corrections preserve the original value, corrected value, reason, requester, approver, and timestamps.
7. Attendance statuses must remain distinguishable in reporting.

**Open detail**
- Whether registration is a prerequisite for attendance.
- Final attendance status catalogue and treatment of excused/late/partial attendance.
- Self-check-in authorization, QR expiry and replay controls, offline synchronization, and conflict reconciliation.
- Who may request and approve attendance corrections and whether a second reviewer is required.

**Evidence:** Owner Decision Register §2 and ODR-006/ODR-008; ATT-001–ATT-007; lifecycle catalogue.  
**Related:** DDD-007, DDD-012, DDD-013; ODR-006, ODR-008.  
**Bounded contexts:** Attendance; Event Management; Identity and Access; Audit.  
**Conceptual design impact:** Attendance record, event/session association, correction/history, recording actor.  
**Lifecycle impact:** Attendance capture, correction request/approval, status transitions; QR/offline/self-check-in states remain unapproved until specified.  
**Test coverage:** ATT-001–ATT-007.  
**Open owner:** District event/attendance authority and DYMS Engineering for secure technical behavior.  
**Change history:** QR and manual modes remain in the baseline; no self-check-in/offline policy is inferred.

### DDD-009 — Financial accounts and currency

**Status:** APPROVED PRINCIPLE / ACCOUNT AUTHORITY DETAIL OPEN  
**Decision authority:** District and church finance authorities  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** District and local church financial account ownership and monetary representation

**Recorded decision**
1. Every financial account has one organizational owner and one currency.
2. District and local church account ownership remain separate.
3. Access to a district report does not grant authority to mutate a church-owned account.
4. NGN is the default currency for Sango District accounts unless an approved alternative applies.
5. Monetary values use decimal arithmetic, not binary floating-point arithmetic.
6. Account access and actions are scoped to the account's organizational owner.

**Open detail**
- Whether an organization may maintain multiple accounts or subaccounts and who approves them.
- Account creation, closure, signatory, custody, and reconciliation authority.
- Foreign-currency account approval and FX conversion/reporting rules, including source, rate, date, and evidence.
- ODR-005 remains the finance authority queue.

**Evidence:** Owner Decision Register §2 and ODR-005; FIN-001–FIN-005; requirements consolidation; traceability crosswalk.  
**Related:** DDD-010, DDD-012, DDD-014; ODR-005.  
**Bounded contexts:** Finance and Accounting; Organization Management; Audit.  
**Conceptual design impact:** Financial account, organizational owner, currency, account history, transaction currency.  
**Lifecycle impact:** Account opening/active/closure states and authority remain subject to finance confirmation.  
**Test coverage:** FIN-001–FIN-005.  
**Open owner:** District and local church finance authorities; project owner records the platform interpretation.  
**Change history:** Currency and ownership principles preserved; no account multiplicity or FX policy added.

### DDD-010 — Financial transaction workflow

**Status:** APPROVED PRINCIPLE / ACCOUNTING POLICY DETAIL OPEN  
**Decision authority:** Competent district/church finance authority  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Financial requests, approvals, payment, posting, rejection, and reversal

**Recorded decision**
1. Submission, approval, payment, and posting are distinct workflow actions.
2. A submitter must not approve their own transaction.
3. Rejection requires a recorded reason and decision actor.
4. Revisions are controlled and permitted before posting under the recorded workflow.
5. A posted transaction is not silently edited or deleted; correction uses a linked reversal or other explicitly approved accounting adjustment.
6. Financial actions and their approvals are auditable.

**Open detail**
- Approval thresholds and delegated authority by amount/category.
- Whether payment occurs before or after approval and posting, including who confirms each stage.
- Partial payments, returned/failed payments, refunds, reimbursements, transfers, and reconciliation.
- Budget ownership, allocation, variance controls, and enforcement.
- ODR-005 remains the finance authority queue; no monetary threshold or accounting treatment is invented here.

**Evidence:** Owner Decision Register §2 and ODR-005; FIN-006–FIN-012; DDD reconciliation; physical-design review.  
**Related:** DDD-009, DDD-012, DDD-013, DDD-014, DDD-015; ODR-005.  
**Bounded contexts:** Finance and Accounting; Payment Integration; Audit.  
**Conceptual design impact:** Financial request/transaction, approval decision, payment reference, posting, reversal, budget/reporting relationships.  
**Lifecycle impact:** Submitted, approved/rejected, paid, posted, reversed/adjusted; detailed sequencing and exception states remain finance-policy dependent.  
**Test coverage:** FIN-006–FIN-012.  
**Open owner:** District finance authority, with local church finance authority for church-owned funds.  
**Change history:** Separation of duties and linked reversal preserved; no thresholds or payment sequencing added.

### DDD-011 — Verifiable credentials

**Status:** APPROVED PRINCIPLE / OFFICIAL STANDARDS OPEN  
**Decision authority:** Recognized ministry credential issuer/investiture authority; project owner for DYMS issuance controls  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Credential catalogue, evidence, issuance, renewal, reissue, and revocation

**Recorded decision**
1. Credentials are managed through a controlled, versioned catalogue.
2. Only a recognized issuer authority may issue a credential.
3. Required evidence is verified before issuance.
4. Renewals and reissues are linked to the relevant prior credential/history.
5. Revocation requires an authorized decision and recorded reason.
6. Credential history is retained.
7. Blockchain-based verification is deferred from the MVP and must not be treated as an implementation dependency for the current phase.

**Open detail**
- Official credential catalogue, issuer hierarchy, candidate eligibility, required evidence, investiture authority, validity/expiry, renewal criteria, disclosure/verification fields, and evidence retention.
- ODR-009 and ODR-001 provide the authority path for applicable ministry standards and Master Guide credential rules.
- No external credential standard or issuer authority is inferred from a proposed catalogue.

**Evidence:** Owner Decision Register §2 and ODR-001/ODR-009; CRED-001–CRED-004; requirements consolidation; traceability crosswalk.  
**Related:** DDD-002, DDD-012, DDD-014; ODR-001, ODR-009.  
**Bounded contexts:** Credentialing; Member Management; Audit.  
**Conceptual design impact:** Credential definition/version, issuer, candidate/member, evidence, issuance, renewal/reissue, revocation/history.  
**Lifecycle impact:** Draft/available catalogue, evidence review, issuance, renewal/reissue, revocation; exact eligibility and validity states remain open.  
**Test coverage:** CRED-001–CRED-004.  
**Open owner:** Recognized ministry credential/investiture authorities and project owner.  
**Change history:** Blockchain verification remains deferred; no credential standard or validity period is added.

### DDD-012 — Audit and accountability

**Status:** APPROVED PRINCIPLE / ACCESS AND RETENTION DETAIL OPEN  
**Decision authority:** Project owner/security authority; records authority for retention; authorized audit governance for access  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Audit events, actor attribution, audit access, and protection of audit evidence

**Recorded decision**
1. Audit history is append-only; ordinary application workflows must not overwrite or delete prior audit evidence.
2. Actor types include USER, SYSTEM, SERVICE, and ANONYMOUS.
3. Audit access is protected and separately authorized.
4. Secrets, passwords, authentication tokens, and equivalent sensitive credentials must not be written to logs.
5. Audit reads and exports are themselves subject to authorization and audit.
6. System/background actions identify the service actor and, where user-triggered, retain the initiating user context where appropriate.

**Open detail**
- Named audit administrator, audit viewer, investigator, emergency/break-glass, and independent-review authorities and scopes.
- Retention periods and eligible record classes are governed by DDD-014 and must be approved by competent records/finance/privacy authority.
- ODR-010 and ODR-011 remain the authority queue for audit access and retention questions.

**Evidence:** Owner Decision Register §2 and ODR-010/ODR-011; AUD-001–AUD-004; DDD-005 follow-up; lifecycle catalogue.  
**Related:** DDD-005, DDD-013, DDD-014, DDD-015; ODR-010, ODR-011.  
**Bounded contexts:** Audit and Accountability; Identity and Access; all auditable domains.  
**Conceptual design impact:** Audit event, actor reference/type, protected audit access, export/access history.  
**Lifecycle impact:** Append-only event creation; access/review/export are controlled actions.  
**Test coverage:** AUD-001–AUD-004; authorization tests for audit access and export; secret-redaction tests.  
**Open owner:** Project owner/security authority and competent records/audit authority.  
**Change history:** Actor taxonomy and append-only principle consolidated; no retention schedule or additional audit role is approved here.

### DDD-013 — Idempotency and safe mutation replay

**Status:** APPROVED PRINCIPLE / TECHNICAL FOLLOW-UP EVIDENCE GAP  
**Decision authority:** Project owner for platform behavior; DYMS Engineering for technical specification  
**Approver/date:** Original principle approval metadata and exact dates for detailed follow-ups are not established in the reviewed canonical DDD evidence  
**Scope:** Retry-safe processing of sensitive mutations and external callbacks

**Recorded decision**
1. Sensitive mutations are idempotent.
2. An idempotency key is bound to the authenticated actor, operation, and applicable resource/organizational scope.
3. Repeating the same key with the same request payload returns the previously established outcome rather than duplicating the mutation.
4. Reusing the same key with a different payload produces a conflict and must not execute a second mutation.
5. Authorization is rechecked when processing a replay; a prior successful result does not bypass current authorization.
6. External callbacks and payment/integration notifications must be processed idempotently and protected against replay, consistent with DDD-015.

**Open technical detail and evidence gap**
- Exact key format, uniqueness namespace, expiry/retention, lease behavior, concurrency control, response persistence, provider reconciliation, and operational recovery must be finalized in technical design.
- Project history is reported to contain follow-up decisions concerning a BIGINT fencing/version counter and AUTH-IDEM. The reviewed branch does not contain a canonical record with exact approved wording, date, approver, and scope.
- Until the original evidence is recovered, those specific values must not be represented as formally approved. A mention in a physical-design proposal is not approval evidence.
- The implementation of any key/fencing mechanism remains outside the current authorization gate.

**Evidence:** Owner Decision Register §2; SEC-005 and SEC-006; traceability crosswalk DDD-013 mapping; reconciliation REC-006 and §5.5; related physical-design review.  
**Related:** DDD-005, DDD-010, DDD-012, DDD-015; ODR-013.  
**Bounded contexts:** Platform Reliability/Security; Finance; Notifications and Integrations; all sensitive mutation workflows.  
**Conceptual design impact:** Idempotency operation/key record or equivalent technical construct, request fingerprint, actor/operation/scope binding, result/replay metadata. Exact storage remains undecided.  
**Lifecycle impact:** In-progress, completed, conflict, expired/failed recovery states require technical specification; no final state catalogue is approved here.  
**Test coverage:** SEC-005, SEC-006; additional concurrency, replay, changed-payload, authorization-revocation, and provider-callback tests should be specified during technical design.  
**Open owner:** DYMS Engineering to recover source approval evidence and propose technical contract; project owner confirms any policy-level choice.  
**Change history:** Core idempotency principle preserved. BIGINT fencing/version counter and AUTH-IDEM details remain evidence-gated, not reconstructed.

### DDD-014 — Records retention and disposal

**Status:** APPROVED GOVERNANCE PRINCIPLE / RETENTION SCHEDULES OPEN  
**Decision authority:** Competent records, finance, privacy, and district administrative authorities; project owner records the platform rule  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Retention, legal/administrative holds, archival, and disposal of DYMS records

**Recorded decision**
1. A retention schedule requires an approved legal, policy, or administrative basis.
2. Each approved schedule must specify the record class, retention duration, triggering event, responsible authority, and permitted disposal/archive action.
3. Applicable holds suspend disposal.
4. Audit evidence and required historical records must be preserved in accordance with the approved schedule and applicable holds.
5. Where a retention period is unknown or unapproved, automated permanent deletion is disabled.
6. A terminal business status does not itself authorize deletion.

**Open detail**
- Official retention periods, record classes, trigger events, archive/disposal methods, approval authority, legal holds, and exceptions.
- Finance, credential, member, appointment, attendance, audit, and payment records may have different schedules; no single duration is assumed.
- ODR-011 remains the authority queue. Do not enroll record classes in an automated permanent-deletion policy without approved schedules.

**Evidence:** Owner Decision Register §2 and ODR-011; RET-001–RET-004; lifecycle catalogue; reconciliation.  
**Related:** DDD-009–DDD-013, DDD-015; ODR-011.  
**Bounded contexts:** Records and Retention; Audit; Finance; Member Management; Credentialing.  
**Conceptual design impact:** Retention policy, record-class applicability, hold, disposal/archive decision, audit evidence.  
**Lifecycle impact:** Retention eligibility, hold, archive, disposal approval/execution; all durations remain policy-blocked.  
**Test coverage:** RET-001–RET-004; tests that unknown periods and active holds prevent automated permanent deletion.  
**Open owner:** District records/administrative authority with finance/privacy authorities for their record classes.  
**Change history:** Governance prerequisites consolidated; no retention period or disposal schedule added.

### DDD-015 — Notifications and external integrations

**Status:** APPROVED PRINCIPLE / PROVIDER OPERATIONS OPEN  
**Decision authority:** Project owner for product policy; integration/payment authority for provider operations; relevant business authority for notification consent  
**Approver/date:** Original approver/date not established in reviewed canonical evidence  
**Scope:** Asynchronous notifications, delivery tracking, webhooks, and external service integrations

**Recorded decision**
1. Notification and integration behavior is provider-independent at the domain boundary.
2. Consent and user notification preferences are respected where applicable.
3. Notification processing is asynchronous.
4. Provider acceptance is not equivalent to successful delivery and is not equivalent to completion of the underlying business workflow.
5. Retries are idempotent and must not create duplicate business effects.
6. Webhook callbacks are authenticated/verified, replay-protected, and processed idempotently.
7. Payment confirmation is verified before the corresponding business transaction is treated as paid or advanced.
8. Provider delivery status and business workflow status remain separate.

**Open detail**
- Approved channels and message categories, essential versus optional communication, consent exceptions, providers, retry limits/backoff, dead-letter handling, monitoring/alerting, provider failover, webhook verification mechanism, and operational ownership.
- Payment provider selection and reconciliation remain open; no provider acceptance event is treated as proof of settlement.
- ODR-012 remains the owner decision path for provider and notification operations.

**Evidence:** Owner Decision Register §2 and ODR-012; NOTIF-001–NOTIF-006; lifecycle catalogue; reconciliation REC-007.  
**Related:** DDD-010, DDD-012, DDD-013, DDD-014; ODR-012.  
**Bounded contexts:** Notifications and Integrations; Finance and Payments; Identity and Access; Audit.  
**Conceptual design impact:** Notification intent/delivery, provider reference, callback/event, consent/preferences, retry/reconciliation history.  
**Lifecycle impact:** Queued, accepted, delivered, failed, retried, suppressed/consent-blocked, callback-verified; provider-specific states remain technical proposals until selected.  
**Test coverage:** NOTIF-001–NOTIF-006; additional provider replay, duplicate callback, consent, delivery-versus-acceptance, and payment verification tests.  
**Open owner:** Project owner, DYMS Engineering, and authorized notification/payment integration owners.  
**Change history:** Provider-independent principles preserved; no channel, provider, retry ceiling, or operational threshold approved here.

---

## 4. Cross-domain decisions and dependencies

| Dependency | Decisions affected | Required treatment |
|---|---|---|
| Identity and authorization | DDD-001, DDD-004, DDD-005, DDD-012 | A user account is not a member category or appointment. Permissions derive from valid assignments, appointments, grants, scope, and restrictions. |
| Membership and credentials | DDD-002, DDD-003, DDD-006, DDD-011 | Category, church, department, and credential lifecycles remain distinct and preserve history. |
| Events and attendance | DDD-007, DDD-008, DDD-013, DDD-015 | Registration, attendance, QR/offline processing, callbacks, and retries must not create duplicate valid outcomes. |
| Finance and integration | DDD-009, DDD-010, DDD-013, DDD-014, DDD-015 | Account ownership, transaction approval, payment verification, idempotency, audit, and retention must be consistent. |
| Audit and retention | DDD-005, DDD-012, DDD-014 | Authorization restrictions and sensitive operations are auditable; retention/disposal follows approved schedules and holds. |
| Reporting and export | DDD-007–DDD-015 as applicable | Reports and exports must respect domain scope, financial separation, privacy, audit access, and retention. Reporting requirements currently lack a dedicated REPORT group. |

## 5. Open decision and evidence register

The following are not approvals. They are the current closure obligations.

| Ref | Open item | Competent authority / owner | Required evidence before closure |
|---|---|---|---|
| ODR-001 | Official category eligibility, progression, evidence, Senior Youth mapping, credential standards | Recognized ministry authorities; project owner | Current source documents, versions/effective dates, approved DYMS mapping |
| ODR-002 | Transfer cancellation, rejection, appeal, backdating, pending-request cardinality | District and local church membership authorities | One explicit transfer policy decision with actor, stage, reason, and effective-date rules |
| ODR-003 | Acting appointments, overlap exceptions, detailed appointment transitions | Higher appointing authority | Explicit authorization, duration, scope, overlap and termination policy |
| ODR-004 | Permission catalogue, scope mappings, remaining role/scope cases | Project owner/security authority; DYMS Engineering | Stable permission catalogue and approved scope/role mapping |
| ODR-005 | Account multiplicity, finance authority, thresholds, payment sequence, partial/returned payments, budgets, FX | District/church finance authorities | Approved finance policy and accounting treatment |
| ODR-006 | Attendance registration prerequisite and attendance-specific exceptions | District event/attendance authority | Approved registration and attendance mode/status policy |
| ODR-007 | Department eligibility, renewal, appeals, church-transfer effects, exceptions | District departmental authority | Approved department membership policy |
| ODR-008 | Local event authority, capacity, waitlist, late registration, postponement, refund | District/local event authorities; finance authority for refunds | Approved event and registration exception policy |
| ODR-009 | Credential catalogue, issuer authority, evidence, validity, disclosure | Recognized ministry credential/investiture authority | Official standards and approved DYMS credential mapping |
| ODR-010 | Audit roles, investigation and emergency access | Project owner/security/audit authority | Named roles, permitted scope, independent review and break-glass policy |
| ODR-011 | Retention schedules and enrolled record classes | Records, finance, privacy and district administrative authorities | Approved record-class schedule, basis, duration, trigger, authority, action and holds |
| ODR-012 | Channels, providers, consent operations, retry limits, monitoring | Project owner and integration owners | Provider/channel decision, consent rules, retry and operational policy |
| ODR-013 | Reporting definitions, classification, exports, and idempotency technical details | Project owner, reporting/security authority, DYMS Engineering | Testable report requirements and recovered exact DDD-013 follow-up approval records |
| ODR-ENV-001–007 | Deployment/environment confirmations | Technical/project owner | Explicit environment and operations confirmations |

## 6. Requirements and traceability controls

1. The current detailed testable requirements file contains 97 IDs across ID, MEM, ORG, DEPT, APP, AUTHZ, EVT, ATT, FIN, CRED, AUD, RET, NOTIF, and SEC.
2. The current requirement-to-ERD crosswalk maps these 97 IDs to DDD decisions and conceptual ERD areas.
3. There is no dedicated REPORT requirement group, despite reporting definitions, report runs, classification, and export audit appearing in the owner decision package and physical-design materials.
4. The preliminary ranges in the requirements consolidation do not consistently match the IDs actually present in the detailed testable requirements file.
5. DDD-013 follow-up approval evidence for the reported BIGINT fencing/version counter and AUTH-IDEM decisions is not present as a complete canonical record in the reviewed branch.

**Required corrective work**
- Add testable report requirements and update the crosswalk, or document an explicit, testable mapping to existing requirements. Do not invent IDs in this register.
- Reconcile the preliminary ID ranges against the detailed requirements file.
- Recover the exact DDD-013 follow-up approval wording, date, approver, and scope from the originating source before recording those details as approved.
- Update requirements, lifecycle catalogue, traceability, conceptual/physical design, and tests together when a competent authority closes a policy item.

## 7. Physical design and implementation boundary

The conceptual ERD revision `25f2813e0256d9472daded45657dfb7ac9f70a43` was approved for progression to physical-design review. That approval does not approve the physical database design.

The following gates remain in force:
- DFR-001 through DFR-006 remain preserved. The historical DFR-006 freeze/lift discrepancy must be resolved through an explicit dated owner governance record; this register does not resolve or silently rewrite it.
- Physical database design remains a proposal pending explicit project-owner approval.
- No Prisma schema, migration, SQL DDL, database object, seed, generated client, API, or application implementation is authorized.
- The implementation status remains **NOT AUTHORIZED** until the project owner separately grants explicit authorization after the required design approvals.

A domain principle marked approved does not by itself authorize a particular physical table, column, enum, index, constraint, trigger, API, or code path. Those technical artifacts require their own reviewed design and approval gate.

## 8. Change control and register maintenance

For every new or amended DDD decision:
1. Preserve the original decision and identify the exact clauses being amended.
2. Record the decision authority, approver, date, rationale, source policy/document, and effective date.
3. Separate approved clauses from proposals and unresolved clauses.
4. Identify affected bounded contexts, conceptual entities, lifecycle transitions, requirements, constraints, and tests.
5. Update the Owner Decision Register and ODR status where applicable.
6. Update the requirements, lifecycle catalogue, traceability, and physical-design proposal consistently.
7. Record supersession explicitly. Do not silently overwrite history.
8. Obtain independent consistency review before treating the change as closed.

### Change history

| Date | Change | Evidence |
|---|---|---|
| 2026-11-02 | Initial canonical DDD-001–DDD-015 register created from the repository reconciliation. Approved principles preserved; unresolved details and missing approval metadata explicitly identified. | `PHASE-2-DDD-DECISION-REGISTER-RECONCILIATION.md`; `PHASE-2-OWNER-DECISION-REGISTER.md`; requirements and traceability documents; DDD-005 formal approval record |

## 9. Register completion assessment

**Register established:** Yes.  
**DDD coverage:** DDD-001 through DDD-015 recorded.  
**Approved principles preserved:** Yes, subject to the stated evidence metadata gaps and open details.  
**DDD-005 follow-up approval preserved exactly in scope:** Yes, dated 2026-10-31.  
**DDD-003/004/006 conflicts identified and constrained:** Yes.  
**DDD-013 technical follow-up evidence recovered:** No; evidence gap remains open.  
**Reporting traceability gap resolved:** No; corrective action remains open.  
**Physical database design approved:** No.  
**Application implementation authorized:** **No.**
