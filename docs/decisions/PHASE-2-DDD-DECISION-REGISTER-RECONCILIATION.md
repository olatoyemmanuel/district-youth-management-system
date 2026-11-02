# DYMS Phase 2 — DDD Decision Register Reconciliation

**Project:** District Youth Management System (DYMS)  
**Scope:** v1.0, Sango District  
**Review date:** 2026-11-02  
**Status:** Reconciliation findings for project-owner review  
**Working branch:** `phase-1/requirements-consolidation`  
**Implementation authorization:** NOT GRANTED

## 1. Purpose and method

This review compares the decision evidence currently present in the working repository with the approved requirements, testable acceptance criteria, owner decision register, domain boundaries, lifecycle catalogue, physical-design review and the project-owner approvals already recorded in the project history.

The review asks four questions:

1. Is each DDD decision represented in a canonical decision record?
2. Does the repository distinguish the approved principle from unresolved policy detail?
3. Do requirements, lifecycle states and physical-design blockers describe the same decision consistently?
4. Is there enough recorded authority and evidence to treat a rule as approved?

This is a documentation and governance reconciliation. It does not approve new policy, alter the approved conceptual ERD, approve the physical database design, or authorize implementation.

### Evidence reviewed

| Source | Current branch evidence | Role in this reconciliation |
|---|---|---|
| `docs/decisions/DECISION-REGISTER.md` | DFR-001–DFR-006; blob `ca4cc0ea12affae78ef7a39432d9c210a3385c72` | Canonical architecture/freeze decisions |
| `docs/decisions/DDD-005-EXPLICIT-DENY-AND-ROLE-CONFLICT-PROPOSAL.md` | Formal approval dated 2026-10-31; blob `14255e1d3e08900c35a47c70531ee8d9b6bdacf0` | Specific DDD-005 follow-up approval evidence |
| `docs/decisions/PHASE-2-OWNER-DECISION-REGISTER.md` | DDD-002–DDD-015 summary and ODR-001–ODR-013; blob `0937f446dc96984d0f8f457479d8f12bf55a6604` | Current open decisions and authority assignments |
| `docs/product/PHASE-1-REQUIREMENTS-CONSOLIDATION.md` | DDD-001–DDD-015 baseline; blob `5f529bbcce98494382b223967a28cebf0a89c7fb` | Consolidated business rules and open-policy statements |
| `docs/product/PHASE-1-TESTABLE-REQUIREMENTS.md` | 97 enumerated requirement IDs; blob `ecea9abfd733581f31dd6b81abe9b590c5100feb` | Acceptance criteria and status labels |
| `docs/product/PHASE-1-REQUIREMENT-TO-ERD-TRACEABILITY.md` | Current 97-ID group crosswalk; blob `9d4f6253bac151c7b4e72cc194baa04fd876b1ca` | Requirement-to-domain and DDD mapping |
| `docs/architecture/PHASE-1-DOMAIN-BOUNDARIES.md` | Domain ownership and invariant proposals; blob `93d56725b6eba44d9854fd12aafc8c7694cd5e84` | Cross-context consistency |
| `docs/architecture/PHASE-2-LIFECYCLE-STATE-CATALOGUE.md` | 52 lifecycle rows; blob `a4b01f329f3932439e521975c6c3ea417eca4a3d` | State/authority consistency |
| `docs/architecture/PHASE-2-PHYSICAL-DATABASE-DESIGN-SECOND-REVIEW.md` | Physical-design review and follow-up; blob `e5cc24595deb96c6b746e44fdc81c46f6490a38a` | Design consequences and remaining blockers |
| `docs/decisions/PHASE-2-OWNER-DECISION-PACKAGE.md` | Consolidated owner decision package; blob `9a39910092c4cfaa5686a180cbe42e53f657237b` | Decision queue and implementation boundary |

The review treats explicit approval records as stronger evidence than an unqualified summary statement. A status label such as “approved” does not automatically approve every detailed rule in the same domain.

## 2. Executive findings

**Overall result: PARTIALLY RECONCILED.**

The repository has a useful approved-domain baseline, but it does not yet have one authoritative, complete DDD decision register. The current architecture Decision Register contains DFR-001–DFR-006, not the complete DDD-001–DDD-015 decision history. DDD decisions are spread across the requirements consolidation, Owner Decision Register, traceability file and one dedicated DDD-005 follow-up approval.

The reconciliation identified these material findings:

| Finding | Severity | Finding |
|---|---|---|
| REC-001 | High | No single canonical DDD-001–DDD-015 register with exact decision text, approver, date, evidence and change history. |
| REC-002 | High | DDD-001 is mapped in requirements but absent from the Owner Decision Register's approved-decision summary. |
| REC-003 | High | DDD-003 transfer details are stated as settled in the requirements consolidation while the Owner Decision Register and ORG-007 keep material details open. |
| REC-004 | High | DDD-004 acting appointments are described as permitted in the requirements consolidation, but remain open/not enabled in the Owner Decision Register, testable requirement and lifecycle catalogue. |
| REC-005 | High | DDD-006 annual review, renewal, appeals and church-transfer effects appear as requirements in one document but remain unresolved in the Owner Decision Register. |
| REC-006 | Medium | DDD-013 idempotency has approved platform principles, but the repository does not consolidate the detailed technical follow-up approvals and their exact scope in a canonical decision record. |
| REC-007 | Medium | DDD-015 approved notification principles are mixed with unresolved provider, channel, consent-operational and retry settings. |
| REC-008 | Medium | DDD-001 through DDD-015 are described as an approved baseline, but approval evidence is uneven. DDD-005 follow-up has a dedicated formal record; equivalent approval metadata is not consistently available for every DDD item in the reviewed decision directory. |
| REC-009 | Medium | Reporting has ODR-013 and physical-design entities but no dedicated REPORT requirement group in the current 97-ID testable requirements catalogue. |
| REC-010 | High | DFR-006 freeze/lift statements remain inconsistent across repository records and require one explicit, dated governance reconciliation. |

These findings are documentation and approval-control findings. They do not invalidate the exact conceptual ERD approval recorded for Phase 1. They do prevent us from claiming that all domain policy details are closed or that the physical design is ready for implementation.

## 3. DDD-by-DDD reconciliation matrix

Status vocabulary:
- **Approved principle:** the high-level rule is recorded as approved.
- **Approved follow-up:** a specific follow-up decision has an explicit approval record.
- **Open detail:** the principle is approved, but one or more operational rules still need authority confirmation.
- **Evidence gap:** the repository does not contain enough approval metadata to independently establish the exact decision text and authority.
- **Conflict:** two repository sources describe the same policy detail differently.

| Decision | Repository evidence and traceability | Reconciled status | Outstanding action |
|---|---|---|---|
| DDD-001 — Identity/account separation | ID-003 maps identity and membership separation to DDD-001. Individual-account rule is separately explicit in the requirements and Owner Decision Register. | Approved principle; register coverage gap | Add DDD-001 to the canonical DDD register. Preserve one account per member, individual login, no shared/guardian-operated account model. Keep younger-member safeguarding/onboarding evidence separate. |
| DDD-002 — Member categories | MEM-001–MEM-006; Owner Decision Register §2; ODR-001; category lifecycle in physical design. | Approved principle; open eligibility detail | Preserve one active primary category, history, and Master Guide as credential. Ministry authorities must confirm current official standards, local applicability, evidence, progression and exceptions. |
| DDD-003 — Church transfers | ORG-001–ORG-007; requirements consolidation §4.1; ODR-002. | Approved core workflow; material detail conflict | Reconcile cancellation authority/timing, rejection, appeal, backdating and pending-request cardinality before lifecycle and uniqueness predicates are finalized. |
| DDD-004 — Appointments | APP-001–APP-007; requirements consolidation §4.2; ODR-003; lifecycle catalogue appointments row. | Approved core rules; acting appointment conflict | Preserve higher-authority approval, no self-approval, fresh renewal approval, normal annual term, no overlapping active holder, history and reasoned termination. Do not enable acting appointments until their authority/limits are explicitly confirmed and reconciled. |
| DDD-005 — Authorization/roles | AUTHZ-001–AUTHZ-011; dedicated follow-up approval dated 2026-10-31; ODR-004. | Approved principle and approved follow-up; catalogue/scope detail open | Preserve additive grants, deny-by-default, explicit-deny precedence, role-pair classifications and independent review. Complete stable permission identifiers, resource mapping and scope inheritance. |
| DDD-006 — Department membership | DEPT-001–DEPT-006; requirements consolidation §4.3; ODR-007. | Approved core workflow; lifecycle-detail conflict | Preserve member request, designated coordinator approval, multiple memberships, withdrawal, reasoned termination and history. Annual renewal, appeals, eligibility exceptions and transfer effects require authority confirmation. |
| DDD-007 — Events | EVT-001–EVT-007; ODR-004 and ODR-008. | Approved core workflow; local/exception detail open | Preserve authorized creation, district approval before district publication, significant-change approval/audit, reasoned cancellation and event history. Confirm local event authority, registration exceptions, waitlists, capacity states and postponement. |
| DDD-008 — Attendance | ATT-001–ATT-007; ODR-006. | Approved core workflow; recording-mode detail open | Preserve authorized personnel entry, QR/manual support, duplicate prevention and correction history. Confirm registration prerequisite, status catalogue, event/session mode, self-check-in, QR expiry, offline reconciliation and correction authority. |
| DDD-009 — Accounts/currency | FIN-001–FIN-005; ODR-005. | Approved principle; finance authority detail open | Preserve district/church ownership separation, one currency per account, NGN default, decimal money and scope controls. Confirm multiple accounts, subaccounts, account authority and FX reporting rules. |
| DDD-010 — Transaction workflow | FIN-006–FIN-012; ODR-005. | Approved core workflow; accounting policy open | Preserve submit/approve/pay/post separation, no self-approval, reasoned rejection, controlled revisions and linked reversal. Confirm thresholds, payment/posting sequence, partial/returned payments, budget controls and reimbursement treatment. |
| DDD-011 — Credentials | CRED-001–CRED-004; ODR-001 and ODR-009. | Approved platform principles; official standards open | Preserve versioned catalogue, evidence verification, recognized issuer, linked renewal/reissue, reasoned revocation and history. Confirm credential catalogue, issuer authority, validity, evidence, disclosure and retention from official sources. |
| DDD-012 — Audit | AUD-001–AUD-004; ODR-010 and ODR-011. | Approved platform principles; access/retention authority open | Preserve append-only audit, actor types, no secrets in logs, protected audit access and audited reads/exports. Confirm named audit roles, investigation/break-glass authority, independent review and retention schedules. |
| DDD-013 — Idempotency | SEC-005–SEC-006; traceability crosswalk; ODR-013 row in Owner Decision Register. | Approved platform principle; technical follow-up evidence needs consolidation | Preserve actor/operation/scope binding, same-key safe retry, payload mismatch conflict and authorization recheck. Reconcile detailed key lifecycle, fencing/version counter, lease and provider reconciliation decisions into a dated canonical record. |
| DDD-014 — Retention | RET-001–RET-004; ODR-011; lifecycle catalogue retention rows. | Approved governance principles; schedules blocked | Preserve approved-basis requirement, holds, audit evidence and no automated permanent deletion for unknown periods. Do not seed durations or enroll record classes without competent records/finance/privacy authority approval. |
| DDD-015 — Notifications/integrations | NOTIF-001–NOTIF-006; ODR-012; lifecycle catalogue notifications/deliveries. | Approved platform principles; provider operations open | Preserve asynchronous processing, acceptance distinct from delivery, idempotent retries, consent checks, webhook replay protection and verified payment confirmation. Confirm channels, essential/optional categories, providers, retry ceilings and operations authority. |

## 4. Specific conflicts requiring correction or an explicit decision

### REC-003 — DDD-003 transfer rules

The requirements consolidation currently states:
- Backdating is not permitted.
- The member may withdraw a pending request before district approval.
- An approved transfer may be cancelled before its effective date only with district authorization and a recorded reason.
- One pending transfer request per member.

The Owner Decision Register says cancellation/rejection/appeal/backdating details remain open and asks who may cancel, when cancellation closes, whether backdating is ever permitted, and whether one unresolved request per member is intended. ORG-007 also labels cancellation/rejection details as a policy gap.

**Reconciliation:** the repository does not establish that all four detailed statements above were separately approved by the competent authority. Treat them as proposed requirements pending confirmation, not as approved database predicates.

**Required authority output:** a single transfer decision covering cancellation actors and cutoff, receiving-church/district rejection, appeal/reconsideration, effective-date/backdating policy, and pending-request cardinality. Preserve the already approved member initiation, receiving-church acceptance, district final approval, approved-date effective rule and historical membership.

### REC-004 — DDD-004 acting appointments

The requirements consolidation says acting appointments are permitted with approval, reason, start/end dates and a link to the substantive appointment. However:
- APP-007 labels the acting appointment requirement as proposed detail.
- ODR-003 asks whether acting appointments are allowed, who authorizes them, their duration and overlap behavior.
- The lifecycle catalogue explicitly says acting appointments and exceptional overlap are not enabled.

**Reconciliation:** acting appointments are not an approved operational capability on the current evidence. The consolidated requirement overstates the approval status.

**Required correction:** mark the acting appointment paragraph in the requirements consolidation as proposed/policy-dependent until the competent appointing authority confirms the policy. Keep acting appointments disabled in the lifecycle catalogue and physical design until then. The already approved no-overlap rule remains in force; no acting exception should be inferred.

### REC-005 — DDD-006 department membership lifecycle

The requirements consolidation says:
- Department membership is reviewed annually and renewed on continued eligibility.
- Rejection and termination may be appealed to district authority.
- Church transfer triggers review rather than automatic deletion.
- District authority may authorize an eligibility exception with reason and approval.

The Owner Decision Register lists eligibility, appeal, renewal and transfer effects as unresolved. DEPT-006 also says exact eligibility and renewal timing require authority confirmation.

**Reconciliation:** retain member request, coordinator approval, multiple departments, withdrawal, reasoned termination and history as approved. Treat annual review, appeal, transfer review and district eligibility override as proposed pending confirmation.

**Required correction:** label those detailed clauses in the requirements consolidation as policy-dependent, or attach an explicit authority approval record if one exists outside the reviewed branch. Do not implement them as fixed lifecycle constraints yet.

### REC-010 — DFR-006 freeze status

The architecture Decision Register states DFR-006 is APPROVED and that the approved design specification is frozen for implementation, with changes requiring a documented change request. The requirements consolidation records a README statement that the freeze was lifted on 2026-10-29 and implementation authorized, then records the project owner's later instruction to preserve DFR-001–DFR-006 and not infer implementation permission before explicit ERD approval. The Owner Decision Register also warns of conflicting DFR-006 statements.

The exact conceptual ERD revision was approved on 2026-10-31 for progression to physical-design work only. The formal ERD approval explicitly excludes Prisma changes, migrations, database objects and application implementation.

**Reconciliation:** do not interpret the README lift statement as current implementation authorization. Preserve DFR-001–DFR-006 and the later explicit implementation boundary. The status of any historical DFR-006 lift must be resolved through a dated, explicit owner governance record that identifies the superseded statement and exact scope. Until then, physical design remains a working proposal and implementation remains NOT AUTHORIZED.

## 5. Cross-document completeness and traceability findings

### 5.1 Canonical DDD register is missing

`docs/decisions/DECISION-REGISTER.md` is an architecture decision register for DFR-001–DFR-006. It is not a DDD register. The Owner Decision Register summarizes DDD-002–DDD-015, but it omits DDD-001 from its approved baseline table. The dedicated DDD-005 follow-up file is the only explicit DDD follow-up approval record found in the reviewed decisions directory.

**Action:** establish one canonical `docs/decisions/DDD-DECISION-REGISTER.md` with one row per DDD-001 through DDD-015 and links to all detailed approval records. Keep DFR decisions in their existing register; do not merge DFR and DDD numbering.

### 5.2 Approval metadata is uneven

The DDD-005 follow-up record identifies status, approval date, approver, exact approved groups and implementation exclusions. Comparable approval metadata is not consistently available for all DDD decisions in the reviewed decision files.

**Action:** for every DDD, record exact approved text, status, approver/authority, date, evidence source, scope, supersession/change history and implementation boundary. Where the source evidence is not available, mark EVIDENCE GAP rather than assuming approval from a summary sentence.

### 5.3 Requirement crosswalk has a reporting gap

The current testable requirements source contains 97 IDs in the groups ID, MEM, ORG, DEPT, APP, AUTHZ, EVT, ATT, FIN, CRED, AUD, RET, NOTIF and SEC. It does not contain a dedicated REPORT group. ODR-013, the conceptual model and physical design include report definitions, report runs, classification and export audit.

**Action:** create explicit testable report requirements and update the crosswalk, or formally map report controls to existing IDs with a documented rationale. Do not silently change the 97 count or invent IDs without updating both source documents.

### 5.4 Preliminary requirement ranges are inconsistent

The traceability document identifies discrepancies between preliminary ranges in the requirements consolidation and the IDs actually present in the testable requirements file. The current crosswalk correctly says its 97-ID total is based on the IDs actually present.

**Action:** reconcile the preliminary range table in the requirements consolidation against the detailed requirements file and crosswalk. The detailed testable requirements file is the current count source.

### 5.5 DDD-013 follow-up approval evidence

The project history contains further DDD-013 technical decisions, including the BIGINT fencing/version counter and AUTH-IDEM follow-up decisions. The reviewed branch's canonical DDD record set does not contain a dedicated, consolidated approval record for the exact wording, dates, approver and scope of those follow-ups.

**Action:** recover the exact approved decision text and approval metadata from the originating project discussion/decision artifact, then add it as a linked DDD-013 follow-up record. Do not reconstruct missing technical values from memory or treat a mention in the physical design as approval evidence.

## 6. What is approved, what remains open, and what must not be reopened

### Preserve as approved

- DFR-001 through DFR-006, subject to the documented DFR-006 governance discrepancy. Do not silently lift or rewrite the freeze.
- The conceptual ERD approval for exact revision `25f2813e0256d9472daded45657dfb7ac9f70a43`.
- Individual member account/login rule, one-to-one account/member relationship, and prohibition on shared or guardian-operated accounts.
- The approved core principles summarized for DDD-002 through DDD-015.
- DDD-005 follow-up explicit-deny and role-conflict approval dated 2026-10-31, without modification.
- The current approved DDD-013 platform principle: sensitive mutations are idempotent, bound to actor/operation/scope, safely replay the same request, reject changed payload reuse and recheck authorization.

### Keep open until competent authority confirms

- ODR-001 through ODR-013, as detailed in the Owner Decision Register.
- ODR-ENV-001 through ODR-ENV-007.
- Acting appointment availability, limits and overlap exceptions.
- Department eligibility, annual review/renewal, appeal and church-transfer effects.
- Transfer cancellation/rejection/appeal/backdating and pending-request rules.
- Finance thresholds, partial/returned payments, budgets, account multiplicity and FX treatment.
- Attendance registration prerequisite, status catalogue, QR expiry, self-check-in and offline sync.
- Local event approval and registration/capacity exceptions.
- Credential standards, issuer evidence, validity, disclosure and evidence retention.
- Named audit/investigation authority and approved retention schedules.
- Notification channels/providers, operational retry values and reporting catalogue/classification/export policy.

### Do not reopen without a formal change request

- Individual account rule.
- DDD-005 explicit-deny precedence, scope, administration controls, role-pair classifications and independent-review requirement.
- Any other specifically approved DFR/DDD rule. A reconciliation exercise is not a reason to ask the owner to approve the same rule again.

## 7. Recommended corrective actions

| Order | Action | Owner | Completion evidence |
|---|---|---|---|
| 1 | Create the canonical DDD-001–DDD-015 decision register, preserving existing source records | DYMS Engineering | One register with exact IDs, status, approver/date, source and linked follow-ups |
| 2 | Correct DDD-003 transfer wording so unconfirmed detail is not presented as approved | DYMS Engineering + district/church membership authority | Requirements and lifecycle wording consistent with signed/recorded authority decision |
| 3 | Correct DDD-004 acting appointment wording and keep the capability disabled pending approval | DYMS Engineering + appointing authority | Requirements, lifecycle catalogue and ODR-003 aligned |
| 4 | Correct DDD-006 annual renewal/appeal/transfer wording to policy-dependent until confirmed | DYMS Engineering + departmental/district authority | Requirements, lifecycle catalogue and ODR-007 aligned |
| 5 | Reconcile DFR-006 freeze/lift history through a dated owner governance record | Project owner | Explicit current status, historical treatment and exact authorization scope |
| 6 | Recover and record DDD-013 follow-up approvals | DYMS Engineering + project owner | Exact AUTH-IDEM/fencing decision text, date, approver and traceability |
| 7 | Add REPORT requirements or an explicit existing-ID mapping | DYMS Product/Engineering + reporting/security authority | Testable requirements and traceability crosswalk updated together |
| 8 | Reconcile preliminary requirement ranges against the 97 actual IDs | DYMS Engineering | Parent consolidation, testable requirements and crosswalk agree |
| 9 | Obtain competent authority responses for ODR-001–ODR-013 and ODR-ENV-001–007 | Project owner and delegated authorities | Each decision has a completed decision record and evidence |
| 10 | Run an independent consistency review after corrections | Independent reviewer | Findings closed or explicitly retained with reason and owner |

## 8. Decision recording standard for the canonical DDD register

Every DDD record must contain:

- Decision ID and concise title.
- Decision domain and scope.
- Status: APPROVED, APPROVED PRINCIPLE / OPEN DETAIL, PROPOSED, REJECTED, SUPERSEDED, or EVIDENCE GAP.
- Exact decision statement, with approved and unapproved clauses separated.
- Decision authority, approver and approval date.
- Source document, policy title, version and effective date where applicable.
- Related DFR, DDD, ODR and requirement IDs.
- Affected bounded contexts, entities, lifecycle rows, physical tables, constraints and tests.
- Explicit unresolved questions and responsible authority.
- Change history and superseded decision reference.
- Implementation authorization: NOT AUTHORIZED unless separately and explicitly granted.

A decision may have an approved principle and unresolved implementation detail. Record those separately rather than assigning one misleading status to the entire domain.

## 9. Approval and implementation boundary

This reconciliation report is not a request to reapprove already approved DFR/DDD rules. It is a record of evidence, inconsistencies and corrective work.

The conceptual ERD remains approved at the exact recorded revision. The physical database design remains a working proposal. No Prisma schema, generated client, SQL DDL, migration, database object, seed, API or application implementation is authorized by this report.

**Current implementation status: NOT AUTHORIZED.**

---

**Prepared by:** DYMS Engineering  
**For review by:** Project owner and competent delegated authorities  
**Related package:** [Phase 2 Owner Decision Package](./PHASE-2-OWNER-DECISION-PACKAGE.md)  
**Canonical open-decision register:** [Phase 2 Owner Decision Register](./PHASE-2-OWNER-DECISION-REGISTER.md)
